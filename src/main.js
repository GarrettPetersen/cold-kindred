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

const FIELD_WIDTH = 2500;
const FIELD_HEIGHT = 2500;
const FRAME_SIZE = 32;
const CURRENT_YEAR = 2025;

// --- Seeded Random ---
function getDailySeed() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return { seed: Math.abs(hash), dateStr };
}

const { seed, dateStr: currentDateStr } = getDailySeed();
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
const sprites = {};
const grassSprites = [];
const detectiveSprites = {
  fox: new Image(),
  hare: new Image(),
  boarot: new Image(),
  fox_celebration: new Image(),
  hare_celebration: new Image(),
  boarot_celebration: new Image()
};

let assetsLoaded = 0;
const TOTAL_ASSETS = SPECIES.length * 4 + 6 + 6;

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
  img.src = `assets/environment/5 Grass/${i}.png`;
  grassSprites.push(img);
}

// Detective sprites
['fox', 'hare', 'boarot', 'fox_celebration', 'hare_celebration', 'boarot_celebration'].forEach(key => {
  detectiveSprites[key].onload = onAssetLoad;
  detectiveSprites[key].onerror = onAssetLoad;
});

detectiveSprites.fox.src = 'assets/detectives/film_noir_fox.png';
detectiveSprites.hare.src = 'assets/detectives/sherlock_hare.png';
detectiveSprites.boarot.src = 'assets/detectives/hercule_boarot.png';
detectiveSprites.fox_celebration.src = 'assets/detectives/film_noir_fox_celebration.png';
detectiveSprites.hare_celebration.src = 'assets/detectives/sherlock_hare_celebration.png';
detectiveSprites.boarot_celebration.src = 'assets/detectives/hercule_boarot_celebration.png';

SPECIES.forEach(s => {
  sprites[s] = { idle: new Image(), walk: new Image(), run: new Image(), death: new Image() };
  
  const walkFile = s === 'Fox' ? 'Fox_walk_with_shadow.png' : `${s}_Walk_with_shadow.png`;
  const runFile = s === 'Grouse' ? 'Grouse_Flight_with_shadow.png' : `${s}_Run_with_shadow.png`;
  
  ['idle', 'walk', 'run', 'death'].forEach(type => {
    sprites[s][type].onload = onAssetLoad;
    sprites[s][type].onerror = onAssetLoad;
  });

  sprites[s].idle.src = `assets/${s}/${s}_Idle_with_shadow.png`;
  sprites[s].walk.src = `assets/${s}/${walkFile}`;
  sprites[s].run.src = `assets/${s}/${runFile}`;
  sprites[s].death.src = `assets/${s}/${s}_Death_with_shadow.png`;
});

// --- State ---
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
const CLUE_INTERVAL = 120;
const hares = [];
const envDetails = [];
let clueQueue = [];
let globallyIssuedClueIds = new Set();
let caseLog = []; // Stores strings like "Name: Clue text"
let gameState = { isFinished: false, wasSuccess: false, startTime: null, endTime: null, detective: null, introFinished: false };

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
  if (!det) {
    document.getElementById('portrait-box').style.display = 'none';
    return;
  }

  document.getElementById('portrait-box').style.display = 'block';

  // Use celebration sprite if the case is solved successfully
  const isWin = gameState.isFinished && gameState.wasSuccess;
  const spr = isWin ? detectiveSprites[det + '_celebration'] : detectiveSprites[det];

  if (!spr || !spr.complete) return;

  pCtx.clearRect(0, 0, 64, 64);

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
  pCtx.drawImage(spr, sx, sy, 64, 64, 0, 0, 64, 64);
}

