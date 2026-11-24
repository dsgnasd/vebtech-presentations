// Вэбтех — презентации. Типы компонентов (документация). Глобальное пространство имён: window.Webtech.
// Все размеры — в пикселях холста слайда 1920×1080.
import type { ReactNode, CSSProperties } from 'react';

type Base = { className?: string; style?: CSSProperties };
type StatusKind = 'done' | 'ok' | 'progress' | 'risk' | 'blocked' | 'planned' | 'paused';
type Step3 = 'done' | 'current' | 'planned';

/* ---------- Атомы ---------- */
/** Логотип «ВЭБ Технологии» из фирменных файлов. */
export function Logo(p: Base & { variant?: 'color' | 'white' | 'mark' | 'mark-white'; height?: number; title?: string }): JSX.Element;
/** Иконка Lucide: контур 2px. Имена — Webtech.iconNames. */
export function Icon(p: Base & { name: string; size?: number; strokeWidth?: number; color?: string; title?: string }): JSX.Element | null;
export const iconNames: string[];
/** Заголовок: display 96, h1 64, h2 48, h3 36. */
export function Heading(p: Base & { level?: 'display' | 'h1' | 'h2' | 'h3'; as?: string; tone?: 'ink' | 'secondary' | 'brand' | 'onbrand'; children: ReactNode }): JSX.Element;
/** Текст: lead 32, body 28, body-strong 28/600, caption 24. */
export function Text(p: Base & { variant?: 'lead' | 'body' | 'body-strong' | 'caption'; tone?: 'ink' | 'secondary' | 'muted' | 'brand' | 'onbrand'; as?: string; children: ReactNode }): JSX.Element;
/** Надзаголовок: 24px, заглавные, brand-strong. */
export function Overline(p: Base & { tone?: 'brand' | 'onbrand' | 'muted'; children: ReactNode }): JSX.Element;
/** Бейдж-метка. Тона success/warning/danger получают иконку автоматически. */
export function Badge(p: Base & { tone?: 'brand' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'danger'; icon?: string | false; solid?: boolean; children: ReactNode }): JSX.Element;
export function Divider(p: Base & { vertical?: boolean; strong?: boolean; accent?: boolean }): JSX.Element;
/** Фирменный шестиугольник из знака логотипа. */
export const textures: Record<'facade' | 'circuit' | 'server' | 'fiber' | 'ceiling' | 'code' | 'lights' | 'cables' | 'glass' | 'grid' | 'tunnel', string>;
export const textureCredits: { id: string; title: string; author: string; url: string }[];
/** texture — фото-фактура в маске знака (имя из textures или URL) */
export function Hexagon(p: Base & { texture?: string; size?: number; tone?: 'brand' | 'accent' | 'strong' | 'deep' | 'tint' | 'soft' | 'outline' | 'white'; title?: string; children?: ReactNode }): JSX.Element;
export function Bullet(p: { variant?: 'hex' | 'number' | 'dot' | 'check' | 'cross'; index?: number; tone?: 'brand' | 'tint'; className?: string }): JSX.Element;
export function LegendSwatch(p: { color?: string; shape?: 'square' | 'circle' | 'line'; label?: ReactNode; className?: string }): JSX.Element;
export function Avatar(p: Base & { name?: string; src?: string; size?: number }): JSX.Element;
export function PageNumber(p: { page: number; total?: number; className?: string }): JSX.Element;
/** Число в формате ru-BY: 1 250,5 */
export function fmt(v: number, opts?: { digits?: number; minDigits?: number }): string;

