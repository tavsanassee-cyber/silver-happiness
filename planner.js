
/* © 2026 WAR Alliance. The Cage Planner, layout and code may not be copied, republished or reused without written permission.
   Hero data adapted from Pikaboo's Lands of Jail Codex; guides by DuckDaddy96.
   File: planner.js: Cage Planner logic and data (leader and joiner ranking, swaps, fallback hero) */

var CL={sh:["tyronn","phoenix","otto","marcus"],bo:["ryuichiito","koschevoi","whisper","wukong"],sr:["ada","mireya","edwin","kate"]};

var CJ=["koschevoi","phoenix","lunarl","lofili","vivian","ryuichiito","samir","veronica","lee","drake","worrell","wukong","tyronn","kate"];

var GO={sr:["ada","drake","veronica","sawyer","mireya","edwin"],bo:["flameborne","alph","whisper","ryuichiito","koschevoi"],sh:["tyronn","phoenix","xuanming","marcus","zoltan"]};

var CG=ld("loj_cage2",null);

if(!CG||CG.marches===undefined)CG={marches:6,lead:true,n:""};

if(!CG.lo)CG.lo={};

if(!CG.sw)CG.sw=[];

var JSEL=null;

var SLOT=[["Shield lead","sh"],["Bomber lead","bo"],["Shooter lead","sr"]];

var GP={"Gen 1 R":94.57,"Gen 1 SR":147.12,"Gen 1 SSR":210.17,"Gen 2":252.2,"Gen 3":304.74,"Gen 4":388.5,"Gen 5":466.2,"Gen 6":567};

function genPct(id){
  var h=hm(id);
  if(!h)return 0;
  if(h.gen==="Special"){
    var m=/\+(\d+(?:\.\d+)?)%/.exec(h.stats||"");
    return m?+m[1]:0;
  }
  return GP[h.gen]||0;
}

function genTxt(id){
  var h=hm(id);
  return h?h.gen+' · +'+genPct(id)+'% troop ATK/DEF':'';
}

var JN={
  koschevoi:[25,"+25% damage, all your troops"],
  phoenix:[25,"+25% damage, all your troops"],
  lunarl:[25,"+25% damage, all your troops"],
  lofili:[25,"+25% allied ATK"],
  vivian:[25,"+25% allied ATK"],
  ryuichiito:[25,"+25% team crit chance"],
  samir:[14,"+14% ATK, the weakest joiner on this list"],
  veronica:[20,"50% chance of +50% damage taken. Depends on what else is in the rally"],
  lee:[20,"+50% Tactical damage taken. Needs a Tactical dealer in the rally"],
  drake:[20,"+110% Tactical every 3rd round. Depends on what else is in the rally"],
  worrell:[18,"+25% basic attacks only, so it covers less"],
  wukong:[20,"150% ATK Tactical every 3 rounds, Bombers only. Depends on what else is in the rally"],
  tyronn:[25,"+25% damage taken by enemy troops"],
  kate:[25,"+25% allied troops ATK"]
};

var LN={
  ada:"Bonus Shooter volleys plus a rally ATK exclusive equipment that works here. Keep about 1,000 Shield.",
  mireya:"+25% ATK and +20% damage.",
  edwin:"Bonus attacks, but only when Tactical damage lands.",
  ryuichiito:"+25% crit chance, and the only Bomber whose exclusive equipment works here (+16% troops ATK on rallies). Beats Koschevoi once that equipment is near max.",
  koschevoi:"+25% damage to all your troops. The safer choice if your Ryuichi exclusive equipment is still low.",
  whisper:"50% chance of +50% to her own damage.",
  tyronn:"His base skill does nothing here, but his +16% troops ATK exclusive equipment still works and boosts the whole Shooter march.",
  phoenix:"+25% allied damage, a skill that works here. The better lead if your Tyronn exclusive equipment is not maxed.",
  otto:"+75% allied Tactical damage, but only if something in the team actually deals it.",
  wukong:"+25% Bomber damage and +25% allied damage, both work here.",
  kate:"+25% allied ATK.",
  marcus:"Fallback pick, only if you do not have Tyronn, Phoenix or Otto. Every 3rd round the Shieldbearers sit out and Shooters and Bombers launch one extra basic attack (30% to 150% damage by level). This is a second war skill, so it does nothing if he joins instead."
};