// --- Persistence & Stats ---
function getStats() {
  const stats = localStorage.getItem('mysteryFarm_stats');
  return stats ? JSON.parse(stats) : { history: {} };
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
    const res = stats.history[cronDates[i]];
    
    // Check for gap relative to previous entry
    if (i > 0) {
      const dPrev = new Date(cronDates[i - 1]);
      const dCurr = new Date(cronDates[i]);
      if ((dCurr - dPrev) / 86400000 > 1.5) { // Using 1.5 to be safe with DST/midnights
        tempWin = 0;
        tempAtt = 0;
      }
    }
    
    tempAtt++;
    maxAtt = Math.max(maxAtt, tempAtt);
    
    if (res.status === 'success') {
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

  for (const ds of dates) {
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

    currAtt++;
    if (stats.history[ds].status === 'success' && !winStreakBroken) {
      currWin++;
    } else {
      winStreakBroken = true;
    }
    lastDateFound = ds;
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
    globallyIssuedClueIds: Array.from(globallyIssuedClueIds),
    clueQueueIds: clueQueue.map(c => c.id),
    activeClueIds: Array.from(activeClues.values()).map(c => ({ id: c.id, speakerId: Array.from(activeClues.keys()).find(k => activeClues.get(k) === c), isRead: c.isRead, generatedText: c.generatedText })),
    highlightedAnimalIds: Array.from(highlightedAnimalIds)
  };
  localStorage.setItem('mysteryFarm_current', JSON.stringify(data));
  localStorage.setItem('mysteryFarm_detective', gameState.detective); // Global preference
  
  if (gameState.isFinished) {
    const stats = getStats();
    let solveTime = null;
    if (gameState.startTime && gameState.endTime) {
      solveTime = gameState.endTime - gameState.startTime;
    }
    stats.history[currentDateStr] = {
      status: gameState.wasSuccess ? 'success' : 'failure',
      solveTime: solveTime,
      dnaTestsUsed: 3 - dnaTestsRemaining
    };
    saveStats(stats);
  }
}

function loadGame() {
  const savedDet = localStorage.getItem('mysteryFarm_detective');
  if (savedDet) gameState.detective = savedDet;

  const saved = localStorage.getItem('mysteryFarm_current');
  if (!saved) return false;
  
  const data = JSON.parse(saved);
  if (data.date !== currentDateStr) {
    const stats = getStats();
    if (!stats.history[data.date]) {
      stats.history[data.date] = { status: 'incomplete' };
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
  playerConnections = data.playerConnections || [];
  caseLog = data.caseLog || [];
  gameState.detective = data.detective || savedDet || null;
  gameState.isFinished = data.isFinished || false;
  gameState.wasSuccess = data.wasSuccess || false;
  gameState.startTime = data.startTime || null;
  gameState.endTime = data.endTime || null;
  gameState.introFinished = data.introFinished || false;
  globallyIssuedClueIds = new Set(data.globallyIssuedClueIds || []);
  
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
    if (name === "Case File") {
      updateTranscriptUI(text, null);
    } else {
      const speaker = rabbits.find(r => r.firstName === name);
      if (speaker) updateTranscriptUI(text, speaker.id);
    }
  });
  if (tCount) tCount.textContent = dnaTestsRemaining;
  updateTreeDiagram();
  
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
    this.tint = { hue: random() * 360, saturate: 70 + random() * 30, brightness: 70 + random() * 20 };
  }
}

