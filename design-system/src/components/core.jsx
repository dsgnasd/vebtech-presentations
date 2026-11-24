// Атомы: логотип, иконка, типографика, бейдж, разделитель, маркер, образец цвета, аватар, номер слайда, шестиугольник.
import ICONS from '../icons.json';
import { LOGO_COLOR, LOGO_WHITE, MARK_COLOR, MARK_WHITE, HEX_PATH } from '../logo.generated.js';
import { SAMPLE_PEOPLE } from '../people.generated.js';
import { TEXTURES, TEXTURE_CREDITS } from '../textures.generated.js';

/* Фактуры для сот: дуотон в фирменной гамме (Unsplash License). Только декор на титуле, разделе, финале. */
export const textures = TEXTURES;
export const textureCredits = TEXTURE_CREDITS;
export const textureSrc = (t) => (t && TEXTURES[t]) || t;
const uid = () => 'wtx' + Math.random().toString(36).slice(2, 9);

export const cx = (...a) => a.filter(Boolean).join(' ');
/* Типографика: короткие слова (1–2 буквы) и тире не остаются в конце строки — неразрывный пробел */
export const nbsp = (c) => (typeof c === 'string' ? c.replace(/([А-Яа-яЁёA-Za-z0-9])-(?=[А-Яа-яЁёA-Za-z0-9])/g, '$1\u2011').replace(/(^|[\s«(])([А-Яа-яЁёA-Za-z]{1,2})\s+(?=\S)/g, '$1$2\u00a0').replace(/\s+—/g, '\u00a0—').replace(/(\d)–(?=\d)/g, '$1\u2060–\u2060').replace(/(\d)\s+(?=[А-Яа-яЁёA-Za-z%№])/g, '$1\u00a0').replace(/(№)\s+/g, '$1\u00a0').replace(/(млн|млрд|тыс\.?)\s+(BYN)/g, '$1\u00a0$2').replace(/\s+(\S{1,5}[.!?…»]?)$/, '\u00a0$1') : c);

/* ---------- Logo ---------- */
const LOGOS = {
  color: { vb: '0 0 487 97', html: LOGO_COLOR },
  white: { vb: '0 0 487 97', html: LOGO_WHITE },
  mark: { vb: '0 0 88 97', html: MARK_COLOR },
  'mark-white': { vb: '0 0 88 97', html: MARK_WHITE },
};
export function Logo({ variant = 'color', height = 48, title = 'ВЭБ Технологии', className, style }) {
  const l = LOGOS[variant] || LOGOS.color;
  const [, , w, h] = l.vb.split(' ').map(Number);
  return (
    <svg
      className={cx('wt-logo', className)}
      viewBox={l.vb}
      width={(height * w) / h}
      height={height}
      role="img"
      aria-label={title}
      style={style}
      dangerouslySetInnerHTML={{ __html: `<title>${title}</title>` + l.html }}
    />
  );
}

/* ---------- Icon (Lucide) ---------- */
export const iconNames = Object.keys(ICONS);
export function Icon({ name, size = 48, strokeWidth = 2, color = 'currentColor', title, className, style }) {
  const node = ICONS[name];
  if (!node) return null;
  return (
    <svg
      className={cx('wt-icon', className)}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={style}
    >
      {node.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

/* ---------- Typography ---------- */
export function Heading({ level = 'h1', as, tone = 'ink', children, className, style }) {
  const Tag = as || { display: 'h1', h1: 'h1', h2: 'h2', h3: 'h3' }[level] || 'h2';
  return <Tag className={cx('wt-heading', 'wt-t-' + level, 'wt-tone-' + tone, className)} style={style}>{nbsp(children)}</Tag>;
}

export function Text({ variant = 'body', tone, as = 'p', children, className, style }) {
  const Tag = as;
  const t = tone || (variant === 'caption' ? 'muted' : variant === 'lead' ? 'secondary' : 'ink');
  return <Tag className={cx('wt-text', 'wt-t-' + variant, 'wt-tone-' + t, className)} style={style}>{nbsp(children)}</Tag>;
}

export function Overline({ children, tone = 'brand', className, style }) {
  return <div className={cx('wt-t-overline', 'wt-tone-' + tone, className)} style={style}>{children}</div>;
}

/* ---------- Badge ---------- */
const BADGE_ICON = { success: 'circle-check', warning: 'triangle-alert', danger: 'circle-x', info: 'info' };
export function Badge({ tone = 'brand', icon, solid = false, children, className, style }) {
  const ic = icon === false ? null : icon || BADGE_ICON[tone];
  return (
    <span className={cx('wt-badge', 'wt-badge-' + tone, solid && 'wt-badge-solid', className)} style={style}>
      {ic ? <Icon name={ic} size={24} strokeWidth={2.25} /> : null}
      <span>{children}</span>
    </span>
  );
}

/* ---------- Divider ---------- */
export function Divider({ vertical = false, strong = false, accent = false, className, style }) {
  return <div role="separator" className={cx('wt-divider', vertical && 'wt-divider-v', strong && 'wt-divider-strong', accent && 'wt-divider-accent', className)} style={style} />;
}

/* ---------- Hexagon (фирменный мотив из знака) ---------- */
export function Hexagon({ size = 96, tone = 'brand', texture, children, className, style, title }) {
  const w = size * (87.4686 / 96.8298);
  const id = React.useMemo(uid, []);
  const src = textureSrc(texture);
  return (
    <span className={cx('wt-hex', 'wt-hex-' + (src ? 'photo' : tone), className)} style={{ width: w, height: size, ...style }}>
      <svg viewBox="0 0 87.4686 96.8298" width={w} height={size} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} aria-label={title}>
        {src ? (
          <>
            <clipPath id={id}><path d={HEX_PATH} /></clipPath>
            <image href={src} width="87.4686" height="96.8298" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} />
          </>
        ) : <path d={HEX_PATH} />}
      </svg>
      {children != null ? <span className="wt-hex-content">{children}</span> : null}
    </span>
  );
}

/* ---------- Bullet ---------- */
export function Bullet({ variant = 'hex', index, tone = 'brand', className }) {
  if (variant === 'number')
    return <span className={cx('wt-bullet', 'wt-bullet-number', 'wt-bullet-' + tone, className)}>{index}</span>;
  if (variant === 'check') return <span className={cx('wt-bullet', 'wt-bullet-icon', 'wt-bullet-success', className)}><Icon name="check" size={28} strokeWidth={2.5} /></span>;
  if (variant === 'cross') return <span className={cx('wt-bullet', 'wt-bullet-icon', 'wt-bullet-danger', className)}><Icon name="x" size={28} strokeWidth={2.5} /></span>;
  if (variant === 'dot') return <span className={cx('wt-bullet', 'wt-bullet-dot', className)} />;
  return <span className={cx('wt-bullet', 'wt-bullet-hexmark', className)}><Hexagon size={20} tone={tone === 'brand' ? 'brand' : 'tint'} /></span>;
}

/* ---------- LegendSwatch ---------- */
export function LegendSwatch({ color = 'var(--chart-1)', shape = 'square', label, className }) {
  return (
    <span className={cx('wt-swatch', className)}>
      <span className={cx('wt-swatch-mark', 'wt-swatch-' + shape)} style={{ background: shape === 'line' ? 'transparent' : color, borderColor: color }} />
      {label ? <span className="wt-swatch-label">{label}</span> : null}
    </span>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ name = '', src, size = 160, className, style }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  return (
    <span className={cx('wt-avatar', className)} style={{ width: size, height: size, fontSize: Math.round(size * 0.34), ...style }}>
      {src ? <img src={src} alt={name} /> : <span aria-label={name} role="img">{initials}</span>}
    </span>
  );
}

/* ---------- Фото-примеры для шаблонов ---------- */
// Только для образцов и черновиков: в реальной презентации — фото настоящих сотрудников.
export const samplePeople = SAMPLE_PEOPLE.map(({ name, role, photo }) => ({ name, role, photo }));
export const samplePhoto = (name) => (SAMPLE_PEOPLE.find((p) => p.name === name) || {}).photo;

/* ---------- PageNumber ---------- */
export function PageNumber({ page, total, className }) {
  return (
    <span className={cx('wt-pagenum', className)}>
      <b>{String(page).padStart(2, '0')}</b>
      {total ? <span> / {String(total).padStart(2, '0')}</span> : null}
    </span>
  );
}

/* ---------- Число по-русски ---------- */
export function fmt(v, opts = {}) {
  if (typeof v !== 'number') return v;
  return v.toLocaleString('ru-BY', { maximumFractionDigits: opts.digits ?? 1, minimumFractionDigits: opts.minDigits ?? 0 });
}
