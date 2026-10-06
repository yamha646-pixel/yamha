(function(){
  'use strict';
  const S=window.YamhaSite,U=window.YamhaUI,C=window.YamhaContent;
  async function init(){
    await S.ready;
    const modal=document.getElementById('photo-dialog'),full=document.getElementById('photo-full'),count=document.getElementById('photo-count');
    let photoIndex=0,opener=null,photos=[];
    const text=(selector,value)=>{const el=document.querySelector(selector);if(el)el.textContent=value;};
    function renderPhoto(){const photo=photos[photoIndex];if(!photo)return;full.src=U.safeUrl(photo.src,{image:true});full.alt=photo.alt||'';count.textContent=C.text('home.photoCount',{current:photoIndex+1,total:photos.length});}
    function changePhoto(direction){if(!photos.length)return;photoIndex=(photoIndex+direction+photos.length)%photos.length;renderPhoto();}
    function bridge(){
      const p=S.profile(),rows=Array.isArray(p.photos)?p.photos:[];
      photos=rows.filter(row=>U.safeUrl(row.src,{image:true}));
      if(photoIndex>=photos.length)photoIndex=0;
      const broadcastTime=p.broadcast?.time==='오전 방송'?C.text('home.broadcastMorning'):p.broadcast?.time||'';
      const restDays=p.broadcast?.restDays==='화요일 · 수요일 고정 휴방'?C.text('home.broadcastDefaultRest'):p.broadcast?.restDays||'';
      text('.broadcast-note strong',C.text('home.broadcastTitle',{broadcastTime}));
      text('.broadcast-note p>span',C.text('home.broadcastRest',{restDays}));
      document.querySelectorAll('[data-photo]').forEach(button=>{
        const row=rows.find(x=>String(x.id)===button.dataset.photo),image=button.querySelector('img');
        if(image){const src=U.safeUrl(row?.src,{image:true});if(src){image.src=src;image.hidden=false;}else{image.removeAttribute('src');image.hidden=true;}image.alt=row?.alt??'';button.disabled=!src;button.setAttribute('aria-label',C.text('home.photoOpen',{description:row?.alt||p.name}));}
      });
      const today=new Date(new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())+'T00:00:00Z');
      const debut=new Date(p.debutDate+'T00:00:00Z');
      text('[data-debut-days]',!isNaN(debut)?C.text('home.debutCounter',{days:Math.max(0,Math.floor((today-debut)/86400000)+1)}):'');
      C.apply();
      if(modal.open){if(photos.length)renderPhoto();else modal.close();}
    }
    document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{const i=photos.findIndex(x=>String(x.id)===button.dataset.photo);if(i<0)return;photoIndex=i;opener=button;renderPhoto();modal.showModal();}));
    document.getElementById('photo-prev').addEventListener('click',()=>changePhoto(-1));document.getElementById('photo-next').addEventListener('click',()=>changePhoto(1));
    modal.querySelector('[data-close-dialog]').addEventListener('click',()=>modal.close());
    modal.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();changePhoto(e.key==='ArrowLeft'?-1:1);}});
    modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
    modal.addEventListener('close',()=>opener?.focus({preventScroll:true}));
    bridge();S.onChange(bridge);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)bridge();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
