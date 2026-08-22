import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../../theme/colors';
import { formatDateTime } from '../../lib/format';
import { MONAD_TESTNET } from '../../lib/monadChain';
import { Check, Plus, Award, AlertCircle, ArrowUpRight, RotateCcw } from 'lucide-react-native';

interface HistoryItem {
  id: string;
  type: 'created' | 'paid' | 'settled' | 'cancelled' | 'refunded' | 'withdrawn';
  senderAddress: string;
  senderName?: string;
  amountMON?: string;
  timestamp: number;
  txHash?: string;
}

interface TransactionFeedProps {
  history: HistoryItem[];
}

export function TransactionFeed({ history }: TransactionFeedProps) {
  if (!history || history.length === 0) {
    return null;
  }

  const getItemVisuals = (type: HistoryItem['type']) => {
    switch (type) {
      case 'created':
        return {
          icon: <Plus size={12} color="#FFFFFF" />,
          dotBg: colors.primary,
          title: 'Bill Created on Monad',
        };
      case 'paid':
        return {
          icon: <Check size={12} color="#0A0A0F" />,
          dotBg: colors.success,
          title: 'Share Paid',
        };
      case 'settled':
        return {
          icon: <Award size={12} color="#0A0A0F" />,
          dotBg: '#FCD34D',
          title: 'Bill Settled! 🎉',
        };
      case 'cancelled':
        return {
          icon: <AlertCircle size={12} color="#FFFFFF" />,
          dotBg: colors.error,
          title: 'Bill Cancelled',
        };
      case 'refunded':
        return {
          icon: <RotateCcw size={12} color="#FFFFFF" />,
          dotBg: colors.warning,
          title: 'Refund Claimed',
        };
      case 'withdrawn':
        return {
          icon: <Check size={12} color="#FFFFFF" />,
          dotBg: colors.primaryDark,
          title: 'Funds Withdrawn by Host',
        };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Activity & On-Chain Timeline</Text>
      <View style={styles.timeline}>
        {history.map((item, index) => {
          const visual = getItemVisuals(item.type);
          const isLast = index === history.length - 1;

          return (
            <View key={item.id} style={styles.timelineRow}>
              {/* Vertical line and dot */}
              <View style={styles.leftCol}>
                <View style={[styles.dot, { backgroundColor: visual.dotBg }]}>
                  {visual.icon}
                </View>
                {!isLast ? <View style={styles.line} /> : null}
              </View>

              {/* Event Content */}
              <View style={styles.rightCol}>
                <View style={styles.headerRow}>
                  <Text style={styles.eventTitle}>{visual.title}</Text>
                  <Text style={styles.timeText}>{formatDateTime(item.timestamp)}</Text>
                </View>
                <Text style={styles.descText}>
                  {item.senderName || item.senderAddress.slice(0, 8)}
                  {item.amountMON ? ` • ${item.amountMON} MON` : ''}
                </Text>

                {item.txHash ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      Linking.openURL(
                        `${MONAD_TESTNET.blockExplorers.default.url}/tx/${item.txHash}`
                      )
                    }
                    style={styles.explorerLink}
                  >
                    <Text style={styles.explorerText}>View 0.6s tx on Explorer</Text>
                    <ArrowUpRight size={12} color={colors.primaryLight} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  leftCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  rightCol: {
    flex: 1,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  descText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  explorerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  explorerText: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
  },
});
