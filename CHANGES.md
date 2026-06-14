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
