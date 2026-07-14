import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { FlatList, Text } from 'react-native';

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

    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'View cart' }).props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('Cart');
  });

  it('renders loading and empty catalog states', () => {
    mockState.products.status = 'loading';
    const loading = render(
      <ProductListScreen navigation={navigation as never} route={{} as never} />,
    );

    expect(loading.root.findByProps({ children: 'Loading products' })).toBeTruthy();

    mockState.products.status = 'succeeded';
    const empty = render(
      <ProductListScreen navigation={navigation as never} route={{} as never} />,
    );
    const list = empty.root.findByType(FlatList);

    expect(list.props.ListEmptyComponent).toBeTruthy();
    expect(list.props.ItemSeparatorComponent()).toBeTruthy();
  });

  it('marks refresh control as refreshing when reloading existing products', () => {
    mockState = {
      cart: {
        items: [],
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
        status: 'loading',
      },
    };

    const tree = render(
      <ProductListScreen navigation={navigation as never} route={{} as never} />,
    );
    const refreshControl = tree.root.findByType(FlatList).props.refreshControl;

    expect(refreshControl.props.refreshing).toBe(true);
    ReactTestRenderer.act(() => {
      refreshControl.props.onRefresh();
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('renders singular checkout copy', () => {
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
            quantity: 1,
          },
        ],
        restored: true,
      },
      products: {
        error: null,
        items: [],
        status: 'succeeded',
      },
    };

    const tree = render(
      <ProductListScreen navigation={navigation as never} route={{} as never} />,
    );

    const checkoutCopy = tree.root
      .findAllByType(Text)
      .find(node => {
        const children = node.props.children;

        return (
          Array.isArray(children) &&
          children.includes(1) &&
          children.includes('item') &&
          children.includes(' selected')
        );
      });

    expect(checkoutCopy).toBeTruthy();
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
