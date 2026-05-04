(function() {
"use strict";

const STORAGE_KEY = "bounceEJSave";
const SAVE_SEASON = 2;
const COUNTDOWN_START = 3.8;
const CHEAT_REDIRECT_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const CHARACTER_ASSET_BASE_PATH = "Assets/Characters/";
const BACKGROUND_AD_ASSETS = [
  "Assets/Ads/Advertis Here.png",
  "Assets/Ads/Bounce EJ Ad.png",
  "Assets/Ads/PressFC.png"
];
const BACKGROUND_AD_INTERVAL_SECONDS = 120;
const PROFILE_TABLE = "user_profiles";
const LEADERBOARD_TABLE = "leaderboard_scores";
const CENSOR_TABLE = "leaderboard_censored_words";
const STORE_CODE_RPC = "redeem_store_code";
const LEADERBOARD_LIMIT = 5;
const MULTIPLAYER_LOCKED = false;
const MULTIPLAYER_CHANNEL_PREFIX = "bounceej-duel-";
const MULTIPLAYER_MAX_PLAYERS = 2;
const MULTIPLAYER_STATE_INTERVAL = 0.2;
const MULTIPLAYER_PRESENCE_INTERVAL = 0.75;
const MULTIPLAYER_DISCONNECT_LIMIT = 15;
const MULTIPLAYER_PRESENCE_LEAVE_GRACE = 1.5;
const MULTIPLAYER_SIMULTANEOUS_WINDOW = 500;
const MULTIPLAYER_GHOST_STALE_MS = 6500;
const MULTIPLAYER_ROOM_CODE_LENGTH = 5;
const FALLBACK_CENSOR_WORDS = [
  "fuck",
  "fuk",
  "shit",
  "sh1t",
  "bitch",
  "btch",
  "asshole",
  "dick",
  "pussy",
  "cunt",
  "whore",
  "slut",
  "bastard",
  "nazi",
  "hitler",
  "kkk"
];
const CUSTOM_BACKGROUND_MAX_SIDE = 1100;
const CUSTOM_BACKGROUND_QUALITY = 0.76;
const PROFILE_SYNC_DELAY = 700;
const ANTI_CHEAT_POSITION_TOLERANCE = 18;
const ANTI_CHEAT_VELOCITY_TOLERANCE = 90;
const ANTI_CHEAT_SCORE_TOLERANCE = 4;
const ANTI_CHEAT_MAX_UPWARD_STEP = 185;
const ANTI_CHEAT_MAX_DOWNWARD_STEP = 150;
const ANTI_CHEAT_MAX_HORIZONTAL_STEP = 150;
const DEFAULT_CHARACTER_SECTION = "EJs";
const CHARACTER_SECTION_ORDER = ["EJs", "Limited", "Friends"];
const CHARACTER_RARITIES = {
  common: {
    label: "Common",
    className: "rarity-common"
  },
  uncommon: {
    label: "Uncommon",
    className: "rarity-uncommon"
  },
  rare: {
    label: "Rare",
    className: "rarity-rare"
  },
  legendary: {
    label: "Legendary",
    className: "rarity-legendary"
  }
};
const DEFAULT_CHARACTER_CONFIG = [
  {
    id: "regular",
    name: "Regular EJ",
    file: "Regular EJ.png",
    price: 0,
    section: "EJs",
    limitedTime: false,
    rarity: "Common",
    fill: "#35c2ff",
    face: "#061019",
    ring: "#ffffff"
  },
  {
    id: "lowres",
    name: "Low Res EJ",
    file: "Low Res EJ.png",
    price: 100,
    section: "EJs",
    limitedTime: false,
    rarity: "Rare",
    fill: "#f5c542",
    face: "#3d2700",
    ring: "#fff4b8"
  },
  {
    id: "silly",
    name: "Silly EJ",
    file: "Silly EJ.png",
    price: 250,
    section: "Limited",
    limitedTime: true,
    rarity: "Legendary",
    fill: "#ff36d3",
    face: "#120018",
    ring: "#45ff87"
  },
  {
    id: "portrait",
    name: "Portrait EJ",
    file: "Portrait EJ.png",
    price: 500,
    section: "EJs",
    limitedTime: false,
    rarity: "Legendary",
    fill: "#2d3342",
    face: "#ffffff",
    ring: "#8993a6"
  },
  {
    id: "ethan",
    name: "Ethan EJ",
    file: "Ethan EJ.png",
    price: 750,
    section: "Friends",
    limitedTime: false,
    rarity: "Rare",
    fill: "#5ee085",
    face: "#061019",
    ring: "#ffffff"
  }
];

const CHARACTERS = normalizeCharacters(window.BOUNCE_EJ_CHARACTERS || DEFAULT_CHARACTER_CONFIG);

const LEGACY_CHARACTER_IDS = {
  default: "regular",
  gold: "lowres",
  neon: "silly",
  shadow: "portrait"
};

const DEFAULT_POWERUPS = [
  {
    id: "burger",
    name: "Burger",
    emoji: "🍔",
    rarity: 60,
    effect: "grow",
    sizeBonus: 7,
    duration: 0,
    message: "Burger boost: bigger EJ!"
  },
  {
    id: "fries",
    name: "Fries",
    emoji: "🍟",
    rarity: 80,
    effect: "doubleXp",
    xpMultiplier: 2,
    duration: 12,
    message: "Fries frenzy: double XP!"
  },
  {
    id: "shake",
    name: "Shake",
    emoji: "🥤",
    rarity: 30,
    effect: "boost",
    boostVelocity: -1220,
    duration: 0,
    message: "Shake launch!"
  }
];

const GAME_MODES = {
  classic: {
    id: "classic",
    label: "Classic",
    description: "The normal climb. Go as high as you can.",
    timeLimit: null,
    scoreRamp: false,
    powerupChance: 0.14,
    speedScale: 1,
    jumpScale: 1,
    gravityScale: 1,
    gapScale: 1
  },
  timeTrial: {
    id: "timeTrial",
    label: "Time Trial",
    description: "Score as much as possible in 120 seconds. Jumps ramp up as you climb.",
    timeLimit: 120,
    scoreRamp: true,
    powerupChance: 0.16,
    speedScale: 1,
    jumpScale: 1,
    gravityScale: 1,
    gapScale: 1
  },
  snackRush: {
    id: "snackRush",
    label: "Snack Rush",
    description: "A 90 second food frenzy with extra powerups everywhere.",
    timeLimit: 90,
    scoreRamp: false,
    powerupChance: 0.34,
    speedScale: 1.05,
    jumpScale: 1.04,
    gravityScale: 1,
    gapScale: 1
  },
  turboClimb: {
    id: "turboClimb",
    label: "Turbo Climb",
    description: "Faster movement, higher jumps, and wider platform gaps.",
    timeLimit: null,
    scoreRamp: false,
    powerupChance: 0.18,
    speedScale: 1.22,
    jumpScale: 1.2,
    gravityScale: 1.12,
    gapScale: 1.12
  }
};

const menuScreen = document.getElementById("menuScreen");
const multiplayerScreen = document.getElementById("multiplayerScreen");
const modesScreen = document.getElementById("modesScreen");
const storeScreen = document.getElementById("storeScreen");
const characterScreen = document.getElementById("characterScreen");
const controlsScreen = document.getElementById("controlsScreen");
const gameScreen = document.getElementById("gameScreen");
const allScreens = [menuScreen, multiplayerScreen, modesScreen, storeScreen, characterScreen, controlsScreen, gameScreen];

const menuXp = document.getElementById("menuXp");
const menuBest = document.getElementById("menuBest");
const menuTrialBest = document.getElementById("menuTrialBest");
const menuPlayerName = document.getElementById("menuPlayerName");
const leaderboardButton = document.getElementById("leaderboardButton");
const leaderboardToast = document.getElementById("leaderboardToast");
const leaderboardList = document.getElementById("leaderboardList");
const leaderboardStatus = document.getElementById("leaderboardStatus");
const leaderboardRefreshButton = document.getElementById("leaderboardRefreshButton");
const leaderboardCloseButton = document.getElementById("leaderboardCloseButton");
const menuCharacterImage = document.getElementById("menuCharacterImage");
const multiplayerSetup = document.getElementById("multiplayerSetup");
const multiplayerLobby = document.getElementById("multiplayerLobby");
const multiplayerStatus = document.getElementById("multiplayerStatus");
const multiplayerRoomCode = document.getElementById("multiplayerRoomCode");
const multiplayerPlayerList = document.getElementById("multiplayerPlayerList");
const multiplayerLobbyCountdown = document.getElementById("multiplayerLobbyCountdown");
const joinRoomInput = document.getElementById("joinRoomInput");
const modeList = document.getElementById("modeList");
const storeXp = document.getElementById("storeXp");
const storeTabs = document.getElementById("storeTabs");
const storeList = document.getElementById("storeList");
const characterList = document.getElementById("characterList");
const redeemInput = document.getElementById("redeemInput");
const redeemButton = document.getElementById("redeemButton");
const redeemMessage = document.getElementById("redeemMessage");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameFrame = document.getElementById("gameFrame");
const hudMode = document.getElementById("hudMode");
const hudScore = document.getElementById("hudScore");
const hudTimerWrap = document.getElementById("hudTimerWrap");
const hudTimer = document.getElementById("hudTimer");
const hudXp = document.getElementById("hudXp");
const hudPowerup = document.getElementById("hudPowerup");
const hudPowerupMessage = document.getElementById("hudPowerupMessage");
const gamepadStatus = document.getElementById("gamepadStatus");
const countdownOverlay = document.getElementById("countdownOverlay");
const countdownText = document.getElementById("countdownText");
const pauseOverlay = document.getElementById("pauseOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const gameOverTitle = document.getElementById("gameOverTitle");
const gameOverMessage = document.getElementById("gameOverMessage");
const finalScore = document.getElementById("finalScore");
const finalTotalXp = document.getElementById("finalTotalXp");
const finalBest = document.getElementById("finalBest");
const leaderboardSubmitCard = document.getElementById("leaderboardSubmitCard");
const leaderboardNameInput = document.getElementById("leaderboardNameInput");
const submitScoreButton = document.getElementById("submitScoreButton");
const leaderboardSubmitMessage = document.getElementById("leaderboardSubmitMessage");

const playButton = document.getElementById("playButton");
const gameModesButton = document.getElementById("gameModesButton");
const multiplayerButton = document.getElementById("multiplayerButton");
const createRoomButton = document.getElementById("createRoomButton");
const joinRoomButton = document.getElementById("joinRoomButton");
const copyRoomCodeButton = document.getElementById("copyRoomCodeButton");
const multiplayerReadyButton = document.getElementById("multiplayerReadyButton");
const multiplayerLeaveButton = document.getElementById("multiplayerLeaveButton");
const storeButton = document.getElementById("storeButton");
const characterButton = document.getElementById("characterButton");
const controlsButton = document.getElementById("controlsButton");
const storeBackButton = document.getElementById("storeBackButton");
const characterBackButton = document.getElementById("characterBackButton");
const controlsBackButton = document.getElementById("controlsBackButton");
const multiplayerBackButton = document.getElementById("multiplayerBackButton");
const modeBackButton = document.getElementById("modeBackButton");
const restartButton = document.getElementById("restartButton");
const mainMenuButton = document.getElementById("mainMenuButton");
const pauseResumeButton = document.getElementById("pauseResumeButton");
const pauseEndButton = document.getElementById("pauseEndButton");
const particlesToggle = document.getElementById("particlesToggle");
const gamepadBadgeToggle = document.getElementById("gamepadBadgeToggle");
const sensitivitySlider = document.getElementById("sensitivitySlider");
const sensitivityValue = document.getElementById("sensitivityValue");
const settingsLeaderboardNameInput = document.getElementById("settingsLeaderboardNameInput");
const settingsLeaderboardNameButton = document.getElementById("settingsLeaderboardNameButton");
const settingsLeaderboardNameMessage = document.getElementById("settingsLeaderboardNameMessage");
const backgroundUploadInput = document.getElementById("backgroundUploadInput");
const clearBackgroundButton = document.getElementById("clearBackgroundButton");
const backgroundPreview = document.getElementById("backgroundPreview");
const backgroundStatus = document.getElementById("backgroundStatus");
const authStatus = document.getElementById("authStatus");
const authOpenButton = document.getElementById("authOpenButton");
const authOverlay = document.getElementById("authOverlay");
const authCloseButton = document.getElementById("authCloseButton");
const authAccountSummary = document.getElementById("authAccountSummary");
const authEmailInput = document.getElementById("authEmailInput");
const authPasswordInput = document.getElementById("authPasswordInput");
const authNameInput = document.getElementById("authNameInput");
const authSignInButton = document.getElementById("authSignInButton");
const authSignUpButton = document.getElementById("authSignUpButton");
const authSignOutButton = document.getElementById("authSignOutButton");
const authMessage = document.getElementById("authMessage");
const bannedScreen = document.getElementById("bannedScreen");

let saveState = {
  saveSeason: SAVE_SEASON,
  xp: 0,
  bestScore: 0,
  timeTrialBestScore: 0,
  modeBests: {},
  ownedCharacters: ["regular"],
  equippedCharacter: "regular",
  redeemedCodes: [],
  playerName: "",
  leaderboardRowId: "",
  leaderboardNameLocked: false,
  wins: 0,
  losses: 0,
  winStreak: 0,
  settings: { ...DEFAULT_SETTINGS }
};

const characterImages = {};
const backgroundAdImages = [];
const customBackgroundImage = new Image();
const powerupDefinitions = normalizePowerups(window.BOUNCE_EJ_POWERUPS || DEFAULT_POWERUPS);
const powerupById = powerupDefinitions.reduce((map, powerup) => {
  map[powerup.id] = powerup;
  return map;
}, {});
let leaderboardClient = createLeaderboardClient();

const authState = {
  session: null,
  user: null,
  profile: null,
  profileLoaded: false,
  applyingRemote: false,
  syncTimer: 0,
  syncInFlight: false,
  pendingSync: false
};

let game = null;
let animationFrameId = null;
let lastFrameTime = 0;
let activeStoreSection = DEFAULT_CHARACTER_SECTION;
let leaderboardLoading = false;
let leaderboardType = "classic"; // "classic" or "multiplayer"
let redeemLoading = false;
let censorshipLoaded = false;
let censorshipLoading = null;
let censorshipRules = normalizeCensorRules(FALLBACK_CENSOR_WORDS.map((word) => ({ word, replacement: "****" })));
let customBackgroundSrc = "";
let customBackgroundReady = false;
let multiplayer = createMultiplayerState();

const input = {
  left: false,
  right: false,
  touchLeft: false,
  touchRight: false,
  swipeBoost: 0,
  gamepadX: 0
};

// ============================================
// CORE GAME FUNCTIONS
// ============================================

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const shouldResetProgress = parsed.saveSeason !== SAVE_SEASON;

      saveState = shouldResetProgress
        ? {
            saveSeason: SAVE_SEASON,
            xp: 0,
            bestScore: 0,
            timeTrialBestScore: 0,
            modeBests: {},
            ownedCharacters: ["regular"],
            equippedCharacter: "regular",
            redeemedCodes: [],
            playerName: typeof parsed.playerName === "string" ? parsed.playerName : "",
            leaderboardRowId: "",
            leaderboardNameLocked: typeof parsed.leaderboardNameLocked === "boolean" ? parsed.leaderboardNameLocked : Boolean(parsed.playerName),
            wins: 0,
            losses: 0,
            winStreak: 0,
            settings: normalizeSettings(parsed.settings)
          }
        : {
            saveSeason: SAVE_SEASON,
            xp: Number.isFinite(parsed.xp) ? parsed.xp : 0,
            bestScore: Number.isFinite(parsed.bestScore) ? parsed.bestScore : 0,
            timeTrialBestScore: Number.isFinite(parsed.timeTrialBestScore) ? parsed.timeTrialBestScore : 0,
            modeBests: parsed.modeBests && typeof parsed.modeBests === "object" ? parsed.modeBests : {},
            ownedCharacters: Array.isArray(parsed.ownedCharacters) ? parsed.ownedCharacters : ["regular"],
            equippedCharacter: typeof parsed.equippedCharacter === "string" ? parsed.equippedCharacter : "regular",
            redeemedCodes: Array.isArray(parsed.redeemedCodes) ? parsed.redeemedCodes : [],
            playerName: typeof parsed.playerName === "string" ? parsed.playerName : "",
            leaderboardRowId: typeof parsed.leaderboardRowId === "string" ? parsed.leaderboardRowId : "",
            leaderboardNameLocked: typeof parsed.leaderboardNameLocked === "boolean" ? parsed.leaderboardNameLocked : Boolean(parsed.playerName),
            wins: Number.isFinite(parsed.wins) ? parsed.wins : 0,
            losses: Number.isFinite(parsed.losses) ? parsed.losses : 0,
            winStreak: Number.isFinite(parsed.winStreak) ? parsed.winStreak : 0,
            settings: normalizeSettings(parsed.settings)
          };
    } catch (error) {
      saveState = {
        saveSeason: SAVE_SEASON,
        xp: 0,
        bestScore: 0,
        timeTrialBestScore: 0,
        modeBests: {},
        ownedCharacters: ["regular"],
        equippedCharacter: "regular",
        redeemedCodes: [],
        playerName: "",
        leaderboardRowId: "",
        leaderboardNameLocked: false,
        wins: 0,
        losses: 0,
        winStreak: 0,
        settings: { ...DEFAULT_SETTINGS }
      };
    }
  }

  saveState.saveSeason = SAVE_SEASON;
  saveState.ownedCharacters = saveState.ownedCharacters
    .map((id) => LEGACY_CHARACTER_IDS[id] || id)
    .filter((id, index, ids) => CHARACTERS.some((character) => character.id === id) && ids.indexOf(id) === index);
  saveState.equippedCharacter = LEGACY_CHARACTER_IDS[saveState.equippedCharacter] || saveState.equippedCharacter;
  saveState.modeBests.classic = Math.max(Number(saveState.modeBests.classic) || 0, saveState.bestScore);
  saveState.modeBests.timeTrial = Math.max(Number(saveState.modeBests.timeTrial) || 0, saveState.timeTrialBestScore);

  if (!saveState.ownedCharacters.includes("regular")) {
    saveState.ownedCharacters.push("regular");
  }

  if (!CHARACTERS.some((character) => character.id === saveState.equippedCharacter)) {
    saveState.equippedCharacter = "regular";
  }

  saveData();
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveState));
  } catch (error) {
    // Ignore localStorage errors
  }
}

