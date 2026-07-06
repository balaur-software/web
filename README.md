# balaur-life

Bun-workspace monorepo for the Balaur personal life OS.

## Packages

| Package | What |
|---|---|
| [`balaur-memory`](https://github.com/balaur-software/memory) | Consent-gated, lineage-tracked, forgettable memory layer. One SQLite file, zero runtime deps, Bun-native. External dep — pinned to a Git tag, linked to a local checkout for parallel dev (see that repo's `docs/RELEASE.md`). |
| [`balaur-design`](https://github.com/balaur-software/design) | The OCTANT design system (`@balaur/octant-core`, `@balaur/tokens`, `@balaur/ui`). External dep — linked to a local checkout for parallel dev via `bun link` (see that repo's `docs/RELEASE.md`). Storybook lives there now. |
| `apps/web` (`@balaur/web`) | Bun-native SSR React app (`Bun.serve` + `renderToReadableStream`). |

## Scripts

```bash
bun install          # resolve the workspace
bun run dev          # run the SSR app (apps/web)
bun test             # run all workspace tests
bun run check        # typecheck + lint + test
```

Storybook now lives in [`balaur-software/design`](https://github.com/balaur-software/design) — run `bun run storybook` there, not here.

Requires Bun ≥ 1.2.

## Parallel-dev setup

Both external deps (`balaur-memory`, `balaur-design`) are declared via
`link:` specs and resolved through `bun link` against local checkouts.
On a fresh machine, clone both repos and register them once:

```bash
# balaur-memory
cd ~/Projects/balaur-memory && bun link

# balaur-design (three packages)
cd ~/Projects/balaur-design
cd packages/octant-core && bun link && cd ../..
cd packages/tokens && bun link && cd ../..
cd packages/ui && bun link && cd ../..

# then in this repo:
bun install
```

See each repo's `docs/RELEASE.md` for the full runbook.
