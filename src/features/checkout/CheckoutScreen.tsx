import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../app/navigation/types';
import { useAppSelector } from '../../app/hooks';
import { Button } from '../../shared/components/Button';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { radii, spacing } from '../../shared/theme/layout';
import { typography } from '../../shared/theme/typography';
import { formatMoney } from '../../shared/utils/formatMoney';
import {
  selectCartCurrency,
  selectCartItemCount,
  selectCartTotalInCents,
  selectHasCartItems,
} from '../cart/cartSelectors';

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: CheckoutScreenProps) {
  const hasItems = useAppSelector(selectHasCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const totalInCents = useAppSelector(selectCartTotalInCents);
  const currency = useAppSelector(selectCartCurrency);
  const handleBackToCart = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Cart');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Checkout</Text>
        <Text style={styles.title}>Payment summary</Text>
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
      </View>

      <View style={styles.actions}>
        <Button
          accessibilityLabel="Pay with credit card"
          label="Pay with credit card"
          disabled={!hasItems}
          onPress={() => undefined}
        />
        <Button
          accessibilityLabel="Back to cart"
          label="Back to cart"
          variant="secondary"
          onPress={handleBackToCart}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
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
  summary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
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
