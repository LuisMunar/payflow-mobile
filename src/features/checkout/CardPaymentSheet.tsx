import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../shared/components/Button';
import { colors } from '../../shared/theme/colors';
import { radii, spacing } from '../../shared/theme/layout';
import { typography } from '../../shared/theme/typography';
import { formatMoney } from '../../shared/utils/formatMoney';
import {
  detectCardBrand,
  normalizeCardNumber,
  validateCard,
  type CardValidationInput,
  type CardValidationResult,
} from '../../shared/validation/cardValidation';
import {
  selectCartCurrency,
  selectCartItemCount,
  selectCartTotalInCents,
} from '../cart/cartSelectors';
import {
  setCardSummary,
  setCheckoutStep,
  type CardSummary,
} from './checkoutSlice';

type CardPaymentSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type CardFormState = CardValidationInput;

const emptyForm: CardFormState = {
  cardHolder: '',
  cvc: '',
  expMonth: '',
  expYear: '',
  number: '',
};

export function CardPaymentSheet({ visible, onClose }: CardPaymentSheetProps) {
  const dispatch = useAppDispatch();
  const itemCount = useAppSelector(selectCartItemCount);
  const totalInCents = useAppSelector(selectCartTotalInCents);
  const currency = useAppSelector(selectCartCurrency);
  const cardSummary = useAppSelector(state => state.checkout.cardSummary);
  const checkoutStep = useAppSelector(state => state.checkout.step);
  const [form, setForm] = useState<CardFormState>(emptyForm);
  const [errors, setErrors] = useState<CardValidationResult['errors']>({});
  const brand = useMemo(() => detectCardBrand(form.number), [form.number]);
  const isSummary = checkoutStep === 'summary' && cardSummary;

  const updateField = (field: keyof CardFormState, value: string) => {
    setErrors(current => ({ ...current, [field]: undefined }));
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleContinue = () => {
    const validation = validateCard(form);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const summary: CardSummary = {
      brand: validation.brand,
      cardHolder: form.cardHolder.trim(),
      lastFour: validation.lastFour,
    };

    dispatch(setCardSummary(summary));
    dispatch(setCheckoutStep('summary'));
    setErrors({});
  };

  const handleClose = () => {
    if (checkoutStep === 'summary') {
      dispatch(setCheckoutStep('card'));
    }

    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Close card form"
          style={styles.backdrop}
          onPress={handleClose}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {isSummary ? (
            <PaymentSummary
              cardSummary={cardSummary}
              currency={currency}
              itemCount={itemCount}
              totalInCents={totalInCents}
            />
          ) : (
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <Text style={styles.eyebrow}>Card details</Text>
                <Text style={styles.title}>Add your payment card</Text>
              </View>

              <View style={styles.brandRow}>
                <Text style={styles.brandLabel}>Detected card</Text>
                <Text style={styles.brandBadge}>{formatBrand(brand)}</Text>
              </View>

              <Field
                accessibilityLabel="Card number"
                error={errors.number}
                keyboardType="number-pad"
                label="Card number"
                maxLength={23}
                placeholder="4242 4242 4242 4242"
                value={formatCardNumber(form.number)}
                onChangeText={value => updateField('number', value)}
              />

              <View style={styles.inlineFields}>
                <Field
                  accessibilityLabel="Expiration month"
                  error={errors.expMonth}
                  keyboardType="number-pad"
                  label="MM"
                  maxLength={2}
                  placeholder="12"
                  value={form.expMonth}
                  onChangeText={value =>
                    updateField('expMonth', onlyDigits(value).slice(0, 2))
                  }
                />
                <Field
                  accessibilityLabel="Expiration year"
                  error={errors.expYear}
                  keyboardType="number-pad"
                  label="YY"
                  maxLength={2}
                  placeholder="30"
                  value={form.expYear}
                  onChangeText={value =>
                    updateField('expYear', onlyDigits(value).slice(0, 2))
                  }
                />
                <Field
                  accessibilityLabel="CVC"
                  error={errors.cvc}
                  keyboardType="number-pad"
                  label="CVC"
                  maxLength={4}
                  placeholder="123"
                  secureTextEntry
                  value={form.cvc}
                  onChangeText={value =>
                    updateField('cvc', onlyDigits(value).slice(0, 4))
                  }
                />
              </View>

              <Field
                accessibilityLabel="Card holder"
                autoCapitalize="words"
                error={errors.cardHolder}
                label="Card holder"
                placeholder="LUIS MUNAR"
                value={form.cardHolder}
                onChangeText={value => updateField('cardHolder', value)}
              />

              <Button
                accessibilityLabel="Continue to payment summary"
                label="Continue"
                onPress={handleContinue}
              />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type FieldProps = {
  accessibilityLabel: string;
  error?: string;
  label: string;
  onChangeText: (value: string) => void;
  value: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
  placeholder?: string;
  secureTextEntry?: boolean;
};

function Field({
  accessibilityLabel,
  error,
  label,
  onChangeText,
  value,
  autoCapitalize = 'none',
  keyboardType = 'default',
  maxLength,
  placeholder,
  secureTextEntry,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secureTextEntry}
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

type PaymentSummaryProps = {
  cardSummary: CardSummary;
  currency: string;
  itemCount: number;
  totalInCents: number;
};

function PaymentSummary({
  cardSummary,
  currency,
  itemCount,
  totalInCents,
}: PaymentSummaryProps) {
  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Payment summary</Text>
        <Text style={styles.title}>Confirm your payment</Text>
      </View>

      <View style={styles.summaryBox}>
        <SummaryRow label="Items" value={String(itemCount)} />
        <SummaryRow label="Total" value={formatMoney(totalInCents, currency)} strong />
        <SummaryRow label="Card" value={formatBrand(cardSummary.brand)} />
        <SummaryRow label="Last four" value={`**** ${cardSummary.lastFour}`} />
      </View>

      <Button
        accessibilityLabel="Confirm payment"
        label="Confirm payment"
        onPress={() => undefined}
      />
    </View>
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

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatCardNumber(value: string) {
  return normalizeCardNumber(value).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatBrand(brand: CardSummary['brand']) {
  if (brand === 'visa') {
    return 'Visa';
  }

  if (brand === 'mastercard') {
    return 'Mastercard';
  }

  return 'Unknown';
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.44)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  brandBadge: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    fontWeight: '900',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brandLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  error: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  field: {
    flex: 1,
    gap: spacing.xs,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.borderStrong,
    borderRadius: 999,
    height: 4,
    marginTop: spacing.sm,
    width: 48,
  },
  header: {
    gap: spacing.xs,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  inputError: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: '800',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '88%',
  },
  summaryBox: {
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
  summaryStrong: {
    fontSize: typography.sizes.xl,
    fontWeight: '900',
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: '900',
    lineHeight: 32,
  },
});