/* ---------- Молекулы ---------- */
export function KpiCard(p: Base & { value: ReactNode; unit?: string; label: ReactNode; delta?: string; trend?: 'up' | 'down' | 'flat' | 'none'; sentiment?: 'good' | 'bad' | 'neutral'; icon?: string; note?: ReactNode; variant?: 'tint' | 'brand' | 'outline' | 'plain'; size?: 'md' | 'lg' }): JSX.Element;
export function IconFeature(p: Base & { icon?: string; title?: ReactNode; layout?: 'vertical' | 'horizontal'; children?: ReactNode }): JSX.Element;
type ListItem = string | { text: ReactNode; title?: ReactNode; marker?: 'hex' | 'number' | 'dot' | 'check' | 'cross' };
export function BulletList(p: Base & { items: ListItem[]; marker?: 'hex' | 'number' | 'dot' | 'check' | 'cross'; size?: 'body' | 'lead' | 'sm'; columns?: number }): JSX.Element;
export function Quote(p: Base & { author?: string; role?: string; size?: 'md' | 'lg'; children: ReactNode }): JSX.Element;
export function Callout(p: Base & { tone?: 'brand' | 'accent' | 'info' | 'success' | 'warning' | 'danger'; title?: ReactNode; icon?: string; children?: ReactNode }): JSX.Element;
export function Legend(p: Base & { items: { label: ReactNode; color?: string; shape?: 'square' | 'circle' | 'line' }[] }): JSX.Element;
export function TimelineStep(p: Base & { date: ReactNode; title: ReactNode; status?: Step3; children?: ReactNode }): JSX.Element;
export function ChartHeader(p: Base & { title: ReactNode; subtitle?: string; unit?: string }): JSX.Element;
export function Source(p: Base & { children: ReactNode }): JSX.Element;
export function SlideFooter(p: { page?: number; total?: number; section?: string; confidential?: boolean | string; logo?: boolean; onBrand?: boolean; className?: string }): JSX.Element;
export function SlideHeader(p: Base & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; aside?: ReactNode }): JSX.Element;

/* ---------- Списки, статусы, таймлайны ---------- */
export function Checklist(p: Base & { items: { text: ReactNode; note?: ReactNode; meta?: ReactNode; status?: 'done' | 'progress' | 'todo' | 'blocked'; done?: boolean }[] }): JSX.Element;
export function NestedList(p: Base & { items: { title: ReactNode; items?: ReactNode[] }[]; numbered?: boolean }): JSX.Element;
/** Статус: цвет + иконка + слово. */
export function Status(p: Base & { status?: StatusKind; label?: ReactNode; variant?: 'pill' | 'text' | 'large' }): JSX.Element;
export const statusKinds: StatusKind[];
export function ProgressBar(p: Base & { value: number; max?: number; label?: ReactNode; status?: StatusKind; showValue?: boolean; width?: number }): JSX.Element;
export function StatusTable(p: Base & { rows: { name: ReactNode; status: StatusKind; statusLabel?: ReactNode; progress?: number; note?: ReactNode }[]; columns?: string[] }): JSX.Element;
export function Timeline(p: Base & { items: { date: ReactNode; title: ReactNode; text?: ReactNode; status?: Step3 }[] }): JSX.Element;
export function VerticalTimeline(p: Base & { items: { date: ReactNode; title: ReactNode; text?: ReactNode; status?: Step3 }[] }): JSX.Element;
/** start/end — в долях периодов, от 0 до periods.length. */
export function Roadmap(p: Base & { periods: string[]; today?: number; lanes: { name: ReactNode; items: { start: number; end: number; label: string; status?: 'done' | 'progress' | 'planned' | 'risk' }[] }[] }): JSX.Element;

/* ---------- Графики (SVG) ---------- */
type Fmt = (v: number) => string;
type Series = { name: string; values: number[]; color?: string; dashed?: boolean };
type ChartBase = Base & { width?: number; height?: number; format?: Fmt; title?: string };
export function BarChart(p: ChartBase & { data?: { label: string; value: number; color?: string }[]; categories?: string[]; series?: Series[]; orientation?: 'vertical' | 'horizontal'; highlight?: number | string; showValues?: boolean; showGrid?: boolean }): JSX.Element;
export function StackedBar(p: ChartBase & { categories: string[]; series: Series[]; orientation?: 'vertical' | 'horizontal'; percent?: boolean; showValues?: boolean; showTotals?: boolean }): JSX.Element;
export function LineChart(p: ChartBase & { categories: string[]; series: Series[]; yMin?: number; yMax?: number; markers?: boolean; labelLast?: boolean }): JSX.Element;
export function AreaChart(p: ChartBase & { categories: string[]; series: Series[]; stacked?: boolean; yMin?: number; yMax?: number; markers?: boolean; labelLast?: boolean }): JSX.Element;
export function DonutChart(p: Base & { data: { label: string; value: number; color?: string }[]; size?: number; thickness?: number; centerValue?: ReactNode; centerLabel?: ReactNode; percent?: boolean; format?: Fmt; legend?: 'right' | 'bottom'; title?: string }): JSX.Element;
export function Waterfall(p: ChartBase & { steps: { label: string; value?: number; total?: boolean }[] }): JSX.Element;
/** Столбцы + линия на одной оси (одни единицы). */
export function ComboChart(p: ChartBase & { categories: string[]; bars: Series; line: Series }): JSX.Element;
export function Sparkline(p: Base & { values: number[]; width?: number; height?: number; color?: string; title?: string }): JSX.Element;

