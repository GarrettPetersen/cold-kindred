const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FIELD_WIDTH = 2000;
const FIELD_HEIGHT = 2000;
const FRAME_SIZE = 32;
const CURRENT_YEAR = 2025;

// --- Seeded Random ---
function getDailySeed() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const seed = getDailySeed();
let rngState = seed;
function random() {
  rngState = (rngState * 1664525 + 1013904223) % 4294967296;
  return rngState / 4294967296;
}
function pick(arr) { return arr[Math.floor(random() * arr.length)]; }

// --- Names ---
const MALE_NAMES = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Alexander', 'Raymond', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Nathan', 'Henry', 'Zachary', 'Douglas', 'Peter', 'Kyle', 'Noah', 'Ethan', 'Jeremy', 'Walter', 'Christian', 'Keith', 'Roger', 'Terry', 'Austin', 'Sean', 'Gerald', 'Carl', 'Harold', 'Dylan', 'Arthur', 'Lawrence', 'Jordan', 'Jesse', 'Bryan', 'Billy', 'Bruce', 'Gabriel', 'Logan', 'Alan', 'Juan', 'Roy', 'Ralph', 'Randy', 'Eugene', 'Vincent', 'Bobby', 'Russell', 'Louis', 'Philip', 'Johnny', 'Miguel', 'Caleb', 'Lucas', 'Alfred', 'Bradley', 'Oliver', 'Liam', 'Mason', 'Elias', 'Hudson', 'Hunter', 'Asher', 'Silas', 'Leo', 'Finn', 'Arlo', 'Milo', 'Felix', 'Jasper', 'Oscar', 'Theo', 'Hugo', 'Otto', 'Barnaby', 'Bartholomew', 'Benedict', 'Bram', 'Casper', 'Clement', 'Cyril', 'Dexter', 'Edmund', 'Ernest', 'Atticus', 'Augustus', 'Basil', 'Bear', 'Beau', 'Beckett', 'Bennett', 'Brooks', 'Caspian', 'Cato', 'Cedric', 'Chester', 'Conrad', 'Darwin', 'Dash', 'Dorian', 'Elio', 'Emmett', 'Enzo', 'Evander', 'Ezra', 'Flynn', 'Gideon', 'Gulliver', 'Hamish', 'Harvey', 'Ilo', 'Indigo', 'Jude', 'Julian', 'Kit', 'Knox', 'Lachlan', 'Leander', 'Linus', 'Lucian', 'Magnus', 'Malachi', 'Monty', 'Nico', 'Orion', 'Otis', 'Otto', 'Pascal', 'Phineas', 'Quill', 'Rafe', 'Remy', 'Rory', 'Rufus', 'Sacha', 'Sebastian', 'Stellan', 'Sylvan', 'Teddy', 'Tobias', 'Wilder', 'Xander', 'Zane', 'Ziggy'];
const FEMALE_NAMES = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia', 'Kathleen', 'Amy', 'Shirley', 'Angela', 'Helen', 'Anna', 'Brenda', 'Pamela', 'Nicole', 'Emma', 'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Catherine', 'Carolyn', 'Janet', 'Ruth', 'Maria', 'Heather', 'Diane', 'Virginia', 'Julie', 'Joyce', 'Victoria', 'Olivia', 'Kelly', 'Christina', 'Lauren', 'Joan', 'Evelyn', 'Judith', 'Megan', 'Andrea', 'Cheryl', 'Hannah', 'Jacqueline', 'Martha', 'Gloria', 'Teresa', 'Ann', 'Sara', 'Madison', 'Frances', 'Kathryn', 'Jean', 'Abigail', 'Alice', 'Julia', 'Judy', 'Sophia', 'Grace', 'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle', 'Beverly', 'Isabella', 'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Rose', 'Alexis', 'Kayla', 'Lori', 'Faith', 'Luna', 'Willow', 'Hazel', 'Ivy', 'Violet', 'Aurora', 'Iris', 'Juniper', 'Flora', 'Clementine', 'Beatrix', 'Clara', 'Eloise', 'Genevieve', 'Matilda', 'Penelope', 'Rosemary', 'Tabitha', 'Winifred', 'Zelda', 'Ada', 'Beatrice', 'Cora', 'Daphne', 'Edith', 'Florence', 'Greta', 'Hattie', 'Imogen', 'Lottie', 'Aisling', 'Alya', 'Amelie', 'Anouk', 'Ariadne', 'Aurelia', 'Calliope', 'Cecily', 'Cleo', 'Cosima', 'Delphine', 'Elowen', 'Elspeth', 'Esmé', 'Eulalie', 'Faye', 'Freya', 'Gaia', 'Ines', 'Ione', 'Isadora', 'Juno', 'Kaia', 'Lark', 'Lyra', 'Maeve', 'Maia', 'Margot', 'Marlowe', 'Mina', 'Mira', 'Nell', 'Niamh', 'Odette', 'Ophelia', 'Orla', 'Ottilie', 'Paloma', 'Pearl', 'Petra', 'Phoebe', 'Pixie', 'Poppy', 'Primrose', 'Ramona', 'Rhea', 'Romilly', 'Saffron', 'Saskia', 'Seraphina', 'Tallulah', 'Thea', 'Veda', 'Willa', 'Xanthe', 'Yara', 'Zinnia', 'Zora', 'Zosia', 'Zuzanna'];

