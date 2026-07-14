import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { CartScreen } from '../src/features/cart/CartScreen';
import type { RootState } from '../src/app/store';

const mockDispatch = jest.fn();
const navigation = { navigate: jest.fn() };
let mockState: Pick<RootState, 'cart'>;

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

describe('CartScreen', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    navigation.navigate.mockReset();
    mockState = {
      cart: {
        items: [],
        restored: true,
      },
    };
  });

  it('renders empty cart state', () => {
    const tree = render(
      <CartScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'Your cart is empty' })).toBeTruthy();
    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('Products');
  });

  it('renders cart items and dispatches quantity actions', () => {
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

    const tree = render(
      <CartScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'Review your order' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Test product' })).toBeTruthy();

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Increase Test product' })
        .props.onPress();
      tree.root
        .findByProps({ accessibilityLabel: 'Decrease Test product' })
        .props.onPress();
      tree.root
        .findByProps({ accessibilityLabel: 'Remove Test product' })
        .props.onPress();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(3);
  });
});
