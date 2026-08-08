import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// GET ID
const id = new URLSearchParams(window.location.search).get("id");

let hot;

// LOAD CLIENT
async function loadClient() {
  const ref = doc(db, "clients", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Client not found");
    return;
  }

  const data = snap.data();

  // SET DATA
  document.getElementById("clientName").innerText = data.name;
  document.getElementById("dob").innerText = "DOB: " + data.dob;
  document.getElementById("age").innerText = "Age: " + data.age;
  document.getElementById("address").innerText = "Address: " + data.address;
  document.getElementById("pincode").innerText = "Pincode: " + data.pincode;
  document.getElementById("gender").innerText = "Gender: " + data.gender;
  document.getElementById("phone").innerText = "Phone: " + data.phone;

  // PROFILE IMAGE
  const photo = document.getElementById("photo");

  if (data.gender === "male") {
    photo.src = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
  } else if (data.gender === "female") {
    photo.src = "https://cdn-icons-png.flaticon.com/512/4140/4140061.png";
  } else {
    photo.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  }

  loadExcel();
}

// EXCEL TABLE
function loadExcel() {
  const container = document.getElementById("excel");

  hot = new Handsontable(container, {
    data: [
      ["Date", "Amount Paid", "Notes"]
    ],
    colHeaders: ["Date", "Amount Paid", "Notes"],
    columns: [
      { type: "date", dateFormat: "YYYY-MM-DD" },
      { type: "numeric" },
      { type: "text" }
    ],
    rowHeaders: true,
    minRows: 10,
    fixedRowsTop: 1,
    licenseKey: "non-commercial-and-evaluation"
  });

  hot.addHook("afterChange", calculatePayments);
}

// PAYMENT CALCULATION
function calculatePayments() {
  const data = hot.getData();

  let totalPaid = 0;

  for (let i = 1; i < data.length; i++) {
    const amount = parseFloat(data[i][1]);

    if (!isNaN(amount)) {
      totalPaid += amount;
    }
  }

  document.getElementById("paid").innerText = totalPaid;

  // CHANGE THIS if needed
  const totalExpected = 10000;

  const pending = totalExpected - totalPaid;

  document.getElementById("pending").innerText =
    pending > 0 ? pending : 0;
}

// INIT
loadClient();