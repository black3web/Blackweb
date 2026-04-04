/* ================================================================
   JALAL TR7 — BEYOND REALITY · main.js
   ▸ 5.5s loader with phases
   ▸ Canvas: stars with smoke tails + complex geometry + particles
   ▸ Visitor counter in English numerals (always)
   ▸ Zero lag · adaptive FPS · mobile optimized
   ================================================================ */
(function () {
  "use strict";

  /* ═══════════════════════════════════════════════
     DEVICE TIER — adapt complexity
  ═══════════════════════════════════════════════ */
  const isMobile   = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isLowPower = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 2 : isMobile;
  const TIER = isLowPower ? 0 : isMobile ? 1 : 2; // 0=low,1=mid,2=high

  /* ═══════════════════════════════════════════════
     1. LOADER — 5500 ms
  ═══════════════════════════════════════════════ */
  const loaderEl  = document.getElementById('loader');
  const barFill   = document.getElementById('ldr-bar');
  const barComet  = document.getElementById('ldr-comet');
  const pctEl     = document.getElementById('ldr-pct');
  const subEl     = document.getElementById('ldr-sub');
  const DURATION  = 5500;

  const STATUS_MSGS = [
    [0.00, 'INITIALIZING SYSTEM'],
    [0.20, 'LOADING ASSETS'],
    [0.45, 'RENDERING INTERFACE'],
    [0.72, 'CALIBRATING VISUALS'],
    [0.92, 'SYSTEM READY — TR7'],
  ];
  let msgIdx = 0;

  if (subEl) subEl.style.transition = 'opacity .22s ease';

  let loaderStart = null;
  function loaderFrame(ts) {
    if (!loaderStart) loaderStart = ts;
    const prog = Math.min((ts - loaderStart) / DURATION, 1);
    const pct  = Math.floor(prog * 100);

    if (barFill)  barFill.style.width = prog * 100 + '%';
    if (barComet) barComet.style.left  = 'calc(' + (prog * 100) + '% - 4px)';
    if (pctEl)    pctEl.textContent    = pct + '%';

    // Phase messages
    for (let i = STATUS_MSGS.length - 1; i >= 0; i--) {
      if (prog >= STATUS_MSGS[i][0] && msgIdx <= i) {
        msgIdx = i + 1;
        if (subEl) {
          subEl.style.opacity = '0';
          const msg = STATUS_MSGS[i][1];
          setTimeout(() => { if (subEl) { subEl.textContent = msg; subEl.style.opacity = '0.9'; } }, 180);
        }
        break;
      }
    }

    if (prog < 1) {
      requestAnimationFrame(loaderFrame);
    } else {
      setTimeout(() => {
        if (loaderEl) { loaderEl.classList.add('hidden'); }
        document.body.style.overflow = '';
      }, 320);
    }
  }
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(loaderFrame);

  /* ═══════════════════════════════════════════════
     2. CANVAS — Advanced visual engine
  ═══════════════════════════════════════════════ */
  const canvas = document.getElementById('canvas-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  let W = 0, H = 0;
  // Smooth mouse
  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;

  // Data pools
  let stars       = [];
  let smokeTrails = [];  // smoke trail particles for each star
  let geoShapes   = [];  // complex geometric shapes
  let driftLines  = [];  // organic drift lines
  let energy      = [];  // energy particles floating up

  /* ─── Resize ─── */
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; initScene(); }, 100);
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* ─── Init scene ─── */
  function initScene() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    const area = W * H;

    /* Stars with smoke trail data */
    stars = [];
    const sCount = TIER === 0 ? Math.min(80, Math.floor(area / 9000))
                 : TIER === 1 ? Math.min(150, Math.floor(area / 6500))
                 :              Math.min(240, Math.floor(area / 5000));

    for (let i = 0; i < sCount; i++) {
      stars.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        r:  Math.random() * 1.7 + 0.25,
        baseAlpha: Math.random() * 0.6 + 0.15,
        phase: Math.random() * Math.PI * 2,
        tSpeed: 0.005 + Math.random() * 0.014,
        // velocity — small drift
        vx: (Math.random() - 0.5) * (TIER === 0 ? 0.04 : 0.07),
        vy: (Math.random() - 0.5) * (TIER === 0 ? 0.03 : 0.055),
        drift: Math.random() > 0.5,
        // Trail (smoke)
        trail: [],
        trailMaxLen: TIER === 0 ? 4 : TIER === 1 ? 8 : 14,
        color: Math.random() > 0.15 ? '#ffffff' : (Math.random() > 0.5 ? '#ff4466' : '#ffaaaa'),
      });
    }

    /* Complex geometry */
    geoShapes = [];
    const gCount = TIER === 0 ? 4 : TIER === 1 ? 6 : 9;
    const gTypes = ['polygon','star','spiral','hypocycloid'];
    for (let i = 0; i < gCount; i++) {
      const type = gTypes[Math.floor(Math.random() * gTypes.length)];
      geoShapes.push({
        cx: W * (0.1 + Math.random() * 0.8),
        cy: H * (0.1 + Math.random() * 0.8),
        r:  Math.min(W, H) * (0.04 + Math.random() * 0.12),
        type,
        points: 5 + Math.floor(Math.random() * 9),   // 5–13
        inner:  0.35 + Math.random() * 0.4,
        phase:  Math.random() * Math.PI * 2,
        rotSpeed: (0.0002 + Math.random() * 0.0005) * (Math.random() > 0.5 ? 1 : -1),
        pulseAmp:  0.06 + Math.random() * 0.1,
        pulseSpeed:0.0008 + Math.random() * 0.0012,
        alpha:  0.025 + Math.random() * 0.04,
        color:  Math.random() > 0.5 ? '#ff0033' : (Math.random() > 0.5 ? '#8b0000' : '#cc001a'),
        lw:    0.5 + Math.random() * 0.8,
        // Drifts slowly
        dvx: (Math.random() - 0.5) * 0.08,
        dvy: (Math.random() - 0.5) * 0.06,
      });
    }

    /* Organic drift lines */
    driftLines = [];
    const dlCount = TIER === 0 ? 6 : TIER === 1 ? 10 : 16;
    for (let i = 0; i < dlCount; i++) {
      driftLines.push(buildDriftLine());
    }

    /* Energy particles */
    energy = [];
    const eCount = TIER === 0 ? 18 : TIER === 1 ? 35 : 55;
    for (let i = 0; i < eCount; i++) {
      energy.push(spawnEnergy(true));
    }
  }

  /* Build organic drift line */
  function buildDriftLine() {
    const pts = [];
    let x = Math.random() * W;
    let y = H * (0.85 + Math.random() * 0.2);
    let angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
    const maxLen = H * (0.28 + Math.random() * 0.45);
    const step = 13;
    let len = 0;
    while (len < maxLen) {
      pts.push({ x, y });
      angle += (Math.random() - 0.5) * 0.28;
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      len += step;
    }
    return {
      pts,
      alpha:  0.025 + Math.random() * 0.05,
      width:  0.3 + Math.random() * 0.9,
      phase:  Math.random() * Math.PI * 2,
      speed:  0.12 + Math.random() * 0.28,
      color:  Math.random() > 0.45 ? '#ff0033' : '#880010',
    };
  }

  /* Spawn energy particle */
  function spawnEnergy(anyY) {
    return {
      x:     Math.random() * W,
      y:     anyY ? Math.random() * H : H + 10,
      r:     0.5 + Math.random() * 1.8,
      alpha: 0.15 + Math.random() * 0.45,
      vx:    (Math.random() - 0.5) * 0.22,
      vy:    -(0.12 + Math.random() * 0.38),
      life:  anyY ? Math.random() : 0,
      color: Math.random() > 0.6 ? '#ff0033' : (Math.random() > 0.5 ? '#cc001a' : '#ff4466'),
      smoke: [],        // smoke trail for energy particle
      smokeMax: TIER === 0 ? 3 : TIER === 1 ? 6 : 10,
    };
  }

  /* ─── Draw background ─── */
  function drawBg() {
    // Reactive gradient: pure black center → deep red rim
    const cx = W * 0.5 + (mx - 0.5) * W * 0.05;
    const cy = H * 0.5 + (my - 0.5) * H * 0.05;
    const maxR = Math.hypot(W, H) * 0.65;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    g.addColorStop(0,    '#030000');
    g.addColorStop(0.30, '#050001');
    g.addColorStop(0.55, '#0c0102');
    g.addColorStop(0.75, '#1a0203');
    g.addColorStop(0.88, '#260304');
    g.addColorStop(1,    '#330505');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Subtle hex-grid overlay
    if (TIER > 0) {
      ctx.save();
      ctx.globalAlpha = 0.024;
      ctx.fillStyle = '#ff0033';
      const gs = 62;
      for (let gx = 0; gx < W + gs; gx += gs) {
        for (let gy = 0; gy < H + gs; gy += gs) {
          const off = (Math.floor(gx / gs) & 1) ? gs / 2 : 0;
          ctx.beginPath();
          ctx.arc(gx, gy + off, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  /* ─── Draw complex geometry ─── */
  function drawGeometry(t) {
    for (const g of geoShapes) {
      // Drift shape position
      g.cx += g.dvx; g.cy += g.dvy;
      if (g.cx < -g.r * 2)  g.cx = W + g.r;
      if (g.cx > W + g.r * 2) g.cx = -g.r;
      if (g.cy < -g.r * 2)  g.cy = H + g.r;
      if (g.cy > H + g.r * 2) g.cy = -g.r;

      const rot   = g.phase + t * g.rotSpeed;
      const pulse = 1 + g.pulseAmp * Math.sin(t * g.pulseSpeed);
      const R = g.r * pulse;

      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.strokeStyle = g.color;
      ctx.lineWidth   = g.lw;
      ctx.shadowColor = g.color;
      ctx.shadowBlur  = TIER > 0 ? 5 : 2;
      ctx.translate(g.cx, g.cy);
      ctx.beginPath();

      if (g.type === 'polygon') {
        drawPolygon(ctx, 0, 0, R, g.points, rot);
      } else if (g.type === 'star') {
        drawStar(ctx, 0, 0, R, R * g.inner, g.points, rot);
      } else if (g.type === 'spiral') {
        drawSpiral(ctx, 0, 0, R, g.points, rot, t);
      } else if (g.type === 'hypocycloid') {
        drawHypocycloid(ctx, 0, 0, R, g.points, Math.max(2, Math.floor(g.points * g.inner)), rot);
      }

      ctx.stroke();
      ctx.restore();
    }
  }

  function drawPolygon(c, x, y, r, n, rot) {
    c.moveTo(x + r * Math.cos(rot), y + r * Math.sin(rot));
    for (let i = 1; i <= n; i++) {
      const a = rot + (i / n) * Math.PI * 2;
      c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
    c.closePath();
  }

  function drawStar(c, x, y, R, r, n, rot) {
    for (let i = 0; i <= n * 2; i++) {
      const a    = rot + (i / (n * 2)) * Math.PI * 2;
      const rad  = i & 1 ? r : R;
      const px   = x + rad * Math.cos(a);
      const py   = y + rad * Math.sin(a);
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.closePath();
  }

  function drawSpiral(c, x, y, R, turns, rot, t) {
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const a    = rot + frac * turns * Math.PI * 2;
      const r    = R * frac;
      const px   = x + r * Math.cos(a);
      const py   = y + r * Math.sin(a);
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
  }

  function drawHypocycloid(c, x, y, R, k, r, rot) {
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const t2 = rot + (i / steps) * Math.PI * 2;
      const px  = x + (R - r) * Math.cos(t2) + r * Math.cos((R - r) / r * t2);
      const py  = y + (R - r) * Math.sin(t2) - r * Math.sin((R - r) / r * t2);
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.closePath();
  }

  /* ─── Draw drift lines (organic vein-like) ─── */
  function drawDriftLines(t) {
    for (const d of driftLines) {
      if (d.pts.length < 2) continue;
      const a = d.alpha * (0.5 + 0.5 * Math.sin(t * d.speed * 0.001 + d.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = d.color;
      ctx.lineWidth   = d.width;
      ctx.lineCap     = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = d.color;
      ctx.shadowBlur  = TIER > 0 ? 6 : 2;
      ctx.beginPath();
      ctx.moveTo(d.pts[0].x, d.pts[0].y);
      for (let j = 1; j < d.pts.length; j++) {
        const wave = d.pts[j].x + Math.sin(t * 0.00065 + j * 0.45) * 3;
        ctx.lineTo(wave, d.pts[j].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ─── Draw stars with smoke tails ─── */
  function drawStars(t) {
    for (const s of stars) {
      // Update twinkle
      s.phase += s.tSpeed;
      const alpha = s.baseAlpha * (0.55 + 0.45 * Math.sin(s.phase));

      // Move
      if (s.drift) {
        s.x += s.vx + (mx - 0.5) * 0.028;
        s.y += s.vy + (my - 0.5) * 0.022;
        if (s.x < -4) s.x = W + 4;
        if (s.x > W + 4) s.x = -4;
        if (s.y < -4) s.y = H + 4;
        if (s.y > H + 4) s.y = -4;
      }

      // Record trail
      s.trail.unshift({ x: s.x, y: s.y, a: alpha });
      if (s.trail.length > s.trailMaxLen) s.trail.pop();

      // Draw smoke trail
      if (TIER > 0 && s.trail.length > 1) {
        for (let j = 1; j < s.trail.length; j++) {
          const frac = 1 - j / s.trail.length;
          const ta   = alpha * frac * 0.28;
          const tr   = s.r * frac * 0.85;
          if (ta < 0.003 || tr < 0.08) continue;
          ctx.beginPath();
          ctx.arc(s.trail[j].x, s.trail[j].y, tr, 0, Math.PI * 2);
          ctx.fillStyle = s.color === '#ffffff' ? `rgba(255,200,200,${ta})` : `rgba(255,0,51,${ta * 0.7})`;
          ctx.fill();
        }
      }

      // Draw star core
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color === '#ffffff'
        ? `rgba(255,255,255,${alpha})`
        : s.color === '#ff4466'
          ? `rgba(255,68,102,${alpha})`
          : `rgba(255,200,200,${alpha})`;
      if (TIER > 0) {
        ctx.shadowColor = s.color === '#ffffff' ? 'rgba(255,220,220,0.8)' : 'rgba(255,68,102,0.7)';
        ctx.shadowBlur  = s.r * 3;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  /* ─── Draw energy particles with smoke ─── */
  function drawEnergy() {
    for (let i = 0; i < energy.length; i++) {
      const e = energy[i];

      // Move
      e.x   += e.vx + (mx - 0.5) * 0.018;
      e.y   += e.vy;
      e.life += 0.0028;

      if (e.life > 1 || e.y < -12) {
        energy[i] = spawnEnergy(false);
        continue;
      }
      const fade = Math.min(e.life * 4, 1) * Math.min((1 - e.life) * 3, 1);
      const a    = e.alpha * fade;
      if (a < 0.005) continue;

      // Smoke trail
      e.smoke.unshift({ x: e.x, y: e.y });
      if (e.smoke.length > e.smokeMax) e.smoke.pop();

      if (TIER > 0 && e.smoke.length > 1) {
        for (let j = 1; j < e.smoke.length; j++) {
          const sf   = 1 - j / e.smoke.length;
          const sa   = a * sf * 0.3;
          const sr   = e.r * sf * 1.4;
          if (sa < 0.003) continue;
          ctx.beginPath();
          // Smoke slightly wider and softer
          const grad = ctx.createRadialGradient(e.smoke[j].x, e.smoke[j].y, 0, e.smoke[j].x, e.smoke[j].y, sr * 2);
          grad.addColorStop(0,   `rgba(200,0,20,${sa * 0.7})`);
          grad.addColorStop(0.5, `rgba(100,0,10,${sa * 0.35})`);
          grad.addColorStop(1,   `rgba(50,0,5,0)`);
          ctx.arc(e.smoke[j].x, e.smoke[j].y, sr * 2, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      // Core
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      if (TIER > 0) { ctx.shadowColor = e.color; ctx.shadowBlur = e.r * 4; }
      ctx.globalAlpha = a;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  /* ─── Main loop ─── */
  let lastFPS = 60;
  let frameCnt = 0;
  let fpsTime = 0;

  function loop(ts) {
    // Smooth mouse lerp
    mx += (tmx - mx) * 0.045;
    my += (tmy - my) * 0.045;

    ctx.clearRect(0, 0, W, H);
    drawBg();
    drawGeometry(ts);
    drawDriftLines(ts);
    ctx.shadowBlur = 0;
    drawEnergy();
    ctx.shadowBlur = 0;
    drawStars(ts);
    ctx.shadowBlur = 0;

    requestAnimationFrame(loop);
  }

  /* ─── Input ─── */
  window.addEventListener('mousemove', e => { tmx = e.clientX / W; tmy = e.clientY / H; }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) { tmx = e.touches[0].clientX / W; tmy = e.touches[0].clientY / H; }
  }, { passive: true });

  /* Start */
  initScene();
  requestAnimationFrame(loop);

  /* ═══════════════════════════════════════════════
     3. IMAGE MODAL
  ═══════════════════════════════════════════════ */
  const modal      = document.getElementById('img-modal');
  const modalImg   = document.getElementById('modal-img');
  const modalClose = document.getElementById('modal-close');
  const bannerEl   = document.getElementById('banner-wrap');
  const profileEl  = document.getElementById('profile-wrap');
  let   lastFocus  = null;

  function openModal(src, trigger) {
    if (!modal || !modalImg) return;
    modalImg.src = '';
    setTimeout(() => { modalImg.src = src; }, 10);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lastFocus = trigger;
    document.body.style.overflow = 'hidden';
    if (modalClose) setTimeout(() => modalClose.focus(), 50);
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  function getImgSrc(el) {
    const img = el ? el.querySelector('img') : null;
    return img ? img.src : '';
  }

  if (bannerEl) {
    bannerEl.addEventListener('click',   () => openModal(getImgSrc(bannerEl), bannerEl));
    bannerEl.addEventListener('keydown', e  => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bannerEl.click(); } });
  }
  if (profileEl) {
    profileEl.addEventListener('click',   () => openModal(getImgSrc(profileEl), profileEl));
    profileEl.addEventListener('keydown', e  => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); profileEl.click(); } });
  }
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
    modalClose.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeModal(); } });
  }
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ═══════════════════════════════════════════════
     4. LINK CARDS
  ═══════════════════════════════════════════════ */
  document.querySelectorAll('.app-card').forEach(card => {
    card.addEventListener('click', () => {
      const href = card.getAttribute('data-href');
      if (!href) return;
      card.style.transition  = 'transform .14s ease, box-shadow .14s ease';
      card.style.transform   = 'scale(0.93)';
      card.style.boxShadow   = '0 4px 12px rgba(255,0,51,0.22)';
      setTimeout(() => {
        card.style.transform  = '';
        card.style.boxShadow  = '';
        setTimeout(() => { card.style.transition = ''; }, 60);
        window.open(href, '_blank', 'noopener,noreferrer');
      }, 180);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  /* ═══════════════════════════════════════════════
     5. VISITOR COUNTER
     ▸ English numerals ONLY (toLocaleString('en-US'))
     ▸ Every page load = +1 (real visit count)
     ▸ Tries counterapi.dev → hitcount → localStorage fallback
     ▸ Auto-refresh every 30s (shows live count when others visit)
  ═══════════════════════════════════════════════ */
  const countEl  = document.getElementById('visit-count');
  const LS_KEY   = 'tr7_lv';          // local visit count

  /* Format number always in English */
  function fmtNum(n) {
    return Number(n).toLocaleString('en-US');
  }

  /* Animate counter roll-up */
  function animateCounter(target) {
    if (!countEl) return;
    const rawText = (countEl.textContent || '0').replace(/[^0-9]/g, '');
    const from    = parseInt(rawText) || 0;
    if (from === target) return;

    const diff    = target - from;
    const steps   = Math.min(Math.abs(diff), 55);
    const stepMs  = Math.max(800 / steps, 12);
    let   i       = 0;

    const timer = setInterval(() => {
      i++;
      const cur = Math.round(from + diff * (i / steps));
      countEl.textContent = fmtNum(cur);
      if (i >= steps) {
        clearInterval(timer);
        countEl.textContent = fmtNum(target);
      }
    }, stepMs);

    // bounce
    countEl.style.transform = 'scale(1.3)';
    setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 300);
  }

  function setVisitCount(n) {
    const num = parseInt(n);
    if (!isNaN(num) && num >= 0) animateCounter(num);
  }

  /* Local fallback — increments on every load */
  function localCount() {
    const n = (parseInt(localStorage.getItem(LS_KEY)) || 0) + 1;
    localStorage.setItem(LS_KEY, String(n));
    setVisitCount(n);
  }

  /* Primary: counterapi.dev — increments on every load */
  function fetchCount() {
    const ctrl = new AbortController();
    const to   = setTimeout(() => ctrl.abort(), 4500);

    // Always /up to count every visit
    fetch('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits/up', {
      signal: ctrl.signal,
      cache: 'no-store',
    })
    .then(r => { clearTimeout(to); if (!r.ok) throw 0; return r.json(); })
    .then(d => {
      const v = d.count ?? d.value ?? d.hits;
      if (v != null) { setVisitCount(v); return; }
      throw 0;
    })
    .catch(() => {
      clearTimeout(to);
      // Fallback 2: hitcount.io
      const ctrl2 = new AbortController();
      const to2   = setTimeout(() => ctrl2.abort(), 3500);
      fetch('https://hitcount.io/api/count?url=tr7-jalal-blackweb&increment=true', {
        signal: ctrl2.signal, cache: 'no-store',
      })
      .then(r => { clearTimeout(to2); if (!r.ok) throw 0; return r.json(); })
      .then(d => {
        const v = d.count ?? d.hits ?? d.value;
        if (v != null) { setVisitCount(v); return; }
        throw 0;
      })
      .catch(() => { clearTimeout(to2); localCount(); });
    });
  }

  fetchCount();

  // Auto-refresh count every 30 seconds (shows when others visit)
  setInterval(() => {
    const ctrl = new AbortController();
    const to   = setTimeout(() => ctrl.abort(), 3500);
    fetch('https://api.counterapi.dev/v1/tr7-jalal-blackweb/visits', {
      signal: ctrl.signal, cache: 'no-store',
    })
    .then(r => { clearTimeout(to); if (!r.ok) throw 0; return r.json(); })
    .then(d => {
      const v = d.count ?? d.value ?? d.hits;
      if (v != null) {
        const cur = parseInt((countEl.textContent || '0').replace(/[^0-9]/g, '')) || 0;
        if (v !== cur) animateCounter(v);
      }
    })
    .catch(() => clearTimeout(to));
  }, 30000);

  /* ═══════════════════════════════════════════════
     6. ENTRANCE ANIMATION
  ═══════════════════════════════════════════════ */
  const mainCard = document.getElementById('main-card');
  if (mainCard) {
    mainCard.style.cssText += ';opacity:0;transform:translateY(28px);transition:opacity .95s cubic-bezier(.16,1,.3,1),transform .95s cubic-bezier(.16,1,.3,1)';
    setTimeout(() => {
      mainCard.style.opacity   = '1';
      mainCard.style.transform = 'translateY(0)';
    }, DURATION + 420);
  }

})();
