// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, query, where, orderBy, limit, getDocs, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// Import Firebase config
import { firebaseConfig } from './firebase-config.js';

console.log("🔄 Initializing Firebase...");

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

    provider.setCustomParameters({
        prompt: 'select_account'
    });

} catch (error) {
    console.error("❌ Firebase initialization error:", error);
    alert("Firebase initialization failed. Please check the console for details.");
}

export { app, auth, db, provider, serverTimestamp };

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
