// ДВИЖОК ВИЗУАЛЬНОЙ НОВЕЛЛЫ «НЕ СМОТРИ НА НЕБО»
(function () {
  const SPRITE_MAP = {
    alexander: (emo) => {
      const alexandrEmos = ["determined_anger", "happy", "sad", "shocked", "shocked_terrified", "shy"];
      if (emo === "serious") return "assets/characters/alexander/transparent/alexandr_determined_anger.png";
      if (alexandrEmos.includes(emo)) {
        return `assets/characters/alexander/transparent/alexandr_${emo}.png`;
      }
      return `assets/characters/alexander/transparent/alexander_${emo || "neutral"}.png`;
    },
    mirael_angel: (emo) => `assets/characters/mirael/transparent/mirael_angel_${emo || "neutral"}.png`,
    mirael_human: (emo) => `assets/characters/mirael/transparent/mirael_human_${emo || "neutral"}.png`,
    valeria: (emo) => `assets/characters/valeria/transparent/valeria_${emo || "neutral"}.png`,
    valeria_human: (emo) => `assets/characters/valeria/transparent/valeria_human_${emo || "neutral"}.png`,
    nika: (emo) => {
      const valid = ["happy", "neutral", "sad", "shy"];
      const mapped = valid.includes(emo) ? emo : "happy";
      return `assets/characters/nika_${mapped}.png`;
    },
    lena: (emo) => {
      const valid = ["happy", "neutral", "sad", "snide", "tired"];
      const mapped = valid.includes(emo) ? emo : "tired";
      return `assets/characters/lena_${mapped}.png`;
    },
    artem: (emo) => {
      const valid = ["empty", "happy", "neutral", "sad"];
      const mapped = valid.includes(emo) ? emo : "neutral";
      return `assets/characters/artem_shank_${mapped}.png`;
    },
    dmitry: (emo) => {
      const valid = ["neutral", "serious"];
      const mapped = valid.includes(emo) ? emo : "neutral";
      return `assets/characters/dmitry_${mapped}.png`;
    },
    taya: (emo) => `assets/characters/taya/transparent/taya_${emo || "neutral"}.png`
  };

  const SPEAKER_CLASS = {
    "Рассказчик": "narrator",
    "Александр": "alexander",
    "Мираэль": "mirael",
    "Валерия": "valeria",
    "Ника": "nika",
    "Лена": "lena",
    "Артём": "artem",
    "Дмитрий": "dmitry",
    "Тая": "taya"
  };

  const state = {
    chapterIndex: 0,
    nodeIndex: 0,
    runtimeNodes: [],
    activeSprites: { left: null, center: null, right: null },
    currentBg: "",
    currentBgm: "",
    weather: "none",
    stats: {
      aff_mirael: 0,
      aff_valeria: 0,
      aff_lena: 0,
      aff_taya: 0,
      inner_sight: 0,
      glitch_count: 0
    },
    choicesMade: {},
    backlog: [],
    autoPlay: false,
    isTyping: false,
    fullText: "",
    typeTimer: null
  };

  // DOM Elements
  const titleScreen = document.getElementById("title-screen");
  const bgLayer = document.getElementById("bg-layer");
  const weatherLayer = document.getElementById("weather-layer");
  const flashOverlay = document.getElementById("flash-overlay");
  const slotLeft = document.getElementById("slot-left");
  const slotCenter = document.getElementById("slot-center");
  const slotRight = document.getElementById("slot-right");
  const hudDay = document.getElementById("hud-day");
  const hudTitle = document.getElementById("hud-title");
  const speakerTag = document.getElementById("speaker-tag");
  const dialogueText = document.getElementById("dialogue-text");
  const progressLabel = document.getElementById("progress-label");
  const choiceOverlay = document.getElementById("choice-overlay");
  const choicePrompt = document.getElementById("choice-prompt");
  const choiceList = document.getElementById("choice-list");
  const bgmAudio = document.getElementById("bgm-audio");
  const bgmLabel = document.getElementById("bgm-label");
  const bgmVolume = document.getElementById("bgm-volume");
  const bgmToggle = document.getElementById("bgm-toggle");

  function countChapterWords(ch) {
    let total = 0;
    function scan(nodes) {
      nodes.forEach((n) => {
        if (n.text) total += n.text.trim().split(/\s+/).length;
        if (n.choice && n.choice.options) {
          n.choice.options.forEach((o) => {
            if (o.label) total += o.label.trim().split(/\s+/).length;
            if (o.next) scan(o.next);
          });
        }
      });
    }
    scan(ch.nodes || []);
    return total;
  }

  function playBgm(trackName) {
    if (!trackName) return;
    if (state.currentBgm === trackName && !bgmAudio.paused) return;
    state.currentBgm = trackName;
    bgmAudio.src = encodeURI(trackName);
    bgmAudio.volume = parseFloat(bgmVolume.value || "0.45");
    bgmLabel.textContent = trackName.replace(".mp3", "");
    bgmAudio.play().then(() => {
      bgmToggle.textContent = "♫ Пауза";
    }).catch(() => {
      bgmToggle.textContent = "♫ Вкл. звук";
    });
  }

  bgmToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (bgmAudio.paused) {
      if (!bgmAudio.src && state.currentBgm) {
        bgmAudio.src = encodeURI(state.currentBgm);
      }
      bgmAudio.play().then(() => {
        bgmToggle.textContent = "♫ Пауза";
      }).catch(() => {});
    } else {
      bgmAudio.pause();
      bgmToggle.textContent = "♫ Вкл. звук";
    }
  });

  bgmVolume.addEventListener("input", (e) => {
    bgmAudio.volume = parseFloat(e.target.value);
  });

  function setBackground(bgPath) {
    if (!bgPath || state.currentBg === bgPath) return;
    state.currentBg = bgPath;
    bgLayer.style.backgroundImage = `url('${bgPath}')`;
  }

  function setWeather(mode) {
    state.weather = mode || "none";
    weatherLayer.className = state.weather === "rain" ? "rain" : "";
  }

  function triggerFlash() {
    flashOverlay.classList.add("active");
    setTimeout(() => {
      flashOverlay.classList.remove("active");
    }, 90);
  }

  function clearSprites() {
    state.activeSprites = { left: null, center: null, right: null };
    [slotLeft, slotCenter, slotRight].forEach((el) => {
      el.classList.remove("visible", "dimmed");
      el.innerHTML = "";
    });
  }

  function updateSprites(spriteSpec, speakerName) {
    if (spriteSpec === "clear") {
      clearSprites();
      return;
    }
    if (spriteSpec && spriteSpec.char) {
      const pos = spriteSpec.pos || "center";
      // If placing in center, clear left/right to avoid overlap; if placing left/right, clear center
      if (pos === "center") {
        state.activeSprites.left = null;
        state.activeSprites.right = null;
      } else {
        state.activeSprites.center = null;
      }
      // Remove same character from other slots
      ["left", "center", "right"].forEach((slotKey) => {
        if (
          slotKey !== pos &&
          state.activeSprites[slotKey] &&
          state.activeSprites[slotKey].char.split("_")[0] === spriteSpec.char.split("_")[0]
        ) {
          state.activeSprites[slotKey] = null;
        }
      });
      state.activeSprites[pos] = {
        char: spriteSpec.char,
        emotion: spriteSpec.emotion || "neutral"
      };
    }

    const slotMap = { left: slotLeft, center: slotCenter, right: slotRight };
    const speakerCharKey = {
      "Александр": "alexander",
      "Мираэль": "mirael",
      "Валерия": "valeria",
      "Ника": "nika",
      "Лена": "lena",
      "Артём": "artem",
      "Дмитрий": "dmitry",
      "Тая": "taya"
    }[speakerName];

    ["left", "center", "right"].forEach((pos) => {
      const el = slotMap[pos];
      const info = state.activeSprites[pos];
      if (!info) {
        el.classList.remove("visible", "dimmed");
        el.innerHTML = "";
        return;
      }
      const resolver = SPRITE_MAP[info.char];
      const src = resolver ? resolver(info.emotion) : "";
      let img = el.querySelector("img");
      if (!img) {
        img = document.createElement("img");
        el.appendChild(img);
      }
      if (img.getAttribute("src") !== src) {
        img.setAttribute("src", src);
      }
      img.alt = info.char;
      el.classList.add("visible");

      if (speakerCharKey && !info.char.startsWith(speakerCharKey)) {
        el.classList.add("dimmed");
      } else {
        el.classList.remove("dimmed");
      }
    });
  }

  function loadChapter(index, startNode = 0) {
    const chapters = window.VN_CHAPTERS || [];
    if (index < 0 || index >= chapters.length) return;
    state.chapterIndex = index;
    state.nodeIndex = startNode;
    const ch = chapters[index];
    state.runtimeNodes = JSON.parse(JSON.stringify(ch.nodes));
    clearSprites();
    setBackground(ch.bg);
    setWeather(ch.weather || "none");
    playBgm(ch.bgm);
    hudDay.textContent = ch.day;
    hudTitle.textContent = ch.title;
    renderCurrentNode();
    saveAuto();
  }

  function typeText(text, isThought, isNarrator) {
    if (state.typeTimer) clearInterval(state.typeTimer);
    state.fullText = text;
    state.isTyping = true;
    dialogueText.className = isThought
      ? "thought-text"
      : isNarrator
      ? "narrator-text"
      : "";

    const formatted = isThought ? `«${text}»` : text;
    state.fullText = formatted;
    dialogueText.textContent = "";
    let idx = 0;
    state.typeTimer = setInterval(() => {
      idx += 2;
      if (idx >= formatted.length) {
        dialogueText.textContent = formatted;
        clearInterval(state.typeTimer);
        state.isTyping = false;
      } else {
        dialogueText.textContent = formatted.slice(0, idx);
      }
    }, 12);
  }

  function finishTyping() {
    if (!state.isTyping) return;
    if (state.typeTimer) clearInterval(state.typeTimer);
    dialogueText.textContent = state.fullText;
    state.isTyping = false;
  }

  function renderCurrentNode() {
    const nodes = state.runtimeNodes;
    if (state.nodeIndex >= nodes.length) {
      // Move to next chapter if available
      if (state.chapterIndex + 1 < window.VN_CHAPTERS.length) {
        loadChapter(state.chapterIndex + 1, 0);
      } else {
        showEndOfPartModal();
      }
      return;
    }

    const node = nodes[state.nodeIndex];
    if (node.bg) setBackground(node.bg);
    if (node.bgm) playBgm(node.bgm);
    if (node.weather) setWeather(node.weather);
    if (node.effect === "flash") triggerFlash();

    if (node.choice) {
      showChoice(node.choice);
      return;
    }

    choiceOverlay.classList.remove("visible");

    const speaker = node.speaker || "Рассказчик";
    speakerTag.textContent = node.thought ? `${speaker} (мысли)` : speaker;
    speakerTag.className = SPEAKER_CLASS[speaker] || "";

    updateSprites(node.sprite, speaker);
    typeText(node.text || "", !!node.thought, speaker === "Рассказчик");

    progressLabel.textContent = `Эпизод ${state.chapterIndex + 1}/${window.VN_CHAPTERS.length} · Сцена ${state.nodeIndex + 1}/${nodes.length}`;

    // Record in backlog
    const lastLog = state.backlog[state.backlog.length - 1];
    if (!lastLog || lastLog.text !== node.text) {
      state.backlog.push({
        speaker: node.thought ? `${speaker} (мысли)` : speaker,
        text: node.text
      });
      if (state.backlog.length > 160) state.backlog.shift();
    }
    saveAuto();
  }

  function showChoice(choiceObj) {
    choicePrompt.textContent = choiceObj.prompt || "Сделайте выбор:";
    choiceList.innerHTML = "";
    choiceObj.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "choice-option-btn";
      btn.textContent = `${idx + 1}. ${opt.label}`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (opt.effects) {
          Object.entries(opt.effects).forEach(([k, v]) => {
            state.stats[k] = (state.stats[k] || 0) + v;
          });
        }
        state.choicesMade[choiceObj.id] = idx;
        choiceOverlay.classList.remove("visible");
        if (Array.isArray(opt.next) && opt.next.length > 0) {
          state.runtimeNodes.splice(state.nodeIndex, 1, ...opt.next);
        } else {
          state.nodeIndex += 1;
        }
        renderCurrentNode();
      });
      choiceList.appendChild(btn);
    });
    choiceOverlay.classList.add("visible");
  }

  function stepForward() {
    if (choiceOverlay.classList.contains("visible")) return;
    if (!titleScreen.classList.contains("hidden")) return;
    if (state.isTyping) {
      finishTyping();
      return;
    }
    state.nodeIndex += 1;
    renderCurrentNode();
  }

  function stepBackward() {
    if (choiceOverlay.classList.contains("visible")) return;
    if (state.nodeIndex > 0) {
      state.nodeIndex -= 1;
      renderCurrentNode();
    } else if (state.chapterIndex > 0) {
      const prevIdx = state.chapterIndex - 1;
      const prevLen = window.VN_CHAPTERS[prevIdx].nodes.length;
      loadChapter(prevIdx, Math.max(0, prevLen - 1));
    }
  }

  function saveAuto() {
    try {
      localStorage.setItem(
        "vn_sky_autosave",
        JSON.stringify({
          chapterIndex: state.chapterIndex,
          nodeIndex: state.nodeIndex,
          stats: state.stats,
          choicesMade: state.choicesMade,
          timestamp: new Date().toLocaleString("ru-RU")
        })
      );
    } catch (_) {}
  }

  function saveManualSlot(slotNum) {
    try {
      const ch = window.VN_CHAPTERS[state.chapterIndex];
      localStorage.setItem(
        `vn_sky_slot_${slotNum}`,
        JSON.stringify({
          chapterIndex: state.chapterIndex,
          nodeIndex: state.nodeIndex,
          chapterTitle: `${ch.day} — ${ch.title}`,
          stats: state.stats,
          choicesMade: state.choicesMade,
          timestamp: new Date().toLocaleString("ru-RU")
        })
      );
      renderSavesModal();
    } catch (_) {}
  }

  function loadFromData(data) {
    if (!data) return;
    state.stats = data.stats || state.stats;
    state.choicesMade = data.choicesMade || {};
    titleScreen.classList.add("hidden");
    closeAllModals();
    loadChapter(data.chapterIndex || 0, data.nodeIndex || 0);
  }

  // Modals
  function closeAllModals() {
    document.querySelectorAll(".modal-backdrop").forEach((m) => m.classList.remove("open"));
  }

  function openChaptersModal() {
    const container = document.getElementById("chapters-modal-body");
    container.innerHTML = "";
    let grandTotalWords = 0;
    const chapters = window.VN_CHAPTERS || [];
    chapters.forEach((ch) => {
      grandTotalWords += countChapterWords(ch);
    });

    const summary = document.createElement("div");
    summary.style.cssText = "padding: 10px 14px; background: rgba(216,185,121,0.1); border: 1px solid rgba(216,185,121,0.3); border-radius: 8px; font-size: 13.5px; color: #e8dec8;";
    summary.innerHTML = `Доступно глав в текущей сборке: <strong>${chapters.length}</strong> (Пролог: День 0 + Акт I: День 1) · Объём готового текста первой части: <strong>${grandTotalWords.toLocaleString("ru-RU")} слов</strong>`;
    container.appendChild(summary);

    chapters.forEach((ch, idx) => {
      const words = countChapterWords(ch);
      const card = document.createElement("div");
      card.className = "chapter-card";
      card.innerHTML = `
        <div>
          <div class="chapter-card-day">${ch.day}</div>
          <div class="chapter-card-title">${ch.title}</div>
          <div class="chapter-card-sub">${ch.subtitle || ""}</div>
        </div>
        <div style="text-align:right; min-width: 110px;">
          <div style="font-size:12px; color: var(--gold-accent);">${words} слов</div>
          <div style="font-size:11px; color: var(--text-muted); margin-top:4px;">Перейти →</div>
        </div>
      `;
      card.addEventListener("click", () => {
        titleScreen.classList.add("hidden");
        closeAllModals();
        loadChapter(idx, 0);
      });
      container.appendChild(card);
    });

    document.getElementById("chapters-modal").classList.add("open");
  }

  function openLogModal() {
    const container = document.getElementById("log-modal-body");
    container.innerHTML = "";
    if (state.backlog.length === 0) {
      container.innerHTML = `<div style="color:var(--text-muted);">История реплик пока пуста.</div>`;
    } else {
      state.backlog.forEach((item) => {
        const div = document.createElement("div");
        div.className = "log-entry";
        div.innerHTML = `<div class="log-speaker">${item.speaker}</div><div>${item.text}</div>`;
        container.appendChild(div);
      });
    }
    document.getElementById("log-modal").classList.add("open");
    container.scrollTop = container.scrollHeight;
  }

  function renderSavesModal() {
    const container = document.getElementById("saves-modal-body");
    container.innerHTML = "";
    for (let slot = 1; slot <= 4; slot++) {
      let raw = null;
      try {
        raw = JSON.parse(localStorage.getItem(`vn_sky_slot_${slot}`));
      } catch (_) {}
      const card = document.createElement("div");
      card.className = "chapter-card";
      card.innerHTML = `
        <div>
          <div class="chapter-card-day">СЛОТ СОХРАНЕНИЯ #${slot}</div>
          <div class="chapter-card-title">${raw ? raw.chapterTitle : "Пустой слот"}</div>
          <div class="chapter-card-sub">${raw ? `Сохранено: ${raw.timestamp} (сцена ${raw.nodeIndex + 1})` : "Нажмите «Сохранить», чтобы записать текущий прогресс"}</div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="hud-btn" data-save="${slot}">Сохранить</button>
          ${raw ? `<button class="hud-btn" data-load="${slot}">Загрузить</button>` : ""}
        </div>
      `;
      card.querySelector(`[data-save="${slot}"]`).addEventListener("click", (e) => {
        e.stopPropagation();
        saveManualSlot(slot);
      });
      const loadBtn = card.querySelector(`[data-load="${slot}"]`);
      if (loadBtn) {
        loadBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          loadFromData(raw);
        });
      }
      container.appendChild(card);
    }
    document.getElementById("saves-modal").classList.add("open");
  }

  function showEndOfPartModal() {
    const container = document.getElementById("chapters-modal-body");
    openChaptersModal();
    const banner = document.createElement("div");
    banner.style.cssText = "padding: 16px; background: rgba(138, 196, 255, 0.14); border: 1px solid #8ac4ff; border-radius: 10px; margin-bottom: 8px;";
    banner.innerHTML = `
      <div style="font-weight:700; color:#fff; margin-bottom:6px;">Конец Первой части (Пролог: День 0 + Акт I: День 1)</div>
      <div style="font-size:13.5px; color:#d9e7f7; line-height:1.5;">
        Параметры вашего прохождения: Мираэль (${state.stats.aff_mirael}), Валерия (${state.stats.aff_valeria}), Лена (${state.stats.aff_lena}), Тая (${state.stats.aff_taya}), Внутренний взгляд (${state.stats.inner_sight}).
        Вы можете переиграть любую главу из списка ниже или продолжить создание Событий 2–4 Первой недели.
      </div>
    `;
    container.prepend(banner);
  }

  // Event Bindings
  document.getElementById("dialogue-wrapper").addEventListener("click", stepForward);
  document.getElementById("btn-next").addEventListener("click", (e) => {
    e.stopPropagation();
    stepForward();
  });
  document.getElementById("btn-prev").addEventListener("click", (e) => {
    e.stopPropagation();
    stepBackward();
  });

  document.getElementById("btn-chapters").addEventListener("click", (e) => {
    e.stopPropagation();
    openChaptersModal();
  });
  document.getElementById("btn-log").addEventListener("click", (e) => {
    e.stopPropagation();
    openLogModal();
  });
  document.getElementById("btn-saves").addEventListener("click", (e) => {
    e.stopPropagation();
    renderSavesModal();
  });
  document.getElementById("btn-menu").addEventListener("click", (e) => {
    e.stopPropagation();
    titleScreen.classList.remove("hidden");
    playBgm("Golden Afternoon Light.mp3");
  });

  // Title Screen Buttons
  document.getElementById("title-start-btn").addEventListener("click", () => {
    titleScreen.classList.add("hidden");
    loadChapter(0, 0);
  });

  document.getElementById("title-continue-btn").addEventListener("click", () => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem("vn_sky_autosave"));
    } catch (_) {}
    if (saved) {
      loadFromData(saved);
    } else {
      titleScreen.classList.add("hidden");
      loadChapter(0, 0);
    }
  });

  document.getElementById("title-chapters-btn").addEventListener("click", () => {
    openChaptersModal();
  });

  document.getElementById("title-saves-btn").addEventListener("click", () => {
    renderSavesModal();
  });

  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", closeAllModals);
  });

  window.addEventListener("keydown", (e) => {
    if (document.querySelector(".modal-backdrop.open")) {
      if (e.key === "Escape") closeAllModals();
      return;
    }
    if (!titleScreen.classList.contains("hidden")) return;
    if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      stepForward();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepBackward();
    }
  });

  // Initialize Title Screen music on first interaction
  window.addEventListener("DOMContentLoaded", () => {
    bgmLabel.textContent = "Golden Afternoon Light";
    state.currentBgm = "Golden Afternoon Light.mp3";
  });
})();
