/**
 * ZAO Learning Center Configuration (zingfisher)
 *
 * The one file to change when forking this learning center for a ZAO brand.
 * Mirrors the `community.config.ts` pattern from bettercallzaal/zaoos so the
 * whole ZAO estate shares one mental model: branding, gating, admin, and the
 * learning-specific surfaces (tracks, credentials, workshop booking) all live
 * here.
 *
 * The underlying app is a CharmVerse fork (AGPL-3.0). Do NOT rebrand the
 * `@charmverse/core` package name - it is a real npm dependency. Only the
 * user-facing values below change per brand.
 *
 * See research/001 (fork plan) and research/002 (ZAO features + platform prep).
 */

export const zaoConfig = {
  // -- Branding -------------------------------------------------------------
  /** Brand name - nav, page titles, meta tags, landing page */
  name: 'ZAO Learning Center',
  /** Short line shown on landing + social cards */
  tagline: 'Learn, build, and ship across The ZAO',
  /** Maps to apps/webapp/theme/colors.ts brandPrimary (currently charmBlue). */
  colors: {
    primary: '#f5a623', // ZAO accent (matches zaoos community.config.ts)
    primaryHover: '#ffd700',
    background: '#0a1628',
    surface: '#0d1b2a',
    surfaceLight: '#1a2a3a',
  },
  /** Brand font - wire into apps/webapp/theme/fonts.ts + pages/_document.tsx */
  font: 'Inter', // TODO: confirm ZAO typeface with Zaal

  // -- Membership gating (ZAO is a 188-member community on Base) -------------
  gating: {
    /** Gate course content to ZAO membership. CharmVerse has native token gating
     *  under settings/invites/TokenGates - point it at these. */
    enabled: true,
    chain: 'base' as const,
    /** ERC-20/721/1155 contracts that grant access. Fill from ZAO membership. */
    membershipContracts: [] as `0x${string}`[],
  },

  // -- Farcaster (ZAO is a Farcaster-native community) ----------------------
  farcaster: {
    /** App FID from Neynar dashboard. zaoos uses 19640. */
    appFid: 19640,
    /** Channels surfaced as discussion rooms in the forum/community surface */
    channels: ['zao', 'zabal', 'cocconcertz', 'wavewarz'],
    defaultChannel: 'zao',
    /** Sign In With Farcaster as an auth method alongside CharmVerse's wallet auth */
    siwfEnabled: true,
  },

  // -- Admin ----------------------------------------------------------------
  adminFids: [19640],
  adminWallets: [] as `0x${string}`[],

  // -- Learning tracks (maps to CharmVerse "databases" = course catalog) ----
  /** Top-level learning tracks. Each becomes a CharmVerse database/board view. */
  tracks: [
    { id: 'zabal-games', name: 'ZABAL Gamez Workshops', emoji: '[GAMES]', description: 'Build-along game-dev workshops' },
    { id: 'zao-os', name: 'ZAO OS', emoji: '[OS]', description: 'Fork and run a community OS' },
    { id: 'music', name: 'Music & WaveWarZ', emoji: '[MUSIC]', description: 'Artist tooling, NFTs, prediction markets' },
    { id: 'governance', name: 'Governance', emoji: '[GOV]', description: 'Respect, ORDAO, Hats, fractals' },
  ],

  // -- On-chain credentials (maps to packages/credentials - EAS-style) ------
  /** Issue completion certificates / attestations when a member finishes a track.
   *  CharmVerse already ships a credentials package; wire it to ZAO attestations. */
  credentials: {
    enabled: true,
    chain: 'base' as const,
    /** EAS schema UID for "completed ZAO learning track" attestations. TODO. */
    schemaUid: '' as string,
  },

  // -- ZABAL Gamez workshop booking + streaming -----------------------------
  /** ZABAL Gamez runs workshops; the learning center surfaces booking + replays. */
  zabalGames: {
    /** Cal.com slot booker (from brand glossary) */
    bookingUrl: 'https://cal.com/bettercallzaal/zabal-games-workshop-slot',
    /** Default streaming surface */
    restreamUrl: 'https://restream.io',
    /** Workshop library + portal platform */
    portalUrl: 'https://magnetiq.io',
  },

  // -- ZAO platform links (the learning center is the hub) ------------------
  platforms: {
    zaoos: 'https://zaoos.com',
    discord: 'https://discord.thezao.com',
    luma: 'https://luma.com/zao',
    ordao: 'https://zao.frapps.xyz/',
  },
} as const;

export type ZaoConfig = typeof zaoConfig;
