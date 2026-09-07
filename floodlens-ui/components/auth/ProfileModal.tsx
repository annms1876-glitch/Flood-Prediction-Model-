"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { UserProfileData } from "@/lib/firebase";
import {
  X,
  User,
  MapPin,
  Mail,
  Shield,
  Copy,
  Check,
  Calendar,
  Phone,
  Database,
  Save,
} from "lucide-react";

export function ProfileModal() {
  const { user, profile, isProfileModalOpen, closeProfileModal, updateProfileData, logout } =
    useAuth();

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
      setLocation("Regional Station");
    }
  }, [profile, user]);

  if (!isProfileModalOpen || !user) return null;

  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError(err.message || "Failed to update profile in Firestore");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#261b07]/45 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProfileModal();
      }}
    >
      <div
        id="profile-modal-card"
        className="bg-white border border-[#d5d2cd] rounded-2xl w-full max-w-lg shadow-[0_8px_18px_rgba(38,27,7,.10)] overflow-hidden relative my-8"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#e3dfd5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f9a600]/20 border border-[#e89b01]/30 flex items-center justify-center text-[#e89b01] font-bold">
              {profile?.name ? profile.name[0].toUpperCase() : user.email?.[0].toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#261b07] flex items-center gap-2">
                User Profile & Firestore Data
              </h2>
              <p className="text-xs text-[#8f897e]">
                Synchronized with Firebase Firestore (/users/{user.uid})
              </p>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={closeProfileModal}
            className="text-[#8f897e] hover:text-[#261b07] p-2 rounded-lg hover:bg-[#f2efe8] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* User ID Card */}
          <div className="p-3.5 bg-[#f2efe8]/60 rounded-xl border border-[#d5d2cd]/60 flex items-center justify-between">
            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold text-[#8f897e] uppercase tracking-wider block">
                Firebase User ID (UID)
              </span>
              <span className="text-xs font-mono text-[#e89b01] truncate block max-w-xs">
                {user.uid}
              </span>
            </div>
            <button
              id="copy-uid-btn"
              onClick={copyUid}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#e3dfd5] hover:bg-[#d5d2cd] rounded-lg text-xs text-[#261b07] transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#6f8d54]" />
                  <span className="text-[#6f8d54]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-[#f0624f]/10 border border-[#f0624f]/30 rounded-lg text-[#d94b3b] text-xs">
              {error}
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-[#edf3e8] border border-[#6f8d54]/30 rounded-lg text-[#6f8d54] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-[#6f8d54] shrink-0" />
              Profile changes committed to Cloud Firestore!
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#61594a] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8f897e] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl pl-9 pr-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#61594a] mb-1">
                  Email (Auth Verified)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#aca89f] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    disabled
                    value={user.email || "No email"}
                    className="w-full bg-[#f2efe8]/40 border border-[#d5d2cd]/40 rounded-xl pl-9 pr-3 py-2 text-sm text-[#8f897e] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#61594a] mb-1">
                  Assigned Location / Village *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8f897e] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl pl-9 pr-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#61594a] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8f897e] absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full bg-[#f2efe8] border border-[#d5d2cd] rounded-xl pl-9 pr-3 py-2 text-sm text-[#261b07] focus:outline-hidden focus:border-[#e89b01]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
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
                  <option value="emergency_coordinator">Coordinator</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#e3dfd5]">
              <button
                id="logout-btn"
                type="button"
                onClick={async () => {
                  await logout();
                  closeProfileModal();
                }}
                className="px-4 py-2 text-xs font-medium text-[#d94b3b] hover:text-[#d94b3b] hover:bg-[#f0624f]/10 rounded-xl transition"
              >
                Sign Out
              </button>

              <button
                id="save-profile-btn"
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#f9a600] hover:bg-[#f9a600] text-[#261b07] font-medium rounded-xl transition disabled:opacity-50 text-sm shadow-lg shadow-[#e89b01]/20"
              >
                <Save className="w-4 h-4" />
                {saving ? "Updating..." : "Save to Database"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
