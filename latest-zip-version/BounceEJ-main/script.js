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
const ADMIN_LIVE_PLAYERS_TABLE = "admin_live_players";
const ADMIN_EFFECT_COMMANDS_TABLE = "admin_effect_commands";
const STORE_CODE_RPC = "redeem_store_code";
const LEADERBOARD_LIMIT = 5;
const MULTIPLAYER_LOCKED = false;
const MULTIPLAYER_CHANNEL_PREFIX = "bounceej-duel-";
const MULTIPLAYER_MAX_PLAYERS = 2;
const MULTIPLAYER_STATE_INTERVAL = 0.2;
const MULTIPLAYER_PRESENCE_INTERVAL = 0.75;
const MULTIPLAYER_DISCONNECT_LIMIT = 15;
const MULTIPLAYER_PRESENCE_LEAVE_GRACE = 8;
const MULTIPLAYER_SIMULTANEOUS_WINDOW = 500;
const MULTIPLAYER_GHOST_STALE_MS = 30000;
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
const LEADERBOARD_RETRY_DELAY = 8000;
const ADMIN_LIVE_UPDATE_INTERVAL = 2500;
const ADMIN_COMMAND_POLL_INTERVAL = 1800;
const ADMIN_JUMPSCARE_DEFAULT_MS = 1600;
const ADMIN_FAKE_LAG_DEFAULT_MS = 2200;
const ANTI_CHEAT_POSITION_TOLERANCE = 18;
const ANTI_CHEAT_VELOCITY_TOLERANCE = 90;
const ANTI_CHEAT_SCORE_TOLERANCE = 4;
const ANTI_CHEAT_MAX_UPWARD_STEP = 185;
const ANTI_CHEAT_MAX_DOWNWARD_STEP = 150;
const ANTI_CHEAT_MAX_HORIZONTAL_STEP = 150;
const DEFAULT_CHARACTER_SECTION = "EJs";
const BOOST_STORE_SECTION = "Boosts";
const CHARACTER_SECTION_ORDER = ["EJs", "Limited", "Friends", BOOST_STORE_SECTION];
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
const DEFAULT_SETTINGS = {
  theme: "blue",
  particles: true,
  showGamepadStatus: true,
  sensitivity: 1,
  backgroundImage: "",
  backgroundName: ""
};

const THEMES = {
  red: {
    canvasBg: "#ef5a5a",
    canvasRayLight: "rgba(255, 255, 255, 0.14)",
    canvasRayDark: "rgba(130, 18, 32, 0.11)",
    canvasLine: "rgba(255, 255, 255, 0.18)"
  },
  green: {
    canvasBg: "#97d64a",
    canvasRayLight: "rgba(255, 255, 255, 0.13)",
    canvasRayDark: "rgba(85, 162, 24, 0.12)",
    canvasLine: "rgba(255, 255, 255, 0.18)"
  },
  blue: {
    canvasBg: "#42a6e8",
    canvasRayLight: "rgba(255, 255, 255, 0.13)",
    canvasRayDark: "rgba(23, 96, 166, 0.12)",
    canvasLine: "rgba(255, 255, 255, 0.18)"
  },
  purple: {
    canvasBg: "#9b6cf4",
    canvasRayLight: "rgba(255, 255, 255, 0.13)",
    canvasRayDark: "rgba(78, 38, 148, 0.12)",
    canvasLine: "rgba(255, 255, 255, 0.18)"
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

const DEFAULT_BOOST_INVENTORY = {};

const DEFAULT_BUYABLE_POWERUPS = [
  {
    id: "speedboost",
    name: "Speed Boost",
    emoji: "⚡",
    price: 45,
    effect: "speed",
    speedMultiplier: 1.28,
    description: "Move faster for your next run.",
    message: "Speed Boost active!"
  },
  {
    id: "doublejumps",
    name: "Double Jumps",
    emoji: "🪽",
    price: 55,
    effect: "doubleJump",
    charges: 2,
    description: "Get two emergency mid-air jumps next round.",
    message: "Double Jumps loaded!"
  },
  {
    id: "revive",
    name: "Revive",
    emoji: "❤️",
    price: 80,
    effect: "revive",
    revives: 1,
    description: "Save yourself from one fall in the next run.",
    message: "Revive ready!"
  },
  {
    id: "jumpboost",
    name: "Jump Boost",
    emoji: "🚀",
    price: 50,
    effect: "jump",
    jumpMultiplier: 1.16,
    description: "Bounce higher for one round.",
    message: "Jump Boost active!"
  },
  {
    id: "slowfalling",
    name: "Slow Falling",
    emoji: "🪂",
    price: 50,
    effect: "slowFall",
    gravityMultiplier: 0.72,
    description: "Fall slower for one round.",
    message: "Slow Falling active!"
  }
];

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
const boostButtonList = document.getElementById("boostButtonList");
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
const doubleJumpButton = document.getElementById("doubleJumpButton");
const gamepadStatus = document.getElementById("gamepadStatus");
const countdownOverlay = document.getElementById("countdownOverlay");
const countdownText = document.getElementById("countdownText");
const adminJumpscareOverlay = document.getElementById("adminJumpscareOverlay");
const adminJumpscareText = document.getElementById("adminJumpscareText");
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
const authForm = document.getElementById("authForm");
const authEmailInput = document.getElementById("authEmailInput");
const authPasswordInput = document.getElementById("authPasswordInput");
const authNameInput = document.getElementById("authNameInput");
const authForm = document.getElementById("authForm");
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
  boostInventory: { ...DEFAULT_BOOST_INVENTORY },
  selectedBoosts: [],
  playerName: "",
  leaderboardRowId: "",
  leaderboardNameLocked: false,
  pendingLeaderboardScore: null,
  settings: { ...DEFAULT_SETTINGS }
};

const characterImages = {};
const backgroundAdImages = [];
const customBackgroundImage = new Image();
const buyablePowerupDefinitions = normalizeBuyablePowerups(window.BOUNCE_EJ_BUYABLE_POWERUPS || DEFAULT_BUYABLE_POWERUPS);
const buyablePowerupById = buyablePowerupDefinitions.reduce((map, powerup) => {
  map[powerup.id] = powerup;
  return map;
}, {});
const powerupDefinitions = normalizePowerups(window.BOUNCE_EJ_POWERUPS || DEFAULT_POWERUPS);
const powerupById = powerupDefinitions.reduce((map, powerup) => {
  map[powerup.id] = powerup;
  return map;
}, {});
let leaderboardClient = createLeaderboardClient();

function getLeaderboardClient() {
  // Re-attempt client creation if CDN loaded after our script ran.
  if (!leaderboardClient && window.supabase) {
    leaderboardClient = createLeaderboardClient();
  }
  return leaderboardClient;
}

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
let leaderboardRetryTimer = 0;
let leaderboardRetryInFlight = false;
let leaderboardType = "classic"; // "classic" or "multiplayer"
let redeemLoading = false;
let censorshipLoaded = false;
let censorshipLoading = null;
let censorshipRules = normalizeCensorRules(FALLBACK_CENSOR_WORDS.map((word) => ({ word, replacement: "****" })));
let customBackgroundSrc = "";
let customBackgroundReady = false;
let multiplayer = createMultiplayerState();
const adminRuntime = {
  runId: "",
  liveTimer: 0,
  commandPollTimer: 0,
  commandChannel: null,
  handledCommands: new Set(),
  lastError: ""
};

const input = {
  left: false,
  right: false,
  touchLeft: false,
  touchRight: false,
  swipeBoost: 0,
  gamepadX: 0
};

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
            boostInventory: { ...DEFAULT_BOOST_INVENTORY },
            selectedBoosts: [],
            playerName: typeof parsed.playerName === "string" ? parsed.playerName : "",
            leaderboardRowId: "",
            leaderboardNameLocked: typeof parsed.leaderboardNameLocked === "boolean" ? parsed.leaderboardNameLocked : Boolean(parsed.playerName),
            pendingLeaderboardScore: null,
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
            boostInventory: normalizeBoostInventory(parsed.boostInventory),
            selectedBoosts: normalizeSelectedBoosts(parsed.selectedBoosts, parsed.boostInventory),
            playerName: typeof parsed.playerName === "string" ? parsed.playerName : "",
            leaderboardRowId: typeof parsed.leaderboardRowId === "string" ? parsed.leaderboardRowId : "",
            leaderboardNameLocked: typeof parsed.leaderboardNameLocked === "boolean" ? parsed.leaderboardNameLocked : Boolean(parsed.playerName),
            pendingLeaderboardScore: normalizePendingLeaderboardScore(parsed.pendingLeaderboardScore),
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
        boostInventory: { ...DEFAULT_BOOST_INVENTORY },
        selectedBoosts: [],
        playerName: "",
        leaderboardRowId: "",
        leaderboardNameLocked: false,
        pendingLeaderboardScore: null,
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

  if (!saveState.ownedCharacters.includes(saveState.equippedCharacter)) {
    saveState.equippedCharacter = "regular";
  }

  saveState.redeemedCodes = saveState.redeemedCodes.filter((code) => typeof code === "string");
  saveState.boostInventory = normalizeBoostInventory(saveState.boostInventory);
  saveState.selectedBoosts = normalizeSelectedBoosts(saveState.selectedBoosts, saveState.boostInventory);
  saveState.playerName = sanitizeAndCensorLeaderboardName(saveState.playerName);
  if (!saveState.playerName || getLeaderboardNameError(saveState.playerName)) {
    saveState.playerName = "";
    saveState.leaderboardRowId = "";
    saveState.leaderboardNameLocked = false;
  } else if (saveState.playerName && saveState.leaderboardNameLocked !== false) {
    saveState.leaderboardNameLocked = true;
  }
  saveState.pendingLeaderboardScore = normalizePendingLeaderboardScore(saveState.pendingLeaderboardScore);
  saveState.settings = normalizeSettings(saveState.settings);
  saveData();
  applySettings();
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveState));
    queueProfileSync();
    return true;
  } catch (error) {
    return false;
  }
}

function createLeaderboardClient() {
  if (window.supabaseClient) {
    return window.supabaseClient;
  }

  const config = window.BOUNCE_EJ_SUPABASE;

  if (!window.supabase || typeof window.supabase.createClient !== "function" || !config || !config.url || !config.publishableKey) {
    return null;
  }

  window.supabaseClient = window.supabase.createClient(config.url, config.publishableKey, {
    realtime: {
      params: {
        eventsPerSecond: 40
      }
    }
  });
  return window.supabaseClient;
}

function initAuth() {
  updateAuthUi();

  if (!leaderboardClient) {
    setAuthMessage("Account sync is offline.", "error");
    return;
  }

  leaderboardClient.auth.getSession().then(({ data }) => {
    handleAuthSession(data && data.session ? data.session : null);
  });

  leaderboardClient.auth.onAuthStateChange((event, session) => {
    window.setTimeout(() => {
      handleAuthSession(session, event);
    }, 0);
  });
}

async function handleAuthSession(session, event = "") {
  const previousUserId = authState.user && authState.user.id;
  authState.session = session || null;
  authState.user = session && session.user ? session.user : null;

  if (!authState.user) {
    stopAdminLiveRouting();
    authState.profile = null;
    authState.profileLoaded = false;
    clearTimeout(authState.syncTimer);
    authState.syncTimer = 0;
    updateBannedState();
    updateAuthUi();
    updateMenuStats();
    return;
  }

  updateAuthUi();

  if (event === "SIGNED_IN" || previousUserId !== authState.user.id || !authState.profileLoaded) {
    await loadUserProfile();
  }
}

async function loadUserProfile() {
  if (!leaderboardClient || !authState.user) {
    return;
  }

  const { data, error } = await leaderboardClient
    .from(PROFILE_TABLE)
    .select(getProfileSelectColumns())
    .eq("user_id", authState.user.id)
    .maybeSingle();

  if (error) {
    authState.profileLoaded = false;
    updateAuthUi("Could not load account sync.");
    return;
  }

  let profile = data ? normalizeProfile(data) : null;

  if (!profile) {
    profile = await createInitialProfile();
  }

  if (!profile) {
    authState.profileLoaded = false;
    updateAuthUi("Could not create account profile.");
    return;
  }

  authState.profile = profile;
  authState.profileLoaded = true;
  mergeProfileIntoSaveState(profile);
  updateBannedState();
  updateAuthUi();
  updateMenuStats();
  prepareLeaderboardSubmit();
  queueProfileSync();
  schedulePendingLeaderboardRetry(1200);

  if (game && game.running && !adminRuntime.runId) {
    startAdminLiveRouting();
  }
}

async function createInitialProfile() {
  const payload = createProfilePayload(true);
  const { data, error } = await leaderboardClient
    .from(PROFILE_TABLE)
    .insert(payload)
    .select(getProfileSelectColumns())
    .single();

  if (error && error.code === "23505" && payload.display_name) {
    const retryPayload = { ...payload, display_name: "" };
    const retry = await leaderboardClient
      .from(PROFILE_TABLE)
      .insert(retryPayload)
      .select(getProfileSelectColumns())
      .single();

    return retry.error ? null : normalizeProfile(retry.data);
  }

  if (error) {
    return null;
  }

  return normalizeProfile(data);
}

function getProfileSelectColumns() {
  return "user_id, display_name, banned, is_admin, xp, owned_characters, equipped_character, redeemed_codes, mode_bests, leaderboard_row_id";
}

function normalizeProfile(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const xp = Number(row.xp);

  return {
    userId: typeof row.user_id === "string" ? row.user_id : "",
    displayName: sanitizeAndCensorLeaderboardName(row.display_name || ""),
    banned: row.banned === true,
    isAdmin: row.is_admin === true,
    xp: Number.isFinite(xp) && xp >= 0 ? Math.round(xp) : 0,
    ownedCharacters: normalizeOwnedCharacters(row.owned_characters),
    equippedCharacter: normalizeEquippedCharacter(row.equipped_character, row.owned_characters),
    redeemedCodes: normalizeStringList(row.redeemed_codes),
    modeBests: normalizeModeBests(row.mode_bests),
    leaderboardRowId: typeof row.leaderboard_row_id === "string" ? row.leaderboard_row_id : ""
  };
}

function normalizeOwnedCharacters(value) {
  const source = Array.isArray(value) ? value : ["regular"];
  const normalized = source
    .map((id) => LEGACY_CHARACTER_IDS[id] || id)
    .filter((id, index, ids) => CHARACTERS.some((character) => character.id === id) && ids.indexOf(id) === index);

  if (!normalized.includes("regular")) {
    normalized.unshift("regular");
  }

  return normalized;
}

function normalizeEquippedCharacter(value, ownedCharacters = saveState.ownedCharacters) {
  const owned = normalizeOwnedCharacters(ownedCharacters);
  const characterId = LEGACY_CHARACTER_IDS[value] || value;

  return owned.includes(characterId) ? characterId : "regular";
}

function normalizeStringList(value) {
  return Array.isArray(value)
    ? value.filter((item, index, items) => typeof item === "string" && item && items.indexOf(item) === index)
    : [];
}

function normalizeModeBests(value) {
  const source = value && typeof value === "object" ? value : {};
  const normalized = {};

  Object.keys(GAME_MODES).forEach((modeId) => {
    normalized[modeId] = Math.max(0, Number(source[modeId]) || 0);
  });

  return normalized;
}

function normalizePendingLeaderboardScore(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const score = Math.max(0, Math.round(Number(value.score) || 0));
  const playerName = sanitizeAndCensorLeaderboardName(value.playerName || value.player_name || "");

  if (!score || getLeaderboardNameError(playerName)) {
    return null;
  }

  return {
    userId: typeof value.userId === "string" ? value.userId : "",
    playerName,
    score,
    mode: GAME_MODES[value.mode] ? value.mode : "classic",
    modeLabel: typeof value.modeLabel === "string" && value.modeLabel ? value.modeLabel.slice(0, 40) : "Classic",
    characterId: getCharacter(value.characterId).id,
    xpEarned: Math.max(0, Math.round(Number(value.xpEarned) || 0)),
    createdAt: Number.isFinite(value.createdAt) ? value.createdAt : Date.now()
  };
}

