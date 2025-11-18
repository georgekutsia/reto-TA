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
