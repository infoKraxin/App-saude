# Evura (contexto para agentes)

O repositório tem três partes: o **quiz web** (raiz), o **app** (`app/`, Expo/React Native) e o **backend** (`supabase/`). O plano do produto está no doc "Evura: plano do app (MVP)"; as seções citadas abaixo são dele.

# Quiz web

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
- Config no topo: `CFG={pixel,ios,android,tour,users,proof}`. O quiz abre direto na introdução. `?tour=1` abre o carrossel para revisão e `?tour=0` o desativa. `proof`/`users` só aparecem se preenchidos com dado REAL.
- Tracking: `track(ev,p)` → `dataLayer` + `fbq` (só carrega com `CFG.pixel`). Eventos: `QuizStep` (toda tela), `QuizComplete`, `AppClick`.

## Regras de conformidade (importantes, anúncio de saúde)
- Conteúdo informativo; não diagnosticar nem prescrever. Sem estatísticas sem fonte, sem depoimentos/contagem de usuários inventados.
- Nomes de remédios (Ozempic, Wegovy, Mounjaro, Saxenda…) em Canetas GLP-1 são risco de reprovação: decisão pendente do dono.
- Consentimento LGPD na tela `trust`.

## Testes
`python3 tests/scan.py <area 0-7> <sexo 0=Homem 1=Mulher> <seed>` percorre o quiz inteiro e acusa texto `undefined/NaN` e erros de JS. `tests/audit.py` audita viewports (360×640, 390×844, 430×932). `tests/screens.py <ids> <W> <H> [area] [sexo]` tira screenshots de telas. Rodar scan nas 16 combinações antes de publicar.

## Pendências (dependem do dono)
Pixel ID (`CFG.pixel`), links das lojas (`CFG.ios/android`), decisão sobre marcas em Canetas, revisão clínica dos textos de diagnóstico, prova social real (beta fechado), login/e-mail → app, teste em iPhone/Android reais, landing page.

# App (`app/`)

Expo SDK 58 + Expo Router + TypeScript. Android primeiro; iOS depois com o mesmo código.

- Rodar: `cd app && npm install && npx expo start` (web: `npx expo start --web`). Testes: `npm test` (motor). Tipos: `npm run typecheck`. Build web estático: `npm run export:web`.
- Sem `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY` (ver `.env.example`) o app roda em **modo local**: tudo no aparelho, login sem código.
- `app/app/` — rotas. `(tabs)/` = Hoje, Descobertas, Registrar (abre `registro/`), Progresso, Comunidade. `perfil/` = configurações. `plano.tsx` = primeira abertura (confirma quiz, segurança, consentimentos). `dia/[day].tsx` = registros de um dia (apagar com desfazer).
- `src/data/` — tipos, estado local (`store.ts`, AsyncStorage, offline primeiro), portas (`areas.ts`, mesmos ids do quiz), datas.
- `src/engine/` — **motor de cruzamento**, TS puro e testado: `summary.ts` (resumo do dia), `hypotheses.ts` (biblioteca fixa), `analyze.ts` (com x sem, d de Cohen, níveis pouco dado / sinal fraco / sinal consistente, checagem de confusão), `safety.ts` (gestação, amamentação, transtorno alimentar, menor de 18, perda rápida, sintoma de alerta), `report.ts` (relatório sempre cheio + pacote para a IA, sem nome/e-mail).
- `src/lib/` — Supabase (login por código), sincronização (`sync.ts`), ponte do quiz (`quizLead.ts`), `useDay.ts`.
- `src/components/illus.ts` (ilustrações do Codex, `design/`), `premium.tsx` (HeroScreen, SheetHeader, Thumb, TipCard, Checks, toast com desfazer), `motion.tsx` (Enter, Pressy, Pop; Reanimated, respeita reduzir movimento). Títulos em Fraunces (serifa), números em Bricolage, texto em Hanken.
- `src/theme/` + `src/components/` — tokens (mesma identidade do quiz), tema claro/escuro, componentes acessíveis (alvo >= 48, rótulos, foco, escala de texto).

Regras: a IA só redige a partir do pacote do motor (seção 9); nunca diagnóstico, dose ou "causa"; sem número de peso/projeção no modo cuidadoso; sem SDK de anúncio no app; dado sem ficha revisada é dito como "observado só nos seus dados".

# Backend (`supabase/`)

- `migrations/20261120000000_base.sql` — todas as tabelas com RLS. Registros numa tabela `logs` (kind + payload jsonb), id gerado no aparelho; gatilho "apagar vence editar"; conta nova ganha perfil + teste de 7 dias.
- `functions/quiz-lead/` — recebe o plano do quiz (com consentimento) e grava em `quiz_leads`; o app lê pelo e-mail no primeiro login. No quiz: `CFG.lead` = URL da função.
- `tests/rls.mjs` — testa as políticas em Postgres (PGlite): `cd supabase/tests && npm install && npm test`.

Ainda não feito (depende de decisão ou de conta): projeto Supabase real, Groq (texto) e provedor de visão (foto), Health Connect (build nativo + aprovação da Play), notificações, checkout/webhook, comunidade com backend, painel interno, fichas de evidência revisadas, projeção de peso (decisão 3).

# Publicação (Vercel, projeto `appaurasaude`)

Ligado ao GitHub (`main`). `vercel.json` na raiz roda `scripts/vercel-build.sh`, que monta `public/` com o **quiz na raiz** e o **app em `/app`** (`experiments.baseUrl: "/app"` em `app/app.json`). Todo push em `main` publica os dois.
