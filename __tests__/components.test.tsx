import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import { Button } from '../src/shared/components/Button';
import { EmptyState } from '../src/shared/components/EmptyState';
import { LoadingState } from '../src/shared/components/LoadingState';
import { Screen } from '../src/shared/components/Screen';
import { ProductCard } from '../src/features/products/ProductCard';
import type { Product } from '../src/shared/types/api';

const product: Product = {
  id: 'product-1',
  available: true,
  currency: 'COP',
  description: 'A compact product description',
  imageUrl: 'https://example.test/product.jpg',
  name: 'Test product',
  priceInCents: 199900,
  stock: 4,
};

function render(element: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });

  return tree;
}

describe('shared components', () => {
  it('renders buttons and handles press events', () => {
    const onPress = jest.fn();
    const tree = render(<Button label="Continue" onPress={onPress} />);

    ReactTestRenderer.act(() => {
      tree.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(tree.root.findByProps({ children: 'Continue' })).toBeTruthy();
  });

  it('renders empty and loading states', () => {
    const empty = render(<EmptyState title="No data" description="Try again later." />);
    const loading = render(<LoadingState label="Loading" />);

    expect(empty.root.findByProps({ children: 'No data' })).toBeTruthy();
    expect(loading.root.findByProps({ children: 'Loading' })).toBeTruthy();
  });

  it('renders screen content', () => {
    const tree = render(
      <Screen>
        <Text>Screen content</Text>
      </Screen>,
    );

    expect(tree.root.findByProps({ children: 'Screen content' })).toBeTruthy();
  });

  it('renders product card details and add action', () => {
    const onAddPress = jest.fn();
    const tree = render(<ProductCard product={product} onAddPress={onAddPress} />);

    ReactTestRenderer.act(() => {
      tree.root
        .findByProps({ accessibilityLabel: 'Add Test product to cart' })
        .props.onPress();
    });

    expect(onAddPress).toHaveBeenCalledTimes(1);
    expect(tree.root.findByProps({ children: 'Test product' })).toBeTruthy();
    expect(tree.root.findByProps({ children: '4 available' })).toBeTruthy();
  });
});
