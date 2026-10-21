/**
 * Upsert artikel budaya baru ke Supabase.
 *
 * Jalankan:
 *   node scripts/seed-artikel.mjs
 *   node scripts/seed-artikel.mjs --dry-run   # hanya menampilkan data
 *
 * Membutuhkan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY
 * (dibaca dari .env di root project).
 */
import fs from "node:fs";
import path from "node:path";
import { ARTIKEL_BARU } from "./artikel-budaya.mjs";

function loadEnv() {
  const file = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env",
  );
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");

const rows = ARTIKEL_BARU.map(({ slug, title, category, region_id, language_id, summary, content }) => ({
  slug,
  title,
  category,
  region_id,
  language_id,
  summary,
  content,
  is_published: true,
}));

if (dryRun) {
  console.log(`Dry run: ${rows.length} artikel siap di-upsert.`);
  for (const row of rows) {
    console.log(`- [${row.category}] ${row.slug} — ${row.title}`);
  }
  process.exit(0);
}

const res = await fetch(
  `${url}/rest/v1/cultural_articles?on_conflict=slug&select=id,slug,title,category,is_published`,
  {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
  },
);

if (!res.ok) {
  console.error(`Gagal upsert artikel (${res.status}):`, await res.text());
  process.exit(1);
}

const saved = await res.json();
console.log(`Berhasil upsert ${saved.length} artikel:`);
for (const article of saved) {
  console.log(`- [${article.category}] ${article.slug} (id ${article.id}) — ${article.title}`);
}
