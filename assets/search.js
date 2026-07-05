
(function(){
  var root=window.FLORA_ROOT||'../', lang=window.FLORA_LANG||'en';
  var input=document.getElementById('q'), ac=document.getElementById('ac');
  var DATA=null, sel=-1, cur=[];
  function norm(s){return (s||'').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
  function load(cb){ if(DATA){cb();return;} fetch(root+'search-index.json').then(function(r){return r.json();}).then(function(j){DATA=j;cb();}).catch(function(){}); }
  function match(q){ q=norm(q); if(!q)return[]; var out=[]; for(var i=0;i<DATA.length;i++){var p=DATA[i];
    var hay=norm(p.en+' '+p.fr+' '+p.ar+' '+p.sci+' '+(p.alt||[]).join(' '));
    if(hay.indexOf(q)>=0){out.push(p); if(out.length>=12)break;}} return out; }
  function render(list){ cur=list; sel=-1; if(!list.length){ac.hidden=true;ac.innerHTML='';return;}
    ac.innerHTML=list.map(function(p){return '<a href="'+root+lang+'/plants/'+p.s+'.html"><span>'+p[lang]+'</span><span class="acsci">'+p.sci+'</span></a>';}).join('');
    ac.hidden=false; }
  if(input){
    input.addEventListener('input',function(){ load(function(){ render(match(input.value)); var g=window.__gridFilter; if(g)g(input.value); }); });
    input.addEventListener('focus',function(){ load(function(){}); });
    input.addEventListener('keydown',function(e){ var links=ac.querySelectorAll('a'); if(!links.length)return;
      if(e.key==='ArrowDown'){sel=(sel+1)%links.length;e.preventDefault();}
      else if(e.key==='ArrowUp'){sel=(sel-1+links.length)%links.length;e.preventDefault();}
      else if(e.key==='Enter'){ if(sel>=0){location.href=links[sel].href;e.preventDefault();} return;}
      else return;
      links.forEach(function(a){a.classList.remove('sel');}); if(sel>=0)links[sel].classList.add('sel'); });
    document.addEventListener('click',function(e){ if(!ac.contains(e.target)&&e.target!==input){ac.hidden=true;} });
  }
})();