function mergeProfileIntoSaveState(profile) {
  authState.applyingRemote = true;

  const owned = [...new Set([...normalizeOwnedCharacters(saveState.ownedCharacters), ...profile.ownedCharacters])];
  const modeBests = normalizeModeBests({
    ...saveState.modeBests,
    classic: Math.max(Number(saveState.modeBests.classic) || 0, saveState.bestScore || 0),
    timeTrial: Math.max(Number(saveState.modeBests.timeTrial) || 0, saveState.timeTrialBestScore || 0)
  });

  Object.keys(profile.modeBests).forEach((modeId) => {
    modeBests[modeId] = Math.max(Number(modeBests[modeId]) || 0, Number(profile.modeBests[modeId]) || 0);
  });

  saveState.xp = Math.max(Number(saveState.xp) || 0, profile.xp);
  saveState.ownedCharacters = owned;
  saveState.equippedCharacter = owned.includes(profile.equippedCharacter)
    ? profile.equippedCharacter
    : normalizeEquippedCharacter(saveState.equippedCharacter, owned);
  saveState.redeemedCodes = [...new Set([...normalizeStringList(saveState.redeemedCodes), ...profile.redeemedCodes])];
  saveState.modeBests = modeBests;
  saveState.bestScore = modeBests.classic || 0;
  saveState.timeTrialBestScore = modeBests.timeTrial || 0;

  if (profile.displayName && !getLeaderboardNameError(profile.displayName)) {
    saveState.playerName = profile.displayName;
    saveState.leaderboardNameLocked = true;
  }

  if (profile.leaderboardRowId) {
    saveState.leaderboardRowId = profile.leaderboardRowId;
  }

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
    leaderboard_row_id: saveState.leaderboardRowId || null
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

function canSyncProfile() {
  return Boolean(
    leaderboardClient
    && authState.user
    && authState.profileLoaded
    && !authState.applyingRemote
    && !isAccountBanned()
  );
}

async function saveProfileNow() {
  if (!canSyncProfile()) {
    return;
  }

  if (authState.syncInFlight) {
    authState.pendingSync = true;
    return;
  }

  authState.syncInFlight = true;
  authState.pendingSync = false;

  const { data, error } = await leaderboardClient
    .from(PROFILE_TABLE)
    .upsert(createProfilePayload(true), { onConflict: "user_id" })
    .select(getProfileSelectColumns())
    .single();

  authState.syncInFlight = false;

  if (!error && data) {
    authState.profile = normalizeProfile(data);
    updateBannedState();
    updateAuthUi();
  }

  if (authState.pendingSync) {
    queueProfileSync();
  }
}

function isSignedIn() {
  return Boolean(authState.user);
}

function isAccountBanned() {
  return Boolean(authState.profile && authState.profile.banned);
}

function updateBannedState() {
  const banned = isAccountBanned();
  bannedScreen.classList.toggle("hidden", !banned);
  document.body.classList.toggle("is-banned", banned);

  if (banned) {
    stopAdminLiveRouting();
    stopGameLoop();
    hideRunOverlays();
    setAuthMessage("This account has been banned.", "error");
  }
}

function canUseAdminLiveRouting() {
  return Boolean(
    leaderboardClient
    && authState.user
    && !isAccountBanned()
  );
}

function startAdminLiveRouting() {
  stopAdminLiveRouting();

  if (!canUseAdminLiveRouting() || !game || game.onlineDuel) {
    return;
  }

  adminRuntime.runId = createClientId();
  adminRuntime.handledCommands.clear();
  subscribeAdminCommands();
  upsertAdminLivePlayer();
  pollAdminCommands();
  adminRuntime.liveTimer = window.setInterval(upsertAdminLivePlayer, ADMIN_LIVE_UPDATE_INTERVAL);
  adminRuntime.commandPollTimer = window.setInterval(pollAdminCommands, ADMIN_COMMAND_POLL_INTERVAL);
}

function stopAdminLiveRouting() {
  if (adminRuntime.liveTimer) {
    clearInterval(adminRuntime.liveTimer);
    adminRuntime.liveTimer = 0;
  }

  if (adminRuntime.commandPollTimer) {
    clearInterval(adminRuntime.commandPollTimer);
    adminRuntime.commandPollTimer = 0;
  }

  if (adminRuntime.commandChannel && leaderboardClient) {
    leaderboardClient.removeChannel(adminRuntime.commandChannel);
    adminRuntime.commandChannel = null;
  }

  hideAdminJumpscare();

  if (leaderboardClient && authState.user && adminRuntime.runId) {
    leaderboardClient
      .from(ADMIN_LIVE_PLAYERS_TABLE)
      .delete()
      .eq("user_id", authState.user.id)
      .then(({ error }) => setAdminRoutingError("delete live player", error));
  }

  adminRuntime.runId = "";
}

function subscribeAdminCommands() {
  if (!leaderboardClient || !authState.user) {
    return;
  }

  adminRuntime.commandChannel = leaderboardClient
    .channel(`admin-effect-commands-${authState.user.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: ADMIN_EFFECT_COMMANDS_TABLE,
        filter: `target_user_id=eq.${authState.user.id}`
      },
      (payload) => handleAdminEffectCommand(payload.new)
    )
    .subscribe();
}

function upsertAdminLivePlayer() {
  if (!canUseAdminLiveRouting() || !game || !game.running || !adminRuntime.runId) {
    return;
  }

  leaderboardClient
    .from(ADMIN_LIVE_PLAYERS_TABLE)
    .upsert({
      user_id: authState.user.id,
      display_name: getSavedLeaderboardName() || authState.user.email || "Player",
      mode_id: game.mode,
      mode_label: game.modeLabel,
      score: Math.max(0, Math.round(game.score || 0)),
      character_id: saveState.equippedCharacter,
      run_id: adminRuntime.runId,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" })
    .then(({ error }) => setAdminRoutingError("upsert live player", error));
}

async function pollAdminCommands() {
  if (!canUseAdminLiveRouting() || !game || !game.running) {
    return;
  }

  const { data, error } = await leaderboardClient
    .from(ADMIN_EFFECT_COMMANDS_TABLE)
    .select("id, effect_type, payload, created_at")
    .eq("target_user_id", authState.user.id)
    .is("consumed_at", null)
    .order("created_at", { ascending: true })
    .limit(8);

  if (error || !data) {
    setAdminRoutingError("poll admin commands", error);
    return;
  }

  data.forEach(handleAdminEffectCommand);
}

function handleAdminEffectCommand(command) {
  if (!command || !command.id || adminRuntime.handledCommands.has(command.id)) {
    return;
  }

  adminRuntime.handledCommands.add(command.id);
  consumeAdminCommand(command.id);

  if (!game || !game.running) {
    return;
  }

  game.adminAffected = true;

  if (command.effect_type === "jumpscare") {
    showAdminJumpscare(command.payload);
    return;
  }

  if (command.effect_type === "fakeLag") {
    const duration = clampNumber(Number(command.payload && command.payload.durationMs), 500, 6000, ADMIN_FAKE_LAG_DEFAULT_MS);
    game.adminFakeLagUntil = Math.max(game.adminFakeLagUntil || 0, performance.now() + duration);
    return;
  }

  if (command.effect_type === "boost") {
    const velocity = clampNumber(Number(command.payload && command.payload.velocity), -2200, -500, -1250);
    game.player.vy = velocity;
    markAntiCheatCheckpoint();
    return;
  }

  if (command.effect_type === "kill") {
    endGame("fell");
  }
}

function consumeAdminCommand(commandId) {
  if (!leaderboardClient || !commandId) {
    return;
  }

  leaderboardClient
    .from(ADMIN_EFFECT_COMMANDS_TABLE)
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", commandId)
    .then(({ error }) => setAdminRoutingError("consume admin command", error));
}

function setAdminRoutingError(context, error) {
  if (!error) {
    adminRuntime.lastError = "";
    return;
  }

  adminRuntime.lastError = `${context}: ${error.message || "unknown error"}`;
  console.warn(`Admin live routing ${adminRuntime.lastError}`, error);
}

window.BounceEJAdminDebug = function getBounceEJAdminDebug() {
  return {
    signedIn: Boolean(authState.user),
    userId: authState.user ? authState.user.id : "",
    profileLoaded: authState.profileLoaded,
    banned: isAccountBanned(),
    gameRunning: Boolean(game && game.running),
    onlineDuel: Boolean(game && game.onlineDuel),
    runId: adminRuntime.runId,
    lastError: adminRuntime.lastError
  };
};

function showAdminJumpscare(payload = {}) {
  if (!adminJumpscareOverlay || !adminJumpscareText) {
    return;
  }

  const text = String(payload.text || "BOO!").replace(/[^\w !?.-]/g, "").slice(0, 32) || "BOO!";
  const duration = clampNumber(Number(payload.durationMs), 800, 4000, ADMIN_JUMPSCARE_DEFAULT_MS);
  adminJumpscareText.textContent = text;
  adminJumpscareOverlay.classList.remove("hidden");
  window.setTimeout(hideAdminJumpscare, duration);
}

function hideAdminJumpscare() {
  if (adminJumpscareOverlay) {
    adminJumpscareOverlay.classList.add("hidden");
  }
}

function isAdminFakeLagActive() {
  return Boolean(game && game.adminFakeLagUntil && performance.now() < game.adminFakeLagUntil);
}

function updateAuthUi(message = "") {
  const signedIn = isSignedIn();
  const banned = isAccountBanned();
  const displayName = getSavedLeaderboardName();
  const email = authState.user && authState.user.email ? authState.user.email : "";

  authStatus.textContent = !leaderboardClient
    ? "Account sync offline"
    : banned
      ? "Account banned"
      : signedIn
        ? `Signed in: ${displayName || email || "Player"}`
        : "Playing as guest";
  authOpenButton.textContent = signedIn ? "Account" : "Sign In";
  authOpenButton.disabled = !leaderboardClient;
  authAccountSummary.textContent = signedIn
    ? `Signed in as ${email || displayName || "Player"}.`
    : "Sign in to sync XP, skins, and leaderboard progress.";
  authNameInput.value = displayName || saveState.playerName || "";
  authSignOutButton.classList.toggle("hidden", !signedIn);
  authSignInButton.disabled = !leaderboardClient || signedIn;
  authSignUpButton.disabled = !leaderboardClient || signedIn;

  if (message) {
    setAuthMessage(message, message.includes("Could not") || message.includes("offline") ? "error" : "");
  }
}

function showAuthOverlay() {
  updateAuthUi();
  authOverlay.classList.remove("hidden");
}

function hideAuthOverlay() {
  authOverlay.classList.add("hidden");
}

function setAuthMessage(message, type = "") {
  authMessage.textContent = message;
  authMessage.classList.toggle("success", type === "success");
  authMessage.classList.toggle("error", type === "error");
}

function getAuthFormValues() {
  return {
    email: authEmailInput.value.trim(),
    password: authPasswordInput.value,
    name: sanitizeAndCensorLeaderboardName(authNameInput.value)
  };
}

async function signInAccount() {
  if (!leaderboardClient) {
    setAuthMessage("Account sync is offline.", "error");
    return;
  }

  const { email, password } = getAuthFormValues();

  if (!email || !password) {
    setAuthMessage("Enter email and password.", "error");
    return;
  }

  setAuthButtonsDisabled(true);
  setAuthMessage("Signing in...", "");

  const { error } = await leaderboardClient.auth.signInWithPassword({ email, password });

  setAuthButtonsDisabled(false);

  if (error) {
    setAuthMessage(error.message || "Could not sign in.", "error");
    return;
  }

  authPasswordInput.value = "";
  setAuthMessage("Signed in.", "success");
}

async function signUpAccount() {
  if (!leaderboardClient) {
    setAuthMessage("Account sync is offline.", "error");
    return;
  }

  await loadCensoredWords();

  const { email, password, name } = getAuthFormValues();
  const nameError = getLeaderboardNameError(name);

  if (!email || !password) {
    setAuthMessage("Enter email and password.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Password needs at least 6 characters.", "error");
    return;
  }

  if (nameError) {
    setAuthMessage(nameError, "error");
    return;
  }

  setAuthButtonsDisabled(true);
  setAuthMessage("Creating account...", "");

  const { data, error } = await leaderboardClient.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name }
    }
  });

  setAuthButtonsDisabled(false);

  if (error) {
    setAuthMessage(error.message || "Could not create account.", "error");
    return;
  }

  if (name) {
    saveState.playerName = name;
    saveState.leaderboardNameLocked = true;
    saveData();
  }

  authPasswordInput.value = "";
  setAuthMessage(data && data.session ? "Account created." : "Check your email to finish signing up.", "success");
}

async function signOutAccount() {
  if (!leaderboardClient) {
    return;
  }

  await saveProfileNow();
  setAuthButtonsDisabled(true);
  setAuthMessage("Signing out...", "");

  const { error } = await leaderboardClient.auth.signOut();

  setAuthButtonsDisabled(false);

  if (error) {
    setAuthMessage("Could not sign out.", "error");
    return;
  }

  hideAuthOverlay();
}

function setAuthButtonsDisabled(disabled) {
  authSignInButton.disabled = disabled || isSignedIn();
  authSignUpButton.disabled = disabled || isSignedIn();
  authSignOutButton.disabled = disabled || !isSignedIn();
}

function normalizeSettings(settings) {
  const source = settings && typeof settings === "object" ? settings : {};
  const theme = DEFAULT_SETTINGS.theme;
  const rawSensitivity = Number(source.sensitivity);
  const sensitivity = Number.isFinite(rawSensitivity) ? Math.max(0.7, Math.min(1.4, rawSensitivity)) : DEFAULT_SETTINGS.sensitivity;
  const backgroundImage = typeof source.backgroundImage === "string" && source.backgroundImage.startsWith("data:image/")
    ? source.backgroundImage
    : "";
  const backgroundName = typeof source.backgroundName === "string" ? source.backgroundName.slice(0, 40) : "";

  return {
    theme,
    particles: typeof source.particles === "boolean" ? source.particles : DEFAULT_SETTINGS.particles,
    showGamepadStatus: typeof source.showGamepadStatus === "boolean" ? source.showGamepadStatus : DEFAULT_SETTINGS.showGamepadStatus,
    sensitivity: Math.round(sensitivity * 100) / 100,
    backgroundImage,
    backgroundName: backgroundImage ? backgroundName : ""
  };
}

function applySettings() {
  const settings = saveState.settings || DEFAULT_SETTINGS;
  document.documentElement.dataset.theme = settings.theme;
  loadCustomBackground(settings.backgroundImage);
  updateSettingsControls();

  if (!settings.showGamepadStatus) {
    gamepadStatus.classList.remove("visible");
  }

  if (game && game.running) {
    drawGame();
  }
}

function updateSettingsControls() {
  const settings = saveState.settings || DEFAULT_SETTINGS;

  particlesToggle.checked = settings.particles;
  gamepadBadgeToggle.checked = settings.showGamepadStatus;
  sensitivitySlider.value = String(Math.round(settings.sensitivity * 100));
  sensitivityValue.textContent = `${Math.round(settings.sensitivity * 100)}%`;
  settingsLeaderboardNameInput.value = saveState.playerName || "";
  setSettingsLeaderboardNameMessage(saveState.playerName ? "Used for auto-saving scores." : "Add a name to auto-save scores.", "");
  backgroundUploadInput.value = "";
  clearBackgroundButton.disabled = !settings.backgroundImage;
  backgroundPreview.style.backgroundImage = settings.backgroundImage
    ? `url("${settings.backgroundImage}")`
    : "";
  setBackgroundStatus(
    settings.backgroundImage ? `${settings.backgroundName || "Custom image"} active.` : "Game background active.",
    settings.backgroundImage ? "success" : ""
  );
}

function setParticlesEnabled(enabled) {
  saveState.settings = normalizeSettings(saveState.settings);
  saveState.settings.particles = enabled;
  saveData();
  applySettings();
}

function setGamepadBadgeEnabled(enabled) {
  saveState.settings = normalizeSettings(saveState.settings);
  saveState.settings.showGamepadStatus = enabled;
  saveData();
  applySettings();
}

function setSensitivity(value) {
  const sensitivity = Number(value) / 100;

  saveState.settings = normalizeSettings(saveState.settings);
  saveState.settings.sensitivity = Number.isFinite(sensitivity) ? sensitivity : DEFAULT_SETTINGS.sensitivity;
  saveData();
  applySettings();
}

async function updateSettingsLeaderboardName() {
  await loadCensoredWords();

  const previousName = getSavedLeaderboardName();
  const nextName = sanitizeAndCensorLeaderboardName(settingsLeaderboardNameInput.value);
  const nameError = getLeaderboardNameError(nextName);

  settingsLeaderboardNameInput.value = nextName;

  if (nameError) {
    setSettingsLeaderboardNameMessage(nameError, "error");
    settingsLeaderboardNameInput.focus();
    return;
  }

  if (nextName === previousName) {
    setSettingsLeaderboardNameMessage("That name is already active.", "success");
    return;
  }

  settingsLeaderboardNameButton.disabled = true;
  setSettingsLeaderboardNameMessage("Updating name...", "");

  if (isSignedIn()) {
    const result = await updateAccountDisplayName(nextName);

    if (result.error) {
      settingsLeaderboardNameButton.disabled = false;
      setSettingsLeaderboardNameMessage(result.taken ? "That name is already taken." : "Could not update account name.", "error");
      return;
    }

    settingsLeaderboardNameButton.disabled = false;
    setSettingsLeaderboardNameMessage("Account name updated.", "success");
    return;
  }

  if (leaderboardClient) {
    const renameResult = previousName
      ? await renameLeaderboardName(previousName, nextName)
      : await ensureLeaderboardNameAvailable(nextName);

    if (renameResult.error) {
      settingsLeaderboardNameButton.disabled = false;
      const message = renameResult.taken ? "That name is already taken." : "Could not update leaderboard name.";
      setSettingsLeaderboardNameMessage(message, "error");
      return;
    }
  }

  saveState.playerName = nextName;
  saveState.leaderboardNameLocked = true;
  saveData();
  updateMenuStats();
  prepareLeaderboardSubmit();
  settingsLeaderboardNameButton.disabled = false;
  setSettingsLeaderboardNameMessage("Leaderboard name updated.", "success");
  loadLeaderboard();
}

async function updateAccountDisplayName(name) {
  if (!leaderboardClient || !isSignedIn()) {
    saveState.playerName = name;
    saveState.leaderboardNameLocked = true;
    saveData();
    updateMenuStats();
    return { error: null, taken: false };
  }

  const previousName = saveState.playerName;

  saveState.playerName = name;
  saveState.leaderboardNameLocked = true;
  saveData();

  const { data, error } = await leaderboardClient
    .from(PROFILE_TABLE)
    .update({ display_name: name })
    .eq("user_id", authState.user.id)
    .select(getProfileSelectColumns())
    .single();

  if (error) {
    saveState.playerName = previousName;
    saveData();
    updateMenuStats();
    return { error, taken: error.code === "23505" };
  }

  authState.profile = normalizeProfile(data);

  if (saveState.leaderboardRowId) {
    await leaderboardClient
      .from(LEADERBOARD_TABLE)
      .update({ player_name: name })
      .eq("id", saveState.leaderboardRowId);
  }

  updateMenuStats();
  prepareLeaderboardSubmit();
  loadLeaderboard();
  return { error: null, taken: false };
}

async function ensureLeaderboardNameAvailable(name) {
  const { data, error } = await leaderboardClient
    .from(LEADERBOARD_TABLE)
    .select("id")
    .eq("player_name_key", getLeaderboardNameKey(name))
    .limit(1);

  if (error) {
    return { error, taken: false };
  }

  return { error: data && data[0] ? new Error("Name is taken.") : null, taken: Boolean(data && data[0]) };
}

async function renameLeaderboardName(previousName, nextName) {
  const previousKey = getLeaderboardNameKey(previousName);
  const nextKey = getLeaderboardNameKey(nextName);
  const { data: takenRows, error: takenError } = await leaderboardClient
    .from(LEADERBOARD_TABLE)
    .select("id")
    .eq("player_name_key", nextKey)
    .limit(1);

  if (takenError) {
    return { error: takenError, taken: false };
  }

  const takenRow = takenRows && takenRows[0];

  if (takenRow && takenRow.id !== saveState.leaderboardRowId) {
    return { error: new Error("Name is taken."), taken: true };
  }

  const ownRow = await findOwnLeaderboardRow(previousKey);

  if (ownRow.error) {
    return { error: ownRow.error, taken: false };
  }

  if (!ownRow.row) {
    saveState.leaderboardRowId = "";
    return { error: null, taken: false };
  }

  const { data, error } = await leaderboardClient
    .from(LEADERBOARD_TABLE)
    .update({ player_name: nextName })
    .eq("id", ownRow.row.id)
    .select("id")
    .single();

  if (!error && data) {
    saveState.leaderboardRowId = data.id;
  }

  return { error, taken: error && error.code === "23505" };
}

async function findOwnLeaderboardRow(previousKey) {
  if (saveState.leaderboardRowId) {
    const { data, error } = await leaderboardClient
      .from(LEADERBOARD_TABLE)
      .select("id")
      .eq("id", saveState.leaderboardRowId)
      .limit(1);

    if (error) {
      return { row: null, error };
    }

    if (data && data[0]) {
      return { row: data[0], error: null };
    }
  }

  const { data, error } = await leaderboardClient
    .from(LEADERBOARD_TABLE)
    .select("id")
    .eq("player_name_key", previousKey)
    .limit(1);

  if (error) {
    return { row: null, error };
  }

  return { row: data && data[0] ? data[0] : null, error: null };
}

function setSettingsLeaderboardNameMessage(message, type = "") {
  settingsLeaderboardNameMessage.textContent = message;
  settingsLeaderboardNameMessage.classList.toggle("success", type === "success");
  settingsLeaderboardNameMessage.classList.toggle("error", type === "error");
}

function getControlSensitivity() {
  const sensitivity = Number(saveState.settings && saveState.settings.sensitivity);
  return Number.isFinite(sensitivity) ? Math.max(0.7, Math.min(1.4, sensitivity)) : DEFAULT_SETTINGS.sensitivity;
}

function loadCustomBackground(src) {
  if (!src) {
    customBackgroundSrc = "";
    customBackgroundReady = false;
    customBackgroundImage.removeAttribute("src");
    return;
  }

  if (src === customBackgroundSrc) {
    return;
  }

  customBackgroundSrc = src;
  customBackgroundReady = false;
  customBackgroundImage.onload = () => {
    customBackgroundReady = true;
    if (game) {
      drawGame();
    }
  };
  customBackgroundImage.onerror = () => {
    customBackgroundReady = false;
  };
  customBackgroundImage.src = src;
}

async function setCustomBackgroundFromFile(file) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setBackgroundStatus("Choose an image file.", "error");
    return;
  }

  setBackgroundStatus("Loading image...", "");

  try {
    const rawImage = await readImageFile(file);
    const image = await loadImageFromSource(rawImage);
    const compressedImage = resizeBackgroundImage(image);
    const nextSettings = normalizeSettings(saveState.settings);
    const previousSettings = saveState.settings;

    nextSettings.backgroundImage = compressedImage;
    nextSettings.backgroundName = file.name || "Custom image";
    saveState.settings = nextSettings;

    if (!saveData()) {
      saveState.settings = previousSettings;
      applySettings();
      setBackgroundStatus("That image is too large to save.", "error");
      return;
    }

    applySettings();
  } catch (error) {
    setBackgroundStatus("Could not use that image.", "error");
  }
}

function clearCustomBackground() {
  saveState.settings = normalizeSettings(saveState.settings);
  saveState.settings.backgroundImage = "";
  saveState.settings.backgroundName = "";
  saveData();
  applySettings();
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function loadImageFromSource(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = source;
  });
}

function resizeBackgroundImage(image) {
  const scale = Math.min(1, CUSTOM_BACKGROUND_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const buffer = document.createElement("canvas");
  const bufferContext = buffer.getContext("2d");

  buffer.width = width;
  buffer.height = height;
  bufferContext.drawImage(image, 0, 0, width, height);

  return buffer.toDataURL("image/jpeg", CUSTOM_BACKGROUND_QUALITY);
}

function setBackgroundStatus(message, type = "") {
  backgroundStatus.textContent = message;
  backgroundStatus.classList.toggle("success", type === "success");
  backgroundStatus.classList.toggle("error", type === "error");
}

function showScreen(screen) {
  allScreens.forEach((item) => item.classList.remove("active"));
  screen.classList.add("active");
  document.body.dataset.screen = screen.id;
}

function showMenu() {
  stopGameLoop();
  leaveMultiplayerRoom(false);
  updateMenuStats();
  hideRunOverlays();
  showScreen(menuScreen);
  loadLeaderboard();
  schedulePendingLeaderboardRetry(800);
}

function showMultiplayer() {
  if (MULTIPLAYER_LOCKED) {
    leaveMultiplayerRoom(false);
    showMenu();
    return;
  }

  stopGameLoop();
  hideRunOverlays();
  renderMultiplayerScreen();
  showScreen(multiplayerScreen);
}

function showStore(section = activeStoreSection) {
  if (isAccountBanned()) {
    updateBannedState();
    return;
  }

  stopGameLoop();
  if (section) {
    activeStoreSection = section;
  }
  setRedeemMessage("");
  redeemInput.value = "";
  renderStore();
  showScreen(storeScreen);
}

function showBoostStore() {
  showStore(BOOST_STORE_SECTION);
}

function showGameModes() {
  if (isAccountBanned()) {
    updateBannedState();
    return;
  }

  stopGameLoop();
  renderGameModes();
  showScreen(modesScreen);
}

function showCharacterSelect() {
  if (isAccountBanned()) {
    updateBannedState();
    return;
  }

  stopGameLoop();
  renderCharacterSelect();
  showScreen(characterScreen);
}

function showControls() {
  stopGameLoop();
  updateSettingsControls();
  showScreen(controlsScreen);
}

function updateMenuStats() {
  const equipped = getCharacter(saveState.equippedCharacter);
  const leaderboardName = getSavedLeaderboardName();

  menuPlayerName.textContent = leaderboardName || "Player";
  menuXp.textContent = saveState.xp;
  menuBest.textContent = saveState.bestScore;
  menuTrialBest.textContent = saveState.timeTrialBestScore;
  menuCharacterImage.src = equipped.asset;
  menuCharacterImage.alt = equipped.name;
  renderBoostButtons();
}

function showLeaderboardToast() {
  leaderboardToast.classList.remove("hidden");
  leaderboardType = "classic";
  updateLeaderboardTabDisplay();
  loadLeaderboard();
}

function hideLeaderboardToast() {
  leaderboardToast.classList.add("hidden");
}

async function loadCensoredWords(force = false) {
  if (!leaderboardClient) {
    return censorshipRules;
  }

  if (censorshipLoaded && !force) {
    return censorshipRules;
  }

  if (censorshipLoading && !force) {
    return censorshipLoading;
  }

  censorshipLoading = leaderboardClient
    .from(CENSOR_TABLE)
    .select("word, replacement")
    .then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length) {
        censorshipRules = normalizeCensorRules(data);
        censorshipLoaded = true;
        const censoredName = sanitizeAndCensorLeaderboardName(saveState.playerName);

        if (saveState.playerName !== censoredName) {
          saveState.playerName = censoredName;
          saveData();
        }

        updateMenuStats();
      }

      return censorshipRules;
    })
    .finally(() => {
      censorshipLoading = null;
    });

  return censorshipLoading;
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
  if (game && game.adminAffected) {
    leaderboardSubmitCard.classList.add("hidden");
    leaderboardSubmitMessage.textContent = "This run is not leaderboard eligible.";
    return;
  }

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

  if (game.adminAffected) {
    setLeaderboardSubmitMessage("This run is not leaderboard eligible.", "error");
    return;
  }

  await loadCensoredWords();

  const previousLockedName = getLockedLeaderboardName();
  const playerName = sanitizeAndCensorLeaderboardName(getSavedLeaderboardName() || nameOverride);
  const nameError = getLeaderboardNameError(playerName);

  if (nameError) {
    setLeaderboardSubmitMessage(nameError, "error");
    if (!isAutoSubmit) {
      leaderboardNameInput.focus();
    }
    return;
  }

  saveState.playerName = playerName;
  saveState.leaderboardNameLocked = true;
  saveData();
  const scoreSnapshot = createLeaderboardScoreSnapshot(playerName);
  submitScoreButton.disabled = true;
  leaderboardNameInput.disabled = true;
  submitScoreButton.textContent = "Auto";
  setLeaderboardSubmitMessage(isAutoSubmit ? "Auto-saving score..." : "Saving score...", "");

  const saveResult = await saveLeaderboardScore(scoreSnapshot, true, previousLockedName);

  if (saveResult.error) {
    console.warn("Leaderboard save failed; queued for retry.", saveResult.error);

    if (saveResult.taken) {
      submitScoreButton.disabled = false;
      leaderboardNameInput.disabled = Boolean(getLockedLeaderboardName());
      setLeaderboardSubmitMessage("That name is already taken.", "error");
      return;
    }

    queuePendingLeaderboardScore(scoreSnapshot);
    submitScoreButton.disabled = true;
    leaderboardNameInput.disabled = true;
    setLeaderboardSubmitMessage(`Score queued. ${getLeaderboardSaveErrorMessage(saveResult.error)}`, "error");
    return;
  }

  game.leaderboardSubmitted = true;
  clearPendingLeaderboardScore(scoreSnapshot);
  setLeaderboardSubmitMessage(saveResult.kept ? "Best score kept!" : "Score saved!", "success");
  loadLeaderboard();
}

function createLeaderboardScoreSnapshot(playerName) {
  return {
    userId: authState.user ? authState.user.id : "",
    playerName,
    score: Math.max(0, Math.round(Number(game.score) || 0)),
    mode: game.mode,
    modeLabel: game.modeLabel,
    characterId: saveState.equippedCharacter,
    xpEarned: game.finalXpEarned || 0,
    createdAt: Date.now()
  };
}

async function saveLeaderboardScore(scoreSnapshot, retryDuplicate = true, previousLockedName = "") {
  const snapshot = normalizePendingLeaderboardScore(scoreSnapshot);

  if (!snapshot) {
    return { error: new Error("Invalid score."), kept: false };
  }

  if (!authState.user || (snapshot.userId && snapshot.userId !== authState.user.id)) {
    return { error: new Error("Wrong signed-in account."), kept: false };
  }

  const rpcResult = await saveLeaderboardScoreWithRpc(snapshot);

  if (!rpcResult.unsupported) {
    return rpcResult;
  }

  const row = {
    user_id: authState.user.id,
    player_name: snapshot.playerName,
    score: snapshot.score,
    mode_id: snapshot.mode,
    mode_label: snapshot.modeLabel,
    character_id: snapshot.characterId,
    xp_earned: snapshot.xpEarned
  };

  if (authState.user) {
    const { data: ownedRows, error: ownedSelectError } = await leaderboardClient
      .from(LEADERBOARD_TABLE)
      .select("id, score")
      .eq("user_id", authState.user.id)
      .limit(1);

    if (ownedSelectError) {
      return { error: ownedSelectError, kept: false };
    }

    const ownedRow = ownedRows && ownedRows[0];

    if (ownedRow) {
      saveState.leaderboardRowId = ownedRow.id;
      saveData();

      if (snapshot.score <= ownedRow.score) {
        await updateProfileLeaderboardRow(ownedRow.id);
        return { error: null, kept: true };
      }

      const updateRow = { ...row };
      delete updateRow.user_id;

      const { error: updateError } = await leaderboardClient
        .from(LEADERBOARD_TABLE)
        .update(updateRow)
        .eq("id", ownedRow.id)
        .select("id")
        .single();

      if (!updateError) {
        await updateProfileLeaderboardRow(ownedRow.id);
      }

      return { error: updateError, kept: false, taken: updateError && updateError.code === "23505" };
    }
  }

  const playerNameKey = getLeaderboardNameKey(snapshot.playerName);
  const { data: existingRows, error: selectError } = await leaderboardClient
    .from(LEADERBOARD_TABLE)
    .select("id, score")
    .eq("player_name_key", playerNameKey)
    .limit(1);

  if (selectError) {
    return { error: selectError, kept: false };
  }

  const existing = existingRows && existingRows[0];

  if (existing) {
    const ownsExisting = saveState.leaderboardRowId === existing.id
      || (previousLockedName && getLeaderboardNameKey(previousLockedName) === playerNameKey);

    if (!ownsExisting) {
      return { error: new Error("Name is taken."), kept: false, taken: true };
    }

    saveState.leaderboardRowId = existing.id;
    saveData();

    if (snapshot.score <= existing.score) {
      return { error: null, kept: true };
    }

    const { error: updateError } = await leaderboardClient
      .from(LEADERBOARD_TABLE)
      .update({
        score: row.score,
        mode_id: row.mode_id,
        mode_label: row.mode_label,
        character_id: row.character_id,
        xp_earned: row.xp_earned
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    return { error: updateError, kept: false, taken: false };
  }

  const { data: insertedRows, error: insertError } = await leaderboardClient
    .from(LEADERBOARD_TABLE)
    .insert(row)
    .select("id");

  if (insertError && insertError.code === "23505" && retryDuplicate) {
    return saveLeaderboardScore(snapshot, false, previousLockedName);
  }

  if (!insertError && insertedRows && insertedRows[0]) {
    saveState.leaderboardRowId = insertedRows[0].id;
    saveData();
    await updateProfileLeaderboardRow(insertedRows[0].id);
  }

  return { error: insertError, kept: false, taken: insertError && insertError.code === "23505" };
}

async function saveLeaderboardScoreWithRpc(snapshot) {
  if (!leaderboardClient || !authState.user) {
    return { unsupported: true };
  }

  const { data, error } = await leaderboardClient.rpc("save_leaderboard_score", {
    p_player_name: snapshot.playerName,
    p_score: snapshot.score,
    p_mode_id: snapshot.mode,
    p_mode_label: snapshot.modeLabel,
    p_character_id: snapshot.characterId,
    p_xp_earned: snapshot.xpEarned
  });

  if (error) {
    const message = String(error.message || "");
    const unsupported = error.code === "42883"
      || message.toLowerCase().includes("function public.save_leaderboard_score")
      || message.toLowerCase().includes("could not find the function");

    if (unsupported) {
      return { unsupported: true };
    }

    return {
      error,
      kept: false,
      taken: error.code === "23505" || message.toLowerCase().includes("name is taken")
    };
  }

  if (data && data.id) {
    saveState.leaderboardRowId = data.id;
    saveData();
    await updateProfileLeaderboardRow(data.id);
  }

  return { error: null, kept: Boolean(data && data.kept), taken: false };
}

function getLeaderboardSaveErrorMessage(error) {
  if (!error) {
    return "We'll retry automatically.";
  }

  const message = String(error.message || error.details || "");

  if (error.code === "42501" || message.toLowerCase().includes("permission denied")) {
    return "Database permissions need the latest leaderboard SQL.";
  }

  if (error.code === "42883" || message.toLowerCase().includes("could not find the function")) {
    return "Database needs the latest leaderboard SQL.";
  }

  if (!navigator.onLine || message.toLowerCase().includes("failed to fetch")) {
    return "We'll retry when your connection is back.";
  }

  return "We'll retry automatically.";
}

function queuePendingLeaderboardScore(scoreSnapshot) {
  const snapshot = normalizePendingLeaderboardScore(scoreSnapshot);

  if (!snapshot) {
    return;
  }

  const existing = normalizePendingLeaderboardScore(saveState.pendingLeaderboardScore);

  if (!existing || snapshot.score >= existing.score) {
    saveState.pendingLeaderboardScore = snapshot;
    saveData();
  }

  schedulePendingLeaderboardRetry();
}

function clearPendingLeaderboardScore(scoreSnapshot = null) {
  const pending = normalizePendingLeaderboardScore(saveState.pendingLeaderboardScore);

  if (!pending) {
    saveState.pendingLeaderboardScore = null;
    saveData();
    return;
  }

  const snapshot = normalizePendingLeaderboardScore(scoreSnapshot);

  if (!snapshot || snapshot.score >= pending.score) {
    saveState.pendingLeaderboardScore = null;
    saveData();
  }
}

function schedulePendingLeaderboardRetry(delay = LEADERBOARD_RETRY_DELAY) {
  if (leaderboardRetryTimer || !saveState.pendingLeaderboardScore) {
    return;
  }

  leaderboardRetryTimer = window.setTimeout(() => {
    leaderboardRetryTimer = 0;
    retryPendingLeaderboardScore();
  }, delay);
}

async function retryPendingLeaderboardScore() {
  const pending = normalizePendingLeaderboardScore(saveState.pendingLeaderboardScore);

  if (!pending || leaderboardRetryInFlight || !leaderboardClient || !isSignedIn() || isAccountBanned()) {
    return;
  }

  if (pending.userId && pending.userId !== authState.user.id) {
    return;
  }

  leaderboardRetryInFlight = true;
  const saveResult = await saveLeaderboardScore(pending, true, pending.playerName);
  leaderboardRetryInFlight = false;

  if (saveResult.error) {
    console.warn("Pending leaderboard retry failed.", saveResult.error);

    if (saveResult.taken) {
      saveState.pendingLeaderboardScore = null;
      saveData();
    } else {
      schedulePendingLeaderboardRetry();
    }
    return;
  }

  clearPendingLeaderboardScore(pending);
  loadLeaderboard();

  if (game && !game.running && gameOverOverlay && !gameOverOverlay.classList.contains("hidden")) {
    game.leaderboardSubmitted = true;
    setLeaderboardSubmitMessage(saveResult.kept ? "Best score kept!" : "Score saved!", "success");
  }
}

async function updateProfileLeaderboardRow(rowId) {
  if (!rowId || !isSignedIn() || !leaderboardClient) {
    return;
  }

  saveState.leaderboardRowId = rowId;
  queueProfileSync();
}

function setLeaderboardSubmitMessage(message, type) {
  leaderboardSubmitMessage.textContent = message;
  leaderboardSubmitCard.classList.toggle("success", type === "success");
  leaderboardSubmitCard.classList.toggle("error", type === "error");
}

function autoSubmitLeaderboardScore() {
  const lockedName = getLockedLeaderboardName();

  if (!isSignedIn() || !lockedName || !game || game.onlineDuel || game.adminAffected || game.score <= 0 || game.leaderboardSubmitted) {
    return;
  }

  submitLeaderboardScore(lockedName, true);
}

function getLockedLeaderboardName() {
  const playerName = sanitizeAndCensorLeaderboardName(saveState.playerName);

  if (!saveState.leaderboardNameLocked || getLeaderboardNameError(playerName)) {
    return "";
  }

  return playerName;
}

function getSavedLeaderboardName() {
  const playerName = sanitizeAndCensorLeaderboardName(saveState.playerName);
  return getLeaderboardNameError(playerName) ? "" : playerName;
}

function sanitizeLeaderboardName(name) {
  return String(name || "")
    .replace(/[^A-Za-z0-9 _.*-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
}

function getLeaderboardNameKey(name) {
  return sanitizeAndCensorLeaderboardName(name).toLowerCase();
}

function getLeaderboardNameError(name) {
  if (!name) {
    return "Use 1-18 letters or numbers.";
  }

  return "";
}

function censorLeaderboardName(name) {
  return sanitizeAndCensorLeaderboardName(name);
}

function sanitizeAndCensorLeaderboardName(name) {
  return sanitizeLeaderboardName(applyCensorship(sanitizeLeaderboardName(name)));
}

function applyCensorship(text) {
  return censorshipRules.reduce((censored, rule) => {
    const pattern = new RegExp(escapeRegExp(rule.word), "gi");
    return censored.replace(pattern, rule.replacement);
  }, String(text || ""));
}

function normalizeCensorRules(rows) {
  const seen = new Set();

  return rows
    .map((row) => ({
      word: sanitizeCensorWord(row.word),
      replacement: typeof row.replacement === "string" && /^\*{1,12}$/.test(row.replacement) ? row.replacement : "****"
    }))
    .filter((rule) => {
      const key = rule.word.toLowerCase();

      if (!rule.word || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((first, second) => second.word.length - first.word.length);
}

function sanitizeCensorWord(word) {
  return String(word || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 40);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createSeededRandom(seed) {
  let state = hashSeed(seed);

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
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
    deaths: {},
    result: null,
    resultTimer: null,
    startQueued: false,
    deathTickInterval: null,
    guestFallbackTimer: null,
    resultRescheduleCount: 0
  };
}

function createClientId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(MULTIPLAYER_ROOM_CODE_LENGTH);
  let code = "";

  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    window.crypto.getRandomValues(values);
  }

  for (let index = 0; index < MULTIPLAYER_ROOM_CODE_LENGTH; index += 1) {
    const value = values[index] || Math.floor(Math.random() * alphabet.length);
    code += alphabet[value % alphabet.length];
  }

  return code;
}

function sanitizeRoomCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

function showMultiplayerStatus(message, type = "") {
  multiplayerStatus.textContent = message;
  multiplayerStatus.classList.toggle("success", type === "success");
  multiplayerStatus.classList.toggle("error", type === "error");
}

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

    row.className = "multiplayer-player";
    image.src = character.asset;
    image.alt = character.name;
    copy.className = "multiplayer-player-copy";
    name.textContent = player ? player.name : "Waiting...";
    meta.textContent = player ? `${player.role === "host" ? "Host" : "Guest"} - ${character.name}` : "Invite a friend";
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
    multiplayerLobbyCountdown.textContent = "Both players ready.";
    showMultiplayerStatus("Starting as soon as the host syncs the seed.", "success");
    return;
  }

  multiplayerLobbyCountdown.textContent = "Both players must press Ready.";
  showMultiplayerStatus("Waiting on ready checks.", "");
}

async function createMultiplayerRoom() {
  await connectMultiplayerRoom(createRoomCode(), "host");
}

async function joinMultiplayerRoomFromInput() {
  const code = sanitizeRoomCode(joinRoomInput.value);
  joinRoomInput.value = code;

  if (code.length < 4) {
    showMultiplayerStatus("Enter a room code first.", "error");
    return;
  }

  await connectMultiplayerRoom(code, "guest");
}

function connectMultiplayerRoom(roomCode, role) {
  // Retry client creation in case the Supabase CDN loaded after our script ran.
  const client = getLeaderboardClient();
  if (!client) {
    const reason = window.__supabaseCdnFailed
      ? "Could not reach Supabase CDN. Check your internet connection."
      : "Supabase is not configured. Check supabase-config.js.";
    showMultiplayerStatus(reason, "error");
    return;
  }

  leaveMultiplayerRoom(false);

  multiplayer = createMultiplayerState();
  multiplayer.roomCode = sanitizeRoomCode(roomCode);
  multiplayer.role = role;
  multiplayer.isHost = role === "host";
  multiplayer.status = "joining";
  multiplayer.joinedAt = Date.now();

  const channel = client.channel(`${MULTIPLAYER_CHANNEL_PREFIX}${multiplayer.roomCode}`, {
    config: {
      // ack: true makes broadcast wait for server acknowledgement before resolving,
      // matching the article's RealtimeChannelConfig(ack: true) recommendation.
      // This prevents silent message drops under load.
      broadcast: { self: true, ack: true },
      presence: { key: multiplayer.playerId }
    }
  });

  multiplayer.channel = channel;

  channel
    .on("presence", { event: "sync" }, syncMultiplayerPresence)
    .on("presence", { event: "join" }, handleMultiplayerPresenceJoin)
    .on("presence", { event: "leave" }, handleMultiplayerPresenceLeave);

  ["room_seed", "ready_update", "start_match", "state_tick", "player_dead", "match_result", "rematch_request", "leave_match"].forEach((eventName) => {
    channel.on("broadcast", { event: eventName }, ({ payload }) => handleMultiplayerBroadcast(eventName, payload || {}));
  });

  channel.subscribe((status) => {
    if (multiplayer.channel !== channel) {
      return;
    }

    if (status === "SUBSCRIBED") {
      multiplayer.subscribed = true;
      // Only update status/UI if we're not mid-match — a reconnect during a
      // game should restore subscribed=true without clobbering the playing state.
      if (multiplayer.status !== "playing" && multiplayer.status !== "starting") {
        multiplayer.status = "lobby";
        showMultiplayerStatus(multiplayer.isHost ? "Room created. Share the code." : "Joined room.", "success");
        renderMultiplayerScreen();
      }
      trackMultiplayerPresence();
      return;
    }

    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
      multiplayer.subscribed = false;
      if (game && game.onlineDuel && multiplayer.status === "playing" && !multiplayer.result) {
        // Do NOT immediately end the match on a transient channel error/reconnect.
        // Supabase Realtime can briefly fire CLOSED during a reconnect cycle.
        // Let checkMultiplayerDisconnect handle the timeout via MULTIPLAYER_DISCONNECT_LIMIT
        // so the match survives brief connection hiccups.
        return;
      }

      showMultiplayerStatus("Could not connect to the room.", "error");
    }
  });

  renderMultiplayerScreen();
  showMultiplayerStatus("Connecting to room...", "");
}

function leaveMultiplayerRoom(broadcast = true) {
  const channel = multiplayer.channel;

  if (channel && broadcast) {
    sendMultiplayerBroadcast("leave_match", {
      reason: game && game.onlineDuel && game.running ? "left" : "lobby"
    });
  }

  if (multiplayer.resultTimer) {
    clearTimeout(multiplayer.resultTimer);
  }

  if (multiplayer.deathTickInterval) {
    clearInterval(multiplayer.deathTickInterval);
    multiplayer.deathTickInterval = null;
  }

  if (multiplayer.guestFallbackTimer) {
    clearTimeout(multiplayer.guestFallbackTimer);
    multiplayer.guestFallbackTimer = null;
  }

  if (channel && leaderboardClient) {
    try {
      channel.untrack();
      leaderboardClient.removeChannel(channel);
    } catch (error) {
      // Realtime cleanup is best effort when leaving a room.
    }
  }

  multiplayer = createMultiplayerState();

  if (multiplayerScreen.classList.contains("active")) {
    renderMultiplayerScreen();
    showMultiplayerStatus("Create a room or join a friend.", "");
  }
}

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
    updatedAt: Date.now()
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

  if (game && game.onlineDuel && multiplayer.status === "playing") {
    // During an active match, presence state is unreliable — brief reconnects or
    // Supabase sync delays can make the opponent look absent for a moment even
    // though they're still connected. State-ticks (receiveMultiplayerStateTick)
    // are the authoritative liveness signal while the game is running; only
    // update the lobby players list from presence when we're not yet playing.
    const opponentInPresence = acceptedPlayers.find((player) => player.playerId !== multiplayer.playerId);
    if (opponentInPresence) {
      multiplayer.matchHadOpponent = true;
      multiplayer.matchOpponentId = opponentInPresence.playerId;
      // Opponent is back — clear any leave grace timer so the match continues.
      multiplayer.opponentLeftAt = 0;
    }
    // Do NOT set opponentLeftAt here based on absence; let handleMultiplayerPresenceLeave
    // and checkMultiplayerDisconnect (driven by state-tick timing) handle that.
    return;
  }

  const hadOpponent = multiplayer.players.some((player) => player.playerId !== multiplayer.playerId);
  multiplayer.players = acceptedPlayers;

  if (!game || !game.onlineDuel) {
    renderMultiplayerScreen();
    maybeStartMultiplayerMatch();
    return;
  }

  const hasOpponent = multiplayer.players.some((player) => player.playerId !== multiplayer.playerId);
  if (!hasOpponent && hadOpponent && !multiplayer.opponentLeftAt) {
    multiplayer.opponentLeftAt = Date.now();
  }

  multiplayer.players = acceptedPlayers;
  renderMultiplayerScreen();
  maybeStartMultiplayerMatch();
}

function flattenMultiplayerPresence(state) {
  const byId = new Map();

  Object.values(state || {}).forEach((presences) => {
    presences.forEach((presence) => {
      if (!presence || presence.roomCode !== multiplayer.roomCode || !presence.playerId) {
        return;
      }

      const existing = byId.get(presence.playerId);

      if (!existing || Number(presence.updatedAt) >= Number(existing.updatedAt || 0)) {
        byId.set(presence.playerId, normalizeMultiplayerPresence(presence));
      }
    });
  });

  return [...byId.values()].sort(compareMultiplayerPlayers);
}

function normalizeMultiplayerPresence(presence) {
  return {
    playerId: String(presence.playerId || ""),
    name: sanitizeLeaderboardName(presence.name || "Player") || "Player",
    characterId: getCharacter(presence.characterId).id,
    role: presence.role === "host" ? "host" : "guest",
    ready: Boolean(presence.ready),
    alive: presence.alive !== false,
    score: Number(presence.score) || 0,
    status: typeof presence.status === "string" ? presence.status : "lobby",
    xRatio: clampNumber(Number(presence.xRatio), 0, 1, 0.5),
    yOffset: Number.isFinite(Number(presence.yOffset)) ? Number(presence.yOffset) : 0,
    size: clampNumber(Number(presence.size), 30, 86, 48),
    runTime: Number(presence.runTime) || 0,
    joinedAt: Number(presence.joinedAt) || 0,
    updatedAt: Number(presence.updatedAt) || 0
  };
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, value));
}

function compareMultiplayerPlayers(first, second) {
  if (first.role !== second.role) {
    return first.role === "host" ? -1 : 1;
  }

  if (first.joinedAt !== second.joinedAt) {
    return first.joinedAt - second.joinedAt;
  }

  return first.playerId.localeCompare(second.playerId);
}

function getAcceptedMultiplayerPlayers(players) {
  const sorted = [...players].sort(compareMultiplayerPlayers);
  const host = sorted.find((player) => player.role === "host");
  const guests = sorted.filter((player) => player.playerId !== (host && host.playerId));

  return (host ? [host, ...guests] : guests).slice(0, MULTIPLAYER_MAX_PLAYERS);
}

function handleMultiplayerPresenceJoin({ newPresences }) {
  // When the opponent rejoins presence (e.g. after a brief network blip), clear
  // any pending leave timer so the match is not incorrectly ended.
  const opponentRejoined = (newPresences || []).some(
    (presence) => presence.playerId && presence.playerId !== multiplayer.playerId
  );

  if (opponentRejoined && multiplayer.opponentLeftAt) {
    multiplayer.opponentLeftAt = 0;
  }
}

function handleMultiplayerPresenceLeave({ leftPresences }) {
  if (!game || !game.onlineDuel || multiplayer.status !== "playing") {
    return;
  }

  const opponentLeft = (leftPresences || []).some((presence) => presence.playerId && presence.playerId !== multiplayer.playerId);

  if (!opponentLeft || multiplayer.opponentLeftAt) {
    return;
  }

  // Presence leave fires false positives during game startup — Supabase fires
  // them whenever track() updates propagate. Only treat it as meaningful if:
  //   1. We are past the 5-second startup grace window, AND
  //   2. We have already received at least one real state-tick from the opponent.
  // Otherwise, let checkMultiplayerDisconnect (state-tick silence) be the judge.
  const now = Date.now();
  const STARTUP_GRACE_MS = 5000;
  const pastStartupGrace = multiplayer.matchStartedAt && (now - multiplayer.matchStartedAt) >= STARTUP_GRACE_MS;
  const hasSeenStateTick = multiplayer.lastOpponentStateAt > (multiplayer.matchStartedAt || 0);

  if (pastStartupGrace && hasSeenStateTick) {
    multiplayer.opponentLeftAt = now;
  }
}

function handleMultiplayerBroadcast(eventName, payload) {
  if (!payload || payload.roomCode !== multiplayer.roomCode) {
    return;
  }

  if (eventName === "room_seed") {
    multiplayer.matchSeed = payload.seed || multiplayer.matchSeed;
    return;
  }

  if (eventName === "ready_update") {
    syncMultiplayerPresence();
    return;
  }

  if (eventName === "start_match") {
    startMultiplayerMatch(payload);
    return;
  }

  if (eventName === "state_tick") {
    receiveMultiplayerStateTick(payload);
    return;
  }

  if (eventName === "player_dead") {
    recordMultiplayerDeath(payload);
    return;
  }

  if (eventName === "match_result") {
    finishMultiplayerMatch(payload);
    return;
  }

  if (eventName === "rematch_request") {
    resetMultiplayerLobby(false);
    showMultiplayerStatus(`${sanitizeLeaderboardName(payload.name || "Opponent") || "Opponent"} wants a rematch.`, "");
    return;
  }

  if (eventName === "leave_match" && payload.senderId !== multiplayer.playerId && game && game.onlineDuel && multiplayer.status === "playing") {
    finishMultiplayerMatch({
      winnerId: multiplayer.playerId,
      loserId: payload.senderId,
      reason: "left",
      scores: getMultiplayerScoreMap()
    });
  }
}

async function sendMultiplayerBroadcast(eventName, payload = {}) {
  if (!multiplayer.channel) {
    return "offline";
  }

  // During active gameplay, attempt state_tick sends even if subscribed briefly
  // dropped to false (transient reconnect). Other event types still require
  // a confirmed subscription so we don't spam before the room is ready.
  const isStateTick = eventName === "state_tick";
  if (!multiplayer.subscribed && !isStateTick) {
    return "offline";
  }

  const fullPayload = {
    ...payload,
    roomCode: multiplayer.roomCode,
    senderId: multiplayer.playerId,
    sentAt: Date.now()
  };

  // Retry loop matching the article's pattern: if Supabase rate-limits the send,
  // wait one animation frame and retry. Cap at 3 attempts to avoid spinning forever.
  // State ticks are low-priority so skip retry for them — just drop and wait for next tick.
  const maxRetries = isStateTick ? 1 : 3;
  let attempts = 0;
  let response;

  do {
    try {
      response = await multiplayer.channel.send({
        type: "broadcast",
        event: eventName,
        payload: fullPayload
      });
    } catch {
      response = "error";
    }

    attempts++;

    if (response === "rate limited" || response === "error") {
      // Wait one frame before retrying, same as article's Future.delayed(Duration.zero)
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  } while (
    (response === "rate limited") &&
    attempts < maxRetries
  );

  return response;
}

function toggleMultiplayerReady() {
  if (!multiplayer.channel || multiplayer.status === "starting" || multiplayer.status === "playing") {
    return;
  }

  multiplayer.ready = !multiplayer.ready;
  trackMultiplayerPresence();
  sendMultiplayerBroadcast("ready_update", { ready: multiplayer.ready });
  renderMultiplayerScreen();
  maybeStartMultiplayerMatch();
}

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
    mode: "classic",
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
  startGame("classic", {
    onlineDuel: true,
    seed: multiplayer.matchSeed,
    roomCode: multiplayer.roomCode
  });
  trackMultiplayerPresence();
}

function updateMultiplayerDuringGame(options = {}) {
  if (!game.onlineDuel || !multiplayer.channel || multiplayer.status !== "playing") {
    return;
  }

  const now = Date.now();
  const stateIntervalMs = MULTIPLAYER_STATE_INTERVAL * 1000;
  const presenceIntervalMs = MULTIPLAYER_PRESENCE_INTERVAL * 1000;

  if (!game.multiplayerLastStateSentAt || now - game.multiplayerLastStateSentAt >= stateIntervalMs) {
    game.multiplayerLastStateSentAt = now;
    sendMultiplayerStateTick();
  }

  if (!game.multiplayerLastPresenceSentAt || now - game.multiplayerLastPresenceSentAt >= presenceIntervalMs) {
    game.multiplayerLastPresenceSentAt = now;
    trackMultiplayerPresence();
  }

  if (options.checkDisconnect !== false) {
    checkMultiplayerDisconnect();
  }
}

function sendMultiplayerStateTick() {
  if (!game || !game.onlineDuel || !game.running) {
    return;
  }

  const player = game.player;

  sendMultiplayerBroadcast("state_tick", {
    playerId: multiplayer.playerId,
    name: getSavedLeaderboardName() || "Player",
    characterId: saveState.equippedCharacter,
    xRatio: (player.x + player.width / 2) / game.width,
    // Send y as a score-relative offset so it's meaningful regardless of
    // the receiver's canvas height or startY value.
    yOffset: player.y - game.startY,
    // Also send cameraY offset so receiver can position ghost relative to their own camera.
    cameraOffset: player.y - game.cameraY,
    size: player.width,
    score: game.score,
    alive: true,
    runTime: game.runTime
  });
}

function receiveMultiplayerStateTick(payload) {
  if (!game || !game.onlineDuel || payload.playerId === multiplayer.playerId) {
    return;
  }

  updateOpponentSnapshot(payload);
}

function updateOpponentSnapshot(payload) {
  if (!game || !game.onlineDuel || !payload || payload.playerId === multiplayer.playerId) {
    return;
  }

  const now = Date.now();
  multiplayer.opponentLeftAt = 0;
  multiplayer.lastOpponentStateAt = now;
  multiplayer.matchHadOpponent = true;
  multiplayer.matchOpponentId = String(payload.playerId);
  multiplayer.opponent = {
    playerId: payload.playerId,
    name: sanitizeLeaderboardName(payload.name || "Opponent") || "Opponent",
    characterId: getCharacter(payload.characterId).id,
    xRatio: clampNumber(Number(payload.xRatio), 0, 1, multiplayer.opponent ? multiplayer.opponent.xRatio : 0.5),
    yOffset: Number.isFinite(Number(payload.yOffset)) ? Number(payload.yOffset) : (multiplayer.opponent ? multiplayer.opponent.yOffset : 0),
    cameraOffset: Number.isFinite(Number(payload.cameraOffset)) ? Number(payload.cameraOffset) : null,
    size: clampNumber(Number(payload.size), 30, 86, multiplayer.opponent ? multiplayer.opponent.size : 48),
    score: Number(payload.score) || 0,
    alive: payload.alive !== false,
    updatedAt: now
  };
}

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

  // Keep sending state ticks after death so the opponent's disconnect check
  // doesn't mistake our silence for a connection drop before result resolves.
  if (multiplayer.deathTickInterval) {
    clearInterval(multiplayer.deathTickInterval);
  }
  multiplayer.deathTickInterval = setInterval(() => {
    if (multiplayer.result || !multiplayer.channel || !multiplayer.subscribed) {
      clearInterval(multiplayer.deathTickInterval);
      multiplayer.deathTickInterval = null;
      return;
    }
    sendMultiplayerBroadcast("state_tick", {
      playerId: multiplayer.playerId,
      name: getSavedLeaderboardName() || "Player",
      characterId: saveState.equippedCharacter,
      xRatio: 0.5,
      yOffset: 9999,
      size: game ? game.player.width : 40,
      score: game ? game.score : 0,
      alive: false,
      runTime: game ? game.runTime : 0
    });
  }, MULTIPLAYER_STATE_INTERVAL * 1000);
}

function recordMultiplayerDeath(payload) {
  if (!payload || !payload.playerId || multiplayer.result) {
    return;
  }

  if (!multiplayer.deaths[payload.playerId]) {
    multiplayer.deaths[payload.playerId] = {
      playerId: payload.playerId,
      name: sanitizeLeaderboardName(payload.name || "Player") || "Player",
      score: Number(payload.score) || 0,
      diedAt: Number(payload.diedAt) || Date.now(),
      reason: payload.reason || "fell"
    };
  }

  scheduleMultiplayerResultCheck();
}

function scheduleMultiplayerResultCheck() {
  clearMultiplayerResultTimer();
  multiplayer.resultTimer = window.setTimeout(resolveMultiplayerResult, MULTIPLAYER_SIMULTANEOUS_WINDOW + 80);
}

function clearMultiplayerResultTimer() {
  if (multiplayer.resultTimer) {
    clearTimeout(multiplayer.resultTimer);
    multiplayer.resultTimer = null;
  }
}

function resolveMultiplayerResult() {
  if (multiplayer.result) {
    return;
  }

  const deaths = Object.values(multiplayer.deaths);

  // No deaths recorded yet — reschedule up to 10 times (~5.8s) waiting for
  // player_dead broadcasts to arrive over the network.
  if (!deaths.length) {
    multiplayer.resultRescheduleCount = (multiplayer.resultRescheduleCount || 0) + 1;
    if (multiplayer.resultRescheduleCount <= 10) {
      scheduleMultiplayerResultCheck();
    }
    // After 10 reschedules with no deaths, let the disconnect check take over naturally.
    return;
  }

  // Reset reschedule counter once we have death data.
  multiplayer.resultRescheduleCount = 0;

  let result;

  if (deaths.length === 1) {
    const death = deaths[0];

    if (Date.now() - death.diedAt < MULTIPLAYER_SIMULTANEOUS_WINDOW) {
      scheduleMultiplayerResultCheck();
      return;
    }

    result = {
      winnerId: getOtherMultiplayerPlayerId(death.playerId),
      loserId: death.playerId,
      reason: death.reason,
      scores: getMultiplayerScoreMap()
    };
  } else {
    const sorted = deaths.sort((first, second) => first.diedAt - second.diedAt);
    const first = sorted[0];
    const second = sorted[1];
    const simultaneous = Math.abs(first.diedAt - second.diedAt) <= MULTIPLAYER_SIMULTANEOUS_WINDOW;

    if (simultaneous) {
      if (first.score === second.score) {
        result = {
          winnerId: "",
          loserId: "",
          reason: "draw",
          scores: getMultiplayerScoreMap()
        };
      } else {
        const winner = first.score > second.score ? first : second;
        const loser = first.score > second.score ? second : first;
        result = {
          winnerId: winner.playerId,
          loserId: loser.playerId,
          reason: "score",
          scores: getMultiplayerScoreMap()
        };
      }
    } else {
      result = {
        winnerId: second.playerId,
        loserId: first.playerId,
        reason: first.reason,
        scores: getMultiplayerScoreMap()
      };
    }
  }

  if (multiplayer.isHost) {
    // Host is the single authority: broadcast the result then apply it locally.
    const broadcastResult = Object.assign({}, result, { _fromHost: true });
    sendMultiplayerBroadcast("match_result", broadcastResult);
    finishMultiplayerMatch(broadcastResult);
  } else {
    // Guest waits for the host's match_result broadcast (already handled in
    // handleMultiplayerBroadcast). Only apply locally as a last-resort fallback
    // if the host broadcast hasn't arrived within 10 seconds.
    multiplayer.guestFallbackTimer = window.setTimeout(() => {
      if (!multiplayer.result) {
        finishMultiplayerMatch(result);
      }
    }, 10000);
  }
}

function getOtherMultiplayerPlayerId(playerId) {
  const other = multiplayer.players.find((player) => player.playerId !== playerId);
  return other ? other.playerId : multiplayer.matchOpponentId;
}

function getMultiplayerScoreMap() {
  const scores = {};
  scores[multiplayer.playerId] = game ? game.score : 0;

  if (multiplayer.opponent) {
    scores[multiplayer.opponent.playerId] = multiplayer.opponent.score;
  }

  Object.values(multiplayer.deaths).forEach((death) => {
    scores[death.playerId] = death.score;
  });

  return scores;
}

function checkMultiplayerDisconnect() {
  if (multiplayer.result || !multiplayer.matchHadOpponent) {
    return;
  }

  const now = Date.now();

  // Never fire a disconnect in the first 5 seconds — state-ticks from the
  // opponent may not have arrived yet right after game start.
  const STARTUP_GRACE_S = 5;
  if (multiplayer.matchStartedAt && (now - multiplayer.matchStartedAt) / 1000 < STARTUP_GRACE_S) {
    return;
  }

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

  if (multiplayer.isHost) {
    // Host is the authority on disconnect results too — broadcast then apply.
    const broadcastResult = Object.assign({}, result, { _fromHost: true });
    sendMultiplayerBroadcast("match_result", broadcastResult);
    finishMultiplayerMatch(broadcastResult);
  } else {
    // Guest: give the host extra time to send a result before declaring victory ourselves.
    // If host's match_result arrives first, guestFallbackTimer is cleared and we never apply this.
    if (!multiplayer.guestFallbackTimer) {
      multiplayer.guestFallbackTimer = window.setTimeout(() => {
        if (!multiplayer.result) {
          finishMultiplayerMatch(result);
        }
      }, 8000);
    }
  }
}

function finishMultiplayerMatch(result) {
  if (!game || !game.onlineDuel) {
    return;
  }

  // The host is the single authority on match results. If the guest has already
  // set a local result (e.g. from a race-condition fallback) but the host's
  // broadcast now arrives with a different verdict, the host result wins.
  const isHostBroadcast = result._fromHost === true;
  if (multiplayer.result) {
    if (!multiplayer.isHost && isHostBroadcast) {
      // Override guest's locally-derived result with the authoritative host result.
      multiplayer.result = null;
    } else {
      return;
    }
  }

  multiplayer.result = result;
  multiplayer.status = "ended";
  clearMultiplayerResultTimer();

  if (multiplayer.guestFallbackTimer) {
    clearTimeout(multiplayer.guestFallbackTimer);
    multiplayer.guestFallbackTimer = null;
  }

  if (game.running) {
    game.running = false;
  }

  saveMultiplayerRunXp();
  saveMultiplayerStats(result);
  pauseOverlay.classList.add("hidden");
  countdownOverlay.classList.add("hidden");
  restartButton.textContent = "Back To Lobby";
  const isDraw = !result.winnerId;
  const didWin = result.winnerId === multiplayer.playerId;
  const didLose = result.loserId === multiplayer.playerId;
  gameOverTitle.textContent = isDraw ? "Draw" : didWin ? "Victory" : didLose ? "Defeat" : "Match Over";
  gameOverMessage.textContent = getMultiplayerResultMessage(result);
  gameOverMessage.classList.remove("hidden");
  finalScore.textContent = game.score;
  finalBest.textContent = getModeBest("classic");
  finalTotalXp.textContent = saveState.xp;
  prepareLeaderboardSubmit();
  gameOverOverlay.classList.remove("hidden");
  trackMultiplayerPresence({ ready: false });
}

function getMultiplayerResultMessage(result) {
  if (result.reason === "draw") {
    return "Both players tied during the final fall.";
  }

  if (result.reason === "disconnect") {
    return result.winnerId === multiplayer.playerId ? "Opponent disconnected." : "Connection lost.";
  }

  if (result.reason === "left") {
    return result.winnerId === multiplayer.playerId ? "Opponent left the duel." : "You left the duel.";
  }

  if (result.reason === "score") {
    return "Both players fell together. Higher score wins.";
  }

  return result.winnerId === multiplayer.playerId ? "Your opponent fell first." : "You fell first.";
}

function saveMultiplayerRunXp() {
  if (!game || game.xpSaved) {
    return;
  }

  const scoreXp = Math.floor(game.score / 20);
  const earned = scoreXp + game.xpRun;
  game.finalXpEarned = earned;
  game.xpSaved = true;
  saveState.xp += earned;
  saveData();
}

async function saveMultiplayerStats(result) {
  if (!leaderboardClient || !authState || !authState.user) {
    return; // Not logged in — skip leaderboard save
  }

  const isDraw = !result.winnerId && !result.loserId;
  const didWin = result.winnerId === multiplayer.playerId;
  const didLose = result.loserId === multiplayer.playerId;

  if (!didWin && !didLose && !isDraw) {
    return; // Spectator or unknown role — skip
  }

  const playerName = getSavedLeaderboardName() || "Player";
  const characterId = saveState.equippedCharacter || "regular";

  try {
    // Fetch current stats so we can increment them
    const { data: existing } = await leaderboardClient
      .from("multiplayer_leaderboard")
      .select("wins, losses, win_streak")
      .eq("user_id", authState.user.id)
      .maybeSingle();

    const prevWins = existing ? existing.wins : 0;
    const prevLosses = existing ? existing.losses : 0;
    const prevStreak = existing ? existing.win_streak : 0;

    const newWins = prevWins + (didWin ? 1 : 0);
    const newLosses = prevLosses + (didLose ? 1 : 0);
    const newStreak = didWin ? prevStreak + 1 : 0;

    await leaderboardClient
      .from("multiplayer_leaderboard")
      .upsert(
        {
          user_id: authState.user.id,
          player_name: playerName,
          wins: newWins,
          losses: newLosses,
          win_streak: newStreak,
          character_id: characterId,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );
  } catch (err) {
    // Leaderboard save is best-effort; never crash the game over it
    console.warn("saveMultiplayerStats failed:", err);
  }
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

function copyMultiplayerRoomCode() {
  if (!multiplayer.roomCode) {
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(multiplayer.roomCode).then(() => {
      showMultiplayerStatus("Room code copied.", "success");
    }).catch(() => {
      showMultiplayerStatus(`Room code: ${multiplayer.roomCode}`, "");
    });
    return;
  }

  showMultiplayerStatus(`Room code: ${multiplayer.roomCode}`, "");
}

function renderGameModes() {
  modeList.innerHTML = "";

  Object.values(GAME_MODES).forEach((mode) => {
    const card = document.createElement("button");
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    const description = document.createElement("span");
    const best = document.createElement("span");

    card.className = "mode-card";
    title.textContent = mode.label;
    description.textContent = mode.description;
    best.textContent = `Best: ${getModeBest(mode.id)}`;
    best.className = "mode-best";
    copy.append(title, description, best);
    card.appendChild(copy);
    card.addEventListener("click", () => startGame(mode.id));
    modeList.appendChild(card);
  });
}

function getModeBest(modeId) {
  return Number(saveState.modeBests[modeId]) || 0;
}

function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) || CHARACTERS[0];
}

function normalizeCharacters(characters) {
  const source = Array.isArray(characters) && characters.length ? characters : DEFAULT_CHARACTER_CONFIG;
  const seenIds = new Set();
  const normalized = [];

  source.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const file = typeof entry.file === "string" && entry.file.trim() ? entry.file.trim() : "";
    const assetInput = typeof entry.asset === "string" && entry.asset.trim() ? entry.asset.trim() : "";

    if (!file && !assetInput) {
      return;
    }

    const asset = assetInput || `${CHARACTER_ASSET_BASE_PATH}${file}`;
    const id = getCharacterId(entry, file, index);
    const price = Number(entry.price);

    if (seenIds.has(id)) {
      return;
    }

    seenIds.add(id);
    normalized.push({
      id,
      name: getCharacterName(entry, file),
      file,
      asset,
      price: Number.isFinite(price) && price > 0 ? Math.round(price) : 0,
      section: getCharacterSection(entry),
      limitedTime: Boolean(entry.limitedTime),
      rarity: getCharacterRarity(entry),
      fill: typeof entry.fill === "string" ? entry.fill : "#35c2ff",
      face: typeof entry.face === "string" ? entry.face : "#061019",
      ring: typeof entry.ring === "string" ? entry.ring : "#ffffff"
    });
  });

  if (!normalized.length && source !== DEFAULT_CHARACTER_CONFIG) {
    return normalizeCharacters(DEFAULT_CHARACTER_CONFIG);
  }

  return normalized;
}

function getCharacterId(entry, file, index) {
  const rawId = typeof entry.id === "string" && entry.id.trim()
    ? entry.id.trim()
    : getCharacterName(entry, file).toLowerCase();
  const id = rawId
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return id || `character-${index + 1}`;
}

function getCharacterName(entry, file) {
  if (typeof entry.name === "string" && entry.name.trim()) {
    return entry.name.trim();
  }

  return file.replace(/\.[^/.]+$/, "").trim() || "Character";
}

function getCharacterSection(entry) {
  if (typeof entry.section === "string" && entry.section.trim()) {
    return entry.section.trim();
  }

  return entry.limitedTime ? "Limited" : DEFAULT_CHARACTER_SECTION;
}

function getCharacterRarity(entry) {
  const rarity = typeof entry.rarity === "string" ? entry.rarity.trim().toLowerCase() : "";
  const normalized = rarity === "blue" ? "uncommon" : rarity === "geen" ? "common" : rarity;

  if (CHARACTER_RARITIES[normalized]) {
    return CHARACTER_RARITIES[normalized].label;
  }

  return entry.limitedTime ? CHARACTER_RARITIES.rare.label : CHARACTER_RARITIES.common.label;
}

function getRarityMeta(character) {
  const rarity = typeof character.rarity === "string" ? character.rarity.trim().toLowerCase() : "";
  const key = rarity === "blue" ? "uncommon" : rarity === "geen" ? "common" : rarity;

  return CHARACTER_RARITIES[key] || CHARACTER_RARITIES.common;
}

function loadCharacterImages() {
  CHARACTERS.forEach((character) => {
    const image = new Image();
    image.src = character.asset;
    characterImages[character.id] = image;
  });
}

function loadBackgroundAdImages() {
  BACKGROUND_AD_ASSETS.forEach((src) => {
    const image = new Image();
    image.src = src;
    backgroundAdImages.push(image);
  });
}

function normalizePowerups(powerups) {
  const source = Array.isArray(powerups) ? powerups : DEFAULT_POWERUPS;

  return source
    .map((entry) => {
      const rarity = Number(entry.rarity);
      const duration = Number(entry.duration);
      const sizeBonus = Number(entry.sizeBonus);
      const xpMultiplier = Number(entry.xpMultiplier);
      const boostVelocity = Number(entry.boostVelocity);

      return {
        id: typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : "",
        name: typeof entry.name === "string" ? entry.name : "Powerup",
        emoji: typeof entry.emoji === "string" ? entry.emoji : "?",
        rarity: Number.isFinite(rarity) && rarity > 0 ? rarity : 1,
        effect: typeof entry.effect === "string" ? entry.effect : "",
        sizeBonus: Number.isFinite(sizeBonus) ? sizeBonus : 0,
        xpMultiplier: Number.isFinite(xpMultiplier) && xpMultiplier > 0 ? xpMultiplier : 1,
        boostVelocity: Number.isFinite(boostVelocity) ? boostVelocity : -1100,
        duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
        message: typeof entry.message === "string" ? entry.message : "Powerup!"
      };
    })
    .filter((entry) => entry.id && entry.effect);
}


function normalizeBuyablePowerups(powerups) {
  const source = Array.isArray(powerups) ? powerups : DEFAULT_BUYABLE_POWERUPS;

  return source
    .map((entry) => {
      const price = Number(entry.price);
      const speedMultiplier = Number(entry.speedMultiplier);
      const jumpMultiplier = Number(entry.jumpMultiplier);
      const gravityMultiplier = Number(entry.gravityMultiplier);
      const charges = Number(entry.charges);
      const revives = Number(entry.revives);

      return {
        id: typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : "",
        name: typeof entry.name === "string" ? entry.name : "Boost",
        emoji: typeof entry.emoji === "string" ? entry.emoji : "✨",
        price: Number.isFinite(price) && price >= 0 ? Math.round(price) : 0,
        effect: typeof entry.effect === "string" ? entry.effect : "",
        speedMultiplier: Number.isFinite(speedMultiplier) && speedMultiplier > 0 ? speedMultiplier : 1,
        jumpMultiplier: Number.isFinite(jumpMultiplier) && jumpMultiplier > 0 ? jumpMultiplier : 1,
        gravityMultiplier: Number.isFinite(gravityMultiplier) && gravityMultiplier > 0 ? gravityMultiplier : 1,
        charges: Number.isFinite(charges) && charges > 0 ? Math.round(charges) : 0,
        revives: Number.isFinite(revives) && revives > 0 ? Math.round(revives) : 0,
        description: typeof entry.description === "string" ? entry.description : "One-round boost.",
        message: typeof entry.message === "string" ? entry.message : "Boost active!"
      };
    })
    .filter((entry) => entry.id && entry.effect);
}

function normalizeBoostInventory(value) {
  const source = value && typeof value === "object" ? value : {};
  const inventory = {};

  buyablePowerupDefinitions.forEach((boost) => {
    const count = Number(source[boost.id]);
    inventory[boost.id] = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  });

  return inventory;
}

function normalizeSelectedBoosts(value, inventory = saveState.boostInventory) {
  const source = Array.isArray(value) ? value : [];
  const counts = normalizeBoostInventory(inventory);

  return source.filter((id, index, ids) => {
    return typeof id === "string" && ids.indexOf(id) === index && buyablePowerupById[id] && counts[id] > 0;
  });
}

function getBoostCount(boostId) {
  return Math.max(0, Math.floor(Number(saveState.boostInventory && saveState.boostInventory[boostId]) || 0));
}

function isBoostSelected(boostId) {
  return saveState.selectedBoosts.includes(boostId);
}

function renderStore() {
  storeXp.textContent = saveState.xp;
  renderStoreTabs();
  storeList.innerHTML = "";

  if (activeStoreSection === BOOST_STORE_SECTION) {
    renderBoostStore();
    return;
  }

  const characters = getStoreCharacters();

  if (!characters.length) {
    const empty = document.createElement("div");
    empty.className = "empty-store";
    empty.textContent = "Nothing here yet.";
    storeList.appendChild(empty);
    return;
  }

  characters.forEach((character) => {
    const owned = saveState.ownedCharacters.includes(character.id);
    const equipped = saveState.equippedCharacter === character.id;
    const item = document.createElement("div");
    item.className = "shop-item";

    const preview = createCharacterPreview(character);

    const copy = document.createElement("div");
    copy.className = "item-copy";
    const title = createItemTitle(character);
    const price = document.createElement("span");
    price.textContent = character.price === 0 ? "Free" : `${character.price} XP`;
    copy.append(title, price);

    const action = document.createElement("button");
    if (!owned) {
      action.textContent = "Buy";
      action.disabled = saveState.xp < character.price;
      action.addEventListener("click", () => buyCharacter(character.id));
    } else if (equipped) {
      action.textContent = "Owned";
      action.disabled = true;
    } else {
      action.textContent = "Equip";
      action.addEventListener("click", () => equipCharacter(character.id));
    }

    item.append(preview, copy, action);
    storeList.appendChild(item);
  });
}

function renderBoostStore() {
  if (!buyablePowerupDefinitions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-store";
    empty.textContent = "No boosts are available yet.";
    storeList.appendChild(empty);
    return;
  }

  buyablePowerupDefinitions.forEach((boost) => {
    const count = getBoostCount(boost.id);
    const selected = isBoostSelected(boost.id);
    const item = document.createElement("div");
    item.className = "shop-item boost-shop-item";

    const preview = document.createElement("div");
    preview.className = "boost-preview";
    preview.textContent = boost.emoji;

    const copy = document.createElement("div");
    copy.className = "item-copy";
    const title = document.createElement("div");
    const name = document.createElement("strong");
    const owned = document.createElement("span");
    const description = document.createElement("span");
    title.className = "item-title";
    name.textContent = boost.name;
    owned.className = "boost-owned-count";
    owned.textContent = `Owned: ${count}`;
    description.textContent = `${boost.description} ${boost.price} XP each.`;
    title.append(name, owned);
    copy.append(title, description);

    const actions = document.createElement("div");
    actions.className = "boost-shop-actions";

    const buyButton = document.createElement("button");
    buyButton.type = "button";
    buyButton.textContent = "Buy";
    buyButton.disabled = saveState.xp < boost.price;
    buyButton.addEventListener("click", () => buyBoost(boost.id));

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.textContent = selected ? "Selected" : "Use Next";
    selectButton.className = selected ? "is-selected" : "";
    selectButton.disabled = count <= 0 && !selected;
    selectButton.addEventListener("click", () => toggleSelectedBoost(boost.id));

    actions.append(buyButton, selectButton);
    item.append(preview, copy, actions);
    storeList.appendChild(item);
  });
}

function renderStoreTabs() {
  const sections = getStoreSections();

  if (!sections.includes(activeStoreSection)) {
    activeStoreSection = sections[0] || DEFAULT_CHARACTER_SECTION;
  }

  storeTabs.innerHTML = "";

  sections.forEach((section) => {
    const tab = document.createElement("button");
    const selected = section === activeStoreSection;

    tab.type = "button";
    tab.textContent = section;
    tab.className = selected ? "is-selected" : "";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", selected ? "true" : "false");
    tab.addEventListener("click", () => {
      activeStoreSection = section;
      renderStore();
    });
    storeTabs.appendChild(tab);
  });
}

function getStoreCharacters() {
  return [...CHARACTERS]
    .filter((character) => character.section === activeStoreSection)
    .sort(compareCharactersForStore);
}

function getStoreSections() {
  return [...new Set([...CHARACTERS.map((character) => character.section || DEFAULT_CHARACTER_SECTION), BOOST_STORE_SECTION])]
    .sort(compareSections);
}

function buyBoost(boostId) {
  const boost = buyablePowerupById[boostId];

  if (!boost || saveState.xp < boost.price) {
    return;
  }

  saveState.xp -= boost.price;
  saveState.boostInventory[boost.id] = getBoostCount(boost.id) + 1;
  saveData();
  renderStore();
  renderBoostButtons();
  updateMenuStats();
}

function toggleSelectedBoost(boostId) {
  if (!buyablePowerupById[boostId]) {
    return;
  }

  if (isBoostSelected(boostId)) {
    saveState.selectedBoosts = saveState.selectedBoosts.filter((id) => id !== boostId);
  } else if (getBoostCount(boostId) > 0) {
    saveState.selectedBoosts.push(boostId);
  }

  saveState.selectedBoosts = normalizeSelectedBoosts(saveState.selectedBoosts, saveState.boostInventory);
  saveData();
  renderStore();
  renderBoostButtons();
}

function renderBoostButtons() {
  if (!boostButtonList) {
    return;
  }

  boostButtonList.innerHTML = "";

  buyablePowerupDefinitions.forEach((boost) => {
    const count = getBoostCount(boost.id);
    const selected = isBoostSelected(boost.id);
    const button = document.createElement("button");
    const countLabel = count > 99 ? "99+" : String(count);

    button.type = "button";
    button.className = selected ? "is-selected" : "";
    button.disabled = count <= 0 && !selected;
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.title = count > 0 ? `${boost.name}: ${count} owned` : `${boost.name}: buy more in the shop`;
    button.innerHTML = `<span aria-hidden="true">${boost.emoji}</span><strong>${countLabel}</strong>`;
    button.addEventListener("click", () => toggleSelectedBoost(boost.id));
    boostButtonList.appendChild(button);
  });
}

function compareCharactersForStore(first, second) {
  const sectionSort = compareSections(first.section, second.section);

  if (sectionSort !== 0) {
    return sectionSort;
  }

  if (first.price !== second.price) {
    return first.price - second.price;
  }

  return first.name.localeCompare(second.name);
}

function compareSections(first, second) {
  const firstRank = getSectionRank(first);
  const secondRank = getSectionRank(second);

  if (firstRank !== secondRank) {
    return firstRank - secondRank;
  }

  return first.localeCompare(second);
}

function getSectionRank(section) {
  const index = CHARACTER_SECTION_ORDER.indexOf(section);
  return index === -1 ? CHARACTER_SECTION_ORDER.length : index;
}

function createItemTitle(character) {
  const title = document.createElement("div");
  const name = document.createElement("strong");
  const rarityMeta = getRarityMeta(character);
  const rarityBadge = document.createElement("span");

  title.className = "item-title";
  name.textContent = character.name;
  rarityBadge.className = `rarity-badge ${rarityMeta.className}`;
  rarityBadge.textContent = rarityMeta.label;
  title.append(name, rarityBadge);

  if (character.limitedTime) {
    const badge = document.createElement("span");
    badge.className = "limited-badge";
    badge.textContent = "Limited";
    title.appendChild(badge);
  }

  return title;
}

async function redeemCode() {
  if (isAccountBanned()) {
    updateBannedState();
    return;
  }

  const code = redeemInput.value.trim().toLowerCase();

  if (!code) {
    setRedeemMessage("Enter a code first.", "error");
    return;
  }

  if (redeemLoading) {
    return;
  }

  if (saveState.redeemedCodes.includes(code)) {
    setRedeemMessage("That code was already redeemed.", "error");
    return;
  }

  if (!leaderboardClient) {
    setRedeemMessage("Code server is offline right now.", "error");
    return;
  }

  redeemLoading = true;
  redeemButton.disabled = true;
  setRedeemMessage("Checking code...", "");

  const { data, error } = await leaderboardClient.rpc(STORE_CODE_RPC, { p_code: code });

  redeemLoading = false;
  redeemButton.disabled = false;

  if (error) {
    setRedeemMessage("Could not check that code.", "error");
    return;
  }

  const reward = normalizeRedeemReward(data);

  if (!reward.active) {
    setRedeemMessage("That code is not active.", "error");
    return;
  }

  if (reward.xp) {
    saveState.xp += reward.xp;
  }

  if (reward.characterId && !saveState.ownedCharacters.includes(reward.characterId) && CHARACTERS.some((character) => character.id === reward.characterId)) {
    saveState.ownedCharacters.push(reward.characterId);
  }

  saveState.redeemedCodes.push(code);
  saveData();
  redeemInput.value = "";
  setRedeemMessage(reward.message || "Code redeemed.", "success");
  renderStore();
  updateMenuStats();
}

function normalizeRedeemReward(data) {
  const reward = data && typeof data === "object" ? data : {};
  const xp = Number(reward.xp);

  return {
    active: reward.active === true,
    xp: Number.isFinite(xp) && xp > 0 ? Math.round(xp) : 0,
    characterId: typeof reward.characterId === "string" ? reward.characterId : "",
    message: typeof reward.message === "string" && reward.message.trim() ? reward.message : "Code redeemed."
  };
}

function setRedeemMessage(message, type = "") {
  redeemMessage.textContent = message;
  redeemMessage.classList.toggle("success", type === "success");
  redeemMessage.classList.toggle("error", type === "error");
}

function renderCharacterSelect() {
  characterList.innerHTML = "";

  CHARACTERS
    .filter((character) => saveState.ownedCharacters.includes(character.id))
    .sort(compareCharactersForStore)
    .forEach((character) => {
      const equipped = saveState.equippedCharacter === character.id;
      const item = document.createElement("div");
      item.className = "shop-item";

      const preview = createCharacterPreview(character);

      const copy = document.createElement("div");
      copy.className = "item-copy";
      const title = createItemTitle(character);
      const status = document.createElement("span");
      status.textContent = equipped ? "Equipped" : "Owned";
      if (equipped) {
        status.className = "equipped-badge";
      }
      copy.append(title, status);

      const action = document.createElement("button");
      action.textContent = equipped ? "Equipped" : "Equip";
      action.disabled = equipped;
      action.addEventListener("click", () => equipCharacter(character.id));

      item.append(preview, copy, action);
      characterList.appendChild(item);
    });
}

function createCharacterPreview(character) {
  const preview = document.createElement("div");
  const image = document.createElement("img");

  preview.className = "character-preview";
  preview.style.backgroundColor = character.fill;
  preview.style.borderColor = character.ring;
  image.src = character.asset;
  image.alt = character.name;
  preview.appendChild(image);

  return preview;
}

function buyCharacter(characterId) {
  if (isAccountBanned()) {
    updateBannedState();
    return;
  }

  const character = getCharacter(characterId);

  if (saveState.ownedCharacters.includes(character.id) || saveState.xp < character.price) {
    renderStore();
    return;
  }

  saveState.xp -= character.price;
  saveState.ownedCharacters.push(character.id);
  saveState.equippedCharacter = character.id;
  saveData();
  renderStore();
}

function equipCharacter(characterId) {
  if (isAccountBanned()) {
    updateBannedState();
    return;
  }

  if (!saveState.ownedCharacters.includes(characterId)) {
    return;
  }

  saveState.equippedCharacter = characterId;
  saveData();
  renderStore();
  renderCharacterSelect();
}

function resizeCanvas() {
  const rect = gameFrame.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(240, Math.round(rect.width));
  const height = Math.max(360, Math.round(rect.height));

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (game) {
    game.width = width;
    game.height = height;
  }
}

function createPlatform(x, y, type = "normal", modeConfig = null, worldWidth = 420, rng = Math.random) {
  const sizes = {
    small: { width: 50, height: 12 },
    normal: { width: 72, height: 14 },
    large: { width: 100, height: 16 },
    moving: { width: 86, height: 14 },
    touch: { width: 78, height: 14 }
  };
  const random = typeof rng === "function" ? rng : Math.random;
  const powerup = modeConfig ? rollPowerup(modeConfig, random) : null;
  const width = sizes[type].width;
  const moveRange = type === "moving" ? 48 + random() * 62 : 0;
  const minX = Math.max(0, x - moveRange);
  const maxX = Math.min(worldWidth - width, x + moveRange);

  return {
    x,
    baseX: x,
    y,
    width,
    height: sizes[type].height,
    type,
    moveMinX: minX,
    moveMaxX: maxX,
    movePhase: random() * Math.PI * 2,
    moveSpeed: 1.2 + random() * 0.8,
    touched: false,
    bouncePad: random() < 0.12,
    coin: !powerup && random() < 0.22,
    coinCollected: false,
    powerup,
    powerupCollected: false
  };
}

function rollPowerup(modeConfig, rng = Math.random) {
  const random = typeof rng === "function" ? rng : Math.random;

  if (!powerupDefinitions.length || random() > modeConfig.powerupChance) {
    return null;
  }

  const totalRarity = powerupDefinitions.reduce((total, powerup) => total + powerup.rarity, 0);
  let roll = random() * totalRarity;

  for (const powerup of powerupDefinitions) {
    roll -= powerup.rarity;

    if (roll <= 0) {
      return powerup.id;
    }
  }

  return powerupDefinitions[powerupDefinitions.length - 1].id;
}

function randomPlatformType(rng = Math.random) {
  const random = typeof rng === "function" ? rng : Math.random;
  const roll = random();

  if (roll < 0.16) {
    return "small";
  }

  if (roll < 0.70) {
    return "normal";
  }

  if (roll < 0.82) {
    return "moving";
  }

  if (roll < 0.92) {
    return "touch";
  }

  if (roll > 0.92) {
    return "large";
  }

  return "normal";
}

function seedPlatforms(width, height, modeConfig, rng = Math.random) {
  const random = typeof rng === "function" ? rng : Math.random;
  const platforms = [];
  const startPlatformY = height - 95;
  const startPlatform = createPlatform(width / 2 - 50, startPlatformY, "large", null, width, random);
  startPlatform.bouncePad = false;
  startPlatform.coin = false;
  platforms.push(startPlatform);

  let nextY = startPlatformY - 82;
  let nextCenter = width / 2;
  while (nextY > -1100) {
    const type = randomPlatformType(random);
    const platformWidth = getPlatformWidth(type);
    const x = pickPlatformX(nextCenter, platformWidth, width, random);
    nextCenter = x + platformWidth / 2;
    platforms.push(createPlatform(x, nextY, type, modeConfig, width, random));
    nextY -= 72 + random() * 48;
  }

  return {
    platforms,
    nextY,
    nextCenter
  };
}

function pickPlatformX(previousCenter, platformWidth, width, rng = Math.random) {
  const random = typeof rng === "function" ? rng : Math.random;
  const margin = platformWidth / 2 + 8;
  const maxStep = Math.min(width * 0.44, 175);
  const centerPull = (width / 2 - previousCenter) * 0.5;
  const offset = (random() * 2 - 1) * maxStep + centerPull;
  let center = previousCenter + offset;

  if (random() < 0.18) {
    center = width * (0.34 + random() * 0.32);
  }

  center = Math.max(margin, Math.min(width - margin, center));

  return center - platformWidth / 2;
}

function getPlatformWidth(type) {
  if (type === "small") {
    return 50;
  }

  if (type === "large") {
    return 100;
  }

  if (type === "moving") {
    return 86;
  }

  if (type === "touch") {
    return 78;
  }

  return 72;
}

function consumeSelectedBoostsForRun() {
  const selected = normalizeSelectedBoosts(saveState.selectedBoosts, saveState.boostInventory);
  const activeBoosts = [];

  selected.forEach((boostId) => {
    const count = getBoostCount(boostId);
    const boost = buyablePowerupById[boostId];

    if (!boost || count <= 0) {
      return;
    }

    saveState.boostInventory[boostId] = count - 1;
    activeBoosts.push(boost);
  });

  saveState.selectedBoosts = [];

  if (activeBoosts.length) {
    saveData();
    renderBoostButtons();
    renderStore();
    updateMenuStats();
  }

  return activeBoosts;
}

function createRunBoostEffects(activeBoosts) {
  return activeBoosts.reduce((effects, boost) => {
    if (boost.effect === "speed") {
      effects.speedMultiplier *= boost.speedMultiplier;
    }

    if (boost.effect === "jump") {
      effects.jumpMultiplier *= boost.jumpMultiplier;
    }

    if (boost.effect === "slowFall") {
      effects.gravityMultiplier *= boost.gravityMultiplier;
    }

    if (boost.effect === "doubleJump") {
      effects.doubleJumpsRemaining += boost.charges || 2;
    }

    if (boost.effect === "revive") {
      effects.revivesRemaining += boost.revives || 1;
    }

    return effects;
  }, {
    speedMultiplier: 1,
    jumpMultiplier: 1,
    gravityMultiplier: 1,
    doubleJumpsRemaining: 0,
    revivesRemaining: 0
  });
}

function getRunSpeedMultiplier() {
  return game && game.effects ? game.effects.speedMultiplier || 1 : 1;
}

function getRunJumpMultiplier() {
  return game && game.effects ? game.effects.jumpMultiplier || 1 : 1;
}

function getRunGravityMultiplier() {
  return game && game.effects ? game.effects.gravityMultiplier || 1 : 1;
}

function getActiveBoostMessage(activeBoosts) {
  if (!activeBoosts.length) {
    return "";
  }

  if (activeBoosts.length === 1) {
    return `${activeBoosts[0].emoji} ${activeBoosts[0].message}`;
  }

  return `${activeBoosts.map((boost) => boost.emoji).join(" ")} ${activeBoosts.length} boosts active this round!`;
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
  const activeBoosts = isOnlineDuel ? [] : consumeSelectedBoostsForRun();
  const runBoostEffects = createRunBoostEffects(activeBoosts);
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
    adminAffected: false,
    adminFakeLagUntil: 0,
    xpSaved: false,
    rng,
    multiplayerLastStateSentAt: 0,
    multiplayerLastPresenceSentAt: 0,
    multiplayerDeathSent: false,
    antiCheat: null,
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
    activeBoosts,
    effects: {
      ...runBoostEffects,
      xpMultiplier: 1,
      xpMultiplierUntil: 0,
      message: getActiveBoostMessage(activeBoosts),
      messageUntil: activeBoosts.length ? 3 : 0
    },
    player: {
      x: width / 2 - 24,
      y: startY,
      width: 48,
      height: 48,
      maxSize: 76,
      vx: 0,
      vy: -740 * mode.jumpScale * runBoostEffects.jumpMultiplier,
      onScreen: true
    }
  };

  lastFrameTime = performance.now();
  markAntiCheatCheckpoint();
  startAdminLiveRouting();
  hideRunOverlays();
  updateCountdownOverlay();
  updateHud();
  drawGame();
  animationFrameId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
  stopAdminLiveRouting();

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (game) {
    game.running = false;
  }
}

function hideRunOverlays() {
  gameOverOverlay.classList.add("hidden");
  countdownOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
  hideAdminJumpscare();
  gameOverMessage.classList.add("hidden");
  gameOverMessage.textContent = "";
  if (doubleJumpButton) {
    doubleJumpButton.classList.add("hidden");
  }
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
  if (!game || !game.running || !gameScreen.classList.contains("active")) {
    return;
  }

  game.paused = paused;
  pauseOverlay.classList.toggle("hidden", !paused);

  if (paused) {
    resetInput();
  }
}

function togglePause() {
  if (!game || !game.running || !gameOverOverlay.classList.contains("hidden")) {
    return;
  }

  if (game.onlineDuel) {
    return;
  }

  setPaused(!game.paused);
}

function gameLoop(currentTime) {
  if (!game || !game.running) {
    return;
  }

  const deltaSeconds = Math.min(0.033, (currentTime - lastFrameTime) / 1000 || 0.016);
  lastFrameTime = currentTime;

  handleGamepadInput();

  if (game.paused) {
    drawGame();
    updateHud();
    animationFrameId = requestAnimationFrame(gameLoop);
    return;
  }

  if (game.countdownActive) {
    updateCountdown(deltaSeconds);
    updateMultiplayerDuringGame({ checkDisconnect: false });
    drawGame();
    updateHud();
    animationFrameId = requestAnimationFrame(gameLoop);
    return;
  }

  if (isAdminFakeLagActive()) {
    drawGame();
    updateHud();
    animationFrameId = requestAnimationFrame(gameLoop);
    return;
  }

  updateGame(deltaSeconds);
  drawGame();

  animationFrameId = requestAnimationFrame(gameLoop);
}

function updateCountdown(deltaSeconds) {
  game.countdownTime -= deltaSeconds;
  updateCountdownOverlay();

  if (game.countdownTime <= 0) {
    game.countdownActive = false;
    countdownOverlay.classList.add("hidden");
    trackMultiplayerPresence();
  }
}

function updateCountdownOverlay() {
  if (!game || !game.countdownActive) {
    countdownOverlay.classList.add("hidden");
    return;
  }

  countdownOverlay.classList.remove("hidden");

  if (game.countdownTime > 2.8) {
    countdownText.textContent = "3";
  } else if (game.countdownTime > 1.8) {
    countdownText.textContent = "2";
  } else if (game.countdownTime > 0.8) {
    countdownText.textContent = "1";
  } else {
    countdownText.textContent = "Go!";
  }
}

function updateGame(deltaSeconds) {
  if (!validateAntiCheatCheckpoint()) {
    return;
  }

  const antiCheatFrame = getAntiCheatSnapshot();
  game.runTime += deltaSeconds;
  updateTimer(deltaSeconds);

  if (!game.running) {
    return;
  }

  const player = game.player;
  const move = getMoveDirection();
  const touchMoving = isTouchMoveActive();
  const ramp = getModeRamp();
  const sensitivity = getControlSensitivity();
  const touchAccelerationScale = touchMoving ? 1.32 : 1;
  const touchSpeedScale = touchMoving ? 1.18 : 1;
  const speedBoost = getRunSpeedMultiplier();
  const acceleration = 3600 * sensitivity * touchAccelerationScale * game.modeConfig.speedScale * speedBoost * Math.min(1.45, 1 + (ramp - 1) * 0.5);
  const maxSpeed = 380 * sensitivity * touchSpeedScale * game.modeConfig.speedScale * speedBoost * Math.min(1.35, 1 + (ramp - 1) * 0.35);
  const gravity = 1500 * game.modeConfig.gravityScale * getRunGravityMultiplier() * Math.min(1.45, 1 + (ramp - 1) * 0.35);
  const friction = 0.9;

  updatePlatforms(deltaSeconds);

  if (move !== 0) {
    player.vx += move * acceleration * deltaSeconds;
  } else {
    player.vx *= friction;
  }

  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));
  player.vy += gravity * deltaSeconds;

  const previousBottom = player.y + player.height;
  player.x += player.vx * deltaSeconds;
  player.y += player.vy * deltaSeconds;

  if (player.x + player.width < 0) {
    player.x = game.width;
  } else if (player.x > game.width) {
    player.x = -player.width;
  }

  if (player.vy > 0) {
    checkPlatformCollisions(previousBottom);
  }

  collectCoins();
  collectPowerups();
  updateActivePowerups();
  updateCamera();
  updateBackgroundAds();
  generatePlatforms();
  prunePlatforms();
  updateParticles(deltaSeconds);
  updateHud();
  updateMultiplayerDuringGame();

  if (!validateAntiCheatFrame(antiCheatFrame)) {
    return;
  }

  markAntiCheatCheckpoint();

  if (player.y - game.cameraY > game.height + 90) {
    if (!revivePlayer()) {
      endGame("fell");
    }
  }
}

function updateTimer(deltaSeconds) {
  if (!game.timeLimit) {
    return;
  }

  game.timeElapsed += deltaSeconds;
  game.timeRemaining = Math.max(0, game.timeLimit - game.timeElapsed);

  if (game.timeRemaining <= 0) {
    updateHud();
    endGame("timeUp");
  }
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
    highestPoint: game.highestPoint
  };
}

function markAntiCheatCheckpoint() {
  if (!game) {
    return;
  }

  game.antiCheat = getAntiCheatSnapshot();
}

function validateAntiCheatCheckpoint() {
  if (!game || !game.running || game.countdownActive || game.paused || game.onlineDuel) {
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
  if (!game || !game.running || game.onlineDuel || !previous) {
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
  const maxHorizontalVelocity = 900 * getControlSensitivity() * game.modeConfig.speedScale * getRunSpeedMultiplier();

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

function isAntiCheatSnapshotFinite(snapshot) {
  return [
    snapshot.x,
    snapshot.y,
    snapshot.vx,
    snapshot.vy,
    snapshot.width,
    snapshot.height,
    snapshot.score,
    snapshot.highestPoint
  ].every(Number.isFinite);
}

function isAllowedHorizontalWrap(previous, current) {
  if (!game) {
    return false;
  }

  const wrappedRight = previous.x + previous.width < 8 && Math.abs(current.x - game.width) < 12;
  const wrappedLeft = previous.x > game.width - 8 && Math.abs(current.x + current.width) < 12;

  return wrappedRight || wrappedLeft;
}

function triggerAntiCheat(reason) {
  if (!game || game.antiCheatTriggered) {
    return;
  }

  game.antiCheatTriggered = true;
  stopGameLoop();
  console.warn(`Anti-cheat triggered: ${reason}`);
  window.location.href = CHEAT_REDIRECT_URL;
}

function getModeRamp() {
  if (!game || !game.modeConfig.scoreRamp) {
    return 1;
  }

  return Math.min(1.85, 1 + game.score / 700);
}

function getJumpVelocityForRamp(ramp, modeConfig = game.modeConfig) {
  return -740 * ramp * modeConfig.jumpScale * getRunJumpMultiplier();
}

function getBouncePadVelocityForRamp(ramp, modeConfig = game.modeConfig) {
  return -1050 * ramp * modeConfig.jumpScale * getRunJumpMultiplier();
}

function getMoveDirection() {
  let direction = 0;
  const sensitivity = getControlSensitivity();

  if (input.left || input.touchLeft) {
    direction -= 1;
  }

  if (input.right || input.touchRight) {
    direction += 1;
  }

  direction += input.gamepadX * sensitivity;

  if (input.swipeBoost !== 0) {
    direction += input.swipeBoost * sensitivity;
    input.swipeBoost *= 0.88;

    if (Math.abs(input.swipeBoost) < 0.05) {
      input.swipeBoost = 0;
    }
  }

  return Math.max(-1, Math.min(1, direction));
}

function isTouchMoveActive() {
  return input.touchLeft || input.touchRight || input.swipeBoost !== 0;
}

function checkPlatformCollisions(previousBottom) {
  const player = game.player;
  const playerBottom = player.y + player.height;
  const playerCenterX = player.x + player.width / 2;
  let landed = false;

  game.platforms.forEach((platform) => {
    if (landed || platform.touched) {
      return;
    }

    const withinX = playerCenterX >= platform.x - 8 && playerCenterX <= platform.x + platform.width + 8;
    const crossedTop = previousBottom <= platform.y && playerBottom >= platform.y;
    const closeEnough = playerBottom <= platform.y + platform.height + 18;

    if (withinX && crossedTop && closeEnough) {
      const isPadHit = platform.bouncePad && playerCenterX >= platform.x + platform.width / 2 - 18 && playerCenterX <= platform.x + platform.width / 2 + 18;
      const ramp = getModeRamp();
      player.y = platform.y - player.height;
      player.vy = isPadHit ? getBouncePadVelocityForRamp(ramp) : getJumpVelocityForRamp(ramp);
      game.platformStreak += 1;
      game.bestPlatformStreak = Math.max(game.bestPlatformStreak, game.platformStreak);
      platform.touched = platform.type === "touch";
      landed = true;
      burst(platform.x + platform.width / 2, platform.y, isPadHit ? "#ff5f6d" : "#35c2ff");
    }
  });
}

function collectCoins() {
  const player = game.player;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;

  game.platforms.forEach((platform) => {
    if (!platform.coin || platform.coinCollected) {
      return;
    }

    const coinX = platform.x + platform.width / 2;
    const coinY = platform.y - 24;
    const distance = Math.hypot(playerCenterX - coinX, playerCenterY - coinY);

    if (distance < 34) {
      platform.coinCollected = true;
      game.coinsCollected += 1;
      gainRunXp(1);
      burst(coinX, coinY, "#f5c542");
    }
  });
}

function collectPowerups() {
  const player = game.player;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;

  game.platforms.forEach((platform) => {
    if (!platform.powerup || platform.powerupCollected) {
      return;
    }

    const powerup = powerupById[platform.powerup];
    const powerupX = platform.x + platform.width / 2;
    const powerupY = platform.y - 48;
    const distance = Math.hypot(playerCenterX - powerupX, playerCenterY - powerupY);

    if (powerup && distance < 42) {
      platform.powerupCollected = true;
      game.powerupsCollected += 1;
      applyPowerup(powerup);
      burst(powerupX, powerupY, "#ffffff");
    }
  });
}

function useDoubleJump() {
  if (!game || !game.running || game.paused || game.countdownActive || game.effects.doubleJumpsRemaining <= 0) {
    return;
  }

  game.effects.doubleJumpsRemaining -= 1;
  game.player.vy = Math.min(game.player.vy, getJumpVelocityForRamp(Math.max(1, getModeRamp() * 0.92)));
  game.effects.message = "🪽 Double jump!";
  game.effects.messageUntil = game.runTime + 1.5;
  burst(game.player.x + game.player.width / 2, game.player.y + game.player.height, "#ffffff");
  updateHud();
  markAntiCheatCheckpoint();
}

function revivePlayer() {
  if (!game || game.effects.revivesRemaining <= 0) {
    return false;
  }

  game.effects.revivesRemaining -= 1;
  game.player.x = game.width / 2 - game.player.width / 2;
  game.player.y = game.cameraY + game.height * 0.42;
  game.player.vx = 0;
  game.player.vy = getJumpVelocityForRamp(Math.max(1, getModeRamp()));
  game.effects.message = "❤️ Revived!";
  game.effects.messageUntil = game.runTime + 2;
  burst(game.player.x + game.player.width / 2, game.player.y + game.player.height / 2, "#ff4a6d");
  updateHud();
  markAntiCheatCheckpoint();
  return true;
}

function gainRunXp(amount) {
  game.xpRun += Math.max(0, Math.round(amount * getXpMultiplier()));
}

function getXpMultiplier() {
  return game.effects.xpMultiplier || 1;
}

function applyPowerup(powerup) {
  if (powerup.effect === "grow") {
    growPlayer(powerup.sizeBonus || 6);
  }

  if (powerup.effect === "doubleXp") {
    game.effects.xpMultiplier = powerup.xpMultiplier || 2;
    game.effects.xpMultiplierUntil = game.runTime + (powerup.duration || 10);
  }

  if (powerup.effect === "boost") {
    game.player.vy = powerup.boostVelocity || -1220;
  }

  game.effects.message = `${powerup.emoji} ${powerup.message}`;
  game.effects.messageUntil = game.runTime + 2.4;
}

function growPlayer(sizeBonus) {
  const player = game.player;
  const oldCenterX = player.x + player.width / 2;
  const oldCenterY = player.y + player.height / 2;
  const nextSize = Math.min(player.maxSize, player.width + sizeBonus);

  player.width = nextSize;
  player.height = nextSize;
  player.x = oldCenterX - player.width / 2;
  player.y = oldCenterY - player.height / 2;
}

function updateActivePowerups() {
  if (game.effects.xpMultiplierUntil && game.runTime >= game.effects.xpMultiplierUntil) {
    game.effects.xpMultiplier = 1;
    game.effects.xpMultiplierUntil = 0;
  }
}

function updateCamera() {
  const player = game.player;
  const targetY = player.y - game.height * 0.42;

  if (targetY < game.cameraY) {
    game.cameraY = targetY;
  }

  if (player.y < game.highestPoint) {
    game.highestPoint = player.y;
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

  if (game.runTime >= game.nextBackgroundAdAt) {
    spawnBackgroundAd();
    game.nextBackgroundAdAt = game.runTime + BACKGROUND_AD_INTERVAL_SECONDS + (game.rng ? game.rng() : Math.random()) * 24;
  }

  game.backgroundAds = game.backgroundAds.filter((ad) => {
    const screenY = ad.y - game.cameraY;
    return screenY < game.height + ad.height + 80;
  });
}

function spawnBackgroundAd() {
  const readyAds = backgroundAdImages.filter((image) => image.complete && image.naturalWidth > 0);

  if (!readyAds.length) {
    return;
  }

  const random = game.rng || Math.random;
  const image = readyAds[Math.floor(random() * readyAds.length)];
  const maxWidth = Math.min(250, game.width * 0.46);
  const minWidth = Math.min(maxWidth, Math.max(130, game.width * 0.28));
  const width = minWidth + random() * Math.max(0, maxWidth - minWidth);
  const aspect = (image.naturalHeight || image.height || 1) / (image.naturalWidth || image.width || 1);
  const height = Math.max(58, Math.min(150, width * aspect));
  const margin = 18;
  const side = random() < 0.5 ? "left" : "right";
  const sideSpace = Math.max(0, game.width * 0.3 - margin);
  const x = side === "left"
    ? margin + random() * sideSpace
    : game.width - width - margin - random() * sideSpace;
  const y = game.cameraY + game.height * (0.24 + random() * 0.42);

  game.backgroundAds.push({
    image,
    x: Math.max(margin, Math.min(game.width - width - margin, x)),
    y,
    width,
    height,
    rotation: (random() * 2 - 1) * 0.045,
    alpha: 0.92
  });
}

function updateParticles(deltaSeconds) {
  game.particles.forEach((particle) => {
    particle.life -= deltaSeconds;
    particle.x += particle.vx * deltaSeconds;
    particle.y += particle.vy * deltaSeconds;
    particle.vy += 480 * deltaSeconds;
  });

  game.particles = game.particles.filter((particle) => particle.life > 0);
}

function burst(x, y, color) {
  if (!saveState.settings.particles) {
    return;
  }

  for (let index = 0; index < 8; index += 1) {
    game.particles.push({
      x,
      y,
      vx: Math.cos(index * 0.8) * (80 + Math.random() * 80),
      vy: Math.sin(index * 0.8) * (80 + Math.random() * 80),
      life: 0.32,
      color
    });
  }
}

function updateHud() {
  hudMode.textContent = game.modeLabel;
  hudScore.textContent = game.score;
  hudXp.textContent = game.xpRun;
  hudTimerWrap.classList.toggle("hidden", !game.timeLimit);

  if (game.timeLimit) {
    hudTimer.textContent = Math.ceil(game.timeRemaining);
  }

  updatePowerupHud();
  updateBoostHud();
}

function updateBoostHud() {
  if (!doubleJumpButton || !game) {
    return;
  }

  const charges = game.effects.doubleJumpsRemaining || 0;
  doubleJumpButton.textContent = `Double Jump x${charges}`;
  doubleJumpButton.disabled = charges <= 0 || game.paused || game.countdownActive;
  doubleJumpButton.classList.toggle("hidden", charges <= 0);
}

function updatePowerupHud() {
  const effect = game.effects;
  const xpActive = effect.xpMultiplier > 1 && effect.xpMultiplierUntil > game.runTime;
  const messageActive = effect.message && effect.messageUntil > game.runTime;

  if (!xpActive) {
    hudPowerup.classList.add("hidden");
    hudPowerup.textContent = "";
  } else {
    const seconds = Math.ceil(effect.xpMultiplierUntil - game.runTime);
    hudPowerup.textContent = `🍟 XP x${effect.xpMultiplier} ${seconds}s`;
    hudPowerup.classList.remove("hidden");
  }

  if (!messageActive) {
    hudPowerupMessage.classList.add("hidden");
    hudPowerupMessage.textContent = "";
  } else {
    hudPowerupMessage.textContent = effect.message;
    hudPowerupMessage.classList.remove("hidden");
  }
}

function endGame(reason = "fell") {
  if (!game || !game.running) {
    return;
  }

  if (reason === "fell" && revivePlayer()) {
    return;
  }

  if (game.onlineDuel) {
    handleLocalMultiplayerDeath(reason);
    return;
  }

  game.running = false;
  game.paused = false;
  stopAdminLiveRouting();
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
  if (doubleJumpButton) {
    doubleJumpButton.classList.add("hidden");
  }
  gameOverOverlay.classList.remove("hidden");
  autoSubmitLeaderboardScore();
}

function drawGame() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawBackground();
  drawBackgroundAds();
  drawPlatforms();
  drawParticles();
  drawOpponentGhost();
  drawPlayer();
}

function drawBackground() {
  const settings = saveState.settings || DEFAULT_SETTINGS;
  const theme = THEMES[settings.theme] || THEMES.red;

  if (settings.backgroundImage && customBackgroundReady) {
    drawCoverImage(customBackgroundImage, 0, 0, game.width, game.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    for (let y = -((game.cameraY * 0.18) % 90); y < game.height; y += 90) {
      ctx.fillRect(0, y, game.width, 2);
    }
    return;
  }

  ctx.fillStyle = theme.canvasBg;
  ctx.fillRect(0, 0, game.width, game.height);

  const centerX = game.width / 2;
  const centerY = game.height * 0.52;
  const radius = Math.max(game.width, game.height) * 1.35;

  ctx.save();
  ctx.translate(centerX, centerY);
  for (let index = 0; index < 28; index += 1) {
    ctx.rotate((Math.PI * 2) / 28);
    ctx.fillStyle = index % 2 === 0 ? theme.canvasRayLight : theme.canvasRayDark;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, -radius * 0.07);
    ctx.lineTo(radius, radius * 0.07);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = theme.canvasLine;
  for (let y = -((game.cameraY * 0.25) % 80); y < game.height; y += 80) {
    ctx.fillRect(0, y, game.width, 2);
  }
}

function drawCoverImage(image, x, y, width, height) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;

  if (!imageWidth || !imageHeight) {
    return;
  }

  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawBackgroundAds() {
  if (!game.backgroundAds || !game.backgroundAds.length) {
    return;
  }

  game.backgroundAds.forEach((ad) => {
    const screenY = ad.y - game.cameraY;

    if (screenY < -ad.height - 80 || screenY > game.height + ad.height + 80) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = ad.alpha;
    ctx.translate(ad.x + ad.width / 2, screenY + ad.height / 2);
    ctx.rotate(ad.rotation);
    ctx.fillStyle = "rgba(6, 27, 66, 0.26)";
    roundRect(-ad.width / 2 + 5, -ad.height / 2 + 8, ad.width, ad.height, 12);
    ctx.fill();
    ctx.drawImage(ad.image, -ad.width / 2, -ad.height / 2, ad.width, ad.height);
    ctx.restore();
  });
}

function drawPlatforms() {
  game.platforms.forEach((platform) => {
    if (platform.touched) {
      return;
    }

    const screenY = platform.y - game.cameraY;

    if (screenY < -60 || screenY > game.height + 60) {
      return;
    }

    ctx.fillStyle = "rgba(86, 139, 25, 0.32)";
    roundRect(platform.x + 3, screenY + 7, platform.width, platform.height, 8);
    ctx.fill();

    ctx.fillStyle = getPlatformColor(platform.type);
    roundRect(platform.x, screenY, platform.width, platform.height, 7);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.stroke();

    if (platform.type === "moving") {
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px 'Arial Black', 'Trebuchet MS', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("↔", platform.x + platform.width / 2, screenY + platform.height / 2 + 1);
    }

    if (platform.type === "touch") {
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px 'Arial Black', 'Trebuchet MS', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("1", platform.x + platform.width / 2, screenY + platform.height / 2 + 1);
    }

    if (platform.bouncePad) {
      ctx.fillStyle = "#ff5f6d";
      roundRect(platform.x + platform.width / 2 - 14, screenY - 13, 28, 18, 8);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (platform.coin && !platform.coinCollected) {
      ctx.fillStyle = "#f5c542";
      ctx.beginPath();
      ctx.arc(platform.x + platform.width / 2, screenY - 24, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#3d2700";
      ctx.fillRect(platform.x + platform.width / 2 - 2, screenY - 30, 4, 12);
    }

    if (platform.powerup && !platform.powerupCollected) {
      drawPowerup(platform, screenY);
    }
  });
}

function getPlatformColor(type) {
  if (type === "small") {
    return "#9be23f";
  }

  if (type === "large") {
    return "#f5ce90";
  }

  if (type === "moving") {
    return "#5bc8ff";
  }

  if (type === "touch") {
    return "#ffb637";
  }

  return "#fff1c9";
}

function drawPowerup(platform, screenY) {
  const powerup = powerupById[platform.powerup];

  if (!powerup) {
    return;
  }

  const x = platform.x + platform.width / 2;
  const y = screenY - 48;

  ctx.fillStyle = "rgba(86, 139, 25, 0.28)";
  ctx.beginPath();
  ctx.arc(x + 2, y + 5, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff1c9";
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = "24px 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(powerup.emoji, x, y + 1);
}

function drawPlayer() {
  const player = game.player;
  const character = getCharacter(saveState.equippedCharacter);
  const image = characterImages[character.id];
  const x = player.x + player.width / 2;
  const y = player.y - game.cameraY + player.height / 2;

  if (image && image.complete && image.naturalWidth > 0) {
    ctx.fillStyle = "rgba(86, 139, 25, 0.26)";
    ctx.beginPath();
    ctx.arc(x + 3, y + 7, player.width * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, player.width * 0.54, 0, Math.PI * 2);
    ctx.stroke();
    ctx.drawImage(image, player.x, player.y - game.cameraY, player.width, player.height);
    return;
  }

  ctx.fillStyle = character.ring;
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = character.fill;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = character.face;
  ctx.beginPath();
  ctx.arc(x - 7, y - 4, 3, 0, Math.PI * 2);
  ctx.arc(x + 7, y - 4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = character.face;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y + 3, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function drawOpponentGhost() {
  if (!game.onlineDuel || !multiplayer.opponent || Date.now() - multiplayer.opponent.updatedAt > MULTIPLAYER_GHOST_STALE_MS) {
    return;
  }

  const opponent = multiplayer.opponent;
  const character = getCharacter(opponent.characterId);
  const image = characterImages[character.id];
  const size = opponent.size || 48;
  const targetX = opponent.xRatio * game.width;

  // Interpolate X position smoothly between ticks too.
  if (!opponent.renderX) {
    opponent.renderX = targetX;
  } else {
    opponent.renderX += (targetX - opponent.renderX) * 0.3;
  }
  const centerX = opponent.renderX;

  // cameraOffset = player.y - cameraY on the SENDER's screen = their screen-space Y.
  // Rendering it directly as screenY means the ghost appears at the same vertical
  // position on our screen as the opponent occupies on theirs — correct for a seeded
  // game where both players share the same platform layout.
  // Interpolate toward the latest received position for smoothness between ticks.
  const targetScreenY = Number.isFinite(opponent.cameraOffset)
    ? opponent.cameraOffset
    : (game.startY + opponent.yOffset) - game.cameraY;

  // Smoothly lerp the rendered position toward the network target each frame.
  if (!opponent.renderY || Math.abs(opponent.renderY - targetScreenY) > game.height) {
    // Snap on first draw or large discontinuity (respawn/teleport).
    opponent.renderY = targetScreenY;
  } else {
    opponent.renderY += (targetScreenY - opponent.renderY) * 0.3;
  }

  const screenY = opponent.renderY;
  const drawX = centerX - size / 2;

  if (screenY < -120 || screenY > game.height + 120) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = 0.52;

  if (image && image.complete && image.naturalWidth > 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
    ctx.beginPath();
    ctx.arc(centerX, screenY + size / 2, size * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(image, drawX, screenY, size, size);
  } else {
    ctx.fillStyle = character.ring;
    ctx.beginPath();
    ctx.arc(centerX, screenY + size / 2, size * 0.54, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = character.fill;
    ctx.beginPath();
    ctx.arc(centerX, screenY + size / 2, size * 0.44, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(245, 206, 144, 0.94)";
  roundRect(centerX - 62, screenY - 30, 124, 24, 12);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#8d642f";
  ctx.font = "11px 'Arial Black', 'Trebuchet MS', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${opponent.name} ${opponent.score}`, centerX, screenY - 18);
  ctx.restore();
}

function drawParticles() {
  game.particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life / 0.32);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x - 3, particle.y - game.cameraY - 3, 6, 6);
  });
  ctx.globalAlpha = 1;
}

