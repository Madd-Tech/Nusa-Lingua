"""Verifier menyeluruh untuk supabase/migrations/0004_basanusa_content.sql.

Mem-parse tiap tuple INSERT dan memvalidasi:
  * struktur SQL (begin/commit, on conflict, setval, id unik >= 1000)
  * referensi antar-tabel (unit -> lesson -> question, vocab -> question)
  * aturan main aplikasi per tipe soal (opsi, jawaban, pair match, token arrange)
  * cap 10 soal/lesson, order_index kontigu, enum valid
"""
import json
import re
import unicodedata
import sys
from collections import Counter, defaultdict
from pathlib import Path

SQL_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else (
    Path(__file__).resolve().parents[1] / "supabase" / "migrations" / "0004_basanusa_content.sql")
SQL = SQL_PATH.read_text(encoding="utf-8")
errors: list[str] = []
warns: list[str] = []


def norm(s):
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^0-9a-zA-Z]+", " ", s).lower()
    return re.sub(r"\s+", " ", s).strip()


def parse_tuple(line):
    s = line.strip().rstrip(",")
    assert s.startswith("(") and s.endswith(")"), line
    s = s[1:-1]
    vals, i, n = [], 0, len(s)
    while i < n:
        while i < n and s[i] in " \n":
            i += 1
        if i >= n:
            break
        if s.startswith("NULL", i) and (i + 4 >= n or s[i + 4] in " ,"):
            vals.append(None)
            i += 4
        elif s[i] == "'":
            i += 1
            buf = []
            while i < n:
                if s[i] == "'":
                    if i + 1 < n and s[i + 1] == "'":
                        buf.append("'")
                        i += 2
                        continue
                    i += 1
                    break
                buf.append(s[i])
                i += 1
            vals.append("".join(buf))
        else:
            j = i
            while j < n and s[j] != ",":
                j += 1
            tok = s[i:j].strip()
            vals.append(int(tok) if re.fullmatch(r"-?\d+", tok) else tok)
            i = j
        while i < n and s[i] in " \n":
            i += 1
        if i < n and s[i] == ",":
            i += 1
    return vals


def parse_section(table):
    m = re.search(rf"insert into public\.{table} \(([^)]*)\) values\n", SQL)
    if not m:
        errors.append(f"INSERT {table} tidak ditemukan")
        return [], []
    cols = [c.strip() for c in m.group(1).split(",")]
    rows = []
    for line in SQL[m.end():].split("\n"):
        if line.startswith("on conflict"):
            break
        if line.strip():
            rows.append(parse_tuple(line))
    return cols, rows


ucols, units = parse_section("units")
lcols, lessons = parse_section("lessons")
vcols, vocabs = parse_section("vocabularies")
qcols, questions = parse_section("questions")

if not SQL.startswith("-- ="):
    errors.append("header atribusi hilang")
if not re.search(r"^begin;$", SQL, re.M) or not re.search(r"^commit;$", SQL, re.M):
    errors.append("begin/commit hilang")
if "on conflict (id) do nothing;" not in SQL:
    errors.append("on conflict hilang")
print(f"units={len(units)} lessons={len(lessons)} vocab={len(vocabs)} questions={len(questions)}")

for t, r in (("units", units), ("lessons", lessons), ("vocabularies", vocabs), ("questions", questions)):
    ids = [row[0] for row in r]
    if len(ids) != len(set(ids)):
        errors.append(f"{t}: id duplikat")
    if ids and min(ids) < 1000:
        errors.append(f"{t}: id < 1000 (tumpang seed)")

unit_ids = {u[0] for u in units}
if any(u[1] not in (1, 2) for u in units):
    errors.append("unit language_id aneh")
if any(u[4] not in ("pemula", "menengah", "mahir") for u in units):
    errors.append("level enum invalid")
by_lang = defaultdict(list)
for u in units:
    by_lang[u[1]].append(u[5])
for lang, orders in by_lang.items():
    if sorted(orders) != list(range(3, 3 + len(orders))):
        errors.append(f"unit order_index bahasa {lang} tak kontigu 3..: {sorted(orders)}")

lesson_ids = {l[0] for l in lessons}
if any(l[1] not in unit_ids for l in lessons):
    errors.append("lesson unit_id menggantung")
seq = defaultdict(list)
for l in lessons:
    seq[l[1]].append(l[3])
for uid, orders in seq.items():
    if sorted(orders) != list(range(1, len(orders) + 1)):
        errors.append(f"lesson order unit {uid} tak 1..n: {sorted(orders)}")
if any(l[4] < 0 for l in lessons):
    errors.append("xp_reward negatif")

