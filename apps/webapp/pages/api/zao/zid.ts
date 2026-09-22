import { onError, onNoMatch } from '@packages/lib/middleware';
import { withSessionRoute } from '@packages/lib/session/withSession';
import { checkZaoMembership } from '@packages/lib/zao/respectGate';
import {
  assignNextZid,
  calculateGovernanceWeight,
  classifyVoucherStatus,
  getMemberPermissions,
  getZidProfile,
  listZidProfiles,
  ZAAL_ADDRESS,
  type ZidProfile
} from '@packages/lib/zao/zid';
import { InvalidInputError } from '@packages/utils/errors';
import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>({ onError, onNoMatch });

handler.get(getProfile);
handler.post(createProfile);

// GET /api/zao/zid?identifier=0x... or ?identifier=501 or no params (list)
async function getProfile(
  req: NextApiRequest,
  res: NextApiResponse<ZidProfile | ZidProfile[] | { error: string; chainReadStatus?: string }>
) {
  const identifier = (req.query.identifier || req.query.address || req.query.zid) as string | undefined;

  if (!identifier) {
    const all = listZidProfiles();
    return res.status(200).json(all);
  }

  // Check if identifier is an existing registered profile
  let profile = getZidProfile(identifier);

  let targetAddress: string | null = profile?.address || null;
  if (!targetAddress && /^0x[a-fA-F0-9]{40}$/.test(identifier)) {
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
        if (profile) {
          // Return registered profile with explicit staleness and null weight
          profile.ledgers.parentZao.chainReadStatus = 'error';
          profile.ledgers.parentZao.chainError = membership.error || 'Optimism RPC read failed';
          profile.ledgers.parentZao.ogBalance = null;
          profile.ledgers.parentZao.zorBalance = null;
          profile.ledgers.parentZao.governanceWeight = null;
          profile.permissions = getMemberPermissions({ governanceWeight: null });
          return res.status(200).json(profile);
        }
        // Unregistered address cannot be evaluated: return 503, NEVER zero balance
        return res.status(503).json({
          error: 'Could not read on-chain balances from Optimism RPC. Balance is UNKNOWN, not zero.',
          chainReadStatus: 'error'
        });
      }

      const ogResult = membership.results.find((r) => r.label?.includes('OG'));
      const zorResult = membership.results.find((r) => r.label?.includes('ZOR'));
      const governanceWeight = membership.governanceWeight;

      if (!profile) {
        const hasRespect = governanceWeight !== null && BigInt(governanceWeight) > BigInt(0);
        profile = {
          zid: isZaal ? 0 : null, // 0 for Zaal; 1-500 reserved pending Zaal ruling
          formattedZid: isZaal ? 'ZID-000' : 'UNASSIGNED',
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
              ? 'Founder (ZID 0 decided 2026-08-25)'
              : hasRespect
                ? 'On-chain Respect holder (ZIDs 1-500 reserved pending Zaal ruling)'
                : 'Unassigned profile: complete onboarding to claim permanent ZID'
          },
          joinedAt: new Date().toISOString(),
          socials: isZaal ? { farcaster: 'zaal', twitter: 'bettercallzaal', ens: 'bettercallzaal.eth' } : {},
          hats: [],
          ledgers: {
            parentZao: {
              ogBalance: ogResult?.balance ?? null,
              zorBalance: zorResult?.balance ?? null,
              governanceWeight,
              chainReadStatus: 'ok'
            },
            zaoFestivals: { status: 'not_yet_established' },
            incubated: { status: 'not_yet_established' }
          },
          governance: { authoredCount: 0, endorsedCount: 0, votesCast: 0 },
          fractalHistory: [], // Real chain/bot mirroring scheduled for Phase 3
          permissions: getMemberPermissions({ governanceWeight })
        };
      } else {
        // Update registered profile with live on-chain balances
        profile.ledgers.parentZao.ogBalance = ogResult?.balance ?? null;
        profile.ledgers.parentZao.zorBalance = zorResult?.balance ?? null;
        profile.ledgers.parentZao.governanceWeight = governanceWeight;
        profile.ledgers.parentZao.chainReadStatus = 'ok';
        profile.permissions = getMemberPermissions({ governanceWeight });
      }

      return res.status(200).json(profile);
    } catch (err: any) {
      if (profile) {
        profile.ledgers.parentZao.chainReadStatus = 'error';
        profile.ledgers.parentZao.chainError = err?.message || 'Failed to reach Optimism RPC';
        profile.ledgers.parentZao.ogBalance = null;
        profile.ledgers.parentZao.zorBalance = null;
        profile.ledgers.parentZao.governanceWeight = null;
        profile.permissions = getMemberPermissions({ governanceWeight: null });
        return res.status(200).json(profile);
      }
      return res.status(503).json({
        error: `Could not read on-chain balances: ${err.message}. Balance is UNKNOWN, not zero.`,
        chainReadStatus: 'error'
      });
    }
  }

  return res.status(404).json({ error: `Member not found for identifier: ${identifier}` });
}

// POST /api/zao/zid
// Completes onboarding, validates stated goals & vision (item 30), and assigns permanent ZID (501+)
async function createProfile(req: NextApiRequest, res: NextApiResponse<ZidProfile | { error: string }>) {
  const {
    address,
    displayName,
    handle,
    goalsAndVision,
    bio,
    farcasterHandle,
    discordHandle,
    voucherAddress,
    voucherName
  } = req.body || {};

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new InvalidInputError('A valid 0x wallet address is required');
  }

  try {
    const profile = assignNextZid({
      address,
      displayName: displayName || handle,
      handle,
      goalsAndVision,
      bio,
      farcasterHandle,
      discordHandle,
      voucherAddress,
      voucherName
    });

    // Attempt live chain read from Optimism
    try {
      const membership = await checkZaoMembership(address);
      if (membership.status === 'ok') {
        const ogResult = membership.results.find((r) => r.label?.includes('OG'));
        const zorResult = membership.results.find((r) => r.label?.includes('ZOR'));
        profile.ledgers.parentZao.ogBalance = ogResult?.balance ?? null;
        profile.ledgers.parentZao.zorBalance = zorResult?.balance ?? null;
        profile.ledgers.parentZao.governanceWeight = membership.governanceWeight;
        profile.ledgers.parentZao.chainReadStatus = 'ok';
        profile.permissions = getMemberPermissions({ governanceWeight: membership.governanceWeight });
      } else {
        profile.ledgers.parentZao.chainReadStatus = 'error';
        profile.ledgers.parentZao.chainError = membership.error;
      }
    } catch {
      profile.ledgers.parentZao.chainReadStatus = 'error';
    }

    return res.status(201).json(profile);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create ZID profile' });
  }
}

export default withSessionRoute(handler);
