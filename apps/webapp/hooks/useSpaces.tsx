import type { Space } from '@charmverse/core/prisma';
import type { ReactNode } from 'react';
import { useCallback, createContext, useContext, useEffect, useMemo, useState } from 'react';

import charmClient from 'charmClient';
import type { CreateSpaceProps } from 'lib/spaces/createSpace';

import { useUser } from './useUser';

/**
 * @memberSpaces - Subset of spaces where user is not a guest (ie. they are normal member or admin)
 */
export type IContext = {
 spaces: Space[];
 memberSpaces: Space[];
 setSpace: (space: Space) => void;
 setSpaces: (spaces: Space[]) => void;
 isLoaded: boolean;
 createNewSpace: (data: Pick<CreateSpaceProps, 'spaceTemplate' | 'spaceData'>) => Promise<Space>;
 isCreatingSpace: boolean;
};

export const SpacesContext = createContext<Readonly<IContext>>({
 spaces: [],
 memberSpaces: [],
 setSpace: () => undefined,
 setSpaces: () => undefined,
 isLoaded: false,
 createNewSpace: () => Promise.reject(),
 isCreatingSpace: false
});

// Dev mode mock space
const MOCK_SPACE: Space = {
 id: 'dev-mock-space-001',
 name: 'ZAO Learning Center',
 domain: 'kfmedia-learning',
 spaceImage: null,
 createdAt: new Date(),
 updatedAt: new Date(),
 createdBy: 'dev-user',
 publicBountyBoard: false,
 publicProposals: false,
 defaultPublicPages: false,
 defaultPagePermissionGroup: 'full_access',
 defaultPostPermissionGroup: 'full_access',
 hiddenFeatures: [],
 notificationToggles: [],
 xpsEngineId: null,
 snapshotDomain: null,
 requireProposalTemplate: false,
 superApiTokenId: null,
 discordServerId: null,
 customNftUrl: null,
features: [
    { id: 'member_directory', isHidden: false },
    { id: 'rewards', isHidden: false }
  ]
} as any;

export function SpacesProvider({ children }: { children: ReactNode }) {
 const { user, isLoaded: isUserLoaded, refreshUser } = useUser();
 const [spaces, setSpaces] = useState<Space[]>([]);
 const [isLoaded, setIsLoaded] = useState(false);
 const [isCreatingSpace, setIsCreatingSpace] = useState(false);
 const isDev = process.env.NODE_ENV === 'development';

 useEffect(() => {
 if (user) {
 setIsLoaded(false);
 charmClient.spaces
 .getSpaces()
 .then((_spaces) => {
 setSpaces(_spaces);
 })
 .catch((err) => {})
 .finally(() => setIsLoaded(true));
 } else if (isUserLoaded) {
 setIsLoaded(true);
 }
 }, [user?.id, isUserLoaded]);

 const createNewSpace = useCallback(
 async (newSpace: Pick<CreateSpaceProps, 'spaceTemplate' | 'spaceData'>) => {
 setIsCreatingSpace(true);

 try {
 const space = await charmClient.spaces.createSpace(newSpace);
 setSpaces((s) => [...s, space]);
 // refresh user permissions
 await refreshUser();
 setIsCreatingSpace(false);
 return space;
 } catch (e) {
 setIsCreatingSpace(false);
 throw e;
 }
 },
 [setIsCreatingSpace, setSpaces]
 );

 const setSpace = useCallback(
 (_space: Space) => {
 const newSpaces = spaces.map((s) => (s.id === _space.id ? _space : s));
 setSpaces(newSpaces);
 },
 [spaces, setSpaces]
 );

 // Dev mode: inject mock space when no spaces exist
 const finalSpaces = useMemo(() => {
 if (isDev && spaces.length === 0) {
 return [MOCK_SPACE];
 }
 return spaces;
 }, [isDev, spaces]);

 const memberSpaces = useMemo(
 () => (!user ? [] : finalSpaces.filter((s) => !!user?.spaceRoles?.find((sr: any) => sr.spaceId === s.id && !sr.isGuest))),
 [user, finalSpaces]
 );

 // Dev mode: treat mock space as member space
 const finalMemberSpaces = useMemo(() => {
 if (isDev && finalSpaces.length === 1 && finalSpaces[0].id === MOCK_SPACE.id) {
 return finalSpaces;
 }
 return memberSpaces;
 }, [isDev, finalSpaces, memberSpaces]);

 const value = useMemo(
 () =>
 ({
 spaces: finalSpaces,
 memberSpaces: finalMemberSpaces,
 setSpace,
 setSpaces,
 isLoaded,
 createNewSpace,
 isCreatingSpace
 }) as IContext,
 [finalSpaces, finalMemberSpaces, isLoaded, setSpace, createNewSpace, isCreatingSpace]
 );

 return <SpacesContext.Provider value={value}>{children}</SpacesContext.Provider>;
}

export const useSpaces = () => useContext(SpacesContext);
