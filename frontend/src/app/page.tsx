import Link from "next/link";
import {
  MapPin,
  Map,
  BookOpen,
  ArrowRight,
  Thermometer,
  Wind,
  Sun,
  Layers,
  Compass,
} from "lucide-react";

const quickActions = [
  {
    title: "New Site Intake",
    description: "Register a new site with coordinates and plot geometry",
    href: "/site-intake",
    icon: MapPin,
    gradient: "from-primary-600 to-primary-400",
    shadowClass: "hover:shadow-glow",
  },
  {
    title: "Map View",
    description: "Explore pilot sites with geospatial overlays",
    href: "/map-view",
    icon: Map,
    gradient: "from-emerald-600 to-emerald-400",
    shadowClass: "hover:shadow-[0_0_24px_rgba(52,211,153,0.15)]",
  },
  {
    title: "Browse Rules",
    description: "View vernacular rules with provenance tracking",
    href: "/rules",
    icon: BookOpen,
    gradient: "from-accent-600 to-accent-400",
    shadowClass: "hover:shadow-glow-accent",
  },
];

const stats = [
  { label: "Pilot Sites", value: "3", icon: Compass, color: "text-primary-400" },
  { label: "Vernacular Rules", value: "6", icon: BookOpen, color: "text-accent-400" },
  { label: "Climate Zones", value: "2", icon: Thermometer, color: "text-emerald-400" },
  { label: "Materials", value: "—", icon: Layers, color: "text-earth-400" },
];

const capabilities = [
  {
    title: "Solar Analysis",
    description: "Sun path computation and shading analysis using pvlib",
    icon: Sun,
    status: "Sprint 2",
  },
  {
    title: "Thermal Simulation",
    description: "Hourly lumped-capacitance RC thermal model",
    icon: Thermometer,
    status: "Phase 2",
  },
  {
    title: "Airflow Approximation",
    description: "Steady-state wind pressure network model",
    icon: Wind,
    status: "Phase 2",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-card p-8 lg:p-12">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Platform Active
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">
            Climate-Responsive{" "}
            <span className="gradient-text">Traditional Architecture</span>
          </h1>
          <p className="text-white/50 max-w-2xl text-base lg:text-lg leading-relaxed">
            Encode vernacular wisdom, simulate thermal performance, and generate
            actionable masonry briefs — all informed by centuries of climate-adapted
            building traditions.
          </p>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass-card p-5 flex items-center gap-4 animate-slide-up"
            >
              <div className={`w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-white/80 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`glass-card-hover p-6 group block ${action.shadowClass}`}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">
                  {action.title}
                </h3>
                <p className="text-sm text-white/40 mb-4 leading-relaxed">
                  {action.description}
                </p>
                <div className="flex items-center text-sm font-medium text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Get started
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Upcoming Capabilities */}
      <section>
        <h2 className="text-lg font-semibold text-white/80 mb-4">
          Simulation Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} className="glass-card p-5 opacity-60">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-5 h-5 text-white/30" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">
                    {cap.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white/50 mb-1">
                  {cap.title}
                </h3>
                <p className="text-xs text-white/25 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
