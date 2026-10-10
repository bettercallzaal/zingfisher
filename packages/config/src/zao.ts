/**
 * ZAO community & governance config (UI-facing subset).
 *
 * Canonical, import-safe home for values webapp components need.
 * Multi-tenant architecture decided 2026-09-22 (Zaal Grill decisions, commits
 * 6cbeb028, d3381bff, 7be9b59f).
 */

export const zaoMission = {
  statement:
    'The movement for the new creator economy of bringing the profit margin data and IP rights back to independent artists',
  quoteBy: 'Zaal (Grill 2026-09-22, item 23)',
  principle: 'Music first, community second, tech third'
} as const;

export const zaoTenants = {
  parent: {
    id: 'parent',
    name: 'The ZAO',
    role: 'Front door, commons, and social onboarding (item 25)',
    governanceScope: 'Parent governance Respect earned exclusively via parent fractals (item 26)'
  },
  festivals: {
    id: 'festivals',
    name: 'ZAO Festivals',
    role: 'Dedicated festival brand with isolated fractal and Respect ledger (item 24, 28)',
    events: ['ZAOstock', 'ZAO-CHELLA', 'ZAO-PALOOZA'],
    currentFocus: 'ZAOstock (October 3, 2026 in Ellsworth, ME)'
  },
  subDaos: {
    id: 'sub-daos',
    name: 'Incubated Sub-DAOs',
    role: 'Independent communities running fractals via ZAO tooling (item 27)'
  }
} as const;

/**
 * Access gates in CharmVerse's own TokenGate shape (packages/lib/src/tokenGates/interfaces.ts).
 * Decided in ZAOOS research governance/2657 (Key Decision 2): CharmVerse already evaluates
 * ERC20 with on-chain decimals, ERC1155 by token id, and Hats by wearer, and maps a passing
 * gate to a Role, so The ZAO's access rules are expressed as CharmVerse gates rather than a
 * parallel gate. These definitions are evaluated live by the membership API today and become
 * the TokenGate and Role rows of the ZAO space when Postgres is wired (scripts/seedZaoTokenGates.ts).
 *
 * Quantities follow CharmVerse's convention: ERC20 quantities are in wei after the contract's
 * decimals are read (OG has 18 decimals, measured 2026-10-10), so "1000000000000000000" is one
 * whole Respect; ERC1155 quantities are token counts.
 *
 * Hats (grill 2026-09-22 afternoon item 18): roles only, no platform powers. Hat ids are
 * tree 226's, computed as in ZAO OS src/lib/hats/constants.ts (16-bit levels from bit 224)
 * and matching ZAOOS research governance/059 (Configurator 0x000000e2 0001 0000..., Governance
 * Council Members 0x000000e2 0001 0002 ...).
 */
export const zaoChainIds = { optimism: 10 } as const;

export const zaoContracts = {
  respectOg: '0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957',
  respectZor: '0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c',
  orec: '0xcB05F9254765CA521F7698e61E0A6CA6456Be532',
  hats: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137'
} as const;

export const zaoHatIds = {
  topHat: '0x000000e200000000000000000000000000000000000000000000000000000000',
  configurator: '0x000000e200010000000000000000000000000000000000000000000000000000',
  governanceCouncilMembers: '0x000000e200010002000000000000000000000000000000000000000000000000'
} as const;

