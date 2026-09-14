"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Navigation, Shield, AlertTriangle, Info } from "lucide-react";

const EvacuationRoute3DView = dynamic(
  () => import("@/components/map/EvacuationRoute3DView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading 3D evacuation view...</div>
        </div>
      </div>
    ),
  }
);

export default function Evacuation3DPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Navigation className="w-6 h-6 text-amber-500" />
                3D Evacuation Route Guide
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Interactive turn-by-turn escape route with elevation profile and hazard alerts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banners */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 text-sm">Safe Routes</h3>
              <p className="text-xs text-green-700">
                Routes marked green stay on high ground above flood levels
              </p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 text-sm">Hazard Alerts</h3>
              <p className="text-xs text-amber-700">
                Red markers show flood zones, landslides, and road blocks
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 text-sm">Live Updates</h3>
              <p className="text-xs text-blue-700">
                Route status updates every 60 seconds from field sensors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3D Map View */}
      <div className="container mx-auto px-4 pb-8">
        <EvacuationRoute3DView
          initialRouteId="A"
          height="700px"
        />
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>🗺️ Route data updated: {new Date().toLocaleString()}</span>
              <span>📍 Coverage: Solan District, Himachal Pradesh</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/map" className="hover:text-amber-600 transition-colors">
                ← 2D Map View
              </Link>
              <Link href="/sos" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                🆘 SOS Emergency
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