function startGame(modeId = "classic", options = {}) {
  if (isAccountBanned()) {
    updateBannedState();
    return;
  }

  stopGameLoop();
  showScreen(gameScreen);
  resizeCanvas();
  resetInput();

  const mode = GAME_MODES[modeId] || GAME_MODES.classic;
  const width = canvas.clientWidth || 420;
  const height = canvas.clientHeight || 720;
  const isOnlineDuel = Boolean(options.onlineDuel);
  const rng = options.seed ? createSeededRandom(options.seed) : Math.random;
  const seeded = seedPlatforms(width, height, mode, rng);
  const startY = height - 95 - 48;

  game = {
    mode: mode.id,
    modeLabel: isOnlineDuel ? "Online Duel" : mode.label,
    modeConfig: mode,
    onlineDuel: isOnlineDuel,
    matchSeed: options.seed || "",
    roomCode: options.roomCode || "",
    width,
    height,
    running: true,
    paused: false,
    countdownActive: true,
    countdownTime: COUNTDOWN_START,
    score: 0,
    xpRun: 0,
    coinsCollected: 0,
    powerupsCollected: 0,
    platformStreak: 0,
    bestPlatformStreak: 0,
    finalXpEarned: 0,
    leaderboardSubmitted: false,
    xpSaved: false,
    rng,
    multiplayerLastStateSentAt: 0,
    multiplayerLastPresenceSentAt: 0,
    multiplayerDeathSent: false,
    antiCheat: null,
    _antiCheatEnabled: !isOnlineDuel,
    runTime: 0,
    timeLimit: mode.timeLimit,
    timeRemaining: mode.timeLimit,
    timeElapsed: 0,
    startY,
    highestPoint: startY,
    cameraY: 0,
    nextPlatformY: seeded.nextY,
    nextPlatformCenter: seeded.nextCenter,
    platforms: seeded.platforms,
    backgroundAds: [],
    nextBackgroundAdAt: BACKGROUND_AD_INTERVAL_SECONDS,
    particles: [],
    effects: {
      xpMultiplier: 1,
      xpMultiplierUntil: 0,
      message: "",
      messageUntil: 0
    },
    player: {
      x: width / 2 - 24,
      y: startY,
      width: 48,
      height: 48,
      maxSize: 76,
      vx: 0,
      vy: getJumpVelocityForRamp(1, mode),
      onScreen: true
    }
  };

  lastFrameTime = performance.now();
  markAntiCheatCheckpoint();
  hideRunOverlays();
  updateCountdownOverlay();
  updateHud();
  drawGame();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function gameLoop(currentTime) {
  const deltaSeconds = Math.min((currentTime - lastFrameTime) / 1000, 1 / 30);
  lastFrameTime = currentTime;

  if (game && game.running) {
    if (!game.paused) {
      updateGame(deltaSeconds);
    }

    if (game.onlineDuel) {
      updateMultiplayerState(deltaSeconds);
      checkMultiplayerDisconnect();
    }

    drawGame();
  }

  animationFrameId = requestAnimationFrame(gameLoop);
}

function updateGame(deltaSeconds) {
  if (!validateAntiCheatCheckpoint()) {
    return;
  }

  game.runTime += deltaSeconds;
  game.timeElapsed += deltaSeconds;

  if (game.timeLimit) {
    game.timeRemaining = Math.max(0, game.timeLimit - game.timeElapsed);

    if (game.timeRemaining <= 0) {
      endGame("timeUp");
      return;
    }
  }

  updateCountdown(deltaSeconds);
  updatePlayer(deltaSeconds);
  updatePlatforms(deltaSeconds);
  updateBackgroundAds();
  updateParticles(deltaSeconds);
  updateEffects(deltaSeconds);

  if (!game.countdownActive) {
    validateAntiCheatFrame(game.antiCheat);
  }

  markAntiCheatCheckpoint();
}

function updateCountdown(deltaSeconds) {
  if (!game.countdownActive) {
    return;
  }

  game.countdownTime -= deltaSeconds;

  if (game.countdownTime <= 0) {
    game.countdownActive = false;
    hideRunOverlays();
  }

  updateCountdownOverlay();
}

function updatePlayer(deltaSeconds) {
  const player = game.player;
  const mode = game.modeConfig;

  if (game.countdownActive) {
    return;
  }

  // Input handling
  const sensitivity = getControlSensitivity();
  const inputX = input.left ? -sensitivity : input.right ? sensitivity : input.gamepadX * sensitivity;

  // Apply input to velocity
  player.vx += inputX * 1200 * deltaSeconds * mode.speedScale;

  // Air resistance
  player.vx *= Math.pow(0.85, deltaSeconds * 60);

  // Gravity
  player.vy += 1800 * deltaSeconds * mode.gravityScale;

  // Update position
  player.x += player.vx * deltaSeconds;
  player.y += player.vy * deltaSeconds;

  // Screen wrapping
  if (player.x + player.width < 0) {
    player.x = game.width;
  } else if (player.x > game.width) {
    player.x = -player.width;
  }

  // Platform collision
  const landed = checkPlatformCollisions();

  // Powerup effects
  updatePlayerEffects(deltaSeconds);

  // Update camera
  updateCamera();

  // Check if player fell off screen
  if (player.y - game.cameraY > game.height + 100) {
    endGame("fell");
  }
}

function checkPlatformCollisions() {
  const player = game.player;
  let landed = false;

  for (const platform of game.platforms) {
    if (!platform.touched && player.vy > 0 && player.y + player.height >= platform.y && player.y + player.height <= platform.y + platform.height + 20) {
      const overlapLeft = Math.max(player.x, platform.x);
      const overlapRight = Math.min(player.x + player.width, platform.x + platform.width);

      if (overlapLeft < overlapRight) {
        // Landed on platform
        player.y = platform.y - player.height;
        player.vy = getBouncePadVelocityForRamp(getModeRamp(), game.modeConfig);

        if (platform.type === "bouncePad") {
          player.vy = Math.min(player.vy, getBouncePadVelocityForRamp(1.9, game.modeConfig));
        }

        platform.touched = true;
        landed = true;

        // Collect coins
        if (platform.coins) {
          game.coinsCollected += platform.coins.length;
          platform.coins = [];
        }

        // Powerup
        if (platform.powerup) {
          collectPowerup(platform.powerup);
          platform.powerup = null;
        }

        // Update score and streak
        game.platformStreak += 1;
        game.bestPlatformStreak = Math.max(game.bestPlatformStreak, game.platformStreak);

        // Effects
        createLandingParticles(platform.x + platform.width / 2, platform.y);
        break;
      }
    }
  }

  if (!landed) {
    game.platformStreak = 0;
  }

  return landed;
}

function updateCamera() {
  const targetY = game.player.y - game.height * 0.4;

  if (targetY < game.cameraY) {
    game.cameraY = targetY;
  }

  if (game.player.y < game.highestPoint) {
    game.highestPoint = game.player.y;
    game.score = Math.max(game.score, Math.floor((game.startY - game.highestPoint) / 10));
  }
}

function generatePlatforms() {
  while (game.nextPlatformY > game.cameraY - 900) {
    const random = game.rng || Math.random;
    const ramp = getModeRamp();
    const gapScale = game.modeConfig.gapScale * Math.min(1.22, 1 + (ramp - 1) * 0.24);
    const type = randomPlatformType(random);
    const width = getPlatformWidth(type);
    const x = pickPlatformX(game.nextPlatformCenter, width, game.width, random);
    game.nextPlatformCenter = x + width / 2;
    game.platforms.push(createPlatform(x, game.nextPlatformY, type, game.modeConfig, game.width, random));
    game.nextPlatformY -= (72 + random() * 48) * gapScale;
  }
}

function prunePlatforms() {
  game.platforms = game.platforms.filter((platform) => !platform.touched && platform.y - game.cameraY < game.height + 140);
}

function updatePlatforms(deltaSeconds) {
  game.platforms.forEach((platform) => {
    if (platform.type !== "moving") {
      return;
    }

    const midpoint = (platform.moveMinX + platform.moveMaxX) / 2;
    const range = Math.max(0, (platform.moveMaxX - platform.moveMinX) / 2);
    platform.x = midpoint + Math.sin(game.runTime * platform.moveSpeed + platform.movePhase) * range;
  });
}

function updateBackgroundAds() {
  if (!game || !Array.isArray(game.backgroundAds)) {
    return;
  }

  game.nextBackgroundAdAt -= 1 / 60;

  if (game.nextBackgroundAdAt <= 0) {
    game.nextBackgroundAdAt = BACKGROUND_AD_INTERVAL_SECONDS;
    const adIndex = Math.floor(Math.random() * backgroundAdImages.length);
    const adImage = backgroundAdImages[adIndex];

    if (adImage) {
      game.backgroundAds.push({
        image: adImage,
        x: Math.random() * (game.width - 200),
        y: game.cameraY - 200,
        width: 200,
        height: 100,
        vy: 0
      });
    }
  }

  game.backgroundAds.forEach((ad) => {
    ad.y += 100 * (1 / 60);
  });

  game.backgroundAds = game.backgroundAds.filter((ad) => ad.y - game.cameraY < game.height + 200);
}

function updateParticles(deltaSeconds) {
  if (!game.particles) {
    return;
  }

  game.particles.forEach((particle) => {
    particle.x += particle.vx * deltaSeconds;
    particle.y += particle.vy * deltaSeconds;
    particle.vx *= 0.98;
    particle.vy += 400 * deltaSeconds;
    particle.life -= deltaSeconds;
  });

  game.particles = game.particles.filter((particle) => particle.life > 0);
}

function updateEffects(deltaSeconds) {
  const effects = game.effects;

  if (effects.xpMultiplierUntil > 0) {
    effects.xpMultiplierUntil -= deltaSeconds;

    if (effects.xpMultiplierUntil <= 0) {
      effects.xpMultiplier = 1;
      effects.message = "";
    }
  }

  if (effects.messageUntil > 0) {
    effects.messageUntil -= deltaSeconds;
  }
}

function updatePlayerEffects(deltaSeconds) {
  const player = game.player;
  const effects = game.effects;

  // Size effects
  if (player.width > 48) {
    player.width = Math.max(48, player.width - 20 * deltaSeconds);
    player.height = Math.max(48, player.height - 20 * deltaSeconds);
  }

  // XP multiplier
  if (effects.xpMultiplier > 1) {
    game.xpRun += Math.floor(game.score / 100) * (effects.xpMultiplier - 1) * deltaSeconds;
  }
}

function endGame(reason = "fell") {
  if (!game || !game.running) {
    return;
  }

  if (game.onlineDuel) {
    handleLocalMultiplayerDeath(reason);
    return;
  }

  game.running = false;
  game.paused = false;
  pauseOverlay.classList.add("hidden");
  countdownOverlay.classList.add("hidden");
  const scoreXp = Math.floor(game.score / 20);
  const earned = scoreXp + game.xpRun;
  game.finalXpEarned = earned;
  saveState.xp += earned;
  saveState.modeBests[game.mode] = Math.max(getModeBest(game.mode), game.score);
  saveState.bestScore = saveState.modeBests.classic || 0;
  saveState.timeTrialBestScore = saveState.modeBests.timeTrial || 0;

  saveData();

  restartButton.textContent = "Restart";
  gameOverMessage.classList.add("hidden");
  gameOverMessage.textContent = "";
  gameOverTitle.textContent = reason === "timeUp" ? "Time Up" : reason === "paused" ? "Run Ended" : "Game Over";
  finalScore.textContent = game.score;
  finalBest.textContent = getModeBest(game.mode);
  finalTotalXp.textContent = saveState.xp;
  prepareLeaderboardSubmit();
  gameOverOverlay.classList.remove("hidden");
  autoSubmitLeaderboardScore();
}

function togglePause() {
  if (!game || !game.running || game.onlineDuel) {
    return;
  }

  game.paused = !game.paused;

  if (game.paused) {
    pauseOverlay.classList.remove("hidden");
  } else {
    pauseOverlay.classList.add("hidden");
  }
}

// ============================================
// ANTI-CHEAT SYSTEM
// ============================================

function markAntiCheatCheckpoint() {
  if (!game || !game.running) {
    return;
  }

  game.antiCheat = getAntiCheatSnapshot();
}

function getAntiCheatSnapshot() {
  if (!game || !game.player) {
    return null;
  }

  const player = game.player;

  return {
    x: player.x,
    y: player.y,
    vx: player.vx,
    vy: player.vy,
    width: player.width,
    height: player.height,
    score: game.score,
    time: game.runTime
  };
}

function isAntiCheatSnapshotFinite(snapshot) {
  return snapshot &&
    Number.isFinite(snapshot.x) &&
    Number.isFinite(snapshot.y) &&
    Number.isFinite(snapshot.vx) &&
    Number.isFinite(snapshot.vy) &&
    Number.isFinite(snapshot.width) &&
    Number.isFinite(snapshot.height) &&
    Number.isFinite(snapshot.score);
}

function validateAntiCheatCheckpoint() {
  if (!game || !game.running || game.countdownActive || game.paused || !game._antiCheatEnabled) {
    return true;
  }

  const previous = game.antiCheat;
  const current = getAntiCheatSnapshot();

  if (!previous || !current) {
    markAntiCheatCheckpoint();
    return true;
  }

  if (!isAntiCheatSnapshotFinite(current)) {
    triggerAntiCheat("invalid player state");
    return false;
  }

  const positionChanged = Math.abs(current.x - previous.x) > ANTI_CHEAT_POSITION_TOLERANCE
    || Math.abs(current.y - previous.y) > ANTI_CHEAT_POSITION_TOLERANCE;
  const velocityChanged = Math.abs(current.vx - previous.vx) > ANTI_CHEAT_VELOCITY_TOLERANCE
    || Math.abs(current.vy - previous.vy) > ANTI_CHEAT_VELOCITY_TOLERANCE;
  const sizeChanged = Math.abs(current.width - previous.width) > 0.5
    || Math.abs(current.height - previous.height) > 0.5;
  const scoreChanged = current.score - previous.score > ANTI_CHEAT_SCORE_TOLERANCE;

  if (positionChanged || velocityChanged || sizeChanged || scoreChanged) {
    triggerAntiCheat("external movement change");
    return false;
  }

  return true;
}

function validateAntiCheatFrame(previous) {
  if (!game || !game.running || !game._antiCheatEnabled || !previous) {
    return true;
  }

  const current = getAntiCheatSnapshot();

  if (!isAntiCheatSnapshotFinite(current)) {
    triggerAntiCheat("invalid player state");
    return false;
  }

  const dx = Math.abs(current.x - previous.x);
  const dy = current.y - previous.y;
  const upwardStep = Math.max(0, -dy);
  const downwardStep = Math.max(0, dy);
  const expectedScoreLimit = Math.max(0, Math.floor((game.startY - game.highestPoint) / 10)) + 12;
  const maxUpwardVelocity = Math.abs(getBouncePadVelocityForRamp(1.9, game.modeConfig)) + 360;
  const maxHorizontalVelocity = 900 * getControlSensitivity() * game.modeConfig.speedScale;

  if (dx > ANTI_CHEAT_MAX_HORIZONTAL_STEP && !isAllowedHorizontalWrap(previous, current)) {
    triggerAntiCheat("impossible horizontal movement");
    return false;
  }

  if (upwardStep > ANTI_CHEAT_MAX_UPWARD_STEP || downwardStep > ANTI_CHEAT_MAX_DOWNWARD_STEP) {
    triggerAntiCheat("impossible vertical movement");
    return false;
  }

  if (current.vy < -maxUpwardVelocity || Math.abs(current.vx) > maxHorizontalVelocity) {
    triggerAntiCheat("impossible velocity");
    return false;
  }

  if (current.width > game.player.maxSize || current.height > game.player.maxSize || current.width < 42 || current.height < 42) {
    triggerAntiCheat("invalid player size");
    return false;
  }

  if (current.score > expectedScoreLimit) {
    triggerAntiCheat("impossible score");
    return false;
  }

  return true;
}

function isAllowedHorizontalWrap(previous, current) {
  const width = game.width;

  if (previous.x < 0 && current.x > width - 50) {
    return Math.abs(current.x - (previous.x + width)) < ANTI_CHEAT_MAX_HORIZONTAL_STEP;
  }

  if (previous.x > width - 50 && current.x < 0) {
    return Math.abs(current.x - (previous.x - width)) < ANTI_CHEAT_MAX_HORIZONTAL_STEP;
  }

  return false;
}

function triggerAntiCheat(reason) {
  console.warn("Anti-cheat triggered:", reason);
  window.location.href = CHEAT_REDIRECT_URL;
}

// ============================================
// UI MANAGEMENT
// ============================================

function showScreen(screen) {
  allScreens.forEach((s) => s.classList.add("hidden"));
  screen.classList.remove("hidden");
  screen.classList.add("active");
}

function updateHud() {
  if (!game) {
    return;
  }

  hudMode.textContent = game.modeLabel;
  hudScore.textContent = game.score;
  hudXp.textContent = game.xpRun;

  if (game.timeLimit) {
    hudTimerWrap.classList.remove("hidden");
    const minutes = Math.floor(game.timeRemaining / 60);
    const seconds = Math.floor(game.timeRemaining % 60);
    hudTimer.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  } else {
    hudTimerWrap.classList.add("hidden");
  }

  if (game.effects.message) {
    hudPowerup.classList.remove("hidden");
    hudPowerupMessage.textContent = game.effects.message;
  } else {
    hudPowerup.classList.add("hidden");
  }
}

function updateCountdownOverlay() {
  if (!game || !game.countdownActive) {
    countdownOverlay.classList.add("hidden");
    return;
  }

  countdownOverlay.classList.remove("hidden");
  const count = Math.ceil(game.countdownTime);

  if (count > 0) {
    countdownText.textContent = count;
  } else {
    countdownText.textContent = "GO!";
  }
}

function hideRunOverlays() {
  countdownOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
}

function updateMenuStats() {
  menuXp.textContent = saveState.xp;
  menuBest.textContent = saveState.bestScore;
  menuTrialBest.textContent = saveState.timeTrialBestScore;
  menuPlayerName.textContent = getSavedLeaderboardName() || "Player";
  menuCharacterImage.src = getCharacter(saveState.equippedCharacter).asset;
  menuCharacterImage.alt = getCharacter(saveState.equippedCharacter).name;
}

// ============================================
// LEADERBOARD SYSTEM
// ============================================

function showLeaderboardToast() {
  leaderboardToast.classList.remove("hidden");
  leaderboardType = "classic"; // Default to classic when opening
  loadLeaderboard();
  updateLeaderboardTabDisplay();
}

function hideLeaderboardToast() {
  leaderboardToast.classList.add("hidden");
}

async function loadLeaderboard() {
  if (!leaderboardClient || leaderboardLoading) {
    if (!leaderboardClient) {
      renderLeaderboardError("Leaderboard offline.");
    }
    return;
  }

  leaderboardLoading = true;
  leaderboardStatus.textContent = "Loading scores...";
  leaderboardList.innerHTML = "";

  await loadCensoredWords();

  const { data, error } = await leaderboardClient
    .from(LEADERBOARD_TABLE)
    .select("player_name, score, mode_label, character_id, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(LEADERBOARD_LIMIT);

  leaderboardLoading = false;

  if (error) {
    renderLeaderboardError("Could not load scores.");
    return;
  }

  renderLeaderboard(data || []);
}

function renderLeaderboard(scores) {
  leaderboardList.innerHTML = "";

  if (!scores.length) {
    leaderboardStatus.textContent = "No scores yet.";
    return;
  }

  leaderboardStatus.textContent = "";

  scores.forEach((entry, index) => {
    const row = document.createElement("li");
    const rank = document.createElement("strong");
    const player = document.createElement("span");
    const playerName = document.createElement("strong");
    const meta = document.createElement("span");
    const score = document.createElement("strong");
    const character = getCharacter(entry.character_id);

    rank.className = "leaderboard-rank";
    rank.textContent = `#${index + 1}`;
    player.className = "leaderboard-player";
    playerName.textContent = censorLeaderboardName(entry.player_name);
    meta.textContent = `${entry.mode_label || "Classic"} - ${character.name}`;
    score.className = "leaderboard-score";
    score.textContent = entry.score;

    player.append(playerName, meta);
    row.append(rank, player, score);
    leaderboardList.appendChild(row);
  });
}

function renderLeaderboardError(message) {
  leaderboardList.innerHTML = "";
  leaderboardStatus.textContent = message;
}

function prepareLeaderboardSubmit() {
  if (game && game.onlineDuel) {
    leaderboardSubmitCard.classList.add("hidden");
    leaderboardSubmitMessage.textContent = "Online duel scores stay out of the global leaderboard.";
    return;
  }

  const hasScore = game && game.score > 0;
  const signedIn = isSignedIn();
  const lockedName = signedIn ? getSavedLeaderboardName() : getLockedLeaderboardName();
  const submitted = Boolean(game && game.leaderboardSubmitted);
  const canAutoSubmit = signedIn && hasScore && leaderboardClient && lockedName && !submitted;

  leaderboardSubmitCard.classList.remove("hidden");
  leaderboardSubmitCard.classList.remove("success", "error");
  leaderboardNameInput.value = lockedName || saveState.playerName || "";
  leaderboardNameInput.disabled = signedIn || Boolean(lockedName) || !hasScore || !leaderboardClient || submitted;
  submitScoreButton.disabled = !signedIn || !lockedName || !hasScore || !leaderboardClient || submitted;
  submitScoreButton.textContent = signedIn ? "Auto" : "Save";

  if (!leaderboardClient) {
    leaderboardSubmitMessage.textContent = "Leaderboard is offline.";
  } else if (!signedIn) {
    leaderboardSubmitMessage.textContent = "Sign in to save leaderboard scores.";
  } else if (!hasScore) {
    leaderboardSubmitMessage.textContent = "Score points to submit.";
  } else if (submitted) {
    leaderboardSubmitMessage.textContent = "Score saved.";
    leaderboardSubmitCard.classList.add("success");
  } else if (canAutoSubmit) {
    leaderboardSubmitMessage.textContent = `Auto-saving as ${lockedName}.`;
  } else if (!lockedName) {
    leaderboardSubmitMessage.textContent = "Add an account name in Settings.";
  } else {
    leaderboardSubmitMessage.textContent = "Ready to save.";
  }
}

async function submitLeaderboardScore(nameOverride = leaderboardNameInput.value, isAutoSubmit = false) {
  if (!leaderboardClient || !game || game.leaderboardSubmitted || !isSignedIn()) {
    setLeaderboardSubmitMessage("Sign in to save scores.", "error");
    return;
  }

  await loadCensoredWords();

  const previousLockedName = getLockedLeaderboardName();
  const playerName = sanitizeAndCensorLeaderboardName(getSavedLeaderboardName() || nameOverride);
  const nameError = getLeaderboardNameError(playerName);

  if (nameError) {
    setLeaderboardSubmitMessage(nameError, "error");
    return;
  }

  leaderboardLoading = true;
  setLeaderboardSubmitMessage("Saving score...", "");

  const { data, error } = await leaderboardClient
    .from(LEADERBOARD_TABLE)
    .upsert({
      user_id: authState.user.id,
      player_name: playerName,
      score: game.score,
      mode_id: game.mode,
      mode_label: game.modeLabel,
      character_id: saveState.equippedCharacter,
      xp_earned: game.finalXpEarned
    }, {
      onConflict: "user_id"
    })
    .select("id")
    .single();

  leaderboardLoading = false;

  if (error) {
    setLeaderboardSubmitMessage("Failed to save score.", "error");
    return;
  }

  game.leaderboardSubmitted = true;
  saveState.leaderboardRowId = data.id;
  saveState.playerName = playerName;
  saveState.leaderboardNameLocked = true;
  saveData();

  setLeaderboardSubmitMessage("Score saved!", "success");
  updateMenuStats();

  if (!isAutoSubmit) {
    queueProfileSync();
  }
}

function autoSubmitLeaderboardScore() {
  if (game && game.score > 0 && isSignedIn() && getSavedLeaderboardName() && leaderboardClient && !game.leaderboardSubmitted) {
    submitLeaderboardScore(undefined, true);
  }
}

function setLeaderboardSubmitMessage(message, type = "") {
  leaderboardSubmitMessage.textContent = message;
  leaderboardSubmitCard.classList.remove("success", "error");

  if (type) {
    leaderboardSubmitCard.classList.add(type);
  }
}

// ============================================
// AUTHENTICATION SYSTEM
// ============================================

function initAuth() {
  leaderboardClient = createLeaderboardClient();

  if (!leaderboardClient) {
    return;
  }

  leaderboardClient.auth.onAuthStateChange(async (event, session) => {
    authState.session = session;
    authState.user = session?.user || null;

    if (event === "SIGNED_IN" && session) {
      await loadProfile();
      updateMenuStats();
    } else if (event === "SIGNED_OUT") {
      authState.profile = null;
      authState.profileLoaded = false;
      saveState.leaderboardRowId = "";
      saveData();
      updateMenuStats();
    }

    updateAuthUI();
  });

  // Try to restore session
  leaderboardClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      authState.session = session;
      authState.user = session.user;
      loadProfile();
    }

    updateAuthUI();
  });
}

