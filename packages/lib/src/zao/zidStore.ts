/**
 * Where ZID profiles live. Spec: research/007-member-profile-store.
 *
 * - memoryZidStore: the module-level map in zid.ts. Lost between Vercel requests; used by tests
 *   and whenever ZAO_ZID_STORE is not "db".
 * - createDbZidStore: the zingfisher.zao_member table, created by
 *   apps/webapp/lib/zao/sql/001_zao_member.sql. Every value goes in as a bound parameter.
 *
 * Only what the member typed in, plus wallet and ZID, is stored. Balances are read live by the route.
 * user_id is informational: nothing authorises from it (writes re-check the session's wallets), so a
 * stale value after a CharmVerse user is removed changes nothing a visitor can do.
 */
import { prisma, Prisma } from '@charmverse/core/prisma-client';

import type { NewZidInput, StoredZidFields, VoucherStatus, ZidProfile, ZidProfileEdit } from './zid';
import {
  applyZidEdit,
  assertValidNewZidInput,
  assignNextZid,
  buildZidProfile,
  getZidProfile,
  isHandleTakenInMemory,
  listZidProfiles,
  toStoredZidFields,
  updateZidProfileInMemory,
  ZAAL_ADDRESS
} from './zid';

export class HandleTakenError extends Error {
  constructor() {
    super('That handle is taken');
    this.name = 'HandleTakenError';
  }
}

export interface ZidStore {
  getByAddress(address: string): Promise<ZidProfile | null>;
  getByZid(zid: number): Promise<ZidProfile | null>;
  listByAddresses(addresses: readonly string[]): Promise<ZidProfile[]>;
  /** Up to `limit` profiles with a ZID above `afterZid`, lowest ZID first. */
  listPage(afterZid: number, limit: number): Promise<ZidProfile[]>;
  /** Claims a ZID for the wallet, or returns the wallet's existing profile. Throws HandleTakenError. */
  create(input: NewZidInput & { userId?: string }): Promise<ZidProfile>;
  /** Edits the wallet's profile; null when it has none. Throws on invalid goals or display name. */
  update(address: string, edit: ZidProfileEdit, userId?: string): Promise<ZidProfile | null>;
}

export const memoryZidStore: ZidStore = {
  async getByAddress(address) {
    return getZidProfile(address.trim().toLowerCase());
  },
  async getByZid(zid) {
    return getZidProfile(zid);
  },
  async listByAddresses(addresses) {
    const wanted = new Set(addresses.map((a) => a.trim().toLowerCase()));
    return listZidProfiles().filter((p) => wanted.has(p.address));
  },
  async listPage(afterZid, limit) {
    return listZidProfiles()
      .filter((p) => p.zid !== null && p.zid > afterZid)
      .sort((a, b) => (a.zid as number) - (b.zid as number))
      .slice(0, limit);
  },
  async create(input) {
    const existing = getZidProfile(input.address.trim().toLowerCase());
    if (existing) {
      return existing;
    }
    if (isHandleTakenInMemory(input.handle, input.address)) {
      throw new HandleTakenError();
    }
    return assignNextZid(input);
  },
  async update(address, edit) {
    return updateZidProfileInMemory(address, edit);
  }
};

/** A row of zingfisher.zao_member as selected below. */
export interface ZaoMemberRow {
  address: string;
  zid: number;
  handle: string;
  display_name: string;
  intro: string;
  goals_and_vision: string;
  farcaster: string | null;
  discord: string | null;
  voucher_address: string | null;
  voucher_name: string | null;
  voucher_status: string;
  created_at: Date | string;
}

const VOUCHER_STATUSES: readonly VoucherStatus[] = [
  'verified',
  'pending_vouch',
  'solo_circle',
  'pre_73_attendance',
  'unrecorded'
];

/** Pure: maps a database row to the stored fields. An unknown voucher status reads as pending_vouch. */
export function rowToStoredFields(row: ZaoMemberRow): StoredZidFields {
  const voucherStatus = VOUCHER_STATUSES.find((s) => s === row.voucher_status) ?? 'pending_vouch';
  return {
    zid: row.zid,
    address: row.address,
    displayName: row.display_name,
    handle: row.handle,
    bio: row.intro,
    goalsAndVision: row.goals_and_vision,
    voucherStatus,
    voucherAddress: row.voucher_address ?? undefined,
    voucherName: row.voucher_name ?? undefined,
    farcaster: row.farcaster ?? undefined,
    discord: row.discord ?? undefined,
    joinedAt: new Date(row.created_at).toISOString()
  };
}

/** The part of a Prisma client this store uses, so tests can pass a fake. */
export interface RawQueryClient {
  $queryRaw<T = unknown>(query: Prisma.Sql): Promise<T>;
}

const COLUMNS = Prisma.sql`address, zid, handle, display_name, intro, goals_and_vision, farcaster, discord,
  voucher_address, voucher_name, voucher_status, created_at`;

/**
 * True when a database error from the claim insert is the unique index on lower(handle).
 * Prisma raw queries report a unique violation as P2010 with meta.code "23505" and, in practice,
 * no index name. In that insert the address conflict is absorbed by "on conflict do nothing" and
 * new ZIDs come from the sequence, so a 23505 that names no other constraint is the handle index.
 */
