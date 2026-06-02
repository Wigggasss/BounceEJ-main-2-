"use strict";

const DEV_MODE_STORAGE_KEY = "bounceEJDevModeSettings";
const DEV_MODE_TOGGLE_KEY = { ctrlKey: true, shiftKey: true, key: "D" };
const DEV_PANEL_ID = "devModeOverlay";

const devMode = {
  active: false,
  godMode: false,
  noAntiCheat: false,
  freeze: false,
  showDebug: true,
  fps: 0,
  lastFpsTimestamp: performance.now(),
  frameCount: 0,
  endGameOriginal: null,
  updateGameOriginal: null,
  settings: {
    godMode: false,
    noAntiCheat: false,
    showDebug: true
  }
};

function loadDevModeSettings() {
  try {
    const raw = localStorage.getItem(DEV_MODE_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      devMode.settings = {
        godMode: Boolean(parsed.godMode),
        noAntiCheat: Boolean(parsed.noAntiCheat),
        showDebug: Boolean(parsed.showDebug)
      };
    }
  } catch (error) {
    // ignore invalid storage state
  }
}

function saveDevModeSettings() {
  try {
    localStorage.setItem(DEV_MODE_STORAGE_KEY, JSON.stringify(devMode.settings));
  } catch (error) {
    // ignore storage errors
  }
}

function createDevPanel() {
  const panel = document.createElement("div");
  panel.id = DEV_PANEL_ID;
  panel.className = "dev-panel hidden";
  panel.innerHTML = `
    <div class="dev-panel-card">
      <div class="dev-panel-header">
        <strong>Developer Mode</strong>
        <button type="button" class="dev-panel-close">Close</button>
      </div>
      <div class="dev-panel-section">
        <label><input id="devGodModeToggle" type="checkbox"> God Mode</label>
        <label><input id="devNoAntiCheatToggle" type="checkbox"> Disable Anti-Cheat</label>
        <label><input id="devFreezeToggle" type="checkbox"> Freeze Game</label>
        <label><input id="devShowDebugToggle" type="checkbox"> Show Debug</label>
      </div>
      <div class="dev-panel-actions">
        <button id="devAddScore">Add 100 Score</button>
        <button id="devAddXp">Add 100 XP</button>
        <button id="devJumpUp">Super Jump</button>
        <button id="devTeleportUp">Teleport Up</button>
        <button id="devSpawnPowerup">Spawn Powerup</button>
        <button id="devSkipCountdown">Skip Countdown</button>
      </div>
      <div class="dev-panel-status">
        <div id="devModeStatus">Status: inactive</div>
        <pre id="devDebugOutput" class="dev-debug-output"></pre>
      </div>
      <div class="dev-panel-footer">Hotkey: Ctrl + Shift + D</div>
    </div>
  `;

  document.body.appendChild(panel);
  return panel;
}

function initDevModePanel() {
  if (document.getElementById(DEV_PANEL_ID)) {
    return;
  }

  const panel = createDevPanel();
  const closeButton = panel.querySelector(".dev-panel-close");
  const godModeToggle = panel.querySelector("#devGodModeToggle");
  const noAntiCheatToggle = panel.querySelector("#devNoAntiCheatToggle");
  const freezeToggle = panel.querySelector("#devFreezeToggle");
  const showDebugToggle = panel.querySelector("#devShowDebugToggle");
  const addScoreButton = panel.querySelector("#devAddScore");
  const addXpButton = panel.querySelector("#devAddXp");
  const jumpUpButton = panel.querySelector("#devJumpUp");
  const teleportUpButton = panel.querySelector("#devTeleportUp");
  const spawnPowerupButton = panel.querySelector("#devSpawnPowerup");
  const skipCountdownButton = panel.querySelector("#devSkipCountdown");

  closeButton.addEventListener("click", () => toggleDevPanel(false));
  godModeToggle.addEventListener("change", (event) => setGodMode(event.target.checked));
  noAntiCheatToggle.addEventListener("change", (event) => setNoAntiCheat(event.target.checked));
  freezeToggle.addEventListener("change", (event) => setFreeze(event.target.checked));
  showDebugToggle.addEventListener("change", (event) => setShowDebug(event.target.checked));
  addScoreButton.addEventListener("click", addScore);
  addXpButton.addEventListener("click", addXp);
  jumpUpButton.addEventListener("click", superJump);
  teleportUpButton.addEventListener("click", teleportUp);
  spawnPowerupButton.addEventListener("click", spawnPowerup);
  skipCountdownButton.addEventListener("click", skipCountdown);

  updateDevPanel();
}

