import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let editId = null;
const auth = getAuth();


// 🔐 AUTH PROTECTION (BONUS)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
}); 

// OPEN POPUP
window.openPopup = () => {
  document.getElementById("popup").style.display = "flex";
};

// add new client
window.addNewClient = () => {
  editId = null; // ✅ reset for new client

  // clear form
  document.getElementById("name").value = "";
  document.getElementById("age").value = "";
  document.getElementById("dob").value = "";
  document.getElementById("address").value = "";
  document.getElementById("pincode").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("gender").value = "";

  openPopup();
};

// CLOSE POPUP
window.closePopup = () => {
  document.getElementById("popup").style.display = "none";
};

// SAVE (ADD OR EDIT)
window.saveClient = async () => { 

  console.log("Saving with editId:", editId); // ✅ ADD HERE

  const client = {
    name: document.getElementById("name").value || "",
    age: document.getElementById("age").value || "",
    dob: document.getElementById("dob").value || "",
    address: document.getElementById("address").value || "",
    pincode: document.getElementById("pincode").value || "",
    phone: document.getElementById("phone").value || "",
    gender: document.getElementById("gender").value || ""
  };

  try {
    if (editId) {
      await updateDoc(doc(db, "clients", editId), client);
      alert("Updated ✅");
    } else {
      await addDoc(collection(db, "clients"), client);
      alert("Added ✅");
    }

    closePopup();
    loadClients();

  } catch (err) {
    alert(err.message);
  }
};

// LOAD CLIENTS
async function loadClients() {
  const snapshot = await getDocs(collection(db, "clients"));
  const list = document.getElementById("clientList");
  list.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    list.innerHTML += `
     <div class="card">
        <h3>${data.name}</h3>
        <p>📞 ${data.phone}</p>

        <div class="action-buttons">
            <button onclick="viewClient('${docSnap.id}')">View</button>
            <button onclick="editClient('${docSnap.id}')">Edit</button>
            <button onclick="deleteClient('${docSnap.id}')">Delete</button>
        </div>
    </div>
    `;
  });
}

// DELETE
window.deleteClient = async (id) => {
  if (confirm("Delete this client?")) {
    await deleteDoc(doc(db, "clients", id));
    loadClients();
  }
};

// EDIT
window.editClient = async (id) => {
  editId = id; // ✅ SET FIRST

  const docRef = doc(db, "clients", id);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();

  openPopup(); // ✅ OPEN AFTER setting editId

  // ✅ THEN fill values
  document.getElementById("name").value = data.name || "";
  document.getElementById("age").value = data.age || "";
  document.getElementById("dob").value = data.dob || "";
  document.getElementById("address").value = data.address || "";
  document.getElementById("pincode").value = data.pincode || "";
  document.getElementById("phone").value = data.phone || "";
  document.getElementById("gender").value = data.gender || "";
};

//view
window.viewClient = (id) => {
  window.location.href = `view.html?id=${id}`;
};

// 🔍 SEARCH
window.searchClients = () => {
  const value = document.getElementById("search").value.toLowerCase();
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const name = card.querySelector("h3").innerText.toLowerCase();

    if (name.includes(value)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
};


// 🔐 LOGOUT
window.logout = () => {
  signOut(auth)
    .then(() => {
      alert("Logged out ✅");
      window.location.href = "index.html";
    })
    .catch(err => alert(err.message));
};


// LOAD ON START
loadClients();