function roundRect(x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function handleKeyboardInput(event, isPressed) {
  if (event.target && (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")) {
    return;
  }

  if (event.key === "Escape" && !leaderboardToast.classList.contains("hidden")) {
    hideLeaderboardToast();
    event.preventDefault();
    return;
  }

  if ((event.key === "p" || event.key === "P") && isPressed && !event.repeat) {
    togglePause();
    event.preventDefault();
    return;
  }

  if ((event.key === " " || event.key === "Spacebar") && isPressed && !event.repeat) {
    useDoubleJump();
    event.preventDefault();
    return;
  }

  if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") {
    if (game && game.paused) {
      event.preventDefault();
      return;
    }

    input.left = isPressed;
    event.preventDefault();
  }

  if (event.key === "d" || event.key === "D" || event.key === "ArrowRight") {
    if (game && game.paused) {
      event.preventDefault();
      return;
    }

    input.right = isPressed;
    event.preventDefault();
  }
}

function handleTouchInput(event) {
  if (!gameScreen.classList.contains("active")) {
    return;
  }

  setTouchDirection(event.touches);
  event.preventDefault();
}

function shouldIgnoreGameTouch(event) {
  return Boolean(event.target.closest("button, label, input"));
}

function setTouchDirection(touches) {
  input.touchLeft = false;
  input.touchRight = false;

  const rect = gameFrame.getBoundingClientRect();
  const midpoint = rect.left + rect.width / 2;

  Array.from(touches).forEach((touch) => {
    if (touch.clientX < midpoint) {
      input.touchLeft = true;
    } else {
      input.touchRight = true;
    }
  });
}

let swipeStartX = 0;
let swipeStartY = 0;

function handleSwipeInput(event) {
  if (!gameScreen.classList.contains("active")) {
    return;
  }

  const touch = event.changedTouches[0];
  const dx = touch.clientX - swipeStartX;
  const dy = touch.clientY - swipeStartY;

  if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2) {
    const direction = dx > 0 ? 1 : -1;
    input.swipeBoost = direction * 1.35;

    if (game && game.running && !game.countdownActive) {
      const impulse = Math.min(280, 130 + Math.abs(dx) * 2.1) * getControlSensitivity();
      game.player.vx += direction * impulse;
    }
  }
}

