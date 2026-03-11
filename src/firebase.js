// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  // PASTE KONFIGURASI DARI FIREBASE CONSOLE MILIKMU DI SINI
  apiKey: "AIzaSyArNWeCYzUh2ZccfY54BiFo8oBfCti2Pf0",
  authDomain: "riff-mini-games.firebaseapp.com",
  projectId: "riff-mini-games",
  storageBucket: "riff-mini-games.firebasestorage.app",
  messagingSenderId: "987868536221",
  appId: "1:987868536221:web:5d3abd4f9c2df5f1506374",
  databaseURL: "https://riff-mini-games-default-rtdb.asia-southeast1.firebasedatabase.app", // Pastikan ada ini
  measurementId: "G-NBZYJ5BFGS"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
