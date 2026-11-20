# Foodvisor 7.8.1: engenharia reversa do app (pós-quiz)

Fonte: APK (manifesto, 31 telas, 847 layouts, 3.048 textos pt-BR do app, 22 Lottie, 2 Rive, 120 ilustrações raster e as vetoriais, cores, medidas, fontes). Textos completos em `foodvisor-app-textos.tsv`. Nada de arte, texto, animação ou código deles entra no Evura: só estrutura, mecânica e padrões.

## 1. Estrutura
- **5 abas:** Coach (aulas do dia) · Diário (registro e calorias) · **Semente** (mascote no centro, sem rótulo) · Missões · Perfil.
- Entrada: Landing → Onboarding (quiz) → cadastro → paywall → oferta de boas-vindas → app.
- Telas cheias por cima das abas: registro de refeição, ficha do alimento, resumo da refeição, marco (milestone), relatório do dia, dieta, receita, treino (player), aula, peso, configurações, chat com nutricionista, premium.
- Permissões: câmera, microfone (voz), passos/atividade/peso (Health Connect), notificações, faturamento, anúncios.

## 2. Funcionalidades (o que cada uma faz)
**Registro de refeição ("Meal XP")**
- Quatro jeitos: foto (IA identifica e mostra porções, "Corrigir resultados" descrevendo o erro), código de barras (com cadastro colaborativo de produto novo), voz ("Hoje comi salmão com arroz…", estados Ouvindo → Transcrevendo → Analisando), texto livre ou link de receita.
- Cesta de alimentos com quantidade e porção, favoritos, refeições recentes, "Adição rápida", reportar erro no alimento.
- Ao salvar: **resumo da refeição** com avaliação (carinha), recompensa animada (3 variações), e análise da refeição a partir de 2 alimentos.
- Primeira vez: tutorial em balões ("Pesquise aqui", "Parabéns, primeiro alimento!", "Pronto para salvar?").

**Diário (Journal)**
- Meta de calorias e macros do dia, refeições por horário, atividade física (manual ou sincronizada), notas do dia, análise do dia (distribuição por refeição, carboidratos, proteína…), nota do dia (premium).
- Calorias flexíveis por dia ("+X na sexta e sábado", média semanal igual).
- Registro antecipado de dias futuros (premium).

**Coach**
- Cabeçalho que muda por dia da semana e hora ("Dormiu bem, {nome}?", "Está chegando o fim de semana!").
- "Minhas aulas do dia": lições curtas (minutos), com diagramas educativos (cérebro e recompensa, ciclo do hábito, efeito sanfona), feedback "achou interessante?", fim de aula com "Ir para a próxima" ou "Mais tarde", biblioteca de aulas salvas.
- Quando terminar tudo: "Parabéns, você completou suas aulas!" + resumo do dia.
- Chat com nutricionista (premium), artigos, dietas, receitas, treinos.

**Relatório do dia** (Daily report): resumo, nutrientes, top/flop alimentos ("bom porque…", "evitar porque…"), passos vs 10.000, atividade, conselhos, "peça ao nutricionista".

**Sequência (streak)**
- Começa no 1º registro ("Uma sequência começou!"). Tela cheia com número gigante em serifa (128 sp), chama animada, calendário linear, confete.
- Meta de sequência escolhida pelo usuário (7 / 14 / 30 / 50 dias: Bom / Ótimo / Incrível / Imparável).
- **Gelos (freezes):** até 2 equipados; protegem um dia perdido; ganha de volta registrando. Mensagens de perda gentis ("Todo mundo perde um dia!").
- Calendário com sequência atual e melhor sequência; widget de sequência.

**Semente (mascote/tamagotchi, Rive)**
- Semente misteriosa que a pessoa nomeia; cresce com os registros diários: folhagem → pernas → braços → bochechas → boca → adulta. Estados: parado, olhando, pulando, risada, carinho (toque), animado, evolução.
- Gemas ganhas registrando; loja com roupas e itens de jardim, "item do dia", ofertas diárias (gemas por anúncio).
- Passe de temporada (Natal, Halloween) com trilha grátis × premium.

**Missões (Quests)**
- Missões diárias (com horas restantes) e missão do mês; baú animado ao concluir; primeira missão guiada ("Registre sua refeição mais recente").
- "Missões de Saúde": trilha de níveis (paisagem com o mascote andando entre nós), níveis desbloqueiam recompensas.

