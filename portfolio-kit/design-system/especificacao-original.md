> Especificação original do portfólio, escrita antes do design system. Quando algo aqui divergir do design system (README.md, tokens.json, content/), o design system vence — ele traz as decisões finais.

Entendi a direção: você quer que o portfólio tenha uma estética **sofisticada, editorial e tecnológica**, com o **bege dominando quase toda a experiência** e o **laranja aparecendo como assinatura visual nos detalhes, interações e pontos de atenção**. Não é para parecer um site “tech neon”, nem um template genérico de portfólio.

Abaixo está um prompt já bem detalhado para você usar e depois avaliar visualmente o resultado.

---

# Prompt — Design visual do portfólio de Matheus Freitas

Quero que você desenvolva a **direção visual completa e a interface do meu portfólio pessoal**, seguindo rigorosamente a estrutura e os requisitos abaixo.

Antes de alterar qualquer coisa, analise toda a especificação. O objetivo neste momento é criar uma experiência visual extremamente bem resolvida, sofisticada, moderna e memorável.

Não quero um portfólio genérico de desenvolvedor.

Evite completamente estéticas clichês como:

- fundo preto com neon;
- Matrix;
- excesso de gradientes;
- glassmorphism exagerado;
- cards genéricos repetidos;
- elementos flutuando sem propósito;
- blobs coloridos;
- astronautas;
- ícones tecnológicos espalhados aleatoriamente;
- terminal hacker verde;
- interfaces com “cara de template de IA”;
- excesso de bordas arredondadas em absolutamente tudo;
- animações apenas por decoração.

O resultado deve transmitir:

**tecnologia + engenharia + produto + criatividade + sofisticação.**

O portfólio deve parecer feito especificamente para **Matheus Freitas**, e não adaptado de um template pronto.

---

# 1. Direção visual geral

Quero uma estética:

- sofisticada;
- minimalista;
- editorial;
- tecnológica;
- moderna;
- levemente experimental;
- elegante;
- humana;
- profissional.

A interface deve possuir personalidade, mas continuar sendo muito fácil de navegar.

Use bastante:

- espaço negativo;
- hierarquia tipográfica;
- composições assimétricas controladas;
- elementos grandes combinados com pequenos detalhes;
- microinterações;
- linhas finas;
- números;
- pequenas labels técnicas;
- elementos editoriais;
- animações suaves;
- efeitos de profundidade.

O site pode trazer pequenas referências visuais a:

- código;
- sistemas operacionais;
- arquivos;
- terminais;
- interfaces;
- produto digital;

mas de maneira abstrata e elegante.

Não transforme o site em uma IDE.

---

# 2. Paleta de cores

A identidade inteira deve ser construída principalmente em torno de:

## Bege

O **bege deve ser a cor principal do portfólio**.

Quero um bege sofisticado, quente e premium.

Não deve parecer:

- amarelo;
- creme infantil;
- branco sujo;
- areia genérica.

Use pequenas variações do bege para criar profundidade entre:

- fundo;
- cards;
- áreas elevadas;
- elementos interativos;
- seções.

Uma referência inicial de paleta pode ser:

```text
Background principal
#F3EBDD

Background secundário
#EAE0D2

Superfície / cards
#F8F3EB

Superfície contrastante
#DED1C1
```

Esses valores são apenas uma base. Ajuste se encontrar uma combinação visualmente mais sofisticada.

---

# 3. Cor de destaque — Laranja

O laranja será a **assinatura visual do site**.

Use como inspiração aquele laranja quente, sofisticado e levemente terroso associado visualmente ao Claude/Claude Code.

Não precisa copiar exatamente a cor.

Procure algo próximo de:

```text
#D97757
```

ou:

```text
#D96B43
```

O importante é que seja um laranja:

- quente;
- elegante;
- sofisticado;
- levemente terroso;
- não muito saturado;
- não fluorescente;
- não infantil.

O laranja NÃO deve dominar o site.

