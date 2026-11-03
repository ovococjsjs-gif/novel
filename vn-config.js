// Общая конфигурация движка: персонажи, спрайты, допустимые значения полей.
// Подключается и в браузере (window.VNConfig), и в Node (tools/validate.js).
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.VNConfig = api;
})(typeof self !== "undefined" ? self : this, function () {
  const C = "assets/characters/";

  function set(dirPattern, emotions) {
    const out = {};
    emotions.forEach((e) => (out[e] = dirPattern.replace("{e}", e)));
    return out;
  }

  // Каждый набор спрайтов: emotions — файл на каждую эмоцию,
  // aliases — допустимые синонимы, fallback — что показать, если эмоции нет (валидатор предупредит).
  const SPRITES = {
    alexander: {
      emotions: Object.assign(
        set(C + "alexander/transparent/alexander_{e}.webp", ["neutral", "smile", "stressed", "surprised", "thoughtful", "wounded"]),
        set(C + "alexander/transparent/alexandr_{e}.webp", ["determined_anger", "happy", "sad", "shocked", "shocked_terrified", "shy"])
      ),
      aliases: { serious: "determined_anger" },
      fallback: "neutral"
    },
    alexander_jacket: {
      emotions: Object.assign(
        set(C + "alexander/transparent/alexander_jacket_{e}.webp", ["neutral", "smile", "thoughtful", "surprised", "shy", "shocked", "wounded"]),
        { rain: C + "alexander/transparent/alexander_courier_rain.webp" }
      ),
      aliases: {
        courier_rain: "rain",
        happy: "smile",
        sad: "thoughtful",
        stressed: "thoughtful",
        determined_anger: "shocked",
        shocked_terrified: "shocked"
      },
      fallback: "neutral"
    },
    mirael_angel: {
      emotions: set(C + "mirael/transparent/mirael_angel_{e}.webp", ["neutral", "happy", "sad", "shy", "surprised", "crying", "determined_anger", "shocked_terrified"]),
      aliases: {},
      fallback: "neutral"
    },
    mirael_human: {
      emotions: set(C + "mirael/transparent/mirael_human_{e}.webp", ["neutral", "happy", "sad", "shy", "surprised", "crying", "determined_anger", "shocked_terrified"]),
      aliases: {},
      fallback: "neutral"
    },
    valeria: {
      emotions: set(C + "valeria/transparent/valeria_{e}.webp", ["neutral", "amused", "angry", "cold_serious", "contract", "playful_smile", "soft_vulnerable", "surprised", "thoughtful"]),
      aliases: {},
      fallback: "neutral"
    },
    valeria_human: {
      emotions: set(C + "valeria/transparent/valeria_human_{e}.webp", ["neutral", "amused", "angry", "cold_serious", "contract", "playful_smile", "soft_vulnerable", "surprised", "thoughtful"]),
      aliases: {},
      fallback: "neutral"
    },
    nika: {
      emotions: set(C + "nika/transparent/nika_{e}.webp", ["happy", "neutral", "sad", "shy", "teasing", "annoyed", "surprised", "bored"]),
      aliases: {},
      fallback: "neutral"
    },
    lena: {
      emotions: set(C + "lena/transparent/lena_{e}.webp", ["happy", "neutral", "sad", "snide", "tired", "angry", "surprised", "thoughtful", "coffee", "shy"]),
      aliases: {},
      fallback: "tired"
    },
    artem: {
      emotions: set(C + "artem_shank_{e}.webp", ["empty", "happy", "neutral", "sad"]),
      aliases: { smile: "happy", guilty: "sad", worried: "sad", nervous: "neutral" },
      fallback: "neutral"
    },
    dmitry: {
      emotions: set(C + "dmitry/transparent/dmitry_{e}.webp", ["neutral", "serious", "angry", "tired", "smile"]),
      aliases: {},
      fallback: "neutral"
    },
    taya: {
      emotions: set(C + "taya/transparent/taya_{e}.webp", ["neutral", "sad_compassion", "serious", "surprised", "thoughtful", "warm_smile", "laugh", "pocket_watch", "tea", "firm", "shy"]),
      aliases: {},
      fallback: "neutral"
    },
    // Второстепенные (03.11, просьба автора: у тех, кто появляется в сюжете не один раз, — по 2–3 спрайта).
    // Баба Нюра: neutral — прищур «ну-ну», smile — по-доброму, worried — рука на сердце.
    nyura: {
      emotions: set(C + "nyura/transparent/nyura_{e}.webp", ["neutral", "smile", "worried"]),
      aliases: { happy: "smile", warm: "smile", sad: "worried", surprised: "worried", suspicious: "neutral" },
      fallback: "neutral"
    },
    // Инесса: neutral — вежливая улыбка, happy — щебечет, руки у груди, confused — растерянно моргает.
    inessa: {
      emotions: set(C + "inessa/transparent/inessa_{e}.webp", ["neutral", "happy", "confused"]),
      aliases: { smile: "happy", sad: "confused", surprised: "confused", worried: "confused" },
      fallback: "neutral"
    },
    // Гарик: neutral — ухмылка до ушей, upset — досада, чешет затылок.
    garik: {
      emotions: set(C + "garik/transparent/garik_{e}.webp", ["neutral", "upset"]),
      aliases: { happy: "neutral", smile: "neutral", sad: "upset", angry: "upset", worried: "upset" },
      fallback: "neutral"
    },
    // Лев Аркадьевич: neutral — добрая полуулыбка, thoughtful — вспоминает, глаза опущены.
    lev: {
      emotions: set(C + "lev/transparent/lev_{e}.webp", ["neutral", "thoughtful"]),
      aliases: { smile: "neutral", happy: "neutral", sad: "thoughtful" },
      fallback: "neutral"
    },
    // Вторая партия (03.11). Тамара: neutral — руки в боки, «ты ел сегодня?»; smile — расплылась в улыбке.
    tamara: {
      emotions: set(C + "tamara/transparent/tamara_{e}.webp", ["neutral", "smile"]),
      aliases: { happy: "smile", warm: "smile", stern: "neutral", worried: "neutral", surprised: "neutral" },
      fallback: "neutral"
    },
    // Гоша, администратор барбершопа: neutral — болтает, телефон в руке; worried — встревожен, косится в сторону.
    gosha: {
      emotions: set(C + "gosha/transparent/gosha_{e}.webp", ["neutral", "worried"]),
      aliases: { smile: "neutral", happy: "neutral", sad: "worried", nervous: "worried", surprised: "worried" },
      fallback: "neutral"
    },
    // Консьерж в доме Артёма: neutral — вежливое внимание; smile — сладкая улыбка «мы за ним присматриваем».
    concierge: {
      emotions: set(C + "concierge/transparent/concierge_{e}.webp", ["neutral", "smile"]),
      aliases: { happy: "smile", sweet: "smile" },
      fallback: "neutral"
    },
    // Витя с барахолки: neutral — вымотан, руки в саже (День 5); smile — отпустило, руки отмыты (День 6).
    vitya: {
      emotions: set(C + "vitya/transparent/vitya_{e}.webp", ["neutral", "smile"]),
      aliases: { tired: "neutral", sad: "neutral", happy: "smile", relieved: "smile" },
      fallback: "neutral"
    },
    // Бариста из кафе на Садовой: neutral — приветливая ухмылка; concerned — встревожена.
    barista: {
      emotions: set(C + "barista/transparent/barista_{e}.webp", ["neutral", "concerned"]),
      aliases: { smile: "neutral", happy: "neutral", worried: "concerned", sad: "concerned", surprised: "concerned" },
      fallback: "neutral"
    },
    // Зоя Павловна, хозяйка квартиры (День 7, «в парадной блузке, с папкой»): neutral — держится официально; sad — виновато смотрит в пол.
    zoya: {
      emotions: set(C + "zoya/transparent/zoya_{e}.webp", ["neutral", "sad"]),
      aliases: { worried: "sad", guilty: "sad", smile: "neutral", happy: "neutral" },
      fallback: "neutral"
    }
  };

  // Имя в окне реплики → css-класс цвета и группа спрайтов (для затемнения неговорящих).
  const SPEAKERS = {
    "Рассказчик": { cls: "narrator", char: null },
    "Александр": { cls: "alexander", char: "alexander" },
    "Мираэль": { cls: "mirael", char: "mirael" },
    "Мира": { cls: "mirael", char: "mirael" }, // с Дня 2, после того как Саша дал ей имя (00_decisions п. 108)
    "Незнакомка": { cls: "mirael", char: "mirael" },
    "Валерия": { cls: "valeria", char: "valeria" },
    "Ника": { cls: "nika", char: "nika" },
    "Лена": { cls: "lena", char: "lena" },
    "Артём": { cls: "artem", char: "artem" },
    "Дмитрий": { cls: "dmitry", char: "dmitry" },
    "Тая": { cls: "taya", char: "taya" },
    // Второстепенные. char: null — спрайта нет
    "Баба Нюра": { cls: "minor", char: "nyura" },
    "Даша": { cls: "minor", char: null },
    "Зоя Павловна": { cls: "minor", char: "zoya" },
    "Лев Аркадьевич": { cls: "minor", char: "lev" },
    "Инесса": { cls: "minor", char: "inessa" },
    "Администратор": { cls: "minor", char: "gosha" },
    "Консьерж": { cls: "minor", char: "concierge" },
    "Бариста": { cls: "minor", char: "barista" },
    "Клиент": { cls: "minor", char: null },
    "Клиентка": { cls: "minor", char: null },
    "Голос": { cls: "minor", char: null },
    "Мама": { cls: "minor", char: null },
    "Тамара": { cls: "minor", char: "tamara" },
    "Ковалёвский": { cls: "minor", char: null },
    "Гарик": { cls: "minor", char: "garik" },
    "Букинист": { cls: "minor", char: null },
    "Парнишка": { cls: "minor", char: null },
    "Рыбак": { cls: "minor", char: null },
    "Режиссёр": { cls: "minor", char: null },
    "Петя": { cls: "minor", char: null },
    "Нина Петровна": { cls: "minor", char: null },
    "Мальчик": { cls: "minor", char: null },
    "Продавец": { cls: "minor", char: "vitya" },
    "Витя": { cls: "minor", char: "vitya" },
    "Соседка": { cls: "minor", char: null },
    "Мужчина в сером": { cls: "minor", char: null },
    "Приёмщица": { cls: "minor", char: null },
    "Клавдия Ивановна": { cls: "minor", char: null },
    "Преподаватель": { cls: "minor", char: null }
  };

  const WEATHER = ["none", "rain"];
  const CAMERA = ["none", "normal", "ride", "shake"];
  const EFFECTS = ["flash"];

  const BG_DIR = "assets/backgrounds/";

  // Разрешение эмоции: точное имя → синоним → fallback. Возвращает {path, exact}.
  function resolveSprite(char, emotion) {
    const def = SPRITES[char];
    if (!def) return { path: "", exact: false };
    const emo = emotion || "neutral";
    if (def.emotions[emo]) return { path: def.emotions[emo], exact: true };
    const alias = def.aliases[emo];
    if (alias && def.emotions[alias]) return { path: def.emotions[alias], exact: true };
    return { path: def.emotions[def.fallback], exact: false };
  }

  // Короткая запись фона: "bg_taya_workshop" → полный путь.
  // Фоны, у которых появились дневной и ночной варианты (02.11). Старое имя
  // остаётся рабочим (на случай старых сохранений) и ведёт на дневной.
  const BG_ALIASES = {
    bg_taya_workshop: "bg_taya_workshop_day",
    bg_valeria_office: "bg_valeria_office_day",
    bg_valeria_reception: "bg_valeria_reception_day",
    bg_valeria_salon: "bg_valeria_salon_day",
  };
  function resolveBg(bg) {
    if (!bg) return "";
    if (BG_ALIASES[bg]) bg = BG_ALIASES[bg];
    if (bg.includes("/")) return bg;
    return BG_DIR + (bg.endsWith(".png") || bg.endsWith(".webp") || bg.endsWith(".jpg") ? bg : bg + ".webp");
  }

  // Фоны в помещении: дождь там не идёт. Погода главы при этом сохраняется,
  // и на улице дождь снова виден. Новые фоны и CG в помещении дописывать сюда.
  const INDOOR_BGS = new Set([
    "bg_apartment_hallway", "bg_artyom_apartment", "bg_artyom_landing", "bg_barbershop_interior",
    "bg_buffer_corridor", "bg_buffer_crash_imprint", "bg_city_cafe", "bg_depot_office", "bg_elevator_glitch",
    "bg_open_office", "bg_pastry_shop",
    "bg_sasha_kitchen_day", "bg_sasha_kitchen_night", "bg_sasha_room_day", "bg_sasha_room_day_rain", "bg_sasha_room_night",
    "bg_stairwell_day", "bg_stairwell_door_night", "bg_taya_workshop_day", "bg_taya_workshop_night",
    "bg_valeria_office_day", "bg_valeria_office_night", "bg_valeria_reception_day", "bg_valeria_reception_night",
    "bg_valeria_salon_day", "bg_valeria_salon_night",
    "cg_d3_latin_page", "cg_d4_lemon", "cg_d5_mirror_lift", "cg_dress_fitting", "cg_feather_watch",
    "cg_first_coffee", "cg_sasha_mirror", "cg_valeria_nika_door",
  ]);
  function bgId(bg) {
    const p = resolveBg(bg);
    return p ? p.split("/").pop().replace(/\.(webp|png|jpg)$/, "") : "";
  }
  function isIndoorBg(bg) {
    return INDOOR_BGS.has(bgId(bg));
  }

  // Фоны и CG, на которых дождь нарисован: мокрый асфальт, лужи, капли на свету.
  // Слой дождя движок кладёт только на них (03.11, просьба автора). На сухой улице
  // дождя нет, даже если у главы weather: "rain", а валидатор про такое место
  // предупредит. Буфер сюда не входит: там капли застыли, им падать нельзя.
  // Новые дождливые фоны и CG дописывать сюда.
  const RAIN_BGS = new Set([
    "bg_courier_spot", "bg_mostovoy_avenue_storm", "bg_rainy_crossroad",
    "cg_arch_carry", "cg_awning_thermos", "cg_crash_headlights", "cg_mirael_zebra",
  ]);
  function isRainBg(bg) {
    return RAIN_BGS.has(bgId(bg));
  }

  return { SPRITES, SPEAKERS, WEATHER, CAMERA, EFFECTS, BG_DIR, INDOOR_BGS, RAIN_BGS, resolveSprite, resolveBg, isIndoorBg, isRainBg };
});
