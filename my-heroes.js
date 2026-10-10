/* © 2026 WAR Alliance. The Cage Planner, layout and code may not be copied, republished or reused without written permission.
   Hero data adapted from Pikaboo's Lands of Jail Codex; guides by DuckDaddy96.
   File: my-heroes.js: My Heroes page, Hero Database, hero levels, Best lineups you can field */

function use(h){
  var a=[],i;
  ["sh","bo","sr"].forEach(function(k){
    if((i=CL[k].indexOf(h.id))>=0)
      a.push(h.id==="marcus"?"Cage leader (fallback)":"Cage leader");
  });
  if(CJ.indexOf(h.id)>=0)a.push("Cage joiner");
  ["sr","bo","sh"].forEach(function(k){
    if((i=GO[k].indexOf(h.id))>=0)a.push("Gorilla pick #"+(i+1));
  });
  return a;
}

function heroTools(){
  return '<div class="rows" style="margin-bottom:6px">'+
    '<button class="rw" data-h="h/mine"><div class="t ic">✅</div><div><b>My Heroes</b><span>Tick the heroes you own and see what you can field</span></div></button>'+
    '<button class="rw" data-h="h/db"><div class="t ic">📚</div><div><b>Hero Database</b><span>Search and filter Gen 1 to 5 heroes</span></div></button>'+
    '</div><h2 class="sec">Guides</h2>';
}

function groups(){
  var g=[],m={};
  H.forEach(function(x){
    if(!m[x.gen]){
      m[x.gen]=[];
      g.push([x.gen,m[x.gen]]);
    }
    m[x.gen].push(x);
  });
  return g;
}

function chips(key,list){
  return list.map(function(o){
    return '<button class="fc'+(DB[key]===o[0]?' on':'')+'" data-f="'+key+':'+o[0]+'">'+o[1]+'</button>';
  }).join("");
}

function db(){
  var gl=[["all","All"],["Special","Special"],["Gen 1","Gen 1"],["Gen 2","Gen 2"],["Gen 3","Gen 3"],["Gen 4","Gen 4"],["Gen 5","Gen 5"]];
  $("app").innerHTML=
    '<button class="back" data-h="c/heroes">← Heroes</button>'+
    '<h1 class="t">📚 Hero Database</h1>'+
    '<p class="hint">Gen 1 to Gen 6, plus Phoenix and Tyronn. Tap ✓ on a hero you own, or open a hero to see its skills.</p>'+
    '<input type="search" id="hq" placeholder="Search a hero or skill…" value="'+esc(DQ)+'">'+
    '<div class="fcs" id="fc"></div><div id="hr"></div>'+
    '<p class="hint">Hero stats and skills adapted from Pikaboo’s Lands of Jail Codex.</p>';
  $("hq").addEventListener("input",function(e){
    DQ=e.target.value;
    dbRes();
  });
  dbFc();
  dbRes();
}

function dbFc(){
  $("fc").innerHTML=
    '<div class="fr">'+chips("t",[["all","All types"],["sh","Shield"],["bo","Bomber"],["sr","Shooter"]])+'</div>'+
    '<div class="fr">'+chips("g",[["all","All gens"],["Special","Special"],["Gen 1","Gen 1"],["Gen 2","Gen 2"],["Gen 3","Gen 3"],["Gen 4","Gen 4"],["Gen 5","Gen 5"],["Gen 6","Gen 6"]])+'</div>'+
    '<div class="fr">'+chips("j",[["all","All jobs"],["Defence","Defence"],["Solo attack","Solo"],["Rally","Rally"]])+'</div>';
}

function det(x){
  var d="";
  if(x.stats)d+='<div class="dl"><b>Stats</b> '+esc(x.stats)+'</div>';
  if(x.passive)d+='<div class="dl"><b>Passive</b> '+esc(x.passive)+'</div>';
  if(x.sk&&x.sk.length)
    d+='<div class="dl"><b>War skills</b><ul>'+x.sk.map(function(s){
      return '<li><i>'+esc(s[0])+'</i> '+esc(s[1])+'</li>';
    }).join("")+'</ul></div>';
  if(x.ee)d+='<div class="dl"><b>Exclusive equipment</b> '+esc(x.ee)+'</div>';
  if(x.pve)d+='<div class="dl dim"><b>PvE skills</b> '+esc(x.pve)+'</div>';
  if(x.note)d+='<div class="dl">'+esc(x.note)+'</div>';
  if(JT[x.id])
    d+='<div class="dl"><b>Joiner skill by level</b>'+esc(JT[x.id].n)+': '+JT[x.id].v.join('% · ')+'%</div>';
  return d?'<details class="dt"><summary>War skills &amp; details</summary>'+d+'</details>':'';
}

