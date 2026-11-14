import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [forceMobileFrame, setForceMobileFrame] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center sm:p-4 text-slate-100">
      {/* Top Desktop Controls Bar (only visible on wide screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-2 px-3 py-1.5 text-xs text-slate-400">
        <span className="font-medium tracking-wide flex items-center gap-1.5 text-indigo-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          SpendPulse Native Preview
        </span>
        <button
          onClick={() => setForceMobileFrame(!forceMobileFrame)}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800"
          title="Toggle Mobile Shell / Full View"
        >
          {forceMobileFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Phone Shell</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container - Phone Shell on Desktop, Native Edge-to-Edge on Mobile */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col bg-slate-900 overflow-hidden ${
          forceMobileFrame
            ? 'sm:max-w-[420px] sm:h-[890px] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'
            : 'max-w-2xl min-h-screen sm:rounded-2xl sm:my-4 sm:border sm:border-slate-800'
        }`}
      >
        {/* Dynamic Island / Notch Simulation (only on desktop phone frame) */}
        {forceMobileFrame && (
          <div className="hidden sm:flex justify-center pt-2.5 pb-1 z-30 select-none pointer-events-none">
            <div className="w-28 h-5 bg-black rounded-full flex items-center justify-between px-3">
              <div className="w-2 h-2 rounded-full bg-slate-900"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-950 border border-indigo-500/30"></div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
};
