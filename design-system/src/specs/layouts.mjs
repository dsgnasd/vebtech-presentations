// Шаблоны: холст, колода и 17 макетов слайдов. Превью — слайд в натуральную величину 1920×1080.
const L = 'Макеты слайдов';
const T = 'Шаблоны';
const slide = (name, readme, code, extra = {}) => ({ name, group: L, width: 1920, height: 1080, pad: 0, readme, code: code + '\nconst view = s;', ...extra });
const COMMON = `
Общие пропсы всех макетов: \`page\`, \`total\` (Deck проставляет сам), \`section\` (раздел в футере), \`confidential\`, \`footer\` (false — без футера), \`background\` ('surface' | 'tint' | 'brand').`;

export const LAYOUTS = [
  {
    name: 'Slide', group: T, width: 1920, height: 1080, pad: 0,
    readme: `
Холст слайда 1920×1080 (16:9) — основа всех макетов. Поля 96px, внизу зона футера. Контент раскладывается колонкой с шагом 56px.

## Пропсы
- \`background\`: \`surface\` (белый, по умолчанию) или \`tint\` (\`brand-50\`). Значение \`brand\` устарело с 1.3.0 (плотная заливка на весь слайд) и будет удалено в 2.0.0.
- \`footer\` (true), \`page\`, \`total\`, \`section\`, \`confidential\`, \`bleed\` (контент без полей — для полноэкранного изображения).

## Сетка
12 колонок по ≈114,7px, межколоночный отступ 32px в области 1728×840. Выравнивайте блоки по колонкам: 12, 6+6, 4+4+4, 8+4, 3×4.

## Печать и экран
Холст задаёт единый масштаб: минимальный кегль 24px — это ≈12pt при печати 16:9 на A4 и хорошо читается с 5 м на экране 65". Серые и тёмные фоны на весь слайд не используются: тонер экономится, контраст на проекторе не проседает.
`,
    code: `
const view = (
  <Slide section="Пример" page={5} total={24}>
    <SlideHeader overline="Раздел" title="Заголовок слайда — вывод в одну-две строки" lead="Подзаголовок: одно предложение контекста" />
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32 }}>
      {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ background: 'var(--brand-50)', boxShadow: 'inset 0 0 0 2px var(--brand-200)', borderRadius: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16, font: '700 24px var(--font-sans)', color: 'var(--brand-deep)' }}>{i + 1}</div>)}
    </div>
  </Slide>
);`,
  },
  {
    name: 'Deck', group: T, width: 1920, height: 760,
    readme: `
Колода: собирает слайды, проставляет номера и масштабирует их под ширину контейнера. При печати (Ctrl+P → «Сохранить как PDF») каждый слайд выводится на отдельную страницу 1920×1080 без полей.

## Пропсы
- \`layout\`: \`stack\` (слайды друг под другом — просмотр и печать), \`grid\` (обзор колоды, \`columns\` = 3), \`native\` (без масштаба).
- \`gap\` (32), \`numbered\` (true), \`total\`.

## Как собрать презентацию
1. Подключите tokens.css, bundle.css, React 18 и bundle.js (готовая сборка — папка \`templates/\` в репозитории).
2. Опишите слайды макетами (TitleSlide, ContentSlide, ChartSlide…) и передайте их в Deck.
3. Для PDF нажмите «Сохранить в PDF» или Ctrl+P: формат страницы задаётся автоматически, фоны печатаются.
`,
    code: `
const view = (
  <Deck layout="grid" columns={3}>
    <TitleSlide title="Итоги 2026 года" subtitle="Совет директоров" date="Сентябрь 2026" />
    <SectionSlide number={1} title="Финансовые результаты" />
    <KpiSlide overline="Итоги" title="Выручка выросла на 32%" items={[{ value: '48', unit: 'млн BYN', label: 'Выручка', delta: '+32%' }, { value: '126', label: 'Клиентов', delta: '+18' }, { value: '99,95', unit: '%', label: 'SLA' }]} />
  </Deck>
);`,
  },
  {
    name: 'HexCluster', group: T, width: 1920, height: 720,
    readme: `
Декоративный кластер из фирменных шестиугольников (контур из знака логотипа) в сотовой раскладке. Используется на титульном, разделительном и финальном слайдах.

## Пропсы
\`cells=[{ col, row, tone | texture }]\` — ячейки сот (нечётные ряды сдвинуты на полшага), \`unit\` — ширина ячейки, \`gap\` — зазор (16).
Тона: \`brand\`, \`accent\`, \`strong\`, \`soft\` (\`brand-200\`), \`tint\` (\`brand-100\`), \`tint-w\` (белый — на \`brand-50\`). Тона \`onbrand\` и \`onbrand-2\` (для синего фона) устарели вместе с синим фоном слайда.

## Правила
- Ячейка с \`texture\` — фото-фактура в маске знака (\`Webtech.textures\`: facade, circuit, server, fiber, ceiling, code, lights, cables, glass, grid, tunnel). На разделе и финале — не больше 2, на обложке — по композиции (до 4); правила — в описании Hexagon.
- 3–9 ячеек, одна \`brand\` и одна \`accent\` — остальное тинты. Коралловая ячейка — единственная тёплая точка на слайде.
- Кластер уходит за край слайда и не пересекается с текстом.
`,
    code: `
const view = (
  <div style={{ display: 'flex', gap: 96, alignItems: 'flex-start' }}>
    <HexCluster unit={200} cells={[{ col: 1, row: 0, tone: 'tint' }, { col: 2, row: 0, texture: 'facade' }, { col: 0, row: 1, tone: 'soft' }, { col: 1, row: 1, texture: 'circuit' }, { col: 2, row: 1, tone: 'brand' }, { col: 1, row: 2, tone: 'accent' }, { col: 2, row: 2, tone: 'tint' }]} />
    <div style={{ background: 'var(--brand-50)', borderRadius: 24, padding: 48 }}>
      <HexCluster unit={180} cells={[{ col: 0, row: 0, tone: 'soft' }, { col: 1, row: 0, tone: 'brand' }, { col: 0, row: 1, tone: 'tint-w' }, { col: 1, row: 1, tone: 'soft' }]} />
    </div>
  </div>
);`,
  },

  slide('TitleSlide', `
Титульный слайд: логотип, надзаголовок, название (display 96), подзаголовок, автор и дата. Соты справа или сверху выбираются пропом \`composition\`.

## Пропсы
- \`title\` (до 2 строк), \`subtitle\`, \`overline\` (тип документа или мероприятие), \`author\`, \`date\`.
- \`composition\` — раскладка сот (все варианты — в карточке «Композиции обложки»):
  - \`cluster\` (по умолчанию) — 7 сот справа сверху, 2 фото. Универсальная.
  - \`hero\` — та же сотовая сетка в крупном масштабе (соты 400px), 2 фото. Продукт, компания, продажи, кейс.
  - \`column\` — полоса сот у правого края на всю высоту, 2 фото. Длинные названия, отчёты, технические документы.
  - \`band\` — лента сот по верху, 4 фото. Мероприятия, воркшопы, онбординг.
  - \`quiet\` — «лесенка» из 11 сот в правом нижнем углу, 3 архитектурных фото. Совет директоров, официальные материалы, статус-отчёты.
- \`textures\` — фото в слотах композиции по порядку: имена фактур (\`facade\`, \`circuit\`, \`server\`, \`fiber\`, \`ceiling\`, \`code\`, \`lights\`, \`cables\`, \`glass\`, \`grid\`, \`tunnel\`) или URL дуотон-изображения. По умолчанию у каждой композиции свои.
${COMMON}

## Правила
- Все соты композиции одного размера и стоят на одной сотовой сетке с зазором 16px — размеры не смешиваются.
- В каждой композиции одна сота \`brand\`, одна \`accent\`, остальное — тинты и фото. Фото — только в сотах, видимых целиком. Текст слева внизу свободен.
- Выбирайте композицию по характеру документа, а не для разнообразия: в одной колоде — одна композиция обложки.`, `
const s = <TitleSlide overline="Стратегическая сессия" title="Стратегия развития 2027–2029" subtitle="Цели, приоритеты и дорожная карта" author="Алексей Орлов, генеральный директор" date="24 сентября 2026" />;`),

  {
    name: 'TitleCompositions', group: L, width: 1920, height: 1720, page: true, since: '1.7.0', status: 'beta', source: 'reviews/2026-09-24-title-compositions.md',
    readme: `
Композиции обложки: пять раскладок сот для \`TitleSlide composition\`. Геометрия задана в координатах холста (\`Webtech.TITLE_COMPOSITIONS\`, рисуются через \`HexArt\`).

| Композиция | Для чего | Фото |
|---|---|---|
| \`cluster\` | универсальная, по умолчанию | 2 |
| \`hero\` | продукт, компания, продажи, кейс | 2 (крупные соты) |
| \`column\` | отчёты, длинные названия, технические документы | 2 |
| \`band\` | мероприятия, воркшопы, онбординг | 4 |
| \`quiet\` | совет директоров, официальные материалы, статус | 3 |

## HexArt
\`HexArt cells=[{ x, y, w, tone | texture }]\` — соты в координатах холста 1920×1080 (левый верхний угол и ширина). Нужен для своих композиций; тона — как у HexCluster.
`,
    code: `
const t = { overline: 'Тип документа', title: 'Название презентации в две строки', subtitle: 'Подзаголовок: о чём и для кого', author: 'Имя Фамилия', date: 'Сентябрь 2026' };
const view = (
  <Deck layout="grid" columns={2} numbered={false}>
    {['cluster', 'hero', 'column', 'band', 'quiet'].map((c) => <TitleSlide key={c} {...t} overline={'composition="' + c + '"'} composition={c} />)}
  </Deck>
);`,
  },

  slide('SectionSlide', `
Разделитель раздела: крупный номер (160px, \`brand\`), название (display), подзаголовок.

## Варианты
- \`variant="tint"\` (единственный рекомендуемый) — фон \`brand-50\`, номер раздела \`brand\`, соты справа.
- \`variant="brand"\` — **устаревший** с 1.3.0: сплошная синяя заливка на весь слайд противоречит принципу «без плотных фоновых заливок». Работает для совместимости, будет удалён в 2.0.0 — используйте \`tint\`.
${COMMON}`, `
const s = <SectionSlide number={2} title="Финансовые результаты" subtitle="Выручка, маржинальность и инвестиции" page={6} total={24} />;`,
  { subtitle: 'tint' }),

  slide('AgendaSlide', `
Повестка: 3–8 пунктов в две колонки с номерами \`brand\`. \`active\` — индекс текущего пункта (при повторе повестки между разделами): пункты до него приглушены, текущий отмечен линией \`brand\`.

## Пункты
Строка или \`{ title, text?, time? }\`.
${COMMON}`, `
const s = <AgendaSlide active={2} items={[
  { title: 'Итоги года', text: 'Ключевые показатели', time: '10 мин' }, { title: 'Финансы', text: 'Выручка и маржинальность', time: '15 мин' },
  { title: 'Продукты', text: 'Запуски и метрики', time: '20 мин' }, { title: 'Клиенты', text: 'Кейсы и NPS', time: '10 мин' },
  { title: 'Стратегия 2027', text: 'Цели и инициативы', time: '20 мин' }, { title: 'Решения', text: 'Что утверждаем сегодня', time: '15 мин' },
]} page={2} total={24} />;`),

  slide('ContentSlide', `
Заголовок + список или текст — запасной слайд, когда у мысли нет структуры для графика или схемы. Не больше одного-двух на колоду. \`aside\` добавляет правую колонку 600px (Callout, KPI, изображение).

## Пропсы
\`overline\`, \`title\`, \`lead\`, \`bullets\` (как у BulletList), \`marker\`, \`children\` (любой контент вместо списка), \`aside\`.
${COMMON}`, `
const s = <ContentSlide overline="Стратегия" title="Три приоритета на 2027 год" lead="Фокус на росте в корпоративном сегменте и эффективности" bullets={[
  { title: 'Отраслевые решения', text: 'Готовые продукты для банков, ритейла и госсектора' },
  { title: 'Облачная платформа', text: 'Managed-сервисы с аттестацией по требованиям ОАЦ' },
  { title: 'Эффективность', text: 'Автоматизация поддержки и внутренних процессов' },
]} aside={<Callout tone="accent" title="Цель">Выручка 70 млн BYN и 200 корпоративных клиентов к концу 2027 года</Callout>} section="Стратегия" page={8} total={24} />;`),

  slide('TwoColumnSlide', `
Две равные колонки: «проблема — решение», «цели — метрики», два направления. Колонка: \`{ title, text?, bullets?, icon?, tint?, content? }\`. \`tint\` — подложка \`brand-50\` для акцентной колонки.
${COMMON}`, `
const s = <TwoColumnSlide overline="Продукт" title="Что меняется для клиента" left={{ icon: 'triangle-alert', title: 'Сейчас', bullets: ['Заявки обрабатываются вручную до 5 дней', 'Данные разбросаны по 4 системам', 'Нет прозрачного статуса для клиента'], marker: 'dot' }} right={{ icon: 'rocket', title: 'После внедрения', tint: true, bullets: ['Автоматическая обработка за 2 часа', 'Единый профиль клиента', 'Статус заявки в личном кабинете'], marker: 'check' }} section="Продукт" page={9} total={24} />;`),

  slide('ImageTextSlide', `
Текст + изображение 880px. \`imageSide\`: \`right\` (по умолчанию) или \`left\`. Без \`image\` показывается заглушка — замените её реальным фото или скриншотом.

## Изображения
- Фото — реальные: офис, команда, продукт. Без стоковых «рукопожатий» и абстрактных 3D-сцен.
- Скриншоты интерфейсов — на \`brand-50\` подложке, без рамок браузера, не мельче 1600px.
- Скругление \`radius-lg\`. Подпись — \`caption\` \`ink-muted\`.
${COMMON}`, `
const s = <ImageTextSlide overline="Продукт" title="Личный кабинет корпоративного клиента" text="Все услуги, документы и статусы заявок в одном окне" bullets={['Подключение новых сервисов за 5 минут', 'Электронный документооборот', 'Дашборды потребления и затрат']} caption="Интерфейс версии 3.0" section="Продукт" page={10} total={24} />;`),

  slide('KpiSlide', `
Ключевые показатели: 2–4 карточки KpiCard в ряд. Первая по умолчанию — \`brand\` (главная цифра), остальные — \`tint\`.

## Пропсы
\`items\` (пропсы KpiCard), \`note\` (вывод под карточками), \`source\`.
${COMMON}`, `
const s = <KpiSlide overline="Итоги 2026" title="Рекордный год по всем ключевым метрикам" items={[
  { value: '48', unit: 'млн BYN', label: 'Выручка', delta: '+32% к 2025', icon: 'wallet' },
  { value: '126', label: 'Корпоративных клиентов', delta: '+18 за год', icon: 'building' },
  { value: '72', label: 'NPS клиентов', delta: '+9 пунктов', icon: 'handshake' },
  { value: '99,95', unit: '%', label: 'Доступность сервисов', delta: 'SLA выполнен', trend: 'flat', icon: 'gauge' },
]} source="Источник: управленческая отчётность, данные на 31.08.2026" section="Итоги" page={4} total={24} />;`),

  slide('DashboardSlide', `
Дашборд «план / факт»: сетка карточек показателей и панель пояснений справа. Фон белый, карточки — Card \`outline\` с рамкой \`line\`.

## Пропсы
- \`overline\`, \`title\` (вывод, а не «План / факт»), \`lead\`, \`meta\` — период или тип отчёта справа от заголовка («Отчёт · I квартал 2026»).
- \`cards\` — 2–6 карточек: объекты с пропсами PlanFactCard или готовые элементы (KpiCard, Card). \`columns\` (2) — колонок в сетке. Карточки белые, одна главная (о ней заголовок) — \`tone: 'tint'\`.
- \`aside\` — правая колонка \`asideWidth\` (600px) из 1–2 Card: статусная карточка с пояснением отклонения (BreakdownBar, текст) и при необходимости обычная (MeterList).
- \`source\`, \`background\` (\`surface\` по умолчанию).
${COMMON}

## Правила
- Проценты во всех карточках считаются одинаково — факт / план. Что хорошо, говорит статус (\`better="lower"\` для затрат).
- Одна единица на карточку; шкала полос общая внутри карточки.
- Панель справа объясняет главное отклонение, а не дублирует цифры карточек. Одна статусная панель на слайд.
- Плотный слайд: только для отчётов, где аудитория читает цифры. Для выступления — KpiSlide или ChartSlide с одним выводом.`, `
const f1 = (v) => W.fmt(v, { digits: 1, minDigits: 1 });
const s = <DashboardSlide overline="Ключевые показатели эффективности" title="Прибыль вдвое выше плана, выручка отстаёт на 10%" meta="Отчёт · I квартал 2026" section="Итоги" page={3} total={12}
  cards={[
    { title: 'Выручка', tone: 'tint', unit: 'тыс. BYN', plan: 11304.8, fact: 10146.3, rows: [{ label: 'Отчётность', value: 10412.5 }] },
    { title: 'Чистая прибыль', unit: 'тыс. BYN', plan: 623.3, fact: 1330.9, rows: [{ label: 'Отчётность', value: 1647.3 }] },
    { title: 'Рентабельность услуг', unit: '%', plan: 16.9, fact: 17.3, rows: [{ label: 'Отчётность', value: 21.1 }], format: (v) => f1(v) + '%' },
    { title: 'Операционные затраты', unit: 'тыс. BYN', better: 'lower', plan: 9674.6, fact: 8650, rows: [{ label: 'Отчётность', value: 8599.8 }] },
  ]}
  aside={[
    <Card key="why" tone="warning" icon="triangle-alert" title="Причины недополучения выручки">
      <Text variant="body" tone="secondary">Клиенты приняли 86,5% трудозатрат. Не оплачено, тыс. BYN:</Text>
      <BreakdownBar totalLabel="Итого" height={32} items={[{ label: 'Не завершены работы', value: 855016.5 }, { label: 'Не приняты работы', value: 260722 }, { label: 'Простой ИИ-ресурса', value: 116822.2 }]} />
    </Card>,
    <Card key="ai" icon="sparkles" title="Ставка ИИ-ресурса">
      <MeterList layout="inline" items={[
        { label: 'Ресурсный план', value: 18.25, display: '18,25' },
        { label: 'Выделено', value: 5.08, display: '5,08' },
        { label: 'Использовано', value: 2.96, display: '2,96' },
      ]} />
    </Card>,
  ]} />;`, { since: '1.9.0', status: 'beta', source: 'reviews/2026-09-24-plan-fact.md' }),

  slide('GridSlide', `
Сетка блоков (bento): 2–4 разных компонента на одном слайде — график, KPI, карточки, таблица, цитата, вывод. Для плотных рабочих слайдов, где один компонент на слайд — слишком мало.

## Пропсы
- \`overline\`, \`title\` (вывод), \`lead\`, \`meta\` — период или тип отчёта справа от надзаголовка.
- \`cells\` — массив элементов; по порядку занимают области \`a\`, \`b\`, \`c\`, \`d\`. Каждый блок растягивается на высоту своей ячейки.
- \`layout\` — готовая схема:
  - \`halves\` — \`a b\`;
  - \`thirds\` — \`a b c\`;
  - \`2x2\` — \`a b / c d\` (по умолчанию);
  - \`feature-left\` — большой блок слева и два справа, колонки 3fr 2fr;
  - \`feature-right\` — два слева и большой справа, 2fr 3fr;
  - \`top-3\` — широкий блок сверху и три снизу;
  - \`bottom-3\` — три блока сверху и широкий снизу по высоте содержимого (вывод, таймлайн).
- Своя схема — \`areas\` (строки CSS grid-template-areas, например \`['a b', 'a c']\`), \`columns\`, \`rows\`. Ширины колонок меняются и у пресета: \`layout="halves" columns="2fr 1fr"\`.
- \`gap\` (24), \`source\`.
${COMMON}

## Правила
- 2–4 блока. Больше — делите на два слайда.
- В ячейках — компоненты ДС: Card (с графиком, MeterList, FactList, Checklist, BreakdownBar), KpiCard, Callout, StatusTable, Timeline, Quote. Ручных сеток и своих цветов не нужно.
- Голубой тинт — у одной области на слайде (KpiCard \`brand\` или Card \`tint\`). Остальные карточки белые с рамкой.
- Графику в карточке задавайте размеры под ячейку (\`width\`, \`height\`); подписи и легенда обязательны.
- Заголовок в одну строку оставляет сетке ≈ 690px по высоте, в две — ≈ 620px.`, `
const s = <GridSlide overline="Главное" meta="Итоги 2026" title="Выручка программы выросла на 32% — лучший год" layout="feature-left" section="Главное" page={3} total={14}
  cells={[
    <Card title="Выручка по кварталам" meta="млн BYN"><BarChart width={900} height={500} highlight={7} data={[{ label: 'I 25', value: 8.2 }, { label: 'II 25', value: 8.9 }, { label: 'III 25', value: 9.1 }, { label: 'IV 25', value: 10.2 }, { label: 'I 26', value: 10.8 }, { label: 'II 26', value: 11.6 }, { label: 'III 26', value: 12.1 }, { label: 'IV 26', value: 13.5 }]} format={(v) => W.fmt(v, { digits: 1, minDigits: 1 })} /></Card>,
    <KpiCard variant="brand" value="48" unit="млн BYN" label="Выручка за 2026 год" delta="+32% к 2025" />,
    <Card icon="target" title="Цели года"><MeterList max={120} base={false} items={[{ label: 'Выручка', value: 104, display: '104%', color: 'var(--chart-1)' }, { label: 'Новые клиенты', value: 112, display: '112%', color: 'var(--chart-1)' }, { label: 'Автоматизация обращений', value: 86, display: '86%', color: 'var(--chart-other)' }]} /></Card>,
  ]} source="Управленческая отчётность, данные на 30.11.2026" />;`, { since: '1.14.0', status: 'beta', source: 'reviews/2026-09-28-template-01-density.md' }),

  slide('ChartSlide', `
График + вывод. Слева — график с заголовком, единицами и источником, справа — панель \`accent-50\` 560px: главный вывод (\`takeaway\`, 36px \`ink\` под бирюзовой полосой) и 2–3 пояснения. Без \`takeaway\` и \`points\` график занимает всю ширину.

## Пропсы
\`chart\` (элемент графика шириной ~1100px, высотой ~560px), \`chartTitle\`, \`chartSubtitle\`, \`takeaway\`, \`points\`, \`source\`.
${COMMON}`, `
const s = <ChartSlide overline="Финансы" title="Выручка удвоилась за три года" chartTitle="Выручка" chartSubtitle="млн BYN" chart={<BarChart width={1080} height={480} highlight="2026" data={[{ label: '2022', value: 14 }, { label: '2023', value: 21 }, { label: '2024', value: 29 }, { label: '2025', value: 36 }, { label: '2026', value: 48 }]} />} takeaway="+32% в 2026 году — выше рынка в 2 раза" points={['Облачные сервисы — 45% выручки', '18 новых корпоративных клиентов']} source="Источник: управленческая отчётность" section="Финансы" page={7} total={24} />;`),

  slide('ComparisonSlide', `
Сравнение 2–3 вариантов или «было — стало». Колонка: \`{ title, subtitle?, items, badge?, accent?, marker? }\`. \`accent\` — рекомендуемый вариант: рамка \`accent\`, фон \`accent-50\`, бейдж \`accent\` с текстом \`on-accent\`, маркеры-галочки.
${COMMON}`, `
const s = <ComparisonSlide overline="Решение" title="Рекомендуем гибридное размещение" columns={[
  { title: 'Своё ЦОД', subtitle: 'CAPEX 6 млн BYN', items: ['Полный контроль', 'Долгий запуск — 9 месяцев', 'Своя команда эксплуатации'] },
  { title: 'Гибрид', subtitle: 'OPEX 130 тыс. BYN/мес', badge: 'Рекомендуем', accent: true, items: ['Запуск за 6 недель', 'Данные ПДн — в своём контуре', 'Масштабирование по запросу'] },
  { title: 'Публичное облако', subtitle: 'OPEX 100 тыс. BYN/мес', items: ['Быстрый старт', 'Ограничения Закона № 99-З о персональных данных', 'Зависимость от провайдера'] },
]} section="Решение" page={14} total={24} />;`),

  slide('TableSlide', `
Таблица на слайде: DataTable, ComparisonTable или StatusTable в \`table\`. Под таблицей — вывод (\`note\`) и источник.
${COMMON}`, `
const s = <TableSlide overline="Финансы" title="Все направления растут быстрее рынка" table={<DataTable columns={[{ title: 'Направление' }, { title: '2024', align: 'right' }, { title: '2025', align: 'right' }, { title: '2026', align: 'right' }, { title: 'Рост 2026', align: 'right' }]} rows={[['Облачные сервисы', 11, 15, 22, '+47%'], ['Интеграция', 11, 13, 16, '+23%'], ['Поддержка', 7, 8, 10, '+25%'], ['Итого, млн BYN', 29, 36, 48, '+33%']]} highlightRow={3} />} source="Источник: управленческая отчётность, млн BYN без НДС" section="Финансы" page={8} total={24} />;`),

  slide('TimelineSlide', `
Слайд с таймлайном: Timeline, VerticalTimeline или PhaseTimeline в \`timeline\`, по центру свободной области. \`note\` — вывод под шкалой (Callout), с 1.10.0.
${COMMON}`, `
const s = <TimelineSlide overline="О компании" title="Семь лет роста" timeline={<Timeline items={[
  { date: '2019', title: 'Основание', text: 'Команда из 12 инженеров', status: 'done' },
  { date: '2021', title: 'Первый банк', text: 'Платформа ДБО', status: 'done' },
  { date: '2023', title: 'Своё облако', text: 'Два ЦОД Tier III', status: 'done' },
  { date: '2026', title: '100+ клиентов', text: 'Выход в регионы', status: 'current' },
  { date: '2028', title: 'Топ-3 рынка', text: 'Стратегическая цель', status: 'planned' },
]} />} section="О компании" page={3} total={24} />;`),

  slide('RoadmapSlide', `
Дорожная карта: Roadmap в \`roadmap\` и легенда статусов справа от заголовка (\`legend={false}\` — без неё).
${COMMON}`, `
const s = <RoadmapSlide overline="План" title="Дорожная карта на 18 месяцев" roadmap={<Roadmap periods={['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027']} today={2.6} lanes={[
  { name: 'Платформа', items: [{ start: 0, end: 2, label: 'Ядро и API', status: 'done' }, { start: 2, end: 4, label: 'Масштабирование', status: 'progress' }] },
  { name: 'Продукты', items: [{ start: 1, end: 3, label: 'Мобильное приложение', status: 'progress' }, { start: 3.2, end: 6, label: 'Маркетплейс', status: 'planned' }] },
  { name: 'Интеграции', items: [{ start: 1.5, end: 3.4, label: 'Биллинг', status: 'risk' }, { start: 3.6, end: 5, label: '1С и ERP', status: 'planned' }] },
  { name: 'Регионы', items: [{ start: 0, end: 1, label: 'Пилот', status: 'done' }, { start: 4, end: 6, label: '12 регионов', status: 'planned' }] },
]} />} section="План" page={18} total={24} />;`),

  slide('ProcessSlide', `
Процесс: ProcessFlow, Cycle, Funnel или Pyramid в \`process\`, по центру свободной области. \`note\` — пояснение внизу (например, Callout).
${COMMON}`, `
const s = <ProcessSlide overline="Как мы работаем" title="Запуск проекта за 12 недель" process={<ProcessFlow steps={[
  { icon: 'search', title: 'Аудит', text: 'Процессы и ИТ-ландшафт, 2 недели' },
  { icon: 'layers', title: 'Проектирование', text: 'Архитектура и план, 2 недели' },
  { icon: 'code', title: 'Разработка', text: 'Спринты по 2 недели, 6 недель' },
  { icon: 'rocket', title: 'Запуск', text: 'Пилот и обучение, 2 недели' },
]} />} note={<Callout tone="success" title="Гарантия сроков">Фиксируем дату запуска в договоре</Callout>} section="Подход" page={11} total={24} />;`),

  slide('TeamSlide', `
Команда: 2–8 человек с аватаром, именем, ролью и коротким описанием. До 4 человек — один ряд, 5–8 — два ряда.
${COMMON}`, `
const s = <TeamSlide overline="Команда проекта" title="Выделенная команда из 12 специалистов" people={[
  { name: 'Мария Козлова', role: 'Руководитель проекта', text: '15 лет в ИТ, 30+ внедрений', photo: W.samplePhoto('Мария Козлова') },
  { name: 'Алексей Орлов', role: 'Архитектор', text: 'Высоконагруженные системы', photo: W.samplePhoto('Алексей Орлов') },
  { name: 'Анна Смирнова', role: 'Бизнес-аналитик', text: 'Банковские процессы', photo: W.samplePhoto('Анна Смирнова') },
  { name: 'Илья Петров', role: 'Тимлид разработки', text: 'Java, Kotlin, Kubernetes', photo: W.samplePhoto('Илья Петров') },
]} section="Команда" page={15} total={24} />;`),

  slide('QuoteSlide', `
Цитата клиента или руководителя на фоне \`brand-50\`. \`photo\` — фото автора (передайте \`null\`, чтобы показать инициалы; без пропа аватара нет).
${COMMON}`, `
const s = <QuoteSlide quote="Команда Вэбтех запустила платформу за три месяца — на полгода быстрее нашего внутреннего плана." author="Ольга Васильева" role="Директор по цифровой трансформации, Банк «Пример»" photo={null} page={16} total={24} />;`),

  slide('CaseSlide', `
Кейс в три колонки: задача → решение → результат. Результаты — 2–3 крупные цифры \`brand-strong\` на светлой подложке \`brand-100\`.

## Пропсы
\`title\` (результат в заголовке), \`client\` (клиент и отрасль), \`problem\`, \`solution\` (текст или список), \`results=[{ value, label }]\`.
${COMMON}`, `
const s = <CaseSlide title="Банк сократил срок выдачи кредита с 3 дней до 2 часов" client="Банк из топ-10 Беларуси, 1,2 млн клиентов" problem="Заявки на кредит обрабатывались вручную в трёх системах, клиенты уходили к конкурентам." solution={['Единая платформа кредитного конвейера', 'Автоматический скоринг и проверки', 'Интеграция с Кредитным регистром и МСИ']} results={[{ value: '2 часа', label: 'вместо 3 дней на решение' }, { value: '+38%', label: 'одобренных заявок онлайн' }]} section="Кейсы" page={17} total={24} />;`),

  slide('ContactSlide', `
Финальный слайд: «Спасибо!» или «Вопросы?», контактное лицо, контакты с иконками. Без футера, с логотипом и кластером шестиугольников.

## Пропсы
\`title\`, \`subtitle\`, \`person={ name, role, photo? }\`, \`contacts=[{ icon, value }]\`.
${COMMON}`, `
const s = <ContactSlide title="Спасибо!" subtitle="Готовы ответить на вопросы" person={{ name: 'Илья Петров', role: 'Коммерческий директор', photo: W.samplePhoto('Илья Петров') }} contacts={[{ icon: 'mail', value: 'name@company.by' }, { icon: 'phone', value: '+375 00 000-00-00' }, { icon: 'globe', value: 'www.company.by' }, { icon: 'map-pin', value: 'Минск, Беларусь' }]} />;`),
];
