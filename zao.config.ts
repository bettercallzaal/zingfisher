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
  /** Canonical ZAO palette (verified against zao-101/style.css). Wired into
   *  packages/config/src/colors.ts (zaoPrimary). */
  colors: {
    primary: '#f5a623', // --gold
    primaryHover: '#ffd700', // --gold-hot
    background: '#0a1628', // --navy
    surface: '#0d1b2a', // --navy-2
    surfaceLight: '#1a2a3a',
    text: '#e2e8f0', // --ink
    textMuted: '#94a3b8' // --ink-2
  },
  /** Brand font - wire into apps/webapp/theme/fonts.ts + pages/_document.tsx */
  font: 'Inter', // TODO: confirm ZAO typeface with Zaal

  // -- Membership gating ----------------------------------------------------
  /** Gate ZAO-member-only content. NOTE: ZABAL Games is OPEN to non-members
   *  (zao-101/zabal-games.html) - do not gate that track. Only member tracks gate.
   *  Pattern to port: zaoos/src/lib/spaces/tokenGate.ts (viem, ERC-20/721/1155).
   *  TODO (needs Zaal): confirm which contract IS the membership gate, or whether
   *  member access is Farcaster-channel based. Candidates below are real ZAO
   *  contracts but their gate role is unconfirmed. */
  gating: {
    enabled: true,
    memberGateConfirmed: false,
    candidates: {
      zabalNounsBase: '0xCB80Ef04DA68667c9a4450013BDD69269842c883' as `0x${string}`, // ERC-721, Base
      respectOgOptimism: '0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957' as `0x${string}`, // ERC-20, OP
      zorOptimism: '0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c' as `0x${string}` // ERC-1155, OP
    }
  },

  // -- Farcaster (ZAO is a Farcaster-native community) ----------------------
  farcaster: {
    /** App FID from Neynar dashboard. zaoos uses 19640. */
    appFid: 19640,
    /** Channels surfaced as discussion rooms in the forum/community surface */
    channels: ['zao', 'zabal', 'cocconcertz', 'wavewarz'],
    defaultChannel: 'zao',
    /** Sign In With Farcaster as an auth method alongside CharmVerse's wallet auth */
    siwfEnabled: true
  },

  // -- Admin ----------------------------------------------------------------
  adminFids: [19640],
  adminWallets: [] as `0x${string}`[],

  // -- Learning catalog (maps to CharmVerse "databases" = course catalog) ---
  /** Top-level areas. Each becomes a CharmVerse database/board view.
   *  `gated: false` = open to anyone (ZABAL Games, ZAO 101 intro);
   *  `gated: true`  = ZAO-member-only (uses gating.candidates above). */
  tracks: [
    {
      id: 'zabal-games',
      name: 'ZABAL Games',
      emoji: '[BUILD]',
      description: 'The front door for builders - open program, hackathon/bootcamp energy',
      gated: false
    },
    {
      id: 'zao-101',
      name: 'ZAO 101',
      emoji: '[INTRO]',
      description: 'What The ZAO is - artist org, autonomous org, ecosystem, pillars',
      gated: false
    },
    {
      id: 'zao-os',
      name: 'ZAO OS',
      emoji: '[OS]',
      description: 'Fork and run a community OS',
      gated: true
    },
    {
      id: 'governance',
      name: 'Governance',
      emoji: '[GOV]',
      description: 'Respect, ORDAO, Hats, fractals',
      gated: true
    }
  ],

  // -- On-chain credentials (maps to packages/credentials - EAS-style) ------
  /** Issue completion certificates / attestations when a member finishes a track.
   *  CharmVerse already ships a credentials package; wire it to ZAO attestations. */
  credentials: {
    enabled: true,
    chain: 'base' as const,
    /** EAS schema UID for "completed ZAO learning track" attestations. TODO. */
    schemaUid: '' as string
  },

  // -- ZABAL Games (open builder program) -----------------------------------
  /** "The front door for builders" - open to non-members (zao-101/zabal-games.html).
   *  A public program, NOT the internal "ZABAL toolstack" - keep those separate. */
  zabalGames: {
    open: true, // anyone can join; this track is not gated
    /** The three entry tracks builders pick from */
    tracks: ['Artist', 'Builder', 'Creator'] as const,
    /** Season arc (TODO: confirm exact dates with Zaal) */
    season: {
      bootcamp: 'June - workshops + mentors, learn the stack',
      buildathon: 'July - open build, ship something real',
      finals: 'August - judging + showcase'
    },
    /** Cal.com slot booker */
    bookingUrl: 'https://cal.com/bettercallzaal/zabal-games-workshop-slot',
    /** Default streaming surface */
    restreamUrl: 'https://restream.io',
    /** Workshop library + portal platform */
    portalUrl: 'https://magnetiq.io'
  },

  // -- ZAO platform links (the learning center is the hub) ------------------
  platforms: {
    zaoos: 'https://zaoos.com',
    discord: 'https://discord.thezao.com',
    luma: 'https://luma.com/zao',
    ordao: 'https://zao.frapps.xyz/'
  }
} as const;

export type ZaoConfig = typeof zaoConfig;
