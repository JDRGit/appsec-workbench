# Deploying On Render

This repository now includes a [`render.yaml`](../render.yaml) Blueprint for the current prototype.

## What it creates

- `appsec-workbench-web`: a Render static site for the React + Vite frontend
- `appsec-workbench-api`: a Render Node web service for the NestJS API

The API service uses a small persistent disk and seeds the current demo SQLite database on first boot. This is intentional for the live prototype, so the hosted demo can come up with sample findings without needing Postgres yet.

## Important caveat

This Render setup is for the current interactive prototype only.

- The live demo API still uses the temporary SQLite slice in [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma).
- The long-term production direction for this project is still the main PostgreSQL model in [`prisma/schema.prisma`](../prisma/schema.prisma), plus Redis/BullMQ and object storage.

When the ingestion pipeline is ready, the next hosting upgrade should be:

1. replace the prototype SQLite API datastore with Render Postgres
2. add a Render background worker for parsing jobs
3. add Render Key Value or another Redis-compatible store for BullMQ

## Deploy steps

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and point it at the repo.
3. Review the two services from [`render.yaml`](../render.yaml).
4. If you change the default service names, update:
   - `CORS_ORIGIN` for the API
   - `VITE_API_URL` for the web service
5. Deploy the Blueprint.

## Runtime behavior

- The API exposes a health endpoint at `/api/health`.
- The API binds to `0.0.0.0` and accepts local plus configured `CORS_ORIGIN` values.
- The frontend static site rewrites all routes to `/index.html`, which is required for the React Router prototype.

## Local-to-Render mapping

- Local web: `http://127.0.0.1:4173`
- Local API: `http://127.0.0.1:3000`
- Render web: `https://appsec-workbench-web.onrender.com`
- Render API: `https://appsec-workbench-api.onrender.com`
