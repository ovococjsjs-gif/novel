// Ядро сценария: условия и компиляция глав в плоский список инструкций.
// Подключается и в браузере (window.VNCore), и в Node (tools/validate.js).
//
// Почему компиляция: старый движок вклеивал ветки выбора в массив узлов (splice),
// из-за чего «Назад», сохранения и переходы между ветками ломались. Теперь каждая
// глава превращается в неизменяемый список инструкций, а позиция игрока — это просто
// (id главы, номер инструкции). Ветки, условия и метки — это переходы по номерам.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.VNCore = api;
})(typeof self !== "undefined" ? self : this, function () {
  // ---------------------------------------------------------------
  // УСЛОВИЯ
  // Строка: "glitch_count >= 3 && !saw_taya_d0", "aff_mirael >= 6 and inner_sight >= 5",
  //         "meta.cleared_mirael_good". Поддерживаются: числа, true/false, имена,
  //         == != >= <= > <, && || !, and or not, скобки.
  // Объект: { all: [...] } | { any: [...] } | { not: cond }.
  // Булево значение: true / false.
  // ---------------------------------------------------------------
  const TOKEN_RE = /\s*(>=|<=|==|!=|&&|\|\||[()!<>]|-?\d+(?:\.\d+)?|[A-Za-z_][\w.]*)/y;

  function tokenize(src) {
    const out = [];
    TOKEN_RE.lastIndex = 0;
    let pos = 0;
    while (pos < src.length) {
      if (/^\s*$/.test(src.slice(pos))) break;
      TOKEN_RE.lastIndex = pos;
      const m = TOKEN_RE.exec(src);
      if (!m) throw new Error(`Не разобрать условие «${src}» около «${src.slice(pos, pos + 12)}»`);
      let t = m[1];
      if (t === "and") t = "&&";
      else if (t === "or") t = "||";
      else if (t === "not") t = "!";
      out.push(t);
      pos = TOKEN_RE.lastIndex;
    }
    return out;
  }

  // Рекурсивный спуск → AST: {t:'or'|'and', a, b} | {t:'not', a} | {t:'cmp', op, a, b} | {t:'num', v} | {t:'var', name}
  function parseCond(src) {
    const toks = tokenize(String(src));
    let i = 0;
    const peek = () => toks[i];
    const next = () => toks[i++];
    function expect(t) {
      if (toks[i] !== t) throw new Error(`Ожидалось «${t}» в условии «${src}»`);
      i++;
    }
    function primary() {
      const t = next();
      if (t === undefined) throw new Error(`Условие «${src}» оборвано`);
      if (t === "(") {
        const e = orExpr();
        expect(")");
        return e;
      }
      if (t === "!") return { t: "not", a: primary() };
      if (/^-?\d/.test(t)) return { t: "num", v: parseFloat(t) };
      if (t === "true") return { t: "num", v: 1 };
      if (t === "false") return { t: "num", v: 0 };
      if (/^[A-Za-z_]/.test(t)) return { t: "var", name: t };
      throw new Error(`Неожиданное «${t}» в условии «${src}»`);
    }
    function cmp() {
      const a = primary();
      const op = peek();
      if ([">=", "<=", "==", "!=", ">", "<"].includes(op)) {
        next();
        return { t: "cmp", op, a, b: primary() };
      }
      return a;
    }
    function andExpr() {
      let a = cmp();
      while (peek() === "&&") {
        next();
        a = { t: "and", a, b: cmp() };
      }
      return a;
    }
    function orExpr() {
      let a = andExpr();
      while (peek() === "||") {
        next();
        a = { t: "or", a, b: andExpr() };
      }
      return a;
    }
    const ast = orExpr();
    if (i < toks.length) throw new Error(`Лишнее «${toks[i]}» в условии «${src}»`);
    return ast;
  }

  const astCache = new Map();
  function getAst(src) {
    if (!astCache.has(src)) astCache.set(src, parseCond(src));
    return astCache.get(src);
  }

  function num(v) {
    if (v === true) return 1;
    if (v === false || v === undefined || v === null) return 0;
    return Number(v) || 0;
  }

  function evalAst(ast, get) {
    switch (ast.t) {
      case "num":
        return ast.v;
      case "var":
        return num(get(ast.name));
      case "not":
        return evalAst(ast.a, get) ? 0 : 1;
      case "and":
        return evalAst(ast.a, get) && evalAst(ast.b, get) ? 1 : 0;
      case "or":
        return evalAst(ast.a, get) || evalAst(ast.b, get) ? 1 : 0;
      case "cmp": {
        const a = evalAst(ast.a, get);
        const b = evalAst(ast.b, get);
        switch (ast.op) {
          case ">=": return a >= b ? 1 : 0;
          case "<=": return a <= b ? 1 : 0;
          case ">": return a > b ? 1 : 0;
          case "<": return a < b ? 1 : 0;
          case "==": return a === b ? 1 : 0;
          case "!=": return a !== b ? 1 : 0;
        }
      }
    }
    return 0;
  }

  // get(name) → значение переменной (имена вида meta.xxx читают мета-прогресс).
  function evalCond(cond, get) {
    if (cond === undefined || cond === null) return true;
    if (typeof cond === "boolean") return cond;
    if (typeof cond === "string") return !!evalAst(getAst(cond), get);
    if (typeof cond === "object") {
      if (Array.isArray(cond.all)) return cond.all.every((c) => evalCond(c, get));
      if (Array.isArray(cond.any)) return cond.any.some((c) => evalCond(c, get));
      if (cond.not !== undefined) return !evalCond(cond.not, get);
    }
    throw new Error("Неизвестный формат условия: " + JSON.stringify(cond));
  }

  // Все имена переменных из условия (для валидатора).
  function condVars(cond, out = new Set()) {
    if (cond === undefined || cond === null || typeof cond === "boolean") return out;
    if (typeof cond === "string") {
      (function walk(a) {
        if (!a) return;
        if (a.t === "var") out.add(a.name);
        walk(a.a);
        walk(a.b);
      })(getAst(cond));
      return out;
    }
    if (Array.isArray(cond.all)) cond.all.forEach((c) => condVars(c, out));
    if (Array.isArray(cond.any)) cond.any.forEach((c) => condVars(c, out));
    if (cond.not !== undefined) condVars(cond.not, out);
    return out;
  }

  // ---------------------------------------------------------------
  // КОМПИЛЯЦИЯ ГЛАВЫ
  // Инструкции:
  //   {op:'say',    node}                      — показать реплику (node — исходный узел без управляющих полей)
  //   {op:'env',    node}                      — сменить фон/музыку/погоду/спрайт без текста
  //   {op:'set',    set, effects}              — присвоить / прибавить переменные
  //   {op:'branch', cond, target}              — если условие ЛОЖНО, перейти на target
  //   {op:'goto',   target}                    — безусловный переход внутри главы
  //   {op:'jump',   to}                        — переход по метке или в другую главу (разрешается в рантайме)
  //   {op:'choice', choice, options:[{label, effects, set, if, target}]}
  //   {op:'ending', ending}
  // У каждой инструкции есть path — «адрес» в исходнике для сообщений об ошибках.
  // ---------------------------------------------------------------
  const ENV_KEYS = ["bg", "bgm", "weather", "camera", "effect", "sprite"];
  const CONTROL_KEYS = ["label", "jump", "if", "then", "else", "set", "effects", "choice", "ending"];

  function stripControl(n) {
    const o = {};
    Object.keys(n).forEach((k) => {
      if (!CONTROL_KEYS.includes(k)) o[k] = n[k];
    });
    return o;
  }

  function hasEnv(n) {
    return ENV_KEYS.some((k) => n[k] !== undefined);
  }

  function compileChapter(ch) {
    const code = [];
    const labels = {};
    const problems = [];
    const emit = (ins) => {
      code.push(ins);
      return code.length - 1;
    };

    function list(nodes, path) {
      if (!Array.isArray(nodes)) {
        problems.push({ path, msg: "ожидался массив узлов" });
        return;
      }
      nodes.forEach((n, i) => node(n, `${path}[${i}]`));
    }

    function node(n, path) {
      if (!n || typeof n !== "object") {
        problems.push({ path, msg: "узел не объект" });
        return;
      }
      if (n.label) {
        if (labels[n.label] !== undefined) problems.push({ path, msg: `метка «${n.label}» повторяется` });
        labels[n.label] = code.length;
      }
      if (n.set || n.effects) emit({ op: "set", set: n.set || null, effects: n.effects || null, path });

      if (n.if !== undefined) {
        const br = emit({ op: "branch", cond: n.if, target: -1, path });
        list(n.then || [], path + ".then");
        if (n.else) {
          const g = emit({ op: "goto", target: -1, path });
          code[br].target = code.length;
          list(n.else, path + ".else");
          code[g].target = code.length;
        } else {
          code[br].target = code.length;
        }
        return;
      }

      if (n.choice) {
        const c = n.choice;
        const ins = {
          op: "choice",
          choice: { id: c.id, prompt: c.prompt },
          options: [],
          env: hasEnv(n) ? stripControl(n) : null,
          path
        };
        const at = emit(ins);
        const tails = [];
        (c.options || []).forEach((o, k) => {
          const opt = { label: o.label, effects: o.effects || null, set: o.set || null, if: o.if, target: -1 };
          ins.options.push(opt);
          const body = Array.isArray(o.next) ? o.next : Array.isArray(o.nodes) ? o.nodes : null;
          const opath = `${path}.choice.options[${k}]`;
          if (body && body.length) {
            opt.target = code.length;
            list(body, opath + ".next");
            if (o.jump) emit({ op: "jump", to: o.jump, path: opath });
            else tails.push(emit({ op: "goto", target: -1, path: opath }));
          } else if (o.jump) {
            opt.target = emit({ op: "jump", to: o.jump, path: opath });
          } else {
            opt.target = null; // продолжить сразу после выбора
          }
        });
        const after = code.length;
        tails.forEach((t) => (code[t].target = after));
        ins.options.forEach((o) => {
          if (o.target === null) o.target = after;
        });
        if (!ins.options.length) problems.push({ path, msg: "выбор без вариантов" });
        void at;
        return;
      }

      if (n.text !== undefined || n.speaker !== undefined) emit({ op: "say", node: stripControl(n), path });
      else if (hasEnv(n)) emit({ op: "env", node: stripControl(n), path });

      if (n.ending) emit({ op: "ending", ending: n.ending, path });
      if (n.jump) emit({ op: "jump", to: n.jump, path });
    }

    list(ch.nodes || [], "nodes");
    return { id: ch.id, code, labels, problems };
  }

  // Следующая глава по полю next: строка | [{if, to}, ..., {to}] | undefined (следующая по порядку).
  function resolveChapterNext(ch, chapters, get) {
    const n = ch.next;
    if (typeof n === "string") return n;
    if (Array.isArray(n)) {
      for (const r of n) {
        if (evalCond(r.if, get)) return r.to;
      }
      return null;
    }
    const idx = chapters.findIndex((c) => c.id === ch.id);
    return idx >= 0 && idx + 1 < chapters.length ? chapters[idx + 1].id : null;
  }

  // ---------------------------------------------------------------
  // ВЫБОР МАРШРУТА (00_decisions.md п. 31, engine.md §7)
  // Скрытый подсчёт симпатий Дней 0–7. Номера маршрутов как у переменной route:
  // 1 Мираэль, 2 Валерия, 3 Лена (Земной), 4 Тая. В условиях доступно как calc.<ключ>:
  //   calc.leader     — номер лидера; 0, если лидер ниже thr.route_min (слабая связь со всеми)
  //   calc.second     — номер второго
  //   calc.tie        — 1, если лидер опережает второго меньше чем на thr.route_margin
  //   calc.top        — симпатия лидера
  //   calc.true_ready — 1, если открыта Истинная (хорошие финалы всех четырёх и Секретной)
  //   calc.tied_1..4  — 1, если маршрут входит в группу лидеров при ничьей (для меню на лестнице:
  //                     показываются все, кто отстаёт от лидера меньше чем на thr.route_margin)
  //   calc.tie_count  — сколько маршрутов в этой группе (0 без ничьей)
  // При равенстве порядок старшинства — по номеру маршрута.
  // ---------------------------------------------------------------
  const ROUTE_AFF = [
    [1, "aff_mirael"],
    [2, "aff_valeria"],
    [3, "aff_lena"],
    [4, "aff_taya"]
  ];
  const TRUE_FLAGS = ["mirael_good", "valeria_good", "earth_good", "taya_good", "secret_good"];

  function routeCalc(get, thr) {
    thr = thr || {};
    const margin = thr.route_margin !== undefined ? thr.route_margin : 1;
    const min = thr.route_min !== undefined ? thr.route_min : 3;
    const list = ROUTE_AFF.map(([id, v]) => ({ id, v: Number(get(v)) || 0 })).sort((a, b) => b.v - a.v || a.id - b.id);
    const [first, second] = list;
    const weak = first.v < min;
    const tie = !weak && first.v - second.v < margin ? 1 : 0;
    const group = tie ? list.filter((r) => first.v - r.v < margin) : [];
    const out = {
      leader: weak ? 0 : first.id,
      second: second.id,
      tie,
      tie_count: group.length,
      top: first.v,
      true_ready: TRUE_FLAGS.every((f) => Number(get("meta.cleared_" + f)) > 0) ? 1 : 0
    };
    ROUTE_AFF.forEach(([id]) => {
      out["tied_" + id] = group.some((r) => r.id === id) ? 1 : 0;
    });
    return out;
  }

  return { parseCond, evalCond, condVars, compileChapter, resolveChapterNext, routeCalc, ENV_KEYS, CONTROL_KEYS };
});
