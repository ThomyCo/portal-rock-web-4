create table public.rock_news_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  feed_url text not null unique check (feed_url like 'https://%'),
  site_url text not null check (site_url like 'https://%'),
  country_code text not null check (char_length(country_code) = 2),
  language_code text not null check (char_length(language_code) between 2 and 8),
  allowed_categories text[] not null check (
    cardinality(allowed_categories) > 0 and
    allowed_categories <@ array['mexico','international','releases','festivals','other']::text[]
  ),
  active boolean not null default true,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rock_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  name text not null,
  artist_name text not null,
  description text,
  starts_at timestamptz not null,
  timezone text,
  venue_name text not null,
  city text not null,
  state text,
  country_code text not null check (char_length(country_code) = 2),
  latitude double precision,
  longitude double precision,
  image_url text check (image_url is null or image_url like 'https://%'),
  ticket_url text not null check (ticket_url like 'https://%'),
  genres text[] not null default '{}',
  scope text not null check (scope in ('mexico','international')),
  status text not null check (status in ('scheduled','postponed','cancelled','completed')),
  hidden boolean not null default false,
  source_updated_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_id)
);

create table public.rock_news (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.rock_news_sources(id) on delete restrict,
  canonical_url text not null check (canonical_url like 'https://%'),
  url_hash text not null unique,
  title text not null check (length(btrim(title)) > 0),
  summary text not null default '',
  image_url text check (image_url is null or image_url like 'https://%'),
  published_at timestamptz not null,
  fetched_at timestamptz not null default now(),
  category text not null check (category in ('mexico','international','releases','festivals','other')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  featured boolean not null default false,
  editorial_order integer,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not featured or status = 'approved')
);

create unique index one_approved_featured_rock_news
  on public.rock_news ((featured))
  where (featured and status = 'approved');

