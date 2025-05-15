import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBO84psAESvunMUi8yQqyrjFNx3jCB35IA",
    authDomain: "time-89344.firebaseapp.com",
    projectId: "time-89344",
    storageBucket: "time-89344.firebasestorage.app",
    messagingSenderId: "569662029549",
    appId: "1:569662029549:web:9d95f2ffb0aebea87016e4",
    measurementId: "G-589FNWG7FN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const loginBtn = document.getElementById("googleLoginBtn");
const syncBtn = document.getElementById("syncBtn");
const userInfoDiv = document.getElementById("userInfo");
const historyList = document.getElementById("historyList");

// Login with Google
loginBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userData = {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            loginTime: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        // Update UI
        showUser(userData);

        // Add to local history
        const history = JSON.parse(localStorage.getItem("history")) || [];
        history.push(userData);
        localStorage.setItem("history", JSON.stringify(history));

        updateHistoryUI();

    } catch (error) {
        console.error("Login Error:", error.message);
    }
});

// Sync local history to Firestore
syncBtn.addEventListener("click", async () => {
    const history = JSON.parse(localStorage.getItem("history")) || [];

    try {
        for (const record of history) {
            await addDoc(collection(db, "login_history"), record);
        }
        alert("Synced to Firebase successfully!");
    } catch (error) {
        console.error("Sync error:", error);
    }
});

// Show user info
function showUser(user) {
    userInfoDiv.innerHTML = `
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <img src="${user.photoURL}" width="100" alt="Profile Picture"/>
    <p><strong>Last Login:</strong> ${new Date(user.loginTime).toLocaleString()}</p>
  `;
}

// Show history
function updateHistoryUI() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    historyList.innerHTML = "";
    history.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.name} - ${new Date(entry.loginTime).toLocaleString()}`;
        historyList.appendChild(li);
    });
}

// On page load
window.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) showUser(user);
    updateHistoryUI();
});
