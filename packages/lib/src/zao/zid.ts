/**
 * ZID (ZAO Identity) Protocol and Multi-Tenant Member Profile Engine.
 *
 * Ground truth references:
 * - Zaal Grill Decisions 2026-09-22 (commits 6cbeb028, d3381bff, 7be9b59f in ~/zao-vault):
 *   - Item 12: Instant ZID assignment on first sign-in.
 *   - Item 13: 4-panel member page design.
 *   - Item 14: Zero-Respect read and comment permissions.
 *   - Item 23: Creator economy mission statement.
 *   - Item 24 & 26: ZAO Festivals isolated ledger; parent governance exclusively via parent fractals.
 *   - Item 29: Knowable community: pseudonyms permitted with peer voucher.
 *   - Item 30: Stated creative goals and vision protocol requirement.
 *   - Item 31: ZID identity layer rooted in ZAO Fractal.
 *   - Decision 2026-09-01: Allocation standard (ZID 0 Zaal, 1-500 reserved for OGs/existing, 501+ new members).
 *
 * Open questions left for Zaal (do not design around an assumed answer):
 * - Question 6: 47 pre-73 attendance-only members (status: pre_73_attendance, open for Zaal).
 * - Question 7: 9 solo-circle first rankings (status: solo_circle, open for Zaal).
 * - Seniority ranking of genesis 22 and allocation of reserved ZIDs 1-500 (open for Zaal).
 * - Merged home portal definitive brand name.
 *
 * ESTATE INVARIANTS:
 * - No hardcoded or fabricated seed profiles, balances, or ceremony rows.
 * - All governance weights and Respect balances MUST be read live from chain.
 * - A failed chain read produces UNKNOWN (null), NEVER 0, NEVER "clean".
 * - A number nobody could compute is not zero.
 * - Unestablished ledgers (ZAO Festivals, incubated sub-DAOs) must render as
 *   "not yet established" without placeholder numbers.
 */

export type VoucherStatus =
  | 'verified' // Peer voucher confirmed on-chain or in ranked era circle (periods 73-108)
  | 'pending_vouch' // New member or unvouched handle; requires peer voucher per item 29
  | 'solo_circle' // Ranked era circle had 1 member; Open Question 7 pending Zaal ruling
  | 'pre_73_attendance' // Attended sessions pre-73; peer recovery pending Zaal ruling on Question 6
  | 'unrecorded'; // Holds tokens on chain but unrecorded in session records

export interface MultiLedgerRespect {
  parentZao: {
    ogBalance: string | null; // null if read failed; NEVER "0" on failure
    zorBalance: string | null; // null if read failed; NEVER "0" on failure
    governanceWeight: string | null; // null if read failed; NEVER "0" on failure
    chainReadStatus?: 'ok' | 'error' | 'pending';
    chainError?: string;
  };
  zaoFestivals: {
    status: 'not_yet_established'; // Decided 2026-09-22; contract deployment pending (item 24, 28)
  };
  incubated: {
    status: 'not_yet_established'; // Sub-DAO tooling in development (item 27)
  };
}

export interface CeremonyRecord {
  period: number;
  tenant: 'parent' | 'festivals';
  date: string;
  rank?: number; // 1 to 6
  respectAwarded: number; // Fibonacci: 110, 68, 42, 26, 16, 10
  txHash?: string; // Optimism transaction hash
  circleSize?: number;
}

export interface MemberPermissions {
  canRead: boolean; // true for all
  canComment: boolean; // true for zero-Respect members (item 14)
  canDraftProposal: boolean; // true for any verified Respect holder (> 0) (item 4)
  canPublishProposal: boolean; // requires 1,000 peer Respect endorsements (item 4)
  canVote: boolean; // true for any verified Respect holder (> 0) (item 1)
}

export interface ZidProfile {
  zid: number | null; // null if unassigned (reserved 1-500 range pending Zaal ruling)
  formattedZid: string; // e.g. "ZID-000" (Zaal), "ZID-501", or "UNASSIGNED"
  address: string; // Lowercase 0x wallet address
  displayName: string;
  handle: string;
  bio?: string;
  goalsAndVision: string; // Mandatory declared intent per item 30
  voucher: {
    status: VoucherStatus;
    voucherAddress?: string;
    voucherName?: string;
    circlePeriod?: number;
    note?: string;
  };
  joinedAt: string; // ISO timestamp
  socials: {
    farcaster?: string;
    discord?: string;
    twitter?: string;
    ens?: string;
  };
  hats: number[]; // Hats Tree 226 IDs
  ledgers: MultiLedgerRespect;
  governance: {
    authoredCount: number;
    endorsedCount: number;
    votesCast: number;
  };
  fractalHistory: CeremonyRecord[]; // Mirrors real chain/bot records; empty array if none mirrored
  permissions: MemberPermissions;
}

