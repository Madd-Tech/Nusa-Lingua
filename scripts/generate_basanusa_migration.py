#!/usr/bin/env python3
"""Membangkitkan supabase/migrations/0004_basanusa_content.sql dari CSV dataset.

Membaca basanusa-dataset/*.csv lalu menuliskan migration SQL yang mengisi
learning path bahasa Jawa (jv) dan Sunda (su) di skema aplikasi Nusa Lingua.

Kebijakan (sesuai keputusan proyek):
  * Hanya baris ber-sumber NusaX (lisensi CC BY-SA 4.0, wajib atribusi).
    Baris kamus-sunda (KatowProject, lisensi tak dinyatakan) DIFILTER —
    termasuk lesson Sunda yang seluruh kata intinya dari sana.
  * Append-only: data seed tidak disentuh; unit dataset disusun SETELAH
    unit seed (order_index seed = 1..2, dataset mulai 3).
  * Tipe soal dataset (semuanya pilihan ganda) + soal generate:
    listen, match, speak, translate, arrange — maksimal MAX_QUESTIONS
    soal per lesson (nyawa pemain hanya 5).
  * ID alokasi eksplisit mulai ID_BASE (seed memakai 1..33), deterministik,
    aman dijalankan ulang via `on conflict do nothing`.

Pemakaian:  python scripts/generate_basanusa_migration.py
"""

from __future__ import annotations

import csv
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "basanusa-dataset"
SEED_SQL = ROOT / "supabase" / "seed.sql"
OUT_SQL = ROOT / "supabase" / "migrations" / "0004_basanusa_content.sql"

LANG_ID = {"jv": 1, "su": 2}
LANG_NAME = {"jv": "Jawa", "su": "Sunda"}
SEED_LANG_ID = {1: "jv", 2: "su"}  # seed.sql menanam jv=1, su=2
LEVEL_MAP = {"1": "pemula", "2": "menengah", "3": "mahir"}
ALLOWED_SOURCES = {"NusaX"}

ID_BASE = 1000          # ID awal untuk semua konten dataset (seed: 1..33)
SEED_UNIT_ORDER = 2     # unit seed per bahasa (order_index 1..2)
MAX_QUESTIONS = 10      # cap soal per lesson (pemain punya 5 nyawa)


# ---------------------------------------------------------------- helpers
def norm(s: str) -> str:
    """Huruf kecil, tanpa diakritik/tanda baca, spasi dirapikan."""
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^0-9a-zA-Z]+", " ", s).lower()
    return re.sub(r"\s+", " ", s).strip()


