# Foodvisor 7.8.1: UX/UI extraído do APK e como aplicamos no Evura

Fonte: recursos do APK (cores, medidas, estilos, layouts, animações Lottie, drawables, textos pt-BR). Só tokens e padrões de uso como referência. Nenhum texto, ilustração, Lottie, fonte ou código deles entra no Evura. As fontes deles são comerciais (Buenos Aires, Luzi Type; Value Serif Pro, Colophon).

## O que o APK mostra

**Cor.** Famílias nomeadas com 4 tons cada (base, background, light, ultra_light): seaweed, sky, campfire, sunshine, broccoli, tomato, sand, salmon, lime, night, aubergine, chocolate. Texto em 3 níveis de azul-ardósia (escuro #233345, médio #405167, claro #95A6BD). Cada tela ganha o tom ultra_light de uma família como fundo (curva de perda de peso: campfire; curva de data: sky; método: seaweed; explicação do teste: broccoli).

**Tipografia.** Serifa para título e sans humanista para texto. Escala: 36/54 (pergunta com cabeçalho), 30/44, 24/34 (título), 20/32, 18/30 e 18/26, 16/26 (corpo e resposta), 14/22, 12/20.

**Medidas.** Margem horizontal 20; texto centrado com margem 32; ritmo vertical 8 / 16 / 24 / 32; resposta com padding 24; raios 8 (chips, placeholders), 15 a 16 (cartões), 24 (preço, sheet), 32 (sheet grande), pílula total. Preço selecionado: borda de 3 e raio 24. Barra inferior com degradê de transparente a branco (centro em 90%).

**Movimento.** Easing dominante `cubic-bezier(.33,0,.67,1)` (ease in-out suave), secundário `(.17,0,.67,1)`. Curva "plano igual para todos": 2,2 s. Curva de previsão: 10 s com marcos. Placeholders em shimmer (500 ms) enquanto a previsão calcula.

**Estrutura de tela.**
- Progresso segmentado por bloco, com um chip dizendo o bloco atual.
- Perguntas só com texto, sem ícone; botão fixo embaixo com seta de voltar redonda ao lado.
- Carregamento em duas etapas ("Gravando seus dados", depois "Calculando sua linha do tempo").
- Fim do quiz: "Obrigado por compartilhar a sua história", barra de progresso, depois "Encontramos o seu programa personalizado" com a curva.
- Data em contagem animada; paywall com linha do tempo do teste (Hoje, dia X, dia Y) e "como cancelar" explícito.

**A curva (Lottie).** Duas peças. (1) Linha cinza oscilante desenhada primeiro, linha verde estável por cima, com área em degradê. (2) Linha de previsão com marcos nas fases, faixa pontilhada de incerteza em volta e guias verticais separando 3 fases (Preparar, Avançar, Estabilizar).

## O que aplicamos (do nosso jeito)

| Padrão deles | No Evura |
|---|---|
| Linha cinza primeiro, linha do foco por cima | Já existia (`prog`); agora com área em degradê |
| Faixa de incerteza + fases + marcos | Gráfico de data e gráfico dos 7 dias. Fases: Preparar / Avançar / Estabilizar (peso) e Registrar / Cruzar / Relatório (7 dias). A faixa deixa claro que é estimativa |
| Tom ultra_light por tela | Telas `prog` e `proj` ganham o tom ultraclaro do foco (família `--acc`, `--acc-l`, `--acc-bg`, `--acc-ul`) |
| Easing suave nas curvas | `.draw` usa `cubic-bezier(.33,0,.67,1)` |
| Curva e evento só quando fazem sentido | Já feito (evento por foco, curva de peso só em Emagrecimento, Canetas e Massa) |

## O que NÃO copiamos, de propósito
- Título calmo 24/34: o nosso é mais forte (29/1.1) e é parte da identidade.
- Respostas sem ícone: as nossas têm ícone e dão leitura rápida.
- Depoimento com resultado em kg no carregamento: sem prova social real, quebra a regra de conformidade.
- Mascote, cenários e paleta: ficam os nossos (Evu, famílias por foco).

## Fica para o app (ainda não feito)
- Paywall: preço selecionado com borda grossa e raio 24, linha do tempo do teste, "como cancelar" visível.
- Placeholders em shimmer enquanto o motor calcula o relatório.
- Gráfico de progresso com faixa de incerteza e fases.
