---
topic: infrastructure
type: decision
status: research-complete
last-validated: 2026-06-14
related-docs: []
original-query: "https://github.com/KingfishersMediaLLC/kfmedia-learning-center /zao-research - push all we learn to bettercallzaal/zingfisher, we want to make a replica for the ZAO"
tier: STANDARD
---

# 001 - Forking CharmVerse for a ZAO Learning Center (zingfisher)

> **Goal:** Decide how to build a ZAO-branded replica of the KFMEDIA learning center. That repo is a rebranded fork of CharmVerse, the all-in-one DAO Space platform. This doc maps the stack, the license terms, and the exact branding-only change set to copy.

## Key Decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | FORK the upstream `charmverse/app.charmverse.io`, NOT the KFMEDIA fork | KFMEDIA fork carries their brand assets (red/gold, Montserrat, KFMEDIA logos) we would have to undo. Starting from upstream means one rebrand pass, not a rebrand-then-un-rebrand. KFMEDIA's `CHANGES.md` gives us the exact file list to touch. |
| 2 | LICENSE is AGPL-3.0 - a ZAO replica is legal IF we keep it AGPL and strip the CharmVerse trademark | License is AGPL v3 plus a trademark clause: the "CharmVerse" mark needs written approval. Code is free to fork; the name is not. We must rebrand all "CharmVerse" strings to ZAO and ship an AGPL Section 13 source-access notice. |
| 3 | COPY the KFMEDIA branding-only playbook exactly - touch ~7 surfaces, leave core untouched | KFMEDIA changed only theme colors, fonts, favicons, header logo, landing copy, footer links, plus a CHANGES.md. Schema, APIs, auth, feature logic all stayed upstream. Lowest-risk path to a working ZAO instance. |
| 4 | Budget for a real backend - this is NOT a static site | CharmVerse needs PostgreSQL + Prisma (`@charmverse/core`), a websockets app, and a cron app. 197 root deps, ~12M lines TypeScript, 313 MB repo. Hosting via AWS CDK / Elastic Beanstalk in upstream. Plan infra before promising a live ZAO instance. |

## What the repo actually is

`KingfishersMediaLLC/kfmedia-learning-center` (description: "Online version of our learning center") is a rebranded copy of **CharmVerse** - "The all-in-one Space for DAOs" (NorthShore.ai Inc.). The README is verbatim CharmVerse upstream. KFMEDIA's `CHANGES.md` confirms it: an automated rebrand started 2026-03-21, branding finished 2026-04-22.

CharmVerse is a DAO operations suite: docs/wiki, Notion-style databases, member directory, proposals, votes, rewards/bounties, forum, on-chain credentials, token gating, and Farcaster integration. For a ZAO "learning center" the relevant surfaces are the **block editor (docs/courses)**, **databases (course catalog / member tracking)**, **member directory**, and **token gating** (gate content to ZAO holders).

## Findings

### Stack (current as of 2026-06-14, repo pushed 2026-05-13)

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js | ^15.3.2 |
| UI runtime | React | 19.1 |
| Components | MUI (Material UI) | ^7.1.0 |
| Web3 | wagmi / viem | ^2.14.9 / ^2.22.17 |
| ORM / DB | Prisma via `@charmverse/core` -> PostgreSQL | (core pkg owns schema) |
| Editor | ProseMirror / BangleEditor (`packages/charmeditor`, `packages/bangleeditor`) | - |
| Monorepo | npm workspaces: `apps/*` + `packages/*` | - |

- **Apps (3):** `webapp` (Next.js frontend + API), `websockets` (realtime, runs on PORT 3336), `cron` (scheduled jobs).
- **Packages (27):** including `charmeditor`, `databases`, `credentials`, `farcaster`, `spaces`, `subscriptions`, `permissions`, `profile`, `users`, `blockchain`, `core`, `lib`, `nextjs`.
- **Webapp component domains:** `proposals`, `rewards`, `forum`, `members`, `votes`, `credentials`, `nexus`, `settings`, `login`, `invite`, `signing`, `admin`.
- DB schema lives in `@charmverse/core` (a published npm package), so Prisma commands run inside `node_modules/@charmverse/core` - schema is not in the app repo root.

### License - the legal gate (verified 2026-06-14, /LICENSE)

The `LICENSE` file is CharmVerse / NorthShore.ai's dual policy:
1. **GNU AGPL v3.0** (with exceptions), OR
2. A commercial license via hello@charmverse.io.

Plus a **trademark clause**: use of the "CharmVerse" mark needs prior written approval.

What this means for the ZAO replica:
- Forking and modifying the code is allowed under AGPL.
- AGPL Section 13: because users interact over a network, we MUST offer the modified source to those users at no charge (KFMEDIA did this via `CHANGES.md` + a public repo).
- We MUST strip the "CharmVerse" trademark from all branding. Rebrand to ZAO.
- The ZAO fork itself must stay AGPL-3.0 (copyleft - cannot close-source it).

