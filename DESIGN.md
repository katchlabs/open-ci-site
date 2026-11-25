# open-ci Design System

Luminous pure-white canvas, crisp Obsidian ink, and a CI Emerald signature that reads as "build passed, money saved". Inspired by airy developer-tool marketing, but every signature (palette, edge animation, hero deck, mark) is open-ci's own.

## Palette (Obsidian + CI Emerald)

| Token | Hex | Usage |
| --- | --- | --- |
| `--color-canvas` | `#FFFFFF` | Page canvas, cards, Live Runner Deck |
| `--color-surface` | `#F7F9F8` | Cool-porcelain bands, segmented wells, chips |
| `--color-hairline` | `#E2E7E4` | Structural `1px` borders (`#ECEFEA` for chrome dividers) |
| `--color-hairline-strong` | `#D3D9D5` | Interactive border hover states |
| `--color-ink` | `#0B0D0E` | Headlines, solid primary CTA, active tab pill, code slabs |
| `--color-ink-secondary` | `#525A55` | Body prose, subheads |
| `--color-ink-muted` | `#6B736E` | Mono labels, units, secondary metadata (WCAG AA) |
| `--color-emerald` | `#059669` | Signature brand color: headline accent, slider thumb, `$` prompt |
| `--color-emerald-bright` | `#10B981` | Live pulse dots, running/complete bars, logo spark |
| `--color-emerald-ink` | `#047857` | Emerald text on tints (savings badges, pass states) |
| `--color-emerald-tint` / `-border` | `#ECFDF5` / `#A7F3D0` | Win badges and callouts |
| `--color-signal-amber` | `#F59E0B` | Spot preemption / burst moments only, used sparingly |
| `--color-signal-crimson` | `#DC2626` | Removed diff lines, stockout states only |

No cobalt/blue anywhere in the brand.

## Signatures

- **Logo:** two parallel runner chevrons (white + emerald) in a `#0B0D0E` rounded square with an emerald status spark.
- **Ephemeral Compute Rails** (`HeroPerimeterCanvas`): hairline build lanes on the outer ~23% of each hero edge; emerald runner capsules boot, fill, check, and dissolve; amber preemption arcs hand work to an adjacent rail. The center stays pure white.
- **Live Runner Deck** (`HeroPlayground`): white `rounded-2xl` window, emerald top hairline, porcelain chrome bar with a live dot and an obsidian segmented tab pill.

## Typography

- **Primary UI & Display:** `Inter` (`400`, `500`, `600`) with `text-wrap: balance` on `h1` and `h2`.
  - Hero `h1`: `56px` weight `500`, tracking `-0.035em`, line-height `1.06`, paired with a `40px` regular secondary line in `#6E6E67`.
  - Section `h2`: `28px–38px`, weight `500`, tracking `-0.025em`, line-height `1.12`.
  - Never use font weights `700`, `800`, or `900` on large headlines.
- **Technical & Numeric:** `JetBrains Mono` (`400`, `500`) with `tabular-nums` reserved strictly for section indices, numeric values, commands, units, and technical identifiers.

## Grid & Geometry

- Centered `1160px` container (`max-w-[1160px]`) on a 12-column architectural grid.
- Toggle the 12-column hairline blueprint overlay from the navbar grid control or by pressing `G`.
- Radius discipline: `rounded-2xl` for the hero deck, `rounded-xl` (`12px`) for buttons, CTAs and cards, `rounded-lg` for chips and inner controls. No `rounded-full` pill CTAs; full rounding is reserved for status dots and bar tracks.
- Tactile interactions use `active:scale-[0.98]` and `150ms–200ms` transitions.

## Explicit Anti-Patterns

- No dark-mode SaaS canvas (`#090B10`), radial glow blobs, or multi-color gradients.
- No floating pill badges stacked above headlines or icons trapped in neon squares.
- No exclamation marks or hype copy ("blazing", "revolutionary", "supercharge", "seamless", "next-gen").
