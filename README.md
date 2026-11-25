# open-ci-site

Marketing website, interactive CI savings calculator, and searchable documentation hub for [`open-ci`](https://github.com/katchlabs/open-ci) (**Your cloud. Spot prices. Zero markup.**) by Katch Labs.

## Stack

- **Vite + React 19 + TypeScript + Tailwind CSS v4**
- **Interactive CI Savings Calculator** with verified 2026 AWS/GCP Spot, GitHub Actions, and managed runner SaaS rates
- **Live Fleet Visualizer** with interactive Spot stockout failover simulation
- **Full Searchable Documentation Hub** (`/docs/*`, `Cmd+K` search, syntax-highlighted copyable code blocks, custom dark-mode architecture diagrams)
- **Zero-config static SPA output** (`dist/` with `public/_redirects`, `vercel.json`, and automatic `dist/404.html` fallback)

## Local Development

```bash
bun install
bun run dev
```

Type-check and build production static assets:

```bash
bunx tsc --noEmit
bun run build
bun run preview
```

## Deploy in 1 Click

### Cloudflare Pages

1. Connect `katchlabs/open-ci-site` in Cloudflare Pages.
2. Set **Build command** to `bun run build` and **Build output directory** to `dist`.
3. `public/_redirects` automatically configures SPA fallback (`/* /index.html 200`).

### Vercel

1. Import `katchlabs/open-ci-site` in Vercel.
2. Framework preset: **Vite** (`bun run build`, output `dist`).
3. `vercel.json` handles client-side route rewrites and immutable asset caching.

### GitHub Pages

Build produces `dist/404.html` automatically as a mirror of `dist/index.html` for clean SPA deep-link routing on GitHub Pages.

## License

Licensed under the Apache License, Version 2.0.
