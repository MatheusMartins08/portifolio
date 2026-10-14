# ContactModal

Modal de contato: canais à esquerda (Email, WhatsApp, LinkedIn, GitHub), formulário à direita.

- `open` + `onClose`; Esc, clique fora e botão fecham; foco preso dentro e devolvido ao CTA.
- `onSubmit(data)` retorna Promise → *success*; rejeição → banner de erro. Valida nome, e-mail e mensagem.
- `status` força um estado para revisão; `inline` renderiza sem sobreposição. No celular vira folha que sobe da base.
