import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  updateProfile,
  confirmPasswordReset,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function validateConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase config: ${missing.join(', ')}. ` +
      'Add VITE_FIREBASE_* environment variables to your .env.local file.'
    );
  }
}

let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;

try {
  validateConfig();
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { app, auth, storage };

// ---- Auth helpers ----

export const getClientAuth = (): Auth => auth;

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) =>
  onAuthStateChanged(auth, callback);

const setSessionPersistence = (rememberMe: boolean) =>
  setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

export const signInWithGoogle = async (rememberMe: boolean) => {
  await setSessionPersistence(rememberMe);
  return signInWithPopup(auth, new GoogleAuthProvider());
};

export const signInWithEmail = async (email: string, password: string, rememberMe: boolean) => {
  await setSessionPersistence(rememberMe);
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (name: string, email: string, password: string) => {
  await setSessionPersistence(false);
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await sendEmailVerification(credential.user);
  return credential;
};

export const sendResetEmail = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const resetFirebasePassword = (code: string, password: string) =>
  confirmPasswordReset(auth, code, password);

export const resendVerificationEmail = async () => {
  if (!auth.currentUser) throw new Error('Please sign in again to verify your email');
  await sendEmailVerification(auth.currentUser);
};

export const createPhoneRecaptcha = (container: HTMLElement) =>
  new RecaptchaVerifier(auth, container, { size: 'normal' });

export const startPhoneSignIn = (phoneNumber: string, verifier: RecaptchaVerifier) =>
  signInWithPhoneNumber(auth, phoneNumber, verifier);

export const signOutFromFirebase = () => signOut(auth);

export const getCurrentFirebaseUser = () => auth.currentUser;

export const refreshFirebaseUser = async () => {
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true);
  }
};