Ele deve aparecer estrategicamente em:

- CTAs;
- pequenos textos;
- números;
- estado ativo;
- ícones;
- detalhes;
- sublinhados;
- indicadores;
- cursores;
- animações;
- linhas;
- pontos;
- hover;
- status;
- pequenas áreas de destaque.

Pense no laranja como uma cor de **ação e assinatura**, não como background predominante.

---

# 4. Tipografia

A tipografia é extremamente importante.

Quero uma combinação que transmita:

**engenharia + produto + personalidade editorial.**

O texto principal deve utilizar uma fonte sans-serif extremamente limpa e contemporânea.

Busque uma aparência próxima de famílias como:

- Geist;
- Inter;
- Manrope;
- Neue Montreal;
- Satoshi;
- General Sans;
- similares.

Não é obrigatório utilizar essas fontes específicas.

Para determinados pequenos elementos técnicos, labels ou terminal, pode existir uma fonte monoespaçada complementar.

Exemplo:

```text
MATHEUS FREITAS

Fullstack Developer

01 / ABOUT
STATUS
LOCATION
2024 — PRESENT
```

A fonte monoespaçada deve aparecer apenas onde fizer sentido.

Não transforme todo o portfólio em texto de código.

---

# 5. Header global

Crie um Header elegante e fixo.

Ele deve acompanhar o usuário enquanto a página é navegada.

Não quero uma navbar ocupando toda a largura da página como uma faixa convencional.

A navegação principal deve aparecer dentro de uma espécie de **pill flutuante**, pequena, sofisticada e arredondada.

Estrutura aproximada:

```text
[ PT ▾ ]       [ Sobre  Serviços  Experiência  Skills  Projetos ]       [ Download CV ↓ ]
```

O menu fica centralizado.

O seletor de idioma fica mais à esquerda.

O botão do currículo fica mais à direita.

Visualmente, não precisam estar presos no mesmo container.

### Navegação

Itens:

- Sobre
- Serviços
- Experiência
- Skills
- Projetos

O item correspondente à seção atual pode possuir um estado ativo extremamente discreto.

Por exemplo:

- pequeno ponto laranja;
- underline;
- mudança tipográfica;
- fundo muito suave.

### Hover

Os itens devem responder suavemente ao mouse.

Nada exagerado.

---

# 6. Seletor de idiomas

Idiomas disponíveis:

```text
PT
EN
ES
```

O botão deve ser pequeno.

Ao clicar, deve abrir um dropdown visualmente integrado à identidade.

Evite componentes genéricos de select HTML.

---

# 7. Hero Section

A Hero deve ser uma das áreas mais minimalistas do site.

Não sobrecarregue.

Quero bastante espaço vazio.

A composição principal deve envolver:

### Foto

Uma fotografia minha posicionada predominantemente no lado esquerdo.

O tratamento da foto deve conversar com a estética do site.

Evite moldura circular tradicional de portfólio.

Pode ser:

- corte editorial;
- composição assimétrica;
- máscara diferenciada;
- fotografia com algum detalhe gráfico muito discreto.

---

### Apresentação

Ao lado da imagem:

```text
Olá, eu sou

Matheus Freitas
```

Meu nome deve possuir forte presença visual.

Não precisa preencher a tela inteira.

Quero elegância, não gigantismo tipográfico.

---

# 8. LinkedIn e GitHub

Próximos ao meu nome devem existir dois pequenos elementos:

```text
LinkedIn ↗
GitHub ↗
```

Podem parecer links ou pequenos botões.

No hover:

- seta se movimenta;
- underline reage;
- texto se desloca alguns pixels;
- cor laranja pode aparecer.

Não transforme esses elementos em grandes botões tradicionais.

---

# 9. Texto animado da Hero

Abaixo do meu nome haverá uma frase principal dinâmica.

A primeira obrigatoriamente será:

# Fullstack Developer

