# Текущий Remotion-проект EP1 v11

Рабочая копия: `episodes/ep1-v11/film/` от корня репозитория. Remotion 4.0.454, React 19, TypeScript, 1920×1080, 30 fps, 9743 кадра, около 324.77 секунды.

- `src/Film6.tsx`: текущая последовательность сцен и слова-триггеры.
- `src/tl6.ts`: word timings, границы секций, AT=1.0 и TOTAL.
- `src/lib*.tsx`: используемые компоненты, whole-PNG body fade, SideText, plan и guides.
- `src/imgs.json`, `body.json`: размеры PNG и регистрация профильных тел.
- `src/AudioRoot.tsx`: Studio со звуком из `public/audio/master-v11.wav`.
- `../voice/`: текущая озвучка, английский текст и marks.
- `out/v11/`: отдельные voice/SFX/music stems, актуальные SFX events и фактические QA reports.

Названия Film6/tl6/Ep6 сохранены внутри текущего кода и не означают отдельный старый выпуск. PNG переход тела — зарегистрированный fade целых картинок, не mesh morph. Песочные часы используют два состояния PNG; самостоятельный поток песка пока не реализован.

Корневые `npm run doctor`, `studio`, `render:preview`, `render:ep1` работают с этой копией. Прямой portable renderer:

```sh
node render-portable.mjs --stills 5,227,229,266 --out out/review
node render-portable.mjs --from 222 --to 233 --out out/clip.mp4
node render-portable.mjs --out out/episode-with-audio.mp4
```

`--stills`, `--from`, `--to` задаются в секундах, конец клипа исключающий. Исходная композиция Ep6 не содержит Audio; renderer добавляет текущий master через FFmpeg без повторной нормализации. WAV уже включает AT=1.0, не сдвигать его повторно. `--silent` создаёт немую картинку.

`render-resume.mjs` сохраняет кадры и продолжает после прерывания; cache key учитывает src, public без audio и package files. Рендер-кэш не хранится в Git.

На Windows process-local `win-runtime` adapters не изменяют node_modules и существующий пользовательский браузер. `SOLO_ARC_WINDOWS_ADAPTERS=0` отключает их, `REMOTION_BROWSER_EXECUTABLE` выбирает браузер. FFmpeg: PATH, `SOLO_ARC_FFMPEG` или `--ffmpeg`.

`doctor.mjs` проверяет PNG signatures/размеры, WAV duration и версии пакетов; он не оценивает творческое качество. Для пересборки микса `mix-v11.py` использует текущие принятые stems и исходную музыку, выдавая результат в отдельную папку. Исходный MP4/master сохраняются.

Новый выпуск требует новых слов, marks, сцен и микса; `mktl6.py` является EP1-специфичным примером подготовки таймингов. Маски/guides перепроверить после изменения позы. Параметры и индексы EP1 не переносить автоматически.
