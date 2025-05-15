// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, query, where, orderBy, limit, getDocs, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "your-actual-api-key-here",
    authDomain: "your-actual-api-key-here",
    projectId: "your-actual-api-key-here",
    storageBucket: "your-actual-api-key-here",
    messagingSenderId: "your-actual-api-key-here",
    appId: "your-actual-api-key-here",
    measurementId: "G-your-actual-api-key-here"
};

console.log("🔄 Initializing Firebase...");

// Initialize Firebase
let app;
let auth;
let db;
let provider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
    
    console.log("✅ Firebase initialized successfully!");
    console.log("🔍 Checking Firebase:", app);
    
    if (!app) {
        console.error("❌ Firebase is not initialized!");
        throw new Error("Firebase initialization failed");
    }
    
    // Configure Google Auth Provider
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
    alert("Firebase initialization failed. Please check the console for details.");
}

// Export Firebase instances
export { app, auth, db, provider, serverTimestamp };

// Export Firebase functions for use in other modules
export {
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut,
    collection,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    deleteDoc
};