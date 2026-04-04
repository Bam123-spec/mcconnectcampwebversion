-- Create personal_events table
create table public.personal_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  day date not null,
  start_time time not null,
  end_time time not null,
  alarms jsonb default '[]'::jsonb, -- Array of minutes before event
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.personal_events enable row level security;

-- Policies
create policy "Users can view their own personal events"
  on public.personal_events for select
  using (auth.uid() = user_id);

create policy "Users can insert their own personal events"
  on public.personal_events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own personal events"
  on public.personal_events for update
  using (auth.uid() = user_id);

create policy "Users can delete their own personal events"
  on public.personal_events for delete
  using (auth.uid() = user_id);
