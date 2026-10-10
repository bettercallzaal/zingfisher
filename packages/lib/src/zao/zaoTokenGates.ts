import { zaoTokenGates } from '@packages/config/zao';
import type { TokenGate, TokenGateConditions } from '@packages/lib/tokenGates/interfaces';
import { validateTokenGate } from '@packages/lib/tokenGates/validateTokenGate';

/**
 * The ZAO's access gates, evaluated through CharmVerse's own token gate code.
 *
 * ZAOOS research governance/2657, Key Decision 2: access and roles come from CharmVerse's
 * TokenGate (ERC20 with decimals, ERC1155 by id, Hats by wearer), not from a parallel gate.
 * Until the ZAO space has a database, the gate rows live in config (@packages/config/zao,
 * `zaoTokenGates`) and are evaluated here with the same `validateTokenGate` the space-join
 * flow uses. scripts/seedZaoTokenGates.ts turns the same definitions into TokenGate and Role
 * rows once Postgres is wired, so the two never diverge.
 *
 * ESTATE INVARIANT: a failed chain read is UNKNOWN (null), never "not a member".
 */

export type ZaoGateId = (typeof zaoTokenGates)[number]['id'];

export type ZaoGateOutcome = {
  id: ZaoGateId;
  roleName: string;
  /** true passed, false failed every condition, null the read failed */
  passed: boolean | null;
  error?: string;
};

export type ZaoAccess = {
  /** true if any gate passed; false if every gate failed; null if none passed and at least one read failed */
  member: boolean | null;
  /** Role names granted by the gates that passed, in gate order */
  roles: string[];
  gates: ZaoGateOutcome[];
};

/** The config definitions as CharmVerse TokenGate objects (ids are stable slugs, not uuids). */
export function zaoTokenGateObjects(): TokenGate[] {
  return zaoTokenGates.map((g) => ({
    id: g.id,
    spaceId: 'zao-config', // placeholder until the seed script creates the real rows
    createdAt: new Date(0),
    archived: false,
    conditions: g.conditions as unknown as TokenGateConditions
  }));
}

/** Pure: fold per-gate outcomes into one access decision. */
export function summarizeZaoAccess(gates: ZaoGateOutcome[]): ZaoAccess {
  const roles = gates.filter((g) => g.passed === true).map((g) => g.roleName);
  let member: boolean | null;
  if (gates.some((g) => g.passed === true)) {
    member = true;
  } else if (gates.some((g) => g.passed === null)) {
    member = null; // a read failed and nothing passed: UNKNOWN, not false
  } else {
    member = false;
  }
  return { member, roles, gates };
}

/**
 * Evaluate every ZAO gate for one wallet through CharmVerse's validator.
 * `validate` is injectable for tests; production uses validateTokenGate.
 */
export async function evaluateZaoAccess(
  walletAddress: string,
  validate: (gate: TokenGate, wallet: string) => Promise<string | null> = validateTokenGate
): Promise<ZaoAccess> {
  const definitions = zaoTokenGates;
  const gates = zaoTokenGateObjects();
  const outcomes = await Promise.all(
    gates.map(async (gate, i): Promise<ZaoGateOutcome> => {
      const def = definitions[i];
      try {
        const passedId = await validate(gate, walletAddress);
        return { id: def.id, roleName: def.roleName, passed: passedId === gate.id };
      } catch (err) {
        return {
          id: def.id,
          roleName: def.roleName,
          passed: null,
          error: (err as Error)?.message || 'Chain read failed'
        };
      }
    })
  );
  return summarizeZaoAccess(outcomes);
}
