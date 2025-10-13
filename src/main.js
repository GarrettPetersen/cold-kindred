// styles are linked in index.html
import { getGlobalNewsStory } from './newsStories.js';

const app = document.getElementById('app');

app.innerHTML = `
  <main>
    <button id="menuToggle" class="hamburger" aria-label="Menu">☰</button>
    <section class="hero" id="hero">
      <h1>Cold Kindred</h1>
      <p class="tagline">A procedural cold case investigation.</p>
      <button id="start" class="start">Start Investigation</button>
    </section>

    <section id="sim" class="sim hidden" aria-live="polite">

      <div class="panels">
        <div class="sidebar">
          <div class="city-banner">City: <span id="playerCityName">Unknown</span></div>
          <div class="city-search">
            <input id="residentSearch" class="input" placeholder="Search residents… (last name)" autocomplete="off" />
            <div id="residentList" class="typeahead"></div>
          </div>
          <button class="menu-btn active" data-panel="evidence">Evidence locker</button>
          <button class="menu-btn" data-panel="records">Public records office</button>
          <button class="menu-btn" data-panel="graveyard">Graveyard</button>
          <button class="menu-btn" data-panel="codis">CODIS</button>
          <button class="menu-btn" data-panel="airport">Airport</button>
          <button class="menu-btn" data-panel="genealogy">Connections</button>
          <button class="menu-btn" data-panel="news">Newspaper archive</button>
        </div>
        <div id="panel-evidence" class="panel tab-panel">
          <h2>Evidence locker</h2>
          <div id="evList" class="list"></div>
          <div id="evActions" class="detail" style="margin-top:8px"></div>
          <div id="evStatus" class="title-sub"></div>
        </div>
        <div id="panel-records" class="panel tab-panel hidden">
          <h2>Public records</h2>
          <div class="section field-row">
            <label>Type
              <select id="recType" class="input" style="width:160px">
                <option value="birth">Births</option>
                <option value="death">Deaths</option>
                <option value="marriage">Marriages</option>
              </select>
            </label>
            <label>Year
              <input id="recYear" class="input" style="width:120px" placeholder="e.g. 1955" />
            </label>
            <label>Letter range
              <select id="recRange" class="input" style="width:160px">
                <option value="A-D">A–D</option>
                <option value="E-H">E–H</option>
                <option value="I-L">I–L</option>
                <option value="M-P">M–P</option>
                <option value="Q-T">Q–T</option>
                <option value="U-Z">U–Z</option>
              </select>
            </label>
            <button id="recSearch" class="start secondary">Search</button>
          </div>
          <div id="recResults" class="detail"></div>
        </div>
        <div id="panel-graveyard" class="panel tab-panel hidden">
          <h2>Graveyard</h2>
          <div class="section field-row">
            <label>Plot # <input id="gyPlot" class="input" type="number" style="width:120px" /></label>
            <button id="gyLookup" class="start secondary">Lookup</button>
          </div>
          <div id="gyResults" class="detail"></div>
        </div>
        <div id="panel-codis" class="panel tab-panel hidden">
          <h2>CODIS</h2>
          <div class="section">
            <button id="codisRefresh" class="start secondary">Refresh</button>
          </div>
          <div id="codisList" class="detail"></div>
        </div>
        <div id="panel-interview" class="panel tab-panel hidden">
          <h2>Interview</h2>
          <div id="intHeader" class="title-sub"></div>
          <div id="intTranscript" class="detail" style="height:200px; overflow:auto"></div>
          <div class="section">
            <button id="intHello" class="start secondary">Say "hello"</button>
            <button id="intBack" class="start secondary">Back</button>
          </div>
        </div>
        <div id="panel-news" class="panel tab-panel hidden">
          <h2>Newspaper archive</h2>
          <div class="section field-row">
            <label>Year <input id="newsYear" class="input" style="width:120px" placeholder="e.g. 1972" /></label>
            <button id="newsSearch" class="start secondary">Search</button>
          </div>
          <div id="newsResults" class="detail"></div>
        </div>
        <div id="panel-airport" class="panel tab-panel hidden">
          <h2>Airport</h2>
          <div id="locText" class="location-text">Location: Unknown</div>
          <svg id="mapSvg" class="map-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
        <div id="panel-genealogy" class="panel tab-panel hidden">
          <h2>Connections</h2>
          <svg id="geneSvg" class="gene-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
        <div id="panel-log" class="panel tab-panel hidden">
          <h2>Run Log</h2>
          <div id="log" class="log" aria-label="Simulation log"></div>
          <div style="margin-top:8px">
            <button id="toggleJson" class="text-btn">Toggle JSON</button>
          </div>
          <pre id="outputJson" class="json hidden"></pre>
        </div>
      </div>
    </section>
    <section id="overlaySim" class="overlay"><div class="overlay-card">
      <div class="title-sub">Simulating 125 years of demographic changes. This may take a few minutes.</div>
      <div id="flashYear" class="year-flash">1900</div>
      <div id="flashMsg" class="title-sub"></div>
      <div id="flashFeed" class="flash-feed"></div>
    </div></section>
    <section id="overlayTitle" class="overlay"><div class="overlay-card">
      <div class="title-headline" id="titleHeadline">Case Brief</div>
      <div class="title-sub" id="titleSub"></div>
      <button id="titleContinue" class="title-btn">Begin Investigation</button>
    </div></section>
  </main>
`;

const heroEl = document.getElementById('hero');
const simEl = document.getElementById('sim');
const startBtn = document.getElementById('start');
const runAgainBtn = document.getElementById('runAgain');
const statusEl = { textContent: '' , classList: { remove(){}, add(){} } };
const progressEl = { setAttribute(){} };
const progressBarEl = { style: { width: '0%' } };
const logEl = document.getElementById('log');
const outputJsonEl = document.getElementById('outputJson');
const toggleJsonBtn = document.getElementById('toggleJson');
const menuToggleBtn = document.getElementById('menuToggle');
const personSearchEl = document.getElementById('personSearch');
const personResultsEl = document.getElementById('personResults');
const personDetailEl = document.getElementById('personDetail');
const geneSearchEl = document.getElementById('geneSearch');
const geneAddBtn = document.getElementById('geneAdd');
const geneRevealBtn = document.getElementById('geneReveal');
const geneClearBtn = document.getElementById('geneClear');
const geneSvg = document.getElementById('geneSvg');
const mapSvg = document.getElementById('mapSvg');
const locText = document.getElementById('locText');
const playerCityNameEl = document.getElementById('playerCityName');
const menuButtons = Array.from(document.querySelectorAll('.menu-btn'));
const panelByName = (n) => document.getElementById(`panel-${n}`);
const evSendDNA = document.getElementById('evSendDNA');
const evStatus = document.getElementById('evStatus');
const recTypeEl = document.getElementById('recType');
const recYearEl = document.getElementById('recYear');
const recRangeEl = document.getElementById('recRange');
const recSearchBtn = document.getElementById('recSearch');
const recResultsEl = document.getElementById('recResults');
const gyPlotEl = document.getElementById('gyPlot');
const gyLookupBtn = document.getElementById('gyLookup');
const gyResultsEl = document.getElementById('gyResults');
const codisRefreshBtn = document.getElementById('codisRefresh');
const codisListEl = document.getElementById('codisList');
const newsYearEl = document.getElementById('newsYear');
const newsSearchBtn = document.getElementById('newsSearch');
const newsResultsEl = document.getElementById('newsResults');
// removed offset tool
const overlaySim = document.getElementById('overlaySim');
const overlayTitle = document.getElementById('overlayTitle');
const flashYearEl = document.getElementById('flashYear');
const flashMsgEl = document.getElementById('flashMsg');
const titleHeadlineEl = document.getElementById('titleHeadline');
const titleSubEl = document.getElementById('titleSub');
const titleContinueBtn = document.getElementById('titleContinue');
const flashFeedEl = document.getElementById('flashFeed');