function hrow(x){
  var u=use(x);
  return '<div class="hw"><div class="hrow"><img class="av" alt="" src="'+x.img+'"><div class="hi"><b>'+esc(x.name)+'</b>'+
    (x.nick?' <span class="gn">“'+esc(x.nick)+'”</span>':'')+
    '<div><span class="pl '+x.t+'">'+TN[x.t]+'</span> <span class="gn">'+x.gen+' · '+x.job+'</span></div>'+
    (u.length?'<div class="us">'+u.join(" · ")+'</div>':'')+
    '</div><button class="ck'+(isOwn(x.id)?' on':'')+'" data-o="'+x.id+'" aria-label="I own '+esc(x.name)+'">✓</button></div>'+det(x)+'</div>';
}

function dbRes(){
  var q=DQ.toLowerCase().trim();
  var r=H.filter(function(x){
    return (DB.t==="all"||x.t===DB.t)&&
      (DB.g==="all"||x.gen.indexOf(DB.g)===0)&&
      (DB.j==="all"||x.job===DB.j)&&
      (!q||x.q.indexOf(q)>=0);
  });
  $("hr").innerHTML=r.length?
    '<h2 class="sec">'+r.length+' hero'+(r.length>1?'es':'')+'</h2><div class="hlist">'+r.map(hrow).join("")+'</div>':
    '<div class="empty">No heroes match.</div>';
}

function chipList(ids,nn){
  return '<div class="cl">'+ids.map(function(id,i){
    var h=hm(id);
    return '<span class="cp '+(isOwn(id)?'have':'miss')+'">'+
      (h?'<img alt="" src="'+h.img+'">':'')+
      (nn?'':(i+1)+'. ')+esc(h?h.name:id)+'</span>';
  }).join("")+'</div>';
}

function cnt(ids){
  var n=ids.filter(isOwn).length;
  return '<span class="cn2">'+n+'/'+ids.length+' owned</span>';
}

var LM=[
  ["Solo attack","50 / 5 / 45",[
    ["Shield",["phoenix"]],
    ["Bomber",["alph","koschevoi"]],
    ["Shooter",["edwin","veronica"]]
  ]],
  ["Rally lead","50 / 10 / 40",[
    ["Shield",["tyronn","phoenix"]],
    ["Bomber",["whisper","ryuichiito"]],
    ["Shooter",["ada","sawyer","mireya"]]
  ]],
  ["Defence","60 / 10 / 30",[
    ["Shield",["marcus","zoltan","xuanming","caesar"]],
    ["Bomber",["lee","lanchester"]],
    ["Shooter",["drake"]]
  ]]
];

function fielder(){
  return LM.map(function(m){
    var used={},rows="",n=0;
    for(var f=1;f<=3;f++){
      var picks=m[2].map(function(s){
        var p=leadBest(s[1].filter(function(id){
          return isOwn(id)&&!used[id];
        }),s[1])[0];
        if(p)used[p]=1;
        return p;
      });
      if(!picks.some(Boolean))break;
      n++;
      rows+='<div class="frow"><b>F'+f+'</b>'+picks.map(function(id,i){
        var h=id&&hm(id);
        return h?
          '<div class="fs"><img alt="" src="'+h.img+'"><span>'+esc(h.name)+'</span></div>':
          '<div class="fs none"><span>No '+m[2][i][0]+'</span></div>';
      }).join("")+'</div>';
    }
    return '<div class="card"><h3>'+m[0]+' <span class="gn">'+m[1]+'</span></h3>'+
      (n?rows:'<p class="hint">None of the suggested heroes ticked yet.</p>')+'</div>';
  }).join("");
}

