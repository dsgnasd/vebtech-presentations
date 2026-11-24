// Организмы: списки, статусы, таймлайны, диаграммы и таблицы.
import { cx, nbsp, Icon, Hexagon, Bullet, Avatar, fmt } from './core.jsx';

/* =================== СПИСКИ =================== */

/* Checklist: пункты со статусом выполнения */
export function Checklist({ items = [], className, style }) {
  const IC = { done: 'circle-check', progress: 'hourglass', todo: 'clock', blocked: 'circle-x' };
  return (
    <ul className={cx('wt-checklist', className)} style={style}>
      {items.map((it, i) => {
        const st = it.status || (it.done ? 'done' : 'todo');
        return (
          <li key={i} className={'wt-check-' + st}>
            <span className="wt-check-icon"><Icon name={IC[st] || 'circle-check'} size={36} strokeWidth={2.25} /></span>
            <div className="wt-check-body">
              <div className="wt-check-text">{it.text}</div>
              {it.note ? <div className="wt-check-note">{it.note}</div> : null}
            </div>
            {it.meta ? <div className="wt-check-meta">{it.meta}</div> : null}
          </li>
        );
      })}
    </ul>
  );
}

/* NestedList: двухуровневый список (тезис → подпункты) */
export function NestedList({ items = [], numbered = false, className, style }) {
  return (
    <ol className={cx('wt-nested', className)} style={style}>
      {items.map((it, i) => (
        <li key={i}>
          <Bullet variant={numbered ? 'number' : 'hex'} index={i + 1} />
          <div>
            <div className="wt-nested-title">{it.title}</div>
            {it.items && it.items.length ? (
              <ul>
                {it.items.map((s, j) => <li key={j}>{s}</li>)}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* =================== СТАТУСЫ =================== */

const STATUS = {
  done: { tone: 'success', icon: 'circle-check', label: 'Выполнено' },
  ok: { tone: 'success', icon: 'circle-check', label: 'В норме' },
  progress: { tone: 'info', icon: 'refresh-cw', label: 'В работе' },
  risk: { tone: 'warning', icon: 'triangle-alert', label: 'Риск' },
  blocked: { tone: 'danger', icon: 'circle-x', label: 'Проблема' },
  planned: { tone: 'neutral', icon: 'clock', label: 'Запланировано' },
  paused: { tone: 'neutral', icon: 'hourglass', label: 'На паузе' },
};
export const statusKinds = Object.keys(STATUS);

/* Status: цвет + иконка + слово. Цвет никогда не работает один. */
export function Status({ status = 'ok', label, variant = 'pill', className, style }) {
  const s = STATUS[status] || STATUS.ok;
  return (
    <span className={cx('wt-status', 'wt-status-' + variant, 'wt-status-' + s.tone, className)} style={style}>
      <Icon name={s.icon} size={variant === 'large' ? 40 : 28} strokeWidth={2.25} />
      <span>{label || s.label}</span>
    </span>
  );
}

/* ProgressBar: прогресс с процентом и подписью */
export function ProgressBar({ value = 0, max = 100, label, status, showValue = true, width, className, style }) {
  const p = Math.max(0, Math.min(100, (value / max) * 100));
  const s = status ? STATUS[status] : null;
  return (
    <div className={cx('wt-progress', s && 'wt-progress-' + s.tone, className)} style={{ width, ...style }}>
      {label || showValue ? (
        <div className="wt-progress-head">
          <span className="wt-progress-label">{label}</span>
          {showValue ? <b>{fmt(p, { digits: 0 })}%</b> : null}
        </div>
      ) : null}
      <div className="wt-progress-track" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="wt-progress-fill" style={{ width: p + '%' }} />
      </div>
    </div>
  );
}

/* StatusTable: «светофор» по направлениям проекта */
export function StatusTable({ rows = [], columns = ['Направление', 'Статус', 'Прогресс', 'Комментарий'], className, style }) {
  return (
    <table className={cx('wt-table', 'wt-status-table', className)} style={style}>
      <thead><tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="wt-td-strong">{r.name}</td>
            <td><Status status={r.status} label={r.statusLabel} /></td>
            <td style={{ width: 280 }}>{r.progress != null ? <ProgressBar value={r.progress} status={r.status} /> : '—'}</td>
            <td className="wt-td-muted">{r.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* =================== ТАЙМЛАЙНЫ =================== */

/* Timeline: горизонтальный, вехи со статусом done | current | planned */
export function Timeline({ items = [], className, style }) {
  const cur = items.findIndex((i) => i.status === 'current');
  const doneUpTo = cur >= 0 ? cur : items.filter((i) => i.status === 'done').length - 1;
  const pct = items.length > 1 ? (Math.max(0, doneUpTo) / (items.length - 1)) * 100 : 0;
  return (
    <div className={cx('wt-timeline', className)} style={{ '--wt-cols': items.length, ...style }}>
      <div className="wt-timeline-track">
        <div className="wt-timeline-line" />
        <div className="wt-timeline-line-done" style={{ width: `${pct}%` }} />
      </div>
      {items.map((it, i) => (
        <div key={i} className={cx('wt-tl-item', 'wt-tl-' + (it.status || 'planned'))}>
          <div className="wt-tl-date">{it.date}</div>
          <div className="wt-tl-node">
            <Hexagon size={44} tone={it.status === 'done' ? 'brand' : it.status === 'current' ? 'accent' : 'outline'}>
              {it.status === 'done' ? <Icon name="check" size={24} strokeWidth={3} color="var(--on-brand)" /> : null}
            </Hexagon>
          </div>
          <div className="wt-tl-title">{nbsp(it.title)}</div>
          {it.text ? <div className="wt-tl-text">{nbsp(it.text)}</div> : null}
          {it.status === 'current' ? <span className="wt-tl-now">Сейчас</span> : null}
        </div>
      ))}
    </div>
  );
}

/* VerticalTimeline: история, хронология событий */
export function VerticalTimeline({ items = [], className, style }) {
  return (
    <ol className={cx('wt-vtimeline', className)} style={style}>
      {items.map((it, i) => (
        <li key={i} className={'wt-vt-' + (it.status || 'done')}>
          <div className="wt-vt-date">{it.date}</div>
          <div className="wt-vt-node"><Hexagon size={36} tone={it.status === 'planned' ? 'outline' : it.status === 'current' ? 'accent' : 'brand'} /></div>
          <div className="wt-vt-body">
            <div className="wt-vt-title">{nbsp(it.title)}</div>
            {it.text ? <div className="wt-vt-text">{nbsp(it.text)}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* Roadmap / Gantt: дорожки × периоды */
export function Roadmap({ periods = [], lanes = [], today, className, style }) {
  const n = periods.length;
  return (
    <div className={cx('wt-roadmap', className)} style={{ '--wt-periods': n, ...style }}>
      <div className="wt-rm-head">
        <div />
        {periods.map((p, i) => <div key={i} className="wt-rm-period">{p}</div>)}
      </div>
      <div className="wt-rm-body">
        {today != null ? <div className="wt-rm-today" style={{ left: `calc(var(--wt-rm-label) + (100% - var(--wt-rm-label)) * ${today / n})` }}><span>Сегодня</span></div> : null}
        {lanes.map((l, li) => (
          <div key={li} className="wt-rm-lane">
            <div className="wt-rm-lane-name">{l.name}</div>
            <div className="wt-rm-lane-track">
              {periods.map((_, i) => <div key={i} className="wt-rm-cell" />)}
              {l.items.map((it, ii) => (
                <div
                  key={ii}
                  className={cx('wt-rm-bar', 'wt-rm-' + (it.status || 'planned'))}
                  style={{ left: `${(it.start / n) * 100}%`, width: `calc(${((it.end - it.start) / n) * 100}% - 8px)` }}
                  title={it.label}
                >
                  {it.status === 'done' ? <Icon name="check" size={24} strokeWidth={3} /> : it.status === 'risk' ? <Icon name="triangle-alert" size={24} strokeWidth={2.25} /> : null}
                  <span>{it.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* PhaseTimeline: помесячная шкала — события сверху, этапы снизу, месяцы окрашены по состоянию */
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const ymd = (s) => { const [y, m, d] = String(s).split('-').map(Number); return { y, m, d: d || 1 }; };
const ddmm = (s) => { const p = ymd(s); return String(p.d).padStart(2, '0') + '.' + String(p.m).padStart(2, '0'); };
const estW = (text, px = 13.5) => String(text || '').length * px;

export function PhaseTimeline({ start, end, width = 1728, spans = [], milestones = [], phases = [], legend, labelWidth = 260, title, className, style }) {
  const s = ymd(start), e = ymd(end);
  const n = (e.y - s.y) * 12 + (e.m - s.m) + 1;
  const cw = width / n;
  const idx = (p) => (p.y - s.y) * 12 + (p.m - s.m);
  const x = (date) => { const p = ymd(date); const dim = new Date(p.y, p.m, 0).getDate(); return Math.max(0, Math.min(width, (idx(p) + (p.d - 1) / dim) * cw)); };
  const months = Array.from({ length: n }, (_, i) => { const m = ((s.m - 1 + i) % 12) + 1; const y = s.y + Math.floor((s.m - 1 + i) / 12); return { y, m, i }; });
  const toneOf = (mo) => { let t = 'work'; for (const sp of spans) { const a = idx(ymd(sp.from)), b = idx(ymd(sp.to || sp.from)); if (mo.i >= a && mo.i <= b) t = sp.tone || 'waiting'; } return t; };

  // События: справа налево; ряд выбирается так, чтобы подпись не перекрывала чужие выноски, а выноска — чужие подписи
  const ROW_M = 92, ms = milestones.map((m, i) => ({ ...m, i, px: x(m.date) })).sort((a, b) => b.px - a.px);
  const placed = [];
  let mRowsN = 0;
  for (const m of ms) {
    const w = Math.min(labelWidth, Math.max(estW(m.label), estW(m.dateLabel || '00.00'), 96) + 16);
    m.w = w; m.left = Math.max(0, Math.min(m.px - 12, width - w));
    const ok = (r) => placed.every((o) => {
      if (o.row === r) return m.left + w + 20 <= o.left || o.left + o.w + 20 <= m.left;
      if (o.row < r) return m.px < o.left - 8 || m.px > o.left + o.w + 8;
      return o.px < m.left - 8 || o.px > m.left + w + 8;
    });
    let r = 0; while (!ok(r)) r++;
    m.row = r; placed.push(m); mRowsN = Math.max(mRowsN, r + 1);
  }
  // Этапы: слева направо
  const ROW_P = 56, ps = phases.map((p) => ({ ...p, x0: x(p.start), x1: x(p.end) })).sort((a, b) => a.x0 - b.x0);
  const pRows = [];
  for (const p of ps) {
    const text = `${p.label} · ${ddmm(p.start)}–${ddmm(p.end)}`;
    const w = estW(text, 13) + 8;
    p.text = text; p.right = p.x0 + w > width; p.left = p.right ? Math.max(0, p.x1 - w) : p.x0; p.w = w;
    let r = pRows.findIndex((maxRight) => p.left >= maxRight + 32);
    if (r < 0) { r = pRows.length; pRows.push(-Infinity); }
    pRows[r] = Math.max(pRows[r], p.left + w);
    p.row = r;
  }
  const topH = mRowsN * ROW_M, yearsH = 32, axisH = 48, axisY = topH;
  const phaseY = axisY + axisH + yearsH + 8;
  const height = phaseY + pRows.length * ROW_P;
  const lg = legend === false ? null : legend || [{ tone: 'work', label: 'Работа по проекту' }, { tone: 'waiting', label: 'Ожидание решения' }];

  return (
    <figure className={cx('wt-ptl', className)} style={{ width, ...style }} aria-label={title}>
      <div className="wt-ptl-canvas" style={{ height }}>
        {ms.map((m) => {
          const top = topH - (m.row + 1) * ROW_M;
          return (
            <React.Fragment key={'m' + m.i}>
              <div className={cx('wt-ptl-ms', m.tone && 'wt-ptl-ms-' + m.tone)} style={{ left: m.left, width: m.w, top }}>
                <div className="wt-ptl-ms-date">{m.dateLabel || ddmm(m.date)}</div>
                <div className="wt-ptl-ms-label">{m.label}</div>
              </div>
              <span className="wt-ptl-leader" style={{ left: m.px, top: top + 90, height: axisY - (top + 90) }} />
            </React.Fragment>
          );
        })}
        {months.map((mo) => (mo.m === 1 || mo.i === 0 ? <div key={'y' + mo.i} className="wt-ptl-year" style={{ left: mo.i * cw, top: axisY + axisH + 4 }}>{mo.y}</div> : null))}
        <div className="wt-ptl-axis" style={{ top: axisY, height: axisH }}>
          {months.map((mo) => (
            <div key={mo.i} className={cx('wt-ptl-month', 'wt-ptl-' + toneOf(mo), mo.m === 1 && mo.i > 0 && 'wt-ptl-newyear')} style={{ width: cw }}>{MONTHS_SHORT[mo.m - 1]}</div>
          ))}
        </div>
        {ms.map((m) => <span key={'d' + m.i} className={cx('wt-ptl-dot', m.tone && 'wt-ptl-dot-' + m.tone)} style={{ left: m.px, top: axisY }} />)}
        {ps.map((p, i) => (
          <div key={'p' + i} className="wt-ptl-phase" style={{ top: phaseY + p.row * ROW_P }}>
            <span className="wt-ptl-phase-bar" style={{ left: p.x0, width: Math.max(8, p.x1 - p.x0) }} />
            <span className={cx('wt-ptl-phase-label', p.right && 'wt-ptl-phase-right')} style={p.right ? { left: p.left, width: p.w } : { left: p.left }}>{p.text}</span>
          </div>
        ))}
      </div>
      {lg ? (
        <figcaption className="wt-ptl-legend">
          {lg.map((l, i) => <span key={i}><i className={'wt-ptl-key wt-ptl-' + l.tone} />{l.label}</span>)}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* =================== ДИАГРАММЫ =================== */

export function ProcessFlow({ steps = [], numbered = true, className, style }) {
  return (
    <div className={cx('wt-process', className)} style={style}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="wt-process-step">
            <div className="wt-process-head">
              {s.icon ? <span className="wt-process-icon"><Icon name={s.icon} size={40} /></span> : null}
              {numbered ? <span className="wt-process-num">{String(i + 1).padStart(2, '0')}</span> : null}
            </div>
            <div className="wt-process-title">{nbsp(s.title)}</div>
            {s.text ? <div className="wt-process-text">{nbsp(s.text)}</div> : null}
          </div>
          {i < steps.length - 1 ? <div className="wt-process-arrow"><Icon name="chevron-right" size={40} strokeWidth={2.5} /></div> : null}
        </React.Fragment>
      ))}
    </div>
  );
}

/* Funnel: ордерная шкала — одна гамма от светлого к темному */
const FUNNEL = ['var(--brand-400)', 'var(--brand)', 'var(--brand-strong)', 'var(--brand-deep)', 'var(--brand-800)', 'var(--brand-900)'];
export function Funnel({ stages = [], width = 1100, format = (v) => fmt(v), showConversion = true, className, style }) {
  const max = Math.max(...stages.map((s) => s.value));
  const colors = FUNNEL;
  return (
    <div className={cx('wt-funnel', className)} style={{ width, ...style }}>
      {stages.map((s, i) => {
        const w = 30 + 70 * (s.value / max);
        const conv = i > 0 ? (s.value / stages[i - 1].value) * 100 : null;
        return (
          <div key={i} className="wt-funnel-row">
            <div className="wt-funnel-label">{s.label}</div>
            <div className="wt-funnel-barwrap">
              <div className={cx('wt-funnel-bar', i === 0 && 'wt-funnel-bar-light')} style={{ width: w + '%', background: colors[i] || FUNNEL[FUNNEL.length - 1] }} title={`${s.label}: ${format(s.value)}`}>
                <span>{format(s.value)}</span>
              </div>
            </div>
            <div className="wt-funnel-conv">{showConversion && conv != null ? `${fmt(conv, { digits: 0 })}%` : ''}</div>
          </div>
        );
      })}
    </div>
  );
}

/* Matrix2x2: две оси, четыре квадранта, элементы-точки */
export function Matrix2x2({ xLabel, yLabel, quadrants = [], items = [], size = 720, className, style }) {
  return (
    <div className={cx('wt-matrix', className)} style={style}>
      <div className="wt-matrix-y">{yLabel} <Icon name="arrow-right" size={24} /></div>
      <div>
        <div className="wt-matrix-grid" style={{ width: size * 1.4, height: size }}>
          {[0, 1, 2, 3].map((q) => (
            <div key={q} className={cx('wt-matrix-q', q === 1 && 'wt-matrix-q-accent')}>
              <span>{quadrants[q]}</span>
            </div>
          ))}
          {items.map((it, i) => (
            <div key={i} className={cx('wt-matrix-item', it.accent && 'wt-matrix-item-accent', it.x > 0.6 && 'wt-matrix-item-left')} style={{ left: `${it.x * 100}%`, bottom: `${it.y * 100}%` }}>
              <Hexagon size={32} tone={it.accent ? 'accent' : 'brand'} />
              <span>{it.label}</span>
            </div>
          ))}
        </div>
        <div className="wt-matrix-x">{xLabel} <Icon name="arrow-right" size={24} /></div>
      </div>
    </div>
  );
}

/* OrgChart: два уровня под руководителем */
export function OrgChart({ root, children = [], className, style }) {
  const Node = ({ n, lead }) => (
    <div className={cx('wt-org-node', lead && 'wt-org-lead')}>
      <Avatar name={n.name} src={n.photo} size={lead ? 96 : 72} />
      <div>
        <div className="wt-org-name">{n.name}</div>
        <div className="wt-org-role">{n.role}</div>
      </div>
    </div>
  );
  return (
    <div className={cx('wt-org', className)} style={style}>
      <Node n={root} lead />
      <div className="wt-org-links" style={{ '--wt-org-n': children.length }} />
      <div className="wt-org-row">
        {children.map((c, i) => (
          <div key={i} className="wt-org-col">
            <Node n={c} />
            {c.team ? <ul className="wt-org-team">{c.team.map((t, j) => <li key={j}>{t}</li>)}</ul> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Cycle: замкнутый цикл из 3–6 шагов */
export function Cycle({ steps = [], size = 760, center, className, style }) {
  const n = steps.length, R = size / 2 - 110, c = size / 2;
  return (
    <div className={cx('wt-cycle', className)} style={{ width: size + 360, height: size, ...style }}>
      <svg width={size + 360} height={size} aria-hidden="true">
        <circle cx={c + 180} cy={c} r={R} className="wt-cycle-ring" />
        {steps.map((_, i) => {
          const a = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
          const x = c + 180 + R * Math.cos(a), y = c + R * Math.sin(a);
          const rot = (a * 180) / Math.PI + 90;
          return <path key={i} d="M-10,-12 L6,0 L-10,12" transform={`translate(${x},${y}) rotate(${rot})`} className="wt-cycle-arrow" />;
        })}
      </svg>
      {center ? <div className="wt-cycle-center" style={{ left: c + 180, top: c }}>{center}</div> : null}
      {steps.map((s, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = c + 180 + R * Math.cos(a), y = c + R * Math.sin(a);
        return (
          <div key={i} className="wt-cycle-step" style={{ left: x, top: y }}>
            <Hexagon size={104} tone="brand"><Icon name={s.icon || 'refresh-cw'} size={44} color="var(--on-brand)" /></Hexagon>
            <div className="wt-cycle-label">{s.title}</div>
          </div>
        );
      })}
    </div>
  );
}

/* Pyramid / Layers: уровни от основания к вершине */
const LAYER = ['var(--brand-50)', 'var(--brand-100)', 'var(--brand-200)', 'var(--brand)', 'var(--brand-strong)', 'var(--brand-deep)'];
export function Pyramid({ levels = [], width = 1000, variant = 'pyramid', className, style }) {
  const n = levels.length;
  return (
    <div className={cx('wt-pyramid', 'wt-pyramid-' + variant, className)} style={{ width, ...style }}>
      {levels.map((l, i) => {
        const w = variant === 'pyramid' ? 40 + (60 * (i + 1)) / n : 100;
        const bg = LAYER[Math.min(LAYER.length - 1, n - 1 - i + (n < 4 ? 1 : 0))];
        const dark = n - 1 - i + (n < 4 ? 1 : 0) >= 3;
        return (
          <div key={i} className="wt-pyr-row">
            <div className={cx('wt-pyr-bar', dark && 'wt-pyr-dark')} style={{ width: w + '%', background: bg }}>
              <b>{l.title}</b>
            </div>
            {l.text ? <div className="wt-pyr-text">{l.text}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

/* =================== ТАБЛИЦЫ =================== */

export function DataTable({ columns = [], rows = [], highlightRow, zebra = false, className, style }) {
  return (
    <table className={cx('wt-table', zebra && 'wt-table-zebra', className)} style={style}>
      <thead>
        <tr>{columns.map((c, i) => <th key={i} className={c.align === 'right' ? 'wt-num' : ''} style={{ width: c.width }}>{c.title}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri} className={ri === highlightRow || r.highlight ? 'wt-tr-hl' : ''}>
            {columns.map((c, ci) => {
              const v = Array.isArray(r) ? r[ci] : r[c.key];
              return <td key={ci} className={cx(c.align === 'right' && 'wt-num', ci === 0 && 'wt-td-strong')}>{typeof v === 'number' ? fmt(v) : v}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ComparisonTable: функции × варианты; true/false → галочка/крестик со словом для скринридера */
export function ComparisonTable({ options = [], features = [], highlight = 0, className, style }) {
  const cell = (v) =>
    v === true ? <span className="wt-cmp-yes"><Icon name="circle-check" size={36} strokeWidth={2.25} title="Есть" /></span>
    : v === false ? <span className="wt-cmp-no"><Icon name="minus" size={36} strokeWidth={2.25} title="Нет" /></span>
    : v;
  return (
    <table className={cx('wt-table', 'wt-cmp', className)} style={style}>
      <thead>
        <tr>
          <th />
          {options.map((o, i) => <th key={i} className={cx('wt-cmp-opt', i === highlight && 'wt-cmp-hl')}>{o}</th>)}
        </tr>
      </thead>
      <tbody>
        {features.map((f, fi) => (
          <tr key={fi}>
            <td className="wt-td-strong">{f.name}</td>
            {f.values.map((v, vi) => <td key={vi} className={cx('wt-cmp-cell', vi === highlight && 'wt-cmp-hl')}>{cell(v)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
