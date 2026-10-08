'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import IssueCard from '@/components/IssueCard';
import ExportReportModal from '@/components/ExportReportModal';
import { api } from '@/lib/api';
import { Issue, Severity, IssueCategory, CrawlScore } from '@/types';
import { 
  FileSearch, 
  Filter, 
  Search, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  Download,
  Sparkles
} from 'lucide-react';

export default function AuditsPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [score, setScore] = useState<CrawlScore | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    async function loadIssues() {
      try {
        const issuesData = await api.getCrawlIssues('crawl-101');
        const scoreData = await api.getCrawlScore('crawl-101');
        setIssues(issuesData);
        setScore(scoreData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadIssues();
  }, []);

  const filteredIssues = issues.filter((iss) => {
    if (selectedSeverity !== 'ALL' && iss.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && iss.category !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        iss.title.toLowerCase().includes(term) ||
        iss.description.toLowerCase().includes(term) ||
        iss.affected_url.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0f] text-slate-100 min-h-screen">
      <Navbar />

      <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <FileSearch className="w-6 h-6 text-[#ff5733]" />
              SEO Audit Report & Diagnostics Breakdown
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Detailed list of detected SEO errors, accessibility issues, performance bottlenecks, and canonical warnings.
            </p>
          </div>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 bg-[#ff5733] hover:bg-[#e04826] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-[#ff5733]/20 transition-all self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            Export Audit PDF / CSV
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by title, URL or rule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#101012] text-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-full border border-[#202025] focus:outline-none focus:border-[#ff5733] placeholder:text-slate-500"
              />
            </div>

            {/* Severity Tabs */}
            <div className="flex items-center gap-2 bg-[#101012] p-1.5 rounded-xl border border-[#202025] w-full md:w-auto overflow-x-auto">
              {[
                { label: 'All Severities', value: 'ALL' },
                { label: 'Critical', value: 'CRITICAL', icon: AlertOctagon, color: 'text-rose-400' },
                { label: 'Warning', value: 'WARNING', icon: AlertTriangle, color: 'text-amber-400' },
                { label: 'Info', value: 'INFO', icon: Info, color: 'text-sky-400' },
              ].map((sev) => {
                const Icon = sev.icon;
                const isActive = selectedSeverity === sev.value;

                return (
                  <button
                    key={sev.value}
                    onClick={() => setSelectedSeverity(sev.value as Severity | 'ALL')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#25252a] text-white shadow-sm border border-[#323238]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {Icon && <Icon className={`w-3.5 h-3.5 ${sev.color}`} />}
                    {sev.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-[#202025]">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {['ALL', 'META', 'CONTENT', 'PERFORMANCE', 'INDEXABILITY', 'SECURITY', 'STRUCTURE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as IssueCategory | 'ALL')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#ff5733]/20 text-[#ff5733] border border-[#ff5733]/40 font-bold'
                    : 'bg-[#101012] text-slate-400 border border-[#202025] hover:bg-[#202025]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Issue Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {filteredIssues.length} issues</span>
            {selectedSeverity !== 'ALL' || selectedCategory !== 'ALL' || searchTerm ? (
              <button
                onClick={() => {
                  setSelectedSeverity('ALL');
                  setSelectedCategory('ALL');
                  setSearchTerm('');
                }}
                className="text-[#ff5733] hover:underline font-semibold"
              >
                Reset filters
              </button>
            ) : null}
          </div>

          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
          ) : (
            <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#ff5733] mx-auto" />
              <h3 className="text-lg font-bold text-white">No issues match current filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing your search term or adjusting severity and category selections.
              </p>
            </div>
          )}
        </div>
      </main>

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        score={score || undefined}
        issues={issues}
      />
    </div>
  );
}
