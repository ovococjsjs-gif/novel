# CG «лист устава на латыни» для day3_1_office (cg_d3_latin_page).
# Основа base.png — сгенерированный пустой лист на столе Валерии с её рукой.
# Текст кладётся сверху программно, чтобы латынь и яти были настоящими:
#   колонтитул и §§ печатью (IM Fell DW Pica), перевод § 7 от руки (Bad Script), ноль на папке.
#
# Шрифты (OFL, Google Fonts) скачать в папку fonts/ рядом со скриптом:
#   for f in imfelldwpica/IMFePIrm28P.ttf imfelldwpica/IMFePIit28P.ttf imfelldwpicasc/IMFePIsc28P.ttf \
#            badscript/BadScript-Regular.ttf; do
#     gh api -H "Accept: application/vnd.github.raw" repos/google/fonts/contents/ofl/$f > fonts/$(basename $f); done
#
# Запуск (нужны pillow, numpy, opencv-python-headless):
#   python compose.py [base.png] [out.png]
#   node ../../tools/to_webp.js out.png  → положить как assets/backgrounds/cg_d3_latin_page.webp
# Если основу апскейлить или перерисовать, скрипт сам найдёт края листа и руку (по цвету) и переложит текст.
import os, sys, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "base.png")
OUT = sys.argv[2] if len(sys.argv) > 2 else "cg_d3_latin_page.png"
FD = os.environ.get("FONTS", os.path.join(HERE, "fonts")) + "/"
OW, OH = 1678, 937  # размер готовых CG

