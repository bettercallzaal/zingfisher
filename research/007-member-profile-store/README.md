---
topic: infrastructure
type: spec
status: proposed
last-validated: 2026-10-16
related-docs: [005, 006]
original-query: "make a place on zingfisher where everything is stored - member profile data, intros first; move ZID storage out of the in-memory map into the database (reconstructed)"
tier: STANDARD
---

# 007 - Member profile store (ZIDs and intros in Postgres)

> **Goal:** One table in the `zingfisher` Postgres schema that holds every member's ZID and
> their public profile, so a claimed ZID survives a redeploy and other ZAO tools can read
> member intros from one place. Zaal ruled on 2026-10-14 that zingfisher is that place,
> intros first.

## Recommendations

| Decision | Recommendation | Why |
|---|---|---|
| Where | One table, `zingfisher.zao_member`, in the existing zingfisher schema | ZID and profile are one record keyed by one wallet; two tables would need a join for every page view |
| How it gets created | A SQL file in this repo that Zaal runs in the Supabase SQL editor | The Prisma schema ships inside the `@charmverse/core` npm package, so this repo cannot add a model to it without forking that package |
| How the app reads it | `prisma.$queryRaw` tagged templates, which send every value as a bound parameter | No string-built SQL; keeps the existing Prisma client and connection |
| ZID numbering | A Postgres sequence starting at 501; Zaal's wallet inserted as ZID 1; 2 to 500 never assigned by the app | Matches `packages/lib/src/zao/zid.ts` today; the sequence makes two joiners at the same moment get different numbers |
| What is stored | Only what the member types into the join form, plus the wallet and ZID | No balances, no email, no real name |
| Switch | `ZAO_ZID_STORE=db` turns the table on; without it the in-memory map stays | Production keeps working before the table exists |

## The problem today

`packages/lib/src/zao/zid.ts` keeps profiles in `const runtimeProfiles = new Map()` and the
next number in `let nextMemberZidSequence = 501`. On Vercel each request can land on a fresh
function instance, so a claimed ZID can vanish on the next request, and two instances can
hand out the same number. The four callers are `apps/webapp/pages/api/zao/zid.ts`,
`apps/webapp/pages/member/join.tsx`, `apps/webapp/components/zao/MemberProfileView.tsx` and
`apps/webapp/charmClient/hooks/zao.ts`.

## The table

```sql
create sequence zingfisher.zao_member_zid_seq start 501;

create table zingfisher.zao_member (
  address          text primary key check (address ~ '^0x[a-f0-9]{40}$'),
  zid              integer not null unique check (zid >= 1),
  user_id          uuid references zingfisher."User"(id) on delete set null,
  handle           text not null check (handle ~ '^[a-zA-Z0-9_.-]{2,32}$'),
  display_name     text not null check (char_length(display_name) between 1 and 80),
  intro            text not null default '' check (char_length(intro) <= 1000),
  goals_and_vision text not null check (char_length(goals_and_vision) between 15 and 2000),
  farcaster        text check (char_length(farcaster) <= 64),
  discord          text check (char_length(discord) <= 64),
  voucher_address  text check (voucher_address ~ '^0x[a-f0-9]{40}$'),
  voucher_name     text check (char_length(voucher_name) <= 80),
  voucher_status   text not null default 'pending_vouch'
                   check (voucher_status in ('verified','pending_vouch','solo_circle','pre_73_attendance','unrecorded')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index zao_member_handle_lower on zingfisher.zao_member (lower(handle));
alter table zingfisher.zao_member enable row level security;
grant select, insert, update on zingfisher.zao_member to zingfisher_app;
grant usage on sequence zingfisher.zao_member_zid_seq to zingfisher_app;
```

Notes on the columns:
- `address` is the key, lowercase. It is the wallet the member signed in with, and the API
  already refuses a claim for any wallet not linked to the session (`isOwnedAddress`).
- `user_id` links to the CharmVerse user created at sign-in. It is set on claim and never
  shown publicly.
- `intro` is the existing `bio` field renamed in storage; the API keeps the name `bio` so the
  page code does not change.
- The checks repeat the API's own limits (`createProfileSchema` in the route), so a bug in
  the app cannot write a row the API would have refused.
- Row level security is on with no policies. The Supabase `anon` and `authenticated` roles
  therefore read nothing from this table through the Supabase API. The app connects as
  `zingfisher_app`, which is granted access directly.

## Not stored, on purpose

- OG and ZOR balances, governance weight and permissions: read live from Optimism on every
  request, as now. A failed read stays UNKNOWN, never zero.
- Hats and fractal history: other systems own them.
- Email, real name, location, or anything the member did not type into the join form.

## How a claim works

1. The signed-in member posts the join form to `POST /api/zao/zid` (unchanged).
2. The route validates as now, then calls `store.create(...)`.
3. The store inserts in one statement. ZID is `1` for Zaal's address, otherwise
   `nextval('zingfisher.zao_member_zid_seq')`. `on conflict (address) do nothing`, then a
   select, so a second claim from the same wallet returns the first profile, as the map does.
4. A handle already taken (case-insensitive) returns a 409 with "That handle is taken".

A failed insert can use up a sequence number, so ZIDs can have gaps (501, 502, 504). The
number is an identity, not a count, so gaps are harmless; this spec accepts them.

## Code shape for the build PR

- `packages/lib/src/zao/zid.ts` keeps its pure functions (format, parse, validate, classify,
  permissions). The `Map` and the counter move out.
- New `packages/lib/src/zao/zidStore.ts`: an interface with `getByAddress`, `getByZid`,
  `listByAddresses` and `create`; a `memoryZidStore` (today's behaviour, used by tests and
  when the switch is off); a `dbZidStore` using `$queryRaw`.
- `ZAO_ZID_STORE=db` picks the database store, server-side only.
- New SQL file `apps/webapp/lib/zao/sql/001_zao_member.sql`: the block above, plus an undo
  line (`drop table zingfisher.zao_member; drop sequence zingfisher.zao_member_zid_seq;`).
- Tests: the memory store against the same spec the database store must pass; the database
  store is checked by Zaal on a Preview after he runs the SQL file.

## How other ZAO tools read profiles

The fractal tooling needs member intros. The build PR adds nothing new for it by default:
it reads one profile at a time from `GET /api/zao/zid?identifier=<wallet or ZID>`, which is
already public, like the member page. A list of every member is open question 1.

## Open questions for Zaal

1. A public list of members (ZID, handle, display name, intro; 50 per page) for the fractal
   tooling. A (recommended): yes, at `GET /api/zao/members`, since every field in it is
   already public on each member page. B: no list; tools look members up one at a time.
   C: a separate read-only database login for the fractal tooling only.
2. Editing after the claim. A (recommended): a member can edit their own display name,
   intro, goals and socials; ZID, wallet and handle stay fixed. B: handle editable too.
   C: nothing editable until a later spec.
3. ZIDs 2 to 500 stay reserved and unassigned until Zaal rules on who gets them. No change
   proposed here.

## Next actions

| Action | Who | Depends on |
|---|---|---|
| Postgres walk-through steps A0 to B3 (schema, role, migrations) | Zaal, with the zao-core lane | nothing |
| Build PR: `zidStore.ts`, SQL file, route switched to the store, tests | zao-core lane | this spec merged |
| Run `001_zao_member.sql` in the SQL editor | Zaal | the Postgres walk-through |
| Set `ZAO_ZID_STORE=db` on a Preview and claim a ZID | Zaal | the two rows above |
| Members list endpoint | zao-core lane | open question 1 |
