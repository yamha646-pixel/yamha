(function(){
  'use strict';
  const S=window.YamhaSite,U=window.YamhaUI;
  async function init(){
    await S.ready;
    const modal=document.getElementById('photo-dialog'),full=document.getElementById('photo-full'),count=document.getElementById('photo-count');
    let photoIndex=0,opener=null,photos=[];
    const text=(selector,value)=>{const el=document.querySelector(selector);if(el)el.textContent=value;};
    function renderPhoto(){const photo=photos[photoIndex];if(!photo)return;full.src=U.safeUrl(photo.src,{image:true})||'';full.alt=photo.alt||'';count.textContent=(photoIndex+1)+' / '+photos.length;}
    function changePhoto(direction){if(!photos.length)return;photoIndex=(photoIndex+direction+photos.length)%photos.length;renderPhoto();}
    function bridge(){
      const p=S.profile();photos=p.photos||[];
      text('.intro-eyebrow',p.bio);text('.logo-word',p.englishName?.toLowerCase().replace(/^./,s=>s.toUpperCase())||p.name);
      const caption=document.querySelector('.intro-caption');caption.replaceChildren(document.createTextNode(p.fanName+' 앞으로, '),U.el('strong',{},p.name+'가 도착했어요!'));
      text('.airmail-note>span:first-child','TO. '+p.fanName);
      text('.photo-1 figcaption>span','dear. '+p.fanName);
      text('.broadcast-note strong',p.broadcast.time==='오전 방송'?'오전에 만나요':p.broadcast.time);
      text('.broadcast-note p>span',p.broadcast.restDays==='화요일 · 수요일 고정 휴방'?'화 · 수 고정 휴방':p.broadcast.restDays);
      document.querySelectorAll('[data-photo]').forEach(button=>{
        const row=photos.find(x=>String(x.id)===button.dataset.photo),image=button.querySelector('img');
        if(row&&image){const src=U.safeUrl(row.src,{image:true});if(src)image.src=src;image.alt=row.alt||p.name;button.setAttribute('aria-label',(row.alt||p.name)+' 사진 크게 보기');}
      });
      const today=new Date(new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())+'T00:00:00Z');
      const debut=new Date(p.debutDate+'T00:00:00Z');
      if(!isNaN(debut))text('[data-debut-days]','D+'+Math.max(0,Math.floor((today-debut)/86400000)+1));
      if(modal.open)renderPhoto();
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
