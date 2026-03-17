"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Download, MapPin, Grid, Thermometer, Calendar } from "lucide-react";
import { sitesApi, materialsApi, type Site, type Rule, type Material } from "@/lib/api";
import PlanOverlay from "@/components/visualizations/PlanOverlay";

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

const fallbackMaterialsData: Material[] = [
    {
        material_id: "MAT-001",
        name: "Laterite Stone",
        category: "structural",
        description: "Locally quarried reddish clayey rock.",
        region: "Western Ghats",
        properties: { thermal_conductivity: 0.85, density: 2000, specific_heat: 900 },
        sustainability: { embodied_carbon: 12.5, local_availability: "High", recyclability: "High" },
        tags: ["stone", "walls"]
    },
    {
        material_id: "MAT-002",
        name: "Sun-Dried Mud Brick (Adobe)",
        category: "structural",
        description: "Unbaked mud brick used in arid regions.",
        region: "Rajasthan",
        properties: { thermal_conductivity: 0.60, density: 1700, specific_heat: 1000 },
        sustainability: { embodied_carbon: -2.0, local_availability: "High", recyclability: "High" },
        tags: ["mud", "walls"]
    }
];

export default function SiteReportPage() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.id as string;

    const [site, setSite] = useState<Site | null>(null);
    const [rules, setRules] = useState<Rule[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    // Group rules by category
    const rulesByCategory = rules.reduce((acc, rule) => {
        const cat = rule.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(rule);
        return acc;
    }, {} as Record<string, Rule[]>);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                // Load site, evaluated rules, and ALL materials
                const [siteData, rulesData, materialsData] = await Promise.all([
                    sitesApi.get(siteId),
                    sitesApi.getEvaluatedRules(siteId),
                    materialsApi.list(),
                ]);
                setSite(siteData);
                setRules(rulesData.rules);
                setMaterials(materialsData.materials);
            } catch (err) {
                // Fallback for pilot sites if the backend is down
                const fallbackSite = fallbackSitesData.find(s => s.id === siteId);
                if (fallbackSite) {
                    setSite(fallbackSite);
                    setRules(fallbackRulesData.filter(r => r.climate_zone === fallbackSite.climate_zone || r.climate_zone === "All"));
                    setMaterials(fallbackMaterialsData);
                } else {
                    console.error(err);
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

    if (!site) return null;

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">

            {/* Floating Action Bar (Hidden in Print) */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 mb-8 -mx-8 px-8 flex items-center justify-between print:hidden">
                <button
                    onClick={() => router.push(`/sites/${site.id}`)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <button
                    onClick={() => window.print()}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <Download className="w-4 h-4" /> Print / Save PDF
                </button>
            </div>

            {/* REPORT CONTENT (Styled for Print + Screen) */}
            <div className="bg-white text-gray-900 rounded-none sm:rounded-2xl p-8 sm:p-12 print:p-0 print:bg-transparent shadow-2xl print:shadow-none min-h-[1056px]">

                {/* Header Block */}
                <div className="border-b-4 border-primary-600 pb-6 mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-primary-600 font-bold tracking-widest text-xs uppercase mb-1">
                                CRTAIS Architectural Brief
                            </p>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{site.name}</h1>
                            {site.description && (
                                <p className="text-gray-600 text-sm max-w-2xl">{site.description}</p>
                            )}
                        </div>
                        <div className="text-right text-xs text-gray-500 font-mono mt-1">
                            <p>ID: {site.id.split('-')[0]}</p>
                            <p>Generated: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm bg-gray-50 p-4 rounded-lg">
                        <span className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-primary-500" />
                            {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E
                        </span>
                        <span className="flex items-center gap-2 text-gray-700 font-medium">
                            <Thermometer className="w-4 h-4 text-rose-500" />
                            {site.climate_zone} Climate
                        </span>
                        {site.typology && (
                            <span className="flex items-center gap-2 text-gray-700">
                                <Grid className="w-4 h-4 text-blue-500" />
                                {site.typology}
                            </span>
                        )}
                        {site.plot_area_sqm && (
                            <span className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4 text-emerald-500" />
                                {site.plot_area_sqm} m²
                            </span>
                        )}
                    </div>
                </div>

                {/* Section 1: Executive Summary */}
                <div className="mb-10 page-break-inside-avoid">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        1. Design Directives Overview
                    </h2>
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <p>
                            Based on the site&apos;s {site.climate_zone} microclimate classification and the vernacular tradition of {site.vernacular_tradition || "the region"}, the AI rule engine has evaluated {rules.length} core historic design rules to optimize passive survivability and energy efficiency.
                        </p>
                    </div>
                </div>

                {/* Section 1.5: Spatial Overlay */}
                <div className="mb-10 page-break-inside-avoid">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        2. Indicative Spatial Overlay
                    </h2>
                    <PlanOverlay climateZone={site.climate_zone} />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Diagrammatic floorplan illustrating optimal massing and cross-ventilation flow for {site.climate_zone} climate.
                    </p>
                </div>

                {/* Section 2: Vernacular Directives */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        3. Prescriptive Vernacular Rules
                    </h2>

                    <div className="space-y-8">
                        {Object.entries(rulesByCategory).map(([category, catRules]) => (
                            <div key={category} className="page-break-inside-avoid">
                                <h3 className="text-lg font-semibold text-primary-700 border-b border-gray-200 pb-2 mb-4 capitalize">
                                    {category} Strategies
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {catRules.map(rule => (
                                        <div key={rule.rule_id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">{rule.name}</h4>
                                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                                {rule.recommendation.summary}
                                            </p>

                                            {rule.recommendation.parameters && typeof rule.recommendation.parameters === 'object' && (
                                                <div className="bg-white border border-gray-100 p-2 rounded text-[10px] font-mono text-gray-800 mb-3">
                                                    {Object.entries(rule.recommendation.parameters).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between">
                                                            <span>{k}</span>
                                                            <span className="font-bold">{Array.isArray(v) ? v.join(" - ") : String(v)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-[9px] text-gray-400 mt-auto uppercase tracking-wider">
                                                Origin: {rule.tradition}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 3: Recommended Materials */}
                <div className="page-break-inside-avoid">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        4. Suggested Material Palette
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        The following sustainable materials are recommended for fulfilling the prescriptive rules in this architectural brief, prioritized by low embodied carbon and regional availability.
                    </p>

                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-primary-50 text-primary-900 border-b border-primary-200">
                                <th className="py-3 px-4 font-semibold">Material</th>
                                <th className="py-3 px-4 font-semibold">Category</th>
                                <th className="py-3 px-4 font-semibold text-right">Embodied Carbon</th>
                                <th className="py-3 px-4 font-semibold text-center">Thermal (k)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {materials.slice(0, 4).map(mat => ( // Just show top 4 for the report
                                <tr key={mat.material_id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-gray-900">{mat.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">{mat.region}</div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 capitalize">{mat.category}</td>
                                    <td className="py-3 px-4 text-right">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold
                      ${mat.sustainability.embodied_carbon < 0 ? "bg-emerald-100 text-emerald-700" :
                                                mat.sustainability.embodied_carbon < 20 ? "bg-blue-100 text-blue-700" :
                                                    "bg-orange-100 text-orange-700"}`}
                                        >
                                            {mat.sustainability.embodied_carbon} <span className="text-[9px]">kgCO2e</span>
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-mono text-xs text-gray-600">
                                        {mat.properties.thermal_conductivity}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
                    <p>CRTAIS — Climate-Responsive Traditional Architecture Intelligence System</p>
                    <p>Report generated purely for preliminary design planning.</p>
                </div>

            </div>
        </div>
    );
}