async function loadProfile() {
  if (!authState.user || authState.profileLoaded) {
    return;
  }

  authState.profileLoaded = true;

  const { data, error } = await leaderboardClient
    .from(PROFILE_TABLE)
    .select("*")
    .eq("user_id", authState.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to load profile:", error);
    return;
  }

  if (data) {
    authState.profile = data;
    applyRemoteProfile(data);
  } else {
    // Create profile
    await saveProfileNow();
  }
}

function applyRemoteProfile(profile) {
  if (authState.applyingRemote) {
    return;
  }

  authState.applyingRemote = true;

  const remote = {
    xp: Number(profile.xp) || 0,
    bestScore: Number(profile.mode_bests?.classic) || 0,
    timeTrialBestScore: Number(profile.mode_bests?.timeTrial) || 0,
    modeBests: profile.mode_bests || {},
    ownedCharacters: profile.owned_characters || ["regular"],
    equippedCharacter: profile.equipped_character || "regular",
    redeemedCodes: profile.redeemed_codes || [],
    playerName: profile.display_name || "",
    leaderboardRowId: profile.leaderboard_row_id || "",
    wins: Number(profile.wins) || 0,
    losses: Number(profile.losses) || 0,
    winStreak: Number(profile.win_streak) || 0
  };

  // Merge local and remote data
  saveState.xp = Math.max(saveState.xp, remote.xp);
  saveState.bestScore = Math.max(saveState.bestScore, remote.bestScore);
  saveState.timeTrialBestScore = Math.max(saveState.timeTrialBestScore, remote.timeTrialBestScore);
  saveState.modeBests = { ...saveState.modeBests, ...remote.modeBests };
  saveState.ownedCharacters = [...new Set([...saveState.ownedCharacters, ...remote.ownedCharacters])];
  saveState.equippedCharacter = saveState.equippedCharacter || remote.equippedCharacter;
  saveState.redeemedCodes = [...new Set([...saveState.redeemedCodes, ...remote.redeemedCodes])];
  saveState.playerName = saveState.playerName || remote.playerName;
  saveState.leaderboardRowId = saveState.leaderboardRowId || remote.leaderboardRowId;
  saveState.wins = Math.max(saveState.wins, remote.wins);
  saveState.losses = Math.max(saveState.losses, remote.losses);
  saveState.winStreak = Math.max(saveState.winStreak, remote.winStreak);

  saveData();
  authState.applyingRemote = false;
}

