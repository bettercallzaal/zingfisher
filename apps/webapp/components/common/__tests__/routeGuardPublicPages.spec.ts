import { DOMAIN_BLACKLIST } from '@packages/spaces/config';

import { isPublicPagePath, publicPages } from '../routeGuardPublicPages';

describe('isPublicPagePath', () => {
  it('should let a signed-out visitor reach the ZAO learning hub and member pages', () => {
    expect(isPublicPagePath({ firstPathSegment: 'learn', pathName: '/learn' })).toBe(true);
    expect(isPublicPagePath({ firstPathSegment: 'member', pathName: '/member' })).toBe(true);
    expect(isPublicPagePath({ firstPathSegment: 'member', pathName: '/member/join' })).toBe(true);
    expect(isPublicPagePath({ firstPathSegment: 'member', pathName: '/member/[zid]' })).toBe(true);
  });

  it('should keep space pages behind sign-in', () => {
    expect(isPublicPagePath({ firstPathSegment: 'my-space', pathName: '/[domain]/[pageId]' })).toBe(false);
    expect(isPublicPagePath({ firstPathSegment: 'createSpace', pathName: '/createSpace' })).toBe(false);
  });

  // middleware.ts rewrites any first segment outside DOMAIN_BLACKLIST to a space route on a subdomain host,
  // so a public ZAO page missing from that list 404s before the guard ever runs
  it('should have the ZAO public pages reserved in DOMAIN_BLACKLIST', () => {
    for (const page of ['learn', 'member', 'join']) {
      expect(publicPages).toContain(page);
      expect(DOMAIN_BLACKLIST).toContain(page);
    }
  });
});
