import {
  evaluateGate,
  isZaoMember,
  ZAO_MEMBERSHIP_GATES,
  CHAIN_IDS,
  type TokenGateConfig,
  type GateResult
} from '../respectGate';

const erc20Gate: TokenGateConfig = {
  type: 'erc20',
  contractAddress: '0x34cE89baA7E4a4B00E17F7E4C0cb97105C216957',
  chainId: CHAIN_IDS.optimism,
  label: 'Respect OG'
};

const erc1155Gate: TokenGateConfig = {
  type: 'erc1155',
  contractAddress: '0x9885CCeEf7E8371Bf8d6f2413723D25917E7445c',
  chainId: CHAIN_IDS.optimism,
  tokenId: '0',
  label: 'ZOR'
};

const erc721Gate: TokenGateConfig = {
  type: 'erc721',
  contractAddress: '0xCB80Ef04DA68667c9a4450013BDD69269842c883',
  chainId: CHAIN_IDS.base,
  label: 'ZOUNZ'
};

describe('evaluateGate', () => {
  it('erc20: allows when balance >= default min of 1', () => {
    expect(evaluateGate(BigInt(1), erc20Gate)).toMatchObject({ allowed: true, balance: '1' });
    expect(evaluateGate(BigInt(0), erc20Gate).allowed).toBe(false);
  });

  it('erc20: respects a custom minBalance', () => {
    const gate = { ...erc20Gate, minBalance: '1000000000000000000' }; // 1e18
    expect(evaluateGate(BigInt('999999999999999999'), gate).allowed).toBe(false);
    expect(evaluateGate(BigInt('1000000000000000000'), gate).allowed).toBe(true);
  });

  it('erc721: allows when holding at least one', () => {
    expect(evaluateGate(BigInt(0), erc721Gate).allowed).toBe(false);
    expect(evaluateGate(BigInt(1), erc721Gate).allowed).toBe(true);
    expect(evaluateGate(BigInt(5), erc721Gate).allowed).toBe(true);
  });

  it('erc1155: allows when balance of tokenId > 0', () => {
    expect(evaluateGate(BigInt(0), erc1155Gate).allowed).toBe(false);
    expect(evaluateGate(BigInt(3), erc1155Gate).allowed).toBe(true);
  });

  it('carries the label through', () => {
    expect(evaluateGate(BigInt(1), erc20Gate).label).toBe('Respect OG');
  });
});

describe('isZaoMember', () => {
  const deny: GateResult = { allowed: false, balance: '0' };
  const allow: GateResult = { allowed: true, balance: '1' };

  it('is a member if ANY gate passes (OR logic)', () => {
    expect(isZaoMember([deny, deny, allow])).toBe(true);
    expect(isZaoMember([allow, deny])).toBe(true);
  });

  it('is not a member if all gates fail', () => {
    expect(isZaoMember([deny, deny, deny])).toBe(false);
  });

  it('is not a member with no gates', () => {
    expect(isZaoMember([])).toBe(false);
  });
});

describe('ZAO_MEMBERSHIP_GATES', () => {
  it('covers Respect on Optimism and ZABAL on Base', () => {
    const chains = ZAO_MEMBERSHIP_GATES.map((g) => g.chainId);
    expect(chains).toContain(CHAIN_IDS.optimism);
    expect(chains).toContain(CHAIN_IDS.base);
  });

  it('every ERC-1155 gate declares a tokenId', () => {
    for (const gate of ZAO_MEMBERSHIP_GATES) {
      if (gate.type === 'erc1155') {
        expect(gate.tokenId).toBeDefined();
      }
    }
  });
});
