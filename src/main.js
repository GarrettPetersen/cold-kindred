const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FIELD_WIDTH = 1200;
const FIELD_HEIGHT = 1200;
const HARE_COUNT = 100;
const FRAME_SIZE = 32;
const CURRENT_YEAR = 2025;

// --- Seeded Random ---
function getDailySeed() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
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

function pick(arr) {
  return arr[Math.floor(random() * arr.length)];
}

// --- Names ---
const MALE_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan',
  'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
  'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Alexander', 'Raymond', 'Patrick', 'Jack', 'Dennis', 'Jerry',
  'Tyler', 'Aaron', 'Jose', 'Adam', 'Nathan', 'Henry', 'Zachary', 'Douglas', 'Peter', 'Kyle',
  'Noah', 'Ethan', 'Jeremy', 'Walter', 'Christian', 'Keith', 'Roger', 'Terry', 'Austin', 'Sean',
  'Gerald', 'Carl', 'Harold', 'Dylan', 'Arthur', 'Lawrence', 'Jordan', 'Jesse', 'Bryan', 'Billy',
  'Bruce', 'Gabriel', 'Logan', 'Alan', 'Juan', 'Roy', 'Ralph', 'Randy', 'Eugene', 'Vincent',
  'Bobby', 'Russell', 'Louis', 'Philip', 'Johnny', 'Miguel', 'Caleb', 'Lucas', 'Alfred', 'Bradley',
  'Oliver', 'Liam', 'Mason', 'Ethan', 'Elias', 'Hudson', 'Hunter', 'Asher', 'Silas', 'Leo',
  'Finn', 'Arlo', 'Milo', 'Felix', 'Jasper', 'Oscar', 'Theo', 'Hugo', 'Arthur', 'Otto',
  'Barnaby', 'Bartholomew', 'Benedict', 'Bram', 'Casper', 'Clement', 'Cyril', 'Dexter', 'Edmund', 'Ernest',
  'Atticus', 'Augustus', 'Basil', 'Bear', 'Beau', 'Beckett', 'Bennett', 'Brooks', 'Caspian', 'Cato',
  'Cedric', 'Chester', 'Conrad', 'Darwin', 'Dash', 'Dorian', 'Elio', 'Emmett', 'Enzo', 'Evander',
  'Ezra', 'Flynn', 'Gideon', 'Gulliver', 'Hamish', 'Harvey', 'Ilo', 'Indigo', 'Jude', 'Julian',
  'Kit', 'Knox', 'Lachlan', 'Leander', 'Linus', 'Lucian', 'Magnus', 'Malachi', 'Monty', 'Nico',
  'Orion', 'Otis', 'Otto', 'Pascal', 'Phineas', 'Quill', 'Rafe', 'Remy', 'Rory', 'Rufus',
  'Sacha', 'Sebastian', 'Stellan', 'Sylvan', 'Teddy', 'Tobias', 'Wilder', 'Xander', 'Zane', 'Ziggy'
];

const FEMALE_NAMES = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna',
  'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia',
  'Kathleen', 'Amy', 'Shirley', 'Angela', 'Helen', 'Anna', 'Brenda', 'Pamela', 'Nicole', 'Emma',
  'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Catherine', 'Carolyn', 'Janet', 'Ruth', 'Maria',
  'Heather', 'Diane', 'Virginia', 'Julie', 'Joyce', 'Victoria', 'Olivia', 'Kelly', 'Christina', 'Lauren',
  'Joan', 'Evelyn', 'Judith', 'Megan', 'Andrea', 'Cheryl', 'Hannah', 'Jacqueline', 'Martha', 'Gloria',
  'Teresa', 'Ann', 'Sara', 'Madison', 'Frances', 'Kathryn', 'Jean', 'Abigail', 'Alice', 'Julia',
  'Judy', 'Sophia', 'Grace', 'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle', 'Beverly', 'Isabella',
  'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Rose', 'Alexis', 'Kayla', 'Lori', 'Faith',
  'Luna', 'Willow', 'Hazel', 'Ivy', 'Violet', 'Aurora', 'Iris', 'Juniper', 'Flora', 'Clementine',
  'Beatrix', 'Clara', 'Eloise', 'Genevieve', 'Matilda', 'Penelope', 'Rosemary', 'Tabitha', 'Winifred', 'Zelda',
  'Ada', 'Beatrice', 'Cora', 'Daphne', 'Edith', 'Florence', 'Greta', 'Hattie', 'Imogen', 'Lottie',
  'Aisling', 'Alya', 'Amelie', 'Anouk', 'Ariadne', 'Aurelia', 'Calliope', 'Cecily', 'Cleo', 'Cosima',
  'Delphine', 'Elowen', 'Elspeth', 'Esmé', 'Eulalie', 'Faye', 'Freya', 'Gaia', 'Ines', 'Ione',
  'Isadora', 'Juno', 'Kaia', 'Lark', 'Lyra', 'Maeve', 'Maia', 'Margot', 'Marlowe', 'Mina',
  'Mira', 'Nell', 'Niamh', 'Odette', 'Ophelia', 'Orla', 'Ottilie', 'Paloma', 'Pearl', 'Petra',
  'Phoebe', 'Pixie', 'Poppy', 'Primrose', 'Ramona', 'Rhea', 'Romilly', 'Saffron', 'Saskia', 'Seraphina',
  'Tallulah', 'Thea', 'Veda', 'Willa', 'Xanthe', 'Yara', 'Zinnia', 'Zora', 'Zosia', 'Zuzanna'
];

