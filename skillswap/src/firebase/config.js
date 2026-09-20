import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBA2CTto3SP3o8XJPTf7qKJULrjJtytJI8",
  authDomain: "skillswap-82e6c.firebaseapp.com",
  projectId: "skillswap-82e6c",
  storageBucket: "skillswap-82e6c.firebasestorage.app",
  messagingSenderId: "1098690617975",
  appId: "1:1098690617975:web:eff01193ee74d30f5d5c72",
  measurementId: "G-DVJ17QX09B"
};
 

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
