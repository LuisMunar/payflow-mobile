/* global jest */

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const insets = { bottom: 0, left: 0, right: 0, top: 0 };
  const frame = { height: 800, width: 400, x: 0, y: 0 };

  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaFrameContext: React.createContext(frame),
    SafeAreaInsetsContext: React.createContext(insets),
    SafeAreaView: View,
    initialWindowMetrics: { frame, insets },
    useSafeAreaFrame: () => frame,
    useSafeAreaInsets: () => insets,
  };
});
