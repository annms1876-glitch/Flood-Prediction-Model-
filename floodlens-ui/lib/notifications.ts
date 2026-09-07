"use client";

import { getToken, getMessaging, isSupported, onMessage } from "firebase/messaging";
import { app, auth } from "@/lib/firebase";

export async function registerFloodPushToken() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) throw new Error("This browser does not support emergency notifications.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");
  if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) throw new Error("Push notifications need NEXT_PUBLIC_FIREBASE_VAPID_KEY.");
  if (!(await isSupported())) throw new Error("Firebase messaging is not supported in this browser.");
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(getMessaging(app), { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) throw new Error("No push token was returned.");
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Sign in before enabling emergency alerts.");
  const response = await fetch("/api/notifications/register-token", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }, body: JSON.stringify({ token, platform: "web" }) });
  if (!response.ok) throw new Error("Push token registration failed.");
  return token;
}

export function speakFloodAlert(message: string) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-IN";
  utterance.rate = 0.9;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

export async function listenForForegroundFloodAlerts(onAlert: (data: Record<string, string>) => void) {
  if (!(await isSupported())) return () => undefined;
  return onMessage(getMessaging(app), (payload) => onAlert((payload.data || {}) as Record<string, string>));
}
