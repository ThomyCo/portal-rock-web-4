alter table public.profiles enable row level security;
alter table public.bands enable row level security;
alter table public.genres enable row level security;
alter table public.band_genres enable row level security;
alter table public.places enable row level security;
alter table public.band_places enable row level security;
alter table public.favorites enable row level security;
alter table public.topics enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('moderator','admin'));
$$;

create or replace function private.protect_profile_role() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role and not public.is_staff() then
    raise exception 'Only staff can change roles';
  end if;
  return new;
end; $$;
create trigger protect_profile_role before update on public.profiles for each row execute procedure private.protect_profile_role();

create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "published bands read" on public.bands for select using (published or public.is_staff());
create policy "genres public read" on public.genres for select using (true);
create policy "band genres public read" on public.band_genres for select using (true);
create policy "places public read" on public.places for select using (true);
create policy "band places public read" on public.band_places for select using (true);
create policy "favorites own all" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "published topics read" on public.topics for select using (status = 'published' or author_id = auth.uid() or public.is_staff());
create policy "topics own insert" on public.topics for insert with check (author_id = auth.uid());
create policy "topics own update" on public.topics for update using (author_id = auth.uid() or public.is_staff());
create policy "published comments read" on public.comments for select using (status = 'published' or author_id = auth.uid() or public.is_staff());
create policy "comments own insert" on public.comments for insert with check (author_id = auth.uid());
create policy "comments own update" on public.comments for update using (author_id = auth.uid() or public.is_staff());
create policy "reactions own all" on public.reactions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reports own insert" on public.reports for insert with check (reporter_id = auth.uid());
create policy "reports staff read" on public.reports for select using (public.is_staff());
create policy "reports staff update" on public.reports for update using (public.is_staff());

grant usage on schema public to anon, authenticated;
grant select on public.bands, public.genres, public.band_genres, public.places, public.band_places, public.profiles, public.topics, public.comments to anon, authenticated;
grant insert, update, delete on public.favorites, public.topics, public.comments, public.reactions, public.reports to authenticated;
