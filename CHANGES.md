# ZAO Learning Center (zingfisher) - Modifications from Upstream

**Original Project:** [CharmVerse](https://github.com/charmverse/app.charmverse.io)
**Intermediate Fork:** [KFMEDIA Learning Center](https://github.com/KingfishersMediaLLC/kfmedia-learning-center) (branding-only fork of CharmVerse)
**Original License:** GNU Affero General Public License v3.0 (AGPL-3.0)
**Modifications by:** The ZAO / bettercallzaal

---

## License Notice

This software is a modified version of CharmVerse, originally licensed under
AGPL-3.0. All modifications are also licensed under AGPL-3.0. The full license
text is available in the [LICENSE](./LICENSE) file. The "CharmVerse" trademark is
not used in this fork's branding (trademark clause in LICENSE).

---

## Summary of Modifications

### 2026-06-14 - Ecosystem-map section (loop iter 17)
- `components/zao/EcosystemSection.tsx` - the ZAO product estate (8 products with
  live/R&D/paused chips + links), from research doc 004; data in `@packages/config/zao`
  (`zaoEcosystem`). Mounted on `/learn`. eslint clean; typecheck 132, 0 new errors.

### 2026-06-14 - ZAO 101 content section (loop iter 15)
- `components/zao/Zao101Section.tsx` - the open intro track: definition,
  principle, the 4 pillars, the umbrella org model, and the 4 join steps.
  Content from zao-101 (canonical primer), via `zao101` in `@packages/config/zao`.
- Mounted on `/learn`. eslint clean; webapp typecheck now 132 (down from 134
  after the iter-14 fixes), 0 errors in new files.

### 2026-06-14 - Production build verified + 2 dangling-import fixes (loop iter 14)
- `next build` of apps/webapp SUCCEEDS: 8/8 pages generated. The new `/learn`
  page (static, 3.14 kB) and `/api/zao/membership` route both compile into the
  production bundle. The app is deployable.
- Fixed 2 more dangling imports the build surfaced as warnings:
  - `trackedKFMEDIASchemas` (another KFMEDIA rebrand artifact) -> aliased to
    `trackedCharmverseSchemas` in `@packages/credentials/external/schemas`.
  - `blueColor` (missing export used as `--primary-color`) -> mapped to the ZAO
    brand primary in `apps/webapp/theme/colors.ts`.
- Rebuild after fixes: 0 import-error warnings.

### 2026-06-14 - Learning-center hub page (loop iter 13)
- `apps/webapp/pages/learn.tsx` (route `/learn`) - composes the whole stack:
  tracks grid (Open vs Members chips), the ZABAL Games section, a Respect/$ZABAL
  -gated Members area (ZaoMemberGate), and cross-ZAO platform links. Uses the
  public BaseLayout. eslint + typecheck clean (134, 0 new).

### 2026-06-14 - ZAO UI layer: member gate + ZABAL Games section (loop iter 12)
- `@packages/config/zao` - import-safe UI config (zabalGames, learningTracks,
  zaoPlatforms), the code-facing source mirroring root zao.config.ts.
- `components/zao/ZaoMemberGate.tsx` - gates children on ZAO membership via
  useZaoMembership + the user's first wallet; shows a join CTA otherwise.
- `components/zao/ZabalGamesSection.tsx` - renders the open program: 3 tracks,
  season arc, workshop booking CTA.
- Verified: webapp typecheck unchanged at 134 (0 errors in new files).

### 2026-06-14 - Wire membership gate into the webapp (loop iter 11)
- `apps/webapp/pages/api/zao/membership.ts` - GET ?address=0x... returns
  { member, results } via checkZaoMembership (Respect OP + $ZABAL Base).
  Validates the address, uses the standard next-connect + withSessionRoute pattern.
- `apps/webapp/charmClient/hooks/zao.ts` - `useZaoMembership(address)` SWR hook
  (immutable; skips the request until a wallet is connected).
- Verified: webapp typecheck unchanged at 134 errors (0 in the new files).

### 2026-06-14 - Respect membership gate module + on-chain verification (loop iter 10)
- Added `packages/lib/src/zao/respectGate.ts` - a viem multi-chain ZAO membership
  gate (port of zaoos tokenGate.ts), extended with the ZAO gate set: hold Respect
  OG (ERC-20, OP) OR ZOR (ERC-1155, OP) OR $ZABAL (ERC-20, Base) = member. Pure
  decision logic (`evaluateGate`, `isZaoMember`) split from the on-chain read
  (`checkTokenGate`, `checkZaoMembership`) for testability.
- Added 10 unit tests (`__tests__/respectGate.spec.ts`) - all pass.
- Verified all 5 ecosystem contracts exist on-chain via eth_getCode (Base + OP):
  ZABAL (25.5KB), ZOR (23KB) full; Respect OG / SANG / ZOUNZ are minimal proxies.
- NOTE: Base gate uses $ZABAL pending Zaal's confirm of a dedicated Respect-on-Base.

### 2026-06-14 - Apply ZAO decisions: gating, billing, assets (loop iters 7-8)
- **Assets**: pulled real ZAO logo + favicon set from zaoos/public into apps/webapp/public.
- **Gating** (Zaal-confirmed): membership = holding Respect on Optimism (OG ERC-20
  + ZOR ERC-1155) OR Base (new Respect, address TODO). Set in zao.config.ts.
  ZABAL Games stays OPEN (ungated). Port target: zaoos/src/lib/spaces/tokenGate.ts.
- **Billing hidden** (Zaal: "hide it for now"): added `billingEnabled = false` in
  @packages/config/constants; gated the BlocksExceededBanner and sidebar UpgradeChip.
  Fixed a pre-existing broken `openSettings('subscription')` path while there.
- **ZABAL Games config**: corrected to canonical zao-101 truth (open program, tracks
  Artist/Builder/Creator, June/July/Aug season).
- **Hosting** (Zaal): match zaoos stack - Supabase (Postgres) + Vercel for webapp.
  NOTE: the websockets + cron apps need a separate Node host (Vercel can't run them).

### 2026-06-14 - Fix KFMEDIA partial-rebrand build breaks (loop iter 5)
KFMEDIA's automated rebrand renamed several import sites to `KFMEDIA*` without
ever exporting them, leaving dangling imports that break the build. Fixed:
- `KFMEDIADiscordInvite` (4 import sites) - added export in `@packages/config/constants`,
  pointed at the ZAO Discord (discord.thezao.com). `charmverseDiscordInvite` now aliases it.
- `KFMEDIABankAddress` (3 import sites) - added alias to `charmVerseBankAddress` in
  `@packages/subscriptions/constants` (value unchanged - upstream treasury, not ours).
- `KFMEDIACredentialSchemas` - added alias to `charmverseCredentialSchemas` in
  `@packages/credentials/schemas`.
- `public/images/KFMEDIA_logo_icon.png` import (never committed) - repointed to an
  existing icon asset (TODO: ZAO logo asset).
- Dead `KFMEDIA_black.png` image paths -> existing `charmverse_black.png` (runtime).

### 2026-06-14 - Branding-string sweep (loop iter 4)
- Replaced the bare brand word `KFMEDIA` with `ZAO` across 44 files of
  user-facing settings/account/billing copy (73 occurrences). Word-boundary +
  `(?!.io)` lookahead protected code identifiers (`KFMEDIABankAddress`,
  `KFMEDIADiscordInvite`), `KFMEDIA.io` URLs, and the logo asset path.
- Deferred (documented, not yet changed): 35 dead `KFMEDIA.io` help/pricing
  deep-links (CharmVerse pages with no ZAO equivalent, in billing/custom-domain
  flows likely to be disabled) and the `KFMEDIA*` code identifiers in
  `@packages/subscriptions/constants` + `@packages/config/constants`.

### 2026-06-14 - ZAO landing copy + footer (loop iter 3)
- Login title "The ZAO Learning Center", ZAO subtitle, dev redirect to /zao-learning.
- Footer links/socials -> zaoos.com, discord.thezao.com, luma.com/zao, ORDAO,
  Farcaster channel, zingfisher source. ZAO X/Telegram handles still TODO.

### 2026-06-14 - ZAO rebrand (loop iter 2)
- **Brand colors**: Replaced KFMEDIA palette (#903235 red / #E6A23A gold) with the
  ZAO palette (#f5a623 amber / #ffd700 gold) in `packages/config/src/colors.ts`.
  Canonical brand color source is now `zaoPrimary`; old `kfmedia*` and `charmBlue`
  exports are kept as back-compat aliases pointing at ZAO values (rebrand-fallout
  guard - do not blind-delete).
- **theme-color meta + header**: `_document.tsx` now reads `primaryBrandColor` from
  config instead of a hardcoded hex; header wordmark changed from "KFMEDIA" to
  "ZAO Learning Center".
- **Brand font**: Montserrat replaced with Inter in `_document.tsx`, `theme/fonts.ts`
  (prepended to `defaultFont`), and the header.
- **Config**: Added `zao.config.ts` at repo root - the one file to change when
  forking, mirroring `community.config.ts` from bettercallzaal/zaoos.

### Inherited from upstream
All core functionality, database schema, API endpoints, authentication, and
feature logic remain from the original CharmVerse codebase. The `@charmverse/core`
npm package name is unchanged (it is a real dependency).

---

## How to Obtain the Source Code

The complete source code for this modified version is available at:
**https://github.com/bettercallzaal/zingfisher**

As required by AGPL-3.0 Section 13, users interacting with this software remotely
through a computer network are offered access to the corresponding source code at
no charge.

---

*Last updated: 2026-06-14*
