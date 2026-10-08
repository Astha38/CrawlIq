'use client';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

export default function ScoreGauge({ score, label, size = 'md', subtitle }: ScoreGaugeProps) {
  // Determine color theme based on score (0-100)
  const getColorScheme = (val: number) => {
    if (val >= 90) {
      return {
        text: 'text-emerald-400',
        stroke: '#10b981',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        labelBg: 'bg-emerald-500',
      };
    }
    if (val >= 70) {
      return {
        text: 'text-amber-400',
        stroke: '#f59e0b',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        labelBg: 'bg-amber-500',
      };
    }
    return {
      text: 'text-rose-400',
      stroke: '#f43f5e',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      labelBg: 'bg-rose-500',
    };
  };

  const theme = getColorScheme(score);

  const radius = size === 'lg' ? 44 : size === 'md' ? 36 : 28;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const containerSizes = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  const fontSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border ${theme.border} backdrop-blur-sm shadow-lg`}>
      <div className={`relative flex items-center justify-center ${containerSizes[size]}`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-bold tracking-tight ${fontSizes[size]} ${theme.text}`}>
            {score}
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">/ 100</span>
        </div>
      </div>
      <span className="mt-2 font-semibold text-slate-200 text-sm text-center">{label}</span>
      {subtitle && <span className="text-xs text-slate-400 text-center mt-0.5">{subtitle}</span>}
    </div>
  );
}
