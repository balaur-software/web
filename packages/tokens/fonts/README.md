# Fonts

## departure-mono.woff2

**Departure Mono** by [Helena Zhang](https://departuremono.com/).

Departure Mono is free for personal and commercial use per its license
(see https://departuremono.com/ for the full terms). This directory ships a
self-hosted copy so `@balaur/tokens` has zero external/runtime dependencies.

### Mirror source

Downloaded from:

```
https://cdn.jsdelivr.net/gh/projectnoonnu/2409-1@1.0/DepartureMono-Regular.woff2
```

Stored locally as `departure-mono.woff2` (valid WOFF2, ~14 KB). If the file is
missing, re-fetch it:

```
curl -sSL -o fonts/departure-mono.woff2 \
  "https://cdn.jsdelivr.net/gh/projectnoonnu/2409-1@1.0/DepartureMono-Regular.woff2"
```

Referenced by `../src/tokens.css` via `@font-face` as
`../fonts/departure-mono.woff2` (relative to the CSS file) with
`font-display: swap`.
