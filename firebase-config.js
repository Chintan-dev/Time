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
    apiKey: "__API_KEY__",
    authDomain: "__AUTH_DOMAIN__",
    projectId: "__PROJECT_ID__",
    storageBucket: "__STORAGE_BUCKET__",
    messagingSenderId: "__MESSAGING_SENDER_ID__",
    appId: "__APP_ID__",
    measurementId: "__MEASUREMENT_ID__"
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
  