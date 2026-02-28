import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDQKc9oEEr4rgTfFUvtJ4YBjsfSEnSAr4k",
  authDomain: "makaziyangu-2ee6d.firebaseapp.com",
  projectId: "makaziyangu-2ee6d",
  storageBucket: "makaziyangu-2ee6d.firebasestorage.app",
  messagingSenderId: "141259573934",
  appId: "1:141259573934:android:7009ba68a0d60c5441fb3f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;