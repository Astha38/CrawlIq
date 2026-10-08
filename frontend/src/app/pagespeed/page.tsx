'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PageSpeedGauge from '@/components/PageSpeedGauge';
import { api } from '@/lib/api';
import { PageSpeedMetrics } from '@/types';
import { Gauge, RefreshCw } from 'lucide-react';

export default function PageSpeedPage() {
  const [metrics, setMetrics] = useState<PageSpeedMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPageSpeed() {
      try {
        const data = await api.getPageSpeed('crawl-101');
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPageSpeed();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0f] text-slate-100 min-h-screen">
      <Navbar />

      <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Gauge className="w-6 h-6 text-[#ff5733]" />
              PageSpeed Insights & Core Web Vitals Visualizer
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Google Lighthouse performance analytics, user experience field metrics, and asset optimization diagnostics.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 800);
            }}
            className="flex items-center gap-2 bg-[#16161a] hover:bg-[#202025] text-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs border border-[#242429] transition-all self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#ff5733] ${loading ? 'animate-spin' : ''}`} />
            Refresh PageSpeed
          </button>
        </div>

        {metrics && <PageSpeedGauge metrics={metrics} />}
      </main>
    </div>
  );
}
