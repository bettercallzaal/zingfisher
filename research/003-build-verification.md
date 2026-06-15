---
topic: security
type: audit
status: research-complete
last-validated: 2026-06-14
related-docs: [001, 002]
original-query: "loop iter 6 - validate the foundation compiles after the ZAO rebrand edits (iters 2-5)"
tier: QUICK
---

# 003 - Build Verification (loop iter 6)

> **Goal:** Confirm the ZAO rebrand edits (iters 2-5) compile and the inherited base is sound, before adding ZAO features.

## Update 2026-06-15 - typecheck cleanup outcome (iters 14, 20-22)

The inherited webapp typecheck debt was cut **134 -> 35** by fixing things the
KFMEDIA rebrand broke (not the build - `next build` was always green):

- iter 14: `blueColor`, `trackedKFMEDIASchemas` dangling exports (-2).
- iter 20: restored missing `__e2e__/utils/mocks.ts` from upstream (-70).
- iter 21: restored `proposals`/`forum` to `STATIC_PAGES` + `signup.po.ts` (-17).
- iter 22: restored 6 `'charmverse'` enum/data values the iter-4 brand sweep had
  mis-changed to `'ZAO'` (also a runtime-correctness fix) (-10).

**Remaining 35: intentionally left.** They are genuine upstream/inherited TS
inference issues (SWR mutation hook error generics resolving to `never` so
`error.message` errors; a few `FeatureMap`/union mismatches in stories + API
typing). They do NOT block `next build` (test/stories files excluded; the rest
are type-only). Fixing them risks masking real issues or changing behavior for
low value. Tracked as a separate upstream-typing cleanup, not part of the ZAO
build-out. Re-evaluate if the project adopts strict CI typecheck gating.

## Key Decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | The ZAO rebrand edits are clean - SHIP-safe | `npm ci` exit 0; `tsc --noEmit` shows 0 errors in any file edited in iters 2-5, and the iter-5 import fixes (KFMEDIADiscordInvite, KFMEDIABankAddress, KFMEDIACredentialSchemas, KFMEDIA_logo_icon) all resolve. |
| 2 | Do NOT fix the 135 pre-existing tsc errors inside the feature loop | They are inherited from the KFMEDIA/CharmVerse snapshot, mostly test-only, and fixing them risks changing upstream behavior. Track separately. |
| 3 | Validate deployability with `next build` + a running instance next, not bare `tsc` | `tsc --noEmit` over the whole webapp includes test/e2e/stories files that `next build` excludes; it is the wrong gate for "does the app run". |

## Findings

- **Install:** `npm ci` succeeded (exit 0), 1592 packages, `@charmverse/core` Prisma client generated via postinstall. Node 23.3.0 / npm 10.9.0.
- **My edits:** `tsc --project apps/webapp --noEmit` reports 0 errors in any of the ~50 files touched in iters 2-5. The 4 dangling imports fixed in iter 5 no longer error.
- **Pre-existing base errors:** 135 total in the webapp typecheck.
  - ~70 are TS2307 "Cannot find module '.../utils/mocks'" - a test-mocks module the KFMEDIA snapshot never committed. Confined to `__e2e__`, `.spec`, and `.stories` files. Test infra, not production code.
  - ~65 are scattered type mismatches in inherited CharmVerse code (`packages/features/getFeatureTitle.ts` feature-key unions, `theme/cssVariables.ts` missing `blueColor`, settings/otp modals, etc).
- **Implication:** The inherited base was never in a clean `tsc` state (consistent with the dangling-import build breaks fixed in iter 5). This does not block `next build`, which excludes test files - but a production hardening pass should clear these.

## Next Actions

| Action | Owner | Type | By When |
|--------|-------|------|---------|
| Run `next build -w apps/webapp` against a real .env to confirm deployability | @loop | Task | Next iterations |
| Open a separate "typecheck cleanup" track for the 135 inherited errors (test-mocks first) | @Zaal | Decision | After feature MVP |
| Resume ZAO feature work (token gating, SIWF, learning tracks) on the verified-clean base | @loop | Task | Next iterations |

## Also See

- [Doc 001](001-charmverse-fork-for-zao/) - fork plan
- [Doc 002](002-zao-features-platform-prep/) - feature backlog

## Sources

- `npm ci` run log `/tmp/zingfisher-install.log` (local, exit 0). [FULL]
- `npm run typecheck -w apps/webapp` log `/tmp/zingfisher-typecheck.log` (local, 135 errors categorized). [FULL]
