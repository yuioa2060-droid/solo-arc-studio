# A6API: журнал генерации EP2

Маршрут как заявлен: `https://a6.a6api.com/v1/images/edits`, `gpt-image-2.5`, route-id `4995`, ожидаемая цена `$0.0012` (историческая; helper не доказывает фактический route). Фактическая стоимость считалась по счётчику `GET /v1/dashboard/billing/usage` до и после каждого запроса (500000 единиц = 1 USD). Запросы шли строго последовательно.

| Имя | Статус | HTTP | Единиц | Время UTC | Референсы | prompt sha | Ошибка |
|---|---|---|---|---|---|---|---|
| h-hungry.png | saved-unreviewed | 200 | 1416 | 00:04:08 | style-ref.png, APPROVED-h3-hero-waist.png | 8b2074a0f1 |  |
| o-alarm.failed-504-billed780 | failed | 504 | 780 | 00:24:07 | o-style-anchor.png, o-apple.png | ba7d08807d | Non-JSON API response; response body omitted. |
| o-apple.png | saved-unreviewed | 200 | 714 | 00:04:43 | o-style-anchor.png | 84388b218d |  |
| o-applejuice.png | saved-unreviewed | 200 | 714 | 00:20:23 | o-style-anchor.png, o-apple.png | bf8cde070d |  |
| o-applesauce.png | saved-unreviewed | 200 | 714 | 00:19:38 | o-style-anchor.png, o-apple.png | d41f30484c |  |
| o-beans.png | saved-unreviewed | 200 | 900 | 01:50:13 | o-style-anchor.png, o-apple.png | 6ca2cce997 |  |
| o-bowl.png | saved-unreviewed | 200 | 714 | 00:22:19 | o-style-anchor.png, o-apple.png | 549be9344c |  |
| o-chicken.png | saved-unreviewed | 200 | 714 | 00:29:45 | o-style-anchor.png, o-apple.png | 2474e64dd1 |  |
| o-eggs.png | saved-unreviewed | 200 | 780 | 00:29:09 | o-style-anchor.png, o-apple.png | 04fd7f34bb |  |
| o-fish.failed-403-quota | failed | 403 |  | 00:30:19 | o-style-anchor.png, o-apple.png | 01fe366cdd | API rejected request: 当前可用额度不足。 原因：您的可用额度（账户余额或订阅额度）不足，平台无法完成本次预扣或调用。  |
| o-fish.png | failed | 403 | 0 | 00:33:06 | o-style-anchor.png, o-apple.png | 01fe366cdd | API rejected request: 当前可用额度不足。 原因：您的可用额度（账户余额或订阅额度）不足，平台无法完成本次预扣或调用。  |
| o-glass.png | saved-unreviewed | 200 | 780 | 00:23:37 | o-style-anchor.png, o-apple.png | 7605bfbf68 |  |
| o-potato.png | saved-unreviewed | 200 | 900 | 00:22:50 | o-style-anchor.png, o-apple.png | 4b1a4d8b38 |  |
| o-soup.png | saved-unreviewed | 200 | 714 | 00:21:42 | o-style-anchor.png, o-apple.png | 6ce3f8b5d0 |  |
| o-yogurt.png | saved-unreviewed | 200 | 780 | 00:21:08 | o-style-anchor.png, o-apple.png | f91b710f12 |  |

Итого по записям: **10620 единиц ≈ $0.0212** (запись `o-fish` — отказ 403 без списания; `o-alarm` — оплаченный таймаут).

## Сбои и остановка

- `o-alarm`: HTTP 504 после 5 минут, изображение не получено. Счётчик показал **780 единиц списания** — таймаут не равен бесплатному запросу; повтор не отправлялся.
- `o-fish`: HTTP 403 «当前可用额度不足» (доступный баланс аккаунта не покрывает запрос); повтор одним запросом дал тот же отказ, списания 0. После этого серию остановили.
- `o-beans`, `h-glass`, `h-turn` в пакетной очереди **не отправлялись**: обёртка упала до запроса (ответ 429 от точки чтения расхода; исправлено — теперь используется `/v1/dashboard/billing/usage`).
- Позже, когда монтаж уже был отрендерен, один пробный запрос `o-beans` прошёл (900 единиц): баланс снова позволял генерацию (причина не выяснялась). Рисунок хороший, но в ролике не используется: сценарий называет только яйца, йогурт и курицу.
- Запланированные, но **не созданные** рисунки: будильник `o-alarm`, рыба `o-fish`, герой с водой `h-glass`, герой «крутит ручку» `h-turn`. Монтаж обходится без них (ручки нарисованы кодом, остальные герои — принятые позы EP1). Промпты лежат в `prompts/`; запуск — `tools/a6gen.mjs <имя> --obj|--hero --send`. Другие модели/сервисы не использовались: правило канала разрешает только A6API в принятом стиле.

## Принятые рисунки

Просмотрены глазами на тёмном фоне #060606 (контактные листы): лицо/волосы/шорты героя, штрих, цвета, края alpha. Приняты и используются: `h-hungry`, `o-apple`, `o-applesauce`, `o-applejuice`, `o-yogurt`, `o-soup`, `o-bowl`, `o-potato`, `o-glass`, `o-eggs`, `o-chicken`. Принят, но не используется: `o-beans`. Raw лежат в `raw/`, активные RGBA — `film/public/img/` (alpha по связной чёрной области от границы, внутренние чёрные линии не вырезаются: `tools/prep_alpha.py`).
