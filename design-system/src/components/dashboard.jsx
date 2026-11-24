// Дашборд: карточка, список полос на общей шкале, план/факт, структура суммы.
import { cx, nbsp, Icon, LegendSwatch, fmt } from './core.jsx';
import { Status } from './diagrams.jsx';

const SERIES = (i) => `var(--chart-${(i % 6) + 1})`;
const num = (v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '').replace(',', '.')) || 0);

/* ---------- Card: карточка с шапкой ---------- */
// tone: outline (белая с рамкой line, по умолчанию) · tint · info · warning · danger · success
export function Card({ tone = 'outline', icon, overline, title, meta, children, className, style }) {
  return (
    <section className={cx('wt-card', 'wt-card-' + tone, className)} style={style}>
      {title || meta || icon || overline ? (
        <header className="wt-card-head">
          {icon ? <span className="wt-card-icon"><Icon name={icon} size={36} /></span> : null}
          {overline ? (
            <div className="wt-card-titles"><span className="wt-card-overline">{overline}</span>{title ? <h3 className="wt-card-title">{nbsp(title)}</h3> : null}</div>
          ) : title ? <h3 className="wt-card-title">{nbsp(title)}</h3> : null}
          {meta ? <span className="wt-card-meta">{meta}</span> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/* ---------- MeterList: строки «подпись — полоса — значение» на общей шкале ---------- */
// По умолчанию первая строка — база (chart-other), дальше серии chart-1…; своё — через color.
export function MeterList({ items = [], max, layout = 'split', valueHeader, base = true, format = (v) => fmt(v), className, style }) {
  const m = max || Math.max(...items.map((it) => num(it.value)), 1);
  const colorOf = (it, i) => it.color || (base ? (i === 0 ? 'var(--chart-other)' : SERIES(i - 1)) : SERIES(i));
  return (
    <div className={cx('wt-meter', 'wt-meter-' + layout, className)} style={style}>
      {valueHeader ? <div className="wt-meter-header">{valueHeader}</div> : null}
      {items.map((it, i) => {
        const v = num(it.value);
        const p = Math.max(0, Math.min(100, (v / m) * 100));
        const shown = it.display ?? format(it.value);
        return (
          <div className="wt-meter-row" key={i}>
            <div className="wt-meter-label">{it.label}</div>
            <div className="wt-meter-track" role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={m} aria-label={`${it.label}: ${shown}`}>
              <div className="wt-meter-fill" style={{ width: p + '%', background: colorOf(it, i) }} />
            </div>
            <div className="wt-meter-value">{shown}</div>
            {it.caption ? <div className="wt-meter-caption">{it.caption}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- PlanFactCard: выполнение плана ---------- */
// Процент всегда факт/план. better: 'higher' (выручка, прибыль) или 'lower' (затраты) — определяет статус.
export function planFactStatus(pct, better = 'higher') {
  if (better === 'lower') return pct <= 100 ? { status: 'ok', label: 'В бюджете' } : { status: 'blocked', label: 'Перерасход' };
  if (pct >= 100) return { status: 'ok', label: 'План выполнен' };
  if (pct >= 95) return { status: 'risk', label: 'Близко к плану' };
  return { status: 'blocked', label: 'Ниже плана' };
}

export function PlanFactCard({ title, unit, plan, fact, rows = [], better = 'higher', status, statusLabel, percent, labels = { plan: 'План', fact: 'Факт' }, format = (v) => fmt(v, { digits: 1, minDigits: 1 }), tone = 'outline', icon, className, style }) {
  const pct = percent ?? (num(fact) / num(plan)) * 100;
  const auto = planFactStatus(pct, better);
  const items = [
    { label: labels.plan, value: plan },
    { label: labels.fact, value: fact },
    ...rows,
  ];
  return (
    <Card tone={tone} className={cx('wt-pf', className)} style={style}>
      <div className="wt-pf-result">
        {icon ? <span className="wt-pf-icon"><Icon name={icon} size={36} /></span> : null}
        <span className="wt-pf-pct">{fmt(pct, { digits: 0 })}<span className="wt-pf-pct-unit">%</span></span>
        <Status status={status || auto.status} label={statusLabel || (status ? undefined : auto.label)} variant="text" />
      </div>
      <div className="wt-pf-label">
        <h3 className="wt-pf-title">{title}</h3>
        {unit ? <span className="wt-pf-unit">{unit}</span> : null}
      </div>
      <MeterList items={items} format={format} />
    </Card>
  );
}

/* ---------- BreakdownBar: из чего складывается одна сумма ---------- */
export function BreakdownBar({ items = [], total, totalLabel = 'Итого', format = (v) => fmt(v, { digits: 1, minDigits: 1 }), showShare = true, height = 40, title, className, style }) {
  const sum = items.reduce((a, it) => a + num(it.value), 0) || 1;
  const t = total ?? sum;
  return (
    <figure className={cx('wt-breakdown', className)} style={style} aria-label={title}>
      <div className="wt-breakdown-bar" style={{ height }} role="img" aria-label={items.map((it) => `${it.label}: ${format(it.value)}`).join('; ')}>
        {items.map((it, i) => (
          <span key={i} style={{ flexGrow: num(it.value), background: it.color || SERIES(i) }} title={`${it.label}: ${format(it.value)}`} />
        ))}
      </div>
      <div className={cx('wt-breakdown-legend', !showShare && 'wt-breakdown-noshare')}>
        {items.map((it, i) => (
          <div className="wt-breakdown-row" key={i}>
            <LegendSwatch color={it.color || SERIES(i)} label={it.label} />
            {showShare ? <span className="wt-breakdown-share">{fmt((num(it.value) / sum) * 100, { digits: 0 })}%</span> : null}
            <span className="wt-breakdown-value">{format(it.value)}</span>
          </div>
        ))}
        {totalLabel ? (
          <div className="wt-breakdown-row wt-breakdown-total">
            <span className="wt-breakdown-label">{totalLabel}</span>
            <span className="wt-breakdown-value">{format(t)}</span>
          </div>
        ) : null}
      </div>
    </figure>
  );
}

/* ---------- FactList: паспорт — иконка, подпись, значение ---------- */
export function FactList({ items = [], layout = 'row', className, style }) {
  return (
    <div className={cx('wt-facts', 'wt-facts-' + layout, className)} style={style}>
      {items.map((it, i) => (
        <div className="wt-fact" key={i}>
          {it.icon ? <span className="wt-fact-icon"><Icon name={it.icon} size={32} /></span> : null}
          <div>
            <div className="wt-fact-label">{it.label}</div>
            <div className="wt-fact-value">{it.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
