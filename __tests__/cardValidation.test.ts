import {
  detectCardBrand,
  isValidLuhn,
  normalizeCardNumber,
  validateCard,
} from '../src/shared/validation/cardValidation';

describe('cardValidation', () => {
  it('normalizes card numbers and validates luhn', () => {
    expect(normalizeCardNumber('4242 4242 4242 4242')).toBe('4242424242424242');
    expect(isValidLuhn('4242424242424242')).toBe(true);
    expect(isValidLuhn('5555555555554444')).toBe(true);
    expect(isValidLuhn('4242424242424241')).toBe(false);
  });

  it('detects supported card brands', () => {
    expect(detectCardBrand('4242424242424242')).toBe('visa');
    expect(detectCardBrand('5555555555554444')).toBe('mastercard');
    expect(detectCardBrand('30000000000004')).toBe('unknown');
  });

  it('accepts complete valid card data without persisting sensitive values', () => {
    const result = validateCard({
      number: '4242 4242 4242 4242',
      expMonth: '12',
      expYear: '30',
      cvc: '123',
      cardHolder: 'Luis Munar',
    });

    expect(result.isValid).toBe(true);
    expect(result.brand).toBe('visa');
    expect(result.lastFour).toBe('4242');
    expect(result.errors).toEqual({});
  });

  it('returns field errors for invalid card data', () => {
    const result = validateCard({
      number: '123',
      expMonth: '14',
      expYear: '20',
      cvc: 'ab',
      cardHolder: 'Lu',
    });

    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors)).toEqual([
      'number',
      'expMonth',
      'expYear',
      'cvc',
      'cardHolder',
    ]);
  });
});
