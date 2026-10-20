# Menyiapkan Masuk/Daftar dengan Google

Panduan ini mengaktifkan tombol **"Masuk dengan Google"** dan **"Daftar dengan Google"** di Nusa Lingua.
Proyek Supabase: `gnislsfjiubfeszhzsog`. Kode aplikasi sudah siap; yang perlu dilakukan hanya konfigurasi di
**Google Cloud Console** dan **Supabase Dashboard**.

> Status per 19 Okt 2026: provider Google **sudah aktif** di Supabase (Client ID
> `518454541895-…9dkb.apps.googleusercontent.com`), redirect URI Supabase sudah terdaftar di Google. Selama
> provider Google mati, tombolnya otomatis tampil nonaktif dengan keterangan.

## Cara kerjanya

Aplikasi memakai **dua alur**, dipilih otomatis:

**A. Tombol resmi Google + ID token (utama)** — aktif bila `NEXT_PUBLIC_GOOGLE_CLIENT_ID` diisi.

```
[Tombol resmi Google] → popup accounts.google.com ("Lanjutkan ke localhost" / domain kamu)
                      → ID token (dengan nonce) kembali ke halaman
                      → supabase.auth.signInWithIdToken → /onboarding (akun baru) atau `next`
```

Login terjadi di domain website sendiri, sehingga layar "Pilih akun" menampilkan **domain Nusa Lingua**,
bukan `gnislsfjiubfeszhzsog.supabase.co`. Nama aplikasi "Nusa Lingua" baru muncul setelah *brand* diverifikasi
Google untuk domain produksimu (lihat langkah 1.3).

**B. Redirect OAuth (cadangan)** — dipakai bila Client ID kosong, skrip Google diblokir/gagal dimuat, atau
halaman tidak di HTTPS/localhost.

```
[Tombol Google] → accounts.google.com
              → https://gnislsfjiubfeszhzsog.supabase.co/auth/v1/callback   ← redirect URI di Google
              → http://localhost:3000/auth/callback?code=…&next=…          ← harus diizinkan di Supabase
              → exchangeCodeForSession → /onboarding (akun baru) atau `next` (mis. /beranda)
```

Daftar dan masuk memakai alur yang sama: akun yang belum ada dibuat otomatis, lalu trigger
`handle_new_user` mengisi `profiles.full_name` dan `avatar_url` dari data Google. Karena username masih kosong,
middleware mengarahkan user baru ke `/onboarding`.

---

## 1. Google Cloud Console

Buka <https://console.cloud.google.com/> dengan akun Google tim.

1. **Pilih/buat project**, misalnya `nusa-lingua`.
2. Buka **Google Auth Platform** (di UI lama: *APIs & Services → OAuth consent screen*) lalu klik **Get started**.
   - **App name:** `Nusa Lingua`
   - **User support email:** email tim
   - **Audience:** `External`
   - **Contact information:** email tim
3. **Branding** (opsional, tapi disarankan):
   - **Application home page:** `http://localhost:3000` (ganti dengan domain produksi saat rilis)
   - **Privacy policy / Terms of service:** `https://<domain-produksi>/ketentuan`
   - **Authorized domains:** `supabase.co` dan domain produksimu (jika ada)
   - Jangan unggah logo dulu — logo memicu proses verifikasi merek oleh Google.
4. **Data access → Add or remove scopes:** cukup `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
   (semuanya *non-sensitive*, tidak perlu verifikasi).
5. **Audience → Test users:** selama status *Testing*, hanya email yang didaftarkan di sini yang bisa masuk.
   Tambahkan email anggota tim dan juri. Untuk dipakai siapa pun, klik **Publish app** (dengan scope di atas,
   aplikasi tidak perlu ditinjau Google).
6. **Clients → Create client**
   - **Application type:** `Web application`
   - **Name:** `Nusa Lingua (Supabase)`
   - **Authorized JavaScript origins** (wajib untuk tombol resmi Google — alur A; harus persis sama dengan
     alamat yang dibuka di browser, termasuk port):
     - `http://localhost:3000`
     - `http://localhost` (dianjurkan Google untuk pengembangan lokal)
     - `https://<domain-produksi>` (nanti, saat deploy)
   - **Authorized redirect URIs** (harus persis sama, termasuk `https` dan tanpa garis miring di akhir):
     - `https://gnislsfjiubfeszhzsog.supabase.co/auth/v1/callback`
   - Klik **Create**, lalu salin **Client ID** dan **Client secret**. Di UI baru secret hanya ditampilkan sekali,
     jadi unduh JSON-nya dan simpan di tempat aman. **Jangan** taruh secret ini di repo atau `.env.local`.

