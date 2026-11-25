// HTML-презентация ДС → редактируемый PPTX (PowerPoint).
//   node tools/html2pptx.mjs <папка презентации | index.html> [выходной.pptx] [--brand-font] [--shapes]
//   Шрифт по умолчанию — Arial (кегль −8%): есть на любом компьютере, вёрстка не поедет.
//   --brand-font — фирменный Manrope: только если он установлен у всех, кто откроет файл
// Как работает: слайды .wt-slide рендерятся в Chromium, из DOM берутся координаты и стили. Тексты становятся текстовыми
// блоками (размеры и межстрочный интервал как в вёрстке), карточки и плашки — фигурами, линии таблиц — линиями.
// Схемы и графики (крупные SVG) — редактируемые фигуры, линии со стрелками и тексты (lib/svg-vector.mjs); подпись узла лежит внутри фигуры.
// BarChart, StackedBar, LineChart, AreaChart, DonutChart — нативные диаграммы с таблицей данных, DataTable — нативная таблица (ключ --shapes — всё фигурами).
// Иконки, логотип, гексагоны с фото и SVG с градиентами или масками вставляются картинками (PNG с прозрачностью).
// Зависимости (pptxgenjs, sharp, playwright) — в design-system/node_modules: cd design-system && npm install.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { svgToItems } from './lib/svg-vector.mjs';
import { chartSpec, sheetData, chartXml, totalsFormulas } from './lib/native-chart.mjs';
import { reviewProblems } from './design-gate.mjs';
import { numberProblems } from './number-check.mjs';

const DS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../design-system');
const requireDs = createRequire(path.join(DS, 'package.json'));
const { chromium } = await import(pathToFileURL(path.join(DS, 'node_modules/playwright/index.mjs')).href);
const pptxgen = requireDs('pptxgenjs');
const sharp = requireDs('sharp');
const JSZip = createRequire(requireDs.resolve('pptxgenjs'))('jszip');

const args = process.argv.slice(2);
// Arial — по умолчанию; Manrope — только с --brand-font (прежний --safe-font принимается и ничего не меняет)
const SAFE = !args.includes('--brand-font');
const [target, outArg] = args.filter((a) => !a.startsWith('--'));
const NATIVE = !args.includes('--shapes');
const FONT = SAFE ? 'Arial' : 'Manrope';
const K = SAFE ? 0.92 : 1; // жирный Arial на крупных кеглях шире Manrope — с запасом, чтобы заголовки не уходили на лишнюю строку
if (!target) { console.error('Укажите папку презентации или index.html'); process.exit(1); }
const htmlPath = fs.statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
// Выдача без проверки дизайна запрещена; --draft — рабочая копия для просмотра, имя с «-draft»
const DRAFT = args.includes('--draft');
const deckDir = path.dirname(path.resolve(htmlPath));
const metaPath = path.join(deckDir, 'meta.json');
const deckMeta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};
const notReady = deckMeta.design ? [...reviewProblems(deckDir), ...numberProblems(deckMeta)] : [];
if (notReady.length && !DRAFT) { console.error('✗ PPTX не выгружен, проверка не пройдена:\n  - ' + notReady.join('\n  - ') + '\nПорядок — скил design-check. Рабочая копия — с --draft.'); process.exit(1); }
const outPath = outArg || path.join(path.dirname(htmlPath), path.basename(path.dirname(path.resolve(htmlPath))).replace(/^\d{4}-\d{2}-\d{2}-/, '') + (notReady.length ? '-draft.pptx' : '.pptx'));
const PX = 1 / 96; // 1920px = 20in
const DSF = 3;

