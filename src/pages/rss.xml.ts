import type { APIRoute } from "astro";
import { dynamicPages } from "@/data/dynamic-pages";

export const prerender = false;

function esc(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export const GET: APIRoute = ({ site }) => {
    const base = (site?.toString() ?? "https://bjornar.dev").replace(/\/$/, "");

    const entries = Object.entries(dynamicPages.entries)
        .flatMap(([year, slugs]) =>
            Object.entries(slugs).map(([slug, page]) => ({ year, slug, page }))
        )
        .sort(
            (a, b) =>
                new Date(b.page.date).getTime() -
                new Date(a.page.date).getTime()
        );

    const items = entries
        .map(({ year, slug, page }) => {
            const url = `${base}/entries/${year}/${slug}`;
            return `    <item>
      <title>${esc(page.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(page.date).toUTCString()}</pubDate>
      <description>${esc(page.summary)}</description>
    </item>`;
        })
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bjørnar Hagen</title>
    <link>${base}</link>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Notes, experiments and mistakes documented in real-time.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
        },
    });
};