Depois de alguns segundos, as próprias letras devem realizar uma transição/morphing e formar outras mensagens.

Inicialmente:

```text
Fullstack Developer

Trabalho inteligente

Automações e IA
```

Deixe o componente preparado para receber outras frases posteriormente.

Não quero apenas:

fade out → fade in.

Quero que a tipografia pareça **se reorganizar e se transformar**.

A animação precisa continuar legível e refinada.

---

# 10. Indicador para próxima seção

Na parte inferior central da Hero deve existir um pequeno indicador flutuante.

Pode ser:

```text
↓
```

ou uma composição mais original utilizando linha, círculo e seta.

Ele deve possuir uma animação de movimento muito sutil.

Ao clicar:

**smooth scroll para Sobre Mim.**

Esse componente deve ajudar o visitante a perceber que existe conteúdo abaixo sem poluir a Hero.

---

# 11. Sobre Mim

Esta seção deve marcar uma mudança de ritmo visual.

Comece com uma frase de impacto grande.

Ela deverá ser definida posteriormente, portanto crie espaço apropriado para ela.

Depois apresente o conteúdo principal.

---

# 12. Terminal / Profile Card

Quero um elemento inspirado visualmente em:

- terminal;
- editor;
- interface técnica;

mas de maneira extremamente sofisticada.

NÃO faça um terminal preto com letras verdes.

Ele deve utilizar a própria identidade bege do site.

Exemplo conceitual:

```text
matheus.profile
────────────────────────────

> name
Matheus Freitas Martins

> role
Fullstack Developer

> started
2024

> focus
Digital Products / SaaS / AI

> philosophy
Technology is the means.
Products are the outcome.
```

Isso é apenas uma representação visual.

O conteúdo real será baseado na minha história.

---

# 13. Conteúdo Sobre Mim

O terminal deve apresentar de maneira resumida e visual minha trajetória:

Sou **Matheus Freitas Martins**, desenvolvedor Full Stack focado na criação de produtos digitais completos.

Minha trajetória na tecnologia começou em **2024**.

Atualmente curso **Desenvolvimento Web & Mobile no COTEMIG**.

Meu trabalho envolve todo o ciclo:

```text
Problema
→ Arquitetura
→ Tecnologias
→ Frontend
→ Backend
→ Banco de dados
→ APIs
→ Integrações
→ Infraestrutura
→ Deploy
→ Produção
```

Tenho interesse principalmente em:

- SaaS;
- fintechs;
- sistemas web;
- automações;
- ferramentas internas;
- aplicações personalizadas.

Também trabalho com projetos criados inicialmente através de IA ou Vibe Coding.

Nesses casos:

```text
Analiso a base
→ identifico fragilidades
→ reorganizo a arquitetura
→ estruturo o código
→ elimino soluções frágeis
→ preparo o sistema para crescer
```

Minha filosofia é:

**tecnologia é meio, não objetivo.**

A prioridade é criar produtos:

- úteis;
- bem estruturados;
- simples de manter;
- confiáveis;
- preparados para evoluir.

Não precisa colocar todo esse texto literalmente.

Transforme-o em uma experiência curta, escaneável e visual.

---

# 14. Parallax 3D

O terminal deve possuir uma interação de profundidade.

Quando o cursor se mover:

```text
← terminal inclina suavemente

→ terminal inclina suavemente

↑ ↓ acompanha o movimento
```

Adicione:

- perspectiva;
- sombra extremamente sutil;
- deslocamento interno de algumas camadas.

A sensação deve ser de que o card possui profundidade real.

Não faça movimentos bruscos.

Quando o mouse sair, o elemento volta suavemente para a posição original.

---

# 15. Cards auxiliares do About

Ao lado ou ao redor do terminal deverão existir pequenos cards.

Eles devem possuir tamanhos diferentes para criar uma composição editorial.

## Status

```text
STATUS

● Aberto a novos projetos
```

O ponto deve usar o laranja da identidade.

