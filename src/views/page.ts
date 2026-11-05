import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

// The shell every HTML page uses, on both Workers: the shield's own pages and
// fragile-origin's /stopdos pages. Styles live in public/static/site.css, which
// the shield serves; browsers only ever reach fragile-origin through the shield.

export const SITE_NAME = "foobar";
export const SOURCE_URL = "https://github.com/Rusty-Magnet-Ltd/cloudflare_worker";
export const HOME_URL = "https://rustymagnet.xyz/";

type Content = HtmlEscapedString | Promise<HtmlEscapedString>;

// The rustymagnet.xyz horseshoe mark
const mark = raw(
  `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">` +
    `<g fill="none" stroke-width="7" transform="translate(18.2 18.15) rotate(-35) translate(-16 -16)">` +
    `<path class="mark-body" d="M7.5 10v6.5a8.5 8.5 0 0 0 17 0V10"/>` +
    `<path class="mark-tips" d="M7.5 4v6M24.5 4v6"/>` +
    `</g></svg>`
);

// title is escaped; content and head must already be markup (JSX or an html`` template).
// head goes at the end of <head>, for the odd page that needs more there.
export function page(title: string, content: Content, head: Content | "" = "") {
  return html`<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#f7f4ef" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#12100e" media="(prefers-color-scheme: dark)">
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/site.css">${head}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="/">${mark}<span>${SITE_NAME}</span></a>
      <nav class="site-nav" aria-label="Main">
        <a href="/#routes">Routes</a>
        <a href="${SOURCE_URL}">Source</a>
      </nav>
    </div>
  </header>
  <main id="main" class="wrap">
${content}
  </main>
  <footer class="site-footer">
    <div class="wrap footer-inner">
      <p>Part of <a href="${HOME_URL}">rustymagnet.xyz</a></p>
      <p><a href="${SOURCE_URL}">Source on GitHub</a></p>
    </div>
  </footer>
</body>
</html>
`;
}
