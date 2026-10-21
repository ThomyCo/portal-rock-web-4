create table private.moderation_log(id bigint generated always as identity primary key,report_id uuid not null,actor_id uuid not null,decision text not null,created_at timestamptz not null default now());
create or replace function public.moderate_report(report_id uuid, decision text) returns void language plpgsql security definer set search_path='' as $$
declare r public.reports;
begin
 if not public.is_staff() then raise exception 'Forbidden'; end if;
 if decision not in ('resolve-hide','dismiss') then raise exception 'Invalid decision'; end if;
 select * into r from public.reports where id=report_id for update;
 if r.id is null then raise exception 'Report not found'; end if;
 if decision='resolve-hide' then
   if r.topic_id is not null then update public.topics set status='hidden' where id=r.topic_id; end if;
   if r.comment_id is not null then update public.comments set status='hidden' where id=r.comment_id; end if;
 end if;
 update public.reports set status=case when decision='dismiss' then 'dismissed'::public.report_status else 'resolved'::public.report_status end,resolved_at=now() where id=report_id;
 insert into private.moderation_log(report_id,actor_id,decision) values(report_id,auth.uid(),decision);
end $$;
grant execute on function public.moderate_report(uuid,text) to authenticated;
