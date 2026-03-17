"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2, MapPin, Grid, Thermometer, Activity } from "lucide-react";
import { sitesApi, type Site, type Rule } from "@/lib/api";
import WindRose from "@/components/visualizations/WindRose";
import SunPath from "@/components/visualizations/SunPath";

const MassingViewer = dynamic(() => import("@/components/visualizations/MassingViewer"), { ssr: false });

const fallbackSitesData: Site[] = [
    {
        id: "SITE-001",
        name: "Jaipur Old City Pilot",
        description: "Haveli-style residential plot in the walled city of Jaipur, representative of hot-dry desert architecture.",
        latitude: 26.9239,
        longitude: 75.8267,
        climate_zone: "Hot-Dry",
        typology: "Residential",
        vernacular_tradition: "Haveli architecture of Rajasthan",
        plot_area_sqm: 320,
        polygon: {
            type: "Polygon",
            coordinates: [[[75.8262, 26.9236], [75.8272, 26.9236], [75.8272, 26.9242], [75.8262, 26.9242], [75.8262, 26.9236]]]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "SITE-002",
        name: "Kutch Bhunga Village",
        description: "Circular bhunga dwelling site in the Rann of Kutch, representing indigenous earthquake-resistant and heat-adaptive architecture.",
        latitude: 23.7337,
        longitude: 69.8597,
        climate_zone: "Hot-Dry",
        typology: "Residential",
        vernacular_tradition: "Bhunga dwellings of Kutch",
        plot_area_sqm: 500,
        polygon: {
            type: "Polygon",
            coordinates: [[[69.8590, 23.7332], [69.8604, 23.7332], [69.8604, 23.7342], [69.8590, 23.7342], [69.8590, 23.7332]]]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "SITE-003",
        name: "Coorg Ainmane Homestead",
        description: "Traditional Kodava ainmane (ancestral home) in the Western Ghats, representing warm-humid hill architecture.",
        latitude: 12.4244,
        longitude: 75.7382,
        climate_zone: "Warm-Humid",
        typology: "Residential",
        vernacular_tradition: "Ainmane architecture of Kodagu",
        plot_area_sqm: 800,
        polygon: {
            type: "Polygon",
            coordinates: [[[75.7375, 12.4240], [75.7389, 12.4240], [75.7389, 12.4248], [75.7375, 12.4248], [75.7375, 12.4240]]]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

const fallbackRulesData: Rule[] = [
    {
        rule_id: "RULE-001",
        name: "Thick Thermal Mass Walls",
        description: "Use of thick stone or mud brick walls to delay heat transfer.",
        region: "Rajasthan",
        climate_zone: "Hot-Dry",
        tradition: "Haveli",
        category: "Envelope",
        recommendation: { summary: "Provide 300-450mm thick external walls", parameters: { "thickness": [300, 450], "material": "Stone/Mud" } },
        confidence: 0.95,
        sources: [{ type: "Book", reference: "Vernacular Architecture of Rajasthan" }],
        tags: ["thermal-mass", "walls"]
    },
    {
        rule_id: "RULE-002",
        name: "Central Courtyard",
        description: "Deep central courtyard for night sky radiation and shading.",
        region: "Rajasthan",
        climate_zone: "Hot-Dry",
        tradition: "Haveli",
        category: "Form",
        recommendation: { summary: "Incorporate a central courtyard with H/W ratio > 1.5", parameters: { "height_width_ratio": ">1.5" } },
        confidence: 0.88,
        sources: [{ type: "Paper", reference: "Courtyard performance in hot-dry climates" }],
        tags: ["courtyard", "passive-cooling"]
    }
];

export default function SiteDashboard() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.id as string;

    const [site, setSite] = useState<Site | null>(null);
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                // Load site and evaluated rules in parallel
                const [siteData, rulesData] = await Promise.all([
                    sitesApi.get(siteId),
                    sitesApi.getEvaluatedRules(siteId),
                ]);
                setSite(siteData);
                setRules(rulesData.rules);
            } catch (err) {
                // Fallback for pilot sites if the backend is down
                const fallbackSite = fallbackSitesData.find(s => s.id === siteId);
                if (fallbackSite) {
                    setSite(fallbackSite);
                    setRules(fallbackRulesData.filter(r => r.climate_zone === fallbackSite.climate_zone || r.climate_zone === "All"));
                    setError(null);
                } else {
                    setError(err instanceof Error ? err.message : "Failed to load site data");
                }
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [siteId]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    if (error || !site) {
        return (
            <div className="glass-card p-8 text-center animate-fade-in">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Error</h2>
                <p className="text-red-400 text-sm mb-4">{error || "Site not found"}</p>
                <button onClick={() => router.push("/map-view")} className="btn-secondary">
                    Return to Map
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.push("/map-view")}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Map
                </button>
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => router.push(`/sites/${site.id}/simulation`)}
                        className="btn-primary flex items-center justify-center gap-2 px-6"
                    >
                        <Activity className="w-4 h-4" /> Thermal Simulation
                    </button>
                    <button
                        onClick={() => router.push(`/sites/${site.id}/report`)}
                        className="btn-secondary flex items-center justify-center gap-2 px-6"
                    >
                        View Full Report
                    </button>
                </div>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">{site.name}</h1>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E
                            </span>
                            <span className="flex items-center gap-1 text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20">
                                <Thermometer className="w-3 h-3" />
                                {site.climate_zone}
                            </span>
                            {site.typology && (
                                <span className="flex items-center gap-1">
                                    <Grid className="w-3 h-3" />
                                    {site.typology}
                                </span>
                            )}
                        </div>
                        {site.description && (
                            <p className="text-sm text-slate-500 mt-3 max-w-2xl leading-relaxed">
                                {site.description}
                            </p>
                        )}
                        {site.vernacular_tradition && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                                Tradition: {site.vernacular_tradition}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Visualizations Grid */}
            <h2 className="text-lg font-semibold text-slate-800 pt-4">Site Microclimate Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SunPath />
                <WindRose />
            </div>

            {/* 3D Massing Viewer */}
            <h2 className="text-lg font-semibold text-slate-800 pt-4">Proposed 3D Massing</h2>
            <div className="w-full mb-6 relative z-0">
                <MassingViewer climateZone={site.climate_zone} orientation={15} />
            </div>

            {/* Evaluated Rules */}
            <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Recommended Vernacular Rules
                    </h2>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                        {rules.length} Rules Match Climate
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rules.map((rule) => (
                        <div
                            key={rule.rule_id}
                            className="glass-card p-5 relative overflow-hidden group hover:border-slate-200 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-slate-500">{rule.rule_id}</span>
                                {rule.confidence != null && (
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                        Match: {Math.round(rule.confidence * 100)}%
                                    </span>
                                )}
                            </div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">{rule.name}</h3>
                            <div className="bg-primary-500/[0.04] p-3 rounded-lg border border-primary-500/10 mb-3">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {rule.recommendation.summary}
                                </p>
                                {rule.recommendation.parameters && typeof rule.recommendation.parameters === 'object' && (
                                    <div className="mt-2 text-[10px] text-primary-400 font-mono">
                                        {Object.entries(rule.recommendation.parameters)
                                            .slice(0, 2)
                                            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join("-") : v}`).join(" | ")}
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                                Ref: {rule.sources[0]?.reference || "No specific reference"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
