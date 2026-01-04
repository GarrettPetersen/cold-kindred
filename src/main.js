const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FIELD_WIDTH = 1200;
const FIELD_HEIGHT = 1200;
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
const MALE_NAMES = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Alexander', 'Raymond', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Nathan', 'Henry', 'Zachary', 'Douglas', 'Peter', 'Kyle', 'Noah', 'Ethan', 'Jeremy', 'Walter', 'Christian', 'Keith', 'Roger', 'Terry', 'Austin', 'Sean', 'Gerald', 'Carl', 'Harold', 'Dylan', 'Arthur', 'Lawrence', 'Jordan', 'Jesse', 'Bryan', 'Billy', 'Bruce', 'Gabriel', 'Logan', 'Alan', 'Juan', 'Roy', 'Ralph', 'Randy', 'Eugene', 'Vincent', 'Bobby', 'Russell', 'Louis', 'Philip', 'Johnny', 'Miguel', 'Caleb', 'Lucas', 'Alfred', 'Bradley', 'Oliver', 'Liam', 'Mason', 'Elias', 'Hudson', 'Hunter', 'Asher', 'Silas', 'Leo', 'Finn', 'Arlo', 'Milo', 'Felix', 'Jasper', 'Oscar', 'Theo', 'Hugo', 'Otto', 'Barnaby', 'Bartholomew', 'Benedict', 'Bram', 'Casper', 'Clement', 'Cyril', 'Dexter', 'Edmund', 'Ernest', 'Atticus', 'Augustus', 'Basil', 'Bear', 'Beau', 'Beckett', 'Bennett', 'Brooks', 'Caspian', 'Cato', 'Cedric', 'Chester', 'Conrad', 'Darwin', 'Dash', 'Dorian', 'Elio', 'Emmett', 'Enzo', 'Evander', 'Ezra', 'Flynn', 'Gideon', 'Gulliver', 'Hamish', 'Harvey', 'Ilo', 'Indigo', 'Jude', 'Julian', 'Kit', 'Knox', 'Lachlan', 'Leander', 'Linus', 'Lucian', 'Magnus', 'Malachi', 'Monty', 'Nico', 'Orion', 'Otis', 'Pascal', 'Phineas', 'Quill', 'Rafe', 'Remy', 'Rory', 'Rufus', 'Sacha', 'Sebastian', 'Stellan', 'Sylvan', 'Teddy', 'Tobias', 'Wilder', 'Xander', 'Zane', 'Ziggy'];
const FEMALE_NAMES = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia', 'Kathleen', 'Amy', 'Shirley', 'Angela', 'Helen', 'Anna', 'Brenda', 'Pamela', 'Nicole', 'Emma', 'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Catherine', 'Carolyn', 'Janet', 'Ruth', 'Maria', 'Heather', 'Diane', 'Virginia', 'Julie', 'Joyce', 'Victoria', 'Olivia', 'Kelly', 'Christina', 'Lauren', 'Joan', 'Evelyn', 'Judith', 'Megan', 'Andrea', 'Cheryl', 'Hannah', 'Jacqueline', 'Martha', 'Gloria', 'Teresa', 'Ann', 'Sara', 'Madison', 'Frances', 'Kathryn', 'Jean', 'Abigail', 'Alice', 'Julia', 'Judy', 'Sophia', 'Grace', 'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle', 'Beverly', 'Isabella', 'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Rose', 'Alexis', 'Kayla', 'Lori', 'Faith', 'Luna', 'Willow', 'Hazel', 'Ivy', 'Violet', 'Aurora', 'Iris', 'Juniper', 'Flora', 'Clementine', 'Beatrix', 'Clara', 'Eloise', 'Genevieve', 'Matilda', 'Penelope', 'Rosemary', 'Tabitha', 'Winifred', 'Zelda', 'Ada', 'Beatrice', 'Cora', 'Daphne', 'Edith', 'Florence', 'Greta', 'Hattie', 'Imogen', 'Lottie', 'Aisling', 'Alya', 'Amelie', 'Anouk', 'Ariadne', 'Aurelia', 'Calliope', 'Cecily', 'Cleo', 'Cosima', 'Delphine', 'Elowen', 'Elspeth', 'Esmé', 'Eulalie', 'Faye', 'Freya', 'Gaia', 'Ines', 'Ione', 'Isadora', 'Juno', 'Kaia', 'Lark', 'Lyra', 'Maeve', 'Maia', 'Margot', 'Marlowe', 'Mina', 'Mira', 'Nell', 'Niamh', 'Odette', 'Ophelia', 'Orla', 'Ottilie', 'Paloma', 'Pearl', 'Petra', 'Phoebe', 'Pixie', 'Poppy', 'Primrose', 'Ramona', 'Rhea', 'Romilly', 'Saffron', 'Saskia', 'Seraphina', 'Tallulah', 'Thea', 'Veda', 'Willa', 'Xanthe', 'Yara', 'Zinnia', 'Zora', 'Zosia', 'Zuzanna'];

