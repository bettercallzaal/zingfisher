// STUB: Space creation disabled in closed learning center environment
// Admin-only: users are assigned to spaces, they don't create them

export type CreateSpaceProps = {
  spaceName: string;
  spaceTemplate?: string;
  spaceData?: Record<string, any>;
};

export type SpaceCreateInput = CreateSpaceProps;

export async function createWorkspace(props: CreateSpaceProps): Promise<any> {
  throw new Error('Space creation is disabled');
}
