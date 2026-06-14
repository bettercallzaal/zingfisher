---
topic: infrastructure
type: decision
status: research-complete
last-validated: 2026-06-14
related-docs: [001]
original-query: "build this to improve by adding in zaoish features and use this to prep for zabalgamez and all zao platforms - github.com/ZAO-DEVZ, github.com/bettercallzaal/zaoos"
tier: STANDARD
---

# 002 - ZAO Features for the Learning Center + Platform Prep

> **Goal:** Turn the CharmVerse fork (zingfisher) into THE ZAO learning center by importing the ZAO OS fork patterns, and make it the prep/launchpad hub for ZABAL Gamez and every ZAO platform.

## Key Decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | ADOPT the `community.config.ts` one-file pattern from zaoos -> shipped as `zao.config.ts` | Every ZAO product forks from one config file. Matching the pattern means anyone who knows zaoos can configure the learning center instantly, and the estate stays consistent. |
| 2 | Map CharmVerse's existing features to ZAO learning needs - do NOT build from scratch | CharmVerse already has databases (course catalog), credentials (completion certs), member directory, forum, token gating, proposals. We wire these to ZAO, we don't rebuild them. |
| 3 | The learning center is the HUB; ZABAL Gamez + platforms link out, content links in | ZABAL Gamez workshops (Cal.com booking + Restream + Magnetiq portal) get a track here; zaoos/Discord/Luma/ORDAO are surfaced as platform links. One front door to the ZAO estate. |
| 4 | Gate to ZAO membership on Base, add Sign In With Farcaster | The ZAO is a 188-member Farcaster community on Base. CharmVerse's wallet auth + token gating already exist - point them at ZAO membership and add SIWF. |

## What ZAO OS (zaoos) gives us to import

ZAO OS (`bettercallzaal/zaoos`) is the ecosystem lab: Next.js 16 + Supabase + Farcaster + XMTP + ORDAO governance, MIT-licensed. Its fork model is one file: [`community.config.ts`](https://github.com/bettercallzaal/zaoos/blob/main/community.config.ts). Reusable building blocks:

| zaoos block | What it does | Learning-center use |
|-------------|--------------|---------------------|
| `community.config.ts` | One-file branding/gating/admin/nav | Cloned as `zao.config.ts` (this PR) |
| Farcaster (Neynar, appFid 19640, SIWF) | Auth + channels | Add SIWF auth + ZAO channels to the forum |
| Respect contracts (Optimism: OG ERC-20 `0x34cE...6957`, ZOR ERC-1155 `0x9885...445c`) | On-chain reputation / weighted voting | Weight course curation + governance track by Respect |
| Hats Protocol (Optimism) | On-chain roles | Map instructor / admin roles |
| Spaces (Stream.io + 100ms) | Live audio rooms | Live workshop / office-hours rooms |
| Sonata music player | Inline music from 9 platforms | Music track content |
| Agents (ZOE, Hermes) | Community AI | Learning assistant / ZOE tutor |

## What CharmVerse already has (map, don't rebuild)

From doc 001 - the fork's `packages/` and `apps/webapp/components/`:

| CharmVerse feature | ZAO learning-center role |
|--------------------|--------------------------|
| `packages/charmeditor` (ProseMirror) | Course/lesson authoring |
| `packages/databases` (Notion-style) | Course catalog, learning tracks, progress tracking |
| `packages/credentials` (EAS-style) | On-chain completion certificates / attestations |
| `components/members` (member directory) | ZAO learner directory |
| `components/forum` + `votes` | Cohort discussion + governance track |
| `components/proposals` + `rewards` | Bounties for finishing builds / shipping |
| `settings/.../TokenGates` | Gate content to ZAO membership on Base |
| `packages/farcaster` | Already present - extend for SIWF + channels |

The overlap is large: CharmVerse is already a DAO ops platform with Farcaster, credentials, and token gating. The work is configuration + ZAO wiring, not green-field building.

## How this preps ZABAL Gamez + all ZAO platforms

- **ZABAL Gamez** gets a first-class learning track (`tracks[0]` in `zao.config.ts`). Workshop slots book via Cal.com (`cal.com/bettercallzaal/zabal-games-workshop-slot`), stream via Restream, portal/library on Magnetiq. The learning center hosts the curriculum, replays, and completion credentials; the live session happens on the existing surfaces.
- **All ZAO platforms** are surfaced as `platforms` links (zaoos.com, Discord, Luma `luma.com/zao`, ORDAO `zao.frapps.xyz`). The learning center is the front door: a member lands here, learns, earns a credential, and is routed to the right platform to do the thing.
- **Estate consistency:** because `zao.config.ts` mirrors zaoos' `community.config.ts`, the learning center forks the same way every other ZAO product does. New brands (COC Concertz, WaveWarZ, etc.) can stand up their own learning center by editing one file.

## Build backlog (zaoish features to add)

Ordered by leverage:

1. [done this iter] `zao.config.ts` single-file config scaffold.
2. Wire `zao.config.ts.colors` -> `apps/webapp/theme/colors.ts` (`brandPrimary`).
3. Wire `zao.config.ts.font` -> `theme/fonts.ts` + `pages/_document.tsx`.
4. Landing copy + footer links from config -> `LoginPageContent.tsx` + `login/components/Footer.tsx`.
5. Token gating to ZAO Base membership via existing `TokenGates`.
6. Sign In With Farcaster (Neynar) alongside wallet auth.
7. Seed the 4 learning tracks as CharmVerse databases.
8. ZABAL Gamez track: embed Cal.com booking + Restream replay surface.
9. Credentials package -> EAS "completed track" attestation on Base.
10. ZOE learning-assistant agent surface.

## Also See

- [Doc 001](../001-charmverse-fork-for-zao/) - the fork plan, stack, license
- [zao.config.ts](../../zao.config.ts) - the one-file config shipped this iteration

## Next Actions

| Action | Owner | Type | By When |
|--------|-------|------|---------|
| Confirm ZAO palette + font + footer social links for the learning center | @Zaal | Decision | Next iteration |
| Provide ZAO membership contract address(es) on Base for gating | @Zaal | Input | Before gating |
| Approve `zao.config.ts` shape vs zaoos community.config.ts | @Zaal | Review | This loop |
| Wire config colors/font into theme (backlog item 2-3) | @loop | PR | Next iterations |

## Sources

- [bettercallzaal/zaoos README](https://github.com/bettercallzaal/zaoos) - ZAO OS lab overview, stack, fork model. [FULL]
- [zaoos community.config.ts](https://github.com/bettercallzaal/zaoos/blob/main/community.config.ts) - the one-file fork pattern, Respect/Hats/Farcaster/Spaces config. [FULL]
- [KingfishersMediaLLC/kfmedia-learning-center](https://github.com/KingfishersMediaLLC/kfmedia-learning-center) - the CharmVerse base now in this repo. [FULL]
- ZAO-DEVZ org - surveyed; only `WW` (WaveWarZ, TS, 2026-01) + a demo repo. Active ZAO product code lives under `bettercallzaal/*`, not the org. [FULL]
