#!/usr/bin/env node
// Установка и обновление фабрики презентаций: node tools/update.mjs
// Свои презентации (presentations/) обновление не трогает: они вне git.
// Правки файлов самой фабрики не теряются — уходят в git stash.
import fs from 'node:fs';
import path from 'node:path';
import * as cp from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = path.join(ROOT, 'design-system');
const WIN = process.platform === 'win32';
const run = (cmd, args, o = {}) => cp.spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', ...o });
const git = (...a) => {
  const r = run('git', a);
  if (r.error) stop('Не найден Git — установите и повторите.');
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
};
function stop(msg) { console.error('✗ ' + msg); process.exit(1); }
const step = (msg) => console.log('→ ' + msg);

if (+process.versions.node.split('.')[0] < 20) stop(`Нужен Node.js 20 или новее, установлен ${process.versions.node}.`);
if (!fs.existsSync(path.join(ROOT, '.git'))) stop('Подключите фабрику через git clone: обновление работает только так.');

// Обновление
if (git('rev-parse', '--abbrev-ref', 'HEAD').out !== 'main') stop('Открыта другая ветка git. Презентации на месте. Напишите в группу Deck Factory: https://myteam.mail.ru/profile/DeckFactory');
step('Проверяю обновления');
const f = git('fetch', '-q', 'origin', 'main');
if (!f.ok && /not permitted|permission denied|EPERM|read-only file system|FETCH_HEAD|could not resolve host/i.test(f.err)) stop('Запуск ограничен песочницей агента или нет сети. АГЕНТУ: запросите у пользователя разрешение выполнить «node tools/update.mjs» вне песочницы и повторите.\n' + f.err);
if (!f.ok) stop('GitHub недоступен. Проверьте интернет и VPN. Фабрика работает на прежней версии.\n' + f.err);
if (git('log', '--format=%h', 'origin/main..HEAD').out) stop('В копии есть локальные коммиты, обновление остановлено. Презентации на месте. Напишите в группу Deck Factory: https://myteam.mail.ru/profile/DeckFactory');
const before = git('rev-parse', 'HEAD').out;
if (before !== git('rev-parse', 'origin/main').out) {
  if (git('status', '--porcelain', '--untracked-files=no').out) {
    const s = git('stash', 'push', '-q', '-m', `до обновления ${new Date().toISOString().slice(0, 16)}`);
    if (!s.ok) stop('Не удалось отложить правки файлов фабрики: ' + s.err);
    step('Правки файлов фабрики отложены в git stash');
  }
  const m = git('merge', '--ff-only', '-q', 'origin/main');
  if (!m.ok) stop('Обновление остановлено, презентации на месте. Напишите в группу Deck Factory: https://myteam.mail.ru/profile/DeckFactory\n' + m.err);
  console.log('Что нового:\n' + git('log', '--format=  · %s', `${before}..HEAD`).out);
} else step('Уже свежая версия');

// Зависимости (npm ci не меняет lock-файл)
step('Библиотеки Node');
if (run('npm', ['ci', '--silent', '--no-audit', '--no-fund'], { cwd: DS, stdio: 'inherit', shell: WIN }).status !== 0) stop('npm ci не выполнен (см. выше).');

step('Библиотеки Python');
const py = path.join(ROOT, '.venv', WIN ? 'Scripts/python.exe' : 'bin/python3');
if (!fs.existsSync(py)) {
  const base = (WIN ? [['py', '-3'], ['python'], ['python3']] : [['python3']]).find(([c, ...a]) => run(c, [...a, '--version']).status === 0);
  if (!base) stop('Не найден Python 3 — установите и повторите.');
  const [c, ...a] = base;
  if (run(c, [...a, '-m', 'venv', path.join(ROOT, '.venv')], { stdio: 'inherit' }).status !== 0) stop('Не удалось создать .venv.');
}
if (run(py, ['-m', 'pip', 'install', '-q', '--disable-pip-version-check', '-r', path.join(ROOT, 'tools/requirements.txt')], { stdio: 'inherit' }).status !== 0) stop('pip install не выполнен (см. выше).');

step('Браузер для PDF');
const { chromium } = await import(pathToFileURL(path.join(DS, 'node_modules/playwright/index.mjs')).href);
const works = () => chromium.launch().catch(() => chromium.launch({ channel: 'chrome' })).then((b) => b.close()).then(() => true, () => false);
if (!(await works())) {
  run(process.execPath, [path.join(DS, 'node_modules/playwright/cli.js'), 'install', 'chromium'], { cwd: DS, stdio: ['ignore', 'ignore', 'inherit'] });
  if (!(await works())) stop('Браузер не запускается. Установите Google Chrome и повторите. Если команду выполняет агент — разрешите ему запуск вне песочницы.');
}
console.log(`✓ Готово: дизайн-система ${fs.readFileSync(path.join(ROOT, 'templates/lib/VERSION'), 'utf8').trim()}, обновление от ${git('log', '-1', '--format=%cd', '--date=format:%d.%m.%Y').out}`);
