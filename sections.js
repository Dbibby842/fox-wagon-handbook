// Sections derived from the Wagon Fitters Handbook (FG1.0, Jan 2025).
// page = starting page in the source PDF.
window.HANDBOOK_SECTIONS = [
  {n:1,  ra:"WF001", title:"Abrasive Wheels",                                    page:5,   tags:["grinding","disc","cutting","wheels","noise","dust"]},
  {n:2,  ra:"WF002", title:"Compressed Gas Cylinders",                           page:7,   tags:["oxygen","acetylene","propane","storage","pressure"]},
  {n:3,  ra:"WF003", title:"Electrical Welding",                                 page:9,   tags:["welding","mig","arc","fumes","sparks"]},
  {n:4,  ra:"WF004", title:"Electricity",                                        page:14,  tags:["electrical","shock","pat testing","isolation"]},
  {n:5,  ra:"WF005", title:"Hot Works",                                          page:16,  tags:["hot work","permit","fire","sparks"]},
  {n:6,  ra:"WF006", title:"Lifting Operations",                                 page:17,  tags:["lifting","loler","slings","chains","crane"]},
  {n:7,  ra:"WF007", title:"Dust",                                               page:19,  tags:["dust","rpe","respiratory","extraction"]},
  {n:8,  ra:"WF008", title:"Manual Handling",                                    page:20,  tags:["lifting","back","posture","musculoskeletal"]},
  {n:9,  ra:"WF009", title:"Power Tools",                                        page:23,  tags:["tools","drill","grinder","battery"]},
  {n:10, ra:"WF010", title:"Use of Vehicle Pit",                                 page:24,  tags:["pit","inspection","confined"]},
  {n:11, ra:"WF011", title:"Vehicle and Plant Movements",                        page:25,  tags:["vehicle","plant","movement","banksman"]},
  {n:12, ra:"WF012", title:"Refuelling of Vehicles and Plant",                   page:30,  tags:["fuel","diesel","spill","bowser"]},
  {n:13, ra:"WF013", title:"Working at Height",                                  page:32,  tags:["height","ladder","fall","harness"]},
  {n:14, ra:"WF014", title:"Noise",                                              page:37,  tags:["noise","hearing","decibel","ear"]},
  {n:15, ra:"WF015", title:"Vibration",                                          page:43,  tags:["hav","vibration","whole body","tools"]},
  {n:16, ra:"WF016", title:"PPE",                                                page:45,  tags:["ppe","gloves","glasses","boots","helmet"]},
  {n:17, ra:"WF017", title:"Slips, Trips and Falls",                             page:48,  tags:["housekeeping","floor","spill","trip"]},
  {n:18, ra:"WF018", title:"Use of Washdown",                                    page:51,  tags:["washdown","jet","water","pressure wash"]},
  {n:19, ra:"WF019", title:"Working Under Vehicles",                             page:53,  tags:["under vehicle","jack","axle","chock"]},
  {n:20, ra:"WF020", title:"Working with Batteries",                             page:56,  tags:["battery","acid","hydrogen","jump start"]},
  {n:21, ra:"WF021", title:"Working on Electric Vehicles",                       page:58,  tags:["ev","high voltage","traction battery","hybrid"]},
  {n:22, ra:"WF022", title:"Repairing Vehicle Brakes",                           page:60,  tags:["brakes","disc","dust","asbestos"]},
  {n:23, ra:"WF023", title:"Working on Cooling Systems",                         page:62,  tags:["radiator","coolant","hot","scald"]},
  {n:24, ra:"WF024", title:"Tyre Maintenance",                                   page:64,  tags:["tyres","wheel","cage","pressure"]},
  {n:25, ra:"WF025", title:"HGV Workshop Tyre Storage Facility",                 page:71,  tags:["tyre storage","racking","stacking"]},
  {n:26, ra:"WF026", title:"General Jacking and Blocking",                       page:73,  tags:["jack","axle stand","blocking","chock"]},
  {n:27, ra:"WF027", title:"Checking and Changing Hoses",                        page:75,  tags:["hoses","hydraulic","air","pressure"]},
  {n:28, ra:"WF028", title:"Repair and Maintenance of Sweeper Vehicles",         page:77,  tags:["sweeper","brush","dust","hopper"]},
  {n:29, ra:"WF029", title:"Enter and Exit from Wagons",                         page:86,  tags:["cab","access","steps","three points"]},
  {n:30, ra:"WF030", title:"Driving in Fox Group Yards",                         page:87,  tags:["yard","speed","traffic","pedestrian"]},
  {n:31, ra:"WF031", title:"Working Under Propped Body",                         page:89,  tags:["tipper","prop","body","tip"]},
  {n:32, ra:"WF032", title:"Forklift Truck Operations",                          page:91,  tags:["forklift","flt","lifting","itssar"]},
  {n:33, ra:"WF033", title:"Operation of Vehicle Lift Table",                    page:95,  tags:["lift table","hoist","ramp"]},
  {n:34, ra:"WF034", title:"Operation of Industrial Radial Arm Drill",           page:98,  tags:["drill","radial","arm","machine"]},
  {n:35, ra:"WF035", title:"Gantry Crane Operations",                            page:101, tags:["gantry","crane","lifting","slinging"]},
  {n:36, ra:"WF036", title:"Working at Height – Use of Podium Platforms",        page:104, tags:["podium","platform","height","step"]},
  {n:37, ra:"WF037", title:"Operation of a Pillar Drill",                        page:107, tags:["pillar drill","bench","chuck"]},
  {n:38, ra:"WF038", title:"Safe Use of Harnesses",                              page:110, tags:["harness","fall arrest","lanyard","inspection"]},
  {n:39, ra:"WF039", title:"Emergency Response Procedure",                       page:113, tags:["emergency","fire","evacuation","assembly"]},
  {n:40, ra:"WF040", title:"Emergency Spill Response",                           page:115, tags:["spill","oil","fuel","kit","absorbent"]},
  {n:41, ra:"WF041", title:"First Aid",                                          page:118, tags:["first aid","injury","medical","burn","cut"]}
];
window.HANDBOOK_TOTAL_PAGES = 172;

