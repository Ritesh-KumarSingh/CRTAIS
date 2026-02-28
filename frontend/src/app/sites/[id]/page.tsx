"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, Grid, Thermometer, Activity } from "lucide-react";
import { sitesApi, type Site, type Rule } from "@/lib/api";
import WindRose from "@/components/visualizations/WindRose";
import SunPath from "@/components/visualizations/SunPath";

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
                setError(err instanceof Error ? err.message : "Failed to load site data");
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
                <h2 className="text-lg font-semibold text-white mb-2">Error</h2>
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
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition-colors"
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
                        <h1 className="text-2xl font-bold text-white mb-1">{site.name}</h1>
                        <div className="flex items-center gap-4 text-xs text-white/50">
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
                            <p className="text-sm text-white/70 mt-3 max-w-2xl leading-relaxed">
                                {site.description}
                            </p>
                        )}
                        {site.vernacular_tradition && (
                            <p className="text-xs text-white/40 mt-1 italic">
                                Tradition: {site.vernacular_tradition}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Visualizations Grid */}
            <h2 className="text-lg font-semibold text-white pt-4">Site Microclimate Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SunPath />
                <WindRose />
            </div>

            {/* Evaluated Rules */}
            <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">
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
                            className="glass-card p-5 relative overflow-hidden group hover:border-white/20 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-white/30">{rule.rule_id}</span>
                                {rule.confidence != null && (
                                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50">
                                        Match: {Math.round(rule.confidence * 100)}%
                                    </span>
                                )}
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-2">{rule.name}</h3>
                            <div className="bg-primary-500/[0.04] p-3 rounded-lg border border-primary-500/10 mb-3">
                                <p className="text-xs text-white/70 leading-relaxed">
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
                            <p className="text-[10px] text-white/30 line-clamp-1">
                                Ref: {rule.sources[0]?.reference || "No specific reference"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
