// 12 готовых презентаций. code — JSX, определяет массив `slides`.
// Данные в шаблонах — примерные: замените цифры, имена и контакты своими.

const CONTACTS = `[{ icon: 'mail', value: 'name@company.by' }, { icon: 'phone', value: '+375 00 000-00-00' }, { icon: 'globe', value: 'www.company.by' }, { icon: 'map-pin', value: 'Минск, Беларусь' }]`;

export const DECKS = [
  {
    name: 'DeckBasic', file: '01-bazovyj-korporativnyj', title: 'Базовый корпоративный',
    about: 'Универсальная основа на сквозном примере «итоги года и план»: титул, повестка, разделы, плотные слайды GridSlide (график + KPI + цели, три направления + вывод, клиенты 2×2, портфель проектов, приоритеты + таймлайн, бюджет + решения), график с прогнозом, изображение, цитата, финал. Данные вымышленные — замените своими.',
    code: `
const slides = [
  <TitleSlide composition="hero" textures={['circuit', 'glass']} overline="Программа «Цифровой сервис»" title="Итоги 2026 и план на 2027" subtitle="Стратегическая сессия: результаты года, приоритеты и бюджет на утверждение" author="Иван Петров, директор программы" date="15 декабря 2026" />,
  <AgendaSlide items={[{ title: 'Итоги 2026', text: 'Выручка, направления, клиенты', time: '15 мин' }, { title: 'Портфель проектов', text: 'Что в срок и что в риске', time: '10 мин' }, { title: 'Приоритеты 2027', text: 'Три направления роста', time: '15 мин' }, { title: 'Прогноз и бюджет', text: 'Цифры на утверждение', time: '10 мин' }, { title: 'Решения', text: 'Что утверждаем сегодня', time: '10 мин' }]} />,
  <GridSlide overline="Главное" meta="Итоги 2026" title="Выручка программы выросла на 32% — лучший год" layout="feature-left" section="Итоги 2026 и план"
    cells={[
      <Card title="Выручка по кварталам" meta="млн BYN"><BarChart width={900} height={500} highlight={7} data={[{ label: 'I 25', value: 8.2 }, { label: 'II 25', value: 8.9 }, { label: 'III 25', value: 9.1 }, { label: 'IV 25', value: 10.2 }, { label: 'I 26', value: 10.8 }, { label: 'II 26', value: 11.6 }, { label: 'III 26', value: 12.1 }, { label: 'IV 26', value: 13.5 }]} format={(v) => W.fmt(v, { digits: 1, minDigits: 1 })} /></Card>,
      <KpiCard variant="brand" value="48" unit="млн BYN" label="Выручка за 2026 год" delta="+32% к 2025" />,
      <Card icon="target" title="Цели года"><MeterList max={120} base={false} items={[{ label: 'Выручка', value: 104, display: '104%', color: 'var(--chart-1)' }, { label: 'Новые клиенты', value: 112, display: '112%', color: 'var(--chart-1)' }, { label: 'Автоматизация обращений', value: 86, display: '86%', color: 'var(--chart-other)' }]} /></Card>,
    ]} source="Управленческая отчётность, данные на 30.11.2026" />,
  <SectionSlide number={1} title="Итоги 2026" subtitle="Направления, клиенты и портфель проектов" />,
  <GridSlide overline="Итоги 2026" title="Три направления дали 91% прироста выручки" layout="bottom-3" section="Итоги 2026 и план"
    cells={[
      <Card icon="cloud" overline="Направление 1" title="Облачный сервис"><KpiCard variant="plain" value="+6,2" unit="млн BYN" label="прирост выручки" /><BulletList size="sm" items={['38 новых клиентов', 'Переход на подписку', 'Площадка в Минске загружена на 85%']} /></Card>,
      <Card icon="headset" overline="Направление 2" title="Центр поддержки"><KpiCard variant="plain" value="+3,1" unit="млн BYN" label="прирост выручки" /><BulletList size="sm" items={['Работа 24/7 в 4 областях', 'Ответ за 2 минуты', '94% обращений решены с первого раза']} /></Card>,
      <Card icon="workflow" overline="Направление 3" title="Автоматизация"><KpiCard variant="plain" value="+1,3" unit="млн BYN" label="прирост выручки" /><BulletList size="sm" items={['Боты в 12 процессах', '−18% ручных операций', 'Окупаемость — 7 месяцев']} /></Card>,
      <Callout tone="accent" title="Вывод">Рост дают сервисы по подписке: в 2027 году вкладываем в облако и поддержку, автоматизацию развиваем внутри них</Callout>,
    ]} />,
  <GridSlide overline="Клиенты" title="Клиенты довольны, но сроки внедрения — зона риска" layout="2x2" section="Итоги 2026 и план"
    cells={[
      <Card><DonutChart size={250} thickness={48} centerValue="126" centerLabel="клиентов" data={[{ label: 'Ритейл', value: 38 }, { label: 'Банки', value: 27 }, { label: 'Госсектор', value: 21 }, { label: 'Прочее', value: 14 }]} /></Card>,
      <Card tone="tint"><Quote author="Анна Ковалёва" role="ИТ-директор ритейл-сети «Север»">Поддержка отвечает быстрее нашего отдела — даже в выходные</Quote></Card>,
      <Card icon="star" title="NPS по регионам" meta="пункты"><MeterList layout="inline" max={80} base={false} items={[{ label: 'Минск', value: 62, color: 'var(--chart-1)' }, { label: 'Брест', value: 55, color: 'var(--chart-1)' }, { label: 'Гродно', value: 48, color: 'var(--chart-1)' }, { label: 'Гомель', value: 41, color: 'var(--chart-1)' }]} /></Card>,
      <Card tone="warning" icon="triangle-alert" title="Внедрение — 9 недель вместо 6"><Text variant="body" tone="secondary">Узкое место — интеграция с учётными системами клиентов</Text><ProgressBar value={72} label="Проекты, внедрённые в срок" status="warning" /></Card>,
    ]} />,
  <GridSlide overline="Портфель" title="20 из 24 проектов идут по плану" layout="halves" columns="2fr 1fr" section="Итоги 2026 и план"
    cells={[
      <StatusTable rows={[{ name: 'Облако для ритейла', status: 'ok', statusLabel: 'По плану', progress: 80, note: 'Запуск в январе' }, { name: 'Поддержка 24/7', status: 'done', progress: 100, note: 'Работает с июня' }, { name: 'Бот первой линии', status: 'ok', statusLabel: 'По плану', progress: 65, note: '12 процессов из 18' }, { name: 'Интеграция с 1С', status: 'risk', progress: 40, note: 'Задержка на 3 недели' }, { name: 'Личный кабинет', status: 'planned', progress: 0, note: 'Старт в феврале' }]} />,
      <Card icon="briefcase" title="Портфель 2026"><FactList layout="column" items={[{ icon: 'layers', label: 'Проектов', value: '24' }, { icon: 'circle-check', label: 'В срок', value: '20 из 24' }, { icon: 'wallet', label: 'Бюджет', value: '12,4 млн BYN' }, { icon: 'users', label: 'Команда', value: '86 человек' }]} /></Card>,
    ]} />,
  <SectionSlide number={2} title="План на 2027" subtitle="Приоритеты, прогноз и бюджет" />,
  <GridSlide overline="Приоритеты 2027" title="Три приоритета: облако, поддержка, кабинет клиента" layout="bottom-3" section="Итоги 2026 и план"
    cells={[
      <Card icon="cloud" overline="Приоритет 1" title="Облако в регионах"><Text variant="body" tone="secondary">Площадки в Гомеле и Гродно, миграция 40 клиентов</Text><ProgressBar value={20} label="Готовность площадки в Гомеле" /><Badge tone="brand" icon="target" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>Цель: 30 млн BYN</Badge></Card>,
      <Card icon="headset" overline="Приоритет 2" title="Поддержка на ИИ"><Text variant="body" tone="secondary">Бот закрывает простые обращения, люди — сложные</Text><ProgressBar value={35} label="Обращения, закрытые ботом" /><Badge tone="brand" icon="target" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>Цель: 60% обращений</Badge></Card>,
      <Card icon="smartphone" overline="Приоритет 3" title="Кабинет клиента"><Text variant="body" tone="secondary">Заявки, счета и статусы проектов в одном окне</Text><ProgressBar value={10} label="Клиенты в кабинете" /><Badge tone="brand" icon="target" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>Цель: 80% клиентов</Badge></Card>,
      <Timeline items={[{ date: 'I кв.', title: 'Площадка в Гомеле', status: 'current' }, { date: 'II кв.', title: 'Бот во всех каналах' }, { date: 'III кв.', title: 'Кабинет клиента' }, { date: 'IV кв.', title: 'Площадка в Гродно' }]} />,
    ]} />,
  <ChartSlide overline="Прогноз" title="При сохранении темпа выручка 2027 — 62 млн BYN" chartTitle="Выручка программы" chartSubtitle="млн BYN, 2027 — прогноз" chart={<ComboChart width={1080} height={400} categories={['2023', '2024', '2025', '2026', '2027П']} bars={{ name: 'Факт и прогноз', values: [21, 29, 36.4, 48, 62] }} line={{ name: 'План', values: [20, 28, 35, 46, 58] }} format={(v) => W.fmt(v, { digits: 1 })} />} takeaway="+29% в 2027 году" points={['Облако в регионах — +8 млн BYN', 'Кабинет клиента — +3 млн BYN', 'Риск: сроки внедрения']} source="Прогноз программы, базовый сценарий" section="Итоги 2026 и план" />,
  <GridSlide overline="Бюджет" title="Бюджет вырастет на 18%, главная статья — команда" layout="halves" section="Итоги 2026 и план"
    cells={[
      <Card icon="wallet" title="Бюджет 2027" meta="млн BYN"><Text variant="body" tone="secondary">14,6 млн BYN против 12,4 в 2026 году</Text><BreakdownBar totalLabel="Итого" items={[{ label: 'Команда', value: 7.8 }, { label: 'Облако и инфраструктура', value: 3.4 }, { label: 'Лицензии', value: 1.6 }, { label: 'Обучение', value: 0.9 }, { label: 'Маркетинг', value: 0.9 }]} /></Card>,
      <Card tone="tint" icon="list-checks" title="Просим утвердить"><Checklist items={[{ text: 'Бюджет 2027 — 14,6 млн BYN', meta: 'Сегодня' }, { text: 'Найм 24 инженеров', meta: 'Январь' }, { text: 'Площадку в Гомеле', meta: 'I кв.' }, { text: 'Цели по выручке — 62 млн BYN', meta: 'Сегодня' }]} /></Card>,
    ]} />,
  <ImageTextSlide overline="Регионы" title="Офис в Гродно откроется в I квартале" text="40 рабочих мест, смены 24/7, обслуживание клиентов Гродненской и Брестской областей" bullets={['Аренда подписана, ремонт до февраля', 'Набор 32 специалистов — с января', 'Выход на полную нагрузку — апрель']} caption="Визуализация офиса, ул. Советская" section="Итоги 2026 и план" />,
  <QuoteSlide quote="Мы выросли, потому что клиенты платят за результат, а не за часы. В 2027 году делаем то же самое в регионах." author="Иван Петров" role="Директор программы «Цифровой сервис»" photo={null} />,
  <ContactSlide title="Спасибо!" subtitle="Вопросы и обсуждение" person={{ name: 'Иван Петров', role: 'Директор программы' }} contacts={${CONTACTS}} />,
];`,
  },
  {
    name: 'DeckAbout', file: '02-o-kompanii', title: 'О компании Вэбтех',
    about: 'Представление компании: миссия, история, цифры, направления, клиенты, команда и контакты. Для первых встреч с клиентами, партнёрами, кандидатами.',
    code: `
const slides = [
  <TitleSlide composition="hero" textures={['facade']} overline="Презентация компании" title="ВЭБ Технологии" subtitle="Разрабатываем и развиваем цифровые платформы для бизнеса и государства Беларуси" date="2026" />,
  <ContentSlide overline="Кто мы" title="Создаём надёжные цифровые сервисы для крупного бизнеса" lead="Минская ИТ-компания полного цикла: от аудита и проектирования до эксплуатации 24/7" bullets={[{ title: 'Миссия', text: 'Делать сложные технологии простыми и доступными для клиентов' }, { title: 'Подход', text: 'Продуктовые команды, прозрачные сроки, измеримый результат' }, { title: 'Ответственность', text: 'Собственная инфраструктура и соответствие законодательству РБ о защите персональных данных' }]} section="О компании" />,
  <TimelineSlide overline="История" title="Семь лет роста" timeline={<Timeline items={[{ date: '2019', title: 'Основание', text: '12 инженеров', status: 'done' }, { date: '2021', title: 'Первый банк', text: 'Платформа ДБО', status: 'done' }, { date: '2023', title: 'Своё облако', text: 'Два ЦОД Tier III', status: 'done' }, { date: '2026', title: '100+ клиентов', text: 'Все областные центры', status: 'current' }, { date: '2028', title: 'Топ-3 рынка', text: 'Цель стратегии', status: 'planned' }]} />} section="О компании" />,
  <KpiSlide overline="В цифрах" title="Вэбтех сегодня: 680 сотрудников, 126 клиентов, 48 млн BYN" items={[{ value: '680', label: 'Сотрудников', icon: 'users' }, { value: '126', label: 'Корпоративных клиентов', icon: 'building' }, { value: '48', unit: 'млн BYN', label: 'Выручка 2026', icon: 'wallet' }, { value: '99,95', unit: '%', label: 'Доступность сервисов', icon: 'gauge' }]} section="О компании" />,
  <GridSlide overline="География" title="Работаем по всей Беларуси — от Минска до Гомеля" layout="top-3" rows="auto 1fr" section="О компании"
    cells={[
      <Card icon="map-pin" title="Офисы и центры разработки"><FactList items={[{ icon: 'building', label: 'Минск', value: '420 человек' }, { icon: 'code', label: 'Гомель', value: '120 человек' }, { icon: 'code', label: 'Гродно', value: '80 человек' }, { icon: 'headset', label: 'Брест', value: '60 человек' }]} /></Card>,
      <KpiCard variant="outline" icon="users" value="680" label="сотрудников" delta="+22% за год" />,
      <KpiCard variant="outline" icon="server" value="2" label="собственных ЦОД в Минске" note="Tier III, резервирование N+1" />,
      <KpiCard variant="outline" icon="clock" value="24/7" label="поддержка клиентов" note="Ответ за 2 минуты" />,
    ]} />,
  <ContentSlide overline="Направления" title="Четыре направления закрывают весь цикл: от облака до поддержки" section="О компании"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48 }}><IconFeature icon="cloud" title="Облако">IaaS, PaaS и managed-сервисы в своих ЦОД</IconFeature><IconFeature icon="code" title="Разработка">Заказные платформы и мобильные приложения</IconFeature><IconFeature icon="network" title="Интеграция">Связываем системы и данные клиента</IconFeature><IconFeature icon="headset" title="Поддержка">Эксплуатация 24/7 с SLA до 99,95%</IconFeature></div></ContentSlide>,
  <GridSlide overline="Экспертиза" title="Нам доверяют банки и ритейл: сертификаты ISO и отзывы клиентов" layout="2x2" section="О компании"
    cells={[
      <Card icon="award" title="Сертификаты и аттестаты"><BulletList size="sm" marker="check" items={['СТБ ISO/IEC 27001 — защита информации', 'СТБ ISO 9001 — управление качеством', 'Аттестат системы защиты информации', 'Статус резидента Парка высоких технологий']} /></Card>,
      <Card tone="tint"><Quote author="Сергей Жук" role="Директор по ИТ, Банк «Пример»">Запускают в срок и не исчезают после запуска</Quote></Card>,
      <Card icon="chart-bar" title="Проекты по отраслям" meta="% от выручки"><MeterList layout="inline" max={50} base={false} items={[{ label: 'Банки', value: 42, display: '42%', color: 'var(--chart-1)' }, { label: 'Ритейл', value: 28, display: '28%', color: 'var(--chart-1)' }, { label: 'Госсектор', value: 16, display: '16%', color: 'var(--chart-1)' }, { label: 'Телеком', value: 9, display: '9%', color: 'var(--chart-1)' }]} /></Card>,
      <Card icon="trophy" title="Результаты для клиентов"><FactList items={[{ icon: 'rocket', label: 'Проектов', value: '350+' }, { icon: 'refresh-cw', label: 'Клиентов с нами 3+ года', value: '78%' }]} /></Card>,
    ]} />,
  <ChartSlide overline="Клиенты" title="Банки и ритейл — 70% выручки" chartTitle="Выручка по отраслям" chartSubtitle="доля, %" chart={<DonutChart size={500} centerValue="126" centerLabel="клиентов" data={[{ label: 'Банки', value: 42 }, { label: 'Ритейл', value: 28 }, { label: 'Госсектор', value: 16 }, { label: 'Телеком', value: 9 }, { label: 'Прочее', value: 5, color: 'var(--chart-other)' }]} />} takeaway="Работаем с 8 из 10 крупнейших банков Беларуси" section="О компании" />,
  <CaseSlide title="Банк сократил выдачу кредита с 3 дней до 2 часов" client="Банк из топ-10 Беларуси, 1,2 млн клиентов" problem="Заявки обрабатывались вручную в трёх системах, клиенты уходили к конкурентам." solution={['Кредитный конвейер', 'Автоматический скоринг', 'Интеграция с Кредитным регистром']} results={[{ value: '2 часа', label: 'на решение вместо 3 дней' }, { value: '+38%', label: 'одобренных онлайн-заявок' }]} section="О компании" />,
  <TeamSlide overline="Руководство" title="Командой управляют четыре руководителя: технологии, продажи, продукт" people={W.samplePeople} section="О компании" />,
  <ContactSlide title="Давайте работать вместе" subtitle="Расскажем, как мы можем помочь вашему бизнесу" contacts={${CONTACTS}} />,
];`,
  },
  {
    name: 'DeckResults', file: '03-otchet-o-rezultatah', title: 'Отчёт о результатах',
    about: 'Квартальный или годовой отчёт: главные цифры, динамика выручки, план/факт, структура, мост EBITDA, таблица, выводы и планы.',
    code: `
const slides = [
  <TitleSlide composition="column" overline="Отчёт о результатах" title="Итоги II квартала 2026 года" subtitle="Финансовые и операционные показатели" author="Финансовая дирекция" date="Июль 2026" />,
  <KpiSlide overline="Главное" title="Квартал выше плана по всем ключевым метрикам" items={[{ value: '13', unit: 'млн BYN', label: 'Выручка', delta: '+28% г/г', icon: 'wallet' }, { value: '31', unit: '%', label: 'Рентабельность EBITDA', delta: '+3 п. п.', icon: 'percent' }, { value: '9', label: 'Новых клиентов', delta: '+4 к плану', icon: 'handshake' }, { value: '3,1', unit: '%', label: 'Отток клиентов', delta: '−0,8 п. п.', trend: 'down', sentiment: 'good', icon: 'users' }]} source="Управленческая отчётность, данные на 30.06.2026" section="Итоги II квартала" />,
  <DashboardSlide overline="План / факт" title="Выручка выше плана, затраты — с перерасходом" meta="II квартал 2026" cards={[{ title: 'Выручка', unit: 'млн BYN', plan: 12.5, fact: 13 }, { title: 'EBITDA', unit: 'млн BYN', plan: 4, fact: 4.3 }, { title: 'Новые клиенты', unit: 'компаний', plan: 5, fact: 9, format: (v) => String(v) }, { title: 'Операционные затраты', tone: 'tint', unit: 'млн BYN', better: 'lower', plan: 8.5, fact: 8.7 }]} aside={<Card tone="warning" icon="triangle-alert" title="Почему затраты выше плана"><Text variant="body" tone="secondary">Опережающий найм и мощности под запуски III квартала, тыс. BYN:</Text><BreakdownBar totalLabel="Перерасход" format={(v) => W.fmt(v)} items={[{ label: 'Найм инженеров', value: 120 }, { label: 'Облако', value: 60 }, { label: 'Маркетинг', value: 20 }]} /></Card>} section="Итоги II квартала" />,
  <GridSlide overline="Драйверы" meta="II квартал 2026" title="Рост дали облако и девять новых клиентов" layout="feature-left" section="Итоги II квартала"
    cells={[
      <Card title="Прирост выручки по направлениям" meta="млн BYN"><BarChart orientation="horizontal" width={900} height={420} highlight={0} data={[{ label: 'Облачные сервисы', value: 1.6 }, { label: 'Интеграция', value: 0.6 }, { label: 'Поддержка', value: 0.3 }, { label: 'Консалтинг', value: 0.1 }]} format={(v) => W.fmt(v, { digits: 1, minDigits: 1 })} /></Card>,
      <KpiCard variant="brand" value="9" label="новых клиентов за квартал" delta="+4 к плану" />,
      <Card icon="gauge" title="Загрузка команд"><MeterList max={100} base={false} items={[{ label: 'Разработка', value: 92, display: '92%', color: 'var(--chart-1)' }, { label: 'Внедрение', value: 88, display: '88%', color: 'var(--chart-1)' }, { label: 'Поддержка', value: 76, display: '76%', color: 'var(--chart-1)' }]} /></Card>,
    ]} source="Управленческая отчётность, данные на 30.06.2026" />,
  <ChartSlide overline="Выручка" title="Выручка за полтора года выросла с 8 до 13 млн BYN" chartTitle="Выручка" chartSubtitle="млн BYN" chart={<ComboChart width={1080} height={420} categories={['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26', 'Q2 26']} bars={{ name: 'Факт', values: [8, 10, 10, 11, 11.5, 13] }} line={{ name: 'План', values: [8.5, 9, 9.5, 10.5, 12, 12.5] }} />} takeaway="План II квартала перевыполнен на 4%" points={['Драйвер — облачные сервисы', 'Сезонный рост в ритейле']} section="Итоги II квартала" />,
  <ChartSlide overline="Структура" title="Облачные сервисы — уже половина выручки" chartTitle="Выручка по направлениям" chartSubtitle="млн BYN" chart={<StackedBar width={1080} height={420} categories={['Q3 25', 'Q4 25', 'Q1 26', 'Q2 26']} series={[{ name: 'Облако', values: [4.2, 4.8, 5.5, 6.5] }, { name: 'Интеграция', values: [3.6, 3.8, 3.8, 4.2] }, { name: 'Поддержка', values: [2.2, 2.4, 2.2, 2.3] }]} />} takeaway="Доля облака выросла с 42% до 50% за год" section="Итоги II квартала" />,
  <ChartSlide overline="Прибыль" title="EBITDA выросла на 3 млн BYN за счёт новых клиентов" chartTitle="EBITDA, I полугодие" chartSubtitle="млн BYN" chart={<Waterfall width={1720} height={420} steps={[{ label: 'I пол. 2025', value: 5, total: true }, { label: 'Новые клиенты', value: 2.5 }, { label: 'Тарифы', value: 1.2 }, { label: 'ФОТ', value: -0.7 }, { label: 'Инфраструктура', value: -0.5 }, { label: 'I пол. 2026', total: true }]} />} section="Итоги II квартала" />,
  <TableSlide overline="Детализация" title="Все направления выполнили план" table={<DataTable columns={[{ title: 'Направление' }, { title: 'План', align: 'right' }, { title: 'Факт', align: 'right' }, { title: 'Выполнение', align: 'right' }, { title: 'Статус' }]} rows={[['Облачные сервисы', 6.1, 6.5, '107%', <Status status="ok" variant="text" label="Выше плана" />], ['Интеграция', 4.1, 4.2, '102%', <Status status="ok" variant="text" label="В плане" />], ['Поддержка', 2.3, 2.3, '100%', <Status status="ok" variant="text" label="В плане" />], ['Итого, млн BYN', '12,5', '13,0', '104%', '']]} highlightRow={3} />} source="Управленческая отчётность, млн BYN без НДС" section="Итоги II квартала" />,
  <TwoColumnSlide overline="Выводы" title="Пакеты и партнёры сработали, сроки подключения и найм улучшаем" left={{ icon: 'circle-check', title: 'Сработало', bullets: ['Пакетные предложения для ритейла', 'Партнёрский канал: 3 сделки', 'Автоматизация первой линии'], marker: 'check' }} right={{ icon: 'target', title: 'Улучшаем', tint: true, bullets: ['Срок подключения в областях', 'Прогнозирование загрузки ЦОД', 'Скорость найма разработчиков'], marker: 'dot' }} section="Итоги II квартала" />,
  <GridSlide overline="III квартал" title="Три цели III квартала и контрольные точки" layout="top-3" rows="auto 1fr" section="Итоги II квартала"
    cells={[
      <Timeline items={[{ date: 'Июль', title: 'Маркетплейс в пилоте', status: 'current' }, { date: 'Август', title: '4 областных центра' }, { date: 'Сентябрь', title: '14 млн BYN выручки' }]} />,
      <Card icon="shopping-cart" overline="Цель 1" title="Маркетплейс"><ProgressBar value={40} label="Готовность к запуску" /><Badge tone="brand" icon="target" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>6 новых клиентов</Badge></Card>,
      <Card icon="map-pin" overline="Цель 2" title="Регионы"><ProgressBar value={25} label="Офисы в областях" /><Badge tone="brand" icon="target" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>4 областных центра</Badge></Card>,
      <Card icon="users" overline="Цель 3" title="Найм"><ProgressBar value={55} label="Нанято инженеров" /><Badge tone="brand" icon="target" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>40 инженеров</Badge></Card>,
    ]} />,
    <ContactSlide title="Вопросы?" subtitle="Финансовая дирекция" contacts={${CONTACTS}} />,
];`,
  },
  {
    name: 'DeckStrategy', file: '04-strategiya', title: 'Стратегия и цели',
    about: 'Стратегическая сессия: контекст рынка, видение, приоритеты, цели (OKR), приоритизация инициатив, дорожная карта, ресурсы и решения.',
    code: `
const slides = [
  <TitleSlide overline="Стратегическая сессия" title="Стратегия развития 2027–2029" subtitle="Цели, приоритеты и дорожная карта" author="Алексей Орлов, генеральный директор" date="Сентябрь 2026" />,
  <AgendaSlide items={['Контекст рынка', 'Видение 2029', 'Стратегические приоритеты', 'Цели и метрики', 'Дорожная карта', 'Ресурсы и решения']} />,
  <ChartSlide overline="Рынок" title="Рынок корпоративного облака растёт на 25% в год" chartTitle="Объём рынка в Беларуси" chartSubtitle="млн BYN" chart={<LineChart width={1080} height={420} categories={['2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029']} series={[{ name: 'Рынок', values: [120, 150, 190, 240, 300, 375, 470, 590] }]} />} takeaway="Окно возможностей — 2–3 года, пока рынок не консолидирован" source="Оценка компании на основе отраслевых обзоров" section="Стратегия 2027–2029" />,
  <GridSlide overline="Рынок" title="Три тренда работают на нас, одна угроза — против" layout="2x2" section="Стратегия 2027–2029"
    cells={[
      <Card icon="cloud" overline="Тренд 1" title="Переход в облако"><KpiCard variant="plain" value="+25%" label="рост рынка в год" /></Card>,
      <Card icon="shield-check" overline="Тренд 2" title="Требования к защите данных"><KpiCard variant="plain" value="3 из 4" label="компаний выбирают локальные ЦОД" /></Card>,
      <Card icon="sparkles" overline="Тренд 3" title="ИИ в процессах"><KpiCard variant="plain" value="40%" label="крупных компаний пилотируют ИИ" /></Card>,
      <Card tone="warning" icon="triangle-alert" title="Угроза: демпинг глобальных провайдеров"><Text variant="body" tone="secondary">Цены на базовые вычисления снизятся на 15–20%. Отвечаем сервисами поверх инфраструктуры, а не ценой</Text></Card>,
    ]} source="Оценка рынка Вэбтех, 2026" />,
  <SectionSlide number={1} title="Видение 2029" subtitle="Кем мы хотим стать" />,
  <ContentSlide overline="Видение" title="Топ-3 провайдер цифровых платформ для крупного бизнеса" bullets={[{ title: 'Для клиентов', text: 'Надёжный партнёр полного цикла: от идеи до эксплуатации' }, { title: 'Для рынка', text: 'Лидер в отраслевых решениях для банков и ритейла' }, { title: 'Для команды', text: 'Лучшее место для инженеров в Беларуси' }]} aside={<KpiCard variant="brand" size="lg" value="150" unit="млн BYN" label="Выручка 2029" delta="×3 к 2026" trend="up" />} section="Стратегия 2027–2029" />,
  <ProcessSlide overline="Приоритеты" title="Три приоритета: отраслевые продукты, облако и эффективность" process={<Pyramid variant="layers" width={1728} levels={[{ title: 'Отраслевые продукты', text: 'Готовые решения для банков, ритейла, госсектора' }, { title: 'Облачная платформа', text: 'Managed-сервисы, аттестация ОАЦ, 2 новых ЦОД' }, { title: 'Операционная эффективность', text: 'Автоматизация, платформенная разработка' }]} />} section="Стратегия 2027–2029" />,
  <TableSlide overline="Цели" title="К 2027 году: выручка 70 млн BYN, 200 клиентов, NPS 75, EBITDA 33%" table={<DataTable columns={[{ title: 'Цель' }, { title: 'Ключевой результат' }, { title: '2026', align: 'right' }, { title: '2027', align: 'right' }]} rows={[['Рост выручки', 'Выручка, млн BYN', 48, 70], ['Новые клиенты', 'Корпоративных клиентов', 126, 200], ['Качество', 'NPS', 72, 75], ['Эффективность', 'EBITDA, %', 31, 33]]} />} section="Стратегия 2027–2029" />,
  <GridSlide overline="Ресурсы" title="На стратегию нужны 15 млн BYN и 120 новых сотрудников" layout="halves" section="Стратегия 2027–2029"
    cells={[
      <Card icon="wallet" title="Инвестиции 2027–2029" meta="млн BYN"><Text variant="body" tone="secondary">Две трети — в инфраструктуру и продукты</Text><BreakdownBar totalLabel="Итого" items={[{ label: 'Новый ЦОД', value: 6 }, { label: 'Отраслевые продукты', value: 4.5 }, { label: 'Выход в регионы', value: 2.5 }, { label: 'Обучение и найм', value: 2 }]} /></Card>,
      <Card icon="users" title="Найм по направлениям" meta="человек"><MeterList max={50} base={false} items={[{ label: 'Разработка', value: 48, color: 'var(--chart-1)' }, { label: 'Облако и эксплуатация', value: 32, color: 'var(--chart-1)' }, { label: 'Внедрение', value: 24, color: 'var(--chart-1)' }, { label: 'Продажи', value: 16, color: 'var(--chart-1)' }]} /></Card>,
    ]} />,
  <ProcessSlide overline="Инициативы" title="Начинаем с инициатив высокой ценности и готовности" process={<Matrix2x2 size={560} xLabel="Ценность для бизнеса" yLabel="Готовность" quadrants={['Быстрые победы', 'Делаем сейчас', 'Отложить', 'Подготовить']} items={[{ label: 'Отраслевые продукты', x: 0.8, y: 0.78, accent: true }, { label: 'Маркетплейс', x: 0.66, y: 0.62, accent: true }, { label: 'Новые ЦОД', x: 0.82, y: 0.3 }, { label: 'Экспорт ИТ-услуг', x: 0.35, y: 0.2 }, { label: 'Партнёрская сеть', x: 0.3, y: 0.7 }]} />} section="Стратегия 2027–2029" />,
  <RoadmapSlide overline="План" title="За три года: новые продукты, второй ЦОД, регионы и рост команды" roadmap={<Roadmap periods={['2027 H1', '2027 H2', '2028 H1', '2028 H2', '2029 H1', '2029 H2']} lanes={[{ name: 'Продукты', items: [{ start: 0, end: 2, label: 'Банки и ритейл', status: 'planned' }, { start: 2, end: 4, label: 'Госсектор', status: 'planned' }] }, { name: 'Облако', items: [{ start: 0, end: 3, label: 'Второй ЦОД в Минске', status: 'planned' }, { start: 3, end: 6, label: 'ЦОД в Гомеле', status: 'planned' }] }, { name: 'Регионы', items: [{ start: 0, end: 2, label: 'Областные центры', status: 'planned' }, { start: 2, end: 5, label: 'Районные центры', status: 'planned' }] }, { name: 'Команда', items: [{ start: 0, end: 6, label: 'Рост до 1 200 человек', status: 'planned' }] }]} />} section="Стратегия 2027–2029" />,
  <ContentSlide overline="Решения" title="Что просим утвердить сегодня" bullets={['Стратегию 2027–2029 и целевые показатели', 'Инвестиционный бюджет 2027 года — 12 млн BYN', 'Запуск программы отраслевых продуктов с 1 января']} marker="number" aside={<Callout tone="accent" title="Срок">Решения нужны до 15 октября для бюджетного цикла</Callout>} section="Стратегия 2027–2029" />,
  <ContactSlide title="Спасибо!" subtitle="Обсуждение и вопросы" contacts={${CONTACTS}} />,
];`,
  },
  {
    name: 'DeckStatus', file: '05-status-proekta', title: 'Статус проекта',
    about: 'Регулярный статус-отчёт по проекту: общий статус, светофор по направлениям, вехи, чек-лист этапа, дорожная карта, риски и решения, которые нужны от руководства.',
    code: `
const slides = [
  <TitleSlide composition="quiet" overline="Статус-отчёт" title="Проект «Единая платформа клиента»" subtitle="Отчёт № 8 за период 1–15 сентября" author="Мария Козлова, руководитель проекта" date="16 сентября 2026" />,
  <ContentSlide overline="Сводка" title="Проект идёт по графику, есть риск по интеграциям" section="Статус проекта"><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}><KpiCard variant="outline" value="64" unit="%" label="Готовность проекта" delta="+8 п. п. за период" /><KpiCard variant="outline" value="92" unit="%" label="Освоение бюджета к плану" delta="В рамках бюджета" trend="flat" /><KpiCard variant="outline" value="1" label="Критичный риск" delta="Интеграция с биллингом" trend="down" /></div><div style={{ marginTop: 48, display: 'flex', gap: 24, alignItems: 'center' }}><Status status="risk" variant="large" label="Общий статус: риск по срокам интеграций" /></div></ContentSlide>,
  <GridSlide overline="Сводка" meta="Неделя 38" title="Сроки держим, бюджет в норме, один риск" layout="2x2" section="Статус проекта"
    cells={[
      <Card icon="clipboard-list" title="Паспорт проекта"><FactList items={[{ icon: 'calendar', label: 'Запуск', value: '1 декабря' }, { icon: 'wallet', label: 'Бюджет', value: '2,4 млн BYN' }, { icon: 'users', label: 'Команда', value: '34 человека' }]} /></Card>,
      <Card icon="gauge" title="Готовность по этапам"><MeterList max={100} base={false} layout="inline" items={[{ label: 'Аналитика', value: 100, display: '100%', color: 'var(--chart-1)' }, { label: 'Разработка', value: 64, display: '64%', color: 'var(--chart-1)' }, { label: 'Интеграции', value: 35, display: '35%', color: 'var(--chart-1)' }, { label: 'Тестирование', value: 10, display: '10%', color: 'var(--chart-1)' }]} /></Card>,
      <Card tone="warning" icon="triangle-alert" title="Риск: интеграция с биллингом"><Text variant="body" tone="secondary">Поставщик сдвинул API на 3 недели. Резерв по срокам — 2 недели</Text></Card>,
      <Card tone="tint" icon="list-checks" title="На этой неделе"><Checklist items={[{ text: 'Согласовать тестовый стенд', status: 'done' }, { text: 'Эскалация по API биллинга', status: 'progress' }, { text: 'План нагрузочного теста', status: 'todo' }]} /></Card>,
    ]} />,
  <TableSlide overline="Светофор" title="В срок идут два направления из пяти, риск и блокер — у интеграций и серверов" table={<StatusTable rows={[{ name: 'Архитектура', status: 'done', progress: 100, note: 'Согласована с ИБ' }, { name: 'Разработка', status: 'ok', statusLabel: 'По графику', progress: 64, note: 'Спринт 8 из 12' }, { name: 'Интеграции', status: 'risk', progress: 35, note: 'Ждём API биллинга' }, { name: 'Инфраструктура', status: 'blocked', progress: 20, note: 'Поставка серверов +4 недели' }, { name: 'Обучение', status: 'planned', note: 'Старт в ноябре' }]} />} section="Статус проекта" />,
  <TimelineSlide overline="Вехи" title="Три из шести вех пройдены" timeline={<Timeline items={[{ date: 'Июнь', title: 'Старт', status: 'done' }, { date: 'Июль', title: 'Архитектура', status: 'done' }, { date: 'Август', title: 'MVP', status: 'done' }, { date: 'Сентябрь', title: 'Интеграции', status: 'current' }, { date: 'Октябрь', title: 'Пилот', status: 'planned' }, { date: 'Декабрь', title: 'Запуск', status: 'planned' }]} />} section="Статус проекта" />,
  <ContentSlide overline="Этап" title="Готовность к пилоту: 2 из 5 пунктов выполнено" section="Статус проекта"><Checklist items={[{ text: 'Согласована целевая архитектура', meta: '12 авг', status: 'done' }, { text: 'Настроены стенды', meta: '30 авг', status: 'done' }, { text: 'Миграция данных из CRM', note: 'Перенесено 70% записей', meta: 'Иванов А.', status: 'progress' }, { text: 'Нагрузочное тестирование', meta: '15 окт', status: 'todo' }, { text: 'Интеграция с биллингом', note: 'Нет доступа к API партнёра', meta: 'Блокер', status: 'blocked' }]} /></ContentSlide>,
  <RoadmapSlide overline="План" title="Пилот зависит от двух рисковых работ: биллинга и продакшена" roadmap={<Roadmap periods={['Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']} today={3.5} lanes={[{ name: 'Разработка', items: [{ start: 0, end: 3, label: 'MVP', status: 'done' }, { start: 3, end: 5, label: 'Доработки', status: 'progress' }] }, { name: 'Интеграции', items: [{ start: 2, end: 4.6, label: 'Биллинг', status: 'risk' }, { start: 4.6, end: 6, label: 'ERP', status: 'planned' }] }, { name: 'Инфраструктура', items: [{ start: 1, end: 3, label: 'Стенды', status: 'done' }, { start: 3, end: 5, label: 'Прод', status: 'risk' }] }, { name: 'Запуск', items: [{ start: 4, end: 5, label: 'Пилот', status: 'planned' }, { start: 5.2, end: 7, label: 'Тираж', status: 'planned' }] }]} />} section="Статус проекта" />,
  <GridSlide overline="Бюджет" title="Бюджет освоен на 58%, прогноз — в рамках" layout="halves" section="Статус проекта"
    cells={[
      <PlanFactCard tone="tint" title="Исполнение плана на дату" unit="тыс. BYN" plan={1450} fact={1392} better="lower" labels={{ plan: 'План на дату', fact: 'Факт' }} rows={[{ label: 'Прогноз на конец', value: 2380 }]} />,
      <Card icon="chart-pie" title="Структура затрат" meta="тыс. BYN"><BreakdownBar totalLabel="Итого" format={(v) => W.fmt(v)} items={[{ label: 'Команда', value: 980 }, { label: 'Лицензии', value: 240 }, { label: 'Инфраструктура', value: 120 }, { label: 'Прочее', value: 52 }]} /></Card>,
    ]} />,
  <TableSlide overline="Риски" title="Один высокий риск и два средних требуют внимания руководства" table={<DataTable columns={[{ title: 'Риск' }, { title: 'Влияние' }, { title: 'Меры' }, { title: 'Владелец' }]} rows={[['Задержка API биллинга', <Status status="blocked" label="Высокое" />, 'Эскалация на уровень CTO партнёра', 'Козлова М.'], ['Поставка серверов', <Status status="risk" label="Среднее" />, 'Временно — облачные мощности', 'Орлов А.'], ['Нагрузка на команду', <Status status="risk" label="Среднее" />, 'Привлечь 2 разработчиков', 'Петров И.']]} />} section="Статус проекта" />,
  <ContentSlide overline="Решения" title="Три решения нужны от управляющего комитета" bullets={['Эскалация по API биллинга до 20 сентября', 'Согласовать временную аренду облачных мощностей — 40 тыс. BYN', 'Утвердить расширение команды на 2 человека']} marker="number" section="Статус проекта" />,
];`,
  },
  {
    name: 'DeckSales', file: '06-kommercheskoe-predlozhenie', title: 'Коммерческое предложение',
    about: 'Продажа решения клиенту: задача клиента, решение, выгоды в цифрах, как работаем, кейс, варианты и цены, команда, следующие шаги.',
    code: `
const slides = [
  <TitleSlide composition="hero" textures={['circuit']} overline="Коммерческое предложение" title="Цифровой кредитный конвейер для Банка «Пример»" subtitle="Решение ВЭБ Технологии" author="Илья Петров, коммерческий директор" date="Сентябрь 2026" />,
  <TwoColumnSlide overline="Задача" title="Банк теряет клиентов: кредит выдаётся слишком долго" left={{ icon: 'triangle-alert', title: 'Сейчас', bullets: ['Решение по заявке — до 3 дней', '40% заявок обрабатывается вручную', 'Данные в трёх несвязанных системах'], marker: 'dot' }} right={{ icon: 'target', title: 'Цель банка', tint: true, bullets: ['Решение за 2 часа', 'Автоматизация 80% заявок', 'Единый профиль клиента'], marker: 'check' }} section="Коммерческое предложение" />,
  <ContentSlide overline="Решение" title="Четыре модуля закрывают весь кредитный процесс под ключ" section="Коммерческое предложение"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48 }}><IconFeature icon="workflow" title="Конвейер">Настраиваемые маршруты заявок без программирования</IconFeature><IconFeature icon="gauge" title="Скоринг">Автоматические проверки и решения</IconFeature><IconFeature icon="network" title="Интеграции">Кредитный регистр, МСИ, АБС банка</IconFeature><IconFeature icon="shield-check" title="Безопасность">Закон № 99-З, требования ОАЦ, размещение в контуре банка</IconFeature></div></ContentSlide>,
  <KpiSlide overline="Выгоды" title="Что получит банк через 6 месяцев" items={[{ value: '2', unit: 'часа', label: 'Решение по заявке вместо 3 дней', icon: 'clock' }, { value: '+38', unit: '%', label: 'Одобренных онлайн-заявок', icon: 'trending-up' }, { value: '−45', unit: '%', label: 'Затрат на обработку заявки', trend: 'up', icon: 'wallet' }]} note="Оценка на основе 4 внедрений в белорусских банках" section="Коммерческое предложение" />,
  <GridSlide overline="Экономика" title="Проект окупится за 9 месяцев" layout="feature-left" section="Коммерческое предложение"
    cells={[
      <Card title="Эффект и затраты нарастающим итогом" meta="тыс. BYN"><LineChart width={900} height={440} categories={['0', '2', '4', '6', '8', '10', '12']} series={[{ name: 'Эффект', values: [0, 60, 180, 340, 520, 720, 940] }, { name: 'Затраты', values: [380, 450, 500, 540, 570, 600, 630], dashed: true }]} format={(v) => W.fmt(v)} /></Card>,
      <KpiCard variant="brand" value="9" unit="мес." label="срок окупаемости" delta="ROI 49% за год" trend="up" />,
      <Card icon="banknote" title="Параметры"><FactList layout="column" items={[{ icon: 'wallet', label: 'Инвестиции', value: '380 тыс. BYN' }, { icon: 'trending-up', label: 'Эффект в год', value: '940 тыс. BYN' }]} /></Card>,
    ]} source="Расчёт на данных банка, базовый сценарий" />,
  <ProcessSlide overline="Как работаем" title="Запуск за 12 недель с фиксированной датой" process={<ProcessFlow steps={[{ icon: 'search', title: 'Аудит', text: 'Процессы и системы, 2 недели' }, { icon: 'layers', title: 'Настройка', text: 'Маршруты и правила, 4 недели' }, { icon: 'network', title: 'Интеграции', text: 'АБС, Кредитный регистр, МСИ, 4 недели' }, { icon: 'rocket', title: 'Запуск', text: 'Пилот и обучение, 2 недели' }]} />} note={<Callout tone="success" title="Фиксированный срок">Дата запуска и этапы прописываются в договоре</Callout>} section="Коммерческое предложение" />,
  <CaseSlide title="Банк: решение за 2 часа вместо 3 дней" client="Банк из топ-10 Беларуси, 1,2 млн клиентов" problem="Ручная обработка заявок и отток клиентов к конкурентам." solution={['Кредитный конвейер', 'Автоматический скоринг', 'Интеграция с Кредитным регистром']} results={[{ value: '2 часа', label: 'на решение' }, { value: '+38%', label: 'онлайн-одобрений' }]} section="Коммерческое предложение" />,
  <TableSlide overline="Варианты" title="Рекомендуем тариф «Бизнес»" table={<ComparisonTable options={['Базовый', 'Бизнес', 'Корпоративный']} highlight={1} features={[{ name: 'Стоимость, тыс. BYN/год', values: ['200', '370', 'от 600'] }, { name: 'Заявок в месяц', values: ['до 20 тыс.', 'до 100 тыс.', 'без ограничений'] }, { name: 'SLA', values: ['99,5%', '99,9%', '99,95%'] }, { name: 'Выделенная команда', values: [false, true, true] }, { name: 'Размещение в контуре банка', values: [false, false, true] }]} />} note="Цены без НДС, лицензия и поддержка включены" section="Коммерческое предложение" />,
  <TeamSlide overline="Команда" title="Проект ведёт команда с опытом 30+ внедрений в банках" people={[{ name: 'Мария Козлова', role: 'Руководитель проекта', text: '30+ внедрений в банках', photo: W.samplePhoto('Мария Козлова') }, { name: 'Илья Петров', role: 'Аккаунт-менеджер', text: 'Точка входа по всем вопросам', photo: W.samplePhoto('Илья Петров') }, { name: 'Анна Смирнова', role: 'Бизнес-аналитик', text: 'Кредитные процессы', photo: W.samplePhoto('Анна Смирнова') }, { name: 'Алексей Орлов', role: 'Архитектор', text: 'Интеграции с АБС', photo: W.samplePhoto('Алексей Орлов') }]} section="Коммерческое предложение" />,
  <GridSlide overline="Почему мы" title="Банки выбирают Вэбтех за опыт, фиксированные сроки и поддержку 24/7" layout="bottom-3" section="Коммерческое предложение"
    cells={[
      <Card icon="building" overline="Опыт" title="40 банковских проектов"><BulletList size="sm" items={['Кредитные конвейеры', 'Дистанционное обслуживание', 'Интеграция с Кредитным регистром']} /></Card>,
      <Card icon="calendar" overline="Сроки" title="12 недель — фиксированно"><BulletList size="sm" items={['Дата запуска в договоре', 'Еженедельные демо', 'Штраф за срыв срока']} /></Card>,
      <Card icon="headset" overline="Поддержка" title="24/7 после запуска"><BulletList size="sm" items={['Ответ за 15 минут', 'Своя команда эксплуатации', 'SLA 99,9%']} /></Card>,
      <Callout tone="accent" title="Гарантия">Если не запустим за 12 недель, следующий месяц поддержки — за наш счёт</Callout>,
    ]} />,
  <ContentSlide overline="Следующие шаги" title="Предлагаем начать с бесплатного аудита" bullets={[{ title: 'До 1 октября', text: 'Встреча с командой кредитования банка' }, { title: 'Октябрь', text: 'Аудит процессов — 2 недели, бесплатно' }, { title: 'Ноябрь', text: 'Договор и старт проекта' }]} marker="number" section="Коммерческое предложение" />,
  <ContactSlide title="Спасибо!" subtitle="Готовы обсудить детали" person={{ name: 'Илья Петров', role: 'Коммерческий директор', photo: W.samplePhoto('Илья Петров') }} contacts={${CONTACTS}} />,
];`,
  },
  {
    name: 'DeckProduct', file: '07-produktovaya', title: 'Продуктовая презентация',
    about: 'Презентация продукта: проблема, продукт, функции, сценарии, интерфейс, метрики, сравнение с альтернативами, дорожная карта продукта.',
    code: `
const slides = [
  <TitleSlide composition="hero" overline="Продукт" title="Вэбтех Облако 3.0" subtitle="Управляемая облачная платформа для корпоративных сервисов" date="Сентябрь 2026" />,
  <ContentSlide overline="Проблема" title="Компании тратят до 40% бюджета ИТ на поддержку инфраструктуры" bullets={['Разрозненные среды разработки и эксплуатации', 'Долгий запуск новых сервисов — 2–3 месяца', 'Сложно выполнить требования ОАЦ и Закона № 99-З']} aside={<KpiCard variant="brand" size="lg" value="40" unit="%" label="Бюджета ИТ уходит на инфраструктуру" />} section="Вэбтех Облако 3.0" />,
  <ImageTextSlide overline="Продукт" title="Всё для запуска сервисов в одной консоли" text="Kubernetes, базы данных, мониторинг и безопасность как сервис" bullets={['Запуск среды за 15 минут', 'Оплата по потреблению', 'Аттестация по требованиям ОАЦ']} caption="Консоль управления, версия 3.0" section="Вэбтех Облако 3.0" />,
  <ContentSlide overline="Возможности" title="Шесть сервисов закрывают запуск и эксплуатацию" section="Вэбтех Облако 3.0"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px 64px' }}><IconFeature layout="horizontal" icon="server" title="Kubernetes">Managed-кластеры с автомасштабированием</IconFeature><IconFeature layout="horizontal" icon="database" title="Базы данных">PostgreSQL, Redis, ClickHouse</IconFeature><IconFeature layout="horizontal" icon="gauge" title="Мониторинг">Метрики, логи и алерты</IconFeature><IconFeature layout="horizontal" icon="shield-check" title="Безопасность">WAF, IAM, шифрование</IconFeature><IconFeature layout="horizontal" icon="git-branch" title="CI/CD">Конвейер от коммита до релиза</IconFeature><IconFeature layout="horizontal" icon="headset" title="Поддержка">Инженеры 24/7</IconFeature></div></ContentSlide>,
  <GridSlide overline="Ценность" title="Одна консоль вместо пяти инструментов" layout="feature-right" section="Вэбтех Облако 3.0"
    cells={[
      <Card icon="x" title="Было"><BulletList size="sm" marker="cross" items={['5 консолей и 3 подрядчика', 'Релиз — раз в месяц', 'Мониторинг вручную']} /></Card>,
      <Card tone="tint" icon="check" title="Стало"><BulletList size="sm" marker="check" items={['Одна консоль и одна команда', 'Релиз — каждый день', 'Алерты и автомасштабирование']} /></Card>,
      <Card title="Время на типовые задачи" meta="минут"><BarChart orientation="horizontal" width={900} height={440} categories={['Развернуть сервис', 'Добавить сервер', 'Выпустить релиз']} series={[{ name: 'Было', values: [240, 120, 180], color: 'var(--chart-other)' }, { name: 'Облако 3.0', values: [15, 5, 20] }]} /></Card>,
    ]} />,
  <ProcessSlide overline="Сценарий" title="От идеи до продакшена за один день" process={<ProcessFlow steps={[{ icon: 'code', title: 'Код', text: 'Разработчик пушит изменения' }, { icon: 'list-checks', title: 'Проверки', text: 'Тесты и сканирование' }, { icon: 'server', title: 'Стенд', text: 'Автоматический деплой' }, { icon: 'rocket', title: 'Релиз', text: 'Канареечный выпуск' }]} />} section="Вэбтех Облако 3.0" />,
  <ChartSlide overline="Метрики" title="Клиенты платформы выпускают релизы в 5 раз чаще" chartTitle="Релизов в месяц на команду" chart={<BarChart width={1080} height={420} orientation="horizontal" highlight="Вэбтех Облако" data={[{ label: 'Вэбтех Облако', value: 42 }, { label: 'Своя инфраструктура', value: 8 }, { label: 'Публичное облако', value: 19 }]} />} takeaway="42 релиза в месяц вместо 8" source="Опрос 38 команд клиентов, 2026" section="Вэбтех Облако 3.0" />,
  <GridSlide overline="Клиенты" title="120 компаний уже работают на платформе" layout="top-3" rows="auto 1fr" section="Вэбтех Облако 3.0"
    cells={[
      <Card tone="tint"><Quote author="Ольга Миронова" role="CTO сервиса доставки «Пример»">Мы перестали думать об инфраструктуре и занялись продуктом</Quote></Card>,
      <KpiCard variant="outline" icon="users" value="120" label="компаний на платформе" delta="+45 за год" />,
      <KpiCard variant="outline" icon="gauge" value="99,95" unit="%" label="доступность за год" delta="выше SLA" trend="none" />,
      <KpiCard variant="outline" icon="rocket" value="5×" label="чаще релизы у клиентов" delta="в среднем" trend="none" />,
    ]} />,
  <TableSlide overline="Сравнение" title="Платформа закрывает требования, которые не закрывают альтернативы" table={<ComparisonTable options={['Вэбтех Облако', 'Своя инфраструктура', 'Публичное облако']} highlight={0} features={[{ name: 'Запуск среды', values: ['15 минут', '2–3 месяца', '1 день'] }, { name: 'Соответствие требованиям ОАЦ и Закону № 99-З', values: [true, true, false] }, { name: 'Оплата по потреблению', values: [true, false, true] }, { name: 'Поддержка 24/7 на русском', values: [true, false, false] }]} />} section="Вэбтех Облако 3.0" />,
  <RoadmapSlide overline="Развитие" title="В плане продукта: ClickHouse, ML-платформа, аттестация ОАЦ, ЦОД в Гомеле" roadmap={<Roadmap periods={['Q4 2026', 'Q1 2027', 'Q2 2027', 'Q3 2027']} today={0.3} lanes={[{ name: 'Сервисы', items: [{ start: 0, end: 1, label: 'ClickHouse', status: 'progress' }, { start: 1, end: 3, label: 'ML-платформа', status: 'planned' }] }, { name: 'Безопасность', items: [{ start: 0, end: 2, label: 'Аттестация ОАЦ', status: 'progress' }] }, { name: 'Регионы', items: [{ start: 1, end: 4, label: 'ЦОД в Гомеле', status: 'planned' }] }]} />} section="Вэбтех Облако 3.0" />,
  <ContactSlide title="Попробуйте бесплатно" subtitle="30 дней тестового периода и помощь архитектора" contacts={${CONTACTS}} />,
];`,
  },
  {
    name: 'DeckTech', file: '08-tehnicheskoe-reshenie', title: 'Техническое решение',
    about: 'Описание архитектуры: требования, уровни архитектуры, интеграции, стек, нефункциональные требования (SLA, безопасность), план миграции, риски.',
    code: `
const slides = [
  <TitleSlide composition="column" textures={['server']} overline="Техническое решение" title="Архитектура платформы обработки платежей" subtitle="Целевое решение и план миграции" author="Алексей Орлов, архитектор" date="Сентябрь 2026" />,
  <TwoColumnSlide overline="Требования" title="Платежи всех типов, сверка с банками и 3 000 транзакций в секунду" left={{ icon: 'list-checks', title: 'Функциональные', bullets: ['Приём платежей всех типов', 'Сверка с банками-партнёрами', 'Личный кабинет мерчанта'] }} right={{ icon: 'gauge', title: 'Нефункциональные', tint: true, bullets: ['3 000 транзакций в секунду', 'Доступность 99,95%', 'Соответствие PCI DSS'] }} section="Платёжная платформа" />,
  <ProcessSlide overline="Архитектура" title="Архитектура из четырёх уровней: от каналов до инфраструктуры" process={<Pyramid variant="layers" width={1728} levels={[{ title: 'Каналы', text: 'Веб, мобильное приложение, API для партнёров' }, { title: 'Сервисы', text: 'Микросервисы на Kotlin, событийная шина Kafka' }, { title: 'Данные', text: 'PostgreSQL, ClickHouse для аналитики, Redis' }, { title: 'Инфраструктура', text: 'Kubernetes в двух ЦОД, active-active' }]} />} section="Платёжная платформа" />,
  <ProcessSlide overline="Поток" title="Платёж проходит четыре шага: приём, антифрод, процессинг, учёт" process={<ProcessFlow steps={[{ icon: 'smartphone', title: 'Приём', text: 'API-шлюз, авторизация' }, { icon: 'shield-check', title: 'Антифрод', text: 'Проверка за 50 мс' }, { icon: 'refresh-cw', title: 'Процессинг', text: 'Маршрутизация в банк' }, { icon: 'database', title: 'Учёт', text: 'Проводки и сверка' }]} />} section="Платёжная платформа" />,
  <TableSlide overline="Стек" title="Стек выбран под экспертизу команды и надёжную доставку событий" table={<DataTable columns={[{ title: 'Слой' }, { title: 'Технологии' }, { title: 'Почему' }]} rows={[['Сервисы', 'Kotlin, Spring Boot', 'Экспертиза команды, производительность'], ['Интеграция', 'Kafka, REST, gRPC', 'Событийная модель, надёжная доставка'], ['Данные', 'PostgreSQL, ClickHouse, Redis', 'Транзакции + аналитика + кэш'], ['Платформа', 'Kubernetes, Istio, ArgoCD', 'Масштабирование и GitOps'], ['Наблюдаемость', 'Prometheus, Grafana, OpenTelemetry', 'Метрики, трассировка, алерты']]} zebra />} section="Платёжная платформа" />,
  <GridSlide overline="Нагрузка" title="Запас по производительности — в три раза" layout="2x2" section="Платёжная платформа"
    cells={[
      <Card icon="gauge" title="Пиковая нагрузка" meta="тыс. операций/с"><MeterList layout="inline" max={6} base={false} items={[{ label: 'Сейчас', value: 2.1, display: '2,1', color: 'var(--chart-1)' }, { label: 'Через год', value: 3.2, display: '3,2', color: 'var(--chart-2)' }, { label: 'Предел', value: 6, display: '6,0', color: 'var(--chart-other)' }]} /></Card>,
      <Card icon="cpu" title="Загрузка ресурсов в пик"><MeterList layout="inline" max={100} base={false} items={[{ label: 'CPU', value: 34, display: '34%', color: 'var(--chart-1)' }, { label: 'Память', value: 48, display: '48%', color: 'var(--chart-1)' }, { label: 'Диски', value: 29, display: '29%', color: 'var(--chart-1)' }]} /></Card>,
      <Card icon="shield-check" title="Надёжность"><FactList items={[{ icon: 'gauge', label: 'SLA', value: '99,95%' }, { icon: 'database', label: 'RPO', value: '0 минут' }, { icon: 'refresh-cw', label: 'RTO', value: '15 минут' }]} /></Card>,
      <Card tone="warning" icon="triangle-alert" title="Узкое место — база отчётности"><Text variant="body" tone="secondary">При росте в 2 раза нужна отдельная реплика. Закладываем в III квартал</Text></Card>,
    ]} />,
  <KpiSlide overline="SLA" title="Доступность 99,95%, ответ до 200 мс, восстановление за 15 минут" items={[{ value: '99,95', unit: '%', label: 'Доступность', icon: 'gauge' }, { value: '3 000', label: 'Транзакций в секунду', icon: 'zap' }, { value: '< 200', unit: 'мс', label: 'Время ответа (p95)', icon: 'clock' }, { value: '15', unit: 'мин', label: 'RTO при отказе ЦОД', icon: 'refresh-cw' }]} section="Платёжная платформа" />,
  <ContentSlide overline="Безопасность" title="Шифрование и сегментация готовы, аудит PCI DSS и пентест впереди" section="Платёжная платформа"><Checklist items={[{ text: 'Шифрование данных при передаче и хранении', meta: 'TLS 1.3, AES-256', status: 'done' }, { text: 'Сегментация сети и Zero Trust', meta: 'Istio mTLS', status: 'done' }, { text: 'Аудит PCI DSS', meta: 'Ноябрь', status: 'progress' }, { text: 'Пентест внешним подрядчиком', meta: 'Декабрь', status: 'todo' }]} /></ContentSlide>,
  <GridSlide overline="Риски" title="Риски миграции известны и закрыты мерами" layout="halves" columns="3fr 2fr" section="Платёжная платформа"
    cells={[
      <DataTable columns={[{ title: 'Риск' }, { title: 'Уровень' }, { title: 'Мера' }]} rows={[['Потеря транзакций при переключении', <Status status="blocked" variant="text" label="Высокий" />, 'Двойная запись 2 недели'], ['Рост задержек', <Status status="risk" variant="text" label="Средний" />, 'Нагрузочный тест до старта'], ['Нехватка экспертизы', <Status status="risk" variant="text" label="Средний" />, 'Обучение команды банка']]} />,
      <Card tone="tint" icon="list-checks" title="Готовность к миграции"><Checklist items={[{ text: 'Стенд нагрузочного теста', status: 'done' }, { text: 'План отката', status: 'done' }, { text: 'Двойная запись', status: 'progress' }, { text: 'Обучение дежурных', status: 'todo' }]} /></Card>,
    ]} />,
  <RoadmapSlide overline="Миграция" title="Миграция без остановки сервиса за 6 месяцев" roadmap={<Roadmap periods={['Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар']} lanes={[{ name: 'Инфраструктура', items: [{ start: 0, end: 2, label: 'Кластеры', status: 'planned' }] }, { name: 'Сервисы', items: [{ start: 1, end: 4, label: 'Перенос сервисов', status: 'planned' }] }, { name: 'Данные', items: [{ start: 2, end: 5, label: 'Миграция данных', status: 'planned' }] }, { name: 'Переключение', items: [{ start: 4.5, end: 6, label: 'Трафик 10→100%', status: 'planned' }] }]} />} section="Платёжная платформа" />,
  <ContactSlide title="Вопросы?" subtitle="Архитектурный комитет" contacts={${CONTACTS}} />,
];`,
  },
  {
    name: 'DeckCase', file: '09-keys-klienta', title: 'Кейс клиента',
    about: 'Короткая история успеха: клиент и задача, решение, ход проекта, результаты в цифрах и графиках, отзыв клиента.',
    code: `
const slides = [
  <TitleSlide composition="hero" textures={['fiber']} overline="Кейс" title="Как ритейлер ускорил доставку в 2 раза" subtitle="Сеть «Пример», 400 магазинов" date="2026" />,
  <ContentSlide overline="Клиент" title="Национальная сеть с 400 магазинами и онлайн-заказами" bullets={['400 магазинов в 60 городах Беларуси', '300 тыс. онлайн-заказов в месяц', 'Собственная служба доставки']} aside={<Callout tone="warning" title="Проблема">Срок доставки — 48 часов, 12% заказов опаздывают</Callout>} section="Кейс: доставка" />,
  <CaseSlide title="Доставка за 24 часа вместо 48" client="Сеть «Пример», e-commerce и логистика" problem="Ручное планирование маршрутов, нет данных об остатках в реальном времени, частые опоздания." solution={['Сервис планирования маршрутов', 'Остатки в реальном времени', 'Мобильное приложение курьера']} results={[{ value: '24 ч', label: 'срок доставки вместо 48' }, { value: '−70%', label: 'опозданий' }]} section="Кейс: доставка" />,
  <GridSlide overline="Эффект" title="Через полгода доставка вдвое быстрее во всех областях" layout="feature-left" section="Кейс: доставка"
    cells={[
      <Card title="Срок доставки по областям" meta="часов"><BarChart width={900} height={440} categories={['Минск', 'Брест', 'Гомель', 'Гродно', 'Витебск', 'Могилёв']} series={[{ name: 'До проекта', values: [36, 50, 52, 48, 54, 50], color: 'var(--chart-other)' }, { name: 'После', values: [18, 24, 26, 24, 26, 24] }]} /></Card>,
      <KpiCard variant="brand" value="2×" label="быстрее доставка" delta="48 → 24 часа" trend="down" sentiment="good" />,
      <Card icon="clipboard-list" title="Масштаб проекта"><FactList layout="column" items={[{ icon: 'building', label: 'Магазинов', value: '400' }, { icon: 'calendar', label: 'Срок', value: '5 месяцев' }]} /></Card>,
    ]} />,
  <TimelineSlide overline="Ход проекта" title="Запуск за 5 месяцев" timeline={<Timeline items={[{ date: 'Март', title: 'Аудит', text: 'Процессы и данные', status: 'done' }, { date: 'Апрель', title: 'Пилот', text: 'Минск, 20 магазинов', status: 'done' }, { date: 'Июнь', title: 'Тираж', text: '10 городов', status: 'done' }, { date: 'Август', title: 'Вся сеть', text: '60 городов', status: 'done' }]} />} section="Кейс: доставка" />,
  <ChartSlide overline="Результаты" title="Опоздания сократились с 12% до 3,5%" chartTitle="Доля опоздавших заказов" chartSubtitle="%" chart={<LineChart width={1080} height={420} categories={['Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен']} series={[{ name: 'Опоздания', values: [12, 11.2, 8.5, 6.8, 5.1, 4.2, 3.5] }]} format={(v) => W.fmt(v) + '%'} />} takeaway="−70% опозданий за полгода" points={['NPS доставки +21 пункт', 'Повторные заказы +14%']} section="Кейс: доставка" />,
  <GridSlide overline="Что сработало" title="Три решения, которые дали результат" layout="bottom-3" section="Кейс: доставка"
    cells={[
      <Card icon="workflow" overline="Решение 1" title="Единый план маршрутов"><Text variant="body" tone="secondary">Маршруты строятся ночью по всем складам сразу</Text></Card>,
      <Card icon="smartphone" overline="Решение 2" title="Приложение курьера"><Text variant="body" tone="secondary">Статус заказа — в реальном времени для клиента</Text></Card>,
      <Card icon="chart-line" overline="Решение 3" title="Прогноз спроса"><Text variant="body" tone="secondary">Товар заранее едет на ближайший к клиенту склад</Text></Card>,
      <Callout tone="accent" title="Главное">Технология сработала, потому что склады, курьеры и магазины перешли на неё одновременно</Callout>,
    ]} />,
  <QuoteSlide quote="Мы получили не просто систему, а новую модель доставки. Клиенты заметили разницу уже через месяц." author="Ольга Васильева" role="Директор по логистике, сеть «Пример»" photo={null} />,
  <ContactSlide title="Хотите так же?" subtitle="Расскажем, как применить решение в вашей компании" contacts={${CONTACTS}} />,
];`,
  },
  {
    name: 'DeckBoard', file: '10-dlya-rukovodstva', title: 'Для руководства и совета директоров',
    about: 'Материалы для совета директоров: резюме, финансы, ключевые проекты, риски и вопросы на утверждение. Максимум выводов, минимум деталей.',
    code: `
const slides = [
  <TitleSlide composition="quiet" overline="Заседание совета директоров" title="Итоги I полугодия 2026 года" subtitle="Материалы к заседанию 30 сентября" date="30 сентября 2026" />,
  <AgendaSlide items={[{ title: 'Резюме', time: '5 мин' }, { title: 'Финансовые результаты', time: '15 мин' }, { title: 'Ключевые проекты', time: '10 мин' }, { title: 'Риски', time: '10 мин' }, { title: 'Вопросы на утверждение', time: '20 мин' }]} />,
  <ContentSlide overline="Резюме" title="Полугодие выше бюджета, прогноз на год повышаем" bullets={[{ title: 'Выручка 24,5 млн BYN', text: '+29% г/г, 104% бюджета' }, { title: 'EBITDA 8,1 млн BYN', text: 'Рентабельность 33%, +3 п. п.' }, { title: 'Прогноз на год', text: 'Повышаем с 46 до 48 млн BYN' }]} aside={<Callout tone="warning" title="Внимание">Риск по срокам проекта «Единая платформа клиента» — см. слайд 7</Callout>} section="Совет директоров" confidential />,
  <DashboardSlide overline="План / факт" title="Полугодие выше бюджета по выручке и прибыли" meta="I полугодие 2026" cards={[{ title: 'Выручка', tone: 'tint', unit: 'млн BYN', plan: 23.6, fact: 24.5 }, { title: 'EBITDA', unit: 'млн BYN', plan: 7.8, fact: 8.1 }, { title: 'Рентабельность EBITDA', unit: '%', plan: 32.5, fact: 33.1, format: (v) => W.fmt(v, { digits: 1, minDigits: 1 }) + '%' }, { title: 'Капитальные вложения', unit: 'млн BYN', better: 'lower', plan: 3.2, fact: 2.9 }]} aside={<Card tone="success" icon="trending-up" title="Прогноз на год повышаем"><Text variant="body" tone="secondary">Контракты II полугодия подписаны, выручка года — 48 млн BYN вместо 46.</Text><MeterList items={[{ label: 'Бюджет года', value: 46 }, { label: 'Новый прогноз', value: 48 }, { label: 'Факт полугодия', value: 24.5 }]} format={(v) => W.fmt(v, { digits: 1 }) + ' млн'} /></Card>} section="Совет директоров" confidential />,
  <ChartSlide overline="Финансы" title="Выручка растёт быстрее бюджета" chartTitle="Выручка по кварталам" chartSubtitle="млн BYN" chart={<ComboChart width={1080} height={420} categories={['Q3 25', 'Q4 25', 'Q1 26', 'Q2 26']} bars={{ name: 'Факт', values: [10, 11, 11.5, 13] }} line={{ name: 'Бюджет', values: [9.5, 10.5, 11.2, 12.3] }} />} takeaway="104% бюджета за полугодие" source="Управленческая отчётность" section="Совет директоров" confidential />,
  <GridSlide overline="Финансы" meta="I полугодие 2026" title="Денежный поток и долговая нагрузка в норме" layout="feature-right" section="Совет директоров" confidential
    cells={[
      <KpiCard variant="outline" value="5,2" unit="млн BYN" label="свободный денежный поток" delta="+1,4 к плану" />,
      <KpiCard variant="outline" value="0,4" label="долг / EBITDA" delta="норма — до 1,5" trend="flat" />,
      <Card title="Денежный поток по месяцам" meta="млн BYN"><BarChart width={900} height={440} highlight={5} data={[{ label: 'Янв', value: 0.6 }, { label: 'Фев', value: 0.7 }, { label: 'Мар', value: 0.9 }, { label: 'Апр', value: 0.8 }, { label: 'Май', value: 1 }, { label: 'Июн', value: 1.2 }]} format={(v) => W.fmt(v, { digits: 1, minDigits: 1 })} /></Card>,
    ]} source="Управленческая отчётность" />,
  <TableSlide overline="Проекты" title="Один из четырёх проектов в риске: «Единая платформа клиента»" table={<StatusTable columns={['Проект', 'Статус', 'Прогресс', 'Комментарий']} rows={[{ name: 'Отраслевые продукты', status: 'ok', statusLabel: 'По плану', progress: 55, note: 'Первые 2 продукта в продаже' }, { name: 'Новый ЦОД', status: 'ok', statusLabel: 'По плану', progress: 40, note: 'Запуск в I квартале 2027' }, { name: 'Единая платформа клиента', status: 'risk', progress: 64, note: 'Задержка интеграций на 4 недели' }, { name: 'Выход в области', status: 'done', progress: 100, note: '4 областных центра запущены' }]} />} section="Совет директоров" confidential />,
  <TableSlide overline="Риски" title="Три риска под контролем: инженеры, оборудование, интеграции" table={<DataTable columns={[{ title: 'Риск' }, { title: 'Уровень' }, { title: 'Меры' }]} rows={[['Дефицит инженеров', <Status status="risk" label="Средний" />, 'Центры разработки в Гомеле и Гродно'], ['Рост стоимости оборудования', <Status status="risk" label="Средний" />, 'Долгосрочные контракты с поставщиками'], ['Задержка интеграций', <Status status="blocked" label="Высокий" />, 'Эскалация, резервный план']]} />} section="Совет директоров" confidential />,
  <GridSlide overline="Инвестиции" title="Новый ЦОД: 15 млн BYN, окупаемость 4 года" layout="halves" section="Совет директоров" confidential
    cells={[
      <Card icon="server" title="Структура инвестиций" meta="млн BYN"><Text variant="body" tone="secondary">Запуск в I квартале 2027, мощность — 400 стоек</Text><BreakdownBar totalLabel="Итого" items={[{ label: 'Здание и инженерия', value: 7.5 }, { label: 'Оборудование', value: 5 }, { label: 'Сети', value: 1.5 }, { label: 'Резерв', value: 1 }]} /></Card>,
      <Card tone="tint" icon="list-checks" title="Условия одобрения"><Checklist items={[{ text: 'Предзаказы на 40% мощности', status: 'done' }, { text: 'Кредитная линия банка', status: 'done' }, { text: 'Проектная документация', status: 'progress' }, { text: 'Экспертиза ОАЦ', status: 'todo' }]} /></Card>,
    ]} />,
  <ContentSlide overline="На утверждение" title="Совету директоров предлагается утвердить" bullets={['Скорректированный прогноз выручки на 2026 год — 48 млн BYN', 'Инвестиции в новый ЦОД — 15 млн BYN', 'Программу долгосрочной мотивации ключевых сотрудников']} marker="number" section="Совет директоров" confidential />,
];`,
  },
  {
    name: 'DeckOnboarding', file: '11-onbording', title: 'Онбординг сотрудника',
    about: 'Первый день в компании: приветствие, ценности, оргструктура, план на первые 90 дней, полезные сервисы, контакты.',
    code: `
const slides = [
  <TitleSlide composition="band" overline="Добро пожаловать" title="Добро пожаловать в Вэбтех!" subtitle="Всё, что нужно знать в первые дни" date="2026" />,
  <ContentSlide overline="Ценности" title="Четыре ценности: клиент в центре, открытость, результат, рост" section="Онбординг"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48 }}><IconFeature icon="users" title="Клиент в центре">Решаем задачу клиента, а не пишем код ради кода</IconFeature><IconFeature icon="handshake" title="Открытость">Говорим прямо, делимся знаниями</IconFeature><IconFeature icon="target" title="Результат">Отвечаем за итог, а не за процесс</IconFeature><IconFeature icon="graduation-cap" title="Рост">Учимся каждый день</IconFeature></div></ContentSlide>,
  <ProcessSlide overline="Структура" title="Компания делится на три направления: технологии, продажи, продукт" process={<OrgChart root={{ name: 'Алексей Орлов', role: 'Генеральный директор', photo: W.samplePhoto('Алексей Орлов') }} children={[{ name: 'Мария Козлова', role: 'Технологии', photo: W.samplePhoto('Мария Козлова'), team: ['Платформа', 'Разработка', 'SRE'] }, { name: 'Илья Петров', role: 'Продажи и партнёры', photo: W.samplePhoto('Илья Петров'), team: ['Продажи', 'Партнёры'] }, { name: 'Анна Смирнова', role: 'Продукт', photo: W.samplePhoto('Анна Смирнова'), team: ['Продукт', 'Дизайн', 'HR'] }]} />} section="Онбординг" />,
  <GridSlide overline="Люди" title="В первые недели помогут наставник, HR и ИТ-поддержка" layout="top-3" rows="auto 1fr" section="Онбординг"
    cells={[
      <Card icon="users" title="Ваши контакты"><FactList items={[{ icon: 'user', label: 'Наставник', value: 'Мария Климова' }, { icon: 'message-square', label: 'HR', value: 'Олег Сидорович' }, { icon: 'wrench', label: 'ИТ-поддержка', value: 'help@company.by' }]} /></Card>,
      <Card icon="message-square" title="Чат команды"><Text variant="body" tone="secondary">Вопросы по работе — сюда, отвечают в течение часа</Text></Card>,
      <Card icon="calendar" title="Встречи"><Text variant="body" tone="secondary">Планёрка в понедельник 10:00, демо — по пятницам</Text></Card>,
      <Card icon="book-open" title="База знаний"><Text variant="body" tone="secondary">Регламенты, шаблоны и ответы на частые вопросы</Text></Card>,
    ]} />,
  <TimelineSlide overline="Первые 90 дней" title="За три месяца вы пройдёте путь от знакомства до самостоятельности" timeline={<Timeline items={[{ date: 'День 1', title: 'Знакомство', text: 'Доступы, наставник, команда', status: 'current' }, { date: 'Неделя 1', title: 'Погружение', text: 'Продукты и процессы', status: 'planned' }, { date: 'Месяц 1', title: 'Первая задача', text: 'С поддержкой наставника', status: 'planned' }, { date: 'Месяц 3', title: 'Итоги', text: 'Встреча с руководителем', status: 'planned' }]} />} section="Онбординг" />,
  <GridSlide overline="Адаптация" title="Что вы сделаете за первые 90 дней" layout="bottom-3" section="Онбординг"
    cells={[
      <Card icon="flag" overline="30 дней" title="Знакомство"><Checklist items={[{ text: 'Доступы и рабочее место' }, { text: 'Встречи с командой' }, { text: 'Первая задача' }]} /></Card>,
      <Card icon="rocket" overline="60 дней" title="Первые результаты"><Checklist items={[{ text: 'Задачи без наставника' }, { text: 'Участие в демо' }, { text: 'Курс по безопасности' }]} /></Card>,
      <Card icon="trophy" overline="90 дней" title="Самостоятельность"><Checklist items={[{ text: 'Свой участок работы' }, { text: 'Обратная связь от команды' }, { text: 'План развития' }]} /></Card>,
      <Callout tone="accent" title="Итоговая встреча">На 90-й день — разговор с руководителем: что получилось и куда расти дальше</Callout>,
    ]} />,
  <ContentSlide overline="Чек-лист" title="Первый день: что сделать" section="Онбординг"><Checklist items={[{ text: 'Получить ноутбук и пропуск', meta: 'Ресепшен', status: 'todo' }, { text: 'Войти в корпоративную почту и мессенджер', meta: 'ИТ-поддержка', status: 'todo' }, { text: 'Познакомиться с наставником', meta: '11:00', status: 'todo' }, { text: 'Пройти вводный курс по безопасности', meta: '30 минут', status: 'todo' }]} /></ContentSlide>,
  <TableSlide overline="Сервисы" title="Всё нужное — в четырёх сервисах: трекер, база знаний, HR-портал, ИТ-поддержка" table={<DataTable columns={[{ title: 'Что нужно' }, { title: 'Где' }]} rows={[['Задачи и проекты', 'Трекер задач'], ['База знаний', 'Корпоративная вики'], ['Отпуск, справки, документы', 'HR-портал'], ['Помощь с доступами и техникой', 'ИТ-поддержка, чат 24/7']]} />} section="Онбординг" />,
  <ContactSlide title="Мы рады, что вы с нами!" subtitle="Если что-то непонятно — спрашивайте наставника или HR" contacts={${CONTACTS}} />,
];`,
  },
  {
    name: 'DeckWorkshop', file: '12-obuchenie', title: 'Обучение / воркшоп',
    about: 'Учебная сессия или воркшоп: цели, программа, теоретические блоки, упражнения, чек-лист, итоги и материалы.',
    code: `
const slides = [
  <TitleSlide composition="band" overline="Воркшоп" title="Презентации, которые убеждают" subtitle="Практикум для руководителей и менеджеров" author="Анна Смирнова, ведущая" date="3 часа" />,
  <ContentSlide overline="Цели" title="Что вы унесёте с воркшопа" bullets={['Структура «вывод → доказательство → действие»', 'Правила графиков, которым верят', 'Своя презентация, пересобранная по шаблону Вэбтех']} marker="check" aside={<KpiCard variant="brand" value="3" unit="часа" label="Теория, практика и разбор" />} section="Воркшоп" />,
  <AgendaSlide title="Программа" items={[{ title: 'Структура и заголовки', time: '40 мин' }, { title: 'Графики и данные', time: '40 мин' }, { title: 'Перерыв', time: '15 мин' }, { title: 'Практика', time: '60 мин' }, { title: 'Разбор и итоги', time: '25 мин' }]} />,
  <SectionSlide number={1} title="Структура и заголовки" />,
  <TwoColumnSlide overline="Правило 1" title="Заголовок — это вывод, а не тема" left={{ title: 'Тема', bullets: ['Выручка', 'Результаты проекта', 'Риски'], marker: 'cross' }} right={{ title: 'Вывод', tint: true, bullets: ['Выручка выросла на 32%', 'Проект запущен на 2 недели раньше', 'Два риска требуют решения'], marker: 'check' }} section="Воркшоп" />,
  <GridSlide overline="Анатомия" title="Сильный слайд состоит из пяти элементов" layout="feature-left" section="Воркшоп"
    cells={[
      <Card icon="layout-grid" title="Пять элементов" style={{ padding: '32px 48px', gap: 24 }}><BulletList marker="number" items={[{ title: 'Заголовок-вывод', text: 'Одна мысль, до двух строк' }, { title: 'Подзаголовок', text: 'Контекст одним предложением' }, { title: 'Доказательство', text: 'График, цифры или пример' }, { title: 'Источник', text: 'Откуда данные' }, { title: 'Действие', text: 'Что просим решить' }]} /></Card>,
      <KpiCard variant="brand" size="lg" value="3" unit="сек" label="чтобы понять слайд" delta="если заголовок — вывод" style={{ justifyContent: 'center', padding: '32px 48px' }} />,
      <Card tone="warning" icon="triangle-alert" title="Частые ошибки" style={{ padding: '32px 48px', gap: 24 }}><BulletList size="lead" marker="cross" items={['Заголовок-тема: «Итоги»', 'Три мысли на слайде', 'График без подписей']} /></Card>,
    ]} />,
  <ProcessSlide overline="Метод" title="Презентация готовится циклом: цель, структура, слайды, прогон" process={<Cycle size={680} center="Итерация" steps={[{ title: 'Цель', icon: 'target' }, { title: 'Структура', icon: 'list-checks' }, { title: 'Слайды', icon: 'layout-grid' }, { title: 'Прогон', icon: 'message-square' }]} />} section="Воркшоп" />,
  <ContentSlide overline="Упражнение" title="Практика: пересоберите свои три слайда" section="Воркшоп"><NestedList numbered items={[{ title: 'Перепишите заголовки', items: ['Каждый — вывод в одно предложение'] }, { title: 'Проверьте графики', items: ['Одна ось, подписи значений, источник'] }, { title: 'Покажите соседу', items: ['Понятен ли вывод за 5 секунд?'] }]} /></ContentSlide>,
  <GridSlide overline="Практика" title="Три упражнения по 10 минут" layout="bottom-3" section="Воркшоп"
    cells={[
      <Card icon="file-text" overline="Упражнение 1" title="Заголовки"><Text variant="body" tone="secondary">Перепишите заголовки трёх слайдов как выводы</Text><Badge tone="brand" icon="clock" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>10 минут</Badge></Card>,
      <Card icon="chart-column" overline="Упражнение 2" title="Данные"><Text variant="body" tone="secondary">Оставьте на графике одну мысль и подпишите значения</Text><Badge tone="brand" icon="clock" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>10 минут</Badge></Card>,
      <Card icon="users" overline="Упражнение 3" title="Проверка"><Text variant="body" tone="secondary">Покажите слайд соседу на 3 секунды — что он запомнил?</Text><Badge tone="brand" icon="clock" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>10 минут</Badge></Card>,
      <Callout tone="accent" title="Правило">Если сосед не пересказал вывод слайда — перепишите заголовок</Callout>,
    ]} />,
  <ContentSlide overline="Итоги" title="Пять проверок перед показом" section="Воркшоп"><Checklist items={[{ text: 'Каждый заголовок — вывод', status: 'done' }, { text: 'Текст не мельче 24px', status: 'done' }, { text: 'Цвет не единственный носитель смысла', status: 'done' }, { text: 'У графиков есть источник', status: 'done' }, { text: 'Проверена печать в PDF', status: 'done' }]} /></ContentSlide>,
  <ContactSlide title="Спасибо за работу!" subtitle="Материалы и шаблоны — в дизайн-системе Вэбтех" contacts={${CONTACTS}} />,
];`,
  },
];

for (const d of DECKS) d.slides = (d.code.match(/^\s{2}<[A-Z]\w*Slide/gm) || []).length;

export const DECK_PAGES = DECKS.map((d) => ({
  name: d.name,
  group: 'Готовые презентации',
  page: true,
  width: 1920,
  height: Math.ceil(d.slides / 3) * (Math.round((1080 * (1920 - 96 - 64)) / 3 / 1920) + 32) + 96,
  subtitle: `${d.title} · ${d.slides} слайдов`,
  readme: `
${d.title}. ${d.about}

**Слайдов:** ${d.slides}. **Автономная версия для показа и печати в PDF:** \`templates/${d.file}.html\` в репозитории.

## Как использовать
- Цифры, имена, названия клиентов и контакты в шаблоне — примеры. Замените их своими данными.
- Удаляйте ненужные слайды и добавляйте макеты из раздела «Макеты слайдов». Порядок и номера Deck пересчитает сам.
- Заголовки формулируйте выводами. Один слайд — одна мысль.
`,
  code: d.code + '\nconst view = <Deck layout="grid" columns={3}>{slides}</Deck>;',
}));
