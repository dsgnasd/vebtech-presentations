#!/usr/bin/env python3
"""Извлечение содержимого исходников презентации для анализа.

    python3 tools/extract.py presentations/<папка>

Читает <папка>/sources/, пишет <папка>/extracted/:
  content.md      — весь текст по файлам: заголовки, списки, таблицы, заметки докладчика, данные диаграмм
  inventory.json  — сводка: файлы, страницы/слайды, объём текста, таблицы, диаграммы, изображения, числа
  tables/*.csv    — таблицы (docx, pptx, xlsx, csv)
  media/*         — изображения из документов
  pages/*.png     — рендер страниц PDF и слайдов PPTX (для визуального анализа)

Зависимости: pip install python-docx python-pptx openpyxl pymupdf; для рендера PPTX — libreoffice.
"""
import csv, json, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path

MAX_RENDER = 60  # страниц/слайдов на файл для рендера


def need(mod, pkg):
    try:
        return __import__(mod)
    except ImportError:
        sys.exit(f"Нет модуля {mod}. Установите: pip install {pkg}")


class Out:
    def __init__(self, root: Path):
        self.root = root
        self.md = []
        self.inv = {"files": [], "totals": {"words": 0, "tables": 0, "charts": 0, "images": 0, "pages": 0}}
        for d in ("tables", "media", "pages"):
            (root / d).mkdir(parents=True, exist_ok=True)

    def table(self, name, rows):
        rows = [[("" if c is None else str(c)).strip() for c in r] for r in rows if any(c not in (None, "") for c in r)]
        if not rows:
            return ""
        path = self.root / "tables" / f"{name}.csv"
        with open(path, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerows(rows)
        self.inv["totals"]["tables"] += 1
        w = max(len(r) for r in rows)
        rows = [r + [""] * (w - len(r)) for r in rows]
        esc = lambda s: s.replace("|", "\\|").replace("\n", " ")
        lines = ["| " + " | ".join(esc(c) for c in rows[0]) + " |", "|" + "---|" * w]
        lines += ["| " + " | ".join(esc(c) for c in r) + " |" for r in rows[1:31]]
        if len(rows) > 31:
            lines.append(f"\n_…ещё {len(rows) - 31} строк — tables/{name}.csv_")
        return "\n".join(lines) + f"\n\n_Таблица: tables/{name}.csv_\n"

    def image(self, name, blob):
        (self.root / "media" / name).write_bytes(blob)
        self.inv["totals"]["images"] += 1
        return f"media/{name}"


def render_pdf(out, pdf_path, prefix):
    fitz = need("pymupdf", "pymupdf")
    doc = fitz.open(pdf_path)
    n = 0
    for i, page in enumerate(doc):
        if i >= MAX_RENDER:
            break
        pix = page.get_pixmap(dpi=60)
        pix.save(out.root / "pages" / f"{prefix}-{i + 1:02d}.png")
        n += 1
    return len(doc), n


def do_docx(out, f, stem):
    docx = need("docx", "python-docx")
    d = docx.Document(f)
    md, words = [], 0
    body = d.element.body
    ti = 0
    for el in body.iterchildren():
        tag = el.tag.split("}")[-1]
        if tag == "p":
            p = docx.text.paragraph.Paragraph(el, d)
            t = p.text.strip()
            if not t:
                continue
            words += len(t.split())
            st = (p.style.name or "").lower() if p.style is not None else ""
            m = re.search(r"(heading|заголовок)\s*(\d)", st)
            if m:
                md.append("#" * min(6, int(m.group(2)) + 2) + " " + t)
            elif st.startswith("title") or st.startswith("название"):
                md.append("### " + t)
            elif "list" in st or "спис" in st:
                md.append("- " + t)
            else:
                md.append(t)
        elif tag == "tbl":
            ti += 1
            t = docx.table.Table(el, d)
            md.append(out.table(f"{stem}-t{ti}", [[c.text for c in r.cells] for r in t.rows]))
    for i, rel in enumerate(r for r in d.part.rels.values() if "image" in r.reltype):
        ext = Path(rel.target_ref).suffix or ".png"
        md.append(f"![]({out.image(f'{stem}-img{i + 1}{ext}', rel.target_part.blob)})")
    return "\n\n".join(md), {"words": words, "tables": ti}


def walk_shapes(shapes):
    # группы раскрываем: текст и картинки внутри сгруппированных фигур иначе теряются
    for sh in shapes:
        yield sh
        if sh.shape_type == 6:  # group
            yield from walk_shapes(sh.shapes)


def do_pptx(out, f, stem):
    pptx = need("pptx", "python-pptx")
    from pptx.util import Emu  # noqa
    pr = pptx.Presentation(f)
    md, words, tables, charts, img = [], 0, 0, 0, 0
    for si, s in enumerate(pr.slides, 1):
        md.append(f"### Слайд {si}" + (f" · макет «{s.slide_layout.name}»" if s.slide_layout is not None else ""))
        for sh in walk_shapes(s.shapes):
            if sh.has_text_frame and sh.text_frame.text.strip():
                is_title = sh.is_placeholder and sh.placeholder_format.type is not None and "TITLE" in str(sh.placeholder_format.type)
                for para in sh.text_frame.paragraphs:
                    t = "".join(r.text for r in para.runs).strip()
                    if not t:
                        continue
                    words += len(t.split())
                    md.append(("**" + t + "**") if is_title else ("  " * para.level + "- " + t))
            if getattr(sh, "has_table", False) and sh.has_table:
                tables += 1
                md.append(out.table(f"{stem}-s{si}-t{tables}", [[c.text for c in r.cells] for r in sh.table.rows]))
            if getattr(sh, "has_chart", False) and sh.has_chart:
                charts += 1
                ch = sh.chart
                try:
                    cats = [str(c) for c in ch.plots[0].categories]
                    rows = [["Серия"] + cats] + [[se.name] + list(se.values) for pl in ch.plots for se in pl.series]
                    md.append(f"_Диаграмма ({ch.chart_type}):_\n\n" + out.table(f"{stem}-s{si}-chart{charts}", rows))
                except Exception as e:  # noqa
                    md.append(f"_Диаграмма ({ch.chart_type}), данные не прочитаны: {e}_")
            if sh.shape_type == 13:  # picture
                img += 1
                md.append(f"![]({out.image(f'{stem}-s{si}-img{img}.{sh.image.ext}', sh.image.blob)})")
        if s.has_notes_slide and s.notes_slide.notes_text_frame.text.strip():
            md.append("> Заметки докладчика: " + s.notes_slide.notes_text_frame.text.strip().replace("\n", " "))
    # рендер слайдов через libreoffice → pdf
    rendered, note = 0, "libreoffice не установлен"
    if shutil.which("soffice"):
        with tempfile.TemporaryDirectory() as tmp:
            try:
                subprocess.run(["soffice", f"-env:UserInstallation=file://{tmp}/profile", "--headless", "--convert-to", "pdf", "--outdir", tmp, str(f)],
                               capture_output=True, timeout=180)
            except subprocess.TimeoutExpired:
                pass
            pdfs = list(Path(tmp).glob("*.pdf"))
            if pdfs:
                _, rendered = render_pdf(out, pdfs[0], stem)
                note = ""
            else:
                note = "libreoffice не смог открыть файл"
    info = {"slides": len(pr.slides), "words": words, "tables": tables, "charts": charts, "rendered": rendered}
    if note:
        info["render"] = f"картинки слайдов не получены ({note}) — попросите PDF-экспорт этой презентации"
        md.insert(0, f"_Внимание: {info['render']}_")
    return "\n\n".join(md), info


def do_pdf(out, f, stem):
    fitz = need("pymupdf", "pymupdf")
    doc = fitz.open(f)
    md, words = [], 0
    for i, page in enumerate(doc, 1):
        t = page.get_text().strip()
        words += len(t.split())
        if t:
            md.append(f"### Страница {i}\n\n{t}")
    pages, rendered = render_pdf(out, f, stem)
    return "\n\n".join(md), {"pages": pages, "words": words, "rendered": rendered}


def do_xlsx(out, f, stem):
    openpyxl = need("openpyxl", "openpyxl")
    wb = openpyxl.load_workbook(f, data_only=True, read_only=True)
    md = []
    for ws in wb.worksheets:
        rows = [list(r) for r in ws.iter_rows(values_only=True)]
        name = stem + "-" + re.sub(r"[^\w-]+", "_", ws.title)
        md.append(f"### Лист «{ws.title}»\n\n" + out.table(name, rows))
    return "\n\n".join(md), {"sheets": len(wb.worksheets)}


def do_csv(out, f, stem):
    with open(f, encoding="utf-8-sig", errors="replace") as h:
        sep = ";" if ";" in h.readline() else ","
        h.seek(0)
        rows = list(csv.reader(h, delimiter=sep))
    return out.table(stem, rows), {"rows": len(rows)}


def do_text(out, f, stem):
    t = Path(f).read_text(encoding="utf-8", errors="replace")
    return t, {"words": len(t.split())}


def do_image(out, f, stem):
    return f"![]({out.image(Path(f).name, Path(f).read_bytes())})", {}


HANDLERS = {".docx": do_docx, ".pptx": do_pptx, ".pdf": do_pdf, ".xlsx": do_xlsx, ".xlsm": do_xlsx, ".csv": do_csv,
            ".md": do_text, ".txt": do_text, ".png": do_image, ".jpg": do_image, ".jpeg": do_image, ".webp": do_image, ".svg": do_image}


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    base = Path(sys.argv[1])
    src, dst = base / "sources", base / "extracted"
    if not src.is_dir():
        sys.exit(f"Нет папки {src}")
    shutil.rmtree(dst, ignore_errors=True)
    out = Out(dst)
    for f in sorted(p for p in src.iterdir() if p.is_file() and not p.name.startswith(".")):
        stem = re.sub(r"[^\w-]+", "_", f.name)[:60]  # с расширением: deck.pdf и deck.pptx не затирают страницы друг друга
        h = HANDLERS.get(f.suffix.lower())
        entry = {"file": f.name, "type": f.suffix.lower().lstrip("."), "bytes": f.stat().st_size}
        if not h:
            entry["skipped"] = "неподдерживаемый формат (.doc/.ppt — пересохраните в .docx/.pptx)"
            out.md.append(f"## {f.name}\n\n_Пропущен: {entry['skipped']}_")
        else:
            try:
                text, info = h(out, f, stem)
                entry.update(info)
                out.md.append(f"## {f.name}\n\n{text}")
            except Exception as e:
                entry["error"] = str(e)
                out.md.append(f"## {f.name}\n\n_Ошибка чтения: {e}_")
        for k in ("words", "charts"):
            out.inv["totals"][k] += entry.get(k, 0) or 0
        out.inv["totals"]["pages"] += entry.get("slides", 0) or entry.get("pages", 0) or 0
        out.inv["files"].append(entry)
    body = "\n\n".join(out.md)
    nums = re.findall(r"(?<![\w.,])[-−+]?\d[\d\s]*(?:[.,]\d+)?\s?(?:%|млрд|млн|тыс|BYN|Br|₽|руб|\$|€)", body)
    out.inv["numbers_sample"] = [n.strip() for n in nums[:40]]
    out.inv["numbers_found"] = len(nums)
    (dst / "content.md").write_text("# Содержимое исходников\n\n" + body + "\n", encoding="utf-8")
    (dst / "inventory.json").write_text(json.dumps(out.inv, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    t = out.inv["totals"]
    print(f"  извлечено: {len(out.inv['files'])} файл(ов), {t['words']} слов, {t['tables']} таблиц, {t['charts']} диаграмм, "
          f"{t['images']} изображений, {t['pages']} стр./слайдов, {out.inv['numbers_found']} чисел → {dst}")


if __name__ == "__main__":
    main()
