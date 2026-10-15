import { afterEach, describe, expect, it, vi } from 'vitest';

import { isZaoRealSignInEnabled } from '../realSignIn';

vi.mock('charmClient/hooks/helpers', () => ({
  useGETtrigger: (path: string) => ({ kind: 'real', method: 'GET', path }),
  usePOST: (path: string) => ({ kind: 'real', method: 'POST', path }),
  usePUT: (path: string) => ({ kind: 'real', method: 'PUT', path }),
  useDELETE: (path: string) => ({ kind: 'real', method: 'DELETE', path })
}));

async function loadProfileHooks(flag: string | undefined) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_ZAO_REAL_SIGNIN', flag as string);
  return import('charmClient/hooks/profile');
}

describe('isZaoRealSignInEnabled', () => {
  it('should be on only for the exact string "true"', () => {
    expect(isZaoRealSignInEnabled('true')).toBe(true);
    expect(isZaoRealSignInEnabled(undefined)).toBe(false);
    expect(isZaoRealSignInEnabled('')).toBe(false);
    expect(isZaoRealSignInEnabled('1')).toBe(false);
    expect(isZaoRealSignInEnabled('TRUE')).toBe(false);
  });
});

describe('profile hooks behind the switch', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should keep the mock user while the switch is off', async () => {
    const hooks = await loadProfileHooks(undefined);
    const login = hooks.useLogin() as unknown as { kind?: string; trigger: () => Promise<{ username: string }> };
    expect(login.kind).toBeUndefined();
    await expect(login.trigger()).resolves.toMatchObject({ username: 'Local Developer' });
    const getUser = hooks.useGetTriggerUser() as unknown as { kind?: string };
    expect(getUser.kind).toBeUndefined();
  });

  it("should call CharmVerse's session and profile endpoints when the switch is on", async () => {
    const hooks = await loadProfileHooks('true');
    expect(hooks.useGetTriggerUser()).toEqual({ kind: 'real', method: 'GET', path: '/api/profile' });
    expect(hooks.useLogin()).toEqual({ kind: 'real', method: 'POST', path: '/api/session/login' });
    expect(hooks.useCreateUser()).toEqual({ kind: 'real', method: 'POST', path: '/api/profile' });
    expect(hooks.useLogout()).toEqual({ kind: 'real', method: 'POST', path: '/api/session/logout' });
  });
});