## 2. Supabase Dashboard

Buka <https://supabase.com/dashboard/project/gnislsfjiubfeszhzsog>.

1. **Authentication → Sign In / Providers → Google**
   - Nyalakan **Enable Sign in with Google**
   - **Client IDs:** tempel Client ID dari langkah 1.6
   - **Client Secret (for OAuth):** tempel Client secret
   - Biarkan *Skip nonce checks* dan *Allow users without an email* **mati** (aplikasi mengirim nonce)
   - Alur A (`signInWithIdToken`) hanya menerima ID token yang *audience*-nya ada di kolom **Client IDs** ini.
     Jika nanti menambah client lain (mis. Android), pisahkan dengan koma.
   - Pastikan **Callback URL (for OAuth)** yang ditampilkan sama dengan redirect URI di Google, lalu **Save**
2. **Authentication → URL Configuration**
   - **Site URL:** `http://localhost:3000` (ganti ke domain produksi saat rilis)
   - **Redirect URLs** — tambahkan:
     - `http://localhost:3000/**`
     - `https://<domain-produksi>/**` (saat deploy)

   Wildcard `**` diperlukan karena aplikasi mengirim `redirectTo` lengkap dengan query, misalnya
   `/auth/callback?next=%2Fberanda`. Jika URL tidak cocok, Supabase kembali ke Site URL (`/?code=…`). Middleware
   aplikasi tetap meneruskannya ke `/auth/callback`, tetapi tujuan `next` akan hilang.
3. (Sudah aktif) **Authentication → Sign In / Providers → Email** dengan *Confirm email* menyala. Akun Google
   yang emailnya sama dengan akun email/kata sandi yang sudah terverifikasi otomatis ditautkan ke user yang sama.

## 3. Aplikasi (`.env.local`)

```env
# Wajib .supabase.co — BUKAN .supabase.com dan BUKAN URL dashboard
NEXT_PUBLIC_SUPABASE_URL=https://gnislsfjiubfeszhzsog.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable/anon key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Client ID Google (publik) — sama dengan yang ditempel di Supabase. Kosongkan untuk memakai alur B saja.
NEXT_PUBLIC_GOOGLE_CLIENT_ID=518454541895-717c41fn0b0moskpgq1272kj4iov9dkb.apps.googleusercontent.com
```

Restart `npm run dev` setelah mengubah `.env.local`. **Client secret** Google tidak pernah ditaruh di aplikasi —
hanya disimpan di Supabase. Client ID memang publik (terlihat di URL Google), jadi aman di `NEXT_PUBLIC_`.

## 4. Uji alurnya

1. Buka `http://localhost:3000/masuk`. Tombol **Masuk dengan Google** harus aktif. Jika masih ada keterangan
   "belum diaktifkan", tunggu hingga 5 menit (status di-cache) atau restart dev server.
2. **Daftar baru:** `/daftar` → *Daftar dengan Google* → pilih akun → izinkan → masuk ke `/onboarding` → selesai
   → diarahkan ke `/belajar/<kode>`.
3. **Masuk lagi:** keluar lewat menu avatar → `/masuk` → *Masuk dengan Google* → langsung ke `/beranda`.
4. **Kembali ke tujuan:** dalam keadaan keluar, buka `/beranda` → diarahkan ke `/masuk?next=%2Fberanda` → Google →
   kembali ke `/beranda`.
5. Cek di Supabase: **Authentication → Users** menampilkan provider `google`, dan tabel `profiles` berisi
   `full_name` serta `avatar_url` dari Google.

