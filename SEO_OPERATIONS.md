# SEO Operations Runbook

## Scope

This runbook covers off-repo SEO operations that should be executed after each production deployment.

Repository automation:

- `deploy.yml` runs `pnpm run check:seo` after build.
- `seo-monitor.yml` runs weekly and probes live SEO endpoints.

## Search Console Setup

1. Add and verify `https://moaiy.com` in Google Search Console.
2. Add and verify `https://moaiy.com` in Bing Webmaster Tools.
3. Submit sitemap: `https://moaiy.com/sitemap-index.xml`.
4. Re-run URL inspection for:
   - `/`
   - `/download/`
   - `/docs/`
   - `/security/`

## Conversion Tracking

The site emits the following GA4 events from `data-analytics-event` links:

- `download_click`
- `docs_cta_click`
- `github_click`

Recommended GA4 setup:

1. Register the three events as key events/conversions.
2. Build an organic-only funnel:
   - Landing page view
   - `docs_cta_click`
   - `download_click`
3. Segment by source/medium = organic search.

## External Distribution Tasks

Execute manually during each release cycle:

1. Update GitHub repository description and social links to match site messaging.
2. Publish release summary and backlink to:
   - `https://moaiy.com/docs/`
   - `https://moaiy.com/download/`
3. Submit/update listings in relevant open-source/privacy software directories.

## Acceptance Checklist

- `robots.txt` is publicly reachable.
- `sitemap-index.xml` is publicly reachable.
- Main pages are indexed and have canonical URLs respected.
- Organic download and docs click events are visible in GA4.
