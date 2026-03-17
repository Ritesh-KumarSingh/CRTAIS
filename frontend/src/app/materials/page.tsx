"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, ChevronDown, Leaf, Box, Wind, Droplets, Loader2, Thermometer, Hammer } from "lucide-react";
import { materialsApi, type Material } from "@/lib/api";

const categoryIcons: Record<string, React.ReactNode> = {
    masonry: <Box className="w-4 h-4" />,
    structural: <Hammer className="w-4 h-4" />,
    roofing: <Wind className="w-4 h-4" />,
    finishes: <Droplets className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
    masonry: "bg-earth-500/20 text-earth-400 border-earth-500/30",
    structural: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    roofing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    finishes: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await materialsApi.list({
                category: categoryFilter || undefined,
                q: search || undefined,
            });
            setMaterials(res.materials);
            setTotal(res.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch materials");
        } finally {
            setLoading(false);
        }
    }, [search, categoryFilter]);

    useEffect(() => {
        const timer = setTimeout(fetchMaterials, 300); // Debounce
        return () => clearTimeout(timer);
    }, [fetchMaterials]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Materials Catalog</h1>
                    <p className="text-sm text-slate-500">
                        Browse sustainable, locally-sourced building materials and their physical properties.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search materials, regions, tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-11"
                    />
                </div>

                <div className="relative">
                    <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="input-field pl-9 pr-8 appearance-none min-w-[150px]"
                    >
                        <option value="">All Categories</option>
                        <option value="masonry">Masonry & Walls</option>
                        <option value="structural">Structural</option>
                        <option value="roofing">Roofing & Coverings</option>
                        <option value="finishes">Finishes & Mortars</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            <div className="flex justify-end">
                <p className="text-xs text-slate-500">{total} material{total !== 1 ? 's' : ''} found</p>
            </div>

            {/* Status / Content */}
            {error ? (
                <div className="glass-card p-6 text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            ) : loading && materials.length === 0 ? (
                <div className="glass-card p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {materials.map((mat) => (
                        <div key={mat.material_id} className="glass-card p-6 flex flex-col hover:border-slate-200 transition-colors">

                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-mono text-slate-500">{mat.material_id}</span>
                                        <span className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded border capitalize
                      ${categoryColors[mat.category] || "bg-slate-100 text-slate-500 border-slate-200"}`}
                                        >
                                            {categoryIcons[mat.category]} {mat.category}
                                        </span>
                                    </div>
                                    <h2 className="text-base font-semibold text-slate-800 mb-1.5">{mat.name}</h2>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                        {mat.description}
                                    </p>
                                    <p className="text-[11px] text-primary-400">
                                        <span className="text-slate-500 mr-1">Region:</span> {mat.region}
                                    </p>
                                </div>

                                {/* Sustainability Badge */}
                                <div className="flex-shrink-0 text-center bg-emerald-500/[0.04] p-3 rounded-xl border border-emerald-500/10 min-w[80px]">
                                    <Leaf className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                                    <p className="text-[10px] font-medium text-emerald-400 mb-0.5">Embodied C.</p>
                                    <p className="text-lg font-bold text-slate-800 leading-none">
                                        {mat.sustainability.embodied_carbon}
                                    </p>
                                    <p className="text-[9px] text-emerald-500/50 mt-1">kgCO2e/kg</p>
                                </div>
                            </div>

                            {/* Data Grid */}
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                                    <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Thermometer className="w-3 h-3 text-sky-400" /> Thermal Properties
                                    </h3>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Conductivity (k)</span>
                                            <span className="font-mono text-slate-500">{mat.properties.thermal_conductivity} <span className="text-[9px] text-slate-500">W/mK</span></span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Density (ρ)</span>
                                            <span className="font-mono text-slate-500">{mat.properties.density} <span className="text-[9px] text-slate-500">kg/m³</span></span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Sp. Heat (c)</span>
                                            <span className="font-mono text-slate-500">{mat.properties.specific_heat} <span className="text-[9px] text-slate-500">J/kgK</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                                    <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Leaf className="w-3 h-3 text-emerald-400" /> Sourcing
                                    </h3>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Availability</span>
                                            <span className="font-medium capitalize text-slate-500">{mat.sustainability.local_availability}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Recyclability</span>
                                            <span className="font-medium capitalize text-slate-500">{mat.sustainability.recyclability}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {mat.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
