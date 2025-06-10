// packages/firebase-config/src/auth.ts
import { getAuth } from 'firebase/auth';
import { getFirebaseApp } from './config';

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}