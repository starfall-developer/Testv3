const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE_KEY = 'starfall-library-v1';
let catalog = {games:[], anime:[], manga:[]};
let currentExternal = '';
let currentFilter = {games:'all',anime:'all',manga:'all'};
let favorites = new Set(JSON.parse(localStorage.getItem('starfall-favorites') || '[]'));
let localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400)}
function safeUrl(value){try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}}
function esc(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function allItems(){return [...catalog.games,...catalog.anime,...catalog.manga,...localItems]}
function pageName(name){return name[0].toUpperCase()+name.slice(1)}
function go(page){$$('.page').forEach(p=>p.classList.toggle('active-page',p.id===`page-${page}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#crumb').textContent=pageName(page);window.scrollTo({top:0,behavior:'smooth'});if(page==='favorites')renderFavorites()}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
function card(item){const saved=favorites.has(item.id);const cover=item.cover?safeUrl(item.cover):null;const action=item.type==='game'?'Play now':item.type==='anime'?'Watch / open':'Read / open';return `<article class="media-card"><div class="cover">${cover?`<img loading="lazy" src="${esc(cover)}" alt="${esc(item.title)} cover" onerror="this.remove()">`:`<span class="cover-placeholder">${esc(item.title.slice(0,1).toUpperCase())}</span>`}</div><div class="card-body"><div class="card-topline"><span class="tag">${esc(item.category||item.type)}</span><button class="favorite-btn ${saved?'saved':''}" data-favorite="${esc(item.id)}" aria-label="${saved?'Remove from':'Add to'} favorites">${saved?'♥':'♡'}</button></div><h3 title="${esc(item.title)}">${esc(item.title)}</h3><p>${esc(item.description||'Ready when you are.')}</p><button class="card-action" data-open="${esc(item.id)}">${action} ↗</button></div></article>`}
function empty(message,sub='Add something to make this shelf yours.'){return `<div class="empty-state"><b>${esc(message)}</b>${esc(sub)}</div>`}
function renderGrid(type,selector,query=''){const list=[...catalog[type],...localItems.filter(x=>x.type===type)];const filter=currentFilter[type]||'all';const q=query.trim().toLowerCase();const visible=list.filter(x=>(filter==='all'||x.category===filter)&&(!q||`${x.title} ${x.description} ${x.category}`.toLowerCase().includes(q)));$(selector).innerHTML=visible.length?visible.map(card).join(''):empty('Nothing in this orbit yet.','Use “Add” to put your own links here.')}
function renderHome(){const items=[...catalog.games,...catalog.anime,...catalog.manga,...localItems].slice(0,4);$('#home-feature-grid').innerHTML=items.length?items.map(card).join(''):empty('Your universe is waiting.')}
function renderFavorites(){const items=allItems().filter(x=>favorites.has(x.id));$('#favorites-grid').innerHTML=items.length?items.map(card).join(''):empty('No favorites saved yet.','Tap the heart on any card to save it here.')}
function renderAll(){const q=$('#search').value;renderGrid('games','#games-grid',q);renderGrid('anime','#anime-grid',q);renderGrid('manga','#manga-grid',q);renderHome();if($('#page-favorites').classList.contains('active-page'))renderFavorites()}
async function openItem(id){const item=allItems().find(x=>x.id===id);if(!item)return;const url=safeUrl(item.url);if(!url){toast('That link is not a valid web address.');return}if(item.type==='game'){currentExternal=url;$('#player-title').textContent=item.title;$('#player-frame').src=url;$('#player-dialog').showModal()}else{$('#reader-title').textContent=item.title;const content=$('#reader-content');content.innerHTML='';if(/\.(mp4|webm|ogg)(\?|$)/i.test(url)){const video=document.createElement('video');video.src=url;video.controls=true;video.autoplay=false;video.style='width:100%;max-height:65vh';content.append(video)}else{const frame=document.createElement('iframe');frame.src=url;frame.title=item.title;frame.loading='lazy';frame.allow='fullscreen; autoplay';content.append(frame)}$('#reader-dialog').showModal()}}
document.addEventListener('click',e=>{const open=e.target.closest('[data-open]');if(open)openItem(open.dataset.open);const fav=e.target.closest('[data-favorite]');if(fav){const id=fav.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);localStorage.setItem('starfall-favorites',JSON.stringify([...favorites]));renderAll()}});
$('#open-external').addEventListener('click',()=>{if(currentExternal)window.open(currentExternal,'_blank','noopener,noreferrer')});
$('#player-dialog').addEventListener('close',()=>$('#player-frame').src='');
$$('[data-filter-group]').forEach(group=>group.addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;const type=group.dataset.filterGroup;currentFilter[type]=b.dataset.filter;$$('.pill',group).forEach(x=>x.classList.toggle('selected',x===b));renderGrid(type,`#${type}-grid`,$('#search').value)}));
$('#search').addEventListener('input',renderAll);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#search').focus()}if(e.key==='Escape'){$$('dialog[open]').forEach(d=>d.close())}});
function showAdd(type){$('#item-type').value=type;$('#form-title').textContent=`Add ${type==='game'?'a game':type==='anime'?'anime':'manga'}`;$('#item-url').placeholder=type==='game'?'/games/my-game/index.html or https://...':'https://...';$('#add-dialog').showModal()}
$('#add-game').addEventListener('click',()=>showAdd('game'));$('#add-anime').addEventListener('click',()=>showAdd('anime'));$('#add-manga').addEventListener('click',()=>showAdd('manga'));
$('#add-form').addEventListener('submit',e=>{e.preventDefault();const type=$('#item-type').value,title=$('#item-title').value.trim(),url=safeUrl($('#item-url').value.trim());if(!url){toast('Please enter a valid http(s) URL or site-relative path.');return}const item={id:`custom-${Date.now()}`,type,title,url,cover:$('#item-cover').value.trim(),category:$('#item-category').value,description:'Added to your Starfall library.'};localItems.push(item);localStorage.setItem(STORAGE_KEY,JSON.stringify(localItems));e.target.reset();$('#add-dialog').close();renderAll();toast(`${title} added to Starfall!`)});
async function init(){try{const response=await fetch('catalog.json');if(response.ok){const data=await response.json();catalog={games:data.games||[],anime:data.anime||[],manga:data.manga||[]}}}catch(err){console.warn('Catalog could not be loaded; using your local entries.',err)}renderAll()}
init();
// Twinkling stars and meteor streaks. The background artwork stays visible underneath.
(()=>{const canvas=$('#starfield'),ctx=canvas.getContext('2d');let w,h,stars=[],meteors=[];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;function resize(){w=canvas.width=innerWidth*devicePixelRatio;h=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';stars=Array.from({length:Math.min(115,Math.floor(innerWidth/10))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.1+.25,a:Math.random()*.45+.15,p:Math.random()*6}))}function draw(){ctx.clearRect(0,0,w,h);for(const s of stars){s.p+=.012;ctx.globalAlpha=s.a*(.72+.28*Math.sin(s.p));ctx.fillStyle='#f2e8ff';ctx.beginPath();ctx.arc(s.x,s.y,s.r*devicePixelRatio,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;if(!reduced&&Math.random()<.025)meteors.push({x:Math.random()*w*.95,y:Math.random()*h*.9,v:7+Math.random()*10,life:0});meteors=meteors.filter(m=>m.life++<28);for(const m of meteors){ctx.strokeStyle=`rgba(199,145,255,${1-m.life/28})`;ctx.lineWidth=1.4*devicePixelRatio;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x-m.v*8,m.y+m.v*2.5);ctx.stroke();m.x+=m.v;m.y-=m.v*.2}if(!reduced)requestAnimationFrame(draw)}resize();addEventListener('resize',resize);draw()})();


// Rotating Starfall headline. The word is erased and typed again, like the reference.
(()=> {
  const target = document.querySelector('#hero-changing-word');
  if (!target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const words = ['wonderful', 'amazing', 'unblocked', 'beautiful', 'perfect', 'Heaven'];
  let wordIndex = 0, count = words[0].length, deleting = true;
  function tick() {
    const word = words[wordIndex];
    if (deleting) {
      count--;
      target.textContent = word.slice(0, Math.max(0, count));
      if (count <= 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, 280);
        return;
      }
      setTimeout(tick, 58);
    } else {
      const next = words[wordIndex];
      count++;
      target.textContent = next.slice(0, count);
      if (count >= next.length) {
        deleting = true;
        setTimeout(tick, 1700);
        return;
      }
      setTimeout(tick, 85);
    }
  }
  setTimeout(tick, 1800);
})();
