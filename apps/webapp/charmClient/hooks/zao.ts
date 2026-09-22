import type { GateResult } from "@packages/lib/zao/respectGate";
import type { ZidProfile } from "@packages/lib/zao/zid";
import { useGETImmutable } from "./helpers";

export type ZaoMembership = {
  member: boolean;
  results: GateResult[];
  governanceWeight: string;
};

/**
 * Check ZAO membership for a wallet (Respect OG + ZOR on Optimism).
 * Pass null/undefined to skip the request (e.g. before a wallet is connected).
 */
export function useZaoMembership(address?: string | null) {
  return useGETImmutable<ZaoMembership>(address ? "/api/zao/membership" : null, { address });
}

/**
 * Hook to retrieve a ZID member profile by address or ZID identifier.
 */
export function useZidProfile(identifier?: string | number | null) {
  const queryParam = identifier ? identifier.toString() : null;
  return useGETImmutable<ZidProfile>(queryParam ? "/api/zao/zid" : null, { identifier: queryParam });
}

/**
 * Function to submit new ZID onboarding profile to /api/zao/zid.
 */
export async function registerZidProfile(data: {
  address: string;
  displayName: string;
  handle: string;
  goalsAndVision: string;
  bio?: string;
  farcasterHandle?: string;
  discordHandle?: string;
  voucherAddress?: string;
  voucherName?: string;
}): Promise<ZidProfile> {
  const res = await fetch("/api/zao/zid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Registration failed with status ${res.status}`);
  }
  return res.json();
}
