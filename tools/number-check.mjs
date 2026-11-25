// Сверка чисел презентации с исходниками: check/numbers.md (вызывается из deck.mjs build и html2pptx.mjs).
// Число ищется в extracted/ (content.md, tables/*.csv), в текстовых sources/ и в столбце «Ответ» questions.md.
// Находит числа, которых нет в материалах; что число стоит у правильного показателя — проверяет агент при осмотре.
import fs from 'node:fs';
import path from 'node:path';

const SP = '[ \\u00a0\\u202f\\u2009]';
const NUM = new RegExp(`\\d{1,3}(?:${SP}\\d{3})+(?!\\d)(?:[.,]\\d+)?|\\d+(?:[.,]\\d+)?`, 'g');
const SCALE = [[/^(?:млрд|миллиард|bn\b)/i, 1e9], [/^(?:млн|миллион|mln\b)/i, 1e6], [/^(?:тыс|тысяч)/i, 1e3]];
const UNIT = /^(?:%|п\.\s?п|млн|млрд|тыс|трлн|BYN|USD|EUR|руб|раз|р\.|×|дн|день|дня|дней|мес|год|лет|час|ч\b|мин|сек|с\b|чел|шт)/i;
const DATE = /\d{1,2}\.\d{1,2}\.(?:\d{4}|\d{2})(?!\d)|\d{4}-\d{2}-\d{2}/g;
const SKIP = /https?:\/\/\S+|[\w.+-]+@[\w.-]+|\b[\w-]+(?:\.[\w-]+)*\.(?:by|com|org|net|io|md|pdf|pptx?|xlsx?|docx?|html|csv)\b(?:\/\S*)?/gi;
const REF = /(?:стр\.|с\.|слайд[а-яё]*|№|рис\.|табл\.|лист|гл\.|п\.|раздел[а-яё]*)\s*$/i;
const val = (s) => parseFloat(s.replace(new RegExp(SP, 'g'), '').replace(',', '.'));
const decimals = (s) => (/[.,](\d+)$/.exec(s) || ['', ''])[1].length;
const eq = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const isoDate = (s) => { const m = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/.exec(s); return m ? `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : s; };

// Выполняется в браузере: тексты слайда (по блокам) и числа из пропсов графиков
export function collectNumbers() {
  const W = window.Webtech, names = new Map(Object.entries(W).filter(([, v]) => typeof v === 'function').map(([k, v]) => [v, k]));
  const CHARTS = ['BarChart', 'StackedBar', 'LineChart', 'AreaChart', 'DonutChart', 'Waterfall', 'ComboChart', 'Sparkline'];
  return [...document.querySelectorAll('.wt-slide')].map((slide) => {
    const charts = [], seen = new Set();
    const key = Object.keys(slide).find((k) => k.startsWith('__reactFiber$'));
    const walk = (f) => { for (; f; f = f.sibling) {
      const name = names.get(f.type);
      if (CHARTS.includes(name) && !seen.has(f.memoizedProps) && !(name === 'LineChart' && names.get(f.return?.type) === 'AreaChart')) {
        seen.add(f.memoizedProps);
        const p = f.memoizedProps, out = [];
        const list = (arr, cats, s) => (arr || []).forEach((v, i) => { if (typeof v === 'number') out.push([v, [s, cats?.[i]].filter(Boolean).join(' · ')]); });
        if (p.series) p.series.forEach((s) => list(s.values, p.categories, s.name));
        else if (Array.isArray(p.data)) list(p.data.map((d) => d.value), p.data.map((d) => d.label), '');
        if (name === 'Waterfall') list(p.steps.map((s) => s.value), p.steps.map((s) => s.label), '');
        if (name === 'ComboChart') { list(p.bars.values, p.categories, p.bars.name); list(p.line.values, p.categories, p.line.name); }
        if (name === 'Sparkline') list(p.values, null, 'Sparkline');
        charts.push(...out.map(([v, label]) => ({ v, label: `${name}: ${label}` })));
      }
      walk(f.child);
    } };
    walk(slide[key]?.child);
    const SKIP = '.wt-footer, .wt-val, .wt-val-in, .wt-tick, .wt-donut-legend b, title, style, script, [data-no-number-check]';
    const blocks = new Map();
    const tw = document.createTreeWalker(slide, 4);
    while (tw.nextNode()) {
      const n = tw.currentNode, el = n.parentElement;
      if (!n.textContent.trim() || el.closest(SKIP)) continue;
      let b = el.closest('text') || el;
      while (b !== slide && !b.closest('svg') && getComputedStyle(b).display === 'inline') b = b.parentElement;
      blocks.set(b, (blocks.get(b) || '') + n.textContent);
    }
    return { texts: [...blocks.values()].map((t) => t.replace(/\s*\n\s*/g, ' ').trim()), charts };
  });
}

// Числа из текста слайда: { raw, v, scale, pct, date, ctx }
export function numbersIn(text) {
  const out = [];
  let t = text.replace(SKIP, (m) => ' '.repeat(m.length));
  t = t.replace(DATE, (m) => { out.push({ raw: m, date: isoDate(m), ctx: text }); return ' '.repeat(m.length); });
  t = t.replace(/\+375[\d\s()-]{7,}/g, (m) => { out.push({ raw: m.trim(), phone: m.replace(/\D/g, ''), ctx: text }); return ' '.repeat(m.length); });
  t = t.replace(/\+375/g, '    '); // заглушка телефона
  for (const m of t.matchAll(NUM)) {
    const before = t.slice(0, m.index), after = t.slice(m.index + m[0].length).replace(/^[\s  ]+/, '');
    // часть обозначения: H2, ISO 27001 проверяется, 24/7 и «99-З» — нет
    if (/[A-Za-zА-Яа-яЁё_]-?$/.test(before) || /^-?[A-Za-zА-Яа-яЁё]/.test(t.slice(m.index + m[0].length)) && !UNIT.test(t.slice(m.index + m[0].length))) continue;
    if (/^\/7/.test(after) && m[0] === '24' || /24\/$/.test(before)) continue;
    if (REF.test(before)) continue;
    const unit = UNIT.test(after), v = val(m[0]);
    if (/^0\d$/.test(m[0]) || (!unit && Number.isInteger(v) && v < 10)) continue; // номера шагов и счёт до десяти
    const sc = SCALE.find(([r]) => r.test(after));
    out.push({ raw: m[0], v, dec: decimals(m[0]), scale: sc ? sc[1] : 1, pct: after[0] === '%', ctx: text });
  }
  return out;
}

const unitOf = (x) => ({ 1e3: ' тыс.', 1e6: ' млн', 1e9: ' млрд' }[x.scale] || '') + (x.pct ? '%' : '');

export function indexSource(text) {
  const vals = new Map(), dates = new Set(), digits = text.replace(/[\s()-]/g, '');
  const add = (v, raw) => { if (Number.isFinite(v) && !vals.has(v)) vals.set(v, raw); };
  for (const m of text.matchAll(DATE)) dates.add(isoDate(m[0]));
  for (const m of text.matchAll(NUM)) {
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 14).replace(/^[\s  ]+/, '');
    const sc = SCALE.find(([r]) => r.test(after));
    const base = val(m[0]);
    add(base, m[0]);
    if (sc) add(base * sc[1], m[0] + ' ' + after.match(/^\S+/)[0]);
    if (after[0] === '%') add(base / 100, m[0] + '%');
    for (const part of m[0].split(new RegExp(SP))) add(val(part), part);
  }
  // английская запись 1,234.5 и 1,234,567
  for (const m of text.matchAll(/\d{1,3}(?:,\d{3})+(?:\.\d+)?/g)) add(parseFloat(m[0].replace(/,/g, '')), m[0]);
  return { vals, list: [...vals.keys()], dates, digits };
}

// found | rounded (с исходным значением) | missing
export function lookup(x, src) {
  if (x.date) return src.dates.has(x.date) ? { st: 'found' } : { st: 'missing' };
  if (x.phone) return src.digits.includes(x.phone) ? { st: 'found' } : { st: 'missing' };
  const v = Math.abs(x.v), full = v * x.scale;
  const has = (n) => src.vals.has(n) || src.list.some((s) => eq(s, n));
  if (has(full) || (x.pct && has(v / 100))) return { st: 'found' };
  // значение графика может быть долей (0,43 ↔ 43 %) или в других единицах (тыс., млн)
  if (x.chart && has(v / 100) && v > 1 && v <= 100) return { st: 'found' };
  if (String(x.raw).replace(/\D/g, '').replace(/^0+/, '').length >= 2 || x.chart) {
    const step = 0.5 * 10 ** -x.dec;
    for (const k of x.scale > 1 ? [x.scale] : x.pct ? [1, 0.01] : x.chart ? [1, 0.01, 1e3, 1e6, 1e9] : [1]) {
      const hit = src.list.find((s) => s !== 0 && Math.abs(s / k - v) <= step + 1e-9 && Math.abs(s / k - v) <= Math.abs(v) * 0.05);
      if (hit !== undefined) return { st: 'rounded', from: src.vals.get(hit) };
    }
  }
  return { st: 'missing' };
}

// «= (87 - 43) / 43 * 100»: считает выражение, операнды должны быть в исходниках (или 100, 1000, 10^6, 1)
export function evalFormula(s, src) {
  const t = s.replace(/−|–/g, '-').replace(/×|·/g, '*').replace(/[÷:]/g, '/').replace(new RegExp(`(\\d)${SP}(?=\\d{3}(?!\\d))`, 'g'), '$1').replace(/(\d),(\d)/g, '$1.$2').replace(/\s/g, '');
  if (!/^[\d.+\-*/()]+$/.test(t)) return { err: 'в формуле допустимы только числа, + − × ÷ и скобки' };
  const ops = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (ops.length < 2) return { err: 'в формуле нужны минимум два числа из исходников' };
  const free = [1, 12, 100, 1000, 1e6, 1e9];
  const alien = ops.filter((n) => !free.includes(n) && !src.list.some((x) => eq(x, n)));
  if (alien.length) return { err: 'чисел нет в исходниках: ' + alien.join(', ') };
  if (ops.every((n) => free.includes(n))) return { err: 'в формуле нет чисел из исходников' };
  let i = 0;
  const expr = () => { let a = term(); while (t[i] === '+' || t[i] === '-') { const o = t[i++], b = term(); a = o === '+' ? a + b : a - b; } return a; };
  const term = () => { let a = fac(); while (t[i] === '*' || t[i] === '/') { const o = t[i++], b = fac(); a = o === '*' ? a * b : a / b; } return a; };
  const fac = () => { if (t[i] === '-') { i++; return -fac(); } if (t[i] === '(') { i++; const a = expr(); if (t[i++] !== ')') throw 0; return a; } const m = /^\d+(?:\.\d+)?/.exec(t.slice(i)); if (!m) throw 0; i += m[0].length; return +m[0]; };
  try { const v = expr(); if (i < t.length || !Number.isFinite(v)) throw 0; return { v }; } catch { return { err: 'формула не читается' }; }
}

// Обоснование ненайденного числа; null — принято, иначе что не так
export function judgeReason(x, reason, src) {
  const r = (reason || '').trim();
  if (!r || r === '?') return 'нет обоснования';
  if (r.startsWith('=')) {
    if (x.v === undefined) return 'формула годится только для чисел';
    const e = evalFormula(r.slice(1).split(/;|\/\//)[0], src);
    if (e.err) return e.err;
    const ok = [x.v, x.v * x.scale].some((n, k) => Math.abs(Math.abs(e.v) - Math.abs(n)) <= 0.5 * 10 ** -x.dec * (k ? x.scale : 1) + 1e-9) || (x.pct && Math.abs(Math.abs(e.v) * 100 - Math.abs(x.v)) <= 0.5 * 10 ** -x.dec + 1e-9);
    return ok ? null : `формула даёт ${+e.v.toFixed(4)}, на слайде ${x.raw}`;
  }
  if (/^(?:ответ|источник|допущение|пример|общеизвестно|не данные)\s*:\s*.{10,}/i.test(r)) return null;
  return 'начните с «= формула», «ответ:», «источник:», «допущение:», «пример:», «общеизвестно:» или «не данные:»';
}

function readSources(dir) {
  const parts = [];
  const read = (f) => { try { parts.push(fs.readFileSync(f, 'utf8')); } catch { /* нет файла */ } };
  const ex = path.join(dir, 'extracted');
  read(path.join(ex, 'content.md'));
  for (const f of fs.existsSync(path.join(ex, 'tables')) ? fs.readdirSync(path.join(ex, 'tables')) : []) if (/\.csv$/i.test(f)) read(path.join(ex, 'tables', f));
  for (const f of fs.existsSync(path.join(dir, 'sources')) ? fs.readdirSync(path.join(dir, 'sources')) : []) {
    parts.push(f.replace(/_/g, '.')); // дата в имени файла
    if (/\.(md|txt|csv)$/i.test(f)) read(path.join(dir, 'sources', f));
  }
  if (!parts.join('').trim()) return null;
  // из questions.md — только столбец «Ответ»
  const q = path.join(dir, 'questions.md');
  let col = -1;
  if (fs.existsSync(q)) for (const l of fs.readFileSync(q, 'utf8').split('\n')) {
    if (!l.startsWith('|')) { col = -1; continue; }
    const c = l.split('|').map((s) => s.trim());
    if (col < 0) col = c.findIndex((s) => /^ответ/i.test(s)); else if (c[col]) parts.push(c[col]);
  }
  return parts.join('\n\n');
}

const cell = (s) => String(s).replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
const keyOf = (n, raw, ctx) => [n, raw, ctx].map(cell).join('|');
const FILE = (dir) => path.join(dir, 'check/numbers.md');
function readReasons(dir) {
  const map = new Map();
  if (fs.existsSync(FILE(dir))) for (const l of fs.readFileSync(FILE(dir), 'utf8').split('\n')) {
    const m = /^\|\s*(\d+)\s*\|([^|]*)\|([^|]*)\|([^|]*)\|\s*$/.exec(l);
    if (m) map.set(keyOf(m[1], m[2], m[3]), m[4].trim());
  }
  return map;
}

// slides — результат collectNumbers. Возвращает запись для meta.numbers
export function writeNumbers(dir, slides, meta) {
  const text = readSources(dir);
  if (!text) { fs.rmSync(FILE(dir), { force: true }); return { skipped: true, summary: '  Числа: исходников нет, сверка не выполнена' }; }
  const src = indexSource(text), reasons = readReasons(dir);
  const ownDate = String(meta.date || ''), ownYear = ownDate.slice(0, 4);
  const rows = new Map(); let found = 0;
  slides.forEach((s, i) => {
    const all = s.texts.flatMap(numbersIn).filter((x) => !(x.date && x.date === ownDate) && !(x.raw === ownYear && !x.pct));
    for (const c of s.charts) { const raw = String(c.v).replace('.', ','); all.push({ raw, v: c.v, dec: decimals(raw), scale: 1, chart: true, ctx: c.label }); }
    for (const x of all) {
      const r = lookup(x, src);
      if (r.st === 'found') { found++; continue; }
      if (r.st === 'missing' && x.chart && x.v === 0) { found++; continue; }
      const at = x.ctx.indexOf(x.raw);
      const ctx = cell(x.chart || x.ctx.length <= 70 ? x.ctx : (at > 30 ? '…' : '') + x.ctx.slice(Math.max(0, at - 30), at + 40) + '…');
      const shown = x.raw + (x.chart ? '' : unitOf(x));
      rows.set(keyOf(i + 1, shown, ctx), { n: i + 1, shown, ctx, x, ...r });
    }
  });
  const list = [...rows.entries()].map(([k, r]) => ({ ...r, reason: reasons.get(k) || '?' }));
  const miss = list.filter((r) => r.st === 'missing').map((r) => ({ ...r, bad: judgeReason(r.x, r.reason, src) }));
  const round = list.filter((r) => r.st === 'rounded');
  const open = miss.filter((r) => r.bad);
  fs.mkdirSync(path.join(dir, 'check'), { recursive: true });
  fs.writeFileSync(FILE(dir), `# Сверка чисел

Найдено в исходниках: ${found}, округлено: ${round.length}, нет в исходниках: ${miss.length}, без обоснования: ${open.length}.

## Нет в исходниках
Сначала исправить опечатки и лишние числа в \`deck.jsx\`. Остальным заполнить «Обоснование» и собрать снова: \`= (87 − 43) / 43 × 100\` (операнды из исходников, результат проверяется), \`ответ: …\` (что сказал пользователь), \`источник: …\` (внешняя публикация: издание, дата; если таких чисел много — сохранить текст в sources/ через intake), \`допущение: …\` (помечено на слайде), \`пример: …\`, \`общеизвестно: …\` (номер стандарта, закона), \`не данные: …\` (номер, название).

| Слайд | Число | Где | Обоснование |
|---|---|---|---|
${miss.map((r) => `| ${r.n} | ${cell(r.shown)} | ${r.ctx} | ${cell(r.reason)} |`).join('\n')}
${open.some((r) => r.reason !== '?') ? '\nНе принято:\n' + open.filter((r) => r.reason !== '?').map((r) => `- слайд ${r.n}, ${r.shown}: ${r.bad}`).join('\n') + '\n' : ''}
## Округлено или в других единицах
Проверить, что округление уместно и относится к тому же показателю.

${round.map((r) => `- слайд ${r.n}: ${r.shown} ← ${cell(r.from)} — ${r.ctx}`).join('\n') || '—'}
`);
  return {
    found, rounded: round.length, missing: miss.length,
    problems: open.map((r) => `слайд ${r.n}: ${r.shown} — ${r.bad} («${r.ctx.slice(0, 60)}»)`),
    summary: `  Числа: найдено ${found}, округлено ${round.length}, нет в исходниках ${miss.length}${open.length ? `, без обоснования ${open.length} → заполните check/numbers.md` : ''}`,
  };
}

// Что мешает финалу и PPTX; колоды, собранные до появления сверки, и колоды без исходников не проверяются
export function numberProblems(meta) {
  const p = meta.numbers?.problems || [];
  return p.length ? [...p.slice(0, 10), ...(p.length > 10 ? [`и ещё чисел: ${p.length - 10}`] : []), 'исправьте числа или заполните check/numbers.md и выполните build'] : [];
}
