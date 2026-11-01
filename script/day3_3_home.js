window.VN_CHAPTERS = window.VN_CHAPTERS || [];
window.VN_CHAPTERS.push({
  id: "day3_3_home",
  day: "ДЕНЬ 3 · ОСТАЛОСЬ 19 ДНЕЙ",
  title: "Глава III. Память Хранителя и ужин на двоих",
  subtitle: "Кухня и комната Саши · 20:15 – 22:30",
  bg: "assets/backgrounds/bg_sasha_kitchen_night.png",
  bgm: "Soft Morning Light.mp3",
  weather: "none",
  nodes: [
    {
      speaker: "Рассказчик",
      sprite: { char: "alexander", emotion: "surprised" },
      text: "Вечером третьего дня, поднявшись на свой этаж после смены, Саша ещё на лестничной площадке уловил домашний запах жареного лука, укропа и подрумяненной картошки."
    },
    {
      speaker: "Рассказчик",
      sprite: {
        left: { char: "alexander", emotion: "surprised" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "На кухне Мираэль с расправленными крыльями стояла у плиты, держа деревянную лопатку наперевес, и дула на покрасневшую подушечку указательного пальца. На столе лежала раскрытая тетрадь в клеточку с пожелтевшими страницами."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_angel", emotion: "happy" }
      },
      text: "Саша! Ты вовремя! Я нашла в кухонном ящике старую тетрадь с рецептами и решила, что раз уж я живу у тебя в доме, то к твоему возвращению со смены на плите должен стоять горячий ужин."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "Пахнет на весь подъезд — баба Нюра на втором этаже наверняка уже принюхивается у замочной скважины. Только дай-ка сюда руку — опять об чугунную сковородку приложилась?"
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "Чуть-чуть, капля масла стрельнула, когда я переворачивала ломтики! В земном теле кожа отзывается на жар куда резче, чем я привыкла."
    },
    {
      speaker: "Рассказчик",
      text: "Саша заглянул в чугунную сковородку на конфорке. Картошка действительно подрумянилась аппетитной золотистой корочкой, хотя нарезана была самым причудливым образом: от тонких ромбиков до толстых пятиугольных брусков."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "Слушай, а по какому чертежу ты её резала? Тут половина долек похожа на детали часового механизма."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_angel", emotion: "determined_anger" }
      },
      text: "В тетради было написано «нарезать средними ломтиками на глаз»! Откуда же я знала, какой у людей средний глаз, если каждая картофелина круглая и катится по доске?!"
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "happy" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "Ладно-ладно, не топорщи перья, шеф-повар. Давай сначала разберёмся с твоим боевым ранением."
    },
    {
      choice: {
        id: "choice_d3_kitchen_dinner",
        prompt: "Мираэль протягивает руку с маленьким пятнышком ожога на пальце, пряча за спину деревянную лопатку.",
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
                text: "Саша взял её узкую ладонь, повернул вентиль холодной воды и подержал палец под струёй. Верхнее крыло за спиной Мираэль дрогнуло и задело его плечо тёплыми маховыми перьями."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Спасибо... Сразу перестало щипать. Садись к столу, я уже достала тарелки и нарезала хлеб!"
              }
            ]
          },
          {
            label: "Похвалить её стряпню: «Для первой жареной картошки в жизни — твёрдая пятёрка»",
            effects: { aff_mirael: 1, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "happy" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Для первой в жизни жареной картошки с корочкой — твёрдая пятёрка, Мираэль. Я за восемь часов на педалях оголодал так, что готов съесть её вместе со сковородой."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "happy" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Сковороду оставь на завтра, а картошку накладывай скорее, пока не остыла!"
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
      text: "После ужина они перешли в комнату с двумя кружками горячего чая. Саша положил на край письменного стола принесённую из Старокупеческого переулка папку с выписками из кассационного регламента."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "sad" }
      },
      text: "Ты ходил к ней в обед... Как всё прошло, Саша? Она не заставила тебя ничего подписывать?"
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "neutral" }
      },
      text: "Ручку в руки даже не брал, как и обещал. Зато вытянул из неё архивную статистику по прошлым кассациям и перехватил Нику на обеде в кофейне. Выяснилась любопытная деталь: Валерия забрала наше «Дело №0» в обход своего департамента."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "surprised" }
      },
      text: "В обход департамента? Но зачем старшему куратору возиться с делом одного курьера и рядового Хранителя?"
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "sad" }
      },
      text: "Затем, что ей наскучили клиенты, которые подписывают типовой бланк не глядя. А в архивной книге чёрным по белому написано: если смертный идёт на слушание без встречного поручителя, Верхняя ревизия в тридцати одном случае из тридцати четырёх списывает Хранителя на обнуление памяти."
    },
    {
      speaker: "Рассказчик",
      text: "Мираэль опустила глаза на сложенные на коленях ладони и не удивилась ни единому слову."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "surprised" },
        right: { char: "mirael_angel", emotion: "sad" }
      },
      text: "Подожди. Ты даже не вздрогнула. Ты с самого первого утра знала, что на кассации тебе сотрут память, и молчала?!"
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "surprised" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "Знала. Нам зачитывают эту статью устава перед первым дежурством на карнизе. Но разве я могла сказать тебе об этом позавчера, когда к нам пришла Валерия? Ты бы в ту же минуту схватил перо и подписал её кабальный лист ради меня!"
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "sad" }
      },
      text: "Даже если после двадцать первого дня меня вернут в строй чистым листом, ты останешься жить на земле свободным человеком. А эти три недели — они уже мои. Их у меня до самого слушания никто не отберёт."
    },
    {
      choice: {
        id: "choice_d3_mirael_seven_years",
        prompt: "Мираэль поджимает ноги на краю дивана и смотрит на старый радиоприёмник на верхней полке шкафа.",
        options: [
          {
            label: "Спросить её: «Ты вчера обмолвилась, что приглядывала за мной семь лет. Что ты вообще видела с тех крыш?»",
            effects: { aff_mirael: 2, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "thoughtful" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Слушай... Ты говорила, что тебя приставили ко мне семь лет назад. Что вообще можно разглядеть с карниза в чужой жизни?"
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "thoughtful" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Гораздо больше, чем ты думаешь. Я помню, как тебе было четырнадцать и ты полночи паял вон тот старый приёмник у окна, чтобы поймать ночную станцию. И как в семнадцать на автобусной остановке в январский мороз отдал свою куртку другу, а потом неделю пил молоко с мёдом и лаял на всю квартиру."
              }
            ]
          },
          {
            label: "Упрекнуть её мягко: «Хороша защитница — решила молча сдать себя в утиль за моей спиной»",
            effects: { aff_mirael: 2 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "shy" }
                },
                text: "Ну ты даёшь, пернатая. Значит, я тут бегаю по юридическим конторам, выбиваю архивные тома, а она уже мысленно собрала узелок на промывку мозгов?"
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "shy" }
                },
                text: "Я не собирала узелок! Но по инструкции Хранителю не положено перекладывать свою вину на подопечного..."
              }
            ]
          }
        ]
      }
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "neutral" }
      },
      text: "В учётной книге Верхней канцелярии человеческие годы выглядят как сухие отметки между двумя датами. А когда смотришь на них изо дня в день с крыши, понимаешь, из скольких мелочей состоит один живой вечер. Чай с чабрецом, скрип велосипедной цепи в прихожей, запах жареного лука на кухне..."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "neutral" }
      },
      text: "И именно поэтому ты в ту ночь сорвалась с крыши на перекрёсток, хотя знала, чем это грозит по уставу."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "shy" }
      },
      text: "Я тогда даже не вспомнила про устав, Саша. Я увидела фары машины на мокром асфальте и поняла: если я сейчас останусь сидеть на карнизе с блокнотом в руках, то завтра вечером на твоей кухне больше никто не зажжёт свет."
    },
    {
      speaker: "Рассказчик",
      text: "Саша протянул руку к краю письменного стола и положил ладонь поверх бордовой папки дома «Валерия и партнёры»."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "neutral" }
      },
      text: "Свет на нашей кухне мы выключать не собираемся. В этой папке есть оговорка в третьем параграфе: встречное поручительство оформляется только на тех условиях, которые согласуют обе стороны. А значит, у нас есть чем торговаться."
    },
    {
      choice: {
        id: "choice_d3_mirael_memory_promise",
        prompt: "Мираэль поднимает взгляд на Сашу, прижимая кружку с остывшим чаем к груди.",
        options: [
          {
            label: "Сказать твёрдо: «Никто не сотрёт тебе память, Мираэль. Я не дам сделать из тебя чистый бланк»",
            effects: { aff_mirael: 2, inner_sight: 2 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "determined_anger" },
                  right: { char: "mirael_angel", emotion: "surprised" }
                },
                text: "Запомни раз и навсегда, Мираэль: никакой переплавки памяти не будет. Если в вашей канцелярии считают, что тебя можно стереть резинкой за то, что ты выдернула меня из-под колёс — им придётся судиться со мной по каждой запятой."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "shy" }
                },
                text: "Саша... Когда ты так упрямо сдвигаешь брови, я начинаю верить, что ты переспоришь даже старшего ревизора."
              }
            ]
          },
          {
            label: "Раскрыть папку на столе: «Завтра я откатываю последнюю смену в депо — и мы разберём их кодекс по винтикам»",
            effects: { aff_mirael: 2, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Завтра в четверг я сдаю термосумку в депо, забираю расчёт у Дмитрия — и с вечера руки у меня развязаны. Разберём эту бордовую папку по косточкам и найдём способ оставить при себе и мою голову, и твою память."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander", emotion: "smile" },
                  right: { char: "mirael_angel", emotion: "happy" }
                },
                text: "Тогда двигай настольную лампу ближе. Первые три параграфа прочитаем прямо сейчас!"
              }
            ]
          }
        ]
      }
    }
  ]
});
