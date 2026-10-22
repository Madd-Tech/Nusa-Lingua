-- =====================================================================
-- Nusa Lingua — laporan pengguna & kelola kamus (Fase D, lihat docs/rancangan-moderator.md)
--
--   Kamus     moderator mengedit / menyembunyikan entri `vocabularies` di bahasa
--             yang ia pegang. Kata yang dipakai soal tidak bisa disembunyikan.
--             Kata tersembunyi hilang dari kamus publik (RLS) & dari cek duplikat.
--   Laporan   pengguna melaporkan kesalahan kata/artikel (`content_reports`);
--             moderator menangani per target lewat get_report_queue / resolve_reports.
--
-- Perubahan oleh service role / SQL Editor (auth.uid() NULL) tidak dibatasi
-- aturan di bawah dan tidak dicatat di moderation_log.
--
-- Kode error: NL409 sudah ditangani · NL422 validasi · NL429 batas laporan.
-- Jalankan SEKALI setelah 0007_articles_cms.sql.
-- =====================================================================

begin;

create type public.report_target as enum ('vocabulary', 'article');
create type public.report_reason as enum (
  'ejaan', 'arti_keliru', 'tingkat_tutur', 'audio', 'fakta_budaya', 'tidak_pantas', 'lainnya'
);
create type public.report_status as enum ('open', 'resolved', 'dismissed');

-- =====================================================================
-- Kamus: edit & sembunyikan
-- =====================================================================
alter table public.vocabularies
  add column is_hidden boolean not null default false,
  add column hidden_reason text check (char_length(hidden_reason) <= 300),
  add column updated_at timestamptz,
  add column updated_by uuid references public.profiles (id) on delete set null;

-- NOT VALID: baris lama tidak dicek ulang, baris baru/diubah dicek.
alter table public.vocabularies
  add constraint vocab_word_length check (char_length(btrim(word)) between 1 and 80) not valid,
  add constraint vocab_meaning_length check (char_length(btrim(meaning_id)) between 1 and 200) not valid,
  add constraint vocab_hidden_has_reason check (not is_hidden or hidden_reason is not null) not valid;

create index vocab_hidden_idx on public.vocabularies (language_id) where is_hidden;

create or replace function public.vocab_before_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_uses integer;
begin
  if v_user is null then
    return new;
  end if;

  new.updated_at := now();
  new.updated_by := v_user;
  new.word := btrim(new.word);
  new.meaning_id := btrim(new.meaning_id);
  new.meaning_en := nullif(btrim(coalesce(new.meaning_en, '')), '');
  new.speech_level := nullif(btrim(coalesce(new.speech_level, '')), '');
  new.pronunciation := nullif(btrim(coalesce(new.pronunciation, '')), '');
  new.example_sentence := nullif(btrim(coalesce(new.example_sentence, '')), '');
  new.example_meaning := nullif(btrim(coalesce(new.example_meaning, '')), '');
  new.category := nullif(btrim(coalesce(new.category, '')), '');

  if new.is_hidden and not old.is_hidden then
    new.hidden_reason := nullif(btrim(coalesce(new.hidden_reason, '')), '');
    if new.hidden_reason is null then
      raise exception 'Tulis alasan menyembunyikan kata ini' using errcode = 'NL422';
    end if;
    select count(*) into v_uses from public.questions where vocabulary_id = new.id;
    if v_uses > 0 then
      raise exception 'Kata ini dipakai di % soal. Perbaiki isinya saja, jangan disembunyikan.', v_uses using errcode = 'NL422';
    end if;
  elsif not new.is_hidden then
    new.hidden_reason := null;
  else
    new.hidden_reason := coalesce(nullif(btrim(coalesce(new.hidden_reason, '')), ''), old.hidden_reason);
  end if;

  return new;
end;
$$;

create trigger vocab_before_update
  before update on public.vocabularies
  for each row execute function public.vocab_before_update();

