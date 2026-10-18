import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Phone, Smartphone, ChevronRight } from 'lucide-react-native';
import { spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CreateOrderMethodSheetProps {
  visible: boolean;
  onClose: () => void;
  onShipOnApp: () => void;
}

export const CreateOrderMethodSheet: React.FC<CreateOrderMethodSheetProps> = ({
  visible,
  onClose,
  onShipOnApp,
}) => {
  const { colors, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleShipByPhone = () => {
    Linking.openURL('tel:+251912345678');
    onClose();
  };

  const handleShipOnApp = () => {
    onClose();
    onShipOnApp();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.indicatorContainer}>
            <View
              style={[
                styles.indicator,
                { backgroundColor: isDark ? colors.border : '#D1D5DB' },
              ]}
            />
          </View>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create Order</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              How would you like to place this order?
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            {/* Option 1: Ship by Phone */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                {
                  backgroundColor: isDark
                    ? colors.cardSecondary
                    : colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleShipByPhone}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isDark
                      ? 'rgba(26, 155, 127, 0.2)'
                      : colors.primaryOpacity10,
                  },
                ]}
              >
                <Phone size={22} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Ship by Phone
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Call the call center to place your order
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Option 2: Ship on App (Highlighted Primary Brand Color) */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                styles.primaryCard,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primaryDark,
                },
              ]}
              onPress={handleShipOnApp}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                ]}
              >
                <Smartphone size={22} color="#FFFFFF" />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>
                  Ship on App
                </Text>
                <Text
                  style={[
                    styles.cardSubtitle,
                    { color: 'rgba(255, 255, 255, 0.85)' },
                  ]}
                >
                  Place the order yourself on the app
                </Text>
              </View>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  indicatorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  indicator: {
    width: 44,
    height: 5,
    borderRadius: borderRadius.full,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  buttonsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  optionCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  primaryCard: {
    shadowColor: '#1a9b7f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: fontSize.xs,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
