// styles are linked in index.html

const app = document.getElementById('app');

app.innerHTML = `
  <main>
    <section class="hero" id="hero">
      <h1>Cold Kindred</h1>
      <p class="tagline">A procedural cold case investigation.</p>
      <button id="start" class="start">Start Investigation</button>
    </section>

    <section id="sim" class="sim hidden" aria-live="polite">
      <div class="controls">
        <span id="status" class="status idle">Idle</span>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div id="progressBar" class="progress-bar"></div>
        </div>
        <button id="runAgain" class="start secondary" disabled>Run Again</button>
      </div>

      <div class="panels">
        <div class="panel">
          <h2>Run Log</h2>
          <div id="log" class="log" aria-label="Simulation log"></div>
        </div>
        <div class="panel">
          <h2>Output</h2>
          <button id="toggleJson" class="text-btn">Toggle JSON</button>
          <pre id="outputJson" class="json"></pre>
        </div>
        <div class="panel">
          <h2>Person Inspector</h2>
          <input id="personSearch" class="input" placeholder="Search name…" autocomplete="off" />
          <div id="personResults" class="list"></div>
          <div id="personDetail" class="detail"></div>
        </div>
        <div class="panel">
          <h2>Genealogy</h2>
          <div class="gene-controls">
            <input id="geneSearch" class="input" placeholder="Add by name or ID…" autocomplete="off" />
            <div class="row-gap">
              <button id="geneAdd" class="start secondary">Add</button>
              <button id="geneReveal" class="start secondary">Reveal relative</button>
              <button id="geneClear" class="start secondary">Clear</button>
            </div>
          </div>
          <svg id="geneSvg" class="gene-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
      </div>
    </section>
  </main>
`;

const heroEl = document.getElementById('hero');
const simEl = document.getElementById('sim');
const startBtn = document.getElementById('start');
const runAgainBtn = document.getElementById('runAgain');
const statusEl = document.getElementById('status');
const progressEl = document.querySelector('.progress');
const progressBarEl = document.getElementById('progressBar');
const logEl = document.getElementById('log');
const outputJsonEl = document.getElementById('outputJson');
const toggleJsonBtn = document.getElementById('toggleJson');
const personSearchEl = document.getElementById('personSearch');
const personResultsEl = document.getElementById('personResults');
const personDetailEl = document.getElementById('personDetail');
const geneSearchEl = document.getElementById('geneSearch');
const geneAddBtn = document.getElementById('geneAdd');
const geneRevealBtn = document.getElementById('geneReveal');
const geneClearBtn = document.getElementById('geneClear');
const geneSvg = document.getElementById('geneSvg');

function setStatus(stateText, stateClass) {
  statusEl.textContent = stateText;
  statusEl.classList.remove('idle', 'running', 'done');
  statusEl.classList.add(stateClass);
}

function setProgress(percent) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  progressBarEl.style.width = `${value}%`;
  progressEl.setAttribute('aria-valuenow', String(value));
}