/* ---------- Диаграммы и таблицы ---------- */
export function ProcessFlow(p: Base & { steps: { title: ReactNode; text?: ReactNode; icon?: string }[]; numbered?: boolean }): JSX.Element;
export function Funnel(p: Base & { stages: { label: string; value: number }[]; width?: number; format?: Fmt; showConversion?: boolean }): JSX.Element;
/** x, y — от 0 до 1. quadrants: [левый верхний, правый верхний, левый нижний, правый нижний]. */
export function Matrix2x2(p: Base & { xLabel: string; yLabel: string; quadrants?: string[]; items: { label: string; x: number; y: number; accent?: boolean }[]; size?: number }): JSX.Element;
type Person = { name: string; role: string; photo?: string };
export function OrgChart(p: Base & { root: Person; children: (Person & { team?: string[] })[] }): JSX.Element;
export function Cycle(p: Base & { steps: { title: string; icon?: string }[]; size?: number; center?: ReactNode }): JSX.Element;
export function Pyramid(p: Base & { levels: { title: ReactNode; text?: ReactNode }[]; width?: number; variant?: 'pyramid' | 'layers' }): JSX.Element;
export function DataTable(p: Base & { columns: { title: ReactNode; key?: string; align?: 'left' | 'right'; width?: number }[]; rows: (ReactNode[] | Record<string, ReactNode>)[]; highlightRow?: number; zebra?: boolean }): JSX.Element;
export function ComparisonTable(p: Base & { options: ReactNode[]; features: { name: ReactNode; values: (boolean | ReactNode)[] }[]; highlight?: number }): JSX.Element;

/* ---------- Шаблоны ---------- */
type SlideCommon = { page?: number; total?: number; section?: string; confidential?: boolean | string; footer?: boolean; /** 'brand' устарел с 1.3.0 */ background?: 'surface' | 'tint' | 'brand'; className?: string; style?: CSSProperties };
/** Холст 1920×1080: поля 96px, футер внизу. */
export function Slide(p: SlideCommon & { bleed?: boolean; children?: ReactNode }): JSX.Element;
/** Колода: номера, масштаб под контейнер, печать — слайд на страницу. */
export function Deck(p: Base & { layout?: 'stack' | 'grid' | 'native'; columns?: number; gap?: number; numbered?: boolean; total?: number; children: ReactNode }): JSX.Element;
export function HexCluster(p: Base & { cells: { col: number; row: number; texture?: string; tone?: 'brand' | 'accent' | 'strong' | 'soft' | 'tint' | 'tint-w' | 'onbrand' | 'onbrand-2' }[]; unit?: number; gap?: number }): JSX.Element;
export type TitleComposition = 'cluster' | 'hero' | 'column' | 'band' | 'quiet';
export function TitleSlide(p: SlideCommon & { title: ReactNode; subtitle?: ReactNode; overline?: ReactNode; author?: ReactNode; date?: ReactNode; composition?: TitleComposition; textures?: string[] }): JSX.Element;
export function HexArt(p: Base & { cells: { x: number; y: number; w: number; texture?: string; tone?: 'brand' | 'accent' | 'strong' | 'soft' | 'tint' | 'tint-w' }[]; width?: number; height?: number }): JSX.Element;
export const TITLE_COMPOSITIONS: Record<TitleComposition, { photos: string[]; cells: () => { x: number; y: number; w: number; tone?: string; texture?: string }[] }>;
export function SectionSlide(p: SlideCommon & { number?: number; title: ReactNode; subtitle?: ReactNode; /** 'brand' устарел с 1.3.0, используйте 'tint' */ variant?: 'tint' | 'brand' }): JSX.Element;
export function AgendaSlide(p: SlideCommon & { title?: ReactNode; overline?: ReactNode; items: (string | { title: ReactNode; text?: ReactNode; time?: string })[]; active?: number }): JSX.Element;
export function ContentSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; bullets?: ListItem[]; marker?: 'hex' | 'number' | 'dot' | 'check' | 'cross'; aside?: ReactNode; children?: ReactNode }): JSX.Element;
type Column = { title?: ReactNode; text?: ReactNode; bullets?: ListItem[]; marker?: 'hex' | 'number' | 'dot' | 'check' | 'cross'; icon?: string; tint?: boolean; content?: ReactNode };
export function TwoColumnSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; left: Column; right: Column }): JSX.Element;
export function ImageTextSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; text?: ReactNode; bullets?: ListItem[]; image?: string; imageAlt?: string; imageSide?: 'left' | 'right'; caption?: ReactNode }): JSX.Element;
export function KpiSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; items: Parameters<typeof KpiCard>[0][]; note?: ReactNode; source?: ReactNode }): JSX.Element;
export function ChartSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; chart: ReactNode; chartTitle?: ReactNode; chartSubtitle?: ReactNode; takeaway?: ReactNode; points?: ListItem[]; source?: ReactNode }): JSX.Element;
export function ComparisonSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; columns: { title: ReactNode; subtitle?: ReactNode; items: ListItem[]; badge?: ReactNode; accent?: boolean; marker?: 'hex' | 'number' | 'dot' | 'check' | 'cross' }[] }): JSX.Element;
export function TableSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; table: ReactNode; note?: ReactNode; source?: ReactNode }): JSX.Element;
export function TimelineSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; timeline: ReactNode; note?: ReactNode }): JSX.Element;
export function RoadmapSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; roadmap: ReactNode; legend?: boolean }): JSX.Element;
export function ProcessSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; process: ReactNode; note?: ReactNode }): JSX.Element;
export function TeamSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; people: (Person & { text?: ReactNode })[] }): JSX.Element;
export function QuoteSlide(p: SlideCommon & { quote: ReactNode; author: string; role?: string; photo?: string | null }): JSX.Element;
export function CaseSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; client?: ReactNode; problem: ReactNode; solution: ReactNode | ListItem[]; results: { value: ReactNode; label: ReactNode }[] }): JSX.Element;
export function ContactSlide(p: SlideCommon & { title?: ReactNode; subtitle?: ReactNode; person?: Person; contacts: { icon?: string; value: ReactNode }[] }): JSX.Element;

