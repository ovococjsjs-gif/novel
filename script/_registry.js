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
  haircut_d0: { type: "flag", default: false, desc: "Пролог: Артём сам подстриг Сашу (День 4 — «подровнять виски»)" },
  called_artem_back: { type: "flag", default: false, desc: "Пролог: перезвонил Артёму на голосовое, тот не взял трубку (п. 115)" },
  mirael_phone: { type: "flag", default: false, desc: "День 2: оставил Мираэль старый кнопочный телефон" },
  crossed_zarechny: { type: "flag", default: false, desc: "День 2: довёз инсулин через перекрёсток на Заречном" },
  lena_told_truth: { type: "flag", default: false, desc: "День 2: сказал Лене про «чуть не сбили»" },
  watch_left_taya: { type: "flag", default: false, desc: "День 1: оставил часы деда у Таи (в Неделе 1 ставится всегда; маркер состояния для маршрутов)" },
  asked_mama: { type: "flag", default: false, desc: "День 6: попросил денег у мамы (придут в понедельник, День 8)" },
  nyura_tap: { type: "flag", default: false, desc: "День 2: починил кран бабе Нюре (отзывается в Дне 3)" },
  called_deanery: { type: "flag", default: false, desc: "День 4: позвонил в деканат (узнал условия восстановления)" },
  asked_valeria_page: { type: "flag", default: false, desc: "День 3: дочитал страницу про стирание памяти" },
  nika_bubble_tea: { type: "flag", default: false, desc: "День 3: купил Нике бабл-ти" },
  promised_mirael: { type: "flag", default: false, desc: "День 3: пообещал Мире ничего не подписывать, не сказав ей (отзывается в мольбе Дня 7)" },
  took_valeria_money: { type: "flag", default: false, desc: "День 3: взял 3 000 ₽ «оплаты курьеру» у Инессы" },
  artem_told_crash: { type: "flag", default: false, desc: "День 4: рассказал Артёму, что его чуть не сбили на Заречном" },
  took_artem_money: { type: "flag", default: false, desc: "День 5: взял у Артёма 20 000 ₽ «по-братски»" },
  saw_artem_mark: { type: "flag", default: false, desc: "День 5: разглядел метку под ремешком (дал Артёму выговориться)" },
  taya_promise: { type: "flag", default: false, desc: "День 6: пообещал Тае приходить учиться «держать паузу»" },

  // --- Маршрут (День 7) ---
  earth_passive: { type: "flag", default: false, desc: "День 7: связь слабая со всеми, Саша остался сидеть на лестнице (День 8: Лена перехватывает у подъезда)" },
  route: { type: "number", default: 0, desc: "0 — общий, 1 Мираэль, 2 Валерия, 3 Лена/Земной, 4 Тая, 5 Буфер (Секретная), 6 Истинная" },

  // --- Общие для маршрутов (Дни 8–21) ---
  nika_trust: { type: "number", default: 0, desc: "Доверие Ники (Валерия, Земной)" },
  mirael_trust: { type: "number", default: 0, desc: "Валерия: Мира в курсе торгов, не держал её в неведении (свидетельское место, День 15)" },

  // --- Маршрут Мираэль (routes/mirael.md) ---
  m_form_kept: { type: "flag", default: false, desc: "Мираэль: убрал анкету Верха в ящик" },
  m_hide: { type: "number", default: 0, desc: "Мираэль: прятал её / молчал, чтобы не пугать (≥ 2 → «Две чашки»)" },
  m_jar: { type: "flag", default: false, desc: "Мираэль: собирал выпавшие перья в банку (лихорадка, День 12)" },
  m_faculty: { type: "flag", default: false, desc: "Мираэль: подал заявление о восстановлении на физфак (День 16)" },
  m_valeria_no: { type: "flag", default: false, desc: "Мираэль: сам пошёл к Валерии и отказал" },
  m_offer: { type: "flag", default: false, desc: "Мираэль: решил отдать себя сам, без контракта" },

  // --- Маршрут Валерии (routes/valeria.md) ---
  v_mirael_clause: { type: "flag", default: false, desc: "Валерия: выторговал в союзе пункт для Мираэль" },
  v_borisov_secret: { type: "flag", default: false, desc: "Валерия: выслушал Борисова и промолчал" },
  v_first: { type: "number", default: 0, desc: "Валерия, День 14: кого спасают первым — 0 не решено, 1 Артём, 2 Мираэль" },

  // --- Земной маршрут (routes/earth.md) ---
  e_promise: { type: "flag", default: false, desc: "Земной: пообещал Лене, что найдут отца" },
  e_artem_let: { type: "flag", default: false, desc: "Земной: отпустил Артёма, не стал давить (важно для Дня 18)" },
  e_path: { type: "number", default: 0, desc: "Земной, развилка: 1 вместе с Леной (e_together), 2 один (e_alone), 3 спасовал (e_pass)" },
  lena_truth: { type: "flag", default: false, desc: "Земной: правда и примирение с Леной в День 20" },

  // --- Маршрут Таи (routes/taya.md) ---
  t_blanket: { type: "number", default: 0, desc: "Тая: прятался в мастерской / брал время (≥ 2 → «Тихий омут»)" },
  t_signed: { type: "flag", default: false, desc: "Тая: подписал тишину (прямой путь к плохому финалу)" },

  // --- Секретная ветка (routes/secret.md) ---
  b_resist: { type: "number", default: 0, desc: "Буфер: сопротивление (+) или сдача (−)" },
  b_signs: { type: "number", default: 0, desc: "Буфер: замеченные знаки настоящей Таи" }
};

// Пороги концовок (калибруются после написания Недели 1). См. engine.md §7.
window.VN_THRESHOLDS = {
  route_margin: 1, // лидер должен опережать второго хотя бы на столько, иначе выбор из двух
  route_min: 3, // ниже — связь слабая со всеми, Земной маршрут через «пассивный вход»
  // Предварительно (02.11), сверяются в конце маршрута, т. е. за все 21 день. Бюджет маршрута — engine.md §7.
  good_aff: 14,
  good_sight: 20,
  bad_sight: 0
};

// Названия маршрутов (экран «Продолжение следует», dev-панель).
window.VN_ROUTE_NAMES = {
  1: "Мираэль — «Свет за горизонтом»",
  2: "Валерия — «Дело №0»",
  3: "Земной — «Положение о Распределении»",
  4: "Тая — «Пауза между ударами»",
  5: "Секретная ветка — «Буфер обмена мира»",
  6: "Истинная — «Автор черновика»"
};

// Главы, которые уже стоят в маршрутизации, но ещё не написаны.
// Валидатор на них только предупреждает; игра показывает «Продолжение следует».
// Когда глава написана и подключена в index.html — убрать её отсюда.
window.VN_PLANNED = ["mirael_d8_1", "valeria_d8_1", "earth_d8_1", "taya_d8_1", "secret_c1", "true_d8_1"];
