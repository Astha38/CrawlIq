'use client';

import { useState } from 'react';
import { X, Globe, Sparkles } from 'lucide-react';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; url: string; crawl_interval: string; trigger_initial_crawl: boolean }) => void;
}

export default function AddSiteModal({ isOpen, onClose, onSubmit }: AddSiteModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [crawlInterval, setCrawlInterval] = useState('daily');
  const [triggerCrawl, setTriggerCrawl] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    onSubmit({
      name,
      url: url.startsWith('http') ? url : `https://${url}`,
      crawl_interval: crawlInterval,
      trigger_initial_crawl: triggerCrawl,
    });
    setName('');
    setUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#16161a] border border-[#242429] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242429]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff5733]/10 border border-[#ff5733]/20 text-[#ff5733] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-white text-lg tracking-tight">Add Website to CrawlIQ</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#202025]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Website Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My Online Store"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#101012] text-white text-sm px-4 py-2.5 rounded-xl border border-[#202025] focus:outline-none focus:border-[#ff5733] placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Website URL
            </label>
            <input
              type="text"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#101012] text-white text-sm px-4 py-2.5 rounded-xl border border-[#202025] focus:outline-none focus:border-[#ff5733] placeholder:text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Automated Crawl Schedule
            </label>
            <select
              value={crawlInterval}
              onChange={(e) => setCrawlInterval(e.target.value)}
              className="w-full bg-[#101012] text-white text-sm px-3.5 py-2.5 rounded-xl border border-[#202025] focus:outline-none focus:border-[#ff5733]"
            >
              <option value="daily">Daily Schedule</option>
              <option value="weekly">Weekly Schedule</option>
              <option value="monthly">Monthly Schedule</option>
              <option value="manual">Manual On-Demand Only</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="triggerCrawl"
              checked={triggerCrawl}
              onChange={(e) => setTriggerCrawl(e.target.checked)}
              className="w-4 h-4 rounded text-[#ff5733] bg-[#101012] border-[#202025] focus:ring-[#ff5733]"
            />
            <label htmlFor="triggerCrawl" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#ff5733]" />
              Trigger immediate full SEO crawl after saving
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242429]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-[#202025] hover:bg-[#2a2a30] rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#ff5733] hover:bg-[#e04826] rounded-xl shadow-lg shadow-[#ff5733]/20 transition-all"
            >
              Save Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
