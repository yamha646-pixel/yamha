(function () {
  'use strict';
  const S = window.YamhaSite;
  function el(tag,attrs={},children=[]) {
    const node=document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k,v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === 'className' || k === 'class') node.className=v;
      else if (k === 'dataset') Object.assign(node.dataset,v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(),v);
      else if (['value','checked','selected','disabled','hidden','textContent','tabIndex'].includes(k)) node[k]=v;
      else node.setAttribute(k,v === true ? '' : String(v));
    });
    (Array.isArray(children) ? children : [children]).flat(Infinity).forEach(child => { if (child !== null && child !== undefined && child !== false) node.append(child instanceof Node ? child : document.createTextNode(String(child))); });
    return node;
  }
  function icon(name) {
    if(name==='mail')name='envelope';
    name=name.replace(/^i-/,'');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','icon');svg.setAttribute('aria-hidden','true');
    svg.dataset.yArt='shell.art.'+name;
    const paths={search:'M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16M16 16l6 6',expand:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5'};
    if(paths[name]){svg.setAttribute('viewBox','0 0 24 24');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[name]);svg.append(path);return svg;}
    const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href','#i-'+name.replace(/^i-/,''));svg.append(use);return svg;
  }
  function safeUrl(value,options={}) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const str=value.trim();
    if (options.image && /^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(str)) return str;
    try {
      const url=new URL(str,S.url(''));
      if (url.username || url.password) return null;
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
      if (options.image && url.protocol === 'file:' && location.protocol === 'file:' && url.href.startsWith(S.url(''))) return url.href;
    } catch(e) {}
    return null;
  }
  let serial=0;
  function dialog(title,content) {
    const opener=document.activeElement, id='ym-dialog-'+(++serial);
    const close=el('button',{class:'ym-close',type:'button','aria-label':window.YamhaContent?.text('shared.dialogClose')||'닫기',dataset:{yAttr:'aria-label:shared.dialogClose'}},[icon('close')]);
    const box=el('dialog',{class:'ym-dialog','aria-labelledby':id},[
      el('div',{class:'ym-dialog-head'},[el('h2',{id},title),close]),el('div',{class:'ym-dialog-content'},content)
    ]);
    close.addEventListener('click',()=>box.close());
    box.addEventListener('click',event=>{if(event.target===box){const r=box.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)box.close();}});
    box.addEventListener('close',()=>{box.remove();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});
    document.body.append(box);box.showModal();return box;
  }
  let timer;
  function toast(text) {
    let box=document.getElementById('site-toast');
    if(!box){box=el('div',{id:'site-toast',class:'ym-toast',role:'status','aria-live':'polite'});document.body.append(box);}
    box.textContent=text;box.hidden=false;clearTimeout(timer);timer=setTimeout(()=>box.hidden=true,5000);
  }
  function renderText(text) {
    const wrap=el('div',{class:'ym-prose'}); let paragraph=[],list=null;
    const flush=()=>{if(paragraph.length){wrap.append(el('p',{},paragraph.join('\n')));paragraph=[];}list=null;};
    String(text||'').split(/\r?\n/).forEach(line=>{
      const heading=line.match(/^(#{1,4})\s+(.+)$/);
      if(heading){flush();wrap.append(el(heading[1].length<=2?'h3':'h4',{},heading[2]));}
      else if(/^[-*]\s+/.test(line)){if(paragraph.length)flush();if(!list){list=el('ul');wrap.append(list);}list.append(el('li',{},line.replace(/^[-*]\s+/,'')));}
      else if(!line.trim()){flush();}
      else if(/^---+$/.test(line.trim())){flush();wrap.append(el('hr'));}
      else {if(list)list=null;paragraph.push(line);}
    });flush();return wrap;
  }
  window.YamhaUI={el,icon,safeUrl,dialog,toast,renderText};
})();
