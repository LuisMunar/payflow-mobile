export type CardBrand = 'visa' | 'mastercard' | 'unknown';

export type CardValidationInput = {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
};

export type CardValidationResult = {
  brand: CardBrand;
  isValid: boolean;
  errors: Partial<Record<keyof CardValidationInput, string>>;
  lastFour: string;
};

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = normalizeCardNumber(cardNumber);

  if (/^4\d{12,18}$/.test(digits)) {
    return 'visa';
  }

  if (
    /^5[1-5]\d{14}$/.test(digits) ||
    /^2(2[2-9][1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)\d{12}$/.test(digits)
  ) {
    return 'mastercard';
  }

  return 'unknown';
}

export function isValidLuhn(cardNumber: string) {
  const digits = normalizeCardNumber(cardNumber);

  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function normalizeCardNumber(cardNumber: string) {
  return cardNumber.replace(/\D/g, '');
}

export function validateCard(input: CardValidationInput): CardValidationResult {
  const number = normalizeCardNumber(input.number);
  const errors: CardValidationResult['errors'] = {};
  const brand = detectCardBrand(number);

  if (!isValidLuhn(number)) {
    errors.number = 'Enter a valid card number.';
  }

  if (!/^(0[1-9]|1[0-2])$/.test(input.expMonth)) {
    errors.expMonth = 'Enter a valid month.';
  }

  if (!isFutureExpiration(input.expMonth, input.expYear)) {
    errors.expYear = 'Enter a future expiration date.';
  }

  if (!/^\d{3,4}$/.test(input.cvc)) {
    errors.cvc = 'Enter a valid CVC.';
  }

  if (input.cardHolder.trim().length < 5) {
    errors.cardHolder = 'Enter the card holder name.';
  }

  return {
    brand,
    errors,
    isValid: Object.keys(errors).length === 0,
    lastFour: number.slice(-4),
  };
}

function isFutureExpiration(expMonth: string, expYear: string) {
  if (!/^(0[1-9]|1[0-2])$/.test(expMonth) || !/^\d{2}$/.test(expYear)) {
    return false;
  }

  const month = Number(expMonth);
  const year = 2000 + Number(expYear);
  const now = new Date();
  const expiresAt = new Date(year, month, 0, 23, 59, 59);

  return expiresAt >= now;
}