// --- Asset loading ---
const SPECIES = ['Hare', 'Boar', 'Deer', 'Fox', 'Black_grouse'];
const sprites = {};
SPECIES.forEach(s => {
  sprites[s] = {
    idle: new Image(),
    walk: new Image(),
    run: new Image(),
  };
});

let assetsLoaded = 0;
const TOTAL_ASSETS = SPECIES.length * 3;

function onAssetLoad() {
  assetsLoaded++;
  if (assetsLoaded === TOTAL_ASSETS) {
    init();
  }
}

SPECIES.forEach(s => {
  const walkFile = s === 'Fox' ? 'Fox_walk_with_shadow.png' : `${s}_Walk_with_shadow.png`;
  const runFile = s === 'Black_grouse' ? 'Black_grouse_Flight_with_shadow.png' : `${s}_Run_with_shadow.png`;
  
  sprites[s].idle.src = `/assets/${s}/${s}_Idle_with_shadow.png`;
  sprites[s].walk.src = `/assets/${s}/${walkFile}`;
  sprites[s].run.src = `/assets/${s}/${runFile}`;

  sprites[s].idle.onload = onAssetLoad;
  sprites[s].walk.onload = onAssetLoad;
  sprites[s].run.onload = onAssetLoad;
});

// --- Simulation Logic ---
const rabbits = []; // Array of animal records
let nextRabbitId = 1;
const playerConnections = []; // Array of { parentId, childId }
let selectedHare = null;
let killerId = null;
let dnaTestsRemaining = 3;
const notifications = []; // Array of { text, x, y, timer }

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
    this.spouseId = null;
    this.alive = true;
    
    // Visual traits
    this.tint = {
      hue: random() * 360,
      saturate: 70 + random() * 60,
      brightness: 80 + random() * 40
    };
    this.isTested = false;
    this.dnaRelation = null;
  }

  get fullName() {
    return this.firstName;
  }
}

// --- Kinship Helpers ---
function getAncestors(rabbitId) {
  const ancestors = new Map();
  const stack = [{ id: rabbitId, dist: 0 }];
  while (stack.length > 0) {
    const { id, dist } = stack.pop();
    if (dist > 0) ancestors.set(id, dist);
    const r = rabbits.find(rb => rb.id === id);
    if (r && dist < 5) {
      if (r.fatherId) stack.push({ id: r.fatherId, dist: dist + 1 });
      if (r.motherId) stack.push({ id: r.motherId, dist: dist + 1 });
    }
  }
  return ancestors;
}

function getCommonAncestors(r1Id, r2Id) {
  const a1 = getAncestors(r1Id);
  const a2 = getAncestors(r2Id);
  const common = [];
  for (const [id, dist1] of a1) {
    if (a2.has(id)) {
      common.push({ id, dist1, dist2: a2.get(id) });
    }
  }
  return common;
}

function getRelationshipLabel(commonAncestors) {
  if (commonAncestors.length === 0) return null;
  let minSum = Infinity;
  let closest = null;
  for (const a of commonAncestors) {
    if (a.dist1 + a.dist2 < minSum) {
      minSum = a.dist1 + a.dist2;
      closest = a;
    }
  }
  if (!closest) return null;
  const d1 = closest.dist1;
  const d2 = closest.dist2;
  const n = Math.min(d1, d2) - 1;
  const removed = Math.abs(d1 - d2);
  if (n < 1) return null;
  const ordinals = ["", "1st", "2nd", "3rd", "4th", "5th"];
  const removedLabels = ["", "once", "twice", "3 times", "4 times"];
  let label = `${ordinals[n] || n + "th"} cousin`;
  if (removed > 0) label += ` ${removedLabels[removed] || removed + " times"} removed`;
  return label;
}

