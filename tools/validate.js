#!/usr/bin/env node
// Валидатор сценария «Не смотри на небо».
// Запуск из корня репозитория:  node tools/validate.js [--strict] [--quiet] [--stats] [chapter_id ...]
//   --strict  считать предупреждения ошибками (код выхода 1)
//   --quiet   показывать только ошибки
//   --stats   таблица объёма по главам
// ОШИБКИ — то, что ломает игру (нет файла, битый переход, неизвестная переменная).
// ПРЕДУПРЕЖДЕНИЯ — нарушения style_guide.md и канона, которые ловятся автоматически.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const STRICT = args.includes("--strict");
const QUIET = args.includes("--quiet");
const STATS = args.includes("--stats");
const ONLY = args.filter((a) => !a.startsWith("--"));

const Cfg = require(path.join(ROOT, "vn-config.js"));
const Core = require(path.join(ROOT, "vn-core.js"));

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where} — ${msg}`);
const warn = (where, msg) => warnings.push(`${where} — ${msg}`);
const exists = (rel) => fs.existsSync(path.join(ROOT, rel.split("?")[0]));

// ------------------------------------------------------------------
// 1. Загрузка скриптов в порядке index.html
// ------------------------------------------------------------------
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const scriptSrcs = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1].split("?")[0]);
const scriptFiles = scriptSrcs.filter((s) => s.startsWith("script/"));

const sandbox = { window: {}, console };
sandbox.self = sandbox.window;
vm.createContext(sandbox);
const chapterFile = {};
for (const rel of scriptFiles) {
  if (!exists(rel)) {
    err("index.html", `подключён несуществующий файл ${rel}`);
    continue;
  }
  const before = (sandbox.window.VN_CHAPTERS || []).length;
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), sandbox, { filename: rel });
  } catch (e) {
    err(rel, `ошибка выполнения: ${e.message}`);
    continue;
  }
  (sandbox.window.VN_CHAPTERS || []).slice(before).forEach((c) => (chapterFile[c.id] = rel));
}
for (const f of fs.readdirSync(path.join(ROOT, "script"))) {
  if (f.endsWith(".js") && !scriptFiles.includes(`script/${f}`)) warn(`script/${f}`, "файл не подключён в index.html");
}

const chapters = sandbox.window.VN_CHAPTERS || [];
const VARS = sandbox.window.VN_VARS || {};
if (!sandbox.window.VN_VARS) err("script/_registry.js", "нет реестра переменных window.VN_VARS");

// ------------------------------------------------------------------
// 2. Справочники для проверок стиля
// ------------------------------------------------------------------
const NODE_KEYS = new Set([...Core.ENV_KEYS, ...Core.CONTROL_KEYS, "speaker", "text", "thought", "note"]);
const OPTION_KEYS = new Set(["label", "effects", "set", "if", "next", "nodes", "jump", "note"]);

const BANNED = [
  "нечто", "что-то внутри", "лёгкий холодок", "легкий холодок", "тяжёлые слова", "тяжелые слова",
  "разлилось", "разлилась", "по-настоящему", "наконец-то", "в этот момент", "в тот момент",
  "каким-то образом", "казалось бы", "словно бы", "побелевшие костяшки", "затаил дыхание",
  "затаила дыхание", "сердце пропустило удар"
];
const BANNED_RE = [
  [/(тишина|пауза|молчание)[^.!?]{0,20}\bповисл|повисл[аио]?\s+(тишина|пауза|молчание)/i, "«повисла тишина/пауза»"]
];
const CHURCH_RE = /(^|[^а-яё])(рай|рая|раю|ад|ада|аду|бог|бога|богу|богом|божий|божья|господи|господь|молитв\S*|грех\S*|грешн\S*|свят(ой|ая|ое|ые|ого|ую)|церк\S*|апостол\S*|библи\S*)(?=[^а-яё]|$)/i;
const SEASON_RE = /(сентябр\S*|тополин\S*|осен\S*|листопад\S*)/i;
const REAL_RE = /(сдэк|москв\S*|петербург\S*|питер\S*|воронеж\S*|яндекс\S*|сбер\S*|ленин\S*|гагарин\S*|советск\S*|исаакиев\S*|мак(дональдс|дак))/i;
const NOT_X_BUT_Y_RE = /(^|[\s«—(])не\s+[^,.!?;:«»]{1,40},\s+а\s+(?!то[\s,.!?])/i;
const FIRST_PERSON_RE = /(^|[^а-яё])(я|меня|мне|мной|мой|моя|моё|мое|мои|моего|моей)(?=[^а-яё]|$)/i;
const NICK_RE = /(граф|барон|князь|маркиз|виконт|герцог)\S*/gi;
const SIMILE_RE = /(^|[^а-яё])(словно|будто)(?=[^а-яё]|$)/gi;
const SUDDEN_RE = /(внезапно|неожиданно)/gi;
const A_CHTO_RE = /а что\?/gi;

const MAX_LINE = 220;
const MAX_NARR = 300;
const MAX_LABEL = 70;

const lc = (s) => (s || "").toLowerCase();
const countRe = (re, s) => ((s || "").match(re) || []).length;

// ------------------------------------------------------------------
// 3. Проверки
// ------------------------------------------------------------------
const ids = new Set();
const choiceIds = new Map();
const stats = [];

function checkVarName(where, name, kind) {
  if (name.startsWith("meta.") || name.startsWith("thr.")) return;
  if (!(name in VARS)) err(where, `${kind}: переменная «${name}» не описана в script/_registry.js`);
}

function checkCondition(where, cond) {
  try {
    Core.condVars(cond).forEach((v) => checkVarName(where, v, "условие"));
  } catch (e) {
    err(where, `условие не разбирается: ${e.message}`);
  }
}

function checkSprite(where, spec) {
  if (spec === undefined || spec === "clear") return;
  if (typeof spec !== "object" || spec === null) {
    err(where, `sprite: непонятное значение ${JSON.stringify(spec)}`);
    return;
  }
  const one = (sp) => {
    if (!sp || sp === "clear") return;
    if (!Cfg.SPRITES[sp.char]) {
      err(where, `sprite: неизвестный персонаж «${sp.char}»`);
      return;
    }
    const r = Cfg.resolveSprite(sp.char, sp.emotion);
    if (!r.exact) warn(where, `sprite: у «${sp.char}» нет эмоции «${sp.emotion}», будет показан запасной`);
    if (!exists(r.path)) err(where, `sprite: нет файла ${r.path}`);
    if (sp.pos && !["left", "center", "right"].includes(sp.pos)) err(where, `sprite: pos «${sp.pos}»`);
  };
  if (spec.char) one(spec);
  ["left", "center", "right"].forEach((k) => spec[k] && one(spec[k]));
}

function checkEnv(where, n) {
  if (n.bg) {
    const p = Cfg.resolveBg(n.bg);
    if (!exists(p)) err(where, `bg: нет файла ${p}`);
  }
  if (n.bgm && !exists(n.bgm)) err(where, `bgm: нет файла ${n.bgm}`);
  if (n.weather && !Cfg.WEATHER.includes(n.weather)) err(where, `weather «${n.weather}»`);
  if (n.camera && !Cfg.CAMERA.includes(n.camera)) err(where, `camera «${n.camera}»`);
  if (n.effect && !Cfg.EFFECTS.includes(n.effect)) err(where, `effect «${n.effect}»`);
  checkSprite(where, n.sprite);
}

function styleText(where, text, kind) {
  const t = lc(text);
  BANNED.forEach((w) => t.includes(w) && warn(where, `слово-маркер «${w}»`));
  BANNED_RE.forEach(([re, name]) => re.test(t) && warn(where, `штамп ${name}`));
  const ch = t.match(CHURCH_RE);
  if (ch) warn(where, `церковная лексика «${ch[2]}»`);
  const se = t.match(SEASON_RE);
  if (se) warn(where, `не тот сезон: «${se[1]}» (сейчас июль, цветут липы)`);
  const re = t.match(REAL_RE);
  if (re) warn(where, `реальное место/бренд: «${re[1]}»`);
  if (NOT_X_BUT_Y_RE.test(t)) warn(where, "похоже на «не X, а Y»");
  if (countRe(SIMILE_RE, t) > 1) warn(where, "больше одного «словно/будто» в реплике");
  if (kind === "narr" && text.length > MAX_NARR) warn(where, `рассказчик: ${text.length} знаков (> ${MAX_NARR})`);
  if (kind === "line" && text.length > MAX_LINE) warn(where, `реплика: ${text.length} знаков (> ${MAX_LINE})`);
  if (kind === "narr") {
    const fp = t.replace(/«[^»]*»/g, " ").replace(/(^|\n)\s*—[^\n]*/g, " ").match(FIRST_PERSON_RE);
    if (fp) warn(where, `рассказчик в первом лице? «${fp[2]}»`);
  }
}

for (const ch of chapters) {
  const file = chapterFile[ch.id] || "?";
  const W = (p) => `${file} [${ch.id}] ${p}`;
  if (ONLY.length && !ONLY.includes(ch.id)) continue;

  if (!ch.id) err(file, "у главы нет id");
  if (ids.has(ch.id)) err(W(""), "id главы повторяется");
  ids.add(ch.id);
  ["day", "title", "nodes"].forEach((k) => ch[k] === undefined && err(W(""), `у главы нет поля ${k}`));
  if (file !== "?" && path.basename(file, ".js") !== ch.id) warn(W(""), `имя файла не совпадает с id главы`);
  checkEnv(W("chapter"), ch);

  const comp = Core.compileChapter(ch);
  comp.problems.forEach((p) => err(W(p.path), p.msg));

  // Обход исходного дерева: ключи, тексты, выборы
  let words = 0;
  let nodes = 0;
  let choices = 0;
  let suddens = 0;
  let aChto = 0;
  let nicks = 0;
  let curWeather = ch.weather || "none";

  function walk(list, p) {
    (list || []).forEach((n, i) => {
      const np = `${p}[${i}]`;
      if (!n || typeof n !== "object") return;
      Object.keys(n).forEach((k) => !NODE_KEYS.has(k) && err(W(np), `неизвестное поле «${k}»`));
      checkEnv(W(np), n);
      if (n.weather) curWeather = n.weather;
      const sprites = n.sprite && typeof n.sprite === "object" ? [n.sprite, n.sprite.left, n.sprite.center, n.sprite.right] : [];
      if (curWeather !== "rain" && sprites.some((s) => s && s.char === "alexander_jacket")) {
        warn(W(np), "Саша в куртке без дождя (weather ≠ rain)");
      }
      if (n.set) Object.keys(n.set).forEach((k) => checkVarName(W(np), k, "set"));
      if (n.effects) Object.keys(n.effects).forEach((k) => checkVarName(W(np), k, "effects"));
      if (n.if !== undefined) {
        checkCondition(W(np), n.if);
        if (!Array.isArray(n.then)) err(W(np), "у if нет массива then");
        walk(n.then, np + ".then");
        if (n.else) walk(n.else, np + ".else");
      }
      if (n.ending && (!n.ending.id || !n.ending.title)) err(W(np), "у ending нужны id и title");

      if (n.text !== undefined) {
        nodes++;
        const speaker = n.speaker || "Рассказчик";
        if (!Cfg.SPEAKERS[speaker]) err(W(np), `неизвестный говорящий «${speaker}»`);
        const text = String(n.text);
        words += text.split(/\s+/).filter(Boolean).length;
        const kind = speaker === "Рассказчик" && !n.thought ? "narr" : "line";
        styleText(W(np), text, kind);
        suddens += countRe(SUDDEN_RE, lc(text));
        aChto += countRe(A_CHTO_RE, lc(text));
        if (speaker === "Лена") nicks += countRe(NICK_RE, text);
      }

      if (n.choice) {
        choices++;
        const c = n.choice;
        if (!c.id) warn(W(np), "у выбора нет id");
        else if (choiceIds.has(c.id)) err(W(np), `id выбора «${c.id}» уже есть в ${choiceIds.get(c.id)}`);
        else choiceIds.set(c.id, ch.id);
        const opts = c.options || [];
        if (opts.length < 2) err(W(np), "в выборе меньше двух вариантов");
        let plus = 0;
        opts.forEach((o, k) => {
          const op = `${np}.choice.options[${k}]`;
          Object.keys(o).forEach((key) => !OPTION_KEYS.has(key) && err(W(op), `неизвестное поле варианта «${key}»`));
          if (!o.label) err(W(op), "у варианта нет label");
          else {
            if (o.label.length > MAX_LABEL) warn(W(op), `текст кнопки ${o.label.length} знаков (> ${MAX_LABEL})`);
            styleText(W(op), o.label, "label");
          }
          if (o.effects) {
            Object.keys(o.effects).forEach((key) => checkVarName(W(op), key, "effects"));
            if ((o.effects.inner_sight || 0) > 0) plus++;
            if (Math.abs(o.effects.inner_sight || 0) > 1) warn(W(op), "inner_sight больше чем на 1");
            Object.entries(o.effects).forEach(([key, v]) => key.startsWith("aff_") && v > 2 && warn(W(op), `${key} +${v} — слишком щедро`));
          }
          if (o.set) Object.keys(o.set).forEach((key) => checkVarName(W(op), key, "set"));
          if (o.if !== undefined) checkCondition(W(op), o.if);
          const body = o.next || o.nodes;
          if (body) walk(body, op + ".next");
        });
        if (opts.length >= 2 && plus === opts.length) warn(W(np), "inner_sight +1 у всех вариантов (нарушение правила ±1)");
        else if (plus > 1) warn(W(np), `inner_sight +1 у ${plus} вариантов (по правилу — не больше одного)`);
      }
    });
  }
  walk(ch.nodes, "nodes");

  if (choices > 5) warn(W(""), `выборов: ${choices} (много; декоративные выборы режем)`);
  if (suddens > 1) warn(W(""), `«внезапно/неожиданно» ${suddens} раза`);
  if (aChto > 1) warn(W(""), `«…а что?» ${aChto} раза (приём — не шаблон)`);
  if (nicks > 2) warn(W(""), `прозвищ Лены: ${nicks} (не больше одного на сцену)`);

  // Переходы в скомпилированном коде
  comp.code.forEach((ins) => {
    if (ins.op !== "jump") return;
    const to = ins.to;
    let ok;
    if (to.includes("#")) {
      const [cid, label] = to.split("#");
      const target = cid ? chapters.find((c) => c.id === cid) : ch;
      ok = !!target && (!label || Core.compileChapter(target).labels[label] !== undefined);
    } else {
      ok = comp.labels[to] !== undefined || chapters.some((c) => c.id === to);
    }
    if (!ok) err(W(ins.path), `переход «${to}» никуда не ведёт`);
  });

  // next главы
  const nexts = typeof ch.next === "string" ? [ch.next] : Array.isArray(ch.next) ? ch.next.map((r) => r.to) : [];
  nexts.forEach((to) => !chapters.some((c) => c.id === to) && err(W("next"), `следующая глава «${to}» не найдена`));
  if (Array.isArray(ch.next)) ch.next.forEach((r) => r.if !== undefined && checkCondition(W("next"), r.if));

  stats.push({ id: ch.id, nodes, words, choices });
}

// ------------------------------------------------------------------
// 4. Отчёт
// ------------------------------------------------------------------
if (STATS) {
  console.log("\nГлава                         узлов  слов  выборов");
  stats.forEach((s) => console.log(`${s.id.padEnd(30)}${String(s.nodes).padStart(5)}${String(s.words).padStart(6)}${String(s.choices).padStart(9)}`));
  const tot = stats.reduce((a, s) => ({ nodes: a.nodes + s.nodes, words: a.words + s.words, choices: a.choices + s.choices }), { nodes: 0, words: 0, choices: 0 });
  console.log(`${"ИТОГО".padEnd(30)}${String(tot.nodes).padStart(5)}${String(tot.words).padStart(6)}${String(tot.choices).padStart(9)}\n`);
}
if (errors.length) {
  console.log(`\nОШИБКИ (${errors.length}):`);
  errors.forEach((e) => console.log("  ✖ " + e));
}
if (!QUIET && warnings.length) {
  console.log(`\nПРЕДУПРЕЖДЕНИЯ (${warnings.length}):`);
  warnings.forEach((w) => console.log("  ⚠ " + w));
}
console.log(`\nГлав: ${stats.length} · ошибок: ${errors.length} · предупреждений: ${warnings.length}`);
process.exit(errors.length || (STRICT && warnings.length) ? 1 : 0);
