# Storm Isles: списък с графики

Тук е всичко, което трябва да се нарисува или генерира, за да замени временната
векторна графика. Всеки ред има **име на файл**, **размер** и **промпт** (на
английски, защото AI инструментите разбират английски най-добре).

Когато даден файл е готов, сложи го на посочения път в `assets/art/…`. Кодът ще
бъде подготвен да го зареди вместо временната графика.

---

## 1. Общи правила (важат за ВСИЧКО)

**Стил:** един и същ за цялата игра. Ако символите, сградите и героите са в
различни стилове, играта изглежда аматьорски. Това е най-честата грешка с AI арт.

**Основен стилов промпт.** Добавяй го в края на всеки промпт:

```
stylized 3D render, casual mobile game art, bright saturated colors, soft warm
lighting from top-left, gentle ambient occlusion, chunky rounded shapes,
clean readable silhouette, subtle bevels, high detail, centered, isolated on a
plain white background, no text, no watermark
```

**Негативен промпт** (ако инструментът има такова поле):

```
text, letters, watermark, logo, signature, blurry, photorealistic, dark, gloomy,
cropped, multiple objects, frame, border
```

**Технически изисквания:**
- Формат **PNG с прозрачен фон**. Ако инструментът не дава прозрачност,
  махни фона с вградената функция за премахване на фона или с отделна услуга.
- Размер: както е посочено. Генерирай по-голямо и намали, никога обратното.
- Изгледът за сградите и островите е **отгоре, под ъгъл ~30°** (т.нар. 3/4 изглед).
  Всички сгради трябва да са под **един и същ ъгъл** и със **светлина от
  една и съща посока** (горе-ляво).
- Без текст в картинките. Текстовете идват от кода (заради преводите).
- Не споменавай имена на съществуващи игри в промптовете: стилът трябва
  да е наш, иначе рискуваме проблеми с авторските права.

---

## 2. Символи на колелото (7 бр.) — `assets/art/symbols/`

Размер: **512×512**. Обектът е в центъра и заема ~80% от площта.

| Файл | Какво е | Промпт |
|---|---|---|
| `coin.png` | Златна монета | `a single shiny gold coin with an embossed star, slightly tilted, game icon` |
| `bag.png` | Торба със злато (джакпот) | `a bulging brown leather sack overflowing with gold coins, red rope tie, game icon` |
| `shield.png` | Щит с котва | `a blue heraldic shield with a golden anchor emblem, gold rim, game icon` |
| `cannon.png` | Оръдие | `a pirate ship cannon on a wooden carriage, black iron barrel with gold bands, small smoke puff, game icon` |
| `map.png` | Карта на съкровище | `an old parchment treasure map with a dotted path and a red X, slightly curled edges, game icon` |
| `storm.png` | Торнадо | `a swirling purple storm tornado with a small yellow lightning bolt, magical, game icon` |
| `energy.png` | Енергия | `a glowing yellow lightning bolt inside a blue round orb, game icon` |

---

## 3. Сгради — `assets/art/buildings/<остров>/`

Размер: **768×768**. Сградата стои върху **малко парче земя/трева** в долната
част на кадъра, център отдолу. Еднакъв ъгъл за всички.

Всяка сграда има **3 нива**. По-високото ниво е по-голямо и по-богато украсено
от предишното. Файловете се казват `<сграда>_1.png`, `<сграда>_2.png`, `<сграда>_3.png`.

**Започни само с първия остров (15 картинки).** Довърши ги, сложи ги в играта и
чак тогава продължи с останалите острови.

### Остров 1: Тропически (`buildings/tropic/`)

