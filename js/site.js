(function () {
  'use strict';
  const S=window.YamhaSite,U=window.YamhaUI,C=window.YamhaContent;
  const copy=(key,vars)=>C.text(key,vars);
  function syncLinks() {
    const profile=S.profile();
    document.querySelectorAll('.brand-avatar img').forEach(image=>{
      const src=U.safeUrl(profile.brandImage,{image:true});
      if(src){image.src=src;image.hidden=false;}
      else {image.removeAttribute('src');image.hidden=true;}
    });
    document.querySelectorAll('[data-link]').forEach(link=>{
      const key=link.dataset.link,url=U.safeUrl(profile.links?.[key]);
      if (url) {link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.removeAttribute('role');link.removeAttribute('tabindex');link.removeAttribute('aria-disabled');}
      else if(key==='store'){link.href=S.url('store/index.html');link.removeAttribute('target');link.removeAttribute('role');link.removeAttribute('tabindex');link.removeAttribute('aria-disabled');}
      else {link.removeAttribute('href');link.setAttribute('aria-disabled','true');}
    });
    C.apply();
  }
  async function init() {
    await S.ready;
    syncLinks();S.onChange(syncLinks);
    if(S.storageError())U.toast(document.body.dataset.page==='admin'?S.storageError():copy('schedule.loadError'));
    const page=document.body.dataset.page,root=document.getElementById('page-root');
    try {
      if(page==='schedule')await mountSchedule(root);
      if(page==='reward')await mountReward(root);
    } catch(error) {
      if(root)root.replaceChildren(U.el('p',{class:'schedule-empty',role:'alert'},copy('schedule.contentError')));
    }
  }
  function showEvent(row) {
    const details=U.el('dl',{class:'event-details'});
    const field=(name,value)=>{if(value)details.append(U.el('dt',{},name),U.el('dd',{},value));};
    field(copy('schedule.period'),row.date+(row.end_date&&row.end_date!==row.date?' ~ '+row.end_date:''));
    field(copy('schedule.part1'), [row.time,row.type,row.title].filter(Boolean).join(' · '));
    field(copy('schedule.part2'),[row.time2,row.type2,row.title2].filter(Boolean).join(' · '));
    if(row.highlight)field(copy('schedule.notice'),copy('schedule.special'));
    U.dialog(row.title||copy('schedule.dialogTitle'),U.el('div',{},[details,row.description?U.renderText(row.description):null]));
  }
  async function mountSchedule(root) {
    const profile=S.profile();
    const channel=U.el('a',{class:'ym-btn',target:'_blank',rel:'noopener noreferrer'},[U.el('span',{'data-y-text':'schedule.channel'},copy('schedule.channel')),U.icon('external')]);
    const routine=U.el('section',{class:'schedule-routine'},[U.el('div',{},[U.el('strong',{},profile.broadcast?.time||''),U.el('p',{},profile.broadcast?.restDays||'')]),channel]);
    function syncRoutine(){const p=S.profile(),url=U.safeUrl(p.links?.channel);routine.querySelector('strong').textContent=p.broadcast?.time||'';routine.querySelector('p').textContent=p.broadcast?.restDays||'';if(url){channel.href=url;channel.removeAttribute('aria-disabled');}else{channel.removeAttribute('href');channel.setAttribute('aria-disabled','true');}C.apply(routine);}
    syncRoutine();
    const calendar=U.el('div'),next=U.el('section',{class:'schedule-next'});
    root.replaceChildren(routine,calendar,next);
    const rows=await S.list('schedule');
    const cal=window.YamhaCalendar.mount(calendar,{events:rows,onEvent:showEvent});
    function upcoming(events) {
      const today=window.YamhaCalendar.todayKST();
      const items=events.filter(r=>(r.end_date||r.date)>=today).sort((a,b)=>a.date.localeCompare(b.date)||String(a.time||'').localeCompare(String(b.time||''))).slice(0,6);
      next.replaceChildren(U.el('h2',{},copy('schedule.upcoming')));
      if(!items.length){next.append(U.el('p',{class:'schedule-empty'},copy('schedule.empty')));return;}
      next.append(U.el('div',{class:'schedule-items'},items.map(row=>U.el('button',{class:'schedule-card',type:'button',onclick:()=>showEvent(row)},[U.el('small',{},row.date+(row.end_date?' ~ '+row.end_date:'')),U.el('strong',{},row.title),U.el('span',{},[row.time,row.type,row.title2?copy('schedule.part2Summary',{title:row.title2}):''].filter(Boolean).join(' · '))]))));
    }
    let revision=0;
    upcoming(rows);S.onChange(async()=>{const token=++revision;syncRoutine();cal.refreshCopy();try{const events=await S.list('schedule');if(token!==revision)return;cal.setEvents(events);upcoming(events);C.apply(root);}catch{if(token===revision)U.toast(copy('schedule.reloadError'));}});
  }
  async function mountReward(root) {
    const rewards=await S.list('rewards'),photos=await S.list('photos');
    const app=window.YAMHAReward.mount(root,{rewards,photos,assetBase:S.url('assets/')});
    let revision=0;
    S.onChange(async()=>{const token=++revision;try{const rewards=await S.list('rewards'),photos=await S.list('photos');if(token!==revision)return;app.update({rewards,photos});C.apply(root);}catch{if(token===revision)U.toast(copy('reward.reloadError'));}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