/** Formats integer ZID into canonical display string (e.g. 0 -> ZID-000, 501 -> ZID-501). */
export function formatZid(zid: number | null): string {
  if (zid === null) {
    return 'UNASSIGNED';
  }
  if (zid < 0) {
    throw new Error('ZID cannot be negative');
  }
  const padded = zid.toString().padStart(3, '0');
  return `ZID-${padded}`;
}

/** Parses string or numeric ZID back to integer (e.g. "ZID-501" -> 501, "501" -> 501). */
export function parseZid(val: string | number): number | null {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val >= 0 ? val : null;
  }
  const clean = val.trim().toUpperCase();
  if (clean === 'UNASSIGNED') {
    return null;
  }
  const match = clean.match(/^(?:ZID-)?(\d+)$/);
  if (!match || !match[1]) {
    return null;
  }
  return parseInt(match[1], 10);
}

/**
 * Computes Parent ZAO Governance Weight as 1:1 unweighted sum of OG + ZOR (Zaal ruling Q1 & Q2).
 * If either input is null (failed read), returns null (UNKNOWN). NEVER returns "0" on error.
 */
export function calculateGovernanceWeight(
  ogBalance: bigint | string | number | null,
  zorBalance: bigint | string | number | null
): string | null {
  if (ogBalance === null || zorBalance === null) {
    return null; // A number nobody could compute is not zero
  }
  const og = BigInt(typeof ogBalance === 'number' ? Math.floor(ogBalance) : ogBalance || '0');
  const zor = BigInt(typeof zorBalance === 'number' ? Math.floor(zorBalance) : zorBalance || '0');
  return (og + zor).toString();
}

/**
 * Validates declared creative goals and vision statement per item 30:
 * "one of the parts of the protocol is that you need to identity your self and
 * your goals and vision so that others can understand and allign with that together".
 */
export function validateDeclaredGoals(statement: string): { valid: boolean; reason?: string } {
  if (!statement || typeof statement !== 'string') {
    return { valid: false, reason: 'Declared creative goals and vision statement is mandatory per protocol item 30' };
  }
  const trimmed = statement.trim();
  if (trimmed.length < 15) {
    return {
      valid: false,
      reason: 'Please share a substantive statement of your creative goals and vision (at least 15 characters)'
    };
  }
  return { valid: true };
}

/** Validates member handle format (alphanumeric, underscores, hyphens). */
export function validateHandle(handle: string): { valid: boolean; reason?: string } {
  if (!handle || typeof handle !== 'string') {
    return { valid: false, reason: 'Handle is required' };
  }
  const trimmed = handle.trim().replace(/^@/, '');
  if (!/^[a-zA-Z0-9_.-]{2,32}$/.test(trimmed)) {
    return { valid: false, reason: 'Handle must be 2-32 characters (alphanumeric, underscores, hyphens)' };
  }
  return { valid: true };
}

/** Determines permissions for a member profile, including zero-Respect capabilities (item 14). */
export function getMemberPermissions(profile: {
  governanceWeight?: string | number | null;
  permissions?: Partial<MemberPermissions>;
}): MemberPermissions {
  const hasRespect =
    profile.governanceWeight !== null && profile.governanceWeight !== undefined
      ? BigInt(profile.governanceWeight.toString() || '0') > BigInt(0)
      : false;

  return {
    canRead: true, // All visitors / members can read
    canComment: true, // Zero-Respect members can comment (item 14)
    canDraftProposal: hasRespect, // Any verified Respect holder can draft (item 4)
    canPublishProposal: hasRespect, // Published once proposal has 1,000 peer endorsements (item 4)
    canVote: hasRespect, // Only Respect holders carry vote weight (item 1)
    ...profile.permissions
  };
}

/** Classifies voucher status according to consensus records and open questions. */
export function classifyVoucherStatus(options: {
  hasExplicitPeerVoucher?: boolean;
  circleRankRecorded?: boolean;
  circleSize?: number;
  attendedPre73Only?: boolean;
  unrecordedTokenHolder?: boolean;
}): VoucherStatus {
  if (options.hasExplicitPeerVoucher) {
    return 'verified';
  }
  if (options.circleRankRecorded) {
    if (options.circleSize && options.circleSize <= 1) {
      // Open Question 7: 9 solo-circle first rankings pending Zaal ruling
      return 'solo_circle';
    }
    return 'verified';
  }
  if (options.attendedPre73Only) {
    // Open Question 6: 47 pre-73 attendance-only members pending Zaal ruling
    return 'pre_73_attendance';
  }
  if (options.unrecordedTokenHolder) {
    return 'unrecorded';
  }
  // Brand new user or no consensus vouch yet (item 29)
  return 'pending_vouch';
}

