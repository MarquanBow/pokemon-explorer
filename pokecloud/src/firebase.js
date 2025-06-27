// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjqlWvN5HsYIQLq30FOiD5pKPfi4DM5k4",
  authDomain: "pokecloud-41c4a.firebaseapp.com",
  projectId: "pokecloud-41c4a",
  storageBucket: "pokecloud-41c4a.firebasestorage.app",
  messagingSenderId: "770475738805",
  appId: "1:770475738805:web:3e240eb31f1733f0fe60fc",
  measurementId: "G-58TSC5G3VH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);