var FB={marcus:1};

function prim(c){
  var p=c.filter(function(i){return!FB[i]});
  return p.length?p:c;
}

function fbLast(a){
  return a.filter(function(i){return!FB[i]}).concat(a.filter(function(i){return FB[i]}));
}

function leadBest(ids,list){
  return ids.slice().sort(function(a,b){
    var sa=genPct(a)/25+lvScore(a);
    var sb=genPct(b)/25+lvScore(b);
    return sb-sa||list.indexOf(a)-list.indexOf(b);
  });
}

function altRow(ids,attr){
  if(!ids||!ids.length)return'';
  return '<div class="alts"><span>Alternatives · tap to swap</span>'+
    ids.map(function(id){
      var h=hm(id);
      return h?'<button class="alt" '+attr(id)+'><img alt="" src="'+h.img+'"><small>'+esc(h.name)+'</small></button>':'';
    }).join("")+'</div>';
}

var JT={
  "lunarl":{"n":"Insight","v":[5,10,15,20,25],"t":"+{v} damage dealt by all allied troops","c":0},
  "lofili":{"n":"Strategic Insight","v":[5,10,15,20,25],"t":"+{v} ATK for all allied troops","c":0},
  "koschevoi":{"n":"Precision Strike","v":[5,10,15,20,25],"t":"+{v} damage for all your troops","c":0},
  "samir":{"n":"Harsh Rule","v":[3,6,9,12,14],"t":"+{v} troops ATK (Lethality not counted)","c":0},
  "vivian":{"n":"Stunning Act","v":[5,10,15,20,25],"t":"+{v} ATK for all allied troops","c":0},
  "drake":{"n":"Charged Barrage","v":[22,44,66,88,110],"t":"{v} Tactical damage on an extra Shooter attack every 3rd round","c":1},
  "ryuichiito":{"n":"Weakness Detection","v":[5,10,15,20,25],"t":"{v} chance for all troops to crit on basic attacks","c":0},
  "lee":{"n":"Stealth Assault","v":[10,20,30,40,50],"t":"+{v} Tactical damage taken by the target for 1 round, per Bomber attack","c":1},
  "veronica":{"n":"Darkness Blade","v":[10,20,30,40,50],"t":"50% chance to raise the enemy's damage taken by {v}","c":1}
};

/*
 * Level data comes from My Heroes and is stored as:
 * [stars, topWarSkillLevel].
 * Zero or missing values mean the level is unknown.
 * Do not substitute maximum levels for unknown data.
 */
function jlv(id){
  var l=LV[id];
  return l&&+l[1]>=1&&+l[1]<=5?+l[1]:0;
}

function jval(id){
  var lv=jlv(id);
  if(!lv)return 0;

  var t=JT[id];
  if(t){
    var raw=t.v[lv-1];
    return t.c?20*raw/t.v[4]:raw;
  }

  /*
   * JN values are the existing reference values.
   * Preserve the existing proportional scaling when a level is recorded.
   */
  return JN[id]?JN[id][0]*lv/5:0;
}

function jtxt(id){
  var t=JT[id];
  var lv=jlv(id);

  if(!lv){
    return (t?t.n+": ":"")+
      (JN[id]?JN[id][1]+". ":"")+
      "Skill level not set; skill contribution not scored.";
  }

  if(t){
    return t.n+" Lv."+lv+": "+
      t.t.replace("{v}",t.v[lv-1]+"%");
  }

  return JN[id][1]+(lv<5?" (scaled to Lv."+lv+")":"");
}

function jstars(id){
  var l=LV[id];
  var stars=l&&+l[0]>=1&&+l[0]<=5?+l[0]:0;
  return stars;
}

function bestJoin(ids){
  return ids.slice().sort(function(a,b){
    var sa=jval(a)+jstars(a);
    var sb=jval(b)+jstars(b);
    return sb-sa||CJ.indexOf(a)-CJ.indexOf(b);
  });
}

