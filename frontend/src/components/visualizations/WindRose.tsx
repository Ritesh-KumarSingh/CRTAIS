"use client";

import React from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface WindDataPoint {
    direction: string;
    speed_1_to_3: number;
    speed_3_to_5: number;
    speed_5_plus: number;
}

// Sample data for a Wind Rose
const sampleData: WindDataPoint[] = [
    { direction: "N", speed_1_to_3: 15, speed_3_to_5: 10, speed_5_plus: 5 },
    { direction: "NE", speed_1_to_3: 20, speed_3_to_5: 25, speed_5_plus: 10 },
    { direction: "E", speed_1_to_3: 30, speed_3_to_5: 15, speed_5_plus: 2 },
    { direction: "SE", speed_1_to_3: 10, speed_3_to_5: 5, speed_5_plus: 1 },
    { direction: "S", speed_1_to_3: 5, speed_3_to_5: 2, speed_5_plus: 0 },
    { direction: "SW", speed_1_to_3: 8, speed_3_to_5: 4, speed_5_plus: 1 },
    { direction: "W", speed_1_to_3: 25, speed_3_to_5: 35, speed_5_plus: 15 },
    { direction: "NW", speed_1_to_3: 12, speed_3_to_5: 8, speed_5_plus: 3 },
];

export default function WindRose({ data = sampleData }: { data?: WindDataPoint[] }) {
    return (
        <div className="w-full h-[300px] bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center p-4">
            <h3 className="text-sm font-semibold text-slate-500 mb-2 mt-2 w-full text-left">
                Annual Wind Rose
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="direction" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, "auto"]} tick={false} axisLine={false} />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(15,23,42,0.9)",
                                borderColor: "rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "white"
                            }}
                            itemStyle={{ color: "rgba(255,255,255,0.8)" }}
                        />

                        {/* Layers for different speeds */}
                        <Radar
                            name="> 5 m/s"
                            dataKey="speed_5_plus"
                            stroke="#e0654e"
                            fill="#e0654e"
                            fillOpacity={0.8}
                        />
                        <Radar
                            name="3-5 m/s"
                            dataKey="speed_3_to_5"
                            stroke="#36aaf5"
                            fill="#36aaf5"
                            fillOpacity={0.6}
                        />
                        <Radar
                            name="1-3 m/s"
                            dataKey="speed_1_to_3"
                            stroke="#0c8ee6"
                            fill="#0c8ee6"
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-1">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#0c8ee6] opacity-40"></div>1-3 m/s</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#36aaf5] opacity-60"></div>3-5 m/s</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#e0654e] opacity-80"></div>&gt; 5 m/s</div>
            </div>
        </div>
    );
}
