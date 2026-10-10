# SOLO ARC Studio

Актуальный комплект для производства роликов SOLO ARC: действующие правила и пожелания, скиллы, утверждённый герой, референсы, рабочий Remotion-проект и финальный **EP1 v11**. Репозиторий приватный. Старые версии видео, архивные сборки и переписка не включены. Новый предложенный сценарий также исключён.

**Для Claude и нового агента начать с [START_CLAUDE_RU.md](START_CLAUDE_RU.md)**: что прочитать, какие медиа скачать, какие зависимости нужны, как подключены скиллы, где референсы и как продолжать производство. В конце есть готовое первое сообщение Claude. Проектные скиллы Claude Code уже добавлены в `.claude/skills/`.

Основной контекст — [здесь](context/START_HERE_RU.md), канон — [скилл SOLO ARC](skills/solo-arc-motion/SKILL.md) и [действующие правила](skills/solo-arc-motion/references/current-rules-ru.md).

| Папка | Назначение |
|---|---|
| `episodes/ep1-v11/` | Последний ролик, редактируемый монтаж, актуальные PNG/raw/prompts, английский текст, голос и word marks, музыка, SFX и отдельные stems |
| `skills/solo-arc-motion/` | Правила канала и инструменты: сценарий, режиссура, изображения, анимация, звук, проверка |
| `skills/motion-graphics/`, `youtube-script-writer/`, `writers-room-story-engine/` | Дополнительные приёмы; правила SOLO ARC имеют приоритет |
| `context/` | Стартовая информация и последние прямые пожелания |
| `provenance/` | Состав текущего комплекта, происхождение Mort1d, фактические проверки |
| `scripts/`, `.github/workflows/` | Запуск, рендер и Jonathan через GitHub Actions |

Готовый ролик: [solo-arc-ep1-v11.mp4](episodes/ep1-v11/solo-arc-ep1-v11.mp4). Бинарные медиа хранятся в Git LFS; код и правила доступны обычным Git checkout.

## Запуск

Node.js 22.4+ (рекомендуется 24), Python 3.11+, FFmpeg, Git LFS. Dockerfile содержит Linux-зависимости Chrome. Для Windows можно указать `REMOTION_BROWSER_EXECUTABLE` и `SOLO_ARC_FFMPEG`.

```sh
git clone https://github.com/kirril803-dotcom/solo-arc-studio.git
cd solo-arc-studio
git lfs install --local
git lfs pull
npm ci
npm run doctor
npm run studio
```

Для импорта сначала только кода и текста: перед clone задать `GIT_LFS_SKIP_SMUDGE=1` (PowerShell: `$env:GIT_LFS_SKIP_SMUDGE="1"`), затем выполнить `git lfs pull`. После clone в PowerShell удалить временную переменную: `Remove-Item Env:GIT_LFS_SKIP_SMUDGE`.

`npm run render:preview` создаёт четырёхсекундный 540p пример, `npm run render:ep1` — полный 1080p ролик в `outputs/`. Studio уже подключает звук. Подробности устройства монтажа — [Remotion](skills/solo-arc-motion/references/remotion-production-ru.md).

## Ключи и голос

`ELEVENLABS_API_KEY` и `A6API_KEY` сохранены как зашифрованные GitHub Actions Secrets этого репозитория. Значения отсутствуют в файлах и Git-истории. Отдельная среда агента получает ключи через переменные окружения: Secrets не передаются автоматически обычному clone.

Для локальной работы заполнить `.env` по `.env.example`; Git его игнорирует.

```sh
# Проверка запроса, без платной генерации.
npm run voice -- --script episodes/ep1-v11/voice/full.txt --out outputs/voice/example
# Отправка включается явно.
npm run voice -- --script PATH_TO_ENGLISH_SCRIPT.txt --out outputs/voice/new-take --send
```

Jonathan: `oyxaSt75JW8l04MCJaSo`, `eleven_v3`, stability `0.5`, естественная скорость. Helper сохраняет MP3, character alignment и word marks.

Изображения: `skills/solo-arc-motion/scripts/a6api-reference.mjs`, [настройка A6API](skills/solo-arc-motion/references/a6api-access.md). По умолчанию dry-run; платный `--send` требует проверенного route и expected price. Новые ключевые рисунки сначала показать небольшим тестом.

## Через GitHub

На вкладке Actions есть ручные **Render EP1 / preview** и **Generate Jonathan voice**. Рендер получает нужные LFS-ассеты и выдаёт MP4 как artifact. Голос принимает путь к английскому `.txt`; по умолчанию проверяет запрос без оплаты. Платные генерации не запускаются автоматически при push.

Для нового выпуска следовать [производственному процессу](skills/solo-arc-motion/references/episode-workflow-ru.md):

```sh
node skills/solo-arc-motion/scripts/new-episode.mjs --out episodes/new-video
```

Helper делает независимую копию текущего v11. Для нового видео заменить сценарий, голос/marks, тайминги, сцены, картинки и микс. EP1 служит рабочим примером; его содержание и тайминги не являются обязательным шаблоном.
