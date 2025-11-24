const pad = (value, digits = 2) => value.toString().padStart(digits, "0");

initViewSwitcher("replica-completa");

const minimalRoot = document.querySelector('[data-stopwatch="minimal"]');
if (minimalRoot) {
  initBasicStopwatch(minimalRoot);
}

const advancedRoot = document.querySelector('[data-stopwatch="advanced"]');
if (advancedRoot) {
  initAdvancedStopwatch(advancedRoot);
}

initCanvasStage();

function initViewSwitcher(defaultView) {
  const views = document.querySelectorAll("[data-view]");
  const buttons = document.querySelectorAll("[data-view-target]");

  const showView = (target) => {
    views.forEach((view) => {
      const isActive = view.dataset.view === target;
      view.classList.toggle("is-active", isActive);
      view.setAttribute("aria-hidden", (!isActive).toString());
    });
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.viewTarget === target);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.viewTarget));
  });

  showView(defaultView);
}

function initBasicStopwatch(root) {
  const display = root.querySelector("[data-role='display']");
  const startBtn = root.querySelector("[data-role='start']");
  const resetBtn = root.querySelector("[data-role='reset']");

  const state = {
    running: false,
    elapsed: 0,
    startStamp: 0,
    intervalId: null,
  };

  const render = () => {
    const hours = Math.floor(state.elapsed / 3600000);
    const minutes = Math.floor((state.elapsed % 3600000) / 60000);
    const seconds = Math.floor((state.elapsed % 60000) / 1000);
    display.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const start = () => {
    state.startStamp = Date.now() - state.elapsed;
    state.intervalId = setInterval(() => {
      state.elapsed = Date.now() - state.startStamp;
      render();
    }, 80);
    state.running = true;
    startBtn.textContent = "Detener";
    resetBtn.disabled = false;
  };

  const stop = () => {
    state.running = false;
    clearInterval(state.intervalId);
    startBtn.textContent = "Continuar";
  };

  const reset = () => {
    stop();
    state.elapsed = 0;
    render();
    startBtn.textContent = "Iniciar";
    resetBtn.disabled = true;
  };

  startBtn.addEventListener("click", () => {
    if (!state.running) {
      start();
    } else {
      stop();
    }
  });

  resetBtn.addEventListener("click", reset);

  render();
}

function initAdvancedStopwatch(root) {
  const displayRefs = {
    hours: root.querySelector(".time.hours"),
    minutes: root.querySelector(".time.minutes"),
    seconds: root.querySelector(".time.seconds"),
    millis: root.querySelector(".time.millis"),
  };
  const startBtn = root.querySelector('[data-action="start"]');
  const lapBtn = root.querySelector('[data-action="lap"]');
  const resetBtn = root.querySelector('[data-action="reset"]');
  const fullscreenBtn = root.querySelector('[data-action="fullscreen"]');
  const advancedView = root.closest('[data-view="intento-1"]') || document;
  const clearLapsBtn = advancedView.querySelector('[data-action="clear-laps"]');
  const lapList = advancedView.querySelector(".laps-list");
  const soundToggle = root.querySelector("#soundToggle");

  const timerState = {
    startStamp: 0,
    elapsed: 0,
    running: false,
    rafId: null,
  };

  let laps = [];
  let lastLapMark = 0;
  let audioCtx;

  const renderTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    displayRefs.hours.textContent = pad(hours);
    displayRefs.minutes.textContent = pad(minutes);
    displayRefs.seconds.textContent = pad(seconds);
    displayRefs.millis.textContent = pad(centiseconds);
  };

  const tick = (now) => {
    timerState.elapsed = now - timerState.startStamp;
    renderTime(timerState.elapsed);
    timerState.rafId = requestAnimationFrame(tick);
  };

  const playClick = () => {
    if (!soundToggle?.checked) return;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const now = audioCtx.currentTime;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    oscillator.connect(gain).connect(audioCtx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  };

  const startTimer = () => {
    timerState.startStamp = performance.now() - timerState.elapsed;
    timerState.running = true;
    startBtn.textContent = "Detener";
    startBtn.classList.remove("primary");
    startBtn.classList.add("danger");
    lapBtn.disabled = false;
    resetBtn.disabled = false;
    clearLapsBtn.disabled = laps.length === 0;
    playClick();
    timerState.rafId = requestAnimationFrame(tick);
  };

  const stopTimer = () => {
    timerState.running = false;
    cancelAnimationFrame(timerState.rafId);
    startBtn.textContent = "Reanudar";
    startBtn.classList.remove("danger");
    startBtn.classList.add("primary");
    lapBtn.disabled = true;
    playClick();
  };

  const resetTimer = () => {
    stopTimer();
    timerState.elapsed = 0;
    renderTime(0);
    laps = [];
    lastLapMark = 0;
    lapList.innerHTML = "";
    startBtn.textContent = "Iniciar";
    startBtn.classList.remove("danger");
    startBtn.classList.add("primary");
    resetBtn.disabled = true;
    lapBtn.disabled = true;
    clearLapsBtn.disabled = true;
  };

  const toggleTimer = () => {
    if (timerState.running) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const formatLap = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  };

  const renderLaps = () => {
    lapList.innerHTML = "";
    laps.forEach(({ id, lap, total }) => {
      const li = document.createElement("li");
      const lapLabel = document.createElement("strong");
      lapLabel.textContent = `Lap ${id.toString().padStart(2, "0")}`;
      const lapDiff = document.createElement("span");
      lapDiff.textContent = `+${formatLap(lap)}`;
      const lapTotal = document.createElement("strong");
      lapTotal.textContent = formatLap(total);
      li.append(lapLabel, lapDiff, lapTotal);
      lapList.appendChild(li);
    });
  };

  const addLap = () => {
    if (!timerState.running) return;
    const lapDuration = timerState.elapsed - lastLapMark;
    lastLapMark = timerState.elapsed;

    const entry = {
      id: laps.length + 1,
      total: timerState.elapsed,
      lap: lapDuration,
    };
    laps.unshift(entry);
    renderLaps();
    clearLapsBtn.disabled = false;
  };

  const clearLaps = () => {
    laps = [];
    lapList.innerHTML = "";
    clearLapsBtn.disabled = true;
    lastLapMark = timerState.elapsed;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  startBtn.addEventListener("click", () => {
    if (audioCtx?.state === "suspended") {
      audioCtx.resume();
    }
    toggleTimer();
  });

  lapBtn.addEventListener("click", addLap);
  resetBtn.addEventListener("click", resetTimer);
  clearLapsBtn.addEventListener("click", clearLaps);
  fullscreenBtn.addEventListener("click", toggleFullScreen);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && timerState.running) {
      timerState.startStamp = performance.now() - timerState.elapsed;
    }
  });

