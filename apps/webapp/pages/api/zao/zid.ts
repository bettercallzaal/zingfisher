import { onError, onNoMatch } from "@packages/lib/middleware";
import { withSessionRoute } from "@packages/lib/session/withSession";
import { checkZaoMembership } from "@packages/lib/zao/respectGate";
import {
  assignNextZid,
  calculateGovernanceWeight,
  classifyVoucherStatus,
  getMemberPermissions,
  getZidProfile,
  listZidProfiles,
  type ZidProfile
} from "@packages/lib/zao/zid";
import { InvalidInputError } from "@packages/utils/errors";
import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

const handler = nc<NextApiRequest, NextApiResponse>({ onError, onNoMatch });

handler.get(getProfile);
handler.post(createProfile);

// GET /api/zao/zid?identifier=0x... or ?identifier=501 or no params (list)
async function getProfile(
  req: NextApiRequest,
  res: NextApiResponse<ZidProfile | ZidProfile[] | { error: string }>
) {
  const identifier = (req.query.identifier || req.query.address || req.query.zid) as string | undefined;

  if (!identifier) {
    const all = listZidProfiles();
    return res.status(200).json(all);
  }

  const profile = getZidProfile(identifier);
  if (profile) {
    return res.status(200).json(profile);
  }

  // If identifier is a valid 0x address not yet in runtime store, check on-chain Respect
  if (/^0x[a-fA-F0-9]{40}$/.test(identifier)) {
    const normAddress = identifier.toLowerCase();
    try {
      const { results, governanceWeight } = await checkZaoMembership(normAddress);
      const ogResult = results.find((r) => r.label?.includes("OG"));
      const zorResult = results.find((r) => r.label?.includes("ZOR"));

      const adHocProfile: ZidProfile = {
        zid: -1,
        formattedZid: "UNASSIGNED",
        address: normAddress,
        displayName: `${normAddress.slice(0, 6)}...${normAddress.slice(-4)}`,
        handle: normAddress.slice(0, 8),
        goalsAndVision: "",
        voucher: {
          status: classifyVoucherStatus({
            unrecordedTokenHolder: BigInt(governanceWeight) > BigInt(0)
          }),
          note: "Unassigned profile: complete onboarding to claim permanent ZID"
        },
        joinedAt: new Date().toISOString(),
        socials: {},
        hats: [],
        ledgers: {
          parentZao: {
            ogBalance: ogResult?.balance || "0",
            zorBalance: zorResult?.balance || "0",
            governanceWeight
          },
          zaoFestivals: { respectBalance: "0" },
          incubated: {}
        },
        governance: { authoredCount: 0, endorsedCount: 0, votesCast: 0 },
        fractalHistory: [],
        permissions: getMemberPermissions({ governanceWeight })
      };
      return res.status(200).json(adHocProfile);
    } catch {
      // Return 404 if not found and chain read fails
      return res.status(404).json({ error: `Member not found for identifier: ${identifier}` });
    }
  }

  return res.status(404).json({ error: `Member not found for identifier: ${identifier}` });
}

// POST /api/zao/zid
// Completes onboarding, validates stated goals & vision (item 30), and assigns permanent ZID
async function createProfile(
  req: NextApiRequest,
  res: NextApiResponse<ZidProfile | { error: string }>
) {
  const { address, displayName, handle, goalsAndVision, bio, farcasterHandle, discordHandle, voucherAddress, voucherName } = req.body || {};

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new InvalidInputError("A valid 0x wallet address is required");
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

    // Augment with on-chain Respect balances
    try {
      const { results, governanceWeight } = await checkZaoMembership(address);
      const ogResult = results.find((r) => r.label?.includes("OG"));
      const zorResult = results.find((r) => r.label?.includes("ZOR"));
      profile.ledgers.parentZao.ogBalance = ogResult?.balance || "0";
      profile.ledgers.parentZao.zorBalance = zorResult?.balance || "0";
      profile.ledgers.parentZao.governanceWeight = governanceWeight;
      profile.permissions = getMemberPermissions({ governanceWeight });
    } catch {
      // Non-fatal if chain check fails in dev/offline
    }

    return res.status(201).json(profile);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to create ZID profile" });
  }
}

export default withSessionRoute(handler);
