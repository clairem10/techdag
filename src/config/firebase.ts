// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIj2FJS9OXk9yzRMdXkbHMi9EeezqsF94",
  authDomain: "techdag-d6e56.firebaseapp.com",
  projectId: "techdag-d6e56",
  storageBucket: "techdag-d6e56.firebasestorage.app",
  messagingSenderId: "505038815071",
  appId: "1:505038815071:web:247f62a60a2b50dbea80ea",
  measurementId: "G-C6BX9C3QM7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);