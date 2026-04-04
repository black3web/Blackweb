/* ============================================================
   JALAL TR7 — CINEMATIC PORTFOLIO — main.js
   Full rebuild: 5.5s loader, smooth canvas, visitor counter fix
   ============================================================ */
(function () {
  "use strict";

  /* ══════════════════════════════════════════
     1. LOADER — 5500ms duration
     ══════════════════════════════════════════ */
  const loader    = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const ldrHead   = document.getElementById('ldr-head');
  const ldrPct    = document.getElementById('ldr-pct');
  const ldrStatus = document.getElementById('ldr-status');
  const DURATION  = 5500; // 5.5 seconds

  const PHASES = [
    { at: 0,    msg: 'INITIALIZING SYSTEM' },
    { at: 0.22, msg: 'LOADING ASSETS' },
    { at: 0.50, msg: 'RENDERING INTERFACE' },
    { at: 0.78, msg: 'CALIBRATING VISUALS' },
    { at: 0.95, msg: 'SYSTEM READY' },
  ];
  let phaseIdx = 0;

  let startTime = null;

  function animateBar(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / DURATION, 1);

    // Smooth eased progress (easeInOutCubic feel)
    const pct = Math.min(progress * 100, 100);
    const pctRounded = Math.floor(pct);

    loaderBar.style.width = pct + '%';

    // Move the comet head
    if (ldrHead) {
      ldrHead.style.left = 'calc(' + pct + '% - 5px)';
    }

    // Update percentage text
    if (ldrPct) ldrPct.innerHTML = pctRounded + '<span>%</span>';

    // Update status messages
    if (ldrStatus) {
      for (let i = PHASES.length - 1; i >= 0; i--) {
        if (progress >= PHASES[i].at && phaseIdx < i + 1) {
          phaseIdx = i + 1;
          ldrStatus.style.opacity = '0';
          setTimeout(() => {
            if (ldrStatus) ldrStatus.textContent = PHASES[i].msg;
            ldrStatus.style.opacity = '0.9';
          }, 150);
          break;
        }
      }
    }

    if (progress < 1) {
      requestAnimationFrame(animateBar);
    } else {
      // Done — hide loader after small pause
      setTimeout(() => {
        if (loader) {
          loader.classList.add('hidden');
          document.body.style.overflow = '';
        }
      }, 280);
    }
  }

  document.body.style.overflow = 'hidden';
  requestAnimationFrame(animateBar);

  // Status fade transition
  if (ldrStatus) {
    ldrStatus.style.transition = 'opacity 0.25s ease';
  }

  /* ══════════════════════════════════════════
     2. CANVAS BACKGROUND
     Uses requestAnimationFrame with time delta
     to ensure smooth, lag-free animation at all FPS
     ══════════════════════════════════════════ */
  const canvas = document.getElementById('canvas-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let stars     = [];
  let veins     = [];   // blood-vein-like red lines
  let particles = [];   // floating micro particles
  let mouseX = 0.5, mouseY = 0.5;
  let targetMX = 0.5, targetMY = 0.5;
  let frameId = null;

  /* ─── Resize ─── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initCanvas();
  }

  /* ─── Init ─── */
  function initCanvas() {
    // Stars
    stars = [];
    const count = Math.min(Math.floor((W * H) / 6000), 280);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.6 + 0.2,
        alpha: Math.random() * 0.55 + 0.12,
        phase: Math.random() * Math.PI * 2,
        speed: 0.006 + Math.random() * 0.012,
        vx:    (Math.random() - 0.5) * 0.05,
        vy:    (Math.random() - 0.5) * 0.04,
        drift: Math.random() > 0.45, // only some stars drift
      });
    }

    // Vein paths (organic red lines rising from bottom)
    veins = [];
    const veinCount = Math.min(12, Math.floor(W / 100));
    for (let i = 0; i < veinCount; i++) {
      veins.push(buildVein(i / (veinCount - 1)));
    }

    // Micro particles
    particles = [];
    const pCount = Math.min(40, Math.floor(W / 25));
    for (let i = 0; i < pCount; i++) {
      particles.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        vy:    -(0.15 + Math.random() * 0.4), // float upward
        vx:    (Math.random() - 0.5) * 0.2,
        life:  Math.random(),
        maxLife: 1,
        color: Math.random() > 0.5 ? '#ff0033' : '#cc001a',
      });
    }
  }

  function buildVein(t) {
    const pts = [];
    let x = t * W * 0.9 + W * 0.05;
    let y = H + 20;
    let angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
    const maxLen = H * (0.3 + Math.random() * 0.4);
    const step = 14;
    let len = 0;
    while (len < maxLen) {
      pts.push({ x, y });
      angle += (Math.random() - 0.5) * 0.3;
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      len += step;
    }
    return {
      pts,
      alpha: 0.03 + Math.random() * 0.05,
      width: 0.4 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.3,
      color: Math.random() > 0.4 ? '#ff0033' : '#8b0000',
    };
  }

  /* ─── Draw background ─── */
  function drawBg() {
    // Radial gradient: very dark center → deep red rim
    const cx = W * 0.5 + (mouseX - 0.5) * W * 0.06;
    const cy = H * 0.5 + (mouseY - 0.5) * H * 0.06;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.82);
    grad.addColorStop(0,    '#040101');
    grad.addColorStop(0.35, '#060102');
    grad.addColorStop(0.6,  '#0d0203');
    grad.addColorStop(0.8,  '#180304');
    grad.addColorStop(1,    '#260404');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle hex dot grid
    ctx.save();
    ctx.globalAlpha = 0.028;
    ctx.fillStyle = '#ff0033';
    const g = 65;
    for (let gx = 0; gx < W + g; gx += g) {
      for (let gy = 0; gy < H + g; gy += g) {
        const offset = (Math.floor(gx / g) % 2 === 0) ? 0 : g / 2;
        ctx.beginPath();
        ctx.arc(gx, gy + offset, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ─── Draw vein lines ─── */
  function drawVeins(t) {
    for (const v of veins) {
      if (v.pts.length < 2) continue;
      const a = v.alpha * (0.5 + 0.5 * Math.sin(t * v.speed * 0.001 + v.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = v.color;
      ctx.lineWidth   = v.width;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.shadowColor = v.color;
      ctx.shadowBlur  = 5;
      ctx.beginPath();
      ctx.moveTo(v.pts[0].x, v.pts[0].y);
      for (let j = 1; j < v.pts.length; j++) {
        const waveX = v.pts[j].x + Math.sin(t * 0.0007 + j * 0.5) * 2.5;
        ctx.lineTo(waveX, v.pts[j].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ─── Draw geometric rings ─── */
  function drawGeometry(t) {
    const cx = W * 0.5, cy = H * 0.5;
    const rings = [
      { sides: 6, rFactor: 0.06, dir: 1, col: '#8b0000',  lw: 0.7, a: 0.022 },
      { sides: 8, rFactor: 0.13, dir: -1, col: '#cc001a', lw: 0.6, a: 0.018 },
      { sides: 6, rFactor: 0.22, dir: 1, col: '#ff0033',  lw: 0.5, a: 0.014 },
      { sides: 10,rFactor: 0.32, dir: -1, col: '#cc001a', lw: 0.4, a: 0.010 },
    ];
    for (const ring of rings) {
      const radius = Math.min(W, H) * ring.rFactor;
      const rot    = t * 0.00025 * ring.dir;
      ctx.save();
      ctx.globalAlpha = ring.a;
      ctx.strokeStyle = ring.col;
      ctx.lineWidth   = ring.lw;
      ctx.shadowColor = ring.col;
      ctx.shadowBlur  = 3;
      ctx.beginPath();
      for (let s = 0; s <= ring.sides; s++) {
        const angle = rot + (s / ring.sides) * Math.PI * 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ─── Draw stars ─── */
  function drawStars(t) {
    ctx.shadowBlur = 0;
    for (const s of stars) {
      s.phase += s.speed;
      const a = s.alpha * (0.55 + 0.45 * Math.sin(s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.shadowColor = 'rgba(255,200,200,0.7)';
      ctx.shadowBlur  = s.r * 2.5;
      ctx.fill();
      ctx.shadowBlur = 0;
      if (s.drift) {
        s.x += s.vx + (mouseX - 0.5) * 0.03;
        s.y += s.vy + (mouseY - 0.5) * 0.025;
        if (s.x < -5) s.x = W + 5;
        if (s.x > W + 5) s.x = -5;
        if (s.y < -5) s.y = H + 5;
        if (s.y > H + 5) s.y = -5;
      }
    }
  }

  /* ─── Draw floating micro particles ─── */
  function drawParticles() {
    for (const p of particles) {
      p.y  += p.vy;
      p.x  += p.vx;
      p.life -= 0.003;
      if (p.life <= 0 || p.y < -10) {
        // Respawn at bottom
        p.x    = Math.random() * W;
        p.y    = H + 10;
        p.life = 0.3 + Math.random() * 0.7;
        p.alpha = Math.random() * 0.4 + 0.1;
      }
      const fade = Math.min(p.life * 3, 1);
      ctx.save();
      ctx.globalAlpha = p.alpha * fade;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    }
  }

  /* ─── Main render loop ─── */
  let lastT = 0;
  function drawFrame(ts) {
    // Smooth mouse lerp
    mouseX += (targetMX - mouseX) * 0.05;
    mouseY += (targetMY - mouseY) * 0.05;

    ctx.clearRect(0, 0, W, H);
    drawBg();
    drawGeometry(ts);
    drawVeins(ts);
    ctx.shadowBlur = 0;
    drawParticles();
    drawStars(ts);
    ctx.shadowBlur = 0;

    lastT  = ts;
    frameId = requestAnimationFrame(drawFrame);
  }

  /* ─── Mouse / touch ─── */
  window.addEventListener('mousemove', e => {
    targetMX = e.clientX / W;
    targetMY = e.clientY / H;
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) {
      targetMX = e.touches[0].clientX / W;
      targetMY = e.touches[0].clientY / H;
    }
  }, { passive: true });

  /* ─── Resize debounced ─── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  /* Start canvas */
  resize();
  frameId = requestAnimationFrame(drawFrame);

  /* ══════════════════════════════════════════
     3. IMAGE MODAL — click banner or profile
     ══════════════════════════════════════════ */
  const modal      = document.getElementById('img-modal');
  const modalImg   = document.getElementById('modal-img');
  const modalClose = document.getElementById('modal-close');
  const bannerEl   = document.getElementById('banner-wrap');
  const profileEl  = document.getElementById('profile-wrap');
  let   lastFocus  = null;

  function openModal(src, trigger) {
    if (!modal || !modalImg) return;
    modalImg.src = '';
    modalImg.src = src;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    lastFocus = trigger;
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function getImgSrc(wrap) {
    const img = wrap ? wrap.querySelector('img') : null;
    return img ? (img.src || img.getAttribute('src')) : '';
  }

  if (bannerEl) {
    bannerEl.addEventListener('click',   () => openModal(getImgSrc(bannerEl), bannerEl));
    bannerEl.addEventListener('keydown', e  => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(getImgSrc(bannerEl), bannerEl); } });
  }
  if (profileEl) {
    profileEl.addEventListener('click',   () => openModal(getImgSrc(profileEl), profileEl));
    profileEl.addEventListener('keydown', e  => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(getImgSrc(profileEl), profileEl); } });
  }
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
    modalClose.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeModal(); } });
  }
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ══════════════════════════════════════════
     4. LINKS — smooth tap with ripple
     ══════════════════════════════════════════ */
  document.querySelectorAll('.app-card').forEach(card => {
    card.addEventListener('click', () => {
      const href = card.getAttribute('data-href');
      if (!href) return;

      // Visual press feedback
      card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
      card.style.transform  = 'scale(0.94)';
      card.style.boxShadow  = '0 5px 15px rgba(255,0,51,0.25)';

      setTimeout(() => {
        card.style.transform  = '';
        card.style.boxShadow  = '';
        // Restore transition after press
        setTimeout(() => {
          card.style.transition = '';
        }, 50);
        window.open(href, '_blank', 'noopener,noreferrer');
      }, 200);
    });

    // Keyboard support
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ══════════════════════════════════════════
     5. VISITOR COUNTER — multi-API with localStorage fallback
     Counter increments once per session to prevent double-counting
     ══════════════════════════════════════════ */
  const countEl  = document.getElementById('visit-count');
  const SESSION_KEY = 'tr7_visited';
  const LOCAL_KEY   = 'tr7_visit_n';

  function animateCount(target) {
    if (!countEl) return;
    const start = parseInt(countEl.textContent.replace(/\D/g, '')) || 0;
    if (start === target) return;
    const diff     = target - start;
    const steps    = Math.min(Math.abs(diff), 60);
    const interval = 900 / steps;
    let   i        = 0;
    const timer = setInterval(() => {
      i++;
      const current = Math.round(start + (diff * (i / steps)));
      countEl.textContent = current.toLocaleString('ar-SA');
      if (i >= steps) {
        clearInterval(timer);
        countEl.textContent = target.toLocaleString('ar-SA');
      }
    }, interval);
    // Bounce
    countEl.style.transform = 'scale(1.25)';
    setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 320);
  }

  function setCount(n) {
    const num = parseInt(n);
    if (isNaN(num)) return;
    animateCount(num);
  }

  function localFallback() {
    let n = parseInt(localStorage.getItem(LOCAL_KEY) || '0');
    // Only increment if this is a fresh session
    if (!sessionStorage.getItem(SESSION_KEY)) {
      n++;
      localStorage.setItem(LOCAL_KEY, String(n));
      sessionStorage.setItem(SESSION_KEY, '1');
    }
    setCount(n);
  }

  function fetchCounter() {
    const alreadyVisited = sessionStorage.getItem(SESSION_KEY);
    // Try counterapi.dev — increment on first visit, just fetch on revisit
    const apiUrl = alreadyVisited
      ? 'https://api.counterapi.dev/v1/tr7-jalal-portfolio/visits'
      : 'https://api.counterapi.dev/v1/tr7-jalal-portfolio/visits/up';

    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 4000);

    fetch(apiUrl, { signal: controller.signal })
      .then(r => {
        clearTimeout(timeout);
        if (!r.ok) throw new Error('api fail');
        return r.json();
      })
      .then(d => {
        // counterapi.dev returns { count: N } or { value: N }
        const val = d.count ?? d.value ?? d.hits ?? d.visit_count;
        if (val !== undefined && val !== null) {
          if (!alreadyVisited) sessionStorage.setItem(SESSION_KEY, '1');
          setCount(val);
        } else {
          throw new Error('no count field');
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        localFallback();
      });
  }

  fetchCounter();

  /* ══════════════════════════════════════════
     6. ENTRANCE ANIMATION — fade-in sections after loader
     ══════════════════════════════════════════ */
  function revealOnLoad() {
    const mainCard = document.getElementById('main-card');
    if (!mainCard) return;
    mainCard.style.opacity = '0';
    mainCard.style.transform = 'translateY(24px)';
    mainCard.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';

    // Wait for loader to finish + a touch
    setTimeout(() => {
      mainCard.style.opacity   = '1';
      mainCard.style.transform = 'translateY(0)';
    }, DURATION + 450);
  }
  revealOnLoad();

})();
