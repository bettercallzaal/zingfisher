import { zaoHatIds, zaoTokenGates } from '@packages/config/zao';
import { validateTokenGateConditionsObject } from '@packages/lib/tokenGates/validateTokenGateConditionsObject';

import { evaluateZaoAccess, summarizeZaoAccess, zaoTokenGateObjects } from '../zaoTokenGates';

describe('zaoTokenGates definitions', () => {
  it('every gate validates against CharmVerse TokenGate schema (it is a real TokenGate, not a parallel one)', async () => {
    for (const gate of zaoTokenGateObjects()) {
      await expect(validateTokenGateConditionsObject(gate)).resolves.toBeUndefined();
    }
  });

  it('Respect holder is OG (ERC20, one whole token in wei) OR ZOR (ERC1155 id 0) on Optimism', () => {
    const g = zaoTokenGates.find((x) => x.id === 'zao-respect-holder')!;
    expect(g.conditions.operator).toBe('OR');
    const [og, zor] = g.conditions.accessControlConditions;
    expect(og.type).toBe('ERC20');
    expect(og.chain).toBe(10);
    expect(og.quantity).toBe('1000000000000000000');
    // numeric pin: exactly one whole 18-decimal token, and half a token does not clear it
    expect(BigInt(og.quantity)).toBe(BigInt(10) ** BigInt(18));
    expect(BigInt('500000000000000000') >= BigInt(og.quantity)).toBe(false);
    expect(BigInt('1000000000000000000') >= BigInt(og.quantity)).toBe(true);
    expect(zor.type).toBe('ERC1155');
    expect(zor.tokenIds).toEqual(['0']);
  });

  it('hat ids are tree 226 ids: decimal in the gate equals the hex in config and the doc 059 encoding', () => {
    // eslint-disable-next-line no-bitwise -- the hat id encoding is bit arithmetic by definition
    const encode = (...levels: number[]) => {
      /* eslint-disable no-bitwise */
      let id = BigInt(226) << BigInt(224);
      levels.forEach((l, i) => {
        id |= BigInt(l) << BigInt(224 - 16 * (i + 1));
      });
      /* eslint-enable no-bitwise */
      return id;
    };
    const conf = zaoTokenGates.find((x) => x.id === 'zao-hat-configurator')!;
    const council = zaoTokenGates.find((x) => x.id === 'zao-hat-governance-council-member')!;
    expect(BigInt(conf.conditions.accessControlConditions[0].tokenIds[0])).toBe(encode(1));
    expect(BigInt(council.conditions.accessControlConditions[0].tokenIds[0])).toBe(encode(1, 2));
    expect(BigInt(zaoHatIds.configurator)).toBe(encode(1));
    expect(BigInt(zaoHatIds.governanceCouncilMembers)).toBe(encode(1, 2));
  });
});

describe('evaluateZaoAccess', () => {
  const wallet = '0x7234c36a71ec237c2ae7698e8916e0735001e9af';

  it('a passing Respect gate makes a member with the Respect holder role; hats add role labels only', async () => {
    const access = await evaluateZaoAccess(wallet, async (gate) =>
      gate.id === 'zao-respect-holder' || gate.id === 'zao-hat-configurator' ? gate.id : null
    );
    expect(access.member).toBe(true);
    expect(access.roles).toEqual(['Respect holder', 'ZAO Configurator']);
  });

  it('all gates failing is a non-member with no roles', async () => {
    const access = await evaluateZaoAccess(wallet, async () => null);
    expect(access.member).toBe(false);
    expect(access.roles).toEqual([]);
  });

  it('RED CONTROL: a failed chain read is UNKNOWN (null), never false', async () => {
    const access = await evaluateZaoAccess(wallet, async () => {
      throw new Error('RPC timeout');
    });
    expect(access.member).toBeNull();
    expect(access.member).not.toBe(false);
    expect(access.gates.every((g) => g.passed === null && g.error === 'RPC timeout')).toBe(true);
  });

  it('a pass beats a failed read on another gate', () => {
    const access = summarizeZaoAccess([
      { id: 'zao-respect-holder', roleName: 'Respect holder', passed: true },
      { id: 'zao-hat-configurator', roleName: 'ZAO Configurator', passed: null, error: 'x' },
      { id: 'zao-hat-governance-council-member', roleName: 'ZAO Governance Council Member', passed: false }
    ]);
    expect(access.member).toBe(true);
    expect(access.roles).toEqual(['Respect holder']);
  });
});
