
(function(){
  var root=window.FLORA_ROOT||'../', lang=window.FLORA_LANG||'en', T=window.ID_TXT||{};
  var pick=document.getElementById('idpick'), file=document.getElementById('idfile'),
      prev=document.getElementById('idprev'), go=document.getElementById('idgo'),
      status=document.getElementById('idstatus'), result=document.getElementById('idresult');
  if(!pick)return; var chosen=null;
  pick.addEventListener('click',function(){file.click();});
  file.addEventListener('change',function(){ if(!file.files||!file.files[0])return; chosen=file.files[0];
    prev.src=URL.createObjectURL(chosen); prev.hidden=false; go.hidden=false; result.hidden=true; status.hidden=true; });
  go.addEventListener('click',function(){ if(!chosen)return; status.hidden=false; status.textContent=T.busy||'…'; result.hidden=true; go.disabled=true;
    var fd=new FormData(); fd.append('image',chosen); fd.append('lang',lang);
    fetch('/.netlify/functions/identify',{method:'POST',body:fd}).then(function(r){return r.json();}).then(function(d){
      go.disabled=false; status.hidden=true; result.hidden=false;
      if(d.match){ result.innerHTML='<div class="idmatch"><p>'+(T.inbook||'')+'</p><h3>'+d.match.name+' <i>('+d.match.sci+')</i></h3><a class="btn primary" href="'+root+lang+'/plants/'+d.match.slug+'.html">'+(T.open||'Open')+'</a></div>'; }
      else if(d.online){ result.innerHTML='<div class="idmatch"><p>'+(T.online||'')+'</p><h3>'+d.online.name+' <i>('+d.online.sci+')</i></h3><p>'+(T.notified||'')+'</p></div>'; }
      else { result.textContent=T.fail||'Failed'; }
    }).catch(function(){ go.disabled=false; status.hidden=true; result.hidden=false; result.textContent=T.fail||'Failed'; });
  });
})();
