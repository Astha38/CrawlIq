'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  Globe, 
  Search, 
  Gauge, 
  FileText, 
  ShieldCheck, 
  Layers,
  Sparkles,
  Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutGrid },
  { name: 'Sites & Crawls', href: '/sites', icon: Globe },
  { name: 'Audit Reports', href: '/audits', icon: Search },
  { name: 'PageSpeed Vitals', href: '/pagespeed', icon: Gauge },
  { name: 'Reports & Export', href: '/reports', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#141417] border-r border-[#222227] flex flex-col justify-between h-screen fixed left-0 top-0 text-slate-300 z-30">
      <div>
        {/* Brand Header matching reference logo layout */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ff5733] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#ff5733]/20 shrink-0 font-extrabold text-lg">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wider uppercase leading-none">
              CRAWLIQ
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">@seo_engine</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="px-4 space-y-1 mt-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#25252a] text-white font-semibold shadow-inner border border-[#323238]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#1a1a1e]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff5733]' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Security footer anchored at bottom like reference */}
      <div className="p-4 border-t border-[#222227]">
        <div className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer rounded-lg hover:bg-[#1a1a1e] transition-all">
          <Shield className="w-4 h-4 text-slate-400" />
          <span className="font-medium">Security & Compliance</span>
        </div>
      </div>
    </aside>
  );
}
