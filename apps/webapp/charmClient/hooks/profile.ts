import type { UserWallet } from '@charmverse/core/prisma-client';
import type { SignatureVerificationPayloadWithAddress } from '@packages/lib/blockchain/signAndVerify';
import type { LoggedInUser } from '@packages/profile/getUser';

import { zaoRealSignInEnabled } from 'lib/zao/realSignIn';
import type { EmailPreferences } from 'pages/api/profile/onboarding-email';

import { useDELETE, useGETtrigger, usePOST, usePUT } from './helpers';

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
  profile: null
} as unknown as LoggedInUser;

// Helper: creates a mock SWR trigger hook
function mockTrigger<TReturn>(value: TReturn) {
  return () => ({
    data: undefined as any,
    trigger: async (_data?: any, _opts?: any) => value,
    error: undefined,
    isMutating: false,
    isLoading: false
  });
}

// Helper: creates a mock mutation hook
function mockMutation<TReturn>(value: TReturn) {
  return () => ({
    data: undefined as any,
    trigger: async (_data?: any, _opts?: any) => value,
    error: undefined,
    isMutating: false
  });
}

function useStubSaveOnboardingEmail() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}

function useStubCreateOtp() {
  return mockMutation<{ code: string; uri: string; recoveryCode: string }>({
    code: 'mock',
    uri: 'mock',
    recoveryCode: 'mock'
  })();
}

function useStubGetOtp() {
  return mockTrigger<{ code: string; uri: string }>({
    code: 'mock',
    uri: 'mock'
  })();
}

function useStubDeleteOtp() {
  return mockMutation<void>(undefined)();
}

function useStubActivateOtp() {
  return mockMutation<void>(undefined)();
}

function useStubResetRecoveryCode() {
  return mockMutation<{ code: string; uri: string; recoveryCode: string }>({
    code: 'mock',
    uri: 'mock',
    recoveryCode: 'mock'
  })();
}

function useStubVerifyRecoveryCode() {
  return mockMutation<{ user: LoggedInUser; backupCode: string }>({
    user: MOCK_USER,
    backupCode: 'mock'
  })();
}

function useStubSetPrimaryWallet() {
  return mockMutation<void>(undefined)();
}

function useStubVerifyOtp() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}

function useStubGetTriggerUser() {
  return mockTrigger<LoggedInUser | null>(MOCK_USER)();
}

function useStubLogin() {
  return mockMutation<LoggedInUser | { otpRequired: true }>(MOCK_USER)();
}

function useStubLogout() {
  return mockMutation<undefined>(undefined)();
}

function useStubCreateUser() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}

function useStubRemoveWallet() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}

function useStubAddUserWallets() {
  return mockMutation<LoggedInUser>(MOCK_USER)();
}

// Real CharmVerse endpoints, used only when NEXT_PUBLIC_ZAO_REAL_SIGNIN=true (lib/zao/realSignIn.ts).
// Each export carries the real hook's type so callers stay typed; the stubs return looser shapes.
function useRealSaveOnboardingEmail() {
  return usePUT<EmailPreferences, LoggedInUser>('/api/profile/onboarding-email');
}

function useRealCreateOtp() {
  return usePOST<undefined, { code: string; uri: string; recoveryCode: string }>(`/api/profile/otp`);
}

function useRealGetOtp() {
  return useGETtrigger<{ authCode: string }, { code: string; uri: string }>(`/api/profile/otp`);
}

function useRealDeleteOtp() {
  return useDELETE<{ authCode: string }>(`/api/profile/otp`);
}

function useRealActivateOtp() {
  return usePUT<{ authCode: string }, void>(`/api/profile/otp/activate`);
}

function useRealResetRecoveryCode() {
  return usePUT<{ authCode: string }, { code: string; uri: string; recoveryCode: string }>(
    `/api/profile/otp/recovery-code`
  );
}

function useRealVerifyRecoveryCode() {
  return usePOST<{ backupCode: string }, { user: LoggedInUser; backupCode: string }>(`/api/profile/otp/recovery-code`);
}

function useRealSetPrimaryWallet() {
  return usePUT<{ walletId: string }, void>(`/api/profile/primary-wallet`);
}

