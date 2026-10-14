# Portfólio — Matheus Freitas

Site pessoal de Matheus Freitas Martins, desenvolvedor Full Stack. Uma página por idioma (`/pt`, `/en`, `/es`) e um template de case study em `/[locale]/projects/[slug]`.

Next.js 16 (App Router, Cache Components) · TypeScript · CSS Modules sobre os tokens do design system · fontes Geist. Sem Tailwind e sem lib de animação: CSS e Web Animations API.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000 (redireciona para o idioma do navegador)
npm run lint
npm run typecheck
npm run build && npm start
```

## Onde mexer

| O quê | Onde |
| --- | --- |
| Todo o texto, em PT/EN/ES | `design-system/content/i18n.json` (cada texto é `{ pt, en, es }`) |
| Links, contatos, ordem de itens, skills, projetos, imagens | `design-system/content/site.json` |
| Cores, espaços, raios, sombras | `design-system/tokens.json` → `app/styles/tokens.css` |
| Regras de identidade e de cada componente | `design-system/README.md` e `design-system/components/<Nome>/README.md` |
| Revisão do texto lado a lado | `design-system/Conteudo.md` |

Regras do projeto (para pessoas e agentes): `CLAUDE.md`.

### Pendências e pontos de integração

- **CV:** os botões "Download CV" apontam para `/cv.pdf`. Basta colocar o arquivo em `public/cv.pdf`.
- **Formulário de contato:** o envio está isolado em `lib/contact/submitContact.ts` e hoje só simula. Resolver a promise = sucesso; rejeitar = mensagem de erro no modal.
- **Case study:** escreva o conteúdo em `projects.items.<projeto>.case` no `i18n.json` (role, timeline, status e um texto por bloco: overview, problem, solution…) e marque `"caseStudy": true` no projeto em `site.json`. O card passa a linkar para o case e a página entra no sitemap. Em desenvolvimento o template já abre para revisão (ex.: `/pt/projects/black-crown-barber`); em produção, sem `caseStudy: true`, a rota responde 404.
- **Novas imagens:** copie para `public/images/` e registre as dimensões em `lib/content/assets.ts`.

## Deploy (Vercel)

1. Suba o repositório para o GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório. A Vercel detecta Next.js; não é preciso mudar nada no build.
3. Deploy. Cada push na branch principal publica em produção; outras branches geram previews.
4. Domínio próprio (opcional): adicione em *Settings → Domains* e defina a variável `NEXT_PUBLIC_SITE_URL` (ex.: `https://seu-dominio.com`) em *Settings → Environment Variables*, depois faça um novo deploy. Sem ela, canonical, hreflang, sitemap e Open Graph usam a URL de produção que a Vercel fornece.
