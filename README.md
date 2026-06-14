# zingfisher

ZAO replica of a CharmVerse-based learning center.

## What this is

The KFMEDIA learning center (`KingfishersMediaLLC/kfmedia-learning-center`) is a
rebranded fork of [CharmVerse](https://github.com/charmverse/app.charmverse.io) -
the all-in-one DAO Space platform (docs/wiki, Notion-style databases, member
directory, proposals, votes, rewards, forum, on-chain credentials, token gating,
Farcaster). This repo is where we plan and build the ZAO version of that.

## Status

Research phase. See [research/001-charmverse-fork-for-zao](research/001-charmverse-fork-for-zao/)
for the full breakdown: stack, license terms, and the exact branding-only change
set to copy.

## TL;DR

- CharmVerse is AGPL-3.0. A ZAO fork is legal if we keep it AGPL and strip the
  CharmVerse trademark.
- KFMEDIA did a branding-only fork - they changed ~7 surfaces (theme colors,
  fonts, favicons, header logo, landing copy, footer links, CHANGES.md) and left
  all core functionality, schema, APIs, and auth untouched. Same playbook for ZAO.
- This is a real backend (Next.js 15 + React 19 + MUI 7 + PostgreSQL/Prisma +
  websockets + cron), not a static site. Plan hosting accordingly.

## Stack (upstream)

Next.js ^15.3.2, React 19.1, MUI ^7.1.0, wagmi/viem, Prisma via `@charmverse/core`
-> PostgreSQL. npm-workspace monorepo: `apps/{webapp,websockets,cron}` + 27 `packages/*`.
