create table public.api_cache(key text primary key,provider text not null,payload jsonb not null,status int not null default 200,fetched_at timestamptz not null default now(),expires_at timestamptz not null);
create table private.sync_runs(id uuid primary key default gen_random_uuid(),band_id uuid references public.bands(id),actor_id uuid references public.profiles(id),providers text[] not null,status text not null,summary jsonb not null default '{}',created_at timestamptz not null default now());
alter table public.api_cache enable row level security;
