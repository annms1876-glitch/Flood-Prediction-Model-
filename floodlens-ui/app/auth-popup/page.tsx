"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getAuth,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { app } from "@/lib/firebase";

function AuthPopupHandler() {
  const searchParams = useSearchParams();
  const providerName = searchParams.get("provider");
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);

    const handleAuth = async () => {
      try {
        // 1. Check if we are returning from redirect
        setStatus("Checking authentication status...");
        const result = await getRedirectResult(auth);

        if (result) {
          setStatus("Authentication successful! Transferring session...");
          const idToken = await result.user.getIdToken();
          // Access token for GitHub provider if needed
          const accessToken = (result as any)._tokenResponse?.oauthAccessToken || null;

          if (window.opener) {
            window.opener.postMessage(
              {
                type: "FIREBASE_AUTH_SUCCESS",
                providerId: result.providerId,
                idToken,
                accessToken,
              },
              window.location.origin
            );
            setStatus("Success! You can close this window now.");
            setTimeout(() => {
              window.close();
            }, 500);
          } else {
            setStatus("Success! Redirecting you back to the home page...");
            window.location.href = "/";
          }
          return;
        }

        // 2. If not returning from redirect, start redirect flow
        if (providerName === "google") {
          setStatus("Redirecting to Google Sign-In...");
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          await signInWithRedirect(auth, provider);
        } else if (providerName === "github") {
          setStatus("Redirecting to GitHub Sign-In...");
          const provider = new GithubAuthProvider();
          await signInWithRedirect(auth, provider);
        } else {
          setError("Invalid provider specified.");
        }
      } catch (err: any) {
        console.error("Auth popup error:", err);
        setError(err.message || "An authentication error occurred.");
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "FIREBASE_AUTH_ERROR",
              error: err.message || "Authentication failed",
            },
            window.location.origin
          );
        }
      }
    };

    handleAuth();
  }, [providerName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center border border-slate-100">
        <h1 className="text-xl font-semibold mb-4 text-emerald-600">Secure Authentication</h1>
        
        {error ? (
          <div className="text-left bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-4">
            <p className="font-semibold mb-1">Authentication Error</p>
            <p className="text-sm break-words">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="text-sm text-slate-600 font-medium">{status}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
          Umeed AI • Secure Verification
        </div>
      </div>
    </div>
  );
}

export default function AuthPopupPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center border border-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-sm text-slate-600 mt-4">Loading authorization...</p>
        </div>
      </div>
    }>
      <AuthPopupHandler />
    </Suspense>
  );
}
