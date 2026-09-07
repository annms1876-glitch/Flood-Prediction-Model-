"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import i18n from "i18next";
import { I18nextProvider, initReactI18next, useTranslation } from "react-i18next";

const resources = {
  en: { translation: {
    brand: "Umeed AI", tagline: "Your local flood safety companion", community: "Community", command: "Command center",
    overview: "Overview", liveMap: "Evacuation map", preparedness: "Preparedness", signIn: "Sign in", alerts: "Alerts",
    goodMorning: "Good morning", location: "Solan, Himachal Pradesh", updated: "Updated just now", allClear: "All clear in your area",
    monitoring: "Monitoring is active. We will notify you if conditions change.", currentStatus: "Current status", lowRisk: "Low flood risk",
    weather: "Weather", clear: "Clear skies", temperature: "24°", humidity: "65% humidity", rain: "No rain expected",
    ready: "You are safe right now", advice: "Keep notifications on and stay prepared.", safetyTips: "Safety tips",
    tip1: "Stay indoors if flooding starts", tip2: "Keep your emergency kit ready", tip3: "Move to higher ground when advised",
    viewMap: "View evacuation map", mapHelp: "See your location, safe zones and the safest route home.", emergency: "Emergency contacts",
    callEmergency: "Call 112", callSdrf: "SDRF helpline", routeReady: "Safe routes are available", routeSub: "The nearest safe shelter is 1.2 km away.",
    viewRoutes: "View safe routes", language: "Language", english: "English", hindi: "हिन्दी", close: "Close", gps: "Use my location",
  }},
  hi: { translation: {
    brand: "उम्मीद AI", tagline: "आपका स्थानीय बाढ़ सुरक्षा साथी", community: "समुदाय", command: "कमांड सेंटर",
    overview: "ओवरव्यू", liveMap: "निकासी मानचित्र", preparedness: "तैयारी", signIn: "साइन इन", alerts: "अलर्ट",
    goodMorning: "सुप्रभात", location: "सोलन, हिमाचल प्रदेश", updated: "अभी अपडेट किया गया", allClear: "आपके क्षेत्र में स्थिति सामान्य है",
    monitoring: "निगरानी सक्रिय है। स्थिति बदलने पर हम आपको सूचित करेंगे।", currentStatus: "वर्तमान स्थिति", lowRisk: "बाढ़ का जोखिम कम है",
    weather: "मौसम", clear: "आसमान साफ़", temperature: "24°", humidity: "65% नमी", rain: "बारिश की संभावना नहीं",
    ready: "आप अभी सुरक्षित हैं", advice: "नोटिफिकेशन चालू रखें और तैयार रहें।", safetyTips: "सुरक्षा सुझाव",
    tip1: "बाढ़ शुरू होने पर घर के अंदर रहें", tip2: "आपातकालीन किट तैयार रखें", tip3: "सलाह मिलने पर ऊंची जगह पर जाएं",
    viewMap: "निकासी मानचित्र देखें", mapHelp: "अपना स्थान, सुरक्षित क्षेत्र और सबसे सुरक्षित रास्ता देखें।", emergency: "आपातकालीन संपर्क",
    callEmergency: "112 पर कॉल करें", callSdrf: "SDRF हेल्पलाइन", routeReady: "सुरक्षित रास्ते उपलब्ध हैं", routeSub: "नजदीकी सुरक्षित आश्रय 1.2 किमी दूर है।",
    viewRoutes: "सुरक्षित रास्ते देखें", language: "भाषा", english: "English", hindi: "हिन्दी", close: "बंद करें", gps: "मेरा स्थान उपयोग करें",
  }},
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({ resources, lng: "en", fallbackLng: "en", interpolation: { escapeValue: false } });
}

const LanguageContext = createContext<{ language: "en" | "hi"; setLanguage: (language: "en" | "hi") => void }>({ language: "en", setLanguage: () => undefined });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<"en" | "hi">("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("umeed-language") as "en" | "hi" | null;
    if (stored === "en" || stored === "hi") setLanguageState(stored);
  }, []);

  const setLanguage = (next: "en" | "hi") => {
    setLanguageState(next);
    window.localStorage.setItem("umeed-language", next);
    void i18n.changeLanguage(next);
  };

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}><I18nextProvider i18n={i18n}>{children}</I18nextProvider></LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }
export { useTranslation };
