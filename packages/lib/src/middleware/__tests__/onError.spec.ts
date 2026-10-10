import { InvalidInputError } from '@packages/utils/errors';
import type { NextApiRequest, NextApiResponse } from 'next';

import { onError } from '../onError';

function mockRes() {
  const res: any = { statusCode: 0, body: undefined };
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload: unknown) => {
    res.body = payload;
    return res;
  };
  return res as NextApiResponse & { statusCode: number; body: any };
}

const req = { url: '/api/zao/zid', query: {}, body: {}, session: undefined } as unknown as NextApiRequest;

describe('onError', () => {
  it('RED CONTROL: an unknown error never sends its stack or raw message to the client', () => {
    const err = new Error('postgres://user:secret@db.internal:5432 refused the connection');
    const res = mockRes();
    onError(err, req, res);
    const serialized = JSON.stringify(res.body);
    expect(res.statusCode).toBe(500);
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('refused the connection');
    expect(serialized).not.toMatch(/\n\s+at /);
    expect(serialized).not.toContain('onError.spec');
    expect(res.body.message).toBe('Something went wrong!');
  });

  it('a SystemError keeps its own message and code, still without a stack', () => {
    const res = mockRes();
    onError(new InvalidInputError('A valid 0x wallet address is required'), req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('A valid 0x wallet address is required');
    expect(JSON.stringify(res.body)).not.toMatch(/\n\s+at /);
  });
});
