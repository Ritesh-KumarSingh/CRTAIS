"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SitesMap = dynamic(() => import("@/components/maps/SitesMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] glass-card flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
        </div>
    ),
});

export default function MapViewPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Map View</h1>
                <p className="text-sm text-white/40">
                    Explore pilot sites with geospatial overlays. Click a marker to view site details.
                </p>
            </div>

            <div className="glass-card p-4">
                <SitesMap />
            </div>
        </div>
    );
}
