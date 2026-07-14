import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { CardPaymentSheet } from '../src/features/checkout/CardPaymentSheet';
import { CheckoutScreen } from '../src/features/checkout/CheckoutScreen';
import { setCheckoutStep } from '../src/features/checkout/checkoutSlice';
import type { RootState } from '../src/app/store';

const navigation = {
  canGoBack: jest.fn(),
  goBack: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
};
const mockDispatch = jest.fn();
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

describe('CheckoutScreen', () => {
  beforeEach(() => {
    navigation.canGoBack.mockReturnValue(true);
    navigation.goBack.mockReset();
    navigation.navigate.mockReset();
    navigation.replace.mockReset();
    mockDispatch.mockReset();
    mockState = {
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
        paymentError: null,
        paymentResult: null,
        paymentStatus: 'idle',
        step: 'cart',
      },
    };
  });

  it('renders payment summary and goes back to the previous cart screen', () => {
    const tree = render(
      <CheckoutScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'Payment summary' })).toBeTruthy();
    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Back to cart' }).props.onPress();
    });

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('opens cart when checkout has no previous screen', () => {
    navigation.canGoBack.mockReturnValue(false);
    const tree = render(
      <CheckoutScreen navigation={navigation as never} route={{} as never} />,
    );

    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Back to cart' }).props.onPress();
    });

    expect(navigation.goBack).not.toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith('Cart');
  });

  it('opens the card form from checkout', () => {
    mockState.checkout.customerEmail = 'luis@example.com';
    mockState.checkout.customerName = 'Luis Munar';
    const tree = render(
      <CheckoutScreen navigation={navigation as never} route={{} as never} />,
    );

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Pay with credit card' })
        .props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledWith(setCheckoutStep('card'));
    expect(tree.root.findByProps({ children: 'Add your payment card' })).toBeTruthy();
  });

  it('closes card sheet and replaces checkout with result after payment', () => {
    mockState.checkout.customerEmail = 'luis@example.com';
    mockState.checkout.customerName = 'Luis Munar';
    const tree = render(
      <CheckoutScreen navigation={navigation as never} route={{} as never} />,
    );

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Pay with credit card' })
        .props.onPress();
    });

    const sheet = tree.root.findByType(CardPaymentSheet);

    ReactTestRenderer.act(() => {
      sheet.props.onClose();
      sheet.props.onPaymentFinished();
    });

    expect(navigation.replace).toHaveBeenCalledWith('PaymentResult');
  });

  it('stores customer information before opening payment', () => {
    const tree = render(
      <CheckoutScreen navigation={navigation as never} route={{} as never} />,
    );

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Customer name' })
        .props.onChangeText('Luis Munar');
      tree.root
        .findByProps({ accessibilityLabel: 'Customer email' })
        .props.onChangeText('luis@example.com');
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      payload: { customerEmail: '', customerName: 'Luis Munar' },
      type: 'checkout/setCustomer',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: { customerEmail: 'luis@example.com', customerName: '' },
      type: 'checkout/setCustomer',
    });
  });
});
