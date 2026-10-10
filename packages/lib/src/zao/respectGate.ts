import { createPublicClient, http, type Address, type Chain } from 'viem';
import { base, mainnet, optimism } from 'viem/chains';

/**
 * ZAO Governance & Membership Gates.
 *
 * Decisions 2026-09-22 (Zaal Grill decisions, commits 6cbeb028, d3381bff, 7be9b59f):
 * - Voting weight: 1:1 unweighted sum of OG (ERC-20) + ZOR (ERC-1155, id 0) on Optimism.
 *   Ruling 2026-10-10 (vault decisions/grill-2026-10-09-seat-morning.md item 78): the sum is
 *   OG + ZOR in WHOLE Respect. OG has 18 decimals (decimals() measured on Optimism 2026-10-10),
 *   ZOR is an integer ERC-1155 balance, so OG is divided by 10^18 before the two are added.
 *   Before this fix the raw wei was summed and Zaal's wallet read 3094e18 + 858.
 * - Parent ZAO governance Respect is earned exclusively through parent ZAO fractals.
 * - ZAO Festivals Respect is isolated from parent governance (item 24, 26).
 * - $ZABAL: Zaal personal group token, future incubated project, no voting rights (item 3).
 * - Zero-Respect members have read and comment capabilities (item 14).
 *
 * ESTATE INVARIANT:
 * - A failed read must produce UNKNOWN (null), NEVER 0, NEVER "clean".
 * - An error in reading on-chain balance must not be swallowed into a zero balance.
 *
 * Contracts verified on Optimism Mainnet:
 * - Respect OG (ERC-20): 0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957
 * - ZOR Respect (ERC-1155): 0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c, tokenId 0
 * - OREC: 0xcB05F9254765CA521F7698e61E0A6CA6456Be532
 */

export type GateType = 'erc20' | 'erc721' | 'erc1155';

export interface TokenGateConfig {
  type: GateType;
  contractAddress: Address;
  chainId: number;
  /** Min balance for erc20 in WHOLE tokens (after `decimals`). Defaults to 1. */
  minBalance?: string;
  /** ERC-20 decimals. The balance is divided by 10^decimals before gating and summing. Defaults to 0. */
  decimals?: number;
  /** Required for erc1155. */
  tokenId?: string;
  /** Human label for logging / UI. */
  label?: string;
  tenant?: 'parent' | 'festivals' | 'incubated';
}

export interface GateResult {
  allowed: boolean;
  /** Whole-token balance (raw / 10^decimals, truncated); null if read failed; NEVER "0" on failure */
  balance: string | null;
  /** The untouched on-chain integer, for audit; null if read failed */
  rawBalance?: string | null;
  label?: string;
  tenant?: 'parent' | 'festivals' | 'incubated';
  status: 'ok' | 'error';
  error?: string;
}

export interface MembershipCheckResult {
  member: boolean | null; // null if unknown due to read error
  results: GateResult[];
  governanceWeight: string | null; // null if read error; NEVER "0" on failure
  status: 'ok' | 'error' | 'partial';
  error?: string;
}

const CHAINS: Record<number, Chain> = {
  1: mainnet,
  8453: base,
  10: optimism
};

export const CHAIN_IDS = { mainnet: 1, base: 8453, optimism: 10 } as const;

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

const ERC721_ABI = ERC20_ABI;

const ERC1155_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

/**
 * Parent ZAO Respect contracts on Optimism, read here for BALANCES and vote weight only.
 * Access and roles are decided by CharmVerse's own token gates (@packages/config/zao
 * `zaoTokenGates`, evaluated in @packages/lib/zao/zaoTokenGates); see ZAOOS doc 2657 KD2.
 */
export const PARENT_ZAO_GATES: TokenGateConfig[] = [
  {
    label: 'Respect OG (Optimism)',
    type: 'erc20',
    contractAddress: '0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957',
    chainId: CHAIN_IDS.optimism,
    decimals: 18, // measured: decimals() on 0x34cE...6957 returns 18 (2026-10-10)
    tenant: 'parent'
  },
  {
    label: 'ZOR Respect (Optimism)',
    type: 'erc1155',
    contractAddress: '0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c',
    chainId: CHAIN_IDS.optimism,
    tokenId: '0',
    decimals: 0, // ERC-1155 integer balance
    tenant: 'parent'
  }
];

/** Pure: raw on-chain integer to whole tokens, truncated toward zero. No floats. */
export function toWholeUnits(raw: bigint, decimals = 0): bigint {
  if (decimals <= 0) {
    return raw;
  }
  return raw / BigInt(10) ** BigInt(decimals);
}

