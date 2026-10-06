/* Cloudflare Pages Functions. All provider tokens and privileged keys stay here. */
const API = 'https://openapi.chzzk.naver.com';
const COOKIE = '__Host-yamha_viewer';
const STATE_COOKIE = '__Host-yamha_oauth';
const BUCKET = 'yamha-private-rewards';
const MAX_UPLOAD = 15 * 1024 * 1024;
const ID = /^[a-f0-9]{32}$/i;
const OPAQUE = /^[a-f0-9]{64}$/;
const ASSET = /^private\/[a-f0-9-]{36}\.(png|jpg|webp|gif)$/;
const encoder = new TextEncoder();
class Failure extends Error { constructor(code, status = 503) { super(code); this.code = code; this.status = status; } }
const hex = bytes => Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('');
const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
const hash = async value => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
const now = () => new Date().toISOString();
const future = seconds => new Date(Date.now() + seconds * 1000).toISOString();
const cookie = (name, value, maxAge) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
function cookies(request) { return Object.fromEntries((request.headers.get('Cookie') || '').split(';').map(x => x.trim().split('=')).filter(x => x.length === 2)); }
function headers(extra) { return new Headers({ 'Cache-Control': 'no-store, private', 'Pragma': 'no-cache', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', ...extra }); }
function json(value, status = 200, extra) { return new Response(JSON.stringify(value), { status, headers: headers({ 'Content-Type': 'application/json; charset=utf-8', ...extra }) }); }
function redirect(url, setCookies = []) { const h = headers({ Location: url }); setCookies.forEach(x => h.append('Set-Cookie', x)); return new Response(null, { status: 303, headers: h }); }
function config(env) {
  const values = ['SITE_ORIGIN', 'CHZZK_CLIENT_ID', 'CHZZK_CLIENT_SECRET', 'CHZZK_CHANNEL_ID', 'SUPABASE_URL', 'SUPABASE_PUBLIC_KEY', 'SUPABASE_SECRET_KEY', 'REWARD_TOKEN_KEY'];
  if (values.some(k => !env[k])) throw new Failure('setup_required');
  let site, db;
  try { site = new URL(env.SITE_ORIGIN); db = new URL(env.SUPABASE_URL); } catch { throw new Failure('setup_required'); }
  if (site.protocol !== 'https:' || site.origin !== env.SITE_ORIGIN || db.protocol !== 'https:' || db.username || db.password || !ID.test(env.CHZZK_CHANNEL_ID) || !OPAQUE.test(env.REWARD_TOKEN_KEY)) throw new Failure('setup_required');
  return { ...env, db: db.origin, callback: site.origin + '/api/reward/auth/callback' };
}
function origin(request, cfg) {
  if (new URL(request.url).origin !== cfg.SITE_ORIGIN) throw new Failure('wrong_origin', 403);
  if (request.method !== 'GET' && request.headers.get('Origin') !== cfg.SITE_ORIGIN) throw new Failure('csrf_rejected', 403);
}
async function requestJson(url, init = {}, errorCode = 'upstream_unavailable') {
  let response;
  // Workers supports manual/follow, not redirect:'error'. Never forward credentials to a redirect.
  try { response = await fetch(url, { ...init, redirect: 'manual', signal: AbortSignal.timeout(15000) }); } catch { throw new Failure(errorCode); }
  if (response.status >= 300 && response.status < 400) throw new Failure(errorCode);
  if (!response.ok) throw new Failure(errorCode, response.status === 401 || response.status === 403 ? 403 : 503);
  if (response.status === 204) return null;
  try { const text=await response.text();return text ? JSON.parse(text) : null; } catch { throw new Failure(errorCode); }
}
function serviceHeaders(cfg) {
  const h = { apikey: cfg.SUPABASE_SECRET_KEY, 'Content-Type': 'application/json' };
  // Modern secret keys are not JWTs. Legacy service_role keys also need Authorization.
  if (cfg.SUPABASE_SECRET_KEY.startsWith('eyJ')) h.Authorization = 'Bearer ' + cfg.SUPABASE_SECRET_KEY;
  return h;
}
async function db(cfg, path, method = 'GET', body, extra = {}) {
  return requestJson(cfg.db + '/rest/v1/' + path, { method, headers: { ...serviceHeaders(cfg), ...extra }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }, 'storage_unavailable');
}
async function chzzk(path, init = {}) {
  const result = await requestJson(API + path, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } }, 'chzzk_unavailable');
  if (!result || result.code !== 200 || !result.content) throw new Failure('chzzk_unavailable');
  return result.content;
}
async function token(cfg, fields) {
  const t = await chzzk('/auth/v1/token', { method: 'POST', body: JSON.stringify({ ...fields, clientId: cfg.CHZZK_CLIENT_ID, clientSecret: cfg.CHZZK_CLIENT_SECRET }) });
  if (!t.accessToken || !t.refreshToken || !Number.isFinite(Number(t.expiresIn)) || Number(t.expiresIn) < 60) throw new Failure('chzzk_unavailable');
  return t;
}
async function aes(cfg) { return crypto.subtle.importKey('raw', Uint8Array.from(cfg.REWARD_TOKEN_KEY.match(/../g), x => parseInt(x, 16)), 'AES-GCM', false, ['encrypt', 'decrypt']); }
async function seal(cfg, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: encoder.encode('yamha-chzzk-v1') }, await aes(cfg), encoder.encode(JSON.stringify(value)));
  return 'v1:' + hex(iv) + ':' + hex(new Uint8Array(encrypted));
}
async function unseal(cfg, value) {
  try {
    const [version, iv, ciphertext] = String(value).split(':');
    if (version !== 'v1' || !/^[a-f0-9]{24}$/.test(iv) || !/^[a-f0-9]+$/.test(ciphertext) || ciphertext.length % 2) throw new Error();
    const bytes = s => Uint8Array.from(s.match(/../g), x => parseInt(x, 16));
    const out = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(iv), additionalData: encoder.encode('yamha-chzzk-v1') }, await aes(cfg), bytes(ciphertext));
    return JSON.parse(new TextDecoder().decode(out));
  } catch { throw new Failure('broadcaster_reconnect_required'); }
}
async function admin(request, cfg) {
  const authorization = request.headers.get('Authorization') || '';
  if (!/^Bearer [A-Za-z0-9_.-]+$/.test(authorization)) throw new Failure('admin_required', 401);
  const h = { apikey: cfg.SUPABASE_PUBLIC_KEY, Authorization: authorization, 'Content-Type': 'application/json' };
  const user = await requestJson(cfg.db + '/auth/v1/user', { headers: h }, 'admin_auth_failed');
  if (!user?.id) throw new Failure('admin_auth_failed', 403);
  const allowed = await requestJson(cfg.db + '/rest/v1/rpc/yamha_is_admin', { method: 'POST', headers: h, body: '{}' }, 'admin_check_failed');
  if (allowed !== true) throw new Failure('admin_forbidden', 403);
  return user.id;
}
async function session(request, cfg, required = true) {
  const raw = cookies(request)[COOKIE];
  if (!raw || !OPAQUE.test(raw)) { if (required) throw new Failure('login_required', 401); return null; }
  const rows = await db(cfg, 'yamha_chzzk_sessions?token_hash=eq.' + await hash(raw) + '&expires_at=gt.' + encodeURIComponent(now()) + '&select=token_hash,channel_id,channel_name,expires_at&limit=1');
  if (!rows?.length) { if (required) throw new Failure('login_required', 401); return null; }
  return rows[0];
}
async function start(request, cfg, mode) {
  const adminId = mode === 'broadcaster' ? await admin(request, cfg) : null;
  const state = random(), bind = random();
  await db(cfg, 'yamha_chzzk_oauth_states', 'POST', { state_hash: await hash(state), browser_hash: await hash(bind), mode, admin_id: adminId, expires_at: future(600) });
  const url = new URL('https://chzzk.naver.com/account-interlock');
  url.searchParams.set('clientId', cfg.CHZZK_CLIENT_ID); url.searchParams.set('redirectUri', cfg.callback); url.searchParams.set('state', state);
  if (mode === 'broadcaster') return json({ authorizationUrl: url.href }, 200, { 'Set-Cookie': cookie(STATE_COOKIE, bind, 600) });
  return redirect(url.href, [cookie(STATE_COOKIE, bind, 600)]);
}
async function callback(request, cfg) {
  const url = new URL(request.url), state = url.searchParams.get('state') || '', bind = cookies(request)[STATE_COOKIE] || '';
  const clear = cookie(STATE_COOKIE, '', 0);
  if (!OPAQUE.test(state) || !OPAQUE.test(bind)) return redirect(cfg.SITE_ORIGIN + '/reward/?auth=expired', [clear]);
  const rows = await db(cfg, 'rpc/yamha_chzzk_consume_state', 'POST', { p_hash: await hash(state), p_browser_hash: await hash(bind) });
  if (!rows?.length) return redirect(cfg.SITE_ORIGIN + '/reward/?auth=expired', [clear]);
  const mode = rows[0].mode, destination = mode === 'broadcaster' ? '/admin/?chzzk=' : '/reward/?auth=';
  if (url.searchParams.has('error') || !url.searchParams.get('code')) return redirect(cfg.SITE_ORIGIN + destination + 'cancelled', [clear]);
  try {
    const t = await token(cfg, { grantType: 'authorization_code', code: url.searchParams.get('code'), state });
    const user = await chzzk('/open/v1/users/me', { headers: { Authorization: 'Bearer ' + t.accessToken } });
    if (!ID.test(user.channelId || '')) throw new Failure('identity_invalid');
    if (mode === 'broadcaster') {
      if (user.channelId.toLowerCase() !== cfg.CHZZK_CHANNEL_ID.toLowerCase()) throw new Failure('wrong_broadcaster', 403);
      // Check the required broadcaster grant before replacing a previously working connection.
      const check = await chzzk('/open/v1/channels/subscribers?page=0&size=1&sort=RECENT', { headers: { Authorization: 'Bearer ' + t.accessToken } });
      if (!Array.isArray(check.data)) throw new Failure('subscription_permission_required', 403);
      await db(cfg, 'yamha_chzzk_broadcaster?on_conflict=channel_id', 'POST', { channel_id: cfg.CHZZK_CHANNEL_ID.toLowerCase(), encrypted_tokens: await seal(cfg, { accessToken: t.accessToken, refreshToken: t.refreshToken }), expires_at: future(Number(t.expiresIn)), refresh_lock: null, refresh_locked_until: null, connected_by: rows[0].admin_id, updated_at: now() }, { Prefer: 'resolution=merge-duplicates' });
      return redirect(cfg.SITE_ORIGIN + destination + 'connected', [clear]);
    }
    const sid = random();
    const previous = cookies(request)[COOKIE];
    if (previous && OPAQUE.test(previous)) await db(cfg, 'yamha_chzzk_sessions?token_hash=eq.' + await hash(previous), 'DELETE');
    await db(cfg, 'yamha_chzzk_sessions', 'POST', { token_hash: await hash(sid), channel_id: user.channelId.toLowerCase(), channel_name: String(user.channelName || '').slice(0,100), expires_at: future(7 * 86400) });
    // Viewer provider tokens are deliberately not persisted or returned to the browser.
    return redirect(cfg.SITE_ORIGIN + destination + 'connected', [clear, cookie(COOKIE, sid, 7 * 86400)]);
  } catch (error) {
    const code = error.code === 'wrong_broadcaster' ? 'wrong_broadcaster' : 'failed';
    return redirect(cfg.SITE_ORIGIN + destination + code, [clear]);
  }
}
async function broadcasterToken(cfg) {
  const channel = cfg.CHZZK_CHANNEL_ID.toLowerCase();
  const rows = await db(cfg, 'yamha_chzzk_broadcaster?channel_id=eq.' + channel + '&select=*&limit=1');
  if (!rows?.length) throw new Failure('broadcaster_not_connected');
  const row = rows[0];
  if (Date.parse(row.expires_at) > Date.now() + 60000) return (await unseal(cfg, row.encrypted_tokens)).accessToken;
  const lock = random();
  const claimed = await db(cfg, 'rpc/yamha_chzzk_claim_refresh', 'POST', { p_channel: channel, p_lock: lock });
  if (!claimed?.length) {
    const newer=await db(cfg,'yamha_chzzk_broadcaster?channel_id=eq.'+channel+'&select=*&limit=1');
    if(newer?.length&&Date.parse(newer[0].expires_at)>Date.now()+60000)return (await unseal(cfg,newer[0].encrypted_tokens)).accessToken;
    throw new Failure('subscription_retry');
  }
  try {
    const current = await unseal(cfg, claimed[0].encrypted_tokens);
    const fresh = await token(cfg, { grantType: 'refresh_token', refreshToken: current.refreshToken });
    const updated = await db(cfg, 'yamha_chzzk_broadcaster?channel_id=eq.' + channel + '&refresh_lock=eq.' + lock, 'PATCH', { encrypted_tokens: await seal(cfg, { accessToken: fresh.accessToken, refreshToken: fresh.refreshToken }), expires_at: future(Number(fresh.expiresIn)), refresh_lock: null, refresh_locked_until: null, updated_at: now() }, { Prefer: 'return=representation' });
    if (updated?.length !== 1) throw new Failure('subscription_retry');
    return fresh.accessToken;
  } catch (error) {
    await db(cfg, 'yamha_chzzk_broadcaster?channel_id=eq.' + channel + '&refresh_lock=eq.' + lock, 'PATCH', { refresh_lock: null, refresh_locked_until: null }).catch(() => {});
    throw error;
  }
}
async function subscription(cfg, channelId) {
  const access = await broadcasterToken(cfg);
  // Official API: integer page starting at zero; maximum size 50. No viewer-target filter exists.
  const maxPages = Math.min(1000, Math.max(1, Number(cfg.CHZZK_MAX_SUBSCRIBER_PAGES) || 200));
  for (let page = 0; page < maxPages; page++) {
    const out = await chzzk(`/open/v1/channels/subscribers?page=${page}&size=50&sort=RECENT`, { headers: { Authorization: 'Bearer ' + access } });
    if (!Array.isArray(out.data) || out.data.length > 50) throw new Failure('subscription_unavailable');
    const found = out.data.find(x => String(x.channelId || '').toLowerCase() === channelId);
    if (found) {
      const tier = Number(found.tierNo), months = Number(found.month);
      if (![1,2].includes(tier) || !Number.isInteger(months) || months < 0) throw new Failure('subscription_unavailable');
      return { status: 'subscribed', tier, months };
    }
    if (out.data.length < 50) return { status: 'none', tier: 0, months: 0 };
  }
  // A truncated page walk is unknown, never proof of a non-subscriber or entitlement.
  throw new Failure('subscription_page_limit');
}
async function status(request, cfg) {
  const user = await session(request, cfg, false);
  if (!user) return json({ configured: true, user: null });
  let membership;
  try { membership = await subscription(cfg, user.channel_id); }
  catch (error) { membership = { status: 'unavailable', reason: error.code || 'subscription_unavailable' }; }
  return json({ configured: true, user: { channelId: user.channel_id, name: user.channel_name }, subscription: membership });
}
async function photos(request, cfg) {
  const user = await session(request, cfg);
  const offset = Number(new URL(request.url).searchParams.get('offset') || 0);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000) throw new Failure('bad_request', 400);
  const rows = await db(cfg, 'yamha_records?collection=eq.photos&data->>recipient_channel_id=ilike.' + user.channel_id + '&select=id,data&order=data->>published_at.desc.nullslast,id.asc&limit=51&offset=' + offset);
  if (!Array.isArray(rows)) throw new Failure('storage_unavailable');
  return json({ items: rows.slice(0,50).filter(r => r.data?.published !== false).map(r => ({ id:r.id, title:String(r.data.title || ''), tags:Array.isArray(r.data.tags)?r.data.tags.filter(x=>typeof x==='string'):[], published_at:r.data.published_at || '', available:ASSET.test(r.data.private_asset_path || '') })), nextOffset:rows.length > 50?offset+50:null });
}
async function download(request, cfg) {
  const user = await session(request, cfg);
  let input;try { input = await request.json(); } catch { throw new Failure('bad_request',400); }
  if (!['photos','rewards'].includes(input.collection) || typeof input.id !== 'string' || !input.id || input.id.length > 200) throw new Failure('bad_request',400);
  const rows = await db(cfg, 'yamha_records?collection=eq.' + input.collection + '&id=eq.' + encodeURIComponent(input.id) + '&select=id,data&limit=1');
  if (!rows?.length || rows[0].data?.published === false) throw new Failure('not_available',404);
  const data = rows[0].data;
  if (input.collection === 'photos') {
    if (String(data.recipient_channel_id || '').toLowerCase() !== user.channel_id) throw new Failure('not_available',404);
  } else {
    const tier=Number(data.tier),months=Number(data.required_months);
    if (![1,2].includes(tier) || !Number.isInteger(months) || months<1) throw new Failure('not_available',404);
    const sub=await subscription(cfg,user.channel_id);
    if (sub.status!=='subscribed' || sub.tier<tier || sub.months<months) throw new Failure('subscription_required',403);
  }
  const path=data.private_asset_path;
  if (!ASSET.test(path || '')) throw new Failure('file_not_ready',404);
  const out=await requestJson(cfg.db+'/storage/v1/object/sign/'+BUCKET+'/'+path.split('/').map(encodeURIComponent).join('/'),{method:'POST',headers:serviceHeaders(cfg),body:JSON.stringify({expiresIn:60})},'file_unavailable');
  const signed=out.signedURL || out.signedUrl;
  if (typeof signed!=='string' || !signed.startsWith('/object/sign/'+BUCKET+'/')) throw new Failure('file_unavailable');
  if(input.collection==='rewards')await db(cfg,'yamha_chzzk_receipts?on_conflict=channel_id,reward_id','POST',{channel_id:user.channel_id,reward_id:input.id,title:String(data.title||''),tier:Number(data.tier),months:Number(data.required_months),received_at:now()},{Prefer:'resolution=ignore-duplicates'});
  return json({url:cfg.db+'/storage/v1'+signed,expiresIn:60});
}
async function upload(request,cfg) {
  await admin(request,cfg);
  const length=Number(request.headers.get('Content-Length') || 0);
  if (length>MAX_UPLOAD+65536) throw new Failure('file_too_large',413);
  let form;try{form=await request.formData();}catch{throw new Failure('bad_request',400);}
  const file=form.get('file');
  if (!file || typeof file.arrayBuffer!=='function' || !file.size || file.size>MAX_UPLOAD) throw new Failure('file_too_large',413);
  const bytes=new Uint8Array(await file.arrayBuffer());let ext='',mime='';
  if(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47){ext='png';mime='image/png';}
  else if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff){ext='jpg';mime='image/jpeg';}
  else if(new TextDecoder().decode(bytes.slice(0,6)).match(/^GIF8[79]a$/)){ext='gif';mime='image/gif';}
  else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP'){ext='webp';mime='image/webp';}
  if(!ext)throw new Failure('image_type_required',400);
  const path='private/'+crypto.randomUUID()+'.'+ext;
  await requestJson(cfg.db+'/storage/v1/object/'+BUCKET+'/'+path,{method:'POST',headers:{...serviceHeaders(cfg),'Content-Type':mime,'x-upsert':'false'},body:bytes},'file_upload_failed');
  return json({path});
}
export async function onRequest(context) {
  const request=context.request,path=new URL(request.url).pathname.replace(/^\/api\/reward\/?/,'').replace(/\/$/,'');
  let cfg;
  try {
    cfg=config(context.env);origin(request,cfg);
    if(path==='auth/start'&&request.method==='GET')return await start(request,cfg,'viewer');
    if(path==='admin/connect'&&request.method==='POST')return await start(request,cfg,'broadcaster');
    if(path==='auth/callback'&&request.method==='GET')return await callback(request,cfg);
    if(path==='session'&&request.method==='GET')return await status(request,cfg);
    if(path==='photos'&&request.method==='GET')return await photos(request,cfg);
    if(path==='receipts'&&request.method==='GET'){
      const user=await session(request,cfg);
      const offset=Number(new URL(request.url).searchParams.get('offset')||0);
      if(!Number.isSafeInteger(offset)||offset<0||offset>100000)throw new Failure('bad_request',400);
      const rows=await db(cfg,'yamha_chzzk_receipts?channel_id=eq.'+user.channel_id+'&select=reward_id,title,tier,months,received_at&order=received_at.desc,reward_id.asc&limit=51&offset='+offset);
      if(!Array.isArray(rows))throw new Failure('storage_unavailable');
      return json({items:rows.slice(0,50),nextOffset:rows.length>50?offset+50:null});
    }
    if(path==='download'&&request.method==='POST')return await download(request,cfg);
    if(path==='admin/upload'&&request.method==='POST')return await upload(request,cfg);
    if(path==='logout'&&request.method==='POST'){
      const raw=cookies(request)[COOKIE];if(raw&&OPAQUE.test(raw))await db(cfg,'yamha_chzzk_sessions?token_hash=eq.'+await hash(raw),'DELETE');
      return json({ok:true},200,{'Set-Cookie':cookie(COOKIE,'',0)});
    }
    return json({error:'not_found'},404);
  } catch(error) {
    if(path==='session'&&error.code==='setup_required')return json({configured:false,user:null,error:'setup_required'},503);
    return json({error:error instanceof Failure?error.code:'service_unavailable'},error instanceof Failure?error.status:503);
  }
}
