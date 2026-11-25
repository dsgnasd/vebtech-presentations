// Сборка дизайн-системы: tokens.json, бандл, стили, README и превью компонентов, автономные шаблоны.
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { tokensJson, tokensCss } from './src/tokens.mjs';
import { jsx, deckHtml } from './src/deck-page.mjs';

const VERSION = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;

const P = 'project';
const w = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
await import('./src/gen-logo.mjs');
await import('./src/gen-people.mjs');
if (!fs.existsSync('src/textures.generated.js')) await import('./src/gen-textures.mjs');

// 1. Токены и шрифт
w(`${P}/tokens.json`, JSON.stringify(tokensJson(), null, 2) + '\n');
fs.mkdirSync(`${P}/fonts`, { recursive: true });
fs.copyFileSync('fonts-src/Manrope-Variable.woff2', `${P}/fonts/Manrope-Variable.woff2`);

// 2. Бандл
const r = await esbuild.build({
  entryPoints: ['src/components/index.jsx'], bundle: true, format: 'iife', minify: true, write: false,
  jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', target: 'es2019', charset: 'utf8',
  loader: { '.json': 'json' },
});
const { COMPONENTS } = await import('./src/specs/index.mjs?' + Date.now());
const exported = COMPONENTS.filter((c) => !c.page).map((c) => ({ name: c.name }));
let js = r.outputFiles[0].text;
if (/<\/script|<!--/i.test(js)) js = js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
w(`${P}/components/bundle.js`, `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: 'Webtech', components: exported })} */\n` + js + `\nwindow.Webtech.version = ${JSON.stringify(VERSION)};\n`);
w(`${P}/components/bundle.css`, fs.readFileSync('src/bundle.css', 'utf8'));
w(`${P}/components/index.d.ts`, fs.readFileSync('src/index.d.ts', 'utf8'));


// 3. README и превью компонентов
for (const c of COMPONENTS) {
  const dir = `${P}/components/${c.name}`;
  const meta = [`Статус: ${{ stable: 'стабильный', beta: 'бета', deprecated: 'устаревший' }[c.status || 'stable']}`, `с версии ${c.since || '1.0.0'}`];
  if (c.source) meta.push(`источник: ${c.source}`);
  if (c.replacedBy) meta.push(`замена: ${c.replacedBy}`);
  if (c.readme) w(`${dir}/README.md`, c.readme.trim() + `\n\n---\n_${meta.join(' · ')}_\n`);
  const attrs = [`group="${c.group}"`, `height=${c.height}`];
  if (c.width) attrs.push(`width=${c.width}`);
  if (c.subtitle) attrs.push(`subtitle="${c.subtitle}"`);
  if (c.page) attrs.push('page');
  w(`${dir}/preview.html`, `<!-- @dsCard ${attrs.join(' ')} -->
<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>${c.name}</title>
<style>html,body{margin:0;background:var(--surface);font-family:var(--font-sans);color:var(--ink)}#root{padding:${c.pad ?? 48}px}${c.css || ''}</style>
</head>
<body>
<div id="root"></div>
<script>
var W = window.Webtech, h = React.createElement;
${jsx(c.code)}
ReactDOM.createRoot(document.getElementById('root')).render(view);
</script>
</body>
</html>
`);
}

// 3b. Брендбук, разделы, обложка, README групп ассетов
w(`${P}/README.md`, fs.readFileSync('src/docs/README.md', 'utf8'));
for (const f of fs.readdirSync('src/docs')) if (f !== 'README.md') w(`${P}/${f}`, fs.readFileSync(`src/docs/${f}`, 'utf8'));
w(`${P}/components/Cover/preview.html`, fs.readFileSync('src/cover.html', 'utf8'));
w(`${P}/assets/Logos/README.md`, fs.readFileSync('src/assets-readme/logos.md', 'utf8'));
w(`${P}/assets/Icons/README.md`, fs.readFileSync('src/assets-readme/icons.md', 'utf8'));
fs.copyFileSync('fonts-src/OFL.txt', `${P}/fonts/OFL.txt`);
w(`${P}/90-changelog.md`, fs.readFileSync('CHANGELOG.md', 'utf8'));

// 4. Автономные шаблоны (templates/): открыть в браузере, печать в PDF
const T = '../templates';
fs.mkdirSync(`${T}/lib`, { recursive: true });
fs.mkdirSync(`${T}/fonts`, { recursive: true });
fs.copyFileSync('fonts-src/Manrope-Variable.woff2', `${T}/fonts/Manrope-Variable.woff2`);
fs.copyFileSync('node_modules/react/umd/react.production.min.js', `${T}/lib/react.production.min.js`);
fs.copyFileSync('node_modules/react-dom/umd/react-dom.production.min.js', `${T}/lib/react-dom.production.min.js`);
fs.copyFileSync(`${P}/components/bundle.js`, `${T}/lib/webtech.js`);
w(`${T}/lib/webtech.css`, tokensCss().replace('url("fonts/', 'url("../fonts/') + '\n' + fs.readFileSync('src/bundle.css', 'utf8'));
const { DECKS } = await import('./src/specs/decks.mjs?' + Date.now());
for (const d of DECKS) {
  w(`${T}/${d.file}.html`, deckHtml({ title: d.title, code: d.code, note: `шаблон, ДС ${VERSION}` }));
}
// 5. Сборник рецептов: готовый код графиков, схем и комбинированных слайдов одним файлом (для агентов)
const COOK = [
  ['Графики', ['BarChart', 'StackedBar', 'LineChart', 'AreaChart', 'DonutChart', 'Waterfall', 'ComboChart', 'BreakdownBar', 'MeterList', 'PlanFactCard', 'Funnel', 'Sparkline']],
  ['Схемы', ['ProcessFlow', 'Cycle', 'Timeline', 'VerticalTimeline', 'PhaseTimeline', 'Roadmap', 'Pyramid', 'Matrix2x2', 'OrgChart', 'StatusTable', 'ComparisonTable']],
  ['Цифры и акценты', ['KpiCard', 'FactList', 'ProgressBar', 'Callout', 'IconFeature']],
  ['Слайды целиком', ['ChartSlide', 'GridSlide', 'DashboardSlide', 'ProcessSlide', 'TimelineSlide', 'RoadmapSlide', 'ComparisonSlide', 'CaseSlide']],
];
const by = Object.fromEntries(COMPONENTS.map((c) => [c.name, c]));
w('cookbook.md', `# Сборник рецептов: графики, схемы, слайды

Собирается из \`src/specs\` командой \`node build.mjs\`, вручную не править. Что выбрать — \`src/docs/70-visuals.md\`; пропсы и правила — \`project/components/<Имя>/README.md\`. В \`deck.jsx\` массив \`slides\` собирается из слайдов, \`const view\` и \`const s\` не нужны: берите сам элемент.

## Содержание
${COOK.map(([t]) => `- [${t}](#${t.toLowerCase().replaceAll(' ', '-')})`).join('\n')}

${COOK.map(([t, names]) => `## ${t}\n\n${names.map((n) => `### ${n}\n${by[n].readme.trim().split('\n')[0]}\n\`\`\`jsx\n${by[n].code.trim()}\n\`\`\``).join('\n\n')}`).join('\n\n')}
`);
w(`${T}/lib/VERSION`, VERSION + '\n');
console.log('version', VERSION, 'components', COMPONENTS.length, 'decks', DECKS.length, 'bundle', js.length);
