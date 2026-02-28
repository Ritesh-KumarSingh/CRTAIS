"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    ChevronDown,
    ChevronRight,
    MapPin,
    Thermometer,
    Shield,
    ExternalLink,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { rulesApi, type Rule } from "@/lib/api";

const categoryColors: Record<string, string> = {
    courtyard: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    wall: "bg-earth-500/20 text-earth-400 border-earth-500/30",
    massing: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    roof: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    ventilation: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    orientation: "bg-primary-500/20 text-primary-400 border-primary-500/30",
    shading: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    openings: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    materials: "bg-stone-500/20 text-stone-400 border-stone-500/30",
    landscape: "bg-lime-500/20 text-lime-400 border-lime-500/30",
    water: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const sourceTypeLabels: Record<string, string> = {
    academic_paper: "📄 Paper",
    field_survey: "🏗️ Field Survey",
    artisan_interview: "🧑‍🔧 Artisan",
    building_code: "📐 Code",
    historical_record: "📜 Historical",
};

export default function RulesPage() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [zoneFilter, setZoneFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchRules = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await rulesApi.list({
                climate_zone: zoneFilter || undefined,
                category: categoryFilter || undefined,
                q: search || undefined,
            });
            setRules(res.rules);
            setTotal(res.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch rules");
        } finally {
            setLoading(false);
        }
    }, [search, zoneFilter, categoryFilter]);

    useEffect(() => {
        const timer = setTimeout(fetchRules, 300); // debounce search
        return () => clearTimeout(timer);
    }, [fetchRules]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Rule Browser</h1>
                    <p className="text-sm text-white/40">
                        Explore vernacular architecture rules with full provenance tracking.
                    </p>
                </div>
                <button
                    onClick={fetchRules}
                    className="btn-secondary flex items-center gap-2 text-sm"
                    disabled={loading}
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search rules, tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-11"
                    />
                </div>

                <div className="relative">
                    <Filter className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                        value={zoneFilter}
                        onChange={(e) => setZoneFilter(e.target.value)}
                        className="input-field pl-9 pr-8 appearance-none min-w-[150px]"
                    >
                        <option value="">All Zones</option>
                        <option value="Hot-Dry">Hot-Dry</option>
                        <option value="Warm-Humid">Warm-Humid</option>
                        <option value="Composite">Composite</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="input-field pr-8 appearance-none min-w-[140px]"
                    >
                        <option value="">All Categories</option>
                        {["courtyard", "wall", "massing", "roof", "ventilation", "orientation"].map((c) => (
                            <option key={c} value={c}>
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            {/* Status */}
            {error ? (
                <div className="glass-card p-6 text-center">
                    <p className="text-red-400 text-sm mb-2">{error}</p>
                    <p className="text-xs text-white/30">Make sure the backend is running on port 8000</p>
                </div>
            ) : loading ? (
                <div className="glass-card p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                </div>
            ) : (
                <>
                    <p className="text-xs text-white/30">
                        {total} rule{total !== 1 ? "s" : ""} found
                    </p>

                    {/* Rule Cards */}
                    <div className="space-y-3">
                        {rules.map((rule) => {
                            const isExpanded = expandedId === rule.rule_id;
                            return (
                                <div
                                    key={rule.rule_id}
                                    className="glass-card-hover overflow-hidden"
                                >
                                    {/* Header Row */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : rule.rule_id)}
                                        className="w-full flex items-start gap-4 p-5 text-left"
                                    >
                                        <div className="pt-0.5">
                                            <ChevronRight
                                                className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="text-[10px] font-mono text-white/25">
                                                    {rule.rule_id}
                                                </span>
                                                {rule.category && (
                                                    <span
                                                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${categoryColors[rule.category] || "bg-white/10 text-white/50 border-white/20"
                                                            }`}
                                                    >
                                                        {rule.category}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-sm font-semibold text-white mb-1">{rule.name}</h3>
                                            <p className="text-xs text-white/40 line-clamp-2">{rule.description}</p>

                                            <div className="flex items-center gap-3 mt-2 text-[11px] text-white/30">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {rule.region}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Thermometer className="w-3 h-3" />
                                                    {rule.climate_zone}
                                                </span>
                                                {rule.confidence != null && (
                                                    <span className="flex items-center gap-1">
                                                        <Shield className="w-3 h-3" />
                                                        {Math.round(rule.confidence * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-0 ml-9 border-t border-white/[0.04] animate-fade-in">
                                            <div className="pt-4 space-y-4">
                                                {/* Recommendation */}
                                                <div className="bg-primary-500/[0.06] border border-primary-500/10 rounded-xl p-4">
                                                    <p className="text-xs font-semibold text-primary-400 mb-2">
                                                        Recommendation
                                                    </p>
                                                    <p className="text-sm text-white/80 mb-2">
                                                        {rule.recommendation.summary}
                                                    </p>
                                                    {rule.recommendation.detail && (
                                                        <p className="text-xs text-white/40 leading-relaxed">
                                                            {rule.recommendation.detail}
                                                        </p>
                                                    )}
                                                    {rule.recommendation.parameters && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {Object.entries(rule.recommendation.parameters).map(
                                                                ([key, val]) => (
                                                                    <span
                                                                        key={key}
                                                                        className="text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-lg text-white/50"
                                                                    >
                                                                        {key}: {Array.isArray(val) ? val.join("–") : String(val)}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Provenance */}
                                                <div>
                                                    <p className="text-xs font-semibold text-white/50 mb-2">
                                                        Provenance
                                                    </p>
                                                    <p className="text-xs text-white/30 mb-2">
                                                        Tradition: {rule.tradition}
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {rule.sources.map((src, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-start gap-2 text-xs text-white/40"
                                                            >
                                                                <span className="flex-shrink-0">
                                                                    {sourceTypeLabels[src.type] || src.type}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    {src.reference}
                                                                    <ExternalLink className="w-3 h-3 flex-shrink-0 text-white/20" />
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {rule.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="text-[10px] text-white/30 bg-white/[0.03] px-2 py-0.5 rounded-full"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {rules.length === 0 && !loading && (
                            <div className="glass-card p-8 text-center">
                                <p className="text-white/40 text-sm">No rules match your filters.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
