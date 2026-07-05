// back-to-top + lightbox
(function(){
  var bt=document.querySelector('.backtop');
  if(bt){ window.addEventListener('scroll',function(){ if(window.pageYOffset>500) bt.classList.add('show'); else bt.classList.remove('show'); },{passive:true});
    bt.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); }); }
  var lb=document.getElementById('lightbox');
  if(lb){ var im=lb.querySelector('img'), cl=lb.querySelector('.lb-close');
    document.querySelectorAll('.gtile img').forEach(function(img){ img.addEventListener('click',function(){ im.src=img.currentSrc||img.src; im.alt=img.alt||''; lb.hidden=false; document.body.style.overflow='hidden'; }); });
    function hide(){ lb.hidden=true; im.src=''; document.body.style.overflow=''; }
    lb.addEventListener('click',function(e){ if(e.target===lb||e.target===cl) hide(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!lb.hidden) hide(); }); }
})();
