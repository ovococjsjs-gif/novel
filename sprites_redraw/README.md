# `sprites_redraw/` — приёмник спрайтов в едином стиле (04.11)

Папка для перерисовки спрайтов под один hand-drawn стиль эталона **Александр**.
Сюда ты закидываешь готовые файлы; отсюда они идут в игру. Старые белые исходники остаются на месте
в `sprites_for_cutout/` и в `assets/characters/<имя>/*.png`. Эта папка принимает новую партию в едином стиле.

- **Универсальный промпт:** [`UNIVERSAL_PROMPT.md`](UNIVERSAL_PROMPT.md)
- **Полный список ожидаемых файлов:** [`manifest.csv`](manifest.csv) (114 позиций: персонаж, эмоция, имя, путь в движке, цвет ключа)
- **Референс стиля:** `_style_reference/alexander_neutral.webp`, `_style_reference/alexander_jacket_neutral.webp`

## Структура

```text
sprites_redraw/
├── README.md
├── UNIVERSAL_PROMPT.md
├── manifest.csv
├── _style_reference/          # эталон стиля (Александр), прикладывать к генератору
├── green/<персонаж>/          # СЮДА класть готовые спрайты НА ЗЕЛЁНОМ/СИНЕМ фоне (до вырезки)
│   ├── alexander/  mirael/  valeria/  taya/  lena/  nika/  artem/  dmitry/
│   └── nyura/ inessa/ garik/ lev/ tamara/ gosha/ concierge/ vitya/ barista/ zoya/
└── ready/<персонаж>/          # СЮДА класть уже вырезанные прозрачные PNG/WebP, если вырезал сам
```

Правило простое:
- Сгенерировал спрайт на ровном `#00FF00` (Тая — `#0000FF`) → `green/<персонаж>/<имя_из_manifest>.png`.
- Уже сам вырезал прозрачный фон → `ready/<персонаж>/<имя_из_manifest>.png` (или `.webp`).
- Имена — строго из `manifest.csv`. У Александра два исторических префикса (`alexander_*` и `alexandr_*`), сохраняй их.

## Пайплайн до игры

Зависимости (ставятся один раз, в игру не входят):

```bash
pip install pillow numpy opencv-python-headless   # для tools/chroma_key.py
npm i --no-save sharp                              # для tools/to_webp.js
```

### 1. Вырезка фона (`green/` → `ready/`)

Дефолт персонажа (выравнивание по старому игровому спрайту, чтобы слоты в `styles.css` не съехали):

```bash
python tools/chroma_key.py \
  sprites_redraw/green/alexander/alexander_neutral.png \
  sprites_redraw/ready/alexander/alexander_neutral.png \
  --ref assets/characters/alexander/transparent/alexander_neutral.webp
```

Эмоция с изменённой позой (поднятая рука, предмет) — обязательно `--align-from` по зелёному дефолту:

```bash
python tools/chroma_key.py \
  sprites_redraw/green/taya/taya_tea.png \
  sprites_redraw/ready/taya/taya_tea.png \
  --ref assets/characters/taya/transparent/taya_neutral.webp \
  --align-from sprites_redraw/green/taya/taya_neutral.png \
  --key blue
```

Мираэль (белые перья/платье) — добавь `--neutral-despill`. Александру его **не** добавляй (серо-зелёные глаза).
Тая — `--key blue`. Полный список исключений — в `UNIVERSAL_PROMPT.md` §6 и в колонке `chroma_key` manifest.

### 2. Конвертация в игровой WebP (`ready/` → `assets/characters/...`)

Сначала скопируй/перенеси прозрачный PNG по пути `engine_path` из `manifest.csv`, затем конвертируй.
Пример для Александра (домашний neutral):

```bash
cp sprites_redraw/ready/alexander/alexander_neutral.png \
   assets/characters/alexander/transparent/alexander_neutral.png
node tools/to_webp.js assets/characters/alexander/transparent/alexander_neutral.png
# PNG удалится, рядом появится .webp — путь в vn-config.js уже смотрит на него.
```

Для Артёма игровые файлы лежат в корне `assets/characters/` (`artem_shank_*.webp`) — сверяйся с `engine_path`.
Можно конвертировать сразу папку: `node tools/to_webp.js assets/characters/alexander/transparent/`.
Если исходный PNG нужен для правки — `node tools/to_webp.js --keep <файл.png>`.

### 3. Сброс кеша и проверка

- Подними `ASSET_VER` в `engine.js` (например `20261104_62`), иначе браузер может показать старый спрайт.
- Запусти игру: `python3 server.py` → порт 8080. Для дев-режима открой `?dev=1`.
- Проверь: `node tools/validate.js` (0 ошибок), затем в игре сцены с этим персонажем.
- Приёмка одного спрайта — чек-лист в `UNIVERSAL_PROMPT.md` §8.

## Что уже сделано в этой папке

- Созданы `green/` и `ready/` с подпапками всех 18 персонажей.
- Скопированы два эталона стиля Александра в `_style_reference/`.
- Сгенерирован `manifest.csv` из `vn-config.js`: все 114 игровых спрайтов с точными именами и путями.

## Заметки

- Один файл = одна эмоция. Дефолт делай первым; эмоции — правкой дефолта на том же холсте 896×1200.
- Фон в промпте ровный, без тени пола и градиента; цвет ключа на персонаже отсутствует.
- Если генератор при замене фона затемнил кожу или изменил ткань внутри фигуры — см. `docs/production/assets.md`,
  «Перевырезка спрайтов через хромакей», п. 6 (перенос RGB из оригинала во внутреннюю область).
- Старую партию на белом фоне (`sprites_for_cutout/`) можно использовать как источник поз/эмоций,
  но стиль перерисовывай по эталону Александра из `_style_reference/`.
