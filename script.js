(function(){

  // captured before any script mutation — the canonical page shell used to
  // build a "complete replacement page" whenever we publish shared state
  var pristineShellHTML = document.documentElement.outerHTML;

  var AVATAR_COLORS = ['#556052','#B8763F','#6E4C9A','#3D5F6E','#8C6B54','#4C7A94','#9C5B6B','#6B8C4C'];
  var AVATAR_EMOJI_CHOICES = [
    '😀','😎','🥳','😴','🤓','🥰','😇','🤠',
    '🐶','🐱','🦊','🐻','🐧','🦄','🐼','🐨','🐰','🐯','🦁','🐸',
    '🍜','🍣','🍔','🍕','🍩','🍺','☕','🍎',
    '🎸','⚽','🎮','📷','🎨','🏀','🎧','✈️',
    '🌸','🌊','🌈','⭐','🔥','🍀','🌙','☀️',
    '🏖️','🗼','⛰️','🚀','🚲','🧳'
  ];
  var THEME_GRADIENTS = [
    'linear-gradient(155deg,#C9AF8E 0%,#8A6B45 48%,#4A3620 100%)',
    'linear-gradient(155deg,#9AA88F 0%,#556052 48%,#2E362B 100%)',
    'linear-gradient(155deg,#B7C4CE 0%,#4C6373 48%,#26333B 100%)',
    'linear-gradient(155deg,#E0C8C1 0%,#9C6459 48%,#5A3129 100%)',
    'linear-gradient(155deg,#CBB9D0 0%,#6E4C7A 48%,#3A2740 100%)',
    'linear-gradient(155deg,#D7C7A4 0%,#8A7B5C 48%,#4A422F 100%)'
  ];
  // a trip's own uploaded cover photo takes priority over its default theme
  // gradient — used for both the trip-card on the home list and the
  // dashboard hero banner, so changing it in one place updates both.
  function tripCoverBackgroundCSS(t){
    if (t.coverPhoto){
      return 'background:linear-gradient(180deg, rgba(20,18,15,0.12), rgba(20,18,15,0.55)), center/cover no-repeat url(\''+t.coverPhoto+'\');';
    }
    if (t.coverColor){
      return 'background:'+t.coverColor+';';
    }
    return 'background:'+THEME_GRADIENTS[t.theme % THEME_GRADIENTS.length]+';';
  }

  var members = [
    {id:'you', name:'你', color:'#556052', avatarEmoji:null, avatarPhoto:null, budget:7000},
    {id:'alex', name:'Alex', color:'#B8763F', avatarEmoji:null, avatarPhoto:null, budget:6000},
    {id:'chris', name:'Chris', color:'#6E4C9A', avatarEmoji:null, avatarPhoto:null, budget:6500},
    {id:'sam', name:'Sam', color:'#3D5F6E', avatarEmoji:null, avatarPhoto:null, budget:6500}
  ];
  // which member the current device/viewer is — lets the app show "your"
  // budget/balance up front instead of a flat list of everyone's. Scoped per
  // trip (kept alongside members/expenses/etc. in each trip's bundle) since
  // the same physical person may map to a different member across trips.
  var viewerId = 'you';
  function memberExists(id){
    for (var i=0;i<members.length;i++){ if (members[i].id===id) return true; }
    return false;
  }

  var trip = {
    theme:0,
    coverPhoto:null,
    coverColor:null,
    name:'東京', country:'日本', start:'2026-10-12', end:'2026-10-20', budget:26000,
    stats:{days:8, attractions:18, bookings:6, savedPlaces:18},
    todayPlan:[
      {time:'10:30', title:'淺草寺'},
      {time:'13:00', title:'午餐'},
      {time:'15:00', title:'上野'}
    ],
    nextItem:{title:'上野公園', time:'15:00', distance:'12 分鐘'},
    staticChecklist:[
      {label:'航班', done:true},
      {label:'酒店', done:true},
      {label:'餐廳預訂', done:false},
      {label:'行李清單', done:false}
    ],
    leaderboardEnabled:true,
    hotels:[
      {id:'h1', name:'東京銀座格拉斯麗酒店', checkIn:'2026-10-12', checkOut:'2026-10-17', notes:'銀座站步行5分鐘'},
      {id:'h2', name:'箱根仙石原溫泉旅館', checkIn:'2026-10-17', checkOut:'2026-10-19', notes:'有露天溫泉'}
    ],
    regions:[
      {name:'銀座', loc:{x:50,y:50}}, {name:'淺草', loc:{x:21,y:30}}, {name:'上野', loc:{x:30,y:25}},
      {name:'新宿', loc:{x:38,y:40}}, {name:'澀谷', loc:{x:40,y:65}}, {name:'原宿', loc:{x:37,y:60}},
      {name:'台場', loc:{x:75,y:85}}, {name:'秋葉原', loc:{x:46,y:19}}, {name:'築地', loc:{x:53,y:53}},
      {name:'箱根', loc:{x:5,y:90}}, {name:'東京迪士尼', loc:{x:95,y:40}}
    ],
    days:[
      { date:'2026-10-12', items:[
        {id:'d1-1', time:'10:30', title:'羽田機場抵達', category:'交通', loc:{x:90,y:80}, done:true, linkedExpenseId:null},
        {id:'d1-2', time:'12:30', title:'酒店 Check-in（銀座）', category:'住宿', loc:{x:50,y:50}, done:true, linkedExpenseId:null},
        {id:'d1-3', time:'14:00', title:'築地場外市場', category:'餐飲', loc:{x:55,y:55}, done:true, linkedExpenseId:null},
        {id:'d1-4', time:'17:00', title:'銀座逛街', category:'購物', loc:{x:50,y:48}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-13', items:[
        {id:'d2-1', time:'09:00', title:'淺草寺', category:'景點', loc:{x:20,y:30}, done:true, linkedExpenseId:null},
        {id:'d2-2', time:'11:00', title:'仲見世通', category:'購物', loc:{x:22,y:31}, done:true, linkedExpenseId:null},
        {id:'d2-3', time:'13:00', title:'天婦羅午餐', category:'餐飲', loc:{x:23,y:32}, done:true, linkedExpenseId:null},
        {id:'d2-4', time:'15:00', title:'上野公園', category:'景點', loc:{x:30,y:25}, done:true, linkedExpenseId:null},
        {id:'d2-5', time:'18:00', title:'阿美橫町晚餐', category:'餐飲', loc:{x:31,y:26}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-14', items:[
        {id:'d3-1', time:'10:00', title:'明治神宮', category:'景點', loc:{x:35,y:60}, done:true, linkedExpenseId:null},
        {id:'d3-2', time:'12:30', title:'原宿午餐', category:'餐飲', loc:{x:36,y:61}, done:true, linkedExpenseId:null},
        {id:'d3-3', time:'14:00', title:'澀谷 Sky', category:'景點', loc:{x:40,y:65}, done:true, linkedExpenseId:null},
        {id:'d3-4', time:'19:00', title:'居酒屋晚餐', category:'餐飲', loc:{x:41,y:66}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-15', items:[
        {id:'d4-1', time:'09:30', title:'台場 Diver City', category:'景點', loc:{x:75,y:85}, done:true, linkedExpenseId:null},
        {id:'d4-2', time:'12:00', title:'台場午餐', category:'餐飲', loc:{x:76,y:86}, done:true, linkedExpenseId:null},
        {id:'d4-3', time:'15:00', title:'彩虹橋散步', category:'景點', loc:{x:74,y:84}, done:true, linkedExpenseId:null},
        {id:'d4-4', time:'18:30', title:'咖啡店', category:'餐飲', loc:{x:50,y:50}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-16', items:[
        {id:'d5-1', time:'08:30', title:'東京迪士尼樂園', category:'景點', loc:{x:95,y:40}, done:true, linkedExpenseId:null},
        {id:'d5-2', time:'13:00', title:'樂園午餐', category:'餐飲', loc:{x:95,y:40}, done:true, linkedExpenseId:null},
        {id:'d5-3', time:'20:00', title:'樂園晚餐', category:'餐飲', loc:{x:95,y:40}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-17', items:[
        {id:'d6-1', time:'09:00', title:'箱根一日遊：溫泉', category:'活動', loc:{x:5,y:90}, done:false, linkedExpenseId:null},
        {id:'d6-2', time:'12:00', title:'蘆之湖觀光船', category:'活動', loc:{x:4,y:91}, done:false, linkedExpenseId:null},
        {id:'d6-3', time:'15:00', title:'溫泉旅館 Check-in', category:'住宿', loc:{x:5,y:92}, done:false, linkedExpenseId:null}
      ]},
      { date:'2026-10-18', items:[
        {id:'d7-1', time:'10:00', title:'秋葉原', category:'購物', loc:{x:45,y:20}, done:false, linkedExpenseId:null},
        {id:'d7-2', time:'13:00', title:'拉麵午餐', category:'餐飲', loc:{x:46,y:21}, done:false, linkedExpenseId:null},
        {id:'d7-3', time:'15:00', title:'東京晴空塔', category:'景點', loc:{x:48,y:18}, done:false, linkedExpenseId:null},
        {id:'d7-4', time:'18:00', title:'晚餐', category:'餐飲', loc:{x:47,y:19}, done:false, linkedExpenseId:null}
      ]},
      { date:'2026-10-19', items:[
        {id:'d8-1', time:'10:00', title:'自由活動／退房前收拾', category:'住宿', loc:{x:50,y:50}, done:false, linkedExpenseId:null},
        {id:'d8-2', time:'13:00', title:'機場交通', category:'交通', loc:{x:90,y:80}, done:false, linkedExpenseId:null},
        {id:'d8-3', time:'16:00', title:'羽田機場離境', category:'交通', loc:{x:90,y:80}, done:false, linkedExpenseId:null}
      ]}
    ]
  };

  var ITEM_CATEGORIES = ['景點','餐飲','交通','住宿','購物','活動'];
  var ITEM_TO_EXPENSE_CATEGORY = {'景點':'門票','餐飲':'餐飲','交通':'交通','住宿':'住宿','購物':'購物','活動':'活動'};

  var candidatePlaces = [
    {id:'c1', name:'一蘭拉麵（新宿店）', category:'餐飲', area:'新宿', notes:'', loc:{x:38,y:40}, selected:false, addedToDay:null},
    {id:'c2', name:'燒肉 Aged Beef', category:'餐飲', area:'銀座', notes:'', loc:{x:51,y:49}, selected:false, addedToDay:null},
    {id:'c3', name:'鰻魚飯老店', category:'餐飲', area:'淺草', notes:'', loc:{x:21,y:30}, selected:false, addedToDay:null},
    {id:'c4', name:'下北澤古著街', category:'購物', area:'下北澤', notes:'', loc:{x:33,y:55}, selected:false, addedToDay:null},
    {id:'c5', name:'表參道 Hills', category:'購物', area:'表參道', notes:'', loc:{x:37,y:59}, selected:false, addedToDay:null},
    {id:'c6', name:'谷根千散步', category:'景點', area:'谷中', notes:'', loc:{x:32,y:22}, selected:false, addedToDay:null},
    {id:'c7', name:'貓咪 Café', category:'活動', area:'原宿', notes:'', loc:{x:36,y:62}, selected:false, addedToDay:null},
    {id:'c8', name:'壽司大（築地）', category:'餐飲', area:'築地', notes:'', loc:{x:55,y:56}, selected:false, addedToDay:null}
  ];

  var expenseCategories = ['住宿','餐飲','交通','活動','購物','門票','其他'];
  var shopCategoryOrder = ['必需品','衣物','藥物','食物','旅程用品'];

  // ---------- currency conversion ----------
  // We can't call a live FX API from inside a published artifact (same CSP
  // restriction that blocks Google Maps), so rates here are fixed reference
  // values rather than live/real-time — good enough to help split HKD budgets
  // for spending logged in a local currency, not for precise accounting.
  var CURRENCY_LIST = [
    {code:'HKD', symbol:'HK$', label:'HK$ 港幣', rate:1},
    {code:'JPY', symbol:'¥', label:'¥ 日圓 JPY', rate:0.052},
    {code:'USD', symbol:'US$', label:'US$ 美元 USD', rate:7.8},
    {code:'CNY', symbol:'CN¥', label:'CN¥ 人民幣 CNY', rate:1.09},
    {code:'TWD', symbol:'NT$', label:'NT$ 新台幣 TWD', rate:0.245},
    {code:'EUR', symbol:'€', label:'€ 歐元 EUR', rate:8.5},
    {code:'GBP', symbol:'£', label:'£ 英鎊 GBP', rate:9.9},
    {code:'KRW', symbol:'₩', label:'₩ 韓圜 KRW', rate:0.0058},
    {code:'THB', symbol:'฿', label:'฿ 泰銖 THB', rate:0.22},
    {code:'SGD', symbol:'S$', label:'S$ 新加坡元 SGD', rate:5.8},
    {code:'MOP', symbol:'MOP$', label:'MOP$ 澳門幣 MOP', rate:0.97},
    {code:'AUD', symbol:'A$', label:'A$ 澳元 AUD', rate:5.2}
  ];
  function findCurrency(code){
    for (var i=0;i<CURRENCY_LIST.length;i++){ if (CURRENCY_LIST[i].code===code) return CURRENCY_LIST[i]; }
    return CURRENCY_LIST[0];
  }
  function currencyOptionsHTML(selectedCode){
    return CURRENCY_LIST.map(function(c){ return '<option value="'+c.code+'" '+(c.code===selectedCode?'selected':'')+'>'+c.label+'</option>'; }).join('');
  }
  function convertToHKD(amount, code){
    return Math.round((Number(amount)||0) * findCurrency(code).rate);
  }
  function formatForeign(amount, code){
    return findCurrency(code).symbol + Math.round(Number(amount)||0).toLocaleString('en-US');
  }
  // pick a sensible default entry currency based on where the trip is —
  // still just a starting point, the traveller can change it any time.
  var COUNTRY_DEFAULT_CURRENCY = {
    '日本':'JPY', '台灣':'TWD', '中國':'CNY', '中國大陸':'CNY', '南韓':'KRW', '韓國':'KRW',
    '泰國':'THB', '新加坡':'SGD', '美國':'USD', '英國':'GBP', '澳洲':'AUD', '澳門':'MOP'
  };
  function defaultCurrencyForTrip(){ return COUNTRY_DEFAULT_CURRENCY[trip.country] || 'HKD'; }

  var idSeed = 100;
  function nextId(prefix){ idSeed++; return prefix + idSeed; }

  var expenses = [
    {id:'e1', title:'東京酒店（首 5 晚）', amount:4800, category:'住宿', paidBy:'alex', participants:['you','alex','chris','sam'], splitType:'equal', shares:null, date:'2026-10-12', notes:''},
    {id:'e2', title:'酒店延住兩晚', amount:3200, category:'住宿', paidBy:'chris', participants:['you','alex','chris','sam'], splitType:'equal', shares:null, date:'2026-10-17', notes:''},
    {id:'e3', title:'機場到酒店的士', amount:680, category:'交通', paidBy:'sam', participants:['you','alex','chris','sam'], splitType:'equal', shares:null, date:'2026-10-12', notes:''},
    {id:'e4', title:'東京地鐵 PASS', amount:1620, category:'交通', paidBy:'you', participants:['you','alex','chris','sam'], splitType:'equal', shares:null, date:'2026-10-12', notes:''},
    {id:'e5', title:'築地場外午餐', amount:1280, category:'餐飲', paidBy:'alex', participants:['you','alex','chris','sam'], splitType:'equal', shares:null, date:'2026-10-13', notes:''},
    {id:'e6', title:'居酒屋晚餐', amount:2120, category:'餐飲', paidBy:'chris', participants:['you','chris','sam'], splitType:'equal', shares:null, date:'2026-10-14', notes:'Alex 當晚未有出席'},
    {id:'e7', title:'咖啡店', amount:800, category:'餐飲', paidBy:'you', participants:['you','alex','chris','sam'], splitType:'equal', shares:null, date:'2026-10-15', notes:''},
    {id:'e8', title:'迪士尼樂園門票', amount:2920, category:'門票', paidBy:'sam', participants:['you','alex','chris','sam'], splitType:'equal', shares:null, date:'2026-10-16', notes:''},
    {id:'e9', title:'觀光船體驗', amount:1200, category:'活動', paidBy:'chris', participants:['you','alex','chris','sam'], splitType:'percentage', shares:{you:25,alex:25,chris:25,sam:25}, date:'2026-10-16', notes:''}
  ];

  var shoppingItems = [
    {id:'s1', name:'護照套', category:'必需品', quantity:1, estimatedPrice:80, actualPrice:75, assignedTo:'you', status:'purchased', notes:'', linkedExpenseId:null},
    {id:'s2', name:'旅行轉插', category:'必需品', quantity:2, estimatedPrice:200, actualPrice:168, assignedTo:'alex', status:'purchased', notes:'', linkedExpenseId:null},
    {id:'s3', name:'充電器', category:'必需品', quantity:1, estimatedPrice:150, actualPrice:null, assignedTo:'chris', status:'pending', notes:'', linkedExpenseId:null},
    {id:'s4', name:'薄外套', category:'衣物', quantity:4, estimatedPrice:0, actualPrice:null, assignedTo:'you', status:'not_needed', notes:'已經有帶', linkedExpenseId:null},
    {id:'s5', name:'雨傘', category:'衣物', quantity:2, estimatedPrice:120, actualPrice:110, assignedTo:'sam', status:'purchased', notes:'', linkedExpenseId:null},
    {id:'s6', name:'止痛藥', category:'藥物', quantity:1, estimatedPrice:60, actualPrice:null, assignedTo:'chris', status:'pending', notes:'', linkedExpenseId:null},
    {id:'s7', name:'腸胃藥', category:'藥物', quantity:1, estimatedPrice:50, actualPrice:null, assignedTo:'sam', status:'pending', notes:'', linkedExpenseId:null},
    {id:'s8', name:'行李牌', category:'旅程用品', quantity:4, estimatedPrice:100, actualPrice:null, assignedTo:'you', status:'pending', notes:'', linkedExpenseId:null},
    {id:'s9', name:'相機記憶卡', category:'旅程用品', quantity:1, estimatedPrice:280, actualPrice:null, assignedTo:'alex', status:'pending', notes:'', linkedExpenseId:null}
  ];

  // ---------- multi-trip store ----------
  // Every function below still reads the free-standing `trip` / `members` /
  // `expenses` / `shoppingItems` / `candidatePlaces` / `shopCategoryOrder`
  // variables directly (as originally authored for a single trip). Rather
  // than thread a trip parameter through every function, switching trips
  // simply reassigns those same variables from a "bundle" — every existing
  // function keeps working unchanged because closures see the reassignment.

  // archivedMembers keeps a light {id -> {id,name,color}} record of members
  // removed from a trip, so anything that still references their old id
  // (a past expense's paidBy/participant, a settlement balance) can still
  // show a real name instead of falling back to the raw internal id.
  var archivedMembers = {};

  var tripsStore = [
    { id:'trip1', trip:trip, members:members, expenses:expenses, shoppingItems:shoppingItems, candidatePlaces:candidatePlaces, shopCategoryOrder:shopCategoryOrder, viewerId:viewerId, archivedMembers:archivedMembers }
  ];
  var currentTripId = 'trip1';

  function getBundle(id){ return tripsStore.filter(function(b){ return b.id===id; })[0]; }

  function syncGlobalsIntoCurrentBundle(){
    var b = getBundle(currentTripId);
    if (!b) return;
    b.trip = trip; b.members = members; b.expenses = expenses; b.shoppingItems = shoppingItems;
    b.candidatePlaces = candidatePlaces; b.shopCategoryOrder = shopCategoryOrder; b.viewerId = viewerId;
    b.archivedMembers = archivedMembers;
  }

  function loadTripIntoGlobals(id){
    var b = getBundle(id);
    if (!b) return;
    trip = b.trip; members = b.members; expenses = b.expenses; shoppingItems = b.shoppingItems;
    candidatePlaces = b.candidatePlaces; shopCategoryOrder = b.shopCategoryOrder;
    viewerId = (b.viewerId!==undefined) ? b.viewerId : null;
    archivedMembers = b.archivedMembers || {};
    currentTripId = id;
  }

  var state = {
    screen:'home',
    tab:'dashboard',
    expenseSubTab:'log',
    demoTripStarted:null,
    modal:null,
    expenseFilterCat:'全部',
    expenseFilterMember:null,
    itineraryView:'day',
    itineraryDayIndex:0,
    leaderboardFilterMember:null,
    lastOptimizePreview:null,
    lastRoutePreview:null,
    lastLuckyPick:null,
    luckyFilterCat:'全部'
  };

  function fmt(n){ n = Math.round(n||0); return 'HK$' + n.toLocaleString('en-US'); }
  function fmtPct(n){ return Math.round(n) + '%'; }
  function findMember(id){
    for (var i=0;i<members.length;i++){ if(members[i].id===id) return members[i]; }
    if (archivedMembers && archivedMembers[id]) return archivedMembers[id];
    return {id:id,name:id,color:'#8B877E'};
  }
  function initials(name){ return name.slice(0,1).toUpperCase(); }

  // ---------- per-trip regions (used to place items/candidates on the map grid) ----------
  function findRegion(name){
    if (!trip.regions) return null;
    for (var i=0;i<trip.regions.length;i++){ if (trip.regions[i].name===name) return trip.regions[i]; }
    return null;
  }
  function addCustomRegion(name){
    var existing = findRegion(name);
    if (existing) return existing;
    var r = { name:name, loc:{ x: 12+Math.random()*76, y: 12+Math.random()*76 } };
    if (!trip.regions) trip.regions = [];
    trip.regions.push(r);
    return r;
  }
  function regionOptionsHTML(selectedName){
    var opts = (trip.regions||[]).map(function(r){ return '<option '+(r.name===selectedName?'selected':'')+'>'+r.name+'</option>'; }).join('');
    return opts + '<option value="__new__">＋ 新增地區…</option>';
  }
  // We can't call Google's address-lookup API directly from inside this page
  // (published artifacts can't make outbound network calls), so instead of a
  // fake autofill we give a one-tap link straight to a Google Maps search for
  // whatever region is currently selected — good enough to look up / copy the
  // real address without leaving the flow.
  function googleMapsSearchLinkHTML(placeName){
    if (!placeName) return '';
    var q = encodeURIComponent(placeName + (trip.country ? (' ' + trip.country) : ''));
    return '<a href="https://www.google.com/maps/search/?api=1&query='+q+'" target="_blank" rel="noopener noreferrer" class="link-btn" style="display:inline-flex;align-items:center;gap:4px;margin-top:6px;">'+icon('route',13)+'喺 Google Maps 睇返「'+placeName+'」嘅實際地址</a>';
  }
  function avatarHTML(id, size){
    var m = findMember(id);
    var cls = size==='lg' ? 'avatar lg' : 'avatar';
    if (m.avatarPhoto){
      return '<div class="'+cls+'" style="background:'+m.color+';padding:0;overflow:hidden;"><img src="'+m.avatarPhoto+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></div>';
    }
    var content = m.avatarEmoji ? m.avatarEmoji : initials(m.name);
    // the picked colour always applies — an emoji sits on top of it, it never
    // hides it (previously an emoji forced a fixed tint and made the colour
    // swatches look like they did nothing once an emoji was chosen)
    var bg = m.color;
    return '<div class="'+cls+'" style="background:'+bg+';'+(m.avatarEmoji?'font-size:'+(size==='lg'?'20':'15')+'px;':'')+'">'+content+'</div>';
  }

  // ---------- "everyone wants this" sentinel for shopping-item assignment ----------
  // shoppingItems[].assignedTo is normally a member id, but a shopper can also
  // mark an item as wanted by the whole group rather than one specific person —
  // EVERYONE_ID is that sentinel value. Any place that used to assume
  // assignedTo was always a real member id goes through these two helpers
  // instead of findMember()/avatarHTML() directly.
  var EVERYONE_ID = 'everyone';
  function assigneeName(id){ return id === EVERYONE_ID ? '大家都想要' : findMember(id).name; }
  function assigneeAvatarHTML(id, size){
    if (id === EVERYONE_ID){
      var cls = size==='lg' ? 'avatar lg' : 'avatar';
      return '<div class="'+cls+'" style="background:#8B877E;display:flex;align-items:center;justify-content:center;">'+icon('users', size==='lg'?20:14,'#fff')+'</div>';
    }
    return avatarHTML(id, size);
  }

  function icon(name, size, color){
    size = size || 18; color = color || 'currentColor';
    var paths = {
      chevronLeft:'<path d="M15 18l-6-6 6-6"/>',
      chevronRight:'<path d="M9 6l6 6-6 6"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      receipt:'<path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v6h6"/>',
      bag:'<rect x="5" y="8" width="14" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
      users:'<circle cx="9" cy="8" r="3"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.4"/><path d="M15 20a5 5 0 0 1 6.5-4.7"/>',
      heart:'<path d="M20.8 8.6c0 5-8.8 10-8.8 10s-8.8-5-8.8-10a4.8 4.8 0 0 1 8.8-2.7A4.8 4.8 0 0 1 20.8 8.6z"/>',
      calendar:'<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
      arrowRight:'<path d="M5 12h13M13 6l6 6-6 6"/>',
      close:'<path d="M6 6l12 12M18 6L6 18"/>',
      check:'<path d="M20 6L9 17l-5-5"/>',
      sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2 2M17.8 17.8l2 2M2 12h3M19 12h3M4.2 19.8l2-2M17.8 6.2l2-2"/>',
      cloud:'<path d="M6 18a4 4 0 0 1-.5-7.97A5 5 0 0 1 15 8.5 4.5 4.5 0 0 1 17.5 18H6z"/>',
      rain:'<path d="M6 15a4 4 0 0 1-.5-7.97A5 5 0 0 1 15 5.5 4.5 4.5 0 0 1 17.5 15H6z"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>',
      dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1" fill="'+color+'"/><circle cx="15" cy="9" r="1.1" fill="'+color+'"/><circle cx="9" cy="15" r="1.1" fill="'+color+'"/><circle cx="15" cy="15" r="1.1" fill="'+color+'"/><circle cx="12" cy="12" r="1.1" fill="'+color+'"/>',
      route:'<circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 7c3 1 3 9 9 10"/>',
      arrowUp:'<path d="M12 19V5M6 11l6-6 6 6"/>',
      arrowDown:'<path d="M12 5v14M6 13l6 6 6-6"/>',
      trash:'<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>',
      drag:'<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
      camera:'<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.6"/>'
    };
    return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]||'')+'</svg>';
  }

  // ---------- calculation engine ----------

  function shareFor(e){
    // returns {memberId: amount}
    var out = {};
    var n = e.participants.length;
    if (e.splitType === 'equal'){
      var each = e.amount / n;
      e.participants.forEach(function(id){ out[id] = each; });
    } else if (e.splitType === 'percentage'){
      e.participants.forEach(function(id){ out[id] = e.amount * ((e.shares && e.shares[id] || 0)/100); });
    } else { // custom
      e.participants.forEach(function(id){ out[id] = (e.shares && e.shares[id]) || 0; });
    }
    return out;
  }

  // shows exactly how a split expense breaks down onto each team member —
  // "邊個分咗幾多"，so a shared expense's per-person share is always visible
  // right on the expense card, not just folded into an aggregate total.
  function expenseSplitBreakdownHTML(e){
    if (!e.participants || e.participants.length <= 1) return '';
    var shares = shareFor(e);
    var isForeign = e.currency && e.currency !== 'HKD';
    return '<div class="expense-split-row">' +
      e.participants.map(function(id){
        var m = findMember(id);
        var isYou = viewerId && id === viewerId;
        var amountLabel = isForeign ? formatForeign((shares[id]||0) / findCurrency(e.currency).rate, e.currency) : fmt(shares[id]||0);
        return '<span class="split-chip'+(isYou?' you':'')+'"><span class="split-chip-dot" style="background:'+m.color+';"></span>'+m.name+' <b class="num">'+amountLabel+'</b></span>';
      }).join('') +
    '</div>';
  }
  function nonSettlement(){ return expenses.filter(function(e){ return e.category !== 'settlement'; }); }

  function totalSpend(){ return nonSettlement().reduce(function(s,e){ return s+e.amount; },0); }

  function categoryBreakdown(){
    var map = {};
    nonSettlement().forEach(function(e){ map[e.category] = (map[e.category]||0) + e.amount; });
    var arr = Object.keys(map).map(function(k){ return {category:k, amount:map[k]}; });
    arr.sort(function(a,b){ return b.amount-a.amount; });
    return arr;
  }

  function memberPaidTotal(id){
    return nonSettlement().filter(function(e){ return e.paidBy===id; }).reduce(function(s,e){ return s+e.amount; },0);
  }

  function balances(){
    var bal = {}; members.forEach(function(m){ bal[m.id]=0; });
    expenses.forEach(function(e){
      bal[e.paidBy] = (bal[e.paidBy]||0) + e.amount;
      var shares = shareFor(e);
      Object.keys(shares).forEach(function(uid){ bal[uid] = (bal[uid]||0) - shares[uid]; });
    });
    return bal;
  }

  function settlementPlan(){
    var bal = balances();
    var creditors = [], debtors = [];
    Object.keys(bal).forEach(function(id){
      var v = bal[id];
      if (v > 0.5) creditors.push({id:id, amt:v});
      else if (v < -0.5) debtors.push({id:id, amt:-v});
    });
    creditors.sort(function(a,b){ return b.amt-a.amt; });
    debtors.sort(function(a,b){ return b.amt-a.amt; });
    var i=0, j=0, plan=[];
    while (i<debtors.length && j<creditors.length){
      var pay = Math.min(debtors[i].amt, creditors[j].amt);
      plan.push({from:debtors[i].id, to:creditors[j].id, amount:Math.round(pay)});
      debtors[i].amt -= pay; creditors[j].amt -= pay;
      if (debtors[i].amt < 0.5) i++;
      if (creditors[j].amt < 0.5) j++;
    }
    return plan;
  }

  function shoppingStats(){
    var total = shoppingItems.length;
    var purchased = shoppingItems.filter(function(i){ return i.status==='purchased'; });
    var pending = shoppingItems.filter(function(i){ return i.status==='pending'; });
    var estimatedTotal = shoppingItems.filter(function(i){ return i.status!=='not_needed'; }).reduce(function(s,i){ return s+(i.estimatedPrice||0); },0);
    var actualTotal = purchased.reduce(function(s,i){ return s+(i.actualPrice||0); },0);
    return {total:total, purchased:purchased.length, pending:pending.length, estimatedTotal:estimatedTotal, actualTotal:actualTotal};
  }

  // ---------- itinerary + route calculation ----------

  function dist(a,b){ return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2)); }

  function routeDistance(locs){
    var total = 0;
    for (var i=0;i<locs.length-1;i++){ total += dist(locs[i],locs[i+1]); }
    return total;
  }

  // greedy nearest-neighbour route starting from the first location; returns an
  // array of original indices in visiting order.
  function nearestNeighborOrder(locs){
    var n = locs.length;
    var order = [0], visited = [true];
    for (var i=1;i<n;i++) visited.push(false);
    for (var step=1; step<n; step++){
      var last = locs[order[order.length-1]];
      var best = -1, bestD = Infinity;
      for (var k=0;k<n;k++){
        if (!visited[k]){
          var d = dist(last, locs[k]);
          if (d < bestD){ bestD = d; best = k; }
        }
      }
      order.push(best); visited[best] = true;
    }
    return order;
  }

  var MINUTES_PER_UNIT = 2.4; // demo conversion from grid distance to estimated travel minutes

  function computeItineraryChecklistRows(){
    var rows = [];
    var i = 0;
    while (i < trip.days.length){
      var day = trip.days[i];
      var dayDone = day.items.length>0 && day.items.every(function(it){ return it.done; });
      var j = i;
      while (j+1 < trip.days.length){
        var nextDone = trip.days[j+1].items.length>0 && trip.days[j+1].items.every(function(it){ return it.done; });
        if (nextDone !== dayDone) break;
        j++;
      }
      var label = (i===j) ? ('第 '+(i+1)+' 日行程') : ('第 '+(i+1)+'–'+(j+1)+' 日行程');
      rows.push({label:label, done:dayDone});
      i = j+1;
    }
    return rows;
  }

  function memberSpendShare(id){
    var total = 0;
    nonSettlement().forEach(function(e){ var s = shareFor(e); total += (s[id]||0); });
    return total;
  }

  function mostExpensiveExpense(){
    var list = nonSettlement();
    if (!list.length) return null;
    return list.reduce(function(max,e){ return (!max || e.amount>max.amount) ? e : max; }, null);
  }

  function dayCategoryBreakdown(date, memberId){
    var map = {};
    nonSettlement().filter(function(e){ return e.date===date; }).forEach(function(e){
      if (memberId){
        if (e.participants.indexOf(memberId)===-1) return;
        var s = shareFor(e);
        map[e.category] = (map[e.category]||0) + (s[memberId]||0);
      } else {
        map[e.category] = (map[e.category]||0) + e.amount;
      }
    });
    var arr = Object.keys(map).map(function(k){ return {category:k, amount:map[k]}; });
    arr.sort(function(a,b){ return b.amount-a.amount; });
    return arr;
  }

  function tripExpenseDates(){
    var set = {};
    nonSettlement().forEach(function(e){ set[e.date] = true; });
    return Object.keys(set).sort(function(a,b){ return a<b?1:-1; });
  }

  function isTripStarted(){
    if (state.demoTripStarted !== null) return state.demoTripStarted;
    return new Date() >= new Date(trip.start + 'T00:00:00');
  }

  function daysUntilStart(){
    var diff = new Date(trip.start+'T00:00:00') - new Date();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  // ---------- render: shell ----------

  var app = document.getElementById('app');

  function render(){
    if (state.screen === 'home'){
      app.innerHTML = renderTripsHome();
      var staleH = document.querySelectorAll('.overlay');
      for (var h=0;h<staleH.length;h++){ staleH[h].remove(); }
      if (state.modal) renderModal();
      persistAll();
      return;
    }
    var html = '';
    if (state.tab !== 'dashboard') html += renderTopbar();
    else if (readOnlyMode) html += '<div class="readonly-banner">'+icon('chevronRight',14,'var(--accent-deep)')+'呢個連結係唯讀 — 你嘅改動只會存喺呢部機。請向擁有者要求編輯權限。</div>';
    html += renderTabs();
    if (state.tab === 'dashboard') html += renderDashboard();
    else if (state.tab === 'itinerary') html += renderItinerary();
    else if (state.tab === 'shopping') html += renderShopping();
    else html += renderExpenses();
    if (state.tab === 'dashboard') html += renderStickyNone();
    app.innerHTML = html;
    var stale = document.querySelectorAll('.overlay');
    for (var i=0;i<stale.length;i++){ stale[i].remove(); }
    if (state.modal) renderModal();
    persistAll();
  }

  // Only actual trip-data changes (an expense added, an item checked off, a
  // member added, etc.) should trigger a shared publish — and the reload of
  // this view that a successful publish causes. Pure navigation (switching
  // tabs, opening a modal, picking a filter) must NOT trigger that reload,
  // or the app would visibly "jump" after almost every tap.
  var dataDirty = false;
  function markDirty(){ dataDirty = true; }

  function persistAll(){
    saveLocal();
    if (dataDirty){ dataDirty = false; scheduleSync(); scheduleFirebasePush(); }
  }

  // ---------- persistence: local cache + shared server-side sync ----------

  var STORAGE_KEY = 'tripWalletState_v2';

  function serializeAppState(){
    syncGlobalsIntoCurrentBundle();
    return {
      v:2, tripsStore: tripsStore, currentTripId: currentTripId, idSeed: idSeed,
      screen: state.screen, tab: state.tab, itineraryDayIndex: state.itineraryDayIndex
    };
  }

  function saveLocal(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeAppState())); }
    catch(err){ /* storage unavailable — state just won't persist across reloads on this device */ }
  }

  function applyPersistedState(saved){
    tripsStore = saved.tripsStore;
    currentTripId = (saved.currentTripId && getBundleFrom(tripsStore, saved.currentTripId)) ? saved.currentTripId : tripsStore[0].id;
    if (typeof saved.idSeed === 'number') idSeed = saved.idSeed;
    loadTripIntoGlobals(currentTripId);
    // restore where the viewer was — a publish-triggered reload of this same view
    // must NOT bounce back to the trips home screen mid-interaction.
    if (saved.screen === 'home' || saved.screen === 'trip') state.screen = saved.screen;
    if (typeof saved.tab === 'string') state.tab = saved.tab;
    if (typeof saved.itineraryDayIndex === 'number') state.itineraryDayIndex = saved.itineraryDayIndex;
  }

  function getBundleFrom(store, id){ return store.filter(function(b){ return b.id===id; })[0]; }

  function loadPersistedState(){
    // 1. shared state embedded in the published page (server-side — friends see this)
    try{
      var tag = document.getElementById('app-state-data');
      if (tag && tag.textContent){
        var embedded = JSON.parse(tag.textContent);
        if (embedded && Array.isArray(embedded.tripsStore) && embedded.tripsStore.length){
          applyPersistedState(embedded);
          return;
        }
      }
    } catch(err){ /* malformed embedded state — fall through */ }
    // 2. this device's local cache
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw){
        var saved = JSON.parse(raw);
        if (saved && Array.isArray(saved.tripsStore) && saved.tripsStore.length){
          applyPersistedState(saved);
          return;
        }
      }
    } catch(err){ /* corrupted or unavailable storage — fall back to sample data below */ }
    // 3. otherwise keep the in-code sample trip already seeded into tripsStore
  }

  function buildFullHTML(){
    var serialized = JSON.stringify(serializeAppState());
    return pristineShellHTML.replace(
      /(<script id="app-state-data" type="application\/json">)[\s\S]*?(<\/script>)/,
      function(m, open, close){ return open + serialized + close; }
    );
  }

  var artifactNS = null;
  var readOnlyMode = false;
  var syncTimer = null;

  function initArtifactCapability(){
    if (!window.claude || typeof window.claude.use !== 'function') return;
    window.claude.use('artifact').then(function(ns){
      artifactNS = ns;
      // do NOT sync here: nothing changed yet, and syncing on load alone
      // would cause an avoidable reload with no new data to show for it.
    }).catch(function(){ artifactNS = null; });
  }

  function scheduleSync(){
    if (!artifactNS || readOnlyMode) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function(){ syncTimer = null; publishShared(); }, 900);
  }

  function publishShared(){
    if (!artifactNS) return;
    var html = buildFullHTML();
    artifactNS.publish(html).then(function(){
      /* success — the shell keeps this view showing what we just published */
    }).catch(function(err){
      var code = err && err.code;
      if (code === 'conflict') return; // routine: the shell auto-reloads every view to the winner
      if (code==='not_writer' || code==='not_granted' || code==='not_declared' || code==='capability_disabled' || code==='capability_removed'){
        if (!readOnlyMode){ readOnlyMode = true; render(); }
      }
    });
  }

  // ===================== 多裝置同步（Firebase，使用者自己嘅免費專案） =====================
  // Independent, opt-in alternative to the artifact-publish sync above — for
  // anyone hosting this app themselves (e.g. GitHub Pages) rather than inside
  // a Claude Artifact. The WHOLE app state (every trip) is stored as ONE
  // Firestore document keyed by a short "sync code" the user shares between
  // their own devices. There is no login: knowing the code is what grants
  // read/write, same trust model as a shared link — never share it beyond
  // your own devices/travel group. Conflict handling is intentionally simple
  // (last write wins by timestamp) rather than a real merge, since two people
  // editing the exact same field at the exact same moment is a rare edge case
  // for a small trip-planning app.
  var FIREBASE_CONFIG_KEY = 'tripWallet_firebaseConfig';
  var FIREBASE_SYNCCODE_KEY = 'tripWallet_syncCode';
  // Built-in project so nobody has to set up Firebase to sync. A Firebase web
  // config is public by design (it identifies the project, it is not a
  // secret) — what actually guards the data is the sync code, which is why
  // the code must be treated like a private link and never posted publicly.
  // Anyone who prefers their own project can still override this below.
  var DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyBjqWJqGC3-TV07oYv28dP3yvOt8bTgg6w",
    authDomain: "trip-wallet-sync.firebaseapp.com",
    projectId: "trip-wallet-sync",
    storageBucket: "trip-wallet-sync.firebasestorage.app",
    messagingSenderId: "650211141696",
    appId: "1:650211141696:web:5e580fc6fa317a3834d7a5"
  };
  var firebaseApp = null, firebaseDb = null, firebaseUnsub = null;
  var firebaseSavedConfigText = '';
  var firebaseSyncCode = null;
  var firebaseSyncStatus = 'off'; // 'off' | 'connecting' | 'on' | 'error'
  var firebaseSyncError = '';
  var firebaseLastSyncedAt = null;
  var firebaseLastPushedStamp = null; // guards against reacting to our own echoed write
  var firebasePushTimer = null;

  function parseFirebaseConfigText(text){
    try { var j = JSON.parse(text); if (j && j.projectId) return j; } catch(e1){}
    try { var f = (new Function('"use strict"; return (' + text + ');'))(); if (f && f.projectId) return f; } catch(e2){}
    return null;
  }

  function activeFirebaseConfigText(){
    return firebaseSavedConfigText || JSON.stringify(DEFAULT_FIREBASE_CONFIG);
  }
  function usingOwnFirebaseProject(){ return !!firebaseSavedConfigText; }

  // The sync code also lives in the URL, so opening the same link on another
  // device — or in a private window, where localStorage is wiped every time —
  // reconnects to the same data with nothing to set up and nothing to retype.
  function syncCodeFromURL(){
    try{
      var h = (window.location.hash || '').replace(/^#/, '');
      var m = /(?:^|&)(?:sync|trip)=([A-Za-z0-9-]{4,24})/.exec(h);
      return m ? m[1].toUpperCase() : null;
    } catch(err){ return null; }
  }
  function writeSyncCodeToURL(code){
    try{
      if (code) window.location.replace('#sync=' + code);
      else if (window.location.hash) window.location.replace('#');
    } catch(err){ /* some embedded webviews block hash writes — harmless */ }
  }
  function syncShareLink(){
    if (!firebaseSyncCode) return '';
    try{
      return window.location.origin + window.location.pathname + '#sync=' + firebaseSyncCode;
    } catch(err){ return '#sync=' + firebaseSyncCode; }
  }

  function loadFirebaseSettingsFromStorage(){
    try{
      var cfgRaw = localStorage.getItem(FIREBASE_CONFIG_KEY);
      if (cfgRaw) firebaseSavedConfigText = cfgRaw;
      var code = localStorage.getItem(FIREBASE_SYNCCODE_KEY);
      if (code) firebaseSyncCode = code;
    } catch(err){ /* storage unavailable on this device */ }
  }

  function initFirebaseIfConfigured(){
    loadFirebaseSettingsFromStorage();
    // a code in the link always wins — that is how a shared link is meant to
    // hand this device the right trip, even over whatever it synced last.
    var urlCode = syncCodeFromURL();
    var code = urlCode || firebaseSyncCode;
    if (!code) return;
    connectFirebase(activeFirebaseConfigText(), code, true);
  }

  function connectFirebase(configText, code, isAutoStart){
    var cfg = parseFirebaseConfigText(configText);
    if (!cfg){
      firebaseSyncStatus = 'error';
      firebaseSyncError = '呢個 Firebase 設定睇落唔完整（起碼要有 apiKey 同 projectId）。';
      if (!isAutoStart) renderModalOnly();
      return;
    }
    if (typeof firebase === 'undefined'){
      firebaseSyncStatus = 'error';
      firebaseSyncError = 'Firebase 函式庫未能載入（可能係網絡問題），請檢查網絡後再試。';
      if (!isAutoStart) renderModalOnly();
      return;
    }
    try{
      firebaseApp = (firebase.apps && firebase.apps.length) ? firebase.apps[0] : firebase.initializeApp(cfg);
      firebaseDb = firebase.firestore();
      // set every piece of state BEFORE the render call below — rendering
      // with the sync code still unset was the bug: the modal fell through
      // to its "not connected yet" branch and looked like the click did
      // nothing at all, even on a fully successful connection.
      firebaseSyncCode = code;
      firebaseSyncStatus = 'connecting';
      firebaseSyncError = '';
      try{
        // only persist a config the user actually supplied — storing the
        // built-in one would freeze this device on today's copy of it
        if (firebaseSavedConfigText) localStorage.setItem(FIREBASE_CONFIG_KEY, configText);
        localStorage.setItem(FIREBASE_SYNCCODE_KEY, code);
      } catch(err){ /* storage unavailable — the link still carries the code */ }
      writeSyncCodeToURL(code);
      subscribeFirebaseDoc();
      if (!isAutoStart) renderModalOnly();
    } catch(err){
      firebaseSyncStatus = 'error';
      firebaseSyncError = '連接 Firebase 失敗：' + (err && err.message ? err.message : '未知錯誤');
      if (!isAutoStart) renderModalOnly();
    }
  }

  function subscribeFirebaseDoc(){
    if (!firebaseDb || !firebaseSyncCode) return;
    if (firebaseUnsub){ firebaseUnsub(); firebaseUnsub = null; }
    var docRef = firebaseDb.collection('tripwallet_sync').doc(firebaseSyncCode);
    firebaseUnsub = docRef.onSnapshot(function(snap){
      firebaseSyncStatus = 'on';
      firebaseSyncError = '';
      if (snap.metadata.hasPendingWrites){ render(); return; } // echo of our own optimistic write
      var data = snap.data();
      if (!data || !data.appState || data.updatedAt === firebaseLastPushedStamp){ render(); return; }
      try{
        applyPersistedState(JSON.parse(data.appState));
        firebaseLastSyncedAt = data.updatedAt;
      } catch(err){ /* malformed remote snapshot — ignore this update */ }
      render();
    }, function(err){
      firebaseSyncStatus = 'error';
      firebaseSyncError = '同步連線中斷：' + (err && err.message ? err.message : '未知錯誤');
      render();
    });
  }

  function scheduleFirebasePush(){
    if (firebaseSyncStatus !== 'on' && firebaseSyncStatus !== 'connecting') return;
    if (!firebaseDb || !firebaseSyncCode) return;
    if (firebasePushTimer) clearTimeout(firebasePushTimer);
    firebasePushTimer = setTimeout(function(){ firebasePushTimer = null; pushFirebaseNow(); }, 900);
  }

  function pushFirebaseNow(){
    if (!firebaseDb || !firebaseSyncCode) return;
    try{
      var stamp = Date.now();
      firebaseLastPushedStamp = stamp;
      var payload = { appState: JSON.stringify(serializeAppState()), updatedAt: stamp };
      firebaseDb.collection('tripwallet_sync').doc(firebaseSyncCode).set(payload).then(function(){
        firebaseLastSyncedAt = stamp;
        renderModalOnly();
      }).catch(function(err){
        firebaseSyncStatus = 'error';
        firebaseSyncError = '同步失敗：' + (err && err.message ? err.message : '未知錯誤');
        render();
      });
    } catch(err){
      // a SYNCHRONOUS throw here (e.g. malformed Firestore call) used to abort
      // the whole click handler silently, which is exactly what looked like
      // "clicking the button does nothing" — always surface it now instead.
      firebaseSyncStatus = 'error';
      firebaseSyncError = '同步失敗：' + (err && err.message ? err.message : '未知錯誤');
      render();
    }
  }

  function generateSyncCode(){
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
    var out = '';
    for (var i=0;i<8;i++) out += chars[Math.floor(Math.random()*chars.length)];
    return out.slice(0,4) + '-' + out.slice(4);
  }

  function stopFirebaseSync(){
    if (firebaseUnsub){ firebaseUnsub(); firebaseUnsub = null; }
    firebaseSyncStatus = 'off';
    firebaseSyncCode = null;
    try{ localStorage.removeItem(FIREBASE_SYNCCODE_KEY); } catch(err){}
    writeSyncCodeToURL(null);
    render();
  }

  var syncDraft;
  function freshSyncDraft(){ return { configText: firebaseSavedConfigText || '', joinCode: '', showAdvanced: false, copied: false }; }

  function renderSyncModal(){
    if (!syncDraft) syncDraft = freshSyncDraft();
    var d = syncDraft;
    var statusLabel = {off:'未開啟', connecting:'連接緊...', on:'同步中 ✓', error:'連接失敗'}[firebaseSyncStatus];
    var html = '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">多裝置同步</div>';

    // ----- advanced: bring your own Firebase project (optional) -----
    if (d.showAdvanced){
      return html +
        '<div style="font-size:12.5px;color:var(--muted);margin:-6px 0 16px 0;">預設已經用咗一個內置嘅資料庫，唔使自己設定。如果你想改用自己嘅 Firebase 專案，先喺下面貼低個 firebaseConfig。</div>' +
        '<div class="field"><label>你嘅 Firebase 設定（Firebase Console → 專案設定 → 網頁 App）</label><textarea id="sync-config" rows="6" placeholder=\'{ apiKey: "...", projectId: "...", ... }\'>'+(d.configText||'')+'</textarea></div>' +
        '<button type="button" class="btn-primary" style="width:100%;margin-bottom:10px;" data-action="saveFirebaseConfig">儲存並改用自己嘅專案</button>' +
        (firebaseSavedConfigText ? '<button type="button" class="btn-secondary" style="width:100%;margin-bottom:14px;" data-action="resetFirebaseConfig">改返用內置資料庫</button>' : '') +
        '<div class="modal-actions"><button class="btn-secondary" data-action="hideSyncAdvanced" style="width:100%;">返回</button></div>';
    }

    // ----- connected -----
    if (firebaseSyncCode && (firebaseSyncStatus==='on' || firebaseSyncStatus==='connecting')){
      var link = syncShareLink();
      return html +
        '<div class="hint" style="color:var(--muted);margin:-6px 0 14px 0;">狀態：'+statusLabel+(firebaseSyncError?'　'+firebaseSyncError:'')+'</div>' +
        '<div class="field"><label>你嘅同步代碼</label><input type="text" id="sync-code-display" value="'+firebaseSyncCode+'" readonly style="font-weight:700;letter-spacing:0.08em;text-align:center;font-size:17px;"></div>' +
        '<div class="field"><label>同步連結（喺其他裝置開呢條link就自動連返同一份資料，無痕視窗都用得）</label><input type="text" id="sync-share-link" value="'+link+'" readonly style="font-size:12px;"></div>' +
        '<button type="button" class="btn-primary" style="width:100%;margin-bottom:10px;" data-action="copySyncLink">'+(d.copied?'已複製 ✓':'複製同步連結')+'</button>' +
        (firebaseLastSyncedAt ? '<div class="hint" style="color:var(--muted);margin:0 0 12px 0;">上次同步：'+new Date(firebaseLastSyncedAt).toLocaleString('zh-HK')+'</div>' : '') +
        '<div class="scan-guess-hint" style="color:var(--muted);background:var(--surface-2);">⚠️ 揸住呢條連結／代碼就可以讀寫呢份資料（冇密碼保護），淨係傳俾自己人。</div>' +
        '<button type="button" class="btn-secondary" style="width:100%;margin-bottom:10px;" data-action="manualFirebasePush">立即手動同步</button>' +
        '<button type="button" class="btn-secondary" style="width:100%;margin-bottom:10px;color:var(--negative);" data-action="stopFirebaseSyncAction">停止呢部裝置嘅同步</button>' +
        '<button type="button" class="link-btn" style="margin-bottom:14px;" data-action="showSyncAdvanced">進階：用自己嘅 Firebase 專案</button>' +
        '<div class="modal-actions"><button class="btn-primary" data-action="closeModal" style="width:100%;">完成</button></div>';
    }

    // ----- not connected yet: zero setup needed -----
    return html +
      '<div style="font-size:12.5px;color:var(--muted);margin:-6px 0 16px 0;">開一次就得，唔使註冊、唔使設定。開咗之後你會收到一條同步連結，喺其他裝置開嗰條link就自動見到同一份資料。</div>' +
      (firebaseSyncStatus==='error' ? '<div class="scan-guess-hint">狀態：'+statusLabel+'　'+firebaseSyncError+'</div>' : '') +
      '<button type="button" class="btn-primary" style="width:100%;margin-bottom:18px;" data-action="createSyncCode">開始同步（用呢部裝置嘅資料）</button>' +
      '<div class="field"><label>或者輸入其他裝置嘅同步代碼（會攞返嗰邊嘅資料，覆蓋呢部裝置依家嘅資料）</label><input type="text" id="sync-join-code" value="'+(d.joinCode||'')+'" placeholder="例如：A1B2-C3D4"></div>' +
      '<button type="button" class="btn-secondary" style="width:100%;margin-bottom:12px;" data-action="joinSyncCode">加入同步</button>' +
      '<button type="button" class="link-btn" style="margin-bottom:14px;" data-action="showSyncAdvanced">進階：用自己嘅 Firebase 專案</button>' +
      '<div class="modal-actions"><button class="btn-secondary" data-action="closeModal" style="width:100%;">取消</button></div>';
  }

  function renderTopbar(){
    var started = isTripStarted();
    var banner = readOnlyMode ? '<div class="readonly-banner">'+icon('chevronRight',14,'var(--accent-deep)')+'呢個連結係唯讀 — 你嘅改動只會存喺呢部機。請向擁有者要求編輯權限。</div>' : '';
    return '' +
      banner +
      '<div class="topbar">' +
        '<div class="trip-title-row">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<button class="link-btn" data-action="goHome" title="返回旅程列表" style="padding:4px 2px 4px 0;">'+icon('chevronLeft',18,'var(--ink)')+'</button>' +
            '<h1 style="font-size:22px;">'+trip.name+'</h1>' +
          '</div>' +
          '<span class="status-pill">'+(started ? '旅行中' : '籌備中')+'</span>' +
        '</div>' +
        '<div class="trip-sub">'+trip.country+' · '+formatRange()+' · '+trip.stats.days+' 日 · '+members.length+' 位旅伴</div>' +
      '</div>';
  }

  function formatRange(){ return formatRangeFor(trip); }
  function formatRangeFor(t){
    function d(s){ var p=s.split('-'); return p[0]+'年'+parseInt(p[1],10)+'月'+parseInt(p[2],10)+'日'; }
    return d(t.start) + ' — ' + t.end.split('-')[1]+'月'+parseInt(t.end.split('-')[2],10)+'日';
  }
  function tripIsStartedFor(t){
    var today = new Date().toISOString().slice(0,10);
    return today >= t.start;
  }

  function renderTabs(){
    function t(key,label){ return '<button class="tab-btn '+(state.tab===key?'active':'')+'" data-action="setTab" data-key="'+key+'">'+label+'</button>'; }
    return '<div class="tabs">'+t('dashboard','總覽')+t('itinerary','行程')+t('shopping','購物清單')+t('expenses','支出')+'</div>';
  }

  function renderStickyNone(){ return ''; }

  // ---------- render: trips home ----------

  function renderTripsHome(){
    var html = '<div class="home-shell">' +
      '<div class="home-header" style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">' +
        '<div><h1>我的旅程</h1><p class="home-sub">揀一個旅程繼續籌備，或者開始下一次旅行</p></div>' +
        '<button class="link-btn" data-action="openSync" style="display:flex;align-items:center;gap:5px;white-space:nowrap;flex:none;margin-top:4px;">'+icon('cloud',17)+(firebaseSyncStatus==='on'?'同步中':'多裝置同步')+'</button>' +
      '</div>' +
      '<div class="trip-card-list">';
    html += tripsStore.map(function(b){
      var t = b.trip;
      var started = tripIsStartedFor(t);
      return '<div class="trip-card" data-action="openTrip" data-id="'+b.id+'">' +
        '<div class="trip-card-cover" style="'+tripCoverBackgroundCSS(t)+'">' +
          '<button class="trip-card-cover-edit" data-action="openEditTripCover" data-id="'+b.id+'" title="換個封面相">'+icon('camera',15,'#F7F6F2')+'</button>' +
          '<button class="trip-card-delete" data-action="deleteTrip" data-id="'+b.id+'" title="刪除呢個旅程">'+icon('trash',15,'#F7F6F2')+'</button>' +
          '<span class="trip-card-status">'+(started ? '旅行中' : '籌備中')+'</span>' +
          '<h2>'+t.name+'</h2>' +
        '</div>' +
        '<div class="trip-card-meta"><span>'+(t.country||'')+'</span><span class="dot">·</span><span>'+formatRangeFor(t)+'</span><span class="dot">·</span><span>'+b.members.length+' 位旅伴</span></div>' +
      '</div>';
    }).join('');
    html += '</div>';
    if (!tripsStore.length){ html += emptyState('仲未有任何旅程。', '撳下面個掣開始籌備你嘅第一次旅行。', null, null); }
    html += '<button class="home-add-btn" data-action="openCreateTrip">'+icon('plus',17,'#fff')+'新增旅程</button>';
    html += '</div>';
    return html;
  }

  var createTripDraft;
  function freshCreateTripDraft(){
    return { name:'', country:'', start:'', end:'', memberNames:'你', memberBudgets:{} };
  }
  function createTripMemberNames(d){
    var names = d.memberNames.split(/[,，]/).map(function(s){ return s.trim(); }).filter(Boolean);
    if (!names.length) names = ['你'];
    return names;
  }
  function createTripBudgetRowsHTML(d){
    return createTripMemberNames(d).map(function(n,i){
      var v = d.memberBudgets[i]!==undefined ? d.memberBudgets[i] : '';
      return '<div class="split-row"><div style="flex:1;font-size:13px;">'+n+'</div><input type="number" data-role="ctMemberBudget" data-idx="'+i+'" value="'+v+'" placeholder="0"></div>';
    }).join('');
  }
  function renderCreateTripModal(){
    if (!createTripDraft) createTripDraft = freshCreateTripDraft();
    var d = createTripDraft;
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">新增旅程</div>' +
      '<div class="field"><label>目的地</label><input type="text" id="ct-name" value="'+d.name+'" placeholder="例如：大阪"></div>' +
      '<div class="field"><label>國家 / 地區</label><input type="text" id="ct-country" value="'+d.country+'" placeholder="例如：日本"></div>' +
      '<div class="row-2">' +
        '<div class="field"><label>開始日期</label><input type="date" id="ct-start" value="'+d.start+'"></div>' +
        '<div class="field"><label>結束日期</label><input type="date" id="ct-end" value="'+d.end+'"></div>' +
      '</div>' +
      '<div class="field"><label>團員（用逗號分隔）</label><input type="text" id="ct-members" value="'+d.memberNames+'" placeholder="你, Alex, Chris"></div>' +
      '<div class="field"><label>每人預算（HK$，每位團員可以唔同，optional）</label><div id="ct-budget-rows">'+createTripBudgetRowsHTML(d)+'</div></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="submitCreateTrip">建立旅程</button>' +
      '</div>';
  }
  function syncCreateTripDraftFromDOM(){
    var d = createTripDraft;
    var g = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
    d.name = g('ct-name'); d.country = g('ct-country'); d.start = g('ct-start'); d.end = g('ct-end');
    d.memberNames = g('ct-members');
  }
  function submitCreateTrip(){
    syncCreateTripDraftFromDOM();
    var d = createTripDraft;
    if (!d.name || !d.start || !d.end){ showAlert('請輸入目的地同旅程日期。'); return; }
    var names = createTripMemberNames(d);
    var budgetInputs = document.querySelectorAll('[data-role="ctMemberBudget"]');
    var budgetsByIdx = {};
    for (var bi=0; bi<budgetInputs.length; bi++){ budgetsByIdx[budgetInputs[bi].getAttribute('data-idx')] = budgetInputs[bi].value; }
    var newMembers = names.map(function(n, i){
      return { id:'m'+nextId(''), name:n, color:AVATAR_COLORS[i % AVATAR_COLORS.length], avatarEmoji:null, avatarPhoto:null, budget:Number(budgetsByIdx[i])||0 };
    });
    var totalBudget = newMembers.reduce(function(s,m){ return s+m.budget; }, 0);
    var dayCount = Math.max(1, Math.round((new Date(d.end) - new Date(d.start)) / 86400000) + 1);
    var newDays = [];
    for (var i=0;i<dayCount;i++){
      var dt = new Date(d.start); dt.setDate(dt.getDate()+i);
      newDays.push({ date: dt.toISOString().slice(0,10), items:[] });
    }
    var newTrip = {
      theme: tripsStore.length % THEME_GRADIENTS.length,
      coverPhoto: null,
      coverColor: null,
      name: d.name, country: d.country, start: d.start, end: d.end, budget: totalBudget,
      stats:{days:dayCount, attractions:0, bookings:0, savedPlaces:0},
      todayPlan:[], nextItem:{time:'--:--', title:'未有安排', distance:'—'},
      staticChecklist:[{label:'航班', done:false},{label:'酒店', done:false},{label:'餐廳預訂', done:false},{label:'行李清單', done:false}],
      leaderboardEnabled:true,
      hotels:[],
      regions:[{name:'市中心', loc:{x:50,y:50}}],
      days:newDays
    };
    // no viewer picked yet for this brand-new trip — the "揀返你自己" prompt
    // fires the moment we enter it (same as any pre-existing trip that has
    // never had a viewer chosen), scoped to just this trip's own member list.
    var newBundle = { id:'t'+nextId(''), trip:newTrip, members:newMembers, expenses:[], shoppingItems:[], candidatePlaces:[], shopCategoryOrder:['必需品','衣物','藥物','食物','旅程用品'], viewerId:null, archivedMembers:{} };
    tripsStore.push(newBundle);
    loadTripIntoGlobals(newBundle.id);
    state.screen = 'trip'; state.tab = 'dashboard'; state.itineraryDayIndex = 0;
    createTripDraft = null;
    markDirty();
    if (!viewerId || !memberExists(viewerId)) openModal('pickViewer', {mustPick:true});
    else closeModal();
  }

  // ---------- member avatar customization ----------

  var editMemberDraft;
  function renderEditMemberModal(memberId){
    var m = findMember(memberId);
    if (!editMemberDraft || editMemberDraft.id !== memberId){
      editMemberDraft = { id:memberId, emoji:m.avatarEmoji, color:m.color, photo:m.avatarPhoto||null, budget: (m.budget!==undefined && m.budget!==null) ? m.budget : '' };
    }
    var d = editMemberDraft;
    var previewMember = { id:'preview', name:m.name, color:d.color, avatarEmoji:d.emoji, avatarPhoto:d.photo };
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">自訂 '+m.name+' 嘅圖示</div>' +
      '<div class="avatar-preview-row">'+avatarPreviewHTML(previewMember)+'</div>' +
      '<div class="field"><label>上載自己嘅相片（optional）</label><input type="file" id="em-photo" accept="image/*"></div>' +
      (d.photo ? '<button type="button" class="btn-secondary" style="width:100%;margin-bottom:14px;" data-action="clearMemberPhoto">移除相片</button>' : '') +
      '<div class="field"><label>顏色</label><div class="color-swatch-row">' +
        AVATAR_COLORS.map(function(c){ return '<div class="color-swatch '+(d.color===c?'selected':'')+'" style="background:'+c+';" data-action="setMemberColor" data-color="'+c+'"></div>'; }).join('') +
      '</div></div>' +
      '<div class="field"><label>表情符號（optional，冇上載相片先會顯示；會擺喺你揀嘅顏色底上）</label><div class="emoji-grid">' +
        AVATAR_EMOJI_CHOICES.map(function(e){ return '<div class="emoji-opt '+(d.emoji===e?'selected':'')+'" data-action="setMemberEmoji" data-emoji="'+e+'">'+e+'</div>'; }).join('') +
      '</div></div>' +
      '<div class="field"><label>個人預算（HK$，optional）</label><input type="number" id="em-budget" value="'+d.budget+'" placeholder="0"></div>' +
      '<button type="button" class="btn-secondary" style="width:100%;margin-bottom:14px;color:var(--negative);" data-action="deleteMember" data-id="'+m.id+'">剷除呢位團員</button>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="clearMemberEmoji">移除表情符號</button>' +
        '<button class="btn-primary" data-action="submitEditMember">儲存</button>' +
      '</div>';
  }
  function avatarPreviewHTML(m){
    if (m.avatarPhoto){
      return '<div class="avatar" style="width:64px;height:64px;background:'+m.color+';padding:0;overflow:hidden;"><img src="'+m.avatarPhoto+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></div>';
    }
    var content = m.avatarEmoji ? m.avatarEmoji : initials(m.name);
    var bg = m.color;
    return '<div class="avatar" style="width:64px;height:64px;font-size:'+(m.avatarEmoji?'30':'20')+'px;background:'+bg+';">'+content+'</div>';
  }
  // reads an uploaded photo, crops it to a square and downsizes it so the
  // shared/published state stays small — this all happens locally in the
  // browser (FileReader + canvas), no upload to any server involved.
  function readAndResizeImageFile(file, callback, opts){
    // opts lets a caller ask for a non-square crop (e.g. a wide trip-cover
    // banner) instead of the default square avatar thumbnail — omitting it
    // keeps the original 128x128 centre-crop behaviour unchanged.
    opts = opts || {};
    var W = opts.width || 128, H = opts.height || W;
    var quality = opts.quality || 0.72;
    if (!file || !window.FileReader){ showAlert('呢部裝置未能讀取相片。'); return; }
    var reader = new FileReader();
    reader.onload = function(ev){
      var img = new Image();
      img.onload = function(){
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        var ctx = canvas.getContext('2d');
        // centre-crop the source to match the target aspect ratio, then scale to fit
        var targetRatio = W / H, srcRatio = img.width / img.height;
        var sx, sy, sw, sh;
        if (srcRatio > targetRatio){ sh = img.height; sw = sh * targetRatio; sx = (img.width - sw)/2; sy = 0; }
        else { sw = img.width; sh = sw / targetRatio; sx = 0; sy = (img.height - sh)/2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
        var dataUrl;
        try { dataUrl = canvas.toDataURL('image/jpeg', quality); }
        catch(err){ showAlert('呢張相未能處理，請試試另一張。'); return; }
        callback(dataUrl);
      };
      img.onerror = function(){ showAlert('呢張相未能讀取，請試試另一張。'); };
      img.src = ev.target.result;
    };
    reader.onerror = function(){ showAlert('讀取檔案失敗，請再試一次。'); };
    reader.readAsDataURL(file);
  }
  // reads a photo for OCR scanning WITHOUT cropping it (unlike the avatar/cover
  // helper above) — only downscales if it's larger than maxDim, so no text
  // near the edges of a booking screenshot/receipt gets cut off.
  function readImageFileForOCR(file, callback, maxDim){
    maxDim = maxDim || 1600;
    if (!file || !window.FileReader){ showAlert('呢部裝置未能讀取相片。'); return; }
    var reader = new FileReader();
    reader.onload = function(ev){
      var img = new Image();
      img.onload = function(){
        var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var dataUrl;
        try { dataUrl = canvas.toDataURL('image/jpeg', 0.92); }
        catch(err){ showAlert('呢張相未能處理，請試試另一張。'); return; }
        callback(dataUrl);
      };
      img.onerror = function(){ showAlert('呢張相未能讀取，請試試另一張。'); };
      img.src = ev.target.result;
    };
    reader.onerror = function(){ showAlert('讀取檔案失敗，請再試一次。'); };
    reader.readAsDataURL(file);
  }
  function submitEditMember(){
    var m = findMember(editMemberDraft.id);
    var budgetEl = document.getElementById('em-budget');
    if (budgetEl) editMemberDraft.budget = budgetEl.value;
    m.color = editMemberDraft.color;
    m.avatarEmoji = editMemberDraft.emoji;
    m.avatarPhoto = editMemberDraft.photo || null;
    m.budget = Number(editMemberDraft.budget)||0;
    editMemberDraft = null;
    markDirty();
    closeModal();
  }

  var addMemberDraft;
  function freshAddMemberDraft(){ return { name:'', color: AVATAR_COLORS[members.length % AVATAR_COLORS.length], emoji:null, photo:null, budget:'', becomeViewer:false }; }
  function renderAddMemberModal(){
    if (!addMemberDraft) addMemberDraft = freshAddMemberDraft();
    var d = addMemberDraft;
    var previewMember = { id:'preview', name:d.name||'新團員', color:d.color, avatarEmoji:d.emoji, avatarPhoto:d.photo };
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">'+(d.becomeViewer ? '新增自己' : '加入團員')+'</div>' +
      '<div class="avatar-preview-row">'+avatarPreviewHTML(previewMember)+'</div>' +
      '<div class="field"><label>名稱</label><input type="text" id="am-name" value="'+d.name+'" placeholder="例如：Jamie"></div>' +
      '<div class="field"><label>上載自己嘅相片（optional）</label><input type="file" id="am-photo" accept="image/*"></div>' +
      (d.photo ? '<button type="button" class="btn-secondary" style="width:100%;margin-bottom:14px;" data-action="clearNewMemberPhoto">移除相片</button>' : '') +
      '<div class="field"><label>顏色</label><div class="color-swatch-row">' +
        AVATAR_COLORS.map(function(c){ return '<div class="color-swatch '+(d.color===c?'selected':'')+'" style="background:'+c+';" data-action="setNewMemberColor" data-color="'+c+'"></div>'; }).join('') +
      '</div></div>' +
      '<div class="field"><label>表情符號（optional，冇上載相片先會顯示）</label><div class="emoji-grid">' +
        AVATAR_EMOJI_CHOICES.map(function(e){ return '<div class="emoji-opt '+(d.emoji===e?'selected':'')+'" data-action="setNewMemberEmoji" data-emoji="'+e+'">'+e+'</div>'; }).join('') +
      '</div></div>' +
      '<div class="field"><label>個人預算（HK$，optional）</label><input type="number" id="am-budget" value="'+d.budget+'" placeholder="0"></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="submitAddMember">加入</button>' +
      '</div>';
  }
  function syncAddMemberDraftFromDOM(){
    var n = document.getElementById('am-name'); if (n) addMemberDraft.name = n.value;
    var b = document.getElementById('am-budget'); if (b) addMemberDraft.budget = b.value;
  }
  function submitAddMember(){
    syncAddMemberDraftFromDOM();
    var d = addMemberDraft;
    if (!d.name){ showAlert('請輸入名稱。'); return; }
    var newMember = { id:'m'+nextId(''), name:d.name, color:d.color, avatarEmoji:d.emoji, avatarPhoto:d.photo||null, budget:Number(d.budget)||0 };
    members.push(newMember);
    if (d.becomeViewer) viewerId = newMember.id;
    addMemberDraft = null;
    markDirty();
    closeModal();
  }

  // ---------- "which member are you?" — picked per trip, so switching trips
  // (or a trip whose member list is different) always asks again if unset ----------

  function renderPickViewerModal(payload){
    var mustPick = !!(payload && payload.mustPick);
    return '' +
      '<div class="sheet-handle"></div>' +
      (mustPick ? '' : '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>') +
      '<div class="sheet-title">你係邊位？</div>' +
      '<div class="hint" style="color:var(--muted);margin:-8px 0 14px 0;">呢個係呢個旅程入面嘅團員名單 —— 揀返你自己，就可以睇返你嘅個人預算同結餘。</div>' +
      '<div class="member-pick" style="flex-direction:column;gap:8px;">' +
        members.map(function(m){
          return '<div class="member-chip '+(viewerId===m.id?'selected':'')+'" style="justify-content:flex-start;padding:10px 14px;" data-action="selectViewer" data-id="'+m.id+'">'+avatarHTML(m.id)+'<span style="font-size:14px;">'+m.name+'</span></div>';
        }).join('') +
      '</div>' +
      '<button type="button" class="btn-secondary" style="width:100%;margin-top:14px;" data-action="openAddMemberFromPicker">＋ 我唔喺呢度，新增自己</button>' +
      (mustPick ? '' : '<div class="modal-actions" style="margin-top:14px;"><button class="btn-secondary" data-action="closeModal">取消</button></div>');
  }

  // ---------- render: dashboard ----------

  var CAT_COLORS = ['#556052','#B8763F','#6E4C9A','#3D5F6E','#8C6B54','#4C7A94','#9C5B6B'];

  function renderDashboard(){
    var started = isTripStarted();
    var spend = totalSpend();
    var remaining = trip.budget - spend;
    var cats = categoryBreakdown();
    var maxCat = cats.length ? cats[0].amount : 1;
    var bal = balances();
    var plan = settlementPlan();
    var shop = shoppingStats();
    var checklistRows = trip.staticChecklist.map(function(c,idx){ return {label:c.label, done:c.done, staticIdx:idx}; }).concat(computeItineraryChecklistRows());
    var progressDone = checklistRows.filter(function(c){ return c.done; }).length;
    var progressPct = Math.round(progressDone / checklistRows.length * 100);

    var html = '';

    // hero
    var viewerMember = (viewerId && memberExists(viewerId)) ? findMember(viewerId) : null;
    html += '<div class="dash-hero" style="'+tripCoverBackgroundCSS(trip)+'">' +
      '<div class="dash-hero-top">' +
        '<button class="back-btn" data-action="goHome" title="返回旅程列表">'+icon('chevronLeft',20,'#F7F6F2')+'</button>' +
        '<button class="status-pill" style="border:none;cursor:pointer;" data-action="openPickViewer" title="轉換身份">'+(viewerMember?('你係 '+viewerMember.name+' · 轉換'):'揀返你自己')+'</button>' +
        '<span class="status-pill">'+(started ? '旅行中' : '籌備中')+'</span>' +
      '</div>' +
      '<h1>'+trip.name+'</h1>' +
      '<div class="dash-hero-sub">'+trip.country+' · '+formatRange()+' · '+members.length+' 位旅伴</div>' +
      '<div class="dash-hero-progress">' +
        '<div class="dash-hero-progress-row"><span>旅程進度</span><b class="num">'+progressPct+'%</b></div>' +
        '<div class="progress-track"><div class="progress-fill" style="width:'+progressPct+'%;"></div></div>' +
      '</div>' +
    '</div>';

    // lean stats row — shows the viewer's own personal budget/remaining when
    // one has been picked, since everyone's personal budget can differ,
    // rather than only the whole-group total.
    var viewerBudget = viewerMember ? (viewerMember.budget||0) : trip.budget;
    var viewerRemaining = viewerMember ? (viewerBudget - memberSpendShare(viewerMember.id)) : remaining;
    html += '<div class="section">' +
      '<div class="stat-row-lean">' +
        leanStat(trip.stats.days+' 日', '旅程') +
        leanStat(members.length+' 人', '團員') +
        leanStat(fmt(viewerBudget), viewerMember?'你嘅預算':'預算', true) +
        leanStat(fmt(viewerRemaining), viewerMember?'你剩餘':'剩餘', true) +
      '</div>' +
    '</div>';

    // accommodation — small section, supports multiple hotel/stay entries for
    // multi-city trips
    var hotels = trip.hotels || [];
    html += '<div class="section">' +
      '<div class="section-title"><h2>住宿</h2><button class="link-btn" data-action="openAddHotel">＋新增酒店</button></div>' +
      (hotels.length ?
        '<div class="card" style="padding:6px 14px;">' +
        hotels.map(function(h, hIdx){
          return '<div class="checklist-row" style="cursor:pointer;align-items:flex-start;padding:10px 0;" data-action="openEditHotel" data-id="'+h.id+'">' +
            '<div style="margin-top:1px;">'+icon('calendar',16,'#8B877E')+'</div>' +
            '<div style="flex:1;">' +
              '<div style="font-size:13.5px;font-weight:600;">'+h.name+'</div>' +
              '<div style="font-size:11.5px;color:var(--muted);margin-top:2px;" class="num">'+(h.checkIn||'—')+' → '+(h.checkOut||'—')+'</div>' +
              (h.notes ? ('<div style="font-size:11.5px;color:var(--muted);margin-top:1px;">'+h.notes+'</div>') : '') +
            '</div>' +
          '</div>' + (hIdx < hotels.length-1 ? '<div style="height:1px;background:var(--line);"></div>' : '');
        }).join('') +
        '</div>'
        : '<div class="card" style="padding:16px;font-size:12.5px;color:var(--muted);">未有酒店紀錄，撳右上角新增。</div>') +
    '</div>';

    // trip progress checklist
    html += '<div class="section">' +
      '<div class="section-title"><h2>準備清單</h2></div>' +
      '<div class="card" style="padding:6px 14px;">' +
      checklistRows.map(function(c){
        var clickable = c.staticIdx!==undefined;
        return '<div class="checklist-row '+(c.done?'done':'')+'" '+(clickable?('data-action="toggleStaticChecklist" data-idx="'+c.staticIdx+'" style="cursor:pointer;"'):'')+'>' + icon(c.done?'check':'chevronRight', 16, c.done? '#3F7D57':'#B4B0A6') + '<span>'+c.label+'</span></div>';
      }).join('<div style="height:1px;background:var(--line);"></div>') +
      '</div>' +
    '</div>';

    // today / next
    html += '<div class="section">';
    if (started){
      html += '<div class="section-title"><h2>今日</h2></div>' +
        '<div class="card" style="padding:14px;">' +
        trip.todayPlan.map(function(p,idx){
          return '<div style="display:flex;gap:12px;align-items:center;padding:'+(idx===0?'0':'10px')+' 0 10px 0;">' +
            '<div class="num" style="font-size:12.5px;color:var(--muted);width:42px;">'+p.time+'</div>' +
            '<div style="font-size:13.5px;font-weight:600;">'+p.title+'</div>' +
          '</div>';
        }).join('') +
        '</div>' +
        '<div class="section-title" style="margin-top:18px;"><h2>下一項</h2></div>' +
        '<div class="card" style="padding:14px;display:flex;align-items:center;gap:12px;background:var(--accent-deep);border:none;">' +
          '<div class="num" style="color:#EDEDE6;font-size:13px;font-weight:700;">'+trip.nextItem.time+'</div>' +
          '<div style="width:1px;height:26px;background:rgba(255,255,255,0.25);"></div>' +
          '<div style="flex:1;"><div style="color:#F7F6F2;font-size:14.5px;font-weight:700;">'+trip.nextItem.title+'</div><div style="color:#C9D2C4;font-size:11.5px;margin-top:2px;">距離 '+trip.nextItem.distance+'</div></div>' +
        '</div>';
    } else {
      var nextTask = checklistRows.filter(function(c){ return !c.done; })[0];
      html += '<div class="section-title"><h2>下一步</h2></div>' +
        '<div class="card" style="padding:16px;">' +
          '<div style="font-size:14.5px;font-weight:700;margin-bottom:4px;">'+(nextTask?('完成'+nextTask.label):'旅程已準備就緒')+'</div>' +
          '<div style="font-size:12.5px;color:var(--muted);">還有 '+daysUntilStart()+' 日出發</div>' +
        '</div>';
    }
    html += '<div class="toggle-row"><span>預覽「旅程進行中」畫面（示範用）</span>' +
      '<div class="switch '+(started?'on':'')+'" data-action="toggleDemoStarted"><div class="knob"></div></div></div>';
    html += '</div>';

    // spending summary — one segmented bar instead of per-category rows
    var catTotal = cats.reduce(function(s,c){ return s+c.amount; }, 0) || 1;
    html += '<div class="section">' +
      '<div class="section-title"><h2>旅程支出</h2></div>' +
      '<div class="card" style="padding:18px;">' +
        '<div class="money-hero num">'+fmt(spend)+'</div>' +
        '<div style="font-size:12px;color:var(--muted);margin:4px 0 0 0;">預算 <span class="num">'+fmt(trip.budget)+'</span> · 剩餘 <span class="num" style="color:'+(remaining>=0?'var(--positive)':'var(--negative)')+';font-weight:700;">'+fmt(remaining)+'</span></div>' +
        '<div class="spend-bar-track">' +
          cats.map(function(c,idx){ return '<div class="spend-bar-seg" style="width:'+(c.amount/catTotal*100)+'%;background:'+CAT_COLORS[idx % CAT_COLORS.length]+';"></div>'; }).join('') +
        '</div>' +
        '<div class="spend-legend">' +
          cats.map(function(c,idx){ return '<div class="spend-legend-item"><span class="spend-legend-dot" style="background:'+CAT_COLORS[idx % CAT_COLORS.length]+';"></span>'+c.category+' · <span class="num">'+fmt(c.amount)+'</span></div>'; }).join('') +
        '</div>' +
      '</div>' +
    '</div>';

    // group balance
    html += '<div class="section">' +
      '<div class="section-title"><h2>團員結餘</h2><button class="link-btn" data-action="openAddMember">＋加入團員</button></div>' +
      '<div class="card" style="padding:6px 14px;">' +
      members.map(function(m){
        var b = Math.round(bal[m.id]||0);
        var pillClass = b>0.5 ? 'balance-pos' : (b<-0.5 ? 'balance-neg' : 'balance-zero');
        var pillLabel = b>0.5 ? ('應收 '+fmt(b)) : (b<-0.5 ? ('應付 '+fmt(-b)) : '已結清');
        var isViewer = viewerId===m.id;
        var memberRemaining = (m.budget||0) - memberSpendShare(m.id);
        return '<div class="balance-row">' +
          '<div class="avatar-editable" data-action="openEditMember" data-id="'+m.id+'">'+avatarHTML(m.id)+'</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:13.5px;font-weight:600;">'+m.name+(isViewer?' <span style="color:var(--accent);font-weight:700;">（你）</span>':'')+'</div>' +
            (m.budget ? ('<div style="font-size:10.5px;color:var(--muted);margin-top:1px;">預算 '+fmt(m.budget)+' · 剩餘 '+fmt(memberRemaining)+'</div>') : '') +
          '</div>' +
          '<div class="balance-pill '+pillClass+'">'+pillLabel+'</div>' +
        '</div>';
      }).join('') +
      '</div>' +
      renderSettlementHeadline(plan) +
      '<div style="text-align:right;margin-top:8px;"><button class="link-btn" data-action="setTab" data-key="expenses">查看結算</button></div>' +
    '</div>';

    // to buy summary
    html += '<div class="section">' +
      '<div class="section-title"><h2>待購買</h2><button class="link-btn" data-action="setTab" data-key="shopping">查看購物清單</button></div>' +
      '<div class="card" style="padding:16px;">' +
        '<div style="font-size:13px;color:var(--muted);margin-bottom:10px;">共 '+shop.total+' 項 · 已完成 '+shop.purchased+' 項</div>' +
        shoppingItems.slice(0,3).map(function(i){
          return '<div class="checklist-row '+(i.status==='purchased'?'done':'')+'">'+icon(i.status==='purchased'?'check':'chevronRight',16, i.status==='purchased'?'#3F7D57':'#B4B0A6')+'<span>'+i.name+'</span></div>';
        }).join('') +
      '</div>' +
    '</div>';

    // saved places
    html += '<div class="section">' +
      '<div class="section-title"><h2>已收藏</h2></div>' +
      '<div class="card" style="padding:16px;display:flex;align-items:center;justify-content:space-between;">' +
        '<div><div style="font-size:14.5px;font-weight:700;">'+trip.stats.savedPlaces+' 個地方</div><div style="font-size:11.5px;color:var(--muted);margin-top:2px;">餐廳、景點、咖啡店</div></div>' +
        icon('heart',20,'#B86B4B') +
      '</div>' +
    '</div>';

    // quick actions
    html += '<div class="section" style="padding-bottom:24px;">' +
      '<div class="section-title"><h2>快速操作</h2></div>' +
      '<div class="quick-actions">' +
        '<button class="qa-btn" data-action="openScan">'+icon('camera',16)+'AI 掃描新增</button>' +
        '<button class="qa-btn" data-action="openAddExpense">'+icon('plus',16)+'新增支出</button>' +
        '<button class="qa-btn" data-action="openAddShopping">'+icon('plus',16)+'新增購物項目</button>' +
        '<button class="qa-btn" data-action="openAddItineraryItem">'+icon('plus',16)+'新增行程</button>' +
        '<button class="qa-btn" data-action="openAddMember">'+icon('plus',16)+'加入團員</button>' +
        '<button class="qa-btn" data-action="exportTripSummary">'+icon('receipt',16)+'匯出行程總結</button>' +
        '<button class="qa-btn" data-action="openSync">'+icon('cloud',16)+(firebaseSyncStatus==='on'?'同步中':'多裝置同步')+'</button>' +
      '</div>' +
    '</div>';

    return html;
  }

  function stat(label, value){
    return '<div class="stat"><div class="stat-label">'+label+'</div><div class="stat-value num">'+value+'</div></div>';
  }

  function leanStat(value, label, isMoney){
    return '<div class="stat-lean"><div class="v num'+(isMoney?' money':'')+'">'+value+'</div><div class="l">'+label+'</div></div>';
  }

  function renderSettlementHeadline(plan){
    if (!plan.length) return '<div style="font-size:12px;color:var(--muted);margin-top:10px;">目前沒有需要結算的款項。</div>';
    var youPay = plan.filter(function(p){ return p.from==='you'; }).reduce(function(s,p){ return s+p.amount; },0);
    var youReceive = plan.filter(function(p){ return p.to==='you'; }).reduce(function(s,p){ return s+p.amount; },0);
    var line;
    if (youPay>0) line = '你應付 <b class="num">'+fmt(youPay)+'</b>';
    else if (youReceive>0) line = '你應收 <b class="num">'+fmt(youReceive)+'</b>';
    else line = '你已經結清';
    return '<div style="font-size:12.5px;color:var(--muted);margin-top:10px;">最終結算：'+line+'</div>';
  }

  // ---------- render: shopping ----------

  function renderShopping(){
    var stats = shoppingStats();
    var html = '';
    html += '<div class="section">' +
      '<div class="card" style="padding:16px;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:10px;">' +
          '<div><div style="font-size:12px;color:var(--muted);">購物進度</div><div style="font-size:15px;font-weight:700;" class="num">'+stats.purchased+' / '+stats.total+' 已完成</div></div>' +
          '<div style="text-align:right;"><div style="font-size:12px;color:var(--muted);">團員</div><div style="font-size:15px;font-weight:700;" class="num">'+members.length+' 人</div></div>' +
        '</div>' +
        '<div class="progress-track" style="margin-bottom:12px;"><div class="progress-fill" style="width:'+(stats.total ? Math.round(stats.purchased/stats.total*100) : 0)+'%;"></div></div>' +
        '<div style="display:flex;gap:18px;">' +
          '<div><div style="font-size:11px;color:var(--muted);">預計總額</div><div class="num" style="font-size:14px;font-weight:700;">'+fmt(stats.estimatedTotal)+'</div></div>' +
          '<div><div style="font-size:11px;color:var(--muted);">實際花費</div><div class="num" style="font-size:14px;font-weight:700;">'+fmt(stats.actualTotal)+'</div></div>' +
        '</div>' +
      '</div>' +
    '</div>';

    if (!shoppingItems.length){
      html += emptyState('暫時沒有需要購買的東西。', '一起準備這次旅程吧。', '＋ 新增項目', 'openAddShopping');
    } else {
      var byCat = {};
      shoppingItems.forEach(function(i){ (byCat[i.category] = byCat[i.category]||[]).push(i); });
      var cats = Object.keys(byCat).sort(function(a,b){
        var ai = shopCategoryOrder.indexOf(a), bi = shopCategoryOrder.indexOf(b);
        if (ai===-1) ai = 99; if (bi===-1) bi = 99;
        return ai-bi;
      });
      html += '<div class="section" style="padding-top:8px;">';
      cats.forEach(function(cat){
        html += '<div class="shop-cat-label">'+cat+'</div>';
        byCat[cat].forEach(function(item){
          html += renderShopItem(item);
        });
      });
      html += '</div>';
    }

    html += '<div class="sticky-cta"><button class="btn-primary" data-action="openAddShopping">'+icon('plus',17,'#fff')+'新增項目</button></div>';
    return html;
  }

  function renderShopItem(item){
    var statusLabel = item.status==='purchased' ? '已購買' : (item.status==='not_needed' ? '不需要' : '待購買');
    var priceLine = item.status==='purchased'
      ? ('預計 '+fmt(item.estimatedPrice)+' · 實際 <b class="num">'+fmt(item.actualPrice)+'</b>')
      : ('數量 '+item.quantity+' · 預計 <span class="num">'+fmt(item.estimatedPrice)+'</span>');
    return '<div class="shop-item '+(item.status==='purchased'?'purchased':'')+'" data-action="openItemActions" data-id="'+item.id+'">' +
      '<div class="status-dot '+item.status+'">'+(item.status==='purchased'?icon('check',12,'#fff'):'')+'</div>' +
      '<div style="flex:1;">' +
        '<div class="name">'+item.name+'</div>' +
        '<div class="meta">'+priceLine+' · 負責 '+assigneeName(item.assignedTo)+'</div>' +
      '</div>' +
      assigneeAvatarHTML(item.assignedTo) +
    '</div>';
  }

  // ---------- render: accommodation (hotels) ----------
  // trip.hotels is an array so a multi-city trip can hold several stays; the
  // same modal handles both adding a new one and editing an existing one
  // (hotelDraft.id is null for "new", or the hotel's id for "edit").
  var hotelDraft;
  function freshHotelDraft(existing){
    if (existing) return {id:existing.id, name:existing.name, checkIn:existing.checkIn||'', checkOut:existing.checkOut||'', notes:existing.notes||''};
    return {id:null, name:'', checkIn:'', checkOut:'', notes:''};
  }
  function renderHotelModal(){
    if (!hotelDraft) hotelDraft = freshHotelDraft();
    var d = hotelDraft;
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">'+(d.id?'編輯酒店':'新增酒店')+'</div>' +
      '<div class="field"><label>酒店名稱</label><input type="text" id="hf-name" value="'+d.name+'" placeholder="例如：東京銀座格拉斯麗酒店"></div>' +
      '<div class="row-2">' +
        '<div class="field"><label>入住日期</label><input type="date" id="hf-checkin" value="'+d.checkIn+'"></div>' +
        '<div class="field"><label>退房日期</label><input type="date" id="hf-checkout" value="'+d.checkOut+'"></div>' +
      '</div>' +
      '<div class="field"><label>備註（optional）</label><textarea id="hf-notes">'+d.notes+'</textarea></div>' +
      (d.name ? googleMapsSearchLinkHTML(d.name) : '') +
      '<div class="modal-actions">' +
        (d.id ? ('<button class="btn-secondary" data-action="deleteHotel" data-id="'+d.id+'" style="color:var(--negative);">刪除</button>') : '<button class="btn-secondary" data-action="closeModal">取消</button>') +
        '<button class="btn-primary" data-action="submitHotel">'+(d.id?'儲存':'加入')+'</button>' +
      '</div>';
  }
  function syncHotelDraftFromDOM(){
    var d = hotelDraft;
    var n = document.getElementById('hf-name'); if (n) d.name = n.value;
    var ci = document.getElementById('hf-checkin'); if (ci) d.checkIn = ci.value;
    var co = document.getElementById('hf-checkout'); if (co) d.checkOut = co.value;
    var no = document.getElementById('hf-notes'); if (no) d.notes = no.value;
  }
  function submitHotel(){
    syncHotelDraftFromDOM();
    var d = hotelDraft;
    if (!d.name){ showAlert('請輸入酒店名稱。'); return; }
    if (!trip.hotels) trip.hotels = [];
    if (d.id){
      var existing = trip.hotels.filter(function(h){ return h.id===d.id; })[0];
      if (existing){ existing.name=d.name; existing.checkIn=d.checkIn; existing.checkOut=d.checkOut; existing.notes=d.notes; }
    } else {
      trip.hotels.push({id:nextId('h'), name:d.name, checkIn:d.checkIn, checkOut:d.checkOut, notes:d.notes});
    }
    hotelDraft = null;
    markDirty();
    closeModal();
  }

  // ---------- render: trip cover photo (home-screen "folder" cover) ----------
  // lets someone upload their own photo as a trip's cover, same idea as an
  // avatar photo — shown behind the trip-card on the home list AND the
  // dashboard hero once opened, falling back to the theme gradient when
  // no photo has been set (or it's been removed).
  var tripCoverDraft; // {tripId, photo, color}
  function renderEditTripCoverModal(payload){
    var b = getBundleFrom(tripsStore, payload.tripId);
    if (!b) return '';
    if (!tripCoverDraft || tripCoverDraft.tripId !== payload.tripId){
      tripCoverDraft = { tripId: payload.tripId, photo: b.trip.coverPhoto || null, color: b.trip.coverColor || null };
    }
    var d = tripCoverDraft;
    var previewCss = d.photo
      ? ('background:center/cover no-repeat url(\''+d.photo+'\');')
      : (d.color ? ('background:'+d.color+';') : ('background:'+THEME_GRADIENTS[b.trip.theme % THEME_GRADIENTS.length]+';'));
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">換個封面</div>' +
      '<div style="width:100%;height:120px;border-radius:14px;margin-bottom:14px;'+previewCss+'"></div>' +
      '<div class="field"><label>上載相片</label><input type="file" id="tc-photo" accept="image/*"></div>' +
      '<div class="field"><label>撳唔到相？揀個顏色做背景</label><div class="color-swatch-row">' +
        AVATAR_COLORS.map(function(c){ return '<div class="color-swatch '+(!d.photo && d.color===c?'selected':'')+'" style="background:'+c+';" data-action="setTripCoverColor" data-color="'+c+'"></div>'; }).join('') +
      '</div></div>' +
      ((d.photo || d.color) ? '<button class="btn-secondary" data-action="clearTripCoverPhoto" style="margin-bottom:10px;width:100%;">移除相片／顏色，改用預設背景</button>' : '') +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="submitTripCover">儲存</button>' +
      '</div>';
  }
  function submitTripCover(){
    if (!tripCoverDraft) return;
    var b = getBundleFrom(tripsStore, tripCoverDraft.tripId);
    if (b){ b.trip.coverPhoto = tripCoverDraft.photo || null; b.trip.coverColor = tripCoverDraft.color || null; }
    tripCoverDraft = null;
    markDirty();
    closeModal();
  }

  // ---------- export: standalone trip-summary HTML ----------
  // Generates one self-contained, static HTML page (no app logic, nothing to
  // click) summarising the CURRENTLY OPEN trip — cover, members, hotels,
  // day-by-day itinerary, wishlist, spend breakdown and settlement — good
  // for printing or sending to people who aren't using the app themselves.
  function downloadTextFile(filename, content, mime){
    try {
      var blob = new Blob([content], {type: mime || 'text/html;charset=utf-8'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    } catch(err){
      showAlert('匯出失敗，呢個瀏覽器環境可能唔支援自動下載。');
    }
  }
  var SUMMARY_CSS = '' +
    ':root{--bg:#F7F6F2;--surface:#FFFFFF;--ink:#171717;--muted:#7A7770;--line:#E8E5DC;--accent:#556052;--accent-tint:#E4E9DF;}' +
    '@media (prefers-color-scheme: dark){:root{--bg:#1B1A16;--surface:#242320;--ink:#F1EFE8;--muted:#A6A196;--line:#38362E;--accent:#93AB86;--accent-tint:#2E3629;}}' +
    '*{box-sizing:border-box;}' +
    'body{margin:0;background:var(--bg);color:var(--ink);font-family:"Manrope","Noto Sans TC",-apple-system,sans-serif;line-height:1.55;}' +
    'h1,h2{font-family:"Fraunces","Noto Serif TC",serif;margin:0;letter-spacing:-0.01em;}' +
    '.num{font-variant-numeric:tabular-nums;}' +
    '.cover{padding:48px 24px 30px 24px;color:#F7F6F2;}' +
    '.cover h1{font-size:28px;}' +
    '.badge{display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.05em;background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:999px;margin-bottom:10px;}' +
    '.cover .sub{font-size:13.5px;margin-top:8px;opacity:0.92;}' +
    '.wrap{max-width:720px;margin:0 auto;padding:28px 20px 60px 20px;}' +
    'section{margin-bottom:30px;}' +
    'section h2{font-size:18px;margin-bottom:14px;}' +
    '.card,.member-row,.hotel-card,.day-block,.cand-card{background:var(--surface);border:1px solid var(--line);border-radius:14px;}' +
    '.member-grid{display:flex;flex-wrap:wrap;gap:10px;}' +
    '.member-row{display:flex;align-items:center;gap:10px;padding:10px 14px;flex:1 1 200px;}' +
    '.member-row .dot{width:28px;height:28px;border-radius:50%;flex-shrink:0;}' +
    '.member-row .mname{font-weight:600;font-size:13.5px;flex:1;}' +
    '.member-row .mbudget{font-size:11.5px;color:var(--muted);}' +
    '.hotel-grid{display:flex;flex-direction:column;gap:10px;}' +
    '.hotel-card{padding:14px;}' +
    '.hname{font-weight:700;font-size:14px;}' +
    '.hdates{font-size:12px;color:var(--muted);margin-top:3px;}' +
    '.hnotes{font-size:12px;color:var(--muted);margin-top:3px;}' +
    '.hotel-card a{display:inline-block;margin-top:8px;font-size:12px;color:var(--accent);text-decoration:none;}' +
    '.day-block{padding:14px 16px;margin-bottom:10px;}' +
    '.day-head{font-weight:700;font-size:13.5px;margin-bottom:8px;color:var(--accent);}' +
    '.itin-row{display:flex;gap:10px;padding:5px 0;font-size:13px;border-top:1px solid var(--line);}' +
    '.itin-row:first-of-type{border-top:none;}' +
    '.itime{width:48px;flex-shrink:0;color:var(--muted);}' +
    '.ititle{flex:1;}' +
    '.icat{font-size:11px;color:var(--muted);background:var(--accent-tint);padding:2px 8px;border-radius:999px;height:fit-content;}' +
    '.cand-grid{display:flex;flex-direction:column;gap:10px;}' +
    '.cand-card{padding:12px 14px;}' +
    '.cname{font-weight:700;font-size:13.5px;}' +
    '.cmeta{font-size:11.5px;color:var(--muted);margin-top:2px;}' +
    '.cnotes{font-size:12px;margin-top:4px;}' +
    '.cand-card a{display:inline-block;margin-top:6px;font-size:12px;color:var(--accent);text-decoration:none;}' +
    '.stat-line{display:flex;justify-content:space-between;font-size:14px;padding:6px 0;}' +
    '.cat-rows{margin-top:8px;border-top:1px solid var(--line);padding-top:8px;}' +
    '.row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;}' +
    '.empty-note{font-size:12.5px;color:var(--muted);}' +
    '.footer{text-align:center;font-size:11px;color:var(--muted);margin-top:40px;}';

  function generateTripSummaryHTML(){
    var coverCss = tripCoverBackgroundCSS(trip);
    var cats = categoryBreakdown();
    var spend = totalSpend();
    var plan = settlementPlan();

    var catRowsHTML = cats.map(function(c){
      return '<div class="row"><span>'+c.category+'</span><span class="num">'+fmt(c.amount)+'</span></div>';
    }).join('') || '<div class="empty-note">未有任何支出紀錄。</div>';

    var memberRowsHTML = members.map(function(m){
      return '<div class="member-row">' +
        '<div class="dot" style="background:'+m.color+';"></div>' +
        '<div class="mname">'+m.name+'</div>' +
        (m.budget ? ('<div class="mbudget num">預算 '+fmt(m.budget)+'</div>') : '') +
      '</div>';
    }).join('');

    var hotelsHTML = (trip.hotels && trip.hotels.length) ? trip.hotels.map(function(h){
      return '<div class="hotel-card">' +
        '<div class="hname">'+h.name+'</div>' +
        '<div class="hdates num">'+(h.checkIn||'—')+' → '+(h.checkOut||'—')+'</div>' +
        (h.notes ? ('<div class="hnotes">'+h.notes+'</div>') : '') +
        googleMapsSearchLinkHTML(h.name) +
      '</div>';
    }).join('') : '<div class="empty-note">未有酒店紀錄。</div>';

    var daysHTML = trip.days.map(function(day, idx){
      var itemsHTML = day.items.length ? day.items.map(function(it){
        return '<div class="itin-row"><span class="itime num">'+it.time+'</span><span class="ititle">'+it.title+'</span><span class="icat">'+it.category+'</span></div>';
      }).join('') : '<div class="empty-note">呢日仲未有安排。</div>';
      return '<div class="day-block">' +
        '<div class="day-head">第 '+(idx+1)+' 日 · '+formatDayDate(day.date)+'</div>' +
        itemsHTML +
      '</div>';
    }).join('');

    var candidatesHTML = candidatePlaces.map(function(c){
      return '<div class="cand-card">' +
        '<div class="cname">'+c.name+'</div>' +
        '<div class="cmeta">'+c.category+(c.area?(' · '+c.area):'')+'</div>' +
        (c.notes ? ('<div class="cnotes">'+c.notes+'</div>') : '') +
        (c.refLink ? ('<a href="'+c.refLink+'" target="_blank" rel="noopener noreferrer">睇返個帖子</a>') : '') +
      '</div>';
    }).join('');

    var settlementHTML = plan.length ? plan.map(function(p){
      return '<div class="row"><span>'+assigneeName(p.from)+' → '+assigneeName(p.to)+'</span><span class="num">'+fmt(p.amount)+'</span></div>';
    }).join('') : '<div class="empty-note">目前沒有需要結算的款項。</div>';

    return '<!DOCTYPE html>' +
    '<html lang="zh-Hant"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>'+trip.name+' 行程總結</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+TC:wght@400;500;600;700;800&family=Noto+Serif+TC:wght@600;700&display=swap" rel="stylesheet">' +
    '<style>'+SUMMARY_CSS+'</style>' +
    '</head><body>' +
      '<div class="cover" style="'+coverCss+'">' +
        '<div class="badge">行程總結</div>' +
        '<h1>'+trip.name+'</h1>' +
        '<div class="sub">'+trip.country+' · '+formatRange()+' · '+members.length+' 位旅伴</div>' +
      '</div>' +
      '<div class="wrap">' +
        '<section><h2>團員</h2><div class="member-grid">'+memberRowsHTML+'</div></section>' +
        '<section><h2>住宿</h2><div class="hotel-grid">'+hotelsHTML+'</div></section>' +
        '<section><h2>每日行程</h2>'+daysHTML+'</section>' +
        (candidatePlaces.length ? ('<section><h2>想去清單</h2><div class="cand-grid">'+candidatesHTML+'</div></section>') : '') +
        '<section><h2>支出概況</h2>' +
          '<div class="card" style="padding:14px 16px;">' +
          '<div class="stat-line"><span>總支出</span><span class="num">'+fmt(spend)+'</span></div>' +
          '<div class="stat-line"><span>預算</span><span class="num">'+fmt(trip.budget)+'</span></div>' +
          '<div class="cat-rows">'+catRowsHTML+'</div>' +
          '</div>' +
        '</section>' +
        '<section><h2>結算建議</h2><div class="card" style="padding:14px 16px;">'+settlementHTML+'</div></section>' +
        '<div class="footer">呢份總結由「旅程錢包」喺 '+new Date().toISOString().slice(0,10)+' 匯出。</div>' +
      '</div>' +
    '</body></html>';
  }

  // ---------- render: itinerary ----------

  function renderItinerary(){
    var html = '<div class="section" style="padding-top:16px;">' +
      '<div class="segmented">' +
        '<div class="seg-opt '+(state.itineraryView==='day'?'active':'')+'" data-action="setItineraryView" data-key="day">每日行程</div>' +
        '<div class="seg-opt '+(state.itineraryView==='candidates'?'active':'')+'" data-action="setItineraryView" data-key="candidates">想去清單</div>' +
      '</div>' +
    '</div>';
    if (state.itineraryView==='day') html += renderDayView();
    else html += renderCandidateView();
    return html;
  }

  function renderDayView(){
    var dayIndex = state.itineraryDayIndex;
    var day = trip.days[dayIndex];
    var html = '<div class="section" style="padding-top:0;">' +
      '<div class="day-chip-row">' +
        trip.days.map(function(d,idx){
          var allDone = d.items.length>0 && d.items.every(function(it){ return it.done; });
          return '<div class="day-chip '+(idx===dayIndex?'active':'')+' '+(allDone?'complete':'')+'" data-action="selectDay" data-idx="'+idx+'"><div class="n">'+(idx+1)+'</div></div>';
        }).join('') +
      '</div>' +
      '<div class="day-date-card">'+formatDayDate(day.date)+'</div>' +
      '<button class="qa-btn" style="width:100%;justify-content:center;margin-bottom:14px;" data-action="openOptimizeDay">'+icon('route',16)+'AI 智能排序</button>';

    if (!day.items.length){
      html += emptyState('呢一日暫時未有行程。', '加一個活動開始安排啦。', '＋ 新增活動', 'openAddItineraryItem');
    } else {
      day.items.forEach(function(item, idx){
        var canLink = (item.category==='餐飲' || item.category==='景點' || item.category==='購物' || item.category==='活動');
        html += '<div class="itin-item '+(item.done?'done':'')+'" draggable="true" data-idx="'+idx+'">' +
          '<div style="color:#C7C2B6;cursor:grab;padding-top:2px;">'+icon('drag',16,'#C7C2B6')+'</div>' +
          '<div class="time-col num">'+item.time+'</div>' +
          '<div class="done-dot '+(item.done?'done':'')+'" data-action="toggleItinItemDone" data-idx="'+idx+'">'+(item.done?icon('check',12,'#fff'):'')+'</div>' +
          '<div style="flex:1;">' +
            '<div class="title" style="font-size:14px;font-weight:600;">'+item.title+'</div>' +
            '<div class="cat-tag">'+item.category+(item.linkedExpenseId?' · 已記支出':'')+'</div>' +
          '</div>' +
          (canLink && !item.linkedExpenseId ? '<button class="expense-link-btn" data-action="addExpenseFromItem" data-idx="'+idx+'">加做支出</button>' : '') +
          '<div class="move-col">' +
            '<button class="move-btn" data-action="moveItinItem" data-idx="'+idx+'" data-dir="-1" '+(idx===0?'style="opacity:0.25;pointer-events:none;"':'')+'>'+icon('arrowUp',15)+'</button>' +
            '<button class="move-btn" data-action="moveItinItem" data-idx="'+idx+'" data-dir="1" '+(idx===day.items.length-1?'style="opacity:0.25;pointer-events:none;"':'')+'>'+icon('arrowDown',15)+'</button>' +
          '</div>' +
        '</div>';
      });
    }

    html += '</div>';
    html += '<div class="sticky-cta"><button class="btn-primary" data-action="openAddItineraryItem">'+icon('plus',17,'#fff')+'新增活動</button></div>';
    return html;
  }

  function formatDayDate(dateStr){
    var p = dateStr.split('-');
    var wd = ['日','一','二','三','四','五','六'][new Date(dateStr+'T00:00:00').getDay()];
    return parseInt(p[1],10)+'月'+parseInt(p[2],10)+'日 · 星期'+wd;
  }

  function renderCandidateView(){
    var selectedCount = candidatePlaces.filter(function(c){ return c.selected; }).length;
    var html = '<div class="section" style="padding-top:0;">' +
      '<div style="font-size:12.5px;color:var(--muted);margin-bottom:14px;">呢度收集你想去、但未必實會去嘅地方。剔選幾個，可以幫你計最順路嘅次序，或者隨機抽一個。</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:16px;">' +
        '<button class="qa-btn" style="flex:1;justify-content:center;" data-action="openSuggestRoute">'+icon('route',16)+'建議路線（'+selectedCount+'）</button>' +
        '<button class="qa-btn" style="flex:1;justify-content:center;" data-action="openLuckyDraw">'+icon('dice',16)+'抽籤</button>' +
      '</div>';

    if (!candidatePlaces.length){
      html += emptyState('想去清單暫時係空嘅。', '將你有興趣但未決定嘅地方加入嚟。', '＋ 新增地方', 'openAddCandidate');
    } else {
      candidatePlaces.forEach(function(c, idx){
        html += '<div class="candidate-card">' +
          '<div class="cand-check '+(c.selected?'on':'')+'" data-action="toggleCandidateSelect" data-idx="'+idx+'">'+(c.selected?icon('check',13,'#fff'):'')+'</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:14px;font-weight:600;">'+c.name+'</div>' +
            '<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+c.category+' · '+c.area+(c.addedToDay!==null?(' · 已加入第 '+(c.addedToDay+1)+' 日'):'')+'</div>' +
            (c.refLink ? ('<a href="'+c.refLink+'" target="_blank" rel="noopener noreferrer" class="link-btn" style="display:inline-flex;align-items:center;gap:4px;margin-top:4px;font-size:11px;">'+icon('route',12)+'睇返個帖子</a>') : '') +
          '</div>' +
          '<button class="move-btn" data-action="deleteCandidate" data-idx="'+idx+'">'+icon('trash',17)+'</button>' +
        '</div>';
      });
    }
    html += '</div>';
    html += '<div class="sticky-cta"><button class="btn-primary" data-action="openAddCandidate">'+icon('plus',17,'#fff')+'新增地方</button></div>';
    return html;
  }

  // ---------- render: expenses ----------

  function renderExpenses(){
    var html = '<div class="section" style="padding-top:16px;">' +
      '<div class="tabs" style="border:none;padding:0;gap:16px;margin-bottom:14px;">' +
        '<button class="tab-btn '+(state.expenseSubTab==='log'?'active':'')+'" data-action="setExpenseSubTab" data-key="log">支出紀錄</button>' +
        '<button class="tab-btn '+(state.expenseSubTab==='settle'?'active':'')+'" data-action="setExpenseSubTab" data-key="settle">結算</button>' +
        '<button class="tab-btn '+(state.expenseSubTab==='leaderboard'?'active':'')+'" data-action="setExpenseSubTab" data-key="leaderboard">排行榜</button>' +
      '</div>' +
    '</div>';

    if (state.expenseSubTab === 'log') html += renderExpenseLog();
    else if (state.expenseSubTab === 'settle') html += renderSettlement();
    else html += renderLeaderboard();

    html += '<div class="sticky-cta"><button class="btn-primary" data-action="openAddExpense">'+icon('plus',17,'#fff')+'新增支出</button></div>';
    return html;
  }

  function renderLeaderboard(){
    var html = '<div class="section" style="padding-top:0;">';
    html += '<div class="toggle-row" style="margin-top:0;"><span>喺呢個旅程啟用花費排行榜</span>' +
      '<div class="switch '+(trip.leaderboardEnabled?'on':'')+'" data-action="toggleLeaderboard"><div class="knob"></div></div></div>';

    if (!trip.leaderboardEnabled){
      html += emptyState('花費排行榜未啟用。', '打開上面個開關就可以睇返邊個用得最多錢。', null, null);
      html += '</div>';
      return html;
    }

    var ranked = members.map(function(m){ return {id:m.id, name:m.name, amount:memberSpendShare(m.id)}; }).sort(function(a,b){ return b.amount-a.amount; });
    var top = ranked[0], bottom = ranked[ranked.length-1];
    var priciest = mostExpensiveExpense();

    html += '<div class="row-2" style="margin:16px 0;">' +
      '<div class="card" style="padding:14px;"><div style="font-size:11px;color:var(--muted);margin-bottom:4px;">用得最多錢</div><div style="font-size:14px;font-weight:700;">'+top.name+'</div><div class="num" style="font-size:13px;color:var(--muted);">'+fmt(top.amount)+'</div></div>' +
      '<div class="card" style="padding:14px;"><div style="font-size:11px;color:var(--muted);margin-bottom:4px;">用得最少錢</div><div style="font-size:14px;font-weight:700;">'+bottom.name+'</div><div class="num" style="font-size:13px;color:var(--muted);">'+fmt(bottom.amount)+'</div></div>' +
    '</div>';

    if (priciest){
      html += '<div class="card" style="padding:14px;margin-bottom:16px;">' +
        '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">最貴一項支出</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<div><div style="font-size:14px;font-weight:700;">'+priciest.title+'</div><div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+priciest.category+' · '+priciest.date+' · '+findMember(priciest.paidBy).name+' 支付</div></div>' +
          '<div class="num" style="font-size:15px;font-weight:700;">'+fmt(priciest.amount)+'</div>' +
        '</div>' +
      '</div>';
    }

    html += '<div class="section-title" style="padding:0;"><h2>個人使用金額排名</h2></div>' +
      '<div class="card" style="padding:6px 14px;margin-bottom:20px;">' +
      ranked.map(function(r,idx){
        return '<div style="display:flex;align-items:center;gap:10px;padding:11px 0;'+(idx>0?'border-top:1px solid var(--line);':'')+'">' +
          '<div style="width:16px;font-size:12px;color:var(--muted);" class="num">'+(idx+1)+'</div>' +
          avatarHTML(r.id) +
          '<div style="flex:1;font-size:13.5px;font-weight:600;">'+r.name+'</div>' +
          '<div class="num" style="font-size:13px;">'+fmt(r.amount)+'</div>' +
        '</div>';
      }).join('') +
      '</div>' +
      '<div class="section-title" style="padding:0;"><h2>每日 · 每人花費</h2></div>' +
      '<div class="chip-row" style="margin-bottom:14px;">' +
        leaderboardMemberChip(null,'全部') + members.map(function(m){ return leaderboardMemberChip(m.id,m.name); }).join('') +
      '</div>';

    var dates = tripExpenseDates();
    dates.forEach(function(date){
      var cats = dayCategoryBreakdown(date, state.leaderboardFilterMember);
      if (!cats.length) return;
      var dayTotal = cats.reduce(function(s,c){ return s+c.amount; },0);
      html += '<div class="card" style="padding:14px;margin-bottom:10px;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
          '<div style="font-size:12.5px;font-weight:700;">'+date+'</div>' +
          '<div class="num" style="font-size:12.5px;font-weight:700;">'+fmt(dayTotal)+'</div>' +
        '</div>' +
        cats.map(function(c){
          return '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);padding:3px 0;"><span>'+c.category+'</span><span class="num">'+fmt(c.amount)+'</span></div>';
        }).join('') +
      '</div>';
    });

    html += '</div>';
    return html;
  }

  function leaderboardMemberChip(id,label){
    return '<div class="chip '+(state.leaderboardFilterMember===id?'active':'')+'" data-action="filterLeaderboardMember" data-key="'+(id||'')+'">'+label+'</div>';
  }

  function renderExpenseLog(){
    var spend = totalSpend();
    var remaining = trip.budget - spend;
    var html = '<div class="section" style="padding-top:0;">' +
      '<div class="card" style="padding:16px;margin-bottom:16px;">' +
        '<div class="money-hero num">'+fmt(spend)+'</div>' +
        '<div style="font-size:12px;color:var(--muted);">預算 <span class="num">'+fmt(trip.budget)+'</span> · 剩餘 <span class="num" style="color:'+(remaining>=0?'var(--positive)':'var(--negative)')+';font-weight:700;">'+fmt(remaining)+'</span></div>' +
      '</div>' +
      '<div class="chip-row" style="margin-bottom:6px;">' +
        chip('全部','全部') + expenseCategories.map(function(c){ return chip(c,c); }).join('') +
      '</div>' +
      '<div class="chip-row" style="margin-bottom:14px;">' +
        memberChip(null,'所有人') + members.map(function(m){ return memberChip(m.id,m.name); }).join('') +
      '</div>';

    var list = nonSettlement().filter(function(e){
      var catOk = state.expenseFilterCat==='全部' || e.category===state.expenseFilterCat;
      var memOk = !state.expenseFilterMember || e.paidBy===state.expenseFilterMember || e.participants.indexOf(state.expenseFilterMember)!==-1;
      return catOk && memOk;
    }).slice().sort(function(a,b){ return a.date < b.date ? 1 : -1; });

    if (!list.length){
      html += emptyState('還未有任何共同支出。', '第一筆支出由你開始。', null, null);
    } else {
      var lastDate = null;
      list.forEach(function(e){
        if (e.date !== lastDate){ html += '<div class="date-heading">'+e.date+'</div>'; lastDate = e.date; }
        html += '<div class="expense-card" data-action="openEditExpense" data-id="'+e.id+'">' +
          '<div class="expense-icon">'+icon('receipt',17)+'</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:14px;font-weight:600;">'+e.title+'</div>' +
            '<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+findMember(e.paidBy).name+' 支付 · '+e.participants.length+' 人分攤 · '+e.category+'</div>' +
            expenseSplitBreakdownHTML(e) +
          '</div>' +
          '<div style="text-align:right;">' +
            (e.currency && e.currency!=='HKD' && e.originalAmount ?
              ('<div class="num" style="font-size:14px;font-weight:700;">'+formatForeign(e.originalAmount, e.currency)+'</div>' +
               '<div class="num" style="font-size:10.5px;color:var(--muted);margin-top:2px;">≈ '+fmt(e.amount)+'</div>')
              : ('<div class="num" style="font-size:14px;font-weight:700;">'+fmt(e.amount)+'</div>')
            ) +
          '</div>' +
        '</div>';
      });
    }
    html += '</div>';
    return html;
  }

  function chip(key,label){
    return '<div class="chip '+(state.expenseFilterCat===key?'active':'')+'" data-action="filterCat" data-key="'+key+'">'+label+'</div>';
  }
  function memberChip(id,label){
    return '<div class="chip '+(state.expenseFilterMember===id?'active':'')+'" data-action="filterMember" data-key="'+(id||'')+'">'+label+'</div>';
  }

  function renderSettlement(){
    var bal = balances();
    var plan = settlementPlan();
    var html = '<div class="section" style="padding-top:0;">' +
      '<div class="section-title"><h2>團員結餘</h2><button class="link-btn" data-action="openAddMember">＋加入團員</button></div>' +
      '<div class="card" style="padding:6px 14px;margin-bottom:20px;">' +
      members.map(function(m,idx){
        var b = bal[m.id];
        var cls = b>0.5 ? 'balance-pos' : (b<-0.5 ? 'balance-neg' : 'balance-zero');
        var label = b>0.5 ? '應收 '+fmt(b) : (b<-0.5 ? '應付 '+fmt(-b) : '已結清');
        var isViewer = viewerId===m.id;
        var memberRemaining = (m.budget||0) - memberSpendShare(m.id);
        return '<div style="display:flex;align-items:center;gap:10px;padding:12px 0;'+(idx>0?'border-top:1px solid var(--line);':'')+'">' +
          '<div class="avatar-editable" data-action="openEditMember" data-id="'+m.id+'">'+avatarHTML(m.id,'lg')+'</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:14px;font-weight:600;">'+m.name+(isViewer?' <span style="color:var(--accent);font-weight:700;">（你）</span>':'')+'</div>' +
            '<div style="font-size:11.5px;color:var(--muted);">已支付 <span class="num">'+fmt(memberPaidTotal(m.id))+'</span>'+(m.budget?(' · 預算 <span class="num">'+fmt(m.budget)+'</span> · 剩餘 <span class="num">'+fmt(memberRemaining)+'</span>'):'')+'</div>' +
          '</div>' +
          '<div class="balance-pill '+cls+'">'+label+'</div>' +
        '</div>';
      }).join('') +
      '</div>' +
      '<div class="section-title"><h2>建議結算</h2></div>';

    if (!plan.length){
      html += emptyState('目前沒有需要結算的款項。', '所有團員的支出已經平衡。', null, null);
    } else {
      plan.forEach(function(p,idx){
        html += '<div class="settle-row">' +
          avatarHTML(p.from) +
          '<div style="font-size:13px;font-weight:600;">'+findMember(p.from).name+'</div>' +
          '<div class="settle-arrow">'+icon('arrowRight',16)+'</div>' +
          avatarHTML(p.to) +
          '<div style="font-size:13px;font-weight:600;flex:1;">'+findMember(p.to).name+'</div>' +
          '<div class="num" style="font-size:14px;font-weight:700;margin-right:10px;">'+fmt(p.amount)+'</div>' +
          '<button class="link-btn" data-action="settlePayment" data-from="'+p.from+'" data-to="'+p.to+'" data-amount="'+p.amount+'">標記已還款</button>' +
        '</div>';
      });
    }
    html += '</div>';
    return html;
  }

  function emptyState(title, sub, btnLabel, action){
    return '<div class="empty"><h3>'+title+'</h3><p>'+sub+'</p>' +
      (btnLabel ? '<button class="btn-primary" style="width:auto;padding:12px 22px;display:inline-flex;" data-action="'+action+'">'+btnLabel+'</button>' : '') +
    '</div>';
  }

  // ---------- modals ----------

  function openModal(type, payload){ state.modal = {type:type, payload:payload||{}}; render(); }
  function closeModal(){ state.modal = null; render(); }

  // ---------- custom confirm / prompt / alert (native window.confirm/prompt/alert
  // are unreliable inside a published artifact's sandboxed frame — they can be
  // silently suppressed there, e.g. window.confirm() always returning false —
  // so every place that needs a yes/no, a text answer, or a heads-up message
  // uses these in-app modals instead of the browser's own dialogs) ----------
  var pendingConfirmCallback = null;
  var pendingPromptCallback = null;
  var savedModalBeforeDialog = null;

  function showConfirm(message, onYes){
    savedModalBeforeDialog = state.modal;
    pendingConfirmCallback = onYes;
    state.modal = {type:'confirmDialog', payload:{message:message}};
    render();
  }
  function showPrompt(message, defaultValue, onSubmit){
    savedModalBeforeDialog = state.modal;
    pendingPromptCallback = onSubmit;
    state.modal = {type:'promptDialog', payload:{message:message, value: defaultValue || ''}};
    render();
  }
  function showAlert(message){
    savedModalBeforeDialog = state.modal;
    state.modal = {type:'alertDialog', payload:{message:message}};
    render();
  }
  function dismissDialogModal(){
    state.modal = savedModalBeforeDialog;
    savedModalBeforeDialog = null;
  }
  function isDialogModalType(type){ return type==='confirmDialog' || type==='promptDialog' || type==='alertDialog'; }

  function renderConfirmDialogModal(payload){
    return '' +
      '<div class="sheet-handle"></div>' +
      '<div style="font-size:14px;color:var(--ink);line-height:1.6;margin:4px 0 20px 0;">'+payload.message+'</div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="confirmDialogCancel">取消</button>' +
        '<button class="btn-primary" data-action="confirmDialogOk">確定</button>' +
      '</div>';
  }
  function renderPromptDialogModal(payload){
    return '' +
      '<div class="sheet-handle"></div>' +
      '<div style="font-size:14px;color:var(--ink);margin:4px 0 12px 0;">'+payload.message+'</div>' +
      '<div class="field"><input type="text" id="dialog-prompt-input" value="'+(payload.value||'')+'" autofocus></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="promptDialogCancel">取消</button>' +
        '<button class="btn-primary" data-action="promptDialogOk">確定</button>' +
      '</div>';
  }
  function renderAlertDialogModal(payload){
    return '' +
      '<div class="sheet-handle"></div>' +
      '<div style="font-size:14px;color:var(--ink);line-height:1.6;margin:4px 0 20px 0;">'+payload.message+'</div>' +
      '<div class="modal-actions"><button class="btn-primary" data-action="alertDialogOk">知道啦</button></div>';
  }

  function renderModal(){
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.setAttribute('data-action','overlayClick');
    var sheetHTML = '';
    if (state.modal.type === 'addExpense') sheetHTML = renderExpenseModal();
    else if (state.modal.type === 'addShopping') sheetHTML = renderShoppingModal();
    else if (state.modal.type === 'purchase') sheetHTML = renderPurchaseModal(state.modal.payload.item);
    else if (state.modal.type === 'itemActions') sheetHTML = renderItemActionsModal(state.modal.payload.item);
    else if (state.modal.type === 'addItineraryItem') sheetHTML = renderAddItineraryItemModal();
    else if (state.modal.type === 'optimizeDay') sheetHTML = renderOptimizeDayModal();
    else if (state.modal.type === 'addCandidate') sheetHTML = renderAddCandidateModal();
    else if (state.modal.type === 'suggestRoute') sheetHTML = renderSuggestRouteModal();
    else if (state.modal.type === 'luckyDraw') sheetHTML = renderLuckyDrawModal();
    else if (state.modal.type === 'createTrip') sheetHTML = renderCreateTripModal();
    else if (state.modal.type === 'editMember') sheetHTML = renderEditMemberModal(state.modal.payload.memberId);
    else if (state.modal.type === 'addMember') sheetHTML = renderAddMemberModal();
    else if (state.modal.type === 'pickViewer') sheetHTML = renderPickViewerModal(state.modal.payload);
    else if (state.modal.type === 'addHotel') sheetHTML = renderHotelModal();
    else if (state.modal.type === 'editTripCover') sheetHTML = renderEditTripCoverModal(state.modal.payload);
    else if (state.modal.type === 'scan') sheetHTML = renderScanModal();
    else if (state.modal.type === 'sync') sheetHTML = renderSyncModal();
    else if (state.modal.type === 'confirmDialog') sheetHTML = renderConfirmDialogModal(state.modal.payload);
    else if (state.modal.type === 'promptDialog') sheetHTML = renderPromptDialogModal(state.modal.payload);
    else if (state.modal.type === 'alertDialog') sheetHTML = renderAlertDialogModal(state.modal.payload);
    overlay.innerHTML = '<div class="sheet" data-action="stop">'+sheetHTML+'</div>';
    document.body.appendChild(overlay);
  }

  // ===================== AI 掃描新增（OCR） =====================
  // Client-side OCR via Tesseract.js (loaded from CDN — needs the user's own
  // internet access the first time, both for the library and each language's
  // traineddata). Whatever OCR reads out is always shown as EDITABLE plain
  // text — the user can hand-correct it, or skip photos entirely and just
  // paste/type text — before any field gets auto-guessed, and the guessed
  // fields are themselves editable and only ever get handed off into the
  // normal add-hotel / add-itinerary / add-expense modal for a final review,
  // never saved directly. This keeps the feature honest about OCR accuracy.
  var scanDraft;
  var SCAN_LANG_LABELS = {eng:'英文', chi_tra:'繁體中文', chi_sim:'簡體中文', jpn:'日文', kor:'韓文', tha:'泰文', vie:'越南文', fra:'法文'};
  function freshScanDraft(){
    return { kind:null, langs:{eng:true, chi_tra:true, chi_sim:false, jpn:false, kor:false, tha:false, vie:false, fra:false}, extraLangs:'', rawText:'', parsed:null, busy:false, error:'' };
  }
  function syncScanTextFromDOM(){
    if (!scanDraft) return;
    var ta = document.getElementById('scan-rawtext');
    if (ta) scanDraft.rawText = ta.value;
    var extra = document.getElementById('scan-extra-langs');
    if (extra) scanDraft.extraLangs = extra.value;
  }
  function scanActiveLangString(){
    var keys = Object.keys(scanDraft.langs).filter(function(k){ return scanDraft.langs[k]; });
    if (scanDraft.extraLangs){
      scanDraft.extraLangs.split(/[,\s]+/).forEach(function(code){
        code = code.trim().toLowerCase();
        if (code && keys.indexOf(code)===-1) keys.push(code);
      });
    }
    return (keys.length ? keys : ['eng','chi_tra']).join('+');
  }
  function runScanOCR(dataUrl){
    if (typeof Tesseract === 'undefined'){
      scanDraft.error = 'OCR 函式庫未能載入（可能係網絡問題），你可以喺下面手動貼上文字代替。';
      renderModalOnly();
      return;
    }
    scanDraft.busy = true; scanDraft.error = '';
    renderModalOnly();
    var langs = scanActiveLangString();
    Tesseract.recognize(dataUrl, langs).then(function(result){
      scanDraft.rawText = (result && result.data && result.data.text) ? result.data.text : '';
      scanDraft.busy = false;
      parseScanText();
      renderModalOnly();
    }).catch(function(err){
      scanDraft.busy = false;
      scanDraft.error = '掃描失敗，你可以喺下面手動貼上文字代替（'+(err&&err.message?err.message:'未知錯誤')+'）。';
      renderModalOnly();
    });
  }
  // ---- best-effort text parsing helpers — everything they find is a GUESS
  // shown for the user to review, never written straight into trip data ----
  function scanPad2(n){ n = String(n); return n.length<2 ? '0'+n : n; }
  var SCAN_MONTHS = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12,
    january:1,february:2,march:3,april:4,june:6,july:7,august:8,september:9,october:10,november:11,december:12};
  // "Booking Date" / 訂購日期 etc. is when the order was PLACED, and a
  // cancellation-deadline date ("您可以在 2026年12月1日 前免費取消") is neither
  // the placed date nor the actual stay/travel date we actually want —
  // matches shortly after any of these phrases are kept as a low-priority
  // fallback instead of the first guess.
  var SCAN_DATE_NOISE = /(booking date|order date|purchase date|訂購日期|落單日期|下單日期|訂單日期|您可以在|免費取消|取消政策|不設退款)\s*[:：]?\s*$/i;
  // a hotel-stay range almost always appears as ONE line — "2026年12月3日
  // 週四—12月5日 週六" or "December 3 - December 5, 2026" — where the second
  // date usually omits the year (and sometimes the month). Matching the
  // WHOLE range in one go is far more reliable than picking two unrelated
  // dates out of scanFindDates(), which can just as easily grab a
  // cancellation-policy date instead of the real check-out date.
  // a 2-digit year on a receipt is always "this century" in practice
  function scanYear2(y){ y = Number(y); return String(y < 70 ? 2000 + y : 1900 + y); }
  function scanFindDateRange(text){
    // explicit check-in / check-out labels win over any positional guess
    var ci = /(?:入住|checkin|check-in|check in)\s*(?:日期)?\s*[:：]?\s*([^\n]{4,24})/i.exec(text);
    var co = /(?:退房|checkout|check-out|check out)\s*(?:日期)?\s*[:：]?\s*([^\n]{4,24})/i.exec(text);
    if (ci && co){
      var ciD = scanFindDates(ci[1])[0], coD = scanFindDates(co[1])[0];
      if (ciD && coD) return { checkIn: ciD, checkOut: coD };
    }
    // "2026年12月3日 週四—12月5日 週六" — the 2nd date usually drops the year
    // (and sometimes the month too), so match the WHOLE range in one go
    var m = /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日[^\d\n]{0,12}(?:(\d{1,2})月\s*)?(\d{1,2})日/.exec(text);
    if (m){
      var y=m[1], mo1=scanPad2(m[2]), d1=scanPad2(m[3]), mo2=m[4]?scanPad2(m[4]):scanPad2(m[2]), d2=scanPad2(m[5]);
      return { checkIn: y+'-'+mo1+'-'+d1, checkOut: y+'-'+mo2+'-'+d2 };
    }
    // "December 3 - December 5, 2026" / "Dec 3 – 5, 2026"
    m = /([A-Za-z]{3,9})\s+(\d{1,2})\s*[-–—~至到]\s*([A-Za-z]{3,9})?\s*(\d{1,2}),?\s+(\d{4})/.exec(text);
    if (m){
      var mon1 = SCAN_MONTHS[m[1].toLowerCase()], mon2 = m[3] ? SCAN_MONTHS[m[3].toLowerCase()] : mon1;
      if (mon1 && mon2){
        return { checkIn: m[5]+'-'+scanPad2(mon1)+'-'+scanPad2(m[2]), checkOut: m[5]+'-'+scanPad2(mon2)+'-'+scanPad2(m[4]) };
      }
    }
    // last resort: any single line that carries two full dates
    var lines = text.split('\n');
    for (var i=0;i<lines.length;i++){
      var found = scanFindDates(lines[i]);
      if (found.length >= 2) return { checkIn: found[0], checkOut: found[1] };
    }
    return null;
  }
  function scanFindDates(text){
    var primary = [], fallback = [], seen = {}, m;
    function push(idx, value){
      if (seen[value+'@'+idx]) return;
      seen[value+'@'+idx] = 1;
      var before = text.slice(Math.max(0, idx-24), idx);
      if (SCAN_DATE_NOISE.test(before)) fallback.push(value); else primary.push(value);
    }
    var re1 = /([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/g;
    while ((m = re1.exec(text))){ var mon=SCAN_MONTHS[m[1].toLowerCase()]; if (mon) push(m.index, m[3]+'-'+scanPad2(mon)+'-'+scanPad2(m[2])); }
    var re2 = /\b(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/g;
    while ((m = re2.exec(text))){ push(m.index, m[1]+'-'+scanPad2(m[2])+'-'+scanPad2(m[3])); }
    var re3 = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/g;
    while ((m = re3.exec(text))){ push(m.index, m[3]+'-'+scanPad2(m[2])+'-'+scanPad2(m[1])); }
    // 2-digit-year forms, e.g. a HK receipt's "Date: 29/08/26" (DD/MM/YY).
    // Without this the commonest receipt date format was matched by NOTHING,
    // which is why receipts always came back with an empty date field.
    var re3b = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})\b(?!\d)/g;
    while ((m = re3b.exec(text))){
      var a = Number(m[1]), b = Number(m[2]);
      if (a >= 1 && a <= 31 && b >= 1 && b <= 12) push(m.index, scanYear2(m[3])+'-'+scanPad2(b)+'-'+scanPad2(a));
    }
    var re4 = /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/g;
    while ((m = re4.exec(text))){ push(m.index, m[1]+'-'+scanPad2(m[2])+'-'+scanPad2(m[3])); }
    return primary.concat(fallback);
  }
  function scanFindTimes(text){
    var out = [], m;
    var re = /\b(\d{1,2}):(\d{2})\s?([AaPp][Mm])?\b/g;
    while ((m = re.exec(text))){
      var h = Number(m[1]);
      if (m[3]){ var ap = m[3].toLowerCase(); if (ap==='pm' && h<12) h+=12; if (ap==='am' && h===12) h=0; }
      out.push(scanPad2(h)+':'+m[2]);
    }
    return out;
  }
  function scanFindRoute(text){
    var re = /([A-Za-z一-鿿 .]{2,30}?)\s*\(([A-Z]{3})\)[^\n]{0,8}?[\-→>]{1,3}[^\n]{0,8}?([A-Za-z一-鿿 .]{2,30}?)\s*\(([A-Z]{3})\)/;
    var m = re.exec(text);
    return m ? {fromCity:m[1].trim(), fromCode:m[2], toCity:m[3].trim(), toCode:m[4]} : null;
  }
  function scanFindFlightNo(text){ var m = /\b([A-Z]{2}\s?\d{2,4})\b/.exec(text); return m ? m[1].replace(/\s/g,'') : ''; }
  var SCAN_CURRENCY_CODES = 'HKD|USD|JPY|TWD|CNY|RMB|KRW|THB|SGD|GBP|EUR|AUD|MOP|VND|MYR|PHP|IDR|CAD|CHF|NZD';
  var SCAN_TOTAL_LINE = /(total|amount due|grand total|subtotal|已付款|實付|应付|應付|總額|总额|總計|总计|合計|合计|金額|金额)/i;
  // lines whose numbers are identifiers, not money — transaction/slip/approval
  // numbers and card digits used to win the "largest number" contest and get
  // filled in as the expense amount.
  var SCAN_AMOUNT_NOISE = /(slip|staff|trans|approval|invoice|receipt no|order no|booking no|ref|card|barcode|number of items|item[s]?\s*[:：]|訂單編號|單號|交易|編號|會員|電話|\*{3,})/i;
  // "Trip Coins 節省 HK$3.92" is a rebate, not what was paid
  var SCAN_REBATE = /(coins|節省|节省|reward|earn|discount|折扣|優惠|saved)/i;
  function scanMoneyInLine(line){
    var out = [], m;
    var reSym = /(HK\$|NT\$|US\$|RMB|R\$|¥|£|€|\$)\s?(\d[\d,]*(?:\.\d{1,2})?)/g;
    while ((m = reSym.exec(line))){
      var v = Number(m[2].replace(/,/g, ''));
      if (!isNaN(v)) out.push({ symbol: m[1], code: '', amount: v });
    }
    var reCode = new RegExp('\\b(' + SCAN_CURRENCY_CODES + ')\\b\\s*[:：]?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)', 'gi');
    while ((m = reCode.exec(line))){
      var v2 = Number(m[2].replace(/,/g, ''));
      if (!isNaN(v2)) out.push({ symbol: '', code: m[1].toUpperCase(), amount: v2 });
    }
    // also "13.0" sitting alone on a Total line with the code before it
    if (!out.length){
      var reBare = /(?:^|\s)(\d[\d,]*\.\d{1,2})(?=\s|$)/g;
      while ((m = reBare.exec(line))){
        var v3 = Number(m[1].replace(/,/g, ''));
        if (!isNaN(v3)) out.push({ symbol: '', code: '', amount: v3 });
      }
    }
    return out.filter(function (x) { return x.amount > 0; });
  }
  function scanFindAmount(text){
    var lines = text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var codeHint = '';
    var cm = new RegExp('\\b(' + SCAN_CURRENCY_CODES + ')\\b', 'i').exec(text);
    if (cm) codeHint = cm[1].toUpperCase();
    // 1. a line that actually says it is the total — by far the most reliable
    for (var i = 0; i < lines.length; i++){
      if (!SCAN_TOTAL_LINE.test(lines[i]) || SCAN_REBATE.test(lines[i]) || SCAN_AMOUNT_NOISE.test(lines[i])) continue;
      var hits = scanMoneyInLine(lines[i]);
      if (hits.length){
        var pick = hits.reduce(function (a, b) { return b.amount > a.amount ? b : a; });
        if (!pick.code && !pick.symbol && codeHint) pick.code = codeHint;
        return pick;
      }
    }
    // 2. otherwise the largest money-looking value, ignoring identifier lines
    var best = null;
    lines.forEach(function (line) {
      if (SCAN_AMOUNT_NOISE.test(line) || SCAN_REBATE.test(line)) return;
      scanMoneyInLine(line).forEach(function (h) {
        if (!h.code && !h.symbol && codeHint) h.code = codeHint;
        if (!best || h.amount > best.amount) best = h;
      });
    });
    return best;
  }
  function scanGuessCurrency(hit){
    if (!hit) return 'HKD';
    if (hit.code) return hit.code === 'RMB' ? 'CNY' : hit.code;
    var map = {'HK$':'HKD','NT$':'TWD','US$':'USD','$':'USD','¥':'JPY','£':'GBP','€':'EUR','R$':'BRL','RMB':'CNY'};
    return map[hit.symbol] || 'HKD';
  }
  function scanFormatMoney(hit){
    if (!hit) return '';
    return (hit.symbol || (hit.code ? hit.code + ' ' : '')) + hit.amount;
  }
  // booking-confirmation screenshots (Trip.com and similar) are full of
  // chrome text ABOVE the actual title — order/PIN numbers, badges, "paid",
  // cancellation terms, action buttons — none of which is what the user
  // wants filled in. This list is what "first meaningful line" actually
  // needs to skip past to reach the real title.
  var SCAN_LINE_NOISE = /booking no\.?|order no\.?|pin\s*碼|confirmed|in \d+ days?|^notice$|trip coins|you'll earn|request ticket|^\d+$|^\d{1,2}:\d{2}$|^[.\d\s%]+$|訂單編號|pin\s*碼|最低價格保證|酒店入住保障|入住保障|價格保證|已付款|已使用|已用|節省|價格詳情|現在可|您可以在|取消政策|免費取消|不設退款|入住[：:]|退房[：:]|修改日期|發送訊息|電話及電郵|住宿詳情|查看地圖|當地語言地址|管理訂單|取消訂單|延長住宿|^位置$|^地址$|^notice/i;
  function scanFirstMeaningfulLine(text){
    var lines = text.split('\n').map(function(l){ return l.trim(); }).filter(function(l){ return l.length>=2 && !SCAN_LINE_NOISE.test(l); });
    return lines[0] || '';
  }
  // hotel names reliably contain "酒店/飯店/Hotel/Resort/Inn" — searching for
  // that keyword directly skips straight past all the chrome text above it,
  // instead of relying on "first non-noise line" which still tends to catch
  // whichever chrome line the noise list doesn't yet know about.
  var SCAN_HOTEL_NAME_HINT = /(酒店|飯店|賓館|hotel|resort|hostel|inn\b|guesthouse)/i;
  var SCAN_HOTEL_NAME_NOISE = /第\s*\d+\s*名|精選|入住保障|價格保證/;
  function scanFindHotelName(text){
    var lines = text.split('\n').map(function(l){ return l.trim(); }).filter(function(l){ return l.length>=2; });
    for (var i=0;i<lines.length;i++){
      if (SCAN_HOTEL_NAME_HINT.test(lines[i]) && !SCAN_HOTEL_NAME_NOISE.test(lines[i]) && !SCAN_LINE_NOISE.test(lines[i])) return lines[i];
    }
    return scanFirstMeaningfulLine(text);
  }
  // ---- receipts: shop name + what was actually bought ----
  // A till receipt's own header lines (Slip / Staff / Trans / Date / card
  // digits / the thank-you footer) are all noise; the shop name is the first
  // real line, and the purchased item sits on a line of its own, usually
  // prefixed by a barcode/SKU number and followed by its price.
  var SCAN_RECEIPT_NOISE = /^(slip|staff|trans|date|time|description|amount|items?|total|subtotal|change|cash|visa|master|unionpay|payme|octopus|approval|invoice|tel|no signature|welcome|thank|歡迎|欢迎|打造|多謝|多谢|謝謝|谢谢|請保留|请保留|簽名|签名|收據|收据|發票|发票|統一編號|统一编号)\b/i;
  var SCAN_RECEIPT_NOISE_ANY = /(\*{3,}|approval code|no signature|qr code|number of items|master card|visa|scan the qr|feedback|顧客體驗|顾客体验|意見|意见)/i;
  function scanReceiptLines(text){
    return text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  }
  function scanFindMerchant(text){
    var lines = scanReceiptLines(text);
    for (var i = 0; i < lines.length; i++){
      var l = lines[i];
      if (l.length < 2) continue;
      if (/^\d[\d\s.,:*\/-]*$/.test(l)) continue;          // pure numbers / times
      if (SCAN_RECEIPT_NOISE.test(l) || SCAN_RECEIPT_NOISE_ANY.test(l)) continue;
      if (SCAN_LINE_NOISE.test(l)) continue;
      if (/^[-=_.\s]+$/.test(l)) continue;                  // separator rules
      return l.replace(/\s{2,}/g, ' ');
    }
    return '';
  }
  function scanFindReceiptItem(text){
    var lines = scanReceiptLines(text);
    var best = '';
    for (var i = 0; i < lines.length; i++){
      var l = lines[i];
      if (SCAN_RECEIPT_NOISE_ANY.test(l)) continue;
      // "798846212 麥芽酸種麵包    13.0 A"  → the middle is the item name
      var m = /^\d{4,}\s+(.{2,40}?)\s+\d[\d,]*(?:\.\d{1,2})?\s*[A-Za-z]?$/.exec(l);
      if (m && !/^\d+$/.test(m[1].trim())){ return m[1].trim().replace(/\s{2,}/g, ' '); }
      // a line right after an "Items:" header
      if (/^items?\s*[:：]?$/i.test(l) && lines[i+1]){
        var next = lines[i+1].replace(/^\d{4,}\s*/, '').replace(/\s+\d[\d,]*(?:\.\d{1,2})?\s*[A-Za-z]?$/, '').trim();
        if (next.length >= 2 && !/^\d+$/.test(next)) return next.replace(/\s{2,}/g, ' ');
      }
      // generic "<name> <price>" line, kept only as a weaker fallback
      if (!best){
        var g = /^([^\d][^\n]{1,38}?)\s+\d[\d,]*\.\d{1,2}\s*[A-Za-z]?$/.exec(l);
        if (g && !SCAN_RECEIPT_NOISE.test(g[1]) && !SCAN_TOTAL_LINE.test(g[1])) best = g[1].trim();
      }
    }
    return best;
  }
  // the address sits right after a "位置/地址/Location/Address" label in
  // these screenshots, or otherwise looks like "<number> <street>, <area>".
  // an address names a street/district; requiring one of those words keeps
  // the loose "<number> ..., ..." fallback from swallowing prose that merely
  // happens to contain a number and a comma (a cancellation policy, say).
  var SCAN_ADDRESS_HINT = /(alley|street|st\.|road|rd\.|avenue|ave\.|lane|soi|blvd|district|floor|巷|街|路|道|區|区|里|號|号|樓|楼|層|层)/i;
  function scanFindAddress(text){
    var lines = text.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
    for (var i=0;i<lines.length;i++){
      if (/^(位置|地址|location|address)[:：]?$/i.test(lines[i]) && lines[i+1]) return lines[i+1];
      var inline = /^(?:位置|地址|location|address)\s*[:：]\s*(.+)$/i.exec(lines[i]);
      if (inline && inline[1].trim().length >= 4) return inline[1].trim();
    }
    for (var j=0;j<lines.length;j++){
      var l = lines[j];
      if (l.length < 6 || l.length > 90) continue;
      if (SCAN_LINE_NOISE.test(l) || SCAN_DATE_NOISE.test(l)) continue;
      if (/(免費取消|不設退款|取消政策|您可以在|退款)/.test(l)) continue;
      if (/[,，]/.test(l) && SCAN_ADDRESS_HINT.test(l) && /\d/.test(l)) return l;
    }
    return '';
  }
  function parseScanText(){
    var d = scanDraft, text = d.rawText || '';
    var dates = scanFindDates(text), times = scanFindTimes(text), amt = scanFindAmount(text);
    if (d.kind === 'itinerary'){
      var route = scanFindRoute(text), flightNo = scanFindFlightNo(text);
      var title = route ? (route.fromCity+'（'+route.fromCode+'）→ '+route.toCity+'（'+route.toCode+'）'+(flightNo?(' '+flightNo):'')) : scanFirstMeaningfulLine(text);
      d.parsed = { title:title, date: dates[0]||'', time: times[0]||'12:00', category: route ? '交通' : '景點' };
    } else if (d.kind === 'hotel'){
      var range = scanFindDateRange(text);
      var address = scanFindAddress(text);
      var notesParts = [];
      if (amt) notesParts.push('金額參考：'+scanFormatMoney(amt));
      if (address) notesParts.push('地址：'+address);
      d.parsed = {
        name: scanFindHotelName(text),
        checkIn: range ? range.checkIn : (dates[0]||''),
        checkOut: range ? range.checkOut : (dates[1]||''),
        notes: notesParts.join('\n')
      };
    } else if (d.kind === 'receipt'){
      // "IKEA 麥芽酸種麵包" reads far better than either half alone, so use
      // the shop name AND the purchased item whenever both can be found.
      var merchant = scanFindMerchant(text);
      var item = scanFindReceiptItem(text);
      var receiptTitle = (merchant && item) ? (merchant + ' ' + item) : (merchant || item || scanFirstMeaningfulLine(text));
      d.parsed = {
        title: receiptTitle,
        amount: amt ? amt.amount : '',
        currency: scanGuessCurrency(amt),
        date: dates[0] || ''
      };
    }
  }
  function applyScanResult(){
    syncScanTextFromDOM();
    if (!scanDraft.parsed) parseScanText();
    var d = scanDraft, p = d.parsed || {};
    var gt = document.getElementById('scan-g-title');
    var gdate = document.getElementById('scan-g-date');
    var gtime = document.getElementById('scan-g-time');
    var gin = document.getElementById('scan-g-checkin');
    var gout = document.getElementById('scan-g-checkout');
    var gamt = document.getElementById('scan-g-amount');
    var gcur = document.getElementById('scan-g-currency');
    if (d.kind === 'itinerary'){
      var title = gt ? gt.value : (p.title||'');
      var date = gdate ? gdate.value : (p.date||'');
      var time = gtime ? gtime.value : (p.time||'12:00');
      var matchedDayIdx = state.itineraryDayIndex;
      if (date) trip.days.forEach(function(day,i){ if (day.date===date) matchedDayIdx=i; });
      itineraryItemDraft = {
        dayIndex: matchedDayIdx, time: time||'12:00', title: title||'',
        category: (p.category && ITEM_CATEGORIES.indexOf(p.category)>=0) ? p.category : ITEM_CATEGORIES[0],
        region: (trip.regions && trip.regions[0] ? trip.regions[0].name : '')
      };
      scanDraft = null;
      openModal('addItineraryItem');
    } else if (d.kind === 'hotel'){
      hotelDraft = { id:null, name: gt?gt.value:(p.name||''), checkIn: gin?gin.value:(p.checkIn||''), checkOut: gout?gout.value:(p.checkOut||''), notes: p.notes||'' };
      scanDraft = null;
      openModal('addHotel');
    } else if (d.kind === 'receipt'){
      var title2 = gt ? gt.value : (p.title||'');
      var amount2 = gamt ? gamt.value : (p.amount||'');
      var currency2 = gcur ? gcur.value : (p.currency||'HKD');
      var date2 = gdate ? gdate.value : (p.date||'');
      expenseDraft = freshExpenseDraft({ title:title2, date:date2 });
      expenseDraft.amount = amount2 || '';
      expenseDraft.currency = currency2 || 'HKD';
      scanDraft = null;
      openModal('addExpense');
    }
  }
  function renderScanModal(){
    if (!scanDraft) scanDraft = freshScanDraft();
    var d = scanDraft;
    if (!d.kind){
      return '' +
        '<div class="sheet-handle"></div>' +
        '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
        '<div class="sheet-title">AI 掃描新增</div>' +
        '<div style="font-size:12.5px;color:var(--muted);margin:-6px 0 16px 0;">影低張相（例如 Trip.com 訂單截圖、酒店確認、收據），AI 幫你讀出文字再自動填好表格，套用前記得覆核清楚。</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' +
          '<button type="button" class="btn-secondary scan-kind-btn" data-action="setScanKind" data-key="itinerary">'+icon('camera',18)+'<span>機票／票券／行程活動截圖</span></button>' +
          '<button type="button" class="btn-secondary scan-kind-btn" data-action="setScanKind" data-key="hotel">'+icon('camera',18)+'<span>酒店訂房截圖</span></button>' +
          '<button type="button" class="btn-secondary scan-kind-btn" data-action="setScanKind" data-key="receipt">'+icon('camera',18)+'<span>消費收據</span></button>' +
        '</div>' +
        '<div class="modal-actions"><button class="btn-secondary" data-action="closeModal" style="width:100%;">取消</button></div>';
    }
    var kindLabel = d.kind==='itinerary' ? '機票／票券／行程活動' : (d.kind==='hotel' ? '酒店訂房' : '消費收據');
    var langChips = Object.keys(SCAN_LANG_LABELS).map(function(k){
      return '<button type="button" class="chip scan-lang-chip '+(d.langs[k]?'active':'')+'" data-action="toggleScanLang" data-key="'+k+'">'+SCAN_LANG_LABELS[k]+'</button>';
    }).join('');
    var p = d.parsed, guessHTML = '';
    if (p){
      if (d.kind==='itinerary'){
        guessHTML = '<div class="field"><label>標題</label><input type="text" id="scan-g-title" value="'+(p.title||'').replace(/"/g,'&quot;')+'"></div>' +
          '<div class="row-2"><div class="field"><label>日期</label><input type="date" id="scan-g-date" value="'+(p.date||'')+'"></div><div class="field"><label>時間</label><input type="time" id="scan-g-time" value="'+(p.time||'12:00')+'"></div></div>';
      } else if (d.kind==='hotel'){
        guessHTML = '<div class="field"><label>酒店名稱</label><input type="text" id="scan-g-title" value="'+(p.name||'').replace(/"/g,'&quot;')+'"></div>' +
          '<div class="row-2"><div class="field"><label>入住</label><input type="date" id="scan-g-checkin" value="'+(p.checkIn||'')+'"></div><div class="field"><label>退房</label><input type="date" id="scan-g-checkout" value="'+(p.checkOut||'')+'"></div></div>';
      } else {
        guessHTML = '<div class="field"><label>項目</label><input type="text" id="scan-g-title" value="'+(p.title||'').replace(/"/g,'&quot;')+'"></div>' +
          '<div class="row-2"><div class="field"><label>金額</label><input type="number" id="scan-g-amount" value="'+(p.amount||'')+'"></div><div class="field"><label>貨幣</label><select id="scan-g-currency">'+currencyOptionsHTML(p.currency||'HKD')+'</select></div></div>' +
          '<div class="field"><label>日期</label><input type="date" id="scan-g-date" value="'+(p.date||'')+'"></div>';
      }
    }
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">AI 掃描 · '+kindLabel+'</div>' +
      '<button type="button" class="link-btn" data-action="resetScanKind" style="margin:-8px 0 14px 0;">← 重新揀類型</button>' +
      '<div class="field"><label>相片語言（可揀多種）</label><div style="display:flex;flex-wrap:wrap;gap:6px;">'+langChips+'</div></div>' +
      '<div class="field"><label>其他語言代碼（Tesseract 語言碼，逗號分開，例如 spa,deu；非必填）</label><input type="text" id="scan-extra-langs" value="'+(d.extraLangs||'')+'"></div>' +
      '<div class="field"><label>1. 上傳相片（或者跳過，直接喺下面貼上文字）</label><input type="file" accept="image/*" id="scan-file"></div>' +
      (d.busy ? '<div class="hint" style="color:var(--muted);">🔄 OCR 掃描緊，請稍等（第一次用需要下載語言包，可能需時）...</div>' : '') +
      (d.error ? '<div class="scan-guess-hint">'+d.error+'</div>' : '') +
      '<div class="field"><label>2. 識別文字（可手動修改，或者直接貼文字上嚟都得）</label><textarea id="scan-rawtext" rows="5" placeholder="OCR 結果會顯示喺度，你都可以自己貼文字上嚟">'+(d.rawText||'')+'</textarea></div>' +
      '<button type="button" class="btn-secondary" style="width:100%;margin-bottom:14px;" data-action="reparseScanText">3. 自動解析文字</button>' +
      (p ? ('<div class="scan-guess-hint">⚠️ AI 猜測結果，套用之前請覆核清楚：</div>'+guessHTML) : '') +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="applyScanResult">套用並開啟表格</button>' +
      '</div>';
  }

  // draft state for add-expense
  var expenseDraft;
  var pendingItemLink = null; // {dayIndex, itemIndex} — set when an expense is created from an itinerary item
  function freshExpenseDraft(prefill){
    var d = {
      id:null, title:'', amount:'', category:'餐飲', paidBy:'you', currency: defaultCurrencyForTrip(),
      participants: members.map(function(m){ return m.id; }),
      splitType:'equal', custom:{}, percent:{}, date: new Date().toISOString().slice(0,10), notes:''
    };
    if (prefill){
      if (prefill.title) d.title = prefill.title;
      if (prefill.category) d.category = prefill.category;
      if (prefill.date) d.date = prefill.date;
    }
    return d;
  }
  // rebuilds an editable draft from an EXISTING expense record, so the same
  // modal/submit machinery used for "add" can also save changes back onto it.
  // amount/custom-split values are converted back into the expense's own
  // original currency (everything is stored internally in HKD).
  function expenseDraftFromExisting(e){
    var currency = e.currency || 'HKD';
    var rate = findCurrency(currency).rate;
    var amount = (currency !== 'HKD' && e.originalAmount) ? e.originalAmount : e.amount;
    var custom = {}, percent = {};
    if (e.splitType === 'custom' && e.shares){
      Object.keys(e.shares).forEach(function(id){ custom[id] = Math.round(e.shares[id] / rate); });
    } else if (e.splitType === 'percentage' && e.shares){
      Object.keys(e.shares).forEach(function(id){ percent[id] = e.shares[id]; });
    }
    return {
      id: e.id, title: e.title, amount: amount, category: e.category, paidBy: e.paidBy, currency: currency,
      participants: e.participants.slice(), splitType: e.splitType, custom: custom, percent: percent,
      date: e.date, notes: e.notes || ''
    };
  }

  function renderExpenseModal(){
    if (!expenseDraft) expenseDraft = freshExpenseDraft();
    var d = expenseDraft;
    var n = d.participants.length;
    var equalEach = n ? d.amount/n : 0;

    var splitSection = '';
    if (d.splitType === 'equal'){
      splitSection = '<div style="font-size:12.5px;color:var(--muted);">平均分攤：每人 <b class="num">'+fmt(equalEach||0)+'</b></div>';
    } else if (d.splitType === 'custom'){
      var sum = 0;
      splitSection = d.participants.map(function(id){
        var v = d.custom[id]!==undefined ? d.custom[id] : '';
        if (v) sum += Number(v);
        return '<div class="split-row"><div style="flex:1;font-size:13px;">'+findMember(id).name+'</div><input type="number" data-role="customAmt" data-id="'+id+'" value="'+v+'" placeholder="0"></div>';
      }).join('');
      var diff = Math.round((Number(d.amount)||0) - sum);
      splitSection += '<div class="hint '+(diff===0?'ok':'bad')+'">'+(diff===0 ? '總額相符 ✓' : ('尚差 '+fmt(diff)+' 未分配'))+'</div>';
    } else {
      var psum = 0;
      splitSection = d.participants.map(function(id){
        var v = d.percent[id]!==undefined ? d.percent[id] : '';
        if (v) psum += Number(v);
        return '<div class="split-row"><div style="flex:1;font-size:13px;">'+findMember(id).name+'</div><input type="number" data-role="customPct" data-id="'+id+'" value="'+v+'" placeholder="0">%</div>';
      }).join('');
      splitSection += '<div class="hint '+(psum===100?'ok':'bad')+'">'+(psum===100 ? '總和 100% ✓' : ('目前總和 '+psum+'%'))+'</div>';
    }

    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">'+(d.id?'編輯支出':'新增支出')+'</div>' +
      '<div class="field"><label>項目</label><input type="text" id="f-title" value="'+d.title+'" placeholder="例如：東京酒店"></div>' +
      '<div class="row-2">' +
        '<div class="field"><label>金額</label><input type="number" id="f-amount" value="'+d.amount+'" placeholder="0"></div>' +
        '<div class="field"><label>貨幣</label><select id="f-currency">'+currencyOptionsHTML(d.currency)+'</select></div>' +
      '</div>' +
      (d.currency!=='HKD' ? ('<div class="hint" id="f-currency-hint" style="color:var(--muted);margin:-8px 0 14px 0;">≈ '+fmt(convertToHKD(d.amount, d.currency))+'（參考匯率，非即時）</div>') : '') +
      '<div class="field"><label>類別</label><select id="f-category">'+expenseCategories.map(function(c){ return '<option '+(c===d.category?'selected':'')+'>'+c+'</option>'; }).join('')+'</select></div>' +
      '<div class="field"><label>日期</label><input type="date" id="f-date" value="'+d.date+'"></div>' +
      '<div class="field"><label>誰付款？</label><div class="member-pick">' +
        members.map(function(m){ return '<div class="member-chip '+(d.paidBy===m.id?'selected':'')+'" data-action="setPaidBy" data-id="'+m.id+'">'+avatarHTML(m.id)+'<span>'+m.name+'</span></div>'; }).join('') +
      '</div></div>' +
      '<div class="field"><label>誰需要分攤？</label><div class="member-pick">' +
        members.map(function(m){ return '<div class="member-chip '+(d.participants.indexOf(m.id)!==-1?'selected':'')+'" data-action="toggleParticipant" data-id="'+m.id+'">'+avatarHTML(m.id)+'<span>'+m.name+'</span></div>'; }).join('') +
      '</div></div>' +
      '<div class="field"><label>分攤方式</label><div class="radio-row">' +
        '<div class="radio-opt '+(d.splitType==='equal'?'selected':'')+'" data-action="setSplitType" data-key="equal">平均分攤</div>' +
        '<div class="radio-opt '+(d.splitType==='custom'?'selected':'')+'" data-action="setSplitType" data-key="custom">自訂金額</div>' +
        '<div class="radio-opt '+(d.splitType==='percentage'?'selected':'')+'" data-action="setSplitType" data-key="percentage">自訂比例</div>' +
      '</div></div>' +
      '<div class="field">'+splitSection+'</div>' +
      '<div class="field"><label>備註（optional）</label><textarea id="f-notes">'+d.notes+'</textarea></div>' +
      '<div class="modal-actions">' +
        (d.id ? '<button class="btn-secondary" data-action="deleteExpense" data-id="'+d.id+'" style="color:var(--negative);">刪除</button>' : '<button class="btn-secondary" data-action="closeModal">取消</button>') +
        '<button class="btn-primary" data-action="submitExpense">'+(d.id?'儲存':'加入支出')+'</button>' +
      '</div>';
  }

  function syncExpenseDraftFromDOM(){
    var d = expenseDraft;
    var t = document.getElementById('f-title'); if (t) d.title = t.value;
    var a = document.getElementById('f-amount'); if (a) d.amount = a.value;
    var cur = document.getElementById('f-currency'); if (cur) d.currency = cur.value;
    var c = document.getElementById('f-category'); if (c) d.category = c.value;
    var dt = document.getElementById('f-date'); if (dt) d.date = dt.value;
    var no = document.getElementById('f-notes'); if (no) d.notes = no.value;
  }
  function updateCurrencyHintOnly(){
    var amtEl = document.getElementById('f-amount');
    var hintEl = document.getElementById('f-currency-hint');
    if (amtEl && hintEl && expenseDraft && expenseDraft.currency !== 'HKD'){
      hintEl.textContent = '≈ ' + fmt(convertToHKD(amtEl.value, expenseDraft.currency)) + '（參考匯率，非即時）';
    }
  }

  var shoppingDraft;
  function freshShoppingDraft(){
    return {name:'', quantity:1, estimatedPrice:'', category:shopCategoryOrder[0], assignedTo:'you', notes:''};
  }
  function renderShoppingModal(){
    if (!shoppingDraft) shoppingDraft = freshShoppingDraft();
    var d = shoppingDraft;
    var allCats = shopCategoryOrder.slice();
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">新增購物項目</div>' +
      '<div class="field"><label>項目名稱</label><input type="text" id="sf-name" value="'+d.name+'" placeholder="例如：旅行轉插"></div>' +
      '<div class="row-2">' +
        '<div class="field"><label>數量</label><input type="number" id="sf-qty" value="'+d.quantity+'"></div>' +
        '<div class="field"><label>預計價格</label><input type="number" id="sf-price" value="'+d.estimatedPrice+'" placeholder="0"></div>' +
      '</div>' +
      '<div class="field"><label>類別</label><select id="sf-category">'+allCats.map(function(c){ return '<option '+(c===d.category?'selected':'')+'>'+c+'</option>'; }).join('')+'<option value="__new__">＋ 自訂類別…</option></select></div>' +
      '<div class="field"><label>負責人</label><div class="member-pick">' +
        members.map(function(m){ return '<div class="member-chip '+(d.assignedTo===m.id?'selected':'')+'" data-action="setShopAssignee" data-id="'+m.id+'">'+avatarHTML(m.id)+'<span>'+m.name+'</span></div>'; }).join('') +
        '<div class="member-chip '+(d.assignedTo===EVERYONE_ID?'selected':'')+'" data-action="setShopAssignee" data-id="'+EVERYONE_ID+'">'+assigneeAvatarHTML(EVERYONE_ID)+'<span>大家都想要</span></div>' +
      '</div></div>' +
      '<div class="field"><label>備註（optional）</label><textarea id="sf-notes">'+d.notes+'</textarea></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="submitShopping">加入清單</button>' +
      '</div>';
  }

  function syncShoppingDraftFromDOM(){
    var d = shoppingDraft;
    var n = document.getElementById('sf-name'); if (n) d.name = n.value;
    var q = document.getElementById('sf-qty'); if (q) d.quantity = q.value;
    var p = document.getElementById('sf-price'); if (p) d.estimatedPrice = p.value;
    var no = document.getElementById('sf-notes'); if (no) d.notes = no.value;
  }

  function renderPurchaseModal(item){
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">標記為已購買</div>' +
      '<div style="font-size:14px;font-weight:600;margin-bottom:14px;">'+item.name+'</div>' +
      '<div class="field"><label>實際花費</label><input type="number" id="pf-actual" value="'+(item.estimatedPrice||'')+'" placeholder="0"></div>' +
      '<div class="toggle-row" style="margin-top:0;">' +
        '<span>加入旅程支出（'+(item.assignedTo===EVERYONE_ID ? '由你先墊支' : ('由 '+assigneeName(item.assignedTo)+' 支付'))+'，全部團員平均分攤）</span>' +
        '<div class="switch on" data-action="togglePurchaseAddExpense"><div class="knob"></div></div>' +
      '</div>' +
      '<div class="modal-actions" style="margin-top:16px;">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="confirmPurchase" data-id="'+item.id+'">確認已購買</button>' +
      '</div>';
  }

  function renderItemActionsModal(item){
    var statusLine = item.status==='purchased' ? ('✓ 已由 '+assigneeName(item.assignedTo)+' 購買 · 實際 '+fmt(item.actualPrice)) : (item.status==='not_needed' ? '已標記為不需要' : '待購買');
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">'+item.name+'</div>' +
      '<div style="font-size:12.5px;color:var(--muted);margin-bottom:16px;">'+statusLine+'</div>' +
      '<div class="modal-actions" style="flex-direction:column;gap:10px;">' +
        (item.status!=='purchased' ? '<button class="btn-primary" data-action="startPurchase" data-id="'+item.id+'">標記為已購買</button>' : '') +
        (item.status!=='not_needed' ? '<button class="btn-secondary" data-action="markNotNeeded" data-id="'+item.id+'">標記為不需要</button>' : '') +
        (item.status!=='pending' ? '<button class="btn-secondary" data-action="markPending" data-id="'+item.id+'">改回待購買</button>' : '') +
      '</div>';
  }

  // ---------- modals: itinerary + candidates ----------

  var itineraryItemDraft;
  function freshItineraryItemDraft(){
    return {dayIndex: state.itineraryDayIndex, time:'12:00', title:'', category:ITEM_CATEGORIES[0], region:(trip.regions&&trip.regions[0]?trip.regions[0].name:'')};
  }
  function dayOptionsHTML(selectedIdx){
    return trip.days.map(function(d,idx){ return '<option value="'+idx+'" '+(idx===selectedIdx?'selected':'')+'>第 '+(idx+1)+' 日（'+formatDayDate(d.date)+'）</option>'; }).join('');
  }
  function renderAddItineraryItemModal(){
    if (!itineraryItemDraft) itineraryItemDraft = freshItineraryItemDraft();
    var d = itineraryItemDraft;
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">新增行程活動</div>' +
      '<div class="field"><label>邊一日？</label><select id="if-day">'+dayOptionsHTML(d.dayIndex)+'</select></div>' +
      '<div class="field"><label>1. 先揀地區</label>' +
        '<div style="display:flex;gap:8px;align-items:center;">' +
          '<select id="if-region" style="flex:1;">'+regionOptionsHTML(d.region)+'</select>' +
          '<button type="button" class="btn-secondary" style="flex:none;padding:11px 14px;white-space:nowrap;" data-action="openAddRegionForItinerary">＋新增地區</button>' +
        '</div>' +
        googleMapsSearchLinkHTML(d.region) +
      '</div>' +
      '<div class="field"><label>2. 呢個地區入邊，你想去邊度？</label><input type="text" id="if-title" value="'+d.title+'" placeholder="例如：明治神宮"></div>' +
      '<div class="row-2">' +
        '<div class="field"><label>時間</label><input type="time" id="if-time" value="'+d.time+'"></div>' +
        '<div class="field"><label>類別</label><select id="if-category">'+ITEM_CATEGORIES.map(function(c){ return '<option '+(c===d.category?'selected':'')+'>'+c+'</option>'; }).join('')+'</select></div>' +
      '</div>' +
      '<div class="hint" style="color:var(--muted);margin:-6px 0 14px 0;">地區用嚟幫「AI 智能排序」計算最順路嘅次序</div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="submitItineraryItem">加入行程</button>' +
      '</div>';
  }
  function submitItineraryItem(){
    var dayIdx = Number(document.getElementById('if-day').value);
    var time = document.getElementById('if-time').value || '12:00';
    var category = document.getElementById('if-category').value;
    var title = document.getElementById('if-title').value;
    var regionSel = document.getElementById('if-region');
    var region = regionSel ? regionSel.value : null;
    if (!title){ showAlert('請輸入活動名稱。'); return; }
    var day = trip.days[dayIdx];
    var regionObj = region ? findRegion(region) : null;
    var loc = regionObj ? regionObj.loc : {x:50,y:50};
    day.items.push({id:nextId('d'+(dayIdx+1)+'-'), time:time, title:title, category:category, loc:loc, done:false, linkedExpenseId:null});
    day.items.sort(function(a,b){ return a.time < b.time ? -1 : (a.time>b.time?1:0); });
    itineraryItemDraft = null;
    state.itineraryDayIndex = dayIdx;
    markDirty();
    closeModal();
  }

  function renderOptimizeDayModal(){
    var p = state.lastOptimizePreview;
    if (!p) return '<div class="sheet-title">冇嘢可以優化</div>';
    var day = trip.days[p.dayIndex];
    if (!p.improved){
      return '' +
        '<div class="sheet-handle"></div>' +
        '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
        '<div class="sheet-title">AI 智能排序</div>' +
        '<div style="font-size:13.5px;color:var(--muted);">目前呢一日嘅順序已經幾順路，冇再優化嘅空間喇。</div>' +
        '<div class="modal-actions" style="margin-top:16px;"><button class="btn-primary" data-action="closeModal">知道啦</button></div>';
    }
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">AI 智能排序</div>' +
      '<div style="font-size:13px;color:var(--muted);margin-bottom:12px;">按位置估算，新順序可以慳返約 <b class="num" style="color:var(--positive);">'+p.savedMinutes+' 分鐘</b> 路程：</div>' +
      p.order.map(function(origIdx, newPos){
        return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-top:'+(newPos>0?'1px solid var(--line)':'none')+';">' +
          '<div class="num" style="width:44px;font-size:12px;color:var(--muted);">'+day.items[origIdx].time+'</div>' +
          '<div style="flex:1;font-size:13.5px;font-weight:600;">'+day.items[origIdx].title+'</div>' +
        '</div>';
      }).join('') +
      '<div class="modal-actions" style="margin-top:16px;">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="applyOptimizeDay">套用新順序</button>' +
      '</div>';
  }

  var candidateDraft;
  function freshCandidateDraft(){ return {name:'', category:ITEM_CATEGORIES[0], area:(trip.regions&&trip.regions[0]?trip.regions[0].name:''), notes:'', refLink:''}; }
  function renderAddCandidateModal(){
    if (!candidateDraft) candidateDraft = freshCandidateDraft();
    var d = candidateDraft;
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">新增想去嘅地方</div>' +
      '<div class="field"><label>1. 先揀地區</label>' +
        '<div style="display:flex;gap:8px;align-items:center;">' +
          '<select id="cf-area" style="flex:1;">'+regionOptionsHTML(d.area)+'</select>' +
          '<button type="button" class="btn-secondary" style="flex:none;padding:11px 14px;white-space:nowrap;" data-action="openAddRegionForCandidate">＋新增地區</button>' +
        '</div>' +
        googleMapsSearchLinkHTML(d.area) +
      '</div>' +
      '<div class="field"><label>2. 呢個地區入邊，你諗住去邊度？</label><input type="text" id="cf-name" value="'+d.name+'" placeholder="例如：一蘭拉麵"></div>' +
      '<div class="field"><label>類別</label><select id="cf-category">'+ITEM_CATEGORIES.map(function(c){ return '<option '+(c===d.category?'selected':'')+'>'+c+'</option>'; }).join('')+'</select></div>' +
      '<div class="field"><label>參考連結（optional，例如 IG／Threads 帖子）</label><input type="text" id="cf-reflink" value="'+d.refLink+'" placeholder="貼上個帖子連結"></div>' +
      '<div class="field"><label>備註（optional）</label><textarea id="cf-notes">'+d.notes+'</textarea></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="submitCandidate">加入清單</button>' +
      '</div>';
  }
  function submitCandidate(){
    var name = document.getElementById('cf-name').value;
    if (!name){ showAlert('請輸入地方名稱。'); return; }
    var category = document.getElementById('cf-category').value;
    var areaSel = document.getElementById('cf-area');
    var area = areaSel ? areaSel.value : (candidateDraft && candidateDraft.area) || '';
    var notes = document.getElementById('cf-notes').value;
    var refLinkRaw = document.getElementById('cf-reflink').value.trim();
    var refLink = refLinkRaw ? (/^https?:\/\//i.test(refLinkRaw) ? refLinkRaw : ('https://' + refLinkRaw)) : '';
    var regionObj = area ? findRegion(area) : null;
    var loc = regionObj ? regionObj.loc : {x:30+Math.random()*40,y:30+Math.random()*40};
    candidatePlaces.push({id:nextId('c'), name:name, category:category, area:area, notes:notes, refLink:refLink, loc:loc, selected:false, addedToDay:null});
    candidateDraft = null;
    markDirty();
    closeModal();
  }

  function renderSuggestRouteModal(){
    var p = state.lastRoutePreview;
    if (!p) return '<div class="sheet-title">請先剔選至少兩個地方</div>';
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">建議路線</div>' +
      '<div style="font-size:13px;color:var(--muted);margin-bottom:12px;">按你剔選嘅地方，最順路嘅次序、預計車程步行時間共 <b class="num">'+p.totalMinutes+' 分鐘</b>：</div>' +
      p.ordered.map(function(c, idx){
        return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-top:'+(idx>0?'1px solid var(--line)':'none')+';">' +
          '<div style="width:20px;font-size:12px;color:var(--muted);" class="num">'+(idx+1)+'</div>' +
          '<div style="flex:1;"><div style="font-size:13.5px;font-weight:600;">'+c.name+'</div><div style="font-size:11px;color:var(--muted);">'+c.category+' · '+c.area+'</div></div>' +
        '</div>';
      }).join('') +
      '<div class="field" style="margin-top:14px;"><label>加入邊一日？</label><select id="rf-day">'+dayOptionsHTML(state.itineraryDayIndex)+'</select></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="applySuggestedRoute">加入呢一日</button>' +
      '</div>';
  }

  function renderLuckyDrawModal(){
    var cats = ['全部'].concat(ITEM_CATEGORIES.filter(function(c){ return candidatePlaces.some(function(p){ return p.category===c; }); }));
    var picked = state.lastLuckyPick ? candidatePlaces.filter(function(c){ return c.id===state.lastLuckyPick; })[0] : null;
    var html = '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">抽籤決定去邊</div>' +
      '<div class="chip-row" style="margin-bottom:16px;">' +
        cats.map(function(c){ return '<div class="chip '+(state.luckyFilterCat===c?'active':'')+'" data-action="setLuckyFilter" data-key="'+c+'">'+c+'</div>'; }).join('') +
      '</div>';
    if (picked){
      html += '<div class="lucky-reveal">' + icon('dice',34,'var(--accent)') +
        '<div class="name">'+picked.name+'</div>' +
        '<div style="font-size:12.5px;color:var(--muted);">'+picked.category+' · '+picked.area+'</div>' +
      '</div>' +
      '<div class="field"><label>加入邊一日？</label><select id="lf-day">'+dayOptionsHTML(state.itineraryDayIndex)+'</select></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="drawLucky">再抽一次</button>' +
        '<button class="btn-primary" data-action="applyLuckyPick">加入呢一日</button>' +
      '</div>';
    } else {
      html += '<div class="empty" style="padding:30px 10px;"><p>撳「抽一次」隨機幫你揀一個。</p></div>' +
      '<div class="modal-actions"><button class="btn-primary" style="width:100%;" data-action="drawLucky">'+icon('dice',17,'#fff')+' 抽一次</button></div>';
    }
    return html;
  }

  var purchaseAddExpense = true;

  // ---------- event delegation ----------

  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    if (action === 'overlayClick'){
      if (state.modal && isDialogModalType(state.modal.type)){
        pendingConfirmCallback = null; pendingPromptCallback = null;
        dismissDialogModal(); render(); return;
      }
      if (state.modal && state.modal.type==='pickViewer' && state.modal.payload && state.modal.payload.mustPick) return;
      closeModal(); return;
    }
    if (action === 'confirmDialogOk'){
      var cbConfirm = pendingConfirmCallback; pendingConfirmCallback = null;
      dismissDialogModal(); render();
      if (cbConfirm) cbConfirm();
      return;
    }
    if (action === 'confirmDialogCancel'){ pendingConfirmCallback = null; dismissDialogModal(); render(); return; }
    if (action === 'promptDialogOk'){
      var promptEl = document.getElementById('dialog-prompt-input');
      var promptVal = promptEl ? promptEl.value.trim() : '';
      var cbPrompt = pendingPromptCallback; pendingPromptCallback = null;
      dismissDialogModal(); render();
      if (cbPrompt) cbPrompt(promptVal || null);
      return;
    }
    if (action === 'promptDialogCancel'){ pendingPromptCallback = null; dismissDialogModal(); render(); return; }
    if (action === 'alertDialogOk'){ dismissDialogModal(); render(); return; }
    if (action === 'stop'){ return; }

    if (action === 'setTab'){ state.tab = el.getAttribute('data-key'); render(); return; }
    if (action === 'setExpenseSubTab'){ state.expenseSubTab = el.getAttribute('data-key'); render(); return; }
    if (action === 'filterCat'){ state.expenseFilterCat = el.getAttribute('data-key'); render(); return; }
    if (action === 'filterMember'){ var v = el.getAttribute('data-key'); state.expenseFilterMember = v || null; render(); return; }
    if (action === 'toggleDemoStarted'){ state.demoTripStarted = !isTripStarted(); render(); return; }
    if (action === 'stubAlert'){ showAlert(el.getAttribute('data-msg')); return; }

    if (action === 'openAddExpense'){ expenseDraft = freshExpenseDraft(); openModal('addExpense'); return; }
    if (action === 'openEditExpense'){
      var expToEdit = expenses.filter(function(e){ return e.id === el.getAttribute('data-id'); })[0];
      if (!expToEdit) return;
      expenseDraft = expenseDraftFromExisting(expToEdit);
      openModal('addExpense');
      return;
    }
    if (action === 'deleteExpense'){
      var delExpId = el.getAttribute('data-id');
      showConfirm('確定要刪除呢筆支出？此操作無法復原。', function(){
        expenses = expenses.filter(function(e){ return e.id !== delExpId; });
        expenseDraft = null;
        markDirty();
        closeModal();
      });
      return;
    }
    if (action === 'openAddShopping'){ shoppingDraft = freshShoppingDraft(); openModal('addShopping'); return; }
    if (action === 'openScan'){ scanDraft = freshScanDraft(); openModal('scan'); return; }
    if (action === 'openSync'){ syncDraft = freshSyncDraft(); openModal('sync'); return; }
    if (action === 'saveFirebaseConfig'){
      var cfgEl = document.getElementById('sync-config');
      var cfgTxt = cfgEl ? cfgEl.value.trim() : '';
      if (!cfgTxt){ showAlert('請貼上 Firebase 設定。'); return; }
      var parsedCfg = parseFirebaseConfigText(cfgTxt);
      if (!parsedCfg){ showAlert('呢個設定睇落唔啱，請確認完整複製咗成個 firebaseConfig。'); return; }
      firebaseSavedConfigText = cfgTxt;
      try{ localStorage.setItem(FIREBASE_CONFIG_KEY, cfgTxt); } catch(err){}
      syncDraft.configText = cfgTxt;
      syncDraft.showAdvanced = false;
      renderModalOnly();
      return;
    }
    if (action === 'resetFirebaseConfig'){
      firebaseSavedConfigText = '';
      try{ localStorage.removeItem(FIREBASE_CONFIG_KEY); } catch(err){}
      syncDraft.configText = '';
      syncDraft.showAdvanced = false;
      renderModalOnly();
      return;
    }
    if (action === 'showSyncAdvanced'){ syncDraft.showAdvanced = true; renderModalOnly(); return; }
    if (action === 'hideSyncAdvanced'){ syncDraft.showAdvanced = false; renderModalOnly(); return; }
    if (action === 'copySyncLink'){
      var linkEl = document.getElementById('sync-share-link');
      var linkText = linkEl ? linkEl.value : syncShareLink();
      var markCopied = function(){ syncDraft.copied = true; renderModalOnly(); };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(linkText).then(markCopied).catch(function(){
          if (linkEl){ linkEl.select(); }
          showAlert('複製唔到，請自己長按揀走條連結。');
        });
      } else if (linkEl){
        linkEl.select();
        try{ document.execCommand('copy'); markCopied(); }
        catch(err){ showAlert('複製唔到，請自己長按揀走條連結。'); }
      }
      return;
    }
    if (action === 'createSyncCode'){
      var newCode = generateSyncCode();
      connectFirebase(activeFirebaseConfigText(), newCode, false);
      pushFirebaseNow();
      renderModalOnly();
      return;
    }
    if (action === 'joinSyncCode'){
      var joinEl = document.getElementById('sync-join-code');
      var joinCode = joinEl ? joinEl.value.trim().toUpperCase() : '';
      if (!joinCode){ showAlert('請輸入同步代碼。'); return; }
      showConfirm('加入同步之後，呢部裝置依家嘅資料會俾同步代碼嗰邊嘅資料覆蓋，確定要繼續？', function(){
        connectFirebase(activeFirebaseConfigText(), joinCode, false);
        renderModalOnly();
      });
      return;
    }
    if (action === 'manualFirebasePush'){ pushFirebaseNow(); return; }
    if (action === 'stopFirebaseSyncAction'){
      showConfirm('停止之後，呢部裝置唔會再自動同步（其他裝置唔受影響），確定？', function(){ stopFirebaseSync(); closeModal(); });
      return;
    }
    if (action === 'setScanKind'){ syncScanTextFromDOM(); scanDraft.kind = el.getAttribute('data-key'); renderModalOnly(); return; }
    if (action === 'resetScanKind'){ scanDraft.kind = null; scanDraft.rawText=''; scanDraft.parsed=null; scanDraft.error=''; renderModalOnly(); return; }
    if (action === 'toggleScanLang'){ syncScanTextFromDOM(); var lk = el.getAttribute('data-key'); scanDraft.langs[lk] = !scanDraft.langs[lk]; renderModalOnly(); return; }
    if (action === 'reparseScanText'){ syncScanTextFromDOM(); parseScanText(); renderModalOnly(); return; }
    if (action === 'applyScanResult'){ applyScanResult(); return; }
    if (action === 'openAddHotel'){ hotelDraft = freshHotelDraft(); openModal('addHotel'); return; }
    if (action === 'openEditHotel'){
      var hid = el.getAttribute('data-id');
      var hotelToEdit = (trip.hotels||[]).filter(function(h){ return h.id===hid; })[0];
      hotelDraft = freshHotelDraft(hotelToEdit);
      openModal('addHotel');
      return;
    }
    if (action === 'submitHotel'){ submitHotel(); return; }
    if (action === 'openEditTripCover'){
      tripCoverDraft = null;
      openModal('editTripCover', {tripId: el.getAttribute('data-id')});
      return;
    }
    if (action === 'clearTripCoverPhoto'){ if (tripCoverDraft){ tripCoverDraft.photo = null; tripCoverDraft.color = null; } renderModalOnly(); return; }
    if (action === 'setTripCoverColor'){ if (tripCoverDraft){ tripCoverDraft.color = el.getAttribute('data-color'); tripCoverDraft.photo = null; } renderModalOnly(); return; }
    if (action === 'submitTripCover'){ submitTripCover(); return; }
    if (action === 'exportTripSummary'){
      var summaryHtml = generateTripSummaryHTML();
      downloadTextFile(trip.name+'-行程總結.html', summaryHtml);
      return;
    }
    if (action === 'deleteHotel'){
      var delHotelId = el.getAttribute('data-id');
      showConfirm('確定要刪除呢個酒店紀錄？', function(){
        trip.hotels = (trip.hotels||[]).filter(function(h){ return h.id !== delHotelId; });
        hotelDraft = null;
        markDirty();
        closeModal();
      });
      return;
    }
    if (action === 'closeModal'){ closeModal(); return; }

    if (action === 'setPaidBy'){ syncExpenseDraftFromDOM(); expenseDraft.paidBy = el.getAttribute('data-id'); renderModalOnly(); return; }
    if (action === 'toggleParticipant'){
      syncExpenseDraftFromDOM();
      var id = el.getAttribute('data-id');
      var idx = expenseDraft.participants.indexOf(id);
      if (idx===-1) expenseDraft.participants.push(id); else expenseDraft.participants.splice(idx,1);
      renderModalOnly(); return;
    }
    if (action === 'setSplitType'){ syncExpenseDraftFromDOM(); expenseDraft.splitType = el.getAttribute('data-key'); renderModalOnly(); return; }
    if (action === 'submitExpense'){ submitExpense(); return; }

    if (action === 'setShopAssignee'){ syncShoppingDraftFromDOM(); shoppingDraft.assignedTo = el.getAttribute('data-id'); renderModalOnly(); return; }
    if (action === 'submitShopping'){ submitShopping(); return; }

    if (action === 'openItemActions'){
      var item = shoppingItems.filter(function(i){ return i.id===el.getAttribute('data-id'); })[0];
      openModal('itemActions', {item:item}); return;
    }
    if (action === 'startPurchase'){
      var item2 = shoppingItems.filter(function(i){ return i.id===el.getAttribute('data-id'); })[0];
      purchaseAddExpense = true;
      openModal('purchase', {item:item2}); return;
    }
    if (action === 'markNotNeeded'){
      var it = shoppingItems.filter(function(i){ return i.id===el.getAttribute('data-id'); })[0];
      it.status='not_needed'; markDirty(); closeModal(); return;
    }
    if (action === 'markPending'){
      var it2 = shoppingItems.filter(function(i){ return i.id===el.getAttribute('data-id'); })[0];
      it2.status='pending'; it2.actualPrice=null; markDirty(); closeModal(); return;
    }
    if (action === 'togglePurchaseAddExpense'){
      purchaseAddExpense = !purchaseAddExpense;
      el.classList.toggle('on', purchaseAddExpense);
      return;
    }
    if (action === 'confirmPurchase'){ confirmPurchase(el.getAttribute('data-id')); return; }

    if (action === 'toggleStaticChecklist'){
      var sidx = Number(el.getAttribute('data-idx'));
      trip.staticChecklist[sidx].done = !trip.staticChecklist[sidx].done;
      markDirty(); render(); return;
    }

    if (action === 'setItineraryView'){ state.itineraryView = el.getAttribute('data-key'); render(); return; }
    if (action === 'selectDay'){ state.itineraryDayIndex = Number(el.getAttribute('data-idx')); render(); return; }
    if (action === 'openAddItineraryItem'){
      itineraryItemDraft = freshItineraryItemDraft();
      openModal('addItineraryItem'); return;
    }
    if (action === 'submitItineraryItem'){ submitItineraryItem(); return; }
    if (action === 'openAddRegionForItinerary'){
      showPrompt('地區名稱（例如：新宿）：', '', function(rname){
        if (rname){ var r = addCustomRegion(rname); itineraryItemDraft.region = r.name; }
        renderModalOnly();
      });
      return;
    }
    if (action === 'toggleItinItemDone'){
      var day1 = trip.days[state.itineraryDayIndex];
      var it1 = day1.items[Number(el.getAttribute('data-idx'))];
      it1.done = !it1.done; markDirty(); render(); return;
    }
    if (action === 'moveItinItem'){
      var day2 = trip.days[state.itineraryDayIndex];
      var idx2 = Number(el.getAttribute('data-idx')), dir = Number(el.getAttribute('data-dir'));
      var swapWith = idx2+dir;
      if (swapWith<0 || swapWith>=day2.items.length) return;
      var tmp = day2.items[idx2]; day2.items[idx2] = day2.items[swapWith]; day2.items[swapWith] = tmp;
      markDirty(); render(); return;
    }
    if (action === 'addExpenseFromItem'){
      var day3 = trip.days[state.itineraryDayIndex];
      var idx3 = Number(el.getAttribute('data-idx'));
      var item3 = day3.items[idx3];
      pendingItemLink = {dayIndex: state.itineraryDayIndex, itemIndex: idx3};
      expenseDraft = freshExpenseDraft({title:item3.title, category:ITEM_TO_EXPENSE_CATEGORY[item3.category]||'其他', date:day3.date});
      openModal('addExpense'); return;
    }
    if (action === 'openOptimizeDay'){
      var day4 = trip.days[state.itineraryDayIndex];
      if (day4.items.length < 3){ state.lastOptimizePreview = {improved:false, dayIndex: state.itineraryDayIndex, order:[]}; openModal('optimizeDay'); return; }
      var locs4 = day4.items.map(function(it){ return it.loc; });
      var origDist = routeDistance(locs4);
      var order4 = nearestNeighborOrder(locs4);
      var newLocs4 = order4.map(function(i){ return locs4[i]; });
      var newDist = routeDistance(newLocs4);
      var improved = newDist < origDist - 0.5;
      state.lastOptimizePreview = {
        improved: improved, dayIndex: state.itineraryDayIndex, order: order4,
        savedMinutes: improved ? Math.round((origDist-newDist)*MINUTES_PER_UNIT) : 0
      };
      openModal('optimizeDay'); return;
    }
    if (action === 'applyOptimizeDay'){
      var p1 = state.lastOptimizePreview;
      var day5 = trip.days[p1.dayIndex];
      var times5 = day5.items.map(function(it){ return it.time; });
      var newItems5 = p1.order.map(function(origIdx){ return day5.items[origIdx]; });
      newItems5.forEach(function(it,i){ it.time = times5[i]; });
      day5.items = newItems5;
      state.lastOptimizePreview = null;
      markDirty();
      closeModal(); return;
    }

    if (action === 'openAddCandidate'){ candidateDraft = freshCandidateDraft(); openModal('addCandidate'); return; }
    if (action === 'submitCandidate'){ submitCandidate(); return; }
    if (action === 'openAddRegionForCandidate'){
      showPrompt('地區名稱（例如：新宿）：', '', function(aname){
        if (aname){ var ar = addCustomRegion(aname); candidateDraft.area = ar.name; }
        renderModalOnly();
      });
      return;
    }
    if (action === 'toggleCandidateSelect'){
      var cidx = Number(el.getAttribute('data-idx'));
      candidatePlaces[cidx].selected = !candidatePlaces[cidx].selected;
      markDirty(); render(); return;
    }
    if (action === 'deleteCandidate'){
      var cidx2 = Number(el.getAttribute('data-idx'));
      candidatePlaces.splice(cidx2,1);
      markDirty(); render(); return;
    }
    if (action === 'openSuggestRoute'){
      var selected = candidatePlaces.filter(function(c){ return c.selected; });
      if (selected.length < 2){ showAlert('請剔選至少兩個地方先可以計算路線。'); return; }
      var locsR = selected.map(function(c){ return c.loc; });
      var orderR = nearestNeighborOrder(locsR);
      var ordered = orderR.map(function(i){ return selected[i]; });
      var totalMinutes = Math.round(routeDistance(orderR.map(function(i){ return locsR[i]; })) * MINUTES_PER_UNIT);
      state.lastRoutePreview = {ordered: ordered, totalMinutes: totalMinutes};
      openModal('suggestRoute'); return;
    }
    if (action === 'applySuggestedRoute'){
      var dayIdxR = Number(document.getElementById('rf-day').value);
      var dayR = trip.days[dayIdxR];
      var startMinutes = 9*60;
      state.lastRoutePreview.ordered.forEach(function(c, i){
        var mins = startMinutes + i*90;
        var hh = Math.floor(mins/60), mm = mins%60;
        var timeStr = (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
        dayR.items.push({id:nextId('d'+(dayIdxR+1)+'-'), time:timeStr, title:c.name, category:c.category, loc:c.loc, done:false, linkedExpenseId:null});
        c.addedToDay = dayIdxR;
        c.selected = false;
      });
      dayR.items.sort(function(a,b){ return a.time<b.time?-1:(a.time>b.time?1:0); });
      state.lastRoutePreview = null;
      state.itineraryDayIndex = dayIdxR;
      markDirty();
      closeModal(); return;
    }

    if (action === 'openLuckyDraw'){ state.lastLuckyPick = null; state.luckyFilterCat = '全部'; openModal('luckyDraw'); return; }
    if (action === 'setLuckyFilter'){ state.luckyFilterCat = el.getAttribute('data-key'); renderModalOnly(); return; }
    if (action === 'drawLucky'){
      var pool = candidatePlaces.filter(function(c){ return c.addedToDay===null && (state.luckyFilterCat==='全部' || c.category===state.luckyFilterCat); });
      if (!pool.length){ showAlert('冇符合條件、仲未加入行程嘅地方喇。'); return; }
      var pick = pool[Math.floor(Math.random()*pool.length)];
      state.lastLuckyPick = pick.id;
      renderModalOnly(); return;
    }
    if (action === 'applyLuckyPick'){
      var pickC = candidatePlaces.filter(function(c){ return c.id===state.lastLuckyPick; })[0];
      var dayIdxL = Number(document.getElementById('lf-day').value);
      var dayL = trip.days[dayIdxL];
      var lastTime = dayL.items.length ? dayL.items[dayL.items.length-1].time : '09:00';
      var lp = lastTime.split(':'); var mins2 = parseInt(lp[0],10)*60+parseInt(lp[1],10)+90;
      var hh2 = Math.floor(mins2/60)%24, mm2 = mins2%60;
      var timeStr2 = (hh2<10?'0':'')+hh2+':'+(mm2<10?'0':'')+mm2;
      dayL.items.push({id:nextId('d'+(dayIdxL+1)+'-'), time:timeStr2, title:pickC.name, category:pickC.category, loc:pickC.loc, done:false, linkedExpenseId:null});
      dayL.items.sort(function(a,b){ return a.time<b.time?-1:(a.time>b.time?1:0); });
      pickC.addedToDay = dayIdxL;
      state.lastLuckyPick = null;
      state.itineraryDayIndex = dayIdxL;
      markDirty();
      closeModal(); return;
    }

    if (action === 'toggleLeaderboard'){ trip.leaderboardEnabled = !trip.leaderboardEnabled; markDirty(); render(); return; }
    if (action === 'filterLeaderboardMember'){ var vlb = el.getAttribute('data-key'); state.leaderboardFilterMember = vlb || null; render(); return; }

    if (action === 'openTrip'){
      syncGlobalsIntoCurrentBundle();
      loadTripIntoGlobals(el.getAttribute('data-id'));
      state.screen = 'trip'; state.tab = 'dashboard';
      if (!viewerId || !memberExists(viewerId)) openModal('pickViewer', {mustPick:true});
      else render();
      return;
    }
    if (action === 'goHome'){
      syncGlobalsIntoCurrentBundle();
      state.screen = 'home';
      render(); return;
    }
    if (action === 'openCreateTrip'){ createTripDraft = freshCreateTripDraft(); openModal('createTrip'); return; }
    if (action === 'deleteTrip'){
      var delId = el.getAttribute('data-id');
      var delBundle = getBundleFrom(tripsStore, delId);
      if (!delBundle) return;
      showConfirm('刪除「'+delBundle.trip.name+'」呢個旅程？入面所有行程、購物清單同支出紀錄都會一併刪除，此操作無法復原。', function(){
        tripsStore = tripsStore.filter(function(b){ return b.id !== delId; });
        if (currentTripId === delId && tripsStore.length) loadTripIntoGlobals(tripsStore[0].id);
        markDirty();
        render();
      });
      return;
    }
    if (action === 'submitCreateTrip'){ submitCreateTrip(); return; }

    if (action === 'openEditMember'){ openModal('editMember', {memberId: el.getAttribute('data-id')}); return; }
    if (action === 'setMemberColor'){ editMemberDraft.color = el.getAttribute('data-color'); renderModalOnly(); return; }
    if (action === 'setMemberEmoji'){ editMemberDraft.emoji = el.getAttribute('data-emoji'); renderModalOnly(); return; }
    if (action === 'clearMemberEmoji'){ editMemberDraft.emoji = null; renderModalOnly(); return; }
    if (action === 'clearMemberPhoto'){ editMemberDraft.photo = null; renderModalOnly(); return; }
    if (action === 'submitEditMember'){ submitEditMember(); return; }
    if (action === 'deleteMember'){
      var delMemberId = el.getAttribute('data-id');
      if (members.length <= 1){ showAlert('呢個旅程最少要有一位團員，未可以剷除埋佢。'); return; }
      var delMember = findMember(delMemberId);
      showConfirm('確定要將「'+delMember.name+'」剷除出呢個旅程？佢過往嘅支出／購物紀錄會保留（會顯示返個名），但唔會再喺團員名單度出現，亦都揀唔返做負責人。', function(){
        archivedMembers[delMemberId] = {id:delMemberId, name:delMember.name, color:delMember.color};
        members = members.filter(function(m){ return m.id !== delMemberId; });
        if (viewerId === delMemberId) viewerId = null;
        editMemberDraft = null;
        markDirty();
        if (!viewerId || !memberExists(viewerId)) openModal('pickViewer', {mustPick:true});
        else closeModal();
      });
      return;
    }

    if (action === 'openAddMember'){ addMemberDraft = freshAddMemberDraft(); openModal('addMember'); return; }
    if (action === 'setNewMemberColor'){ addMemberDraft.color = el.getAttribute('data-color'); renderModalOnly(); return; }
    if (action === 'setNewMemberEmoji'){ addMemberDraft.emoji = el.getAttribute('data-emoji'); renderModalOnly(); return; }
    if (action === 'clearNewMemberPhoto'){ addMemberDraft.photo = null; renderModalOnly(); return; }
    if (action === 'submitAddMember'){ submitAddMember(); return; }

    if (action === 'openPickViewer'){ openModal('pickViewer', {mustPick:false}); return; }
    if (action === 'selectViewer'){ viewerId = el.getAttribute('data-id'); markDirty(); closeModal(); return; }
    if (action === 'openAddMemberFromPicker'){
      addMemberDraft = freshAddMemberDraft();
      addMemberDraft.becomeViewer = true;
      openModal('addMember');
      return;
    }

    if (action === 'settlePayment'){
      var from = el.getAttribute('data-from'), to = el.getAttribute('data-to'), amount = Number(el.getAttribute('data-amount'));
      expenses.push({id:nextId('st'), title:'結算', amount:amount, category:'settlement', paidBy:from, participants:[to], splitType:'custom', shares:(function(){ var o={}; o[to]=amount; return o; })(), date:new Date().toISOString().slice(0,10), notes:''});
      markDirty(); render(); return;
    }
  });

  document.addEventListener('input', function(e){
    var el = e.target;
    if (el.getAttribute && el.getAttribute('data-role')==='customAmt'){
      var id = el.getAttribute('data-id');
      expenseDraft.custom[id] = el.value;
      updateSplitHintOnly();
    }
    if (el.getAttribute && el.getAttribute('data-role')==='customPct'){
      var id2 = el.getAttribute('data-id');
      expenseDraft.percent[id2] = el.value;
      updateSplitHintOnly();
    }
    if (el.getAttribute && el.getAttribute('data-role')==='ctMemberBudget'){
      createTripDraft.memberBudgets[el.getAttribute('data-idx')] = el.value;
    }
    if (el.id === 'ct-members'){
      createTripDraft.memberNames = el.value;
      var rowsEl = document.getElementById('ct-budget-rows');
      if (rowsEl) rowsEl.innerHTML = createTripBudgetRowsHTML(createTripDraft);
    }
    if (el.id === 'f-amount'){ updateCurrencyHintOnly(); }
  });

  document.addEventListener('change', function(e){
    var el = e.target;
    if (el.id === 'f-category'){ expenseDraft.category = el.value; }
    if (el.id === 'sf-category'){
      if (el.value === '__new__'){
        showPrompt('自訂類別名稱：', '', function(name){
          if (name){ shopCategoryOrder.push(name); shoppingDraft.category = name; }
          renderModalOnly();
        });
      } else { shoppingDraft.category = el.value; }
    }
    if (el.id === 'if-region'){
      if (el.value === '__new__'){
        showPrompt('地區名稱（例如：新宿）：', '', function(rname){
          if (rname){ var r = addCustomRegion(rname); itineraryItemDraft.region = r.name; }
          renderModalOnly();
        });
      } else { itineraryItemDraft.region = el.value; renderModalOnly(); }
    }
    if (el.id === 'cf-area'){
      if (el.value === '__new__'){
        showPrompt('地區名稱（例如：新宿）：', '', function(aname){
          if (aname){ var ar = addCustomRegion(aname); candidateDraft.area = ar.name; }
          renderModalOnly();
        });
      } else { candidateDraft.area = el.value; renderModalOnly(); }
    }
    if (el.id === 'em-photo' && el.files && el.files[0]){
      readAndResizeImageFile(el.files[0], function(dataUrl){ editMemberDraft.photo = dataUrl; renderModalOnly(); });
    }
    if (el.id === 'am-photo' && el.files && el.files[0]){
      readAndResizeImageFile(el.files[0], function(dataUrl){ addMemberDraft.photo = dataUrl; renderModalOnly(); });
    }
    if (el.id === 'tc-photo' && el.files && el.files[0]){
      readAndResizeImageFile(el.files[0], function(dataUrl){ tripCoverDraft.photo = dataUrl; tripCoverDraft.color = null; renderModalOnly(); }, {width:640, height:360, quality:0.75});
    }
    if (el.id === 'scan-file' && el.files && el.files[0]){
      readImageFileForOCR(el.files[0], function(dataUrl){ runScanOCR(dataUrl); });
    }
    if (el.id === 'f-currency'){ syncExpenseDraftFromDOM(); expenseDraft.currency = el.value; renderModalOnly(); }
  });

  var dragFromIdx = null;
  document.addEventListener('dragstart', function(e){
    var el = e.target.closest ? e.target.closest('.itin-item') : null;
    if (!el) return;
    dragFromIdx = Number(el.getAttribute('data-idx'));
    el.classList.add('dragging');
  });
  document.addEventListener('dragend', function(e){
    var el = e.target.closest ? e.target.closest('.itin-item') : null;
    if (el) el.classList.remove('dragging');
  });
  document.addEventListener('dragover', function(e){
    if (e.target.closest && e.target.closest('.itin-item')) e.preventDefault();
  });
  document.addEventListener('drop', function(e){
    var el = e.target.closest ? e.target.closest('.itin-item') : null;
    if (!el || dragFromIdx===null) return;
    e.preventDefault();
    var toIdx = Number(el.getAttribute('data-idx'));
    if (toIdx === dragFromIdx) return;
    var day = trip.days[state.itineraryDayIndex];
    var moved = day.items.splice(dragFromIdx,1)[0];
    day.items.splice(toIdx,0,moved);
    dragFromIdx = null;
    markDirty();
    render();
  });

  function renderModalOnly(){
    var existing = document.querySelector('.overlay');
    if (existing) existing.remove();
    renderModal();
  }

  function updateSplitHintOnly(){
    // recompute totals and update hint text without full re-render (preserve input focus)
    var d = expenseDraft;
    if (d.splitType === 'custom'){
      var sum = 0;
      d.participants.forEach(function(id){ var v = d.custom[id]; if (v) sum += Number(v); });
      var diff = Math.round((Number(document.getElementById('f-amount').value)||0) - sum);
      var hint = document.querySelector('.overlay .hint');
      if (hint){ hint.textContent = diff===0 ? '總額相符 ✓' : ('尚差 '+fmt(diff)+' 未分配'); hint.className = 'hint '+(diff===0?'ok':'bad'); }
    } else if (d.splitType === 'percentage'){
      var psum = 0;
      d.participants.forEach(function(id){ var v = d.percent[id]; if (v) psum += Number(v); });
      var hint2 = document.querySelector('.overlay .hint');
      if (hint2){ hint2.textContent = psum===100 ? '總和 100% ✓' : ('目前總和 '+psum+'%'); hint2.className = 'hint '+(psum===100?'ok':'bad'); }
    }
  }

  function submitExpense(){
    syncExpenseDraftFromDOM();
    var d = expenseDraft;
    var currency = d.currency || 'HKD';
    var enteredAmount = Number(d.amount); // in whatever currency was selected
    if (!d.title || !enteredAmount || enteredAmount<=0){ showAlert('請輸入項目名稱同金額。'); return; }
    if (!d.participants.length){ showAlert('請至少選擇一位分攤人。'); return; }
    var shares = null;
    if (d.splitType === 'custom'){
      var sum = 0; shares = {};
      d.participants.forEach(function(id){ var v = Number(d.custom[id]||0); shares[id]=v; sum += v; });
      if (Math.round(sum) !== Math.round(enteredAmount)){ showAlert('自訂金額總和must等於支出金額。'); return; }
    } else if (d.splitType === 'percentage'){
      var psum = 0; shares = {};
      d.participants.forEach(function(id){ var v = Number(d.percent[id]||0); shares[id]=v; psum += v; });
      if (Math.round(psum) !== 100){ showAlert('比例總和必須等於 100%。'); return; }
    }
    // internally everything (balances, budgets, splits) is tracked in HKD —
    // convert now that validation against the entered currency is done.
    var rate = findCurrency(currency).rate;
    var amountHKD = convertToHKD(enteredAmount, currency);
    if (shares && d.splitType === 'custom'){
      Object.keys(shares).forEach(function(id){ shares[id] = Math.round(shares[id]*rate); });
    }
    if (d.id){
      // editing an existing expense — update it in place rather than adding a new record
      var existing = expenses.filter(function(e){ return e.id === d.id; })[0];
      if (existing){
        existing.title = d.title; existing.amount = amountHKD; existing.category = d.category;
        existing.paidBy = d.paidBy; existing.participants = d.participants.slice();
        existing.splitType = d.splitType; existing.shares = shares; existing.date = d.date; existing.notes = d.notes;
        existing.currency = currency; existing.originalAmount = (currency!=='HKD' ? enteredAmount : null);
      }
    } else {
      var newExpense = {
        id:nextId('e'), title:d.title, amount:amountHKD, category:d.category, paidBy:d.paidBy,
        participants:d.participants.slice(), splitType:d.splitType, shares:shares, date:d.date, notes:d.notes,
        currency: currency, originalAmount: (currency!=='HKD' ? enteredAmount : null)
      };
      expenses.push(newExpense);
      if (pendingItemLink){
        var day = trip.days[pendingItemLink.dayIndex];
        if (day && day.items[pendingItemLink.itemIndex]) day.items[pendingItemLink.itemIndex].linkedExpenseId = newExpense.id;
        pendingItemLink = null;
      }
    }
    expenseDraft = null;
    markDirty();
    closeModal();
  }

  function submitShopping(){
    syncShoppingDraftFromDOM();
    var d = shoppingDraft;
    if (!d.name){ showAlert('請輸入項目名稱。'); return; }
    shoppingItems.push({
      id:nextId('s'), name:d.name, category:d.category, quantity:Number(d.quantity)||1,
      estimatedPrice:Number(d.estimatedPrice)||0, actualPrice:null, assignedTo:d.assignedTo,
      status:'pending', notes:d.notes, linkedExpenseId:null
    });
    shoppingDraft = null;
    markDirty();
    closeModal();
  }

  function confirmPurchase(id){
    var item = shoppingItems.filter(function(i){ return i.id===id; })[0];
    var actualInput = document.getElementById('pf-actual');
    var actual = Number(actualInput.value)||0;
    item.actualPrice = actual;
    item.status = 'purchased';
    if (purchaseAddExpense){
      // a real expense always needs one payer — when the item was assigned to
      // "大家都想要" rather than one person, fall back to whoever's currently
      // viewing (or just the first member if no viewer is picked yet)
      var payerFor = item.assignedTo === EVERYONE_ID
        ? ((viewerId && memberExists(viewerId)) ? viewerId : members[0].id)
        : item.assignedTo;
      var exp = {
        id:nextId('e'), title:item.name, amount:actual, category:'購物', paidBy:payerFor,
        participants:members.map(function(m){ return m.id; }), splitType:'equal', shares:null,
        date:new Date().toISOString().slice(0,10), notes:'來自購物清單'
      };
      expenses.push(exp);
      item.linkedExpenseId = exp.id;
    }
    markDirty();
    closeModal();
  }

  loadPersistedState();
  initArtifactCapability();
  initFirebaseIfConfigured();
  render();
})();
