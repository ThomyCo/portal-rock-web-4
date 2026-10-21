create or replace view public.public_band_catalog with (security_invoker = true) as
select b.id, b.slug, b.name, b.summary, b.biography, b.formed_year as "formationYear", b.country_code as "countryCode",
  b.image_url as "heroImageUrl", b.website_url as "websiteUrl",
  coalesce(array_agg(distinct g.slug) filter (where g.slug is not null), '{}') as genres,
  extensions.st_x(p.location::extensions.geometry) as longitude,
  extensions.st_y(p.location::extensions.geometry) as latitude,
  p.website_url as "sourceUrl", p.city
from public.bands b
join public.band_places bp on bp.band_id = b.id and bp.relationship = 'origin'
join public.places p on p.id = bp.place_id
left join public.band_genres bg on bg.band_id = b.id
left join public.genres g on g.id = bg.genre_id
where b.published
group by b.id, p.id;

create or replace function public.bands_in_view(min_lat float8, min_long float8, max_lat float8, max_long float8, genre_slug text default null, decade int default null, country text default null, query text default null)
returns setof public.public_band_catalog language sql stable set search_path = '' as $$
  select c.* from public.public_band_catalog c
  where c.latitude between min_lat and max_lat and c.longitude between min_long and max_long
    and (genre_slug is null or genre_slug = any(c.genres))
    and (decade is null or c."formationYear" between decade and decade + 9)
    and (country is null or c."countryCode" = country)
    and (query is null or c.name ilike '%' || query || '%' or c.city ilike '%' || query || '%' or c.summary ilike '%' || query || '%');
$$;
grant select on public.public_band_catalog to anon, authenticated;
grant execute on function public.bands_in_view to anon, authenticated;
