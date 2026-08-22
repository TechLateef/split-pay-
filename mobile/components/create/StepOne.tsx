import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppCard } from '../ui/AppCard';
import { AppButton } from '../ui/AppButton';
import { Clock, FileText, Calendar } from 'lucide-react-native';

interface StepOneProps {
  title: string;
  setTitle: (text: string) => void;
  description: string;
  setDescription: (text: string) => void;
  hasDeadline: boolean;
  setHasDeadline: (val: boolean) => void;
  deadlineHours: number;
  setDeadlineHours: (hours: number) => void;
  onNext: () => void;
}

const DEADLINE_PRESETS = [
  { label: '6 Hours', value: 6 },
  { label: '24 Hours', value: 24 },
  { label: '3 Days', value: 72 },
  { label: '7 Days', value: 168 },
];

export function StepOne({
  title,
  setTitle,
  description,
  setDescription,
  hasDeadline,
  setHasDeadline,
  deadlineHours,
  setDeadlineHours,
  onNext,
}: StepOneProps) {
  const isValid = title.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>What are you splitting?</Text>
      <Text style={styles.sectionSubtitle}>
        Give your bill a clear title and optional notes for your group.
      </Text>

      {/* Bill Title Input */}
      <AppCard style={styles.inputCard}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>Bill Title *</Text>
          <Text style={styles.charCount}>{title.length}/80</Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Dinner at Yellow Chilli 🌶️"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={(t) => setTitle(t.slice(0, 80))}
          maxLength={80}
          autoFocus
        />
      </AppCard>

      {/* Bill Description Input */}
      <AppCard style={styles.inputCard}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>Description / Memo (Optional)</Text>
          <Text style={styles.charCount}>{description.length}/300</Text>
        </View>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          placeholder="Add notes, breakdown, or celebration details..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={(t) => setDescription(t.slice(0, 300))}
          maxLength={300}
          multiline
          numberOfLines={3}
        />
      </AppCard>

      {/* Deadline Toggle & Config */}
      <AppCard style={styles.deadlineCard}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <View style={styles.iconRow}>
              <Clock size={16} color={colors.primaryLight} />
              <Text style={styles.toggleTitle}>Set Payment Deadline</Text>
            </View>
            <Text style={styles.toggleSub}>
              Friends who miss the deadline can claim refunds automatically.
            </Text>
          </View>
          <Switch
            value={hasDeadline}
            onValueChange={setHasDeadline}
            trackColor={{ false: '#1E1E2E', true: colors.primary }}
            thumbColor={hasDeadline ? '#FFFFFF' : '#8B8BA7'}
          />
        </View>

        {hasDeadline ? (
          <View style={styles.presetsWrap}>
            <Text style={styles.presetLabel}>Select window:</Text>
            <View style={styles.presetsGrid}>
              {DEADLINE_PRESETS.map((p) => {
                const isSelected = deadlineHours === p.value;
                return (
                  <TouchableOpacity
                    key={p.value}
                    activeOpacity={0.7}
                    onPress={() => setDeadlineHours(p.value)}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextSelected,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </AppCard>

      {/* Continue Button */}
      <View style={styles.footer}>
        <AppButton
          title="Continue to Participants"
          onPress={onNext}
          variant="primary"
          size="lg"
          disabled={!isValid}
          fullWidth
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
  inputCard: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  textInput: {
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  deadlineCard: {
    gap: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleSub: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  presetsWrap: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  presetChipSelected: {
    backgroundColor: 'rgba(131, 110, 249, 0.15)',
    borderColor: colors.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetChipTextSelected: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  footer: {
    marginTop: 8,
  },
});
