# Deploying The Frontend On Cloudflare Pages

This is the best no-credit-card deployment path for the current prototype.

## Recommended mode

Use Cloudflare Pages to host only the frontend in [`apps/web`](../apps/web).

The current API can stay local for development, or the hosted frontend can run in prototype mode until the backend is moved to a host that fits your comfort level.

## Cloudflare Pages project settings

When creating the Pages project from GitHub, use:

- Framework preset: `Vite`
- Root directory: `apps/web`
- Build command: `npm run build`
- Build output directory: `dist`

Do not use `npx wrangler deploy` as the Pages build command from the repo root. This repository is a monorepo, and Wrangler's workspace detection will fail if it runs from the wrong directory.

## SPA routing

The frontend now includes [`apps/web/public/_redirects`](../apps/web/public/_redirects), which tells Cloudflare Pages to rewrite all routes to `index.html` so React Router works on reload and direct links.

## Direct upload script

For manual deployments from your machine, use:

```bash
CLOUDFLARE_PAGES_PROJECT_NAME=appsec-workbench-web npm run deploy:cloudflare:web
```

Optional:

```bash
CLOUDFLARE_PAGES_BRANCH=preview CLOUDFLARE_PAGES_PROJECT_NAME=appsec-workbench-web npm run deploy:cloudflare:web
```

The script:

1. builds the Vite app
2. runs `wrangler pages deploy dist`
3. fails early with a clear message if `CLOUDFLARE_PAGES_PROJECT_NAME` is missing

## Notes

- This deploy path is frontend-only.
- The app still points at `VITE_API_URL` when you provide one.
- If no live API is available, parts of the prototype will fall back to local demo data.
