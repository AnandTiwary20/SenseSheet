#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Build the application
npm run build

# Install only production dependencies
npm prune --production
