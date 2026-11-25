// Графики ДС → нативные диаграммы PowerPoint с таблицей данных (для tools/html2pptx.mjs).
// chartSpec выполняется в браузере: данные — из пропсов React, цвета и кегли — из вёрстки. null — график не переносится, остаётся фигурами:
// Waterfall, ComboChart, Sparkline, AreaChart stacked, горизонтальный StackedBar с итогами, подписи в других единицах, чем данные.
export function chartSpec(svg) {
  const W = window.Webtech, names = new Map(Object.entries(W || {}).filter(([, v]) => typeof v === 'function').map(([k, v]) => [v, k]));
  const key = Object.keys(svg).find((k) => k.startsWith('__reactFiber$'));
  let f = svg[key], kind = null;
  for (let n = 0; f && n < 8; f = f.return, n++) { kind = names.get(f.type); if (/^(BarChart|StackedBar|LineChart|DonutChart|Waterfall|ComboChart|Sparkline)$/.test(kind)) break; kind = null; }
  if (!/^(BarChart|StackedBar|LineChart|DonutChart)$/.test(kind || '')) return null;
  const p = f.memoizedProps;
  const probe = document.createElement('i'); svg.parentElement.appendChild(probe);
  const color = (c) => { probe.style.color = ''; probe.style.color = c; const m = getComputedStyle(probe).color.match(/[\d.]+/g).slice(0, 3).map(Number); return m.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase(); };
  const serCol = (s, i) => color(s.color || `var(--chart-${(i % 6) + 1})`);
  const def = (v, d = 1) => v.toLocaleString('ru-BY', { maximumFractionDigits: d });
  const style = (sel) => { const el = svg.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); return { size: parseFloat(cs.fontSize), bold: parseInt(cs.fontWeight, 10) >= 600, color: color(cs.fill) }; };
  const line = (sel) => { const el = svg.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); return { color: color(cs.stroke), w: parseFloat(cs.strokeWidth) || 2 }; };
  const nice = (min, max, count = 5) => {
    if (min === max) max = min + 1;
    const span = max - min, mag = 10 ** Math.floor(Math.log10(span / count));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) || 10 * mag;
    return { min: +(Math.floor(min / step) * step).toFixed(10), max: +(Math.ceil(max / step) * step).toFixed(10), step };
  };
  const ticksOf = (sc) => { const t = []; for (let v = sc.min; v <= sc.max + sc.step / 2; v += sc.step) t.push(+v.toFixed(10)); return t; };
  // формат Excel по подписям: одинаковые приставка и единица, число в подписи равно значению; иначе null
  const code = (vals, format) => {
    let dec = 0, mixed = false, group = false; let n = 0; const pre = {}, suf = new Set();
    for (const v of vals) {
      const s = String(format(v)), m = /^([^\d]*?)(\d[\d\s  ]*(?:[.,]\d+)?)([^\d]*)$/.exec(s);
      if (!m) return null;
      const body = m[2].trim(), tail = m[2].slice(m[2].trimEnd().length) + m[3], d = (/[.,](\d+)$/.exec(body) || ['', ''])[1].length;
      if (Math.abs(parseFloat(body.replace(/[\s  ]/g, '').replace(',', '.')) - Math.abs(v)) > 0.5 * 10 ** -d + 1e-9) return null;
      const sign = v < 0 ? '-' : v > 0 ? '+' : '0';
      if (pre[sign] !== undefined && pre[sign] !== m[1]) return null;
      pre[sign] = m[1]; suf.add(tail); if (n++ && d !== dec) mixed = true; dec = Math.max(dec, d); if (/[\s  ]/.test(body)) group = true;
    }
    if (suf.size > 1) return null;
    const q = (s) => (s ? `"${s.replace(/"/g, '')}"` : ''), num = mixed && !group ? 'General' : (group ? '#,##0' : '0') + (dec ? '.' + '0'.repeat(dec) : ''), s = q([...suf][0]);
    const pos = q(pre['+'] ?? pre['0'] ?? '') + num + s;
    return pre['-'] !== undefined || (pre['+'] && pre['0'] !== undefined) ? `${pos};${q(pre['-'] ?? '−')}${num}${s}${pre['+'] ? ';' + q(pre['0'] ?? '') + num + s : ''}` : pos;
  };
  const done = (o) => { probe.remove(); return o; };
  const ok = (a) => a.every((v) => typeof v === 'number' && Number.isFinite(v));
  const base = { kind, cat: style('.wt-cat'), val: style('.wt-val'), inn: style('.wt-val-in'), tick: style('.wt-tick'), axis: line('.wt-axis'), grid: line('.wt-gridline'), title: p.title || '' };
  const text = (c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : null);

  if (kind === 'DonutChart') {
    const cats = p.data.map((d) => text(d.label)), vals = p.data.map((d) => d.value);
    if (!ok(vals) || cats.includes(null)) return done(null);
    const size = p.size || 520, th = p.thickness || 88;
    return done({ ...base, cats, series: [{ name: p.title || 'Значение', values: vals, points: p.data.map(serCol) }], hole: Math.round((1 - th / (size / 2 - 4)) * 100), surface: color('var(--surface)'), w: size, h: size, plot: { x: 4, y: 4, w: size - 8, h: size - 8 }, code: 'General' });
  }
  const grouped = !!p.series;
  const cats = (grouped ? p.categories : p.data.map((d) => d.label)).map(text);
  const sers = (grouped ? p.series : [{ name: p.title || 'Значение', values: p.data.map((d) => d.value) }]).map((s, i) => ({ name: s.name || `Ряд ${i + 1}`, values: s.values, color: serCol(s, i), dashed: !!s.dashed }));
  const all = sers.flatMap((s) => s.values);
  if (!ok(all) || cats.includes(null)) return done(null);
  const w = p.width || 1100, h = p.height || 600, horizontal = p.orientation === 'horizontal', n = cats.length;
  const longest = Math.max(...cats.map((c) => c.length)) * 14 + 24;

  if (kind === 'BarChart') {
    const showValues = p.showValues ?? true, fc = code(all, p.format || def);
    const sc = nice(Math.min(0, ...all), Math.max(...all));
    const tickCode = p.showGrid ? code(ticksOf(sc), p.format || def) : fc;
    if (!fc || !tickCode) return done(null);
    if (!grouped) {
      const hit = (d, i) => (typeof p.highlight === 'number' ? i === p.highlight : d.label === p.highlight);
      sers[0].points = p.data.map((d, i) => color(d.color || (p.highlight == null ? 'var(--chart-1)' : hit(d, i) ? 'var(--accent)' : 'var(--brand-300)')));
    }
    if (horizontal) {
      const x0 = Math.min(420, longest), x1 = w - (showValues ? 140 : 16), row = (h - 8) / n, bar = Math.min(56, (row * 0.62) / sers.length);
      return done({ ...base, cats, series: sers, horizontal, showValues, sc, code: fc, w, h, plot: { x: x0, y: 4, w: x1 - x0, h: h - 8 }, gap: (row - bar * sers.length) / bar });
    }
    const x0 = p.showGrid ? 96 : 8, x1 = w - 8, y0 = showValues ? 48 : 16, col = (x1 - x0) / n, bar = Math.min(120, (col * 0.64) / sers.length);
    return done({ ...base, cats, series: sers, showValues, showGrid: !!p.showGrid, tickCode, sc, code: fc, w, h, plot: { x: x0, y: y0, w: x1 - x0, h: h - 56 - y0 }, gap: (col - bar * sers.length) / bar });
  }
  if (kind === 'StackedBar') {
    const pct = !!p.percent, totals = cats.map((_, i) => sers.reduce((a, s) => a + s.values[i], 0)), showTotals = (p.showTotals ?? true) && !pct;
    if (horizontal && showTotals || all.some((v) => v < 0)) return done(null);
    if (pct) sers.forEach((s) => { s.values = s.values.map((v, i) => +((v / totals[i]) * 100).toFixed(4)); });
    const fc = code([...sers.flatMap((s) => s.values), ...(showTotals ? totals : [])], p.format || (pct ? (v) => def(v, 0) + '%' : def));
    if (!fc) return done(null);
    const sc = pct ? { min: 0, max: 100, step: 25 } : nice(0, Math.max(...totals));
    const o = { ...base, cats, series: sers, horizontal, stacked: true, sc, code: fc, w, h, totals: showTotals ? totals : null, surface: color('var(--surface)') };
    if (horizontal) { const x0 = Math.min(360, longest), row = (h - 8) / n, bar = Math.min(64, row * 0.62); Object.assign(o, { plot: { x: x0, y: 4, w: w - 16 - x0, h: h - 8 }, gap: (row - bar) / bar, min: 80 }); }
    else { const y0 = (p.showTotals ?? true) ? 48 : 16, col = (w - 16) / n, bar = Math.min(140, col * 0.6); Object.assign(o, { plot: { x: 8, y: y0, w: w - 16, h: h - 56 - y0 }, gap: (col - bar) / bar, min: 40 }); }
    const len = horizontal ? o.plot.w : o.plot.h;
    sers.forEach((s) => { s.hide = s.values.map((v) => (p.showValues ?? true) === false || (v / sc.max) * len - 2 <= o.min); });
    return done(o);
  }
  // LineChart и AreaChart
  if (p.stacked) return done(null);
  const sc = nice(p.yMin ?? Math.min(p.area ? 0 : Math.min(...all), ...all), p.yMax ?? Math.max(...all));
  const fc = code(all, p.format || def), tc = code(ticksOf(sc), p.format || def);
  if (!fc || !tc || n < 2) return done(null);
  const last = p.labelLast ?? true;
  return done({ ...base, cats, series: sers, area: !!p.area, markers: p.markers ?? true, labelLast: last, showGrid: true, sc, code: fc, tickCode: tc, skip: Math.ceil(n / 12), surface: color('var(--surface)'), w, h, plot: { x: 96, y: 24, w: w - (last ? 150 : 32) - 96, h: h - 80 } });
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const EMU = 9525; // 1 px холста
const col = (i) => { let s = ''; for (i++; i; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s; return s; };

// Ряды для pptxgenjs: он пишет встроенную книгу (A — категории, B… — ряды)
export const sheetData = (c) => [...c.series.map((s) => ({ name: s.name, labels: c.cats, values: s.values })), ...(c.totals ? [{ name: 'Итого', labels: c.cats, values: c.totals }] : [])];

// XML диаграммы целиком: порядок элементов — по схеме DrawingML, иначе PowerPoint просит восстановить файл
export function chartXml(c, { font, k }) {
  const n = c.cats.length;
  const fill = (hex, a) => `<a:solidFill><a:srgbClr val="${hex}">${a ? `<a:alpha val="${a}"/>` : ''}</a:srgbClr></a:solidFill>`;
  const ln = (o, extra = '') => (o ? `<a:ln w="${Math.round(o.w * EMU)}" cap="${o.cap || 'flat'}">${fill(o.color)}${o.dash ? '<a:prstDash val="dash"/>' : ''}${extra}</a:ln>` : '<a:ln><a:noFill/></a:ln>');
  const tx = (st) => { const s = st || { size: 24, color: '161F32' }; return `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="${Math.round(s.size * 75 * k)}" b="${s.bold ? 1 : 0}">${fill(s.color)}<a:latin typeface="${font}"/><a:cs typeface="${font}"/></a:defRPr></a:pPr><a:endParaRPr lang="ru-RU"/></a:p></c:txPr>`; };
  const flags = (v) => `<c:showLegendKey val="0"/><c:showVal val="${v}"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/>`;
  const lbl = (st, pos, hide = []) => `<c:dLbls>${hide.map((h, i) => (h ? `<c:dLbl><c:idx val="${i}"/><c:delete val="1"/></c:dLbl>` : '')).join('')}<c:numFmt formatCode="${esc(c.code)}" sourceLinked="0"/><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${tx(st)}<c:dLblPos val="${pos}"/>${flags(1)}</c:dLbls>`;
  const none = `<c:dLbls>${flags(0)}</c:dLbls>`;
  const head = (s, i, order) => `<c:idx val="${order}"/><c:order val="${order}"/><c:tx><c:strRef><c:f>Sheet1!$${col(i + 1)}$1</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>${esc(s.name)}</c:v></c:pt></c:strCache></c:strRef></c:tx>`;
  const data = (s, i) => `<c:cat><c:strRef><c:f>Sheet1!$A$2:$A$${n + 1}</c:f><c:strCache><c:ptCount val="${n}"/>${c.cats.map((v, j) => `<c:pt idx="${j}"><c:v>${esc(v)}</c:v></c:pt>`).join('')}</c:strCache></c:strRef></c:cat><c:val><c:numRef><c:f>Sheet1!$${col(i + 1)}$2:$${col(i + 1)}$${n + 1}</c:f><c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${n}"/>${s.values.map((v, j) => `<c:pt idx="${j}"><c:v>${v}</c:v></c:pt>`).join('')}</c:numCache></c:numRef></c:val>`;
  const points = (s, extra) => (s.points || []).map((h, j) => `<c:dPt><c:idx val="${j}"/>${c.kind === 'DonutChart' ? '' : '<c:invertIfNegative val="0"/>'}<c:bubble3D val="0"/><c:spPr>${fill(h)}${extra}</c:spPr></c:dPt>`).join('');
  const gapLn = c.surface ? ln({ color: c.surface, w: 2 }) : ln(null);
  const ax = '<c:axId val="111"/><c:axId val="222"/>';
  let plots = '';
  if (c.kind === 'DonutChart') {
    const s = c.series[0];
    plots = `<c:doughnutChart><c:varyColors val="1"/><c:ser>${head(s, 0, 0)}${points(s, gapLn)}${data(s, 0)}</c:ser><c:dLbls>${flags(0)}<c:showLeaderLines val="0"/></c:dLbls><c:firstSliceAng val="0"/><c:holeSize val="${Math.min(90, Math.max(10, c.hole))}"/></c:doughnutChart>`;
  } else if (c.kind === 'LineChart') {
    if (c.area) plots += `<c:areaChart><c:grouping val="standard"/><c:varyColors val="0"/>${c.series.map((s, i) => `<c:ser>${head(s, i, i)}<c:spPr>${fill(s.color, 18000)}${ln(null)}</c:spPr>${data(s, i)}</c:ser>`).join('')}${ax}</c:areaChart>`;
    const shift = c.area ? c.series.length : 0;
    plots += `<c:lineChart><c:grouping val="standard"/><c:varyColors val="0"/>${c.series.map((s, i) => {
      const mark = (z) => `<c:marker><c:symbol val="circle"/><c:size val="${z}"/><c:spPr>${fill(s.color)}${ln({ color: c.surface, w: 2 })}</c:spPr></c:marker>`;
      const line = ln({ color: s.color, w: 4, cap: 'rnd', dash: s.dashed }, '<a:round/>');
      const lastLbl = c.labelLast ? `<c:dLbls><c:dLbl><c:idx val="${n - 1}"/><c:numFmt formatCode="${esc(c.code)}" sourceLinked="0"/><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${tx(c.val)}<c:dLblPos val="r"/>${flags(1)}</c:dLbl>${flags(0)}</c:dLbls>` : none;
      return `<c:ser>${head(s, i, i + shift)}<c:spPr>${line}</c:spPr>${c.markers ? mark(9) : '<c:marker><c:symbol val="none"/></c:marker>'}${lastLbl}${data(s, i)}<c:smooth val="0"/></c:ser>`;
    }).join('')}<c:marker val="1"/>${ax}</c:lineChart>`;
  } else {
    plots = `<c:barChart><c:barDir val="${c.horizontal ? 'bar' : 'col'}"/><c:grouping val="${c.stacked ? 'stacked' : 'clustered'}"/><c:varyColors val="0"/>${c.series.map((s, i) => `<c:ser>${head(s, i, i)}<c:spPr>${fill(s.color)}${c.stacked ? gapLn : ln(null)}</c:spPr><c:invertIfNegative val="0"/>${points(s, ln(null))}${c.stacked ? (s.hide.every(Boolean) ? none : lbl(c.inn, 'ctr', s.hide)) : c.showValues ? lbl(c.val, 'outEnd') : none}${data(s, i)}</c:ser>`).join('')}<c:gapWidth val="${Math.min(500, Math.max(0, Math.round(c.gap * 100)))}"/><c:overlap val="${c.stacked ? 100 : 0}"/>${ax}</c:barChart>`;
    // итоги над столбцами — невидимая линия по столбцу «Итого» с формулой суммы
    if (c.totals) plots += `<c:lineChart><c:grouping val="standard"/><c:varyColors val="0"/><c:ser>${head({ name: 'Итого' }, c.series.length, c.series.length)}<c:spPr>${ln(null)}</c:spPr><c:marker><c:symbol val="none"/></c:marker>${lbl(c.val, 't')}${data({ values: c.totals }, c.series.length)}<c:smooth val="0"/></c:ser><c:marker val="1"/>${ax}</c:lineChart>`;
  }
  const tick = '<c:majorTickMark val="none"/><c:minorTickMark val="none"/>';
  const axes = c.kind === 'DonutChart' ? '' : `<c:catAx><c:axId val="111"/><c:scaling><c:orientation val="${c.horizontal ? 'maxMin' : 'minMax'}"/></c:scaling><c:delete val="0"/><c:axPos val="${c.horizontal ? 'l' : 'b'}"/><c:numFmt formatCode="General" sourceLinked="0"/>${tick}<c:tickLblPos val="low"/><c:spPr>${ln(c.axis)}</c:spPr>${tx(c.cat)}<c:crossAx val="222"/><c:crosses val="autoZero"/><c:auto val="0"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/>${c.skip > 1 ? `<c:tickLblSkip val="${c.skip}"/>` : ''}<c:noMultiLvlLbl val="1"/></c:catAx>`
    + `<c:valAx><c:axId val="222"/><c:scaling><c:orientation val="minMax"/><c:max val="${c.sc.max}"/><c:min val="${c.sc.min}"/></c:scaling><c:delete val="${c.showGrid ? 0 : 1}"/><c:axPos val="${c.horizontal ? 't' : 'l'}"/>${c.showGrid && c.grid ? `<c:majorGridlines><c:spPr>${ln(c.grid)}</c:spPr></c:majorGridlines>` : ''}<c:numFmt formatCode="${esc(c.tickCode || c.code)}" sourceLinked="0"/>${tick}<c:tickLblPos val="nextTo"/><c:spPr>${ln(null)}</c:spPr>${tx(c.tick)}<c:crossAx val="111"/><c:crosses val="autoZero"/><c:crossBetween val="${c.kind === 'LineChart' ? 'midCat' : 'between'}"/><c:majorUnit val="${c.sc.step}"/></c:valAx>`;
  const fr = (v) => +v.toFixed(5);
  const layout = `<c:layout><c:manualLayout><c:layoutTarget val="inner"/><c:xMode val="edge"/><c:yMode val="edge"/><c:x val="${fr(c.plot.x / c.w)}"/><c:y val="${fr(c.plot.y / c.h)}"/><c:w val="${fr(c.plot.w / c.w)}"/><c:h val="${fr(c.plot.h / c.h)}"/></c:manualLayout></c:layout>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><c:date1904 val="0"/><c:roundedCorners val="0"/><c:chart><c:autoTitleDeleted val="1"/><c:plotArea>${layout}${plots}${axes}<c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr></c:plotArea><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${tx(c.cat)}<c:externalData r:id="rId1"><c:autoUpdate val="0"/></c:externalData></c:chartSpace>`;
}

// Формулы «Итого» во встроенной книге: сумма рядов пересчитывается при правке данных
export function totalsFormulas(sheetXml, c) {
  const t = col(c.series.length + 1), from = col(1), to = col(c.series.length);
  return sheetXml.replace(new RegExp(`<c r="${t}(\\d+)"([^>]*)>\\s*<v>`, 'g'), (m, row, attr) => (+row < 2 ? m : `<c r="${t}${row}"${attr}><f>SUM(${from}${row}:${to}${row})</f><v>`));
}
