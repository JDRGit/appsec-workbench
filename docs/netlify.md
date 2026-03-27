# Deploying On Netlify

This repository is now configured for Netlify frontend deployment.

## Recommended deployment target

Deploy only the React frontend in [`apps/web`](../apps/web).

The current NestJS API is still a local prototype service and is not structured for Netlify Functions yet, so the best portfolio deployment right now is the frontend-only experience with demo-data fallback where needed.

## Repo configuration

The root [`netlify.toml`](../netlify.toml) configures this monorepo for Netlify:

- base directory: `apps/web`
- build command: `npm run build`
- publish directory: `dist`

The React Router SPA fallback is already handled by [`apps/web/public/_redirects`](../apps/web/public/_redirects).

## Netlify dashboard settings

If you connect the GitHub repo in Netlify, these are the settings to use:

- Base directory: `apps/web`
- Build command: `npm run build`
- Publish directory: `dist`

If Netlify detects the root [`netlify.toml`](../netlify.toml), these should already line up automatically.

## Optional CLI deploy

Preview deploy:

```bash
npm run deploy:netlify:web
```

Production deploy:

```bash
npm run deploy:netlify:web:prod
```

These run the frontend build first, then call the Netlify CLI against `apps/web/dist`.

## Notes

- The frontend build is Vite-based.
- Deep links and page refreshes should work because Netlify supports the SPA rewrite rule in `_redirects`.
- If you want a fully live backend later, that should be hosted separately or refactored into Netlify Functions.