function pushFlash(text, style = 'normal') {
  if (!flashFeedEl) return;
  // bump existing lines' fade levels
  const lines = Array.from(flashFeedEl.querySelectorAll('.flash-line'));
  lines.forEach((ln) => {
    for (let i = 5; i >= 0; i--) ln.classList.remove(`fade-${i}`);
    const cur = Number(ln.dataset.fade || 0);
    const next = Math.min(cur + 1, 5);
    ln.dataset.fade = String(next);
    ln.classList.add(`fade-${next}`);
  });
  // add new line at top
  const div = document.createElement('div');
  div.className = 'flash-line fade-0' + (style === 'murder' ? ' murder' : '');
  div.dataset.fade = '0';
  div.textContent = text;
  flashFeedEl.prepend(div);
  // cap to last ~10
  const all = Array.from(flashFeedEl.querySelectorAll('.flash-line'));
  all.slice(10).forEach(n => n.remove());
}

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
    events: [],
    graveyards: {}, // { [cityId]: { nextPlotId:number, plots: { [plotId]: number[] } } }
    evidence: {}, // { [cityId]: Array<{ id:string, name:string, type:string, actions?:string[] }> }
    conversations: {} // { [personId]: Array<{ from:'you'|'npc', text:string, ts:number }> }
  };

  setStatus('Running…', 'running');
  setProgress(0);
  logEl.innerHTML = '';
  outputJsonEl.textContent = '';
  logLine('Starting simulation');
  // show overlay for flashing years
  overlaySim.classList.add('visible');
  if (flashYearEl) flashYearEl.textContent = '1900';
  pushFlash('Preparing simulation…');

  // ---------- Name lists (common US names, truncated for demo but sufficient for uniqueness) ----------
  const COMMON_SURNAMES = [
    // Top US surnames (extended set)
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell','Jenkins','Perry','Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes','Gonzales','Fisher','Vasquez','Simmons','Romero','Jordan','Patterson','Alexander','Hamilton','Graham','Reynolds','Griffin','Wallace','Moreno','West','Cole','Hayes','Bryant','Herrera','Gibson','Ellis','Tran','Medina','Aguilar','Stevens','Murray','Ford','Castro','Marshall','Owens','Harrison','Fernandez','Mcdonald','Woods','Washington','Kennedy','Wells','Vargas','Henry','Chen','Freeman','Shaw','Mendez','Weaver','Guzman','Nichols','Olson','Ramsey','Hunter','Hart','Guerrero','George','Porter','Chambers','Moss','Newton','Page','Schmidt','Hansen','Bishop','Burke','Boyd','Lowe','Dean','Haynes','Fleming','Park','Warren','Gibbs','Walters','Lyons','Barker','Paul','Mack','Poole','Frank','Logan','Owen','Bass','Marsh','Drake','Sutton','Jennings','Boone','Banks','Potter','Lindsey','Pope','Sherman','Weston','Conner','Baldwin','French','Farmer','Hines','Lawson','Casey','Little','Day','Fowler','Bowman','Davidson','May','Carroll','Fields','Figueroa','Carlson','Mccarthy','Harrington','Norton','Atkins','Luna','Miles','Greer','Roman','Morrow','Randall','Clarke','Parks','Lambert','Stephens','Snyder','Mason','Salazar','Cross','Curtis','Kent','Doyle','Brock','Cummings','Erickson','Holland','Keller','Klein','Pratt','Tyler','Sharp','Barber','Goodman','Brady',
    // Additional US/Anglo/Euro-immigrant surnames to broaden variety
    'Abbott','Acevedo','Acosta','Aguirre','Albert','Alston','Anthony','Archer','Armstrong','Arroyo','Ashby','Ashley','Atkinson','Austin','Avery','Ball','Barrett','Bartlett','Bates','Becker','Bellamy','Benton','Berg','Berry','Black','Blair','Blake','Bolton','Bond','Booker','Booth','Bowers','Boyle','Bradford','Bradley','Brady','Brandt','Brennan','Brewer','Bridges','Briggs','Brock','Browning','Bruce','Bryan','Buchanan','Buck','Burnett','Burns','Burton','Bush','Calderon','Calhoun','Callahan','Camacho','Cameron','Carey','Carlson','Carney','Carr','Carson','Case','Castro','Chan','Chandler','Chang','Chapman','Charles','Chase','Christensen','Christian','Chu','Clarke','Clayton','Cline','Cobb','Cohen','Contreras','Conway','Cooke','Cooley','Copeland','Cordova','Cortez','Costa','Craig','Crane','Crawford','Crosby','Curry','Daniel','Daniels','Daugherty','David','Davila','Dawson','Decker','Delgado','Dennis','Dickerson','Dickson','Dixon','Dodson','Dominguez','Dorsey','Douglas','Downs','Doyle','Duarte','Duffy','Duke','Dunlap','Dunn','Durham','Dyer','Eaton','Edmonds','Elliott','Emerson','England','Espinoza',' Estes','Ferguson','Finley','Fischer','Fitzgerald','Floyd','Flynn','Foreman','Fowler','Fox','Francis','Frederick','Friedman','Frost','Fry','Fuller','Gallegos','Gamble','Garner','Gay','George','Gentry','Glass','Golden','Good','Goodwin','Gordon','Gould','Grant','Graves','Greene','Grimes','Gross','Guerra','Guthrie','Hale','Haley','Hancock','Haney','Hardin','Harding','Harper','Harris','Harrington','Hatch','Hawkins','Hayden','Heath','Hebert','Hendrix','Hensley','Henson','Herman','Herring','Hess','Hester','Hewitt','Hickman','Hinton','Hobbs','Hodge','Hoffman','Holder','Holloway','Hoover','Hooper','Hopkins','Horne','House','Hubbard','Huber','Huerta','Huff','Humphrey','Hurst','Hutchinson','Ibarra','Ingram','Jack','Jacobson','Jensen','Johns','Johnston','Kane','Keith','Keller','Kelley','Kemp','Kendall','Kerr','Kidd','Kirk','Kirby','Kirkpatrick','Kline','Knapp','Knight','Knowles','Kramer','Lamb','Lamb','Lambert','Lancaster','Landry','Lane','Lang','Lara','Larsen','Larson','Lawrence','Le','Leach','Leal','Leblanc','Lee','Lehman','Lester','Levine','Li','Lindsey','Lloyd','Lucas','Lynn','Macdonald','Maddox','Maldonado','Mann','Manning','Marks','Marquez','Marsh','Marshall','Massey','Mathews','Mathis','Mayer','Maynard','McBride','McCall','McCann','McCarthy','McClain','McConnell','McCormick','McCoy','McCullough','McDaniel','McDowell','McGee','McGuire','McIntyre','McKay','McKee','McKenzie','McKinney','McKnight','McLaughlin','McLean','McNeil','McPherson','Meadows','Mejia','Melendez','Mendez','Meredith','Michael','Middleton','Miranda','Mitchell','Monroe','Monson','Montgomery','Montoya','Moon','Mooney','Moran','Moreno','Morris','Morrow','Mosley','Moss','Mueller','Munoz','Navarro','Neal','Nelson','Newman','Nielsen','Nixon','Noble','Noel','Norman','Norris','Nunez','Ochoa','Odom','Olsen','Ortega','Ortiz','Osborne','Owen','Pacheco','Padilla','Page','Palmer','Park','Parks','Parsons','Payne','Pearce','Pena','Pennington','Perkins','Phelps','Phillips','Pineda','Pittman','Pollard','Portillo','Potter','Powell','Preston','Price','Quinn','Ramsey','Randolph','Rasmussen','Ray','Raymond','Reese','Reeves','Reid','Reilly','Richard','Richards','Riggs','Riley','Rios','Rivas','Roach','Robbins','Rocha','Rojas','Rollins','Roman','Roosevelt','Rosales','Rosario','Roth','Rowe','Roy','Salas','Salgado','Salinas','Sampson','Sanchez','Sandoval','Santana','Santiago','Santos','Sargent','Saunders','Savage','Sawyer','Schmidt','Schneider','Schroeder','Schultz','Schwartz','Sears','Sexton','Shaffer','Shannon','Sharp','Shaw','Shea','Shepherd','Sheppard','Sherman','Shields','Short','Silva','Simmons','Simpson','Singleton','Skinner','Slater','Sloan','Small','Smart','Snow','Solomon','Sosa','Soto','Spears','Spencer','Stafford','Stanley','Stark','Steele','Stein','Stephenson','Stevenson','Stewart','Stokes','Stone','Stout','Strickland','Strong','Stuart','Suarez','Sullivan','Summers','Swanson','Sweeney','Sweet','Tanner','Tate','Terrell','Terry','Thomas','Thornton','Todd','Townsend','Tran','Trevino','Trujillo','Tucker','Turner','Tyler','Underwood','Valdez','Valencia','Valentine','Valenzuela','Vance','Vega','Velasquez','Velez','Villarreal','Vincent','Vinson','Wade','Wagner','Walker','Wall','Walsh','Walter','Ware','Warner','Warren','Washington','Waters','Watkins','Watson','Weaver','Webb','Weber','Webster','Weeks','Weiss','Welch','West','Wheeler','Whitaker','Whitehead','Whitfield','Whitley','Whitney','Wiggins','Wilcox','Wiley','Wilkerson','Wilkinson','William','Williamson','Willis','Wilson','Winters','Wise','Wolfe','Wong','Woodard','Woods','Workman','Wright','Wu','Wyatt','Yang','Yates','Young','Zamora','Zhang','Zuniga'
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
      firstName: fields.firstName || 'Unknown',
      lastName: fields.lastName || null,
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
      knowledgeRadius: fields.knowledgeRadius || null,
      knowsAffairs: fields.knowsAffairs ?? null,
      disposition: fields.disposition || null, // 'buried' | 'cremated'
      retired: false,
      alive: true
    };
    // Ensure last name present; prefer mother's surname, then father's, then 'Unknown'
    if (!person.lastName) {
      const mom = fields.motherId ? result.people.find(p => p.id === fields.motherId) : null;
      const dad = fields.fatherId ? result.people.find(p => p.id === fields.fatherId) : null;
      const fallback = mom?.lastName || dad?.lastName;
      person.lastName = fallback && fallback !== 'Unknown' ? fallback : pick(COMMON_SURNAMES);
    }
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

  // Major US cities with approximate population weights (expanded for coverage)
  const CITIES = [
    { id: 1, name: 'New York, NY', weight: 8336817 },
    { id: 2, name: 'Los Angeles, CA', weight: 3979576, offsetX: -22, offsetY: 0 },
    { id: 3, name: 'Chicago, IL', weight: 2693976, offsetX: 6, offsetY: 38 },
    { id: 4, name: 'Houston, TX', weight: 2320268, offsetX: 0, offsetY: 46 },
    { id: 5, name: 'Phoenix, AZ', weight: 1680992, offsetX: 6, offsetY: 14 },
    { id: 6, name: 'Philadelphia, PA', weight: 1584064 },
    { id: 7, name: 'San Antonio, TX', weight: 1547253, offsetX: -8, offsetY: 40 },
    { id: 8, name: 'San Diego, CA', weight: 1423851, offsetX: -32, offsetY: -6 },
    { id: 9, name: 'Dallas, TX', weight: 1343573, offsetX: -4, offsetY: 62 },
    { id: 10, name: 'San Jose, CA', weight: 1030119, offsetX: 6, offsetY: -40 },
    { id: 11, name: 'San Francisco, CA', weight: 883305, offsetX: -8, offsetY: -18 },
    { id: 12, name: 'Seattle, WA', weight: 744955, offsetX: 56, offsetY: -14 },
    { id: 13, name: 'Portland, OR', weight: 653115, offsetX: 48, offsetY: -8 },
    { id: 14, name: 'Miami, FL', weight: 470914, offsetX: 18, offsetY: -28 },
    { id: 15, name: 'Atlanta, GA', weight: 498715, offsetX: 46, offsetY: 34 },
    { id: 16, name: 'New Orleans, LA', weight: 391006, offsetX: 26, offsetY: 26 },
    { id: 17, name: 'Denver, CO', weight: 715522 },
    { id: 18, name: 'Salt Lake City, UT', weight: 200133 },
    { id: 19, name: 'Kansas City, MO', weight: 508090, offsetX: 0, offsetY: 14 },
    { id: 20, name: 'Oklahoma City, OK', weight: 681054 },
    { id: 21, name: 'St. Louis, MO', weight: 301578, offsetX: 0, offsetY: 20 },
    { id: 22, name: 'Minneapolis, MN', weight: 429954, offsetX: 0, offsetY: 28 }
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
  function getCityLatLng(cityId) {
    switch (cityId) {
      case 1: return [40.7128, -74.0060]; // New York
      case 2: return [34.0522, -118.2437]; // Los Angeles
      case 3: return [41.8781, -87.6298]; // Chicago
      case 4: return [29.7604, -95.3698]; // Houston
      case 5: return [33.4484, -112.0740]; // Phoenix
      case 6: return [39.9526, -75.1652]; // Philadelphia
      case 7: return [29.4241, -98.4936]; // San Antonio
      case 8: return [32.7157, -117.1611]; // San Diego
      case 9: return [32.7767, -96.7970]; // Dallas
      case 10: return [37.3382, -121.8863]; // San Jose (ensure north of Mexico)
      case 11: return [37.7749, -122.4194]; // San Francisco
      case 12: return [47.6062, -122.3321]; // Seattle
      case 13: return [45.5152, -122.6784]; // Portland
      case 14: return [25.7617, -80.1918]; // Miami
      case 15: return [33.7490, -84.3880]; // Atlanta
      case 16: return [29.9511, -90.0715]; // New Orleans
      case 17: return [39.7392, -104.9903]; // Denver
      case 18: return [40.7608, -111.8910]; // Salt Lake City
      case 19: return [39.0997, -94.5786]; // Kansas City
      case 20: return [35.4676, -97.5164]; // Oklahoma City
      case 21: return [38.6270, -90.1994]; // St. Louis
      case 22: return [44.9778, -93.2650]; // Minneapolis
      default: return [39.8283, -98.5795];
    }
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
    // Assign knowledge traits (2..5) and affair-knowledge
    const r = random();
    person.knowledgeRadius = r < 0.2 ? 2 : r < 0.7 ? 3 : r < 0.95 ? 4 : 5;
    // Older generations slightly less likely to know affairs
    const knows = random() < 0.35; // base
    person.knowsAffairs = knows;
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

  function validateBabyAttributes(baby, father, mother) {
    const issues = [];
    if (!baby.firstName) issues.push('firstName');
    if (!baby.lastName || baby.lastName === 'Unknown') issues.push('lastName');
    if (!baby.birthDate) issues.push('birthDate');
    else if (Number.isNaN(year(baby.birthDate))) issues.push('birthYear');
    if (baby.skinTone == null) issues.push('skinTone');
    if (!baby.cityId) issues.push('cityId');
    if (!father || !mother) issues.push('parents');
    if (issues.length) {
      // Print a compact object helpful for debugging lineage
      console.error('[BABY_VALIDATION]', {
        issues,
        baby: {
          id: baby.id,
          firstName: baby.firstName,
          lastName: baby.lastName,
          birthDate: baby.birthDate,
          generation: baby.generation,
          skinTone: baby.skinTone,
          cityId: baby.cityId
        },
        father: father ? { id: father.id, name: father.firstName + ' ' + father.lastName, cityId: father.cityId } : null,
        mother: mother ? { id: mother.id, name: mother.firstName + ' ' + mother.lastName, cityId: mother.cityId } : null
      });
    }
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
    // marriage date: pick a plausible month/day
    const m = 1 + Math.floor(Math.random() * 12);
    const dim = new Date(Date.UTC(yearOfMarriage, m, 0)).getUTCDate();
    const d = 1 + Math.floor(Math.random() * dim);
    addEvent({ year: yearOfMarriage, type: 'MARRIAGE', people: [husband.id, wife.id], details: { marriageId: rec.id, cityId: husband.cityId, date: isoFromYMD(yearOfMarriage, m, d), month: m } });
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

  // War windows (US involvement)
  const WAR_PERIODS = [
    { from: 1917, to: 1918, label: 'combat in World War I' },
    { from: 1941, to: 1945, label: 'combat in World War II' },
    { from: 1950, to: 1953, label: 'combat in the Korean War' },
    { from: 1965, to: 1973, label: 'combat in the Vietnam War' },
    { from: 1990, to: 1991, label: 'combat in the Gulf War' },
    { from: 2001, to: 2014, label: 'combat in Afghanistan' },
    { from: 2003, to: 2011, label: 'combat in the Iraq War' }
  ];
  function warAt(year) { return WAR_PERIODS.find(w => year >= w.from && year <= w.to) || null; }

  // Cause-of-death selection (simple, age/year/sex aware)
  function deathCauseFor(age, year, sex) {
    // Only combat-age men die from combat causes
    if (sex === 'M' && age >= 18 && age <= 35) {
      const inWar = warAt(year);
      if (inWar && Math.random() < 0.15) return inWar.label;
    }
    if (year === 1918 && age >= 1 && age <= 50) {
      if (Math.random() < 0.15) return 'influenza pandemic';
    }
    if (age < 1) return Math.random() < 0.5 ? 'complications at birth' : 'infant illness';
    if (age < 13) return Math.random() < 0.6 ? 'illness' : 'accident';
    if (age < 26) return Math.random() < 0.6 ? 'accident' : (year > 1990 && Math.random() < 0.4 ? 'overdose' : 'illness');
    if (age < 45) return Math.random() < 0.5 ? 'accident' : (Math.random() < 0.5 ? 'cancer' : 'heart condition');
    if (age < 65) return Math.random() < 0.55 ? 'cancer' : (Math.random() < 0.5 ? 'heart disease' : 'stroke');
    if (age < 85) return Math.random() < 0.6 ? 'heart disease' : (Math.random() < 0.5 ? 'cancer' : 'stroke');
    return Math.random() < 0.6 ? 'natural causes' : 'heart failure';
  }
  function burialDispositionFor(year) {
    // Rough cremation rates: ~5% (1960s), ~25% (1990s), ~50% (2010s+). Interpolate.
    if (year < 1970) return Math.random() < 0.05 ? 'cremated' : 'buried';
    if (year < 1990) return Math.random() < 0.12 ? 'cremated' : 'buried';
    if (year < 2005) return Math.random() < 0.25 ? 'cremated' : 'buried';
    if (year < 2015) return Math.random() < 0.4 ? 'cremated' : 'buried';
    return Math.random() < 0.55 ? 'cremated' : 'buried';
  }

  // Graveyard helpers
  function getGraveyard(cityId) {
    const gy = result.graveyards[cityId];
    if (gy) return gy;
    const created = { nextPlotId: 1, plots: {} };
    result.graveyards[cityId] = created;
    return created;
  }
  function buriedPlotOf(personId) {
    // Scan all graveyards to find the plot (rarely needed for small scale); optimize later with an index if required
    const p = personByIdPre.get(personId);
    if (!p || !p.disposition || p.disposition !== 'buried') return null;
    const cityId = p.cityId;
    const gy = result.graveyards[cityId];
    if (!gy) return null;
    const plots = gy.plots;
    for (const pid in plots) {
      if (plots[pid].includes(personId)) return Number(pid);
    }
    return null;
  }
  function assignBurialPlot(person) {
    const cityId = person.cityId;
    const gy = getGraveyard(cityId);
    // Prefer existing plot of spouse or direct family (parents/children) in same city
    const relatives = new Set();
    if (person.spouseId) relatives.add(person.spouseId);
    if (person.fatherId) relatives.add(person.fatherId);
    if (person.motherId) relatives.add(person.motherId);
    // children
    for (const c of result.people) {
      if (c.fatherId === person.id || c.motherId === person.id) relatives.add(c.id);
    }
    // choose first relative with buried plot in same city
    for (const rid of relatives) {
      const r = personByIdPre.get(rid);
      if (!r || !r.cityId || r.cityId !== cityId) continue;
      if (r.disposition === 'buried') {
        const plot = buriedPlotOf(r.id);
        if (plot != null) {
          gy.plots[plot] = gy.plots[plot] || [];
          gy.plots[plot].push(person.id);
          return plot;
        }
      }
    }
    // Otherwise place in first empty plot or create new
    let chosen = null;
    for (let pid = 1; pid < gy.nextPlotId; pid++) {
      const occ = gy.plots[pid] || [];
      if (occ.length === 0) { chosen = pid; break; }
    }
    if (chosen == null) {
      chosen = gy.nextPlotId++;
    }
    gy.plots[chosen] = gy.plots[chosen] || [];
    gy.plots[chosen].push(person.id);
    return chosen;
  }

  // ---------- Step 1: Founders (G0) with unique last names, first names, birthdates ----------
  await delay(150);
  const foundersMaleCount = 382;
  const foundersFemaleCount = 383;

  const requestedSurnames = foundersMaleCount + foundersFemaleCount;
  if (requestedSurnames > COMMON_SURNAMES.length) {
    console.error('[SURNAME_POOL]', {
      message: 'Founding population exceeds surname list size; duplicates may occur.',
      requested: requestedSurnames,
      available: COMMON_SURNAMES.length
    });
  }
  const uniqueSurnames = sampleWithoutReplacement(COMMON_SURNAMES, requestedSurnames);
  const surnameAt = (i) => uniqueSurnames.length ? uniqueSurnames[i % uniqueSurnames.length] : pick(COMMON_SURNAMES);
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
      lastName: surnameAt(idx),
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
      lastName: surnameAt(idx),
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
        // Choose family surname: if out of wedlock (partner pair), take mother's surname; if affair in marriage, keep family (husband's) surname; otherwise father's
        let lastName = father.lastName;
        const isPartnerPair = !isMarriedPair;
        if (isPartnerPair) {
          lastName = mother.lastName || lastName;
        }
        const birthDate = randomChildBirthDate(year(mother.birthDate));
        // Determine biological father (affair-born children possible only heterosexual)
        let bioFatherId = father.id;
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
        // Knowledge inheritance with noise
        const baseKR = Math.round(((father.knowledgeRadius || 3) + (mother.knowledgeRadius || 3)) / 2);
        child.knowledgeRadius = Math.max(2, Math.min(5, baseKR + (random() < 0.2 ? (random() < 0.5 ? -1 : 1) : 0)));
        child.knowsAffairs = random() < 0.35 || (father.knowsAffairs || mother.knowsAffairs);
        validateBabyAttributes(child, father, mother);
        children.push(child);
        births++;
        // record birth event with exact date
        const outOfWedlock = isPartnerPair;
        const by = year(birthDate); const bm = new Date(birthDate).getUTCMonth() + 1; const bd = new Date(birthDate).getUTCDate();
        addEvent({ year: by, type: 'BIRTH', people: [child.id], details: { cityId: child.cityId, outOfWedlock, fromAffair: fromAffair && bioFatherId !== father.id, date: isoFromYMD(by, bm, bd), month: bm } });
        
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

  // Prepare maps and choose a fixed killer before the yearly loop so we can ban their close relatives from DNA tests
  const personByIdPre = new Map(result.people.map(p => [p.id, p]));
  function ancestorsUpTo(person, maxDepth) {
    const out = new Map();
    const queue = [{ id: person.id, depth: 0 }];
    while (queue.length) {
      const { id, depth } = queue.shift();
      if (depth >= maxDepth) continue;
      const p = personByIdPre.get(id);
      if (!p) continue;
      const nextDepth = depth + 1;
      if (p.fatherId) { out.set(p.fatherId, Math.min(out.get(p.fatherId) || Infinity, nextDepth)); queue.push({ id: p.fatherId, depth: nextDepth }); }
      if (p.motherId) { out.set(p.motherId, Math.min(out.get(p.motherId) || Infinity, nextDepth)); queue.push({ id: p.motherId, depth: nextDepth }); }
    }
    return out; // Map<ancestorId, depth>
  }
  function shareAncestorWithin(a, b, maxDepth) {
    const A = ancestorsUpTo(a, maxDepth);
    const B = ancestorsUpTo(b, maxDepth);
    for (const id of A.keys()) if (B.has(id)) return true;
    return false;
  }
  // Interview resolver: BFS over family graph up to a person's knowledgeRadius; toggle bio edges by knowsAffairs
  function buildNeighbors(includeBio) {
    const adj = new Map();
    function link(u, v) {
      const a = adj.get(u) || new Set(); a.add(v); adj.set(u, a);
    }
    for (const p of result.people) {
      if (p.fatherId) { link(p.id, p.fatherId); link(p.fatherId, p.id); }
      if (p.motherId) { link(p.id, p.motherId); link(p.motherId, p.id); }
      if (p.spouseId) { link(p.id, p.spouseId); link(p.spouseId, p.id); }
      if (p.partnerId) { link(p.id, p.partnerId); link(p.partnerId, p.id); }
      if (includeBio && p.bioFatherId && p.bioFatherId !== p.fatherId) { link(p.id, p.bioFatherId); link(p.bioFatherId, p.id); }
      if (includeBio && p.bioMotherId && p.bioMotherId !== p.motherId) { link(p.id, p.bioMotherId); link(p.bioMotherId, p.id); }
    }
    return adj;
  }
  function knownSubgraphFrom(personId) {
    const person = personByIdPre.get(personId);
    const radius = Math.max(2, Math.min(5, person?.knowledgeRadius || 3));
    const adj = buildNeighbors(!!person?.knowsAffairs);
    const visited = new Set([personId]);
    const dist = new Map([[personId, 0]]);
    const q = [personId];
    while (q.length) {
      const u = q.shift();
      const du = dist.get(u) || 0;
      if (du >= radius) continue;
      const nbrs = adj.get(u) || new Set();
      for (const v of nbrs) {
        if (visited.has(v)) continue;
        visited.add(v);
        dist.set(v, du + 1);
        q.push(v);
      }
    }
    return { nodes: visited, dist };
  }
  // Choose killer candidate: adults by 1970
  const adultsBy1970 = result.people.filter(p => (1970 - year(p.birthDate)) >= 18);
  const killerFixed = adultsBy1970.length ? adultsBy1970[Math.floor(random() * adultsBy1970.length)] : result.people[Math.floor(random() * result.people.length)];
  let killerIdFixed = killerFixed.id;

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
  function consumerDNAProb(y) {
    if (y < 1990) return 0;
    if (y < 2007) return 0.00015;
    if (y < 2013) return 0.0007;
    if (y < 2020) return 0.0015;
    return 0.0025;
  }

  // Choose one murder year and assign once
  const murderYear = 1970 + Math.floor(random() * 31); // 1970..2000
  let murderCommitted = false;

  // DNA stores
  result.codis = { profiles: [] };
  result.consumerDNA = [];
  function isBannedRelative(candidate) {
    if (!candidate) return true;
    if (candidate.id === killerIdFixed) return true; // killer banned
    const killer = personByIdPre.get(killerIdFixed);
    if (!killer) return true;
    // direct ancestor/descendant within 2 generations
    const candAnc2 = ancestorsUpTo(candidate, 3);
    if (candAnc2.has(killerIdFixed)) return true; // candidate is child/grandchild
    const killerAnc2 = ancestorsUpTo(killer, 3);
    if (killerAnc2.has(candidate.id)) return true; // candidate is parent/grandparent
    // siblings/half-siblings share at least one parent
    if ((candidate.fatherId && candidate.fatherId === killer.fatherId) || (candidate.motherId && candidate.motherId === killer.motherId)) return true;
    // share ancestor within 2 generations on both sides => first cousins or closer
    if (shareAncestorWithin(candidate, killer, 3)) return true;
    return false;
  }
  function isSecondCousinOrFurther(candidate) {
    const killer = personByIdPre.get(killerIdFixed);
    if (!killer) return false;
    const A = ancestorsUpTo(candidate, 5);
    const B = ancestorsUpTo(killer, 5);
    let ok = false;
    for (const id of A.keys()) {
      const da = A.get(id) || 99;
      const db = B.get(id) || 99;
      if (da >= 3 && db >= 3) { ok = true; break; }
    }
    return ok;
  }

  let yearIndex = 0;
  for (let y = START_YEAR; y <= END_YEAR; y++, yearIndex++) {
    // announce year transition, then small delay to visualize progression
    logLine(`— Year ${y} —`);
    if (flashYearEl) flashYearEl.textContent = String(y);
    await delay(10);
    // Flavor timeline
    if (y === 1900) pushFlash('Preparing simulation…');
    if (y === 1914) pushFlash('World War I begins');
    if (y === 1917) pushFlash('World War I');
    if (y === 1918) pushFlash('Spanish Flu Pandemic');
    if (y === 1920) pushFlash('The Roaring Twenties');
    if (y === 1929) pushFlash('The Great Depression');
    if (y === 1933) pushFlash('The New Deal');
    if (y === 1941) pushFlash('World War II');
    if (y === 1942) pushFlash('The Manhattan Project');
    if (y === 1946) pushFlash('Baby Boom');
    if (y === 1947) pushFlash('The Cold War begins');
    if (y === 1950) pushFlash('Korean War');
    if (y === 1950) pushFlash('Red Scare');
    if (y === 1954) pushFlash('Brown v. Board of Education');
    if (y === 1957) pushFlash('Sputnik launches — Space Age');
    if (y === 1960) pushFlash('Camelot Era');
    if (y === 1963) pushFlash('JFK Assassination');
    if (y === 1964) pushFlash('Civil Rights Era');
    if (y === 1968) pushFlash('Vietnam War');
    if (y === 1967) pushFlash('Summer of Love');
    if (y === 1969) pushFlash('Flower Power');
    if (y === 1969) pushFlash('Moon Landing');
    if (y === 1970) pushFlash('EPA & environmental movement');
    if (y === 1972) pushFlash('Title IX');
    if (y === 1973) pushFlash('Oil Crisis');
    if (y === 1976) pushFlash('Bicentennial');
    if (y === 1977) pushFlash('Dawn of Personal Computing');
    if (y === 1977) pushFlash('Disco Fever');
    if (y === 1981) pushFlash('AIDS crisis begins');
    if (y === 1984) pushFlash('LA Olympics');
    if (y === 1986) pushFlash('Challenger disaster');
    if (y === 1989) pushFlash('End of Cold War');
    if (y === 1991) pushFlash('World Wide Web');
    if (y === 1993) pushFlash('NAFTA');
    if (y === 1995) pushFlash('Oklahoma City bombing');
    if (y === 1999) pushFlash('Dot-com boom');
    if (y === 2003) pushFlash('Iraq War');
    if (y === 2007) pushFlash('Smartphone era');
    if (y === 2010) pushFlash('Social media boom');
    if (y === 2012) pushFlash('Mars rover Curiosity');
    if (y === 2000) pushFlash('Y2K');
    if (y === 2001) pushFlash('9/11');
    if (y === 2008) pushFlash('Great Recession');
    if (y === 2016) pushFlash('Contentious election year');
    if (y === 2020) pushFlash('Global pandemic');
    if (y === 2021) pushFlash('Vaccine rollout');
    // Elections – winners as regular events
    const ELECTIONS = {
      1900: { name: 'William McKinley', party: 'Republican' },
      1904: { name: 'Theodore Roosevelt', party: 'Republican' },
      1908: { name: 'William Howard Taft', party: 'Republican' },
      1912: { name: 'Woodrow Wilson', party: 'Democratic' },
      1916: { name: 'Woodrow Wilson', party: 'Democratic' },
      1920: { name: 'Warren G. Harding', party: 'Republican' },
      1924: { name: 'Calvin Coolidge', party: 'Republican' },
      1928: { name: 'Herbert Hoover', party: 'Republican' },
      1932: { name: 'Franklin D. Roosevelt', party: 'Democratic' },
      1936: { name: 'Franklin D. Roosevelt', party: 'Democratic' },
      1940: { name: 'Franklin D. Roosevelt', party: 'Democratic' },
      1944: { name: 'Franklin D. Roosevelt', party: 'Democratic' },
      1948: { name: 'Harry S. Truman', party: 'Democratic' },
      1952: { name: 'Dwight D. Eisenhower', party: 'Republican' },
      1956: { name: 'Dwight D. Eisenhower', party: 'Republican' },
      1960: { name: 'John F. Kennedy', party: 'Democratic' },
      1964: { name: 'Lyndon B. Johnson', party: 'Democratic' },
      1968: { name: 'Richard Nixon', party: 'Republican' },
      1972: { name: 'Richard Nixon', party: 'Republican' },
      1976: { name: 'Jimmy Carter', party: 'Democratic' },
      1980: { name: 'Ronald Reagan', party: 'Republican' },
      1984: { name: 'Ronald Reagan', party: 'Republican' },
      1988: { name: 'George H. W. Bush', party: 'Republican' },
      1992: { name: 'Bill Clinton', party: 'Democratic' },
      1996: { name: 'Bill Clinton', party: 'Democratic' },
      2000: { name: 'George W. Bush', party: 'Republican' },
      2004: { name: 'George W. Bush', party: 'Republican' },
      2008: { name: 'Barack Obama', party: 'Democratic' },
      2012: { name: 'Barack Obama', party: 'Democratic' },
      2016: { name: 'Donald Trump', party: 'Republican' },
      2020: { name: 'Joe Biden', party: 'Democratic' }
    };
    if (ELECTIONS[y]) {
      const w = ELECTIONS[y];
      pushFlash(`${w.name} elected president.`);
      const evt = addEvent({ year: y, type: 'ELECTION', people: [], details: { winner: w.name, party: w.party } });
      indexEventByYear(evt);
    }
    const b = birthsByYear.get(y) || 0;
    const m = marriagesByYear.get(y) || 0;
    // Sample at least one demographic highlight per year
    if (b > 0 || m > 0) {
      if (random() < 0.6 && b > 0) {
        const yearEvts = eventsByYear.get(y) || [];
        const birthEvts = yearEvts.filter(e => e.type === 'BIRTH');
        const pickE = birthEvts[Math.floor(random() * birthEvts.length)];
        if (pickE) {
          const pid = pickE.people[0];
          const pp = personByIdPre.get(pid);
          const where = getCityName(pickE.details?.cityId || pp?.cityId);
          let note = '';
          if (pickE.details?.outOfWedlock) note = ' (out of wedlock)';
          else if (pickE.details?.fromAffair) note = ' (born from an affair)';
          if (pp) pushFlash(`${pp.firstName} ${pp.lastName} born in ${where}${note}.`);
        }
      } else if (m > 0) {
        const marriedThisYear = result.marriages.filter(mm => mm.year === y);
        const pickM = marriedThisYear[Math.floor(random() * marriedThisYear.length)];
        if (pickM) {
          const ha = personByIdPre.get(pickM.husbandId); const wa = personByIdPre.get(pickM.wifeId);
          const wifeMaiden = wa?.maidenName || wa?.lastName || '';
          pushFlash(`${wa?.firstName || 'Someone'} ${wifeMaiden} married ${ha?.firstName || 'someone'} ${ha?.lastName || ''}.`);
        }
      }
    } else if (random() < 0.2) {
      // fallback: occasional job change sample
      const sampled = result.events.findLast ? result.events.findLast(e => e.type === 'JOB_CHANGE' && e.year === y) :
        [...result.events].reverse().find(e => e.type === 'JOB_CHANGE' && e.year === y);
      if (sampled) {
        const p = personByIdPre.get(sampled.people[0]);
        if (p) pushFlash(`${p.firstName} ${p.lastName} started as ${sampled.details?.jobTitle || 'a new job'}.`);
      }
    }
    
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

  // Divorces (less likely without affairs; more likely after affairs)
  const marriedAdults = adults.filter(p => p.spouseId);
  const visited = new Set();
  for (const p of marriedAdults) {
    if (visited.has(p.id)) continue;
    const spouse = result.people.find(q => q.id === p.spouseId);
    if (!spouse) continue;
    visited.add(p.id);
    visited.add(spouse.id);
    let hadAffair = false;
    const ids = eventsByPerson.get(p.id) || [];
    for (let i = ids.length - 1; i >= 0; i--) {
      const e = result.events[ids[i] - 1];
      if (!e) continue;
      if (e.type === 'AFFAIR' && y - e.year <= 10) { hadAffair = true; break; }
      if (e.year < y - 10) break;
    }
    const spouseEvts = eventsByPerson.get(spouse.id) || [];
    for (let i = spouseEvts.length - 1; i >= 0; i--) {
      const e = result.events[spouseEvts[i] - 1];
      if (!e) continue;
      if (e.type === 'AFFAIR' && y - e.year <= 10) { hadAffair = true; break; }
      if (e.year < y - 10) break;
    }
    let divorceProb = PROB.divorce || 0.01;
    if (hadAffair) divorceProb = Math.min(0.5, divorceProb * 5);
    else divorceProb = Math.max(divorceProb * 0.5, 0.002);
    if (random() < divorceProb) {
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
        // Choose killer: prefer preselected, but ensure adult & alive at this year
        let killer = personByIdPre.get(killerIdFixed) || adultPool[Math.floor(random() * adultPool.length)];
        if ((y - year(killer.birthDate)) < 18 || !killer.alive) {
          killer = adultPool[Math.floor(random() * adultPool.length)];
          killerIdFixed = killer.id; // update stored killer if we had to swap
        }
        // Choose victim: not killer and not a banned close relative of killer
        let victimCandidates = adultPool.filter(p => p.id !== killer.id && !isBannedRelative(p));
        if (victimCandidates.length === 0) victimCandidates = adultPool.filter(p => p.id !== killer.id);
        let victim = victimCandidates[Math.floor(random() * victimCandidates.length)];
        victim.alive = false;
        const cityId = victim.cityId || killer.cityId || pickWeightedCityId();
        const evt = addEvent({ year: y, type: 'MURDER', people: [killer.id, victim.id], details: { cityId } });
        indexEventByYear(evt);
        murderCommitted = true;
        logLine(`Year ${y}: A murder occurred.`);
        pushFlash(`A murder shocks ${getCityName(cityId)}.`, 'murder');
      }
    }

    // DNA tests (consumer) after 1990; probability grows later
    if (y >= 1990) {
      const pTest = consumerDNAProb(y);
      for (const p of adults) {
        if (random() < pTest) {
          if (!isBannedRelative(p)) {
            result.consumerDNA.push({ personId: p.id, year: y });
            const evt = addEvent({ year: y, type: 'DNA_TEST_CONSUMER', people: [p.id], details: { cityId: p.cityId } });
            indexEventByYear(evt);
            if (random() < 0.02) pushFlash(`${personByIdPre.get(p.id)?.firstName || 'Someone'} took a consumer DNA test.`);
          }
        }
      }
    }

    // Occasional CODIS (law-enforcement) DNA profile creation, very rare
    if (y >= 1990) {
      const pLE = 0.00005;
      for (const p of adults) {
        if (random() < pLE) {
          result.codis.profiles.push({ personId: p.id, year: y });
          const evt = addEvent({ year: y, type: 'DNA_TEST_CODIS', people: [p.id], details: { cityId: p.cityId } });
          indexEventByYear(evt);
        }
      }
    }

    // Mortality: check all alive persons (adults and minors)
    for (const p of result.people) {
      if (!p.alive) continue;
      const age = y - year(p.birthDate);
      if (age < 0) continue;
      let hazard = mortalityHazard(age);
      // Increase hazard for combat-age men during war periods
      const war = warAt(y);
      if (p.sex === 'M' && age >= 18 && age <= 35 && war) {
        hazard = Math.min(1, hazard * 1.5 + 0.01);
      }
      if (hazard > 0 && random() < hazard) {
        p.alive = false;
        const cause = deathCauseFor(age, y, p.sex);
        p.disposition = burialDispositionFor(y);
        let plotId = null;
        if (p.disposition === 'buried') {
          plotId = assignBurialPlot(p);
        }
        // Generate an exact death date within the year; obits may appear next month if within last 5 days
        const month = 1 + Math.floor(random() * 12);
        const daysInMonth = new Date(Date.UTC(y, month, 0)).getUTCDate();
        const day = 1 + Math.floor(random() * daysInMonth);
        const date = isoFromYMD(y, month, day);
        const evt = addEvent({ year: y, type: 'DEATH', people: [p.id], details: { cityId: p.cityId, age, cause, disposition: p.disposition, plotId, date, month } });
        indexEventByYear(evt);
        if (Math.random() < 0.02) pushFlash(`${p.firstName} ${p.lastName} died in ${getCityName(p.cityId)} (${cause}).`);
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
  // Ensure at least one distant relative (>= second cousin) has a consumer DNA test for gameplay
  const killerForCheck = personByIdPre.get(killerIdFixed);
  let hasHit = false;
  for (const prof of result.consumerDNA) {
    const cand = personByIdPre.get(prof.personId);
    if (cand && isSecondCousinOrFurther(cand)) { hasHit = true; break; }
  }
  if (!hasHit) {
    // find a third-cousin-or-further; try depth >=4 first
    const candidates = result.people.filter(p => p.alive && p.id !== killerIdFixed && !isBannedRelative(p));
    let pickRel = candidates.find(p => {
      const A = ancestorsUpTo(p, 6); const B = ancestorsUpTo(killerForCheck, 6);
      for (const id of A.keys()) { const da = A.get(id)||99; const db = B.get(id)||99; if (da >= 4 && db >= 4) return true; }
      return false;
    }) || candidates.find(isSecondCousinOrFurther);
    if (pickRel) {
      result.consumerDNA.push({ personId: pickRel.id, year: Math.min(2015, END_YEAR) });
      const evt = addEvent({ year: Math.min(2015, END_YEAR), type: 'DNA_TEST_CONSUMER_FORCED', people: [pickRel.id], details: { cityId: pickRel.cityId } });
      indexEventByYear(evt);
      logLine(`Forced DNA test for a distant relative to ensure playability.`);
    }
  }
  result.killerId = killerIdFixed;

  // Knowledge guarantee: ensure at least one living person can know of the killer within their horizon
  const living = result.people.filter(p => p.alive);
  function personKnowsKiller(p) {
    const { nodes, dist } = knownSubgraphFrom(p.id);
    return nodes.has(killerIdFixed) && (dist.get(killerIdFixed) || 99) <= Math.max(2, Math.min(5, p.knowledgeRadius || 3));
  }
  let anyoneKnows = living.some(personKnowsKiller);
  if (!anyoneKnows) {
    // boost a plausible relative's horizon
    const candidates = living.filter(p => !isBannedRelative(p) && isSecondCousinOrFurther(p));
    const pick = candidates[0] || living[0];
    if (pick) {
      pick.knowledgeRadius = Math.max(4, pick.knowledgeRadius || 4);
      pick.knowsAffairs = true;
    }
  }
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
  // no-op: startBtn/runAgainBtn removed from UX

  // Build killer moniker and show title card
  const murderEvt = result.events.find(e => e.type === 'MURDER');
  const murderCityName = murderEvt ? getCityName(murderEvt.details?.cityId) : 'an American city';
  function killerMoniker(cityId, seedVal) {
    const region = getCityRegion(cityId);
    const cityName = getCityName(cityId) || '';
    const cityShort = cityName.split(',')[0] || cityName;
    const GEO = {
      NE: ['Harbor','River','Bay','Granite','Pine','Liberty','Colonial','Maritime'],
      MW: ['Great Lakes','Prairie','Rail','Steel','River','Grain','Twin Cities','Lake'],
      S:  ['Delta','Gulf','Bayou','Cotton','Lone Star','Magnolia','Peach','River'],
      W:  ['Golden Coast','Desert','Sierra','Pacific','Canyon','Mile High','Bay']
    };
    const NOUNS = ['Specter','Phantom','Prowler','Stalker','Butcher','Ripper','Hunter','Ghost','Shade','Marauder','Cipher'];
    const MODS = ['Shadow','Midnight','Cross','Trail','Whisper','Ridge','Raven','Copper','Fog','Dust'];
    const FORBIDDEN = [
      'Golden State Killer','Night Stalker','Boston Strangler','Zodiac Killer','Green River Killer',
      'BTK Killer','Hillside Strangler','Grim Sleeper','Son of Sam','Axeman'
    ];
    const geo = (GEO[region] || GEO.NE);
    const r1 = Math.abs((seedVal * 9301 + 49297) % 233280);
    const r2 = Math.abs((seedVal * 23333 + 12345) % 233280);
    const r3 = Math.abs((seedVal * 61169 + 7) % 233280);
    const r4 = Math.abs((seedVal * 727 + 19) % 233280);
    const g = geo[r1 % geo.length];
    const m = MODS[r2 % MODS.length];
    let n = NOUNS[r3 % NOUNS.length];
    // Build base name (sometimes insert modifier)
    let name = (r1 % 3 === 0) ? `${g} ${m} ${n}` : `${g} ${n}`;
    // Occasionally add a city suffix to further diversify
    if (r4 % 2 === 0 && cityShort) name = `${name} of ${cityShort}`;
    // Avoid known real-world monikers (case-insensitive)
    const lower = name.toLowerCase();
    const hitsForbidden = FORBIDDEN.some(f => lower.includes(f.toLowerCase()));
    if (hitsForbidden || /\bKiller\b/i.test(name)) {
      // Swap noun away from Killer-like terms and add extra modifier
      n = NOUNS[(r3 + 7) % NOUNS.length];
      name = `${g} ${m} ${n}` + (cityShort ? ` of ${cityShort}` : '');
    }
    return name;
  }
  const moniker = killerMoniker(murderEvt?.details?.cityId, seed);
  if (murderEvt) {
    result.killerMoniker = moniker;
    result.murderVictimId = murderEvt.people[1];
    result.playerCityId = murderEvt.details?.cityId || null;
    // Seed evidence in the crime city
    const cid = result.playerCityId;
    result.evidence[cid] = result.evidence[cid] || [];
    result.evidence[cid].push({ id: 'victim-clothes', name: "Victim's clothes", type: 'clothing', actions: ['dna'] });
  }
  overlaySim.classList.remove('visible');
  titleHeadlineEl.textContent = 'Case Brief';
  titleSubEl.textContent = `In ${murderEvt?.year || 'an unknown year'}, a dead body was found in ${murderCityName}. The police never had any strong leads, and the trail went cold. Can you solve the case of the ${moniker}?`;
  overlayTitle.classList.add('visible');
  titleContinueBtn.onclick = () => {
    overlayTitle.classList.remove('visible');
    if (typeof setActivePanel === 'function') setActivePanel('evidence');
    if (playerCityNameEl && result.playerCityId) playerCityNameEl.textContent = getCityName(result.playerCityId);
  };

  // Build quick lookup before any genealogy rendering
  const personById = new Map(result.people.map(p => [p.id, p]));

  // ----- Player Knowledge Model -----
  const STORAGE_KEY = 'ck:v1:knowledge';
  const emptyKnowledge = () => ({
    knownPeople: new Set(),
    // knownRelationships: explicit, user-known relationships only.
    // Each: { type: 'marriage'|'biological'|'guardian'|'siblings', a: id, b: id }
    knownRelationships: [],
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
      // migrate prior version 'edges' => 'knownRelationships'
      const rels = parsed.knownRelationships || parsed.edges || [];
      k.knownRelationships = Array.isArray(rels) ? rels : [];
      k.simSeed = parsed.simSeed || result.seed;
      return k;
    } catch {
      return emptyKnowledge();
    }
  }
  function saveKnowledge(k) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      knownPeople: Array.from(k.knownPeople),
      knownRelationships: k.knownRelationships,
      simSeed: result.seed
    }));
  }
  const knowledge = loadKnowledge();

  // Do not auto-seed knowledge; player reveals connections during play

  // ----- Genealogy Rendering (simple layered layout) -----
  function renderGenealogy() {
    // Build nodes from knownPeople
    const nodes = [];
    const edges = knowledge.knownRelationships.filter(e => knowledge.knownPeople.has(e.a) && knowledge.knownPeople.has(e.b));
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

  // Add connection to knowledge graph
  function addConnection(aId, bId, kind) {
    knowledge.knownPeople.add(aId);
    knowledge.knownPeople.add(bId);
    const type = kind === 'genetic' ? 'biological' : 'marriage';
    // Avoid duplicates
    if (!knowledge.knownRelationships.some(r => r.type === type && ((r.a === aId && r.b === bId) || (r.a === bId && r.b === aId)))) {
      // For genetic, ensure parent-child if applicable; otherwise generic biological
      const a = personById.get(aId);
      const b = personById.get(bId);
      let rel = type;
      if (type === 'biological' && a && b) {
        if (a.fatherId === b.id || a.motherId === b.id) rel = 'biological';
        else if (b.fatherId === a.id || b.motherId === a.id) rel = 'biological';
      }
      knowledge.knownRelationships.push({ type: rel, a: aId, b: bId });
    }
    saveKnowledge(knowledge);
    renderGenealogy();
    setActivePanel('genealogy');
  }

  function doneBadge() {
    const s = document.createElement('span'); s.className='inline-done'; s.textContent='✓ added'; return s;
  }

  // ----- Map Rendering -----
  function projectLatLngToSvg(lat, lng, viewW, viewH) {
    // Tweak the bounding box to better match this specific SVG's coastline placement
    const minLat = 24, maxLat = 50;   // slightly expanded
    const minLng = -126, maxLng = -66; // slightly expanded west
    let x = ((lng - minLng) / (maxLng - minLng)) * viewW;
    let y = ((maxLat - lat) / (maxLat - minLat)) * viewH;
    // Gentle non-linear vertical compression for high latitudes (PNW looked too high)
    const t = (lat - minLat) / (maxLat - minLat);
    y = y * (0.9 + 0.1 * (1 - t));
    return [x, y];
  }
  function renderMap() {
    if (!mapSvg) return;
    while (mapSvg.firstChild) mapSvg.removeChild(mapSvg.firstChild);
    // Base map SVG
    fetch('/assets/united-states-map-usa-america-svgrepo-com.svg')
      .then(r => r.text())
      .then(svgStr => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgStr, 'image/svg+xml');
        const imported = document.importNode(doc.documentElement, true);
        imported.setAttribute('width', '1000');
        imported.setAttribute('height', '600');
        imported.setAttribute('x', '0');
        imported.setAttribute('y', '0');
        mapSvg.appendChild(imported);

        // City markers
        if (locText && result.playerCityId) {
          locText.textContent = `Location: ${getCityName(result.playerCityId)}`;
        }
        for (const c of CITIES) {
          const [lat, lng] = getCityLatLng(c.id);
          const [mx, my] = projectLatLngToSvg(lat, lng, 1000, 600);
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('class', 'map-marker');
          const dy = c.offsetY || 0;
          const dx = c.offsetX || 0;
          g.setAttribute('transform', `translate(${mx + dx}, ${my + dy})`);

          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('class', 'map-emoji');
          t.setAttribute('text-anchor', 'middle');
          t.textContent = '📍';
          g.appendChild(t);

          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('class', 'map-label');
          label.setAttribute('text-anchor', 'middle');
          label.setAttribute('y', '18');
          label.textContent = c.name;
          g.appendChild(label);

          g.addEventListener('click', () => {
            const originId = result.playerCityId || c.id;
            const origin = getCityName(originId);
            const dest = c.name;
            if (originId === c.id) return; // already here
            const ok = window.confirm(`Fly from ${origin} to ${dest}?`);
            if (!ok) return;
            // Animate plane
            const [olat, olng] = getCityLatLng(originId);
            const [ox, oy] = projectLatLngToSvg(olat, olng, 1000, 600);
            const plane = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            plane.setAttribute('text-anchor', 'middle');
            plane.setAttribute('class', 'map-emoji');
            plane.textContent = '✈️';
            mapSvg.appendChild(plane);
            const [dxp, dyp] = [mx + dx, my + dy];
            const start = performance.now();
            const duration = 1200;
            function tick(now) {
              const t = Math.min(1, (now - start) / duration);
              // ease
              const e = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
              const x = ox + (dxp - ox) * e;
              const y = oy + (dyp - oy) * e;
              plane.setAttribute('x', String(x));
              plane.setAttribute('y', String(y));
              if (t < 1) requestAnimationFrame(tick);
              else {
                plane.remove();
                // Arrive
                result.playerCityId = c.id;
                if (playerCityNameEl) playerCityNameEl.textContent = c.name;
                if (locText) locText.textContent = `Location: ${c.name}`;
                // Go to main panel
                if (typeof setActivePanel === 'function') {
                  setActivePanel('evidence');
                }
              }
            }
            requestAnimationFrame(tick);
          });

          mapSvg.appendChild(g);
        }

        // click marker -> update Location text
      })
      .catch(() => {
        // Fallback: draw just city points if SVG fails
        for (const c of CITIES) {
          const [lat, lng] = getCityLatLng(c.id);
          const [mx, my] = projectLatLngToSvg(lat, lng, 1000, 600);
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('class', 'map-marker');
          const dy = c.offsetY || 0;
          const dx = c.offsetX || 0;
          g.setAttribute('transform', `translate(${mx + dx}, ${my + dy})`);
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('class', 'map-emoji');
          t.setAttribute('text-anchor', 'middle');
          t.textContent = '📍';
          g.appendChild(t);
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('class', 'map-label');
          label.setAttribute('text-anchor', 'middle');
          label.setAttribute('y', '18');
          label.textContent = c.name;
          g.appendChild(label);
          g.addEventListener('click', () => {
            locText.textContent = `Location: ${c.name}`;
          });
          mapSvg.appendChild(g);
        }
      });
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
        knowledge.knownRelationships.push({ type: 'marriage', a: p.id, b: p.spouseId });
      }
      if (p.fatherId && knowledge.knownPeople.has(p.fatherId)) {
        knowledge.knownRelationships.push({ type: 'biological', a: p.fatherId, b: p.id });
      }
      if (p.motherId && knowledge.knownPeople.has(p.motherId)) {
        knowledge.knownRelationships.push({ type: 'biological', a: p.motherId, b: p.id });
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
    knowledge.knownRelationships.push({ type: pickRel.type, a: pickRel.a, b: pickRel.b });
    saveKnowledge(knowledge);
    renderGenealogy();
  }

  // Removed manual add/reveal/clear controls; Connections reflects discovered knowledge only

  renderGenealogy();
  renderMap();

  // Tabs
  const tabButtons = [];
  function setActiveTab(name) {
    // legacy no-op; kept for compatibility
    const panels = ['map','genealogy','people','records','log'];
    panels.forEach(p => {
      const el = document.getElementById(`tab-${p}`);
      if (el) el.classList.toggle('hidden', p !== name);
    });
  }

  // Sidebar menu navigation
  function setActivePanel(name) {
    menuButtons.forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    const names = ['evidence','records','graveyard','codis','airport','genealogy','log','interview','news'];
    names.forEach(n => panelByName(n)?.classList.toggle('hidden', n !== name));
    if (name === 'evidence') renderEvidence();
    if (name === 'codis') renderCODIS();
  }
  menuButtons.forEach(btn => btn.addEventListener('click', () => setActivePanel(btn.dataset.panel)));
  menuToggleBtn?.addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('open');
  });
  // Initialize player city to murder city if available
  if (result.playerCityId && playerCityNameEl) {
    playerCityNameEl.textContent = getCityName(result.playerCityId);
  }
  setActivePanel('evidence');

  // Evidence locker rendering & actions
  function renderEvidence() {
    const cityId = result.playerCityId;
    playerCityNameEl.textContent = getCityName(cityId);
    const list = document.getElementById('evList');
    const actions = document.getElementById('evActions');
    list.innerHTML = '';
    actions.innerHTML = '';
    evStatus.textContent = '';
    const items = result.evidence[cityId] || [];
    if (!items.length) { list.textContent = 'No evidence in this city.'; return; }
    items.forEach((it) => {
      const btn = document.createElement('button');
      btn.className = 'menu-btn';
      btn.textContent = it.name;
      btn.addEventListener('click', () => {
        // show actions
        actions.innerHTML = '';
        if (it.actions?.includes('dna')) {
          const a = document.createElement('button'); a.className = 'start secondary'; a.textContent = 'Send for DNA testing';
          a.addEventListener('click', () => {
            const victimId = result.murderVictimId;
            const killerId = result.killerId;
            let added = 0;
            const alreadyKMoniker = result.codis.profiles.some(pr => pr.moniker && pr.moniker === (result.killerMoniker || ''));
            const alreadyV = result.codis.profiles.some(pr => pr.personId === victimId);
            // Add moniker as standalone profile sharing the killer's DNA id
            if (killerId && !alreadyKMoniker) {
              result.codis.profiles.push({ personId: null, year: (murderEvt?.year || 2000), moniker: result.killerMoniker || null, dnaId: `killer-${killerId}` });
              added++;
            }
            if (victimId && !alreadyV) { result.codis.profiles.push({ personId: victimId, year: (murderEvt?.year || 2000), dnaId: `person-${victimId}` }); added++; }
            if (added) {
              a.textContent = 'Victim and Killer DNA profiles added to CODIS.';
              a.disabled = true;
              evStatus.textContent = '';
            } else {
              evStatus.textContent = 'No evidence available.';
            }
          });
          actions.appendChild(a);
        }
      });
      list.appendChild(btn);
    });
  }

  // Records search
  function inRange(lastName, range) {
    if (!lastName) return false;
    const c = lastName[0].toUpperCase();
    const [a,b] = range.split('-');
    const start = a.trim()[0]; const end = b.trim()[0];
    return c >= start && c <= end;
  }
  function renderRecords() {
    const type = recTypeEl.value;
    const range = recRangeEl.value;
    const yFilter = Number(recYearEl.value || 0);
    const cityId = result.playerCityId;
    const lines = [];
    if (type === 'birth') {
      for (const p of result.people) {
        const yb = year(p.birthDate);
        if (p.cityId !== cityId) continue;
        if (yFilter && yb !== yFilter) continue;
        if (!inRange(p.lastName, range)) continue;
        const father = p.fatherId ? personByIdPre.get(p.fatherId) : null;
        const mother = p.motherId ? personByIdPre.get(p.motherId) : null;
        const parentText = `Parents: ${mother ? mother.firstName + ' ' + mother.lastName : 'Unknown'}${father ? ' & ' + father.firstName + ' ' + father.lastName : ''}`;
        // find birth event for exact date
        const be = result.events.find(ev => ev.type==='BIRTH' && ev.people[0]===p.id);
        const dt = be?.details?.date ? ` on ${be.details.date}` : '';
        lines.push(`${p.lastName}, ${p.firstName} – b. ${yb}${dt} – ${getCityName(p.cityId)} — ${parentText}`);
      }
    } else if (type === 'death') {
      for (const e of result.events) {
        if (e.type !== 'DEATH') continue;
        if (e.details?.cityId !== cityId) continue;
        if (yFilter && e.year !== yFilter) continue;
        const pid = e.people[0]; const p = personByIdPre.get(pid);
        if (!p) continue;
        if (!inRange(p.lastName, range)) continue;
        const disp = e.details?.disposition || 'unknown';
        let post = ` (${e.details?.cause || 'cause unknown'}) – ${disp}`;
        if (disp === 'buried') {
          const plot = e.details?.plotId || buriedPlotOf(pid);
          post += plot != null ? ` – Plot ${plot} (${getCityName(e.details?.cityId)})` : '';
        }
        const dt = e.details?.date ? ` on ${e.details.date}` : '';
        lines.push(`${p.lastName}, ${p.firstName} – d. ${e.year}${dt} – ${getCityName(e.details?.cityId)}${post}`);
      }
    } else if (type === 'marriage') {
      for (const m of result.marriages) {
        if (yFilter && m.year !== yFilter) continue;
        // Find the MARRIAGE event to get city (stored when marriage added)
        const marriageEvt = result.events.find(ev => ev.type === 'MARRIAGE' && ev.details?.marriageId === m.id);
        const mCityId = marriageEvt?.details?.cityId || null;
        if (mCityId !== cityId) continue;
        const h = personByIdPre.get(m.husbandId); const w = personByIdPre.get(m.wifeId);
        const sortKey = (h?.lastName || '');
        if (!inRange(sortKey, range)) continue;
        const dt = marriageEvt?.details?.date ? ` on ${marriageEvt.details.date}` : '';
        lines.push(`${h?.lastName || ''}, ${h?.firstName || ''} & ${w?.firstName || ''} ${w?.lastName || ''} – ${m.year}${dt}  [💍 Add connection]`);
      }
    } else if (type === 'divorce') {
      for (const e of result.events) {
        if (e.type !== 'DIVORCE') continue;
        if (e.details?.cityId !== cityId) continue;
        if (yFilter && e.year !== yFilter) continue;
        const [aId,bId] = e.people;
        const a = personByIdPre.get(aId); const b = personByIdPre.get(bId);
        const sortKey = (a?.lastName || '');
        if (!inRange(sortKey, range)) continue;
        lines.push(`${a?.lastName || ''}, ${a?.firstName || ''} & ${b?.firstName || ''} ${b?.lastName || ''} – divorced in ${e.year}`);
      }
    }
    lines.sort((a,b) => a.localeCompare(b));
    recResultsEl.textContent = lines.join('\n');
  }
  recSearchBtn?.addEventListener('click', renderRecords);

  // Graveyard lookup
  gyLookupBtn?.addEventListener('click', () => {
    const cityId = result.playerCityId || result.murderVictimId?.cityId;
    const plot = Number(gyPlotEl.value || 0);
    const gy = result.graveyards[cityId];
    if (!gy || !plot || !gy.plots[plot]) { gyResultsEl.textContent = 'No records for that plot.'; return; }
    const names = gy.plots[plot].map(id => {
      const p = personByIdPre.get(id); return p ? `${p.firstName} ${p.lastName}` : `Person #${id}`;
    });
    gyResultsEl.textContent = `Plot ${plot}:\n` + names.join('\n');
  });

  // CODIS rendering
  function renderCODIS() {
    codisListEl.innerHTML = '';
    codisListEl.classList.add('codis-list');
    result.codis.profiles.forEach((pr, idx) => {
      const p = personByIdPre.get(pr.personId);
      // Prefer moniker if present (e.g., killer). Do NOT show real name in that case.
      const label = pr.moniker ? pr.moniker : (p ? `${p.firstName} ${p.lastName}` : `Profile #${idx+1}`);
      const row = document.createElement('div');
      row.className = 'row';
      row.textContent = `${label} – added ${pr.year || ''}`;
      if (pr.moniker) row.classList.add('killer');
      row.addEventListener('click', () => showCodisDropdown(row, pr.personId));
      codisListEl.appendChild(row);
    });
  }

  function showCodisDropdown(container, personId) {
    // Clear any existing dropdowns
    Array.from(codisListEl.querySelectorAll('.codis-dropdown')).forEach(el => el.remove());
    const dd = document.createElement('div');
    dd.className = 'codis-dropdown';
    const btn = document.createElement('button');
    btn.className = 'start secondary';
    btn.textContent = 'Find relatives';
    const status = document.createElement('div');
    status.className = 'codis-status';
    dd.appendChild(btn);
    dd.appendChild(status);
    container.appendChild(dd);
    btn.addEventListener('click', () => {
      status.textContent = 'Searching for matches…';
      btn.disabled = true;
      setTimeout(() => {
        renderCODISMatches(personId);
      }, 2000);
    });
  }

  function renderCODISMatches(personId) {
    // If personId is null (moniker), match by DNA id against the killer
    let base = personByIdPre.get(personId || -1);
    if (!base) {
      // try resolve via DNA id if moniker profile
      const mon = result.codis.profiles.find(pr => pr.personId === null && pr.moniker);
      if (mon && mon.dnaId && mon.dnaId.startsWith('killer-')) {
        const kid = Number(mon.dnaId.slice('killer-'.length));
        base = personByIdPre.get(kid);
      }
    }
    if (!base) { codisListEl.textContent = 'Profile not linked to a person yet.'; return; }
    const adj = new Map();
    function link(u, v) { const a = adj.get(u) || new Set(); a.add(v); adj.set(u, a); }
    for (const p of result.people) {
      if (p.fatherId) { link(p.id, p.fatherId); link(p.fatherId, p.id); }
      if (p.motherId) { link(p.id, p.motherId); link(p.motherId, p.id); }
      // Note: do NOT link spouse/partner for genetic matches
    }
    const startId = base.id;
    const dist = new Map([[startId,0]]);
    const q = [startId];
    while (q.length) {
      const u = q.shift();
      const du = dist.get(u) || 0;
      if (du > 6) continue;
      const nbrs = adj.get(u) || new Set();
      for (const v of nbrs) {
        if (dist.has(v)) continue;
        dist.set(v, du + 1);
        q.push(v);
      }
    }
    function shareParent(a, b) {
      return (a.fatherId && a.fatherId === b.fatherId) || (a.motherId && a.motherId === b.motherId);
    }
    function isParentOf(a, b) { return b.fatherId === a.id || b.motherId === a.id; }
    function isChildOf(a, b) { return a.fatherId === b.id || a.motherId === b.id; }
    function isGrandparentOf(a, b) {
      const f = personByIdPre.get(b.fatherId || -1);
      const m = personByIdPre.get(b.motherId || -1);
      return (f && (f.fatherId === a.id || f.motherId === a.id)) || (m && (m.fatherId === a.id || m.motherId === a.id));
    }
    function isGrandchildOf(a, b) { return isGrandparentOf(b, a); }
    function shareGrandparent(a, b) {
      const aGP = new Set();
      const af = personByIdPre.get(a.fatherId || -1); const am = personByIdPre.get(a.motherId || -1);
      if (af) { if (af.fatherId) aGP.add(af.fatherId); if (af.motherId) aGP.add(af.motherId); }
      if (am) { if (am.fatherId) aGP.add(am.fatherId); if (am.motherId) aGP.add(am.motherId); }
      const bf = personByIdPre.get(b.fatherId || -1); const bm = personByIdPre.get(b.motherId || -1);
      const bGP = new Set();
      if (bf) { if (bf.fatherId) bGP.add(bf.fatherId); if (bf.motherId) bGP.add(bf.motherId); }
      if (bm) { if (bm.fatherId) bGP.add(bm.fatherId); if (bm.motherId) bGP.add(bm.motherId); }
      for (const id of aGP) if (bGP.has(id)) return true;
      return false;
    }

    // Limit matches to people who have profiles in CODIS
    const codisIds = new Set(result.codis.profiles.map(pr => pr.personId).filter(Boolean));
    const rows = [];
    for (const [pid, d] of dist.entries()) {
      if (pid === personId) continue;
      const p = personByIdPre.get(pid);
      if (!p) continue;
      if (!codisIds.has(pid)) continue;
      let rel = 'distant relative'; let pct = '~0.8%';
      let firstDegree = false;
      if (isParentOf(p, base)) { rel = 'parent'; pct = '50%'; firstDegree = true; }
      else if (isChildOf(p, base)) { rel = 'child'; pct = '50%'; firstDegree = true; }
      else if (shareParent(base, p)) { rel = 'sibling'; pct = '25–50%'; }
      else if (isGrandparentOf(p, base)) { rel = 'grandparent'; pct = '25%'; }
      else if (isGrandchildOf(p, base)) { rel = 'grandchild'; pct = '25%'; }
      else if (shareGrandparent(base, p)) { rel = 'first cousin'; pct = '12.5%'; }

      const line = document.createElement('div');
      const txt = document.createElement('span');
      txt.textContent = `${p.firstName} ${p.lastName} – ${pct} – likely ${rel}`;
      line.appendChild(txt);
      // First-degree genetic only: parent/child
      if (firstDegree) {
        const already = knowledge.knownRelationships.some(r => r.type==='biological' && ((r.a===personId&&r.b===pid)||(r.a===pid&&r.b===personId)));
        if (!already) {
          const addGen = document.createElement('button'); addGen.className = 'inline-link'; addGen.textContent = '🧬 add';
          addGen.title = 'Add genetic connection to Connections';
          addGen.addEventListener('click', () => { addConnection(personId, pid, 'genetic'); addGen.replaceWith(doneBadge()); });
          line.appendChild(addGen);
        } else {
          const done = doneBadge(); line.appendChild(done);
        }
      }
      rows.push(line);
    }
    const back = document.createElement('button'); back.className='start secondary'; back.textContent='Back';
    back.addEventListener('click', renderCODIS);
    codisListEl.innerHTML='';
    codisListEl.appendChild(back);
    const box = document.createElement('div'); box.className='detail'; box.style.marginTop='8px';
    rows.forEach(node => box.appendChild(node));
    codisListEl.appendChild(box);
  }
  codisRefreshBtn?.addEventListener('click', renderCODIS);

  // Newspaper archive - Obituaries
  function renderNewsYear() {
    const y = Number(newsYearEl.value || 0);
    const cityId = result.playerCityId;
    newsResultsEl.innerHTML = '';
    // Newspaper masthead and lead story
    const fullName = getCityName(cityId) || 'City, ST';
    const cityName = fullName.split(',')[0];
    const papers = ['Times','Tribune','Herald','Post','Gazette','Courier','Sun','Star'];
    const pick = papers[Math.floor((result.seed + cityId + y) % papers.length)];
    const mast = document.createElement('div'); mast.className = 'masthead'; mast.textContent = `${cityName} ${pick}`;
    const paper = document.createElement('div'); paper.className = 'newspaper';
    paper.appendChild(mast);
    const global = getGlobalNewsStory(y);
    if (global) {
      const h = document.createElement('div'); h.className = 'headline'; h.textContent = global.title; paper.appendChild(h);
      const b = document.createElement('div'); b.className = 'lede'; b.textContent = global.body; paper.appendChild(b);
    }
    newsResultsEl.appendChild(paper);
    // Birth announcements
    const birthsHeader = document.createElement('div'); birthsHeader.className='section-cap'; birthsHeader.textContent = 'Birth Announcements'; paper.appendChild(birthsHeader);
    for (const ev of result.events) {
      if (ev.type !== 'BIRTH') continue;
      if (ev.year !== y) continue;
      if (ev.details?.cityId !== cityId) continue;
      const pid = ev.people[0]; const p = personByIdPre.get(pid); if (!p) continue;
      const mom = p.motherId ? personByIdPre.get(p.motherId) : null;
      const dad = p.fatherId ? personByIdPre.get(p.fatherId) : null;
      const line = document.createElement('div'); line.className='story-line';
      const span = document.createElement('span');
      span.textContent = `${p.firstName} ${p.lastName}, born ${ev.details?.date || y}, to ${mom ? mom.firstName + ' ' + mom.lastName : 'Unknown'}${dad ? ' and ' + dad.firstName + ' ' + dad.lastName : ''}.`;
      line.appendChild(span);
      // Inline familial add buttons for first-degree knowledge
      if (mom) {
        const exists = knowledge.knownRelationships.some(r => r.type==='biological' && ((r.a===p.id&&r.b===mom.id)||(r.a===mom.id&&r.b===p.id)));
        if (!exists) { const b=document.createElement('button'); b.className='inline-link'; b.textContent='💍 add'; b.title='Add familial connection'; b.addEventListener('click',()=>{addConnection(p.id,mom.id,'familial'); b.replaceWith(doneBadge());}); line.appendChild(b);} else { line.appendChild(doneBadge()); }
      }
      if (dad) {
        const exists = knowledge.knownRelationships.some(r => r.type==='biological' && ((r.a===p.id&&r.b===dad.id)||(r.a===dad.id&&r.b===p.id)));
        if (!exists) { const b=document.createElement('button'); b.className='inline-link'; b.textContent='💍 add'; b.title='Add familial connection'; b.addEventListener('click',()=>{addConnection(p.id,dad.id,'familial'); b.replaceWith(doneBadge());}); line.appendChild(b);} else { line.appendChild(doneBadge()); }
      }
      paper.appendChild(line);
    }
    // Marriage announcements
    const marrHeader = document.createElement('div'); marrHeader.className='section-cap'; marrHeader.textContent = 'Marriage Announcements'; paper.appendChild(marrHeader);
    for (const ev of result.events) {
      if (ev.type !== 'MARRIAGE') continue;
      if (ev.year !== y) continue;
      if (ev.details?.cityId !== cityId) continue;
      const [a,b] = ev.people; const h = personByIdPre.get(a); const w = personByIdPre.get(b);
      const line = document.createElement('div'); line.className='story-line';
      const span = document.createElement('span');
      span.textContent = `${h?.firstName || ''} ${h?.lastName || ''} and ${w?.firstName || ''} ${w?.lastName || ''} were married ${ev.details?.date || y}.`;
      line.appendChild(span);
      if (h && w) {
        const exists = knowledge.knownRelationships.some(r => r.type==='marriage' && ((r.a===h.id&&r.b===w.id)||(r.a===w.id&&r.b===h.id)));
        if (!exists) { const b=document.createElement('button'); b.className='inline-link'; b.textContent='💍 add'; b.title='Add marriage connection'; b.addEventListener('click',()=>{addConnection(h.id,w.id,'familial'); b.replaceWith(doneBadge());}); line.appendChild(b);} else { line.appendChild(doneBadge()); }
      }
      paper.appendChild(line);
    }
    // Obituaries
    const obitHeader = document.createElement('div'); obitHeader.className='section-cap'; obitHeader.textContent = 'Obituaries'; paper.appendChild(obitHeader);
    for (const e of result.events) {
      if (e.type !== 'DEATH') continue;
      if (e.details?.cityId !== cityId) continue;
      if (y && e.year !== y) continue;
      const pid = e.people[0];
      const p = personByIdPre.get(pid);
      if (!p) continue;
      // year-only; no month filter
      // Build survivors/predeceased list
      const relatives = [];
      const father = p.fatherId ? personByIdPre.get(p.fatherId) : null;
      const mother = p.motherId ? personByIdPre.get(p.motherId) : null;
      const spouse = p.spouseId ? personByIdPre.get(p.spouseId) : null;
      const children = result.people.filter(c => c.fatherId === p.id || c.motherId === p.id);
      const predeceased = [];
      const survivedBy = [];
      if (father) ((father.alive) ? survivedBy : predeceased).push(`father ${father.firstName} ${father.lastName}`);
      if (mother) ((mother.alive) ? survivedBy : predeceased).push(`mother ${mother.firstName} ${mother.lastName}`);
      if (spouse) ((spouse.alive) ? survivedBy : predeceased).push(`spouse ${spouse.firstName} ${spouse.lastName}`);
      for (const c of children) {
        ((c.alive) ? survivedBy : predeceased).push(`child ${c.firstName} ${c.lastName}`);
      }
      const life = `(${year(p.birthDate)}-${e.year})`;
      const pre = `We mourn the passing of ${p.firstName} ${p.lastName} ${life}.`;
      const header = `${p.firstName} ${p.lastName} – d. ${e.year}${e.details?.date ? ' on ' + e.details.date : ''} – ${getCityName(e.details?.cityId)}`;
      const parts = [pre, header];
      if (predeceased.length) parts.push(`Pre-deceased by: ${predeceased.join(', ')}`);
      if (survivedBy.length) parts.push(`Survived by: ${survivedBy.join(', ')}`);
      // Add first-degree connection buttons (ring) for parent/child and spouse
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.justifyContent = 'space-between';
      const text = document.createElement('span'); text.textContent = parts.join('\n'); container.appendChild(text);
      // Inline familial buttons
      if (father) { const ex=knowledge.knownRelationships.some(r=>r.type==='biological'&&((r.a===p.id&&r.b===father.id)||(r.a===father.id&&r.b===p.id))); if(!ex){const b=document.createElement('button'); b.className='inline-link'; b.textContent='💍 add'; b.title='Add familial connection'; b.addEventListener('click',()=>{addConnection(p.id,father.id,'familial'); b.replaceWith(doneBadge());}); container.appendChild(b);} else { container.appendChild(doneBadge()); } }
      if (mother) { const ex=knowledge.knownRelationships.some(r=>r.type==='biological'&&((r.a===p.id&&r.b===mother.id)||(r.a===mother.id&&r.b===p.id))); if(!ex){const b=document.createElement('button'); b.className='inline-link'; b.textContent='💍 add'; b.title='Add familial connection'; b.addEventListener('click',()=>{addConnection(p.id,mother.id,'familial'); b.replaceWith(doneBadge());}); container.appendChild(b);} else { container.appendChild(doneBadge()); } }
      if (spouse) { const ex=knowledge.knownRelationships.some(r=>r.type==='marriage'&&((r.a===p.id&&r.b===spouse.id)||(r.a===spouse.id&&r.b===p.id))); if(!ex){const b=document.createElement('button'); b.className='inline-link'; b.textContent='💍 add'; b.title='Add familial connection'; b.addEventListener('click',()=>{addConnection(p.id,spouse.id,'familial'); b.replaceWith(doneBadge());}); container.appendChild(b);} else { container.appendChild(doneBadge()); } }
      for (const c of children) { const ex=knowledge.knownRelationships.some(r=>r.type==='biological'&&((r.a===p.id&&r.b===c.id)||(r.a===c.id&&r.b===p.id))); if(!ex){const b=document.createElement('button'); b.className='inline-link'; b.textContent='💍 add'; b.title='Add familial connection'; b.addEventListener('click',()=>{addConnection(p.id,c.id,'familial'); b.replaceWith(doneBadge());}); container.appendChild(b);} else { container.appendChild(doneBadge()); } }
      paper.appendChild(container);
    }
    if (paper.childNodes.length <= 1 && !global) { const none=document.createElement('div'); none.textContent='No items for that year.'; paper.appendChild(none); }
  }
  newsSearchBtn?.addEventListener('click', () => { newsResultsEl.innerHTML=''; renderNewsYear(); });

  // -------- Residents typeahead & Interviews --------
  const residentSearchEl = document.getElementById('residentSearch');
  const residentListEl = document.getElementById('residentList');
  const intHeader = document.getElementById('intHeader');
  const intTranscript = document.getElementById('intTranscript');
  const intHello = document.getElementById('intHello');
  const intBack = document.getElementById('intBack');
  let interviewingPersonId = null;

  function renderResidentMatches(query) {
    if (!residentListEl) return;
    const cityId = result.playerCityId;
    const q = (query || '').trim().toUpperCase();
    const residents = result.people.filter(p => p.cityId === cityId && p.lastName);
    const filtered = q ? residents.filter(p => p.lastName.toUpperCase().startsWith(q)) : [];
    filtered.sort((a,b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
    residentListEl.innerHTML = '';
    const top = filtered.slice(0, 30);
    top.forEach(p => {
      const div = document.createElement('div');
      div.className = 'item';
      div.textContent = `${p.lastName}, ${p.firstName}`;
      div.addEventListener('click', () => openInterview(p.id));
      residentListEl.appendChild(div);
    });
  }

  function openInterview(personId) {
    interviewingPersonId = personId;
    const p = personByIdPre.get(personId);
    if (!p) return;
    const emoji = personEmojiFor(p);
    const greetings = [
      'Hi there.',
      'Good day.',
      'Hello.',
      'Hey.'
    ];
    const greet = greetings[Math.floor(Math.random()*greetings.length)];
    if (!result.conversations[personId]) result.conversations[personId] = [];
    intHeader.textContent = `${emoji} ${p.firstName} ${p.lastName}`;
    renderTranscript(personId);
    if (result.conversations[personId].length === 0) {
      // start with a greeting from NPC
      result.conversations[personId].push({ from: 'npc', text: greet, ts: Date.now() });
      renderTranscript(personId);
    }
    setActivePanel('interview');
  }

  function renderTranscript(personId) {
    const conv = result.conversations[personId] || [];
    intTranscript.innerHTML = '';
    conv.forEach(line => {
      const div = document.createElement('div');
      div.textContent = (line.from === 'you' ? 'You: ' : 'Them: ') + line.text;
      intTranscript.appendChild(div);
    });
    intTranscript.scrollTop = intTranscript.scrollHeight;
  }

  residentSearchEl?.addEventListener('input', (e) => renderResidentMatches(e.target.value));
  intHello?.addEventListener('click', () => {
    if (!interviewingPersonId) return;
    result.conversations[interviewingPersonId].push({ from: 'you', text: 'hello', ts: Date.now() });
    result.conversations[interviewingPersonId].push({ from: 'npc', text: 'Hello.', ts: Date.now() });
    renderTranscript(interviewingPersonId);
  });
  intBack?.addEventListener('click', () => {
    setActivePanel('evidence');
  });

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

  if (personSearchEl) {
    personSearchEl.addEventListener('input', (e) => {
      renderPersonResults(e.target.value || '');
    });
    renderPersonResults('');
  }
}

function startGame() {
  heroEl.classList.add('hidden');
  simEl.classList.remove('hidden');
  runSimulation();
}

startBtn.addEventListener('click', startGame);
if (toggleJsonBtn) toggleJsonBtn.addEventListener('click', () => {
  outputJsonEl.classList.toggle('hidden');
});

