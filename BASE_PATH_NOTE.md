# 🚀 Important: Base Path Configuration

## Current Status

The website is deployed on GitHub Pages subpath:
```
https://moaiy-com.github.io/moaiy-com/
```

To make resources load correctly, we've added `base: '/moaiy-com/'` to `astro.config.mjs`.

## When Custom Domain is Active

Once your custom domain `moaiy.com` is configured and DNS is propagated, **REMOVE** the `base` line:

```diff
// astro.config.mjs
export default defineConfig({
- base: '/moaiy-com/',  // ❌ Remove this line
  site: 'https://moaiy.com',
  // ... rest of config
});
```

## Why?

- **Subpath deployment** (current): `moaiy-com.github.io/moaiy-com/` → needs `base: '/moaiy-com/'`
- **Custom domain** (future): `moaiy.com` → no base needed

## How to Know When to Remove It?

1. Visit: https://moaiy.com
2. If it loads correctly → DNS is active
3. Remove `base` from config
4. Commit and push
5. Wait for rebuild

## Temporary URLs

- ✅ With base path: https://moaiy-com.github.io/moaiy-com/
- ⏳ Custom domain: https://moaiy.com (after DNS propagation)
