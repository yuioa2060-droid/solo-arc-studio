# Фитнес-канал: начать работу в Claude

Владелец выбрал направление Rendo и принял аватар № 2 — DRY BRUSH: прежний герой на тёмном фоне, два изумрудных штриха V за ним, немного #0B8371. Следующая просьба — «минималистичный вайбовый» баннер. [Три новых баннера и выбранная ава](branding/README_RU.md); баннер пока не утверждён. SOLO ARC отклонено 11.10.2026. Префикс `solo-arc` в GitHub, скилле и файлах существующего EP1 — технический идентификатор.

Этот файл — инструкция новому Claude или другому агенту, который получил репозиторий. Он объясняет, как восстановить актуальный контекст канала, подключить скиллы, получить медиа и продолжить производство.

Здесь сохранены действующие правила, пожелания, скиллы, утверждённые визуальные материалы и последний рабочий EP1 v11. Это контекст в файлах: его нужно прочитать и применять к заданию. Старые сборки и архивная переписка исключены по пожеланию владельца. Ранее предложенный новый сценарий целиком исключён; не пытайся восстановить его название, hook или план.

## 1. Первое действие Claude

Открой репозиторий как рабочую папку. Сначала прочитай:

1. [CLAUDE.md](CLAUDE.md) и [AGENTS.md](AGENTS.md): приоритет инструкций и рабочие ограничения.
2. [Стартовый контекст](context/START_HERE_RU.md) и [последние пожелания](context/USER_FEEDBACK_RU.md).
3. [Главный скилл](skills/solo-arc-motion/SKILL.md) и **полностью** [действующие правила](skills/solo-arc-motion/references/current-rules-ru.md).
4. [Порядок производства](skills/solo-arc-motion/references/episode-workflow-ru.md).

Затем открывай справочники под текущую задачу из таблиц ниже. Для сценария зависимости рендера и все 700 МБ медиа не нужны. Для визуальных решений посмотри реальные референсы и кадры: чтение имени PNG не заменяет просмотр картинки.

Приоритет: **прямое актуальное указание владельца → действующие правила SOLO ARC → специализированные справочники → общие скиллы и примеры**. Замечания о старых вариантах в аналитических справочниках объясняют приёмы и ограничения; они не возвращают отменённые требования.

После чтения кратко сообщи, что понял про стиль и текущую задачу. Назови только реальные пробелы, которые мешают работе. Не заставляй владельца заново объяснять уже зафиксированные голос, героя, цвета, SFX и фон.

## 2. Как получить репозиторий и медиа

Репозиторий приватный: используй доступ владельца через GitHub или подключение рабочей среды. Не проси положить GitHub-токен в сообщение или файл проекта. Если среда уже импортировала репозиторий, работай в существующем checkout.

Обычный clone с установленным Git LFS скачивает бинарные материалы. Для старта с кодом и текстом можно отложить медиа.

Linux/macOS:

```sh
GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/kirril803-dotcom/solo-arc-studio.git
cd solo-arc-studio
git lfs install --local
```

PowerShell:

```powershell
$env:GIT_LFS_SKIP_SMUDGE='1'
git clone https://github.com/kirril803-dotcom/solo-arc-studio.git
Remove-Item Env:GIT_LFS_SKIP_SMUDGE
Set-Location solo-arc-studio
git lfs install --local
```

Выбери нужный объём скачивания. Команды одинаковы для обеих оболочек:

| Задача | Команда из корня репозитория |
|---|---|
| Понять стиль, написать сценарий или план | Код и Markdown уже в checkout; бинарные медиа можно пока не скачивать |
| Посмотреть героя, стиль и проверенные кадры | `git lfs pull --include="skills/solo-arc-motion/assets/channel/**,episodes/ep1-v11/ref/**,episodes/ep1-v11/film/out/v11/review/**" --exclude=""` |
| Запустить или пересобрать существующий EP1 | `git lfs pull --include="episodes/ep1-v11/film/public/**" --exclude=""` |
| Получить финальный MP4 | `git lfs pull --include="episodes/ep1-v11/solo-arc-ep1-v11.mp4" --exclude=""` |
| Делать новую копию и работать со всеми исходниками | `git lfs pull` |