function cageTools(){
  return '<div class="rows" style="margin-bottom:6px">'+
    '<button class="rw" data-h="t/cage"><div class="t ic">🧮</div><div><b>Cage Planner</b><span>Builds your leader formation and joiner marches from the heroes you own</span></div></button>'+
    '</div><h2 class="sec">Guides</h2>';
}

function mkOpts(a,sel){
  return a.map(function(v){
    return '<option value="'+v+'"'+(v==sel?' selected':'')+'>'+v+'</option>';
  }).join("");
}

function cagePlan(){
  var used={},
      leadOn=CG.lead,
      m=Math.max(1,+CG.marches||1),
      jm=Math.max(0,m-(leadOn?1:0)),
      lead=[],
      joins=[];

  if(leadOn)SLOT.forEach(function(sl){
    var k=sl[1],
        list=CL[k],
        cand=list.filter(function(i){return isOwn(i)&&!used[i]}),
        id=(CG.lo[k]&&cand.indexOf(CG.lo[k])>=0)?
          CG.lo[k]:leadBest(prim(cand),list)[0];

    if(id)used[id]=1;

    lead.push({
      slot:sl[0],
      key:k,
      id:id,
      mine:!!id&&id===CG.lo[k],
      cands:list,
      alts:fbLast(leadBest(list.filter(function(i){
        return isOwn(i)&&i!==id;
      }),list))
    });
  });

  var pool=bestJoin(CJ.filter(function(i){
    return isOwn(i)&&!used[i];
  }));

  var chosen=pool.slice(0,jm);

  CG.sw.forEach(function(s){
    var ix=chosen.indexOf(s[0]);
    if(ix>=0&&pool.indexOf(s[1])>=0&&chosen.indexOf(s[1])<0)
      chosen[ix]=s[1];
  });

  joins=chosen;

  var alts=pool.filter(function(i){
    return chosen.indexOf(i)<0;
  });

  return {
    m:m,
    jm:jm,
    lead:lead,
    joins:joins,
    alts:alts,
    short:Math.max(0,jm-joins.length)
  };
}

function split(n,ada){
  var b=Math.round(n*.1),
      s=ada?Math.min(1000,Math.max(0,n-b)):0;
  return [s,b,Math.max(0,n-b-s)];
}

function cageCalc(){
  var h='<button class="back" data-h="c/cage">← Trial Cage</button>'+
    '<h1 class="t">🧮 Cage Planner</h1>'+
    '<div class="beta"><b>BETA · Work in progress</b> This planner is still being tuned, so suggestions may change. Treat them as a starting point and tell us what looks wrong.</div>'+
    (OWN.length?'':'<div class="warn"><b>Select your heroes first</b>Tick the heroes you own in My Heroes to get a stronger, more accurate Cage plan.<br><button class="lnk" data-h="h/mine">Go to My Heroes →</button></div>')+
    '<p class="hint">Builds your best Cage setup from the heroes you ticked in My Heroes, using the picks in our Trial Cage guide.</p>'+
    '<div class="fr"><button class="fc'+(CG.lead?' on':'')+'" data-cl="1">I\'m leading a rally</button>'+
    '<button class="fc'+(!CG.lead?' on':'')+'" data-cl="0">I\'m only joining</button></div>';

  h+='<div class="crow one"><label>Marches available<select data-cmr>'+
    mkOpts([1,2,3,4,5,6,7,8],CG.marches)+
    '</select></label></div>'+
    '<div class="crow one"><label>Troops per march (optional)<input type="number" inputmode="numeric" min="0" data-cn value="'+CG.n+'" class="ni"></label></div>'+
    '<div id="cr"></div>';

  $("app").innerHTML=h;
  cageRes();
}

