/* © 2026 WAR Alliance. The Cage Planner, layout and code may not be copied, republished or reused without written permission.
   Hero data adapted from Pikaboo's Lands of Jail Codex; guides by DuckDaddy96.
   File: core.js: shared helpers, saved-heroes storage, name highlighting */
var $=function(i){return document.getElementById(i)};

function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;")}

function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k));if(v)return v}catch(e){}return d}

function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

function nf(n){return Math.round(n).toLocaleString("en-US")}

var TN={sh:"Shield",bo:"Bomber",sr:"Shooter"};

var OWN=ld("loj_own",[]),DB=ld("loj_dbf",{t:"all",g:"all",j:"all"}),DQ="";

function hm(id){return H.filter(function(x){return x.id===id})[0]}

function isOwn(id){return OWN.indexOf(id)>=0}

var HR=null;

function hl(s){if(!HR){var al={"Ryuichi":"ryuichiito"},nm=H.map(function(x){return x.name}).concat(["Ryuichi"]).sort(function(a,b){return b.length-a.length});HR={re:new RegExp("\\b("+nm.join("|")+")\\b","g"),al:al}}
return s.replace(HR.re,function(m){var h=hm(HR.al[m]||m.toLowerCase().replace(/[^a-z]/g,""));return h?'<span class="hn"><img alt="" src="'+h.img+'">'+m+'</span>':m})}

H.forEach(function(h){h.q=(h.name+' '+(h.nick||'')+' '+(h.stats||'')+' '+(h.passive||'')+' '+(h.ee||'')+' '+(h.pve||'')+' '+(h.note||'')+' '+(h.sk||[]).map(function(s){return s[0]+' '+s[1]}).join(' ')).toLowerCase()});
