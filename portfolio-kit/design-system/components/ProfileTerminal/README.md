# ProfileTerminal

Card "matheus.profile": o texto Sobre mim aberto como `sobre.md` num editor bege — comando `> cat sobre.md`, frontmatter curto e cada parágrafo numerado como uma linha.

- `text`: o texto completo, um parágrafo por item (padrão: o texto oficial em `MF.defaults.about`). Mostre-o inteiro — não resuma.
- `entries`: o frontmatter (`name`, `role`, `since`, `study`). Com `text={[]}` o card volta ao modo chave/valor, com `flow: true` virando pipeline.
- `highlight`: frases exatas pintadas em `terracota-ink` — no máximo seis, só fatos e a filosofia (2024, COTEMIG, *Tecnologia, para mim, é meio.*). O último parágrafo fecha em `ink` com peso 500.
- Os parágrafos entram em sequência quando o card aparece. Inclina até `maxTilt` graus (6) seguindo o cursor, com sheen e sombra que reagem; volta suave ao sair. Desliga em toque e com movimento reduzido.
- Largura ideal 640–760px (linha de ~66 caracteres). Abaixo de 560px some a numeração e o texto ocupa a largura toda.
