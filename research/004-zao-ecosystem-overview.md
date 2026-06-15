---
topic: community
type: guide
status: research-complete
last-validated: 2026-06-14
related-docs: [001, 002, 003]
original-query: "lets keep researching and building and ideating - put together a full overview of The ZAO and everything in between"
tier: DEEP
---

# 004 - The ZAO: Full Ecosystem Overview

> **Goal:** One canonical map of The ZAO - what it is, how it's organized, every product, governance, agents, tokens, and how this learning center (zingfisher) fits. North-star doc for the learning center and the ZAO 101 track.

Synthesized from `zao-101` (the canonical primer), `zaoos` (the lab + `community.config.ts`), and ~15 product/agent/governance repos under `bettercallzaal`. Addresses and figures are quoted from those repos; items marked TODO/unconfirmed are flagged.

## Key Decisions / Takeaways

| # | Takeaway |
|---|----------|
| 1 | The ZAO is the **umbrella** - "a decentralized impact network. Music first - artists, builders, listeners. Built in public on Base." Principle: **"Music first, community second, tech third."** |
| 2 | Everything else is one of four things: **incubated** (ZAO-owned), **partnership** (beside it, not owned), **internal toolstack** (ZABAL), or **community collab**. Naming rule: say "The ZAO" first; ZABAL is the builder identity, never the umbrella. |
| 3 | Governance is **Respect-based**: weekly Fractal (Respect Game) -> ORDAO/OREC on Optimism + Snapshot polls + a ZOUNZ Nouns DAO on Base. |
| 4 | For zingfisher gating: the "new Respect on Base" is likely **$ZABAL** (`0xbB48…0b07`, Base) - no separate "Respect on Base" contract was found. CONFIRM with Zaal before wiring. |

## 1. What The ZAO is

- **Definition (zao-101):** "A decentralized impact network. Music first - artists, builders, listeners. Built in public on Base." An incubator and impact network; a gated community that governs itself.
- **Principle:** "Music first, community second, tech third."
- **Scale:** 188-member Farcaster community on Base.
- **Built by:** @zaal (Zaal Panthaki), in public. Canonical domain **thezao.com**. Primary contact: DM @zaal on Farcaster.

## 2. Org model (the naming map)

"The ZAO is the umbrella. Everything else is either a project incubated under it, a partnership beside it, or the internal toolstack that builds it."

| Layer | Members | Rule |
|-------|---------|------|
| **The ZAO** (umbrella) | The lead brand, said first every time | Incubator + impact network |
| **Incubated** (ZAO-owned, w/ cofounders) | WaveWarZ (-> own sub-DAO), ZAO Festivals (runs ZAOstock) | "Incubated = ZAO-owned" |
| **Partnerships** (beside, equal billing, NOT owned) | COC Concertz (led by Thy Revolution) | Present "ZAO Festivals + COC Concertz", never "The ZAO's COC" |
| **Internal toolstack** | ZABAL / ZABAL Games | Powers The ZAO, never the front brand |
| **Community collabs** | Misc co-created work | No need to name each |

Two uses of "ZABAL", keep separate: **ZABAL Games** = the public, outsider-facing builder program; **the ZABAL toolstack** = internal tooling. **$ZABAL** = community token on Base (a piece inside the network, not the umbrella).

## 3. The four pillars

1. **Artist Org** - "The ZAO exists because artists needed a community that took them seriously." (ZTalent Artist Organization; releases, shared resources, cyphers, ZAOstock.)
2. **Autonomous Org** - self-governing. Fractal meetings Mondays 6pm EST; Respect tokens (OG + ZOR); "on-chain when it matters, off-chain when it doesn't."
3. **Operating System** - the tools that run the org: chat (ZAO OS), music player, events, payments, agents (ZOE). "Owned by the community, forkable, interoperable."
4. **Open Source** - everything in the open; other music communities can fork the org and ship their own version.

## 4. Product estate

