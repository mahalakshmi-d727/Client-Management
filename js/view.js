import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get("id");
let editingSheetId = null;


// ================= EXCEL ENGINE =================
function evaluateFormula(value, sheet, visited = new Set()) {
    if (!value) return 0;

    value = value.toString().trim();

    if (!value.startsWith("=")) {
        return Number(value) || 0;
    }

    // prevent infinite loop
    if (visited.has(value)) return 0;
    visited.add(value);

    let exp = value.substring(1);

    // replace A1, B2 etc
    exp = exp.replace(/[A-Z]+[0-9]+/g, (match) => {
        let colLetter = match.match(/[A-Z]+/)[0];
        let rowNumber = parseInt(match.match(/[0-9]+/)[0]) - 1;

        let colIndex = colLetter.charCodeAt(0) - 65;
        let colName = sheet.columns[colIndex];

        if (!sheet.data[rowNumber]) return 0;

        let cellValue = sheet.data[rowNumber][colName];

        return evaluateFormula(cellValue, sheet, visited);
    });

    try {
        return Function('"use strict"; return (' + exp + ')')();
    } catch {
        return 0;
    }
}
//editsheet
window.editSheet = async (id) => {

  const ref = doc(db, "clients", clientId, "sheets", id);
  const snap = await getDoc(ref);

  const sheet = snap.data();

  editingSheetId = id;

  document.getElementById("Day").value = sheet.name;
  document.getElementById("sheetDate").value = sheet.sheetDate;
  document.getElementById("columns").value =
    sheet.columns.join(",");

  document.getElementById("rows").value =
    sheet.data.length;

  document.getElementById("cols").value =
    sheet.columns.length;

  openSheetPopup();
};
// ================= LOAD CLIENT =================
async function loadClient() {
  const docRef = doc(db, "clients", clientId);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();

  document.getElementById("name").innerText = data.name;
  document.getElementById("dob").innerText = data.dob;
  document.getElementById("age").innerText = data.age;
  document.getElementById("address").innerText = data.address;
  document.getElementById("pincode").innerText = data.pincode;
  document.getElementById("gender").innerText = data.gender;
  document.getElementById("phone").innerText = data.phone;

//image
  document.getElementById("profileImg").src = "../image/pic.jpg";
}


// ================= POPUP =================
window.openSheetPopup = () => {
  document.getElementById("sheetPopup").style.display = "flex";
};

window.closeSheetPopup = () => {
  document.getElementById("sheetPopup").style.display = "none";
};

//add
window.addSheet = () => {
    editingSheetId = null;

    document.getElementById("Day").value = "";
    document.getElementById("sheetDate").value = "";
    document.getElementById("columns").value = "";
    document.getElementById("rows").value = "";
    document.getElementById("cols").value = "";

    openSheetPopup();
};
// ================= CREATE SHEET =================
window.createSheet = async () => {
  const name = document.getElementById("Day").value;
  const sheetDate = document.getElementById("sheetDate").value;
  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);
  if (!name || !rows || !cols) {
    alert("Please fill all fields");
    return;
  }

  let columnsInput = document.getElementById("columns").value;
  let columns = columnsInput
    ? columnsInput.split(",").map(c => c.trim())
    : [];

  // fallback column names
  if (columns.length === 0) {
    for (let i = 0; i < cols; i++) {
      columns.push("Column " + (i + 1));
    }
  }

  // create empty table
  let data = [];

  for (let i = 0; i < rows; i++) {
    let row = {};

    columns.forEach(col => {
        row[col] = ""; // object instead of array
    });

    data.push(row);
  }

  if (editingSheetId) {

  await updateDoc(
    doc(db, "clients", clientId, "sheets", editingSheetId),
    {
      name,
      sheetDate,
      columns,
      data
    }
  );

  editingSheetId = null;

} else {

  await addDoc(collection(db, "clients", clientId, "sheets"), {
    name,
    sheetDate,
    columns,
    data,
    createdAt: new Date()
  });

}

  closeSheetPopup();
  loadSheets();
};



