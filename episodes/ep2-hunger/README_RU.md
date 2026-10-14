# EP2 — How I Lost Fat Without Starving Myself

Название выбрано владельцем после получения финала. Прежняя подпись архива How I Stopped Being Hungry on a Diet сохранена как source_archive_title в episode.json. Описание/главы/теги — [UPLOAD_RU.md](UPLOAD_RU.md); последние два предложения превью — [thumbnail/README_RU.md](thumbnail/README_RU.md). Ранний локальный4:15 вариант сюда не включён.

Финал: final/rendo-ep2-hunger-v6.mp4, 1920×1080, 30fps, 6:27.2.
Вступление ускорено примерно на8% (54.033→50.033сек), тембр сохранён. После границы исходный темп и принятый монтаж. Музыка не ускорена, V5-прижатие пиков сохранено; на музыкальном splice1.5сек smoothstep.

**Сначала читать HOW_IT_WAS_MADE_RU.md.** Код новой концовки в film/src/, PNG в film/public/, доступные raw/prompts отдельно. Финальные stems в audio/stems/, сценарий в voice/full.txt, timing map/QA в qa/.
Основная часть EP2 — flattened video fixture внутри финального MP4, не полноценный набор исходных Remotion-слоёв. Подробнее [SOURCE_SCOPE_RU.md](../../context/SOURCE_SCOPE_RU.md). Полный editable scaffold для новых выпусков — ../ep1-v11/.

## Команды из корня архива
python episodes/ep2-hunger/build/rebuild-current.py --out /путь/к/rebuilt.mp4
node episodes/ep2-hunger/render.mjs

Первое повторяет микс/финальный export из финального video fixture и текущих stems. Второе отдельно рендерит новый Remotion-финал; по умолчанию экспорт и проверочные кадры попадают в корневой `outputs/`, не поверх принятых исходников.

Удобные корневые команды: `npm run check:ep2`, `npm run render:ep2-ending`, `npm run rebuild:ep2 -- --out outputs/ep2-rebuilt.mp4`. Для новой концовки: `npm run rebuild:ep2 -- --out outputs/ep2-with-new-ending.mp4 --ending-video outputs/ep2-ending.mp4`.

Клип должен иметь468кадров/30fps/1920×1080/full-range PC; длина15.6сек. Рендер создаёт RGB PNG frames и кодирует их сразу в full-range H.264; сборка проверяет размер/fps/длину/диапазон. Не делать TV→PC на уже PC-клипе. На Windows можно задать `REMOTION_BROWSER_EXECUTABLE`, `SOLO_ARC_FFMPEG`, `SOLO_ARC_FFPROBE`, `SOLO_ARC_PYTHON`; в других системах достаточно установленных Chrome/FFmpeg/Python.

Для микса нужен полный FFmpeg с фильтром `alimiter`; mini-FFmpeg из Remotion его не содержит. Если установлено несколько FFmpeg, задать путь полного build в `SOLO_ARC_FFMPEG` и путь FFprobe в `SOLO_ARC_FFPROBE`. Скрипт проверяет наличие фильтра до сборки.

`build/lower-music-reference.py` — сохранённый рецепт старой корректировки музыки, его исходные revision4 stems отсутствуют. Для текущей повторной сборки этот скрипт не нужен: финальные stems уже включены.

Настоящие элементы YouTube добавить на6:17.2–6:27.2: EP1 справа сверху, subscribe справа снизу. Они не впечены в MP4.
Измерения исходной передачи в qa/summary.json; новые проверки переноса — в корневом provenance/UPDATE_20261014.json. Полное прослушивание здесь не заявляется. Сценарий не является проверенной реальной биографией владельца; научные формулировки сверять отдельно. Комплект подготовлен для GitHub; публикация/поля YouTube этой передачей не менялись.