function toggleDevPanel(value) {
  const panel = document.getElementById(DEV_PANEL_ID);
  if (!panel) {
    return;
  }

  devMode.active = typeof value === "boolean" ? value : !devMode.active;
  panel.classList.toggle("hidden", !devMode.active);
  if (devMode.active) {
    updateDevPanel();
  }
}

function safeGame() {
  return typeof game === "object" && game !== null;
}

function safeSaveState() {
  return typeof saveState === "object" && saveState !== null;
}

function setGodMode(enabled) {
  devMode.settings.godMode = Boolean(enabled);
  devMode.godMode = devMode.settings.godMode;
  updateDevPanel();
  saveDevModeSettings();
}

function setNoAntiCheat(enabled) {
  devMode.settings.noAntiCheat = Boolean(enabled);
  devMode.noAntiCheat = devMode.settings.noAntiCheat;
  if (safeGame()) {
    game._antiCheatEnabled = !devMode.noAntiCheat;
  }
  updateDevPanel();
  saveDevModeSettings();
}

function setFreeze(enabled) {
  devMode.freeze = Boolean(enabled);
  updateDevPanel();
}

function setShowDebug(enabled) {
  devMode.settings.showDebug = Boolean(enabled);
  devMode.showDebug = devMode.settings.showDebug;
  updateDevPanel();
  saveDevModeSettings();
}

function patchGameFunctions() {
  if (typeof window.endGame === "function" && !devMode.endGameOriginal) {
    devMode.endGameOriginal = window.endGame;
    window.endGame = function (reason) {
      if (devMode.godMode && safeGame() && game.running) {
        return;
      }
      return devMode.endGameOriginal(reason);
    };
  }

  if (typeof window.updateGame === "function" && !devMode.updateGameOriginal) {
    devMode.updateGameOriginal = window.updateGame;
    window.updateGame = function (deltaSeconds) {
      if (devMode.freeze && safeGame() && game.running && !game.countdownActive) {
        return;
      }
      return devMode.updateGameOriginal(deltaSeconds);
    };
  }
}

function addScore() {
  if (!safeGame()) {
    return;
  }
  game.score = Number(game.score || 0) + 100;
  if (typeof updateHud === "function") {
    updateHud();
  }
  updateDevPanel();
}

function addXp() {
  if (!safeSaveState()) {
    return;
  }
  saveState.xp = Number(saveState.xp || 0) + 100;
  if (typeof saveData === "function") {
    saveData();
  }
  if (typeof updateMenuStats === "function") {
    updateMenuStats();
  }
  updateDevPanel();
}

function superJump() {
  if (!safeGame()) {
    return;
  }
  const player = game.player;
  if (player) {
    player.vy = -2200;
  }
}

function teleportUp() {
  if (!safeGame()) {
    return;
  }
  const player = game.player;
  if (player) {
    player.y = Math.max(0, player.y - 200);
    if (typeof updateCamera === "function") {
      updateCamera();
    }
    if (typeof updateHud === "function") {
      updateHud();
    }
  }
}

function spawnPowerup() {
  if (!safeGame() || typeof collectPowerup !== "function" || typeof powerupDefinitions === "undefined") {
    return;
  }

  const powerup = Array.isArray(powerupDefinitions) && powerupDefinitions[0] ? powerupDefinitions[0] : null;
  if (powerup) {
    collectPowerup(powerup);
  }
}

