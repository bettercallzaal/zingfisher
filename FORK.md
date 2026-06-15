# FORK.md - Stand up your own ZAO-style learning center

This repo is a forkable learning center (CharmVerse fork, AGPL-3.0). To make it
yours, you mostly edit config + swap assets. Core CharmVerse features (docs,
databases, member directory, forum, credentials, token gating) come for free.

## 1. Clone + install

```bash
git clone https://github.com/bettercallzaal/zingfisher.git my-learning-center
cd my-learning-center
npm ci          # postinstall generates the Prisma client via @charmverse/core
```

## 2. Change the config (the one place that matters)

| File | What to change |
|------|----------------|
| `packages/config/src/colors.ts` | `zaoPrimary` / `zaoPrimaryHover` / `zaoBackground` etc -> your palette. This is the canonical brand color source. |
| `packages/config/src/zao.ts` | `zabalGames`, `learningTracks`, `zao101`, `zaoEcosystem`, `zaoMusic`, `zaoPlatforms` -> your tracks, content, and links. This is what the UI reads. |
| `zao.config.ts` (root) | Branding, Farcaster `appFid`/channels, gating contracts, admin FIDs. The human-facing fork doc. |
| `apps/webapp/theme/fonts.ts` + `pages/_document.tsx` | Your brand font (currently Inter). |

## 3. Swap brand assets

Replace in `apps/webapp/public/`:
- `favicon.png`, `favicon.ico`, `apple-touch-icon.png` (180x180),
  `android-chrome-192x192.png`, `android-chrome-512x512.png`
- `images/zao-logo.png`

Update the header wordmark text in
`apps/webapp/components/common/BaseLayout/components/Header.tsx`.

## 4. Set your membership gate

Edit `packages/lib/src/zao/respectGate.ts` -> `ZAO_MEMBERSHIP_GATES`: list the
ERC-20/721/1155 contract(s) + chain that grant member access. The gate checks
balance via viem (mainnet/Base/Optimism) and is exposed at `/api/zao/membership`
and the `useZaoMembership` hook. Wrap member-only content in `ZaoMemberGate`.

## 5. Configure env + run

```bash
cp .env.example .env     # set DATABASE_URL, AUTH_SECRET, DOMAIN, REACT_APP_WEBSOCKETS_HOST
npx prisma migrate deploy   # runs inside @charmverse/core
npm run build -w apps/webapp
npm start
```

## 6. Deploy

See [research/005-deployment-guide.md](research/005-deployment-guide.md). Short
version: Postgres on Supabase, webapp on Vercel, the `websockets` + `cron` apps on
a Node host (Railway/Render) - Vercel can't run those.

## Rules

- Keep it AGPL-3.0; ship a source-access notice ([CHANGES.md](CHANGES.md)).
- Do NOT rebrand the `@charmverse/core` package name (real dependency).
- Do NOT find-replace brand words into enum/data values (e.g. the credential type
  `'charmverse'` is data, not display text). Only rebrand user-visible strings + assets.
- See [AGENTS.md](AGENTS.md) for the full gotcha list.

## The /learn hub

`apps/webapp/pages/learn.tsx` composes the sections (music, tracks, intro, your
builder program, members area, ecosystem, links). Add/remove sections there;
each reads from `@packages/config/zao`.
