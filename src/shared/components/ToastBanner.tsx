import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/layout';
import { typography } from '../theme/typography';

type ToastBannerProps = {
  message: string | null;
};

export function ToastBanner({ message }: ToastBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  message: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    lineHeight: 19,
  },
});