// --- Asset loading ---
const SPECIES = ['Hare', 'Boar', 'Deer', 'Fox', 'Black_grouse'];
const sprites = {};
SPECIES.forEach(s => { sprites[s] = { idle: new Image(), walk: new Image(), run: new Image() }; });
let assetsLoaded = 0;
const TOTAL_ASSETS = SPECIES.length * 3;
function onAssetLoad() { if (++assetsLoaded === TOTAL_ASSETS) init(); }
SPECIES.forEach(s => {
  const walkFile = s === 'Fox' ? 'Fox_walk_with_shadow.png' : `${s}_Walk_with_shadow.png`;
  const runFile = s === 'Black_grouse' ? 'Black_grouse_Flight_with_shadow.png' : `${s}_Run_with_shadow.png`;
  sprites[s].idle.src = `/assets/${s}/${s}_Idle_with_shadow.png`;
  sprites[s].walk.src = `/assets/${s}/${walkFile}`;
  sprites[s].run.src = `/assets/${s}/${runFile}`;
  sprites[s].idle.onload = sprites[s].walk.onload = sprites[s].run.onload = onAssetLoad;
});

// --- State ---
const rabbits = [];
let nextRabbitId = 1;
const playerConnections = [];
let selectedHare = null;
let killerId = null;
let dnaTestsRemaining = 3;
const notifications = [];
let necessaryConnections = [];
let cluePool = [];
let activeClues = new Map();
let lastClueTime = 0;
const CLUE_INTERVAL = 120;
const hares = [];

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

function getRelationshipLabel(common) {
  if (!common || common.length === 0) return null;
  const closest = common.reduce((min, c) => (c.dist1 + c.dist2 < min.dist1 + min.dist2 ? c : min), common[0]);
  const n = Math.min(closest.dist1, closest.dist2) - 1;
  const removed = Math.abs(closest.dist1 - closest.dist2);
  if (n < 1) return null;
  const ords = ["", "1st", "2nd", "3rd", "4th", "5th"];
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
  function add(text, speakerId, conn, type) {
    if (newClues.length >= rabbits.length * 0.8) return; // Cap clues at 80% of population
    newClues.push({ id: Math.random().toString(36).substring(2, 11), text, speakerId, conn, type, isRead: false });
  };

  necessaryConnections.forEach(conn => {
    if (existing.has(JSON.stringify(conn))) return;
    const p = rabbits.find(r => r.id === conn.parentId);
    const c = rabbits.find(r => r.id === conn.childId);
    if (!p || !c) return;
    const r = random();
    if (r < 0.5) add(`${p.firstName} is my ${p.sex === 'M' ? 'father' : 'mother'}.`, c.id, conn, 'necessary');
    else add(`${c.firstName} is my ${c.sex === 'M' ? 'son' : 'daughter'}.`, p.id, conn, 'necessary');
    existing.add(JSON.stringify(conn));
  });

  const allConns = [];
  rabbits.forEach(r => { if (r.fatherId) allConns.push({ parentId: r.fatherId, childId: r.id }); if (r.motherId) allConns.push({ parentId: r.motherId, childId: r.id }); });
  const needed = Math.max(20, newClues.length) - newClues.filter(c => c.type === 'extra').length;
  const availExtra = allConns.filter(c => !existing.has(JSON.stringify(c))).sort(() => random() - 0.5);
  for (let i = 0; i < Math.min(availExtra.length, needed); i++) {
    const conn = availExtra[i];
    const p = rabbits.find(r => r.id === conn.parentId);
    const c = rabbits.find(r => r.id === conn.childId);
    add(`${p.firstName} is ${c.firstName}'s parent.`, pick(rabbits).id, conn, 'extra');
  }
  cluePool = newClues;
}

