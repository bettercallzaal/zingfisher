import { prisma } from '@charmverse/core/prisma-client';
import { log } from '@packages/core/log';
import { onError, onNoMatch, requireUser } from '@packages/lib/middleware';
import { withSessionRoute } from '@packages/lib/session/withSession';
import { checkZaoMembership } from '@packages/lib/zao/respectGate';
import type { MembershipCheckResult } from '@packages/lib/zao/respectGate';
import {
  classifyVoucherStatus,
  getMemberPermissions,
  isOwnedAddress,
  parseZid,
  validateDeclaredGoals,
  validateHandle,
  ZAAL_ADDRESS,
  type ZidProfile
} from '@packages/lib/zao/zid';
import { getZidStore, HandleTakenError } from '@packages/lib/zao/zidStore';
import { InvalidInputError } from '@packages/utils/errors';
import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import * as yup from 'yup';

const handler = nc<NextApiRequest, NextApiResponse>({ onError, onNoMatch });

handler.get(getProfile);
handler.post(requireUser, createProfile);
handler.patch(requireUser, updateProfile);

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

// Input shape for POST. Lengths are generous but bounded so a request cannot carry
// arbitrary payloads into the profile store. Field semantics: zid.ts (items 29, 30).
const createProfileSchema = yup.object({
  address: yup.string().trim().matches(ADDRESS_RE, 'A valid 0x wallet address is required').required(),
  displayName: yup.string().trim().max(80).default(''),
  handle: yup.string().trim().max(40).required('A handle is required'),
  goalsAndVision: yup.string().trim().max(2000).required('Declared creative goals and vision are required'),
  bio: yup.string().trim().max(1000).optional(),
  farcasterHandle: yup.string().trim().max(64).optional(),
  discordHandle: yup.string().trim().max(64).optional(),
  voucherAddress: yup.string().trim().matches(ADDRESS_RE, 'Voucher must be a 0x wallet address').optional(),
  voucherName: yup.string().trim().max(80).optional()
});

// Input shape for PATCH. ZID, wallet and handle are not editable, so they are not in it;
// stripUnknown drops them if sent. Same limits as the claim.
const updateProfileSchema = yup.object({
  address: yup.string().trim().matches(ADDRESS_RE, 'A valid 0x wallet address is required').required(),
  displayName: yup.string().trim().max(80).optional(),
  goalsAndVision: yup.string().trim().max(2000).optional(),
  bio: yup.string().trim().max(1000).optional(),
  farcasterHandle: yup.string().trim().max(64).optional(),
  discordHandle: yup.string().trim().max(64).optional()
});

// The RPC error text never reaches the client: it can carry provider URLs and keys.
const RPC_ERROR_MESSAGE = 'Optimism RPC read failed. Balance is UNKNOWN, not zero.';

// A wallet address or a ZID ("501", "ZID-501"), as the member pages link them.
async function findProfile(identifier: string): Promise<ZidProfile | null> {
  const clean = identifier.trim().toLowerCase();
  if (clean.startsWith('0x')) {
    return getZidStore().getByAddress(clean);
  }
  const zid = parseZid(clean);
  return zid === null ? null : getZidStore().getByZid(zid);
}

async function getSessionWallets(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { wallets: { select: { address: true } } }
  });
  return user?.wallets.map((w) => w.address) ?? [];
}

function applyLiveBalances(profile: ZidProfile, membership: MembershipCheckResult) {
  const ogResult = membership.results.find((r) => r.label?.includes('OG'));
  const zorResult = membership.results.find((r) => r.label?.includes('ZOR'));
  profile.ledgers.parentZao.ogBalance = ogResult?.balance ?? null;
  profile.ledgers.parentZao.zorBalance = zorResult?.balance ?? null;
  profile.ledgers.parentZao.governanceWeight = membership.governanceWeight;
  profile.ledgers.parentZao.chainReadStatus = 'ok';
  profile.ledgers.parentZao.chainError = undefined;
  profile.permissions = getMemberPermissions({ governanceWeight: membership.governanceWeight });
}

function markReadFailed(profile: ZidProfile) {
  profile.ledgers.parentZao.chainReadStatus = 'error';
  profile.ledgers.parentZao.chainError = RPC_ERROR_MESSAGE;
  profile.ledgers.parentZao.ogBalance = null;
  profile.ledgers.parentZao.zorBalance = null;
  profile.ledgers.parentZao.governanceWeight = null;
  profile.permissions = getMemberPermissions({ governanceWeight: null });
}

// GET /api/zao/zid?identifier=0x... or ?identifier=501
//   One profile by wallet or ZID: public, like the member page it feeds (grill 2026-09-22 item 14).
// GET /api/zao/zid (no identifier)
//   Signed-in callers get the profiles bound to their own wallets. Nobody gets the whole registry.
async function getProfile(
  req: NextApiRequest,
  res: NextApiResponse<ZidProfile | ZidProfile[] | { error: string; chainReadStatus?: string }>
) {
  const identifier = (req.query.identifier || req.query.address || req.query.zid) as string | undefined;

  if (!identifier) {
    if (!req.session?.user) {
      return res.status(401).json({ error: 'Sign in to list your ZID profiles' });
    }
    const wallets = await getSessionWallets(req.session.user.id);
    const mine = (await getZidStore().listByAddresses(wallets)).filter((p) => isOwnedAddress(wallets, p.address));
    return res.status(200).json(mine);
  }

  if (identifier.length > 64) {
    throw new InvalidInputError('Identifier too long');
  }

  // Check if identifier is an existing registered profile
  let profile = await findProfile(identifier);

  let targetAddress: string | null = profile?.address || null;
  if (!targetAddress && ADDRESS_RE.test(identifier)) {
    targetAddress = identifier.toLowerCase();
  }

  if (targetAddress) {
    const normAddress = targetAddress.toLowerCase();
    const isZaal = normAddress === ZAAL_ADDRESS.toLowerCase();

    // Read live on-chain Respect balances from Optimism at request time
    try {
      const membership = await checkZaoMembership(normAddress);
      const isReadFailure = membership.status === 'error';

      if (isReadFailure) {
        log.warn('[zao/zid] Optimism read failed', { address: normAddress, error: membership.error });
        if (profile) {
          markReadFailed(profile);
          return res.status(200).json(profile);
        }
        // Unregistered address cannot be evaluated: return 503, NEVER zero balance
        return res.status(503).json({ error: RPC_ERROR_MESSAGE, chainReadStatus: 'error' });
      }

      const governanceWeight = membership.governanceWeight;

      if (!profile) {
        const hasRespect = governanceWeight !== null && BigInt(governanceWeight) > BigInt(0);
        profile = {
          zid: isZaal ? 1 : null, // ZID 1 for Zaal (grill 2026-09-22 afternoon item 19); 2-500 reserved pending ruling
          formattedZid: isZaal ? 'ZID-001' : 'UNASSIGNED',
          address: normAddress,
          displayName: isZaal ? 'Zaal' : `${normAddress.slice(0, 6)}...${normAddress.slice(-4)}`,
          handle: isZaal ? 'zaal' : normAddress.slice(0, 8),
          goalsAndVision: isZaal
            ? 'The movement for the new creator economy of bringing profit margin data and IP rights back to independent artists.'
            : '',
          voucher: {
            status: classifyVoucherStatus({
              hasExplicitPeerVoucher: isZaal,
              unrecordedTokenHolder: hasRespect && !isZaal
            }),
            note: isZaal
              ? 'Founder (ZID 1, ruled 2026-09-22)'
              : hasRespect
                ? 'On-chain Respect holder (ZIDs 2-500 reserved pending Zaal ruling)'
                : 'Unassigned profile: complete onboarding to claim permanent ZID'
          },
          joinedAt: new Date().toISOString(),
          socials: isZaal ? { farcaster: 'zaal', twitter: 'bettercallzaal', ens: 'bettercallzaal.eth' } : {},
          hats: [],
          ledgers: {
            parentZao: {
              ogBalance: null,
              zorBalance: null,
              governanceWeight: null,
              chainReadStatus: 'pending'
            },
            zaoFestivals: { status: 'not_yet_established' },
            incubated: { status: 'not_yet_established' }
          },
          governance: { authoredCount: 0, endorsedCount: 0, votesCast: 0 },
          fractalHistory: [], // Real chain/bot mirroring scheduled for Phase 3
          permissions: getMemberPermissions({ governanceWeight })
        };
      }
      applyLiveBalances(profile, membership);

      return res.status(200).json(profile);
    } catch (err) {
      log.warn('[zao/zid] Optimism read threw', { address: normAddress, error: (err as Error)?.message });
      if (profile) {
        markReadFailed(profile);
        return res.status(200).json(profile);
      }
      return res.status(503).json({ error: RPC_ERROR_MESSAGE, chainReadStatus: 'error' });
    }
  }

  return res.status(404).json({ error: 'Member not found' });
}

