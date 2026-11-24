// Индекс design-system.json: записи ассетов (id загрузок в порядке загрузки).
import fs from 'node:fs';
const ids = fs.readFileSync('src/assets.ids.txt', 'utf8').trim().split(/\s+/);
const sizes = fs.readFileSync('src/assets.sizes.txt', 'utf8').trim().split(/\s+/).map(Number); // размеры, как их хранит артефакт
const icons = fs.readdirSync('assets-src/icons').filter((f) => f.endsWith('.svg')).sort();
const order = ['logos/vebtech-logo.svg', 'logos/vebtech-logo-on-dark.svg', ...['wallet', 'workflow', 'wrench', 'x', 'zap'].map((n) => `icons/${n}.svg`),
  ...icons.filter((f) => !['wallet.svg', 'workflow.svg', 'wrench.svg', 'x.svg', 'zap.svg'].includes(f)).map((f) => 'icons/' + f)];
if (order.length !== ids.length) throw new Error('count mismatch ' + order.length + ' ' + ids.length);
const groups = { Logos: { name: 'Logos', tile: 'l', order: [], files: {} }, Icons: { name: 'Icons', tile: 'xs', order: [], files: {} } };
order.forEach((p, i) => {
  const g = p.startsWith('logos/') ? groups.Logos : groups.Icons;
  const name = p.split('/')[1];
  g.files[name] = { name, blob: ids[i], size: sizes[i], type: 'image/svg+xml' };
});
groups.Logos.order = ['vebtech-logo.svg', 'vebtech-logo-on-dark.svg'];
groups.Icons.order = icons;
const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const index = {
  v: 3, layout: 'files', createdOnFiles: { v: 1, at: process.argv[2] || now },
  title: 'Вэбтех — презентации', namespace: 'Webtech',
  libraries: [{ name: 'react', version: '18' }, { name: 'react-dom', version: '18' }],
  sections: {}, groups: ['Logos', 'Icons'], assetGroups: groups, blobs: {}, docs: { readme: 'project/README.md', sections: [] },
  lastChange: { by: 'Claude', at: now, via: 'Claude Code', note: 'Первая версия: токены, 76 компонентов, 17 макетов слайдов, 12 готовых презентаций' },
};
fs.writeFileSync('project/design-system.json', JSON.stringify(index, null, 2) + '\n');
// Группа People добавлена в 1.1.0 при загрузке (id — в артефакте); при полной пересборке индекса перенести её из текущего индекса.
console.log('index ok', Object.keys(groups.Icons.files).length);
