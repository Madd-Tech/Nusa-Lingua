-- =====================================================================
-- Nusa Lingua — CMS artikel budaya (Fase C, lihat docs/rancangan-moderator.md)
--
--   status      draft → review → published → archived (transisi ditegakkan trigger)
--   penulis     author_id diisi otomatis dari auth.uid() saat moderator membuat draf
--   empat mata  penulis tidak bisa menerbitkan tulisannya sendiri (kecuali admin)
--   rujukan     kolom sources (Markdown)
--   sampul      bucket publik `budaya` (<user_id>/<timestamp>.<ext>, maks. 5 MB)
--
-- `is_published` dipertahankan sebagai kolom turunan (status = 'published'),
-- sehingga query & policy baca publik yang lama tetap jalan. Akibatnya kolom
-- ini TIDAK bisa diisi lagi: seed & skrip harus mengisi `status`.
--
-- Perubahan oleh service role / SQL Editor (auth.uid() NULL) tidak dibatasi
-- aturan transisi dan tidak dicatat di moderation_log.
--
-- Jalankan SEKALI setelah 0006_moderation_dashboard.sql.
-- =====================================================================

begin;

create type public.article_status as enum ('draft', 'review', 'published', 'archived');

-- ---------------------------------------------------------------------
-- Kolom
-- ---------------------------------------------------------------------
alter table public.cultural_articles
  add column status public.article_status not null default 'draft',
  add column author_id uuid references public.profiles (id) on delete set null,
  add column sources text check (char_length(sources) <= 4000),
  add column review_note text check (char_length(review_note) <= 500),
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz,
  add column updated_by uuid references public.profiles (id) on delete set null,
  add column published_at timestamptz,
  add column published_by uuid references public.profiles (id) on delete set null;

update public.cultural_articles
   set status = case when is_published then 'published'::public.article_status else 'draft' end,
       published_at = case when is_published then now() end;

-- is_published → kolom turunan. Index & policy yang bergantung padanya dibuat ulang.
drop policy "Artikel terbit dapat dibaca" on public.cultural_articles;
alter table public.cultural_articles drop column is_published;
alter table public.cultural_articles
  add column is_published boolean generated always as (status = 'published') stored;

create index articles_published_idx on public.cultural_articles (is_published, category);
create index articles_status_idx on public.cultural_articles (status, language_id, updated_at desc);
create index articles_author_idx on public.cultural_articles (author_id);

-- Batas panjang untuk tulisan baru/diubah (NOT VALID: baris lama tidak dicek ulang).
alter table public.cultural_articles
  add constraint articles_title_length check (char_length(btrim(title)) between 5 and 160) not valid,
  add constraint articles_summary_length check (char_length(summary) <= 300) not valid,
  add constraint articles_content_length check (char_length(content) <= 60000) not valid;

-- ---------------------------------------------------------------------
-- Trigger
-- ---------------------------------------------------------------------

-- Draf baru dari client: penulis = auth.uid(), status selalu draft.
create or replace function public.articles_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    new.author_id := (select auth.uid());
    new.status := 'draft';
    new.review_note := null;
    new.published_at := null;
    new.published_by := null;
  elsif new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  new.created_at := coalesce(new.created_at, now());
  return new;
end;
$$;

create trigger articles_before_insert
  before insert on public.cultural_articles
  for each row execute function public.articles_before_insert();

-- Transisi status + empat mata + jejak perubahan.
create or replace function public.articles_before_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_admin boolean := public.is_admin();
  v_note text := nullif(btrim(coalesce(new.review_note, '')), '');
begin
  new.updated_at := now();

  -- Service role / SQL Editor: bebas, cukup lengkapi published_at.
  if v_user is null then
    if new.status = 'published' and old.status is distinct from 'published' then
      new.published_at := coalesce(new.published_at, now());
    end if;
    return new;
  end if;

  new.updated_by := v_user;

  -- URL artikel yang pernah terbit tidak boleh berubah.
  if old.published_at is not null and new.slug is distinct from old.slug then
    raise exception 'Slug artikel yang pernah terbit tidak bisa diubah' using errcode = 'NL422';
  end if;

  if new.status is not distinct from old.status then
    -- Catatan peninjau hanya berubah lewat transisi status.
    new.review_note := old.review_note;
    return new;
  end if;

  if old.status = 'draft' and new.status = 'review' then
    new.review_note := null;
  elsif old.status = 'review' and new.status = 'draft' then
    if old.author_id is distinct from v_user then
      if v_note is null then
        raise exception 'Tulis catatan untuk penulis sebelum mengembalikan artikel' using errcode = 'NL422';
      end if;
      new.review_note := v_note;
    else
      new.review_note := null;
    end if;
  elsif old.status = 'review' and new.status = 'published' then
    if old.author_id = v_user and not v_admin then
      raise exception 'Artikelmu sendiri harus diterbitkan moderator lain' using errcode = '42501';
    end if;
    new.published_at := now();
    new.published_by := v_user;
    new.review_note := null;
  elsif old.status = 'published' and new.status in ('draft', 'archived') then
    new.review_note := null;
  elsif old.status = 'archived' and new.status = 'draft' then
    new.review_note := null;
  else
    raise exception 'Status artikel tidak bisa diubah dari % ke %', old.status, new.status using errcode = 'NL422';
  end if;

  return new;
