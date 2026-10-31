// ДВИЖОК ВИЗУАЛЬНОЙ НОВЕЛЛЫ «НЕ СМОТРИ НА НЕБО» ($WAG ENTERTAINMENT)
(function () {
  const ASSET_VER = "20261031_11";

  function withVer(url) {
    if (!url) return "";
    return url.includes("?") ? `${url}&v=${ASSET_VER}` : `${url}?v=${ASSET_VER}`;
  }

  const SPRITE_MAP = {
    alexander: (emo) => {
      const alexandrEmos = ["determined_anger", "happy", "sad", "shocked", "shocked_terrified", "shy"];
      if (emo === "serious") return withVer("assets/characters/alexander/transparent/alexandr_determined_anger.png");
      if (alexandrEmos.includes(emo)) {
        return withVer(`assets/characters/alexander/transparent/alexandr_${emo}.png`);
      }
      const valid = ["neutral", "smile", "stressed", "surprised", "thoughtful", "wounded", "courier_rain"];
      const mapped = valid.includes(emo) ? emo : "neutral";
      return withVer(`assets/characters/alexander/transparent/alexander_${mapped}.png`);
    },
    alexander_jacket: (emo) => {
      if (emo === "rain" || emo === "courier_rain") {
        return withVer("assets/characters/alexander/transparent/alexander_courier_rain.png");
      }
      if (emo === "wounded") {
        return withVer("assets/characters/alexander/transparent/alexander_jacket_wounded.png");
      }
      const valid = ["neutral", "smile", "thoughtful", "surprised", "shy", "shocked"];
      const mapped = valid.includes(emo) ? emo : "neutral";
      return withVer(`assets/characters/alexander/transparent/alexander_jacket_${mapped}.png`);
    },
    mirael_angel: (emo) => withVer(`assets/characters/mirael/transparent/mirael_angel_${emo || "neutral"}.png`),
    mirael_human: (emo) => withVer(`assets/characters/mirael/transparent/mirael_human_${emo || "neutral"}.png`),
    valeria: (emo) => withVer(`assets/characters/valeria/transparent/valeria_${emo || "neutral"}.png`),
    valeria_human: (emo) => withVer(`assets/characters/valeria/transparent/valeria_human_${emo || "neutral"}.png`),
    nika: (emo) => {
      const valid = ["happy", "neutral", "sad", "shy", "teasing", "annoyed", "surprised", "bored"];
      const mapped = valid.includes(emo) ? emo : "happy";
      return withVer(`assets/characters/nika_${mapped}.png`);
    },
    lena: (emo) => {
      const valid = ["happy", "neutral", "sad", "snide", "tired"];
      const mapped = valid.includes(emo) ? emo : "tired";
      return withVer(`assets/characters/lena_${mapped}.png`);
    },
    artem: (emo) => {
      const valid = ["empty", "happy", "neutral", "sad"];
      const mapped = valid.includes(emo) ? emo : "neutral";
      return withVer(`assets/characters/artem_shank_${mapped}.png`);
    },
    dmitry: (emo) => {
      const valid = ["neutral", "serious"];
      const mapped = valid.includes(emo) ? emo : "neutral";
      return withVer(`assets/characters/dmitry_${mapped}.png`);
    },
    taya: (emo) => withVer(`assets/characters/taya/transparent/taya_${emo || "neutral"}.png`)
  };

  const SPEAKER_CLASS = {
    "Рассказчик": "narrator",
    "Александр": "alexander",
    "Мираэль": "mirael",
    "Незнакомка": "mirael",
    "Валерия": "valeria",
    "Ника": "nika",
    "Лена": "lena",
    "Артём": "artem",
    "Дмитрий": "dmitry",
    "Тая": "taya"
  };

  const DEFAULT_SETTINGS = {
    bgmVolume: 0.5,
    bgmMuted: false,
    uiSfx: true,
    textSpeed: 3, // 1=Slow, 2=Normal, 3=Fast, 4=Instant
    autoSpeed: 2, // 1=Slow, 2=Normal, 3=Fast
    boxOpacity: 0.92
  };

  let settings = Object.assign({}, DEFAULT_SETTINGS);
  try {
    const savedSet = JSON.parse(localStorage.getItem("nsnn_settings_v1") || "null");
    if (savedSet) settings = Object.assign({}, DEFAULT_SETTINGS, savedSet);
  } catch (e) {}

  const state = {
    chapterIndex: 0,
    nodeIndex: 0,
    runtimeNodes: [],
    activeSprites: { left: null, center: null, right: null },
    currentBg: "",
    currentBgm: "",
    weather: "none",
    camera: "none",
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
    isTyping: false,
    fullText: "",
    typeTimer: null,
    autoMode: false,
    autoTimer: null
  };

  // DOM Elements
  const splashScreen = document.getElementById("splash-screen");
  const titleScreen = document.getElementById("title-screen");
  const bgLayer = document.getElementById("bg-layer");
  const weatherLayer = document.getElementById("weather-layer");
  const flashOverlay = document.getElementById("flash-overlay");
  const slotLeft = document.getElementById("slot-left");
  const slotCenter = document.getElementById("slot-center");
  const slotRight = document.getElementById("slot-right");

  const hudDay = document.getElementById("hud-day");
  const hudTitle = document.getElementById("hud-title");
  const bgmAudio = document.getElementById("bgm-audio");
  const bgmToggle = document.getElementById("bgm-toggle");
  const bgmLabel = document.getElementById("bgm-label");
  const bgmVolume = document.getElementById("bgm-volume");

  const speakerTag = document.getElementById("speaker-tag");
  const dialogueText = document.getElementById("dialogue-text");
  const progressLabel = document.getElementById("progress-label");
  const dialogueBox = document.getElementById("dialogue-box");

  const choiceOverlay = document.getElementById("choice-overlay");
  const choicePrompt = document.getElementById("choice-prompt");
  const choiceList = document.getElementById("choice-list");

  const chaptersModal = document.getElementById("chapters-modal");
  const chaptersModalBody = document.getElementById("chapters-modal-body");
  const logModal = document.getElementById("log-modal");
  const logModalBody = document.getElementById("log-modal-body");
  const savesModal = document.getElementById("saves-modal");
  const savesModalBody = document.getElementById("saves-modal-body");
  const settingsModal = document.getElementById("settings-modal");
  const creditsModal = document.getElementById("credits-modal");

  const btnAuto = document.getElementById("btn-auto");
  const continueBadge = document.getElementById("continue-badge");

  // Preload cache so images never flicker or drop
  const preloadedImages = new Map();
  function preloadImage(url) {
    if (!url || preloadedImages.has(url)) return;
    const im = new Image();
    im.src = url;
    preloadedImages.set(url, im);
  }

  function preloadChapterAssets(ch) {
    if (!ch) return;
    if (ch.bg) preloadImage(withVer(ch.bg));
    function scan(nodes) {
      (nodes || []).forEach((n) => {
        if (n.bg) preloadImage(withVer(n.bg));
        if (n.sprite && typeof n.sprite === "object" && n.sprite.char) {
          const resolver = SPRITE_MAP[n.sprite.char];
          if (resolver) preloadImage(resolver(n.sprite.emotion));
        }
        if (n.choice && n.choice.options) {
          n.choice.options.forEach((o) => {
            if (o.next) scan(o.next);
          });
        }
      });
    }
    scan(ch.nodes);
  }

  // Synthesized subtle UI Sound Effects (Web Audio API)
  let audioCtx = null;
  function playUiSound(type) {
    if (!settings.uiSfx) return;
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      if (type === "hover") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.045);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "click") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.055, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {}
  }

  // Attach hover/click sounds to interactive buttons
  function bindUiSounds(root = document) {
    root.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.sfxBound) return;
      btn.dataset.sfxBound = "1";
      btn.addEventListener("mouseenter", () => playUiSound("hover"));
      btn.addEventListener("click", () => playUiSound("click"));
    });
  }

  // =========================================================
  // SPLASH SCREEN & CANONICAL MENU ENTRANCE + IMMEDIATE MUSIC
  // =========================================================
  let splashDismissed = false;
  function dismissSplash() {
    if (splashDismissed) return;
    splashDismissed = true;
    if (splashScreen) {
      splashScreen.classList.add("hidden");
    }
    if (titleScreen) {
      titleScreen.classList.add("ready");
    }
    if (titleScreen && !titleScreen.classList.contains("hidden")) {
      playBgm("Golden Afternoon Light.mp3");
    }
  }

  if (splashScreen) {
    splashScreen.addEventListener("click", dismissSplash);
    setTimeout(dismissSplash, 3200);
  } else if (titleScreen) {
    titleScreen.classList.add("ready");
  }

  // Global unlock so music starts immediately on page load or very first user interaction
  function unlockAudioOnce() {
    if (settings.bgmMuted) return;
    if (bgmAudio.paused) {
      const target = state.currentBgm || "Golden Afternoon Light.mp3";
      if (!target.startsWith("placeholder:")) {
        playBgm(target);
      }
    }
  }
  ["pointerdown", "mousedown", "keydown", "touchstart", "click"].forEach((evt) => {
    window.addEventListener(evt, unlockAudioOnce, { capture: true, passive: true });
  });

  // Mouse parallax on Main Menu
  if (titleScreen) {
    titleScreen.addEventListener("mousemove", (e) => {
      if (titleScreen.classList.contains("hidden")) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      titleScreen.style.setProperty("--px", `${(nx * -14).toFixed(1)}px`);
      titleScreen.style.setProperty("--py", `${(ny * -10).toFixed(1)}px`);
    });
  }

  // =========================================================
  // MULTI-LAYER MENU FX CANVAS (BOKEH + LEAVES + WIND STREAKS)
  // =========================================================
  function initMenuCanvasFx() {
    const canvas = document.getElementById("menu-leaves-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    // Layer 1: Warm rising/floating bokeh motes
    const motes = Array.from({ length: 42 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.5 + Math.random() * 4.5,
      vx: -0.25 + Math.random() * 0.5,
      vy: -0.15 - Math.random() * 0.45,
      alpha: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2
    }));

    // Layer 2: Falling spinning leaves
    const leaves = Array.from({ length: 34 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 6 + Math.random() * 9,
      speedY: 0.55 + Math.random() * 1.15,
      speedX: -0.45 + Math.random() * 1.1,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.028,
      swayAmp: 0.6 + Math.random() * 1.2,
      swayFreq: 0.01 + Math.random() * 0.018,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.42 ? "rgba(232, 182, 96, 0.58)" : "rgba(186, 128, 68, 0.48)"
    }));

    // Layer 3: Subtle wind light streaks
    const streaks = Array.from({ length: 5 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 90 + Math.random() * 140,
      speed: 2.2 + Math.random() * 2.5,
      alpha: 0.04 + Math.random() * 0.06
    }));

    let tick = 0;
    function drawFrame() {
      if (!titleScreen.classList.contains("hidden")) {
        ctx.clearRect(0, 0, w, h);
        tick += 1;

        // Draw wind streaks
        streaks.forEach((st) => {
          st.x += st.speed;
          st.y += st.speed * 0.18;
          if (st.x > w + st.len) {
            st.x = -st.len;
            st.y = Math.random() * h * 0.85;
          }
          const grad = ctx.createLinearGradient(st.x, st.y, st.x - st.len, st.y - st.len * 0.18);
          grad.addColorStop(0, "rgba(255, 230, 175, 0)");
          grad.addColorStop(0.5, `rgba(255, 230, 175, ${st.alpha})`);
          grad.addColorStop(1, "rgba(255, 230, 175, 0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(st.x, st.y);
          ctx.lineTo(st.x - st.len, st.y - st.len * 0.18);
          ctx.stroke();
        });

        // Draw glowing bokeh motes
        motes.forEach((m) => {
          m.x += m.vx + Math.sin(tick * 0.015 + m.phase) * 0.25;
          m.y += m.vy;
          if (m.y < -15) {
            m.y = h + 15;
            m.x = Math.random() * w;
          }
          if (m.x > w + 15) m.x = -15;
          if (m.x < -15) m.x = w + 15;
          const pulse = 0.65 + 0.35 * Math.sin(tick * 0.03 + m.phase);
          ctx.save();
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 224, 152, ${(m.alpha * pulse).toFixed(3)})`;
          ctx.shadowColor = "rgba(255, 200, 110, 0.8)";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        });

        // Draw falling leaves
        leaves.forEach((lf) => {
          lf.y += lf.speedY;
          lf.x += lf.speedX + Math.sin(tick * lf.swayFreq + lf.phase) * lf.swayAmp;
          lf.angle += lf.spin;
          if (lf.y > h + 25) {
            lf.y = -20;
            lf.x = Math.random() * w;
          }
          if (lf.x > w + 25) lf.x = -20;
          if (lf.x < -25) lf.x = w + 20;

          ctx.save();
          ctx.translate(lf.x, lf.y);
          ctx.rotate(lf.angle);
          ctx.beginPath();
          ctx.moveTo(0, -lf.size);
          ctx.quadraticCurveTo(lf.size * 0.75, 0, 0, lf.size);
          ctx.quadraticCurveTo(-lf.size * 0.75, 0, 0, -lf.size);
          ctx.fillStyle = lf.hue;
          ctx.fill();
          ctx.restore();
        });
      }
      requestAnimationFrame(drawFrame);
    }
    requestAnimationFrame(drawFrame);
  }
  initMenuCanvasFx();

  // =========================================================
  // AUDIO & SETTINGS MANAGEMENT
  // =========================================================
  function saveSettings() {
    try {
      localStorage.setItem("nsnn_settings_v1", JSON.stringify(settings));
    } catch (e) {}
  }

  function applySettingsToDom() {
    document.documentElement.style.setProperty("--dlg-opacity", String(settings.boxOpacity));
    bgmAudio.volume = settings.bgmMuted ? 0 : settings.bgmVolume;
    if (bgmVolume) bgmVolume.value = String(settings.bgmVolume);

    const setBgmVol = document.getElementById("set-bgm-vol");
    const setBgmVolVal = document.getElementById("set-bgm-vol-val");
    const setBgmMute = document.getElementById("set-bgm-mute");
    const setUiSfx = document.getElementById("set-ui-sfx");
    const setTextSpeed = document.getElementById("set-text-speed");
    const setTextSpeedVal = document.getElementById("set-text-speed-val");
    const setAutoSpeed = document.getElementById("set-auto-speed");
    const setAutoSpeedVal = document.getElementById("set-auto-speed-val");
    const setBoxOpacity = document.getElementById("set-box-opacity");
    const setBoxOpacityVal = document.getElementById("set-box-opacity-val");

    if (setBgmVol) setBgmVol.value = String(settings.bgmVolume);
    if (setBgmVolVal) setBgmVolVal.textContent = settings.bgmMuted ? "Выкл" : `${Math.round(settings.bgmVolume * 100)}%`;
    if (setBgmMute) {
      setBgmMute.textContent = settings.bgmMuted ? "Включить звук" : "Выключить звук";
      setBgmMute.classList.toggle("primary", !settings.bgmMuted);
    }
    if (setUiSfx) {
      setUiSfx.textContent = settings.uiSfx ? "Включены" : "Выключены";
      setUiSfx.classList.toggle("primary", !!settings.uiSfx);
    }
    const speedNames = { 1: "Медленно", 2: "Обычная", 3: "Быстро", 4: "Мгновенно" };
    if (setTextSpeed) setTextSpeed.value = String(settings.textSpeed);
    if (setTextSpeedVal) setTextSpeedVal.textContent = speedNames[settings.textSpeed] || "Быстро";

    const autoNames = { 1: "Медленно", 2: "Средне", 3: "Быстро" };
    if (setAutoSpeed) setAutoSpeed.value = String(settings.autoSpeed);
    if (setAutoSpeedVal) setAutoSpeedVal.textContent = autoNames[settings.autoSpeed] || "Средне";

    if (setBoxOpacity) setBoxOpacity.value = String(settings.boxOpacity);
    if (setBoxOpacityVal) setBoxOpacityVal.textContent = `${Math.round(settings.boxOpacity * 100)}%`;
  }

  function playBgm(trackName) {
    if (!trackName) return;
    if (trackName.startsWith("placeholder:")) {
      state.currentBgm = trackName;
      bgmAudio.pause();
      bgmLabel.textContent = `[Заглушка: ${trackName.slice("placeholder:".length)}]`;
      bgmToggle.textContent = "♫ Заглушка";
      return;
    }
    const encoded = withVer(encodeURI(trackName));
    if (state.currentBgm === trackName && !bgmAudio.paused) return;
    state.currentBgm = trackName;
    if (bgmAudio.getAttribute("data-track") !== trackName) {
      bgmAudio.setAttribute("data-track", trackName);
      bgmAudio.src = encoded;
    }
    bgmAudio.volume = settings.bgmMuted ? 0 : settings.bgmVolume;
    bgmLabel.textContent = trackName.replace(".mp3", "");
    bgmAudio.play().then(() => {
      bgmToggle.textContent = settings.bgmMuted ? "♫ Звук выкл" : "♫ Пауза";
    }).catch(() => {
      bgmToggle.textContent = "♫ Вкл. звук";
    });
  }

  bgmToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (bgmAudio.paused) {
      settings.bgmMuted = false;
      bgmAudio.volume = settings.bgmVolume;
      if (!bgmAudio.src && state.currentBgm && !state.currentBgm.startsWith("placeholder:")) {
        bgmAudio.src = withVer(encodeURI(state.currentBgm));
      }
      bgmAudio.play().then(() => {
        bgmToggle.textContent = "♫ Пауза";
      }).catch(() => {});
    } else {
      bgmAudio.pause();
      bgmToggle.textContent = "♫ Вкл. звук";
    }
    applySettingsToDom();
    saveSettings();
  });

  bgmVolume.addEventListener("input", (e) => {
    settings.bgmVolume = parseFloat(e.target.value);
    settings.bgmMuted = settings.bgmVolume === 0;
    applySettingsToDom();
    saveSettings();
  });

  // Bind Settings Modal controls
  function initSettingsControls() {
    const setBgmVol = document.getElementById("set-bgm-vol");
    const setBgmMute = document.getElementById("set-bgm-mute");
    const setUiSfx = document.getElementById("set-ui-sfx");
    const setTextSpeed = document.getElementById("set-text-speed");
    const setAutoSpeed = document.getElementById("set-auto-speed");
    const setBoxOpacity = document.getElementById("set-box-opacity");
    const setFullscreenBtn = document.getElementById("set-fullscreen-btn");
    const setResetBtn = document.getElementById("set-reset-btn");

    if (setBgmVol) {
      setBgmVol.addEventListener("input", (e) => {
        settings.bgmVolume = parseFloat(e.target.value);
        if (settings.bgmVolume > 0) settings.bgmMuted = false;
        applySettingsToDom();
        saveSettings();
      });
    }
    if (setBgmMute) {
      setBgmMute.addEventListener("click", () => {
        settings.bgmMuted = !settings.bgmMuted;
        applySettingsToDom();
        saveSettings();
      });
    }
    if (setUiSfx) {
      setUiSfx.addEventListener("click", () => {
        settings.uiSfx = !settings.uiSfx;
        applySettingsToDom();
        saveSettings();
      });
    }
    if (setTextSpeed) {
      setTextSpeed.addEventListener("input", (e) => {
        settings.textSpeed = parseInt(e.target.value, 10);
        applySettingsToDom();
        saveSettings();
      });
    }
    if (setAutoSpeed) {
      setAutoSpeed.addEventListener("input", (e) => {
        settings.autoSpeed = parseInt(e.target.value, 10);
        applySettingsToDom();
        saveSettings();
      });
    }
    if (setBoxOpacity) {
      setBoxOpacity.addEventListener("input", (e) => {
        settings.boxOpacity = parseFloat(e.target.value);
        applySettingsToDom();
        saveSettings();
      });
    }
    if (setFullscreenBtn) {
      setFullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          setFullscreenBtn.textContent = "Оконный режим";
        } else {
          document.exitFullscreen().catch(() => {});
          setFullscreenBtn.textContent = "На весь экран";
        }
      });
    }
    if (setResetBtn) {
      setResetBtn.addEventListener("click", () => {
        settings = Object.assign({}, DEFAULT_SETTINGS);
        applySettingsToDom();
        saveSettings();
      });
    }
    applySettingsToDom();
  }

  // =========================================================
  // STAGE: BACKGROUNDS, WEATHER, CAMERA & SPRITES
  // =========================================================
  function setBackground(bgPath) {
    if (!bgPath || state.currentBg === bgPath) return;
    state.currentBg = bgPath;
    bgLayer.style.backgroundImage = `url('${withVer(bgPath)}')`;
  }

  function setWeather(mode) {
    state.weather = mode || "none";
    weatherLayer.className = state.weather === "rain" ? "rain" : "";
  }

  function setCamera(mode) {
    state.camera = mode || "none";
    bgLayer.classList.remove("cam-ride", "cam-shake");
    if (mode === "ride") {
      bgLayer.classList.add("cam-ride");
    } else if (mode === "shake") {
      bgLayer.classList.add("cam-shake");
    }
  }

  function triggerFlash() {
    flashOverlay.classList.add("active");
    setTimeout(() => {
      flashOverlay.classList.remove("active");
    }, 110);
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
      if (pos === "center") {
        state.activeSprites.left = null;
        state.activeSprites.right = null;
      } else {
        state.activeSprites.center = null;
      }
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
      "Незнакомка": "mirael",
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
        delete el.dataset.charGroup;
        el.innerHTML = "";
        return;
      }
      el.dataset.charGroup = info.char.split("_")[0];
      const resolver = SPRITE_MAP[info.char];
      const src = resolver ? resolver(info.emotion) : "";
      let img = el.querySelector("img");
      if (!img) {
        img = document.createElement("img");
        img.alt = "";
        img.decoding = "async";
        el.appendChild(img);
      }
      if (img.getAttribute("data-base-src") !== src) {
        img.setAttribute("data-base-src", src);
        img.dataset.retries = "0";
        img.classList.remove("loaded");
        img.onload = () => {
          img.classList.add("loaded");
        };
        img.onerror = () => {
          const retries = parseInt(img.dataset.retries || "0", 10);
          if (retries < 3) {
            img.dataset.retries = String(retries + 1);
            setTimeout(() => {
              img.src = `${src}&retry=${Date.now()}_${retries}`;
            }, 150 * (retries + 1));
          }
        };
        img.src = src;
        if (img.complete && img.naturalWidth > 0) {
          img.classList.add("loaded");
        }
      } else if (img.complete && img.naturalWidth > 0) {
        img.classList.add("loaded");
      }

      el.classList.add("visible");

      if (speakerCharKey && !info.char.startsWith(speakerCharKey)) {
        el.classList.add("dimmed");
      } else {
        el.classList.remove("dimmed");
      }
    });
  }

  // =========================================================
  // CHAPTER & NODE EXECUTION + AUTO-ADVANCE
  // =========================================================
  function loadChapter(index, startNode = 0) {
    const chapters = window.VN_CHAPTERS || [];
    if (index < 0 || index >= chapters.length) return;
    state.chapterIndex = index;
    state.nodeIndex = startNode;
    const ch = chapters[index];
    preloadChapterAssets(ch);
    if (chapters[index + 1]) preloadChapterAssets(chapters[index + 1]);
    state.runtimeNodes = JSON.parse(JSON.stringify(ch.nodes));
    clearSprites();
    setBackground(ch.bg);
    setWeather(ch.weather || "none");
    setCamera(ch.camera || "none");
    playBgm(ch.bgm);
    hudDay.textContent = ch.day;
    hudTitle.textContent = ch.title;
    renderCurrentNode();
    saveAuto();
  }

  function scheduleAutoAdvance() {
    if (state.autoTimer) {
      clearTimeout(state.autoTimer);
      state.autoTimer = null;
    }
    if (!state.autoMode) return;
    if (choiceOverlay.classList.contains("visible")) return;
    if (!titleScreen.classList.contains("hidden")) return;
    const delayMap = { 1: 3600, 2: 2300, 3: 1300 };
    const baseDelay = delayMap[settings.autoSpeed] || 2300;
    state.autoTimer = setTimeout(() => {
      if (state.autoMode && !state.isTyping && !choiceOverlay.classList.contains("visible")) {
        stepForward();
      }
    }, baseDelay);
  }

  function typeText(text, isThought, speaker) {
    if (state.typeTimer) clearInterval(state.typeTimer);
    if (state.autoTimer) clearTimeout(state.autoTimer);

    const spClass = SPEAKER_CLASS[speaker] || "narrator";
    if (isThought) {
      dialogueText.className = "voice-thought";
    } else {
      dialogueText.className = `voice-${spClass}`;
    }

    const formatted = isThought ? `«${text}»` : speaker === "Рассказчик" ? text : `— ${text}`;
    state.fullText = formatted;

    if (settings.textSpeed >= 4) {
      dialogueText.textContent = formatted;
      state.isTyping = false;
      scheduleAutoAdvance();
      return;
    }

    state.isTyping = true;
    dialogueText.textContent = "";
    let idx = 0;
    const stepChars = settings.textSpeed === 3 ? 2 : 1;
    const intervalMs = settings.textSpeed === 1 ? 26 : settings.textSpeed === 2 ? 15 : 10;

    state.typeTimer = setInterval(() => {
      idx += stepChars;
      if (idx >= formatted.length) {
        dialogueText.textContent = formatted;
        clearInterval(state.typeTimer);
        state.isTyping = false;
        scheduleAutoAdvance();
      } else {
        dialogueText.textContent = formatted.slice(0, idx);
      }
    }, intervalMs);
  }

  function finishTyping() {
    if (!state.isTyping) return;
    if (state.typeTimer) clearInterval(state.typeTimer);
    dialogueText.textContent = state.fullText;
    state.isTyping = false;
    scheduleAutoAdvance();
  }

  function renderCurrentNode() {
    const nodes = state.runtimeNodes;
    if (state.nodeIndex >= nodes.length) {
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
    if (node.camera) setCamera(node.camera);
    if (node.effect === "flash") triggerFlash();

    if (node.choice) {
      showChoice(node.choice);
      return;
    }

    choiceOverlay.classList.remove("visible");

    const speaker = node.speaker || "Рассказчик";
    speakerTag.textContent = node.thought ? `${speaker} (мысли)` : speaker;
    speakerTag.className = SPEAKER_CLASS[speaker] || "narrator";

    updateSprites(node.sprite, speaker);
    typeText(node.text || "", !!node.thought, speaker);

    progressLabel.textContent = `Эпизод ${state.chapterIndex + 1}/${window.VN_CHAPTERS.length} · Сцена ${state.nodeIndex + 1}/${nodes.length}`;

    const lastLog = state.backlog[state.backlog.length - 1];
    if (!lastLog || lastLog.text !== node.text) {
      state.backlog.push({
        speaker: node.thought ? `${speaker} (мысли)` : speaker,
        text: node.text
      });
      if (state.backlog.length > 180) state.backlog.shift();
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
      btn.addEventListener("mouseenter", () => playUiSound("hover"));
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        playUiSound("click");
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
    if (!titleScreen.classList.contains("hidden")) return;
    if (state.isTyping) {
      finishTyping();
      return;
    }
    if (state.nodeIndex > 0) {
      state.nodeIndex -= 1;
      for (let i = state.nodeIndex; i >= 0; i--) {
        if (state.runtimeNodes[i].bg) {
          setBackground(state.runtimeNodes[i].bg);
          break;
        }
      }
      renderCurrentNode();
    } else if (state.chapterIndex > 0) {
      const prevCh = window.VN_CHAPTERS[state.chapterIndex - 1];
      loadChapter(state.chapterIndex - 1, Math.max(0, prevCh.nodes.length - 1));
    }
  }

  function showEndOfPartModal() {
    choicePrompt.textContent = "Конец Первой Части (Пролог: День 0 и Акт I: День 1)";
    choiceList.innerHTML = "";

    const summary = document.createElement("div");
    summary.style.cssText = "color: var(--text-main); font-family: var(--font-serif); line-height: 1.65; margin-bottom: 16px; font-size: 16px;";
    summary.innerHTML = `
      <p>Вы завершили прохождение <strong>Части I (День 0 и День 1)</strong> визуальной новеллы «Не смотри на небо».</p>
      <p style="margin-top:10px; color: var(--accent-gold);">
        Симпатия Мираэль: ${state.stats.aff_mirael} · Интерес Валерии: ${state.stats.aff_valeria} · Доверие Лены: ${state.stats.aff_lena} · Связь с Таей: ${state.stats.aff_taya} · Внутреннее зрение: ${state.stats.inner_sight}
      </p>
    `;
    choiceList.appendChild(summary);

    const restartBtn = document.createElement("button");
    restartBtn.className = "choice-option-btn";
    restartBtn.textContent = "1. Вернуться в главное меню";
    restartBtn.addEventListener("click", () => {
      choiceOverlay.classList.remove("visible");
      openTitleScreen();
    });

    const chaptersBtn = document.createElement("button");
    chaptersBtn.className = "choice-option-btn";
    chaptersBtn.textContent = "2. Открыть выбор эпизода";
    chaptersBtn.addEventListener("click", () => {
      choiceOverlay.classList.remove("visible");
      openChaptersModal();
    });

    choiceList.appendChild(restartBtn);
    choiceList.appendChild(chaptersBtn);
    choiceOverlay.classList.add("visible");
  }

  function openTitleScreen() {
    state.autoMode = false;
    if (btnAuto) btnAuto.classList.remove("active");
    if (state.autoTimer) clearTimeout(state.autoTimer);
    updateContinueBadge();
    titleScreen.classList.remove("hidden");
    titleScreen.classList.add("ready");
    playBgm("Golden Afternoon Light.mp3");
  }

  // =========================================================
  // SAVES & LOCAL STORAGE
  // =========================================================
  function createSaveSnapshot(label) {
    const ch = window.VN_CHAPTERS[state.chapterIndex];
    const currentNode = state.runtimeNodes[state.nodeIndex] || {};
    return {
      label,
      timestamp: new Date().toLocaleString("ru-RU"),
      chapterIndex: state.chapterIndex,
      chapterTitle: ch ? `${ch.day} — ${ch.title}` : "Глава",
      chapterShort: ch ? ch.day : "ДЕНЬ 0",
      nodeIndex: state.nodeIndex,
      previewText: currentNode.text ? currentNode.text.slice(0, 75) + "..." : "",
      runtimeNodes: state.runtimeNodes,
      currentBg: state.currentBg,
      currentBgm: state.currentBgm,
      weather: state.weather,
      camera: state.camera,
      stats: state.stats,
      choicesMade: state.choicesMade
    };
  }

  function saveAuto() {
    try {
      localStorage.setItem("nsnn_autosave_v1", JSON.stringify(createSaveSnapshot("Автосохранение")));
      updateContinueBadge();
    } catch (e) {}
  }

  function getSaves() {
    try {
      return JSON.parse(localStorage.getItem("nsnn_saves_v1") || "{}");
    } catch (e) {
      return {};
    }
  }

  function updateContinueBadge() {
    if (!continueBadge) return;
    try {
      const autoRaw = localStorage.getItem("nsnn_autosave_v1");
      if (autoRaw) {
        const snap = JSON.parse(autoRaw);
        continueBadge.textContent = `${snap.chapterShort || "ДЕНЬ 0"} · Сц. ${(snap.nodeIndex || 0) + 1}`;
        return;
      }
      const saves = getSaves();
      const firstKey = Object.keys(saves)[0];
      if (firstKey && saves[firstKey]) {
        const snap = saves[firstKey];
        continueBadge.textContent = `${snap.chapterShort || "ДЕНЬ 0"} · Сц. ${(snap.nodeIndex || 0) + 1}`;
        return;
      }
      continueBadge.textContent = "";
    } catch (e) {
      continueBadge.textContent = "";
    }
  }

  function saveToSlot(slotId) {
    const saves = getSaves();
    saves[slotId] = createSaveSnapshot(`Слот ${slotId}`);
    localStorage.setItem("nsnn_saves_v1", JSON.stringify(saves));
    updateContinueBadge();
    renderSavesModal();
  }

  function loadSnapshot(snap) {
    if (!snap) return;
    state.chapterIndex = snap.chapterIndex || 0;
    state.nodeIndex = snap.nodeIndex || 0;
    const ch = window.VN_CHAPTERS[state.chapterIndex];
    preloadChapterAssets(ch);
    state.runtimeNodes = snap.runtimeNodes || JSON.parse(JSON.stringify(ch.nodes));
    state.stats = snap.stats || state.stats;
    state.choicesMade = snap.choicesMade || {};
    clearSprites();
    setBackground(snap.currentBg || ch.bg);
    setWeather(snap.weather || ch.weather || "none");
    setCamera(snap.camera || ch.camera || "none");
    playBgm(snap.currentBgm || ch.bgm);
    hudDay.textContent = ch.day;
    hudTitle.textContent = ch.title;
    titleScreen.classList.add("hidden");
    savesModal.classList.remove("visible");
    renderCurrentNode();
  }

  // =========================================================
  // MODALS RENDERING
  // =========================================================
  function openChaptersModal() {
    chaptersModalBody.innerHTML = "";
    (window.VN_CHAPTERS || []).forEach((ch, idx) => {
      const card = document.createElement("div");
      card.className = "chapter-card" + (idx === state.chapterIndex ? " active" : "");
      card.innerHTML = `
        <div>
          <div class="chapter-card-day">${ch.day}</div>
          <div class="chapter-card-title">${ch.title}</div>
          <div class="chapter-card-sub">${ch.subtitle || ""}</div>
        </div>
        <div class="save-action-btn primary">Запустить →</div>
      `;
      card.addEventListener("mouseenter", () => playUiSound("hover"));
      card.addEventListener("click", () => {
        playUiSound("click");
        chaptersModal.classList.remove("visible");
        titleScreen.classList.add("hidden");
        loadChapter(idx, 0);
      });
      chaptersModalBody.appendChild(card);
    });
    chaptersModal.classList.add("visible");
  }

  function openLogModal() {
    logModalBody.innerHTML = "";
    if (state.backlog.length === 0) {
      logModalBody.innerHTML = `<div style="color: var(--text-muted);">Журнал пока пуст.</div>`;
    } else {
      state.backlog.forEach((item) => {
        const row = document.createElement("div");
        row.className = "log-entry";
        row.innerHTML = `
          <div class="log-speaker">${item.speaker}</div>
          <div class="log-text">${item.text}</div>
        `;
        logModalBody.appendChild(row);
      });
    }
    logModal.classList.add("visible");
    logModalBody.scrollTop = logModalBody.scrollHeight;
  }

  function renderSavesModal() {
    savesModalBody.innerHTML = "";
    const inGame = titleScreen.classList.contains("hidden");
    const autoRaw = localStorage.getItem("nsnn_autosave_v1");
    if (autoRaw) {
      try {
        const autoSnap = JSON.parse(autoRaw);
        const autoEl = document.createElement("div");
        autoEl.className = "save-slot";
        autoEl.innerHTML = `
          <div>
            <div class="chapter-card-day">АВТОСОХРАНЕНИЕ · ${autoSnap.timestamp}</div>
            <div class="chapter-card-title">${autoSnap.chapterTitle}</div>
            <div class="chapter-card-sub">Сцена ${autoSnap.nodeIndex + 1} ${autoSnap.previewText ? "· «" + autoSnap.previewText + "»" : ""}</div>
          </div>
          <div class="save-slot-actions">
            <button class="save-action-btn primary" data-load-auto="1">Загрузить</button>
          </div>
        `;
        autoEl.querySelector("[data-load-auto]").addEventListener("click", () => loadSnapshot(autoSnap));
        savesModalBody.appendChild(autoEl);
      } catch (e) {}
    }

    const saves = getSaves();
    for (let slot = 1; slot <= 6; slot++) {
      const snap = saves[slot];
      const slotEl = document.createElement("div");
      slotEl.className = "save-slot";
      slotEl.innerHTML = `
        <div>
          <div class="chapter-card-day">СЛОТ #${slot} ${snap ? "· " + snap.timestamp : "· Пусто"}</div>
          <div class="chapter-card-title">${snap ? snap.chapterTitle : "Свободная ячейка сохранения"}</div>
          <div class="chapter-card-sub">${snap ? "Сцена " + (snap.nodeIndex + 1) + (snap.previewText ? " · «" + snap.previewText + "»" : "") : (inGame ? "Нажмите «Сохранить», чтобы записать текущий момент" : "Запустите игру, чтобы сделать запись в этот слот")}</div>
        </div>
        <div class="save-slot-actions">
          ${inGame ? `<button class="save-action-btn" data-save="${slot}">${snap ? "Перезаписать" : "Сохранить"}</button>` : ""}
          ${snap ? `<button class="save-action-btn primary" data-load="${slot}">Загрузить</button>` : ""}
          ${snap ? `<button class="save-action-btn" data-del="${slot}">✕</button>` : ""}
        </div>
      `;
      const saveBtn = slotEl.querySelector(`[data-save="${slot}"]`);
      if (saveBtn) saveBtn.addEventListener("click", () => saveToSlot(slot));
      const loadBtn = slotEl.querySelector(`[data-load="${slot}"]`);
      if (loadBtn) loadBtn.addEventListener("click", () => loadSnapshot(snap));
      const delBtn = slotEl.querySelector(`[data-del="${slot}"]`);
      if (delBtn) {
        delBtn.addEventListener("click", () => {
          const all = getSaves();
          delete all[slot];
          localStorage.setItem("nsnn_saves_v1", JSON.stringify(all));
          updateContinueBadge();
          renderSavesModal();
        });
      }
      savesModalBody.appendChild(slotEl);
    }
    bindUiSounds(savesModalBody);
  }

  function openSavesModal() {
    renderSavesModal();
    savesModal.classList.add("visible");
  }

  function openSettingsModal() {
    applySettingsToDom();
    settingsModal.classList.add("visible");
  }

  function openCreditsModal() {
    creditsModal.classList.add("visible");
  }

  // =========================================================
  // EVENT LISTENERS
  // =========================================================
  dialogueBox.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    stepForward();
  });

  document.getElementById("btn-next").addEventListener("click", (e) => {
    e.stopPropagation();
    stepForward();
  });

  document.getElementById("btn-prev").addEventListener("click", (e) => {
    e.stopPropagation();
    stepBackward();
  });

  if (btnAuto) {
    btnAuto.addEventListener("click", () => {
      state.autoMode = !state.autoMode;
      btnAuto.classList.toggle("active", state.autoMode);
      if (state.autoMode && !state.isTyping) {
        scheduleAutoAdvance();
      } else if (!state.autoMode && state.autoTimer) {
        clearTimeout(state.autoTimer);
      }
    });
  }

  document.getElementById("btn-chapters").addEventListener("click", openChaptersModal);
  document.getElementById("btn-log").addEventListener("click", openLogModal);
  document.getElementById("btn-saves").addEventListener("click", openSavesModal);
  document.getElementById("btn-settings").addEventListener("click", openSettingsModal);
  document.getElementById("btn-menu").addEventListener("click", openTitleScreen);

  document.getElementById("title-start-btn").addEventListener("click", () => {
    titleScreen.classList.add("hidden");
    loadChapter(0, 0);
  });

  document.getElementById("title-continue-btn").addEventListener("click", () => {
    const autoRaw = localStorage.getItem("nsnn_autosave_v1");
    if (autoRaw) {
      try {
        loadSnapshot(JSON.parse(autoRaw));
        return;
      } catch (e) {}
    }
    const saves = getSaves();
    const firstKey = Object.keys(saves)[0];
    if (firstKey && saves[firstKey]) {
      loadSnapshot(saves[firstKey]);
      return;
    }
    titleScreen.classList.add("hidden");
    loadChapter(0, 0);
  });

  document.getElementById("title-saves-btn").addEventListener("click", openSavesModal);
  document.getElementById("title-chapters-btn").addEventListener("click", openChaptersModal);
  document.getElementById("title-settings-btn").addEventListener("click", openSettingsModal);
  document.getElementById("title-credits-btn").addEventListener("click", openCreditsModal);

  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".modal-backdrop").classList.remove("visible");
    });
  });

  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.remove("visible");
    });
  });

  window.addEventListener("keydown", (e) => {
    const anyModal = document.querySelector(".modal-backdrop.visible");
    if (e.key === "Escape") {
      if (anyModal) {
        anyModal.classList.remove("visible");
      } else if (titleScreen.classList.contains("hidden")) {
        openSettingsModal();
      }
      return;
    }
    if (anyModal) return;
    if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      stepForward();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepBackward();
    }
  });

  // =========================================================
  // INITIALIZATION
  // =========================================================
  function init() {
    initSettingsControls();
    bindUiSounds(document);
    updateContinueBadge();
    if (window.VN_CHAPTERS && window.VN_CHAPTERS.length > 0) {
      setBackground(window.VN_CHAPTERS[0].bg);
      preloadChapterAssets(window.VN_CHAPTERS[0]);
    }
    // Start menu music immediately
    playBgm("Golden Afternoon Light.mp3");
  }

  init();
})();