const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const page = await browser.newPage({ viewport: { width: 2000, height: 1200 }, deviceScaleFactor: DSF });
await page.goto(pathToFileURL(path.resolve(htmlPath)).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.addStyleTag({ content: '.wt-no-print,.bar{display:none!important} body{background:transparent!important} html.iso body *{visibility:hidden!important} html.iso [data-iso-on],html.iso [data-iso-on] *{visibility:visible!important} html.iso,html.iso body,html.iso .wt-slide{background:transparent!important;box-shadow:none!important}' });

const nSlides = await page.evaluate(() => document.querySelectorAll('.wt-slide').length);

const extract = (idx) => page.evaluate(([idx, vectorSrc, specSrc]) => {
  const svgToItems = new Function('return ' + vectorSrc)();
  const chartSpec = specSrc && new Function('return ' + specSrc)();
  const slide = document.querySelectorAll('.wt-slide')[idx];
  const sr = slide.getBoundingClientRect();
  const sc = sr.width / 1920;
  const items = [];
  let isoN = 0;
  const num = (v) => parseFloat(v) || 0;
  const parseColor = (s) => {
    if (!s) return null;
    let m = s.match(/^rgba?\(([^)]+)\)$/);
    let r, g, b, a = 1;
    if (m) { const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); [r, g, b] = p; a = p.length > 3 ? p[3] : 1; }
    else if ((m = s.match(/^color\(srgb ([^)]+)\)$/))) { const p = m[1].split(/[ \/]+/).filter(Boolean).map(parseFloat); r = p[0] * 255; g = p[1] * 255; b = p[2] * 255; a = p.length > 3 ? p[3] : 1; }
    else return null;
    if (a === 0) return null;
    const h = (n) => Math.round(n).toString(16).padStart(2, '0');
    return { hex: (h(r) + h(g) + h(b)).toUpperCase(), a };
  };
  const rel = (r) => ({ x: (r.left - sr.left) / sc, y: (r.top - sr.top) / sc, w: r.width / sc, h: r.height / sc });
  const inside = (b) => b.w > 0.5 && b.h > 0.5 && b.x < 1920 && b.y < 1080 && b.x + b.w > 0 && b.y + b.h > 0;
  const ART = '.wt-hexcluster,.wt-hexart,.wt-title-hex,.wt-section-hex,.wt-contact-hex';

  const style = (el) => { const cs = getComputedStyle(el); return { size: parseFloat(cs.fontSize), bold: parseInt(cs.fontWeight, 10) >= 600, italic: cs.fontStyle === 'italic', color: (parseColor(cs.color) || { hex: '000000' }).hex, ls: parseFloat(cs.letterSpacing) || 0, href: el.closest('a[href]')?.href || null }; };
  const clean = (t, cs) => (cs.textTransform === 'uppercase' ? t.toUpperCase() : t).replace(/[ \t\n\r]+/g, ' ');
  const plainInline = (e) => { const cs = getComputedStyle(e); return cs.display === 'inline' && cs.position === 'static' && !parseColor(cs.backgroundColor) && !['Top', 'Right', 'Bottom', 'Left'].some((s) => num(cs['border' + s + 'Width']) && cs['border' + s + 'Style'] !== 'none' || num(cs['padding' + s]) || num(cs['margin' + s])) && /^(B|STRONG|EM|I|SPAN|A|SUB|SUP)$/.test(e.tagName); };
  // текст с выделениями внутри → части одной надписи; null — внутри не только строчный текст
  const runsOf = (el) => {
    const runs = [];
    const go = (e) => [...e.childNodes].every((n) => {
      if (n.nodeType === 3) { const t = clean(n.textContent, getComputedStyle(e)); if (t) runs.push({ text: t, ...style(e) }); return true; }
      if (n.nodeType !== 1) return true;
      if (n.tagName === 'BR') { if (runs.length) runs[runs.length - 1].br = true; return true; }
      return plainInline(n) && go(n);
    });
    if (!go(el)) return null;
    if (runs.length) { runs[0].text = runs[0].text.trimStart(); runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd(); }
    for (let i = 1; i < runs.length; i++) if (runs[i - 1].br || runs[i - 1].text.endsWith(' ')) runs[i].text = runs[i].text.trimStart();
    return runs.filter((r) => r.text);
  };
  // таблица из одного текста → нативная; с иконками, шкалами, объединениями — остаётся фигурами
  const readTable = (el, b) => {
    const rows = [...el.rows];
    if (!rows.length || !inside(b) || rows.some((r) => r.cells.length !== rows[0].cells.length)) return null;
    const out = [];
    for (const r of rows) {
      const cells = [];
      for (const c of r.cells) {
        const runs = runsOf(c), cs = getComputedStyle(c);
        if (!runs || c.colSpan > 1 || c.rowSpan > 1 || num(cs.borderTopLeftRadius)) return null;
        const bg = parseColor(cs.backgroundColor) || parseColor(getComputedStyle(r).backgroundColor);
        const bd = ['Top', 'Right', 'Bottom', 'Left'].map((s) => { const w = cs['border' + s + 'Style'] === 'none' ? 0 : num(cs['border' + s + 'Width']), k = parseColor(cs['border' + s + 'Color']); return w && k ? { c: k.hex, w } : null; });
        let lh = parseFloat(cs.lineHeight); if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.3;
        cells.push({ runs, st: style(c), fill: bg && bg.hex, bd, lh, pad: ['Top', 'Right', 'Bottom', 'Left'].map((s) => num(cs['padding' + s])), align: /center/.test(cs.textAlign) ? 'center' : /right|end/.test(cs.textAlign) ? 'right' : 'left', valign: { middle: 'middle', bottom: 'bottom' }[cs.verticalAlign] || 'top' });
      }
      out.push(cells);
    }
    return { t: 'table', ...b, rows: out, colW: [...rows[0].cells].map((c) => c.getBoundingClientRect().width / sc), rowH: rows.map((r) => r.getBoundingClientRect().height / sc) };
  };
  const inTitle = (el) => { const h = el.closest('h1, h2'); return !!h && h === slide.querySelector('h1, h2'); };

  const walk = (el) => {
    if (el.nodeType !== 1) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
    const tag = el.tagName.toLowerCase();
    const b = rel(el.getBoundingClientRect());
    if (tag === 'svg' || el.matches(ART) || tag === 'img') {
      if (!inside(b)) return;
      if (tag === 'svg' && chartSpec && el.closest('.wt-chart, .wt-donut-plot')) {
        const chart = chartSpec(el);
        if (chart) { items.push({ t: 'chart', ...b, chart }); return; }
      }
      if (tag === 'svg' && !el.matches(ART) && !el.closest(`${ART},.wt-logo,.wt-footer`) && (el.hasAttribute('data-visual') || (b.w >= 200 && b.h >= 120))) {
        const vec = svgToItems(el, sr, sc);
        if (vec) { items.push(...vec); return; }
      }
      el.setAttribute('data-iso', String(isoN));
      const p = tag === 'svg' ? 8 : 0; // у SVG ДС overflow: visible — обводка сот и подписи графиков выходят за рамку; остальное при снимке скрыто, запас безопасен
      const x0 = Math.max(0, b.x - p), y0 = Math.max(0, b.y - p), x1 = Math.min(1920, b.x + b.w + p), y1 = Math.min(1080, b.y + b.h + p);
      items.push({ t: 'img', iso: isoN, art: el.matches(ART), x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
      isoN++;
      return;
    }
    if (tag === 'table' && chartSpec) {
      const t = readTable(el, b);
      if (t) { items.push(t); return; }
    }
    if (el !== slide && inside(b)) {
      const bg = parseColor(cs.backgroundColor);
      const rad = Math.min(num(cs.borderTopLeftRadius), Math.min(b.w, b.h) / 2);
      const round = rad > 0.5;
      const isCircle = round && rad >= Math.min(b.w, b.h) / 2 - 0.5 && Math.abs(b.w - b.h) < 1.5;
      const bw = ['Top', 'Right', 'Bottom', 'Left'].map((s) => (cs['border' + s + 'Style'] === 'none' ? 0 : num(cs['border' + s + 'Width'])));
      const bc = ['Top', 'Right', 'Bottom', 'Left'].map((s) => parseColor(cs['border' + s + 'Color']));
      let line = null;
      if (bw.every((w) => w > 0 && w === bw[0]) && bc[0]) line = { c: bc[0].hex, w: bw[0] };
      let inset = null;
      const sh = cs.boxShadow;
      if (sh && sh !== 'none' && /inset/.test(sh)) {
        const m = sh.match(/(rgba?\([^)]+\)|color\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px\s+([\d.]+)px\s+inset/);
        if (m) { const c = parseColor(m[1]); if (c && +m[4] === 0) inset = { c: c.hex, w: +m[5] }; }
      }
      if (bg || line || inset) {
        const ln = line || inset;
        items.push({ t: 'rect', ...b, fill: bg, radius: round ? rad : 0, circle: isCircle, line: ln });
      }
      if (!line) {
        // отдельные стороны (разделители строк таблиц, подчёркивания)
        const sides = [['Top', 0], ['Right', 1], ['Bottom', 2], ['Left', 3]];
        for (const [name, i] of sides) {
          if (bw[i] > 0 && bc[i]) {
            const w = bw[i];
            if (name === 'Top') items.push({ t: 'line', x1: b.x, y1: b.y + w / 2, x2: b.x + b.w, y2: b.y + w / 2, c: bc[i].hex, w });
            if (name === 'Bottom') items.push({ t: 'line', x1: b.x, y1: b.y + b.h - w / 2, x2: b.x + b.w, y2: b.y + b.h - w / 2, c: bc[i].hex, w });
            if (name === 'Left') items.push({ t: 'line', x1: b.x + w / 2, y1: b.y, x2: b.x + w / 2, y2: b.y + b.h, c: bc[i].hex, w });
            if (name === 'Right') items.push({ t: 'line', x1: b.x + b.w - w / 2, y1: b.y, x2: b.x + b.w - w / 2, y2: b.y + b.h, c: bc[i].hex, w });
          }
        }
      }
    }
    // абзац с выделениями — одна надпись
    if (chartSpec && el.children.length && !/^(table|thead|tbody|tr)$/.test(tag) && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !/vertical/.test(cs.writingMode) && !/flex|grid/.test(cs.display) && !el.matches('.wt-pagenum')) {
      const runs = runsOf(el);
      if (runs && runs.length > 1) {
        const range = document.createRange(); range.selectNodeContents(el);
        const rects = [...range.getClientRects()].filter((r) => r.width > 0);
        const u = { l: Math.min(...rects.map((r) => r.left)), t: Math.min(...rects.map((r) => r.top)), r: Math.max(...rects.map((r) => r.right)), b: Math.max(...rects.map((r) => r.bottom)) };
        const tb = rel({ left: u.l, top: u.t, width: u.r - u.l, height: u.b - u.t });
        let lh = parseFloat(cs.lineHeight); if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.3;
        if (inside(tb)) { items.push({ t: 'text', ...tb, runs, text: runs.map((r) => r.text).join(''), title: inTitle(el), ...style(el), align: /center/.test(cs.textAlign) ? 'center' : /right|end/.test(cs.textAlign) ? 'right' : 'left', lh, lines: Math.max(1, Math.round(tb.h / sc / lh), Math.round((u.b - u.t) / sc / lh)) }); return; }
      }
    }
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const raw = n.textContent; const st = raw.length - raw.trimStart().length; const en = raw.trimEnd().length;
        const range = document.createRange(); range.setStart(n, st); range.setEnd(n, en);
        const rects = [...range.getClientRects()].filter((r) => r.width > 0);
        if (!rects.length) continue;
        const u = { l: Math.min(...rects.map((r) => r.left)), t: Math.min(...rects.map((r) => r.top)), r: Math.max(...rects.map((r) => r.right)), b: Math.max(...rects.map((r) => r.bottom)) };
        const tb = rel({ left: u.l, top: u.t, width: u.r - u.l, height: u.b - u.t });
        if (!inside(tb)) continue;
        const tops = new Set(rects.map((r) => Math.round(r.top / 4)));
        let text = n.textContent.replace(/[ \t\n\r]+/g, ' ').trim(); // неразрывные пробелы ДС сохраняем — иначе предлоги повиснут
        if (cs.textTransform === 'uppercase') text = text.toUpperCase();
        const col = parseColor(cs.color) || { hex: '000000', a: 1 };
        let lh = parseFloat(cs.lineHeight); if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.3;
        const fw = parseInt(cs.fontWeight, 10);
        items.push({
          t: 'text', ...tb, text, title: inTitle(el), page: !!el.closest('.wt-pagenum') && el.tagName === 'B', size: parseFloat(cs.fontSize), bold: fw >= 600, italic: cs.fontStyle === 'italic', color: col.hex,
          vert: /vertical/.test(cs.writingMode) ? (/matrix\(-1/.test(cs.transform) || [...(function* () { for (let e = el; e && e !== slide; e = e.parentElement) yield e; })()].some((e) => /^matrix\(-1,/.test(getComputedStyle(e).transform) || getComputedStyle(e).rotate === '180deg') ? 'vert270' : 'vert') : null,
          align: /center/.test(cs.textAlign) ? 'center' : /right|end/.test(cs.textAlign) ? 'right' : 'left', lh, ls: parseFloat(cs.letterSpacing) || 0, lines: tops.size, href: (el.closest('a[href]') || {}).href || null,
        });
      }
    }
    for (const c of el.children) walk(c);
  };
  const sbg = parseColor(getComputedStyle(slide).backgroundColor);
  walk(slide);
  return { bg: sbg ? sbg.hex : 'FFFFFF', items, sc, sr: { x: sr.left, y: sr.top } };
}, [idx, svgToItems.toString(), NATIVE ? chartSpec.toString() : '']);