### Live
| Product | What | URL | Notes |
|---------|------|-----|-------|
| **ZAOOS** | The lab + gated Farcaster client | zaoos.com | Next.js 16/Supabase/Farcaster/XMTP. Monorepo "lab"; things graduate to own repo/DB/domain. 302 API routes, ~360 components, ~820 research docs. |
| **CoC Concertz** | Metaverse concerts in Stilo World (Spatial.io) | cocconcertz.com | Partnership (Thy Revolution). 6 shows produced. Firebase/Cloudinary/Twitch. |
| **WaveWarZ (Solana)** | Agentic music battles, per-battle tokens | wavewarz.com | 735 battles, 472.71 SOL volume (~$37.8K), nightly Mon-Fri 8:30pm ET. -> own sub-DAO. |
| **ZAOstock** | Farcaster-native music festival | zaostock.com | Oct 3 2026, Ellsworth ME. First ZAOOS graduate (2026-04-29). ZAO Festivals arm. |
| **ZAO NEXUS** | Ecosystem link hub | nexus.thezao.com | 485 links, 9 categories, 44 brands. Farcaster Mini App + public API. |
| **zlank** | No-code Farcaster Snap builder | zlank.online | 11 block types, Redis short URLs. |
| **ZAOVideoEditor** | Local-first recording studio (transcribe->clip->social) | self-hosted | Whisper + Claude; ZABAL Gamez export to recaps.json. |
| **BetterCallZaal** | Personal consulting site / ecosystem front door | bettercallzaal.com | Static. |

### R&D / building
- **WaveWarZ Base** - L2 port, contracts on Base Sepolia, awaiting technical co-founder.
- **ZOUNZ** - Farcaster music NFT mini app (AI gen + Audius + Zora/mint.club on Base). MVP.
- **WaveWarZ Live** - mobile spectator/alert app (Expo), demo phase.

### Paused / archived
- **FISHBOWLZ** - hot-seat audio rooms, paused 2026-04-16 (Juke partnership). Code in ZAOOS.

## 5. Governance (Respect-based)

- **Fractal / Respect Game** (off-chain): Mondays 6pm EST, groups of 3-6 rank contributions, scored on 2x Fibonacci (110/68/42/26/16/10). 100+ continuous weeks. Bots: ZAO-FRACTAL-BOTV2 + monthly fractalbot variants.
- **ORDAO / OREC** (on-chain, Optimism): Respect-weighted optimistic consent; 2/3 supermajority over a 96h cycle. Deployed at zao.frapps.xyz.
- **Snapshot** (gasless): space `zaal.eth`, approval voting on workstream priorities; approved (>=1000 Respect) auto-post to Farcaster/Bluesky/X.
- **ZOUNZ DAO** (Base): Nouns Builder, daily NFT auctions fund treasury, 1 NFT = 1 vote.

Contracts: Respect OG (ERC-20, OP) `0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957`; ZOR (ERC-1155, OP, id 0) `0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c`; Hats v1 (OP, tree 226) `0x3bc1A0Ad72417f2d411118085256fC53CBdDd137`; ZOUNZ NFT (Base) `0xCB80Ef04DA68667c9a4450013BDD69269842c883`.

## 6. Agent stack

| Agent | Role | Status |
|-------|------|--------|
| **ZOE** | Learning assistant / community tutor | R&D (zoe.zaoos.com) |
| **Hermes** | Supervisor framework - spawns/watches Claude subagents | Pre-alpha (`hermes-orchestrator`) |
| **Farscout** | Autonomous Farcaster research scout -> Discord briefs | Live (VPS, 24/7) |
| **Zaoscribe** | Discord audio capture -> Whisper -> action items | Ready |
| **Zaocowork** | VPS research pipeline -> Bonfire KG | Live (weekly/Telegram) |
| **ZABAL Agent** | Coordination bot (prices, recaps) on ElizaOS | Live |

(Pixels / Paperclip / AO dashboards referenced under *.zaoos.com - purpose unconfirmed.)

## 7. Token model

