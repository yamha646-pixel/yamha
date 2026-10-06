/* Supabase-backed data contract for the existing Yamha HTML pages. */
(function () {
  'use strict';
  const base = new URL('../', document.currentScript.src);
  const names = ['schedule','news','rewards','photos','debts','guides','timeline','songs'];
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function clean(value) {
    if (Array.isArray(value)) return value.map(clean);
    if (!plain(value)) return value;
    const out = {};
    Object.keys(value).forEach(key => { if (!['__proto__','constructor','prototype'].includes(key)) out[key] = clean(value[key]); });
    return out;
  }
  function merge(a,b) {
    const out = clone(a || {});
    Object.entries(clean(b || {})).forEach(([key,value]) => { out[key] = plain(value) && plain(out[key]) ? merge(out[key],value) : clone(value); });
    return out;
  }
  function defaults() {
    const collections = Object.fromEntries(names.map(name => [name,[]]));
    collections.guides = clone(window.YAMHA_GUIDES_SEED || []);
    return {version:1,profile:{},collections};
  }
  const storage = (() => {
    const memory = new Map(); let enabled = true;
    return {
      getItem(key) { try { if(enabled) { const value=sessionStorage.getItem(key) ?? memory.get(key) ?? null; if(value!==null)memory.set(key,value); return value; } } catch {enabled=false;} return memory.get(key) ?? null; },
      setItem(key,value) { memory.set(key,value); try {if(enabled)sessionStorage.setItem(key,value);} catch {enabled=false;} },
      removeItem(key) { memory.delete(key); try {if(enabled)sessionStorage.removeItem(key);} catch {enabled=false;} }
    };
  })();
  let state=defaults(), connectionError='', authError='', user=null, admin=false, authEpoch=0;
  let db=null, ready=Promise.resolve(), authReady=Promise.resolve(), signInPending=false;
  const authListeners=new Set();
  const emit=()=>window.dispatchEvent(new CustomEvent('yamha-data-change'));
  function authState(){return {user:clone(user),isAdmin:admin,error:authError};}
  function emitAuth(){const value=authState();authListeners.forEach(fn=>{try{fn(value);}catch(error){console.error('Yamha auth listener failed',error);}});}
  function failure(error) {
    if(error?.code==='PGRST205' || error?.code==='PGRST202') return new Error('얌하 초기 설정 SQL이 아직 적용되지 않았어요. SQL 적용 후 다시 불러와 주세요.');
    if(error?.status===400 && /credential/i.test(error?.message||''))return new Error('이메일과 비밀번호를 확인해 주세요.');
    if(['42501','PGRST301'].includes(error?.code)) return new Error('관리자 권한을 확인하지 못했어요. 다시 로그인해 주세요.');
    return new Error('서버에 연결하지 못했어요. 입력은 유지됩니다. 잠시 후 다시 시도해 주세요.');
  }
  function requireClient(){if(!db)throw new Error('Supabase 연결 설정을 확인해 주세요.');return db;}
  function checkName(name){if(!names.includes(name))throw new Error('알 수 없는 목록입니다.');}
  function publicOnly() {
    const next=clone(state);
    names.forEach(name=>{next.collections[name]=name==='photos'?[]:next.collections[name].filter(row=>row.published!==false);});
    state=next;
  }
  function lock(message='') {
    ++authEpoch;admin=false;user=null;authError=message;publicOnly();emitAuth();emit();
  }
  function sameAuthorization(epoch) { if(epoch!==authEpoch || !admin)throw new Error('관리자 로그인이 만료됐어요. 다시 로그인해 주세요.'); }
  async function records(name,privileged=false) {
    const client=requireClient(), rows=[];
    for(let from=0;;from+=500){
      let q=client.from('yamha_records').select('collection,id,data').order('collection').order('id').range(from,from+499);
      if(name)q=q.eq('collection',name);
      if(!privileged)q=q.neq('collection','photos');
      const {data,error}=await q;
      if(error)throw failure(error);
      rows.push(...(data||[]));
      if((data||[]).length<500)break;
    }
    return rows;
  }
  async function loadState(privileged) {
    const client=requireClient(),epoch=authEpoch;
    const [{data:profile,error},rows]=await Promise.all([
      client.from('yamha_profile').select('data').eq('id',1).maybeSingle(),records(null,privileged)
    ]);
    if(error)throw failure(error);
    if(!profile)throw new Error('얌하 기본 자료가 없어요. 초기 설정 SQL을 확인해 주세요.');
    if(epoch!==authEpoch || (privileged&&!admin))return;
    const next={version:1,profile:clean(profile.data||{}),collections:Object.fromEntries(names.map(name=>[name,[]]))};
    rows.forEach(row=>{if(names.includes(row.collection))next.collections[row.collection].push({...clean(row.data),id:row.id});});
    state=next;connectionError='';emit();
  }
  async function verifyAdmin(expectedUser) {
    const client=requireClient(), epoch=authEpoch;
    const {data,error}=await client.auth.getUser();
    if(epoch!==authEpoch)return false;
    if(error || !data?.user || (expectedUser&&expectedUser!==data.user.id)){lock('로그인 상태를 확인하지 못했어요. 다시 로그인해 주세요.');return false;}
    const result=await client.rpc('yamha_is_admin');
    if(epoch!==authEpoch)return false;
    if(result.error || result.data!==true){lock(result.error?failure(result.error).message:'이 계정에는 관리자 권한이 없어요.');return false;}
    const changed=!admin || user?.id!==data.user.id;
    if(changed)++authEpoch;
    user=data.user;admin=true;authError='';
    if(changed)emitAuth();
    return true;
  }
  async function requireAdmin() {
    await authReady;
    if(!admin || !await verifyAdmin(user?.id))throw new Error(authError||'관리자 로그인이 필요해요.');
    return authEpoch;
  }
  async function signIn(email,password) {
    await ready; const client=requireClient();signInPending=true;
    lock();
    try {
      const result=await client.auth.signInWithPassword({email:email.trim(),password});
      if(result.error)throw failure(result.error);
      if(!await verifyAdmin(result.data?.user?.id)){
        const reason=authError;
        await client.auth.signOut({scope:'local'});
        throw new Error(reason||'관리자 권한을 확인해 주세요.');
      }
      await loadState(true);return true;
    }catch(error){lock(error.message);throw error;}
    finally{signInPending=false;}
  }
  async function signOut() {
    lock();
    const client=requireClient();
    const {error}=await client.auth.signOut({scope:'global'});
    if(error){await client.auth.signOut({scope:'local'});throw new Error('이 화면에서는 로그아웃했지만 다른 기기의 세션 종료를 확인하지 못했어요.');}
  }
  function validateBackup(input) {
    const value=clean(input);
    if(!plain(value)||value.version!==1||!plain(value.profile)||!plain(value.collections))throw new Error('얌하 사이트의 JSON 백업 파일을 선택해 주세요.');
    if(Object.keys(input.collections).some(name=>!names.includes(name)))throw new Error('지원하지 않는 목록이 포함된 백업이에요. 원본 파일을 보관하고 백업 형식을 확인해 주세요.');
    for(const name of names){
      if(!Array.isArray(value.collections[name]))throw new Error(name+' 목록이 누락된 백업입니다.');
      const ids=new Set();
      for(const row of value.collections[name]){if(!plain(row)||typeof row.id!=='string'||!row.id||ids.has(row.id))throw new Error(name+'의 ID를 확인해 주세요.');ids.add(row.id);}
    }
    return {version:1,profile:value.profile,collections:Object.fromEntries(names.map(name=>[name,value.collections[name]]))};
  }
  const S=window.YamhaSite={
    mode:'supabase',url:path=>new URL(path,base).href,
    profile:()=>merge(window.YAMHA_DATA||{},state.profile),
    isAdmin:()=>admin,authState,signIn,signOut,
    getAccessToken:async()=>{
      const epoch=await requireAdmin();
      const {data,error}=await requireClient().auth.getSession();
      sameAuthorization(epoch);
      if(error||!data?.session?.access_token)throw new Error('관리자 로그인을 다시 확인해 주세요.');
      return data.session.access_token;
    },
    onAuthChange:fn=>{authListeners.add(fn);return()=>authListeners.delete(fn);},
    storageError:()=>connectionError,
    onChange:fn=>{window.addEventListener('yamha-data-change',fn);return()=>window.removeEventListener('yamha-data-change',fn);},
    refresh:async()=>{await ready;try{await loadState(admin);}catch(error){connectionError=error.message;throw error;}},
    list:async name=>{
      checkName(name);await ready;
      if(name==='photos'&&!admin)return [];
      const epoch=authEpoch, privileged=admin;
      const rows=await records(name,privileged);
      if(epoch!==authEpoch){if(name==='photos')return [];return rows.filter(row=>row.data?.published!==false).map(row=>({...clean(row.data),id:row.id}));}
      const result=rows.map(row=>({...clean(row.data),id:row.id}));
      state.collections[name]=result;return clone(result);
    },
    saveProfile:async patch=>{
      if(!plain(patch))throw new Error('프로필 입력을 확인해 주세요.');
      const epoch=await requireAdmin();
      const {data,error}=await requireClient().rpc('yamha_save_profile',{p_patch:clean(patch)});
      sameAuthorization(epoch);if(error)throw failure(error);
      if(!plain(data))throw new Error('저장 결과를 확인하지 못했어요.');
      state.profile=clean(data);emit();return S.profile();
    },
    upsert:async(name,row)=>{
      checkName(name);if(!plain(row))throw new Error('입력 내용을 확인해 주세요.');
      const epoch=await requireAdmin();
      const id=row.id||crypto.randomUUID();
      const {data,error}=await requireClient().rpc('yamha_save_record',{p_collection:name,p_id:String(id),p_patch:clean(row)});
      sameAuthorization(epoch);if(error)throw failure(error);
      if(!plain(data)||String(data.id)!==String(id))throw new Error('저장 결과를 확인하지 못했어요.');
      const rows=state.collections[name],index=rows.findIndex(item=>item.id===data.id);
      if(index>=0)rows[index]=clean(data);else rows.push(clean(data));
      emit();return clone(data);
    },
    remove:async(name,id)=>{
      checkName(name);const epoch=await requireAdmin();
      const {data,error}=await requireClient().from('yamha_records').delete().eq('collection',name).eq('id',String(id)).select('id');
      sameAuthorization(epoch);if(error)throw failure(error);
      if(data?.length!==1||data[0].id!==String(id))throw new Error('삭제할 항목이 없거나 관리자 권한이 만료됐어요.');
      state.collections[name]=state.collections[name].filter(row=>row.id!==String(id));emit();
    },
    exportData:async()=>{const epoch=await requireAdmin();await loadState(true);sameAuthorization(epoch);return {...clone(state),exported_at:new Date().toISOString()};},
    importData:async input=>{
      const backup=validateBackup(input),epoch=await requireAdmin();
      const {data,error}=await requireClient().rpc('yamha_import_backup',{p_backup:backup});
      sameAuthorization(epoch);if(error)throw failure(error);
      if(data!==true)throw new Error('백업 복원 결과를 확인하지 못했어요.');
      await loadState(true);sameAuthorization(epoch);
    }
  };
  try {
    const config=window.YAMHA_SUPABASE;
    if(!config?.url||!config?.anonKey||!window.supabase?.createClient)throw new Error('Supabase 연결 파일을 불러오지 못했어요.');
    db=window.supabase.createClient(config.url,config.anonKey,{auth:{storage,storageKey:'yamha-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    ready=loadState(false).catch(error=>{connectionError=error.message;});
    authReady=ready.then(async()=>{
      const {data,error}=await db.auth.getSession();
      if(error){lock('로그인 상태를 읽지 못했어요. 다시 로그인해 주세요.');return;}
      if(data?.session&&await verifyAdmin(data.session.user?.id))await loadState(true);
    }).catch(error=>lock(error.message));
    db.auth.onAuthStateChange((event)=>{
      if(event==='SIGNED_OUT'){lock();return;}
      if(!['SIGNED_IN','TOKEN_REFRESHED','USER_UPDATED'].includes(event)||signInPending)return;
      setTimeout(async()=>{if(signInPending)return;try{const wasAdmin=admin;if(await verifyAdmin()&&!wasAdmin)await loadState(true);}catch(error){lock(error.message);}},0);
    });
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&admin)verifyAdmin(user?.id).catch(()=>lock('로그인 상태를 확인하지 못했어요.'));});
  }catch(error){connectionError=error.message;authError=error.message;}
  S.ready=ready;S.authReady=authReady;
})();