### The branding-only change set (KFMEDIA's CHANGES.md = our checklist)

KFMEDIA explicitly states: "All core functionality, database schema, API endpoints, authentication, and feature logic remain from the original CharmVerse codebase. Modifications are limited to visual branding, copy, and public-facing links." The exact surfaces they touched, which we replicate with ZAO assets:

| Surface | File | ZAO change |
|---------|------|------------|
| Brand font | `apps/webapp/.../  _document.tsx` | ZAO font (KFMEDIA used Montserrat via Google Fonts) |
| Theme colors | `apps/webapp/theme/colors.ts`, `apps/webapp/theme/index.ts` | ZAO palette (KFMEDIA: primary #903235, secondary #E6A23A) |
| Favicons / app icons | `favicon.ico`, `apple-touch-icon.png` (180x180), `android-chrome-192x192.png`, `android-chrome-512x512.png` | ZAO icon set |
| Header logo | header component | ZAO logo (KFMEDIA used text-based wordmark) |
| Landing copy | `LoginPageContent.tsx` | ZAO mission title + subtitle, ZAO artwork |
| Footer links | footer component | ZAO Telegram / X / email / website |
| AGPL notice | `CHANGES.md` | ZAO modification log + Section 13 source offer |

KFMEDIA also logged a "Rebrand Fallout Fix" (2026-04-19): an automated find-replace broke `@charmverse/core` package imports and internal hook/component names. **Lesson: do not blind find-replace "charmverse" everywhere** - the package name `@charmverse/core` is a real npm dependency and must stay intact. Only rebrand user-facing strings and assets.

### Infra reality

- `docker-compose.yml` + Dockerfile present; local dev needs Postgres (Docker one-liner in README).
- Deploy tooling is AWS CDK (`.cdk`, `cdk.json`, `cdk.out.json`) + Elastic Beanstalk (`.ebextensions`, `.platform`, `.ebstalk.apps.env`) with staging/prod stages.
- Three processes to run/host: webapp, websockets, cron. This is heavier than the typical ZAO static-site + Vercel-edge pattern. A ZAO instance needs a managed Postgres + a Node host that supports long-running websockets (Vercel alone will not host the websockets app).

## Recommended build path

1. Fork `charmverse/app.charmverse.io` upstream into `bettercallzaal/zingfisher` (or keep this repo as the docs/decision home and fork separately).
2. Stand up local dev: Postgres via Docker, `npm ci`, `npx prisma migrate dev`, `npm start`. Confirm it boots before any rebrand.
3. Apply the 7-surface ZAO rebrand from the table above. Keep `@charmverse/core` imports untouched.
4. Decide hosting: managed Postgres (Supabase/RDS) + a Node host for webapp+websockets+cron (Railway/Render/EB), NOT Vercel-only.
5. Configure token gating to ZAO membership for course/content access.
6. Add ZAO `CHANGES.md` with AGPL Section 13 source offer.

## Also See

- (none yet - first doc in this repo)

## Next Actions

| Action | Owner | Type | By When |
|--------|-------|------|---------|
| Decide: fork upstream CharmVerse vs build on KFMEDIA fork (recommend upstream) | @Zaal | Decision | Before any code |
| Fork upstream + boot locally with Postgres, confirm green before rebrand | @Zaal | Task | Next session |
| Prepare ZAO brand asset pack (logo, favicons, palette, font) for the 7-surface rebrand | @Zaal | Task | Before rebrand |
| Pick hosting stack for webapp + websockets + cron + Postgres (not Vercel-only) | @Zaal | Decision | Before deploy |
| Confirm AGPL compliance plan: keep fork AGPL, strip CharmVerse mark, ship CHANGES.md Section 13 notice | @Zaal | Task | Before public launch |

## Sources

- [KingfishersMediaLLC/kfmedia-learning-center](https://github.com/KingfishersMediaLLC/kfmedia-learning-center) - the repo researched. Tree, package.json, README, LICENSE, CHANGES.md, apps/, packages/ all read via gh API. [FULL]
- [CHANGES.md (KFMEDIA)](https://github.com/KingfishersMediaLLC/kfmedia-learning-center/blob/main/CHANGES.md) - the rebrand playbook + AGPL notice. [FULL]
- [LICENSE (CharmVerse / NorthShore.ai, AGPL-3.0 + trademark + commercial)](https://github.com/KingfishersMediaLLC/kfmedia-learning-center/blob/main/LICENSE) - read first 60 lines incl dual-license + trademark clause. [FULL]
- [charmverse/app.charmverse.io](https://github.com/charmverse/app.charmverse.io) - upstream project referenced in README and CHANGES. [PARTIAL - identified as upstream via README/CHANGES, upstream repo itself not separately fetched this pass]
