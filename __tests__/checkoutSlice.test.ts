import checkoutReducer, {
  initialCheckoutState,
  resetCheckout,
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
});
