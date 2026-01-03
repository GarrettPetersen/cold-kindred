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

// --- Simulation Logic ---
const rabbits = [];
let nextRabbitId = 1;

class RabbitRecord {
  constructor(firstName, sex, birthYear, gen, fatherId = null, motherId = null) {
    this.id = nextRabbitId++;
    this.firstName = firstName;
    this.sex = sex;
    this.birthYear = birthYear;
    this.generation = gen;
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
  }

  get fullName() {
    return this.firstName;
  }
}

function runSimulation() {
  // Use a shuffled pool of names to ensure uniqueness
  const malePool = [...MALE_NAMES].sort(() => random() - 0.5);
  const femalePool = [...FEMALE_NAMES].sort(() => random() - 0.5);

  // Generation 0: Founders
  const g0Count = 6; // Reduced to keep total population manageable
  const g0Rabbits = [];
  for (let i = 0; i < g0Count; i++) {
    const sex = i < g0Count / 2 ? 'M' : 'F';
    const pool = sex === 'M' ? malePool : femalePool;
    if (pool.length === 0) continue; // Skip if out of names
    
    const name = pool.pop();
    // Add variation to founding birth years (up to 15 years difference)
    const birthYear = (CURRENT_YEAR - 125) + Math.floor(random() * 15);
    const r = new RabbitRecord(name, sex, birthYear, 0);
    g0Rabbits.push(r);
    rabbits.push(r);
  }

  let prevGen = g0Rabbits;

  for (let gen = 1; gen <= 4; gen++) { // 0 to 4 is 5 generations
    const nextGen = [];
    const males = prevGen.filter(r => r.sex === 'M');
    const females = prevGen.filter(r => r.sex === 'F');
    
    // Pair them up
    const pairs = [];
    const mCount = males.length;
    const fCount = females.length;
    const pairCount = Math.min(mCount, fCount);
    
    // Shuffle lists for random pairing
    const shuffledMales = [...males].sort(() => random() - 0.5);
    const shuffledFemales = [...females].sort(() => random() - 0.5);

    for (let i = 0; i < pairCount; i++) {
      const m = shuffledMales[i];
      const f = shuffledFemales[i];
      m.spouseId = f.id;
      f.spouseId = m.id;
      pairs.push([m, f]);
    }

    // Children
    for (const [father, mother] of pairs) {
      const childrenCount = 1 + Math.floor(random() * 4); // 1-4 children
      for (let c = 0; c < childrenCount; c++) {
        const sex = random() < 0.5 ? 'M' : 'F';
        const pool = sex === 'M' ? malePool : femalePool;
        if (pool.length === 0) continue; // Out of names for this sex - stop being born

        const name = pool.pop();
        // Wider age gap: Parents can have children between ages 18 and 45
        const ageAtBirth = 18 + Math.floor(random() * 28);
        let birthYear = mother.birthYear + ageAtBirth;
        
        // Ensure no future rabbits
        if (birthYear > CURRENT_YEAR) birthYear = CURRENT_YEAR;
        
        const child = new RabbitRecord(name, sex, birthYear, gen, father.id, mother.id);
        nextGen.push(child);
        rabbits.push(child);
      }
    }
    prevGen = nextGen;
  }
}

// --- Rendering & Game Engine ---
// Camera state
const camera = {
  x: FIELD_WIDTH / 2 - window.innerWidth / 2,
  y: FIELD_HEIGHT / 2 - window.innerHeight / 2,
};

// Input state
const input = {
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
};

// Asset loading
const sprites = {
  idle: new Image(),
  walk: new Image(),
  run: new Image(),
};

let assetsLoaded = 0;
const TOTAL_ASSETS = 3;

function onAssetLoad() {
  assetsLoaded++;
  if (assetsLoaded === TOTAL_ASSETS) {
    init();
  }
}

sprites.idle.src = '/assets/Hare/Hare_Idle_with_shadow.png';
sprites.walk.src = '/assets/Hare/Hare_Walk_with_shadow.png';
sprites.run.src = '/assets/Hare/Hare_Run_with_shadow.png';

sprites.idle.onload = onAssetLoad;
sprites.walk.onload = onAssetLoad;
sprites.run.onload = onAssetLoad;

const hares = [];
const playerConnections = []; // Array of { parentId, childId }
let selectedHare = null;
const notifications = []; // Array of { text, x, y, timer }

