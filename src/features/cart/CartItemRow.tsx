import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CartItem } from './cartSlice';
import { colors } from '../../shared/theme/colors';
import { radii, spacing } from '../../shared/theme/layout';
import { typography } from '../../shared/theme/typography';
import { formatMoney } from '../../shared/utils/formatMoney';

type CartItemRowProps = {
  item: CartItem;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
};

export function CartItemRow({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: CartItemRowProps) {
  const lineTotal = item.product.priceInCents * item.quantity;
  const canIncrement = item.quantity < item.product.stock;

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.price}>
          {formatMoney(item.product.priceInCents, item.product.currency)} each
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.product.name}`}
          onPress={onRemove}
          hitSlop={8}>
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Text style={styles.lineTotal}>
          {formatMoney(lineTotal, item.product.currency)}
        </Text>
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${item.product.name}`}
            onPress={onDecrement}
            style={styles.stepButton}>
            <Text style={styles.stepText}>-</Text>
          </Pressable>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Increase ${item.product.name}`}
            disabled={!canIncrement}
            onPress={onIncrement}
            style={[styles.stepButton, !canIncrement && styles.disabled]}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  disabled: {
    opacity: 0.38,
  },
  lineTotal: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '800',
    lineHeight: 21,
  },
  price: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  quantity: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'center',
  },
  remove: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  stepText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    lineHeight: 24,
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
