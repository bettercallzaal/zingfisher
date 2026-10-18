import type { Prisma } from '@charmverse/core/prisma-client';

import { ZAAL_ADDRESS } from '../zid';
import type { RawQueryClient, ZaoMemberRow } from '../zidStore';
import {
  createDbZidStore,
  HandleTakenError,
  isHandleConflict,
  memoryZidStore,
  rowToStoredFields,
  zidStoreKind
} from '../zidStore';

const GOALS = 'I make ambient records and want to release them with The ZAO.';

function addr(ch: string) {
  return `0x${ch.repeat(40)}`;
}

describe('zidStoreKind (the ZAO_ZID_STORE switch)', () => {
  it('uses the database only for the exact value "db"', () => {
    expect(zidStoreKind({ ZAO_ZID_STORE: 'db' })).toBe('db');
  });

  it('RED CONTROL: anything else keeps the in-memory map', () => {
    expect(zidStoreKind({})).toBe('memory');
    expect(zidStoreKind({ ZAO_ZID_STORE: 'DB' })).toBe('memory');
    expect(zidStoreKind({ ZAO_ZID_STORE: 'true' })).toBe('memory');
  });
});

describe('memoryZidStore', () => {
  it('claims 501+, returns the same profile on a second claim, and finds it by wallet and ZID', async () => {
    const first = await memoryZidStore.create({
      address: addr('d'),
      displayName: 'D',
      handle: 'dee',
      goalsAndVision: GOALS
    });
    const again = await memoryZidStore.create({
      address: addr('d'),
      displayName: 'Other',
      handle: 'other',
      goalsAndVision: GOALS
    });

    expect(first.zid).toBeGreaterThanOrEqual(501);
    expect(again.zid).toBe(first.zid);
    expect((await memoryZidStore.getByZid(first.zid as number))?.address).toBe(addr('d'));
    expect((await memoryZidStore.getByAddress(addr('d').toUpperCase().replace('0X', '0x')))?.zid).toBe(first.zid);
    expect((await memoryZidStore.listByAddresses([addr('d'), addr('9')])).map((p) => p.address)).toEqual([addr('d')]);
  });

  it('RED CONTROL: refuses a handle another wallet holds, ignoring case', async () => {
    await memoryZidStore.create({ address: addr('e'), displayName: 'E', handle: 'echo', goalsAndVision: GOALS });
    await expect(
      memoryZidStore.create({ address: addr('f'), displayName: 'F', handle: 'ECHO', goalsAndVision: GOALS })
    ).rejects.toBeInstanceOf(HandleTakenError);
  });
});

describe('memoryZidStore.update', () => {
  it('edits the intro and keeps the handle and ZID; a wallet with no profile gets null', async () => {
    const claimed = await memoryZidStore.create({
      address: addr('5'),
      displayName: 'V',
      handle: 'vee5',
      goalsAndVision: GOALS
    });
    const edited = await memoryZidStore.update(addr('5'), { bio: 'new intro', handle: 'other' } as never);

    expect(edited).toMatchObject({ zid: claimed.zid, handle: 'vee5', bio: 'new intro' });
    expect((await memoryZidStore.getByZid(claimed.zid as number))?.bio).toBe('new intro');
    expect(await memoryZidStore.update(addr('6'), { bio: 'x' })).toBeNull();
  });
});

describe('memoryZidStore.listPage', () => {
  it('returns profiles above the cursor, lowest ZID first, up to the limit', async () => {
    const a = await memoryZidStore.create({
      address: addr('3'),
      displayName: 'T',
      handle: 'tee3',
      goalsAndVision: GOALS
    });
    const b = await memoryZidStore.create({
      address: addr('4'),
      displayName: 'U',
      handle: 'you4',
      goalsAndVision: GOALS
    });

    const all = await memoryZidStore.listPage(0, 1000);
    const zids = all.map((p) => p.zid as number);
    expect(zids).toEqual([...zids].sort((x, y) => x - y));
    expect(zids).toContain(a.zid);

    const afterA = await memoryZidStore.listPage(a.zid as number, 1);
    expect(afterA.map((p) => p.zid)).toEqual([b.zid]);
  });
});

