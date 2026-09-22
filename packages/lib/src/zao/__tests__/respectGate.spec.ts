import {
  evaluateGate,
  isZaoMember,
  computeGovernanceWeightFromResults,
  checkZaoMembership,
  PARENT_ZAO_GATES,
  CHAIN_IDS,
  type TokenGateConfig,
  type GateResult
} from '../respectGate';

const erc20Gate: TokenGateConfig = {
  type: 'erc20',
  contractAddress: '0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957',
  chainId: CHAIN_IDS.optimism,
  label: 'Respect OG',
  tenant: 'parent'
};

const erc1155Gate: TokenGateConfig = {
  type: 'erc1155',
  contractAddress: '0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c',
  chainId: CHAIN_IDS.optimism,
  tokenId: '0',
  label: 'ZOR',
  tenant: 'parent'
};

describe('evaluateGate', () => {
  it('erc20: allows when balance >= default min of 1', () => {
    expect(evaluateGate(BigInt(1), erc20Gate)).toMatchObject({ allowed: true, balance: '1', status: 'ok' });
    expect(evaluateGate(BigInt(0), erc20Gate).allowed).toBe(false);
  });

  it('erc20: respects a custom minBalance', () => {
    const gate = { ...erc20Gate, minBalance: '1000000000000000000' }; // 1e18
    expect(evaluateGate(BigInt('999999999999999999'), gate).allowed).toBe(false);
    expect(evaluateGate(BigInt('1000000000000000000'), gate).allowed).toBe(true);
  });

  it('erc1155: allows when balance of tokenId > 0', () => {
    expect(evaluateGate(BigInt(0), erc1155Gate).allowed).toBe(false);
    expect(evaluateGate(BigInt(3), erc1155Gate).allowed).toBe(true);
  });

  it('carries the label and tenant through', () => {
    const res = evaluateGate(BigInt(1), erc20Gate);
    expect(res.label).toBe('Respect OG');
    expect(res.tenant).toBe('parent');
    expect(res.status).toBe('ok');
  });
});

describe('isZaoMember', () => {
  const deny: GateResult = { allowed: false, balance: '0', status: 'ok' };
  const allow: GateResult = { allowed: true, balance: '1', status: 'ok' };
  const errorResult: GateResult = { allowed: false, balance: null, status: 'error', error: 'RPC timeout' };

  it('is a member if ANY gate passes (OR logic)', () => {
    expect(isZaoMember([deny, deny, allow])).toBe(true);
    expect(isZaoMember([allow, deny])).toBe(true);
    expect(isZaoMember([allow, errorResult])).toBe(true);
  });

  it('is false if all gates succeeded and none passed', () => {
    expect(isZaoMember([deny, deny, deny])).toBe(false);
  });

  it('RED CONTROL: returns null (UNKNOWN) when read failed; NEVER false', () => {
    // If a network read fails, the membership status is unknown, not false
    expect(isZaoMember([deny, errorResult])).toBeNull();
    expect(isZaoMember([errorResult, errorResult])).toBeNull();
    expect(isZaoMember([errorResult])).not.toBe(false);
  });
});

describe('computeGovernanceWeightFromResults (1:1 unweighted sum)', () => {
  it('sums parent tenant balances 1:1 on happy path', () => {
    const results: GateResult[] = [
      { allowed: true, balance: '100', tenant: 'parent', status: 'ok' },
      { allowed: true, balance: '50', tenant: 'parent', status: 'ok' },
      { allowed: false, balance: '0', tenant: 'parent', status: 'ok' }
    ];
    expect(computeGovernanceWeightFromResults(results)).toBe('150');
  });

  it('RED CONTROL: returns null (UNKNOWN) when a parent read fails; NEVER 0', () => {
    const failedResults: GateResult[] = [
      { allowed: true, balance: '100', tenant: 'parent', status: 'ok' },
      { allowed: false, balance: null, tenant: 'parent', status: 'error', error: 'RPC failed' }
    ];
    const weight = computeGovernanceWeightFromResults(failedResults);
    expect(weight).toBeNull();
    expect(weight).not.toBe('0');
    expect(weight).not.toBe('100'); // Does not return partial as full weight
  });

  it('RED CONTROL: returns null when all parent reads fail; NEVER 0', () => {
    const allFailed: GateResult[] = [
      { allowed: false, balance: null, tenant: 'parent', status: 'error', error: 'Connection refused' },
      { allowed: false, balance: null, tenant: 'parent', status: 'error', error: 'Connection refused' }
    ];
    const weight = computeGovernanceWeightFromResults(allFailed);
    expect(weight).toBeNull();
    expect(weight).not.toBe('0');
  });
});

describe('PARENT_ZAO_GATES', () => {
  it('covers Respect OG and ZOR on Optimism', () => {
    const chains = PARENT_ZAO_GATES.map((g) => g.chainId);
    expect(chains.every((c) => c === CHAIN_IDS.optimism)).toBe(true);
  });

  it('every ERC-1155 gate declares a tokenId', () => {
    for (const gate of PARENT_ZAO_GATES) {
      if (gate.type === 'erc1155') {
        expect(gate.tokenId).toBeDefined();
      }
    }
  });
});

describe('checkZaoMembership (chain read error control)', () => {
  it('RED CONTROL: returns status error and null governance weight when chain gate read throws; NEVER 0 or false', async () => {
    const failingGate: TokenGateConfig = {
      type: 'erc20',
      contractAddress: '0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957',
      chainId: 999999, // unsupported chainId triggers throw in client instantiation
      label: 'Failing Gate',
      tenant: 'parent'
    };

    const res = await checkZaoMembership('0x7234c36a71ec237c2ae7698e8916e0735001e9af', [failingGate]);
    expect(res.status).toBe('error');
    expect(res.governanceWeight).toBeNull();
    expect(res.governanceWeight).not.toBe('0');
    expect(res.member).toBeNull();
    expect(res.member).not.toBe(false);
    expect(res.results[0].balance).toBeNull();
    expect(res.results[0].status).toBe('error');
  });
});
