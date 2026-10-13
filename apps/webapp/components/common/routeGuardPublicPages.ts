// Pages shared to the public that don't require user login
// When adding a page here or any new top-level pages, please also add this page to DOMAIN_BLACKLIST in @packages/spaces/config.ts
export const publicPages = [
  '/',
  'share',
  'api-docs',
  'u',
  'join',
  'learn', // the ZAO learning hub is the public front door
  'member', // ZAO member pages render a signed-out state (/member, /member/join, /member/[zid])
  'login',
  'invite',
  'authenticate',
  'test',
  'permalink',
  '/[domain]/proposals/new'
];

export function isPublicPagePath({ firstPathSegment, pathName }: { firstPathSegment: string; pathName: string }) {
  return publicPages.some((basePath) => firstPathSegment === basePath || pathName === basePath);
}
