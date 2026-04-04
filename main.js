/* ============================================================
   JALAL — CINEMATIC PORTFOLIO — main.js
   ============================================================ */
(function () {
  "use strict";

  /* ══════════════════════════════════════
     1. LOADER
     ══════════════════════════════════════ */
  const loader     = document.getElementById('loader');
  const loaderBar  = document.getElementById('loader-bar');
  const DURATION   = 3500; // ms
  let startTime    = null;

  function animateBar(ts) {
    if (!startTime) startTime = ts;
    const elapsed  = ts - startTime;
    const pct      = Math.min(elapsed / DURATION * 100, 100);
    loaderBar.style.width = pct + '%';
    if (pct < 100) {
      requestAnimationFrame(animateBar);
    } else {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 200);
    }
  }

  document.body.style.overflow = 'hidden';
  requestAnimationFrame(animateBar);

  /* ══════════════════════════════════════
     2. CANVAS BACKGROUND
     ══════════════════════════════════════ */
  const canvas = document.getElementById('canvas-bg');
  const ctx    = canvas.getContext('2d');
  let W, H;
  let stars    = [];
  let roots    = [];
  let mouseX   = 0.5, mouseY = 0.5;

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }

  // Generate organic root-like paths
  function generateRoot(seed) {
    const pts = [];
    let x  = (seed * 0.37 + 0.1) * W;
    let y  = H * 0.95;
    let angle = -Math.PI/2 + (Math.random()-0.5)*0.8;
    let length = 0;
    const maxLen = H * (0.35 + Math.random()*0.4);
    const step = 12;
    while (length < maxLen) {
      pts.push({x, y});
      angle += (Math.random()-0.5)*0.35;
      x += Math.cos(angle)*step;
      y += Math.sin(angle)*step;
      length += step;
    }
    return {
      pts,
      alpha: 0.04 + Math.random()*0.06,
      color: Math.random() > 0.5 ? '#c41e3a' : '#ff6a00',
      width: 0.5 + Math.random()*1.2,
      speed: 0.2 + Math.random()*0.4,
      phase: Math.random()*Math.PI*2,
    };
  }

  function initCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    // Stars
    stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: Math.random()*1.8 + 0.3,
        alpha: Math.random()*0.6 + 0.15,
        twinkleSpeed: 0.008 + Math.random()*0.015,
        twinklePhase: Math.random()*Math.PI*2,
        vx: (Math.random()-0.5)*0.06,
        vy: (Math.random()-0.5)*0.04,
        static: Math.random() > 0.4,
      });
    }

    // Root lines
    roots = [];
    for (let i = 0; i < 14; i++) {
      roots.push(generateRoot(i / 13));
    }
  }

  function drawBg(t) {
    // Radial gradient bg: black center → orange → red at edges
    const cx = W*0.5, cy = H*0.5;
    const grad = ctx.createRadialGradient(cx,cy,0, cx,cy,Math.max(W,H)*0.75);
    grad.addColorStop(0,    '#050202');
    grad.addColorStop(0.4,  '#0a0302');
    grad.addColorStop(0.7,  '#160804');
    grad.addColorStop(0.85, '#220a04');
    grad.addColorStop(1,    '#2e0a04');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    // Geometric overlay: subtle grid of hexagonal dots
    ctx.save();
    ctx.globalAlpha = 0.03;
    const gridSize = 60;
    for (let gx = 0; gx < W; gx += gridSize) {
      for (let gy = 0; gy < H; gy += gridSize) {
        const offs = (Math.floor(gx/gridSize) % 2 === 0) ? 0 : gridSize/2;
        ctx.beginPath();
        ctx.arc(gx, gy+offs, 2, 0, Math.PI*2);
        ctx.fillStyle = '#ff6a00';
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawStars(t) {
    for (let s of stars) {
      s.twinklePhase += s.twinkleSpeed;
      const a = s.alpha * (0.5 + 0.5*Math.sin(s.twinklePhase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.shadowColor = 'rgba(255,220,180,0.8)';
      ctx.shadowBlur = s.r*3;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!s.static) {
        s.x += s.vx + (mouseX-0.5)*0.04;
        s.y += s.vy + (mouseY-0.5)*0.04;
        if (s.x < 0) s.x = W;
        if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H;
        if (s.y > H) s.y = 0;
      }
    }
  }

  function drawRoots(t) {
    for (let root of roots) {
      if (root.pts.length < 2) continue;
      const phase = t * root.speed + root.phase;
      const alphaMod = 0.5 + 0.5*Math.sin(phase*0.3);
      ctx.save();
      ctx.globalAlpha = root.alpha * alphaMod;
      ctx.strokeStyle = root.color;
      ctx.lineWidth   = root.width;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.shadowColor = root.color;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.moveTo(root.pts[0].x, root.pts[0].y);
      for (let j = 1; j < root.pts.length; j++) {
        ctx.lineTo(root.pts[j].x + Math.sin(t*0.0008 + j)*3, root.pts[j].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // Animated concentric geometric shapes
  function drawGeometry(t) {
    const cx = W*0.5, cy = H*0.5;
    for (let ring = 1; ring <= 4; ring++) {
      const sides = 3 + ring * 2; // 5,7,9,11
      const radius = Math.min(W,H) * (0.08 + ring*0.1);
      const rotation = t * 0.0003 * (ring % 2 === 0 ? 1 : -1);
      const alpha = 0.025 - ring * 0.003;
      ctx.save();
      ctx.globalAlpha = Math.max(0.008, alpha);
      ctx.strokeStyle = ring % 2 === 0 ? '#ff6a00' : '#c41e3a';
      ctx.lineWidth = 0.8;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      for (let s = 0; s <= sides; s++) {
        const angle = rotation + (s / sides) * Math.PI * 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        s === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  let raf_t = 0;
  function drawFrame(ts) {
    raf_t = ts;
    ctx.clearRect(0,0,W,H);
    drawBg(ts);
    drawGeometry(ts);
    drawRoots(ts);
    ctx.shadowBlur = 0;
    drawStars(ts);
    requestAnimationFrame(drawFrame);
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX / W;
    mouseY = e.clientY / H;
  });
  window.addEventListener('resize', initCanvas);
  initCanvas();
  requestAnimationFrame(drawFrame);

  /* ══════════════════════════════════════
     3. IMAGE MODAL
     ══════════════════════════════════════ */
  const modal      = document.getElementById('img-modal');
  const modalImg   = document.getElementById('modal-img');
  const modalClose = document.getElementById('modal-close');
  const bannerEl   = document.getElementById('banner-wrap');
  const profileEl  = document.getElementById('profile-wrap');
  let   lastFocus;

  function openModal(src, trigger) {
    modalImg.src = src;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    lastFocus = trigger;
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }
  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  bannerEl.addEventListener('click',  () => openModal(bannerEl.querySelector('img').src, bannerEl));
  profileEl.addEventListener('click', () => openModal(profileEl.querySelector('img').src, profileEl));
  bannerEl.addEventListener('keydown',  e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); bannerEl.click(); } });
  profileEl.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); profileEl.click(); } });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ══════════════════════════════════════
     4. LINKS — delayed navigation
     ══════════════════════════════════════ */
  document.querySelectorAll('.app-card').forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      const href = card.getAttribute('data-href');
      if (!href) return;
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        card.style.transform = '';
        window.open(href, '_blank', 'noopener,noreferrer');
      }, 480);
    });
  });

  /* ══════════════════════════════════════
     5. VISITOR COUNTER
     ══════════════════════════════════════ */
  const countEl = document.getElementById('visit-count');

  function setCount(n) {
    countEl.style.transform = 'scale(1.3)';
    countEl.textContent = Number(n).toLocaleString('ar-SA');
    setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 250);
  }

  function fetchCounter() {
    fetch('https://api.counterapi.dev/v1/jalal-cinematic-site/visitors/up')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        const val = d.count ?? d.value ?? d.hits;
        if (val !== undefined) { setCount(val); return; }
        throw new Error();
      })
      .catch(() => {
        // fallback localStorage
        let n = parseInt(localStorage.getItem('jv') || '0') + 1;
        localStorage.setItem('jv', n);
        setCount(n);
      });
  }

  fetchCounter();

})();
