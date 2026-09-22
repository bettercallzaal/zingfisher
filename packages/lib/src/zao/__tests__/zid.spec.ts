import {
  formatZid,
  parseZid,
  calculateGovernanceWeight,
  validateDeclaredGoals,
  validateHandle,
  getMemberPermissions,
  classifyVoucherStatus,
  assignNextZid,
  getZidProfile,
  ZAAL_ADDRESS
} from '../zid';

describe('ZID formatting and parsing', () => {
  it('formats ZID into 3-digit padded strings', () => {
    expect(formatZid(0)).toBe('ZID-000');
    expect(formatZid(1)).toBe('ZID-001');
    expect(formatZid(42)).toBe('ZID-042');
    expect(formatZid(501)).toBe('ZID-501');
    expect(formatZid(1234)).toBe('ZID-1234');
    expect(formatZid(null)).toBe('UNASSIGNED');
  });

  it('throws on negative ZID', () => {
    expect(() => formatZid(-1)).toThrow('ZID cannot be negative');
  });

  it('parses both prefixed and bare ZID values', () => {
    expect(parseZid('ZID-000')).toBe(0);
    expect(parseZid('ZID-042')).toBe(42);
    expect(parseZid('zid-501')).toBe(501);
    expect(parseZid('501')).toBe(501);
    expect(parseZid(501)).toBe(501);
    expect(parseZid('UNASSIGNED')).toBeNull();
    expect(parseZid('invalid')).toBeNull();
  });
});

describe('1:1 Governance Weight Calculation (Zaal Ruling Q1 & Q2)', () => {
  it('calculates 1:1 unweighted sum of OG and ZOR', () => {
    expect(calculateGovernanceWeight('100', '50')).toBe('150');
    expect(calculateGovernanceWeight(0, 738)).toBe('738');
    expect(calculateGovernanceWeight(3094, 800)).toBe('3894');
    expect(calculateGovernanceWeight('0', '0')).toBe('0');
  });

  it('RED CONTROL: returns null (UNKNOWN) if either balance is null; NEVER 0', () => {
    expect(calculateGovernanceWeight(null, '50')).toBeNull();
    expect(calculateGovernanceWeight('100', null)).toBeNull();
    expect(calculateGovernanceWeight(null, null)).toBeNull();
    expect(calculateGovernanceWeight(null, '0')).not.toBe('0');
    expect(calculateGovernanceWeight(null, null)).not.toBe('0');
  });
});

describe('Declared Creative Goals & Vision Protocol (Item 30)', () => {
  it('rejects empty or brief statements', () => {
    expect(validateDeclaredGoals('').valid).toBe(false);
    expect(validateDeclaredGoals('short').valid).toBe(false);
  });

  it('accepts substantive creative goals statements', () => {
    const res = validateDeclaredGoals('Building decentralised royalty tools for independent jazz artists.');
    expect(res.valid).toBe(true);
  });
});

describe('Member Handle Validation', () => {
  it('validates standard handles', () => {
    expect(validateHandle('artist_one').valid).toBe(true);
    expect(validateHandle('@zaal').valid).toBe(true);
    expect(validateHandle('a').valid).toBe(false);
  });
});

describe('Voucher Classification (Item 29 & Open Questions 6/7)', () => {
  it('classifies explicit peer voucher as verified', () => {
    expect(classifyVoucherStatus({ hasExplicitPeerVoucher: true })).toBe('verified');
  });

  it('classifies ranked circle with peer as verified', () => {
    expect(classifyVoucherStatus({ circleRankRecorded: true, circleSize: 4 })).toBe('verified');
  });

  it('classifies ranked circle with 1 member as solo_circle (Open Question 7)', () => {
    expect(classifyVoucherStatus({ circleRankRecorded: true, circleSize: 1 })).toBe('solo_circle');
  });

  it('classifies pre-73 attendance as pre_73_attendance (Open Question 6)', () => {
    expect(classifyVoucherStatus({ attendedPre73Only: true })).toBe('pre_73_attendance');
  });

  it('classifies new joiners as pending_vouch (Item 29)', () => {
    expect(classifyVoucherStatus({})).toBe('pending_vouch');
  });
});

describe('Zero-Respect and Unknown Balance Permissions (Item 14)', () => {
  it('grants read and comment capabilities to zero-Respect members', () => {
    const perms = getMemberPermissions({ governanceWeight: '0' });
    expect(perms.canRead).toBe(true);
    expect(perms.canComment).toBe(true);
    expect(perms.canVote).toBe(false);
    expect(perms.canDraftProposal).toBe(false);
  });

  it('grants read and comment but blocks voting when governance weight is unknown (null)', () => {
    const perms = getMemberPermissions({ governanceWeight: null });
    expect(perms.canRead).toBe(true);
    expect(perms.canComment).toBe(true);
    expect(perms.canVote).toBe(false);
    expect(perms.canDraftProposal).toBe(false);
  });

  it('enables drafting and voting for verified Respect holders', () => {
    const perms = getMemberPermissions({ governanceWeight: '110' });
    expect(perms.canRead).toBe(true);
    expect(perms.canComment).toBe(true);
    expect(perms.canVote).toBe(true);
    expect(perms.canDraftProposal).toBe(true);
  });
});

describe('ZID Onboarding Allocation (Decision 2026-09-01)', () => {
  it('assigns next ZID in the 501+ range with null initial balances pending chain read', () => {
    const profile = assignNextZid({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      displayName: 'New Creator',
      handle: 'newcreator',
      goalsAndVision: 'I am an electronic musician building stem remixes with The ZAO community.'
    });

    expect(profile.zid).toBeGreaterThanOrEqual(501);
    expect(profile.formattedZid).toBe(`ZID-${profile.zid}`);
    expect(profile.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(profile.voucher.status).toBe('pending_vouch');
    // Balances are null until read from chain; NEVER initialized to "0"
    expect(profile.ledgers.parentZao.ogBalance).toBeNull();
    expect(profile.ledgers.parentZao.zorBalance).toBeNull();
    expect(profile.ledgers.parentZao.governanceWeight).toBeNull();
    expect(profile.ledgers.parentZao.chainReadStatus).toBe('pending');
    expect(profile.ledgers.zaoFestivals.status).toBe('not_yet_established');
    expect(profile.ledgers.incubated.status).toBe('not_yet_established');
    expect(profile.fractalHistory).toHaveLength(0);
  });

  it('assigns ZID 0 to Zaal per 2026-08-25 decision', () => {
    const zaal = assignNextZid({
      address: ZAAL_ADDRESS,
      displayName: 'Zaal',
      handle: 'zaal',
      goalsAndVision:
        'The movement for the new creator economy of bringing profit margin data and IP rights back to independent artists.'
    });

    expect(zaal.zid).toBe(0);
    expect(zaal.formattedZid).toBe('ZID-000');
  });
});
