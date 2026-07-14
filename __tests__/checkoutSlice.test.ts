import checkoutReducer, {
  clearCardSummary,
  checkoutStorage,
  initialCheckoutState,
  loadCheckout,
  resetCheckout,
  setCardSummary,
  setCheckoutStep,
  setCustomer,
  setPaymentError,
  setPaymentProcessing,
  setPaymentResult,
} from '../src/features/checkout/checkoutSlice';
import { secureStorage } from '../src/shared/storage/secureStorage';

jest.mock('../src/shared/storage/secureStorage', () => ({
  secureStorage: {
    getJson: jest.fn(),
    remove: jest.fn(),
    setJson: jest.fn(),
  },
}));

describe('checkoutSlice', () => {
  beforeEach(() => {
    jest.mocked(secureStorage.getJson).mockReset();
    jest.mocked(secureStorage.remove).mockReset();
    jest.mocked(secureStorage.setJson).mockReset();
  });

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
    expect(checkoutReducer(processing, resetCheckout())).toEqual({
      ...initialCheckoutState,
      restored: true,
    });
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

  it('tracks payment processing, results and errors', () => {
    const processing = checkoutReducer(initialCheckoutState, setPaymentProcessing());

    expect(processing.paymentStatus).toBe('processing');
    expect(processing.step).toBe('processing');

    const approved = checkoutReducer(
      processing,
      setPaymentResult({
        amountInCents: 120000,
        cardBrand: 'VISA',
        cardLastFour: '4242',
        currency: 'COP',
        customerEmail: 'luis@example.com',
        customerName: 'Luis Munar',
        items: [],
        reference: 'PAY-1',
        status: 'APPROVED',
      }),
    );

    expect(approved.paymentStatus).toBe('succeeded');
    expect(approved.paymentResult?.status).toBe('APPROVED');
    expect(approved.step).toBe('result');

    const failed = checkoutReducer(approved, setPaymentError('Network error'));

    expect(failed.paymentStatus).toBe('failed');
    expect(failed.paymentError).toBe('Network error');
    expect(failed.step).toBe('result');
  });

  it('restores safe checkout draft data', () => {
    const restored = checkoutReducer(
      initialCheckoutState,
      loadCheckout.fulfilled(
        {
          cardSummary: {
            brand: 'visa',
            cardHolder: 'Luis Munar',
            lastFour: '4242',
          },
          customerEmail: 'luis@example.com',
          customerName: 'Luis Munar',
        },
        'request-id',
      ),
    );

    expect(restored.cardSummary?.lastFour).toBe('4242');
    expect(restored.customerEmail).toBe('luis@example.com');
    expect(restored.restored).toBe(true);
  });

  it('marks checkout restored when draft loading fails', () => {
    const restored = checkoutReducer(
      initialCheckoutState,
      loadCheckout.rejected(new Error('Storage error'), 'request-id'),
    );

    expect(restored.restored).toBe(true);
  });

  it('persists and removes only safe checkout draft data', async () => {
    await checkoutStorage.persist({
      ...initialCheckoutState,
      customerEmail: 'luis@example.com',
      customerName: 'Luis Munar',
    });
    await checkoutStorage.persist(initialCheckoutState);

    expect(secureStorage.setJson).toHaveBeenCalledWith(checkoutStorage.key, {
      cardSummary: null,
      customerEmail: 'luis@example.com',
      customerName: 'Luis Munar',
    });
    expect(JSON.stringify(jest.mocked(secureStorage.setJson).mock.calls)).not.toContain(
      '4242424242424242',
    );
    expect(secureStorage.remove).toHaveBeenCalledWith(checkoutStorage.key);
  });
});
