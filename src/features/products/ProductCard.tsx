import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { colors } from '../../shared/theme/colors';
import { radii, spacing } from '../../shared/theme/layout';
import { typography } from '../../shared/theme/typography';
import type { Product } from '../../shared/types/api';
import { formatMoney } from '../../shared/utils/formatMoney';

type ProductCardProps = {
  product: Product;
  onAddPress: (event: GestureResponderEvent) => void;
};

export function ProductCard({ product, onAddPress }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.body}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
          <Text style={styles.stock}>
            {product.available ? `${product.stock} available` : 'Out of stock'}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {formatMoney(product.priceInCents, product.currency)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to cart`}
            disabled={!product.available}
            onPress={onAddPress}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
              !product.available && styles.addButtonDisabled,
            ]}>
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 76,
    paddingHorizontal: spacing.md,
  },
  addButtonDisabled: {
    backgroundColor: colors.borderStrong,
  },
  addButtonPressed: {
    opacity: 0.84,
  },
  addButtonText: {
    color: colors.onPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: 19,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  image: {
    backgroundColor: colors.surfaceMuted,
    minHeight: 132,
    width: 112,
  },
  price: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  stock: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    lineHeight: 23,
  },
});
