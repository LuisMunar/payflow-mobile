import { useCallback, useEffect } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { RootStackParamList } from '../../app/navigation/types';
import { selectCartItemCount } from '../cart/cartSelectors';
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

type ProductListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Products'
>;

export function ProductListScreen({ navigation }: ProductListScreenProps) {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector(state => state.products);
  const cartCount = useAppSelector(selectCartItemCount);

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
    <Screen scroll={false}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ProductSeparator}
        renderItem={renderProduct}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>Secure checkout</Text>
                <Text style={styles.title}>Choose your products</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open cart"
                onPress={() => navigation.navigate('Cart')}
                style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <Button
                  accessibilityLabel="Retry products"
                  label="Retry"
                  onPress={loadProducts}
                  variant="secondary"
                />
              </View>
            ) : null}
          </>
        }
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
        ListFooterComponent={
          cartCount > 0 ? (
            <View style={styles.checkoutBar}>
              <Text style={styles.checkoutBarText}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'} selected
              </Text>
              <Button
                accessibilityLabel="View cart"
                label="View cart"
                onPress={() => navigation.navigate('Cart')}
              />
            </View>
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
  checkoutBar: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  checkoutBarText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
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
