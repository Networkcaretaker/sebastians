// Firebase configuration for menu app
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const DEBUG = process.env.NODE_ENV === 'development';

// Declare global variables defined by Vite
declare const __VITE_FIREBASE_API_KEY__: string;
declare const __VITE_FIREBASE_AUTH_DOMAIN__: string;
declare const __VITE_FIREBASE_PROJECT_ID__: string;
declare const __VITE_FIREBASE_STORAGE_BUCKET__: string;
declare const __VITE_FIREBASE_MESSAGING_SENDER_ID__: string;
declare const __VITE_FIREBASE_APP_ID__: string;

// Firebase config using Vite-defined variables
const firebaseConfig = {
  apiKey: __VITE_FIREBASE_API_KEY__,
  authDomain: __VITE_FIREBASE_AUTH_DOMAIN__,
  projectId: __VITE_FIREBASE_PROJECT_ID__,
  storageBucket: __VITE_FIREBASE_STORAGE_BUCKET__,
  messagingSenderId: __VITE_FIREBASE_MESSAGING_SENDER_ID__,
  appId: __VITE_FIREBASE_APP_ID__
};

if (DEBUG) {
  console.log('🔧 Firebase config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    // Don't log sensitive keys, just confirm they exist
    hasApiKey: !!firebaseConfig.apiKey,
    hasAppId: !!firebaseConfig.appId
  });
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Firestore Analytics
export const analytics = getAnalytics(app); 

console.log('✅ Firebase initialized for menu app');

export default app;