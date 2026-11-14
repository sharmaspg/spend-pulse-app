import React from 'react';
import { Sparkles, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenRatios: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenRatios }) => {
  const { profile } = useBudget();
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-base tracking-tight text-white">SpendPulse</h1>
            <span className="text-[10px] bg-indigo-500/15 text-indigo-400 font-semibold px-1.5 py-0.5 rounded-full border border-indigo-500/30">
              PACER
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{dateFormatted}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenRatios}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors"
          title="Adjust Ratios"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span>{profile.ratios.needs}/{profile.ratios.fun}/{profile.ratios.savings}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 flex items-center justify-center transition-colors"
          title="Settings & Financial Setup"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </header>
  );
};
