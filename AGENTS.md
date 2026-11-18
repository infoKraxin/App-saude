# Evura — quiz web (contexto para agentes)

**Evura**: "O sistema de saúde que se adapta a você". App de saúde amplo, com portas por dor. Este repositório é o **quiz web mobile-first** que leva o lead ao app. O **paywall fica dentro do app** (teste grátis de 7 dias), nunca no quiz.

## Estrutura
- `index.html` — casca (phone, header, main, cta). `style.css` — todo o CSS. `app.js` — toda a lógica (JS puro, sem build, sem framework).
- `lottie.js` — lottie-web 5.13.0 (MIT). `a/*.webp` — arte 3D (Microsoft Fluent Emoji 3D, MIT). `l/*.json` — animações (Google Noto Emoji Lottie, CC BY 4.0; crédito no rodapé da tela `done`).
- `tests/` — scripts Playwright (Python). Servir a raiz: `python3 -m http.server 8765`.
- As fotos de homem/mulher da tela inicial e os ícones estão embutidos em `app.js` (data URIs/JSON).

## Arquitetura do `app.js`
- Máquina de estados: `flow` (array de ids de tela) + `idx`; `R[id]()` renderiza cada tela; `render()`, `shell(html)`, `setCta`, `advance`, `next/prev`, `opts/bindOpts`, `multi`, `yn`, `story`, `ckpt`, `sheet()` (overlays via mapa `SHA`).
- `buildFlow()` monta o fluxo conforme a área e o sexo. `BASE=['tour'?,'intro','name','area']`; depois `certo, age, body, imc, [goalw], motiv, event, edate, pace, prog, proj, feel, sleep, move, restr, cond, trust, remind, ck1, q0–q5, ck2, emp, q6, q7, magic, q8–q11` e `TAIL=analysis, result, findings, plan, email, pact, done`. `edate` é pulada se não há evento (`skipId`).
- 8 áreas: Emagrecimento, Canetas GLP-1, Intestino, Saúde hormonal (homem e mulher), Sono, Energia, Ganho de massa, Longevidade. Saúde hormonal para homem usa `isHM()` + troca de texto (`MX`, `mxDom`) para falar de testosterona/libido, sem "ciclo".
- Histórico: `persist(id)` (pushState + sessionStorage `evura_q`); `popstate` volta uma tela/fecha sheet; `restore()` só em reload/back_forward.
- Arte: `art(slug,h)` (3D), `lot(code,h,loop)` (Lottie), `mas(mood,h)` (mascote **Evu**, SVG original: hi/calm/think/cheer).
- Config no topo: `CFG={pixel,ios,android,tour,users,proof}`. `?tour=0` desliga o carrossel inicial. `proof`/`users` só aparecem se preenchidos com dado REAL.
- Tracking: `track(ev,p)` → `dataLayer` + `fbq` (só carrega com `CFG.pixel`). Eventos: `QuizStep` (toda tela), `QuizComplete`, `AppClick`.

## Regras de conformidade (importantes, anúncio de saúde)
- Conteúdo informativo; não diagnosticar nem prescrever. Sem estatísticas sem fonte, sem depoimentos/contagem de usuários inventados.
- Nomes de remédios (Ozempic, Wegovy, Mounjaro, Saxenda…) em Canetas GLP-1 são risco de reprovação: decisão pendente do dono.
- Consentimento LGPD na tela `trust`.

## Testes
`python3 tests/scan.py <area 0-7> <sexo 0=Homem 1=Mulher> <seed>` percorre o quiz inteiro e acusa texto `undefined/NaN` e erros de JS. `tests/audit.py` audita viewports (360×640, 390×844, 430×932). `tests/screens.py <ids> <W> <H> [area] [sexo]` tira screenshots de telas. Rodar scan nas 16 combinações antes de publicar.

## Pendências (dependem do dono)
Pixel ID (`CFG.pixel`), links das lojas (`CFG.ios/android`), decisão sobre marcas em Canetas, revisão clínica dos textos de diagnóstico, prova social real (beta fechado), login/e-mail → app, teste em iPhone/Android reais, landing page.
