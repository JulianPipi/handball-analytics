import React from 'react';

interface ComparisonRowProps {
  label: string;
  homeValue: number | string;
  awayValue: number | string;
  homeNum: number;
  awayNum: number;
  isPercentage?: boolean;
}

export const ComparisonRow: React.FC<ComparisonRowProps> = ({
  label,
  homeValue,
  awayValue,
  homeNum,
  awayNum,
}) => {
  const total = homeNum + awayNum;
  const homePct = total > 0 ? (homeNum / total) * 100 : 50;
  const awayPct = total > 0 ? (awayNum / total) * 100 : 50;

  return (
    <div className="space-y-1.5 py-2 border-b border-slate-800/60 last:border-0">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="font-mono text-sm font-bold text-blue-400">{homeValue}</span>
        <span className="text-slate-300 uppercase tracking-wider text-[11px]">{label}</span>
        <span className="font-mono text-sm font-bold text-rose-400">{awayValue}</span>
      </div>

      {/* Duel progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-950 flex overflow-hidden border border-slate-800">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="h-full bg-rose-500 transition-all duration-500"
          style={{ width: `${awayPct}%` }}
        />
      </div>
    </div>
  );
};
