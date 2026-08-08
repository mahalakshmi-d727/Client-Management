// Firebase CDN imports (THIS IS REQUIRED)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your config (keep SAME)
const firebaseConfig = {
  apiKey: "AIzaSyCkza_1JgRxccbgybJ7fj79WJ1bQpd0RNc",
  authDomain: "kanakumillai.firebaseapp.com",
  projectId: "kanakumillai",
  storageBucket: "kanakumillai.firebasestorage.app",
  messagingSenderId: "361277672115",
  appId: "1:361277672115:web:eaffbc43f578b273087ec6",
  measurementId: "G-JBM1MF1TR1"
};

// Initialize
const app = initializeApp(firebaseConfig);

// EXPORT these (IMPORTANT)
export const auth = getAuth(app);
export const db = getFirestore(app);