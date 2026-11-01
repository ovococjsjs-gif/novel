window.VN_CHAPTERS = window.VN_CHAPTERS || [];
window.VN_CHAPTERS.push({
  id: "day2_3_night",
  day: "ДЕНЬ 2 · ОСТАЛОСЬ 20 ДНЕЙ",
  title: "Глава III. Первая прогулка без крыльев",
  subtitle: "Горбатый мост в парке · Кондитерская · 19:30 – 21:45",
  bg: "assets/backgrounds/bg_old_park_bridge.png",
  bgm: "Golden Afternoon Light.mp3",
  weather: "none",
  nodes: [
    {
      speaker: "Рассказчик",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "surprised" }
      },
      text: "К половине восьмого вечера, сдав дневную выручку в депо, Саша забрал Мираэль из дома и вывел её на тихую парковую аллею к горбатому каменному мосту над речным каналом."
    },
    {
      speaker: "Рассказчик",
      text: "Без крыльев за спиной Мираэль в лёгком белом платье ничем не отличалась от горожанок на вечернем променаде — разве что поминутно оглядывалась на собственные лопатки и чуть смещала шаг к краю дорожки."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "shy" }
      },
      text: "Саша... У людей такая странная гравитация. Когда крылья спрятаны, на каждом шаге кажется, что при порыве ветра меня качнёт в сторону и нечем будет выровнять крен."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "shy" }
      },
      text: "Держись ближе ко мне — если начнёт сносить ветром с канала, сработаю балластом. Ты правда за все семь лет ни разу не спускалась на тротуар?"
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_human", emotion: "neutral" }
      },
      text: "Ни разу. Нам положено наблюдать с карнизов, колоколен или сквозь отражения в верхних окнах. Сверху город похож на расчерченный мелом чертёж: линии улиц, точки зонтиков, маршруты трамваев."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_human", emotion: "happy" }
      },
      text: "А снизу всё оказалось шумным, тёплым и пахнет сразу десятком вещей! Речной тиной, нагретым камнем, жареным миндалём из тележки у входа и чужими духами."
    },
    {
      speaker: "Рассказчик",
      text: "Она остановилась посередине горбатого моста, положила ладони на тёплый чугунный парапет и посмотрела вниз, где в зелёной воде канала расходились круги от водомерок."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "surprised" }
      },
      text: "Смотри, Саша! Вон под тем кустом ивы у берега сидит рыжая утка с четырьмя утятами. Я видела этот выводок ещё в июне с крыши лодочной станции, когда они были совсем жёлтыми комочками, а теперь они почти догнали мать!"
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "happy" }
      },
      text: "Ты ещё и парковых уток в лицо помнишь? В вашей Верхней канцелярии явно недооценивают твою наблюдательность."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "shy" }
      },
      text: "Ну а чем ещё заниматься на дежурстве, когда ты по четыре часа сидишь в читальном зале или чинишь камеру в гараже? Я пересчитала всех голубей на карнизе напротив твоего дома и выучила расписание речных трамвайчиков."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_human", emotion: "neutral" }
      },
      text: "Семь лет сидеть на сквозняке и смотреть в чужие окна... И у вас там совсем не бывает выходных или отпусков?"
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_human", emotion: "neutral" }
      },
      text: "Отпуск полагается, только когда подопечный доживает до последней страницы своей книги. Тогда Хранителю дают семь дней тишины в Верхних садах перед новым назначением. Так что до позавчерашней грозы у меня не было ни одного выходного."
    },
    {
      choice: {
        id: "choice_d2_park_bridge",
        prompt: "Мираэль заворожённо смотрит с каменного моста на вечерний канал и отражения фонарей.",
        options: [
          {
            label: "Взять её за руку: «Тогда давай не спешить. Сегодня этот вечер целиком наш»",
            effects: { aff_mirael: 2, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_human", emotion: "shy" }
                },
                text: "Тогда давай никуда не бежать. Моя смена закончилась, телефон в беззвучном режиме — гуляем столько, сколько захочешь."
              },
              {
                speaker: "Рассказчик",
                text: "Он накрыл её ладонь на чугунных перилах. Пальцы Мираэль вздрогнули, но не отстранились — наоборот, осторожно переплелись с его пальцами."
              }
            ]
          },
          {
            label: "Рассказать ей про дневной случай в арке: «Кстати, сегодня днём мне в приложение прилетел странный адрес — квартира ноль»",
            effects: { aff_mirael: 1, inner_sight: 2 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "thoughtful" },
                  right: { char: "mirael_human", emotion: "surprised" }
                },
                text: "Слушай, а пока ты сидела дома, мне днём прилетел странный вызов в Старокупеческий — «квартира ноль». Под аркой в глухой стене проступила жёлтая дверь, и за ней звонил телефон."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "thoughtful" },
                  right: { char: "mirael_human", emotion: "shocked_terrified" }
                },
                text: "Саша, никогда не открывай такие двери! Это изнаночные зазоры между слоями — туда проваливаются те, чья запись в реестре размыта. Хорошо, что ты не шагнул внутрь!"
              }
            ]
          }
        ]
      }
    },
    {
      speaker: "Рассказчик",
      bg: "assets/backgrounds/bg_city_cafe.png",
      bgm: "Summer Town Shuffle.mp3",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "surprised" }
      },
      text: "Спустившись с паркового моста к углу Старого бульвара, Саша завёл Мираэль в небольшую кондитерскую с полосатым навесом и латунным колокольчиком над дверью."
    },
    {
      speaker: "Рассказчик",
      text: "За стеклянной витриной лежали ряды горячих слоёных булочек с корицей, заварных колец и миндальных рогаликов. Мираэль прижалась ладонями к краю прилавка, разглядывая сахарную глазурь с такой серьёзностью, будто перед ней лежали вещественные доказательства."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "happy" }
      },
      text: "Давай я возьму нам чайник чая с чабрецом и две вот эти горячие булки с корицей и сахарной пудрой. Ты с позавчерашней ночи кроме овсяного печенья и батона ничего не пробовала."
    },
    {
      speaker: "Рассказчик",
      text: "Они сели за круглый деревянный столик у окна. Мираэль двумя руками подняла тёплую слоёную булочку, откусила край — и тут же зажмурилась от удовольствия, испачкав кончик носа и щёку белой сахарной пудрой."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "happy" }
      },
      text: "Саша... Оно хрустит снаружи, а внутри совсем мягкое и пахнет так, будто кто-то спрятал в тесто кусочек летнего полдня! Как вы, люди, вообще умудряетесь грустить, когда у вас на каждом углу пекут такое?"
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "shy" }
      },
      text: "Мы ко всему привыкаем, Мираэль. Даже к горячим булкам. Кстати, у тебя вся щека в белой пудре."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "surprised" }
      },
      text: "Ой! Где? Справа или слева?"
    },
    {
      speaker: "Рассказчик",
      text: "Она торопливо приложила ладонь к правой щеке, оставив поверх первого пятна ещё и белую полоску на скуле."
    },
    {
      choice: {
        id: "choice_d2_bakery_moment",
        prompt: "Мираэль пытается стереть сахарную пудру тыльной стороной ладони и размазывает её ещё сильнее.",
        options: [
          {
            label: "Протянуть руку с бумажной салфеткой и самому вытереть пудру с её щеки",
            effects: { aff_mirael: 2 },
            nodes: [
              {
                speaker: "Рассказчик",
                sprite: {
                  left: { char: "alexander", emotion: "shy" },
                  right: { char: "mirael_human", emotion: "shy" }
                },
                text: "Саша вытянул из салфетницы бумажный уголок, подался через столик и осторожно провёл по её щеке и кончику носа. Мираэль перестала жевать и покраснела до самых ушей."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "shy" },
                  right: { char: "mirael_human", emotion: "shy" }
                },
                text: "С-спасибо... У тебя пальцы пахнут кофе и ветром, Саша."
              }
            ]
          },
          {
            label: "Усмехнуться и подать ей салфетку: «Чуть левее. Из тебя вышел отличный замаскированный агент»",
            effects: { aff_mirael: 1, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_human", emotion: "happy" }
                },
                text: "Держи салфетку, чуть левее под глазом. Из тебя вышел незаменимый связной Верхнего круга — первая же кондитерская выдала с потрохами."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_human", emotion: "shy" }
                },
                text: "В нашем уставе не было ни строчки про слоёное тесто! В следующий раз буду есть вилкой."
              }
            ]
          }
        ]
      }
    },
    {
      speaker: "Рассказчик",
      bg: "assets/backgrounds/bg_sasha_room_night.png",
      bgm: "River Fog.mp3",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "neutral" }
      },
      text: "Домой они вернулись в десятом часу вечера. В закрытой комнате Мираэль с шумным выдохом расправила затёкшие крылья, а Саша выдвинул верхний ящик стола и достал бордовую карточку дома «Валерия и партнёры»."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "surprised" }
      },
      text: "Знаешь, о чём я думал, пока мы шли через парк, Мираэль? Сидеть в глухой обороне и ждать, пока истекут девятнадцать дней — верный способ проиграть всухую."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "shocked_terrified" }
      },
      text: "Ты смотришь на карточку куратора... Саша, ты ведь не думаешь подписывать её бумагу?!"
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "sad" }
      },
      text: "Подписывать вслепую — ни в коем случае. Но завтра в обед у меня двухчасовое окно между утренними и вечерними доставками. Я хочу сам прийти к ней в бюро в Старокупеческом и потребовать архивные прецеденты по кассационным делам."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "surprised" }
      },
      text: "Ты хочешь потребовать у старшего куратора Нижнего круга внутренние судебные книги?! Саша, да к ней даже наши ревизоры ходят только с предписанием за тремя печатями!"
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_angel", emotion: "surprised" }
      },
      text: "Ревизоры ходят по инструкции, а я клиент, за которым она сама пришла домой с папкой. Если ей так нужна моя подпись — пусть сначала покажет правила игры."
    },
    {
      choice: {
        id: "choice_d2_night_plan",
        prompt: "Мираэль встревоженно складывает руки у груди, глядя на бордовую визитку в пальцах Саши.",
        options: [
          {
            label: "Успокоить её: «Я не подпишу ни строчки. Но мне нужно увидеть их уставные бумаги своими глазами»",
            effects: { aff_mirael: 2, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "neutral" }
                },
                text: "Обещаю: я оставлю свою ручку дома и не возьму со стола чужую. Мне нужно вытянуть из неё статьи вашего кодекса, за которые мы сможем зацепиться на слушании."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "sad" }
                },
                text: "Только проверяй каждое её слово, Саша. В Нижнем арбитраже даже запятая в протоколе может стоить свободы."
              }
            ]
          },
          {
            label: "Сказать решительно: «Пусть знает, что я не собираюсь молча ждать приговора»",
            effects: { aff_valeria: 1, inner_sight: 2 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "determined_anger" },
                  right: { char: "mirael_angel", emotion: "surprised" }
                },
                text: "Она привыкла, что клиенты сидят дома и трясутся до последнего дня срока. Посмотрим, что она скажет, когда я сам приду за выписками из их архива."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "determined_anger" },
                  right: { char: "mirael_angel", emotion: "shy" }
                },
                text: "Ты споришь с куратором Нижнего круга так, будто это ваш диспетчер из павильона... Возвращайся к ужину целым, ладно?"
              }
            ]
          }
        ]
      }
    }
  ]
});
