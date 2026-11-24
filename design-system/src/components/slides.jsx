// Шаблоны: холст слайда, колода и 17 макетов слайдов.
import { cx, Logo, Icon, Heading, Text, Overline, Hexagon, Avatar, textureSrc, textures as TEXTURE_LIB } from './core.jsx';
import { SlideFooter, SlideHeader, KpiCard, BulletList, Quote, IconFeature, Source } from './molecules.jsx';
import { PlanFactCard } from './dashboard.jsx';
import { HEX_PATH } from '../logo.generated.js';

/* ---------- Slide: холст 1920×1080 ---------- */
export function Slide({ children, background = 'surface', footer = true, page, total, section, confidential, className, style, bleed = false }) {
  const onBrand = background === 'brand';
  return (
    <section className={cx('wt-slide', 'wt-bg-' + background, bleed && 'wt-slide-bleed', className)} style={style}>
      <div className="wt-slide-body">{children}</div>
      {footer ? <SlideFooter page={page} total={total} section={section} confidential={confidential} onBrand={onBrand} /> : null}
    </section>
  );
}

/* ---------- Deck: колода слайдов; на экране масштабируется, при печати — слайд на страницу ---------- */
export function Deck({ children, layout = 'stack', columns = 3, gap = 32, numbered = true, total, className, style }) {
  const ref = React.useRef(null);
  const [scale, setScale] = React.useState(layout === 'native' ? 1 : 0.25);
  const slides = React.Children.toArray(children).filter(Boolean);
  React.useLayoutEffect(() => {
    if (layout === 'native' || !ref.current) return;
    const el = ref.current;
    const upd = () => {
      const w = el.clientWidth;
      const colW = layout === 'grid' ? (w - gap * (columns - 1)) / columns : w;
      setScale(colW / 1920);
    };
    upd();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(upd) : null;
    ro && ro.observe(el);
    return () => ro && ro.disconnect();
  }, [layout, columns, gap]);
  const n = total || slides.length;
  return (
    <div ref={ref} className={cx('wt-deck', 'wt-deck-' + layout, className)} style={{ gap, gridTemplateColumns: layout === 'grid' ? `repeat(${columns}, 1fr)` : undefined, ...style }}>
      {slides.map((s, i) => (
        <div key={i} className="wt-frame" style={{ width: 1920 * scale, height: 1080 * scale }}>
          <div className="wt-frame-inner" style={{ transform: `scale(${scale})` }}>
            {numbered && React.isValidElement(s) && s.props.page == null ? React.cloneElement(s, { page: i + 1, total: n }) : s}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Декоративный кластер шестиугольников (из знака) ---------- */
const HW = 87.4686, HH = 96.8298;
export function HexCluster({ cells, unit = 200, gap = 16, className, style }) {
  // cells: [{col, row, tone | texture}] — сотовая раскладка, нечётные ряды сдвинуты на полшага.
  // texture — имя фактуры (Webtech.textures) или URL: фото в маске по контуру знака.
  const id = React.useMemo(() => 'wth' + Math.random().toString(36).slice(2, 9), []);
  const px = unit, py = unit * (HH / HW) * 0.81;
  const pts = cells.map((c) => ({ ...c, x: c.col * px + (c.row % 2 ? px / 2 : 0), y: c.row * py }));
  const W = Math.max(...pts.map((p) => p.x)) + px, H = Math.max(...pts.map((p) => p.y)) + unit * (HH / HW);
  const s = (unit - gap) / HW;
  return (
    <svg className={cx('wt-hexcluster', className)} width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={style}>
      {pts.map((p, i) => {
        const tf = `translate(${p.x + gap / 2},${p.y + gap / 2}) scale(${s})`;
        const src = textureSrc(p.texture);
        if (!src) return <path key={i} d={HEX_PATH} transform={tf} className={'wt-hexc-' + (p.tone || 'tint')} />;
        return (
          <g key={i} transform={tf}>
            <clipPath id={id + i}><path d={HEX_PATH} /></clipPath>
            <image href={src} width={HW} height={HH} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id + i})`} />
          </g>
        );
      })}
    </svg>
  );
}

// Финал: 5 ячеек — 1 фактура, 1 бренд, 1 акцент
const CONTACT_CELLS = [
  { col: 1, row: 0, tone: 'tint' }, { col: 2, row: 0, tone: 'soft' },
  { col: 0, row: 1, texture: 'fiber' }, { col: 1, row: 1, tone: 'brand' },
  { col: 1, row: 2, tone: 'accent' },
];

/* ---------- HexArt: соты в координатах слайда 1920×1080 (для обложек) ---------- */
// cells: [{ x, y, w, tone | texture }] — левый верхний угол и ширина соты в px холста.
export function HexArt({ cells = [], width = 1920, height = 1080, className, style }) {
  const id = React.useMemo(() => 'wta' + Math.random().toString(36).slice(2, 9), []);
  return (
    <svg className={cx('wt-hexart', className)} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={style}>
      {cells.map((c, i) => {
        const tf = `translate(${c.x},${c.y}) scale(${c.w / HW})`;
        const src = textureSrc(c.texture);
        if (!src) return <path key={i} d={HEX_PATH} transform={tf} className={'wt-hexc-' + (c.tone || 'tint')} />;
        return (
          <g key={i} transform={tf}>
            <clipPath id={id + i}><path d={HEX_PATH} /></clipPath>
            <image href={src} width={HW} height={HH} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id + i})`} />
          </g>
        );
      })}
    </svg>
  );
}

// Сотовая сетка в координатах холста: ряды со сдвигом на полшага, зазор 16px.
const honeycomb = (unit, ox, oy, cells, gap = 16) => cells.map(([col, row, fill]) => ({
  x: ox + col * unit + (row % 2 ? unit / 2 : 0) + gap / 2,
  y: oy + row * unit * (HH / HW) * 0.81 + gap / 2,
  w: unit - gap,
  ...(fill in TEXTURE_LIB || /^photo\d$/.test(fill) ? { texture: fill } : { tone: fill }),
}));

// Композиции обложки. Во всех: одна `brand`, одна `accent`, фото — 2–4, остальное тинты; все соты одного размера на одной сетке; текст слева внизу свободен.
// photo1…photo4 — слоты фото, заполняются пропом `textures` (по умолчанию — фактуры ниже).
export const TITLE_COMPOSITIONS = {
  // Кластер: 7 сот справа сверху, 2 фото — универсальная (по умолчанию)
  cluster: { photos: ['facade', 'circuit'], cells: () => honeycomb(236, 1072, 56, [
    [1, 0, 'tint'], [2, 0, 'photo1'], [0, 1, 'soft'], [1, 1, 'photo2'], [2, 1, 'brand'], [1, 2, 'accent'], [2, 2, 'tint']]) },
  // Крупные соты: та же сетка в крупном масштабе, 2 фото — продукт, компания, продажи, кейс
  hero: { photos: ['server', 'glass'], cells: () => honeycomb(400, 1160, -60, [
    [0, 0, 'brand'], [1, 0, 'photo2'],
    [0, 1, 'photo1'], [1, 1, 'accent'],
    [1, 2, 'tint']]) },
  // Колонка: полоса сот у правого края на всю высоту — длинные названия, отчёты
  column: { photos: ['circuit', 'code'], cells: () => honeycomb(200, 1920 - 392, -72, [
    [0, 0, 'tint'], [1, 0, 'soft'], [0, 1, 'photo1'], [1, 1, 'tint'], [0, 2, 'tint'], [1, 2, 'brand'],
    [0, 3, 'accent'], [1, 3, 'tint'], [0, 4, 'photo2'], [1, 4, 'soft'], [0, 5, 'tint'], [1, 5, 'tint']]) },
  // Лента: широкая полоса сот по верху — мероприятия, воркшопы, онбординг
  band: { photos: ['facade', 'fiber', 'circuit', 'lights'], cells: () => honeycomb(184, 520, -100, [
    [3, 0, 'tint'], [4, 0, 'soft'], [5, 0, 'tint'], [6, 0, 'tint'], [7, 0, 'soft'],
    [2, 1, 'tint'], [3, 1, 'photo1'], [4, 1, 'accent'], [5, 1, 'photo2'], [6, 1, 'photo4'], [7, 1, 'soft'],
    [5, 2, 'brand'], [6, 2, 'photo3'], [7, 2, 'tint']]) },
  // Угол: «лесенка» из 11 сот в правом нижнем углу, 3 архитектурных фото — совет директоров, официальные материалы, статус
  quiet: { photos: ['ceiling', 'grid', 'glass'], cells: () => honeycomb(208, 1296, 320, [
    [1, 0, 'tint'], [2, 0, 'soft'],
    [0, 1, 'tint'], [1, 1, 'photo1'], [2, 1, 'tint'],
    [0, 2, 'soft'], [1, 2, 'brand'], [2, 2, 'photo2'],
    [0, 3, 'accent'], [1, 3, 'photo3'], [2, 3, 'tint']]) },
};

function titleCells(composition, textures) {
  const c = TITLE_COMPOSITIONS[composition] || TITLE_COMPOSITIONS.cluster;
  const photos = c.photos.map((t, i) => (textures && textures[i]) || t);
  return c.cells().map((cell) => {
    const m = /^photo(\d)$/.exec(cell.texture || cell.tone || '');
    if (!m) return cell;
    const { tone, ...rest } = cell;
    return { ...rest, texture: photos[+m[1] - 1] };
  });
}

/* 1. TitleSlide — титульный */
export function TitleSlide({ title, subtitle, overline, date, author, composition = 'cluster', textures, ...rest }) {
  return (
    <Slide footer={false} className={cx('wt-l-title', 'wt-title-' + composition)} {...rest}>
      <HexArt cells={titleCells(composition, textures)} className="wt-title-art" />
      <Logo height={64} />
      <div className="wt-title-main">
        {overline ? <Overline>{overline}</Overline> : null}
        <Heading level="display">{title}</Heading>
        {subtitle ? <Text variant="lead">{subtitle}</Text> : null}
      </div>
      <div className="wt-title-meta">
        {author ? <span>{author}</span> : null}
        {date ? <span>{date}</span> : null}
      </div>
    </Slide>
  );
}

/* 2. SectionSlide — разделитель раздела */
export function SectionSlide({ number, title, subtitle, variant = 'tint', ...rest }) {
  return (
    <Slide background={variant === 'brand' ? 'brand' : 'tint'} className="wt-l-section" {...rest}>
      <HexCluster cells={[variant === 'brand' ? { col: 0, row: 0, tone: 'onbrand' } : { col: 0, row: 0, texture: 'facade' }, { col: 1, row: 0, tone: variant === 'brand' ? 'onbrand-2' : 'brand' }, { col: 0, row: 1, tone: variant === 'brand' ? 'onbrand-2' : 'accent' }]} unit={260} className="wt-section-hex" />
      {number ? <div className="wt-section-num">{String(number).padStart(2, '0')}</div> : null}
      <Heading level="display" className="wt-section-title">{title}</Heading>
      {subtitle ? <Text variant="lead" className="wt-section-sub">{subtitle}</Text> : null}
    </Slide>
  );
}

/* 3. AgendaSlide — повестка */
export function AgendaSlide({ title = 'Повестка', overline, items = [], active, ...rest }) {
  return (
    <Slide className="wt-l-agenda" {...rest}>
      <SlideHeader overline={overline} title={title} />
      <ol className="wt-agenda" style={{ gridTemplateRows: `repeat(${Math.ceil(items.length / 2)}, auto)` }}>
        {items.map((it, i) => {
          const o = typeof it === 'string' ? { title: it } : it;
          return (
            <li key={i} className={cx(active === i && 'wt-agenda-active', active != null && i < active && 'wt-agenda-done')}>
              <span className="wt-agenda-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div className="wt-agenda-title">{o.title}</div>
                {o.text ? <div className="wt-agenda-text">{o.text}</div> : null}
              </div>
              {o.time ? <span className="wt-agenda-time">{o.time}</span> : null}
            </li>
          );
        })}
      </ol>
    </Slide>
  );
}

/* 4. ContentSlide — заголовок + текст/список */
export function ContentSlide({ overline, title, lead, bullets, marker, children, aside, ...rest }) {
  return (
    <Slide className="wt-l-content" {...rest}>
      <SlideHeader overline={overline} title={title} lead={lead} />
      <div className={cx('wt-content', aside && 'wt-content-aside')}>
        <div>{bullets ? <BulletList items={bullets} marker={marker} size={bullets.length <= 4 ? 'lead' : 'body'} /> : children}</div>
        {aside ? <aside>{aside}</aside> : null}
      </div>
    </Slide>
  );
}

/* 5. TwoColumnSlide — две колонки */
export function TwoColumnSlide({ overline, title, lead, left, right, ...rest }) {
  const Col = ({ c }) => (
    <div className={cx('wt-col', c.tint && 'wt-col-tint')}>
      {c.icon ? <span className="wt-feature-icon"><Icon name={c.icon} size={48} /></span> : null}
      {c.title ? <Heading level="h2" as="h2">{c.title}</Heading> : null}
      {c.text ? <Text>{c.text}</Text> : null}
      {c.bullets ? <BulletList items={c.bullets} marker={c.marker} /> : null}
      {c.content || null}
    </div>
  );
  return (
    <Slide className="wt-l-two" {...rest}>
      <SlideHeader overline={overline} title={title} lead={lead} />
      <div className="wt-two">
        <Col c={left} />
        <Col c={right} />
      </div>
    </Slide>
  );
}

/* 6. ImageTextSlide — текст + изображение */
export function ImageTextSlide({ overline, title, text, bullets, image, imageAlt = '', imageSide = 'right', caption, ...rest }) {
  return (
    <Slide className={cx('wt-l-image', 'wt-image-' + imageSide)} {...rest}>
      <div className="wt-image-text">
        <SlideHeader overline={overline} title={title} />
        {text ? <Text variant="lead">{text}</Text> : null}
        {bullets ? <BulletList items={bullets} /> : null}
      </div>
      <figure className="wt-image-frame">
        {image ? <img src={image} alt={imageAlt} /> : (
          <div className="wt-image-placeholder"><Icon name="image" size={96} strokeWidth={1.5} /><span>Изображение 16:10, не менее 1600px</span></div>
        )}
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    </Slide>
  );
}

/* 7. KpiSlide — ключевые показатели */
export function KpiSlide({ overline, title, lead, items = [], note, source, ...rest }) {
  return (
    <Slide className="wt-l-kpi" {...rest}>
      <SlideHeader overline={overline} title={title} lead={lead} />
      <div className="wt-kpi-grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((k, i) => <KpiCard key={i} {...k} variant={k.variant || (i === 0 ? 'brand' : 'tint')} />)}
      </div>
      {note || source ? <div className="wt-slide-note">{note ? <Text variant="body" tone="secondary">{note}</Text> : null}{source ? <Source>{source}</Source> : null}</div> : null}
    </Slide>
  );
}

/* DashboardSlide — дашборд: сетка карточек (план/факт, KPI) и панель справа */
export function DashboardSlide({ overline, title, lead, meta, cards = [], columns = 2, aside, asideWidth = 600, source, background = 'surface', ...rest }) {
  return (
    <Slide background={background} className="wt-l-dashboard" {...rest}>
      <header className="wt-slide-header wt-dash-header">
        <div className="wt-slide-header-main">
          {overline || meta ? <div className="wt-dash-top">{overline ? <Overline>{overline}</Overline> : <span />}{meta ? <span className="wt-dash-meta">{meta}</span> : null}</div> : null}
          <Heading level="h1">{title}</Heading>
          {lead ? <Text variant="lead">{lead}</Text> : null}
        </div>
      </header>
      <div className="wt-dash">
        <div className="wt-dash-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {cards.map((c, i) => (React.isValidElement(c) ? React.cloneElement(c, { key: i }) : <PlanFactCard key={i} {...c} />))}
        </div>
        {aside ? <div className="wt-dash-aside" style={{ width: asideWidth }}>{aside}</div> : null}
      </div>
      {source ? <Source>{source}</Source> : null}
    </Slide>
  );
}

/* GridSlide — сетка блоков (bento): 2–4 разных компонента на одном слайде */
export const GRID_LAYOUTS = {
  halves: { areas: ['a b'] },
  thirds: { areas: ['a b c'] },
  '2x2': { areas: ['a b', 'c d'] },
  'feature-left': { areas: ['a b', 'a c'], columns: '3fr 2fr' },
  'feature-right': { areas: ['a c', 'b c'], columns: '2fr 3fr' },
  'top-3': { areas: ['a a a', 'b c d'] },
  'bottom-3': { areas: ['a b c', 'd d d'], rows: '1fr auto' },
};
export function GridSlide({ overline, title, lead, meta, layout = '2x2', areas, columns, rows, cells = [], gap = 24, source, ...rest }) {
  const preset = GRID_LAYOUTS[layout] || GRID_LAYOUTS['2x2'];
  const a = areas || preset.areas;
  const names = [...new Set(a.join(' ').split(/\s+/).filter((n) => n && n !== '.'))].sort();
  const cols = columns || preset.columns || `repeat(${a[0].trim().split(/\s+/).length}, minmax(0, 1fr))`;
  const rws = rows || preset.rows || `repeat(${a.length}, minmax(0, 1fr))`;
  return (
    <Slide className="wt-l-grid" {...rest}>
      <header className="wt-slide-header wt-dash-header">
        <div className="wt-slide-header-main">
          {overline || meta ? <div className="wt-dash-top">{overline ? <Overline>{overline}</Overline> : <span />}{meta ? <span className="wt-dash-meta">{meta}</span> : null}</div> : null}
          <Heading level="h1">{title}</Heading>
          {lead ? <Text variant="lead">{lead}</Text> : null}
        </div>
      </header>
      <div className="wt-gridslide" style={{ gridTemplateAreas: a.map((r) => `"${r}"`).join(' '), gridTemplateColumns: cols, gridTemplateRows: rws, gap }}>
        {cells.map((c, i) => (names[i] ? <div key={i} className="wt-gridslide-cell" style={{ gridArea: names[i] }}>{c}</div> : null))}
      </div>
      {source ? <Source>{source}</Source> : null}
    </Slide>
  );
}

/* 8. ChartSlide — график + вывод */
export function ChartSlide({ overline, title, chart, chartTitle, chartSubtitle, takeaway, points, source, ...rest }) {
  return (
    <Slide className="wt-l-chart" {...rest}>
      <SlideHeader overline={overline} title={title} />
      <div className={cx('wt-chart-layout', !(takeaway || points) && 'wt-chart-full')}>
        <div className="wt-chart-area">
          {chartTitle ? <div className="wt-chart-header"><div className="wt-chart-title">{chartTitle}</div>{chartSubtitle ? <div className="wt-chart-sub">{chartSubtitle}</div> : null}</div> : null}
          {chart}
          {source ? <Source>{source}</Source> : null}
        </div>
        {takeaway || points ? (
          <aside className="wt-chart-aside">
            {takeaway ? <div className="wt-takeaway">{takeaway}</div> : null}
            {points ? <BulletList items={points} /> : null}
          </aside>
        ) : null}
      </div>
    </Slide>
  );
}

/* 9. ComparisonSlide — сравнение вариантов / «было — стало» */
export function ComparisonSlide({ overline, title, lead, columns = [], ...rest }) {
  return (
    <Slide className="wt-l-compare" {...rest}>
      <SlideHeader overline={overline} title={title} lead={lead} />
      <div className="wt-compare" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
        {columns.map((c, i) => (
          <div key={i} className={cx('wt-compare-col', c.accent && 'wt-compare-accent')}>
            <div className="wt-compare-head">
              {c.badge ? <span className="wt-compare-badge">{c.badge}</span> : null}
              <Heading level="h2" as="h2">{c.title}</Heading>
              {c.subtitle ? <Text tone="secondary">{c.subtitle}</Text> : null}
            </div>
            <BulletList items={c.items} marker={c.marker || (c.accent ? 'check' : 'dot')} />
          </div>
        ))}
      </div>
    </Slide>
  );
}

/* 10. TableSlide — таблица */
export function TableSlide({ overline, title, lead, table, note, source, ...rest }) {
  return (
    <Slide className="wt-l-table" {...rest}>
      <SlideHeader overline={overline} title={title} lead={lead} />
      <div className="wt-table-wrap">{table}</div>
      {note || source ? <div className="wt-slide-note">{note ? <Text tone="secondary">{note}</Text> : null}{source ? <Source>{source}</Source> : null}</div> : null}
    </Slide>
  );
}

/* 11. TimelineSlide — таймлайн */
export function TimelineSlide({ overline, title, lead, timeline, note, ...rest }) {
  return (
    <Slide className="wt-l-timeline" {...rest}>
      <SlideHeader overline={overline} title={title} lead={lead} />
      <div className="wt-center-block">{timeline}</div>
      {note ? <div className="wt-slide-note">{note}</div> : null}
    </Slide>
  );
}

/* 12. RoadmapSlide — дорожная карта */
const RM_LEGEND = [['done', 'Выполнено'], ['progress', 'В работе'], ['planned', 'План'], ['risk', 'Риск']];
export function RoadmapSlide({ overline, title, lead, roadmap, legend = true, ...rest }) {
  // легенда — только по статусам, которые есть на карте (если карта задана элементом Roadmap)
  const lanes = roadmap && roadmap.props && roadmap.props.lanes;
  const used = lanes ? new Set(lanes.flatMap((l) => l.items.map((it) => it.status || 'planned'))) : null;
  const keys = RM_LEGEND.filter(([k]) => !used || used.has(k));
  return (
    <Slide className="wt-l-roadmap" {...rest}>
      <SlideHeader overline={overline} title={title} lead={lead} aside={legend ? (
        <div className="wt-rm-legend">
          {keys.map(([k, label]) => <span key={k}><i className={'wt-rm-key wt-rm-' + k} />{label}</span>)}
        </div>
      ) : null} />
      {roadmap}
    </Slide>
  );
}

/* 13. ProcessSlide — процесс */
export function ProcessSlide({ overline, title, lead, process, note, ...rest }) {
  return (
    <Slide className="wt-l-process" {...rest}>
      <SlideHeader overline={overline} title={title} lead={lead} />
      <div className="wt-center-block">{process}</div>
      {note ? <div className="wt-slide-note">{note}</div> : null}
    </Slide>
  );
}

/* 14. TeamSlide — команда */
export function TeamSlide({ overline, title, lead, people = [], ...rest }) {
  return (
    <Slide className="wt-l-team" {...rest}>
      <SlideHeader overline={overline} title={title} lead={lead} />
      <div className="wt-team" style={{ gridTemplateColumns: `repeat(${Math.min(people.length, people.length > 4 ? Math.ceil(people.length / 2) : 4)}, 1fr)` }}>
        {people.map((p, i) => (
          <div key={i} className="wt-person">
            <Avatar name={p.name} src={p.photo} size={people.length > 4 ? 144 : 184} />
            <div className="wt-person-name">{p.name}</div>
            <div className="wt-person-role">{p.role}</div>
            {p.text ? <div className="wt-person-text">{p.text}</div> : null}
          </div>
        ))}
      </div>
    </Slide>
  );
}

/* 15. QuoteSlide — цитата */
export function QuoteSlide({ quote, author, role, photo, ...rest }) {
  return (
    <Slide background="tint" className="wt-l-quote" {...rest}>
      <Quote author={author} role={role} size="lg">{quote}</Quote>
      {photo !== undefined ? <Avatar name={author} src={photo} size={220} className="wt-quote-avatar" /> : null}
    </Slide>
  );
}

/* 16. CaseSlide — кейс: задача → решение → результат */
export function CaseSlide({ overline = 'Кейс', title, client, problem, solution, results = [], ...rest }) {
  return (
    <Slide className="wt-l-case" {...rest}>
      <SlideHeader overline={overline} title={title} lead={client} />
      <div className="wt-case">
        <div className="wt-case-col">
          <div className="wt-case-step"><Icon name="target" size={40} /><span>Задача</span></div>
          <Text>{problem}</Text>
        </div>
        <div className="wt-case-col">
          <div className="wt-case-step"><Icon name="puzzle" size={40} /><span>Решение</span></div>
          {Array.isArray(solution) ? <BulletList items={solution} /> : <Text>{solution}</Text>}
        </div>
        <div className="wt-case-col wt-case-results">
          <div className="wt-case-step"><Icon name="trophy" size={40} /><span>Результат</span></div>
          {results.map((r, i) => (
            <div key={i} className="wt-case-result">
              <div className="wt-case-value">{r.value}</div>
              <div className="wt-case-label">{r.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

/* 17. ContactSlide — финальный слайд */
export function ContactSlide({ title = 'Спасибо!', subtitle, contacts = [], person, ...rest }) {
  return (
    <Slide footer={false} className="wt-l-contact" {...rest}>
      <Logo height={64} />
      <HexCluster cells={CONTACT_CELLS} unit={200} className="wt-contact-hex" />
      <div className="wt-contact-main">
        <Heading level="display">{title}</Heading>
        {subtitle ? <Text variant="lead">{subtitle}</Text> : null}
        {person ? (
          <div className="wt-contact-person">
            <Avatar name={person.name} src={person.photo} size={120} />
            <div><div className="wt-person-name">{person.name}</div><div className="wt-person-role">{person.role}</div></div>
          </div>
        ) : null}
        <ul className="wt-contact-list">
          {contacts.map((c, i) => (
            <li key={i}><span className="wt-feature-icon wt-icon-sm"><Icon name={c.icon || 'mail'} size={32} /></span><span>{c.value}</span></li>
          ))}
        </ul>
      </div>
    </Slide>
  );
}

export { IconFeature };
