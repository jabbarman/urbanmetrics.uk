import type { Metadata, Route } from "next";
import Link from "next/link";
import { Instrument_Sans, Space_Grotesk } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";

import { siteCopy } from "@/content/site";

import "./globals.css";

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: `${siteCopy.title} | Regional indicator overlays`,
  description: siteCopy.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${bodyFont.variable} ${displayFont.variable}`} lang="en">
      <body className="font-[var(--font-body)] text-slate-950 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 md:px-8 lg:px-10">
          <nav className="mb-4 flex flex-wrap items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 px-3 py-2 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            <Link className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950" href="/">
              Overview
            </Link>
            <Link
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              href={"/regional-context" as Route}
            >
              Regional Context
            </Link>
            <Link
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              href={"/health-access" as Route}
            >
              Health Access
            </Link>
            <Link
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              href="/status"
            >
              Service Status
            </Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
