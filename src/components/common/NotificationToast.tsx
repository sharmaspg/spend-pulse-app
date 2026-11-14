import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Bell } from 'lucide-react';
import { subscribeToAlerts, InAppAlert } from '../../utils/notifications';

export const NotificationToast: React.FC = () => {
  const [currentAlert, setCurrentAlert] = useState<InAppAlert | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAlerts((alert) => {
      setCurrentAlert(alert);
      const timer = setTimeout(() => {
        setCurrentAlert(null);
      }, 7000);
      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  if (!currentAlert) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto animate-bounce-short">
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-red-950 border-2 border-rose-500/60 shadow-2xl shadow-rose-950/80 backdrop-blur-xl text-white flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 animate-pulse">
          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-extrabold text-rose-200 tracking-wide uppercase flex items-center gap-1.5">
            <span>{currentAlert.title}</span>
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            {currentAlert.message}
          </p>
        </div>
        <button
          onClick={() => setCurrentAlert(null)}
          className="text-slate-400 hover:text-white p-1 rounded-lg shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
