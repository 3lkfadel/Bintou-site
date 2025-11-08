/* Helpers */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

/* Year */
$("#year").textContent = new Date().getFullYear();

/* CTA → Message */
$("#toMessage")?.addEventListener("click", ()=> $("#message").scrollIntoView({behavior:"smooth"}));

/* ===== Message du jour (statique via message.data.js) ===== */
function defaultTemplate(){
  const pretty = new Intl.DateTimeFormat('fr-FR', { dateStyle:'long' }).format(new Date());
  return `Mon amour, en ce ${pretty},

Chaque jour nous rapproche du 4 mars. Merci d'exister, merci de me choisir.

— Ton/ta amoureux(se) 💗`;
}
(function mountDailyMessage(){
  const box = $("#dailyMsg");
  const text = (typeof DAILY_MESSAGE === "string" && DAILY_MESSAGE.trim().length)
    ? DAILY_MESSAGE
    : defaultTemplate();
  box.textContent = text;
})();

/* ===== Countdown (4 mars 2026) ===== */
const target = new Date('2026-03-04T00:00:00');
function updateCountdown(){
  const now = new Date();
  let diff = target - now; if(diff < 0) diff = 0;
  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const set = (id,v)=>{ const el = document.getElementById(id); if(el) el.textContent = v; };
  set('cdDays', d); set('cdHours', String(h).padStart(2,'0'));
  set('cdMinutes', String(m).padStart(2,'0')); set('cdSeconds', String(s).padStart(2,'0'));
  const dDays = $("#dDays"); if(dDays) dDays.textContent = d;
}
updateCountdown(); setInterval(updateCountdown, 1000);

/* ===== Lightbox ===== */
const lb = $("#lightbox"), lbImg = $("#lbImg");
$("#lbClose")?.addEventListener("click", ()=> lb.classList.remove("show"));
lb?.addEventListener("click", (e)=>{ if(e.target===lb) lb.classList.remove("show"); });
$$(".gallery .ph img").forEach(im=> im.addEventListener("click", ()=>{ lbImg.src = im.src; lb.classList.add("show"); }));

/* ===== Scroll progress bar ===== */
(function(){
  const bar = $("#scrollbar");
  function onScroll(){
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = pct + "%";
  }
  document.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
})();

/* ===== Reveal on scroll (with directions + stagger for gallery) ===== */
const io = new IntersectionObserver((entries)=>{
  for(const e of entries){
    if(e.isIntersecting){
      e.target.classList.add("reveal");
      if(e.target.classList.contains('grid')){
        const cells = $$(".ph", e.target);
        cells.forEach((c,i)=> c.style.transitionDelay = (i*70)+'ms');
        cells.forEach(c=> c.classList.add('reveal'));
      }
      io.unobserve(e.target);
    }
  }
}, {threshold:.14});
$$("[data-anim], .gallery .grid, .ph").forEach(el=> io.observe(el));

/* ===== 3D hover for photos ===== */
$$(".hover3d").forEach(card=>{
  const maxDeg = 6;
  card.addEventListener("pointermove", e=>{
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - .5) * -maxDeg;
    const ry = ((e.clientX - r.left) / r.width - .5) * maxDeg;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener("pointerleave", ()=> card.style.transform = "");
});

/* ===== Magnetic buttons ===== */
$$(".magnet").forEach(btn=>{
  const strength = 18;
  btn.addEventListener("pointermove", e=>{
    const r = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width/2);
    const dy = e.clientY - (r.top + r.height/2);
    btn.style.transform = `translate(${dx/strength}px, ${dy/strength}px)`;
  });
  btn.addEventListener("pointerleave", ()=> btn.style.transform = "");
});

/* ===== Parallax on hero leaves/image with scroll ===== */
(function(){
  const ill = $(".hero-ill");
  if(!ill) return;
  const leaves = [".leaf-a",".leaf-b",".leaf-c"].map(s=> ill.querySelector(s));
  function onScroll(){
    const y = window.scrollY;
    ill.style.transform = `translateY(${y*0.05}px)`;
    leaves[0] && (leaves[0].style.transform = `translateY(${y*0.08}px) rotate(-12deg)`);
    leaves[1] && (leaves[1].style.transform = `translateY(${y*0.03}px) rotate(18deg)`);
    leaves[2] && (leaves[2].style.transform = `translateY(${y*0.06}px) rotate(-6deg)`);
  }
  document.addEventListener('scroll', onScroll, {passive:true}); onScroll();
})();

/* ===== Floating hearts on scroll ===== */
(function(){
  const layer = $("#hearts-layer");
  let last = 0;
  function spawn(x){
    const s = document.createElement("span");
    s.className = "heart";
    s.textContent = "❤";
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
    const px = (x ?? Math.random()*vw);
    s.style.left = (px-6) + "px";
    s.style.setProperty("--x", (Math.random()*60 - 30) + "px");
    s.style.setProperty("--t", (4 + Math.random()*4) + "s");
    s.style.opacity = 0.7 + Math.random()*0.3;
    layer.appendChild(s);
    s.addEventListener("animationend", ()=> s.remove());
  }
  window.addEventListener("scroll", ()=>{
    const now = performance.now();
    if(now - last > 220){ last = now; spawn(); }
  }, {passive:true});
})();

/* ===== Lettre spéciale : open/close + petits cœurs ===== */
(function(){
  const open = $("#openLetter");
  const modal = $("#letterModal");
  const closeBtn = $("#letterClose");
  const backdrop = $("#letterBackdrop");

  function show(){
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    // petits cœurs à l'ouverture
    const layer = $("#hearts-layer");
    if(layer){
      for(let i=0;i<12;i++){
        setTimeout(()=>{
          const s = document.createElement("span");
          s.className = "heart";
          s.textContent = "❤";
          const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
          const px = Math.random()*vw;
          s.style.left = (px-6) + "px";
          s.style.setProperty("--x", (Math.random()*60 - 30) + "px");
          s.style.setProperty("--t", (3 + Math.random()*3) + "s");
          layer.appendChild(s);
          s.addEventListener("animationend", ()=> s.remove());
        }, i*60);
      }
    }
  }
  function hide(){
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  open?.addEventListener("click", show);
  closeBtn?.addEventListener("click", hide);
  backdrop?.addEventListener("click", hide);
  window.addEventListener("keydown", (e)=>{ if(e.key === "Escape" && modal.classList.contains("show")) hide(); });
})();
