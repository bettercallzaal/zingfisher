-- zingfisher member profile store: ZIDs and intros. Spec: research/007-member-profile-store.
--
-- Run once, by Zaal, in the Supabase SQL editor of the zingfisher project, as the editor's
-- postgres login, AFTER the setup steps that create the zingfisher schema and the
-- zingfisher_app role (step A2) and run the CharmVerse migrations (step B2).
-- Then set ZAO_ZID_STORE=db for the app. Without that switch the app keeps the in-memory map.
--
-- Undo (deletes every claimed ZID):
--   drop table zingfisher.zao_member; drop sequence zingfisher.zao_member_zid_seq;

create sequence zingfisher.zao_member_zid_seq start 501;

create table zingfisher.zao_member (
  address          text primary key check (address ~ '^0x[a-f0-9]{40}$'),
  zid              integer not null unique check (zid >= 1),
  user_id          uuid,
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

create policy zao_member_app_select on zingfisher.zao_member
  for select to zingfisher_app using (true);
create policy zao_member_app_insert on zingfisher.zao_member
  for insert to zingfisher_app with check (true);
create policy zao_member_app_update on zingfisher.zao_member
  for update to zingfisher_app using (true) with check (true);

grant select, insert, update on zingfisher.zao_member to zingfisher_app;
grant usage on sequence zingfisher.zao_member_zid_seq to zingfisher_app;
