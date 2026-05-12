#!/usr/bin/env bash

# Copy ABIs from packages/types to services/backend for Go consumption
# Run this after sync-contracts to ensure backend has the latest ABIs

set -e

SOURCE_DIR="packages/types/src/generated/abis"
TARGET_DIR="services/backend/internal/contracts/abis"

echo "Copying ABIs from $SOURCE_DIR to $TARGET_DIR..."

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy all JSON ABI files
cp "$SOURCE_DIR"/*.json "$TARGET_DIR/"

echo "✓ ABIs copied successfully"
echo "  Files copied:"
ls -1 "$TARGET_DIR"/*.json | sed 's/^/    /'
