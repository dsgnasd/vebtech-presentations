#!/usr/bin/env node
// Выходные презентации: приём исходников, этапы, сборка (HTML + PDF), версии ДС.
//
//   node tools/deck.mjs intake <тема> <файлы…> [--title "Название"]   исходники → sources/, извлечение, бриф/вопросы/план
//   node tools/deck.mjs extract <папка>                               повторно извлечь содержимое sources/
//   node tools/deck.mjs new <тема> [--from 03] [--title "…"]          пустая презентация из шаблона (без исходников)
//   node tools/deck.mjs stage <папка> <этап> [--note "…"]             перевести на этап; review и final — после проверок (final — и сверки чисел)
//        [--text-ok "причина"]                                        пропустить проверку визуальности, причина пишется в историю
//   node tools/deck.mjs build <папка|all> [--upgrade] [--no-pdf]      собрать HTML и PDF
//   node tools/deck.mjs check <папка>                                 проверка дизайна: снимки слайдов, замечания, лист осмотра
//   node tools/deck.mjs list                                          все презентации: этап, версия ДС
//
// Этапы: intake → analyzed → questions → planned → draft → review → final
// Презентация: presentations/<ГГГГ-ММ-ДД>-<тема>/
//   sources/    — исходники как прислали (docx, pptx, xlsx, pdf, md, изображения)
//   extracted/  — извлечённое: content.md, inventory.json, tables/, media/, pages/
//   brief.md · questions.md · plan.md — анализ, уточняющие вопросы, план слайдов
//   deck.jsx    — слайды из макетов Webtech;  meta.json — название, этап, история, версия ДС
//   lib/        — копия ДС той версии, на которой собрана (не меняется без --upgrade)
//   index.html  — просмотр;  <тема>.pdf — выгрузка, 1 слайд = 1 страница
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as cp from 'node:child_process';
import { writeHints } from './suggest-visuals.mjs';
import { writeCheck, reviewProblems } from './design-gate.mjs';
import { collectNumbers, writeNumbers, numberProblems } from './number-check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = path.join(ROOT, 'design-system');
const OUT = path.join(ROOT, 'presentations');
const TPL = path.join(ROOT, 'templates');
const imp = (p) => import(pathToFileURL(p).href);

const [cmd, arg, ...rest] = process.argv.slice(2);
const opt = (name, def) => { const i = rest.indexOf('--' + name); return i < 0 ? def : rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[i + 1] : true; };
const dsVersion = () => fs.readFileSync(path.join(TPL, 'lib/VERSION'), 'utf8').trim();
const today = () => new Date().toISOString().slice(0, 10);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9а-яё-]+/gi, '-').replace(/^-|-$/g, '');

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f), d = path.join(dst, f);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

const STAGES = ['intake', 'analyzed', 'questions', 'planned', 'draft', 'review', 'final'];
const STAGE_RU = { intake: 'приём', analyzed: 'анализ', questions: 'вопросы', planned: 'план', draft: 'черновик', review: 'правки', final: 'готово' };
const readMeta = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
const writeMeta = (dir, m) => fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(m, null, 2) + '\n');
function setStage(meta, stage, note) {
  if (!STAGES.includes(stage)) throw new Error('Этап — один из: ' + STAGES.join(', '));
  meta.stage = stage;
  (meta.history ||= []).push({ stage, at: new Date().toISOString().slice(0, 16).replace('T', ' '), ...(note && note !== true ? { note } : {}) });
}
const fill = (tpl, meta) => fs.readFileSync(path.join(ROOT, 'tools/templates', tpl), 'utf8').replaceAll('{{title}}', meta.title);

