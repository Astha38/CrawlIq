'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ExportReportModal from '@/components/ExportReportModal';
import { api } from '@/lib/api';
import { Site, CrawlScore, Issue } from '@/types';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';

export default function ReportsPage() {
  const [site, setSite] = useState<Site | null>(null);
  const [score, setScore] = useState<CrawlScore | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const sites = await api.getSites();
      const scoreData = await api.getCrawlScore('crawl-101');
      const issuesData = await api.getCrawlIssues('crawl-101');
      if (sites.length > 0) setSite(sites[0]);
      setScore(scoreData);
      setIssues(issuesData);
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0f] text-slate-100 min-h-screen">
      <Navbar />

      <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-[#ff5733]" />
              SEO Audit Report Exporter & Analytics Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Generate executive PDF summaries or raw CSV database exports for client delivery and team sharing.
            </p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff5733]/10 border border-[#ff5733]/20 text-[#ff5733] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-white text-lg">Executive PDF Audit Document</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Includes score breakdown, top critical vulnerabilities, PageSpeed vital scores, and action plans.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 bg-[#ff5733] hover:bg-[#e04826] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#ff5733]/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Download className="w-4 h-4" />
              Generate PDF Report
            </button>
          </div>

          <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-white text-lg">Raw CSV Issue Data Spreadsheet</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full export of all crawled pages, HTTP status codes, missing meta elements, and affected URLs for spreadsheet analysis.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 bg-[#202025] hover:bg-[#2a2a30] text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-[#2c2c33] mt-4"
            >
              <Download className="w-4 h-4 text-[#ff5733]" />
              Export CSV Dataset
            </button>
          </div>
        </div>
      </main>

      <ExportReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        site={site || undefined}
        score={score || undefined}
        issues={issues}
      />
    </div>
  );
}
