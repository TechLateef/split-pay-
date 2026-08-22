import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { AppCard } from '../ui/AppCard';
import { MonAmount } from '../ui/MonAmount';
import { ArrowUpRight, ArrowDownLeft, Layers } from 'lucide-react-native';

interface StatsRowProps {
  totalSentMON?: string;
  totalReceivedMON?: string;
  activeBillsCount?: number;
}

export function StatsRow({
  totalSentMON = '8.50',
  totalReceivedMON = '18.00',
  activeBillsCount = 2,
}: StatsRowProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stat 1: Sent */}
        <AppCard style={styles.statCard} variant="subtle">
          <View style={styles.iconRow}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <ArrowUpRight size={14} color={colors.error} />
            </View>
            <Text style={styles.statLabel}>Total Paid</Text>
          </View>
          <MonAmount amount={totalSentMON} size="sm" showUSD={false} color={colors.textPrimary} />
        </AppCard>

        {/* Stat 2: Received */}
        <AppCard style={styles.statCard} variant="subtle">
          <View style={styles.iconRow}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(0, 212, 170, 0.12)' }]}>
              <ArrowDownLeft size={14} color={colors.success} />
            </View>
            <Text style={styles.statLabel}>Collected</Text>
          </View>
          <MonAmount amount={totalReceivedMON} size="sm" showUSD={false} color={colors.success} />
        </AppCard>

        {/* Stat 3: Active Bills */}
        <AppCard style={styles.statCard} variant="subtle">
          <View style={styles.iconRow}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(131, 110, 249, 0.12)' }]}>
              <Layers size={14} color={colors.primaryLight} />
            </View>
            <Text style={styles.statLabel}>Active Splits</Text>
          </View>
          <Text style={styles.countText}>{activeBillsCount}</Text>
        </AppCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    gap: 10,
    paddingHorizontal: 2,
  },
  statCard: {
    width: 130,
    padding: 12,
    gap: 6,
    borderRadius: 16,
    backgroundColor: '#12121B',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  countText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryLight,
  },
});
