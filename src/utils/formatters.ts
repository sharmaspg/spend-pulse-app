export function formatCurrency(amount: number, currency: string = '₹'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  // Format Indian numbering if ₹ or default locale
  let formatted = '';
  if (currency === '₹') {
    formatted = absAmount.toLocaleString('en-IN');
  } else {
    formatted = absAmount.toLocaleString('en-US');
  }

  return `${isNegative ? '-' : ''}${currency}${formatted}`;
}

export function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
