// Global newspaper stories (one specific event per year), 1900–1930
// Each story is structured with a contemporary-style title and a first paragraph body
// Usage: import { getGlobalNewsStory } from './newsStories.js'; getGlobalNewsStory(1912)

export const GLOBAL_NEWS_STORIES = {
  1900: {
    title: 'Hurricane Lays Waste to Galveston; Thousands Dead Along Texas Coast',
    body: 'Galveston, Tex., Sept. 9—A monstrous storm from the Gulf drove ashore last night, sweeping away homes, wharves, and the very streets beneath a wall of water. Reports carried in by rail and telegraph, both badly broken, speak of fearful destruction and a death roll already in the thousands. Survivors, haggard and exhausted, work by lantern light to dig for kin and to salvage the remnants of their city.'
  },
  1901: {
    title: 'President McKinley Succumbs to Assassin’s Bullet; Roosevelt Takes Oath',
    body: 'Buffalo, N.Y., Sept. 14—President William McKinley died this morning from wounds sustained at the Pan-American Exposition, his strength failing despite the best attentions of his physicians. Vice President Theodore Roosevelt was sworn in at Buffalo, pledging continuity in the nation’s affairs. The country is plunged into mourning as bells toll from town to town.'
  },
  1902: {
    title: 'Coal Strike Settled; Miners Return to Pits After Roosevelt’s Intervention',
    body: 'Washington, Oct. 16—The long anthracite coal strike has ended in agreement, with miners to receive higher wages and shorter hours, and grievances to be heard by an impartial commission. President Roosevelt’s invitation to both sides broke the deadlock as winter neared. Trains are already moving to restore fuel to eastern cities fearful of the cold.'
  },
  1903: {
    title: 'Two Brothers Fly at Kitty Hawk; First Powered Aeroplane Takes to the Air',
    body: 'Kitty Hawk, N.C., Dec. 17—Messrs. Orville and Wilbur Wright of Dayton, Ohio, succeeded today in raising their motor-driven flying machine from the sands and carrying it forward under control. Witnesses report several short flights against a stiff wind. The feat, once thought a fanciful dream, may open the air to man’s commerce and curiosity.'
  },
  1904: {
    title: 'Baltimore in Ashes; Great Fire Rages for Thirty Hours Through Business District',
    body: 'Baltimore, Md., Feb. 8—Flames leapt warehouse to warehouse yesterday, driven by a restless wind, until whole blocks of the city’s trade lay smoldering ruins. Fire companies from nearby cities answered the call, their hose-couplings ill-suited to local hydrants. Smoked-stained crowds gathered at dawn to behold streets of brick shells and twisted iron.'
  },
  1905: {
    title: 'Peace at Portsmouth: Russia and Japan End War; Treaty Signed',
    body: 'Portsmouth, N.H., Sept. 5—Envoys of Russia and Japan today affixed their signatures to a treaty of peace, concluding the bloody conflict in the Far East. The conference, convened at the invitation of President Roosevelt, brings relief to all markets and nations unsettled by the fighting. Flags were hoisted and guns boomed in celebration along the harbor.'
  },
  1906: {
    title: 'San Francisco Shaken and Burned; City Stricken by Earthquake and Fire',
    body: 'San Francisco, Cal., April 18—A violent tremor before dawn flung citizens from their beds, toppled buildings, and rent the earth. Fires, unchecked by sundered mains, consumed block upon block, leaving tens of thousands homeless. Refugees gather in parks and on the waterfront as the Army and volunteers labor to feed and shelter the afflicted.'
  },
  1907: {
    title: 'Panic on Wall Street; Banks Strain as Depositors Demand Their Money',
    body: 'New York, Oct. 24—A sudden fright seized the money markets today, with depositors pressing counters and clerks counting out coin as fast as hands could move. Trust companies suffered the worst of it, their reserves tested as call loans piled up. By evening, financiers conferred behind closed doors to calm the tumult and steady the Exchange.'
  },
  1908: {
    title: 'Ford Unveils Model T: An Automobile for the Common Man',
    body: 'Detroit, Oct. 1—The Ford Motor Company today presented a new touring car, the Model T, built strong, simple, and priced so that a man of moderate means may own one. Mechanics boast of interchangeable parts and ease of repair. Dealers predict the motor-car will soon be seen not only in the city, but rattling along country lanes.'
  },
  1909: {
    title: 'Peary Wires from the Arctic: “Pole Reached”',
    body: 'New York, Sept. 7—Commander Robert E. Peary has cabled that he reached the North Pole in April, after a perilous dash over the ice. A rival claim by Dr. Frederick A. Cook has stirred controversy. Nevertheless, flags fly and schoolchildren cheer the daring of the explorers who pressed so far into the frozen silence.'
  },
  1910: {
    title: 'Halley’s Comet Returns; Crowds Throng Streets to Watch the Night Sky',
    body: 'New York, May 18—All eyes were skyward last evening as the famous comet blazed a pale arc above the rooftops. Telescopes and opera glasses alike were brought out, street-corner vendors hawking celestial maps. Despite whispered fears of a poisonous tail, the city slept soundly under a curious, star-lit canopy.'
  },
  1911: {
    title: 'Shirtwaist Factory Fire Kills Scores; Tragedy Spurs Calls for Safety',
    body: 'New York, March 25—A terrible fire raced through the upper floors of the Triangle Waist Company, trapping young seamstresses behind locked doors and flimsy exits. Firemen’s ladders fell short as desperate girls leapt to their deaths. The horror has aroused public indignation and set reformers to demand stricter safeguards in every factory.'
  },
  1912: {
    title: 'Titanic Strikes Iceberg and Sinks; Hundreds Lost on Maiden Voyage',
    body: 'At Sea, April 15—Wireless reports confirm the great White Star liner Titanic went down in the North Atlantic after a collision with ice. Rescue steamers have brought in shivering survivors; the list of missing lengthens by the hour. The calamity, striking a ship deemed “unsinkable,” has shocked port and parlor alike.'
  },
  1913: {
    title: 'President Signs Federal Reserve Act; New Banking System Established',
    body: 'Washington, Dec. 23—President Wilson today signed the Federal Reserve Act, creating a system of regional banks to furnish an elastic currency and steady credit in times of strain. The measure, long debated, aims to prevent panics of the sort that visited the country six years ago. Bankers and merchants await the details of its operation.'
  },
  1914: {
    title: 'Europe at War: Germany Invades Belgium; Britain Declares Hostilities',
    body: 'London, Aug. 5—The clash of empires has begun. German forces have crossed into Belgium, and Great Britain has answered with a declaration of war. Crowds gathered at newspaper offices for the latest bulletins, while train stations roared with mobilization. America watches from afar as the continent girds itself for a struggle of unknown length.'
  },
  1915: {
    title: 'Lusitania Torpedoed; Ocean Liner Sunk Off Irish Coast with Heavy Loss of Life',
    body: 'London, May 8—The Cunarder Lusitania was struck by a German submarine yesterday and went down within minutes. Among the drowned are many women, children, and several Americans. The deed has inflamed opinion in every quarter and may alter the course of the war and the sentiments of neutral nations.'
  },
  1916: {
    title: 'Somme Offensive Opens; Casualties Mount on the Western Front',
    body: 'Paris, July 2—Guns thundered for miles as British and French troops advanced along the River Somme against fortified German positions. Early dispatches speak of limited gains purchased dearly. Hospitals fill anew as the third summer of war brings with it another vast trial of men and material.'
  },
  1917: {
    title: 'United States Declares War on Germany; Wilson Cites “World Safe for Democracy”',
    body: 'Washington, April 6—Congress, at the President’s urging, has declared that a state of war exists with the Imperial German Government. Recruiting stations opened at once as bands struck up patriotic airs. Shipyards, mills, and farms alike prepare to supply an army bound overseas.'
  },
  1918: {
    title: 'Armistice Signed; War Ends at the Eleventh Hour of the Eleventh Day',
    body: 'Paris, Nov. 11—The guns have fallen silent from the Channel to the Swiss frontier. Armistice terms were accepted this morning, and jubilant crowds surged through the boulevards. Church bells pealed while soldiers, mud-stained and weary, embraced the news with a wonder that words scarcely capture.'
  },
  1919: {
    title: 'Treaty of Versailles Concludes Peace; New Map of Europe Drawn',
    body: 'Paris, June 28—Allied and German delegates today signed the Treaty of Versailles in the Hall of Mirrors, setting forth reparations and new frontiers. While peace is at last on paper, disputes remain over terms and their enforcement. Meanwhile, soldiers stream homeward to find their places once more in civil life.'
  },
  1920: {
    title: 'Women’s Suffrage Triumphs; 19th Amendment Ratified Across the Nation',
    body: 'Washington, Aug. 18—The long campaign for votes for women has succeeded, with Tennessee’s ratification securing the necessary states. Leaders of the movement hailed the victory as a vindication of American principle. Across the country, women prepare to cast ballots in national elections for the first time.'
  },
  1921: {
    title: 'Violence in Tulsa; Greenwood’s Negro District Laid Low by Mob',
    body: 'Tulsa, Okla., June 2—Following a clash downtown, white mobs surged into the Greenwood district, burning homes and businesses and shooting residents who fled. Troops restored an uneasy quiet by afternoon. The toll remains uncertain as hospitals and churches tend the wounded and dispossessed.'
  },
  1922: {
    title: 'Egypt Tomb Found Intact; Howard Carter Discovers King Tutankhamun’s Resting Place',
    body: 'Luxor, Nov. 26—After years of searching in the Valley of the Kings, the British archaeologist Howard Carter has broken the seal on a pharaoh’s tomb, its treasures seemingly undisturbed. The find has stirred scholars and the public alike with visions of ancient splendor. Work proceeds cautiously under close guard.'
  },
  1923: {
    title: 'President Harding Dies in San Francisco; Coolidge Sworn In',
    body: 'San Francisco, Aug. 3—President Warren G. Harding passed away last night after an illness while returning from a tour of the West. Vice President Calvin Coolidge took the oath at his father’s home in Vermont before dawn. The nation was startled by the sudden change at the helm, though official business continues without interruption.'
  },
  1924: {
    title: 'Congress Enacts Immigration Quotas; New Limits on Arrivals from Abroad',
    body: 'Washington, May 26—The President has signed a law imposing strict national-origin quotas upon immigrants. Supporters argued it will preserve American wages and institutions; opponents warn of hardship to families and lost talent. Steamship companies rush to advise would-be passengers of the new rules.'
  },
  1925: {
    title: 'Scopes Trial Opens in Dayton; Tennessee Law on Evolution Tested',
    body: 'Dayton, Tenn., July 10—Crowds and newspapermen have descended on this small town as a schoolteacher stands accused of teaching evolution contrary to state statute. Noted counsel have taken the case, promising a lively contest over science and scripture. Merchants do a brisk trade while the court weighs each argument.'
  },
  1926: {
    title: 'New U.S. Highway 66 Commissioned; Chicago to Santa Monica by Motor',
    body: 'Washington, Nov. 11—Federal authorities today designated United States Highway 66, to run from the Great Lakes to the Pacific. Motorists hailed the news as a boon to travel and trade. Road crews will set markers and fill gaps so that the route may soon be followed from end to end.'
  },
  1927: {
    title: 'Lindbergh Lands in Paris; First Solo Flight Across the Atlantic',
    body: 'Paris, May 21—Charles A. Lindbergh, a young air mail pilot, set his Spirit of St. Louis down at Le Bourget Field tonight after a lonely flight from New York. The field erupted with cheers as the aviator was borne on the shoulders of the crowd. Messages of congratulation pour in from every quarter.'
  },
  1928: {
    title: 'Hoover Wins Presidency in Landslide; Prosperity Touted to Continue',
    body: 'Washington, Nov. 7—Herbert Hoover, former Secretary of Commerce, was elected President by a wide margin, promising efficiency in government and continued plenty. Crowds thronged newspaper bulletin boards for returns late into the night. The President-elect thanked supporters and pledged service to all the people.'
  },
  1929: {
    title: 'Wall Street Collapses; Black Tuesday Sees Selling Avalanche',
    body: 'New York, Oct. 29—Prices broke violently on the Stock Exchange today as a torrent of selling overwhelmed buyers. Ticker tape fell hopelessly behind while brokers shouted themselves hoarse. Banks and big concerns moved to stem the tide, but the rout ran on into the afternoon as fortunes vanished in a trice.'
  },
  1930: {
    title: 'Smoot–Hawley Tariff Signed; Foreign Retaliation Feared',
    body: 'Washington, June 17—President Hoover has put his pen to the tariff bill, raising duties on a broad list of imported goods. Manufacturers praised the measure while farm and export interests warned of reprisal. Trading houses report anxious cables from abroad as partners weigh the new wall of rates.'
  },
  1931: {
    title: 'Empire State Building Opens; Nation’s Tallest Skyscraper Dedicated',
    body: 'New York, May 1—With the turn of a key and the blessing of dignitaries, the Empire State Building today threw open its doors, its steel spire piercing the clouds at 1,250 feet. Crowds craned upward from Fifth Avenue as elevators whisked visitors to lofty observatories, a triumph of modern engineering amid lean times.'
  },
  1932: {
    title: 'Bonus Army Routed in Capital; Troops Clear Veterans’ Encampments',
    body: 'Washington, July 28—U.S. Army troops with horse and bayonet advanced along Pennsylvania Avenue this evening, dispersing thousands of World War veterans who sought early payment of bonuses. Shacks were fired and the camps cleared as onlookers jeered and applauded by turns. The bitter scene closed a summer of petition and frustration.'
  },
  1933: {
    title: 'Banks Reopen After Holiday; Confidence Slowly Returns Under New Measures',
    body: 'Washington, March 13—Following a nationwide bank holiday proclaimed by President Roosevelt, sound institutions reopened their doors today under federal safeguard. Long lines formed not to withdraw but to redeposit. The new Administration promised swift action to steady credit and restore the nation’s commerce.'
  },
  1934: {
    title: 'Securities and Exchange Commission Formed; Wall Street to Face New Rules',
    body: 'Washington, June 6—Congress today established the Securities and Exchange Commission to police exchanges, require truthful prospectuses, and curb manipulations laid bare by the crash. Brokers pledged cooperation even as they thumbed through thick sheaves of forthcoming regulations.'
  },
  1935: {
    title: 'President Signs Social Security Act; Old-Age Pensions Provided',
    body: 'Washington, Aug. 14—With a flourish of many pens, President Roosevelt signed the Social Security Act, promising income to the aged and protection to workers against unemployment. Administrators cautioned that the vast scheme will require careful building before checks may be issued.'
  },
  1936: {
    title: 'Owens Triumphs in Berlin; American Sprinter Wins Before Nazi Hosts',
    body: 'Berlin, Aug. 9—Jesse Owens, fleet son of Ohio, sped to victory on the cinder track, capturing gold and the cheers of a world audience. His grace and ease confounded racial theories vaunted by the hosts, while wireless reports carried his name into every American home.'
  },
  1937: {
    title: 'Hindenburg Explodes at Lakehurst; Dozens Dead in Airship Catastrophe',
    body: 'Lakehurst, N.J., May 6—The German airship Hindenburg burst into flame and fell in a tangle of girders as it approached its mooring mast. Onlookers screamed and fled as the vast craft was consumed in seconds. Rescue crews pulled survivors from the wreck as dusk fell over the field.'
  },
  1938: {
    title: 'Radio “War” Alarms Thousands; Martian Invasion Broadcast Mistaken for Fact',
    body: 'New York, Oct. 31—A dramatic radio play purporting to report an invasion from Mars sent listeners into panic last night, telephones jangling in police stations and newsrooms. The Columbia network explained the program was a work of fiction. By morning, the city laughed nervously at its fright.'
  },
  1939: {
    title: 'Germany Invades Poland; Britain and France Declare War',
    body: 'London, Sept. 3—The Prime Minister announced that Britain is at war with Germany, following the invasion of Poland. Sirens wailed as Londoners practiced air-raid precautions and troops took posts. Europe is once more engulfed by the menace that many had prayed never to see again.'
  },
  1940: {
    title: 'Armada Rescues Army at Dunkirk; Little Ships Braved Channel Fire',
    body: 'London, June 4—The Admiralty reports that a great number of British soldiers have been brought off from Dunkirk by an improvised flotilla of naval craft and civilian boats. Though guns thundered from the French coast, the “little ships” plied again and again, sparing the nation a grievous loss.'
  },
  1941: {
    title: 'Japanese Attack Pearl Harbor; U.S. Naval Base Struck Without Warning',
    body: 'Honolulu, Dec. 7—Waves of enemy aircraft descended upon Pearl Harbor this morning, loosing bombs and torpedoes upon warships at anchor. Fires and smoke rose above the harbor as anti-aircraft guns barked. Casualties are heavy. The nation awaits word from Washington.'
  },
  1942: {
    title: 'Army Orders Evacuation of West Coast Japanese; Civilian Exclusion Begins',
    body: 'San Francisco, March 24—Under Army orders, persons of Japanese ancestry this week began moving from coastal areas to inland assembly centers. Notices posted on telephone poles set dates and baggage limits. Authorities state the measure is military necessity; families hastily sell possessions and lock their doors.'
  },
  1943: {
    title: 'Rioting Rocks Detroit; Federal Troops Restore Order After Deadly Clashes',
    body: 'Detroit, June 22—Two days of racial disturbance left scores dead and hundreds injured in the Motor City. Mayor Jeffries appealed for calm as the Army patrolled streets. The trouble flared on Belle Isle and spread, shattering windows and nerves in a city straining under wartime production.'
  },
  1944: {
    title: 'Allies Land in France; Great Armada Crosses Channel at Dawn',
    body: 'London, June 6—The long-awaited invasion has begun. Allied ships, planes, and men struck the Normandy coast in strength, establishing beachheads under heavy fire. Mr. Churchill told the Commons that the assault proceeds according to plan, while prayers were offered in churches throughout the Empire.'
  },
  1945: {
    title: 'War Ends; Japan Accepts Surrender Terms',
    body: 'Washington, Aug. 14—President Truman announced tonight that Japan has surrendered unconditionally. Whistles and bells erupted in every quarter as crowds poured into the streets to sing and embrace. The formal instruments will be signed in due course; for now, the guns are stilled.'
  },
  1946: {
    title: 'Churchill Warns of “Iron Curtain”; Western Powers Urged to Stand Firm',
    body: 'Fulton, Mo., March 5—Former British Prime Minister Winston Churchill declared today that an “iron curtain” has descended across the Continent, dividing free lands from those under Soviet sway. His words, delivered beside President Truman, drew keen attention in capitals around the world.'
  },
  1947: {
    title: 'Marshall Offers Plan to Rebuild Europe; Aid Proposed for War-Torn Lands',
    body: 'Cambridge, Mass., June 5—Secretary of State George C. Marshall proposed a broad program of American assistance to help Europe recover from the devastation of war. The measure, to be offered to all willing nations, aims to restore production and trade. Congress and the public will debate its scope.'
  },
  1948: {
    title: 'Airlift Sustains Berlin; Cargo Planes Beat Soviet Blockade',
    body: 'Berlin, Dec. 1—American and British aircraft continue to deliver coal, flour, and medicine into West Berlin, defying the Soviet blockade that began in June. Tempelhof and Gatow hum at all hours. Children wave as the “raisin bombers” dip their wings on approach.'
  },
  1949: {
    title: 'North Atlantic Treaty Signed; Western Alliance Formed',
    body: 'Washington, April 4—Representatives of twelve nations affixed their signatures to the North Atlantic Treaty today, pledging that an attack on one shall be considered an attack on all. The pact crowns months of negotiation and signals a new era of collective defense.'
  },
  1950: {
    title: 'War in Korea; North Invades South Across 38th Parallel',
    body: 'Tokyo, June 25—Reports from Seoul state that Northern forces crossed the 38th parallel at dawn, driving southward in force. The United Nations Security Council convened in emergency session. American units in the Far East were placed on alert as diplomats sought swift redress.'
  },
  1951: {
    title: 'Rosenbergs Sentenced to Death in Atom Secrets Case',
    body: 'New York, April 5—Julius and Ethel Rosenberg were today sentenced to die for conspiring to pass atomic information to a foreign power. The defendants protested their innocence as the court pronounced judgment. Appeals are expected in a case that has stirred strong feeling.'
  },
  1952: {
    title: 'United States Explodes Hydrogen Device; Pacific Test Blazes Sky',
    body: 'Eniwetok Atoll, Nov. 1—A tremendous flash marked the nation’s first full-scale experiment with thermonuclear power. Observers spoke of a sun born upon the lagoon. Officials offered scant detail, citing security, but termed the result a success in advancing defense.'
  },
  1953: {
    title: 'Korean Truce Signed; Guns Fall Silent Along the 38th Parallel',
    body: 'Panmunjom, July 27—Allied and Communist commanders today signed an armistice halting the bitter conflict in Korea. Prisoners will be exchanged and a demilitarized zone established. Troops of both sides stood down from battle stations as the cease-fire took hold.'
  },
  1954: {
    title: 'High Court Outlaws Segregation in Schools; “Separate” Held Unequal',
    body: 'Washington, May 17—The Supreme Court ruled unanimously that racial segregation in public schools violates the Constitution. The decision, long awaited, will require careful implementation by the states. Civil rights leaders hailed the ruling as a mighty step toward justice.'
  },
  1955: {
    title: 'Montgomery Negroes Boycott Buses After Arrest of Seamstress',
    body: 'Montgomery, Ala., Dec. 5—Colored citizens began a boycott of city buses today following the arrest of Mrs. Rosa Parks, a seamstress, for refusing to surrender her seat. Ministers organized carpools and mass meetings while officials vowed to enforce the ordinances. The dispute has drawn national attention.'
  },
  1956: {
    title: 'President Signs Interstate Highway Bill; Vast Road Network Approved',
    body: 'Washington, June 29—President Eisenhower today signed into law a measure authorizing a great system of interstate highways to span the nation. Engineers predict years of construction to follow. Motorists looked forward to swifter travel between city and countryside.'
  },
  1957: {
    title: 'Soviets Launch Sputnik; First Artificial Moon Circles Earth',
    body: 'Moscow, Oct. 5—Radio receivers picked up beeps tonight from a small sphere launched into orbit by the Soviet Union. The feat, unprecedented in the annals of science, astonished the world and spurred calls in Washington for renewed effort in education and research.'
  },
  1958: {
    title: 'National Aeronautics and Space Administration Begins Operations',
    body: 'Washington, Oct. 1—A new civilian agency, NASA, opened its doors today, consolidating space activities under one roof. Officials outlined plans for satellites and research vehicles. Schoolchildren clipped headlines to pin upon classroom maps of the heavens.'
  },
  1959: {
    title: 'Alaska Admitted as 49th State; Star Added to the Flag',
    body: 'Juneau, Jan. 3—With the stroke of a pen, Alaska entered the Union today as the forty-ninth state. Celebrations echoed from fishing towns to army posts as a new star was stitched into Old Glory. Officials predicted brisk development of the territory’s resources.'
  },
  1960: {
    title: 'Sit-Ins Spread from Greensboro; Students Press for Service at Lunch Counters',
    body: 'Greensboro, N.C., Feb. 4—College students resumed their quiet protests at a downtown lunch counter today, having been refused service earlier in the week. The movement has leapt to other Southern cities, with youths in coats and ties taking seats politely and waiting. Merchants and police watched the lines grow longer.'
  },
  1961: {
    title: 'Soviets Send Man into Orbit; Gagarin Circles the Earth',
    body: 'Moscow, April 12—The Soviet Union today announced that a cosmonaut, Yuri Gagarin, completed a full orbit of the globe in a sealed capsule before returning safely. Radio carried the news in triumphant tones as Western capitals digested the feat. American officials vowed to press their own space efforts with renewed vigor.'
  },
  1962: {
    title: 'Missiles in Cuba; President Orders Naval Quarantine',
    body: 'Washington, Oct. 22—President Kennedy addressed the nation this evening, revealing photographs of offensive missile sites under construction in Cuba and announcing a naval quarantine of the island. Warships are taking station as diplomats race to avert a confrontation that could shake the world.'
  },
  1963: {
    title: 'President Kennedy Shot Dead in Dallas; Nation Stunned',
    body: 'Dallas, Nov. 22—President John F. Kennedy was felled by gunfire as his motorcade passed through downtown streets this afternoon. Crowds that had cheered minutes earlier stood stricken. Lyndon B. Johnson took the oath aboard Air Force One as the country reeled from the news.'
  },
  1964: {
    title: 'Civil Rights Act Signed; Public Accommodations Opened to All',
    body: 'Washington, July 2—President Johnson signed into law the Civil Rights Act of 1964, barring discrimination in hotels, restaurants, theaters, and employment. Leaders hailed the measure as a landmark, while Southern opponents promised to resist. The Justice Department promised vigorous enforcement.'
  },
  1965: {
    title: 'Voting Rights Bill Becomes Law After Selma Marches',
    body: 'Washington, Aug. 6—With his pen, President Johnson enacted the Voting Rights Act, suspending literacy tests and sending federal examiners to register Negro citizens. The measure followed dramatic marches in Alabama that brought the franchise struggle to the nation’s conscience.'
  },
  1966: {
    title: 'Miranda Ruling Issued; High Court Sets Police Warning Standard',
    body: 'Washington, June 13—The Supreme Court held today that police must advise suspects of their right to remain silent and to counsel before questioning. The ruling, in the case of Ernesto Miranda, sparked immediate debate in precinct houses and prosecutors’ offices over its practical effects.'
  },
  1967: {
    title: 'Detroit Erupts; Troops Called as Riot Spreads Across City',
    body: 'Detroit, July 24—Gunfire crackled and flames danced along 12th Street as a police raid touched off one of the worst disturbances in memory. The Governor summoned the National Guard; curfews were declared. Firemen labored under sniper fire as families fled smoke-choked blocks.'
  },
  1968: {
    title: 'Dr. Martin Luther King Jr. Slain in Memphis; Cities on Edge',
    body: 'Memphis, April 4—The Reverend Dr. Martin Luther King Jr. was shot this evening on the balcony of a motel where he was staying to support striking sanitation workers. News of his death spread swiftly, prompting grief and unrest in several cities. Leaders appealed for calm as police stood watch.'
  },
  1969: {
    title: 'Man Walks on the Moon; Armstrong’s “Small Step” Seen Worldwide',
    body: 'Houston, July 20—In a scene relayed by television, astronaut Neil A. Armstrong set foot upon the lunar surface, speaking of a small step for a man and a giant leap for mankind. Michael Collins and Edwin “Buzz” Aldrin stood by as the world held its breath, then exhaled in wonder.'
  },
  1970: {
    title: 'Four Students Killed at Kent State as Guardsmen Fire on Crowd',
    body: 'Kent, Ohio, May 4—Gunshots rang out on the campus of Kent State University today, leaving four students dead and several wounded during a protest against the war in Southeast Asia. Photographs showed bodies on the green and a nation divided over the course of the conflict.'
  },
  1971: {
    title: 'Pentagon Papers Published; Court Refuses to Halt Printing',
    body: 'Washington, June 30—The Supreme Court denied a government bid to stop newspapers from printing a secret history of U.S. policy in Vietnam. The documents, published by The Times and The Post, revealed doubts long held by officials. Presses rolled again as the decision reached newsrooms.'
  },
  1972: {
    title: 'Burglars Arrested at DNC Office; Police Find Ties to Campaign',
    body: 'Washington, June 17—Five men were seized inside the Democratic National Committee’s headquarters at the Watergate complex in the early hours. Investigators found wiretapping equipment and sequential bills. The affair, dismissed by some as a “third-rate burglary,” drew curious stares from reporters.'
  },
  1973: {
    title: 'High Court Legalizes Abortion; Roe v. Wade Decided',
    body: 'Washington, Jan. 22—The Supreme Court held that the Constitution protects a woman’s decision to terminate a pregnancy, striking down many state laws. The ruling provoked immediate rejoicing and protest in equal measure. Legislatures began to study its implications before dusk.'
  },
  1974: {
    title: 'Nixon Resigns; Ford Sworn as President',
    body: 'Washington, Aug. 9—Richard M. Nixon departed the White House today and resigned the Presidency in the wake of Watergate disclosures. Gerald R. Ford took the oath of office, declaring “our long national nightmare is over.” Crowds gathered at the gates to watch the helicopter lift off.'
  },
  1975: {
    title: 'Saigon Falls; Last Americans Airlifted as North Vietnamese Enter City',
    body: 'Saigon, April 30—Helicopters clattered over rooftops as embassy staff and refugees crowded onto final flights. By afternoon, tanks rolled through the Presidential Palace gates and the war ended with the capital’s capture. Onlookers waved white cloths as the new flag was raised.'
  },
  1976: {
    title: 'Bicentennial Celebrated; Fireworks Light the Nation’s Skies',
    body: 'Philadelphia, July 4—Tall ships filled the Delaware as towns and cities across the country marked the 200th anniversary of independence. Bands played Sousa and families picnicked beneath bunting and flags. The day closed with rocket bursts crackling over rivers and domes.'
  },
  1977: {
    title: 'New York City Blackout Triggers Looting; Power Restored After 25 Hours',
    body: 'New York, July 14—A lightning strike plunged the city into darkness last night, halting subways and trapping residents in elevators. Fireworks of a different sort broke windows in several boroughs as looters roamed. By evening, lights winked on and applause rose from stoops.'
  },
  1978: {
    title: 'Camp David Accords Reached; Egypt and Israel Sign Framework for Peace',
    body: 'Washington, Sept. 17—After thirteen days of intense talks, President Carter brokered agreements between President Sadat and Prime Minister Begin. The accords outline steps toward peace and normalized relations. The three men emerged smiling on the White House lawn.'
  },
  1979: {
    title: 'Hostages Seized at U.S. Embassy in Tehran; Crisis Begins',
    body: 'Tehran, Nov. 4—Militants stormed the American Embassy today, taking dozens of hostages and demanding the return of the Shah. Crowds gathered outside the compound as the captives were paraded before cameras. Washington condemned the act and considered its next move.'
  },
  1980: {
    title: 'Reagan Wins Presidency; Calls for “Morning in America”',
    body: 'Los Angeles, Nov. 4—Former California Governor Ronald Reagan defeated President Carter in a decisive victory. Supporters cheered promises of lower taxes, stronger defense, and a restored economy. The President-elect pledged to unite the country after a hard season.'
  },
  1981: {
    title: 'Shots Fired at Reagan; President Wounded, Survives Surgery',
    body: 'Washington, March 30—Gunfire erupted outside the Washington Hilton, striking President Reagan and three others. Secret Service agents bundled the President into a limousine; surgeons later said his prognosis was good. The nation exhaled in relief as he joked from his bedside.'
  },
  1982: {
    title: 'Tylenol Deaths Prompt Nationwide Recall; Police Probe Tampering',
    body: 'Chicago, Oct. 1—Drugstores pulled Extra-Strength Tylenol from shelves after a series of poisonings left several dead in the Chicago area. Investigators urged the public to avoid the product while they traced the source. Pharmaceutical firms discussed new packaging safeguards.'
  },
  1983: {
    title: 'Sally Ride Becomes First American Woman in Space',
    body: 'Cape Canaveral, June 18—The shuttle Challenger roared aloft this morning with physicist Sally K. Ride aboard, the first American woman to travel into space. Schoolchildren cheered as live broadcasts showed the ascent and on-orbit maneuvers. The crew is scheduled to deploy satellites and conduct experiments.'
  },
  1984: {
    title: 'Apple Unveils Macintosh; Personal Computer Gets a Mouse and Menus',
    body: 'Cupertino, Jan. 24—Apple Computer introduced the Macintosh, a compact machine with a graphical screen and a hand-held “mouse.” Demonstrations drew gasps as windows opened and icons danced at a click. Competitors promised responses as the office of the future took clearer shape.'
  },
  1985: {
    title: 'Gorbachev Takes Soviet Helm; Talks of Reform and Renewal',
    body: 'Moscow, March 11—Mikhail S. Gorbachev assumed leadership of the Communist Party today, promising to invigorate a weary economy and reduce tensions abroad. Kremlin watchers noted his youth and ease on the rostrum. Western leaders cautiously welcomed his words.'
  },
  1986: {
    title: 'Shuttle Challenger Lost After Launch; Seven Astronauts Perish',
    body: 'Cape Canaveral, Jan. 28—Seventy-three seconds into flight, the space shuttle Challenger exploded in a plume of smoke, debris falling into the Atlantic. Schoolchildren watched in horror as teachers and engineers alike struggled to explain. Flags dipped as rescue craft sped to the scene.'
  },
  1987: {
    title: 'Stocks Plunge on Black Monday; Dow Suffers Record Drop',
    body: 'New York, Oct. 19—The Dow Jones Industrial Average fell more than 500 points in a single day, a historic collapse that rattled markets worldwide. Brokers spoke of program trades and panicked selling as phones rang off the hook. Central bankers moved to assure liquidity.'
  },
  1988: {
    title: 'Bomb Destroys Pan Am Jet over Lockerbie; Scores Killed',
    body: 'Lockerbie, Scotland, Dec. 21—Pan Am Flight 103 exploded over the Scottish town this evening, scattering wreckage and homes alike. Rescue crews worked under floodlights as officials spoke of an act of terror. Families gathered in airports on both sides of the Atlantic seeking news.'
  },
  1989: {
    title: 'Berlin Wall Opened; East Germans Flood West in Celebration',
    body: 'Berlin, Nov. 9—In an astonishing turn, checkpoints along the Berlin Wall opened to free passage tonight. Jubilant crowds climbed and chipped at the concrete barrier that had sundered the city for a generation. Leaders promised further steps toward unity in the days ahead.'
  },
  1990: {
    title: 'Iraq Invades Kuwait; U.N. Condemns Aggression',
    body: 'Riyadh, Aug. 2—Armored columns from Iraq crossed into Kuwait before dawn, seizing the capital and oil fields. The United Nations Security Council denounced the move and demanded withdrawal. Western and Arab governments conferred urgently over economic and military responses.'
  },
  1991: {
    title: 'Soviet Union Dissolves; Republics Declare Independence',
    body: 'Moscow, Dec. 25—The red flag was lowered over the Kremlin tonight as President Gorbachev resigned and the Soviet Union ceased to exist. Republic capitals proclaimed sovereignty as a new Commonwealth took shape. Crowds stood quietly in the snow, listening for the last time to familiar anthems.'
  },
  1992: {
    title: 'Los Angeles Erupts After Verdict; Guard Deployed to Restore Order',
    body: 'Los Angeles, May 1—Fires burned across South Central as residents raged over the acquittal of officers in the beating of Rodney King. Sirens echoed through the night while merchants defended storefronts. The Governor called in the National Guard to halt the mayhem.'
  },
  1993: {
    title: 'Bomb Rocks World Trade Center; Six Dead, Hundreds Hurt',
    body: 'New York, Feb. 26—An explosion tore through an underground garage of the World Trade Center at midday, sending smoke curling up stairwells and panicked workers down darkened halls. Police sealed lower Manhattan as rescue crews led dazed office workers into the cold.'
  },
  1994: {
    title: 'Mandela Elected President; South Africa Votes in First All-Race Poll',
    body: 'Johannesburg, April 27—South Africans queued for hours under bright autumn skies to cast ballots in a historic election. Days later, Nelson Mandela took the oath, vowing reconciliation and renewal. Townships erupted in dance and song as a new chapter opened.'
  },
  1995: {
    title: 'Oklahoma City Federal Building Bombed; Dozens Killed',
    body: 'Oklahoma City, April 19—A powerful truck bomb ripped open the Alfred P. Murrah Federal Building shortly after 9 a.m., collapsing floors and shattering windows for blocks. Volunteers formed lines to pass buckets of rubble as rescuers searched for survivors.'
  },
  1996: {
    title: 'Bomb Explodes at Atlanta Olympics; Park Evacuated',
    body: 'Atlanta, July 27—A pipe bomb detonated during a late-night concert at Centennial Olympic Park, killing one and injuring scores. Sirens converged as police cleared the grounds. Organizers vowed the Games would continue under tightened security.'
  },
  1997: {
    title: 'Hong Kong Returned to China; Union Jack Lowered at Midnight',
    body: 'Hong Kong, July 1—In a solemn ceremony, Britain transferred authority over Hong Kong to the People’s Republic of China. Rain fell on assembled dignitaries while harbor lights reflected in damp streets. Residents watched anxiously to see what “one country, two systems” would bring.'
  },
  1998: {
    title: 'Good Friday Agreement Reached; Ulster Parties Endorse Peace',
    body: 'Belfast, April 10—Negotiators emerged from marathon talks with a framework to end decades of sectarian strife in Northern Ireland. Voters in both North and South will be asked to approve the pact. Church bells rang hesitantly as families dared to hope.'
  },
  1999: {
    title: 'Euro Debuts in Financial Markets; New Currency Takes Hold',
    body: 'Brussels, Jan. 1—A dozen European nations today adopted a common currency for electronic transactions and accounting. Traders tapped new tickers as banks recalibrated systems. Notes and coins will follow later, officials said, heralding a more unified market.'
  },
  2000: {
    title: 'Y2K Bug Largely Averted; Computers Keep Ticking at Midnight',
    body: 'Sydney, Jan. 1—Airports, banks, and power stations reported few disruptions as the calendar turned to the year 2000. Months of patching and testing appeared to pay off. Revelers filled waterfronts from Auckland to New York as fireworks painted the sky.'
  },
  2001: {
    title: 'Terror Strikes America; Planes Hit World Trade Center and Pentagon',
    body: 'New York, Sept. 11—Hijacked airliners crashed into the twin towers this morning, toppling both and sending a pall of smoke over lower Manhattan. Another aircraft struck the Pentagon, while a fourth fell in Pennsylvania. Sirens wailed through dust-choked streets as the nation looked on in horror.'
  },
  2002: {
    title: 'Euro Cash Enters Circulation; Shoppers Pocket New Notes and Coins',
    body: 'Paris, Jan. 1—Long lines formed at cash machines as Europeans withdrew crisp euro notes and jingled unfamiliar coins. Shopkeepers pasted conversion charts beside registers. By afternoon, the new money clinked in cafés and metro stations alike.'
  },
  2003: {
    title: 'War Begins in Iraq; U.S. and Allies Strike Baghdad',
    body: 'Baghdad, March 20—Explosions flashed across the capital before dawn as coalition forces opened a campaign to topple Saddam Hussein. Anti-aircraft fire stitched the sky while residents huddled in basements. In Washington, the President vowed swift action.'
  },
  2004: {
    title: 'Indian Ocean Tsunami Kills Tens of Thousands; Coasts Laid Bare',
    body: 'Colombo, Dec. 26—A massive wave unleashed by an undersea quake swept ashore in Sri Lanka, Indonesia, Thailand, and beyond, carrying houses and buses inland. Survivors clung to trees and rooftop fragments as aid agencies scrambled to respond.'
  },
  2005: {
    title: 'Hurricane Katrina Inundates New Orleans; Levees Fail',
    body: 'New Orleans, Aug. 30—Waters poured through broken levees, stranding residents on rooftops and in attics as rescue boats nosed along flooded streets. The Superdome and convention center brimmed with evacuees. Scenes of desperation filled television screens nationwide.'
  },
  2006: {
    title: 'North Korea Conducts Nuclear Test; Condemnation Swift',
    body: 'Seoul, Oct. 9—Seismographs registered an underground blast in North Korea today, prompting urgent meetings at the United Nations. Regional markets dipped on the news. Governments called the act a grave provocation.'
  },
  2007: {
    title: 'Apple Introduces iPhone; Touchscreen Handset Unveiled',
    body: 'San Francisco, Jan. 9—Steve Jobs held aloft a sleek device combining phone, music player, and internet browser, promising to reinvent the mobile. Crowds at the Moscone Center roared approval as competitors scribbled notes.'
  },
  2008: {
    title: 'Lehman Brothers Fails; Markets Reel in Global Credit Crisis',
    body: 'New York, Sept. 15—One of Wall Street’s storied firms filed for bankruptcy, sending shock waves through finance as credit lines froze. Traders stared at tumbling tickers while central banks pumped funds to steady markets.'
  },
  2009: {
    title: 'Obama Sworn In as 44th President; Crowds Pack the Mall',
    body: 'Washington, Jan. 20—Barack Obama took the oath of office on a bitterly cold noon, speaking of hope, unity, and the work ahead. Families pressed shoulder to shoulder along Pennsylvania Avenue, waving flags as the parade rolled by.'
  },
  2010: {
    title: 'Oil Rig Explodes in Gulf; Massive Spill Fouls Coast',
    body: 'Gulf of Mexico, April 20—An explosion aboard the Deepwater Horizon drilling platform sent flames skyward and workers overboard. Crude oil gushed from the seabed as skimmers and booms deployed. Fishermen watched slicks creep toward fragile marshes.'
  },
  2011: {
    title: 'Bin Laden Killed in Pakistan; President Announces Operation’s Success',
    body: 'Abbottabad, May 2—U.S. special forces raided a walled compound overnight, killing Osama bin Laden after a brief firefight, officials said. Crowds gathered outside the White House chanting “U-S-A” as word spread across social media and late-night television.'
  },
  2012: {
    title: 'Curiosity Rover Lands on Mars; “Seven Minutes of Terror” Ends in Cheers',
    body: 'Pasadena, Aug. 6—Engineers at JPL erupted as signals confirmed that the rover Curiosity touched down safely in Gale Crater after a daring descent. First images showed its wheels on the red dust. Scientists prepared to begin drilling and sampling.'
  },
  2013: {
    title: 'Pope Francis Elected; First Jesuit Pontiff Appears on Balcony',
    body: 'Vatican City, March 13—White smoke rose from the Sistine Chapel chimney, and a new Pope stepped into the floodlights to bless a cheering crowd. Jorge Mario Bergoglio of Argentina took the name Francis, signaling humility and reform.'
  },
  2014: {
    title: 'Russia Annexes Crimea; West Imposes Sanctions',
    body: 'Moscow, March 18—President Vladimir Putin signed a treaty bringing Crimea into the Russian Federation after a disputed referendum. Western leaders condemned the move and announced penalties. Troops without insignia fanned across the peninsula.'
  },
  2015: {
    title: 'Supreme Court Legalizes Same-Sex Marriage Nationwide',
    body: 'Washington, June 26—In a landmark ruling, the Court held that same-sex couples have a constitutional right to marry. Courthouses stayed open late as couples arrived with flowers and friends. Rainbow flags flew in city centers across the country.'
  },
  2016: {
    title: 'Britons Vote to Leave the European Union; Pound Falls',
    body: 'London, June 24—A referendum to exit the EU passed by a narrow margin, shocking pollsters and rattling markets. Prime Minister David Cameron announced plans to step down. European leaders met to consider the path ahead.'
  },
  2017: {
    title: 'Total Solar Eclipse Sweeps U.S.; Millions Watch Path of Totality',
    body: 'Salem, Ore., Aug. 21—A dark disk slid across the sun at mid-morning, plunging towns into twilight as crickets chirped and temperatures dipped. Highways jammed as skywatchers cheered the glowing corona around the moon’s black silhouette.'
  },
  2018: {
    title: 'Thai Cave Rescue Succeeds; Boys and Coach Brought Out Alive',
    body: 'Mae Sai, July 10—Divers emerged from a flooded cave system carrying the last of twelve boys and their soccer coach after a perilous, multi-day operation. Volunteers from many nations joined Thai forces in a rescue that gripped the world.'
  },
  2019: {
    title: 'Fire Ravages Notre-Dame Cathedral; Spire Collapses',
    body: 'Paris, April 15—Flames leapt from the roof of Notre-Dame as firefighters battled to save the medieval structure. Parisians wept along the Seine as the spire fell. Officials pledged to rebuild the beloved monument.'
  },
  2020: {
    title: 'Pandemic Declared; Cities Lock Down as Virus Spreads',
    body: 'Geneva, March 11—The World Health Organization declared a pandemic as a novel coronavirus reached every continent. Schools, arenas, and office towers went dark. Citizens queued for groceries while hospitals prepared for a surge of patients.'
  },
  2021: {
    title: 'Mob Storms U.S. Capitol; Congress Reconvenes After Chaos',
    body: 'Washington, Jan. 6—A crowd forced its way past police lines and into the Capitol, smashing windows and halting the count of electoral votes. Lawmakers sheltered as officers cleared the halls. By nightfall, the session resumed under heavy guard.'
  },
  2022: {
    title: 'Russia Invades Ukraine; Missiles Strike Cities Before Dawn',
    body: 'Kyiv, Feb. 24—Explosions echoed across the capital and other cities as Russian troops crossed the border in multiple directions. Families crowded into subway tunnels as air-raid sirens wailed. World leaders condemned the attack and promised support.'
  },
  2023: {
    title: 'Powerful Quakes Devastate Türkiye and Syria; Rescue Efforts Mount',
    body: 'Gaziantep, Feb. 6—A pre-dawn earthquake and strong aftershocks toppled buildings across southern Türkiye and northern Syria, trapping thousands beneath concrete. International teams flew in with dogs and gear as survivors huddled under tents in winter cold.'
  },
  2024: {
    title: 'Total Solar Eclipse Arcs from Texas to Maine; Day Turns to Dusk',
    body: 'Dallas, April 8—Crowds wearing eclipse glasses erupted as the moon swallowed the sun, revealing a pearly corona. Birds settled and streetlights flickered on for a few uncanny minutes before daylight returned. Towns along the path reported festival-like scenes.'
  },
  2025: {
    title: 'Relentless Heat Wave Sets New Records; Grids Strain, Cities Adapt',
    body: 'Phoenix, July 14—Thermometers climbed past previous highs across several regions this week, testing power systems and emergency services. Cooling centers opened and road crews paused work by midday. Officials urged conservation as forecasters warned of continued extremes.'
  }
};

export function getGlobalNewsStory(year) {
  return GLOBAL_NEWS_STORIES[year] || null;
}