function runExtract(dir) {
  const venv = path.join(ROOT, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python3');
  const r = cp.spawnSync(fs.existsSync(venv) ? venv : 'python3', [path.join(ROOT, 'tools/extract.py'), dir], { stdio: 'inherit', env: { ...process.env, PYTHONUTF8: '1' } });
  if (r.status !== 0) throw new Error('Извлечение не удалось (см. выше)');
  console.log(`  подсказок для визуализации: ${writeHints(dir)} → ${path.relative(ROOT, path.join(dir, 'extracted/visual-hints.md'))}`);
}

async function cmdIntake() {
  const files = rest.filter((x, i) => !x.startsWith('--') && !(rest[i - 1] || '').startsWith('--'));
  if (!arg || !files.length) throw new Error('node tools/deck.mjs intake <тема> <файл…>');
  const existing = fs.existsSync(OUT) ? fs.readdirSync(OUT).find((d) => d.replace(/^\d{4}-\d{2}-\d{2}-/, '') === slugify(arg)) : null;
  const dir = existing ? path.join(OUT, existing) : path.join(OUT, `${today()}-${slugify(arg)}`);
  fs.mkdirSync(path.join(dir, 'sources'), { recursive: true });
  for (const f of files) {
    if (!fs.existsSync(f)) throw new Error('Нет файла: ' + f);
    // тот же файл — пропустить, другой с тем же именем — сохранить рядом как «имя-2.ext», исходники не затираются
    const { name, ext } = path.parse(f);
    let dst = path.join(dir, 'sources', name + ext);
    for (let k = 2; fs.existsSync(dst) && !fs.readFileSync(dst).equals(fs.readFileSync(f)); k++) dst = path.join(dir, 'sources', `${name}-${k}${ext}`);
    if (!fs.existsSync(dst)) fs.copyFileSync(f, dst);
  }
  let meta = fs.existsSync(path.join(dir, 'meta.json')) ? readMeta(dir) : { title: opt('title', arg), author: opt('author', ''), date: today(), template: null, dsVersion: null, stage: null, history: [] };
  if (opt('title') && opt('title') !== true) meta.title = opt('title');
  for (const t of ['brief.md', 'questions.md', 'plan.md']) if (!fs.existsSync(path.join(dir, t))) fs.writeFileSync(path.join(dir, t), fill(t, meta));
  runExtract(dir);
  setStage(meta, 'intake', `исходники: ${files.map((f) => path.basename(f)).join(', ')}`);
  writeMeta(dir, meta);
  console.log(`${existing ? 'Дополнено' : 'Создано'}: ${path.relative(ROOT, dir)}`);
  console.log('Дальше: анализ extracted/content.md, visual-hints.md и pages/ → brief.md, questions.md → вопросы пользователю → plan.md');
}

async function cmdExtract() {
  if (!arg) throw new Error('Укажите папку');
  runExtract(path.resolve(arg));
}

function cmdStage() {
  const dir = path.resolve(arg), stage = rest[0];
  const meta = readMeta(dir);
  let note = opt('note');
  if (['review', 'final'].includes(stage) && meta.design) {
    const bad = reviewProblems(dir);
    if (bad.length) throw new Error('Проверка дизайна не пройдена:\n  - ' + bad.join('\n  - ') + '\nПорядок — скил design-check.');
  }
  if (stage === 'final') {
    const bad = numberProblems(meta);
    if (bad.length) throw new Error('Сверка чисел не пройдена:\n  - ' + bad.join('\n  - '));
  }
  if (['review', 'final'].includes(stage) && meta.visual && !meta.visual.ok) {
    const why = opt('text-ok');
    if (!why || why === true) throw new Error('Проверка визуальности не пройдена:\n  - ' + meta.visual.problems.join('\n  - ') + '\nПереработайте слайды и соберите заново. Если материал действительно текстовый: --text-ok "причина"');
    note = [note && note !== true ? note : '', 'текстовая подача: ' + why].filter(Boolean).join('; ');
  }
  setStage(meta, stage, note);
  writeMeta(dir, meta);
  console.log(`${path.basename(dir)}: этап «${STAGE_RU[stage]}»`);
}

async function cmdNew() {
  if (!arg) throw new Error('Укажите тему: node tools/deck.mjs new <тема>');
  const dir = path.join(OUT, `${today()}-${slugify(arg)}`);
  if (fs.existsSync(dir)) throw new Error('Уже существует: ' + path.relative(ROOT, dir));
  const from = opt('from');
  let code = `const slides = [\n  <TitleSlide title={${JSON.stringify(String(opt('title', 'Название презентации')))}} subtitle="Подзаголовок" date="${today()}" />,\n  <ContactSlide title="Спасибо!" contacts={[]} />,\n];\n`;
  let base = null;
  if (from) {
    const { DECKS } = await imp(path.join(DS, 'src/specs/decks.mjs'));
    const d = DECKS.find((x) => x.file.startsWith(String(from).padStart(2, '0')) || x.name === from);
    if (!d) throw new Error('Нет шаблона ' + from + '. Доступны: ' + DECKS.map((x) => x.file).join(', '));
    code = d.code.trim() + '\n';
    base = d.file;
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'deck.jsx'), `// ${opt('title', arg)}\n// Слайды — макеты Webtech (см. дизайн-систему). Замените примеры своими данными.\n${code}`);
  const meta = { title: opt('title', arg), author: opt('author', ''), date: today(), template: base, dsVersion: null, stage: null, history: [] };
  setStage(meta, 'draft', base ? 'из шаблона ' + base : 'пустая');
  writeMeta(dir, meta);
  console.log('Создано:', path.relative(ROOT, dir), base ? `(из шаблона ${base})` : '');
  console.log('Дальше: отредактируйте deck.jsx и выполните  node tools/deck.mjs build', path.relative(ROOT, dir));
}

