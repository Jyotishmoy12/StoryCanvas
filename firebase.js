// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMQargjWdwkHjNL0suOplRsUXTxKJpmOo",
  authDomain: "storypedia-b5784.firebaseapp.com",
  projectId: "storypedia-b5784",
  storageBucket: "storypedia-b5784.appspot.com",
  messagingSenderId: "51415037276",
  appId: "1:51415037276:web:5530d0548ad33ef988fd99",
  measurementId: "G-7JBH2D67CZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
export const auth=getAuth(app);
export { db, storage };