function useRealVerifyOtp() {
  return usePOST<{ authCode: string }, LoggedInUser>(`/api/profile/otp/verify`);
}

function useRealGetTriggerUser() {
  return useGETtrigger<undefined, LoggedInUser | null>('/api/profile');
}

function useRealLogin() {
  return usePOST<SignatureVerificationPayloadWithAddress, LoggedInUser | { otpRequired: true }>('/api/session/login');
}

function useRealLogout() {
  return usePOST<undefined, undefined>(`/api/session/logout`);
}

function useRealCreateUser() {
  return usePOST<SignatureVerificationPayloadWithAddress, LoggedInUser>('/api/profile');
}

function useRealRemoveWallet() {
  return usePOST<Pick<UserWallet, 'address'>, LoggedInUser>('/api/profile/remove-wallet');
}

function useRealAddUserWallets() {
  return usePOST<SignatureVerificationPayloadWithAddress, LoggedInUser>('/api/profile/add-wallets');
}

export const useSaveOnboardingEmail: typeof useRealSaveOnboardingEmail = zaoRealSignInEnabled
  ? useRealSaveOnboardingEmail
  : (useStubSaveOnboardingEmail as unknown as typeof useRealSaveOnboardingEmail);
export const useCreateOtp: typeof useRealCreateOtp = zaoRealSignInEnabled
  ? useRealCreateOtp
  : (useStubCreateOtp as unknown as typeof useRealCreateOtp);
export const useGetOtp: typeof useRealGetOtp = zaoRealSignInEnabled
  ? useRealGetOtp
  : (useStubGetOtp as unknown as typeof useRealGetOtp);
export const useDeleteOtp: typeof useRealDeleteOtp = zaoRealSignInEnabled
  ? useRealDeleteOtp
  : (useStubDeleteOtp as unknown as typeof useRealDeleteOtp);
export const useActivateOtp: typeof useRealActivateOtp = zaoRealSignInEnabled
  ? useRealActivateOtp
  : (useStubActivateOtp as unknown as typeof useRealActivateOtp);
export const useResetRecoveryCode: typeof useRealResetRecoveryCode = zaoRealSignInEnabled
  ? useRealResetRecoveryCode
  : (useStubResetRecoveryCode as unknown as typeof useRealResetRecoveryCode);
export const useVerifyRecoveryCode: typeof useRealVerifyRecoveryCode = zaoRealSignInEnabled
  ? useRealVerifyRecoveryCode
  : (useStubVerifyRecoveryCode as unknown as typeof useRealVerifyRecoveryCode);
export const useSetPrimaryWallet: typeof useRealSetPrimaryWallet = zaoRealSignInEnabled
  ? useRealSetPrimaryWallet
  : (useStubSetPrimaryWallet as unknown as typeof useRealSetPrimaryWallet);
export const useVerifyOtp: typeof useRealVerifyOtp = zaoRealSignInEnabled
  ? useRealVerifyOtp
  : (useStubVerifyOtp as unknown as typeof useRealVerifyOtp);
export const useGetTriggerUser: typeof useRealGetTriggerUser = zaoRealSignInEnabled
  ? useRealGetTriggerUser
  : (useStubGetTriggerUser as unknown as typeof useRealGetTriggerUser);
export const useLogin: typeof useRealLogin = zaoRealSignInEnabled
  ? useRealLogin
  : (useStubLogin as unknown as typeof useRealLogin);
export const useLogout: typeof useRealLogout = zaoRealSignInEnabled
  ? useRealLogout
  : (useStubLogout as unknown as typeof useRealLogout);
export const useCreateUser: typeof useRealCreateUser = zaoRealSignInEnabled
  ? useRealCreateUser
  : (useStubCreateUser as unknown as typeof useRealCreateUser);
export const useRemoveWallet: typeof useRealRemoveWallet = zaoRealSignInEnabled
  ? useRealRemoveWallet
  : (useStubRemoveWallet as unknown as typeof useRealRemoveWallet);
export const useAddUserWallets: typeof useRealAddUserWallets = zaoRealSignInEnabled
  ? useRealAddUserWallets
  : (useStubAddUserWallets as unknown as typeof useRealAddUserWallets);