Полный текущий комплект занимает около 700 МБ. Если вместо картинки/аудио/видео лежит короткий текст с `version https://git-lfs.github.com/spec/v1`, скачался только LFS pointer: выполни нужный `git lfs pull`. Для анализа бинарного референса нужен сам медиафайл.

## 3. Какие скиллы подключены

Все необходимые скиллы уже лежат в `skills/`. Для Claude Code добавлены проектные входы в `.claude/skills/`; после открытия этого репозитория не требуется скачивать их повторно или копировать в домашнюю папку. Входы направляют к исходным файлам, поэтому код, правила и ассеты остаются в одном месте. Такое расположение проектных скиллов описано в [документации Claude Code](https://code.claude.com/docs/en/skills#choose-where-skills-load).

| Скилл / команда Claude Code | Когда применять | Исходный файл |
|---|---|---|
| `/solo-arc-motion` | Основной скилл канала: сценарий, режиссура, изображения, Remotion, звук, QA | [SKILL.md](skills/solo-arc-motion/SKILL.md) |
| `/youtube-script-writer` | Hook/body/payoff, удержание, переходы и практический финал длинного YouTube-ролика | [SKILL.md](skills/youtube-script-writer/SKILL.md) |
| `/motion-graphics` | Приёмы камеры, easing, stagger, типографика и инструменты Mort1d | [SKILL.md](skills/motion-graphics/SKILL.md) |
| `/writers-room-story-engine` | При необходимости усилить причинную структуру объяснения | [SKILL.md](skills/writers-room-story-engine/SKILL.md) |

Главный скилл — SOLO ARC. Дополнительные применять по задаче. Не превращай фитнес-объяснение в вымышленную драму или рекламный showreel. Defaults Mort1d по музыке, beat-grid, fps, длительности и главам не заменяют правила канала.

В Claude Code можно явно вызвать `/solo-arc-motion`. Если среда не поддерживает проектные скиллы или команда не появилась, прочитай `skills/solo-arc-motion/SKILL.md` напрямую и работай по нему. Не переноси исходный скилл без его supporting files: некоторые helpers используют структуру этого репозитория. Если в личных скиллах уже есть одноимённая версия, используй явно файл из текущего checkout.

Для агента в другой платформе инструкции те же: читать Markdown и запускать helpers из исходных `skills/<name>/`, где `<skill>` в справочнике означает именно эту папку, а не небольшой вход в `.claude/skills/`.

## 4. Референсы и рабочие материалы

### Визуальная идентичность и примеры

| Материал | Где находится и для чего нужен |
|---|---|
| Утверждённый герой | [APPROVED-h3-hero-waist.png](skills/solo-arc-motion/assets/channel/APPROVED-h3-hero-waist.png): identity, волосы, лицо, штрих, изумрудные шорты |
| Первый взгляд героя | [h-intro.png](skills/solo-arc-motion/assets/channel/h-intro.png) |
| Прогресс в профиль | [b-w1.png](skills/solo-arc-motion/assets/channel/b-w1.png), [b-w2.png](skills/solo-arc-motion/assets/channel/b-w2.png), [b-w3.png](skills/solo-arc-motion/assets/channel/b-w3.png): целые зарегистрированные изображения, без XY-деформации |
| Песочные часы | [Полные](skills/solo-arc-motion/assets/channel/o-hourglass-full.png) и [почти пустые](skills/solo-arc-motion/assets/channel/o-hourglass-low.png): понятный объект восстановления |
| Референс штриха | [style-ref.png](episodes/ep1-v11/ref/style-ref.png) |
| Текущие предметы и позы | `episodes/ep1-v11/film/public/img/`; роли/размеры — `film/src/imgs.json` |
| Исходные рисунки и промпты EP1 | `episodes/ep1-v11/raw/` и `prompts/`; действующие правила выше формулировок старого запроса |
| Проверочные кадры v11 | `episodes/ep1-v11/film/out/v11/review/` |
| Готовый пример монтажа | [Финальный EP1 v11](episodes/ep1-v11/solo-arc-ep1-v11.mp4) и [описание проекта](episodes/ep1-v11/README_V11_RU.md) |

### Приёмы Ryoga, анимация и фактология

- [Разбор Ryoga](skills/solo-arc-motion/references/ryoga-focus-variants.md): варианты focus, композиция, позы и объяснения. В нём сохранены ссылки на [первый ролик](https://www.youtube.com/watch?v=eOFtwk-R4u8) и [второй ролик](https://www.youtube.com/watch?v=ktCtkkscBTc). Ссылки и разбор включены; полные чужие видео и архивные транскрипты в этом комплекте не хранятся. Если задача требует нового просмотра оригинала, открой источник и сообщай только о фактически увиденном.
- [Direction/tempo](skills/solo-arc-motion/references/direction-and-tempo.md), [patterns](skills/solo-arc-motion/references/patterns.md) и [каталог](skills/solo-arc-motion/references/production-pattern-catalog.json): композиция, смысловые паузы, движение и визуальные способы объяснения.
- [Анатомия](skills/solo-arc-motion/references/anatomy-and-instruction.md), [элементы](skills/solo-arc-motion/references/element-components.md), `skills/solo-arc-motion/assets/elements-study/`: способы guides/focus; маски проверять для конкретной позы.
- [Mort1d upstream](https://github.com/Mort1d/motion-graphics-skills) уже включён в `skills/solo-arc-motion/engines/html-motion/`: движок, инструменты, шрифты, лицензия и руководства. Снимок 1.4.1 / commit `7f0c3714dc81bea52644a5287c6350345009e579`; [происхождение](provenance/MORT1D_SOURCE.json). Для текущей работы повторный clone upstream не нужен. Новые приёмы переносить в Remotion осмысленно; HTML-сцена не становится React-компонентом автоматически.
- [Научные границы EP1](skills/solo-arc-motion/references/science-source-notes-ru.md): первичные источники и пределы допустимых формулировок. Для нового утверждения проверять его точный смысл и источник до записи голоса.

Сохраняй оригинальность. Ryoga служит референсом механизмов, а не текстов или чужой идентичности.

## 5. Что установить для производства

Для чтения контекста и сценария установка runtime не требуется. Для монтажа и генерации нужны:

| Инструмент | Назначение / версия |
|---|---|
| Git и Git LFS | Checkout и реальные PNG/WAV/MP4 |
| Node.js | Рекомендуется 24, минимум 22.4; включает npm |
| Python | 3.11+ для подготовки изображений, marks и микса |
| FFmpeg и FFprobe | Звук, mux, измерения и decode; доступны в PATH |
| Chrome/Chromium | Remotion; `npm run browser:ensure` получает совместимый браузер |
| npm-пакеты проекта | `npm ci` устанавливает закреплённые зависимости; Remotion 4.0.454 |
| Python-пакеты | `requirements.txt`: numpy и Pillow |

Используй уже установленные инструменты. Сначала проверь их наличие. Не меняй Remotion-версию или lockfile ради обычного запуска. Для Linux системные библиотеки перечислены в [Dockerfile](Dockerfile) и [workflow рендера](.github/workflows/render-ep1.yml); если используешь Docker, см. оговорку ниже.

Из корня checkout:

```sh
node --version
npm --version
python --version
ffmpeg -version
ffprobe -version
git lfs version
git lfs pull --include="episodes/ep1-v11/film/public/**" --exclude=""
npm ci
npm run browser:ensure
npm run doctor
npm run render:preview
npm run studio
```

На Linux вместо `python` может быть `python3`. Python-библиотеки ставить в отдельное окружение, когда они нужны:

Linux/macOS:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

В PowerShell при запрете `npm.ps1` использовать `npm.cmd`. На Windows путь к установленному браузеру можно задать `REMOTION_BROWSER_EXECUTABLE`, к FFmpeg — `SOLO_ARC_FFMPEG`. В корневом `.env` значения использует runner; в прямых film-командах передавай их через окружение.

`npm run doctor` проверяет runtime-ассеты, WAV и версии пакетов. `render:preview` создаёт 4 секунды 960×540/30 fps со звуком; `studio` открывает текущий эпизод. `npm run render:ep1` создаёт полный 1920×1080 EP1 в `outputs/`. Полный неизменённый эпизод не нужно повторно рендерить только для ознакомления.

Dockerfile рассчитан на предпросмотр существующего EP1 после скачивания его LFS runtime-ассетов. Он не содержит весь переносимый контекст, voice/raw и Python-библиотеки для производства нового выпуска. Для полной работы используй весь checkout с окружением выше. Не собирай Docker image из pointer-файлов вместо медиа.

## 6. Голос, изображения и ключи

`ELEVENLABS_API_KEY` и `A6API_KEY` уже записаны в **GitHub Actions Secrets** репозитория. Они подключаются к соответствующим workflow, но **не передаются обычному git clone и не извлекаются обратно из GitHub**. Для Claude в отдельной среде владелец задаёт эти переменные в её секретном окружении. Ключи не копировать в Markdown, скрипты, Git, prompts или логи.

Для локальной работы можно заполнить игнорируемый `.env` по [.env.example](.env.example). Без ключей доступны чтение, монтаж имеющихся материалов, preview и dry-run. Наличие ключа не является отдельным заданием на платную генерацию.

Голос: Jonathan `oyxaSt75JW8l04MCJaSo`, `eleven_v3`, stability `0.5`. Сначала проверить запрос:

```sh
npm run voice -- --script episodes/ep1-v11/voice/full.txt --out outputs/voice/check
```

Это dry-run. Для **нового** английского текста по производственному заданию helper отправляет запрос только с `--send`:

```sh
npm run voice -- --script PATH_TO_NEW_ENGLISH_TEXT.txt --out outputs/voice/new-take --send
```

Он сохраняет raw MP3, alignment, word marks и metadata. После изменения речи/пауз нужна актуальная разметка; нельзя использовать тайминги EP1 под новым текстом. Не менять естественную скорость через atempo. Текущий пример речи и слов лежит в `episodes/ep1-v11/voice/`.

Изображения создавать через **A6API**. [Правила запросов](skills/solo-arc-motion/references/object-and-image-prompts-ru.md), [доступ](skills/solo-arc-motion/references/a6api-access.md). Сначала помощь и dry-run:

```sh
node skills/solo-arc-motion/scripts/a6api-reference.mjs --help
node skills/solo-arc-motion/scripts/a6api-reference.mjs --ref skills/solo-arc-motion/assets/channel/APPROVED-h3-hero-waist.png --ref episodes/ep1-v11/ref/style-ref.png --prompt-file episodes/ep1-v11/prompts/eff-h-explain.txt --out outputs/images/check.png
```

Второй пример проверяет готовый запрос офлайн и ничего не генерирует. Для нового теста заменить prompt/референсы по их ролям. Реальная отправка требует `--send`, ключа в окружении, действующего `--route-id` и проверенного `--expected-price`. При локальном `.env` этот прямой helper запускать как `node --env-file=.env ...`.

Helper не устанавливает strict provider pin в аккаунте. Это необходимо проверить отдельно перед оплатой. Старые route/price в справочниках — история доступности, не действующая гарантия. При timeout сначала проверить статус/списание, не посылать слепые повторные запросы. Новые ключевые картинки показать небольшим тестом до партии; уже принятые материалы не требуют повторного согласования.

Присланная музыка: `episodes/ep1-v11/film/public/audio/music-original.wav`. Мастер: `master-v11.wav` в той же папке. Voice/SFX/music stems: `film/out/v11/`. Мастер уже включает AT=1.0 и нормализацию; не сдвигать голос и не делать loudnorm повторно при mux.

## 7. Как делать следующий выпуск

Если задача — только сценарий/план, завершить этот результат без оплаты изображений или TTS. Тему и объём определяет актуальное задание владельца. Исключённого нового сценария здесь нет; наличие старого teaser не означает, что новый текст уже утверждён.

Для полного производства:

1. Построить оригинальный английский сценарий с ясным hook, причинной цепочкой и практическим payoff. Сверить научные утверждения.
2. Спланировать визуальные мысли: фраза → понятный предмет/поза/сравнение → движение → читаемое удержание. Не добавлять PNG только ради заполнения экрана.
3. Получить нужные медиа через `git lfs pull`. Создать независимую копию текущего примера:

   ```sh
   node skills/solo-arc-motion/scripts/new-episode.mjs --out episodes/new-video
   ```

4. Заменить текст, voice/alignment/marks, тайминги, сцены, активные PNG и эпизодный микс. Внутренние Film6/tl6/Ep6 принадлежат текущему примеру; копирование не создаёт готовый новый сценарий.
5. Новые ключевые рисунки проверить по малым тестам, затем подготовить alpha и регистрацию целых PNG. Подписи/числа/стрелки рисовать кодом.
6. Смонтировать по реальным словам. Чередовать героя, SideText, объект, фразу на чёрном, упражнения, сравнение и план. Соблюдать паузы; SFX тихие, без whoosh на каждом Week/смене тела. Фон чистый, без grain/dust.
7. Проверить кадры и короткие клипы сложных переходов со звуком; затем финальный render, decode, громкость и окончание. [QA](skills/solo-arc-motion/references/qa-and-handoff-ru.md) описывает границы каждой проверки. Только реально выполненный просмотр/прослушивание можно назвать выполненным.
8. Сохранить актуальные код, PNG/raw/prompts, script/voice/marks, SFX/stems, MP4 и QA. Новые принятые пожелания записать в current-rules и краткий feedback. В этот комплект не возвращать архивные сборки и дубли.

## 8. Работа через GitHub Actions

Если платформа предоставляет только GitHub и нет собственного рендера, использовать вкладку **Actions**:

- **Render EP1 / preview**: по умолчанию короткий preview; `full_video=true` — весь существующий EP1. После успеха MP4 доступен в artifacts запуска.
- **Generate Jonathan voice**: путь к английскому `.txt` в репозитории, по умолчанию dry-run. `send_paid_request=true` явно включает оплату. Результат — voice/alignment artifact.

Эти workflow проверены на исходном EP1. Они не адаптируют новый фильм автоматически: для нового выпуска должны указывать на его сценарий/проект. Workflow генерации изображений пока нет; использовать A6API helper в доступной среде с секретным окружением.

Если у Claude нет терминала или доступа к закрытому репозиторию, он может прочитать предоставленные Markdown и подготовить сценарий/план/prompts. Такой режим не подтверждает скачивание ассетов, отправку API или рендер. При реальном недостающем доступе назвать конкретный шаг, который требует среды владельца.

## 9. Готовое первое сообщение Claude

Скопировать после импорта репозитория:

> Продолжай проект SOLO ARC из этого репозитория. Сначала прочитай START_CLAUDE_RU.md, CLAUDE.md, AGENTS.md, context/START_HERE_RU.md, context/USER_FEEDBACK_RU.md, skills/solo-arc-motion/SKILL.md и полностью current-rules-ru.md. Подключённые проектные скиллы используй по задаче; новые defaults не должны отменять правила канала. Определи нужные файлы и зависимости, скачай LFS-медиа для текущей задачи и проверь окружение, если нужен монтаж. Не восстанавливай исключённый новый сценарий и не возвращай старые сборки. Кратко скажи, что понял и есть ли реальные пробелы, затем выполняй моё актуальное задание. Обсуждение — по-русски, видео — на английском. Ключи только из секретного окружения. Не объявляй техническую проверку художественным просмотром. Моё текущее задание: [написать здесь задачу].

## 10. Где проверить состав

[CURRENT_MANIFEST.json](provenance/CURRENT_MANIFEST.json) перечисляет текущие файлы и SHA-256; для текста это байты Git после нормализации переносов строк, для медиа — полные LFS-объекты. [Локальные проверки](provenance/LOCAL_VERIFICATION.json) и [GitHub-проверки](provenance/GITHUB_VERIFICATION.json) фиксируют выполненный запуск и скачивание EP1. Они описывают конкретные проверки, не обещают вечную память модели.

Корневой `CLAUDE.md` служит коротким входом для Claude Code; устройство таких инструкций описано в [официальной документации](https://code.claude.com/docs/en/memory). Если используешь другой клиент, явно передай ему этот стартовый файл и доступ к связанным материалам.