// --- Asset loading ---
const SPECIES = ['Hare', 'Boar', 'Deer', 'Fox', 'Black_grouse'];
const sprites = {};
const grassSprites = [];
SPECIES.forEach(s => { sprites[s] = { idle: new Image(), walk: new Image(), run: new Image(), death: new Image() }; });
for (let i = 1; i <= 6; i++) {
  const img = new Image();
  img.src = `/assets/environment/5 Grass/${i}.png`;
  grassSprites.push(img);
}

let assetsLoaded = 0;
const TOTAL_ASSETS = SPECIES.length * 4 + 6;
function onAssetLoad() { if (++assetsLoaded === TOTAL_ASSETS) init(); }

grassSprites.forEach(img => img.onload = onAssetLoad);
SPECIES.forEach(s => {
  const walkFile = s === 'Fox' ? 'Fox_walk_with_shadow.png' : `${s}_Walk_with_shadow.png`;
  const runFile = s === 'Black_grouse' ? 'Black_grouse_Flight_with_shadow.png' : `${s}_Run_with_shadow.png`;
  sprites[s].idle.src = `/assets/${s}/${s}_Idle_with_shadow.png`;
  sprites[s].walk.src = `/assets/${s}/${walkFile}`;
  sprites[s].run.src = `/assets/${s}/${runFile}`;
  sprites[s].death.src = `/assets/${s}/${s}_Death_with_shadow.png`;
  sprites[s].idle.onload = sprites[s].walk.onload = sprites[s].run.onload = sprites[s].death.onload = onAssetLoad;
});

// --- State ---
const rabbits = [];
let nextRabbitId = 1;
const playerConnections = [];
let selectedHare = null;
let killerId = null;
let victim = { name: '', species: '', sex: '' };
let dnaTestsRemaining = 3;
const notifications = [];
let necessaryConnections = [];
let cluePool = [];
let activeClues = new Map();
let lastClueTime = 0;
const CLUE_INTERVAL = 120;
const hares = [];
const envDetails = [];
const clueQueue = [];

