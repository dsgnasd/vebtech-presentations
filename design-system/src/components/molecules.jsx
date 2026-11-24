// Молекулы: собираются из атомов.
import { cx, nbsp, Icon, Heading, Text, Overline, Badge, Bullet, LegendSwatch, Logo, PageNumber, Hexagon } from './core.jsx';

/* ---------- KpiCard ---------- */
/* Дельта: стрелка показывает направление (trend), цвет — оценку (sentiment: good | bad | neutral).
   Без явных значений направление берётся из знака: «+» — вверх, «−» — вниз; текст без знака — без стрелки, нейтральный цвет. */
const deltaTrend = (d) => { const t = typeof d === 'string' ? d.trim() : ''; return t.startsWith('+') ? 'up' : /^[−-]/.test(t) ? 'down' : 'none'; };
export function KpiCard({ value, unit, label, delta, trend, sentiment, icon, note, variant = 'tint', size = 'md', className, style }) {
  const t = trend || deltaTrend(delta);
  const sn = sentiment || (t === 'up' ? 'good' : t === 'down' ? 'bad' : 'neutral');
  const ic = { up: 'trending-up', down: 'trending-down', flat: 'minus' }[t];
  return (
    <div className={cx('wt-kpi', 'wt-kpi-' + variant, 'wt-kpi-' + size, className)} style={style}>
      {icon ? <span className="wt-kpi-icon"><Icon name={icon} size={40} /></span> : null}
      <div className="wt-kpi-value">
        <span>{value}</span>
        {unit ? <span className="wt-kpi-unit">{unit}</span> : null}
      </div>
      <div className="wt-kpi-label">{nbsp(label)}</div>
      {delta ? (
        <div className={cx('wt-kpi-delta', sn === 'good' ? 'wt-kpi-delta-up' : sn === 'bad' ? 'wt-kpi-delta-down' : 'wt-kpi-delta-flat')}>
          {ic ? <Icon name={ic} size={28} strokeWidth={2.25} /> : null}
          <span>{delta}</span>
        </div>
      ) : null}
      {note ? <div className="wt-kpi-note">{nbsp(note)}</div> : null}
    </div>
  );
}

/* ---------- IconFeature ---------- */
export function IconFeature({ icon = 'target', title, children, layout = 'vertical', className, style }) {
  return (
    <div className={cx('wt-feature', 'wt-feature-' + layout, className)} style={style}>
      <span className="wt-feature-icon"><Icon name={icon} size={48} /></span>
      <div className="wt-feature-body">
        {title ? <Heading level="h3" as="h3">{title}</Heading> : null}
        {children ? <Text variant="body" tone="secondary">{children}</Text> : null}
      </div>
    </div>
  );
}

/* ---------- BulletList ---------- */
export function BulletList({ items = [], marker = 'hex', size = 'body', columns = 1, className, style }) {
  return (
    <ul className={cx('wt-list', 'wt-list-' + size, columns > 1 && 'wt-list-cols', className)} style={columns > 1 ? { '--wt-list-cols': columns, ...style } : style}>
      {items.map((it, i) => {
        const o = typeof it === 'string' ? { text: it } : it;
        return (
          <li key={i}>
            <Bullet variant={o.marker || marker} index={i + 1} />
            <div>
              {o.title ? <div className="wt-list-title">{nbsp(o.title)}</div> : null}
              <div className="wt-list-text">{nbsp(o.text)}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Quote ---------- */
export function Quote({ children, author, role, size = 'md', className, style }) {
  return (
    <figure className={cx('wt-quote', 'wt-quote-' + size, className)} style={style}>
      <Icon name="quote" size={size === 'lg' ? 80 : 56} color="var(--brand)" className="wt-quote-mark" />
      <blockquote>{nbsp(children)}</blockquote>
      {author ? (
        <figcaption>
          <b>{author}</b>
          {role ? <span>{role}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ---------- Callout ---------- */
const CALLOUT_ICON = { accent: 'lightbulb', brand: 'lightbulb', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-x', info: 'info' };
export function Callout({ tone = 'brand', title, icon, children, className, style }) {
  return (
    <div className={cx('wt-callout', 'wt-callout-' + tone, className)} style={style}>
      <span className="wt-callout-icon"><Icon name={icon || CALLOUT_ICON[tone] || 'info'} size={40} /></span>
      <div>
        {title ? <div className="wt-callout-title">{nbsp(title)}</div> : null}
        {children ? <div className="wt-callout-text">{nbsp(children)}</div> : null}
      </div>
    </div>
  );
}

/* ---------- Legend ---------- */
export function Legend({ items = [], className, style }) {
  return (
    <div className={cx('wt-legend', className)} style={style}>
      {items.map((it, i) => (
        <LegendSwatch key={i} color={it.color || `var(--chart-${i + 1})`} shape={it.shape} label={it.label} />
      ))}
    </div>
  );
}

/* ---------- TimelineStep ---------- */
export function TimelineStep({ date, title, children, status = 'done', className, style }) {
  return (
    <div className={cx('wt-tstep', 'wt-tstep-' + status, className)} style={style}>
      <div className="wt-tstep-date">{date}</div>
      <div className="wt-tstep-node">
        <Hexagon size={40} tone={status === 'done' ? 'brand' : status === 'current' ? 'accent' : 'outline'} />
      </div>
      <div className="wt-tstep-title">{title}</div>
      {children ? <div className="wt-tstep-text">{children}</div> : null}
    </div>
  );
}

/* ---------- ChartHeader ---------- */
export function ChartHeader({ title, subtitle, unit, className, style }) {
  return (
    <div className={cx('wt-chart-header', className)} style={style}>
      <div className="wt-chart-title">{title}</div>
      {subtitle || unit ? <div className="wt-chart-sub">{[subtitle, unit].filter(Boolean).join(', ')}</div> : null}
    </div>
  );
}

export function Source({ children, className, style }) {
  return <div className={cx('wt-source', className)} style={style}>{children}</div>;
}

/* ---------- SlideFooter ---------- */
export function SlideFooter({ page, total, section, confidential, logo = true, onBrand = false, className }) {
  return (
    <footer className={cx('wt-footer', onBrand && 'wt-footer-onbrand', className)}>
      <div className="wt-footer-left">
        {logo ? <Logo variant={onBrand ? 'white' : 'color'} height={32} /> : null}
        {section ? <span className="wt-footer-section">{section}</span> : null}
      </div>
      <div className="wt-footer-right">
        {confidential ? <span className="wt-footer-conf"><Icon name="lock" size={24} />{confidential === true ? 'Конфиденциально' : confidential}</span> : null}
        {page ? <PageNumber page={page} total={total} /> : null}
      </div>
    </footer>
  );
}

/* ---------- SlideHeader ---------- */
export function SlideHeader({ overline, title, lead, aside, className, style }) {
  return (
    <header className={cx('wt-slide-header', className)} style={style}>
      <div className="wt-slide-header-main">
        {overline ? <Overline>{overline}</Overline> : null}
        <Heading level="h1">{title}</Heading>
        {lead ? <Text variant="lead">{lead}</Text> : null}
      </div>
      {aside ? <div className="wt-slide-header-aside">{aside}</div> : null}
    </header>
  );
}

export { Badge };
