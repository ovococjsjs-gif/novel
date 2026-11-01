window.VN_CHAPTERS = window.VN_CHAPTERS || [];
window.VN_CHAPTERS.push({
  id: "day2_3_night",
  day: "Акт I · День 2",
  title: "Глава III. Белое платье на старом мосту",
  bg: "assets/backgrounds/bg_sasha_kitchen_night.png",
  bgm: "Soft Morning Light.mp3",
  weather: "none",
  nodes: [
    {
      speaker: "Рассказчик",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_angel", emotion: "happy" }
      },
      text: "Когда Саша вернулся со смены в седьмом часу вечера, Мираэль встретила его прямо в прихожей. Весь день она честно просидела взаперти, перечитав половину книжной полки на подоконнике."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_angel", emotion: "surprised" }
      },
      text: "Ну что, затворница, собирайся. На улице тёплый вечер, ветра почти нет. Ты ведь с утра показала, что уже отлично умеешь прятать перья?"
    },
    {
      speaker: "Рассказчик",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "happy" }
      },
      text: "Глаза Мираэль вспыхнули радостью. Она выпрямилась, свела лопатки — и в одно плавное движение убрала обе пары крыльев в незримый контур за спиной, поправив подол простого белого платья Даши."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "smile" },
        right: { char: "mirael_human", emotion: "shy" }
      },
      text: "Готова! Теперь я ничем не отличаюсь от обычной жительницы вашего района. Ну... разве что чуть-чуть кончиками ушей, если я распущу пряди."
    },
    {
      speaker: "Рассказчик",
      bg: "assets/backgrounds/bg_old_park_bridge.png",
      bgm: "Summer Town Shuffle.mp3",
      sprite: {
        left: { char: "alexander_jacket", emotion: "neutral" },
        right: { char: "mirael_human", emotion: "surprised" }
      },
      text: "Через пятнадцать минут они неспешно шли по каменному мосту в старом парке. Вчера ночью здесь Сашу трясло от одиночества и паники, а сейчас чугунные фонари лили на брусчатку мягкий медовый свет."
    },
    {
      speaker: "Рассказчик",
      text: "Мираэль шла чуть медленнее обычного шага, с детским восхищением прислушиваясь к тому, как каблучки туфель стучат по камню, и поминутно касаясь ладонью чугунной решётки перил."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander_jacket", emotion: "smile" },
        right: { char: "mirael_human", emotion: "happy" }
      },
      text: "Саша, как же это странно! Когда я раньше сопровождала тебя сверху, я видела этот мост сотни раз, но для меня он всегда был плоским чертежом из камня и координат. Я и не знала, что от воды снизу так вкусно пахнет речной травой и прохладой."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander_jacket", emotion: "smile" },
        right: { char: "mirael_human", emotion: "neutral" }
      },
      text: "Подожди, что значит «видела сотни раз»? Ты за мной реально всё это время следила в оба глаза?"
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander_jacket", emotion: "surprised" },
        right: { char: "mirael_human", emotion: "shy" }
      },
      text: "Конечно! С того самого дня, как меня прикрепили к твоему полису. Я знаю, что когда ты нервничаешь, ты всегда крутишь колёсико наручных часов. И что ты каждый раз переходишь на другую сторону улицы у булочной, чтобы не потратить лишние сто рублей на выпечку, хотя очень хочешь."
    },
    {
      choice: {
        id: "choice_d2_bridge_mirael_memories",
        prompt: "Мираэль смущённо улыбается, опираясь локтями о парапет старого моста рядом с Сашей.",
        options: [
          {
            label: "Улыбнуться: «Тогда сегодня мы официально нарушим и это правило — идём в ту самую пекарню»",
            effects: { aff_mirael: 2, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "smile" },
                  right: { char: "mirael_human", emotion: "happy" }
                },
                text: "Ну раз уж ты в курсе всех моих гастрономических слабостей, сегодня мы официально нарушим и это правило. Идём в ту самую пекарню на углу — угощу своего Хранителя горячей выпечкой."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "smile" },
                  right: { char: "mirael_human", emotion: "happy" }
                },
                text: "Ты уверен? У тебя ведь расчёт в депо только в четверг!"
              },
              {
                speaker: "Александр",
                text: "На две слойки с вишней и чайник чая мой бюджет точно не рухнет."
              }
            ]
          },
          {
            label: "Спросить тихо: «Почему ты тогда на перекрёстке не отошла в сторону, Мираэль? Ты ведь знала, чем рискуешь»",
            effects: { aff_mirael: 2, inner_sight: 2 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "thoughtful" },
                  right: { char: "mirael_human", emotion: "sad" }
                },
                text: "Мираэль... Скажи мне честно. Ты ведь в ту секунду на перекрёстке прекрасно понимала, что тебя за это ждёт трибунал. Почему ты не сделала шаг назад, как велел ваш устав?"
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "thoughtful" },
                  right: { char: "mirael_human", emotion: "shy" }
                },
                text: "Потому что я слишком долго на тебя смотрела, Саша. Я видела, как ты по вечерам сидишь один над книгами и ждёшь, когда твоя настоящая жизнь наконец начнётся. И когда я увидела эти фары, я просто не смогла допустить, чтобы у тебя так ничего и не началось."
              }
            ]
          }
        ]
      }
    },
    {
      speaker: "Рассказчик",
      bg: "assets/backgrounds/bg_city_cafe.png",
      bgm: "Soft Morning Light.mp3",
      sprite: {
        left: { char: "alexander_jacket", emotion: "smile" },
        right: { char: "mirael_human", emotion: "surprised" }
      },
      text: "В маленькой угловой пекарне за парковым сквером было тепло и пахло корицей, ванилью и поджаристой корочкой. Они заняли дальний столик у широкого окна, за которым зажигались вечерние витрины."
    },
    {
      speaker: "Рассказчик",
      sprite: {
        left: { char: "alexander_jacket", emotion: "smile" },
        right: { char: "mirael_human", emotion: "happy" }
      },
      text: "Когда перед Мираэль поставили блюдечко с тёплой вишнёвой слойкой, посыпанной сахарной пудрой, она осторожно отломила край, попробовала — и от удовольствия зажмурилась так искренне, что у Саши само собой потеплело на душе."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander_jacket", emotion: "smile" },
        right: { char: "mirael_human", emotion: "happy" }
      },
      text: "Она хрустит снаружи, а внутри горячая и чуть кислая! Люди на земле едят такое каждый день и всё равно ходят по улицам с хмурыми лицами?"
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander_jacket", emotion: "smile" },
        right: { char: "mirael_human", emotion: "shy" }
      },
      text: "Осторожнее, у тебя сахарная пудра на кончике носа осталась."
    },
    {
      choice: {
        id: "choice_d2_bakery_moment",
        prompt: "Мираэль растерянно пытается стереть сахарную пудру тыльной стороной ладони и только размазывает её по щеке.",
        options: [
          {
            label: "Протянуть руку с бумажной салфеткой и бережно стереть пудру с её щеки",
            effects: { aff_mirael: 2 },
            nodes: [
              {
                speaker: "Рассказчик",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "shy" },
                  right: { char: "mirael_human", emotion: "shy" }
                },
                text: "Саша взял чистую бумажную салфетку, наклонился через узкий столик и мягко коснулся её щеки. Мираэль мгновенно замерла, не дыша, а на её бледных скулах проступил густой розовый румянец."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "shy" },
                  right: { char: "mirael_human", emotion: "shy" }
                },
                text: "С-спасибо... У тебя очень тёплые пальцы, Саша."
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
                  left: { char: "alexander_jacket", emotion: "smile" },
                  right: { char: "mirael_human", emotion: "happy" }
                },
                text: "На, держи салфетку, чуть левее под глазом. Из тебя вышел потрясающий тайный агент Верхнего круга — первая же булочка выдала с головой."
              },
              {
                speaker: "Мираэль",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "smile" },
                  right: { char: "mirael_human", emotion: "shy" }
                },
                text: "В учебном регламенте не было раздела про слоёное тесто! Я исправлюсь."
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
      text: "Домой они вернулись уже в десятом часу вечера. В тишине закрытой комнаты Мираэль с облегчением расправила затёкшие крылья, а Саша достал из ящика стола тёмно-бордовую визитку дома «Валерия и партнёры»."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "surprised" }
      },
      text: "Знаешь, о чём я подумал по дороге домой, Мираэль? Сидеть в окопе и ждать, пока истекут девятнадцать дней — верный способ проиграть."
    },
    {
      speaker: "Мираэль",
      sprite: {
        left: { char: "alexander", emotion: "thoughtful" },
        right: { char: "mirael_angel", emotion: "shocked_terrified" }
      },
      text: "Ты смотришь на карточку куратора... Саша, ты ведь не собираешься подписывать её бумагу?!"
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander", emotion: "neutral" },
        right: { char: "mirael_angel", emotion: "sad" }
      },
      text: "Подписывать вслепую — ни за что. Но завтра в обед у меня окно между утренними и вечерними заказами. Я хочу сам прийти в её бюро в Старокупеческом и потребовать прецеденты по кассационным делам. Пора узнать, какие карты у неё на руках."
    }
  ]
});
