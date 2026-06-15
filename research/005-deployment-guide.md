---
topic: infrastructure
type: guide
status: research-complete
last-validated: 2026-06-14
related-docs: [001, 003]
original-query: "loop - prep for deployment; hosting = match zaoos stack (Supabase + Vercel)"
tier: STANDARD
---

# 005 - Deployment Guide (zingfisher)

> **Goal:** Ship the ZAO learning center. The webapp build is verified (doc 003 + iter 14: `next build` succeeds, 8/8 pages). This is how to get it live on the zaoos-matched stack.

## Key Decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | Postgres on **Supabase**, webapp on **Vercel** - match the zaoos stack | Zaal's call; consistent with the rest of the ZAO estate. |
| 2 | Run **websockets** + **cron** on a separate Node host (Railway / Render / Fly), NOT Vercel | These are long-running processes. Vercel's serverless model can't host the persistent websocket server or the cron worker. This is the one place zingfisher diverges from a pure-Vercel ZAO app. |
| 3 | DB schema is owned by `@charmverse/core` - run its prisma migrate, not a local schema | `npx prisma migrate deploy` runs inside `node_modules/@charmverse/core` (see root package.json `prisma:deploy`). |

## The three processes

| App | Script | Host | Notes |
|-----|--------|------|-------|
| `apps/webapp` | `npm run build -w apps/webapp` / `start` | Vercel | Next.js 15. Build verified. |
| `apps/websockets` | `npm run sockets:build` / `sockets:remote` | Railway/Render | PORT 3336. Realtime. |
| `apps/cron` | `npm run cron:build` / `cron:prod` | Railway/Render worker | Scheduled jobs. |

(Upstream also ships AWS CDK + Elastic Beanstalk configs under `.cdk`, `.ebextensions`, `.platform` for all three - a heavier alternative if you'd rather stay on AWS.)

## Required env vars

Core (from `.env.example`):

| Var | Purpose |
|-----|---------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase Postgres connection string |
| `AUTH_SECRET` | session signing secret (generate a strong random value) |
| `DOMAIN` | public URL, e.g. `https://learn.thezao.com` |
| `REACT_APP_WEBSOCKETS_HOST` | URL of the deployed websockets app |
| `NEXT_TELEMETRY_DISABLED` | `1` |

Feature env (add as features are turned on): `NEYNAR_API_KEY` + SIWF domain (Farcaster login), Base/Optimism RPC URLs (the Respect gate uses public RPCs by default but a dedicated provider like Alchemy is recommended for production), and any AWS/S3 creds if file uploads are enabled.

## Deploy steps

1. **Supabase**: create a project, grab the Postgres connection string -> `DATABASE_URL`.
2. **Migrate**: from the repo, `npx prisma migrate deploy` (runs via `@charmverse/core`). The Prisma client is generated on `npm ci` postinstall.
3. **Websockets + cron**: deploy `apps/websockets` and `apps/cron` to Railway/Render with the env vars. Note the websockets public URL.
4. **Webapp on Vercel**: set root to the repo, build command `npm run build -w apps/webapp`, set all env vars incl `REACT_APP_WEBSOCKETS_HOST` = the websockets URL.
5. **Domain**: point `learn.thezao.com` (TBC) at Vercel; set `DOMAIN`.
6. **Smoke test**: `/` (login) and `/learn` (the hub). `/learn` is static; `/api/zao/membership?address=0x...` exercises the Respect gate.

## Open items (need Zaal)

- Real secrets: Supabase URL + keys, `AUTH_SECRET`, Neynar key.
- The domain (`learn.thezao.com`?).
- Confirm the Base member gate ($ZABAL vs a dedicated Respect-on-Base) before relying on member-gated tracks in production.

## Next Actions

| Action | Owner | Type | By When |
|--------|-------|------|---------|
| Create Supabase project + run prisma migrate deploy | @Zaal | Task | Before deploy |
| Deploy websockets + cron to Railway/Render | @Zaal | Task | Before deploy |
| Deploy webapp to Vercel with env wired | @Zaal | Task | Before deploy |
| Pick + point the domain | @Zaal | Decision | Before launch |

## Sources

- `.env.example` (6 core vars) + root package.json scripts (cron/sockets/prisma). [FULL]
- Doc 003 (build verification) - `next build` succeeds. [FULL]
- zaoos README - the Supabase + Vercel + Farcaster estate stack. [FULL]