function runSimulation() {
  // Use a shuffled pool of names to ensure uniqueness
  const malePool = [...MALE_NAMES].sort(() => random() - 0.5);
  const femalePool = [...FEMALE_NAMES].sort(() => random() - 0.5);

  // Generation 0: Founders
  const g0Count = 10; 
  const g0Rabbits = [];
  for (let i = 0; i < g0Count; i++) {
    const sex = i < g0Count / 2 ? 'M' : 'F';
    const pool = sex === 'M' ? malePool : femalePool;
    if (pool.length === 0) continue;
    
    const name = pool.pop();
    const birthYear = (CURRENT_YEAR - 125) + Math.floor(random() * 15);
    const species = pick(SPECIES);
    const r = new AnimalRecord(name, sex, birthYear, 0, species);
    g0Rabbits.push(r);
    rabbits.push(r);
  }

  let prevGen = g0Rabbits;

  for (let gen = 1; gen <= 4; gen++) {
    const nextGen = [];
    const males = prevGen.filter(r => r.sex === 'M');
    const females = prevGen.filter(r => r.sex === 'F');
    
    const shuffledMales = [...males].sort(() => random() - 0.5);
    const shuffledFemales = [...females].sort(() => random() - 0.5);
    const pairCount = Math.min(shuffledMales.length, shuffledFemales.length);

    for (let i = 0; i < pairCount; i++) {
      const m = shuffledMales[i];
      const f = shuffledFemales[i];
      m.spouseId = f.id;
      f.spouseId = m.id;
      
      const childrenCount = 1 + Math.floor(random() * 4);
      for (let c = 0; c < childrenCount; c++) {
        const sex = random() < 0.5 ? 'M' : 'F';
        const pool = sex === 'M' ? malePool : femalePool;
        if (pool.length === 0) continue;

        const name = pool.pop();
        const ageAtBirth = 18 + Math.floor(random() * 28);
        let birthYear = f.birthYear + ageAtBirth;
        if (birthYear > CURRENT_YEAR) birthYear = CURRENT_YEAR;
        
        // Inherit species from mom or dad
        const species = random() < 0.5 ? m.species : f.species;
        const child = new AnimalRecord(name, sex, birthYear, gen, species, m.id, f.id);
        nextGen.push(child);
        rabbits.push(child);
      }
    }
    prevGen = nextGen;
  }

  const isCousinLabel = (label) => {
    if (!label) return false;
    return label.includes("cousin");
  };

  const candidates = [...rabbits].filter(r => r.generation >= 3).sort(() => random() - 0.5);
  for (const candidate of candidates) {
    const paternalAncestors = getAncestors(candidate.fatherId);
    const maternalAncestors = getAncestors(candidate.motherId);
    const isPaternal = (rId) => {
      const rAnc = getAncestors(rId);
      return Array.from(paternalAncestors.keys()).some(id => rAnc.has(id));
    };
    const isMaternal = (rId) => {
      const rAnc = getAncestors(rId);
      return Array.from(maternalAncestors.keys()).some(id => rAnc.has(id));
    };
    const relatives = rabbits.filter(r => r.id !== candidate.id);
    const paternalCousins = relatives.filter(r => {
      const label = getRelationshipLabel(getCommonAncestors(candidate.id, r.id));
      return isCousinLabel(label) && !label.startsWith("1st") && isPaternal(r.id);
    });
    const maternalCousins = relatives.filter(r => {
      const label = getRelationshipLabel(getCommonAncestors(candidate.id, r.id));
      return isCousinLabel(label) && !label.startsWith("1st") && isMaternal(r.id);
    });
    if (paternalCousins.length > 0 && maternalCousins.length > 0) {
      // Find a pair that is not closely related to each other (must be on different branches)
      let foundPair = false;
      const shufP = [...paternalCousins].sort(() => random() - 0.5);
      const shufM = [...maternalCousins].sort(() => random() - 0.5);
      
      for (const p of shufP) {
        for (const m of shufM) {
          const common = getCommonAncestors(p.id, m.id);
          const crossLabel = getRelationshipLabel(common);
          // Reject if they are siblings, parent-child, or 1st cousins to each other
          const isTooClose = common.some(a => a.dist1 <= 1 || a.dist2 <= 1) || (crossLabel && crossLabel.startsWith("1st"));
          
          if (!isTooClose) {
            killerId = candidate.id;
            const pRel = p;
            const mRel = m;
            pRel.dnaRelation = getRelationshipLabel(getCommonAncestors(killerId, pRel.id));
            mRel.dnaRelation = getRelationshipLabel(getCommonAncestors(killerId, mRel.id));
            foundPair = true;
            break;
          }
        }
        if (foundPair) break;
      }
      
      if (foundPair) {
        console.log(`Secret Killer: ${candidate.firstName} (${candidate.species}) (ID: ${killerId})`);
        break;
      }
    }
  }

  // Fallback if no perfect candidate found
  if (!killerId && rabbits.length > 0) {
    const fallback = rabbits[rabbits.length - 1];
    killerId = fallback.id;
    console.log(`Fallback Killer: ${fallback.firstName} (ID: ${killerId})`);
  }
}

