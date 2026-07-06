import { renderToReadableStream } from "react-dom/server";
import { Document } from "./Document.tsx";

const dir = import.meta.dir;

// Build the client hydration bundle once at startup with Bun's own bundler — no Vite.
const clientBuild = await Bun.build({
  entrypoints: [`${dir}/client.tsx`],
  target: "browser",
  minify: process.env.NODE_ENV === "production",
});
if (!clientBuild.success) {
  console.error(clientBuild.logs);
  throw new Error("client bundle failed to build");
}
const clientJs = await clientBuild.outputs[0]!.text();

// Resolve the token stylesheet + self-hosted font from the workspace.
const tokensCssPath = Bun.resolveSync("@balaur/tokens/tokens.css", dir);
const fontPath = Bun.resolveSync("@balaur/tokens/fonts/departure-mono.woff2", dir);

const port = Number(process.env.PORT ?? 3000);

const server = Bun.serve({
  port,
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (pathname === "/client.js") {
      return new Response(clientJs, { headers: { "content-type": "text/javascript; charset=utf-8" } });
    }
    if (pathname === "/tokens.css") {
      return new Response(Bun.file(tokensCssPath), {
        headers: { "content-type": "text/css; charset=utf-8" },
      });
    }
    if (pathname === "/fonts/departure-mono.woff2") {
      return new Response(Bun.file(fontPath), { headers: { "content-type": "font/woff2" } });
    }
    if (pathname === "/") {
      const stream = await renderToReadableStream(<Document />, { bootstrapModules: ["/client.js"] });
      return new Response(stream, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response("not found", { status: 404 });
  },
});

console.log(`OCTANT SSR → http://localhost:${server.port}`);
