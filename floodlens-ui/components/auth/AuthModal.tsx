"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { UserProfileData } from "@/lib/firebase";
import { X, Mail, Lock, User, MapPin, AlertCircle, Sparkles } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("valley_junction_1");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<UserProfileData["gender"]>("prefer_not_to_say");
  const [role, setRole] = useState<UserProfileData["role"]>("resident");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const closeAndReset = () => {
    setEmail("");
    setPassword("");
    setError(null);
    closeAuthModal();
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      const signInPromise = signInWithGoogle();
      setLoading(true);
      await signInPromise;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async () => {
    setError(null);
    try {
      const signInPromise = signInWithGithub();
      setLoading(true);
      await signInPromise;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with OAuth provider");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, {
          name,
          location,
          age: typeof age === "number" ? age : undefined,
          gender,
          role,
        });
      }
    } catch (err: any) {
      let msg = err.message || "Authentication failed";
      if (err.code === "auth/operation-not-allowed") {
        msg =
          "Email/Password sign-in is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method, or use Google Sign-In.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please sign in instead.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#261b07]/45 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAndReset();
      }}
    >
      <div
        id="auth-modal-card"
        className="bg-white border border-[#d5d2cd] rounded-2xl w-full max-w-md shadow-[0_8px_18px_rgba(38,27,7,.10)] overflow-hidden relative my-8"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#e3dfd5] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#261b07] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#e89b01]" />
              {mode === "signin" ? "Sign In to Umeed AI" : "Create Your Account"}
            </h2>
            <p className="text-xs text-[#8f897e] mt-1">
              Secure flood alerting & community risk monitoring
            </p>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={closeAndReset}
            className="text-[#8f897e] hover:text-[#261b07] p-2 rounded-lg hover:bg-[#f2efe8] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div
              id="auth-error-banner"
              className="p-3 bg-[#f0624f]/10 border border-[#f0624f]/30 rounded-lg text-[#d94b3b] text-xs flex items-start gap-2 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-[#d94b3b] shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Social Sign-in Buttons */}
          <div className="space-y-2">
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-medium rounded-xl transition duration-150 shadow-xs disabled:opacity-50 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>


          </div>

          <div className="flex items-center my-3">
            <div className="flex-grow border-t border-[#e3dfd5]"></div>
            <span className="shrink-0 px-3 text-xs text-[#aca89f] uppercase tracking-wider">
              Or with email
            </span>
            <div className="flex-grow border-t border-[#e3dfd5]"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3" autoComplete={mode === "signin" ? "on" : "off"}>
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#61594a] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8f897e] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl pl-9 pr-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#61594a] mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) =>
                        setAge(e.target.value ? parseInt(e.target.value, 10) : "")
                      }
                      placeholder="e.g. 32"
                      className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl px-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#61594a] mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl px-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                    >
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#61594a] mb-1">
                      Location / Village *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#8f897e] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="valley_junction_1"
                        className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl pl-9 pr-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#61594a] mb-1">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl px-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                    >
                      <option value="resident">Resident</option>
                      <option value="first_responder">First Responder</option>
                      <option value="emergency_coordinator">Emergency Coordinator</option>
                      <option value="researcher">Researcher</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-[#61594a] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8f897e] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    name="email"
                    autoComplete={mode === "signin" ? "username" : "email"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl pl-9 pr-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#61594a] mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8f897e] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    name="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl pl-9 pr-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#f9a600] hover:bg-[#f9a600] text-[#261b07] font-medium rounded-xl transition duration-150 disabled:opacity-50 text-sm mt-2 shadow-lg shadow-[#e89b01]/20"
            >
              {loading
                ? "Processing..."
                : mode === "signin"
                ? "Sign In with Email"
                : "Register Account & Profile"}
            </button>
          </form>

          {/* Switch mode */}
          <div className="text-center pt-2">
            <button
              id="toggle-auth-mode-btn"
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="text-xs text-[#e89b01] hover:text-[#e89b01] hover:underline"
            >
              {mode === "signin"
                ? "Don't have an account? Register profile"
                : "Already registered? Sign in here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
