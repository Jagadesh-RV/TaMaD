import { initializeApp } from 'firebase/app';
import {
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
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const requireFirebaseConfig = () => {
  if (missingFirebaseConfig) throw new Error('Firebase authentication is not configured');
};

const setSessionPersistence = (rememberMe: boolean) => setPersistence(
  auth,
  rememberMe ? browserLocalPersistence : browserSessionPersistence,
);

export const signInWithGoogle = async (rememberMe: boolean) => {
  requireFirebaseConfig();
  await setSessionPersistence(rememberMe);
  return signInWithPopup(auth, new GoogleAuthProvider());
};

export const signInWithEmail = async (email: string, password: string, rememberMe: boolean) => {
  requireFirebaseConfig();
  await setSessionPersistence(rememberMe);
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (name: string, email: string, password: string) => {
  requireFirebaseConfig();
  await setSessionPersistence(false);
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await credential.user.updateProfile({ displayName: name });
  await sendEmailVerification(credential.user);
  return credential;
};

export const sendResetEmail = async (email: string) => {
  requireFirebaseConfig();
  await sendPasswordResetEmail(auth, email);
};

export const resetFirebasePassword = async (code: string, password: string) => {
  requireFirebaseConfig();
  await confirmPasswordReset(auth, code, password);
};

export const resendVerificationEmail = async () => {
  requireFirebaseConfig();
  if (!auth.currentUser) throw new Error('Please sign in again to verify your email');
  await sendEmailVerification(auth.currentUser);
};

export const createPhoneRecaptcha = (container: HTMLElement) => {
  requireFirebaseConfig();
  return new RecaptchaVerifier(auth, container, { size: 'normal' });
};

export { signInWithPhoneNumber, signOut };
