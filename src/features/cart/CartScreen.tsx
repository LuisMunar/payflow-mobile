import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../app/navigation/types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { radii, spacing } from '../../shared/theme/layout';
import { typography } from '../../shared/theme/typography';
import { formatMoney } from '../../shared/utils/formatMoney';
import { CartItemRow } from './CartItemRow';
import {
  addProduct,
  decrementProduct,
  removeProduct,
} from './cartSlice';
import {
  selectCartCurrency,
  selectCartItemCount,
  selectCartItems,
  selectCartTotalInCents,
} from './cartSelectors';

type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: CartScreenProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const totalInCents = useAppSelector(selectCartTotalInCents);
  const currency = useAppSelector(selectCartCurrency);

  if (items.length === 0) {
    return (
      <Screen contentContainerStyle={styles.emptyContainer}>
        <EmptyState
          title="Your cart is empty"
          description="Add products before starting checkout."
        />
        <Button
          label="Browse products"
          onPress={() => navigation.navigate('Products')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Cart</Text>
        <Text style={styles.title}>Review your order</Text>
      </View>

      <View style={styles.items}>
        {items.map(item => (
          <CartItemRow
            key={item.product.id}
            item={item}
            onDecrement={() => dispatch(decrementProduct(item.product.id))}
            onIncrement={() => dispatch(addProduct(item.product))}
            onRemove={() => dispatch(removeProduct(item.product.id))}
          />
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items</Text>
          <Text style={styles.summaryValue}>{itemCount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatMoney(totalInCents, currency)}
          </Text>
        </View>
        <Button
          accessibilityLabel="Checkout"
          label="Checkout"
          onPress={() => navigation.navigate('Checkout')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    gap: spacing.lg,
    justifyContent: 'center',
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  items: {
    gap: spacing.md,
  },
  summary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: '900',
    lineHeight: 32,
  },
  totalLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: '900',
  },
});
