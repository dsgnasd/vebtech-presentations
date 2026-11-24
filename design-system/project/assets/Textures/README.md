# Фактуры для сот

Реальная предметная съёмка в дуотоне фирменной гаммы: тени `brand-900` → середина `brand` → света `brand-100`. Используются только в масках по контуру знака (Hexagon `texture`, ячейки HexCluster) на титуле (по композиции `TitleSlide`, до 4), разделе и финале (не больше 2).

| Файл | Сюжет | Автор (Unsplash) |
|---|---|---|
| `facade.webp` | Стеклянный фасад | Héctor J. Rivas — unsplash.com/photos/1FxMET2U5dU |
| `circuit.webp` | Печатная плата | Vishnu Mohanan — unsplash.com/photos/pfR18JNEMv8 |
| `server.webp` | Серверная стойка | Tyler (@tylergm) — unsplash.com/photos/eqd0f78u9nI |
| `fiber.webp` | Оптоволоконный кросс | Albert Stoynov — unsplash.com/photos/yhJVLxcquEY |
| `ceiling.webp` | Потолок терминала | Claudio Mezzasalma — unsplash.com/photos/1qZ94JesPi4 |
| `code.webp` | Код на экране | Chris Ried — unsplash.com/photos/ieic5Tq8YMk |
| `lights.webp` | Световые линии | Mark Denton — unsplash.com/photos/hBOYcQqGvUw |
| `cables.webp` | Сетевые кабели | Scott Rodgerson — unsplash.com/photos/PSpf_XgOM5w |
| `glass.webp` | Стеклянная стена | Christian Ladewig — unsplash.com/photos/T0iFfJw-rB0 |
| `grid.webp` | Сетчатый свод | R M — unsplash.com/photos/hPPfYLRuBvU |
| `tunnel.webp` | Шестиугольный тоннель | drmakete lab — unsplash.com/photos/hsg538WrP0Y |

Лицензия Unsplash: бесплатно для коммерческого использования, атрибуция не обязательна (указана здесь из уважения к авторам). В слайдах фактуры уже встроены в бандл: `Webtech.textures.facade` и т. д.

Свои фактуры: положите фото в `design-system/assets-src/textures/orig/`, добавьте запись в `src/gen-textures.mjs` и выполните `node src/gen-textures.mjs` — дуотон и размер будут те же.
