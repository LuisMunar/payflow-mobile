import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppDispatch } from './src/app/hooks';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { store } from './src/app/store';
import { loadCart } from './src/features/cart/cartSlice';
import { loadCheckout } from './src/features/checkout/checkoutSlice';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppBootstrap />
      </SafeAreaProvider>
    </Provider>
  );
}

function AppBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadCart());
    dispatch(loadCheckout());
  }, [dispatch]);

  return <RootNavigator />;
}

export default App;
