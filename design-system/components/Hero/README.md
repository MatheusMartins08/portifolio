# Hero

Primeira dobra composta: régua de meta mono, foto à esquerda; à direita saudação, nome em duas linhas com os links ao lado, fio terracota e frase animada; ScrollCue embaixo.

- Recebe `name`, `greeting`, `phrases`, `photo`, `links`, `scrollTarget`. `fullHeight` (padrão) ocupa até 880px de altura.
- Mantenha a Hero vazia: nada além disso. Abaixo de 820px tudo vira uma coluna centralizada: foto quadrada (`min(70cqi, 340px)`), saudação, nome (`min(96px, 15cqi)`), fio, frase (`clamp(20px, 5.6cqi, 32px)`), os links lado a lado entre dois fios curtos e, separado embaixo, o scroll. Em 390×844 cabe inteira até o scroll.
- No notebook a Hero sempre cabe até o botão de scroll: a foto (altura até 4:5, limitada a `86svh - 220px`; largura = a coluna ou 0.89 dessa altura, então fica um pouco mais alta que larga no notebook e chega a 4:5 em telas altas), o nome (`14svh` no máximo) e os espaçamentos verticais (`clamp` em `svh`) cedem em telas baixas. Conferido de 1280×600 a 1920×960. No celular a Hero pode rolar.
- Foto: `Portrait` com `hover` (troca para a segunda foto, `FIG. 01 → FIG. 02`) e `intro`.

## Nome

- `t-name` (Bricolage Grotesque 800, até 120px, fluido). O nome é quebrado no primeiro espaço: primeiro nome em cima, sobrenome embaixo. O leitor de tela ouve o nome inteiro uma vez (`sr-only`); a parte visual é `aria-hidden`.
- Primeiro nome: um gradiente só para a palavra inteira (`caramel` no M → `terracota-strong` → `terracota` no s), com grão sutil de tinta. No hover, um brilho atravessa a palavra uma vez.
- Sobrenome: `ink`, letra por letra. No hover (só com mouse), a letra vira `terracota-strong` e sobe 0.1em com mola leve; as vizinhas sobem um pouco, sem mudar de cor. Com movimento reduzido só a cor muda.

## Links e frase

- LinkedIn e GitHub são `IconLink size="lg"` (48px), empilhados entre dois fios curtos, na borda direita da coluna (abaixo de "Belo Horizonte") e centralizados verticalmente nas duas linhas do nome.
- A frase animada usa `t-tagline` (Instrument Serif Italic 32px, 26px no celular) em `ink-2`.

## Entrada

Régua (o fio desenha, os textos sobem) → foto abre como cortina (100ms) → saudação (250ms) → primeiro nome "pintado" (350ms) → sobrenome letra a letra (650ms) → marcas e legenda da foto → links e fios (900ms) → fio terracota → frase (1050ms) → scroll (1250ms). Termina em ≈1.6s; só `opacity`, `transform`, `clip-path` e a máscara da pincelada. Com `prefers-reduced-motion` tudo aparece pronto.
