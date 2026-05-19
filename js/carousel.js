/* ===================================================
   CAROUSEL.JS — Swiper.js Carousel Integration
   M SOHAIB ISHAQUE — Portfolio
   Depends on: constants.js, utils.js, Swiper.js CDN
   =================================================== */

'use strict';

window.Portfolio = window.Portfolio || {};

window.Portfolio.CAROUSEL = (function () {
  const { $, $$, on, injectStyles } = window.Portfolio.UTILS;
  const { DESIGN, ANIM }            = window.Portfolio.CONSTANTS;

  /* ─── Shared Swiper Config Defaults ──────────────────────────── */
  const SHARED_CONFIG = {
    speed:          700,               // matches 0.35s feel × 2 for slide transitions
    grabCursor:     true,
    keyboard:       { enabled: true, onlyInViewport: true },
    a11y:           { enabled: true },
    loop:           false,             // false so isBeginning / isEnd are reliable
    autoplay: {
      delay:             4000,
      disableOnInteraction: false,     // resumes after manual nav
      pauseOnMouseEnter: true,
    },
  };

  /* ─── Hide / show prev & next based on position ──────────────── */
  function updateNavVisibility(swiper, prevEl, nextEl) {
    // At first slide → hide prev; at last slide → hide next
    prevEl.style.opacity        = swiper.isBeginning ? '0' : '1';
    prevEl.style.pointerEvents  = swiper.isBeginning ? 'none' : '';
    nextEl.style.opacity        = swiper.isEnd       ? '0' : '1';
    nextEl.style.pointerEvents  = swiper.isEnd       ? 'none' : '';
  }

  /* ─── Wrap existing grid children in Swiper markup ───────────── */
  /**
   * Converts a plain grid div into the Swiper required DOM:
   *   .{wrapperClass}  →  swiper-wrapper
   *   children         →  each wrapped in swiper-slide
   *
   * We do NOT change any classes on the original cards — only
   * insert the wrapper layer Swiper needs.
   */
  function wrapGridForSwiper(gridEl, sliderId) {
    if (!gridEl || gridEl.dataset.swiperWrapped) return;

    const children = Array.from(gridEl.children);

    // Create the swiper root container (replaces the plain grid)
    const swiperEl = document.createElement('div');
    swiperEl.className = 'swiper si-swiper';
    swiperEl.id        = sliderId;
    swiperEl.setAttribute('aria-roledescription', 'carousel');

    // Inner wrapper (required by Swiper)
    const wrapperEl = document.createElement('div');
    wrapperEl.className = 'swiper-wrapper';

    // Wrap each card in a swiper-slide
    children.forEach((child, idx) => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `Slide ${idx + 1} of ${children.length}`);
      // Remove any reveal transition-delay so Swiper controls visibility
      child.style.transitionDelay = '';
      slide.appendChild(child);
      wrapperEl.appendChild(slide);
    });

    swiperEl.appendChild(wrapperEl);

    // Pagination
    const paginationEl = document.createElement('div');
    paginationEl.className = 'swiper-pagination si-swiper-pagination';
    swiperEl.appendChild(paginationEl);

    // Prev / Next buttons
    const prevEl = document.createElement('button');
    prevEl.className = 'si-swiper-btn si-swiper-prev';
    prevEl.setAttribute('aria-label', 'Previous slide');
    prevEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M11 14L6 9l5-5" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const nextEl = document.createElement('button');
    nextEl.className = 'si-swiper-btn si-swiper-next';
    nextEl.setAttribute('aria-label', 'Next slide');
    nextEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M7 4l5 5-5 5" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    swiperEl.appendChild(prevEl);
    swiperEl.appendChild(nextEl);

    // Replace the grid with the swiper container
    gridEl.parentNode.replaceChild(swiperEl, gridEl);
    gridEl.dataset.swiperWrapped = '1';

    return { swiperEl, wrapperEl, paginationEl, prevEl, nextEl };
  }

  /* ─── Projects Carousel ───────────────────────────────────────── */
  function initProjectsCarousel() {
    const grid = document.querySelector('#projects .projects-grid');
    if (!grid) return null;

    const wrapped = wrapGridForSwiper(grid, 'projects-swiper');
    if (!wrapped) return null;

    const { swiperEl, paginationEl, prevEl, nextEl } = wrapped;

    const swiper = new Swiper(swiperEl, {
      ...SHARED_CONFIG,

      slidesPerView:  1,
      spaceBetween:   24,

      breakpoints: {
        540: {
          slidesPerView: 1.25,
          spaceBetween:  20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween:  24,
        },
        1100: {
          slidesPerView: 3,
          spaceBetween:  28,
        },
      },

      pagination: {
        el:        paginationEl,
        clickable: true,
      },

      navigation: {
        prevEl,
        nextEl,
      },

      on: {
        // Set initial state — prev hidden on slide 0
        init()        { updateNavVisibility(this, prevEl, nextEl); },
        // Update on every slide change
        slideChange() { updateNavVisibility(this, prevEl, nextEl); },
        // Re-check after responsive breakpoint switch (slidesPerView changes)
        breakpoint()  { updateNavVisibility(this, prevEl, nextEl); },
      },
    });

    return swiper;
  }

  /* ─── Testimonials Carousel ───────────────────────────────────── */
  function initTestimonialsCarousel() {
    const grid = document.querySelector('#testimonials .testimonials-grid');
    if (!grid) return null;

    const wrapped = wrapGridForSwiper(grid, 'testimonials-swiper');
    if (!wrapped) return null;

    const { swiperEl, paginationEl, prevEl, nextEl } = wrapped;

    const swiper = new Swiper(swiperEl, {
      ...SHARED_CONFIG,

      slidesPerView:  1,
      spaceBetween:   24,
      centeredSlides: false,

      autoplay: {
        ...SHARED_CONFIG.autoplay,
        delay: 5000,             // slightly slower for longer reads
      },

      breakpoints: {
        600: {
          slidesPerView: 1.2,
          spaceBetween:  20,
        },
        900: {
          slidesPerView: 2,
          spaceBetween:  24,
        },
        1200: {
          slidesPerView: 3,
          spaceBetween:  28,
        },
      },

      pagination: {
        el:        paginationEl,
        clickable: true,
      },

      navigation: {
        prevEl,
        nextEl,
      },

      on: {
        init()        { updateNavVisibility(this, prevEl, nextEl); },
        slideChange() { updateNavVisibility(this, prevEl, nextEl); },
        breakpoint()  { updateNavVisibility(this, prevEl, nextEl); },
      },
    });

    return swiper;
  }

  /* ─── Public init ─────────────────────────────────────────────── */
  function init() {
    // Guard: Swiper must be loaded
    if (typeof Swiper === 'undefined') {
      console.warn('[Portfolio.CAROUSEL] Swiper.js not loaded. Add CDN links to <head>.');
      return;
    }

    initProjectsCarousel();
    initTestimonialsCarousel();
  }

  return { init, initProjectsCarousel, initTestimonialsCarousel };
})();