| Token | Type | Chain | Address | For |
|-------|------|-------|---------|-----|
| Respect (OG) | ERC-20 | Optimism | `0x34cE…6957` | Reputation/voting from Fractal |
| Respect (ZOR) | ERC-1155 | Optimism | `0x9885…445c` (id 0) | Alt Respect representation |
| $ZABAL | ERC-20 | Base | `0xbB48f19B0494Ff7C1fE5Dc2032aeEE14312f0b07` | Community token (Clanker v4); governance weight |
| SANG | ERC-20 | Base | `0x4FF4d349CAa028BD069bbE85fA05253f96176741` | SongJam AI agent token |
| ZOUNZ | ERC-721 | Base | `0xCB80…c883` | Nouns DAO NFT, 1 = 1 vote |
| ZOE / ZOLs / FISHBOWLZ | unclear | - | - | Referenced; no confirmed contract |

(ZABAL/SANG addresses are agent-reported from `zabalbot/character.ts` - verify on Basescan before use.)

## 8. Tech stack (estate-wide)

Next.js 14-16 + React 18-19 + TypeScript + Tailwind; Supabase (Postgres + RLS); auth via Farcaster/Neynar (SIWF) + Privy; Base (primary chain) + Solana (WaveWarZ) + Optimism (Respect/Hats); 100ms/Stream.io (audio); Arweave (permanent storage); Anthropic Claude (agents/LLM); Vercel (hosting). The `community.config.ts` one-file fork pattern is the estate convention - zingfisher mirrors it as `zao.config.ts`.

## 9. How zingfisher (this learning center) fits

The learning center is the **front door to learning + credentialing** across the estate:
- **ZAO 101 track** - reuse zao-101 copy (pillars, org, ecosystem, FAQ). Open.
- **ZABAL Games track** - the builder program (Artist/Builder/Creator, June Bootcamp -> July Build-a-thon -> Aug Finals). Open, ungated.
- **Member tracks** (ZAO OS, Governance) - gated by Respect (OP) / $ZABAL (Base).
- **Credentials** - issue on-chain attestations on Base when a member finishes a track.
- **Hub role** - links out to every platform (zaoos, NEXUS, Discord, Luma, ORDAO); content links back in.

## Ideation - what to build next on this base

1. **ZAO 101 content import** - seed zao-101 pages as CharmVerse docs/databases (the open intro track).
2. **Respect gate** - port `zaoos/src/lib/spaces/tokenGate.ts`; gate member tracks on Respect (OP) + $ZABAL (Base, pending confirm).
3. **ZABAL Games season page** - embed Cal.com booking + Restream replays + build-status hub; cohort directory.
4. **Credential issuance** - EAS attestation on Base on track completion -> ties into Respect.
5. **ZOE tutor surface** - a learning-assistant agent in the center.
6. **NEXUS cross-link** - pull the 485-link directory in as a resource index.

## Next Actions

| Action | Owner | Type | By When |
|--------|-------|------|---------|
| Confirm Base gate = $ZABAL (`0xbB48…0b07`) or a separate Respect-on-Base | @Zaal | Decision | Before gate wiring |
| Verify ZABAL/SANG addresses on Basescan | @loop | Task | Next iterations |
| Seed ZAO 101 + ZABAL Games tracks as content | @loop | Task | Next iterations |
| Port tokenGate.ts pattern for Respect gating | @loop | Task | After gate confirm |

## Sources

- [zao-101](https://github.com/bettercallzaal/zao-101) - canonical primer (index/pillars/org/ecosystem/faq/join/zabal-games). [FULL]
- [zaoos](https://github.com/bettercallzaal/zaoos) README + `community.config.ts`. [FULL]
- Product repos: CoCConcertZ, wwbase, wavewarzapp, ZOUNZ, fishbowlz, zao-stock/zaostock, ZAONEXUS, zlank, ZAOVideoEditor, bettercallzaalwebsite. [FULL]
- Governance/agents/tokens: ZAO-FRACTAL-BOTV2, fractalbot*, hermes-orchestrator, farscout, zaoscribe, zaocowork, zabalbot. [FULL]
- Addresses cross-checked across two independent reader agents; $ZABAL/$SANG flagged for on-chain verification. [PARTIAL - on-chain verification pending]
