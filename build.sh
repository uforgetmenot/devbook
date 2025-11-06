#!/bin/bash

cd $(dirname "$0")

# Remove docs directory if it exists
if [ -d "docs" ]; then
    rm -rf docs
fi

# Copy book directory to docs
cp -r book docs

docker compose up

