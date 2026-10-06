/* Same-origin viewer session. No CHZZK token, service key or session token is exposed to JS. */
(function(){
  'use strict';
  const base='/api/reward/';
  const listeners=new Set();
  let current={configured:false,user:null,loading:true},epoch=0;
  const publish=()=>listeners.forEach(fn=>fn({...current}));
  const errorMessages={
    admin_required:'관리자 로그인이 필요해요. 다시 로그인한 뒤 연결해 주세요.',
    admin_forbidden:'이 계정에는 관리자 권한이 없어요. 지정된 관리자 계정으로 로그인해 주세요.',
    admin_auth_failed:'서버에서 관리자 로그인을 확인하지 못했어요. 다시 로그인해도 계속되면 Cloudflare의 Supabase 연결 설정을 확인해 주세요.',
    admin_check_failed:'서버에서 관리자 권한을 조회하지 못했어요. Supabase 연결 설정과 관리자 권한 함수를 확인해 주세요.',
    setup_required:'치지직 연결 설정이 아직 완료되지 않았어요. Cloudflare 환경변수와 재배포 상태를 확인해 주세요.',
    storage_unavailable:'저장 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',
    service_unavailable:'연결 서버에 응답이 없어요. 잠시 후 다시 시도해 주세요.',
    chzzk_unavailable:'치지직에서 방송인 연결과 구독 조회를 확인하지 못했어요. 연결 상태를 다시 확인해 주세요.',
    subscription_permission_required:'치지직 구독 조회 권한이 확인되지 않았어요. 애플리케이션 권한을 확인한 뒤 얌하 계정으로 다시 연결해 주세요.',
    connection_save_failed:'치지직 인증 후 연결 정보 저장을 확인하지 못했어요. 연결 상태를 확인한 뒤 다시 연결해 주세요.',
    broadcaster_reconnect_required:'저장된 방송인 연결을 다시 인증해야 해요. 얌하 계정으로 방송인 연결을 다시 진행해 주세요.',
    subscription_retry:'연결 정보를 갱신 중이에요. 잠시 후 연결 상태를 다시 확인해 주세요.',
    broadcaster_status_invalid:'서버의 연결 상태 응답을 확인하지 못했어요. 최신 서버 배포와 연결 설정을 확인해 주세요.',
    wrong_origin:'현재 접속 주소와 연결 설정의 사이트 주소가 달라요. 등록된 사이트에서 다시 시도해 주세요.',
    csrf_rejected:'요청을 확인하지 못했어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.',
    upload_rejected:'첨부파일을 확인해 주세요. 이미지·ZIP·APK 파일을 업로드할 수 있어요.',
    unsupported_file_type:'지원하지 않거나 확장자와 내용이 다른 파일이에요. PNG, JPG, WebP, GIF, ZIP, APK 파일을 선택해 주세요.',
    invalid_archive:'압축파일을 확인하지 못했어요. 정상적인 ZIP 파일 또는 Android 설치용 APK 파일을 선택해 주세요.',
    file_required:'업로드할 파일을 선택해 주세요. 빈 파일은 올릴 수 없어요.',
    file_too_large:'15MiB 이하의 파일을 선택해 주세요.',
    file_upload_failed:'파일을 업로드하지 못했어요. 잠시 후 다시 시도해 주세요.',
    image_type_required:'이미지·ZIP·APK 파일을 선택해 주세요. 이 파일이 지원 형식인데도 실패하면 최신 서버 배포를 확인해 주세요.',
    file_unavailable:'파일을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
    session_changed:'로그인 상태가 바뀌었어요. 다시 시도해 주세요.'
  };
  function failure(code){const error=new Error(errorMessages[code]||'요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.');error.code=code;return error;}
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
  async function broadcasterStatus(accessToken){
    const data=await call('admin/status',{headers:{Authorization:'Bearer '+accessToken}});
    if(data?.configured!==true||!['connected','not_connected','reconnect_required'].includes(data.connection?.status))throw failure('broadcaster_status_invalid');
    return {configured:true,connection:{status:data.connection.status,...Object.fromEntries(['updatedAt','expiresAt'].filter(key=>typeof data.connection[key]==='string').map(key=>[key,data.connection[key]]))}};
  }
  async function connectBroadcaster(accessToken,isCurrent=()=>true){
    if(!isCurrent())throw failure('session_changed');
    const data=await call('admin/connect',{method:'POST',headers:{'Authorization':'Bearer '+accessToken,'Content-Type':'application/json'},body:'{}'});
    if(!isCurrent())throw failure('session_changed');
    const url=new URL(data.authorizationUrl);
    if(url.origin!=='https://chzzk.naver.com'||url.pathname!=='/account-interlock')throw failure('service_unavailable');
    location.assign(url.href);
  }
  async function uploadPrivate(file,accessToken){
    if(!file||!file.size)throw failure('file_required');
    if(file.size>15*1024*1024)throw failure('file_too_large');
    if(!/\.(png|jpe?g|webp|gif|zip|apk)$/i.test(file.name||''))throw failure('unsupported_file_type');
    const form=new FormData();form.append('file',file);
    return call('admin/upload',{method:'POST',headers:{Authorization:'Bearer '+accessToken},body:form});
  }
  const photos=()=>paged('photos'),receipts=()=>paged('receipts');
  window.YamhaRewardAuth={refresh,login,logout,photos,download,receipts,connectBroadcaster,broadcasterStatus,uploadPrivate,
    state:()=>({...current}),onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
})();
