'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ArcGauge from '@/components/ArcGauge';
import AddSiteModal from '@/components/AddSiteModal';
import CrawlProgressModal from '@/components/CrawlProgressModal';
import ExportReportModal from '@/components/ExportReportModal';
import { api } from '@/lib/api';
import { Site, CrawlScore, Issue } from '@/types';
import { 
  Globe, 
  AlertOctagon, 
  TrendingUp, 
  Zap, 
  Layers, 
  FileText, 
  Plus, 
  Play, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [score, setScore] = useState<CrawlScore | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [isCrawlProgressOpen, setIsCrawlProgressOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<{ name: string; url: string }>({ name: '', url: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const sitesData = await api.getSites();
        setSites(sitesData);

        if (sitesData.length > 0) {
          const scoreData = await api.getCrawlScore('crawl-101');
          const issuesData = await api.getCrawlIssues('crawl-101');
          setScore(scoreData);
          setIssues(issuesData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddSiteSubmit = async (data: { name: string; url: string; crawl_interval: string; trigger_initial_crawl: boolean }) => {
    const created = await api.createSite(data);
    setSites([created, ...sites]);
    if (data.trigger_initial_crawl) {
      setSelectedSite({ name: created.name, url: created.url });
      setIsCrawlProgressOpen(true);
    }
  };

  const triggerAudit = (siteName: string, siteUrl: string) => {
    setSelectedSite({ name: siteName, url: siteUrl });
    setIsCrawlProgressOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0f] text-slate-100 min-h-screen">
      <Navbar
        onAddSite={() => setIsAddSiteOpen(true)}
        onRunAudit={() => triggerAudit(sites[0]?.name || 'TechCrunch Blog', sites[0]?.url || 'https://techcrunch.com')}
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* TOP ROW: 4 KPI Cards matching reference top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Health Score */}
          <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">SEO Health Score</span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white tracking-tight">{score?.overall_score || 84} / 100</span>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400 font-medium">
                <span>↗ 12%</span>
                <span className="text-slate-500 font-normal">Vs. last crawl</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Crawled */}
          <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Pages Crawled</span>
              <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white tracking-tight">142 Pages</span>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400 font-medium">
                <span>↗ 11%</span>
                <span className="text-slate-500 font-normal">Vs. last month</span>
              </div>
            </div>
          </div>

          {/* Card 3: Critical Vulnerabilities */}
          <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Critical Issues</span>
              <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white tracking-tight">{score?.critical_issues || 3} Open</span>
              <div className="flex items-center gap-1 mt-1 text-xs text-rose-400 font-medium">
                <span>↘ 0.6%</span>
                <span className="text-slate-500 font-normal">Vs. last month</span>
              </div>
            </div>
          </div>

          {/* Card 4: PageSpeed Insights */}
          <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">PageSpeed Rating</span>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white tracking-tight">76 / 100</span>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400 font-medium">
                <span>↗ 9%</span>
                <span className="text-slate-500 font-normal">Vs. last month</span>
              </div>
            </div>
          </div>

        </div>

        {/* MIDDLE ROW: Crawl Score Trend & Arc Gauge matching reference middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 60% Panel: Custom Dotted Bar Chart with Coral Highlight */}
          <div className="lg:col-span-2 bg-[#16161a] border border-[#242429] rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-lg tracking-tight">Crawl Velocity & Index Score</h3>
              <span className="text-xs text-slate-400 bg-[#1f1f24] px-3 py-1 rounded-full border border-[#2a2a30]">This month</span>
            </div>

            {/* Custom SVG Dotted Bar Graphic styled exactly like reference image */}
            <div className="relative h-48 w-full flex items-end justify-between px-2 pt-8">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between text-[11px] text-slate-600 pointer-events-none">
                <div className="border-b border-[#242429] pb-1">$400K</div>
                <div className="border-b border-[#242429] pb-1">$300K</div>
                <div className="border-b border-[#242429] pb-1">$200K</div>
                <div className="border-b border-[#242429] pb-1">$100K</div>
                <div className="border-b border-[#242429] pb-1">$0</div>
              </div>

              {/* Dotted Columns */}
              {[
                { month: 'May', height: 40, highlighted: false },
                { month: '', height: 60, highlighted: false },
                { month: 'Jun', height: 50, highlighted: false },
                { month: '', height: 85, highlighted: false },
                { month: 'Jul', height: 110, highlighted: true },
                { month: '', height: 70, highlighted: false },
                { month: 'Aug', height: 55, highlighted: false },
                { month: '', height: 90, highlighted: false },
                { month: 'Sep', height: 65, highlighted: false },
                { month: '', height: 125, highlighted: false },
                { month: 'Oct', height: 100, highlighted: false },
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 z-10 relative group">
                  {/* Highlighted Tooltip Popup Card */}
                  {bar.highlighted && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#222227] text-white px-3 py-1.5 rounded-xl border border-[#333339] text-center shadow-xl whitespace-nowrap z-20">
                      <span className="text-[10px] text-slate-400 block">Jul 2026</span>
                      <span className="text-xs font-bold text-[#ff5733]">84 Score</span>
                    </div>
                  )}

                  {/* Vertical Dotted Pillar */}
                  <div className="flex flex-col gap-1 items-center">
                    {Array.from({ length: Math.round(bar.height / 12) }).map((_, dIdx) => (
                      <div
                        key={dIdx}
                        className={`w-2.5 h-2.5 rounded-full ${
                          bar.highlighted
                            ? 'bg-[#ff5733] shadow-md shadow-[#ff5733]/50'
                            : 'bg-[#2a2a32] group-hover:bg-slate-500 transition-colors'
                        }`}
                      />
                    ))}
                  </div>
                  {bar.month && <span className="text-[11px] text-slate-500 font-medium">{bar.month}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right 40% Panel: Semicircle Arc Gauge */}
          <div className="lg:col-span-1">
            <ArcGauge score={score?.overall_score || 84} totalCrawled={142} />
          </div>

        </div>

        {/* BOTTOM ROW: 3 Cards Left + Recent Sites Right matching reference bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Top Audit Categories */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-lg tracking-tight">Top SEO Rule Categories</h3>
              <Link href="/audits" className="text-xs text-slate-400 hover:text-white transition-colors">
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category 1 */}
              <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Meta & Headings</h4>
                    <span className="text-2xl font-extrabold text-white mt-1 block">88 / 100</span>
                    <p className="text-xs text-slate-400 mt-1">Title length, H1 duplicate checks</p>
                  </div>
                </div>
                <Link
                  href="/audits?category=META"
                  className="w-full py-2 bg-[#202025] hover:bg-[#2a2a30] text-slate-200 rounded-xl text-xs font-semibold text-center block transition-all border border-[#2c2c33]"
                >
                  Inspect Rule
                </Link>
              </div>

              {/* Category 2 */}
              <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-[#ff5733]/10 border border-[#ff5733]/20 text-[#ff5733] flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">PageSpeed & Speed</h4>
                    <span className="text-2xl font-extrabold text-white mt-1 block">76 / 100</span>
                    <p className="text-xs text-slate-400 mt-1">LCP, FID, CLS Web Vitals</p>
                  </div>
                </div>
                <Link
                  href="/pagespeed"
                  className="w-full py-2 bg-[#202025] hover:bg-[#2a2a30] text-slate-200 rounded-xl text-xs font-semibold text-center block transition-all border border-[#2c2c33]"
                >
                  View Vitals
                </Link>
              </div>

              {/* Category 3 */}
              <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Indexability</h4>
                    <span className="text-2xl font-extrabold text-white mt-1 block">95 / 100</span>
                    <p className="text-xs text-slate-400 mt-1">Canonical tags & robots.txt</p>
                  </div>
                </div>
                <Link
                  href="/audits?category=INDEXABILITY"
                  className="w-full py-2 bg-[#202025] hover:bg-[#2a2a30] text-slate-200 rounded-xl text-xs font-semibold text-center block transition-all border border-[#2c2c33]"
                >
                  Inspect Rule
                </Link>
              </div>
            </div>
          </div>

          {/* Right 1 Column: Recent Sites List matching reference image "Recent Subscriptions" table */}
          <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg tracking-tight">Recent Audits</h3>
                <Link href="/sites" className="text-xs text-slate-400 hover:text-white transition-colors">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {sites.map((st, idx) => {
                  const avatarColors = [
                    'bg-rose-500 text-white',
                    'bg-emerald-500 text-white',
                    'bg-amber-500 text-slate-950',
                    'bg-sky-500 text-white'
                  ];
                  const color = avatarColors[idx % avatarColors.length];

                  return (
                    <div key={st.id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${color}`}>
                          {st.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-slate-200 block truncate">{st.name}</span>
                          <span className="text-[11px] text-slate-500 capitalize">{st.crawl_interval}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-semibold text-slate-300">{st.latest_score} score</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsAddSiteOpen(true)}
              className="w-full py-2.5 bg-[#ff5733] hover:bg-[#e04826] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ff5733]/20 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Website to Monitor
            </button>
          </div>

        </div>

      </main>

      {/* Interactive Modals */}
      <AddSiteModal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
        onSubmit={handleAddSiteSubmit}
      />

      <CrawlProgressModal
        isOpen={isCrawlProgressOpen}
        onClose={() => setIsCrawlProgressOpen(false)}
        siteName={selectedSite.name}
        siteUrl={selectedSite.url}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        site={sites[0]}
        score={score || undefined}
        issues={issues}
      />
    </div>
  );
}
