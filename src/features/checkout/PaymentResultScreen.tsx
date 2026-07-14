import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { RootStackParamList } from '../../app/navigation/types';
import { Button } from '../../shared/components/Button';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { radii, spacing } from '../../shared/theme/layout';
import { typography } from '../../shared/theme/typography';
import { formatMoney } from '../../shared/utils/formatMoney';
import { resetCheckout, setCheckoutStep } from './checkoutSlice';

type PaymentResultScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PaymentResult'
>;

export function PaymentResultScreen({ navigation }: PaymentResultScreenProps) {
  const dispatch = useAppDispatch();
  const paymentError = useAppSelector(state => state.checkout.paymentError);
  const paymentResult = useAppSelector(state => state.checkout.paymentResult);
  const status = paymentResult?.status ?? 'ERROR';
  const isApproved = status === 'APPROVED';
  const isDeclined = status === 'DECLINED';
  const title = isApproved
    ? 'Payment approved'
    : isDeclined
      ? 'Payment rejected'
      : 'Payment error';
  const message = isApproved
    ? 'Your order was paid successfully.'
    : isDeclined
      ? 'The payment was rejected by the gateway.'
      : paymentError ?? 'The payment could not be completed.';

  const handleContinue = () => {
    dispatch(resetCheckout());
    navigation.popToTop();
  };

  const handleRetry = () => {
    dispatch(setCheckoutStep('card'));
    navigation.navigate('Checkout');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            isApproved ? styles.approvedBadge : styles.errorBadge,
          ]}>
          <Text style={styles.statusBadgeText}>
            {isApproved ? 'Approved' : isDeclined ? 'Rejected' : 'Error'}
          </Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      {paymentResult ? (
        <View style={styles.summary}>
          <SummaryRow label="Reference" value={paymentResult.reference} />
          <SummaryRow
            label="Total"
            value={formatMoney(paymentResult.amountInCents, paymentResult.currency)}
            strong
          />
          {paymentResult.cardBrand ? (
            <SummaryRow label="Card" value={paymentResult.cardBrand} />
          ) : null}
          {paymentResult.cardLastFour ? (
            <SummaryRow label="Last four" value={`**** ${paymentResult.cardLastFour}`} />
          ) : null}
          {paymentResult.gatewayStatus ? (
            <SummaryRow label="Gateway" value={paymentResult.gatewayStatus} />
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        {!isApproved ? (
          <Button
            accessibilityLabel="Retry payment"
            label="Retry payment"
            onPress={handleRetry}
          />
        ) : null}
        <Button
          accessibilityLabel="Continue shopping"
          label="Continue shopping"
          variant={isApproved ? 'primary' : 'secondary'}
          onPress={handleContinue}
        />
      </View>
    </Screen>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryStrong]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  approvedBadge: {
    backgroundColor: colors.primary,
  },
  errorBadge: {
    backgroundColor: colors.danger,
  },
  header: {
    gap: spacing.md,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusBadgeText: {
    color: colors.onPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
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
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  summaryStrong: {
    fontSize: typography.sizes.xl,
    fontWeight: '900',
  },
  summaryValue: {
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: typography.sizes.md,
    fontWeight: '800',
    textAlign: 'right',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: '900',
    lineHeight: 32,
  },
});