| Сграда | Ниво 1 | Ниво 2 | Ниво 3 |
|---|---|---|---|
| `hut` колиба | `small bamboo beach hut with a palm-leaf thatched roof` | `bigger bamboo hut with thatched roof, round windows, hanging lantern` | `large decorated bamboo house on short stilts, thatched roof, flowers, small flag on top` |
| `cottage` къща | `small tropical cottage, white walls, orange tile roof` | `two-storey tropical cottage, orange roof, chimney, wooden shutters` | `elegant two-storey villa, orange roof, balcony with flower boxes, flag` |
| `windmill` мелница | `small stone windmill with wooden sails` | `taller windmill with cream canvas sails and a window` | `grand windmill with gold trim and decorated sails, flower bed at base` |
| `lighthouse` фар | `short red and white striped lighthouse` | `tall striped lighthouse with glowing lamp room` | `majestic lighthouse with golden dome, bright beacon, small flag` |
| `castle` крепост | `small stone fort with one wooden gate` | `stone castle with two side towers and red cone roofs` | `grand castle with three towers, gold trim, waving red flags` |

Към всеки промпт добави: `, on a small patch of tropical grass, 3/4 top-down view`.

Плюс:
- `plot.png`: строителна площадка `an empty construction site on a patch of dirt: wooden stakes, rope, stacked planks, small wooden sign`, обща за всички острови.

### Острови 2–5: само се сменя темата

Същите 5 сгради × 3 нива. В промпта смени материалите и добави описание
на острова:

| Остров | Папка | Добави към промпта |
|---|---|---|
| Ледников | `glacier/` | `snowy, wooden logs and blue roofs, icicles, on a patch of snow` |
| Вулканичен | `volcano/` | `dark basalt stone, glowing orange lava cracks, red roofs, on dark volcanic rock` |
| Потънал град | `sunken/` | `ancient white marble with teal roofs, coral and seaweed growing on it, on sandy seabed` |
| Небесен | `sky/` | `whimsical, cream walls and purple roofs, small balloons and ribbons, on a fluffy cloud` |

**Общо сгради: 75 + 1 площадка.**

---

## 4. Острови (фон) — `assets/art/islands/`

Размер: **2048×1536**. Островът е **празен, без сгради**, с 5 равни поляни,
на които ще стъпят сградите. Около него има море.

| Файл | Промпт |
|---|---|
| `tropic.png` | `a lush tropical island seen from above at a 30 degree angle, sandy beach ring, turquoise shallow water, palm trees on the edges, five empty flat grassy clearings, a small dirt path, surrounded by deep blue ocean` |
| `glacier.png` | `a snowy arctic island seen from above at a 30 degree angle, ice cliffs, frozen shore, pine trees with snow, five empty flat snowy clearings, icebergs in dark blue sea` |
| `volcano.png` | `a volcanic island seen from above at a 30 degree angle, a smoking volcano in the back, black rock and lava rivers, five empty flat clearings, dark teal sea` |
| `sunken.png` | `an underwater ruined city island seen from above at a 30 degree angle, coral reefs, broken marble columns, five empty sandy clearings, deep blue water with light rays` |
| `sky.png` | `a floating island in the sky made of grass on fluffy clouds, seen from above at a 30 degree angle, a rainbow behind, five empty flat grassy clearings, pastel sky` |

Тези картинки са **без** прозрачен фон.

---

## 5. Герои — `assets/art/characters/`

| Файл | Размер | Промпт |
|---|---|---|
| `captain_player.png` | 1024×1024 | `a friendly young sea captain mascot, cheerful, navy coat with gold buttons, captain hat, waving, full body` (за обучението) |
| `captain_player_happy.png` | 1024×1024 | същото, `celebrating, arms up, big smile` |
| `captain_player_shocked.png` | 1024×1024 | същото, `shocked surprised face, hands on cheeks` (когато те нападнат) |
| `rival_01.png` … `rival_10.png` | 512×512 | `portrait bust of a pirate captain, [вариация], friendly cartoon face, round circular composition` |

Вариации за съперниците (по една на портрет): `bearded man with tricorn hat`,
`red-haired woman with bandana`, `old captain with eyepatch and grey beard`,
`young woman with feathered hat`, `bald man with gold earring`,
`woman with braids and navigator goggles`, `man with turban and mustache`,
`girl with captain hat and freckles`, `tall man with blue coat and monocle`,
`woman with headscarf and gold necklace`.

**Важно за героите:** генерирай всички с **един и същ стилов референс**
(виж раздел 9). Иначе ще изглеждат като от различни игри.

