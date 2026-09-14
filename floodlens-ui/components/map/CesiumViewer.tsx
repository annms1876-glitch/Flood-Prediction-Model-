"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  EVACUATION_ROUTES_3D,
  DEMO_LOCATIONS,
} from "./demoLocations";
import type { EvacuationRoute3D, GeoLocation, DemoLocation } from "./types";

interface CesiumViewerProps {
  showFloodZones: boolean;
  showRoutes: boolean;
  showSensors: boolean;
  showShelters: boolean;
  selectedRouteId: "A" | "B" | "C";
  onRouteSelect: (id: "A" | "B" | "C") => void;
  hoveredLocation: DemoLocation | null;
  onLocationHover: (loc: DemoLocation | null) => void;
}

declare global {
  interface Window {
    Cesium: any;
  }
}

export default function CesiumViewer({
  showFloodZones,
  showRoutes,
  showSensors,
  showShelters,
  selectedRouteId,
  onRouteSelect,
  hoveredLocation,
  onLocationHover,
}: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const entitiesRef = useRef<{ floodZones: any[]; routes: any[]; shelters: any[]; sensors: any[] }>({ floodZones: [], routes: [], shelters: [], sensors: [] });
  const [viewerReady, setViewerReady] = useState(false);
  const [cesiumLoaded, setCesiumLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const loadCesium = async () => {
      if (typeof window !== "undefined" && !window.Cesium) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/cesium@1.122.0/Build/Cesium/Cesium.js";
        script.onload = () => {
          setCesiumLoaded(true);
        };
        document.head.appendChild(script);
      } else {
        setCesiumLoaded(true);
      }
    };

    loadCesium();

    const initViewer = () => {
      if (!window.Cesium || !containerRef.current) return;

      const viewer = new window.Cesium.Viewer(containerRef.current, {
        terrainProvider: window.Cesium.createWorldTerrain(),
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        shouldAnimate: true,
      });

      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.fog.enabled = false;
      viewer.scene.skyAtmosphere.show = false;
      viewer.scene.sun.show = true;
      viewer.scene.sunBloomIntensity = 0.1;

      viewer.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(77.0982, 30.9084, 80000),
        orientation: { heading: window.Cesium.Math.toRadians(0), pitch: window.Cesium.Math.toRadians(-30), roll: 0 },
        duration: 3,
      });

      viewerRef.current = viewer;
      setViewerReady(true);

      DEMO_LOCATIONS.forEach((loc) => {
        if (loc.category === "flood_zone") {
          const severityColors: Record<string, [number, number, number, number]> = {
            inundated: [1.0, 0.0, 0.0, 0.4],
            hazardous: [1.0, 0.5, 0.0, 0.4],
            warning: [1.0, 1.0, 0.0, 0.3],
            watch: [0.0, 1.0, 0.0, 0.3],
            safe: [0.0, 0.5, 1.0, 0.3],
          };
          const color = severityColors[loc.severity] || [1.0, 0.0, 0.0, 0.4];
          const position = window.Cesium.Cartesian3.fromDegrees(loc.coordinates.lng, loc.coordinates.lat, loc.coordinates.elevation);
          const entity = viewer.entities.add({
            name: loc.name,
            position,
            ellipse: {
              semiMajorAxis: 600,
              semiMinorAxis: 500,
              material: new window.Cesium.Color.fromByteArray(color),
              outline: true,
              outlineColor: window.Cesium.Color.fromByteArray([color[0], color[1], color[2], 1.0]),
              outlineWidth: 2,
            },
            label: {
              text: loc.shortName,
              font: "12px sans-serif",
              fillColor: window.Cesium.Color.WHITE,
              outlineColor: window.Cesium.Color.BLACK,
              outlineWidth: 2,
              verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new window.Cesium.Cartesian2(0, -20),
            },
          });
          entitiesRef.current.floodZones.push(entity);
        }
        if (loc.category === "shelter") {
          const pos = window.Cesium.Cartesian3.fromDegrees(loc.coordinates.lng, loc.coordinates.lat, loc.coordinates.elevation);
          const entity = viewer.entities.add({
            position: pos,
            point: { pixelSize: 16, color: window.Cesium.Color.CYAN, outlineColor: window.Cesium.Color.WHITE, outlineWidth: 2 },
            label: { text: "🏠 " + loc.shortName, font: "11px sans-serif", fillColor: window.Cesium.Color.WHITE, verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM, pixelOffset: new window.Cesium.Cartesian2(0, 20) },
          });
          entitiesRef.current.shelters.push(entity);
        }
        if (loc.category === "sensor") {
          const pos = window.Cesium.Cartesian3.fromDegrees(loc.coordinates.lng, loc.coordinates.lat, loc.coordinates.elevation);
          const entity = viewer.entities.add({
            position: pos,
            point: { pixelSize: 10, color: window.Cesium.Color.YELLOW, outlineColor: window.Cesium.Color.WHITE, outlineWidth: 2 },
            label: { text: "📡 " + loc.shortName, font: "10px sans-serif", fillColor: window.Cesium.Color.YELLOW, verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM, pixelOffset: new window.Cesium.Cartesian2(0, 18) },
          });
          entitiesRef.current.sensors.push(entity);
        }
      });

      const route = EVACUATION_ROUTES_3D[selectedRouteId];
      if (route) {
        const positions = route.waypoints.map((wp) => window.Cesium.Cartesian3.fromDegrees(wp.lng, wp.lat, wp.elevation));
        viewer.entities.add({
          name: `Route ${route.id}`,
          polyline: {
            positions,
            width: 5,
            material: new window.Cesium.PolylineGlowMaterialProperty({
              color: route.tier === "recommended" ? window.Cesium.Color.GREEN : route.tier === "alternative" ? window.Cesium.Color.YELLOW : window.Cesium.Color.RED,
            }),
            clampToGround: true,
          },
        });
        route.waypoints.forEach((wp, i) => {
          const pos = window.Cesium.Cartesian3.fromDegrees(wp.lng, wp.lat, wp.elevation);
          const step = route.steps[i];
          if (step) {
            viewer.entities.add({
              name: `Step ${step.stepNumber}`,
              position: pos,
              point: { pixelSize: 12, color: step.isSafeHighGround ? window.Cesium.Color.GREEN : window.Cesium.Color.RED, outlineColor: window.Cesium.Color.WHITE, outlineWidth: 2 },
              label: { text: `${step.stepNumber}`, font: "bold 14px sans-serif", fillColor: window.Cesium.Color.WHITE, verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM, pixelOffset: new window.Cesium.Cartesian2(0, 15) },
            });
          }
        });
        const dest = window.Cesium.Cartesian3.fromDegrees(route.destinationCoords.lng, route.destinationCoords.lat, route.destinationCoords.elevation);
        viewer.entities.add({
          name: "Shelter",
          position: dest,
          point: { pixelSize: 20, color: window.Cesium.Color.CYAN, outlineColor: window.Cesium.Color.WHITE, outlineWidth: 3 },
          label: { text: "🏠 " + route.destinationName, font: "bold 12px sans-serif", fillColor: window.Cesium.Color.WHITE, verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM, pixelOffset: new window.Cesium.Cartesian2(0, 25) },
        });
        entitiesRef.current.routes.push(viewer.entities.add({}));
      }
    };

    const checkInterval = setInterval(() => {
      if (cesiumLoaded && !viewerRef.current) {
        clearInterval(checkInterval);
        initViewer();
      }
    }, 500);

    return () => {
      clearInterval(checkInterval);
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current) return;
    entitiesRef.current.floodZones.forEach((entity) => {
      if (entity) entity.show = showFloodZones;
    });
  }, [showFloodZones]);

  useEffect(() => {
    if (!viewerRef.current) return;
    const route = EVACUATION_ROUTES_3D[selectedRouteId];
    if (route && showRoutes) {
      const positions = route.waypoints.map((wp) => window.Cesium.Cartesian3.fromDegrees(wp.lng, wp.lat, wp.elevation));
      viewerRef.current.entities.add({
        name: `Route ${route.id}`,
        polyline: {
          positions,
          width: 5,
          material: new window.Cesium.PolylineGlowMaterialProperty({
            color: route.tier === "recommended" ? window.Cesium.Color.GREEN : route.tier === "alternative" ? window.Cesium.Color.YELLOW : window.Cesium.Color.RED,
          }),
          clampToGround: true,
        },
      });
      route.waypoints.forEach((wp, i) => {
        const pos = window.Cesium.Cartesian3.fromDegrees(wp.lng, wp.lat, wp.elevation);
        const step = route.steps[i];
        if (step) {
          viewerRef.current.entities.add({
            name: `Step ${step.stepNumber}`,
            position: pos,
            point: { pixelSize: 12, color: step.isSafeHighGround ? window.Cesium.Color.GREEN : window.Cesium.Color.RED, outlineColor: window.Cesium.Color.WHITE, outlineWidth: 2 },
            label: { text: `${step.stepNumber}`, font: "bold 14px sans-serif", fillColor: window.Cesium.Color.WHITE, verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM, pixelOffset: new window.Cesium.Cartesian2(0, 15) },
          });
        }
      });
      const dest = window.Cesium.Cartesian3.fromDegrees(route.destinationCoords.lng, route.destinationCoords.lat, route.destinationCoords.elevation);
      viewerRef.current.entities.add({
        name: "Shelter",
        position: dest,
        point: { pixelSize: 20, color: window.Cesium.Color.CYAN, outlineColor: window.Cesium.Color.WHITE, outlineWidth: 3 },
        label: { text: "🏠 " + route.destinationName, font: "bold 12px sans-serif", fillColor: window.Cesium.Color.WHITE, verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM, pixelOffset: new window.Cesium.Cartesian2(0, 25) },
      });
    }
  }, [showRoutes, selectedRouteId]);

  useEffect(() => {
    if (!viewerRef.current) return;
    entitiesRef.current.sensors.forEach((entity) => {
      if (entity) entity.show = showSensors;
    });
  }, [showSensors]);

  useEffect(() => {
    if (!viewerRef.current) return;
    entitiesRef.current.shelters.forEach((entity) => {
      if (entity) entity.show = showShelters;
    });
  }, [showShelters]);

  if (!viewerReady) {
    return <div ref={containerRef} className="w-full h-full bg-gray-900" />;
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
