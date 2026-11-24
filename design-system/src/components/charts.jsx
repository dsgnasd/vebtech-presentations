// Графики на чистом SVG. Размеры — в пикселях холста 1920×1080. Текст ≥24px.
import { cx, fmt } from './core.jsx';
import { Legend } from './molecules.jsx';

const SERIES = (i) => `var(--chart-${(i % 6) + 1})`;
const FS = 24; // минимальный кегль подписей

function nice(min, max, count = 5) {
  if (min === max) max = min + 1;
  const span = max - min;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) || 10 * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
  return { min: lo, max: hi, ticks };
}

// Прямоугольник со скруглённым концом данных (верх/право) и прямым основанием.
function barPath(x, y, w, h, r, dir = 'up') {
  if (w <= 0 || h <= 0) return '';
  if (dir === 'up') {
    r = Math.min(r, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  if (dir === 'down') {
    r = Math.min(r, w / 2, h);
    return `M${x},${y}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w - r}Q${x + w},${y + h} ${x + w},${y + h - r}V${y}Z`;
  }
  r = Math.min(r, h / 2, w); // right
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

function ChartShell({ width, height, title, legend, children, className, style }) {
  return (
    <figure className={cx('wt-chart', className)} style={{ width, ...style }}>
      {legend && legend.length > 1 ? <Legend items={legend} /> : null}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="wt-chart-svg">
        {title ? <title>{title}</title> : null}
        {children}
      </svg>
    </figure>
  );
}

function YGrid({ scale, x0, x1, y, format, showLabels = true }) {
  return (
    <g className="wt-grid">
      {scale.ticks.map((t) => (
        <g key={t}>
          <line x1={x0} x2={x1} y1={y(t)} y2={y(t)} className={t === 0 ? 'wt-axis' : 'wt-gridline'} />
          {showLabels ? <text x={x0 - 16} y={y(t)} dy="0.35em" textAnchor="end" className="wt-tick">{format(t)}</text> : null}
        </g>
      ))}
    </g>
  );
}

/* ---------- BarChart: столбцы и полосы, одна серия или сгруппированные ---------- */
export function BarChart({
  data, categories, series, orientation = 'vertical', width = 1100, height = 600,
  highlight, format = (v) => fmt(v), showValues = true, showGrid = false, title, className, style,
}) {
  const grouped = !!series;
  const cats = grouped ? categories : data.map((d) => d.label);
  const sers = grouped ? series : [{ name: title || '', values: data.map((d) => d.value) }];
  const all = sers.flatMap((s) => s.values);
  const sc = nice(Math.min(0, ...all), Math.max(...all));
  const colorOf = (si, ci) => {
    if (grouped) return sers[si].color || SERIES(si);
    const d = data[ci];
    if (d.color) return d.color;
    if (highlight == null) return 'var(--chart-1)';
    const hit = typeof highlight === 'number' ? ci === highlight : d.label === highlight;
    return hit ? 'var(--accent)' : 'var(--brand-300)';
  };

  if (orientation === 'horizontal') {
    const labelW = Math.min(420, Math.max(...cats.map((c) => String(c).length)) * 14 + 24);
    const x0 = labelW, x1 = width - (showValues ? 140 : 16);
    const rowH = (height - 8) / cats.length;
    const barH = Math.min(56, (rowH * 0.62) / sers.length);
    const x = (v) => x0 + ((v - sc.min) / (sc.max - sc.min)) * (x1 - x0);
    return (
      <ChartShell width={width} height={height} title={title} legend={grouped ? sers.map((s, i) => ({ label: s.name, color: s.color || SERIES(i) })) : null} className={className} style={style}>
        {cats.map((c, ci) => {
          const cy = 4 + rowH * ci + rowH / 2;
          const y0 = cy - (barH * sers.length + 2 * (sers.length - 1)) / 2;
          return (
            <g key={ci}>
              <text x={x0 - 20} y={cy} dy="0.35em" textAnchor="end" className="wt-cat">{c}</text>
              {sers.map((s, si) => {
                const v = s.values[ci];
                const y = y0 + si * (barH + 2);
                return (
                  <g key={si}>
                    <path d={barPath(x(0), y, x(v) - x(0), barH, 8, 'right')} fill={colorOf(si, ci)}>
                      <title>{`${c}${s.name ? ' · ' + s.name : ''}: ${format(v)}`}</title>
                    </path>
                    {showValues ? <text x={x(v) + 12} y={y + barH / 2} dy="0.35em" className="wt-val">{format(v)}</text> : null}
                  </g>
                );
              })}
            </g>
          );
        })}
        <line x1={x(0)} x2={x(0)} y1={0} y2={height} className="wt-axis" />
      </ChartShell>
    );
  }

  const x0 = showGrid ? 96 : 8, x1 = width - 8, yTop = showValues ? 48 : 16, yBot = height - 56;
  const y = (v) => yBot - ((v - sc.min) / (sc.max - sc.min)) * (yBot - yTop);
  const colW = (x1 - x0) / cats.length;
  const barW = Math.min(120, (colW * 0.64) / sers.length);
  return (
    <ChartShell width={width} height={height} title={title} legend={grouped ? sers.map((s, i) => ({ label: s.name, color: s.color || SERIES(i) })) : null} className={className} style={style}>
      {showGrid ? <YGrid scale={sc} x0={x0} x1={x1} y={y} format={format} /> : null}
      {cats.map((c, ci) => {
        const gx = x0 + colW * ci + colW / 2 - (barW * sers.length + 2 * (sers.length - 1)) / 2;
        return (
          <g key={ci}>
            {sers.map((s, si) => {
              const v = s.values[ci];
              const bx = gx + si * (barW + 2);
              const top = v >= 0 ? y(v) : y(0);
              return (
                <g key={si}>
                  <path d={barPath(bx, top, barW, Math.abs(y(v) - y(0)), 8, v >= 0 ? 'up' : 'down')} fill={colorOf(si, ci)}>
                    <title>{`${c}${s.name ? ' · ' + s.name : ''}: ${format(v)}`}</title>
                  </path>
                  {showValues ? <text x={bx + barW / 2} y={v >= 0 ? y(v) - 12 : y(v) + 32} textAnchor="middle" className="wt-val">{format(v)}</text> : null}
                </g>
              );
            })}
            <text x={x0 + colW * ci + colW / 2} y={height - 12} textAnchor="middle" className="wt-cat">{c}</text>
          </g>
        );
      })}
      <line x1={x0} x2={x1} y1={y(0)} y2={y(0)} className="wt-axis" />
    </ChartShell>
  );
}

/* ---------- StackedBar ---------- */
export function StackedBar({ categories, series, orientation = 'vertical', percent = false, width = 1100, height = 600, format, showValues = true, showTotals = true, title, className, style }) {
  const f = format || (percent ? (v) => fmt(v, { digits: 0 }) + '%' : (v) => fmt(v));
  const totals = categories.map((_, ci) => series.reduce((a, s) => a + s.values[ci], 0));
  const vals = (si, ci) => (percent ? (series[si].values[ci] / totals[ci]) * 100 : series[si].values[ci]);
  const max = percent ? 100 : Math.max(...totals);
  const sc = percent ? { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] } : nice(0, max);
  const legend = series.map((s, i) => ({ label: s.name, color: s.color || SERIES(i) }));
  const minLabel = 40; // сегмент тоньше — без подписи внутри

  if (orientation === 'horizontal') {
    const labelW = Math.min(360, Math.max(...categories.map((c) => String(c).length)) * 14 + 24);
    const x0 = labelW, x1 = width - (showTotals && !percent ? 120 : 16);
    const rowH = (height - 8) / categories.length;
    const barH = Math.min(64, rowH * 0.62);
    const x = (v) => x0 + (v / sc.max) * (x1 - x0);
    return (
      <ChartShell width={width} height={height} title={title} legend={legend} className={className} style={style}>
        {categories.map((c, ci) => {
          const cy = 4 + rowH * ci + rowH / 2;
          let acc = 0;
          return (
            <g key={ci}>
              <text x={x0 - 20} y={cy} dy="0.35em" textAnchor="end" className="wt-cat">{c}</text>
              {series.map((s, si) => {
                const v = vals(si, ci);
                const a = acc;
                acc += v;
                const last = si === series.length - 1;
                const w = x(a + v) - x(a) - (last ? 0 : 2);
                return (
                  <g key={si}>
                    <path d={last ? barPath(x(a), cy - barH / 2, w, barH, 8, 'right') : `M${x(a)},${cy - barH / 2}h${w}v${barH}h${-w}Z`} fill={s.color || SERIES(si)}>
                      <title>{`${c} · ${s.name}: ${f(v)}`}</title>
                    </path>
                    {showValues && w > minLabel * 2 ? <text x={x(a) + w / 2} y={cy} dy="0.35em" textAnchor="middle" className="wt-val-in">{f(v)}</text> : null}
                  </g>
                );
              })}
              {showTotals && !percent ? <text x={x(acc) + 12} y={cy} dy="0.35em" className="wt-val">{f(acc)}</text> : null}
            </g>
          );
        })}
      </ChartShell>
    );
  }

  const x0 = 8, x1 = width - 8, yTop = showTotals ? 48 : 16, yBot = height - 56;
  const y = (v) => yBot - (v / sc.max) * (yBot - yTop);
  const colW = (x1 - x0) / categories.length;
  const barW = Math.min(140, colW * 0.6);
  return (
    <ChartShell width={width} height={height} title={title} legend={legend} className={className} style={style}>
      {categories.map((c, ci) => {
        const bx = x0 + colW * ci + colW / 2 - barW / 2;
        let acc = 0;
        return (
          <g key={ci}>
            {series.map((s, si) => {
              const v = vals(si, ci);
              const a = acc;
              acc += v;
              const last = si === series.length - 1;
              const h = y(a) - y(a + v) - (last ? 0 : 2);
              const top = y(a + v) + (last ? 0 : 2);
              return (
                <g key={si}>
                  <path d={last ? barPath(bx, top, barW, h, 8, 'up') : `M${bx},${top}h${barW}v${h}h${-barW}Z`} fill={s.color || SERIES(si)}>
                    <title>{`${c} · ${s.name}: ${f(v)}`}</title>
                  </path>
                  {showValues && h > minLabel ? <text x={bx + barW / 2} y={top + h / 2} dy="0.35em" textAnchor="middle" className="wt-val-in">{f(v)}</text> : null}
                </g>
              );
            })}
            {showTotals && !percent ? <text x={bx + barW / 2} y={y(acc) - 12} textAnchor="middle" className="wt-val">{f(acc)}</text> : null}
            <text x={bx + barW / 2} y={height - 12} textAnchor="middle" className="wt-cat">{c}</text>
          </g>
        );
      })}
      <line x1={x0} x2={x1} y1={y(0)} y2={y(0)} className="wt-axis" />
    </ChartShell>
  );
}

/* ---------- LineChart / AreaChart ---------- */
function linePath(pts) {
  return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');
}

export function LineChart({ categories, series, width = 1100, height = 600, format = (v) => fmt(v), yMin, yMax, markers = true, labelLast = true, area = false, stacked = false, title, className, style }) {
  const stackedVals = series.map((s, si) => s.values.map((_, ci) => (stacked ? series.slice(0, si + 1).reduce((a, t) => a + t.values[ci], 0) : s.values[ci])));
  const all = stackedVals.flat();
  const sc = nice(yMin ?? Math.min(area ? 0 : Math.min(...all), ...all), yMax ?? Math.max(...all));
  const x0 = 96, x1 = width - (labelLast ? 150 : 32), yTop = 24, yBot = height - 56;
  const x = (i) => x0 + (categories.length === 1 ? 0 : (i / (categories.length - 1)) * (x1 - x0));
  const y = (v) => yBot - ((v - sc.min) / (sc.max - sc.min)) * (yBot - yTop);
  const legend = series.map((s, i) => ({ label: s.name, color: s.color || SERIES(i), shape: area ? 'square' : 'line' }));
  const step = Math.ceil(categories.length / 12);
  return (
    <ChartShell width={width} height={height} title={title} legend={legend} className={className} style={style}>
      <YGrid scale={sc} x0={x0} x1={x1} y={y} format={format} />
      {categories.map((c, i) => (i % step === 0 || i === categories.length - 1 ? <text key={i} x={x(i)} y={height - 12} textAnchor="middle" className="wt-cat">{c}</text> : null))}
      {area
        ? stackedVals.map((vals, si) => {
            const base = stacked && si > 0 ? stackedVals[si - 1] : vals.map(() => sc.min);
            const top = vals.map((v, i) => [x(i), y(v)]);
            const bottom = base.map((v, i) => [x(i), y(v)]).reverse();
            const col = series[si].color || SERIES(si);
            return <path key={'a' + si} d={linePath(top) + linePath(bottom).replace('M', 'L') + 'Z'} fill={col} fillOpacity={stacked ? 0.85 : 0.18} stroke="none" />;
          }).reverse()
        : null}
      {stackedVals.map((vals, si) => {
        const s = series[si];
        const col = s.color || SERIES(si);
        const pts = vals.map((v, i) => [x(i), y(v)]);
        const last = pts[pts.length - 1];
        return (
          <g key={si}>
            <path d={linePath(pts)} fill="none" stroke={stacked && area ? 'var(--surface)' : col} strokeWidth={stacked && area ? 2 : 4} strokeDasharray={s.dashed ? '12 10' : undefined} strokeLinejoin="round" strokeLinecap="round" />
            {markers && !(stacked && area)
              ? pts.map((p, i) => (
                  <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 9 : 6} fill={col} stroke="var(--surface)" strokeWidth="3">
                    <title>{`${categories[i]} · ${s.name}: ${format(s.values[i])}`}</title>
                  </circle>
                ))
              : null}
            {labelLast ? (
              <text x={last[0] + 16} y={last[1]} dy="0.35em" className="wt-val">{format(s.values[s.values.length - 1])}</text>
            ) : null}
          </g>
        );
      })}
    </ChartShell>
  );
}

export function AreaChart(props) {
  return <LineChart {...props} area markers={props.markers ?? !props.stacked} />;
}

/* ---------- DonutChart ---------- */
export function DonutChart({ data, size = 520, thickness = 88, centerValue, centerLabel, format = (v) => fmt(v, { digits: 0 }) + '%', percent = true, legend = 'right', title, className, style }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = size / 2 - 4, ri = r - thickness, c = size / 2;
  let a0 = -Math.PI / 2;
  const gap = 0.012;
  const arcs = data.map((d, i) => {
    const a = (d.value / total) * Math.PI * 2;
    const s = a0 + gap, e = a0 + a - gap;
    a0 += a;
    const large = e - s > Math.PI ? 1 : 0;
    const p = (rad, ang) => [c + rad * Math.cos(ang), c + rad * Math.sin(ang)];
    const [x1, y1] = p(r, s), [x2, y2] = p(r, e), [x3, y3] = p(ri, e), [x4, y4] = p(ri, s);
    return { d: `M${x1},${y1}A${r},${r} 0 ${large} 1 ${x2},${y2}L${x3},${y3}A${ri},${ri} 0 ${large} 0 ${x4},${y4}Z`, color: d.color || SERIES(i), v: percent ? (d.value / total) * 100 : d.value, label: d.label };
  });
  return (
    <figure className={cx('wt-donut', 'wt-donut-' + legend, className)} style={style}>
      <div className="wt-donut-plot" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={title}>
          {title ? <title>{title}</title> : null}
          {arcs.map((a, i) => (
            <path key={i} d={a.d} fill={a.color}>
              <title>{`${a.label}: ${format(a.v)}`}</title>
            </path>
          ))}
        </svg>
        {centerValue != null ? (
          <div className="wt-donut-center">
            <div className="wt-donut-value">{centerValue}</div>
            {centerLabel ? <div className="wt-donut-label">{centerLabel}</div> : null}
          </div>
        ) : null}
      </div>
      <ul className="wt-donut-legend">
        {arcs.map((a, i) => (
          <li key={i}>
            <span className="wt-swatch-mark wt-swatch-square" style={{ background: a.color }} />
            <span className="wt-donut-legend-label">{a.label}</span>
            <b>{format(a.v)}</b>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/* ---------- Waterfall ---------- */
export function Waterfall({ steps, width = 1400, height = 600, format = (v) => fmt(v), title, className, style }) {
  let run = 0;
  const bars = steps.map((s) => {
    if (s.total) { const b = { ...s, from: 0, to: s.value ?? run }; run = b.to; return b; }
    const b = { ...s, from: run, to: run + s.value };
    run = b.to;
    return b;
  });
  const lo = Math.min(0, ...bars.map((b) => Math.min(b.from, b.to)));
  const hi = Math.max(...bars.map((b) => Math.max(b.from, b.to)));
  const sc = nice(lo, hi);
  const x0 = 8, x1 = width - 8, yTop = 48, yBot = height - 56;
  const y = (v) => yBot - ((v - sc.min) / (sc.max - sc.min)) * (yBot - yTop);
  const colW = (x1 - x0) / bars.length;
  const barW = Math.min(120, colW * 0.62);
  const legend = [
    { label: 'Итог', color: 'var(--brand-deep)' },
    { label: 'Рост', color: 'var(--chart-1)' },
    { label: 'Снижение', color: 'var(--chart-other)' },
  ];
  return (
    <ChartShell width={width} height={height} title={title} legend={legend} className={className} style={style}>
      {bars.map((b, i) => {
        const bx = x0 + colW * i + colW / 2 - barW / 2;
        const top = y(Math.max(b.from, b.to));
        const h = Math.abs(y(b.from) - y(b.to));
        const col = b.total ? 'var(--brand-deep)' : b.value >= 0 ? 'var(--chart-1)' : 'var(--chart-other)';
        const label = b.total ? format(b.to) : (b.value > 0 ? '+' : b.value < 0 ? '−' : '') + format(Math.abs(b.value));
        return (
          <g key={i}>
            <rect x={bx} y={top} width={barW} height={Math.max(h, 2)} rx="8" fill={col}>
              <title>{`${b.label}: ${label}`}</title>
            </rect>
            {i < bars.length - 1 ? <line x1={bx + barW} x2={bx + colW} y1={y(b.to)} y2={y(b.to)} className="wt-connector" /> : null}
            <text x={bx + barW / 2} y={top - 12} textAnchor="middle" className="wt-val">{label}</text>
            <text x={bx + barW / 2} y={height - 12} textAnchor="middle" className="wt-cat">{b.label}</text>
          </g>
        );
      })}
      <line x1={x0} x2={x1} y1={y(0)} y2={y(0)} className="wt-axis" />
    </ChartShell>
  );
}

/* ---------- ComboChart: столбцы + линия на ОДНОЙ оси (например, факт и план) ---------- */
export function ComboChart({ categories, bars, line, width = 1100, height = 600, format = (v) => fmt(v), title, className, style }) {
  const all = [...bars.values, ...line.values];
  const sc = nice(Math.min(0, ...all), Math.max(...all));
  const x0 = 96, x1 = width - 8, yTop = 48, yBot = height - 56;
  const y = (v) => yBot - ((v - sc.min) / (sc.max - sc.min)) * (yBot - yTop);
  const colW = (x1 - x0) / categories.length;
  const barW = Math.min(110, colW * 0.56);
  const cxOf = (i) => x0 + colW * i + colW / 2;
  const legend = [
    { label: bars.name, color: bars.color || 'var(--chart-1)' },
    { label: line.name, color: line.color || 'var(--chart-2)', shape: 'line' },
  ];
  return (
    <ChartShell width={width} height={height} title={title} legend={legend} className={className} style={style}>
      <YGrid scale={sc} x0={x0} x1={x1} y={y} format={format} />
      {categories.map((c, i) => (
        <g key={i}>
          <path d={barPath(cxOf(i) - barW / 2, y(bars.values[i]), barW, y(0) - y(bars.values[i]), 8, 'up')} fill={bars.color || 'var(--chart-1)'}>
            <title>{`${c} · ${bars.name}: ${format(bars.values[i])}`}</title>
          </path>
          <text x={cxOf(i)} y={height - 12} textAnchor="middle" className="wt-cat">{c}</text>
        </g>
      ))}
      <path d={linePath(line.values.map((v, i) => [cxOf(i), y(v)]))} fill="none" stroke={line.color || 'var(--chart-2)'} strokeWidth="4" strokeDasharray={line.dashed === false ? undefined : '12 10'} strokeLinecap="round" />
      {line.values.map((v, i) => (
        <circle key={i} cx={cxOf(i)} cy={y(v)} r="8" fill={line.color || 'var(--chart-2)'} stroke="var(--surface)" strokeWidth="3">
          <title>{`${categories[i]} · ${line.name}: ${format(v)}`}</title>
        </circle>
      ))}
    </ChartShell>
  );
}

/* ---------- Sparkline ---------- */
export function Sparkline({ values, width = 240, height = 64, color = 'var(--chart-1)', title, className, style }) {
  const lo = Math.min(...values), hi = Math.max(...values);
  const x = (i) => 6 + (i / (values.length - 1)) * (width - 12);
  const y = (v) => height - 6 - ((v - lo) / (hi - lo || 1)) * (height - 12);
  const pts = values.map((v, i) => [x(i), y(v)]);
  const last = pts[pts.length - 1];
  return (
    <svg className={cx('wt-spark', className)} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} style={style}>
      {title ? <title>{title}</title> : null}
      <path d={linePath(pts)} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="6" fill={color} />
    </svg>
  );
}

export const chartUtils = { nice, SERIES, FS };
