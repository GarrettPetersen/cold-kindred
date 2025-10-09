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

  const JOBS = [
    'Teacher','Nurse','Software Engineer','Police Officer','Construction Worker','Sales Manager','Accountant','Mechanic','Chef','Graphic Designer','Electrician','Plumber','Truck Driver','Doctor','Lawyer','Scientist','Researcher','Data Analyst','Retail Associate','Waiter','Barista','Pharmacist','Architect','Journalist','Pilot','Flight Attendant','HR Specialist','Product Manager','Marketing Manager','Financial Analyst','Security Guard','Warehouse Worker','Civil Engineer','Social Worker','Librarian','Dentist','Veterinarian','Farmer','Paramedic','Firefighter'
  ];

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
  const uniqueFounderBirthdates = uniqueBirthdates(foundersMaleCount + foundersFemaleCount, 1920, 1935);

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
    females.push(p);
  }

  result.steps.push({ name: 'Founders', males: males.length, females: females.length });
  logLine(`Generated founders: ${males.length + females.length} with unique surnames, first names, and birthdates`);
  setProgress(15);

  // ---------- Step 2: Pair founders and record marriages ----------
  await delay(150);
  function pairAndMarry(malesArr, femalesArr) {
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
      const pairCount = Math.floor(Math.min(msAll.length, fListAll.length) * 0.8); // marry ~80%
      for (let i = 0; i < pairCount; i++) {
        const h = msAll[i];
        const w = fListAll[i];
        const marriageYear = Math.max(year(h.birthDate), year(w.birthDate)) + 20 + Math.floor(random() * 10);
        marry(h, w, marriageYear);
        couples.push([h, w]);
      }
      // Remaining singles in this city form partnerships (~60% of remainder)
      const remainingM = msAll.slice(pairCount);
      const remainingF = fListAll.slice(pairCount);
      const partnerCount = Math.floor(Math.min(remainingM.length, remainingF.length) * 0.6);
      for (let i = 0; i < partnerCount; i++) {
        const h = remainingM[i];
        const w = remainingF[i];
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
  const g0 = pairAndMarry(males, females);
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
      const numKids = Math.floor(random() * 4); // 0..3 kids
      for (let k = 0; k < numKids; k++) {
        const sex = random() < 0.5 ? 'M' : 'F';
        const firstName = sex === 'M' ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
        const lastName = father.lastName; // father's family name
        const birthDate = randomChildBirthDate(year(mother.birthDate));
        // Determine biological father (affair-born children possible only heterosexual)
        let bioFatherId = father.id;
        // detect if pair is a married couple or a partnership
        const isMarriedPair = couples.some(([fh, mw]) => fh.id === father.id && mw.id === mother.id);
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
    const next = pairAndMarry(genMales, genFemales);
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
        const newJob = JOBS[Math.floor(random() * JOBS.length)];
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
        const candidates = adults.filter(a => a.id !== p.id && a.id !== p.spouseId && (!preferOpposite || a.sex !== p.sex));
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

  // Person inspector: build indexes and bind search
  const personById = new Map(result.people.map(p => [p.id, p]));
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

