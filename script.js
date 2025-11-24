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
  };

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
    updateAnimation(timestamp || performance.now());
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
      if (state.anim.type === "toOptions") {
        drawHomePanels(1 - progress, {
          translateX: progress * state.width * 0.32,
          rotate: progress * 0.25,
        });
        drawOptionsPanels(state.anim.selection, progress, {
          translateX: -(1 - progress) * state.width * 0.28,
          rotate: -(1 - progress) * 0.18,
        });
      } else if (state.anim.type === "toHome") {
        drawOptionsPanels(state.selection, 1 - progress, {
          translateX: progress * state.width * 0.28,
          rotate: progress * 0.18,
        });
        drawHomePanels(progress, {
          translateX: -(1 - progress) * state.width * 0.32,
          rotate: -(1 - progress) * 0.25,
        });
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
    const items = optionSets[selection] || [];
    ctx.save();
    applyTransform(transform);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `${state.width * 0.06}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(`${selection === "countdown" ? "Countdown" : "Stopwatch"} Modes`, state.width / 2, state.height * 0.18);

    const gridTop = state.height * 0.28;
    const gridHeight = state.height * 0.5;
    const buttonHeight = gridHeight / items.length - state.height * 0.01;
    ctx.font = `${state.width * 0.035}px Arial`;
    ctx.textAlign = "left";

    items.forEach((label, index) => {
      const y = gridTop + index * (buttonHeight + state.height * 0.02);
      const x = state.width * 0.15;
      const buttonWidth = state.width * 0.7;
      drawOptionButton(x, y, buttonWidth, buttonHeight, label);
    });

    drawBackBar();
    ctx.restore();
  }

  function drawOptionButton(x, y, width, height, label) {
    ctx.save();
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, "#164a9a");
    gradient.addColorStop(1, "#0a2f59");
    ctx.fillStyle = gradient;
    drawRoundedRect(x, y, width, height, 18);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `${height * 0.45}px Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + width * 0.06, y + height / 2);
    ctx.restore();
  }

  function drawBackBar() {
    const bounds = getBackBarBounds();
    ctx.save();
    ctx.fillStyle = "#0a8e34";
    drawRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, bounds.height / 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    const iconSize = bounds.height * 0.45;
    const iconX = bounds.x + bounds.height * 0.25;
    const textY = bounds.y + bounds.height / 2;
    ctx.font = `900 ${iconSize}px "Font Awesome 6 Free", Arial`;
    ctx.fillText("\uf060", iconX, textY);
    ctx.font = `700 ${bounds.height * 0.4}px Arial`;
    ctx.fillText("Back", iconX + iconSize * 0.95, textY);
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

  function getCanvasCoordinates(evt) {
    const rect = canvas.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * state.width;
    const y = ((evt.clientY - rect.top) / rect.height) * state.height;
    return { x, y };
  }

  function handleHomeClick(coords) {
    const panels = getHomePanels();
    const hit = panels.find((panel) => pointInRect(coords, panel));
    if (hit) {
      startAnimation("toOptions", hit.mode);
    }
  }

  function handleOptionsClick(coords) {
    const bounds = getBackBarBounds();
    if (pointInRect(coords, bounds)) {
      startAnimation("toHome");
    }
  }

  function getHomePanels() {
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
    const barWidth = state.width * 0.4;
    const barHeight = state.height * 0.11;
    const x = (state.width - barWidth) / 2;
    const y = state.height - barHeight - state.height * 0.04;
    return { x, y, width: barWidth, height: barHeight };
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
    ctx.translate(state.width / 2, state.height / 2);
    ctx.rotate(rotate);
    ctx.translate(-state.width / 2, -state.height / 2);
    ctx.translate(translateX, 0);
  }

  function getBannerHeight() {
    return state.height * 0.12;
  }

  function startAnimation(type, selection) {
    state.anim = {
      type,
      selection: selection || state.selection,
      start: performance.now(),
      duration: 650,
      progress: 0,
    };
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
      return;
    }
    const coords = getCanvasCoordinates(evt);
    let hovering = false;
    if (state.view === "home") {
      hovering = getHomePanels().some((panel) => pointInRect(coords, panel));
    } else if (state.view === "options") {
      hovering = pointInRect(coords, getBackBarBounds());
    }
    canvas.style.cursor = hovering ? "pointer" : "default";
  });

  canvas.addEventListener("mouseleave", () => {
    canvas.style.cursor = "default";
  });

  requestAnimationFrame(loop);
}