// --- Kinship ---
function getAncestors(id) {
  const ancestors = new Map();
  if (!id) return ancestors;
  const stack = [{ id, dist: 0 }];
  const visited = new Set();
  while (stack.length > 0) {
    const { id: currId, dist } = stack.pop();
    if (visited.has(currId) || dist > 8) continue;
    visited.add(currId);
    if (dist > 0) ancestors.set(currId, dist);
    const r = rabbits.find(rb => rb.id === currId);
    if (r) {
      if (r.fatherId) stack.push({ id: r.fatherId, dist: dist + 1 });
      if (r.motherId) stack.push({ id: r.motherId, dist: dist + 1 });
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

    const r = random();
    if (r < 0.5) {
      // Strategy 1: Direct Clue (Highly biased toward first-person)
      const sid = random() < 0.8 ? (random() < 0.5 ? p.id : c.id) : null;
      addRawClue(conn, 'necessary', sid);
    } else if (r < 0.75) {
      // Strategy 2: Spouse/Couple Inference (Speaker is often the child)
      const spouseId = p.sex === 'M' ? c.motherId : c.fatherId;
      const spouse = rabbits.find(r => r.id === spouseId);
      if (spouse) {
        const gid = Math.random().toString(36).substring(2, 7);
        const sid = random() < 0.7 ? c.id : null;
        addRawClue({ parentId: spouse.id, childId: c.id }, 'necessary', sid, gid);
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
        addRawClue(conn, 'necessary', c.id);
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
        addRawClue(conn, 'necessary', p.id);
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
    addRawClue(conn, 'extra', sid);
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
    return pick([
      `${mark(p1.id)} and ${mark(p2.id)} have a family together.`,
      `I've seen ${mark(p1.id)} and ${mark(p2.id)} with their little ones.`,
      `Aren't ${mark(p1.id)} and ${mark(p2.id)} such a devoted pair of parents?`,
      `${mark(p1.id)} and ${mark(p2.id)} are definitely building a nest together.`
    ]);
  }
  
  if (clue.conn.type === 'sibling') {
    const a = rabbits.find(r => r.id === clue.conn.a);
    const b = rabbits.find(r => r.id === clue.conn.b);
    const bRole = b.sex === 'M' ? 'brother' : 'sister';
    if (speakerId === a.id) return pick([`${mark(b.id)} is my ${bRole}.`, `Have you seen my ${bRole}, ${mark(b.id)}?`, `I grew up with ${mark(b.id)}.`]);
    if (speakerId === b.id) return pick([`${mark(a.id)} is my ${a.sex === 'M' ? 'brother' : 'sister'}.`, `I'm looking for my ${a.sex === 'M' ? 'brother' : 'sister'}, ${mark(a.id)}.`]);
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

  if (speakerId === c.id) return pick([`${mark(p.id)} is my ${pRole}.`, `Have you seen my ${pRoleShort}, ${mark(p.id)}?`, `I believe ${mark(p.id)} is my ${pRoleShort}.`]);
  if (speakerId === p.id) return pick([`${mark(c.id)} is my ${cRole}.`, `I'm looking for my ${cRoleShort}, ${mark(c.id)}.`, `${mark(c.id)} belongs to my family.`]);
  
  return pick([`${mark(p.id)} is ${mark(c.id)}'s ${pRoleShort}.`, `${mark(c.id)} is ${mark(p.id)}'s ${cRole}.`, `I saw ${mark(c.id)} with ${cPoss} ${pRoleShort}, ${mark(p.id)}.`]);
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
        bestPair[0].r.dnaRelation = bestPair[0].label;
        bestPair[1].r.dnaRelation = bestPair[1].label;
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
      others[0].r.dnaRelation = others[0].label;
      others[1].r.dnaRelation = others[1].label;
    } else {
      // Last resort fallback
      const lastResort = shuffle(rabbits.filter(r => r.id !== killerId && r.id !== killer.fatherId && r.id !== killer.motherId)).slice(0, 2);
      lastResort.forEach(lr => lr.dnaRelation = "distant relative");
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

// --- Animal Sprite ---
class Animal {
  constructor(record) {
    this.rabbit = record;
    this.x = random() * FIELD_WIDTH; this.y = random() * FIELD_HEIGHT;
    this.targetX = null; this.targetY = null;
    this.state = 'idle'; this.direction = Math.floor(random() * 4);
    this.frame = 0; this.frameTimer = 0; this.frameSpeed = 0.1;
    this.moveTimer = 0; this.vx = 0; this.vy = 0;
    this.setRandomBehavior();

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
    if (this.targetX !== null) {
      const dx = this.targetX - this.x, dy = this.targetY - this.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 5) { this.state = 'run'; this.vx = (dx / d) * 2.5; this.vy = (dy / d) * 2.5; this.updateDir(); }
      else { this.state = 'idle'; this.vx = this.vy = 0; this.x = this.targetX; this.y = this.targetY; }
    } else if (!gameState.isFinished) {
      // Optimization: only check nearby animals or skip frames
      if (Date.now() % 3 === 0) { // Check every ~3 frames
        hares.forEach(o => {
          if (o === this || o.targetX !== null) return;
          const dx = this.x - o.x, dy = this.y - o.y;
          if (Math.abs(dx) > 40 || Math.abs(dy) > 40) return; // Fast broad-phase
          const d2 = dx * dx + dy * dy;
          if (d2 < 1600 && d2 > 0) {
            const d = Math.sqrt(d2);
            this.vx += (dx / d) * 0.2;
            this.vy += (dy / d) * 0.2;
          }
        });
      }
      if (this.state !== 'idle') { const s = this.state === 'walk' ? 1 : 2.5, curr = Math.sqrt(this.vx * this.vx + this.vy * this.vy); if (curr > s) { this.vx = (this.vx / curr) * s; this.vy = (this.vy / curr) * s; } }
      if (--this.moveTimer <= 0) this.setRandomBehavior();
    } else {
      this.vx = 0; this.vy = 0; this.state = 'idle';
    }

    if (this.state !== 'idle' && this.state !== 'death') this.updateDir();
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0) { this.x = 0; this.vx *= -1; } else if (this.x > FIELD_WIDTH) { this.x = FIELD_WIDTH; this.vx *= -1; }
    if (this.y < 0) { this.y = 0; this.vy *= -1; } else if (this.y > FIELD_HEIGHT) { this.y = FIELD_HEIGHT; this.vy *= -1; }
    
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
  draw() {
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

    const tintedSpr = getTintedSprite(this.rabbit, this.state);
    if (tintedSpr) {
      ctx.drawImage(tintedSpr, this.frame * FRAME_SIZE, d * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE, Math.floor(sx), Math.floor(sy), sz, sz);
    }

    if (selectedHare === this) {
      const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.9;
      ctx.beginPath();
      ctx.ellipse(sx + sz / 2, sy + sz * 0.9, sz * 0.4 * pulse, sz * 0.2 * pulse, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#44ff44';
      ctx.lineWidth = 3 * camera.zoom;
      ctx.stroke();

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
    const bgX = sx + sz / 2 - bgW / 2, bgY = sy + sz + 5 * camera.zoom;

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
      ctx.font = `bold ${fontSize}px Arial`; 
      const dnaLabel = `🧬 ${this.rabbit.dnaRelation}`;
      // DNA labels are rare, measuring them is okay or we could cache them too
      const dnaMetrics = ctx.measureText(dnaLabel);
      const dW = dnaMetrics.width + padX * 2, dH = fontSize + padY * 2;
      const dX = sx + sz / 2 - dW / 2, dY = Math.max(5, sy - 15 * camera.zoom);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(dX, dY, dW, dH, 4 * camera.zoom);
      ctx.fill();

      ctx.fillStyle = '#44ff44';
      ctx.textBaseline = 'top';
      ctx.fillText(dnaLabel, sx + sz / 2, dY + padY); 
    }
    const clue = activeClues.get(this.rabbit.id);
    if (clue) {
      // Partial scaling for bubbles: they stay larger when zoomed out
      const bubbleScale = camera.zoom * 0.4 + 0.6;
      
      const bw = 30 * bubbleScale, bh = 25 * bubbleScale, r = 5 * bubbleScale;
      const bx = sx + sz * 0.8, by = sy - 15 * camera.zoom;
      
      const s = Math.max(0, Math.min(100, this.rabbit.tint.saturate)), l = Math.max(0, Math.min(100, this.rabbit.tint.brightness));
      ctx.fillStyle = `hsla(${this.rabbit.tint.hue}, ${s}%, ${l}%, 0.9)`;
      ctx.beginPath();
      ctx.roundRect(bx, by - bh, bw, bh, r);
      ctx.fill();
      
      ctx.beginPath(); ctx.moveTo(bx + 5 * bubbleScale, by); ctx.lineTo(bx + 15 * bubbleScale, by); ctx.lineTo(bx + 10 * bubbleScale, by + 5 * bubbleScale); ctx.fill();
      ctx.fillStyle = 'white'; 
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.floor(14 * bubbleScale)}px Arial`; 
      ctx.fillText('?', bx + bw / 2, by - bh / 2); 
    }
    ctx.shadowBlur = 0;
  }
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
    // Start with a wider initial spread to allow more room for convergence
    validGrps.forEach((ids, l) => {
      ids.forEach((id, i) => {
        layoutPositions.set(id, { l, i, x: i * 2 });
      });
    });

    // Second pass: Adjust row X offsets to center parents/children
    // Increase iterations to allow the "spread" to propagate through all 5 generations
    for (let iter = 0; iter < 12; iter++) {
      // Top-down: Move children under parents
      validGrps.forEach((ids, l) => {
        if (l === 0) return;
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
              // Maintain minimum gap from the sibling to the left (1.5 units for better visibility)
              let minX = (i === 0) ? -Infinity : layoutPositions.get(ids[i - 1]).x + 1.5;
              currentPos.x = Math.max(minX, idealX);
            }
          }
        });
      });

      // Bottom-up: Move parents over children (Upward Pressure)
      for (let l = validGrps.length - 2; l >= 0; l--) {
        const ids = validGrps[l];
        // Right-to-left pass to allow spreading to the right
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
        // Left-to-right pass to maintain minimum gaps and allow spreading to the left
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          const currentPos = layoutPositions.get(id);
          const cs = playerConnections.filter(c => c.parentId === id).map(c => c.childId);

          let idealX = currentPos.x;
          if (cs.length > 0) {
            let avgChildX = 0, cCount = 0;
            cs.forEach(cid => {
              const cPos = layoutPositions.get(cid);
              if (cPos) { avgChildX += cPos.x; cCount++; }
            });
            idealX = avgChildX / cCount;
          }

          let minX = (i === 0) ? -Infinity : layoutPositions.get(ids[i - 1]).x + 1.5;
          currentPos.x = Math.max(minX, idealX);
        }
      }
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
        const h = hares.find(ha => ha.rabbit.id === id);
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
    if (playAgainUi) playAgainUi.style.display = 'block';
    if (selectedHare) {
      sPanel.style.display = 'block'; 
      sName.textContent = `${selectedHare.rabbit.firstName} (${CURRENT_YEAR - selectedHare.rabbit.birthYear})`; 
      sSpec.textContent = selectedHare.rabbit.species;
      dnaBtn.style.display = 'none';
      accBtn.style.display = 'none';
      const hint = document.getElementById('selection-hint'); if (hint) hint.style.display = 'none';
    } else sPanel.style.display = 'none';
    return;
  }
  if (playAgainUi) playAgainUi.style.display = 'none';

  if (selectedHare) {
    sPanel.style.display = 'block'; sName.textContent = `${selectedHare.rabbit.firstName} (${CURRENT_YEAR - selectedHare.rabbit.birthYear})`; sSpec.textContent = selectedHare.rabbit.species;
    const hint = document.getElementById('selection-hint'); if (hint) hint.style.display = 'block';
    if (dnaTestsRemaining > 0) {
      dnaBtn.style.display = 'block'; accBtn.style.display = 'none';
      if (selectedHare.rabbit.isTested) { dnaBtn.disabled = true; dnaBtn.style.opacity = '0.5'; dnaBtn.textContent = 'ALREADY TESTED'; }
      else { dnaBtn.disabled = false; dnaBtn.style.opacity = '1.0'; dnaBtn.textContent = 'DNA TEST'; }
    } else { dnaBtn.style.display = 'none'; accBtn.style.display = 'block'; accBtn.style.opacity = '1.0'; }
  } else sPanel.style.display = 'none';
}

function updateTranscriptUI(newEntry, speakerId) {
  const container = document.getElementById('transcript-container');
  const list = document.getElementById('transcript-list');
  const latest = document.getElementById('latest-clue');
  
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
    
    latest.innerHTML = speaker ? `Case Log: ${speakerPart}${parsedText}` : `Case Log: ${parsedText}`;

    // Make mentions in the "latest clue" header clickable too
    latest.querySelectorAll('.animal-mention').forEach(span => {
      span.addEventListener('click', e => {
        e.stopPropagation(); // Don't toggle transcript
        const id = parseInt(span.getAttribute('data-id'));
        const hare = hares.find(h => h.rabbit.id === id);
        if (hare) {
          camera.x = hare.x + FRAME_SIZE - (canvas.width / camera.zoom) / 2;
          camera.y = hare.y + FRAME_SIZE - (canvas.height / camera.zoom) / 2;
          constrainCamera();

          highlightedAnimalIds.clear();
          highlightedAnimalIds.add(id);
          updateUI();
        }
      });
    });

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
    list.appendChild(entryEl);

    // Add click listeners for animal mentions
    entryEl.querySelectorAll('.animal-mention').forEach(span => {
      span.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(span.getAttribute('data-id'));
        const hare = hares.find(h => h.rabbit.id === id);
        if (hare) {
          // Center camera on the animal
          camera.x = hare.x + FRAME_SIZE - (canvas.width / camera.zoom) / 2;
          camera.y = hare.y + FRAME_SIZE - (canvas.height / camera.zoom) / 2;
          constrainCamera();

          // Don't auto-select, just highlight them briefly
          highlightedAnimalIds.clear();
          highlightedAnimalIds.add(id);
          updateUI();
        }
      });
    });

    list.scrollTop = list.scrollHeight;
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

function showGameOver(isWin) {
  const modal = document.getElementById('game-over');
  const scrollContainer = document.getElementById('game-over-scroll-container');
  const scrollHint = document.getElementById('game-over-scroll-hint');
  const title = document.getElementById('game-over-title');
  const msg = document.getElementById('game-over-msg');
  const nextBtn = document.getElementById('game-over-next');
  const viewFarmBtn = document.getElementById('game-over-view-farm');
  const gCanvas = document.getElementById('gameOverCanvas');
  const gCtx = gCanvas.getContext('2d');
  
  // Function to check if scrolling is needed and show/hide hint
  function updateScrollHint() {
    setTimeout(() => {
      if (!scrollContainer) return;
      const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
      const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 20;
      scrollHint.style.display = (isScrollable && !isAtBottom) ? 'block' : 'none';
    }, 100);
  }

  // Attach scroll listener once
  if (scrollContainer && !scrollContainer.dataset.listenerAttached) {
    scrollContainer.addEventListener('scroll', updateScrollHint);
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
      updateScrollHint();
      gameOverHandle = requestAnimationFrame(gLoop);
      return;
    }

    if (gameOverStep === 0) {
      title.textContent = "CASE SOLVED!";
      title.style.color = "#44ff44";
      msg.innerHTML = `You found the killer! <span style="color: ${getHSL(killer)}; font-weight: bold;">${killer.firstName}</span> has been apprehended.${timeStr}${statsLine}`;
      
      gCtx.save();
      gCtx.filter = `hue-rotate(${killer.tint.hue}deg) saturate(${killer.tint.saturate}%) brightness(${killer.tint.brightness}%)`;
      gCtx.drawImage(sprites[killer.species].idle, 0, 0, 32, 32, centerX - 32, centerY - 32, 64, 64);
      gCtx.restore();
      
      nextBtn.textContent = "NEXT";
      nextBtn.style.display = "block";
      viewFarmBtn.style.display = "none";
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
      updateScrollHint();
    } else if (gameOverStep === 2) {
      title.textContent = "JUSTICE";
      msg.innerHTML = `Now it's time to execute the killer.${timeStr}${statsLine}`;

      // Show view-farm button instead of next until execution is finished
      viewFarmBtn.style.display = "none";
      updateScrollHint();

      const spr = sprites[killer.species].idle;
      const bodyX = centerX - 32;

      // Decouple animal height from guillotine height for better alignment
      const neckY = centerY + 25;

      // Species-specific neck line (split point on the 32px sprite)
      let spriteNeckY = 16;
      if (killer.species === 'Grouse') spriteNeckY = 14; // Raise neck line (chop less shoulder)
      else if (killer.species === 'Deer') spriteNeckY = 10; // Deer has a very high neck
      else if (killer.species === 'Boar') spriteNeckY = 15;

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
        nextBtn.textContent = "FINISH";
      }
    } else {
      title.textContent = "HOORAY!";
      const det = gameState.detective;
      let detName = "THE DETECTIVE";
      if (det === 'fox') detName = "FILM NOIR FOX";
      else if (det === 'hare') detName = "SHERLOCK HARE";
      else if (det === 'boarot') detName = "HERCULE BOAROT";

      msg.innerHTML = `Justice is served. The farm is safe once again.<br><br><b>${detName}</b> has cracked the case!${timeStr}${statsLine}`;

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
        gCtx.drawImage(spr, sx, sy, 64, 64, centerX - 48, centerY - 48, 96, 96);
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
      updateScrollHint();
    }
    
    gameOverHandle = requestAnimationFrame(gLoop);
  }
  gLoop();
}

let isTranscriptOpen = false;
function toggleTranscript() {
  const container = document.getElementById('transcript-container');
  const list = document.getElementById('transcript-list');
  const toggle = document.getElementById('transcript-toggle');
  
  isTranscriptOpen = !isTranscriptOpen;
  if (isTranscriptOpen) {
    container.style.height = '200px';
    list.style.display = 'block';
    toggle.textContent = '▼ CLOSE';
  } else {
    container.style.height = '40px';
    list.style.display = 'none';
    toggle.textContent = '▲ OPEN';
  }
}

let introStep = 0;
let introAnimFrame = 0;
let introAnimTimer = 0;
let introHandle = null;
let isMidGameChange = false;

  function showIntro(isMidGameChangeParam = false) {
  isMidGameChange = isMidGameChangeParam;
  const modal = document.getElementById('intro-modal');
  const scrollContainer = document.getElementById('intro-scroll-container');
  const scrollHint = document.getElementById('intro-scroll-hint');
  const title = document.getElementById('intro-title');
  const textContainer = document.getElementById('intro-text');
  const btn = document.getElementById('intro-next');
  const iCanvas = document.getElementById('introCanvas');
  const iCtx = iCanvas.getContext('2d');
  const charSelection = document.getElementById('character-selection');
  
  modal.style.display = 'flex';

  // Function to check if scrolling is needed and show/hide hint
  function updateScrollHint() {
    if (modal.style.display === 'none') return;
    // Small delay to allow DOM to layout
    setTimeout(() => {
      const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
      const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 20;
      scrollHint.style.display = (isScrollable && !isAtBottom) ? 'block' : 'none';
    }, 100);
  }

  // Attach scroll listener once
  if (!scrollContainer.dataset.listenerAttached) {
    scrollContainer.addEventListener('scroll', updateScrollHint);
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
    if ((needsSelection || isMidGameChange) && introStep === 0) {
      title.textContent = "CHOOSE YOUR CHARACTER";
      textContainer.textContent = "Select your detective to begin the investigation.";
      iCanvas.style.display = 'none';
      charSelection.style.display = 'flex';
      btn.style.display = 'none'; // Hide next button until character is picked

      // Draw the idle frames on the character canvases
      ['fox', 'hare', 'boarot'].forEach(char => {
        const c = document.getElementById(char + 'Canvas');
        if (c) {
          const ctx = c.getContext('2d');
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, 64, 64);
          ctx.drawImage(detectiveSprites[char], 0, 0, 64, 64, 0, 0, 64, 64);
        }
      });
      updateScrollHint();
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
        const maxWidth = 100; // Max width for label before wrapping
        
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
  runSimulation();
  rabbits.forEach(r => hares.push(new Animal(r)));
  
  // Try loading saved game for today
  const wasLoaded = loadGame();
  updateUI();

  // Initialize environment details (same for everyone today)
  const detailCount = 800;
  for (let i = 0; i < detailCount; i++) {
    envDetails.push({
      x: random() * FIELD_WIDTH,
      y: random() * FIELD_HEIGHT,
      spriteIndex: Math.floor(random() * 6),
      scale: 1.0 + random() * 0.5
    });
  }

  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; constrainCamera(); });
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;

  // Start somewhat zoomed in (1.0 zoom) instead of showing the whole field
  camera.zoom = 1.0;
  camera.x = FIELD_WIDTH / 2 - (canvas.width / camera.zoom) / 2;
  camera.y = FIELD_HEIGHT / 2 - (canvas.height / camera.zoom) / 2;
  constrainCamera();

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
            saveGame();
          }
          notifications.push({ text: clue.generatedText, x: cx, y: cy - 20, timer: 360, timerMax: 360, color: '#fff' }); 
          // Disappear after click
          activeClues.delete(h.rabbit.id);
          return true; 
        }
      }
    }
    const cToP = new Map(); playerConnections.forEach(c => { if (!cToP.has(c.childId)) cToP.set(c.childId, []); cToP.get(c.childId).push(c); });
    for (const [cid, conns] of cToP) {
      const child = hares.find(h => h.rabbit.id === cid); if (!child) continue;
      const py = conns.reduce((s, c) => s + (hares.find(h => h.rabbit.id === c.parentId).y + FRAME_SIZE), 0) / conns.length, midY = (py + child.y + FRAME_SIZE) / 2;
      for (const c of conns) {
        const p = hares.find(h => h.rabbit.id === c.parentId); if (selectedHare !== p && selectedHare !== child) continue;
        if (Math.hypot(wx - (p.x + FRAME_SIZE), wy - (p.y + FRAME_SIZE + midY) / 2) < 25 / camera.zoom) { 
          playerConnections.splice(playerConnections.indexOf(c), 1); 
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
          updateTreeDiagram(); 
          saveGame();
          notifications.push({ text: "Linked!", x: cx, y: cy - 20, timer: 60, timerMax: 60, color: '#44ff44' }); 
          // Clear highlights when relationships are added
          highlightedAnimalIds.clear();
        }
        selectedHare = null;
      } else selectedHare = clicked;
      updateUI(); return true;
    }
    return false;
  };

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
  dnaBtn.addEventListener('pointerdown', e => e.stopPropagation());
  dnaBtn.addEventListener('click', e => {
    e.preventDefault(); if (gameState.isFinished || !selectedHare || dnaTestsRemaining <= 0 || selectedHare.rabbit.isTested) return;
    if (selectedHare.rabbit.id === killerId) { showGameOver(true); return; }
    const rel = getRelationshipLabel(getCommonAncestors(killerId, selectedHare.rabbit.id), killerId, selectedHare.rabbit.id);
    selectedHare.rabbit.dnaRelation = rel || "no relation"; selectedHare.rabbit.isTested = true; dnaTestsRemaining--; tCount.textContent = dnaTestsRemaining;
    if (rel) { updateNecessaryConnections(); generateCluePool(true); }
    updateUI();
    saveGame();
  });
  accBtn.addEventListener('pointerdown', e => e.stopPropagation());
  accBtn.addEventListener('click', e => {
    e.preventDefault(); if (gameState.isFinished || !selectedHare || dnaTestsRemaining > 0) return;
    showGameOver(selectedHare.rabbit.id === killerId);
  });

  // Portrait click to change character or replay celebration
  document.getElementById('portrait-box').addEventListener('click', () => {
    if (gameState.isFinished) {
      if (gameState.wasSuccess) {
        // Replay celebration animation
        portraitAnim.active = true;
        portraitAnim.timer = 0;
      }
      return;
    }
    gameState.detective = null;
    isMidGameChange = true;
    introStep = 0;
    showIntro();
    saveGame();
  });

  // Character selection
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

        if (isMidGameChange) {
          const modal = document.getElementById('intro-modal');
          modal.style.display = 'none';
          if (introHandle) cancelAnimationFrame(introHandle);
          isMidGameChange = false;
          introStep = 0;
          introAnimTimer = 0;
        } else {
          showIntro();
        }
        saveGame();
      }, 500);
    });
  });

  document.getElementById('intro-next').addEventListener('click', () => {
    introStep++;
    const scrollContainer = document.getElementById('intro-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
    showIntro();
  });

  document.getElementById('game-over-next').addEventListener('click', () => {
    gameOverStep++;
    gameOverAnimTimer = 0;
    const scrollContainer = document.getElementById('game-over-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
    showGameOver(gameState.wasSuccess);
  });

  document.getElementById('help-btn').addEventListener('click', () => {
    isMidGameChange = false;
    introStep = 0;
    const scrollContainer = document.getElementById('intro-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
    showIntro();
  });

  document.getElementById('transcript-header').addEventListener('click', toggleTranscript);

  // Cheat codes
  let cheatBuffer = "";
  window.addEventListener('keyup', e => {
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
  });

  if (gameState.isFinished) {
    showGameOver(gameState.wasSuccess);
  } else if (!wasLoaded || !gameState.introFinished) {
    showIntro();
  }
  
  loop();
}

function constrainCamera() {
  const vw = canvas.width / camera.zoom, vh = canvas.height / camera.zoom;
  
  // Padding values in world units (scaled by zoom)
  const padSide = 300 / camera.zoom;
  const padTop = 150 / camera.zoom;
  const padBottom = 400 / camera.zoom; // Extra space for transcript UI

  // Horizontal constraint
  const minX = -padSide;
  const maxX = FIELD_WIDTH + padSide - vw;
  if (vw > FIELD_WIDTH + padSide * 2) {
    camera.x = (FIELD_WIDTH - vw) / 2;
  } else {
    camera.x = Math.max(minX, Math.min(maxX, camera.x));
  }

  // Vertical constraint
  const minY = -padTop;
  const maxY = FIELD_HEIGHT + padBottom - vh;
  if (vh > FIELD_HEIGHT + padTop + padBottom) {
    camera.y = (FIELD_HEIGHT - vh) / 2;
  } else {
    camera.y = Math.max(minY, Math.min(maxY, camera.y));
  }
}

function loop() {
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
            const free = hares.filter(h => !activeClues.has(h.rabbit.id));
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
  
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; const sp = 100 * camera.zoom;
  for (let x = (-camera.x * camera.zoom) % sp; x < canvas.width; x += sp) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = (-camera.y * camera.zoom) % sp; y < canvas.height; y += sp) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  
  // Draw walkable area boundary
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 4 * camera.zoom;
  ctx.strokeRect(
    -camera.x * camera.zoom,
    -camera.y * camera.zoom,
    FIELD_WIDTH * camera.zoom,
    FIELD_HEIGHT * camera.zoom
  );

  // Draw grass sprites
  envDetails.forEach(d => {
    const img = grassSprites[d.spriteIndex];
    const sw = img.width, sh = img.height;
    const sx = (d.x - camera.x) * camera.zoom, sy = (d.y - camera.y) * camera.zoom;
    const szW = sw * d.scale * camera.zoom, szH = sh * d.scale * camera.zoom;
    if (sx < -szW || sx > canvas.width || sy < -szH || sy > canvas.height) return;
    ctx.drawImage(img, Math.floor(sx), Math.floor(sy), Math.floor(szW), Math.floor(szH));
  });

  ctx.save(); 
  ctx.font = 'bold 24px monospace'; 
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; 
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('mystery.farm', 20, 75); // Positioned below the Help (?) button
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

  const xButtons = []; // Store X button positions to draw them last

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

      // Record "X" position if selected
      if (selectedHare === p || cs.some(c => selectedHare === c)) {
        xButtons.push({ x: px, y: (py + screenMidY) / 2 });
      }
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
    ctx.restore();
  });
  ctx.restore();

  hares.sort((a, b) => a.y - b.y).forEach(h => { h.update(); h.draw(); });

  // Update stopwatch display in real-time
  updateUI();
  
  // 4. Draw recorded "X" buttons on TOP of animals/labels
  xButtons.forEach(btn => {
    ctx.save();
    ctx.fillStyle = '#f44'; ctx.beginPath(); ctx.arc(btn.x, btn.y, 10 * camera.zoom, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.floor(12 * camera.zoom)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('X', btn.x, btn.y);
    ctx.restore();
  });
  
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
    const bottomLimit = canvas.height - (transcriptEl ? transcriptEl.offsetHeight : 40) - 20;
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
  requestAnimationFrame(loop);
}



