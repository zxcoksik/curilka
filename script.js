
(() => {
  const state = { category: "Все", query: "", sort: "default", items: [], index: -1 };
  const $ = s => document.querySelector(s);
  const grid = $("#productGrid"), categories = $("#categories"), search = $("#search");
  const title = $("#title"), counter = $("#counter"), sort = $("#sort");
  const lightbox = $("#lightbox"), lightboxImage = $("#lightboxImage"), caption = $("#lightboxCaption");

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
  const money = v => v == null ? "—" : `${Number(v).toLocaleString("ru-RU")} ₽`;
  const plural = n => { const a=n%10,b=n%100; return a===1&&b!==11?"позиция":a>=2&&a<=4&&(b<12||b>14)?"позиции":"позиций"; };
  const groups = ["Все", ...new Set(PRODUCTS.map(p => p.group).filter(Boolean))];

  groups.forEach(group => {
    const b=document.createElement("button");
    b.type="button"; b.className="category"; b.textContent=group;
    b.addEventListener("click",()=>{state.category=group; updateCategories(); render();});
    categories.appendChild(b);
  });

  function updateCategories(){
    [...categories.children].forEach(b=>b.classList.toggle("active", b.textContent===state.category));
  }

  function filtered(){
    const q=state.query.trim().toLowerCase();
    let a=PRODUCTS.filter(p=>{
      const okCat=state.category==="Все"||p.group===state.category;
      const text=`${p.name} ${p.article} ${p.group} ${p.kind}`.toLowerCase();
      return okCat && (!q || text.includes(q));
    });
    if(state.sort==="name") a.sort((x,y)=>x.name.localeCompare(y.name,"ru"));
    if(state.sort==="priceAsc") a.sort((x,y)=>(x.price??Infinity)-(y.price??Infinity));
    if(state.sort==="priceDesc") a.sort((x,y)=>(y.price??-Infinity)-(x.price??-Infinity));
    if(state.sort==="article") a.sort((x,y)=>String(x.article).localeCompare(String(y.article),"ru"));
    return a;
  }

  function render(){
    state.items=filtered();
    title.textContent=state.category==="Все"?"Все товары":state.category;
    counter.textContent=`${state.items.length} ${plural(state.items.length)}`;
    grid.innerHTML="";
    if(!state.items.length){
      grid.innerHTML=`<div class="empty"><strong>Ничего не найдено</strong><br><span>Измените запрос или сбросьте фильтры.</span></div>`;
      return;
    }
    const frag=document.createDocumentFragment();
    state.items.forEach((p,i)=>{
      const card=document.createElement("article"); card.className="card";
      const src=p.image||"assets/images/iceberg-placeholder.jpg";
      card.innerHTML=`
        <div class="photo"><img src="${esc(src)}" alt="${esc(p.name)}" loading="lazy" decoding="async"></div>
        <div class="card-body">
          <div class="type">${esc(p.kind)}</div>
          <div class="name">${esc(p.name)}</div>
          <div class="meta"><span>Арт. ${esc(p.article)}</span><span>${esc(p.unit)}</span></div>
          <div class="price">${money(p.price)}</div>
        </div>`;
      card.querySelector("img").addEventListener("error",e=>{e.currentTarget.src="assets/images/iceberg-placeholder.jpg"});
      card.querySelector(".photo").addEventListener("click",()=>open(i));
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  function open(i){
    state.index=i; const p=state.items[i];
    lightboxImage.src=p.image||"assets/images/iceberg-placeholder.jpg";
    lightboxImage.alt=p.name;
    caption.textContent=`${p.name} · арт. ${p.article} · ${money(p.price)}`;
    lightbox.hidden=false; document.body.style.overflow="hidden";
  }
  function close(){lightbox.hidden=true;lightboxImage.removeAttribute("src");document.body.style.overflow="";}
  function move(delta){if(!state.items.length)return;state.index=(state.index+delta+state.items.length)%state.items.length;open(state.index)}

  search.addEventListener("input",e=>{state.query=e.target.value;render()});
  sort.addEventListener("change",e=>{state.sort=e.target.value;render()});
  $("#clearSearch").addEventListener("click",()=>{search.value="";state.query="";search.focus();render()});
  $("#resetBtn").addEventListener("click",()=>{state.category="Все";state.query="";state.sort="default";search.value="";sort.value="default";updateCategories();render();window.scrollTo({top:0,behavior:"smooth"})});
  $("#themeBtn").addEventListener("click",()=>{
    document.documentElement.style.setProperty("--bg",getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()==="#0b0d12"?"#f5f6f8":"#0b0d12");
  });
  lightbox.addEventListener("click",e=>{if(e.target===lightbox||e.target.classList.contains("lightbox-close"))close()});
  $(".lightbox-prev").addEventListener("click",()=>move(-1));
  $(".lightbox-next").addEventListener("click",()=>move(1));
  document.addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();search.focus()}
    if(!lightbox.hidden){if(e.key==="Escape")close();if(e.key==="ArrowLeft")move(-1);if(e.key==="ArrowRight")move(1)}
  });
  updateCategories(); render();
})();
