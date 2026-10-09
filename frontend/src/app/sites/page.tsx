'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AddSiteModal from '@/components/AddSiteModal';
import CrawlProgressModal from '@/components/CrawlProgressModal';
import { api } from '@/lib/api';
import { Site } from '@/types';
import { 
  Globe, 
  Plus, 
  Play, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  RefreshCw,
  Layers,
  AlertOctagon,
  CheckCircle2
} from 'lucide-react';

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [isCrawlProgressOpen, setIsCrawlProgressOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<{ name: string; url: string }>({ name: '', url: '' });

  const loadSites = async () => {
    setLoading(true);
    try {
      const data = await api.getSites();
      setSites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleAddSite = async (data: { name: string; url: string; crawl_interval: string; trigger_initial_crawl: boolean }) => {
    const newSite = await api.createSite(data);
    setSites(prev => {
      const map = new Map<string, Site>();
      [newSite, ...prev].forEach(s => map.set(s.id, s));
      return Array.from(map.values());
    });
    if (data.trigger_initial_crawl) {
      setSelectedSite({ name: newSite.name, url: newSite.url });
      setIsCrawlProgressOpen(true);
    }
  };

  const handleTriggerCrawl = (site: Site) => {
    setSelectedSite({ name: site.name, url: site.url });
    setIsCrawlProgressOpen(true);
  };

  const handleDeleteSite = async (siteId: string) => {
    if (confirm('Are you sure you want to delete this website from CrawlIQ?')) {
      await api.deleteSite(siteId);
      setSites(sites.filter(s => s.id !== siteId));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0f] text-slate-100 min-h-screen">
      <Navbar onAddSite={() => setIsAddSiteOpen(true)} />

      <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Globe className="w-6 h-6 text-[#ff5733]" />
              Monitored Websites & Crawl Targets
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure target URLs, automated schedules, SPA Playwright crawlers, and crawl limits.
            </p>
          </div>
          <button
            onClick={() => setIsAddSiteOpen(true)}
            className="flex items-center gap-2 bg-[#ff5733] hover:bg-[#e04826] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-[#ff5733]/20 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Website
          </button>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((st, idx) => {
            const avatarColors = ['bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500'];
            const color = avatarColors[idx % avatarColors.length];

            return (
              <div key={`${st.id}-${idx}`} className="bg-[#16161a] border border-[#242429] rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between hover:border-[#33333b] transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${color}`}>
                        {st.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <h2 className="font-bold text-white text-base truncate">{st.name}</h2>
                        <a
                          href={st.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#ff5733] hover:underline flex items-center gap-1 font-mono truncate max-w-[180px]"
                        >
                          {st.url}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>

                    <div className="text-right bg-[#101012] px-3 py-1.5 rounded-xl border border-[#202025]">
                      <span className="text-xl font-extrabold text-emerald-400 block">{st.latest_score}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Score</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-[#101012] p-3 rounded-xl border border-[#202025]">
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">Pages Crawled</span>
                      <span className="text-base font-bold text-slate-100">{st.pages_count || 142}</span>
                    </div>
                    <div className="bg-[#101012] p-3 rounded-xl border border-[#202025]">
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">Critical Issues</span>
                      <span className="text-base font-bold text-rose-400">{st.critical_issues_count || 3}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Schedule:
                      </span>
                      <span className="capitalize font-semibold text-slate-200">{st.crawl_interval}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Last Crawled:
                      </span>
                      <span className="font-mono text-slate-300">
                        {st.last_crawl_at ? new Date(st.last_crawl_at).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center gap-2 pt-4 border-t border-[#202025]">
                  <button
                    onClick={() => handleTriggerCrawl(st)}
                    className="flex-1 py-2 bg-[#ff5733] hover:bg-[#e04826] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ff5733]/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run Crawl Now
                  </button>
                  <button
                    onClick={() => handleDeleteSite(st.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-[#202025] hover:border-rose-500/30"
                    title="Delete Website"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <AddSiteModal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
        onSubmit={handleAddSite}
      />

      <CrawlProgressModal
        isOpen={isCrawlProgressOpen}
        onClose={() => setIsCrawlProgressOpen(false)}
        siteName={selectedSite.name}
        siteUrl={selectedSite.url}
      />
    </div>
  );
}
