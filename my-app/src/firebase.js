// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfiguracja Twojej aplikacji Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAdS80U4FpnnSFk74w06s5sTJ6C6-AkXhI",
  authDomain: "apka-webowa.firebaseapp.com",
  projectId: "apka-webowa",
  storageBucket: "apka-webowa.firebasestorage.app",
  messagingSenderId: "776022736735",
  appId: "1:776022736735:web:c8e7dadf66ea086eba00ea",
  measurementId: "G-P5G6ZD43E2"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