// ---------------------------------------------------------------------------
// Runtime Registry (Stores newly registered joiners; NO fabricated seed profiles)
// ---------------------------------------------------------------------------

const runtimeProfiles = new Map<string, ZidProfile>();

// Zaal address is canonical; ZID 0 was explicitly decided for him (2026-08-25)
export const ZAAL_ADDRESS = '0x7234c36a71ec237c2ae7698e8916e0735001e9af';

let nextMemberZidSequence = 501; // Decision 2026-09-01: new members start at 501

/** Looks up profile by wallet address or ZID identifier. */
export function getZidProfile(identifier: string | number): ZidProfile | null {
  if (typeof identifier === 'number') {
    return runtimeProfiles.get(identifier.toString()) || null;
  }
  const clean = identifier.trim().toLowerCase();
  if (clean.startsWith('0x')) {
    return runtimeProfiles.get(clean) || null;
  }
  const parsedNum = parseZid(clean);
  if (parsedNum !== null) {
    return runtimeProfiles.get(parsedNum.toString()) || null;
  }
  return null;
}

/** Lists registered ZID profiles. */
export function listZidProfiles(): ZidProfile[] {
  const unique = new Map<string, ZidProfile>();
  for (const p of runtimeProfiles.values()) {
    unique.set(p.address, p);
  }
  return Array.from(unique.values());
}

/**
 * Assigns the next permanent ZID and creates a profile upon onboarding.
 * Validates declared goals and vision (item 30).
 * Allocates from 501+ for new joiners; does NOT assign any ZID in the reserved 1-500 range.
 */
export function assignNextZid(input: {
  address: string;
  displayName: string;
  handle: string;
  goalsAndVision: string;
  bio?: string;
  farcasterHandle?: string;
  discordHandle?: string;
  voucherAddress?: string;
  voucherName?: string;
}): ZidProfile {
  const normAddress = input.address.toLowerCase();

  // Return existing profile if already registered
  const existing = runtimeProfiles.get(normAddress);
  if (existing) {
    return existing;
  }

  // Validate declared goals per protocol item 30
  const goalsValidation = validateDeclaredGoals(input.goalsAndVision);
  if (!goalsValidation.valid) {
    throw new Error(goalsValidation.reason);
  }

  const handleValidation = validateHandle(input.handle);
  if (!handleValidation.valid) {
    throw new Error(handleValidation.reason);
  }

  // Zaal is ZID 0 per 2026-08-25 decision; new joiners start at 501+
  let zid: number | null = null;
  if (normAddress === ZAAL_ADDRESS.toLowerCase()) {
    zid = 0;
  } else {
    zid = nextMemberZidSequence;
    nextMemberZidSequence += 1;
  }
  const formattedZid = formatZid(zid);

  const voucherStatus = classifyVoucherStatus({
    hasExplicitPeerVoucher: Boolean(input.voucherAddress || input.voucherName)
  });

  const profile: ZidProfile = {
    zid,
    formattedZid,
    address: normAddress,
    displayName: input.displayName.trim() || input.handle.trim(),
    handle: input.handle.trim().replace(/^@/, ''),
    bio: input.bio?.trim() || '',
    goalsAndVision: input.goalsAndVision.trim(),
    voucher: {
      status: voucherStatus,
      voucherAddress: input.voucherAddress?.toLowerCase(),
      voucherName: input.voucherName,
      note:
        voucherStatus === 'pending_vouch'
          ? 'Pseudonymous handle pending peer voucher (item 29)'
          : 'Vouched on onboarding'
    },
    joinedAt: new Date().toISOString(),
    socials: {
      farcaster: input.farcasterHandle?.trim().replace(/^@/, ''),
      discord: input.discordHandle?.trim()
    },
    hats: [],
    ledgers: {
      parentZao: {
        ogBalance: null,
        zorBalance: null,
        governanceWeight: null,
        chainReadStatus: 'pending'
      },
      zaoFestivals: { status: 'not_yet_established' },
      incubated: { status: 'not_yet_established' }
    },
    governance: { authoredCount: 0, endorsedCount: 0, votesCast: 0 },
    fractalHistory: [], // Mirrored from chain in Phase 3; no fabricated records
    permissions: getMemberPermissions({ governanceWeight: null })
  };

  runtimeProfiles.set(normAddress, profile);
  if (zid !== null) {
    runtimeProfiles.set(zid.toString(), profile);
  }
  return profile;
}
