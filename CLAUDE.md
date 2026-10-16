# Portfólio — Matheus Freitas

Portfólio pessoal de Matheus Freitas Martins, desenvolvedor Full Stack. Site de uma página (com páginas de case preparadas), em PT, EN e ES.

@AGENTS.md

## Fonte da verdade — leia antes de qualquer mudança visual ou de texto

| O quê | Onde |
| --- | --- |
| Tokens (cores, tipografia, espaçamentos, raios, sombras, breakpoints) | `app/styles/tokens.css`; `app/styles/tokens.json` espelha os valores para as imagens geradas (ícones, Open Graph) — mude nos dois |
| Easings e durações de animação | `app/styles/motion.css` |
| Todo o texto do site, em PT/EN/ES | `content/i18n.json` |
| Links, contatos, imagens, ordem de itens, skills, projetos | `content/site.json` |
| Como cada componente parece, se move e se reorganiza no mobile | o próprio componente em `components/` (TSX + CSS Module) |

## Stack

- Next.js (App Router, versão estável atual) + TypeScript (strict). Deploy na Vercel.
- Estilo: `tokens.css` global + CSS Modules por componente. Sem Tailwind, a menos que eu peça.
- Fontes: Geist e Geist Mono pelo pacote oficial `geist`. Os `.ttf` em `assets/fonts/` são só para a imagem Open Graph.
- Imagens: `next/image`, arquivos em `public/images/`, dimensões registradas em `lib/content/assets.ts`.
- Dependências: o mínimo. Animações em CSS/Web Animations API; uma lib de animação só se trouxer ganho claro — proponha antes de instalar.

## Regras

- Nunca escrever texto direto em componente: todo texto vem de `i18n.json` pelo idioma da rota. Texto novo entra nos três idiomas, traduzido pelo sentido, não literalmente.
- Nunca usar cor, tamanho, raio, sombra ou espaçamento solto: sempre `var(--token)`. Se faltar um token, pergunte antes de inventar.
- Componentes novos seguem o padrão dos existentes: TSX idiomático, mesmo cuidado com animação, teclado e ARIA.
- Terracota é assinatura e ação, nunca fundo de seção. Texto sobre terracota usa `--on-terracota`, nunca branco.
- Calibrado para notebook 14" com zoom 100% (≈1440×900 e 1512×982). Nada gigante; a Hero cabe na primeira dobra.
- Mobile é reorganizado, não comprimido (timeline vira coluna, header vira botão Menu etc.).
- `prefers-reduced-motion` respeitado em tudo; foco visível (`--focus-ring`); navegação completa por teclado.
- Não inventar conteúdo (serviços, skills, projetos, cursos). O que não existe fica fora ou como placeholder discreto.

## Pendências conhecidas

- CV: os botões "Download CV" apontam para `/cv.pdf`, que ainda não existe. Mantenha os botões.
- Case studies: a rota `/[locale]/projects/[slug]` fica pronta, mas os cards só linkam para ela quando `caseStudy: true` em `site.json`.
- Formulário de contato: só UI e estados por enquanto; o envio real será definido depois (deixe o ponto de integração isolado).

## Forma de trabalhar

- Trabalhe por etapas e pare ao fim de cada uma para eu revisar no navegador.
- Antes de uma decisão estrutural (pastas, i18n, dependência nova), proponha e espere meu ok.
- Ao terminar uma etapa: rode lint, typecheck e build, e diga o que testar.
