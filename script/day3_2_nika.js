window.VN_CHAPTERS = window.VN_CHAPTERS || [];
window.VN_CHAPTERS.push({
  id: "day3_2_nika",
  day: "Акт I · День 3",
  title: "Глава II. Проговорка за стаканом с трубочкой",
  bg: "assets/backgrounds/bg_city_cafe.png",
  bgm: "The Great Office Meeting.mp3",
  weather: "none",
  nodes: [
    {
      speaker: "Рассказчик",
      sprite: { char: "alexander_jacket", emotion: "thoughtful" },
      text: "Выйдя из особняка «Валерия и партнёры» с папкой под мышкой, Саша свернул за угол и сразу заметил через витрину кофейни знакомую макушку с короткими тёмными рожками, прикрытыми беретом."
    },
    {
      speaker: "Рассказчик",
      sprite: {
        left: { char: "alexander_jacket", emotion: "smile" },
        right: { char: "nika", emotion: "bored" }
      },
      text: "Ника сидела за угловым столиком, болтая ногой под стулом, и через широкую трубочку тянула холодный напиток из высокого пластикового стакана, параллельно листая ленту в телефоне."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander_jacket", emotion: "smile" },
        right: { char: "nika", emotion: "surprised" }
      },
      text: "Приятного аппетита, стажёр. Не возражаешь, если временно живой клиент присядет на две минуты?"
    },
    {
      speaker: "Ника",
      sprite: {
        left: { char: "alexander_jacket", emotion: "smile" },
        right: { char: "nika", emotion: "annoyed" }
      },
      text: "Да вы издеваетесь! Я специально ушла из конторы на законный обед, чтобы полчаса не видеть ни папок, ни клиентов! И вообще — ты как живым из кабинета Валерии вышел? Обычно оттуда выползают на ватных ногах и с дрожащей ручкой в зубах."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander_jacket", emotion: "neutral" },
        right: { char: "nika", emotion: "surprised" }
      },
      text: "Как видишь, даже без ожогов. Более того, она сама дала мне почитать выписку из кассационного регламента."
    },
    {
      speaker: "Ника",
      sprite: {
        left: { char: "alexander_jacket", emotion: "neutral" },
        right: { char: "nika", emotion: "surprised" }
      },
      text: "Чего-о?! Сама дала архивную папку?! Да она за последние пятьдесят лет ни одному смертному даже оглавление без подписанного протокола не показывала!"
    },
    {
      choice: {
        id: "choice_d3_nika_cafe_approach",
        prompt: "Ника с искренним изумлением косится на тиснёную папку в руках Саши.",
        options: [
          {
            label: "Взять ей пирожное на витрине: «Вот и мне интересно, с чего такая щедрость. Расскажешь по секрету?»",
            effects: { aff_valeria: 2, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "smile" },
                  right: { char: "nika", emotion: "happy" }
                },
                text: "Слушай, давай я возьму тебе вон то миндальное пирожное на витрине в качестве компенсации за испорченный перерыв, а ты мне по-человечески объяснишь, с чего вдруг такая честь моей скромной персоне?"
              },
              {
                speaker: "Ника",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "smile" },
                  right: { char: "nika", emotion: "teasing" }
                },
                text: "Пф-ф... Подкупаешь должностное лицо при исполнении за пирожное с кремом? Ладно, давай сюда, всё равно мне премию в этом квартале урезали!"
              }
            ]
          },
          {
            label: "Сыграть на её любопытстве: «В кабинете она намекала, что я у неё особый случай. Или она это всем подряд говорит?»",
            effects: { aff_valeria: 1, inner_sight: 2 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "thoughtful" },
                  right: { char: "nika", emotion: "teasing" }
                },
                text: "В кабинете она мне рассказывала, как ей смертельно скучно с обычными клиентами. Но мне кажется, это просто ваш стандартный приём для обработки упрямых должников, верно?"
              },
              {
                speaker: "Ника",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "thoughtful" },
                  right: { char: "nika", emotion: "surprised" }
                },
                text: "Стандартный приём?! Да ты вообще ничего не понимаешь, Орехов! Если бы ты был обычным клиентом, тобой бы занимался младший делопроизводитель из третьего отдела!"
              }
            ]
          }
        ]
      }
    },
    {
      speaker: "Рассказчик",
      bgm: "The Meeting That Never.mp3",
      sprite: {
        left: { char: "alexander_jacket", emotion: "surprised" },
        right: { char: "nika", emotion: "shy" }
      },
      text: "Ника воровато оглянулась на стеклянную дверь кафе, придвинулась ближе через столик и понизила голос до заговорщицкого шёпота."
    },
    {
      speaker: "Ника",
      sprite: {
        left: { char: "alexander_jacket", emotion: "surprised" },
        right: { char: "nika", emotion: "neutral" }
      },
      text: "Короче, только чур ни слова, что это я тебе сболтнула, иначе она мне хвост в дверях прищемит! Твоё «Дело №0» вообще не должно было попасть к ней на стол. Кассации по сбоям Хранителей — это нудная бумажная волокита, их обычно закрывают штампом по шаблону."
    },
    {
      speaker: "Александр",
      sprite: {
        left: { char: "alexander_jacket", emotion: "thoughtful" },
        right: { char: "nika", emotion: "neutral" }
      },
      text: "И почему тогда пришла лично она?"
    },
    {
      speaker: "Ника",
      sprite: {
        left: { char: "alexander_jacket", emotion: "thoughtful" },
        right: { char: "nika", emotion: "teasing" }
      },
      text: "А вот это главная загадка всей нашей конторы за эту неделю! В ту ночь, когда на Заречном перекрёстке сработал разрыв реестра, Валерия сама забрала твою карточку из диспетчерской и поставила личную визу: «Веду дело единолично»."
    },
    {
      speaker: "Ника",
      sprite: {
        left: { char: "alexander_jacket", emotion: "surprised" },
        right: { char: "nika", emotion: "happy" }
      },
      text: "Она вчера полвечера сидела у камина, перечитывала твоё личное дело и улыбалась так, будто нашла редкую шахматную задачку. Ты её чем-то зацепил, курьер. По-настоящему зацепил. А когда у Валерии просыпается личный азарт — она не отступится, пока не доведёт партию до конца."
    },
    {
      choice: {
        id: "choice_d3_nika_cafe_followup",
        prompt: "Ника спохватывается, что наговорила лишнего, и прикрывает рот ладонью.",
        options: [
          {
            label: "Поблагодарить Нику: «Не переживай, я тебя не выдам. Ты мне уже второй раз здорово помогаешь»",
            effects: { aff_valeria: 1, inner_sight: 1 },
            nodes: [
              {
                speaker: "Александр",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "smile" },
                  right: { char: "nika", emotion: "shy" }
                },
                text: "Могила, Ника. Честное курьерское. Спасибо тебе — ты мне уже второй раз за три дня даёшь самую важную подсказку."
              },
              {
                speaker: "Ника",
                sprite: {
                  left: { char: "alexander_jacket", emotion: "smile" },
                  right: { char: "nika", emotion: "shy" }
                },
                text: "Д-да ничего я тебе не помогаю! Просто вслух рассуждаю за обедом! Всё, допивай свой кофе и кати на смену, пока нас вместе не застукали."
              }
            ]
          },
          {
            label: "Задуматься: «Личный интерес, значит... Тогда тем более нельзя играть по её стандартным правилам»",
            effects: { aff_valeria: 2, inner_sight: 2 },
            nodes: [
              {
                speaker: "Александр",
                thought: true,
                sprite: {
                  left: { char: "alexander_jacket", emotion: "thoughtful" },
                  right: { char: "nika", emotion: "neutral" }
                },
                text: "Вот оно что. Значит, её слова в кабинете про скуку и особую партию не были дешёвой уловкой. Ей действительно интересен сам поединок."
              }
            ]
          }
        ]
      }
    }
  ]
});
