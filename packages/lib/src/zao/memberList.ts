/**
 * The public members list (GET /api/zao/members). Spec: research/007-member-profile-store,
 * open question 1. Only fields already shown on each public member page go out: no wallet,
 * no goals, no voucher, no socials.
 */
import type { ZidProfile } from './zid';

export const MEMBERS_PAGE_SIZE = 50;

export interface MemberListItem {
  zid: number;
  formattedZid: string;
  handle: string;
  displayName: string;
  intro: string;
}

export interface MemberListPage {
  members: MemberListItem[];
  /** Pass as ?after= for the next page; null on the last page. */
  nextAfter: number | null;
}

/** Pure: reads ?after=. Missing means the first page; anything but a whole number 0 or above is null. */
export function parseAfterZid(value: unknown): number | null {
  if (value === undefined || value === '') {
    return 0;
  }
  if (typeof value !== 'string' || !/^\d{1,9}$/.test(value)) {
    return null;
  }
  return Number(value);
}

export function toMemberListItem(profile: ZidProfile): MemberListItem {
  return {
    zid: profile.zid as number,
    formattedZid: profile.formattedZid,
    handle: profile.handle,
    displayName: profile.displayName,
    intro: profile.bio ?? ''
  };
}

/** Pure: `profiles` is what the store returned for a limit of pageSize + 1. */
export function toMemberListPage(profiles: ZidProfile[], pageSize: number = MEMBERS_PAGE_SIZE): MemberListPage {
  const page = profiles.slice(0, pageSize);
  const hasMore = profiles.length > pageSize;
  return {
    members: page.map(toMemberListItem),
    nextAfter: hasMore && page.length > 0 ? (page[page.length - 1].zid as number) : null
  };
}
