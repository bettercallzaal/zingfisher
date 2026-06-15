#!/usr/bin/env bash
# Vercel build for the zingfisher monorepo.
# Install runs with --ignore-scripts (the root postinstall's hardcoded
# `cd node_modules/@charmverse/core` is not location-robust on Vercel), so we
# do the needed post-install steps here, resolving @charmverse/core wherever
# npm placed it.
set -euo pipefail

echo "[vercel-build] applying patches..."
npx patch-package

echo "[vercel-build] locating @charmverse/core..."
CORE_DIR="$(node -p "require('path').dirname(require.resolve('@charmverse/core/package.json'))")"
echo "[vercel-build] @charmverse/core -> $CORE_DIR"

echo "[vercel-build] generating Prisma client..."
npx prisma generate --schema="$CORE_DIR/src/prisma/schema.prisma"

echo "[vercel-build] building webapp..."
npm run build -w apps/webapp
