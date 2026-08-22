import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface BillProgressProps {
  paidCount: number;
  totalParticipants: number;
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
}

export function BillProgress({
  paidCount,
  totalParticipants,
  size = 110,
  strokeWidth = 10,
  showDetails = true,
}: BillProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalParticipants > 0 ? Math.min(paidCount / totalParticipants, 1) : 0;
  const percentage = Math.round(progress * 100);

  const [currentProgress, setCurrentProgress] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listenerId = animValue.addListener(({ value }) => {
      setCurrentProgress(value);
    });

    Animated.timing(animValue, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animValue.removeListener(listenerId);
    };
  }, [progress]);

  const strokeDashoffset = circumference * (1 - currentProgress);
  const isFull = paidCount === totalParticipants && totalParticipants > 0;

  return (
    <View style={styles.wrapper}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          {/* Background circle track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E1E2E"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isFull ? colors.success : colors.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        {/* Center label */}
        <View style={styles.centerTextContainer}>
          <Text style={[styles.percentageText, { color: isFull ? colors.success : colors.textPrimary }]}>
            {percentage}%
          </Text>
          <Text style={styles.paidRatioText}>
            {paidCount}/{totalParticipants} paid
          </Text>
        </View>
      </View>
      {showDetails ? (
        <View style={styles.detailsRow}>
          <Text style={styles.summaryText}>
            {isFull
              ? '🎉 All participants have paid!'
              : `${totalParticipants - paidCount} remaining to settle`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  paidRatioText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  detailsRow: {
    marginTop: 10,
  },
  summaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});