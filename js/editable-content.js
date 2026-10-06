/* Presentation catalogue shared by the public renderer and authenticated editor.
 * Stored in yamha_profile.data.presentation; null restores the shipped default. */
(function () {
  'use strict';
  const entries = new Map(), originals = new WeakMap();
  const own = (o,k) => o != null && Object.prototype.hasOwnProperty.call(o,k);
  function register(group, fields) {
    Object.entries(fields).forEach(([key, field]) => {
      if (entries.has(key)) throw new Error('Duplicate presentation key: '+key);
      if (!/^[a-zA-Z][\w.-]+$/.test(key)) throw new Error('Invalid presentation key');
      const spec=typeof field==='string'?{value:field}:field;
      entries.set(key,Object.freeze({key,group,type:'text',label:key,...spec}));
    });
  }
  function raw(key) {
    const spec=entries.get(key), overrides=window.YamhaSite?.profile()?.presentation;
    const value=own(overrides,key)&&overrides[key]!==null?overrides[key]:spec?.value;
    return value==null?'':String(value);
  }
  function text(key, variables={}) {
    const p=window.YamhaSite?.profile() || window.YAMHA_DATA || {};
    const vars={name:p.name??'',fanName:p.fanName??'',englishName:p.englishName??'',bio:p.bio??'',wordmark:p.englishName?.toLowerCase().replace(/^./,s=>s.toUpperCase())||p.name||'',...variables};
    return raw(key).replace(/\{([\w]+)\}/g,(match,name)=>own(vars,name)?String(vars[name]??''):match);
  }
  const image=key=>raw(key);
  const imageURL=key=>window.YamhaUI?.safeUrl(image(key),{image:true});
  function nodes(root,selector) { return [...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)]; }
  function variables(node){
    if(!node.dataset.yVars)return {};
    try {const value=JSON.parse(node.dataset.yVars);return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}
  }
  function apply(root=document) {
    nodes(root,'[data-y-text]').forEach(node=>{
      const value=text(node.dataset.yText,variables(node));if(node.textContent!==value)node.textContent=value;
    });
    nodes(root,'[data-y-image]').forEach(node=>{
      const value=imageURL(node.dataset.yImage);
      if(value){if(node.getAttribute('src')!==value)node.setAttribute('src',value);node.hidden=false;}
      else {node.removeAttribute('src');node.hidden=true;}
    });
    nodes(root,'[data-y-attr]').forEach(node=>{
      node.dataset.yAttr.split(',').forEach(pair=>{
        const colon=pair.indexOf(':'),attribute=pair.slice(0,colon).trim(),key=pair.slice(colon+1).trim();
        if(!['alt','title','aria-label','placeholder','content','href','src'].includes(attribute)||!entries.has(key))return;
        const value=entries.get(key).type==='image'?imageURL(key):text(key,variables(node));
        if(['href','src'].includes(attribute)&&entries.get(key).type!=='image')return;
        if(value==null)node.removeAttribute(attribute);else if(node.getAttribute(attribute)!==value)node.setAttribute(attribute,value);
      });
    });
    nodes(root,'[data-y-art]').forEach(node=>{
      const key=node.dataset.yArt,url=imageURL(key);
      if(node.tagName.toLowerCase()==='svg') {
        if(!url)return;
        const replacement=document.createElement('img');
        for(const attr of node.attributes)if(!['viewBox','xmlns'].includes(attr.name))replacement.setAttribute(attr.name,attr.value);
        replacement.alt='';replacement.src=url;replacement.classList.add('y-art-image');
        originals.set(replacement,node);node.replaceWith(replacement);
      } else if(node.tagName==='IMG') {
        if(url){if(node.getAttribute('src')!==url)node.src=url;}
        else if(originals.has(node))node.replaceWith(originals.get(node));
      }
    });
  }
  window.YamhaContent={register,raw,text,image,apply,entries:()=>Array.from(entries.values())};
  register('공통 동작',{'shared.dialogClose':{label:'팝업 닫기 버튼 설명',value:'닫기'}});
  async function init(){
    if(!window.YamhaSite)return;
    await window.YamhaSite.ready;apply();
    window.YamhaSite.onChange(()=>apply());
    // Covers freshly opened dialogs and asynchronously rendered page sections.
    const observer=new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)apply(node);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
