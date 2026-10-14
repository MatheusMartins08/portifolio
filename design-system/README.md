Identidade do portfólio de Matheus Freitas: **tecnologia + engenharia + produto + criatividade + sofisticação**. Editorial e técnica ao mesmo tempo — bege quente domina quase toda a experiência, terracota assina os detalhes. Nada de neon, Matrix, blobs, glassmorphism exagerado, terminal verde ou cards todos iguais.

## Conteúdo e voz

- Português do Brasil por padrão; o mesmo texto existe em EN e ES (seletor no header). Todo o texto do site vive em `content/i18n.json` (cada texto é `{pt, en, es}`) — leia dali, não copie das previews; a seção Conteúdo mostra os três idiomas lado a lado para revisão. Termos de mercado ficam em inglês quando é assim que se fala: *Fullstack Developer*, *Case study*, *Download CV*, *Let's talk*.
- Frases curtas e afirmativas, primeira pessoa: "Analiso a base", "Produtos Digitais". Sem superlativos, sem exclamação, sem emoji.
- Labels técnicas em mono e CAIXA ALTA (`t-label`): `01 / SOBRE`, `STATUS`, `LOCATION`, `NEXT CHAPTER`. Títulos em sentence case.
- Filosofia que guia a copy: **tecnologia é meio, não objetivo.** Produtos úteis, bem estruturados, simples de manter, confiáveis, prontos para evoluir.
- Não inventar: só dois serviços (Web, Automação & IA); só as skills listadas; a faculdade aparece como "Em breve", nunca como algo em curso. O que ainda não existe é placeholder discreto (`Statement placeholder`, `MediaPlaceholder`), fácil de trocar.

## Cor

- Fundo da página é `sand`. Seções alternadas usam `sand-2`; superfícies elevadas (cards, terminal, header, modal) `paper`; superfície de contraste (costas das pastas, moldura da foto) `sand-3`. Profundidade vem primeiro dessas diferenças de bege, depois de sombra.
- Texto: `ink` para títulos e conteúdo, `ink-2` para texto corrido longo e navegação em repouso, `ink-muted` para metadados e labels, `ink-faint` só para numerais decorativos grandes.
- Terracota é **ação e assinatura**, nunca fundo de seção. Três papéis:
  - `terracota` — preenchimento: CTA principal (com texto `on-terracota`, nunca branco), linha preenchida da timeline, halo do status.
  - `terracota-strong` — marcas com significado: ponto ativo do menu, ponto de status, nós da timeline, cursor, anel de foco, palavras destacadas em texto de 24px+.
  - `terracota-ink` — laranja como texto pequeno: índices `01`, extensões `.sh`, link em hover.
- Regra de proporção: numa tela, terracota não passa de um CTA + pequenos detalhes. Se dois elementos grandes estiverem laranja, um deles está errado.
- `danger` e `success` só no formulário e sempre com ícone + frase.

## Tipografia

- Duas famílias: **Geist** (`--font-sans`) para tudo e **Geist Mono** (`--font-mono`) como tempero — labels, datas, tags, extensões, terminal, numerais. Nunca parágrafos em mono.
- Escala calibrada para notebook 14" a 100%: `t-name` 64px só no nome da Hero; `t-statement` 44px nas frases de impacto; `t-title` 28px em serviço/projeto; `t-lead` 24px na frase animada; `t-body` 16px; `t-body-sm` 14px; `t-ui` 14px em navegação e botões.
- Abaixo de 720px: nome 44px, statement 32px. Nunca mais de uma tipografia display por tela.
- Títulos com tracking negativo (-0.02 a -0.04em); mono em caixa alta com +0.12em.

## Espaço, layout e superfícies

