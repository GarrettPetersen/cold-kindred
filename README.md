# mystery.farm

A single-player, browser-based rabbit genealogical murder mystery.

## Project Status
This project has been restarted. Previous progress has been moved to the `archive` folder.

## Getting Started
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Build for production: `npm run build`

## Native App Development (iOS & Android)
This project uses [Capacitor](https://capacitorjs.com/) to run as a native app on iOS and Android.

### Quick Build & Sync
Run the following command to build the web assets and sync with both native projects in one step:
```bash
make
```

Or for a specific platform:
```bash
make build-ios
make build-android
```

### Manual Steps

#### iOS
1. **Sync**: `npx cap sync ios`
2. **Open Xcode**: `npx cap open ios`

#### Android
1. **Sync**: `npx cap sync android`
2. **Open Android Studio**: `npx cap open android`

