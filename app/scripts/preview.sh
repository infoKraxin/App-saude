#!/usr/bin/env bash
# Gera uma prévia web publicável como artifact (nomes com "_" são reservados lá).
# Uso: npm run export:web && bash scripts/preview.sh  -> pasta preview/
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf preview && cp -r dist preview && cd preview
mv _expo expo
grep -rl "_expo/" . | xargs sed -i 's#/_expo/#/expo/#g; s#"_expo/#"expo/#g'
cd expo/static/js/web
for f in __*; do mv "$f" "${f#__}"; done
for f in _layout-*; do mv "$f" "rt$f"; done
cd ../../../..
grep -rl "__common-\|__expo-metro-runtime-\|_layout-" . | xargs sed -i -E 's#([/"])__(common|expo-metro-runtime)-#\1\2-#g; s#([/"])_layout-#\1rt_layout-#g'
find . -name "*.ttf" | grep -vE "600SemiBold/Bric|700Bold/Bric|400Regular/Hank|500Medium/Hank|600SemiBold/Hank|600SemiBold/Fraunces" | xargs -r rm
rm -f metadata.json
echo "prévia em $(pwd)"
