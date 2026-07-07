import { App } from "./App.tsx";

const FAVICON =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>";

/**
 * The full HTML document rendered on the server. The interactive chat UI lives
 * under `#root`, which the client bundle hydrates. Styles are served as static
 * routes by the Bun server (see `server.tsx`).
 */
export function Document() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>pi-remote-web-ui</title>
        <link rel="icon" href={FAVICON} />
        <link rel="stylesheet" href="/hljs.css" />
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <div id="root">
          <App />
        </div>
      </body>
    </html>
  );
}
