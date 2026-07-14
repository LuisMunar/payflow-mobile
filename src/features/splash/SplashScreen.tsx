import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../app/navigation/types';
import { Screen } from '../../shared/components/Screen';
import { colors } from '../../shared/theme/colors';
import { spacing } from '../../shared/theme/layout';
import { typography } from '../../shared/theme/typography';

type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: SplashScreenProps) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigation.replace('Products');
    }, 900);

    return () => clearTimeout(timeoutId);
  }, [navigation]);

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>P</Text>
      </View>
      <Text style={styles.title}>Payflow</Text>
      <Text style={styles.subtitle}>Card checkout, ready for Android.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  brandMarkText: {
    color: colors.onPrimary,
    fontSize: 34,
    fontWeight: '900',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '900',
  },
});
