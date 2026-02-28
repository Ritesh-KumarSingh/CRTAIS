import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "CRTAIS — Climate-Responsive Traditional Architecture",
  description:
    "An intelligent platform encoding vernacular architectural wisdom, performing thermal and airflow simulations, and generating practitioner-ready reports for climate-responsive building design.",
  keywords: [
    "vernacular architecture",
    "climate responsive design",
    "thermal simulation",
    "sustainable building",
    "traditional architecture",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-[var(--sidebar-collapsed)] lg:ml-[var(--sidebar-width)] transition-all duration-300">
          <div className="p-6 lg:p-8 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