function cageRes(){
  var o="";

  if(!OWN.length){
    $("cr").innerHTML='<div class="empty">Your plan will appear here once you have selected your heroes.</div>';
    return;
  }

  var p=cagePlan(),n=+CG.n||0;

  o+='<p class="hint"><b>'+p.m+' march'+(p.m>1?'es':'')+':</b> '+
    (CG.lead?'1 leading your rally, '+p.jm+' joining other rallies.':p.jm+' joining other rallies.')+
    '</p>';

  function sp(a,note){
    return n>0?
      '<div class="us">Troops per march: '+nf(a[0])+' Shield · '+nf(a[1])+' Bomber · '+nf(a[2])+' Shooter'+(note?' ('+note+')':'')+'</div>':'';
  }

  if(CG.lead){
    var ada=p.lead[2]&&p.lead[2].id==="ada",
        ok=p.lead.filter(function(x){return x.id}).length,
        rows="";

    p.lead.forEach(function(x){
      var h=x.id&&hm(x.id);

      rows+='<div class="hw"><div class="hrow">'+
        (h?'<img class="av" alt="" src="'+h.img+'">':
          '<div class="av" style="display:flex;align-items:center;justify-content:center;border:1px dashed var(--line)">?</div>')+
        '<div class="hi"><b>'+(h?esc(h.name):'No hero owned')+'</b>'+
        '<div class="gn">'+x.slot+'</div>'+
        (h?
          '<div class="us">'+esc(LN[x.id]||"")+'</div>'+
          '<div class="'+(lvOf(x.id)&&!isReady(x.id)?'bad':'gn')+'">'+lvTxt(x.id)+'</div>'+
          altRow(x.alts,function(i){return 'data-al="'+x.key+':'+i+'"'})+
          (x.mine?'<div class="gn">Your pick · <button class="nb" data-al="'+x.key+':">Back to suggested</button></div>':''):
          '<div class="bad">Heroes that fit this slot: '+x.cands.map(function(i){return esc(hm(i).name)}).join(", ")+'</div>')+
        '</div></div></div>';
    });

    o+='<h2 class="sec">Your rally · '+ok+' of 3 filled</h2>'+
      '<div class="hlist">'+rows+'</div>'+
      sp(split(n,ada),ada?'Ada leads, so about 1,000 Shield are kept':'')+
      '<p class="hint">As leader your three heroes give full stats and exclusive equipment to the rally, so they take priority over joiner picks.</p>';
  }

  o+='<h2 class="sec">Joining other rallies · '+p.jm+' march'+(p.jm===1?'':'es')+'</h2>';

  if(p.jm===0){
    o+='<div class="empty">No marches left for joining. Add more marches above.</div>';
  }else{
    o+=p.joins.length?
      '<div class="hlist">'+p.joins.map(function(id,i){
        var h=hm(id);
        return '<div class="hw"><div class="hrow js'+(JSEL===id?' sel':'')+'" data-js="'+id+'">'+
          '<img class="av" alt="" src="'+h.img+'">'+
          '<div class="hi"><b>Rally '+(i+1)+': '+esc(h.name)+'</b>'+
          '<div class="us">'+esc(jtxt(id))+'</div>'+
          '<div class="'+(lvOf(id)&&!isReady(id)?'bad':'gn')+'">'+lvTxt(id)+'</div>'+
          '</div></div></div>';
      }).join("")+'</div>'+
      altRow(p.alts,function(i){return 'data-aj="'+i+'"'})+
      (CG.sw.length?'<div class="gn"><button class="nb" data-rs="1">Reset swaps</button></div>':'')+
      sp(split(n,false),'0 / 10 / 90'):
      '<div class="empty">None of the Cage joiner heroes are ticked in My Heroes.</div>';

    if(p.short>0)
      o+='<p class="hint"><b>'+p.short+' more march'+(p.short>1?'es':'')+' than joiner heroes.</b> Fill '+
        (p.short>1?'them':'it')+
        ' with any hero that has an ATK or damage buff as its top war skill, and skip heroes that weaken enemy troops.</p>';

    o+='<p class="hint">Tap a joiner, then an alternative, to swap them (with nothing selected, the last march is swapped). Each hero can only be in one march, so every march uses a different hero and none repeat your own rally. Join early: only the first 4 joiners in a rally count.</p>';
  }

  o+='<p class="hint">Several heroes depend on what else is in the rally, so treat this as a starting point. Set your levels in My Heroes.</p>';

  $("cr").innerHTML=o;
}

function tool(id){
  if(id==="cage")cageCalc();
  else home();
}
