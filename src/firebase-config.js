import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1bvNBzPZv6CrNWIM7EhXTILKfYyTeiIo",
  authDomain: "studybuddies-9eb35.firebaseapp.com",
  projectId: "studybuddies-9eb35",
  storageBucket: "studybuddies-9eb35.appspot.com",
  messagingSenderId: "531355939866",
  appId: "1:531355939866:web:ec83410342d74ea195cda3",
  measurementId: "G-9BVNZPRE7Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { storage };
export { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp };