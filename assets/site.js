
(function(){
  // back-to-top
  var bt=document.querySelector('.backtop');
  if(bt){window.addEventListener('scroll',function(){bt.classList.toggle('show',window.pageYOffset>500);},{passive:true});
    bt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});}
  // lightbox
  var lb=document.getElementById('lightbox');
  if(lb){var im=lb.querySelector('img'),cl=lb.querySelector('.lb-close');
    document.querySelectorAll('.gtile img').forEach(function(img){img.addEventListener('click',function(){im.src=img.currentSrc||img.src;lb.hidden=false;document.body.style.overflow='hidden';});});
    function hide(){lb.hidden=true;im.src='';document.body.style.overflow='';}
    lb.addEventListener('click',function(e){if(e.target===lb||e.target===cl)hide();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!lb.hidden)hide();});}
  // browse grid filtering (home page only)
  var browse=document.getElementById('browse');
  if(!browse)return;
  var cards=[].slice.call(browse.querySelectorAll('.pcard'));
  var active={}; var monthNow=(new Date()).getMonth()+1;
  var rescount=document.getElementById('rescount');
  function textMatch(card,q){ if(!q)return true; return card.getAttribute('data-name').indexOf(q.toLowerCase())>=0; }
  function pass(card){
    for(var g in active){ if(!active[g].size)continue; var ok=false;
      active[g].forEach(function(v){
        if(g==='catsub'){ if(card.getAttribute('data-catsub')===v)ok=true; }
        else if(g==='light'){ if(card.getAttribute('data-light')===v)ok=true; }
        else if(g==='care'){ if(card.getAttribute('data-care')===v)ok=true; }
        else if(g==='tox'){ if(card.getAttribute('data-tox')==='safe')ok=true; }
        else if(g==='water'){ var w=+card.getAttribute('data-water'); if(v==='lo'&&w<=2)ok=true; if(v==='hi'&&w>=4)ok=true; }
        else if(g==='region'){ if((' '+card.getAttribute('data-regions')+' ').indexOf(' '+v+' ')>=0)ok=true; }
        else if(g==='bloom'){ if((' '+card.getAttribute('data-bloom')+' ').indexOf(' '+monthNow+' ')>=0)ok=true; }
      });
      if(!ok)return false;
    } return true;
  }
  function updateCounts(){
    document.querySelectorAll('.fdd').forEach(function(dd){
      var n=dd.querySelectorAll('input[type=checkbox][data-g]:checked').length;
      var b=dd.querySelector('.fddcount'); if(b)b.textContent=n?(' ('+n+')'):'';
      var btn=dd.querySelector('.fddbtn'); if(btn)btn.classList.toggle('active',n>0);
    });
  }
  function apply(){ var q=(document.getElementById('q')||{}).value||''; var n=0;
    cards.forEach(function(c){ var show=pass(c)&&textMatch(c,q); c.style.display=show?'':'none'; if(show)n++; });
    browse.querySelectorAll('.gcat,.gsub').forEach(function(h){ var el=h.nextElementSibling; var any=false;
      while(el&&!/gcat|gsub/.test(el.className)){ if(el.classList&&el.classList.contains('cardgrid')){ if([].some.call(el.querySelectorAll('.pcard'),function(c){return c.style.display!=='none';}))any=true; } el=el.nextElementSibling; }
      h.style.display=any?'':'none'; });
    var nr=document.querySelector('.noresults'); if(nr)nr.hidden=n>0;
    if(rescount)rescount.textContent=n+' '+((window.UI_RESULTS)||'');
  }
  window.__gridFilter=apply;
  function addToSet(g,v,on){ active[g]=active[g]||new Set(); if(on)active[g].add(v); else active[g].delete(v); }
  function syncParent(cat){
    var pp=document.querySelector('.catparent[data-cat="'+cat+'"]'); if(!pp)return;
    var kids=document.querySelectorAll('input[data-g=catsub][data-cat="'+cat+'"]');
    var c=0; kids.forEach(function(k){if(k.checked)c++;});
    pp.checked=(c===kids.length&&c>0); pp.indeterminate=(c>0&&c<kids.length);
  }
  document.querySelectorAll('.fddpanel input[type=checkbox][data-g]').forEach(function(cb){
    cb.addEventListener('change',function(){
      addToSet(cb.getAttribute('data-g'),cb.value,cb.checked);
      if(cb.getAttribute('data-g')==='catsub')syncParent(cb.getAttribute('data-cat'));
      updateCounts(); apply();
    });
  });
  document.querySelectorAll('.catparent').forEach(function(pp){
    pp.addEventListener('change',function(){
      var cat=pp.getAttribute('data-cat');
      document.querySelectorAll('input[data-g=catsub][data-cat="'+cat+'"]').forEach(function(ch){
        ch.checked=pp.checked; addToSet('catsub',ch.value,ch.checked);
      });
      pp.indeterminate=false; updateCounts(); apply();
    });
  });
  document.querySelectorAll('.fdd .fddbtn').forEach(function(btn){
    btn.addEventListener('click',function(e){ e.stopPropagation();
      var panel=btn.nextElementSibling; var wasOpen=!panel.hidden;
      document.querySelectorAll('.fddpanel').forEach(function(p){p.hidden=true;});
      panel.hidden=wasOpen;
    });
  });
  document.addEventListener('click',function(e){ if(!(e.target.closest&&e.target.closest('.fdd'))) document.querySelectorAll('.fddpanel').forEach(function(p){p.hidden=true;}); });
  var clr=document.getElementById('clearf'); if(clr)clr.addEventListener('click',function(){
    active={}; document.querySelectorAll('.fddpanel input[type=checkbox]').forEach(function(c){c.checked=false;c.indeterminate=false;});
    var q=document.getElementById('q'); if(q)q.value=''; updateCounts(); apply();
  });
  updateCounts(); apply();
})();

