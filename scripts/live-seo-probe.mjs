const DEFAULT_URLS = [
  'https://moaiy.com/robots.txt',
  'https://moaiy.com/sitemap.xml',
  'https://moaiy.com/sitemap-index.xml',
  'https://moaiy.com/download/',
];

const WARNING_STATUSES = new Set([403, 429]);
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 SEO-Monitor/1.0';

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyStatus(status) {
  if (status >= 200 && status < 400) {
    return 'pass';
  }
  if (WARNING_STATUSES.has(status)) {
    return 'warn';
  }
  return 'fail';
}

async function probeWithRetry(url, options) {
  const { maxRetries, retryDelayMs, timeoutMs } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);

    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': USER_AGENT,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeout);
      return { response, attempt };
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      if (attempt < maxRetries) {
        console.warn(`[live-seo-probe] RETRY ${attempt}/${maxRetries} ${url} -> ${error.message}`);
        await sleep(retryDelayMs);
      }
    }
  }

  throw lastError;
}

async function main() {
  const urls =
    process.env.SEO_PROBE_URLS?.split(',')
      .map((item) => item.trim())
      .filter(Boolean) ?? DEFAULT_URLS;
  const maxRetries = parsePositiveInt(process.env.SEO_PROBE_RETRIES, 3);
  const retryDelayMs = parsePositiveInt(process.env.SEO_PROBE_RETRY_DELAY_MS, 1000);
  const timeoutMs = parsePositiveInt(process.env.SEO_PROBE_TIMEOUT_MS, 10000);

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const url of urls) {
    try {
      const { response, attempt } = await probeWithRetry(url, {
        maxRetries,
        retryDelayMs,
        timeoutMs,
      });
      const status = response.status;
      const category = classifyStatus(status);
      const server = response.headers.get('server') ?? '-';
      const cfRay = response.headers.get('cf-ray') ?? '-';

      if (category === 'pass') {
        passCount += 1;
        console.log(
          `[live-seo-probe] PASS ${status} ${url} (attempt=${attempt} server=${server} cf-ray=${cfRay})`,
        );
        continue;
      }

      if (category === 'warn') {
        warnCount += 1;
        console.warn(
          `[live-seo-probe] WARN ${status} ${url} (attempt=${attempt} server=${server} cf-ray=${cfRay})`,
        );
        continue;
      }

      failCount += 1;
      console.error(
        `[live-seo-probe] FAIL ${status} ${url} (attempt=${attempt} server=${server} cf-ray=${cfRay})`,
      );
    } catch (error) {
      failCount += 1;
      console.error(`[live-seo-probe] FAIL network ${url} -> ${error.message}`);
    }
  }

  console.log(`[live-seo-probe] Summary: pass=${passCount} warn=${warnCount} fail=${failCount}`);

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

await main();

