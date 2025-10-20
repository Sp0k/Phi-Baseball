import { auth } from "@/firebase";
import { 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";

export function onAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function hostSignIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function hostSignOut() {
  await signOut(auth);
}

export async function hostResetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}
