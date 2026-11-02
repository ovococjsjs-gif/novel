// E2E-проверка развилки Дня 7 в браузере (6 сценариев). Нужен запущенный server.py на :8080.
// Установка: mkdir -p /tmp/pp && cd /tmp/pp && npm i puppeteer-core@23 @sparticuz/chromium@131 && cp <repo>/tools/e2e_day7.js .
// Запуск:    cd /tmp/pp && AWS_EXECUTION_ENV=AWS_Lambda_nodejs22.x LD_LIBRARY_PATH=/tmp/al2023/lib node e2e_day7.js
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
const base = { aff_mirael: 0, aff_valeria: 0, aff_lena: 0, aff_taya: 0, inner_sight: 0, glitch_count: 0, route: 0 };
const S = [
  { name: "лидер Мираэль", vars: { aff_mirael: 6, aff_lena: 3 }, pick: /Пройти мимо/ },
  { name: "лидер Тая", vars: { aff_taya: 7, aff_mirael: 4 }, pick: /Пройти мимо/ },
  { name: "ничья Валерия/Лена", vars: { aff_valeria: 5, aff_lena: 5, aff_mirael: 2 }, pick: /Пройти мимо|салон/ },
  { name: "пассивный", vars: { aff_mirael: 1 }, pick: /Пройти мимо/ },
  { name: "дверь+сбои", vars: { aff_mirael: 6, glitch_1: true, glitch_2: true, glitch_count: 2 }, pick: /Открыть дверь/ },
  { name: "Истинная", vars: { aff_mirael: 6 }, meta: { cleared_mirael_good: 1, cleared_valeria_good: 1, cleared_earth_good: 1, cleared_taya_good: 1, cleared_secret_good: 1 }, pick: /Пройти мимо/ },
];
(async () => {
  const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
  for (const sc of S) {
    const page = await browser.newPage();
    page.on("dialog", (d) => d.accept());
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    await page.goto("http://localhost:8080/index.html?dev=1", { waitUntil: "domcontentloaded" });
    await page.evaluate((sc, base) => {
      localStorage.clear();
      localStorage.setItem("nsnn_meta_v1", JSON.stringify({ endings: {}, flags: sc.meta || {}, seen: { day7_2_stairs: { vars: Object.assign({}, base, sc.vars) } } }));
    }, sc, base);
    await page.reload({ waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 2500));
    await page.mouse.click(10, 10);
    await new Promise((r) => setTimeout(r, 800));
    await page.evaluate(() => document.getElementById("title-chapters-btn").click());
    await new Promise((r) => setTimeout(r, 400));
    const ok = await page.evaluate(() => {
      const c = [...document.querySelectorAll(".chapter-card")].find((x) => x.textContent.includes("day7_2_stairs"));
      if (!c) return false; c.click(); return true;
    });
    if (!ok) { console.log(sc.name, "нет карточки"); continue; }
    const seen = [];
    let result = null;
    for (let i = 0; i < 300 && !result; i++) {
      await new Promise((r) => setTimeout(r, 120));
      const st = await page.evaluate(() => {
        const ov = document.getElementById("choice-overlay");
        if (ov.classList.contains("visible")) {
          return { choice: document.getElementById("choice-prompt").textContent, opts: [...document.getElementById("choice-list").querySelectorAll("button")].map((b) => b.textContent.trim()), body: document.getElementById("choice-list").innerText };
        }
        return { text: document.getElementById("dialogue-text").textContent };
      });
      if (st.choice !== undefined) {
        if (/Продолжение следует/.test(st.choice)) { result = st.body.split("\n").find((l) => /маршрут/.test(l)) || st.body.slice(0, 200); break; }
        seen.push(`[${st.choice}] ${st.opts.join(" | ")}`);
        const idx = Math.max(0, st.opts.findIndex((o) => sc.pick.test(o)));
        await page.evaluate((idx) => document.getElementById("choice-list").querySelectorAll("button")[idx].click(), idx);
        await new Promise((r) => setTimeout(r, 400));
      } else {
        if (st.text && (seen.length === 0 || seen[seen.length - 1] !== st.text.slice(0, 60))) seen.push(st.text.slice(0, 60));
        await page.evaluate(() => document.getElementById("btn-next").click());
      }
    }
    console.log(`\n=== ${sc.name}: ${result || "НЕ ДОШЛИ"}${errs.length ? "  ОШИБКИ: " + errs.join("; ") : ""}`);
    console.log("   " + seen.filter((x, k, a) => a.indexOf(x) === k).slice(-9).join("\n   "));
    await page.close();
  }
  await browser.close();
})();