const camera = { x: 0, y: 0, zoom: 1.0, minZoom: 0.1, maxZoom: 3.0 };
const input = { isDragging: false, lastMouseX: 0, lastMouseY: 0, lastTouchDist: 0 };

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
  const closest = common.reduce((min, c) => (c.dist1 + c.dist2 < min.dist1 + min.dist2 ? c : min), common[0]);
  const dist1 = closest.dist1;
  const dist2 = closest.dist2;
  const n = Math.min(dist1, dist2) - 1;
  const removed = Math.abs(dist1 - dist2);
  
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
  const path = [];
  let currId = startId;
  const visited = new Set();
  while (currId && currId !== targetId) {
    if (visited.has(currId)) break;
    visited.add(currId);
    const curr = rabbits.find(r => r.id === currId);
    if (!curr) break;
    const fAnc = getAncestors(curr.fatherId);
    if (curr.fatherId === targetId || fAnc.has(targetId)) {
      path.push({ parentId: curr.fatherId, childId: currId });
      currId = curr.fatherId;
    } else {
      path.push({ parentId: curr.motherId, childId: currId });
      currId = curr.motherId;
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
  
  function addRawClue(text, speakerId, conn, type, groupId = null) {
    if (newClues.length >= rabbits.length * 0.9) return;
    newClues.push({ id: Math.random().toString(36).substring(2, 11), text, speakerId, conn, type, isRead: false, groupId });
  }

  function createDirectClueText(p, c, speakerId) {
    const pRole = p.sex === 'M' ? 'father' : 'mother';
    const pRoleShort = p.sex === 'M' ? 'dad' : 'mom';
    const cRole = c.sex === 'M' ? 'son' : 'daughter';
    const cRoleShort = c.sex === 'M' ? 'boy' : 'girl';
    const cPoss = c.sex === 'M' ? 'his' : 'her';

    if (speakerId === c.id) {
      return pick([`${p.firstName} is my ${pRole}.`, `Have you seen my ${pRoleShort}, ${p.firstName}?`, `I believe ${p.firstName} is my ${pRoleShort}.`]);
    } else if (speakerId === p.id) {
      return pick([`${c.firstName} is my ${cRole}.`, `I'm looking for my ${cRoleShort}, ${c.firstName}.`, `${c.firstName} belongs to my family.`]);
    } else {
      return pick([`${p.firstName} is ${c.firstName}'s ${pRoleShort}.`, `${c.firstName} is ${p.firstName}'s ${cRole}.`, `I saw ${c.firstName} with ${cPoss} ${pRoleShort}, ${p.firstName}.`]);
    }
  }

  necessaryConnections.forEach(conn => {
    if (existing.has(JSON.stringify(conn))) return;
    const p = rabbits.find(r => r.id === conn.parentId);
    const c = rabbits.find(r => r.id === conn.childId);
    if (!p || !c) return;

    const r = random();
    if (r < 0.2) {
      // Direct Clue
      const speakerId = random() < 0.6 ? (random() < 0.5 ? p.id : c.id) : pick(rabbits).id;
      addRawClue(createDirectClueText(p, c, speakerId), speakerId, conn, 'necessary');
    } else if (r < 0.6) {
      // Strategy 2: Spouse/Couple Inference (Double Clue)
      const spouseId = p.sex === 'M' ? c.motherId : c.fatherId;
      const spouse = rabbits.find(r => r.id === spouseId);
      if (spouse) {
        const gid = Math.random().toString(36).substring(2, 7);
        addRawClue(createDirectClueText(spouse, c, random() < 0.5 ? spouse.id : c.id), spouse.id, conn, 'necessary', gid);
        addRawClue(`${p.firstName} and ${spouse.firstName} are such a lovely couple.`, pick(rabbits).id, conn, 'necessary', gid);
      } else {
        addRawClue(createDirectClueText(p, c, c.id), c.id, conn, 'necessary');
      }
    } else {
      // Sibling Inference (Double Clue)
      const siblings = rabbits.filter(r => (r.fatherId === p.id || r.motherId === p.id) && r.id !== c.id);
      if (siblings.length > 0) {
        const sib = pick(siblings);
        const gid = Math.random().toString(36).substring(2, 7);
        addRawClue(`${sib.firstName} is my ${sib.sex === 'M' ? 'brother' : 'sister'}.`, c.id, conn, 'necessary', gid);
        addRawClue(`${p.firstName} is the ${p.sex === 'M' ? 'father' : 'mother'} of ${sib.firstName}.`, pick(rabbits).id, conn, 'necessary', gid);
      } else {
        // Grandparent Inference (Double Clue)
        const gpId = p.fatherId || p.motherId;
        const gp = rabbits.find(r => r.id === gpId);
        if (gp) {
          const gid = Math.random().toString(36).substring(2, 7);
          addRawClue(`${gp.firstName} is my ${gp.sex === 'M' ? 'grandfather' : 'grandmother'}.`, c.id, conn, 'necessary', gid);
          addRawClue(`${p.firstName} is ${gp.firstName}'s ${p.sex === 'M' ? 'son' : 'daughter'}.`, pick(rabbits).id, conn, 'necessary', gid);
        } else {
          addRawClue(createDirectClueText(p, c, p.id), p.id, conn, 'necessary');
        }
      }
    }
    existing.add(JSON.stringify(conn));
  });

  const allConns = [];
  rabbits.forEach(r => { if (r.fatherId) allConns.push({ parentId: r.fatherId, childId: r.id }); if (r.motherId) allConns.push({ parentId: r.motherId, childId: r.id }); });
  const needed = Math.max(20, newClues.length) - newClues.filter(c => c.type === 'extra').length;
  const availExtra = allConns.filter(c => !existing.has(JSON.stringify(c))).sort(() => random() - 0.5);
  for (let i = 0; i < Math.min(availExtra.length, needed); i++) {
    const conn = availExtra[i];
    const p = rabbits.find(r => r.id === conn.parentId), c = rabbits.find(r => r.id === conn.childId);
    if (p && c) addRawClue(createDirectClueText(p, c, pick(rabbits).id), pick(rabbits).id, conn, 'extra');
  }
  cluePool = newClues;

  // Prioritize clues involving the two starting DNA relatives
  if (!additive) {
    const dnaRelIds = rabbits.filter(r => r.dnaRelation).map(r => r.id);
    const prioritized = newClues.filter(c => c.type === 'necessary' && (dnaRelIds.includes(c.conn.parentId) || dnaRelIds.includes(c.conn.childId)));
    
    if (prioritized.length > 0) {
      const queuedIds = new Set();
      // Pick up to two priority groups/clues to seed the queue
      for (let i = 0; i < 2; i++) {
        const avail = prioritized.filter(c => !queuedIds.has(c.id));
        if (avail.length === 0) break;
        const choice = pick(avail);
        const group = choice.groupId ? newClues.filter(c => c.groupId === choice.groupId) : [choice];
        group.forEach(c => {
          if (!queuedIds.has(c.id)) {
            clueQueue.push(c);
            queuedIds.add(c.id);
          }
        });
      }
    }
  }
}

// --- Simulation ---
function runSimulation() {
  const mPool = [...MALE_NAMES].sort(() => random() - 0.5);
  const fPool = [...FEMALE_NAMES].sort(() => random() - 0.5);
  
  // Pick victim before populating the world
  const vSex = random() < 0.5 ? 'M' : 'F';
  const vPool = vSex === 'M' ? mPool : fPool;
  victim = { name: vPool.pop(), species: pick(SPECIES), sex: vSex };
  
  const g0 = [];
  // Founders further back to prevent negative ages. Shrunk to 10 for smaller population.
  for (let i = 0; i < 10; i++) {
    const sex = i < 5 ? 'M' : 'F';
    const pool = sex === 'M' ? mPool : fPool;
    if (pool.length === 0) break;
    const r = new AnimalRecord(pool.pop(), sex, CURRENT_YEAR - 140 + Math.floor(random() * 20), 0, pick(SPECIES));
    g0.push(r); rabbits.push(r);
  }
  let prev = g0;
  for (let gen = 1; gen <= 4; gen++) {
    const next = [];
    let ms = prev.filter(r => r.sex === 'M').sort(() => random() - 0.5);
    let fs = prev.filter(r => r.sex === 'F').sort(() => random() - 0.5);
    const pairs = Math.min(ms.length, fs.length);
    for (let i = 0; i < pairs; i++) {
      const children = 1 + Math.floor(random() * 3);
      for (let c = 0; c < children; c++) {
        const sex = random() < 0.5 ? 'M' : 'F';
        const pool = sex === 'M' ? mPool : fPool;
        if (pool.length === 0) continue;
        // Tighter age gap to keep within CURRENT_YEAR
        let bYear = fs[i].birthYear + 20 + Math.floor(random() * 20);
        if (bYear >= CURRENT_YEAR) bYear = CURRENT_YEAR - 1 - Math.floor(random() * 5);
        const child = new AnimalRecord(pool.pop(), sex, bYear, gen, random() < 0.5 ? ms[i].species : fs[i].species, ms[i].id, fs[i].id);
        next.push(child); rabbits.push(child);
      }
    }
    prev = next;
  }

  const cands = rabbits.filter(r => r.generation >= 3).sort(() => random() - 0.5);
  let found = false;
  for (const cand of cands) {
    const killer = cand;
    const relatives = rabbits.filter(r => r.id !== killer.id)
      .map(r => {
        const common = getCommonAncestors(killer.id, r.id);
        const label = getRelationshipLabel(common, killer.id, r.id);
        const n = (common.length > 0) ? (Math.min(common[0].dist1, common[0].dist2) - 1) : -1;
        return { r, common, label, n };
      })
      // We want cousins (n >= 1). 1st cousins (n=1) are okay but 2nd+ (n>=2) are better.
      .filter(e => e.label && e.label.includes("cousin") && e.n >= 1);

    if (relatives.length >= 2) {
      // Find two relatives that are the MOST distantly related to EACH OTHER
      let bestPair = null;
      let maxDist = -1;
      
      // Sample a subset if there are too many to avoid O(N^2) performance issues
      const sampleSize = Math.min(relatives.length, 20);
      const sample = relatives.sort(() => random() - 0.5).slice(0, sampleSize);
      
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

  if (!found) {
    killerId = (cands[0] || rabbits[rabbits.length - 1]).id;
    const others = rabbits.filter(r => r.id !== killerId)
      .map(r => ({ r, common: getCommonAncestors(killerId, r.id) }))
      .filter(e => e.common.length > 0)
      .sort((a, b) => (b.common[0].dist1 + b.common[0].dist2) - (a.common[0].dist1 + a.common[0].dist2));
    
    if (others.length >= 2) {
      others[0].r.dnaRelation = getRelationshipLabel(others[0].common, killerId, others[0].r.id) || "distant relative";
      others[1].r.dnaRelation = getRelationshipLabel(others[1].common, killerId, others[1].r.id) || "distant relative";
    }
  }
  updateNecessaryConnections();
  generateCluePool();
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
    } else {
      hares.forEach(o => { if (o === this || o.targetX !== null) return; const dx = this.x - o.x, dy = this.y - o.y, d2 = dx * dx + dy * dy; if (d2 < 1600 && d2 > 0) { const d = Math.sqrt(d2); this.vx += (dx / d) * 0.2; this.vy += (dy / d) * 0.2; } });
      if (this.state !== 'idle') { const s = this.state === 'walk' ? 1 : 2.5, curr = Math.sqrt(this.vx * this.vx + this.vy * this.vy); if (curr > s) { this.vx = (this.vx / curr) * s; this.vy = (this.vy / curr) * s; } }
      if (--this.moveTimer <= 0) this.setRandomBehavior();
    }
    if (this.state !== 'idle') this.updateDir();
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0) { this.x = 0; this.vx *= -1; } else if (this.x > FIELD_WIDTH) { this.x = FIELD_WIDTH; this.vx *= -1; }
    if (this.y < 0) { this.y = 0; this.vy *= -1; } else if (this.y > FIELD_HEIGHT) { this.y = FIELD_HEIGHT; this.vy *= -1; }
    this.frameTimer += this.frameSpeed;
    const spr = sprites[this.rabbit.species][this.state];
    const max = Math.floor((spr.width || 32) / FRAME_SIZE);
    if (this.frameTimer >= max) this.frameTimer = 0;
    this.frame = Math.floor(this.frameTimer);
  }
  draw() {
    const sx = (this.x - camera.x) * camera.zoom, sy = (this.y - camera.y) * camera.zoom, sz = FRAME_SIZE * 2 * camera.zoom;
    // Account for labels and speech bubbles in culling
    if (sx < -sz * 2 || sx > canvas.width + sz || sy < -sz * 2 || sy > canvas.height + sz) return;
    let d = this.direction; if (this.rabbit.species === 'Fox' && this.state === 'run') { if (d === 2) d = 3; else if (d === 3) d = 2; }
    ctx.save();
    ctx.filter = `hue-rotate(${this.rabbit.tint.hue}deg) saturate(${this.rabbit.tint.saturate}%) brightness(${this.rabbit.tint.brightness}%)`;
    ctx.drawImage(sprites[this.rabbit.species][this.state], this.frame * FRAME_SIZE, d * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE, Math.floor(sx), Math.floor(sy), sz, sz);
    ctx.restore();
    if (selectedHare === this) {
      const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.9;
      ctx.beginPath();
      ctx.ellipse(sx + sz / 2, sy + sz * 0.9, sz * 0.4 * pulse, sz * 0.2 * pulse, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#44ff44';
      ctx.lineWidth = 3 * camera.zoom;
      ctx.stroke();
      ctx.shadowBlur = 10 * camera.zoom;
      ctx.shadowColor = '#44ff44';
      ctx.stroke();
      ctx.shadowBlur = 0;
      const textAlpha = Math.sin(Date.now() / 200) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(68, 255, 68, ${textAlpha})`;
      ctx.font = `bold ${Math.max(10, Math.floor(10 * camera.zoom))}px monospace`;
      ctx.fillText("SELECT RELATIVE", sx + sz / 2, sy - 40 * camera.zoom);
    }
    const fontSize = Math.max(10, Math.floor(12 * camera.zoom));
    ctx.font = `${fontSize}px monospace`; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.shadowBlur = 2; ctx.shadowColor = 'black';
    ctx.fillText(`${this.rabbit.firstName} (${CURRENT_YEAR - this.rabbit.birthYear})`, sx + sz / 2, sy + sz + 10 * camera.zoom);
    if (this.rabbit.dnaRelation) { 
      ctx.font = `bold ${fontSize}px Arial`; ctx.fillStyle = '#44ff44'; 
      const labelY = Math.max(fontSize + 5, sy - 10 * camera.zoom); // Clamp to screen top
      ctx.fillText(`🧬 ${this.rabbit.dnaRelation}`, sx + sz / 2, labelY); 
    }
    const clue = activeClues.get(this.rabbit.id);
    if (clue) {
      const isR = clue.isRead, m = isR ? 0.6 : 1.0, bx = sx + sz * 0.8, by = sy - 15 * camera.zoom, bw = 30 * camera.zoom * m, bh = 25 * camera.zoom * m, r = 5 * camera.zoom * m;
      const s = Math.max(0, Math.min(100, this.rabbit.tint.saturate)), l = Math.max(0, Math.min(100, this.rabbit.tint.brightness));
      ctx.fillStyle = isR ? 'rgba(150, 150, 150, 0.6)' : `hsla(${this.rabbit.tint.hue}, ${s}%, ${l}%, 0.9)`;
      ctx.beginPath(); ctx.moveTo(bx + r, by - bh); ctx.lineTo(bx + bw - r, by - bh); ctx.quadraticCurveTo(bx + bw, by - bh, bx + bw, by - bh + r); ctx.lineTo(bx + bw, by - r); ctx.quadraticCurveTo(bx + bw, by, bx + bw - r, by); ctx.lineTo(bx + r, by); ctx.quadraticCurveTo(bx, by, bx, by - r); ctx.lineTo(bx, by - bh + r); ctx.quadraticCurveTo(bx, by - bh, bx + r, by - bh); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx + 5 * camera.zoom * m, by); ctx.lineTo(bx + 15 * camera.zoom * m, by); ctx.lineTo(bx + 10 * camera.zoom * m, by + 5 * camera.zoom * m); ctx.fill();
      if (!isR) { ctx.fillStyle = 'white'; ctx.font = `bold ${Math.floor(14 * camera.zoom)}px Arial`; ctx.fillText('?', bx + bw / 2, by - bh / 2 + 5 * camera.zoom); }
    }
    ctx.shadowBlur = 0;
  }
}

// --- UI & Input ---
function updateTreeDiagram() {
  const sx = 200, sy = 200, spx = 150, spy = 150;
  const hareToTree = new Map(), trees = [];
  playerConnections.forEach(c => {
    let tA = hareToTree.get(c.parentId), tB = hareToTree.get(c.childId);
    if (tA && tB && tA !== tB) { tA.push(...tB); tB.forEach(id => hareToTree.set(id, tA)); trees.splice(trees.indexOf(tB), 1); }
    else if (tA) { if (!tA.includes(c.childId)) { tA.push(c.childId); hareToTree.set(c.childId, tA); } }
    else if (tB) { if (!tB.includes(c.parentId)) { tB.push(c.parentId); hareToTree.set(c.parentId, tB); } }
    else { const n = [c.parentId, c.childId]; trees.push(n); hareToTree.set(c.parentId, n); hareToTree.set(c.childId, n); }
  });
  hares.forEach(h => { if (!hareToTree.has(h.rabbit.id)) { h.targetX = h.targetY = null; } });
  let currX = sx;
  trees.forEach(t => {
    const roots = t.filter(id => !playerConnections.some(c => c.childId === id));
    const lvls = new Map();
    const walk = (id, l) => { lvls.set(id, Math.max(lvls.get(id) || 0, l)); playerConnections.filter(c => c.parentId === id).forEach(c => walk(c.childId, l + 1)); };
    roots.forEach(r => walk(r, 0));
    const grps = []; lvls.forEach((l, id) => { if (!grps[l]) grps[l] = []; grps[l].push(id); });
    let maxW = 0;
    grps.forEach((ids, l) => { ids.forEach((id, i) => { const h = hares.find(ha => ha.rabbit.id === id); h.targetX = currX + i * spx; h.targetY = sy + l * spy; }); maxW = Math.max(maxW, ids.length * spx); });
    currX += maxW + spx;
  });
}

const sPanel = document.getElementById('selection-panel'), sName = document.getElementById('selected-name'), sSpec = document.getElementById('selected-species'), dnaBtn = document.getElementById('dna-test-btn'), tCount = document.getElementById('tests-count'), accBtn = document.getElementById('accuse-btn'), gOver = document.getElementById('game-over'), gTitle = document.getElementById('game-over-title'), gMsg = document.getElementById('game-over-msg');

function updateUI() {
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

let introStep = 0;
let introAnimFrame = 0;
let introAnimTimer = 0;
let introHandle = null;

function showIntro() {
  const modal = document.getElementById('intro-modal');
  const title = document.getElementById('intro-title');
  const textContainer = document.getElementById('intro-text');
  const btn = document.getElementById('intro-next');
  const iCanvas = document.getElementById('introCanvas');
  const iCtx = iCanvas.getContext('2d');
  
  modal.style.display = 'flex';
  
  if (introHandle) cancelAnimationFrame(introHandle);
  
  const killer = rabbits.find(r => r.id === killerId);
  const relatives = rabbits.filter(r => r.dnaRelation).map(r => ({
    ...r,
    animal: hares.find(h => h.rabbit.id === r.id)
  }));

  function introLoop() {
    iCtx.clearRect(0, 0, iCanvas.width, iCanvas.height);
    iCtx.imageSmoothingEnabled = false;
    
    const centerX = iCanvas.width / 2;
    const centerY = iCanvas.height / 2;

    if (introStep === 0) {
      title.textContent = "A HEINOUS CRIME";
      textContainer.textContent = `${victim.name} the ${victim.species.replace('_', ' ')} was found dead in the clover field.`;
      
      // Animate victim death (play once and stay)
      introAnimTimer += 0.08;
      const frame = Math.min(5, Math.floor(introAnimTimer));
      const spr = sprites[victim.species].death;
      // Draw at 2x size on the higher res canvas
      iCtx.drawImage(spr, frame * 32, 0, 32, 32, centerX - 32, centerY - 32, 64, 64);
      btn.textContent = "NEXT";
    } else if (introStep === 1) {
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
    } else if (introStep === 2) {
      title.textContent = "DNA EVIDENCE";
      textContainer.textContent = "The killer has two distant relatives in the DNA database.";
      
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
        iCtx.fillStyle = 'white';
        iCtx.font = '14px monospace';
        iCtx.textAlign = 'center';
        iCtx.fillText(rel.firstName, rx + 32, ry + 80);
      });
      btn.textContent = "NEXT";
    } else if (introStep === 3) {
      title.textContent = "SOLVE THE CASE";
      textContainer.textContent = "Talk to the animals for clues and use your 3 DNA tests wisely.";
      
      iCtx.font = "30px Arial";
      iCtx.textAlign = "center";
      iCtx.textBaseline = "middle";
      iCtx.fillText("🔍", centerX, centerY);
      btn.textContent = "START INVESTIGATION";
    } else {
      modal.style.display = 'none';
      introStep = 0;
      introAnimTimer = 0;
      return;
    }
    
    introHandle = requestAnimationFrame(introLoop);
  }
  
  introLoop();
}

function init() {
  runSimulation();
  rabbits.forEach(r => hares.push(new Animal(r)));

  // Initialize environment details
  const detailCount = 500;
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
  camera.zoom = Math.min(canvas.width / FIELD_WIDTH, canvas.height / FIELD_HEIGHT); constrainCamera();

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX), y = e.clientY || (e.touches && e.touches[0].clientY);
    return { x: (x - rect.left) / camera.zoom + camera.x, y: (y - rect.top) / camera.zoom + camera.y, cx: x, cy: y };
  };

  const handleAct = (wx, wy, cx, cy) => {
    for (const h of hares) {
      const clue = activeClues.get(h.rabbit.id);
      if (clue) {
        const m = clue.isRead ? 0.6 : 1.0, bw = 30 * m, bh = 25 * m, bx = h.x + FRAME_SIZE * 1.6, by = h.y - 15;
        if (wx >= bx - 5 && wx <= bx + bw + 5 && wy >= by - bh - 5 && wy <= by + 5) { clue.isRead = true; notifications.push({ text: clue.text, x: cx, y: cy - 20, timer: 360, timerMax: 360, color: '#fff' }); return true; }
      }
    }
    const cToP = new Map(); playerConnections.forEach(c => { if (!cToP.has(c.childId)) cToP.set(c.childId, []); cToP.get(c.childId).push(c); });
    for (const [cid, conns] of cToP) {
      const child = hares.find(h => h.rabbit.id === cid); if (!child) continue;
      const py = conns.reduce((s, c) => s + (hares.find(h => h.rabbit.id === c.parentId).y + FRAME_SIZE), 0) / conns.length, midY = (py + child.y + FRAME_SIZE) / 2;
      for (const c of conns) {
        const p = hares.find(h => h.rabbit.id === c.parentId); if (selectedHare !== p && selectedHare !== child) continue;
        if (Math.hypot(wx - (p.x + FRAME_SIZE), wy - (p.y + FRAME_SIZE + midY) / 2) < 25 / camera.zoom) { playerConnections.splice(playerConnections.indexOf(c), 1); updateTreeDiagram(); notifications.push({ text: "Removed", x: cx, y: cy - 20, timer: 60, timerMax: 60, color: '#f44' }); return true; }
      }
    }
    const clicked = hares.find(h => wx >= h.x && wx <= h.x + FRAME_SIZE * 2 && wy >= h.y && wy <= h.y + FRAME_SIZE * 2);
    if (clicked) {
      if (selectedHare && selectedHare !== clicked) {
        const p = selectedHare.rabbit.birthYear <= clicked.rabbit.birthYear ? selectedHare : clicked, c = p === selectedHare ? clicked : selectedHare;
        if (playerConnections.some(conn => conn.childId === c.rabbit.id && rabbits.find(r => r.id === conn.parentId).sex === p.rabbit.sex)) notifications.push({ text: `${c.rabbit.firstName} already has a ${p.rabbit.sex === 'M' ? 'father' : 'mother'}!`, x: cx, y: cy, timer: 120, timerMax: 120 });
        else if (!playerConnections.some(conn => conn.parentId === p.rabbit.id && conn.childId === c.rabbit.id)) { playerConnections.push({ parentId: p.rabbit.id, childId: c.rabbit.id }); updateTreeDiagram(); notifications.push({ text: "Linked!", x: cx, y: cy - 20, timer: 60, timerMax: 60, color: '#44ff44' }); }
        selectedHare = null;
      } else selectedHare = clicked;
      updateUI(); return true;
    }
    return false;
  };

  canvas.addEventListener('mousedown', e => { const p = getPos(e); if (!handleAct(p.x, p.y, p.cx, p.cy)) { selectedHare = null; updateUI(); input.isDragging = true; input.lastMouseX = p.cx; input.lastMouseY = p.cy; } });
  window.addEventListener('mousemove', e => { if (input.isDragging) { camera.x -= (e.clientX - input.lastMouseX) / camera.zoom; camera.y -= (e.clientY - input.lastMouseY) / camera.zoom; input.lastMouseX = e.clientX; input.lastMouseY = e.clientY; constrainCamera(); } });
  window.addEventListener('mouseup', () => input.isDragging = false);
  canvas.addEventListener('wheel', e => { e.preventDefault(); const p = getPos(e), oldZ = camera.zoom; camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom * Math.pow(1.1, -e.deltaY / 100))); camera.x += (p.x - camera.x) * (1 - oldZ / camera.zoom); camera.y += (p.y - camera.y) * (1 - oldZ / camera.zoom); constrainCamera(); }, { passive: false });
  canvas.addEventListener('touchstart', e => { e.preventDefault(); if (e.touches.length === 1) { const p = getPos(e); if (!handleAct(p.x, p.y, p.cx, p.cy)) { selectedHare = null; updateUI(); input.isDragging = true; input.lastMouseX = p.cx; input.lastMouseY = p.cy; } } else if (e.touches.length === 2) { input.isDragging = false; input.lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); } }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); if (e.touches.length === 1 && input.isDragging) { const p = getPos(e); camera.x -= (p.cx - input.lastMouseX) / camera.zoom; camera.y -= (p.cy - input.lastMouseY) / camera.zoom; input.lastMouseX = p.cx; input.lastMouseY = p.cy; constrainCamera(); } else if (e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), midX = (e.touches[0].clientX + e.touches[1].clientX) / 2, midY = (e.touches[0].clientY + e.touches[1].clientY) / 2, rect = canvas.getBoundingClientRect(), wx = (midX - rect.left) / camera.zoom + camera.x, wy = (midY - rect.top) / camera.zoom + camera.y, oldZ = camera.zoom; camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom * (d / input.lastTouchDist))); camera.x += (wx - camera.x) * (1 - oldZ / camera.zoom); camera.y += (wy - camera.y) * (1 - oldZ / camera.zoom); input.lastTouchDist = d; constrainCamera(); } }, { passive: false });
  canvas.addEventListener('touchend', () => { input.isDragging = false; input.lastTouchDist = 0; });
  dnaBtn.addEventListener('pointerdown', e => e.stopPropagation());
  dnaBtn.addEventListener('click', e => {
    e.preventDefault(); if (!selectedHare || dnaTestsRemaining <= 0 || selectedHare.rabbit.isTested) return;
    if (selectedHare.rabbit.id === killerId) { gOver.style.display = 'block'; gTitle.textContent = 'CASE SOLVED!'; gTitle.style.color = '#44ff44'; gMsg.textContent = `DNA confirmed ${selectedHare.rabbit.firstName} as the killer!`; return; }
    const rel = getRelationshipLabel(getCommonAncestors(killerId, selectedHare.rabbit.id), killerId, selectedHare.rabbit.id);
    selectedHare.rabbit.dnaRelation = rel || "no relation"; selectedHare.rabbit.isTested = true; dnaTestsRemaining--; tCount.textContent = dnaTestsRemaining;
    if (rel) { updateNecessaryConnections(); generateCluePool(true); }
    updateUI();
  });
  accBtn.addEventListener('pointerdown', e => e.stopPropagation());
  accBtn.addEventListener('click', e => {
    e.preventDefault(); if (!selectedHare || dnaTestsRemaining > 0) return;
    gOver.style.display = 'block';
    if (selectedHare.rabbit.id === killerId) { gTitle.textContent = 'CASE SOLVED!'; gTitle.style.color = '#44ff44'; gMsg.textContent = `Correct! ${selectedHare.rabbit.firstName} was the killer.`; }
    else { gTitle.textContent = 'WRONG SUSPECT!'; gTitle.style.color = '#ff4444'; const k = rabbits.find(r => r.id === killerId); gMsg.textContent = `${selectedHare.rabbit.firstName} was innocent. It was ${k.firstName}!`; }
  });

  document.getElementById('intro-next').addEventListener('click', () => {
    introStep++;
    showIntro();
  });

  document.getElementById('help-btn').addEventListener('click', () => {
    introStep = 0;
    showIntro();
  });

  showIntro();
  loop();
}

function constrainCamera() {
  const vw = canvas.width / camera.zoom, vh = canvas.height / camera.zoom;
  if (vw > FIELD_WIDTH) camera.x = (FIELD_WIDTH - vw) / 2; else camera.x = Math.max(0, Math.min(FIELD_WIDTH - vw, camera.x));
  if (vh > FIELD_HEIGHT) camera.y = (FIELD_HEIGHT - vh) / 2; else camera.y = Math.max(0, Math.min(FIELD_HEIGHT - vh, camera.y));
}

function loop() {
  if (++lastClueTime >= CLUE_INTERVAL) {
    lastClueTime = 0;
    if (Array.from(activeClues.values()).filter(c => !c.isRead).length < 3) {
      const issuedIds = new Set(Array.from(activeClues.values()).map(c => c.id));
      
      // If queue is empty, pick a new clue/group from pool
      if (clueQueue.length === 0) {
        const avail = cluePool.filter(c => !issuedIds.has(c.id));
        if (avail.length > 0) {
          const next = pick(avail);
          if (next.groupId) {
            // Add entire group to queue
            const group = cluePool.filter(c => c.groupId === next.groupId && !issuedIds.has(c.id));
            clueQueue.push(...group);
          } else {
            clueQueue.push(next);
          }
        }
      }

      // Issue from queue
      if (clueQueue.length > 0) {
        const c = clueQueue.shift();
        let tid = c.speakerId;
        // Find a speaker if original is taken
        if (activeClues.has(tid)) {
          const free = hares.filter(h => !activeClues.has(h.rabbit.id));
          if (free.length > 0) tid = pick(free).rabbit.id; else tid = null;
        }
        if (tid) activeClues.set(tid, c);
      }
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; const sp = 100 * camera.zoom;
  for (let x = (-camera.x * camera.zoom) % sp; x < canvas.width; x += sp) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = (-camera.y * camera.zoom) % sp; y < canvas.height; y += sp) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  
  // Draw grass sprites
  envDetails.forEach(d => {
    const img = grassSprites[d.spriteIndex];
    const sw = img.width, sh = img.height;
    const sx = (d.x - camera.x) * camera.zoom, sy = (d.y - camera.y) * camera.zoom;
    const szW = sw * d.scale * camera.zoom, szH = sh * d.scale * camera.zoom;
    if (sx < -szW || sx > canvas.width || sy < -szH || sy > canvas.height) return;
    ctx.drawImage(img, Math.floor(sx), Math.floor(sy), Math.floor(szW), Math.floor(szH));
  });

  ctx.save(); ctx.font = 'bold 24px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillText('mystery.farm', 20, 40); ctx.restore();
  
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2 * camera.zoom;
  const cByC = new Map(); playerConnections.forEach(c => { if (!cByC.has(c.childId)) cByC.set(c.childId, []); cByC.get(c.childId).push(c); });
  cByC.forEach((conns, cid) => {
    const c = hares.find(h => h.rabbit.id === cid); if (!c) return;
    const cx = (c.x - camera.x + FRAME_SIZE) * camera.zoom, cy = (c.y - camera.y + FRAME_SIZE) * camera.zoom;
    const ps = conns.map(co => hares.find(h => h.rabbit.id === co.parentId)).filter(Boolean);
    const midY = ((ps.reduce((s, p) => s + (p.y - camera.y + FRAME_SIZE), 0) / ps.length + c.y - camera.y + FRAME_SIZE) / 2) * camera.zoom;
    ps.forEach(p => {
      const px = (p.x - camera.x + FRAME_SIZE) * camera.zoom, py = (p.y - camera.y + FRAME_SIZE) * camera.zoom;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, midY); ctx.lineTo(cx, midY); ctx.lineTo(cx, cy); ctx.stroke();
      if (selectedHare === p || selectedHare === c) {
        ctx.fillStyle = '#f44'; ctx.beginPath(); ctx.arc(px, (py + midY) / 2, 10 * camera.zoom, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.floor(12 * camera.zoom)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('X', px, (py + midY) / 2);
      }
    });
  });

  hares.sort((a, b) => a.y - b.y).forEach(h => { h.update(); h.draw(); });
  for (let i = notifications.length - 1; i >= 0; i--) {
    const n = notifications[i]; ctx.font = 'bold 18px Arial'; ctx.fillStyle = n.color || '#f44'; ctx.globalAlpha = Math.min(1, n.timer / 30); ctx.textAlign = 'center'; ctx.shadowBlur = 4; ctx.shadowColor = 'black';
    const maxT = n.timerMax || 360, fO = (maxT - n.timer) * 0.2, tY = n.y - fO, cY = Math.max(40, tY);
    ctx.fillText(n.text, n.x, cY); ctx.shadowBlur = 0; ctx.globalAlpha = 1; if (--n.timer <= 0) notifications.splice(i, 1);
  }
  requestAnimationFrame(loop);
}