class Hare {
  constructor(rabbitRecord) {
    this.rabbit = rabbitRecord;
    this.x = Math.random() * FIELD_WIDTH;
    this.y = Math.random() * FIELD_HEIGHT;
    this.targetX = null;
    this.targetY = null;
    this.state = 'idle'; // 'idle', 'walk', 'run'
    this.direction = Math.floor(Math.random() * 4); // 0: Down, 1: Up, 2: Left, 3: Right
    this.frame = 0;
    this.frameTimer = 0;
    this.frameSpeed = 0.1; // Animation speed
    
    this.moveTimer = 0;
    this.vx = 0;
    this.vy = 0;
    
    this.setRandomBehavior();
  }

  setRandomBehavior() {
    const r = Math.random();
    if (r < 0.6) { // 60% idle
      this.state = 'idle';
      this.vx = 0;
      this.vy = 0;
      this.frameSpeed = 0.1;
    } else if (r < 0.95) { // 35% walk
      this.state = 'walk';
      this.frameSpeed = 0.15;
      this.setRandomDirection(1); // speed 1
    } else { // 5% run
      this.state = 'run';
      this.frameSpeed = 0.25;
      this.setRandomDirection(2.5); // speed 2.5
    }
    this.moveTimer = 60 + Math.random() * 180; // Change behavior every 1-4 seconds
  }

  setRandomDirection(speed) {
    // 8 possible directions (including diagonals)
    const angle = Math.floor(Math.random() * 8) * (Math.PI / 4);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.updateDirectionFromVelocity();
  }

  updateDirectionFromVelocity() {
    if (this.vx === 0 && this.vy === 0) return;
    
    const angle = Math.atan2(this.vy, this.vx);
    // Map angle back to direction index (0: Down, 1: Up, 2: Left, 3: Right)
    const deg = (angle * 180 / Math.PI + 360) % 360;
    
    if (deg >= 45 && deg < 135) this.direction = 0; // Down
    else if (deg >= 225 && deg < 315) this.direction = 1; // Up
    else if (deg >= 135 && deg < 225) this.direction = 2; // Left
    else this.direction = 3; // Right
  }

  update() {
    if (this.targetX !== null && this.targetY !== null) {
      // Move towards target
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
        this.vx = 0;
        this.vy = 0;
        this.x = this.targetX;
        this.y = this.targetY;
      }
    } else {
      // Normal random movement logic
      // Separation logic: move away from nearby hares
      const separationRadius = 40;
      const separationStrength = 0.2;
      
      for (const other of hares) {
        if (other === this || (other.targetX !== null)) continue; // Don't push or get pushed by tree rabbits
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < separationRadius * separationRadius && distSq > 0) {
          const dist = Math.sqrt(distSq);
          this.vx += (dx / dist) * separationStrength;
          this.vy += (dy / dist) * separationStrength;
        }
      }