// --- Rendering & Game Engine ---
const camera = {
  x: FIELD_WIDTH / 2 - window.innerWidth / 2,
  y: FIELD_HEIGHT / 2 - window.innerHeight / 2,
  zoom: 1.0,
  minZoom: 0.2,
  maxZoom: 3.0
};
const input = { 
  isDragging: false, 
  lastMouseX: 0, 
  lastMouseY: 0,
  lastTouchDist: 0
};
const hares = []; // This stores Animal instances

class Animal {
  constructor(animalRecord) {
    this.rabbit = animalRecord;
    this.x = random() * FIELD_WIDTH;
    this.y = random() * FIELD_HEIGHT;
    this.targetX = null;
    this.targetY = null;
    this.state = 'idle';
    this.direction = Math.floor(random() * 4);
    this.frame = 0;
    this.frameTimer = 0;
    this.frameSpeed = 0.1;
    this.moveTimer = 0;
    this.vx = 0;
    this.vy = 0;
    this.setRandomBehavior();
  }

  setRandomBehavior() {
    const r = random();
    if (r < 0.6) {
      this.state = 'idle';
      this.vx = 0;
      this.vy = 0;
      this.frameSpeed = 0.1;
    } else if (r < 0.95) {
      this.state = 'walk';
      this.frameSpeed = 0.15;
      this.setRandomDirection(1);
    } else {
      this.state = 'run';
      this.frameSpeed = 0.25;
      this.setRandomDirection(2.5);
    }
    this.moveTimer = 60 + random() * 180;
  }

  setRandomDirection(speed) {
    const angle = Math.floor(random() * 8) * (Math.PI / 4);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.updateDirectionFromVelocity();
  }

  updateDirectionFromVelocity() {
    if (this.vx === 0 && this.vy === 0) return;
    const angle = Math.atan2(this.vy, this.vx);
    const deg = (angle * 180 / Math.PI + 360) % 360;
    if (deg >= 45 && deg < 135) this.direction = 0;
    else if (deg >= 225 && deg < 315) this.direction = 1;
    else if (deg >= 135 && deg < 225) this.direction = 2;
    else this.direction = 3;
  }

