import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { useWallet } from '../hooks/useWallet';
import { router } from 'expo-router';
import { Zap, ShieldCheck, Coins, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    icon: <Zap size={24} color={colors.primaryLight} />,
    title: 'Instant 0.6s Finality',
    desc: 'Powered by Monad. Payments settle faster than swiping a credit card.',
    badge: '0.6s Speed',
  },
  {
    icon: <Coins size={24} color={colors.success} />,
    title: 'Fractions of a Cent',
    desc: 'Splitting a $15 dinner shouldn’t cost $10 in gas. Monad fees are near-zero.',
    badge: '< $0.001 Gas',
  },
  {
    icon: <ShieldCheck size={24} color="#38BDF8" />,
    title: '100% Trustless & Fair',
    desc: 'Isolated smart contracts hold each bill. Automatic refund protection built in.',
    badge: 'Non-Custodial',
  },
];

export default function OnboardingScreen() {
  const { connectDemoAccount, demoAccounts } = useWallet();

  const handleStart = async () => {
    // Default to organizer account and navigate
    await connectDemoAccount(demoAccounts[0]);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Glow Header */}
        <View style={styles.topGlowWrap}>
          <View style={styles.glowCircle} />
        </View>

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Zap size={32} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.brandTitle}>SplitPay</Text>
          <Text style={styles.tagline}>Split Bills. Not Trust.</Text>
          <Text style={styles.subTagline}>
            The next-generation on-chain split payment protocol deployed on Monad Testnet.
          </Text>
        </View>

        {/* Feature Cards Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScroll}
          snapToInterval={width * 0.78 + 12}
          decelerationRate="fast"
        >
          {FEATURES.map((item, idx) => (
            <AppCard key={idx} style={styles.featureCard} variant="glow">
              <View style={styles.featureTop}>
                <View style={styles.featureIconWrap}>{item.icon}</View>
                <View style={styles.featureBadge}>
                  <Text style={styles.featureBadgeText}>{item.badge}</Text>
                </View>
              </View>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDesc}>{item.desc}</Text>
            </AppCard>
          ))}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.footer}>
          <AppButton
            title="Launch SplitPay"
            onPress={handleStart}
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            fullWidth
          />
          <Text style={styles.footerHelp}>
            Pre-configured with Monad Testnet accounts for instant judging.
          </Text>
        </View>
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
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  topGlowWrap: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(131, 110, 249, 0.2)',
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  subTagline: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  cardsScroll: {
    paddingHorizontal: 4,
    gap: 12,
    alignItems: 'center',
  },
  featureCard: {
    width: width * 0.76,
    padding: 20,
    gap: 12,
    backgroundColor: '#131320',
    borderRadius: 22,
  },
  featureTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadge: {
    backgroundColor: 'rgba(131, 110, 249, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  footer: {
    gap: 12,
    marginBottom: 10,
  },
  footerHelp: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
