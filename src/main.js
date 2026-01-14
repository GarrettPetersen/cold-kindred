// --- Haptics Helper (Safe for web) ---
let triggerHaptic = () => { };
// Only attempt to load haptics if we are in a Capacitor native environment
if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() !== 'web') {
  // Use a template string to keep bundlers from eagerly resolving it on web
  const pluginName = '@capacitor/haptics';
  import(pluginName).then(m => {
    triggerHaptic = () => m.Haptics.impact({ style: m.ImpactStyle.Heavy });
  }).catch(() => {
    // Silently ignore if plugin fails to load
  });
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set initial size immediately
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const FIELD_WIDTH = 2500;
const FIELD_HEIGHT = 2500;
const FRAME_SIZE = 32;
const CURRENT_YEAR = 2025;

// --- Seeded Random ---
const IS_NATIVE = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() !== 'web';
const MAX_CASES_PER_DAY = IS_NATIVE ? 3 : 1;

function getDailySeed(caseIdx = 0) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const seedStr = dateStr + "-" + caseIdx;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return { seed: Math.abs(hash), dateStr, caseIdx };
}

let { seed, dateStr: currentDateStr, caseIdx: currentCaseIdx } = getDailySeed(0);
let rngState = seed;
function random() {
  rngState = (rngState * 1664525 + 1013904223) % 4294967296;
  return rngState / 4294967296;
}
function pick(arr) { return arr[Math.floor(random() * arr.length)]; }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Helpers ---
function formatTime(ms) {
  if (!ms && ms !== 0) return "00:00.0";
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const decs = Math.floor((ms % 1000) / 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${decs}`;
}

function getHSL(r) {
  if (!r || !r.tint) return '#fff';
  return `hsl(${r.tint.hue}, ${r.tint.saturate}%, ${r.tint.brightness}%)`;
}

// --- Names ---
const MALE_NAMES = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Alexander', 'Raymond', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Nathan', 'Henry', 'Zachary', 'Douglas', 'Peter', 'Kyle', 'Noah', 'Ethan', 'Jeremy', 'Walter', 'Christian', 'Keith', 'Roger', 'Terry', 'Austin', 'Sean', 'Gerald', 'Carl', 'Harold', 'Dylan', 'Arthur', 'Lawrence', 'Jordan', 'Jesse', 'Bryan', 'Billy', 'Bruce', 'Gabriel', 'Logan', 'Alan', 'Juan', 'Roy', 'Ralph', 'Randy', 'Eugene', 'Vincent', 'Bobby', 'Russell', 'Louis', 'Philip', 'Johnny', 'Miguel', 'Caleb', 'Lucas', 'Alfred', 'Bradley', 'Oliver', 'Liam', 'Mason', 'Elias', 'Hudson', 'Hunter', 'Asher', 'Silas', 'Leo', 'Finn', 'Arlo', 'Milo', 'Felix', 'Jasper', 'Oscar', 'Theo', 'Hugo', 'Otto', 'Barnaby', 'Bartholomew', 'Benedict', 'Bram', 'Casper', 'Clement', 'Cyril', 'Dexter', 'Edmund', 'Ernest', 'Atticus', 'Augustus', 'Basil', 'Bear', 'Beau', 'Beckett', 'Bennett', 'Brooks', 'Caspian', 'Cato', 'Cedric', 'Chester', 'Conrad', 'Darwin', 'Dash', 'Dorian', 'Elio', 'Emmett', 'Enzo', 'Evander', 'Ezra', 'Flynn', 'Gideon', 'Gulliver', 'Hamish', 'Harvey', 'Ilo', 'Indigo', 'Jude', 'Julian', 'Kit', 'Knox', 'Lachlan', 'Leander', 'Linus', 'Lucian', 'Magnus', 'Malachi', 'Monty', 'Nico', 'Orion', 'Otis', 'Pascal', 'Phineas', 'Quill', 'Rafe', 'Remy', 'Rory', 'Rufus', 'Sacha', 'Sebastian', 'Stellan', 'Sylvan', 'Teddy', 'Tobias', 'Wilder', 'Xander', 'Zane', 'Ziggy'];
const FEMALE_NAMES = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia', 'Kathleen', 'Amy', 'Shirley', 'Angela', 'Helen', 'Anna', 'Brenda', 'Pamela', 'Nicole', 'Emma', 'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Catherine', 'Carolyn', 'Janet', 'Ruth', 'Maria', 'Heather', 'Diane', 'Virginia', 'Julie', 'Joyce', 'Victoria', 'Olivia', 'Kelly', 'Christina', 'Lauren', 'Joan', 'Evelyn', 'Judith', 'Megan', 'Andrea', 'Cheryl', 'Hannah', 'Jacqueline', 'Martha', 'Gloria', 'Teresa', 'Ann', 'Sara', 'Madison', 'Frances', 'Kathryn', 'Jean', 'Abigail', 'Alice', 'Julia', 'Judy', 'Sophia', 'Grace', 'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle', 'Beverly', 'Isabella', 'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Rose', 'Alexis', 'Kayla', 'Lori', 'Faith', 'Luna', 'Willow', 'Hazel', 'Ivy', 'Violet', 'Aurora', 'Iris', 'Juniper', 'Flora', 'Clementine', 'Beatrix', 'Clara', 'Eloise', 'Genevieve', 'Matilda', 'Penelope', 'Rosemary', 'Tabitha', 'Winifred', 'Zelda', 'Ada', 'Beatrice', 'Cora', 'Daphne', 'Edith', 'Florence', 'Greta', 'Hattie', 'Imogen', 'Lottie', 'Aisling', 'Alya', 'Amelie', 'Anouk', 'Ariadne', 'Aurelia', 'Calliope', 'Cecily', 'Cleo', 'Cosima', 'Delphine', 'Elowen', 'Elspeth', 'Esmé', 'Eulalie', 'Faye', 'Freya', 'Gaia', 'Ines', 'Ione', 'Isadora', 'Juno', 'Kaia', 'Lark', 'Lyra', 'Maeve', 'Maia', 'Margot', 'Marlowe', 'Mina', 'Mira', 'Nell', 'Niamh', 'Odette', 'Ophelia', 'Orla', 'Ottilie', 'Paloma', 'Pearl', 'Petra', 'Phoebe', 'Pixie', 'Poppy', 'Primrose', 'Ramona', 'Rhea', 'Romilly', 'Saffron', 'Saskia', 'Seraphina', 'Tallulah', 'Thea', 'Veda', 'Willa', 'Xanthe', 'Yara', 'Zinnia', 'Zora', 'Zosia', 'Zuzanna'];

// --- Asset loading ---
const SPECIES = ['Hare', 'Boar', 'Deer', 'Fox', 'Grouse'];

const TRANSITION_LINES = {
  fox: [
    "One mystery down, another waiting in the rain. A detective's work is never done.",
    "The city never sleeps, and neither do the killers. Let's see what's next on the docket.",
    "Another case, another dollar. Let's hope this one has a cleaner ending.",
    "My coffee's cold and my hat's wet, but the trail is still warm.",
    "The shadows are getting longer. Better wrap this up before the sun goes down."
  ],
  hare: [
    "The game is afoot! There is no time to waste on trivialities.",
    "One must always be prepared for the next intellectual challenge.",
    "The facts are out there, waiting to be woven into a tapestry of truth.",
    "My mind rebels at stagnation. Give me problems, give me work!",
    "It is a capital mistake to theorize before one has data. Onward to the next scene."
  ],
  boarot: [
    "Ah, the little gray cells... they are hungry for more exercise!",
    "Order and method, mon ami. We shall approach this next mystery with both.",
    "One solved, yet the world is still full of disorder. We must correct this.",
    "Precision is the key. Let us not rush, but let us not linger either.",
    "A busy day, yes, but for the mind of Hercule Boarot, it is merely a warm-up."
  ],
  marmot: [
    "It's surprising how much one can learn just by watching the neighbors.",
    "A busy day in the village! So many secrets waiting to be uncovered.",
    "One always finds that one thing leads quite naturally to another.",
    "The knitting will have to wait. There's a much more interesting puzzle to solve.",
    "Dear me, another mystery? Well, I suppose someone has to set things right."
  ]
};
const sprites = {};
const grassSprites = [];
const detectiveSprites = {
  fox: new Image(),
  hare: new Image(),
  boarot: new Image(),
  marmot: new Image(),
  fox_celebration: new Image(),
  hare_celebration: new Image(),
  boarot_celebration: new Image(),
  marmot_celebration: new Image(),
  fox_lab: new Image(),
  hare_lab: new Image(),
  boarot_lab: new Image(),
  marmot_lab: new Image(),
  dna_test: new Image(),
  police_badge: new Image()
};

let assetsLoaded = 0;
const TOTAL_ASSETS = SPECIES.length * 4 + 6 + 14;

function onAssetLoad() {
  assetsLoaded++;

  // Show loading progress on canvas
  ctx.fillStyle = '#151515';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`LOADING CASE FILES: ${Math.round((assetsLoaded / TOTAL_ASSETS) * 100)}%`, canvas.width / 2, canvas.height / 2);

  if (assetsLoaded === TOTAL_ASSETS) {
    init();
  }
}

// Grass sprites
for (let i = 1; i <= 6; i++) {
  const img = new Image();
  img.onload = onAssetLoad;
  img.onerror = onAssetLoad;
  img.src = `/assets/environment/5 Grass/${i}.png`;
  grassSprites.push(img);
}

// Detective sprites
['fox', 'hare', 'boarot', 'marmot', 'fox_celebration', 'hare_celebration', 'boarot_celebration', 'marmot_celebration', 'fox_lab', 'hare_lab', 'boarot_lab', 'marmot_lab', 'dna_test', 'police_badge'].forEach(key => {
  detectiveSprites[key].onload = onAssetLoad;
  detectiveSprites[key].onerror = onAssetLoad;
});

detectiveSprites.fox.src = '/assets/detectives/film_noir_fox.png';
detectiveSprites.hare.src = '/assets/detectives/sherlock_hare.png';
detectiveSprites.boarot.src = '/assets/detectives/hercule_boarot.png';
detectiveSprites.marmot.src = '/assets/detectives/miss_marmot.png';
detectiveSprites.fox_celebration.src = '/assets/detectives/film_noir_fox_celebration.png';
detectiveSprites.hare_celebration.src = '/assets/detectives/sherlock_hare_celebration.png';
detectiveSprites.boarot_celebration.src = '/assets/detectives/hercule_boarot_celebration.png';
detectiveSprites.marmot_celebration.src = '/assets/detectives/miss_marmot_celebration.png';
detectiveSprites.fox_lab.src = '/assets/detectives/film_noir_fox_lab.png';
detectiveSprites.hare_lab.src = '/assets/detectives/sherlock_hare_lab.png';
detectiveSprites.boarot_lab.src = '/assets/detectives/hercule_boarot_lab.png';
detectiveSprites.marmot_lab.src = '/assets/detectives/miss_marmot_lab.png';
detectiveSprites.dna_test.src = '/assets/animations/dna_test.png';
detectiveSprites.police_badge.src = '/assets/items/police_badge.png';

SPECIES.forEach(s => {
  sprites[s] = { idle: new Image(), walk: new Image(), run: new Image(), death: new Image() };

  const walkFile = s === 'Fox' ? 'Fox_walk_with_shadow.png' : `${s}_Walk_with_shadow.png`;
  const runFile = s === 'Grouse' ? 'Grouse_Flight_with_shadow.png' : `${s}_Run_with_shadow.png`;

  ['idle', 'walk', 'run', 'death'].forEach(type => {
    sprites[s][type].onload = onAssetLoad;
    sprites[s][type].onerror = onAssetLoad;
  });

  sprites[s].idle.src = `/assets/${s}/${s}_Idle_with_shadow.png`;
  sprites[s].walk.src = `/assets/${s}/${walkFile}`;
  sprites[s].run.src = `/assets/${s}/${runFile}`;
  sprites[s].death.src = `/assets/${s}/${s}_Death_with_shadow.png`;
});

// --- Ranks ---
const RANKS = [
  { title: 'RECRUIT', minWins: 0, hue: 0, sat: 0, bri: 0 },          // No badge
  { title: 'ROOKIE', minWins: 1, hue: 30, sat: 50, bri: 60 },        // Bronze
  { title: 'OFFICER', minWins: 5, hue: 0, sat: 0, bri: 90 },        // Silver
  { title: 'DETECTIVE', minWins: 15, hue: 50, sat: 100, bri: 100 },  // Gold
  { title: 'SERGEANT', minWins: 30, hue: 190, sat: 30, bri: 150 },   // Platinum
  { title: 'LIEUTENANT', minWins: 60, hue: 0, sat: 100, bri: 80 },   // Ruby
  { title: 'CAPTAIN', minWins: 125, hue: 120, sat: 100, bri: 80 },   // Emerald
  { title: 'COMMANDER', minWins: 250, hue: 190, sat: 100, bri: 120 }, // Diamond
  { title: 'COMMISSIONER', minWins: 500, hue: 280, sat: 100, bri: 70 } // Onyx
];

function getRank(wins) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (wins >= RANKS[i].minWins) return { ...RANKS[i], index: i };
  }
  return { ...RANKS[0], index: 0 };
}

const badgeCache = new Map();
function getBadgeSprite(rankIndex) {
  if (rankIndex === 0) return null; // Recruit has no badge
  if (badgeCache.has(rankIndex)) return badgeCache.get(rankIndex);

  const base = detectiveSprites.police_badge;
  if (!base || !base.complete) return null;

  const r = RANKS[rankIndex];
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const bCtx = canvas.getContext('2d');
  bCtx.imageSmoothingEnabled = false;
  bCtx.filter = `hue-rotate(${r.hue}deg) saturate(${r.sat}%) brightness(${r.bri}%)`;
  bCtx.drawImage(base, 0, 0);

  badgeCache.set(rankIndex, canvas);
  return canvas;
}
const rabbits = [];
let nextRabbitId = 1;
let playerConnections = [];
let selectedHare = null;
let killerId = null;
let victim = { name: '', species: '', sex: '', tint: null };
let dnaTestsRemaining = 3;
let highlightedAnimalIds = new Set(); // Animals to highlight with glow effect
const notifications = [];
let necessaryConnections = [];
let cluePool = [];
let activeClues = new Map();
let lastClueTime = 0;
let lastDateCheckTime = 0;
const DATE_CHECK_INTERVAL = 3600; // Check for date change every ~1 minute (60 * 60 frames)
const CLUE_INTERVAL = 120;
const hares = [];
let xButtons = []; // Shared list of relationship-removal buttons
let hoveredBubbleId = null;
let hoveredXButton = null;
const envDetails = [];
let clueQueue = [];
let globallyIssuedClueIds = new Set();
let caseLog = []; // Stores strings like "Name: Clue text"
let staticCanvas = null;
const pixelCanvas = document.createElement('canvas');
pixelCanvas.width = 64;
pixelCanvas.height = 64;
const pCtx = pixelCanvas.getContext('2d');

function renderStaticLayer() {
  if (!staticCanvas) {
    staticCanvas = document.createElement('canvas');
    staticCanvas.width = FIELD_WIDTH;
    staticCanvas.height = FIELD_HEIGHT;
  }
  const sCtx = staticCanvas.getContext('2d');
  sCtx.imageSmoothingEnabled = false;
  sCtx.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

  // Draw world grid
  sCtx.strokeStyle = 'rgba(255,255,255,0.05)';
  sCtx.lineWidth = 1;
  for (let x = 0; x <= FIELD_WIDTH; x += 100) {
    sCtx.beginPath(); sCtx.moveTo(x, 0); sCtx.lineTo(x, FIELD_HEIGHT); sCtx.stroke();
  }
  for (let y = 0; y <= FIELD_HEIGHT; y += 100) {
    sCtx.beginPath(); sCtx.moveTo(0, y); sCtx.lineTo(FIELD_WIDTH, y); sCtx.stroke();
  }

  // Draw walkable area boundary
  sCtx.strokeStyle = 'rgba(255,255,255,0.2)';
  sCtx.lineWidth = 4;
  sCtx.strokeRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

  // Draw grass sprites
  envDetails.forEach(d => {
    const img = grassSprites[d.spriteIndex];
    if (!img || !img.complete) return;
    const sw = img.width, sh = img.height;
    const szW = sw * d.scale, szH = sh * d.scale;
    sCtx.drawImage(img, Math.floor(d.x), Math.floor(d.y), Math.floor(szW), Math.floor(szH));
  });
}

let gameState = {
  isFinished: false,
  wasSuccess: false,
  startTime: null,
  endTime: null,
  detective: null,
  introFinished: false,
  hasClickedClue: false,
  hasCreatedConnection: false,
  hint1Shown: false,
  hint2Shown: false,
  isMidGameChange: false,
  statsUpdated: false,
  caseIndex: 0
};

let portraitAnim = {
  active: false,
  timer: 0,
  frames: 16,
  fps: 12
};

function drawPortrait() {
  const pCanvas = document.getElementById('portraitCanvas');
  if (!pCanvas) return;
  const pCtx = pCanvas.getContext('2d');
  pCtx.imageSmoothingEnabled = false;
  const det = gameState.detective;
  if (!det || det === "null") {
    document.getElementById('portrait-box').style.display = 'none';
    return;
  }

  document.getElementById('portrait-box').style.display = 'block';

  // Use celebration sprite if the case is solved successfully
  const isWin = gameState.isFinished && gameState.wasSuccess;
  const spr = isWin ? detectiveSprites[det + '_celebration'] : detectiveSprites[det];

  if (!spr || !spr.complete) return;

  pCtx.clearRect(0, 0, 128, 128);

  let frame = 0;
  if (portraitAnim.active) {
    portraitAnim.timer += 0.2; // roughly 12fps if loop is 60fps
    frame = Math.floor(portraitAnim.timer);
    if (frame >= portraitAnim.frames) {
      portraitAnim.active = false;
      portraitAnim.timer = 0;
      // If we're celebrating, stay on the last frame
      frame = isWin ? portraitAnim.frames - 1 : 0;
    }
  } else if (isWin) {
    // Hold the last frame of celebration when the game is won
    frame = portraitAnim.frames - 1;
  }

  const sx = (frame % 4) * 64;
  const sy = Math.floor(frame / 4) * 64;
  pCtx.drawImage(spr, sx, sy, 64, 64, 0, 0, 128, 128);
}

function drawRankProgress(ctx, centerX, y, wins, forceRank = null) {
  const rank = forceRank || getRank(wins);
  const nextRank = (rank.index < RANKS.length - 1) ? RANKS[rank.index + 1] : null;
  if (!nextRank) return 0;

  const totalNeeded = nextRank.minWins - rank.minWins;
  const currentInTier = wins - rank.minWins;

  // Dynamically adjust scale based on density
  let boxSize = 8;
  let gap = 4;
  let cols = 10;

  if (totalNeeded > 100) {
    boxSize = 4;
    gap = 2;
    cols = 25;
  } else if (totalNeeded > 50) {
    boxSize = 6;
    gap = 3;
    cols = 20;
  }

  const rows = Math.ceil(totalNeeded / cols);
  const gridW = cols * boxSize + (cols - 1) * gap;
  const startX = centerX - gridW / 2;

  ctx.imageSmoothingEnabled = false;

  for (let i = 0; i < totalNeeded; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (boxSize + gap);
    const yPos = y + row * (boxSize + gap);

    ctx.fillStyle = (i < currentInTier) ? '#44ff44' : 'rgba(255,255,255,0.15)';
    ctx.fillRect(Math.floor(x), Math.floor(yPos), boxSize, boxSize);
  }
  return rows * (boxSize + gap);
}

function showStatsModal() {
  const modal = document.getElementById('stats-modal');
  const canvas = document.getElementById('statsBadgeCanvas');
  const pCanvas = document.getElementById('statsProgressCanvas');
  const rankLabel = document.getElementById('stats-rank-badge-label');
  const winsCount = document.getElementById('stats-wins-count');

  const stats = getStats();
  const wins = stats.lifetimeWins || 0;
  const rank = getRank(wins);

  winsCount.textContent = wins;
  rankLabel.textContent = rank.title;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.imageSmoothingEnabled = false;
  const badge = getBadgeSprite(rank.index);
  if (badge) {
    ctx.drawImage(badge, 0, 0, 64, 64, 0, 0, 128, 128);
  }

  const pCtx = pCanvas.getContext('2d');
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  drawRankProgress(pCtx, pCanvas.width / 2, 0, wins);

  modal.style.display = 'flex';
}

// --- Persistence & Stats ---
function getStats() {
  const stats = localStorage.getItem('mysteryFarm_stats');
  return stats ? JSON.parse(stats) : { history: {}, lifetimeWins: 0 };
}

function saveStats(stats) {
  localStorage.setItem('mysteryFarm_stats', JSON.stringify(stats));
}

function calculateStreaks() {
  const stats = getStats();
  const dates = Object.keys(stats.history).sort().reverse(); // Newest to oldest
  if (dates.length === 0) return { win: 0, att: 0, maxWin: 0, maxAtt: 0 };

  let currWin = 0, currAtt = 0, maxWin = 0, maxAtt = 0;

  // Calculate historical maxes (need oldest to newest for this)
  const cronDates = [...dates].reverse();
  let tempWin = 0, tempAtt = 0;
  for (let i = 0; i < cronDates.length; i++) {
    const dayData = stats.history[cronDates[i]];
    const dayResults = Array.isArray(dayData) ? dayData : [dayData];

    // Check for gap relative to previous entry
    if (i > 0) {
      const dPrev = new Date(cronDates[i - 1]);
      const dCurr = new Date(cronDates[i]);
      if ((dCurr - dPrev) / 86400000 > 1.5) { // Using 1.5 to be safe with DST/midnights
        tempWin = 0;
        tempAtt = 0;
      }
    }

    const isAttempt = dayResults.some(r => r && r.status && r.status !== 'incomplete');
    const isWin = dayResults.some(r => r && r.status === 'success');

    if (isAttempt) {
      tempAtt++;
      maxAtt = Math.max(maxAtt, tempAtt);
    } else {
      tempAtt = 0;
    }

    if (isWin) {
      tempWin++;
      maxWin = Math.max(maxWin, tempWin);
    } else {
      tempWin = 0;
    }
  }

  // Calculate current streaks (newest to oldest)
  const today = currentDateStr;
  let lastDateFound = null;
  let winStreakBroken = false;
  let attStreakBroken = false;

  for (const ds of dates) {
    const dayData = stats.history[ds];
    const dayResults = Array.isArray(dayData) ? dayData : [dayData];

    if (lastDateFound) {
      const d1 = new Date(ds);
      const d2 = new Date(lastDateFound);
      if ((d2 - d1) / 86400000 > 1.5) break; // Gap found
    } else {
      // If the most recent play isn't today or yesterday, streak is 0
      const dPlay = new Date(ds);
      const dToday = new Date(today);
      if ((dToday - dPlay) / 86400000 > 1.5) break;
    }

    const isAttempt = dayResults.some(r => r && r.status && r.status !== 'incomplete');
    const isWin = dayResults.some(r => r && r.status === 'success');

    if (!attStreakBroken) {
      if (isAttempt) {
        currAtt++;
      } else if (ds !== today) {
        attStreakBroken = true;
      }
    }

    if (!winStreakBroken) {
      if (isWin) {
        currWin++;
      } else if (ds !== today) {
        winStreakBroken = true;
      }
    }

    if (isAttempt) lastDateFound = ds;
    if (winStreakBroken && attStreakBroken) break;
  }

  return { win: currWin, att: currAtt, maxWin, maxAtt };
}

function saveGame() {
  const data = {
    date: currentDateStr,
    dnaTestsRemaining,
    playerConnections,
    caseLog,
    detective: gameState.detective,
    isFinished: gameState.isFinished,
    wasSuccess: gameState.wasSuccess,
    startTime: gameState.startTime,
    endTime: gameState.endTime,
    introFinished: gameState.introFinished,
    hasClickedClue: gameState.hasClickedClue,
    hasCreatedConnection: gameState.hasCreatedConnection,
    hint1Shown: gameState.hint1Shown,
    hint2Shown: gameState.hint2Shown,
    isMidGameChange: gameState.isMidGameChange,
    statsUpdated: gameState.statsUpdated,
    caseIndex: gameState.caseIndex,
    globallyIssuedClueIds: Array.from(globallyIssuedClueIds),
    clueQueueIds: clueQueue.map(c => c.id),
    testedAnimals: rabbits.filter(r => r.isTested).map(r => ({ id: r.id, rel: r.dnaRelation, pct: r.dnaMatchPct })),
    activeClueIds: Array.from(activeClues.values()).map(c => ({ id: c.id, speakerId: Array.from(activeClues.keys()).find(k => activeClues.get(k) === c), isRead: c.isRead, generatedText: c.generatedText })),
    highlightedAnimalIds: Array.from(highlightedAnimalIds)
  };
  localStorage.setItem('mysteryFarm_current', JSON.stringify(data));
  if (gameState.detective && gameState.detective !== "null") {
    localStorage.setItem('mysteryFarm_detective', gameState.detective); // Global preference
  } else {
    localStorage.removeItem('mysteryFarm_detective');
  }

  if (gameState.isFinished && !gameState.statsUpdated) {
    const stats = getStats();

    // Initialize history for today if it doesn't exist
    if (!stats.history[currentDateStr]) stats.history[currentDateStr] = [];

    // Support migration from old single-object format to array format
    if (!Array.isArray(stats.history[currentDateStr])) {
      stats.history[currentDateStr] = [stats.history[currentDateStr]];
    }

    const dayResults = stats.history[currentDateStr];

    // Avoid double-counting if this specific case index is already in history
    if (dayResults[gameState.caseIndex] && (dayResults[gameState.caseIndex].status === 'success' || dayResults[gameState.caseIndex].status === 'failure')) {
      gameState.statsUpdated = true;
      return;
    }

    let solveTime = null;
    if (gameState.startTime && gameState.endTime) {
      solveTime = gameState.endTime - gameState.startTime;
    }

    dayResults[gameState.caseIndex] = {
      status: gameState.wasSuccess ? 'success' : 'failure',
      solveTime: solveTime,
      dnaTestsUsed: 3 - dnaTestsRemaining
    };

    if (gameState.wasSuccess) {
      stats.lifetimeWins = (stats.lifetimeWins || 0) + 1;
    }
    saveStats(stats);
    gameState.statsUpdated = true;
  }
}

function loadGame() {
  const savedDet = localStorage.getItem('mysteryFarm_detective');
  if (savedDet && savedDet !== "null" && savedDet !== "undefined") {
    gameState.detective = savedDet;
  }

  const saved = localStorage.getItem('mysteryFarm_current');
  if (!saved) return false;

  const data = JSON.parse(saved);
  if (data.date !== currentDateStr) {
    const stats = getStats();
    if (!stats.history[data.date]) {
      stats.history[data.date] = [{ status: 'incomplete' }];
      saveStats(stats);
    }
    return false;
  }

  // Clear the transcript UI before re-hydrating
  const list = document.getElementById('transcript-list');
  if (list) list.innerHTML = '';
  const latest = document.getElementById('latest-clue');
  if (latest) latest.innerHTML = 'Case Log: No clues yet...';

  dnaTestsRemaining = data.dnaTestsRemaining ?? 3;
  playerConnections = (data.playerConnections || []).map(conn => ({
    parentId: Number(conn.parentId),
    childId: Number(conn.childId)
  }));
  caseLog = data.caseLog || [];
  gameState.caseIndex = data.caseIndex || 0;

  // Update seed and RNG for the loaded case index
  const loadedSeed = getDailySeed(gameState.caseIndex);
  rngState = loadedSeed.seed;
  currentCaseIdx = gameState.caseIndex;

  // Clean up the detective string
  const dataDet = (data.detective && data.detective !== "null") ? data.detective : null;
  const prefDet = (savedDet && savedDet !== "null") ? savedDet : null;
  gameState.detective = dataDet || prefDet || null;
  gameState.isFinished = data.isFinished || false;
  gameState.wasSuccess = data.wasSuccess || false;
  gameState.startTime = data.startTime || null;
  gameState.endTime = data.endTime || null;
  gameState.introFinished = data.introFinished || false;
  gameState.hasClickedClue = data.hasClickedClue || false;
  gameState.hasCreatedConnection = data.hasCreatedConnection || false;
  gameState.hint1Shown = data.hint1Shown || false;
  gameState.hint2Shown = data.hint2Shown || false;
  gameState.isMidGameChange = data.isMidGameChange || false;
  gameState.statsUpdated = data.statsUpdated || (data.isFinished && data.date === currentDateStr) || false;
  globallyIssuedClueIds = new Set(data.globallyIssuedClueIds || []);

  if (data.testedAnimals) {
    data.testedAnimals.forEach(ta => {
      const rabbit = rabbits.find(r => r.id === ta.id);
      if (rabbit) {
        rabbit.isTested = true;
        rabbit.dnaRelation = getDNARelationshipLabel(ta.rel);
        rabbit.dnaMatchPct = ta.pct ?? null;
      }
    });
  }

  if (data.clueQueueIds) {
    clueQueue = data.clueQueueIds.map(id => cluePool.find(c => c.id === id)).filter(Boolean);
  }

  if (data.activeClueIds) {
    data.activeClueIds.forEach(cData => {
      const clue = cluePool.find(cp => cp.id === cData.id);
      if (clue) {
        clue.isRead = cData.isRead;
        clue.generatedText = cData.generatedText;
        activeClues.set(cData.speakerId, clue);
      }
    });
  }

  highlightedAnimalIds = new Set(data.highlightedAnimalIds || []);

  caseLog.forEach(entry => {
    const splitIdx = entry.indexOf(': ');
    if (splitIdx === -1) {
      // System message
      updateTranscriptUI(entry, null);
      return;
    }
    const name = entry.substring(0, splitIdx);
    const text = entry.substring(splitIdx + 2);
    if (name === "Case File" || name === "LAB") {
      updateTranscriptUI(text, null);
    } else {
      const speaker = rabbits.find(r => r.firstName === name);
      updateTranscriptUI(text, speaker ? speaker.id : null);
    }
  });
  if (tCount) tCount.textContent = dnaTestsRemaining;

  return true;
}

const camera = { x: 0, y: 0, zoom: 1.0, minZoom: 0.1, maxZoom: 3.0 };
const input = {
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  startX: 0,
  startY: 0,
  hasMoved: false,
  lastTouchDist: 0
};

class AnimalRecord {
  constructor(firstName, sex, birthYear, gen, species, fatherId = null, motherId = null) {
    this.id = nextRabbitId++;
    this.firstName = firstName;
    this.sex = sex;
    this.birthYear = birthYear;
    this.generation = gen;
    this.species = species;
    this.fatherId = fatherId;
    this.motherId = motherId;
    this.isTested = false;
    this.dnaRelation = null;
    this.dnaMatchPct = null;
    this.tint = { hue: random() * 360, saturate: 70 + random() * 30, brightness: 70 + random() * 20 };
  }
}

// --- Kinship ---
function getAncestors(id) {
  const ancestors = new Map();
  if (!id) return ancestors;
  const queue = [{ id, dist: 0 }];
  const visited = new Map(); // Store min distance to each node
  while (queue.length > 0) {
    const { id: currId, dist } = queue.shift();
    if (visited.has(currId) && visited.get(currId) <= dist) continue;
    visited.set(currId, dist);

    if (dist > 0) ancestors.set(currId, dist);
    if (dist >= 8) continue;

    const r = rabbits.find(rb => rb.id === currId);
    if (r) {
      if (r.fatherId) queue.push({ id: r.fatherId, dist: dist + 1 });
      if (r.motherId) queue.push({ id: r.motherId, dist: dist + 1 });
    }
  }
  return ancestors;
}

function getCommonAncestors(id1, id2) {
  const a1 = getAncestors(id1);
  const a2 = getAncestors(id2);
  const common = [];
  a1.forEach((dist1, id) => { if (a2.has(id)) common.push({ id, dist1, dist2: a2.get(id) }); });
  return common;
}

const kinshipMemo = new Map();
function kinship(a, b) {
  if (!a || !b) return 0;
  const key = a < b ? `${a}-${b}` : `${b}-${a}`;
  if (kinshipMemo.has(key)) return kinshipMemo.get(key);

  const ra = rabbits.find(r => r.id === a);
  const rb = rabbits.find(r => r.id === b);
  if (!ra || !rb) return 0;

  let res;
  if (a === b) {
    // Kinship of a with itself is 0.5 * (1 + kinship of parents)
    res = 0.5 * (1 + kinship(ra.fatherId, ra.motherId));
  } else {
    // Kinship of a with b is average of kinship of a's parents with b
    // (We pick the one from the later generation to ensure recursion terminates)
    if (ra.generation > rb.generation) {
      res = 0.5 * (kinship(ra.fatherId, b) + kinship(ra.motherId, b));
    } else {
      res = 0.5 * (kinship(a, rb.fatherId) + kinship(a, rb.motherId));
    }
  }

  kinshipMemo.set(key, res);
  return res;
}

function getRelationshipLabel(common, id1, id2) {
  if (!common || common.length === 0) return null;

  // 1. SAFETY OVERRIDE: Check for absolute direct parentage first
  const r1 = rabbits.find(r => r.id === id1);
  const r2 = rabbits.find(r => r.id === id2);
  if (r1 && r2) {
    if (r1.fatherId === r2.id || r1.motherId === r2.id) return "parent";
    if (r2.fatherId === r1.id || r2.motherId === r1.id) return "child";
    if (r1.id === r2.id) return "self";
  }

  // 2. Complex path logic
  const closest = common.reduce((min, c) => {
    const n_min = Math.min(min.dist1, min.dist2) - 1;
    const n_c = Math.min(c.dist1, c.dist2) - 1;

    if (n_c < n_min) return c; // -1 (Direct) beats 0 (Uncle)
    if (n_c > n_min) return min;

    const rem_min = Math.abs(min.dist1 - min.dist2);
    const rem_c = Math.abs(c.dist1 - c.dist2);
    if (rem_c < rem_min) return c;
    return min;
  }, common[0]);

  const dist1 = closest.dist1;
  const dist2 = closest.dist2;
  const n = Math.min(dist1, dist2) - 1;
  const removed = Math.abs(dist1 - dist2);

  if (n === -1) {
    if (dist1 === 0 && dist2 === 0) return "self";
    if (dist1 === 0) { // Killer is the ancestor
      if (dist2 === 1) return "child";
      if (dist2 === 2) return "grandchild";
      if (dist2 === 3) return "gr-grandchild";
      return "descendant";
    }
    if (dist2 === 0) { // Relative is the ancestor
      if (dist1 === 1) return "parent";
      if (dist1 === 2) return "grandparent";
      if (dist1 === 3) return "gr-grandparent";
      return "ancestor";
    }
    return "direct relative";
  }
  if (n < 0) return null;
  if (n === 0) {
    if (dist1 === 1 && dist2 === 1) return "sibling";
    const p1 = rabbits.find(r => r.id === id1);
    const p2 = rabbits.find(r => r.id === id2);
    if (dist1 === 1) {
      if (removed === 1) return p1.sex === 'M' ? "nephew" : "niece";
      if (removed === 2) return p1.sex === 'M' ? "gr-nephew" : "gr-niece";
      if (removed === 3) return p1.sex === 'M' ? "gg-nephew" : "gg-niece";
      return "distant descendant";
    }
    if (dist2 === 1) {
      if (removed === 1) return p2.sex === 'M' ? "uncle" : "aunt";
      if (removed === 2) return p2.sex === 'M' ? "gr-uncle" : "gr-aunt";
      if (removed === 3) return p2.sex === 'M' ? "gg-uncle" : "gg-aunt";
      return "distant ancestor branch";
    }
    return "distant relative";
  }

  const ords = ["", "1st", "2nd", "3rd", "4th", "5th", "6th"];
  const rems = ["", "once", "twice", "3 times", "4 times"];
  let l = `${ords[n] || n + "th"} cousin`;
  if (removed > 0) l += ` ${rems[removed] || removed + " times"} removed`;
  return l;
}

function getDNARelationshipLabel(preciseLabel) {
  if (!preciseLabel || preciseLabel.toLowerCase() === "no relation") return "no relation";
  const l = preciseLabel.toLowerCase();

  if (l === "self" || l === "match") return "Match";
  if (l === "parent" || l === "child" || l === "parent or child") return "Parent or Child";
  if (l === "sibling" || l === "full sibling") return "Full Sibling";
  if (l === "grandparent" || l === "grandchild" || l === "grandparent or grandchild") return "Grandparent or Grandchild";
  if (l === "uncle" || l === "aunt" || l === "nephew" || l === "niece" || l.includes("aunt, uncle, niece, or nephew")) return "Aunt, Uncle, Niece, or Nephew";

  // Grouping based on shared DNA percentage
  if (l.includes("1st cousin") && !l.includes("removed")) return "1st Cousin or Great-Grandparent";
  if (l.includes("great-grandparent")) return "1st Cousin or Great-Grandparent";
  if (l.includes("gr-grandparent") || l.includes("gr-grandchild") ||
    l.includes("gr-uncle") || l.includes("gr-aunt") || l.includes("gr-nephew") || l.includes("gr-niece")) {
    return "1st Cousin or Great-Grandparent";
  }

  if (l.includes("2nd cousin") || l.includes("1st cousin once removed")) return "2nd Cousin or 1st Cousin Once Removed";

  return "Distant Relative";
}

function getPath(startId, targetId) {
  if (startId === targetId) return [];
  const path = [];
  let currId = startId;
  const visited = new Set();
  while (currId && currId !== targetId) {
    if (visited.has(currId)) break;
    visited.add(currId);
    const curr = rabbits.find(r => r.id === currId);
    if (!curr) break;

    // Explicitly check if the target is one of the parents
    if (curr.fatherId === targetId) {
      path.push({ parentId: curr.fatherId, childId: currId });
      currId = curr.fatherId;
      break;
    }
    if (curr.motherId === targetId) {
      path.push({ parentId: curr.motherId, childId: currId });
      currId = curr.motherId;
      break;
    }

    const fAnc = getAncestors(curr.fatherId);
    if (curr.fatherId && (curr.fatherId === targetId || fAnc.has(targetId))) {
      path.push({ parentId: curr.fatherId, childId: currId });
      currId = curr.fatherId;
    } else if (curr.motherId && (curr.motherId === targetId || getAncestors(curr.motherId).has(targetId))) {
      path.push({ parentId: curr.motherId, childId: currId });
      currId = curr.motherId;
    } else {
      break;
    }
  }
  return path;
}

// --- Clues ---
function updateNecessaryConnections() {
  const necessary = new Set();
  rabbits.filter(r => r.dnaRelation && r.dnaRelation !== "no relation").forEach(rel => {
    const common = getCommonAncestors(killerId, rel.id);
    if (common.length === 0) return;
    const anc = common.reduce((min, c) => (c.dist1 + c.dist2 < min.dist1 + min.dist2 ? c : min), common[0]);
    getPath(rel.id, anc.id).forEach(c => necessary.add(JSON.stringify(c)));
    getPath(killerId, anc.id).forEach(c => necessary.add(JSON.stringify(c)));
  });
  necessaryConnections = Array.from(necessary).map(s => JSON.parse(s));
}

function generateCluePool(additive = false) {
  const newClues = additive ? [...cluePool] : [];
  const existing = new Set(newClues.map(c => JSON.stringify(c.conn)));

  function addRawClue(conn, type, speakerId = null, groupId = null) {
    // Normalize symmetric connections to prevent duplicates
    if (conn.type === 'couple') {
      const [p1, p2] = [conn.p1, conn.p2].sort((a, b) => a - b);
      conn = { type: 'couple', p1, p2 };
    } else if (conn.type === 'sibling') {
      const [a, b] = [conn.a, conn.b].sort((a, b) => a - b);
      conn = { type: 'sibling', a, b };
    }

    const connStr = JSON.stringify(conn);
    if (existing.has(connStr)) return;
    if (newClues.length >= rabbits.length * 0.9) return;

    const stableId = `clue_${newClues.length}`;
    newClues.push({ id: stableId, conn, type, speakerId, groupId, isRead: false });
    existing.add(connStr);
  }

  necessaryConnections.forEach(conn => {
    const connStr = JSON.stringify(conn);
    if (existing.has(connStr)) return;

    const p = rabbits.find(r => r.id === conn.parentId);
    const c = rabbits.find(r => r.id === conn.childId);
    if (!p || !c) return;

    // Check if c is the only child of p
    const pChildren = rabbits.filter(r => r.fatherId === p.id || r.motherId === p.id);
    const isOnlyChild = pChildren.length === 1;

    const r = random();
    if (r < 0.5) {
      // Strategy 1: Direct Clue (Highly biased toward first-person)
      const sid = random() < 0.8 ? (random() < 0.5 ? p.id : c.id) : null;
      if (isOnlyChild && random() < 0.5) {
        addRawClue({ type: 'onlyChild', parentId: p.id, childId: c.id }, 'necessary', sid);
      } else {
        addRawClue(conn, 'necessary', sid);
      }
    } else if (r < 0.75) {
      // Strategy 2: Spouse/Couple Inference (Speaker is often the child)
      const spouseId = p.sex === 'M' ? c.motherId : c.fatherId;
      const spouse = rabbits.find(r => r.id === spouseId);
      if (spouse) {
        const gid = Math.random().toString(36).substring(2, 7);
        const sid = random() < 0.7 ? c.id : null;

        const spouseChildren = rabbits.filter(r => r.fatherId === spouse.id || r.motherId === spouse.id);
        if (spouseChildren.length === 1 && random() < 0.5) {
          addRawClue({ type: 'onlyChild', parentId: spouse.id, childId: c.id }, 'necessary', sid, gid);
        } else {
          addRawClue({ parentId: spouse.id, childId: c.id }, 'necessary', sid, gid);
        }
        addRawClue({ type: 'couple', p1: p.id, p2: spouse.id }, 'necessary', null, gid);
      } else {
        addRawClue(conn, 'necessary', c.id);
      }
    } else if (r < 0.9) {
      // Strategy 3: Sibling Inference (Speaker is often one of the siblings)
      const siblings = rabbits.filter(r => (r.fatherId === p.id || r.motherId === p.id) && r.id !== c.id);
      if (siblings.length > 0) {
        const sib = pick(siblings);
        const gid = Math.random().toString(36).substring(2, 7);
        const sid = random() < 0.7 ? (random() < 0.5 ? c.id : sib.id) : null;
        addRawClue({ parentId: p.id, childId: sib.id }, 'necessary', sid, gid);
        addRawClue({ type: 'sibling', a: c.id, b: sib.id }, 'necessary', sid, gid);
      } else {
        if (isOnlyChild && random() < 0.5) {
          addRawClue({ type: 'onlyChild', parentId: p.id, childId: c.id }, 'necessary', c.id);
        } else {
          addRawClue(conn, 'necessary', c.id);
        }
      }
    } else {
      // Strategy 4: Grandparent Inference (Speaker is often the grandchild)
      const gpId = p.fatherId || p.motherId;
      const gp = rabbits.find(r => r.id === gpId);
      if (gp) {
        const gid = Math.random().toString(36).substring(2, 7);
        const sid = random() < 0.7 ? c.id : null;
        addRawClue({ parentId: gp.id, childId: p.id }, 'necessary', null, gid);
        addRawClue({ type: 'grandparent', gp: gp.id, gc: c.id }, 'necessary', sid, gid);
      } else {
        if (isOnlyChild && random() < 0.5) {
          addRawClue({ type: 'onlyChild', parentId: p.id, childId: c.id }, 'necessary', p.id);
        } else {
          addRawClue(conn, 'necessary', p.id);
        }
      }
    }
    addRawClue(conn, 'necessary');
  });

  const allConns = [];
  rabbits.forEach(r => { if (r.fatherId) allConns.push({ parentId: r.fatherId, childId: r.id }); if (r.motherId) allConns.push({ parentId: r.motherId, childId: r.id }); });

  // Include EVERY parent-child connection in the pool as flavor clues
  allConns.forEach(conn => {
    // Extra clues also biased toward first-person
    const sid = random() < 0.7 ? (random() < 0.5 ? conn.parentId : conn.childId) : null;
    const pChildren = rabbits.filter(r => r.fatherId === conn.parentId || r.motherId === conn.parentId);
    if (pChildren.length === 1 && random() < 0.3) {
      addRawClue({ type: 'onlyChild', parentId: conn.parentId, childId: conn.childId }, 'extra', sid);
    } else {
      addRawClue(conn, 'extra', sid);
    }
  });

  cluePool = newClues;

  // Prioritize clues involving the two starting DNA relatives
  if (!additive) {
    const dnaRelIds = rabbits.filter(r => r.dnaRelation).map(r => r.id);
    const prioritized = newClues.filter(c => {
      if (c.type !== 'necessary') return false;
      const conn = c.conn;
      if (conn.parentId && (dnaRelIds.includes(conn.parentId) || dnaRelIds.includes(conn.childId))) return true;
      if (conn.type === 'couple' && (dnaRelIds.includes(conn.p1) || dnaRelIds.includes(conn.p2))) return true;
      if (conn.type === 'sibling' && (dnaRelIds.includes(conn.a) || dnaRelIds.includes(conn.b))) return true;
      if (conn.type === 'grandparent' && (dnaRelIds.includes(conn.gp) || dnaRelIds.includes(conn.gc))) return true;
      return false;
    });

    if (prioritized.length > 0) {
      const queuedIds = new Set();
      for (let i = 0; i < 2; i++) {
        const avail = prioritized.filter(c => !queuedIds.has(c.id));
        if (avail.length === 0) break;
        const choice = pick(avail);
        const group = choice.groupId ? newClues.filter(c => c.groupId === choice.groupId) : [choice];
        group.forEach(cl => { if (!queuedIds.has(cl.id)) { clueQueue.push(cl); queuedIds.add(cl.id); } });
      }
    }
  }
}

// Parse animal IDs from clue text
function extractAnimalIdsFromText(text) {
  const ids = new Set();
  const matches = text.matchAll(/\[\[(\d+):.*?\]\]/g);
  for (const match of matches) {
    ids.add(parseInt(match[1]));
  }
  return ids;
}

function generateClueText(clue, speakerId) {
  const s = rabbits.find(r => r.id === speakerId);
  const mark = (id) => {
    const r = rabbits.find(rb => rb.id === id);
    return `[[${id}:${r.firstName}]]`;
  };

  if (clue.conn.type === 'couple') {
    const p1 = rabbits.find(r => r.id === clue.conn.p1);
    const p2 = rabbits.find(r => r.id === clue.conn.p2);
    const children = rabbits.filter(r => (r.fatherId === p1.id && r.motherId === p2.id) || (r.fatherId === p2.id && r.motherId === p1.id));
    const isSingular = children.length === 1;

    return pick([
      `${mark(p1.id)} and ${mark(p2.id)} have a family together.`,
      isSingular
        ? `I've seen ${mark(p1.id)} and ${mark(p2.id)} with their little one.`
        : `I've seen ${mark(p1.id)} and ${mark(p2.id)} with their little ones.`,
      `Aren't ${mark(p1.id)} and ${mark(p2.id)} such a devoted pair of parents?`,
      `${mark(p1.id)} and ${mark(p2.id)} are definitely building a nest together.`
    ]);
  }

  if (clue.conn.type === 'onlyChild') {
    const p = rabbits.find(r => r.id === clue.conn.parentId);
    const c = rabbits.find(r => r.id === clue.conn.childId);
    const pRole = p.sex === 'M' ? 'father' : 'mother';
    const cRole = c.sex === 'M' ? 'son' : 'daughter';
    if (speakerId === p.id) return `${mark(c.id)} is my only child.`;
    if (speakerId === c.id) return `I'm ${mark(p.id)}'s only child.`;
    return pick([
      `${mark(c.id)} is ${mark(p.id)}'s only child.`,
      `${mark(p.id)} only has one child, ${mark(c.id)}.`
    ]);
  }

  if (clue.conn.type === 'sibling') {
    const a = rabbits.find(r => r.id === clue.conn.a);
    const b = rabbits.find(r => r.id === clue.conn.b);
    const bRole = b.sex === 'M' ? 'brother' : 'sister';
    if (speakerId === a.id) return pick([
      `${mark(b.id)} is my ${bRole}.`,
      `Have you seen my ${bRole}, ${mark(b.id)}?`,
      `I grew up with ${mark(b.id)}.`,
      `${mark(b.id)} belongs to my family.`
    ]);
    if (speakerId === b.id) return pick([
      `${mark(a.id)} is my ${a.sex === 'M' ? 'brother' : 'sister'}.`,
      `I'm looking for my ${a.sex === 'M' ? 'brother' : 'sister'}, ${mark(a.id)}.`,
      `${mark(a.id)} belongs to my family.`
    ]);
    return pick([`${mark(a.id)} and ${mark(b.id)} are siblings.`, `I believe ${mark(a.id)} and ${mark(b.id)} are ${a.sex === b.sex ? (a.sex === 'M' ? 'brothers' : 'sisters') : 'brother and sister'}.`]);
  }

  if (clue.conn.type === 'grandparent') {
    const gp = rabbits.find(r => r.id === clue.conn.gp);
    const gc = rabbits.find(r => r.id === clue.conn.gc);
    const gpRole = gp.sex === 'M' ? 'grandfather' : 'grandmother';
    if (speakerId === gc.id) return pick([`${mark(gp.id)} is my ${gpRole}.`, `I believe ${mark(gp.id)} is my ${gpRole}.`, `My ${gpRole} is ${mark(gp.id)}.`]);
    return pick([`${mark(gp.id)} is ${mark(gc.id)}'s ${gpRole}.`, `${mark(gc.id)} is ${mark(gp.id)}'s ${gc.sex === 'M' ? 'grandson' : 'granddaughter'}.`]);
  }

  // Standard parent-child connection
  const p = rabbits.find(r => r.id === clue.conn.parentId);
  const c = rabbits.find(r => r.id === clue.conn.childId);
  const pRole = p.sex === 'M' ? 'father' : 'mother';
  const pRoleShort = p.sex === 'M' ? 'dad' : 'mom';
  const cRole = c.sex === 'M' ? 'son' : 'daughter';
  const cRoleShort = c.sex === 'M' ? 'boy' : 'girl';
  const cPoss = c.sex === 'M' ? 'his' : 'her';

  if (speakerId === c.id) return pick([
    `${mark(p.id)} is my ${pRole}.`,
    `Have you seen my ${pRoleShort}, ${mark(p.id)}?`,
    `I believe ${mark(p.id)} is my ${pRoleShort}.`,
    `${mark(p.id)} belongs to my family.`
  ]);
  if (speakerId === p.id) return pick([`${mark(c.id)} is my ${cRole}.`, `I'm looking for my ${cRoleShort}, ${mark(c.id)}.`, `${mark(c.id)} belongs to my family.`]);

  return pick([`${mark(p.id)} is ${mark(c.id)}'s ${pRoleShort}.`, `${mark(c.id)} is ${mark(p.id)}'s ${cRole}.`, `I saw ${mark(c.id)} with ${cPoss} ${pRoleShort}, ${mark(p.id)}.`]);
}