export const ZAO_MEMBERSHIP_GATES = PARENT_ZAO_GATES;

/** Pure: decide allowed/balance from a raw balance. Unit-tested. */
export function evaluateGate(balance: bigint, gate: TokenGateConfig): GateResult {
  const whole = toWholeUnits(balance, gate.decimals ?? 0);
  if (gate.type === 'erc20') {
    const min = BigInt(gate.minBalance || '1');
    return {
      allowed: whole >= min,
      balance: whole.toString(),
      rawBalance: balance.toString(),
      label: gate.label,
      tenant: gate.tenant,
      status: 'ok'
    };
  }
  return {
    allowed: whole > BigInt(0),
    balance: whole.toString(),
    rawBalance: balance.toString(),
    label: gate.label,
    tenant: gate.tenant,
    status: 'ok'
  };
}

/**
 * Pure: checks whether any gate is satisfied.
 * If any gate errored and none passed, membership is UNKNOWN (null).
 * Only returns false if all gates succeeded and none passed.
 */
export function isZaoMember(results: GateResult[]): boolean | null {
  if (results.some((r) => r.allowed)) {
    return true;
  }
  if (results.some((r) => r.status === 'error' || r.balance === null)) {
    return null; // UNKNOWN due to failed read; do not report false
  }
  return false;
}

/**
 * Computes combined 1:1 voting weight from gate evaluation results, in whole Respect
 * (each result's `balance` is already divided by its gate's decimals).
 * If ANY parent tenant result has status "error" or balance null,
 * the governance weight is UNKNOWN (null). NEVER returns "0" on failure.
 */
export function computeGovernanceWeightFromResults(results: GateResult[]): string | null {
  let total = BigInt(0);
  for (const r of results) {
    if (r.tenant === 'parent') {
      if (r.status === 'error' || r.balance === null) {
        return null; // A number nobody could compute is not zero
      }
      if (r.allowed && r.balance !== null) {
        total += BigInt(r.balance);
      }
    }
  }
  return total.toString();
}

function getClient(chainId: number) {
  const chain = CHAINS[chainId];
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }
  return createPublicClient({ chain, transport: http() });
}

/** Reads on-chain balance for one gate and evaluates it. Throws on network/contract error. */
export async function checkTokenGate(walletAddress: string, gate: TokenGateConfig): Promise<GateResult> {
  const client = getClient(gate.chainId);
  const address = walletAddress as Address;
  const contract = gate.contractAddress;

  if (gate.type === 'erc1155') {
    if (!gate.tokenId) {
      throw new Error('tokenId required for ERC-1155 gate');
    }
    const balance = await client.readContract({
      address: contract,
      abi: ERC1155_ABI,
      functionName: 'balanceOf',
      args: [address, BigInt(gate.tokenId)]
    });
    return evaluateGate(balance as bigint, gate);
  }

  const balance = await client.readContract({
    address: contract,
    abi: gate.type === 'erc721' ? ERC721_ABI : ERC20_ABI,
    functionName: 'balanceOf',
    args: [address]
  });
  return evaluateGate(balance as bigint, gate);
}

/**
 * Checks Parent ZAO Respect balances across OG and ZOR on Optimism.
 * If a read fails, returns status "error" or "partial" with balance null.
 * NEVER swallows a thrown error into a zero balance.
 */
export async function checkZaoMembership(
  walletAddress: string,
  gates: TokenGateConfig[] = PARENT_ZAO_GATES
): Promise<MembershipCheckResult> {
  const results = await Promise.all(
    gates.map(async (gate) => {
      try {
        return await checkTokenGate(walletAddress, gate);
      } catch (err: any) {
        return {
          allowed: false,
          balance: null, // UNKNOWN, not "0"
          rawBalance: null,
          label: gate.label,
          tenant: gate.tenant,
          status: 'error' as const,
          error: err?.message || 'Failed to read contract balance'
        };
      }
    })
  );

  const errors = results.filter((r) => r.status === 'error');
  let status: 'ok' | 'error' | 'partial' = 'ok';
  if (errors.length === results.length) {
    status = 'error';
  } else if (errors.length > 0) {
    status = 'partial';
  }

  const governanceWeight = computeGovernanceWeightFromResults(results);
  const member = isZaoMember(results);
  const errorMsg = errors.length > 0 ? errors.map((e) => `${e.label}: ${e.error}`).join('; ') : undefined;

  return { member, results, governanceWeight, status, error: errorMsg };
}
