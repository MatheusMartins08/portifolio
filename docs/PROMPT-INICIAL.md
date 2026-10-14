# Construir o portfólio de Matheus Freitas

Você vai construir meu portfólio pessoal a partir de um design system que já está pronto e aprovado. Não é para redesenhar nada: identidade visual, componentes, animações e todo o texto (em PT, EN e ES) já estão definidos em `design-system/`. O trabalho é transformar isso num site Next.js de produção, fiel ao design, rápido e acessível.

Leia primeiro, nesta ordem:

1. `CLAUDE.md` (regras do projeto)
2. `design-system/README.md` (brand book)
3. `design-system/tokens.json`
4. `design-system/content/site.json` e `design-system/content/i18n.json`
5. O `README.md` de cada componente em `design-system/components/`
6. `design-system/components/bundle.js` e `bundle.css` (implementação de referência)
7. `design-system/especificacao-original.md`, para entender a intenção

Abra `design-system/previews/index.html` no navegador sempre que precisar ver como um componente deve parecer, se mover e responder ao mouse e ao teclado. A implementação final tem que ficar igual a essas previews.

---

## Composição da página

Uma página por idioma (`/pt`, `/en`, `/es`), nesta ordem. Os ids das seções são fixos (o header usa para navegar). O índice da label vem de `site.json > sections`.

| Seção | id | Fundo | Conteúdo |
| --- | --- | --- | --- |
| Header | — | flutuante | `Header`: `LanguageSwitch` à esquerda, pill de navegação centralizada, "Download CV" à direita. Fixo; ganha sombra ao rolar. Abaixo de 720px vira botão Menu com folha suspensa. |
| Hero | `topo` | `--sand` | `Hero`: régua mono no topo, `Portrait` à esquerda, saudação + nome + LinkedIn/GitHub + `MorphText` à direita, `ScrollCue` embaixo, levando a `#sobre`. Cabe na primeira dobra de um 14". |
| Sobre | `sobre` | `--sand` | `SectionLabel 01` + `Statement`. Abaixo, grid 7/5: `ProfileTerminal` à esquerda (modo documento: comando, frontmatter e os 7 parágrafos com destaques); à direita, cards de tamanhos diferentes (`InfoCard`): Status (com `StatusDot`, largo), Resume (com botão CV), Location (com `Coordinates`) e Available for. Tablet: terminal em largura total e cards em 2 colunas; celular: 1 coluna. |
| Serviços | `servicos` | `--sand-2` | `SectionLabel 02` + `Statement`. Dois `ServiceCard` em `.mf-svc-grid` (7/5, o segundo deslocado para baixo). Só esses dois serviços. |
| Experiência | `experiencia` | `--sand` | `SectionLabel 03` + `FilterTabs` (Profissional / Acadêmica / Cursos & Certificações, com contagem) + `Timeline` dentro de um `tabpanel`; a troca de aba anima (`.mf-swap`). Itens e ordem em `site.json > experience`. "Faculdade" é item `future` (tracejado, "Em breve"). |
| Skills | `skills` | `--sand-2` | `SectionLabel 04` + grid das 4 `SkillFolder` (`.mf-folder-grid`). Itens em `site.json > skills`; categorias traduzidas por `i18n.skills.categories`. |
| Projetos | `projetos` | `--sand` | `SectionLabel 05` + `Statement`. `ProjectCard` em `.mf-pgrid`: Black Crown como `feature`, Métrica como `half` deslocado. Dois prints por projeto (o segundo aparece no hover). Depois: "More work" + `ArrowLink lg` "View my GitHub". |
| Contato | `contato` | `--sand` | `SectionLabel 06` + `Statement` + `Button primary lg` "Let's talk", que abre o `ContactModal`. |
| Footer | — | `--sand` | `Footer` mínimo. |

Espaço entre seções: `--space-24` (notebook) e `--space-32` (≥1440px). Largura máxima: `--container-max`, com gutter `--gutter` (`--space-4` no celular).

## i18n

- Rotas `/[locale]` com `pt` (padrão), `en` e `es`. `/` redireciona pelo `Accept-Language`, com `pt` como fallback.
- Dicionário tipado a partir de `i18n.json`: cada folha é `{pt, en, es}`; o componente recebe só o texto do idioma atual.
- `LanguageSwitch` troca para a mesma página no outro idioma, mantendo a âncora (`#sobre` etc.), e atualiza `<html lang>`.
- Os destaques em terracota mudam por idioma: `statementHighlight` (palavras) e `about.terminal.highlight` (trechos exatos).
- Pode usar `next-intl` ou uma solução própria pequena. Proponha antes.

## Notas de implementação dos componentes mais delicados

O comportamento exato está em `bundle.js` e `bundle.css`; mantenha os mesmos números (durações, curvas, distâncias).

