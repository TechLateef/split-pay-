import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../../theme/colors';
import { AppButton } from '../ui/AppButton';
import { AddressBadge } from '../ui/AddressBadge';
import { useUIStore } from '../../store/uiStore';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { X, QrCode, Share2, Copy, Zap } from 'lucide-react-native';

export function QRCodeModal() {
  const { activeQRData, closeQRModal, showToast } = useUIStore();

  if (!activeQRData) return null;

  const deepLink = `splitpay://bill/${activeQRData.billAddress}`;

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(deepLink);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast({
        title: 'Deep Link Copied!',
        message: deepLink,
        type: 'success',
      });
    } catch {}
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Pay split: ${activeQRData.title}`,
        message: `Hey! Pay your share for ${activeQRData.title}.\nAmount: ${activeQRData.splitAmountMON} MON\nOpen in SplitPay: ${deepLink}\n(Instant 0.6s finality on Monad Testnet)`,
        url: deepLink,
      });
    } catch {}
  };

  return (
    <Modal
      visible={!!activeQRData}
      transparent
      animationType="fade"
      onRequestClose={closeQRModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <QrCode size={20} color={colors.primaryLight} />
              <Text style={styles.title}>Scan to Pay</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={closeQRModal}
              style={styles.closeBtn}
            >
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.billTitle} numberOfLines={1}>
            {activeQRData.title}
          </Text>
          <Text style={styles.shareText}>
            Share amount:{' '}
            <Text style={styles.amountHighlight}>
              {activeQRData.splitAmountMON} MON
            </Text>
          </Text>

          {/* QR Code Frame */}
          <View style={styles.qrContainer}>
            <View style={styles.qrInner}>
              <QRCode
                value={deepLink}
                size={200}
                color="#0A0A0F"
                backgroundColor="#FFFFFF"
                quietZone={12}
              />
            </View>
            <View style={styles.monadPill}>
              <Zap size={12} color="#FFFFFF" />
              <Text style={styles.monadPillText}>Monad 0.6s Instant Pay</Text>
            </View>
          </View>

          <AddressBadge address={activeQRData.billAddress} start={6} end={6} />

          <Text style={styles.hintText}>
            Friends can scan this QR code with the SplitPay in-app scanner or camera to join and pay instantly.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <AppButton
              title="Copy Link"
              onPress={handleCopyLink}
              variant="secondary"
              size="md"
              icon={<Copy size={16} color={colors.primaryLight} />}
              style={{ flex: 1 }}
            />
            <AppButton
              title="Share Link"
              onPress={handleShare}
              variant="primary"
              size="md"
              icon={<Share2 size={16} color="#FFFFFF" />}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#12121B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  shareText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  amountHighlight: {
    color: colors.success,
    fontWeight: '800',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 4,
    gap: 8,
  },
  qrInner: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  monadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  monadPillText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  hintText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
});