export const zaoTokenGates = [
  {
    id: 'zao-respect-holder',
    roleName: 'Respect holder',
    description: 'Holds any Respect: at least one whole OG (ERC-20) or at least one ZOR (ERC-1155 id 0) on Optimism.',
    grants: 'Draft and endorse proposals; vote weight is the whole OG + ZOR sum read separately (item 78).',
    conditions: {
      operator: 'OR',
      accessControlConditions: [
        {
          chain: 10,
          condition: 'evm',
          type: 'ERC20',
          contractAddress: '0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957',
          method: 'balanceOf',
          tokenIds: [],
          quantity: '1000000000000000000',
          name: 'Respect OG'
        },
        {
          chain: 10,
          condition: 'evm',
          type: 'ERC1155',
          contractAddress: '0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c',
          method: 'balanceOf',
          tokenIds: ['0'],
          quantity: '1',
          name: 'ZOR Respect'
        }
      ]
    }
  },
  {
    id: 'zao-hat-configurator',
    roleName: 'ZAO Configurator',
    description: 'Wears the Configurator hat on Hats tree 226 (Optimism).',
    grants: 'Role label only; no platform powers (grill 2026-09-22 afternoon item 18).',
    conditions: {
      operator: 'OR',
      accessControlConditions: [
        {
          chain: 10,
          condition: 'evm',
          type: 'Hats',
          contractAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
          method: 'balanceOf',
          tokenIds: ['6092948358152183923896255948408732171579620885178135789124381753475072'],
          quantity: '1',
          name: 'Configurator hat'
        }
      ]
    }
  },
  {
    id: 'zao-hat-governance-council-member',
    roleName: 'ZAO Governance Council Member',
    description: 'Wears the Governance Council Members hat on Hats tree 226 (Optimism).',
    grants: 'Role label only; no platform powers (grill 2026-09-22 afternoon item 18).',
    conditions: {
      operator: 'OR',
      accessControlConditions: [
        {
          chain: 10,
          condition: 'evm',
          type: 'Hats',
          contractAddress: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
          method: 'balanceOf',
          tokenIds: ['6092948358164738127367029309936403750426036218010340500013309822500864'],
          quantity: '1',
          name: 'Governance Council Members hat'
        }
      ]
    }
  }
] as const;

export const zaoGovernance = {
  weightModel: '1:1 unweighted sum of OG + ZOR Respect (item 1 & 2)',
  authorThreshold: 'Any Respect holder (> 0) can draft (item 4)',
  publishEndorsementThreshold: 1000, // 1000 peer Respect endorsements (item 4)
  zeroRespectPermissions: {
    canRead: true,
    canComment: true,
    canVote: false,
    canDraft: false
  },
  zabalRole: 'Personal group token, future incubated project, no voting power (item 3)'
} as const;

export const zidConfig = {
  protocol: 'ZID',
  newMemberStart: 501,
  reservedOgRange: [1, 500], // ZID 1 is Zaal (grill 2026-09-22 afternoon item 19)
  requirePeerVoucher: true, // item 29: knowable community
  requireDeclaredGoals: true, // item 30: declared creative goals and vision
  hatsTreeId: 226,
  openQuestions: {
    pre73AttendanceCohort: 'Question 6: 47 pre-73 attendance-only members (status: pre_73_attendance, open for Zaal)',
    soloCircleCohort: 'Question 7: 9 solo-circle first rankings (status: solo_circle, open for Zaal)',
    mergedHomeName: 'Merged home definitive brand name (open for Zaal)'
  }
} as const;

export const zabalGames = {
  open: true,
  tagline: 'The front door for builders: come in, build, learn from mentors.',
  tracks: [
    { id: 'artist', name: 'Artist', description: 'Musicians building with emerging tech.' },
    { id: 'builder', name: 'Builder', description: 'Devs and vibe-coders shipping tools and apps.' },
    { id: 'creator', name: 'Creator', description: 'The media and content side.' }
  ],
  season: [
    { month: 'June', phase: 'Bootcamp', detail: 'Workshops and mentors. Learn the stack, meet the people.' },
    { month: 'July', phase: 'Build-a-thon', detail: 'Open build. Ship something real.' },
    { month: 'August', phase: 'Finals', detail: 'Judging and showcase.' }
  ],
  bookingUrl: 'https://cal.com/bettercallzaal/zabal-games-workshop-slot',
  restreamUrl: 'https://restream.io'
} as const;

export const learningTracks = [
  { id: 'zabal-games', name: 'ZABAL Gamez', description: 'Open builder program.', gated: false },
  { id: 'zao-101', name: 'ZAO 101', description: 'What The ZAO is.', gated: false },
  { id: 'zao-os', name: 'ZAO OS', description: 'Fork and run a community OS.', gated: true },
  { id: 'governance', name: 'Governance', description: 'Respect, ORDAO, Hats, fractals.', gated: true }
] as const;

