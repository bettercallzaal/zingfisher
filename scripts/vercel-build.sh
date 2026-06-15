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

locate_core() {
  for d in node_modules/@charmverse/core apps/webapp/node_modules/@charmverse/core; do
    if [ -d "$d" ]; then echo "$d"; return; fi
  done
  find . -maxdepth 6 -type d -path '*node_modules/@charmverse/core' -not -path '*/.git/*' 2>/dev/null | head -1
}

echo "[vercel-build] locating @charmverse/core..."
CORE_DIR="$(locate_core)"
if [ -z "$CORE_DIR" ]; then
  echo "[vercel-build] @charmverse/core missing after install; diagnostics:"
  echo "  pwd=$(pwd)"
  ls -la node_modules/@charmverse 2>&1 || true
  echo "[vercel-build] force-installing @charmverse/core (runs its own prisma generate)..."
  npm install @charmverse/core --no-save --no-audit --no-fund || true
  CORE_DIR="$(locate_core)"
fi
if [ -z "$CORE_DIR" ]; then
  echo "[vercel-build] ERROR: @charmverse/core still not found under node_modules"
  exit 1
fi
echo "[vercel-build] @charmverse/core -> $CORE_DIR"

echo "[vercel-build] generating Prisma client..."
( cd "$CORE_DIR" && npx prisma generate --schema=./src/prisma/schema.prisma )

echo "[vercel-build] building webapp..."
npm run build -w apps/webapp