Pode possuir um pequeno pulse.

A aparência deve transmitir que é um **status dinâmico**, que poderia mudar futuramente.

---

## Currículo

```text
RESUME

Minha trajetória profissional
e acadêmica.

Download CV ↓
```

---

## Localização

```text
LOCATION

Belo Horizonte
Minas Gerais, Brasil
```

E:

```text
AVAILABLE FOR

Local + Remote worldwide
```

Pode existir alguma pequena representação abstrata de mapa/coordenadas, mas nada clichê.

---

# 16. Serviços

Crie uma seção:

# O que eu faço

ou equivalente visual.

Comece com uma frase curta de apresentação.

Por enquanto existem **somente dois serviços principais**.

Não invente mais serviços.

---

# 17. Desenvolvimento Web

Label:

```text
WEB
```

Título:

# Desenvolvimento Web

Descrição:

> Criação de landing pages, sites institucionais e interfaces modernas, rápidas e responsivas, desenvolvidas para proporcionar uma experiência fluida, valorizar a presença digital e atender aos objetivos de cada projeto.

Destaques:

```text
Páginas de Conversão
Websites Corporativos
Modernização de Interfaces
```

---

# 18. Automação & IA

Label:

```text
IA
```

Título:

# Automação & IA

Descrição:

> Aplicação de inteligência artificial e sistemas automatizados para eliminar etapas repetitivas, conectar ferramentas e transformar rotinas operacionais em processos mais ágeis e inteligentes.

Destaques:

```text
Fluxos Automatizados
Assistentes Virtuais e Agentes de IA
Conexão entre Sistemas e Serviços
```

---

# 19. Design dos serviços

Não quero simplesmente dois cards tradicionais iguais lado a lado.

Encontre uma composição mais interessante.

Eles podem possuir:

- dimensões diferentes;
- tipografia grande;
- números;
- elementos gráficos;
- pequenas animações internas;
- reação ao cursor.

Por exemplo:

```text
01
WEB

Desenvolvimento Web
```

e:

```text
02
IA

Automação & IA
```

Ao passar o cursor, o laranja pode começar a aparecer em determinados detalhes.

A animação deve ter relação com o serviço.

---

# 20. Experiência

A seção terá três filtros:

```text
Profissional
Acadêmica
Cursos & Certificações
```

Visualmente eles devem parecer parte do design, não botões HTML tradicionais.

Ao selecionar uma categoria, o conteúdo troca suavemente.

---

# 21. Timeline

A experiência profissional e acadêmica serão representadas por uma timeline vertical.

Estrutura:

```text
       CARD
         \
          ●
          │
          ●
         /
      CARD
          │
          ●
           \
            CARD
```

Os cards alternam entre esquerda e direita.

A linha central deve ser fina e elegante.

Conforme o usuário rola a página:

**a linha vai sendo preenchida progressivamente em laranja.**

Quando um item entra na viewport:

- o ponto ativa;
- a linha avança;
- o card aparece;
- informações entram em pequenas etapas.

Não faça tudo aparecer ao mesmo tempo.

---

# 22. Experiência Profissional — ASPPrev

### Infraestrutura de Tecnologia da Informação

**ASPPrev · Estágio**

```text
Out. 2025 — Atualmente
Belo Horizonte, MG · Remoto
```

Descrição:

Atuação em atividades de infraestrutura e suporte de TI, contribuindo para organização de processos, manutenção de ambientes, documentação técnica e apoio às equipes internas.

O card deve permitir apresentar resumidamente atividades relacionadas a:

- infraestrutura;
- ambientes;
- SQL;
- homologação;
- testes;
- produção;
- documentação;
- versionamento;
- suporte técnico;
- automações;
- organização operacional.

Não coloque uma lista enorme inicialmente.

Mostre as informações principais e permita que detalhes sejam apresentados de forma elegante.

---

# 23. Experiência Profissional — Freelancer

### Desenvolvimento Full Stack Freelancer

