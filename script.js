import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, onValue, push } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

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
const auth = getAuth(app);
const database = getDatabase(app);

// DOM elements
const loginBtn = document.getElementById("googleLoginBtn");
const syncBtn = document.getElementById("syncBtn");
const userInfoDiv = document.getElementById("userInfo");
const historyList = document.getElementById("historyList");

// Theme handling
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Function to set theme
function setTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // If user is logged in, save theme preference to Firebase
    const user = auth.currentUser;
    if (user) {
        const userThemeRef = ref(database, `users/${user.uid}/theme`);
        set(userThemeRef, theme);
    }
}

// Function to load theme
async function loadTheme() {
    const user = auth.currentUser;
    if (user) {
        // If user is logged in, load theme from Firebase
        const userThemeRef = ref(database, `users/${user.uid}/theme`);
        const snapshot = await get(userThemeRef);
        if (snapshot.exists()) {
            setTheme(snapshot.val());
        } else {
            // If no theme is set in Firebase, use local storage or default
            const savedTheme = localStorage.getItem('theme') || 'light';
            setTheme(savedTheme);
        }
    } else {
        // If not logged in, use local storage or default
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }
}

// Theme toggle click handler
themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

// Auth state change handler
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        loadTheme();
        // Update UI for logged-in state
        document.getElementById('userInfo').innerHTML = `
            <p class="user-name">Welcome, ${user.displayName}</p>
            <p class="user-email">Email: ${user.email}</p>
        `;
    } else {
        // User is signed out
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        // Update UI for logged-out state
        document.getElementById('userInfo').innerHTML = `
            <p class="placeholder">Not logged in</p>
        `;
    }
});

// Login with Google
loginBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login Error:", error.message);
    }
});

// Sync button handler
syncBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            // Add login history entry
            const historyRef = ref(database, `users/${user.uid}/loginHistory`);
            const newHistoryRef = push(historyRef);
            await set(newHistoryRef, {
                timestamp: Date.now(),
                email: user.email
            });
            
            // Update history list
            updateHistoryList();
        } catch (error) {
            console.error('Error syncing data:', error);
        }
    }
});

// Function to update history list
function updateHistoryList() {
    const user = auth.currentUser;
    if (user) {
        const historyRef = ref(database, `users/${user.uid}/loginHistory`);
        onValue(historyRef, (snapshot) => {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = '';
            
            if (snapshot.exists()) {
                const history = snapshot.val();
                Object.entries(history).forEach(([key, value]) => {
                    const li = document.createElement('li');
                    const date = new Date(value.timestamp);
                    li.textContent = `Login at ${date.toLocaleString()}`;
                    historyList.appendChild(li);
                });
            }
        });
    }
}

// On page load
window.addEventListener("DOMContentLoaded", () => {
    loadTheme(); // Load theme on page load
});
