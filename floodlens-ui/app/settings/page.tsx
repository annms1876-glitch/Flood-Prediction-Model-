"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { UserProfileData } from "@/lib/firebase";
import {
  User,
  Shield,
  Database,
  MapPin,
  Save,
  Check,
  Copy,
  LogIn,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const {
    user,
    profile,
    loading,
    openAuthModal,
    updateProfileData,
    logout,
  } = useAuth();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<UserProfileData["gender"]>("prefer_not_to_say");
  const [role, setRole] = useState<UserProfileData["role"]>("resident");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setLocation(profile.location || "");
      setAge(profile.age !== undefined ? profile.age : "");
      setGender(profile.gender || "prefer_not_to_say");
      setRole(profile.role || "resident");
      setPhoneNumber(profile.phoneNumber || "");
    } else if (user) {
      setName(user.displayName || "");
      setLocation("valley_junction_1");
    }
  }, [profile, user]);

  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await updateProfileData({
        name,
        location,
        age: typeof age === "number" ? age : undefined,
        gender,
        role,
        phoneNumber: phoneNumber || undefined,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update Firestore record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Database className="w-6 h-6 text-cyan-400" />
          Settings & User Database
        </h1>
        <p className="text-gray-400 mt-1">
          Manage Firebase Authentication, community profile, and system preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Firebase Authentication & User Data Card */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Firebase User Profile & Demographics
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Stored persistently in Cloud Firestore (<span className="text-cyan-400 font-mono">/users/{user?.uid || "{userId}"}</span>)
              </p>
            </div>
            {user && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Authenticated
              </span>
            )}
          </div>

          {!user ? (
            <div id="unauth-settings-state" className="p-8 text-center bg-slate-800/40 rounded-xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Sign In Required</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Authenticate using Google, OAuth, or Email to view and edit your persistent user data (User ID, Location, Name, Age, Gender).
                </p>
              </div>
              <button
                id="settings-signin-btn"
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-xl transition duration-150 shadow-lg shadow-cyan-600/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In or Register
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileSave} className="space-y-4">
              {/* User ID block */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Firebase UID (Primary Key)
                  </span>
                  <span className="text-xs font-mono text-cyan-300 select-all">
                    {user.uid}
                  </span>
                </div>
                <button
                  id="settings-copy-uid-btn"
                  type="button"
                  onClick={copyUid}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-200 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UID</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  {error}
                </div>
              )}

              {savedSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Successfully saved to Cloud Firestore!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email (Authentication ID)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.email || "Google / OAuth Account"}
                    className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monitoring Location / Village *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Valley Junction 1"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Community Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-500"
                  >
                    <option value="resident">Resident</option>
                    <option value="first_responder">First Responder</option>
                    <option value="emergency_coordinator">Emergency Coordinator</option>
                    <option value="researcher">Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
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
                    placeholder="e.g. 34"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-500"
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Emergency Contact / Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                <button
                  id="settings-logout-btn"
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
                >
                  Sign Out
                </button>

                <button
                  id="settings-save-profile-btn"
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 shadow-lg shadow-cyan-600/20"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving to Firestore..." : "Update Database Profile"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Database & Cloud Status Card */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Firebase Cloud Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Project ID</span>
                <span className="text-white font-mono">flood-prediction-model-919b8</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Database Region</span>
                <span className="text-white">us-west1</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Auth Providers</span>
                <span className="text-cyan-400">Google, OAuth, Email</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Security Rules</span>
                <span className="text-emerald-400 font-medium">Hardened ABAC (v2)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Schema Isolation</span>
                <span className="text-emerald-400">PII Owner-Restricted</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-sm font-semibold text-white">Need Email/Password Auth?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Auth is active by default. If you use Email/Password and see an &quot;operation-not-allowed&quot; notice, enable the Email/Password provider in the Firebase Console:
            </p>
            <a
              href="https://console.firebase.google.com/project/flood-prediction-model-919b8/authentication/providers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:underline pt-1"
            >
              <span>Open Firebase Authentication Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