renderTime(0);
}

function initCanvasStage() {
  const canvas = document.getElementById("stopwatchCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const optionSets = {
    stopwatch: ["Classic Stopwatch", "Split Lap Timer", "Race Timer", "Talking Stopwatch"],
    countdown: ["Countdown Timer", "Bomb Countdown", "Clock Countdown", "Talking Clock"],
  };

  const images = {
    stopwatch: createImage("public/arrow-up.png"),
    countdown: createImage("public/arrow-down.png"),
    loaded: 0,
  };

  const state = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    view: "home",
    selection: null,
    anim: null,
    ready: false,
    hoverTarget: null,
    timer: {
      mode: "idle",
      elapsed: 0,
      startStamp: 0,
    },
    countdown: {
      input: "",
      mode: "input", // input | ready | running | paused
      remaining: 0,
      lastTick: 0,
    },
    lastDirection: 1,
  };

  const controlZones = {
    start: null,
    clear: null,
    countdownSet: null,
    countdownClear: null,
  };
  const countdownDigitZones = [];

  const dpr = window.devicePixelRatio || 1;

  function createImage(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      images.loaded += 1;
      if (images.loaded >= 2) {
        state.ready = true;
      }
    };
    img.onerror = () => {
      images.loaded += 1;
      if (images.loaded >= 2) {
        state.ready = true;
      }
    };
    return img;
  }

  function resizeCanvas() {
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = state.width * ratio;
    canvas.height = state.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  resizeCanvas();
  window.addEventListener("resize", () => {
    resizeCanvas();
  });

  function loop(timestamp) {
    const now = timestamp || performance.now();
    updateAnimation(now);
    updateTimer(now);
    updateCountdown(now);
    drawScene();
    requestAnimationFrame(loop);
  }

  function updateAnimation(timestamp) {
    if (!state.anim) return;
    const progress = Math.min((timestamp - state.anim.start) / state.anim.duration, 1);
    state.anim.progress = progress;
    if (progress >= 1) {
      if (state.anim.type === "toOptions") {
        state.view = "options";
        state.selection = state.anim.selection;
      } else if (state.anim.type === "toHome") {
        state.view = "home";
        state.selection = null;
      }
      state.anim = null;
    }
  }

  function drawScene() {
    ctx.clearRect(0, 0, state.width, state.height);
    drawBackground();
    drawBanners();

    if (!state.ready) {
      drawLoading();
      return;
    }

    if (state.anim) {
      const progress = state.anim.progress || 0;
      const shift = state.width * 0.55;
      const dir = state.anim.direction || 1;
      if (state.anim.type === "toOptions") {
        drawHomePanels(1 - progress, { translateX: progress * shift * dir });
        drawOptionsPanels(state.anim.selection, progress, { translateX: -(1 - progress) * shift * dir });
      } else if (state.anim.type === "toHome") {
        drawOptionsPanels(state.selection, 1 - progress, { translateX: -progress * shift * dir });
        drawHomePanels(progress, { translateX: (1 - progress) * shift * dir });
      }
      return;
    }

    if (state.view === "home") {
      drawHomePanels(1);
    } else if (state.view === "options") {
      drawOptionsPanels(state.selection || "stopwatch", 1);
    }
  }

  function drawBackground() {
    ctx.fillStyle = "#fefefe";
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function drawBanners() {
    const bannerHeight = getBannerHeight();
    drawBanner(0, true, bannerHeight);
    drawBanner(state.height - bannerHeight, false, bannerHeight);
  }

  function drawBanner(y, showText, bannerHeight) {
    ctx.save();
    ctx.fillStyle = "#0c3d94";
    ctx.fillRect(0, y, state.width, bannerHeight);
    if (showText) {
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${bannerHeight * 0.45}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("www.online-stopwatch.com", state.width / 2, y + bannerHeight / 2);
    }
    ctx.restore();
  }

  function drawSplitBackground() {
    const dividerWidth = state.width * 0.02;
    const dividerX = (state.width - dividerWidth) / 2;
    const bannerHeight = getBannerHeight();
    const topLimit = bannerHeight;
    const bottomLimit = state.height - bannerHeight;
    const fillHeight = Math.max(bottomLimit - topLimit, 0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, topLimit, state.width, fillHeight);
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, topLimit, dividerX, fillHeight);
    ctx.fillStyle = "#f1f9f1";
    ctx.fillRect(dividerX, topLimit, state.width - dividerX, fillHeight);
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(dividerX - dividerWidth / 2, topLimit, dividerWidth, fillHeight);
    ctx.restore();
  }

  function drawLoading() {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `${state.width * 0.04}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Loading...", state.width / 2, state.height / 2);
  }

  function drawHomePanels(alpha, transform = {}) {
    const metrics = getPanelMetrics();
    const { panelWidth, panelHeight, paddingX, y } = metrics;
    ctx.save();
    ctx.globalAlpha = alpha;
    applyTransform(transform);
    drawSplitBackground();
    drawHomePanel(paddingX, y, panelWidth, panelHeight, "Stopwatch", images.stopwatch);
    drawHomePanel(state.width - panelWidth - paddingX, y, panelWidth, panelHeight, "Countdown", images.countdown);
    ctx.restore();
  }

  function drawHomePanel(x, y, width, height, label, image) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    drawRoundedRect(x, y, width, height, 30);
    ctx.fill();

    ctx.fillStyle = "#101522";
    ctx.font = `600 ${width * 0.12}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(label, x + width / 2, y + height * 0.2);

    if (image && image.complete) {
      const imgHeight = height * 0.66;
      const imgWidth = (image.width / image.height) * imgHeight;
      ctx.drawImage(
        image,
        x + (width - imgWidth) / 2,
        y + height * 0.3,
        imgWidth,
        imgHeight
      );
    }
    ctx.restore();
  }

  function drawOptionsPanels(selection, alpha, transform = {}) {
    ctx.save();
    applyTransform(transform);
    ctx.globalAlpha = alpha;

    if (selection === "countdown") {
      drawCountdownOptions();
    } else {
      drawStopwatchOptions();
    }
    ctx.restore();
  }

  function drawStopwatchOptions() {
    controlZones.countdownSet = null;
    controlZones.countdownClear = null;
    const bannerHeight = getBannerHeight();
    const displayPadding = state.height * 0.04;
    const displayWidth = state.width * 0.94;
    const displayHeight = state.height * 0.4;
    const displayX = (state.width - displayWidth) / 2;
    const displayY = bannerHeight + displayPadding;

    drawTimerDisplay(displayX, displayY, displayWidth, displayHeight, getTimerSnapshot());

    const buttonWidth = state.width * 0.42;
    const buttonHeight = state.height * 0.2;
    const buttonsY = displayY + displayHeight + displayPadding * 1.5;
    const gap = state.width * 0.06;
    const centerX = state.width / 2;
    const leftX = centerX - gap / 2 - buttonWidth;
    const rightX = centerX + gap / 2;

    controlZones.start = null;
    controlZones.clear = null;

    const startLabel =
      state.timer.mode === "running"
        ? "Pause"
        : state.timer.mode === "paused"
        ? "Continue"
        : "Start";
    const startColor = state.timer.mode === "paused" ? "#1a61f0" : "#10c53d";

    drawControlButton(leftX, buttonsY, buttonWidth, buttonHeight, startLabel, startColor, "start");
    drawControlButton(rightX, buttonsY, buttonWidth, buttonHeight, "Clear", "#e42626", "clear");

    drawBackBar();
  }

  function drawCountdownOptions() {
    controlZones.start = null;
    controlZones.clear = null;
    const bannerHeight = getBannerHeight();
    const displayPadding = state.height * 0.04;
    const displayWidth = state.width * 0.94;
    const displayHeight = state.height * 0.4;
    const displayX = (state.width - displayWidth) / 2;
    const displayY = bannerHeight + displayPadding;

    drawTimerDisplay(displayX, displayY, displayWidth, displayHeight, getCountdownSnapshot());

    if (state.countdown.mode === "input") {
      const keypadPadding = state.width * 0.04;
      const keypadWidth = state.width - keypadPadding * 2;
      const columns = 6;
      const gap = state.width * 0.015;
      const buttonHeight = state.height * 0.11;
      const buttonWidth = (keypadWidth - gap * (columns - 1)) / columns;
      const startX = keypadPadding;
      const startY = displayY + displayHeight + displayPadding;

      controlZones.countdownSet = null;
      controlZones.countdownClear = null;
      countdownDigitZones.length = 0;

      const topRow = ["5", "6", "7", "8", "9", "Set"];
      const bottomRow = ["0", "1", "2", "3", "4", "Clear"];

      drawCountdownRow(topRow, startX, startY, buttonWidth, buttonHeight, gap);
      drawCountdownRow(bottomRow, startX, startY + buttonHeight + gap, buttonWidth, buttonHeight, gap);
    } else {
      controlZones.countdownSet = null;
      controlZones.countdownClear = null;
      countdownDigitZones.length = 0;
      const buttonWidth = state.width * 0.42;
      const buttonHeight = state.height * 0.2;
      const buttonsY = displayY + displayHeight + displayPadding * 1.5;
      const gap = state.width * 0.06;
      const centerX = state.width / 2;
      const leftX = centerX - gap / 2 - buttonWidth;
      const rightX = centerX + gap / 2;

      controlZones.start = null;
      controlZones.clear = null;

      const countdownLabel =
        state.countdown.mode === "running"
          ? "Pause"
          : state.countdown.mode === "paused"
          ? "Continue"
          : "Start";
      const countdownColor = state.countdown.mode === "paused" ? "#1a61f0" : "#10c53d";

      drawControlButton(leftX, buttonsY, buttonWidth, buttonHeight, countdownLabel, countdownColor, "start");
      drawControlButton(rightX, buttonsY, buttonWidth, buttonHeight, "Clear", "#e42626", "clear");
    }

    drawBackBar();
  }

  function drawCountdownRow(labels, startX, y, width, height, gap) {
    labels.forEach((label, index) => {
      const x = startX + index * (width + gap);
      const isAction = label === "Set" || label === "Clear";
      const color = label === "Clear" ? "#c4c4c4" : "#0ed946";
      drawCountdownButton(x, y, width, height, label, color);
      if (isAction) {
        const zoneKey = label === "Set" ? "countdownSet" : "countdownClear";
        controlZones[zoneKey] = { x, y, width, height };
      } else {
        countdownDigitZones.push({ x, y, width, height, value: label });
      }
    });
  }

  function drawCountdownButton(x, y, width, height, label, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = Math.max(3, height * 0.08);
    drawRoundedRect(x, y, width, height, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${height * 0.45}px Arial`;
    ctx.fillText(label, x + width / 2, y + height / 2);
    ctx.restore();
  }

  function drawControlButton(x, y, width, height, label, color, id) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = Math.max(4, height * 0.08);
    drawRoundedRect(x, y, width, height, 24);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${height * 0.45}px Arial`;
    ctx.fillText(label, x + width / 2, y + height / 2);
    ctx.restore();

    if (id) {
      controlZones[id] = { x, y, width, height };
    }
  }

  function drawBackBar() {
    const bounds = getBackBarBounds();
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const iconSize = bounds.height * 0.55;
    const iconX = bounds.x + bounds.height * 0.35;
    const textY = bounds.y + bounds.height / 2;
    const iconColor = state.hoverTarget === "back" ? "#ffd600" : "#1cc96b";
    ctx.font = `900 ${iconSize}px "Font Awesome 6 Free", Arial`;
    ctx.fillStyle = iconColor;
    ctx.fillText("\uf060", iconX, textY);
    ctx.font = `700 ${bounds.height * 0.45}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Back", iconX + iconSize * 1.1, textY);
    ctx.restore();
  }


  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawTimerDisplay(x, y, width, height, snapshot) {
    ctx.save();
    ctx.fillStyle = "#dfe6ff";
    ctx.strokeStyle = "#1f1f1f";
    ctx.lineWidth = Math.max(4, height * 0.04);
    drawRoundedRect(x, y, width, height, 35);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${height * 0.65}px Arial`;
    ctx.fillText(snapshot.main, x + width / 2, y + height * 0.54);

    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.font = `${height * 0.2}px Arial`;
    const millisX = x + width - height * 0.4;
    ctx.fillText(snapshot.millis, millisX, y + height - height * 0.08);
    ctx.restore();
  }

  function getCanvasCoordinates(evt) {
    const rect = canvas.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * state.width;
    const y = ((evt.clientY - rect.top) / rect.height) * state.height;
    return { x, y };
  }

  function handleHomeClick(coords) {
    const targets = getArrowTargets();
    const hit = targets.find((target) => pointInRect(coords, target));
    if (hit) {
      const direction = hit.mode === "countdown" ? -1 : 1;
      startAnimation("toOptions", hit.mode, direction);
    }
  }

  function handleOptionsClick(coords) {
    const bounds = getBackBarBounds();
    if (pointInRect(coords, bounds)) {
      if (state.selection === "stopwatch") {
        handleClearButton();
      } else if (state.selection === "countdown") {
        handleCountdownClear();
      }
      startAnimation("toHome");
      return;
    }

    if (state.selection === "countdown") {
      if (state.countdown.mode === "input") {
        const digitHit = countdownDigitZones.find((zone) => pointInRect(coords, zone));
        if (digitHit) {
          handleCountdownDigit(digitHit.value);
          return;
        }
        if (controlZones.countdownSet && pointInRect(coords, controlZones.countdownSet)) {
          handleCountdownSet();
          return;
        }
        if (controlZones.countdownClear && pointInRect(coords, controlZones.countdownClear)) {
          handleCountdownClear();
          return;
        }
      } else {
        if (controlZones.start && pointInRect(coords, controlZones.start)) {
          handleCountdownStart();
          return;
        }
        if (controlZones.clear && pointInRect(coords, controlZones.clear)) {
          handleCountdownClear();
          return;
        }
      }
    } else {
      if (controlZones.start && pointInRect(coords, controlZones.start)) {
        handleStartButton();
        return;
      }
      if (controlZones.clear && pointInRect(coords, controlZones.clear)) {
        handleClearButton();
        return;
      }
    }
  }

  function getHomePanels() {
    const metrics = getPanelMetrics();
    const { panelWidth, panelHeight, paddingX, y } = metrics;
    return [
      { x: paddingX, y, width: panelWidth, height: panelHeight, mode: "stopwatch" },
      {
        x: state.width - panelWidth - paddingX,
        y,
        width: panelWidth,
        height: panelHeight,
        mode: "countdown",
      },
    ];
  }

  function getBackBarBounds() {
    const bannerHeight = getBannerHeight();
    const width = Math.max(state.width * 0.25, bannerHeight * 3);
    const height = bannerHeight;
    const x = 0;
    const y = state.height - bannerHeight;
    return { x, y, width, height };
  }

  function getArrowTargets() {
    const panels = getHomePanels();
    return panels
      .map((panel) => {
        const image = panel.mode === "stopwatch" ? images.stopwatch : images.countdown;
        if (!image || !image.complete) return null;
        const imgHeight = panel.height * 0.66;
        const imgWidth = (image.width / image.height) * imgHeight;
        return {
          mode: panel.mode,
          x: panel.x + (panel.width - imgWidth) / 2,
          y: panel.y + panel.height * 0.3,
          width: imgWidth,
          height: imgHeight,
        };
      })
      .filter(Boolean);
  }

  function pointInRect(point, rect) {
    if (!rect) return false;
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  function applyTransform({ translateX = 0, rotate = 0 } = {}) {
    ctx.translate(translateX, 0);
  }

  function getPanelMetrics() {
    const panelWidth = state.width * 0.46;
    const desiredHeight = state.height * 0.78;
    const paddingX = state.width * 0.06;
    const margin = state.height * 0.035;
    const bannerHeight = getBannerHeight();
    const topSafe = bannerHeight + margin;
    const bottomSafe = state.height - bannerHeight - margin;
    const maxPanelHeight = Math.max(bottomSafe - topSafe, 0);
    const panelHeight = Math.min(desiredHeight, maxPanelHeight);
    const y = topSafe + (maxPanelHeight - panelHeight) / 2;
    return { panelWidth, panelHeight, paddingX, y };
  }

  function getBannerHeight() {
    return state.height * 0.12;
  }

  function getTimerSnapshot() {
    const elapsed = state.timer.elapsed;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const millis = Math.floor(elapsed % 1000);
    return {
      main: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      millis: millis.toString().padStart(3, "0"),
    };
  }

  function getCountdownSnapshot() {
    if (state.countdown.mode === "input") {
      const input = state.countdown.input || "";
      const padded = input.padStart(6, "0");
      const seconds = padded.slice(4, 6);
      const minutes = padded.slice(2, 4);
      const hours = padded.slice(0, 2);
      return {
        main: `${hours}:${minutes}:${seconds}`,
        millis: "000",
      };
    }
    const remaining = Math.max(0, Math.floor(state.countdown.remaining));
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return {
      main: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      millis: Math.floor(remaining % 1000)
        .toString()
        .padStart(3, "0"),
    };
  }

  function handleStartButton() {
    const now = performance.now();
    if (state.timer.mode === "idle") {
      state.timer.elapsed = 0;
      state.timer.startStamp = now;
      state.timer.mode = "running";
    } else if (state.timer.mode === "running") {
      state.timer.elapsed = now - state.timer.startStamp;
      state.timer.mode = "paused";
    } else if (state.timer.mode === "paused") {
      state.timer.startStamp = now - state.timer.elapsed;
      state.timer.mode = "running";
    }
  }

  function handleClearButton() {
    state.timer.elapsed = 0;
    state.timer.startStamp = performance.now();
    state.timer.mode = "idle";
  }

  function handleCountdownSet() {
    const totalMs = parseCountdownInput(state.countdown.input);
    if (totalMs <= 0) return;
    state.countdown.remaining = totalMs;
    state.countdown.mode = "ready";
    state.countdown.lastTick = performance.now();
    state.countdown.input = "";
  }

  function handleCountdownClear() {
    state.countdown.input = "";
    state.countdown.mode = "input";
    state.countdown.remaining = 0;
  }

  function handleCountdownDigit(value) {
    if (state.countdown.mode !== "input") return;
    state.countdown.input = (state.countdown.input + value).slice(-6);
  }

  function handleCountdownBackspace() {
    if (state.countdown.mode !== "input") return;
    if (!state.countdown.input) return;
    state.countdown.input = state.countdown.input.slice(0, -1);
  }

  function handleCountdownStart() {
    const now = performance.now();
    if (state.countdown.mode === "ready") {
      state.countdown.mode = "running";
      state.countdown.lastTick = now;
    } else if (state.countdown.mode === "running") {
      state.countdown.mode = "paused";
    } else if (state.countdown.mode === "paused") {
      state.countdown.mode = "running";
      state.countdown.lastTick = now;
    }
  }

  function updateTimer(timestamp) {
    if (state.timer.mode === "running") {
      state.timer.elapsed = timestamp - state.timer.startStamp;
    }
  }

  function updateCountdown(timestamp) {
    if (state.countdown.mode === "running") {
      const delta = timestamp - (state.countdown.lastTick || timestamp);
      state.countdown.lastTick = timestamp;
      state.countdown.remaining = Math.max(0, state.countdown.remaining - delta);
      if (state.countdown.remaining === 0) {
        state.countdown.mode = "ready";
      }
    }
  }

  function handleKeydown(evt) {
    if (
      state.view === "options" &&
      state.selection === "countdown" &&
      state.countdown.mode === "input"
    ) {
      if (evt.key >= "0" && evt.key <= "9") {
        handleCountdownDigit(evt.key);
      } else if (evt.key === "Backspace" || evt.key === "Delete") {
        handleCountdownBackspace();
      } else if (evt.key === "Enter") {
        handleCountdownSet();
      }
    } else if (
      state.view === "options" &&
      state.selection === "countdown" &&
      (evt.key === "Enter" || evt.key === "Return")
    ) {
      if (state.countdown.mode !== "input") {
        handleCountdownStart();
      }
    }
  }

  function parseCountdownInput(input) {
    if (!input) return 0;
    const padded = input.padStart(6, "0");
    const hours = Number(padded.slice(0, 2));
    const minutes = Number(padded.slice(2, 4));
    const seconds = Number(padded.slice(4, 6));
    return ((hours * 60 + minutes) * 60 + seconds) * 1000;
  }

  function startAnimation(type, selection, direction) {
    const animDirection =
      typeof direction === "number" ? direction : state.lastDirection || 1;
    state.anim = {
      type,
      selection: selection || state.selection,
      start: performance.now(),
      duration: 650,
      progress: 0,
      direction: animDirection,
    };
    if (type === "toOptions" && typeof direction === "number") {
      state.lastDirection = direction;
    }
  }

  canvas.addEventListener("click", (evt) => {
    if (!state.ready || state.anim) return;
    const coords = getCanvasCoordinates(evt);
    if (state.view === "home") {
      handleHomeClick(coords);
    } else if (state.view === "options") {
      handleOptionsClick(coords);
    }
  });

  canvas.addEventListener("mousemove", (evt) => {
    if (!state.ready || state.anim) {
      canvas.style.cursor = "default";
      state.hoverTarget = null;
      return;
    }
    const coords = getCanvasCoordinates(evt);
    let hover = null;
    if (state.view === "home") {
      const target = getArrowTargets().find((t) => pointInRect(coords, t));
      if (target) hover = target.mode;
    } else if (state.view === "options") {
      if (pointInRect(coords, getBackBarBounds())) {
        hover = "back";
      } else if (state.selection === "countdown") {
        if (state.countdown.mode === "input") {
          if (controlZones.countdownSet && pointInRect(coords, controlZones.countdownSet)) {
            hover = "countdownSet";
          } else if (controlZones.countdownClear && pointInRect(coords, controlZones.countdownClear)) {
            hover = "countdownClear";
          } else if (countdownDigitZones.some((zone) => pointInRect(coords, zone))) {
            hover = "countdownDigit";
          }
        } else {
          if (controlZones.start && pointInRect(coords, controlZones.start)) {
            hover = "start";
          } else if (controlZones.clear && pointInRect(coords, controlZones.clear)) {
            hover = "clear";
          }
        }
      } else {
        if (controlZones.start && pointInRect(coords, controlZones.start)) {
          hover = "start";
        } else if (controlZones.clear && pointInRect(coords, controlZones.clear)) {
          hover = "clear";
        }
      }
    }
    state.hoverTarget = hover;
    canvas.style.cursor = hover ? "pointer" : "default";
  });

  canvas.addEventListener("mouseleave", () => {
    canvas.style.cursor = "default";
    state.hoverTarget = null;
  });

  requestAnimationFrame(loop);

  window.addEventListener("keydown", handleKeydown);
}





