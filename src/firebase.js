import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyCaobhNgMC0wjxr8nTczl42rwJz1c0K_5o",
    authDomain: "guitartabs-83f0b.firebaseapp.com",
    projectId: "guitartabs-83f0b",
    storageBucket: "guitartabs-83f0b.firebasestorage.app",
    messagingSenderId: "743443028288",
    appId: "1:743443028288:web:a915d5922895af641d82a5",
    measurementId: "G-LZWEPYP5G9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
