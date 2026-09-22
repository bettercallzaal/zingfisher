/**
 * ZAO Community & Governance Configuration (zingfisher)
 *
 * The canonical configuration file for The ZAO portal fork (CharmVerse fork).
 * Multi-tenant federation architecture decided 2026-09-22 (Zaal Grill decisions,
 * commits 6cbeb028, d3381bff, 7be9b59f in ~/zao-vault):
 *
 * 1. The Mission (item 23): "the movement for the new creator economy of bringing
 *    the profit margin data and ip rights back to independed artists".
 * 2. Multi-Tenant Federation (items 24-28):
 *    - The ZAO parent: front door, commons, and social onboarding.
 *    - Parent ZAO governance Respect: earned exclusively through parent ZAO fractals.
 *    - ZAO Festivals: dedicated brand with isolated fractal and Respect ledger.
 *    - Sub-DAOs: incubated communities run fractals using ZAO tooling.
 * 3. Protocol & Identity (items 29-31):
 *    - Knowable community: pseudonyms permitted with a peer voucher (item 29).
 *    - Declared goals and vision: mandatory protocol requirement on entry (item 30).
 *    - ZID identity layer rooted in ZAO Fractal (item 31).
 *    - Allocation standard (2026-09-01): ZID 0 Zaal, 1-500 OGs/existing, 501+ new joiners.
 *
 * Open questions left for Zaal (do not design around an assumed answer):
 * - Question 6: 47 pre-73 attendance-only members (grandfathered vs reconstructed).
 * - Question 7: 9 solo-circle first rankings (handling open).
 * - Merged home portal definitive brand name.
 */

export const zaoConfig = {
  // -- Mission & Branding ---------------------------------------------------
  /** Brand name (definitive merged home name pending Zaal confirmation) */
  name: "The ZAO",
  /** Constitutional mission statement (Zaal verbatim, item 23) */
  mission: "The movement for the new creator economy of bringing the profit margin data and IP rights back to independent artists",
  tagline: "Music first, community second, tech third",
  colors: {
    primary: "#f5a623", // --gold
    primaryHover: "#ffd700", // --gold-hot
    background: "#0a1628", // --navy
    surface: "#0d1b2a", // --navy-2
    surfaceLight: "#1a2a3a",
    text: "#e2e8f0", // --ink
    textMuted: "#94a3b8" // --ink-2
  },
  font: "Inter",

  // -- Multi-Tenant Federation ----------------------------------------------
  tenants: {
    parent: {
      id: "parent",
      name: "The ZAO",
      role: "Front door, commons, and social onboarding (item 25)",
      governanceScope: "Parent ZAO governance Respect earned exclusively via parent fractals (item 26)",
      contracts: {
        optimism: {
          /** Respect OG (ERC-20) */
          ogContract: "0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957" as `0x${string}`,
          /** ZOR Respect (ERC-1155, token id 0) */
          zorContract: "0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c" as `0x${string}`,
          zorTokenId: 0,
          /** OREC Proposal Contract */
          orecContract: "0xcB05F9254765CA521F7698e61E0A6CA6456Be532" as `0x${string}`
        }
      }
    },
    festivals: {
      id: "festivals",
      name: "ZAO Festivals",
      role: "Dedicated brand with isolated fractal and Respect ledger (item 24, 28)",
      governanceScope: "Festival Respect ledger isolated from parent OREC voting power",
      events: ["ZAOstock", "ZAO-CHELLA", "ZAO-PALOOZA"],
      currentFocus: "ZAOstock (October 3, 2026 in Ellsworth, ME)"
    },
    subDaos: {
      id: "sub-daos",
      name: "Incubated Sub-DAOs",
      role: "Independent communities running fractals via ZAO tooling (item 27)"
    }
  },

  // -- Governance & Voting Model --------------------------------------------
  governance: {
    /** 1:1 unweighted sum of OG + ZOR Respect (Zaal ruling Q1 & Q2) */
    votingWeightModel: "og_plus_zor_1_to_1" as const,
    /** Author threshold: any Respect holder (> 0) can draft (Zaal ruling Q4) */
    draftThreshold: "any_respect" as const,
    /** Publish threshold: 1,000 peer Respect endorsements (Zaal ruling Q4) */
    publishEndorsementThreshold: 1000,
    /** Zero-Respect members have read and comment capabilities (item 14) */
    zeroRespectPermissions: {
      canRead: true,
      canComment: true,
      canVote: false,
      canDraft: false
    },
    /** $ZABAL status: personal group token, future incubated project, no voting rights (Zaal ruling Q3) */
    zabalToken: {
      role: "future_incubated",
      address: "0xbB48f19B0494Ff7C1fE5Dc2032aeEE14312f0b07" as `0x${string}`,
      chainId: 8453,
      hasVotingPower: false
    }
  },

  // -- ZID Identity Protocol (items 29-31) -----------------------------------
  identity: {
    protocol: "ZID",
    sequenceStartNewMembers: 501,
    reservedOgRange: [0, 500],
    requirePeerVoucher: true, // item 29: pseudonyms allowed only with peer voucher
    requireDeclaredGoals: true, // item 30: mandatory stated creative goals & vision
    hatsProtocolTreeId: 226, // Tree 226 for organizational roles
    openQuestions: {
      pre73AttendanceCohort: "Question 6: 47 pre-73 attendance-only members (status: pre_73_attendance, open for Zaal)",
      soloCircleCohort: "Question 7: 9 solo-circle first rankings (status: solo_circle, open for Zaal)",
      mergedHomeName: "Merged home definitive brand name (open for Zaal)"
    }
  },

  // -- Farcaster ------------------------------------------------------------
  farcaster: {
    appFid: 19640,
    channels: ["zao", "zabal", "cocconcertz", "wavewarz"],
    defaultChannel: "zao",
    siwfEnabled: true
  },

  // -- Admin ----------------------------------------------------------------
  adminFids: [19640],
  adminWallets: ["0x7234c36a71ec237c2ae7698e8916e0735001e9af"] as `0x${string}`[], // Zaal

  // -- ZABAL Games (open builder program) -----------------------------------
  zabalGames: {
    open: true,
    tracks: ["Artist", "Builder", "Creator"] as const,
    season: {
      bootcamp: "June: workshops + mentors, learn the stack",
      buildathon: "July: open build, ship something real",
      finals: "August: judging + showcase"
    },
    bookingUrl: "https://cal.com/bettercallzaal/zabal-games-workshop-slot",
    restreamUrl: "https://restream.io",
    portalUrl: "https://magnetiq.io"
  },

  // -- Platforms ------------------------------------------------------------
  platforms: {
    zaoos: "https://zaoos.com",
    nexus: "https://nexus.thezao.com",
    discord: "https://discord.thezao.com",
    luma: "https://luma.com/zao",
    ordao: "https://zao.frapps.xyz/",
    farcaster: "https://warpcast.com/~/channel/zao",
    wavewarz: "https://wavewarz.com",
    zaostock: "https://zaostock.com"
  }
} as const;

export type ZaoConfig = typeof zaoConfig;
