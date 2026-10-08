'use client';

import { PageSpeedMetrics } from '@/types';
import { Zap, Clock, ShieldCheck, Gauge, CheckCircle2, AlertCircle } from 'lucide-react';

interface PageSpeedGaugeProps {
  metrics: PageSpeedMetrics;
}

export default function PageSpeedGauge({ metrics }: PageSpeedGaugeProps) {
  const getRatingBadge = (rating: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR') => {
    switch (rating) {
      case 'GOOD':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'NEEDS_IMPROVEMENT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'POOR':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  const vitalItems = [
    { key: 'lcp', label: 'Largest Contentful Paint (LCP)', item: metrics.metrics.lcp },
    { key: 'fcp', label: 'First Contentful Paint (FCP)', item: metrics.metrics.fcp },
    { key: 'cls', label: 'Cumulative Layout Shift (CLS)', item: metrics.metrics.cls },
    { key: 'fid', label: 'First Input Delay (FID)', item: metrics.metrics.fid },
    { key: 'ttfb', label: 'Time to First Byte (TTFB)', item: metrics.metrics.ttfb },
    { key: 'speed_index', label: 'Speed Index', item: metrics.metrics.speed_index },
  ];

  return (
    <div className="space-y-6">
      {/* Category Scores Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Performance', score: metrics.performance_score, icon: Zap },
          { label: 'Accessibility', score: metrics.accessibility_score, icon: ShieldCheck },
          { label: 'Best Practices', score: metrics.best_practices_score, icon: CheckCircle2 },
          { label: 'SEO Score', score: metrics.seo_score, icon: Gauge },
        ].map((cat) => {
          const Icon = cat.icon;
          const color = cat.score >= 90 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' 
            : cat.score >= 70 ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
            : 'text-rose-400 border-rose-500/20 bg-rose-500/10';

          return (
            <div key={cat.label} className="bg-[#16161a] border border-[#242429] rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">{cat.label}</span>
                <span className={`text-3xl font-extrabold ${color.split(' ')[0]}`}>{cat.score}</span>
              </div>
              <div className={`p-3 rounded-xl border ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Web Vitals Grid */}
      <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#ff5733]" />
          Core Web Vitals Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vitalItems.map(({ key, label, item }) => (
            <div key={key} className="bg-[#101012] border border-[#202025] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getRatingBadge(item.rating)}`}>
                  {item.rating.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PageSpeed Diagnostics */}
      {metrics.diagnostics && metrics.diagnostics.length > 0 && (
        <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            PageSpeed Opportunity Diagnostics
          </h3>
          <div className="space-y-3">
            {metrics.diagnostics.map((diag) => (
              <div key={diag.id} className="bg-[#101012] border border-[#202025] rounded-xl p-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">{diag.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{diag.description}</p>
                </div>
                {diag.displayValue && (
                  <span className="shrink-0 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 font-mono">
                    {diag.displayValue}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
