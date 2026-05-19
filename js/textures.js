/* ===================================================
   TEXTURES.JS — Canvas & Procedural Visual Effects
   M SOHAIB ISHAQUE — Portfolio
   =================================================== */

'use strict';

window.Portfolio = window.Portfolio || {};

window.Portfolio.TEXTURES = (function () {
  const { $, $$, rand, injectStyles, createLayer } = window.Portfolio.UTILS;
  const { CANVAS: CFG, SYMS, FOOTER_SYMS, EXP_HERO_SYMS, ANIM } = window.Portfolio.CONSTANTS;
  
  /* ─── Helper: Get current accent-dim color from CSS variable ───────────────────────── */
  function getAccentDimColor(alpha) {
    // Get the accent-dim variable which already has the color with opacity
    const accentDim = getComputedStyle(document.documentElement).getPropertyValue('--accent-dim').trim();
    if (accentDim && accentDim !== '') {
      // If accent-dim is already an rgba color, we can use it directly
      // But we need to replace the opacity with our desired alpha
      const rgbaMatch = accentDim.match(/rgba?\(([^,]+),([^,]+),([^,]+),?([^)]+)?\)/);
      if (rgbaMatch) {
        const r = rgbaMatch[1];
        const g = rgbaMatch[2];
        const b = rgbaMatch[3];
        return `rgba(${r},${g},${b},${alpha})`;
      }
    }
    // Fallback to reading from --accent and generating rgba
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const rgb = hexToRgb(accent || '#A3FF12');
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
  }
  
  function getCurrentAccentRGB() {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const rgb = hexToRgb(accent || '#A3FF12');
    return rgb ? `${rgb.r},${rgb.g},${rgb.b}` : '163,255,18';
  }
  
  function ACC(opacity) {
    return getAccentDimColor(opacity);
  }
  
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }

  /* ─── Helper: pick symbol bank for a hero section ──────────────── */
  function getHeroSyms(section) {
    const id  = section.id || '';
    const cls = section.className || '';
    if (cls.includes('about-hero'))    return SYMS.about;
    if (cls.includes('skills-hero'))   return SYMS.skills;
    if (cls.includes('projects-hero')) return SYMS.projects;
    if (cls.includes('testi-hero'))    return SYMS.testimonials;
    if (cls.includes('pd-hero'))       return SYMS['project-details'];
    if (cls.includes('contact-hero'))  return SYMS.contact;
    if (id === 'home') {
      const path = window.location.pathname.toLowerCase();
      return path.includes('contact') ? SYMS.contact : SYMS.home;
    }
    return SYMS.home;
  }

  /* ═══════════════════════════════════════════════════════
     CANVAS — Animated Particle + Circuit Network
  ═══════════════════════════════════════════════════════ */
  function createCanvas(parent, isFooter) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    parent.insertBefore(canvas, parent.firstChild);

    const ctx    = canvas.getContext('2d');
    const c      = isFooter ? CFG.footer : CFG.hero;
    const mobile = window.innerWidth < 768;
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width  = parent.offsetWidth  || 1200;
      H = canvas.height = parent.offsetHeight || 600;
    };
    try { new ResizeObserver(resize).observe(parent); } catch (e) { resize(); }
    resize();

    const COUNT = isFooter
      ? (mobile ? c.countMobile : c.countDesktop)
      : (mobile ? c.countMobile : c.countDesktop);

    const nodes = Array.from({ length: COUNT }, () => {
      const ang = Math.random() * Math.PI * 2;
      const sp  = rand(c.speedRange[0], c.speedRange[1]);
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: rand(c.radiusRange[0], c.radiusRange[1]),
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        pulse: Math.random() * Math.PI * 2,
        pSpd:  0.013 + Math.random() * 0.018,
        variant: Math.random() < 0.72 ? 0 : (Math.random() < 0.55 ? 1 : 2),
      };
    });

    (function loop() {
      ctx.clearRect(0, 0, W, H);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += n.pSpd;
        if (n.x < -12) n.x = W + 12;  if (n.x > W + 12) n.x = -12;
        if (n.y < -12) n.y = H + 12;  if (n.y > H + 12) n.y = -12;
      });

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < c.linkDist) {
            ctx.beginPath();
            ctx.strokeStyle = ACC((1 - d / c.linkDist) * c.maxAlpha);
            ctx.lineWidth   = 0.65;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        const a = 0.30 + 0.24 * Math.sin(n.pulse);
        if (!isFooter) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6.5);
          g.addColorStop(0, ACC(a * 0.38));
          g.addColorStop(1, ACC(0));
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 6.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.fillStyle = ACC(isFooter ? a * 0.52 : a);

        if (!isFooter && n.variant === 1) {
          const s = n.r * 3.5;
          ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
          ctx.strokeStyle = ACC(a * 0.5);
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(n.x + s / 2, n.y); ctx.lineTo(n.x + s * 1.6, n.y);
          ctx.moveTo(n.x, n.y - s / 2); ctx.lineTo(n.x, n.y - s * 1.6);
          ctx.stroke();
        } else if (!isFooter && n.variant === 2) {
          const s = n.r * 4;
          ctx.strokeStyle = ACC(a);
          ctx.lineWidth   = 0.7;
          ctx.strokeRect(n.x - s / 2, n.y - s / 2, s, s);
          ctx.beginPath();
          ctx.moveTo(n.x - s, n.y); ctx.lineTo(n.x + s, n.y);
          ctx.moveTo(n.x, n.y - s); ctx.lineTo(n.x, n.y + s);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(loop);
    })();
  }

  /* ═══════════════════════════════════════════════════════
     SYMBOL CURSOR INTERACTION EFFECTS
  ═══════════════════════════════════════════════════════ */

  function spawnRipple(parent, x, y) {
    const ring = document.createElement('div');
    ring.setAttribute('aria-hidden', 'true');
    ring.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:6px;height:6px;
      border-radius:50%;background:transparent;border:1.5px solid ${ACC(0.85)};
      transform:translate(-50%,-50%) scale(1);pointer-events:none;z-index:10;
      animation:siRipple 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards;`;
    parent.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove());
  }

  function spawnBurst(parent, x, y) {
    const chars = ['+', '×', '·', '◆', '▸', '○', '◇'];
    for (let i = 0; i < 7; i++) {
      const shard  = document.createElement('span');
      shard.setAttribute('aria-hidden', 'true');
      const angle  = (i / 7) * Math.PI * 2;
      const dist   = 28 + Math.random() * 22;
      const tx     = Math.cos(angle) * dist;
      const ty     = Math.sin(angle) * dist;
      shard.textContent = chars[Math.floor(Math.random() * chars.length)];
      shard.style.cssText = `position:absolute;left:${x}px;top:${y}px;
        font-family:'JetBrains Mono',monospace;
        font-size:${0.5 + Math.random() * 0.4}rem;
        color:${ACC(0.7 + Math.random() * 0.3)};
        pointer-events:none;z-index:10;transform:translate(-50%,-50%);
        animation:siBurst 0.65s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
        --tx:${tx}px;--ty:${ty}px;`;
      parent.appendChild(shard);
      shard.addEventListener('animationend', () => shard.remove());
    }
  }

  function spawnGlow(parent, x, y) {
    const glow = document.createElement('div');
    glow.setAttribute('aria-hidden', 'true');
    glow.style.cssText = `position:absolute;left:${x}px;top:${y}px;
      width:60px;height:60px;border-radius:50%;
      background:radial-gradient(circle,${ACC(0.35)} 0%,transparent 70%);
      transform:translate(-50%,-50%) scale(0.4);pointer-events:none;z-index:9;
      filter:blur(6px);animation:siGlowPop 0.5s ease-out forwards;`;
    parent.appendChild(glow);
    glow.addEventListener('animationend', () => glow.remove());
  }

  function makeSymbolInteractive(el, container, baseSize, baseAlpha) {
    el.style.pointerEvents = 'auto';
    el.style.cursor        = 'crosshair';
    el.style.transition    =
      'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), color 0.2s, text-shadow 0.2s, filter 0.2s';

    el.addEventListener('mouseenter', e => {
      el.style.transform   = 'scale(0.35) rotate(-8deg)';
      el.style.color       = ACC(0.95);
      el.style.textShadow  = `0 0 12px ${ACC(0.9)}, 0 0 24px ${ACC(0.5)}`;
      // Get the current accent color for the drop-shadow
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      el.style.filter      = `brightness(1.6) drop-shadow(0 0 6px ${accentColor || '#A3FF12'})`;

      const rect = container.getBoundingClientRect();
      spawnRipple(container, e.clientX - rect.left, e.clientY - rect.top);
      spawnBurst (container, e.clientX - rect.left, e.clientY - rect.top);
      spawnGlow  (container, e.clientX - rect.left, e.clientY - rect.top);
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform  = '';
      el.style.color      = ACC(baseAlpha);
      el.style.textShadow = '';
      el.style.filter     = '';
    });
  }

  /* ═══════════════════════════════════════════════════════
     FLOATING TECH SYMBOLS
  ═══════════════════════════════════════════════════════ */
  function spawnSymbols(container, syms, count, isFooter) {
    const anim = isFooter ? 'siFooterFloat' : 'siHeroFloat';
    for (let i = 0; i < count; i++) {
      const el    = document.createElement('span');
      const size  = 0.50 + Math.random() * 0.55;
      const alpha = 0.06 + Math.random() * 0.16;
      const dur   = (isFooter ? 20 : 14) + Math.random() * 22;
      const delay = Math.random() * 24;
      el.setAttribute('aria-hidden', 'true');
      el.textContent = syms[Math.floor(Math.random() * syms.length)];
      el.style.cssText = `
        position:absolute;font-family:'JetBrains Mono','Courier New',monospace;
        font-size:${size}rem;color:${ACC(alpha)};white-space:nowrap;user-select:none;
        pointer-events:${isFooter ? 'none' : 'auto'};
        left:${(Math.random() * 93).toFixed(1)}%;
        ${isFooter ? 'bottom:0' : `top:${(86 + Math.random() * 22).toFixed(0)}%`};
        animation:${anim} ${dur.toFixed(1)}s linear -${delay.toFixed(1)}s infinite;
        z-index:0;letter-spacing:0.05em;`;
      container.appendChild(el);
      el.addEventListener('animationiteration', () => {
        el.style.left  = (Math.random() * 93).toFixed(1) + '%';
        el.textContent = syms[Math.floor(Math.random() * syms.length)];
      });
      if (!isFooter) makeSymbolInteractive(el, container, size, alpha);
    }
  }

  /* ═══════════════════════════════════════════════════════
     HERO OVERLAY EFFECTS
  ═══════════════════════════════════════════════════════ */
  function addDotGrid(parent, alpha, size) {
    const el = createLayer(`
      position:absolute;inset:0;pointer-events:none;z-index:0;
      background-image:radial-gradient(circle,${ACC(alpha)} 1px,transparent 1px);
      background-size:${size}px ${size}px;
      animation:siDotPan ${(size * 0.62).toFixed(0)}s linear infinite;`);
    parent.insertBefore(el, parent.firstChild);
  }

  function addGlowBlobs(parent) {
    [
      { w: 420, top: '-90px',  left: '-70px', delay: '0s'  },
      { w: 300, top: 'auto',   left: 'auto', right: '4%', bottom: '0', delay: '-4s' },
    ].forEach(({ w, top, left, right, bottom, delay }) => {
      const el = createLayer(`
        position:absolute;border-radius:50%;pointer-events:none;z-index:0;
        width:${w}px;height:${w}px;
        background:radial-gradient(circle,${ACC(0.055)} 0%,transparent 70%);
        filter:blur(80px);
        top:${top || 'auto'};left:${left || 'auto'};
        right:${right || 'auto'};bottom:${bottom || 'auto'};
        animation:siBlob ${(8 + Math.random() * 5).toFixed(1)}s ease-in-out ${delay} infinite alternate;`);
      parent.appendChild(el);
    });
  }

  function addScanLine(parent) {
    const el = createLayer(`
      position:absolute;left:0;right:0;height:1px;
      background:linear-gradient(90deg,transparent,${ACC(0.24)},transparent);
      pointer-events:none;z-index:0;animation:siScan 7s linear infinite;`);
    parent.appendChild(el);
  }

  function addBrackets(parent) {
    const navH = 'calc(var(--nav-h, 70px) + 14px)';
    [
      [`top:${navH}`, 'left:60px',  'border-top:1px solid',    'border-left:1px solid'  ],
      [`top:${navH}`, 'right:60px', 'border-top:1px solid',    'border-right:1px solid' ],
      ['bottom:12px', 'left:60px',  'border-bottom:1px solid', 'border-left:1px solid'  ],
      ['bottom:12px', 'right:60px', 'border-bottom:1px solid', 'border-right:1px solid' ],
    ].forEach(([v, h, b1, b2], idx) => {
      const el = createLayer(`
        position:absolute;${v};${h};width:48px;height:48px;
        ${b1} ${ACC(0.22)};${b2} ${ACC(0.22)};
        pointer-events:none;z-index:0;
        animation:siBracket 4.5s ease-in-out ${idx * 1.1}s infinite;`);
      parent.appendChild(el);
    });
  }

  /* ═══════════════════════════════════════════════════════
     AUGMENT HERO & FOOTER — Universal Entry Points
  ═══════════════════════════════════════════════════════ */
  function augmentHero(section) {
    if (!section || section.dataset.siAnim) return;
    if (section.querySelector('canvas')) { section.dataset.siAnim = '1'; return; }

    section.dataset.siAnim   = '1';
    section.style.position   = 'relative';
    section.style.overflow   = 'hidden';

    createCanvas(section, false);
    addDotGrid(section, 0.055, 36);

    const symBox = createLayer(
      'position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden;');
    section.appendChild(symBox);
    spawnSymbols(symBox, getHeroSyms(section), 44, false);

    addGlowBlobs(section);
    addScanLine(section);
    addBrackets(section);
  }

  /* ─── Footer — Geometric Memphis Style ────────────────────────── */
  function augmentFooter(footer) {
    if (!footer || footer.dataset.siAnim) return;
    footer.dataset.siAnim = '1';

    // Clean up old inline elements if any
    ['#footer-canvas', '.footer-grid-overlay', '.footer-symbols',
     '.footer-circuit-overlay', '.footer-ic-chips', '.footer-circuit-nodes',
     '.footer-trace-lines'].forEach(sel => {
      const el = footer.querySelector(sel);
      if (el) el.remove();
    });

    // Flowing curved lines canvas
    const canvas = document.createElement('canvas');
    canvas.id    = 'footer-geo-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    footer.insertBefore(canvas, footer.firstChild);

    (function runCurvedLines() {
      const ctx = canvas.getContext('2d');
      let W, H, t = 0;
      const resize = () => {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
      };
      window.addEventListener('resize', resize);
      resize();

      function drawBundle(ctx, ox, oy, cx1r, cy1r, cx2r, cy2r, ex, ey, count, alpha) {
        for (let i = 0; i < count; i++) {
          const spread = i * 10;
          ctx.beginPath();
          ctx.moveTo(ox, oy + spread);
          ctx.bezierCurveTo(
            W * cx1r, H * cy1r + spread * 0.6 + Math.sin(t * 0.4 + i * 0.15) * 8,
            W * cx2r, H * cy2r + spread * 0.3 + Math.cos(t * 0.3 + i * 0.1)  * 6,
            W * ex,   H * ey   + spread * 0.1
          );
          ctx.strokeStyle = ACC(alpha * (1 - i / (count * 1.4)));
          ctx.lineWidth   = 0.65;
          ctx.stroke();
        }
      }

      (function draw() {
        ctx.clearRect(0, 0, W, H);
        t += 0.012;
        drawBundle(ctx, 0, H * 0.08, 0.28, 0.0, 0.62, 0.14, 0.92, 0.04, 10, 0.28);
        drawBundle(ctx, W * 0.25, H, 0.45, 0.72, 0.72, 0.55, 1.05, 0.82, 9, 0.24);
        requestAnimationFrame(draw);
      })();
    })();

    // Geometric shapes
    const geo = document.createElement('div');
    geo.className = 'footer-geo-layer';
    geo.setAttribute('aria-hidden', 'true');
    footer.insertBefore(geo, footer.firstChild);

    function add(el) { geo.appendChild(el); return el; }

    // Solid circles
    [{ s: 38, t: '72%', l: '76%', dur: 3.8, del: 0.5 }].forEach(c => {
      const el = document.createElement('div');
      el.className = 'fgeo-circle-solid';
      el.style.cssText = `width:${c.s}px;height:${c.s}px;top:${c.t};left:${c.l};background:${ACC(0.75)};animation-duration:${c.dur}s;animation-delay:${c.del}s;`;
      add(el);
    });

    // Outline circles
    [
      { s: 75, t: '42%', l: '50%', bw: '1.5px', dur: 5.0, del: 0.2 },
      { s: 34, t: '30%', l: '87%', bw: '1.2px', dur: 3.2, del: 1.8 },
    ].forEach(c => {
      const el = document.createElement('div');
      el.className = 'fgeo-circle-outline';
      el.style.cssText = `width:${c.s}px;height:${c.s}px;top:${c.t};left:${c.l};border-width:${c.bw};border-color:${ACC(0.6)};animation-duration:${c.dur}s;animation-delay:${c.del}s;`;
      add(el);
    });

    // SVG triangles (solid + outline)
    const NS = 'http://www.w3.org/2000/svg';

    [[{ pts: '0,40 36,0 36,40', w: 36, h: 40, t: '75%', l: '81%', dur: 20, del: 1.5, fill: ACC(0.75), stroke: null }],
     [{ pts: '1,58 50,1 50,58', w: 52, h: 60, t: '70%', l: '2%', sw: '1.5', dur: 25, del: 2, fill: 'none', stroke: ACC(0.6) },
      { pts: '1,48 44,1 44,48', w: 46, h: 50, t: '5%',  l: '74%', sw: '1.5', dur: 20, del: 0.5, fill: 'none', stroke: ACC(0.6) }]]
    .flat().forEach(c => {
      const svg  = document.createElementNS(NS, 'svg');
      const poly = document.createElementNS(NS, 'polygon');
      svg.setAttribute('width', c.w); svg.setAttribute('height', c.h);
      svg.setAttribute('viewBox', `0 0 ${c.w} ${c.h}`);
      poly.setAttribute('points', c.pts);
      poly.setAttribute('fill', c.fill);
      if (c.stroke) { poly.setAttribute('stroke', c.stroke); poly.setAttribute('stroke-width', c.sw); }
      svg.appendChild(poly);
      const wrap = document.createElement('div');
      wrap.className = 'fgeo-tri-outline';
      wrap.style.cssText = `top:${c.t};left:${c.l};animation-duration:${c.dur}s;animation-delay:${c.del}s;`;
      wrap.appendChild(svg);
      add(wrap);
    });

    // Dot grids
    [
      { cols: 4, rows: 3, t: '5%',  l: '28%', dur: 3.0, del: 0.4 },
      { cols: 3, rows: 4, t: '42%', l: '42%', dur: 3.8, del: 1.2 },
      { cols: 4, rows: 2, t: '15%', l: '88%', dur: 2.8, del: 0.8 },
    ].forEach(c => {
      const wrap = document.createElement('div');
      wrap.className  = 'fgeo-dots';
      wrap.style.cssText = `grid-template-columns:repeat(${c.cols},1fr);top:${c.t};left:${c.l};animation-duration:${c.dur}s;animation-delay:${c.del}s;`;
      for (let i = 0; i < c.cols * c.rows; i++) {
        const d = document.createElement('div'); d.className = 'fgeo-dot';
        d.style.backgroundColor = ACC(0.5);
        wrap.appendChild(d);
      }
      add(wrap);
    });

    // Dashes
    [
      { w: 90,  h: 1.5, t: '14%', l: '5%',  dur: 3.5, del: 0.2 },
      { w: 130, h: 1.5, t: '19%', l: '2%',  dur: 3.0, del: 1.0 },
      { w: 60,  h: 1.5, t: '58%', l: '3%',  dur: 3.8, del: 0.6 },
      { w: 80,  h: 1.5, t: '82%', l: '84%', dur: 3.2, del: 1.5 },
    ].forEach(c => {
      const el = document.createElement('div');
      el.className = 'fgeo-dash';
      el.style.cssText = `width:${c.w}px;height:${c.h}px;top:${c.t};left:${c.l};background:${ACC(0.4)};animation-duration:${c.dur}s;animation-delay:${c.del}s;`;
      add(el);
    });

    // Bar groups
    const barsWrap = document.createElement('div');
    barsWrap.className = 'fgeo-bars';
    barsWrap.style.cssText = `top:55%;left:44%;animation-duration:3.2s;animation-delay:0.3s;`;
    [16, 22, 28, 18].forEach(bh => {
      const b = document.createElement('div');
      b.className = 'fgeo-bar';
      b.style.background = ACC(0.6);
      b.style.height = bh + 'px';
      barsWrap.appendChild(b);
    });
    add(barsWrap);

    // Accent dots
    [{ s: 10, t: '8%',  l: '93%', dur: 2.5, del: 0   },
     { s:  7, t: '14%', l: '95%', dur: 3.0, del: 0.7 }].forEach(c => {
      const el = document.createElement('div');
      el.className = 'fgeo-circle-solid';
      el.style.cssText = `width:${c.s}px;height:${c.s}px;top:${c.t};left:${c.l};background:${ACC(0.85)};animation-duration:${c.dur}s;animation-delay:${c.del}s;`;
      add(el);
    });
  }

  /* ═══════════════════════════════════════════════════════
     PAGE PARTICLE HELPERS
  ═══════════════════════════════════════════════════════ */

  /* Generic floating dot particles for hero sections */
  function createPageParticles(heroSel, animName, keyframes, count) {
    const hero = document.querySelector(heroSel);
    if (!hero) return;
    injectStyles('kf-' + animName, keyframes);
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.setAttribute('aria-hidden', 'true');
      d.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;z-index:0;
        width:${Math.random() * 3 + 1}px;height:${Math.random() * 3 + 1}px;
        background:${ACC(Math.random() * 0.25 + 0.05)};
        top:${Math.random() * 100}%;left:${Math.random() * 100}%;
        animation:${animName} ${Math.random() * 5 + 5}s ease-in-out ${Math.random() * 3}s infinite alternate;`;
      hero.appendChild(d);
    }
  }

  /* Index hero particles */
  function createIndexParticles() {
    const hero = document.getElementById('home');
    if (!hero) return;
    injectStyles('kf-floatDot', `@keyframes floatDot {
      0%   { transform: translate(0,0) scale(1);   opacity:0.5; }
      100% { transform: translate(${Math.random() * 30 - 15}px,${Math.random() * -40 - 10}px) scale(1.5); opacity:0; }
    }`);
    for (let i = 0; i < 18; i++) {
      const dot = document.createElement('div');
      dot.setAttribute('aria-hidden', 'true');
      dot.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;z-index:0;
        width:${Math.random() * 3 + 1}px;height:${Math.random() * 3 + 1}px;
        background:${ACC(Math.random() * 0.3 + 0.05)};
        top:${Math.random() * 100}%;left:${Math.random() * 100}%;
        animation:floatDot ${Math.random() * 6 + 5}s ease-in-out ${Math.random() * 3}s infinite alternate;`;
      hero.appendChild(dot);
    }
  }

  /* ═══════════════════════════════════════════════════════
     EXPERIENCE PAGE — Hero Canvas & Symbols
  ═══════════════════════════════════════════════════════ */
  function initExperienceCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const ecfg = CFG.experience;
    let W, H, nodes = [];

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const count = window.innerWidth < 768 ? ecfg.countMobile : ecfg.countDesktop;

    function randomNode() {
      const speed = 0.18 + Math.random() * 0.28;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: 1 + Math.random() * 1.8,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      };
    }

    for (let i = 0; i < count; i++) nodes.push(randomNode());

    (function draw() {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += n.pulseSpeed;
        if (n.x < -10) n.x = W + 10; if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10; if (n.y > H + 10) n.y = -10;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ecfg.linkDist) {
            ctx.beginPath();
            ctx.strokeStyle = ACC((1 - dist / ecfg.linkDist) * 0.18);
            ctx.lineWidth = 0.6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const a    = 0.35 + 0.25 * Math.sin(n.pulse);
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
        grad.addColorStop(0, ACC(a * 0.5));
        grad.addColorStop(1, ACC(0));
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = ACC(a); ctx.fill();
      });

      requestAnimationFrame(draw);
    })();
  }

  function initExperienceHeroSymbols() {
    const container = document.getElementById('heroSymbols');
    if (!container) return;

    function createSymbol() {
      const el   = document.createElement('span');
      el.className = 'hsym';
      el.textContent = EXP_HERO_SYMS[Math.floor(Math.random() * EXP_HERO_SYMS.length)];
      const size    = 0.6 + Math.random() * 0.6;
      const opacity = 0.1 + Math.random() * 0.18;
      el.style.cssText = `
        left:${2 + Math.random() * 96}%;
        top:${90 + Math.random() * 20}%;
        font-size:${size}rem;
        color:${ACC(opacity)};
        animation-duration:${14 + Math.random() * 20}s;
        animation-delay:-${Math.random() * 18}s;`;
      container.appendChild(el);
      el.addEventListener('animationiteration', () => {
        el.style.left = (2 + Math.random() * 96) + '%';
      });
      makeSymbolInteractive(el, container, size, opacity);
    }

    for (let i = 0; i < 38; i++) createSymbol();
  }

  /* ═══════════════════════════════════════════════════════
     UNIVERSAL ENTRY POINT — Called on every page
  ═══════════════════════════════════════════════════════ */
  function initUniversalAnimations() {
    // Run on all known hero selectors
    [
      '#home', '.about-hero', '.skills-hero', '.projects-hero',
      '.testi-hero', '.pd-hero', '.contact-hero', '.project-details-hero',
    ].forEach(sel => $$(sel).forEach(augmentHero));

    augmentFooter(document.querySelector('footer'));
  }

  /* ═══════════════════════════════════════════════════════
     REFRESH TEXTURE COLORS — Call after any accent change
     Re-applies current --accent to every live texture element
     so symbols, canvas lines, geo shapes, dots, blobs etc.
     all update instantly without a page reload.
  ═══════════════════════════════════════════════════════ */
  function refreshTextureColors() {
    // ── Floating tech symbols (hero + footer) ──────────────────────
    // These are <span> elements with inline color set at spawn time.
    // We re-derive alpha from their current opacity level.
    document.querySelectorAll(
      '#home [aria-hidden="true"], ' +
      '.about-hero [aria-hidden="true"], ' +
      '.skills-hero [aria-hidden="true"], ' +
      '.projects-hero [aria-hidden="true"], ' +
      '.testi-hero [aria-hidden="true"], ' +
      '.pd-hero [aria-hidden="true"], ' +
      '.contact-hero [aria-hidden="true"], ' +
      '.project-details-hero [aria-hidden="true"], ' +
      'footer [aria-hidden="true"]'
    ).forEach(el => {
      const tag = el.tagName.toLowerCase();

      // Floating symbol <span> elements
      if (tag === 'span' && el.style.fontFamily && el.style.color) {
        // Extract existing alpha from the rgba string
        const m = el.style.color.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        const alpha = m ? parseFloat(m[1]) : 0.10;
        el.style.color = ACC(alpha);
      }

      // Dot-grid overlay <div> (background-image radial-gradient)
      if (tag === 'div' && el.style.backgroundImage && el.style.backgroundImage.includes('radial-gradient')) {
        const m = el.style.backgroundImage.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        const alpha = m ? parseFloat(m[1]) : 0.055;
        const sizeMatch = el.style.backgroundSize ? el.style.backgroundSize.match(/(\d+)px/) : null;
        const size = sizeMatch ? parseInt(sizeMatch[1]) : 36;
        el.style.backgroundImage = `radial-gradient(circle,${ACC(alpha)} 1px,transparent 1px)`;
      }

      // Glow blob <div> (background radial-gradient)
      if (tag === 'div' && el.style.background && el.style.background.includes('radial-gradient') && el.style.filter && el.style.filter.includes('blur')) {
        const m = el.style.background.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        const alpha = m ? parseFloat(m[1]) : 0.055;
        el.style.background = `radial-gradient(circle,${ACC(alpha)} 0%,transparent 70%)`;
      }

      // Scan line <div> (background linear-gradient)
      if (tag === 'div' && el.style.background && el.style.background.includes('linear-gradient') && el.style.height === '1px') {
        const m = el.style.background.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        const alpha = m ? parseFloat(m[1]) : 0.24;
        el.style.background = `linear-gradient(90deg,transparent,${ACC(alpha)},transparent)`;
      }

      // Corner bracket <div> (border colors)
      if (tag === 'div' && el.style.width === '48px' && el.style.height === '48px') {
        const sides = ['borderTop', 'borderBottom', 'borderLeft', 'borderRight'];
        sides.forEach(side => {
          if (el.style[side] && el.style[side].includes('rgba')) {
            const m = el.style[side].match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
            const alpha = m ? parseFloat(m[1]) : 0.22;
            el.style[side] = `1px solid ${ACC(alpha)}`;
          }
        });
      }

      // Page particle dots (border-radius:50% background dots)
      if (tag === 'div' && el.style.borderRadius === '50%' && el.style.background && !el.style.filter) {
        const m = el.style.background.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        if (m) {
          const alpha = parseFloat(m[1]);
          el.style.background = ACC(alpha);
        }
      }
    });

    // ── Footer geometric layer elements ───────────────────────────
    // Solid circles & accent dots
    document.querySelectorAll('.fgeo-circle-solid').forEach(el => {
      const m = el.style.background.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      const alpha = m ? parseFloat(m[1]) : 0.75;
      el.style.background = ACC(alpha);
    });

    // Outline circles (border-color)
    document.querySelectorAll('.fgeo-circle-outline').forEach(el => {
      const m = el.style.borderColor.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      const alpha = m ? parseFloat(m[1]) : 0.60;
      el.style.borderColor = ACC(alpha);
    });

    // Dot grid dots
    document.querySelectorAll('.fgeo-dot').forEach(el => {
      const m = el.style.backgroundColor.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      const alpha = m ? parseFloat(m[1]) : 0.50;
      el.style.backgroundColor = ACC(alpha);
    });

    // Dashes
    document.querySelectorAll('.fgeo-dash').forEach(el => {
      const m = el.style.background.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      const alpha = m ? parseFloat(m[1]) : 0.40;
      el.style.background = ACC(alpha);
    });

    // Bar groups
    document.querySelectorAll('.fgeo-bar').forEach(el => {
      const m = el.style.background.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      const alpha = m ? parseFloat(m[1]) : 0.60;
      el.style.background = ACC(alpha);
    });

    // SVG triangle polygons (fill + stroke)
    document.querySelectorAll('.fgeo-tri-outline polygon').forEach(poly => {
      const fill = poly.getAttribute('fill');
      if (fill && fill.includes('rgba')) {
        const m = fill.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        const alpha = m ? parseFloat(m[1]) : 0.75;
        poly.setAttribute('fill', ACC(alpha));
      }
      const stroke = poly.getAttribute('stroke');
      if (stroke && stroke.includes('rgba')) {
        const m = stroke.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        const alpha = m ? parseFloat(m[1]) : 0.60;
        poly.setAttribute('stroke', ACC(alpha));
      }
    });

    // Ripple / burst / glow spawned elements already have short lifetimes,
    // so no need to update — they are gone before the user can see them.

    // ── Hero experience symbols (#heroSymbols) ────────────────────
    document.querySelectorAll('#heroSymbols .hsym').forEach(el => {
      const m = el.style.color && el.style.color.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      const alpha = m ? parseFloat(m[1]) : 0.12;
      el.style.color = ACC(alpha);
    });

    // ── Footer flowing-lines canvas redraws automatically via ACC() ─
    // (ACC() is called fresh each animation frame, so canvas is fine)
    // ── Hero particle canvas redraws automatically via ACC() as well ─
  }

  /* ── Listen for accent changes dispatched by interactions.js ──── */
  document.addEventListener('si:accentChanged', refreshTextureColors);

  return {
    createCanvas,
    spawnRipple,
    spawnBurst,
    spawnGlow,
    makeSymbolInteractive,
    spawnSymbols,
    addDotGrid,
    addGlowBlobs,
    addScanLine,
    addBrackets,
    augmentHero,
    augmentFooter,
    createPageParticles,
    createIndexParticles,
    initExperienceCanvas,
    initExperienceHeroSymbols,
    initUniversalAnimations,
    refreshTextureColors,
  };
})();