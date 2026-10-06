/* 공개 페이지. 데이터 연결 전에도 실제 제공된 프로필/가이드를 읽을 수 있습니다. */
(function () {
  'use strict';
  const pages = ['profile', 'news', 'guide', 'debt', 'store', 'song'];
  const page = document.body.dataset.page;
  if (!pages.includes(page)) return;
  let S, U, root, epoch = 0;
  const C=window.YamhaContent;
  const copy=(key,vars)=>C.text(key,vars);
  const separator=()=>copy('pages.separator');
  const noValue=()=>copy('pages.noValue');
  const state = { query: '', category: 'ALL', status: 'all', guide: ['chat','fan','creation'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'chat' };
  const E = (tag, attrs, children) => U.el(tag, attrs || {}, children === undefined ? [] : children);
  const T = value => String(value == null ? '' : value);
  const match = (value, query) => T(value).toLocaleLowerCase().includes(T(query).trim().toLocaleLowerCase());
  const date = value => {
    const raw=T(value);
    if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw.replaceAll('-', '.');
    if(!/^\d{4}-\d{2}-\d{2}T/.test(raw))return '';
    const parsed=new Date(raw);if(Number.isNaN(parsed.getTime()))return '';
    const parts=new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(parsed);
    const get=kind=>parts.find(p=>p.type===kind).value;
    return [get('year'),get('month'),get('day')].join('.');
  };
  function dayCounters(p) {
    const now=new Date(),kst=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now).split('-').map(Number);
    const today=Date.UTC(kst[0],kst[1]-1,kst[2]);
    const born=T(p.birthday).match(/(\d{2})[.\-/]?(\d{2})$/);
    let birthday=null;
    if(born){let target=Date.UTC(kst[0],Number(born[1])-1,Number(born[2]));if(target<today)target=Date.UTC(kst[0]+1,Number(born[1])-1,Number(born[2]));const days=Math.round((target-today)/86400000);birthday=days===0?copy('profile.birthdayToday'):copy('profile.daysBefore',{days});}
    const debut=Date.parse(T(p.debutDate).slice(0,10)+'T00:00:00Z'),days=Math.floor((today-debut)/86400000);
    return E('div',{class:'yp-day-counters'},[E('span',{},[E('small',{},copy('profile.birthdayCounter')),E('b',{},birthday??noValue())]),E('span',{},[E('small',{},copy('profile.debutCounter')),E('b',{},Number.isFinite(days)?(days>=0?copy('profile.daysAfter',{days:days+1}):copy('profile.daysBefore',{days:Math.abs(days)})):noValue())])]);
  }
  function button(text, fn, cls = 'yp-button') { const b = E('button', { type:'button', class:cls }, text); b.addEventListener('click',fn); return b; }
  function imageURL(value) { const v=T(value).trim(); return v ? U.safeUrl(v,{image:true}) : null; }
  function image(value, alt, cls='') {
    const src=imageURL(value); if (!src) return E('span',{class:'yp-image-fallback'},U.icon('envelope'));
    const img=E('img',{src,alt:T(alt),class:cls,loading:'lazy',decoding:'async'});
    img.addEventListener('error',()=>img.replaceWith(E('span',{class:'yp-image-fallback'},copy('pages.imageError'))),{once:true});
    return img;
  }
  function external(text, value, cls='yp-button') { const href=U.safeUrl(value); if(!href)return null; return E('a',{href,target:'_blank',rel:'noopener noreferrer',class:cls},[text,U.icon('external')]); }
  function textBody(body) { return E('div',{class:'yp-prose'}, U.renderText(T(body))); }
  function decoration(key, cls) {
    const value=C.image(key);
    return value.trim()?image(value,'',cls):'';
  }
  function empty(title, body, imageKey) {
    return E('div',{class:'yp-empty'},[decoration(imageKey,'yp-empty-stamp'),E('h2',{},title),E('p',{},body)]);
  }
  function search(placeholder, callback) {
    const input=E('input',{type:'search',value:state.query,placeholder,'aria-label':placeholder,autocomplete:'off'});
    input.addEventListener('input',()=>{state.query=input.value;callback();});
    return E('label',{class:'yp-search'},[U.icon('search'),input]);
  }
  function filters(items, current, onChange) {
    return E('div',{class:'yp-filters','aria-label':copy('pages.filterLabel')},items.map(([key,label])=>{
      const b=button(label,()=>onChange(key),'yp-filter'+(current===key?' is-active':''));
      b.dataset.filter=key; b.setAttribute('aria-pressed',String(current===key)); return b;
    }));
  }
  function activate(container, value) { container.querySelectorAll('[data-filter]').forEach(b=>{const yes=b.dataset.filter===value;b.classList.toggle('is-active',yes);b.setAttribute('aria-pressed',String(yes));}); }
  function heading(title, subtitle) { return E('div',{class:'yp-section-heading'},[E('h2',{},title),subtitle?E('p',{},subtitle):'']); }
  function safeImages(images) { return Array.isArray(images) ? images.filter(v=>typeof v==='string'&&imageURL(v)) : []; }
  function gallery(images, captions=[]) {
    return E('div',{class:'yp-image-gallery'},safeImages(images).map((src,i)=>{
      const label=captions[i]??copy('pages.galleryPhoto',{number:i+1});
      const b=button([image(src,label),E('span',{},[label,U.icon('expand')])],()=>U.dialog(label,E('div',{class:'yp-full-image'},image(src,label))),'yp-gallery-button');
      b.setAttribute('aria-label',copy('pages.galleryOpen',{label})); return b;
    }));
  }
  function startPage(children) { root.replaceChildren(E('div',{class:'yp-page yp-'+page},children)); C.apply(root); }
  async function profile(token) {
    const p=S.profile(); const rows=await S.list('timeline'); if(token!==epoch)return;
    const name=T(p.name),fan=T(p.fanName),english=T(p.englishName);
    const basics=[['name',name],['english',english],['birthday',p.birthday],['debut',date(p.debutDate)],['fandom',fan],['agency',p.agency],['gender',p.gender]].map(([key,value])=>[copy('profile.fact.'+key),value]);
    const photo=p.profileImage??(p.photos&&p.photos[0]&&p.photos[0].src)??'';
    const photoAlt=p.profileImage!=null?copy('profile.photoAltFallback'):(p.photos&&p.photos[0]&&p.photos[0].alt)??copy('profile.photoAltFallback');
    const chips=Array.isArray(p.broadcast&&p.broadcast.categories)?p.broadcast.categories:[];
    const info=E('div',{class:'yp-profile-info'},[
      E('span',{class:'yp-kicker'},copy('profile.letterKicker',{displayName:english||name})),E('p',{class:'yp-profile-bio'},T(p.bio)),
      E('h2',{class:'yp-profile-name'},[name,E('small',{},english)]),
      E('div',{class:'yp-tags'},chips.map(t=>E('span',{},T(t)))),dayCounters(p),
      E('dl',{class:'yp-facts'},basics.map(([a,b])=>E('div',{},[E('dt',{},a),E('dd',{},T(b)||noValue())]))),
      E('div',{class:'yp-profile-social'},[['channel',p.links&&p.links.channel],['youtube',p.links&&p.links.youtube],['cafe',p.links&&p.links.cafe],['x',p.links&&p.links.x]].map(([a,b])=>external(copy('profile.social.'+a),b,'yp-text-link')).filter(Boolean))
    ]);
    const likes=(Array.isArray(p.interests)?p.interests.join(separator()):T(p.interests))||noValue();
    const dislikes=(Array.isArray(p.dislikes)?p.dislikes.join(separator()):T(p.dislikes))||noValue();
    const broadcast=p.broadcast||{};
    const intro=p.intro===undefined?copy('profile.intro',{fanName:fan||copy('profile.introAudience')}):T(p.intro);
    const character=E('section',{class:'yp-character-note'},[E('div',{},[E('span',{class:'yp-kicker'},copy('profile.introKicker')),E('h2',{},copy('profile.introHeading')),intro?E('p',{},intro):'']),E('dl',{},[E('div',{},[E('dt',{},copy('profile.personalityLabel')),E('dd',{},T(p.personality)||noValue())]),E('div',{},[E('dt',{},copy('profile.catchphraseLabel')),E('dd',{},T(p.catchphrase)||noValue())])])]);
    const week=E('section',{class:'yp-week-section'},[heading(copy('profile.weekHeading'),[broadcast.time,broadcast.restDays].filter(Boolean).join(separator())),E('div',{class:'yp-week-strip'},Array.from({length:7},(_,i)=>copy('profile.weekdays').split('|')[i]??'').map((d,i)=>{const configured=Array.isArray(broadcast.week)?broadcast.week[i]:null;const hasConfigured=configured!==undefined&&configured!==null;const rest=hasConfigured?configured==='휴방':[1,2].includes(i);return E('div',{class:'yp-week-day'+(rest?' is-rest':'')},[E('span',{},d),E('strong',{},hasConfigured?T(configured):(rest?copy('profile.weekRest'):copy('profile.weekMorning'))),E('small',{},rest?copy('profile.weekRestNote'):copy('profile.weekOnNote'))]);})),E('a',{class:'yp-text-link',href:S.url('schedule/index.html')},[copy('profile.weekScheduleLink'),U.icon('arrow')])]);
    const notes=E('div',{class:'yp-notes'},[
      E('section',{class:'yp-note yp-note-green'},[E('span',{class:'yp-note-no'},copy('profile.likesKicker')),E('h3',{},copy('profile.likesHeading')),E('p',{},likes),E('p',{class:'yp-note-sub'},copy('profile.dislikesText',{dislikes}))]),
      E('section',{class:'yp-note'},[E('span',{class:'yp-note-no'},copy('profile.broadcastKicker')),E('h3',{},T(broadcast.time)||copy('profile.broadcastTimeFallback')),E('p',{},T(broadcast.restDays)),E('p',{class:'yp-note-sub'},copy('profile.gamesText',{games:T(p.games)||noValue()})),E('a',{class:'yp-text-link',href:S.url('schedule/index.html')},[copy('profile.broadcastScheduleLink'),U.icon('arrow')])]),
      E('section',{class:'yp-note'},[E('span',{class:'yp-note-no'},copy('profile.musicKicker')),E('h3',{},copy('profile.musicHeading')),E('p',{},(Array.isArray(p.genres)?p.genres.join(separator()):T(p.genres))||noValue()),E('p',{class:'yp-note-sub'},copy('profile.signatureSongText',{song:T(p.signatureSong)||noValue()})),E('p',{class:'yp-note-sub'},copy('profile.singingText',{frequency:T(p.sing)||noValue()})),external(copy('profile.songbookLink'),p.links&&p.links.songbook,'yp-text-link')||''])
    ]);
    const timeline=rows.slice().sort((a,b)=>T(b.date).localeCompare(T(a.date))).map(r=>E('li',{},[
      E('time',{datetime:T(r.date)},date(r.date)),E('div',{},[E('h3',{},T(r.title)),r.body?textBody(r.body):'',r.image?gallery([r.image],[T(r.title)]):''])
    ]));
    startPage([
      E('section',{class:'yp-profile-card'},[E('div',{class:'yp-profile-photo'},[image(photo,photoAlt),E('span',{},copy('profile.photoCaption',{fanName:fan||copy('profile.photoAudience')}))]),info]),
      character,notes,week,
      E('a',{class:'yp-design-link',href:S.url('guide/index.html#creation')},[decoration('profile.designSeal','yp-design-seal'),E('span',{},[E('strong',{},copy('profile.designHeading',{fanName:fan||copy('profile.designFanFallback')})),E('small',{},copy('profile.designBody'))]),U.icon('arrow')]),
      E('section',{class:'yp-timeline-section'},[heading(copy('profile.timelineHeading'),copy('profile.timelineBody')),timeline.length?E('ol',{class:'yp-timeline'},timeline):empty(copy('profile.timelineEmptyTitle'),copy('profile.timelineEmptyBody'),'profile.timelineEmptyImage')])
    ]);
  }
  async function news(token) {
    const items=(await S.list('news')).filter(r=>r.published!==false).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||T(b.published_at).localeCompare(T(a.published_at)));
    if(token!==epoch)return;
    const labels={NOTICE:copy('news.category.notice'),CONTENTS:copy('news.category.contents'),EVENT:copy('news.category.event')};
    let results, total, tabs;
    function open(r) { U.dialog(r.title,E('article',{class:'yp-news-detail'},[E('div',{class:'yp-article-meta'},[E('span',{},labels[r.category]??copy('news.category.notice')),E('time',{},date(r.published_at))]),textBody(r.body),gallery(r.images)])); }
    function draw() {
      const found=items.filter(r=>(state.category==='ALL'||r.category===state.category)&&match(r.title,state.query));
      total.textContent=copy('news.resultCount',{count:found.length}); activate(tabs,state.category);
      results.replaceChildren(...(found.length?found.map(r=>{
        const imgs=safeImages(r.images);
        const b=button([E('div',{class:'yp-news-cover'},imgs.length?image(imgs[0],T(r.title)):E('div',{class:'yp-news-letter'},[U.icon('envelope'),E('span',{},copy('news.letterCaption'))])),E('div',{class:'yp-news-copy'},[E('div',{class:'yp-news-meta'},[E('span',{class:'yp-category'},labels[r.category]??copy('news.category.notice')),r.pinned?E('span',{class:'yp-pinned'},copy('news.pinned')):'',E('time',{},date(r.published_at))]),E('h2',{},T(r.title)),E('p',{},T(r.body).replace(/^#{1,3}\s*/gm,'').replace(/^-\s*/gm,'').slice(0,130)),E('span',{class:'yp-read-more'},[copy('news.readMore'),U.icon('arrow')])])],()=>open(r),'yp-news-item'); return b;
      }):[empty(copy(items.length?'news.searchEmptyTitle':'news.emptyTitle'),copy(items.length?'news.searchEmptyBody':'news.emptyBody'),'news.emptyImage')]));
    }
    tabs=filters(['ALL','NOTICE','CONTENTS','EVENT'].map(key=>[key,copy('news.category.'+key.toLowerCase())]),state.category,key=>{state.category=key;draw();});
    results=E('div',{class:'yp-news-list'}); total=E('span',{class:'yp-result-count','aria-live':'polite'});
    startPage([E('div',{class:'yp-list-tools'},[tabs,search(copy('news.searchPlaceholder'),draw)]),total,results]); draw();
  }
  async function guide(token) {
    const rows=(await S.list('guides')).slice().sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
    if(token!==epoch)return;
    const labels={chat:copy('guide.tab.chat'),fan:copy('guide.tab.fan'),creation:copy('guide.tab.creation')};
    const icons={chat:'chat',fan:'heart',creation:'stamp'};
    const article=E('article',{class:'yp-guide-article',id:'guide-content',role:'tabpanel',tabindex:'0'});
    const tabs=E('div',{class:'yp-guide-tabs',role:'tablist','aria-label':copy('guide.tabsLabel')});
    function draw(id) {
      const row=rows.find(r=>r.id===id)||rows[0]; if(!row){article.replaceChildren(empty(copy('guide.emptyTitle'),copy('guide.emptyBody'),'guide.emptyImage'));return;}
      state.guide=row.id;
      tabs.querySelectorAll('button').forEach(b=>{const active=b.dataset.guide===row.id;b.classList.toggle('is-active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
      article.setAttribute('aria-labelledby','guide-tab-'+row.id);
      const p=S.profile();
      article.replaceChildren(E('div',{class:'yp-guide-head'},[E('span',{class:'yp-kicker'},copy('guide.recipient',{fanName:T(p.fanName)||copy('guide.recipientFallback')})),E('h2',{},row.title),E('p',{},copy('guide.updatedAt',{date:date(row.updated_at)}))]));
      const prose=textBody(row.body);
      if(row.id==='creation'&&safeImages(row.images).length){
        const imageLabels=['guide.imageOriginalLabel','guide.imageJacketLabel','guide.imageFanLabel'].map(key=>copy(key));
        const collection=gallery(row.images,imageLabels); collection.classList.add('yp-design-gallery');
        const headings=Array.from(prose.querySelectorAll('h2,h3'));
        const firstRule=headings.find(h=>h.textContent.trim()==='금지사항');
        if(firstRule)firstRule.before(collection);else prose.prepend(collection);
      }else if(safeImages(row.images).length)prose.append(gallery(row.images));
      article.append(prose,E('div',{class:'yp-guide-ending'},[decoration('guide.endingSeal','yp-ending-seal'),E('p',{},copy('guide.endingThanks')),E('span',{},copy('guide.endingSignature',{displayName:T(p.englishName||p.name)}))]));
    }
    rows.forEach((r,i)=>{
      const b=button([E('span',{class:'yp-guide-tab-number'},String(i+1).padStart(2,'0')),E('span',{},labels[r.id]??r.title),U.icon('arrow')],()=>{history.replaceState(null,'','#'+r.id);draw(r.id);},'yp-guide-tab');
      b.id='guide-tab-'+r.id;b.dataset.guide=r.id;b.setAttribute('role','tab');b.setAttribute('aria-controls','guide-content');
      b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const bs=Array.from(tabs.children);let n=i;if(e.key==='Home')n=0;else if(e.key==='End')n=bs.length-1;else n=(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+bs.length)%bs.length;bs[n].click();bs[n].focus();});
      tabs.append(b);
    });
    startPage([E('div',{class:'yp-guide-layout'},[tabs,article])]);draw(state.guide);
  }
  async function debt(token) {
    const items=await S.list('debts');if(token!==epoch)return;const fan=T(S.profile().fanName)||copy('debt.fanFallback');
    let results, total, tabs;
    const count=r=>Math.max(0,Number(r.count)||0);
    function open(nickname,rows) {
      const list=E('div',{class:'yp-debt-detail'},rows.map(r=>E('section',{class:'yp-debt-entry'},[E('div',{class:'yp-debt-entry-top'},[E('h3',{},T(r.label)),E('span',{class:'yp-status'+(r.status==='done'?' is-done':'')},copy(r.status==='done'?'debt.status.done':'debt.status.pending'))]),E('p',{class:'yp-debt-amount'},[String(count(r)),E('small',{},T(r.unit)||copy('debt.defaultUnit'))]),r.note?textBody(r.note):'',r.updated_at?E('time',{class:'yp-muted'},copy('debt.updatedAt',{date:date(r.updated_at)})):''])));
      U.dialog(copy('debt.detailHeading',{nickname}),list);
    }
    function draw() {
      const found=items.filter(r=>match(r.nickname,state.query)&&(state.status==='all'||r.status===state.status));
      const groups=new Map();found.forEach(r=>{const nick=T(r.nickname)||copy('debt.unnamed');if(!groups.has(nick))groups.set(nick,[]);groups.get(nick).push(r);});
      total.textContent=copy('debt.resultCount',{people:groups.size,fanName:fan,count:found.length});activate(tabs,state.status);
      results.replaceChildren(...(groups.size?Array.from(groups.entries()).sort((a,b)=>a[0].localeCompare(b[0],'ko')).map(([nick,rows])=>{
        const units=new Map();rows.forEach(r=>{const unit=T(r.unit)||copy('debt.defaultUnit');units.set(unit,(units.get(unit)||0)+count(r));});
        const sums=Array.from(units,([unit,n])=>copy('debt.quantity',{count:n.toLocaleString('ko-KR'),unit})).join(separator());
        return button([E('div',{class:'yp-debt-avatar','aria-hidden':'true'},nick[0]),E('h2',{},nick),E('p',{class:'yp-debt-sum'},sums),E('p',{class:'yp-muted'},copy('debt.progress',{pending:rows.filter(r=>r.status!=='done').length,done:rows.filter(r=>r.status==='done').length})),E('div',{class:'yp-tags'},[...new Set(rows.map(r=>T(r.label)))].slice(0,3).map(t=>E('span',{},t))),E('span',{class:'yp-read-more'},[copy('debt.readMore'),U.icon('arrow')])],()=>open(nick,rows),'yp-debt-card');
      }):[empty(copy(items.length?'debt.searchEmptyTitle':'debt.emptyTitle'),copy(items.length?'debt.searchEmptyBody':'debt.emptyBody',{fanName:fan}),'debt.emptyImage')]));
    }
    tabs=filters(['all','pending','done'].map(key=>[key,copy('debt.status.'+key)]),state.status,key=>{state.status=key;draw();});
    results=E('div',{class:'yp-debt-grid'});total=E('span',{class:'yp-result-count','aria-live':'polite'});
    startPage([E('div',{class:'yp-list-tools'},[tabs,search(copy('debt.searchPlaceholder',{fanName:fan}),draw)]),total,results]);draw();
  }
  async function store(token) {
    if(token!==epoch)return;const p=S.profile(), link=p.links&&p.links.store;
    const name=T(p.name),go=external(copy('store.openLink'),link,'yp-button yp-primary');
    startPage([E('section',{class:'yp-store-letter'},[decoration('store.stampImage','yp-store-stamp'),E('span',{class:'yp-kicker'},copy('store.kicker')),E('h2',{},copy(go?'store.openHeading':'store.emptyHeading')),E('p',{},copy(go?'store.openBody':'store.emptyBody')),go||E('span',{class:'yp-coming'},copy('store.comingSoon')),E('span',{class:'yp-store-sign'},copy('store.signature'))])]);
  }
  async function song(token) {
    const items=await S.list('songs');if(token!==epoch)return;const p=S.profile();let results,total,tabs;
    const genres=[...new Set(items.map(r=>T(r.genre)).filter(Boolean))];
    if(state.category!=='ALL'&&!genres.includes(state.category))state.category='ALL';
    function draw(){const found=items.filter(r=>(state.category==='ALL'||r.genre===state.category)&&(match(r.title,state.query)||match(r.artist,state.query)));activate(tabs,state.category);total.textContent=copy('song.resultCount',{count:found.length});results.replaceChildren(...(found.length?found.map(r=>E('article',{class:'yp-song-row'},[E('span',{class:'yp-song-symbol'},U.icon('music')),E('div',{},[E('h2',{},T(r.title)),E('p',{class:'yp-muted'},T(r.artist)),r.memo?E('p',{class:'yp-song-memo'},T(r.memo)):'']),E('span',{class:'yp-song-genre'},T(r.genre))])):[empty(copy(items.length?'song.searchEmptyTitle':'song.emptyTitle'),copy(items.length?'song.searchEmptyBody':'song.emptyBody'),'song.emptyImage')]));}
    tabs=filters([['ALL',copy('song.filterAll')],...genres.map(x=>[x,x])],state.category,x=>{state.category=x;draw();});results=E('div',{class:'yp-song-list'});total=E('span',{class:'yp-result-count','aria-live':'polite'});
    startPage([E('div',{class:'yp-song-link'},[E('div',{},[E('h2',{},copy('song.heading')),E('p',{},copy('song.body'))]),external(copy('song.openLink'),p.links&&p.links.songbook,'yp-button yp-primary')||'']),E('div',{class:'yp-list-tools'},[tabs,search(copy('song.searchPlaceholder'),draw)]),total,results]);draw();
  }
  const renderers={profile,news,guide,debt,store,song};
  async function render(){const token=++epoch;try{await renderers[page](token);}catch(err){if(token!==epoch)return;root.replaceChildren(E('div',{class:'yp-page'},empty(copy('pages.loadErrorTitle'),copy('pages.loadErrorBody'),'pages.loadErrorImage')));console.error('Yamha page load failed',err);}}
  async function boot(){S=window.YamhaSite;U=window.YamhaUI;root=document.getElementById('page-root');if(!S||!U||!root)return;await S.ready;await render();S.onChange(()=>render());if(page==='guide')window.addEventListener('hashchange',()=>{if(['chat','fan','creation'].includes(location.hash.slice(1))){state.guide=location.hash.slice(1);render();}});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