  update() {
    if (this.targetX !== null && this.targetY !== null) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        this.state = 'run';
        this.frameSpeed = 0.25;
        this.vx = (dx / dist) * 2.5;
        this.vy = (dy / dist) * 2.5;
        this.updateDirectionFromVelocity();
      } else {
        this.state = 'idle';
        this.vx = 0; this.vy = 0;
        this.x = this.targetX; this.y = this.targetY;
      }
    } else {
      const separationRadius = 40;
      const separationStrength = 0.2;
      for (const other of hares) {
        if (other === this || other.targetX !== null) continue;
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < separationRadius * separationRadius && distSq > 0) {
          const dist = Math.sqrt(distSq);
          this.vx += (dx / dist) * separationStrength;
          this.vy += (dy / dist) * separationStrength;
        }
      }
      if (this.state !== 'idle') {
        const speed = this.state === 'walk' ? 1 : 2.5;
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > speed) {
          this.vx = (this.vx / currentSpeed) * speed;
          this.vy = (this.vy / currentSpeed) * speed;
        }
      }
      this.moveTimer--;
      if (this.moveTimer <= 0) this.setRandomBehavior();
    }
    
    // Always update visual direction based on actual velocity
    if (this.state !== 'idle') {
      this.updateDirectionFromVelocity();
    }

    this.x += this.vx; this.y += this.vy;
    if (this.x < 0) { this.x = 0; this.vx *= -1; this.updateDirectionFromVelocity(); }
    else if (this.x > FIELD_WIDTH) { this.x = FIELD_WIDTH; this.vx *= -1; this.updateDirectionFromVelocity(); }
    if (this.y < 0) { this.y = 0; this.vy *= -1; this.updateDirectionFromVelocity(); }
    else if (this.y > FIELD_HEIGHT) { this.y = FIELD_HEIGHT; this.vy *= -1; this.updateDirectionFromVelocity(); }

    this.frameTimer += this.frameSpeed;
    const maxFrames = this.getMaxFrames();
    if (this.frameTimer >= maxFrames) this.frameTimer = 0;
    this.frame = Math.floor(this.frameTimer);
  }

  getMaxFrames() {
    const sprite = sprites[this.rabbit.species][this.state];
    if (!sprite || !sprite.width) return 1;
    return Math.floor(sprite.width / FRAME_SIZE);
  }

  draw() {
    const screenX = (this.x - camera.x) * camera.zoom;
    const screenY = (this.y - camera.y) * camera.zoom;
    const scaledSize = FRAME_SIZE * 2 * camera.zoom;

    if (screenX < -scaledSize || screenX > canvas.width || screenY < -scaledSize || screenY > canvas.height) return;

    const sprite = sprites[this.rabbit.species][this.state];
    
    // Species-specific row mapping overrides
    let drawDirection = this.direction;
    if (this.rabbit.species === 'Fox' && this.state === 'run') {
      // Fox has Left (row 3) and Right (row 2) swapped only in the RUN animation
      if (this.direction === 2) drawDirection = 3;
      else if (this.direction === 3) drawDirection = 2;
    }

    ctx.save();
    ctx.filter = `hue-rotate(${this.rabbit.tint.hue}deg) saturate(${this.rabbit.tint.saturate}%) brightness(${this.rabbit.tint.brightness}%)`;
    ctx.drawImage(sprite, this.frame * FRAME_SIZE, drawDirection * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE, Math.floor(screenX), Math.floor(screenY), scaledSize, scaledSize);
    ctx.restore();

    if (selectedHare === this) {
      ctx.beginPath();
      ctx.ellipse(Math.floor(screenX) + scaledSize/2, Math.floor(screenY) + scaledSize * 0.9, scaledSize * 0.4, scaledSize * 0.2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'white'; ctx.lineWidth = 2 * camera.zoom; ctx.stroke();
    }
    ctx.font = `${Math.floor(12 * camera.zoom)}px monospace`; ctx.fillStyle = 'white'; ctx.textAlign = 'center';
    ctx.shadowBlur = 2 * camera.zoom; ctx.shadowColor = 'black';
    const age = CURRENT_YEAR - this.rabbit.birthYear;
    ctx.fillText(`${this.rabbit.firstName} (${age})`, Math.floor(screenX) + scaledSize/2, Math.floor(screenY) + scaledSize + 10 * camera.zoom);
    if (this.rabbit.dnaRelation) {
      ctx.font = `bold ${Math.floor(12 * camera.zoom)}px Arial`; ctx.fillStyle = '#44ff44';
      ctx.fillText(`🧬 ${this.rabbit.dnaRelation}`, Math.floor(screenX) + scaledSize/2, Math.floor(screenY) - 10 * camera.zoom);
    }
    ctx.shadowBlur = 0;
  }
}

function updateTreeDiagram() {
  const treeSpacingX = 150; const treeSpacingY = 150; const treeStartX = 200; const treeStartY = 200;
  const hareToTree = new Map(); const trees = [];
  for (const conn of playerConnections) {
    let treeA = hareToTree.get(conn.parentId); let treeB = hareToTree.get(conn.childId);
    if (treeA && treeB && treeA !== treeB) {
      treeA.push(...treeB); for (const hareId of treeB) hareToTree.set(hareId, treeA);
      trees.splice(trees.indexOf(treeB), 1);
    } else if (treeA) { if (!treeA.includes(conn.childId)) { treeA.push(conn.childId); hareToTree.set(conn.childId, treeA); }
    } else if (treeB) { if (!treeB.includes(conn.parentId)) { treeB.push(conn.parentId); hareToTree.set(conn.parentId, treeB); }
    } else { const newTree = [conn.parentId, conn.childId]; trees.push(newTree); hareToTree.set(conn.parentId, newTree); hareToTree.set(conn.childId, newTree); }
  }
  for (const hare of hares) { if (!hareToTree.has(hare.rabbit.id)) { hare.targetX = null; hare.targetY = null; } }
  let currentTreeX = treeStartX;
  for (const treeIds of trees) {
    const roots = treeIds.filter(id => !playerConnections.some(c => c.childId === id));
    const levels = new Map();
    const processLevel = (id, level) => { levels.set(id, Math.max(levels.get(id) || 0, level)); const children = playerConnections.filter(c => c.parentId === id).map(c => c.childId); for (const childId of children) processLevel(childId, level + 1); };
    for (const root of roots) processLevel(root, 0);
    const levelGroups = [];
    levels.forEach((level, id) => { if (!levelGroups[level]) levelGroups[level] = []; levelGroups[level].push(id); });
    let maxLevelWidth = 0;
    levelGroups.forEach((ids, level) => {
      ids.forEach((id, i) => { const hare = hares.find(h => h.rabbit.id === id); hare.targetX = currentTreeX + i * treeSpacingX; hare.targetY = treeStartY + level * treeSpacingY; });
      maxLevelWidth = Math.max(maxLevelWidth, ids.length * treeSpacingX);
    });
    currentTreeX += maxLevelWidth + treeSpacingX;
  }
}