function createProfilePayload(includeUserId = false) {
  const payload = {
    display_name: getSavedLeaderboardName() || "",
    xp: Math.max(0, Math.round(Number(saveState.xp) || 0)),
    owned_characters: normalizeOwnedCharacters(saveState.ownedCharacters),
    equipped_character: normalizeEquippedCharacter(saveState.equippedCharacter),
    redeemed_codes: normalizeStringList(saveState.redeemedCodes),
    mode_bests: normalizeModeBests(saveState.modeBests),
    leaderboard_row_id: saveState.leaderboardRowId || null,
    wins: Math.max(0, Math.round(Number(saveState.wins) || 0)),
    losses: Math.max(0, Math.round(Number(saveState.losses) || 0)),
    win_streak: Math.max(0, Math.round(Number(saveState.winStreak) || 0))
  };

  if (includeUserId && authState.user) {
    payload.user_id = authState.user.id;
  }

  return payload;
}

function queueProfileSync() {
  if (!canSyncProfile()) {
    return;
  }

  clearTimeout(authState.syncTimer);
  authState.syncTimer = window.setTimeout(saveProfileNow, PROFILE_SYNC_DELAY);
}

async function saveProfileNow() {
  if (!canSyncProfile() || authState.syncInFlight) {
    return;
  }

  authState.syncInFlight = true;
  authState.pendingSync = false;

  const payload = createProfilePayload(true);

  const { error } = await leaderboardClient
    .from(PROFILE_TABLE)
    .upsert(payload, {
      onConflict: "user_id"
    });

  authState.syncInFlight = false;

  if (error) {
    console.error("Failed to save profile:", error);
    // Retry later
    if (!authState.pendingSync) {
      authState.pendingSync = true;
      setTimeout(saveProfileNow, 5000);
    }
  }
}

function canSyncProfile() {
  return Boolean(authState.user && leaderboardClient);
}

function isSignedIn() {
  return Boolean(authState.user);
}

function isAccountBanned() {
  return Boolean(authState.profile?.banned);
}

function getSavedLeaderboardName() {
  if (saveState.leaderboardNameLocked && saveState.playerName) {
    return saveState.playerName;
  }

  if (authState.profile?.display_name) {
    return authState.profile.display_name;
  }

  return "";
}

function getLockedLeaderboardName() {
  return saveState.leaderboardNameLocked ? saveState.playerName : "";
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function createLeaderboardClient() {
  if (!window.BOUNCE_EJ_SUPABASE || !window.supabase || typeof window.supabase.createClient !== "function") {
    return null;
  }

  return window.supabase.createClient(
    window.BOUNCE_EJ_SUPABASE.url,
    window.BOUNCE_EJ_SUPABASE.publishableKey
  );
}

function collectPowerup(powerup) {
  if (!powerup || !powerupDefinitions.length) {
    return;
  }

  const definition = powerupDefinitions.find((def) => def.id === powerup.id);

  if (!definition) {
    return;
  }

  game.powerupsCollected += 1;

  if (definition.effect === "grow") {
    game.player.width = Math.min(game.player.maxSize, game.player.width + definition.sizeBonus);
    game.player.height = Math.min(game.player.maxSize, game.player.height + definition.sizeBonus);
  } else if (definition.effect === "doubleXp") {
    game.effects.xpMultiplier = definition.xpMultiplier;
    game.effects.xpMultiplierUntil = game.runTime + definition.duration;
    game.effects.message = definition.message;
    game.effects.messageUntil = game.runTime + definition.duration;
  } else if (definition.effect === "boost") {
    game.player.vy = Math.min(game.player.vy, definition.boostVelocity);
  }

  gainRunXp(5);
  createPowerupParticles(powerup.x + powerup.width / 2, powerup.y);
}

function createLandingParticles(x, y) {
  if (!saveState.settings.particles || !game.particles) {
    return;
  }

  for (let i = 0; i < 8; i++) {
    game.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200 - 100,
      life: 0.5 + Math.random() * 0.5,
      color: "#35c2ff"
    });
  }
}

