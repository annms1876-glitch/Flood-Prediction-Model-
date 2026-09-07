"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  auth,
  db,
  googleProvider,
  githubProvider,
  UserProfileData,
  getUserProfile,
  saveUserProfile,
  handleFirestoreError,
  OperationType,
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    initialData: {
      name: string;
      location: string;
      age?: number;
      gender?: UserProfileData["gender"];
      role?: UserProfileData["role"];
    }
  ) => Promise<void>;
  updateProfileData: (data: Partial<UserProfileData>) => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        // Listen to live user profile changes with mandated error handling
        unsubscribeProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfileData);
            } else {
              // Create default profile for first-time login
              const defaultProfile: UserProfileData = {
                id: currentUser.uid,
                email: currentUser.email || "",
                name: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
                location: "Regional Station",
                gender: "prefer_not_to_say",
                role: "resident",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              saveUserProfile(defaultProfile).catch((err) => {
                console.warn("Could not save initial profile automatically:", err);
              });
              setProfile(defaultProfile);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Firestore user profile subscription error:", error);
            setLoading(false);
          }
        );
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("OAuth sign in error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Email sign in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    initialData: {
      name: string;
      location: string;
      age?: number;
      gender?: UserProfileData["gender"];
      role?: UserProfileData["role"];
    }
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfileData = {
        id: res.user.uid,
        email: email,
        name: initialData.name || "Community Member",
        location: initialData.location || "Regional Station",
        age: initialData.age,
        gender: initialData.gender || "prefer_not_to_say",
        role: initialData.role || "resident",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveUserProfile(newProfile);
      setProfile(newProfile);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Email registration error:", error);
      throw error;
    }
  };

  const updateProfileData = async (data: Partial<UserProfileData>) => {
    if (!user) throw new Error("Must be logged in to update profile");
    const current = profile || {
      id: user.uid,
      email: user.email || "",
      name: user.displayName || "User",
      location: "Regional Station",
    };
    const updated: UserProfileData = {
      ...current,
      ...data,
      id: user.uid,
      email: user.email || current.email,
      updatedAt: new Date().toISOString(),
    };
    await saveUserProfile(updated);
    setProfile(updated);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        updateProfileData,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
