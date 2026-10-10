/* © 2026 WAR Alliance. The Cage Planner, layout and code may not be copied, republished or reused without written permission.
   Hero data adapted from Pikaboo's Lands of Jail Codex; guides by DuckDaddy96.
   File: app.js: event handlers and page routing */
document.addEventListener("input",function(e){if(e.target.dataset.cn!==undefined){CG.n=e.target.value;sv("loj_cage2",CG);cageRes()}});

document.addEventListener("change",function(e){if(e.target.dataset.cmr!==undefined){CG.marches=+e.target.value;sv("loj_cage2",CG);cageRes()}});

document.addEventListener("change",function(e){var d=e.target.dataset;if(d.ls!==undefined)setLv(d.ls,0,e.target.value);else if(d.lk!==undefined)setLv(d.lk,1,e.target.value)});

document.addEventListener("change",function(e){if(e.target.dataset.lo!==undefined){LUS.own=e.target.checked;sv("loj_lu",LUS);lineupsPage()}});

document.addEventListener("click",function(e){var al=e.target.closest("[data-al]");if(al){var pp=al.getAttribute("data-al").split(":");if(pp[1])CG.lo[pp[0]]=pp[1];else delete CG.lo[pp[0]];sv("loj_cage2",CG);cageRes();return}var aj=e.target.closest("[data-aj]");if(aj){var pl=cagePlan(),out=(JSEL&&pl.joins.indexOf(JSEL)>=0)?JSEL:pl.joins[pl.joins.length-1];if(out)CG.sw.push([out,aj.getAttribute("data-aj")]);JSEL=null;sv("loj_cage2",CG);cageRes();return}var js=e.target.closest("[data-js]");if(js){var jd=js.getAttribute("data-js");JSEL=JSEL===jd?null:jd;cageRes();return}var rs=e.target.closest("[data-rs]");if(rs){CG.sw=[];JSEL=null;sv("loj_cage2",CG);cageRes();return}var lt=e.target.closest("[data-lt]");if(lt){LUS.tab=lt.getAttribute("data-lt");sv("loj_lu",LUS);lineupsPage();return}var ls=e.target.closest("[data-lsn]");if(ls){LUS.s=+ls.getAttribute("data-lsn");sv("loj_lu",LUS);lineupsPage();return}var lj=e.target.closest("[data-ljm]");if(lj){LUS.jm=lj.getAttribute("data-ljm");sv("loj_lu",LUS);lineupsPage();return}var cl=e.target.closest("[data-cl]");if(cl){CG.lead=cl.getAttribute("data-cl")==="1";sv("loj_cage2",CG);cageCalc();return}var f=e.target.closest("[data-f]");if(f){setF(f.getAttribute("data-f"));return}var o=e.target.closest("[data-o]");if(o){own(o.getAttribute("data-o"));return}var a=e.target.closest("[data-a]");if(a){allOwn(a.getAttribute("data-a"));return}var t=e.target.closest("[data-h]");if(!t)return;var h=t.getAttribute("data-h");if(h==="")Q=Q;location.hash=h;if(h===""&&!location.hash)route()});

function home(){mine()}
function route(){var h=location.hash.slice(1).split("/");
if(h[0]==="g"&&h[1]==="lineups")lineupsPage();
else if(h[0]==="t")tool(h[1]);
else if(h[0]==="h")hero(h[1]);
else mine();
window.scrollTo(0,0)}
window.addEventListener("hashchange",route);
route();