create table public.content_sync_runs (
  id uuid primary key default gen_random_uuid(),
  trigger_kind text not null check (trigger_kind in ('cron','manual')),
  status text not null check (status in ('running','succeeded','partial','failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  inserted_counts jsonb not null default '{}'::jsonb,
  updated_counts jsonb not null default '{}'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  error_summary text,
  created_at timestamptz not null default now()
);

create unique index one_running_content_sync
  on public.content_sync_runs ((status))
  where (status = 'running');

create index rock_events_home_order on public.rock_events (scope, starts_at)
  where not hidden;
create index rock_news_editorial_order on public.rock_news (featured desc, editorial_order, published_at desc)
  where status = 'approved';

alter table public.rock_events enable row level security;
alter table public.rock_news enable row level security;
alter table public.rock_news_sources enable row level security;
alter table public.content_sync_runs enable row level security;

create policy "visible events public read" on public.rock_events
  for select using ((starts_at >= now() and not hidden) or public.is_staff());
create policy "approved news public read" on public.rock_news
  for select using (status = 'approved' or public.is_staff());
create policy "sources admin read" on public.rock_news_sources
  for select using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "sync runs admin read" on public.content_sync_runs
  for select using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create or replace view public.public_rock_events
with (security_invoker = true) as
select id, provider, external_id, name, artist_name, description, starts_at,
  timezone, venue_name, city, state, country_code, latitude, longitude,
  image_url, ticket_url, genres, scope, status, source_updated_at, updated_at
from public.rock_events
where starts_at >= now() and not hidden;

create or replace view public.public_rock_news_sources
with (security_invoker = false) as
select id, name, site_url
from public.rock_news_sources
where active;

create or replace view public.public_rock_news
with (security_invoker = true) as
select n.id, n.canonical_url, n.title, n.summary, n.image_url, n.published_at,
  n.category, n.featured, n.editorial_order, n.updated_at,
  s.name as source_name, s.site_url as source_site_url
from public.rock_news n
join public.public_rock_news_sources s on s.id = n.source_id
where n.status = 'approved';

comment on view public.public_rock_news_sources is
  'Public projection owned by the migration role; exposes only safe metadata for active sources.';

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.moderate_rock_news(
  news_id uuid,
  decision text,
  edited_title text default null,
  edited_summary text default null,
  edited_category text default null
) returns public.rock_news
language plpgsql security definer set search_path = '' as $$
declare result public.rock_news;
begin
  if not public.is_staff() then raise exception 'Forbidden'; end if;
  if decision not in ('approve','reject') then raise exception 'Invalid decision'; end if;
  if edited_category is not null and edited_category not in ('mexico','international','releases','festivals','other') then
    raise exception 'Invalid category';
  end if;

  update public.rock_news
  set status = case when decision = 'approve' then 'approved' else 'rejected' end,
      title = coalesce(nullif(btrim(edited_title), ''), title),
      summary = coalesce(edited_summary, summary),
      category = coalesce(edited_category, category),
      featured = case when decision = 'reject' then false else featured end,
      reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  where id = news_id
  returning * into result;

  if result.id is null then raise exception 'News not found'; end if;
  return result;
end $$;

create or replace function public.set_featured_rock_news(news_id uuid)
returns public.rock_news
language plpgsql security definer set search_path = '' as $$
declare result public.rock_news;
begin
  if not public.is_staff() then raise exception 'Forbidden'; end if;
  select * into result from public.rock_news where id = news_id and status = 'approved' for update;
  if result.id is null then raise exception 'Approved news not found'; end if;
  update public.rock_news set featured = false, updated_at = now() where featured and id <> news_id;
  update public.rock_news set featured = true, updated_at = now() where id = news_id returning * into result;
  return result;
end $$;

create or replace function public.reorder_rock_news(news_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_staff() then raise exception 'Forbidden'; end if;
  if cardinality(news_ids) <> (select count(distinct value) from unnest(news_ids) as value) then
    raise exception 'Duplicate news id';
  end if;
  if exists(select 1 from unnest(news_ids) as requested(id) left join public.rock_news n on n.id = requested.id where n.id is null or n.status <> 'approved') then
    raise exception 'All news must be approved';
  end if;
  update public.rock_news n set editorial_order = ordered.position, updated_at = now()
  from unnest(news_ids) with ordinality as ordered(id, position)
  where n.id = ordered.id;
end $$;

create or replace function public.set_rock_event_hidden(event_id uuid, should_hide boolean)
returns public.rock_events
language plpgsql security definer set search_path = '' as $$
declare result public.rock_events;
begin
  if not private.is_admin() then raise exception 'Forbidden'; end if;
  update public.rock_events set hidden = should_hide, updated_at = now()
  where id = event_id returning * into result;
  if result.id is null then raise exception 'Event not found'; end if;
  return result;
end $$;

create or replace function public.set_rock_news_source(
  source_id uuid,
  source_name text,
  feed_url text,
  site_url text,
  source_country text,
  source_language text,
  allowed_categories text[],
  should_be_active boolean
) returns public.rock_news_sources
language plpgsql security definer set search_path = '' as $$
declare result public.rock_news_sources;
begin
  if not private.is_admin() then raise exception 'Forbidden'; end if;
  if feed_url not like 'https://%' or site_url not like 'https://%' then raise exception 'HTTPS required'; end if;
  if cardinality(allowed_categories) = 0 or not allowed_categories <@ array['mexico','international','releases','festivals','other']::text[] then
    raise exception 'Invalid categories';
  end if;

  if source_id is null then
    insert into public.rock_news_sources(name, feed_url, site_url, country_code, language_code, allowed_categories, active)
    values($2, $3, $4, upper($5), lower($6), $7, $8)
    returning * into result;
  else
    update public.rock_news_sources
    set name = $2, feed_url = $3, site_url = $4,
        country_code = upper($5), language_code = lower($6),
        allowed_categories = $7, active = $8, updated_at = now()
    where id = $1 returning * into result;
    if result.id is null then raise exception 'Source not found'; end if;
  end if;
  return result;
end $$;

grant select on public.rock_events, public.rock_news to anon, authenticated;
grant select on public.rock_news_sources, public.content_sync_runs to authenticated;
grant select on public.public_rock_events, public.public_rock_news to anon, authenticated;
grant select on public.public_rock_news_sources to anon, authenticated;
revoke all on public.rock_news_sources from anon, authenticated;
grant select on public.rock_news_sources to authenticated;
revoke all on public.content_sync_runs from anon, authenticated;
grant select on public.content_sync_runs to authenticated;

grant execute on function public.moderate_rock_news(uuid,text,text,text,text) to authenticated;
grant execute on function public.set_featured_rock_news(uuid) to authenticated;
grant execute on function public.reorder_rock_news(uuid[]) to authenticated;
grant execute on function public.set_rock_event_hidden(uuid,boolean) to authenticated;
grant execute on function public.set_rock_news_source(uuid,text,text,text,text,text,text[],boolean) to authenticated;