end;
$$;

create trigger articles_before_update
  before update on public.cultural_articles
  for each row execute function public.articles_before_update();

-- Catat tindakan moderator (perubahan oleh service role tidak dicatat).
create or replace function public.articles_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changed text[];
begin
  if (select auth.uid()) is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    perform public.log_moderation('article_created', new.language_id, 'article', new.id::text,
      jsonb_build_object('title', new.title));
  elsif tg_op = 'DELETE' then
    perform public.log_moderation('article_deleted', old.language_id, 'article', old.id::text,
      jsonb_build_object('title', old.title));
  elsif new.status is distinct from old.status then
    perform public.log_moderation('article_status_changed', new.language_id, 'article', new.id::text,
      jsonb_build_object('title', new.title, 'from', old.status, 'to', new.status, 'note', new.review_note));
  else
    select coalesce(array_agg(f), '{}') into v_changed
    from unnest(array[
      case when new.title is distinct from old.title then 'title' end,
      case when new.slug is distinct from old.slug then 'slug' end,
      case when new.category is distinct from old.category then 'category' end,
      case when new.summary is distinct from old.summary then 'summary' end,
      case when new.content is distinct from old.content then 'content' end,
      case when new.cover_url is distinct from old.cover_url then 'cover_url' end,
      case when new.sources is distinct from old.sources then 'sources' end,
      case when new.language_id is distinct from old.language_id then 'language_id' end,
      case when new.region_id is distinct from old.region_id then 'region_id' end
    ]) as f
    where f is not null;

    if cardinality(v_changed) > 0 then
      perform public.log_moderation('article_updated', new.language_id, 'article', new.id::text,
        jsonb_build_object('title', new.title, 'fields', to_jsonb(v_changed)));
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger articles_after_change
  after insert or update or delete on public.cultural_articles
  for each row execute function public.articles_after_change();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
create policy "Artikel terbit dapat dibaca" on public.cultural_articles
  for select to anon, authenticated
  using (is_published);

create policy "Moderator melihat artikel bahasanya" on public.cultural_articles
  for select to authenticated
  using (
    language_id in (select public.moderated_language_ids())
    or (language_id is null and (select public.is_admin()))
  );

-- author_id & status diisi trigger; policy memastikan hasil akhirnya.
create policy "Moderator menulis draf" on public.cultural_articles
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and status = 'draft'
    and (language_id in (select public.moderated_language_ids()) or (language_id is null and (select public.is_admin())))
  );

create policy "Moderator mengubah artikel bahasanya" on public.cultural_articles
  for update to authenticated
  using (language_id in (select public.moderated_language_ids()) or (language_id is null and (select public.is_admin())))
  with check (language_id in (select public.moderated_language_ids()) or (language_id is null and (select public.is_admin())));

create policy "Hapus draf sendiri" on public.cultural_articles
  for delete to authenticated
  using (
    status = 'draft'
    and (author_id = (select auth.uid()) or (select public.is_admin()))
    and (language_id in (select public.moderated_language_ids()) or (language_id is null and (select public.is_admin())))
  );

-- Hak kolom: client hanya mengisi isi artikel; jejak & penerbitan diisi trigger.
revoke insert, update, delete on public.cultural_articles from anon, authenticated;
grant insert (title, slug, category, summary, content, cover_url, region_id, language_id, sources)
  on public.cultural_articles to authenticated;
grant update (title, slug, category, summary, content, cover_url, region_id, language_id, sources, status, review_note)
  on public.cultural_articles to authenticated;
grant delete on public.cultural_articles to authenticated;

revoke execute on function public.articles_before_insert() from public, anon, authenticated;
revoke execute on function public.articles_before_update() from public, anon, authenticated;
revoke execute on function public.articles_after_change() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Storage: sampul & gambar isi artikel
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('budaya', 'budaya', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Moderator mengunggah gambar budaya"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'budaya'
    and (select public.is_moderator())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Moderator melihat gambar budaya sendiri"
  on storage.objects for select to authenticated
  using (bucket_id = 'budaya' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Moderator menghapus gambar budaya sendiri"
  on storage.objects for delete to authenticated
  using (bucket_id = 'budaya' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------------
-- Dashboard: tambah hitungan artikel ke get_moderation_overview
--   articles_review  artikel menunggu tinjauan yang bisa ia terbitkan (bukan tulisannya, kecuali admin)
--   articles_draft   draf di bahasa itu
-- ---------------------------------------------------------------------
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
  articles_draft bigint
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
    coalesce(arts.articles_draft, 0)
  from scope sc
  left join subs on subs.language_id = sc.id
  left join mods on mods.language_id = sc.id
  left join arts on arts.language_id = sc.id
  order by coalesce(subs.pending_count, 0) + coalesce(arts.articles_review, 0) desc,
           subs.oldest_pending_at asc nulls last,
           sc.name;
$$;

revoke execute on function public.get_moderation_overview() from public, anon;
grant execute on function public.get_moderation_overview() to authenticated;

commit;
