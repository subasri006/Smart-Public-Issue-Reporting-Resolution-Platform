import React from 'react';
import { Zap } from 'lucide-react';

export const PriorityBadge = ({ score, level, explanation }) => {
  const levelColors = {
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300',
    HIGH: 'bg-amber-100 text-amber-900 border-amber-300',
    MEDIUM: 'bg-blue-100 text-blue-900 border-blue-300',
    LOW: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  const badgeClass = levelColors[level] || levelColors.LOW;

  return (
    <div className="inline-flex items-center gap-1.5" title={explanation || `Priority Score: ${score} (${level})`}>
      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold ${badgeClass}`}>
        <Zap className="w-3 h-3 fill-current" />
        <span>{level}</span>
        <span className="opacity-75 text-[11px] font-mono">({score})</span>
      </span>
    </div>
  );
};
