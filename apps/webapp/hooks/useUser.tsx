import type { LoggedInUser } from '@packages/profile/getUser';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

// ── Phase 1 Stub: Mock user for local development ──
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
  profile: null,
} as LoggedInUser;

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
  logoutUser: () => Promise.resolve(),
});

export function UserProvider({ children }: { children: ReactNode }) {
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
      logoutUser,
    };
  }, [userState, isLoaded]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);