function showTransitionModal(onBegin) {
  const modal = document.getElementById('transition-modal');
  const canvas = document.getElementById('transitionCanvas');
  const textContainer = document.getElementById('transition-text');
  const startBtn = document.getElementById('transition-start-btn');
  if (!modal || !canvas || !textContainer || !startBtn) return;

  const det = gameState.detective || 'fox';
  const lines = TRANSITION_LINES[det] || TRANSITION_LINES.fox;
  const line = lines[Math.floor(Math.random() * lines.length)];

  textContainer.textContent = `"${line}"`;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.imageSmoothingEnabled = false;
  const spr = detectiveSprites[det];
  if (spr && spr.complete) {
    ctx.drawImage(spr, 0, 0, 64, 64, 0, 0, 128, 128);
  }

  modal.style.display = 'flex';

  startBtn.onclick = () => {
    modal.style.display = 'none';
    onBegin();
  };
}

// --- Simulation ---
function runSimulation() {
  tintCache.clear(); // Clear sprite cache for the new game
  rabbits.length = 0;
  nextRabbitId = 1;
  const usedNames = new Set();
  const mPool = shuffle([...new Set(MALE_NAMES)]);
  const fPool = shuffle([...new Set(FEMALE_NAMES)]);

  // Pick victim before populating the world
  const vSex = random() < 0.5 ? 'M' : 'F';
  const vPool = vSex === 'M' ? mPool : fPool;
  const vName = vPool.pop();
  usedNames.add(vName);
  victim = {
    name: vName,
    species: pick(SPECIES),
    sex: vSex,
    tint: { hue: random() * 360, saturate: 70 + random() * 30, brightness: 70 + random() * 20 }
  };

  const g0 = [];
  // Founders - 14 (7 pairs) to ensure a more robust population tree
  for (let i = 0; i < 14; i++) {
    const sex = i < 7 ? 'M' : 'F';
    const pool = sex === 'M' ? mPool : fPool;
    if (pool.length === 0) break;
    const name = pool.pop();
    usedNames.add(name);
    const r = new AnimalRecord(name, sex, CURRENT_YEAR - 140 + Math.floor(random() * 20), 0, pick(SPECIES));
    g0.push(r); rabbits.push(r);
  }
  let prev = g0;
  for (let gen = 1; gen <= 4; gen++) {
    const next = [];
    let ms = shuffle(prev.filter(r => r.sex === 'M'));
    let fs = shuffle(prev.filter(r => r.sex === 'F'));

    // Pairing logic to avoid ALL shared parents (full and half siblings) and parent/child
    const usedF = new Set();
    const pairs = [];
    for (const m of ms) {
      const f = fs.find(f => {
        if (usedF.has(f.id)) return false;
        const mP = [m.fatherId, m.motherId].filter(id => id !== null);
        const fP = [f.fatherId, f.motherId].filter(id => id !== null);
        if (mP.some(id => fP.includes(id))) return false;
        if (m.id === f.fatherId || m.id === f.motherId || f.id === m.fatherId || f.id === m.motherId) return false;
        return true;
      });
      if (f) {
        usedF.add(f.id);
        pairs.push({ m, f });
      }
    }

    // Initial pass: standard children
    pairs.forEach(pair => {
      const { m, f } = pair;
      // Slightly higher average children (1.8 -> 2.1)
      const children = (random() < 0.4) ? 3 : (random() < 0.7 ? 2 : 1);
      let firstSex = random() < 0.5 ? 'M' : 'F';

      for (let c = 0; c < children; c++) {
        const pool = (c === 0) ? (firstSex === 'M' ? mPool : fPool) :
          (c === 1) ? (firstSex === 'M' ? fPool : mPool) :
            (random() < 0.5 ? mPool : fPool);

        if (pool.length === 0) continue;
        const sex = (pool === mPool) ? 'M' : 'F';
        const name = pool.pop();
        usedNames.add(name);

        let bYear = f.birthYear + 20 + Math.floor(random() * 20);
        if (bYear >= CURRENT_YEAR) bYear = CURRENT_YEAR - 1 - Math.floor(random() * 5);
        const child = new AnimalRecord(name, sex, bYear, gen, random() < 0.5 ? m.species : f.species, m.id, f.id);
        next.push(child); rabbits.push(child);
      }
    });

    // Population Stabilizer: If a generation is too small, have some pairs have "surprise" extra children
    // This prevents the population from dying out in later generations
    const minGenSize = 14 - gen; // Tapering minimum (13, 12, 11, 10)
    if (next.length < minGenSize && pairs.length > 0) {
      const needed = minGenSize - next.length;
      for (let i = 0; i < needed; i++) {
        const pair = pick(pairs);
        const pool = random() < 0.5 ? mPool : fPool;
        if (pool.length === 0) break;
        const sex = (pool === mPool) ? 'M' : 'F';
        const name = pool.pop();
        usedNames.add(name);
        let bYear = pair.f.birthYear + 25 + Math.floor(random() * 15);
        if (bYear >= CURRENT_YEAR) bYear = CURRENT_YEAR - 1;
        const bonusChild = new AnimalRecord(name, sex, bYear, gen, random() < 0.5 ? pair.m.species : pair.f.species, pair.m.id, pair.f.id);
        next.push(bonusChild); rabbits.push(bonusChild);
      }
    }

    prev = next;
  }

  // Determine generation weights based on population size (favoring larger ones)
  const genCounts = {};
  rabbits.forEach(r => genCounts[r.generation] = (genCounts[r.generation] || 0) + 1);

  const weightedGens = [];
  // Use generations 2, 3, and 4 as candidates
  for (let g = 2; g <= 4; g++) {
    const count = genCounts[g] || 0;
    // Add the generation ID to the lottery 'count' number of times
    for (let i = 0; i < count; i++) weightedGens.push(g);
  }

  // Pick a generation from the lottery (probabilistic, not deterministic)
  const selectedGen = weightedGens.length > 0 ? pick(weightedGens) : 3;

  // Find candidates in the chosen generation, prioritizing those with many species-mates
  const potentialCands = rabbits.filter(r => r.generation === selectedGen);
  const speciesCamouflage = {};
  potentialCands.forEach(r => speciesCamouflage[r.species] = (speciesCamouflage[r.species] || 0) + 1);

  const cands = shuffle(potentialCands).sort((a, b) => {
    // 80% chance to prioritize species camouflage, 20% total chaos
    if (random() < 0.8) return (speciesCamouflage[b.species] || 0) - (speciesCamouflage[a.species] || 0);
    return 0;
  });
  let found = false;

  // Try to find a killer who has at least 2 cousins
  for (const cand of cands) {
    const killer = cand;
    const allRel = rabbits.filter(r => r.id !== killer.id)
      .map(r => {
        const common = getCommonAncestors(killer.id, r.id);
        const label = getRelationshipLabel(common, killer.id, r.id);

        let n = -1;
        if (common.length > 0) {
          const closest = common.reduce((min, c) => {
            const n_min = Math.min(min.dist1, min.dist2) - 1;
            const n_c = Math.min(c.dist1, c.dist2) - 1;
            if (n_c < n_min) return c;
            if (n_c > n_min) return min;
            return (Math.abs(c.dist1 - c.dist2) < Math.abs(min.dist1 - min.dist2)) ? c : min;
          }, common[0]);
          n = Math.min(closest.dist1, closest.dist2) - 1;
        }

        // Safety override: exclude only direct parent/child (n=-1)
        if (killer.fatherId === r.id || killer.motherId === r.id || r.fatherId === killer.id || r.motherId === killer.id) n = -1;

        return { r, common, label, n };
      })
      .filter(e => e.label && e.n >= 0); // Include uncles/grandparents (n=0)

    if (allRel.length >= 2) {
      // Progressive filtering:
      // 1. Try n >= 2 (2nd cousin+)
      let relatives = allRel.filter(e => e.n >= 2);
      // 2. Fallback to n >= 1 (1st cousin+)
      if (relatives.length < 2) relatives = allRel.filter(e => e.n >= 1);
      // 3. Final fallback to n >= 0 (Uncles, Grandparents)
      if (relatives.length < 2) relatives = allRel;

      // Sort relatives by distance to killer (highest n first)
      relatives.sort((a, b) => b.n - a.n);

      const sample = relatives.slice(0, 15);
      let bestPair = null;
      let maxDist = -1;

      for (let i = 0; i < sample.length; i++) {
        for (let j = i + 1; j < sample.length; j++) {
          const commonBetween = getCommonAncestors(sample[i].r.id, sample[j].r.id);
          const dist = commonBetween.length === 0 ? 999 : (commonBetween[0].dist1 + commonBetween[0].dist2);
          if (dist > maxDist) {
            maxDist = dist;
            bestPair = [sample[i], sample[j]];
          }
        }
      }

      if (bestPair) {
        killerId = killer.id;
        bestPair.forEach(bp => {
          bp.r.dnaRelation = getDNARelationshipLabel(bp.label);
          bp.r.isTested = true;
          kinshipMemo.clear();
          bp.r.dnaMatchPct = parseFloat((kinship(killerId, bp.r.id) * 200).toFixed(3));
        });
        found = true;
        break;
      }
    }
  }

  // Final fallback if the generation is somehow extremely sparse
  if (!found) {
    const killer = cands[0] || rabbits[rabbits.length - 1];
    killerId = killer.id;

    // Find the two most distant non-parent relatives, strictly n >= 0
    const others = rabbits.filter(r => r.id !== killerId)
      .map(r => {
        const common = getCommonAncestors(killerId, r.id);
        const label = getRelationshipLabel(common, killerId, r.id);
        const killerObj = rabbits.find(k => k.id === killerId);
        let n = common.length > 0 ? (Math.min(common[0].dist1, common[0].dist2) - 1) : -1;
        if (killerObj.fatherId === r.id || killerObj.motherId === r.id || r.fatherId === killerId || r.motherId === killerId) n = -1;
        return { r, common, label, n };
      })
      .filter(e => e.n >= 0) // Allow Uncles/Grandparents
      .sort((a, b) => b.n - a.n);

    if (others.length >= 2) {
      others.slice(0, 2).forEach(o => {
        o.r.dnaRelation = getDNARelationshipLabel(o.label);
        o.r.isTested = true;
        kinshipMemo.clear();
        o.r.dnaMatchPct = parseFloat((kinship(killerId, o.r.id) * 200).toFixed(3));
      });
    } else {
      // Last resort fallback
      const lastResort = shuffle(rabbits.filter(r => r.id !== killerId && r.id !== killer.fatherId && r.id !== killer.motherId)).slice(0, 2);
      lastResort.forEach(lr => {
        lr.dnaRelation = getDNARelationshipLabel("distant relative");
        lr.isTested = true;
        kinshipMemo.clear();
        lr.dnaMatchPct = parseFloat((kinship(killerId, lr.id) * 200).toFixed(3));
      });
    }
  }
  updateNecessaryConnections();
  generateCluePool();

  // Initial Case Log entry
  const killer = rabbits.find(r => r.id === killerId);
  const kSexLabel = killer.sex === 'M' ? 'male' : 'female';
  const kSpeciesLabel = killer.species.replace('_', ' ');
  const vSpeciesLabel = victim.species.replace('_', ' ');
  const initialEntry = `Case File: <span style="color: ${getHSL(victim)}; font-weight: bold;">${victim.name} the ${vSpeciesLabel}</span> was found dead. DNA evidence indicates the killer is a ${kSexLabel} ${kSpeciesLabel}.`;
  caseLog.push(initialEntry);
  updateTranscriptUI(initialEntry.replace("Case File: ", ""), null);

  // Add the murder victim to the world as a static, selectable entity
  // Victim is between 25 and 85 years old to avoid implying child murder
  const victimAge = 25 + Math.floor(random() * 60);
  const victimRecord = new AnimalRecord(victim.name, victim.sex, CURRENT_YEAR - victimAge, 0, victim.species);
  victimRecord.tint = victim.tint;
  victimRecord.isVictim = true;
  victimRecord.id = -1; // Use a special ID for the victim

  // Position victim in top or bottom third of the map to avoid family tree overlap
  const side = random() < 0.5 ? 'top' : 'bottom';
  const victimY = side === 'top' ? (40 + random() * (FIELD_HEIGHT / 3 - 100)) : (FIELD_HEIGHT * 2 / 3 + 40 + random() * (FIELD_HEIGHT / 3 - 100));
  const victimX = FIELD_WIDTH / 2 - 32 + (random() - 0.5) * 400; // Centered with some horizontal variation

  victimRecord.initialX = victimX;
  victimRecord.initialY = victimY;

  rabbits.push(victimRecord);
}

