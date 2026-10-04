-- Plink schema. All private tables use RLS: users only see their own rows.
create extension if not exists "pgcrypto";

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  age_range text, sex text, height_cm numeric, weight_kg numeric,
  activity_level text check (activity_level in ('low','moderate','high','very_high')),
  climate text check (climate in ('cool','mild','warm','hot')),
  exercise_days_per_week smallint, caffeine_cups_per_day smallint,
  wake_time time, bed_time time, unit_system text default 'metric' check (unit_system in ('metric','imperial')),
  timezone text, character_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table hydration_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  baseline_ml int not null, goal_ml int not null, adjustments jsonb not null default '[]',
  effective_from date not null default current_date, created_at timestamptz not null default now()
);
create index on hydration_goals (user_id, effective_from desc);

create table drink_types (            -- system rows have user_id null
  id text primary key, user_id uuid references auth.users(id) on delete cascade,
  name text not null, icon text not null, hydration_factor numeric not null default 1,
  is_caffeinated boolean not null default false, created_at timestamptz not null default now()
);

create table containers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, volume_ml int not null check (volume_ml between 1 and 5000),
  is_favorite boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index on containers (user_id);

create table drink_logs (
  id uuid primary key,                                   -- client generated (idempotent sync)
  user_id uuid not null references auth.users(id) on delete cascade,
  beverage_type_id text not null references drink_types(id),
  volume_ml int not null check (volume_ml between 1 and 5000),
  hydration_value_ml int not null,
  container_id uuid references containers(id) on delete set null,
  logged_at timestamptz not null, tz text not null,
  source text not null default 'manual' check (source in ('manual','quick_add','reminder','widget','health')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on drink_logs (user_id, logged_at desc);
create index on drink_logs (user_id, updated_at);

create table daily_summaries (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null, total_ml int not null default 0, goal_ml int not null,
  goal_reached_at timestamptz, entry_count int not null default 0,
  primary key (user_id, day)
);

create table streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current int not null default 0, longest int not null default 0, last_goal_day date
);

create table challenges (id text primary key, category text not null, title text not null, description text not null,
  duration_days int not null, target jsonb not null, reward_xp int not null default 0, is_premium boolean not null default false);
create table challenge_progress (
  user_id uuid not null references auth.users(id) on delete cascade, challenge_id text not null references challenges(id),
  started_on date not null, progress int not null default 0, completed_at timestamptz,
  primary key (user_id, challenge_id)
);
create table achievements (id text primary key, title text not null, description text not null, xp int not null default 0);
create table user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade, achievement_id text not null references achievements(id),
  earned_at timestamptz not null default now(), primary key (user_id, achievement_id)
);
create table characters (id text primary key, name text not null, species text not null, personality text not null,
  description text not null, unlock_level int not null default 1, is_premium boolean not null default false);
create table user_characters (
  user_id uuid not null references auth.users(id) on delete cascade, character_id text not null references characters(id),
  unlocked_at timestamptz not null default now(), primary key (user_id, character_id)
);
create table notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mode text not null default 'smart' check (mode in ('smart','scheduled','interval')),
  enabled boolean not null default false, interval_minutes int default 90, scheduled_times text[] default '{}',
  quiet_start time default '22:00', quiet_end time default '07:00', weekdays_only boolean default false,
  max_per_day smallint not null default 6, skip_when_goal_reached boolean not null default true,
  tone text not null default 'friendly', updated_at timestamptz not null default now()
);
create table content_articles (id text primary key, category text not null, title text not null, summary text not null,
  body text not null, read_minutes smallint not null, sources text[] default '{}', published_at timestamptz default now());
create table bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade, article_id text not null references content_articles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, article_id)
);
create table subscription_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free', expires_at timestamptz, provider text, updated_at timestamptz not null default now()
);

-- RLS: private tables
do $$
declare t text;
begin
  foreach t in array array['profiles','hydration_goals','containers','drink_logs','daily_summaries','streaks',
    'challenge_progress','user_achievements','user_characters','notification_preferences','bookmarks','subscription_status']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "own rows" on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
-- subscription_status is written only by server functions in production: tighten to select-only.
drop policy "own rows" on subscription_status;
create policy "read own" on subscription_status for select using (user_id = auth.uid());

-- drink_types: system rows readable by all, custom rows owned
alter table drink_types enable row level security;
create policy "read system+own" on drink_types for select using (user_id is null or user_id = auth.uid());
create policy "write own" on drink_types for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- public catalog tables: read-only for authenticated users
do $$
declare t text;
begin
  foreach t in array array['challenges','achievements','characters','content_articles']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "read all" on %I for select to authenticated using (true)', t);
  end loop;
end $$;
