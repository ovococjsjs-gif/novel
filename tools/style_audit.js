#!/usr/bin/env node
// Стилевой аудит текста — помощник для редактуры, не судья.
// Запуск из корня:  node tools/style_audit.js [chapter_id ...] [--lines] [--repeats]
//   без аргументов — сводная таблица по всем главам;
//   --lines   — показать сами подозрительные строки (для указанных глав);
//   --repeats — повторяющиеся обороты между главами (4 слова подряд в 3+ главах).
// Что ищет (style_guide.md §2, feedback_log 01.11 и 02.11):
//   cmp  — сравнения «словно / будто / как будто / точно…»;
//   nxy  — «не X, а Y», «X, а не Y», «не просто», «не столько… сколько», «это не… это»;
//   tri  — тройные ряды «X, Y и Z» (эвристика, много ложных срабатываний — смотреть глазами);
//   num  — счёт: числительные, «секунд/минут/раз/шаг…» (сюжетные 22:58 и 21 день не считаются);
//   tic  — частые обороты черновика («почему-то», «чуть дольше», «открыл рот», «что-то живое» …);
// Автоматические проверки — вспомогательные: цель в том, чтобы этого не было в тексте,
// а не в том, чтобы пройти скрипт.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const SHOW_LINES = args.includes("--lines");
const REPEATS = args.includes("--repeats");
const ONLY = args.filter((a) => !a.startsWith("--"));

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const files = [...html.matchAll(/<script\s+src="(script\/[^"?]+)/g)].map((m) => m[1]);
const sandbox = { window: {}, console };
sandbox.self = sandbox.window;
vm.createContext(sandbox);
for (const rel of files) vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), sandbox, { filename: rel });
const chapters = (sandbox.window.VN_CHAPTERS || []).filter((c) => !ONLY.length || ONLY.includes(c.id));

const W = "[А-Яа-яЁё-]";
const RX = {
  cmp: /(^|[^а-яё])(словно|будто|точно\s+(?:кто|что|его|её|ее|их))(?=[^а-яё]|$)/gi,
  nxy: new RegExp(
    [
      "(^|[^а-яё])не\\s+[^.!?;:«»]{1,50},\\s*а\\s+(?!то[\\s,.!?]|вдруг|потом|ещё|еще|если|когда|там|тут)",
      ",\\s*а\\s+не\\s",
      "(^|[^а-яё])не\\s+просто\\s",
      "не\\s+столько[^.!?]{1,60}сколько",
      "(^|[^а-яё])это\\s+не\\s+[^.!?]{1,40}[.,—–-]\\s*это\\s",
      "(^|[^а-яё])не\\s+(?:потому|из-за)[^.!?]{1,60}[,—]\\s*а\\s"
    ].join("|"),
    "gi"
  ),
  tri: new RegExp(`(^|[\\s«(])(${W}+(?:\\s${W}+)?),\\s(${W}+(?:\\s${W}+)?),\\s?(?:и|или|да)\\s(${W}+)`, "g"),
  num: /(^|[^а-яё])(одн[аоуи]|два|две|три|четыре|пять|шесть|семь|восемь|девять|десять|двадцат\S*|тридцат\S*|сорок\S*|полтор\S*|секунд\S*|минут\S*|раз[ау]?|шаг[аов]*|ступен\S*|\d+)(?=[^а-яё]|$)/gi,
  tic: /(почему-то|чуть дольше|дольше, чем|открыл рот|открыла рот|что-то живое|едва заметно|чуть заметно|на мгновение|на секунду|медленно|осторожно|внимательно|в груди|тихо сказал|тихо ответил|ладно, это я загнул|повисл|не сразу|долго смотрел|долго молчал)/gi
};
const SKIP_NUM = /22:58|двадцать один д|21 д/i;

function texts(nodes, out, inChoice) {
  (nodes || []).forEach((n) => {
    if (!n || typeof n !== "object") return;
    if (n.text) out.push({ kind: n.thought ? "thought" : n.speaker && n.speaker !== "Рассказчик" ? "line" : "narr", text: n.text });
    if (n.choice) {
      if (n.choice.prompt) out.push({ kind: "prompt", text: n.choice.prompt });
      (n.choice.options || []).forEach((o) => {
        if (o.label) out.push({ kind: "label", text: o.label });
        texts(o.next || o.nodes, out, true);
      });
    }
    if (n.then) texts(n.then, out, inChoice);
    if (n.else) texts(n.else, out, inChoice);
  });
  return out;
}

