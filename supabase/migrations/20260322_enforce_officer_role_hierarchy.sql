begin;

create schema if not exists private;

create or replace function private.normalize_officer_role(target_role text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when lower(coalesce(target_role, '')) like '%admin%' then 'admin'
    when lower(coalesce(target_role, '')) like '%vice president%' then 'vice_president'
    when lower(coalesce(target_role, '')) like '%v. president%' then 'vice_president'
    when lower(coalesce(target_role, '')) = 'vp' then 'vice_president'
    when lower(coalesce(target_role, '')) like '%treasurer%' then 'treasurer'
    when lower(coalesce(target_role, '')) like '%secretary%' then 'secretary'
    when lower(coalesce(target_role, '')) like '%president%' then 'president'
    when lower(coalesce(target_role, '')) like '%officer%' then 'officer'
    else 'member'
  end;
$$;

create or replace function private.officer_role_rank(target_role text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case private.normalize_officer_role(target_role)
    when 'admin' then 6
    when 'president' then 5
    when 'vice_president' then 4
    when 'treasurer' then 3
    when 'secretary' then 2
    when 'officer' then 1
    else 0
  end;
$$;

create or replace function private.current_user_is_global_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  );
$$;

create or replace function private.current_user_officer_role(target_club_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select officer.role
      from public.officers officer
      where officer.club_id = target_club_id
        and officer.user_id = auth.uid()
      limit 1
    ),
    'member'
  );
$$;

create or replace function private.is_approved_club_member(target_user_id uuid, target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.club_members member
    where member.user_id = target_user_id
      and member.club_id = target_club_id
      and coalesce(member.status, 'approved') = 'approved'
  );
$$;

