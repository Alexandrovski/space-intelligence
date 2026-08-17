# Codex Deployment Handoff

## Objective

Take this repository from deployment-ready source code to a publicly shareable website.

Product concept:

**Bloomberg Terminal × spacecraft mission control × scientific journal**

Do not turn it into a generic space-news feed.

## First action

Run:

```bash
npm install
npm run build
```

Fix any build/type errors before changing product behavior. Then run `npm run dev` and inspect `/` plus several `/missions/[slug]` routes at desktop and mobile widths.

## Publish

Preferred path:

1. Initialize Git if needed.
2. Create/push to a GitHub repo.
3. Import that repo into Vercel.
4. Deploy the production branch.
5. Return the public URL to the owner.
6. If the owner supplies a custom domain, attach it in Vercel.

Never place API keys in source control.

## Architecture

- `app/page.tsx` — public mission-control dashboard
- `app/missions/[slug]/page.tsx` — mission terminal pages
- `components/MissionBoard.tsx` — client-side filtering
- `data/missions.ts` — curated mission snapshot
- `data/updates.ts` — editorial/update snapshot
- `app/api/cron/refresh/route.ts` — safe placeholder for scheduled ingestion
- `vercel.json` — once-daily cron schedule
- `.env.example` — future config contract

## Product rules

### Primary-source rigor
Mission facts should come first from NASA, JPL, ESA, or another relevant mission agency.

Every dynamic fact should eventually carry:
- source URL
- retrieved timestamp
- published/captured timestamp when available
- freshness class
- confidence/parsing status when extraction is imperfect

### Never fake "live"
Use deliberately:
- LIVE
- NEAR-LIVE
- LATEST DOWNLINK
- LATEST RELEASE
- SNAPSHOT

Do not call ordinary web updates telemetry.

### AI can do a lot, but only after retrieval
AI should summarize, rank significance, explain why something matters, connect missions/science, and select deeper reading.

AI should not invent mission state, infer precise trajectories without ephemerides, silently rewrite primary-source facts, or blur reporting with interpretation.

Keep visible distinctions between SOURCE DATA, AI SUMMARY, AI INTERPRETATION, and EDITORIAL RECOMMENDATION.

## Recommended V1.1: Perseverance vertical slice

Before adapters for every mission, do one mission deeply.

Add:
- current sol
- latest official/raw image
- camera/instrument
- capture timestamp
- image source URL
- recent official science updates
- traverse/location
- recent timeline
- AI significance scoring
- next known milestone when sourced
- curated long reads

Persist retrieval metadata. Once the contract is strong, generalize to Curiosity, Webb, Hubble, Voyager, JUICE, Europa Clipper, Psyche, Lucy, Parker, and New Horizons.

## Infrastructure evolution

Do not add infrastructure until needed:
1. Static TypeScript data (current).
2. Official source adapters + server routes.
3. Persistence (managed Postgres or equivalent).
4. Vercel cron ingestion.
5. OpenAI-backed summarization/ranking.
6. Optional digest/alerts.

## Homepage intelligence goal

In under 30 seconds the homepage should answer:
- What are the 3 things worth knowing in space today?
- What new image is actually worth seeing?
- Which mission is approaching a meaningful milestone?
- What changed our mental model versus merely generating a press release?

## Visual direction

Preserve:
- dark neutral background
- compact typography
- restrained semantic color
- dense information
- large imagery only where scientifically useful
- readable mobile layout

Avoid generic SaaS styling, giant marketing heroes, childish rocket art, fake terminal complexity, and card bloat.

## Environment variables

None required for static deployment.

Future:
- `CRON_SECRET`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

Configure secrets inside Vercel rather than committing them.

## Definition of success

- `npm run build` succeeds
- production URL loads publicly
- dashboard works on phone and desktop
- mission detail links work
- official outbound links work
- no secrets exist in repo history
- GitHub → Vercel auto-deploy is enabled
