// Извлекает пути из присланных SVG логотипов без изменений.
import fs from 'node:fs';
const inner = (f) => fs.readFileSync(f, 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
const color = inner('assets-src/logos/vebtech-logo.svg');
const white = inner('assets-src/logos/vebtech-logo-on-dark.svg');
const paths = (s) => s.match(/<path[\s\S]*?\/>/g);
const cp = paths(color), wp = paths(white);
const hex = cp[0].match(/ d="([^"]+)"/)[1];
const out = `// СГЕНЕРИРОВАНО src/gen-logo.mjs из assets-src/logos — не править руками.
export const LOGO_COLOR = ${JSON.stringify(color)};
export const LOGO_WHITE = ${JSON.stringify(white)};
export const MARK_COLOR = ${JSON.stringify(cp[0] + cp[1])};
export const MARK_WHITE = ${JSON.stringify(wp[0])};
export const HEX_PATH = ${JSON.stringify(hex)};
`;
fs.writeFileSync('src/logo.generated.js', out);
console.log('logo paths', cp.length, wp.length);
