// SVG → фигуры, линии и тексты PowerPoint (для tools/html2pptx.mjs).
// svgToItems выполняется в браузере. Возвращает список элементов в координатах слайда 1920×1080
// или null, если в SVG есть то, что фигурами не передать (градиенты, маски, фильтры, повёрнутый текст…) — тогда SVG уходит картинкой.
export function svgToItems(svg, slideRect, sc) {
  if (svg.querySelector('image, foreignObject, mask, pattern, filter, textPath, use, linearGradient, radialGradient')) return null;
  const items = [];
  const num = (v) => parseFloat(v) || 0;
  const color = (s) => {
    const m = s && s.match(/^rgba?\(([^)]+)\)$/), c = !m && s && s.match(/^color\(srgb ([^)]+)\)$/);
    if (!m && !c) return null;
    const p = (m ? m[1] : c[1]).split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
    const [r, g, b] = m ? p : p.map((x, i) => (i < 3 ? x * 255 : x));
    const a = p.length > 3 ? p[3] : 1;
    return a ? { hex: [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase(), a } : null;
  };
  const alpha = (el) => { let a = 1; for (let e = el; e && e !== svg.parentElement; e = e.parentElement) a *= parseFloat(getComputedStyle(e).opacity); return a; };
  const at = (m) => (x, y) => ({ x: (m.a * x + m.c * y + m.e - slideRect.left) / sc, y: (m.b * x + m.d * y + m.f - slideRect.top) / sc });

  // path → сегменты M, L, C, Z в абсолютных координатах
  const parse = (d) => {
    const tk = d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) || [];
    const out = [];
    let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, prev = '';
    const n = () => +tk[i++];
    // флаги дуги бывают слитно («01»), поэтому для A токены читаются с разбором
    const flag = () => { const t = tk[i]; if (t.length > 1 && /^[01]/.test(t)) { tk[i] = t.slice(1); return +t[0]; } i++; return +t; };
    while (i < tk.length) {
      if (/[a-zA-Z]/.test(tk[i])) cmd = tk[i++];
      const C = cmd.toUpperCase(), rx = cmd === C ? 0 : x, ry = cmd === C ? 0 : y;
      if (C === 'Z') { out.push({ t: 'Z' }); x = sx; y = sy; prev = 'Z'; continue; }
      if (C === 'M') { x = rx + n(); y = ry + n(); sx = x; sy = y; out.push({ t: 'M', x, y }); cmd = cmd === 'm' ? 'l' : 'L'; }
      else if (C === 'L') { x = rx + n(); y = ry + n(); out.push({ t: 'L', x, y }); }
      else if (C === 'H') { x = rx + n(); out.push({ t: 'L', x, y }); }
      else if (C === 'V') { y = ry + n(); out.push({ t: 'L', x, y }); }
      else if (C === 'C' || C === 'S') {
        let x1, y1;
        if (C === 'C') { x1 = rx + n(); y1 = ry + n(); } else { x1 = /[CS]/.test(prev) ? 2 * x - px : x; y1 = /[CS]/.test(prev) ? 2 * y - py : y; }
        const x2 = rx + n(), y2 = ry + n(); x = rx + n(); y = ry + n();
        out.push({ t: 'C', x1, y1, x2, y2, x, y }); px = x2; py = y2;
      } else if (C === 'Q' || C === 'T') {
        let qx, qy;
        if (C === 'Q') { qx = rx + n(); qy = ry + n(); } else { qx = /[QT]/.test(prev) ? 2 * x - px : x; qy = /[QT]/.test(prev) ? 2 * y - py : y; }
        const ex = rx + n(), ey = ry + n();
        out.push({ t: 'C', x1: x + (2 / 3) * (qx - x), y1: y + (2 / 3) * (qy - y), x2: ex + (2 / 3) * (qx - ex), y2: ey + (2 / 3) * (qy - ey), x: ex, y: ey });
        px = qx; py = qy; x = ex; y = ey;
      } else if (C === 'A') {
        let a = Math.abs(n()), b = Math.abs(n());
        const phi = (n() * Math.PI) / 180, fa = flag(), fs = flag(), ex = rx + n(), ey = ry + n();
        if (!a || !b) out.push({ t: 'L', x: ex, y: ey });
        else if (ex !== x || ey !== y) {
          const co = Math.cos(phi), si = Math.sin(phi), dx = (x - ex) / 2, dy = (y - ey) / 2;
          const xp = co * dx + si * dy, yp = -si * dx + co * dy, lam = (xp * xp) / (a * a) + (yp * yp) / (b * b);
          if (lam > 1) { a *= Math.sqrt(lam); b *= Math.sqrt(lam); }
          const k = (fa === fs ? -1 : 1) * Math.sqrt(Math.max(0, (a * a * b * b - a * a * yp * yp - b * b * xp * xp) / (a * a * yp * yp + b * b * xp * xp)));
          const cxp = (k * a * yp) / b, cyp = (-k * b * xp) / a, cx = co * cxp - si * cyp + (x + ex) / 2, cy = si * cxp + co * cyp + (y + ey) / 2;
          const t1 = Math.atan2((yp - cyp) / b, (xp - cxp) / a);
          let dt = Math.atan2((-yp - cyp) / b, (-xp - cxp) / a) - t1;
          if (!fs && dt > 0) dt -= 2 * Math.PI; else if (fs && dt < 0) dt += 2 * Math.PI;
          const steps = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-6)), th = dt / steps, al = (4 / 3) * Math.tan(th / 4);
          const pt = (u, v) => [cx + co * a * u - si * b * v, cy + si * a * u + co * b * v];
          for (let j = 0; j < steps; j++) {
            const p = t1 + j * th, q = p + th;
            const [x1, y1] = pt(Math.cos(p) - al * Math.sin(p), Math.sin(p) + al * Math.cos(p)), [x2, y2] = pt(Math.cos(q) + al * Math.sin(q), Math.sin(q) - al * Math.cos(q)), [xx, yy] = pt(Math.cos(q), Math.sin(q));
            out.push({ t: 'C', x1, y1, x2, y2, x: xx, y: yy });
          }
        }
        x = ex; y = ey;
      } else return null;
      prev = C;
    }
    return out;
  };

  let bad = false;
  const used = new Set();
  const textItems = (el) => {
    const out = [];
    const w = document.createTreeWalker(el, 4);
    while (w.nextNode()) {
      const n = w.currentNode;
      if (!n.textContent.trim() || n.parentElement.closest('title, desc')) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      const b = r.getBoundingClientRect();
      const p = n.parentElement, cs = getComputedStyle(p), m = p.getScreenCTM(), k = Math.hypot(m.a, m.b) / sc;
      if (Math.abs(m.b) > 0.01 || Math.abs(m.c) > 0.01) { bad = true; return out; }
      const col = color(cs.fill);
      if (!b.width || !col) continue;
      out.push({ t: 'vtext', x: (b.left - slideRect.left) / sc, y: (b.top - slideRect.top) / sc, w: b.width / sc, h: b.height / sc, text: n.textContent.replace(/[ \t\n\r]+/g, ' ').trim(), size: num(cs.fontSize) * k, bold: parseInt(cs.fontWeight, 10) >= 600, italic: cs.fontStyle === 'italic', color: col.hex, align: cs.textAnchor === 'middle' ? 'center' : cs.textAnchor === 'end' ? 'right' : 'left' });
    }
    return out;
  };

  const walk = (el) => {
    if (bad || el.nodeType !== 1) return;
    const tag = el.tagName.toLowerCase();
    if (['defs', 'title', 'desc', 'marker', 'style', 'clippath'].includes(tag)) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if ((cs.clipPath && cs.clipPath !== 'none') || (cs.filter && cs.filter !== 'none') || (cs.maskImage && cs.maskImage !== 'none')) { bad = true; return; }
    if (tag === 'g' || tag === 'svg' || tag === 'a') { for (const c of el.children) walk(c); return; }
    if (tag === 'text') { if (!used.has(el)) items.push(...textItems(el)); return; }
    if (!['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'].includes(tag)) { bad = true; return; }
    if (/url\(/.test(cs.fill) || /url\(/.test(cs.stroke)) { bad = true; return; }
    const m = el.getScreenCTM(), P = at(m), k = Math.hypot(m.a, m.b) / sc, op = alpha(el), straight = Math.abs(m.b) < 1e-3 && Math.abs(m.c) < 1e-3;
    if (op === 0) return;
    let fill = cs.fill === 'none' || tag === 'line' ? null : color(cs.fill);
    if (fill) fill = { hex: fill.hex, a: fill.a * num(cs.fillOpacity) * op };
    const sw = num(cs.strokeWidth) * k, st = cs.stroke === 'none' || !sw ? null : color(cs.stroke);
    const line = st ? { c: st.hex, a: st.a * num(cs.strokeOpacity) * op, w: sw, dash: cs.strokeDasharray !== 'none' && cs.strokeDasharray !== '', end: cs.markerEnd !== 'none', start: cs.markerStart !== 'none', round: cs.strokeLinecap === 'round' } : null;
    if ((!fill || !fill.a) && (!line || !line.a)) return;
    const v = (name) => el[name].baseVal.value;
    if (tag === 'rect' && straight) {
      const a = P(v('x'), v('y')), w = v('width') * k, h = v('height') * k;
      if (w <= 0 || h <= 0) return;
      const it = { t: 'vrect', x: a.x, y: a.y, w, h, radius: Math.max(num(cs.rx), num(cs.ry), v('rx'), v('ry')) * k, fill, line };
      // подписи внутри прямоугольника той же группы становятся текстом фигуры: двигаются вместе с ней
      if (fill && el.parentElement.tagName.toLowerCase() === 'g') {
        const sib = [...el.parentElement.children].filter((c) => c.tagName.toLowerCase() === 'text' && !used.has(c));
        const ts = sib.map((c) => [c, textItems(c)]).filter(([, x]) => x.length === 1 && x[0].align === 'center' && Math.abs(x[0].x + x[0].w / 2 - it.x - w / 2) < 6 && x[0].y >= it.y - 2 && x[0].y + x[0].h <= it.y + h + 2 && x[0].w <= w);
        if (ts.length && el.parentElement.querySelectorAll(':scope > rect').length === 1) {
          const list = ts.map(([, x]) => x[0]).sort((p, q) => p.y - q.y);
          const mid = (list[0].y + list.at(-1).y + list.at(-1).h) / 2;
          if (Math.abs(mid - it.y - h / 2) < Math.max(12, h * 0.15)) { it.texts = list; ts.forEach(([c]) => used.add(c)); }
        }
      }
      items.push(it);
      return;
    }
    if ((tag === 'circle' || tag === 'ellipse') && straight) {
      const c = P(v('cx'), v('cy')), a = (tag === 'circle' ? v('r') : v('rx')) * k, b = (tag === 'circle' ? v('r') : v('ry')) * k;
      items.push({ t: 'vellipse', x: c.x - a, y: c.y - b, w: 2 * a, h: 2 * b, fill, line });
      return;
    }
    let d;
    if (tag === 'line') d = `M${v('x1')} ${v('y1')}L${v('x2')} ${v('y2')}`;
    else if (tag === 'polyline' || tag === 'polygon') { const p = [...el.points].map((q) => `${q.x} ${q.y}`); if (p.length < 2) return; d = 'M' + p.join('L') + (tag === 'polygon' ? 'Z' : ''); }
    else if (tag === 'rect') d = `M${v('x')} ${v('y')}h${v('width')}v${v('height')}h${-v('width')}Z`;
    else if (tag === 'circle' || tag === 'ellipse') { const a = tag === 'circle' ? v('r') : v('rx'), b = tag === 'circle' ? v('r') : v('ry'); d = `M${v('cx') - a} ${v('cy')}A${a} ${b} 0 1 0 ${v('cx') + a} ${v('cy')}A${a} ${b} 0 1 0 ${v('cx') - a} ${v('cy')}Z`; }
    else d = el.getAttribute('d') || getComputedStyle(el).d;
    const seg = d && parse(d);
    if (!seg) { if (d) bad = true; return; }
    // каждый открытый контур со стрелкой или без — отдельная фигура, если нет заливки
    const subs = [];
    for (const s of seg) { if (s.t === 'M' || !subs.length) subs.push([]); subs.at(-1).push(s); }
    const groups = fill && fill.a ? [seg] : subs;
    groups.forEach((g, gi) => {
      const pts = g.map((s) => { if (s.t === 'Z') return { t: 'Z' }; const e = P(s.x, s.y); if (s.t !== 'C') return { t: s.t, ...e }; const a = P(s.x1, s.y1), b = P(s.x2, s.y2); return { t: 'C', x1: a.x, y1: a.y, x2: b.x, y2: b.y, ...e }; });
      const real = pts.filter((p) => p.t !== 'Z');
      if (real.length < 2) return;
      // маркеры SVG ставятся на начало первого и конец последнего контура
      const ln = line && { ...line, start: line.start && gi === 0, end: line.end && gi === groups.length - 1 };
      if (real.length === 2 && pts.length === 2 && pts[1].t === 'L') { if (ln) items.push({ t: 'vline', x1: real[0].x, y1: real[0].y, x2: real[1].x, y2: real[1].y, line: ln }); return; }
      const xs = real.flatMap((p) => (p.t === 'C' ? [p.x, p.x1, p.x2] : [p.x])), ys = real.flatMap((p) => (p.t === 'C' ? [p.y, p.y1, p.y2] : [p.y]));
      const x = Math.min(...xs), y = Math.min(...ys);
      items.push({ t: 'vpath', x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y, pts, fill: fill && fill.a ? fill : null, line: ln });
    });
  };
  walk(svg);
  return bad || !items.length ? null : items;
}