def q(s) -> str:
    """Literal SQL: NULL untuk kosong, sisanya single-quote dengan escape."""
    if s is None or s == "":
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def read_csv(name: str) -> list[dict]:
    with open(DATASET / name, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def load_seed_vocab() -> dict:
    """(kode_bahasa, kata ternormalisasi) -> (id, kata, arti) dari seed.sql."""
    text = SEED_SQL.read_text(encoding="utf-8")
    m = re.search(r"insert into public\.vocabularies .*? values(.*?)on conflict", text, re.S)
    if not m:
        raise SystemExit("Blok insert vocabularies tidak ditemukan di seed.sql")
    out = {}
    for line in m.group(1).splitlines():
        mm = re.match(r"\s*\((\d+),\s*(\d+),\s*'(.*?)',\s*'(.*?)'", line)
        if not mm:
            continue
        vid, lid, word, meaning = int(mm.group(1)), int(mm.group(2)), mm.group(3), mm.group(4)
        key = (SEED_LANG_ID[lid], norm(word))
        if key in out:
            raise SystemExit(f"Kata seed duplikat pada seed.sql: {word}")
        out[key] = (vid, word, meaning)
    if len(out) != 29:
        raise SystemExit(f"Ekspektasi 29 kosakata seed, terbaca {len(out)} — seed.sql berubah?")
    return out


def target_word(ex: dict) -> str | None:
    """Kata bahasa daerah yang diuji oleh satu soal dataset."""
    if ex["tipe"] == "terjemah_ke_indonesia":
        mm = re.search(r"[“\"]([^”\"]+)[”\"]", ex["prompt"])
        return mm.group(1) if mm else None
    # terjemah_ke_daerah & isi_rumpang: jawaban = kata daerah
    return ex["jawaban_benar"]


def valid_mc(ex: dict) -> list | None:
    """Pilihan ganda valid: >=2 opsi unik yang memuat jawaban benar."""
    try:
        opts = json.loads(ex["pilihan"] or "")
    except (ValueError, TypeError):
        return None
    if not isinstance(opts, list) or len(opts) < 2:
        return None
    opts = [str(o) for o in opts]
    norms = [norm(o) for o in opts]
    if len(set(norms)) != len(norms):
        return None
    if norm(ex["jawaban_benar"]) not in norms:
        return None
    return opts


# ------------------------------------------------------------ pembacaan
seed_vocab = load_seed_vocab()
all_vocab = read_csv("vocabulary.csv")
all_ex = read_csv("exercises.csv")
units_raw = read_csv("units.csv")
lessons_raw = read_csv("lessons.csv")

# Sumber per kata (dari SELURUH dataset, sebelum filter) — untuk memutuskan
# apakah sebuah soal boleh dipakai: kata yang hanya ada di kamus-sunda → buang.
word_sources: dict[tuple, set] = defaultdict(set)
for r in all_vocab:
    if r["bahasa"] in LANG_ID:
        word_sources[(r["bahasa"], norm(r["kata"]))].add(r["sumber"])


def exercise_allowed(ex: dict) -> bool:
    tw = target_word(ex)
    if not tw:
        return True
    srcs = word_sources.get((ex["bahasa"], norm(tw)))
    if srcs and not (srcs & ALLOWED_SOURCES):
        return False
    return True


# Filter vocab: bahasa target + sumber NusaX + dedupe (kata+arti sama).
vocab_kept: list[dict] = []
seen_row: set = set()
dup_rows = 0
seed_skip: list[str] = []
for r in sorted(all_vocab, key=lambda x: x["id"]):
    if r["bahasa"] not in LANG_ID or r["sumber"] not in ALLOWED_SOURCES:
        continue
    row_key = (r["bahasa"], norm(r["kata"]), norm(r["arti"]))
    if row_key in seen_row:
        dup_rows += 1
        continue
    seen_row.add(row_key)
    if (r["bahasa"], norm(r["kata"])) in seed_vocab:
        seed_skip.append(f"{r['bahasa']}:{r['kata']}")
        continue  # sudah ada di seed → jangan dobel di kamus
    vocab_kept.append(r)

# Lesson & unit yang lolos (lesson minimal punya 1 kata inti yang diimpor).
inti_by_lesson: dict[str, list] = defaultdict(list)
for r in vocab_kept:
    if r["peran"] == "inti" and r["lesson_id"]:
        inti_by_lesson[r["lesson_id"]].append(r)
# Kata seed yang tertaut lesson dataset tetap dipakai untuk generate soal
# (mis. 'matur nuwun' di-skip dari insert ke kamus tapi tetap anggota lesson).
seed_lesson_words: dict[str, list] = defaultdict(list)
for r in all_vocab:
    if r["bahasa"] not in LANG_ID or r["peran"] != "inti" or not r["lesson_id"]:
        continue
    hit = seed_vocab.get((r["bahasa"], norm(r["kata"])))
    if hit and norm(hit[2]) == norm(r["arti"]):  # kata + arti identik dengan seed
        vid, sw, sm = hit
        seed_lesson_words[r["lesson_id"]].append(
            {"kata": sw, "arti": sm, "id": vid,
             "contoh_kalimat": r["contoh_kalimat"], "contoh_arti": r["contoh_arti"]}
        )

# Lesson hanya dipertahankan bila punya >=1 kata inti NusaX yang benar-benar
# diimpor. Kata seed yang kebetulan sama dengan baris dataset TIDAK menghidupkan
# lesson — agar unit tanpa konten NusaX (mis. u0093 Kosakata Umum) tetap gugur.
kept_lessons = set(inti_by_lesson) & {l["id"] for l in lessons_raw}

kept_units = {
    u["id"]
    for u in units_raw
    if u["bahasa"] in LANG_ID and any(l["unit_id"] == u["id"] for l in lessons_raw if l["id"] in kept_lessons)
}

dropped_lessons = [
    l for l in lessons_raw if l["bahasa"] in LANG_ID and l["id"] not in kept_lessons
]
dropped_units = [u for u in units_raw if u["bahasa"] in LANG_ID and u["id"] not in kept_units]

# ------------------------------------------------------------ alokasi ID
units = sorted([u for u in units_raw if u["id"] in kept_units], key=lambda u: (u["bahasa"], int(u["urutan"])))
unit_id: dict[str, int] = {}
unit_order: dict[str, dict[str, int]] = defaultdict(dict)
for i, u in enumerate(units):
    unit_id[u["id"]] = ID_BASE + i
    unit_order[u["bahasa"]][u["id"]] = SEED_UNIT_ORDER + 1 + sum(
        1 for x in units if x["bahasa"] == u["bahasa"] and int(x["urutan"]) < int(u["urutan"])
    )

lessons = sorted(
    [l for l in lessons_raw if l["id"] in kept_lessons],
    key=lambda l: (l["bahasa"], unit_id[l["unit_id"]], int(l["urutan"])),
)
lesson_id: dict[str, int] = {}
lesson_seq: dict[str, int] = defaultdict(int)
for i, l in enumerate(lessons):
    lesson_id[l["id"]] = ID_BASE + i
    lesson_seq[l["unit_id"]] += 1
    l["_order"] = lesson_seq[l["unit_id"]]

vocab_id: dict[str, int] = {}
for i, r in enumerate(vocab_kept):
    vocab_id[r["id"]] = ID_BASE + i

# Peta resolusi kata -> id (seed didahulukan; baris seed-dup sudah di-skip).
word_id: dict[tuple, int] = {}
word_meaning_id: dict[tuple, int] = {}
for key, (vid, _w, _m) in seed_vocab.items():
    word_id[key] = vid
for r in vocab_kept:
    word_id.setdefault((r["bahasa"], norm(r["kata"])), vocab_id[r["id"]])
    word_meaning_id.setdefault(
        (r["bahasa"], norm(r["kata"]), norm(r["arti"])), vocab_id[r["id"]]
    )


def link_vocab(ex: dict) -> int | None:
    tw = target_word(ex)
    if not tw:
        return None
    lang = ex["bahasa"]
    if ex["tipe"] == "terjemah_ke_indonesia":
        return word_meaning_id.get((lang, norm(tw), norm(ex["jawaban_benar"]))) or word_id.get(
            (lang, norm(tw))
        )
    return word_id.get((lang, norm(tw)))


# ------------------------------------------------------------ pool pendukung
lang_words: dict[str, list] = defaultdict(list)   # semua kata terimpor (kamus)
lang_inti: dict[str, list] = defaultdict(list)    # kata inti untuk distractor
for r in vocab_kept:
    lang_words[r["bahasa"]].append({"kata": r["kata"], "arti": r["arti"], "id": vocab_id[r["id"]]})
    if r["peran"] == "inti":
        lang_inti[r["bahasa"]].append({"kata": r["kata"], "arti": r["arti"], "id": vocab_id[r["id"]]})

lesson_pool: dict[str, list] = defaultdict(list)  # kata inti per lesson (termasuk seed-dup)
for r in vocab_kept:
    if r["peran"] == "inti" and r["lesson_id"] and r["lesson_id"] in kept_lessons:
        lesson_pool[r["lesson_id"]].append(
            {"kata": r["kata"], "arti": r["arti"], "id": vocab_id[r["id"]],
             "contoh_kalimat": r["contoh_kalimat"], "contoh_arti": r["contoh_arti"]}
        )
for lid, rows in seed_lesson_words.items():
    if lid in kept_lessons:
        have = {norm(w["kata"]) for w in lesson_pool[lid]}
        lesson_pool[lid].extend(w for w in rows if norm(w["kata"]) not in have)
        lesson_pool[lid].sort(key=lambda w: w["kata"])  # deterministik


def pick_options(correct: str, pool: list, key: str, limit: int = 4) -> list:
    """Kumpulkan opsi unik (normalisasi) berisi `correct` + distraktor dari pool."""
    seen = {norm(correct)}
    opts = [correct]
    for cand in pool:
        v = cand[key]
        if v and norm(v) not in seen:
            seen.add(norm(v))
            opts.append(v)
            if len(opts) >= limit:
                break
    return opts


# ------------------------------------------------------------ generate soal
def generate_questions(l: dict) -> list[dict]:
    """Soal non-MC untuk satu lesson (deterministik)."""
    lid = l["id"]
    lang = l["bahasa"]
    words = lesson_pool.get(lid, [])
    lang_name = LANG_NAME[lang]
    out: list[dict] = []
    if not words:
        return out

    # listen: dengar kata (TTS dari vocabulary.word) → pilih artinya
    listen_t = next(
        (w for w in words if norm(w["arti"]) and norm(w["arti"]) != norm(w["kata"])), None
    ) or next((w for w in words if norm(w["arti"])), None)
    if listen_t:
        opts = pick_options(listen_t["arti"], [w for w in words if w is not listen_t] + lang_inti[lang], "arti")
        if len(opts) >= 2:
            out.append({"type": "listen", "prompt": "Dengarkan, lalu pilih artinya.",
                        "options": opts, "correct": listen_t["arti"], "vocab": listen_t["id"]})

    # match: pasangkan kata ↔ arti (maks 4 pasang; kata & arti unik, bukan diri sendiri)
    pairs, seen_arti, seen_kata = [], set(), set()
    for w in words:
        na, nk = norm(w["arti"]), norm(w["kata"])
        # lewati: arti sudah terpakai, kata sama (polisemi), atau kata = artinya
        if not w["arti"] or not na or na in seen_arti or nk in seen_kata or nk == na:
            continue
        seen_arti.add(na)
        seen_kata.add(nk)
        pairs.append({"left": w["kata"], "right": w["arti"]})
        if len(pairs) >= 4:
            break
    if len(pairs) >= 2:
        out.append({"type": "match", "prompt": "Pasangkan kata dengan artinya.",
                    "options": pairs, "correct": "Semua pasangan", "vocab": None})

    # translate: tulis kata daerah untuk arti Indonesia (word bank)
    tr = next(
        (w for w in words if w is not listen_t and 0 < len(w["arti"]) <= 30
         and "(" not in w["arti"] and norm(w["arti"]) != norm(w["kata"])),
        None,
    ) or next((w for w in words if 0 < len(w["arti"]) <= 30), None)
    if tr:
        group = [w for w in words if norm(w["arti"]) == norm(tr["arti"])]
        correct = "|".join(w["kata"] for w in group)
        opts = pick_options(
            tr["kata"], [w for w in words if norm(w["arti"]) != norm(tr["arti"])] + lang_inti[lang], "kata"
        )
        if len(opts) >= 2:
            out.append({"type": "translate",
                        "prompt": f'Terjemahkan ke bahasa {lang_name}: “{tr["arti"]}”',
                        "options": opts, "correct": correct, "vocab": tr["id"]})

    # speak: ucapkan kata (ditampilkan di kartu)
    sp = words[1] if len(words) > 1 else words[0]
    out.append({"type": "speak", "prompt": "Ucapkan kata ini dengan jelas.",
                "options": None, "correct": sp["kata"], "vocab": sp["id"]})

    # arrange: susun kalimat dari contoh (3-9 kata + terjemahnya)
    for w in words:
        ex_s, ex_a = (w.get("contoh_kalimat") or "").strip(), (w.get("contoh_arti") or "").strip()
        n = len(ex_s.split()) if ex_s else 0
        if ex_s and ex_a and 3 <= n <= 9:
            out.append({"type": "arrange", "prompt": f"Susun kalimat: “{ex_a}”",
                        "options": ex_s.split(), "correct": ex_s, "vocab": w["id"]})
            break
    return out


# ------------------------------------------------------------ soal dataset
stats: Counter = Counter()
mc_by_lesson: dict[str, list] = defaultdict(list)
for ex in sorted(all_ex, key=lambda x: x["id"]):
    if ex["bahasa"] not in LANG_ID:
        continue
    if ex["lesson_id"] not in kept_lessons:
        stats["buang: lesson gugur"] += 1
        continue
    if not exercise_allowed(ex):
        stats["buang: kata kamus-sunda"] += 1
        continue
    opts = valid_mc(ex)
    if opts is None:
        stats["buang: pilihan tak valid"] += 1
        continue
    mc_by_lesson[ex["lesson_id"]].append(
        {"type": "multiple_choice", "prompt": ex["prompt"], "options": opts,
         "correct": ex["jawaban_benar"], "vocab": link_vocab(ex), "tipe_src": ex["tipe"]}
    )
    stats["simpan: soal dataset"] += 1


def sample_mc(cands: list, budget: int) -> list:
    """Ambil maks `budget` MC dengan round-robin antar tipe sumber (jaga variasi)."""
    if budget <= 0:
        return []
    buckets: dict[str, list] = defaultdict(list)
    for c in cands:
        buckets[c.pop("tipe_src")].append(c)
    keys = sorted(buckets)
    picked = []
    while len(picked) < budget:
        grew = False
        for k in keys:
            if buckets[k] and len(picked) < budget:
                picked.append(buckets[k].pop(0))
                grew = True
        if not grew:
            break
    return picked


# ------------------------------------------------------------ gabung & cap
all_questions: list[tuple] = []  # (lesson_db_id, order_index, soal)
for l in lessons:
    gen = generate_questions(l)
    budget = MAX_QUESTIONS - len(gen)
    mc = sample_mc(mc_by_lesson.get(l["id"], []), budget)
    stats["trim: MC kena cap"] += len(mc_by_lesson.get(l["id"], [])) - len(mc)
    for g in gen:
        stats[f"generate: {g['type']}"] += 1

    # Sebar soal generate secara merata di antara MC (deterministik).
    n_total, n_gen = len(mc) + len(gen), len(gen)
    merged: list = [None] * n_total
    if n_gen:
        step = n_total / n_gen
        for k, g in enumerate(gen):
            merged[int(k * step)] = ("gen", g)
    mi = iter(mc)
    for i, slot in enumerate(merged):
        if slot is None:
            merged[i] = ("mc", next(mi))
    for order, (_kind, qsn) in enumerate(merged, start=1):
        all_questions.append((lesson_id[l["id"]], order, qsn))

# ------------------------------------------------------------ emit SQL
def sql_options(opts) -> str:
    if opts is None:
        return "NULL"
    return q(json.dumps(opts, ensure_ascii=False))


lines: list[str] = []
lines.append("-- " + "=" * 68)
lines.append("-- Nusa Lingua — konten learning path Jawa & Sunda dari basanusa-dataset")
lines.append("-- DIBUAT OTOMATIS oleh scripts/generate_basanusa_migration.py — jangan diedit manual.")
lines.append("--")
lines.append("-- Sumber data: basanusa-dataset/ (hanya baris ber-sumber NusaX).")
lines.append("--   NusaX: Multilingual Parallel Sentiment Dataset for 10 Indonesian Local")
lines.append("--   Languages (EACL 2023) — https://github.com/IndoNLP/nusax")
lines.append("--   Lisensi CC BY-SA 4.0. Atribusi ini WAJIB disebut (README & footer aplikasi).")
lines.append("--   Baris kamus-sunda (KatowProject) TIDAK disertakan: lisensinya tidak")
lines.append("--   dinyatakan. Akibatnya sebagian lesson & soal Sunda ikut dibuang.")
lines.append("--")
lines.append("-- Prasyarat : 0001_schema.sql → 0002_storage.sql → seed.sql sudah dijalankan.")
lines.append("-- Aman ulang : ya (on conflict do nothing).")
lines.append("--")
lines.append(f"-- Isi       : {len(units)} unit · {len(lessons)} lesson · "
             f"{len(vocab_kept)} kosakata · {len(all_questions)} soal "
             f"(cap {MAX_QUESTIONS} soal/lesson).")
lines.append("-- " + "=" * 68)
lines.append("")
lines.append("begin;")
lines.append("")

lines.append("-- ---------------------------------------------------------------------")
lines.append("-- Unit (order_index lanjutan setelah unit seed yang bernilai 1..2)")
lines.append("-- ---------------------------------------------------------------------")
lines.append("insert into public.units (id, language_id, title, description, level, order_index) values")
rows = []
for u in units:
    rows.append(
        f"  ({unit_id[u['id']]}, {LANG_ID[u['bahasa']]}, {q(u['judul'])}, {q(u['deskripsi'])}, "
        f"{q(LEVEL_MAP.get(u['level'], 'pemula'))}, {unit_order[u['bahasa']][u['id']]})"
    )
lines.append(",\n".join(rows))
lines.append("on conflict (id) do nothing;")
lines.append("")

lines.append("-- ---------------------------------------------------------------------")
lines.append("-- Lesson")
lines.append("-- ---------------------------------------------------------------------")
lines.append("insert into public.lessons (id, unit_id, title, order_index, xp_reward) values")
rows = []
for l in lessons:
    xp = int(l["xp_reward"]) if l["xp_reward"].isdigit() and int(l["xp_reward"]) >= 0 else 10
    rows.append(f"  ({lesson_id[l['id']]}, {unit_id[l['unit_id']]}, {q(l['judul'])}, {l['_order']}, {xp})")
lines.append(",\n".join(rows))
lines.append("on conflict (id) do nothing;")
lines.append("")

lines.append("-- ---------------------------------------------------------------------")
lines.append("-- Kosakata (inti + varian; peran & source menyimpan metadata dataset)")
lines.append("-- ---------------------------------------------------------------------")
lines.append(
    "insert into public.vocabularies "
    "(id, language_id, word, meaning_id, speech_level, example_sentence, "
    "category, meaning_en, example_meaning, peran, source) values"
)
rows = []
for r in vocab_kept:
    speech = r["tingkat_kesopanan"] if r["tingkat_kesopanan"] not in ("", "netral") else None
    category = r["kategori"].replace("-", " ") if r["kategori"] else None
    rows.append(
        f"  ({vocab_id[r['id']]}, {LANG_ID[r['bahasa']]}, {q(r['kata'])}, {q(r['arti'])}, "
        f"{q(speech)}, {q(r['contoh_kalimat'])}, {q(category)}, {q(r['arti_en'])}, "
        f"{q(r['contoh_arti'])}, {q(r['peran'] or 'inti')}, {q(r['sumber'])})"
    )
lines.append(",\n".join(rows))
lines.append("on conflict (id) do nothing;")
lines.append("")

lines.append("-- ---------------------------------------------------------------------")
lines.append("-- Soal (dataset = multiple_choice; sisanya hasil generate)")
lines.append("-- ---------------------------------------------------------------------")
lines.append(
    "insert into public.questions "
    "(id, lesson_id, vocabulary_id, type, prompt, options, correct_answer, order_index) values"
)
rows = []
for i, (lid_db, order, s) in enumerate(all_questions):
    rows.append(
        f"  ({ID_BASE + i}, {lid_db}, {s['vocab'] if s['vocab'] is not None else 'NULL'}, "
        f"{q(s['type'])}, {q(s['prompt'])}, {sql_options(s['options'])}, "
        f"{q(s['correct'])}, {order})"
    )
lines.append(",\n".join(rows))
lines.append("on conflict (id) do nothing;")
lines.append("")

lines.append("-- Kosakata lama (seed) diberi label sumber agar atribusi bisa dicek.")
lines.append("update public.vocabularies set source = 'seed' where source is null;")
lines.append("")
for table in ("units", "lessons", "vocabularies", "questions"):
    lines.append(
        f"select setval(pg_get_serial_sequence('public.{table}', 'id'), "
        f"(select max(id) from public.{table}));"
    )
lines.append("")
lines.append("commit;")
lines.append("")

OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
OUT_SQL.write_text("\n".join(lines), encoding="utf-8")

# ------------------------------------------------------------ ringkasan
print(f"Tulis {OUT_SQL.relative_to(ROOT)}")
print(f"  unit      : {len(units)} (gugur: {len(dropped_units)} — "
      f"{', '.join(u['judul'] for u in dropped_units) or '-'})")
print(f"  lesson    : {len(lessons)} (gugur: {len(dropped_lessons)})")
print(f"  kosakata  : {len(vocab_kept)} (dup: {dup_rows}, tumpang seed: {', '.join(seed_skip) or '-'})")
print(f"  soal      : {len(all_questions)}")
for k in sorted(stats):
    print(f"    {k}: {stats[k]}")
lang_of_lesson = {lesson_id[l["id"]]: l["bahasa"] for l in lessons}
for code in LANG_ID:
    n_u = sum(1 for u in units if u["bahasa"] == code)
    n_l = sum(1 for l in lessons if l["bahasa"] == code)
    n_v = sum(1 for r in vocab_kept if r["bahasa"] == code)
    n_q = sum(1 for lid, _o, _s in all_questions if lang_of_lesson.get(lid) == code)
    print(f"  [{code}] unit {n_u} · lesson {n_l} · kosakata {n_v} · soal {n_q}")

if dropped_lessons:
    print(f"PERHATIAN: {len(dropped_lessons)} lesson dibuang (kata intinya dari kamus-sunda).")
sys.exit(0)
