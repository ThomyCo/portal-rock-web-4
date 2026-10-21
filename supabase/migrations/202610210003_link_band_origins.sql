-- Repair catalog entries whose bands and places were inserted without the
-- relationship required by public_band_catalog and bands_in_view.
insert into public.band_places (band_id, place_id, relationship)
select b.id, p.id, 'origin'
from public.bands b
join public.places p on p.name = b.name || ' · origen'
where b.published
on conflict do nothing;
