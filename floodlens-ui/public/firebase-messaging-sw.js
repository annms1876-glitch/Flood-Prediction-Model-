importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD8lWUtZQKQCgqU_ZiTFDIYMZkA-m0D8AM",
  authDomain: "flood-prediction-model-919b8.firebaseapp.com",
  projectId: "flood-prediction-model-919b8",
  messagingSenderId: "679659575646",
  appId: "1:679659575646:web:410d1dcb47156c03e457cf"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const notification = payload.notification || {};
  self.registration.showNotification(notification.title || data.title || "Umeed AI flood alert", {
    body: notification.body || data.body || "Critical flood alert. Check Umeed AI.",
    icon: "/logo.svg",
    badge: "/logo.svg",
    tag: data.alertId || "umeed-flood-alert",
    renotify: true,
    requireInteraction: data.severity === "extreme",
    data: { url: data.url || "/alert-management", alertId: data.alertId, type: data.type }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/alert-management";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) { if ("focus" in client) { client.navigate(url); return client.focus(); } }
    return clients.openWindow ? clients.openWindow(url) : undefined;
  }));
});