create or replace function public.vocab_after_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before jsonb;
  v_after jsonb;
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if new.is_hidden and not old.is_hidden then
    perform public.log_moderation('vocab_hidden', new.language_id, 'vocabulary', new.id::text,
      jsonb_build_object('word', new.word, 'note', new.hidden_reason));
  elsif old.is_hidden and not new.is_hidden then
    perform public.log_moderation('vocab_restored', new.language_id, 'vocabulary', new.id::text,
      jsonb_build_object('word', new.word));
  end if;

  select coalesce(jsonb_object_agg(o.key, o.value), '{}'), coalesce(jsonb_object_agg(n.key, n.value), '{}')
    into v_before, v_after
  from jsonb_each(to_jsonb(old)) o
  join jsonb_each(to_jsonb(new)) n on n.key = o.key
  where o.key in ('word', 'meaning_id', 'meaning_en', 'speech_level', 'pronunciation',
                  'example_sentence', 'example_meaning', 'category')
    and o.value is distinct from n.value;

  if v_after <> '{}'::jsonb then
    perform public.log_moderation('vocab_updated', new.language_id, 'vocabulary', new.id::text,
      jsonb_build_object('word', new.word, 'before', v_before, 'after', v_after));
  end if;

  return new;
end;
$$;

create trigger vocab_after_update
  after update on public.vocabularies
  for each row execute function public.vocab_after_update();

drop policy "Konten publik: vocabularies" on public.vocabularies;
create policy "Kosakata tampil dapat dibaca" on public.vocabularies
  for select to anon, authenticated
  using (not is_hidden);
-- Moderator perlu melihat kata tersembunyi untuk memulihkannya. Kamus publik
-- tetap memfilter `is_hidden = false` di query.
create policy "Moderator melihat kosakata tersembunyi" on public.vocabularies
  for select to authenticated
  using ((select public.is_moderator()));
create policy "Moderator mengubah kosakata bahasanya" on public.vocabularies
  for update to authenticated
  using (language_id in (select public.moderated_language_ids()))
  with check (language_id in (select public.moderated_language_ids()));

revoke insert, update, delete on public.vocabularies from anon, authenticated;
grant update (word, meaning_id, meaning_en, speech_level, pronunciation, example_sentence, example_meaning,
              category, is_hidden, hidden_reason)
  on public.vocabularies to authenticated;

revoke execute on function public.vocab_before_update() from public, anon, authenticated;
revoke execute on function public.vocab_after_update() from public, anon, authenticated;