// POST /api/zao/zid
// Completes onboarding for the SIGNED-IN wallet only, validates stated goals and vision
// (item 30), and assigns the next permanent ZID (501+). A profile can only be created
// for a wallet linked to the caller's session; any other address is refused.
async function createProfile(req: NextApiRequest, res: NextApiResponse<ZidProfile | { error: string }>) {
  let input: yup.InferType<typeof createProfileSchema>;
  try {
    input = await createProfileSchema.validate(req.body ?? {}, { abortEarly: true, stripUnknown: true });
  } catch (err) {
    const message = err instanceof yup.ValidationError ? err.message : 'Invalid input';
    throw new InvalidInputError(message);
  }

  const wallets = await getSessionWallets(req.session.user.id);
  if (!isOwnedAddress(wallets, input.address)) {
    return res.status(403).json({ error: 'You can only claim a ZID for a wallet linked to your account' });
  }

  // Our own validators carry user-facing reasons; surface those and nothing else.
  const handleCheck = validateHandle(input.handle);
  if (!handleCheck.valid) {
    throw new InvalidInputError(handleCheck.reason || 'Invalid handle');
  }
  const goalsCheck = validateDeclaredGoals(input.goalsAndVision);
  if (!goalsCheck.valid) {
    throw new InvalidInputError(goalsCheck.reason || 'Declared creative goals and vision are required');
  }

  let profile: ZidProfile;
  try {
    profile = await getZidStore().create({
      userId: req.session.user.id,
      address: input.address.toLowerCase(),
      displayName: input.displayName || input.handle,
      handle: input.handle,
      goalsAndVision: input.goalsAndVision,
      bio: input.bio,
      farcasterHandle: input.farcasterHandle,
      discordHandle: input.discordHandle,
      voucherAddress: input.voucherAddress?.toLowerCase(),
      voucherName: input.voucherName
    });
  } catch (err) {
    if (err instanceof HandleTakenError) {
      return res.status(409).json({ error: err.message });
    }
    log.error('[zao/zid] ZID claim failed', { error: (err as Error)?.message });
    return res.status(400).json({ error: 'Failed to create ZID profile' });
  }

  await attachLiveBalances(profile);
  return res.status(201).json(profile);
}

// PATCH /api/zao/zid
// Edits the SIGNED-IN wallet's own profile: display name, intro, goals and socials. ZID, wallet
// and handle stay fixed. Any address not linked to the caller's session is refused.
async function updateProfile(req: NextApiRequest, res: NextApiResponse<ZidProfile | { error: string }>) {
  let input: yup.InferType<typeof updateProfileSchema>;
  try {
    input = await updateProfileSchema.validate(req.body ?? {}, { abortEarly: true, stripUnknown: true });
  } catch (err) {
    const message = err instanceof yup.ValidationError ? err.message : 'Invalid input';
    throw new InvalidInputError(message);
  }

  const wallets = await getSessionWallets(req.session.user.id);
  if (!isOwnedAddress(wallets, input.address)) {
    return res.status(403).json({ error: 'You can only edit the profile of a wallet linked to your account' });
  }

  if (input.goalsAndVision !== undefined) {
    const goalsCheck = validateDeclaredGoals(input.goalsAndVision);
    if (!goalsCheck.valid) {
      throw new InvalidInputError(goalsCheck.reason || 'Declared creative goals and vision are required');
    }
  }
  if (input.displayName !== undefined && input.displayName.length === 0) {
    throw new InvalidInputError('Display name must be 1-80 characters');
  }

  let profile: ZidProfile | null;
  try {
    profile = await getZidStore().update(
      input.address.toLowerCase(),
      {
        displayName: input.displayName,
        bio: input.bio,
        goalsAndVision: input.goalsAndVision,
        farcasterHandle: input.farcasterHandle,
        discordHandle: input.discordHandle
      },
      req.session.user.id
    );
  } catch (err) {
    log.error('[zao/zid] Profile edit failed', { error: (err as Error)?.message });
    return res.status(400).json({ error: 'Failed to update ZID profile' });
  }
  if (!profile) {
    return res.status(404).json({ error: 'This wallet has no ZID yet' });
  }

  await attachLiveBalances(profile);
  return res.status(200).json(profile);
}

// Live chain read from Optimism after a write; a failed read is UNKNOWN, never zero.
async function attachLiveBalances(profile: ZidProfile) {
  try {
    const membership = await checkZaoMembership(profile.address);
    if (membership.status === 'ok') {
      applyLiveBalances(profile, membership);
    } else {
      log.warn('[zao/zid] Optimism read failed after a write', {
        address: profile.address,
        error: membership.error
      });
      markReadFailed(profile);
    }
  } catch (err) {
    log.warn('[zao/zid] Optimism read threw after a write', {
      address: profile.address,
      error: (err as Error)?.message
    });
    markReadFailed(profile);
  }
}

export default withSessionRoute(handler);
