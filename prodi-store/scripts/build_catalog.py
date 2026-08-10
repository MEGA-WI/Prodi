#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Escanea la biblioteca real de ProDi (D:\\...\\ProDi - Libros) y genera
data/catalog.json con el catalogo COMPLETO de titulos reales por categoria
(sin inventar contenido ni recortar a un top-N), para que el buscador del
sitio pueda encontrar cualquier titulo real. Prioriza colecciones/sagas
grandes (carpetas con mas titulos = mas "conocidas") sobre archivos sueltos,
y evita duplicados entre formatos (PDF / EPUB / audiolibro).
"""
import json
import pathlib
import re
import sys
import unicodedata

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

LIBRARY = pathlib.Path(r"D:\Nueva carpeta\Biblioteca Digital - ProDi\ProDi - Libros")
OUT = pathlib.Path(__file__).parent.parent / "data" / "catalog.json"

BOOK_EXTS = {".pdf", ".epub", ".mp3", ".m4a", ".m4b"}
IGNORE_DIR_NAMES = {"__pycache__"}
# Carpetas que no son categorias publicas del catalogo (staging/duplicados internos).
IGNORE_CATEGORY_NAMES = {"adicionales"}
IGNORE_FILE_PREFIXES = ("_test_",)

# Carpetas de formato alterno: se usan solo para completar si faltan titulos,
# nunca duplican un titulo ya contado desde otro formato.
ALT_FORMAT_HINTS = ("FORMATO EPUB", "AUDIOLIBRO", "AUDIOLIBROS")


def natural_key(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]


def norm_key(title):
    t = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "", t.lower())


EXT_TAIL_RE = re.compile(r"\.(pdf|epub|mobi|azw3?|mp3|m4a|m4b|docx?)$", re.IGNORECASE)
CREDIT_RE = re.compile(r"\(?\s*z[\s._-]*lib(?:rary)?(?:[\s._-]*org)?\s*\)?", re.IGNORECASE)


def clean_title(stem):
    t = stem.replace("_", " ").strip()
    # nombres con doble extension (p.ej. "...epub.pdf") dejan restos tras el .stem
    while True:
        new_t = EXT_TAIL_RE.sub("", t).strip()
        if new_t == t:
            break
        t = new_t
    t = CREDIT_RE.sub("", t)
    t = re.sub(r"\(\s*\)", "", t)  # parentesis vacios tras limpiar creditos
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"[\-–—,]\s*$", "", t).strip()
    return t


def is_alt_format_dir(name):
    upper = name.upper()
    return any(hint in upper for hint in ALT_FORMAT_HINTS)


def list_files(folder):
    try:
        entries = list(folder.iterdir())
    except (FileNotFoundError, PermissionError):
        return []
    return sorted(
        [f for f in entries if f.is_file() and f.suffix.lower() in BOOK_EXTS
         and not f.name.startswith(IGNORE_FILE_PREFIXES)],
        key=lambda f: natural_key(f.stem),
    )


def collect_category(folder):
    """Devuelve (titulos_ordenados, total_unicos) para una carpeta de categoria."""
    seen = set()
    primary_groups = []  # (nombre_coleccion_o_None, [titulos])
    alt_titles = []

    subdirs = sorted(
        [d for d in folder.iterdir() if d.is_dir() and d.name not in IGNORE_DIR_NAMES],
        key=lambda d: d.name.lower(),
    )

    # 1) Colecciones/sagas: subcarpetas normales (no formato alterno) con archivos.
    real_collections = []
    for d in subdirs:
        if is_alt_format_dir(d.name):
            continue
        files = list_files(d)
        # tambien soporta un nivel anidado (coleccion / sub-coleccion)
        nested = sorted([nd for nd in d.iterdir() if nd.is_dir()], key=lambda x: x.name.lower()) if d.is_dir() else []
        nested_files = []
        for nd in nested:
            nested_files.extend([(nd.name, f) for f in list_files(nd)])
        if not files and not nested_files:
            continue
        real_collections.append((d.name, files, nested_files))

    # Coleccion "mas grande" primero = proxy de "mas conocida/popular"
    real_collections.sort(key=lambda c: (len(c[1]) + len(c[2])), reverse=True)

    for name, files, nested_files in real_collections:
        group_titles = []
        for f in files:
            title = clean_title(f.stem)
            key = norm_key(title)
            if key in seen:
                continue
            seen.add(key)
            group_titles.append(title)
        for sub_name, f in nested_files:
            title = clean_title(f.stem)
            key = norm_key(title)
            if key in seen:
                continue
            seen.add(key)
            group_titles.append(title)
        if group_titles:
            primary_groups.append((name, group_titles))

    # 2) Titulos sueltos directamente en la carpeta de categoria.
    root_files = list_files(folder)
    loose_titles = []
    for f in root_files:
        title = clean_title(f.stem)
        key = norm_key(title)
        if key in seen:
            continue
        seen.add(key)
        loose_titles.append(title)
    if loose_titles:
        primary_groups.append((None, loose_titles))

    # 3) Formatos alternos (EPUB / audiolibro): solo para rellenar si falta contenido.
    for d in subdirs:
        if not is_alt_format_dir(d.name):
            continue
        # puede tener sub-subcarpetas (por autor, por ejemplo audiolibros)
        candidates = list_files(d)
        nested = sorted([nd for nd in d.iterdir() if nd.is_dir()], key=lambda x: x.name.lower())
        for nd in nested:
            candidates.extend(list_files(nd))
        for f in candidates:
            title = clean_title(f.stem)
            key = norm_key(title)
            if key in seen:
                continue
            seen.add(key)
            alt_titles.append(title)

    ordered = []
    for _, titles in primary_groups:
        ordered.extend(titles)
    # Se agregan tambien los formatos alternos (EPUB/audiolibro) que no tenian
    # equivalente en PDF -- el catalogo debe quedar completo, no solo el top 50,
    # para que el buscador del sitio pueda encontrar cualquier titulo real.
    ordered.extend(alt_titles)
    total_unique = len(seen)

    return ordered, total_unique


def main():
    categories = []
    for folder in sorted(LIBRARY.iterdir(), key=lambda d: d.name.lower()):
        if not folder.is_dir() or folder.name in IGNORE_DIR_NAMES:
            continue
        if folder.name.strip().lower() in IGNORE_CATEGORY_NAMES:
            continue
        titles, total_unique = collect_category(folder)
        if total_unique == 0:
            continue
        categories.append({
            "name": folder.name,
            "slug": norm_key(folder.name),
            "total": total_unique,
            "titles": titles,
        })

    grand_total = sum(c["total"] for c in categories)
    payload = {"categories": categories, "grand_total": grand_total}

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)

    js_out = OUT.with_suffix(".js")
    with open(js_out, "w", encoding="utf-8") as fh:
        fh.write("// Generado por scripts/build_catalog.py -- no editar a mano.\n")
        fh.write("window.PRODI_CATALOG = ")
        json.dump(payload, fh, ensure_ascii=False, indent=2)
        fh.write(";\n")

    print(f"OK -> {OUT}")
    print(f"OK -> {js_out}")
    print(f"Total categorias: {len(categories)} | Total titulos unicos: {grand_total}")
    for c in categories:
        print(f"  {c['name']}: {len(c['titles'])} listados / {c['total']} unicos totales")


if __name__ == "__main__":
    main()
