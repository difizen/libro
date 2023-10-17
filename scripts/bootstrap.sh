#!/bin/bash

# Bootstrap this monorepo for development

set -e -u -o pipefail

RED='\033[0;31m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Install Node dependencies
# pnpm install --frozen-lockfile
pnpm install

# Run setup tasks across all packages
pnpm run setup
