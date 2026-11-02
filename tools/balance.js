#!/usr/bin/env node
// Баланс выборов: сколько каждой переменной можно набрать за главы.
// Запуск из корня:  node tools/balance.js [--list] [--upto day7_2_stairs]
//   --list   распечатать каждый выбор с вариантами и эффектами
//   --upto   считать главы до указанной включительно (по умолчанию — конец Недели 1)
// Потолок считается жадно: по каждому выбору берётся вариант с максимумом
// для данной переменной (минимум — с минимумом). Вложенные выборы внутри
// вариантов складываются только для «своего» варианта. Это оценка сверху/снизу,
// а не точный перебор путей, но для калибровки маршрутов её хватает.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const LIST = args.includes("--list");
const uptoIdx = args.indexOf("--upto");
const UPTO = uptoIdx >= 0 ? args[uptoIdx + 1] : "day7_2_stairs";

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const files = [...html.matchAll(/<script\s+src="([^"]+)"/g)]
  .map((m) => m[1].split("?")[0])
  .filter((s) => s.startsWith("script/"));
const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const rel of files) vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), sandbox, { filename: rel });
const chapters = sandbox.window.VN_CHAPTERS || [];
const stop = chapters.findIndex((c) => c.id === UPTO);
const scope = stop >= 0 ? chapters.slice(0, stop + 1) : chapters;

const TRACK = ["aff_mirael", "aff_valeria", "aff_lena", "aff_taya", "aff_nika", "inner_sight"];
const zero = () => Object.fromEntries(TRACK.map((k) => [k, 0]));

// Возвращает {max:{}, min:{}} для списка узлов.
function walk(nodes, where) {
  const max = zero();
  const min = zero();
  const add = (r) => TRACK.forEach((k) => { max[k] += r.max[k]; min[k] += r.min[k]; });
  for (const n of nodes || []) {
    if (!n || typeof n !== "object") continue;
    if (n.effects) TRACK.forEach((k) => { const v = Number(n.effects[k] || 0); max[k] += v; min[k] += v; });
    if (n.then || n.else) {
      const a = walk(n.then, where), b = walk(n.else, where);
      TRACK.forEach((k) => { max[k] += Math.max(a.max[k], b.max[k]); min[k] += Math.min(a.min[k], b.min[k]); });
    }
    if (n.choice) {
      const opts = n.choice.options || [];
      const res = opts.map((o) => {
        const inner = walk(o.next, where);
        TRACK.forEach((k) => { const v = Number((o.effects || {})[k] || 0); inner.max[k] += v; inner.min[k] += v; });
        return inner;
      });
      if (LIST) {
        console.log(`\n[${where}] ${n.choice.id}: ${n.choice.prompt || ""}`);
        opts.forEach((o, i) => {
          const e = Object.entries(o.effects || {}).map(([k, v]) => `${k}${v > 0 ? "+" : ""}${v}`).join(" ");
          const cond = o.if ? `  {if ${o.if}}` : "";
          console.log(`   ${i + 1}. ${o.label}  →  ${e || "—"}${cond}`);
        });
      }
      if (res.length) {
        TRACK.forEach((k) => {
          max[k] += Math.max(...res.map((r) => r.max[k]));
          min[k] += Math.min(...res.map((r) => r.min[k]));
        });
      }
    }
  }
  return { max, min };
}

const total = { max: zero(), min: zero() };
const rows = [];
for (const ch of scope) {
  const r = walk(ch.nodes, ch.id);
  TRACK.forEach((k) => { total.max[k] += r.max[k]; total.min[k] += r.min[k]; });
  rows.push([ch.id, r]);
}
const pad = (s, n) => String(s).padEnd(n);
console.log("\n" + pad("глава", 22) + TRACK.map((k) => pad(k.replace("aff_", ""), 10)).join(""));
for (const [id, r] of rows) {
  const cells = TRACK.map((k) => pad(r.max[k] || r.min[k] ? `${r.max[k]}/${r.min[k]}` : "·", 10)).join("");
  console.log(pad(id, 22) + cells);
}
console.log(pad("ИТОГО max/min", 22) + TRACK.map((k) => pad(`${total.max[k]}/${total.min[k]}`, 10)).join(""));
