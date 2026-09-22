import { onError, onNoMatch } from '@packages/lib/middleware';
import { withSessionRoute } from '@packages/lib/session/withSession';
import type { MembershipCheckResult } from '@packages/lib/zao/respectGate';
import { checkZaoMembership } from '@packages/lib/zao/respectGate';
import { InvalidInputError } from '@packages/utils/errors';
import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>({ onError, onNoMatch });

handler.get(getMembership);

// GET /api/zao/membership?address=0x... -> MembershipCheckResult
// Checks Parent ZAO membership across Respect OG + ZOR on Optimism (1:1 unweighted sum).
// On RPC failure, returns 503 with governanceWeight null; NEVER returns a fake zero balance.
async function getMembership(req: NextApiRequest, res: NextApiResponse<MembershipCheckResult | { error: string }>) {
  const address = req.query.address as string | undefined;

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new InvalidInputError('A valid 0x wallet address is required');
  }

  const result = await checkZaoMembership(address);
  if (result.status === 'error') {
    return res.status(503).json(result);
  }
  res.status(200).json(result);
}

export default withSessionRoute(handler);
