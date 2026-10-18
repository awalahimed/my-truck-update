import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  PhoneInput,
  Input,
  Button,
  Checkbox,
  OTPVerification,
} from '@/components/ui';
import { ServerConfigModal } from '@/components/ServerConfigModal';
import { colors, spacing, fontSize, fontWeight } from '@/constants/theme';
import { userRoles } from '@/constants/userRoles';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/hooks/useToast';
import { getActiveServerUrl, subscribeServerUrlChange } from '@/config/config';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState<'form' | 'otp' | 'authenticating'>('form');
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState(getActiveServerUrl());

  useEffect(() => {
    return subscribeServerUrlChange((url) => setCurrentServerUrl(url));
  }, []);

  const {
    isLoading,
    login,
    clearError,
  } = useAuth();

  // Real-time phone validation
  const validatePhone = useCallback((value: string) => {
    if (!value) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (value.length < 9) {
      setPhoneError('Phone number is too short');
      return false;
    }
    if (value.length > 15) {
      setPhoneError('Phone number is too long');
      return false;
    }
    if (!/^\+?[0-9]+$/.test(value)) {
      setPhoneError('Phone number must contain only digits');
      return false;
    }
    setPhoneError('');
    return true;
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
    if (value.length > 0) {
      validatePhone(value);
    } else {
      setPhoneError('');
    }
  }, [validatePhone]);

  // Password validation
  const validatePassword = useCallback((value: string) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    if (value.length > 0) {
      validatePassword(value);
    } else {
      setPasswordError('');
    }
  }, [validatePassword]);

  const handleSendOTP = useCallback(async () => {
    if (!validatePhone(phone)) {
      showToast({ type: 'error', message: phoneError || 'Please enter a valid phone number' });
      return;
    }

    if (!validatePassword(password)) {
      showToast({ type: 'error', message: passwordError || 'Please enter your password' });
      return;
    }

    // Step 1: Sign in with phone + password (sends OTP) and pass rememberMe setting
    const signInResult = await login(phone, password, rememberMe);
    if (!signInResult.success) {
      const msg = signInResult.message || '';
      const isNetwork =
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('timeout');
      if (isNetwork) {
        showToast({
          type: 'error',
          message: `Cannot reach server at ${getActiveServerUrl()}. Tap "Server" to switch.`,
        });
      } else {
        showToast({ type: 'error', message: msg });
      }
      return;
    }

    // Step 2: Show OTP verification screen
    // OTP was already sent by login(), user will verify it next
    showToast({ type: 'success', message: 'OTP sent! Please verify your phone number' });
    setStep('otp');
  }, [phone, phoneError, password, passwordError, validatePhone, validatePassword, login, rememberMe]);

  const handleRememberMe = useCallback(() => {
    setRememberMe(prev => !prev);
  }, []);

  const handleGoBack = useCallback(() => {
    clearError();
    setStep('form');
  }, [clearError]);

  const handleSignUp = useCallback(() => {
    router.push('/auth/register');
  }, []);

  const handleOTPSuccess = useCallback(async (userRole: string) => {
    if (userRole === userRoles.DRIVER) {
      router.replace('/(tabs)/driver/home');
    } else if (userRole === userRoles.OWNER_SHOP) {
      router.replace('/(tabs)/user/home');
    } else {
      router.replace('/');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Back button and Server Switcher */}
        <View style={styles.header}>
          {router.canGoBack() ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity
            style={styles.serverSettingsBtn}
            onPress={() => setServerModalVisible(true)}
          >
            <Ionicons name="server-outline" size={16} color={colors.primary} />
            <Text style={styles.serverSettingsBtnText}>Server</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {step === 'form' ? 'Welcome back!' : step === 'otp' ? 'Enter OTP' : 'Signing you in...'}
          </Text>
          {step === 'form' && (
            <Text style={styles.subtitle}>Sign in to continue</Text>
          )}
          {step === 'authenticating' && (
            <Text style={styles.subtitle}>Please wait while we authenticate you</Text>
          )}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === 'form' ? (
            <>
              <PhoneInput
                value={phone}
                onChangeText={handlePhoneChange}
                error={phoneError}
              />

              <Input
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                error={passwordError}
                secureTextEntry
              />

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push('/auth/forgot')}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Remember Me */}
              <View style={styles.rememberContainer}>
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={handleRememberMe}
                >
                  <Checkbox checked={rememberMe} onPress={handleRememberMe} />
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <Button
                title="Send OTP"
                onPress={handleSendOTP}
                loading={isLoading}
                fullWidth
              />
            </>
          ) : step === 'otp' ? (
            <OTPVerification
              phone={phone}
              rememberMe={rememberMe}
              onSuccess={handleOTPSuccess}
              onBack={handleGoBack}
            />
          ) : (
            /* Authenticating State */
            <View style={styles.authenticatingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.authenticatingText}>
                Authenticating your account...
              </Text>
              <Text style={styles.authenticatingSubtext}>
                This may take a few seconds
              </Text>
            </View>
          )}

          {/* Divider */}
          {step === 'form' && (
            <>
              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account?</Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpLink}> Sign up</Text>
                </TouchableOpacity>
              </View>

              {/* Server Config Status Chip */}
              <TouchableOpacity
                style={styles.serverStatusChip}
                onPress={() => setServerModalVisible(true)}
              >
                <View style={styles.serverStatusDot} />
                <Text style={styles.serverStatusText} numberOfLines={1}>
                  Server: {currentServerUrl}
                </Text>
                <Ionicons name="settings-outline" size={13} color={colors.textSecondary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <ServerConfigModal
        visible={serverModalVisible}
        onClose={() => setServerModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serverSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  serverSettingsBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  serverStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xl,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignSelf: 'center',
    maxWidth: '95%',
  },
  serverStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22c55e',
  },
  serverStatusText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    maxWidth: 240,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing.md,
  },
  rememberContainer: {
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signUpText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  authenticatingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  authenticatingText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  authenticatingSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