vocab_ids = {v[0] for v in vocabs}
vc = {name: i for i, name in enumerate(vcols)}
speech_vals, peran_vals, src_vals = set(), set(), set()
for v in vocabs:
    if v[vc["language_id"]] not in (1, 2):
        errors.append("vocab language_id aneh")
    peran_vals.add(v[vc["peran"]])
    src_vals.add(v[vc["source"]])
    speech_vals.add(v[vc["speech_level"]])
    if not v[vc["word"]] or not v[vc["meaning_id"]]:
        errors.append(f"vocab {v[0]} word/meaning kosong")
if not peran_vals <= {"inti", "varian"}:
    errors.append(f"peran invalid: {peran_vals}")
if src_vals != {"NusaX"}:
    errors.append(f"source tak seragam: {src_vals}")
print("speech_level:", speech_vals, "| peran:", peran_vals, "| source:", src_vals)

qtype_ok = {"multiple_choice", "translate", "listen", "match", "arrange", "speak"}
per_lesson = defaultdict(list)
qc = {name: i for i, name in enumerate(qcols)}
for q in questions:
    qid, lid, vid, typ, prompt, opts, correct, order = q
    if lid not in lesson_ids:
        errors.append(f"soal {qid}: lesson menggantung")
    if vid is not None and vid not in vocab_ids:
        errors.append(f"soal {qid}: vocab menggantung")
    if typ not in qtype_ok:
        errors.append(f"soal {qid}: tipe {typ} di luar enum")
    if not prompt or not correct:
        errors.append(f"soal {qid}: prompt/answer kosong")
    per_lesson[lid].append((order, typ, opts, correct, vid))
    if opts is not None:
        try:
            parsed = json.loads(opts)
        except Exception as e:  # noqa: BLE001
            errors.append(f"soal {qid}: options bukan JSON valid ({e})")
            continue
        if typ in ("multiple_choice", "listen"):
            if not isinstance(parsed, list) or len(parsed) < 2:
                errors.append(f"soal {qid}: opsi < 2")
            else:
                acc = {norm(x) for x in correct.split("|")}
                hits = [o for o in parsed if norm(o) in acc]
                if not hits:
                    errors.append(f"soal {qid} ({typ}): jawaban tak ada di opsi — {correct!r} vs {parsed}")
                if len({norm(o) for o in parsed}) != len(parsed):
                    errors.append(f"soal {qid}: opsi kembar")
        elif typ == "match":
            if not isinstance(parsed, list) or len(parsed) < 2:
                errors.append(f"soal {qid}: pasangan < 2")
            else:
                if not all(set(p) == {"left", "right"} for p in parsed):
                    errors.append(f"soal {qid}: bentuk pair salah")
                rights = [p["right"] for p in parsed]
                lefts = [p["left"] for p in parsed]
                if len(set(rights)) != len(rights):
                    errors.append(f"soal {qid}: right kembar (tabrakan React key)")
                if len(set(lefts)) != len(lefts):
                    errors.append(f"soal {qid}: left kembar")
        elif typ == "translate":
            if not isinstance(parsed, list) or len(parsed) < 2:
                errors.append(f"soal {qid}: word bank < 2")
        elif typ == "arrange":
            if sorted(parsed) != sorted(correct.split()):
                errors.append(f"soal {qid}: token arrange tak setara jawaban")
            if not (3 <= len(parsed) <= 9):
                warns.append(f"soal {qid}: {len(parsed)} token")
        elif typ == "speak" and parsed is not None:
            errors.append(f"soal {qid}: speak harusnya options NULL")
    elif typ in ("multiple_choice", "listen", "match", "arrange"):
        errors.append(f"soal {qid} ({typ}): options NULL")
    if typ in ("listen", "speak") and vid is None:
        warns.append(f"soal {qid} ({typ}) tanpa vocabulary_id (TTS pakai fallback)")

for lid, qs in per_lesson.items():
    orders = sorted(o for o, *_ in qs)
    if orders != list(range(1, len(qs) + 1)):
        errors.append(f"lesson {lid}: order_index tak 1..n ({orders})")
    if len(qs) > 10:
        errors.append(f"lesson {lid}: {len(qs)} soal > cap 10")

mono = [lid for lid, qs in per_lesson.items() if len({t for _, t, *_ in qs}) == 1]
if mono:
    warns.append(f"{len(mono)} lesson hanya punya 1 tipe soal")

for t in ("units", "lessons", "vocabularies", "questions"):
    if f"pg_get_serial_sequence('public.{t}', 'id')" not in SQL:
        errors.append(f"setval {t} hilang")

print("tipe soal:", dict(Counter(t for qs in per_lesson.values() for _, t, *_ in qs)))
counts = [len(q) for q in per_lesson.values()]
print(f"soal/lesson: min {min(counts)} maks {max(counts)} rata2 {sum(counts)/len(counts):.1f}")
print(f"\nERRORS: {len(errors)}")
for e in errors[:40]:
    print("  X", e)
print(f"WARNS: {len(warns)}")
for w in warns[:12]:
    print("  !", w)
sys.exit(1 if errors else 0)
