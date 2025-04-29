//@ts-ignore
import { getReactNativePersistence } from "@firebase/auth/dist/rn/index.js";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnSNmNPoTUkW9i1Ut2qdiYssPICKaI6kA",
  authDomain: "pos-mawar-indah-123.firebaseapp.com",
  projectId: "pos-mawar-indah-123",
  storageBucket: "pos-mawar-indah-123.firebasestorage.app",
  messagingSenderId: "345379184996",
  appId: "1:345379184996:web:fcd301f4109fbcf0db1a71"
};

const app = initializeApp(firebaseConfig);

// Gunakan initializeAuth dengan persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