const shot = async (idx, it) => {
  await page.evaluate(([idx, iso]) => {
    document.querySelectorAll('[data-iso-on]').forEach((e) => e.removeAttribute('data-iso-on'));
    const slide = document.querySelectorAll('.wt-slide')[idx];
    slide.querySelector(`[data-iso="${iso}"]`).setAttribute('data-iso-on', '1');
    document.documentElement.classList.add('iso');
  }, [idx, it.iso]);
  const r = await page.evaluate((idx) => { const sl = document.querySelectorAll('.wt-slide')[idx]; sl.scrollIntoView({ block: 'start' }); const q = sl.getBoundingClientRect(); return { x: q.left, y: q.top, width: q.width, height: q.height }; }, idx);
  const full = await page.screenshot({ clip: r, omitBackground: true, animations: 'disabled' });
  await page.evaluate(() => document.documentElement.classList.remove('iso'));
  const meta = await sharp(full).metadata();
  const k = meta.width / 1920;
  return sharp(full).extract({ left: Math.round(it.x * k), top: Math.round(it.y * k), width: Math.max(1, Math.round(it.w * k)), height: Math.max(1, Math.round(it.h * k)) }).png().toBuffer();
};

const pres = new pptxgen();
pres.defineLayout({ name: 'WT', width: 20, height: 11.25 });
pres.layout = 'WT';
pres.title = await page.title();
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.company = 'ВЭБ Технологии';
// заголовок слайда — заполнитель: виден в структуре, в списке слайдов и для экранного диктора
pres.defineSlideMaster({ title: 'WT', background: { color: 'FFFFFF' }, objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 1, y: 0.7, w: 18, h: 1.4, fontFace: FONT, fontSize: 36 * K, bold: true, align: 'left', valign: 'top', margin: 0 }, text: 'Заголовок' } }] });
const charts = [];

