import type { APIRoute } from 'astro';
import { pageSeo } from '../seo/page-config';

const staticPaths = Array.from(
  new Set(
    Object.values(pageSeo)
      .map((entry) => entry.canonicalPath)
      .filter((path) => path !== '/404/'),
  ),
);

function toAbsoluteUrl(base: URL, pagePath: string) {
  const normalized = pagePath === '/' ? '/' : pagePath.endsWith('/') ? pagePath : `${pagePath}/`;
  return new URL(normalized, base).toString();
}

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL('https://moaiy.com');
  const lastMod = new Date().toISOString();

  const urlEntries = staticPaths
    .map((pagePath) => {
      const absoluteUrl = toAbsoluteUrl(baseUrl, pagePath);
      return [
        '  <url>',
        `    <loc>${absoluteUrl}</loc>`,
        `    <lastmod>${lastMod}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        pagePath === '/download/' || pagePath === '/' ? '    <priority>1.0</priority>' : '    <priority>0.7</priority>',
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
