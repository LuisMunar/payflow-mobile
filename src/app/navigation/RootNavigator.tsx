import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CartScreen } from '../../features/cart/CartScreen';
import { CheckoutScreen } from '../../features/checkout/CheckoutScreen';
import { PaymentResultScreen } from '../../features/checkout/PaymentResultScreen';
import { ProductListScreen } from '../../features/products/ProductListScreen';
import { SplashScreen } from '../../features/splash/SplashScreen';
import { colors } from '../../shared/theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Products"
          component={ProductListScreen}
          options={{ title: 'Products' }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: 'Cart' }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: 'Checkout' }}
        />
        <Stack.Screen
          name="PaymentResult"
          component={PaymentResultScreen}
          options={{ title: 'Payment result' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
