# payflow-mobile

Android mobile app for the Payflow credit card checkout flow.

The app lets a customer browse products, build a cart, enter card data, confirm
payment against the local backend, and see the final transaction result.

## Stack

- React Native 0.86
- React 19
- TypeScript
- Redux Toolkit
- React Navigation
- React Native Keychain
- Jest
- Android / Gradle

## Requirements

- Node.js `24.16.0` recommended. See `.nvmrc`.
- npm `>=11.13.0`
- Java 17
- Android Studio
- Android SDK
- Android emulator or physical Android device

Recommended shell variables:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Check the environment:

```bash
java -version
npm --version
npm run android:devices
```

## Local Setup

Install dependencies:

```bash
npm install
```

Start Metro:

```bash
npm start
```

Run the app on Android:

```bash
npm run android
```

List connected Android devices:

```bash
npm run android:devices
```

List available emulators:

```bash
npm run android:emulators
```

## Backend Connection

The app consumes the local `payflow-back` backend.

Expected backend URL from the Android emulator:

```text
http://10.0.2.2:3000
```

The local API base URL is configured in:

```text
src/shared/constants/config.ts
```

Before testing the payment flow, start the backend and make sure these endpoints
are available:

```text
GET  /health
GET  /products
POST /transactions
POST /transactions/:id/payments/card
GET  /transactions/:id
```

## Main Flow

1. Splash screen.
2. Product list.
3. Cart with quantity controls.
4. Checkout with customer information.
5. Card form in a bottom sheet.
6. Local card validation.
7. Payment summary.
8. Backend payment processing.
9. Result screen for approved, rejected, and error states.

## Security Notes

- The full card number is never persisted.
- CVC is never persisted.
- Card number and CVC live only in local component state while the payment is submitted.
- Redux stores only safe payment metadata such as card brand and last four digits.
- Secure storage is used for recoverable state such as cart and safe checkout draft data.
- Do not commit real credentials or private values.

## Useful Test Card

For local sandbox testing:

```text
Number: 4242 4242 4242 4242
MM/YY: 12/30
CVC: 123
Holder: Luis Munar
```

## Architecture

The app follows a feature-based architecture:

```text
src/
  app/
    hooks.ts
    store.ts
    navigation/
  features/
    cart/
    checkout/
    products/
    splash/
  shared/
    api/
    components/
    constants/
    storage/
    theme/
    types/
    utils/
    validation/
```

State management uses Redux Toolkit. Side effects are isolated in API adapters,
listener middleware, and screen-level handlers where sensitive card data must
remain outside Redux.

## Scripts

```bash
npm start
npm run android
npm run android:devices
npm run android:emulators
npm run android:apk
npm run android:install
npm run typecheck
npm run lint
npm test
npm run test:cov
```

## Testing And Coverage

Run all checks:

```bash
npm run typecheck
npm run lint
npm run test:cov
```

Latest verified mobile coverage:

```text
Test Suites: 17 passed
Tests:       81 passed

Statements: 99.75%
Branches:   100%
Functions:  99.28%
Lines:      100%
```

Coverage target: more than 80%.

## Android APK

The installable release APK for delivery is versioned at:

```text
android/app/release/app-release.apk
```

This release APK is signed locally for the technical test and supports the local
backend URL used by the Android emulator.

Generate a development debug APK:

```bash
npm run android:apk
```

Default debug APK output path:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Install the debug APK on a connected emulator or Android device:

```bash
npm run android:install
```

Install the release APK manually:

```bash
$ANDROID_HOME/platform-tools/adb install -r android/app/release/app-release.apk
```

## Manual Verification

Recommended manual checks before delivery:

1. Start `payflow-back`.
2. Start Android emulator.
3. Run `npm run android`.
4. Add products to cart.
5. Kill and reopen the app to verify cart and safe checkout draft recovery.
6. Complete customer information.
7. Enter the test card.
8. Confirm payment.
9. Verify approved/rejected/error result screen behavior.
10. Verify approved payment refreshes product stock and clears cart.

## Git Workflow

Work is organized by feature branches and pull requests.

Final mobile branches used:

```text
feature/mobile-project-setup
feature/mobile-cart-checkout
feature/mobile-card-form
feature/mobile-payment-flow
feature/mobile-resilience-ux
feature/mobile-readme-apk
```
