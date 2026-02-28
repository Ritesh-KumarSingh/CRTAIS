import React from 'react';

interface PlanOverlayProps {
    className?: string;
    climateZone?: string;
}

export default function PlanOverlay({ className = "", climateZone = "Hot-Dry" }: PlanOverlayProps) {
    // We adjust the SVG rendering slightly based on climate zone to demonstrate AI logic.
    // For example, Hot-Dry might show thicker thermal mass walls on the exterior.

    const isHotClimate = climateZone.toLowerCase().includes('hot');
    const wallThickness = isHotClimate ? 30 : 15;

    return (
        <div className={`relative w-full overflow-hidden bg-slate-50/50 rounded-xl border border-slate-200 p-8 ${className}`}>
            <svg
                viewBox="0 0 800 600"
                className="w-full h-auto drop-shadow-sm"
                style={{ maxHeight: '400px' }}
            >
                {/* Background Grid */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="800" height="600" fill="url(#grid)" />

                {/* North Arrow */}
                <g transform="translate(40, 40)">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#94a3b8" strokeWidth="2" />
                    <path d="M20 8 L28 32 L20 26 L12 32 Z" fill="#64748b" />
                    <text x="20" y="55" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="bold">N</text>
                </g>

                {/* Main Building Mass */}
                <g transform="translate(200, 150)">
                    {/* Shadow */}
                    <rect x="10" y="10" width="400" height="300" fill="#cbd5e1" opacity="0.3" rx="4" />

                    {/* Floor Area */}
                    <rect x="0" y="0" width="400" height="300" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />

                    {/* Walls Context layer */}
                    <path
                        d={`M 0 0 h 400 v 300 h -400 v -300 M ${wallThickness} ${wallThickness} v ${300 - wallThickness * 2} h ${400 - wallThickness * 2} v -${300 - wallThickness * 2} h -${400 - wallThickness * 2}`}
                        fill="#cbd5e1"
                        fillRule="evenodd"
                    />

                    {/* Windows (Hot climates have smaller windows on East/West) */}
                    {/* North Window */}
                    <rect x="150" y="-5" width="100" height={wallThickness + 10} fill="#bae6fd" stroke="#0ea5e9" strokeWidth="2" />

                    {/* South Windows (Operable for cross vent) */}
                    <rect x="100" y={295 - wallThickness} width="80" height={wallThickness + 10} fill="#bae6fd" stroke="#0ea5e9" strokeWidth="2" />
                    <rect x="220" y={295 - wallThickness} width="80" height={wallThickness + 10} fill="#bae6fd" stroke="#0ea5e9" strokeWidth="2" />

                    {/* Internal Thermal Mass Wall (e.g. Trombe wall or central stone column) */}
                    {isHotClimate && (
                        <rect x="180" y="100" width="40" height="150" fill="#94a3b8" />
                    )}

                    {/* Labels */}
                    <text x="50" y="50" fontSize="14" fill="#64748b" fontWeight="bold">Living / Studio</text>
                    <text x="50" y="70" fontSize="12" fill="#94a3b8">Cross Ventilation Path</text>

                    {/* Airflow Arrows */}
                    <path d="M 140 330 C 140 250, 180 150, 200 -20" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="8,4" markerEnd="url(#arrow)" />
                    <path d="M 260 330 C 260 250, 220 150, 200 -20" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="8,4" markerEnd="url(#arrow)" />

                    {/* Arrow Definitions */}
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#22d3ee" />
                        </marker>
                    </defs>
                </g>

                {/* Legend */}
                <g transform="translate(620, 460)">
                    <rect x="0" y="0" width="160" height="120" fill="#ffffff" stroke="#e2e8f0" rx="4" />
                    <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#475569">Legend</text>

                    <rect x="10" y="35" width="20" height="10" fill="#cbd5e1" />
                    <text x="40" y="45" fontSize="12" fill="#64748b">Insulated Envelope</text>

                    <rect x="10" y="55" width="20" height="10" fill="#bae6fd" stroke="#0ea5e9" />
                    <text x="40" y="65" fontSize="12" fill="#64748b">Operable Glazing</text>

                    <rect x="10" y="75" width="20" height="10" fill="#94a3b8" />
                    <text x="40" y="85" fontSize="12" fill="#64748b">Thermal Mass</text>

                    <path d="M 10 105 L 30 105" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4,2" />
                    <text x="40" y="105" fontSize="12" fill="#64748b">Airflow Path</text>
                </g>
            </svg>
        </div>
    );
}
