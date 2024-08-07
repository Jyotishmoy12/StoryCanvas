
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
  apiKey: "AIzaSyCgwGSxJ_7jm3VO4p2cubG9mBtGcnm2Uyo",
  authDomain: "storycanvas-af6c7.firebaseapp.com",
  projectId: "storycanvas-af6c7",
  storageBucket: "storycanvas-af6c7.appspot.com",
  messagingSenderId: "810382228314",
  appId: "1:810382228314:web:5f53b583e310a803a91163",
  measurementId: "G-244CRYHXD9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
export const auth=getAuth(app);
export { db, storage };