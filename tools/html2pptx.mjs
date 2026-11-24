// HTML-презентация ДС → редактируемый PPTX (PowerPoint).
//   node tools/html2pptx.mjs <папка презентации | index.html> [выходной.pptx] [--safe-font]
//   --safe-font — Arial вместо Manrope (кегль −8%): для получателя без Manrope, иначе PowerPoint подставит свой шрифт и вёрстка поедет
// Как работает: слайды .wt-slide рендерятся в Chromium, из DOM берутся координаты и стили. Тексты становятся текстовыми
// блоками (Manrope, размеры и межстрочный интервал как в вёрстке), карточки и плашки — фигурами, линии таблиц — линиями.
// Иконки, логотип и гексагоны с фото вставляются картинками (PNG с прозрачностью). Шрифт Manrope должен стоять на компьютере.
// Зависимости (pptxgenjs, sharp, playwright) — в design-system/node_modules: cd design-system && npm install.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../design-system');
const requireDs = createRequire(path.join(DS, 'package.json'));
const { chromium } = await import(pathToFileURL(path.join(DS, 'node_modules/playwright/index.mjs')).href);
const pptxgen = requireDs('pptxgenjs');
const sharp = requireDs('sharp');

const args = process.argv.slice(2);
// --safe-font: Arial вместо Manrope — для получателей без установленного Manrope (PowerPoint подставит свой шрифт, и вёрстка поедет)
const SAFE = args.includes('--safe-font');
const [target, outArg] = args.filter((a) => !a.startsWith('--'));
const FONT = SAFE ? 'Arial' : 'Manrope';
const K = SAFE ? 0.92 : 1; // жирный Arial на крупных кеглях шире Manrope — с запасом, чтобы заголовки не уходили на лишнюю строку
if (!target) { console.error('Укажите папку презентации или index.html'); process.exit(1); }
const htmlPath = fs.statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
const outPath = outArg || path.join(path.dirname(htmlPath), path.basename(path.dirname(path.resolve(htmlPath))).replace(/^\d{4}-\d{2}-\d{2}-/, '') + '.pptx');
const PX = 1 / 96; // 1920px = 20in
const DSF = 3;

const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const page = await browser.newPage({ viewport: { width: 2000, height: 1200 }, deviceScaleFactor: DSF });
await page.goto(pathToFileURL(path.resolve(htmlPath)).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.addStyleTag({ content: '.wt-no-print,.bar{display:none!important} body{background:transparent!important} html.iso body *{visibility:hidden!important} html.iso [data-iso-on],html.iso [data-iso-on] *{visibility:visible!important} html.iso,html.iso body,html.iso .wt-slide{background:transparent!important;box-shadow:none!important}' });

const nSlides = await page.evaluate(() => document.querySelectorAll('.wt-slide').length);

const extract = (idx) => page.evaluate((idx) => {
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

  const walk = (el) => {
    if (el.nodeType !== 1) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
    const tag = el.tagName.toLowerCase();
    const b = rel(el.getBoundingClientRect());
    if (tag === 'svg' || el.matches(ART) || tag === 'img') {
      if (!inside(b)) return;
      el.setAttribute('data-iso', String(isoN));
      const p = tag === 'svg' ? 8 : 0; // у SVG ДС overflow: visible — обводка сот и подписи графиков выходят за рамку; остальное при снимке скрыто, запас безопасен
      const x0 = Math.max(0, b.x - p), y0 = Math.max(0, b.y - p), x1 = Math.min(1920, b.x + b.w + p), y1 = Math.min(1080, b.y + b.h + p);
      items.push({ t: 'img', iso: isoN, art: el.matches(ART), x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
      isoN++;
      return;
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
          t: 'text', ...tb, text, size: parseFloat(cs.fontSize), bold: fw >= 600, italic: cs.fontStyle === 'italic', color: col.hex,
          align: /center/.test(cs.textAlign) ? 'center' : /right|end/.test(cs.textAlign) ? 'right' : 'left', lh, ls: parseFloat(cs.letterSpacing) || 0, lines: tops.size, href: (el.closest('a[href]') || {}).href || null,
        });
      }
    }
    for (const c of el.children) walk(c);
  };
  const sbg = parseColor(getComputedStyle(slide).backgroundColor);
  walk(slide);
  return { bg: sbg ? sbg.hex : 'FFFFFF', items, sc, sr: { x: sr.left, y: sr.top } };
}, idx);

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
pres.company = 'ВЭБ Технологии';

const stats = { rect: 0, text: 0, img: 0, line: 0 };
for (let i = 0; i < nSlides; i++) {
  const { bg, items } = await extract(i);
  const s = pres.addSlide();
  s.background = { color: bg };
  for (const it of items) {
    if (it.t === 'rect') {
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
      const multi = it.lines > 1;
      const slack = multi ? it.w * 0.015 + 2 : 12;
      const nat = 1.366 * it.size; const dy = Math.max(0, nat - it.lh) * 0.8;
      // ссылки остаются кликабельными в PowerPoint и Google Slides
      const txt = SAFE ? it.text.replace(/\u2011/g, '-').replace(/\u2060/g, '') : it.text; // в Arial нет неразрывного дефиса и склейки U+2060 — рисуются пустотой
      s.addText(it.href ? [{ text: txt, options: { hyperlink: { url: it.href } } }] : txt, {
        x: it.x * PX, y: (it.y + dy) * PX, w: (it.w + slack) * PX, h: it.h * PX,
        fontFace: FONT, fontSize: it.size * 0.75 * K, bold: it.bold, italic: it.italic, color: it.color,
        align: it.align, valign: 'top', margin: 0, lineSpacing: it.lh * 0.75, charSpacing: it.ls * 0.75, wrap: multi, fit: 'none', isTextBox: true,
      }); stats.text++;
    } else if (it.t === 'img') {
      const buf = await shot(i, it);
      const b64 = 'image/png;base64,' + buf.toString('base64');
      // экранный клип мог быть обрезан слайдом: пересчитаем позицию по фактическому размеру
      s.addImage({ data: b64, x: it.x * PX, y: it.y * PX, w: it.w * PX, h: it.h * PX }); stats.img++;
    }
  }
}
await pres.writeFile({ fileName: outPath });
await browser.close();
console.log(`  ${path.relative(process.cwd(), outPath)}: ${nSlides} слайдов, фигур ${stats.rect + stats.line}, текстов ${stats.text}, картинок ${stats.img}`);
