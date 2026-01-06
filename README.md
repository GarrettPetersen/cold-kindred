# mystery.farm

A single-player, browser-based rabbit genealogical murder mystery.

## Project Status
This project has been restarted. Previous progress has been moved to the `archive` folder.

## Getting Started
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Build for production: `npm run build`

## iOS Development
This project uses [Capacitor](https://capacitorjs.com/) to run as a native iOS app.

### Quick Build & Sync
Run the following command to build the web assets and sync with the iOS project in one step:
```bash
make
```

### Manual Steps
1. **Build the web project**:
   ```bash
   npm run build
   ```
2. **Sync with iOS project**:
   ```bash
   npx cap sync ios
   ```
3. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```
   From Xcode, you can run the app on a simulator or a physical device.

