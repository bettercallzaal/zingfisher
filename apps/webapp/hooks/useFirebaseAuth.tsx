import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import { useState } from 'react';

import { useLocalStorage } from './useLocalStorage';

export function useFirebaseAuth({ authenticatePath = 'authenticate' } = {}) {
  const [emailForSignInFromClient, setEmailForSignIn] = useLocalStorage('emailForSignIn', '');

  return {
    // ── Phase 1 Stub: no-op all Firebase auth flows ──
    requestMagicLinkViaFirebase: async (_args: any) => {
      console.log('[Phase 1 Stub] Magic link request bypassed');
    },
    validateMagicLink: async (_email: string) => {
      console.log('[Phase 1 Stub] Magic link validation bypassed');
      return undefined;
    },
    disconnectVerifiedEmailAccount: (_email: string) => {
      console.log('[Phase 1 Stub] Email disconnect bypassed');
    },
    emailForSignIn: emailForSignInFromClient || '',
    setEmailForSignIn,
  };
}