function logLine(message) {
  const time = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.textContent = `[${time}] ${message}`;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSimulation() {
  // Enhanced simulation: track individuals, marriages, and lineage across generations
  const seed = Date.now();
  const random = (() => {
    let x = seed % 2147483647;
    return () => (x = (x * 48271) % 2147483647) / 2147483647; // simple LCG for demo
  })();

  const result = {
    version: 1,
    seed,
    steps: [],
    people: [],
    marriages: [],
    events: []
  };

  setStatus('Running…', 'running');
  startBtn.disabled = true;
  runAgainBtn.disabled = true;
  setProgress(0);
  logEl.innerHTML = '';
  outputJsonEl.textContent = '';
  logLine('Starting simulation');

  // ---------- Name lists (common US names, truncated for demo but sufficient for uniqueness) ----------
  const COMMON_SURNAMES = [
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell','Jenkins','Perry','Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes','Gonzales','Fisher','Vasquez','Simmons','Romero','Jordan','Patterson','Alexander','Hamilton','Graham','Reynolds','Griffin','Wallace','Moreno','West','Cole','Hayes','Bryant','Herrera','Gibson','Ellis','Tran','Medina','Aguilar','Stevens','Murray','Ford','Castro','Marshall','Owens','Harrison','Fernandez','Mcdonald','Woods','Washington','Kennedy','Wells','Vargas','Henry','Chen','Freeman','Shaw','Mendez','Weaver','Guzman','Nichols','Olson','Ramsey','Hunter','Hart','Guerrero','George','Shaw','Porter','Chambers','Cole','Moss','Newton','Page','Schmidt','Hansen','Bishop','Burke','Boyd','Lowe','Dean','Perez','Haynes','Fleming','Park','Warren','Gibbs','Walters','Lyons','Carter','Barker','Paul','Mack','Poole','Frank','Logan','Owen','Bass','Marsh','Drake','Sutton','Jennings','Boone','Banks','Potter','Lindsey','Pope','Sherman','Weston','Conner','Baldwin','French','Farmer','Hines','Lawson','Casey','Little','Day','Fowler','Bowman','Davidson','May','Carroll','Fields','Figueroa','Carlson','Mccarthy','Harrington','Norton','Atkins','Luna','Miles','Greer','Roman','Morrow','Randall','Hall','Clarke','Parks','Lambert','Stephens','Snyder','Mason','Salazar','Cross','Curtis','Kent','Doyle','Brock','Cummings','Erickson','Holland','Page','Keller','Curtis','Klein','Pratt','Tyler','Sharp','Barber','Goodman','Brady'
  ];

  const MALE_FIRST = [
    'James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles','Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua','Kenneth','Kevin','Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan','Jacob','Gary','Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Benjamin','Samuel','Gregory','Frank','Alexander','Raymond','Patrick','Jack','Dennis','Jerry','Tyler','Aaron','Jose','Adam','Nathan','Henry','Zachary','Douglas','Peter','Kyle','Noah','Ethan','Jeremy','Walter','Christian','Keith','Roger','Terry','Austin','Sean','Gerald','Carl','Harold','Dylan','Arthur','Lawrence','Jordan','Jesse','Bryan','Billy','Bruce','Gabriel','Logan','Alan','Juan','Roy','Ralph','Randy','Eugene','Vincent','Bobby','Russell','Louis','Philip','Johnny','Miguel','Caleb','Lucas','Alfred','Bradley','Francis','Marcus','Seth','Edgar','Owen','Leo','Max','Elliot','Connor','Colin','Spencer','Harrison','Cameron','Cole','Adrian','Tristan','Xavier','Victor','Joel','Martin','Ivan','Troy','Derek','Oscar','Grant','Wesley','Trevor','Sergio','Andre','Emmanuel','Marco','Diego','Eduardo','Jorge','Roberto','Lorenzo','Matteo','Luca','Enzo','Pedro','Hugo','Theo','Nicolas','Pablo','Alejandro','Luis','Santiago','Mateo','Brayden','Wyatt','Hunter','Levi','Dominic','Parker','Cooper','Jason','Chad','Clifford','Dean','Glen','Howard','Marshall','Neil','Oliver','Quentin','Stanley','Theodore','Vernon','Wayne'
  ];

  const FEMALE_FIRST = [
    'Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Nancy','Lisa','Margaret','Betty','Sandra','Ashley','Dorothy','Kimberly','Emily','Donna','Michelle','Carol','Amanda','Melissa','Deborah','Stephanie','Rebecca','Laura','Sharon','Cynthia','Kathleen','Amy','Shirley','Angela','Helen','Anna','Brenda','Pamela','Nicole','Emma','Samantha','Katherine','Christine','Debra','Rachel','Catherine','Carolyn','Janet','Ruth','Maria','Heather','Diane','Virginia','Julie','Joyce','Victoria','Olivia','Kelly','Christina','Lauren','Joan','Evelyn','Judith','Megan','Andrea','Cheryl','Hannah','Jacqueline','Martha','Gloria','Teresa','Ann','Sara','Madison','Frances','Kathryn','Jean','Abigail','Alice','Julia','Judy','Sophia','Grace','Denise','Amber','Doris','Marilyn','Danielle','Beverly','Isabella','Theresa','Diana','Natalie','Brittany','Charlotte','Rose','Alexis','Kayla','Lori','Faith','Ava','Brooklyn','Ella','Mia','Zoe','Hailey','Avery','Leah','Audrey','Savannah','Claire','Skylar','Lucy','Peyton','Nevaeh','Lila','Eva','Stella','Violet','Ruby','Aria','Eleanor','Nora','Hazel','Addison','Alexa','Caroline','Sophie','Alice','Kylie','Serenity','Naomi','Elena','Allison','Luna','Mila','Aubrey','Paisley','Penelope','Aurora','Bella','Sadie','Ariana','Kennedy','Madeline','Piper','Brianna','Clara','Eliana','Quinn','Ivy','Delilah','Parker','Sydney','Jasmine','Valentina','Cora','Rylee','Eliza','Josephine','Iris','Adeline','Margot','Vivian','Juniper','Isla'
  ];

  // ---------- Helpers ----------
  let nextId = 1;
  function createPerson(fields) {
    const person = {
      id: nextId++,
      firstName: fields.firstName,
      lastName: fields.lastName,
      maidenName: fields.maidenName || null,
      sex: fields.sex, // 'M' | 'F'
      birthDate: fields.birthDate,
      generation: fields.generation,
      fatherId: fields.fatherId || null,
      motherId: fields.motherId || null,
      spouseId: null,
      partnerId: fields.partnerId || null,
      bioFatherId: fields.bioFatherId || null,
      bioMotherId: fields.bioMotherId || null,
      cityId: fields.cityId || null,
      city: fields.cityId ? getCityName(fields.cityId) : (fields.city || null),
      skinTone: fields.skinTone || null, // 1..5 Fitzpatrick
      hairColor: fields.hairColor || null, // 'black'|'brown'|'blonde'|'red'|'gray'|'bald'
      retired: false,
      alive: true
    };
    result.people.push(person);
    return person;
  }

  function pick(arr) {
    return arr[Math.floor(random() * arr.length)];
  }

  function sampleWithoutReplacement(arr, count) {
    const copy = arr.slice();
    const out = [];
    const max = Math.min(count, copy.length);
    for (let i = 0; i < max; i++) {
      const idx = Math.floor(random() * copy.length);
      out.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return out;
  }

  function year(dateStr) {
    return new Date(dateStr).getUTCFullYear();
  }

  function isoFromYMD(y, m, d) {
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toISOString().slice(0, 10);
  }

  function uniqueBirthdates(count, startYear, endYear) {
    const dates = new Set();
    const min = Date.UTC(startYear, 0, 1);
    const max = Date.UTC(endYear, 11, 31);
    while (dates.size < count) {
      const t = min + Math.floor(random() * (max - min));
      const d = new Date(t);
      const as = d.toISOString().slice(0, 10);
      dates.add(as);
    }
    return Array.from(dates);
  }

  // Events registry and helpers
  const eventsByPerson = new Map();
  function addEvent(evt) {
    // evt: { year, type, people:[ids], details?:{} }
    evt.id = result.events.length + 1;
    result.events.push(evt);
    for (const pid of evt.people) {
      const arr = eventsByPerson.get(pid) || [];
      arr.push(evt.id);
      eventsByPerson.set(pid, arr);
    }
    return evt;
  }

  // Yearly events index (must exist before any code calls indexEventByYear)
  const eventsByYear = new Map();
  function indexEventByYear(evt) {
    const list = eventsByYear.get(evt.year) || [];
    list.push(evt);
    eventsByYear.set(evt.year, list);
  }

  // Top 10 US cities with approximate population weights
  const CITIES = [
    { id: 1, name: 'New York, NY', weight: 8336817 },
    { id: 2, name: 'Los Angeles, CA', weight: 3979576 },
    { id: 3, name: 'Chicago, IL', weight: 2693976 },
    { id: 4, name: 'Houston, TX', weight: 2320268 },
    { id: 5, name: 'Phoenix, AZ', weight: 1680992 },
    { id: 6, name: 'Philadelphia, PA', weight: 1584064 },
    { id: 7, name: 'San Antonio, TX', weight: 1547253 },
    { id: 8, name: 'San Diego, CA', weight: 1423851 },
    { id: 9, name: 'Dallas, TX', weight: 1343573 },
    { id: 10, name: 'San Jose, CA', weight: 1030119 }
  ];
  const TOTAL_CITY_WEIGHT = CITIES.reduce((s, c) => s + c.weight, 0);
  function pickWeightedCityId() {
    const r = random() * TOTAL_CITY_WEIGHT;
    let acc = 0;
    for (const c of CITIES) {
      acc += c.weight;
      if (r <= acc) return c.id;
    }
    return CITIES[CITIES.length - 1].id;
  }
  function getCityName(cityId) {
    const c = CITIES.find(c => c.id === cityId);
    return c ? c.name : 'Unknown';
  }

  // ----- Demographics and trait assignment -----
  function getCityRegion(cityId) {
    switch (cityId) {
      case 1: // New York
      case 6: // Philadelphia
        return 'NE';
      case 3: // Chicago
        return 'MW';
      case 2: // Los Angeles
      case 5: // Phoenix
      case 8: // San Diego
      case 10: // San Jose
        return 'W';
      case 4: // Houston
      case 7: // San Antonio
      case 9: // Dallas
        return 'S';
      default:
        return 'NE';
    }
  }
  function pickWeighted(pairs) {
    const total = pairs.reduce((s, [, w]) => s + w, 0);
    let r = random() * total;
    for (const [val, w] of pairs) {
      if ((r -= w) <= 0) return val;
    }
    return pairs[pairs.length - 1][0];
  }
  function assignFounderTraits(person) {
    const region = getCityRegion(person.cityId);
    let toneWeights;
    if (region === 'S') toneWeights = [[1, 50],[2,20],[3,12],[4,10],[5,8]];
    else if (region === 'W') toneWeights = [[1,55],[2,22],[3,12],[4,7],[5,4]];
    else if (region === 'MW') toneWeights = [[1,58],[2,22],[3,10],[4,6],[5,4]];
    else toneWeights = [[1,60],[2,20],[3,10],[4,7],[5,3]];
    person.skinTone = pickWeighted(toneWeights);
    const hairWeights = [["black",30],["brown",40],["blonde",20],["red",5],["bald",2],["gray",3]];
    person.hairColor = pickWeighted(hairWeights);
  }
  function inheritSkinTone(father, mother) {
    const tones = [1,2,3,4,5];
    const fav = father?.skinTone || 3;
    const mav = mother?.skinTone || 3;
    const base = Math.round((fav + mav) / 2);
    const candidates = tones.map(t => [t, 1 / (1 + Math.abs(t - base))]);
    // small mutation
    candidates.forEach(c => c[1] *= 0.9);
    const mutTone = Math.max(1, Math.min(5, base + (random() < 0.5 ? -1 : 1)));
    candidates.push([mutTone, 0.5]);
    return pickWeighted(candidates);
  }
  function inheritHairColor(father, mother) {
    const colors = ["black","brown","blonde","red","bald","gray"];
    const f = father?.hairColor || "brown";
    const m = mother?.hairColor || "brown";
    if (f === m) return f;
    if (random() < 0.45) return f;
    if (random() < 0.5) return m;
    return colors[Math.floor(random() * colors.length)];
  }

  // ----- Kinship helpers to prevent close-kin pairing -----
  function getById(id) {
    return result.people.find(p => p.id === id) || null;
  }
  function bioParentsOf(p) {
    const s = new Set();
    if (p.bioFatherId) s.add(p.bioFatherId);
    else if (p.fatherId) s.add(p.fatherId);
    if (p.bioMotherId) s.add(p.bioMotherId);
    else if (p.motherId) s.add(p.motherId);
    return s;
  }
  function bioGrandparentsOf(p) {
    const gp = new Set();
    for (const pid of bioParentsOf(p)) {
      const parent = getById(pid);
      if (!parent) continue;
      for (const gpid of bioParentsOf(parent)) gp.add(gpid);
    }
    return gp;
  }
  function isParentChild(a, b) {
    return a.id === b.fatherId || a.id === b.motherId || a.id === b.bioFatherId || a.id === b.bioMotherId ||
           b.id === a.fatherId || b.id === a.motherId || b.id === a.bioFatherId || b.id === a.bioMotherId;
  }
  function isSibling(a, b) {
    if (a.id === b.id) return true;
    const pa = bioParentsOf(a);
    const pb = bioParentsOf(b);
    for (const id of pa) if (pb.has(id)) return true; // share a bio parent (half/step included)
    return false;
  }
  function isCousin(a, b) {
    const gpa = bioGrandparentsOf(a);
    const gpb = bioGrandparentsOf(b);
    for (const id of gpa) if (gpb.has(id)) return true;
    return false;
  }
  function isCloseKin(a, b) {
    if (!a || !b) return false;
    if (a.id === b.id) return true;
    if (isParentChild(a, b)) return true;
    if (isSibling(a, b)) return true;
    if (isCousin(a, b)) return true;
    return false;
  }

  // Period-appropriate job pools and selector
  const JOBS_EARLY = [
    'Farmer','Laborer','Factory Worker','Railroad Worker','Miner','Machinist','Blacksmith','Seamstress','Domestic Worker','Clerk','Secretary','Teacher','Nurse','Salesman','Carpenter','Mechanic','Electrician','Plumber','Construction Worker','Police Officer','Truck Driver','Doctor','Lawyer','Pharmacist'
  ];
  const JOBS_MID = [
    'Factory Worker','Mechanic','Secretary','Teacher','Nurse','Accountant','Sales Manager','Engineer','Electrician','Plumber','Truck Driver','Police Officer','Construction Worker','Doctor','Lawyer','Pharmacist','Librarian','Civil Engineer','Social Worker','Warehouse Worker','Retail Associate','Journalist'
  ];
  const JOBS_LATE = [
    'Teacher','Nurse','Accountant','Sales Manager','Engineer','Electrician','Plumber','Truck Driver','Police Officer','Construction Worker','Doctor','Lawyer','Pharmacist','Librarian','Civil Engineer','Social Worker','Retail Associate','Journalist','Marketing Manager','Financial Analyst','Computer Programmer'
  ];
  const JOBS_MODERN = [
    'Teacher','Nurse','Accountant','Sales Manager','Engineer','Electrician','Plumber','Truck Driver','Police Officer','Construction Worker','Doctor','Lawyer','Pharmacist','Librarian','Civil Engineer','Social Worker','Retail Associate','Journalist','Marketing Manager','Financial Analyst','Computer Programmer','Software Engineer','Data Analyst','Product Manager','HR Specialist','Graphic Designer','Chef','Barista','Pilot','Flight Attendant','Paramedic','Firefighter','Veterinarian','Dentist'
  ];
  function pickJobForYear(y) {
    if (y < 1945) return pick(JOBS_EARLY);
    if (y < 1980) return pick(JOBS_MID);
    if (y < 2000) return pick(JOBS_LATE);
    return pick(JOBS_MODERN);
  }

  // Emoji utilities
  const SKIN_TONE_MODIFIERS = ['', '\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}'];
  function toneMod(tone) { return SKIN_TONE_MODIFIERS[Math.max(0, Math.min(5, tone || 0))]; }
  function ageCategory(p, currentYear) {
    const age = currentYear - year(p.birthDate);
    if (age < 3) return 'baby';
    if (age < 13) return 'child';
    if (age < 20) return 'youth';
    if (p.retired || age >= 65) return 'elder';
    return 'adult';
  }
  // Profession emoji mapping (subset that are widely supported)
  const PROF_EMOJI = new Map([
    ['Teacher','\u{1F9D1}\u{200D}\u{1F3EB}'],      // person + school
    ['Nurse','\u{1F9D1}\u{200D}\u{2695}\u{FE0F}'], // person + medical symbol
    ['Doctor','\u{1F9D1}\u{200D}\u{2695}\u{FE0F}'],
    ['Police Officer','\u{1F46E}'],
    ['Construction Worker','\u{1F477}'],
    ['Mechanic','\u{1F9D1}\u{200D}\u{1F527}'],
    ['Chef','\u{1F9D1}\u{200D}\u{1F373}'],
    ['Artist','\u{1F9D1}\u{200D}\u{1F3A8}'],
    ['Firefighter','\u{1F9D1}\u{200D}\u{1F692}'],
    ['Farmer','\u{1F9D1}\u{200D}\u{1F33E}'],
    ['Scientist','\u{1F9D1}\u{200D}\u{1F52C}'],
    ['Factory Worker','\u{1F3ED}'],
    ['Pilot','\u{1F9D1}\u{200D}\u{2708}\u{FE0F}'],
    ['Student','\u{1F393}'],
    ['Judge','\u{1F9D1}\u{200D}\u{2696}\u{FE0F}'],
    ['Engineer','\u{1F9D1}\u{200D}\u{1F527}'],
    ['Journalist','\u{1F4F0}'],
    ['Writer','\u{270D}\u{FE0F}'],
    ['Artist','\u{1F9D1}\u{200D}\u{1F3A8}'],
    ['Retail Associate','\u{1F6D2}'],
    ['Truck Driver','\u{1F69A}']
  ]);

  function professionEmojiFor(p, currentYear) {
    const age = currentYear - year(p.birthDate);
    if (age < 16) return null; // handled by age icons
    if (p.retired || age >= 65) return null;
    // Look up last job change event for this person to get current job
    let job = null;
    const evtIds = eventsByPerson.get(p.id) || [];
    for (let i = evtIds.length - 1; i >= 0; i--) {
      const e = result.events[evtIds[i] - 1];
      if (e && e.type === 'JOB_CHANGE') { job = e.details?.jobTitle || null; break; }
    }
    if (!job) return null;
    const base = PROF_EMOJI.get(job);
    if (!base) return null;
    // Insert skin tone to base person where applicable by appending modifier
    // Many ZWJ professions start with person U+1F9D1; append tone after first codepoint
    try {
      const t = toneMod(p.skinTone);
      if (!t) return base;
      const first = base.codePointAt(0);
      if (!first) return base;
      const rest = base.slice([...base][0].length);
      return String.fromCodePoint(first) + t + rest;
    } catch { return base; }
  }

  function personEmojiFor(p) {
    // Base people: person U+1F9D1, man U+1F468, woman U+1F469, baby U+1F476, boy U+1F466, girl U+1F467,
    // older man U+1F474, older woman U+1F475
    const t = toneMod(p.skinTone);
    const y = new Date().getUTCFullYear();
    const cat = ageCategory(p, y);
    if (cat === 'baby') return `\u{1F476}${t}`;
    if (cat === 'child') return p.sex === 'F' ? `\u{1F467}${t}` : `\u{1F466}${t}`;
    if (cat === 'youth') return p.sex === 'F' ? `\u{1F467}${t}` : `\u{1F466}${t}`;
    if (cat === 'elder') return p.sex === 'F' ? `\u{1F475}${t}` : `\u{1F474}${t}`;
    // For adults, prefer profession emoji if available
    const prof = professionEmojiFor(p, y);
    if (prof) return prof;
    return p.sex === 'F' ? `\u{1F469}${t}` : `\u{1F468}${t}`;
  }

  function marry(husband, wife, yearOfMarriage) {
    wife.maidenName = wife.lastName;
    wife.lastName = husband.lastName;
    husband.spouseId = wife.id;
    wife.spouseId = husband.id;
    const rec = {
      id: result.marriages.length + 1,
      husbandId: husband.id,
      wifeId: wife.id,
      year: yearOfMarriage
    };
    result.marriages.push(rec);
    addEvent({ year: yearOfMarriage, type: 'MARRIAGE', people: [husband.id, wife.id], details: { marriageId: rec.id, cityId: husband.cityId } });
    return rec;
  }

  function randomChildBirthDate(motherBirthYear) {
    const y = motherBirthYear + 20 + Math.floor(random() * 16); // 20..35 years after mother's birth
    const m = 1 + Math.floor(random() * 12);
    const d = 1 + Math.floor(random() * 28);
    return isoFromYMD(y, m, d);
  }

  // Yearly mortality hazard (very rough US-like curve)
  function mortalityHazard(age) {
    if (age < 1) return 0.005;            // infant mortality ~0.5%
    if (age < 5) return 0.0005;           // very low
    if (age < 15) return 0.0002;          // children
    if (age < 30) return 0.0007;          // teens/young adults (accidents)
    if (age < 45) return 0.0010;          // adults
    if (age < 55) return 0.0020;
    if (age < 65) return 0.0050;
    if (age < 75) return 0.0100;          // 1%
    if (age < 85) return 0.0300;          // 3%
    if (age < 95) return 0.0800;          // 8%
    return 0.1600;                        // 16%
  }

  // Yearly retirement probability by age
  function retirementProb(age) {
    if (age < 58) return 0;
    if (age < 60) return 0.02;   // 2%
    if (age < 62) return 0.05;   // 5%
    if (age < 65) return 0.10;   // 10%
    if (age < 67) return 0.20;   // 20%
    if (age < 70) return 0.25;   // 25%
    if (age < 75) return 0.30;   // 30%
    return 0.50;                 // 50% per year 75+
  }

  // ---------- Step 1: Founders (G0) with unique last names, first names, birthdates ----------
  await delay(150);
  const foundersMaleCount = 100;
  const foundersFemaleCount = 100;

  const uniqueSurnames = sampleWithoutReplacement(COMMON_SURNAMES, foundersMaleCount + foundersFemaleCount);
  const uniqueMaleFirst = sampleWithoutReplacement(MALE_FIRST.filter(n => FEMALE_FIRST.indexOf(n) === -1), foundersMaleCount);
  const uniqueFemaleFirst = sampleWithoutReplacement(FEMALE_FIRST.filter(n => MALE_FIRST.indexOf(n) === -1), foundersFemaleCount);
  // Backdate founders into the late 19th century so early-1900 births occur
  const uniqueFounderBirthdates = uniqueBirthdates(foundersMaleCount + foundersFemaleCount, 1865, 1895);

  const males = [];
  const females = [];
  let idx = 0;
  for (let i = 0; i < foundersMaleCount; i++, idx++) {
    const cityId = pickWeightedCityId();
    const p = createPerson({
      firstName: uniqueMaleFirst[i % uniqueMaleFirst.length],
      lastName: uniqueSurnames[idx],
      sex: 'M',
      birthDate: uniqueFounderBirthdates[idx],
      generation: 0,
      cityId
    });
    assignFounderTraits(p);
    males.push(p);
  }
  for (let i = 0; i < foundersFemaleCount; i++, idx++) {
    const cityId = pickWeightedCityId();
    const p = createPerson({
      firstName: uniqueFemaleFirst[i % uniqueFemaleFirst.length],
      lastName: uniqueSurnames[idx],
      sex: 'F',
      birthDate: uniqueFounderBirthdates[idx],
      generation: 0,
      cityId
    });
    assignFounderTraits(p);
    females.push(p);
  }

  result.steps.push({ name: 'Founders', males: males.length, females: females.length });
  logLine(`Generated founders: ${males.length + females.length} with unique surnames, first names, and birthdates`);
  setProgress(15);

  // ---------- Step 2: Pair founders and record marriages ----------
  await delay(150);
  function pairAndMarry(malesArr, femalesArr, marriageRate, partnershipRate) {
    // city-constrained marriage + non-married partnerships
    const byCityM = new Map();
    const byCityF = new Map();
    for (const m of malesArr) {
      const arr = byCityM.get(m.cityId) || [];
      arr.push(m);
      byCityM.set(m.cityId, arr);
    }
    for (const f of femalesArr) {
      const arr = byCityF.get(f.cityId) || [];
      arr.push(f);
      byCityF.set(f.cityId, arr);
    }
    const couples = [];
    const partners = [];
    for (const [cityId, mList] of byCityM.entries()) {
      const fListAll = (byCityF.get(cityId) || []).slice();
      const msAll = mList.slice();
      msAll.sort(() => random() - 0.5);
      fListAll.sort(() => random() - 0.5);
      const pairCount = Math.floor(Math.min(msAll.length, fListAll.length) * (typeof marriageRate === 'number' ? marriageRate : 0.8));
      for (let i = 0; i < pairCount; i++) {
        const h = msAll[i];
        const w = fListAll[i];
        if (isCloseKin(h, w)) continue; // skip close-kin marriage
        const marriageYear = Math.max(year(h.birthDate), year(w.birthDate)) + 20 + Math.floor(random() * 10);
        marry(h, w, marriageYear);
        couples.push([h, w]);
      }
      // Remaining singles in this city form partnerships (~60% of remainder)
      const remainingM = msAll.slice(pairCount);
      const remainingF = fListAll.slice(pairCount);
      const partnerCount = Math.floor(Math.min(remainingM.length, remainingF.length) * (typeof partnershipRate === 'number' ? partnershipRate : 0.6));
      for (let i = 0; i < partnerCount; i++) {
        const h = remainingM[i];
        const w = remainingF[i];
        if (isCloseKin(h, w)) continue; // skip close-kin partnership
        h.partnerId = w.id;
        w.partnerId = h.id;
        const yearFormed = Math.max(year(h.birthDate), year(w.birthDate)) + 20 + Math.floor(random() * 10);
        const evt = addEvent({ year: yearFormed, type: 'PARTNERSHIP', people: [h.id, w.id], details: { cityId } });
        indexEventByYear(evt);
        partners.push([h, w]);
      }
    }
    return { couples, partners };
  }
  const g0 = pairAndMarry(males, females, 0.9, 0.6);
  result.steps.push({ name: 'G0 marriages', count: g0.couples.length });
  result.steps.push({ name: 'G0 partnerships', count: g0.partners.length });
  logLine(`G0 marriages: ${g0.couples.length}; partnerships: ${g0.partners.length}`);
  setProgress(30);

  // ---------- Steps 3-6: Generate G1..G4 children of couples and then marry within each new generation ----------
  const generations = [];
  generations[0] = { males, females, couples: g0.couples, partners: g0.partners };

  for (let gen = 0; gen < 4; gen++) {
    await delay(150);
    const couples = generations[gen].couples;
    const partners = generations[gen].partners || [];
    const children = [];
    let births = 0;
    const birthPairs = couples.concat(partners);
    for (const [father, mother] of birthPairs) {
      // Era-based total fertility number (TFN) sampling per couple/partnership
      const motherBirthYear = year(mother.birthDate);
      let expected = 0;
      if (motherBirthYear < 1945) expected = 3.0 + random() * 1.0;       // Silent gen
      else if (motherBirthYear < 1965) expected = 3.5 + random() * 1.5;  // Boomers higher
      else if (motherBirthYear < 1985) expected = 2.3 + random() * 1.2;  // Gen X
      else expected = 1.7 + random() * 0.9;                              // Millennials+

      // Married couples more fertile; partnerships slightly less
      const isMarriedPair = couples.some(([fh, mw]) => fh.id === father.id && mw.id === mother.id);
      const baseKids = expected * (isMarriedPair ? 1.0 : 0.75);
      // Sample integer around expectation (Poisson-ish approximation)
      let numKids = Math.max(0, Math.round(baseKids + (random() - 0.5)));
      numKids = Math.min(numKids, 8);
      for (let k = 0; k < numKids; k++) {
        const sex = random() < 0.5 ? 'M' : 'F';
        const firstName = sex === 'M' ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
        const lastName = father.lastName; // father's family name
        const birthDate = randomChildBirthDate(year(mother.birthDate));
        // Determine biological father (affair-born children possible only heterosexual)
        let bioFatherId = father.id;
        const isPartnerPair = !isMarriedPair;
        const fromAffair = isMarriedPair ? (random() < 0.08) : (random() < 0.12);
        if (fromAffair) {
          const maleAdultsSameCity = result.people.filter(p => p.sex === 'M' && p.id !== father.id && (year(birthDate) - year(p.birthDate)) >= 18 && p.cityId === (mother.cityId || father.cityId));
          if (maleAdultsSameCity.length) bioFatherId = maleAdultsSameCity[Math.floor(random() * maleAdultsSameCity.length)].id;
        }
        const child = createPerson({
          firstName,
          lastName,
          sex,
          birthDate,
          generation: gen + 1,
          fatherId: father.id, // family father (partner or spouse)
          motherId: mother.id,
          bioFatherId,
          bioMotherId: mother.id,
          cityId: (random() < 0.5 ? father.cityId : mother.cityId) || pickWeightedCityId()
        });
        child.skinTone = inheritSkinTone(father, mother);
        child.hairColor = inheritHairColor(father, mother);
        children.push(child);
        births++;
        // record birth event
        const outOfWedlock = isPartnerPair;
        addEvent({ year: year(birthDate), type: 'BIRTH', people: [child.id], details: { cityId: child.cityId, outOfWedlock, fromAffair: fromAffair && bioFatherId !== father.id } });
        
      }
    }

    const genMales = children.filter(p => p.sex === 'M');
    const genFemales = children.filter(p => p.sex === 'F');
    result.steps.push({ name: `G${gen + 1} births`, births });
    logLine(`G${gen + 1}: births=${births}`);

    // Marry within generation for next-gen parents
    // Marriage/partnership rates slightly lower for later generations
    const marriageRate = Math.max(0.6, 0.9 - gen * 0.07);      // G1: ~0.83, G4: ~0.6
    const partnershipRate = Math.min(0.7, 0.6 + gen * 0.05);    // G1: ~0.65, G4: ~0.7
    const next = pairAndMarry(genMales, genFemales, marriageRate, partnershipRate);
    generations[gen + 1] = { males: genMales, females: genFemales, couples: next.couples, partners: next.partners };
    result.steps.push({ name: `G${gen + 1} marriages`, count: next.couples.length });
    result.steps.push({ name: `G${gen + 1} partnerships`, count: next.partners.length });
    logLine(`G${gen + 1} marriages: ${next.couples.length}; partnerships: ${next.partners.length}`);
    setProgress(30 + ((gen + 1) * 10));
  }

  // ---------- Year-by-year playback (1900..2025) ----------
  const START_YEAR = 1900;
  const END_YEAR = 2025;
  const totalYears = END_YEAR - START_YEAR + 1;

  // index events by year
  const birthsByYear = new Map();
  for (const p of result.people) {
    const y = year(p.birthDate);
    birthsByYear.set(y, (birthsByYear.get(y) || 0) + 1);
  }
  const marriagesByYear = new Map();
  for (const m of result.marriages) {
    marriagesByYear.set(m.year, (marriagesByYear.get(m.year) || 0) + 1);
  }

  // Index pre-existing events
  for (const e of result.events) indexEventByYear(e);

  logLine(`Planned events across ${START_YEAR}–${END_YEAR}: births=${result.people.length}, marriages=${result.marriages.length}`);

  // Yearly stochastic event probabilities (tunable)
  const PROB = {
    move: 0.01,          // 1% chance per adult per year
    jobChange: 0.03,     // 3% per adult per year
    divorce: 0.005,      // 0.5% per married couple per year
    affair: 0.01         // 1% per married adult per year
  };

  // Choose one murder year and assign once
  const murderYear = 1970 + Math.floor(random() * 31); // 1970..2000
  let murderCommitted = false;

  let yearIndex = 0;
  for (let y = START_YEAR; y <= END_YEAR; y++, yearIndex++) {
    // announce year transition, then small delay to visualize progression
    logLine(`— Year ${y} —`);
    await delay(10);
    const b = birthsByYear.get(y) || 0;
    const m = marriagesByYear.get(y) || 0;
    
    // Adults for stochastic events
    const adults = result.people.filter(p => p.alive && (y - year(p.birthDate)) >= 18);

    // One-time: extremely high marriage rate in 1900 to model pre-1900 marriages
    if (y === 1900) {
      const byCityM = new Map();
      const byCityF = new Map();
      for (const p of adults) {
        if (!p.spouseId) {
          if (p.sex === 'M') {
            const arr = byCityM.get(p.cityId) || [];
            arr.push(p);
            byCityM.set(p.cityId, arr);
          } else if (p.sex === 'F') {
            const arr = byCityF.get(p.cityId) || [];
            arr.push(p);
            byCityF.set(p.cityId, arr);
          }
        }
      }
      let marriedNow = 0;
      const HIGH_RATE = 0.98; // ~98% marriage rate for eligible pairs
      for (const [cityId, malesArr] of byCityM.entries()) {
        const femalesArr = (byCityF.get(cityId) || []).slice();
        const ms = malesArr.slice();
        ms.sort(() => random() - 0.5);
        femalesArr.sort(() => random() - 0.5);
        const canPair = Math.min(ms.length, femalesArr.length);
        const pairCount = Math.floor(canPair * HIGH_RATE);
        for (let i = 0; i < pairCount; i++) {
          const h = ms[i];
          const w = femalesArr[i];
          // Set marriage in 1900 for visibility
          marry(h, w, 1900);
          marriedNow++;
        }
      }
      if (marriedNow > 0) {
        logLine(`Year 1900: backfilled marriages=${marriedNow}`);
      }
    }

    // Retirements (before processing jobs): only for non-retired adults
    for (const p of adults) {
      if (!p.retired) {
        const age = y - year(p.birthDate);
        const pr = retirementProb(age);
        if (pr > 0 && random() < pr) {
          p.retired = true;
          const evt = addEvent({ year: y, type: 'RETIREMENT', people: [p.id], details: { cityId: p.cityId, age } });
          indexEventByYear(evt);
        }
      }
    }

    // Moves (family units move together: spouse/partner + minor children)
    const movedIds = new Set();
    for (const p of adults) {
      if (movedIds.has(p.id)) continue;
      if (random() < PROB.move) {
        const fromId = p.cityId || pickWeightedCityId();
        let toId = fromId;
        for (let tries = 0; tries < 5 && toId === fromId; tries++) toId = pickWeightedCityId();
        const unit = [p];
        if (p.spouseId) {
          const spouse = result.people.find(q => q.id === p.spouseId && q.alive && (y - year(q.birthDate)) >= 18);
          if (spouse && spouse.cityId === fromId) unit.push(spouse);
        }
        if (p.partnerId) {
          const partner = result.people.find(q => q.id === p.partnerId && q.alive && (y - year(q.birthDate)) >= 18);
          if (partner && partner.cityId === fromId) unit.push(partner);
        }
        for (const c of result.people) {
          if (!c.alive) continue;
          const age = y - year(c.birthDate);
          if (age < 18 && c.cityId === fromId && (c.fatherId === p.id || c.motherId === p.id)) {
            unit.push(c);
          }
        }
        for (const mbr of unit) {
          mbr.cityId = toId;
          mbr.city = getCityName(toId);
          movedIds.add(mbr.id);
          const evt = addEvent({ year: y, type: 'MOVE', people: [mbr.id], details: { fromCityId: fromId, toCityId: toId } });
          indexEventByYear(evt);
        }
      }
    }

    // Job changes (skip if retired)
    for (const p of adults) {
      if (!p.retired && random() < PROB.jobChange) {
        const newJob = pickJobForYear(y);
        const evt = addEvent({ year: y, type: 'JOB_CHANGE', people: [p.id], details: { jobTitle: newJob, cityId: p.cityId || null } });
        indexEventByYear(evt);
      }
    }

    // Divorces
    const marriedAdults = adults.filter(p => p.spouseId);
    const visited = new Set();
    for (const p of marriedAdults) {
      if (visited.has(p.id)) continue;
      const spouse = result.people.find(q => q.id === p.spouseId);
      if (!spouse) continue;
      visited.add(p.id);
      visited.add(spouse.id);
      if (random() < PROB.divorce) {
        const evt = addEvent({ year: y, type: 'DIVORCE', people: [p.id, spouse.id], details: { cityId: p.cityId } });
        indexEventByYear(evt);
        p.spouseId = null;
        spouse.spouseId = null;
      }
    }

    // Affairs (informational)
    const marriedPool = result.people.filter(p => p.alive && p.spouseId);
    for (const p of marriedPool) {
      if (random() < PROB.affair) {
        // majority heterosexual: pick candidates of opposite sex most of the time
        const preferOpposite = random() < 0.95; // 95% heterosexual
        const candidates = adults.filter(a => a.id !== p.id && a.id !== p.spouseId && (!preferOpposite || a.sex !== p.sex) && !isCloseKin(p, a));
        if (candidates.length) {
          const other = candidates[Math.floor(random() * candidates.length)];
          const evt = addEvent({ year: y, type: 'AFFAIR', people: [p.id, other.id], details: { cityId: p.cityId } });
          indexEventByYear(evt);
        }
      }
    }

    // Single murder event in chosen year
    if (!murderCommitted && y === murderYear) {
      const adultPool = adults.slice();
      if (adultPool.length >= 2) {
        const killer = adultPool[Math.floor(random() * adultPool.length)];
        let victim = adultPool[Math.floor(random() * adultPool.length)];
        if (victim.id === killer.id && adultPool.length > 1) {
          victim = adultPool.find(p => p.id !== killer.id) || victim;
        }
        victim.alive = false;
        const cityId = victim.cityId || killer.cityId || pickWeightedCityId();
        const evt = addEvent({ year: y, type: 'MURDER', people: [killer.id, victim.id], details: { cityId } });
        indexEventByYear(evt);
        murderCommitted = true;
        logLine(`Year ${y}: A murder occurred.`);
      }
    }

    // Mortality: check all alive persons (adults and minors)
    for (const p of result.people) {
      if (!p.alive) continue;
      const age = y - year(p.birthDate);
      if (age < 0) continue;
      const hazard = mortalityHazard(age);
      if (hazard > 0 && random() < hazard) {
        p.alive = false;
        const evt = addEvent({ year: y, type: 'DEATH', people: [p.id], details: { cityId: p.cityId, age } });
        indexEventByYear(evt);
      }
    }

    const yearEvents = eventsByYear.get(y) || [];
    if (b || m || yearEvents.length) {
      const parts = [];
      if (b) parts.push(`births=${b}`);
      if (m) parts.push(`marriages=${m}`);
      if (yearEvents.length) parts.push(`events=${yearEvents.length}`);
      logLine(`Year ${y}: ${parts.join(', ')}`);
    }
    // Progress from ~70% to ~98% during timeline playback
    const pct = 70 + Math.floor((yearIndex / totalYears) * 28);
    setProgress(pct);
  }

  // ---------- Finalize ----------
  await delay(50);
  result.summary = {
    population: result.people.length,
    marriages: result.marriages.length,
    startYear: START_YEAR,
    endYear: END_YEAR,
    events: result.events.length,
    murderYear: murderCommitted ? murderYear : null
  };
  result.generatedAt = new Date().toISOString();
  logLine(`Finalize: population=${result.people.length}, marriages=${result.marriages.length}`);
  setProgress(100);

  outputJsonEl.textContent = JSON.stringify(result, null, 2);

  setStatus('Done', 'done');
  startBtn.disabled = false;
  runAgainBtn.disabled = false;

  // Build quick lookup before any genealogy rendering
  const personById = new Map(result.people.map(p => [p.id, p]));

  // ----- Player Knowledge Model -----
  const STORAGE_KEY = 'ck:v1:knowledge';
  const emptyKnowledge = () => ({
    knownPeople: new Set(),
    // edges: { type: 'marriage'|'biological'|'guardian', a: id, b: id }
    edges: [],
    simSeed: result.seed
  });
  function loadKnowledge() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyKnowledge();
      const parsed = JSON.parse(raw);
      // If this save is from a different simulation seed, discard it
      if (parsed.simSeed !== result.seed) return emptyKnowledge();
      const k = emptyKnowledge();
      k.knownPeople = new Set(parsed.knownPeople || []);
      k.edges = Array.isArray(parsed.edges) ? parsed.edges : [];
      k.simSeed = parsed.simSeed || result.seed;
      return k;
    } catch {
      return emptyKnowledge();
    }
  }
  function saveKnowledge(k) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      knownPeople: Array.from(k.knownPeople),
      edges: k.edges,
      simSeed: result.seed
    }));
  }
  const knowledge = loadKnowledge();

  // Seed demo if empty: reveal one person and their spouse/parents
  if (knowledge.knownPeople.size === 0 && result.people.length) {
    const seed = result.people[Math.floor(Math.random() * result.people.length)];
    knowledge.knownPeople.add(seed.id);
    if (seed.spouseId) {
      knowledge.knownPeople.add(seed.spouseId);
      knowledge.edges.push({ type: 'marriage', a: seed.id, b: seed.spouseId });
    }
    if (seed.fatherId) {
      knowledge.knownPeople.add(seed.fatherId);
      knowledge.edges.push({ type: 'biological', a: seed.fatherId, b: seed.id });
    }
    if (seed.motherId) {
      knowledge.knownPeople.add(seed.motherId);
      knowledge.edges.push({ type: 'biological', a: seed.motherId, b: seed.id });
    }
    saveKnowledge(knowledge);
  }

  // ----- Genealogy Rendering (simple layered layout) -----
  function renderGenealogy() {
    // Build nodes from knownPeople
    const nodes = [];
    const edges = knowledge.edges.filter(e => knowledge.knownPeople.has(e.a) && knowledge.knownPeople.has(e.b));
    for (const id of knowledge.knownPeople) {
      const p = personById.get(id);
      if (!p) continue;
      nodes.push(p);
    }
    // Simple layering by generation; horizontal spacing by index
    const layers = new Map();
    for (const n of nodes) {
      const g = n.generation || 0;
      const arr = layers.get(g) || [];
      arr.push(n);
      layers.set(g, arr);
    }
    // Clear SVG
    while (geneSvg.firstChild) geneSvg.removeChild(geneSvg.firstChild);
    const marginX = 40, marginY = 60, w = 80, h = 80, gapX = 32, gapY = 120;
    const pos = new Map();
    const gens = Array.from(layers.keys()).sort((a, b) => a - b);
    for (let gi = 0; gi < gens.length; gi++) {
      const g = gens[gi];
      const row = layers.get(g);
      row.sort((a, b) => a.id - b.id);
      for (let i = 0; i < row.length; i++) {
        const x = marginX + i * (w + gapX);
        const y = marginY + gi * (h + gapY);
        pos.set(row[i].id, { x, y });
      }
    }
    // Draw edges first
    for (const e of edges) {
      const a = pos.get(e.a);
      const b = pos.get(e.b);
      if (!a || !b) continue;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      path.setAttribute('x1', String(a.x + w / 2));
      path.setAttribute('y1', String(a.y + h / 2));
      path.setAttribute('x2', String(b.x + w / 2));
      path.setAttribute('y2', String(b.y + h / 2));
      path.setAttribute('class', `gene-edge ${e.type}`);
      geneSvg.appendChild(path);
    }
    // Draw nodes (bathroom-sign style icon + name above)
    for (const n of nodes) {
      const p = pos.get(n.id);
      if (!p) continue;
      const gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Name above icon
      const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      name.setAttribute('x', String(p.x + w / 2));
      name.setAttribute('y', String(p.y - 8));
      name.setAttribute('text-anchor', 'middle');
      name.setAttribute('class', `gene-name${n.alive ? (n.retired ? ' retired' : '') : ' deceased'}`);
      name.textContent = `${n.firstName} ${n.lastName}`;
      gEl.appendChild(name);

      const cx = p.x + w / 2;
      const iw = 28; // emoji size looks better slightly smaller
      const ih = 28;
      const ix = cx - iw / 2;
      const iy = p.y; // top of icon area
      // Render as text emoji with skin tone and role
      const emojiText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      emojiText.setAttribute('x', String(cx));
      emojiText.setAttribute('y', String(iy + ih));
      emojiText.setAttribute('text-anchor', 'middle');
      emojiText.setAttribute('class', `gene-emoji${n.alive ? (n.retired ? ' retired' : '') : ' deceased'}`);
      emojiText.textContent = personEmojiFor(n);
      gEl.appendChild(emojiText);
      geneSvg.appendChild(gEl);
    }
  }

  function addKnownByQuery(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return; 
    const byId = q.match(/^\d+$/) ? Number(q) : null;
    let candidates = [];
    if (byId) {
      const p = personById.get(byId);
      if (p) candidates = [p];
    } else {
      candidates = result.people.filter(p => (`${p.firstName} ${p.lastName}`).toLowerCase().includes(q)).slice(0, 1);
    }
    if (candidates.length) {
      knowledge.knownPeople.add(candidates[0].id);
      // Auto-connect visible family edges for context (if in knowledge)
      const p = candidates[0];
      if (p.spouseId && knowledge.knownPeople.has(p.spouseId)) {
        knowledge.edges.push({ type: 'marriage', a: p.id, b: p.spouseId });
      }
      if (p.fatherId && knowledge.knownPeople.has(p.fatherId)) {
        knowledge.edges.push({ type: 'biological', a: p.fatherId, b: p.id });
      }
      if (p.motherId && knowledge.knownPeople.has(p.motherId)) {
        knowledge.edges.push({ type: 'biological', a: p.motherId, b: p.id });
      }
      saveKnowledge(knowledge);
      renderGenealogy();
    }
  }

  function revealRelative() {
    // If exactly one node selected, reveal a random close relative
    const ids = Array.from(knowledge.knownPeople);
    if (!ids.length) return;
    const base = personById.get(ids[Math.floor(Math.random() * ids.length)]);
    const relatives = [];
    if (base.spouseId) relatives.push({ type: 'marriage', id: base.spouseId, a: base.id, b: base.spouseId });
    if (base.partnerId) relatives.push({ type: 'guardian', id: base.partnerId, a: base.id, b: base.partnerId });
    if (base.fatherId) relatives.push({ type: 'biological', id: base.fatherId, a: base.fatherId, b: base.id });
    if (base.motherId) relatives.push({ type: 'biological', id: base.motherId, a: base.motherId, b: base.id });
    // children
    for (const p of result.people) {
      if (p.fatherId === base.id || p.motherId === base.id) {
        relatives.push({ type: 'biological', id: p.id, a: base.id, b: p.id });
      }
    }
    if (!relatives.length) return;
    const pickRel = relatives[Math.floor(Math.random() * relatives.length)];
    knowledge.knownPeople.add(pickRel.id);
    knowledge.edges.push({ type: pickRel.type, a: pickRel.a, b: pickRel.b });
    saveKnowledge(knowledge);
    renderGenealogy();
  }

  geneAddBtn.addEventListener('click', () => addKnownByQuery(geneSearchEl.value));
  geneRevealBtn.addEventListener('click', revealRelative);
  geneClearBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    while (geneSvg.firstChild) geneSvg.removeChild(geneSvg.firstChild);
  });

  renderGenealogy();

  // Person inspector: build indexes and bind search
  function renderPersonResults(query) {
    const q = (query || '').trim().toLowerCase();
    const matches = q
      ? result.people.filter(p => (`${p.firstName} ${p.lastName}`).toLowerCase().includes(q))
      : result.people.slice(0, 50);
    const top = matches.slice(0, 50);
    personResultsEl.innerHTML = '';
    for (const p of top) {
      const btn = document.createElement('button');
      btn.className = 'list-item';
      const y = year(p.birthDate);
      btn.textContent = `${p.firstName} ${p.lastName} (b. ${y})`;
      btn.addEventListener('click', () => renderPersonDetail(p.id));
      personResultsEl.appendChild(btn);
    }
  }

  function renderPersonDetail(personId) {
    const p = personById.get(personId);
    if (!p) return;
    const evts = (eventsByPerson.get(personId) || [])
      .map(id => result.events[id - 1])
      .sort((a, b) => a.year - b.year || a.id - b.id);
    const header = document.createElement('div');
    header.className = 'person-header';
    header.textContent = `${p.firstName} ${p.lastName} · ${p.sex} · b. ${year(p.birthDate)} · ${p.alive ? 'alive' : 'deceased'}`;
    const list = document.createElement('div');
    list.className = 'timeline';
    for (const e of evts) {
      const row = document.createElement('div');
      row.className = 'timeline-row';
      row.textContent = `${e.year} – ${formatEvent(e, personId)}`;
      list.appendChild(row);
    }
    personDetailEl.innerHTML = '';
    personDetailEl.appendChild(header);
    personDetailEl.appendChild(list);
    personDetailEl.scrollTop = 0;
  }

  function formatEvent(evt, povId) {
    switch (evt.type) {
      case 'BIRTH': {
        const city = evt.details?.cityId ? getCityName(evt.details.cityId) : 'Unknown';
        return `Born in ${city}`;
      }
      case 'MARRIAGE': {
        const [a, b] = evt.people;
        const otherId = a === povId ? b : a;
        const other = personById.get(otherId);
        const city = evt.details?.cityId ? ` in ${getCityName(evt.details.cityId)}` : '';
        return `Married ${other ? other.firstName + ' ' + other.lastName : 'Unknown'}${city}`;
      }
      case 'DIVORCE': {
        const [a, b] = evt.people;
        const otherId = a === povId ? b : a;
        const other = personById.get(otherId);
        const city = evt.details?.cityId ? ` in ${getCityName(evt.details.cityId)}` : '';
        return `Divorced ${other ? other.firstName + ' ' + other.lastName : 'Unknown'}${city}`;
      }
      case 'MOVE': {
        const from = evt.details?.fromCityId ? getCityName(evt.details.fromCityId) : (evt.details?.from || 'Unknown');
        const to = evt.details?.toCityId ? getCityName(evt.details.toCityId) : (evt.details?.to || 'Unknown');
        return `Moved from ${from} to ${to}`;
      }
      case 'JOB_CHANGE': {
        const job = evt.details?.jobTitle || 'New job';
        const city = evt.details?.cityId ? ` in ${getCityName(evt.details.cityId)}` : '';
        return `Changed job to ${job}${city}`;
      }
      case 'RETIREMENT': {
        const city = evt.details?.cityId ? ` in ${getCityName(evt.details.cityId)}` : '';
        const age = typeof evt.details?.age === 'number' ? ` at ${evt.details.age}` : '';
        return `Retired${age}${city}`;
      }
      case 'AFFAIR': {
        const [a, b] = evt.people;
        const otherId = a === povId ? b : a;
        const other = personById.get(otherId);
        const city = evt.details?.cityId ? ` in ${getCityName(evt.details.cityId)}` : '';
        return `Affair with ${other ? other.firstName + ' ' + other.lastName : 'Unknown'}${city}`;
      }
      case 'MURDER': {
        const [killerId, victimId] = evt.people;
        const city = evt.details?.cityId ? ` in ${getCityName(evt.details.cityId)}` : '';
        if (povId === killerId) {
          const victim = personById.get(victimId);
          return `Committed a murder of ${victim ? victim.firstName + ' ' + victim.lastName : 'Unknown'}${city}`;
        } else if (povId === victimId) {
          return `Victim of a murder${city}`;
        } else {
          const killer = personById.get(killerId);
          const victim = personById.get(victimId);
          return `Murder: ${killer ? killer.firstName + ' ' + killer.lastName : 'Unknown'} -> ${victim ? victim.firstName + ' ' + victim.lastName : 'Unknown'}${city}`;
        }
      }
      case 'DEATH': {
        const city = evt.details?.cityId ? ` in ${getCityName(evt.details.cityId)}` : '';
        const age = typeof evt.details?.age === 'number' ? ` at ${evt.details.age}` : '';
        return `Died${age}${city}`;
      }
      default:
        return `${evt.type}`;
    }
  }

  personSearchEl.addEventListener('input', (e) => {
    renderPersonResults(e.target.value || '');
  });
  renderPersonResults('');
}

function startGame() {
  heroEl.classList.add('hidden');
  simEl.classList.remove('hidden');
  runSimulation();
}

startBtn.addEventListener('click', startGame);
runAgainBtn.addEventListener('click', () => {
  runSimulation();
});

toggleJsonBtn.addEventListener('click', () => {
  outputJsonEl.classList.toggle('hidden');
});

