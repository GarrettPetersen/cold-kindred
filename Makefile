.PHONY: build-ios build-android build-all open-ios open-android

# Default target
all: build-all

# Build for iOS
build-ios:
	@echo "Ensuring all assets are in public folder..."
	@mkdir -p public/assets/animations public/assets/detectives public/assets/items
	@cp -n assets/animations/*.png public/assets/animations/ 2>/dev/null || true
	@cp -n assets/detectives/*.png public/assets/detectives/ 2>/dev/null || true
	@cp -n assets/items/*.png public/assets/items/ 2>/dev/null || true
	@echo "Building web assets..."
	npm run build
	@echo "Syncing with iOS project..."
	npx cap sync ios
	@echo "Done! You can now open Xcode or push to GitHub."

# Build for Android
build-android:
	@echo "Ensuring all assets are in public folder..."
	@mkdir -p public/assets/animations public/assets/detectives public/assets/items
	@cp -n assets/animations/*.png public/assets/animations/ 2>/dev/null || true
	@cp -n assets/detectives/*.png public/assets/detectives/ 2>/dev/null || true
	@cp -n assets/items/*.png public/assets/items/ 2>/dev/null || true
	@echo "Building web assets..."
	npm run build
	@echo "Syncing with Android project..."
	npx cap sync android
	@echo "Done! You can now open Android Studio or push to GitHub."

# Build for both
build-all:
	@echo "Building web assets..."
	npm run build
	@echo "Syncing with iOS and Android projects..."
	npx cap sync
	@echo "Done! All platforms synced."

# Open native IDEs
open-ios:
	npx cap open ios

open-android:
	npx cap open android

