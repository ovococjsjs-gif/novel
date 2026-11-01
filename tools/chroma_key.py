#!/usr/bin/env python3
"""Хромакей для спрайтов: зелёный (или синий) фон -> прозрачность.

Пайплайн (см. docs/production/assets.md, «Перевырезка спрайтов»):
  1. Исходный спрайт на белом -> генератор «замени только фон на #00FF00».
  2. Этот скрипт: вырезает фон, убирает зелёный отсвет по краю,
     подгоняет фигуру по росту/положению к старому спрайту (--ref),
     чтобы не съехали настройки слотов в styles.css.

Использование:
  python tools/chroma_key.py in_green.png out.png [--ref old_transparent.png] [--key blue]

Нужны pillow, numpy, opencv-python-headless.
"""
import argparse

import cv2
import numpy as np
from PIL import Image


def key_alpha(rgb, key="green"):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    if key == "green":
        dom = g - np.maximum(r, b)
    else:
        dom = b - np.maximum(r, g)
    h, w = dom.shape
    border = np.concatenate([dom[0], dom[-1], dom[:, 0], dom[:, -1]])
    k = float(np.median(border))  # «сила» ключа на чистом фоне
    k = max(k, 60.0)
    # ядро фона: сильно-зелёные пиксели (глаза/оливковая одежда сюда не попадают)
    core = (dom > 0.5 * k).astype(np.uint8)
    core = cv2.morphologyEx(core, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    # мелкие «островки» внутри фигуры размером с блик — не фон
    n, lab, st, _ = cv2.connectedComponentsWithStats(core, connectivity=8)
    keep = np.zeros(n, bool)
    for i in range(1, n):
        x, y, ww, hh, area = st[i]
        touches = x == 0 or y == 0 or x + ww >= w or y + hh >= h
        mean_dom = float(dom[lab == i].mean())
        # крошечные зазоры между пальцами: маленькие, но почти чистый ключ
        keep[i] = touches or area >= 60 or (area >= 6 and mean_dom > 0.6 * k)
    core = keep[lab].astype(np.uint8)
    # узкие щели (между рукой и боком и т.п.) с почти чистым ключом — тоже фон
    core |= (dom > 0.75 * k).astype(np.uint8)
    # зона ключа: 12 px вокруг фона — ловит просветы между прядями;
    # глаза и одежда глубже внутри фигуры и сюда не попадают
    band = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))).astype(bool)
    # тонкие щели между пальцами/прядями (1–2 px): смешанный с ключом цвет.
    # Внутри фигуры перевес ключа ≤ ~0.1k (глаза, оливки), так что 0.2k безопасно.
    # Только компоненты, связанные с фоном (core): замкнутые внутри фигуры пятна
    # (голубой глаз при синем ключе, зелёный при зелёном) не трогаем.
    weak = (dom > 0.2 * k).astype(np.uint8)
    nl, wl = cv2.connectedComponents(weak, connectivity=8)
    hit = np.zeros(nl, bool)
    hit[np.unique(wl[core.astype(bool) & (weak > 0)])] = True
    hit[0] = False
    weak = hit[wl].astype(np.uint8)
    band |= cv2.dilate(weak, np.ones((3, 3), np.uint8)).astype(bool)
    # альфа по «зелёному перевесу»: 0 на чистом ключе, 1 на обычном цвете
    lo, hi = 0.12 * k, 0.88 * k
    a = 1.0 - np.clip((dom - lo) / (hi - lo), 0.0, 1.0)
    alpha = np.ones_like(dom)
    alpha[band] = a[band]
    alpha[core.astype(bool)] = 0.0
    return alpha, band, k


def despill(rgb, alpha, band, key="green"):
    out = rgb.copy()
    r, g, b = out[..., 0], out[..., 1], out[..., 2]
    m = band & (alpha > 0)
    if key == "green":
        lim = np.maximum(r, b)
        out[..., 1] = np.where(m, np.minimum(g, lim), g)
    else:
        lim = np.maximum(r, g)
        out[..., 2] = np.where(m, np.minimum(b, lim), b)
    return out


def bbox(alpha, thr=0.5):
    ys, xs = np.nonzero(alpha > thr)
    return xs.min(), ys.min(), xs.max(), ys.max()


def align_to_ref(rgba, ref_rgba):
    """Масштаб/сдвиг так, чтобы фигура совпала по высоте, макушке и центру с эталоном."""
    H, W = ref_rgba.shape[:2]
    a = rgba[..., 3] / 255.0
    ra = ref_rgba[..., 3] / 255.0
    x0, y0, x1, y1 = bbox(a)
    rx0, ry0, rx1, ry1 = bbox(ra)
    s = (ry1 - ry0) / max(1, (y1 - y0))
    cx, rcx = (x0 + x1) / 2, (rx0 + rx1) / 2
    if abs(s - 1.0) < 0.01:
        # тот же масштаб: целочисленный сдвиг без ресемплинга (без мыла)
        dx, dy = int(round(rcx - cx)), int(round(ry0 - y0))
        out = np.zeros((H, W, 4), np.uint8)
        src = rgba[max(0, -dy):, max(0, -dx):]
        hh, ww = min(H - max(0, dy), src.shape[0]), min(W - max(0, dx), src.shape[1])
        out[max(0, dy):max(0, dy) + hh, max(0, dx):max(0, dx) + ww] = src[:hh, :ww]
        return out, 1.0
    M = np.float32([[s, 0, rcx - s * cx], [0, s, ry0 - s * y0]])
    # премультипликация, чтобы при ресемплинге не тянуло цвет фона
    pm = rgba.astype(np.float32)
    pm[..., :3] *= pm[..., 3:4] / 255.0
    warped = cv2.warpAffine(pm, M, (W, H), flags=cv2.INTER_LANCZOS4,
                            borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    al = np.clip(warped[..., 3:4], 0, 255)
    rgb = np.where(al > 0.5, warped[..., :3] * 255.0 / np.maximum(al, 1e-3), 0)
    out = np.concatenate([np.clip(rgb, 0, 255), al], axis=2)
    return np.rint(out).astype(np.uint8), s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--ref")
    ap.add_argument("--key", default="green", choices=["green", "blue"])
    ap.add_argument("--neutral-despill", action="store_true",
                    help="снять оттенок ключа со всех почти-серых пикселей (для персонажей без "
                         "зелёного в палитре: Мираэль, белые перья). НЕ для Саши — серо-зелёные глаза")
    args = ap.parse_args()

    rgb = np.asarray(Image.open(args.src).convert("RGB")).astype(np.float32)
    alpha, band, k = key_alpha(rgb, args.key)
    rgb = despill(rgb, alpha, band, args.key)
    if args.neutral_despill:
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        if args.key == "green":
            m = (np.abs(r - b) < 40) & (g > np.maximum(r, b))
            rgb[..., 1] = np.where(m, np.maximum(r, b), g)
        else:
            m = (np.abs(r - g) < 40) & (b > np.maximum(r, g))
            rgb[..., 2] = np.where(m, np.maximum(r, g), b)
    rgba = np.rint(np.dstack([rgb, alpha * 255.0]).clip(0, 255)).astype(np.uint8)
    info = f"key={k:.0f}"
    if args.ref:
        ref = np.asarray(Image.open(args.ref).convert("RGBA"))
        rgba, s = align_to_ref(rgba, ref)
        info += f" scale={s:.3f}"
    Image.fromarray(rgba, "RGBA").save(args.dst, optimize=True)
    print(args.dst, info)


if __name__ == "__main__":
    main()
