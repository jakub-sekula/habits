'use client'
import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  Auth
} from "firebase/auth";

import auth from "@/lib/auth";

export interface AuthContextType {
  currentUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
  logout: () => void;
  loginWithGoogle: () => void;
  auth: Auth
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType | null {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<null | FirebaseUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  function register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  function logout() {
    return auth.signOut();
  }

  function loginWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider())
  }

  const value: AuthContextType = {
    currentUser,
    login,
    register,
    logout,
    loginWithGoogle,
    auth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