// --- Sprite Tinting Cache ---
const tintCache = new Map(); // Key: animalId, Value: { idle: canvas, walk: canvas, run: canvas, death: canvas }

function getTintedSprite(animal, state) {
  if (!tintCache.has(animal.id)) tintCache.set(animal.id, {});
  const cache = tintCache.get(animal.id);

  if (!cache[state]) {
    const baseSpr = sprites[animal.species][state];
    if (!baseSpr || !baseSpr.complete || baseSpr.width === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = baseSpr.width;
    canvas.height = baseSpr.height;
    const tCtx = canvas.getContext('2d');
    tCtx.imageSmoothingEnabled = false;
    tCtx.filter = `hue-rotate(${animal.tint.hue}deg) saturate(${animal.tint.saturate}%) brightness(${animal.tint.brightness}%)`;
    tCtx.drawImage(baseSpr, 0, 0);
    cache[state] = canvas;
  }
  return cache[state];
}

function drawPixelX(ctx, centerX, centerY, scale, isHovered = false) {
  // Scale up as zoom (scale) decreases to keep it clickable
  // At zoom 1, pixelSize = 2. At zoom 0.2, pixelSize = 4.
  let pixelSize = Math.max(1, Math.round(2 / Math.pow(scale, 0.4)));
  if (isHovered) pixelSize = Math.round(pixelSize * 1.2); // Grow slightly on hover

  const size = 7; // 7x7 grid
  const xGrid = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ];

  const totalSize = size * pixelSize;
  const off = Math.floor(size / 2) * pixelSize;

  // Use Math.round to snap to integer coordinates, preventing "lines" between pixels
  const cx = Math.round(centerX);
  const cy = Math.round(centerY);

  // 1. Draw shadow (single rect for performance and clean edges)
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(cx - off + pixelSize, cy - off + pixelSize, totalSize, totalSize);

  // 2. Draw solid Red Background Box (single rect prevents internal gaps)
  // Brighter on hover
  ctx.fillStyle = isHovered ? '#ff6666' : '#f44';

  // Optional: white glow if hovered
  if (isHovered) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    ctx.fillRect(cx - off, cy - off, totalSize, totalSize);
    ctx.restore();
  } else {
    ctx.fillRect(cx - off, cy - off, totalSize, totalSize);
  }

  // 3. Draw White X pixels
  ctx.fillStyle = '#fff';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (xGrid[r][c]) {
        ctx.fillRect(cx - off + c * pixelSize, cy - off + r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

// --- Animal Sprite ---
class Animal {
  constructor(record) {
    this.rabbit = record;
    this.x = (record.initialX !== undefined) ? record.initialX : (random() * FIELD_WIDTH);
    this.y = (record.initialY !== undefined) ? record.initialY : (random() * FIELD_HEIGHT);
    this.targetX = null; this.targetY = null;
    this.state = record.isVictim ? 'death' : 'idle';
    this.direction = Math.floor(random() * 4);
    this.frame = record.isVictim ? 5 : 0;
    this.frameTimer = record.isVictim ? 5 : 0;
    this.frameSpeed = record.isVictim ? 0 : 0.1;
    this.moveTimer = 0; this.vx = 0; this.vy = 0;
    if (!record.isVictim) this.setRandomBehavior();

    // Cache text metrics once
    const tempCtx = document.createElement('canvas').getContext('2d');
    tempCtx.font = "bold 13px Arial, sans-serif";
    this.nameLabel = `${this.rabbit.firstName} (${CURRENT_YEAR - this.rabbit.birthYear})`;
    this.nameWidth = tempCtx.measureText(this.nameLabel).width;
  }
  setRandomBehavior() {
    const r = random();
    if (r < 0.6) { this.state = 'idle'; this.vx = this.vy = 0; this.frameSpeed = 0.1; }
    else if (r < 0.95) { this.state = 'walk'; this.frameSpeed = 0.15; this.setDir(1); }
    else { this.state = 'run'; this.frameSpeed = 0.25; this.setDir(2.5); }
    this.moveTimer = 60 + random() * 180;
  }
  setDir(s) { const a = Math.floor(random() * 8) * (Math.PI / 4); this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s; this.updateDir(); }
  updateDir() {
    if (this.vx === 0 && this.vy === 0) return;
    const deg = (Math.atan2(this.vy, this.vx) * 180 / Math.PI + 360) % 360;
    if (deg >= 45 && deg < 135) this.direction = 0; else if (deg >= 225 && deg < 315) this.direction = 1; else if (deg >= 135 && deg < 225) this.direction = 2; else this.direction = 3;
  }
  update() {
    if (this.rabbit.isVictim) {
      this.vx = 0;
      this.vy = 0;
      this.state = 'death';
      this.frame = 5;
      return;
    }

    if (this.targetX !== null) {
      const dx = this.targetX - this.x, dy = this.targetY - this.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 5) { this.state = 'run'; this.vx = (dx / d) * 2.5; this.vy = (dy / d) * 2.5; this.updateDir(); }
      else { this.state = 'idle'; this.vx = this.vy = 0; this.x = this.targetX; this.y = this.targetY; }
    } else if (!gameState.isFinished) {
      // Voronoi-style Spatial Relaxation (Lloyd's Algorithm variation)
      // Only runs for animals not currently in the family tree
      if (Date.now() % 4 === 0) {
        let forceX = 0, forceY = 0;
        let count = 0;
        const spacing = 150; // Desired minimum spacing

        hares.forEach(o => {
          if (o === this) return;
          const dx = this.x - o.x, dy = this.y - o.y;
          const d2 = dx * dx + dy * dy;

          // Influence falls off with distance
          if (d2 < spacing * spacing) {
            const d = Math.sqrt(d2);
            const strength = (spacing - d) / spacing;
            forceX += (dx / d) * strength;
            forceY += (dy / d) * strength;
            count++;
          }
        });

        // Add boundary repulsion (treat edges as neighbors)
        const edgePush = 1.0;
        const boundaryPadding = 20;
        const spriteSize = 64;

        if (this.x < spacing + boundaryPadding) {
          forceX += (1 - (this.x - boundaryPadding) / spacing) * edgePush;
        }
        if (this.x > (FIELD_WIDTH - boundaryPadding - spriteSize) - spacing) {
          forceX -= (1 - ((FIELD_WIDTH - boundaryPadding - spriteSize) - this.x) / spacing) * edgePush;
        }
        if (this.y < spacing + boundaryPadding) {
          forceY += (1 - (this.y - boundaryPadding) / spacing) * edgePush;
        }
        if (this.y > (FIELD_HEIGHT - boundaryPadding - spriteSize) - spacing) {
          forceY -= (1 - ((FIELD_HEIGHT - boundaryPadding - spriteSize) - this.y) / spacing) * edgePush;
        }

        if (count > 0 || Math.abs(forceX) > 0.1 || Math.abs(forceY) > 0.1) {
          this.vx = (this.vx * 0.9) + (forceX * 0.2);
          this.vy = (this.vy * 0.9) + (forceY * 0.2);
        }
      }

      if (this.state !== 'idle') {
        const s = this.state === 'walk' ? 1 : 2.5;
        const curr = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (curr > s) { this.vx = (this.vx / curr) * s; this.vy = (this.vy / curr) * s; }
      }
      if (--this.moveTimer <= 0) this.setRandomBehavior();
    } else {
      this.vx = 0; this.vy = 0; this.state = 'idle';
    }

    if (this.state !== 'idle' && this.state !== 'death') this.updateDir();
    this.x += this.vx; this.y += this.vy;

    // Hard constraints with padding to keep sprites fully inside the boundary box
    const padding = 20;
    const spriteSize = 64;
    if (this.x < padding) {
      this.x = padding; this.vx *= -1;
    } else if (this.x > FIELD_WIDTH - padding - spriteSize) {
      this.x = FIELD_WIDTH - padding - spriteSize; this.vx *= -1;
    }
    if (this.y < padding) {
      this.y = padding; this.vy *= -1;
    } else if (this.y > FIELD_HEIGHT - padding - spriteSize) {
      this.y = FIELD_HEIGHT - padding - spriteSize; this.vy *= -1;
    }

    // Post-game override for killer death state
    if (gameState.isFinished && this.rabbit.id === killerId && gameState.wasSuccess) {
      // Only show as dead if we've reached our target (or have no target)
      const atTarget = this.targetX === null || (Math.abs(this.x - this.targetX) < 10 && Math.abs(this.y - this.targetY) < 10);
      if (atTarget) {
        this.state = 'death';
        this.frameTimer = 5;
        this.frame = 5;
        this.vx = 0;
        this.vy = 0;
      }
    }

    if (this.state !== 'death') {
      this.frameTimer += this.frameSpeed;
      const spr = sprites[this.rabbit.species][this.state];
      const max = Math.floor((spr.width || 32) / FRAME_SIZE);
      if (this.frameTimer >= max) this.frameTimer = 0;
      this.frame = Math.floor(this.frameTimer);
    }
  }
  drawSprite() {
    const sx = (this.x - camera.x) * camera.zoom, sy = (this.y - camera.y) * camera.zoom, sz = FRAME_SIZE * 2 * camera.zoom;
    // Account for labels and speech bubbles in culling
    if (sx < -sz * 4 || sx > canvas.width + sz * 4 || sy < -sz * 4 || sy > canvas.height + sz * 4) return;

    // Check if this animal should be highlighted
    const isHighlighted = highlightedAnimalIds.has(this.rabbit.id);
    let d = this.direction; if (this.rabbit.species === 'Fox' && this.state === 'run') { if (d === 2) d = 3; else if (d === 3) d = 2; }

    // Draw highlight glow effect for mentioned animals
    if (isHighlighted) {
      const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7; // Pulsing effect
      const glowRadius = sz * (0.6 + pulse * 0.2);

      ctx.save();
      // Using a simpler arc fill instead of shadowBlur for better performance
      ctx.globalAlpha = 0.3 * pulse;
      ctx.beginPath();
      ctx.arc(sx + sz / 2, sy + sz / 2, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${this.rabbit.tint.hue}, 100%, 70%)`;
      ctx.fill();
      ctx.restore();
    }

    if (selectedHare === this) {
      const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.9;

      // Draw pixelated donut on a larger scratch canvas (64x64) to prevent clipping
      pCtx.clearRect(0, 0, 64, 64);
      pCtx.imageSmoothingEnabled = false;
      pCtx.beginPath();

      // We center the animal in the 64x64 space. 
      // Animal sprite is 32x32. In 64x64, its base (feet) is at y ≈ 46
      pCtx.ellipse(32, 46, 16 * pulse, 8 * pulse, 0, 0, Math.PI * 2);
      pCtx.strokeStyle = '#44ff44';
      pCtx.lineWidth = 1;
      pCtx.stroke();

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      // Draw the 64x64 scratch canvas centered on the animal.
      // Since the scratch is 2x the native sprite size (32), 
      // we draw it at 2x sz to keep pixel sizes consistent.
      ctx.drawImage(pixelCanvas,
        Math.floor(sx - sz / 2),
        Math.floor(sy - sz / 2),
        sz * 2, sz * 2
      );
      ctx.restore();
    }

    const tintedSpr = getTintedSprite(this.rabbit, this.state);
    if (tintedSpr) {
      ctx.drawImage(tintedSpr, this.frame * FRAME_SIZE, d * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE, Math.floor(sx), Math.floor(sy), sz, sz);
    }
    ctx.shadowBlur = 0;
  }

  drawLabels() {
    const sx = (this.x - camera.x) * camera.zoom, sy = (this.y - camera.y) * camera.zoom, sz = FRAME_SIZE * 2 * camera.zoom;
    if (sx < -sz * 4 || sx > canvas.width + sz * 4 || sy < -sz * 4 || sy > canvas.height + sz * 4) return;

    if (selectedHare === this && !gameState.isFinished && !this.rabbit.isVictim) {
      const textAlpha = Math.sin(Date.now() / 200) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(68, 255, 68, ${textAlpha})`;
      ctx.font = `bold ${Math.max(10, Math.floor(10 * camera.zoom))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText("SELECT RELATIVE", sx + sz / 2, sy - 40 * camera.zoom);
    }
    // Draw Name and Age with high-readability background
    const fontSize = Math.max(11, Math.floor(13 * camera.zoom));
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    const label = this.nameLabel;
    // Scale the cached width based on the actual font size being used (accounts for the 11px floor)
    const labelWidth = this.nameWidth * (fontSize / 13);
    const padX = 6 * camera.zoom, padY = 2 * camera.zoom;
    const bgW = labelWidth + padX * 2, bgH = fontSize + padY * 2;

    // Stagger height to prevent horizontal overlap in family trees
    const staggerY = (this.rabbit.id % 2 === 0) ? 0 : (fontSize * 0.6);
    const bgX = sx + sz / 2 - bgW / 2, bgY = sy + sz + 5 * camera.zoom + staggerY;

    // Background pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(bgX, bgY, bgW, bgH, 4 * camera.zoom);
    ctx.fill();

    // Text
    ctx.fillStyle = getHSL(this.rabbit);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, sx + sz / 2, bgY + padY);

    if (this.rabbit.dnaRelation) {
      // Use abbreviations and smaller text when zoomed out far
      const isZoomedOut = camera.zoom < 0.5;
      const relFontSize = isZoomedOut ? Math.max(9, Math.floor(11 * camera.zoom * 1.5)) : fontSize;
      ctx.font = `bold ${relFontSize}px Arial`;

      let relationText = this.rabbit.dnaRelation;
      if (isZoomedOut) {
        relationText = relationText
          .replace(/1st Cousin/g, "1C")
          .replace(/2nd Cousin/g, "2C")
          .replace(/Once Removed/g, "1R")
          .replace(/Great-Grandparent/g, "G-GP")
          .replace(/Grandparent/g, "GP")
          .replace(/Grandchild/g, "GC")
          .replace(/Distant Relative/g, "Distant");
      }

      const dnaLabel = `🧬 ${relationText}`;

      const words = dnaLabel.split(' ');
      let line = '';
      const lines = [];
      // Ensure a minimum width on screen (60px) so boxes don't get too narrow when zoomed out
      const maxW = Math.max((isZoomedOut ? 120 : 80) * camera.zoom, 60);

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const dW = Math.max(...lines.map(l => ctx.measureText(l).width)) + padX * 2;
      const lineH = relFontSize + padY;
      const dH = lines.length * lineH + padY;

      // Removed stagger for DNA label (too tall)
      const dX = sx + sz / 2 - dW / 2;
      const dY = Math.max(5, sy - dH - 5 * camera.zoom);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(dX, dY, dW, dH, 4 * camera.zoom);
      ctx.fill();

      ctx.fillStyle = '#44ff44';
      ctx.textBaseline = 'top';
      lines.forEach((l, i) => {
        ctx.fillText(l.trim(), sx + sz / 2, dY + padY + i * lineH);
      });
    }
    const clue = activeClues.get(this.rabbit.id);
    if (clue && !gameState.isFinished) {
      // Partial scaling for bubbles: they stay larger when zoomed out
      const isHovered = hoveredBubbleId === this.rabbit.id;
      const bubbleScale = (camera.zoom * 0.4 + 0.6) * (isHovered ? 1.2 : 1.0);

      const bw = 30 * bubbleScale, bh = 25 * bubbleScale, r = 5 * bubbleScale;
      const bx = sx + sz * 0.8, by = sy - 15 * camera.zoom;

      const s = Math.max(0, Math.min(100, this.rabbit.tint.saturate)), l = Math.max(0, Math.min(100, this.rabbit.tint.brightness));
      const brightness = isHovered ? Math.min(100, l + 20) : l;
      ctx.fillStyle = `hsla(${this.rabbit.tint.hue}, ${s}%, ${brightness}%, 0.9)`;

      // Add a slight white border if hovered
      if (isHovered) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'white';
      }

      ctx.beginPath();
      ctx.roundRect(bx, by - bh, bw, bh, r);
      ctx.fill();

      ctx.beginPath(); ctx.moveTo(bx + 5 * bubbleScale, by); ctx.lineTo(bx + 15 * bubbleScale, by); ctx.lineTo(bx + 10 * bubbleScale, by + 5 * bubbleScale); ctx.fill();

      ctx.shadowBlur = 0; // Reset shadow
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.floor(14 * bubbleScale)}px Arial`;
      ctx.fillText('?', bx + bw / 2, by - bh / 2);
    }
  }
}

function drawTutorialGuide() {
  const tCanvas = document.getElementById('tutorialCanvas');
  if (!tCanvas) return;
  const tCtx = tCanvas.getContext('2d');
  tCtx.clearRect(0, 0, tCanvas.width, tCanvas.height);
  tCtx.imageSmoothingEnabled = false;

  // Pick a consistent animal for the tutorial (e.g. the first one in the list)
  const animal = hares[0];
  if (!animal) return;

  const centerX = tCanvas.width / 2;
  const centerY = tCanvas.height / 2;
  const sz = FRAME_SIZE * 3; // Slightly larger for the tutorial
  const drawX = centerX - sz / 2;
  const drawY = centerY - sz / 2;

  // 1. Draw the actual sprite with same tinting logic
  const tintedSpr = getTintedSprite(animal.rabbit, 'idle');
  if (tintedSpr) {
    tCtx.drawImage(tintedSpr, 0, 0, FRAME_SIZE, FRAME_SIZE, Math.floor(drawX), Math.floor(drawY), sz, sz);
  }

  // 2. Draw the Name & Age Tag (matching in-game styles)
  const fontSize = 14;
  tCtx.font = `bold ${fontSize}px Arial, sans-serif`;
  const label = animal.nameLabel;
  const metrics = tCtx.measureText(label);
  const padX = 8, padY = 4;
  const bgW = metrics.width + padX * 2, bgH = fontSize + padY * 2;
  const bgX = centerX - bgW / 2, bgY = drawY + sz + 10;

  tCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  tCtx.beginPath();
  tCtx.roundRect(bgX, bgY, bgW, bgH, 6);
  tCtx.fill();

  tCtx.fillStyle = getHSL(animal.rabbit);
  tCtx.textAlign = 'center';
  tCtx.textBaseline = 'top';
  tCtx.fillText(label, centerX, bgY + padY);

  // 3. Draw a mock DNA Result Tag (using actual in-game Title Case)
  const relFontSize = 12;
  tCtx.font = `bold ${relFontSize}px Arial`;
  const dnaLabel = `🧬 1st Cousin`;
  const dMetrics = tCtx.measureText(dnaLabel);
  const dW = dMetrics.width + 16, dH = relFontSize + 10;
  const dX = centerX - dW / 2, dY = drawY - dH - 12; // Moved up slightly more

  tCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  tCtx.beginPath();
  tCtx.roundRect(dX, dY, dW, dH, 6);
  tCtx.fill();

  tCtx.fillStyle = '#44ff44';
  tCtx.fillText(dnaLabel, centerX, dY + 5);

  // 4. Draw the Speech Bubble
  const bubbleScale = 1.2;
  const bw = 30 * bubbleScale, bh = 25 * bubbleScale, r = 5 * bubbleScale;
  const bx = drawX + sz * 0.9, by = drawY + 25; // Moved down and right to avoid overlap

  const s = Math.max(0, Math.min(100, animal.rabbit.tint.saturate));
  const l = Math.max(0, Math.min(100, animal.rabbit.tint.brightness));
  tCtx.fillStyle = `hsla(${animal.rabbit.tint.hue}, ${s}%, ${l}%, 0.9)`;

  tCtx.beginPath();
  tCtx.roundRect(bx, by - bh, bw, bh, r);
  tCtx.fill();
  tCtx.beginPath();
  tCtx.moveTo(bx + 5 * bubbleScale, by);
  tCtx.lineTo(bx + 15 * bubbleScale, by);
  tCtx.lineTo(bx + 10 * bubbleScale, by + 5 * bubbleScale);
  tCtx.fill();

  tCtx.fillStyle = 'white';
  tCtx.textAlign = 'center';
  tCtx.textBaseline = 'middle';
  tCtx.font = `bold ${Math.floor(14 * bubbleScale)}px Arial`;
  tCtx.fillText('?', bx + bw / 2, by - bh / 2);
}

// --- UI & Input ---
function updateTreeDiagram() {
  const minSpacingX = 80, minSpacingY = 120;
  const preferredSpacingX = 160, preferredSpacingY = 160;

  const hareToTree = new Map(), trees = [];
  playerConnections.forEach(c => {
    let tA = hareToTree.get(c.parentId), tB = hareToTree.get(c.childId);
    if (tA && tB && tA !== tB) { tA.push(...tB); tB.forEach(id => hareToTree.set(id, tA)); trees.splice(trees.indexOf(tB), 1); }
    else if (tA) { if (!tA.includes(c.childId)) { tA.push(c.childId); hareToTree.set(c.childId, tA); } }
    else if (tB) { if (!tB.includes(c.parentId)) { tB.push(c.parentId); hareToTree.set(c.parentId, tB); } }
    else { const n = [c.parentId, c.childId]; trees.push(n); hareToTree.set(c.parentId, n); hareToTree.set(c.childId, n); }
  });

  hares.forEach(h => { if (!hareToTree.has(h.rabbit.id)) { h.targetX = h.targetY = null; } });
  if (trees.length === 0) return;

  const treeLayouts = [];
  let totalRawWidth = 0;
  let maxTreeHeight = 0;

  trees.forEach(t => {
    const roots = t.filter(id => !playerConnections.some(c => c.childId === id));
    const lvls = new Map();
    const childrenMap = new Map();
    playerConnections.forEach(c => {
      if (!childrenMap.has(c.parentId)) childrenMap.set(c.parentId, []);
      childrenMap.get(c.parentId).push(c.childId);
    });

    const walk = (id, l) => {
      lvls.set(id, Math.max(lvls.get(id) || 0, l));
      (childrenMap.get(id) || []).forEach(cid => walk(cid, l + 1));
    };
    roots.forEach(r => walk(r, 0));

    // Pull nodes down as far as possible to align spouses and peers
    let changed = true;
    while (changed) {
      changed = false;
      t.forEach(id => {
        const cs = childrenMap.get(id) || [];
        if (cs.length > 0) {
          const minChildLvl = Math.min(...cs.map(cid => lvls.get(cid)));
          const targetLvl = minChildLvl - 1;
          if (lvls.get(id) < targetLvl) {
            lvls.set(id, targetLvl);
            changed = true;
          }
        }
      });
    }

    const grps = [];
    lvls.forEach((l, id) => { if (!grps[l]) grps[l] = []; grps[l].push(id); });

    // Filter out any holes in grps to prevent crashes in the loops below
    const validGrps = grps.filter(Boolean);

    // Minimize line crossings using the Barycentric method (Sugiyama-style)
    // We iterate a few times top-down and bottom-up to find a stable horizontal order
    for (let iter = 0; iter < 4; iter++) {
      // Top-down: Sort children based on average parent position
      for (let l = 1; l < validGrps.length; l++) {
        const order = new Map(); validGrps[l - 1].forEach((id, i) => order.set(id, i));
        validGrps[l].sort((a, b) => {
          const getAvg = (id) => {
            const ps = playerConnections.filter(c => c.childId === id).map(c => c.parentId);
            let s = 0, c = 0; ps.forEach(pid => { if (order.has(pid)) { s += order.get(pid); c++; } });
            // If no parents, keep existing order to avoid bunching at the left
            return c > 0 ? s / c : validGrps[l].indexOf(id);
          };
          return getAvg(a) - getAvg(b);
        });
      }
      // Bottom-up: Sort parents based on average child position
      for (let l = validGrps.length - 2; l >= 0; l--) {
        const order = new Map(); validGrps[l + 1].forEach((id, i) => order.set(id, i));
        validGrps[l].sort((a, b) => {
          const getAvg = (id) => {
            const cs = playerConnections.filter(c => c.parentId === id).map(c => c.childId);
            let s = 0, c = 0; cs.forEach(cid => { if (order.has(cid)) { s += order.get(cid); c++; } });
            // If no children, keep existing order
            return c > 0 ? s / c : validGrps[l].indexOf(id);
          };
          return getAvg(a) - getAvg(b);
        });
      }
    }

    // Now that we have the order, calculate actual X positions to center groups over each other
    const layoutPositions = new Map();

    // First pass: Assign initial relative coordinates within each row
    validGrps.forEach((ids, l) => {
      ids.forEach((id, i) => {
        layoutPositions.set(id, { l, i, x: i * 1.5 });
      });
    });

    // Second pass: Adjust row X offsets to center parents/children
    // Increase iterations to allow the "spread" to propagate through all 5 generations
    for (let iter = 0; iter < 15; iter++) {
      // Top-down: Move children under parents
      validGrps.forEach((ids, l) => {
        if (l === 0) return;

        // Right-to-left pass (Top-down)
        for (let i = ids.length - 1; i >= 0; i--) {
          const id = ids[i];
          const ps = playerConnections.filter(c => c.childId === id).map(c => c.parentId);
          if (ps.length > 0) {
            let avgParentX = 0, pCount = 0;
            ps.forEach(pid => {
              const pPos = layoutPositions.get(pid);
              if (pPos) { avgParentX += pPos.x; pCount++; }
            });
            if (pCount > 0) {
              const idealX = avgParentX / pCount;
              const currentPos = layoutPositions.get(id);
              let maxX = (i === ids.length - 1) ? Infinity : layoutPositions.get(ids[i + 1]).x - 1.5;
              currentPos.x = Math.min(maxX, idealX);
            }
          }
        }

        // Left-to-right pass (Top-down)
        ids.forEach((id, i) => {
          const ps = playerConnections.filter(c => c.childId === id).map(c => c.parentId);
          if (ps.length > 0) {
            let avgParentX = 0, pCount = 0;
            ps.forEach(pid => {
              const pPos = layoutPositions.get(pid);
              if (pPos) { avgParentX += pPos.x; pCount++; }
            });
            if (pCount > 0) {
              const idealX = avgParentX / pCount;
              const currentPos = layoutPositions.get(id);
              let minX = (i === 0) ? -Infinity : layoutPositions.get(ids[i - 1]).x + 1.5;
              currentPos.x = Math.max(minX, idealX);
            }
          }
        });
      });

      // Bottom-up: Move parents over children (Upward Pressure)
      for (let l = validGrps.length - 2; l >= 0; l--) {
        const ids = validGrps[l];
        // Right-to-left pass
        for (let i = ids.length - 1; i >= 0; i--) {
          const id = ids[i];
          const cs = playerConnections.filter(c => c.parentId === id).map(c => c.childId);
          if (cs.length > 0) {
            let avgChildX = 0, cCount = 0;
            cs.forEach(cid => {
              const cPos = layoutPositions.get(cid);
              if (cPos) { avgChildX += cPos.x; cCount++; }
            });
            if (cCount > 0) {
              const idealX = avgChildX / cCount;
              const currentPos = layoutPositions.get(id);
              let maxX = (i === ids.length - 1) ? Infinity : layoutPositions.get(ids[i + 1]).x - 1.5;
              currentPos.x = Math.min(maxX, idealX);
            }
          }
        }
        // Left-to-right pass
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          const cs = playerConnections.filter(c => c.parentId === id).map(c => c.childId);
          if (cs.length > 0) {
            let avgChildX = 0, cCount = 0;
            cs.forEach(cid => {
              const cPos = layoutPositions.get(cid);
              if (cPos) { avgChildX += cPos.x; cCount++; }
            });
            if (cCount > 0) {
              const idealX = avgChildX / cCount;
              const currentPos = layoutPositions.get(id);
              let minX = (i === 0) ? -Infinity : layoutPositions.get(ids[i - 1]).x + 1.5;
              currentPos.x = Math.max(minX, idealX);
            }
          }
        }
      }

      // Greedy Compression Pass: Pull everything together if there's unused space
      validGrps.forEach((ids) => {
        // Pull from left to right
        for (let i = 1; i < ids.length; i++) {
          const id = ids[i];
          const currentPos = layoutPositions.get(id);
          const ps = playerConnections.filter(c => c.childId === id).map(c => c.parentId);
          const cs = playerConnections.filter(c => c.parentId === id).map(c => c.childId);

          let avgX = 0, count = 0;
          ps.forEach(pid => { const p = layoutPositions.get(pid); if (p) { avgX += p.x; count++; } });
          cs.forEach(cid => { const c = layoutPositions.get(cid); if (c) { avgX += c.x; count++; } });

          if (count > 0) {
            const ideal = avgX / count;
            if (ideal < currentPos.x) {
              const minX = layoutPositions.get(ids[i - 1]).x + 1.5;
              currentPos.x = Math.max(minX, ideal);
            }
          }
        }
        // Pull from right to left
        for (let i = ids.length - 2; i >= 0; i--) {
          const id = ids[i];
          const currentPos = layoutPositions.get(id);
          const ps = playerConnections.filter(c => c.childId === id).map(c => c.parentId);
          const cs = playerConnections.filter(c => c.parentId === id).map(c => c.childId);

          let avgX = 0, count = 0;
          ps.forEach(pid => { const p = layoutPositions.get(pid); if (p) { avgX += p.x; count++; } });
          cs.forEach(cid => { const c = layoutPositions.get(cid); if (c) { avgX += c.x; count++; } });

          if (count > 0) {
            const ideal = avgX / count;
            if (ideal > currentPos.x) {
              const maxX = layoutPositions.get(ids[i + 1]).x - 1.5;
              currentPos.x = Math.min(maxX, ideal);
            }
          }
        }
      });
    }

    // Final pass: Global centering of the whole tree structure
    let minTreeX = Infinity, maxTreeX = -Infinity;
    layoutPositions.forEach(p => {
      minTreeX = Math.min(minTreeX, p.x);
      maxTreeX = Math.max(maxTreeX, p.x);
    });
    const treeCenterOffset = (minTreeX + maxTreeX) / 2;
    layoutPositions.forEach(p => p.x -= treeCenterOffset);

    treeLayouts.push({ t, grps: validGrps, layoutPositions, rawWidth: maxTreeX - minTreeX + 1, rawHeight: validGrps.length });
    totalRawWidth += (maxTreeX - minTreeX + 1);
    maxTreeHeight = Math.max(maxTreeHeight, validGrps.length);
  });

  const availableW = FIELD_WIDTH - 400; // Increased padding to 200px on each side
  const availableH = FIELD_HEIGHT - 200;

  // Calculate the total horizontal range in "column units" across all trees
  let forestRawWidth = 0;
  treeLayouts.forEach((layout) => {
    let minX = Infinity, maxX = -Infinity;
    layout.layoutPositions.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); });
    forestRawWidth += (maxX - minX) + 2.0; // Spacing between trees
  });

  // Adaptive scaling: Remove the minSpacingX floor to ensure we NEVER run off the map.
  // We'll allow the graph to squish as much as needed to fit.
  let spx = Math.min(preferredSpacingX, availableW / Math.max(1, forestRawWidth));
  let spy = Math.max(minSpacingY * 1.2, Math.min(preferredSpacingY, availableH / Math.max(1, maxTreeHeight)));

  // Calculate vertical center of the field
  const startY = (FIELD_HEIGHT - (maxTreeHeight * spy)) / 2;

  // Track the actual bounds of all planned target positions across all trees
  let minTargetX = Infinity, maxTargetX = -Infinity;
  let currentTreeXOffset = 0;

  treeLayouts.forEach((layout) => {
    // Find the relative bounds of this specific tree
    let minTreeX = Infinity;
    layout.layoutPositions.forEach(p => { minTreeX = Math.min(minTreeX, p.x); });

    layout.grps.forEach((ids, l) => {
      ids.forEach(id => {
        const h = hares.find(ha => ha.rabbit.id == id);
        const pos = layout.layoutPositions.get(id);
        if (h && pos) {
          const tx = (currentTreeXOffset + (pos.x - minTreeX)) * spx;
          minTargetX = Math.min(minTargetX, tx);
          maxTargetX = Math.max(maxTargetX, tx);
          h.targetX = tx;
          h.targetY = startY + l * spy;
        }
      });
    });

    let minX = Infinity, maxX = -Infinity;
    layout.layoutPositions.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); });
    currentTreeXOffset += (maxX - minX) + 2.0;
  });

  // Final Pass: Shift everything to be perfectly centered in FIELD_WIDTH
  if (minTargetX !== Infinity) {
    const actualWidth = maxTargetX - minTargetX;
    const globalOffset = (FIELD_WIDTH - actualWidth) / 2 - minTargetX;

    hares.forEach(h => {
      if (h.targetX !== null) {
        h.targetX += globalOffset;
        // Final safety clamp to prevent physics-induced wall sticking
        // 64px sprite + 40px buffer = ~100px safety margin
        h.targetX = Math.max(100, Math.min(FIELD_WIDTH - 164, h.targetX));
      }
    });
  }
}

