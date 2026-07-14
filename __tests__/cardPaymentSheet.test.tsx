import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { ApiError } from '../src/shared/api/client';
import { paymentsApi } from '../src/shared/api/paymentsApi';
import { CardPaymentSheet } from '../src/features/checkout/CardPaymentSheet';
import {
  setCardSummary,
  setCheckoutStep,
  setPaymentProcessing,
  setPaymentResult,
} from '../src/features/checkout/checkoutSlice';
import { clearCart } from '../src/features/cart/cartSlice';
import type { RootState } from '../src/app/store';

const mockDispatch = jest.fn();
const onClose = jest.fn();
const onPaymentFinished = jest.fn();
let mockState: Pick<RootState, 'cart' | 'checkout'>;

jest.mock('../src/shared/api/paymentsApi', () => ({
  paymentsApi: {
    createTransaction: jest.fn(),
    processCardPayment: jest.fn(),
  },
}));

jest.mock('../src/app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: RootState) => unknown) =>
    selector(mockState as RootState),
}));

function render(element: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });

  return tree;
}

function baseState(): Pick<RootState, 'cart' | 'checkout'> {
  return {
    cart: {
      items: [
        {
          product: {
            id: 'product-1',
            available: true,
            currency: 'COP',
            description: 'Test product',
            imageUrl: 'https://example.test/product.jpg',
            name: 'Test product',
            priceInCents: 120000,
            stock: 3,
          },
          quantity: 2,
        },
      ],
      restored: true,
    },
    checkout: {
      cardSummary: null,
      customerEmail: 'luis@example.com',
      customerName: 'Luis Munar',
      paymentError: null,
      paymentResult: null,
      paymentStatus: 'idle',
      restored: true,
      step: 'card',
    },
  };
}

