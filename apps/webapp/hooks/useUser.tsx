import type { LoggedInUser } from '@packages/profile/getUser';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useGetTriggerUser, useLogout } from 'charmClient/hooks/profile';
import { zaoRealSignInEnabled } from 'lib/zao/realSignIn';

// ── Phase 1 Stub: Mock user, used only while NEXT_PUBLIC_ZAO_REAL_SIGNIN is not "true" ──
const MOCK_USER = {
  id: 'local-dev-user',
  createdAt: new Date(),
  updatedAt: new Date(),
  username: 'Local Developer',
  avatar: null,
  email: 'dev@localhost',
  deletedAt: null,
  discordId: null,
  farcasterId: null,
  googleAccountId: null,
  identityType: 'Wallet',
  telegramId: null,
  favorites: [],
  spaceRoles: [],
  wallets: [],
  googleAccounts: [],
  verifiedEmails: [],
  discordUser: null,
  telegramUser: null,
  farcasterUser: null,
  notificationState: null,
  isNew: false,
  otp: null,
  profile: null
} as unknown as LoggedInUser;

export type IContext = {
  user: LoggedInUser | null;
  setUser: (user: Partial<LoggedInUser>) => Promise<LoggedInUser | null | undefined>;
  updateUser: (user: Partial<LoggedInUser>) => Promise<LoggedInUser | null | undefined>;
  isLoaded: boolean;
  refreshUser: () => Promise<LoggedInUser | null | undefined>;
  logoutUser: () => Promise<void>;
};

export const UserContext = createContext<Readonly<IContext>>({
  user: null,
  setUser: () => Promise.resolve(undefined),
  updateUser: () => Promise.resolve(undefined),
  isLoaded: false,
  refreshUser: () => Promise.resolve(undefined),
  logoutUser: () => Promise.resolve()
});

function StubUserProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<LoggedInUser | null>(MOCK_USER);
  const isLoaded = true;

  async function logoutUser() {
    setUserState(null);
    window.location.href = window.location.origin;
  }

  async function refreshUser(updates: Partial<LoggedInUser> = {}) {
    const updated = userState ? { ...userState, ...updates } : null;
    setUserState(updated);
    return updated;
  }

  const updateUser = async (updatedUser: Partial<LoggedInUser>) => refreshUser(updatedUser);
  const setUser = async (updatedUser: Partial<LoggedInUser>) => refreshUser(updatedUser);

  const value = useMemo<IContext>(() => {
    return {
      user: userState,
      setUser,
      isLoaded,
      updateUser,
      refreshUser,
      logoutUser
    };
  }, [userState, isLoaded]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function RealUserProvider({ children }: { children: ReactNode }) {
  const { data: user, trigger: getUser, error: userError } = useGetTriggerUser();
  const { trigger: logout } = useLogout();
  const isLoaded = user !== undefined || !!userError;

  async function logoutUser() {
    await logout();
    window.location.href = window.location.origin;
  }

  async function refreshUser(updates: Partial<LoggedInUser> = {}) {
    return getUser(undefined, {
      optimisticData: (_user) => {
        return _user ? { ..._user, ...updates } : null;
      },
      onSuccess: async (_user) => {
        if (_user?.deletedAt) {
          await logoutUser();
        }
      }
    });
  }

  useEffect(() => {
    refreshUser();
  }, []);

  const updateUser = async (updatedUser: Partial<LoggedInUser>) => refreshUser(updatedUser);
  const setUser = async (updatedUser: Partial<LoggedInUser>) => refreshUser(updatedUser);

  const value = useMemo<IContext>(() => {
    return {
      user: user || null,
      setUser,
      isLoaded,
      updateUser,
      refreshUser,
      logoutUser
    };
  }, [user, isLoaded]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Real sign-in only when NEXT_PUBLIC_ZAO_REAL_SIGNIN=true (lib/zao/realSignIn.ts); otherwise the stub.
export const UserProvider = zaoRealSignInEnabled ? RealUserProvider : StubUserProvider;

export const useUser = () => useContext(UserContext);
