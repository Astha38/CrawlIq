'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Bot, Sparkles, X } from 'lucide-react';

interface CrawlProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  siteUrl: string;
  onComplete?: () => void;
}

const STAGES = [
  { label: 'Initializing Celery Crawl Worker & Scrapy Engine', duration: 1500 },
  { label: 'Inspecting HTML DOM & SPA JS Rendering Needs', duration: 2000 },
  { label: 'Crawling URLs & Extracting Page Meta Data', duration: 3500 },
  { label: 'Running SEO Rule Engine & Diagnostics', duration: 2500 },
  { label: 'Querying Google PageSpeed Insights API', duration: 2000 },
  { label: 'Finalizing Audit Score & Persisting Metrics', duration: 1500 },
];

export default function CrawlProgressModal({ isOpen, onClose, siteName, siteUrl, onComplete }: CrawlProgressModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      setIsFinished(false);
      return;
    }

    let timer: NodeJS.Timeout;

    const advanceStage = (index: number) => {
      if (index >= STAGES.length) {
        setIsFinished(true);
        if (onComplete) onComplete();
        return;
      }

      setCurrentStage(index);
      timer = setTimeout(() => {
        advanceStage(index + 1);
      }, STAGES[index].duration);
    };

    advanceStage(0);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round(((currentStage + 1) / STAGES.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#16161a] border border-[#242429] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5733]/10 border border-[#ff5733]/20 text-[#ff5733] flex items-center justify-center">
              {isFinished ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Bot className="w-6 h-6 animate-pulse" />}
            </div>
            <div>
              <h2 className="font-bold text-white text-lg tracking-tight">
                {isFinished ? 'Audit Crawl Completed!' : 'SEO Audit Crawl in Progress'}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-xs">{siteUrl}</p>
            </div>
          </div>
          {isFinished && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#202025]">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Overall Progress</span>
            <span className="text-[#ff5733] font-mono">{isFinished ? '100%' : `${progressPercent}%`}</span>
          </div>
          <div className="w-full h-2.5 bg-[#101012] rounded-full overflow-hidden border border-[#202025]">
            <div
              className={`h-full transition-all duration-500 ${
                isFinished ? 'bg-emerald-500' : 'bg-[#ff5733]'
              }`}
              style={{ width: isFinished ? '100%' : `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Live Logs Stream */}
        <div className="bg-[#101012] border border-[#202025] rounded-xl p-4 space-y-3 font-mono text-xs max-h-56 overflow-y-auto">
          {STAGES.map((stage, idx) => {
            const isDone = idx < currentStage || isFinished;
            const isCurrent = idx === currentStage && !isFinished;

            return (
              <div key={stage.label} className="flex items-center gap-2.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#ff5733] animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span
                  className={`${
                    isDone
                      ? 'text-slate-300'
                      : isCurrent
                      ? 'text-[#ff5733] font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {isFinished && (
          <button
            onClick={onClose}
            className="w-full py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            View Audit Results
          </button>
        )}
      </div>
    </div>
  );
}