function init() {
  runSimulation();
  for (const rabbit of rabbits) { hares.push(new Animal(rabbit)); }
  window.addEventListener('resize', resize); resize();

  function getMouseWorldPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / camera.zoom + camera.x,
      y: (e.clientY - rect.top) / camera.zoom + camera.y
    };
  }

  function handleAction(worldX, worldY, clientX, clientY) {
    const connectionsByChild = new Map();
    for (const conn of playerConnections) { if (!connectionsByChild.has(conn.childId)) connectionsByChild.set(conn.childId, []); connectionsByChild.get(conn.childId).push(conn); }
    for (const [childId, conns] of connectionsByChild) {
      const child = hares.find(h => h.rabbit.id === childId); if (!child) continue;
      const childY = child.y + FRAME_SIZE; const parents = conns.map(c => hares.find(h => h.rabbit.id === c.parentId)).filter(Boolean);
      if (parents.length === 0) continue;
      const avgParentY = parents.reduce((sum, p) => sum + (p.y + FRAME_SIZE), 0) / parents.length; const midY = (avgParentY + childY) / 2;
      for (let i = 0; i < conns.length; i++) {
        const p = parents[i]; if (selectedHare !== p && selectedHare !== child) continue;
        const pX = p.x + FRAME_SIZE; const pY = p.y + FRAME_SIZE; const xX = pX; const xY = (pY + midY) / 2;
        const dist = Math.sqrt((worldX - xX) ** 2 + (worldY - xY) ** 2);
        if (dist < 15 / camera.zoom) { playerConnections.splice(playerConnections.indexOf(conns[i]), 1); updateTreeDiagram(); return true; }
      }
    }
    let clickedHare = null;
    for (const hare of hares) {
      if (worldX >= hare.x && worldX <= hare.x + FRAME_SIZE * 2 && worldY >= hare.y && worldY <= hare.y + FRAME_SIZE * 2) { clickedHare = hare; break; }
    }
    if (clickedHare) {
      if (selectedHare && selectedHare !== clickedHare) {
        const h1 = selectedHare; const h2 = clickedHare;
        const parent = h1.rabbit.birthYear <= h2.rabbit.birthYear ? h1 : h2; const child = parent === h1 ? h2 : h1;
        const parentSex = parent.rabbit.sex;
        const alreadyHasParentOfSex = playerConnections.some(c => { if (c.childId !== child.rabbit.id) return false; const existingParent = hares.find(h => h.rabbit.id === c.parentId); return existingParent && existingParent.rabbit.sex === parentSex; });
        if (alreadyHasParentOfSex) { notifications.push({ text: `${child.rabbit.firstName} already has a ${parentSex === 'M' ? 'father' : 'mother'}!`, x: clientX, y: clientY, timer: 120 });
        } else if (!playerConnections.some(c => c.parentId === parent.rabbit.id && c.childId === child.rabbit.id)) { playerConnections.push({ parentId: parent.rabbit.id, childId: child.rabbit.id }); updateTreeDiagram(); }
        selectedHare = null;
        updateSelectionPanel();
      } else { 
        selectedHare = clickedHare;
        updateSelectionPanel();
      }
      return true;
    }
    selectedHare = null;
    updateSelectionPanel();
    return false;
  }

  const selectionPanel = document.getElementById('selection-panel');
  const selectedNameEl = document.getElementById('selected-name');
  const selectedSpeciesEl = document.getElementById('selected-species');
  const dnaTestBtn = document.getElementById('dna-test-btn');
  const testsCountEl = document.getElementById('tests-count');
  const accuseBtn = document.getElementById('accuse-btn');
  const gameOverEl = document.getElementById('game-over');
  const gameOverTitle = document.getElementById('game-over-title');
  const gameOverMsg = document.getElementById('game-over-msg');

  function updateSelectionPanel() {
    if (selectedHare) {
      selectionPanel.style.display = 'block';
      selectedNameEl.textContent = `${selectedHare.rabbit.firstName} (${CURRENT_YEAR - selectedHare.rabbit.birthYear})`;
      selectedSpeciesEl.textContent = selectedHare.rabbit.species;
      
      // Update button visibility and state
      if (dnaTestsRemaining > 0) {
        dnaTestBtn.style.display = 'block';
        accuseBtn.style.display = 'none';
        
        if (selectedHare.rabbit.dnaRelation || selectedHare.rabbit.isTested) {
          dnaTestBtn.disabled = true;
          dnaTestBtn.style.opacity = '0.5';
          dnaTestBtn.textContent = 'ALREADY TESTED';
        } else {
          dnaTestBtn.disabled = false;
          dnaTestBtn.style.opacity = '1.0';
          dnaTestBtn.textContent = 'DNA TEST';
        }
      } else {
        dnaTestBtn.style.display = 'none';
        accuseBtn.style.display = 'block';
        accuseBtn.style.opacity = '1.0';
      }
    } else {
      selectionPanel.style.display = 'none';
    }
  }

  dnaTestBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); // Prevent canvas mousedown
  });

  dnaTestBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!selectedHare || dnaTestsRemaining <= 0 || selectedHare.rabbit.isTested) return;

    if (selectedHare.rabbit.id === killerId) {
      // Automatic win
      gameOverEl.style.display = 'block';
      gameOverTitle.textContent = 'CASE SOLVED!';
      gameOverTitle.style.color = '#44ff44';
      gameOverMsg.textContent = `Excellent work! DNA testing confirmed ${selectedHare.rabbit.firstName} the ${selectedHare.rabbit.species} as the killer.`;
      return;
    }

    // Reveal relationship to killer if any
    const commonAncestors = getCommonAncestors(killerId, selectedHare.rabbit.id);
    const relationship = getRelationshipLabel(commonAncestors);
    
    if (relationship) {
      selectedHare.rabbit.dnaRelation = relationship;
    } else {
      selectedHare.rabbit.dnaRelation = "no relation";
    }
    
    selectedHare.rabbit.isTested = true;
    dnaTestsRemaining--;
    testsCountEl.textContent = dnaTestsRemaining;
    updateSelectionPanel();
  });

  accuseBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
  });

  accuseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!selectedHare || dnaTestsRemaining > 0) return;
    
    gameOverEl.style.display = 'block';
    if (selectedHare.rabbit.id === killerId) {
      gameOverTitle.textContent = 'CASE SOLVED!';
      gameOverTitle.style.color = '#44ff44';
      gameOverMsg.textContent = `Excellent detective work! You correctly identified ${selectedHare.rabbit.firstName} the ${selectedHare.rabbit.species} as the secret killer.`;
    } else {
      gameOverTitle.textContent = 'WRONG SUSPECT!';
      gameOverTitle.style.color = '#ff4444';
      const killer = rabbits.find(r => r.id === killerId);
      gameOverMsg.textContent = `${selectedHare.rabbit.firstName} was innocent. The real killer was actually ${killer.firstName} the ${killer.species}!`;
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    const worldPos = getMouseWorldPos(e);
    if (!handleAction(worldPos.x, worldPos.y, e.clientX, e.clientY)) {
      selectedHare = null;
      input.isDragging = true;
      input.lastMouseX = e.clientX;
      input.lastMouseY = e.clientY;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (input.isDragging) {
      camera.x -= (e.clientX - input.lastMouseX) / camera.zoom;
      camera.y -= (e.clientY - input.lastMouseY) / camera.zoom;
      input.lastMouseX = e.clientX;
      input.lastMouseY = e.clientY;
      constrainCamera();
    }
  });

  window.addEventListener('mouseup', () => { input.isDragging = false; });

  // Wheel zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const worldPos = getMouseWorldPos(e);
    const zoomSpeed = 0.001;
    const delta = -e.deltaY;
    const oldZoom = camera.zoom;
    camera.zoom *= Math.pow(1.1, delta / 100);
    camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom));
    
    // Adjust camera to zoom into mouse position
    camera.x += (worldPos.x - camera.x) * (1 - oldZoom / camera.zoom);
    camera.y += (worldPos.y - camera.y) * (1 - oldZoom / camera.zoom);
    constrainCamera();
  }, { passive: false });

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const worldPos = getMouseWorldPos(touch);
      if (!handleAction(worldPos.x, worldPos.y, touch.clientX, touch.clientY)) {
        selectedHare = null;
        input.isDragging = true;
        input.lastMouseX = touch.clientX;
        input.lastMouseY = touch.clientY;
      }
    } else if (e.touches.length === 2) {
      input.isDragging = false;
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      input.lastTouchDist = d;
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && input.isDragging) {
      const touch = e.touches[0];
      camera.x -= (touch.clientX - input.lastMouseX) / camera.zoom;
      camera.y -= (touch.clientY - input.lastMouseY) / camera.zoom;
      input.lastMouseX = touch.clientX;
      input.lastMouseY = touch.clientY;
      constrainCamera();
    } else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = canvas.getBoundingClientRect();
      const worldX = (midX - rect.left) / camera.zoom + camera.x;
      const worldY = (midY - rect.top) / camera.zoom + camera.y;

      const oldZoom = camera.zoom;
      camera.zoom *= (d / input.lastTouchDist);
      camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom));
      
      camera.x += (worldX - camera.x) * (1 - oldZoom / camera.zoom);
      camera.y += (worldY - camera.y) * (1 - oldZoom / camera.zoom);
      
      input.lastTouchDist = d;
      constrainCamera();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    input.isDragging = false;
    input.lastTouchDist = 0;
  });

  loop();
}

