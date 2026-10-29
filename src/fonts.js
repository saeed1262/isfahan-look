// The bundled fonts as data URLs, inlined into main.js by the build
// (esbuild's dataurl loader). Obsidian installs only a plugin's main.js,
// manifest.json and styles.css, so a fonts folder beside them would never
// arrive; inlined, nothing loads from the network either. Their licences:
// src/fonts/OFL.txt, also copied into main.js's opening comment.
import cormorant from "./fonts/cormorant-garamond-latin-600-normal.woff2";
import cormorantItalic from "./fonts/cormorant-garamond-latin-500-italic.woff2";
import literata from "./fonts/literata-latin-wght-normal.woff2";
import literataItalic from "./fonts/literata-latin-wght-italic.woff2";

export const FONT_URLS = {
  "cormorant-garamond-latin-600-normal.woff2": cormorant,
  "cormorant-garamond-latin-500-italic.woff2": cormorantItalic,
  "literata-latin-wght-normal.woff2": literata,
  "literata-latin-wght-italic.woff2": literataItalic,
};
