# Header

Header fixo: idioma à esquerda, pill de navegação centralizada, CV à direita — três peças soltas, não uma faixa.

- `active` recebe o id da seção visível; use `MF.useScrollSpy(['sobre','servicos','experiencia','skills','projetos'])`.
- Hover desliza um fundo `sand-2` sob o item; ativo ganha ponto `terracota-strong`. Rolando, a pill ganha `shadow-float`.
- Abaixo de 720px a pill vira o botão *Menu* com folha suspensa e itens numerados.
- `fixed={false}` para previews. Reserve `header-offset` no topo da página.
