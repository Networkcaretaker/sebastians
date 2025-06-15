// src/config/firebase.ts
import { initializeFirebaseApp } from '@sebastians/firebase-config';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Declare global variables defined by Vite
declare const __VITE_FIREBASE_API_KEY__: string;
declare const __VITE_FIREBASE_AUTH_DOMAIN__: string;
declare const __VITE_FIREBASE_PROJECT_ID__: string;
declare const __VITE_FIREBASE_STORAGE_BUCKET__: string;
declare const __VITE_FIREBASE_MESSAGING_SENDER_ID__: string;
declare const __VITE_FIREBASE_APP_ID__: string;

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Firebase config using Vite-defined variables
const firebaseConfig: FirebaseConfig = {
  apiKey: __VITE_FIREBASE_API_KEY__,
  authDomain: __VITE_FIREBASE_AUTH_DOMAIN__,
  projectId: __VITE_FIREBASE_PROJECT_ID__,
  storageBucket: __VITE_FIREBASE_STORAGE_BUCKET__,
  messagingSenderId: __VITE_FIREBASE_MESSAGING_SENDER_ID__,
  appId: __VITE_FIREBASE_APP_ID__
};

console.log('🔧 Admin Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  // Don't log sensitive keys, just confirm they exist
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

// Initialize Firebase
const app = initializeFirebaseApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('✅ Firebase initialized for admin app');

export default app;