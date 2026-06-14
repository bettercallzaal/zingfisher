import type { UserWallet } from '@charmverse/core/prisma';
import type { Web3Provider } from '@ethersproject/providers';
import { getWagmiConfig } from '@packages/blockchain/connectors/config';
import type {
 SignatureVerificationPayload,
 SignatureVerificationPayloadWithAddress
} from '@packages/lib/blockchain/signAndVerify';
import type { LoggedInUser } from '@packages/profile/getUser';
import type { SystemError } from '@packages/utils/errors';
import { MissingWeb3AccountError } from '@packages/utils/errors';
import { lowerCaseEqual } from '@packages/utils/strings';
import { watchAccount } from '@wagmi/core';
import type { BrowserProvider, Signer } from 'ethers';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SiweMessage } from 'siwe';
import { mutate } from 'swr';
import { getAddress } from 'viem';

import { useCreateUser, useLogin, useRemoveWallet } from 'charmClient/hooks/profile';
import { useWeb3Signer } from 'hooks/useWeb3Signer';
import { useAccount, useConnect, useSignMessage } from 'hooks/wagmi';

import { useUser } from './useUser';
import { useVerifyLoginOtp } from './useVerifyLoginOtp';

type IContext = {
 // Web3 account belonging to the current logged in user
 account?: string | null;
 chainId: any;
 requestSignature: () => Promise<SignatureVerificationPayloadWithAddress>;
 disconnectWallet: (address: UserWallet['address']) => Promise<void>;
 // A wallet is currently connected and can be used to generate signatures. This is different from a user being connected
 verifiableWalletDetected: boolean;
 isSigning: boolean;
 resetSigning: () => void;
 loginFromWeb3Account: (payload?: SignatureVerificationPayload) => Promise<LoggedInUser | undefined>;
 setAccountUpdatePaused: (paused: boolean) => void;
 signer: Signer | undefined;
 provider: BrowserProvider | undefined;
 legacyProvider: Web3Provider | undefined; // USE THIS FOR SNAPSHOT
};

export const Web3Context = createContext<Readonly<IContext>>({
 account: null,
 requestSignature: async () => Promise.resolve({} as any),
 disconnectWallet: async () => {},
 chainId: null,
 verifiableWalletDetected: false,
 isSigning: false,
 resetSigning: () => null,
 loginFromWeb3Account: () => Promise.resolve(null as any),
 setAccountUpdatePaused: () => null,
 signer: undefined,
 provider: undefined,
 legacyProvider: undefined
});

// STUB: No real wallet connection. Returns safe defaults so the app loads without auth wall.
export function Web3AccountProvider({ children }: { children: ReactNode }) {
 const value = useMemo<IContext>(
   () => ({
     account: null,
     requestSignature: async () => {
       throw new MissingWeb3AccountError();
     },
     disconnectWallet: async () => {},
     chainId: null,
     verifiableWalletDetected: false,
     isSigning: false,
     resetSigning: () => {},
     loginFromWeb3Account: async () => undefined,
     setAccountUpdatePaused: () => {},
     signer: undefined,
     provider: undefined,
     legacyProvider: undefined
   }),
   []
 );

 return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export const useWeb3Account = () => useContext(Web3Context);
