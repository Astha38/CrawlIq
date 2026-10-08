'use client';

import { useState } from 'react';
import { Issue } from '@/types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Tag, 
  Wrench
} from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          badge: 'bg-rose-500 text-white',
          icon: AlertOctagon,
          iconColor: 'text-rose-400',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
        };
      default:
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          badge: 'bg-sky-500 text-white',
          icon: Info,
          iconColor: 'text-sky-400',
        };
    }
  };

  const style = getSeverityStyle(issue.severity);
  const Icon = style.icon;

  return (
    <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 hover:border-[#33333b] transition-all shadow-lg space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1">
          <div className={`p-2.5 rounded-xl border ${style.bg} shrink-0 mt-0.5`}>
            <Icon className={`w-5 h-5 ${style.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-bold text-white text-base tracking-tight">{issue.title}</h3>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${style.badge}`}>
                {issue.severity}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#202025] text-slate-400 border border-[#2a2a30] flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#ff5733]" />
                {issue.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{issue.description}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white p-2 hover:bg-[#202025] rounded-xl transition-all shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Affected URL Bar */}
      <div className="flex items-center justify-between text-xs bg-[#101012] p-3 rounded-xl border border-[#202025] text-slate-400">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="text-slate-500 font-medium shrink-0">Affected URL:</span>
          <a
            href={issue.affected_url}
            target="_blank"
            rel="noreferrer"
            className="text-[#ff5733] hover:underline truncate flex items-center gap-1 font-mono text-[11px]"
          >
            {issue.affected_url}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      </div>

      {/* Expanded Recommendation Fix Details */}
      {expanded && (
        <div className="pt-2 border-t border-[#202025] space-y-3 text-xs animate-fade-in">
          <div className="bg-[#1c1a24] border border-[#3b2b48] p-4 rounded-xl text-slate-200 flex items-start gap-3">
            <Wrench className="w-4 h-4 text-[#ff5733] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#ff5733] block mb-0.5">Recommended Action Plan:</span>
              <p className="text-slate-300 leading-relaxed">{issue.recommendation}</p>
            </div>
          </div>

          {issue.details && Object.keys(issue.details).length > 0 && (
            <div className="bg-[#101012] p-3.5 rounded-xl border border-[#202025] font-mono text-[11px] text-slate-400">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Diagnostic Details</span>
              <pre className="whitespace-pre-wrap">{JSON.stringify(issue.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
