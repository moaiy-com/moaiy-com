import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const distRoot = path.join(repoRoot, 'dist');

const knownBlockedHosts = new Set([
  'api.moaiy.com',
  'get.moaiy.com',
]);

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

async function walkHtmlFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkHtmlFiles(absolutePath)));
      continue;
    }
    if (entry.name.endsWith('.html')) {
      files.push(absolutePath);
    }
  }

  return files;
}

function routeFromHtmlFile(filePath) {
  const relative = toPosix(path.relative(distRoot, filePath));
  if (relative === 'index.html') {
    return '/';
  }
  if (relative.endsWith('/index.html')) {
    return `/${relative.replace(/\/index\.html$/, '')}/`;
  }
  return `/${relative}`;
}

function extract(content, regex) {
  const match = content.match(regex);
  return match?.[1]?.trim() ?? '';
}

function extractAllHrefs(content) {
  const matches = content.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g);
  return Array.from(matches, (match) => match[1]);
}

function normalizeLink(href) {
  const [withoutHash] = href.split('#');
  const [withoutQuery] = withoutHash.split('?');
  return withoutQuery;
}

function checkInternalTarget(href) {
  const normalized = normalizeLink(href);
  if (normalized === '' || normalized === '/') {
    return existsSync(path.join(distRoot, 'index.html'));
  }
  if (normalized.endsWith('/')) {
    return existsSync(path.join(distRoot, normalized, 'index.html'));
  }
  if (path.extname(normalized)) {
    return existsSync(path.join(distRoot, normalized));
  }
  return existsSync(path.join(distRoot, normalized, 'index.html'));
}

function isIndexable(content) {
  const robots = extract(content, /<meta\s+name="robots"\s+content="([^"]+)"/i).toLowerCase();
  return !robots.includes('noindex');
}

async function main() {
  const issues = [];

  if (!existsSync(distRoot)) {
    console.error('SEO check requires a built site at ./dist. Run `pnpm build` first.');
    process.exit(1);
  }

  const robotsPath = path.join(distRoot, 'robots.txt');
  if (!existsSync(robotsPath)) {
    issues.push('dist/robots.txt is missing');
  } else {
    const robotsContent = await readFile(robotsPath, 'utf8');
    if (!/Sitemap:\s+https:\/\/moaiy\.com\/sitemap\.xml/i.test(robotsContent)) {
      issues.push('dist/robots.txt is missing https://moaiy.com/sitemap.xml directive');
    }
    if (!/Sitemap:\s+https:\/\/moaiy\.com\/sitemap-index\.xml/i.test(robotsContent)) {
      issues.push('dist/robots.txt is missing https://moaiy.com/sitemap-index.xml directive');
    }
  }

  if (!existsSync(path.join(distRoot, 'sitemap.xml'))) {
    issues.push('dist/sitemap.xml is missing');
  }
  if (!existsSync(path.join(distRoot, 'sitemap-index.xml'))) {
    issues.push('dist/sitemap-index.xml is missing');
  }

  const htmlFiles = await walkHtmlFiles(distRoot);

  const titles = new Map();
  const descriptions = new Map();
  const canonicalUrls = new Map();
  const ogUrls = new Map();

  for (const filePath of htmlFiles) {
    const relative = toPosix(path.relative(repoRoot, filePath));
    const route = routeFromHtmlFile(filePath);
    const content = await readFile(filePath, 'utf8');
    const indexable = isIndexable(content);

    const title = extract(content, /<title>([^<]*)<\/title>/i);
    const description = extract(content, /<meta\s+name="description"\s+content="([^"]*)"/i);
    const canonical = extract(content, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
    const ogUrl = extract(content, /<meta\s+property="og:url"\s+content="([^"]+)"/i);
    const h1Count = (content.match(/<h1\b/gi) || []).length;
    const jsonLdCount = (content.match(/<script[^>]*type="application\/ld\+json"/gi) || []).length;

    if (indexable) {
      if (!title) {
        issues.push(`${relative}: missing <title>`);
      }
      if (!description) {
        issues.push(`${relative}: missing meta description`);
      }
      if (!canonical) {
        issues.push(`${relative}: missing canonical link`);
      }
      if (!ogUrl) {
        issues.push(`${relative}: missing og:url`);
      }
      if (h1Count !== 1) {
        issues.push(`${relative}: expected exactly one <h1>, found ${h1Count}`);
      }
      if (jsonLdCount < 1) {
        issues.push(`${relative}: missing JSON-LD schema`);
      }

      if (canonical && !canonical.startsWith('https://moaiy.com/')) {
        issues.push(`${relative}: canonical must be absolute on https://moaiy.com`);
      }
      if (ogUrl && !ogUrl.startsWith('https://moaiy.com/')) {
        issues.push(`${relative}: og:url must be absolute on https://moaiy.com`);
      }
      if (canonical && ogUrl && canonical !== ogUrl) {
        issues.push(`${relative}: canonical and og:url must match`);
      }

      if (canonical?.endsWith('/') && route !== '/' && !route.endsWith('/')) {
        issues.push(`${relative}: route should end with trailing slash to match canonical strategy`);
      }

      if (titles.has(title)) {
        issues.push(`${relative}: duplicate title also used in ${titles.get(title)}`);
      } else if (title) {
        titles.set(title, relative);
      }

      if (descriptions.has(description)) {
        issues.push(`${relative}: duplicate description also used in ${descriptions.get(description)}`);
      } else if (description) {
        descriptions.set(description, relative);
      }

      if (canonicalUrls.has(canonical)) {
        issues.push(`${relative}: duplicate canonical URL also used in ${canonicalUrls.get(canonical)}`);
      } else if (canonical) {
        canonicalUrls.set(canonical, relative);
      }

      if (ogUrls.has(ogUrl)) {
        issues.push(`${relative}: duplicate og:url also used in ${ogUrls.get(ogUrl)}`);
      } else if (ogUrl) {
        ogUrls.set(ogUrl, relative);
      }
    }

    const hrefs = extractAllHrefs(content);
    for (const href of hrefs) {
      if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }
      if (href.startsWith('/')) {
        if (!checkInternalTarget(href)) {
          issues.push(`${relative}: internal link target not found for ${href}`);
        }
        continue;
      }
      if (href.startsWith('http://') || href.startsWith('https://')) {
        let host = '';
        try {
          host = new URL(href).host;
        } catch {
          issues.push(`${relative}: invalid absolute URL ${href}`);
          continue;
        }
        if (knownBlockedHosts.has(host)) {
          issues.push(`${relative}: blocked external host is still referenced (${host})`);
        }
        continue;
      }

      issues.push(`${relative}: unsupported href format ${href}`);
    }
  }

  if (issues.length > 0) {
    console.error('SEO check failed with the following issues:');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log('SEO check passed.');
}

main().catch((error) => {
  console.error('SEO check execution failed:', error);
  process.exit(1);
});