function skipCountdown() {
  if (!safeGame()) {
    return;
  }
  if (game.countdownActive) {
    game.countdownActive = false;
    if (typeof hideRunOverlays === "function") {
      hideRunOverlays();
    }
    if (typeof updateHud === "function") {
      updateHud();
    }
  }
}

function updateDevPanel() {
  const panel = document.getElementById(DEV_PANEL_ID);
  if (!panel) {
    return;
  }

  panel.querySelector("#devGodModeToggle").checked = devMode.settings.godMode;
  panel.querySelector("#devNoAntiCheatToggle").checked = devMode.settings.noAntiCheat;
  panel.querySelector("#devFreezeToggle").checked = devMode.freeze;
  panel.querySelector("#devShowDebugToggle").checked = devMode.settings.showDebug;

  const status = panel.querySelector("#devModeStatus");
  let statusText = `Dev mode ${devMode.active ? "active" : "hidden"}`;

  if (safeGame()) {
    statusText += ` | Game: ${game.modeLabel || game.mode || "unknown"} | Score: ${game.score || 0}`;
    if (game.player) {
      statusText += ` | X:${Math.round(game.player.x)} Y:${Math.round(game.player.y)} VY:${Math.round(game.player.vy)}`;
    }
    if (safeSaveState()) {
      statusText += ` | XP: ${saveState.xp || 0}`;
    }
    if (typeof multiplayer === "object" && multiplayer) {
      statusText += ` | Room: ${multiplayer.roomCode || "none"} | Players: ${Array.isArray(multiplayer.players) ? multiplayer.players.length : 0}`;
    }
  }
  status.textContent = statusText;

  const debugOutput = panel.querySelector("#devDebugOutput");
  if (devMode.settings.showDebug && safeGame()) {
    const info = {
      "God Mode": devMode.settings.godMode,
      "No Anti-Cheat": devMode.settings.noAntiCheat,
      "Freeze": devMode.freeze,
      "Online Duel": Boolean(game.onlineDuel),
      "Running": Boolean(game.running),
      "Paused": Boolean(game.paused),
      "Countdown": Boolean(game.countdownActive),
      "FPS": `${devMode.fps.toFixed(1)}`,
      "Room Code": multiplayer && multiplayer.roomCode ? multiplayer.roomCode : "none"
    };
    debugOutput.textContent = Object.entries(info).map(([key, value]) => `${key}: ${value}`).join("\n");
    debugOutput.classList.remove("hidden");
  } else {
    debugOutput.classList.add("hidden");
  }
}

function updateDevFps() {
  const now = performance.now();
  devMode.frameCount += 1;
  const elapsed = now - devMode.lastFpsTimestamp;
  if (elapsed >= 500) {
    devMode.fps = (devMode.frameCount * 1000) / elapsed;
    devMode.frameCount = 0;
    devMode.lastFpsTimestamp = now;
    if (devMode.active) {
      updateDevPanel();
    }
  }
  window.requestAnimationFrame(updateDevFps);
}

function devModeHotkey(event) {
  if (!event.ctrlKey || !event.shiftKey || event.key.toUpperCase() !== "D") {
    return;
  }
  event.preventDefault();
  initDevModePanel();
  toggleDevPanel();
}

function initDevMode() {
  loadDevModeSettings();
  patchGameFunctions();
  initDevModePanel();
  setGodMode(devMode.settings.godMode);
  setNoAntiCheat(devMode.settings.noAntiCheat);
  setShowDebug(devMode.settings.showDebug);
  document.addEventListener("keydown", devModeHotkey);
  window.requestAnimationFrame(updateDevFps);
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  initDevMode();
} else {
  document.addEventListener("DOMContentLoaded", initDevMode);
}

window.DEV_MODE = devMode;
