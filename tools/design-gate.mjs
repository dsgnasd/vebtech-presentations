// Допуск к выдаче: снимки слайдов, отчёт проверки дизайна и лист осмотра (папка check/ презентации).
//   check/slide-NN.png — снимки; check/report.md — замечания; check/review.md — лист осмотра, заполняет агент.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 10);
const pad = (n) => String(n).padStart(2, '0');

// Строки листа: | NN | код снимка | вердикт | что видно |
function readReview(dir) {
  const f = path.join(dir, 'check/review.md');
  const rows = new Map();
  if (fs.existsSync(f)) for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = /^\|\s*(\d+)\s*\|\s*([0-9a-f]{10})\s*\|([^|]*)\|(.*)\|\s*$/.exec(l);
    if (m) rows.set(+m[1], { hash: m[2], verdict: m[3].trim().toLowerCase(), note: m[4].trim() });
  }
  return rows;
}

export async function writeCheck(page, dir, { code, cut = [], over = [] }) {
  const { collectDesign, lintDeck } = await import(pathToFileURL(path.join(ROOT, 'design-system/src/design-check.mjs')).href);
  const out = path.join(dir, 'check');
  const old = readReview(dir);
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (/^slide-\d+\.png$/.test(f)) fs.unlinkSync(path.join(out, f));
  const issues = [...lintDeck(code), ...(await page.evaluate(collectDesign)),
    ...cut.map((n) => ({ n, level: 'error', rule: 'карточка', text: 'содержимое не помещается в карточку' })),
    ...over.map((n) => ({ n, level: 'error', rule: 'футер', text: 'содержимое заходит на футер' }))];
  const frames = page.locator('.wt-frame');
  const n = await frames.count();
  const slides = [];
  const titles = await page.evaluate(() => [...document.querySelectorAll('.wt-slide')].map((s) => (s.querySelector('h1, h2')?.textContent || '').replace(/\s+/g, ' ').replaceAll('|', '/').trim()));
  for (let i = 0; i < n; i++) {
    const png = await frames.nth(i).screenshot({ animations: 'disabled' });
    fs.writeFileSync(path.join(out, `slide-${pad(i + 1)}.png`), png);
    slides.push({ n: i + 1, hash: sha(png), title: titles[i] || '' });
  }
  const errors = issues.filter((x) => x.level === 'error'), warns = issues.filter((x) => x.level === 'warn');
  const fmt = (x) => `- ${x.level === 'error' ? '✗' : '!'} ${x.n ? `слайд ${x.n}` : 'исходник'} · **${x.rule}**: ${x.text}`;
  fs.writeFileSync(path.join(out, 'report.md'), `# Проверка дизайна\n\nОшибок (✗): ${errors.length} — исправить все. Предупреждений (!): ${warns.length} — посмотреть на снимке и решить.\n\n${[...errors, ...warns].sort((a, b) => a.n - b.n).map(fmt).join('\n') || 'Замечаний нет.'}\n`);
  const row = (s) => { const o = old.get(s.n); const keep = o && o.hash === s.hash; return `| ${s.n} | ${s.hash} | ${keep ? o.verdict : '?'} | ${keep ? o.note : ''} |`; };
  fs.writeFileSync(path.join(out, 'review.md'), `# Лист осмотра

Заполняет агент по снимкам \`check/slide-NN.png\`, порядок — скил design-check. Вердикт: \`ок\` или \`исправить\`. «Что видно» — своими словами про этот слайд: какая форма держит мысль, что проверено, от 30 знаков. После изменения слайда его строка сбрасывается.

| Слайд | Код снимка | Вердикт | Что видно |
|---|---|---|---|
${slides.map(row).join('\n')}

Заголовки: ${slides.map((s) => `${s.n} — ${s.title}`).join('; ')}
`);
  const top = [...errors].sort((a, b) => a.n - b.n).slice(0, 12).map((x) => '  ✗ ' + (x.n ? `слайд ${x.n} · ` : '') + `${x.rule}: ${x.text}`);
  return {
    errors: errors.length, warnings: warns.length, problems: errors.map((x) => (x.n ? `слайд ${x.n}: ` : '') + `${x.rule} — ${x.text}`), slides: slides.map((s) => s.hash), code: sha(code),
    summary: [`  Дизайн: ошибок ${errors.length}, предупреждений ${warns.length} → ${path.relative(ROOT, path.join(out, 'report.md'))}`, ...top, errors.length > 12 ? `  … ещё ${errors.length - 12}` : '', '  Дальше: исправить ✗, осмотреть check/slide-NN.png, заполнить check/review.md (скил design-check)'].filter(Boolean).join('\n'),
  };
}

// Что мешает выдаче; пустой список — можно
export function reviewProblems(dir) {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  const d = meta.design;
  if (!d) return ['нет проверки дизайна — выполните build'];
  const bad = [];
  if (sha(fs.readFileSync(path.join(dir, 'deck.jsx'), 'utf8')) !== d.code) bad.push('deck.jsx изменён после сборки — выполните build');
  if (d.errors) bad.push(...d.problems.slice(0, 10), ...(d.problems.length > 10 ? [`и ещё ошибок: ${d.problems.length - 10}`] : []));
  const rows = readReview(dir), notes = new Map();
  const missing = [];
  d.slides.forEach((h, i) => {
    const r = rows.get(i + 1);
    if (!r || r.hash !== h || r.verdict !== 'ок' || r.note.length < 30) missing.push(i + 1);
    else notes.set(r.note, (notes.get(r.note) || 0) + 1);
  });
  if (missing.length) bad.push(`check/review.md: не осмотрены слайды ${missing.join(', ')} (нужен вердикт «ок» и описание от 30 знаков)`);
  if ([...notes.values()].some((c) => c > 1)) bad.push('check/review.md: одинаковые описания у разных слайдов — осмотрите каждый отдельно');
  return bad;
}
