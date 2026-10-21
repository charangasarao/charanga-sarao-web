import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3mcxg6HXTC4gz8HJGRsNjOLp7CK7TXVs",
  authDomain: "charanga-sarao.firebaseapp.com",
  projectId: "charanga-sarao",
  storageBucket: "charanga-sarao.firebasestorage.app",
  messagingSenderId: "285421321243",
  appId: "1:285421321243:web:374442f27dc2fe64d5ccbe"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