**Projetos Independentes · Freelancer**

```text
2026 — Atualmente
Belo Horizonte, MG
```

Atuação desde:

```text
Concepção
→ Arquitetura
→ Desenvolvimento
→ Integrações
→ Deploy
→ Manutenção
```

Áreas:

- landing pages;
- sites;
- aplicações;
- agendamentos;
- dashboards;
- bancos;
- autenticação;
- APIs;
- automações;
- IA.

Tecnologias:

```text
Next.js
TypeScript
JavaScript
Supabase
SQL
Git
GitHub
Vercel
APIs
IA
```

Apresente as tecnologias como pequenas tags sofisticadas, sem criar dezenas de badges coloridos.

---

# 24. Experiência Acadêmica

### Desenvolvimento Web & Mobile

**COTEMIG — Belo Horizonte, Minas Gerais**

Apresente:

- aplicações mobile;
- sistemas web;
- backend;
- APIs;
- automações;
- arquitetura;
- lógica;
- manutenção de software.

Tecnologias:

```text
Flutter
Swift
Kotlin
Python
REST APIs
Backend
```

---

# 25. Faculdade futura

Deixe a arquitetura visual preparada para um segundo item acadêmico.

Por enquanto represente discretamente:

```text
NEXT CHAPTER

Faculdade
Em breve.
```

Não faça parecer que já estou cursando algo que ainda não comecei.

Pode ser visualmente um card mais apagado/futuro na timeline.

---

# 26. Skills — conceito de pastas

Essa será uma das principais interações do portfólio.

Quero que as skills sejam apresentadas através de **pastas digitais**.

As pastas aparecem fechadas.

Quando o visitante clicar:

1. a aba da pasta reage;
2. a pasta abre;
3. os conteúdos começam a subir;
4. pequenos cards aparecem de dentro dela;
5. cada tecnologia possui seu próprio mini-card;
6. ao fechar, eles retornam para dentro da pasta.

A animação deve parecer física.

Utilize:

- perspectiva;
- sobreposição;
- profundidade;
- spring animations;
- pequenas rotações.

Mas preserve boa usabilidade.

---

# 27. Pasta — Sistemas & Ambientes

```text
SISTEMAS & AMBIENTES
```

Dentro:

```text
Linux
.sh

Windows
.exe

macOS
.app

VPS
.ssh
```

O pequeno texto `.sh`, `.exe`, `.app` e `.ssh` deve funcionar como um detalhe técnico visual.

---

# 28. Pasta — Programação / Backend

```text
PROGRAMAÇÃO
```

Inicialmente:

```text
Python

TypeScript

MySQL
```

Deixe o componente flexível para adicionar tecnologias posteriormente.

---

# 29. Pasta — Web & Mobile

```text
WEB & MOBILE
```

Itens atuais:

```text
HTML

CSS

React

Flutter

Kotlin

Swift
```

---

# 30. Pasta — Ferramentas

```text
TOOLS
```

Por enquanto:

```text
Claude / Claude Code

Figma
```

Deixe preparado para receber outras ferramentas posteriormente.

Não invente uma lista agora.

---

# 31. Design das tecnologias

Não use barras como:

```text
React ████████ 90%
Python ██████ 80%
```

Não quero porcentagens de domínio.

Cada tecnologia deve simplesmente ser apresentada como algo que utilizo.

Os mini-cards podem possuir:

- nome;
- pequeno ícone;
- extensão;
- categoria;
- algum detalhe técnico.

Não use logos extremamente coloridos que destruam a paleta.

Prefira ícones monocromáticos ou adaptados visualmente à identidade do portfólio.

---

# 32. Projetos

A seção deverá existir e já possuir toda a estrutura visual preparada, mesmo que os projetos definitivos ainda sejam definidos posteriormente.

Comece com uma frase de impacto.

Algo conceitualmente como:

# Things I've built.

ou:

# Tudo que construí até aqui.

Não fixe a copy final ainda.

