#!/usr/bin/env bash
# Gera ilustrações pelo Codex CLI (logado com ChatGPT). Uso: bash scripts/gerar-ilustracoes.sh [pasta] [paralelo]
# Lê design/ilustracoes/lista.tsv (nome<TAB>descrição) e pula o que já existe.
set -u
cd "$(dirname "$0")/.."
OUT="design/ilustracoes/${1:-v1}"; PAR="${2:-5}"; mkdir -p "$OUT"
STYLE="$(cat design/ESTILO.md)"
gen() {
  local name="$1" desc="$2"
  [ -f "$OUT/$name.png" ] && return
  (cd "$OUT" && timeout 600 codex exec --skip-git-repo-check -s workspace-write \
    "Use a sua ferramenta de geração de imagem para criar 1 imagem PNG e salve nesta pasta como $name.png. Siga à risca o guia de estilo. Não faça mais nada.

GUIA DE ESTILO:
$STYLE

Imagem: $desc" </dev/null > "/tmp/cx-$name.log" 2>&1) && echo "ok $name" || echo "FALHOU $name"
}
while IFS=$'\t' read -r n d; do
  [ -z "$n" ] && continue
  gen "$n" "$d" &
  while [ "$(jobs -r | wc -l)" -ge "$PAR" ]; do sleep 2; done
done < design/ilustracoes/lista.tsv
wait
