"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MapPin,
    Map,
    BookOpen,
    Layers,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    Compass,
} from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/site-intake", label: "Site Intake", icon: MapPin },
    { href: "/map-view", label: "Map View", icon: Map },
    { href: "/rules", label: "Rule Browser", icon: BookOpen },
    { href: "/materials", label: "Materials", icon: Layers, disabled: true },
    { href: "/reports", label: "Reports", icon: FileText, disabled: true },
    { href: "/settings", label: "Settings", icon: Settings, disabled: true },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={`fixed top-0 left-0 h-screen z-50 flex flex-col
        bg-white/90 backdrop-blur-xl border-r border-slate-200
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]"}`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <Compass className="w-5 h-5 text-slate-800" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1 className="text-base font-bold tracking-tight gradient-text">
                            CRTAIS
                        </h1>
                        <p className="text-[10px] text-slate-500 leading-tight -mt-0.5">
                            Architecture Intelligence
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.disabled ? "#" : item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${item.disabled
                                    ? "opacity-30 cursor-not-allowed"
                                    : isActive
                                        ? "bg-primary-500/15 text-primary-400 shadow-glow"
                                        : "text-slate-500 hover:text-slate-500 hover:bg-slate-100"
                                }`}
                            onClick={(e) => item.disabled && e.preventDefault()}
                        >
                            <Icon
                                className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${isActive ? "text-primary-400" : "text-slate-500 group-hover:text-slate-500"
                                    }`}
                            />
                            {!collapsed && (
                                <span className="text-sm font-medium truncate animate-fade-in">
                                    {item.label}
                                </span>
                            )}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse-glow" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center justify-center h-12 border-t border-slate-200 text-slate-500 hover:text-slate-500 hover:bg-slate-100 transition-all duration-200"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>
        </aside>
    );
}
