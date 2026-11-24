// Атомы и молекулы: README + превью. code — JSX, должен определить `view`.
const G_ATOMS = 'Атомы';
const G_MOL = 'Молекулы';

export const ATOMS = [
  {
    name: 'Logo', group: G_ATOMS, height: 360, width: 1400,
    readme: `
Логотип «ВЭБ Технологии» копируется из фирменных файлов без изменений: шестиугольный знак и надпись «vebtech».

## Варианты
- \`variant="color"\` — основной: знак \`brand\` и надпись \`ink\`. На \`surface\`, \`brand-50\`, \`brand-100\`.
- \`variant="white"\` — белый, для тёмных фото с подложкой и небольших синих элементов. Фоном слайда синий не используется.
- \`variant="mark"\` / \`"mark-white"\` — только знак. Если надпись уже есть рядом, для аватарки, фавикона, водяного знака.

## Правила
- Высота на слайде: 64px на титульном и финальном слайде, 32px в футере. Меньше 32px не используйте.
- Охранное поле — не меньше половины высоты знака со всех сторон.
- Не перекрашивайте, не растягивайте, не добавляйте тени и обводки. Не ставьте на фотографию без светлой подложки.
- Логотип стоит в левом верхнем углу (титульный слайд) или в футере слева. В других местах не повторяйте.

## Пропсы
\`variant\` ('color' | 'white' | 'mark' | 'mark-white'), \`height\` (px, по умолчанию 48), \`title\` (текст для скринридера).
`,
    code: `
const view = (
  <div style={{ display: 'flex', gap: 48, alignItems: 'stretch' }}>
    <div style={{ flex: 1, padding: 64, borderRadius: 24, boxShadow: 'inset 0 0 0 2px var(--line)', display: 'flex', flexDirection: 'column', gap: 48 }}>
      <Logo height={72} />
      <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}><Logo variant="mark" height={96} /><Logo height={32} /></div>
    </div>
    <div style={{ flex: 1, padding: 64, borderRadius: 24, background: 'var(--brand)', display: 'flex', flexDirection: 'column', gap: 48 }}>
      <Logo variant="white" height={72} />
      <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}><Logo variant="mark-white" height={96} /><Logo variant="white" height={32} /></div>
    </div>
  </div>
);`,
  },
  {
    name: 'Icon', group: G_ATOMS, height: 900, width: 1600,
    readme: `
Иконки из библиотеки Lucide: линейные, контур 2px, скруглённые концы. В бандл встроена 81 иконка, которые чаще всего нужны в презентациях.

## Правила
- Размеры: 24px (в бейджах и строках), 32–40px (списки, callout), 48px (карточки), 64–96px (акцентные).
- Толщина контура 2 (по умолчанию). В бейджах и статусах — 2.25. Не заливайте иконки.
- Цвет — \`brand-strong\` на светлых подложках (\`brand-100\`, \`surface\`), \`on-brand\` на \`brand\`. Смысловые иконки статусов — \`success\` / \`warning\` / \`danger\`.
- Иконка в квадрате-подложке: \`brand-100\` с радиусом \`radius-md\` (см. IconFeature).
- Иконка не заменяет слово: рядом всегда подпись. Эмодзи в презентациях не используются.
- Нужна иконка, которой нет в бандле, — возьмите её на lucide.dev (SVG, 24×24, stroke 2) и вставьте как SVG-файл с тем же цветом. Список встроенных имён: \`Webtech.iconNames\`.

## Пропсы
\`name\`, \`size\` (48), \`strokeWidth\` (2), \`color\` (currentColor), \`title\` — если иконка несёт смысл без подписи.
`,
    code: `
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '28px 16px' }}>
    {W.iconNames.map((n) => (
      <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--brand-strong)' }}>
        <Icon name={n} size={48} />
        <span data-allow-small style={{ font: '500 16px/20px var(--font-sans)', color: 'var(--ink-muted)', textAlign: 'center', wordBreak: 'break-all' }}>{n}</span>
      </div>
    ))}
  </div>
);`,
  },
  {
    name: 'Heading', group: G_ATOMS, height: 520, width: 1600,
    readme: `
Заголовки: \`display\` (96), \`h1\` (64), \`h2\` (48), \`h3\` (36). Все набраны Manrope, насыщенность 700–800, цвет \`ink\`.

## Правила
- \`display\` — только титульный и разделительный слайды.
- \`h1\` — заголовок слайда, один на слайд. Пишите вывод, а не тему: «Выручка выросла на 32%» вместо «Выручка».
- Не больше двух строк. Без точки в конце. Заглавная только первая буква и имена собственные.
- Не выделяйте часть заголовка цветом — акцент делает \`brand\` в цифрах и графиках.

## Пропсы
\`level\` ('display' | 'h1' | 'h2' | 'h3'), \`as\` (тег), \`tone\` ('ink' | 'secondary' | 'brand' | 'onbrand').
`,
    code: `
const view = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <Heading level="display">Стратегия 2027</Heading>
    <Heading level="h1">Выручка выросла на 32% за год</Heading>
    <Heading level="h2">Ключевые результаты квартала</Heading>
    <Heading level="h3">Запуск платформы данных</Heading>
  </div>
);`,
  },
  {
    name: 'Text', group: G_ATOMS, height: 440, width: 1600,
    readme: `
Текстовые стили: \`lead\` (32), \`body\` (28), \`caption\` (24 — минимальный размер в системе).

## Правила
- Основной текст — \`body\` цветом \`ink\`. Пояснения — \`ink-secondary\`. Источники и сноски — \`caption\` цветом \`ink-muted\`.
- Мельче 24px на слайде ничего не набирается: при печати на A4 это ≈10,5pt.
- Блок основного текста — до 6 строк и до ~70 знаков в строке. Длиннее — разбейте на список или перенесите в заметки докладчика.
- Выравнивание по левому краю. По ширине и по центру (кроме подписей под иконками) не выравниваем.
- Кавычки «ёлочки», тире — длинное (—), числа с неразрывным пробелом: 1 250 тыс. BYN.

## Пропсы
\`variant\` ('lead' | 'body' | 'body-strong' | 'caption'), \`tone\` ('ink' | 'secondary' | 'muted' | 'brand' | 'onbrand'), \`as\`.
`,
    code: `
const view = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1300 }}>
    <Text variant="lead">Рост обеспечен новыми B2B-клиентами и запуском облачной платформы</Text>
    <Text>Внедрили CI/CD и сократили релизный цикл с двух недель до двух дней. Команда разработки выросла до 120 человек.</Text>
    <Text variant="body-strong">Срок реализации — 3 месяца</Text>
    <Text variant="caption">Источник: управленческая отчётность ВЭБ Технологии, 2026</Text>
  </div>
);`,
  },
  {
    name: 'Overline', group: G_ATOMS, height: 200, width: 1200,
    readme: `
Надзаголовок над заголовком слайда: название раздела или тип слайда. 24px, 700, заглавными с разрядкой 0,08em, цвет \`brand-strong\`.

## Правила
- Одно–три слова: «ФИНАНСЫ», «КЕЙС», «ДОРОЖНАЯ КАРТА».
- Не дублируйте в нём заголовок. На \`brand\`-фоне — \`tone="onbrand"\`.
`,
    code: `
const view = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Overline>Финансовые результаты</Overline>
    <Heading level="h1">Выручка выросла на 32%</Heading>
  </div>
);`,
  },
  {
    name: 'Badge', group: G_ATOMS, height: 380, width: 1400,
    readme: `
Бейдж — короткая метка: тег, категория, «Новое», «Пилот». Высота 48px, текст 24px/700, скругление \`radius-pill\`.

## Тона
- \`brand\` — текст \`brand-strong\` на \`brand-100\` (4.8:1). \`solid\` — белый на \`brand-strong\` (5.6:1).
- \`accent\` — «смотри сюда»: «Рекомендуем», «Новое», «Главное». Текст \`ink\` на \`accent-50\` с бирюзовой рамкой (14.9:1), \`solid\` — \`on-accent\` на \`accent\` (7.1:1). Не больше одного акцентного бейджа на слайд.
- \`neutral\` — \`ink-secondary\` на \`surface\` с обводкой \`line\`.
- \`success\`, \`warning\`, \`danger\`, \`info\` (с 1.15.0) — автоматически с иконкой. Текст — \`X-strong\` на \`X-soft\`, иконка — сигнальный \`X\` (у warning — охра \`warning-mark\`). \`solid\`: белый текст на \`success\`/\`danger\`/\`info-strong\`, \`ink\` на янтарном \`warning\`. Для статусов проекта используйте **Status**.

## Правила
- 1–2 слова, без точки. На слайде не больше 3–4 бейджей.
- \`icon\` — имя иконки Lucide; \`icon={false}\` убирает иконку у статусных тонов.
`,
    code: `
const view = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <Badge>Облако</Badge><Badge icon="rocket">Новое</Badge><Badge solid>Пилот</Badge><Badge tone="accent" icon="star">Рекомендуем</Badge><Badge tone="accent" solid>Главное</Badge><Badge tone="neutral">B2B</Badge>
    </div>
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <Badge tone="success">В срок</Badge><Badge tone="warning">Риск</Badge><Badge tone="danger">Просрочено</Badge><Badge tone="info">В работе</Badge>
    </div>
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <Badge tone="success" solid>Запущено</Badge><Badge tone="warning" solid>Внимание</Badge><Badge tone="danger" solid>Стоп</Badge>
    </div>
  </div>
);`,
  },
  {
    name: 'Divider', group: G_ATOMS, height: 260, width: 1200,
    readme: `
Разделитель: линия 2px \`line\` (декоративная) или \`line-strong\` (смысловая). \`accent\` — короткая полоса 96×8 цвета \`brand\` над заголовком или цифрой.

## Правила
- Отделяйте блоки прежде всего отступами. Разделитель — когда отступа недостаточно (таблица, список контактов).
- Вертикальный вариант — \`vertical\` внутри flex-строки.
`,
    code: `
const view = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
    <Divider accent />
    <Divider />
    <Divider strong />
    <div style={{ display: 'flex', gap: 32, height: 64, alignItems: 'center' }}><Text>Минск</Text><Divider vertical /><Text>Гомель</Text></div>
  </div>
);`,
  },
  {
    name: 'Hexagon', group: G_ATOMS, height: 320, width: 1400,
    readme: `
Шестиугольник — фирменный мотив, взятый из знака логотипа (точный контур). Используется как узел таймлайна, маркер списка, подложка иконки и в декоративных кластерах (HexCluster).

## Тона
\`brand\`, \`accent\` (бирюза — текущая веха, акцентная ячейка сот), \`strong\`, \`deep\`, \`tint\` (\`brand-100\`), \`soft\` (\`brand-200\`), \`outline\` (обводка \`line-strong\`), \`white\`.

## Правила
- Декоративные кластеры — только на титульном, разделительном и финальном слайдах. На контентных слайдах шестиугольник — функциональный элемент (узел, маркер).
- Внутрь кладите иконку (\`on-brand\` на \`brand\`) или цифру до 2 знаков. Текст — нет.
- Не поворачивайте и не деформируйте.

## Фото в сотах
- Фактура — фото в маске по контуру знака: \`texture\` = имя из \`Webtech.textures\` (\`facade\`, \`circuit\`, \`server\`, \`fiber\`, \`ceiling\`, \`code\`, \`lights\`, \`cables\`, \`glass\`, \`grid\`, \`tunnel\`) или URL своего изображения.
- Только дуотон в фирменной гамме (тени \`brand-900\` → середина \`brand\` → света \`brand-100\`): фото работает как фактура, а не как отдельная картинка, и не спорит с палитрой. Свои фото готовьте тем же скриптом \`src/gen-textures.mjs\`.
- Сюжет — реальная предметная съёмка: архитектура, электроника, серверы, оптоволокно. Без людей, 3D-рендеров и нейросетевых «абстракций».
- Только в декоративных кластерах титула, раздела и финала: на разделе и финале — не больше 2 фото-ячеек, на обложке — по композиции \`TitleSlide\` (до 4). На контентных слайдах — нет: там фото отвлекает от данных.
- Текст и иконки поверх фото-ячейки не ставятся.
`,
    code: `
const view = (
  <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
    <Hexagon size={160} tone="brand"><Icon name="rocket" size={64} color="var(--on-brand)" /></Hexagon>
    <Hexagon size={160} tone="accent"><Icon name="shield-check" size={64} color="var(--on-brand)" /></Hexagon>
    <Hexagon size={160} tone="tint"><Icon name="users" size={64} color="var(--brand-strong)" /></Hexagon>
    <Hexagon size={160} texture="circuit" />
    <Hexagon size={160} texture="facade" /><Hexagon size={160} tone="outline" />
    <Hexagon size={48} tone="brand" /><Hexagon size={32} tone="brand" /><Hexagon size={20} tone="brand" />
  </div>
);`,
  },
  {
    name: 'Bullet', group: G_ATOMS, height: 200, width: 1200,
    readme: `
Маркер элемента списка. Используется внутри BulletList и NestedList.

## Варианты
- \`hex\` (по умолчанию) — фирменный шестиугольник 20px.
- \`number\` — номер на \`brand-100\`, для последовательности шагов.
- \`dot\` — точка \`brand\`, для второстепенных и нейтральных списков.
- \`check\` / \`cross\` — «есть / нет», «плюсы / минусы». Цвет \`success\` / \`danger\` — только вместе с текстом пункта.
`,
    code: `
const view = (
  <div style={{ display: 'flex', gap: 64, alignItems: 'center' }}>
    <Bullet /><Bullet variant="number" index={1} /><Bullet variant="number" index={12} /><Bullet variant="dot" /><Bullet variant="check" /><Bullet variant="cross" />
  </div>
);`,
  },
  {
    name: 'LegendSwatch', group: G_ATOMS, height: 180, width: 1200,
    readme: `
Образец цвета серии с подписью — атом легенды. Форма повторяет форму метки на графике: \`square\` для столбцов и областей, \`line\` для линий, \`circle\` для точек.

Цвет — токен \`chart-N\` в порядке серий. Подпись — \`ink-secondary\`, не цвет серии.
`,
    code: `
const view = (
  <div style={{ display: 'flex', gap: 48 }}>
    <LegendSwatch color="var(--chart-1)" label="Факт" />
    <LegendSwatch color="var(--chart-2)" shape="line" label="План" />
    <LegendSwatch color="var(--chart-3)" shape="circle" label="Партнёры" />
    <LegendSwatch color="var(--chart-other)" label="Прочее" />
  </div>
);`,
  },
  {
    name: 'Avatar', group: G_ATOMS, height: 280, width: 1200,
    readme: `
Аватар сотрудника: круглое фото или инициалы (\`brand-strong\` на \`brand-100\`, 4.8:1).

## Правила
- Фото — портрет на светлом нейтральном фоне, лицо по центру, одинаковый кадр у всех людей на слайде.
- Нет фото — передайте только \`name\`, появятся инициалы. Не смешивайте фото и инициалы на одном слайде без необходимости.
- Фото-примеры для шаблонов и черновиков: \`Webtech.samplePeople\` (4 человека: имя, роль, фото) и \`Webtech.samplePhoto('Мария Козлова')\`. Это образцы — в реальной презентации замените их фото настоящих сотрудников. Файлы — в группе ассетов People.
- Стиль фото как у образцов: портрет по плечи, нейтральный серый фон, чёрно-белое или приглушённое, взгляд в камеру, квадрат от 400px.
- Размеры: 184 (TeamSlide до 4 человек), 144 (до 8), 96–120 (оргструктура, контакты).
`,
    code: `
const view = (
  <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
    {W.samplePeople.map((p, i) => <Avatar key={p.name} name={p.name} src={p.photo} size={[184, 144, 120, 96][i]} />)}
    <Avatar name="Ольга Васильева" size={120} />
  </div>
);`,
  },
  {
    name: 'PageNumber', group: G_ATOMS, height: 140, width: 1000,
    readme: `
Номер слайда в футере: текущий номер \`ink\` 700, общее количество \`ink-muted\`. Двузначный формат: 03 / 18. Слайд Deck проставляет номера автоматически.
`,
    code: `const view = <div style={{ display: 'flex', gap: 64 }}><PageNumber page={3} total={18} /><PageNumber page={12} /></div>;`,
  },

  /* ------------------ Молекулы ------------------ */
  {
    name: 'KpiCard', group: G_MOL, height: 460, width: 1920,
    readme: `
Карточка ключевого показателя: цифра, единица, подпись, изменение с иконкой тренда.

## Варианты
- \`variant\`: \`tint\` (\`brand-50\`, по умолчанию), \`brand\` (\`brand-strong\` с белым текстом — одна карточка на слайд, главная), \`outline\` (белая с рамкой \`line\`), \`plain\` (без подложки).
- \`size\`: \`md\` (цифра 72px) или \`lg\` (120px, одна главная цифра на слайде).

## Правила
- Цифра — только число, единица — отдельно в \`unit\` («млн BYN», «%», «чел.»).
- \`delta\` — изменение со знаком: «+12% к 2025», «−3 п. п.». Стрелка показывает направление: по знаку («+» вверх, «−» вниз) или явно через \`trend\` ('up' | 'down' | 'flat'). Цвет показывает оценку: \`sentiment\` ('good' | 'bad' | 'neutral'); по умолчанию рост — \`success\`, падение — \`danger\`.
- Если направление и оценка расходятся (затраты и отток снижаются — это хорошо), задайте оба: \`trend="down" sentiment="good"\`. Текст без знака («выше SLA», «в среднем») — без стрелки и в нейтральном цвете; зелёную стрелку роста без роста не ставим.
- 3–4 карточки на слайд. Подпись — до 2 строк.
- Иконка всегда на плашке: белой на \`tint\` и \`brand\`, светло-голубой (\`brand-50\`) на \`outline\` и \`plain\`.
`,
    code: `
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
    <KpiCard variant="brand" value="48" unit="млн BYN" label="Выручка 2026" delta="+32% к 2025" icon="wallet" />
    <KpiCard value="126" label="Корпоративных клиентов" delta="+18" icon="building" />
    <KpiCard variant="outline" value="99,95" unit="%" label="Доступность сервисов (SLA)" delta="0,02 п. п." trend="flat" icon="gauge" />
    <KpiCard value="9" unit="дней" label="Средний срок внедрения" delta="−40%" trend="down" sentiment="good" note="Меньше — лучше" icon="clock" />
  </div>
);`,
  },
  {
    name: 'IconFeature', group: G_MOL, height: 420, width: 1920,
    readme: `
Иконка в подложке + заголовок + короткий текст. Для преимуществ, направлений, принципов.

## Правила
- 3–4 элемента в ряд (\`layout="vertical"\`) или 2–4 строки в колонке (\`layout="horizontal"\`).
- Заголовок — 2–4 слова (\`h3\`), текст — до 3 строк.
- Иконки в ряду — одного стиля и смысла, не декоративные.
`,
    code: `
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64 }}>
    <IconFeature icon="shield-check" title="Надёжность">Отказоустойчивая архитектура и SLA 99,95%</IconFeature>
    <IconFeature icon="zap" title="Скорость">Запуск пилота за 4 недели на готовых модулях</IconFeature>
    <IconFeature icon="handshake" title="Партнёрство">Выделенная команда и прозрачная отчётность</IconFeature>
  </div>
);`,
  },
  {
    name: 'Quote', group: G_MOL, height: 460, width: 1600,
    readme: `
Цитата: иконка кавычек \`brand\`, текст 40px (\`size="md"\`) или 56px (\`size="lg"\`, для QuoteSlide), автор и должность.

## Правила
- До 30 слов. Цитата реальная, с согласованием автора.
- Кавычки в тексте не ставьте — их роль играет иконка.
`,
    code: `
const view = (
  <Quote author="Ольга Васильева" role="Директор по цифровой трансформации, клиент">
    Команда Вэбтех запустила платформу за три месяца — на полгода быстрее нашего внутреннего плана.
  </Quote>
);`,
  },
  {
    name: 'Callout', group: G_MOL, height: 460, width: 1600,
    readme: `
Плашка-акцент: вывод, важное примечание, предупреждение. Иконка + заголовок + текст на светлой подложке соответствующего тона.

## Тона
\`accent\` (главный вывод, цель — одна на слайд; бирюзовая подложка \`accent-50\`, иконка \`ink\` на плашке \`accent\`), \`brand\` (идея, примечание — белая карточка с рамкой \`line\`), \`info\`, \`success\` (результат), \`warning\` (риск), \`danger\` (проблема, блокер).

## Правила
- Одна плашка на слайд. Не используйте как контейнер для списка — только для одной мысли.
- Без цветной полосы слева: тон передаётся фоном и иконкой.
`,
    code: `
const view = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <Callout tone="accent" title="Главный вывод">Облачные продукты дают 45% выручки и растут вдвое быстрее рынка</Callout>
    <Callout tone="warning" title="Риск">Сроки поставки оборудования сдвигаются на 3–4 недели</Callout>
  </div>
);`,
  },
  {
    name: 'Card', group: G_MOL, height: 420, width: 1920, source: 'reviews/2026-09-24-plan-fact.md', since: '1.9.0', status: 'beta',
    readme: `
Карточка с шапкой: иконка, заголовок, справа единицы или мета. Контейнер для дашбордов (PlanFactCard, панель пояснений в DashboardSlide).

## Пропсы
\`tone\`, \`icon\`, \`overline\` (роль над заголовком: «Заказчик», «Поставщик» — с 1.10.0), \`title\`, \`meta\` (единицы, период), \`children\`.

## Тона
- \`outline\` (по умолчанию) — белая с рамкой \`line\`, как Callout \`brand\` и колонки ComparisonSlide. При печати рамка — \`line-strong\`.
- \`tint\` — \`brand-50\`.
- \`warning\`, \`danger\`, \`success\` — ещё светлее \`*-soft\` (55% тона + 45% белого): крупная панель не превращается в цветную заливку. Для пояснений к отклонениям. Иконка — в цвете статуса, заголовок называет суть («Причины недополучения выручки»): статус — это цвет, иконка и слово.

## Правила
- Без цветных полос сбоку и сплошных заливок: тон передаёт светлый фон и иконка.
- Одна карточка статусного тона на слайд.
`,
    code: `
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
    <Card title="Выручка" meta="тыс. BYN"><Text variant="body" tone="secondary">Белая карточка с рамкой line — основа дашборда.</Text></Card>
    <Card tone="tint" icon="target" title="Цель квартала"><Text variant="body" tone="secondary">Тинт brand-50 — одна область на слайд.</Text></Card>
    <Card tone="warning" icon="triangle-alert" title="Причины отклонения"><Text variant="body" tone="secondary">Пояснение к недовыполнению плана.</Text></Card>
  </div>
);`,
  },
  {
    name: 'MeterList', group: G_MOL, height: 560, width: 1920, source: 'reviews/2026-09-24-plan-fact.md', since: '1.9.0', status: 'beta',
    readme: `
Строки «подпись — полоса — значение» на общей шкале: план и факт, ресурсы, лимиты. Длины полос сравнимы между строками.

## Пропсы
- \`items=[{ label, value, display?, caption?, color? }]\`: \`display\` — готовая строка значения («16,9%»), \`caption\` — подпись под полосой (24px \`ink-muted\`).
- \`max\` — конец шкалы, по умолчанию наибольшее значение.
- \`layout\`: \`split\` (по умолчанию: подпись и значение в строку, полоса под ними — для узких карточек) или \`inline\` (подпись | полоса | значение — для широких).
- \`valueHeader\` — заголовок колонки значений («Ставка»).
- \`base\` (true): первая строка — сравнительная база \`chart-other\` (план), следующие — \`chart-1\`, \`chart-2\`… Без базы — сразу \`chart-1…\`.
- \`format\` — форматирование чисел (по умолчанию \`fmt\`, ru-BY).

## Правила
- Одна шкала на список. Разные единицы (тыс. BYN и %) — разные списки.
- Не больше 4 строк. Зелёный и красный не используются: оценку даёт статус рядом (PlanFactCard), а не цвет полосы.
- Трек — \`chart-diverging-mid\`, полоса 14px со скруглёнными концами, значения — 700 с табличными цифрами.
`,
    code: `
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96 }}>
    <MeterList items={[{ label: 'План', value: 11304.8 }, { label: 'Факт', value: 10146.3 }, { label: 'Отчётность', value: 10412.5 }]} format={(v) => W.fmt(v, { digits: 1, minDigits: 1 })} />
    <MeterList valueHeader="Ставка" items={[
      { label: 'Ресурсный план', value: 18.25, display: '18,25', caption: '8 908,25 ч/ч · 769 095,24 BYN' },
      { label: 'Выделенный ресурс', value: 5.08, display: '5,08', caption: '2 526,47 ч/ч · 272 690,31 BYN' },
      { label: 'Использовано', value: 2.96, display: '2,96', caption: '1 441,50 ч/ч · 155 868,11 BYN' },
    ]} />
  </div>
);`,
  },
  {
    name: 'PlanFactCard', group: G_MOL, height: 520, width: 1920, source: 'reviews/2026-09-24-plan-fact.md', since: '1.9.0', status: 'beta',
    readme: `
Карточка выполнения плана: процент выполнения (факт / план) крупной цифрой, статус, название показателя и полосы «План — Факт — …» на общей шкале. Устроена как KpiCard: сначала цифра, под ней подпись.

## Пропсы
- \`title\`, \`unit\` («тыс. BYN», «%»), \`plan\`, \`fact\`, \`rows=[{ label, value, display? }]\` — дополнительные строки (например, «Отчётность»).
- \`better\`: \`higher\` (по умолчанию: выручка, прибыль, рентабельность) или \`lower\` (затраты, сроки, отток).
- \`status\`, \`statusLabel\`, \`percent\` — ручная замена автоматических значений. \`labels={{ plan, fact }}\` — свои подписи («Бюджет», «Прогноз»). \`format\`, \`tone\` (как у Card: по умолчанию \`outline\` — белая с рамкой; \`tint\` — голубая, для одной главной карточки), \`icon\` (на плашке слева от процента).

## Процент и статус
Процент всегда **факт / план** — одна формула для всех карточек. Хорошо это или плохо, говорит статус (цвет + иконка + слово):
- \`higher\`: ≥ 100% — «План выполнен», 95–99% — «Близко к плану», < 95% — «Ниже плана»;
- \`lower\`: ≤ 100% — «В бюджете», > 100% — «Перерасход».

## Правила
- План — серая база \`chart-other\`, факт — \`chart-1\`, дополнительные строки — \`chart-2\`… Полосы не красятся в зелёный или красный.
- 2–6 карточек на слайд (DashboardSlide). Пояснения к отклонениям — рядом, в Card статусного тона.
- Все карточки белые (\`outline\`). Голубая (\`tone="tint"\`) — только одна: показатель, о котором говорит заголовок слайда. Голубой тинт — у одной области на слайде.
`,
    code: `
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
    <PlanFactCard title="Выручка" tone="tint" unit="тыс. BYN" plan={11304.8} fact={10146.3} rows={[{ label: 'Отчётность', value: 10412.5 }]} />
    <PlanFactCard title="Чистая прибыль" unit="тыс. BYN" plan={623.3} fact={1330.9} rows={[{ label: 'Отчётность', value: 1647.3 }]} />
    <PlanFactCard title="Операционные затраты" unit="тыс. BYN" better="lower" plan={9674.6} fact={8650} rows={[{ label: 'Отчётность', value: 8599.8 }]} />
  </div>
);`,
  },
  {
    name: 'FactList', group: G_MOL, height: 420, width: 1920, source: 'reviews/2026-09-24-presale-case.md', since: '1.10.0', status: 'beta',
    readme: `
Паспорт в 2–4 фактах: иконка, подпись-надзаголовок и значение. «Масштаб — Средний», «Бюджет — ≈ 1,6 млн», «Срок — 6 месяцев». Для условий проекта, паспорта сделки, карточки клиента.

## Пропсы
\`items=[{ icon, label, value }]\`, \`layout\`: \`row\` (в строку с разделителями \`line\`) или \`column\` (столбиком — для узкой карточки).

## Правила
- Значение — коротко: число с единицей или одно слово. Нужен рост или сравнение — KpiCard.
- Иконка на подложке \`brand-50\` (на тинтовой карточке — белой), цвет \`brand-strong\`.
`,
    code: `
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 48, alignItems: 'start' }}>
    <FactList items={[{ icon: 'gauge', label: 'Масштаб', value: 'Средний' }, { icon: 'wallet', label: 'Бюджет', value: '≈ 1,6 млн' }, { icon: 'calendar', label: 'Срок', value: '6 месяцев' }]} />
    <Card tone="tint" title="Объём типового проекта"><FactList layout="column" items={[{ icon: 'gauge', label: 'Масштаб', value: 'Средний' }, { icon: 'wallet', label: 'Бюджет', value: '≈ 1,6 млн' }, { icon: 'calendar', label: 'Срок', value: '6 месяцев' }]} /></Card>
  </div>
);`,
  },
  {
    name: 'Legend', group: G_MOL, height: 160, width: 1400,
    readme: `
Легенда графика: ряд LegendSwatch. Графики с 2+ сериями рисуют её автоматически над областью построения.

Порядок элементов = порядок серий = порядок токенов \`chart-1…6\`. При 1 серии легенда не нужна — серию называет заголовок графика.
`,
    code: `const view = <Legend items={[{ label: '2025' }, { label: '2026' }, { label: 'План 2027', shape: 'line' }]} />;`,
  },
  {
    name: 'ChartHeader', group: G_MOL, height: 200, width: 1400,
    readme: `
Шапка графика: что показано (32px, 700) и единицы измерения (\`caption\`, \`ink-muted\`). Вывод пишется в заголовке слайда, а не здесь.
`,
    code: `const view = <ChartHeader title="Выручка по направлениям" subtitle="2022–2026" unit="млн BYN" />;`,
  },
  {
    name: 'Source', group: G_MOL, height: 120, width: 1400,
    readme: `
Источник данных и сноски под графиком или таблицей: \`caption\`, \`ink-muted\`. Обязателен для внешних данных и прогнозов.
`,
    code: `const view = <Source>Источник: данные компании; прогноз — оценка ВЭБ Технологии, сентябрь 2026</Source>;`,
  },
  {
    name: 'SlideHeader', group: G_MOL, height: 360, width: 1920,
    readme: `
Шапка контентного слайда: надзаголовок (Overline), заголовок \`h1\`, подзаголовок \`lead\`. Справа можно поставить \`aside\`: легенду, бейдж, переключатель периода.

## Правила
- Заголовок — вывод слайда. Подзаголовок — одно предложение контекста.
- Между шапкой и контентом — 56px (задаёт Slide).
`,
    code: `
const view = (
  <SlideHeader overline="Финансы" title="Выручка выросла на 32% за год" lead="Рост обеспечен облачными продуктами и новыми B2B-клиентами" aside={<Badge tone="success">Выше плана</Badge>} />
);`,
  },
  {
    name: 'SlideFooter', group: G_MOL, height: 200, width: 1920, pad: 0,
    css: '#root{position:relative;height:200px}',
    readme: `
Футер слайда: логотип 32px, название раздела, пометка «Конфиденциально», номер слайда. Стоит в нижнем поле (48px от края) — Slide добавляет его сам.

## Правила
- \`section\` — короткое название раздела (1–3 слова).
- \`confidential\` — \`true\` или свой текст («Для служебного пользования»).
- На титульном и финальном слайдах футер отключается (\`footer={false}\`).
`,
    code: `const view = <SlideFooter section="Итоги года" confidential page={4} total={18} />;`,
  },
  {
    name: 'TimelineStep', group: G_MOL, height: 320, width: 1400,
    readme: `
Отдельная веха: дата, шестиугольник-узел, заголовок, пояснение. Статус: \`done\` (заливка \`brand\`), \`current\` (\`brand-strong\`), \`planned\` (контур). Собирается в Timeline — используйте его для ряда вех.
`,
    code: `
const view = (
  <div style={{ display: 'flex', gap: 64 }}>
    <TimelineStep date="Март 2026" title="Пилот" status="done">Два филиала</TimelineStep>
    <TimelineStep date="Сентябрь 2026" title="Тиражирование" status="current">12 регионов</TimelineStep>
    <TimelineStep date="2027" title="Вся сеть" status="planned">Полный переход</TimelineStep>
  </div>
);`,
  },
];
