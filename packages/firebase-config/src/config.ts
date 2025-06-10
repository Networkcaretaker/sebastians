// packages/firebase-config/src/config.ts
import { initializeApp, FirebaseApp } from 'firebase/app';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp | null = null;

export function initializeFirebaseApp(config: FirebaseConfig): FirebaseApp {
  if (!app) {
    app = initializeApp(config);
  }
  return app;
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error('Firebase app not initialized. Call initializeFirebaseApp first.');
  }
  return app;
}

export default { initializeFirebaseApp, getFirebaseApp };