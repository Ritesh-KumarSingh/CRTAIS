/**
 * CRTAIS API client — connects the Next.js frontend to the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ─── Types ─── */

export interface GeoJSONPolygon {
    type: "Polygon";
    coordinates: number[][][];
}

export interface SiteCreate {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    climate_zone: string;
    typology?: string;
    vernacular_tradition?: string;
    plot_area_sqm?: number;
    polygon?: GeoJSONPolygon;
}

export interface Site {
    id: string;
    name: string;
    description: string | null;
    latitude: number;
    longitude: number;
    climate_zone: string;
    typology: string | null;
    vernacular_tradition: string | null;
    plot_area_sqm: number | null;
    polygon: GeoJSONPolygon | null;
    created_at: string;
    updated_at: string;
}

export interface SiteListResponse {
    total: number;
    sites: Site[];
}

export interface RuleSource {
    type: string;
    reference: string;
    year?: number;
    url?: string;
}

export interface RuleRecommendation {
    summary: string;
    detail?: string;
    parameters?: Record<string, unknown>;
}

export interface Rule {
    rule_id: string;
    name: string;
    description: string;
    region: string;
    climate_zone: string;
    tradition: string;
    category?: string;
    condition?: Record<string, unknown>;
    recommendation: RuleRecommendation;
    confidence?: number;
    sources: RuleSource[];
    tags: string[];
}

export interface RuleListResponse {
    total: number;
    rules: Rule[];
}

export interface MaterialProperties {
    thermal_conductivity: number;
    density: number;
    specific_heat: number;
}

export interface MaterialSustainability {
    embodied_carbon: number;
    local_availability: string;
    recyclability: string;
}

export interface Material {
    material_id: string;
    name: string;
    category: string;
    description: string;
    region: string;
    properties: MaterialProperties;
    sustainability: MaterialSustainability;
    tags: string[];
}

export interface MaterialListResponse {
    total: number;
    materials: Material[];
}

export interface ThermalSimulationRequest {
    r_val: number;
    c_val: number;
    t_in_initial: number;
    t_out_series: number[];
    internal_gain: number;
    solar_gain_series?: number[];
    time_step?: number;
}

export interface ThermalSimulationResponse {
    t_in_series: number[];
    heat_flow_series: number[];
}

export interface AirflowSimulationRequest {
    inlet_area_sqm: number;
    wind_speed_ms: number;
    discharge_coef?: number;
    wind_angle_modifier?: number;
    room_volume_m3: number;
}

export interface AirflowSimulationResponse {
    flow_rate_m3s: number;
    ach: number;
}

/* ─── Fetch Helpers ─── */

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "Unknown error");
        throw new Error(`API ${res.status}: ${text}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

/* ─── Materials API ─── */

export const materialsApi = {
    list: (params?: { category?: string; q?: string }) => {
        const query = new URLSearchParams();
        if (params?.category) query.set("category", params.category);
        if (params?.q) query.set("q", params.q);
        const qs = query.toString();
        return apiFetch<MaterialListResponse>(`/api/materials/${qs ? `?${qs}` : ""}`);
    },
};

/* ─── Sites API ─── */

export const sitesApi = {
    list: (params?: { climate_zone?: string; skip?: number; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.climate_zone) query.set("climate_zone", params.climate_zone);
        if (params?.skip) query.set("skip", String(params.skip));
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<SiteListResponse>(`/api/sites/${qs ? `?${qs}` : ""}`);
    },

    get: (id: string) => apiFetch<Site>(`/api/sites/${id}`),

    getEvaluatedRules: (id: string) => apiFetch<RuleListResponse>(`/api/evaluate/${id}`),

    create: (data: SiteCreate) =>
        apiFetch<Site>("/api/sites/", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiFetch<void>(`/api/sites/${id}`, { method: "DELETE" }),
};

/* ─── Rules API ─── */

export const rulesApi = {
    list: (params?: {
        climate_zone?: string;
        category?: string;
        region?: string;
        q?: string;
        skip?: number;
        limit?: number;
    }) => {
        const query = new URLSearchParams();
        if (params?.climate_zone) query.set("climate_zone", params.climate_zone);
        if (params?.category) query.set("category", params.category);
        if (params?.region) query.set("region", params.region);
        if (params?.q) query.set("q", params.q);
        if (params?.skip) query.set("skip", String(params.skip));
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return apiFetch<RuleListResponse>(`/api/rules/${qs ? `?${qs}` : ""}`);
    },

    get: (ruleId: string) => apiFetch<Rule>(`/api/rules/${ruleId}`),
};

/* ─── Simulation API ─── */

export const simulationApi = {
    simulateThermal: async (data: ThermalSimulationRequest) => {
        const res = await fetch(`${API_BASE}/api/simulate/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "Unknown error");
            throw new Error(`API ${res.status}: ${text}`);
        }
        return res.json() as Promise<ThermalSimulationResponse>;
    },
    simulateAirflow: async (data: AirflowSimulationRequest) => {
        const res = await fetch(`${API_BASE}/api/simulate/airflow/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "Unknown error");
            throw new Error(`API ${res.status}: ${text}`);
        }
        return res.json() as Promise<AirflowSimulationResponse>;
    },
};

/* ─── Health ─── */


export const healthApi = {
    check: () => apiFetch<{ status: string; service: string; version: string }>("/api/health"),
};
