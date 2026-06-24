# DESIGN — TCHAU.BG

Minimalismo funcional, claro, quente. A interface recua para a foto aparecer.

## Color

Estratégia: **Restrained** — neutros quentes + um único acento (magenta) ≤10%.

| Role | Valor | Uso |
|---|---|---|
| bg | `#ededea` | fundo da página |
| surface | `oklch(0.95 0.004 60)` | molduras de thumbnail |
| ink | `oklch(0.22 0.012 350)` | texto principal (quase preto, tom magenta) |
| muted | `oklch(0.54 0.012 350)` | texto secundário |
| line | `oklch(0.86 0.006 350)` | hairlines 1px |
| accent | `oklch(0.60 0.23 350)` | ação primária, progresso, estado ativo |
| accent-ink | `oklch(0.99 0.005 350)` | texto sobre o acento |

Sem `#000`/`#fff`. Sem gradientes em texto. Acento aparece só no botão primário,
no estado de processamento e em hovers de ação.

## Typography

- Título da página: **Boldonse** (Google) — display blocky, peso único. Só no
  wordmark "TCHAU.BG".
- Texto/UI: **Space Grotesk** (Google), 300–700.
- Escala com contraste ≥1.25. Corpo 45–70ch.

## Iconography

**Material Symbols Rounded** (Google), com parcimônia: `add_photo_alternate`
(dropzone), `progress_activity` (loading, em rotação fluida), `download`,
`folder_zip`, `delete`, `broken_image` (erro). Sem ícones decorativos.

## Motion

Ease-out exponencial (quint/expo). Loading fluido: rotação linear contínua do
`progress_activity` + skeleton com shimmer suave; resultado entra com fade +
leve scale. Nada de bounce/elastic. Sem animar propriedades de layout.

## Layout

Coluna única centrada, respiro generoso. Dropzone é o centro. Resultados em grid
com molduras de hairline sobre xadrez claro (mostra a transparência). Sem
sombras pesadas, sem cards aninhados.