// Safe Systems of Work (SSoW) — sections 42–49, bound into handbook.pdf from page 120.
// page = start page in handbook.pdf, pages = page count, download = standalone SSoW PDF, related = linked risk assessments.
window.SSOW_SECTIONS = [
  {group:"ssow", n:42, ra:"SSoW-002", title:"The Use of Stepladders",                       download:"assets/ssow/SSoW-002.pdf", page:120, pages:4,  related:["WF013","WF036"],         tags:["stepladder","ladder","steps","height","fall","three points of contact"]},
  {group:"ssow", n:43, ra:"SSoW-010", title:"Undertaking Vehicle Tyre Repairs",             download:"assets/ssow/SSoW-010.pdf", page:124, pages:3,  related:["WF024","WF019","WF026"], tags:["tyre","repair","puncture","inflation","cage","explosion","split rim"]},
  {group:"ssow", n:44, ra:"SSoW-011", title:"Recovery of Trapped Wagons",                   download:"assets/ssow/SSoW-011.pdf", page:127, pages:3,  related:["WF011","WF006"],         tags:["recovery","stuck","mud","tow","excavator","chain","strap","shackle"]},
  {group:"ssow", n:45, ra:"SSoW-012", title:"Changing HGV and Trailer Wheels and Tyres",    download:"assets/ssow/SSoW-012.pdf", page:130, pages:7,  related:["WF019","WF024","WF026"], tags:["wheel change","tyre","jack","axle stand","roadside","wheel nuts","torque","re-torque"]},
  {group:"ssow", n:46, ra:"SSoW-014", title:"Securing Plant & Attachments to Trailers",     download:"assets/ssow/SSoW-014.pdf", page:137, pages:10, related:["WF011","WF029"],         tags:["load security","lashing","chains","low loader","plant","transport","attachments","trailer"]},
  {group:"ssow", n:47, ra:"SSoW-047", title:"Use of Vehicles on Construction Sites",        download:"assets/ssow/SSoW-047.pdf", page:147, pages:21, related:["WF011","WF030"],         tags:["construction site","traffic management","reversing","banksman","marshal","pedestrian","segregation"]},
  {group:"ssow", n:48, ra:"SSoW-054", title:"Maintenance in Trailer Bodies",                download:"assets/ssow/SSoW-054.pdf", page:168, pages:2,  related:["WF031","WF013"],         tags:["trailer body","skip","tipper","walking floor","cleaning","chock","tascc"]},
  {group:"ssow", n:49, ra:"SSoW-069", title:"Refilling HGV with Diesel and AdBlue",         download:"assets/ssow/SSoW-069.pdf", page:170, pages:3,  related:["WF012","WF040"],         tags:["diesel","adblue","fuel","refuelling","pump","spill","coshh"]}
];

