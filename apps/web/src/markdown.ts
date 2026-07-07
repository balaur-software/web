import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";

// Markdown renderer with syntax highlighting — identical setup to the original
// vanilla frontend. Runs in both Bun (SSR) and the browser (hydration) since
// `marked`/`highlight.js` are isomorphic.
const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);
marked.setOptions({ breaks: true, gfm: true });

export function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}
