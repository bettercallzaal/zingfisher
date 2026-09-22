import {
  formatZid,
  parseZid,
  calculateGovernanceWeight,
  validateDeclaredGoals,
  validateHandle,
  getMemberPermissions,
  classifyVoucherStatus,
  assignNextZid,
  getZidProfile
} from "../zid";

describe("ZID formatting and parsing", () => {
  it("formats ZID into 3-digit padded strings", () => {
    expect(formatZid(0)).toBe("ZID-000");
    expect(formatZid(1)).toBe("ZID-001");
    expect(formatZid(42)).toBe("ZID-042");
    expect(formatZid(501)).toBe("ZID-501");
    expect(formatZid(1234)).toBe("ZID-1234");
  });

  it("throws on negative ZID", () => {
    expect(() => formatZid(-1)).toThrow("ZID cannot be negative");
  });

  it("parses both prefixed and bare ZID values", () => {
    expect(parseZid("ZID-000")).toBe(0);
    expect(parseZid("ZID-042")).toBe(42);
    expect(parseZid("zid-501")).toBe(501);
    expect(parseZid("501")).toBe(501);
    expect(parseZid(501)).toBe(501);
    expect(parseZid("invalid")).toBeNull();
  });
});

describe("1:1 Governance Weight Calculation (Zaal Ruling Q1 & Q2)", () => {
  it("calculates 1:1 unweighted sum of OG and ZOR", () => {
    expect(calculateGovernanceWeight("100", "50")).toBe("150");
    expect(calculateGovernanceWeight(0, 738)).toBe("738");
    expect(calculateGovernanceWeight(2480, 0)).toBe("2480");
    expect(calculateGovernanceWeight("0", "0")).toBe("0");
  });
});

describe("Declared Creative Goals & Vision Protocol (Item 30)", () => {
  it("rejects empty or brief statements", () => {
    expect(validateDeclaredGoals("").valid).toBe(false);
    expect(validateDeclaredGoals("short").valid).toBe(false);
  });

  it("accepts substantive creative goals statements", () => {
    const res = validateDeclaredGoals("Building decentralised royalty tools for independent jazz artists.");
    expect(res.valid).toBe(true);
  });
});

describe("Member Handle Validation", () => {
  it("validates standard handles", () => {
    expect(validateHandle("artist_one").valid).toBe(true);
    expect(validateHandle("@zaal").valid).toBe(true);
    expect(validateHandle("a").valid).toBe(false); // too short
  });
});

describe("Voucher Classification (Item 29 & Open Questions 6/7)", () => {
  it("classifies explicit peer voucher as verified", () => {
    expect(classifyVoucherStatus({ hasExplicitPeerVoucher: true })).toBe("verified");
  });

  it("classifies ranked circle with peer as verified", () => {
    expect(classifyVoucherStatus({ circleRankRecorded: true, circleSize: 4 })).toBe("verified");
  });

  it("classifies ranked circle with 1 member as solo_circle (Open Question 7)", () => {
    expect(classifyVoucherStatus({ circleRankRecorded: true, circleSize: 1 })).toBe("solo_circle");
  });

  it("classifies pre-73 attendance as pre_73_attendance (Open Question 6)", () => {
    expect(classifyVoucherStatus({ attendedPre73Only: true })).toBe("pre_73_attendance");
  });

  it("classifies new joiners as pending_vouch (Item 29)", () => {
    expect(classifyVoucherStatus({})).toBe("pending_vouch");
  });
});

describe("Zero-Respect Permissions (Item 14)", () => {
  it("grants read and comment capabilities to zero-Respect members", () => {
    const perms = getMemberPermissions({ governanceWeight: "0" });
    expect(perms.canRead).toBe(true);
    expect(perms.canComment).toBe(true);
    expect(perms.canVote).toBe(false);
    expect(perms.canDraftProposal).toBe(false);
  });

  it("enables drafting and voting for Respect holders", () => {
    const perms = getMemberPermissions({ governanceWeight: "110" });
    expect(perms.canRead).toBe(true);
    expect(perms.canComment).toBe(true);
    expect(perms.canVote).toBe(true);
    expect(perms.canDraftProposal).toBe(true);
  });
});

describe("ZID Onboarding Allocation (Decision 2026-09-01)", () => {
  it("assigns next ZID in the 501+ range for new joiners", () => {
    const profile = assignNextZid({
      address: "0x1234567890abcdef1234567890abcdef12345678",
      displayName: "New Creator",
      handle: "newcreator",
      goalsAndVision: "I am an electronic musician building stem remixes with The ZAO community."
    });

    expect(profile.zid).toBeGreaterThanOrEqual(501);
    expect(profile.formattedZid).toBe(`ZID-${profile.zid}`);
    expect(profile.address).toBe("0x1234567890abcdef1234567890abcdef12345678");
    expect(profile.voucher.status).toBe("pending_vouch");
    expect(profile.permissions.canRead).toBe(true);
    expect(profile.permissions.canComment).toBe(true);
  });

  it("retrieves seed profiles by address or ZID", () => {
    const zaal = getZidProfile("0x7234c36a71ec237c2ae7698e8916e0735001e9af");
    expect(zaal).not.toBeNull();
    expect(zaal?.displayName).toBe("Zaal");
    expect(zaal?.zid).toBe(0);

    const ohnahji = getZidProfile("ZID-001");
    expect(ohnahji).not.toBeNull();
    expect(ohnahji?.displayName).toBe("Ohnahji B");
  });
});