**Outros**
- Jejum intermitente (12:12 a 20:4, cronômetro, fases), dietas (troca de dieta muda metas e receitas), receitas, treinos em vídeo com dificuldade adaptativa, progresso (peso com gráfico, nutrição: média de macros, distribuição, avaliação das refeições), amigos (convite, compartilhar meta e progresso), comunidade (links externos, embaixadores, beta), widgets (calorias, macros, sequência), Health Connect/Fitbit/Google Fit.
- Lembretes por momento do dia (café, almoço, aulas da tarde, "não perca sua série").

## 3. Monetização (o que existe)
Paywall com linha do tempo do teste (Hoje 0 → lembrete → cobrança), "Como cancelar", FAQ, oferta de boas-vindas pós-cadastro, contagem regressiva de desconto, **roleta e baú de desconto**, desconto ao tentar cancelar o teste ("oferta única"), pesquisa de cancelamento, bloqueios premium dentro do app (nota do dia, benefícios do alimento, receitas, dietas, registro antecipado), anúncios no grátis.

## 4. Sistema visual
- Paleta em famílias de 4 tons (base, light, ultra-light, background) e texto azul-ardósia em 3 níveis. Fundo de tela no tom ultra-light do contexto.
- Serifa (Value Serif) para números grandes e títulos de impacto; sans (Buenos Aires) para o resto.
- Raio 8 (chips), 16 (cartões), 24 (cartões grandes/preço), 32 (sheet). Cartões sem sombra, com borda de 1 dp no tom light.
- Botão principal fixo embaixo sobre degradê branco; voltar redondo ao lado.
- Ilustração vetorial plana: mascote + pares de objetos do cotidiano; diagramas educativos em cartão branco com destaque laranja/verde-água; fotos reais só para nutricionista e depoimentos.

## 5. Movimento
- Lottie para recompensa (chama, presente + gelo, mascote comemorando, troféu, confete que explode e cai, check), carregamento de foto, trilha de níveis e tutoriais de registro (foto, código de barras, voz).
- Rive para o mascote (estados interativos e roupas).
- Easing `(.33,0,.67,1)` nas transições; números contam; telas de conquista entram em sequência (elementos com alfa 0 que aparecem um a um).
- Shimmer enquanto carrega preço e previsão.

## 6. Mapa para o Evura (nossas abas: Hoje · Descobertas · Registrar · Progresso · Comunidade)
| Foodvisor | Evura (adaptado ao foco de saúde) |
|---|---|
| Diário de calorias | **Hoje**: registro do dia do foco (sono, sintomas, energia, refeição, treino…), notas do dia |
| Registro por foto/barras/voz/texto | **Registrar**: voz e texto livre primeiro (IA → pacote do motor), foto depois; tutorial de primeira vez |
| Resumo da refeição + recompensa | Resumo do registro com recompensa animada (Evu) |
| Coach com aulas do dia | **Descobertas** ganha "aulas do dia" curtas por foco + cabeçalho por dia/hora |
| Relatório do dia | Relatório diário leve + relatório do dia 7 (o nosso motor) |
| Sequência + gelos + meta de dias | Sequência de registro com proteção de 1 dia e meta de 7/14/30 dias |
| Semente que cresce | **Evu evolui** com a constância (sem loja de gemas no MVP) |
| Missões diárias + trilha | Missões diárias do foco (ex.: "registre o sono") ligadas às hipóteses do motor |
| Progresso (peso, nutrição) | **Progresso**: curva com faixa de incerteza e fases, métrica do foco |
| Amigos / comunidade | **Comunidade** (já existe a aba) |
| Paywall com linha do tempo + como cancelar | Paywall do teste de 7 dias com "Vamos te ajudar a chegar a X até D" |
| Lembretes por momento do dia | Notificações por foco e horário |

## 7. O que não aplicar
- Roleta e baú de desconto, "oferta única que nunca mais volta", desconto ao cancelar: pressão de compra, risco com Meta e com o Código de Defesa do Consumidor.
- Estatísticas sem fonte ("73% em 14 dias", "5x mais tempo", "4x mais chances").
- Anúncios dentro do app (regra do projeto: sem SDK de anúncio).
- Contagem de calorias como centro do app (o Evura é saúde ampla, não dieta).
