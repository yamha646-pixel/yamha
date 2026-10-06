/* Server-backed editing. YamhaSite verifies identity; database policies enforce access. */
(function () {
  'use strict';
  if (document.body.dataset.page !== 'admin') return;
  const collections = ['schedule', 'news', 'rewards', 'photos', 'debts', 'guides', 'timeline'];
  const tabNames = {profile:'프로필', schedule:'일정', news:'공지', rewards:'리워드', photos:'방셀', debts:'업보', guides:'안내', timeline:'타임라인'};
  const colors = ['pink', 'green', 'lime', 'blue', 'yellow', 'orange', 'purple', 'red', 'gray', 'cream'];
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
      fields:[{key:'title',label:'공지 제목',required:true,wide:true}, {key:'category',label:'분류',type:'select',options:[['NOTICE','공지'],['CONTENTS','콘텐츠'],['EVENT','이벤트']]},
        {key:'published_at',label:'표시 날짜 · 한국 시간',type:'datetime-local',required:true}, {key:'body',label:'공지 내용',type:'textarea',required:true,wide:true,rows:8},
        {key:'images',label:'이미지 주소',type:'images',wide:true,hint:'한 줄에 이미지 주소 하나씩 입력해 주세요.'},
        {key:'pinned',label:'상단에 고정',type:'checkbox'}, {key:'published',label:'공개 목록에 표시',type:'checkbox'}],
      title:row=>row.title, meta:row=>[row.category, row.pinned?'상단 고정':'',row.published===false?'비공개':'공개',displayDate(row.published_at)].filter(Boolean).join(' · ')
    },
    rewards: {
      singular:'리워드', description:'1티어·2티어 혜택과 필요한 구독 개월 수를 편집해요.',
      defaults:() => ({tier:1,required_months:1,sort_order:0,published:true}),
      fields:[{key:'title',label:'리워드 이름',required:true,wide:true}, {key:'tier',label:'구독 티어',type:'select',number:true,options:[['1','1티어'],['2','2티어']]},
        {key:'required_months',label:'필요 구독 개월 수',type:'number',min:1,required:true}, {key:'description',label:'혜택 설명',type:'textarea',wide:true,required:true},
        {key:'preview_url',label:'미리보기 이미지 주소',type:'image',wide:true}, {key:'sort_order',label:'표시 순서',type:'number',min:0,hint:'작은 숫자부터 표시돼요.'},
        {key:'published',label:'공개 목록에 표시',type:'checkbox'}],
      title:row=>row.title, meta:row=>`${row.tier}티어 · ${row.required_months}개월 · ${row.published===false?'비공개':'공개'}`
    },
    photos: {
      singular:'방셀', description:'지금은 방셀 제목·태그와 공개 미리보기만 편집해요. 구독 인증과 개인 방셀 조회는 추후 연결됩니다.',
      defaults:()=>({tags:[],published_at:new Date().toISOString()}),
      fields:[{key:'title',label:'방셀 제목',required:true,wide:true}, {key:'tags',label:'태그',type:'tags',wide:true,hint:'쉼표 또는 줄바꿈으로 구분해 주세요.'},
        {key:'preview_url',label:'공개 미리보기 이미지 주소',type:'image',wide:true}, {key:'recipient_channel_id',label:'받는 분의 채널 ID',hint:'연결 전에는 메모용으로만 보관돼요.'},
        {key:'published_at',label:'표시 날짜 · 한국 시간',type:'datetime-local',required:true}],
      title:row=>row.title, meta:row=>[displayDate(row.published_at), ...(Array.isArray(row.tags)?row.tags:[])].filter(Boolean).join(' · ')
    },
    debts: {
      singular:'업보', description:'닉네임별 약속과 남은 수량을 적고, 완료 상태를 관리해요.',
      defaults:()=>({count:1,unit:'회',status:'pending',updated_at:new Date().toISOString()}),
      fields:[{key:'nickname',label:'닉네임',required:true}, {key:'label',label:'업보 이름',required:true}, {key:'count',label:'남은 수량',type:'number',min:0,required:true},
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
        {key:'images',label:'안내 이미지 주소',type:'images',wide:true,hint:'한 줄에 이미지 주소 하나씩 입력해 주세요.'}],
      title:row=>row.title, meta:row=>[({chat:'방송 채팅',fan:'팬카페',creation:'2차 창작'})[row.id]||row.id,displayDate(row.updated_at)].join(' · ')
    }
  };
  let S, UI, host, pane, status, tabBar, backupPanel;
  let active = 'profile', editor = null, calendar = null, currentRows = [], operation = false, loadVersion = 0;
  let authVersion=0, backupVersion=0, unlocked=false, identity='', activating=false, signingOut=false;
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
    return JSON.stringify([...form.elements].filter(node=>node.name).map(node=>[node.name,node.type==='checkbox'?node.checked:node.value]));
  }
  function dirty() { return !!(editor && editor.initial!==formSnapshot(editor.form)); }
  function sessionCurrent(version) { return version===authVersion && unlocked && S.isAdmin(); }
  function requireAccess() {
    if(unlocked && S.isAdmin())return true;
    if(unlocked)lock(S.authState()?.error || '관리자 권한을 다시 확인해 주세요.');
    return false;
  }
  function updateStatus() {
    if(status) status.textContent = operation || editor?.busy ? '저장 결과를 확인하고 있어요…' : dirty() ? '● 저장하지 않은 변경이 있어요' : '서버에 저장된 내용을 편집 중이에요';
    status?.classList.toggle('adm-status-dirty',dirty());
  }
  function canLeave() {
    if(!requireAccess())return false;
    if(operation || editor?.busy) { UI.toast('저장 결과를 확인한 뒤 다시 눌러 주세요.'); return false; }
    return !dirty() || window.confirm('저장하지 않은 변경이 있어요. 변경을 버리고 이동할까요?');
  }
  function safeURL(value,image) { return value ? UI.safeUrl(String(value).trim(),{image:!!image}) : null; }
  function resolveImage(value) { return safeURL(value,true); }
  function markError(message, node) {
    if(editor) { editor.error.textContent=message;editor.error.hidden=false; }
    if(node)node.focus();
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
    if(spec.type==='checkbox')input.checked=Boolean(value);
    else if(spec.type==='datetime-local')input.value=localDateTime(value);
    else if(['images','tags'].includes(spec.type))input.value=Array.isArray(value)?value.join('\n'):(value || '');
    else input.value=value==null?'':String(value);
    if(spec.required)input.required=true;
    if(spec.min!==undefined){input.min=String(spec.min);input.step='1';}
    if(spec.placeholder)input.placeholder=spec.placeholder;
    if(locked)input.disabled=true;
    if(['url','image'].includes(spec.type)){input.inputMode='url';input.autocomplete='url';}
    if(spec.type==='colorname') {
      const list=E('datalist');list.id=id+'-colors';colors.forEach(color=>{const option=E('option');option.value=color;list.append(option);});
      input.setAttribute('list',list.id);wrapper.append(list);
    }
    if(spec.type==='checkbox'){label.prepend(input);wrapper.append(label);} else wrapper.append(label,input);
    let hint=spec.hint || (spec.type==='colorname'?'pink / green / blue 또는 #색상코드':'');
    if(hint){const note=E('small','adm-field-hint',hint);note.id=id+'-hint';input.setAttribute('aria-describedby',note.id);wrapper.append(note);}
    if(spec.type==='image' || spec.type==='images')addPreview(input,wrapper,spec.type==='images');
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
    if(spec.type==='checkbox')return input.checked;
    const value=input.value.trim();
    if(spec.type==='number' || spec.number)return value===''?0:Number(value);
    if(spec.type==='images')return unique(lines(value));
    if(spec.type==='tags')return unique(value.split(/[,\n]/).map(part=>part.trim()).filter(Boolean));
    if(spec.type==='datetime-local')return value?new Date(value+':00+09:00').toISOString():null;
    if(spec.key==='end_date')return value || null;
    return value;
  }
  function validateFields(form,fields) {
    if(!form.reportValidity())return false;
    for(const spec of fields) {
      const input=form.elements.namedItem(spec.key),value=input.value.trim();
      let error='';
      if(spec.required && spec.type!=='checkbox' && !value)error=spec.label+'을(를) 입력해 주세요.';
      if(spec.type==='number' && (!Number.isSafeInteger(Number(value)) || Number(value)<(spec.min || 0)))error=spec.label+'은(는) '+(spec.min || 0)+' 이상의 정수로 입력해 주세요.';
      if(['url','image'].includes(spec.type) && value && (!safeURL(value,spec.type==='image') || (spec.type==='url' && !/^https?:\/\//i.test(value))))error='사용할 수 있는 주소를 입력해 주세요. 웹 주소는 https://로 시작해요.';
      if(spec.type==='images' && lines(value).some(url=>!safeURL(url,true)))error='이미지 주소 중 사용할 수 없는 주소가 있어요. 한 줄에 주소 하나씩 확인해 주세요.';
      if(spec.type==='colorname' && value && !colors.includes(value) && !/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value) && editor.startValues[spec.key]!==input.value)error='색상 이름 또는 #aabbcc 형식의 색상코드를 입력해 주세요.';
      if(error){markError(error,input);return false;}
    }
    return true;
  }
  function createEditor(title,fields,row,submit,settings) {
    settings=settings || {};
    const card=E('section','adm-editor');
    const head=E('div','adm-editor-heading');head.append(E('span','adm-kicker',settings.existing?'EDIT LETTER':'NEW LETTER'),E('h2','adm-section-title',title));card.append(head);
    const form=E('form','adm-form');form.noValidate=true;
    const fieldset=E('fieldset','adm-fields');
    const startValues={};
    if(settings.groups) {
      settings.groups.forEach(group=>{
        const groupWrap=E('section','adm-field-group');groupWrap.append(E('h3','adm-group-title',group.title));
        const grid=E('div','adm-field-grid');group.fields.forEach(spec=>addField(form,grid,spec,get(row,spec.key)));groupWrap.append(grid);fieldset.append(groupWrap);
      });
    } else {
      const grid=E('div','adm-field-grid');fields.forEach(spec=>addField(form,grid,spec,row[spec.key],settings.existing && spec.key==='id'));fieldset.append(grid);
    }
    form.append(fieldset);
    const error=E('p','adm-error');error.setAttribute('role','alert');error.hidden=true;form.append(error);
    const actions=E('div','adm-form-actions');
    const save=button(settings.existing?'수정 저장':'등록하기','adm-button adm-button-primary');save.type='submit';
    const cancel=button(settings.cancelLabel || '작성 취소','adm-button',()=>{if(canLeave())settings.cancel?.();});
    actions.append(save,cancel);form.append(actions);card.append(form);
    const state={form,fieldset,error,save,cancel,busy:false,row,fields,startValues,existing:!!settings.existing,initial:''};
    [...form.elements].filter(input=>input.name).forEach(input=>startValues[input.name]=input.type==='checkbox'?input.checked:input.value);
    state.initial=formSnapshot(form);editor=state;
    form.addEventListener('input',updateStatus);form.addEventListener('change',updateStatus);
    form.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();if(canLeave())settings.cancel?.();}});
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!requireAccess() || editor!==state || state.busy || operation)return;
      error.hidden=true;error.textContent='';
      if(!validateFields(form,fields))return;
      const version=authVersion;
      try { await submit(state); } catch(problem) {if(sessionCurrent(version) && editor===state)markError(errorText(problem));else requireAccess();}
    });
    return card;
  }
  function setBusy(state,value) {
    if(!unlocked || !state.form.isConnected)return;
    state.busy=value;state.fieldset.disabled=value;state.save.disabled=value;state.cancel.disabled=value;
    state.save.textContent=value?'저장 중…':state.existing?'수정 저장':'등록하기';updateStatus();
  }
  function collect(state,onlyChanged) {
    const data={};
    state.fields.forEach(spec=>{
      const input=state.form.elements.namedItem(spec.key),raw=spec.type==='checkbox'?input.checked:input.value;
      if(!onlyChanged || state.startValues[spec.key]!==raw)data[spec.key]=readField(state.form,spec);
    });
    return data;
  }

  function profileGroups(profile) {
    const groups=[
      {title:'기본 프로필',fields:[{key:'brandImage',label:'왼쪽 위 프로필 사진',type:'image',required:true,wide:true},{key:'name',label:'활동 이름',required:true},{key:'englishName',label:'영문 이름'}, {key:'bio',label:'한 줄 소개',wide:true},
        {key:'fanName',label:'팬 이름'},{key:'birthday',label:'생일',placeholder:'예: 04.06'},{key:'debutDate',label:'데뷔 날짜',type:'date'},{key:'agency',label:'소속'},
        {key:'gender',label:'성별'},{key:'intro',label:'자세한 소개',type:'textarea',wide:true},{key:'personality',label:'성격'},{key:'catchphrase',label:'말버릇'}]},
      {title:'방송과 취향',fields:[{key:'broadcast.time',label:'방송 시간'},{key:'broadcast.restDays',label:'정기 휴방'},
        {key:'broadcast.categories',label:'주요 콘텐츠',type:'tags'},{key:'interests',label:'좋아하는 것',type:'tags'},
        {key:'dislikes',label:'싫어하는 것',type:'tags'},{key:'games',label:'즐기는 게임'},{key:'genres',label:'노래 장르',type:'tags'},{key:'signatureSong',label:'대표곡'},{key:'sing',label:'노래 방송 빈도'}]},
      {title:'요일별 방송 안내',fields:['월','화','수','목','금','토','일'].map((day,index)=>({key:`broadcast.week.${index}`,label:day+'요일',required:true,placeholder:'오전 / 오후 8시 / 휴방',hint:index===0?'일정이 없으면 휴방, 미정이면 미정이라고 적어 주세요.':undefined}))},
      {title:'채널과 바로가기',fields:[{key:'links.channel',label:'방송 채널 주소',type:'url',wide:true},{key:'links.cafe',label:'팬카페 주소',type:'url',wide:true},
        {key:'links.youtube',label:'YouTube 주소',type:'url',wide:true},{key:'links.x',label:'X 주소',type:'url',wide:true},
        {key:'links.songbook',label:'노래책 주소',type:'url',wide:true},{key:'links.store',label:'STORE · 굿즈 스토어 주소',type:'url',wide:true,hint:'메인과 메뉴의 STORE 바로가기에 반영돼요. 준비 중이면 비워 두세요.'}]}
    ];
    const photos=Array.isArray(profile.photos)?profile.photos:[];
    if(photos.length)groups.push({title:'메인 사진',fields:photos.flatMap((photo,index)=>[
      {key:`photos.${index}.src`,label:`사진 ${index+1} 이미지 주소`,type:'image',wide:true},
      {key:`photos.${index}.alt`,label:`사진 ${index+1} 설명`,wide:true}
    ])});
    return groups;
  }
  function setPath(object,path,value) {
    const parts=path.split('.');let target=object;
    parts.slice(0,-1).forEach((part,index)=>{
      if(target[part]==null || typeof target[part]!=='object')target[part]=/^\d+$/.test(parts[index+1])?[]:{};
      target=target[part];
    });target[parts[parts.length-1]]=value;
  }
  function renderProfile() {
    if(!requireAccess())return;
    const profile=S.profile();
    profile.broadcast={...(profile.broadcast || {})};
    if(!Array.isArray(profile.broadcast.week))profile.broadcast.week=['오전','휴방','휴방','오전','오전','오전','오전'];
    const groups=profileGroups(profile),fields=groups.flatMap(group=>group.fields);
    pane.replaceChildren(E('p','adm-panel-description','프로필, 원본 사진, 채널 주소와 STORE 바로가기를 한곳에서 편집해요.'));
    const card=createEditor('프로필 편집',fields,profile,async state=>{
      const changes=collect(state,true);if(!Object.keys(changes).length){UI.toast('변경한 내용이 없어요.');return;}
      const current=S.profile(),patch={};
      Object.entries(changes).forEach(([path,value])=>{
        const key=path.split('.')[0];
        if(path.includes('.') && !Object.hasOwn(patch,key))patch[key]=JSON.parse(JSON.stringify(current[key] || (key==='photos'?[]:{})));
        if(path.startsWith('broadcast.week.') && !Array.isArray(patch.broadcast.week))patch.broadcast.week=profile.broadcast.week.slice();
        setPath(patch,path,value);
      });
      const version=authVersion;setBusy(state,true);
      try { await S.saveProfile(patch);if(!sessionCurrent(version))return;renderProfile();UI.toast('프로필을 서버에 저장했어요.'); }
      catch(problem){if(sessionCurrent(version) && editor===state)markError(errorText(problem));else requireAccess();}
      finally {if(sessionCurrent(version))setBusy(state,false);}
    },{groups,existing:true,cancelLabel:'변경 되돌리기',cancel:renderProfile});
    pane.append(card);editor.save.textContent='프로필 저장';updateStatus();
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
      if(!filtered.length){list.append(E('p','adm-empty',query?'검색 결과가 없어요.':'첫 '+config.singular+'을 등록해 주세요.'));return;}
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
    calendar?.destroy();calendar=null;editor=null;pane.replaceChildren();currentRows=rows;
    const config=configs[name];
    const allGuides=name==='guides' && ['chat','fan','creation'].every(id=>rows.some(row=>row.id===id));
    if(allGuides && !selectedRow)selectedRow=rows.find(row=>row.id==='chat');
    const add=button(allGuides?'안내 3종 등록됨':'+ '+config.singular+' 등록','adm-button adm-button-new',()=>openEditor(name,null));
    add.disabled=allGuides;
    const actions=E('div','adm-panel-actions');
    if(name==='rewards' || name==='photos') {
      const preview=E('a','adm-button adm-button-small',name==='photos'?'방셀 화면 미리보기 ↗':'리워드 화면 미리보기 ↗');
      preview.href=S.url(name==='photos'?'reward/index.html?tab=photos&preview=1':'reward/index.html?preview=1');
      preview.target='_blank';preview.rel='noopener';actions.append(preview);
    }
    actions.append(add);
    const intro=E('div','adm-panel-intro');intro.append(E('p','adm-panel-description',config.description),actions);
    pane.append(intro);
    if(name==='schedule') {
      const wrap=E('section','adm-calendar');pane.append(wrap);
      calendar=window.YamhaCalendar.mount(wrap,{editable:true,events:rows,date:date || selectedRow?.date || undefined,
        onDate:date=>openEditor(name,null,date),onEvent:row=>openEditor(name,row)});
    }
    const workspace=E('div','adm-workspace');const editorHost=E('div','adm-editor-host');editorHost.id='adm-editor-host';workspace.append(editorHost);pane.append(workspace);
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
        renderCollection(name,nextRows,null,visibleDate);UI.toast(config.singular+'을 서버에 저장했어요.');
      } catch(problem) {if(sessionCurrent(version) && editor===state)markError(saved?'서버에는 저장되었지만 목록에서 다시 확인하지 못했어요. 입력을 유지했으니 연결 상태를 확인해 주세요.':errorText(problem));else requireAccess();}
      finally {if(sessionCurrent(version))setBusy(state,false);}
    },{existing:!!row,cancel:()=>{const complete=name==='guides' && ['chat','fan','creation'].every(id=>currentRows.some(item=>item.id===id));buildCollectionEditor(name,complete?currentRows.find(item=>item.id==='chat'):null);refreshList(name);updateStatus();}});
    document.getElementById('adm-editor-host').replaceChildren(card);
    if(name==='schedule') {
      const start=editor.form.elements.namedItem('date'),end=editor.form.elements.namedItem('end_date');
      end.min=start.value;start.addEventListener('change',()=>{end.min=start.value;});
    }
  }
  function refreshList(name) {
    if(!requireAccess())return;
    const list=pane.querySelector('.adm-records');if(list)list.replaceWith(listPanel(name,currentRows));
  }
  function openEditor(name,row,date) {
    if(!canLeave())return;
    buildCollectionEditor(name,row,date);refreshList(name);updateStatus();
    const first=editor.form.querySelector('input:not([disabled]),select:not([disabled]),textarea');
    document.getElementById('adm-editor-host').scrollIntoView({block:'start',behavior:'auto'});
    first?.focus({preventScroll:true});
  }
  async function deleteRow(name,row) {
    if(!canLeave())return;
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
      if(name==='profile')renderProfile();
      else {const rows=await S.list(name);if(version!==loadVersion || !sessionCurrent(session))return;renderCollection(name,Array.isArray(rows)?rows:[]);}
    } catch(problem){if(version===loadVersion && sessionCurrent(session))pane.replaceChildren(E('p','adm-error',errorText(problem)),button('다시 불러오기','adm-button',()=>switchTab(name)));else requireAccess();}
    if(sessionCurrent(session))updateStatus();
  }

  async function exportBackup() {
    if(!requireAccess() || operation || editor?.busy)return;
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
    if(!file || !requireAccess() || operation || editor?.busy)return;
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
      collections.forEach(key=>summary.append(E('span','adm-backup-chip',tabNames[key]+' '+(Array.isArray(lists[key])?lists[key].length:0)+'개')));
      if(Array.isArray(lists.songs))summary.append(E('span','adm-backup-chip','노래 '+lists.songs.length+'개'));
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
    calendar?.destroy();calendar=null;editor=null;currentRows=[];operation=false;active='profile';
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
      activating=false;unlocked=true;identity=S.authState()?.user?.id || '';buildStudio();await switchTab('profile');
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
    const note=E('aside','adm-server-note');note.append(E('strong','','서버에 저장한 내용이 사이트에 반영돼요.'),E('p','','관리자 계정으로 로그인한 상태에서만 저장·삭제·백업 복원을 할 수 있어요.'));
    const account=E('p','adm-account',S.authState()?.user?.email || '관리자');note.append(account);host.append(note);
    const utility=E('div','adm-utility');status=E('p','adm-status');status.setAttribute('aria-live','polite');
    const backupActions=E('div','adm-backup-actions');const importInput=E('input');importInput.type='file';importInput.accept='.json,application/json';importInput.hidden=true;
    importInput.addEventListener('change',()=>{inspectBackup(importInput.files[0]);importInput.value='';});
    backupActions.append(button('JSON 백업','adm-button adm-button-small',exportBackup),button('JSON 복원','adm-button adm-button-small',()=>{if(requireAccess() && !operation && !editor?.busy)importInput.click();}),importInput);utility.append(status,backupActions);host.append(utility);
    backupPanel=E('section','adm-backup-panel');backupPanel.hidden=true;host.append(backupPanel);
    tabBar=E('div','adm-tabs');tabBar.setAttribute('role','tablist');tabBar.setAttribute('aria-label','관리 항목');
    Object.entries(tabNames).forEach(([key,label])=>{
      const tab=button(label,'adm-tab',()=>{if(key!==active)switchTab(key);});tab.dataset.tab=key;tab.id='adm-tab-'+key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','adm-panel');tabBar.append(tab);
      tab.addEventListener('keydown',event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const tabs=[...tabBar.children],index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();}});
    });host.append(tabBar);
    pane=E('section','adm-panel');pane.id='adm-panel';pane.setAttribute('role','tabpanel');host.append(pane);
  }
  async function init() {
    host=document.getElementById('page-root');S=window.YamhaSite;UI=window.YamhaUI;
    if(!host || !S || !UI)return;
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
    window.addEventListener('beforeunload',event=>{if(unlocked && (dirty() || operation || editor?.busy)){event.preventDefault();event.returnValue='';}});
    document.addEventListener('click',event=>{
      const link=event.target.closest('a[href]');if(!unlocked || !link || link.target==='_blank' || link.hasAttribute('download') || event.ctrlKey || event.metaKey)return;
      if((dirty() || operation || editor?.busy) && !canLeave())event.preventDefault();
    });
    if(S.isAdmin())await activate();else renderLogin(S.authState()?.error || S.storageError() || '');
  }
  init().catch(problem=>{const root=document.getElementById('page-root');if(root){calendar?.destroy();root.replaceChildren(E('p','adm-error',problem?.message || '관리 화면을 준비하지 못했어요. 페이지를 새로고침해 주세요.'));}});
})();
