# Foodvisor: como o onboarding funciona (estudo de fluxo)

Fonte: APK 7.8.1, arquivo `res/raw/ten_min_assessment.json` + textos pt-BR. Só estrutura de fluxo como referência. Nada de texto, arte ou código deles entra no Evura.
Fluxo bruto em `foodvisor-fluxo-bruto.txt`.

## Esqueleto (6 blocos)
1. Objetivo (1 pergunta, 4 opções) → slide do método
2. Objetivo e perfil: motivações (múltipla) → nível de motivação → o que topa fazer → reforço ("você está no lugar certo") → perfil (idade/altura/peso/meta) → restrições → histórico médico → loader + curva de peso
3. Ambiente: reforço → dedicação (por objetivo e gênero) → filhos, estudo, trabalho, dinheiro → apoio/pressão social → tentativas passadas (+ reforço "fracasso passado não é falha futura")
4. Hábitos: reforço ("quase terminando") → beliscar (+gatilhos + reforço) → alimentação → refeição difícil → refrigerante → sedentarismo → exercício → disposição para treinar
5. Slide final com a curva de peso
6. Necessidades: interesses → recursos → o que importa no programa → "sucesso em 2 semanas" → depois cadastro, paywall (teste grátis 14 dias, oferta com desconto se recusar)

## O que eles fazem que o nosso quiz não faz
- **Roteamento por objetivo.** O esqueleto é igual, mas cada objetivo tem seu texto: motivações, "sucesso em 2 semanas" e "dedicação" mudam por objetivo (e por gênero/idade). São blocos condicionais (`user.tags contains main_goal/...`).
- **Curva e evento só quando fazem sentido.** O loader com curva só entra se peso atual > meta. Quem quer "comer mais saudável" ou ganhar massa não vê curva de perda de peso. Textos da curva têm variante "com evento" e "sem evento".
- **Reforços entre blocos.** Telas curtas sem pergunta que acalmam e dão ritmo (6 no fluxo).
- **Prova social como história.** Depoimento com resultado concreto, por perfil (homem, mulher, 40+).
- **Curva se atualiza.** A previsão é mostrada duas vezes: primeiro com o perfil, depois "atualizado com suas respostas".
- **Pergunta de "sucesso em 2 semanas"** é a ponte entre o objetivo e o resultado que o app promete no começo.

## O que adaptar ao Evura (8 focos)
- Trocar "peso atual > meta" por "o foco tem métrica de curva".
- Cada foco ganha: métrica da curva, texto do evento (ou sem evento), "sucesso em 2 semanas" e depoimento próprio.
- Foco sem evento natural (Sono, Longevidade) pula `event`/`edate` e usa a variante "sem evento".
