import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { StepProgress } from '../../components/create/StepProgress';
import { StepOne } from '../../components/create/StepOne';
import { StepTwo } from '../../components/create/StepTwo';
import { StepThree } from '../../components/create/StepThree';
import { useWallet } from '../../hooks/useWallet';
import { useSplitFactory } from '../../hooks/useSplitFactory';
import { useUIStore } from '../../store/uiStore';

export default function CreateBillScreen() {
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [totalAmountMON, setTotalAmountMON] = useState('10.0');
  const [participants, setParticipants] = useState<string[]>([
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Alice default
  ]);

  const { address, isConnected, openWalletModal } = useWallet();
  const { createBill, isDeploying } = useSplitFactory();
  const { showToast } = useUIStore();

  const handleDeploy = async (): Promise<string | undefined> => {
    if (!isConnected || !address) {
      openWalletModal();
      return undefined;
    }

    try {
      const totalPeople = participants.length + 1;
      const splitAmount = (parseFloat(totalAmountMON) / totalPeople).toFixed(4);

      const billAddress = await createBill({
        title,
        description,
        participantAddresses: participants,
        splitAmountMON: splitAmount,
        deadlineHours: hasDeadline ? deadlineHours : 0,
      });

      return billAddress;
    } catch (err: any) {
      showToast({
        title: 'Deployment Failed',
        message: err?.message || 'Could not deploy bill',
        type: 'error',
      });
      return undefined;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StepProgress currentStep={step} />

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <StepOne
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              hasDeadline={hasDeadline}
              setHasDeadline={setHasDeadline}
              deadlineHours={deadlineHours}
              setDeadlineHours={setDeadlineHours}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepTwo
              totalAmountMON={totalAmountMON}
              setTotalAmountMON={setTotalAmountMON}
              participants={participants}
              setParticipants={setParticipants}
              currentUserAddress={address}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepThree
              title={title}
              description={description}
              totalAmountMON={totalAmountMON}
              participants={participants}
              hasDeadline={hasDeadline}
              deadlineHours={deadlineHours}
              currentUserAddress={address}
              isDeploying={isDeploying}
              onDeploy={handleDeploy}
              onBack={() => setStep(2)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
});
