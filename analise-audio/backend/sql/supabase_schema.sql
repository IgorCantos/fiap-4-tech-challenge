-- Execute no SQL Editor do Supabase (Dashboard → SQL → New query)

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  transcription text,
  emotion text,
  emotion_confidence double precision,
  llm_analysis text not null,
  audio_features jsonb
);

create index if not exists analyses_created_at_idx
  on public.analyses (created_at desc);

alter table public.analyses enable row level security;

create policy "analyses_select_public"
  on public.analyses for select
  using (true);

create policy "analyses_insert_public"
  on public.analyses for insert
  with check (true);
