import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBedqeEptCe_ngPIgD_MQpzTjoYU6WQq3w",
    authDomain: "eventide-backend.firebaseapp.com",
    projectId: "eventide-backend",
    storageBucket: "eventide-backend.firebasestorage.app",
    messagingSenderId: "306224016204",
    appId: "1:306224016204:web:2644acab2d8f3456c8fde9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
import { getAuth, GoogleAuthProvider } from "firebase/auth";
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
