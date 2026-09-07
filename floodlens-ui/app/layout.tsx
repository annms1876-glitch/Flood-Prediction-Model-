import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "FloodLens — AI Flood Prediction",
  description: "Real-time flood risk assessment and early warning system for hilly regions using an ensemble AI architecture.",
  openGraph: {
    title: "FloodLens — AI Flood Prediction",
    description: "Real-time flood risk assessment and early warning system for hilly regions using an ensemble AI architecture.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-dark min-h-screen">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
