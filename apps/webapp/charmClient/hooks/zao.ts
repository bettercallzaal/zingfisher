import type { GateResult } from '@packages/lib/zao/respectGate';

import { useGETImmutable } from './helpers';

export type ZaoMembership = { member: boolean; results: GateResult[] };

/**
 * Check ZAO membership for a wallet (Respect on Optimism OR $ZABAL on Base).
 * Pass null/undefined to skip the request (e.g. before a wallet is connected).
 */
export function useZaoMembership(address?: string | null) {
  return useGETImmutable<ZaoMembership>(address ? '/api/zao/membership' : null, { address });
}