const sPanel = document.getElementById('selection-panel'), sName = document.getElementById('selected-name'), sSpec = document.getElementById('selected-species'), dnaBtn = document.getElementById('dna-test-btn'), tCount = document.getElementById('tests-count'), accBtn = document.getElementById('accuse-btn'), gOver = document.getElementById('game-over'), gTitle = document.getElementById('game-over-title'), gMsg = document.getElementById('game-over-msg');

function updateUI() {
  const stopwatch = document.getElementById('stopwatch');
  if (stopwatch) {
    if (gameState.startTime) {
      const currentEnd = gameState.endTime || Date.now();
      const diff = currentEnd - gameState.startTime;
      stopwatch.textContent = formatTime(diff);
      // Highlight the finished time
      if (gameState.isFinished) {
        stopwatch.style.color = '#2d8a2d'; // Finished green
        stopwatch.style.borderColor = '#2d8a2d';
      } else {
        stopwatch.style.color = '#2c3e50'; // Standard notebook text
        stopwatch.style.borderColor = '#5d3a1a';
      }
    } else {
      stopwatch.textContent = "00:00.0";
    }
  }

  const playAgainUi = document.getElementById('play-again-ui');
  if (gameState.isFinished) {
    if (playAgainUi) {
      playAgainUi.style.display = 'block';
      const hasMoreCases = gameState.caseIndex < MAX_CASES_PER_DAY - 1;
      playAgainUi.textContent = hasMoreCases ? 'SOLVE ANOTHER CASE' : 'PLAY AGAIN TOMORROW';
    }
    if (selectedHare) {
      sPanel.style.display = 'block';
      sName.textContent = `${selectedHare.rabbit.firstName} (${CURRENT_YEAR - selectedHare.rabbit.birthYear})`;

      const isDead = selectedHare.rabbit.isVictim || (selectedHare.rabbit.id === killerId && gameState.wasSuccess);
      const deadLabel = isDead ? '<div style="color: #ff4444; font-weight: bold; margin-top: 4px; font-size: 16px;">DECEASED</div>' : '';
      sSpec.innerHTML = `${selectedHare.rabbit.species}, ${selectedHare.rabbit.sex === 'M' ? 'Male' : 'Female'}${deadLabel}`;

      dnaBtn.style.display = 'none';
      accBtn.style.display = 'none';
      const hint = document.getElementById('selection-hint'); if (hint) hint.style.display = 'none';
    } else sPanel.style.display = 'none';
    return;
  }
  if (playAgainUi) playAgainUi.style.display = 'none';

  if (selectedHare) {
    sPanel.style.display = 'block';
    sName.textContent = `${selectedHare.rabbit.firstName} (${CURRENT_YEAR - selectedHare.rabbit.birthYear})`;

    const isDead = selectedHare.rabbit.isVictim || (selectedHare.rabbit.id === killerId && gameState.isFinished && gameState.wasSuccess);
    const deadLabel = isDead ? '<div style="color: #ff4444; font-weight: bold; margin-top: 4px; font-size: 16px;">DECEASED</div>' : '';
    sSpec.innerHTML = `${selectedHare.rabbit.species}, ${selectedHare.rabbit.sex === 'M' ? 'Male' : 'Female'}${deadLabel}`;

    const hint = document.getElementById('selection-hint');
    if (selectedHare.rabbit.isVictim) {
      if (hint) hint.style.display = 'none';
      dnaBtn.style.display = 'none';
      accBtn.style.display = 'none';
    } else {
      if (hint) hint.style.display = 'block';
      if (dnaTestsRemaining > 0) {
        dnaBtn.style.display = 'block'; accBtn.style.display = 'none';
        if (selectedHare.rabbit.isTested) {
          dnaBtn.disabled = true;
          dnaBtn.style.opacity = '0.5';
          const pct = selectedHare.rabbit.dnaMatchPct;
          dnaBtn.textContent = (pct !== null) ? `${pct}% MATCH` : 'TESTED';
        }
        else { dnaBtn.disabled = false; dnaBtn.style.opacity = '1.0'; dnaBtn.textContent = 'DNA TEST'; }
      } else { dnaBtn.style.display = 'none'; accBtn.style.display = 'block'; accBtn.style.opacity = '1.0'; }
    }
  } else sPanel.style.display = 'none';
}

