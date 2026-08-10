#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Consolida los dumps crudos de Google Drive (uno por genero, un titulo de
archivo por linea) en data/catalog.json y data/catalog.js. Limpia nombres
de archivo reales -- no inventa contenido.
"""
import json
import pathlib
import re
import sys
import unicodedata

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCRATCH = pathlib.Path(
    r"C:\Users\User\AppData\Local\Temp\claude\c--Users-User-Desktop-claude"
    r"\3f87397a-e8cd-4264-a250-d1d40bcff936\scratchpad"
)
OUT = pathlib.Path(__file__).parent.parent / "data" / "catalog.json"

# (archivo, nombre de categoria)
GENRES = [
    ("g01_cumbia_selecta.txt", "Cumbia Selecta"),
    ("g02_regueton.txt", "Reguetón Antiguo vs Nuevo"),
    ("g03_rock_espanol.txt", "Rock Español +"),
    ("g04_rock_metal.txt", "Rock - Metal"),
    ("g05_huayno.txt", "Huayno"),
    ("g06_folklore_saya.txt", "Folklore - Saya"),
    ("g07_bachata.txt", "Bachata"),
    ("g08_musica_cristiana.txt", "Música Cristiana"),
    ("g09_salsa.txt", "Salsa"),
    ("g10_chicha.txt", "Chicha"),
    ("g11_cumbia_surena.txt", "Cumbia Sureña"),
    ("g12_musica_infantil.txt", "Música Infantil"),
    ("g13_merengue.txt", "Merengue"),
    ("g14_epico.txt", "Épico"),
    ("g15_indies_underground.txt", "Indies Underground"),
    ("g16_criollos.txt", "Criollos"),
    ("g17_romanticas.txt", "Románticas"),
    ("g18_trance_ambiente.txt", "Trance - Ambiente"),
    ("g19_girly.txt", "Girly (Mujeres)"),
    ("g20_electronica.txt", "Electrónica"),
    ("g21_hiphop_rap.txt", "Hip Hop - Rap"),
    ("g22_asiatico.txt", "Asiático"),
    ("g23_violin_clasico.txt", "Violín Clásico"),
    ("g24_techno_old_songs.txt", "Techno - Old Songs"),
    ("g25_dark.txt", "Dark"),
    ("g26_top_canciones_pop.txt", "Top Canciones Pop"),
    ("g27_pop.txt", "Pop"),
    ("g28_celtik_and_vocal.txt", "Celtik and Vocal"),
    ("g29_canto_gregoriano.txt", "Canto Gregoriano"),
]

NON_AUDIO_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".txt", ".url", ".ini"}
EXT_TAIL_RE = re.compile(r"\.(mp3|m4a|m4b|wav|flac|ogg|opus|aac|wma|mpeg|mp4)$", re.IGNORECASE)

SITE_PREFIX_RE = re.compile(
    r"^\s*(y2mate\.com|y2meta\.com|yt1s\.com|onlymp3\.to|x2download\.com|snapsave\.io)"
    r"\s*[-–]\s*",
    re.IGNORECASE,
)
QUALITY_TAG_RE = re.compile(
    r"\s*[\(\[]\s*(?:mp3[_ ]?\d+k|(?:\d+\s*kbps)|m4a[_ ]?\d+k)\s*[\)\]]", re.IGNORECASE
)
HASH_SUFFIX_RE = re.compile(r"-[A-Za-z0-9_-]{9,}-\d+k-\d{10,}$")


def norm_key(title):
    t = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "", t.lower())


def clean_title(raw):
    t = raw.strip()
    while True:
        new_t = EXT_TAIL_RE.sub("", t).strip()
        if new_t == t:
            break
        t = new_t
    t = SITE_PREFIX_RE.sub("", t)
    t = HASH_SUFFIX_RE.sub("", t)
    t = QUALITY_TAG_RE.sub("", t)
    t = t.replace("＂", '"').replace("⧸", "/").replace("｜", "|")
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"^[-–,\s]+|[-–,\s]+$", "", t).strip()
    return t


def load_genre(fname):
    path = SCRATCH / fname
    if not path.exists():
        print(f"  ! falta {fname}")
        return [], 0
    lines = [
        ln.strip()
        for ln in path.read_text(encoding="utf-8", errors="replace").splitlines()
        if ln.strip()
    ]
    seen = set()
    titles = []
    for raw in lines:
        ext = pathlib.Path(raw).suffix.lower()
        if ext in NON_AUDIO_EXTS:
            continue
        title = clean_title(raw)
        if not title:
            continue
        key = norm_key(title)
        if key in seen:
            continue
        seen.add(key)
        titles.append(title)
    return titles, len(lines)


def main():
    categories = []
    for fname, name in GENRES:
        titles, raw_count = load_genre(fname)
        if not titles:
            continue
        categories.append({
            "name": name,
            "slug": norm_key(name),
            "total": len(titles),
            "titles": titles,
        })
        print(f"  {name}: {len(titles)} unicos (de {raw_count} lineas crudas)")

    grand_total = sum(c["total"] for c in categories)
    payload = {"categories": categories, "grand_total": grand_total}

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)

    js_out = OUT.with_suffix(".js")
    with open(js_out, "w", encoding="utf-8") as fh:
        fh.write("// Generado a partir de la biblioteca real de Google Drive -- no editar a mano.\n")
        fh.write("window.CAJA_MUSICAL_CATALOG = ")
        json.dump(payload, fh, ensure_ascii=False, indent=2)
        fh.write(";\n")

    print(f"\nOK -> {OUT}")
    print(f"OK -> {js_out}")
    print(f"Total generos: {len(categories)} | Total canciones unicas: {grand_total}")


if __name__ == "__main__":
    main()
