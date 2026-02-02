import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCf0douD2MwTKDHJvGyNC2k9vqte6ol5YU",
  authDomain: "everestmart-8df14.firebaseapp.com",
  projectId: "everestmart-8df14",
  storageBucket: "everestmart-8df14.firebasestorage.app",
  messagingSenderId: "618346921408",
  appId: "1:618346921408:web:bc5710c01f11c6b2551c25",
  measurementId: "G-SB3B4QK3CM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