const safeText = (t) => (SAFE ? t.replace(/\u2011/g, '-').replace(/\u2060/g, '') : t);
const runOpts = (r) => ({ fontFace: FONT, fontSize: r.size * 0.75 * K, bold: r.bold, italic: r.italic, color: r.color, charSpacing: (r.ls || 0) * 0.75, ...(r.href ? { hyperlink: { url: r.href } } : {}), ...(r.br ? { breakLine: true } : {}) });
const vecLine = (l) => ({ color: l.c, transparency: Math.round((1 - l.a) * 100), width: l.w * 0.75, ...(l.dash ? { dashType: 'dash' } : {}), ...(l.end ? { endArrowType: 'triangle' } : {}), ...(l.start ? { beginArrowType: 'triangle' } : {}) });
const stats = { rect: 0, text: 0, img: 0, line: 0, chart: 0, table: 0 };
for (let i = 0; i < nSlides; i++) {
  const { bg, items } = await extract(i);
  const s = pres.addSlide({ masterName: 'WT' });
  let titled = false;
  s.background = { color: bg };
  for (const it of items) {
    if (it.t === 'chart') {
      charts.push(it.chart);
      s.addChart(pres.ChartType.bar, sheetData(it.chart), { x: it.x * PX, y: it.y * PX, w: it.w * PX, h: it.h * PX, altText: it.chart.title || 'Диаграмма' });
      stats.chart++;
    } else if (it.t === 'table') {
      const bd = (b) => (b ? { type: 'solid', pt: b.w * 0.75, color: b.c } : { type: 'none' });
      const rows = it.rows.map((r) => r.map((c) => ({
        text: (c.runs.length ? c.runs : [{ text: '', ...c.st }]).map((q) => ({ text: safeText(q.text), options: runOpts(q) })),
        options: { ...runOpts(c.st), align: c.align, valign: c.valign, margin: c.pad.map((v) => (v * PX)), border: c.bd.map(bd), ...(c.fill ? { fill: { color: c.fill } } : {}) },
      })));
      s.addTable(rows, { x: it.x * PX, y: it.y * PX, w: it.w * PX, colW: it.colW.map((v) => v * PX), rowH: it.rowH.map((v) => v * PX), autoPage: false });
      stats.table++;
    } else if (it.t === 'rect') {
      const opts = { x: it.x * PX, y: it.y * PX, w: it.w * PX, h: it.h * PX };
      if (it.fill) opts.fill = { color: it.fill.hex, transparency: Math.round((1 - it.fill.a) * 100) };
      else opts.fill = { type: 'none' };
      if (it.line) {
        const half = it.line.w / 2;
        opts.x += half * PX; opts.y += half * PX; opts.w -= it.line.w * PX; opts.h -= it.line.w * PX;
        opts.line = { color: it.line.c, width: it.line.w * 0.75 };
      }
      let type = pres.ShapeType.rect;
      if (it.circle) type = pres.ShapeType.ellipse;
      else if (it.radius > 0) { type = pres.ShapeType.roundRect; opts.rectRadius = Math.min(it.radius * PX, Math.min(opts.w, opts.h) / 2); }
      s.addShape(type, opts); stats.rect++;
    } else if (it.t === 'line') {
      s.addShape(pres.ShapeType.line, { x: Math.min(it.x1, it.x2) * PX, y: Math.min(it.y1, it.y2) * PX, w: Math.abs(it.x2 - it.x1) * PX, h: Math.abs(it.y2 - it.y1) * PX, line: { color: it.c, width: it.w * 0.75 } }); stats.line++;
    } else if (it.t === 'text') {
      if (it.vert) {
        s.addText(safeText(it.text), { x: (it.x - 4) * PX, y: (it.y - 8) * PX, w: (it.w + 8) * PX, h: (it.h + 16) * PX, vert: it.vert, fontFace: FONT, fontSize: it.size * 0.75 * K, bold: it.bold, color: it.color, align: 'center', valign: 'middle', margin: 0, wrap: false, fit: 'none', isTextBox: true }); stats.text++;
        continue;
      }
      const multi = it.lines > 1;
      const slack = multi ? it.w * 0.015 + 2 : 12;
      const nat = 1.366 * it.size; const dy = Math.max(0, nat - it.lh) * 0.8;
      // ссылки остаются кликабельными в PowerPoint и Google Slides
      const txt = SAFE ? it.text.replace(/\u2011/g, '-').replace(/\u2060/g, '') : it.text; // в Arial нет неразрывного дефиса и склейки U+2060 — рисуются пустотой
      const name = it.title && !titled ? ((titled = true), { objectName: 'wt-title' }) : it.page ? { objectName: 'wt-page', align: 'right' } : {};
      s.addText(it.runs ? it.runs.map((r) => ({ text: safeText(r.text), options: runOpts(r) })) : it.href ? [{ text: txt, options: { hyperlink: { url: it.href } } }] : txt, {
        x: (it.x - (it.align === 'right' ? slack : it.align === 'center' ? slack / 2 : 0)) * PX, y: (it.y + dy) * PX, w: (it.w + slack) * PX, h: it.h * PX,
        fontFace: FONT, fontSize: it.size * 0.75 * K, bold: it.bold, italic: it.italic, color: it.color,
        align: it.align, valign: 'top', margin: 0, lineSpacing: it.lh * 0.75, charSpacing: it.ls * 0.75, wrap: multi, fit: 'none', isTextBox: true, ...name,
      }); stats.text++;
    } else if (it.t === 'vrect' || it.t === 'vellipse' || it.t === 'vpath') {
      const opts = { x: it.x * PX, y: it.y * PX, w: Math.max(it.w, 0.01) * PX, h: Math.max(it.h, 0.01) * PX, fill: it.fill ? { color: it.fill.hex, transparency: Math.round((1 - it.fill.a) * 100) } : { type: 'none' } };
      if (it.line) opts.line = vecLine(it.line);
      let type = it.t === 'vellipse' ? pres.ShapeType.ellipse : pres.ShapeType.rect;
      if (it.t === 'vpath') {
        type = pres.ShapeType.custGeom;
        const X = (v) => (v - it.x) * PX, Y = (v) => (v - it.y) * PX;
        opts.points = it.pts.map((p) => p.t === 'Z' ? { close: true } : p.t === 'M' ? { x: X(p.x), y: Y(p.y), moveTo: true } : p.t === 'L' ? { x: X(p.x), y: Y(p.y) } : { x: X(p.x), y: Y(p.y), curve: { type: 'cubic', x1: X(p.x1), y1: Y(p.y1), x2: X(p.x2), y2: Y(p.y2) } });
      } else if (it.radius > 0) { type = pres.ShapeType.roundRect; opts.rectRadius = Math.min(it.radius * PX, Math.min(opts.w, opts.h) / 2); }
      if (it.texts) {
        s.addText(it.texts.map((t, k) => ({ text: safeText(t.text), options: { fontFace: FONT, fontSize: t.size * 0.75 * K, bold: t.bold, italic: t.italic, color: t.color, breakLine: k < it.texts.length - 1 } })), { shape: type, ...opts, align: 'center', valign: 'middle', margin: 0, fit: 'none' });
        stats.text++;
      } else s.addShape(type, opts);
      stats.rect++;
    } else if (it.t === 'vline') {
      s.addShape(pres.ShapeType.line, { x: Math.min(it.x1, it.x2) * PX, y: Math.min(it.y1, it.y2) * PX, w: Math.abs(it.x2 - it.x1) * PX, h: Math.abs(it.y2 - it.y1) * PX, flipH: it.x2 < it.x1, flipV: it.y2 < it.y1, line: vecLine(it.line) }); stats.line++;
    } else if (it.t === 'vtext') {
      const sl = 16, dx = it.align === 'center' ? sl / 2 : it.align === 'right' ? sl : 0;
      s.addText(safeText(it.text), { x: (it.x - dx) * PX, y: it.y * PX, w: (it.w + sl) * PX, h: it.h * PX, fontFace: FONT, fontSize: it.size * 0.75 * K, bold: it.bold, italic: it.italic, color: it.color, align: it.align, valign: 'middle', margin: 0, wrap: false, fit: 'none', isTextBox: true }); stats.text++;
    } else if (it.t === 'img') {
      const buf = await shot(i, it);
      const b64 = 'image/png;base64,' + buf.toString('base64');
      // экранный клип мог быть обрезан слайдом: пересчитаем позицию по фактическому размеру
      s.addImage({ data: b64, x: it.x * PX, y: it.y * PX, w: it.w * PX, h: it.h * PX }); stats.img++;
    }
  }
}
// Постобработка: свой XML диаграмм (у pptxgenjs порядок элементов не по схеме), формулы итогов, заполнители заголовков, поле номера слайда
const zip = await JSZip.loadAsync(await pres.write({ outputType: 'nodebuffer' }));
const chartFiles = Object.keys(zip.files).filter((f) => /^ppt\/charts\/chart\d+\.xml$/.test(f)).sort((a, b) => a.match(/\d+/)[0] - b.match(/\d+/)[0]);
for (const [i, f] of chartFiles.entries()) {
  const c = charts[i];
  zip.file(f, chartXml(c, { font: FONT, k: K }));
  if (!c.totals) continue;
  const rels = await zip.file(f.replace('charts/', 'charts/_rels/') + '.rels').async('string');
  const book = 'ppt/' + /Target="\.\.\/(embeddings\/[^"]+)"/.exec(rels)[1];
  const x = await JSZip.loadAsync(await zip.file(book).async('nodebuffer'));
  x.file('xl/worksheets/sheet1.xml', totalsFormulas(await x.file('xl/worksheets/sheet1.xml').async('string'), c));
  zip.file(book, await x.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}
