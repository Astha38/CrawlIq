'use client';

interface ArcGaugeProps {
  score: number;
  totalCrawled?: number;
  title?: string;
}

export default function ArcGauge({ score, totalCrawled = 142, title = "SEO Crawl Health" }: ArcGaugeProps) {
  // Breakdown percentages for legend
  const legendItems = [
    { label: 'Passed Rules', value: '82.4%', color: 'bg-rose-500' }, // Coral red/orange dot
    { label: 'Minor Warnings', value: '9.6%', color: 'bg-emerald-500' }, // Emerald green dot
    { label: 'Critical Items', value: '4.8%', color: 'bg-amber-500' }, // Amber dot
    { label: 'Notice & Info', value: '3.2%', color: 'bg-sky-500' }, // Sky blue dot
  ];

  return (
    <div className="bg-[#16161a] border border-[#242429] rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white text-lg tracking-tight">{title}</h3>
        <button className="text-slate-500 hover:text-slate-300 transition-colors text-lg font-bold">⋮</button>
      </div>

      {/* Semi-Circle Arc SVG */}
      <div className="relative flex flex-col items-center justify-center my-4">
        <div className="relative w-64 h-32 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* Background Track Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#242429"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Multi-color Arc gradient stroke */}
            <defs>
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff5733" />
                <stop offset="35%" stopColor="#10b981" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (score / 100) * 251.2}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Value inside Semicircle */}
          <div className="absolute bottom-2 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {score} <span className="text-lg font-semibold text-slate-400">/ 100</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              {totalCrawled} Pages Audited
            </span>
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#242429]">
        {legendItems.map((item) => (
          <div key={item.label} className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="truncate">{item.label.split(' ')[0]}</span>
            </div>
            <span className="font-bold text-sm text-slate-200 block">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
