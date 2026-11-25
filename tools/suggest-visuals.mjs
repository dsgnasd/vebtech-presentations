// Подсказки «что превратить в визуал» по извлечённым материалам → extracted/visual-hints.md
// Вызывается из deck.mjs intake/extract. Эвристика: агент проверяет каждую подсказку по исходнику.
import fs from 'node:fs';
import path from 'node:path';

const parseCsv = (s) => {
  s = s.replace(/^\uFEFF/, '');
  const sep = (s.split('\n')[0].match(/;/g) || []).length > (s.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const rows = [[]];
  let cell = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === sep) { rows.at(-1).push(cell.trim()); cell = ''; }
    else if (c === '\n') { rows.at(-1).push(cell.trim()); cell = ''; rows.push([]); }
    else if (c !== '\r') cell += c;
  }
  rows.at(-1).push(cell.trim());
  return rows.filter((r) => r.some(Boolean));
};
const num = (s) => { const t = String(s).replace(/[\s\u00a0\u202f%]|BYN|USD|EUR|млн|тыс|млрд/gi, '').replace(',', '.').replace('−', '-'); return /^-?\d+(\.\d+)?$/.test(t) ? +t : NaN; };
const PERIOD = /^(?:(?:19|20)\d\d(?:\s*г\.?)?|(?:[IV]{1,3}|[1-4])\s*(?:кв|квартал|Q).*|Q[1-4].*|янв|фев|мар|апр|ма[йя]|июн|июл|авг|сен|окт|ноя|дек)/i;

export function tableHint(rows) {
  if (rows.length < 3) return null;
  const [head, ...body] = rows;
  const numeric = head.map((_, c) => c).filter((c) => c > 0 && body.filter((r) => !Number.isNaN(num(r[c] ?? ''))).length >= body.length * 0.6);
  if (!numeric.length) return body.length >= 2 && head.length >= 3 ? 'текстовая таблица → ComparisonTable, ComparisonSlide или Matrix2x2, если есть две оси оценки' : null;
  const h = head.join(' ').toLowerCase();
  if (/план/.test(h) && /факт/.test(h)) return 'план и факт → PlanFactCard, MeterList (DashboardSlide) или ComboChart';
  const vals = (c) => body.map((r) => num(r[c] ?? '')).filter((v) => !Number.isNaN(v));
  if (body.filter((r) => PERIOD.test(r[0])).length >= body.length * 0.6) return numeric.length > 1 ? 'динамика нескольких рядов → LineChart или StackedBar' : 'динамика → BarChart (до 8 периодов) или LineChart';
  if (head.slice(1).filter((x) => PERIOD.test(x)).length >= 2) return 'периоды в колонках → LineChart или сгруппированный BarChart, строки — серии';
  const share = numeric.find((c) => { const v = vals(c); const t = v.reduce((a, b) => a + b, 0); return v.length >= 2 && v.every((x) => x >= 0) && Math.abs(t - 100) <= 1; });
  if (share !== undefined) return `доли в колонке «${head[share]}» дают 100 → DonutChart (до 6 частей) или StackedBar percent`;
  const c = numeric[0], v = vals(c);
  if (v.length >= 3 && v.every((x, i) => x > 0 && (!i || x < v[i - 1])) && /этап|шаг|стад|заяв|лид|конверс/i.test(rows.flat().join(' '))) return 'убывающие этапы → Funnel';
  return body.length <= 12 ? `величины по категориям («${head[c]}») → BarChart horizontal по убыванию` : `${body.length} строк → топ-8 в BarChart horizontal, полная таблица в приложение`;
}

