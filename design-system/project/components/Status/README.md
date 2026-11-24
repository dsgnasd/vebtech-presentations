Статус — цвет + иконка + слово. Цвет никогда не передаёт статус в одиночку: презентацию печатают в ч/б и смотрят люди с нарушениями цветового зрения.

## Виды (`status`)
| status | тон | текст / иконка | иконка | слово по умолчанию |
|---|---|---|---|---|
| `done` | success | `success-strong` / `success` | circle-check | Выполнено |
| `ok` | success | `success-strong` / `success` | circle-check | В норме |
| `progress` | info | `info-strong` | refresh-cw | В работе |
| `risk` | warning | `ink` / `warning-mark` | triangle-alert | Риск |
| `blocked` | danger | `danger-strong` / `danger` | circle-x | Проблема |
| `planned` | neutral | `neutral-strong` | clock | Запланировано |
| `paused` | neutral | `neutral-strong` | hourglass | На паузе |

## Варианты
`variant="pill"` (плашка, по умолчанию), `"text"` (без фона, в строках таблиц), `"large"` (36px, итоговый статус проекта). `label` меняет слово.

---
_Статус: стабильный · с версии 1.0.0_
