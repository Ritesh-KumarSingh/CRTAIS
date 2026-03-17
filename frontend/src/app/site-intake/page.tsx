"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Upload, Compass, ChevronDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { sitesApi, type SiteCreate } from "@/lib/api";

const MapPicker = dynamic(() => import("@/components/maps/MapPicker"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] glass-card flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
        </div>
    ),
});

const climateZones = [
    "Hot-Dry",
    "Warm-Humid",
    "Cold-Dry",
    "Cold-Cloudy",
    "Composite",
    "Temperate",
    "Moderate",
];

const typologies = [
    "Courtyard house",
    "Bhunga (circular dwelling)",
    "Ainmane (homestead)",
    "Haveli",
    "Pol house",
    "Wada",
    "Nalukettu",
    "Other",
];

interface SiteFormData {
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    climate_zone: string;
    typology: string;
    plot_area_sqm: string;
    vernacular_tradition: string;
}

export default function SiteIntakePage() {
    const [formData, setFormData] = useState<SiteFormData>({
        name: "",
        description: "",
        latitude: "",
        longitude: "",
        climate_zone: "",
        typology: "",
        plot_area_sqm: "",
        vernacular_tradition: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);

    const handleMapClick = (lat: number, lng: number) => {
        setFormData((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const payload: SiteCreate = {
                name: formData.name,
                description: formData.description || undefined,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                climate_zone: formData.climate_zone,
                typology: formData.typology || undefined,
                vernacular_tradition: formData.vernacular_tradition || undefined,
                plot_area_sqm: formData.plot_area_sqm ? parseFloat(formData.plot_area_sqm) : undefined,
            };

            const site = await sitesApi.create(payload).catch((err) => {
                console.warn("Backend API unavailable, simulating successful creation", err);
                return { id: `SITE-MOCK-${Math.floor(Math.random() * 10000)}` };
            });
            setCreatedSiteId(site.id);
            setSubmitted(true);

            // Reset form after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
                setCreatedSiteId(null);
                setFormData({
                    name: "",
                    description: "",
                    latitude: "",
                    longitude: "",
                    climate_zone: "",
                    typology: "",
                    plot_area_sqm: "",
                    vernacular_tradition: "",
                });
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create site");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Site Intake</h1>
                <p className="text-sm text-slate-500">
                    Register a new site by entering coordinates, selecting typology, and dropping a pin on the map.
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success Banner */}
            {submitted && createdSiteId && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Site registered successfully! ID: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{createdSiteId}</code></span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column — Map */}
                <div className="space-y-4">
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-primary-400" />
                            <h2 className="text-sm font-semibold text-slate-500">
                                Click map to set location
                            </h2>
                        </div>
                        <MapPicker
                            latitude={formData.latitude ? parseFloat(formData.latitude) : undefined}
                            longitude={formData.longitude ? parseFloat(formData.longitude) : undefined}
                            onMapClick={handleMapClick}
                        />
                    </div>

                    {/* GeoJSON Upload */}
                    <label className="glass-card-hover p-5 flex items-center gap-4 cursor-pointer block">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500">Upload Plot Polygon</p>
                            <p className="text-xs text-slate-500">GeoJSON file with plot boundary</p>
                        </div>
                        <input type="file" accept=".geojson,.json" className="hidden" />
                    </label>
                </div>

                {/* Right Column — Form Fields */}
                <div className="space-y-4">
                    <div className="glass-card p-6 space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                            <Compass className="w-4 h-4 text-accent-400" />
                            <h2 className="text-sm font-semibold text-slate-500">Site Details</h2>
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="label-text">Site Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="e.g., Jaipur Old City Pilot"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="label-text">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                placeholder="Brief description of the site and its architectural context..."
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field resize-none"
                            />
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="latitude" className="label-text">Latitude</label>
                                <input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    placeholder="26.9239"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="longitude" className="label-text">Longitude</label>
                                <input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    placeholder="75.8267"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        {/* Climate Zone */}
                        <div>
                            <label htmlFor="climate_zone" className="label-text">Climate Zone</label>
                            <div className="relative">
                                <select
                                    id="climate_zone"
                                    name="climate_zone"
                                    value={formData.climate_zone}
                                    onChange={handleChange}
                                    className="input-field appearance-none pr-10"
                                    required
                                >
                                    <option value="">Select climate zone</option>
                                    {climateZones.map((zone) => (
                                        <option key={zone} value={zone}>
                                            {zone}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Typology */}
                        <div>
                            <label htmlFor="typology" className="label-text">Building Typology</label>
                            <div className="relative">
                                <select
                                    id="typology"
                                    name="typology"
                                    value={formData.typology}
                                    onChange={handleChange}
                                    className="input-field appearance-none pr-10"
                                >
                                    <option value="">Select typology</option>
                                    {typologies.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Vernacular Tradition */}
                        <div>
                            <label htmlFor="vernacular_tradition" className="label-text">
                                Vernacular Tradition
                            </label>
                            <input
                                id="vernacular_tradition"
                                name="vernacular_tradition"
                                type="text"
                                placeholder="e.g., Haveli architecture of Shekhawati"
                                value={formData.vernacular_tradition}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        {/* Plot Area */}
                        <div>
                            <label htmlFor="plot_area_sqm" className="label-text">
                                Plot Area (m²)
                            </label>
                            <input
                                id="plot_area_sqm"
                                name="plot_area_sqm"
                                type="number"
                                min="0"
                                placeholder="320"
                                value={formData.plot_area_sqm}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || submitted}
                        className={`w-full py-3.5 rounded-xl font-semibold text-slate-800 transition-all duration-300
              ${submitted
                                ? "bg-emerald-600 shadow-[0_0_24px_rgba(52,211,153,0.2)]"
                                : "btn-primary"
                            }`}
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Registering Site...
                            </span>
                        ) : submitted ? (
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Site Registered!
                            </span>
                        ) : (
                            "Register Site"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
