#!/usr/bin/env node
// Прогон сценария без браузера: проверка маршрутизации Недели 1.
// Запуск из корня:  node tools/simulate.js [стратегия ...] [--meta true] [--glitch]
//   стратегии: mirael | valeria | lena | taya | sight | flee | first | random
//     mirael/valeria/lena/taya — в каждом выборе брать вариант с наибольшей симпатией героини
//     sight — с наибольшим inner_sight; flee — с наименьшим; first — всегда первый
//   --glitch  принимать сбои (кв. 0, кнопка «—», дверь под лестницей)
//   --meta true  считать открытыми все хорошие финалы (проверка входа в Истинную)
//   --runs N  для random: прогнать N случайных партий и напечатать только распределение маршрутов
// По умолчанию прогоняются все стратегии. Печатает итоговые симпатии, calc.* и route.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const Core = require(path.join(ROOT, "vn-core.js"));
const args = process.argv.slice(2);
const GLITCH = args.includes("--glitch");
const META_TRUE = args.includes("--meta");
const runsIdx = args.indexOf("--runs");
const RUNS = runsIdx >= 0 ? Math.max(1, parseInt(args[runsIdx + 1], 10) || 1000) : 0;
const strategies = args.filter((a, i) => !a.startsWith("--") && a !== "true" && !(runsIdx >= 0 && i === runsIdx + 1));
const ALL = ["mirael", "valeria", "lena", "taya", "sight", "flee", "first", "random"];

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const files = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1].split("?")[0]).filter((s) => s.startsWith("script/"));
const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const rel of files) vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), sandbox, { filename: rel });
const W = sandbox.window;
const chapters = W.VN_CHAPTERS;
const compiled = Object.fromEntries(chapters.map((c) => [c.id, Core.compileChapter(c)]));

function run(strategy, seed = 1) {
  const vars = Object.fromEntries(Object.entries(W.VN_VARS).map(([k, v]) => [k, v.default]));
  let rnd = seed;
  const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const get = (n) => {
    if (n.startsWith("meta.")) return META_TRUE ? 1 : 0;
    if (n.startsWith("thr.")) return W.VN_THRESHOLDS[n.slice(4)] || 0;
    if (n.startsWith("calc.")) return Core.routeCalc(get, W.VN_THRESHOLDS)[n.slice(5)] || 0;
    return vars[n];
  };
  const apply = (e, s) => {
    if (e) for (const [k, v] of Object.entries(e)) vars[k] = (Number(vars[k]) || 0) + Number(v);
    if (s) Object.assign(vars, s);
  };
  const key = { mirael: "aff_mirael", valeria: "aff_valeria", lena: "aff_lena", taya: "aff_taya", sight: "inner_sight", flee: "inner_sight" }[strategy];
  const isGlitch = (o) => (o.effects && o.effects.glitch_count) || /Открыть дверь/.test(o.label);
  let ch = chapters[0].id, pc = 0, guard = 0;
  const trail = [];
  while (ch && ++guard < 100000) {
    const comp = compiled[ch];
    if (!comp) { trail.push(`→ ${ch} (не написана)`); break; }
    if (pc >= comp.code.length) {
      const nx = Core.resolveChapterNext(chapters.find((c) => c.id === ch), chapters, get);
      if (nx && !compiled[nx]) { trail.push(`→ ${nx} (не написана)`); break; }
      ch = nx; pc = 0; continue;
    }
    const ins = comp.code[pc];
    switch (ins.op) {
      case "set": apply(ins.effects, ins.set); pc++; break;
      case "branch": pc = Core.evalCond(ins.cond, get) ? pc + 1 : ins.target; break;
      case "goto": pc = ins.target; break;
      case "jump": {
        const to = ins.to;
        if (comp.labels[to] !== undefined) pc = comp.labels[to];
        else if (compiled[to]) { ch = to; pc = 0; }
        else { trail.push(`→ ${to} (не найдено)`); ch = null; }
        break;
      }
      case "choice": {
        const vis = ins.options.filter((o) => o.if === undefined || Core.evalCond(o.if, get));
        let pick = vis[0];
        const glitchOpt = vis.find(isGlitch);
        if (GLITCH && glitchOpt) pick = glitchOpt;
        else {
          // в режиме --runs случайный игрок честно выбирает из всех видимых вариантов, сбои тоже
          const pool = RUNS ? vis : vis.filter((o) => !isGlitch(o)).length ? vis.filter((o) => !isGlitch(o)) : vis;
          if (strategy === "random") pick = pool[Math.floor(rand() * pool.length)];
          else if (strategy === "first") pick = pool[0];
          else {
            // при равенстве — вариант, который меньше всего даёт остальным героиням («чистое» прохождение)
            const AFF = ["aff_mirael", "aff_valeria", "aff_lena", "aff_taya"];
            const others = (o) => AFF.filter((k) => k !== key).reduce((t, k) => t + Number((o.effects || {})[k] || 0), 0);
            const score = (o) => Number((o.effects || {})[key] || 0) * (strategy === "flee" ? -1 : 1) * 100 - others(o);
            pick = pool.reduce((a, b) => (score(b) > score(a) ? b : a), pool[0]);
          }
        }
        if (ins.choice.id === "d7_route") trail.push(`ничья → меню: ${vis.map((o) => o.label).join(" / ")}`);
        apply(pick.effects, pick.set);
        pc = pick.target;
        break;
      }
      default: pc++;
    }
  }
  const c = Core.routeCalc(get, W.VN_THRESHOLDS);
  return { vars, calc: c, trail };
}

const names = W.VN_ROUTE_NAMES || {};
if (RUNS) {
  const dist = {};
  let ties = 0, passive = 0;
  const sum = { aff_mirael: 0, aff_valeria: 0, aff_lena: 0, aff_taya: 0 };
  for (let i = 0; i < RUNS; i++) {
    const r = run("random", 1 + ((i * 2654435761) % 2147483646));
    for (const k in sum) sum[k] += r.vars[k] / RUNS;
    const k = r.vars.route;
    dist[k] = (dist[k] || 0) + 1;
    if (r.calc.tie) ties++;
    if (r.vars.earth_passive) passive++;
  }
  console.log(`random × ${RUNS}:`);
  for (const k of Object.keys(dist).sort()) console.log(`  route ${k} ${(names[k] || "").padEnd(44)} ${((dist[k] / RUNS) * 100).toFixed(1)}%`);
  console.log(`  ничьих: ${((ties / RUNS) * 100).toFixed(1)}%, пассивный вход: ${((passive / RUNS) * 100).toFixed(1)}%`);
  console.log(`  средние симпатии: M ${sum.aff_mirael.toFixed(2)}  V ${sum.aff_valeria.toFixed(2)}  L ${sum.aff_lena.toFixed(2)}  T ${sum.aff_taya.toFixed(2)}`);
  process.exit(0);
}
for (const s of strategies.length ? strategies : ALL) {
  const seeds = s === "random" ? [1, 7, 42, 99, 2024] : [1];
  for (const seed of seeds) {
    const r = run(s, seed);
    const v = r.vars;
    console.log(
      `${(s + (s === "random" ? "#" + seed : "")).padEnd(12)} M${v.aff_mirael} V${v.aff_valeria} L${v.aff_lena} T${v.aff_taya} sight${v.inner_sight} glitch${v.glitch_count}` +
        `  leader=${r.calc.leader} tie=${r.calc.tie}  route=${v.route} ${names[v.route] || ""}${v.earth_passive ? " (пассивный вход)" : ""}` +
        (r.trail.length ? `\n             ${r.trail.join("; ")}` : "")
    );
  }
}
