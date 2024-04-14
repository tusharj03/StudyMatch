import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTrpoy5PHnTyH07fBHQOSJKkeWpm_gWNM",
  authDomain: "studybuddiesuchicago.firebaseapp.com",
  projectId: "studybuddiesuchicago",
  storageBucket: "studybuddiesuchicago.appspot.com",
  messagingSenderId: "442601066114",
  appId: "1:442601066114:web:509a3fb81d3c09a3b66e9b",
  measurementId: "G-3EQZ490F66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { storage };
export { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp };