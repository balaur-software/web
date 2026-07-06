import { App } from "./App.tsx";

/**
 * The full HTML document rendered on the server. The interactive app lives under
 * `#root`, which the client bundle hydrates. `tokens.css` (and, transitively, the
 * self-hosted font) is linked from the workspace token package.
 */
export function Document() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>OCTANT · balaur-life</title>
        <link rel="stylesheet" href="/tokens.css" />
      </head>
      <body style={{ margin: 0, background: "#08080a" }}>
        <div id="root">
          <App />
        </div>
      </body>
    </html>
  );
}
