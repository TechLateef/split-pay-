import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useWallet } from '../../hooks/useWallet';
import { useBillsStore } from '../../store/billsStore';
import { AppCard } from '../../components/ui/AppCard';
import { formatTimeAgo } from '../../lib/format';
import { router } from 'expo-router';
import {
  Check,
  Plus,
  Award,
  AlertCircle,
  RotateCcw,
  History,
  ChevronRight,
  Filter,
} from 'lucide-react-native';

const FILTERS = ['All', 'Paid', 'Created', 'Settled'] as const;
type FilterType = (typeof FILTERS)[number];

export function ActivityScreen() {
  const { address } = useWallet();
  const { getAllActivity } = useBillsStore();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');

  const allEvents = getAllActivity(address);

  const filteredEvents = allEvents.filter((ev) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Paid') return ev.type === 'paid';
    if (selectedFilter === 'Created') return ev.type === 'created';
    if (selectedFilter === 'Settled') return ev.type === 'settled';
    return true;
  });

  const getEventVisuals = (type: string) => {
    switch (type) {
      case 'created':
        return {
          icon: <Plus size={14} color="#FFFFFF" />,
          color: colors.primary,
          label: 'Bill Created',
        };
      case 'paid':
        return {
          icon: <Check size={14} color="#0A0A0F" />,
          color: colors.success,
          label: 'Share Paid',
        };
      case 'settled':
        return {
          icon: <Award size={14} color="#0A0A0F" />,
          color: '#FCD34D',
          label: 'Bill Settled',
        };
      case 'cancelled':
        return {
          icon: <AlertCircle size={14} color="#FFFFFF" />,
          color: colors.error,
          label: 'Cancelled',
        };
      case 'refunded':
        return {
          icon: <RotateCcw size={14} color="#FFFFFF" />,
          color: colors.warning,
          label: 'Refund Claimed',
        };
      default:
        return {
          icon: <Check size={14} color="#FFFFFF" />,
          color: colors.primaryLight,
          label: 'Transaction',
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <History size={20} color={colors.primaryLight} />
            <Text style={styles.title}>Activity Feed</Text>
          </View>
          <Text style={styles.subtitle}>
            Live on-chain log of all group split transactions on Monad
          </Text>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersRow}>
          <Filter size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
          {FILTERS.map((f) => {
            const isSelected = selectedFilter === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.7}
                onPress={() => setSelectedFilter(f)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Events List */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev) => {
              const visual = getEventVisuals(ev.type);

              return (
                <AppCard
                  key={ev.id}
                  style={styles.eventCard}
                  onPress={() => router.push(`/bill/${ev.billAddress}`)}
                >
                  <View style={styles.eventRow}>
                    <View style={[styles.iconCircle, { backgroundColor: visual.color }]}>
                      {visual.icon}
                    </View>

                    <View style={styles.eventInfo}>
                      <View style={styles.eventTopRow}>
                        <Text style={styles.eventBillTitle} numberOfLines={1}>
                          {ev.billTitle}
                        </Text>
                        <Text style={styles.eventTime}>{formatTimeAgo(ev.timestamp)}</Text>
                      </View>

                      <Text style={styles.eventDesc}>
                        {ev.senderName || 'Participant'}{' '}
                        {ev.type === 'paid' ? 'paid their share of' : 'action on'}{' '}
                        {ev.amountMON ? (
                          <Text style={styles.amountHighlight}>{ev.amountMON} MON</Text>
                        ) : (
                          ''
                        )}
                      </Text>
                    </View>

                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>
                </AppCard>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <History size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No activity found</Text>
              <Text style={styles.emptySub}>
                Transactions will appear here as bills are created and paid.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default ActivityScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    gap: 4,
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: '#12121B',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(131, 110, 249, 0.15)',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 30,
  },
  eventCard: {
    padding: 14,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: 3,
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventBillTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  eventDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  amountHighlight: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
