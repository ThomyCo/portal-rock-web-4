begin;
select plan(12);

insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'member@test.local'),
  ('10000000-0000-0000-0000-000000000002', 'moderator@test.local'),
  ('10000000-0000-0000-0000-000000000003', 'admin@test.local');

update public.profiles set role = 'moderator' where id = '10000000-0000-0000-0000-000000000002';
update public.profiles set role = 'admin' where id = '10000000-0000-0000-0000-000000000003';

insert into public.rock_news_sources (id, name, feed_url, site_url, country_code, language_code, allowed_categories)
values ('20000000-0000-0000-0000-000000000001', 'Fuente', 'https://example.com/feed', 'https://example.com', 'MX', 'es', array['mexico']);

insert into public.rock_news (id, source_id, canonical_url, url_hash, title, summary, published_at, category, status)
values
 ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'https://example.com/approved', 'approved', 'Aprobada', 'Resumen aprobado', now(), 'mexico', 'approved'),
 ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'https://example.com/pending', 'pending', 'Pendiente', 'Resumen pendiente', now(), 'mexico', 'pending');

set local role anon;
select is((select count(*)::integer from public.public_rock_news), 1, 'anon sees only approved news');
select throws_ok($$insert into public.rock_news_sources(name,feed_url,site_url,country_code,language_code,allowed_categories) values('X','https://x.test/feed','https://x.test','MX','es',array['mexico'])$$, '42501', null, 'anon cannot add sources');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select throws_ok($$select public.moderate_rock_news('30000000-0000-0000-0000-000000000002','approve',null,null,null)$$, 'P0001', 'Forbidden', 'member cannot moderate news');
select throws_ok($$select public.set_rock_event_hidden(gen_random_uuid(), true)$$, 'P0001', 'Forbidden', 'member cannot hide events');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select lives_ok($$select public.moderate_rock_news('30000000-0000-0000-0000-000000000002','approve',null,null,null)$$, 'moderator can approve news');
select lives_ok($$select public.set_featured_rock_news('30000000-0000-0000-0000-000000000002')$$, 'moderator can feature approved news');
select throws_ok($$select public.set_rock_event_hidden(gen_random_uuid(), true)$$, 'P0001', 'Forbidden', 'moderator cannot hide events');
select throws_ok($$select public.set_rock_news_source(null,'X','https://x.test/feed','https://x.test','MX','es',array['mexico'],true)$$, 'P0001', 'Forbidden', 'moderator cannot manage sources');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select lives_ok($$select public.set_rock_news_source(null,'X','https://x.test/feed','https://x.test','MX','es',array['mexico'],true)$$, 'admin can add sources');
select lives_ok($$select public.reorder_rock_news(array['30000000-0000-0000-0000-000000000001'::uuid,'30000000-0000-0000-0000-000000000002'::uuid])$$, 'admin can reorder approved news');
select throws_ok($$insert into public.content_sync_runs(trigger_kind,status) values('manual','running')$$, '42501', null, 'authenticated users cannot write sync runs directly');
select is((select count(*)::integer from public.rock_news), 2, 'staff can inspect editorial news');

select * from finish();
rollback;
