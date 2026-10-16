-- =====================================================================
-- Nusa Lingua — Storage
--   audio   : rekaman kontribusi   → <user_id>/<timestamp>.webm
--   avatars : foto profil unggahan → <user_id>/<timestamp>.<ext>
-- Kedua bucket publik (dibaca lewat public URL). User hanya boleh
-- menulis/menghapus di folder dengan nama user_id miliknya sendiri.
-- =====================================================================

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('audio', 'audio', true, 2097152, array['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav']),
  ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Unggah ke folder sendiri (audio & avatars)"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('audio', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Lihat berkas sendiri (audio & avatars)"
  on storage.objects for select to authenticated
  using (
    bucket_id in ('audio', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Hapus berkas sendiri (audio & avatars)"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('audio', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