function mine(){
  var h='<button class="back" data-h="c/heroes">← Heroes</button>'+
    '<h1 class="t">✅ My Heroes</h1>'+
    '<p class="hint">Tap a hero to mark it as owned. Saved on this device.</p>'+
    '<div class="sumbar"><b id="oc">'+OWN.length+' of '+H.length+' owned</b><span>'+
    '<button class="nb" data-a="all">Select all</button> <button class="nb" data-a="clear">Clear</button></span></div>';

  groups().forEach(function(g){
    h+='<h2 class="sec">'+g[0]+'</h2><div class="tiles">'+g[1].map(function(x){
      return '<button class="tile '+x.t+(isOwn(x.id)?' on':'')+'" data-o="'+x.id+'"><img alt="" src="'+x.img+'"><span>'+esc(x.name)+'</span></button>';
    }).join("")+'</div>';
  });

  h+=lvSection();
  h+='<h2 class="sec kf">Best lineups you can field</h2>'+
    '<p class="hint">Suggested Gen 1 to 5 picks from the Lineups &amp; Synergies guide. Each formation uses different heroes. Tick more heroes to fill the gaps.</p>'+
    fielder();

  h+='<h2 class="sec kf">Event picks (Gorilla and Cage)</h2>'+
    '<p class="hint">Picks come from our Gorilla and Trial Cage guides, best first. Gold = you own it.</p>';

  h+='<div class="card"><h3>Gorilla event picks</h3>'+
    '<div class="lb">Shooters '+cnt(GO.sr)+'</div>'+chipList(GO.sr)+
    '<div class="lb">Bombers '+cnt(GO.bo)+'</div>'+chipList(GO.bo)+
    '<div class="lb">Shield '+cnt(GO.sh)+'</div>'+chipList(GO.sh)+'</div>';

  h+='<div class="card"><h3>Trial Cage leaders</h3>'+
    '<div class="lb">Shooter lead '+cnt(CL.sr)+'</div>'+chipList(CL.sr,1)+
    '<div class="lb">Bomber lead '+cnt(CL.bo)+'</div>'+chipList(CL.bo,1)+
    '<div class="lb">Shield lead '+cnt(CL.sh)+'</div>'+chipList(CL.sh,1)+
    '<div class="lb">Cage joiners '+cnt(CJ)+'</div>'+chipList(CJ,1)+'</div>';

  $("app").innerHTML=h;
}

function hero(id){
  if(id==="db")db();
  else if(id==="mine")mine();
  else home();
}

function setF(s){
  var p=s.split(":");
  DB[p[0]]=p[1];
  sv("loj_dbf",DB);
  dbFc();
  dbRes();
}

function refresh(){
  if($("hr"))dbRes();
  else if($("oc")){
    var y=window.scrollY;
    mine();
    window.scrollTo(0,y);
  }
}

function own(id){
  var i=OWN.indexOf(id);
  if(i>=0)OWN.splice(i,1);
  else OWN.push(id);
  sv("loj_own",OWN);
  refresh();
}

function allOwn(a){
  OWN=a==="all"?H.map(function(x){return x.id}):[];
  sv("loj_own",OWN);
  refresh();
}

var LV=ld("loj_lv",{});

/*
 * Level data is stored as [stars, topWarSkillLevel].
 * Zero means that value has not been recorded.
 * Unknown data must never be treated as maxed or ready.
 */
function lvOf(id){
  var l=LV[id];
  if(!l)return null;

  var stars=+l[0]||0;
  var skill=+l[1]||0;

  if(!stars&&!skill)return null;
  return [stars,skill];
}

function isReady(id){
  var l=lvOf(id);
  return !!l&&l[0]>=4&&l[1]>=5;
}

function lvScore(id){
  var l=lvOf(id);
  return l?l[0]+l[1]:0;
}

function bestOf(ids,list){
  return ids.slice().sort(function(a,b){
    var ra=isReady(a),rb=isReady(b);
    if(ra!==rb)return ra?-1:1;

    var sa=lvScore(a)-list.indexOf(a);
    var sb=lvScore(b)-list.indexOf(b);
    return sb-sa||list.indexOf(a)-list.indexOf(b);
  });
}

function lvTxt(id){
  var l=lvOf(id);
  if(!l)return "levels not set";

  var stars=l[0]?l[0]+"★":"stars not set";
  var skill=l[1]?"skill Lv."+l[1]:"skill level not set";

  return stars+" · "+skill+
    (isReady(id)?"":" · not confirmed ready");
}

function lvOpts(sel){
  var o='<option value="">-</option>';
  for(var i=1;i<=5;i++)
    o+='<option value="'+i+'"'+(i===sel?' selected':'')+'>'+i+'</option>';
  return o;
}

function lvSection(){
  var own=H.filter(function(x){return isOwn(x.id)});
  if(!own.length)return "";

  return '<h2 class="sec kf">Your hero levels</h2>'+
    '<p class="hint">Set each hero’s stars and top war skill level. The Cage Planner prefers heroes at 4★ or more with the skill at Lv.5, since higher levels bring more stats.</p>'+
    '<div class="hlist">'+own.map(function(x){
      var l=LV[x.id]||[0,0];
      return '<div class="hw"><div class="hrow"><img class="av" alt="" src="'+x.img+'">'+
        '<div class="hi"><b>'+esc(x.name)+'</b><div class="gn">'+x.gen+'</div></div></div>'+
        '<div class="lvs"><label>Stars<select data-ls="'+x.id+'">'+lvOpts(l[0])+'</select></label>'+
        '<label>Skill<select data-lk="'+x.id+'">'+lvOpts(l[1])+'</select></label></div></div>';
    }).join("")+'</div>';
}

function setLv(id,i,v){
  var l=LV[id]||[0,0];
  l[i]=+v||0;
  LV[id]=l;
  sv("loj_lv",LV);
  refresh();
}
