import type { UserWallet } from '@charmverse/core/prisma-client';
import type { LoggedInUser } from '@packages/profile/getUser';
import type { SignatureVerificationPayloadWithAddress } from '@packages/lib/blockchain/signAndVerify';
import type { EmailPreferences } from 'pages/api/profile/onboarding-email';

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

// Helper: creates a mock SWR trigger hook
function mockTrigger<TReturn>(value: TReturn) {
  return () => ({
    data: undefined as any,
    trigger: async (_data?: any, _opts?: any) => value,
    error: undefined,
    isMutating: false,
    isLoading: false,
  });
}

// Helper: creates a mock mutation hook
function mockMutation<TReturn>(value: TReturn) {
  return () => ({
    data: undefined as any,
    trigger: async (_data?: any, _opts?: any) => value,
    error: undefined,
    isMutating: false,
  });
}

export function useSaveOnboardingEmail() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}

export function useCreateOtp() {
  return mockMutation<{ code: string; uri: string; recoveryCode: string }>({
    code: 'mock',
    uri: 'mock',
    recoveryCode: 'mock',
  })();
}

export function useGetOtp() {
  return mockTrigger<{ code: string; uri: string }>({
    code: 'mock',
    uri: 'mock',
  })();
}

export function useDeleteOtp() {
  return mockMutation<void>(undefined)();
}

export function useActivateOtp() {
  return mockMutation<void>(undefined)();
}

export function useResetRecoveryCode() {
  return mockMutation<{ code: string; uri: string; recoveryCode: string }>({
    code: 'mock',
    uri: 'mock',
    recoveryCode: 'mock',
  })();
}

export function useVerifyRecoveryCode() {
  return mockMutation<{ user: LoggedInUser; backupCode: string }>({
    user: MOCK_USER,
    backupCode: 'mock',
  })();
}

export function useSetPrimaryWallet() {
  return mockMutation<void>(undefined)();
}

export function useVerifyOtp() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}

export function useGetTriggerUser() {
  return mockTrigger<LoggedInUser | null>(MOCK_USER)();
}

export function useLogin() {
  return mockMutation<LoggedInUser | { otpRequired: true }>(MOCK_USER)();
}

export function useLogout() {
  return mockMutation<undefined>(undefined)();
}

export function useCreateUser() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}

export function useRemoveWallet() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}

export function useAddUserWallets() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}