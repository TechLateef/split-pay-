import React from 'react';
import { AppBadge } from '../ui/AppBadge';
import { BillStatus } from '../../store/billsStore';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface BillStatusBadgeProps {
  status: BillStatus;
  size?: 'sm' | 'md';
}

export function BillStatusBadge({ status, size = 'md' }: BillStatusBadgeProps) {
  const iconSize = size === 'sm' ? 10 : 12;

  switch (status) {
    case 'Settled':
      return (
        <AppBadge
          label="Settled"
          variant="success"
          size={size}
          icon={<CheckCircle2 size={iconSize} color={colors.success} />}
        />
      );
    case 'Cancelled':
      return (
        <AppBadge
          label="Cancelled"
          variant="error"
          size={size}
          icon={<XCircle size={iconSize} color={colors.error} />}
        />
      );
    case 'Expired':
      return (
        <AppBadge
          label="Expired"
          variant="neutral"
          size={size}
          icon={<AlertTriangle size={iconSize} color={colors.textSecondary} />}
        />
      );
    case 'Open':
    default:
      return (
        <AppBadge
          label="Open"
          variant="primary"
          size={size}
          icon={<Clock size={iconSize} color={colors.primaryLight} />}
        />
      );
  }
}
