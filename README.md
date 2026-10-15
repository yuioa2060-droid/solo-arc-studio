# Rendo — студия иллюстрированных фитнес-роликов

Актуальная передача для Claude на 15 октября 2026: **два готовых ролика и активный EP3**, код, доступные исходники и медиа, скиллы, референсы, новые превью, тексты публикации и последние правила.

**Активная задача — закончить EP3 по принятому минутному примеру.** Сначала читать [START_CLAUDE_EP3_RU.md](START_CLAUDE_EP3_RU.md) и [context/EP3_CURRENT_RU.md](context/EP3_CURRENT_RU.md). Полный первый EP3 отклонён; 60.3-секундная новая подача принята. Красные brush-зачёркивания и стрелки упражнений ещё предстоит внести, полный новый выпуск ещё не собран.

Общая передача — [START_CLAUDE_RU.md](START_CLAUDE_RU.md). Claude Code читает [CLAUDE.md](CLAUDE.md), проектные скиллы уже подключены в `.claude/skills/`.

| Выпуск | Финальный MP4 | Исходники |
|---|---|---|
| EP1 v11 | [solo-arc-ep1-v11.mp4](episodes/ep1-v11/solo-arc-ep1-v11.mp4) | Полный редактируемый Remotion-проект, PNG/raw/prompts, голос и word marks, музыка/SFX/stems. |
| EP2 — **How I Lost Fat Without Starving Myself** | [rendo-ep2-hunger-v6.mp4](episodes/ep2-hunger/final/rendo-ep2-hunger-v6.mp4) | Финал 6:27.2, раздельный звук, сценарий, код концовки и повторной сборки, доступные PNG/raw/prompts, тайминги и QA. |

**Граница исходников EP2:** оригинальные слои основной части Film2/ep2lib/tl2, её полный alignment и 31 исходный PNG в переданной папке не сохранились. Основная часть доступна как сведённое видео; код концовки редактируется, весь финал пересобирается из MP4 и stems. Это прямо объяснено в [карте исходников](context/SOURCE_SCOPE_RU.md), без подмены другим роликом. Полный scaffold для новых выпусков — EP1.

Текущие материалы EP2: [описание с восемью главами, без ссылок на исследования](episodes/ep2-hunger/description.txt), [теги на 500 символов](episodes/ep2-hunger/tags.txt), [два последних варианта превью](episodes/ep2-hunger/thumbnail/deliver/title-match-overview.jpg). Название выбрано владельцем; финальное превью из двух ещё не выбрано. Ни эти поля, ни видео этой передачей в YouTube не публиковались.

Альтернативный черновик EP2, собранный ассистентом (не финал владельца): [`episodes/ep2-alt-hunger-dials/`](episodes/ep2-alt-hunger-dials/README_EP2_RU.md) — другой сценарий и монтаж на ту же тему («Why You're Always Hungry on a Diet (And How to Turn It Down)»), основной MP4 и вариант с музыкой по 5:08. Название и описание не утверждены, публикации не было.

## Получить медиа и запустить

PNG, шрифты, звук и MP4 хранятся в Git LFS. Нужны Git LFS, Node.js 22.4+ (рекомендуется 24), Python 3.11+, FFmpeg/FFprobe; зависимости Remotion закреплены lockfile.

```sh
git clone https://github.com/yuioa2060-droid/solo-arc-studio.git
cd solo-arc-studio
git lfs install --local
git lfs pull
npm ci
npm run doctor
npm run studio
```

`npm run render:ep1` пересобирает EP1. `npm run check:ep2` проверяет код концовки; `npm run render:ep2-ending` рендерит её отдельно. `npm run rebuild:ep2 -- --out outputs/ep2-rebuilt.mp4` повторно собирает весь текущий EP2 из сохранённых stems и видео. [Подробности EP2](episodes/ep2-hunger/README_RU.md).

Для чтения без скачивания всех медиа: перед clone задать `GIT_LFS_SKIP_SMUDGE=1`, затем скачать нужные пути через `git lfs pull --include="..." --exclude=""`. Короткий текст `version https://git-lfs.github.com/spec/v1` вместо картинки/видео означает, что реальный файл ещё нужно скачать.

## Правила и инструменты

Главный [скилл канала](skills/solo-arc-motion/SKILL.md) и [действующие правила](skills/solo-arc-motion/references/current-rules-ru.md). Дополнительно включены a6-image, motion-graphics/Mort1d, youtube-script-writer и writers-room-story-engine. [Последние пожелания](context/USER_FEEDBACK_RU.md); исследования конкурентов сохранены в `research/`, оформление — в `branding/`.

Rendo — рабочее имя, handle не подтверждён. Белые волосы, изумрудные шорты #0B8371, чистый тёмный фон, осмысленные манга-иллюстрации. Новые картинки и правки **только через A6API**. Jonathan `oyxaSt75JW8l04MCJaSo`, `eleven_v3`, stability 0.5. EP2 чуть энергичнее, с разнообразным монтажом и органическим ambient без битов/басовой линии. Сборки старых версий, исходный ZIP и прежний локальный EP2 4:15 в актуальный комплект не добавлены.

## Ключи

Репозиторий сейчас публичный. Рабочий ключ последних A6API-превью сохранён в **зашифрованном GitHub Actions Secret `A6API_KEY`** этого репозитория; `ELEVENLABS_API_KEY` также хранится в Secrets. Значений в файлах нет. Ключи не приходят с clone: для локального Claude/Hoplite нужно отдельно настроить переменные окружения или игнорируемый `.env` по `.env.example`. Либо использовать ручные workflows Actions, где секрет подставляется автоматически. Платные запросы не запускаются при push или обычной установке.


## EP3: что именно добавлено

[Полный комплект](episodes/ep3-belly-fat/README_RU.md): все205 файлов двух новых архивов, полный присланный диалог, принятый минутный MP4 и отклонённый полный MP4. ZIP-контейнеры не продублированы. Сценарий/голос на468.07сек готовы, остальные сцены нужно заново поставить по принятому направлению. Новые красные brush-зачёркивания/стрелки пока задания, не выполненные правки.

`npm run check:ep3`, `npm run studio:ep3`, `npm run render:ep3-sample` работают из корня. Новые кадры можно делать через [a6-image](skills/a6-image/SKILL.md); по последнему тесту работает Nano Banana2.1, GPT требует ремонта/проверки маршрута. [Датированный статус](context/API_STATUS_20261015_RU.md).
