# balaur-life

Bun-workspace monorepo for the Balaur personal life OS.

## Packages

| Package | What |
|---|---|
| [`balaur-memory`](https://github.com/balaur-software/memory) | Consent-gated, lineage-tracked, forgettable memory layer. One SQLite file, zero runtime deps, Bun-native. External dep — pinned to a Git tag, linked to a local checkout for parallel dev (see that repo's `docs/RELEASE.md`). |
| `packages/octant-core` (`@balaur/octant-core`) | Pure, framework-agnostic encoder for the OCTANT design system — the pixel→mask→Unicode-octant-glyph core (`octChar`) + canvas rasterization fallback. |
| `packages/tokens` (`@balaur/tokens`) | OCTANT design tokens (ANSI 16-color palette, ramps, type scale, motion, accent system) as typed TS + `tokens.css`; self-hosted DepartureMono. |
| `packages/ui` (`@balaur/ui`) | The OCTANT design system as atomic React components + Storybook. |
| `apps/web` (`@balaur/web`) | Bun-native SSR React app (`Bun.serve` + `renderToReadableStream`). |

## Scripts

```bash
bun install          # resolve the workspace
bun run dev          # run the SSR app (apps/web)
bun run storybook    # run the component workshop (packages/ui)
bun test             # run all workspace tests
bun run check        # typecheck + lint + test
```

Requires Bun ≥ 1.2.
