"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
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
              const data = docSnap.data() as UserProfileData;
              // Enforce primary admin role if the logged in email matches somenbarik75@gmail.com
              if (currentUser.email === "somenbarik75@gmail.com" && data.role !== "emergency_coordinator") {
                data.role = "emergency_coordinator";
              }
              setProfile(data);
            } else {
              // Create default profile for first-time login
              const defaultProfile: UserProfileData = {
                id: currentUser.uid,
                email: currentUser.email || "",
                name: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
                location: "Regional Station",
                gender: "prefer_not_to_say",
                role: currentUser.email === "somenbarik75@gmail.com" ? "emergency_coordinator" : "resident",
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

  useEffect(() => {
    const seedAdminUser = async () => {
      try {
        await createUserWithEmailAndPassword(auth, "somenbarik75@gmail.com", "p@Ssword.19");
        console.log("Primary admin user (somenbarik75@gmail.com) seeded successfully.");
      } catch (err: any) {
        if (err.code !== "auth/email-already-in-use") {
          console.warn("Seeding administrator account warning:", err.message);
        }
      }
    };
    seedAdminUser();
  }, []);

  const signInWithPopupFallback = (providerName: "google" | "github"): Promise<void> => {
    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const popup = window.open(
        `/auth-popup?provider=${providerName}`,
        "firebase_auth_popup",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        reject(new Error("Popup blocked by browser. Please allow popups for this site."));
        return;
      }

      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === "FIREBASE_AUTH_SUCCESS") {
          window.removeEventListener("message", handleMessage);
          try {
            const { idToken, accessToken } = event.data;
            let credential;
            if (providerName === "google") {
              credential = GoogleAuthProvider.credential(idToken, accessToken);
            } else {
              credential = GithubAuthProvider.credential(accessToken);
            }
            await signInWithCredential(auth, credential);
            resolve();
          } catch (err) {
            reject(err);
          }
        } else if (event.data?.type === "FIREBASE_AUTH_ERROR") {
          window.removeEventListener("message", handleMessage);
          reject(new Error(event.data.error || "Authentication failed"));
        }
      };

      window.addEventListener("message", handleMessage);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          resolve();
        }
      }, 1000);
    });
  };

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
      await signInWithPopupFallback("github");
      setIsAuthModalOpen(false);
    } catch (fallbackError: any) {
      console.warn("Popup fallback sign in error, trying direct popup:", fallbackError);
      try {
        await signInWithPopup(auth, githubProvider);
        setIsAuthModalOpen(false);
      } catch (error: any) {
        console.error("OAuth sign in error:", error);
        throw error;
      }
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
