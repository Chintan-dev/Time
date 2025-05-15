// Import required Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut 
} from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { 
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';

// Your Firebase configuration
export const firebaseConfig = {
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

// Export Firebase functionality
export {
    serverTimestamp,
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
  
