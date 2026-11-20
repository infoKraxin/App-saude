#!/usr/bin/env bash
# Build do projeto Vercel "appaurasaude": quiz na raiz e app em /app.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf public && mkdir -p public
cp index.html style.css app.js lottie.js public/
cp -r a l public/
(cd app && npm ci --no-audit --no-fund && npx expo export -p web)
cp -r app/dist public/app
echo "public/ pronto: quiz em /, app em /app"
