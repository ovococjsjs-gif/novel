#!/usr/bin/env node
// Конвертация PNG → WebP с настройками проекта (00_decisions.md п. 117, assets.md §4).
//
//   Фоны и CG (assets/backgrounds/): quality 94, smartSubsample (sharp YUV), effort 6.
//   Спрайты (всё остальное):         quality 97, альфа без потерь (alphaQuality 100), smartSubsample, effort 6.
//
// На глаз при увеличении ×2 разницы с PNG нет; PSNR фонов около 39 дБ, видимой части спрайтов около 44 дБ.
// Файлы меньше в 5–8 раз.
//
// Запуск из корня репозитория (sharp не входит в игру, ставится только для конвертации):
//   npm i --no-save sharp
//   node tools/to_webp.js assets/backgrounds/bg_new.png assets/characters/lena/transparent/
//   node tools/to_webp.js --keep файл.png      # не удалять исходный PNG
//
// Папки обходятся рекурсивно, берутся только *.png. После конвертации в сценарии и vn-config
// ничего менять не нужно: resolveBg и SPRITES уже смотрят на .webp. Если PNG нужен для правки,
// он остаётся в истории git: git log --all -- путь/к/файлу.png, затем git checkout <коммит> -- путь.
"use strict";
const fs = require("fs");
const path = require("path");

let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error("Нужен пакет sharp: npm i --no-save sharp");
  process.exit(1);
}

const args = process.argv.slice(2);
const KEEP = args.includes("--keep");
const targets = args.filter((a) => !a.startsWith("--"));
if (!targets.length) {
  console.error("Укажите файлы или папки с PNG.");
  process.exit(1);
}

function collect(p, out) {
  const st = fs.statSync(p);
  if (st.isDirectory()) fs.readdirSync(p).forEach((f) => collect(path.join(p, f), out));
  else if (/\.png$/i.test(p)) out.push(p);
  return out;
}

const isBackground = (p) => p.split(path.sep).join("/").includes("assets/backgrounds/");

(async () => {
  const files = targets.reduce((acc, t) => collect(t, acc), []);
  let before = 0;
  let after = 0;
  for (const f of files) {
    const out = f.replace(/\.png$/i, ".webp");
    const opts = isBackground(f)
      ? { quality: 94, smartSubsample: true, effort: 6 }
      : { quality: 97, alphaQuality: 100, smartSubsample: true, effort: 6 };
    await sharp(f).webp(opts).toFile(out);
    const a = fs.statSync(f).size;
    const b = fs.statSync(out).size;
    before += a;
    after += b;
    if (!KEEP) fs.unlinkSync(f);
    console.log(`${f} → ${path.basename(out)}  ${(a / 1e6).toFixed(2)} → ${(b / 1e6).toFixed(2)} МБ`);
  }
  console.log(`Готово: ${files.length} файлов, ${(before / 1e6).toFixed(1)} → ${(after / 1e6).toFixed(1)} МБ`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
