import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../app/navigation/types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
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
import { CardPaymentSheet } from './CardPaymentSheet';
import { setCheckoutStep, setCustomer } from './checkoutSlice';

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: CheckoutScreenProps) {
  const dispatch = useAppDispatch();
  const hasItems = useAppSelector(selectHasCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const totalInCents = useAppSelector(selectCartTotalInCents);
  const currency = useAppSelector(selectCartCurrency);
  const customerName = useAppSelector(state => state.checkout.customerName);
  const customerEmail = useAppSelector(state => state.checkout.customerEmail);
  const [isCardSheetOpen, setCardSheetOpen] = useState(false);
  const canPay = hasItems && isValidCustomer(customerName, customerEmail);
  const handleBackToCart = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Cart');
  };
  const handleOpenCardSheet = () => {
    dispatch(setCheckoutStep('card'));
    setCardSheetOpen(true);
  };
  const updateCustomerName = (value: string) => {
    dispatch(setCustomer({ customerEmail, customerName: value }));
  };
  const updateCustomerEmail = (value: string) => {
    dispatch(setCustomer({ customerEmail: value, customerName }));
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

      <View style={styles.customerForm}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <TextInput
          accessibilityLabel="Customer name"
          autoCapitalize="words"
          placeholder="Luis Munar"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          value={customerName}
          onChangeText={updateCustomerName}
        />
        <TextInput
          accessibilityLabel="Customer email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="luis@example.com"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          value={customerEmail}
          onChangeText={updateCustomerEmail}
        />
      </View>

      <View style={styles.actions}>
        <Button
          accessibilityLabel="Pay with credit card"
          label="Pay with credit card"
          disabled={!canPay}
          onPress={handleOpenCardSheet}
        />
        <Button
          accessibilityLabel="Back to cart"
          label="Back to cart"
          variant="secondary"
          onPress={handleBackToCart}
        />
      </View>
      <CardPaymentSheet
        visible={isCardSheetOpen}
        onClose={() => setCardSheetOpen(false)}
        onPaymentFinished={() => navigation.replace('PaymentResult')}
      />
    </Screen>
  );
}

function isValidCustomer(customerName: string, customerEmail: string) {
  return customerName.trim().length >= 2 && /\S+@\S+\.\S+/.test(customerEmail);
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
  customerForm: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: '800',
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
