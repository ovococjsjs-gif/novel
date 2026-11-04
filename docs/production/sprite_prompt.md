# Базовый промпт для спрайта

> **04.11 — единый стиль.** Актуальный эталон: hand-drawn спрайты **Александра**.
> Универсальный промпт, папка приёма и manifest: [`sprites_redraw/`](../../sprites_redraw/README.md)
> (`UNIVERSAL_PROMPT.md`, `manifest.csv`, `_style_reference/`). Новый стиль-лок вытесняет прежнюю смесь стилей.

Стиль снят с текущих спрайтов (Саша, Лена, Ника, Валерия, Дмитрий). Подставить только блок `[APPEARANCE]`. Лучше прикладывать к запросу один готовый спрайт как референс стиля (например `assets/characters/lena/transparent/lena_neutral.webp` или `nika/transparent/nika_neutral.webp`) и писать «match the art style of the reference, NOT the character».

## 1. Дефолтный спрайт (neutral)

```
Full-body character sprite for a visual novel, single character, standing, facing the viewer in a relaxed three-quarter stance, arms down and relaxed, calm neutral expression, mouth closed.

Art style: Japanese seinen manga anime, clean bold black ink line art with varied line weight, soft cel shading in 2–3 tones, light halftone screentone dots in the shadows of hair and clothes, muted natural colors, realistic adult proportions (about 7.5 heads tall), detailed expressive eyes, no chibi, no 3D, no painterly blur.

Character: [APPEARANCE — age, build, height, face, eye color, hair (color, length, style), clothes top to bottom, shoes, accessories, one distinctive detail]

Composition: portrait canvas 3:4 (896×1200), the whole figure from the top of the head to the soles of the shoes is visible, head top at about 4% from the top edge, feet at about 98%, figure centered horizontally. Nothing cropped.

Background: perfectly plain pure white (#FFFFFF), edge to edge. No floor, no cast shadow, no gradient, no vignette, no frame, no text, no logos, no watermark, no signature.
```

## 2. Эмоции (по готовому дефолту)

Прикладывать дефолтный спрайт, менять только выражение и, если нужно, руки.

```
Same character, same outfit, same art style, same canvas size, same scale and same position as the reference sprite. Change ONLY the facial expression [and the arm pose] to: [EMOTION — e.g. warm smile, eyes slightly narrowed; one hand raised to the chin]. Keep hair, clothes, colors, line art, skin tone and proportions identical. Plain pure white background, full body with feet visible, no text.
```

## 3. Заметки

- Новых персонажей можно сразу рисовать на ровном #00FF00 (в промпте: «perfectly flat pure chroma-key green (#00FF00) background… No green color anywhere on the character»). Так сделаны второстепенные 03.11, шаг замены фона не нужен.
- Эмоции вырезать с `--align-from <зелёный дефолт>`, иначе при поднятой руке фигура съезжает вбок (см. `assets.md`, «03.11 — второстепенные»).
- Фон белый для старых оригиналов, потом стандартный пайплайн: замена фона на #00FF00 → `tools/chroma_key.py`. Если в одежде или глазах есть зелёный (Тая — оливковый кардиган) — фон #0000FF и `--key blue`.
- Генератор любит дорисовывать надписи на бейджах и логотипы: в `[APPEARANCE]` писать «plain, no text/logo».
- Кожу при правках держать фразой «keep the skin tone exactly as in the reference, do not darken» — генератор склонен её затемнять.
- Реальные бренды, символика, оружие, сигареты (кроме канона Лены) — не просить.
