window.VN_CHAPTERS = window.VN_CHAPTERS || [];
window.VN_CHAPTERS.push({
  id: "day7_2_stairs",
  day: "ДЕНЬ 7 · ОСТАЛОСЬ 15 ДНЕЙ",
  title: "Глава II. Лестничная клетка",
  subtitle: "Тихая улица · подъезд · ночь, гроза",
  bg: "bg_stairwell_door_night",
  bgm: "The Hollow Stare.mp3",
  weather: "none",
  next: [
    { if: "route == 1", to: "mirael_d8_1" },
    { if: "route == 2", to: "valeria_d8_1" },
    { if: "route == 3", to: "earth_d8_1" },
    { if: "route == 4", to: "taya_d8_1" },
    { if: "route == 5", to: "secret_c1" },
    { if: "route == 6", to: "true_d8_1" }
  ],
  nodes: [
    { sprite: "clear", text: "Он спустился на один пролёт, потом ещё на один, сам не зная зачем. Наверху было тесно от чужих ожиданий, а здесь пахло сыростью и кошками, и никто ничего от него не ждал." },
    { text: "Лампа на первом этаже мигала, будто никак не могла решиться. Гром ходил над крышей тяжело, как грузчик по чердаку." },
    { text: "Под лестницей была подсобка. Он сто раз проходил мимо и ни разу не видел её открытой. Сейчас дверь стояла приоткрытая, на ладонь. Жёлтая. Он раньше думал, что она серая." },
    { text: "Из щели тянуло озоном. И звонил телефон. Тот самый, с колокольчиком внутри, терпеливый." },
    { speaker: "Александр", sprite: { char: "alexander", emotion: "shocked", pos: "left" }, thought: true, text: "Опять. Здесь. В моём подъезде." },
    {
      if: "calc.true_ready",
      then: [
        { note: "Истинная (routes/true.md): он закрывает жёлтую дверь и отказывается выбирать одного. Строка-связка черновая, автору на правку.", set: { route: 6 }, text: "Он подошёл к подсобке и закрыл жёлтую дверь. Ладонью, до щелчка. Телефон за ней смолк." },
        { jump: "week_end", sprite: "clear" }
      ]
    },
    {
      choice: {
        id: "d7_door",
        prompt: "Жёлтая дверь под лестницей приоткрыта. Телефон звонит.",
        options: [
          {
            label: "Открыть дверь",
            next: [
              {
                if: "glitch_1 && glitch_2",
                then: [
                  { note: "Секретная ветка: вход без света фар и без мысли о водителе (routes/secret.md, глава 1). Старые строки коридора перенесены в secret.md §10.", set: { glitch_3: true, route: 5 }, effects: { glitch_count: 1 } },
                  { jump: "week_end", sprite: "clear" }
                ],
                else: [
                  { set: { glitch_3: true }, text: "Он потянул дверь. Внутри стояли вёдра со шваброй. Пахло хлоркой. Озон пропал." },
                  { text: "Телефон звонил наверху, у кого-то на третьем. Кто-то взял трубку и сказал: «Да, мам, сплю уже»." },
                  { speaker: "Александр", sprite: { char: "alexander", emotion: "thoughtful", pos: "left" }, thought: true, text: "Подсобка. Обычная подсобка. Нервы." },
                  { text: "Но когда он закрывал дверь, ему показалось, что краска под пальцами на секунду стала жёлтой. И тёплой." }
                ]
              }
            ]
          },
          {
            label: "Пройти мимо",
            next: [
              { text: "Он отвернулся от двери. Звон за ней дрогнул и стих, как будто там повесили трубку." },
              { text: "Когда он снова глянул под лестницу, дверь была серая и закрытая. Как всегда." }
            ]
          }
        ]
      }
    },
    { label: "route_choice", sprite: "clear", text: "Саша сел на ступеньку. Сверху, с пятого, слабо светилась щель под его дверью. Внизу, за стеклом подъезда, хлестал ливень." },
    { text: "Неделю назад в такую же ночь он умер. По документам. Всё, что было потом, с ним случалось, а он только уворачивался и шутил. Даже с работы ушёл, как уходят от сквозняка." },
    { text: "А сейчас никто не толкал. Все ждали. Он посидел ещё, слушая, как вода бьёт в козырёк. Можно было досидеть до утра. Утром всё решилось бы само, как всегда." },
    {
      if: "calc.leader == 0",
      then: [
        { note: "Слабая связь со всеми: он досиживает до утра. Земной маршрут, пассивный вход (День 8: Лена перехватывает у подъезда).", set: { route: 3, earth_passive: true } },
        { jump: "week_end", sprite: "clear" }
      ]
    },
    { speaker: "Александр", sprite: { char: "alexander", emotion: "thoughtful", pos: "left" }, thought: true, text: "Ладно. Хоть раз в жизни — сам." },
    {
      if: "calc.tie",
      then: [
        {
          choice: {
            id: "d7_route",
            prompt: "Куда он пойдёт этой ночью?",
            note: "Ничья двух лидеров: в меню только они (00_decisions.md п. 31).",
            options: [
              { label: "Наверх, к Мираэль", if: "calc.leader == 1 || calc.second == 1", jump: "arr_mirael" },
              { label: "В салон «Валерия и партнёры»", if: "calc.leader == 2 || calc.second == 2", jump: "arr_valeria" },
              { label: "К шаурмичной, к Лене", if: "calc.leader == 3 || calc.second == 3", jump: "arr_lena" },
              { label: "В мастерскую к Тае", if: "calc.leader == 4 || calc.second == 4", jump: "arr_taya" }
            ]
          }
        }
      ]
    },
    { if: "calc.leader == 1", then: [{ jump: "arr_mirael" }] },
    { if: "calc.leader == 2", then: [{ jump: "arr_valeria" }] },
    { if: "calc.leader == 3", then: [{ jump: "arr_lena" }] },
    { if: "calc.leader == 4", then: [{ jump: "arr_taya" }] },
    { label: "arr_mirael", set: { route: 1 }, bg: "bg_sasha_room_night", bgm: "Golden Afternoon Light.mp3", weather: "rain", text: "Он поднялся на пятый, перешагивая через ступеньку. Мираэль открыла раньше, чем он постучал. Тетрадь с уставом была у неё в руках." },
    { speaker: "Мираэль", sprite: { char: "mirael_angel", emotion: "surprised", pos: "right" }, text: "Ты вернулся." },
    { speaker: "Александр", sprite: { char: "alexander", emotion: "smile", pos: "left" }, text: "Мира, я вернулся. Давай свой пункт об убежище. Только с правильным номером." },
    { sprite: { char: "mirael_angel", emotion: "crying", pos: "right" }, text: "Она засмеялась и заплакала одновременно, и крылья развернулись во всю комнату, сшибая с полки будильник." },
    { jump: "week_end", sprite: "clear" },
    { label: "arr_valeria", set: { route: 2 }, bg: "bg_valeria_salon_night", bgm: "Midnight Boardroom.mp3", weather: "rain", text: "До Старокупеческого он добежал мокрый насквозь. Дверь на втором этаже открылась сама. Пахло воском и старым деревом, в камине трещали поленья." },
    { speaker: "Валерия", sprite: { char: "valeria", emotion: "playful_smile", pos: "right" }, text: "Александр. Без двадцати двенадцать. Вы умеете входить эффектно." },
    { speaker: "Александр", sprite: { char: "alexander", emotion: "neutral", pos: "left" }, text: "Я пришёл говорить. Не подписывать." },
    { speaker: "Валерия", sprite: { char: "valeria", emotion: "amused", pos: "right" }, text: "Все так говорят. Садитесь. Вы играете в шахматы?" },
    { jump: "week_end", sprite: "clear" },
    { label: "arr_lena", set: { route: 3 }, bg: "bg_courier_spot", bgm: "Summer Town Shuffle.mp3", weather: "rain", text: "Под жестяным навесом шаурмичной горела лампа. Дождь стоял стеной, по асфальту неслись ручьи. Лена была там, с термосом, как обещала." },
    { speaker: "Лена", sprite: { char: "lena", emotion: "surprised", pos: "right" }, text: "Пришёл. А я уже поспорила сама с собой, что не придёшь. Проиграла себе эспрессо." },
    { speaker: "Александр", sprite: { char: "alexander_jacket", emotion: "smile", pos: "left" }, text: "Наливай. И рассказывай свою мысль. Про обоих." },
    { speaker: "Лена", sprite: { char: "lena", emotion: "coffee", pos: "right" }, text: "Садись. Это надолго. И Саш — сначала ты. Всё, что не договорил во вторник." },
    { jump: "week_end", sprite: "clear" },
    { label: "arr_taya", set: { route: 4 }, bg: "bg_taya_workshop_night", bgm: "Soft Morning Light.mp3", weather: "none", text: "В полуподвале было сухо и тихо. Дождь стучал где-то наверху, в другом мире. Колокольчик звякнул, и все часы на полках на миг притихли." },
    { speaker: "Тая", sprite: { char: "taya", emotion: "warm_smile", pos: "right" }, text: "Ты вовремя. Смотри." },
    { text: "Дедовские часы лежали на сукне. Стрелки сошлись на двенадцати. Секундная дрогнула и замерла. Совсем." },
    { speaker: "Тая", sprite: { char: "taya", emotion: "neutral", pos: "right" }, text: "Садись. Я заварю чай. Сначала выпей чаю." },
    { jump: "week_end", sprite: "clear" },
    { label: "week_end", sprite: "clear", note: "Конец Недели 1. Дальше — маршруты (Акт II), см. next главы." }
  ]
});