-- Kata tersembunyi tidak lagi dianggap duplikat saat meninjau usulan.
-- (Salinan fungsi dari 0005; satu-satunya perubahan: `and not v.is_hidden`.)
create or replace function public.review_submission(
  p_id bigint,
  p_decision public.submission_status,
  p_reject_reason public.reject_reason default null,
  p_note text default null,
  p_edits jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_xp constant integer := 15;
  s public.vocab_submissions%rowtype;
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_edits jsonb := coalesce(p_edits, '{}'::jsonb);
  v_word text;
  v_meaning text;
  v_speech_level text;
  v_example text;
  v_example_meaning text;
  v_edited boolean;
  v_vocab_id bigint;
begin
  if v_user is null then
    raise exception 'Harus login untuk meninjau usulan' using errcode = '28000';
  end if;

  select * into s from public.vocab_submissions where id = p_id for update;
  if not found then
    raise exception 'Usulan % tidak ditemukan', p_id using errcode = 'P0002';
  end if;

  if not public.can_moderate(s.language_id) then
    raise exception 'Kamu tidak memoderasi bahasa ini' using errcode = '42501';
  end if;
  if s.user_id = v_user then
    raise exception 'Usulanmu sendiri harus ditinjau moderator lain' using errcode = '42501';
  end if;
  if s.status <> 'pending' then
    raise exception 'Usulan ini sudah ditinjau moderator lain' using errcode = 'NL409';
  end if;
  if char_length(v_note) > 500 then
    raise exception 'Catatan maksimal 500 karakter' using errcode = 'NL422';
  end if;

  if p_decision = 'rejected' then
    if p_reject_reason is null then
      raise exception 'Pilih alasan penolakan' using errcode = 'NL422';
    end if;

    update public.vocab_submissions
       set status = 'rejected',
           reject_reason = p_reject_reason,
           review_note = v_note,
           reviewed_by = v_user,
           reviewed_at = now()
     where id = s.id;

    perform public.log_moderation(
      'submission_rejected', s.language_id, 'submission', s.id::text,
      jsonb_build_object('word', s.word, 'reason', p_reject_reason, 'note', v_note)
    );
    return jsonb_build_object('status', 'rejected');
  end if;

  if p_decision is distinct from 'approved' then
    raise exception 'Keputusan harus approved atau rejected' using errcode = 'NL422';
  end if;

  v_word := coalesce(nullif(btrim(v_edits ->> 'word'), ''), s.word);
  v_meaning := coalesce(nullif(btrim(v_edits ->> 'meaning_id'), ''), s.meaning_id);
  v_speech_level := nullif(btrim(v_edits ->> 'speech_level'), '');
  v_example := nullif(btrim(v_edits ->> 'example_sentence'), '');
  v_example_meaning := nullif(btrim(v_edits ->> 'example_meaning'), '');

  if char_length(v_word) > 80 or char_length(v_meaning) > 200 then
    raise exception 'Kata maksimal 80 karakter dan arti maksimal 200 karakter' using errcode = 'NL422';
  end if;
  if char_length(v_speech_level) > 40 or char_length(v_example) > 300 or char_length(v_example_meaning) > 300 then
    raise exception 'Tingkat tutur maksimal 40 karakter, contoh kalimat & terjemahnya maksimal 300' using errcode = 'NL422';
  end if;

  if exists (
    select 1 from public.vocabularies v
    where v.language_id = s.language_id
      and lower(v.word) = lower(v_word)
      and lower(v.meaning_id) = lower(v_meaning)
      and not v.is_hidden
  ) then
    raise exception 'Kata "%" dengan arti yang sama sudah ada di kamus', v_word using errcode = 'NL422';
  end if;

  insert into public.vocabularies (
    language_id, word, meaning_id, audio_url, category, source, contributed_by,
    speech_level, example_sentence, example_meaning
  )
  values (
    s.language_id, v_word, v_meaning, s.audio_url, 'kontribusi', 'kontribusi', s.user_id,
    v_speech_level, v_example, v_example_meaning
  )
  returning id into v_vocab_id;

  v_edited := v_word <> s.word or v_meaning <> s.meaning_id;

  update public.vocab_submissions
     set status = 'approved',
         word = v_word,
         meaning_id = v_meaning,
         original = case when v_edited then jsonb_build_object('word', s.word, 'meaning_id', s.meaning_id) end,
         review_note = v_note,
         reviewed_by = v_user,
         reviewed_at = now(),
         vocabulary_id = v_vocab_id
   where id = s.id;

  -- XP kontributor. XP per bahasa hanya ditambah bila user memang mengikuti
  -- bahasa itu (jangan diam-diam menambah bahasa yang diikuti).
  update public.profiles set xp_total = xp_total + v_xp where id = s.user_id;
  update public.user_languages
     set xp = xp + v_xp
   where user_id = s.user_id and language_id = s.language_id;
  insert into public.xp_logs (user_id, amount, source, source_id)
  values (s.user_id, v_xp, 'contribution', s.id::text);
  perform public.award_achievements(s.user_id);

  perform public.log_moderation(
    'submission_approved', s.language_id, 'submission', s.id::text,
    jsonb_build_object('word', v_word, 'vocabulary_id', v_vocab_id, 'edited', v_edited, 'note', v_note)
  );

  return jsonb_build_object('status', 'approved', 'vocabulary_id', v_vocab_id, 'xp_awarded', v_xp);
end;
$$;

create or replace function public.get_submission_queue(
  p_status public.submission_status default 'pending',
  p_language_id bigint default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id bigint,
  language_id bigint,
  language_name text,
  language_code text,
  word text,
  meaning_id text,
  audio_url text,
  status public.submission_status,
  created_at timestamptz,
  reviewed_at timestamptz,
  reject_reason public.reject_reason,
  review_note text,
  original jsonb,
  vocabulary_id bigint,
  submitter_id uuid,
  submitter_username text,
  submitter_approved bigint,
  submitter_reviewed bigint,
  reviewer_username text,
  is_own boolean,
  duplicates jsonb,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with page as (
    select s.*, count(*) over () as total
    from public.vocab_submissions s
    where s.status = p_status
      and s.language_id in (select public.moderated_language_ids())
      and (p_language_id is null or s.language_id = p_language_id)
    order by
      case when p_status = 'pending' then s.created_at end asc,
      s.reviewed_at desc nulls last,
      s.created_at desc
    limit least(greatest(coalesce(p_limit, 20), 1), 50)
    offset greatest(coalesce(p_offset, 0), 0)
  )
  select
    pg.id,
    pg.language_id,
    l.name,
    l.code,
    pg.word,
    pg.meaning_id,
    pg.audio_url,
    pg.status,
    pg.created_at,
    pg.reviewed_at,
    pg.reject_reason,
    pg.review_note,
    pg.original,
    pg.vocabulary_id,
    pg.user_id,
    sub.username,
    stats.approved,
    stats.reviewed,
    rev.username,
    pg.user_id = (select auth.uid()),
    case when pg.status = 'pending' then coalesce(dup.items, '[]'::jsonb) else '[]'::jsonb end,
    pg.total
  from page pg
  join public.languages l on l.id = pg.language_id
  left join public.profiles sub on sub.id = pg.user_id
  left join public.profiles rev on rev.id = pg.reviewed_by
  left join lateral (
    select
      count(*) filter (where x.status = 'approved') as approved,
      count(*) filter (where x.status <> 'pending') as reviewed
    from public.vocab_submissions x
    where x.user_id = pg.user_id
  ) stats on true
  left join lateral (
    select jsonb_agg(jsonb_build_object('id', d.id, 'word', d.word, 'meaning_id', d.meaning_id)) as items
    from (
      select v.id, v.word, v.meaning_id
      from public.vocabularies v
      where v.language_id = pg.language_id and lower(v.word) = lower(pg.word) and not v.is_hidden
      order by v.id
      limit 3
    ) d
  ) dup on true
  order by
    case when p_status = 'pending' then pg.created_at end asc,
    pg.reviewed_at desc nulls last,
    pg.created_at desc;
$$;

-- =====================================================================
-- Laporan pengguna
-- =====================================================================
create table public.content_reports (
  id bigint generated by default as identity primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target not null,
  vocabulary_id bigint references public.vocabularies (id) on delete cascade,
  article_id bigint references public.cultural_articles (id) on delete cascade,
  -- Diisi trigger dari target; dipakai untuk cakupan moderator.
  language_id bigint references public.languages (id) on delete set null,
  reason public.report_reason not null,
  message text check (char_length(message) <= 500),
  status public.report_status not null default 'open',
  resolution_note text check (char_length(resolution_note) <= 500),
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  check ((target_type = 'vocabulary') = (vocabulary_id is not null)),
  check ((target_type = 'article') = (article_id is not null))
);

-- Satu laporan terbuka per pelapor per target (23505 → "kamu sudah melaporkan ini").
create unique index content_reports_open_unique
  on public.content_reports (reporter_id, target_type, coalesce(vocabulary_id, article_id))
  where status = 'open';
create index content_reports_queue_idx on public.content_reports (language_id, status, created_at);
create index content_reports_vocabulary_idx on public.content_reports (vocabulary_id) where vocabulary_id is not null;
create index content_reports_article_idx on public.content_reports (article_id) where article_id is not null;
create index content_reports_reporter_idx on public.content_reports (reporter_id, created_at desc);

create or replace function public.reports_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is not null then
    new.reporter_id := v_user;
    new.status := 'open';
    new.resolution_note := null;
    new.resolved_by := null;
    new.resolved_at := null;
    if (select count(*) from public.content_reports where reporter_id = v_user and status = 'open') >= 10 then
      raise exception 'Kamu masih punya 10 laporan yang belum ditangani. Tunggu sebagian selesai dulu, ya.'
        using errcode = 'NL429';
    end if;
  end if;

  new.message := nullif(btrim(coalesce(new.message, '')), '');

  if new.target_type = 'vocabulary' then
    select v.language_id into new.language_id
    from public.vocabularies v
    where v.id = new.vocabulary_id and not v.is_hidden;
    if not found then
      raise exception 'Kata yang dilaporkan tidak ditemukan' using errcode = 'P0002';
    end if;
  else
    select a.language_id into new.language_id
    from public.cultural_articles a
    where a.id = new.article_id and a.status = 'published';
    if not found then
      raise exception 'Artikel yang dilaporkan tidak ditemukan' using errcode = 'P0002';
    end if;
  end if;

  return new;
end;
$$;

create trigger reports_before_insert
  before insert on public.content_reports
  for each row execute function public.reports_before_insert();

alter table public.content_reports enable row level security;

create policy "Kirim laporan sendiri" on public.content_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()) and status = 'open');

