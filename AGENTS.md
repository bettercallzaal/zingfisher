# AGENTS.md - zingfisher (ZAO Learning Center)

Context for AI coding agents (Claude Code, Cursor, Copilot, Windsurf) working in this repo.

## What this is

A ZAO-branded learning center forked from **CharmVerse** (an all-in-one DAO platform)
via the KFMEDIA fork. AGPL-3.0. The ZAO layer (branding, gating, learning hub) sits
on top of the inherited CharmVerse app.

## Layout

- `apps/webapp` - Next.js 15 frontend + API (pages router). The app.
- `apps/websockets` - realtime server (PORT 3336). Long-running.
- `apps/cron` - scheduled jobs. Long-running.
- `packages/*` - 27 workspace packages (`@packages/<name>` -> `packages/<name>/src/*`).
- `apps/webapp/components/zao/*` - the ZAO-specific UI (member gate, learning sections).
- `apps/webapp/pages/learn.tsx` - the `/learn` hub.
- `research/` - decision + status docs (001-006). Read 006 for current status.

## The one file to change when forking

- `zao.config.ts` (repo root) - human-facing fork config (branding, gating, tracks).
- `@packages/config/zao` (`packages/config/src/zao.ts`) - the import-safe version code uses.
- `@packages/config/colors` - brand palette (`zaoPrimary` etc).

## Commands

```bash
npm ci                              # install (postinstall generates Prisma client via @charmverse/core)
npm run typecheck -w apps/webapp    # tsc --noEmit (see note below)
npm run build -w apps/webapp        # next build (needs a .env; SSR pages, no DB at build)
npx eslint <files>                  # lint (pre-commit hook runs eslint --fix on staged ts/tsx)
npx vitest run --config <cfg>       # tests; the packages project's globalSetup needs a Postgres DB
```

## Gotchas (learned the hard way)

- **Do NOT rebrand `@charmverse/core`** - it's a real npm dependency, not display text.
- **Do NOT find-replace brand words into enum/data values.** CharmVerse uses
  `'charmverse'` as a credential/source/platform enum value - it is NOT display text.
  An over-broad `KFMEDIA -> ZAO` sweep broke these (fixed in iters 21-22). Only rebrand
  user-visible strings and assets.
- **typecheck has ~35 pre-existing inherited errors** (upstream TS inference, test files).
  They do NOT block `next build`. Don't chase them; don't add new ones. See research/003.
- **websockets + cron can't run on Vercel** - they need a separate Node host. See research/005.
- **DB schema lives in `@charmverse/core`** - migrate via `npx prisma migrate deploy` (which
  runs inside `node_modules/@charmverse/core`), not a local schema.

## ZAO conventions

- Branding from `@packages/config/colors` + `@packages/config/zao`; don't hardcode hex/strings.
- Member gating uses `packages/lib/src/zao/respectGate.ts` (Respect on Optimism + $ZABAL on
  Base). Gate UI with `components/zao/ZaoMemberGate`.
- "Say The ZAO first; ZABAL is the internal builder identity, never the umbrella" (see research/004).
- No emojis in code/docs/commits.

## License

AGPL-3.0. Keep it AGPL, ship the source-access notice (CHANGES.md), don't use the
CharmVerse trademark in branding.
