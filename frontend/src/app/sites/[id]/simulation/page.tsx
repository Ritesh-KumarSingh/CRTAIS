"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Activity, PlayCircle, Loader2, Info } from "lucide-react";
import { sitesApi, simulationApi, type Site, type ThermalSimulationResponse, type AirflowSimulationResponse } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Synthetic outdoor temp profile (e.g. desert-like swing)
const DEFAULT_T_OUT = [16, 15, 14, 13, 13, 14, 16, 19, 23, 27, 30, 32, 33, 33, 32, 30, 27, 24, 21, 19, 18, 17, 17, 16];

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

export default function SiteSimulationPage() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.id as string;

    const [site, setSite] = useState<Site | null>(null);
    const [loadingSite, setLoadingSite] = useState(true);

    const [rVal, setRVal] = useState(2.5); // K*m2/W
    const [cVal, setCVal] = useState(100000); // J/K*m2

    // Airflow states
    const [inletArea, setInletArea] = useState(2.0); // m2
    const [roomVolume, setRoomVolume] = useState(50.0); // m3
    const [airflowData, setAirflowData] = useState<AirflowSimulationResponse | null>(null);

    const [simulationData, setSimulationData] = useState<ThermalSimulationResponse | null>(null);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        sitesApi.get(siteId)
            .then(setSite)
            .catch((err) => {
                const fallbackSite = fallbackSitesData.find(s => s.id === siteId);
                if (fallbackSite) {
                    setSite(fallbackSite);
                } else {
                    console.error("Failed to load site:", err);
                }
            })
            .finally(() => setLoadingSite(false));
    }, [siteId]);

    const runAirflowSim = async (area: number, vol: number) => {
        try {
            const data = await simulationApi.simulateAirflow({
                inlet_area_sqm: area,
                wind_speed_ms: 3.0, // Fixed assumption for now
                room_volume_m3: vol
            });
            setAirflowData(data);
        } catch (err) {
            console.error("Airflow sim failed", err);
        }
    };

    const handleAirflowChange = (type: 'inlet' | 'volume', val: number) => {
        if (type === 'inlet') {
            setInletArea(val);
            runAirflowSim(val, roomVolume);
        } else {
            setRoomVolume(val);
            runAirflowSim(inletArea, val);
        }
    };

    const handleSimulate = async () => {
        setSimulating(true);
        try {
            const data = await simulationApi.simulateThermal({
                r_val: rVal,
                c_val: cVal,
                t_in_initial: 22.0,
                t_out_series: DEFAULT_T_OUT,
                internal_gain: 5.0, // 5 W/m2 base
            });
            setSimulationData(data);
            runAirflowSim(inletArea, roomVolume); // Also run airflow on init
        } catch (err) {
            console.error("Simulation failed:", err);
            alert("Simulation failed. Check console.");
        } finally {
            setSimulating(false);
        }
    };

    // Auto-run once on load if site exists
    useEffect(() => {
        handleSimulate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const chartData = DEFAULT_T_OUT.map((tOut, i) => ({
        hour: `${i}:00`,
        tOut,
        tIn: simulationData ? simulationData.t_in_series[i] : null
    }));

    if (loadingSite) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    if (!site) return null;

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in relative">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 mb-8 -mx-8 px-8 flex items-center justify-between">
                <button
                    onClick={() => router.push(`/sites/${site.id}`)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Site
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
                    <Activity className="w-8 h-8 text-primary-400" />
                    Thermal Simulation: {site.name}
                </h1>
                <p className="text-slate-500 mt-2">
                    Hourly explicit 1R1C thermal model. Adjust envelope thermal properties to see the effect on indoor temperatures.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 lg:col-span-1">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6">Envelope Properties</h2>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-500">Thermal Resistance (R)</label>
                                <span className="text-sm font-mono text-primary-400">{rVal.toFixed(1)} K·m²/W</span>
                            </div>
                            <input
                                type="range" min="0.5" max="10" step="0.1"
                                value={rVal} onChange={e => setRVal(Number(e.target.value))}
                                className="w-full accent-primary-500"
                            />
                            <p className="text-xs text-slate-500 mt-2">Higher R = better insulation. <br /> (e.g. 0.5 = Uninsulated brick, 5.0 = Passive House wall)</p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-500">Thermal Mass (C)</label>
                                <span className="text-sm font-mono text-cyan-400">{(cVal / 1000).toFixed(0)} kJ/K·m²</span>
                            </div>
                            <input
                                type="range" min="10000" max="500000" step="10000"
                                value={cVal} onChange={e => setCVal(Number(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                            <p className="text-xs text-slate-500 mt-2">Higher C = more thermal mass. <br /> (e.g. 50kJ = lightweight timber, 300kJ = heavy masonry)</p>
                        </div>

                        <button
                            onClick={handleSimulate}
                            disabled={simulating}
                            className="w-full btn-primary flex items-center justify-center gap-2 mt-8"
                        >
                            {simulating ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                            Run Simulation
                        </button>

                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-800 mb-6">Ventilation & Airflow</h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-slate-500">Inlet Area (m²)</label>
                                        <span className="text-sm font-mono text-emerald-400">{inletArea.toFixed(1)} m²</span>
                                    </div>
                                    <input
                                        type="range" min="0.5" max="10.0" step="0.5"
                                        value={inletArea} onChange={e => handleAirflowChange('inlet', Number(e.target.value))}
                                        className="w-full accent-emerald-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Total openable window area facing the wind.</p>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-slate-500">Room Volume (m³)</label>
                                        <span className="text-sm font-mono text-indigo-400">{roomVolume.toFixed(0)} m³</span>
                                    </div>
                                    <input
                                        type="range" min="20" max="500" step="10"
                                        value={roomVolume} onChange={e => handleAirflowChange('volume', Number(e.target.value))}
                                        className="w-full accent-indigo-500"
                                    />
                                </div>

                                {airflowData && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-emerald-200">Air Changes Per Hour (ACH)</span>
                                            <span className="text-xl font-bold text-emerald-400">{airflowData.ach}</span>
                                        </div>
                                        <div className="w-full bg-emerald-950 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${airflowData.ach > 10 ? 'bg-emerald-400' : airflowData.ach > 4 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                                style={{ width: `${Math.min((airflowData.ach / 20) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-emerald-200/50 mt-1">
                                            <span>Stuffy (&lt;4)</span>
                                            <span>Good (4-10)</span>
                                            <span>Breezy (&gt;10)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Graph View */}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6">24-Hour Temperature Profile</h2>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="hour" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} />
                                <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} domain={[10, 40]} unit="°C" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#ffffff20', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line
                                    type="monotone"
                                    name="Outdoor Temp (T_out)"
                                    dataKey="tOut"
                                    stroke="#64748b"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    name="Indoor Temp (T_in)"
                                    dataKey="tIn"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-sm text-blue-200">
                        <Info className="w-5 h-5 flex-shrink-0 text-blue-400" />
                        <p>
                            Observe how increasing the <strong>Thermal Mass (C)</strong> flattens the indoor temperature curve (thermal lag), while increasing <strong>Insulation (R)</strong> limits the direct temperature exchange with the outdoors.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