function createPowerupParticles(x, y) {
  if (!saveState.settings.particles || !game.particles) {
    return;
  }

  for (let i = 0; i < 12; i++) {
    game.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 300,
      vy: (Math.random() - 0.5) * 300 - 150,
      life: 0.8 + Math.random() * 0.4,
      color: "#f5c542"
    });
  }
}

function gainRunXp(amount) {
  game.xpRun += amount;
}

function seedPlatforms(width, height, mode, rng) {
  const platforms = [];
  const startY = height - 95 - 48;
  let nextY = startY - 200;
  let nextCenter = width / 2;

  // Starting platform
  platforms.push(createPlatform(width / 2 - 60, startY + 48, "normal", mode, width, rng));

  // Generate platforms going up
  while (nextY > -1000) {
    const gapScale = mode.gapScale * Math.min(1.22, 1 + (Math.floor((startY - nextY) / 1000) * 0.1));
    const type = randomPlatformType(rng);
    const width = getPlatformWidth(type);
    const x = pickPlatformX(nextCenter, width, game.width, rng);
    nextCenter = x + width / 2;
    platforms.push(createPlatform(x, nextY, type, mode, game.width, rng));
    nextY -= (72 + rng() * 48) * gapScale;
  }

  return { platforms, nextY, nextCenter };
}

function randomPlatformType(rng) {
  const random = rng();
  const ramp = getModeRamp();

  if (random < 0.02 * ramp) {
    return "bouncePad";
  }

  if (random < 0.08 * ramp) {
    return "moving";
  }

  return "normal";
}

function getPlatformWidth(type) {
  switch (type) {
    case "bouncePad":
      return 80;
    case "moving":
      return 120;
    default:
      return 120;
  }
}

function pickPlatformX(center, width, canvasWidth, rng) {
  const minX = Math.max(0, center - 180 - width / 2);
  const maxX = Math.min(canvasWidth - width, center + 180 - width / 2);
  const range = maxX - minX;

  if (range <= 0) {
    return Math.max(0, Math.min(canvasWidth - width, center - width / 2));
  }

  return minX + rng() * range;
}

function createPlatform(x, y, type, mode, canvasWidth, rng) {
  const platform = {
    x,
    y,
    width: getPlatformWidth(type),
    height: 24,
    type,
    touched: false,
    coins: [],
    powerup: null
  };

  // Add coins
  if (type === "normal" && rng() < 0.3) {
    const coinCount = Math.floor(rng() * 3) + 1;

    for (let i = 0; i < coinCount; i++) {
      platform.coins.push({
        x: x + (i + 0.5) * (platform.width / coinCount),
        y: y - 24
      });
    }
  }

  // Add powerup
  if (type === "normal" && rng() < mode.powerupChance) {
    const powerupIndex = Math.floor(rng() * powerupDefinitions.length);
    const powerupDef = powerupDefinitions[powerupIndex];

    if (powerupDef) {
      platform.powerup = {
        id: powerupDef.id,
        x: x + platform.width / 2 - 16,
        y: y - 32,
        width: 32,
        height: 32
      };
    }
  }

  // Moving platform properties
  if (type === "moving") {
    platform.moveMinX = Math.max(0, x - 60);
    platform.moveMaxX = Math.min(canvasWidth - platform.width, x + 60);
    platform.moveSpeed = 1 + rng() * 2;
    platform.movePhase = rng() * Math.PI * 2;
  }

  return platform;
}

function loadCharacterImages() {
  CHARACTERS.forEach((character) => {
    const img = new Image();
    img.src = character.asset;
    characterImages[character.id] = img;
  });
}

function loadBackgroundAdImages() {
  BACKGROUND_AD_ASSETS.forEach((asset) => {
    const img = new Image();
    img.src = asset;
    backgroundAdImages.push(img);
  });
}

async function loadCensoredWords() {
  if (censorshipLoaded) {
    return;
  }

  if (censorshipLoading) {
    await censorshipLoading;
    return;
  }

  censorshipLoading = (async () => {
    if (!leaderboardClient) {
      censorshipLoaded = true;
      return;
    }

    const { data, error } = await leaderboardClient
      .from(CENSOR_TABLE)
      .select("word, replacement");

    if (error) {
      console.error("Failed to load censorship rules:", error);
      censorshipLoaded = true;
      return;
    }

    censorshipRules = normalizeCensorRules(data || []);
    censorshipLoaded = true;
  })();

  await censorshipLoading;
}

function updateBannedState() {
  bannedScreen.classList.remove("hidden");
}

function resetInput() {
  input.left = false;
  input.right = false;
  input.touchLeft = false;
  input.touchRight = false;
  input.swipeBoost = 0;
  input.gamepadX = 0;
}

function setPaused(paused) {
  if (!game || !game.running || game.onlineDuel) {
    return;
  }

  game.paused = paused;

  if (game.paused) {
    pauseOverlay.classList.remove("hidden");
  } else {
    pauseOverlay.classList.add("hidden");
  }
}

function drawGame() {
  if (!game || !ctx) {
    return;
  }

  const theme = THEMES[saveState.settings.theme] || THEMES.blue;

  // Clear canvas
  ctx.fillStyle = theme.canvasBg;
  ctx.fillRect(0, 0, game.width, game.height);

  // Background image
  if (customBackgroundReady && customBackgroundImage.complete) {
    ctx.globalAlpha = 0.3;
    const imgAspect = customBackgroundImage.width / customBackgroundImage.height;
    const canvasAspect = game.width / game.height;
    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > canvasAspect) {
      drawWidth = game.height * imgAspect;
      drawHeight = game.height;
      drawX = (game.width - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = game.width;
      drawHeight = game.width / imgAspect;
      drawX = 0;
      drawY = (game.height - drawHeight) / 2;
    }

    ctx.drawImage(customBackgroundImage, drawX, drawY, drawWidth, drawHeight);
    ctx.globalAlpha = 1;
  }

  // Background rays
  ctx.strokeStyle = theme.canvasRayLight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, game.height);
  ctx.lineTo(game.width, 0);
  ctx.stroke();

  ctx.strokeStyle = theme.canvasRayDark;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(game.width, game.height);
  ctx.stroke();

  // Background ads
  game.backgroundAds.forEach((ad) => {
    if (ad.image && ad.image.complete) {
      ctx.drawImage(ad.image, ad.x, ad.y, ad.width, ad.height);
    }
  });

  ctx.save();
  ctx.translate(0, -game.cameraY);

  // Platforms
  ctx.fillStyle = "#ffffff";
  game.platforms.forEach((platform) => {
    if (platform.y - game.cameraY > game.height + 100) {
      return;
    }

    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    // Coins
    platform.coins.forEach((coin) => {
      ctx.fillStyle = "#f5c542";
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
    });

    // Powerup
    if (platform.powerup) {
      const powerupDef = powerupById[platform.powerup.id];
      ctx.fillStyle = "#f5c542";
      ctx.fillRect(platform.powerup.x, platform.powerup.y, platform.powerup.width, platform.powerup.height);

      if (powerupDef?.emoji) {
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText(powerupDef.emoji, platform.powerup.x + platform.powerup.width / 2, platform.powerup.y + platform.powerup.height / 2 + 7);
      }
    }
  });

  // Particles
  game.particles.forEach((particle) => {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.life;
    ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
  });
  ctx.globalAlpha = 1;

  // Player
  const character = getCharacter(saveState.equippedCharacter);
  const playerImg = characterImages[character.id];

  if (playerImg && playerImg.complete) {
    ctx.drawImage(playerImg, game.player.x, game.player.y, game.player.width, game.player.height);
  } else {
    // Fallback to colored rectangle
    ctx.fillStyle = character.fill;
    ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
    ctx.strokeStyle = character.ring;
    ctx.lineWidth = 2;
    ctx.strokeRect(game.player.x, game.player.y, game.player.width, game.player.height);
  }

  ctx.restore();

  // Platform line
  ctx.strokeStyle = theme.canvasLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, game.height - 95);
  ctx.lineTo(game.width, game.height - 95);
  ctx.stroke();

  updateHud();
}

function hashSeed(seed) {
  const text = String(seed || "bounce-ej");
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0 || 1;
}

function normalizeCharacters(characters) {
  return characters.map((character) => ({
    ...character,
    asset: `${CHARACTER_ASSET_BASE_PATH}${character.file}`
  }));
}

function normalizePowerups(powerups) {
  return powerups.map((powerup) => ({
    ...powerup,
    emoji: powerup.emoji || "❓"
  }));
}

function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) || CHARACTERS[0];
}

function getModeRamp() {
  if (!game) {
    return 1;
  }

  const height = game.startY - game.highestPoint;
  const ramp = 1 + Math.floor(height / 1000) * 0.1;
  return Math.min(ramp, 2);
}

function getModeBest(mode) {
  return saveState.modeBests[mode] || 0;
}

function getJumpVelocityForRamp(ramp, mode) {
  return -Math.sqrt(2 * 1800 * 120 * ramp * mode.jumpScale);
}

function getBouncePadVelocityForRamp(ramp, mode) {
  return -Math.sqrt(2 * 1800 * 140 * ramp * mode.jumpScale);
}

function getControlSensitivity() {
  return saveState.settings.sensitivity || 1;
}

function normalizeSettings(settings) {
  return {
    theme: THEMES[settings?.theme] ? settings.theme : "blue",
    particles: Boolean(settings?.particles ?? true),
    showGamepadStatus: Boolean(settings?.showGamepadStatus ?? true),
    sensitivity: Math.max(0.5, Math.min(2, Number(settings?.sensitivity) || 1)),
    backgroundImage: typeof settings?.backgroundImage === "string" ? settings.backgroundImage : "",
    backgroundName: typeof settings?.backgroundName === "string" ? settings.backgroundName : ""
  };
}

function normalizeOwnedCharacters(characters) {
  return characters.filter((id) => CHARACTERS.some((character) => character.id === id));
}

function normalizeEquippedCharacter(character) {
  return CHARACTERS.some((c) => c.id === character) ? character : "regular";
}

function normalizeStringList(list) {
  return list.filter((item) => typeof item === "string" && item.length > 0);
}

function normalizeModeBests(bests) {
  const normalized = {};

  for (const mode in bests) {
    const value = Number(bests[mode]);
    if (Number.isFinite(value) && value >= 0) {
      normalized[mode] = value;
    }
  }

  return normalized;
}

function normalizeCensorRules(rules) {
  return rules.map((rule) => ({
    word: String(rule.word || "").toLowerCase(),
    replacement: String(rule.replacement || "****")
  }));
}

