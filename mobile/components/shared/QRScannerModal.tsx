import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../../theme/colors';
import { AppButton } from '../ui/AppButton';
import { useUIStore } from '../../store/uiStore';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { safeHaptics } from '../../lib/haptics';
import { X, Scan, Camera, Keyboard, Clipboard as ClipboardIcon, AlertCircle } from 'lucide-react-native';

export function QRScannerModal() {
  const { isQRScannerOpen, closeQRScanner, showToast } = useUIStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualInput, setManualInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [isScanned, setIsScanned] = useState(false);

  useEffect(() => {
    if (isQRScannerOpen) {
      setIsScanned(false);
      setManualInput('');
      setInputError('');
      if (!permission?.granted) {
        requestPermission();
      }
    }
  }, [isQRScannerOpen]);

  if (!isQRScannerOpen) return null;

  const extractAddress = (raw: string): string | null => {
    const trimmed = raw.trim();
    // Check if it's splitpay://bill/0x...
    const matchScheme = trimmed.match(/splitpay:\/\/bill\/(0x[a-fA-F0-9]{40})/i);
    if (matchScheme) return matchScheme[1];

    // Check if it's a URL ending with 0x...
    const matchUrl = trimmed.match(/(0x[a-fA-F0-9]{40})/i);
    if (matchUrl) return matchUrl[1];

    return null;
  };

  const handleProcessCode = (data: string) => {
    if (isScanned) return;
    const address = extractAddress(data);

    if (address) {
      setIsScanned(true);
      safeHaptics.success();

      closeQRScanner();
      showToast({
        title: 'Bill Found!',
        message: `Opening contract ${address.slice(0, 10)}...`,
        type: 'success',
      });

      router.push(`/bill/${address}`);
    } else {
      setInputError('Could not find a valid SplitPay bill address');
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    handleProcessCode(data);
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setInputError('Please enter a bill address or deep link');
      return;
    }
    const address = extractAddress(manualInput);
    if (address) {
      handleProcessCode(address);
    } else {
      setInputError('Invalid SplitPay bill address or link format');
    }
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setManualInput(text.trim());
      const address = extractAddress(text);
      if (address) {
        handleProcessCode(address);
      }
    }
  };

  return (
    <Modal
      visible={isQRScannerOpen}
      transparent
      animationType="slide"
      onRequestClose={closeQRScanner}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Scan size={20} color={colors.primaryLight} />
              <Text style={styles.title}>Scan Bill QR Code</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={closeQRScanner}
              style={styles.closeBtn}
            >
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Mode Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('camera')}
              style={[styles.modeTab, mode === 'camera' && styles.modeTabActive]}
            >
              <Camera size={14} color={mode === 'camera' ? colors.primaryLight : colors.textMuted} />
              <Text style={[styles.modeTabText, mode === 'camera' && styles.modeTabTextActive]}>
                Camera Scanner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('manual')}
              style={[styles.modeTab, mode === 'manual' && styles.modeTabActive]}
            >
              <Keyboard size={14} color={mode === 'manual' ? colors.primaryLight : colors.textMuted} />
              <Text style={[styles.modeTabText, mode === 'manual' && styles.modeTabTextActive]}>
                Enter Address / Link
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scanner View */}
          {mode === 'camera' ? (
            permission?.granted ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                  onBarcodeScanned={isScanned ? undefined : handleBarcodeScanned}
                >
                  <View style={styles.overlay}>
                    <View style={styles.scanTarget}>
                      <View style={[styles.corner, styles.tl]} />
                      <View style={[styles.corner, styles.tr]} />
                      <View style={[styles.corner, styles.bl]} />
                      <View style={[styles.corner, styles.br]} />
                    </View>
                    <Text style={styles.scanInstruction}>
                      Point camera at friend's SplitPay QR code
                    </Text>
                  </View>
                </CameraView>
              </View>
            ) : (
              <View style={styles.permissionBox}>
                <AlertCircle size={32} color={colors.warning} />
                <Text style={styles.permTitle}>Camera Access Required</Text>
                <Text style={styles.permSub}>
                  Allow camera permissions to scan friend's bill QR codes directly.
                </Text>
                <AppButton
                  title="Grant Permission"
                  onPress={requestPermission}
                  variant="primary"
                  size="sm"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setMode('manual')}
                  style={{ marginTop: 8 }}
                >
                  <Text style={styles.altText}>Or enter address manually</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View style={styles.manualBox}>
              <View style={styles.pasteHeader}>
                <Text style={styles.inputLabel}>Paste Bill Link or Contract Address</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handlePaste}
                  style={styles.pasteBtn}
                >
                  <ClipboardIcon size={12} color={colors.primaryLight} />
                  <Text style={styles.pasteBtnText}>Paste</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.textInput, !!inputError && styles.inputErrorBorder]}
                placeholder="splitpay://bill/0x... or 0x..."
                placeholderTextColor={colors.textMuted}
                value={manualInput}
                onChangeText={(t) => {
                  setManualInput(t);
                  setInputError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}

              <AppButton
                title="Open Bill"
                onPress={handleManualSubmit}
                variant="primary"
                size="md"
                fullWidth
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.9)',
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
    gap: 14,
  },
  header: {
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
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: 'rgba(131, 110, 249, 0.15)',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  modeTabTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  cameraContainer: {
    width: '100%',
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  scanTarget: {
    width: 170,
    height: 170,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.primaryLight,
  },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  scanInstruction: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  permissionBox: {
    height: 220,
    backgroundColor: '#0A0A0F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  permTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  permSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 6,
  },
  altText: {
    fontSize: 12,
    color: colors.primaryLight,
    textDecorationLine: 'underline',
  },
  manualBox: {
    gap: 10,
    paddingVertical: 10,
  },
  pasteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(131, 110, 249, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  pasteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  textInput: {
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  inputErrorBorder: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
  },
});