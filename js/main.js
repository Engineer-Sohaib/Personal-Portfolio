/* ===================================================
   MAIN.JS — Entry Point & Page-Detection Orchestrator
   M SOHAIB ISHAQUE — Portfolio

   LOAD ORDER (add in this order inside each HTML <body>):
     <script src="js/constants.js"></script>
     <script src="js/utils.js"></script>
     <script src="js/animations.js"></script>
     <script src="js/textures.js"></script>
     <script src="js/interactions.js"></script>
     <script src="js/main.js"></script>

   OR if keeping a single script.js entry point, concatenate
   the above files in order and replace script.js content.
   =================================================== */

'use strict';

/* ─── Preloader (fires on 'load', not DOMContentLoaded) ─────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if (pre) pre.classList.add('hidden');
  }, Portfolio.CONSTANTS.ANIM.preloaderDelay);
});

/* ─── Smooth Scroll (can run immediately — passive, no DOM needed) ─ */
document.addEventListener('DOMContentLoaded', () => {
  Portfolio.INTERACTIONS.initSmoothScroll();
});

/* ─── Global Keyframes Injection ────────────────────────────────── */
Portfolio.UTILS.injectStyles('si-univ-kf', `
  @keyframes siHeroFloat {
    0%   { transform: translateY(0)      rotate(0deg);  opacity: 0; }
    7%   { opacity: 1; }
    93%  { opacity: 1; }
    100% { transform: translateY(-110vh) rotate(14deg); opacity: 0; }
  }
  @keyframes siFooterFloat {
    0%   { transform: translateY(65px);  opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
  }
  @keyframes siDotPan {
    0%   { background-position: 0 0; }
    100% { background-position: 36px 36px; }
  }
  @keyframes siScan {
    0%   { top: -2px; opacity: 0; }
    4%   { opacity: 1; }
    96%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes siBlob {
    0%   { transform: translate(0, 0)       scale(1);   }
    100% { transform: translate(22px, 30px) scale(1.1); }
  }
  @keyframes siBracket {
    0%, 100% { opacity: .12; }
    50%       { opacity: .32; }
  }
  @keyframes siRipple {
    0%   { width: 6px;  height: 6px;  opacity: 1;   border-width: 1.5px; }
    40%  {               opacity: 0.7;               border-width: 1px;   }
    100% { width: 64px; height: 64px; opacity: 0;   border-width: 0.5px; }
  }
  @keyframes siBurst {
    0%   { transform: translate(-50%,-50%) translate(0px, 0px)          scale(1);   opacity: 1; }
    60%  { opacity: 0.8; }
    100% { transform: translate(-50%,-50%) translate(var(--tx), var(--ty)) scale(0.3); opacity: 0; }
  }
  @keyframes siGlowPop {
    0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0.9; }
    50%  { transform: translate(-50%,-50%) scale(1.2); opacity: 0.5; }
    100% { transform: translate(-50%,-50%) scale(2);   opacity: 0;   }
  }

  /* Ensure hero content sits above injected canvas layers */
  #home > .container,        #home > .hero-grid-bg,
  #home > .hero-glow,        .about-hero > .container,
  .skills-hero > .container, .projects-hero > .container,
  .testi-hero > .container,  .contact-hero > .container,
  .pd-hero > .container,     .project-details-hero > .container,
  footer > .container,       footer > .footer-inner-wrap {
    position: relative !important;
    z-index: 2 !important;
  }
`);

/* ═══════════════════════════════════════════════════════
   MAIN INIT — DOMContentLoaded
   Calls universal features first, then page-specific ones.
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Universal (every page) ─── */
  Portfolio.TEXTURES.initUniversalAnimations();   // hero + footer canvas
  Portfolio.INTERACTIONS.initCustomCursor();
  Portfolio.INTERACTIONS.initNavbarScroll();
  Portfolio.INTERACTIONS.initMobileMenu();
  Portfolio.INTERACTIONS.initBackToTop();
  Portfolio.INTERACTIONS.initCustomizePanel();    // theme/preset dropdown
  Portfolio.INTERACTIONS.initTiltEffects();
  Portfolio.INTERACTIONS.initContactForm();       // index-page form (no-op if absent)
  Portfolio.ANIMATIONS.initScrollReveal();
  Portfolio.ANIMATIONS.initCounters();
  Portfolio.ANIMATIONS.initSkillBars();

  /* ── Detect active page ─── */
  const page = Portfolio.UTILS.getActivePage();

  /*
   * PAGE DETECTION MAP
   * ─────────────────────────────────────────────────
   * page key       HTML file          Active features
   * ─────────────────────────────────────────────────
   * 'home'       → index.html        glitch, typewriter, parallax, particles
   * 'about'      → about.html        hero particles
   * 'skills'     → skills.html       hero particles (skill bars via universal)
   * 'projects'   → projects.html     filter tabs, sort, load-more, hero particles
   * 'testimonials'→testimonials.html prev/next nav
   * 'contact'    → contact.html      form validation
   * 'experience' → experience.html   hero canvas, hero symbols
   * 'project-details'→project-details.html  (no extra page init needed)
   * ─────────────────────────────────────────────────
   */

  switch (page) {
    case 'home':
      Portfolio.INTERACTIONS.initIndexPage();
      break;

    case 'about':
      Portfolio.INTERACTIONS.initAboutPage();
      break;

    case 'skills':
      Portfolio.INTERACTIONS.initSkillsPage();
      break;

    case 'projects':
      Portfolio.INTERACTIONS.initProjectsPage();
      break;

    case 'testimonials':
      Portfolio.INTERACTIONS.initTestimonialsPage();
      break;

    case 'contact':
      Portfolio.INTERACTIONS.initContactPage();
      break;

    case 'experience':
      Portfolio.INTERACTIONS.initExperiencePage();
      break;

    default:
      // DOM-based fallback for edge cases (file: protocol, server rewrite, etc.)
      if (document.querySelector('.projects-hero'))  Portfolio.INTERACTIONS.initProjectsPage();
      if (document.querySelector('.about-hero'))      Portfolio.INTERACTIONS.initAboutPage();
      if (document.querySelector('.testi-hero'))      Portfolio.INTERACTIONS.initTestimonialsPage();
      if (document.querySelector('.skills-hero'))     Portfolio.INTERACTIONS.initSkillsPage();
      if (document.querySelector('.contact-hero'))    Portfolio.INTERACTIONS.initContactPage();
      if (document.querySelector('.exp-hero'))        Portfolio.INTERACTIONS.initExperiencePage();
      break;
  }

  /* ── Dev console signature ─── */
  console.log('%c M SOHAIB ISHAQUE — Portfolio', 'color:#A3FF12;font-size:1.6rem;font-weight:bold;');
  console.log('%c Full Stack Web Developer', 'color:#888;font-size:1.2rem;');
});
