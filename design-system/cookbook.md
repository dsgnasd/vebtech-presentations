# Сборник рецептов: графики, схемы, слайды

Собирается из `src/specs` командой `node build.mjs`, вручную не править. Что выбрать — `src/docs/70-visuals.md`; пропсы и правила — `project/components/<Имя>/README.md`. В `deck.jsx` массив `slides` собирается из слайдов, `const view` и `const s` не нужны: берите сам элемент.

## Содержание
- [Графики](#графики)
- [Схемы](#схемы)
- [Цифры и акценты](#цифры-и-акценты)
- [Слайды целиком](#слайды-целиком)

## Графики

### BarChart
Столбчатая (`orientation="vertical"`) или линейчатая (`"horizontal"`) диаграмма: сравнение величин по категориям. С `series` — сгруппированные столбцы.
```jsx
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96 }}>
    <BarChart width={820} height={560} highlight="2026" data={[{ label: '2022', value: 14 }, { label: '2023', value: 21 }, { label: '2024', value: 29 }, { label: '2025', value: 36 }, { label: '2026', value: 48 }]} title="Выручка, млн BYN" />
    <BarChart width={820} height={560} orientation="horizontal" data={[{ label: 'Банки', value: 42 }, { label: 'Ритейл', value: 27 }, { label: 'Госсектор', value: 16 }, { label: 'Телеком', value: 9 }, { label: 'Прочее', value: 6 }]} format={(v) => v + '%'} title="Доля выручки по отраслям" />
  </div>
);
```

### StackedBar
Накопительная диаграмма: из чего складывается итог. `percent` — нормированная на 100% (структура).
```jsx
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96 }}>
    <StackedBar width={820} height={560} categories={['2023', '2024', '2025', '2026']} series={[{ name: 'Облако', values: [6, 11, 15, 22] }, { name: 'Интеграция', values: [9, 11, 13, 16] }, { name: 'Поддержка', values: [6, 7, 8, 10] }]} title="Выручка по направлениям, млн BYN" />
    <StackedBar width={820} height={560} orientation="horizontal" percent categories={['Минск', 'Брест', 'Гомель', 'Гродно']} series={[{ name: 'Новые', values: [30, 42, 55, 60] }, { name: 'Действующие', values: [70, 58, 45, 40] }]} title="Структура клиентов по городам, %" />
  </div>
);
```

### LineChart
Линейный график: динамика во времени, 1–4 серии. Последнее значение каждой серии подписано справа от линии.
```jsx
const view = (
  <LineChart width={1720} height={560} categories={['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен']} series={[
    { name: 'Факт 2026', values: [3.1, 3.32, 3.55, 3.48, 3.9, 4.2, 4.45, 4.7, 5.05] },
    { name: 'План 2026', values: [3, 3.2, 3.4, 3.6, 3.8, 4, 4.2, 4.4, 4.6], dashed: true },
    { name: '2025', values: [2.4, 2.5, 2.62, 2.7, 2.81, 2.9, 3, 3.05, 3.18] },
  ]} title="Выручка по месяцам, млн BYN" />
);
```

### AreaChart
Диаграмма с областями: объём во времени. `stacked` — накопительная (состав итога во времени).
```jsx
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96 }}>
    <AreaChart width={820} height={520} categories={['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2', 'Q3']} series={[{ name: 'Активные пользователи', values: [120, 150, 170, 210, 260, 300, 355] }]} title="Активные пользователи, тыс." />
    <AreaChart stacked width={820} height={520} categories={['2021', '2022', '2023', '2024', '2025', '2026']} series={[{ name: 'Банки', values: [5, 7, 9, 12, 15, 20] }, { name: 'Ритейл', values: [2, 3, 5, 8, 10, 13] }, { name: 'Госсектор', values: [1, 2, 3, 4, 6, 8] }]} title="Выручка по отраслям, млн BYN" />
  </div>
);
```

### DonutChart
Кольцевая диаграмма: доли целого, 2–6 частей. В центре — итог или главная доля. Легенда справа (`legend="right"`) или снизу (`"bottom"`) с процентами.
```jsx
const view = (
  <DonutChart size={520} centerValue="48" centerLabel="млн BYN выручки" data={[
    { label: 'Облачные сервисы', value: 45 }, { label: 'Интеграция', value: 33 }, { label: 'Поддержка', value: 17 }, { label: 'Прочее', value: 5, color: 'var(--chart-other)' },
  ]} title="Структура выручки 2026" />
);
```

### Waterfall
Каскадная диаграмма: как из начального значения получилось итоговое. Итоги — `brand-deep`, рост — `chart-1`, снижение — `chart-other` (нейтральный) со знаком «−»: снижение не должно выглядеть акцентом.
```jsx
const view = (
  <Waterfall width={1720} height={560} steps={[
    { label: 'EBITDA 2025', value: 12, total: true }, { label: 'Новые клиенты', value: 6 }, { label: 'Рост тарифов', value: 3 },
    { label: 'ФОТ', value: -4 }, { label: 'Инфраструктура', value: -2 }, { label: 'EBITDA 2026', total: true },
  ]} format={(v) => W.fmt(v)} title="EBITDA, млн BYN" />
);
```

### ComboChart
Столбцы + линия на **одной оси**: факт и план, выручка и целевой уровень. Столбцы — `chart-1`, линия — `chart-2` пунктиром.
```jsx
const view = (
  <ComboChart width={1720} height={560} categories={['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026']} bars={{ name: 'Факт', values: [8, 9, 10, 11, 11.5, 13] }} line={{ name: 'План', values: [8.5, 9, 9.5, 10.5, 12, 12.5] }} title="Выручка, млн BYN" />
);
```

### BreakdownBar
Из чего складывается одна сумма: полоса 100% из частей, под ней легенда со значениями и долями, внизу итог. Для «структуры отклонения», «из чего состоит долг», «куда ушёл бюджет».
```jsx
const view = (
  <div style={{ width: 720 }}>
    <BreakdownBar title="Объём неоплаченных работ" totalLabel="Объём неоплаченных работ" items={[{ label: 'Не завершено работ', value: 855016.5 }, { label: 'Не принято завершённых работ', value: 260722 }, { label: 'Простой ИИ-ресурса', value: 116822.2 }]} />
  </div>
);
```

### MeterList
Строки «подпись — полоса — значение» на общей шкале: план и факт, ресурсы, лимиты. Длины полос сравнимы между строками.
```jsx
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96 }}>
    <MeterList items={[{ label: 'План', value: 11304.8 }, { label: 'Факт', value: 10146.3 }, { label: 'Отчётность', value: 10412.5 }]} format={(v) => W.fmt(v, { digits: 1, minDigits: 1 })} />
    <MeterList valueHeader="Ставка" items={[
      { label: 'Ресурсный план', value: 18.25, display: '18,25', caption: '8 908,25 ч/ч · 769 095,24 BYN' },
      { label: 'Выделенный ресурс', value: 5.08, display: '5,08', caption: '2 526,47 ч/ч · 272 690,31 BYN' },
      { label: 'Использовано', value: 2.96, display: '2,96', caption: '1 441,50 ч/ч · 155 868,11 BYN' },
    ]} />
  </div>
);
```

### PlanFactCard
Карточка выполнения плана: процент выполнения (факт / план) крупной цифрой, статус, название показателя и полосы «План — Факт — …» на общей шкале. Устроена как KpiCard: сначала цифра, под ней подпись.
```jsx
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
    <PlanFactCard title="Выручка" tone="tint" unit="тыс. BYN" plan={11304.8} fact={10146.3} rows={[{ label: 'Отчётность', value: 10412.5 }]} />
    <PlanFactCard title="Чистая прибыль" unit="тыс. BYN" plan={623.3} fact={1330.9} rows={[{ label: 'Отчётность', value: 1647.3 }]} />
    <PlanFactCard title="Операционные затраты" unit="тыс. BYN" better="lower" plan={9674.6} fact={8650} rows={[{ label: 'Отчётность', value: 8599.8 }]} />
  </div>
);
```

### Funnel
Воронка: этапы с убывающим количеством и конверсией между этапами. Цвета — порядковая шкала одного синего тона от `brand-400` к `brand-900`: порядок этапов читается по светлоте.
```jsx
const view = (
  <Funnel width={1400} stages={[{ label: 'Лиды', value: 2400 }, { label: 'Квалификация', value: 960 }, { label: 'Пилот', value: 310 }, { label: 'Договор', value: 124 }, { label: 'Продление', value: 98 }]} />
);
```

### Sparkline
Мини-график тренда без осей: внутри KPI-карточки или строки таблицы. Точка на последнем значении. Цвет — `chart-1`; для падающей метрики, где падение хорошо, остаётся тот же цвет, оценку передаёт подпись.
```jsx
const view = (
  <div style={{ display: 'flex', gap: 64, alignItems: 'center' }}>
    <Sparkline values={[12, 14, 13, 17, 19, 18, 22, 25]} title="Рост выручки" />
    <Sparkline values={[40, 38, 35, 36, 30, 28, 24]} width={320} height={80} title="Снижение оттока" />
  </div>
);
```

## Схемы

### ProcessFlow
Процесс из 3–5 шагов слева направо: номер, иконка, заголовок, пояснение, стрелки между шагами.
```jsx
const view = (
  <ProcessFlow steps={[
    { icon: 'search', title: 'Аудит', text: 'Анализ процессов и ИТ-ландшафта, 2 недели' },
    { icon: 'layers', title: 'Проектирование', text: 'Целевая архитектура и план миграции' },
    { icon: 'code', title: 'Разработка', text: 'Итерации по 2 недели с демо' },
    { icon: 'rocket', title: 'Запуск', text: 'Пилот, обучение, тиражирование' },
  ]} />
);
```

### Cycle
Цикл: замкнутый повторяющийся процесс из 3–6 шагов (PDCA, цикл поставки, жизненный цикл клиента). Шаги — шестиугольники `brand` с иконкой, стрелки по окружности `brand-200`.
```jsx
const view = (
  <Cycle size={720} center="Цикл улучшений" steps={[
    { title: 'Планирование', icon: 'clipboard-list' }, { title: 'Разработка', icon: 'code' }, { title: 'Проверка', icon: 'list-checks' }, { title: 'Внедрение', icon: 'rocket' }, { title: 'Обратная связь', icon: 'message-square' },
  ]} />
);
```

### Timeline
Горизонтальный таймлайн: 3–7 вех по порядку. Пройденный участок линии — `brand`, будущий — `line`. Текущая веха — бирюзовый узел `accent` и плашка «Сейчас» на `accent` с текстом `on-accent` (`ink`, 7.1:1).
```jsx
const view = (
  <Timeline items={[
    { date: '2019', title: 'Основание компании', text: 'Команда из 12 инженеров', status: 'done' },
    { date: '2021', title: 'Первый банк-клиент', text: 'Платформа ДБО', status: 'done' },
    { date: '2023', title: 'Облачная платформа', text: 'Собственные ЦОД', status: 'done' },
    { date: '2026', title: '100+ клиентов', text: 'Выход в регионы', status: 'current' },
    { date: '2028', title: 'Лидер рынка', text: 'Топ-3 в сегменте', status: 'planned' },
  ]} />
);
```

### VerticalTimeline
Вертикальная хронология: дата слева, узел-шестиугольник, событие справа. Для истории компании, хронологии инцидента, плана на несколько кварталов.
```jsx
const view = (
  <VerticalTimeline items={[
    { date: '10:05', title: 'Зафиксирован рост задержек', text: 'Мониторинг, автоматический алерт' },
    { date: '10:12', title: 'Локализована причина', text: 'Переполнение очереди в сервисе платежей' },
    { date: '10:40', title: 'Сервис восстановлен', text: 'Переключение на резервный кластер', status: 'current' },
    { date: '12 окт', title: 'Разбор инцидента', text: 'Постмортем и план мер', status: 'planned' },
  ]} />
);
```

### PhaseTimeline
Помесячная шкала длинного процесса: месяцы окрашены по состоянию (работа / ожидание), события с датами сверху, именованные этапы снизу. Для истории сделки, presale, проекта длиной 6–36 месяцев.
```jsx
const view = (
  <PhaseTimeline start="2024-08" end="2026-06" title="Presale ML-платформы, 23 месяца"
    spans={[{ from: '2025-02', to: '2025-09', tone: 'waiting' }, { from: '2025-12', to: '2026-01', tone: 'waiting' }, { from: '2026-03', to: '2026-04', tone: 'waiting' }, { from: '2026-06', to: '2026-06', tone: 'waiting' }]}
    milestones={[
      { date: '2025-01-28', label: 'Архитектура решения' }, { date: '2025-03-04', label: 'КП на предпроект' }, { date: '2025-04-01', label: 'Запрос эксперта на предпроект' },
      { date: '2025-12-10', label: 'План проекта и спецификация на ЧТЗ' }, { date: '2026-02-02', label: 'Спецификация на ЧТЗ · поставщик Б', tone: 'accent' },
      { date: '2026-02-27', label: 'ЧТЗ на ML-платформу' }, { date: '2026-05-07', dateLabel: '07.05 и 22.05', label: 'КП на ML-платформу' },
    ]}
    phases={[
      { start: '2024-08-12', end: '2024-09-03', label: 'Технические встречи' }, { start: '2024-09-03', end: '2025-01-28', label: 'Исследование' },
      { start: '2025-10-01', end: '2025-12-10', label: 'Предпроект' }, { start: '2026-02-02', end: '2026-02-27', label: 'Разработка ЧТЗ' }, { start: '2026-04-30', end: '2026-05-22', label: 'Маркет. исследование' },
    ]}
    legend={[{ tone: 'work', label: 'Работа по проекту' }, { tone: 'waiting', label: 'Ожидание решения банка' }]} />
);
```

### Roadmap
Дорожная карта / диаграмма Ганта: дорожки (направления) × периоды (кварталы, месяцы). Отметка «Сегодня» — пунктир `accent` с плашкой `accent` и текстом `on-accent` (не `danger`: время — не ошибка; светлая бирюза со статусом не путается).
```jsx
const view = (
  <Roadmap periods={['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027']} today={2.6} lanes={[
    { name: 'Платформа', items: [{ start: 0, end: 2, label: 'Ядро и API', status: 'done' }, { start: 2, end: 4, label: 'Масштабирование', status: 'progress' }] },
    { name: 'Продукты', items: [{ start: 1, end: 3, label: 'Мобильное приложение', status: 'progress' }, { start: 3.2, end: 6, label: 'Маркетплейс', status: 'planned' }] },
    { name: 'Интеграции', items: [{ start: 1.5, end: 3.4, label: 'Биллинг', status: 'risk' }, { start: 3.6, end: 5, label: '1С и ERP', status: 'planned' }] },
    { name: 'Выход в регионы', items: [{ start: 0, end: 1, label: 'Пилот', status: 'done' }, { start: 4, end: 6, label: '12 регионов', status: 'planned' }] },
  ]} />
);
```

### Pyramid
Пирамида или слои: иерархия (`variant="pyramid"`, вершина — самое важное) или архитектурные уровни (`variant="layers"`, равные полосы).
```jsx
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
    <Pyramid width={820} levels={[{ title: 'Миссия' }, { title: 'Стратегические цели' }, { title: 'Ключевые инициативы' }, { title: 'Операционные процессы' }]} />
    <Pyramid width={820} variant="layers" levels={[{ title: 'Каналы', text: 'Веб, мобильное, API' }, { title: 'Сервисы', text: 'Микросервисы, шина' }, { title: 'Данные', text: 'DWH, озеро данных' }, { title: 'Инфраструктура', text: 'Облако, Kubernetes' }]} />
  </div>
);
```

### Matrix2x2
Матрица 2×2: приоритизация по двум осям (ценность × сложность, влияние × вероятность). Правый верхний квадрант — акцентный (`accent-50`), его элементы (`accent: true`) — бирюзовые шестиугольники.
```jsx
const view = (
  <Matrix2x2 size={640} xLabel="Ценность для бизнеса" yLabel="Готовность" quadrants={['Быстрые победы', 'Делаем сейчас', 'Отложить', 'Подготовить']} items={[
    { label: 'Чат-бот поддержки', x: 0.72, y: 0.8, accent: true }, { label: 'Единый профиль', x: 0.86, y: 0.6, accent: true },
    { label: 'BI-отчёты', x: 0.6, y: 0.3 }, { label: 'Редизайн сайта', x: 0.2, y: 0.7 }, { label: 'Миграция CRM', x: 0.3, y: 0.25 },
  ]} />
);
```

### OrgChart
Оргструктура: руководитель и 2–5 прямых подчинённых, под каждым — список команд.
```jsx
const view = (
  <OrgChart root={{ name: 'Алексей Орлов', role: 'Генеральный директор', photo: W.samplePhoto('Алексей Орлов') }} children={[
    { name: 'Мария Козлова', role: 'Технический директор', photo: W.samplePhoto('Мария Козлова'), team: ['Платформа', 'Разработка', 'SRE'] },
    { name: 'Илья Петров', role: 'Коммерческий директор', photo: W.samplePhoto('Илья Петров'), team: ['Продажи', 'Партнёры'] },
    { name: 'Анна Смирнова', role: 'Директор по продукту', photo: W.samplePhoto('Анна Смирнова'), team: ['Продукт', 'Дизайн', 'Аналитика'] },
  ]} />
);
```

### StatusTable
Статус-таблица «светофор»: направление, статус (Status), прогресс (ProgressBar), комментарий. Главный слайд статус-отчёта по проекту.
```jsx
const view = (
  <StatusTable rows={[
    { name: 'Архитектура', status: 'done', progress: 100, note: 'Согласована с ИБ' },
    { name: 'Разработка', status: 'ok', statusLabel: 'По графику', progress: 64, note: 'Спринт 8 из 12' },
    { name: 'Интеграции', status: 'risk', progress: 35, note: 'Ждём API биллинга, нужен эскалационный звонок' },
    { name: 'Инфраструктура', status: 'blocked', progress: 20, note: 'Поставка серверов сдвинута на 4 недели' },
    { name: 'Обучение', status: 'planned', note: 'Старт в ноябре' },
  ]} />
);
```

### ComparisonTable
Сравнительная таблица: возможности × варианты (тарифы, конкуренты, решения). `true` — галочка `success`, `false` — прочерк `ink-muted`, строка — текст. Рекомендуемый вариант (`highlight`) выделен шапкой `accent` с текстом `on-accent` и фоном `accent-50`.
```jsx
const view = (
  <ComparisonTable options={['Базовый', 'Бизнес', 'Корпоративный']} highlight={1} features={[
    { name: 'Пользователей', values: ['до 50', 'до 500', 'без ограничений'] },
    { name: 'SLA', values: ['99,5%', '99,9%', '99,95%'] },
    { name: 'Выделенный менеджер', values: [false, true, true] },
    { name: 'Размещение в контуре заказчика', values: [false, false, true] },
    { name: 'Поддержка 24/7', values: [false, true, true] },
  ]} />
);
```

## Цифры и акценты

### KpiCard
Карточка ключевого показателя: цифра, единица, подпись, изменение с иконкой тренда.
```jsx
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
    <KpiCard variant="brand" value="48" unit="млн BYN" label="Выручка 2026" delta="+32% к 2025" icon="wallet" />
    <KpiCard value="126" label="Корпоративных клиентов" delta="+18" icon="building" />
    <KpiCard variant="outline" value="99,95" unit="%" label="Доступность сервисов (SLA)" delta="0,02 п. п." trend="flat" icon="gauge" />
    <KpiCard value="9" unit="дней" label="Средний срок внедрения" delta="−40%" trend="down" sentiment="good" note="Меньше — лучше" icon="clock" />
  </div>
);
```

### FactList
Паспорт в 2–4 фактах: иконка, подпись-надзаголовок и значение. «Масштаб — Средний», «Бюджет — ≈ 1,6 млн», «Срок — 6 месяцев». Для условий проекта, паспорта сделки, карточки клиента.
```jsx
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 48, alignItems: 'start' }}>
    <FactList items={[{ icon: 'gauge', label: 'Масштаб', value: 'Средний' }, { icon: 'wallet', label: 'Бюджет', value: '≈ 1,6 млн' }, { icon: 'calendar', label: 'Срок', value: '6 месяцев' }]} />
    <Card tone="tint" title="Объём типового проекта"><FactList layout="column" items={[{ icon: 'gauge', label: 'Масштаб', value: 'Средний' }, { icon: 'wallet', label: 'Бюджет', value: '≈ 1,6 млн' }, { icon: 'calendar', label: 'Срок', value: '6 месяцев' }]} /></Card>
  </div>
);
```

### ProgressBar
Прогресс выполнения: подпись, процент и полоса 16px на `brand-100`. Цвет заполнения следует статусу (`status`): по умолчанию `brand`, при `progress` — `info`, при `risk` — янтарный `warning`, при `blocked` — `danger`, при `done` — `success`, при `planned`/`paused` — `neutral`.
```jsx
const view = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
    <ProgressBar label="Миграция данных" value={70} />
    <ProgressBar label="Обучение пользователей" value={100} status="done" />
    <ProgressBar label="Интеграция с биллингом" value={35} status="risk" />
    <ProgressBar label="Сертификация" value={10} status="blocked" />
  </div>
);
```

### Callout
Плашка-акцент: вывод, важное примечание, предупреждение. Иконка + заголовок + текст на светлой подложке соответствующего тона.
```jsx
const view = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <Callout tone="accent" title="Главный вывод">Облачные продукты дают 45% выручки и растут вдвое быстрее рынка</Callout>
    <Callout tone="warning" title="Риск">Сроки поставки оборудования сдвигаются на 3–4 недели</Callout>
  </div>
);
```

### IconFeature
Иконка в подложке + заголовок + короткий текст. Для преимуществ, направлений, принципов.
```jsx
const view = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64 }}>
    <IconFeature icon="shield-check" title="Надёжность">Отказоустойчивая архитектура и SLA 99,95%</IconFeature>
    <IconFeature icon="zap" title="Скорость">Запуск пилота за 4 недели на готовых модулях</IconFeature>
    <IconFeature icon="handshake" title="Партнёрство">Выделенная команда и прозрачная отчётность</IconFeature>
  </div>
);
```

## Слайды целиком

### ChartSlide
График + вывод. Слева — график с заголовком, единицами и источником, справа — панель `accent-50` 560px: главный вывод (`takeaway`, 36px `ink` под бирюзовой полосой) и 2–3 пояснения. Без `takeaway` и `points` график занимает всю ширину.
```jsx
const s = <ChartSlide overline="Финансы" title="Выручка удвоилась за три года" chartTitle="Выручка" chartSubtitle="млн BYN" chart={<BarChart width={1080} height={480} highlight="2026" data={[{ label: '2022', value: 14 }, { label: '2023', value: 21 }, { label: '2024', value: 29 }, { label: '2025', value: 36 }, { label: '2026', value: 48 }]} />} takeaway="+32% в 2026 году — выше рынка в 2 раза" points={['Облачные сервисы — 45% выручки', '18 новых корпоративных клиентов']} source="Источник: управленческая отчётность" section="Финансы" page={7} total={24} />;
const view = s;
```

### GridSlide
Сетка блоков (bento): 2–4 разных компонента на одном слайде — график, KPI, карточки, таблица, цитата, вывод. Для плотных рабочих слайдов, где один компонент на слайд — слишком мало.
```jsx
const s = <GridSlide overline="Главное" meta="Итоги 2026" title="Выручка программы выросла на 32% — лучший год" layout="feature-left" section="Главное" page={3} total={14}
  cells={[
    <Card title="Выручка по кварталам" meta="млн BYN"><BarChart width={900} height={500} highlight={7} data={[{ label: 'I 25', value: 8.2 }, { label: 'II 25', value: 8.9 }, { label: 'III 25', value: 9.1 }, { label: 'IV 25', value: 10.2 }, { label: 'I 26', value: 10.8 }, { label: 'II 26', value: 11.6 }, { label: 'III 26', value: 12.1 }, { label: 'IV 26', value: 13.5 }]} format={(v) => W.fmt(v, { digits: 1, minDigits: 1 })} /></Card>,
    <KpiCard variant="brand" value="48" unit="млн BYN" label="Выручка за 2026 год" delta="+32% к 2025" />,
    <Card icon="target" title="Цели года"><MeterList max={120} base={false} items={[{ label: 'Выручка', value: 104, display: '104%', color: 'var(--chart-1)' }, { label: 'Новые клиенты', value: 112, display: '112%', color: 'var(--chart-1)' }, { label: 'Автоматизация обращений', value: 86, display: '86%', color: 'var(--chart-other)' }]} /></Card>,
  ]} source="Управленческая отчётность, данные на 30.11.2026" />;
const view = s;
```

### DashboardSlide
Дашборд «план / факт»: сетка карточек показателей и панель пояснений справа. Фон белый, карточки — Card `outline` с рамкой `line`.
```jsx
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
  ]} />;
const view = s;
```

### ProcessSlide
Процесс: ProcessFlow, Cycle, Funnel или Pyramid в `process`, по центру свободной области. `note` — пояснение внизу (например, Callout).
```jsx
const s = <ProcessSlide overline="Как мы работаем" title="Запуск проекта за 12 недель" process={<ProcessFlow steps={[
  { icon: 'search', title: 'Аудит', text: 'Процессы и ИТ-ландшафт, 2 недели' },
  { icon: 'layers', title: 'Проектирование', text: 'Архитектура и план, 2 недели' },
  { icon: 'code', title: 'Разработка', text: 'Спринты по 2 недели, 6 недель' },
  { icon: 'rocket', title: 'Запуск', text: 'Пилот и обучение, 2 недели' },
]} />} note={<Callout tone="success" title="Гарантия сроков">Фиксируем дату запуска в договоре</Callout>} section="Подход" page={11} total={24} />;
const view = s;
```

### TimelineSlide
Слайд с таймлайном: Timeline, VerticalTimeline или PhaseTimeline в `timeline`, по центру свободной области. `note` — вывод под шкалой (Callout), с 1.10.0.
```jsx
const s = <TimelineSlide overline="О компании" title="Семь лет роста" timeline={<Timeline items={[
  { date: '2019', title: 'Основание', text: 'Команда из 12 инженеров', status: 'done' },
  { date: '2021', title: 'Первый банк', text: 'Платформа ДБО', status: 'done' },
  { date: '2023', title: 'Своё облако', text: 'Два ЦОД Tier III', status: 'done' },
  { date: '2026', title: '100+ клиентов', text: 'Выход в регионы', status: 'current' },
  { date: '2028', title: 'Топ-3 рынка', text: 'Стратегическая цель', status: 'planned' },
]} />} section="О компании" page={3} total={24} />;
const view = s;
```

### RoadmapSlide
Дорожная карта: Roadmap в `roadmap` и легенда статусов справа от заголовка (`legend={false}` — без неё).
```jsx
const s = <RoadmapSlide overline="План" title="Дорожная карта на 18 месяцев" roadmap={<Roadmap periods={['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027']} today={2.6} lanes={[
  { name: 'Платформа', items: [{ start: 0, end: 2, label: 'Ядро и API', status: 'done' }, { start: 2, end: 4, label: 'Масштабирование', status: 'progress' }] },
  { name: 'Продукты', items: [{ start: 1, end: 3, label: 'Мобильное приложение', status: 'progress' }, { start: 3.2, end: 6, label: 'Маркетплейс', status: 'planned' }] },
  { name: 'Интеграции', items: [{ start: 1.5, end: 3.4, label: 'Биллинг', status: 'risk' }, { start: 3.6, end: 5, label: '1С и ERP', status: 'planned' }] },
  { name: 'Регионы', items: [{ start: 0, end: 1, label: 'Пилот', status: 'done' }, { start: 4, end: 6, label: '12 регионов', status: 'planned' }] },
]} />} section="План" page={18} total={24} />;
const view = s;
```

### ComparisonSlide
Сравнение 2–3 вариантов или «было — стало». Колонка: `{ title, subtitle?, items, badge?, accent?, marker? }`. `accent` — рекомендуемый вариант: рамка `accent`, фон `accent-50`, бейдж `accent` с текстом `on-accent`, маркеры-галочки.
```jsx
const s = <ComparisonSlide overline="Решение" title="Рекомендуем гибридное размещение" columns={[
  { title: 'Своё ЦОД', subtitle: 'CAPEX 6 млн BYN', items: ['Полный контроль', 'Долгий запуск — 9 месяцев', 'Своя команда эксплуатации'] },
  { title: 'Гибрид', subtitle: 'OPEX 130 тыс. BYN/мес', badge: 'Рекомендуем', accent: true, items: ['Запуск за 6 недель', 'Данные ПДн — в своём контуре', 'Масштабирование по запросу'] },
  { title: 'Публичное облако', subtitle: 'OPEX 100 тыс. BYN/мес', items: ['Быстрый старт', 'Ограничения Закона № 99-З о персональных данных', 'Зависимость от провайдера'] },
]} section="Решение" page={14} total={24} />;
const view = s;
```

### CaseSlide
Кейс в три колонки: задача → решение → результат. Результаты — 2–3 крупные цифры `brand-strong` на светлой подложке `brand-100`.
```jsx
const s = <CaseSlide title="Банк сократил срок выдачи кредита с 3 дней до 2 часов" client="Банк из топ-10 Беларуси, 1,2 млн клиентов" problem="Заявки на кредит обрабатывались вручную в трёх системах, клиенты уходили к конкурентам." solution={['Единая платформа кредитного конвейера', 'Автоматический скоринг и проверки', 'Интеграция с Кредитным регистром и МСИ']} results={[{ value: '2 часа', label: 'вместо 3 дней на решение' }, { value: '+38%', label: 'одобренных заявок онлайн' }]} section="Кейсы" page={17} total={24} />;
const view = s;
```
