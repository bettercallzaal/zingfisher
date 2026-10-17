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

  it('isHandleConflict ignores other errors', () => {
    expect(isHandleConflict(new Error('connection refused'))).toBe(false);
  });
});
