'use client';

import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";
import { Map } from "@/components/map/Map";
import { Sidebar } from "@/components/ui/Sidebar";
import { Legend } from "@/components/ui/Legend";

export default function Home() {
  return (
    <main className="flex h-screen w-screen bg-gray-100">
      <Sidebar />
      <div className="flex-grow h-full relative">
        <Map />
        <AnalysisPanel />
        <Legend />
      </div>
    </main>
  );
}