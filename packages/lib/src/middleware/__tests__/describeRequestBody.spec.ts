import { log } from '@packages/core/log';
import { InvalidInputError } from '@packages/utils/errors';
import type { NextApiRequest, NextApiResponse } from 'next';

import { describeRequestBody } from '../describeRequestBody';
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
  return res as NextApiResponse;
}

describe('describeRequestBody', () => {
  it('reports shape only: byte length and key names, sensitive names redacted', () => {
    const summary = describeRequestBody({ email: 'a@b.c', password: 'hunter2', otpCode: '123456', pageId: 'p1' });
    expect(summary.keys).toEqual(['email', 'redacted', 'redacted', 'pageId']);
    expect(summary.bytes).toBeGreaterThan(0);
    expect(JSON.stringify(summary)).not.toContain('hunter2');
    expect(JSON.stringify(summary)).not.toContain('123456');
  });

  it('handles absent, string and array bodies without throwing', () => {
    expect(describeRequestBody(undefined)).toEqual({ bytes: 0, keys: [] });
    expect(describeRequestBody('raw text').keys).toEqual([]);
    expect(describeRequestBody([1, 2, 3]).keys).toEqual([]);
  });
});

describe('onError logging', () => {
  const req = {
    url: '/api/profile',
    method: 'POST',
    query: {},
    body: { email: 'a@b.c', password: 'hunter2', signature: '0xdeadbeef' },
    session: undefined
  } as unknown as NextApiRequest;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('RED CONTROL: a body with a password field never reaches the logger, on a 500 or a 400', () => {
    const errorSpy = vi.spyOn(log, 'error').mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => undefined);

    onError(new Error('boom'), req, mockRes());
    onError(new InvalidInputError('bad input'), req, mockRes());

    const logged = JSON.stringify([...errorSpy.mock.calls, ...warnSpy.mock.calls]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(logged).not.toContain('hunter2');
    expect(logged).not.toContain('0xdeadbeef');
    expect(logged).not.toContain('"password"');
    expect(logged).toContain('"method":"POST"');
    expect(logged).toContain('"status":500');
    expect(logged).toContain('"status":400');
    expect(logged).toContain('"keys":["email","redacted","redacted"]');
  });
});
