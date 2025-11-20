#!/bin/bash

set -e  # Abort if any command fails

cd $(dirname "$0")

# Run docker compose first - will abort if it fails due to set -e
docker compose up

if [ $? -ne 0 ]; then
    echo "Docker compose failed, aborting."
    exit 1
fi

# Remove docs directory if it exists
if [ -d "docs" ]; then
    rm -rf docs
fi

# Copy book directory to docs - will abort if it fails due to set -e
cp -r book docs

echo "Build completed successfully."