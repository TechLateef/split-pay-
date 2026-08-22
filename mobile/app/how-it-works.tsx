import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors } from '../theme/colors';
import { AppCard } from '../components/ui/AppCard';
import { AppButton } from '../components/ui/AppButton';
import { MONAD_TESTNET } from '../lib/monadChain';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Zap,
  Shield,
  Coins,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react-native';

export default function HowItWorksScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>How SplitPay Works</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner */}
          <AppCard style={styles.heroCard} variant="glow">
            <View style={styles.heroBadge}>
              <Zap size={14} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>High-Performance EVM</Text>
            </View>
            <Text style={styles.heroTitle}>
              Real-World Micro-Payments Made Viable on Monad
            </Text>
            <Text style={styles.heroDesc}>
              On Ethereum mainnet, splitting a $20 meal costs $10 in gas fees and takes minutes. On Monad, transactions settle in 0.6 seconds with gas fees under $0.001.
            </Text>
          </AppCard>

          {/* 3 Step Protocol Flow */}
          <Text style={styles.sectionHeading}>The 3-Step Protocol Lifecycle</Text>

          <AppCard style={styles.stepCard}>
            <View style={styles.stepNumCol}>
              <View style={styles.stepNumBadge}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Create & Fund Upfront</Text>
              <Text style={styles.stepDesc}>
                The organizer sets the total bill and invites friends. The SplitFactory deploys an isolated <Text style={styles.highlight}>SplitBill.sol</Text> contract and collects the creator's share upfront.
              </Text>
            </View>
          </AppCard>

          <AppCard style={styles.stepCard}>
            <View style={styles.stepNumCol}>
              <View style={styles.stepNumBadge}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Deep Link & 1-Click Pay</Text>
              <Text style={styles.stepDesc}>
                Friends receive a <Text style={styles.highlight}>splitpay://bill/0x...</Text> link. Tapping it opens the bill directly. One tap confirms payment in under 1 second.
              </Text>
            </View>
          </AppCard>

          <AppCard style={styles.stepCard}>
            <View style={styles.stepNumCol}>
              <View style={[styles.stepNumBadge, { backgroundColor: colors.success }]}>
                <Text style={[styles.stepNumText, { color: '#0A0A0F' }]}>3</Text>
              </View>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Auto-Settlement & Payout</Text>
              <Text style={styles.stepDesc}>
                Once the final friend pays, the contract automatically enters <Text style={styles.highlight}>Settled</Text> state. The organizer withdraws the total pooled funds directly to their wallet.
              </Text>
            </View>
          </AppCard>

          {/* Security & Refunds */}
          <AppCard style={styles.securityCard} variant="accentGlow">
            <View style={styles.securityHeader}>
              <Shield size={20} color={colors.success} />
              <Text style={styles.securityTitle}>Non-Custodial Trustless Refunds</Text>
            </View>
            <Text style={styles.securityDesc}>
              • If the organizer cancels the bill before settlement, any contributor can immediately claim 100% of their share back.
              {'\n'}• If a payment deadline expires without all friends paying, refunds are automatically unlocked for all participants.
              {'\n'}• Pull-over-push pattern prevents reentrancy and denial-of-service vulnerabilities.
            </Text>
          </AppCard>

          {/* Links */}
          <View style={styles.linksRow}>
            <AppButton
              title="Explore Monad Testnet"
              onPress={() => Linking.openURL(MONAD_TESTNET.blockExplorers.default.url)}
              variant="secondary"
              size="md"
              icon={<ExternalLink size={14} color={colors.primaryLight} />}
              fullWidth
            />
          </View>
        </ScrollView>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#12121B',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    padding: 20,
    gap: 10,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  heroDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  stepNumCol: {
    alignItems: 'center',
  },
  stepNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  highlight: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  securityCard: {
    gap: 10,
    padding: 16,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },
  securityDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  linksRow: {
    marginTop: 8,
  },
});
