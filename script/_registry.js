// РЕЕСТР ПЕРЕМЕННЫХ СЦЕНАРИЯ
// Любая переменная, которую глава читает (if) или пишет (effects / set), должна быть здесь.
// Валидатор (node tools/validate.js) ругается на неизвестные имена.
// Описание и правила — docs/production/engine.md §6.
window.VN_VARS = {
  // --- Симпатии (только прибавляются через effects) ---
  aff_mirael: { type: "number", default: 0, desc: "Мираэль" },
  aff_valeria: { type: "number", default: 0, desc: "Валерия" },
  aff_lena: { type: "number", default: 0, desc: "Лена (Земной маршрут)" },
  aff_taya: { type: "number", default: 0, desc: "Тая" },
  aff_nika: { type: "number", default: 0, desc: "Ника (не маршрут; влияет на то, что она выболтает, и на Секретную ветку)" },

  // --- Внутренний вектор: +1 честность и ответственность, −1 бегство и самообман ---
  inner_sight: { type: "number", default: 0, desc: "Взгляд внутрь" },

  // --- Сбои реальности (Секретная ветка) ---
  glitch_1: { type: "flag", default: false, desc: "День 2: шагнул в кв. 0" },
  glitch_2: { type: "flag", default: false, desc: "День 5: нажал «—» в лифте" },
  glitch_3: { type: "flag", default: false, desc: "День 7: открыл дверь под лестницей" },
  glitch_count: { type: "number", default: 0, desc: "Сколько сбоев собрано (0..3)" },

  // --- Факты Недели 1, на которые ссылается текст ---
  raincoat_packed: { type: "flag", default: false, desc: "Пролог: взял жёлтый дождевик (иначе Лена выдаст запасной из депо)" },
  dasha_honest: { type: "flag", default: false, desc: "Пролог: честно признался Даше, что забыл про платье" },
  rude_complaint: { type: "flag", default: false, desc: "Пролог: отшутился с хамом-клиентом (жалоба доходит до Дмитрия)" },
  saw_taya_d0: { type: "flag", default: false, desc: "Пролог: заметил янтарный свет мастерской" },
  mirael_phone: { type: "flag", default: false, desc: "День 2: оставил Мираэль старый кнопочный телефон" },
  crossed_zarechny: { type: "flag", default: false, desc: "День 2: довёз инсулин через перекрёсток на Заречном" },
  lena_told_truth: { type: "flag", default: false, desc: "День 2: сказал Лене про «чуть не сбили»" },
  watch_left_taya: { type: "flag", default: false, desc: "День 1: оставил часы деда у Таи" },
  asked_valeria_page: { type: "flag", default: false, desc: "День 3: дочитал страницу про стирание памяти" },
  nika_bubble_tea: { type: "flag", default: false, desc: "День 3: купил Нике бабл-ти" },
  took_valeria_money: { type: "flag", default: false, desc: "День 3: взял 3 000 ₽ «оплаты курьеру» у Инессы" },
  artem_told_crash: { type: "flag", default: false, desc: "День 4: рассказал Артёму, что его чуть не сбили на Заречном" },
  took_artem_money: { type: "flag", default: false, desc: "День 5: взял у Артёма 20 000 ₽ «по-братски»" },
  saw_artem_mark: { type: "flag", default: false, desc: "День 5: разглядел метку под ремешком (дал Артёму выговориться)" },
  taya_promise: { type: "flag", default: false, desc: "День 6: пообещал Тае приходить учиться «держать паузу»" },

  // --- Маршрут (День 7) ---
  route: { type: "number", default: 0, desc: "0 — общий, 1 Мираэль, 2 Валерия, 3 Лена/Земной, 4 Тая, 5 Буфер" }
};

// Пороги концовок (калибруются после написания Недели 1). См. engine.md §7.
window.VN_THRESHOLDS = {
  good_aff: 6,
  good_sight: 5,
  bad_sight: -2
};
