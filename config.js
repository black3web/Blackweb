/* ================================================================
   TR7 · config.js — Default site configuration
   All settings editable via Admin Panel (password protected)
   Stored in localStorage key: "tr7_cfg"
   ================================================================ */
window.TR7_DEFAULTS = {
  /* ─── Meta ─── */
  siteTitle:       "ㅤ𝑇𝑅⁷ㅤ",
  adminSymbol:     "♕",

  /* ─── Colors ─── */
  colorBg:         "#030000",
  colorPrimary:    "#ff0033",
  colorDeep:       "#cc001a",
  colorDark:       "#8b0000",
  colorAccent:     "#ff1744",
  colorText:       "#ffffff",
  colorTextDim:    "rgba(255,255,255,0.82)",
  colorCardBg:     "rgba(5,1,2,0.60)",
  colorBorder:     "rgba(255,0,51,0.18)",

  /* ─── Sizes ─── */
  profileSize:     110,
  bannerHeight:    240,
  cardRadius:      40,
  nameFontSize:    52,
  titleFontSize:   13,
  descFontSize:    15,
  iconSize:        58,
  footerFontSize:  13,

  /* ─── Texts ─── */
  profileName:     "جلال",
  profileSubtitle: "Web Engineer & UI Architect",
  profileDesc:     "مطور ويب محترف ومتخصص في دمج حلول الذكاء الاصطناعي مع تطبيقات الويب الحديثة. أمتلك خبرة عميقة في بناء أنظمة تفاعلية عالية الأداء تركز على تجربة المستخدم، وتوظيف تقنيات AI/ML لتقديم تجارب استثنائية. أؤمن بأن الجماليات والوظائف يجب أن تعمل بتناغم تام لخلق منتج رقمي لا يُنسى.",
  sectionTitle:    "تواصل",
  footerCopy:      "© 2026 جلال — جميع الحقوق محفوظة",
  footerUrl:       "https://black3web.github.io/Blackweb/",
  footerUrlLabel:  "black3web.github.io/Blackweb",
  siteUrlLink:     "https://black3web.github.io/Blackweb/",
  coverHudText:    "COVER · LIVE",
  footerVisLabel:  "VISITS",
  loaderBrand:     "TR7",
  pageTitle:       "ㅤ𝑇𝑅⁷ㅤ",
  bracketOpen:     "[",
  bracketClose:    "]",
  footerGem:       "◆",

  /* ─── Images (URL only) ─── */
  bannerUrl:       "https://iili.io/fb6SvS9.md.jpg",
  profileUrl:      "https://iili.io/fb64ziv.md.jpg",
  logoUrl:         "https://iili.io/qWN5VvR.md.jpg",

  /* ─── Social Links ─── */
  links: [
    { name: "Telegram",  handle: "@ILYA3bot", href: "https://t.me/ILYA3bot",                icon: "fab fa-telegram",   color: "#2da5e0" },
    { name: "Channel",   handle: "@swc_t",    href: "https://t.me/swc_t",                    icon: "fas fa-paper-plane",color: "#4fc3f7" },
    { name: "YouTube",   handle: "@scv_t",    href: "https://youtube.com/@scv_t",            icon: "fab fa-youtube",    color: "#ff3b3b" },
    { name: "Instagram", handle: "@szc2v",    href: "https://www.instagram.com/szc2v",       icon: "fab fa-instagram",  color: "#e1306c" },
    { name: "Pinterest", handle: "JLAL",      href: "https://pin.it/41EQVI1bs",              icon: "fab fa-pinterest",  color: "#e60023" },
  ],
};

/* ─── Load merged config ─── */
(function () {
  try {
    const saved = JSON.parse(localStorage.getItem('tr7_cfg') || '{}');
    window.TR7 = Object.assign({}, window.TR7_DEFAULTS, saved);
    if (saved.links && Array.isArray(saved.links)) window.TR7.links = saved.links;
  } catch {
    window.TR7 = Object.assign({}, window.TR7_DEFAULTS);
  }
})();
