#!/usr/bin/env bash
# Vercel build for the zingfisher monorepo.
# Install runs with --ignore-scripts (the root postinstall's hardcoded
# `cd node_modules/@charmverse/core` is not location-robust on Vercel), so we
# do the needed post-install steps here. @charmverse/core has an `exports`
# field that blocks require.resolve('.../package.json'), so we locate its
# install dir directly and run its prisma generate from inside it (exactly what
# core's own postinstall does), which puts the generated client where the app
# imports it from.
set -euo pipefail

echo "[vercel-build] applying patches..."
npx patch-package

echo "[vercel-build] locating @charmverse/core..."
CORE_DIR=""
for d in node_modules/@charmverse/core apps/webapp/node_modules/@charmverse/core; do
  if [ -d "$d" ]; then CORE_DIR="$d"; break; fi
done
if [ -z "$CORE_DIR" ]; then
  CORE_DIR="$(find . -maxdepth 5 -type d -path '*node_modules/@charmverse/core' -not -path '*/.git/*' 2>/dev/null | head -1)"
fi
if [ -z "$CORE_DIR" ]; then
  echo "[vercel-build] ERROR: @charmverse/core not found under node_modules"
  ls -la node_modules/@charmverse 2>/dev/null || true
  exit 1
fi
echo "[vercel-build] @charmverse/core -> $CORE_DIR"

echo "[vercel-build] generating Prisma client..."
( cd "$CORE_DIR" && npx prisma generate --schema=./src/prisma/schema.prisma )

echo "[vercel-build] building webapp..."
npm run build -w apps/webapp
