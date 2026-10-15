"""Generate notes/a6api-log-ru.md (from raw/*.audit.json) and notes/director-plan-ru.md (from voice/marks.json)."""
import json, re, glob, os
root = os.path.join(os.path.dirname(__file__), '..')
# ---------- A6API log
rows = []
for f in sorted(glob.glob(os.path.join(root, 'raw', '*.audit.json'))):
    a = json.load(open(f)); n = os.path.basename(f).replace('.audit.json', '')
    rows.append((n, a.get('status'), a.get('httpStatus'), a.get('billedUnits'), a.get('startedAt', '')[11:19], ', '.join(r['name'] for r in a.get('references', [])), (a.get('promptSha256') or '')[:10], (a.get('error') or '')[:70]))
tot = sum(r[3] or 0 for r in rows)
L = ['# A6API: журнал генерации EP2', '',
     'Маршрут как заявлен: `https://a6.a6api.com/v1/images/edits`, `gpt-image-2.5`, route-id `4995`, ожидаемая цена `$0.0012` (историческая; helper не доказывает фактический route). '
     'Фактическая стоимость считалась по счётчику `GET /v1/dashboard/billing/usage` до и после каждого запроса (500000 единиц = 1 USD). Запросы шли строго последовательно.', '',
     '| Имя | Статус | HTTP | Единиц | Время UTC | Референсы | prompt sha | Ошибка |', '|---|---|---|---|---|---|---|---|']
for r in rows:
    L.append('| ' + ' | '.join(str(x if x is not None else '') for x in r) + ' |')
L += ['', f'Итого по записям: **{tot} единиц ≈ ${tot/500000:.4f}** (запись `o-fish` — отказ 403 без списания; `o-alarm` — оплаченный таймаут).', '',
      '## Сбои и остановка', '',
      '- `o-alarm`: HTTP 504 после 5 минут, изображение не получено. Счётчик показал **780 единиц списания** — таймаут не равен бесплатному запросу; повтор не отправлялся.',
      '- `o-fish`: HTTP 403 «当前可用额度不足» (доступный баланс аккаунта не покрывает запрос); повтор одним запросом дал тот же отказ, списания 0. После этого серию остановили.',
      '- `o-beans`, `h-glass`, `h-turn` в пакетной очереди **не отправлялись**: обёртка упала до запроса (ответ 429 от точки чтения расхода; исправлено — теперь используется `/v1/dashboard/billing/usage`).',
      '- Позже, когда монтаж уже был отрендерен, один пробный запрос `o-beans` прошёл (900 единиц): баланс снова позволял генерацию (причина не выяснялась). Рисунок хороший, но в ролике не используется: сценарий называет только яйца, йогурт и курицу.',
      '- Запланированные, но **не созданные** рисунки: будильник `o-alarm`, рыба `o-fish`, герой с водой `h-glass`, герой «крутит ручку» `h-turn`. Монтаж обходится без них (ручки нарисованы кодом, остальные герои — принятые позы EP1). Промпты лежат в `prompts/`; запуск — `tools/a6gen.mjs <имя> --obj|--hero --send`. Другие модели/сервисы не использовались: правило канала разрешает только A6API в принятом стиле.', '',
      '## Принятые рисунки', '',
      'Просмотрены глазами на тёмном фоне #060606 (контактные листы): лицо/волосы/шорты героя, штрих, цвета, края alpha. Приняты и используются: `h-hungry`, `o-apple`, `o-applesauce`, `o-applejuice`, `o-yogurt`, `o-soup`, `o-bowl`, `o-potato`, `o-glass`, `o-eggs`, `o-chicken`. Принят, но не используется: `o-beans`. Raw лежат в `raw/`, активные RGBA — `film/public/img/` (alpha по связной чёрной области от границы, внутренние чёрные линии не вырезаются: `tools/prep_alpha.py`).']
os.makedirs(os.path.join(root, 'notes'), exist_ok=True)
open(os.path.join(root, 'notes/a6api-log-ru.md'), 'w').write('\n'.join(L) + '\n')
print('a6 log', len(rows), 'rows', tot, 'units')

# ---------- director plan from final marks
M = json.load(open(os.path.join(root, 'voice/marks.json'))); AT = 1.0
nz = lambda s: re.sub(r"[^a-z0-9'\-]", '', s.lower().replace('’', "'"))
WT = [nz(m['text']) for m in M]; ST = [AT + m['start'] for m in M]
def T(p, n=1):
    q = [nz(x) for x in p.split()]; c = 0
    for i in range(len(WT) - len(q) + 1):
        if WT[i:i + len(q)] == q:
            c += 1
            if c == n: return ST[i]
    raise SystemExit('missing ' + p)