const SIGNALS = [
  [/(?:^|[^а-яё])(?:сначала|затем|после этого|этап|шаг\s*\d|порядок действий|процедур)/i, 'последовательность → ProcessFlow'],
  [/(?:^|[^а-яё])(?:цикл|ежемесячно|ежеквартально|обратн\S+ связ|повторя\S+)/i, 'повтор → Cycle'],
  [/(?:^|[^а-яё])(?:дорожн\S+ карт|I{1,3}V? квартал|[1-4] квартал|к концу 20\d\d)/i, 'план во времени → Roadmap или PhaseTimeline'],
  [/(?:19|20)\d\d[^\n]{0,60}(?:создан|основан|запущен|открыт|внедр|введ)/i, 'события с датами → Timeline'],
  [/(?:^|[^а-яё])(?:архитектур|слой|слои|уров(?:ень|ня|ни)|стек)/i, 'уровни → Pyramid layers или своя схема'],
  [/(?:^|[^а-яё])(?:интеграц|поток\S* данн|передаёт|передает|взаимодейств|шлюз|API)/i, 'связи систем → своя схема: узлы и стрелки'],
  [/(?:^|[^а-яё])(?:риск|вероятност|приоритет|влияни)/i, 'риски и приоритеты → Matrix2x2'],
  [/(?:^|[^а-яё])(?:вариант\s*\d|тариф|конкурент|преимуществ\S+ и недостат|за и против)/i, 'выбор → ComparisonSlide или ComparisonTable'],
  [/(?:^|[^а-яё])(?:было|раньше|до внедрения)[^\n]{0,200}(?:стало|теперь|после внедрения)/i, 'было — стало → ComparisonSlide, BarChart из двух столбцов'],
  [/(?:^|[^а-яё])(?:подчин|руководител|отдел\S*|департамент|роли)/i, 'роли → OrgChart'],
  [/\d+(?:[.,]\d+)?\s*%[^\n]{0,120}\d+(?:[.,]\d+)?\s*%/, 'несколько процентов рядом → MeterList, BarChart или DonutChart'],
  [/(?:с|от)\s+\d[\d\s.,]*\S*\s+(?:до)\s+\d/i, 'изменение «с … до …» → BarChart из двух столбцов + KpiCard'],
];

export function writeHints(dir) {
  const ex = path.join(dir, 'extracted');
  const out = ['# Подсказки для визуализации', '', '_Найдено автоматически. Проверить по исходнику, лишнее отбросить, пропущенное добавить. Формы — `design-system/src/docs/70-visuals.md`, код — `design-system/cookbook.md`._', ''];
  let n = 0;
  const tdir = path.join(ex, 'tables');
  const tables = fs.existsSync(tdir) ? fs.readdirSync(tdir).filter((f) => f.endsWith('.csv')).sort() : [];
  const tl = tables.map((f) => ['tables/' + f, tableHint(parseCsv(fs.readFileSync(path.join(tdir, f), 'utf8')))]).filter(([, x]) => x);
  const md = path.join(ex, 'content.md');
  // таблицы Markdown внутри текста (таблицы, уже выгруженные в CSV, не повторяем)
  const known = new Set(tables.map((f) => parseCsv(fs.readFileSync(path.join(tdir, f), 'utf8')).flat().filter(Boolean).join('|')));
  if (fs.existsSync(md)) {
    let block = [], start = 0;
    const flush = () => {
      const rows = block.filter((l) => !/^\s*\|[\s:|-]+\|?\s*$/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      const x = rows.length > 2 && !known.has(rows.flat().filter(Boolean).join('|')) && tableHint(rows);
      if (x) tl.push([`content.md, строка ${start}`, x]);
      block = [];
    };
    fs.readFileSync(md, 'utf8').split('\n').forEach((l, i) => { if (/^\s*\|/.test(l)) { if (!block.length) start = i + 1; block.push(l); } else if (block.length) flush(); });
    if (block.length) flush();
  }
  if (tl.length) { out.push('## Таблицы', '| Таблица | Форма |', '|---|---|', ...tl.map(([f, x]) => `| \`${f}\` | ${x} |`), ''); n += tl.length; }
  if (fs.existsSync(md)) {
    const seen = new Map();
    const rows = [];
    fs.readFileSync(md, 'utf8').split('\n').forEach((line, i) => {
      if (line.length < 25 || /^\s*[|#>]/.test(line)) return;
      for (const [re, form] of SIGNALS) if (re.test(line) && (seen.get(form) || 0) < 4) {
        seen.set(form, (seen.get(form) || 0) + 1);
        rows.push(`| ${i + 1} | ${line.trim().slice(0, 110).replace(/\|/g, '/')} | ${form} |`);
      }
    });
    if (rows.length) { out.push('## Текст', '| Строка `content.md` | Фрагмент | Форма |', '|---|---|---|', ...rows, ''); n += rows.length; }
  }
  if (!n) out.push('Автоматически ничего не найдено — ищите структуру сами по таблицам из `70-visuals.md`.');
  fs.writeFileSync(path.join(ex, 'visual-hints.md'), out.join('\n') + '\n');
  return n;
}
