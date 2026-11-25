# open-ci Design System

Editorial light-mode industrial spec sheet built around warm bone paper, architectural hairlines, restrained typography, and concrete engineering evidence.

## Palette ("Bone Canvas" + Architectural Ink)

| Token | Hex | Usage |
| --- | --- | --- |
| `--color-bone` | `#F5F5F2` | Page canvas, navigation chrome, recessed reading frame |
| `--color-paper` | `#FFFFFF` | Primary instrument sheets, ledgers, spec tables, doc reading pane |
| `--color-recessed` | `#ECECE7` | Segmented control wells, hover fills, muted bar tracks |
| `--color-hairline` | `#E4E4DF` | All structural `1px` borders and table rules |
| `--color-hairline-strong` | `#D2D2CA` | Interactive border hover states |
| `--color-ink` | `#111111` | Primary headlines, solid primary CTA, active bar fills, strokes |
| `--color-ink-secondary` | `#555550` | Body prose and technical explanations |
| `--color-ink-muted` | `#6E6E67` | Sheet indices (`01 / SAVINGS`), mono labels, secondary units (WCAG AA compliant) |
| `--color-signal-emerald` | `#15803D` | Verified savings numbers, speedup deltas, pass indicators |
| `--color-signal-dot` | `#16A34A` | Live control-plane status dot |
| `--color-signal-crimson` | `#DC2626` | Spot stockout backoff state only |
| `--color-code-bg` | `#141413` | High-contrast dark ink reserved strictly for code slabs |

## Typography

- **Primary UI & Display:** `Inter` (`400`, `500`, `600`) with `text-wrap: balance` on `h1` and `h2`.
  - Hero `h1`: `56px` weight `500`, tracking `-0.035em`, line-height `1.06`, paired with a `40px` regular secondary line in `#6E6E67`.
  - Section `h2`: `28px–38px`, weight `500`, tracking `-0.025em`, line-height `1.12`.
  - Never use font weights `700`, `800`, or `900` on large headlines.
- **Technical & Numeric:** `JetBrains Mono` (`400`, `500`) with `tabular-nums` reserved strictly for section indices, numeric values, commands, units, and technical identifiers.

## Grid & Geometry

- Centered `1160px` container (`max-w-[1160px]`) on a 12-column architectural grid.
- Toggle the 12-column hairline blueprint overlay from the navbar grid control or by pressing `G`.
- Strict radius discipline: `8px` (`rounded-lg`) for outer panels, `4px` (`rounded`) for controls/inner blocks, `0px` flat architectural sheet for documentation reading pages.
- Tactile interactions use `active:scale-[0.98]` and `150ms–200ms` transitions.

## Explicit Anti-Patterns

- No dark-mode SaaS canvas (`#090B10`), radial glow blobs, or multi-color gradients.
- No floating pill badges stacked above headlines or icons trapped in neon squares.
- No exclamation marks or hype copy ("blazing", "revolutionary", "supercharge", "seamless", "next-gen").