function updateTranscriptUI(newEntry, speakerId) {
  const container = document.getElementById('transcript-container');
  const list = document.getElementById('transcript-list');

  function parseText(txt) {
    return txt.replace(/\[\[(\d+):(.*?)\]\]/g, (match, id, name) => {
      const r = rabbits.find(rb => rb.id == id);
      return `<span class="animal-mention" data-id="${id}" style="color: ${getHSL(r)}; cursor: pointer;">${name}</span>`;
    });
  }

  if (newEntry) {
    const speaker = rabbits.find(r => r.id === speakerId);
    const speakerPart = speaker ? `<span class="animal-mention" data-id="${speaker.id}" style="color: ${getHSL(speaker)}; cursor: pointer;">${speaker.firstName}</span>: ` : "";
    const parsedText = parseText(newEntry);

    // Trigger portrait animation
    portraitAnim.active = true;
    portraitAnim.timer = 0;

    const entryEl = document.createElement('div');
    entryEl.className = 'transcript-entry';
    if (speaker) {
      entryEl.style.borderLeft = `4px solid ${getHSL(speaker)}`;
    } else {
      entryEl.classList.add('system-message');
    }
    entryEl.innerHTML = `${speakerPart}${parsedText}`;

    // Prepend to make it reverse chronological (newest at top)
    list.prepend(entryEl);

    // Add click listeners for animal mentions
    entryEl.querySelectorAll('.animal-mention').forEach(span => {
      span.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(span.getAttribute('data-id'));
        const hare = hares.find(h => h.rabbit.id === id);
        if (hare) {
          const vw = canvas.width / camera.zoom;
          const vh = canvas.height / camera.zoom;

          // Calculate the visible height of the game world (excluding the Case Log at the bottom)
          const transcriptEl = document.getElementById('transcript-container');
          const visibleTranscriptHeight = isTranscriptOpen ? (transcriptEl.offsetHeight) : 120;
          const worldUIHeight = visibleTranscriptHeight / camera.zoom;
          const visibleWorldHeight = vh - worldUIHeight;

          // Center horizontally
          camera.x = hare.x + FRAME_SIZE - vw / 2;

          // Center vertically in the visible portion of the screen
          camera.y = hare.y + FRAME_SIZE - visibleWorldHeight / 2;

          constrainCamera();

          // Don't auto-select, just highlight them briefly
          highlightedAnimalIds.clear();
          highlightedAnimalIds.add(id);
          updateUI();
        }
      });
    });

    // When a new clue comes in, scroll to top so it's visible
    list.scrollTop = 0;
  }
}

let gameOverStep = 0;
let gameOverAnimTimer = 0;
let gameOverHandle = null;
let killerQuote = "";
let bladeY = 0;
let headPhysics = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, vrot: 0 };
let impactTime = 0; // Track when the blade hits the neck
let bloodTrails = []; // Individual drippy trails

const VILLAIN_QUOTES = [
  "I would have got away with it if it weren't for all the DNA evidence!",
  "Curses! My genetic footprint betrayed me!",
  "I thought I cleaned that weapon thoroughly...",
  "Genealogy? In a clover field? Unthinkable!",
  "My family tree has always been a bit rotten.",
  "I only did it for the prime clover patch!",
  "I thought '2nd cousin twice removed' meant they were removed from the suspect list!",
  "It was a crime of passion... and a very small amount of hay.",
  "The DNA doesn't lie, but my mother certainly did!",
  "I'm not a monster, I'm just biologically predisposed to mischief!",
  "Does this execution mean I'm off the family tree? Finally!",
  "You caught me, but you'll never find where I hid the good lettuce!",
  "I regret nothing! Well, maybe the murder. And the choice of getaway hop.",
  "Is it too late to ask for a DNA re-test? I have a very similar-looking twin!",
  "I blame my recessive genes for this poor decision making.",
  "I'd do it again for a single slice of apple!",
  "So this is what happens when you don't prune your family tree...",
  "Foiled by a bunch of amateur genealogists! How humiliating!",
  "I should have stuck to stealing carrots, it was much lower stakes.",
  "Let's be honest, {victim} had it coming.",
  "I'd kill {victim} again for half a carrot!",
  "{victim} always did have the most punchable face on the farm.",
  "It was either me or {victim}. I chose me.",
  "Don't look at me like that, {victim} stole my favorite clover patch first!",
  "I didn't mean to do it! I just tripped and {victim} happened to be in the way. Multiple times."
];

let introScrollHintTimeout = null;
let gameOverScrollHintTimeout = null;

function showGameOver(isWin) {
  const modal = document.getElementById('game-over');
  if (!modal) return;
  const scrollContainer = document.getElementById('game-over-scroll-container');
  const scrollHint = document.getElementById('game-over-scroll-hint');
  const title = document.getElementById('game-over-title');
  const msg = document.getElementById('game-over-msg');
  const nextBtn = document.getElementById('game-over-next');
  const viewFarmBtn = document.getElementById('game-over-view-farm');
  const gCanvas = document.getElementById('gameOverCanvas');
  if (!gCanvas) return;
  const gCtx = gCanvas.getContext('2d');

  // Reset scroll state for this step
  if (scrollContainer) scrollContainer.dataset.hasScrolled = 'false';

  // Function to check if scrolling is needed and show/hide hint
  function updateScrollHint() {
    if (!scrollContainer || !scrollHint) return;
    const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
    const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 20;

    if (!isScrollable || isAtBottom || scrollContainer.dataset.hasScrolled === 'true') {
      if (gameOverScrollHintTimeout) {
        clearTimeout(gameOverScrollHintTimeout);
        gameOverScrollHintTimeout = null;
      }
      scrollHint.style.display = 'none';
    } else {
      // Only start timer if not already running
      if (!gameOverScrollHintTimeout) {
        gameOverScrollHintTimeout = setTimeout(() => {
          if (scrollContainer.dataset.hasScrolled === 'false') scrollHint.style.display = 'block';
          gameOverScrollHintTimeout = null;
        }, 2000);
      }
    }
  }

  if (scrollHint) {
    scrollHint.onclick = () => {
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
        scrollContainer.dataset.hasScrolled = 'true';
      }
      scrollHint.style.display = 'none';
    };
  }

  // Attach scroll listener once
  if (scrollContainer && !scrollContainer.dataset.listenerAttached) {
    scrollContainer.addEventListener('scroll', () => {
      scrollContainer.dataset.hasScrolled = 'true';
      if (gameOverScrollHintTimeout) clearTimeout(gameOverScrollHintTimeout);
      if (scrollHint) scrollHint.style.display = 'none';
    });
    scrollContainer.dataset.listenerAttached = 'true';
  }

  // Reset animation state
  if (gameOverStep === 0) {
    gameOverAnimTimer = 0;
    bladeY = 0;
    headPhysics = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, vrot: 0 };
    impactTime = 0;
    bloodTrails = [];
  }

  // Only set endTime if not already finished (prevents overwriting on view-farm re-entry)
  if (!gameState.isFinished) {
    gameState.isFinished = true;
    gameState.wasSuccess = isWin;
    gameState.endTime = Date.now();
    saveGame();
  }

  modal.style.display = 'flex';
  if (gameOverHandle) cancelAnimationFrame(gameOverHandle);

  const killer = rabbits.find(r => r.id === killerId);
  if (!killerQuote) {
    const rawQuote = pick(VILLAIN_QUOTES);
    killerQuote = rawQuote.replace(/{victim}/g, victim.name);
  }

  const stats = calculateStreaks();
  let timeStr = "";
  if (gameState.startTime && gameState.endTime) {
    timeStr = `<br><span style="color: #44ff44; font-size: 24px; font-weight: bold;">TIME: ${formatTime(gameState.endTime - gameState.startTime)}</span>`;
  }

  const statsLine = `<br><br><div style="font-size: 14px; opacity: 0.8; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
    WIN STREAK: ${stats.win} (MAX: ${stats.maxWin})<br>
    ATTEMPT STREAK: ${stats.att} (MAX: ${stats.maxAtt})<br>
    DNA TESTS USED: ${3 - dnaTestsRemaining}
  </div>`;

  viewFarmBtn.onclick = () => {
    modal.style.display = 'none';
    updateUI(); // Refresh UI to show "Play Again" button
  };

  gCanvas.onclick = (e) => {
    // Only replay if we are on the final celebration screen (gameOverStep > 2)
    if (gameOverStep > 2 && isWin) {
      const rect = gCanvas.getBoundingClientRect();
      // Translate click coordinates to canvas internal coordinates
      const scaleX = gCanvas.width / rect.width;
      const scaleY = gCanvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const centerX = gCanvas.width / 2;
      const centerY = gCanvas.height / 2;

      // If clicked near the character portrait (96x96 box centered at centerX, centerY)
      if (x > centerX - 48 && x < centerX + 48 && y > centerY - 48 && y < centerY + 48) {
        gameOverAnimTimer = 30; // Skip the 0.5s hold on re-click
      }
    }
  };

  function gLoop() {
    // Dark Noir background instead of grass green
    gCtx.fillStyle = '#151515';
    gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);
    gCtx.imageSmoothingEnabled = false;

    const centerX = gCanvas.width / 2;
    const centerY = gCanvas.height / 2;

    // Draw a subtle vignette
    const vignette = gCtx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 150);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
    gCtx.fillStyle = vignette;
    gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);

    if (!isWin) {
      title.textContent = "WRONG SUSPECT!";
      title.style.color = "#ff4444";
      const innocent = selectedHare ? selectedHare.rabbit : { firstName: "The suspect", species: "animal", tint: { hue: 0, saturate: 0, brightness: 50 } };
      msg.innerHTML = `<span style="color: ${getHSL(innocent)}; font-weight: bold;">${innocent.firstName}</span> was innocent. It was <span style="color: ${getHSL(killer)}; font-weight: bold;">${killer.firstName}</span>!${timeStr}${statsLine}`;

      gameOverAnimTimer += 0.1;
      const frame = Math.floor(gameOverAnimTimer) % 6;
      gCtx.save();
      gCtx.filter = `hue-rotate(${killer.tint.hue}deg) saturate(${killer.tint.saturate}%) brightness(${killer.tint.brightness}%)`;
      gCtx.drawImage(sprites[killer.species].walk, frame * 32, 0, 32, 32, centerX - 32, centerY - 32, 64, 64);
      gCtx.restore();

      nextBtn.style.display = "none";
      viewFarmBtn.style.display = "block";

      const solveAnotherBtn = document.getElementById('game-over-solve-another');
      if (solveAnotherBtn) {
        const hasMoreCases = gameState.caseIndex < MAX_CASES_PER_DAY - 1;
        solveAnotherBtn.style.display = hasMoreCases ? "block" : "none";
        solveAnotherBtn.onclick = () => {
          if (gameOverHandle) cancelAnimationFrame(gameOverHandle);
          const playAgainBtn = document.getElementById('play-again-ui');
          if (playAgainBtn) playAgainBtn.click();
        };
      }

      updateScrollHint();
      gameOverHandle = requestAnimationFrame(gLoop);
      return;
    }

    if (gameOverStep === 0) {
      title.textContent = "CASE SOLVED!";
      title.style.color = "#44ff44";

      const stats = getStats();
      // Use pre-win count for rank display before the promotion screen
      const rank = getRank(isWin ? (stats.lifetimeWins - 1) : stats.lifetimeWins);
      const titlePrefix = rank.title.charAt(0) + rank.title.slice(1).toLowerCase();
      const det = gameState.detective;
      let detName = "THE DETECTIVE";
      if (det === 'fox') detName = "FILM NOIR FOX";
      else if (det === 'hare') detName = "SHERLOCK HARE";
      else if (det === 'boarot') detName = "HERCULE BOAROT";
      else if (det === 'marmot') detName = "MISS MARMOT";

      msg.innerHTML = `${titlePrefix} ${detName} has found the killer! <span style="color: ${getHSL(killer)}; font-weight: bold;">${killer.firstName}</span> has been apprehended.${timeStr}${statsLine}`;

      gCtx.save();
      gCtx.filter = `hue-rotate(${killer.tint.hue}deg) saturate(${killer.tint.saturate}%) brightness(${killer.tint.brightness}%)`;
      gCtx.drawImage(sprites[killer.species].idle, 0, 0, 32, 32, centerX - 32, centerY - 32, 64, 64);
      gCtx.restore();

      nextBtn.textContent = "NEXT";
      nextBtn.style.display = "block";
      viewFarmBtn.style.display = "none";
      const solveAnotherBtn = document.getElementById('game-over-solve-another');
      if (solveAnotherBtn) solveAnotherBtn.style.display = "none";
      updateScrollHint();
    } else if (gameOverStep === 1) {
      title.textContent = "THE CONFESSION";
      msg.innerHTML = `<span style="color: ${getHSL(killer)}; font-weight: bold;">${killer.firstName}</span>: "${killerQuote}"${timeStr}${statsLine}`;

      gCtx.save();
      gCtx.filter = `hue-rotate(${killer.tint.hue}deg) saturate(${killer.tint.saturate}%) brightness(${killer.tint.brightness}%)`;
      gCtx.drawImage(sprites[killer.species].idle, 0, 0, 32, 32, centerX - 32, centerY - 32, 64, 64);
      gCtx.restore();

      nextBtn.style.display = "block";
      viewFarmBtn.style.display = "none";
      const solveAnotherBtn = document.getElementById('game-over-solve-another');
      if (solveAnotherBtn) solveAnotherBtn.style.display = "none";
      updateScrollHint();
    } else if (gameOverStep === 2) {
      title.textContent = "JUSTICE";
      msg.innerHTML = `Now it's time to execute the killer.${timeStr}${statsLine}`;

      // Show view-farm button instead of next until execution is finished
      viewFarmBtn.style.display = "none";
      const solveAnotherBtn = document.getElementById('game-over-solve-another');
      if (solveAnotherBtn) solveAnotherBtn.style.display = "none";
      updateScrollHint();

      const spr = sprites[killer.species].idle;
      const bodyX = centerX - 32;

      // Decouple animal height from guillotine height for better alignment
      const neckY = centerY + 25;

      // Species-specific neck line (split point on the 32px sprite)
      let spriteNeckY = 16;
      if (killer.species === 'Grouse') spriteNeckY = 14; // Raise neck line (chop less shoulder)
      else if (killer.species === 'Deer') spriteNeckY = 10; // Deer has a very high neck
      else if (killer.species === 'Boar') spriteNeckY = 19;
      else if (killer.species === 'Fox') spriteNeckY = 22; // Move fox neck line down (was default 16)

      // Calculate bodyY such that the sprite's neck aligns with the guillotine's neckY
      const bodyY = neckY - (spriteNeckY * 2);

      // 1. Blade Logic (Update position)
      if (gameOverAnimTimer < 60) {
        bladeY = centerY - 70; // Tucked just below the top crossbar
        nextBtn.style.display = "none"; // Hide button until blade drops
      } else {
        // Fall all the way through the neck and stop below it
        bladeY = Math.min(neckY - 5, bladeY + 15);
      }
      const isCut = bladeY >= neckY - 25;

      // 2. Draw Slow Dripping Blood (Behind the wood)
      if (isCut) {
        const timeSinceImpact = gameOverAnimTimer - impactTime;
        if (bloodTrails.length === 0) {
          // Initialize individual drippy trails with randomized offsets and clusters
          for (let i = 0; i < 6; i++) {
            bloodTrails.push({
              x: centerX - 25 + Math.random() * 50,
              y: neckY + 15,
              length: 0,
              speed: 0.15 + Math.random() * 0.35,
              delay: Math.random() * 40,
              width: 2 + Math.random() * 4
            });
          }
        }

        gCtx.fillStyle = '#b00'; // Darker "drippy" blood red
        bloodTrails.forEach(trail => {
          if (timeSinceImpact > trail.delay) {
            trail.length = Math.min(140, trail.length + trail.speed);
            gCtx.fillRect(trail.x, trail.y, trail.width, trail.length);
            gCtx.beginPath();
            gCtx.arc(trail.x + trail.width / 2, trail.y + trail.length, (trail.width / 2 + 1) + Math.sin(gameOverAnimTimer / 15), 0, Math.PI * 2);
            gCtx.fill();
          }
        });
      }

      // 3. Draw Animal Body (Bottom half) - ALWAYS BEHIND THE STOCKS
      gCtx.save();
      gCtx.filter = `hue-rotate(${killer.tint.hue}deg) saturate(${killer.tint.saturate}%) brightness(${killer.tint.brightness}%)`;
      // Draw from spriteNeckY down to the bottom of the sprite (32px)
      gCtx.drawImage(spr, 0, spriteNeckY, 32, 32 - spriteNeckY, bodyX, neckY, 64, (32 - spriteNeckY) * 2);
      gCtx.restore();

      // 4. Draw the Slanted Blade (Inside the frame)
      gCtx.fillStyle = '#aaa'; // Metal
      gCtx.beginPath();
      gCtx.moveTo(centerX - 40, bladeY);
      gCtx.lineTo(centerX + 40, bladeY);
      gCtx.lineTo(centerX + 40, bladeY + 10);
      gCtx.lineTo(centerX - 40, bladeY + 30);
      gCtx.closePath();
      gCtx.fill();

      gCtx.strokeStyle = '#fff';
      gCtx.lineWidth = 2;
      gCtx.beginPath();
      gCtx.moveTo(centerX + 40, bladeY + 10);
      gCtx.lineTo(centerX - 40, bladeY + 30);
      gCtx.stroke();

      // 5. Draw THE STOCKS (Front face with cutout) - Covers the body and blade
      gCtx.save();
      gCtx.fillStyle = '#4a2c12';
      gCtx.beginPath();
      gCtx.rect(centerX - 40, neckY, 80, 30);
      gCtx.rect(centerX - 40, neckY - 20, 80, 20);
      gCtx.arc(centerX, neckY, 15, 0, Math.PI * 2, true);
      gCtx.fill();

      gCtx.strokeStyle = 'rgba(0,0,0,0.3)';
      gCtx.lineWidth = 2;
      gCtx.beginPath();
      gCtx.arc(centerX, neckY, 15, 0, Math.PI * 2);
      gCtx.stroke();
      gCtx.restore();

      // 6. Draw Animal Head (Top half) - ON TOP OF THE STOCKS
      if (!isCut) {
        gCtx.save();
        gCtx.filter = `hue-rotate(${killer.tint.hue}deg) saturate(${killer.tint.saturate}%) brightness(${killer.tint.brightness}%)`;
        // Draw from top of sprite (0) down to spriteNeckY
        gCtx.drawImage(spr, 0, 0, 32, spriteNeckY, bodyX, bodyY, 64, spriteNeckY * 2);
        gCtx.restore();
      } else {
        // Flying head physics with ground bounce and roll
        if (impactTime === 0) {
          headPhysics = { x: bodyX, y: bodyY, vx: 5 + Math.random() * 3, vy: -10 - Math.random() * 4, rot: 0, vrot: 0.2 };
          impactTime = gameOverAnimTimer;
          // Trigger haptic feedback on mobile
          triggerHaptic();
        }

        headPhysics.x += headPhysics.vx;
        headPhysics.y += headPhysics.vy;
        headPhysics.vy += 0.7; // Gravity

        // Ground collision (posts end at centerY + 80)
        const groundY = centerY + 80;
        const headHeight = spriteNeckY * 2;
        if (headPhysics.y + headHeight > groundY) {
          headPhysics.y = groundY - headHeight;
          headPhysics.vy *= -0.4; // Bounce damping
          headPhysics.vx *= 0.8; // Rolling friction

          // Stop rolling/bouncing if velocity is very low
          if (Math.abs(headPhysics.vy) < 1) headPhysics.vy = 0;
          if (Math.abs(headPhysics.vx) < 0.2) {
            headPhysics.vx = 0;
            headPhysics.vrot = 0;
          } else {
            // Roll rotation proportional to horizontal speed
            headPhysics.vrot = headPhysics.vx * 0.15;
          }
        }

        headPhysics.rot += headPhysics.vrot;

        gCtx.save();
        gCtx.filter = `hue-rotate(${killer.tint.hue}deg) saturate(${killer.tint.saturate}%) brightness(${killer.tint.brightness}%)`;
        gCtx.translate(headPhysics.x + 32, headPhysics.y + spriteNeckY);
        gCtx.rotate(headPhysics.rot);
        gCtx.drawImage(spr, 0, 0, 32, spriteNeckY, -32, -spriteNeckY, 64, spriteNeckY * 2);
        gCtx.restore();

        // 7. Draw Blood Splatter (Front layer)
        const timeSinceImpact = gameOverAnimTimer - impactTime;
        if (timeSinceImpact < 60) {
          gCtx.fillStyle = '#ff0000';
          for (let i = 0; i < 8; i++) {
            const bx = bodyX + 20 + Math.random() * 25;
            const by = neckY + Math.random() * 5;
            gCtx.fillRect(bx, by, 3, 3);
          }
        }
      }

      // 8. Draw Guillotine Frame (Posts and Top) - Drip trails go behind posts
      gCtx.fillStyle = '#5d3a1a'; // Dark wood
      gCtx.fillRect(centerX - 50, centerY - 80, 10, 160); // Left post
      gCtx.fillRect(centerX + 40, centerY - 80, 10, 160); // Right post
      gCtx.fillRect(centerX - 50, centerY - 90, 100, 15); // Top crossbar

      gameOverAnimTimer += 1;
      if (isCut && headPhysics.vx === 0) {
        nextBtn.style.display = "block";
        nextBtn.textContent = "SERVICE RECORD";
        const solveAnotherBtn = document.getElementById('game-over-solve-another');
        if (solveAnotherBtn) solveAnotherBtn.style.display = "none";
      }
    } else if (gameOverStep === 3) {
      title.textContent = "SERVICE RECORD";
      const stats = getStats();
      const winsBefore = stats.lifetimeWins - 1;
      const winsAfter = stats.lifetimeWins;

      const rankBefore = getRank(winsBefore);
      const rankAfter = getRank(winsAfter);
      const promoted = rankAfter.index > rankBefore.index;

      const isPromotedState = promoted && gameOverAnimTimer > 120;
      let currentWins = (gameOverAnimTimer > 60) ? winsAfter : winsBefore;

      if (promoted && gameOverAnimTimer === 120) {
        triggerHaptic();
      }

      // Unified Side-by-Side Layout
      // The internal canvas is 600px wide, so side-by-side always fits even if the screen is narrow.
      const totalPairW = isPromotedState ? 276 : 128;
      const startX = centerX - totalPairW / 2;
      const drawY = centerY - 64; // Centered vertically

      // Progress Boxes at the very top
      const progressY = drawY - 40;
      if (isPromotedState) {
        drawRankProgress(gCtx, centerX, progressY, winsAfter);
      } else {
        drawRankProgress(gCtx, centerX, progressY, currentWins, rankBefore);
      }

      const badge = getBadgeSprite(isPromotedState ? rankAfter.index : rankBefore.index);
      const rankTitle = isPromotedState ? rankAfter.title : rankBefore.title;

      if (badge) {
        gCtx.drawImage(badge, 0, 0, 64, 64, Math.floor(startX), Math.floor(drawY), 128, 128);
      }

      if (isPromotedState) {
        const spr = detectiveSprites[gameState.detective + '_celebration'];
        if (spr && spr.complete) {
          const frame = Math.floor((gameOverAnimTimer - 120) / 5) % 16;
          const sx = (frame % 4) * 64;
          const sy = Math.floor(frame / 4) * 64;
          gCtx.drawImage(spr, sx, sy, 64, 64, Math.floor(startX + 148), Math.floor(drawY), 128, 128);
        }
      }

      msg.innerHTML = `<div style="font-size: 48px; font-weight: bold; color: #44ff44; margin-bottom: 10px;">${currentWins}</div>
        <div style="font-size: 14px; opacity: 0.6; letter-spacing: 2px; margin-bottom: 20px;">CASES SOLVED</div>
        ${isPromotedState ? `<div style="color: #44ff44; font-weight: bold; font-size: 20px; animation: bounce-text 1s infinite; line-height: 1.2;">PROMOTED TO ${rankTitle}!</div>` : `<div style="font-size: 18px; font-weight: bold;">${rankTitle}</div>`}`;

      nextBtn.style.display = "block";
      nextBtn.textContent = "NEXT";
      viewFarmBtn.style.display = "none";
      gameOverAnimTimer++;
    } else {
      title.textContent = "HOORAY!";
      const det = gameState.detective;
      let detName = "THE DETECTIVE";
      if (det === 'fox') detName = "FILM NOIR FOX";
      else if (det === 'hare') detName = "SHERLOCK HARE";
      else if (det === 'boarot') detName = "HERCULE BOAROT";
      else if (det === 'marmot') detName = "MISS MARMOT";

      const stats = getStats();
      const rank = getRank(stats.lifetimeWins);
      const titlePrefix = rank.title.charAt(0) + rank.title.slice(1).toLowerCase();

      msg.innerHTML = `Justice is served. The farm is safe once again.<br><br><b>${titlePrefix} ${detName}</b> has cracked the case!${timeStr}${statsLine}`;

      const spr = detectiveSprites[det + '_celebration'];
      if (spr && spr.complete) {
        gCtx.save();

        let frame = 0;
        const HOLD_FIRST_FRAME = 30; // 0.5 seconds at 60fps
        const ANIM_FPS = 12;
        const TOTAL_FRAMES = 16;

        if (gameOverAnimTimer < HOLD_FIRST_FRAME) {
          frame = 0;
        } else {
          const animElapsed = gameOverAnimTimer - HOLD_FIRST_FRAME;
          frame = Math.floor(animElapsed / (60 / ANIM_FPS));
          if (frame >= TOTAL_FRAMES) {
            frame = TOTAL_FRAMES - 1; // Hold on last frame forever
          }
        }

        const sx = (frame % 4) * 64;
        const sy = Math.floor(frame / 4) * 64;
        gCtx.drawImage(spr, sx, sy, 64, 64, centerX - 64, centerY - 64, 128, 128);
        gCtx.restore();
      } else {
        const baseSpr = detectiveSprites[det];
        if (baseSpr && baseSpr.complete) {
          gCtx.save();
          gCtx.drawImage(baseSpr, 0, 0, 64, 64, centerX - 48, centerY - 48, 96, 96);
          gCtx.restore();
        } else {
          gCtx.font = "40px Arial";
          gCtx.textAlign = "center";
          gCtx.fillText("🏆", centerX, centerY);
        }
      }

      gameOverAnimTimer += 1;
      nextBtn.style.display = "none";
      viewFarmBtn.style.display = "block";

      const solveAnotherBtn = document.getElementById('game-over-solve-another');
      if (solveAnotherBtn) {
        const hasMoreCases = gameState.caseIndex < MAX_CASES_PER_DAY - 1;
        solveAnotherBtn.style.display = hasMoreCases ? "block" : "none";
        solveAnotherBtn.onclick = () => {
          if (gameOverHandle) cancelAnimationFrame(gameOverHandle);
          const playAgainBtn = document.getElementById('play-again-ui');
          if (playAgainBtn) playAgainBtn.click();
        };
      }

      updateScrollHint();
    }

    gameOverHandle = requestAnimationFrame(gLoop);
  }
  gLoop();
}

