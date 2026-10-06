/* Server-backed editing. YamhaSite verifies identity; database policies enforce access. */
(function () {
  'use strict';
  if (document.body.dataset.page !== 'admin') return;
  const collections = ['schedule', 'news', 'rewards', 'photos', 'debts', 'guides', 'timeline', 'songs'];
  const tabNames = {common:'공통', home:'메인', profile:'프로필', schedule:'일정', news:'공지', store:'STORE', reward:'REWARD', debt:'보상', guide:'안내'};
  const pageCollections = {profile:['timeline'],schedule:['schedule'],news:['news'],reward:['rewards','photos'],debt:['debts'],guide:['guides']};
  const pagePaths = {common:'index.html',home:'index.html',profile:'profile/index.html',schedule:'schedule/index.html',news:'news/index.html',store:'store/index.html',reward:'reward/index.html',debt:'debt/index.html',guide:'guide/index.html'};
  const pageHelp = {
    common:'모든 페이지에서 함께 쓰는 이름, 왼쪽 프로필 사진, 채널 주소를 바꿉니다.',
    home:'메인에 보이는 소개와 사진을 바꿉니다. 사진 아래 문구와 장식은 아래의 세부 편집에서 바꿀 수 있습니다.',
    profile:'프로필의 정보, 소개, 취향을 바꿉니다. 이름·팬 이름·방송 시간은 메인에도 함께 반영됩니다.',
    schedule:'달력 날짜를 누르면 새 일정, 등록된 일정 막대를 누르면 수정 화면이 열립니다.',
    news:'공지를 등록하거나 기존 글을 수정합니다. 공지·콘텐츠·이벤트·GOODS 분류를 선택할 수 있습니다.',
    store:'스토어 버튼을 눌렀을 때 열릴 주소를 바꿉니다. 나중에 다른 스토어로 옮겨도 여기서 수정하면 됩니다.',
    reward:'구독 리워드와 개인 사진을 등록합니다. 리워드별로 구독 티어와 필요한 개월 수를 정할 수 있습니다.',
    debt:'닉네임별 보상 이름, 남은 수량과 완료 상태를 관리합니다.',
    guide:'방송 채팅·팬카페·2차 창작 안내 3종의 본문과 사진을 수정합니다.'
  };
  // The source GROUPS cards state where a value appears before showing inputs.
  const collectionGroups = {
    news:[['공지 내용','나오는 곳 — 공지 목록의 제목과, 글을 눌렀을 때 나오는 본문입니다.',['title','body','images']],['분류·공개 설정','GOODS를 선택하면 GOODS 탭에 표시됩니다. 공개를 끄면 방문자 목록에서 숨겨집니다.',['category','published_at','pinned','published']]],
    rewards:[['리워드 내용','나오는 곳 — REWARD의 구독 리워드 목록과 상세 안내입니다.',['title','description']],['수령 조건','예: 3개월로 설정하면 해당 티어·개월 수 이상인 구독자가 원본을 받을 수 있습니다. 미리보기는 공개됩니다.',['tier','required_months']],['미리보기·원본','미리보기에는 공개해도 되는 사진을 넣고, 실제 제공할 이미지·ZIP·APK는 첨부파일로 업로드하세요.',['preview_url','private_asset_path','private_asset_name','private_asset_size','private_asset_mime']],['공개·정렬','표시 순서는 작은 숫자가 먼저입니다. 공개를 끄면 리워드 목록에서 숨겨집니다.',['sort_order','published']]],
    photos:[['사진 정보','나오는 곳 — 받는 분이 로그인한 뒤 보는 사진 보관함입니다. 제목과 태그로 찾을 수 있습니다.',['title','tags','published_at']],['받는 분·첨부파일','받는 분의 치지직 채널 ID를 확인한 뒤 원본을 업로드합니다. 닉네임으로는 소유자를 지정할 수 없습니다.',['recipient_channel_id','preview_url','private_asset_path','private_asset_name','private_asset_size','private_asset_mime']]],
    guides:[['안내 종류·제목','나오는 곳 — 안내 페이지의 3개 버튼입니다. 기존 안내의 종류는 바꾸지 않고 제목과 본문을 수정합니다.',['id','title','sort_order']],['안내 본문·사진','본문의 ## 제목과 줄바꿈이 반영됩니다. 2차 창작 사진은 아래에 적힌 순서를 유지해 주세요.',['body','images']]],
    schedule:[['1부·기간','나오는 곳 — 메인과 일정 페이지의 달력입니다. 하루 일정은 종료 날짜를 비워 둡니다.',['date','end_date','title','time','type','color','highlight']],['2부·메모','2부가 없으면 2부 유형을 ‘2부 없음’으로 둡니다. 설명은 일정 상세에서 확인할 수 있습니다.',['title2','time2','type2','color2','description']]]
  };
  const colors = ['pink', 'green', 'lime', 'blue', 'yellow', 'orange', 'purple', 'red', 'gray', 'cream'];
  const attachmentMetaFields=()=>[
    {key:'private_asset_name',type:'hidden',label:'첨부파일 이름'},
    {key:'private_asset_size',type:'hidden',number:true,label:'첨부파일 크기'},
    {key:'private_asset_mime',type:'hidden',label:'첨부파일 형식'}
  ];
  const privateAssetPattern=/^private\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|gif|webp|zip|apk)$/;
  const configs = {
    schedule: {
      singular:'일정', description:'날짜를 눌러 등록하고, 일정 막대를 눌러 같은 일정을 수정해요. 기간은 마지막 날까지 포함됩니다.',
      defaults:() => ({date:window.YamhaCalendar.todayKST(), end_date:null, type:'방송', color:'pink', type2:'', color2:'green', highlight:false}),
      fields:[
        {key:'date', label:'시작 날짜', type:'date', required:true}, {key:'end_date', label:'종료 날짜', type:'date', hint:'하루 일정이면 비워 두세요.'},
        {key:'title', label:'1부 제목', required:true, wide:true}, {key:'time', label:'1부 시간', placeholder:'예: 10:00 / 오전 10시'},
        {key:'type', label:'1부 유형', type:'select', options:['방송','휴방']}, {key:'color', label:'1부 색상', type:'colorname'},
        {key:'highlight', label:'중요 일정으로 강조', type:'checkbox'}, {key:'title2', label:'2부 제목', wide:true},
        {key:'time2', label:'2부 시간', placeholder:'예: 14:00'}, {key:'type2', label:'2부 유형', type:'select', options:[['','2부 없음'],['방송','방송'],['휴방','휴방']]},
        {key:'color2', label:'2부 색상', type:'colorname'}, {key:'description', label:'일정 설명', type:'textarea', wide:true}
      ],
      title:row => row.title || row.type || '일정', meta:row => [row.date + (row.end_date ? ' ~ ' + row.end_date : ''), row.time, row.type].filter(Boolean).join(' · ')
    },
    news: {
      singular:'공지', description:'상단 고정과 공개 여부를 정하고, 이미지 주소를 여러 개 추가할 수 있어요.',
      defaults:() => ({category:'NOTICE', images:[], pinned:false, published:true, published_at:new Date().toISOString()}),
      fields:[{key:'title',label:'공지 제목',required:true,wide:true}, {key:'category',label:'분류',type:'select',options:[['NOTICE','공지'],['CONTENTS','콘텐츠'],['EVENT','이벤트'],['GOODS','GOODS']]},
        {key:'published_at',label:'표시 날짜 · 한국 시간',type:'datetime-local',required:true}, {key:'body',label:'공지 내용',type:'textarea',required:true,wide:true,rows:8},
        {key:'images',label:'이미지 주소',type:'images',wide:true,hint:'한 줄에 이미지 주소 하나씩 입력해 주세요.'},
        {key:'pinned',label:'상단에 고정',type:'checkbox'}, {key:'published',label:'공개 목록에 표시',type:'checkbox'}],
      title:row=>row.title, meta:row=>[({NOTICE:'공지',CONTENTS:'콘텐츠',EVENT:'이벤트',GOODS:'GOODS'})[row.category]||row.category, row.pinned?'상단 고정':'',row.published===false?'비공개':'공개',displayDate(row.published_at)].filter(Boolean).join(' · ')
    },
    rewards: {
      singular:'리워드', description:'1티어·2티어 혜택과 필요한 구독 개월 수를 편집해요.',
      defaults:() => ({tier:1,required_months:1,sort_order:0,published:true}),
      fields:[{key:'title',label:'리워드 이름',required:true,wide:true}, {key:'tier',label:'구독 티어',type:'select',number:true,options:[['1','1티어'],['2','2티어']]},
        {key:'required_months',label:'필요 구독 개월 수',type:'number',min:1,required:true}, {key:'description',label:'혜택 설명',type:'textarea',wide:true,required:true},
        {key:'preview_url',label:'미리보기 이미지 주소',type:'image',wide:true},
        {key:'private_asset_path',label:'구독 리워드 첨부파일',type:'private',wide:true,hint:'이미지(PNG·JPG·WebP·GIF), ZIP, APK · 최대 15MiB. 업로드 후 아래 저장을 눌러야 반영됩니다.'},...attachmentMetaFields(),
        {key:'sort_order',label:'표시 순서',type:'number',min:0,hint:'작은 숫자부터 표시돼요.'},
        {key:'published',label:'공개 목록에 표시',type:'checkbox'}],
      title:row=>row.title, meta:row=>`${row.tier}티어 · ${row.required_months}개월 · ${row.published===false?'비공개':'공개'}`
    },
    photos: {
      singular:'사진', description:'받는 분의 치지직 채널 ID와 비공개 원본, 제목·태그를 지정해요.',
      defaults:()=>({tags:[],published_at:new Date().toISOString()}),
      fields:[{key:'title',label:'사진 제목',required:true,wide:true}, {key:'tags',label:'태그',type:'tags',wide:true,hint:'쉼표 또는 줄바꿈으로 구분해 주세요.'},
        {key:'preview_url',label:'공개 미리보기 이미지 주소',type:'image',wide:true},
        {key:'private_asset_path',label:'개인 첨부파일',type:'private',wide:true,hint:'이미지(PNG·JPG·WebP·GIF), ZIP, APK · 최대 15MiB. 지정한 받는 분만 다운로드할 수 있습니다.'},...attachmentMetaFields(),
        {key:'recipient_channel_id',label:'받는 분의 치지직 채널 ID',required:true,pattern:'[a-fA-F0-9]{32}',hint:'닉네임이 아닌 32자리 채널 ID를 입력해 주세요.'},
        {key:'published_at',label:'표시 날짜 · 한국 시간',type:'datetime-local',required:true}],
      title:row=>row.title, meta:row=>[displayDate(row.published_at), ...(Array.isArray(row.tags)?row.tags:[])].filter(Boolean).join(' · ')
    },
    debts: {
      singular:'보상', description:'닉네임별 약속과 남은 수량을 적고, 완료 상태를 관리해요.',
      defaults:()=>({count:1,unit:'회',status:'pending',updated_at:new Date().toISOString()}),
      fields:[{key:'nickname',label:'닉네임',required:true}, {key:'label',label:'보상 이름',required:true}, {key:'count',label:'남은 수량',type:'number',min:0,required:true},
        {key:'unit',label:'단위',required:true,placeholder:'회 / 개 / 분'}, {key:'status',label:'상태',type:'select',options:[['pending','진행 중'],['done','완료']]},
        {key:'note',label:'메모',type:'textarea',wide:true}],
      title:row=>`${row.nickname || ''} · ${row.label || ''}`, meta:row=>`${row.count} ${row.unit || ''} · ${row.status==='done'?'완료':'진행 중'}`
    },
    timeline: {
      singular:'타임라인', description:'방송과 콘텐츠 참여 기록을 프로필의 타임라인에 남겨요.',
      defaults:()=>({date:window.YamhaCalendar.todayKST()}),
      fields:[{key:'date',label:'기록 날짜',type:'date',required:true},{key:'title',label:'기록 제목',required:true,wide:true},
        {key:'body',label:'기록 내용',type:'textarea',wide:true},{key:'image',label:'기록 이미지 주소',type:'image',wide:true}],
      title:row=>row.title, meta:row=>row.date || ''
    },
    guides: {
      singular:'안내', description:'방송 채팅·팬카페·2차 창작 안내의 문구와 이미지를 편집해요.',
      defaults:()=>({id:'chat',images:[],sort_order:0,updated_at:new Date().toISOString()}),
      fields:[{key:'id',label:'안내 종류',type:'select',options:[['chat','방송 채팅'],['fan','팬카페'],['creation','2차 창작']],required:true},
        {key:'sort_order',label:'표시 순서',type:'number',min:0}, {key:'title',label:'안내 제목',required:true,wide:true},
        {key:'body',label:'안내 내용',type:'textarea',required:true,wide:true,rows:12},
        {key:'images',label:'안내 이미지 주소',type:'images',wide:true,preserveDesignSlots:true,hint:'한 줄에 이미지 주소 하나씩 입력해 주세요. 2차 창작 안내는 1행: 겉옷 없음, 2행: 겉옷 있음, 3행: 마냥단 디자인 순서예요. 숨길 사진은 해당 행을 빈 줄로 남겨 주세요.'}],
      title:row=>row.title, meta:row=>[({chat:'방송 채팅',fan:'팬카페',creation:'2차 창작'})[row.id]||row.id,displayDate(row.updated_at)].join(' · ')
    }
  };
  let S, UI, C, host, pane, status, tabBar, backupPanel, collectionHost;
  let active = 'home', activeCollection='', editor = null, calendar = null, currentRows = [], operation = false, loadVersion = 0;
  const editors=new Set();
  const cardEditors=new WeakMap();
  let authVersion=0, backupVersion=0, unlocked=false, identity='', activating=false, signingOut=false;
  const broadcasterCallbackMessages={
    connected:'치지직 인증에서 돌아왔습니다. 아래 서버 연결 상태를 확인해 주세요.',
    failed:'방송인 연결을 완료하지 못했습니다. 아래 상태를 확인한 뒤 다시 연결해 주세요.',
    wrong_broadcaster:'얌하 방송 계정이 아닌 계정으로 인증했습니다. 치지직에서 얌하 계정으로 로그인한 뒤 다시 연결해 주세요.',
    cancelled:'방송인 연결을 취소했습니다. 필요한 경우 다시 연결해 주세요.',
    expired:'연결 확인 시간이 지났습니다. 다시 연결해 주세요.',
    subscription_permission_required:'구독 조회 권한이 확인되지 않았습니다. 치지직 애플리케이션의 권한을 확인한 뒤 다시 연결해 주세요.',
    storage_unavailable:'연결 정보를 저장하거나 확인하지 못했습니다. 서버 연결 설정을 확인해 주세요.',
    chzzk_unavailable:'치지직에서 연결 정보를 확인하지 못했습니다. 아래 상태를 확인한 뒤 다시 시도해 주세요.',
    connection_save_failed:'치지직 인증 후 연결 정보 저장을 확인하지 못했습니다. 아래 상태를 확인한 뒤 다시 연결해 주세요.',
    broadcaster_reconnect_required:'저장된 방송인 연결을 다시 인증해야 합니다. 얌하 계정으로 다시 연결해 주세요.',
    subscription_retry:'연결 정보를 갱신 중입니다. 잠시 후 연결 상태를 다시 확인해 주세요.',
    setup_required:'치지직 연결 설정이 완료되지 않았습니다. 서버 설정을 확인해 주세요.'
  };
  let connectionCallback='',connectionCallbackPending=false,connectionView=null,connectionVersion=0;
  let connectionState={status:'idle'},connectionProblem='';
  const E = (tag, cls, text) => { const node=document.createElement(tag); if(cls)node.className=cls; if(text!==undefined)node.textContent=text; return node; };
  const button = (label, cls, handler) => { const node=E('button',cls,label);node.type='button';if(handler)node.addEventListener('click',handler);return node; };
  const get = (object,path) => path.split('.').reduce((value,key)=>value==null?undefined:value[key],object);
  const lines = value => String(value || '').split(/\r?\n/).map(part=>part.trim()).filter(Boolean);
  const unique = value => [...new Set(value)];
  const displayDate = value => value ? String(value).slice(0,10) : '';
  function localDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Date(date.getTime()+9*3600000).toISOString().slice(0,16);
  }
  function formSnapshot(form) {
    return JSON.stringify([...form.elements].filter(node=>node.name).map(node=>[node.name,node.type==='checkbox'?node.checked:node.value,node.dataset.reset || '']));
  }
  function liveEditors() { return [...editors].filter(state=>state.form.isConnected); }
  function dirty() { return liveEditors().some(state=>state.initial!==formSnapshot(state.form)); }
  function saving() { return liveEditors().some(state=>state.busy); }
  function sessionCurrent(version) { return version===authVersion && unlocked && S.isAdmin(); }
  function requireAccess() {
    if(unlocked && S.isAdmin())return true;
    if(unlocked)lock(S.authState()?.error || '관리자 권한을 다시 확인해 주세요.');
    return false;
  }
  function updateStatus() {
    if(status) status.textContent = operation || saving() ? '저장 결과를 확인하고 있어요…' : dirty() ? '● 저장하지 않은 변경이 있어요' : '서버에 저장된 내용을 편집 중이에요';
    status?.classList.toggle('adm-status-dirty',dirty());
  }
  function canLeave(states) {
    if(!requireAccess())return false;
    if(operation || saving()) { UI.toast('저장 결과를 확인한 뒤 다시 눌러 주세요.'); return false; }
    const changed=states?states.filter(Boolean).some(state=>state.form.isConnected&&state.initial!==formSnapshot(state.form)):dirty();
    return !changed || window.confirm('저장하지 않은 변경이 있어요. 변경을 버리고 이동할까요?');
  }
  function safeURL(value,image) { return value ? UI.safeUrl(String(value).trim(),{image:!!image}) : null; }
  function resolveImage(value) { return safeURL(value,true); }
  function revealField(node) {
    for(let parent=node;parent&&parent!==pane;parent=parent.parentElement){
      if(parent.hidden)parent.hidden=false;
      if(parent.tagName==='DETAILS')parent.open=true;
    }
  }
  function markError(message, node, state) {
    state=state || liveEditors().find(item=>node && item.form.contains(node)) || editor;
    if(state) { state.error.textContent=message;state.error.hidden=false; }
    if(node){revealField(node);const target=node.type==='hidden'?node.closest('.adm-field')?.querySelector('button'):node;target?.focus();}
  }
  function errorText(error) {
    return error?.message || S.storageError() || '서버에 저장하지 못했어요. 입력 내용은 그대로 남겨 두었어요. 연결 상태와 관리자 권한을 확인해 주세요.';
  }

  function addPreview(input, wrap, multiple) {
    const preview=E('div','adm-preview'); wrap.append(preview);
    let timer;
    function paint() {
      preview.replaceChildren();
      const values=multiple?lines(input.value):[input.value.trim()].filter(Boolean);
      values.slice(0,12).forEach(raw=>{
        const url=resolveImage(raw), tile=E('div','adm-preview-tile');
        if(!url)tile.append(E('span','adm-preview-error','이미지 주소를 확인해 주세요.'));
        else {
          const img=E('img');img.alt='입력한 이미지 미리보기';img.loading='lazy';img.referrerPolicy='no-referrer';
          img.addEventListener('error',()=>{img.remove();tile.append(E('span','adm-preview-error','이미지를 불러올 수 없어요.'));},{once:true});
          img.src=url;tile.append(img);
        }
        preview.append(tile);
      });
      if(values.length>12)preview.append(E('p','adm-field-hint','첫 12장의 미리보기를 표시해요. 입력한 주소는 모두 저장됩니다.'));
    }
    input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(paint,250);}); paint();
  }

  function addField(form, target, spec, value, locked) {
    if(spec.type==='hidden'){
      const input=E('input');input.type='hidden';input.name=spec.key;input.value=value==null?'':String(value);target.append(input);return input;
    }
    const wrapper=E('div','adm-field'+(spec.wide?' adm-field-wide':'')+(spec.type==='checkbox'?' adm-field-check':'')+(spec.key==='links.store'?' adm-field-store':''));
    const id='adm-'+active+'-'+spec.key.replace(/\./g,'-');
    const label=E('label','adm-label',spec.label+(spec.required?' *':'')); label.htmlFor=id;
    let input;
    if(['textarea','images','tags'].includes(spec.type)) { input=E('textarea','adm-input');input.rows=spec.rows || (spec.type==='textarea'?4:3); }
    else if(spec.type==='select') {
      input=E('select','adm-input');
      const choices=spec.options.map(option=>Array.isArray(option)?option:[option,option]);
      const stringValue=value==null?'':String(value);
      if(stringValue && !choices.some(option=>option[0]===stringValue))choices.push([stringValue,stringValue+' (기존 값)']);
      choices.forEach(([val,text])=>{const option=E('option','',text);option.value=val;input.append(option);});
    } else { input=E('input','adm-input');input.type=spec.type==='checkbox'?'checkbox':['date','datetime-local','number'].includes(spec.type)?spec.type:'text'; }
    input.id=id;input.name=spec.key;
    input.dataset.fieldKey=spec.presentation || spec.key;
    if(spec.type==='checkbox')input.checked=Boolean(value);
    else if(spec.type==='datetime-local')input.value=localDateTime(value);
    else if(['images','tags'].includes(spec.type))input.value=Array.isArray(value)?value.join('\n'):(value || '');
    else input.value=value==null?'':String(value);
    if(spec.required)input.required=true;
    if(spec.pattern)input.pattern=spec.pattern;
    if(spec.min!==undefined){input.min=String(spec.min);input.step='1';}
    if(spec.placeholder)input.placeholder=spec.placeholder;
    if(locked)input.disabled=true;
    if(['url','image'].includes(spec.type)){input.inputMode='url';input.autocomplete='url';}
    if(spec.type==='colorname') {
      const list=E('datalist');list.id=id+'-colors';colors.forEach(color=>{const option=E('option');option.value=color;list.append(option);});
      input.setAttribute('list',list.id);wrapper.append(list);
    }
    if(spec.type==='private'){input.type='hidden';label.removeAttribute('for');}
    if(spec.type==='checkbox'){label.prepend(input);wrapper.append(label);} else wrapper.append(label,input);
    let hint=spec.hint || (spec.type==='colorname'?'pink / green / blue 또는 #색상코드':spec.type==='tags'?'한 줄에 하나씩 적거나 쉼표로 구분하세요.':spec.type==='image'?'이미지 주소 또는 assets/로 시작하는 파일 경로를 입력하세요. 아래에서 사진을 확인할 수 있습니다.':'');
    if(hint){const note=E('small','adm-field-hint',hint);note.id=id+'-hint';input.setAttribute('aria-describedby',note.id);wrapper.append(note);}
    if(spec.type==='image' || spec.type==='images')addPreview(input,wrapper,spec.type==='images');
    if(spec.type==='private') {
      const attachment=E('p','adm-attachment-info');attachment.setAttribute('aria-live','polite');wrapper.append(attachment);
      const metadata=name=>form.elements.namedItem('private_asset_'+name);
      const paintAttachment=()=>{
        const path=input.value.trim(),name=metadata('name')?.value,size=Number(metadata('size')?.value||0);
        attachment.textContent=path?(name||('기존 '+(path.split('.').pop()||'').toUpperCase()+' 파일'))+(size>0?' · '+formatFileSize(size):''):'첨부된 파일이 없습니다.';
        remove.disabled=!path;
      };
      input.paintAttachment=paintAttachment;
      const actions=E('div','adm-private-upload'),file=E('input');file.type='file';file.accept='.png,.jpg,.jpeg,.webp,.gif,.zip,.apk';file.hidden=true;
      const upload=button('파일 업로드·교체','adm-button adm-button-small',()=>{if(requireAccess()&&!operation&&!saving())file.click();});
      const remove=button('첨부 해제','adm-button adm-button-small',()=>{
        if(!requireAccess()||operation||saving())return;
        input.value='';['name','size','mime'].forEach(key=>{if(metadata(key))metadata(key).value=key==='size'?'0':'';});
        input.dispatchEvent(new Event('input',{bubbles:true}));
      });
      input.addEventListener('input',paintAttachment);
      file.addEventListener('change',async()=>{
        const selected=file.files[0];file.value='';if(!selected||!requireAccess()||operation||saving())return;
        const version=authVersion;operation=true;upload.disabled=true;updateStatus();
        try {
          if(!window.YamhaRewardAuth?.uploadPrivate||!S.getAccessToken)throw new Error('비공개 원본 연결 설정을 확인해 주세요.');
          const result=await window.YamhaRewardAuth.uploadPrivate(selected,await S.getAccessToken());
          if(!sessionCurrent(version)||!input.isConnected)return;
          if(!privateAssetPattern.test(result?.path||''))throw new Error('업로드된 파일을 확인하지 못했어요.');
          input.value=result.path;
          const values={name:result.name||selected.name,size:result.size??selected.size,mime:result.mime||selected.type||''};
          Object.entries(values).forEach(([key,value])=>{if(metadata(key))metadata(key).value=String(value);});
          input.dispatchEvent(new Event('input',{bubbles:true}));UI.toast('파일을 업로드했어요. 등록 또는 수정 저장을 눌러 주세요.');
        } catch(problem){if(sessionCurrent(version))markError(errorText(problem),input);else requireAccess();}
        finally{if(sessionCurrent(version)){operation=false;upload.disabled=false;updateStatus();}}
      });actions.append(upload,remove,file);wrapper.append(actions);
    }
    if(spec.presentation) {
      const reset=button('기본값 복원','adm-reset',()=>{
        input.value=String(spec.defaultValue??'');input.dataset.reset='true';
        input.dispatchEvent(new Event('input',{bubbles:true}));input.dataset.reset='true';updateStatus();
      });
      input.addEventListener('input',()=>{delete input.dataset.reset;});
      wrapper.append(reset);
    }
    if(spec.type==='url') {
      const view=E('a','adm-link-preview','주소 열어 보기 ↗');view.target='_blank';view.rel='noopener noreferrer';
      const paint=()=>{const url=safeURL(input.value);view.hidden=!url;if(url)view.href=url;else view.removeAttribute('href');};
      input.addEventListener('input',paint);paint();wrapper.append(view);
    }
    if(spec.type==='colorname') {
      const swatch=E('span','adm-color-swatch');swatch.setAttribute('aria-hidden','true');
      const paint=()=>{const value=input.value;const named={pink:'#ffd9e5',green:'#def4bd',lime:'#def4bd',blue:'#dcecfb',yellow:'#fff0b8',orange:'#ffe0be',purple:'#e9def8',red:'#ffd6d4',gray:'#ebe6e8',cream:'#f7efd9'};swatch.style.backgroundColor=Object.hasOwn(named,value)?named[value]:/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)?value:'transparent';};
      input.addEventListener('input',paint);paint();wrapper.append(swatch);
    }
    target.append(wrapper);
    return input;
  }
  function readField(form,spec) {
    const input=form.elements.namedItem(spec.key);
    if(spec.presentation && input.dataset.reset==='true')return null;
    if(spec.presentation && spec.type!=='image')return input.value;
    if(spec.type==='checkbox')return input.checked;
    const value=input.value.trim();
    if(spec.type==='number' || spec.number)return value===''?0:Number(value);
    if(spec.type==='images')return spec.preserveDesignSlots && form.elements.namedItem('id')?.value==='creation'
      ? (value?input.value.split(/\r?\n/).map(part=>part.trim()):[])
      : unique(lines(value));
    if(spec.type==='tags')return unique(value.split(/[,\n]/).map(part=>part.trim()).filter(Boolean));
    if(spec.type==='datetime-local')return value?new Date(value+':00+09:00').toISOString():null;
    if(spec.key==='recipient_channel_id')return value.toLowerCase();
    if(spec.key==='end_date')return value || null;
    return value;
  }
  function formatFileSize(bytes){return bytes<1024?bytes+' B':bytes<1024*1024?(bytes/1024).toFixed(1)+' KiB':(bytes/(1024*1024)).toFixed(1)+' MiB';}
  function validateFields(form,fields,state) {
    const invalid=[...form.elements].find(input=>input.willValidate && !input.validity.valid);
    if(invalid){revealField(invalid);form.reportValidity();return false;}
    if(!form.reportValidity())return false;
    for(const spec of fields) {
      const input=form.elements.namedItem(spec.key),value=input.value.trim();
      let error='';
      if(spec.required && spec.type!=='checkbox' && !value)error=spec.label+'을(를) 입력해 주세요.';
      if(spec.type==='number' && (!Number.isSafeInteger(Number(value)) || Number(value)<(spec.min || 0)))error=spec.label+'은(는) '+(spec.min || 0)+' 이상의 정수로 입력해 주세요.';
      if(['url','image'].includes(spec.type) && value && (!safeURL(value,spec.type==='image') || (spec.type==='url' && !/^https?:\/\//i.test(value))))error='사용할 수 있는 주소를 입력해 주세요. 웹 주소는 https://로 시작해요.';
      if(spec.type==='images' && lines(value).some(url=>!safeURL(url,true)))error='이미지 주소 중 사용할 수 없는 주소가 있어요. 한 줄에 주소 하나씩 확인해 주세요.';
      if(spec.type==='private' && value && !privateAssetPattern.test(value))error='파일 업로드·교체 버튼으로 첨부파일을 다시 올려 주세요.';
      if(spec.type==='colorname' && value && !colors.includes(value) && !/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value) && state.startValues[spec.key]!==input.value)error='색상 이름 또는 #aabbcc 형식의 색상코드를 입력해 주세요.';
      if(error){markError(error,input,state);return false;}
    }
    return true;
  }
  function createEditor(title,fields,row,submit,settings) {
    settings=settings || {};
    const card=E('section','adm-editor');
    const head=E('div','adm-editor-heading');head.append(E('h2','adm-section-title',title));
    if(settings.note)head.append(E('p','adm-card-note',settings.note));card.append(head);
    const form=E('form','adm-form');form.noValidate=true;
    const fieldset=E('fieldset','adm-fields');
    const startValues={};
    if(settings.groups) {
      settings.groups.forEach(group=>{
        const groupWrap=E(group.collapsed?'details':'section','adm-field-group');
        groupWrap.append(E(group.collapsed?'summary':'h3','adm-group-title',group.title));
        if(group.hint)groupWrap.append(E('p','adm-group-hint',group.hint));
        const grid=E('div','adm-field-grid');group.fields.forEach(spec=>addField(form,grid,spec,spec.presentation?C.raw(spec.presentation):get(row,spec.key),settings.existing && spec.key==='id'));groupWrap.append(grid);fieldset.append(groupWrap);
      });
    } else {
      const grid=E('div','adm-field-grid');fields.forEach(spec=>addField(form,grid,spec,spec.presentation?C.raw(spec.presentation):get(row,spec.key),settings.existing && spec.key==='id'));fieldset.append(grid);
    }
    form.append(fieldset);
    [...form.elements].filter(input=>input.paintAttachment).forEach(input=>input.paintAttachment());
    const error=E('p','adm-error');error.setAttribute('role','alert');error.hidden=true;form.append(error);
    const actions=E('div','adm-form-actions');
    const save=button(settings.existing?'수정 저장':'등록하기','adm-button adm-button-primary');save.type='submit';
    const cancel=button(settings.cancelLabel || '작성 취소','adm-button',()=>{
      if(settings.independent){
        if(!requireAccess() || saving() || operation)return;
        if(state.initial!==formSnapshot(form) && !window.confirm('이 카드에서 작성한 변경을 되돌릴까요?'))return;
        settings.cancel?.();
      }else if(canLeave([state]))settings.cancel?.();
    });
    const savedNote=E('span','adm-save-note',settings.existing?'변경 후 저장을 눌러 주세요.':'등록하기를 누르면 사이트에 반영됩니다.');savedNote.setAttribute('aria-live','polite');
    actions.append(save,cancel,savedNote);form.append(actions);card.append(form);
    const state={form,fieldset,error,save,cancel,savedNote,busy:false,row,fields,startValues,existing:!!settings.existing,initial:''};
    [...form.elements].filter(input=>input.name).forEach(input=>startValues[input.name]=input.type==='checkbox'?input.checked:input.value);
    state.initial=formSnapshot(form);cardEditors.set(card,state);for(const old of editors)if(!old.form.isConnected)editors.delete(old);editors.add(state);
    const changed=()=>{savedNote.textContent=state.initial!==formSnapshot(form)?'저장하지 않은 변경이 있습니다.':'변경 후 저장을 눌러 주세요.';updateStatus();};
    form.addEventListener('input',changed);form.addEventListener('change',changed);
    form.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();cancel.click();}});
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!requireAccess() || !state.form.isConnected || saving() || operation)return;
      error.hidden=true;error.textContent='';
      if(!validateFields(form,fields,state))return;
      const version=authVersion;
      try { await submit(state); } catch(problem) {if(sessionCurrent(version) && state.form.isConnected)markError(errorText(problem),null,state);else requireAccess();}
    });
    return card;
  }
  function setBusy(state,value) {
    if(!unlocked || !state.form.isConnected)return;
    state.busy=value;state.fieldset.disabled=value;state.save.disabled=value;state.cancel.disabled=value;
    state.save.textContent=value?'저장 중…':state.saveLabel || (state.existing?'수정 저장':'등록하기');updateStatus();
  }
  function collect(state,onlyChanged) {
    const data={};
    state.fields.forEach(spec=>{
      const input=state.form.elements.namedItem(spec.key),raw=spec.type==='checkbox'?input.checked:input.value;
      if(!onlyChanged || state.startValues[spec.key]!==raw || input.dataset.reset==='true')data[spec.key]=readField(state.form,spec);
    });
    return data;
  }

  // Page groups follow the imported GROUPS -> fields -> collectForm contract.
  // Presentation names are literal keys inside profile.presentation, not nested paths.
  function cataloguePage(key) {
    const parts=key.split('.'),prefix=parts[0];
    if(prefix==='song'||prefix==='songs'||(prefix==='heading'&&parts[1]==='song'))return null;
    if(prefix==='heading')return Object.hasOwn(tabNames,parts[1])?parts[1]:'common';
    if(['shell','shared','pages'].includes(prefix))return 'common';
    return ({calendar:'schedule',rewardPreview:'reward',rewards:'reward',photos:'reward',debts:'debt',guides:'guide',songs:'song'})[prefix] || (Object.hasOwn(tabNames,prefix)?prefix:'common');
  }
  function profileGroups(profile,page) {
    const groups=[];
    if(page==='common')groups.push({title:'사이트 공통 정보',hint:'나오는 곳 — 모든 페이지 왼쪽 위 프로필 사진과 이름. 이름과 팬 이름을 바꾸면 연결된 문구에도 함께 반영됩니다.',fields:[
      {key:'brandImage',label:'왼쪽 위 프로필 사진',type:'image',wide:true},
      {key:'name',label:'활동 이름'},{key:'englishName',label:'영문 이름'},{key:'fanName',label:'팬 이름'}]},
      {title:'공통 채널 주소',hint:'나오는 곳 — 메인 바로가기와 페이지 아래의 외부 채널 링크. 전체 주소를 입력한 뒤 ‘주소 열어 보기’로 확인하세요.',fields:[['channel','방송 채널'],['cafe','팬카페'],['youtube','YouTube'],['x','X']].map(([key,label])=>({key:'links.'+key,label:label+' 주소',type:'url',wide:true}))});
    if(page==='home')groups.push({title:'이름·소개·방송 안내',hint:'나오는 곳 — 메인 이름과 소개, 방송 시간 안내. 같은 정보를 쓰는 프로필에도 함께 반영됩니다.',fields:[
      {key:'name',label:'활동 이름'},{key:'englishName',label:'영문 이름'},{key:'fanName',label:'팬 이름'},
      {key:'bio',label:'한 줄 소개',wide:true},{key:'broadcast.time',label:'방송 시간'},{key:'broadcast.restDays',label:'정기 휴방'},
      {key:'links.channel',label:'방송 채널 주소',type:'url',wide:true}]},
      ...Array.from({length:5},(_,index)=>({title:`메인 사진 ${index+1}`,hint:`나오는 곳 — 메인 콜라주의 ${index+1}번 사진. 아래 미리보기로 사진을 확인하고 저장하세요. 설명은 사진 확대와 화면 읽기 안내에 사용됩니다.`,fields:[
        {key:`photos.${index}.src`,label:'사진 이미지 주소',type:'image',wide:true},
        {key:`photos.${index}.alt`,label:'사진 설명',wide:true}
      ]})));
    if(page==='profile')groups.push({title:'프로필 사진·소개',hint:'나오는 곳 — 프로필 맨 위 사진과 이름, 소개. 사진은 메인 사진과 별도로 바꿀 수 있습니다.',fields:[
      {key:'profileImage',label:'프로필 페이지 사진',type:'image',wide:true,hint:'메인 사진과 별도로 바꿀 수 있어요.'},
      {key:'name',label:'활동 이름',hint:'메인·공통 이름과 같은 값이에요.'},{key:'englishName',label:'영문 이름'},
      {key:'bio',label:'한 줄 소개',wide:true},{key:'intro',label:'자세한 소개',type:'textarea',wide:true,hint:'줄바꿈이 그대로 반영됩니다.'}]},
      {title:'프로필 기본 정보',hint:'나오는 곳 — 프로필 사진 옆의 생일·데뷔·팬네임·소속·MBTI·나이 표입니다.',fields:[
      {key:'fanName',label:'팬 이름'},{key:'birthday',label:'생일',placeholder:'04.06'},{key:'debutDate',label:'데뷔 날짜',type:'date'},
      {key:'agency',label:'소속'},{key:'mbti',label:'MBTI'},{key:'age',label:'나이',placeholder:'21세'}]},
      {title:'말버릇·취향',hint:'나오는 곳 — 프로필의 말버릇, 좋아하는 것·싫어하는 것 카드입니다.',fields:[
        {key:'catchphrase',label:'말버릇',wide:true},
        {key:'interests',label:'좋아하는 것',type:'tags'},{key:'dislikes',label:'싫어하는 것',type:'tags'}]},
      {title:'방송 콘텐츠·키워드',hint:'나오는 곳 — 프로필 소개 아래 콘텐츠 표기와, 오전 방송 카드의 #키워드입니다.',fields:[
        {key:'broadcast.categories',label:'주요 콘텐츠',type:'tags'},{key:'keywords',label:'방송 키워드',type:'tags',hint:'한 줄에 하나씩 적으세요. 화면에는 #이 자동으로 붙습니다.'}]},
      {title:'얌하의 플레이리스트',hint:'나오는 곳 — 프로필의 플레이리스트 카드. 외부 노래책 버튼을 누르면 아래 주소가 새 창으로 열립니다.',fields:[
        {key:'genres',label:'노래 장르',type:'tags'},{key:'signatureSong',label:'대표곡'},{key:'links.songbook',label:'외부 노래책 주소',type:'url',wide:true}]});
    if(page==='schedule'||page==='profile')groups.push({title:'방송 시간 안내',hint:'나오는 곳 — 메인·프로필·일정에서 사용하는 방송 시간과 정기 휴방 안내입니다.',fields:[{key:'broadcast.time',label:'방송 시간'},{key:'broadcast.restDays',label:'정기 휴방'}]},
      {title:'요일별 방송 안내',hint:'나오는 곳 — 프로필의 요일별 안내입니다. 개별 날짜 일정은 일정 탭의 달력에서 등록하세요.',fields:['월','화','수','목','금','토','일'].map((day,index)=>({key:`broadcast.week.${index}`,label:day+'요일',placeholder:'오전 / 오후 8시 / 휴방'}))});
    if(page==='store')groups.push({title:'STORE 바로가기',hint:'나오는 곳 — 왼쪽 STORE 메뉴와 스토어 페이지의 바로가기 버튼입니다.',fields:[{key:'links.store',label:'굿즈 스토어 주소',type:'url',wide:true,hint:'비우면 스토어 준비 중 화면이 나와요.'}]});
    const catalogue=C.entries().filter(entry=>cataloguePage(entry.key)===page);
    const sections=new Map();
    catalogue.forEach(entry=>{
      const accessible=/aria|accessible|alt$|dialogClose|imageAlt|navigationLabel/i.test(entry.key);
      const statusText=/error|loading|empty|pending|failed|unavailable|setup|cancelled|expired|warning/i.test(entry.key);
      const group=accessible?'화면 읽기 안내':entry.type==='image'?'사진·장식 이미지':entry.key.startsWith('heading.')?'페이지 제목·소개':statusText?'빈 화면·오류 안내 문구':entry.group || '페이지 문구';
      if(!sections.has(group))sections.set(group,{title:group,presentation:true,hint:accessible?'화면 읽기 프로그램에서 사용하는 설명입니다.':entry.type==='image'?'나오는 곳 — 해당 페이지의 장식과 아이콘. 항목 아래의 빈 값 안내를 확인하세요.':statusText?'자료가 없거나 불러오는 중일 때, 오류가 발생했을 때 표시되는 안내입니다.':'나오는 곳 — 해당 페이지의 제목, 버튼, 설명. 중괄호 안 이름은 공통 정보로 자동 대체됩니다.',fields:[]});
      sections.get(group).fields.push({key:'presentation.'+entry.key,presentation:entry.key,defaultValue:entry.value,
        label:entry.label,type:entry.type==='image'?'image':entry.multiline?'textarea':'text',wide:entry.type==='image'||!!entry.multiline,
        hint:entry.hint || (entry.type==='image'?'빈 값은 이미지를 숨기고, 기본값 복원은 원래 이미지로 돌아가요.':String(entry.value??'').includes('{')?'중괄호 안 이름은 실제 정보로 바뀌는 자리예요. 그대로 두면 자동으로 반영돼요.':undefined)});
    });
    return groups.concat([...sections.values()]);
  }
  function setPath(object,path,value) {
    const parts=path.split('.');let target=object;
    parts.slice(0,-1).forEach((part,index)=>{
      if(target[part]==null || typeof target[part]!=='object')target[part]=/^\d+$/.test(parts[index+1])?[]:{};
      target=target[part];
    });target[parts[parts.length-1]]=value;
  }
  function settingsProfile() {
    const profile=S.profile();
    profile.broadcast={...(profile.broadcast || {})};
    if(!Array.isArray(profile.broadcast.week))profile.broadcast.week=['오전','휴방','휴방','오전','오전','오전','오전'];
    if(profile.profileImage==null)profile.profileImage=profile.photos?.[0]?.src ?? '';
    if(profile.intro===undefined)profile.intro=C.text('profile.intro',{fanName:profile.fanName||C.text('profile.introAudience')});
    return profile;
  }
  function renderSettingsCard(page,group,target) {
    const profile=settingsProfile(),fields=group.fields;
    const card=createEditor(group.title,fields,profile,async currentState=>{
      const changes=collect(currentState,true);if(!Object.keys(changes).length){UI.toast('이 카드에서 변경한 내용이 없어요.');return;}
      const current=S.profile(),patch={};
      Object.entries(changes).forEach(([path,value])=>{
        if(path.startsWith('presentation.')){(patch.presentation ||= {})[path.slice(13)]=value;return;}
        if(path.startsWith('photos.') && !patch.photos)patch.photos=JSON.parse(JSON.stringify(current.photos || profile.photos || []));
        if(path.startsWith('broadcast.week.') && !patch.broadcast?.week){patch.broadcast ||= {};patch.broadcast.week=(current.broadcast?.week || profile.broadcast.week).slice();}
        setPath(patch,path,value);
      });
      const version=authVersion;setBusy(currentState,true);
      try {
        await S.saveProfile(patch);if(!sessionCurrent(version)||!currentState.form.isConnected)return;
        [...currentState.form.elements].filter(input=>input.name).forEach(input=>{delete input.dataset.reset;currentState.startValues[input.name]=input.type==='checkbox'?input.checked:input.value;});
        currentState.initial=formSnapshot(currentState.form);
        currentState.savedNote.textContent='저장 완료 · 이 카드의 변경이 사이트에 반영됩니다.';
        UI.toast(group.title+' 저장 완료');
      } catch(problem){if(sessionCurrent(version))markError(errorText(problem),null,currentState);else requireAccess();}
      finally{if(sessionCurrent(version))setBusy(currentState,false);}
    },{existing:true,independent:true,note:group.hint,cancelLabel:'이 카드 되돌리기',cancel:()=>{target.replaceChildren();renderSettingsCard(page,group,target);updateStatus();}});
    const state=cardEditors.get(card);state.saveLabel='이 카드 저장';state.save.textContent=state.saveLabel;
    card.classList.add('adm-settings-card');card.dataset.settingsGroup=group.title;
    target.append(card);
  }
  function renderPageSettings(page,target,advancedTarget) {
    const groups=profileGroups(settingsProfile(),page);
    const primary=groups.filter(group=>!group.presentation),advanced=groups.filter(group=>group.presentation);
    primary.forEach(group=>{const slot=E('div','adm-settings-slot');target.append(slot);renderSettingsCard(page,group,slot);});
    if(advanced.length){
      const details=E('details','adm-details-editor');
      const summary=E('summary','adm-details-summary');summary.append(E('span','','문구·사진 세부 편집'),E('small','','페이지 제목, 버튼 이름, 장식 이미지 변경'));
      details.append(summary,E('p','adm-details-note','내용 등록과 별도로, 화면에 표시되는 글자와 장식을 바꾸는 곳입니다. 필요한 항목만 펼쳐 수정하세요. 각 카드의 저장 버튼은 해당 카드만 저장합니다.'));
      details.append(E('p','adm-details-note','{name}은 활동 이름, {fanName}은 팬 이름처럼 실제 정보로 바뀝니다. ‘기본값 복원’을 누른 뒤 저장하면 원래 문구·사진으로 돌아갑니다.'));
      advancedTarget.append(details);
      advanced.forEach(group=>{
        const fold=E('details','adm-copy-group'),summary=E('summary','adm-copy-summary',group.title+' · '+group.fields.length+'개');
        const slot=E('div','adm-settings-slot');fold.append(summary,slot);details.append(fold);renderSettingsCard(page,group,slot);
      });
    }
    updateStatus();
  }
  function addSettingsSearch(parent,targets) {
    const bar=E('div','adm-settings-search'),label=E('label','adm-label','편집할 문구·사진 찾기');
    const input=E('input','adm-input');input.type='search';input.id='adm-settings-search';input.placeholder='예: 팬 이름, 메인 사진, 리워드 페이지 제목';label.htmlFor=input.id;
    const result=E('p','adm-field-hint','내용은 아래 카드에서 수정하고, 제목·장식은 ‘문구·사진 세부 편집’에서 찾을 수 있습니다.');result.setAttribute('aria-live','polite');
    bar.append(label,input,result);parent.append(bar);
    let previous=new Map();
    input.addEventListener('input',()=>{
      const query=input.value.trim().toLocaleLowerCase();
      const cards=targets.flatMap(target=>[...target.querySelectorAll('.adm-settings-card')]);
      const folds=targets.flatMap(target=>[...target.querySelectorAll('details')]);
      if(query&&!previous.size)folds.forEach(fold=>previous.set(fold,fold.open));
      let hits=0;
      cards.forEach(card=>{
        let count=0;const groupMatch=!!query&&card.dataset.settingsGroup.toLocaleLowerCase().includes(query);
        card.querySelectorAll('.adm-field').forEach(field=>{
          const control=field.querySelector('[name]');
          const haystack=[field.textContent,control?.value,control?.name].join(' ').toLocaleLowerCase();
          const match=!query||groupMatch||haystack.includes(query);field.hidden=!match;if(match){count++;hits++;}
        });
        card.closest('.adm-settings-slot').hidden=!count;
      });
      folds.slice().reverse().forEach(fold=>{
        const visible=[...fold.querySelectorAll('.adm-settings-slot')].some(slot=>!slot.hidden);
        fold.hidden=!visible;if(query&&visible)fold.open=true;
        if(!query&&previous.has(fold))fold.open=previous.get(fold);
      });
      if(!query)previous.clear();
      result.textContent=query?hits+'개 항목을 찾았습니다. 검색을 지우면 전체 항목이 다시 보입니다.':'내용은 아래 카드에서 수정하고, 제목·장식은 ‘문구·사진 세부 편집’에서 찾을 수 있습니다.';
    });
  }
  function consumeBroadcasterCallback() {
    const url=new URL(window.location.href),result=url.searchParams.get('chzzk');
    if(!Object.hasOwn(broadcasterCallbackMessages,result))return;
    connectionCallback=result;connectionCallbackPending=true;url.searchParams.delete('chzzk');
    window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);
  }
  function paintBroadcasterConnection() {
    const view=connectionView;if(!view?.card.isConnected)return;
    const state=connectionState;
    const messages={idle:'연결 상태를 아직 확인하지 않았습니다.',loading:'서버에 저장된 연결 상태를 확인하고 있습니다…',connected:'연결 확인 완료 · 서버에 저장된 방송인 연결과 구독 조회를 확인했습니다.',not_connected:'미연결 · 서버에 방송인 연결 정보가 없습니다. 얌하 계정으로 연결해 주세요.',reconnect_required:'재연결 필요 · 얌하 계정으로 방송인 연결을 다시 진행해 주세요.',error:'연결 상태를 확인하지 못했습니다.'};
    view.state.textContent=messages[state.status] || messages.error;
    const updated=new Date(state.updatedAt || '');
    view.updated.textContent=state.status==='connected'&&!Number.isNaN(updated.getTime())?'연결 정보 갱신: '+updated.toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'';
    view.updated.hidden=!view.updated.textContent;
    view.callback.textContent=broadcasterCallbackMessages[connectionCallback] || '';
    view.callback.hidden=!view.callback.textContent;
    view.callback.className=connectionCallback==='connected'?'adm-card-note':'adm-error';
    view.error.textContent=connectionProblem || state.error || '';view.error.hidden=!view.error.textContent;
    view.refresh.disabled=state.status==='loading'||operation;
    view.refresh.textContent=state.status==='loading'?'연결 상태 확인 중…':'연결 상태 확인';
    const actionStatus=state.lastStatus || state.status;
    view.connect.textContent=['connected','reconnect_required'].includes(actionStatus)?'방송인 다시 연결':'치지직 방송인 연결';
    view.connect.disabled=operation||state.status==='loading';
  }
  async function refreshBroadcasterStatus() {
    if(!requireAccess()||operation||saving()||connectionState.status==='loading')return;
    const session=authVersion,request=++connectionVersion;
    const current=()=>sessionCurrent(session)&&request===connectionVersion;
    const lastStatus=['connected','not_connected','reconnect_required'].includes(connectionState.status)?connectionState.status:connectionState.lastStatus;
    connectionState={status:'loading',lastStatus};connectionProblem='';paintBroadcasterConnection();
    try{
      if(!window.YamhaRewardAuth?.broadcasterStatus||!S.getAccessToken)throw new Error('치지직 연결 설정을 확인해 주세요.');
      const token=await S.getAccessToken();if(!current())return;
      const result=await window.YamhaRewardAuth.broadcasterStatus(token);if(!current())return;
      connectionState={...result.connection};
    }catch(problem){if(current())connectionState={status:'error',lastStatus,error:errorText(problem)};}
    finally{if(current())paintBroadcasterConnection();}
  }
  function rewardConnectionCard() {
    const card=E('section','adm-connection');
    const text=E('div');text.append(E('h2','adm-section-title','치지직 방송인 연결'),E('p','adm-card-note','얌하 계정으로 한 번 연결하면 구독자의 티어와 개월 수를 확인할 수 있습니다. 아래 리워드 등록에서 수령 조건을 정하세요.'));
    const state=E('p','adm-card-note');state.setAttribute('role','status');state.setAttribute('aria-live','polite');
    const updated=E('p','adm-field-hint'),callback=E('p','adm-card-note');callback.setAttribute('role','status');
    text.append(state,updated,E('p','adm-field-hint','연결 정보는 서버에 저장됩니다. 페이지 새로고침이나 시청자 로그아웃으로 풀리지 않으며, 재연결이 필요한 경우 아래 상태에 표시됩니다.'),callback);
    const error=E('p','adm-error');error.hidden=true;error.setAttribute('role','alert');
    const connect=button('치지직 방송인 연결','adm-button adm-button-primary',async event=>{
      if(!canLeave())return;const version=authVersion;operation=true;++connectionVersion;
      if(connectionState.status==='loading')connectionState={status:'idle'};
      connectionProblem='';connectionCallback='';paintBroadcasterConnection();updateStatus();
      const current=()=>sessionCurrent(version)&&card.isConnected;
      try{
        if(!window.YamhaRewardAuth?.connectBroadcaster||!S.getAccessToken)throw new Error('치지직 연결 설정을 확인해 주세요.');
        const token=await S.getAccessToken();if(!current())return;
        await window.YamhaRewardAuth.connectBroadcaster(token,current);
      }
      catch(problem){if(current()){connectionProblem=errorText(problem);paintBroadcasterConnection();}}
      finally{if(sessionCurrent(version)){operation=false;paintBroadcasterConnection();updateStatus();}}
    });
    const refresh=button('연결 상태 확인','adm-button',refreshBroadcasterStatus),actions=E('div','adm-header-actions');actions.append(refresh,connect);
    connectionView={card,state,updated,callback,error,connect,refresh};card.append(text,actions,error);return card;
  }
  async function renderPage(page) {
    pane.replaceChildren();collectionHost=null;activeCollection='';
    const pageBar=E('div','adm-page-bar');pageBar.append(E('p','adm-panel-description',pageHelp[page]));
    const view=E('a','adm-button adm-button-small','이 페이지 보기 ↗');view.href=S.url(pagePaths[page]);view.target='_blank';view.rel='noopener';pageBar.append(view);pane.append(pageBar);
    const primary=E('div','adm-page-settings'),advanced=E('div','adm-page-settings adm-advanced-settings');
    const searchHost=E('div','adm-search-host');pane.append(searchHost);
    const names=pageCollections[page] || [];
    if(page==='reward'){pane.append(rewardConnectionCard());paintBroadcasterConnection();if(connectionState.status==='idle')void refreshBroadcasterStatus();}
    if(page==='profile'||!names.length)pane.append(primary);
    if(names.length){
      const section=E('section','adm-page-collections'),tabs=E('div','adm-subtabs');tabs.setAttribute('aria-label',tabNames[page]+' 목록 관리');
      names.forEach(name=>{const tab=button(configs[name].singular+' 관리','adm-button',()=>{if(name!==activeCollection&&canLeave([editor]))loadCollection(name);});tab.dataset.collection=name;tabs.append(tab);});
      section.append(tabs);collectionHost=E('div','adm-collection-host');section.append(collectionHost);pane.append(section);
    }
    if(page!=='profile'&&names.length)pane.append(primary);
    pane.append(advanced);renderPageSettings(page,primary,advanced);addSettingsSearch(searchHost,[primary,advanced]);
    if(names.length)await loadCollection(names[0]);
  }
  async function loadCollection(name) {
    const version=++loadVersion,session=authVersion;
    activeCollection=name;calendar?.destroy();calendar=null;editor=null;
    pane.querySelectorAll('[data-collection]').forEach(tab=>{tab.classList.toggle('is-active',tab.dataset.collection===name);tab.setAttribute('aria-pressed',String(tab.dataset.collection===name));});
    collectionHost.replaceChildren(E('p','adm-empty','목록을 불러오고 있어요…'));
    try{const rows=await S.list(name);if(version!==loadVersion||!sessionCurrent(session))return;renderCollection(name,Array.isArray(rows)?rows:[]);}
    catch(problem){if(version===loadVersion&&sessionCurrent(session))collectionHost.replaceChildren(E('p','adm-error',errorText(problem)),button('다시 불러오기','adm-button',()=>loadCollection(name)));else requireAccess();}
  }

  function sortRows(name,rows) {
    return rows.slice().sort((a,b)=>name==='schedule'?String(a.date).localeCompare(String(b.date)) || String(a.time||'').localeCompare(String(b.time||''))
      : ['rewards','guides'].includes(name)?Number(a.sort_order||0)-Number(b.sort_order||0)
      : name==='news'?Number(!!b.pinned)-Number(!!a.pinned) || String(b.published_at||'').localeCompare(String(a.published_at||''))
      : String(b.updated_at||b.published_at||b.date||'').localeCompare(String(a.updated_at||a.published_at||a.date||'')));
  }
  function listPanel(name,rows) {
    const config=configs[name],section=E('section','adm-records');
    const heading=E('div','adm-list-heading');heading.append(E('h2','adm-section-title','등록된 '+config.singular),E('span','adm-count',String(rows.length)));section.append(heading);
    const search=E('input','adm-input adm-search');search.type='search';search.placeholder=config.singular+' 검색';search.setAttribute('aria-label',config.singular+' 검색');section.append(search);
    const list=E('div','adm-record-list');section.append(list);
    function paint() {
      const query=search.value.trim().toLocaleLowerCase();
      const filtered=sortRows(name,rows).filter(row=>[config.title(row),config.meta(row),row.body,row.description,row.note].filter(Boolean).join(' ').toLocaleLowerCase().includes(query));
      list.replaceChildren();
      if(!filtered.length){list.append(E('p','adm-empty',query?'검색 결과가 없어요.':'등록된 '+config.singular+' 항목이 없습니다. 새 항목을 등록해 주세요.'));return;}
      filtered.forEach(row=>{
        const card=E('article','adm-record'+(editor?.row?.id===row.id?' adm-record-editing':''));
        card.append(E('p','adm-record-meta',config.meta(row)),E('h3','adm-record-title',config.title(row) || '제목 없음'));
        if(name==='photos' && row.recipient_channel_id)card.append(E('p','adm-record-note','수신 채널 · '+row.recipient_channel_id));
        if(name==='schedule' && (row.title2 || row.time2))card.append(E('p','adm-record-note','2부 · '+[row.time2,row.title2,row.type2].filter(Boolean).join(' · ')));
        const actions=E('div','adm-record-actions');
        actions.append(button('수정','adm-button adm-button-small',()=>openEditor(name,row)),button('삭제','adm-button adm-button-small adm-button-danger',()=>deleteRow(name,row)));
        card.append(actions);list.append(card);
      });
    }
    search.addEventListener('input',paint);paint();return section;
  }
  function renderCollection(name,rows,selectedRow,date) {
    if(!requireAccess())return;
    calendar?.destroy();calendar=null;editor=null;collectionHost.replaceChildren();currentRows=rows;
    const config=configs[name];
    const allGuides=name==='guides' && ['chat','fan','creation'].every(id=>rows.some(row=>row.id===id));
    if(allGuides && !selectedRow)selectedRow=rows.find(row=>row.id==='chat');
    const add=button(allGuides?'안내 3종 등록됨':'+ '+config.singular+' 등록','adm-button adm-button-new',()=>openEditor(name,null));
    add.disabled=allGuides;
    const actions=E('div','adm-panel-actions');
    if(name==='rewards' || name==='photos') {
      const preview=E('a','adm-button adm-button-small',name==='photos'?'사진 화면 미리보기 ↗':'리워드 화면 미리보기 ↗');
      preview.href=S.url(name==='photos'?'reward/index.html?tab=photos&preview=1':'reward/index.html?preview=1');
      preview.target='_blank';preview.rel='noopener';actions.append(preview);
    }
    actions.append(add);
    const intro=E('div','adm-panel-intro');intro.append(E('p','adm-panel-description',config.description),actions);
    collectionHost.append(intro);
    if(name==='schedule') {
      const wrap=E('section','adm-calendar');collectionHost.append(wrap);
      calendar=window.YamhaCalendar.mount(wrap,{editable:true,events:rows,date:date || selectedRow?.date || undefined,
        onDate:date=>openEditor(name,null,date),onEvent:row=>openEditor(name,row)});
    }
    const workspace=E('div','adm-workspace');const editorHost=E('div','adm-editor-host');editorHost.id='adm-editor-host';workspace.append(editorHost);collectionHost.append(workspace);
    buildCollectionEditor(name,selectedRow,date);
    workspace.append(listPanel(name,rows));updateStatus();
  }
  function buildCollectionEditor(name,row,date) {
    if(!requireAccess())return;
    const config=configs[name];
    const data=row || config.defaults();
    if(date && !row)data.date=date;
    if(name==='guides' && !row){const free=['chat','fan','creation'].find(id=>!currentRows.some(item=>item.id===id));data.id=free || 'chat';}
    const card=createEditor(config.singular+(row?' 수정':' 등록'),config.fields,data,async state=>{
      if(name==='schedule') {
        const start=state.form.elements.namedItem('date'),end=state.form.elements.namedItem('end_date');
        if(!window.YamhaCalendar.validDate(start.value) || (end.value && (!window.YamhaCalendar.validDate(end.value) || end.value<start.value))){markError('종료 날짜는 시작 날짜와 같거나 뒤여야 해요.',end);return;}
      }
      const patch=collect(state,!!row);
      if(name==='photos')patch.recipient_channel_id=readField(state.form,config.fields.find(field=>field.key==='recipient_channel_id'));
      if(row)patch.id=row.id;
      if(name==='guides' && !row && currentRows.some(item=>String(item.id)===String(patch.id))){markError('이미 등록된 안내예요. 목록에서 해당 안내의 수정 버튼을 눌러 주세요.',state.form.elements.namedItem('id'));return;}
      if(['debts','guides'].includes(name))patch.updated_at=new Date().toISOString();
      const version=authVersion;setBusy(state,true);
      let saved=false;
      try {
        const result=await S.upsert(name,patch);
        if(!sessionCurrent(version))return;
        if(!result || result.id==null || (row && String(result.id)!==String(row.id)))throw new Error('No matching saved row');
        saved=true;
        const nextRows=await S.list(name);
        if(!sessionCurrent(version))return;
        if(!Array.isArray(nextRows) || !nextRows.some(item=>String(item.id)===String(result.id)))throw new Error('Saved row was not found');
        const visibleDate=name==='schedule'?result.date:undefined;
        renderCollection(name,nextRows,null,visibleDate);UI.toast(config.singular+' 저장 완료');
      } catch(problem) {if(sessionCurrent(version) && state.form.isConnected)markError(saved?'서버에는 저장되었지만 목록에서 다시 확인하지 못했어요. 입력을 유지했으니 연결 상태를 확인해 주세요.':errorText(problem),null,state);else requireAccess();}
      finally {if(sessionCurrent(version))setBusy(state,false);}
    },{existing:!!row,note:row?'수정 중인 항목: '+(config.title(row)||config.singular)+'. 수정 저장을 눌러야 사이트에 반영됩니다.':'새 '+config.singular+' 등록 화면입니다. 입력 후 등록하기를 눌러 주세요.',
      groups:collectionGroups[name]?.map(([title,hint,keys])=>({title,hint,fields:keys.map(key=>config.fields.find(field=>field.key===key))})),
      cancel:()=>{const complete=name==='guides' && ['chat','fan','creation'].every(id=>currentRows.some(item=>item.id===id));buildCollectionEditor(name,complete?currentRows.find(item=>item.id==='chat'):null);refreshList(name);updateStatus();}});
    editor=cardEditors.get(card);
    document.getElementById('adm-editor-host').replaceChildren(card);
    if(name==='schedule') {
      const start=editor.form.elements.namedItem('date'),end=editor.form.elements.namedItem('end_date');
      end.min=start.value;start.addEventListener('change',()=>{end.min=start.value;});
    }
  }
  function refreshList(name) {
    if(!requireAccess())return;
    const list=collectionHost.querySelector('.adm-records');if(list)list.replaceWith(listPanel(name,currentRows));
  }
  function openEditor(name,row,date) {
    if(!canLeave([editor]))return;
    buildCollectionEditor(name,row,date);refreshList(name);updateStatus();
    const first=editor.form.querySelector('input:not([disabled]),select:not([disabled]),textarea');
    document.getElementById('adm-editor-host').scrollIntoView({block:'start',behavior:'auto'});
    first?.focus({preventScroll:true});
  }
  async function deleteRow(name,row) {
    if(!canLeave([editor]))return;
    if(!window.confirm('“'+(configs[name].title(row) || configs[name].singular)+'”을 삭제할까요?'+(name==='schedule' && row.end_date?' 기간 전체가 삭제돼요.':'')))return;
    const version=authVersion;operation=true;updateStatus();
    try {
      await S.remove(name,row.id);if(!sessionCurrent(version))return;const rows=await S.list(name);if(!sessionCurrent(version))return;
      if(rows.some(item=>String(item.id)===String(row.id)))throw new Error('Delete did not remove row');
      renderCollection(name,rows);UI.toast('서버에서 삭제했어요.');
    } catch(problem){if(sessionCurrent(version))UI.toast('삭제 결과를 확인하지 못했어요. 목록을 다시 확인해 주세요.');else requireAccess();}
    finally {if(sessionCurrent(version)){operation=false;updateStatus();}}
  }
  async function switchTab(name) {
    if(!requireAccess())return;
    if(name!==active && !canLeave())return;
    const session=authVersion,version=++loadVersion;calendar?.destroy();calendar=null;editor=null;active=name;
    [...tabBar.children].forEach(tab=>{const selected=tab.dataset.tab===name;tab.classList.toggle('is-active',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
    pane.setAttribute('aria-labelledby','adm-tab-'+name);
    pane.replaceChildren(E('p','adm-empty','저장된 내용을 불러오고 있어요…'));
    try {
      await renderPage(name);
    } catch(problem){if(version===loadVersion && sessionCurrent(session))pane.replaceChildren(E('p','adm-error',errorText(problem)),button('다시 불러오기','adm-button',()=>switchTab(name)));else requireAccess();}
    if(sessionCurrent(session))updateStatus();
  }

  async function exportBackup() {
    if(!requireAccess() || operation || saving())return;
    const version=authVersion;operation=true;updateStatus();
    try {
      const data=await S.exportData();if(!sessionCurrent(version))return;
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob);
      const link=E('a');link.href=url;link.download='yamha-backup-'+window.YamhaCalendar.todayKST()+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      UI.toast(dirty()?'서버에 저장된 내용만 백업했어요. 작성 중인 변경은 먼저 저장해 주세요.':'프로필과 전체 목록을 JSON으로 백업했어요.');
    } catch(problem){if(sessionCurrent(version))UI.toast(errorText(problem));else requireAccess();}
    finally {if(sessionCurrent(version)){operation=false;updateStatus();}}
  }
  async function inspectBackup(file) {
    if(!file || !requireAccess() || operation || saving())return;
    const version=authVersion,inspection=++backupVersion,panel=backupPanel;
    const visible=()=>sessionCurrent(version) && inspection===backupVersion && panel.isConnected;
    panel.replaceChildren();panel.hidden=false;
    try {
      if(file.size>10*1024*1024)throw new Error('large');
      const data=JSON.parse(await file.text());if(!visible())return;
      if(!data || typeof data!=='object' || Array.isArray(data))throw new Error('shape');
      const inner=data.data || data, lists=inner.collections || inner;
      panel.append(E('h2','adm-section-title','복원할 JSON 확인'),E('p','adm-backup-file',file.name));
      const summary=E('div','adm-backup-summary');
      summary.append(E('span','adm-backup-chip','프로필 '+(inner.profile?'포함':'없음')));
      collections.forEach(key=>summary.append(E('span','adm-backup-chip',(configs[key]?.singular || '노래')+' '+(Array.isArray(lists[key])?lists[key].length:0)+'개')));
      panel.append(summary,E('p','adm-field-hint','복원하면 서버에 저장된 내용을 선택한 파일로 바꿔요. 현재 저장본이 필요하면 먼저 JSON 백업을 내려받아 주세요.'));
      const actions=E('div','adm-form-actions');
      const apply=button('서버에 복원','adm-button adm-button-primary',async()=>{
        if(!visible() || !canLeave() || !window.confirm('선택한 JSON의 내용으로 서버 저장본을 바꿀까요?'))return;
        operation=true;apply.disabled=true;cancel.disabled=true;updateStatus();
        try {
          await S.importData(data);if(!visible())return;
          panel.hidden=true;panel.replaceChildren();operation=false;editor=null;await switchTab(active);
          if(sessionCurrent(version))UI.toast('백업을 서버에 복원했어요.');
        } catch(problem){
          if(visible()){const message=E('p','adm-error',errorText(problem));message.setAttribute('role','alert');panel.append(message);}else requireAccess();
        } finally {if(sessionCurrent(version)){operation=false;apply.disabled=false;cancel.disabled=false;updateStatus();}}
      });
      const cancel=button('취소','adm-button',()=>{++backupVersion;panel.hidden=true;panel.replaceChildren();});actions.append(apply,cancel);panel.append(actions);
    } catch(problem){if(visible())panel.append(E('p','adm-error',problem.message==='large'?'10MB 이하의 JSON 파일을 선택해 주세요.':'올바른 JSON 백업 파일을 읽지 못했어요. 파일 내용을 확인해 주세요.'),button('닫기','adm-button',()=>{++backupVersion;panel.hidden=true;panel.replaceChildren();}));}
  }
  function clearProtected() {
    ++authVersion;++loadVersion;++backupVersion;unlocked=false;activating=false;identity='';
    ++connectionVersion;connectionState={status:'idle'};connectionProblem='';connectionView=null;
    calendar?.destroy();calendar=null;editor=null;currentRows=[];operation=false;active='home';editors.clear();collectionHost=null;activeCollection='';
    host.replaceChildren();pane=null;status=null;tabBar=null;backupPanel=null;
  }
  function lock(message) {
    clearProtected();renderLogin(message);
  }
  function renderLogin(message) {
    const section=E('section','adm-login');section.setAttribute('aria-labelledby','adm-login-title');
    section.append(E('p','adm-kicker','YAMHA POST OFFICE'),E('h2','adm-title','관리자 로그인'));
    const title=section.querySelector('h2');title.id='adm-login-title';
    section.append(E('p','adm-login-description','등록된 관리자 이메일과 비밀번호로 로그인해 주세요.'));
    const form=E('form','adm-login-form');
    const emailLabel=E('label','adm-label','이메일');emailLabel.htmlFor='adm-login-email';
    const email=E('input','adm-input');email.type='email';email.id='adm-login-email';email.name='email';email.autocomplete='username';email.required=true;
    const passwordLabel=E('label','adm-label','비밀번호');passwordLabel.htmlFor='adm-login-password';
    const password=E('input','adm-input');password.type='password';password.id='adm-login-password';password.name='password';password.autocomplete='current-password';password.required=true;
    const error=E('p','adm-error',message || '');error.id='adm-login-error';error.setAttribute('role','alert');error.hidden=!message;
    const submit=button('로그인','adm-button adm-button-primary');submit.type='submit';submit.disabled=signingOut;
    form.append(emailLabel,email,passwordLabel,password,error,submit);section.append(form);
    const view=E('a','adm-login-view','사이트로 돌아가기');view.href=S.url('index.html');section.append(view);host.replaceChildren(section);
    let busy=false;
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(busy || signingOut || !form.reportValidity())return;
      busy=true;submit.disabled=true;submit.textContent='확인 중…';error.hidden=true;
      const version=authVersion,value=password.value;password.value='';
      try {
        const allowed=await S.signIn(email.value.trim(),value);
        if(version!==authVersion || !form.isConnected)return;
        if(!allowed || !S.isAdmin())throw new Error(S.authState()?.error || '이 계정에는 관리자 권한이 없어요.');
        await activate();
      } catch(problem){if(form.isConnected){error.textContent=errorText(problem);error.hidden=false;}}
      finally {busy=false;password.value='';if(form.isConnected){submit.disabled=false;submit.textContent='로그인';}}
    });
  }
  async function logout() {
    if(signingOut)return;
    if(dirty() && !window.confirm('저장하지 않은 변경이 있어요. 로그아웃할까요?'))return;
    signingOut=true;lock('로그아웃하고 있어요…');
    try {await S.signOut();signingOut=false;lock('로그아웃했어요.');}
    catch(problem){signingOut=false;lock('로그아웃을 완료하지 못했어요. '+errorText(problem));}
  }
  async function activate() {
    if(signingOut || activating || !S.isAdmin())return;
    const user=S.authState()?.user;
    if(unlocked && identity===user?.id)return;
    clearProtected();activating=true;const version=authVersion;
    host.append(E('p','adm-empty','관리자 데이터를 불러오고 있어요…'));
    try {
      await S.refresh();
      if(version!==authVersion || signingOut)return;
      if(!S.isAdmin())throw new Error(S.authState()?.error || '관리자 권한을 확인하지 못했어요.');
      activating=false;unlocked=true;identity=S.authState()?.user?.id || '';buildStudio();
      const firstPage=connectionCallbackPending?'reward':'home';connectionCallbackPending=false;await switchTab(firstPage);
    }catch(problem){if(version===authVersion)lock(errorText(problem));}
  }
  function buildStudio() {
    if(!requireAccess())return;
    host.replaceChildren();
    const top=E('header','adm-header');
    const title=E('div');title.append(E('p','adm-kicker','YAMHA POST OFFICE · ADMIN'),E('h1','adm-title','얌하의 우편 관리실'),E('p','adm-subtitle','마냥단에게 보낼 소식과 약속을 정리하는 곳'));
    const links=E('div','adm-header-actions');
    const view=E('a','adm-button adm-view-link','사이트 보기 ↗');view.href=S.url('index.html');view.target='_blank';view.rel='noopener';
    links.append(view,button('로그아웃','adm-button',logout));top.append(title,links);host.append(top);
    const note=E('aside','adm-server-note');note.append(E('strong','','페이지 선택 → 내용 수정 → 해당 카드 저장'),E('p','','각 카드의 저장 버튼은 그 카드만 저장합니다. 공지·일정·리워드는 등록·수정 저장 후 목록에서 확인하세요.'));
    const account=E('p','adm-account',S.authState()?.user?.email || '관리자');note.append(account);host.append(note);
    const utility=E('div','adm-utility');status=E('p','adm-status');status.setAttribute('aria-live','polite');
    const backupActions=E('div','adm-backup-actions');const importInput=E('input');importInput.type='file';importInput.accept='.json,application/json';importInput.hidden=true;
    importInput.addEventListener('change',()=>{inspectBackup(importInput.files[0]);importInput.value='';});
    backupActions.append(button('JSON 백업','adm-button adm-button-small',exportBackup),button('JSON 복원','adm-button adm-button-small',()=>{if(requireAccess() && !operation && !saving())importInput.click();}),importInput);utility.append(status,backupActions);host.append(utility);
    backupPanel=E('section','adm-backup-panel');backupPanel.hidden=true;host.append(backupPanel);
    tabBar=E('div','adm-tabs');tabBar.setAttribute('role','tablist');tabBar.setAttribute('aria-label','관리 항목');
    Object.entries(tabNames).forEach(([key,label])=>{
      const tab=button(label,'adm-tab',()=>{if(key!==active)switchTab(key);});tab.dataset.tab=key;tab.id='adm-tab-'+key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','adm-panel');tabBar.append(tab);
      tab.addEventListener('keydown',event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const tabs=[...tabBar.children],index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();}});
    });host.append(tabBar);
    pane=E('section','adm-panel');pane.id='adm-panel';pane.setAttribute('role','tabpanel');host.append(pane);
  }
  async function init() {
    host=document.getElementById('page-root');S=window.YamhaSite;UI=window.YamhaUI;C=window.YamhaContent;
    if(!host || !S || !UI || !C)return;
    consumeBroadcasterCallback();
    host.classList.add('adm-root');host.replaceChildren(E('p','adm-empty','로그인 상태를 확인하고 있어요…'));
    await S.ready;await S.authReady;
    if(S.mode!=='supabase' || typeof S.isAdmin!=='function'){host.replaceChildren(E('p','adm-error','서버 연결 설정을 확인해 주세요.'));return;}
    // Auth notifications may occur during an API call. Defer new reads until that call unwinds.
    S.onAuthChange(()=>{
      if(signingOut)return;
      if(!S.isAdmin()){
        if(unlocked || activating)lock(S.authState()?.error || '로그인이 만료되었어요. 다시 로그인해 주세요.');
      }else if(unlocked && identity!==S.authState()?.user?.id)lock('계정이 변경되었어요. 다시 로그인해 주세요.');
    });
    window.addEventListener('beforeunload',event=>{if(unlocked && (dirty() || operation || saving())){event.preventDefault();event.returnValue='';}});
    document.addEventListener('click',event=>{
      const link=event.target.closest('a[href]');if(!unlocked || !link || link.target==='_blank' || link.hasAttribute('download') || event.ctrlKey || event.metaKey)return;
      if((dirty() || operation || saving()) && !canLeave())event.preventDefault();
    });
    if(S.isAdmin())await activate();else renderLogin(S.authState()?.error || S.storageError() || '');
  }
  init().catch(problem=>{const root=document.getElementById('page-root');if(root){calendar?.destroy();root.replaceChildren(E('p','adm-error',problem?.message || '관리 화면을 준비하지 못했어요. 페이지를 새로고침해 주세요.'));}});
})();
