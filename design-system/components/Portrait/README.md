# Portrait

Foto da Hero com corte editorial: canto superior direito chanfrado, marcas de corte em terracota e legenda mono.

- Moldura quadrada por padrão; a página pode definir `--frame-h` (em `cqi` da figura) para um recorte mais alto — a Hero vai de ≈0.9 a 4:5 conforme a altura da tela. `image` pode ter qualquer proporção: `image.focus` (`object-position`, em `lib/content/assets.ts`) decide o que o recorte mantém. Recebe um leve tratamento quente.
- `caption`/`meta` na legenda (`FIG. 01 · EU — MF`); `caption={false}` remove.
- `hover` (opcional): segunda foto (com o próprio `focus`) + legenda. Com mouse, a segunda foto entra num crossfade com leve desfoque (700ms) e o identificador rola de `FIG. 01` para `FIG. 02`, como um contador; o `meta` fica parado. Sem zoom. Em toque, só a primeira foto.
- `intro` (Hero): a moldura abre de baixo para cima com o chanfro, a foto assenta (`scale 1.08 → 1`), depois as marcas e a legenda. Desligado com `prefers-reduced-motion`.
