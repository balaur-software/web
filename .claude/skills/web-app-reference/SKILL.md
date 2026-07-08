---
name: web-app-reference
description: Use when working in the balaur web repo (balaur-software/web, root package "balaur-life", app @balaur/web) — editing server.tsx / App.tsx / Document.tsx, debugging the /ws WebSocket protocol or extension-UI dialogs, SSR/hydration or /client.js issues, PORT / HOST / MISTRAL_API_KEY / MISTRAL_MODEL / BALAUR_AGENT_DIR questions, an "Unknown Mistral model" boot crash, bumping the @balaur/octant or balaur-memory tag pins, bun.lock pin checks, links.test.ts, or pi-coding-agent bumps.
---

# web-app-reference — the balaur web app

## Identity (honest version)

- Repo: `github.com/balaur-software/web` (private, no git tags as of 2026-07-08).
- Root package is still named **`balaur-life`** — monorepo-era residue from before the OCTANT and memory extractions. The repo README's title and package table describe that old world (see "Doc-drift ledger" below).
- One Bun workspace app: `apps/web` = **`@balaur/web`** — a Bun-native SSR React 19 chat GUI for the **pi coding agent** (`@mariozechner/pi-coding-agent`), ported from `VVander/pi-remote-web-ui`. Intended to become the life-OS app.
- `balaur-memory` is a pinned dependency but, as of 2026-07-08, is imported **only** by `test/links.test.ts`. The app does not use the memory layer yet — that integration is the campaign; see the workspace-root skill **balaur-memory-web-campaign**. Note: memory HEAD has moved **14 commits past the pinned v0.4.3** (unreleased deep-audit work) — what this repo installs is the tag, not memory main; never reason about the dep from the sibling checkout's HEAD.
- No CI, no git hooks (in THIS repo — memory armed its own CI 2026-07-08). The gate is `bun run check` (typecheck + biome + bun test), green at HEAD `4c370cf` as of 2026-07-08.

## When NOT to use this skill

| You want to… | Use instead |
|---|---|
| Run/deploy the app, systemd unit, ports on this box, Herdr panes, exposure | **balaur-run-and-operate** |
| Cross-repo architecture, tag-pin doctrine, change choreography | **balaur-workspace-map** |
| OCTANT component APIs, tokens, Storybook, SSR discipline inside design/ | **design-octant-reference** |
| Releasing/consuming a new OCTANT version, dual-React doctrine detail | **design-change-and-release** |
| Wiring balaur-memory into the chat agent | **balaur-memory-web-campaign** |
| Triage an unknown symptom across repos | **balaur-debugging-playbook** |

## Layout (every source file)

```
web/
  package.json            # root "balaur-life"; holds the two git-tag pins
  bun.lock                # resolved pins live here — verify after every bump
  test/links.test.ts      # the ONE test (dependency-resolution smoke)
  apps/web/
    package.json          # @balaur/web; pi-coding-agent, highlight.js, react 19
    pi-remote-web-ui.service  # STALE historical systemd template — never deploy from it
    .balaur-agent/        # gitignored agent state (auth.json, models.json)
    src/
      server.tsx          # everything server-side: build, routes, WS, pi session
      Document.tsx        # SSR HTML shell for "/"
      App.tsx             # the whole client UI + WS client + dialogs
      client.tsx          # 5-line hydrateRoot entry
      types.ts            # extension-UI request shapes (ExtUIMethod union)
      style.css           # thin app shell
      octant/
        conversation.ts   # pi events -> OCTANT ChatMessageData transcript
        blocks.ts         # fenced-code splitter (text -> text/code blocks)
        render-block.tsx  # highlight.js -> OCTANT CodeBlock
        OctantDemo.tsx    # /octant SSR-only spike page
        demo-fixture.ts   # static fixture for the spike
```

## SSR pipeline (server.tsx)

