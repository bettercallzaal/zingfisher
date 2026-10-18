import { MEMBERS_PAGE_SIZE, parseAfterZid, toMemberListItem, toMemberListPage } from '../memberList';
import { buildZidProfile } from '../zid';
import type { ZidProfile } from '../zid';

const GOALS = 'I make ambient records and want to release them with The ZAO.';

function profile(zid: number): ZidProfile {
  return buildZidProfile({
    zid,
    address: `0x${zid.toString(16).padStart(40, '0')}`,
    displayName: `Member ${zid}`,
    handle: `m${zid}`,
    bio: `intro ${zid}`,
    goalsAndVision: GOALS,
    voucherStatus: 'verified',
    voucherAddress: `0x${'b'.repeat(40)}`,
    voucherName: 'Voucher',
    farcaster: 'fc',
    discord: 'dc',
    joinedAt: '2026-10-18T12:00:00Z'
  });
}

describe('parseAfterZid', () => {
  it('reads a missing or empty cursor as the first page', () => {
    expect(parseAfterZid(undefined)).toBe(0);
    expect(parseAfterZid('')).toBe(0);
    expect(parseAfterZid('501')).toBe(501);
  });

  it('RED CONTROL: refuses anything that is not a whole number', () => {
    for (const bad of ['-1', '1.5', 'abc', '501;drop', '1e3', '9999999999', ['1', '2']]) {
      expect(parseAfterZid(bad)).toBeNull();
    }
  });
});

describe('toMemberListItem', () => {
  it('carries only ZID, handle, display name and intro', () => {
    const item = toMemberListItem(profile(501));
    expect(item).toEqual({
      zid: 501,
      formattedZid: 'ZID-501',
      handle: 'm501',
      displayName: 'Member 501',
      intro: 'intro 501'
    });
  });

  it('RED CONTROL: no wallet, goals, voucher or socials leave in the list', () => {
    const text = JSON.stringify(toMemberListItem(profile(501)));
    for (const leaked of ['0x', GOALS, 'Voucher', 'verified', 'fc', 'dc']) {
      expect(text).not.toContain(leaked);
    }
  });
});

describe('toMemberListPage', () => {
  it('gives the last ZID of a full page as the next cursor when one more row came back', () => {
    const rows = Array.from({ length: MEMBERS_PAGE_SIZE + 1 }, (_, i) => profile(501 + i));
    const page = toMemberListPage(rows);
    expect(page.members).toHaveLength(MEMBERS_PAGE_SIZE);
    expect(page.nextAfter).toBe(500 + MEMBERS_PAGE_SIZE);
  });

  it('RED CONTROL: a short or exactly full page has no next cursor', () => {
    expect(toMemberListPage([profile(501), profile(502)]).nextAfter).toBeNull();
    const full = Array.from({ length: MEMBERS_PAGE_SIZE }, (_, i) => profile(501 + i));
    expect(toMemberListPage(full).nextAfter).toBeNull();
    expect(toMemberListPage([])).toEqual({ members: [], nextAfter: null });
  });
});
