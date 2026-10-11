# Изображения: смысл, идентичность, подготовка

Сначала [текущие правила](current-rules-ru.md), Этот справочник описывает создание новых изображений. Исходные промпты текущего EP1 находятся в episodes/ep1-v11/prompts; при расхождении действуют current-rules.

## Референсы и роли

- `assets/channel/APPROVED-h3-hero-waist.png` — identity/linework/палитра ведущего. Это не референс мягкого прогрессирующего тела.
- `assets/channel/b-w1.png`, `b-w2.png`, `b-w3.png` — принятый профильный прогресс и регистрация. Для новой пары сначала сверить их размеры/позу, не переиспользовать маску по имени файла.
- `assets/channel/o-hourglass-full.png`, `o-hourglass-low.png` — понятный классический объект восстановления. Точный mapping исходных имён указан в manifest.
- Raw и prompt текущего EP1 хранятся отдельно от обработанного alpha; roles и действующие правила применять к новому заданию.

## Карточка перед запросом

Заполнить: фраза озвучки; что увидит зритель; смысл без подписи; какие два состояния нужны; какие части должны совпасть; отдельные текст/числа/геометрия кодом; reference-role; критерий принятия. Если предмет выбран лишь ради красивой анимации, переделать решение до платного запроса.

## Основа промпта ведущего

Адаптировать действие и ракурс, не менять идентичность:

> Original adult male manga fitness instructor matching the approved identity reference: silver-white tousled hair with fringe, calm serious attractive face, shirtless, naturally athletic proportions without exaggerated bodybuilding muscles or veins. Loose knee-length dark emerald shorts (#0B8371), elastic waistband and drawstring, unbranded sneakers. Black ink contours and hatching, neutral pale grayscale skin, restrained natural colors. [Precisely described pose, camera, gaze and registration.] Full coherent figure, transparent background. No lettering, numbers, logos, frame, pedestal, neon, paper collage or cropped anatomy.

На первом появлении в эпизоде — gaze directly at viewer. Для действия описать осмысленный взгляд. Не требовать всегда full body, если кадр осознанно waist/upper-body; не обрезать важные части движения случайно. Для пары указать неподвижные волосы/лицо/опору и неизменную камеру, менять только требуемое действие.

## Основа предмета

> One clearly recognizable [object] in [meaningful state]. Original manga ink linework and hatching over muted natural material colors. A small dark emerald accent on the real [rim/cap/strap/etc.]. Isolated coherent object with transparent background. [Viewpoint and exact common registration for state A/B.] No text, numbers, logos, decorative border, platform, scanner, orbit, spotlight, holographic glow, torn paper, photograph or vintage styling treatment.

Запрет «vintage styling treatment» относится к оформлению, не к существованию классических предметов. Песочные часы/настенные часы/календарь разрешены. Не добавлять «modern gadget» без необходимости, не требовать все объекты белыми. Подписи, стрелки, цифры и count-up рисует код.

## Прогресс

Обычный взрослый персонаж строго в профиль, тот же hair/identity/pose/camera/support между состояниями. Умеренное мягкое тело → меньше живота, но без пресса → нормально стройное здоровое тело, не muscular transformation. Сохранить полный PNG и исходный силуэт. Утверждённые сроки EP1 не являются обещанием конкретного похудания.

## API и подготовка

**Все новые картинки, правки и перегенерации — только через A6API**, включая превью, аватарку и баннер: прямое уточнение владельца 11.10.2026. Другие сервисы и встроенный ImageGen не использовать. Отдельные env-переменные — по `a6api-access.md`. Перед отправкой получить dry-run без секретов; новый тест — контролируемый отдельный запрос. Не делать повторную оплату на timeout без проверки статуса. Текущие route/price проверить перед следующим batch, исторические значения не выдавать за действующие.

Проверить raw визуально, alpha и размеры машинно. Не использовать общий black-key для уже прозрачного рисунка: старый `prep4.py` может убрать чёрные штрихи. На паре сравнить anchor/bbox, сделать overlay 25/50/75%; исправлять регистрацией целой картинки, не разрезанием/деформацией тела. Сохранять rejected tests с пометкой причины, чтобы их нельзя было принять за approved.
