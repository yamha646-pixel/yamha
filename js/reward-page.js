/* Viewer files and entitlement checks are served only by the authenticated backend. */
(function(){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const t=(key,vars)=>window.YamhaContent?.text(key,vars)??'';
  const text=(key,vars)=>esc(t(key,vars));
  const lines=(key,vars)=>text(key,vars).replace(/\n/g,'<br>');
  const paths={envelope:'<rect x="3" y="6" width="26" height="20" rx="3"/><path d="m4 8 12 10L28 8M4 25l9-9m15 9-9-9"/>',gift:'<path d="M5 15h22v14H5ZM3 8h26v7H3Zm13 0v21M16 8C8 9 5 5 8 2s6 1 8 6Zm0 0c8 1 11-3 8-6s-6 3-8 6Z"/>',lock:'<rect x="7" y="13" width="18" height="15" rx="3"/><path d="M11 13V8a5 5 0 0 1 10 0v5m-5 6v4"/>',search:'<circle cx="13" cy="13" r="9"/><path d="m20 20 8 8"/>',info:'<circle cx="16" cy="16" r="13"/><path d="M16 14v9m0-14v1"/>',close:'<path d="m7 7 18 18M7 25 25 7"/>'};
  const icon=name=>'<svg data-y-art="'+(['lock','info'].includes(name)?'reward.art.':'shell.art.')+name+'" viewBox="0 0 32 32" aria-hidden="true">'+paths[name]+'</svg>';
  const imageUrl=value=>window.YamhaUI?.safeUrl(value,{image:true})||'';
  function mount(container,options={}){
    if(typeof container==='string')container=document.querySelector(container);if(!container)return null;
    const auth=window.YamhaRewardAuth,preview=new URLSearchParams(location.search).get('preview')==='1';
    const state={tab:new URLSearchParams(location.search).get('tab')==='photos'?'photos':'rewards',tier:'all',query:'',tag:'all'};
    let data=options,account=auth?.state()||{user:null,loading:false,configured:false},myPhotos=[],photoStatus='idle',photoEpoch=0,lastTrigger=null,alive=true;
    const dialog=document.createElement('dialog');dialog.className='yr-dialog';dialog.setAttribute('aria-label',t('reward.dialogLabel'));document.body.append(dialog);
    function cleanImages(scope){scope.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.alt=t('reward.imageError');},{once:true}));}
    function showDialog(title,body,className,trigger){lastTrigger=trigger;dialog.className='yr-dialog '+(className||'');dialog.setAttribute('aria-label',title);dialog.innerHTML='<div class="yr-dialog-top"><span>'+esc(title)+'</span><button class="yr-dialog-close" type="button" aria-label="'+text('reward.close')+'">'+icon('close')+'</button></div><div class="yr-dialog-body">'+body+'</div>';dialog.querySelector('.yr-dialog-close').onclick=()=>dialog.close();cleanImages(dialog);if(!dialog.open)dialog.showModal();}
    dialog.addEventListener('close',()=>{if(lastTrigger?.isConnected)lastTrigger.focus();});
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
    const notice=key=>window.YamhaUI?.toast(t(key));
    function previewImage(key){const raw=window.YamhaContent?.image(key)??'';return raw?imageUrl(window.YamhaSite?.url(raw)||raw):'';}
    function rewards(){
      let rows=typeof data.getRewards==='function'?data.getRewards():data.rewards;rows=Array.isArray(rows)?rows.filter(r=>r&&r.published!==false):[];
      if(preview&&!rows.length)rows=[1,2,3,4].map((n,i)=>({id:'preview-'+n,title:t('rewardPreview.reward'+n+'.title'),description:t('rewardPreview.reward'+n+'.description'),preview_url:previewImage('rewardPreview.reward'+n+'.image'),tier:i<2?1:2,required_months:[1,3,1,6][i],sample:true}));
      return rows.map((r,i)=>({...r,id:String(r.id??i),title:r.title??t('reward.defaultTitle'),description:r.description??'',tier:Number(r.tier)===2?2:1,required_months:Math.max(1,parseInt(r.required_months,10)||1),preview_url:imageUrl(r.preview_url||r.image_url||''),sort_order:Number(r.sort_order)||i})).sort((a,b)=>a.sort_order-b.sort_order);
    }
    function photos(){
      if(!preview)return myPhotos;let rows=typeof data.getPhotos==='function'?data.getPhotos():data.photos;rows=Array.isArray(rows)?rows:[];
      if(!rows.length)rows=[1,2,3,4,5].map(n=>({id:'preview-photo-'+n,title:t('rewardPreview.photo'+n+'.title'),tags:t('rewardPreview.photo'+n+'.tags').split(','),preview_url:previewImage('rewardPreview.photo'+n+'.image')}));
      return rows.map((r,i)=>({...r,id:String(r.id??i),title:r.title??t('reward.defaultPhotoTitle'),tags:[...new Set((Array.isArray(r.tags)?r.tags:String(r.tags||'').split(/[,#\n]/)).map(x=>String(x).replace(/^#+/,'').trim()).filter(Boolean))],preview_url:imageUrl(r.preview_url||r.image_url||'')}));
    }
    const loginButton=()=>'<button class="yr-login" type="button" data-yr-login>'+icon('lock')+text('reward.authLogin')+'</button>';
    function bindLogin(scope){scope.querySelectorAll('[data-yr-login]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{if(!auth)throw new Error();await auth.login();}catch(error){notice(error.code==='setup_required'||!auth?'reward.authSetup':'reward.authError');}finally{b.disabled=false;}});}
    const empty=(title,body,locked=false)=>'<div class="yr-empty'+(locked?' yr-locked':'')+'"><div class="yr-letter-illustration" aria-hidden="true">'+icon('envelope')+'</div><h3>'+text(title)+'</h3><p>'+lines(body)+'</p>'+(locked?loginButton():'')+'</div>';
    function eligible(row){const s=account.subscription;return !preview&&!!account.user&&s?.status==='subscribed'&&s.tier>=row.tier&&s.months>=row.required_months;}
    async function openFile(collection,row,trigger,displayImage){
      if(!auth)return notice('reward.authSetup');trigger.disabled=true;const original=trigger.innerHTML;trigger.textContent=t('reward.downloading');
      try{const url=await auth.download(collection,row.id);if(!alive)return;
        if(displayImage)showDialog(t('reward.privatePhotoDialog'),'<img src="'+esc(url)+'" alt="'+esc(row.title)+'"><div class="yr-image-caption">'+esc(row.title)+'</div><a class="yr-detail-button" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" download>'+text('reward.download')+'</a>','yr-image-dialog',trigger);
        else{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.download='';a.click();}
      }catch(error){if(error.code!=='session_changed')notice(error.code==='file_not_ready'?'reward.filePending':'reward.downloadError');}
      finally{if(trigger.isConnected){trigger.disabled=false;trigger.innerHTML=original;}}
    }
    function renderRewards(){
      const rows=rewards().filter(r=>state.tier==='all'||String(r.tier)===state.tier),list=container.querySelector('[data-yr-list]');container.querySelector('[data-yr-count]').textContent=t('reward.count',{count:rows.length});
      if(!rows.length){list.className='';list.innerHTML=empty('reward.emptyTitle','reward.emptyBody');return;}
      list.className='yr-card-grid';list.innerHTML=rows.map((r,i)=>'<article class="yr-reward-card"><div class="yr-preview-image">'+(r.preview_url?'<img src="'+esc(r.preview_url)+'" alt="'+text('reward.imageAlt',{title:r.title})+'" loading="lazy">':icon('envelope'))+'<span class="yr-card-tier'+(r.tier===2?' is-two':'')+'">'+text('reward.tierBadge',{tier:r.tier})+'</span></div><div class="yr-card-body"><div class="yr-card-number"><strong>'+String(r.required_months).padStart(2,'0')+'</strong><span>'+text('reward.monthUnit')+'</span></div><h3>'+esc(r.title)+'</h3><p class="yr-card-description">'+esc(r.description||t('reward.defaultDescription'))+'</p><button class="yr-detail-button" data-yr-detail="'+i+'" type="button">'+text('reward.detailButton')+'</button>'+(r.sample?'<span class="yr-sample-tag">'+text('reward.sampleBadge')+'</span>':'')+'</div></article>').join('');cleanImages(list);
      list.querySelectorAll('[data-yr-detail]').forEach(b=>b.onclick=()=>{
        const r=rows[Number(b.dataset.yrDetail)],can=eligible(r)&&!!r.private_asset_path;let bottom;
        if(r.sample)bottom='<strong>'+text('reward.sampleWarningTitle')+'</strong><br>'+text('reward.sampleWarningBody');
        else if(!account.user)bottom=text('reward.loginRequired')+loginButton();
        else if(account.subscription?.status==='unavailable')bottom=text('reward.subscriptionUnavailable');
        else if(!eligible(r))bottom=text('reward.claimLocked');else if(!r.private_asset_path)bottom=text('reward.filePending');
        else bottom='<button type="button" class="yr-detail-button" data-yr-download>'+text('reward.download')+'</button>';
        showDialog(t('reward.toFan'),(r.preview_url?'<img src="'+esc(r.preview_url)+'" alt="'+esc(r.title)+'">':'')+'<h2>'+esc(r.title)+'</h2><div class="yr-dialog-facts"><span>'+text('reward.tierDetail',{tier:r.tier})+'</span><span>'+text('reward.monthDetail',{months:r.required_months})+'</span></div><p class="yr-dialog-description">'+esc(r.description||t('reward.detailEmpty'))+'</p><div class="yr-dialog-bottom">'+bottom+'</div>','',b);bindLogin(dialog);if(can)dialog.querySelector('[data-yr-download]').onclick=e=>openFile('rewards',r,e.currentTarget,false);
      });
    }
    function renderPhotos(){
      const needle=state.query.trim().toLocaleLowerCase('ko-KR').replace(/^#/,''),rows=photos().filter(r=>(state.tag==='all'||r.tags.includes(state.tag))&&(!needle||[r.title,...r.tags].join(' ').toLocaleLowerCase('ko-KR').includes(needle))),list=container.querySelector('[data-yr-list]');
      container.querySelector('[data-yr-count]').textContent=t(preview?'reward.photoCount':'reward.myPhotoCount',{count:rows.length});
      list.innerHTML=rows.length?rows.map((r,i)=>'<article class="yr-photo-card"><button class="yr-photo-open" data-yr-photo="'+i+'" type="button" aria-label="'+text('reward.photoOpen',{title:r.title})+'">'+(r.preview_url?'<img src="'+esc(r.preview_url)+'" alt="'+esc(r.title)+'" loading="lazy">':'<span>'+icon('envelope')+text(r.available?'reward.photoOpen':'reward.photoPending',{title:r.title})+'</span>')+'</button><h3>'+esc(r.title)+'</h3><p class="yr-photo-tags">'+r.tags.map(x=>'<span>#'+esc(x)+'</span>').join('')+'</p>'+(preview?'<span class="yr-sample-tag">'+text('reward.sampleBadge')+'</span>':'')+'</article>').join(''):'<p class="yr-empty-search">'+lines('reward.searchEmpty')+'</p>';cleanImages(list);
      list.querySelectorAll('[data-yr-photo]').forEach(b=>b.onclick=()=>{const r=rows[Number(b.dataset.yrPhoto)];if(!preview){if(!r.available)return notice('reward.filePending');return openFile('photos',r,b,true);}showDialog(t('reward.photoDialog'),(r.preview_url?'<img src="'+esc(r.preview_url)+'" alt="'+esc(r.title)+'">':'')+'<div class="yr-image-caption">'+esc(r.title)+'<span>'+text('reward.photoDisclaimer')+'</span></div>','yr-image-dialog',b);});
    }
    function renderPanel(){
      const panel=container.querySelector('[data-yr-panel]');if(!panel)return;
      container.querySelectorAll('[data-yr-tab]').forEach(b=>{const selected=b.dataset.yrTab===state.tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});panel.setAttribute('aria-labelledby','yr-tab-'+state.tab);
      if(state.tab==='rewards'){
        panel.innerHTML='<div class="yr-toolbar"><div class="yr-tier-filter" aria-label="'+text('reward.tierFilter')+'">'+[['all','reward.all'],['1','reward.tier1'],['2','reward.tier2']].map(([v,key])=>'<button type="button" data-yr-tier="'+v+'" aria-pressed="'+(state.tier===v)+'">'+text(key)+'</button>').join('')+'</div><span class="yr-count" data-yr-count aria-live="polite"></span></div><div data-yr-list></div><div class="yr-information">'+icon('info')+'<p>'+lines('reward.conditions')+'</p></div>';panel.querySelectorAll('[data-yr-tier]').forEach(b=>b.onclick=()=>{state.tier=b.dataset.yrTier;renderPanel();});renderRewards();return;
      }
      if(!preview&&!account.user){panel.innerHTML=empty('reward.lockedTitle','reward.lockedBody',true);bindLogin(panel);return;}
      if(!preview&&photoStatus==='loading'){panel.innerHTML=empty('reward.photosLoading','reward.myPhotosNote');return;}
      if(!preview&&photoStatus==='error'){panel.innerHTML=empty('reward.photosError','reward.myPhotosNote');return;}
      if(!preview&&!myPhotos.length){panel.innerHTML=empty('reward.myPhotosEmpty','reward.myPhotosBody');return;}
      const tags=['all',...new Set(photos().flatMap(r=>r.tags))];if(!tags.includes(state.tag))state.tag='all';
      panel.innerHTML='<div class="yr-toolbar"><label class="yr-photo-search">'+icon('search')+'<span class="sr-only">'+text('reward.searchLabel')+'</span><input type="search" value="'+esc(state.query)+'" data-yr-search placeholder="'+text('reward.searchPlaceholder')+'" autocomplete="off"></label><span class="yr-count" data-yr-count aria-live="polite"></span></div><div class="yr-tag-filter" aria-label="'+text('reward.tagFilter')+'">'+tags.map(tag=>'<button type="button" data-yr-tag="'+esc(tag)+'" aria-pressed="'+(state.tag===tag)+'">'+(tag==='all'?text('reward.all'):'#'+esc(tag))+'</button>').join('')+'</div><div class="yr-card-grid" data-yr-list></div><div class="yr-information">'+icon('info')+'<p>'+lines(preview?'reward.previewPhotosNote':'reward.myPhotosNote')+'</p></div>';
      panel.querySelector('[data-yr-search]').oninput=e=>{state.query=e.target.value;renderPhotos();};panel.querySelectorAll('[data-yr-tag]').forEach(b=>b.onclick=()=>{state.tag=b.dataset.yrTag;renderPanel();});renderPhotos();
    }
    async function showReceipts(trigger){try{const rows=await auth.receipts();if(!alive)return;showDialog(t('reward.receiptTitle'),rows.length?rows.map(r=>'<article><h3>'+esc(r.title)+'</h3><p>'+text('reward.receiptDate',{date:new Date(r.received_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})})+'</p></article>').join(''):'<p>'+text('reward.receiptEmpty')+'</p>','',trigger);}catch{notice('reward.receiptError');}}
    function renderAccount(){
      const box=container.querySelector('[data-yr-auth]');if(!box)return;if(account.loading){box.innerHTML='<p role="status">'+text('reward.authLoading')+'</p>';return;}
      if(!account.user){box.innerHTML=loginButton()+'<p class="yr-pass-foot" role="status">'+text(!account.configured?'reward.authSetup':account.error?'reward.authError':'reward.loginRequired')+'</p>';bindLogin(box);return;}
      const sub=account.subscription;
      box.innerHTML='<strong>'+text('reward.authLoggedIn',{nickname:account.user.name})+'</strong><p class="yr-pass-foot">'+(sub?.status==='subscribed'?text('reward.subscriptionInfo',{tier:sub.tier,months:sub.months}):text(sub?.status==='none'?'reward.subscriptionNone':'reward.subscriptionUnavailable'))+'</p><button type="button" class="yr-detail-button" data-yr-refresh>'+text('reward.authRefresh')+'</button><button type="button" class="yr-detail-button" data-yr-receipts>'+text('reward.receiptButton')+'</button><button type="button" class="yr-detail-button" data-yr-logout>'+text('reward.authLogout')+'</button>';
      box.querySelector('[data-yr-refresh]').onclick=()=>auth.refresh();box.querySelector('[data-yr-receipts]').onclick=e=>showReceipts(e.currentTarget);box.querySelector('[data-yr-logout]').onclick=async()=>{++photoEpoch;myPhotos=[];dialog.close();renderPanel();try{await auth.logout();}catch{notice('reward.authError');}};
    }
    function renderShell(){
    const cssString=value=>'"'+String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\a ').replace(/\r/g,'')+'"';
    container.style.setProperty('--reward-spark',cssString(t('reward.sparkSymbol')));
    container.style.setProperty('--reward-letter-heart',cssString(t('reward.letterHeart')));
    container.innerHTML='<section class="yr" aria-labelledby="yr-title"><header class="yr-heading"><div><p class="yr-kicker">'+text('reward.kicker')+'</p><h1 id="yr-title">'+text('reward.heading')+'</h1><p class="yr-lede">'+text('reward.intro')+'</p></div><div class="yr-stamp" aria-hidden="true"><span>'+icon('envelope')+'</span></div></header>'+(preview?'<div class="yr-preview-note"><strong>'+text('reward.sampleBadge')+'</strong><span>'+text('reward.previewNote')+'</span></div>':'')+'<div class="yr-layout"><aside><div class="yr-pass"><div class="yr-pass-postmark">'+text('reward.postmark')+'</div><div class="yr-pass-avatar" aria-hidden="true">'+icon('envelope')+'</div><h2>'+text('reward.passTitle')+'</h2><p>'+lines('reward.passBody')+'</p><div data-yr-auth></div></div><p class="yr-aside-note"><span>'+text('reward.asideSymbol')+'</span>'+lines('reward.asideNote')+'</p></aside><div class="yr-content"><div class="yr-tabs" role="tablist" aria-label="'+text('reward.tabsLabel')+'"><button class="yr-tab" id="yr-tab-rewards" data-yr-tab="rewards" type="button" role="tab" aria-controls="yr-panel">'+icon('gift')+text('reward.tabRewards')+'</button><button class="yr-tab" id="yr-tab-photos" data-yr-tab="photos" type="button" role="tab" aria-controls="yr-panel">'+icon('envelope')+text('reward.tabPhotos')+'</button></div><div id="yr-panel" data-yr-panel role="tabpanel"></div></div></div></section>';
    container.querySelectorAll('[data-yr-tab]').forEach(b=>{b.onclick=()=>{state.tab=b.dataset.yrTab;renderPanel();};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();state.tab=e.key==='Home'?'rewards':e.key==='End'?'photos':state.tab==='rewards'?'photos':'rewards';renderPanel();container.querySelector('[data-yr-tab="'+state.tab+'"]').focus();};});
    window.YamhaContent?.apply(container);
    }
    renderShell();
    const unsubscribe=auth?.onChange(next=>{
      if(!alive)return;const changed=account.user?.channelId!==next.user?.channelId;account=next;if(changed||!next.user){++photoEpoch;myPhotos=[];dialog.close();}renderAccount();renderPanel();
      if(next.user&&!next.loading&&!preview){const turn=++photoEpoch;photoStatus='loading';renderPanel();auth.photos().then(rows=>{if(alive&&turn===photoEpoch){myPhotos=rows;photoStatus='ready';renderPanel();}}).catch(()=>{if(alive&&turn===photoEpoch){myPhotos=[];photoStatus='error';renderPanel();}});}
    });
    renderAccount();renderPanel();auth?.refresh();
    const result=new URLSearchParams(location.search).get('auth');if(['cancelled','expired','failed'].includes(result))notice({cancelled:'reward.authCancelled',expired:'reward.authExpired',failed:'reward.authFailed'}[result]);
    return{update(next){if(next)data={...data,...next};dialog.close();renderShell();renderAccount();renderPanel();},destroy(){alive=false;++photoEpoch;unsubscribe?.();dialog.remove();container.innerHTML='';},selectTab(tab){if(['photos','rewards'].includes(tab)){state.tab=tab;renderPanel();}}};
  }
  window.YAMHAReward={mount};
})();
