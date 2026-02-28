"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPickerProps {
    latitude?: number;
    longitude?: number;
    onMapClick: (lat: number, lng: number) => void;
}

export default function MapPicker({ latitude, longitude, onMapClick }: MapPickerProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Default center: India
        const defaultLat = latitude ?? 22.5;
        const defaultLng = longitude ?? 78.5;
        const defaultZoom = latitude ? 14 : 5;

        const map = L.map(containerRef.current, {
            center: [defaultLat, defaultLng],
            zoom: defaultZoom,
            zoomControl: true,
            attributionControl: false,
        });

        // Dark tile layer
        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
                maxZoom: 19,
                subdomains: "abcd",
            }
        ).addTo(map);

        // Attribution
        L.control
            .attribution({ position: "bottomright" })
            .addAttribution(
                '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            )
            .addTo(map);

        // Custom marker icon
        const markerIcon = L.divIcon({
            html: `<div style="
        width: 24px; height: 24px;
        background: linear-gradient(135deg, #0c8ee6, #36aaf5);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 12px rgba(12, 142, 230, 0.4);
      "></div>`,
            className: "",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        // Add initial marker if coords provided
        if (latitude && longitude) {
            markerRef.current = L.marker([latitude, longitude], { icon: markerIcon }).addTo(map);
        }

        // Click handler
        map.on("click", (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
            }

            onMapClick(lat, lng);
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update marker when coords change externally
    useEffect(() => {
        if (!mapRef.current || !latitude || !longitude) return;

        const markerIcon = L.divIcon({
            html: `<div style="
        width: 24px; height: 24px;
        background: linear-gradient(135deg, #0c8ee6, #36aaf5);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 12px rgba(12, 142, 230, 0.4);
      "></div>`,
            className: "",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
        } else {
            markerRef.current = L.marker([latitude, longitude], { icon: markerIcon }).addTo(
                mapRef.current
            );
        }

        mapRef.current.flyTo([latitude, longitude], 14, { duration: 1 });
    }, [latitude, longitude]);

    return (
        <div
            ref={containerRef}
            className="w-full h-[400px] rounded-xl overflow-hidden"
            style={{ zIndex: 0 }}
        />
    );
}