describe('rowToStoredFields', () => {
  const row: ZaoMemberRow = {
    address: addr('a'),
    zid: 502,
    handle: 'ay',
    display_name: 'Ay',
    intro: 'hello',
    goals_and_vision: GOALS,
    farcaster: null,
    discord: 'ay#1',
    voucher_address: null,
    voucher_name: null,
    voucher_status: 'verified',
    created_at: new Date('2026-10-17T12:00:00Z')
  };

  it('maps columns to profile fields, intro to bio, nulls to undefined', () => {
    const f = rowToStoredFields(row);
    expect(f).toMatchObject({ zid: 502, bio: 'hello', discord: 'ay#1', voucherStatus: 'verified' });
    expect(f.farcaster).toBeUndefined();
    expect(f.joinedAt).toBe('2026-10-17T12:00:00.000Z');
  });

  it('reads a voucher status it does not know as pending_vouch', () => {
    expect(rowToStoredFields({ ...row, voucher_status: 'made_up' }).voucherStatus).toBe('pending_vouch');
  });
});

/** A fake client that records each query and answers from a queue. */
function fakeClient(answers: unknown[]) {
  const queries: Prisma.Sql[] = [];
  const client: RawQueryClient = {
    async $queryRaw<T>(query: Prisma.Sql) {
      queries.push(query);
      const next = answers.shift();
      if (next instanceof Error) {
        throw next;
      }
      return (next ?? []) as T;
    }
  };
  return { client, queries };
}

const savedRow = (address: string, zid: number, handle: string): ZaoMemberRow => ({
  address,
  zid,
  handle,
  display_name: handle,
  intro: '',
  goals_and_vision: GOALS,
  farcaster: null,
  discord: null,
  voucher_address: null,
  voucher_name: null,
  voucher_status: 'pending_vouch',
  created_at: '2026-10-17T12:00:00Z'
});

