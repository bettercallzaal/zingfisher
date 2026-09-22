import { createPublicClient, http, type Address, type Chain } from "viem";
import { base, mainnet, optimism } from "viem/chains";

/**
 * ZAO Governance & Membership Gates.
 *
 * Decisions 2026-09-22 (Zaal Grill decisions, commits 6cbeb028, d3381bff, 7be9b59f):
 * - Voting weight: 1:1 unweighted sum of OG (ERC-20) + ZOR (ERC-1155, id 0) on Optimism.
 * - Parent ZAO governance Respect is earned exclusively through parent ZAO fractals.
 * - ZAO Festivals Respect is isolated from parent governance (item 24, 26).
 * - $ZABAL: Zaal personal group token, future incubated project, no voting rights (item 3).
 * - Zero-Respect members have read and comment capabilities (item 14).
 *
 * Contracts verified on Optimism Mainnet:
 * - Respect OG (ERC-20): 0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957
 * - ZOR Respect (ERC-1155): 0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c, tokenId 0
 * - OREC: 0xcB05F9254765CA521F7698e61E0A6CA6456Be532
 */

export type GateType = "erc20" | "erc721" | "erc1155";

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
  tenant?: "parent" | "festivals" | "incubated";
}

export interface GateResult {
  allowed: boolean;
  balance: string;
  label?: string;
  tenant?: "parent" | "festivals" | "incubated";
}

const CHAINS: Record<number, Chain> = {
  1: mainnet,
  8453: base,
  10: optimism
};

export const CHAIN_IDS = { mainnet: 1, base: 8453, optimism: 10 } as const;

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const;

const ERC721_ABI = ERC20_ABI;

const ERC1155_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const;

/** Canonical Parent ZAO Governance Gates on Optimism. */
export const PARENT_ZAO_GATES: TokenGateConfig[] = [
  {
    label: "Respect OG (Optimism)",
    type: "erc20",
    contractAddress: "0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957",
    chainId: CHAIN_IDS.optimism,
    tenant: "parent"
  },
  {
    label: "ZOR Respect (Optimism)",
    type: "erc1155",
    contractAddress: "0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c",
    chainId: CHAIN_IDS.optimism,
    tokenId: "0",
    tenant: "parent"
  }
];

export const ZAO_MEMBERSHIP_GATES = PARENT_ZAO_GATES;

/** Pure: decide allowed/balance from a raw balance. Unit-tested. */
export function evaluateGate(balance: bigint, gate: TokenGateConfig): GateResult {
  if (gate.type === "erc20") {
    const min = BigInt(gate.minBalance || "1");
    return {
      allowed: balance >= min,
      balance: balance.toString(),
      label: gate.label,
      tenant: gate.tenant
    };
  }
  return {
    allowed: balance > BigInt(0),
    balance: balance.toString(),
    label: gate.label,
    tenant: gate.tenant
  };
}

/** Pure: checks whether any gate is satisfied. */
export function isZaoMember(results: GateResult[]): boolean {
  return results.some((r) => r.allowed);
}

/** Computes combined 1:1 voting weight from gate evaluation results. */
export function computeGovernanceWeightFromResults(results: GateResult[]): string {
  let total = BigInt(0);
  for (const r of results) {
    if (r.tenant === "parent" && r.allowed) {
      total += BigInt(r.balance || "0");
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

/** Reads on-chain balance for one gate and evaluates it. */
export async function checkTokenGate(walletAddress: string, gate: TokenGateConfig): Promise<GateResult> {
  const client = getClient(gate.chainId);
  const address = walletAddress as Address;
  const contract = gate.contractAddress;

  if (gate.type === "erc1155") {
    if (!gate.tokenId) {
      throw new Error("tokenId required for ERC-1155 gate");
    }
    const balance = await client.readContract({
      address: contract,
      abi: ERC1155_ABI,
      functionName: "balanceOf",
      args: [address, BigInt(gate.tokenId)]
    });
    return evaluateGate(balance as bigint, gate);
  }

  const balance = await client.readContract({
    address: contract,
    abi: gate.type === "erc721" ? ERC721_ABI : ERC20_ABI,
    functionName: "balanceOf",
    args: [address]
  });
  return evaluateGate(balance as bigint, gate);
}

/**
 * Checks Parent ZAO Respect balances across OG and ZOR on Optimism.
 * Computes 1:1 unweighted governance weight.
 */
export async function checkZaoMembership(
  walletAddress: string,
  gates: TokenGateConfig[] = PARENT_ZAO_GATES
): Promise<{ member: boolean; results: GateResult[]; governanceWeight: string }> {
  const results = await Promise.all(
    gates.map(async (gate) => {
      try {
        return await checkTokenGate(walletAddress, gate);
      } catch {
        return { allowed: false, balance: "0", label: gate.label, tenant: gate.tenant };
      }
    })
  );
  const governanceWeight = computeGovernanceWeightFromResults(results);
  return { member: isZaoMember(results), results, governanceWeight };
}