- Base 4px (`space-*`). Entre seções `space-24` (notebook) ou `space-32` (≥1440px). Conteúdo até `container-max`; texto corrido até `container-narrow`; gutter `gutter` no desktop e `space-4` no celular.
- Composição assimétrica controlada: grids 7/5 em vez de 6/6, um card deslocado verticalmente (`.mf-svc-grid`, `.mf-pgrid` + `.mf-proj--offset`), grande + pequeno lado a lado.
- Bordas são `hairline` (rgba de ink) — nunca `1px solid #ccc` em tudo. Card = diferença de superfície + `hairline` + no máximo `shadow-rest`. `shadow-float` para o que flutua (header, dropdown, mini-cards), `shadow-depth` só para terminal e modal.
- Raio por função: `radius-xs` (tags, glifos, foto), `radius-sm` (inputs, botões, mini-cards), `radius-md` (cards), `radius-lg` (terminal, modal, imagens de projeto), `radius-pill` só na pill do header, idioma e tooltip VIEW.

## Movimento

- Movimento melhora a leitura, não disputa atenção. Curvas: `--mf-ease-out` (entradas), `--mf-ease-inout` (morphing, trilhos), `--mf-ease-spring` (pastas, pontos — mola leve, sem bounce exagerado). Durações `--mf-dur-1…4` (160–820ms).
- Ritmo de entrada por seção: label → título → conteúdo → secundários (`Reveal` com `delay` crescente). Cada seção usa uma entrada diferente: Statement revela palavra a palavra, timeline por etapas, pastas por mola, projetos por `Reveal clip`.
- `prefers-reduced-motion`: tudo continua utilizável — morph vira troca simples, tilt desliga, reveals aparecem prontos.
- Cursor tradicional em quase todo o site; só sobre a imagem de projeto aparece o tooltip `VIEW ↗` ao lado dele.

## Estados e acessibilidade

- Foco de teclado: `focus-ring` (2px da cor de fundo + 2px `terracota-strong`), sempre visível, em todo controle.
- Inputs: linha `line-strong` (≥3:1); foco desenha uma barra `terracota-strong` de 2px; erro troca para `danger` com ícone e mensagem.
- Todo controle tem rótulo; dropdown e abas seguem ARIA (listbox, tablist) com setas, Home/End e Esc. Área clicável mínima 36px.
- Contraste: cada token de texto diz em quais fundos passa 4.5:1. `terracota` nunca é texto; `ink-faint` só a partir de 24px.

## Fotografia

- A foto da Hero é `assets/Photos/matheus-portrait.webp` (4:5, já recortada). Entra pelo `Portrait`, que aplica o chanfro, as marcas de corte terracota e um leve tom quente — não aplique outros filtros.
- A legenda diz onde a foto foi feita (`Fig. 01 · Paris — Louvre`), não onde você mora.
- Screenshots de projetos: proporção 16:10, sem moldura de navegador nem filtros; o card cuida do raio e do zoom.

## Iconografia

- Um único conjunto: traço 1.5px, grade 24px, pontas arredondadas, `currentColor` (`MF.Icon`). Setas são as protagonistas (`↗` externo, `→` interno, `↓` download/scroll) e atravessam o botão no hover.
- Tecnologias não usam logos coloridos: cada mini-card tem um glifo mono de duas letras (`Py`, `TS`, `<>`) e a extensão (`.py`, `.sh`) em `terracota-ink`. Logos de marcas não fazem parte do sistema.
- Ícones novos: desenhar no mesmo grid e traço; não misturar famílias.

## Componentes por seção

Header (pill flutuante + `LanguageSwitch` + CV) · Hero (`Portrait`, nome, `ArrowLink` LinkedIn/GitHub, `MorphText`, `ScrollCue`) · Sobre (`Statement`, `ProfileTerminal` com tilt 3D, `InfoCard` + `StatusDot` + `Coordinates`) · Serviços (`ServiceCard` ×2) · Experiência (`FilterTabs` + `Timeline`) · Skills (`SkillFolder` ×4) · Projetos (`ProjectCard` em `.mf-pgrid`, `ArrowLink lg` "View my GitHub") · Case (`CaseHero`, `CaseSection`) · Contato (`Statement` + `Button primary` → `ContactModal` com `Field`) · `Footer`.

Os componentes vivem em `components/bundle.js` como `window.MF` (React 18) com estilos em `components/bundle.css`; leem os tokens via custom properties (`var(--sand)`, `var(--space-6)`).
