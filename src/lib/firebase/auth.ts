"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  createElement,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  linkWithPopup,
  unlink,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { user, loading } },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function linkGoogleAccount() {
  if (!auth.currentUser) throw new Error("로그인이 필요합니다.");
  return linkWithPopup(auth.currentUser, googleProvider);
}

export async function unlinkGoogleAccount() {
  if (!auth.currentUser) throw new Error("로그인이 필요합니다.");
  return unlink(auth.currentUser, GoogleAuthProvider.PROVIDER_ID);
}