const count = (re, s) => ((s || "").match(re) || []).length;
const words = (s) => (s.match(/[А-Яа-яЁёA-Za-z0-9-]+/g) || []).length;

const rows = [];
const all = {};
for (const ch of chapters) {
  const t = texts(ch.nodes, []);
  const body = t.filter((x) => x.kind !== "label" && x.kind !== "prompt");
  const wc = body.reduce((a, x) => a + words(x.text), 0);
  const hits = { cmp: [], nxy: [], tri: [], num: [], tic: [] };
  body.forEach((x) => {
    for (const k of Object.keys(hits)) {
      let s = x.text;
      if (k === "num" && SKIP_NUM.test(s)) s = s.replace(SKIP_NUM, "");
      const c = count(RX[k], s);
      if (c) hits[k].push({ c, text: x.text });
    }
  });
  const sum = (k) => hits[k].reduce((a, h) => a + h.c, 0);
  // разброс длины предложений в авторской речи
  const sents = body.filter((x) => x.kind === "narr").flatMap((x) => x.text.split(/(?<=[.!?…])\s+/)).map(words).filter(Boolean);
  const mean = sents.reduce((a, b) => a + b, 0) / (sents.length || 1);
  const sd = Math.sqrt(sents.reduce((a, b) => a + (b - mean) ** 2, 0) / (sents.length || 1));
  rows.push({ id: ch.id, wc, cmp: sum("cmp"), nxy: sum("nxy"), tri: sum("tri"), num: sum("num"), tic: sum("tic"), mean: mean.toFixed(1), sd: sd.toFixed(1), hits });
  all[ch.id] = body.map((x) => x.text).join(" ");
}

const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
console.log(pad("глава", 24) + ["слов", "cmp", "nxy", "tri", "num", "tic", "ср.дл", "разбр"].map((h) => lpad(h, 7)).join(""));
let tot = { wc: 0, cmp: 0, nxy: 0, tri: 0, num: 0, tic: 0 };
rows.forEach((r) => {
  console.log(pad(r.id, 24) + [r.wc, r.cmp, r.nxy, r.tri, r.num, r.tic, r.mean, r.sd].map((v) => lpad(v, 7)).join(""));
  for (const k of Object.keys(tot)) tot[k] += r[k];
});
console.log(pad("ИТОГО", 24) + [tot.wc, tot.cmp, tot.nxy, tot.tri, tot.num, tot.tic].map((v) => lpad(v, 7)).join(""));
console.log(`\nна 1000 слов: сравнений ${(tot.cmp / tot.wc * 1000).toFixed(1)}, «не X, а Y» ${(tot.nxy / tot.wc * 1000).toFixed(1)}, счёт ${(tot.num / tot.wc * 1000).toFixed(1)}`);

if (SHOW_LINES) {
  rows.forEach((r) => {
    console.log(`\n=== ${r.id}`);
    for (const k of ["nxy", "cmp", "tri", "tic", "num"]) {
      r.hits[k].forEach((h) => console.log(`  [${k}] ${h.text}`));
    }
  });
}

if (REPEATS) {
  const seen = {};
  for (const [id, txt] of Object.entries(all)) {
    const ws = txt.toLowerCase().replace(/[^а-яё\s-]/g, " ").split(/\s+/).filter(Boolean);
    const local = new Set();
    for (let i = 0; i + 4 <= ws.length; i++) local.add(ws.slice(i, i + 4).join(" "));
    local.forEach((g) => ((seen[g] = seen[g] || new Set()).add(id)));
  }
  const rep = Object.entries(seen).filter(([, s]) => s.size >= 3).sort((a, b) => b[1].size - a[1].size);
  console.log(`\nПовторы (4 слова в 3+ главах): ${rep.length}`);
  rep.slice(0, 60).forEach(([g, s]) => console.log(`  ${s.size}× «${g}» — ${[...s].join(", ")}`));
}
