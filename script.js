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

  var members = [
    {id:'you', name:'你', color:'#556052', avatarEmoji:null},
    {id:'alex', name:'Alex', color:'#B8763F', avatarEmoji:null},
    {id:'chris', name:'Chris', color:'#6E4C9A', avatarEmoji:null},
    {id:'sam', name:'Sam', color:'#3D5F6E', avatarEmoji:null}
  ];

  var trip = {
    theme:0,
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
    regions:[
      {name:'銀座', loc:{x:50,y:50}}, {name:'淺草', loc:{x:21,y:30}}, {name:'上野', loc:{x:30,y:25}},
      {name:'新宿', loc:{x:38,y:40}}, {name:'澀谷', loc:{x:40,y:65}}, {name:'原宿', loc:{x:37,y:60}},
      {name:'台場', loc:{x:75,y:85}}, {name:'秋葉原', loc:{x:46,y:19}}, {name:'築地', loc:{x:53,y:53}},
      {name:'箱根', loc:{x:5,y:90}}, {name:'東京迪士尼', loc:{x:95,y:40}}
    ],
    days:[
      { date:'2026-10-12', weather:{temp:'24° / 18°', condition:'晴'}, items:[
        {id:'d1-1', time:'10:30', title:'羽田機場抵達', category:'交通', loc:{x:90,y:80}, done:true, linkedExpenseId:null},
        {id:'d1-2', time:'12:30', title:'酒店 Check-in（銀座）', category:'住宿', loc:{x:50,y:50}, done:true, linkedExpenseId:null},
        {id:'d1-3', time:'14:00', title:'築地場外市場', category:'餐飲', loc:{x:55,y:55}, done:true, linkedExpenseId:null},
        {id:'d1-4', time:'17:00', title:'銀座逛街', category:'購物', loc:{x:50,y:48}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-13', weather:{temp:'23° / 17°', condition:'多雲'}, items:[
        {id:'d2-1', time:'09:00', title:'淺草寺', category:'景點', loc:{x:20,y:30}, done:true, linkedExpenseId:null},
        {id:'d2-2', time:'11:00', title:'仲見世通', category:'購物', loc:{x:22,y:31}, done:true, linkedExpenseId:null},
        {id:'d2-3', time:'13:00', title:'天婦羅午餐', category:'餐飲', loc:{x:23,y:32}, done:true, linkedExpenseId:null},
        {id:'d2-4', time:'15:00', title:'上野公園', category:'景點', loc:{x:30,y:25}, done:true, linkedExpenseId:null},
        {id:'d2-5', time:'18:00', title:'阿美橫町晚餐', category:'餐飲', loc:{x:31,y:26}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-14', weather:{temp:'22° / 16°', condition:'晴'}, items:[
        {id:'d3-1', time:'10:00', title:'明治神宮', category:'景點', loc:{x:35,y:60}, done:true, linkedExpenseId:null},
        {id:'d3-2', time:'12:30', title:'原宿午餐', category:'餐飲', loc:{x:36,y:61}, done:true, linkedExpenseId:null},
        {id:'d3-3', time:'14:00', title:'澀谷 Sky', category:'景點', loc:{x:40,y:65}, done:true, linkedExpenseId:null},
        {id:'d3-4', time:'19:00', title:'居酒屋晚餐', category:'餐飲', loc:{x:41,y:66}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-15', weather:{temp:'21° / 16°', condition:'陣雨'}, items:[
        {id:'d4-1', time:'09:30', title:'台場 Diver City', category:'景點', loc:{x:75,y:85}, done:true, linkedExpenseId:null},
        {id:'d4-2', time:'12:00', title:'台場午餐', category:'餐飲', loc:{x:76,y:86}, done:true, linkedExpenseId:null},
        {id:'d4-3', time:'15:00', title:'彩虹橋散步', category:'景點', loc:{x:74,y:84}, done:true, linkedExpenseId:null},
        {id:'d4-4', time:'18:30', title:'咖啡店', category:'餐飲', loc:{x:50,y:50}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-16', weather:{temp:'22° / 17°', condition:'晴'}, items:[
        {id:'d5-1', time:'08:30', title:'東京迪士尼樂園', category:'景點', loc:{x:95,y:40}, done:true, linkedExpenseId:null},
        {id:'d5-2', time:'13:00', title:'樂園午餐', category:'餐飲', loc:{x:95,y:40}, done:true, linkedExpenseId:null},
        {id:'d5-3', time:'20:00', title:'樂園晚餐', category:'餐飲', loc:{x:95,y:40}, done:true, linkedExpenseId:null}
      ]},
      { date:'2026-10-17', weather:{temp:'19° / 14°', condition:'多雲'}, items:[
        {id:'d6-1', time:'09:00', title:'箱根一日遊：溫泉', category:'活動', loc:{x:5,y:90}, done:false, linkedExpenseId:null},
        {id:'d6-2', time:'12:00', title:'蘆之湖觀光船', category:'活動', loc:{x:4,y:91}, done:false, linkedExpenseId:null},
        {id:'d6-3', time:'15:00', title:'溫泉旅館 Check-in', category:'住宿', loc:{x:5,y:92}, done:false, linkedExpenseId:null}
      ]},
      { date:'2026-10-18', weather:{temp:'20° / 15°', condition:'晴'}, items:[
        {id:'d7-1', time:'10:00', title:'秋葉原', category:'購物', loc:{x:45,y:20}, done:false, linkedExpenseId:null},
        {id:'d7-2', time:'13:00', title:'拉麵午餐', category:'餐飲', loc:{x:46,y:21}, done:false, linkedExpenseId:null},
        {id:'d7-3', time:'15:00', title:'東京晴空塔', category:'景點', loc:{x:48,y:18}, done:false, linkedExpenseId:null},
        {id:'d7-4', time:'18:00', title:'晚餐', category:'餐飲', loc:{x:47,y:19}, done:false, linkedExpenseId:null}
      ]},
      { date:'2026-10-19', weather:{temp:'19° / 14°', condition:'晴'}, items:[
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

  var tripsStore = [
    { id:'trip1', trip:trip, members:members, expenses:expenses, shoppingItems:shoppingItems, candidatePlaces:candidatePlaces, shopCategoryOrder:shopCategoryOrder }
  ];
  var currentTripId = 'trip1';

  function getBundle(id){ return tripsStore.filter(function(b){ return b.id===id; })[0]; }

  function syncGlobalsIntoCurrentBundle(){
    var b = getBundle(currentTripId);
    if (!b) return;
    b.trip = trip; b.members = members; b.expenses = expenses; b.shoppingItems = shoppingItems;
    b.candidatePlaces = candidatePlaces; b.shopCategoryOrder = shopCategoryOrder;
  }

  function loadTripIntoGlobals(id){
    var b = getBundle(id);
    if (!b) return;
    trip = b.trip; members = b.members; expenses = b.expenses; shoppingItems = b.shoppingItems;
    candidatePlaces = b.candidatePlaces; shopCategoryOrder = b.shopCategoryOrder; currentTripId = id;
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
  function findMember(id){ for (var i=0;i<members.length;i++){ if(members[i].id===id) return members[i]; } return {id:id,name:id,color:'#8B877E'}; }
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
    var content = m.avatarEmoji ? m.avatarEmoji : initials(m.name);
    var bg = m.avatarEmoji ? 'var(--accent-tint)' : m.color;
    return '<div class="'+cls+'" style="background:'+bg+';'+(m.avatarEmoji?'font-size:'+(size==='lg'?'20':'15')+'px;':'')+'">'+content+'</div>';
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
      drag:'<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'
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
    if (dataDirty){ dataDirty = false; scheduleSync(); }
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
      '<div class="home-header"><h1>我的旅程</h1><p class="home-sub">揀一個旅程繼續籌備，或者開始下一次旅行</p></div>' +
      '<div class="trip-card-list">';
    html += tripsStore.map(function(b){
      var t = b.trip;
      var started = tripIsStartedFor(t);
      return '<div class="trip-card" data-action="openTrip" data-id="'+b.id+'">' +
        '<div class="trip-card-cover" style="background:'+THEME_GRADIENTS[t.theme % THEME_GRADIENTS.length]+';">' +
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
    return { name:'', country:'', start:'', end:'', budget:'', memberNames:'你' };
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
      '<div class="field"><label>預算</label><input type="number" id="ct-budget" value="'+d.budget+'" placeholder="0"></div>' +
      '<div class="field"><label>團員（用逗號分隔）</label><input type="text" id="ct-members" value="'+d.memberNames+'" placeholder="你, Alex, Chris"></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="submitCreateTrip">建立旅程</button>' +
      '</div>';
  }
  function syncCreateTripDraftFromDOM(){
    var d = createTripDraft;
    var g = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
    d.name = g('ct-name'); d.country = g('ct-country'); d.start = g('ct-start'); d.end = g('ct-end');
    d.budget = g('ct-budget'); d.memberNames = g('ct-members');
  }
  function submitCreateTrip(){
    syncCreateTripDraftFromDOM();
    var d = createTripDraft;
    if (!d.name || !d.start || !d.end){ showAlert('請輸入目的地同旅程日期。'); return; }
    var names = d.memberNames.split(/[,，]/).map(function(s){ return s.trim(); }).filter(Boolean);
    if (!names.length) names = ['你'];
    var newMembers = names.map(function(n, i){
      return { id:'m'+nextId(''), name:n, color:AVATAR_COLORS[i % AVATAR_COLORS.length], avatarEmoji:null };
    });
    var dayCount = Math.max(1, Math.round((new Date(d.end) - new Date(d.start)) / 86400000) + 1);
    var newDays = [];
    for (var i=0;i<dayCount;i++){
      var dt = new Date(d.start); dt.setDate(dt.getDate()+i);
      newDays.push({ date: dt.toISOString().slice(0,10), weather:{temp:'--', condition:'未知'}, items:[] });
    }
    var newTrip = {
      theme: tripsStore.length % THEME_GRADIENTS.length,
      name: d.name, country: d.country, start: d.start, end: d.end, budget: Number(d.budget)||0,
      stats:{days:dayCount, attractions:0, bookings:0, savedPlaces:0},
      todayPlan:[], nextItem:{time:'--:--', title:'未有安排', distance:'—'},
      staticChecklist:[{label:'航班', done:false},{label:'酒店', done:false},{label:'餐廳預訂', done:false},{label:'行李清單', done:false}],
      leaderboardEnabled:true,
      regions:[{name:'市中心', loc:{x:50,y:50}}],
      days:newDays
    };
    var newBundle = { id:'t'+nextId(''), trip:newTrip, members:newMembers, expenses:[], shoppingItems:[], candidatePlaces:[], shopCategoryOrder:['必需品','衣物','藥物','食物','旅程用品'] };
    tripsStore.push(newBundle);
    loadTripIntoGlobals(newBundle.id);
    state.screen = 'trip'; state.tab = 'dashboard'; state.itineraryDayIndex = 0;
    createTripDraft = null;
    markDirty();
    closeModal();
  }

  // ---------- member avatar customization ----------

  var editMemberDraft;
  function renderEditMemberModal(memberId){
    var m = findMember(memberId);
    if (!editMemberDraft || editMemberDraft.id !== memberId){
      editMemberDraft = { id:memberId, emoji:m.avatarEmoji, color:m.color };
    }
    var d = editMemberDraft;
    var previewMember = { id:'preview', name:m.name, color:d.color, avatarEmoji:d.emoji };
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">自訂 '+m.name+' 嘅圖示</div>' +
      '<div class="avatar-preview-row">'+avatarPreviewHTML(previewMember)+'</div>' +
      '<div class="field"><label>顏色</label><div class="color-swatch-row">' +
        AVATAR_COLORS.map(function(c){ return '<div class="color-swatch '+(d.color===c?'selected':'')+'" style="background:'+c+';" data-action="setMemberColor" data-color="'+c+'"></div>'; }).join('') +
      '</div></div>' +
      '<div class="field"><label>表情符號（optional，揀咗就會取代顏色底頭像）</label><div class="emoji-grid">' +
        AVATAR_EMOJI_CHOICES.map(function(e){ return '<div class="emoji-opt '+(d.emoji===e?'selected':'')+'" data-action="setMemberEmoji" data-emoji="'+e+'">'+e+'</div>'; }).join('') +
      '</div></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="clearMemberEmoji">移除表情符號</button>' +
        '<button class="btn-primary" data-action="submitEditMember">儲存</button>' +
      '</div>';
  }
  function avatarPreviewHTML(m){
    var content = m.avatarEmoji ? m.avatarEmoji : initials(m.name);
    var bg = m.avatarEmoji ? 'var(--accent-tint)' : m.color;
    return '<div class="avatar" style="width:64px;height:64px;font-size:'+(m.avatarEmoji?'30':'20')+'px;background:'+bg+';">'+content+'</div>';
  }
  function submitEditMember(){
    var m = findMember(editMemberDraft.id);
    m.color = editMemberDraft.color;
    m.avatarEmoji = editMemberDraft.emoji;
    editMemberDraft = null;
    markDirty();
    closeModal();
  }

  var addMemberDraft;
  function freshAddMemberDraft(){ return { name:'', color: AVATAR_COLORS[members.length % AVATAR_COLORS.length], emoji:null }; }
  function renderAddMemberModal(){
    if (!addMemberDraft) addMemberDraft = freshAddMemberDraft();
    var d = addMemberDraft;
    var previewMember = { id:'preview', name:d.name||'新團員', color:d.color, avatarEmoji:d.emoji };
    return '' +
      '<div class="sheet-handle"></div>' +
      '<span class="close-x" data-action="closeModal">'+icon('close',20)+'</span>' +
      '<div class="sheet-title">加入團員</div>' +
      '<div class="avatar-preview-row">'+avatarPreviewHTML(previewMember)+'</div>' +
      '<div class="field"><label>名稱</label><input type="text" id="am-name" value="'+d.name+'" placeholder="例如：Jamie"></div>' +
      '<div class="field"><label>顏色</label><div class="color-swatch-row">' +
        AVATAR_COLORS.map(function(c){ return '<div class="color-swatch '+(d.color===c?'selected':'')+'" style="background:'+c+';" data-action="setNewMemberColor" data-color="'+c+'"></div>'; }).join('') +
      '</div></div>' +
      '<div class="field"><label>表情符號（optional）</label><div class="emoji-grid">' +
        AVATAR_EMOJI_CHOICES.map(function(e){ return '<div class="emoji-opt '+(d.emoji===e?'selected':'')+'" data-action="setNewMemberEmoji" data-emoji="'+e+'">'+e+'</div>'; }).join('') +
      '</div></div>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="submitAddMember">加入</button>' +
      '</div>';
  }
  function syncAddMemberDraftFromDOM(){
    var n = document.getElementById('am-name'); if (n) addMemberDraft.name = n.value;
  }
  function submitAddMember(){
    syncAddMemberDraftFromDOM();
    var d = addMemberDraft;
    if (!d.name){ showAlert('請輸入名稱。'); return; }
    members.push({ id:'m'+nextId(''), name:d.name, color:d.color, avatarEmoji:d.emoji });
    addMemberDraft = null;
    markDirty();
    closeModal();
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
    html += '<div class="dash-hero" style="background:'+THEME_GRADIENTS[trip.theme % THEME_GRADIENTS.length]+';">' +
      '<div class="dash-hero-top">' +
        '<button class="back-btn" data-action="goHome" title="返回旅程列表">'+icon('chevronLeft',20,'#F7F6F2')+'</button>' +
        '<span class="status-pill">'+(started ? '旅行中' : '籌備中')+'</span>' +
      '</div>' +
      '<h1>'+trip.name+'</h1>' +
      '<div class="dash-hero-sub">'+trip.country+' · '+formatRange()+' · '+members.length+' 位旅伴</div>' +
      '<div class="dash-hero-progress">' +
        '<div class="dash-hero-progress-row"><span>旅程進度</span><b class="num">'+progressPct+'%</b></div>' +
        '<div class="progress-track"><div class="progress-fill" style="width:'+progressPct+'%;"></div></div>' +
      '</div>' +
    '</div>';

    // lean stats row
    html += '<div class="section">' +
      '<div class="stat-row-lean">' +
        leanStat(trip.stats.days+' 日', '旅程') +
        leanStat(members.length+' 人', '團員') +
        leanStat(fmt(trip.budget), '預算', true) +
        leanStat(fmt(remaining), '剩餘', true) +
      '</div>' +
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
      '<div class="section-title"><h2>團員結餘</h2><button class="link-btn" data-action="setTab" data-key="expenses">查看結算</button></div>' +
      '<div class="card" style="padding:6px 14px;">' +
      members.map(function(m){
        var b = Math.round(bal[m.id]||0);
        var pillClass = b>0.5 ? 'balance-pos' : (b<-0.5 ? 'balance-neg' : 'balance-zero');
        var pillLabel = b>0.5 ? ('應收 '+fmt(b)) : (b<-0.5 ? ('應付 '+fmt(-b)) : '已結清');
        return '<div class="balance-row">' +
          '<div class="avatar-editable" data-action="openEditMember" data-id="'+m.id+'">'+avatarHTML(m.id)+'</div>' +
          '<div style="flex:1;font-size:13.5px;font-weight:600;">'+m.name+'</div>' +
          '<div class="balance-pill '+pillClass+'">'+pillLabel+'</div>' +
        '</div>';
      }).join('') +
      '</div>' +
      renderSettlementHeadline(plan) +
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
        '<button class="qa-btn" data-action="openAddExpense">'+icon('plus',16)+'新增支出</button>' +
        '<button class="qa-btn" data-action="openAddShopping">'+icon('plus',16)+'新增購物項目</button>' +
        '<button class="qa-btn" data-action="openAddItineraryItem">'+icon('plus',16)+'新增行程</button>' +
        '<button class="qa-btn" data-action="openAddMember">'+icon('plus',16)+'加入團員</button>' +
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
        '<div class="meta">'+priceLine+' · 負責 '+findMember(item.assignedTo).name+'</div>' +
      '</div>' +
      avatarHTML(item.assignedTo) +
    '</div>';
  }

  // ---------- render: itinerary ----------

  function weatherIcon(condition, size){
    if (condition==='晴') return icon('sun', size||16, '#B8863F');
    if (condition==='陣雨') return icon('rain', size||16, '#4C7A94');
    return icon('cloud', size||16, '#8B877E');
  }

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
      '<div class="weather-card">' +
        '<div>'+formatDayDate(day.date)+'</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">'+weatherIcon(day.weather.condition)+'<span>'+day.weather.condition+' · '+day.weather.temp+'</span></div>' +
      '</div>' +
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
        html += '<div class="expense-card">' +
          '<div class="expense-icon">'+icon('receipt',17)+'</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:14px;font-weight:600;">'+e.title+'</div>' +
            '<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+findMember(e.paidBy).name+' 支付 · '+e.participants.length+' 人分攤 · '+e.category+'</div>' +
          '</div>' +
          '<div class="num" style="font-size:14px;font-weight:700;">'+fmt(e.amount)+'</div>' +
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
      '<div class="section-title"><h2>團員結餘</h2></div>' +
      '<div class="card" style="padding:6px 14px;margin-bottom:20px;">' +
      members.map(function(m,idx){
        var b = bal[m.id];
        var cls = b>0.5 ? 'balance-pos' : (b<-0.5 ? 'balance-neg' : 'balance-zero');
        var label = b>0.5 ? '應收 '+fmt(b) : (b<-0.5 ? '應付 '+fmt(-b) : '已結清');
        return '<div style="display:flex;align-items:center;gap:10px;padding:12px 0;'+(idx>0?'border-top:1px solid var(--line);':'')+'">' +
          '<div class="avatar-editable" data-action="openEditMember" data-id="'+m.id+'">'+avatarHTML(m.id,'lg')+'</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:14px;font-weight:600;">'+m.name+'</div>' +
            '<div style="font-size:11.5px;color:var(--muted);">已支付 <span class="num">'+fmt(memberPaidTotal(m.id))+'</span></div>' +
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
    else if (state.modal.type === 'confirmDialog') sheetHTML = renderConfirmDialogModal(state.modal.payload);
    else if (state.modal.type === 'promptDialog') sheetHTML = renderPromptDialogModal(state.modal.payload);
    else if (state.modal.type === 'alertDialog') sheetHTML = renderAlertDialogModal(state.modal.payload);
    overlay.innerHTML = '<div class="sheet" data-action="stop">'+sheetHTML+'</div>';
    document.body.appendChild(overlay);
  }

  // draft state for add-expense
  var expenseDraft;
  var pendingItemLink = null; // {dayIndex, itemIndex} — set when an expense is created from an itinerary item
  function freshExpenseDraft(prefill){
    var d = {
      title:'', amount:'', category:'餐飲', paidBy:'you',
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
      '<div class="sheet-title">新增支出</div>' +
      '<div class="field"><label>項目</label><input type="text" id="f-title" value="'+d.title+'" placeholder="例如：東京酒店"></div>' +
      '<div class="row-2">' +
        '<div class="field"><label>金額</label><input type="number" id="f-amount" value="'+d.amount+'" placeholder="0"></div>' +
        '<div class="field"><label>類別</label><select id="f-category">'+expenseCategories.map(function(c){ return '<option '+(c===d.category?'selected':'')+'>'+c+'</option>'; }).join('')+'</select></div>' +
      '</div>' +
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
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="submitExpense">加入支出</button>' +
      '</div>';
  }

  function syncExpenseDraftFromDOM(){
    var d = expenseDraft;
    var t = document.getElementById('f-title'); if (t) d.title = t.value;
    var a = document.getElementById('f-amount'); if (a) d.amount = a.value;
    var c = document.getElementById('f-category'); if (c) d.category = c.value;
    var dt = document.getElementById('f-date'); if (dt) d.date = dt.value;
    var no = document.getElementById('f-notes'); if (no) d.notes = no.value;
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
        '<span>加入旅程支出（由 '+findMember(item.assignedTo).name+' 支付，全部團員平均分攤）</span>' +
        '<div class="switch on" data-action="togglePurchaseAddExpense"><div class="knob"></div></div>' +
      '</div>' +
      '<div class="modal-actions" style="margin-top:16px;">' +
        '<button class="btn-secondary" data-action="closeModal">取消</button>' +
        '<button class="btn-primary" data-action="confirmPurchase" data-id="'+item.id+'">確認已購買</button>' +
      '</div>';
  }

  function renderItemActionsModal(item){
    var statusLine = item.status==='purchased' ? ('✓ 已由 '+findMember(item.assignedTo).name+' 購買 · 實際 '+fmt(item.actualPrice)) : (item.status==='not_needed' ? '已標記為不需要' : '待購買');
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
  function freshCandidateDraft(){ return {name:'', category:ITEM_CATEGORIES[0], area:(trip.regions&&trip.regions[0]?trip.regions[0].name:''), notes:''}; }
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
    var regionObj = area ? findRegion(area) : null;
    var loc = regionObj ? regionObj.loc : {x:30+Math.random()*40,y:30+Math.random()*40};
    candidatePlaces.push({id:nextId('c'), name:name, category:category, area:area, notes:notes, loc:loc, selected:false, addedToDay:null});
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
    if (action === 'openAddShopping'){ shoppingDraft = freshShoppingDraft(); openModal('addShopping'); return; }
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
      render(); return;
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
    if (action === 'submitEditMember'){ submitEditMember(); return; }

    if (action === 'openAddMember'){ addMemberDraft = freshAddMemberDraft(); openModal('addMember'); return; }
    if (action === 'setNewMemberColor'){ addMemberDraft.color = el.getAttribute('data-color'); renderModalOnly(); return; }
    if (action === 'setNewMemberEmoji'){ addMemberDraft.emoji = el.getAttribute('data-emoji'); renderModalOnly(); return; }
    if (action === 'submitAddMember'){ submitAddMember(); return; }

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
    var amount = Number(d.amount);
    if (!d.title || !amount || amount<=0){ showAlert('請輸入項目名稱同金額。'); return; }
    if (!d.participants.length){ showAlert('請至少選擇一位分攤人。'); return; }
    var shares = null;
    if (d.splitType === 'custom'){
      var sum = 0; shares = {};
      d.participants.forEach(function(id){ var v = Number(d.custom[id]||0); shares[id]=v; sum += v; });
      if (Math.round(sum) !== Math.round(amount)){ showAlert('自訂金額總和must等於支出金額。'); return; }
    } else if (d.splitType === 'percentage'){
      var psum = 0; shares = {};
      d.participants.forEach(function(id){ var v = Number(d.percent[id]||0); shares[id]=v; psum += v; });
      if (Math.round(psum) !== 100){ showAlert('比例總和必須等於 100%。'); return; }
    }
    var newExpense = {
      id:nextId('e'), title:d.title, amount:amount, category:d.category, paidBy:d.paidBy,
      participants:d.participants.slice(), splitType:d.splitType, shares:shares, date:d.date, notes:d.notes
    };
    expenses.push(newExpense);
    if (pendingItemLink){
      var day = trip.days[pendingItemLink.dayIndex];
      if (day && day.items[pendingItemLink.itemIndex]) day.items[pendingItemLink.itemIndex].linkedExpenseId = newExpense.id;
      pendingItemLink = null;
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
      var exp = {
        id:nextId('e'), title:item.name, amount:actual, category:'購物', paidBy:item.assignedTo,
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
  render();
})();
