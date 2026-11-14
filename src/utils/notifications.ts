export interface InAppAlert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

type AlertListener = (alert: InAppAlert) => void;
const listeners: Set<AlertListener> = new Set();

export function subscribeToAlerts(listener: AlertListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitInAppAlert(alert: Omit<InAppAlert, 'id' | 'timestamp'>) {
  const fullAlert: InAppAlert = {
    ...alert,
    id: 'alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: Date.now()
  };
  listeners.forEach((listener) => listener(fullAlert));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export function triggerBudgetExceededNotification(
  amountSpent: number,
  overspendAmount: number,
  currency: string = '₹'
) {
  const formattedOverspend = `${currency}${Math.round(overspendAmount).toLocaleString()}`;
  const formattedSpent = `${currency}${Math.round(amountSpent).toLocaleString()}`;

  // 1. Trigger device vibration / haptic if supported
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 300, 100, 400]);
    } catch {}
  }

  // 2. Trigger OS-level notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('🚨 Daily Budget Exceeded!', {
        body: `You logged ${formattedSpent} and are now ${formattedOverspend} over today's safe spending limit!`,
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚠️</text></svg>',
        tag: 'budget-exceeded'
      });
    } catch (e) {
      console.warn('System notification failed', e);
    }
  }

  // 3. Emit in-app alert banner
  emitInAppAlert({
    type: 'danger',
    title: '⚠️ Daily Budget Limit Exceeded!',
    message: `You've exceeded today's budget by ${formattedOverspend}. Subsequent days will automatically adjust to protect your monthly savings.`
  });
}
