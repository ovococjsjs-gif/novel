// ДВИЖОК ВИЗУАЛЬНОЙ НОВЕЛЛЫ «НЕ СМОТРИ НА НЕБО» ($WAG ENTERTAINMENT)
(function () {
  const ASSET_VER = "20261102_50";

  function withVer(url) {
    if (!url) return "";
    return url.includes("?") ? `${url}&v=${ASSET_VER}` : `${url}?v=${ASSET_VER}`;
  }

  const Core = window.VNCore;
  const Cfg = window.VNConfig;
  const DEV = /[?&]dev=1(?:&|$)/.test(location.search);
  const META_KEY = "nsnn_meta_v1";
  const AUTO_KEY = "nsnn_autosave_v2";
  const SLOTS_KEY = "nsnn_saves_v2";
  const HISTORY_LIMIT = 300;

  function spriteSrc(char, emotion) {
    const r = Cfg.resolveSprite(char, emotion);
    if (!r.exact && DEV) console.warn(`[VN] нет спрайта ${char}:${emotion}, показан запасной`);
    return r.path ? withVer(r.path) : "";
  }

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
    chapterId: null,
    pc: 0,
    vars: {},
    choicesMade: {},
    history: [],
    activeSprites: { left: null, center: null, right: null },
    currentBg: "",
    currentBgm: "",
    weather: "none",
    camera: "none",
    backlog: [],
    isTyping: false,
    fullText: "",
    typeTimer: null,
    autoMode: false,
    autoTimer: null,
    entry: null // { chapterId, vars, choicesMade } — состояние на входе в текущую главу (для версий сохранений)
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
  const preloadedImages = new Set();
  const preloadQueue = [];
  let preloadBusy = false;
  let preloadTimer = null;

  function pumpPreloadQueue() {
    if (preloadBusy || preloadQueue.length === 0) return;
    const url = preloadQueue.shift();
    if (!url || preloadedImages.has(url)) {
      pumpPreloadQueue();
      return;
    }
    preloadBusy = true;
    preloadedImages.add(url);
    const im = new Image();
    const next = () => {
      preloadBusy = false;
      setTimeout(pumpPreloadQueue, 40);
    };
    im.onload = next;
    im.onerror = next;
    im.src = url;
  }

  function preloadImage(url) {
    if (!url || preloadedImages.has(url)) return;
    preloadQueue.push(url);
  }

  function preloadChapterAssets(ch) {
    if (!ch) return;
    // Clear pending low-priority preloads from previous chapter so they never clog sockets
    preloadQueue.length = 0;
    if (preloadTimer) clearTimeout(preloadTimer);

    if (ch.bg) preloadImage(withVer(Cfg.resolveBg(ch.bg)));
    function preloadSpriteObj(sp) {
      if (!sp || typeof sp !== "object") return;
      if (sp.char) preloadImage(spriteSrc(sp.char, sp.emotion));
      ["left", "center", "right"].forEach((k) => {
        if (sp[k] && sp[k].char) preloadImage(spriteSrc(sp[k].char, sp[k].emotion));
      });
    }
    const comp = compiled(ch.id);
    (comp ? comp.code : []).forEach((ins) => {
      const n = ins.node || ins.env;
      if (!n) return;
      if (n.bg) preloadImage(withVer(Cfg.resolveBg(n.bg)));
      if (n.sprite) preloadSpriteObj(n.sprite);
    });
    // Музыка: текущая и следующая глава грузятся в память заранее,
    // чтобы трек начинал играть сразу, а не после буферизации через сеть.
    const tracks = [ch.bgm];
    (comp ? comp.code : []).forEach((ins) => {
      const n = ins.node || ins.env;
      if (n && n.bgm) tracks.push(n.bgm);
    });
    const nextCh = allChapters()[chapterIndexById(ch.id) + 1];
    if (nextCh) {
      tracks.push(nextCh.bgm);
      const nc = compiled(nextCh.id);
      (nc ? nc.code : []).forEach((ins) => {
        const n = ins.node || ins.env;
        if (n && n.bgm) tracks.push(n.bgm);
      });
    }
    prefetchBgm(tracks);
    // Start sequential background preloading after active BGM & first-frame sprites have loaded
    preloadTimer = setTimeout(pumpPreloadQueue, 700);
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
      splashScreen.classList.add("leaving");
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
    document.addEventListener("keydown", function onSplashKey(e) {
      if (splashDismissed) return document.removeEventListener("keydown", onSplashKey);
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") dismissSplash();
    });
    setTimeout(dismissSplash, 5600);
  } else if (titleScreen) {
    titleScreen.classList.add("ready");
  }

  // Global unlock so music starts immediately on page load or very first user interaction
  let audioUnlocked = false;
  let userPausedBgm = false;
  const unlockEvents = ["pointerdown", "keydown", "touchstart", "click"];
  function unlockAudioOnce(e) {
    if (audioUnlocked || settings.bgmMuted || userPausedBgm) return;
    if (!splashDismissed) return; // во время заставки музыку меню не запускаем
    if (
      e &&
      e.target &&
      e.target.closest &&
      e.target.closest("#bgm-toggle, #title-start-btn, #title-continue-btn, .chapter-card, [data-load], [data-load-auto]")
    ) {
      return;
    }
    if (bgmAudio.paused) {
      const target = state.currentBgm || "Golden Afternoon Light.mp3";
      if (!target.startsWith("placeholder:")) {
        playBgm(target);
      }
    }
  }
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, unlockAudioOnce, { capture: true, passive: true });
  });
  bgmAudio.addEventListener("playing", () => {
    if (!audioUnlocked) {
      audioUnlocked = true;
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, unlockAudioOnce, { capture: true });
      });
    }
    bgmToggle.textContent = settings.bgmMuted ? "♫ Звук выкл" : "♫ Пауза";
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

  let bgmRetryTimer = null;

  // ---------- Предзагрузка треков в память ----------
  // Все треки лежат в music/; в сценарии пишем только имя файла.
  const BGM_DIR = "music/";
  const bgmBlobUrls = {};
  const bgmPrefetching = new Set();
  const bgmPrefetchQueue = [];
  let bgmPrefetchBusy = false;
  function prefetchBgm(list) {
    (list || []).forEach((t) => {
      if (!t || t.startsWith("placeholder:") || bgmBlobUrls[t] || bgmPrefetching.has(t)) return;
      bgmPrefetching.add(t);
      bgmPrefetchQueue.push(t);
    });
    pumpBgmPrefetch();
  }
  function pumpBgmPrefetch() {
    if (bgmPrefetchBusy) return;
    const t = bgmPrefetchQueue.shift();
    if (!t) return;
    bgmPrefetchBusy = true;
    fetch(withVer(encodeURI(BGM_DIR + t)))
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => {
        bgmBlobUrls[t] = URL.createObjectURL(b);
      })
      .catch(() => {
        bgmPrefetching.delete(t);
      })
      .finally(() => {
        bgmPrefetchBusy = false;
        pumpBgmPrefetch();
      });
  }
  function bgmUrl(t) {
    return bgmBlobUrls[t] || withVer(encodeURI(BGM_DIR + t));
  }

  // ---------- Плавная громкость ----------
  let bgmFadeTimer = null;
  function fadeBgm(to, ms, done) {
    if (bgmFadeTimer) clearInterval(bgmFadeTimer);
    const from = bgmAudio.volume;
    const t0 = performance.now();
    bgmFadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      bgmAudio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k >= 1) {
        clearInterval(bgmFadeTimer);
        bgmFadeTimer = null;
        if (done) done();
      }
    }, 30);
  }

  function tryPlayCurrentBgm() {
    if (userPausedBgm || settings.bgmMuted) return;
    if (!state.currentBgm || state.currentBgm.startsWith("placeholder:")) return;
    if (!bgmAudio.paused) return;
    bgmAudio.volume = 0;
    bgmAudio.play().then(() => {
      fadeBgm(settings.bgmMuted ? 0 : settings.bgmVolume, 900);
      audioUnlocked = true;
      bgmToggle.textContent = settings.bgmMuted ? "♫ Звук выкл" : "♫ Пауза";
    }).catch((err) => {
      if (err && err.name === "AbortError") {
        if (bgmRetryTimer) clearTimeout(bgmRetryTimer);
        bgmRetryTimer = setTimeout(tryPlayCurrentBgm, 140);
      } else {
        bgmToggle.textContent = "♫ Вкл. звук";
      }
    });
  }

  ["canplay", "canplaythrough", "loadeddata"].forEach((evName) => {
    bgmAudio.addEventListener(evName, () => {
      if (!userPausedBgm && !settings.bgmMuted && bgmAudio.paused && state.currentBgm && !state.currentBgm.startsWith("placeholder:")) {
        tryPlayCurrentBgm();
      }
    });
  });

  function playBgm(trackName) {
    if (!trackName) return;
    if (bgmRetryTimer) {
      clearTimeout(bgmRetryTimer);
      bgmRetryTimer = null;
    }
    if (trackName.startsWith("placeholder:")) {
      state.currentBgm = trackName;
      bgmAudio.pause();
      bgmLabel.textContent = `[Заглушка: ${trackName.slice("placeholder:".length)}]`;
      bgmToggle.textContent = "♫ Заглушка";
      return;
    }
    const currentTrackAttr = bgmAudio.getAttribute("data-track");
    if (state.currentBgm === trackName && currentTrackAttr === trackName && !bgmAudio.paused) {
      return;
    }
    state.currentBgm = trackName;
    bgmLabel.textContent = trackName.replace(".mp3", "");
    prefetchBgm([trackName]);
    if (currentTrackAttr !== trackName) {
      const token = ++bgmSwitchToken;
      const doSwitch = () => {
        if (token !== bgmSwitchToken) return;
        bgmAudio.pause();
        bgmAudio.setAttribute("data-track", trackName);
        bgmAudio.src = bgmUrl(trackName);
        bgmAudio.load();
        if (!userPausedBgm) tryPlayCurrentBgm();
      };
      if (!bgmAudio.paused && bgmAudio.volume > 0.01) {
        fadeBgm(0, 500, doSwitch);
      } else {
        doSwitch();
      }
      return;
    }
    if (!userPausedBgm) {
      tryPlayCurrentBgm();
    }
  }
  let bgmSwitchToken = 0;

  bgmToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (bgmAudio.paused) {
      userPausedBgm = false;
      settings.bgmMuted = false;
      bgmAudio.volume = settings.bgmVolume;
      if (!bgmAudio.src && state.currentBgm && !state.currentBgm.startsWith("placeholder:")) {
        bgmAudio.setAttribute("data-track", state.currentBgm);
        bgmAudio.src = bgmUrl(state.currentBgm);
        bgmAudio.load();
      }
      tryPlayCurrentBgm();
    } else {
      userPausedBgm = true;
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
    bgPath = Cfg.resolveBg(bgPath);
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

  // Плавное исчезновение: сначала гасим opacity (CSS-переход), потом чистим слот.
  const SPRITE_FADE_MS = 450;
  const SPRITE_XFADE_MS = 380;
  function hideSlot(el) {
    el.classList.remove("visible", "dimmed");
    const token = (el._hideToken = (el._hideToken || 0) + 1);
    setTimeout(() => {
      if (el._hideToken === token && !el.classList.contains("visible")) {
        el.innerHTML = "";
        delete el.dataset.charGroup;
      }
    }, SPRITE_FADE_MS);
  }

  function clearSprites() {
    state.activeSprites = { left: null, center: null, right: null };
    [slotLeft, slotCenter, slotRight].forEach(hideSlot);
  }

  function updateSprites(spriteSpec, speakerName) {
    if (spriteSpec === "clear") {
      clearSprites();
      return;
    }
    if (spriteSpec && typeof spriteSpec === "object") {
      if (spriteSpec.left || spriteSpec.center || spriteSpec.right) {
        if (spriteSpec.center && spriteSpec.center.char) {
          state.activeSprites.left = null;
          state.activeSprites.right = null;
          state.activeSprites.center = {
            char: spriteSpec.center.char,
            emotion: spriteSpec.center.emotion || "neutral"
          };
        } else {
          state.activeSprites.center = null;
          if (spriteSpec.left === "clear" || spriteSpec.left === null) {
            state.activeSprites.left = null;
          } else if (spriteSpec.left && spriteSpec.left.char) {
            state.activeSprites.left = {
              char: spriteSpec.left.char,
              emotion: spriteSpec.left.emotion || "neutral"
            };
          }
          if (spriteSpec.right === "clear" || spriteSpec.right === null) {
            state.activeSprites.right = null;
          } else if (spriteSpec.right && spriteSpec.right.char) {
            state.activeSprites.right = {
              char: spriteSpec.right.char,
              emotion: spriteSpec.right.emotion || "neutral"
            };
          }
        }
      } else if (spriteSpec.char) {
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
    }

    const slotMap = { left: slotLeft, center: slotCenter, right: slotRight };
    const speakerCharKey = speakerName ? (Cfg.SPEAKERS[speakerName] || {}).char : null;

    ["left", "center", "right"].forEach((pos) => {
      const el = slotMap[pos];
      const info = state.activeSprites[pos];
      if (!info) {
        if (el.classList.contains("visible")) hideSlot(el);
        return;
      }
      el._hideToken = (el._hideToken || 0) + 1; // отменяем отложенную очистку
      const group = info.char.split("_")[0];
      const src = spriteSrc(info.char, info.emotion);
      let img = el.querySelector("img");
      if (img && img.getAttribute("src") && img.getAttribute("data-base-src") !== src) {
        // Смена эмоции/персонажа в занятом слоте: грузим новую картинку заранее
        // и подменяем, когда она готова, — без мигания пустым слотом.
        img.setAttribute("data-base-src", src);
        const pre = new Image();
        const swap = () => {
          if (img.getAttribute("data-base-src") !== src) return;
          // Перетекание: старая картинка остаётся поверх «призраком» и гаснет,
          // новая проявляется под ней.
          const oldRect = img.getBoundingClientRect();
          const hadPicture = img.classList.contains("loaded") && oldRect.width > 0;
          const ghost = hadPicture ? img.cloneNode(false) : null;
          el.dataset.charGroup = group;
          img.classList.remove("loaded");
          img.src = src;
          if (ghost) {
            el.querySelectorAll(".sprite-ghost").forEach((g) => g.remove());
            ghost.className = "sprite-ghost";
            ghost.removeAttribute("data-base-src");
            el.appendChild(ghost);
            const slotRect = el.getBoundingClientRect();
            const scale = el.offsetWidth ? slotRect.width / el.offsetWidth : 1;
            ghost.style.left = `${(oldRect.left - slotRect.left) / scale}px`;
            ghost.style.top = `${(oldRect.top - slotRect.top) / scale}px`;
            ghost.style.width = `${oldRect.width / scale}px`;
            ghost.style.height = `${oldRect.height / scale}px`;
          }
          void img.offsetWidth;
          requestAnimationFrame(() => {
            img.classList.add("loaded");
            if (ghost) ghost.style.opacity = "0";
          });
          if (ghost) setTimeout(() => ghost.remove(), SPRITE_XFADE_MS + 80);
        };
        pre.onload = swap;
        pre.onerror = swap;
        pre.src = src;
      }
      if (!img) {
        img = document.createElement("img");
        img.alt = "";
        img.decoding = "async";
        el.appendChild(img);
      }
      if (!img.getAttribute("src")) el.dataset.charGroup = group;
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
  // SCRIPT RUNTIME
  // Глава компилируется в плоский список инструкций (vn-core.js).
  // Позиция игрока = (chapterId, pc). «Назад» и сохранения работают
  // через снимки состояния (frames), которые кладутся перед каждой репликой и выбором.
  // =========================================================
  const compiledCache = {};

  function allChapters() {
    return window.VN_CHAPTERS || [];
  }
  function chapterById(id) {
    return allChapters().find((c) => c.id === id) || null;
  }
  function chapterIndexById(id) {
    return allChapters().findIndex((c) => c.id === id);
  }
  // Отпечаток главы: если текст главы поменялся после сохранения, pc в сейве может указывать
  // не туда. Тогда загрузка начинает главу заново с переменными на входе в неё.
  const hashCache = {};
  function chapterHash(id) {
    if (hashCache[id] === undefined) {
      const ch = chapterById(id);
      const src = ch ? JSON.stringify(ch) : "";
      let h = 0x811c9dc5;
      for (let i = 0; i < src.length; i++) {
        h ^= src.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
      }
      hashCache[id] = h.toString(36);
    }
    return hashCache[id];
  }

  function compiled(id) {
    if (!compiledCache[id]) {
      const ch = chapterById(id);
      if (!ch) return null;
      const c = Core.compileChapter(ch);
      if (c.problems.length) console.warn(`[VN] ${id}: проблемы компиляции`, c.problems);
      compiledCache[id] = c;
    }
    return compiledCache[id];
  }

  function defaultVars() {
    const out = {};
    const reg = window.VN_VARS || {};
    Object.keys(reg).forEach((k) => {
      out[k] = reg[k].default !== undefined ? reg[k].default : 0;
    });
    return out;
  }

  // ---------- Мета-прогресс (между прохождениями) ----------
  function loadMeta() {
    const empty = { endings: {}, flags: {}, seen: {} };
    try {
      return Object.assign(empty, JSON.parse(localStorage.getItem(META_KEY) || "{}"));
    } catch (e) {
      return empty;
    }
  }
  let meta = loadMeta();
  function saveMeta() {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch (e) {}
  }

  const warnedVars = new Set();
  function getVar(name) {
    if (name.startsWith("meta.")) {
      const k = name.slice(5);
      return meta.flags[k] || (meta.endings[k] ? 1 : 0);
    }
    if (name.startsWith("thr.")) {
      return (window.VN_THRESHOLDS || {})[name.slice(4)] || 0;
    }
    if (name.startsWith("calc.")) {
      const r = Core.routeCalc((n) => getVar(n), window.VN_THRESHOLDS || {});
      return r[name.slice(5)] || 0;
    }
    if (DEV && !(name in (window.VN_VARS || {})) && !warnedVars.has(name)) {
      warnedVars.add(name);
      console.warn(`[VN] переменная «${name}» не описана в script/_registry.js`);
    }
    return state.vars[name];
  }

  function checkCond(cond, where) {
    try {
      return Core.evalCond(cond, getVar);
    } catch (e) {
      console.error(`[VN] ошибка условия (${where}):`, e.message);
      return false;
    }
  }

  function applyEffects(effects, set) {
    if (effects) {
      Object.entries(effects).forEach(([k, v]) => {
        state.vars[k] = (Number(state.vars[k]) || 0) + Number(v);
      });
    }
    if (set) {
      Object.entries(set).forEach(([k, v]) => {
        state.vars[k] = v;
      });
    }
  }

  // ---------- Снимки состояния ----------
  function captureFrame() {
    return {
      chapterId: state.chapterId,
      pc: state.pc,
      vars: Object.assign({}, state.vars),
      choicesMade: Object.assign({}, state.choicesMade),
      env: { bg: state.currentBg, bgm: state.currentBgm, weather: state.weather, camera: state.camera },
      sprites: JSON.parse(JSON.stringify(state.activeSprites)),
      backlogLen: state.backlog.length
    };
  }

  function pushHistory() {
    state.history.push(captureFrame());
    if (state.history.length > HISTORY_LIMIT) state.history.shift();
  }

  function setHud(ch) {
    hudDay.textContent = ch.day || "";
    hudTitle.textContent = ch.title || "";
  }

  function restoreFrame(f) {
    const ch = chapterById(f.chapterId);
    if (!ch) return false;
    state.chapterId = f.chapterId;
    state.pc = f.pc;
    state.vars = Object.assign(defaultVars(), f.vars || {});
    state.choicesMade = Object.assign({}, f.choicesMade || {});
    const env = f.env || {};
    setBackground(env.bg || Cfg.resolveBg(ch.bg));
    setWeather(env.weather || "none");
    setCamera(env.camera || "none");
    playBgm(env.bgm || ch.bgm);
    state.activeSprites = JSON.parse(JSON.stringify(f.sprites || { left: null, center: null, right: null }));
    updateSprites(undefined, null);
    if (typeof f.backlogLen === "number" && state.backlog.length > f.backlogLen) {
      state.backlog.length = Math.max(0, f.backlogLen);
    }
    setHud(ch);
    return true;
  }

  function resetRun(vars, choicesMade) {
    state.vars = Object.assign(defaultVars(), vars || {});
    state.choicesMade = Object.assign({}, choicesMade || {});
    state.history = [];
    state.backlog = [];
    choiceOverlay.classList.remove("visible");
    clearSprites();
  }

  // ---------- Исполнение ----------
  function applyEnv(n) {
    if (n.bg) setBackground(Cfg.resolveBg(n.bg));
    if (n.bgm) playBgm(n.bgm);
    if (n.weather) setWeather(n.weather);
    if (n.camera) setCamera(n.camera);
    if (n.effect === "flash") triggerFlash();
  }

  function enterChapter(id, pc = 0) {
    const ch = chapterById(id);
    if (!ch) {
      console.error(`[VN] нет главы «${id}»`);
      showEndOfPartModal();
      return;
    }
    state.chapterId = id;
    state.pc = pc;
    if (pc === 0) {
      clearSprites();
      setBackground(Cfg.resolveBg(ch.bg));
      setWeather(ch.weather || "none");
      setCamera(ch.camera || "none");
      playBgm(ch.bgm);
      meta.seen[id] = {
        vars: Object.assign({}, state.vars),
        choicesMade: Object.assign({}, state.choicesMade),
        at: Date.now()
      };
      saveMeta();
      state.entry = { chapterId: id, vars: Object.assign({}, state.vars), choicesMade: Object.assign({}, state.choicesMade) };
    }
    setHud(ch);
    preloadChapterAssets(ch);
    run();
  }

  function resolveJump(to) {
    let chId = state.chapterId;
    let label = to;
    if (to.includes("#")) {
      [chId, label] = to.split("#");
      if (!chId) chId = state.chapterId;
    } else {
      const here = compiled(state.chapterId);
      if (here && here.labels[to] !== undefined) return { chapterId: state.chapterId, pc: here.labels[to] };
      if (chapterById(to)) return { chapterId: to, pc: 0 };
      return null;
    }
    const comp = compiled(chId);
    if (!comp) return null;
    if (!label) return { chapterId: chId, pc: 0 };
    if (comp.labels[label] === undefined) return null;
    return { chapterId: chId, pc: comp.labels[label] };
  }

  function run() {
    let guard = 0;
    for (;;) {
      if (++guard > 10000) {
        console.error(`[VN] бесконечный цикл в ${state.chapterId} около pc=${state.pc}`);
        return;
      }
      const comp = compiled(state.chapterId);
      if (!comp) return;
      if (state.pc >= comp.code.length) {
        const ch = chapterById(state.chapterId);
        const nextId = Core.resolveChapterNext(ch, allChapters(), getVar);
        if (nextId) enterChapter(nextId);
        else {
          pushHistory();
          showEndOfPartModal();
        }
        return;
      }
      const ins = comp.code[state.pc];
      switch (ins.op) {
        case "set":
          applyEffects(ins.effects, ins.set);
          state.pc += 1;
          break;
        case "branch":
          state.pc = checkCond(ins.cond, `${state.chapterId} ${ins.path}`) ? state.pc + 1 : ins.target;
          break;
        case "goto":
          state.pc = ins.target;
          break;
        case "jump": {
          const r = resolveJump(ins.to);
          if (!r) {
            console.error(`[VN] переход «${ins.to}» не найден (${state.chapterId} ${ins.path})`);
            state.pc += 1;
            break;
          }
          if (r.chapterId !== state.chapterId) {
            enterChapter(r.chapterId, r.pc);
            return;
          }
          state.pc = r.pc;
          break;
        }
        case "env":
          applyEnv(ins.node);
          if (ins.node.sprite !== undefined) updateSprites(ins.node.sprite, null);
          state.pc += 1;
          break;
        case "say":
          pushHistory();
          renderSay(ins.node, comp);
          return;
        case "choice":
          pushHistory();
          if (ins.env) {
            applyEnv(ins.env);
            if (ins.env.sprite !== undefined) updateSprites(ins.env.sprite, null);
          }
          showChoice(ins);
          return;
        case "ending":
          pushHistory();
          showEnding(ins.ending);
          return;
        default:
          state.pc += 1;
      }
    }
  }

  function updateProgress(comp) {
    const idx = chapterIndexById(state.chapterId);
    const total = allChapters().length;
    const pct = comp && comp.code.length ? Math.round((state.pc / comp.code.length) * 100) : 0;
    progressLabel.textContent = `Эпизод ${idx + 1}/${total} · ${pct}%`;
  }

  function renderSay(node, comp) {
    choiceOverlay.classList.remove("visible");
    applyEnv(node);
    const speaker = node.speaker || "Рассказчик";
    const spCls = (Cfg.SPEAKERS[speaker] || {}).cls || "narrator";
    speakerTag.textContent = node.thought ? `${speaker} (мысли)` : speaker;
    speakerTag.className = spCls;
    updateSprites(node.sprite, speaker);
    typeText(node.text || "", !!node.thought, speaker);
    updateProgress(comp);
    state.backlog.push({ speaker: node.thought ? `${speaker} (мысли)` : speaker, text: node.text || "" });
    updateDevPanel();
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

    const spClass = (Cfg.SPEAKERS[speaker] || {}).cls || "narrator";
    dialogueText.className = isThought ? "voice-thought" : `voice-${spClass}`;

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

  function describeEffects(o) {
    const parts = [];
    if (o.effects) Object.entries(o.effects).forEach(([k, v]) => parts.push(`${k} ${v > 0 ? "+" : ""}${v}`));
    if (o.set) Object.entries(o.set).forEach(([k, v]) => parts.push(`${k} = ${v}`));
    if (o.if !== undefined) parts.push(`если ${typeof o.if === "string" ? o.if : JSON.stringify(o.if)}`);
    return parts.join(", ");
  }

  function showChoice(ins) {
    choicePrompt.textContent = ins.choice.prompt || "Что сделать?";
    choiceList.innerHTML = "";
    let shown = ins.options
      .map((o, idx) => ({ o, idx }))
      .filter(({ o }) => o.if === undefined || checkCond(o.if, `${state.chapterId} ${ins.path}`));
    if (!shown.length) {
      console.error(`[VN] у выбора ${ins.choice.id} не осталось доступных вариантов — показываю все`);
      shown = ins.options.map((o, idx) => ({ o, idx }));
    }
    shown.forEach(({ o, idx }, n) => {
      const btn = document.createElement("button");
      btn.className = "choice-option-btn";
      btn.textContent = `${n + 1}. ${o.label}`;
      btn.dataset.choiceKey = String(n + 1);
      if (DEV) {
        const fx = describeEffects(o);
        if (fx) {
          const small = document.createElement("span");
          small.className = "dev-choice-fx";
          small.textContent = fx;
          btn.appendChild(small);
        }
      }
      btn.addEventListener("mouseenter", () => playUiSound("hover"));
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        playUiSound("click");
        applyEffects(o.effects, o.set);
        if (ins.choice.id) state.choicesMade[ins.choice.id] = idx;
        choiceOverlay.classList.remove("visible");
        state.pc = o.target;
        run();
      });
      choiceList.appendChild(btn);
    });
    choiceOverlay.classList.add("visible");
    updateDevPanel();
    saveAuto();
  }

  function stepForward() {
    if (choiceOverlay.classList.contains("visible")) return;
    if (!titleScreen.classList.contains("hidden")) return;
    if (state.isTyping) {
      finishTyping();
      return;
    }
    const comp = compiled(state.chapterId);
    const ins = comp && comp.code[state.pc];
    if (!ins || ins.op !== "say") return;
    state.pc += 1;
    run();
  }

  function stepBackward() {
    if (!titleScreen.classList.contains("hidden")) return;
    if (state.isTyping) {
      finishTyping();
      return;
    }
    if (state.history.length < 2) return;
    state.history.pop();
    const prev = state.history.pop();
    choiceOverlay.classList.remove("visible");
    if (restoreFrame(prev)) run();
  }

  function overlayButton(label, onClick) {
    const b = document.createElement("button");
    b.className = "choice-option-btn";
    b.textContent = label;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      choiceOverlay.classList.remove("visible");
      onClick();
    });
    return b;
  }

  function statsLine() {
    const v = state.vars;
    return `Мираэль ${v.aff_mirael} · Валерия ${v.aff_valeria} · Лена ${v.aff_lena} · Тая ${v.aff_taya} · Взгляд внутрь ${v.inner_sight} · Сбои ${v.glitch_count}`;
  }

  function showEnding(ending) {
    const e = ending || {};
    if (e.id) {
      meta.endings[e.id] = Date.now();
      meta.flags[`cleared_${e.id}`] = 1;
      saveMeta();
    }
    choicePrompt.textContent = e.title || "Конец";
    choiceList.innerHTML = "";
    const box = document.createElement("div");
    box.className = "end-summary";
    if (e.text) {
      const p = document.createElement("p");
      p.textContent = e.text;
      box.appendChild(p);
    }
    if (DEV) {
      const s = document.createElement("p");
      s.className = "end-stats";
      s.textContent = `[dev] концовка ${e.id || "?"} · ${statsLine()}`;
      box.appendChild(s);
    }
    choiceList.appendChild(box);
    choiceList.appendChild(overlayButton("1. В главное меню", openTitleScreen));
    choiceOverlay.classList.add("visible");
    updateDevPanel();
    saveAuto();
  }

  function showEndOfPartModal() {
    const last = chapterById(state.chapterId) || {};
    const cfg = window.VN_META || {};
    choicePrompt.textContent = cfg.partEndTitle || "Продолжение следует";
    choiceList.innerHTML = "";
    const box = document.createElement("div");
    box.className = "end-summary";
    const p = document.createElement("p");
    p.textContent = cfg.partEndText || `Здесь пока заканчивается написанная часть истории. Вы остановились на главе «${last.title || ""}» (${last.day || ""}).`;
    box.appendChild(p);
    const routeName = (window.VN_ROUTE_NAMES || {})[state.vars.route];
    if (routeName) {
      const r = document.createElement("p");
      r.textContent = `Ваш маршрут: ${routeName}. Он пишется — сохранение уже ведёт туда.`;
      box.appendChild(r);
    }
    if (DEV) {
      const s = document.createElement("p");
      s.className = "end-stats";
      s.textContent = `[dev] ${statsLine()}`;
      box.appendChild(s);
    }
    choiceList.appendChild(box);
    choiceList.appendChild(overlayButton("1. В главное меню", openTitleScreen));
    choiceList.appendChild(overlayButton("2. Выбрать эпизод", openChaptersModal));
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
  // DEV MODE (?dev=1)
  // =========================================================
  let devPanel = null;
  function updateDevPanel() {
    if (!DEV) return;
    if (!devPanel) {
      devPanel = document.createElement("div");
      devPanel.id = "dev-panel";
      document.body.appendChild(devPanel);
    }
    const comp = compiled(state.chapterId);
    const ins = comp && comp.code[state.pc];
    const defs = defaultVars();
    const rows = Object.keys(state.vars)
      .map((k) => {
        const changed = state.vars[k] !== defs[k];
        return `<span class="${changed ? "dev-changed" : ""}">${k}=${state.vars[k]}</span>`;
      })
      .join(" ");
    const endings = Object.keys(meta.endings).join(", ") || "—";
    devPanel.innerHTML = `
      <div><b>${state.chapterId}</b> · pc ${state.pc}/${comp ? comp.code.length : "?"} · ${ins ? ins.op + " " + ins.path : ""}</div>
      <div>${rows}</div>
      <div>концовки: ${endings} · история: ${state.history.length}</div>
      <div class="dev-actions"><button data-dev="meta">сбросить мету</button></div>`;
    devPanel.querySelector('[data-dev="meta"]').onclick = (e) => {
      e.stopPropagation();
      if (confirm("Сбросить мета-прогресс (концовки, открытые эпизоды)?")) {
        meta = { endings: {}, flags: {}, seen: {} };
        saveMeta();
        updateDevPanel();
      }
    };
  }

  // =========================================================
  // SAVES & LOCAL STORAGE
  // =========================================================
  function createSaveSnapshot(label) {
    const top = state.history[state.history.length - 1] || captureFrame();
    const ch = chapterById(top.chapterId);
    const comp = compiled(top.chapterId);
    const ins = comp && comp.code[top.pc];
    let preview = "";
    if (ins && ins.op === "say") preview = ins.node.text || "";
    else if (ins && ins.op === "choice") preview = ins.choice.prompt || "Выбор";
    const backlog = state.backlog.slice(-150);
    const base = state.backlog.length - backlog.length;
    const history = state.history.slice(-40).map((f) => Object.assign({}, f, { backlogLen: Math.max(0, f.backlogLen - base) }));
    let entry = state.entry && state.entry.chapterId === top.chapterId ? state.entry : null;
    if (!entry && meta.seen[top.chapterId]) entry = Object.assign({ chapterId: top.chapterId }, meta.seen[top.chapterId]);
    return {
      v: 2,
      chHash: chapterHash(top.chapterId),
      entry: entry ? { vars: entry.vars, choicesMade: entry.choicesMade } : null,
      label,
      timestamp: new Date().toLocaleString("ru-RU"),
      chapterId: top.chapterId,
      chapterTitle: ch ? `${ch.day} — ${ch.title}` : "Глава",
      chapterShort: ch ? ch.day : "",
      previewText: preview ? preview.slice(0, 75) + (preview.length > 75 ? "…" : "") : "",
      frame: Object.assign({}, top, { backlogLen: Math.max(0, top.backlogLen - base) }),
      history,
      backlog
    };
  }

  function saveAuto() {
    if (!state.chapterId) return;
    try {
      localStorage.setItem(AUTO_KEY, JSON.stringify(createSaveSnapshot("Автосохранение")));
      updateContinueBadge();
    } catch (e) {}
  }

  function getSaves() {
    try {
      return JSON.parse(localStorage.getItem(SLOTS_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function getAutosave() {
    try {
      const snap = JSON.parse(localStorage.getItem(AUTO_KEY) || "null");
      return snap && snap.v === 2 && chapterById(snap.chapterId) ? snap : null;
    } catch (e) {
      return null;
    }
  }

  function updateContinueBadge() {
    if (!continueBadge) return;
    const snap = getAutosave();
    continueBadge.textContent = snap ? snap.chapterShort || "" : "";
  }

  function saveToSlot(slotId) {
    const saves = getSaves();
    saves[slotId] = createSaveSnapshot(`Слот ${slotId}`);
    localStorage.setItem(SLOTS_KEY, JSON.stringify(saves));
    updateContinueBadge();
    renderSavesModal();
  }

  function loadSnapshot(snap) {
    if (!snap || snap.v !== 2 || !chapterById(snap.chapterId)) {
      alert("Это сохранение сделано в старой версии игры и не может быть загружено.");
      return;
    }
    titleScreen.classList.add("hidden");
    savesModal.classList.remove("visible");
    choiceOverlay.classList.remove("visible");
    if (snap.chHash && snap.entry && snap.chHash !== chapterHash(snap.chapterId)) {
      // Глава изменилась после сохранения: начинаем её заново с состояния на входе.
      alert("Эта глава обновилась после сохранения. Начнём её с начала, все решения до неё сохранены.");
      resetRun(snap.entry.vars, snap.entry.choicesMade);
      enterChapter(snap.chapterId);
      return;
    }
    state.backlog = (snap.backlog || []).slice();
    state.history = (snap.history || []).slice(0, -1);
    clearSprites();
    if (!restoreFrame(snap.frame)) return;
    state.entry = snap.entry ? { chapterId: snap.chapterId, vars: snap.entry.vars, choicesMade: snap.entry.choicesMade } : null;
    preloadChapterAssets(chapterById(snap.chapterId));
    run();
  }

  function startNewGame() {
    resetRun();
    titleScreen.classList.add("hidden");
    const first = allChapters()[0];
    if (first) enterChapter(first.id);
  }

  function startFromEpisode(id) {
    const seen = meta.seen[id];
    state.entry = null;
    resetRun(seen && seen.vars, seen && seen.choicesMade);
    titleScreen.classList.add("hidden");
    enterChapter(id);
  }

  // =========================================================
  // MODALS RENDERING
  // =========================================================
  function openChaptersModal() {
    chaptersModalBody.innerHTML = "";
    let lastDay = null;
    allChapters().forEach((ch) => {
      const dayKey = String(ch.day || "").split("·")[0].trim();
      if (dayKey !== lastDay) {
        lastDay = dayKey;
        const h = document.createElement("div");
        h.className = "chapter-day-header";
        h.textContent = ch.day || dayKey;
        chaptersModalBody.appendChild(h);
      }
      const open = true; // все акты доступны сразу: можно перейти к любому акту любого дня
      const card = document.createElement("div");
      card.className = "chapter-card" + (ch.id === state.chapterId ? " active" : "") + (open ? "" : " locked");
      card.innerHTML = open
        ? `
        <div>
          <div class="chapter-card-day">${ch.day}${DEV ? ` · <code>${ch.id}</code>` : ""}</div>
          <div class="chapter-card-title">${ch.title}</div>
          <div class="chapter-card-sub">${ch.subtitle || ""}</div>
        </div>
        <div class="save-action-btn primary">Запустить →</div>`
        : `
        <div>
          <div class="chapter-card-day">${ch.day}</div>
          <div class="chapter-card-title">— ещё не пройдено —</div>
        </div>`;
      if (open) {
        card.addEventListener("mouseenter", () => playUiSound("hover"));
        card.addEventListener("click", () => {
          playUiSound("click");
          chaptersModal.classList.remove("visible");
          startFromEpisode(ch.id);
        });
      }
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
    const autoSnap = getAutosave();
    if (autoSnap) {
      try {
        const autoEl = document.createElement("div");
        autoEl.className = "save-slot";
        autoEl.innerHTML = `
          <div>
            <div class="chapter-card-day">АВТОСОХРАНЕНИЕ · ${autoSnap.timestamp}</div>
            <div class="chapter-card-title">${autoSnap.chapterTitle}</div>
            <div class="chapter-card-sub">${autoSnap.previewText ? "«" + autoSnap.previewText + "»" : ""}</div>
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
          <div class="chapter-card-sub">${snap ? (snap.v !== 2 ? "Сохранение старой версии — загрузить нельзя" : snap.previewText ? "«" + snap.previewText + "»" : "") : (inGame ? "Нажмите «Сохранить», чтобы записать текущий момент" : "Запустите игру, чтобы сделать запись в этот слот")}</div>
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
          localStorage.setItem(SLOTS_KEY, JSON.stringify(all));
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
    if (getAutosave() && !confirm("Начать историю заново? Автосохранение будет перезаписано (сохранения в слотах останутся).")) return;
    startNewGame();
  });

  document.getElementById("title-continue-btn").addEventListener("click", () => {
    const snap = getAutosave();
    if (snap) {
      loadSnapshot(snap);
      return;
    }
    startNewGame();
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
    if (choiceOverlay.classList.contains("visible") && /^[1-9]$/.test(e.key)) {
      const btn = choiceList.querySelector(`[data-choice-key="${e.key}"]`);
      if (btn) btn.click();
      return;
    }
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
    // Start menu music immediately BEFORE queuing any background image preloads
    playBgm("Golden Afternoon Light.mp3");
    state.vars = defaultVars();
    if (allChapters().length > 0) {
      setBackground(allChapters()[0].bg);
      preloadChapterAssets(allChapters()[0]);
    }
    if (DEV) {
      document.body.classList.add("dev-mode");
      console.info("[VN] dev-режим: все эпизоды открыты, эффекты выборов видны, панель переменных слева сверху");
    }
  }

  init();
})();
