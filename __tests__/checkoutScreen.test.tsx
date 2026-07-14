import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { CheckoutScreen } from '../src/features/checkout/CheckoutScreen';
import type { RootState } from '../src/app/store';

const navigation = {
  canGoBack: jest.fn(),
  goBack: jest.fn(),
  navigate: jest.fn(),
};
let mockState: Pick<RootState, 'cart'>;

jest.mock('../src/app/hooks', () => ({
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
});