function drawAnimalPreview(canvasId, nameId, animal) {
  const canvas = document.getElementById(canvasId);
  const nameDiv = document.getElementById(nameId);
  if (!canvas || !nameDiv) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const tintedSpr = getTintedSprite(animal.rabbit || animal, 'idle');
  if (tintedSpr) {
    ctx.drawImage(tintedSpr, 0, 0, 32, 32, 0, 0, 64, 64);
  }

  const rabbit = animal.rabbit || animal;
  nameDiv.textContent = `${rabbit.firstName} (${CURRENT_YEAR - rabbit.birthYear})`;
  nameDiv.style.color = getHSL(rabbit);
}

function showDNAModal(animal) {
  const modal = document.getElementById('dna-modal');
  if (!modal) return;
  const dCanvas = document.getElementById('dnaCanvas');
  if (!dCanvas) return;
  const dCtx = dCanvas.getContext('2d');
  const title = document.getElementById('dna-modal-title');
  const resultBox = document.getElementById('dna-result-box');
  const resultText = document.getElementById('dna-result-text');
  const doneBtn = document.getElementById('dna-done-btn');
  const progressBar = document.getElementById('dna-progress-bar');

  const confirmStep = document.getElementById('dna-confirm-step');
  const animStep = document.getElementById('dna-anim-step');
  const confirmText = document.getElementById('dna-confirm-text');
  const confirmBtn = document.getElementById('dna-confirm-btn');
  const cancelBtn = document.getElementById('dna-cancel-btn');

  if (!confirmStep || !animStep) return;

  dnaTargetAnimal = animal;
  dnaAnimTimer = 0;
  modal.style.display = 'flex';
  confirmStep.style.display = 'flex';
  animStep.style.display = 'none';
  resultBox.style.display = 'none';
  progressBar.style.width = '0%';

  drawAnimalPreview('dna-confirm-canvas', 'dna-confirm-name', animal);
  confirmText.textContent = `Are you sure you want to test ${animal.rabbit.firstName}'s DNA? This will use 1 of your ${dnaTestsRemaining} remaining DNA tests.`;

  if (dnaHandle) cancelAnimationFrame(dnaHandle);

  cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };

  confirmBtn.onclick = () => {
    confirmStep.style.display = 'none';
    animStep.style.display = 'block';
    startDNAAnimation();
  };

  // Logic to determine result (moved into a function to be called after confirmation)
  let matchPct;
  let rel;
  let isKiller;

  function startDNAAnimation() {
    title.textContent = "ANALYZING DNA...";

    isKiller = animal.rabbit.id === killerId;
    isDnaSuccess = isKiller;

    // 1. Build ancestor maps including the individuals themselves (dist 0)
    const a1 = getAncestors(killerId);
    a1.set(killerId, 0);
    const a2 = getAncestors(animal.rabbit.id);
    a2.set(animal.rabbit.id, 0);

    // 2. Find all common ancestors (including self if same)
    const allCommon = [];
    a1.forEach((dist1, id) => {
      if (a2.has(id)) allCommon.push({ id, dist1, dist2: a2.get(id) });
    });

    // 3. Keep only MRCAs (Most Recent Common Ancestors)
    const mrcas = allCommon.filter(anc => {
      return !allCommon.some(other => {
        if (anc.id === other.id) return false;
        const otherAncestors = getAncestors(other.id);
        return otherAncestors.has(anc.id);
      });
    });

    // 4. Calculate Relationship Label
    rel = getRelationshipLabel(mrcas.filter(c => c.dist1 > 0 || c.dist2 > 0), killerId, animal.rabbit.id);

    // 5. Calculate match percentage
    kinshipMemo.clear();
    const k = kinship(killerId, animal.rabbit.id);
    matchPct = isKiller ? 100 : parseFloat((k * 200).toFixed(3));

    if (isKiller) {
      dnaResultText = `100% MATCH DETECTED!\n${animal.rabbit.firstName} is the killer!`;
    } else {
      const fuzzyRel = getDNARelationshipLabel(rel);
      const relText = rel ? `the killer's ${fuzzyRel}` : "no relation to the killer";
      dnaResultText = `${matchPct}% MATCH: ${animal.rabbit.firstName} the ${animal.rabbit.species.replace('_', ' ')} is ${relText}.`;
    }

    dnaLoop();
  }

  function dnaLoop() {
    dCtx.fillStyle = '#000';
    dCtx.fillRect(0, 0, dCanvas.width, dCanvas.height);
    dCtx.imageSmoothingEnabled = false;

    const centerX = dCanvas.width / 2;
    const centerY = dCanvas.height / 2;

    const det = gameState.detective;
    const labSpr = detectiveSprites[det + '_lab'];
    const dnaSpr = detectiveSprites.dna_test;

    // Phase 1: Animation (first 180 frames = 3 seconds at 60fps)
    if (dnaAnimTimer < 180) {
      // Update loading bar
      const progress = (dnaAnimTimer / 180) * 100;
      progressBar.style.width = `${progress}%`;

      // Draw detective in lab coat
      if (labSpr && labSpr.complete) {
        // Draw at 2x scale (192x192) to match other detective portraits (which are 64px source -> 128px screen)
        // Positioned on the left of the new 300px wide canvas
        dCtx.drawImage(labSpr, 0, 0, 96, 96, 10, 4, 192, 192);
      }

      // Draw DNA animation
      if (dnaSpr && dnaSpr.complete) {
        const frame = Math.floor((dnaAnimTimer % 60) / (60 / 16));
        const sx = (frame % 4) * 64;
        const sy = Math.floor(frame / 4) * 64;
        // Draw at 2x scale (128x128) to match the detective's pixel size
        dCtx.drawImage(dnaSpr, sx, sy, 64, 64, 210, 36, 128, 128);
      }
    } else {
      // Phase 2: Show Result
      progressBar.style.width = '100%';
      title.textContent = "RESULT READY";
      resultBox.style.display = 'block';
      resultText.textContent = dnaResultText;

      // Draw animal tested in the lab - center on the new 350px canvas
      const spr = sprites[animal.rabbit.species].idle;
      const centerX350 = dCanvas.width / 2;
      const centerY200 = dCanvas.height / 2;

      dCtx.save();
      dCtx.filter = `hue-rotate(${animal.rabbit.tint.hue}deg) saturate(${animal.rabbit.tint.saturate}%) brightness(${animal.rabbit.tint.brightness}%)`;
      dCtx.drawImage(spr, 0, 0, 32, 32, centerX350 - 32, centerY200 - 32, 64, 64);
      dCtx.restore();

      // Show result indicators (matching farm screen style)
      dCtx.textAlign = 'center';

      // Top Label (DNA connection)
      const fuzzyRel = getDNARelationshipLabel(isKiller ? "self" : rel);
      const dnaLabel = `🧬 ${fuzzyRel}`;
      dCtx.font = "bold 14px Arial";

      const words = dnaLabel.split(' ');
      let line = '';
      const lines = [];
      const maxWidth = 130;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = dCtx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const lineH = 18;
      const dH = lines.length * lineH + 6;
      const dW = Math.max(...lines.map(l => dCtx.measureText(l).width)) + 12;
      const dY = centerY200 - 65;

      dCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      dCtx.beginPath();
      dCtx.roundRect(centerX350 - dW / 2, dY - dH, dW, dH, 4);
      dCtx.fill();

      dCtx.fillStyle = '#44ff44';
      dCtx.textBaseline = 'middle';
      lines.forEach((l, i) => {
        dCtx.fillText(l.trim(), centerX350, dY - dH + (i + 0.5) * lineH + 3);
      });

      // Bottom Label (Name)
      const nameLabel = `${animal.rabbit.firstName} (${CURRENT_YEAR - animal.rabbit.birthYear})`;
      const nMetrics = dCtx.measureText(nameLabel);
      const nW = nMetrics.width + 12, nH = 20;
      dCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      dCtx.beginPath();
      dCtx.roundRect(centerX350 - nW / 2, centerY200 + 40, nW, nH, 4);
      dCtx.fill();
      dCtx.fillStyle = getHSL(animal.rabbit);
      dCtx.fillText(nameLabel, centerX350, centerY200 + 55);

      cancelAnimationFrame(dnaHandle);
      return;
    }

    dnaAnimTimer += 1;
    dnaHandle = requestAnimationFrame(dnaLoop);
  }

  doneBtn.onclick = () => {
    modal.style.display = 'none';
    if (dnaHandle) cancelAnimationFrame(dnaHandle);

    // Finalize the test in the game state
    animal.rabbit.isTested = true;
    animal.rabbit.dnaMatchPct = matchPct;
    const clickableName = `[[${animal.rabbit.id}:${animal.rabbit.firstName}]]`;
    if (isKiller) {
      animal.rabbit.dnaRelation = "Match";
      dnaTestsRemaining--;
      tCount.textContent = dnaTestsRemaining;
      const logMsg = `100% MATCH DETECTED! ${clickableName} is the killer!`;
      caseLog.push(`Case File: ${logMsg}`);
      updateTranscriptUI(logMsg);
      showGameOver(true);
    } else {
      const fuzzyRel = getDNARelationshipLabel(rel);
      animal.rabbit.dnaRelation = fuzzyRel;
      dnaTestsRemaining--;
      tCount.textContent = dnaTestsRemaining;
      const relText = rel ? `the killer's ${fuzzyRel}` : "no relation to the killer";
      const logMsg = `${matchPct}% MATCH: ${clickableName} is ${relText}.`;
      caseLog.push(`Case File: ${logMsg}`);
      updateTranscriptUI(logMsg);
      if (rel) { updateNecessaryConnections(); generateCluePool(true); }
      updateUI();
      saveGame();
    }
  };
}

let isTranscriptOpen = false;
function toggleTranscript() {
  const container = document.getElementById('transcript-container');
  const list = document.getElementById('transcript-list');
  const toggle = document.getElementById('transcript-toggle');

  isTranscriptOpen = !isTranscriptOpen;
  if (isTranscriptOpen) {
    container.classList.add('open');
    container.style.transform = 'translateX(-50%) translateY(0)';
    toggle.textContent = '▼ CLOSE CASE LOG';
  } else {
    container.classList.remove('open');
    // Use calc to slide down so exactly 120px remains visible
    container.style.transform = 'translateX(-50%) translateY(calc(100% - 120px))';
    toggle.textContent = '▲ OPEN CASE LOG';
  }
}

let hintTimer = null;
function hideSmartHint() {
  const hint = document.getElementById('smart-hint');
  if (!hint) return;
  hint.style.opacity = '0';
  setTimeout(() => { hint.style.display = 'none'; }, 500);
  if (hintTimer) clearTimeout(hintTimer);
}

function showSmartHint(text, duration = 8000) {
  const hint = document.getElementById('smart-hint');
  const hintText = document.getElementById('smart-hint-text');
  if (!hint || !hintText) return;

  hintText.textContent = text;
  hint.style.display = 'block';
  hint.style.opacity = '1';

  if (hintTimer) clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    hint.style.opacity = '0';
    setTimeout(() => { hint.style.display = 'none'; }, 500);
  }, duration);
}

let introStep = 0;
let introAnimFrame = 0;
let introAnimTimer = 0;
let introHandle = null;
let dnaHandle = null;
let dnaAnimTimer = 0;
let dnaTargetAnimal = null;
let dnaResultText = "";
let isDnaSuccess = false;
function showIntro(isMidGameChangeParam = false) {
  gameState.isMidGameChange = isMidGameChangeParam;
  const modal = document.getElementById('intro-modal');
  if (!modal) return;
  const scrollContainer = document.getElementById('intro-scroll-container');
  const scrollHint = document.getElementById('intro-scroll-hint');
  const title = document.getElementById('intro-title');
  const textContainer = document.getElementById('intro-text');
  const btn = document.getElementById('intro-next');
  const iCanvas = document.getElementById('introCanvas');
  if (!iCanvas) return;
  const iCtx = iCanvas.getContext('2d');
  const charSelection = document.getElementById('character-selection');

  // Reset scroll state for this step
  if (scrollContainer) scrollContainer.dataset.hasScrolled = 'false';

  modal.style.display = 'flex';
  updateScrollHint(); // Initial check

  // Function to check if scrolling is needed and show/hide hint
  function updateScrollHint() {
    if (!modal || !scrollContainer || !scrollHint || modal.style.display === 'none') return;
    const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
    const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 20;

    if (!isScrollable || isAtBottom || scrollContainer.dataset.hasScrolled === 'true') {
      if (introScrollHintTimeout) {
        clearTimeout(introScrollHintTimeout);
        introScrollHintTimeout = null;
      }
      scrollHint.style.display = 'none';
    } else {
      // Only start timer if not already running
      if (!introScrollHintTimeout) {
        introScrollHintTimeout = setTimeout(() => {
          if (scrollContainer.dataset.hasScrolled === 'false') scrollHint.style.display = 'block';
          introScrollHintTimeout = null;
        }, 2000);
      }
    }
  }

  if (scrollHint) {
    scrollHint.onclick = () => {
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
        scrollContainer.dataset.hasScrolled = 'true';
      }
      scrollHint.style.display = 'none';
    };
  }

  // Attach scroll listener once
  if (scrollContainer && !scrollContainer.dataset.listenerAttached) {
    scrollContainer.addEventListener('scroll', () => {
      scrollContainer.dataset.hasScrolled = 'true';
      if (introScrollHintTimeout) clearTimeout(introScrollHintTimeout);
      if (scrollHint) scrollHint.style.display = 'none';
    });
    scrollContainer.dataset.listenerAttached = 'true';
  }

  if (introHandle) cancelAnimationFrame(introHandle);

  const killer = rabbits.find(r => r.id === killerId);
  const relatives = rabbits.filter(r => r.dnaRelation).map(r => ({
    ...r,
    animal: hares.find(h => h.rabbit.id === r.id)
  }));

  // Check for cookie consent
  const hasConsent = localStorage.getItem('mysteryFarm_consent');
  const consentText = !hasConsent ? "<br><br><span style='font-size: 12px; opacity: 0.6;'>By continuing, you agree to our privacy terms and the use of local storage.</span>" : "";

  function introLoop() {
    if (modal.style.display === 'none') return;
    // Dark Noir background instead of grass green
    iCtx.fillStyle = '#151515';
    iCtx.fillRect(0, 0, iCanvas.width, iCanvas.height);
    iCtx.imageSmoothingEnabled = false;

    const centerX = iCanvas.width / 2;
    const centerY = iCanvas.height / 2;

    // Draw a subtle vignette
    const vignette = iCtx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 150);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
    iCtx.fillStyle = vignette;
    iCtx.fillRect(0, 0, iCanvas.width, iCanvas.height);

    // Handle character selection state
    const needsSelection = !gameState.detective;
    if ((needsSelection || gameState.isMidGameChange) && introStep === 0) {
      title.textContent = "CHOOSE YOUR CHARACTER";
      textContainer.textContent = "Select your detective to begin the investigation.";
      iCanvas.style.display = 'none';
      charSelection.style.display = 'flex';
      btn.style.display = 'none'; // Hide next button until character is picked

      // Draw the idle frames on the character canvases
      ['fox', 'hare', 'boarot', 'marmot'].forEach(char => {
        const c = document.getElementById(char + 'Canvas');
        if (c) {
          const ctx = c.getContext('2d');
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, 128, 128);
          ctx.drawImage(detectiveSprites[char], 0, 0, 64, 64, 0, 0, 128, 128);
        }
      });
    } else {
      iCanvas.style.display = 'block';
      charSelection.style.display = 'none';
      btn.style.display = 'inline-block';

      // If we started with selection, offset the following steps
      const step = needsSelection ? introStep - 1 : introStep;

      if (step === 0) {
        title.textContent = "A HEINOUS CRIME";
        textContainer.innerHTML = `<span style="color: ${getHSL(victim)}; font-weight: bold;">${victim.name}</span> the ${victim.species.replace('_', ' ')} was found dead in the clover field.${consentText}`;

        // Animate victim death (play once and stay)
        introAnimTimer += 0.08;
        const frame = Math.min(5, Math.floor(introAnimTimer));
        const spr = sprites[victim.species].death;
        // Draw at 2x size on the higher res canvas
        iCtx.save();
        iCtx.filter = `hue-rotate(${victim.tint.hue}deg) saturate(${victim.tint.saturate}%) brightness(${victim.tint.brightness}%)`;
        iCtx.drawImage(spr, frame * 32, 0, 32, 32, centerX - 32, centerY - 32, 64, 64);
        iCtx.restore();
        btn.textContent = "NEXT";
      } else if (step === 1) {
        title.textContent = "MURDER MOST FOUL!";
        textContainer.textContent = `DNA testing on the murder weapon reveals that the killer is a ${killer.sex === 'M' ? 'male' : 'female'} ${killer.species.replace('_', ' ')}.`;

        // Silhouette of killer
        const spr = sprites[killer.species].idle;
        iCtx.save();
        // Light background circle for silhouette
        iCtx.fillStyle = 'rgba(255,255,255,0.1)';
        iCtx.beginPath();
        iCtx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        iCtx.fill();

        iCtx.filter = 'brightness(0)';
        iCtx.drawImage(spr, 0, 0, 32, 32, centerX - 32, centerY - 32, 64, 64);
        iCtx.restore();

        // Red question mark
        iCtx.fillStyle = '#ff4444';
        iCtx.font = 'bold 48px Arial';
        iCtx.textAlign = 'center';
        iCtx.textBaseline = 'middle';
        iCtx.fillText('?', centerX, centerY - 5);
        btn.textContent = "NEXT";
      } else if (step === 2) {
        title.textContent = "DNA EVIDENCE";
        textContainer.textContent = "The killer has two distant relatives in the DNA database.";
        updateScrollHint();

        // Draw two relatives side-by-side
        relatives.forEach((rel, idx) => {
          const rx = idx === 0 ? centerX - 110 : centerX + 45; // Spread them slightly more
          const ry = centerY - 10;

          // DNA text ABOVE (matching game UI) - with wrapping
          iCtx.fillStyle = '#44ff44';
          iCtx.font = 'bold 11px Arial';
          iCtx.textAlign = 'center';

          const label = `🧬 ${rel.dnaRelation}`;
          const words = label.split(' ');
          let line = '';
          const lines = [];
          const maxWidth = 125; // Slightly wider for fuzzy labels

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = iCtx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              lines.push(line);
              line = words[n] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          lines.forEach((l, i) => {
            iCtx.fillText(l.trim(), rx + 32, ry - 15 - (lines.length - 1 - i) * 14);
          });

          // Sprite at 2x
          iCtx.save();
          iCtx.filter = `hue-rotate(${rel.tint.hue}deg) saturate(${rel.tint.saturate}%) brightness(${rel.tint.brightness}%)`;
          iCtx.drawImage(sprites[rel.species].idle, 0, 0, 32, 32, rx, ry, 64, 64);
          iCtx.restore();

          // Name BELOW
          iCtx.fillStyle = getHSL(rel);
          iCtx.font = 'bold 14px monospace';
          iCtx.textAlign = 'center';
          iCtx.fillText(rel.firstName, rx + 32, ry + 80);
        });
        btn.textContent = "NEXT";
      } else if (step === 3) {
        title.textContent = "SOLVE THE CASE";
        textContainer.innerHTML = "Click the speech bubbles to talk to animals for clues. Use your 3 DNA tests wisely.<br><br>Click one animal and then another to record a parent/child relationship and build your family tree.";

        // Draw a sample animal with a speech bubble
        const sample = rabbits.find(r => r.id !== killerId) || rabbits[0];
        const rx = centerX - 32;
        const ry = centerY - 20;

        iCtx.save();
        iCtx.filter = `hue-rotate(${sample.tint.hue}deg) saturate(${sample.tint.saturate}%) brightness(${sample.tint.brightness}%)`;
        iCtx.drawImage(sprites[sample.species].idle, 0, 0, 32, 32, rx, ry, 64, 64);
        iCtx.restore();

        // Speech bubble
        const bx = rx + 50, by = ry - 10, bw = 30, bh = 25, r = 5;
        const s = Math.max(0, Math.min(100, sample.tint.saturate)), l = Math.max(0, Math.min(100, sample.tint.brightness));
        iCtx.fillStyle = `hsla(${sample.tint.hue}, ${s}%, ${l}%, 0.9)`;
        iCtx.beginPath(); iCtx.moveTo(bx + r, by - bh); iCtx.lineTo(bx + bw - r, by - bh); iCtx.quadraticCurveTo(bx + bw, by - bh, bx + bw, by - bh + r); iCtx.lineTo(bx + bw, by - r); iCtx.quadraticCurveTo(bx + bw, by, bx + bw - r, by); iCtx.lineTo(bx + r, by); iCtx.quadraticCurveTo(bx, by, bx, by - r); iCtx.lineTo(bx, by - bh + r); iCtx.quadraticCurveTo(bx, by - bh, bx + r, by - bh); iCtx.closePath(); iCtx.fill();
        iCtx.beginPath(); iCtx.moveTo(bx + 5, by); iCtx.lineTo(bx + 15, by); iCtx.lineTo(bx + 10, by + 5); iCtx.fill();
        iCtx.fillStyle = 'white'; iCtx.font = "bold 14px Arial"; iCtx.textAlign = "center";
        iCtx.fillText('?', bx + bw / 2, by - bh / 2 + 5);

        btn.textContent = "START INVESTIGATION";
      } else {
        modal.style.display = 'none';
        localStorage.setItem('mysteryFarm_consent', 'true'); // Save consent when they finish the intro
        gameState.introFinished = true;
        if (!gameState.startTime) {
          gameState.startTime = Date.now();
          saveGame();
        }
        introStep = 0;
        introAnimTimer = 0;
        return;
      }
    }

    introHandle = requestAnimationFrame(introLoop);
  }

  introLoop();
}