(function(){
  // flag language dropdown
  var lb=document.getElementById('langbtn'), lm=document.getElementById('langmenu');
  if(lb&&lm){
    lb.addEventListener('click',function(e){e.stopPropagation();var open=lm.hidden;lm.hidden=!open;lb.setAttribute('aria-expanded',String(open));});
    document.addEventListener('click',function(){if(!lm.hidden){lm.hidden=true;lb.setAttribute('aria-expanded','false');}});
  }
  // image search (camera / upload) -> identify function
  var ib=document.getElementById('imgbtn'), im=document.getElementById('imgmenu'),
      icam=document.getElementById('imgcam'), ifile=document.getElementById('imgfile'),
      ires=document.getElementById('imgresult'), T=window.IMG_TXT||{};
  if(!ib)return;
  ib.addEventListener('click',function(e){e.stopPropagation();im.hidden=!im.hidden;});
  document.addEventListener('click',function(e){if(im&&!im.hidden&&e.target!==ib&&!im.contains(e.target))im.hidden=true;});
  im.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){im.hidden=true;(b.getAttribute('data-mode')==='cam'?icam:ifile).click();});});
  function onpick(inp){if(inp)inp.addEventListener('change',function(){if(inp.files&&inp.files[0])run(inp.files[0]);});}
  onpick(icam);onpick(ifile);
  function run(f){
    var root=window.FLORA_ROOT||'../', lang=window.FLORA_LANG||'en';
    ires.hidden=false;ires.textContent=T.busy||'...';
    var fd=new FormData();fd.append('image',f);fd.append('lang',lang);
    fetch('/.netlify/functions/identify',{method:'POST',body:fd}).then(function(r){return r.json();}).then(function(d){
      if(d&&d.match){ires.innerHTML='<div class="idmatch"><p>'+(T.inbook||'')+' <b>'+d.match.name+'</b> <i>('+d.match.sci+')</i></p><a class="btn primary" href="'+root+lang+'/plants/'+d.match.slug+'.html">'+(T.open||'Open')+'</a></div>';}
      else if(d&&d.online){ires.innerHTML='<div class="idmatch"><p>'+(T.online||'')+' <b>'+d.online.name+'</b> <i>('+d.online.sci+')</i></p></div>';}
      else{ires.textContent=T.fail||'Failed';}
    }).catch(function(){ires.textContent=T.fail||'Failed';});
  }
})();

(function(){
  // Guides nav dropdown (hover on desktop via CSS; tap toggles on touch)
  document.querySelectorAll('.navddtop').forEach(function(t){
    t.addEventListener('click',function(e){e.preventDefault();t.parentNode.classList.toggle('open');});
  });
  document.addEventListener('click',function(e){ if(!(e.target.closest&&e.target.closest('.navdd'))) document.querySelectorAll('.navdd.open').forEach(function(d){d.classList.remove('open');}); });
})();
