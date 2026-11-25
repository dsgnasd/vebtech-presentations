// Проверка визуальности колоды: сколько слайдов держится на графиках и схемах, где остался сплошной текст.
// collectVisuals выполняется в браузере (page.evaluate), judge — в Node.

// По дереву React определяет, какие компоненты Webtech стоят на каждом слайде
export function collectVisuals() {
  const names = new Map(Object.entries(window.Webtech).filter(([, v]) => typeof v === 'function').map(([k, v]) => [v, k]));
  const key = (el) => Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
  const ART = '.wt-hexcluster, .wt-hexart, .wt-title-hex, .wt-section-hex, .wt-contact-hex, .wt-logo, .wt-footer';
  return [...document.querySelectorAll('.wt-slide')].map((s) => {
    const used = [];
    let layout = 'Slide';
    for (let f = s[key(s)]?.return, n = 0; f && n < 6; f = f.return, n++) {
      const name = names.get(f.type);
      if (name === 'Deck') break;
      if (name) layout = name;
    }
    const walk = (f) => { for (; f; f = f.sibling) { if (names.has(f.type)) used.push(names.get(f.type)); walk(f.child); } };
    walk(s[key(s)]?.child);
    const k = s.getBoundingClientRect().width / 1920 || 1;
    const big = (el) => { const r = el.getBoundingClientRect(); return r.width / k >= 400 && r.height / k >= 200; };
    const free = (el) => !el.closest(ART);
    // своя схема — только SVG с графикой; текстовая вёрстка с пометкой data-visual схемой не считается
    const drawn = (el) => el.querySelectorAll('rect, circle, ellipse, path, line, polygon, polyline').length >= 4;
    const custom = [...s.querySelectorAll('svg')].some((el) => free(el) && !el.closest('.wt-chart-svg') && big(el) && drawn(el));
    const image = [...s.querySelectorAll('img')].some((el) => free(el) && big(el)) || [...s.querySelectorAll('.wt-image-frame')].some((el) => !el.querySelector('.wt-image-placeholder'));
    const copy = s.cloneNode(true);
    copy.querySelectorAll(`${ART}, h1, h2, .wt-source, svg`).forEach((el) => el.remove());
    const walker = document.createTreeWalker(copy, 4);
    const parts = [];
    while (walker.nextNode()) parts.push(walker.currentNode.textContent);
    const text = parts.join(' ').replace(/\s+/g, ' ');
    return {
      layout, used, custom, image,
      title: (s.querySelector('h1, h2')?.textContent || '').replace(/\s+/g, ' ').trim(),
      words: (text.match(/[A-Za-zА-Яа-яЁё]{3,}/g) || []).length,
      numbers: (text.match(/(?<![\d.,])\d[\d\s.,]*(?:%|\s*(?:млн|млрд|тыс|BYN|USD|чел|дн|мес|раз|ч\b))/g) || []).length,
    };
  });
}

const CHART = ['BarChart', 'StackedBar', 'LineChart', 'AreaChart', 'DonutChart', 'Waterfall', 'ComboChart', 'BreakdownBar', 'MeterList', 'PlanFactCard', 'Funnel'];
const SCHEME = ['Timeline', 'VerticalTimeline', 'PhaseTimeline', 'Roadmap', 'ProcessFlow', 'Cycle', 'Pyramid', 'Matrix2x2', 'OrgChart'];
const TABLE = ['DataTable', 'StatusTable', 'ComparisonTable'];
const NUMBER = ['KpiCard', 'KpiSlide', 'CaseSlide', 'FactList', 'ProgressBar'];
const SERVICE = ['TitleSlide', 'SectionSlide', 'AgendaSlide', 'ContactSlide', 'TeamSlide', 'QuoteSlide'];
export const LIMITS = { share: 0.5, runText: 2, runLayout: 3, words: 70, kindsFrom: 6, kinds: 3 };

export function judge(slides) {
  const rows = slides.map((s, i) => {
    const forms = [...new Set(s.used.filter((x) => CHART.includes(x) || SCHEME.includes(x)))];
    if (s.custom && !forms.length) forms.push('своя схема');
    if (s.image) forms.push('фото или скриншот');
    const has = (list) => s.used.some((x) => list.includes(x)) || list.includes(s.layout);
    const kind = SERVICE.includes(s.layout) ? 'service' : forms.length ? 'visual' : has(TABLE) ? 'table' : has(NUMBER) ? 'number' : 'text';
    return { n: i + 1, ...s, forms, kind };
  });
  const content = rows.filter((r) => r.kind !== 'service');
  const visual = content.filter((r) => r.kind === 'visual');
  const kinds = new Set(visual.flatMap((r) => r.forms));
  const share = content.length ? visual.length / content.length : 1;
  const problems = [];
  const at = (r) => `слайд ${r.n} «${r.title.slice(0, 60)}»`;
  if (content.length >= 3 && share < LIMITS.share) problems.push(`Визуальных слайдов ${visual.length} из ${content.length} — нужно не меньше ${Math.ceil(content.length * LIMITS.share)}. Кандидаты: ${content.filter((r) => r.kind !== 'visual').map((r) => r.n).join(', ')}`);
  if (content.length >= LIMITS.kindsFrom && kinds.size < LIMITS.kinds) problems.push(`Видов визуала ${kinds.size} (${[...kinds].join(', ') || 'нет'}) — нужно не меньше ${LIMITS.kinds}`);
  for (const r of content) {
    if (r.kind === 'text' && r.numbers >= 3) problems.push(`${at(r)}: ${r.numbers} чисел в тексте — вынести в график, MeterList или KpiCard`);
    if (r.kind === 'text' && r.words > LIMITS.words) problems.push(`${at(r)}: ${r.words} слов без визуала — превратить в схему или сократить`);
  }
  const runs = (same, limit, msg) => {
    for (let i = 0, len = 0; i < rows.length; i++) {
      len = i && same(rows[i - 1], rows[i]) ? len + 1 : 1;
      const last = i === rows.length - 1 || !same(rows[i], rows[i + 1]);
      if (last && len >= limit && rows[i].kind !== 'service') problems.push(msg(rows[i].n - len + 1, rows[i].n, rows[i]));
    }
  };
  runs((a, b) => a.kind === 'text' && b.kind === 'text', LIMITS.runText, (a, b) => (a === b ? null : `Слайды ${a}–${b}: текст подряд — вставить визуал`));
  runs((a, b) => a.kind !== 'service' && b.kind !== 'service' && a.layout + a.forms.join() === b.layout + b.forms.join(), LIMITS.runLayout, (a, b, r) => `Слайды ${a}–${b}: одинаковая композиция (${[r.layout, ...r.forms].join(', ')}) — сменить форму`);
  return { ok: !problems.length, share, visual: visual.length, content: content.length, kinds: [...kinds], problems, rows };
}

const MARK = { service: '·', visual: '■', table: '▤', number: '#', text: '☰' };
export function report(v) {
  const lines = [`  Визуальность: ${v.visual} из ${v.content} содержательных слайдов (${Math.round(v.share * 100)}%), видов визуала: ${v.kinds.length}`,
    '  ' + v.rows.map((r) => `${r.n}${MARK[r.kind]}`).join(' ') + '   (■ визуал, # цифры, ▤ таблица, ☰ текст, · служебный)'];
  for (const p of v.problems) lines.push('  ⚠ ' + p);
  if (!v.ok) lines.push('  Подобрать форму: design-system/src/docs/70-visuals.md, готовый код — design-system/cookbook.md');
  return lines.join('\n');
}
