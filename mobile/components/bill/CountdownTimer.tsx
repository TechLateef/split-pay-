import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, AlertCircle } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { formatRemainingTime } from '../../lib/format';

interface CountdownTimerProps {
  deadline: number; // Unix timestamp in seconds
}

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeInfo, setTimeInfo] = useState(() => formatRemainingTime(deadline));

  useEffect(() => {
    if (!deadline || deadline === 0) return;

    const interval = setInterval(() => {
      setTimeInfo(formatRemainingTime(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline || deadline === 0) {
    return null;
  }

  const { text, isExpired, isUrgent, isWarning } = timeInfo;

  const getTheme = () => {
    if (isExpired) {
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
        color: colors.error,
        icon: <AlertCircle size={13} color={colors.error} />,
      };
    }
    if (isUrgent) {
      return {
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.4)',
        color: colors.error,
        icon: <Clock size={13} color={colors.error} />,
      };
    }
    if (isWarning) {
      return {
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.4)',
        color: colors.warning,
        icon: <Clock size={13} color={colors.warning} />,
      };
    }
    return {
      bg: 'rgba(131, 110, 249, 0.1)',
      border: 'rgba(131, 110, 249, 0.3)',
      color: colors.primaryLight,
      icon: <Clock size={13} color={colors.primaryLight} />,
    };
  };

  const theme = getTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      {theme.icon}
      <Text style={[styles.text, { color: theme.color }]}>
        {isExpired ? 'Deadline Passed' : `Time Remaining: ${text}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