describe('CardPaymentSheet', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    onClose.mockReset();
    onPaymentFinished.mockReset();
    jest.mocked(paymentsApi.createTransaction).mockReset();
    jest.mocked(paymentsApi.processCardPayment).mockReset();
    mockState = baseState();
  });

  it('shows validation errors before continuing', () => {
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Continue to payment summary' })
        .props.onPress();
    });

    expect(tree.root.findByProps({ children: 'Enter a valid card number.' }))
      .toBeTruthy();
    expect(tree.root.findByProps({ children: 'Enter a valid month.' }))
      .toBeTruthy();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('stores safe card summary and opens the summary step for a valid card', () => {
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Card number' })
        .props.onChangeText('4242424242424242');
      tree.root
        .findByProps({ accessibilityLabel: 'Expiration month' })
        .props.onChangeText('12');
      tree.root
        .findByProps({ accessibilityLabel: 'Expiration year' })
        .props.onChangeText('30');
      tree.root.findByProps({ accessibilityLabel: 'CVC' }).props.onChangeText('123');
      tree.root
        .findByProps({ accessibilityLabel: 'Card holder' })
        .props.onChangeText('Luis Munar');
    });

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Continue to payment summary' })
        .props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      setCardSummary({
        brand: 'visa',
        cardHolder: 'Luis Munar',
        lastFour: '4242',
      }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(setCheckoutStep('summary'));
  });

  it('renders payment summary with non-sensitive card data', () => {
    mockState = {
      ...baseState(),
      checkout: {
        cardSummary: {
          brand: 'mastercard',
          cardHolder: 'Luis Munar',
          lastFour: '4444',
        },
        customerEmail: '',
        customerName: '',
        paymentError: null,
        paymentResult: null,
        paymentStatus: 'idle',
        restored: true,
        step: 'summary',
      },
    };
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    expect(tree.root.findByProps({ children: 'Confirm your payment' }))
      .toBeTruthy();
    expect(tree.root.findByProps({ children: 'Mastercard' })).toBeTruthy();
    expect(tree.root.findByProps({ children: '**** 4444' })).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityLabel: 'Confirm payment' }))
      .toBeTruthy();
  });

  it('returns to card step when closing the summary sheet', () => {
    mockState = {
      ...baseState(),
      checkout: {
        ...baseState().checkout,
        cardSummary: {
          brand: 'visa',
          cardHolder: 'Luis Munar',
          lastFour: '4242',
        },
        step: 'summary',
      },
    };
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Close card form' }).props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith(setCheckoutStep('card'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes the card form without changing step before summary', () => {
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Close card form' }).props.onPress();
    });

    expect(mockDispatch).not.toHaveBeenCalledWith(setCheckoutStep('card'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles native modal close requests', () => {
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    ReactTestRenderer.act(() => {
      tree.root.findByProps({ animationType: 'slide' }).props.onRequestClose();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders without keyboard padding behavior on Android', () => {
    const originalOS = Platform.OS;

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });

    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    expect(tree.root.findByType(KeyboardAvoidingView).props.behavior).toBeUndefined();

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => originalOS,
    });
  });

  it('shows processing copy while payment is in progress', () => {
    mockState = {
      ...baseState(),
      checkout: {
        ...baseState().checkout,
        cardSummary: {
          brand: 'visa',
          cardHolder: 'Luis Munar',
          lastFour: '4242',
        },
        paymentStatus: 'processing',
        step: 'processing',
      },
    };
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    expect(tree.root.findByProps({ children: 'Confirm your payment' }))
      .toBeTruthy();
    expect(tree.root.findByProps({ children: 'Processing payment' })).toBeTruthy();

    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Close card form' }).props.onPress();
      tree.root.findByProps({ animationType: 'slide' }).props.onRequestClose();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('creates a transaction and processes the card payment', async () => {
    const paidTransaction = {
      id: 'transaction-1',
      amountInCents: 240000,
      cardBrand: 'VISA',
      cardLastFour: '4242',
      currency: 'COP',
      customerEmail: 'luis@example.com',
      customerName: 'Luis Munar',
      gatewayStatus: 'APPROVED',
      items: [],
      reference: 'PAY-1',
      status: 'APPROVED',
    };
    jest.mocked(paymentsApi.createTransaction).mockResolvedValue({
      ...paidTransaction,
      status: 'PENDING',
    });
    jest.mocked(paymentsApi.processCardPayment).mockResolvedValue(paidTransaction);
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Card number' })
        .props.onChangeText('4242424242424242');
      tree.root
        .findByProps({ accessibilityLabel: 'Expiration month' })
        .props.onChangeText('12');
      tree.root
        .findByProps({ accessibilityLabel: 'Expiration year' })
        .props.onChangeText('30');
      tree.root.findByProps({ accessibilityLabel: 'CVC' }).props.onChangeText('123');
      tree.root
        .findByProps({ accessibilityLabel: 'Card holder' })
        .props.onChangeText('Luis Munar');
    });

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Continue to payment summary' })
        .props.onPress();
    });

    mockState = {
      ...baseState(),
      checkout: {
        ...baseState().checkout,
        cardSummary: {
          brand: 'visa',
          cardHolder: 'Luis Munar',
          lastFour: '4242',
        },
        step: 'summary',
      },
    };

    ReactTestRenderer.act(() => {
      tree.update(
        <CardPaymentSheet
          visible
          onClose={onClose}
          onPaymentFinished={onPaymentFinished}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await tree.root
        .findByProps({ accessibilityLabel: 'Confirm payment' })
        .props.onPress();
    });

    expect(paymentsApi.createTransaction).toHaveBeenCalledWith({
      customerEmail: 'luis@example.com',
      customerName: 'Luis Munar',
      items: [{ productId: 'product-1', quantity: 2 }],
    });
    expect(paymentsApi.processCardPayment).toHaveBeenCalledWith('transaction-1', {
      card: {
        cardHolder: 'Luis Munar',
        cvc: '123',
        expMonth: '12',
        expYear: '30',
        number: '4242424242424242',
      },
      installments: 1,
    });
    expect(mockDispatch).toHaveBeenCalledWith(setPaymentProcessing());
    expect(mockDispatch).toHaveBeenCalledWith(setPaymentResult(paidTransaction));
    expect(mockDispatch).toHaveBeenCalledWith(clearCart());
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onPaymentFinished).toHaveBeenCalledTimes(1);
  });

  it('keeps the cart when the payment is declined', async () => {
    const declinedTransaction = {
      id: 'transaction-1',
      amountInCents: 240000,
      cardBrand: 'VISA',
      cardLastFour: '4242',
      currency: 'COP',
      customerEmail: 'luis@example.com',
      customerName: 'Luis Munar',
      gatewayStatus: 'DECLINED',
      items: [],
      reference: 'PAY-1',
      status: 'DECLINED',
    };
    jest.mocked(paymentsApi.createTransaction).mockResolvedValue({
      ...declinedTransaction,
      status: 'PENDING',
    });
    jest
      .mocked(paymentsApi.processCardPayment)
      .mockResolvedValue(declinedTransaction);
    mockState = {
      ...baseState(),
      checkout: {
        ...baseState().checkout,
        cardSummary: {
          brand: 'visa',
          cardHolder: 'Luis Munar',
          lastFour: '4242',
        },
        step: 'summary',
      },
    };
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    await ReactTestRenderer.act(async () => {
      await tree.root
        .findByProps({ accessibilityLabel: 'Confirm payment' })
        .props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith(setPaymentResult(declinedTransaction));
    expect(mockDispatch).not.toHaveBeenCalledWith(clearCart());
    expect(onPaymentFinished).toHaveBeenCalledTimes(1);
  });

  it('shows backend payment errors without closing the sheet', async () => {
    jest
      .mocked(paymentsApi.createTransaction)
      .mockRejectedValue(new ApiError('Bad request', 400));
    mockState = {
      ...baseState(),
      checkout: {
        ...baseState().checkout,
        cardSummary: {
          brand: 'visa',
          cardHolder: 'Luis Munar',
          lastFour: '4242',
        },
        step: 'summary',
      },
    };
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    await ReactTestRenderer.act(async () => {
      await tree.root
        .findByProps({ accessibilityLabel: 'Confirm payment' })
        .props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      payload: 'Payment could not be processed. Backend status: 400.',
      type: 'checkout/setPaymentError',
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(onPaymentFinished).not.toHaveBeenCalled();
  });

  it('shows an error when the backend response has no transaction id', async () => {
    jest.mocked(paymentsApi.createTransaction).mockResolvedValue({
      amountInCents: 240000,
      currency: 'COP',
      customerEmail: 'luis@example.com',
      customerName: 'Luis Munar',
      items: [],
      reference: 'PAY-1',
      status: 'PENDING',
    });
    mockState = {
      ...baseState(),
      checkout: {
        ...baseState().checkout,
        cardSummary: {
          brand: 'visa',
          cardHolder: 'Luis Munar',
          lastFour: '4242',
        },
        step: 'summary',
      },
    };
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    await ReactTestRenderer.act(async () => {
      await tree.root
        .findByProps({ accessibilityLabel: 'Confirm payment' })
        .props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      payload: 'The backend did not return a transaction id.',
      type: 'checkout/setPaymentError',
    });
    expect(paymentsApi.processCardPayment).not.toHaveBeenCalled();
  });

  it('normalizes unknown payment errors', async () => {
    jest.mocked(paymentsApi.createTransaction).mockRejectedValue(undefined);
    mockState = {
      ...baseState(),
      checkout: {
        ...baseState().checkout,
        cardSummary: {
          brand: 'visa',
          cardHolder: 'Luis Munar',
          lastFour: '4242',
        },
        step: 'summary',
      },
    };
    const tree = render(
      <CardPaymentSheet
        visible
        onClose={onClose}
        onPaymentFinished={onPaymentFinished}
      />,
    );

    await ReactTestRenderer.act(async () => {
      await tree.root
        .findByProps({ accessibilityLabel: 'Confirm payment' })
        .props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      payload: 'Payment could not be processed.',
      type: 'checkout/setPaymentError',
    });
  });
});
