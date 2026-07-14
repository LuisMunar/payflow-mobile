import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/layout';
import { typography } from '../theme/typography';

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export function Button({
  label,
  variant = 'primary',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isSecondary ? styles.secondary : styles.primary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}>
      <Text
        style={[
          styles.label,
          isSecondary ? styles.secondaryLabel : styles.primaryLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.48,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.84,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryLabel: {
    color: colors.onPrimary,
  },
  secondary: {
    backgroundColor: colors.surfaceMuted,
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
});
