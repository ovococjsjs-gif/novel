window.VN_CHAPTERS = window.VN_CHAPTERS || [];
window.VN_CHAPTERS.push({
  id: "day3_3_home",
  day: "Акт I · День 3",
  title: "Глава III. Память Хранителя и ужин на двоих",
  bg: "assets/backgrounds/bg_sasha_kitchen_night.png",
  bgm: "Soft Morning Light.mp3",
  weather: "none",
  nodes: [
    {
      speaker: "Рассказчик",
      sprite: { char: "alexander", emotion: "surprised" },
      text: "Вечером третьего дня, поднявшись на свой этаж после смены, Саша ещё через входную дверь уловил вкусный домашний запах жареного лука и картошки."
    },
    {
      speaker: "Рассказчик",
      sprite: {
        left: { char: "alexander", emotion: "surprised" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "На кухне Мираэль в расправленном крылатом облике стояла у плиты с деревянной лопаткой наперевес, словно со щитом, и дула на покрасневшую подушечку указательного пальца."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_angel", emotion: "happy" }
      },
      text: "Саша! Ты как раз вовремя! Я нашла в столе кулинарную тетрадь твоей мамы и решила, что раз уж я живу у тебя на довольствии, я обязана приготовить ужин к твоему возвращению со смены."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "Пахнет просто божественно. Только покажи руку — опять об сковородку обожглась?"
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "Совсем чуть-чуть, масло брызнуло! В земном теле кожа реагирует на температуру гораздо быстрее, чем я привыкла."
    },
    {
      choice: {
        id: "choice_d3_kitchen_dinner",
        prompt: "Мираэль протягивает руку с маленьким ожогом на пальце, смущённо пряча деревянную лопатку.",
        options: [
          {
            label: "Взять её ладонь и подставить палец под холодную воду из-под крана",
            effects: { aff_mirael: 2, inner_sight: 1 },
            nodes: [
              {
                speaker: "Рассказчик",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "shy" }
                },
                text: "Саша взял её узкую ладонь, открыл холодную воду и подержал палец под струёй. Крылья за спиной Мираэль дрогнули, слегка коснувшись его плеча мягкими тёплыми перьями."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Спасибо... Так сразу перестало щипать. Садись за стол, я уже разложила по тарелкам!"
              }
            ]
          },
          {
            label: "Похвалить её старания: «Для первого раза в жизни — это твёрдая пятёрка с плюсом»",
            effects: { aff_mirael: 1, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "happy" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Для первой в жизни жареной картошки — это твёрдая пятёрка с плюсом, Мираэль. Я за целый день на педалях проголодался как волк."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "happy" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Тогда ешь скорее, пока горячее!"
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
      text: "После ужина они перебрались в комнату с кружками горячего чая. Саша положил на стол принесённую из бюро папку с кассационным регламентом."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "sad" }
      },
      text: "Ты всё-таки ходил к ней сегодня днём... Что она тебе сказала, Саша?"
    },
    {
      speaker: "Рассказчик",
      text: "Саша посмотрел в её тревожные глаза и решил не пересказывать дословно угрозу Валерии про полное обнуление памяти. Но скрывать суть дела было нельзя."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "neutral" }
      },
      text: "Дала почитать выписку по кассациям. И ещё я перехватил Нику в кафе. Оказывается, Валерия ведёт наше дело в обход общей очереди — у неё в этом какой-то личный азарт. Она хочет, чтобы я сам пришёл к ней за стол переговоров."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "sad" }
      },
      text: "Потому что в конце кассации Верхняя ревизия смотрит на исход дела сугубо формально. Если человек не подписал долговой лист у нижнего ведомства, проверяющий просто стирает лишние строчки из книги и возвращает Хранителя на переплавку памяти..."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "surprised" },
        right: { char: "mirael_angel", emotion: "sad" }
      },
      text: "Ты знала про обнуление памяти?! И молчала?"
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "surprised" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "Конечно знала. Нам говорят об этом в первый же день службы. Но мне было не жалко, Саша. Даже если бы мне стёрли память, ты бы всё равно остался жить. А пока идут эти двадцать один день, я хотя бы могу помнить всё, что видела рядом с тобой."
    },
    {
      speaker: "Рассказчик",
      text: "Она поджала ноги на диване и тихо улыбнулась, глядя на книжную полку у окна."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "happy" }
      },
      text: "Я ведь помню, как тебе было двенадцать и ты пытался починить старый радиоприёмник паяльником, чтобы поймать далёкую волну ночью. И как в шестнадцать ты отдал свою куртку другу на автобусной остановке в мороз, а потом неделю пил горячее молоко с мёдом. Для реестра это были пустые клеточки между датами, а для меня — целая жизнь."
    },
    {
      choice: {
        id: "choice_d3_mirael_memory_promise",
        prompt: "Мираэль смотрит на Сашу со светлой, почти беззащитной улыбкой.",
        options: [
          {
            label: "Твёрдо сказать ей: «Никто не сотрёт тебе память, Мираэль. Я не позволю сделать из тебя чистый бланк»",
            effects: { aff_mirael: 2, inner_sight: 2 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "determined_anger" },
                  right: { char: "mirael_angel", emotion: "surprised" }
                },
                text: "Послушай меня внимательно, Мираэль. Никакой переплавки памяти не будет. Если кто-то наверху считает, что тебя можно стереть ластиком за то, что ты спасла мне жизнь — им придётся иметь дело со мной."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "shy" }
                },
                text: "Саша... Когда ты так говоришь, я почему-то верю, что ты и правда можешь переспорить даже ревизора."
              }
            ]
          },
          {
            label: "Пообещать: «У нас впереди ещё восемнадцать дней. С завтрашнего вечера я свободен от смен, и мы найдём лазейку в вашем уставе»",
            effects: { aff_mirael: 2, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Завтра в четверг я сдаю последнюю смену в депо и получаю расчёт. Со второй половины дня руки у меня полностью развязаны — сядем за эти папки вдвоём и перероем ваш устав до последней запятой."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Мы обязательно разберёмся. Вдвоём не страшно."
              }
            ]
          }
        ]
      }
    }
  ]
});
