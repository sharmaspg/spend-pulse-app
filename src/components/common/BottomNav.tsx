import React from 'react';
import { LayoutDashboard, BarChart3, Sliders, Settings, Plus } from 'lucide-react';

export type TabType = 'dashboard' | 'analytics' | 'ratios' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAddExpense: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddExpense
}) => {
  return (
    <div className="sticky bottom-0 z-30 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 flex items-center justify-between pb-safe">
      {/* Dashboard Tab */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 ${
          currentTab === 'dashboard' ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px]">Today</span>
      </button>

      {/* Analytics Tab */}
      <button
        onClick={() => onSelectTab('analytics')}
        className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 ${
          currentTab === 'analytics' ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-[10px]">Pace & Health</span>
      </button>

      {/* Floating Center Action Button (Add Expense) */}
      <div className="-mt-6 flex justify-center">
        <button
          onClick={onOpenAddExpense}
          className="w-13 h-13 p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white shadow-lg shadow-indigo-500/40 flex items-center justify-center transform active:scale-95 transition-all border border-indigo-400/30"
          title="Log Expense"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Ratios & EMIs Tab */}
      <button
        onClick={() => onSelectTab('ratios')}
        className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 ${
          currentTab === 'ratios' ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sliders className="w-5 h-5" />
        <span className="text-[10px]">Ratios</span>
      </button>

      {/* Settings Tab */}
      <button
        onClick={() => onSelectTab('settings')}
        className={`flex flex-col items-center gap-1 transition-colors px-2 py-1 ${
          currentTab === 'settings' ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px]">Setup</span>
      </button>
    </div>
  );
};
