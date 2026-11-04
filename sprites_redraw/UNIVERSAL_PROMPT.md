# Универсальный промпт спрайтов — единый стиль «Александр / hand-drawn» (04.11)

Эталон стиля: **Александр**, `sprites_redraw/_style_reference/alexander_neutral.webp`
(домашний: белая рубашка, тёмные брюки) и `alexander_jacket_neutral.webp` (курьерская куртка).
Референс задаёт **только стиль рисовки**. Внешность конкретного персонажа берётся из блока `[APPEARANCE]`.

Куда класть готовые файлы и как они попадают в игру — см. `README.md` и `manifest.csv` в этой папке.

---

## 0. Как пользоваться (3 шага)

1. **Дефолт персонажа.** Приложи к запросу `_style_reference/alexander_neutral.webp` как референс стиля.
   Вставь универсальный промпт (§2), заполни `[CHARACTER]`, `[APPEARANCE]`, `[EMOTION]=calm neutral`, `[POSE]=arms down and relaxed`.
   Фон — ровный `#00FF00` (для Таи — `#0000FF`, см. §6). Полученный PNG положи в `green/<персонаж>/<имя_из_manifest>.png`.
2. **Эмоции.** Приложи **уже готовый дефолт этого же персонажа** (лучше зелёный исходник) и используй промпт §3.
   Меняй только выражение лица и минимальный жест рук. Масштаб, холст, положение ног и макушки сохраняй.
3. **Вырезка и подключение.** `green/` → `tools/chroma_key.py` → `ready/` → `tools/to_webp.js` → `assets/characters/...`.
   Команды и проверка — в `README.md`. После замены игровых `.webp` подними `ASSET_VER` в `engine.js`.

---

## 1. STYLE LOCK — что именно считываем с Александра

- Полный рост, **взрослый seinen manga / anime**, реалистичные пропорции (~7.5 голов), без chibi.
- **Hand-drawn ink linework:** уверенный контур с живым перепадом толщины линии, лёгкая «рукотворная» неровность,
  местами суховатый разрыв пера. Контур не векторно-идеальный и не «стикер» с толстой обводкой.
- **Мягкий cel-шейдинг в 2–3 тона** + едва заметная бумажно-маркерная зернистость в тенях волос и ткани.
  Лёгкий halftone допустим только в глубоких тенях, без плотного screentone.
- **Приглушённая натуральная палитра**, тёплая кожа с лёгким румянцем, без неона и без пластикового глянца.
- Глаза детализированные, миндалевидные, чёткая радужка, один маленький блик. Волосы — пряди-группы с живыми выбившимися концами.
- Складки ткани — экономные выразительные штрихи. Кисти рук анатомически спокойные, пальцы читаемые.
- Поза: стоя, расслабленный три четверти, вес на одной ноге, плечи опущены. Фигура целиком, от макушки до подошв.
- Без 3D-рендера, без painterly blur, без толстой внешней обводки, без свечения по контуру, без рамочек и подписей.

---

## 2. Универсальный промпт — новый персонаж / новый дефолт (EN, copy-paste)

> Приложи референс стиля: `_style_reference/alexander_neutral.webp`.
> В генераторе, где есть отдельное поле negative prompt, вынеси туда блок «Negative prompt».