- **MorphText:** as letras em comum entre a frase atual e a próxima viajam até a nova posição (casamento por caractere, pela posição mais próxima, em camada absoluta). As que sobram saem subindo com blur e as novas entram com blur. Leitor de tela recebe todas as frases de uma vez, sem anunciar trocas. Espera `document.fonts.ready`, pausa com a aba oculta, reinicia ao trocar de idioma. Com movimento reduzido, troca simples.
- **ProfileTerminal:** inclinação 3D seguindo o cursor (máx. 6°, interpolação por rAF com fator 0.085), camadas em `translateZ`, brilho e sombra reagindo. Volta suave ao sair. Desligado em toque e com movimento reduzido. Os parágrafos entram em sequência quando o card aparece.
- **Timeline:** o preenchimento em terracota = progresso do scroll, com gatilho a 62% da viewport. Cada nó acende quando o centro passa do gatilho, e o card entra em 4 tempos. "Ver atividades" expande com `grid-template-rows: 0fr → 1fr`. Abaixo de 720px vira coluna única.
- **SkillFolder:** fechada, mostra os mini-cards empilhados espiando. Aberta, a aba sobe, a frente tomba (`rotateX(-16deg)`) e os cards sobem com mola (`cubic-bezier(.3,1.28,.5,1)`, stagger de 45ms) e se organizam em 1–3 colunas pela largura. Fecha na ordem inversa. Use `aria-expanded` e `aria-hidden` corretos.
- **ProjectCard:** zoom lento na imagem, segundo print em crossfade no hover, tooltip "VIEW ↗" seguindo o cursor (só em dispositivos com hover), título deslizando com seta, régua inferior acendendo. Sem case study, imagem e título abrem o site ao vivo em nova aba.
- **Header:** fundo `--sand-2` deslizando sob o item em hover/foco; item ativo com ponto terracota (scroll spy por seção); Esc fecha a folha mobile.
- **ContactModal:** foco preso dentro do modal, Esc e clique fora fecham, scroll travado, foco volta ao botão. Estados: normal, hover, focus, loading, success e error. Validação com mensagens do `i18n`. No celular vira folha que sobe da base. O envio fica num ponto isolado (`onSubmit`) que por enquanto só simula; o backend entra depois.
- **Statement:** revela palavra a palavra ao entrar na tela; as palavras de `statementHighlight` ficam em `--terracota-strong`.

## Página de case study

Prepare a rota `/[locale]/projects/[slug]` com `CaseHero` e `CaseSection`: Overview, Problem, Solution, My Role, Features, Architecture, Tech Stack, Technical Decisions, Challenges, Solutions, Results, What I Learned, Gallery, Live Project, GitHub. Ainda não há conteúdo: gere a página só para projetos com `caseStudy: true` (hoje nenhum). Os cards não devem linkar para case que não existe.

## Etapas — pare ao fim de cada uma para eu revisar

0. **Proposta:** estrutura de pastas, como `tokens.css` entra, abordagem de i18n, tipagem do conteúdo e dependências. Espere meu ok.
1. **Base:** projeto Next.js + TypeScript, `tokens.css` global, fontes Geist, assets em `public/images/`, rotas de idioma, dicionário tipado, layout com as seções vazias e os ids.
2. **Primitivos + Header:** Icon, Button, ArrowLink, SectionLabel, Tag, StatusDot, Reveal, Statement, LanguageSwitch e Header (com scroll spy e menu mobile).
3. **Hero:** Portrait, MorphText, ScrollCue.
4. **Sobre:** ProfileTerminal, InfoCard e Coordinates, na composição descrita.
5. **Serviços.**
6. **Experiência:** FilterTabs e Timeline.
7. **Skills:** SkillFolder.
8. **Projetos:** ProjectCard, "View my GitHub" e o template de case.
9. **Contato:** botão, ContactModal, Field e Footer.
10. **Acabamento:**
    - **Responsivo:** revisão em 1512, 1440, 1280, 1024, 768 e 390px.
    - **Movimento reduzido.**
    - **Acessibilidade:** teclado e contraste; Lighthouse/axe sem erros.
    - **SEO:** `metadata` por idioma, `hreflang`/alternates, Open Graph, `sitemap` e `robots`.
    - **Desempenho:** imagens otimizadas, Lighthouse ≥ 90.
    - **Favicon:** proponha um.
    - **Deploy na Vercel.**

## Critérios de aceite de cada etapa

- Fica igual à preview correspondente: cores, tipografia, espaçamento, animação e hover.
- Funciona nos três idiomas, sem texto fixo no código.
- Funciona só com teclado, com foco visível.
- Com `prefers-reduced-motion`, nada se move, mas tudo continua utilizável.
- No 14" a 100% nada parece gigante; no celular nada transborda na horizontal.
- `lint`, `typecheck` e `build` passam.

Comece pela etapa 0.
