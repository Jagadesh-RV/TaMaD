import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const getFirebaseAuth = () => {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? applicationDefault()
    : privateKey && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL
      ? cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        })
      : null;

  if (!credential) throw new Error('Firebase Admin credentials are not configured');

  const firebaseApp = getApps()[0] || initializeApp({ credential });

  return getAuth(firebaseApp);
};
