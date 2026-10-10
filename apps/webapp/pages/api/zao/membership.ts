import { onError, onNoMatch } from '@packages/lib/middleware';
import { withSessionRoute } from '@packages/lib/session/withSession';
import type { MembershipCheckResult } from '@packages/lib/zao/respectGate';
import { checkZaoMembership } from '@packages/lib/zao/respectGate';
import type { ZaoAccess } from '@packages/lib/zao/zaoTokenGates';
import { evaluateZaoAccess } from '@packages/lib/zao/zaoTokenGates';
import { InvalidInputError } from '@packages/utils/errors';
import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>({ onError, onNoMatch });

handler.get(getMembership);

export type ZaoMembershipResponse = MembershipCheckResult & { access: ZaoAccess };

// GET /api/zao/membership?address=0x... -> ZaoMembershipResponse
//
// Two reads, two jobs (ZAOOS research governance/2657, Key Decision 2):
// - `access` is CharmVerse's own token gate evaluation of the ZAO gates defined in
//   @packages/config/zao (Respect holder, Hats roles). It decides membership and roles.
// - `results` and `governanceWeight` are the raw OG and ZOR balances in whole Respect,
//   for display and for vote weight (grill 2026-10-10 item 78: OG + ZOR summed).
// On an RPC failure both report UNKNOWN (null); nothing here ever reports a fake zero.
async function getMembership(req: NextApiRequest, res: NextApiResponse<ZaoMembershipResponse | { error: string }>) {
  const address = req.query.address as string | undefined;

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new InvalidInputError('A valid 0x wallet address is required');
  }

  const [balances, access] = await Promise.all([checkZaoMembership(address), evaluateZaoAccess(address)]);
  const body: ZaoMembershipResponse = { ...balances, member: access.member, access };

  if (balances.status === 'error' && access.member === null) {
    return res.status(503).json(body);
  }
  res.status(200).json(body);
}

export default withSessionRoute(handler);
