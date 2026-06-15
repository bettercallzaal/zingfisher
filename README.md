# zingfisher

ZAO learning center - a fork of CharmVerse (via the KFMEDIA learning center), being rebranded for The ZAO.

## What this is

CharmVerse is the all-in-one DAO Space platform: docs/wiki, Notion-style
databases, member directory, proposals, votes, rewards, forum, on-chain
credentials, token gating, and Farcaster integration. The KFMEDIA learning
center (`KingfishersMediaLLC/kfmedia-learning-center`) is a branding-only fork of
it. This repo takes that base and rebrands it for the ZAO.

The full app source now lives in this repo (`apps/`, `packages/`). Our planning
and decisions live in [research/](research/).

## Status

Deployable, ZAO-branded learning center. Installs, builds (`next build` green),
typechecks. Current status + roadmap: [research/006](research/006-project-status.md).

- **ZAO branding** - palette, Inter font, logo/favicons, copy, AGPL notice.
- **`/learn` hub** - ZAO 101, learning tracks, ZABAL Games program, gated members
  area, ecosystem map, platform links.
- **Membership gate** - `respectGate.ts` (Respect on Optimism + $ZABAL on Base)
  -> `/api/zao/membership` -> `useZaoMembership` -> `ZaoMemberGate`. Unit-tested,
  contracts verified on-chain.
- **Billing hidden** (`billingEnabled=false`). **One-file config**: `zao.config.ts`.
- **Open**: confirm the Base member gate, real deploy secrets, domain. See doc 006.

## License

CharmVerse is **AGPL-3.0** with a trademark clause (see [LICENSE](LICENSE)). Our
fork stays AGPL-3.0. We must strip the "CharmVerse" trademark and ship an AGPL
Section 13 source-access notice ([CHANGES.md](CHANGES.md)). The `@charmverse/core`
npm package name is a real dependency and is NOT rebranded.

## Stack

Next.js ^15.3.2, React 19.1, MUI ^7.1.0, wagmi/viem, Prisma via `@charmverse/core`
-> PostgreSQL. npm-workspace monorepo:
- `apps/webapp` - Next.js frontend + API
- `apps/websockets` - realtime (PORT 3336)
- `apps/cron` - scheduled jobs
- `packages/*` - 27 packages (charmeditor, databases, credentials, farcaster,
  spaces, subscriptions, permissions, profile, users, blockchain, core, lib, ...)

## Local dev

Needs PostgreSQL. See [docs/CHARMVERSE-README.md](docs/CHARMVERSE-README.md) for
the upstream setup steps.

```bash
docker run -d -v $HOME/postgresql/data:/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
npm ci
cp .env.example .env   # fill in secrets
npx prisma migrate dev
npm start
```

## ZAO rebrand - the 7 surfaces

The KFMEDIA `CHANGES.md` is our checklist. Branding-only, core untouched:

1. Brand font - `apps/webapp/.../_document.tsx`
2. Theme colors - `apps/webapp/theme/colors.ts`, `apps/webapp/theme/index.ts`
3. Favicons / app icons - `favicon.ico`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`
4. Header logo
5. Landing copy - `LoginPageContent.tsx`
6. Footer links - Telegram / X / email / website -> ZAO
7. AGPL notice - `CHANGES.md`

Do NOT blind find-replace "charmverse" - it breaks `@charmverse/core` imports
(KFMEDIA hit this; see their CHANGES.md "Rebrand Fallout Fix").

## Upstream sync

The KFMEDIA base is tracked as the `upstream` git remote:

```bash
git fetch upstream
```

## Research

- [research/001-charmverse-fork-for-zao](research/001-charmverse-fork-for-zao/) - stack, license, fork plan