for (const f of Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
  let x = await zip.file(f).async('string');
  // лишний пустой заполнитель, который pptxgenjs добавляет сам
  x = x.replace(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?<\/p:sp>/g, (sp) => {
    if (/<p:ph\s/.test(sp) && !/name="wt-/.test(sp)) return '';
    if (/name="wt-title"/.test(sp)) return sp.replace(/name="wt-title"/, 'name="Заголовок"').replace(/<p:cNvSpPr[^>]*\/>|<p:cNvSpPr[^>]*>[\s\S]*?<\/p:cNvSpPr>/, '<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>').replace(/<p:nvPr>\s*<\/p:nvPr>|<p:nvPr\s*\/>/, '<p:nvPr><p:ph type="title"/></p:nvPr>');
    if (/name="wt-page"/.test(sp)) return sp.replace(/name="wt-page"/, 'name="Номер слайда"').replace(/<a:r>([\s\S]*?)<a:t>0*(\d+)<\/a:t><\/a:r>/, '<a:fld id="{B6F15528-21DE-4FAA-801E-634DDDAF4B2B}" type="slidenum">$1<a:t>$2</a:t></a:fld>');
    return sp;
  });
  zip.file(f, x);
}
fs.writeFileSync(outPath, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
await browser.close();
console.log(`  ${path.relative(process.cwd(), outPath)}: ${nSlides} слайдов, диаграмм ${stats.chart}, таблиц ${stats.table}, фигур ${stats.rect + stats.line}, текстов ${stats.text}, картинок ${stats.img}`);
