import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApR8ESlpsHl7IzFjmvF2uqZXxddimkhz8",
  authDomain: "mini-shop-tah.firebaseapp.com",
  projectId: "mini-shop-tah",
  storageBucket: "mini-shop-tah.firebasestorage.app",
  messagingSenderId: "492904606460",
  appId: "1:492904606460:web:24bd9783b4edea97e60579",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
