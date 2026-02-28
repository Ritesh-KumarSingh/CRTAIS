"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface SunPathData {
    time: string;
    summer_alt: number;
    winter_alt: number;
}

// Simulated data for summer vs winter solstice
const sampleData = [
    { time: "06:00", summer_alt: 10, winter_alt: -5 },
    { time: "08:00", summer_alt: 35, winter_alt: 15 },
    { time: "10:00", summer_alt: 60, winter_alt: 30 },
    { time: "12:00", summer_alt: 82, winter_alt: 45 },
    { time: "14:00", summer_alt: 60, winter_alt: 30 },
    { time: "16:00", summer_alt: 35, winter_alt: 15 },
    { time: "18:00", summer_alt: 10, winter_alt: -5 },
];

export default function SunPath({ data = sampleData }: { data?: SunPathData[] }) {
    return (
        <div className="w-full h-[300px] bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white/70">
                    Solar Elevation (Sun Path)
                </h3>
                <div className="flex items-center gap-3 text-[10px] text-white/40">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded bg-amber-500"></div> Summer Solstice
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded bg-sky-500"></div> Winter Solstice
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSummer" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorWinter" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 90]}
                            ticks={[0, 30, 60, 90]}
                            unit="°"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(15,23,42,0.9)",
                                borderColor: "rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "white"
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="summer_alt"
                            name="Summer Elevation"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorSummer)"
                        />
                        <Area
                            type="monotone"
                            dataKey="winter_alt"
                            name="Winter Elevation"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorWinter)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
