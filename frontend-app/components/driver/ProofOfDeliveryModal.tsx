import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  CheckCircle,
  Camera,
  Phone,
  AlertTriangle,
  X,
  FileText,
  MapPin,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import { useTheme } from '@/hooks/ThemeContext';
import { useAlert } from '@/components/shared/CustomAlert';
import { orpc } from '@/hooks/orpc';
import { uploadImage } from '@/utils/upload';

interface ProofOfDeliveryModalProps {
  visible: boolean;
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProofOfDeliveryModal({
  visible,
  order,
  onClose,
  onSuccess,
}: ProofOfDeliveryModalProps) {
  const { colors: themeColors, isDark } = useTheme();
  const { showAlert } = useAlert();
  const styles = createStyles(themeColors, isDark);

  const [pin, setPin] = useState('');
  const [waybillUri, setWaybillUri] = useState<string | null>(null);
  const [cargoUri, setCargoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFallbacks, setShowFallbacks] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  // Handle Photo Capture for Signed Paper Waybill
  const handleSnapWaybill = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'Camera Permission',
          message: 'Camera permission is required to photograph the signed delivery receipt.',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setWaybillUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[PoD] Camera error:', err);
    }
  };

  // Primary Path: Verify via 4-Digit Receiver PIN
  const handleVerifyWithPin = async () => {
    if (!pin || pin.trim().length < 4) {
      showAlert({
        title: 'Enter 4-Digit PIN',
        message: 'Please ask the receiver or shipper for the 4-digit verification code.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedWaybillId: string | undefined;
      if (waybillUri) {
        uploadedWaybillId = await uploadImage(waybillUri, { documentType: 'waybill_pod' });
      }

      const res = await orpc.order.completeWithPoD({
        orderId: order.id,
        pin: pin.trim(),
        waybillPhoto: uploadedWaybillId,
        fallbackMethod: 'receiver_pin',
      });

      if (res.success) {
        showAlert({
          title: '🎉 Delivery Completed!',
          message: `Escrow payout of ${res.driverPayout?.toLocaleString() || order.finalPrice} ETB has been credited to your wallet!`,
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      showAlert({
        title: 'PIN Verification Failed',
        message: err?.message || 'Invalid PIN. Please try again or use the signed paper receipt option.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback 2: Verify via GPS Geofence + Signed Paper Waybill Photo
  const handleVerifyWithWaybillAndGPS = async () => {
    if (!waybillUri) {
      showAlert({
        title: 'Waybill Photo Required',
        message: 'Please snap a photo of the physical signed receipt (ተቀባይ ደረሰኝ) with the receiver stamp or Kebele ID.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get high-precision current GPS coordinate
      let coords: { latitude: number; longitude: number } | undefined;
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      } catch (locErr) {
        console.warn('[PoD] GPS acquisition error:', locErr);
      }

      // Upload Waybill Photo
      const uploadedWaybillId = await uploadImage(waybillUri, { documentType: 'waybill_pod' });

      const res = await orpc.order.completeWithPoD({
        orderId: order.id,
        waybillPhoto: uploadedWaybillId,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        fallbackMethod: 'signed_waybill',
      });

      if (res.success) {
        if ((res as any).pendingManagerReview) {
          showAlert({
            title: '📄 ደረሰኝ ተልኳል (Receipt Submitted)',
            message: 'የተፈረመበት ደረሰኝ ለከተማው ማናጀር ተልኳል። ማናጀሩ በ2-3 ደቂቃ ውስጥ አረጋግጦ ክፍያውን ወደ ዋሌትዎ ይለቃል (Town manager will review the signed waybill photo and release escrow payout in 2-3 mins).',
          });
        } else {
          showAlert({
            title: '✅ Delivery Verified via Paper Receipt',
            message: `Delivery confirmed at destination. Payout of ${res.driverPayout?.toLocaleString() || order.finalPrice} ETB has been credited to your wallet!`,
          });
        }
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      showAlert({
        title: 'Submission Error',
        message: err?.message || 'Failed to verify delivery. Please ensure you are at the delivery location.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Dispute / Damaged Cargo Report
  const handleSubmitDispute = async () => {
    if (!disputeReason || disputeReason.trim().length < 5) {
      showAlert({
        title: 'Reason Required',
        message: 'Please provide details about the cargo issue or dispute.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await orpc.order.reportPoDDispute({
        orderId: order.id,
        reason: disputeReason.trim(),
      });
      showAlert({
        title: 'Dispute Reported',
        message: 'Your report has been logged. The local Town Manager and Call Center have been notified to inspect and mediate.',
      });
      setShowDispute(false);
      onClose();
    } catch (err: any) {
      showAlert({
        title: 'Report Error',
        message: err?.message || 'Failed to submit report.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerPhone = order?.customerPhone || '';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ShieldCheck size={24} color={colors.primary} />
              <Text style={styles.headerTitle}>Proof of Delivery (ተቀባይ ማረጋገጫ)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Cargo / Destination Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <MapPin size={16} color={colors.primary} />
                <Text style={styles.summaryDest} numberOfLines={1}>
                  {order?.deliveryAddress || 'Destination Warehouse'}
                </Text>
              </View>
              <Text style={styles.summaryAmount}>
                Net Payout: <Text style={{ color: colors.success }}>{order?.finalPrice || '0'} ETB</Text>
              </Text>
            </View>

            {/* Standard PIN Entry */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                1. Enter 4-Digit Receiver PIN (የተቀባይ 4-ዲጂት ኮድ)
              </Text>
              <Text style={styles.sectionSubtitle}>
                Receiver received this PIN via SMS upon your arrival.
              </Text>

              <View style={styles.pinInputRow}>
                <TextInput
                  style={styles.pinInput}
                  value={pin}
                  onChangeText={setPin}
                  placeholder="• • • •"
                  placeholderTextColor={themeColors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={4}
                  textAlign="center"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryActionBtn, (!pin || pin.length < 4 || isSubmitting) && styles.disabledBtn]}
                onPress={handleVerifyWithPin}
                disabled={!pin || pin.length < 4 || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircle size={18} color="#FFFFFF" />
                    <Text style={styles.primaryActionBtnText}>Verify PIN & Get Paid Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Optional/Signed Waybill Photo */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                2. Signed Paper Waybill Photo (የተፈረመ ደረሰኝ ፎቶ)
              </Text>
              <Text style={styles.sectionSubtitle}>
                Snap a photo of the stamped receipt or bill of lading (ደረሰኝ)
              </Text>

              {waybillUri ? (
                <View style={styles.photoPreviewBox}>
                  <Image source={{ uri: waybillUri }} style={styles.photoPreview} />
                  <TouchableOpacity style={styles.retakeBtn} onPress={handleSnapWaybill}>
                    <Text style={styles.retakeBtnText}>Retake Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.snapBtn} onPress={handleSnapWaybill}>
                  <Camera size={20} color={colors.primary} />
                  <Text style={styles.snapBtnText}>Snap Stamped Waybill (ደረሰኝ)</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Emergency Fallback Section */}
            <View style={styles.fallbackContainer}>
              <TouchableOpacity
                style={styles.fallbackHeader}
                onPress={() => setShowFallbacks(!showFallbacks)}
                activeOpacity={0.7}
              >
                <HelpCircle size={16} color={colors.warning} />
                <Text style={styles.fallbackHeaderText}>
                  Receiver phone is off or has no network?
                </Text>
              </TouchableOpacity>

              {showFallbacks && (
                <View style={styles.fallbackBody}>
                  <Text style={styles.fallbackNotice}>
                    If the warehouse receiver is unreachable, choose one of these instant options:
                  </Text>

                  {/* Fallback Option A: Call Shipper */}
                  <TouchableOpacity
                    style={styles.fallbackBtn}
                    onPress={() => {
                      if (customerPhone) {
                        Linking.openURL(`tel:${customerPhone}`);
                      } else {
                        showAlert({ title: 'No Phone', message: 'Shipper phone number not available.' });
                      }
                    }}
                  >
                    <Phone size={16} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fallbackBtnTitle}>Call Shipper for Backup PIN</Text>
                      <Text style={styles.fallbackBtnSub}>The shipper sees the backup PIN on their app</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Fallback Option B: GPS + Waybill */}
                  <TouchableOpacity
                    style={[styles.fallbackBtn, !waybillUri && { opacity: 0.6 }]}
                    onPress={handleVerifyWithWaybillAndGPS}
                    disabled={isSubmitting}
                  >
                    <FileText size={16} color={colors.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fallbackBtnTitle}>Submit via GPS & Signed Receipt</Text>
                      <Text style={styles.fallbackBtnSub}>
                        {waybillUri ? 'Photo ready • Tap to verify via GPS' : 'Take waybill photo above first'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Fallback Option C: Call Support */}
                  <TouchableOpacity
                    style={styles.fallbackBtn}
                    onPress={() => Linking.openURL('tel:994')}
                  >
                    <Phone size={16} color={colors.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fallbackBtnTitle}>Call Dispatcher / Town Manager</Text>
                      <Text style={styles.fallbackBtnSub}>Speak to local coordinator for manual release</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Report Dispute Button */}
            <TouchableOpacity
              style={styles.disputeLink}
              onPress={() => setShowDispute(true)}
            >
              <AlertTriangle size={14} color={colors.error} />
              <Text style={styles.disputeLinkText}>Report Cargo Damage or Quantity Shortage</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Dispute Input Modal */}
          {showDispute && (
            <View style={styles.disputeModal}>
              <Text style={styles.disputeTitle}>Report Delivery Issue</Text>
              <TextInput
                style={styles.disputeInput}
                placeholder="Describe the issue (e.g. 5 bags damaged by rain, receiver absent)..."
                placeholderTextColor={themeColors.textSecondary}
                value={disputeReason}
                onChangeText={setDisputeReason}
                multiline
                numberOfLines={3}
              />
              <View style={styles.disputeActions}>
                <TouchableOpacity
                  style={styles.disputeCancelBtn}
                  onPress={() => setShowDispute(false)}
                >
                  <Text style={styles.disputeCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.disputeSubmitBtn}
                  onPress={handleSubmitDispute}
                  disabled={isSubmitting}
                >
                  <Text style={styles.disputeSubmitText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (themeColors: any, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: themeColors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: '90%',
      paddingBottom: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA',
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    headerTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: themeColors.text,
    },
    closeBtn: {
      padding: spacing.xs,
    },
    scrollContent: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    summaryCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
      borderRadius: 16,
      padding: spacing.md,
      gap: spacing.xs,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    summaryDest: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: themeColors.text,
      flex: 1,
    },
    summaryAmount: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: themeColors.textSecondary,
    },
    section: {
      gap: spacing.xs,
    },
    sectionLabel: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: themeColors.text,
    },
    sectionSubtitle: {
      fontSize: fontSize.xs,
      color: themeColors.textSecondary,
      marginBottom: spacing.xs,
    },
    pinInputRow: {
      alignItems: 'center',
      marginVertical: spacing.xs,
    },
    pinInput: {
      width: 180,
      height: 52,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 14,
      fontSize: 28,
      fontWeight: fontWeight.bold,
      color: themeColors.text,
      letterSpacing: 12,
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    },
    primaryActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success,
      paddingVertical: spacing.md,
      borderRadius: 14,
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    disabledBtn: {
      opacity: 0.5,
    },
    primaryActionBtnText: {
      color: '#FFFFFF',
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
    snapBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.primary,
      borderRadius: 14,
      paddingVertical: spacing.md,
      gap: spacing.xs,
      backgroundColor: colors.primary + '10',
    },
    snapBtnText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      color: colors.primary,
    },
    photoPreviewBox: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    photoPreview: {
      width: '100%',
      height: 140,
      borderRadius: 12,
      resizeMode: 'cover',
    },
    retakeBtn: {
      paddingVertical: 4,
    },
    retakeBtnText: {
      fontSize: fontSize.xs,
      color: colors.primary,
      fontWeight: fontWeight.semibold,
    },
    fallbackContainer: {
      backgroundColor: colors.warning + '12',
      borderRadius: 14,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.warning + '30',
    },
    fallbackHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    fallbackHeaderText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: colors.warning,
      flex: 1,
    },
    fallbackBody: {
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    fallbackNotice: {
      fontSize: fontSize.xs,
      color: themeColors.textSecondary,
    },
    fallbackBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      borderRadius: 10,
      padding: spacing.sm,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
    },
    fallbackBtnTitle: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
      color: themeColors.text,
    },
    fallbackBtnSub: {
      fontSize: 10,
      color: themeColors.textSecondary,
    },
    disputeLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    disputeLinkText: {
      fontSize: fontSize.xs,
      color: colors.error,
      fontWeight: fontWeight.semibold,
    },
    disputeModal: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: themeColors.surface,
      padding: spacing.lg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      gap: spacing.sm,
      borderTopWidth: 2,
      borderTopColor: colors.error,
    },
    disputeTitle: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: colors.error,
    },
    disputeInput: {
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
      borderRadius: 10,
      padding: spacing.sm,
      color: themeColors.text,
      fontSize: fontSize.xs,
      minHeight: 60,
    },
    disputeActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    disputeCancelBtn: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    disputeCancelText: {
      fontSize: fontSize.xs,
      color: themeColors.textSecondary,
    },
    disputeSubmitBtn: {
      backgroundColor: colors.error,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
    },
    disputeSubmitText: {
      fontSize: fontSize.xs,
      color: '#FFFFFF',
      fontWeight: fontWeight.bold,
    },
  });
