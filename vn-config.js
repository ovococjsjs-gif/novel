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
    // Второстепенные (без спрайтов)
    "Баба Нюра": { cls: "minor", char: null },
    "Даша": { cls: "minor", char: null },
    "Зоя Павловна": { cls: "minor", char: null },
    "Лев Аркадьевич": { cls: "minor", char: null },
    "Инесса": { cls: "minor", char: null },
    "Администратор": { cls: "minor", char: null },
    "Консьерж": { cls: "minor", char: null },
    "Бариста": { cls: "minor", char: null },
    "Клиент": { cls: "minor", char: null },
    "Клиентка": { cls: "minor", char: null },
    "Голос": { cls: "minor", char: null },
    "Мама": { cls: "minor", char: null },
    "Тамара": { cls: "minor", char: null },
    "Ковалёвский": { cls: "minor", char: null },
    "Гарик": { cls: "minor", char: null },
    "Букинист": { cls: "minor", char: null },
    "Парнишка": { cls: "minor", char: null },
    "Рыбак": { cls: "minor", char: null },
    "Режиссёр": { cls: "minor", char: null },
    "Петя": { cls: "minor", char: null },
    "Нина Петровна": { cls: "minor", char: null },
    "Мальчик": { cls: "minor", char: null },
    "Продавец": { cls: "minor", char: null },
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

  return { SPRITES, SPEAKERS, WEATHER, CAMERA, EFFECTS, BG_DIR, resolveSprite, resolveBg };
});