---

## 6. Интерфейс — `assets/art/ui/`

| Файл | Размер | Промпт / бележка |
|---|---|---|
| `wheel_frame.png` | 1024×512 | `ornate slot machine frame made of polished wood and gold, three empty square windows in a row, rivets, front view` |
| `chest_closed.png` | 512×512 | `a closed wooden treasure chest with gold bands and lock, game icon` |
| `chest_open.png` | 512×512 | `an open treasure chest overflowing with gold coins and gems, glowing, game icon` |
| `dig_spot.png` | 512×512 | `a small mound of sand with a red X painted on it, top view, game icon` |
| `coin_pile.png` | 512×512 | `a pile of gold coins, game icon` |
| `hammer.png` | 256×256 | `a wooden hammer with steel head, game icon` |
| `scroll.png` | 256×256 | `a rolled parchment scroll with a red ribbon, game icon` |
| `star.png` | 256×256 | `a glossy golden star, game icon` |
| `crosshair.png` | 256×256 | `a red target crosshair, game icon` |
| `settings.png` | 256×256 | `a golden gear, game icon` |

**Бутоните, панелите и лентите НЕ ги генерирай с AI.** Тези рамки трябва да се
разтягат до различни размери, а AI рядко ги прави добре. Сегашните
(с градиенти в кода) ще ги излъскам, а може и да вземем готов UI пакет.

---

## 7. Ефекти — `assets/art/fx/`

AI се справя зле с анимации. Вземи безплатен пакет: **Kenney.nl** има
безплатни (CC0, т.е. свободни за търговска употреба) пакети с частици.
Трябват ни: дим, огън, експлозия, искри, пръски вода, блясък около монета.

---

## 8. Магазин (Google Play) — `assets/store/`

| Файл | Размер | Бележка |
|---|---|---|
| `icon.png` | 512×512 | Иконата на играта. **Най-важната картинка!** Препоръчвам художник или много итерации. Промпт: `app icon, a cheerful sea captain holding a golden coin in front of a tropical island and a purple storm cloud, bold, readable at small size` |
| `feature_graphic.png` | 1024×500 | Банер в горната част на страницата в Google Play: островът, капитанът и бурята |
| `screenshot_1…8.png` | 1080×1920 | Снимки от играта с кратки надписи. Тях ще ги направим от самата игра, когато артът е готов |
| `splash.png` | 1284×2778 | Начален екран: логото на фона на острова |

Плюс **лого** (`logo.png`, 1024×512) с името „Storm Isles“. Текстът тук е
нужен, но AI често изписва букви грешно, затова логото е по-добре
да се направи от художник или ръчно.

---

## 9. Как да работиш с AI (важно)

1. **Първо направи 5–10 „референтни“ картинки:** колиба ниво 1, монета, торнадо,
   един капитан и др. Генерирай много варианти и избери тези, които най-много ти харесват.
   Те ще определят стила на цялата игра.
2. **Обучи собствен стилов модел** върху тях. В Scenario това се казва
   „Train a model“; трябват 10–20 картинки в един и същ стил. Всичко нататък
   генерирай с този модел, за да е стилът еднакъв.
3. **Генерирай по групи:** първо символите, после сградите на остров 1,
   после острова. След всяка група ми ги прати и аз ги слагам в играта, за да видим как стоят заедно.
4. **Изрязвай фона** и проверявай краищата на тъмен фон. Белите ореоли около
   обектите веднага издават аматьорска работа.
5. **Пази лиценза:** провери, че планът ти разрешава търговска употреба.

---

## Обобщение

| Група | Брой |
|---|---|
| Символи | 7 |
| Сгради (5 острова) | 75 + 1 |
| Острови | 5 |
| Герои | 3 + 10 |
| Интерфейс | 10 |
| Магазин | икона, банер, лого, начален екран |
| **Общо** | **~115 картинки** |

**Минимум за първо пускане:** символите (7), сградите и островът на
остров 1 (16 + 1), героите (13), интерфейсът (10) и магазинът.
Това са около **50 картинки**. Островите 2–5 могат да излязат с обновления.
