import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppCard } from '../ui/AppCard';
import { AppButton } from '../ui/AppButton';
import { BlockieAvatar } from '../ui/BlockieAvatar';
import { formatAddress, formatUSD } from '../../lib/format';
import { DEMO_ACCOUNTS } from '../../store/walletStore';
import * as Clipboard from 'expo-clipboard';
import { safeHaptics } from '../../lib/haptics';
import { ethers } from 'ethers';
import { Plus, X, Clipboard as ClipboardIcon, Users, Sparkles } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

interface StepTwoProps {
  totalAmountMON: string;
  setTotalAmountMON: (val: string) => void;
  participants: string[];
  setParticipants: (list: string[]) => void;
  currentUserAddress?: string | null;
  onNext: () => void;
  onBack: () => void;
}

export function StepTwo({
  totalAmountMON,
  setTotalAmountMON,
  participants,
  setParticipants,
  currentUserAddress,
  onNext,
  onBack,
}: StepTwoProps) {
  const [addressInput, setAddressInput] = useState('');
  const [inputError, setInputError] = useState('');
  const { showToast } = useUIStore();

  const totalPeople = participants.length + 1; // Including creator
  const amountFloat = parseFloat(totalAmountMON) || 0;
  const eachPaysMON = totalPeople > 0 && amountFloat > 0 ? (amountFloat / totalPeople).toFixed(3) : '0.00';

  const handleAddAddress = (addrToAdd?: string) => {
    const raw = (addrToAdd || addressInput).trim();
    if (!raw) return;

    if (!ethers.isAddress(raw)) {
      setInputError('Invalid Ethereum / EVM address');
      return;
    }

    if (currentUserAddress && raw.toLowerCase() === currentUserAddress.toLowerCase()) {
      setInputError('You are already included as the organizer');
      return;
    }

    if (participants.some((p) => p.toLowerCase() === raw.toLowerCase())) {
      setInputError('Address already added');
      return;
    }

    if (participants.length >= 20) {
      setInputError('Maximum 20 participants allowed');
      return;
    }

    safeHaptics.light();

    setParticipants([...participants, raw]);
    setAddressInput('');
    setInputError('');
  };

  const handleRemove = (index: number) => {
    safeHaptics.light();
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handlePaste = async () => {
    const clipboardContent = await Clipboard.getStringAsync();
    if (clipboardContent) {
      setAddressInput(clipboardContent.trim());
      handleAddAddress(clipboardContent.trim());
    }
  };

  const isValid = amountFloat > 0 && participants.length >= 1;

  // Filter demo friends not yet added
  const availableDemoFriends = DEMO_ACCOUNTS.filter(
    (acc) =>
      (!currentUserAddress || acc.address.toLowerCase() !== currentUserAddress.toLowerCase()) &&
      !participants.some((p) => p.toLowerCase() === acc.address.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Amount & Participants</Text>
      <Text style={styles.sectionSubtitle}>
        Enter total bill and add friends by their EVM wallet address.
      </Text>

      {/* Bill Amount Input */}
      <AppCard style={styles.amountCard} variant="glow">
        <Text style={styles.inputLabel}>Total Bill Amount</Text>
        <View style={styles.amountInputRow}>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={totalAmountMON}
            onChangeText={(t) => {
              const cleaned = t.replace(/[^0-9.]/g, '');
              setTotalAmountMON(cleaned);
            }}
          />
          <View style={styles.monBadge}>
            <Text style={styles.monBadgeText}>MON</Text>
          </View>
        </View>
        <Text style={styles.usdEstimate}>≈ {formatUSD(totalAmountMON)} USD</Text>
      </AppCard>

      {/* Add Participants Input */}
      <AppCard style={styles.participantCard}>
        <View style={styles.participantHeader}>
          <Text style={styles.inputLabel}>Invite Friends ({participants.length}/20)</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePaste}
            style={styles.pasteButton}
          >
            <ClipboardIcon size={12} color={colors.primaryLight} />
            <Text style={styles.pasteText}>Paste</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.addressInput, !!inputError && styles.inputErrorBorder]}
            placeholder="Enter EVM address (0x...)"
            placeholderTextColor={colors.textMuted}
            value={addressInput}
            onChangeText={(t) => {
              setAddressInput(t);
              setInputError('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleAddAddress()}
            style={styles.addButton}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {inputError ? (
          <Text style={styles.errorText}>{inputError}</Text>
        ) : null}

        {/* Quick-Add Demo Friends */}
        {availableDemoFriends.length > 0 ? (
          <View style={styles.quickAddWrap}>
            <Text style={styles.quickAddLabel}>Quick add friends:</Text>
            <View style={styles.quickAddChips}>
              {availableDemoFriends.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  activeOpacity={0.7}
                  onPress={() => handleAddAddress(f.address)}
                  style={styles.quickChip}
                >
                  <BlockieAvatar address={f.address} size={18} />
                  <Text style={styles.quickChipText}>{f.name.split(' ')[0]}</Text>
                  <Plus size={11} color={colors.primaryLight} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Added Participant Chips */}
        {participants.length > 0 ? (
          <View style={styles.chipsContainer}>
            <Text style={styles.chipsLabel}>Added Participants:</Text>
            <View style={styles.chipsWrap}>
              {participants.map((addr, index) => {
                const demoFriend = DEMO_ACCOUNTS.find(
                  (a) => a.address.toLowerCase() === addr.toLowerCase()
                );
                return (
                  <View key={addr} style={styles.chip}>
                    <BlockieAvatar address={addr} size={20} />
                    <Text style={styles.chipText}>
                      {demoFriend ? demoFriend.name.split(' ')[0] : formatAddress(addr, 4, 4)}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleRemove(index)}
                      style={styles.chipRemove}
                    >
                      <X size={12} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </AppCard>

      {/* Live Split Calculation Summary Card */}
      <AppCard style={styles.summaryCard} variant="elevated">
        <View style={styles.summaryTitleRow}>
          <Sparkles size={16} color={colors.primaryLight} />
          <Text style={styles.summaryTitle}>Live Split Breakdown</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryMetricLabel}>Total Amount</Text>
            <Text style={styles.summaryMetricVal}>{amountFloat.toFixed(2)} MON</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryCol}>
            <Text style={styles.summaryMetricLabel}>Group Size</Text>
            <Text style={styles.summaryMetricVal}>{totalPeople} (incl. you)</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryCol}>
            <Text style={styles.summaryMetricLabel}>Each Pays</Text>
            <Text style={[styles.summaryMetricVal, styles.eachPaysHighlight]}>
              {eachPaysMON} MON
            </Text>
          </View>
        </View>
      </AppCard>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <AppButton
          title="Back"
          onPress={onBack}
          variant="secondary"
          size="lg"
          style={{ flex: 1 }}
        />
        <AppButton
          title="Review Split"
          onPress={onNext}
          variant="primary"
          size="lg"
          disabled={!isValid}
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: -8,
  },
  amountCard: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  monBadge: {
    backgroundColor: 'rgba(131, 110, 249, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  monBadgeText: {
    color: colors.primaryLight,
    fontWeight: '800',
    fontSize: 13,
  },
  usdEstimate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  participantCard: {
    gap: 12,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(131, 110, 249, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  pasteText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addressInput: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  inputErrorBorder: {
    borderColor: colors.error,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: -4,
  },
  quickAddWrap: {
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickAddLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  quickAddChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  quickChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipsContainer: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  chipsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipRemove: {
    padding: 2,
  },
  summaryCard: {
    gap: 12,
    backgroundColor: '#151522',
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1E1E2E',
  },
  summaryMetricLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  summaryMetricVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  eachPaysHighlight: {
    color: colors.success,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