export const zao101 = {
  definition: 'A decentralized impact network. Music first: artists, builders, listeners. Built in public on Base.',
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
      detail: 'The tools that run the org: chat, music player, events, payments, agents. Community-owned and forkable.'
    },
    {
      name: 'Open Source',
      detail: 'Everything in the open. Other music communities can fork the org and ship their own version.'
    }
  ],
  orgModel: [
    { layer: 'The ZAO', note: 'The umbrella and front door. Social onboarding and commons.' },
    {
      layer: 'ZAO Festivals',
      note: 'Dedicated festival brand (ZAOstock, ZAO-CHELLA, ZAO-PALOOZA) with isolated ledger.'
    },
    { layer: 'Incubated', note: 'ZAO-owned with cofounders: WaveWarZ, and future incubated projects like ZABAL.' },
    { layer: 'Partnerships', note: 'Beside The ZAO, not owned: COC Concertz (led by Thy Revolution).' },
    { layer: 'Community collabs', note: 'Co-created work across the ecosystem.' }
  ],
  joinSteps: [
    { step: 'Listen', detail: 'Hear the music at thezao.com. Music first: that is the whole point.' },
    {
      step: 'Declare identity',
      detail: 'Connect wallet or Farcaster, state your creative goals and vision, and claim your permanent ZID.'
    },
    {
      step: 'Show up & get vouched',
      detail: 'Join Monday fractals (6pm EST) to build peer consensus and earn governance Respect.'
    },
    { step: 'Build and govern', detail: 'Vote on proposals, sponsor events, and earn festival standing.' }
  ]
} as const;

export const zaoMusic = {
  principle: 'Music first: that is the whole point. Hear it, then build with the people making it.',
  links: [
    { name: 'Listen on ZAO OS', url: 'https://zaoos.com' },
    { name: 'ZAO on Farcaster', url: 'https://warpcast.com/~/channel/zao' },
    { name: 'WaveWarZ battles', url: 'https://wavewarz.com' }
  ]
} as const;

export const zaoEcosystem = [
  {
    name: 'The ZAO Home',
    blurb: 'Federated community portal, ZID onboarding, and proposal platform.',
    status: 'live',
    url: ''
  },
  { name: 'ZAO OS', blurb: 'The lab + gated Farcaster client.', status: 'live', url: 'https://zaoos.com' },
  { name: 'WaveWarZ', blurb: 'Agentic music battles, per-battle tokens.', status: 'live', url: 'https://wavewarz.com' },
  { name: 'COC Concertz', blurb: 'Metaverse concerts in Stilo World.', status: 'live', url: 'https://cocconcertz.com' },
  {
    name: 'ZAOstock',
    blurb: 'Farcaster-native music festival (Oct 3, Ellsworth ME).',
    status: 'live',
    url: 'https://zaostock.com'
  },
  { name: 'ZAO NEXUS', blurb: 'Ecosystem link hub: 485 links.', status: 'live', url: 'https://nexus.thezao.com' },
  { name: 'zlank', blurb: 'No-code Farcaster Snap builder.', status: 'live', url: 'https://zlank.online' },
  { name: 'ZOUNZ', blurb: 'Farcaster music NFT mini app (Base).', status: 'rnd', url: '' },
  { name: 'FISHBOWLZ', blurb: 'Hot-seat audio rooms (paused: Juke partnership).', status: 'paused', url: '' }
] as const;

export const zaoPlatforms = {
  zaoos: 'https://zaoos.com',
  nexus: 'https://nexus.thezao.com',
  discord: 'https://discord.thezao.com',
  luma: 'https://luma.com/zao',
  ordao: 'https://zao.frapps.xyz/',
  farcaster: 'https://warpcast.com/~/channel/zao',
  wavewarz: 'https://wavewarz.com',
  zaostock: 'https://zaostock.com'
} as const;