create policy "Lihat laporan sendiri atau bahasa yang dimoderasi" on public.content_reports
  for select to authenticated
  using (
    reporter_id = (select auth.uid())
    or language_id in (select public.moderated_language_ids())
    or (language_id is null and (select public.is_admin()))
  );

revoke insert, update, delete on public.content_reports from anon, authenticated;
grant insert (target_type, vocabulary_id, article_id, reason, message) on public.content_reports to authenticated;

revoke execute on function public.reports_before_insert() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- RPC: get_report_queue
-- Laporan dikelompokkan per target (kata/artikel) di bahasa yang dimoderasi.
-- Terbuka: paling banyak dilaporkan di atas; lainnya: terakhir ditangani di atas.
-- ---------------------------------------------------------------------
create or replace function public.get_report_queue(
  p_status public.report_status default 'open',
  p_language_id bigint default null,
  p_target_type public.report_target default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  target_type public.report_target,
  target_id bigint,
  language_id bigint,
  language_name text,
  language_code text,
  title text,
  subtitle text,
  article_slug text,
  article_status public.article_status,
  vocab_hidden boolean,
  vocab_uses bigint,
  report_count bigint,
  reasons public.report_reason[],
  first_reported_at timestamptz,
  last_reported_at timestamptz,
  reports jsonb,
  resolution_note text,
  resolved_by_username text,
  resolved_at timestamptz,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with scoped as (
    select r.*, coalesce(r.vocabulary_id, r.article_id) as tid
    from public.content_reports r
    where r.status = p_status
      and (r.language_id in (select public.moderated_language_ids())
           or (r.language_id is null and public.is_admin()))
      and (p_language_id is null or r.language_id = p_language_id)
      and (p_target_type is null or r.target_type = p_target_type)
  ),
  grouped as (
    select
      s.target_type,
      s.tid,
      max(s.language_id) as language_id,
      count(*) as report_count,
      array_agg(distinct s.reason) as reasons,
      min(s.created_at) as first_at,
      max(s.created_at) as last_at,
      max(s.resolved_at) as resolved_at,
      count(*) over () as total
    from scoped s
    group by s.target_type, s.tid
    order by
      case when p_status = 'open' then count(*) end desc nulls last,
      case when p_status = 'open' then min(s.created_at) end asc,
      max(s.resolved_at) desc nulls last
    limit least(greatest(coalesce(p_limit, 20), 1), 50)
    offset greatest(coalesce(p_offset, 0), 0)
  )
  select
    g.target_type,
    g.tid,
    g.language_id,
    l.name,
    l.code,
    coalesce(v.word, a.title),
    coalesce(v.meaning_id, a.summary),
    a.slug,
    a.status,
    coalesce(v.is_hidden, false),
    case when g.target_type = 'vocabulary'
      then (select count(*) from public.questions q where q.vocabulary_id = g.tid) else 0 end,
    g.report_count,
    g.reasons,
    g.first_at,
    g.last_at,
    (
      select jsonb_agg(jsonb_build_object(
               'id', r.id, 'reason', r.reason, 'message', r.message,
               'reporter', p.username, 'created_at', r.created_at
             ) order by r.created_at desc)
      from (
        select * from scoped s
        where s.target_type = g.target_type and s.tid = g.tid
        order by s.created_at desc
        limit 10
      ) r
      left join public.profiles p on p.id = r.reporter_id
    ),
    lr.resolution_note,
    lr.username,
    g.resolved_at,
    g.total
  from grouped g
  left join public.languages l on l.id = g.language_id
  left join public.vocabularies v on g.target_type = 'vocabulary' and v.id = g.tid
  left join public.cultural_articles a on g.target_type = 'article' and a.id = g.tid
  left join lateral (
    select s.resolution_note, p.username
    from scoped s
    left join public.profiles p on p.id = s.resolved_by
    where s.target_type = g.target_type and s.tid = g.tid
    order by s.resolved_at desc nulls last
    limit 1
  ) lr on true
  order by
    case when p_status = 'open' then g.report_count end desc nulls last,
    case when p_status = 'open' then g.first_at end asc,
    g.resolved_at desc nulls last;
$$;

-- ---------------------------------------------------------------------
-- RPC: resolve_reports
-- Tutup semua laporan terbuka untuk satu target. Mengabaikan wajib disertai catatan.
-- Mengembalikan {"count": jumlah laporan yang ditutup}.
-- ---------------------------------------------------------------------
create or replace function public.resolve_reports(
  p_target_type public.report_target,
  p_target_id bigint,
  p_status public.report_status,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_language bigint;
  v_title text;
  v_count integer;
begin
  if v_user is null then
    raise exception 'Harus login untuk menangani laporan' using errcode = '28000';
  end if;
  if p_status not in ('resolved', 'dismissed') then
    raise exception 'Status harus resolved atau dismissed' using errcode = 'NL422';
  end if;
  if p_status = 'dismissed' and v_note is null then
    raise exception 'Tulis alasan mengabaikan laporan ini' using errcode = 'NL422';
  end if;
  if char_length(v_note) > 500 then
    raise exception 'Catatan maksimal 500 karakter' using errcode = 'NL422';
  end if;

  if p_target_type = 'vocabulary' then
    select language_id, word into v_language, v_title from public.vocabularies where id = p_target_id;
  else
    select language_id, title into v_language, v_title from public.cultural_articles where id = p_target_id;
  end if;
  if not found then
    raise exception 'Target laporan tidak ditemukan' using errcode = 'P0002';
  end if;
  if not public.can_moderate(v_language) then
    raise exception 'Kamu tidak memoderasi bahasa ini' using errcode = '42501';
  end if;

  update public.content_reports
     set status = p_status,
         resolution_note = v_note,
         resolved_by = v_user,
         resolved_at = now()
   where status = 'open'
     and target_type = p_target_type
     and ((p_target_type = 'vocabulary' and vocabulary_id = p_target_id)
       or (p_target_type = 'article' and article_id = p_target_id));
  get diagnostics v_count = row_count;

  if v_count = 0 then
    raise exception 'Laporan ini sudah ditangani moderator lain' using errcode = 'NL409';
  end if;

  perform public.log_moderation(
    case when p_status = 'resolved' then 'report_resolved'::public.moderation_action else 'report_dismissed' end,
    v_language, 'report', p_target_type::text || ':' || p_target_id::text,
    jsonb_build_object('title', v_title, 'target_type', p_target_type, 'target_id', p_target_id, 'count', v_count, 'note', v_note)
  );

  return jsonb_build_object('count', v_count);
end;
$$;

revoke execute on function public.get_report_queue(public.report_status, bigint, public.report_target, integer, integer) from public, anon;
revoke execute on function public.resolve_reports(public.report_target, bigint, public.report_status, text) from public, anon;
grant execute on function public.get_report_queue(public.report_status, bigint, public.report_target, integer, integer) to authenticated;
grant execute on function public.resolve_reports(public.report_target, bigint, public.report_status, text) to authenticated;

-- =====================================================================
-- Dashboard: tambah laporan terbuka (jumlah target) ke get_moderation_overview
-- =====================================================================
drop function public.get_moderation_overview();

create function public.get_moderation_overview()
returns table (
  language_id bigint,
  language_name text,
  language_code text,
  pending_count bigint,
  oldest_pending_at timestamptz,
  reviewed_7d bigint,
  approved_7d bigint,
  moderator_count bigint,
  articles_review bigint,
  articles_draft bigint,
  open_reports bigint
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
  ),
  arts as (
    select
      a.language_id,
      count(*) filter (
        where a.status = 'review'
          and (a.author_id is distinct from (select auth.uid()) or public.is_admin())
      ) as articles_review,
      count(*) filter (where a.status = 'draft') as articles_draft
    from public.cultural_articles a
    where a.language_id in (select sc.id from scope sc)
      and a.status in ('draft', 'review')
    group by a.language_id
  ),
  reps as (
    select r.language_id, count(distinct (r.target_type, coalesce(r.vocabulary_id, r.article_id))) as open_reports
    from public.content_reports r
    where r.language_id in (select sc.id from scope sc)
      and r.status = 'open'
    group by r.language_id
  )
  select
    sc.id,
    sc.name,
    sc.code,
    coalesce(subs.pending_count, 0),
    subs.oldest_pending_at,
    coalesce(subs.reviewed_7d, 0),
    coalesce(subs.approved_7d, 0),
    coalesce(mods.moderator_count, 0),
    coalesce(arts.articles_review, 0),
    coalesce(arts.articles_draft, 0),
    coalesce(reps.open_reports, 0)
  from scope sc
  left join subs on subs.language_id = sc.id
  left join mods on mods.language_id = sc.id
  left join arts on arts.language_id = sc.id
  left join reps on reps.language_id = sc.id
  order by coalesce(subs.pending_count, 0) + coalesce(arts.articles_review, 0) + coalesce(reps.open_reports, 0) desc,
           subs.oldest_pending_at asc nulls last,
           sc.name;
$$;

revoke execute on function public.get_moderation_overview() from public, anon;
grant execute on function public.get_moderation_overview() to authenticated;

commit;
