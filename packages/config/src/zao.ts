/**
 * ZAO learning-center config (UI-facing subset).
 *
 * Canonical, import-safe home for the values webapp components need (the root
 * `zao.config.ts` is the human-facing fork doc; this is what code imports).
 * Verified against zao-101 (the canonical ZAO primer).
 */

export const zabalGames = {
  /** Open builder program - anyone can join, NOT member-gated (zao-101). */
  open: true,
  tagline: 'The front door for builders - come in, build, learn from mentors.',
  /** The three entry tracks builders pick from */
  tracks: [
    { id: 'artist', name: 'Artist', description: 'Musicians building with emerging tech.' },
    { id: 'builder', name: 'Builder', description: 'Devs and vibe-coders shipping tools and apps.' },
    { id: 'creator', name: 'Creator', description: 'The media and content side.' }
  ],
  /** Season arc (TODO: confirm exact dates with Zaal) */
  season: [
    { month: 'June', phase: 'Bootcamp', detail: 'Workshops and mentors. Learn the stack, meet the people.' },
    { month: 'July', phase: 'Build-a-thon', detail: 'Open build. Ship something real.' },
    { month: 'August', phase: 'Finals', detail: 'Judging and showcase.' }
  ],
  bookingUrl: 'https://cal.com/bettercallzaal/zabal-games-workshop-slot',
  restreamUrl: 'https://restream.io',
  portalUrl: 'https://magnetiq.io'
} as const;

/** Top-level learning catalog. `gated` => ZAO-member-only (Respect / $ZABAL). */
export const learningTracks = [
  { id: 'zabal-games', name: 'ZABAL Games', description: 'Open builder program.', gated: false },
  { id: 'zao-101', name: 'ZAO 101', description: 'What The ZAO is.', gated: false },
  { id: 'zao-os', name: 'ZAO OS', description: 'Fork and run a community OS.', gated: true },
  { id: 'governance', name: 'Governance', description: 'Respect, ORDAO, Hats, fractals.', gated: true }
] as const;

/** ZAO 101 - the open intro track. Copy is from zao-101 (the canonical primer). */
export const zao101 = {
  definition: 'A decentralized impact network. Music first - artists, builders, listeners. Built in public on Base.',
  principle: 'Music first, community second, tech third.',
  pillars: [
    {
      name: 'Artist Org',
      detail: 'The ZAO exists because artists needed a community that took them seriously.'
    },
    {
      name: 'Autonomous Org',
      detail: 'The community governs itself. Fractal meetings Mondays 6pm EST; Respect tokens (OG + ZOR).'
    },
    {
      name: 'Operating System',
      detail: 'The tools that run the org - chat, music player, events, payments, agents. Community-owned and forkable.'
    },
    {
      name: 'Open Source',
      detail: 'Everything in the open. Other music communities can fork the org and ship their own version.'
    }
  ],
  /** Umbrella org model - keep the naming layers straight. */
  orgModel: [
    { layer: 'The ZAO', note: 'The umbrella. Said first, every time.' },
    { layer: 'Incubated', note: 'ZAO-owned with cofounders - WaveWarZ, ZAO Festivals (ZAOstock).' },
    { layer: 'Partnerships', note: 'Beside The ZAO, not owned - COC Concertz (led by Thy Revolution).' },
    { layer: 'Internal toolstack', note: 'ZABAL / ZABAL Games. Powers The ZAO, never the front brand.' },
    { layer: 'Community collabs', note: 'Co-created work.' }
  ],
  joinSteps: [
    { step: 'Listen', detail: 'Hear the music at thezao.com. Music first - that is the whole point.' },
    { step: 'Show up', detail: 'Join Farcaster, follow @zaal, drop into a Monday fractal (6pm EST).' },
    { step: 'Pick a door', detail: 'Artist, builder, or supporter.' },
    { step: 'Say hi', detail: 'DM @zaal on Farcaster - tell us what you want to work on.' }
  ]
} as const;

/** ZAO product estate (from research doc 004). status: live | rnd | paused. */
export const zaoEcosystem = [
  { name: 'ZAO OS', blurb: 'The lab + gated Farcaster client.', status: 'live', url: 'https://zaoos.com' },
  { name: 'WaveWarZ', blurb: 'Agentic music battles, per-battle tokens.', status: 'live', url: 'https://wavewarz.com' },
  { name: 'COC Concertz', blurb: 'Metaverse concerts in Stilo World.', status: 'live', url: 'https://cocconcertz.com' },
  {
    name: 'ZAOstock',
    blurb: 'Farcaster-native music festival (Oct 3, Ellsworth ME).',
    status: 'live',
    url: 'https://zaostock.com'
  },
  { name: 'ZAO NEXUS', blurb: 'Ecosystem link hub - 485 links.', status: 'live', url: 'https://nexus.thezao.com' },
  { name: 'zlank', blurb: 'No-code Farcaster Snap builder.', status: 'live', url: 'https://zlank.online' },
  { name: 'ZOUNZ', blurb: 'Farcaster music NFT mini app (Base).', status: 'rnd', url: '' },
  { name: 'FISHBOWLZ', blurb: 'Hot-seat audio rooms (paused - Juke partnership).', status: 'paused', url: '' }
] as const;

export const zaoPlatforms = {
  zaoos: 'https://zaoos.com',
  nexus: 'https://nexus.thezao.com',
  discord: 'https://discord.thezao.com',
  luma: 'https://luma.com/zao',
  ordao: 'https://zao.frapps.xyz/',
  farcaster: 'https://warpcast.com/~/channel/zao'
} as const;