```text
Full-body character sprite for a visual novel, single character, standing, facing the viewer in a relaxed
three-quarter stance, weight on one leg, shoulders relaxed, [POSE: arms down and relaxed].
Expression: [EMOTION: calm neutral, mouth closed].

Art style: match the art style of the attached reference sprite exactly (hand-drawn Japanese seinen manga /
anime illustration). The reference defines STYLE ONLY: confident organic ink contour with varied line weight
and slight dry-brush breaks, soft cel shading in 2-3 tones, faint paper/marker grain in the shadows of hair
and cloth, muted natural palette, warm skin with subtle blush, realistic adult proportions about 7.5 heads
tall, detailed expressive almond eyes with a crisp iris and one small catchlight, hair drawn as grouped
strands with loose flyaways, economical expressive clothing folds. Slightly imperfect human linework, clean
but not vector-perfect. No chibi, no 3D render, no painterly blur, no thick sticker outline, no contour glow.
Do not copy the reference character's face, hair, outfit or colors; draw the character described below.

Character: [CHARACTER NAME], [APPEARANCE: age, build, height; face shape, eye color; hair color/length/style;
outfit top to bottom with fabric and fit; shoes; accessories; one distinctive detail. Keep clothes plain,
no text, no logo, no brand].

Composition: portrait canvas 3:4, 896x1200 px. The whole figure from the top of the head to the soles of the
shoes is visible. Head top at about 4% from the top edge, feet at about 98%, figure centered horizontally.
Nothing cropped. Keep this exact canvas, scale and foot placement for every emotion of this character.

Background: perfectly flat pure chroma-key [KEY COLOR: green #00FF00], edge to edge, perfectly uniform.
No floor, no cast shadow, no gradient, no vignette, no lighting falloff, no frame, no text, no logo,
no watermark, no signature. No green color anywhere on the character, no green spill on skin, hair or cloth.
```

**Negative prompt:**

```text
text, letters, logo, brand, watermark, signature, frame, border, multiple characters, extra limbs, cropped
head, cropped feet, floor, ground shadow, cast shadow, gradient background, white background, vignette,
3D render, CGI, photorealistic, plastic skin, heavy gloss, chibi, super deformed, painterly blur, airbrush,
thick sticker outline, contour glow, neon colors, oversaturation, green spill, chroma key on character,
messy extra fingers, fused fingers, asymmetrical eyes, cross-eyed, blurry lineart, vector-perfect lines
```

---

## 3. Промпт — эмоция по готовому дефолту (EN)

> Приложи **дефолт этого же персонажа** (зелёный исходник предпочтительнее). Референс Александра больше не нужен.

```text
Same character, same outfit, same art style, same canvas size (896x1200), same scale, same foot placement
and same head-top position as the attached reference sprite. Change ONLY the facial expression and the
minimal arm/hand gesture to: [EMOTION + GESTURE, e.g. warm smile, eyes slightly narrowed, one hand raised
to the chin]. Keep identity, face structure, hair, clothes, colors, line weight, skin tone, shading style
and proportions identical to the reference. Keep the background perfectly flat pure chroma-key
[KEY COLOR: green #00FF00], uniform, no shadow, no gradient. Full body with feet visible, nothing cropped,
no text, no logo, no watermark. Do not redesign the character, do not change the outfit, do not zoom,
do not shift the figure sideways.
```

Для поз с поднятой рукой / предметом в руках при вырезке используй `--align-from <зелёный_дефолт>`,
иначе силуэт эмоции расширится и фигура уедет вбок (см. `README.md`).

---

## 4. Промпт — замена фона на хромакей (если исходник уже на белом)

```text
Replace ONLY the background with perfectly flat pure chroma-key green #00FF00, edge to edge, perfectly
uniform. Do not change the character in any way: keep the exact same linework, colors, skin tone, shading,
expression, pose, canvas size and position. Remove any white background halo. No floor, no cast shadow,
no gradient, no green spill on the character, no text, no watermark.
```

Если в одежде/глазах персонажа есть зелёный — вместо этого проси `#0000FF` и вырезай с `--key blue`.

---

## 5. Заполненный пример (Александр, neutral) — как это выглядит в сборе

