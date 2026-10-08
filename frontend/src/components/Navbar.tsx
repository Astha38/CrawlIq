'use client';

import { useState } from 'react';
import { Search, Calendar, Bell, Plus, Play, User } from 'lucide-react';

interface NavbarProps {
  onAddSite?: () => void;
  onRunAudit?: () => void;
}

export default function Navbar({ onAddSite, onRunAudit }: NavbarProps) {
  return (
    <header className="h-20 bg-[#0d0d0f] border-b border-[#1f1f24] px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar matching reference image rounded pill */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search sites, URLs, or SEO issues..."
            className="w-full bg-[#18181c] text-slate-200 text-sm pl-11 pr-4 py-2.5 rounded-full border border-[#26262c] focus:outline-none focus:border-[#ff5733] transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right Utility Bar matching reference image */}
      <div className="flex items-center gap-3">
        {onAddSite && (
          <button
            onClick={onAddSite}
            className="flex items-center gap-2 bg-[#1c1c20] hover:bg-[#25252b] text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-[#2a2a30] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#ff5733]" />
            Add Site
          </button>
        )}

        {onRunAudit && (
          <button
            onClick={onRunAudit}
            className="flex items-center gap-2 bg-[#ff5733] hover:bg-[#e04826] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#ff5733]/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Audit
          </button>
        )}

        <div className="h-5 w-px bg-[#26262c] mx-1" />

        {/* Round utility icon buttons matching reference top-right icons */}
        <button className="w-9 h-9 bg-[#1c1c20] hover:bg-[#26262c] rounded-full border border-[#26262c] flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <Calendar className="w-4 h-4" />
        </button>

        <button className="w-9 h-9 bg-[#1c1c20] hover:bg-[#26262c] rounded-full border border-[#26262c] flex items-center justify-center text-slate-400 hover:text-white transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#ff5733] absolute top-2 right-2 ring-2 ring-[#0d0d0f]" />
        </button>

        <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ml-1 border border-white/20">
          US
        </div>
      </div>
    </header>
  );
}