base0 = Image.open(BASE).convert("RGB")
S = OW / base0.width
base = base0.resize((OW, OH), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
B = np.asarray(base).astype(np.float32)

# ---------- маска листа и руки ----------
bgr = cv2.cvtColor(np.asarray(base), cv2.COLOR_RGB2BGR)
hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
Hh, Ss, Vv = cv2.split(hsv)
L, A, Bb = cv2.split(lab)
paperish = ((L > 150) & (Hh > 10) & (Hh < 35) & (Ss > 25)).astype(np.uint8) * 255
paperish = cv2.morphologyEx(paperish, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
paperish = cv2.morphologyEx(paperish, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
n, lbl, st, _ = cv2.connectedComponentsWithStats(paperish)
pm = (lbl == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
# кожа: краснее бумаги (a* выше), оттенок ближе к красному
skin = ((A.astype(int) > 138) & (L > 90)).astype(np.uint8)
skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
n2, lbl2, st2, _ = cv2.connectedComponentsWithStats(skin)
hand = np.zeros_like(skin)
for i in range(1, n2):
    x, y, w, h, a = st2[i]
    if a > 4000 and x + w > OW * 0.5:  # крупное пятно справа — рука
        hand[lbl2 == i] = 1
hand = cv2.dilate(hand, np.ones((9, 9), np.uint8))
sleeve = ((L < 120) & (Ss < 40)).astype(np.uint8)  # серый манжет
occl = np.clip(hand + 0, 0, 1)

# ---------- края листа ----------
ys, xs = np.nonzero(pm & (1 - hand))
def boundary_rows(y0, y1, side):
    pts = []
    for y in range(y0, y1, 4):
        r = np.nonzero(pm[y] & (1 - hand[y]))[0]
        if len(r) > 20:
            pts.append(((r.min() if side == "L" else r.max()), y))
    return np.array(pts, float)
def boundary_cols(x0, x1):
    pts = []
    for x in range(x0, x1, 4):
        c = np.nonzero(pm[:, x])[0]
        if len(c):
            pts.append((x, c.min()))
    return np.array(pts, float)
sc = S
left = boundary_rows(int(300 * sc), OH - 2, "L")
right = np.vstack([boundary_rows(int(70 * sc), int(160 * sc), "R"), boundary_rows(int(440 * sc), OH - 2, "R")])
top = boundary_cols(int(390 * sc), int(820 * sc))
aL = np.polyfit(left[:, 1], left[:, 0], 1)   # x = aL0*y + aL1
aR = np.polyfit(right[:, 1], right[:, 0], 1)
aT = np.polyfit(top[:, 0], top[:, 1], 1)     # y = aT0*x + aT1
def inter_vert_top(a):
    # x = a0*y + a1 ; y = t0*x + t1
    y = (aT[0] * a[1] + aT[1]) / (1 - aT[0] * a[0])
    return np.array([a[0] * y + a[1], y])
TL = inter_vert_top(aL)
TR = inter_vert_top(aR)
YB = 1000 * sc  # условный низ листа за кадром (по левому краю)
BL = np.array([aL[0] * YB + aL[1], YB])
# низ параллелен верху
# y = YB + t0*(x - BLx) ; x = aR0*y + aR1
yb = (YB + aT[0] * (aR[1] - BL[0])) / (1 - aT[0] * aR[0])
BR = np.array([aR[0] * yb + aR[1], yb])
print("TL", TL.round(1), "TR", TR.round(1), "BR", BR.round(1), "BL", BL.round(1))

PW, PH = 1000, 1700  # координаты листа
quad = np.float32([TL, TR, BR, BL])

# ---------- вёрстка в координатах листа ----------
K = 2.0  # пикселей на единицу листа при рендере
CW, CH = int(PW * K), int(PH * K)
def F(name, size):
    return ImageFont.truetype(FD + name, int(size * K))
f_head = F("IMFePIsc28P.ttf", 30)
f_cap = F("IMFePIit28P.ttf", 33)
f_body = F("IMFePIrm28P.ttf", 35)
f_sc = F("IMFePIsc28P.ttf", 33)
f_hand = F("BadScript-Regular.ttf", 35)

print_layer = Image.new("L", (CW, CH), 0)
hand_layer = Image.new("L", (CW, CH), 0)
dp = ImageDraw.Draw(print_layer)
dh = ImageDraw.Draw(hand_layer)
ML, MR = 95, 80
TW = PW - ML - MR

def wrap(text, font, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if dp.textlength(t, font=font) <= width * K:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def justify(draw, y, line, font, x0, width, last=False, fill=255):
    words = line.split()
    if last or len(words) == 1:
        draw.text((x0 * K, y * K), line, font=font, fill=fill); return
    wl = sum(draw.textlength(w, font=font) for w in words)
    gap = (width * K - wl) / (len(words) - 1)
    x = x0 * K
    for w in words:
        draw.text((x, y * K), w, font=font, fill=fill)
        x += draw.textlength(w, font=font) + gap

# переносы для латыни (по слогам), как в старом наборе
HY = {w.replace("-", ""): w for w in [
    "mo-men-tum", "pe-ri-cu-la", "a-ver-tit", "ad-ve-nit", "re-ce-dit", "in-ter-ce-dit",
    "Re-gi-stro", "dis-cre-pa-ve-rit", "pe-rac-ta", "cas-sa-ti-o-nis", "co-gni-ti-o-ne",
    "me-mo-ri-am", "re-co-quen-dam", "mit-ti-tur", "Ar-tes", "of-fi-ci-i", "ser-van-tur",
    "No-ti-ti-ae", "sub-iec-to", "com-mis-so", "om-ni-no", "au-fe-run-tur", "Cu-stos",
    "or-di-nes", "Co-gni-ti-o", "vi-gin-ti", "ab-sol-vi-tur", "in-tra", "u-num"]}

def paragraph(draw, text, font, y, lh, x0=ML, width=TW, indent=0, fill=255):
    lines = []; cur = ""; w_lim = width - indent
    words = text.split()
    i = 0
    while i < len(words):
        w = words[i]
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= w_lim * K:
            cur = t; i += 1; continue
        # пробуем перенести слово по слогам
        core = w.rstrip(".,;:")
        tail = w[len(core):]
        done = False
        if core in HY:
            parts = HY[core].split("-")
            for k in range(len(parts) - 1, 0, -1):
                head = "".join(parts[:k]) + "-"
                if len(head) < 3: continue
                t2 = (cur + " " + head).strip()
                if draw.textlength(t2, font=font) <= w_lim * K and len("".join(parts[k:])) >= 2:
                    lines.append((t2, indent if not lines else 0))
                    words[i] = "".join(parts[k:]) + tail
                    cur = ""; w_lim = width; done = True
                    break
        if not done:
            lines.append((cur, indent if not lines else 0)); cur = ""; w_lim = width
    if cur: lines.append((cur, indent if not lines else 0))
    for j, (ln, ind) in enumerate(lines):
        justify(draw, y, ln, font, x0 + ind, width - ind, last=(j == len(lines) - 1), fill=fill)
        y += lh
    return y

y = 62
# колонтитул
head = "STATUTUM CANCELLARIAE SUPERIORIS"
w = dp.textlength(head, font=f_head) / K
dp.text(((PW - w) / 2 * K, y * K), head, font=f_head, fill=255)
dp.text(((PW - MR - dp.textlength("47", font=f_head) / K) * K, y * K), "47", font=f_head, fill=255)
y += 44
dp.line([(ML * K, y * K), ((PW - MR) * K, y * K)], fill=255, width=int(1.6 * K))
y += 22
# хвост § 6 с прошлой страницы
y = paragraph(dp, "cum advenit, recedit neque intercedit.", f_body, y, 47)
y += 18
cap = "Caput XII. De Custodibus discrepantibus."
w = dp.textlength(cap, font=f_cap) / K
dp.text(((PW - w) / 2 * K, y * K), cap, font=f_cap, fill=255)
y += 56
p7 = ("§ 7. Custos, qui a Registro discrepaverit, peracta cassationis cognitione ad memoriam "
      "recoquendam mittitur. Artes officii servantur. Notitiae de subiecto commisso omnino "
      "auferuntur. Custos in ordines redit.")
y = paragraph(dp, p7, f_body, y, 48, indent=40)
y7_end = y
y += 16
# рукописный перевод
tr = ("Хранитель, допустившій расхожденіе съ Реестромъ, по завершеніи кассаціоннаго разбора "
      "направляется на переплавку памяти. Служебные навыки сохраняются. Свѣдѣнія о ввѣренномъ "
      "субъектѣ изымаются полностью. Хранитель возвращается въ строй.")
hy = y + 6
words = tr.split(); lines = []; cur = ""
for wd in words:
    t = (cur + " " + wd).strip()
    if dh.textlength(t, font=f_hand) <= (TW - 30) * K:
        cur = t
    else:
        lines.append(cur); cur = wd
if cur: lines.append(cur)
rng = np.random.default_rng(7)
for i, ln in enumerate(lines):
    # строки чуть гуляют: наклон и сдвиг, как у живой руки
    tmp = Image.new("L", (int(TW * K + 200), int(90 * K)), 0)
    ImageDraw.Draw(tmp).text((20, 10), ln, font=f_hand, fill=255, stroke_width=2, stroke_fill=255)
    tmp = tmp.rotate(rng.uniform(-0.7, 0.5), resample=Image.BICUBIC)
    x0 = int((ML + 18 + rng.uniform(-4, 4)) * K) - 20
    y0 = int(hy * K) - 10
    lay = Image.new("L", hand_layer.size, 0)
    lay.paste(tmp, (x0, y0))
    hand_layer = ImageChops.lighter(hand_layer, lay)
    hy += 53 + rng.uniform(-2, 2)
dh = ImageDraw.Draw(hand_layer)
y = hy + 32
p8 = "§ 8. Cassatio diebus viginti et uno absolvitur."
y = paragraph(dp, p8, f_body, y, 48, indent=40)
print("layout end y", round(y), "§7 end", round(y7_end), "hand end", round(hy))

# ---------- фактура чернил ----------
def fbm(shape, scales, seed):
    r = np.random.default_rng(seed)
    acc = np.zeros(shape, np.float32)
    for s, wgt in scales:
        small = r.random((max(2, shape[0] // s), max(2, shape[1] // s))).astype(np.float32)
        acc += wgt * cv2.resize(small, (shape[1], shape[0]), interpolation=cv2.INTER_CUBIC)
    acc -= acc.min(); acc /= acc.max() + 1e-6
    return acc
pa = np.asarray(print_layer).astype(np.float32) / 255
ha = np.asarray(hand_layer).astype(np.float32) / 255
pa = cv2.GaussianBlur(pa, (0, 0), 0.6 * K / 2)
pa *= 0.78 + 0.22 * fbm(pa.shape, [(40, 0.6), (8, 0.4)], 1)
ha = cv2.GaussianBlur(ha, (0, 0), 0.5 * K / 2)
ha *= 0.55 + 0.45 * fbm(ha.shape, [(120, 0.5), (14, 0.5)], 2)

# ---------- перенос на лист ----------
src = np.float32([[0, 0], [PW * K, 0], [PW * K, PH * K], [0, PH * K]])
U = 2  # варп в 2x, потом уменьшение
Hm = cv2.getPerspectiveTransform(src, quad * U)
def warp(a):
    w2 = cv2.warpPerspective(a, Hm, (OW * U, OH * U), flags=cv2.INTER_LINEAR, borderValue=0)
    return cv2.resize(w2, (OW, OH), interpolation=cv2.INTER_AREA)
pw_ = warp(pa); hw_ = warp(ha)
# внутри листа, не на руке
inside = cv2.erode(pm, np.ones((7, 7), np.uint8)).astype(np.float32)
inside = cv2.GaussianBlur(inside, (0, 0), 1.5)
keep = inside * (1 - cv2.GaussianBlur(occl.astype(np.float32), (0, 0), 1.2))
pw_ *= keep; hw_ *= keep

# ---------- ноль на папке: от руки, жирно, в два нажима ----------
def hand_zero(canvas, c, rx, ry, rot, width, seed, start=-70, sweep=395):
    r = np.random.default_rng(seed)
    pts = []
    n = 90
    wob = r.uniform(-0.05, 0.05, 6)
    for i in range(n + 1):
        t = math.radians(start - sweep * i / n)  # против часовой, с заходом за начало
        k = 1 + wob[0] * math.sin(t * 2 + wob[1] * 20) + wob[2] * math.sin(t * 3 + wob[3] * 20)
        x = rx * k * math.cos(t); y = ry * k * math.sin(t)
        # лёгкий «яйцевидный» перекос: низ шире
        x *= 1 + 0.06 * math.sin(t)
        cr, sr = math.cos(math.radians(rot)), math.sin(math.radians(rot))
        pts.append((c[0] + x * cr - y * sr, c[1] + x * sr + y * cr))
    for i in range(n):
        p0, p1 = pts[i], pts[i + 1]
        # нажим: толще в середине штриха, тоньше на входе и выходе
        f = i / n
        wdt = width * (0.55 + 0.45 * math.sin(math.pi * min(1, f * 1.15)))
        cv2.line(canvas, (int(p0[0] * 4), int(p0[1] * 4)), (int(p1[0] * 4), int(p1[1] * 4)), 1.0, max(1, int(round(wdt))), lineType=cv2.LINE_AA, shift=2)
zero = np.zeros((OH * U, OW * U), np.float32)
zc = (118 * S * U, 470 * S * U)
hand_zero(zero, zc, 19 * S * U, 31 * S * U, 13, 8.0 * S * U, 11)
hand_zero(zero, (zc[0] + 3.5 * S * U, zc[1] - 2.0 * S * U), 18 * S * U, 30 * S * U, 17, 6.0 * S * U, 12, start=-60, sweep=380)
zero = cv2.GaussianBlur(zero, (0, 0), 0.8 * U)
zero = cv2.resize(zero, (OW, OH), interpolation=cv2.INTER_AREA)
zero = np.clip(zero * 1.15, 0, 1) * (0.75 + 0.25 * fbm((OH, OW), [(30, 0.6), (5, 0.4)], 3))

# ---------- сведение (умножение) ----------
def ink(Bimg, alpha, color, strength):
    c = np.array(color, np.float32) / 255
    a = (alpha * strength)[..., None]
    return Bimg * (1 - a) + Bimg * c * a
R = B.copy()
R = ink(R, pw_, (52, 38, 30), 0.92)
R = ink(R, hw_, (122, 64, 34), 0.82)
R = ink(R, zero, (28, 30, 44), 0.85)
out = Image.fromarray(np.clip(R, 0, 255).astype(np.uint8))
out.save(OUT)
print("saved", OUT)
