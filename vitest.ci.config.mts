import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Specs that need no database, run by .github/workflows/ci.yml. The root vite.config.mts
// projects use a globalSetup that needs Postgres, so they cannot run in CI yet.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    server: { deps: { inline: ['@charmverse/core'] } },
    include: [
      'packages/lib/src/zao/__tests__/*.spec.ts',
      'packages/lib/src/utils/domains/__tests__/getSpaceDomainFromUrlPath.spec.ts',
      'apps/webapp/components/common/__tests__/routeGuardPublicPages.spec.ts',
      'apps/webapp/lib/zao/__tests__/realSignIn.spec.ts'
    ]
  }
});
