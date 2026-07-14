import checkoutReducer, {
  clearCardSummary,
  initialCheckoutState,
  resetCheckout,
  setCardSummary,
  setCheckoutStep,
  setCustomer,
} from '../src/features/checkout/checkoutSlice';

describe('checkoutSlice', () => {
  it('stores customer information', () => {
    const state = checkoutReducer(
      initialCheckoutState,
      setCustomer({
        customerEmail: 'luis@example.test',
        customerName: 'Luis Munar',
      }),
    );

    expect(state.customerName).toBe('Luis Munar');
    expect(state.customerEmail).toBe('luis@example.test');
  });

  it('changes checkout step and resets state', () => {
    const processing = checkoutReducer(
      initialCheckoutState,
      setCheckoutStep('processing'),
    );

    expect(processing.step).toBe('processing');
    expect(checkoutReducer(processing, resetCheckout())).toEqual(
      initialCheckoutState,
    );
  });

  it('stores only safe card summary data', () => {
    const state = checkoutReducer(
      initialCheckoutState,
      setCardSummary({
        brand: 'visa',
        cardHolder: 'Luis Munar',
        lastFour: '4242',
      }),
    );

    expect(state.cardSummary).toEqual({
      brand: 'visa',
      cardHolder: 'Luis Munar',
      lastFour: '4242',
    });
    expect(JSON.stringify(state)).not.toContain('4242424242424242');
    expect(JSON.stringify(state)).not.toContain('999');
  });

  it('clears card summary data', () => {
    const state = checkoutReducer(
      {
        ...initialCheckoutState,
        cardSummary: {
          brand: 'mastercard',
          cardHolder: 'Luis Munar',
          lastFour: '4444',
        },
      },
      clearCardSummary(),
    );

    expect(state.cardSummary).toBeNull();
  });
});
