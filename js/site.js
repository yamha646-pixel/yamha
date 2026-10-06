(function () {
  'use strict';
  const S=window.YamhaSite,U=window.YamhaUI;
  function syncLinks() {
    const profile=S.profile();
    document.querySelectorAll('.brand-avatar img').forEach(image=>{
      const src=U.safeUrl(profile.brandImage,{image:true});
      if(src)image.src=src;
    });
    document.querySelectorAll('[data-link]').forEach(link=>{
      const key=link.dataset.link,url=U.safeUrl(profile.links?.[key]);
      if (url) {link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.removeAttribute('role');link.removeAttribute('tabindex');link.removeAttribute('aria-disabled');}
      else if(key==='store'){link.href=S.url('store/index.html');link.removeAttribute('target');link.removeAttribute('role');link.removeAttribute('tabindex');}
      else {link.removeAttribute('href');link.setAttribute('aria-disabled','true');}
    });
  }
  async function init() {
    await S.ready;
    syncLinks();S.onChange(syncLinks);
    if(S.storageError())U.toast(document.body.dataset.page==='admin'?S.storageError():'저장된 내용을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.');
    const page=document.body.dataset.page,root=document.getElementById('page-root');
    try {
      if(page==='schedule')await mountSchedule(root);
      if(page==='reward')await mountReward(root);
    } catch(error) {
      if(root)root.replaceChildren(U.el('p',{class:'schedule-empty',role:'alert'},'내용을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.'));
    }
  }
  function showEvent(row) {
    const details=U.el('dl',{class:'event-details'});
    const field=(name,value)=>{if(value)details.append(U.el('dt',{},name),U.el('dd',{},value));};
    field('기간',row.date+(row.end_date&&row.end_date!==row.date?' ~ '+row.end_date:''));
    field('1부', [row.time,row.type,row.title].filter(Boolean).join(' · '));
    field('2부',[row.time2,row.type2,row.title2].filter(Boolean).join(' · '));
    if(row.highlight)field('알림','특별 일정');
    U.dialog(row.title||'방송 일정',U.el('div',{},[details,row.description?U.renderText(row.description):null]));
  }
  async function mountSchedule(root) {
    const profile=S.profile();
    const routine=U.el('section',{class:'schedule-routine'},[U.el('div',{},[U.el('strong',{},profile.broadcast.time),U.el('p',{},profile.broadcast.restDays)]),U.el('a',{class:'ym-btn',href:U.safeUrl(profile.links.channel),target:'_blank',rel:'noopener noreferrer'},['채널에서 만나기',U.icon('external')])]);
    const calendar=U.el('div'),next=U.el('section',{class:'schedule-next'});
    root.replaceChildren(routine,calendar,next);
    const rows=await S.list('schedule');
    const cal=window.YamhaCalendar.mount(calendar,{events:rows,onEvent:showEvent});
    function upcoming(events) {
      const today=window.YamhaCalendar.todayKST();
      const items=events.filter(r=>(r.end_date||r.date)>=today).sort((a,b)=>a.date.localeCompare(b.date)||String(a.time||'').localeCompare(String(b.time||''))).slice(0,6);
      next.replaceChildren(U.el('h2',{},'곧 만날 약속'));
      if(!items.length){next.append(U.el('p',{class:'schedule-empty'},'아직 등록된 일정이 없어요. 새로운 방송 소식을 기다려 주세요.'));return;}
      next.append(U.el('div',{class:'schedule-items'},items.map(row=>U.el('button',{class:'schedule-card',type:'button',onclick:()=>showEvent(row)},[U.el('small',{},row.date+(row.end_date?' ~ '+row.end_date:'')),U.el('strong',{},row.title),U.el('span',{},[row.time,row.type,row.title2?'2부 '+row.title2:''].filter(Boolean).join(' · '))]))));
    }
    upcoming(rows);S.onChange(async()=>{try{const events=await S.list('schedule');cal.setEvents(events);upcoming(events);const p=S.profile();routine.querySelector('strong').textContent=p.broadcast.time;routine.querySelector('p').textContent=p.broadcast.restDays;}catch{U.toast('일정을 다시 불러오지 못했어요. 잠시 후 다시 확인해 주세요.');}});
  }
  async function mountReward(root) {
    const rewards=await S.list('rewards'),photos=await S.list('photos');
    const app=window.YAMHAReward.mount(root,{rewards,photos,assetBase:S.url('assets/')});
    S.onChange(async()=>{try{app.update({rewards:await S.list('rewards'),photos:await S.list('photos')});}catch{U.toast('리워드를 다시 불러오지 못했어요. 잠시 후 다시 확인해 주세요.');}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