// --- Simulation ---
function runSimulation() {
  const mPool = [...MALE_NAMES].sort(() => random() - 0.5);
  const fPool = [...FEMALE_NAMES].sort(() => random() - 0.5);
  const g0 = [];
  for (let i = 0; i < 10; i++) {
    const sex = i < 5 ? 'M' : 'F';
    const pool = sex === 'M' ? mPool : fPool;
    if (pool.length === 0) break;
    const r = new AnimalRecord(pool.pop(), sex, CURRENT_YEAR - 125 + Math.floor(random() * 15), 0, pick(SPECIES));
    g0.push(r); rabbits.push(r);
  }
  let prev = g0;
  for (let gen = 1; gen <= 4; gen++) {
    const next = [];
    const ms = prev.filter(r => r.sex === 'M'), fs = prev.filter(r => r.sex === 'F');
    const pairs = Math.min(ms.length, fs.length);
    for (let i = 0; i < pairs; i++) {
      const children = 1 + Math.floor(random() * 2);
      for (let c = 0; c < children; c++) {
        const sex = random() < 0.5 ? 'M' : 'F';
        const pool = sex === 'M' ? mPool : fPool;
        if (pool.length === 0) continue;
        const child = new AnimalRecord(pool.pop(), sex, fs[i].birthYear + 18 + Math.floor(random() * 28), gen, random() < 0.5 ? ms[i].species : fs[i].species, ms[i].id, fs[i].id);
        next.push(child); rabbits.push(child);
      }
    }
    prev = next;
  }

  const cands = rabbits.filter(r => r.generation >= 3).sort(() => random() - 0.5);
  for (const cand of cands) {
    const pAnc = getAncestors(cand.fatherId), mAnc = getAncestors(cand.motherId);
    const relatives = rabbits.filter(r => r.id !== cand.id);
    const pc = relatives.filter(r => { const l = getRelationshipLabel(getCommonAncestors(cand.id, r.id)); return l && !l.startsWith("1st") && Array.from(getAncestors(r.id).keys()).some(id => pAnc.has(id)); });
    const mc = relatives.filter(r => { const l = getRelationshipLabel(getCommonAncestors(cand.id, r.id)); return l && !l.startsWith("1st") && Array.from(getAncestors(r.id).keys()).some(id => mAnc.has(id)); });
    if (pc.length > 0 && mc.length > 0) {
      killerId = cand.id;
      pc[0].dnaRelation = getRelationshipLabel(getCommonAncestors(killerId, pc[0].id));
      mc[0].dnaRelation = getRelationshipLabel(getCommonAncestors(killerId, mc[0].id));
      break;
    }
  }
  if (!killerId) killerId = rabbits[rabbits.length - 1].id;
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
    if (sx < -sz || sx > canvas.width || sy < -sz || sy > canvas.height) return;
    let d = this.direction; if (this.rabbit.species === 'Fox' && this.state === 'run') { if (d === 2) d = 3; else if (d === 3) d = 2; }
    ctx.save();
    ctx.filter = `hue-rotate(${this.rabbit.tint.hue}deg) saturate(${this.rabbit.tint.saturate}%) brightness(${this.rabbit.tint.brightness}%)`;
    ctx.drawImage(sprites[this.rabbit.species][this.state], this.frame * FRAME_SIZE, d * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE, Math.floor(sx), Math.floor(sy), sz, sz);
    ctx.restore();
    if (selectedHare === this) { ctx.beginPath(); ctx.ellipse(sx + sz / 2, sy + sz * 0.9, sz * 0.4, sz * 0.2, 0, 0, Math.PI * 2); ctx.strokeStyle = 'white'; ctx.lineWidth = 2 * camera.zoom; ctx.stroke(); }
    ctx.font = `${Math.floor(12 * camera.zoom)}px monospace`; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.shadowBlur = 2 * camera.zoom; ctx.shadowColor = 'black';
    ctx.fillText(`${this.rabbit.firstName} (${CURRENT_YEAR - this.rabbit.birthYear})`, sx + sz / 2, sy + sz + 10 * camera.zoom);
    if (this.rabbit.dnaRelation) { ctx.font = `bold ${Math.floor(12 * camera.zoom)}px Arial`; ctx.fillStyle = '#44ff44'; ctx.fillText(`🧬 ${this.rabbit.dnaRelation}`, sx + sz / 2, sy - 10 * camera.zoom); }
    const clue = activeClues.get(this.rabbit.id);
    if (clue) {
      const isR = clue.isRead, m = isR ? 0.6 : 1.0, bx = sx + sz * 0.8, by = sy - 15 * camera.zoom, bw = 30 * camera.zoom * m, bh = 25 * camera.zoom * m, r = 5 * camera.zoom * m;
      ctx.fillStyle = isR ? 'rgba(150, 150, 150, 0.6)' : `hsla(${this.rabbit.tint.hue}, ${Math.min(100, this.rabbit.tint.saturate)}%, ${Math.min(100, this.rabbit.tint.brightness)}%, 0.9)`;
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
    if (dnaTestsRemaining > 0) {
      dnaBtn.style.display = 'block'; accBtn.style.display = 'none';
      if (selectedHare.rabbit.isTested) { dnaBtn.disabled = true; dnaBtn.style.opacity = '0.5'; dnaBtn.textContent = 'ALREADY TESTED'; }
      else { dnaBtn.disabled = false; dnaBtn.style.opacity = '1.0'; dnaBtn.textContent = 'DNA TEST'; }
    } else { dnaBtn.style.display = 'none'; accBtn.style.display = 'block'; accBtn.style.opacity = '1.0'; }
  } else sPanel.style.display = 'none';
}

