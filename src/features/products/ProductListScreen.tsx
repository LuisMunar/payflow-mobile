import { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addProduct } from '../cart/cartSlice';
import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';
import { LoadingState } from '../../shared/components/LoadingState';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/layout';
import { typography } from '../../shared/theme/typography';
import type { Product } from '../../shared/types/api';
import { ProductCard } from './ProductCard';
import { fetchProducts } from './productsSlice';

function ProductSeparator() {
  return <View style={styles.separator} />;
}

export function ProductListScreen() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector(state => state.products);
  const cartCount = useAppSelector(state =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0),
  );

  const loadProducts = useCallback(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'idle') {
      loadProducts();
    }
  }, [loadProducts, status]);

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} onAddPress={() => dispatch(addProduct(item))} />
  );

  if (status === 'loading' && items.length === 0) {
    return <LoadingState label="Loading products" />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Secure checkout</Text>
          <Text style={styles.title}>Choose your products</Text>
        </View>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cartCount}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Retry" onPress={loadProducts} variant="secondary" />
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ProductSeparator}
        renderItem={renderProduct}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading' && items.length > 0}
            onRefresh={loadProducts}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          status === 'succeeded' ? (
            <EmptyState
              title="No products yet"
              description="Start the backend and refresh the catalog."
            />
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cartBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    minWidth: 36,
    paddingHorizontal: spacing.sm,
  },
  cartBadgeText: {
    color: colors.onPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    lineHeight: 19,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  separator: {
    height: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: '900',
    lineHeight: 32,
  },
});