---

# 33. Cards dos projetos

Cada projeto deverá possuir:

- screenshot/imagem principal;
- nome;
- descrição curta;
- categoria;
- tecnologias;
- link para case study;
- GitHub quando aplicável;
- Live quando aplicável.

Mas novamente:

**não faça cards genéricos todos exatamente iguais.**

A seção pode utilizar:

- grid editorial;
- projetos maiores e menores;
- imagens ocupando bastante espaço;
- números;
- pequenas labels.

O projeto deve ser protagonista.

---

# 34. Interação dos projetos

No hover:

- imagem pode aumentar muito suavemente;
- cursor pode mudar;
- título pode deslocar;
- seta pode aparecer;
- borda ou detalhe laranja pode reagir.

Não aplique filtros exagerados nas screenshots.

---

# 35. Página de projeto

Ao clicar:

```text
/projects/project-name
```

Abra uma página interna.

Ela deve seguir a mesma linguagem visual do portfólio.

Estrutura preparada para:

```text
Project Hero
Overview
Problem
Solution
My Role
Features
Architecture
Tech Stack
Technical Decisions
Challenges
Solutions
Results
What I Learned
Gallery
Live Project
GitHub
```

Não é necessário inventar o conteúdo desses projetos agora.

Apenas prepare a linguagem e componentes visuais.

---

# 36. GitHub

Depois dos projetos haverá um CTA secundário.

Algo como:

```text
MORE WORK

View my GitHub ↗
```

Deve levar ao meu GitHub para visualizar outros projetos e experimentos.

---

# 37. Contato

A última grande seção deverá preparar uma conclusão forte.

Algo conceitualmente semelhante a:

# Vamos construir algo que gere impacto real.

A copy final será decidida posteriormente.

Abaixo:

```text
Let's talk ↗
```

Ao clicar, abrir um modal.

---

# 38. Modal de contato

O modal deve manter toda a identidade bege + laranja.

Divida aproximadamente em duas áreas.

### Contatos

```text
Email
WhatsApp
LinkedIn
GitHub
```

### Formulário

```text
Nome

E-mail

Mensagem

Enviar →
```

O backend do formulário será definido depois.

Neste momento foque no design e nos estados:

- normal;
- hover;
- focus;
- loading;
- success;
- error.

---

# 39. Footer

Muito simples.

Exemplo:

```text
Matheus Freitas

Fullstack Developer

LinkedIn
GitHub
Email

© 2026
```

Não crie um Footer gigantesco.

---

# 40. Movimento e animações

Movimento será parte importante deste projeto.

Porém:

**movimento deve melhorar a experiência, não disputar atenção com ela.**

Quero utilizar:

- scroll reveal;
- stagger;
- morphing de texto;
- parallax;
- hover;
- smooth scroll;
- spring animation;
- pequenas transformações;
- progressão da timeline;
- abertura de pastas;
- microinterações.

As animações devem parecer:

- suaves;
- físicas;
- intencionais;
- naturais.

Use princípios de easing e spring.

Evite:

- bounce excessivo;
- animações lentas;
- elementos entrando de todas as direções;
- animações simultâneas demais.

---

# 41. Scroll

A navegação deve possuir bastante fluidez.

Ao entrar em uma nova seção:

- labels podem aparecer primeiro;
- depois título;
- depois conteúdo;
- depois elementos secundários.

Crie ritmo.

Não use exatamente a mesma animação de entrada em todas as seções.

---

# 42. Bordas e superfícies

Utilize bordas extremamente sutis.

Evite:

```text
border: 1px solid #ccc
```

como padrão em todos os elementos.

Utilize diferenças suaves entre os próprios tons de bege.

Cards podem ser definidos através de:

- contraste;
- sombras mínimas;
- diferenças de superfície;
- linhas muito suaves.

---

# 43. Arredondamento

Use border-radius com moderação.

Não quero todos os componentes parecendo grandes cápsulas.