function censorLeaderboardName(name) {
  if (!name || !censorshipRules.length) {
    return name;
  }

  let censored = String(name).toLowerCase();

  for (const rule of censorshipRules) {
    const regex = new RegExp(`\\b${rule.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    censored = censored.replace(regex, rule.replacement);
  }

  return censored;
}

function sanitizeLeaderboardName(name) {
  return String(name || "").replace(/[^\w\s\-_]/g, "").slice(0, 18).trim();
}

function sanitizeAndCensorLeaderboardName(name) {
  return censorLeaderboardName(sanitizeLeaderboardName(name));
}

function getLeaderboardNameError(name) {
  if (!name || name.length < 1) {
    return "Name is required.";
  }

  if (name.length > 18) {
    return "Name is too long.";
  }

  if (!/^[A-Za-z0-9\s\-_]+$/.test(name)) {
    return "Name contains invalid characters.";
  }

  return null;
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
  // Menu buttons
  playButton.addEventListener("click", () => startGame());
  gameModesButton.addEventListener("click", () => showScreen(modesScreen));
  multiplayerButton.addEventListener("click", showMultiplayer);
  storeButton.addEventListener("click", () => showScreen(storeScreen));
  characterButton.addEventListener("click", () => showScreen(characterScreen));
  controlsButton.addEventListener("click", () => showScreen(controlsScreen));

  // Navigation
  modeBackButton.addEventListener("click", () => showScreen(menuScreen));
  storeBackButton.addEventListener("click", () => showScreen(menuScreen));
  characterBackButton.addEventListener("click", () => showScreen(menuScreen));
  controlsBackButton.addEventListener("click", () => showScreen(menuScreen));
  multiplayerBackButton.addEventListener("click", showMenu);

  // Game controls
  restartButton.addEventListener("click", () => {
    if (game && game.onlineDuel) {
      resetMultiplayerLobby();
    } else {
      startGame(game?.mode || "classic");
    }
  });
  mainMenuButton.addEventListener("click", showMenu);
  pauseResumeButton.addEventListener("click", () => setPaused(false));
  pauseEndButton.addEventListener("click", () => endGame("paused"));

  // Settings
  particlesToggle.addEventListener("change", (event) => {
    saveState.settings.particles = event.target.checked;
    saveData();
  });
  gamepadBadgeToggle.addEventListener("change", (event) => {
    saveState.settings.showGamepadStatus = event.target.checked;
    saveData();
  });
  sensitivitySlider.addEventListener("input", (event) => {
    const value = Number(event.target.value) / 100;
    saveState.settings.sensitivity = value;
    sensitivityValue.textContent = `${value * 100}%`;
    saveData();
  });

  // Leaderboard
  leaderboardButton.addEventListener("click", showLeaderboardToast);
  leaderboardRefreshButton.addEventListener("click", () => {
    leaderboardType = leaderboardType === "classic" ? "multiplayer" : "classic";
    if (leaderboardType === "classic") {
      loadLeaderboard();
    } else {
      loadMultiplayerLeaderboard();
    }
    updateLeaderboardTabDisplay();
  });
  leaderboardCloseButton.addEventListener("click", hideLeaderboardToast);
  leaderboardToast.addEventListener("click", (event) => {
    if (event.target === leaderboardToast) {
      hideLeaderboardToast();
    }
  });
  leaderboardNameInput.addEventListener("input", () => {
    const cleaned = sanitizeLeaderboardName(leaderboardNameInput.value);

    if (leaderboardNameInput.value !== cleaned) {
      leaderboardNameInput.value = cleaned;
    }
  });
  leaderboardNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submitLeaderboardScore();
    }
  });

  // Auth
  authOpenButton.addEventListener("click", () => authOverlay.classList.remove("hidden"));
  authCloseButton.addEventListener("click", () => authOverlay.classList.add("hidden"));
  authOverlay.addEventListener("click", (event) => {
    if (event.target === authOverlay) {
      authOverlay.classList.add("hidden");
    }
  });
  authSignInButton.addEventListener("click", signIn);
  authSignUpButton.addEventListener("click", signUp);
  authSignOutButton.addEventListener("click", signOut);
  authNameInput.addEventListener("input", () => {
    const cleaned = sanitizeLeaderboardName(authNameInput.value);

    if (authNameInput.value !== cleaned) {
      authNameInput.value = cleaned;
    }
  });

  // Settings leaderboard name
  settingsLeaderboardNameButton.addEventListener("click", updateLeaderboardName);
  settingsLeaderboardNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      updateLeaderboardName();
    }
  });

  // Background upload
  backgroundUploadInput.addEventListener("change", handleBackgroundUpload);
  clearBackgroundButton.addEventListener("click", clearBackground);

  // Input handling
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Gamepad
  window.addEventListener("gamepadconnected", handleGamepadConnected);
  window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

  // Resize
  window.addEventListener("resize", resizeCanvas);
}

function showMenu() {
  showScreen(menuScreen);
  updateMenuStats();
}

function updateAuthUI() {
  const signedIn = isSignedIn();
  const banned = isAccountBanned();

  if (banned) {
    bannedScreen.classList.remove("hidden");
    return;
  }

  bannedScreen.classList.add("hidden");

  authStatus.textContent = signedIn ? `Playing as ${getSavedLeaderboardName() || "User"}` : "Playing as guest";
  authOpenButton.textContent = signedIn ? "Account" : "Sign In";
  authSignOutButton.style.display = signedIn ? "block" : "none";
  authAccountSummary.textContent = signedIn
    ? `Signed in as ${authState.user.email}. XP and progress are synced.`
    : "Sign in to sync XP, skins, and leaderboard progress.";

  if (signedIn && authState.profile) {
    authAccountSummary.textContent += ` Wins: ${authState.profile.wins || 0}, Losses: ${authState.profile.losses || 0}`;
  }
}

async function signIn() {
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();

  if (!email || !password) {
    setAuthMessage("Email and password required.", "error");
    return;
  }

  setAuthMessage("Signing in...");

  const { error } = await leaderboardClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    setAuthMessage(error.message, "error");
  } else {
    authOverlay.classList.add("hidden");
  }
}

async function signUp() {
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();
  const name = authNameInput.value.trim();

  if (!email || !password || !name) {
    setAuthMessage("All fields required.", "error");
    return;
  }

  setAuthMessage("Creating account...");

  const { error } = await leaderboardClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name
      }
    }
  });

  if (error) {
    setAuthMessage(error.message, "error");
  } else {
    setAuthMessage("Check your email to confirm your account.", "success");
  }
}

async function signOut() {
  const { error } = await leaderboardClient.auth.signOut();

  if (error) {
    setAuthMessage(error.message, "error");
  } else {
    authOverlay.classList.add("hidden");
  }
}

function setAuthMessage(message, type = "") {
  authMessage.textContent = message;
  authMessage.className = `auth-message ${type}`;
}

async function updateLeaderboardName() {
  const name = sanitizeLeaderboardName(settingsLeaderboardNameInput.value);

  if (!name) {
    setSettingsLeaderboardNameMessage("Name is required.", "error");
    return;
  }

  const error = getLeaderboardNameError(name);

  if (error) {
    setSettingsLeaderboardNameMessage(error, "error");
    return;
  }

  saveState.playerName = name;
  saveState.leaderboardNameLocked = true;
  saveData();
  queueProfileSync();

  setSettingsLeaderboardNameMessage("Name updated.", "success");
  updateMenuStats();
}

function setSettingsLeaderboardNameMessage(message, type = "") {
  settingsLeaderboardNameMessage.textContent = message;
  settingsLeaderboardNameMessage.className = `setting-help ${type}`;
}

function handleBackgroundUpload(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setBackgroundStatus("Please select an image file.", "error");
    return;
  }

  if (file.size > 1024 * 1024) {
    setBackgroundStatus("Image is too large (max 1MB).", "error");
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();

    img.onload = () => {
      if (img.width > CUSTOM_BACKGROUND_MAX_SIDE || img.height > CUSTOM_BACKGROUND_MAX_SIDE) {
        setBackgroundStatus("Image is too large (max 1100x1100).", "error");
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const compressed = canvas.toDataURL("image/jpeg", CUSTOM_BACKGROUND_QUALITY);
      saveState.settings.backgroundImage = compressed;
      saveState.settings.backgroundName = file.name;
      customBackgroundSrc = compressed;
      customBackgroundImage.src = compressed;
      customBackgroundReady = true;
      saveData();
      setBackgroundStatus("Background updated.", "success");
      updateBackgroundPreview();
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

function clearBackground() {
  saveState.settings.backgroundImage = "";
  saveState.settings.backgroundName = "";
  customBackgroundSrc = "";
  customBackgroundReady = false;
  saveData();
  setBackgroundStatus("Background cleared.", "success");
  updateBackgroundPreview();
}

function setBackgroundStatus(message, type = "") {
  backgroundStatus.textContent = message;
  backgroundStatus.className = `setting-help ${type}`;
}

function updateBackgroundPreview() {
  if (customBackgroundReady && customBackgroundImage.complete) {
    backgroundPreview.style.backgroundImage = `url(${customBackgroundSrc})`;
    backgroundPreview.textContent = "";
  } else {
    backgroundPreview.style.backgroundImage = "";
    backgroundPreview.textContent = "No custom background";
  }
}

function handleKeyDown(event) {
  if (event.repeat) {
    return;
  }

  switch (event.code) {
    case "KeyA":
    case "ArrowLeft":
      input.left = true;
      event.preventDefault();
      break;
    case "KeyD":
    case "ArrowRight":
      input.right = true;
      event.preventDefault();
      break;
    case "KeyP":
      if (game && game.running && !game.onlineDuel) {
        togglePause();
      }
      event.preventDefault();
      break;
    case "Escape":
      if (game && game.running && !game.onlineDuel) {
        togglePause();
      } else if (!game || !game.running) {
        showMenu();
      }
      event.preventDefault();
      break;
  }
}

function handleKeyUp(event) {
  switch (event.code) {
    case "KeyA":
    case "ArrowLeft":
      input.left = false;
      break;
    case "KeyD":
    case "ArrowRight":
      input.right = false;
      break;
  }
}

function handleVisibilityChange() {
  if (document.hidden && game && game.running && !game.onlineDuel) {
    togglePause();
  }
}

function handleGamepadConnected(event) {
  console.log("Gamepad connected:", event.gamepad.id);
  updateGamepadStatus();
}

function handleGamepadDisconnected(event) {
  console.log("Gamepad disconnected:", event.gamepad.id);
  updateGamepadStatus();
}

function updateGamepadStatus() {
  const gamepads = navigator.getGamepads();
  const hasGamepad = Array.from(gamepads).some((gamepad) => gamepad !== null);

  gamepadStatus.classList.toggle("hidden", !saveState.settings.showGamepadStatus || !hasGamepad);
}

function resizeCanvas() {
  if (!canvas) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  if (ctx) {
    ctx.scale(dpr, dpr);
  }
}

// ============================================
// INITIALIZATION
// ============================================

function createClientId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function init() {
  loadCharacterImages();
  loadBackgroundAdImages();
  loadData();
  initAuth();
  initEventListeners();
  updateMenuStats();
  updateAuthUI();
  updateBackgroundPreview();
  resizeCanvas();
  showMenu();

  // Hide lock icon if multiplayer is unlocked
  if (!MULTIPLAYER_LOCKED) {
    const lockIcon = multiplayerButton.querySelector('.lock-icon');
    if (lockIcon) {
      lockIcon.style.display = 'none';
    }
  }
}


// ============================================
// MULTIPLAYER MODULE
// ============================================
// ============================================
// MULTIPLAYER STATE MANAGEMENT
// ============================================

function createMultiplayerState() {
  return {
    playerId: createClientId(),
    channel: null,
    roomCode: "",
    role: "",
    isHost: false,
    ready: false,
    status: "idle",
    subscribed: false,
    joinedAt: 0,
    players: [],
    opponent: null,
    opponentLeftAt: 0,
    lastOpponentStateAt: 0,
    matchHadOpponent: false,
    matchStartedAt: 0,
    matchOpponentId: "",
    matchSeed: "",
    selectedMode: "classic",
    deaths: {},
    result: null,
    resultTimer: null,
    startQueued: false
  };
}

function updateMultiplayerState(deltaSeconds) {
  if (!game || !game.onlineDuel || !multiplayer.channel) {
    return;
  }

  // Send player state to opponent
  if (game.runTime - multiplayerLastStateSentAt >= MULTIPLAYER_STATE_INTERVAL) {
    sendMultiplayerBroadcast("playerState", {
      x: game.player.x,
      y: game.player.y,
      score: game.score,
      cameraY: game.cameraY
    });
    multiplayerLastStateSentAt = game.runTime;
  }

  // Send presence updates
  if (game.runTime - multiplayerLastPresenceSentAt >= MULTIPLAYER_PRESENCE_INTERVAL) {
    trackMultiplayerPresence({
      score: game.score,
      cameraY: game.cameraY
    });
    multiplayerLastPresenceSentAt = game.runTime;
  }
}

// ============================================
// MULTIPLAYER ROOM MANAGEMENT
// ============================================

function createMultiplayerRoom() {
  connectMultiplayerRoom(createRoomCode(), "host");
}

function joinMultiplayerRoomFromInput() {
  const code = sanitizeRoomCode(joinRoomInput.value);
  joinRoomInput.value = code;

  if (code.length < 4) {
    showMultiplayerStatus("Enter a room code first.", "error");
    return;
  }

  connectMultiplayerRoom(code, "guest");
}

function connectMultiplayerRoom(roomCode, role) {
  if (!leaderboardClient) {
    showMultiplayerStatus("Supabase Realtime is offline.", "error");
    return;
  }

  if (multiplayer.channel) {
    leaveMultiplayerRoom();
  }

  multiplayer = createMultiplayerState();
  multiplayer.roomCode = roomCode;
  multiplayer.role = role;
  multiplayer.isHost = role === "host";
  multiplayer.status = "connecting";

  const channelName = `${MULTIPLAYER_CHANNEL_PREFIX}${roomCode}`;
  multiplayer.channel = leaderboardClient.channel(channelName, {
    config: {
      presence: {
        key: multiplayer.playerId
      },
      broadcast: {
        self: true
      }
    }
  });

  multiplayer.channel
    .on("presence", { event: "sync" }, () => syncMultiplayerPresence())
    .on("presence", { event: "join" }, ({ key, newPresences }) => handleMultiplayerPresenceJoin({ key, newPresences }))
    .on("presence", { event: "leave" }, ({ key, leftPresences }) => handleMultiplayerPresenceLeave({ leftPresences }))
    .on("broadcast", { event: "room_seed" }, ({ payload }) => handleMultiplayerRoomSeed(payload))
    .on("broadcast", { event: "ready_update" }, ({ payload }) => handleMultiplayerReadyUpdate(payload))
    .on("broadcast", { event: "start_match" }, ({ payload }) => handleMultiplayerStartMatch(payload))
    .on("broadcast", { event: "state_tick" }, ({ payload }) => handleMultiplayerStateTick(payload))
    .on("broadcast", { event: "player_dead" }, ({ payload }) => handleMultiplayerPlayerDead(payload))
    .on("broadcast", { event: "match_result" }, ({ payload }) => handleMultiplayerMatchResult(payload))
    .on("broadcast", { event: "rematch_request" }, ({ payload }) => handleMultiplayerRematchRequest(payload))
    .on("broadcast", { event: "leave_match" }, ({ payload }) => handleMultiplayerLeaveMatch(payload))
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        multiplayer.subscribed = true;
        multiplayer.joinedAt = Date.now();
        multiplayer.status = "lobby";
        trackMultiplayerPresence();
        renderMultiplayerScreen();
        showMultiplayerStatus("Connected to room.", "success");
      } else if (status === "CHANNEL_ERROR") {
        showMultiplayerStatus("Failed to connect to room.", "error");
        leaveMultiplayerRoom();
      } else if (status === "TIMED_OUT") {
        showMultiplayerStatus("Connection timed out.", "error");
        leaveMultiplayerRoom();
      } else if (status === "CLOSED") {
        leaveMultiplayerRoom();
      }
    });
}

function leaveMultiplayerRoom(shouldBroadcast = true) {
  if (!multiplayer.channel) {
    return;
  }

  if (shouldBroadcast) {
    sendMultiplayerBroadcast("leave_match", { playerId: multiplayer.playerId });
  }

  multiplayer.channel.unsubscribe();
  multiplayer.channel = null;
  multiplayer = createMultiplayerState();
  renderMultiplayerScreen();
}

function createRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < MULTIPLAYER_ROOM_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function sanitizeRoomCode(code) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, MULTIPLAYER_ROOM_CODE_LENGTH);
}

// ============================================
// MULTIPLAYER PRESENCE & SYNC
// ============================================

function trackMultiplayerPresence(patch = {}) {
  if (!multiplayer.channel || !multiplayer.subscribed) {
    return;
  }

  if (typeof patch.ready === "boolean") {
    multiplayer.ready = patch.ready;
  }

  const trackResult = multiplayer.channel.track(getOwnMultiplayerPresence());

  if (trackResult && typeof trackResult.catch === "function") {
    trackResult.catch(() => {});
  }
}

function getOwnMultiplayerPresence() {
  const character = getCharacter(saveState.equippedCharacter);
  const playerName = getSavedLeaderboardName() || "Player";
  const inOnlineGame = game && game.onlineDuel;
  const player = inOnlineGame ? game.player : null;

  return {
    roomCode: multiplayer.roomCode,
    playerId: multiplayer.playerId,
    name: playerName,
    characterId: character.id,
    role: multiplayer.role,
    ready: multiplayer.ready,
    alive: !inOnlineGame || game.running,
    score: inOnlineGame ? game.score : 0,
    status: multiplayer.status,
    xRatio: player ? (player.x + player.width / 2) / game.width : null,
    yOffset: player ? player.y - game.startY : null,
    size: player ? player.width : 48,
    runTime: inOnlineGame ? game.runTime : 0,
    joinedAt: multiplayer.joinedAt,
    updatedAt: Date.now(),
    wins: saveState.wins || 0,
    losses: saveState.losses || 0,
    winStreak: saveState.winStreak || 0
  };
}

function syncMultiplayerPresence() {
  if (!multiplayer.channel) {
    return;
  }

  const allPlayers = flattenMultiplayerPresence(multiplayer.channel.presenceState());
  const acceptedPlayers = getAcceptedMultiplayerPlayers(allPlayers);
  const selfAccepted = acceptedPlayers.some((player) => player.playerId === multiplayer.playerId);

  if (allPlayers.length > MULTIPLAYER_MAX_PLAYERS && !selfAccepted) {
    leaveMultiplayerRoom(false);
    renderMultiplayerScreen();
    showMultiplayerStatus("Room full.", "error");
    return;
  }

  const hadOpponent = multiplayer.players.some((player) => player.playerId !== multiplayer.playerId);
  multiplayer.players = acceptedPlayers;

  if (!hadOpponent && multiplayer.players.length === MULTIPLAYER_MAX_PLAYERS) {
    multiplayer.opponentLeftAt = 0;
  } else if (hadOpponent && !multiplayer.opponentLeftAt) {
    multiplayer.opponentLeftAt = Date.now();
  }

  trackMultiplayerPresence();
  renderMultiplayerScreen();
}

function handleMultiplayerPresenceJoin({ key, newPresences }) {
  syncMultiplayerPresence();
}

function handleMultiplayerPresenceLeave({ leftPresences }) {
  const opponentLeft = (leftPresences || []).some((presence) => presence.playerId && presence.playerId !== multiplayer.playerId);

  if (opponentLeft && !multiplayer.opponentLeftAt) {
    multiplayer.opponentLeftAt = Date.now();
  }

  syncMultiplayerPresence();
}

function flattenMultiplayerPresence(presenceState) {
  const players = [];

  for (const key in presenceState) {
    const presences = presenceState[key] || [];
    for (const presence of presences) {
      players.push(presence);
    }
  }

  return players;
}

function getAcceptedMultiplayerPlayers(allPlayers) {
  const playersById = {};
  const now = Date.now();

  for (const player of allPlayers) {
    if (!player.playerId || !player.roomCode || player.roomCode !== multiplayer.roomCode) {
      continue;
    }

    const existing = playersById[player.playerId];

    if (!existing || player.updatedAt > existing.updatedAt) {
      playersById[player.playerId] = player;
    }
  }

  return Object.values(playersById)
    .filter((player) => now - player.updatedAt < MULTIPLAYER_PRESENCE_LEAVE_GRACE * 1000)
    .sort((a, b) => a.joinedAt - b.joinedAt);
}

// ============================================
// MULTIPLAYER BROADCAST HANDLERS
// ============================================

function handleMultiplayerRoomSeed(payload) {
  if (!multiplayer.channel || multiplayer.status !== "starting") {
    return;
  }

  multiplayer.matchSeed = payload.seed;
}

function handleMultiplayerReadyUpdate(payload) {
  if (!multiplayer.channel || payload.senderId === multiplayer.playerId) {
    return;
  }

  syncMultiplayerPresence();
}

function handleMultiplayerStartMatch(payload) {
  if (!multiplayer.channel || payload.senderId !== multiplayer.matchOpponentId) {
    return;
  }

  startMultiplayerMatch(payload);
}

function handleMultiplayerStateTick(payload) {
  if (!game || !game.onlineDuel || payload.playerId === multiplayer.playerId) {
    return;
  }

  multiplayer.lastOpponentStateAt = Date.now();
  multiplayer.opponent = payload;
}

function handleMultiplayerPlayerDead(payload) {
  if (!game || !game.onlineDuel || payload.playerId === multiplayer.playerId) {
    return;
  }

  recordMultiplayerDeath(payload);
}

function handleMultiplayerMatchResult(payload) {
  if (!game || !game.onlineDuel || payload.senderId === multiplayer.playerId) {
    return;
  }

  finishMultiplayerMatch(payload);
}

function handleMultiplayerRematchRequest(payload) {
  resetMultiplayerLobby(false);
  showMultiplayerStatus(`${sanitizeLeaderboardName(payload.name || "Opponent") || "Opponent"} wants a rematch.`, "");
}

function handleMultiplayerLeaveMatch(payload) {
  if (eventName === "leave_match" && payload.senderId !== multiplayer.playerId && game && game.onlineDuel && multiplayer.status === "playing") {
    finishMultiplayerMatch({
      winnerId: multiplayer.playerId,
      loserId: payload.senderId,
      reason: "left",
      scores: getMultiplayerScoreMap()
    });
  }
}

// ============================================
// MULTIPLAYER GAME MANAGEMENT
// ============================================

function maybeStartMultiplayerMatch() {
  if (!multiplayer.isHost || multiplayer.startQueued || multiplayer.status !== "lobby") {
    return;
  }

  if (multiplayer.players.length !== MULTIPLAYER_MAX_PLAYERS || !multiplayer.players.every((player) => player.ready)) {
    return;
  }

  const seed = `${multiplayer.roomCode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  multiplayer.startQueued = true;
  multiplayer.status = "starting";
  multiplayer.matchSeed = seed;
  renderMultiplayerScreen();
  sendMultiplayerBroadcast("room_seed", { seed });
  sendMultiplayerBroadcast("start_match", {
    seed,
    mode: multiplayer.selectedMode || "classic",
    players: multiplayer.players.map((player) => ({
      playerId: player.playerId,
      name: player.name,
      characterId: player.characterId
    }))
  });
}

function startMultiplayerMatch(payload) {
  if (!multiplayer.channel || (game && game.onlineDuel && game.running)) {
    return;
  }

  multiplayer.status = "playing";
  multiplayer.ready = false;
  multiplayer.startQueued = false;
  multiplayer.matchSeed = payload.seed || multiplayer.matchSeed || `${multiplayer.roomCode}-fallback`;
  multiplayer.deaths = {};
  multiplayer.result = null;
  multiplayer.opponent = null;
  multiplayer.opponentLeftAt = 0;
  multiplayer.lastOpponentStateAt = Date.now();
  multiplayer.matchStartedAt = Date.now();
  const payloadPlayers = Array.isArray(payload.players) ? payload.players : [];
  const payloadOpponent = payloadPlayers.find((player) => player && player.playerId && player.playerId !== multiplayer.playerId);
  multiplayer.matchOpponentId = payloadOpponent ? String(payloadOpponent.playerId) : "";
  multiplayer.matchHadOpponent = Boolean(multiplayer.matchOpponentId) || multiplayer.players.some((player) => player.playerId !== multiplayer.playerId);
  clearMultiplayerResultTimer();
  const gameMode = payload.mode || "classic";
  startGame(gameMode, {
    onlineDuel: true,
    seed: multiplayer.matchSeed,
    roomCode: multiplayer.roomCode
  });
  trackMultiplayerPresence();
}

function sendMultiplayerBroadcast(eventName, payload = {}) {
  if (!multiplayer.channel || !multiplayer.subscribed) {
    return Promise.resolve("offline");
  }

  return multiplayer.channel.send({
    type: "broadcast",
    event: eventName,
    payload: { ...payload, senderId: multiplayer.playerId }
  });
}

// ============================================
// MULTIPLAYER DEATH & RESULT HANDLING
// ============================================

function handleLocalMultiplayerDeath(reason) {
  if (game.multiplayerDeathSent) {
    return;
  }

  game.running = false;
  game.paused = false;
  game.multiplayerDeathSent = true;
  pauseOverlay.classList.add("hidden");
  countdownOverlay.classList.add("hidden");
  resetInput();

  const death = {
    playerId: multiplayer.playerId,
    name: getSavedLeaderboardName() || "Player",
    score: game.score,
    diedAt: Date.now(),
    reason
  };

  recordMultiplayerDeath(death);
  sendMultiplayerBroadcast("player_dead", death);
  trackMultiplayerPresence({ alive: false });
  drawGame();
}

function recordMultiplayerDeath(death) {
  multiplayer.deaths[death.playerId] = death;
}

function getMultiplayerScoreMap() {
  const scores = {};

  for (const playerId in multiplayer.deaths) {
    scores[playerId] = multiplayer.deaths[playerId].score;
  }

  if (game && game.onlineDuel && game.running) {
    scores[multiplayer.playerId] = game.score;
  }

  return scores;
}

function getOtherMultiplayerPlayerId(playerId) {
  for (const player of multiplayer.players) {
    if (player.playerId !== playerId) {
      return player.playerId;
    }
  }

  return null;
}

function finishMultiplayerMatch(result) {
  if (!game || !game.onlineDuel || multiplayer.result) {
    return;
  }

  multiplayer.result = result;
  multiplayer.status = "ended";
  clearMultiplayerResultTimer();

  if (game.running) {
    game.running = false;
  }

  // MULTIPLAYER TRACKING: Update wins/losses/streak
  const isDraw = !result.winnerId;
  const didWin = result.winnerId === multiplayer.playerId;
  const didLose = result.loserId === multiplayer.playerId;

  if (didWin) {
    saveState.wins = (saveState.wins || 0) + 1;
    saveState.winStreak = (saveState.winStreak || 0) + 1;
  } else if (didLose) {
    saveState.losses = (saveState.losses || 0) + 1;
    saveState.winStreak = 0; // Reset streak on loss
  } else {
    // Draw - no change to wins/losses
  }

  // MULTIPLAYER XP BONUS: +50 for win, +10 for loss
  let bonusXp = 0;
  if (didWin) {
    bonusXp = 50;
  } else if (didLose) {
    bonusXp = 10;
  }

  saveMultiplayerRunXp(bonusXp);
  queueProfileSync();

  pauseOverlay.classList.add("hidden");
  countdownOverlay.classList.add("hidden");
  restartButton.textContent = "Back To Lobby";
  gameOverTitle.textContent = isDraw ? "Draw" : didWin ? "Victory" : didLose ? "Defeat" : "Match Over";
  gameOverMessage.textContent = getMultiplayerResultMessage(result);

  // MULTIPLAYER XP DISPLAY: Show bonus on game over screen
  if (bonusXp > 0) {
    gameOverMessage.textContent += ` +${bonusXp} XP bonus!`;
  }

  gameOverMessage.classList.remove("hidden");
  finalScore.textContent = game.score;
  finalBest.textContent = getModeBest("classic");
  finalTotalXp.textContent = saveState.xp;
  prepareLeaderboardSubmit();
  gameOverOverlay.classList.remove("hidden");
  trackMultiplayerPresence({ ready: false });
}

function finishMultiplayerDisconnect() {
  if (!game || !game.onlineDuel || multiplayer.result) {
    return;
  }

  const result = {
    winnerId: multiplayer.playerId,
    loserId: getOtherMultiplayerPlayerId(multiplayer.playerId),
    reason: "disconnect",
    scores: getMultiplayerScoreMap()
  };

  sendMultiplayerBroadcast("match_result", result);
  finishMultiplayerMatch(result);
}

function getMultiplayerResultMessage(result) {
  if (result.reason === "disconnect") {
    return "Opponent disconnected.";
  }

  if (result.reason === "left") {
    return "Opponent left the match.";
  }

  if (result.reason === "timeUp") {
    return "Time ran out.";
  }

  return "";
}

function clearMultiplayerResultTimer() {
  if (multiplayer.resultTimer) {
    clearTimeout(multiplayer.resultTimer);
    multiplayer.resultTimer = null;
  }
}

// ============================================
// MULTIPLAYER DISCONNECT DETECTION
// ============================================

function checkMultiplayerDisconnect() {
  if (multiplayer.result || !multiplayer.matchHadOpponent) {
    return;
  }

  const now = Date.now();
  const lastSeenAt = Math.max(multiplayer.lastOpponentStateAt || 0, multiplayer.matchStartedAt || 0);

  if (multiplayer.opponentLeftAt && multiplayer.lastOpponentStateAt > multiplayer.opponentLeftAt) {
    multiplayer.opponentLeftAt = 0;
    return;
  }

  const missingSince = multiplayer.opponentLeftAt || lastSeenAt;
  const elapsed = (now - missingSince) / 1000;
  const limit = multiplayer.opponentLeftAt ? MULTIPLAYER_PRESENCE_LEAVE_GRACE : MULTIPLAYER_DISCONNECT_LIMIT;

  if (elapsed < limit) {
    return;
  }

  finishMultiplayerDisconnect();
}

// ============================================
// MULTIPLAYER UI MANAGEMENT
// ============================================

function renderMultiplayerScreen() {
  const inRoom = Boolean(multiplayer.channel);

  multiplayerSetup.classList.toggle("hidden", inRoom);
  multiplayerLobby.classList.toggle("hidden", !inRoom);
  multiplayerRoomCode.textContent = multiplayer.roomCode || "----";
  multiplayerReadyButton.textContent = multiplayer.ready ? "Ready!" : "Ready";
  multiplayerReadyButton.disabled = !multiplayer.subscribed || multiplayer.status === "starting" || multiplayer.status === "playing";

  if (!inRoom) {
    multiplayerPlayerList.innerHTML = "";
    multiplayerLobbyCountdown.textContent = "Waiting for two ready players.";
    return;
  }

  renderMultiplayerPlayers();
  updateMultiplayerLobbyText();
}

function renderMultiplayerPlayers() {
  multiplayerPlayerList.innerHTML = "";

  for (let index = 0; index < MULTIPLAYER_MAX_PLAYERS; index += 1) {
    const player = multiplayer.players[index];
    const row = document.createElement("div");
    const image = document.createElement("img");
    const copy = document.createElement("div");
    const name = document.createElement("strong");
    const meta = document.createElement("span");
    const state = document.createElement("span");
    const character = getCharacter(player && player.characterId);
    const isCurrentPlayer = player && player.id === multiplayer.playerId;

    // Win streak display (WL format or current streak for self)
    let streakText = "";
    if (player && player.id === multiplayer.playerId) {
      const wins = saveState.wins || 0;
      const losses = saveState.losses || 0;
      const streak = saveState.winStreak || 0;
      streakText = streak > 0 ? ` - 🔥 ${streak} streak` : ` - ${wins}W ${losses}L`;
    } else if (player) {
      // For opponent, we'll show their win/loss if available via presence
      streakText = player.winStreak ? ` - 🔥 ${player.winStreak} streak` : (player.wins || player.losses ? ` - ${player.wins || 0}W ${player.losses || 0}L` : "");
    }

    row.className = "multiplayer-player";
    image.src = character.asset;
    image.alt = character.name;
    copy.className = "multiplayer-player-copy";
    name.textContent = player ? player.name : "Waiting...";
    meta.textContent = player ? `${player.role === "host" ? "Host" : "Guest"} - ${character.name}${streakText}` : "Invite a friend";
    state.className = `multiplayer-player-state ${player && player.ready ? "is-ready" : "is-waiting"}`;
    state.textContent = player ? (player.ready ? "Ready" : "Waiting") : "Open";
    copy.append(name, meta);
    row.append(image, copy, state);
    multiplayerPlayerList.appendChild(row);
  }
}

function updateMultiplayerLobbyText() {
  if (multiplayer.status === "starting") {
    multiplayerLobbyCountdown.textContent = "Starting duel...";
    showMultiplayerStatus("Both players are ready. Launching match.", "success");
    return;
  }

  if (multiplayer.status === "playing") {
    multiplayerLobbyCountdown.textContent = "Match in progress.";
    showMultiplayerStatus("Online duel is live.", "success");
    return;
  }

  const playerCount = multiplayer.players.length;

  if (playerCount < MULTIPLAYER_MAX_PLAYERS) {
    multiplayerLobbyCountdown.textContent = "Waiting for one more player.";
    showMultiplayerStatus("Share the room code with a friend.", "");
    return;
  }

  if (multiplayer.players.every((player) => player.ready)) {
    const selectedMode = GAME_MODES[multiplayer.selectedMode] || GAME_MODES.classic;
    multiplayerLobbyCountdown.textContent = `Both players ready. Mode: ${selectedMode.label}`;
    showMultiplayerStatus("Starting as soon as the host syncs the seed.", "success");
    return;
  }

  multiplayerLobbyCountdown.textContent = "Both players must press Ready.";
  showMultiplayerStatus("Waiting on ready checks.", "");
}

function resetMultiplayerLobby(shouldBroadcast = true) {
  if (!multiplayer.channel) {
    showMultiplayer();
    return;
  }

  stopGameLoop();
  hideRunOverlays();
  multiplayer.status = "lobby";
  multiplayer.ready = false;
  multiplayer.startQueued = false;
  multiplayer.matchSeed = "";
  multiplayer.deaths = {};
  multiplayer.result = null;
  multiplayer.opponent = null;
  multiplayer.opponentLeftAt = 0;
  multiplayer.lastOpponentStateAt = 0;
  multiplayer.matchHadOpponent = false;
  multiplayer.matchStartedAt = 0;
  multiplayer.matchOpponentId = "";
  clearMultiplayerResultTimer();

  if (shouldBroadcast) {
    sendMultiplayerBroadcast("rematch_request", { name: getSavedLeaderboardName() || "Player" });
  }

  trackMultiplayerPresence({ ready: false });
  renderMultiplayerScreen();
  showScreen(multiplayerScreen);
}

function showMultiplayerStatus(message, type = "") {
  multiplayerStatus.textContent = message;
  multiplayerStatus.className = `multiplayer-status ${type}`;
}

function showMultiplayer() {
  showScreen(multiplayerScreen);
  renderMultiplayerScreen();
}

// ============================================
// MULTIPLAYER XP MANAGEMENT
// ============================================

function saveMultiplayerRunXp(bonusXp = 0) {
  if (!game || game.xpSaved) {
    return;
  }

  const scoreXp = Math.floor(game.score / 20);
  const earned = scoreXp + game.xpRun + bonusXp;
  game.finalXpEarned = earned;
  game.xpSaved = true;
  saveState.xp += earned;
  saveData();
}

// ============================================
// MULTIPLAYER LEADERBOARD MODULE
// ============================================
// ============================================
// MULTIPLAYER LEADERBOARD
// ============================================

function updateLeaderboardTabDisplay() {
  const isMultiplayer = leaderboardType === "multiplayer";
  leaderboardTitle.textContent = isMultiplayer ? "Multiplayer Rankings" : "Leaderboard";
  leaderboardRefreshButton.textContent = isMultiplayer ? "Switch to Classic" : "Switch to Multiplayer";
}

async function loadMultiplayerLeaderboard() {
  if (!leaderboardClient || leaderboardLoading) {
    if (!leaderboardClient) {
      renderLeaderboardError("Multiplayer leaderboard offline.");
    }
    return;
  }

  leaderboardLoading = true;
  leaderboardStatus.textContent = "Loading multiplayer rankings...";
  leaderboardList.innerHTML = "";

  const { data, error } = await leaderboardClient
    .from("multiplayer_leaderboard")
    .select("player_name, wins, losses, win_streak, character_id, updated_at")
    .order("wins", { ascending: false })
    .order("win_streak", { ascending: false })
    .limit(LEADERBOARD_LIMIT);

  leaderboardLoading = false;

  if (error) {
    renderLeaderboardError("Could not load multiplayer rankings.");
    return;
  }

  renderMultiplayerLeaderboard(data || []);
}

function renderMultiplayerLeaderboard(players) {
  leaderboardList.innerHTML = "";

  if (!players.length) {
    leaderboardStatus.textContent = "No multiplayer rankings yet.";
    return;
  }

  leaderboardStatus.textContent = "";

  players.forEach((entry, index) => {
    const row = document.createElement("li");
    const rank = document.createElement("strong");
    const player = document.createElement("span");
    const playerName = document.createElement("strong");
    const meta = document.createElement("span");
    const stats = document.createElement("strong");
    const character = getCharacter(entry.character_id);

    rank.className = "leaderboard-rank";
    rank.textContent = `#${index + 1}`;
    player.className = "leaderboard-player";
    playerName.textContent = censorLeaderboardName(entry.player_name || "Player");
    const streakDisplay = entry.win_streak > 0 ? ` 🔥 ${entry.win_streak}` : "";
    meta.textContent = `${character.name} - ${entry.wins || 0}W ${entry.losses || 0}L${streakDisplay}`;
    stats.className = "leaderboard-score";
    stats.textContent = entry.wins || 0;

    player.append(playerName, meta);
    row.append(rank, player, stats);
    leaderboardList.appendChild(row);
  });
}

// Start the application
init();

})();