'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return new Promise((resolve, reject) => {
    signInAnonymously(authInstance)
      .then(() => resolve())
      .catch((error: FirebaseError) => reject(error));
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
        createUserWithEmailAndPassword(authInstance, email, password)
            .then(() => resolve())
            .catch((error: FirebaseError) => reject(error));
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(authInstance, email, password)
            .then(() => resolve())
            .catch((error: FirebaseError) => reject(error));
    });
}

/** Initiate sign-out (non-blocking). */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return new Promise((resolve, reject) => {
    signOut(authInstance)
      .then(() => resolve())
      .catch((error: FirebaseError) => reject(error));
  });
}