/* ─── Auto-initialise after DOM is ready ─────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  window.Portfolio.CAROUSEL.init();
});

/* ═══════════════════════════════════════════════════
   TICKER — Tools · Technologies · AI Tools
   Three infinite marquee rows for skills.html.
   Row 1 & 3 → LEFT  |  Row 2 → RIGHT
═══════════════════════════════════════════════════ */

window.Portfolio.TICKER = (function () {

  /* ─── Data ───────────────────────────────────────── */

  /* Each item: { label, svg }
     svg is an inline SVG string (same icons already used in the page) */

  const TOOLS = [
    {
      label: 'VS Code',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#007ACC"/><path d="M8 10.5h4.5L16 16l3.5-5.5H24L18 16l6 5.5h-4.5L16 16l-3.5 5.5H8L14 16 8 10.5z" fill="white"/></svg>`,
    },
    {
      label: 'Git',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#F05032"/><path d="M16 5l-1.9 3.8-3.8-.6 2.6 3-1.5 3.6 3.6-1.5 3 2.6-.6-3.8L21 10l-3.8-.6L16 5zm0 10c-4 2-7 5.4-7 8v1h14v-1c0-2.6-3-6-7-8z" fill="white"/></svg>`,
    },
    {
      label: 'GitHub',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#24292E"/><path d="M16 4C9.37 4 4 9.37 4 16c0 5.3 3.44 9.8 8.2 11.38-.1-.24-.16-.62-.16-1.13v-1.98H10.3s-.58 0-1.16-.57c-.4-.38-.53-.95-.65-1.22-.2-.4-.68-.93-1.1-1.16-.32-.19-.41-.38-.1-.42.9-.12 1.79.66 2.06 1.1.5.84 1.07 1 1.33 1h1.04l.04-.08c.05-.83.43-1.58 1.01-2.1-2.53-.46-3.82-1.94-3.82-4 0-.97.35-1.87.94-2.57-.2-.58-.46-1.77.05-2.73 0 0 .83-.27 2.74 1.05A9.34 9.34 0 0 1 16 12.5c.86 0 1.72.12 2.52.35 1.9-1.32 2.73-1.05 2.73-1.05.5.96.25 2.15.05 2.73.59.7.94 1.6.94 2.57 0 2.06-1.3 3.54-3.84 4 .65.6 1.06 1.44 1.06 2.37v2.76c0 .37-.06.7-.14 1C24.6 25.77 28 21.28 28 16c0-6.63-5.37-12-12-12z" fill="white"/></svg>`,
    },
    {
      label: 'Figma',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#F24E1E"/><path d="M12 20c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4h4v4zm2 0c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm4-6c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4v4h4zm-6-4c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4h4v4zm2 2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="white"/></svg>`,
    },
    {
      label: 'Postman',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#FF6C37"/><path d="M16 6a10 10 0 1 0 0 20A10 10 0 0 0 16 6zm4.5 10.5l-6 3.5V12l6 3.5-.1 1z" fill="white"/></svg>`,
    },
    {
      label: 'Docker',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#2496ED"/><path d="M8 16h3v3H8zm4 0h3v3h-3zm4 0h3v3h-3zm-8-4h3v3H8zm4 0h3v3h-3zm4 0h3v3h-3zm4 0h3v3h-3zm-8-4h3v3h-3zm4 0h3v3h-3zm8 8c.5-2-1-3.5-2.5-3.5H25c.5-2.5-1-5-3.5-6l-.5 1c1.5.5 2.5 2 2.5 3.5H22c0-1-1-1.5-1.5-1l-.5 1H19v3h9z" fill="white"/></svg>`,
    },
    {
      label: 'Swagger',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#85EA2D"/><path d="M16 5C9.9 5 5 9.9 5 16s4.9 11 11 11 11-4.9 11-11S22.1 5 16 5zm.5 16.5c-.3 0-.5-.1-.7-.3l-3.5-4.3v3.5c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-9.8c0-.5.4-.9.9-.9s.9.4.9.9v4.2l3.2-4c.2-.3.5-.4.8-.4.5 0 .9.4.9.9 0 .2-.1.4-.2.6l-2.8 3.4 3 3.6c.1.2.2.4.2.6.1.5-.3.9-.9 1zm4.7-.2c-.9 0-1.6-.4-2-.9-.1-.1-.1-.3-.1-.4 0-.4.4-.8.8-.8.2 0 .4.1.5.2.2.3.5.4.8.4.5 0 .8-.3.8-.7 0-.5-.5-.7-1.1-.9-.9-.3-1.7-.8-1.7-1.9 0-1.1.9-1.9 2.1-1.9.7 0 1.3.3 1.7.7.1.1.2.3.2.4 0 .4-.3.8-.8.8-.2 0-.4-.1-.5-.2-.2-.2-.4-.3-.7-.3-.4 0-.6.2-.6.5 0 .4.4.6 1 .8 1 .3 1.8.8 1.8 2s-.9 2.2-2.2 2.2z" fill="white"/></svg>`,
    },
    {
      label: 'Adobe XD',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#FF61F6"/><path d="M19 9h4.5L17 20l6.5 3H19l-3-5.5-3 5.5H8.5L15 20 8.5 9H13l3 5.5L19 9z" fill="white"/></svg>`,
    },
    {
      label: 'Photoshop',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#001E36"/><path d="M9 9h4c3 0 5 1.5 5 4.5S16 18 13 18H11v5H9V9zm2 7h2c1.5 0 3-.7 3-2.5S14.5 11 13 11h-2v5zm9-7h3c3.5 0 6 2.2 6 6.5s-2.5 6.5-6 6.5h-3V9zm2 11h1c2 0 4-1.2 4-4.5s-2-4.5-4-4.5h-1v9z" fill="#31A8FF"/></svg>`,
    },
    {
      label: 'Nginx',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#009639"/><path d="M16 5L5 11v10l11 6 11-6V11L16 5zm0 2.3l8.7 4.8v9.8L16 26.7l-8.7-4.8V12.1L16 7.3zM11 20V12l10 8v-8" fill="none" stroke="white" stroke-width="1.5"/></svg>`,
    },
    {
      label: 'Jira',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#0052CC"/><path d="M27 16l-9.5-9.5-1.5 1.5 8 8-8 8 1.5 1.5L27 16zM16 6.5l-9.5 9.5 9.5 9.5 1.5-1.5-8-8 8-8L16 6.5z" fill="#2684FF"/><path d="M16 6.5l-1.5 1.5 6.5 6.5-6.5 6.5 1.5 1.5L24 16 16 6.5z" fill="white"/></svg>`,
    },
    {
      label: 'Webpack',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#1C78C0"/><path d="M27 20.5l-10.5 6v-5.3l6.5-3.6 4 2.9zm1-1.1V12.7l-4 2.3v4l4 2.4zM5 20.5l10.5 6v-5.3L9 17.6 5 20.5zm-1-1.1V12.7l4 2.3v4l-4 2.4zM5.8 12l9.7-5.5v5.2L9 15.1l-.2.1L5.8 12zm20.4 0l-9.7-5.5v5.2l6.5 3.4.2.1 3-3.2z" fill="white"/></svg>`,
    },
  ];

  const TECHNOLOGIES = [
    {
      label: 'HTML5',
      svg: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4l2.4 26.4L16 33l9.6-2.6L28 4H4z" fill="#E44D26"/><path d="M16 30.4V6H28L25.6 30.4 16 33V30.4z" fill="#F16529"/><path d="M16 13.6H10.4l-.4-4.4H16V5.2H6.4l.4 4.4.8 8.8H16v-4.8zm0 10.4l-.1.1-4.5-1.2-.3-3.2H7l.6 6.4 8.4 2.4V24z" fill="#EBEBEB"/><path d="M16 13.6v4.8h5.2l-.5 5.5-4.7 1.3v5L24.6 28l.2-2 .6-7-.2-4.8H16zm0-8.4v4.4h10.4l-.2-4.4H16z" fill="#fff"/></svg>`,
    },
    {
      label: 'CSS3',
      svg: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4l2.4 26.4L16 33l9.6-2.6L28 4H4z" fill="#264DE4"/><path d="M16 30.4V6H28L25.6 30.4 16 33V30.4z" fill="#2965F1"/><path d="M16 13.6H10.4l-.4-4.4H16V5.2H6.4l.4 4.4.8 8.8H16v-4.8zm0 10.4l-.1.1-4.5-1.2-.3-3.2H7l.6 6.4 8.4 2.4V24z" fill="#EBEBEB"/><path d="M16 13.6v4.8h5.2l-.5 5.5-4.7 1.3v5L24.6 28l.2-2 .6-7-.2-4.8H16zm0-8.4v4.4h10.4l-.2-4.4H16z" fill="#fff"/></svg>`,
    },
    {
      label: 'JavaScript',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="#F0DB4F"/><path d="M9.5 24.4l2.5-1.5c.5.9.95 1.65 2.05 1.65 1.05 0 1.7-.4 1.7-2v-10.8h3.1V22.5c0 3.3-1.9 4.8-4.8 4.8-2.6 0-4.1-1.35-4.55-2.9zm12.1-.35l2.5-1.45c.65 1.1 1.5 1.9 3 1.9 1.25 0 2.05-.63 2.05-1.5 0-1.04-.82-1.4-2.2-2l-.75-.32c-2.17-.92-3.62-2.1-3.62-4.55 0-2.27 1.72-4 4.42-4 1.92 0 3.3.67 4.3 2.42l-2.37 1.52c-.52-.93-1.07-1.3-1.93-1.3-.88 0-1.44.56-1.44 1.3 0 .9.56 1.27 1.86 1.83l.75.32c2.56 1.1 4.02 2.22 4.02 4.74 0 2.72-2.13 4.22-5 4.22-2.8 0-4.6-1.33-5.49-3.13z" fill="#323330"/></svg>`,
    },
    {
      label: 'TypeScript',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="#3178C6"/><path d="M18.3 24.1v2.7c.45.23.98.4 1.6.52.62.12 1.28.18 1.97.18.67 0 1.31-.07 1.91-.21.6-.14 1.13-.37 1.57-.68.44-.31.79-.72 1.04-1.23.25-.51.38-1.13.38-1.86 0-.54-.08-1.01-.23-1.42-.15-.41-.38-.77-.67-1.09-.29-.32-.65-.6-1.07-.85-.42-.25-.9-.48-1.44-.7-.39-.15-.73-.3-1.02-.44-.29-.14-.53-.29-.73-.44-.2-.15-.35-.31-.45-.49-.1-.18-.15-.38-.15-.61 0-.21.05-.4.14-.57.09-.17.22-.31.39-.43.17-.12.37-.21.61-.27.24-.06.5-.09.8-.09.21 0 .43.02.66.05.23.03.46.08.68.15.22.07.43.16.63.27.2.11.38.24.54.39V17c-.32-.12-.68-.21-1.07-.27-.39-.06-.82-.09-1.28-.09-.65 0-1.27.08-1.86.23-.59.15-1.1.39-1.54.71-.44.32-.79.73-1.05 1.23-.26.5-.39 1.09-.39 1.77 0 .88.25 1.62.74 2.24.49.62 1.25 1.13 2.26 1.54.41.16.79.32 1.13.47.34.15.63.31.88.48.25.17.44.35.58.55.14.2.21.43.21.69 0 .2-.04.39-.13.57-.09.18-.22.33-.4.47-.18.14-.4.25-.66.33-.26.08-.57.12-.92.12-.6 0-1.19-.11-1.77-.34-.58-.22-1.1-.57-1.55-1.03zm-5.42-7.48H16v-2.28H7v2.28h3.08V27h2.8V16.62z" fill="white"/></svg>`,
    },
    {
      label: 'React',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#222"/><circle cx="16" cy="16" r="5.5" fill="none" stroke="#61DAFB" stroke-width="1.5"/><ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61DAFB" stroke-width="1.5"/><ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61DAFB" stroke-width="1.5" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61DAFB" stroke-width="1.5" transform="rotate(120 16 16)"/></svg>`,
    },
    {
      label: 'Angular',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#DD0031"/><path d="M16 4L5 8l1.7 14.7L16 28l9.3-5.3L27 8 16 4zm0 2.4l8.3 3-1.5 12.7-6.8 3.9-6.8-3.9L7.7 9.4 16 6.4zm0 4L10.8 22h2l1-2.7h4.3L19.2 22h2L16 10.4zm0 3l1.6 4.4h-3.2L16 13.4z" fill="white"/></svg>`,
    },
    {
      label: 'Next.js',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#000"/><path d="M18.5 22.3L14 15.7V27H11V9h2.5l5.2 8L24 9h2.5v18H24V15.7l-4.2 6.6h-1.3zM8 9H5v18h3V9z" fill="white"/></svg>`,
    },
    {
      label: 'Node.js',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#333"/><path d="M16 4C9.37 4 4 9.37 4 16c0 5.3 3.44 9.8 8.2 11.38-.1-.24-.16-.62-.16-1.13v-1.98H10.3s-.58 0-1.16-.57c-.4-.38-.53-.95-.65-1.22-.2-.4-.68-.93-1.1-1.16-.32-.19-.41-.38-.1-.42.9-.12 1.79.66 2.06 1.1.5.84 1.07 1 1.33 1h1.04l.04-.08c.05-.83.43-1.58 1.01-2.1-2.53-.46-3.82-1.94-3.82-4 0-.97.35-1.87.94-2.57-.2-.58-.46-1.77.05-2.73 0 0 .83-.27 2.74 1.05A9.34 9.34 0 0 1 16 12.5c.86 0 1.72.12 2.52.35 1.9-1.32 2.73-1.05 2.73-1.05.5.96.25 2.15.05 2.73.59.7.94 1.6.94 2.57 0 2.06-1.3 3.54-3.84 4 .65.6 1.06 1.44 1.06 2.37v2.76c0 .37-.06.7-.14 1C24.6 25.77 28 21.28 28 16c0-6.63-5.37-12-12-12z" fill="#FAFAFA"/></svg>`,
    },
    {
      label: '.NET Core',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#512BD4"/><path d="M8.5 11h2.2l5.3 8V11h2v10h-2.2l-5.3-8v8H8.5V11zm12.3 8c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" fill="white"/></svg>`,
    },
    {
      label: 'C#',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#239120"/><path d="M16 5l-9 5.2v11.6L16 27l9-5.2V10.2L16 5zm0 2.3l6.8 3.9v7.6L16 22.7l-6.8-3.9v-7.6L16 7.3zm3 6.2h-1.5v-1.5h-1v1.5H15v1h1.5v1.5h1V14.5H19v-1zm3.5 0H21v-1.5h-1v1.5h-1.5v1H20v1.5h1V14.5h1.5v-1zm-8.5 1.2c0 2.2-1.8 4-4 4-.5 0-1-.1-1.5-.3l.7-1.3c.2.1.5.1.8.1 1.5 0 2.5-1.1 2.5-2.5S11.5 13.5 10 13.5c-.3 0-.5 0-.8.1l-.7-1.3c.5-.2 1-.3 1.5-.3 2.2 0 4 1.8 4 4z" fill="white"/></svg>`,
    },
    {
      label: 'PHP',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#777BB3"/><path d="M16 11c-5 0-9 2.2-9 5s4 5 9 5 9-2.2 9-5-4-5-9-5zm-3.5 7.5l-.6-2.5H11l-.5 2.5H9l1.5-7h3c1.5 0 2.5.7 2.5 2s-1 2.5-2.5 2.5l.5 2.5h-1.5zm6 0l-.6-2.5H17l-.5 2.5H15l1.5-7h3c1.5 0 2.5.7 2.5 2s-1 2.5-2.5 2.5l.5 2.5h-1.5zm3.5-5h-2l-.3 1.5H21c.6 0 1-.3 1-.7 0-.5-.4-.8-1-.8zm-9 0h-2l-.3 1.5H12c.6 0 1-.3 1-.7 0-.5-.4-.8-1-.8z" fill="white"/></svg>`,
    },
    {
      label: 'WordPress',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#21759B"/><path d="M16 5C9.9 5 5 9.9 5 16s4.9 11 11 11 11-4.9 11-11S22.1 5 16 5zM5.8 16c0-1.8.4-3.5 1.1-5l6 16.4C8.3 25.3 5.8 20.9 5.8 16zm10.2 11c-1.2 0-2.4-.2-3.5-.5l3.7-10.8 3.8 10.4c0 .1.1.2.1.3-1.3.4-2.7.6-4.1.6zm1.8-16.5c.8 0 1.5-.1 1.5-.1.7-.1.6-1.1-.1-1.1 0 0-2.1.2-3.5.2-1.3 0-3.4-.2-3.4-.2-.7 0-.8 1 0 1.1 0 0 .6.1 1.4.1l2.1 5.7-2.9 8.8-4.9-14.5c.8 0 1.5-.1 1.5-.1.7-.1.6-1.1-.1-1.1 0 0-2.1.2-3.5.2-.2 0-.5 0-.8 0C8.3 7.3 11.9 5.8 16 5.8c3 0 5.7 1.1 7.8 3-.1 0-.1 0-.2 0-1.3 0-2.2 1.1-2.2 2.3 0 1.1.6 2 1.3 3 .5.9 1.1 2 1.1 3.6 0 1.1-.4 2.4-1 4.2l-1.3 4.4-4.7-14.8z" fill="white"/></svg>`,
    },
    {
      label: 'SQL Server',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#CC2927"/><path d="M16 7c-5 0-9 1.6-9 3.5v11C7 23.4 11 25 16 25s9-1.6 9-3.5v-11C25 8.6 21 7 16 7zm7 14.5c0 .8-3.1 2-7 2s-7-1.2-7-2v-2.2c1.5.9 4.1 1.5 7 1.5s5.5-.6 7-1.5v2.2zm0-4.5c0 .8-3.1 2-7 2s-7-1.2-7-2V15c1.5.9 4.1 1.5 7 1.5s5.5-.6 7-1.5v2zm0-4.5c0 .8-3.1 2-7 2s-7-1.2-7-2v-2.2c1.5.9 4.1 1.5 7 1.5s5.5-.6 7-1.5v2.2zm-7-3c-4 0-7-1.2-7-2s3-2 7-2 7 1.2 7 2-3 2-7 2z" fill="white"/></svg>`,
    },
    {
      label: 'MySQL',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#00758F"/><path d="M16 6c-5.5 0-10 2-10 4.5v11C6 24 10.5 26 16 26s10-2 10-4.5v-11C26 8 21.5 6 16 6zm0 2c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zm8 13c0 1.7-3.6 3-8 3s-8-1.3-8-3v-2.4c1.8 1 4.7 1.6 8 1.6s6.2-.6 8-1.6V21zm0-5c0 1.7-3.6 3-8 3s-8-1.3-8-3v-2.4c1.8 1 4.7 1.6 8 1.6s6.2-.6 8-1.6V16z" fill="white"/></svg>`,
    },
    {
      label: 'MongoDB',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#4DB33D"/><path d="M9 8c-2.5 1.5-4 4-4 7 0 5.5 4.5 10 10 10s10-4.5 10-10c0-3-1.5-5.5-4-7-1 3-3 5-6 5s-5-2-6-5zm7-4c-2.5 0-4.5.7-6 2 1 2.5 3 4 6 4s5-1.5 6-4c-1.5-1.3-3.5-2-6-2z" fill="white"/></svg>`,
    },
    {
      label: 'Bootstrap',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#7952B3"/><path d="M9 8h8.5c3.5 0 5.5 1.8 5.5 4.5 0 2-1 3.3-2.5 4 2 .5 3.5 2 3.5 4.5 0 3.2-2.5 5-6.5 5H9V8zm4 7h4c1.5 0 2.5-.8 2.5-2s-1-2-2.5-2H13v4zm0 7h4.5c1.8 0 2.8-.9 2.8-2.3s-1-2.2-2.8-2.2H13v4.5z" fill="white"/></svg>`,
    },
    {
      label: 'Tailwind',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#06B6D4"/><path d="M14.5 8.5C12 8.5 10.5 9.7 9.8 12.1c1.1-1.4 2.3-2 3.7-1.6.8.2 1.4.8 2 1.5.8 1.2 2 1.8 3.4 1.8 2.5 0 4-1.2 4.7-3.6-1.1 1.4-2.3 2-3.7 1.6-.8-.2-1.4-.8-2-1.5-.8-1.2-2-1.8-3.4-1.8zm-5 7.5C7 16 5.5 17.2 4.8 19.6c1.1-1.4 2.3-2 3.7-1.6.8.2 1.4.8 2 1.5.8 1.2 2 1.8 3.4 1.8 2.5 0 4-1.2 4.7-3.6-1.1 1.4-2.3 2-3.7 1.6-.8-.2-1.4-.8-2-1.5-.8-1.2-2-1.8-3.4-1.8z" fill="white"/></svg>`,
    },
    {
      label: 'WPF',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#5C2D91"/><path d="M8 9h4l2 10 2.5-10H19l2.5 10L24 9h4l-4 14h-3.5L18 13.5 15.5 23H12L8 9z" fill="white"/></svg>`,
    },
    {
      label: 'Firebase',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#FFCA28"/><path d="M8 24l3-13 4.5 8.5L17 12l5.5 12H8zm8-18l2.5 8-2.5 4.5-2.5-8L16 6z" fill="#F57C00"/></svg>`,
    },
    {
      label: 'Express.js',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#404040"/><text x="4" y="22" font-family="sans-serif" font-weight="700" font-size="11" fill="white">Express</text></svg>`,
    },
  ];

  const AI_TOOLS = [
    {
      label: 'ChatGPT',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#10A37F"/><path d="M16 6a7 7 0 0 0-6.2 10.2A7 7 0 0 0 16 26a7 7 0 0 0 6.2-10.2A7 7 0 0 0 16 6zm0 2a5 5 0 0 1 4.5 7.2l-1.1-.6A3.5 3.5 0 0 0 16 11.5a3.5 3.5 0 0 0-3.5 3.5c0 1.4.8 2.6 2 3.2l-.5 1A5 5 0 0 1 11 14a5 5 0 0 1 5-5zm0 3a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2zm0 5.5a5 5 0 0 1-3-1l.7-1.1a3.5 3.5 0 0 0 4.8-1.8l1.2.5A5 5 0 0 1 16 16.5z" fill="white"/></svg>`,
    },
    {
      label: 'Claude AI',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#D4A574"/><path d="M16 7l-2.5 8H8l5.5 4-2 7.5L16 23l4.5 3.5-2-7.5L24 15h-5.5L16 7z" fill="#1A1A1A"/></svg>`,
    },
    {
      label: 'GitHub Copilot',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#1A1A1A"/><path d="M16 5C9.9 5 5 9.9 5 16c0 4.8 3 8.9 7.3 10.5-.1-.7-.2-2-.2-2.8 0-1.4.9-2.4 1.9-2.8-3.2-.4-6.5-1.6-6.5-7.1 0-1.6.6-2.8 1.5-3.8-.1-.4-.6-1.8.2-3.7 0 0 1.2-.4 4 1.5 1.2-.3 2.4-.5 3.7-.5s2.5.2 3.7.5c2.8-1.9 4-1.5 4-1.5.8 1.9.3 3.3.2 3.7.9 1 1.5 2.3 1.5 3.8 0 5.5-3.4 6.7-6.6 7.1 1 .9 1.9 2.6 1.9 5.2v3.4c3.8-1.9 6.4-5.8 6.4-10.3C27 9.9 22.1 5 16 5z" fill="#A3FF12"/></svg>`,
    },
    {
      label: 'Gemini',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#1A73E8"/><path d="M16 6c-.5 4-3 7-6 8 3 1 5.5 4 6 8 .5-4 3-7 6-8-3-1-5.5-4-6-8z" fill="white"/></svg>`,
    },
    {
      label: 'Midjourney',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#000"/><path d="M8 22l4-12h1.5l2.5 7.5 2.5-7.5H20l4 12h-2l-2.8-9-2.2 6h-2l-2.2-6L10 22H8z" fill="white"/></svg>`,
    },
    {
      label: 'Stable Diffusion',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#5B21B6"/><path d="M16 6a10 10 0 1 0 0 20A10 10 0 0 0 16 6zm0 2a8 8 0 0 1 0 16 8 8 0 0 1 0-16zm0 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="#C4B5FD"/></svg>`,
    },
    {
      label: 'Cursor AI',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#000"/><path d="M9 9l14 7-7 2-2 7L9 9z" fill="#A3FF12"/><path d="M18 18l5 5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
    },
    {
      label: 'Perplexity',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#20B2AA"/><path d="M16 5v8l-6-4 6-4zm0 14v8l-6-4 6-4zm0-7l6 4-6 4-6-4 6-4z" fill="white"/></svg>`,
    },
    {
      label: 'Tabnine',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#7B61FF"/><path d="M10 10h5v12h-5zm7 0h5v12h-5z" fill="white" rx="2"/></svg>`,
    },
    {
      label: 'Runway ML',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#0F0F0F"/><path d="M8 10h8c2.2 0 4 1.8 4 4s-1.8 4-4 4h-3l5 4h-3l-5-4H11v4H8V10zm3 2v4h5c1.1 0 2-.9 2-2s-.9-2-2-2h-5z" fill="#A3FF12"/></svg>`,
    },
    {
      label: 'Codeium',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#09B6A2"/><path d="M9 16c0-3.9 3.1-7 7-7s7 3.1 7 7-3.1 7-7 7-7-3.1-7-7zm7-5a5 5 0 1 0 0 10A5 5 0 0 0 16 11zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="white"/></svg>`,
    },
    {
      label: 'Notion AI',
      svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#fff"/><path d="M9.5 9h9l4.5 4.5V23l-4 4H9.5L6 23.5V12.5L9.5 9zm1 2v11.5l3 3h5.5l3-3V14l-3.5-3H10.5z" fill="#1A1A1A"/><path d="M19 9v5h5" fill="none" stroke="#1A1A1A" stroke-width="1.5"/></svg>`,
    },
  ];

  /* ─── Build a single ticker item DOM node ────────────────────── */
  function makeItem(data) {
    const item = document.createElement('div');
    item.className = 'si-ticker-item';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'si-ticker-icon';
    iconWrap.innerHTML = data.svg;

    const label = document.createElement('span');
    label.className = 'si-ticker-label';
    label.textContent = data.label;

    item.appendChild(iconWrap);
    item.appendChild(label);
    return item;
  }

  /* ─── Build separator dot ────────────────────────────────────── */
  function makeSep() {
    const sep = document.createElement('span');
    sep.className = 'si-ticker-sep';
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '◆';
    return sep;
  }

  /* ─── Populate a track and duplicate items for seamless loop ── */
  function populateTrack(trackEl, items) {
    if (!trackEl) return;

    // Build one full set
    const frag = document.createDocumentFragment();
    items.forEach((data, i) => {
      frag.appendChild(makeItem(data));
      if (i < items.length - 1) frag.appendChild(makeSep());
    });
    // Add separator before duplicate set
    frag.appendChild(makeSep());

    // Duplicate set (Swiper-style clone) so the loop is seamless
    items.forEach((data, i) => {
      frag.appendChild(makeItem(data));
      if (i < items.length - 1) frag.appendChild(makeSep());
    });
    frag.appendChild(makeSep());

    trackEl.appendChild(frag);
  }

  /* ─── Public init ─────────────────────────────────────────────── */
  function initTickers() {
    populateTrack(document.getElementById('ticker-tools'),        TOOLS);
    populateTrack(document.getElementById('ticker-technologies'), TECHNOLOGIES);
    populateTrack(document.getElementById('ticker-ai'),           AI_TOOLS);
  }

  return { initTickers };
})();

/* ─── Auto-initialise after DOM is ready ─────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  window.Portfolio.TICKER.initTickers();
});