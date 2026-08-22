import { ethers } from 'ethers';

/**
 * Truncate an Ethereum / EVM address to 0x1234...5678
 */
export function formatAddress(address?: string | null, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format wei string or bigint to human-readable MON (e.g. 2.5 MON)
 */
export function formatMON(weiValue: string | bigint | number | undefined | null, decimals = 4): string {
  if (weiValue === undefined || weiValue === null) return '0.00';
  try {
    const formatted = typeof weiValue === 'string' || typeof weiValue === 'bigint'
      ? ethers.formatEther(weiValue.toString())
      : weiValue.toString();
    const num = parseFloat(formatted);
    if (isNaN(num)) return '0.00';
    if (num === 0) return '0.00';
    if (num < 0.0001) return '< 0.0001';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  } catch {
    return '0.00';
  }
}

/**
 * Approximate USD value (demo rate: 1 MON = $4.20)
 */
export function formatUSD(monAmount: string | number, monPriceUSD = 4.2): string {
  const num = typeof monAmount === 'string' ? parseFloat(monAmount) : monAmount;
  if (isNaN(num)) return '$0.00';
  const usd = num * monPriceUSD;
  return `$${usd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Parse human MON amount to Wei string
 */
export function parseMON(amountStr: string): bigint {
  try {
    const clean = amountStr.trim().replace(/,/g, '');
    return ethers.parseEther(clean || '0');
  } catch {
    return 0n;
  }
}

/**
 * Format timestamp to relative time (e.g. "2 hours ago", "Just now")
 */
export function formatTimeAgo(timestampSeconds: number | bigint): string {
  const ts = Number(timestampSeconds) * 1000;
  const now = Date.now();
  const diffMs = now - ts;
  if (diffMs < 60000) return 'Just now';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Format timestamp to nice date string (e.g. "Aug 22, 2026 at 14:30")
 */
export function formatDateTime(timestampSeconds: number | bigint): string {
  const date = new Date(Number(timestampSeconds) * 1000);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleString('en-US', options);
}

/**
 * Format remaining time until deadline
 */
export function formatRemainingTime(deadlineTimestampSeconds: number | bigint): {
  text: string;
  isExpired: boolean;
  isUrgent: boolean;
  isWarning: boolean;
} {
  const deadline = Number(deadlineTimestampSeconds);
  if (!deadline || deadline === 0) {
    return { text: 'No deadline', isExpired: false, isUrgent: false, isWarning: false };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const diff = deadline - nowSeconds;

  if (diff <= 0) {
    return { text: 'Expired', isExpired: true, isUrgent: true, isWarning: true };
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  const isUrgent = diff < 3600; // < 1 hour
  const isWarning = diff < 86400; // < 24 hours

  let text = '';
  if (days > 0) {
    text = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m`;
  } else {
    text = `${minutes}m remaining`;
  }

  return { text, isExpired: false, isUrgent, isWarning };
}
