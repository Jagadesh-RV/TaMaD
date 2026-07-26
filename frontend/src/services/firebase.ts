import { initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  updateProfile,
  confirmPasswordReset,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingFirebaseConfig = Object.values(firebaseConfig).some((value) => !value);
export const auth: Auth | null = missingFirebaseConfig ? null : getAuth(initializeApp(firebaseConfig));

export const getClientAuth = () => {
  if (!auth) throw new Error('Firebase Web configuration is missing. Add the VITE_FIREBASE_* environment variables.');
  return auth;
};

const setSessionPersistence = (rememberMe: boolean) => setPersistence(
  getClientAuth(),
  rememberMe ? browserLocalPersistence : browserSessionPersistence,
);

export const signInWithGoogle = async (rememberMe: boolean) => {
  await setSessionPersistence(rememberMe);
  return signInWithPopup(getClientAuth(), new GoogleAuthProvider());
};

export const signInWithEmail = async (email: string, password: string, rememberMe: boolean) => {
  await setSessionPersistence(rememberMe);
  return signInWithEmailAndPassword(getClientAuth(), email, password);
};

export const registerWithEmail = async (name: string, email: string, password: string) => {
  const firebaseAuth = getClientAuth();
  await setSessionPersistence(false);
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await sendEmailVerification(credential.user);
  return credential;
};

export const sendResetEmail = (email: string) => sendPasswordResetEmail(getClientAuth(), email);
export const resetFirebasePassword = (code: string, password: string) => confirmPasswordReset(getClientAuth(), code, password);

export const resendVerificationEmail = async () => {
  const firebaseAuth = getClientAuth();
  if (!firebaseAuth.currentUser) throw new Error('Please sign in again to verify your email');
  await sendEmailVerification(firebaseAuth.currentUser);
};

export const createPhoneRecaptcha = (container: HTMLElement) => new RecaptchaVerifier(getClientAuth(), container, { size: 'normal' });
export const startPhoneSignIn = (phoneNumber: string, verifier: RecaptchaVerifier) => signInWithPhoneNumber(getClientAuth(), phoneNumber, verifier);
export const signOutFromFirebase = () => signOut(getClientAuth());
