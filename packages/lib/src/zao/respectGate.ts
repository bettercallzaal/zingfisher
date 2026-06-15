import { createPublicClient, http, type Address, type Chain } from 'viem';
import { base, mainnet, optimism } from 'viem/chains';

/**
 * ZAO membership gate.
 *
 * The ZAO gates member-only content on Respect: hold Respect on Optimism
 * (OG ERC-20 OR ZOR ERC-1155) OR the community token on Base ($ZABAL ERC-20).
 * Holding ANY of these = member.
 *
 * Ported from zaoos/src/lib/spaces/tokenGate.ts (the estate-standard viem gate)
 * and extended with the ZAO membership set. Addresses verified on-chain
 * 2026-06-14 (eth_getCode). Mirrors gating.* in zao.config.ts.
 *
 * NOTE: the Base "new Respect" gate currently uses $ZABAL pending Zaal's
 * confirmation - swap ZABAL_BASE if a dedicated Respect-on-Base ships.
 */

export type GateType = 'erc20' | 'erc721' | 'erc1155';

export interface TokenGateConfig {
  type: GateType;
  contractAddress: Address;
  chainId: number;
  /** Min balance for erc20 (raw units). Defaults to 1. */
  minBalance?: string;
  /** Required for erc1155. */
  tokenId?: string;
  /** Human label for logging / UI. */
  label?: string;
}

export interface GateResult {
  allowed: boolean;
  balance: string;
  label?: string;
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

const ERC721_ABI = ERC20_ABI; // balanceOf(owner) -> uint256, same shape

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

/** The ZAO membership gate set. Hold any one = member. */
export const ZAO_MEMBERSHIP_GATES: TokenGateConfig[] = [
  {
    label: 'Respect OG (Optimism)',
    type: 'erc20',
    contractAddress: '0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957',
    chainId: CHAIN_IDS.optimism
  },
  {
    label: 'ZOR (Optimism)',
    type: 'erc1155',
    contractAddress: '0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c',
    chainId: CHAIN_IDS.optimism,
    tokenId: '0'
  },
  {
    label: '$ZABAL (Base)',
    type: 'erc20',
    contractAddress: '0xbB48f19B0494Ff7C1fE5Dc2032aeEE14312f0b07',
    chainId: CHAIN_IDS.base
  }
];

/** Pure: decide allowed/balance from a raw balance. No network. Unit-tested. */
export function evaluateGate(balance: bigint, gate: TokenGateConfig): GateResult {
  if (gate.type === 'erc20') {
    const min = BigInt(gate.minBalance || '1');
    return { allowed: balance >= min, balance: balance.toString(), label: gate.label };
  }
  // erc721 / erc1155: holding any (> 0) grants access
  return { allowed: balance > BigInt(0), balance: balance.toString(), label: gate.label };
}

/** Pure: a wallet is a member if it passes ANY gate. No network. Unit-tested. */
export function isZaoMember(results: GateResult[]): boolean {
  return results.some((r) => r.allowed);
}

function getClient(chainId: number) {
  const chain = CHAINS[chainId];
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }
  return createPublicClient({ chain, transport: http() });
}

/** Reads on-chain balance for one gate and evaluates it. */
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
 * Check ZAO membership across all gates (Respect OP + ZABAL Base) for a wallet.
 * Returns per-gate results and an overall `member` boolean. Errors on a single
 * chain do not fail the whole check - that gate just reports not-allowed.
 */
export async function checkZaoMembership(
  walletAddress: string,
  gates: TokenGateConfig[] = ZAO_MEMBERSHIP_GATES
): Promise<{ member: boolean; results: GateResult[] }> {
  const results = await Promise.all(
    gates.map(async (gate) => {
      try {
        return await checkTokenGate(walletAddress, gate);
      } catch {
        return { allowed: false, balance: '0', label: gate.label };
      }
    })
  );
  return { member: isZaoMember(results), results };
}
