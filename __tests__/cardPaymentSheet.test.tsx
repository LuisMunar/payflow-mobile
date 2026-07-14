import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { CardPaymentSheet } from '../src/features/checkout/CardPaymentSheet';
import {
  setCardSummary,
  setCheckoutStep,
} from '../src/features/checkout/checkoutSlice';
import type { RootState } from '../src/app/store';

const mockDispatch = jest.fn();
const onClose = jest.fn();
let mockState: Pick<RootState, 'cart' | 'checkout'>;

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
      customerEmail: '',
      customerName: '',
      step: 'card',
    },
  };
}

describe('CardPaymentSheet', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    onClose.mockReset();
    mockState = baseState();
  });

  it('shows validation errors before continuing', () => {
    const tree = render(<CardPaymentSheet visible onClose={onClose} />);

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
    const tree = render(<CardPaymentSheet visible onClose={onClose} />);

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
        step: 'summary',
      },
    };
    const tree = render(<CardPaymentSheet visible onClose={onClose} />);

    expect(tree.root.findByProps({ children: 'Confirm your payment' }))
      .toBeTruthy();
    expect(tree.root.findByProps({ children: 'Mastercard' })).toBeTruthy();
    expect(tree.root.findByProps({ children: '**** 4444' })).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityLabel: 'Confirm payment' }))
      .toBeTruthy();
  });
});