// Дашборд (1.9.0, бета)
export type CardTone = 'outline' | 'tint' | 'info' | 'warning' | 'danger' | 'success';
export type MeterItem = { label: ReactNode; value: number; display?: ReactNode; caption?: ReactNode; color?: string };
export function Card(p: Base & { tone?: CardTone; icon?: string; overline?: ReactNode; title?: ReactNode; meta?: ReactNode; children?: ReactNode }): JSX.Element;
export function MeterList(p: Base & { items: MeterItem[]; max?: number; layout?: 'split' | 'inline'; valueHeader?: ReactNode; base?: boolean; format?: (v: number) => string }): JSX.Element;
export function planFactStatus(percent: number, better?: 'higher' | 'lower'): { status: StatusKind; label: string };
export type PlanFactProps = { title: ReactNode; unit?: ReactNode; plan: number; fact: number; rows?: MeterItem[]; better?: 'higher' | 'lower'; status?: StatusKind; statusLabel?: string; percent?: number; labels?: { plan?: string; fact?: string }; format?: (v: number) => string; tone?: CardTone; icon?: string };
export function PlanFactCard(p: Base & PlanFactProps): JSX.Element;
export function BreakdownBar(p: Base & { items: { label: ReactNode; value: number; color?: string }[]; total?: number; totalLabel?: ReactNode | null; format?: (v: number) => string; showShare?: boolean; height?: number; title?: string }): JSX.Element;
export function DashboardSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; meta?: ReactNode; cards: (PlanFactProps | ReactNode)[]; columns?: number; aside?: ReactNode; asideWidth?: number; source?: ReactNode; background?: 'surface' | 'tint' }): JSX.Element;
export type GridLayout = 'halves' | 'thirds' | '2x2' | 'feature-left' | 'feature-right' | 'top-3' | 'bottom-3';
export const GRID_LAYOUTS: Record<GridLayout, { areas: string[]; columns?: string; rows?: string }>;
export function GridSlide(p: SlideCommon & { overline?: ReactNode; title: ReactNode; lead?: ReactNode; meta?: ReactNode; layout?: GridLayout; areas?: string[]; columns?: string; rows?: string; cells: ReactNode[]; gap?: number; source?: ReactNode }): JSX.Element;

// Кейсы и хронология (1.10.0, бета)
export function FactList(p: Base & { items: { icon?: string; label: ReactNode; value: ReactNode }[]; layout?: 'row' | 'column' }): JSX.Element;
export function PhaseTimeline(p: Base & { start: string; end: string; width?: number; spans?: { from: string; to?: string; tone?: 'work' | 'waiting' }[]; milestones?: { date: string; label: ReactNode; dateLabel?: string; tone?: 'accent' }[]; phases?: { start: string; end: string; label: string }[]; legend?: { tone: 'work' | 'waiting'; label: string }[] | false; labelWidth?: number; title?: string }): JSX.Element;