```text
Full-body character sprite for a visual novel, single character, standing, facing the viewer in a relaxed
three-quarter stance, weight on one leg, shoulders relaxed, arms down and relaxed.
Expression: calm neutral, mouth closed.

Art style: match the art style of the attached reference sprite exactly (hand-drawn Japanese seinen manga /
anime illustration). The reference defines STYLE ONLY: confident organic ink contour with varied line weight
and slight dry-brush breaks, soft cel shading in 2-3 tones, faint paper/marker grain in the shadows of hair
and cloth, muted natural palette, warm skin with subtle blush, realistic adult proportions about 7.5 heads
tall, detailed expressive almond eyes with a crisp iris and one small catchlight, hair drawn as grouped
strands with loose flyaways, economical expressive clothing folds. Slightly imperfect human linework, clean
but not vector-perfect. No chibi, no 3D render, no painterly blur, no thick sticker outline, no contour glow.
Do not copy the reference character's face, hair, outfit or colors; draw the character described below.

Character: Alexander Orekhov, 21 years old, young adult male, lean courier build, average-tall height;
slightly angular face, grey-green eyes; messy ash-blond hair, short-to-medium, loose strands over the
forehead; plain white button-up shirt with one chest pocket, sleeves rolled to the forearms, top buttons
open, shirt slightly loose and softly wrinkled; dark charcoal straight trousers; plain black leather boots;
no accessories, no text, no logo.

Composition: portrait canvas 3:4, 896x1200 px. The whole figure from the top of the head to the soles of the
shoes is visible. Head top at about 4% from the top edge, feet at about 98%, figure centered horizontally.
Nothing cropped. Keep this exact canvas, scale and foot placement for every emotion of this character.

Background: perfectly flat pure chroma-key green #00FF00, edge to edge, perfectly uniform. No floor,
no cast shadow, no gradient, no vignette, no lighting falloff, no frame, no text, no logo, no watermark,
no signature. No green color anywhere on the character, no green spill on skin, hair or cloth.
```

---

## 6. Фон и ключ: исключения

| Персонаж | Фон в промпте | Ключ вырезки | Примечание |
|---|---|---|---|
| Александр (оба набора) | `#00FF00` | `green` | Серо-зелёные глаза: **без** `--neutral-despill` |
| Мираэль (angel / human) | `#00FF00` | `green` | Белые перья/платье: `--neutral-despill` |
| Тая | `#0000FF` | `blue` | Оливковый кардиган + зелёный глаз |
| Остальные | `#00FF00` | `green` | Если появится зелёный в одежде — переходи на `blue` |

---

## 7. Имена файлов и куда класть

- Имена бери **строго из `manifest.csv`** (колонки `green_drop_file` / `ready_drop_file`).
  У Александра исторически два префикса: `alexander_*` и `alexandr_*` — не «исправляй» их, движок ждёт именно так.
- Готовый спрайт **на зелёном/синем фоне** → `sprites_redraw/green/<персонаж>/<имя>.png`.
- Если ты уже сам вырезал прозрачный PNG/WebP → `sprites_redraw/ready/<персонаж>/<имя>.png` (или `.webp`).
- Один файл = одна эмоция. Дефолт делай первым, эмоции — правкой дефолта на том же холсте.

---

## 8. Чек-лист приёмки одного спрайта

- [ ] Стиль совпадает с Александром: живая линия, 2–3 тона, приглушённая палитра, без 3D/chibi/глянца.
- [ ] Холст 896×1200, фигура целиком, макушка ~4%, подошвы ~98%, центр по горизонтали.
- [ ] Фон ровный `#00FF00` (или `#0000FF` для Таи), без градиента, тени пола и виньетки.
- [ ] На персонаже нет цвета ключа и нет зелёного/синего отсвета по кромке.
- [ ] У эмоций того же персонажа совпадают рост, макушка, положение ног и масштаб с дефолтом.
- [ ] Имя файла совпадает с `manifest.csv`; префиксы `alexander_` / `alexandr_` сохранены.
- [ ] После вырезки: прозрачный фон, кромка чистая, дыр в белой одежде/перьях нет.
- [ ] После `to_webp.js` файл лежит по `engine_path` из manifest; `ASSET_VER` поднят; в игре спрайт на месте.
