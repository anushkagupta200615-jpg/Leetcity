-- LeetCity shared-world backend schema.
-- Run this in your Supabase project's SQL Editor (SQL → New query → Run).

create table if not exists profiles (
  username    text primary key,
  easy        int  default 0,
  medium      int  default 0,
  hard        int  default 0,
  total       int  default 0,
  rating      int  default 0,
  ranking     int  default 0,
  acceptance  real default 0,
  recent      int  default 1,
  top_topics  text default '',
  updated_at  timestamptz default now()
);

-- Fast leaderboard ordering.
create index if not exists profiles_total_idx on profiles (total desc);

-- Row-level security: profiles are public LeetCode data, so allow anyone to
-- read, and to add/update a profile (the app only writes public stats).
alter table profiles enable row level security;

drop policy if exists "public read"   on profiles;
drop policy if exists "public insert" on profiles;
drop policy if exists "public update" on profiles;

create policy "public read"   on profiles for select using (true);
create policy "public insert" on profiles for insert with check (true);
create policy "public update" on profiles for update using (true) with check (true);

-- NOTE: writes are open for this MVP because the data is public and low-risk.
-- To harden later, move writes behind a Supabase Edge Function that validates
-- the stats against LeetCode before inserting, and make the table read-only
-- to the anon key.
