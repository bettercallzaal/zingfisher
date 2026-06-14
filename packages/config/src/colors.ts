// ZAO Learning Center Brand Colors
// Canonical source - see zao.config.ts at repo root.
// Primary Palette
export const zaoPrimary = '#f5a623'; // ZAO accent (amber)
export const zaoPrimaryHover = '#ffd700'; // gold hover
export const zaoBackground = '#0a1628'; // dark page base
export const zaoSurface = '#0d1b2a'; // card/panel
export const zaoSurfaceLight = '#1a2a3a'; // modals/dropdowns

// Accent Palette
export const zaoWhite = '#FEFEFE';
export const zaoGold = '#ffd700';
export const zaoBlack = '#020202';
export const zaoGray = '#747474';

// Back-compat aliases: keep prior export names valid so dependent imports
// (kfmedia*, charmBlue) do not break. Values now point at the ZAO palette.
// Do NOT remove without grepping for usages first (rebrand-fallout guard).
export const kfmediaPrimary = zaoPrimary;
export const kfmediaAltPrimary = zaoPrimaryHover;
export const kfmediaWhite = zaoWhite;
export const kfmediaGold = zaoGold;
export const kfmediaBlack = zaoBlack;
export const kfmediaGray = zaoGray;
export const kfmediaRose = '#D8B8B9';
export const kfmediaAltGold = '#e9ae2e';

// Legacy export for backward compatibility during migration
export const charmBlue = zaoPrimary;

// Used by _document.tsx for the <meta theme-color> tag
export const primaryBrandColor = zaoPrimary;
