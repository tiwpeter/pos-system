import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Thai Baht currency
 * e.g. 12500.50 → "฿12,500.50"
 */
export function formatCurrency(amount: number | string): string {
  const num = Number(amount);
  if (isNaN(num)) return '฿0.00';
  return `฿${num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date in Thai locale
 * e.g. "15 ม.ค. 2567"
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get document type label in Thai
 */
export function getDocTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    quotation: 'ใบเสนอราคา',
    voi: 'ใบส่งของ',
    receipt: 'ใบเสร็จรับเงิน',
  };
  return labels[type] || type;
}

/**
 * Get status label in Thai with color
 */
export function getStatusConfig(status: string): {
  label: string;
  className: string;
} {
  const configs: Record<
    string,
    { label: string; className: string }
  > = {
    draft: {
      label: 'ร่าง',
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    confirmed: {
      label: 'ยืนยันแล้ว',
      className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    converted: {
      label: 'แปลงแล้ว',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    cancelled: {
      label: 'ยกเลิก',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
  };
  return (
    configs[status] || {
      label: status,
      className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
  );
}

/**
 * Get stock level badge config
 */
export function getStockConfig(stock: number): {
  label: string;
  className: string;
} {
  if (stock === 0)
    return {
      label: 'หมดสต็อก',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
  if (stock <= 5)
    return {
      label: 'ใกล้หมด',
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
  return {
    label: 'มีสต็อก',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
}