function handleGamepadInput() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  let connected = false;
  let axisX = 0;

  for (const pad of gamepads) {
    if (!pad) {
      continue;
    }

    connected = true;
    const stickX = Math.abs(pad.axes[0] || 0) > 0.18 ? pad.axes[0] : 0;
    const dpadLeft = pad.buttons[14] && pad.buttons[14].pressed;
    const dpadRight = pad.buttons[15] && pad.buttons[15].pressed;
    axisX = stickX;

    if (dpadLeft) {
      axisX = -1;
    }

    if (dpadRight) {
      axisX = 1;
    }

    break;
  }

  input.gamepadX = axisX;
  gamepadStatus.classList.toggle("visible", connected && saveState.settings.showGamepadStatus);
}

window.addEventListener("keydown", (event) => handleKeyboardInput(event, true));
window.addEventListener("keyup", (event) => handleKeyboardInput(event, false));

gameFrame.addEventListener("touchstart", (event) => {
  if (shouldIgnoreGameTouch(event)) {
    return;
  }

  if (event.changedTouches.length > 0) {
    swipeStartX = event.changedTouches[0].clientX;
    swipeStartY = event.changedTouches[0].clientY;
  }
  handleTouchInput(event);
}, { passive: false });

gameFrame.addEventListener("touchmove", (event) => {
  if (shouldIgnoreGameTouch(event)) {
    return;
  }

  handleTouchInput(event);
}, { passive: false });
gameFrame.addEventListener("touchend", (event) => {
  if (shouldIgnoreGameTouch(event)) {
    return;
  }

  handleSwipeInput(event);
  setTouchDirection(event.touches);
  event.preventDefault();
}, { passive: false });

