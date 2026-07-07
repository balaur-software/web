# balaur-life

Bun-workspace monorepo for the Balaur personal life OS.

## Packages

| Package | What |
|---|---|
| [`balaur-memory`](https://github.com/balaur-software/memory) | Consent-gated, lineage-tracked, forgettable memory layer. One SQLite file, zero runtime deps, Bun-native. External dep — pinned to a Git tag, linked to a local checkout for parallel dev (see that repo's `docs/RELEASE.md`). |
| [`balaur-design`](https://github.com/balaur-software/design) | The OCTANT design system (`@balaur/octant-core`, `@balaur/tokens`, `@balaur/ui`). External dep — linked to a local checkout for parallel dev via `bun link` (see that repo's `docs/RELEASE.md`). Storybook lives there now. |
| `apps/web` (`@balaur/web`) | Bun-native SSR React web GUI for the [pi coding agent](https://github.com/badlogic/pi-mono) (`Bun.serve` + `renderToReadableStream` + native WebSocket). Ported from [`VVander/pi-remote-web-ui`](https://github.com/VVander/pi-remote-web-ui). |

## Scripts

```bash
bun install          # resolve the workspace
bun run dev          # run the SSR app (apps/web)
bun test             # run all workspace tests
bun run check        # typecheck + lint + test
```

Storybook now lives in [`balaur-software/design`](https://github.com/balaur-software/design) — run `bun run storybook` there, not here.

Requires Bun ≥ 1.2.

## `apps/web` — security model

The server **only binds to `127.0.0.1:8080`** and is never reachable from the
internet. Access it by forwarding a port over your existing SSH connection:

```bash
ssh -L 8080:localhost:8080 root@your-vps
```

Then open **http://localhost:8080**. Authentication is your SSH key — no
passwords, tokens, or TLS. A single in-process `AgentSession` is shared across
every connected tab. Run in production with `bun run start` (see
`apps/web/pi-remote-web-ui.service` for a systemd unit).

### Provider / configuration

The agent is **self-contained** — it never reads a global pi installation
(`~/.pi`); auth, models, settings and sessions are all app-local or in-memory.
It currently uses **Mistral** (balaur is European-aligned). Configure via env:

The Mistral API key is normally entered **in the browser** (🔑 button in the
header) — it's persisted in `localStorage` and pushed to the local server over
the SSH tunnel, so no key needs to live on the server. `MISTRAL_API_KEY` is an
optional server-side fallback (handy for the systemd unit).

| Var | Default | What |
|---|---|---|
| `MISTRAL_API_KEY` | — (optional) | server-side fallback Mistral API key |
| `MISTRAL_MODEL` | `devstral-medium-latest` | any Mistral model id (e.g. `mistral-medium-latest`, `mistral-large-latest`, `magistral-medium-latest`) |
| `PORT` | `8080` (`6001` under `bun run dev`) | server port |
| `BALAUR_AGENT_DIR` | `apps/web/.balaur-agent` | app-local dir for agent state |

```bash
MISTRAL_API_KEY=sk-... bun run start
```

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
