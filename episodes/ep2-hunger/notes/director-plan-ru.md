# Режиссёрский план EP2 (по фразам)

Генерируется из `voice/marks.json` (время в секундах фильма, голос начинается с 1.0 с). Длительность 5:08.09. Сцены в `film/src/FilmH.tsx` привязаны к тем же фразам через `t()`; код — ручки, графики, столбики, карточки; рисунки A6API — герой и предметы.

| Время | Фраза-триггер | Кадр | SFX |
|---|---|---|---|
| 0:01.00 | You're eating a little less | герой `h-hungry` (взгляд в камеру, рука на животе) слева + SideText | slow-whoosh на входе |
| 0:03.98 | and by evening | ночной холодильник `p-fridge` (focus), фраза «all you can think about is food» | короткий sw |
| 0:07.80 | that's not weakness | `h-cross` + SideText «not weakness / not a lack of discipline / your body doing what it was built to do» | тихий sw |
| 0:15.02 | when you eat less | одна большая ручка-дайл «HUNGER ALARM»: стрелка уходит вверх, красная дуга и волны — тревога громче | swf на подъёме |
| 0:19.46 | that alarm has dials | четыре дайла PROTEIN / VOLUME / REAL FOOD / EVENING (код) — обещание на весь ролик | 4 щелчка + boom |
| 0:25.98 | and at the end | `h-explain` + размытый веер карточек дня (HiddenPlan: тот же план раскроется в конце) | sw |
| 0:33.09 | first why is it so loud | чёрный ритуал → одна фраза на чёрном | — |
| 0:35.25 | in one famous study | `h-think` + график двух линий «hunger signals ↑ / fullness signals ↓» до и спустя год (качественно; Sumithran 2011) | sw, 2× tech |
| 0:48.03 | you don't need to go anywhere near it | две строки на чёрном: «small gap gets noticed» | — |
| 0:52.46 | so you can't switch hunger off | большая ручка возвращается: стрелка падает, но не до нуля — «only turn it down» | 8 щелчков |
| 0:57.96 | dial number one | карта дайлов: подсвечен 1 (PROTEIN) | sw |
| 1:00.20 | in one small study | столбики доля белка 15% → 30%; затем счётчик −441 kcal/день и −4.9 kg / 12 недель (Weigle 2005) | tech |
| 1:19.58 | eggs | яйца / греческий йогурт / курица в ряд на слова; подпись про порцию «с ладонь» | sw |
| 1:28.42 | dial number two | ритуал: дайл 1 поворачивается вниз (щелчки), подсвечен 2 (VOLUME) | 8 щелчков + sw |
| 1:30.53 | your stomach doesn't count calories | `h-hungry` (рука на желудке) + SideText | — |
| 1:34.79 | in one lab study | тот же яблочный предмет в трёх состояниях: цельное яблоко / пюре / сок; «fullest», −15 %, «barely helped», красный крест на соке (Flood-Obbagy 2009) | sw, tech |
| 1:57.69 | a big bowl of vegetables | миска овощей и суп; затем столбики 6.7 vs 8.9 кг за 6 месяцев (Ello-Martin 2007) | sw |
| 2:12.33 | dial number three | ритуал: дайл 2 вниз, подсвечен 3 (REAL FOOD) | 8 щелчков + sw |
| 2:19.53 | in one hospital study | `h-rise` + SideText; «SAME ON BOTH MENUS»: calories = sugar = fat = fiber (код, зелёные «=») | sw |
| 2:30.52 | mostly real food | картофель «REAL FOOD» слева, чипсы «ULTRA-PROCESSED» справа (swap), +508 kcal/день, +0.9 / −0.9 кг, +17 kcal/мин (Hall 2019) | swf, tech |
| 2:45.15 | so build most of your meals | `h-plate` + список с галочками: Potatoes ✓ Rice ✓ Eggs ✓ Meat ✓ Fruit ✓ Oats ✓ | sw |
| 2:54.58 | in a classic test | картофель + столбики насыщения 323 % / 100 % / 47 % (Holt 1995) | sw |
| 3:02.88 | and in a review of experiments | текст «eating while distracted → ate more later» (Robinson 2013); «put the phone down» | — |
| 3:11.51 | dial number four | ритуал: дайл 3 вниз, подсвечен 4 (EVENING) | 8 щелчков + sw |
| 3:13.91 | in one study twelve young men | сцена сна `p-sleep`; +24 % голод, +33–45 % тяга к калорийной еде (Spiegel 2004) | sw, tech |
| 3:24.66 | in another trial | луна `o-moon`; «+1 hour of sleep» → «−270 kcal / day» (Tasali 2022) | sw, tech |
| 3:35.27 | now here's what almost nobody | пауза-интрига: одна фраза на чёрном | sw |
| 3:38.06 | in a lab study of twelve adults | кривая голода за сутки: минимум 8 AM, пик 8 PM (Scheer 2013); точка бежит по кривой | tech на пике |
| 3:50.34 | make dinner your biggest protein meal | тарелка белка `o-protein` и йогурт с ягодами `o-yogurt`; затем холодильник гаснет — «close the kitchen» | sw |
| 4:00.71 | one last trick | ритуал: дайл 4 вниз — все четыре снижены; затем стакан воды `o-glass`, −1.3 kg, «preliminary» (Parretti 2015) | 8 щелчков, sw, tech |
| 4:15.22 | so here's your day | пять карточек дня (код) раскрываются на слова Breakfast / Lunch / Dinner / Evening / bed; пауза на скриншот | sw, shutter |
| 4:36.29 | one honest warning | предупреждение: фраза, `h-down`, строки про головокружение / слишком большой разрыв / врач | sw |
| 4:55.71 | tonight do just one thing | `h-you`, яйца и йогурт для завтрака; финальная карта: дайл 1 поворачивается вниз, остальные ждут; чёрный | slow, 8 щелчков, boom |
