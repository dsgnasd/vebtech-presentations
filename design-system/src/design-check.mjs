// Проверка дизайна готовых слайдов: отступы, выравнивание, симметрия, переполнение, типографика, обход ДС.
// collectDesign выполняется в браузере (page.evaluate) и возвращает замечания; lintDeck — по исходнику deck.jsx, в Node.
// level: error — выдавать нельзя, warn — посмотреть глазами и решить.

export function collectDesign() {
  const W = window.Webtech;
  const ART = '.wt-hexcluster, .wt-hexart, .wt-title-hex, .wt-section-hex, .wt-contact-hex';
  const SERVICE = '.wt-l-title, .wt-l-section, .wt-l-contact, .wt-l-agenda, .wt-l-quote';
  const out = [];
  const fiberKey = (el) => Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
  const rgb = (s) => { const m = /^rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(/[ ,/]+/).map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };

  [...document.querySelectorAll('.wt-slide')].forEach((s, idx) => {
    const n = idx + 1;
    const sr = s.getBoundingClientRect();
    const k = sr.width / 1920 || 1;
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k }; };
    const add = (level, rule, text) => { if (!out.some((o) => o.n === n && o.rule === rule && o.text === text)) out.push({ n, level, rule, text }); };
    const short = (t) => '«' + t.replace(/\s+/g, ' ').trim().slice(0, 42) + '»';
    const service = s.matches(SERVICE);
    const split = !!s.querySelector('.wt-image-text'); // заголовок стоит сбоку от изображения
    const body = s.querySelector('.wt-slide-body');
    const header = s.querySelector('.wt-slide-header');
    const skip = (el) => el.closest(ART) || el.closest('.wt-footer') || el.closest('[aria-hidden="true"]:not(svg):not(svg *)');
    const visible = (el) => { const c = getComputedStyle(el); return c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0; };

    // Строки текста: каждый текстовый узел с видимыми прямоугольниками
    const texts = [];
    const tw = document.createTreeWalker(s, 4);
    while (tw.nextNode()) {
      const t = tw.currentNode, p = t.parentElement;
      if (!t.textContent.trim() || p.closest('style, script, title, desc, defs') || skip(p) || !visible(p)) continue;
      const r = document.createRange();
      r.selectNodeContents(t);
      const b = r.getBoundingClientRect();
      if (b.width < 1) continue;
      const cs = getComputedStyle(p);
      texts.push({ t, p, svg: !!p.closest('svg'), text: t.textContent, size: parseFloat(cs.fontSize), weight: +cs.fontWeight, x: (b.left - sr.left) / k, y: (b.top - sr.top) / k, r: (b.right - sr.left) / k, b: (b.bottom - sr.top) / k, cs });
    }

    // 1. Иконки, которых нет в ДС: компонент молча ничего не рисует
    const walk = (f) => { for (; f; f = f.sibling) { if (f.type === W.Icon && f.memoizedProps?.name && !W.iconNames.includes(f.memoizedProps.name)) add('error', 'нет иконки', `иконки «${f.memoizedProps.name}» нет в ДС — место пустое; имена: Webtech.iconNames`); walk(f.child); } };
    if (fiberKey(s)) walk(s[fiberKey(s)].child);

    // 2. Локальный <style> поверх компонентов
    if (s.querySelector('style')) add('error', 'обход ДС', 'локальный <style> меняет компоненты ДС — убрать, сократить содержание или взять другой макет');

    // 3. Заголовок
    const h1 = header && header.querySelector('h1');
    if (h1) {
      const hb = box(h1), lh = parseFloat(getComputedStyle(h1).lineHeight) || 72;
      if (Math.round(hb.h / lh) > (split ? 3 : 2)) add('error', 'заголовок', 'длиннее двух строк — сократить');
      if (/[.]$/.test(h1.textContent.trim()) && !/(тыс|мес|п|д|г)\.$/.test(h1.textContent.trim())) add('error', 'заголовок', 'точка в конце');
    }

    // Содержательная графика и блоки
    const ink = body ? [...body.querySelectorAll('*')].filter((el) => {
      if ((header && header.contains(el)) || skip(el) || !visible(el) || el.closest('style')) return false;
      if (el.parentElement.closest('svg')) return false;
      if (/^(svg|img)$/i.test(el.tagName)) return true;
      const c = getComputedStyle(el), bg = rgb(c.backgroundColor);
      if ((bg && bg.a > 0.02) || ['Top', 'Right', 'Bottom', 'Left'].some((d) => parseFloat(c['border' + d + 'Width']) > 0 && c['border' + d + 'Style'] !== 'none') || /inset/.test(c.boxShadow)) return true;
      return [...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim());
    }).map((el) => ({ el, ...box(el) })).filter((b) => b.w > 1 && b.h > 1) : [];

    if (header && ink.length && !service && !split) {
      const hb = Math.max(...texts.filter((t) => header.contains(t.p)).map((t) => t.b), 0);
      const gap = Math.min(...ink.map((i) => i.y)) - hb;
      if (gap < 24) add('error', 'отступ под заголовком', `${Math.round(gap)}px до содержания, нужно от 32`);
    }
    if (body && ink.length) {
      const bb = box(body);
      const low = Math.max(...ink.map((i) => i.b));
      if (!s.matches('.wt-slide-bleed') && low > bb.b + 16 && !service) add('error', 'нижнее поле', `содержание заходит в нижнее поле на ${Math.round(low - bb.b)}px`);
      const side = ink.filter((i) => (i.x < 92 || i.r > 1828) && i.w < 1900);
      if (side.length && !service) add('error', 'боковые поля', 'содержание выходит за поля 96px');
      // 4. Пустота: доля высоты рабочей области, не занятая содержанием
      if (!service && header && !split) {
        const top = box(header).b, bands = ink.map((i) => [Math.max(i.y, top), Math.min(i.b, bb.b)]).filter(([a, b]) => b > a).sort((a, b) => a[0] - b[0]);
        let filled = 0, end = top;
        for (const [a, b] of bands) { if (b > end) { filled += b - Math.max(a, end); end = b; } }
        const empty = 1 - filled / (bb.b - top);
        if (empty > 0.6) add('warn', 'пустой слайд', `${Math.round(empty * 100)}% рабочей высоты пусто — укрупнить визуал или объединить слайды`);
      }
    }

    // 5. Наложение текстов
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      const trim = (t) => Math.max(0, (t.b - t.y) - t.size) / 2; // межстрочный запас не считается
      const ox = Math.min(a.r, b.r) - Math.max(a.x, b.x), oy = Math.min(a.b - trim(a), b.b - trim(b)) - Math.max(a.y + trim(a), b.y + trim(b));
      if (ox > 6 && oy > 8 && a.p !== b.p && !a.p.contains(b.p) && !b.p.contains(a.p) && a.p.parentElement !== b.p.parentElement?.closest('p')) {
        const rot = /vertical/.test(a.cs.writingMode + b.cs.writingMode);
        if (!rot) add('error', 'наложение', `${short(a.text)} и ${short(b.text)} перекрываются`);
      }
    }

    // 6. Парные блоки: колонки одного ряда должны быть устроены одинаково
    const surface = (el) => { const c = getComputedStyle(el), bg = rgb(c.backgroundColor); return (bg && bg.a > 0.02) || /inset/.test(c.boxShadow) || ['Top', 'Right', 'Bottom', 'Left'].every((d) => parseFloat(c['border' + d + 'Width']) > 0 && c['border' + d + 'Style'] !== 'none'); };
    const inner = (el) => (el.classList.contains('wt-gridslide-cell') && el.firstElementChild ? el.firstElementChild : el);
    for (const row of body ? body.querySelectorAll('*') : []) {
      const c = getComputedStyle(row);
      if (!/grid|flex/.test(c.display) || row.closest('table, svg, .wt-roadmap, .wt-footer') || (header && header.contains(row))) continue;
      const kids = [...row.children].filter(visible).map(inner).map((el) => ({ el, ...box(el) })).filter((b) => b.w > 240 && b.h > 120);
      if (kids.length < 2 || kids.length > 5) continue;
      const a = kids[0];
      const line = kids.filter((b) => Math.abs(b.w - a.w) < a.w * 0.06 && Math.abs(b.y - a.y) < 40);
      if (line.length < 2 || line.length !== kids.filter((b) => Math.abs(b.y - a.y) < 40).length) continue;
      const base = (el) => [...el.classList].filter((x) => /^wt-[a-z]+(-[a-z]+)?$/.test(x))[0] || el.tagName;
      if (new Set(line.map((b) => base(b.el))).size > 1) continue;
      const surf = line.filter((b) => surface(b.el)).length;
      if (surf && surf < line.length) add('error', 'разные подложки', 'в одном ряду часть колонок с подложкой, часть без — сделать одинаково (ComparisonSlide или Card)');
      else {
        const hs = line.map((b) => b.h);
        if (surf && Math.max(...hs) - Math.min(...hs) > 8) add('error', 'разная высота', `колонки одного ряда отличаются по высоте на ${Math.round(Math.max(...hs) - Math.min(...hs))}px`);
      }
      const ys = line.map((b) => b.y);
      if (Math.max(...ys) - Math.min(...ys) > 4) add('error', 'верхняя линия', 'колонки одного ряда начинаются на разной высоте');
      const heads = line.map((b) => texts.filter((t) => b.el.contains(t.p) && !t.svg && t.weight >= 700 && t.size >= 28));
      if (heads.every((h) => h.length && h.length === heads[0].length)) heads[0].forEach((h, q) => {
        const same = heads.map((x) => x[q]);
        if (same.every((x) => Math.abs(x.size - h.size) < 1)) {
          const d = Math.max(...same.map((x) => x.y)) - Math.min(...same.map((x) => x.y));
          if (d > 6 && d < 120) add(q === 0 ? 'error' : 'warn', 'строки колонок', `${short(h.text)} и соседний подзаголовок сдвинуты на ${Math.round(d)}px — выровнять по одной линии`);
        }
      });
      const icons = line.map((b) => b.el.querySelectorAll('.wt-icon').length);
      if (Math.max(...icons) > 0 && Math.min(...icons) === 0) add('warn', 'иконки', 'в одном ряду иконка есть не у всех колонок');
    }

    // 6а. Поля карточек: содержание не упирается в край и не выходит за него
    for (const card of body ? body.querySelectorAll('.wt-card, .wt-kpi, .wt-compare-col, .wt-callout') : []) {
      const b = box(card), pad = Math.min(8, parseFloat(getComputedStyle(card).paddingBottom) || 0);
      // у графиков внизу пустое поле SVG: берём их подписи, а не рамку
      const inside = [...ink.filter((i) => i.el !== card && card.contains(i.el) && !i.el.matches('.wt-chart-svg')), ...texts.filter((t) => t.svg && card.contains(t.p))];
      if (!inside.length) continue;
      const low = b.b - Math.max(...inside.map((i) => i.b)), right = b.r - Math.max(...inside.map((i) => i.r));
      const name = short((card.querySelector('.wt-card-title') || card).textContent);
      if (low < -1 || right < -1) add('error', 'край карточки', `${name}: содержание выходит за карточку на ${Math.round(-Math.min(low, right))}px`);
      else if (low < pad) add('error', 'край карточки', `${name}: до нижнего края ${Math.round(low)}px, нужно от 12 — сократить или уменьшить`);
    }

    // 6б. Своя схема: узлы не налезают друг на друга, подпись помещается в узел и в рамку схемы
    for (const svg of body ? body.querySelectorAll('svg') : []) {
      if (svg.closest('.wt-chart, .wt-donut, .wt-icon, .wt-hexagon') || svg.matches('.wt-icon, .wt-chart-svg') || skip(svg) || svg.parentElement.closest('svg')) continue;
      const vb = box(svg);
      if (vb.w < 300 || vb.h < 150) continue;
      const labels = texts.filter((t) => svg.contains(t.p));
      if (!labels.length) continue;
      const nodes = [...svg.querySelectorAll('rect')].filter((r) => !r.closest('defs, marker, clipPath') && visible(r) && getComputedStyle(r).fill !== 'none').map((el) => ({ el, ...box(el) })).filter((r) => r.w > 60 && r.h > 40);
      // узел — прямоугольник, внутри которого стоит центр подписи
      const own = (r) => labels.filter((t) => { const cx = (t.x + t.r) / 2, cy = (t.y + t.b) / 2; return cx > r.x && cx < r.r && cy > r.y && cy < r.b; });
      const holds = (o, i) => o.x <= i.x + 2 && o.y <= i.y + 2 && o.r >= i.r - 2 && o.b >= i.b - 2;
      const named = nodes.map((r) => ({ ...r, t: own(r) })).filter((r) => r.t.length);
      for (let i = 0; i < named.length; i++) for (let j = i + 1; j < named.length; j++) {
        const p = named[i], q = named[j];
        if (holds(p, q) || holds(q, p)) continue;
        const gx = Math.max(p.x, q.x) - Math.min(p.r, q.r), gy = Math.max(p.y, q.y) - Math.min(p.b, q.b);
        if (Math.max(gx, gy) < 8 && Math.max(gx, gy) < 0) add('error', 'узлы схемы', `${short(p.t[0].text)} и ${short(q.t[0].text)} налезают друг на друга`);
        else if (Math.max(gx, gy) < 8 && Math.min(gx, gy) < 0) add('error', 'узлы схемы', `${short(p.t[0].text)} и ${short(q.t[0].text)} стоят вплотную, нужно от 8px`);
      }
      for (const r of named) {
        if (named.some((q) => q !== r && holds(r, q))) continue;
        for (const t of r.t) if (Math.min(t.x - r.x, r.r - t.r) < 6) add('error', 'подпись узла', `${short(t.text)} упирается в край узла — сократить или расширить узел`);
      }
      for (const t of labels) if (t.x < vb.x - 3 || t.r > vb.r + 3 || t.y < vb.y - 6 || t.b > vb.b + 6) add('error', 'рамка схемы', `${short(t.text)} выходит за рамку схемы и может обрезаться`);
    }

    // 7. Линейки вместо структуры: самодельные блоки с одной границей
    const rules = ink.filter(({ el, w }) => {
      const c = getComputedStyle(el);
      if (/\bwt-/.test(el.className) || el.closest('table, li, [class*="wt-"]:not(.wt-slide-body):not(.wt-slide):not(.wt-frame):not(.wt-frame-inner):not(.wt-deck)')) return false;
      return w > 200 && ['Top', 'Bottom', 'Left', 'Right'].filter((d) => parseFloat(c['border' + d + 'Width']) >= 1 && c['border' + d + 'Style'] !== 'none').length === 1;
    }).length;
    if (rules >= 3) add(rules >= 4 ? 'error' : 'warn', 'линейки', `${rules} самодельных линеек — взять Card, ComparisonSlide, таблицу или отступы`);

    // 8. Шрифт
    for (const t of texts) {
      if (t.p.closest('[data-allow-small]')) continue;
      if (t.size < 23.5 && !t.svg) add('error', 'мелкий текст', `${short(t.text)}: ${t.size}px, минимум 24`);
      if (!/Manrope/.test(t.cs.fontFamily)) add('error', 'шрифт', `${short(t.text)}: не Manrope`);
    }
    const custom = new Set(texts.filter((t) => !t.svg && !/\bwt-/.test(t.p.className) && !t.p.closest('.wt-slide-header') && t.p.closest('[style*="font-size"]') && ![24, 26, 28, 32, 36, 40, 48, 56, 64, 80, 96].includes(t.size)).map((t) => t.size));
    if (custom.size && !service) add('warn', 'кегль вне шкалы', `${[...custom].join(', ')}px — взять Heading, Text или кегль из шкалы 24–28–32–36–48–64`);

    // 9. Контраст текста и подложки
    for (const t of texts) {
      if (t.svg) continue;
      const fg = rgb(t.cs.color);
      let bg = null;
      for (let e = t.p; e && !bg; e = e === s ? null : e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > 0.9) bg = c; }
      if (!fg || !bg) continue;
      const [hi, lo] = [lum(fg), lum(bg)].sort((p, q) => q - p), cr = (hi + 0.05) / (lo + 0.05);
      const large = t.size >= 32 || (t.size >= 24 && t.weight >= 700);
      if (cr < (large ? 3 : 4.5) - 0.05) add('error', 'контраст', `${short(t.text)}: ${cr.toFixed(1)}:1`);
    }

    // 10. Строки: висячие предлоги и одно слово на последней строке
    const blocks = new Map();
    for (const t of texts) if (!t.svg && !t.p.closest('table, .wt-badge, .wt-status')) { const q = t.p.closest('h1, h2, h3, p, li, div, span'); if (q && !blocks.has(q)) blocks.set(q, t); }
    for (const [el, t] of blocks) {
      const str = t.text, words = [...str.matchAll(/[^ \t\n\r]+/g)];
      if (words.length < 3) continue;
      const tops = words.map((m) => { const r = document.createRange(); r.setStart(t.t, m.index); r.setEnd(t.t, m.index + m[0].length); const q = r.getClientRects(); return q.length ? Math.round(q[0].top / k / 4) : null; });
      const lines = [];
      words.forEach((m, i) => { if (tops[i] === null) return; if (!lines.length || Math.abs(lines.at(-1).top - tops[i]) > 2) lines.push({ top: tops[i], w: [] }); lines.at(-1).w.push(m[0]); });
      if (lines.length < 2) continue;
      const head = el.tagName === 'H1' || el.tagName === 'H2';
      const last = lines.at(-1).w;
      if (last.length === 1 && !/ /.test(last[0]) && last[0].length < 14 && !/\d/.test(last[0])) add(head ? 'error' : 'warn', 'одно слово на строке', short(str) + ` — висит «${last[0]}»`);
      for (const l of lines.slice(0, -1)) { const e = l.w.at(-1).split(' ').at(-1); if (/^[а-яё]{1,2}$/i.test(e) && !/^(не|ПО|ИТ|ИБ|ИИ|ЮЛ|ФЛ|РБ|БД|АС)$/.test(e)) add(head ? 'error' : 'warn', 'висячий предлог', short(str) + ` — «${e}» в конце строки`); }
    }

    // 11. Крупная синяя заливка
    const blue = ink.filter(({ el }) => { const c = rgb(getComputedStyle(el).backgroundColor); return c && c.a > 0.9 && c.b > 150 && c.r < 80 && c.g < 140; }).reduce((a, i) => a + i.w * i.h, 0) / (1920 * 1080);
    if (blue > 0.13 && !service) add('error', 'синяя заливка', `${Math.round(blue * 100)}% площади, допустимо около 10%`);
  });
  return out;
}

// Исходник: цвета мимо токенов
export function lintDeck(code) {
  const out = [];
  code.split('\n').forEach((l, i) => {
    if (/^\s*\/\//.test(l)) return;
    const m = /['"`](#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))['"`]/.exec(l);
    if (m) out.push({ n: 0, level: 'error', rule: 'цвет мимо токенов', text: `deck.jsx:${i + 1}: ${m[1]} — взять var(--…)` });
  });
  return out;
}