export function isHandleConflict(err: unknown): boolean {
  const e = err as { message?: string; code?: string; meta?: { code?: string } } | null;
  const text = `${e?.message ?? ''} ${JSON.stringify(e?.meta ?? '')}`;
  if (text.includes('zao_member_handle_lower')) {
    return true;
  }
  const uniqueViolation = e?.meta?.code === '23505' || e?.code === '23505';
  const namesOtherConstraint = text.includes('zao_member_pkey') || text.includes('zao_member_zid_key');
  return uniqueViolation && !namesOtherConstraint;
}

export function createDbZidStore(client: RawQueryClient): ZidStore {
  async function selectOne(where: Prisma.Sql): Promise<ZidProfile | null> {
    const rows = await client.$queryRaw<ZaoMemberRow[]>(
      Prisma.sql`select ${COLUMNS} from zingfisher.zao_member where ${where} limit 1`
    );
    return rows[0] ? buildZidProfile(rowToStoredFields(rows[0])) : null;
  }

  return {
    getByAddress(address) {
      return selectOne(Prisma.sql`address = ${address.trim().toLowerCase()}`);
    },
    getByZid(zid) {
      return selectOne(Prisma.sql`zid = ${zid}`);
    },
    async listByAddresses(addresses) {
      const wanted = addresses.map((a) => a.trim().toLowerCase());
      if (wanted.length === 0) {
        return [];
      }
      const rows = await client.$queryRaw<ZaoMemberRow[]>(
        Prisma.sql`select ${COLUMNS} from zingfisher.zao_member where address in (${Prisma.join(wanted)}) order by zid`
      );
      return rows.map((r) => buildZidProfile(rowToStoredFields(r)));
    },
    async listPage(afterZid, limit) {
      const rows = await client.$queryRaw<ZaoMemberRow[]>(
        Prisma.sql`select ${COLUMNS} from zingfisher.zao_member where zid > ${afterZid} order by zid limit ${limit}`
      );
      return rows.map((r) => buildZidProfile(rowToStoredFields(r)));
    },
    async create(input) {
      const address = input.address.trim().toLowerCase();
      const existing = await selectOne(Prisma.sql`address = ${address}`);
      if (existing) {
        return existing;
      }
      assertValidNewZidInput(input);
      const f = toStoredZidFields(input, null, new Date().toISOString());

      const taken = await client.$queryRaw<{ n: number }[]>(
        Prisma.sql`select 1 as n from zingfisher.zao_member where lower(handle) = lower(${f.handle}) limit 1`
      );
      if (taken.length > 0) {
        throw new HandleTakenError();
      }

      // Zaal is ZID 1 (grill 2026-09-22 afternoon item 19); everyone else draws from the sequence (501+).
      const zid =
        address === ZAAL_ADDRESS.toLowerCase() ? Prisma.sql`1` : Prisma.sql`nextval('zingfisher.zao_member_zid_seq')`;
      const userId = input.userId ? Prisma.sql`${input.userId}::uuid` : Prisma.sql`null`;

      try {
        await client.$queryRaw(
          Prisma.sql`insert into zingfisher.zao_member
            (address, zid, user_id, handle, display_name, intro, goals_and_vision, farcaster, discord,
             voucher_address, voucher_name, voucher_status)
          values (${address}, ${zid}, ${userId}, ${f.handle}, ${f.displayName}, ${f.bio}, ${f.goalsAndVision},
            ${f.farcaster ?? null}, ${f.discord ?? null}, ${f.voucherAddress ?? null}, ${f.voucherName ?? null},
            ${f.voucherStatus})
          on conflict (address) do nothing`
        );
      } catch (err) {
        // Two claims racing for one handle: the unique index decides.
        if (isHandleConflict(err)) {
          throw new HandleTakenError();
        }
        throw err;
      }

      // Either our row, or the row a concurrent claim from the same wallet wrote first.
      const saved = await selectOne(Prisma.sql`address = ${address}`);
      if (!saved) {
        throw new Error('ZID claim was not saved');
      }
      return saved;
    },
    async update(rawAddress, edit, userId) {
      const address = rawAddress.trim().toLowerCase();
      const rows = await client.$queryRaw<ZaoMemberRow[]>(
        Prisma.sql`select ${COLUMNS} from zingfisher.zao_member where address = ${address} limit 1`
      );
      if (!rows[0]) {
        return null;
      }
      const f = applyZidEdit(rowToStoredFields(rows[0]), edit);
      // An edit also refreshes user_id from the session, so a stale id is replaced on the next write.
      const user = userId ? Prisma.sql`${userId}::uuid` : Prisma.sql`user_id`;
      const updated = await client.$queryRaw<ZaoMemberRow[]>(
        Prisma.sql`update zingfisher.zao_member
          set display_name = ${f.displayName}, intro = ${f.bio}, goals_and_vision = ${f.goalsAndVision},
            farcaster = ${f.farcaster ?? null}, discord = ${f.discord ?? null}, user_id = ${user}, updated_at = now()
          where address = ${address}
          returning ${COLUMNS}`
      );
      return updated[0] ? buildZidProfile(rowToStoredFields(updated[0])) : null;
    }
  };
}

/** Server-side switch: ZAO_ZID_STORE=db uses the database; anything else keeps the in-memory map. */
export function zidStoreKind(env: Record<string, string | undefined> = process.env): 'db' | 'memory' {
  return env.ZAO_ZID_STORE === 'db' ? 'db' : 'memory';
}

let dbStore: ZidStore | null = null;

export function getZidStore(): ZidStore {
  if (zidStoreKind() === 'memory') {
    return memoryZidStore;
  }
  dbStore ??= createDbZidStore(prisma);
  return dbStore;
}