function init() {
  if (IS_NATIVE) {
    document.body.classList.add('is-native');
  }

  // 1. Determine what case index we are on before running simulation
  const saved = localStorage.getItem('mysteryFarm_current');
  let savedData = saved ? JSON.parse(saved) : null;

  if (savedData && savedData.date === currentDateStr) {
    gameState.caseIndex = savedData.caseIndex || 0;
  } else {
    // If no save or old save, find the first available case index for today
    const stats = getStats();
    let nextIdx = 0;
    if (stats.history[currentDateStr]) {
      // Migrate old format to array if needed
      if (!Array.isArray(stats.history[currentDateStr])) {
        stats.history[currentDateStr] = [stats.history[currentDateStr]];
      }

      const dayResults = stats.history[currentDateStr];
      // Find first index that is not success or failure
      for (let i = 0; i < MAX_CASES_PER_DAY; i++) {
        if (!dayResults[i] || (dayResults[i].status !== 'success' && dayResults[i].status !== 'failure')) {
          nextIdx = i;
          break;
        }
      }
      // If all cases are done, stay on the last one
      if (dayResults.length >= MAX_CASES_PER_DAY && dayResults.slice(0, MAX_CASES_PER_DAY).every(r => r && (r.status === 'success' || r.status === 'failure'))) {
        nextIdx = MAX_CASES_PER_DAY - 1;
      }
    }
    gameState.caseIndex = nextIdx;
  }

  // 2. Initialize RNG for this case index and populate the world
  const seedInfo = getDailySeed(gameState.caseIndex);
  rngState = seedInfo.seed;
  currentCaseIdx = gameState.caseIndex;
  runSimulation();

  // 3. Try loading saved game progress (DNA tests, connections, etc.)
  // This depends on rabbits being already populated by runSimulation()
  const wasLoaded = loadGame();

  // 4. Create visual entities for the animals
  rabbits.forEach(r => hares.push(new Animal(r)));

  // 5. Position animals correctly in the tree (even if we didn't just load, 
  // though playerConnections will be empty in that case)
  updateTreeDiagram();

  updateUI();

  // Initialize environment details (same for everyone today)
  const detailCount = 800;
  for (let i = 0; i < detailCount; i++) {
    envDetails.push({
      x: random() * FIELD_WIDTH,
      y: random() * FIELD_HEIGHT,
      spriteIndex: Math.floor(random() * 6),
      scale: 2.0 + random() * 1.0
    });
  }

  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; constrainCamera(); });

  // Start somewhat zoomed in (1.0 zoom) instead of showing the whole field
  camera.zoom = 1.0;
  camera.x = FIELD_WIDTH / 2 - (canvas.width / camera.zoom) / 2;
  camera.y = FIELD_HEIGHT / 2 - (canvas.height / camera.zoom) / 2;
  constrainCamera();

  renderStaticLayer();

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX), y = e.clientY || (e.touches && e.touches[0].clientY);
    return { x: (x - rect.left) / camera.zoom + camera.x, y: (y - rect.top) / camera.zoom + camera.y, cx: x, cy: y };
  };

  const handleAct = (wx, wy, cx, cy) => {
    if (gameState.isFinished) {
      const hit = hares.find(h => {
        const sz = FRAME_SIZE * 2;
        return wx > h.x && wx < h.x + sz && wy > h.y && wy < h.y + sz;
      });
      selectedHare = hit || null;
      updateUI();
      return true;
    }

    for (const h of hares) {
      const clue = activeClues.get(h.rabbit.id);
      if (clue) {
        const isR = clue.isRead;
        const bubbleScale = isR ? camera.zoom : (camera.zoom * 0.4 + 0.6);
        const m = isR ? 0.6 : 1.0;
        const bw = 30 * bubbleScale * m, bh = 25 * bubbleScale * m;
        // World coordinates for bubble hitbox
        const sz = FRAME_SIZE * 2;
        const bx = h.x + sz * 0.8, by = h.y - (15 * camera.zoom) / camera.zoom; // approximate

        // Accurate screen-to-world hitbox check for scaled bubbles
        const sx = (h.x - camera.x) * camera.zoom, sy = (h.y - camera.y) * camera.zoom;
        const ssz = sz * camera.zoom;
        const sbx = sx + ssz * 0.8, sby = sy - 15 * camera.zoom;

        if (cx >= sbx - 5 && cx <= sbx + bw + 5 && cy >= sby - bh - 5 && cy <= sby + 5) {
          if (!isR) {
            clue.isRead = true;
            clue.generatedText = generateClueText(clue, h.rabbit.id);

            // Clear previous highlights and set new ones
            highlightedAnimalIds.clear();
            const mentionedIds = extractAnimalIdsFromText(clue.generatedText);
            mentionedIds.forEach(id => highlightedAnimalIds.add(id));
            // Also highlight the speaker if they're mentioned in first-person clues
            if (mentionedIds.has(h.rabbit.id)) {
              highlightedAnimalIds.add(h.rabbit.id);
            }

            caseLog.push(`${h.rabbit.firstName}: ${clue.generatedText}`);
            updateTranscriptUI(clue.generatedText, h.rabbit.id);
            gameState.hasClickedClue = true;
            hideSmartHint();
            saveGame();
          }
          notifications.push({ text: clue.generatedText, x: cx, y: cy - 20, timer: 360, timerMax: 360, color: '#fff' });
          // Disappear after click
          activeClues.delete(h.rabbit.id);
          return true;
        }
      }
    }
    for (const btn of xButtons) {
      const pSize = Math.max(1, Math.round(2 / Math.pow(camera.zoom, 0.4)));
      const hitRadius = (7 * pSize) / 2 + 10;
      if (Math.hypot(cx - btn.x, cy - btn.y) < hitRadius) {
        const conn = playerConnections.find(c => c.parentId === btn.pId && c.childId === btn.cId);
        if (conn) {
          playerConnections.splice(playerConnections.indexOf(conn), 1);
          updateTreeDiagram();
          saveGame();
          notifications.push({ text: "Removed", x: cx, y: cy - 20, timer: 60, timerMax: 60, color: '#f44' });
          return true;
        }
      }
    }
    const clicked = hares.find(h => wx >= h.x && wx <= h.x + FRAME_SIZE * 2 && wy >= h.y && wy <= h.y + FRAME_SIZE * 2);
    if (clicked) {
      if (selectedHare && selectedHare !== clicked) {
        const p = selectedHare.rabbit.birthYear <= clicked.rabbit.birthYear ? selectedHare : clicked, c = p === selectedHare ? clicked : selectedHare;
        if (playerConnections.some(conn => conn.childId === c.rabbit.id && rabbits.find(r => r.id === conn.parentId).sex === p.rabbit.sex)) notifications.push({ text: `${c.rabbit.firstName} already has a ${p.rabbit.sex === 'M' ? 'father' : 'mother'}!`, x: cx, y: cy, timer: 120, timerMax: 120 });
        else if (!playerConnections.some(conn => conn.parentId === p.rabbit.id && conn.childId === c.rabbit.id)) {
          playerConnections.push({ parentId: p.rabbit.id, childId: c.rabbit.id });
          gameState.hasCreatedConnection = true;
          hideSmartHint();
          updateTreeDiagram();
          saveGame();
          notifications.push({ text: "Linked!", x: cx, y: cy - 20, timer: 60, timerMax: 60, color: '#44ff44' });
          // Clear highlights when relationships are added
          highlightedAnimalIds.clear();
        }
        selectedHare = null;
      } else {
        selectedHare = clicked;

        // Center the camera on the selected animal, accounting for UI
        const vw = canvas.width / camera.zoom;
        const vh = canvas.height / camera.zoom;
        const transcriptEl = document.getElementById('transcript-container');
        const visibleTranscriptHeight = isTranscriptOpen ? (transcriptEl.offsetHeight) : 120;
        const visibleWorldHeight = vh - (visibleTranscriptHeight / camera.zoom);

        camera.x = clicked.x + FRAME_SIZE - vw / 2;
        camera.y = clicked.y + FRAME_SIZE - visibleWorldHeight / 2;
        constrainCamera();
      }
      updateUI(); return true;
    }
    return false;
  };

  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    selectedHare = null;
    updateUI();
  });

  canvas.addEventListener('mousedown', e => {
    const p = getPos(e);
    input.isDragging = true;
    input.startX = p.cx;
    input.startY = p.cy;
    input.lastMouseX = p.cx;
    input.lastMouseY = p.cy;
    input.hasMoved = false;
  });

  window.addEventListener('mousemove', e => {
    const p = getPos(e);
    let foundBubble = null;
    let foundX = null;

    // Check if hovering over a bubble
    for (const h of hares) {
      const clue = activeClues.get(h.rabbit.id);
      if (clue) {
        const bubbleScale = camera.zoom * 0.4 + 0.6;
        const bw = 30 * bubbleScale, bh = 25 * bubbleScale;
        const sx = (h.x - camera.x) * camera.zoom, sy = (h.y - camera.y) * camera.zoom;
        const ssz = (FRAME_SIZE * 2) * camera.zoom;
        const sbx = sx + ssz * 0.8, sby = sy - 15 * camera.zoom;

        if (p.cx >= sbx - 5 && p.cx <= sbx + bw + 5 && p.cy >= sby - bh - 5 && p.cy <= sby + 5) {
          foundBubble = h.rabbit.id;
          break;
        }
      }
    }

    // Check if hovering over an X button
    if (!foundBubble) {
      for (const btn of xButtons) {
        const pSize = Math.max(1, Math.round(2 / Math.pow(camera.zoom, 0.4)));
        const hitRadius = (7 * pSize) / 2 + 10;
        if (Math.hypot(p.cx - btn.x, p.cy - btn.y) < hitRadius) {
          foundX = btn;
          break;
        }
      }
    }

    if (hoveredBubbleId !== foundBubble || hoveredXButton !== foundX) {
      hoveredBubbleId = foundBubble;
      hoveredXButton = foundX;
      canvas.style.cursor = (hoveredBubbleId || hoveredXButton) ? 'pointer' : 'default';
    }

    if (input.isDragging) {
      const dx = e.clientX - input.lastMouseX;
      const dy = e.clientY - input.lastMouseY;
      if (Math.hypot(e.clientX - input.startX, e.clientY - input.startY) > 5) {
        input.hasMoved = true;
      }
      camera.x -= dx / camera.zoom;
      camera.y -= dy / camera.zoom;
      input.lastMouseX = e.clientX;
      input.lastMouseY = e.clientY;
      constrainCamera();
    }
  });

  window.addEventListener('mouseup', e => {
    if (input.isDragging && !input.hasMoved) {
      const p = getPos(e);
      if (!handleAct(p.x, p.y, p.cx, p.cy)) {
        selectedHare = null;
        updateUI();
      }
    }
    input.isDragging = false;
  });

  canvas.addEventListener('wheel', e => { e.preventDefault(); const p = getPos(e), oldZ = camera.zoom; camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom * Math.pow(1.1, -e.deltaY / 100))); camera.x += (p.x - camera.x) * (1 - oldZ / camera.zoom); camera.y += (p.y - camera.y) * (1 - oldZ / camera.zoom); constrainCamera(); }, { passive: false });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const p = getPos(e);
      input.isDragging = true;
      input.startX = p.cx;
      input.startY = p.cy;
      input.lastMouseX = p.cx;
      input.lastMouseY = p.cy;
      input.hasMoved = false;
    } else if (e.touches.length === 2) {
      input.isDragging = false;
      input.lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && input.isDragging) {
      const p = getPos(e);
      const dx = p.cx - input.lastMouseX;
      const dy = p.cy - input.lastMouseY;
      if (Math.hypot(p.cx - input.startX, p.cy - input.startY) > 10) {
        input.hasMoved = true;
      }
      camera.x -= dx / camera.zoom;
      camera.y -= dy / camera.zoom;
      input.lastMouseX = p.cx;
      input.lastMouseY = p.cy;
      constrainCamera();
    } else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), midX = (e.touches[0].clientX + e.touches[1].clientX) / 2, midY = (e.touches[0].clientY + e.touches[1].clientY) / 2, rect = canvas.getBoundingClientRect(), wx = (midX - rect.left) / camera.zoom + camera.x, wy = (midY - rect.top) / camera.zoom + camera.y, oldZ = camera.zoom; camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom * (d / input.lastTouchDist))); camera.x += (wx - camera.x) * (1 - oldZ / camera.zoom); camera.y += (wy - camera.y) * (1 - oldZ / camera.zoom); input.lastTouchDist = d; constrainCamera();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    if (input.isDragging && !input.hasMoved) {
      const rect = canvas.getBoundingClientRect();
      const p = { x: (input.lastMouseX - rect.left) / camera.zoom + camera.x, y: (input.lastMouseY - rect.top) / camera.zoom + camera.y, cx: input.lastMouseX, cy: input.lastMouseY };
      if (!handleAct(p.x, p.y, p.cx, p.cy)) {
        selectedHare = null;
        updateUI();
      }
    }
    input.isDragging = false;
    input.lastTouchDist = 0;
  });
  if (dnaBtn) {
    dnaBtn.addEventListener('pointerdown', e => e.stopPropagation());
    dnaBtn.addEventListener('click', e => {
      e.preventDefault(); if (gameState.isFinished || !selectedHare || dnaTestsRemaining <= 0 || selectedHare.rabbit.isTested) return;
      showDNAModal(selectedHare);
    });
  }

  if (accBtn) {
    accBtn.addEventListener('pointerdown', e => e.stopPropagation());
    accBtn.addEventListener('click', e => {
      e.preventDefault();
      if (gameState.isFinished || !selectedHare || dnaTestsRemaining > 0) return;

      const accModal = document.getElementById('accuse-modal');
      const accText = document.getElementById('accuse-confirm-text');
      const accConfirm = document.getElementById('accuse-confirm-btn');
      const accCancel = document.getElementById('accuse-cancel-btn');

      if (!accModal || !accText || !accConfirm || !accCancel) return;

      drawAnimalPreview('accuse-confirm-canvas', 'accuse-confirm-name', selectedHare);
      accText.textContent = `Are you absolutely certain ${selectedHare.rabbit.firstName} is the killer? A mistake here will end the investigation.`;
      accModal.style.display = 'flex';

      accCancel.onclick = () => {
        accModal.style.display = 'none';
      };

      accConfirm.onclick = () => {
        accModal.style.display = 'none';
        showGameOver(selectedHare.rabbit.id === killerId);
      };
    });
  }

  // Portrait click to change character or replay celebration
  const portraitBox = document.getElementById('portrait-box');
  if (portraitBox) {
    portraitBox.addEventListener('click', () => {
      if (gameState.isFinished) {
        if (gameState.wasSuccess) {
          // Replay celebration animation
          portraitAnim.active = true;
          portraitAnim.timer = 0;
        }
        return;
      }
      gameState.detective = null;
      introStep = 0;
      showIntro(true); // Pass true to correctly signal a mid-game character change
      saveGame();
    });
  }

  // Stats Modal
  document.querySelectorAll('.open-stats-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Hide other modals that might be open
      const modals = ['how-to-play-modal', 'limit-modal', 'intro-modal', 'about-modal', 'privacy-modal'];
      modals.forEach(m => { const el = document.getElementById(m); if (el) el.style.display = 'none'; });
      showStatsModal();
    });
  });

  // About Modal
  document.querySelectorAll('.open-about-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modals = ['how-to-play-modal', 'limit-modal', 'intro-modal', 'stats-modal', 'privacy-modal'];
      modals.forEach(m => { const el = document.getElementById(m); if (el) el.style.display = 'none'; });
      const aboutModal = document.getElementById('about-modal');
      if (aboutModal) aboutModal.style.display = 'flex';
    });
  });

  // Privacy Modal
  document.querySelectorAll('.open-privacy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modals = ['how-to-play-modal', 'limit-modal', 'intro-modal', 'stats-modal', 'about-modal'];
      modals.forEach(m => { const el = document.getElementById(m); if (el) el.style.display = 'none'; });
      const privacyModal = document.getElementById('privacy-modal');
      if (privacyModal) privacyModal.style.display = 'flex';
    });
  });

  // Close Buttons for new modals
  const closeAboutBtn = document.getElementById('close-about-btn');
  if (closeAboutBtn) {
    closeAboutBtn.addEventListener('click', () => {
      const aboutModal = document.getElementById('about-modal');
      if (aboutModal) {
        aboutModal.style.display = 'none';
        ensureIntroIfNecessary();
      }
    });
  }

  const closePrivacyBtn = document.getElementById('close-privacy-btn');
  if (closePrivacyBtn) {
    closePrivacyBtn.addEventListener('click', () => {
      const privacyModal = document.getElementById('privacy-modal');
      if (privacyModal) {
        privacyModal.style.display = 'none';
        ensureIntroIfNecessary();
      }
    });
  }

  const playAgainUI = document.getElementById('play-again-ui');
  if (playAgainUI) {
    playAgainUI.addEventListener('click', () => {
      const hasMoreCases = gameState.caseIndex < MAX_CASES_PER_DAY - 1;
      if (hasMoreCases) {
        showTransitionModal(() => {
          // Start next case
          gameState.caseIndex++;
          gameState.isFinished = false;
          gameState.wasSuccess = false;
          gameState.startTime = null;
          gameState.endTime = null;
          gameState.introFinished = false;
          gameState.hasClickedClue = false;
          gameState.hasCreatedConnection = false;
          gameState.statsUpdated = false;
          gameState.hint1Shown = false;
          gameState.hint2Shown = false;
          gameOverStep = 0;
          introStep = 0;
          killerQuote = "";
          gameOverAnimTimer = 0;
          isDnaSuccess = false;

          // Clear existing state
          const list = document.getElementById('transcript-list');
          if (list) list.innerHTML = '';
          const latest = document.getElementById('latest-clue');
          if (latest) latest.innerHTML = 'Case Log: No clues yet...';

          // Update seed and restart
          const seedInfo = getDailySeed(gameState.caseIndex);
          rngState = seedInfo.seed;
          currentCaseIdx = gameState.caseIndex;

          // Reset world
          hares.length = 0;
          playerConnections = [];
          caseLog = [];
          dnaTestsRemaining = 3;
          activeClues.clear();
          globallyIssuedClueIds.clear();
          highlightedAnimalIds.clear();

          runSimulation();
          rabbits.forEach(r => hares.push(new Animal(r)));

          // Reset transcript UI classes
          const container = document.getElementById('transcript-container');
          if (container) container.classList.remove('open');
          isTranscriptOpen = false;
          const toggle = document.getElementById('transcript-toggle');
          if (toggle) toggle.textContent = '▲ OPEN CASE LOG';

          // Hide game over modal if open
          const gameOverModal = document.getElementById('game-over');
          if (gameOverModal) gameOverModal.style.display = 'none';

          // Clear view farm state
          const viewFarmBtn = document.getElementById('game-over-view-farm');
          if (viewFarmBtn) viewFarmBtn.style.display = 'none';

          updateUI();
          saveGame();

          // Scroll to top of intro for the new case
          const scrollContainer = document.getElementById('intro-scroll-container');
          if (scrollContainer) {
            scrollContainer.scrollTop = 0;
            scrollContainer.dataset.hasScrolled = 'false';
          }
          showIntro();
        });
      } else {
        const limitModal = document.getElementById('limit-modal');
        if (limitModal) limitModal.style.display = 'flex';
      }
    });
  }

  const closeLimitBtn = document.getElementById('close-limit-btn');
  if (closeLimitBtn) {
    closeLimitBtn.addEventListener('click', () => {
      const limitModal = document.getElementById('limit-modal');
      if (limitModal) {
        limitModal.style.display = 'none';
        ensureIntroIfNecessary();
      }
    });
  }

  const closeStatsBtn = document.getElementById('close-stats-btn');
  if (closeStatsBtn) {
    closeStatsBtn.addEventListener('click', () => {
      const statsModal = document.getElementById('stats-modal');
      if (statsModal) {
        statsModal.style.display = 'none';
        const cheatInput = document.getElementById('stats-cheat-input');
        if (cheatInput) {
          cheatInput.style.display = 'none';
          cheatInput.value = '';
        }
        ensureIntroIfNecessary();
      }
    });
  }

  // Mobile Cheat Entry: 5-tap the top-left corner of the stats box to toggle a debug menu
  let statsClickCount = 0;
  let statsClickTimer = null;
  const cheatInput = document.getElementById('stats-cheat-input');
  const cheatZone = document.getElementById('stats-cheat-zone');

  if (cheatZone && cheatInput) {
    cheatZone.addEventListener('click', () => {
      statsClickCount++;
      if (statsClickTimer) clearTimeout(statsClickTimer);
      statsClickTimer = setTimeout(() => { statsClickCount = 0; }, 1000);

      if (statsClickCount >= 5) {
        statsClickCount = 0;
        cheatInput.style.display = 'block';
        cheatInput.focus();
      }
    });

    cheatInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const cmd = cheatInput.value;
        if (cmd) {
          const c = cmd.toLowerCase();
          if (c === "killer") {
            const k = rabbits.find(r => r.id === killerId);
            notifications.push({ text: `KILLER: ${k.firstName}`, x: canvas.width / 2, y: canvas.height / 2, timer: 180, timerMax: 180, color: '#ff4444' });
          } else if (c === "solve") {
            playerConnections = [];
            rabbits.forEach(r => {
              if (r.fatherId) playerConnections.push({ parentId: r.fatherId, childId: r.id });
              if (r.motherId) playerConnections.push({ parentId: r.motherId, childId: r.id });
            });
            updateTreeDiagram();
            saveGame();
            updateUI();
            notifications.push({ text: "GENEALOGY SYNCED", x: canvas.width / 2, y: canvas.height / 2, timer: 120, timerMax: 120, color: '#44ff44' });
          } else if (c === "species") {
            const k = rabbits.find(r => r.id === killerId);
            const currIdx = SPECIES.indexOf(k.species);
            k.species = SPECIES[(currIdx + 1) % SPECIES.length];
            notifications.push({ text: `KILLER: ${k.species}`, x: canvas.width / 2, y: canvas.height / 2, timer: 120, timerMax: 120, color: '#44ff44' });
          } else if (c === "wins") {
            const stats = getStats();
            stats.lifetimeWins = (stats.lifetimeWins || 0) + 25;
            saveStats(stats);
            showStatsModal(); // Refresh the view
            notifications.push({ text: `TOTAL WINS: ${stats.lifetimeWins} (+25)`, x: canvas.width / 2, y: canvas.height / 2, timer: 120, timerMax: 120, color: '#44ff44' });
          } else if (c === "reset") {
            localStorage.removeItem('mysteryFarm_current');
            localStorage.removeItem('mysteryFarm_stats');
            localStorage.removeItem('mysteryFarm_consent');
            localStorage.removeItem('mysteryFarm_detective');
            location.reload(true);
          }
        }
        cheatInput.value = '';
        cheatInput.style.display = 'none';
      }
    });
  }
  document.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
      const char = card.getAttribute('data-char');
      gameState.detective = char;
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // Auto-advance after selection
      setTimeout(() => {
        const scrollContainer = document.getElementById('intro-scroll-container');
        if (scrollContainer) scrollContainer.scrollTop = 0;

        if (gameState.isMidGameChange) {
          const modal = document.getElementById('intro-modal');
          modal.style.display = 'none';
          if (introHandle) cancelAnimationFrame(introHandle);
          gameState.isMidGameChange = false;
          introStep = 0;
          introAnimTimer = 0;
        } else {
          showIntro();
        }
        updateUI();
        saveGame();
      }, 500);
    });
  });

  const introNextBtn = document.getElementById('intro-next');
  if (introNextBtn) {
    introNextBtn.addEventListener('click', () => {
      introStep++;
      if (introScrollHintTimeout) { clearTimeout(introScrollHintTimeout); introScrollHintTimeout = null; }
      const scrollContainer = document.getElementById('intro-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
        scrollContainer.dataset.hasScrolled = 'false';
      }
      showIntro(gameState.isMidGameChange); // Preserve the mid-game change state
    });
  }

  const gameOverNextBtn = document.getElementById('game-over-next');
  if (gameOverNextBtn) {
    gameOverNextBtn.addEventListener('click', () => {
      gameOverStep++;
      gameOverAnimTimer = 0;
      if (gameOverScrollHintTimeout) { clearTimeout(gameOverScrollHintTimeout); gameOverScrollHintTimeout = null; }
      const scrollContainer = document.getElementById('game-over-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
        scrollContainer.dataset.hasScrolled = 'false';
      }
      showGameOver(gameState.wasSuccess);
    });
  }

  const helpBtn = document.getElementById('help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      const howToPlayModal = document.getElementById('how-to-play-modal');
      if (howToPlayModal) {
        howToPlayModal.style.display = 'flex';
        drawTutorialGuide();
      }
    });
  }

  const closeHowBtn = document.getElementById('close-how-btn');
  const howToPlayModal = document.getElementById('how-to-play-modal');

  const ensureIntroIfNecessary = () => {
    if (!gameState.isFinished && !gameState.startTime) {
      const isActuallyMidGame = (!gameState.detective || gameState.detective === "null") && (gameState.introFinished || gameState.isMidGameChange);
      showIntro(isActuallyMidGame);
    }
  };

  if (closeHowBtn && howToPlayModal) {
    closeHowBtn.addEventListener('click', () => {
      howToPlayModal.style.display = 'none';
      ensureIntroIfNecessary();
    });
  }

  // Generic Modal Close Logic (Click Outside & Escape Key)
  const cancelableModals = ['stats-modal', 'how-to-play-modal', 'about-modal', 'privacy-modal', 'limit-modal', 'transition-modal'];

  cancelableModals.forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          // Extra cleanup for stats modal
          if (id === 'stats-modal') {
            const cheatInput = document.getElementById('stats-cheat-input');
            if (cheatInput) { cheatInput.style.display = 'none'; cheatInput.value = ''; }
          }
          ensureIntroIfNecessary();
        }
      });
    }
  });

  const transcriptHeader = document.getElementById('transcript-header');
  if (transcriptHeader) {
    transcriptHeader.addEventListener('click', toggleTranscript);
  }

  // Cheat codes
  let cheatBuffer = "";
  window.addEventListener('keyup', e => {
    if (e.key === 'Escape') {
      // 1. Close cancelable modals first
      const cancelableModals = ['stats-modal', 'how-to-play-modal', 'about-modal', 'privacy-modal', 'limit-modal', 'transition-modal'];
      let modalClosed = false;
      cancelableModals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal && modal.style.display === 'flex') {
          modal.style.display = 'none';
          modalClosed = true;
          // Extra cleanup for stats modal
          if (id === 'stats-modal') {
            const cheatInput = document.getElementById('stats-cheat-input');
            if (cheatInput) { cheatInput.style.display = 'none'; cheatInput.value = ''; }
          }
        }
      });

      if (modalClosed) {
        ensureIntroIfNecessary();
      }

      // 2. If no modal was closed, deselect current animal
      if (!modalClosed) {
        selectedHare = null;
        updateUI();
      }
    }
    cheatBuffer = (cheatBuffer + e.key.toLowerCase()).slice(-10);

    // "killer" - Reveals the culprit in the log
    if (cheatBuffer.endsWith("killer")) {
      const k = rabbits.find(r => r.id === killerId);
      const msg = `DEBUG: The killer is [[${k.id}:${k.firstName}]] (a ${k.sex === 'M' ? 'male' : 'female'} ${k.species})`;
      updateTranscriptUI(msg, k.id);
      cheatBuffer = "";
    }

    // "reset" - Wipes EVERYTHING and reloads
    if (cheatBuffer.endsWith("reset")) {
      localStorage.removeItem('mysteryFarm_current');
      localStorage.removeItem('mysteryFarm_stats');
      localStorage.removeItem('mysteryFarm_consent');
      localStorage.removeItem('mysteryFarm_detective');
      location.reload(true);
    }

    // "solve" - Erases current tree and builds the 100% correct one
    if (cheatBuffer.endsWith("solve")) {
      playerConnections = [];
      rabbits.forEach(r => {
        if (r.fatherId) playerConnections.push({ parentId: r.fatherId, childId: r.id });
        if (r.motherId) playerConnections.push({ parentId: r.motherId, childId: r.id });
      });
      updateTreeDiagram();
      saveGame();
      updateUI();
      notifications.push({ text: "GENEALOGY SYNCED", x: canvas.width / 2, y: canvas.height / 2, timer: 120, timerMax: 120, color: '#44ff44' });
      cheatBuffer = "";
    }

    // "species" - Cycles the killer's species for observation
    if (cheatBuffer.endsWith("species")) {
      const k = rabbits.find(r => r.id === killerId);
      const currIdx = SPECIES.indexOf(k.species);
      k.species = SPECIES[(currIdx + 1) % SPECIES.length];
      notifications.push({ text: `KILLER SPECIES: ${k.species}`, x: canvas.width / 2, y: canvas.height / 2, timer: 120, timerMax: 120, color: '#44ff44' });
      cheatBuffer = "";
    }

    // "wins" - Manually set lifetime wins
    if (cheatBuffer.endsWith("wins")) {
      const stats = getStats();
      // Increment by 25 each time to avoid prompt() which is often blocked in native environments
      stats.lifetimeWins = (stats.lifetimeWins || 0) + 25;
      saveStats(stats);
      notifications.push({ text: `TOTAL WINS: ${stats.lifetimeWins} (+25)`, x: canvas.width / 2, y: canvas.height / 2, timer: 120, timerMax: 120, color: '#44ff44' });
      updateUI();
      cheatBuffer = "";
    }
  });

  if (gameState.isFinished) {
    showGameOver(gameState.wasSuccess);
  } else if (!wasLoaded || !gameState.introFinished || !gameState.detective || gameState.detective === "null") {
    // If they have no detective but intro was finished, it was a mid-game change interrupted by a page reload
    const isActuallyMidGame = (!gameState.detective || gameState.detective === "null") && (gameState.introFinished || gameState.isMidGameChange);
    showIntro(isActuallyMidGame);
  }

  loop();
}