create or replace function private.can_manage_existing_officer(
  target_club_id uuid,
  target_user_id uuid,
  target_role text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role text := private.normalize_officer_role(private.current_user_officer_role(target_club_id));
  target_rank integer := private.officer_role_rank(target_role);
begin
  if private.current_user_is_global_admin() then
    return true;
  end if;

  if actor_role <> 'president' then
    return false;
  end if;

  return private.officer_role_rank(actor_role) > target_rank
    and auth.uid() is distinct from target_user_id;
end;
$$;

create or replace function private.can_assign_officer_role(
  target_user_id uuid,
  target_club_id uuid,
  target_role text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role text := private.normalize_officer_role(private.current_user_officer_role(target_club_id));
  normalized_target_role text := private.normalize_officer_role(target_role);
begin
  if not private.is_approved_club_member(target_user_id, target_club_id) then
    return false;
  end if;

  if private.current_user_is_global_admin() then
    return normalized_target_role in ('president', 'vice_president', 'treasurer', 'secretary', 'officer');
  end if;

  if actor_role <> 'president' then
    return false;
  end if;

  return normalized_target_role in ('vice_president', 'treasurer', 'secretary', 'officer');
end;
$$;

create or replace function private.can_remove_club_member(
  target_user_id uuid,
  target_club_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role text := private.normalize_officer_role(private.current_user_officer_role(target_club_id));
  target_role text := coalesce(
    (
      select officer.role
      from public.officers officer
      where officer.club_id = target_club_id
        and officer.user_id = target_user_id
      limit 1
    ),
    'member'
  );
begin
  if private.current_user_is_global_admin() then
    return true;
  end if;

  if actor_role = 'president' then
    return private.officer_role_rank(actor_role) > private.officer_role_rank(target_role)
      and auth.uid() is distinct from target_user_id;
  end if;

  if actor_role = 'vice_president' then
    return private.normalize_officer_role(target_role) = 'member';
  end if;

  return false;
end;
$$;

create or replace function private.can_create_club_event(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_is_global_admin()
    or private.normalize_officer_role(private.current_user_officer_role(target_club_id))
      in ('president', 'vice_president', 'treasurer');
$$;

create or replace function private.can_post_club_announcement(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_is_global_admin()
    or private.normalize_officer_role(private.current_user_officer_role(target_club_id))
      in ('president', 'vice_president', 'treasurer', 'secretary', 'officer');
$$;

create or replace function private.can_access_admin_conversation(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_is_global_admin()
    or exists (
      select 1
      from public.admin_conversation_members member
      where member.conversation_id = target_conversation_id
        and member.user_id = auth.uid()
    );
$$;

create or replace function private.admin_conversation_sender_role(target_conversation_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when private.current_user_is_global_admin() then 'admin'
    else coalesce(
      (
        select member.role
        from public.admin_conversation_members member
        where member.conversation_id = target_conversation_id
          and member.user_id = auth.uid()
        limit 1
      ),
      'member'
    )
  end;
$$;

create or replace function private.can_open_admin_club_conversation(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_is_global_admin()
    or private.normalize_officer_role(private.current_user_officer_role(target_club_id))
      in ('president', 'vice_president', 'treasurer', 'secretary', 'officer');
$$;

do $$
declare
  target_table text;
  target_policy record;
begin
  foreach target_table in array array[
    'officers',
    'events',
    'posts',
    'admin_conversations',
    'admin_conversation_members',
    'admin_messages',
    'admin_message_reads'
  ]
  loop
    for target_policy in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
    loop
      execute format('drop policy if exists %I on public.%I', target_policy.policyname, target_table);
    end loop;
  end loop;
end
$$;

alter table public.officers enable row level security;
alter table public.events enable row level security;
alter table public.posts enable row level security;
alter table public.admin_conversations enable row level security;
alter table public.admin_conversation_members enable row level security;
alter table public.admin_messages enable row level security;
alter table public.admin_message_reads enable row level security;

create policy officers_select_scoped
on public.officers
for select
to authenticated
using (
  private.current_user_is_global_admin()
  or auth.uid() = user_id
  or private.is_approved_club_member(auth.uid(), club_id)
);

create policy officers_insert_hierarchical
on public.officers
for insert
to authenticated
with check (
  private.can_assign_officer_role(user_id, club_id, role)
);

create policy officers_update_hierarchical
on public.officers
for update
to authenticated
using (
  private.can_manage_existing_officer(club_id, user_id, role)
)
with check (
  private.can_assign_officer_role(user_id, club_id, role)
);

create policy officers_delete_hierarchical
on public.officers
for delete
to authenticated
using (
  private.can_manage_existing_officer(club_id, user_id, role)
);

create policy events_select_public
on public.events
for select
to public
using (true);

create policy events_insert_leadership
on public.events
for insert
to authenticated
with check (
  private.can_create_club_event(club_id)
);

create policy events_update_leadership
on public.events
for update
to authenticated
using (
  private.can_create_club_event(club_id)
)
with check (
  private.can_create_club_event(club_id)
);

create policy events_delete_leadership
on public.events
for delete
to authenticated
using (
  private.can_create_club_event(club_id)
);

create policy posts_select_public
on public.posts
for select
to public
using (true);

create policy posts_insert_leadership
on public.posts
for insert
to authenticated
with check (
  auth.uid() = author_id
  and private.can_post_club_announcement(club_id)
);

create policy posts_update_leadership
on public.posts
for update
to authenticated
using (
  private.can_post_club_announcement(club_id)
  and (
    author_id = auth.uid()
    or private.current_user_is_global_admin()
    or private.normalize_officer_role(private.current_user_officer_role(club_id))
      in ('president', 'vice_president')
  )
)
with check (
  private.can_post_club_announcement(club_id)
);

create policy posts_delete_leadership
on public.posts
for delete
to authenticated
using (
  private.can_post_club_announcement(club_id)
  and (
    author_id = auth.uid()
    or private.current_user_is_global_admin()
    or private.normalize_officer_role(private.current_user_officer_role(club_id))
      in ('president', 'vice_president')
  )
);

create policy admin_conversations_select_member_only
on public.admin_conversations
for select
to authenticated
using (
  private.can_access_admin_conversation(id)
);

create policy admin_conversations_insert_leadership
on public.admin_conversations
for insert
to authenticated
with check (
  auth.uid() = created_by
  and club_id is not null
  and private.can_open_admin_club_conversation(club_id)
);

create policy admin_conversations_update_member_only
on public.admin_conversations
for update
to authenticated
using (
  private.can_access_admin_conversation(id)
)
with check (
  private.can_access_admin_conversation(id)
);

create policy admin_conversation_members_select_member_only
on public.admin_conversation_members
for select
to authenticated
using (
  private.can_access_admin_conversation(conversation_id)
);

create policy admin_conversation_members_insert_self_only
on public.admin_conversation_members
for insert
to authenticated
with check (
  auth.uid() = user_id
  and private.can_access_admin_conversation(conversation_id)
);

create policy admin_message_reads_select_own
on public.admin_message_reads
for select
to authenticated
using (
  auth.uid() = user_id
  and private.can_access_admin_conversation(conversation_id)
);

create policy admin_message_reads_insert_own
on public.admin_message_reads
for insert
to authenticated
with check (
  auth.uid() = user_id
  and private.can_access_admin_conversation(conversation_id)
);

create policy admin_message_reads_update_own
on public.admin_message_reads
for update
to authenticated
using (
  auth.uid() = user_id
  and private.can_access_admin_conversation(conversation_id)
)
with check (
  auth.uid() = user_id
  and private.can_access_admin_conversation(conversation_id)
);

create policy admin_messages_select_member_only
on public.admin_messages
for select
to authenticated
using (
  private.can_access_admin_conversation(conversation_id)
);

create policy admin_messages_insert_member_only
on public.admin_messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and private.can_access_admin_conversation(conversation_id)
  and private.normalize_officer_role(sender_role)
    = private.normalize_officer_role(private.admin_conversation_sender_role(conversation_id))
);

commit;
