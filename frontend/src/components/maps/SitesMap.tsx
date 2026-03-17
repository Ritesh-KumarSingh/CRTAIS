"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { sitesApi } from "@/lib/api";

// Hardcoded pilot sites as fallback if API is unavailable
const fallbackSites = [
  {
    site_id: "SITE-001",
    name: "Jaipur Old City Pilot",
    latitude: 26.9239,
    longitude: 75.8267,
    climate_zone: "Hot-Dry",
    tradition: "Haveli architecture of Rajasthan",
    plot_area_sqm: 320,
    polygon: [
      [75.8262, 26.9236], [75.8272, 26.9236],
      [75.8272, 26.9242], [75.8262, 26.9242], [75.8262, 26.9236],
    ],
  },
  {
    site_id: "SITE-002",
    name: "Kutch Bhunga Village",
    latitude: 23.7337,
    longitude: 69.8597,
    climate_zone: "Hot-Dry",
    tradition: "Bhunga dwellings of Kutch",
    plot_area_sqm: 500,
    polygon: [
      [69.859, 23.7332], [69.8604, 23.7332],
      [69.8604, 23.7342], [69.859, 23.7342], [69.859, 23.7332],
    ],
  },
  {
    site_id: "SITE-003",
    name: "Coorg Ainmane Homestead",
    latitude: 12.4244,
    longitude: 75.7382,
    climate_zone: "Warm-Humid",
    tradition: "Ainmane architecture of Kodagu",
    plot_area_sqm: 800,
    polygon: [
      [75.7375, 12.424], [75.7389, 12.424],
      [75.7389, 12.4248], [75.7375, 12.4248], [75.7375, 12.424],
    ],
  },
];

function getZoneColor(zone: string) {
  switch (zone) {
    case "Hot-Dry":
      return { marker: "#e0654e", polygon: "#e0654e" };
    case "Warm-Humid":
      return { marker: "#36aaf5", polygon: "#36aaf5" };
    default:
      return { marker: "#0c8ee6", polygon: "#0c8ee6" };
  }
}

interface SiteMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  climate_zone: string;
  tradition: string;
  plot_area_sqm: number | null;
  polygon?: number[][] | null;
}

export default function SitesMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [sites, setSites] = useState<SiteMapItem[]>([]);

  // Fetch sites from API + merge with pilot site fallbacks
  useEffect(() => {
    async function loadSites() {
      const combined: SiteMapItem[] = fallbackSites.map((s) => ({
        id: s.site_id,
        name: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        climate_zone: s.climate_zone,
        tradition: s.tradition,
        plot_area_sqm: s.plot_area_sqm,
        polygon: s.polygon,
      }));

      try {
        const res = await sitesApi.list({ limit: 100 });
        for (const site of res.sites) {
          combined.push({
            id: site.id,
            name: site.name,
            latitude: site.latitude,
            longitude: site.longitude,
            climate_zone: site.climate_zone,
            tradition: site.vernacular_tradition || "",
            plot_area_sqm: site.plot_area_sqm,
            polygon: site.polygon?.coordinates?.[0] || null,
          });
        }
      } catch {
        // API might not be running — that's OK, fallback sites will show
      }

      setSites(combined);
    }
    loadSites();
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || sites.length === 0) return;

    const map = L.map(containerRef.current, {
      center: [22.0, 75.0],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    L.control
      .attribution({ position: "bottomright" })
      .addAttribution(
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      )
      .addTo(map);

    // Add sites
    sites.forEach((site) => {
      const colors = getZoneColor(site.climate_zone);

      const icon = L.divIcon({
        html: `<div style="
          width: 20px; height: 20px;
          background: ${colors.marker};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px ${colors.marker}66;
        "></div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([site.latitude, site.longitude], { icon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #0f172a;">
            ${site.name}
          </h3>
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <span style="
              font-size: 10px; font-weight: 500; padding: 2px 8px;
              background: ${colors.marker}22; color: ${colors.marker};
              border-radius: 9999px; border: 1px solid ${colors.marker}44;
            ">${site.climate_zone}</span>
          </div>
          ${site.tradition ? `<p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">${site.tradition}</p>` : ""}
          <p style="margin: 0 0 12px; font-size: 11px; color: #94a3b8;">
            ${site.plot_area_sqm ? `${site.plot_area_sqm} m² · ` : ""}${site.latitude.toFixed(4)}°N, ${site.longitude.toFixed(4)}°E
          </p>
          <a href="/sites/${site.id}" style="
            display: block; width: 100%; text-align: center;
            background: ${colors.marker}22; color: ${colors.marker};
            border: 1px solid ${colors.marker}44; border-radius: 6px;
            padding: 6px 0; font-size: 11px; font-weight: 600;
            text-decoration: none; transition: all 0.2s;
          ">View Full Analysis →</a>
        </div>
      `);

      if (site.polygon) {
        const latLngs = site.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polygon(latLngs, {
          color: colors.polygon,
          fillColor: colors.polygon,
          fillOpacity: 0.15,
          weight: 2,
          opacity: 0.6,
        }).addTo(map);
      }
    });

    // Legend
    const legend = new L.Control({ position: "topright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      div.innerHTML = `
        <div style="
          background: rgba(255,255,255,0.9); backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;
          padding: 12px 16px; font-family: Inter, sans-serif;
        ">
          <p style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">
            Climate Zones
          </p>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #e0654e;"></div>
              <span style="font-size: 12px; color: #334155;">Hot-Dry</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #36aaf5;"></div>
              <span style="font-size: 12px; color: #334155;">Warm-Humid</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #0c8ee6;"></div>
              <span style="font-size: 12px; color: #334155;">Other</span>
            </div>
          </div>
          <p style="font-size: 10px; color: #94a3b8; margin: 8px 0 0; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 8px;">
            ${sites.length} site${sites.length !== 1 ? "s" : ""} loaded
          </p>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [sites]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] rounded-xl overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
