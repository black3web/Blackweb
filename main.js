/* ================================================================
   JALAL TR7 — ZERO LAG ENGINE · main.js
   ▸ Hard 30fps cap via delta-time throttle
   ▸ BG gradient cached — drawn once per resize (NOT every frame)
   ▸ NO ctx.shadowBlur anywhere (biggest GPU killer removed)
   ▸ Lissajous + Spirograph complex shapes
   ▸ Stars with soft smoke trails (gradient circles, no shadow)
   ▸ English numerals counter, increments every visit
   ▸ Adaptive tier: fewer particles on weak devices
   ================================================================ */
(function () {
  "use strict";

  /* ═══════════════════════════════════════
     DEVICE TIER
  ═══════════════════════════════════════ */
  const IS_MOBILE  = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const CORES      = navigator.hardwareConcurrency || 2;
  const IS_LOW     = CORES <= 2 || IS_MOBILE;
  const TIER       = IS_LOW ? 0 : CORES <= 4 ? 1 : 2;

  /* ═══════════════════════════════════════
     1. LOADER — 5500ms
  ═══════════════════════════════════════ */
  const loaderEl = document.getElementById('loader');
  const fillEl   = document.getElementById('ldr-fill');
  const headEl   = document.getElementById('ldr-head');
  const pctEl    = document.getElementById('ldr-pct');
  const statEl   = document.getElementById('ldr-status');
  const LDUR     = 5500;

  const PHASES = [
    [0.00, 'INITIALIZING SYSTEM'],
    [0.20, 'LOADING ASSETS'],
    [0.45, 'RENDERING INTERFACE'],
    [0.72, 'CALIBRATING VISUALS'],
    [0.92, 'SYSTEM READY — TR7'],
  ];
  let phIdx = 0;
  if (statEl) statEl.style.transition = 'opacity .2s';

  let ldStart = null;
  function ldFrame(ts) {
    if (!ldStart) ldStart = ts;
    const prog = Math.min((ts - ldStart) / LDUR, 1);
    const pct  = Math.floor(prog * 100);
    if (fillEl) fillEl.style.width = prog * 100 + '%';
    if (headEl) headEl.style.left  = 'calc(' + (prog * 100) + '% - 4px)';
    if (pctEl)  pctEl.textContent  = pct + '%';
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (prog >= PHASES[i][0] && phIdx <= i) {
        phIdx = i + 1;
        if (statEl) {
          statEl.style.opacity = '0';
          const m = PHASES[i][1];
          setTimeout(() => { if (statEl) { statEl.textContent = m; statEl.style.opacity = '.9'; } }, 170);
        }
        break;
      }
    }
    if (prog < 1) requestAnimationFrame(ldFrame);
    else setTimeout(() => { if (loaderEl) loaderEl.classList.add('hidden'); document.body.style.overflow = ''; }, 300);
  }
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(ldFrame);

  /* ═══════════════════════════════════════
     2. CANVAS ENGINE — 30fps hard cap
  ═══════════════════════════════════════ */
  const canvas = document.getElementById('canvas-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  /* 30fps = ~33.33ms per frame */
  const FPS_CAP    = 30;
  const FRAME_MS   = 1000 / FPS_CAP;
  let lastFrameTs  = 0;

  let W = 0, H = 0;
  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;

  /* ── Cached background canvas (drawn ONCE per resize) ── */
  let bgCache   = null;
  let bgCacheW  = 0, bgCacheH = 0;

  function buildBgCache() {
    bgCache  = document.createElement('canvas');
    bgCache.width = W; bgCache.height = H;
    bgCacheW = W; bgCacheH = H;
    const bc = bgCache.getContext('2d', { alpha: false });
    const maxR = Math.hypot(W, H) * 0.65;
    const g = bc.createRadialGradient(W * .5, H * .5, 0, W * .5, H * .5, maxR);
    g.addColorStop(0,    '#030000');
    g.addColorStop(0.30, '#050001');
    g.addColorStop(0.55, '#0c0102');
    g.addColorStop(0.75, '#1a0203');
    g.addColorStop(0.88, '#260304');
    g.addColorStop(1,    '#330505');
    bc.fillStyle = g;
    bc.fillRect(0, 0, W, H);

    /* Dot grid baked into cache */
    if (TIER > 0) {
      bc.globalAlpha = 0.022;
      bc.fillStyle   = '#ff0033';
      const gs = 62;
      for (let gx = 0; gx < W + gs; gx += gs)
        for (let gy = 0; gy < H + gs; gy += gs) {
          const off = (Math.floor(gx / gs) & 1) ? gs / 2 : 0;
          bc.beginPath(); bc.arc(gx, gy + off, 1.1, 0, Math.PI * 2); bc.fill();
        }
      bc.globalAlpha = 1;
    }
  }

  function drawBg() {
    /* Parallax shift of cached BG — only transform, no recompute */
    if (!bgCache || bgCacheW !== W || bgCacheH !== H) buildBgCache();
    const ox = (mx - 0.5) * W * 0.016;
    const oy = (my - 0.5) * H * 0.016;
    ctx.drawImage(bgCache, ox, oy, W + Math.abs(ox), H + Math.abs(oy));
  }

  /* ── Scene data ── */
  let stars  = [];
  let shapes = [];
  let drifts = [];
  let enrgy  = [];

  function initScene() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildBgCache();

    const area = W * H;

    /* Stars */
    stars = [];
    const sN = TIER === 0 ? Math.min(70,  Math.floor(area / 9500))
             : TIER === 1 ? Math.min(130, Math.floor(area / 6800))
             :               Math.min(210, Math.floor(area / 5200));
    for (let i = 0; i < sN; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.6 + 0.22,
        ba: Math.random() * 0.58 + 0.14,
        ph: Math.random() * Math.PI * 2,
        ts: 0.0045 + Math.random() * 0.011,
        vx: (Math.random() - 0.5) * (TIER < 2 ? 0.04 : 0.07),
        vy: (Math.random() - 0.5) * (TIER < 2 ? 0.03 : 0.055),
        drift: Math.random() > 0.5,
        trail: [],
        tLen: TIER === 0 ? 3 : TIER === 1 ? 7 : 13,
        col: Math.random() > 0.15 ? 0 : Math.random() > 0.5 ? 1 : 2,
        // 0=white,1=red,2=pink
      });
    }

    /* Complex shapes */
    shapes = [];
    const shN = TIER === 0 ? 4 : TIER === 1 ? 6 : 9;
    for (let i = 0; i < shN; i++) shapes.push(mkShape());

    /* Drift lines */
    drifts = [];
    const dN = TIER === 0 ? 5 : TIER === 1 ? 9 : 15;
    for (let i = 0; i < dN; i++) drifts.push(mkDrift());

    /* Energy particles */
    enrgy = [];
    const eN = TIER === 0 ? 15 : TIER === 1 ? 28 : 48;
    for (let i = 0; i < eN; i++) enrgy.push(mkEnergy(true));
  }

  /* ── Shape factory — Lissajous / Spirograph ── */
  function mkShape() {
    const types = ['lissajous','spirograph','rosette','harmonograph'];
    const type  = types[Math.floor(Math.random() * types.length)];
    return {
      cx: W * (0.08 + Math.random() * 0.84),
      cy: H * (0.08 + Math.random() * 0.84),
      r:  Math.min(W, H) * (0.045 + Math.random() * 0.11),
      type,
      a: 1 + Math.floor(Math.random() * 4),   // frequency a
      b: 1 + Math.floor(Math.random() * 4),   // frequency b
      d: Math.random() * Math.PI * 0.5,        // phase delta
      k: 3 + Math.floor(Math.random() * 8),    // petals/arms
      ph:  Math.random() * Math.PI * 2,
      rSp: (0.00018 + Math.random() * 0.00035) * (Math.random() > .5 ? 1 : -1),
      pAmp:0.055 + Math.random() * 0.09,
      pSpd:0.0006 + Math.random() * 0.001,
      al:  0.02 + Math.random() * 0.035,
      col: Math.random() > .5 ? '#ff0033' : (Math.random() > .5 ? '#8b0000' : '#cc001a'),
      lw:  0.45 + Math.random() * 0.7,
      dvx: (Math.random() - 0.5) * 0.07,
      dvy: (Math.random() - 0.5) * 0.055,
    };
  }

  function mkDrift() {
    const pts = [];
    let x = Math.random() * W, y = H * (0.8 + Math.random() * 0.25);
    let angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.88;
    const maxLen = H * (0.25 + Math.random() * 0.45), step = 13;
    let len = 0;
    while (len < maxLen) {
      pts.push({ x, y });
      angle += (Math.random() - 0.5) * 0.26;
      x += Math.cos(angle) * step; y += Math.sin(angle) * step; len += step;
    }
    return {
      pts,
      al: 0.022 + Math.random() * 0.045,
      lw: 0.3 + Math.random() * 0.85,
      ph: Math.random() * Math.PI * 2,
      sp: 0.1 + Math.random() * 0.25,
      col: Math.random() > .45 ? '#ff0033' : '#880010',
    };
  }

  function mkEnergy(anyY) {
    return {
      x:  Math.random() * W,
      y:  anyY ? Math.random() * H : H + 8,
      r:  0.5 + Math.random() * 1.7,
      al: 0.14 + Math.random() * 0.42,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(0.1 + Math.random() * 0.35),
      life: anyY ? Math.random() : 0,
      col: Math.random() > .55 ? '#ff0033' : (Math.random() > .5 ? '#cc001a' : '#ff4466'),
      trail: [],
      tLen: TIER === 0 ? 2 : TIER === 1 ? 5 : 9,
    };
  }

  /* ── Draw background (cached image) ── */
  /* Already done via drawBg() above */

  /* ── Draw complex shapes — NO shadowBlur ── */
  function drawShapes(t) {
    for (const g of shapes) {
      g.cx += g.dvx; g.cy += g.dvy;
      if (g.cx < -g.r * 2) g.cx = W + g.r;
      if (g.cx > W + g.r * 2) g.cx = -g.r;
      if (g.cy < -g.r * 2) g.cy = H + g.r;
      if (g.cy > H + g.r * 2) g.cy = -g.r;

      const rot   = g.ph + t * g.rSp;
      const pulse = 1 + g.pAmp * Math.sin(t * g.pSpd);
      const R     = g.r * pulse;
      const steps = TIER === 0 ? 90 : 140;

      ctx.save();
      ctx.globalAlpha = g.al;
      ctx.strokeStyle = g.col;
      ctx.lineWidth   = g.lw;
      ctx.translate(g.cx, g.cy);
      ctx.rotate(rot);
      ctx.beginPath();

      if (g.type === 'lissajous') {
        /* Lissajous: x=R·sin(a·t+d), y=R·sin(b·t) */
        for (let i = 0; i <= steps; i++) {
          const th = (i / steps) * Math.PI * 2;
          const px = R * Math.sin(g.a * th + g.d);
          const py = R * Math.sin(g.b * th);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      } else if (g.type === 'spirograph') {
        /* Hypotrochoid: r + d·cos variant */
        const ri = R * 0.38, ro = R * 0.62;
        for (let i = 0; i <= steps * 3; i++) {
          const th = (i / (steps * 3)) * Math.PI * 2;
          const px = (ro - ri) * Math.cos(th) + ri * Math.cos((ro - ri) / ri * th + g.d);
          const py = (ro - ri) * Math.sin(th) - ri * Math.sin((ro - ri) / ri * th + g.d);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      } else if (g.type === 'rosette') {
        /* Rose curve: r = R·cos(k·θ) */
        for (let i = 0; i <= steps * 2; i++) {
          const th = (i / (steps * 2)) * Math.PI * 2;
          const r  = R * Math.cos(g.k * th);
          const px = r * Math.cos(th);
          const py = r * Math.sin(th);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else { /* harmonograph */
        for (let i = 0; i <= steps; i++) {
          const th = (i / steps) * Math.PI * 4;
          const decay = Math.exp(-0.001 * i);
          const px = R * Math.sin(g.a * th + g.d) * decay;
          const py = R * Math.cos(g.b * th) * Math.cos(g.d * 0.5) * decay;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      }

      ctx.stroke();
      /* Tiny bright core — no shadow, use fillStyle directly */
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = g.col;
      ctx.globalAlpha = g.al * 3.5;
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Draw drift lines — NO shadowBlur ── */
  function drawDrifts(t) {
    for (const d of drifts) {
      if (d.pts.length < 2) continue;
      const a = d.al * (0.5 + 0.5 * Math.sin(t * d.sp * 0.001 + d.ph));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = d.col;
      ctx.lineWidth   = d.lw;
      ctx.lineCap     = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(d.pts[0].x, d.pts[0].y);
      for (let j = 1; j < d.pts.length; j++) {
        const wx = d.pts[j].x + Math.sin(t * 0.00062 + j * 0.44) * 2.8;
        ctx.lineTo(wx, d.pts[j].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── Draw stars with smoke trails — NO shadowBlur ── */
  function drawStars(t) {
    for (const s of stars) {
      s.ph += s.ts;
      const a = s.ba * (0.55 + 0.45 * Math.sin(s.ph));

      /* Move */
      if (s.drift) {
        s.x += s.vx + (mx - 0.5) * 0.024;
        s.y += s.vy + (my - 0.5) * 0.019;
        if (s.x < -4) s.x = W + 4; if (s.x > W + 4) s.x = -4;
        if (s.y < -4) s.y = H + 4; if (s.y > H + 4) s.y = -4;
      }

      /* Record trail */
      s.trail.unshift({ x: s.x, y: s.y });
      if (s.trail.length > s.tLen) s.trail.pop();

      /* Smoke trail — gradient circle, NOT shadow */
      if (TIER > 0 && s.trail.length > 1) {
        for (let j = 1; j < s.trail.length; j++) {
          const frac = 1 - j / s.trail.length;
          const ta   = a * frac * 0.22;
          const tr   = s.r * frac * 1.4;
          if (ta < 0.004 || tr < 0.06) continue;
          const grd = ctx.createRadialGradient(
            s.trail[j].x, s.trail[j].y, 0,
            s.trail[j].x, s.trail[j].y, tr * 2.2);
          const col = s.col === 1 ? '200,0,30' : s.col === 2 ? '255,100,120' : '220,200,200';
          grd.addColorStop(0, `rgba(${col},${ta})`);
          grd.addColorStop(1, `rgba(${col},0)`);
          ctx.beginPath();
          ctx.arc(s.trail[j].x, s.trail[j].y, tr * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
      }

      /* Star core */
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      const cr = s.col === 1 ? `rgba(255,0,51,${a})` : s.col === 2 ? `rgba(255,160,170,${a})` : `rgba(255,255,255,${a})`;
      ctx.fillStyle = cr;
      ctx.globalAlpha = 1;
      ctx.fill();
    }
  }

  /* ── Draw energy particles with smoke — NO shadowBlur ── */
  function drawEnergy(t) {
    for (let i = 0; i < enrgy.length; i++) {
      const e = enrgy[i];
      e.x += e.vx + (mx - 0.5) * 0.015;
      e.y += e.vy;
      e.life += 0.0025;
      if (e.life > 1 || e.y < -12) { enrgy[i] = mkEnergy(false); continue; }

      const fade = Math.min(e.life * 4, 1) * Math.min((1 - e.life) * 3, 1);
      const a = e.al * fade;
      if (a < 0.006) continue;

      /* Trail */
      e.trail.unshift({ x: e.x, y: e.y });
      if (e.trail.length > e.tLen) e.trail.pop();

      if (TIER > 0 && e.trail.length > 1) {
        for (let j = 1; j < e.trail.length; j++) {
          const sf = 1 - j / e.trail.length;
          const sa = a * sf * 0.28;
          const sr = e.r * sf * 1.8;
          if (sa < 0.004) continue;
          const grd = ctx.createRadialGradient(
            e.trail[j].x, e.trail[j].y, 0,
            e.trail[j].x, e.trail[j].y, sr * 2);
          grd.addColorStop(0, `rgba(200,0,20,${sa * .75})`);
          grd.addColorStop(0.5, `rgba(80,0,8,${sa * .35})`);
          grd.addColorStop(1, 'rgba(40,0,4,0)');
          ctx.beginPath();
          ctx.arc(e.trail[j].x, e.trail[j].y, sr * 2, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
      }

      /* Core */
      const grd2 = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 2.5);
      grd2.addColorStop(0, e.col.replace(')', `,${a})`).replace('rgb', 'rgba').replace('#ff0033', `rgba(255,0,51,${a})`).replace('#cc001a', `rgba(204,0,26,${a})`).replace('#ff4466', `rgba(255,68,102,${a})`));
      grd2.addColorStop(1, 'rgba(0,0,0,0)');
      // Simpler approach:
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.globalAlpha = a;
      ctx.fillStyle = e.col;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ── Main loop with 30fps cap ── */
  function loop(ts) {
    requestAnimationFrame(loop);
    const delta = ts - lastFrameTs;
    if (delta < FRAME_MS - 1) return; /* skip frame if too early */
    lastFrameTs = ts - (delta % FRAME_MS);

    /* Smooth mouse lerp */
    mx += (tmx - mx) * 0.04;
    my += (tmy - my) * 0.04;

    ctx.clearRect(0, 0, W, H);
    drawBg();
    drawShapes(ts);
    drawDrifts(ts);
    drawEnergy(ts);
    drawStars(ts);
  }

  /* ── Input ── */
  window.addEventListener('mousemove', e => { tmx = e.clientX / W; tmy = e.clientY / H; }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) { tmx = e.touches[0].clientX / W; tmy = e.touches[0].clientY / H; }
  }, { passive: true });

  /* ── Resize debounce ── */
  let rzTimer;
  window.addEventListener('resize', () => { clearTimeout(rzTimer); rzTimer = setTimeout(initScene, 150); }, { passive: true });

  initScene();
  requestAnimationFrame(loop);

  /* ═══════════════════════════════════════
     3. IMAGE MODAL
  ═══════════════════════════════════════ */
  const modal     = document.getElementById('img-modal');
  const modalImg  = document.getElementById('modal-img');
  const mClose    = document.getElementById('modal-close');
  const bannerEl  = document.getElementById('banner-wrap');
  const profileEl = document.getElementById('profile-wrap');
  let   lastFocus = null;

  function openModal(src, trig) {
    if (!modal || !modalImg) return;
    modalImg.src = ''; setTimeout(() => { modalImg.src = src; }, 10);
    modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
    lastFocus = trig; document.body.style.overflow = 'hidden';
    if (mClose) setTimeout(() => mClose.focus(), 55);
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  function imgOf(el) { const i = el && el.querySelector('img'); return i ? i.src : ''; }

  if (bannerEl)  { bannerEl.addEventListener('click',   () => openModal(imgOf(bannerEl), bannerEl)); bannerEl.addEventListener('keydown',  e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); bannerEl.click(); } }); }
  if (profileEl) { profileEl.addEventListener('click',  () => openModal(imgOf(profileEl), profileEl)); profileEl.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); profileEl.click(); } }); }
  if (mClose)    { mClose.addEventListener('click', closeModal); mClose.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); closeModal(); } }); }
  if (modal)     modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ═══════════════════════════════════════
     4. LINK CARDS
  ═══════════════════════════════════════ */
  document.querySelectorAll('.app-card').forEach(card => {
    card.addEventListener('click', () => {
      const href = card.getAttribute('data-href');
      if (!href) return;
      card.style.transition = 'transform .13s ease';
      card.style.transform  = 'scale(0.92)';
      setTimeout(() => {
        card.style.transform  = '';
        setTimeout(() => { card.style.transition = ''; }, 55);
        window.open(href, '_blank', 'noopener,noreferrer');
      }, 175);
    });
    card.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); card.click(); } });
  });

  /* ═══════════════════════════════════════
     5. VISITOR COUNTER
     ▸ English numerals ONLY (en-US)
     ▸ Every page load = +1
     ▸ Auto-refresh every 30s
     ▸ 3-API fallback chain
  ═══════════════════════════════════════ */
  const countEl = document.getElementById('visit-count');
  const LS_KEY  = 'tr7_lv';

  /* Always English digits */
  function fmt(n) { return Number(n).toLocaleString('en-US'); }

  function rollTo(target) {
    if (!countEl) return;
    const from = parseInt((countEl.textContent || '0').replace(/[^0-9]/g, '')) || 0;
    if (from === target) return;
    const diff  = target - from;
    const steps = Math.min(Math.abs(diff), 50);
    const ms    = Math.max(Math.floor(900 / steps), 12);
    let i = 0;
    const tid = setInterval(() => {
      i++;
      countEl.textContent = fmt(Math.round(from + diff * i / steps));
      if (i >= steps) { clearInterval(tid); countEl.textContent = fmt(target); }
    }, ms);
    countEl.style.transform = 'scale(1.3)';
    setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 295);
  }

  function localFallback() {
    const n = (parseInt(localStorage.getItem(LS_KEY)) || 0) + 1;
    localStorage.setItem(LS_KEY, String(n));
    rollTo(n);
  }

  function tryAPI(url, fallback) {
    const ctrl = new AbortController();
    const to   = setTimeout(() => ctrl.abort(), 4200);
    return fetch(url, { signal: ctrl.signal, cache: 'no-store' })
      .then(r => { clearTimeout(to); if (!r.ok) throw 0; return r.json(); })
      .then(d => {
        const v = d.count ?? d.value ?? d.hits ?? d.visit_count;
        if (v != null) { rollTo(parseInt(v)); return true; }
        throw 0;
      })
      .catch(() => { clearTimeout(to); return fallback ? fallback() : false; });
  }

  /* Chain: counterapi → hitcount → local */
  function fetchCount() {
    tryAPI('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits/up', () =>
      tryAPI('https://api.hitcounterapp.com/hit?url=tr7-jalal-blackweb', localFallback)
    );
  }

  fetchCount();

  /* Live refresh every 30s (read-only, no increment) */
  setInterval(() => {
    const ctrl = new AbortController();
    const to   = setTimeout(() => ctrl.abort(), 3200);
    fetch('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits', { signal: ctrl.signal, cache: 'no-store' })
      .then(r => { clearTimeout(to); if (!r.ok) throw 0; return r.json(); })
      .then(d => { const v = d.count ?? d.value; if (v != null) { const c = parseInt((countEl.textContent||'0').replace(/[^0-9]/g,'')); if (parseInt(v) !== c) rollTo(parseInt(v)); } })
      .catch(() => clearTimeout(to));
  }, 30000);

  /* ═══════════════════════════════════════
     6. ENTRANCE REVEAL
  ═══════════════════════════════════════ */
  const mainCard = document.getElementById('main-card');
  if (mainCard) {
    Object.assign(mainCard.style, {
      opacity:'0', transform:'translateY(26px)',
      transition:'opacity .92s cubic-bezier(.16,1,.3,1),transform .92s cubic-bezier(.16,1,.3,1)'
    });
    setTimeout(() => {
      mainCard.style.opacity = '1';
      mainCard.style.transform = 'translateY(0)';
    }, LDUR + 400);
  }

})();
