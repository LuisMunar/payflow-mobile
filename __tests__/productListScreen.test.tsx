import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { ProductListScreen } from '../src/features/products/ProductListScreen';
import type { RootState } from '../src/app/store';

const mockDispatch = jest.fn();
const navigation = { navigate: jest.fn() };
let mockState: Pick<RootState, 'cart' | 'products'>;

jest.mock('../src/app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: Pick<RootState, 'cart' | 'products'>) => unknown) =>
    selector(mockState),
}));

function render(element: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });

  return tree;
}

describe('ProductListScreen', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    navigation.navigate.mockReset();
    mockState = {
      cart: {
        items: [],
        restored: true,
      },
      products: {
        error: null,
        items: [],
        status: 'idle',
      },
    };
  });

  it('requests products when the screen starts idle', () => {
    render(<ProductListScreen navigation={navigation as never} route={{} as never} />);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('renders products and cart count', () => {
    mockState = {
      cart: {
        items: [
          {
            product: {
              id: 'product-1',
              available: true,
              currency: 'COP',
              description: 'A compact product description',
              imageUrl: 'https://example.test/product.jpg',
              name: 'Test product',
              priceInCents: 199900,
              stock: 4,
            },
            quantity: 2,
          },
        ],
        restored: true,
      },
      products: {
        error: null,
        items: [
          {
            id: 'product-1',
            available: true,
            currency: 'COP',
            description: 'A compact product description',
            imageUrl: 'https://example.test/product.jpg',
            name: 'Test product',
            priceInCents: 199900,
            stock: 4,
          },
        ],
        status: 'succeeded',
      },
    };

    const tree = render(
      <ProductListScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'Choose your products' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 2 })).toBeTruthy();
    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Open cart' }).props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('Cart');
  });

  it('renders backend errors with retry action', () => {
    mockState = {
      cart: {
        items: [],
        restored: true,
      },
      products: {
        error: 'Network error',
        items: [],
        status: 'failed',
      },
    };

    const tree = render(
      <ProductListScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(tree.root.findByProps({ children: 'Network error' })).toBeTruthy();
    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Retry products' }).props.onPress();
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});