gameFrame.addEventListener("touchcancel", () => {
  input.touchLeft = false;
  input.touchRight = false;
});

window.addEventListener("gamepadconnected", () => {
  if (saveState.settings.showGamepadStatus) {
    gamepadStatus.classList.add("visible");
  }
});

window.addEventListener("gamepaddisconnected", () => {
  input.gamepadX = 0;
  gamepadStatus.classList.remove("visible");
});

window.addEventListener("resize", () => {
  resizeCanvas();
});

window.addEventListener("online", () => {
  schedulePendingLeaderboardRetry(500);
});

window.addEventListener("beforeunload", () => {
  stopAdminLiveRouting();
  leaveMultiplayerRoom(true);
});

if (MULTIPLAYER_LOCKED) {
  multiplayerButton.disabled = true;
  multiplayerButton.setAttribute("aria-disabled", "true");
}

playButton.addEventListener("click", () => startGame("classic"));
gameModesButton.addEventListener("click", showGameModes);
multiplayerButton.addEventListener("click", showMultiplayer);
createRoomButton.addEventListener("click", createMultiplayerRoom);
joinRoomButton.addEventListener("click", joinMultiplayerRoomFromInput);
copyRoomCodeButton.addEventListener("click", copyMultiplayerRoomCode);
multiplayerReadyButton.addEventListener("click", toggleMultiplayerReady);
multiplayerLeaveButton.addEventListener("click", () => {
  leaveMultiplayerRoom(true);
  renderMultiplayerScreen();
});
storeButton.addEventListener("click", () => showStore());
if (buyBoostsButton) {
  buyBoostsButton.addEventListener("click", showBoostStore);
}
if (storeBoostsShortcutButton) {
  storeBoostsShortcutButton.addEventListener("click", () => {
    activeStoreSection = BOOST_STORE_SECTION;
    renderStore();
  });
}
characterButton.addEventListener("click", showCharacterSelect);
controlsButton.addEventListener("click", showControls);
storeBackButton.addEventListener("click", showMenu);
characterBackButton.addEventListener("click", showMenu);
controlsBackButton.addEventListener("click", showMenu);
multiplayerBackButton.addEventListener("click", () => {
  leaveMultiplayerRoom(true);
  showMenu();
});
modeBackButton.addEventListener("click", showMenu);
restartButton.addEventListener("click", () => {
  if (game && game.onlineDuel) {
    resetMultiplayerLobby(true);
    return;
  }

  startGame(game ? game.mode : "classic");
});
mainMenuButton.addEventListener("click", () => {
  if (game && game.onlineDuel) {
    leaveMultiplayerRoom(true);
  }

  showMenu();
});
pauseResumeButton.addEventListener("click", () => setPaused(false));
pauseEndButton.addEventListener("click", () => endGame("paused"));
if (doubleJumpButton) {
  doubleJumpButton.addEventListener("click", useDoubleJump);
}
redeemButton.addEventListener("click", redeemCode);
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
submitScoreButton.addEventListener("click", () => submitLeaderboardScore());
particlesToggle.addEventListener("change", () => setParticlesEnabled(particlesToggle.checked));
gamepadBadgeToggle.addEventListener("change", () => setGamepadBadgeEnabled(gamepadBadgeToggle.checked));
sensitivitySlider.addEventListener("input", () => setSensitivity(sensitivitySlider.value));
settingsLeaderboardNameButton.addEventListener("click", updateSettingsLeaderboardName);
settingsLeaderboardNameInput.addEventListener("input", () => {
  const cleaned = sanitizeLeaderboardName(settingsLeaderboardNameInput.value);

  if (settingsLeaderboardNameInput.value !== cleaned) {
    settingsLeaderboardNameInput.value = cleaned;
  }
});
authNameInput.addEventListener("input", () => {
  const cleaned = sanitizeLeaderboardName(authNameInput.value);

  if (authNameInput.value !== cleaned) {
    authNameInput.value = cleaned;
  }
});
settingsLeaderboardNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    updateSettingsLeaderboardName();
  }
});
authOpenButton.addEventListener("click", showAuthOverlay);
authCloseButton.addEventListener("click", hideAuthOverlay);
authOverlay.addEventListener("click", (event) => {
  if (event.target === authOverlay) {
    hideAuthOverlay();
  }
});
authForm.addEventListener("submit", (event) => {
  event.preventDefault();
});
authSignInButton.addEventListener("click", signInAccount);
authSignUpButton.addEventListener("click", signUpAccount);
authSignOutButton.addEventListener("click", signOutAccount);
authPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    signInAccount();
  }
});
authNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    signUpAccount();
  }
});
backgroundUploadInput.addEventListener("change", () => {
  setCustomBackgroundFromFile(backgroundUploadInput.files[0]).finally(() => {
    backgroundUploadInput.value = "";
  });
});
clearBackgroundButton.addEventListener("click", clearCustomBackground);
redeemInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    redeemCode();
  }
});
joinRoomInput.addEventListener("input", () => {
  const cleaned = sanitizeRoomCode(joinRoomInput.value);

  if (joinRoomInput.value !== cleaned) {
    joinRoomInput.value = cleaned;
  }
});
joinRoomInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    joinMultiplayerRoomFromInput();
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

loadCharacterImages();
loadBackgroundAdImages();
loadData();
initAuth();
if (!leaderboardClient && window.BounceEJSupabaseReady) {
  window.BounceEJSupabaseReady.then(() => {
    if (refreshLeaderboardClient()) {
      initAuth();
      updateAuthUi();
      loadLeaderboard();
    }
  });
}
showMenu();

// ============================================
// MULTIPLAYER LEADERBOARD
// ============================================

function updateLeaderboardTabDisplay() {
  const isMultiplayer = leaderboardType === "multiplayer";
  if (leaderboardTitle) {
    leaderboardTitle.textContent = isMultiplayer ? "Multiplayer Rankings" : "Leaderboard";
  }
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
    const character = getCharacterId(entry.character_id)
      ? CHARACTERS.find((c) => c.id === entry.character_id) || CHARACTERS[0]
      : CHARACTERS[0];

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



})();
