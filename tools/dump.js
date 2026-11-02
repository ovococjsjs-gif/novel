#!/usr/bin/env node
// Сценарий как читаемый текст: node tools/dump.js script/day2_1_quit.js [ещё файлы]
const fs = require("fs"), vm = require("vm");
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of process.argv.slice(2)) vm.runInContext(fs.readFileSync(f, "utf8"), ctx);
function walk(ns, d) {
  for (const n of ns) {
    const p = "  ".repeat(d);
    if (n.label) console.log(p + "#" + n.label);
    if (n.bg && String(n.bg).startsWith("cg")) console.log(p + "[CG " + n.bg + "]");
    if (n.text) console.log(p + (n.speaker ? n.speaker + (n.thought ? " (мысль)" : "") + ": " : "") + n.text);
    if (n.if) { console.log(p + "IF " + n.if); walk(n.then || [], d + 1); if (n.else) { console.log(p + "ELSE"); walk(n.else, d + 1); } }
    if (n.choice) {
      console.log(p + "CHOICE " + n.choice.id + ": " + n.choice.prompt);
      for (const o of n.choice.options) {
        console.log(p + " > " + o.label + (o.effects ? " " + JSON.stringify(o.effects) : "") + (o.set ? " " + JSON.stringify(o.set) : ""));
        walk(o.next || [], d + 2);
      }
    }
  }
}
for (const c of ctx.window.VN_CHAPTERS || []) { console.log("\n=== " + c.id + " | " + c.title + " | " + (c.subtitle || "")); walk(c.nodes, 0); }