function constrainCamera() {
  const viewWidth = canvas.width / camera.zoom;
  const viewHeight = canvas.height / camera.zoom;
  
  if (viewWidth > FIELD_WIDTH) {
    camera.x = (FIELD_WIDTH - viewWidth) / 2;
  } else {
    camera.x = Math.max(0, Math.min(FIELD_WIDTH - viewWidth, camera.x));
  }
  
  if (viewHeight > FIELD_HEIGHT) {
    camera.y = (FIELD_HEIGHT - viewHeight) / 2;
  } else {
    camera.y = Math.max(0, Math.min(FIELD_HEIGHT - viewHeight, camera.y));
  }
}

function resize() {
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  constrainCamera();
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); drawGrid();
  ctx.save(); ctx.font = 'bold 24px monospace'; ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; ctx.textAlign = 'left'; ctx.fillText('mystery.farm', 20, 40); ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 2 * camera.zoom;
  const connectionsByChild = new Map();
  for (const conn of playerConnections) { if (!connectionsByChild.has(conn.childId)) connectionsByChild.set(conn.childId, []); connectionsByChild.get(conn.childId).push(conn); }
  for (const [childId, conns] of connectionsByChild) {
    const child = hares.find(h => h.rabbit.id === childId); if (!child) continue;
    const childX = (child.x - camera.x + FRAME_SIZE) * camera.zoom;
    const childY = (child.y - camera.y + FRAME_SIZE) * camera.zoom;
    const parents = conns.map(c => hares.find(h => h.rabbit.id === c.parentId)).filter(Boolean);
    if (parents.length === 0) continue;
    const avgParentY = parents.reduce((sum, p) => sum + (p.y - camera.y + FRAME_SIZE), 0) / parents.length;
    const midY = ((avgParentY + (child.y - camera.y + FRAME_SIZE)) / 2) * camera.zoom;
    
    if (parents.length === 1) {
      const p = parents[0];
      const pX = (p.x - camera.x + FRAME_SIZE) * camera.zoom;
      const pY = (p.y - camera.y + FRAME_SIZE) * camera.zoom;
      ctx.beginPath(); ctx.moveTo(pX, pY); ctx.lineTo(pX, midY); ctx.lineTo(childX, midY); ctx.lineTo(childX, childY); ctx.stroke();
      if (selectedHare === p || selectedHare === child) drawX(pX, (pY + midY) / 2);
    } else if (parents.length === 2) {
      const p1 = parents[0]; const p2 = parents[1];
      const p1X = (p1.x - camera.x + FRAME_SIZE) * camera.zoom; const p1Y = (p1.y - camera.y + FRAME_SIZE) * camera.zoom;
      const p2X = (p2.x - camera.x + FRAME_SIZE) * camera.zoom; const p2Y = (p2.y - camera.y + FRAME_SIZE) * camera.zoom;
      const joinMidX = (p1X + p2X) / 2;
      ctx.beginPath(); ctx.moveTo(p1X, p1Y); ctx.lineTo(p1X, midY); ctx.moveTo(p2X, p2Y); ctx.lineTo(p2X, midY); ctx.moveTo(p1X, midY); ctx.lineTo(p2X, midY); ctx.moveTo(joinMidX, midY); ctx.lineTo(childX, midY); ctx.lineTo(childX, childY); ctx.stroke();
      if (selectedHare === p1 || selectedHare === child) drawX(p1X, (p1Y + midY) / 2);
      if (selectedHare === p2 || selectedHare === child) drawX(p2X, (p2Y + midY) / 2);
    }
  }
  function drawX(x, y) {
    const size = 10 * camera.zoom;
    ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white'; ctx.font = `bold ${Math.floor(12 * camera.zoom)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('X', x, y);
  }
  hares.sort((a, b) => a.y - b.y);
  for (const hare of hares) { hare.update(); hare.draw(); }
  for (let i = notifications.length - 1; i >= 0; i--) {
    const n = notifications[i]; ctx.font = 'bold 16px Arial'; ctx.fillStyle = `rgba(255, 68, 68, ${n.timer / 60})`; ctx.textAlign = 'center'; ctx.fillText(n.text, n.x, n.y - (120 - n.timer) * 0.5); n.timer--; if (n.timer <= 0) notifications.splice(i, 1);
  }
  requestAnimationFrame(loop);
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; ctx.lineWidth = 1;
  const spacing = 100 * camera.zoom;
  const startX = (-camera.x * camera.zoom) % spacing;
  const startY = (-camera.y * camera.zoom) % spacing;
  for (let x = startX; x < canvas.width; x += spacing) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = startY; y < canvas.height; y += spacing) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
}
