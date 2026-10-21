insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('avatars','avatars',true,2097152,array['image/jpeg','image/png','image/webp']),
('band-images','band-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "avatar public read" on storage.objects for select using(bucket_id='avatars');
create policy "avatar owner insert" on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatar owner update" on storage.objects for update to authenticated using(bucket_id='avatars' and owner_id=auth.uid()::text);
create policy "band images public read" on storage.objects for select using(bucket_id='band-images');
create policy "band images admin write" on storage.objects for insert to authenticated with check(bucket_id='band-images' and public.is_staff());
