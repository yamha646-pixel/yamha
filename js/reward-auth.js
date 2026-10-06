/* Same-origin viewer session. No CHZZK token, service key or session token is exposed to JS. */
(function(){
  'use strict';
  const base='/api/reward/';
  const listeners=new Set();
  let current={configured:false,user:null,loading:true},epoch=0;
  const publish=()=>listeners.forEach(fn=>fn({...current}));
  function failure(code){const error=new Error(code);error.code=code;return error;}
  async function call(path,init){
    let response;try{response=await fetch(base+path,{credentials:'same-origin',cache:'no-store',...init});}catch{throw failure('service_unavailable');}
    let data;try{data=await response.json();}catch{throw failure('setup_required');}
    if(!response.ok)throw failure(data?.error||'service_unavailable');
    return data;
  }
  async function refresh(){
    const turn=++epoch;current={...current,loading:true};publish();
    try{const data=await call('session');if(turn===epoch){current={...data,loading:false};publish();}return {...current};}
    catch(error){if(turn===epoch){current={configured:error.code!=='setup_required',user:null,loading:false,error:error.code};publish();}return {...current};}
  }
  async function login(){
    const state=await refresh();if(!state.configured||state.error)throw failure(state.error||'setup_required');
    location.assign(base+'auth/start');
  }
  async function logout(){
    ++epoch;await call('logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    current={configured:true,user:null,loading:false};publish();
  }
  async function paged(path){
    const turn=epoch,items=[];let offset=0;
    for(let page=0;page<2000;page++){
      const data=await call(path+'?offset='+offset);if(turn!==epoch)throw failure('session_changed');
      if(!Array.isArray(data.items))throw failure('service_unavailable');items.push(...data.items);
      if(data.nextOffset===null)return items;
      if(!Number.isSafeInteger(data.nextOffset)||data.nextOffset<=offset)throw failure('service_unavailable');offset=data.nextOffset;
    }
    throw failure('service_unavailable');
  }
  async function download(collection,id){
    const turn=epoch;
    const data=await call('download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({collection,id})});
    if(turn!==epoch)throw failure('session_changed');
    const url=new URL(data.url);const expected=window.YAMHA_SUPABASE?.url;
    if(!expected||url.origin!==new URL(expected).origin||!url.pathname.startsWith('/storage/v1/object/sign/yamha-private-rewards/'))throw failure('file_unavailable');
    return data.url;
  }
  async function connectBroadcaster(accessToken){
    const data=await call('admin/connect',{method:'POST',headers:{'Authorization':'Bearer '+accessToken,'Content-Type':'application/json'},body:'{}'});
    const url=new URL(data.authorizationUrl);
    if(url.origin!=='https://chzzk.naver.com'||url.pathname!=='/account-interlock')throw failure('service_unavailable');
    location.assign(url.href);
  }
  async function uploadPrivate(file,accessToken){
    const form=new FormData();form.append('file',file);
    return call('admin/upload',{method:'POST',headers:{Authorization:'Bearer '+accessToken},body:form});
  }
  const photos=()=>paged('photos'),receipts=()=>paged('receipts');
  window.YamhaRewardAuth={refresh,login,logout,photos,download,receipts,connectBroadcaster,uploadPrivate,
    state:()=>({...current}),onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
})();
