-- =====================================================================
-- Nusa Lingua — dashboard moderator (Fase B, lihat docs/rancangan-moderator.md)
--
--   get_moderation_overview()        antrean per bahasa yang dimoderasi
--   get_my_moderation_stats(p_days)  statistik tinjauan user saat ini
--
-- Riwayat aktivitas dibaca langsung dari moderation_log (RLS dari 0005).
-- Jalankan setelah 0005_moderation_core.sql. Aman dijalankan ulang.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- RPC: get_moderation_overview
-- Per bahasa yang dimoderasi user saat ini (admin: semua bahasa):
--   pending_count      usulan menunggu yang bisa ia tindak (milik sendiri tidak dihitung)
--   oldest_pending_at  waktu kirim usulan menunggu tertua (yang bisa ia tindak)
--   reviewed_7d        usulan yang ditinjau siapa pun dalam 7 hari terakhir
--   approved_7d        ... dan disetujui
--   moderator_count    moderator yang memegang bahasa ini (tidak termasuk admin)
-- ---------------------------------------------------------------------
create or replace function public.get_moderation_overview()
returns table (
  language_id bigint,
  language_name text,
  language_code text,
  pending_count bigint,
  oldest_pending_at timestamptz,
  reviewed_7d bigint,
  approved_7d bigint,
  moderator_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with scope as (
    select l.id, l.name, l.code
    from public.languages l
    where l.id in (select public.moderated_language_ids())
  ),
  subs as (
    select
      s.language_id,
      count(*) filter (where s.status = 'pending' and s.user_id <> (select auth.uid())) as pending_count,
      min(s.created_at) filter (where s.status = 'pending' and s.user_id <> (select auth.uid())) as oldest_pending_at,
      count(*) filter (where s.reviewed_at >= now() - interval '7 days') as reviewed_7d,
      count(*) filter (where s.status = 'approved' and s.reviewed_at >= now() - interval '7 days') as approved_7d
    from public.vocab_submissions s
    where s.language_id in (select sc.id from scope sc)
      and (s.status = 'pending' or s.reviewed_at >= now() - interval '7 days')
    group by s.language_id
  ),
  mods as (
    select ml.language_id, count(*) as moderator_count
    from public.moderator_languages ml
    join public.profiles p on p.id = ml.user_id and p.role = 'moderator'
    group by ml.language_id
  )
  select
    sc.id,
    sc.name,
    sc.code,
    coalesce(subs.pending_count, 0),
    subs.oldest_pending_at,
    coalesce(subs.reviewed_7d, 0),
    coalesce(subs.approved_7d, 0),
    coalesce(mods.moderator_count, 0)
  from scope sc
  left join subs on subs.language_id = sc.id
  left join mods on mods.language_id = sc.id
  order by coalesce(subs.pending_count, 0) desc, subs.oldest_pending_at asc nulls last, sc.name;
$$;

-- ---------------------------------------------------------------------
-- RPC: get_my_moderation_stats
-- Tinjauan oleh user saat ini dalam p_days hari terakhir (1–365).
-- avg_wait_hours = rata-rata jarak kirim → diputuskan (jam), NULL bila belum ada.
-- Security definer agar tinjauan lama tetap terhitung walau bahasanya sudah dilepas.
-- ---------------------------------------------------------------------
create or replace function public.get_my_moderation_stats(p_days integer default 7)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with params as (
    select least(greatest(coalesce(p_days, 7), 1), 365) as days
  )
  select jsonb_build_object(
    'days', (select days from params),
    'reviewed', count(*),
    'approved', count(*) filter (where s.status = 'approved'),
    'rejected', count(*) filter (where s.status = 'rejected'),
    'avg_wait_hours', round((avg(extract(epoch from (s.reviewed_at - s.created_at))) / 3600)::numeric, 1)
  )
  from public.vocab_submissions s
  where s.reviewed_by = (select auth.uid())
    and s.reviewed_at >= now() - make_interval(days => (select days from params));
$$;

revoke execute on function public.get_moderation_overview() from public, anon;
revoke execute on function public.get_my_moderation_stats(integer) from public, anon;
grant execute on function public.get_moderation_overview() to authenticated;
grant execute on function public.get_my_moderation_stats(integer) to authenticated;

commit;
