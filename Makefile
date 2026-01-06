.PHONY: build-ios

# Default target
all: build-ios

# Build the web project and sync with the iOS native project
build-ios:
	@echo "Building web assets..."
	npm run build
	@echo "Syncing with iOS project..."
	npx cap sync ios
	@echo "Done! You can now open Xcode or push to GitHub."

