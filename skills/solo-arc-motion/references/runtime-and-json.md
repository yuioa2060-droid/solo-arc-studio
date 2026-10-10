> ARCHIVE / HISTORICAL REFERENCE. Действующие правила после v10 находятся в [current-rules-ru.md](current-rules-ru.md). Старые красные/оливковые шорты, винтажные обёртки, обязательная музыка и жёсткие promo defaults отменены. Примеры алгоритмов использовать только после сверки текущего смысла/ассета.

# Исполняемая схема и интеграция

## Два разных JSON

Строгий `storyboard.json` существующего конвейера хранит сценарий/промпты сцен по своей схеме. Не дописывать туда неподдерживаемые layers, flashes, видеоимпорты и sound events. Для этой ветки — отдельный `motion-plan.json`. Наличие скилла не делает storyboard другого канала автоматически совместимым.

В `motion-plan.json` версии 1:

- `fps: 60`, `duration`: секунды; размер 1920×1080 у текущего runtime фиксирован;
- `audio`: необязательный собственный путь внутри public; отсутствие означает немой аниматик;
- `persistent`: отдельные слои для сохраняемых угловых номеров;
- `scenes`: не пересекающиеся окна `{id,a,b,purpose,layers}`; промежуток между окнами даёт пустую сцену;
- `reviewTimes`: желательные секунды still-review;
- `scene.words`: для аудио — реально выровненные `{text,start,end}` в глобальных секундах.

Текущий JSON runtime поддерживает sprite, text, guide, localCue, badge, gauge, cycle, calendar, plan. Остальные 17 приёмов собираются комбинациями, а отдельные сложные часы/частота и новые типы требуют явной адаптации кода. Unsupported type вызывает ошибку, а не молча исчезает.

## Слои

Общие: уникальный `id`, `type`, `a`, `b` в секундах; window внутри текущей scene. Все значения глобальные, не относительные. `x` — горизонтальный центр, `y` — верх, `w` — ширина. Текст с `align:"left"` использует x как левый край.

| Тип | Поля и смысл |
|---|---|
| sprite | `asset`=PNG basename в public/assets; x,y,w; rise/slideX; entryDuration; fadeIn/fadeOut; idleMotion:false для неподвижности; states:[[at,asset],…]; poseBlend; highlightPath/highlightAt/color опционально |
| text | text, x,y,w,size,bold,align,wrap,color; role не задан для визуальной метки/числа. `role:"spoken"` требует audio, собственные words и совпадение с scene.words |
| guide | target=id sprite, anchor=[u,v] на холсте, labelPoint=[screenX,screenY], control необязательная квадратичная точка; lineAt,drawDuration,color |
| localCue | target=id sprite; `cueKind`: label/arrow/line/cross/angle; points=[normalized…] для пути, point для label/cross/angle; text,color,drawDuration,fontSize,degrees |
| badge | n, size, x,y,color; persistent для сохранения через паузу/карточку |
| gauge | fill 0…1, w,x,y,color,initiallyFilled; не выдавать интерполяцию за установленное значение |
| cycle | text,size/width,fontSize,x,y; число не вращается с рисованными стрелками |
| calendar | days 1…31,w,x,y,rest; реальная длительность, не количество всех клеток сетки |
| plan | x,y,w,rowHeight,pitch,rowRise,rowEntry,hidden; rows=[{asset,title,detail,at,fontSize?}]. hidden создаёт растры текущих собственных карточек 82×20 перед рендером |

`public/assets/meta.json` связывает basename с реальными width/height. Все states одной группы должны иметь одинаковый полный холст. Метаданные не вычисляют и не исправляют анатомию. Guide anchor относительно полного холста с прозрачными полями.

Для `sprite.highlightPath` теперь обязательно `anatomy:{target,reason,view,landmarks,excluded:[…],sources:[…],assetSha256}`. Валидатор требует смысл, источники и привязку к принятому PNG; новая поза не может наследовать единственный путь. Это поля отдельного motion-plan, не строгого storyboard. Проверка метаданных не подтверждает анатомию автоматически: перед рендером выполнить [проверку по анатомическим источникам](anatomy-and-instruction.md). В исходном demo-plan неподтверждённая декоративная заливка живота удалена; исторический MP4 не переписывался.

## Команды

`scripts/scaffold.mjs --out <new folder> --demo` копирует runtime, own demo assets/fonts и новый оригинальный silent plan. Вызывать в каталоге под репозиторием с установленными `@remotion/bundler`, `@remotion/renderer`, `react`, `sharp`. Никаких API/ключей в этих командах нет.

- `node <production>/plan-check.mjs` — окна/типы/связи/позы/реальные PNG/числа; exact spoken-card check только при переданной собственной word-разметке.
- `node <production>/render.mjs --stills` — растры hidden plan + ключевые stills/contact sheets.
- `node <production>/render.mjs` — deterministic Remotion render; проверка текста на каждом кадре; `motion-demo.mp4` и `render-verification.json`. Для реальной narrated задачи переименовать результат осмысленно после финальной проверки.

Текущие DOM QA не доказывают анатомию, хорошую интонацию или совпадение текста с неизменяемым внешним аудио сами по себе. Обязательно применить sound-and-review. У визуальных меток могут быть другие короткие формулировки, чем в речи, если они объясняют именно ту же мысль; дословные карточки проверяются строже.

## Проверенная производственная база

Полный расширенный пример: `D:/AI/Automated-Video-Generator/workspace/production/ryoga-six-pack-v16-20261005/`. Там дополнительные SessionPlan/TeaserPlan/SessionSymbols и отдельные gates для всех демонстраций/глав. Полный фильм не включён в скилл; собственные чертежи и подмножество runtime переносимы. Архив скилла не содержит чужих screenshots, полного защищённого transcript, аудиоключей или исходного звука.

Процессные `remotion-pipe.cjs` / `remotion-assets.cjs` — адаптация текущего Windows Chrome/Remotion, без изменения общей установки пакетов. При обновлении Remotion внутренних API сначала проверить обычный поддерживаемый renderer; не переносить monkeypatch как универсальное требование чужому компьютеру.