async function buildOne(dir) {
  const { deckHtml, footerOverlap, cardOverflow } = await imp(path.join(DS, 'src/deck-page.mjs'));
  const { collectVisuals, judge, report } = await imp(path.join(DS, 'src/visual-check.mjs'));
  if (!fs.existsSync(path.join(dir, 'deck.jsx'))) throw new Error(path.basename(dir) + ': нет deck.jsx — сначала план и черновик');
  const meta = readMeta(dir);
  const cur = dsVersion();
  const lib = path.join(dir, 'lib');
  if (!fs.existsSync(lib) || opt('upgrade')) {
    fs.rmSync(lib, { recursive: true, force: true });
    copyDir(path.join(TPL, 'lib'), lib);
    copyDir(path.join(TPL, 'fonts'), path.join(dir, 'fonts'));
    meta.dsVersion = cur;
  } else if (meta.dsVersion !== cur) {
    console.log(`  ${path.basename(dir)}: собрана на ДС ${meta.dsVersion}, текущая ${cur}. Оставляю ${meta.dsVersion}; для перехода — --upgrade`);
  }
  const code = fs.readFileSync(path.join(dir, 'deck.jsx'), 'utf8').replace(/^\/\/.*\n/gm, '');
  fs.writeFileSync(path.join(dir, 'index.html'), deckHtml({ title: meta.title, code, note: `ДС ${meta.dsVersion}` }));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  if (opt('no-pdf')) return console.log('  HTML:', path.relative(ROOT, dir) + '/index.html');
  const { chromium } = await imp(path.join(DS, 'node_modules/playwright/index.mjs'));
  const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(pathToFileURL(path.join(dir, 'index.html')).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  if (errors.length) { await browser.close(); throw new Error('Ошибка в deck.jsx: ' + errors[0]); }
  const n = await page.evaluate(() => document.querySelectorAll('.wt-frame').length);
  const over = await page.evaluate(footerOverlap);
  if (over.length) console.log(`  ⚠ ${path.basename(dir)}: содержимое заходит на футер — слайды ${over.join(', ')}`);
  const cut = await page.evaluate(cardOverflow);
  if (cut.length) console.log(`  ⚠ ${path.basename(dir)}: содержимое не помещается в карточку — слайды ${cut.join(', ')}: уменьшить график, убрать иконку или строку`);
  const vis = judge(await page.evaluate(collectVisuals));
  meta.visual = { ok: vis.ok, share: +vis.share.toFixed(2), kinds: vis.kinds, problems: vis.problems };
  meta.design = await writeCheck(page, dir, { code: fs.readFileSync(path.join(dir, 'deck.jsx'), 'utf8'), cut, over });
  meta.numbers = writeNumbers(dir, await page.evaluate(collectNumbers), meta);
  writeMeta(dir, meta);
  const pdf = path.join(dir, path.basename(dir).replace(/^\d{4}-\d{2}-\d{2}-/, '') + '.pdf');
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
  await browser.close();
  console.log(`  ${path.relative(ROOT, dir)}: ${n} слайдов → ${path.basename(pdf)} (ДС ${meta.dsVersion})`);
  console.log(report(vis));
  console.log(meta.design.summary);
  console.log(meta.numbers.summary);
}

async function cmdBuild() {
  if (!arg) throw new Error('Укажите папку или all');
  const dirs = arg === 'all' ? fs.readdirSync(OUT).filter((d) => fs.existsSync(path.join(OUT, d, 'deck.jsx'))).map((d) => path.join(OUT, d)) : [path.resolve(arg)];
  for (const d of dirs) await buildOne(d);
}

function cmdList() {
  const cur = dsVersion();
  for (const d of fs.existsSync(OUT) ? fs.readdirSync(OUT).sort() : []) {
    const m = path.join(OUT, d, 'meta.json');
    if (!fs.existsSync(m)) continue;
    const meta = JSON.parse(fs.readFileSync(m, 'utf8'));
    const st = meta.stage ? STAGE_RU[meta.stage] : '—';
    console.log(`${d.padEnd(40)} [${st.padEnd(8)}] ${meta.title}  · ДС ${meta.dsVersion ?? '—'}${meta.dsVersion && meta.dsVersion !== cur ? ` (есть ${cur})` : ''}`);
  }
}

try {
  if (cmd === 'intake') await cmdIntake();
  else if (cmd === 'extract') await cmdExtract();
  else if (cmd === 'stage') cmdStage();
  else if (cmd === 'new') await cmdNew();
  else if (cmd === 'build' || cmd === 'check') await cmdBuild();
  else if (cmd === 'list') cmdList();
  else console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 22).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
} catch (e) { console.error('Ошибка:', e.message); process.exit(1); }