function init() {
  runSimulation();
  rabbits.forEach(r => hares.push(new Animal(r)));
  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; constrainCamera(); });
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  camera.zoom = Math.min(canvas.width / FIELD_WIDTH, canvas.height / FIELD_HEIGHT); constrainCamera();

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX), y = e.clientY || (e.touches && e.touches[0].clientY);
    return { x: (x - rect.left) / camera.zoom + camera.x, y: (y - rect.top) / camera.zoom + camera.y, cx: x, cy: y };
  };

  const handleAct = (wx, wy, cx, cy) => {
    const childToParents = new Map(); playerConnections.forEach(c => { if (!childToParents.has(c.childId)) childToParents.set(c.childId, []); childToParents.get(c.childId).push(c); });
    for (const [cid, conns] of childToParents) {
      const child = hares.find(h => h.rabbit.id === cid); if (!child) continue;
      const py = conns.reduce((s, c) => s + (hares.find(h => h.rabbit.id === c.parentId).y + FRAME_SIZE), 0) / conns.length, midY = (py + child.y + FRAME_SIZE) / 2;
      for (const c of conns) {
        const p = hares.find(h => h.rabbit.id === c.parentId); if (selectedHare !== p && selectedHare !== child) continue;
        if (Math.hypot(wx - (p.x + FRAME_SIZE), wy - (p.y + FRAME_SIZE + midY) / 2) < 15 / camera.zoom) { playerConnections.splice(playerConnections.indexOf(c), 1); updateTreeDiagram(); return true; }
      }
    }
    const clicked = hares.find(h => wx >= h.x && wx <= h.x + FRAME_SIZE * 2 && wy >= h.y && wy <= h.y + FRAME_SIZE * 2);
    if (clicked) {
      const clue = activeClues.get(clicked.rabbit.id);
      if (clue) {
        // Corrected hit detection for speech bubble
        const isR = clue.isRead, m = isR ? 0.6 : 1.0;
        // World-space bubble center (matching the 'draw' offsets)
        const bubbleWorldX = clicked.x + FRAME_SIZE * 1.6;
        const bubbleWorldY = clicked.y - 15 - (25 * m) / 2;
        const hitRadius = (25 * m) / camera.zoom; // Increase hit area relative to zoom
        
        if (Math.hypot(wx - bubbleWorldX, wy - bubbleWorldY) < Math.max(20, hitRadius)) {
          clue.isRead = true; 
          notifications.push({ text: clue.text, x: cx, y: cy - 40, timer: 240, color: '#fff' }); 
          return true; 
        }
      }
      if (selectedHare && selectedHare !== clicked) {
        const p = selectedHare.rabbit.birthYear <= clicked.rabbit.birthYear ? selectedHare : clicked, c = p === selectedHare ? clicked : selectedHare;
        if (playerConnections.some(conn => conn.childId === c.rabbit.id && rabbits.find(r => r.id === conn.parentId).sex === p.rabbit.sex)) notifications.push({ text: `${c.rabbit.firstName} already has a ${p.rabbit.sex === 'M' ? 'father' : 'mother'}!`, x: cx, y: cy, timer: 120 });
        else if (!playerConnections.some(conn => conn.parentId === p.rabbit.id && conn.childId === c.rabbit.id)) { playerConnections.push({ parentId: p.rabbit.id, childId: c.rabbit.id }); updateTreeDiagram(); }
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
    const rel = getRelationshipLabel(getCommonAncestors(killerId, selectedHare.rabbit.id));
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
      const issued = new Set(Array.from(activeClues.values()).map(c => c.id)), avail = cluePool.filter(c => !issued.has(c.id));
      if (avail.length > 0) {
        const c = pick(avail); let tid = c.speakerId;
        if (activeClues.has(tid)) { const free = hares.filter(h => !activeClues.has(h.rabbit.id)); if (free.length > 0) tid = pick(free).rabbit.id; else tid = null; }
        if (tid) activeClues.set(tid, c);
      }
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; const sp = 100 * camera.zoom;
  for (let x = (-camera.x * camera.zoom) % sp; x < canvas.width; x += sp) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = (-camera.y * camera.zoom) % sp; y < canvas.height; y += sp) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
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
    const n = notifications[i]; ctx.font = 'bold 16px Arial'; ctx.fillStyle = n.color || '#f44'; ctx.globalAlpha = Math.min(1, n.timer / 30); ctx.textAlign = 'center'; ctx.fillText(n.text, n.x, n.y - (120 - n.timer) * 0.5); ctx.globalAlpha = 1; if (--n.timer <= 0) notifications.splice(i, 1);
  }
  requestAnimationFrame(loop);
}
