create table public.topics (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  band_id uuid references public.bands(id),
  title text not null check (char_length(title) between 5 and 120),
  body text not null check (char_length(body) between 10 and 5000),
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.reactions (
  user_id uuid references public.profiles(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reaction text not null check (reaction in ('rock','love','insightful')),
  created_at timestamptz not null default now(),
  check ((topic_id is null) <> (comment_id is null)),
  unique nulls not distinct (user_id, topic_id, comment_id, reaction)
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id),
  topic_id uuid references public.topics(id), comment_id uuid references public.comments(id),
  reason text not null check (char_length(reason) between 5 and 500),
  status public.report_status not null default 'open', resolution_note text,
  created_at timestamptz not null default now(), resolved_at timestamptz,
  check ((topic_id is null) <> (comment_id is null))
);
