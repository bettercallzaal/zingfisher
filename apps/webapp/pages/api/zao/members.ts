import { onError, onNoMatch } from '@packages/lib/middleware';
import { withSessionRoute } from '@packages/lib/session/withSession';
import type { MemberListPage } from '@packages/lib/zao/memberList';
import { MEMBERS_PAGE_SIZE, parseAfterZid, toMemberListPage } from '@packages/lib/zao/memberList';
import { getZidStore } from '@packages/lib/zao/zidStore';
import { InvalidInputError } from '@packages/utils/errors';
import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';

const handler = nc<NextApiRequest, NextApiResponse>({ onError, onNoMatch });

handler.get(listMembers);

// GET /api/zao/members?after=<zid>
//   Public: ZID, handle, display name and intro, 50 per page, lowest ZID first. Every field is
//   already public on each member page. No balances are read here; the member page does that.
async function listMembers(req: NextApiRequest, res: NextApiResponse<MemberListPage>) {
  const afterZid = parseAfterZid(req.query.after);
  if (afterZid === null) {
    throw new InvalidInputError('after must be a ZID, a whole number');
  }
  const profiles = await getZidStore().listPage(afterZid, MEMBERS_PAGE_SIZE + 1);
  return res.status(200).json(toMemberListPage(profiles));
}

export default withSessionRoute(handler);