1. **Startup client build** — `Bun.build({ entrypoints: [src/client.tsx], target: "browser", minify: NODE_ENV === "production" })` runs once at boot (server.tsx:28-37). The bundle lives **in memory** and is served at `/client.js`. There is **no on-disk artifact** — the `.gitignore` entries `apps/web/public/client.js{,.map}` are stale legacy; `apps/web/public/` does not exist.
2. **Static asset resolution** — OCTANT assets are resolved from the installed package via `Bun.resolveSync` (server.tsx:44-49): `@balaur/octant/tokens/tokens.css`, `@balaur/octant/tokens/fonts/departure-mono.woff2`, and `highlight.js/styles/github-dark.css`.
3. **`/`** — `renderToReadableStream(<Document />, { bootstrapModules: ["/client.js"] })` (server.tsx:256). `Document.tsx` links `/tokens.css`, `/hljs.css`, `/style.css` and renders `<App />` under `#root`.
4. **Client** — `client.tsx` calls `hydrateRoot(#root, <App />)`. All interactivity (WS connect, dialogs) lives in `App.tsx` inside a mount-once `useEffect`.

### Route table (the whole `fetch` switch, server.tsx:209-259)

| Path | Response |
|---|---|
| `/ws` | WebSocket upgrade; 400 `websocket upgrade failed` if upgrade fails |
| `/client.js` | in-memory client bundle, `text/javascript` |
| `/style.css` | `src/style.css` |
| `/tokens.css` | OCTANT tokens css (resolved from the installed package) |
| `/fonts/departure-mono.woff2` | OCTANT font, `cache-control: immutable` (path is where tokens.css's relative `../fonts/...` lands) |
| `/hljs.css` | highlight.js `github-dark` theme |
| `/octant` | SSR-only OCTANT demo page (`OctantDemo.tsx`, dynamic import, no hydration) |
| `/` | SSR app document + hydration bundle |
| anything else | 404 `not found` |

## WebSocket protocol

One endpoint (`/ws`), JSON messages both ways. Malformed JSON and unknown `type` values are silently ignored (server.tsx:277-283, 331-332).

### Client → server (server.tsx:286-330)

| `type` | Payload | Server behaviour |
|---|---|---|
| `prompt` | `message: string`, `streamingBehavior?: "steer" \| "followUp"` | If the session is already streaming: awaited `session.prompt(text, { streamingBehavior })`, default `"followUp"`. Otherwise fire-and-forget `session.prompt(text)`. Note: the current UI never exercises steer/followUp — `App.tsx` `sendPrompt` refuses to send while `conv.streaming` (App.tsx:168). The capability exists only at the protocol level. |
| `set_api_key` | `key: string` | Trimmed; **empty keys are ignored** (`if (key)`, server.tsx:302-306). Consequence: clearing the key in the UI sends `key: ""` and the server keeps the old runtime key until restart. Applies to the shared session — all tabs. |
| `abort` | — | `await session.abort()` |
| `new_session` | — | `await session.newSession()` then broadcasts a fresh `state_sync` to every tab (wipes the shared conversation for everyone) |
| `extension_ui_response` | `id: string` + method-specific fields (`value`, `confirmed`, `cancelled`) | Resolves the pending extension-UI promise matched by `id` |

### Server → client (handled in `App.tsx` `handleServerEvent`, App.tsx:68-114)

| `type` | Payload | Client behaviour |
|---|---|---|
| `state_sync` | `messages`, `streaming`, `model`, `sessionId` | Sent on WS open and after `new_session`. Rebuilds the whole transcript (`Conversation.sync`) |
| `agent_start` / `agent_end` | pi event pass-through | Start/stop streaming state; `agent_end` finalizes the in-flight message |
| `message_start` | pi event | Opens a new streaming agent message (reuses an empty in-flight one) |
| `message_update` | `assistantMessageEvent` with `text_delta` / `thinking_delta` / `toolcall_end` | Appends to text/reasoning blocks; `toolcall_end` pushes a `tool_call` block with `status: "running"` |
| `tool_execution_update` / `tool_execution_end` | `toolCallId`, partial/final result | Updates the matching `tool_call` block's `result`/`status` |
| `extension_ui_request` | `id`, `method`, method-specific fields | `notify` → toast; `select` / `confirm` / `input` / `editor` → modal dialog; **everything else is dropped** (see bridge table) |
| `extension_error` | `extensionPath`, `event`, `error` | Error toast |

All pi agent events are fanned out verbatim: `session.subscribe((event) => broadcast(event))` publishes to Bun pub/sub topic `"conversation"` (server.tsx:53, 345-350). Any event types beyond the ones above reach the client and fall through the switch unhandled.

**Reconnect loop**: on close, the client retries every 3 s until unmount (App.tsx:142-146); on open it re-pushes the stored API key or toasts "Set your Mistral API key".

## Extension-UI bridge

pi extensions request interactive UI through a `UIContext` object. The server implements one that forwards requests over WS with a `crypto.randomUUID()` id and matches responses back via `pendingExtensionRequests` (server.tsx:55-165). Dialog promises resolve to a **default value** on `AbortSignal` abort or `timeout` expiry — never reject.

Method-by-method truth table (server impl → client handling):

| Method | Server (server.tsx) | Client (App.tsx) | Net effect |
|---|---|---|---|
| `select` | round-trip dialog promise | Modal + `Select` | works |
| `confirm` | round-trip dialog promise | Modal YES/NO | works |
| `input` | round-trip dialog promise | Modal + `TextInput` | works |
| `notify` | one-way broadcast | toast | works |
| `setStatus` | broadcast | **dropped** (not in the client's method list) | no-op end-to-end |
| `setWidget` | broadcast (string[] content only) | **dropped** | no-op end-to-end |
| `setWorkingMessage` | server no-op | — | stub |
| `setTitle` | server no-op | — | stub |
| `onTerminalInput` | returns a no-op unsubscribe | — | stub |
| `editor` | **`editor: undefined`** (the SDK expects a function) | dead Modal+Textarea path at App.tsx:349 that nothing triggers | broken/stub |
| `set_editor_text` | never produced anywhere | only exists in the `ExtUIMethod` union (types.ts:15) | dead port residue |

`types.ts` holds only these request shapes (`ExtUIMethod`, `ExtUIRequest`, `ToastKind`) — the conversation model itself lives in OCTANT's `ChatMessageData`.

### The `as any` seam — check after EVERY pi bump

`session.bindExtensions({ uiContext: createExtensionUIContext(broadcast) as any, ... })` (server.tsx:353-364). The biome-ignore comment says "the pi SDK UIContext type is not exported" — **that claim is stale at pi 0.55.4**: the SDK does export `ExtensionUIContext` (re-exported from `dist/core/extensions/types.d.ts` via `dist/index.d.ts`). The cast is still load-bearing for a different reason: the web implementation is **partial** — it lacks `setFooter`, `setHeader`, `custom`, `pasteToEditor`, `setEditorText`, `getEditorText`, and supplies `editor: undefined` where the interface wants a function.

Because of the cast, **a pi version bump can change the `ExtensionUIContext` contract with zero compile error**. After any pi bump, run:

```bash
sed -n '/interface ExtensionUIContext/,/^}/p' \
  apps/web/node_modules/@mariozechner/pi-coding-agent/dist/core/extensions/types.d.ts
```

and diff the method list against `createExtensionUIContext` in `server.tsx`. Optionally delete `as any` temporarily and read the type errors — they are the real diff. (Candidate improvement, open: type the object as `Partial<ExtensionUIContext>`-style satisfies so drift surfaces at typecheck. Not done as of 2026-07-07.)

## pi integration

- **One shared `AgentSession` for the whole process** (server.tsx:191-198). Every tab subscribes to the same conversation via Bun pub/sub topic `"conversation"`. Any tab's `set_api_key` changes the key for everyone; `new_session` wipes the shared conversation for everyone. This is single-user **by design**, not a bug.
- **Mistral-only** — "balaur is European-aligned" is policy (server.tsx:170-173). Model = `MISTRAL_MODEL` env, default `devstral-medium-latest`. An unknown model id **throws at boot** (`modelRegistry.find` returns null → `throw`, server.tsx:186-189). Under a systemd unit with `Restart=on-failure` this becomes a crash-loop — check `MISTRAL_MODEL` first when the service flaps (see **balaur-run-and-operate**).
- **API-key flow**: browser localStorage key `balaur.mistralApiKey` (App.tsx:20) → pushed over WS on connect → `authStorage.setRuntimeApiKey("mistral", key)` — **runtime-only, never persisted**. `MISTRAL_API_KEY` env is the server-side fallback, applied the same runtime-only way at boot (server.tsx:183). Verified 2026-07-07: `apps/web/.balaur-agent/auth.json` is literally `{}` after real use.
- **Self-contained agent state**: `agentDir` defaults to `apps/web/.balaur-agent` (gitignored). `SettingsManager.inMemory()` and `SessionManager.inMemory(process.cwd())` — nothing reads or writes a global `~/.pi` (server.tsx:196-197).
- **Agent display identity = the model name**: `conv.model.split(/[-@]/)[0].toUpperCase()` (App.tsx:207) — `devstral-medium-latest` renders as **DEVSTRAL**. The single agent id is `"agent"` (`AGENT_ID`, conversation.ts:9).

## Configuration surface (the complete env-var list)

Everything the app reads from the environment, verified in server.tsx:

| Var | server.tsx | Default | Effect / gotcha |
|---|---|---|---|
| `PORT` | :51 | `8080` | **Machine-specific:** 8080 is taken by SearXNG on this dev VPS — never use the default here. `bun run dev` sets `PORT=6001`; the local self-host instance uses 8090 (see **balaur-run-and-operate**). |
| `HOST` | :52 | `127.0.0.1` | The UI has **no login**. Binding beyond localhost is an **exposure decision** — the sanctioned posture is loopback + SSH tunnel (no mesh exists on this box since 2026-07-08); see **balaur-run-and-operate**. `HOST` is missing from the README env table (drift). |
| `NODE_ENV` | :31 | unset | `production` → minified client bundle. `bun run start` sets it. |
| `MISTRAL_API_KEY` | :174 | unset | Server-side fallback key; runtime-only, never written to auth.json. |
| `MISTRAL_MODEL` | :175 | `devstral-medium-latest` | Any valid Mistral model id. Unknown id **throws at boot** → systemd crash-loop. |
| `BALAUR_AGENT_DIR` | :180 | `apps/web/.balaur-agent` | Agent state dir (auth.json, models.json). |

Scripts: `bun run dev` = `PORT=6001 bun --watch run src/server.tsx`; `bun run start` = `NODE_ENV=production bun run src/server.tsx` (apps/web/package.json).

## Conversation / blocks seam (src/octant/)

- **`conversation.ts`** — `Conversation` class maps the pi event stream / `state_sync` snapshots into OCTANT `ChatMessageData[]`. Deliberately a **mutable transcript**: the React layer mutates it in place and forces re-render via `useReducer((n) => n + 1, 0)` (App.tsx:56, 113). Don't "fix" this into immutable state without understanding the streaming-append hot path.
- **`blocks.ts`** — `splitTextBlocks(text, streaming)` splits fenced ```` ``` ```` code out of prose into OCTANT `code` blocks. **While streaming, the split is skipped** (single streaming `text` block) to avoid half-typed-fence flicker; the split happens at finalize (`Conversation.finalize`).
- **`render-block.tsx`** — `renderBlock` feeds highlight.js output into OCTANT's `CodeBlock` via `dangerouslySetInnerHTML`. This rests on a **trusted-agent-output assumption**: safety = highlight.js escaping the code content correctly. Agent/model output is not attacker-controlled in the current single-user model, but revisit this before any exposure change. All non-`code` blocks return `null` and fall through to OCTANT's default `BlockRenderer`.

## Dependency-bump runbook (tag pins)

The two cross-repo deps are **git tag pins in the root `package.json`** (doctrine; see **balaur-workspace-map**):

```json
"balaur-memory": "github:balaur-software/memory#v0.4.3",
"@balaur/octant": "github:balaur-software/design#v0.3.0"
```

To bump (example: octant to a hypothetical v0.4.0):

```bash
cd /home/alex/projects/balaur/web            # adjust to your checkout
# 1. Confirm the tag exists in the sibling repo and note its commit
git -C ../design rev-parse --short v0.4.0
# 2. Edit the tag in the ROOT package.json (not apps/web/package.json)
# 3. Re-resolve
bun install
# 4. Verify the lockfile picked up the exact tag commit — MUST match step 1
grep -E '@balaur/octant|balaur-memory' bun.lock | head -4
# 5. Verify node_modules resolves into bun's frozen github store, NOT a local checkout
readlink node_modules/@balaur/octant node_modules/balaur-memory
#    expected: ...node_modules/.bun/...github+balaur-software+design+<sha>...
# 6. Gate
bun run check
# 7. Smoke by hand: bun run dev  → http://localhost:6001 renders and chats
```

Verified pin state as of 2026-07-08 (unchanged): `@balaur/octant#v0.3.0` → `9f26088`, `balaur-memory#v0.4.3` → `64c0542`; both match `git rev-parse` of the tags in the sibling checkouts.

**A real bump hazard to plan for**: memory HEAD (unreleased, 14 commits past v0.4.3) **dropped the `balaur` CLI** (`3ddb84b` — no `cli/`, no `bin` entry) and shipped a **breaking `DoctorReport` revision** (`005da77`: adds `pendingByKind`, `historyRows`, `reproposedAfterForget30d`). So the first memory pin bump past v0.4.3 will (a) make `bunx balaur` from this repo stop resolving — replace any CLI-based verification/ops steps with library calls first — and (b) break any code destructuring the old `DoctorReport` shape. Check the memory release notes before bumping.

**Dev-iteration overrides** (digest — full doctrine in **balaur-workspace-map** / **design-change-and-release**):

- design → `"@balaur/octant": "file:../design"` and re-run `bun install` in web after **each** design edit. `bun link @balaur/octant` is **FORBIDDEN** — it reintroduces the dual-React `resolveDispatcher` SSR crash, invisible to typecheck.
- memory → `bun link balaur-memory` is sanctioned as a working-tree-only override. Bun 1.3.x has no `bun unlink`: undo with `rm node_modules/balaur-memory && bun install`.
- **Never commit with a `link:`/`file:` override active.** Never commit or push at all unless the owner explicitly asks.

### Vestigial symlink landmine

`node_modules/@balaur/{octant-core,tokens,ui}` are leftover bun-link symlinks pointing (via bun's global link store) at the **live design checkout** (verified `readlink -f` 2026-07-07 → `../design/packages/*`; still present 2026-07-08 per the workspace health-check). Nothing imports those names (grep confirms; the one hit is a doc comment in OctantDemo.tsx). Danger: an accidental `import ... from "@balaur/ui"` would typecheck and resolve against **design HEAD** — whatever unreleased state design main happens to be in (it was red for most of 2026-07-07; gate state of record: design-change-and-release §1) — and can reintroduce the dual-React crash. They are untracked node_modules artifacts; if they bite, `rm node_modules/@balaur/{octant-core,tokens,ui} && bun install` removes them (they only return if someone re-links).

## Testing policy

- Exactly **one** test today: `test/links.test.ts` — a dependency-resolution smoke (Store from balaur-memory, `bar8`/`PALETTE`/`FillButton` from octant subpath + root exports). Its name, `"linked external deps resolve through bun link"`, is **stale** — the deps are tag pins now, not links. It is also the **only** importer of `balaur-memory` in the repo.
- The SSR server, route table, WS protocol, `Conversation`, and `splitTextBlocks` have **zero test coverage**. The strict tsconfig (`strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax`) is the real net.
- New web features SHOULD add `bun:test` tests under `test/`. `splitTextBlocks` and `Conversation` are pure and cheap to test — start there.
- Gate: `bun run check` at the repo root. Change control is PR-per-phase (see **balaur-workspace-map**).

## Doc-drift ledger (what in this repo's own docs to distrust)

| Location | Stale claim | Trust instead |
|---|---|---|
| `README.md` "Parallel-dev setup" | `link:` specs + `bun link` for both deps, three `@balaur/*` design packages | Tag-pin doctrine + file:/link rules above; root `package.json` is the truth |
| `README.md` package table | Describes `balaur-design` as three linked packages, `~/Projects/...` paths | design ships as single `@balaur/octant` via git tags |
| `README.md` security model / env table | "only binds to 127.0.0.1:8080" (that's the default, `HOST`/`PORT` are env); `HOST` and `NODE_ENV` missing from the table | Config table above; server.tsx:51-52 |
| `test/links.test.ts` test name | "resolve through bun link" | pins, not links |
| `apps/web/pi-remote-web-ui.service` | `User=root`, `/root/dev/...` paths, `/usr/local/bin/bun` (doesn't exist on this box) | Historical artifact from the pi-remote-web-ui port. The deployment template of record is `infra/balaur-life.service` at the workspace root; see **balaur-run-and-operate** |
| `.gitignore` `apps/web/public/client.js{,.map}` | implies an on-disk bundle | bundle is in-memory; `apps/web/public/` doesn't exist |
| `server.tsx` biome-ignore comment (line 354) | "the pi SDK UIContext type is not exported" | `ExtensionUIContext` IS exported at pi 0.55.4; the cast survives because the impl is partial |

## Provenance and maintenance

Machine-specific facts above (ports 8080/6001/8090, `~/.bun/bin/bun`, checkout paths) apply to the dev VPS as of 2026-07-08. Re-verify drift-prone facts:

| Fact (as of 2026-07-08) | Re-verify with |
|---|---|
| HEAD `4c370cf`, no tags | `git -C /home/alex/projects/balaur/web log --oneline -1 && git tag` |
| `bun run check` green | `cd /home/alex/projects/balaur/web && bun run check` |
| Pins: octant `#9f26088` (v0.3.0), memory `#64c0542` (v0.4.3) — while memory HEAD sits at `f1b168a` (v0.4.3+14, unreleased) | `grep -E '@balaur/octant\|balaur-memory' bun.lock \| head -4; git -C ../memory describe --tags` |
| `bunx balaur` still resolves (the pin ships the CLI; gone at memory HEAD) | `cd /home/alex/projects/balaur/web && bunx balaur --help \| head -2` |
| pi locked at 0.55.4 (`^0.55.0`) | `grep 'pi-coding-agent@' bun.lock` |
| `ExtensionUIContext` exported by pi | `grep -c ExtensionUIContext apps/web/node_modules/@mariozechner/pi-coding-agent/dist/index.d.ts` |
| Vestigial `@balaur/{octant-core,tokens,ui}` symlinks still present | `readlink node_modules/@balaur/ui 2>/dev/null \|\| echo gone` |
| Nothing imports the vestigial names | `grep -rn '@balaur/\(ui\|tokens\|octant-core\)' apps test --include='*.ts*'` |
| `auth.json` still empty (`{}`) | `cat apps/web/.balaur-agent/auth.json` |
| Route table / config vars unchanged | `grep -n 'pathname ===\|process.env' apps/web/src/server.tsx` |
| One test file | `ls test/` |
| README still carries the stale bun-link section | `grep -n 'bun link' README.md` |