mm = lambda s: f'{int(s//60)}:{s%60:05.2f}'
beats = [
 ("You're eating a little less", 1, 'герой `h-hungry` (взгляд в камеру, рука на животе) слева + SideText', 'slow-whoosh на входе'),
 ('and by evening', 1, 'ночной холодильник `p-fridge` (focus), фраза «all you can think about is food»', 'короткий sw'),
 ("that's not weakness", 1, '`h-cross` + SideText «not weakness / not a lack of discipline / your body doing what it was built to do»', 'тихий sw'),
 ('when you eat less', 1, 'одна большая ручка-дайл «HUNGER ALARM»: стрелка уходит вверх, красная дуга и волны — тревога громче', 'swf на подъёме'),
 ('that alarm has dials', 1, 'четыре дайла PROTEIN / VOLUME / REAL FOOD / EVENING (код) — обещание на весь ролик', '4 щелчка + boom'),
 ('and at the end', 1, '`h-explain` + размытый веер карточек дня (HiddenPlan: тот же план раскроется в конце)', 'sw'),
 ('first why is it so loud', 1, 'чёрный ритуал → одна фраза на чёрном', '—'),
 ('in one famous study', 1, '`h-think` + график двух линий «hunger signals ↑ / fullness signals ↓» до и спустя год (качественно; Sumithran 2011)', 'sw, 2× tech'),
 ("you don't need to go anywhere near it", 1, 'две строки на чёрном: «small gap gets noticed»', '—'),
 ("so you can't switch hunger off", 1, 'большая ручка возвращается: стрелка падает, но не до нуля — «only turn it down»', '8 щелчков'),
 ('dial number one', 1, 'карта дайлов: подсвечен 1 (PROTEIN)', 'sw'),
 ('in one small study', 1, 'столбики доля белка 15% → 30%; затем счётчик −441 kcal/день и −4.9 kg / 12 недель (Weigle 2005)', 'tech'),
 ('eggs', 1, 'яйца / греческий йогурт / курица в ряд на слова; подпись про порцию «с ладонь»', 'sw'),
 ('dial number two', 1, 'ритуал: дайл 1 поворачивается вниз (щелчки), подсвечен 2 (VOLUME)', '8 щелчков + sw'),
 ("your stomach doesn't count calories", 1, '`h-hungry` (рука на желудке) + SideText', '—'),
 ('in one lab study', 1, 'тот же яблочный предмет в трёх состояниях: цельное яблоко / пюре / сок; «fullest», −15 %, «barely helped», красный крест на соке (Flood-Obbagy 2009)', 'sw, tech'),
 ('a big bowl of vegetables', 1, 'миска овощей и суп; затем столбики 6.7 vs 8.9 кг за 6 месяцев (Ello-Martin 2007)', 'sw'),
 ('dial number three', 1, 'ритуал: дайл 2 вниз, подсвечен 3 (REAL FOOD)', '8 щелчков + sw'),
 ('in one hospital study', 1, '`h-rise` + SideText; «SAME ON BOTH MENUS»: calories = sugar = fat = fiber (код, зелёные «=»)', 'sw'),
 ('mostly real food', 1, 'картофель «REAL FOOD» слева, чипсы «ULTRA-PROCESSED» справа (swap), +508 kcal/день, +0.9 / −0.9 кг, +17 kcal/мин (Hall 2019)', 'swf, tech'),
 ('so build most of your meals', 1, '`h-plate` + список с галочками: Potatoes ✓ Rice ✓ Eggs ✓ Meat ✓ Fruit ✓ Oats ✓', 'sw'),
 ('in a classic test', 1, 'картофель + столбики насыщения 323 % / 100 % / 47 % (Holt 1995)', 'sw'),
 ('and in a review of experiments', 1, 'текст «eating while distracted → ate more later» (Robinson 2013); «put the phone down»', '—'),
 ('dial number four', 1, 'ритуал: дайл 3 вниз, подсвечен 4 (EVENING)', '8 щелчков + sw'),
 ('in one study twelve young men', 1, 'сцена сна `p-sleep`; +24 % голод, +33–45 % тяга к калорийной еде (Spiegel 2004)', 'sw, tech'),
 ('in another trial', 1, 'луна `o-moon`; «+1 hour of sleep» → «−270 kcal / day» (Tasali 2022)', 'sw, tech'),
 ("now here's what almost nobody", 1, 'пауза-интрига: одна фраза на чёрном', 'sw'),
 ('in a lab study of twelve adults', 1, 'кривая голода за сутки: минимум 8 AM, пик 8 PM (Scheer 2013); точка бежит по кривой', 'tech на пике'),
 ('make dinner your biggest protein meal', 1, 'тарелка белка `o-protein` и йогурт с ягодами `o-yogurt`; затем холодильник гаснет — «close the kitchen»', 'sw'),
 ('one last trick', 1, 'ритуал: дайл 4 вниз — все четыре снижены; затем стакан воды `o-glass`, −1.3 kg, «preliminary» (Parretti 2015)', '8 щелчков, sw, tech'),
 ("so here's your day", 1, 'пять карточек дня (код) раскрываются на слова Breakfast / Lunch / Dinner / Evening / bed; пауза на скриншот', 'sw, shutter'),
 ('one honest warning', 1, 'предупреждение: фраза, `h-down`, строки про головокружение / слишком большой разрыв / врач', 'sw'),
 ('tonight do just one thing', 1, '`h-you`, яйца и йогурт для завтрака; финальная карта: дайл 1 поворачивается вниз, остальные ждут; чёрный', 'slow, 8 щелчков, boom'),
]
P = ['# Режиссёрский план EP2 (по фразам)', '',
     f'Генерируется из `voice/marks.json` (время в секундах фильма, голос начинается с 1.0 с). Длительность {mm(float(open(os.path.join(root,"film/src/tl.ts")).read().split("TOTAL=")[1].split(";")[0]))}. '
     'Сцены в `film/src/FilmH.tsx` привязаны к тем же фразам через `t()`; код — ручки, графики, столбики, карточки; рисунки A6API — герой и предметы.', '',
     '| Время | Фраза-триггер | Кадр | SFX |', '|---|---|---|---|']
for ph, n, vis, sfx in beats:
    P.append(f'| {mm(T(ph, n))} | {ph} | {vis} | {sfx} |')
open(os.path.join(root, 'notes/director-plan-ru.md'), 'w').write('\n'.join(P) + '\n')
print('plan rows', len(beats))