// ================= LOAD SHEETS =================
async function loadSheets() {
  const snapshot = await getDocs(collection(db, "clients", clientId, "sheets"));
  const container = document.getElementById("sheets");

  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const sheet = docSnap.data();
    const id = docSnap.id;

    let html = "";

    // DATE
    html += `
    <div style="
        width:250px;
        margin:15px auto;
        padding:10px;
       
        border-radius:6px;
        background:white;
        text-align:center;
        font-weight:bold;
        font-size:18px;
    ">
        ${sheet.sheetDate || "No Date"}
    </div>
    `;

    // TABLE START
    html += `<table border="1">`;

    // HEADERS
    html += "<tr>";
    sheet.columns.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += `<th>Total</th>`;
    html += "</tr>";

    // ROWS (🔥 IMPORTANT LOOP BACK)
    sheet.data.forEach((row, rIndex) => {
      html += "<tr>";

      let rowTotal = 0;

      sheet.columns.forEach(col => {
        let val = parseValue(row[col]);
        if (!isNaN(val) && val > 0) {
            rowTotal += val;
        }

        html += `
          <td contenteditable="true"
            onblur="updateCell('${id}', ${rIndex}, '${col}', this.innerText)">
            ${row[col] || ""}
          </td>
        `;
      });

      // TOTAL COLUMN
      html += `<td style="background:#eee;">${rowTotal}</td>`;

      html += "</tr>";
    });

    html += "</table>";

    // SHEET TOTAL
    let total = 0;

    sheet.data.forEach(row => {
      let rowTotal = 0;

      sheet.columns.forEach(col => {
        let val = parseValue(row[col]);
        if (!isNaN(val) && val>0) {rowTotal += val;}
      });

      total += rowTotal;
    });


    html += "</table>";
    html += `
    <div style="
        width:250px;
        margin:10px 0 10px auto;
        padding:10px;
        
        border-radius:6px;
        background:white;
        text-align:center;
        font-weight:bold;
        font-size:18px;
    ">
        Grand Total = ₹ ${total}
    </div>
    `;

    // DELETE BUTTON
    html += `
      <div style="margin-bottom:30px; padding:10px">
        <button onclick="editSheet('${id}')">Edit</button>
        <button onclick="deleteSheet('${id}')"style="margin-left:15px;">Delete</button>
      </div>
    `;

    container.innerHTML += html;
  });

  calculatePayments();
}
// ================= UPDATE CELL =================
window.updateCell = async (sheetId, rowIndex, colName, value) => {
  const ref = doc(db, "clients", clientId, "sheets", sheetId);
  const snap = await getDoc(ref);
  const sheet = snap.data();

  sheet.data[rowIndex][colName] = value;

  await updateDoc(ref, {
    data: sheet.data
  });
  loadSheets();
  calculatePayments();

};


// ================= DELETE SHEET =================
window.deleteSheet = async (id) => {
  if (confirm("Delete this sheet?")) {
    await deleteDoc(doc(db, "clients", clientId, "sheets", id));
    loadSheets();
  }
};


// ================= TOTAL PAYMENT =================

async function calculatePayments() {
    const snapshot = await getDocs(
        collection(db, "clients", clientId, "sheets")
    );

    let paid = 0;
    let pending = 0;
    let grandTotal = 0;

    snapshot.forEach(docSnap => {
        const sheet = docSnap.data();

        sheet.data.forEach(row => {
            let rowTotal = 0;

            sheet.columns.forEach(col => {
                let val = parseValue(row[col]);

                if (!isNaN(val)) {

                    // ✅ ONLY positive goes to paid + totals
                    if (val > 0) {
                        paid += val;
                        rowTotal += val;
                    }

                    // ✅ ONLY negative goes to pending
                    if (val < 0) {
                        pending += Math.abs(val);
                    }
                }
            });

            // ✅ add only positive row total
            grandTotal += rowTotal;
        });
    });

    // ✅ update UI
    document.getElementById("paid").innerText = paid;
    document.getElementById("pending").innerText = pending;
    
}
// ================= PARSE VALUE (NEW) =================
function parseValue(input) {
    if (!input) return 0;

    input = input.toString().trim();

    // Formula support
    if (input.startsWith("=")) {
        let exp = input.substring(1);

        try {
            // SUM support
            if (exp.startsWith("SUM(")) {
                let nums = exp
                    .replace("SUM(", "")
                    .replace(")", "")
                    .split(",")
                    .map(n => Number(n.trim()));

                return nums.reduce((a, b) => a + b, 0);
            }

            // Basic math
            return Function('"use strict"; return (' + exp + ')')();

        } catch (e) {
            return 0;
        }
    }

    // Normal number
    return Number(input);
}


// ================= INIT =================
loadClient();
loadSheets();