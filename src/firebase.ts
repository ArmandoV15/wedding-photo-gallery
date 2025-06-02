// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwks-8kJDhxyVz86lEDPEUolSLWJ7OScI",
  authDomain: "wedding-photo-app-f2500.firebaseapp.com",
  projectId: "wedding-photo-app-f2500",
  storageBucket: "wedding-photo-app-f2500.firebasestorage.app",
  messagingSenderId: "606758589532",
  appId: "1:606758589532:web:1b92b511bc6230913f4299",
  measurementId: "G-36XLBMPQBM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
