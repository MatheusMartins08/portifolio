# Portfólio — Matheus Freitas

Portfólio pessoal de Matheus Freitas Martins, desenvolvedor Full Stack. Site de uma página (com páginas de case preparadas), em PT, EN e ES.

## Fonte da verdade — leia antes de qualquer mudança visual ou de texto

| O quê | Onde |
| --- | --- |
| Regras de identidade (cor, tipo, espaço, movimento, acessibilidade) | `design-system/README.md` |
| Tokens (cores, tipografia, espaçamentos, raios, sombras, breakpoints) | `design-system/tokens.json` e `design-system/tokens.css` (gerado dele) |
| Todo o texto do site, em PT/EN/ES | `design-system/content/i18n.json` |
| Links, contatos, imagens, ordem de itens, skills, projetos | `design-system/content/site.json` |
| Regras de uso de cada componente | `design-system/components/<Nome>/README.md` |
| Comportamento de referência de cada componente | `design-system/components/bundle.js` + `bundle.css` |
| Como cada componente deve parecer e se mover | abrir `design-system/previews/index.html` no navegador |
| Especificação original (contexto e intenção) | `design-system/especificacao-original.md` — se divergir do design system, o design system vence |

## Stack

- Next.js (App Router, versão estável atual) + TypeScript (strict). Deploy na Vercel.
- Estilo: `tokens.css` global + CSS Modules por componente. `bundle.css` é portado quase 1:1 para os módulos. Sem Tailwind, a menos que eu peça.
- Fontes: Geist e Geist Mono pelo pacote oficial `geist` (os `.woff2` em `design-system/fonts/` são só subset latino — não cobrem `→`).
- Imagens: `next/image`, arquivos copiados de `design-system/assets/` para `public/images/`.
- Dependências: o mínimo. Animações em CSS/Web Animations API como no protótipo; uma lib de animação só se trouxer ganho claro — proponha antes de instalar.

## Regras

- Nunca escrever texto direto em componente: todo texto vem de `i18n.json` pelo idioma da rota. Texto novo entra nos três idiomas, traduzido pelo sentido, não literalmente.
- Nunca usar cor, tamanho, raio, sombra ou espaçamento solto: sempre `var(--token)`. Se faltar um token, pergunte antes de inventar.
- `bundle.js` é protótipo de referência (React global, `createElement`). Reescreva cada componente em TSX idiomático, mantendo visual, animação, teclado e ARIA. Não importe esse arquivo.
- Terracota é assinatura e ação, nunca fundo de seção. Texto sobre terracota usa `--on-terracota`, nunca branco.
- Calibrado para notebook 14" com zoom 100% (≈1440×900 e 1512×982). Nada gigante; a Hero cabe na primeira dobra.
- Mobile é reorganizado, não comprimido (ver README de cada componente: timeline vira coluna, header vira botão Menu etc.).
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
