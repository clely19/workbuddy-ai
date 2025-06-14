// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFDvRjJcCIbrFb-74IB9nbB0imGb5ud70",
  authDomain: "workbuddy-ai.firebaseapp.com",
  projectId: "workbuddy-ai",
  storageBucket: "workbuddy-ai.firebasestorage.app",
  messagingSenderId: "1080780445399",
  appId: "1:1080780445399:web:3eef22c5cfb53db8fc4292",
  measurementId: "G-CTW7ZF4FFF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