Gunakan host yang sama dari awal sampai akhir (`localhost` ≠ `127.0.0.1`, port juga harus sama), karena cookie
PKCE disimpan per origin.

## 5. Jika ada masalah

| Gejala | Penyebab & solusi |
| --- | --- |
| Tombol resmi Google tidak muncul, console: **"The given origin is not allowed for the given client ID"** | Tambahkan origin persis (mis. `http://localhost:3000`) ke *Authorized JavaScript origins* client tersebut, tunggu ±5 menit. |
| Popup Google menutup lalu muncul toast "Gagal memverifikasi akun Google" | Client ID di `.env.local` berbeda dengan yang ada di Supabase → *Client IDs*, atau *Skip nonce checks* sedang menyala. Samakan Client ID-nya. |
| Yang muncul tombol hijau-putih biasa, bukan tombol resmi Google | Alur B aktif: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` kosong, skrip `accounts.google.com/gsi/client` diblokir (ekstensi/adblock), atau halaman dibuka lewat HTTP non-localhost (mis. IP LAN). |
| Google: **Error 400: redirect_uri_mismatch** | Redirect URI di Google harus persis `https://gnislsfjiubfeszhzsog.supabase.co/auth/v1/callback`. |
| Google: **Access blocked / 403 access_denied** | Aplikasi masih *Testing* dan email belum ada di *Test users*. Tambahkan emailnya, atau *Publish app*. |
| Halaman JSON `Unsupported provider: provider is not enabled` | Google belum diaktifkan atau belum disimpan di Supabase (langkah 2.1). |
| Kembali ke `/?code=…` | `http://localhost:3000/**` belum ada di Redirect URLs (langkah 2.2). Middleware tetap menyelamatkan login, tetapi `next` hilang. |
| `/masuk` menampilkan "harus diselesaikan di browser yang sama" | Login dimulai dan diselesaikan di origin/browser berbeda (mis. `localhost` vs `127.0.0.1`, port berbeda, atau tautan dibuka di aplikasi lain). Ulangi dari satu browser. |
| `/masuk` menampilkan "dibatalkan" | User menekan *Batal* di layar izin Google — tidak apa-apa, coba lagi. |
| Semua request gagal / tombol tetap nonaktif | `NEXT_PUBLIC_SUPABASE_URL` salah. Dev server menampilkan peringatan `[Nusa Lingua] NEXT_PUBLIC_SUPABASE_URL tampak tidak valid`. |
| Setelah login selalu masuk `/onboarding` | Normal untuk akun baru: username belum diisi. |
| Produksi di balik proxy kembali ke host yang salah | `/auth/callback` memakai `x-forwarded-host`; pastikan proxy meneruskan header itu, dan domain produksi ada di Redirect URLs. |

## Peta kode

| Berkas | Peran |
| --- | --- |
| `src/components/auth/google-sign-in.tsx` | Alur A: memuat Google Identity Services, nonce SHA-256, tombol resmi (tema terang/gelap, bahasa Indonesia), `signInWithIdToken`, fallback otomatis ke alur B |
| `src/types/google-gis.d.ts` | Tipe minimal Google Identity Services |
| `src/components/auth/google-button.tsx` | Alur B: | `signInWithOAuth({ provider: "google" })`, `redirectTo` = origin saat ini + `/auth/callback?next=…`, `prompt=select_account`, tombol nonaktif bila provider mati |
| `src/lib/supabase/auth-settings.ts` | Membaca provider yang aktif dari `/auth/v1/settings` (cache 5 menit) |
| `src/app/auth/callback/route.ts` | Menukar `code` → sesi, menangani error provider (batal, kedaluwarsa, beda browser), redirect ke `next` |
| `src/lib/supabase/middleware.ts` | Refresh sesi, proteksi route, user tanpa username → `/onboarding`, penyelamat `/?code=…` |
| `supabase/migrations/0001_schema.sql` | Trigger `handle_new_user` mengisi profil dari metadata Google (`full_name`/`name`, `avatar_url`/`picture`) |
