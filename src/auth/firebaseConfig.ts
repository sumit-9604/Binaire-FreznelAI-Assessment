import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Firebase Configuration
 * Populated with default project settings or environment variables.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoAssessmentKeyForBinaire123',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'binaire-freznel-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'binaire-freznel-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'binaire-freznel-ai.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

let app: FirebaseApp;
let auth: Auth;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization notice:', error);
  app = initializeApp(firebaseConfig, 'binaire-freznel-fallback');
  auth = getAuth(app);
}

export { app, auth };
