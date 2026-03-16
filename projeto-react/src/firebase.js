import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  // Cole seus dados aqui
  apiKey: "AIzaSyCcrn8TaTaWTVshZXCZG56ltuklPs9xLpU",
  authDomain: "projeto-react-b41a0.firebaseapp.com",
  databaseURL: "https://projeto-react-b41a0-default-rtdb.firebaseio.com",
  projectId: "projeto-react-b41a0",
  storageBucket: "projeto-react-b41a0.firebasestorage.app",
  messagingSenderId: "968263915631",
  appId: "1:968263915631:web:ed925305ad4559c270959a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);