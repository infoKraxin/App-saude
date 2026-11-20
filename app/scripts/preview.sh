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
# Caminhos relativos: o artifact não é servido na raiz do domínio.
# O carregador de pedaços do Metro resolve caminhos pela URL atual; força a base da página.
python3 - <<'PY'
import glob
for f in glob.glob('expo/static/js/web/entry-*.js'):
    s=open(f).read()
    a="if(/^https?:\\/\\//.test(e))return e;const{url:t}"
    assert a in s, 'carregador do Metro mudou'
    s=s.replace(a,"if(/^https?:\\/\\//.test(e))return e;if(typeof document!=='undefined')return new URL(e,document.baseURI).toString();const{url:t}")
    open(f,'w').write(s)
PY
grep -rl '"/expo/\|"/assets/' . | xargs sed -i 's#"/expo/#"./expo/#g; s#"/assets/#"./assets/#g'
# Fixa a base na pasta da página e põe o roteador na rota "/" (o expo-router lê location.pathname).
python3 - <<'PY'
p='index.html';s=open(p).read()
boot='<script>(function(){try{var b=location.href.split("#")[0].split("?")[0].replace(/[^/]*$/,"");document.write("<base href=\\""+b+"\\">");if(location.pathname!=="/")history.replaceState(null,"","/")}catch(e){}})()</script>'
s=s.replace('<head>','<head>'+boot,1)
open(p,'w').write(s)
PY
echo "prévia em $(pwd)"
