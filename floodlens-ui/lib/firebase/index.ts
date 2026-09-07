import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocFromServer,
  onSnapshot,
} from "firebase/firestore";
import firebaseConfig from "@/firebase-applet-config.json";

// Initialize Firebase app safely (prevent multiple instances in Next.js hot reload)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const githubProvider = new GithubAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on client initialization as mandated by Firebase skill
if (typeof window !== "undefined") {
  (async () => {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("the client is offline")) {
        console.error("Please check your Firebase configuration.");
      }
    }
  })();
}

export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  location: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  role?: "resident" | "first_responder" | "emergency_coordinator" | "researcher";
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfileData): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    const cleaned: Record<string, unknown> = {
      id: profile.id,
      email: profile.email,
      name: profile.name.slice(0, 100),
      location: profile.location.slice(0, 100),
      updatedAt: new Date().toISOString(),
    };

    if (profile.age !== undefined && !isNaN(profile.age)) {
      cleaned.age = Math.min(Math.max(Math.round(profile.age), 0), 120);
    }
    if (profile.gender) {
      cleaned.gender = profile.gender;
    }
    if (profile.role) {
      cleaned.role = profile.role;
    }
    if (profile.phoneNumber) {
      cleaned.phoneNumber = profile.phoneNumber.slice(0, 30);
    }
    if (profile.createdAt) {
      cleaned.createdAt = profile.createdAt;
    } else {
      cleaned.createdAt = new Date().toISOString();
    }

    await setDoc(doc(db, "users", profile.id), cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
