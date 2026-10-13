import { getSpaceDomainFromUrlPath } from '../getSpaceDomainFromUrlPath';

describe('getSpaceDomainFromUrlPath', () => {
  it('should return the first path segment as the space domain', () => {
    expect(getSpaceDomainFromUrlPath('/my-space/page')).toBe('my-space');
    expect(getSpaceDomainFromUrlPath('my-space/page?view=1')).toBe('my-space');
  });

  it('should not treat top-level app routes as a space', () => {
    expect(getSpaceDomainFromUrlPath('/learn')).toBeNull();
    expect(getSpaceDomainFromUrlPath('/join')).toBeNull();
  });

  // middleware.ts rewrites any first segment outside DOMAIN_BLACKLIST to /<subdomain>/<path> on a
  // subdomain host, so a ZAO member route missing from the list 404s (zingfisher-webapp.vercel.app/member/join)
  it('should not treat the ZAO member routes as a space', () => {
    expect(getSpaceDomainFromUrlPath('/member')).toBeNull();
    expect(getSpaceDomainFromUrlPath('/member/join')).toBeNull();
    expect(getSpaceDomainFromUrlPath('/member/501')).toBeNull();
  });
});
