/* 공개 페이지. 데이터 연결 전에도 실제 제공된 프로필/가이드를 읽을 수 있습니다. */
(function () {
  'use strict';
  const pages = ['profile', 'news', 'guide', 'debt', 'store', 'song'];
  const page = document.body.dataset.page;
  if (!pages.includes(page)) return;
  let S, U, root, epoch = 0;
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
    let birthday='';
    if(born){let target=Date.UTC(kst[0],Number(born[1])-1,Number(born[2]));if(target<today)target=Date.UTC(kst[0]+1,Number(born[1])-1,Number(born[2]));const days=Math.round((target-today)/86400000);birthday=days===0?'HAPPY BIRTHDAY':'D−'+days;}
    const debut=Date.parse(T(p.debutDate).slice(0,10)+'T00:00:00Z'),days=Math.floor((today-debut)/86400000);
    return E('div',{class:'yp-day-counters'},[E('span',{},[E('small',{},'생일까지'),E('b',{},birthday||'—')]),E('span',{},[E('small',{},'데뷔부터'),E('b',{},Number.isFinite(days)?(days>=0?'D+'+(days+1):'D−'+Math.abs(days)):'—')])]);
  }
  function button(text, fn, cls = 'yp-button') { const b = E('button', { type:'button', class:cls }, text); b.addEventListener('click',fn); return b; }
  function imageURL(value) { const v=T(value).trim(); return v ? U.safeUrl(v,{image:true}) : null; }
  function image(value, alt, cls='') {
    const src=imageURL(value); if (!src) return E('span',{class:'yp-image-fallback'},U.icon('envelope'));
    const img=E('img',{src,alt:T(alt),class:cls,loading:'lazy',decoding:'async'});
    img.addEventListener('error',()=>img.replaceWith(E('span',{class:'yp-image-fallback'},'이미지를 불러올 수 없어요.')),{once:true});
    return img;
  }
  function external(text, value, cls='yp-button') { const href=U.safeUrl(value); if(!href)return null; return E('a',{href,target:'_blank',rel:'noopener noreferrer',class:cls},[text,U.icon('external')]); }
  function textBody(body) { return E('div',{class:'yp-prose'}, U.renderText(T(body))); }
  function empty(title, body, art='stamp-acorn.png') {
    return E('div',{class:'yp-empty'},[image('assets/'+art,'','yp-empty-stamp'),E('h2',{},title),E('p',{},body)]);
  }
  function search(placeholder, callback) {
    const input=E('input',{type:'search',value:state.query,placeholder,'aria-label':placeholder,autocomplete:'off'});
    input.addEventListener('input',()=>{state.query=input.value;callback();});
    return E('label',{class:'yp-search'},[U.icon('search'),input]);
  }
  function filters(items, current, onChange) {
    return E('div',{class:'yp-filters','aria-label':'목록 분류'},items.map(([key,label])=>{
      const b=button(label,()=>onChange(key),'yp-filter'+(current===key?' is-active':''));
      b.dataset.filter=key; b.setAttribute('aria-pressed',String(current===key)); return b;
    }));
  }
  function activate(container, value) { container.querySelectorAll('[data-filter]').forEach(b=>{const yes=b.dataset.filter===value;b.classList.toggle('is-active',yes);b.setAttribute('aria-pressed',String(yes));}); }
  function heading(title, subtitle) { return E('div',{class:'yp-section-heading'},[E('h2',{},title),subtitle?E('p',{},subtitle):'']); }
  function safeImages(images) { return Array.isArray(images) ? images.filter(v=>typeof v==='string'&&imageURL(v)) : []; }
  function gallery(images, captions=[]) {
    return E('div',{class:'yp-image-gallery'},safeImages(images).map((src,i)=>{
      const label=captions[i]||'사진 '+(i+1);
      const b=button([image(src,label),E('span',{},[label,U.icon('expand')])],()=>U.dialog(label,E('div',{class:'yp-full-image'},image(src,label))),'yp-gallery-button');
      b.setAttribute('aria-label',label+' 크게 보기'); return b;
    }));
  }
  function startPage(children) { root.replaceChildren(E('div',{class:'yp-page yp-'+page},children)); }
  async function profile(token) {
    const p=S.profile(); const rows=await S.list('timeline'); if(token!==epoch)return;
    const name=T(p.name),fan=T(p.fanName),english=T(p.englishName);
    const basics=[['이름',name],['영문',english],['생일',p.birthday],['데뷔',date(p.debutDate)],['팬네임',fan],['소속',p.agency],['성별',p.gender]];
    const photo=p.profileImage??(p.photos&&p.photos[0]&&p.photos[0].src)??'';
    const photoAlt=p.photos&&p.photos[0]&&p.photos[0].alt||name+' 프로필';
    const chips=Array.isArray(p.broadcast&&p.broadcast.categories)?p.broadcast.categories:[];
    const info=E('div',{class:'yp-profile-info'},[
      E('span',{class:'yp-kicker'},'A LETTER FROM '+(english||name)),E('p',{class:'yp-profile-bio'},T(p.bio)),
      E('h2',{class:'yp-profile-name'},[name,E('small',{},english)]),
      E('div',{class:'yp-tags'},chips.map(t=>E('span',{},T(t)))),dayCounters(p),
      E('dl',{class:'yp-facts'},basics.map(([a,b])=>E('div',{},[E('dt',{},a),E('dd',{},T(b)||'—')]))),
      E('div',{class:'yp-profile-social'},[['방송국',p.links&&p.links.channel],['YouTube',p.links&&p.links.youtube],['팬카페',p.links&&p.links.cafe],['X',p.links&&p.links.x]].map(([a,b])=>external(a,b,'yp-text-link')).filter(Boolean))
    ]);
    const likes=(Array.isArray(p.interests)?p.interests.join(' · '):T(p.interests))||'—';
    const dislikes=(Array.isArray(p.dislikes)?p.dislikes.join(' · '):T(p.dislikes))||'—';
    const broadcast=p.broadcast||{};
    const intro=p.intro===undefined?'소통하고, 게임하고, 가끔 노래도 하는 하늘다람쥐 편지배달부. '+(fan||'여러분')+'과 함께할 달달한 순간들을 기다리고 있어요.':T(p.intro);
    const character=E('section',{class:'yp-character-note'},[E('div',{},[E('span',{class:'yp-kicker'},'HELLO, MY DEAR'),E('h2',{},name+'를 소개합니다'),intro?E('p',{},intro):'']),E('dl',{},[E('div',{},[E('dt',{},'성격'),E('dd',{},T(p.personality)||'—')]),E('div',{},[E('dt',{},'말버릇'),E('dd',{},T(p.catchphrase)||'—')])])]);
    const week=E('section',{class:'yp-week-section'},[heading('매일의 배달 시간',[broadcast.time,broadcast.restDays].filter(Boolean).join(' · ')),E('div',{class:'yp-week-strip'},['월','화','수','목','금','토','일'].map((d,i)=>{const configured=Array.isArray(broadcast.week)?broadcast.week[i]:null;const rest=configured?configured==='휴방':[1,2].includes(i);return E('div',{class:'yp-week-day'+(rest?' is-rest':'')},[E('span',{},d),E('strong',{},configured||(rest?'휴방':'오전')),E('small',{},rest?'충전 중':'방송')]);})),E('a',{class:'yp-text-link',href:S.url('schedule/index.html')},['자세한 일정 확인',U.icon('arrow')])]);
    const notes=E('div',{class:'yp-notes'},[
      E('section',{class:'yp-note yp-note-green'},[E('span',{class:'yp-note-no'},'01 / LIKE'),E('h3',{},name+'가 좋아하는 것'),E('p',{},likes),E('p',{class:'yp-note-sub'},'어려워하는 것 · '+dislikes)]),
      E('section',{class:'yp-note'},[E('span',{class:'yp-note-no'},'02 / ON AIR'),E('h3',{},T(broadcast.time)||'방송 시간 미정'),E('p',{},T(broadcast.restDays)),E('p',{class:'yp-note-sub'},'플레이하는 게임 · '+(T(p.games)||'—')),E('a',{class:'yp-text-link',href:S.url('schedule/index.html')},['방송 일정 확인',U.icon('arrow')])]),
      E('section',{class:'yp-note'},[E('span',{class:'yp-note-no'},'03 / MUSIC'),E('h3',{},name+'의 플레이리스트'),E('p',{},(Array.isArray(p.genres)?p.genres.join(' · '):T(p.genres))||'—'),E('p',{class:'yp-note-sub'},'시그니처 곡 · '+(T(p.signatureSong)||'—')),E('p',{class:'yp-note-sub'},'노래 방송 · '+(T(p.sing)||'—')),external('노래책 보러 가기',p.links&&p.links.songbook,'yp-text-link')||''])
    ]);
    const timeline=rows.slice().sort((a,b)=>T(b.date).localeCompare(T(a.date))).map(r=>E('li',{},[
      E('time',{datetime:T(r.date)},date(r.date)),E('div',{},[E('h3',{},T(r.title)),r.body?textBody(r.body):'',r.image?gallery([r.image],[T(r.title)]):''])
    ]));
    startPage([
      E('section',{class:'yp-profile-card'},[E('div',{class:'yp-profile-photo'},[image(photo,photoAlt),E('span',{},'dear. '+(fan||'you')+' ♡')]),info]),
      character,notes,week,
      E('a',{class:'yp-design-link',href:S.url('guide/index.html#creation')},[image('assets/postage-seal.png','','yp-design-seal'),E('span',{},[E('strong',{},name+'와 '+(fan||'팬캐릭터')+'의 디자인'),E('small',{},'오리지널 의상 · 헤어 · 팬캐릭터 · 2차 창작 안내')]),U.icon('arrow')]),
      E('section',{class:'yp-timeline-section'},[heading('방송 타임라인','함께 쌓아가는 '+name+'의 이야기'),timeline.length?E('ol',{class:'yp-timeline'},timeline):empty('곧 한 장씩 채워질 이야기',name+'의 방송과 콘텐츠 참여 기록이 이곳에 모여요.','stamp-clover.png')])
    ]);
  }
  async function news(token) {
    const items=(await S.list('news')).filter(r=>r.published!==false).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||T(b.published_at).localeCompare(T(a.published_at)));
    if(token!==epoch)return;
    const labels={NOTICE:'NOTICE',CONTENTS:'CONTENTS',EVENT:'EVENT'}, profile=S.profile();
    let results, total, tabs;
    function open(r) { U.dialog(r.title,E('article',{class:'yp-news-detail'},[E('div',{class:'yp-article-meta'},[E('span',{},labels[r.category]||'NOTICE'),E('time',{},date(r.published_at))]),textBody(r.body),gallery(r.images)])); }
    function draw() {
      const found=items.filter(r=>(state.category==='ALL'||r.category===state.category)&&match(r.title,state.query));
      total.textContent=found.length+'개의 소식'; activate(tabs,state.category);
      results.replaceChildren(...(found.length?found.map(r=>{
        const imgs=safeImages(r.images);
        const b=button([E('div',{class:'yp-news-cover'},imgs.length?image(imgs[0],T(r.title)):E('div',{class:'yp-news-letter'},[U.icon('envelope'),E('span',{},'letter from yamha')])),E('div',{class:'yp-news-copy'},[E('div',{class:'yp-news-meta'},[E('span',{class:'yp-category'},labels[r.category]||'NOTICE'),r.pinned?E('span',{class:'yp-pinned'},'고정 공지'):'',E('time',{},date(r.published_at))]),E('h2',{},T(r.title)),E('p',{},T(r.body).replace(/^#{1,3}\s*/gm,'').replace(/^-\s*/gm,'').slice(0,130)),E('span',{class:'yp-read-more'},['자세히 읽기',U.icon('arrow')])])],()=>open(r),'yp-news-item'); return b;
      }):[empty(items.length?'찾는 소식이 없어요':'새로운 소식을 기다려 주세요',items.length?'다른 검색어나 분류로 다시 찾아보세요.':T(profile.name)+'의 공지와 콘텐츠 소식을 차곡차곡 배달해 드릴게요.')]));
    }
    tabs=filters([['ALL','ALL'],['NOTICE','NOTICE'],['CONTENTS','CONTENTS'],['EVENT','EVENT']],state.category,key=>{state.category=key;draw();});
    results=E('div',{class:'yp-news-list'}); total=E('span',{class:'yp-result-count','aria-live':'polite'});
    startPage([E('div',{class:'yp-list-tools'},[tabs,search('공지 제목 검색',draw)]),total,results]); draw();
  }
  async function guide(token) {
    const rows=(await S.list('guides')).slice().sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
    if(token!==epoch)return;
    const labels={chat:'생방송 채팅 규칙',fan:'팬 활동 · 팬카페',creation:'디자인 · 2차 창작'};
    const icons={chat:'chat',fan:'heart',creation:'stamp'};
    const article=E('article',{class:'yp-guide-article',id:'guide-content',role:'tabpanel',tabindex:'0'});
    const tabs=E('div',{class:'yp-guide-tabs',role:'tablist','aria-label':'안내 종류'});
    function draw(id) {
      const row=rows.find(r=>r.id===id)||rows[0]; if(!row){article.replaceChildren(empty('안내를 준비하고 있어요','곧 내용을 정리해서 전해드릴게요.'));return;}
      state.guide=row.id;
      tabs.querySelectorAll('button').forEach(b=>{const active=b.dataset.guide===row.id;b.classList.toggle('is-active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
      article.setAttribute('aria-labelledby','guide-tab-'+row.id);
      const p=S.profile();
      article.replaceChildren(E('div',{class:'yp-guide-head'},[E('span',{class:'yp-kicker'},'TO. '+(T(p.fanName)||'YOU')),E('h2',{},row.title),E('p',{},'최신 업데이트 '+date(row.updated_at))]));
      const prose=textBody(row.body);
      if(row.id==='creation'&&safeImages(row.images).length){
        const imageLabels=['오리지널 의상 및 헤어 · 겉옷 없음','오리지널 의상 및 헤어 · 겉옷 있음','팬캐릭터 '+T(p.fanName)+' 디자인'];
        const collection=gallery(row.images,imageLabels); collection.classList.add('yp-design-gallery');
        const headings=Array.from(prose.querySelectorAll('h2,h3'));
        const firstRule=headings.find(h=>h.textContent.trim()==='금지사항');
        if(firstRule)firstRule.before(collection);else prose.prepend(collection);
      }else if(safeImages(row.images).length)prose.append(gallery(row.images));
      article.append(prose,E('div',{class:'yp-guide-ending'},[image('assets/postage-seal.png','','yp-ending-seal'),E('p',{},'함께 지켜주셔서 고마워요.'),E('span',{},'WITH LOVE, '+T(p.englishName||p.name))]));
    }
    rows.forEach((r,i)=>{
      const b=button([E('span',{class:'yp-guide-tab-number'},String(i+1).padStart(2,'0')),E('span',{},labels[r.id]||r.title),U.icon('arrow')],()=>{history.replaceState(null,'','#'+r.id);draw(r.id);},'yp-guide-tab');
      b.id='guide-tab-'+r.id;b.dataset.guide=r.id;b.setAttribute('role','tab');b.setAttribute('aria-controls','guide-content');
      b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const bs=Array.from(tabs.children);let n=i;if(e.key==='Home')n=0;else if(e.key==='End')n=bs.length-1;else n=(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+bs.length)%bs.length;bs[n].click();bs[n].focus();});
      tabs.append(b);
    });
    startPage([E('div',{class:'yp-guide-layout'},[tabs,article])]);draw(state.guide);
  }
  async function debt(token) {
    const items=await S.list('debts');if(token!==epoch)return;const fan=T(S.profile().fanName)||'팬';
    let results, total, tabs;
    const count=r=>Math.max(0,Number(r.count)||0);
    function open(nickname,rows) {
      const list=E('div',{class:'yp-debt-detail'},rows.map(r=>E('section',{class:'yp-debt-entry'},[E('div',{class:'yp-debt-entry-top'},[E('h3',{},T(r.label)),E('span',{class:'yp-status'+(r.status==='done'?' is-done':'')},r.status==='done'?'완료':'미완료')]),E('p',{class:'yp-debt-amount'},[String(count(r)),E('small',{},T(r.unit)||'개')]),r.note?textBody(r.note):'',r.updated_at?E('time',{class:'yp-muted'},'최근 변경 '+date(r.updated_at)):''])));
      U.dialog(nickname+'님의 업보',list);
    }
    function draw() {
      const found=items.filter(r=>match(r.nickname,state.query)&&(state.status==='all'||r.status===state.status));
      const groups=new Map();found.forEach(r=>{const nick=T(r.nickname)||'이름 없음';if(!groups.has(nick))groups.set(nick,[]);groups.get(nick).push(r);});
      total.textContent=groups.size+'명의 '+fan+' · '+found.length+'건';activate(tabs,state.status);
      results.replaceChildren(...(groups.size?Array.from(groups.entries()).sort((a,b)=>a[0].localeCompare(b[0],'ko')).map(([nick,rows])=>{
        const units=new Map();rows.forEach(r=>{const unit=T(r.unit)||'개';units.set(unit,(units.get(unit)||0)+count(r));});
        const sums=Array.from(units,([unit,n])=>n.toLocaleString('ko-KR')+unit).join(' · ');
        return button([E('div',{class:'yp-debt-avatar','aria-hidden':'true'},nick[0]),E('h2',{},nick),E('p',{class:'yp-debt-sum'},sums),E('p',{class:'yp-muted'},'미완료 '+rows.filter(r=>r.status!=='done').length+'건 · 완료 '+rows.filter(r=>r.status==='done').length+'건'),E('div',{class:'yp-tags'},[...new Set(rows.map(r=>T(r.label)))].slice(0,3).map(t=>E('span',{},t))),E('span',{class:'yp-read-more'},['상세 보기',U.icon('arrow')])],()=>open(nick,rows),'yp-debt-card');
      }):[empty(items.length?'검색 결과가 없어요':'아직 등록된 업보가 없어요',items.length?'닉네임이나 상태를 바꾸어 다시 찾아보세요.':fan+'과의 약속이 생기면 이곳에서 확인할 수 있어요.','stamp-clover.png')]));
    }
    tabs=filters([['all','전체'],['pending','미완료'],['done','완료']],state.status,key=>{state.status=key;draw();});
    results=E('div',{class:'yp-debt-grid'});total=E('span',{class:'yp-result-count','aria-live':'polite'});
    startPage([E('div',{class:'yp-list-tools'},[tabs,search(fan+' 닉네임 검색',draw)]),total,results]);draw();
  }
  async function store(token) {
    if(token!==epoch)return;const p=S.profile(), link=p.links&&p.links.store;
    const name=T(p.name),go=external(name+'의 스토어로 이동',link,'yp-button yp-primary');
    startPage([E('section',{class:'yp-store-letter'},[image('assets/stamp-acorn.png','','yp-store-stamp'),E('span',{class:'yp-kicker'},'A LITTLE GIFT FOR YOU'),E('h2',{},go?name+'의 마음을 담은 선물':'선물을 준비하고 있어요'),E('p',{},go?'소중한 순간을 함께 간직할 수 있는 '+name+'의 굿즈를 만나보세요.':'스토어가 열리면 이곳에서 바로 만나볼 수 있어요.'),go||E('span',{class:'yp-coming'},'COMING SOON'),E('span',{class:'yp-store-sign'},'from. '+name+' ♡')])]);
  }
  async function song(token) {
    const items=await S.list('songs');if(token!==epoch)return;const p=S.profile();let results,total,tabs;
    const genres=[...new Set(items.map(r=>T(r.genre)).filter(Boolean))];
    if(state.category!=='ALL'&&!genres.includes(state.category))state.category='ALL';
    function draw(){const found=items.filter(r=>(state.category==='ALL'||r.genre===state.category)&&(match(r.title,state.query)||match(r.artist,state.query)));activate(tabs,state.category);total.textContent=found.length+'곡';results.replaceChildren(...(found.length?found.map(r=>E('article',{class:'yp-song-row'},[E('span',{class:'yp-song-symbol'},U.icon('music')),E('div',{},[E('h2',{},T(r.title)),E('p',{class:'yp-muted'},T(r.artist)),r.memo?E('p',{class:'yp-song-memo'},T(r.memo)):'']),E('span',{class:'yp-song-genre'},T(r.genre))])):[empty(items.length?'검색한 노래가 없어요':'얌하의 노래책',items.length?'곡 제목이나 아티스트로 다시 검색해 보세요.':'현재 노래 목록은 연결된 노래책에서 확인할 수 있어요.','stamp-clover.png')]));}
    tabs=filters([['ALL','전체'],...genres.map(x=>[x,x])],state.category,x=>{state.category=x;draw();});results=E('div',{class:'yp-song-list'});total=E('span',{class:'yp-result-count','aria-live':'polite'});
    startPage([E('div',{class:'yp-song-link'},[E('div',{},[E('h2',{},'얌하의 노래를 만나보세요'),E('p',{},'K-POP부터 J-POP까지, 오늘은 어떤 노래가 좋을까요?')]),external('노래책 열기',p.links&&p.links.songbook,'yp-button yp-primary')||'']),E('div',{class:'yp-list-tools'},[tabs,search('곡 제목 또는 아티스트 검색',draw)]),total,results]);draw();
  }
  const renderers={profile,news,guide,debt,store,song};
  async function render(){const token=++epoch;try{await renderers[page](token);}catch(err){if(token!==epoch)return;root.replaceChildren(E('div',{class:'yp-page'},empty('내용을 불러오지 못했어요','잠시 후 다시 확인해 주세요.')));console.error('Yamha page load failed',err);}}
  async function boot(){S=window.YamhaSite;U=window.YamhaUI;root=document.getElementById('page-root');if(!S||!U||!root)return;await S.ready;await render();S.onChange(()=>render());if(page==='guide')window.addEventListener('hashchange',()=>{if(['chat','fan','creation'].includes(location.hash.slice(1))){state.guide=location.hash.slice(1);render();}});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
