import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyClF7LVO875rzeizcYri2bIVt5qVErA8-c",
  authDomain: "roadguard-512703.firebaseapp.com",
  projectId: "roadguard-512703",
  storageBucket: "roadguard-512703.firebasestorage.app",
  messagingSenderId: "983953515631",
  appId: "1:983953515631:web:0f70477a593c46cfb0999a",
  measurementId: "G-F62XJ7ZDZ7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    throw error;
  }
}

export async function logoutFirebase() {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };
