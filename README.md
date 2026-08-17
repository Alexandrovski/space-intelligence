# SPACE // INTELLIGENCE

Deployment-ready public web version of the "Bloomberg for Space" prototype.

## Local start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm start
```

## Vercel deployment

1. Create a GitHub repository for this folder.
2. Commit and push it.
3. In Vercel, create a new project and import the GitHub repository.
4. Vercel should detect Next.js automatically.
5. Deploy.
6. Optionally attach a custom domain later.

No secrets are required for the public snapshot version.

## Optional environment variables

Copy `.env.example` to `.env.local` for local development.

- `CRON_SECRET`: protects the future refresh endpoint.
- `OPENAI_API_KEY`: reserved for future AI editorial ingestion/ranking.
- `NEXT_PUBLIC_SITE_URL`: canonical public URL.

Never commit real secrets.

## Included

- Next.js App Router + TypeScript
- V0.3 mission-control dashboard mounted at `/`
- Real mission imagery and source/freshness captions
- 19 active mission and observatory cards
- 9-project future launch and arrival pipeline
- Mission-neighborhood strip and secondary orbit map
- Source-ranked snapshot and position datasets in `public/data`
- Mission, map, and pipeline filtering
- Static mission detail pages
- Primary-source outbound links
- Link-preview metadata
- Vercel cron placeholder
- No required database or credentials

The V0.3 homepage is kept as a self-contained static application in
`public/dashboard.html`. A `beforeFiles` rewrite in `next.config.ts` serves it
at `/` while preserving the Next.js mission and API routes.

## Deliberate limitation

This build does not pretend static values are live telemetry. The next phase should add source adapters that retrieve official NASA/JPL/ESA data, retain source/freshness metadata, and only then run AI summarization/ranking.

Read `CODEX_DEPLOYMENT_HANDOFF.md` before substantial changes.
