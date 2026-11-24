// Проверка типографики в исходниках: шаблоны ДС (src/specs) и презентации (presentations/*/deck.jsx).
// Правила — в src/docs/60-typography.md. Запуск: cd design-system && node typo-lint.mjs [файлы…]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('..');
const files = process.argv.length > 2 ? process.argv.slice(2).map((f) => path.resolve(f)) : [
  ...fs.readdirSync('src/specs').filter((f) => f.endsWith('.mjs')).map((f) => path.resolve('src/specs', f)),
  ...fs.readdirSync(path.join(ROOT, 'presentations')).map((d) => path.join(ROOT, 'presentations', d, 'deck.jsx')).filter((f) => fs.existsSync(f)),
];

const RULES = [
  ['прямые кавычки → «ёлочки»', (s, raw) => raw.includes('"') && s === raw && /[А-Яа-я]/.test(s) && /(^|[\s(])"[^"]+"/.test(s)],
  ['дефис вместо тире: « - » → « — »', (s) => /[А-Яа-яA-Za-z0-9] - [А-Яа-яA-Za-z0-9«]/.test(s)],
  ['дефис вместо минуса перед числом → «−»', (s) => /(^|[\s(«])-\d/.test(s) && /[А-Яа-я%]/.test(s)],
  ['три точки → «…»', (s) => /\.\.\./.test(s)],
  ['двойной пробел', (s) => /\S {2,}\S/.test(s)],
  ['число слитно с единицей: 48млн', (s) => /\d(млн|тыс|млрд|мес|дн|ч|мин|сек|мс)(\.|\s|$)/.test(s)],
  ['пробел перед %', (s) => /\d  ?%/.test(s)],
  ['нет пробела после тире', (s) => /\s—\S/.test(s)],
];

// строковые литералы и текст между тегами, содержащие кириллицу
const extract = (line) => {
  const out = [];
  for (const m of line.matchAll(/"([^"\n]{4,})"|'([^'\n]{4,})'|`([^`\n]{4,})`/g)) out.push(m[1] ?? m[2] ?? m[3]);
  for (const m of line.matchAll(/>([^<>{}\n]{4,})</g)) out.push(m[1]);
  return out.filter((s) => /[А-Яа-яЁё]/.test(s) && !/^(wt-|var\(|[a-z-]+:)/.test(s));
};

const titleRe = /title=(?:"([^"]+)"|\{'([^']+)'\})/g;
const issues = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/^\s*\/\//.test(line)) return;
    for (const s of extract(line)) for (const [name, test] of RULES) if (test(s, s)) issues.push({ f, n: i + 1, name, s });
    for (const m of line.matchAll(titleRe)) {
      const t = m[1] ?? m[2];
      if (/[.]$/.test(t) && !/\.\.\.$/.test(t) && !/(тыс|мес|\sг|п\. п|т\. д|т\. п)\.$/.test(t)) issues.push({ f, n: i + 1, name: 'точка в конце заголовка', s: t });
      const rest = t.split(/\s+/).slice(1);
      const words = rest.filter((w) => /^[А-ЯЁ][а-яё]{3,}/.test(w));
      if (words.length >= 3 && words.length / rest.length > 0.6) issues.push({ f, n: i + 1, name: 'Title Case в заголовке', s: t });
    }
  });
}

const rel = (f) => path.relative(ROOT, f);
for (const x of issues) console.log(`${rel(x.f)}:${x.n}: ${x.name}: ${x.s.slice(0, 90)}`);
console.log(issues.length ? `\nНайдено: ${issues.length}` : 'Типографика: замечаний нет');
