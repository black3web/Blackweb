/* ================================================================
   TR7 · admin.js — Full Admin Panel System
   Password: 5cd9e55dcaf491d32289b848adeb216e
   ================================================================ */
(function () {
  "use strict";

  const ADMIN_HASH = "5cd9e55dcaf491d32289b848adeb216e";

  /* ── All available Font Awesome icons for picker ── */
  const ICON_LIST = [
    // Social & Communication
    {i:"fab fa-telegram",    l:"Telegram"},   {i:"fas fa-paper-plane",l:"Paper Plane"},
    {i:"fab fa-youtube",     l:"YouTube"},    {i:"fab fa-instagram",  l:"Instagram"},
    {i:"fab fa-pinterest",   l:"Pinterest"},  {i:"fab fa-twitter",    l:"Twitter/X"},
    {i:"fab fa-x-twitter",   l:"X"},          {i:"fab fa-facebook",   l:"Facebook"},
    {i:"fab fa-tiktok",      l:"TikTok"},     {i:"fab fa-snapchat",   l:"Snapchat"},
    {i:"fab fa-whatsapp",    l:"WhatsApp"},   {i:"fab fa-discord",    l:"Discord"},
    {i:"fab fa-linkedin",    l:"LinkedIn"},   {i:"fab fa-reddit",     l:"Reddit"},
    {i:"fab fa-twitch",      l:"Twitch"},     {i:"fab fa-github",     l:"GitHub"},
    {i:"fab fa-gitlab",      l:"GitLab"},     {i:"fab fa-slack",      l:"Slack"},
    {i:"fab fa-spotify",     l:"Spotify"},    {i:"fab fa-soundcloud", l:"SoundCloud"},
    {i:"fab fa-paypal",      l:"PayPal"},     {i:"fab fa-patreon",    l:"Patreon"},
    {i:"fab fa-behance",     l:"Behance"},    {i:"fab fa-dribbble",   l:"Dribbble"},
    {i:"fab fa-medium",      l:"Medium"},     {i:"fab fa-dev",        l:"Dev.to"},
    {i:"fab fa-stack-overflow",l:"Stack Overflow"},
    {i:"fab fa-apple",       l:"Apple"},      {i:"fab fa-android",    l:"Android"},
    {i:"fab fa-google-play", l:"Google Play"},{i:"fab fa-amazon",     l:"Amazon"},
    // UI
    {i:"fas fa-link",        l:"Link"},       {i:"fas fa-globe",      l:"Website"},
    {i:"fas fa-envelope",    l:"Email"},      {i:"fas fa-phone",      l:"Phone"},
    {i:"fas fa-store",       l:"Store"},      {i:"fas fa-briefcase",  l:"Portfolio"},
    {i:"fas fa-code",        l:"Code"},       {i:"fas fa-bug",        l:"Bug"},
    {i:"fas fa-gamepad",     l:"Gaming"},     {i:"fas fa-music",      l:"Music"},
    {i:"fas fa-video",       l:"Video"},      {i:"fas fa-camera",     l:"Camera"},
    {i:"fas fa-pen",         l:"Blog"},       {i:"fas fa-book",       l:"Book"},
    {i:"fas fa-star",        l:"Star"},       {i:"fas fa-heart",      l:"Heart"},
    {i:"fas fa-fire",        l:"Fire"},       {i:"fas fa-bolt",       l:"Lightning"},
    {i:"fas fa-crown",       l:"Crown"},      {i:"fas fa-gem",        l:"Gem"},
    {i:"fas fa-robot",       l:"Robot"},      {i:"fas fa-satellite",  l:"Satellite"},
    {i:"fas fa-atom",        l:"Atom"},       {i:"fas fa-brain",      l:"AI/Brain"},
    {i:"fas fa-shield-alt",  l:"Shield"},     {i:"fas fa-lock",       l:"Lock"},
    {i:"fas fa-key",         l:"Key"},        {i:"fas fa-magic",      l:"Magic"},
    {i:"fas fa-infinity",    l:"Infinity"},   {i:"fas fa-chart-line", l:"Chart"},
    {i:"fas fa-dollar-sign", l:"Dollar"},     {i:"fas fa-bitcoin",    l:"Bitcoin"},
    {i:"fab fa-bitcoin",     l:"Bitcoin(b)"}, {i:"fab fa-ethereum",   l:"Ethereum"},
  ];

  /* ═══════════════════════════════════════════════
     DOM REFS
  ═══════════════════════════════════════════════ */
  const crown      = document.getElementById('admin-crown');
  const pwdOverlay = document.getElementById('adm-pwd-overlay');
  const pwdInput   = document.getElementById('adm-pwd-input');
  const pwdOk      = document.getElementById('adm-pwd-ok');
  const pwdCancel  = document.getElementById('adm-pwd-cancel');
  const pwdErr     = document.getElementById('adm-pwd-err');
  const eyeBtn     = document.getElementById('adm-eye-btn');
  const eyeIcon    = document.getElementById('adm-eye-icon');
  const panel      = document.getElementById('adm-panel');
  const backdrop   = document.getElementById('adm-backdrop');
  const closeBtn   = document.getElementById('adm-close');
  const tabs       = document.querySelectorAll('.adm-tab');
  const contents   = document.querySelectorAll('.adm-tab-content');
  const saveAllBtn = document.getElementById('adm-save-all');
  const fullReset  = document.getElementById('adm-full-reset');

  /* ═══════════════════════════════════════════════
     CROWN BUTTON
  ═══════════════════════════════════════════════ */
  if (crown) {
    crown.textContent = window.TR7.adminSymbol || '♕';
    crown.addEventListener('click', openPwdDialog);
  }

  /* ═══════════════════════════════════════════════
     PASSWORD DIALOG
  ═══════════════════════════════════════════════ */
  function openPwdDialog() {
    if (!pwdOverlay) return;
    pwdOverlay.setAttribute('aria-hidden', 'false');
    pwdOverlay.classList.add('active');
    if (pwdInput) { pwdInput.value = ''; setTimeout(() => pwdInput.focus(), 80); }
    if (pwdErr) pwdErr.textContent = '';
  }
  function closePwdDialog() {
    if (!pwdOverlay) return;
    pwdOverlay.classList.remove('active');
    pwdOverlay.setAttribute('aria-hidden', 'true');
  }

  if (pwdCancel) pwdCancel.addEventListener('click', closePwdDialog);
  if (pwdOverlay) pwdOverlay.addEventListener('click', e => { if (e.target === pwdOverlay) closePwdDialog(); });
  if (pwdInput) pwdInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkPwd(); });
  if (pwdOk) pwdOk.addEventListener('click', checkPwd);

  /* Show/hide password */
  if (eyeBtn) eyeBtn.addEventListener('click', () => {
    const hidden = pwdInput.type === 'password';
    pwdInput.type = hidden ? 'text' : 'password';
    eyeIcon.className = hidden ? 'fas fa-eye-slash' : 'fas fa-eye';
  });

  function checkPwd() {
    const val = (pwdInput.value || '').trim();
    if (val === ADMIN_HASH) {
      closePwdDialog();
      openPanel();
    } else {
      if (pwdErr) { pwdErr.textContent = '✕ رمز خاطئ'; }
      if (pwdInput) { pwdInput.value = ''; pwdInput.focus(); }
      /* Shake animation */
      pwdInput.style.animation = 'none';
      void pwdInput.offsetWidth;
      pwdInput.style.animation = 'admShake .4s ease';
    }
  }

  /* ═══════════════════════════════════════════════
     PANEL OPEN / CLOSE
  ═══════════════════════════════════════════════ */
  function openPanel() {
    panel.classList.add('active');
    backdrop.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    populatePanel();
  }
  function closePanel() {
    panel.classList.remove('active');
    backdrop.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (backdrop) backdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('active')) closePanel(); });

  /* ═══════════════════════════════════════════════
     TABS
  ═══════════════════════════════════════════════ */
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('tab-' + tab.dataset.tab);
    if (target) target.classList.add('active');
  }));

  /* ═══════════════════════════════════════════════
     POPULATE PANEL from TR7 config
  ═══════════════════════════════════════════════ */
  function populatePanel() {
    const cfg = window.TR7;

    /* --- Colors --- */
    document.querySelectorAll('.adm-color[data-key]').forEach(inp => {
      const key = inp.dataset.key;
      const val = cfg[key] || '';
      inp.value = toHex(val);
    });
    document.querySelectorAll('.adm-color-txt[data-color]').forEach(inp => {
      inp.value = cfg[inp.dataset.color] || '';
    });

    /* --- Texts --- */
    document.querySelectorAll('.adm-input[data-key], .adm-textarea[data-key]').forEach(inp => {
      const key = inp.dataset.key;
      if (cfg[key] !== undefined) inp.value = cfg[key];
    });

    /* --- Images --- */
    setPreview('bannerUrl',  cfg.bannerUrl);
    setPreview('profileUrl', cfg.profileUrl);
    setPreview('logoUrl',    cfg.logoUrl);

    /* --- Links --- */
    renderLinksEditor(cfg.links || []);

    /* --- Sizes --- */
    document.querySelectorAll('input[type=number][data-key]').forEach(inp => {
      const key = inp.dataset.key;
      if (cfg[key] !== undefined) inp.value = cfg[key];
    });
  }

  /* ─── Color sync: picker <-> text ─── */
  document.querySelectorAll('.adm-color[data-key]').forEach(picker => {
    picker.addEventListener('input', () => {
      const txt = document.querySelector(`.adm-color-txt[data-color="${picker.dataset.key}"]`);
      if (txt) txt.value = picker.value;
    });
  });
  document.querySelectorAll('.adm-color-txt[data-color]').forEach(txt => {
    txt.addEventListener('input', () => {
      const pick = document.querySelector(`.adm-color[data-key="${txt.dataset.color}"]`);
      if (pick) { try { pick.value = toHex(txt.value); } catch{} }
    });
  });

  /* ─── Image URL → live preview ─── */
  ['bannerUrl','profileUrl','logoUrl'].forEach(key => {
    const inp = document.querySelector(`.adm-input[data-key="${key}"]`);
    if (inp) {
      inp.addEventListener('input', () => setPreview(key, inp.value));
    }
  });

  function setPreview(key, url) {
    const map = { bannerUrl:'prev-banner', profileUrl:'prev-profile', logoUrl:'prev-logo' };
    const el  = document.getElementById(map[key]);
    if (el && url) { el.src = url; el.style.display = 'block'; }
    else if (el) el.style.display = 'none';
  }

  /* ═══════════════════════════════════════════════
     LINKS EDITOR
  ═══════════════════════════════════════════════ */
  function renderLinksEditor(links) {
    const container = document.getElementById('adm-links-list');
    if (!container) return;
    container.innerHTML = '';
    links.forEach((lnk, idx) => {
      container.appendChild(mkLinkCard(lnk, idx, links.length));
    });
  }

  function mkLinkCard(lnk, idx, total) {
    const card = document.createElement('div');
    card.className = 'adm-link-card';
    card.dataset.idx = idx;
    card.innerHTML = `
      <div class="adm-link-card-header">
        <span class="adm-link-drag">⠿</span>
        <span class="adm-link-num">#${idx + 1}</span>
        <button class="adm-link-del" data-idx="${idx}" title="حذف">✕</button>
      </div>
      <div class="adm-grid-2">
        <div class="adm-field"><label>اسم الخدمة</label><input type="text" class="adm-input lk-name" value="${esc(lnk.name)}" placeholder="YouTube"></div>
        <div class="adm-field"><label>المعرف / Handle</label><input type="text" class="adm-input lk-handle" value="${esc(lnk.handle)}" placeholder="@username"></div>
        <div class="adm-field"><label>الرابط (URL)</label><input type="url" class="adm-input lk-href" value="${esc(lnk.href)}" placeholder="https://..."></div>
        <div class="adm-field"><label>لون الأيقونة</label><div class="adm-color-row"><input type="color" class="adm-color lk-color" value="${toHex(lnk.color || '#ffffff')}"><input type="text" class="adm-color-txt lk-color-txt" value="${esc(lnk.color || '#ffffff')}" placeholder="#ff0033"></div></div>
      </div>
      <div class="adm-field"><label>اختر الأيقونة</label>
        <div class="adm-icon-selected"><i class="${esc(lnk.icon)}"></i><span>${esc(lnk.icon)}</span></div>
        <div class="adm-icon-grid">${ICON_LIST.map(ic =>
          `<button class="adm-icon-btn${lnk.icon===ic.i?' selected':''}" data-icon="${ic.i}" title="${ic.l}"><i class="${ic.i}"></i></button>`
        ).join('')}</div>
      </div>
    `;
    /* Color picker sync */
    const cp = card.querySelector('.lk-color');
    const ct = card.querySelector('.lk-color-txt');
    if (cp) cp.addEventListener('input', () => { if (ct) ct.value = cp.value; });
    if (ct) ct.addEventListener('input', () => { try { if (cp) cp.value = toHex(ct.value); } catch{} });

    /* Icon selection */
    card.querySelectorAll('.adm-icon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        card.querySelectorAll('.adm-icon-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const sel = card.querySelector('.adm-icon-selected');
        if (sel) sel.innerHTML = `<i class="${btn.dataset.icon}"></i><span>${btn.dataset.icon}</span>`;
      });
    });

    /* Delete */
    card.querySelector('.adm-link-del').addEventListener('click', () => {
      const links = readLinksFromEditor();
      links.splice(idx, 1);
      renderLinksEditor(links);
    });
    return card;
  }

  function readLinksFromEditor() {
    const cards = document.querySelectorAll('.adm-link-card');
    const links = [];
    cards.forEach(card => {
      const iconBtn = card.querySelector('.adm-icon-btn.selected');
      const iconSel = card.querySelector('.adm-icon-selected i');
      const icon    = iconBtn ? iconBtn.dataset.icon : (iconSel ? iconSel.className : 'fas fa-link');
      links.push({
        name:   card.querySelector('.lk-name')?.value   || '',
        handle: card.querySelector('.lk-handle')?.value || '',
        href:   card.querySelector('.lk-href')?.value   || '#',
        color:  card.querySelector('.lk-color-txt')?.value || card.querySelector('.lk-color')?.value || '#ffffff',
        icon,
      });
    });
    return links;
  }

  const addLinkBtn = document.getElementById('adm-add-link');
  if (addLinkBtn) addLinkBtn.addEventListener('click', () => {
    const links = readLinksFromEditor();
    links.push({ name:'New Link', handle:'@handle', href:'https://', icon:'fas fa-link', color:'#ff0033' });
    renderLinksEditor(links);
  });

  /* ═══════════════════════════════════════════════
     SAVE / APPLY
  ═══════════════════════════════════════════════ */
  function collectAll() {
    const cfg = Object.assign({}, window.TR7);
    /* Colors */
    document.querySelectorAll('.adm-color-txt[data-color]').forEach(inp => {
      if (inp.value) cfg[inp.dataset.color] = inp.value.trim();
    });
    /* Texts + numbers */
    document.querySelectorAll('[data-key]').forEach(inp => {
      const key = inp.dataset.key;
      if (!key) return;
      if (inp.type === 'number') cfg[key] = parseInt(inp.value) || window.TR7_DEFAULTS[key];
      else if (inp.value !== undefined) cfg[key] = inp.value;
    });
    /* Links */
    cfg.links = readLinksFromEditor();
    return cfg;
  }

  function saveConfig(cfg) {
    window.TR7 = cfg;
    try { localStorage.setItem('tr7_cfg', JSON.stringify(cfg)); } catch {}
    applyConfig(cfg);
    showToast('✓ تم الحفظ بنجاح');
  }

  /* Per-section save buttons */
  document.querySelectorAll('.adm-save-btn[data-save]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cfg = collectAll();
      saveConfig(cfg);
    });
  });

  /* Save all */
  if (saveAllBtn) saveAllBtn.addEventListener('click', () => { saveConfig(collectAll()); });

  /* Reset buttons */
  document.getElementById('reset-colors')?.addEventListener('click', () => {
    const D = window.TR7_DEFAULTS;
    ['colorBg','colorPrimary','colorDeep','colorDark','colorAccent','colorText','colorCardBg','colorBorder'].forEach(k => {
      const p = document.querySelector(`.adm-color[data-key="${k}"]`);
      const t = document.querySelector(`.adm-color-txt[data-color="${k}"]`);
      if (p) p.value = toHex(D[k]);
      if (t) t.value = D[k];
    });
    showToast('↺ تم إعادة ضبط الألوان');
  });
  document.getElementById('reset-texts')?.addEventListener('click', () => {
    const D = window.TR7_DEFAULTS;
    document.querySelectorAll('.adm-input[data-key], .adm-textarea[data-key]').forEach(inp => {
      const key = inp.dataset.key;
      if (D[key] !== undefined) inp.value = D[key];
    });
    showToast('↺ تم إعادة ضبط النصوص');
  });
  document.getElementById('reset-sizes')?.addEventListener('click', () => {
    const D = window.TR7_DEFAULTS;
    document.querySelectorAll('input[type=number][data-key]').forEach(inp => {
      if (D[inp.dataset.key] !== undefined) inp.value = D[inp.dataset.key];
    });
    showToast('↺ تم إعادة ضبط الأحجام');
  });
  if (fullReset) fullReset.addEventListener('click', () => {
    if (!confirm('هل أنت متأكد من إعادة ضبط جميع الإعدادات؟')) return;
    localStorage.removeItem('tr7_cfg');
    window.TR7 = Object.assign({}, window.TR7_DEFAULTS);
    applyConfig(window.TR7);
    populatePanel();
    showToast('↺ تمت إعادة ضبط الكل');
  });

  /* ═══════════════════════════════════════════════
     APPLY CONFIG TO DOM + CSS VARS
  ═══════════════════════════════════════════════ */
  function applyConfig(cfg) {
    /* CSS custom properties */
    const root = document.documentElement;
    root.style.setProperty('--bg',          cfg.colorBg      || '#030000');
    root.style.setProperty('--r3',          cfg.colorPrimary || '#ff0033');
    root.style.setProperty('--r2',          cfg.colorDeep    || '#cc001a');
    root.style.setProperty('--r1',          cfg.colorDark    || '#8b0000');
    root.style.setProperty('--r4',          cfg.colorAccent  || '#ff1744');
    root.style.setProperty('--col-text',    cfg.colorText    || '#ffffff');
    root.style.setProperty('--glass',       cfg.colorCardBg  || 'rgba(5,1,2,0.60)');
    root.style.setProperty('--gb',          cfg.colorBorder  || 'rgba(255,0,51,0.18)');

    /* Sizes */
    const pw = cfg.profileSize || 110;
    root.style.setProperty('--profile-sz',  pw + 'px');
    root.style.setProperty('--banner-h',    (cfg.bannerHeight || 240) + 'px');
    root.style.setProperty('--card-radius', (cfg.cardRadius || 40) + 'px');
    root.style.setProperty('--name-fz',     (cfg.nameFontSize || 52) + 'px');
    root.style.setProperty('--title-fz',    (cfg.titleFontSize || 13) + 'px');
    root.style.setProperty('--desc-fz',     (cfg.descFontSize || 15) + 'px');
    root.style.setProperty('--icon-sz',     (cfg.iconSize || 58) + 'px');
    root.style.setProperty('--footer-fz',   (cfg.footerFontSize || 13) + 'px');

    /* Texts */
    setTxt('profile-name-txt',     cfg.profileName);
    setTxt('profile-subtitle-txt', cfg.profileSubtitle);
    setTxt('profile-desc-txt',     cfg.profileDesc);
    setTxt('section-title-txt',    cfg.sectionTitle);
    setTxt('cover-hud-txt',        cfg.coverHudText);
    setTxt('footer-copy-txt',      cfg.footerCopy);
    setTxt('footer-url-label-txt', cfg.footerUrlLabel);
    setTxt('footer-vis-label',     cfg.footerVisLabel);
    setTxt('footer-gem-txt',       cfg.footerGem);
    setTxt('bracket-open',         cfg.bracketOpen);
    setTxt('bracket-close',        cfg.bracketClose);

    /* Page title */
    const ptEl = document.getElementById('page-title');
    if (ptEl && cfg.pageTitle) ptEl.textContent = cfg.pageTitle;
    document.title = cfg.pageTitle || 'TR7';

    /* Loader brand */
    const lbEl = document.getElementById('ldr-brand-txt');
    if (lbEl && cfg.loaderBrand) lbEl.innerHTML = cfg.loaderBrand.replace(/(\d+)$/, '<sup>$1</sup>');

    /* Admin crown symbol */
    if (crown) crown.textContent = cfg.adminSymbol || '♕';

    /* Images */
    setImg('banner-img',   cfg.bannerUrl);
    setImg('profile-img',  cfg.profileUrl);
    setImg('ldr-logo-img', cfg.logoUrl);
    const iconEl = document.getElementById('page-icon');
    if (iconEl && cfg.logoUrl) iconEl.href = cfg.logoUrl;

    /* Footer URL */
    const fuLink = document.getElementById('footer-url-link');
    if (fuLink && cfg.footerUrl) fuLink.href = cfg.footerUrl;

    /* Links grid */
    renderLinksGrid(cfg.links || []);

    /* Profile wrap size */
    const pw2 = document.getElementById('profile-wrap');
    if (pw2) { pw2.style.width = pw + 'px'; pw2.style.height = pw + 'px'; }
    const bw = document.getElementById('banner-wrap');
    if (bw) bw.style.height = (cfg.bannerHeight || 240) + 'px';

    /* Card radius */
    const mc = document.getElementById('main-card');
    if (mc) mc.style.borderRadius = (cfg.cardRadius || 40) + 'px';
    const bw2 = document.getElementById('banner-wrap');
    if (bw2) bw2.style.borderRadius = `${cfg.cardRadius||40}px ${cfg.cardRadius||40}px 0 0`;
  }

  function setTxt(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.textContent = val;
  }
  function setImg(id, url) {
    const el = document.getElementById(id);
    if (el && url) el.src = url;
  }

  /* Render links grid from config */
  function renderLinksGrid(links) {
    const grid = document.getElementById('links-grid');
    if (!grid) return;
    grid.innerHTML = '';
    links.forEach((lnk, i) => {
      const delays = [0, -1.8, -3.6, -5.4, -0.9, -2.7];
      const delay  = delays[i % delays.length];
      const card   = document.createElement('div');
      card.className = 'app-card';
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', lnk.name);
      card.setAttribute('data-href', lnk.href);
      card.style.animationDelay = delay + 's';
      card.innerHTML = `
        <div class="ac-glow"></div>
        <div class="aib" style="font-size:var(--icon-sz,58px);color:${esc(lnk.color||'#ff0033')}">
          <i class="${esc(lnk.icon||'fas fa-link')}"></i>
          <div class="ihalo" style="background:radial-gradient(circle,${esc(lnk.color||'#ff0033')}33 0%,transparent 68%)"></div>
        </div>
        <span class="an">${esc(lnk.name)}</span>
        <span class="ah">${esc(lnk.handle)}</span>
        <div class="ac-sheen"></div>
      `;
      card.addEventListener('click', () => openLink(card));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLink(card); } });
      grid.appendChild(card);
    });
  }

  function openLink(card) {
    const href = card.getAttribute('data-href');
    if (!href || href === '#') return;
    card.style.transition = 'transform .13s ease';
    card.style.transform  = 'scale(0.92)';
    setTimeout(() => {
      card.style.transform  = '';
      setTimeout(() => { card.style.transition = ''; }, 55);
      window.open(href, '_blank', 'noopener,noreferrer');
    }, 175);
  }

  /* ═══════════════════════════════════════════════
     TOAST NOTIFICATION
  ═══════════════════════════════════════════════ */
  function showToast(msg) {
    let t = document.getElementById('adm-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'adm-toast';
      t.className = 'adm-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), 2800);
  }

  /* ═══════════════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════════════ */
  function toHex(val) {
    if (!val) return '#000000';
    if (val.startsWith('#') && (val.length === 4 || val.length === 7)) return val;
    /* Try to parse rgba/rgb */
    const m = val.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (m) return '#' + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
    return '#ff0033';
  }
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ═══════════════════════════════════════════════
     INIT — Apply stored config on page load
  ═══════════════════════════════════════════════ */
  applyConfig(window.TR7);

  /* Expose for main.js */
  window.TR7_ADMIN = { renderLinksGrid, applyConfig };

})();
