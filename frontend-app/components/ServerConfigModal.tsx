import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import {
  SERVER_PRESETS,
  getActiveServerUrl,
  setActiveServerUrl,
  testServerConnection,
  resetServerUrlToDefault,
  ServerPreset,
} from '@/config/config';
import { showToast } from '@/hooks/useToast';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ServerConfigModal({ visible, onClose }: ServerConfigModalProps) {
  const [selectedUrl, setSelectedUrl] = useState(getActiveServerUrl());
  const [customInput, setCustomInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      const current = getActiveServerUrl();
      setSelectedUrl(current);
      setCustomInput(current);
      setTestResult(null);
    }
  }, [visible]);

  const handleSelectPreset = (preset: ServerPreset) => {
    setSelectedUrl(preset.url);
    setCustomInput(preset.url);
    setTestResult(null);
  };

  const handleTest = useCallback(async () => {
    const target = customInput.trim();
    if (!target) {
      setTestResult({ success: false, message: 'Please enter a server URL' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testServerConnection(target);
      setTestResult({
        success: res.success,
        message: res.message,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Failed to test connection',
      });
    } finally {
      setIsTesting(false);
    }
  }, [customInput]);

  const handleSave = async () => {
    const target = customInput.trim();
    if (!target) {
      showToast({ type: 'error', message: 'Server URL cannot be empty' });
      return;
    }

    try {
      await setActiveServerUrl(target);
      showToast({
        type: 'success',
        message: `Connected to: ${target}`,
      });
      onClose();
    } catch {
      showToast({ type: 'error', message: 'Failed to save server URL' });
    }
  };

  const handleReset = async () => {
    try {
      await resetServerUrlToDefault();
      const current = getActiveServerUrl();
      setSelectedUrl(current);
      setCustomInput(current);
      setTestResult(null);
      showToast({ type: 'info', message: 'Reset to default server' });
    } catch {
      showToast({ type: 'error', message: 'Failed to reset server' });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="server-outline" size={22} color={colors.primary} />
              <Text style={styles.headerTitle}>Server Configuration</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Select Environment Preset:</Text>

            {SERVER_PRESETS.map((preset) => {
              const isSelected = selectedUrl === preset.url;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.presetCard,
                    isSelected && styles.presetCardSelected,
                  ]}
                  onPress={() => handleSelectPreset(preset)}
                >
                  <View style={styles.presetTop}>
                    <Text
                      style={[
                        styles.presetLabel,
                        isSelected && styles.presetLabelSelected,
                      ]}
                    >
                      {preset.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </View>
                  <Text style={styles.presetUrl} numberOfLines={1}>
                    {preset.url}
                  </Text>
                  <Text style={styles.presetDesc}>{preset.description}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Custom URL Input */}
            <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>
              Active Server URL:
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.urlInput}
                value={customInput}
                onChangeText={(text) => {
                  setCustomInput(text);
                  setSelectedUrl(text);
                  setTestResult(null);
                }}
                placeholder="http://192.168.x.x:3002 or https://..."
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            {/* Test Connection Button */}
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTest}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="pulse" size={18} color={colors.primary} />
                  <Text style={styles.testBtnText}>Test Server Connection</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Test Result Feedback */}
            {testResult && (
              <View
                style={[
                  styles.resultBox,
                  testResult.success
                    ? styles.resultSuccess
                    : styles.resultError,
                ]}
              >
                <Ionicons
                  name={
                    testResult.success ? 'checkmark-circle' : 'alert-circle'
                  }
                  size={18}
                  color={testResult.success ? '#16a34a' : '#dc2626'}
                />
                <Text
                  style={[
                    styles.resultText,
                    {
                      color: testResult.success ? '#16a34a' : '#dc2626',
                    },
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            )}

            {/* Helpful Developer Hint */}
            <View style={styles.hintBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={styles.hintText}>
                On dorm/university Wi-Fi networks, device-to-device connections are
                blocked by router AP Isolation. Use "Production (Cloud)" or connect
                both laptop and phone to your Phone's Mobile Hotspot for local testing.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Apply & Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  presetCard: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: '#f9fafb',
  },
  presetCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
  },
  presetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  presetLabelSelected: {
    color: colors.primary,
  },
  presetUrl: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  presetDesc: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  inputRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  urlInput: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    backgroundColor: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.text,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  testBtnText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  resultSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  resultError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  resultText: {
    fontSize: 12,
    flex: 1,
    fontWeight: fontWeight.medium,
  },
  hintBox: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hintText: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  resetBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  saveBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: fontSize.sm,
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
});