function constrainCamera() {
  const vw = canvas.width / camera.zoom, vh = canvas.height / camera.zoom;

  // Define fixed padding in world units to allow centering animals at edges.
  // We allow the camera to see up to half a screen width/height past the edge.
  const padX = vw / 2;
  const padY = vh / 2;

  const minX = -padX;
  const maxX = FIELD_WIDTH - vw + padX;
  const minY = -padY;
  const maxY = FIELD_HEIGHT - vh + padY;

  camera.x = Math.max(minX, Math.min(maxX, camera.x));
  camera.y = Math.max(minY, Math.min(maxY, camera.y));
}

function loop() {
  // Check for date change (midnight crossover)
  if (++lastDateCheckTime >= DATE_CHECK_INTERVAL) {
    lastDateCheckTime = 0;
    const { dateStr: checkDate } = getDailySeed();
    if (checkDate !== currentDateStr) {
      // Only reload if the game is finished AND the game over modal isn't open.
      // This ensures they see their celebration/stats before the new day starts.
      const gameOverModal = document.getElementById('game-over');
      const isGameOverVisible = gameOverModal && gameOverModal.style.display === 'flex';

      if (gameState.isFinished && !isGameOverVisible) {
        location.reload();
        return;
      }
    }
  }

  // Smart Hint Checks
  if (!gameState.isFinished && gameState.introFinished && gameState.startTime) {
    const now = Date.now();
    const timeSinceStart = now - gameState.startTime;

    // Hint 1: Click speech bubbles (30s)
    if (!gameState.hasClickedClue && timeSinceStart > 30000 && !gameState.hint1Shown) {
      showSmartHint("Tap the speech bubbles over the animals to find clues!");
      gameState.hint1Shown = true;
      saveGame();
    }

    // Hint 2: Create connection (60s)
    if (!gameState.hasCreatedConnection && timeSinceStart > 60000 && !gameState.hint2Shown) {
      showSmartHint("To build the family tree, select an animal, then tap another to link them. The older animal is automatically set as the parent.");
      gameState.hint2Shown = true;
      saveGame();
    }
  }

  if (!gameState.isFinished && ++lastClueTime >= CLUE_INTERVAL) {
    lastClueTime = 0;
    if (activeClues.size < 3) {
      // Clean pool of already known connections
      const issuedIds = new Set([
        ...Array.from(activeClues.values()).map(c => c.id),
        ...clueQueue.map(c => c.id),
        ...globallyIssuedClueIds
      ]);

      // If queue is empty, pick a new clue/group from pool
      if (clueQueue.length === 0) {
        const avail = cluePool.filter(c => {
          if (issuedIds.has(c.id)) return false;

          const conn = c.conn;
          if (conn.parentId && conn.childId) {
            if (playerConnections.some(pc => pc.parentId === conn.parentId && pc.childId === conn.childId)) return false;
          } else if (conn.type === 'couple') {
            const c1 = playerConnections.filter(pc => pc.parentId === conn.p1).map(pc => pc.childId);
            const c2 = playerConnections.filter(pc => pc.parentId === conn.p2).map(pc => pc.childId);
            if (c1.some(id => c2.includes(id))) return false;
          } else if (conn.type === 'sibling') {
            const p1 = playerConnections.filter(pc => pc.childId === conn.a).map(pc => pc.parentId);
            const p2 = playerConnections.filter(pc => pc.childId === conn.b).map(pc => pc.parentId);
            if (p1.some(id => p2.includes(id))) return false;
          } else if (conn.type === 'grandparent') {
            const parents = playerConnections.filter(pc => pc.childId === conn.gc).map(pc => pc.parentId);
            if (parents.some(pid => playerConnections.some(pc => pc.parentId === conn.gp && pc.childId === pid))) return false;
          }
          return true;
        });

        if (avail.length > 0) {
          // Prioritize necessary clues over extra clues (3:1 weight)
          const necessary = avail.filter(c => c.type === 'necessary');
          const extra = avail.filter(c => c.type === 'extra');

          let choice;
          if (necessary.length > 0 && (extra.length === 0 || random() < 0.75)) {
            choice = pick(necessary);
          } else {
            choice = pick(extra);
          }

          if (choice.groupId) {
            const group = cluePool.filter(c => c.groupId === choice.groupId && !issuedIds.has(c.id));
            clueQueue.push(...group);
          } else {
            clueQueue.push(choice);
          }
        }
      }

      // Issue from queue
      if (clueQueue.length > 0) {
        while (clueQueue.length > 0) {
          const check = clueQueue[0];
          let redundant = globallyIssuedClueIds.has(check.id);
          if (!redundant && check.conn.parentId && check.conn.childId) {
            if (playerConnections.some(pc => pc.parentId === check.conn.parentId && pc.childId === check.conn.childId)) redundant = true;
          }
          if (redundant) { clueQueue.shift(); continue; }
          break;
        }

        if (clueQueue.length > 0) {
          const c = clueQueue.shift();
          let tid = c.speakerId;
          if (!tid || activeClues.has(tid)) {
            const free = hares.filter(h => !activeClues.has(h.rabbit.id) && !h.rabbit.isVictim);
            if (free.length > 0) tid = pick(free).rabbit.id; else tid = null;
          }
          if (tid) {
            activeClues.set(tid, c);
            globallyIssuedClueIds.add(c.id);
            saveGame();
          }
        }
      }
    }
  }
  ctx.fillStyle = '#3e8948';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  // Draw static background layer (grid, grass, and boundaries)
  if (staticCanvas) {
    ctx.drawImage(
      staticCanvas,
      Math.floor(-camera.x * camera.zoom),
      Math.floor(-camera.y * camera.zoom),
      Math.floor(FIELD_WIDTH * camera.zoom),
      Math.floor(FIELD_HEIGHT * camera.zoom)
    );
  }

  ctx.save();
  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Dynamically position below the Help button/Stopwatch to account for iPhone safe areas
  let watermarkY = 75;
  const helpBtn = document.getElementById('help-btn');
  if (helpBtn) {
    const rect = helpBtn.getBoundingClientRect();
    // Use the bottom of the help button + a small margin
    watermarkY = rect.bottom + 5;
  }

  ctx.fillText('mystery.farm', 20, watermarkY);
  ctx.restore();

  ctx.save();

  // Group connections into "Family Units" (Unions)
  const unions = new Map(); // Key: sorted parent IDs string, Value: { parents: [], children: [] }
  const childToParents = new Map();
  playerConnections.forEach(c => {
    if (!childToParents.has(c.childId)) childToParents.set(c.childId, []);
    childToParents.get(c.childId).push(c.parentId);
  });

  childToParents.forEach((parents, cid) => {
    const key = parents.sort((a, b) => a - b).join(',');
    if (!unions.has(key)) unions.set(key, { parents, children: [] });
    unions.get(key).children.push(cid);
  });

  // Assign distinct vertical offsets to unions within the same generation
  const levels = new Map();
  // Create a quick lookup map for animals to avoid repeated hares.find()
  const idToAnimal = new Map();
  hares.forEach(h => idToAnimal.set(h.rabbit.id, h));

  unions.forEach((u, key) => {
    const ps = u.parents.map(id => idToAnimal.get(id)).filter(Boolean);
    if (ps.length === 0) return;

    // Use targetY for stable level detection, fallback to current y
    const avgY = ps.reduce((sum, p) => sum + (p.targetY ?? p.y), 0) / ps.length;
    const avgX = ps.reduce((sum, p) => sum + (p.targetX ?? p.x), 0) / ps.length;
    const levelKey = Math.round(avgY / 50); // Group by approximate vertical level

    if (!levels.has(levelKey)) levels.set(levelKey, []);
    levels.get(levelKey).push({ key, avgX });
  });

  const unionOffsets = new Map();
  levels.forEach((units) => {
    // Sort by horizontal position to keep offsets somewhat orderly
    units.sort((a, b) => a.avgX - b.avgX);
    units.forEach((unit, idx) => {
      // Distribute offsets in a pattern: 0, 15, -15, 30, -30...
      const magnitude = Math.ceil(idx / 2) * 15;
      const sign = idx % 2 === 0 ? 1 : -1;
      unionOffsets.set(unit.key, idx === 0 ? 0 : sign * magnitude);
    });
  });

  xButtons = []; // Store X button positions to draw them last

  unions.forEach((u, key) => {
    const ps = u.parents.map(id => idToAnimal.get(id)).filter(Boolean);
    const cs = u.children.map(id => idToAnimal.get(id)).filter(Boolean);
    if (ps.length === 0 || cs.length === 0) return;

    const isHighlighted = selectedHare && (ps.includes(selectedHare) || cs.includes(selectedHare));

    ctx.save();
    if (isHighlighted) {
      ctx.strokeStyle = '#44ff44';
      ctx.lineWidth = 3.5 * camera.zoom;
      ctx.shadowBlur = 8 * camera.zoom;
      ctx.shadowColor = 'rgba(68, 255, 68, 0.4)';
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2 * camera.zoom;
    }

    // Calculate vertical mid-point for the union bar
    const avgPy = ps.reduce((sum, p) => sum + (p.y + FRAME_SIZE), 0) / ps.length;
    const avgCy = cs.reduce((sum, c) => sum + (c.y + FRAME_SIZE), 0) / cs.length;

    // Use the distinct pre-calculated offset for this level
    const stagger = unionOffsets.get(key) || 0;
    const midY = (avgPy + avgCy) / 2 + stagger;

    const screenMidY = (midY - camera.y) * camera.zoom;
    const parentXRange = { min: Infinity, max: -Infinity };
    const childXRange = { min: Infinity, max: -Infinity };

    // 1. Draw vertical stems from parents to midY
    ps.forEach(p => {
      const px = (p.x - camera.x + FRAME_SIZE) * camera.zoom;
      const py = (p.y - camera.y + FRAME_SIZE) * camera.zoom;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, screenMidY); ctx.stroke();
      parentXRange.min = Math.min(parentXRange.min, px);
      parentXRange.max = Math.max(parentXRange.max, px);
    });

    // 2. Draw vertical stems from midY to children
    cs.forEach(c => {
      const cx = (c.x - camera.x + FRAME_SIZE) * camera.zoom;
      const cy = (c.y - camera.y + FRAME_SIZE) * camera.zoom;
      ctx.beginPath(); ctx.moveTo(cx, screenMidY); ctx.lineTo(cx, cy); ctx.stroke();
      childXRange.min = Math.min(childXRange.min, cx);
      childXRange.max = Math.max(childXRange.max, cx);
    });

    // 3. Draw the horizontal "Union Bar"
    const barMinX = Math.min(parentXRange.min, childXRange.min);
    const barMaxX = Math.max(parentXRange.max, childXRange.max);
    ctx.beginPath(); ctx.moveTo(barMinX, screenMidY); ctx.lineTo(barMaxX, screenMidY); ctx.stroke();

    // 4. Record "X" buttons for each relationship in this union
    if (!gameState.isFinished) {
      ps.forEach(p => {
        cs.forEach(c => {
          if (selectedHare === p || selectedHare === c) {
            const px = (p.x - camera.x + FRAME_SIZE) * camera.zoom;
            const py = (p.y - camera.y + FRAME_SIZE) * camera.zoom;
            const cx = (c.x - camera.x + FRAME_SIZE) * camera.zoom;
            const cy = (c.y - camera.y + FRAME_SIZE) * camera.zoom;

            let bx, by;
            if (selectedHare === p) {
              // Place on the child's vertical stem, 50% of the way to the child
              bx = cx;
              by = screenMidY + (cy - screenMidY) * 0.5;
            } else {
              // Place on the parent's vertical stem, 50% of the way to the parent
              bx = px;
              by = screenMidY + (py - screenMidY) * 0.5;
            }

            xButtons.push({ x: bx, y: by, pId: p.rabbit.id, cId: c.rabbit.id });
          }
        });
      });
    }

    ctx.restore();
  });
  ctx.restore();

  hares.forEach(h => h.update());

  // Pass 1: Draw sprites sorted by Y
  hares.slice().sort((a, b) => a.y - b.y).forEach(h => h.drawSprite());

  // Pass 2: Draw labels sorted by X ascending (so rightmost labels sit on top)
  // This ensures that the start of every name remains visible even if overlapped.
  hares.slice().sort((a, b) => a.x - b.x).forEach(h => h.drawLabels());

  // Update stopwatch display in real-time
  updateUI();

  // 4. Draw recorded "X" buttons on TOP of animals/labels
  if (!gameState.isFinished) {
    xButtons.forEach(btn => {
      const isHovered = hoveredXButton === btn;
      drawPixelX(ctx, btn.x, btn.y, camera.zoom, isHovered);
    });
  }

  // Render notifications/rich text
  for (let i = notifications.length - 1; i >= 0; i--) {
    const n = notifications[i];
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'black';
    ctx.globalAlpha = Math.min(1, n.timer / 30);

    const maxT = n.timerMax || 360, fO = (maxT - n.timer) * 0.2, tY = n.y - fO;
    let cY = Math.max(40, tY);

    // Allow room for transcript at bottom
    const transcriptEl = document.getElementById('transcript-container');
    const visibleTranscriptHeight = isTranscriptOpen ? (transcriptEl.offsetHeight) : 120;
    const bottomLimit = canvas.height - visibleTranscriptHeight - 20;
    cY = Math.min(cY, bottomLimit);

    // Simple rich text drawing for canvas
    const text = n.text;
    const cleanText = text.replace(/\[\[\d+:(.*?)\]\]/g, '$1');
    const totalWidth = ctx.measureText(cleanText).width;

    // Horizontal clamping
    const padding = 20;
    let currentX = n.x - totalWidth / 2;
    if (currentX < padding) currentX = padding;
    if (currentX + totalWidth > canvas.width - padding) currentX = canvas.width - padding - totalWidth;

    const parts = text.split(/(\[\[\d+:.*?\]\])/g);

    parts.forEach(part => {
      const match = part.match(/\[\[(\d+):(.*?)\]\]/);
      if (match) {
        const r = rabbits.find(rb => rb.id == match[1]);
        ctx.fillStyle = getHSL(r);
        const name = match[2];
        ctx.fillText(name, currentX + ctx.measureText(name).width / 2, cY);
        currentX += ctx.measureText(name).width;
      } else {
        ctx.fillStyle = n.color || '#fff';
        ctx.fillText(part, currentX + ctx.measureText(part).width / 2, cY);
        currentX += ctx.measureText(part).width;
      }
    });

    ctx.shadowBlur = 0; ctx.globalAlpha = 1; if (--n.timer <= 0) notifications.splice(i, 1);
  }

  drawPortrait();
  // Check for deep links (e.g. ?page=privacy)
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  if (page === 'privacy') {
    const privacyModal = document.getElementById('privacy-modal');
    if (privacyModal) privacyModal.style.display = 'flex';
  } else if (page === 'about') {
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) aboutModal.style.display = 'flex';
  }

  requestAnimationFrame(loop);
}