      // Limit speed to original magnitude if walking/running
      if (this.state !== 'idle') {
        const speed = this.state === 'walk' ? 1 : 2.5;
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > speed) {
          this.vx = (this.vx / currentSpeed) * speed;
          this.vy = (this.vy / currentSpeed) * speed;
        }
      }

      // Behavior timer
      this.moveTimer--;
      if (this.moveTimer <= 0) {
        this.setRandomBehavior();
      }
    }

    // Update movement
    this.x += this.vx;
    this.y += this.vy;

    // Constrain to field with "bounce"
    if (this.x < 0) {
      this.x = 0;
      this.vx *= -1;
      this.updateDirectionFromVelocity();
    } else if (this.x > FIELD_WIDTH) {
      this.x = FIELD_WIDTH;
      this.vx *= -1;
      this.updateDirectionFromVelocity();
    }
    
    if (this.y < 0) {
      this.y = 0;
      this.vy *= -1;
      this.updateDirectionFromVelocity();
    } else if (this.y > FIELD_HEIGHT) {
      this.y = FIELD_HEIGHT;
      this.vy *= -1;
      this.updateDirectionFromVelocity();
    }

    // Behavior timer
    this.moveTimer--;
    if (this.moveTimer <= 0) {
      this.setRandomBehavior();
    }

    // Animation
    this.frameTimer += this.frameSpeed;
    const maxFrames = this.getMaxFrames();
    if (this.frameTimer >= maxFrames) {
      this.frameTimer = 0;
    }
    this.frame = Math.floor(this.frameTimer);
  }

  getMaxFrames() {
    if (this.state === 'idle') return 4;
    if (this.state === 'walk') return 5;
    if (this.state === 'run') return 6;
    return 1;
  }

  draw() {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    // Only draw if on screen
    if (screenX < -FRAME_SIZE || screenX > canvas.width || 
        screenY < -FRAME_SIZE || screenY > canvas.height) {
      return;
    }

    const sprite = sprites[this.state];
    
    // Apply "shader" via filters
    ctx.save();
    ctx.filter = `hue-rotate(${this.rabbit.tint.hue}deg) saturate(${this.rabbit.tint.saturate}%) brightness(${this.rabbit.tint.brightness}%)`;
    
    ctx.drawImage(
      sprite,
      this.frame * FRAME_SIZE,
      this.direction * FRAME_SIZE,
      FRAME_SIZE,
      FRAME_SIZE,
      Math.floor(screenX),
      Math.floor(screenY),
      FRAME_SIZE * 2, // Scale up for visibility
      FRAME_SIZE * 2
    );
    
    ctx.restore();

    // Draw selection highlight
    if (selectedHare === this) {
      ctx.beginPath();
      ctx.ellipse(Math.floor(screenX) + FRAME_SIZE, Math.floor(screenY) + FRAME_SIZE * 1.8, FRAME_SIZE * 0.8, FRAME_SIZE * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw name and age
    ctx.font = '12px monospace';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'black';
    const age = CURRENT_YEAR - this.rabbit.birthYear;
    ctx.fillText(`${this.rabbit.firstName} (${age})`, Math.floor(screenX) + FRAME_SIZE, Math.floor(screenY) + FRAME_SIZE * 2 + 10);
    ctx.shadowBlur = 0;
  }
}

function updateTreeDiagram() {
  const treeSpacingX = 150;
  const treeSpacingY = 150;
  const treeStartX = 200;
  const treeStartY = 200;

  // Group hares into distinct trees
  const hareToTree = new Map();
  const trees = [];

  for (const conn of playerConnections) {
    let treeA = hareToTree.get(conn.parentId);
    let treeB = hareToTree.get(conn.childId);

    if (treeA && treeB && treeA !== treeB) {
      // Merge trees
      treeA.push(...treeB);
      for (const hareId of treeB) hareToTree.set(hareId, treeA);
      trees.splice(trees.indexOf(treeB), 1);
    } else if (treeA) {
      if (!treeA.includes(conn.childId)) {
        treeA.push(conn.childId);
        hareToTree.set(conn.childId, treeA);
      }
    } else if (treeB) {
      if (!treeB.includes(conn.parentId)) {
        treeB.push(conn.parentId);
        hareToTree.set(conn.parentId, treeB);
      }
    } else {
      const newTree = [conn.parentId, conn.childId];
      trees.push(newTree);
      hareToTree.set(conn.parentId, newTree);
      hareToTree.set(conn.childId, newTree);
    }
  }

  // Clear targets for hares not in any tree
  for (const hare of hares) {
    if (!hareToTree.has(hare.rabbit.id)) {
      hare.targetX = null;
      hare.targetY = null;
    }
  }

  // Calculate positions for each tree
  let currentTreeX = treeStartX;
  for (const treeIds of trees) {
    const treeHares = treeIds.map(id => hares.find(h => h.rabbit.id === id));
    
    // Simple layered positioning based on generation within the tree
    // Find roots (rabbits with no parents in playerConnections)
    const roots = treeIds.filter(id => !playerConnections.some(c => c.childId === id));
    
    const levels = new Map();
    const processLevel = (id, level) => {
      levels.set(id, Math.max(levels.get(id) || 0, level));
      const children = playerConnections.filter(c => c.parentId === id).map(c => c.childId);
      for (const childId of children) processLevel(childId, level + 1);
    };
    for (const root of roots) processLevel(root, 0);

    const levelGroups = [];
    levels.forEach((level, id) => {
      if (!levelGroups[level]) levelGroups[level] = [];
      levelGroups[level].push(id);
    });

    let maxLevelWidth = 0;
    levelGroups.forEach((ids, level) => {
      ids.forEach((id, i) => {
        const hare = hares.find(h => h.rabbit.id === id);
        hare.targetX = currentTreeX + i * treeSpacingX;
        hare.targetY = treeStartY + level * treeSpacingY;
      });
      maxLevelWidth = Math.max(maxLevelWidth, ids.length * treeSpacingX);
    });

    currentTreeX += maxLevelWidth + treeSpacingX;
  }
}

function init() {
  runSimulation();
  
  // Show all rabbits from all 5 generations
  for (const rabbit of rabbits) {
    hares.push(new Hare(rabbit));
  }
  
  window.addEventListener('resize', resize);
  resize();
  
  // Mouse events for selection and dragging
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + camera.x;
    const mouseY = e.clientY - rect.top + camera.y;

    // Check for X clicks on connection lines
    // Group connections by child to match rendering logic for X positions
    const connectionsByChild = new Map();
    for (const conn of playerConnections) {
      if (!connectionsByChild.has(conn.childId)) connectionsByChild.set(conn.childId, []);
      connectionsByChild.get(conn.childId).push(conn);
    }

    for (const [childId, conns] of connectionsByChild) {
      const child = hares.find(h => h.rabbit.id === childId);
      if (!child) continue;

      const childY = child.y + FRAME_SIZE;
      const parents = conns.map(c => hares.find(h => h.rabbit.id === c.parentId)).filter(Boolean);
      if (parents.length === 0) continue;

      const avgParentY = parents.reduce((sum, p) => sum + (p.y + FRAME_SIZE), 0) / parents.length;
      const midY = (avgParentY + childY) / 2;

      for (let i = 0; i < conns.length; i++) {
        const p = parents[i];
        
        // Only allow clicking X if the parent or child is selected
        if (selectedHare !== p && selectedHare !== child) continue;

        const pX = p.x + FRAME_SIZE;
        const pY = p.y + FRAME_SIZE;
        const xX = pX;
        const xY = (pY + midY) / 2;

        const dist = Math.sqrt((mouseX - xX) ** 2 + (mouseY - xY) ** 2);
        if (dist < 15) {
          playerConnections.splice(playerConnections.indexOf(conns[i]), 1);
          updateTreeDiagram();
          return;
        }
      }
    }

    // Check for rabbit clicks
    let clickedHare = null;
    for (const hare of hares) {
      const screenX = hare.x;
      const screenY = hare.y;
      if (mouseX >= screenX && mouseX <= screenX + FRAME_SIZE * 2 &&
          mouseY >= screenY && mouseY <= screenY + FRAME_SIZE * 2) {
        clickedHare = hare;
        break;
      }
    }

    if (clickedHare) {
      if (selectedHare && selectedHare !== clickedHare) {
        // Link them: Older is parent, younger is child
        const h1 = selectedHare;
        const h2 = clickedHare;
        const parent = h1.rabbit.birthYear <= h2.rabbit.birthYear ? h1 : h2;
        const child = parent === h1 ? h2 : h1;

        // Rule: One father ('M') and one mother ('F')
        const parentSex = parent.rabbit.sex;
        const alreadyHasParentOfSex = playerConnections.some(c => {
          if (c.childId !== child.rabbit.id) return false;
          const existingParent = hares.find(h => h.rabbit.id === c.parentId);
          return existingParent && existingParent.rabbit.sex === parentSex;
        });

        if (alreadyHasParentOfSex) {
          notifications.push({
            text: `${child.rabbit.firstName} already has a ${parentSex === 'M' ? 'father' : 'mother'}!`,
            x: e.clientX,
            y: e.clientY,
            timer: 120 // 2 seconds at 60fps
          });
        } else if (!playerConnections.some(c => c.parentId === parent.rabbit.id && c.childId === child.rabbit.id)) {
          playerConnections.push({ parentId: parent.rabbit.id, childId: child.rabbit.id });
          updateTreeDiagram();
        }
        selectedHare = null;
      } else {
        selectedHare = clickedHare;
      }
    } else {
      selectedHare = null;
      input.isDragging = true;
      input.lastMouseX = e.clientX;
      input.lastMouseY = e.clientY;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (input.isDragging) {
      const dx = e.clientX - input.lastMouseX;
      const dy = e.clientY - input.lastMouseY;
      camera.x -= dx;
      camera.y -= dy;
      
      // Constrain camera
      camera.x = Math.max(0, Math.min(FIELD_WIDTH - canvas.width, camera.x));
      camera.y = Math.max(0, Math.min(FIELD_HEIGHT - canvas.height, camera.y));
      
      input.lastMouseX = e.clientX;
      input.lastMouseY = e.clientY;
    }
  });

  window.addEventListener('mouseup', () => {
    input.isDragging = false;
  });

  loop();
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  camera.x = Math.max(0, Math.min(FIELD_WIDTH - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(FIELD_HEIGHT - canvas.height, camera.y));
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawGrid();

  // Draw player connections
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  
  // Group connections by child to handle dual parents
  const connectionsByChild = new Map();
  for (const conn of playerConnections) {
    if (!connectionsByChild.has(conn.childId)) connectionsByChild.set(conn.childId, []);
    connectionsByChild.get(conn.childId).push(conn);
  }

  for (const [childId, conns] of connectionsByChild) {
    const child = hares.find(h => h.rabbit.id === childId);
    if (!child) continue;

    const childX = child.x - camera.x + FRAME_SIZE;
    const childY = child.y - camera.y + FRAME_SIZE;
    
    // Determine horizontal line Y (midway between parents and child)
    // For simplicity, we assume all parents are on the level above
    const parents = conns.map(c => hares.find(h => h.rabbit.id === c.parentId)).filter(Boolean);
    if (parents.length === 0) continue;

    const avgParentY = parents.reduce((sum, p) => sum + (p.y - camera.y + FRAME_SIZE), 0) / parents.length;
    const midY = (avgParentY + childY) / 2;

    if (parents.length === 1) {
      const p = parents[0];
      const pX = p.x - camera.x + FRAME_SIZE;
      const pY = p.y - camera.y + FRAME_SIZE;

      // Vertical down from parent to midY
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(pX, midY);
      ctx.stroke();

      // Horizontal to childX
      ctx.beginPath();
      ctx.moveTo(pX, midY);
      ctx.lineTo(childX, midY);
      ctx.stroke();

      // Vertical down to child
      ctx.beginPath();
      ctx.moveTo(childX, midY);
      ctx.lineTo(childX, childY);
      ctx.stroke();

      if (selectedHare === p || selectedHare === child) {
        drawX(pX, (pY + midY) / 2, conns[0]);
      }
    } else if (parents.length === 2) {
      const p1 = parents[0];
      const p2 = parents[1];
      const p1X = p1.x - camera.x + FRAME_SIZE;
      const p1Y = p1.y - camera.y + FRAME_SIZE;
      const p2X = p2.x - camera.x + FRAME_SIZE;
      const p2Y = p2.y - camera.y + FRAME_SIZE;

      // Vertical down from both parents to midY
      ctx.beginPath();
      ctx.moveTo(p1X, p1Y);
      ctx.lineTo(p1X, midY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p2X, p2Y);
      ctx.lineTo(p2X, midY);
      ctx.stroke();

      // Horizontal join at midY
      ctx.beginPath();
      ctx.moveTo(p1X, midY);
      ctx.lineTo(p2X, midY);
      ctx.stroke();

      // Vertical down from middle of join to childX at midY (or just straight to child)
      const joinMidX = (p1X + p2X) / 2;
      ctx.beginPath();
      ctx.moveTo(joinMidX, midY);
      ctx.lineTo(childX, midY); // Horizontal step if child isn't perfectly centered
      ctx.lineTo(childX, childY);
      ctx.stroke();

      // Draw Xs on pre-joined segments only if parent or child is selected
      if (selectedHare === p1 || selectedHare === child) {
        drawX(p1X, (p1Y + midY) / 2, conns[0]);
      }
      if (selectedHare === p2 || selectedHare === child) {
        drawX(p2X, (p2Y + midY) / 2, conns[1]);
      }
    }
  }

  function drawX(x, y, connection) {
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('X', x, y);
  }

  hares.sort((a, b) => a.y - b.y);
  
  for (const hare of hares) {
    hare.update();
    hare.draw();
  }

  // Draw notifications
  for (let i = notifications.length - 1; i >= 0; i--) {
    const n = notifications[i];
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = `rgba(255, 68, 68, ${n.timer / 60})`;
    ctx.textAlign = 'center';
    ctx.fillText(n.text, n.x, n.y - (120 - n.timer) * 0.5);
    n.timer--;
    if (n.timer <= 0) notifications.splice(i, 1);
  }

  requestAnimationFrame(loop);
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const spacing = 100;
  
  const startX = -camera.x % spacing;
  const startY = -camera.y % spacing;
  
  for (let x = startX; x < canvas.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  for (let y = startY; y < canvas.height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}
