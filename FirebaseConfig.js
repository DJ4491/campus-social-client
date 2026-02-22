// Import the functions you need from the SDKs you need
import { getReactNativePersistence } from "@firebase/auth/dist/rn/index.js";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARwoYGU1NG1kFRYBpoTcxYK3cYPt_EV9s",
  authDomain: "campus-social-c7430.firebaseapp.com",
  projectId: "campus-social-c7430",
  storageBucket: "campus-social-c7430.firebasestorage.app",
  messagingSenderId: "547991371405",
  appId: "1:547991371405:web:f8d654ee7784f4ab8d6cc4",
  measurementId: "G-50ZZQ7CP63",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