Use diferentes raios dependendo do componente.

O Header pode ser bastante arredondado.

Cards grandes podem possuir cantos moderados.

Outros elementos podem ter cantos quase retos.

Isso ajuda a evitar aparência de template.

---

# 44. Ícones

Prefira ícones:

- finos;
- minimalistas;
- geométricos;
- consistentes.

Não misture diferentes famílias visuais.

Use o laranja estrategicamente em estados ativos.

---

# 45. Cursor

Pode existir uma pequena customização do cursor em elementos especiais.

Por exemplo, quando o visitante estiver sobre um projeto:

```text
VIEW
```

pode aparecer próximo ao cursor.

Mas o cursor tradicional deve continuar sendo utilizado na maior parte do site.

Não prejudique usabilidade.

---

# 46. Responsividade

O design deve ser criado pensando desde o início em:

- desktop grande;
- notebook 14";
- tablet;
- celular.

**Muito importante:** em notebook de aproximadamente 14", o conteúdo não deve parecer gigante.

Evite:

- fontes gigantescas que obrigam zoom para 80%;
- hero que não cabe de maneira adequada;
- espaçamentos enormes;
- componentes desproporcionais.

Em uma tela 14" utilizando navegador a **100%**, o site deve parecer visualmente equilibrado.

---

# 47. Mobile

Não tente simplesmente comprimir o desktop.

Reorganize a experiência.

Por exemplo:

- timeline pode deixar de alternar esquerda/direita;
- pastas podem abrir verticalmente;
- Header pode ganhar outra interação;
- foto e introdução podem ser reposicionadas;
- cards auxiliares podem virar grid;
- projetos podem virar sequência vertical.

Preserve o conceito visual sem prejudicar usabilidade.

---

# 48. Acessibilidade

Garanta:

- contraste adequado;
- foco visível;
- navegação por teclado;
- labels;
- aria;
- suporte a `prefers-reduced-motion`;
- textos legíveis;
- áreas clicáveis adequadas.

Usuários que desativam animações devem conseguir utilizar todo o portfólio normalmente.

---

# 49. Sensação que o resultado deve transmitir

Quando alguém abrir o site, eu quero que pense:

> “Esse desenvolvedor tem uma identidade própria.”

Depois:

> “Ele entende tecnologia e produto.”

Depois:

> “Esse site foi realmente pensado.”

E finalmente, ao chegar nos projetos:

> “Quero entender melhor o que ele construiu.”

O site precisa parecer profissional o suficiente para ser utilizado em **processos seletivos**, mas também criativo o suficiente para representar alguém que desenvolve **produtos próprios e projetos freelancer**.

---

# 50. Regra principal

Não quero que você simplesmente transforme cada tópico desta especificação em um card.

Pense como um **Product Designer + Creative Developer experiente**.

Use:

- hierarquia;
- composição;
- ritmo;
- espaço;
- tipografia;
- movimento;

para transformar essas informações em uma experiência.

A interface deve ter personalidade **sem sacrificar clareza**.

Quando existir conflito entre:

**“colocar mais uma animação”**

e

**“manter o conteúdo elegante e fácil de consumir”**

priorize a segunda opção.

---

# Resultado esperado

Crie uma primeira versão visual completa baseada nessa especificação.

Neste momento, priorize:

1. identidade visual;
2. composição;
3. layout;
4. tipografia;
5. paleta;
6. hierarquia;
7. animações;
8. microinterações;
9. responsividade;
10. consistência.

**Não invente novas seções nem altere a estrutura definida sem necessidade.**

Se alguma informação ainda não estiver definida — projetos específicos, cursos, outras skills, frases finais etc. — utilize placeholders discretos e fáceis de substituir posteriormente.

O objetivo desta primeira versão é principalmente permitir que eu avalie:

**“Essa é a identidade visual que eu quero para o meu portfólio?”**

A partir dessa primeira versão, faremos os refinamentos necessários.