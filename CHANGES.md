# KFMEDIA Learning Center — Modifications from Upstream

**Original Project:** [CharmVerse](https://github.com/charmverse/app.charmverse.io)  
**Original License:** GNU Affero General Public License v3.0 (AGPL-3.0)  
**Modifications by:** Kingfishers Media LLC (KFMEDIA℠)  

---

## License Notice

This software is a modified version of CharmVerse, originally licensed under AGPL-3.0. All modifications are also licensed under AGPL-3.0. The full license text is available in the [LICENSE](./LICENSE) file.

---

## Summary of Modifications

### 2026-04-22
- **Font Loading**: Configured Montserrat as the primary brand font via Google Fonts (_document.tsx)
- **Footer Links**: Updated social channels and contact information
  - Telegram: https://t.me/KFMEDIACommunity
  - X/Twitter: https://x.com/KMLLCW3
  - Email: Support@kingfishermedia.io
  - Website: https://kingfishersmedia.io

### 2026-04-20
- **Theme Colors**: Applied brand color system
  - Primary: #903235 (deep red)
  - Secondary: #E6A23A (gold)
  - Updated pps/webapp/theme/colors.ts and pps/webapp/theme/index.ts

### 2026-04-19
- **Favicon & Icons**: Replaced default icons with KFMEDIA-branded assets
  - avicon.ico
  - pple-touch-icon.png (180×180)
  - ndroid-chrome-192x192.png
  - ndroid-chrome-512x512.png
- **Rebrand Fallout Fix**: Restored critical imports broken during automated rebrand
  - Reverted incorrect package imports (@charmverse/core)
  - Fixed internal hook names and component references
- **Header Logo**: Replaced image logo with text-based **KFMEDIA℠** using Montserrat font and brand color
- **Landing Page Copy**: Updated LoginPageContent.tsx
  - Widened text column (md:8), reduced image column (md:4)
  - Replaced artwork with kfmedia-learning-center-logo.png
  - New title and subtitle messaging aligned with KFMEDIA mission

### 2026-03-21
- **Initial Rebrand**: Automated rebrand from CharmVerse to KFMEDIA℠
  - UI text references
  - Logo and icon assets
  - Domain references

---

## Unchanged from Upstream

All core functionality, database schema, API endpoints, authentication, and feature logic remain from the original CharmVerse codebase. Modifications are limited to visual branding, copy, and public-facing links.

---

## How to Obtain the Source Code

The complete source code for this modified version is available at:  
**https://github.com/KingfishersMediaLLC/kfmedia-learning-center**

As required by AGPL-3.0 Section 13, users interacting with this software remotely through a computer network are offered access to the corresponding source code at no charge.

---

*Last updated: 2026-04-22*
