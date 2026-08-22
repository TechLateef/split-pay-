import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Check } from 'lucide-react-native';

interface StepProgressProps {
  currentStep: number;
}

const STEPS = [
  { step: 1, title: 'Details' },
  { step: 2, title: 'Split' },
  { step: 3, title: 'Confirm' },
];

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <View style={styles.container}>
      {STEPS.map((item, index) => {
        const isCompleted = currentStep > item.step;
        const isCurrent = currentStep === item.step;
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={item.step}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isCurrent && styles.circleCurrent,
                ]}
              >
                {isCompleted ? (
                  <Check size={12} color="#0A0A0F" strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isCurrent && styles.stepNumberCurrent,
                    ]}
                  >
                    {item.step}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  (isCurrent || isCompleted) && styles.stepTitleActive,
                ]}
              >
                {item.title}
              </Text>
            </View>

            {!isLast ? (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#12121B',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: colors.success,
  },
  circleCurrent: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stepNumberCurrent: {
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  stepTitleActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#1E1E2E',
    marginHorizontal: 8,
  },
  connectorCompleted: {
    backgroundColor: colors.success,
  },
});
