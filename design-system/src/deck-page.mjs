// Общий генератор HTML-страницы колоды: для шаблонов (templates/) и выходных презентаций (presentations/).
import * as esbuild from 'esbuild';

// JSX → обычный JS; компоненты берутся из window.Webtech
export function jsx(code) {
  // компоненты, объявленные в самом коде колоды, из W не берём — иначе «already declared»
  const names = [...new Set([...code.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]))].filter((n) => !new RegExp(`(const|let|var|function|class)\\s+${n}\\b`).test(code));
  const pre = names.length ? `var { ${names.join(', ')} } = W;\n` : '';
  return esbuild.transformSync(pre + code.trim(), { loader: 'jsx', jsxFactory: 'h', jsxFragment: 'React.Fragment', target: 'es2019', charset: 'utf8' }).code.trim();
}

// Выполняется в браузере (page.evaluate): номера слайдов, где текст или графика заходят на футер.
// Футер стоит абсолютно, поэтому обычная проверка выхода за край слайда наезд не видит.
export function footerOverlap() {
  const ART = '.wt-hexcluster, .wt-hexart, .wt-title-hex, .wt-section-hex, .wt-contact-hex';
  const hasInk = (el) => /^(svg|img)$/i.test(el.tagName) || [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  return [...document.querySelectorAll('.wt-slide')].flatMap((s, i) => {
    const f = s.querySelector('.wt-footer');
    if (!f) return [];
    const top = f.getBoundingClientRect().top;
    const hit = [...s.querySelectorAll('*')].some((el) => !f.contains(el) && !el.closest(ART) && !el.parentElement?.closest('svg') && hasInk(el) && el.getBoundingClientRect().bottom > top + 1);
    return hit ? [i + 1] : [];
  });
}

// Выполняется в браузере: слайды, где содержимое вышло за нижний или правый край карточки (срезано или наезжает на соседей)
export function cardOverflow() {
  return [...document.querySelectorAll('.wt-slide')].flatMap((s, i) => {
    const k = s.getBoundingClientRect().width / 1920 || 1;
    const ink = (el) => /^(svg|img)$/i.test(el.tagName) || [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const hit = [...s.querySelectorAll('.wt-card, .wt-kpi, .wt-gridslide-cell')].find((c) => {
      const b = c.getBoundingClientRect();
      return [...c.querySelectorAll('*')].some((el) => !el.parentElement.closest('svg') && ink(el) && (el.getBoundingClientRect().bottom > b.bottom + 4 * k || el.getBoundingClientRect().right > b.right + 4 * k));
    });
    return hit ? [i + 1] : [];
  });
}

export const countSlides =(code) => (code.match(/^\s{2}<[A-Z]\w*Slide/gm) || []).length;

// code определяет массив `slides`; lib — относительный путь к папке с webtech.css/js и React
export function deckHtml({ title, code, lib = 'lib', note = '' }) {
  const n = countSlides(code);
  return `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Вэбтех</title>
<link rel="stylesheet" href="${lib}/webtech.css">
<style>body{margin:0;background:var(--brand-50);font-family:var(--font-sans)}#root{max-width:1600px;margin:0 auto;padding:32px 16px}
.bar{max-width:1600px;margin:0 auto;padding:24px 16px 0;display:flex;justify-content:space-between;align-items:center;gap:16px;font:600 16px/24px var(--font-sans);color:var(--ink-secondary)}
.bar button{font:700 16px/24px var(--font-sans);padding:10px 20px;border:0;border-radius:999px;background:var(--brand-strong);color:#fff;cursor:pointer}
@media print{.bar{display:none}#root{padding:0;max-width:none}}</style>
</head>
<body>
<div class="bar wt-no-print"><span>${title} · ${n} слайдов${note ? ' · ' + note : ''}</span><button onclick="print()">Сохранить в PDF</button></div>
<div id="root"></div>
<script src="${lib}/react.production.min.js"></script>
<script src="${lib}/react-dom.production.min.js"></script>
<script src="${lib}/webtech.js"></script>
<script>
var W = window.Webtech, h = React.createElement;
${jsx(code)}
ReactDOM.createRoot(document.getElementById('root')).render(h(W.Deck, { layout: 'stack', gap: 32 }, slides));
</script>
</body>
</html>
`;
}