describe('createDbZidStore', () => {
  it('sends member text only as bound parameters, never inside the SQL text', async () => {
    const hostile = "x'); drop table zingfisher.zao_member; --";
    const { client, queries } = fakeClient([[], [], undefined, [savedRow(addr('b'), 501, 'bee')]]);
    await createDbZidStore(client).create({
      address: addr('b'),
      displayName: hostile,
      handle: 'bee',
      goalsAndVision: GOALS,
      userId: '00000000-0000-0000-0000-000000000001'
    });

    const insert = queries[2];
    expect(insert.sql).toContain('insert into zingfisher.zao_member');
    expect(insert.sql).not.toContain('drop table');
    expect(insert.values).toContain(hostile);
    expect(insert.sql).toContain("nextval('zingfisher.zao_member_zid_seq')");
  });

  it('gives Zaal ZID 1 without drawing from the sequence', async () => {
    const { client, queries } = fakeClient([[], [], undefined, [savedRow(ZAAL_ADDRESS, 1, 'zaal')]]);
    const p = await createDbZidStore(client).create({
      address: ZAAL_ADDRESS,
      displayName: 'Zaal',
      handle: 'zaal',
      goalsAndVision: GOALS
    });
    expect(p.formattedZid).toBe('ZID-001');
    expect(queries[2].sql).not.toContain('nextval');
  });

  it('returns the existing profile on a second claim, with no insert', async () => {
    const { client, queries } = fakeClient([[savedRow(addr('c'), 503, 'cee')]]);
    const p = await createDbZidStore(client).create({
      address: addr('c'),
      displayName: 'C',
      handle: 'new',
      goalsAndVision: GOALS
    });
    expect(p.zid).toBe(503);
    expect(queries).toHaveLength(1);
  });

  it('RED CONTROL: a taken handle throws HandleTakenError before any insert', async () => {
    const { client, queries } = fakeClient([[], [{ n: 1 }]]);
    await expect(
      createDbZidStore(client).create({ address: addr('c'), displayName: 'C', handle: 'cee', goalsAndVision: GOALS })
    ).rejects.toBeInstanceOf(HandleTakenError);
    expect(queries.some((q) => q.sql.includes('insert'))).toBe(false);
  });

  it('maps a lost race on the handle index to HandleTakenError', async () => {
    const race = new Error('duplicate key value violates unique constraint "zao_member_handle_lower"');
    const { client } = fakeClient([[], [], race]);
    await expect(
      createDbZidStore(client).create({ address: addr('c'), displayName: 'C', handle: 'cee', goalsAndVision: GOALS })
    ).rejects.toBeInstanceOf(HandleTakenError);
  });

  it('rejects invalid goals before touching the handle or the table', async () => {
    const { client, queries } = fakeClient([[]]);
    await expect(
      createDbZidStore(client).create({ address: addr('c'), displayName: 'C', handle: 'cee', goalsAndVision: 'short' })
    ).rejects.toThrow(/at least 15 characters/);
    expect(queries).toHaveLength(1);
  });

  it('maps the real Prisma raw-query shape (P2010, meta.code 23505, no index name) to HandleTakenError', async () => {
    // Shape reported by the evaluator for three concurrent claims of Racer/racer/RACER.
    const p2010 = Object.assign(new Error('Raw query failed. Code: `23505`. Message: `db error`'), {
      code: 'P2010',
      meta: { code: '23505', message: 'db error' }
    });
    expect(isHandleConflict(p2010)).toBe(true);
    const { client } = fakeClient([[], [], p2010]);
    await expect(
      createDbZidStore(client).create({ address: addr('c'), displayName: 'C', handle: 'RACER', goalsAndVision: GOALS })
    ).rejects.toBeInstanceOf(HandleTakenError);
  });

  it('RED CONTROL: a 23505 naming another constraint, or another error code, is not a handle conflict', () => {
    const zidClash = Object.assign(new Error('duplicate key value violates unique constraint "zao_member_zid_key"'), {
      code: 'P2010',
      meta: { code: '23505' }
    });
    expect(isHandleConflict(zidClash)).toBe(false);
    expect(isHandleConflict(Object.assign(new Error('x'), { code: 'P2010', meta: { code: '23503' } }))).toBe(false);
  });

  it('edits with bound values, refreshes user_id from the session, and never writes handle or ZID', async () => {
    const hostile = "x'); drop table zingfisher.zao_member; --";
    const before = savedRow(addr('7'), 507, 'sev');
    const after = { ...before, intro: hostile };
    const { client, queries } = fakeClient([[before], [after]]);
    const edited = await createDbZidStore(client).update(
      addr('7'),
      { bio: hostile },
      '00000000-0000-0000-0000-000000000002'
    );

    expect(edited?.bio).toBe(hostile);
    const update = queries[1];
    expect(update.sql).toContain('update zingfisher.zao_member');
    expect(update.sql).not.toContain('drop table');
    expect(update.sql).not.toMatch(/\bhandle\s*=|\bzid\s*=/);
    expect(update.sql).toContain('::uuid');
    expect(update.values).toContain(hostile);
    expect(update.values).toContain('00000000-0000-0000-0000-000000000002');
  });

  it('RED CONTROL: no row means null and no update; bad goals throw before any update', async () => {
    const none = fakeClient([[]]);
    expect(await createDbZidStore(none.client).update(addr('8'), { bio: 'x' })).toBeNull();
    expect(none.queries).toHaveLength(1);

    const bad = fakeClient([[savedRow(addr('9'), 509, 'nine')]]);
    await expect(createDbZidStore(bad.client).update(addr('9'), { goalsAndVision: 'short' })).rejects.toThrow();
    expect(bad.queries).toHaveLength(1);
  });

  it('lists a page by ZID with the cursor and limit as bound values', async () => {
    const { client, queries } = fakeClient([[savedRow(addr('1'), 502, 'one'), savedRow(addr('2'), 503, 'two')]]);
    const page = await createDbZidStore(client).listPage(501, 51);

    expect(page.map((p) => p.zid)).toEqual([502, 503]);
    expect(queries[0].sql).toContain('order by zid');
    expect(queries[0].sql).not.toContain('501');
    expect(queries[0].values).toEqual([501, 51]);
  });

  it('isHandleConflict ignores other errors', () => {
    expect(isHandleConflict(new Error('connection refused'))).toBe(false);
  });
});
