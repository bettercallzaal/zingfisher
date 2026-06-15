---
topic: infrastructure
type: guide
status: research-complete
last-validated: 2026-06-15
related-docs: [001, 002, 003, 004, 005]
original-query: "loop checkpoint - consolidate what is built, verified, and still open after the build-out iterations"
tier: STANDARD
---

# 006 - Project Status + Roadmap (zingfisher)

> **Goal:** One checkpoint of where the ZAO learning center stands - done, verified, open - so Zaal can steer.

## Where it stands (2026-06-15)

zingfisher is a **deployable, ZAO-branded learning center** forked from CharmVerse (via the KFMEDIA fork). It installs, builds (`next build` succeeds, 8/8 pages), and typechecks at 132 errors - all 132 pre-existing in the inherited base (mostly a missing test-only `utils/mocks`), zero introduced by this work.

## Done + verified

| Area | State |
|------|-------|
| Fork imported | Full CharmVerse app (apps/ + packages/) in-repo; `upstream` remote tracks KFMEDIA |
| Build breaks fixed | 5 dangling KFMEDIA partial-rebrand imports resolved (KFMEDIADiscordInvite, KFMEDIABankAddress, KFMEDIACredentialSchemas, trackedKFMEDIASchemas, blueColor) + a missing logo asset |
| Branding | ZAO palette (#f5a623/#ffd700/#0a1628), Inter font, ZAO logo + favicons (pulled from zaoos), header wordmark, landing copy, footer links, AGPL CHANGES.md |
| Billing | Hidden behind `billingEnabled=false` (banner + upgrade chips gated) |
| Membership gate | `respectGate.ts` viem multi-chain (Respect OP OG+ZOR, $ZABAL Base); 10 unit tests; contracts verified on-chain; `/api/zao/membership` route + `useZaoMembership` hook + `ZaoMemberGate` component |
| `/learn` hub | ZAO 101, tracks grid, ZABAL Games section, gated members area, ecosystem map, platform links |
| Config | `zao.config.ts` (fork doc) + `@packages/config/zao` (code source) |
| Build verified | `next build` green; `/learn` + `/api/zao/membership` in the bundle |
| Docs | 001 fork plan, 002 feature plan, 003 build verification, 004 ecosystem overview, 005 deploy guide, 006 (this) |

## Open (needs Zaal)

| Item | Blocks | Default if unanswered |
|------|--------|-----------------------|
| Base member gate = $ZABAL (`0xbB48…0b07`) or a dedicated Respect-on-Base? | member-gated tracks in prod | Using $ZABAL placeholder |
| Real secrets (Supabase URL+keys, AUTH_SECRET, Neynar key) | deploy + Farcaster login | n/a |
| Domain (learn.thezao.com?) | deploy | n/a |
| ZAO X / Telegram handles | footer socials | Discord-only placeholder |
| ZABAL Games exact season dates | content accuracy | Jun/Jul/Aug placeholders |

## Roadmap (next, when unblocked)

1. Confirm Base gate -> finalize `respectGate.ts` + `zao.config.ts`.
2. Deploy per doc 005 (Supabase + Vercel + Railway/Render for ws/cron).
3. Farcaster SIWF login (Neynar) alongside wallet auth.
4. Seed ZAO 101 + ZABAL Games as real CharmVerse content/databases (needs running DB).
5. EAS credential issuance on Base on track completion.
6. Discoverability: link `/learn` from the in-app nav.
7. Typecheck-cleanup track for the 132 inherited errors (test-mocks first).

## Next Actions

| Action | Owner | Type | By When |
|--------|-------|------|---------|
| Answer the 5 open items above | @Zaal | Decision | When free |
| Deploy to staging once secrets land | @Zaal | Task | After secrets |

## Sources

- This repo's commit history (iters 1-18) + CHANGES.md. [FULL]
- Docs 001-005. [FULL]
