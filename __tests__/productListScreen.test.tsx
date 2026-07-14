import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { ProductListScreen } from '../src/features/products/ProductListScreen';
import type { RootState } from '../src/app/store';

const mockDispatch = jest.fn();
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
    mockState = {
      cart: {
        items: [],
      },
      products: {
        error: null,
        items: [],
        status: 'idle',
      },
    };
  });

  it('requests products when the screen starts idle', () => {
    render(<ProductListScreen />);

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

    const tree = render(<ProductListScreen />);

    expect(tree.root.findByProps({ children: 'Choose your products' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 2 })).toBeTruthy();
  });

  it('renders backend errors with retry action', () => {
    mockState = {
      cart: {
        items: [],
      },
      products: {
        error: 'Network error',
        items: [],
        status: 'failed',
      },
    };

    const tree = render(<ProductListScreen />);

    expect(tree.root.findByProps({ children: 'Network error' })).toBeTruthy();
    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});
