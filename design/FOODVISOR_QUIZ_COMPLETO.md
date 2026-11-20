# Foodvisor: engenharia reversa completa do quiz (APK 7.8.1)

Fontes: `res/raw/ten_min_assessment.json` (fluxo local com condições), 795 textos `onboarding2.*` em pt-BR (inclui telas que só o servidor manda), layouts e classes `io.foodvisor.onboarding.view.step.*`.
Arquivos brutos: `foodvisor-fluxo-bruto.txt` (ordem + condições) e `foodvisor-telas-completas.txt` (todas as telas e opções).

## 1. Como o quiz é construído
- O fluxo é um JSON com telas e blocos condicionais (`user.tags contains main_goal/...`, `settings.weight_current > settings.weight_goal`, `settings.gender == F`). O app só tem as peças; o servidor decide a ordem.
- Tipos de tela: pergunta única, múltipla (com "Outro" + texto livre), sim/não com imagem, pergunta com cabeçalho grande, escala Likert (concordo/discordo, 5 pontos), reforço (sem pergunta, abre bloco), slides custom (perfil, meta, ritmo, curva, carregamentos, GDPR, notificação, indicação, cadastro, paywall).
- Textos personalizados com variáveis: `{settings.name}`, `{settings.age}`, gênero e objetivo ("Mulheres de 34 anos que querem perder peso podem precisar de uma abordagem diferente").
- 4 blocos com chip de categoria e barra segmentada: Objetivo e perfil → Seu ambiente → Hábitos e comportamentos → Suas necessidades.

## 2. Ordem completa (caminho "perder peso")
1. Objetivo ("Por que você está aqui?") → slide do método (curva cinza × curva do programa)
2. **Objetivo e perfil:** motivações (múltipla) → nível de motivação → o que topa fazer → reforço "lugar certo" → perfil (gênero, idade, altura, peso) → meta de peso ("Perder X é uma meta realista", faixa recomendada, alerta de IMC baixo) → ritmo ("Você está aqui para perder peso!") → evento + data → restrições → histórico médico → **carregamento** ("Gravando seus dados" / "Calculando sua linha do tempo", com depoimento) → **1ª previsão** ("Você estará com X até [data]", "~X em 1 mês", "as próximas perguntas podem antecipar")
3. **Seu ambiente:** reforço (mini previsão "Hoje → alcançar X até início/fim de mês") → dedicação (por idade e gênero) → filhos → estudo → trabalho (+ tempo livre conforme o trabalho) → dinheiro → apoio social → pressão social → eventos que fizeram ganhar peso (mulher: menopausa, gravidez...) → já tentou? → o que fez (inclui GLP-1) → deu certo? → reforço "fracassos passados não implicam falhas futuras"
4. **Hábitos:** reforço "quase terminando" → belisca? → gatilhos → reforço → alimentação saudável? → refeição mais difícil → por quê → refrigerante → tempo sentado → exercício → topa treinar?
5. **Fim das perguntas:** "Obrigado por compartilhar sua história" + 4 slides com barra "Criando seu programa" → "Encontramos o seu programa!" + curva atualizada
6. **Suas necessidades:** o que quer aprender → recursos que quer → o que importa no programa → sucesso em 2 semanas
7. Telas do servidor ao redor: como conheceu (atribuição), quanto tempo por dia (0–5 / 5–10 / 10–15 min), quando quer lembretes, "vamos verificar se você é compatível", salvar respostas (cadastro), indicar amigo (2 semanas grátis), paywall.
8. **Paywall:** "Vamos te ajudar a chegar a X até [data]", o que o programa inclui, nota nas lojas, depoimentos, nutricionista, FAQ (inclui reembolso e cancelamento), linha do tempo do teste, "como cancelar".
