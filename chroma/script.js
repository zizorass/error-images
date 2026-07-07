(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Footer year ----------
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- Mobile nav ----------
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  const closeNav = () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
  mainNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') closeNav();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
      closeNav();
      navToggle.focus();
    }
  });

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`;
      observer.observe(el);
    });
  }

  // ---------- Stat count-up ----------
  const statEls = document.querySelectorAll('.stat-item dd');
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    if (prefersReducedMotion) {
      el.textContent = String(target);
      return;
    }
    const duration = 1000;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach((el) => statObserver.observe(el));
  } else {
    statEls.forEach(animateCount);
  }

  // ---------- Watch canvas renderer ----------
  // Draws a realistic monochrome watch as a true mechanical exploded-view
  // diagram: crystal, dial+hands, mainplate, gear train, oscillating balance
  // wheel, mainspring barrel, and case back each separate along their own
  // axis as `explode` increases. Pseudo-3D rotation via horizontal squish.
  // Grayscale metal finish lightens/darkens with `tone`.
  function tapered(ctx, len, widthBase, widthTip) {
    ctx.beginPath();
    ctx.moveTo(-widthBase / 2, 0);
    ctx.lineTo(widthBase / 2, 0);
    ctx.lineTo(widthTip / 2, -len);
    ctx.lineTo(-widthTip / 2, -len);
    ctx.closePath();
  }

  function drawGear(ctx, radius, teeth, g) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${g(70, 190)}, ${g(70, 190)}, ${g(73, 194)})`;
    ctx.fill();
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = `rgb(${g(60, 170)}, ${g(60, 170)}, ${g(63, 174)})`;
      ctx.fillRect(-radius * 0.06, -radius * 1.02, radius * 0.12, radius * 0.24);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.26, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${g(20, 70)}, ${g(20, 70)}, ${g(21, 73)})`;
    ctx.fill();
    ctx.lineWidth = radius * 0.05;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.stroke();
  }

  function drawSpiral(ctx, maxR, turns) {
    const steps = 90;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ang = t * turns * Math.PI * 2;
      const rad = t * maxR;
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }

  function drawWatch(ctx, size, { angle = 0, explode = 0, tone = 0.5, hands = 0, time = 0 }) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.34;
    const g = (a, b) => a + (b - a) * tone; // lerp helper for tone-driven grays
    const unit = size * 0.1;
    const part = (dir, jitter = 0) => [jitter * explode * unit, dir * explode * unit];

    ctx.clearRect(0, 0, size, size);

    // --- Cast shadow (grounds the watch, stays put through the rotation) ---
    ctx.save();
    ctx.translate(cx, cy + r * 1.05);
    ctx.scale(1, 0.22);
    const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.55)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);

    const squish = Math.max(0.62, Math.abs(Math.cos(angle)));
    const zoom = 1 + explode * 0.16; // cinematic push-in as the movement opens up
    ctx.scale(squish * zoom, zoom);

    // motion trail: a faint radiating streak from center to a part's exploded
    // position, sold by the "flying apart" read of the diagram
    const drawTrail = (dir, jitter = 0) => {
      if (explode < 0.03) return;
      const [tx, ty] = part(dir, jitter);
      const trailGrad = ctx.createLinearGradient(0, 0, tx, ty);
      trailGrad.addColorStop(0, 'rgba(255,255,255,0)');
      trailGrad.addColorStop(1, `rgba(255,255,255,${0.32 * explode})`);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = size * 0.006;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();
    };

    // --- Lugs (top/bottom strap mounts) — static shell ---
    ctx.save();
    ctx.fillStyle = `rgb(${g(30, 60)}, ${g(30, 60)}, ${g(33, 64)})`;
    ctx.fillRect(-r * 0.22, -r * 1.34, r * 0.44, r * 0.34);
    ctx.fillRect(-r * 0.22, r * 1.0, r * 0.44, r * 0.34);
    ctx.restore();

    // --- Crown — static shell ---
    ctx.save();
    ctx.fillStyle = `rgb(${g(70, 150)}, ${g(70, 150)}, ${g(74, 155)})`;
    ctx.fillRect(r * 0.98, -r * 0.14, r * 0.16, r * 0.28);
    ctx.restore();

    // --- Case ring — static shell (frame the exploded parts fly out of) ---
    ctx.save();
    const caseGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r * 1.16);
    caseGrad.addColorStop(0, `rgb(${g(70, 190)}, ${g(70, 190)}, ${g(73, 194)})`);
    caseGrad.addColorStop(0.55, `rgb(${g(38, 120)}, ${g(38, 120)}, ${g(40, 124)})`);
    caseGrad.addColorStop(1, `rgb(${g(14, 60)}, ${g(14, 60)}, ${g(15, 63)})`);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.13, 0, Math.PI * 2);
    ctx.fillStyle = caseGrad;
    ctx.fill();
    // brushed-bezel ticks
    ctx.save();
    ctx.rotate(angle * 0.15);
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const inner = r * 0.98;
      const outer = r * (i % 5 === 0 ? 1.1 : 1.05);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      ctx.lineWidth = size * (i % 5 === 0 ? 0.006 : 0.003);
      ctx.strokeStyle = `rgba(255,255,255,${i % 5 === 0 ? 0.5 : 0.22})`;
      ctx.stroke();
    }
    ctx.restore();
    // punch a hole so exploded parts behind/in-front read correctly
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${g(10, 40)}, ${g(10, 40)}, ${g(11, 42)})`;
    ctx.fill();
    ctx.restore();

    // --- Case back (explodes furthest away/down) ---
    drawTrail(2.25, 0);
    ctx.save();
    ctx.translate(...part(2.25, 0));
    ctx.rotate(angle * 0.1);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${g(35, 110)}, ${g(35, 110)}, ${g(37, 113)})`;
    ctx.fill();
    ctx.lineWidth = size * 0.004;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    for (let ring = 1; ring <= 2; ring++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3 * ring, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const sx = Math.cos(a) * r * 0.78;
      const sy = Math.sin(a) * r * 0.78;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${g(90, 210)}, ${g(90, 210)}, ${g(93, 214)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.035, sy);
      ctx.lineTo(sx + r * 0.035, sy);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = size * 0.003;
      ctx.stroke();
    }
    ctx.restore();

    // --- Mainspring barrel ---
    drawTrail(1.5, -0.55);
    ctx.save();
    ctx.translate(...part(1.5, -0.55));
    ctx.rotate(angle * 0.3 + time * 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.36, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${g(50, 140)}, ${g(50, 140)}, ${g(52, 144)})`;
    ctx.fill();
    ctx.lineWidth = size * 0.006;
    ctx.strokeStyle = `rgb(${g(80, 200)}, ${g(80, 200)}, ${g(83, 204)})`;
    ctx.stroke();
    drawSpiral(ctx, r * 0.3, 3.2);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = size * 0.0035;
    ctx.stroke();
    ctx.restore();

    // --- Balance wheel (ticks continuously — the signature "alive" part) ---
    drawTrail(0.75, 0.6);
    ctx.save();
    ctx.translate(...part(0.75, 0.6));
    const tick = Math.sin(time * 6.2) * 0.45;
    ctx.rotate(tick);
    // hairspring coil
    ctx.save();
    ctx.translate(r * 0.34, 0);
    drawSpiral(ctx, r * 0.16, 2.4);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = size * 0.0025;
    ctx.stroke();
    ctx.restore();
    // wheel rim
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    ctx.lineWidth = r * 0.05;
    ctx.strokeStyle = `rgb(${g(75, 195)}, ${g(75, 195)}, ${g(78, 199)})`;
    ctx.stroke();
    // spokes
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = `rgb(${g(70, 185)}, ${g(70, 185)}, ${g(73, 189)})`;
      ctx.fillRect(-r * 0.035, 0, r * 0.07, r * 0.3);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${g(20, 70)}, ${g(20, 70)}, ${g(21, 73)})`;
    ctx.fill();
    ctx.restore();

    // --- Gear train (three meshed wheels) ---
    drawTrail(0, -0.3);
    ctx.save();
    ctx.translate(...part(0, -0.3));
    ctx.rotate(angle * 0.5);
    ctx.save();
    ctx.translate(-r * 0.2, r * 0.05);
    ctx.rotate(angle * 1.4 + time * 1.1);
    drawGear(ctx, r * 0.26, 10, g);
    ctx.restore();
    ctx.save();
    ctx.translate(r * 0.14, -r * 0.18);
    ctx.rotate(-angle * 1.8 - time * 1.6);
    drawGear(ctx, r * 0.17, 8, g);
    ctx.restore();
    ctx.save();
    ctx.translate(r * 0.08, r * 0.26);
    ctx.rotate(angle * 2.2 + time * 2.1);
    drawGear(ctx, r * 0.12, 7, g);
    ctx.restore();
    ctx.restore();

    // --- Mainplate (holds the movement, jewel holes visible) ---
    drawTrail(-0.75, 0.15);
    ctx.save();
    ctx.translate(...part(-0.75, 0.15));
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${g(55, 165)}, ${g(55, 165)}, ${g(58, 169)})`;
    ctx.fill();
    ctx.lineWidth = size * 0.005;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.stroke();
    const jewelSpots = [
      [-0.2, 0.05], [0.14, -0.18], [0.08, 0.26], [0.35, 0.1], [-0.3, -0.3],
    ];
    jewelSpots.forEach(([jx, jy]) => {
      ctx.beginPath();
      ctx.arc(jx * r, jy * r, r * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${g(15, 55)}, ${g(15, 55)}, ${g(16, 57)})`;
      ctx.fill();
      ctx.lineWidth = r * 0.015;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.stroke();
    });
    ctx.restore();

    // --- Dial / face ---
    drawTrail(-1.5, 0);
    ctx.save();
    ctx.translate(...part(-1.5, 0));

    const faceGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.76);
    faceGrad.addColorStop(0, `rgb(${g(58, 205)}, ${g(58, 205)}, ${g(60, 208)})`);
    faceGrad.addColorStop(0.75, `rgb(${g(30, 150)}, ${g(30, 150)}, ${g(31, 153)})`);
    faceGrad.addColorStop(1, `rgb(${g(12, 90)}, ${g(12, 90)}, ${g(13, 92)})`);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.76, 0, Math.PI * 2);
    ctx.fillStyle = faceGrad;
    ctx.fill();
    ctx.lineWidth = size * 0.01;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();

    // sunburst texture
    ctx.save();
    ctx.clip();
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9);
      ctx.strokeStyle = `rgba(255,255,255,${i % 2 === 0 ? 0.05 : 0.02})`;
      ctx.lineWidth = size * 0.003;
      ctx.stroke();
    }
    ctx.restore();

    // hour markers (tapered batons, brighter at 12/3/6/9)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const isCardinal = i % 3 === 0;
      const inner = r * 0.56;
      const outer = r * (isCardinal ? 0.7 : 0.66);
      const mx = Math.cos(a) * (inner + outer) / 2;
      const my = Math.sin(a) * (inner + outer) / 2;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(-size * (isCardinal ? 0.009 : 0.006) + 1, -(outer - inner) / 2 + 1, size * (isCardinal ? 0.018 : 0.012), outer - inner);
      ctx.fillStyle = isCardinal ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)';
      ctx.fillRect(-size * (isCardinal ? 0.009 : 0.006), -(outer - inner) / 2, size * (isCardinal ? 0.018 : 0.012), outer - inner);
      ctx.restore();
    }

    // brand text
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `600 ${Math.round(size * 0.034)}px "Space Grotesk", sans-serif`;
    ctx.fillText('CHROMA', 0, -r * 0.24);
    ctx.font = `${Math.round(size * 0.018)}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('SWISS AUTOMATIC', 0, -r * 0.14);

    // date window
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(r * 0.42, -size * 0.022, size * 0.044, size * 0.044);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `600 ${Math.round(size * 0.024)}px sans-serif`;
    ctx.fillText('24', r * 0.42 + size * 0.022, size * 0.008);

    // hands (shadow pass + top pass)
    const drawHandPair = (offsetX, offsetY, alphaScale) => {
      ctx.save();
      ctx.translate(offsetX, offsetY);

      ctx.save();
      ctx.rotate(hands - Math.PI / 2);
      tapered(ctx, r * 0.42, size * 0.024, size * 0.008);
      ctx.fillStyle = `rgba(255,255,255,${0.95 * alphaScale})`;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.rotate(hands * 3.2 - Math.PI / 2);
      tapered(ctx, r * 0.6, size * 0.018, size * 0.006);
      ctx.fillStyle = `rgba(255,255,255,${0.95 * alphaScale})`;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.rotate(hands * 11 - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, size * 0.02);
      ctx.lineTo(0, -r * 0.66);
      ctx.lineWidth = size * 0.004;
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * alphaScale})`;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    };

    drawHandPair(size * 0.006, size * 0.006, 0.35); // shadow pass
    drawHandPair(0, 0, 1); // top pass

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.016, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f5f7';
    ctx.fill();
    ctx.lineWidth = size * 0.004;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.stroke();
    ctx.restore();

    // --- Crystal (explodes furthest toward viewer) ---
    drawTrail(-2.25, 0);
    ctx.save();
    ctx.translate(...part(-2.25, 0));
    const vignette = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 0.78);
    vignette.addColorStop(0, 'rgba(255,255,255,0.05)');
    vignette.addColorStop(0.8, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
    ctx.fillStyle = vignette;
    ctx.fill();
    ctx.lineWidth = size * 0.006;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-r * 0.26, -r * 0.34, r * 0.36, r * 0.14, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fill();
    // bloom: soft blurred glow duplicate of the specular streak, additive
    ctx.save();
    try { ctx.filter = 'blur(7px)'; } catch (e) {}
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.ellipse(-r * 0.26, -r * 0.34, r * 0.36, r * 0.14, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
    ctx.restore();
    ctx.restore();

    // --- Rotating light sweep across the whole watch (catches the light) ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.16, 0, Math.PI * 2);
    ctx.clip();
    ctx.rotate(angle * 0.5);
    const sweepGrad = ctx.createLinearGradient(-r * 1.4, 0, r * 1.4, 0);
    sweepGrad.addColorStop(0, 'rgba(255,255,255,0)');
    sweepGrad.addColorStop(0.47, 'rgba(255,255,255,0)');
    sweepGrad.addColorStop(0.5, 'rgba(255,255,255,0.22)');
    sweepGrad.addColorStop(0.53, 'rgba(255,255,255,0)');
    sweepGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(-r * 1.6, -r * 1.6, r * 3.2, r * 3.2);
    ctx.restore();

    ctx.restore();

    // --- Cinematic vignette halo: darkens a ring around the watch, then
    // fades fully back to transparent before the canvas edge so there is
    // no visible seam against the page background behind it. ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
    ctx.clip();
    const frameVignette = ctx.createRadialGradient(cx, cy, size * 0.2, cx, cy, size * 0.5);
    frameVignette.addColorStop(0, 'rgba(0,0,0,0)');
    frameVignette.addColorStop(0.65, 'rgba(0,0,0,0)');
    frameVignette.addColorStop(0.85, 'rgba(0,0,0,0.22)');
    frameVignette.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = frameVignette;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  // ---------- Hero canvas: idle auto-rotate (fully assembled) ----------
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 560;
    heroCanvas.width = size * dpr;
    heroCanvas.height = size * dpr;
    const hctx = heroCanvas.getContext('2d');
    hctx.scale(dpr, dpr);

    if (prefersReducedMotion) {
      drawWatch(hctx, size, { angle: 0.3, tone: 0.55, hands: 1.2 });
    } else {
      let start = null;
      const loop = (t) => {
        if (start === null) start = t;
        const elapsed = (t - start) / 1000;
        drawWatch(hctx, size, {
          angle: elapsed * 0.4,
          tone: 0.5 + Math.sin(elapsed * 0.3) * 0.12,
          hands: elapsed * 0.8,
          time: elapsed,
        });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  // ---------- Scroll-scrub canvas: mechanical exploded view ----------
  const scrubSection = document.getElementById('scrub');
  const scrubCanvas = document.getElementById('scrub-canvas');
  const scrubLines = document.querySelectorAll('.scrub-line');
  const progressFill = document.getElementById('scrub-progress-fill');

  if (scrubSection && scrubCanvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssSize = scrubCanvas.clientWidth || 560;

    const resizeCanvas = () => {
      cssSize = scrubCanvas.clientWidth || 560;
      scrubCanvas.width = cssSize * dpr;
      scrubCanvas.height = cssSize * dpr;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const sctx = scrubCanvas.getContext('2d');
    let lastActiveIndex = -1;
    const clockStart = performance.now();

    const getProgress = () => {
      const rect = scrubSection.getBoundingClientRect();
      const total = scrubSection.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      return Math.min(Math.max(scrolled / total, 0), 1);
    };

    const paint = (progress, time) => {
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (prefersReducedMotion) {
        drawWatch(sctx, cssSize, { angle: 0.3, explode: 0.55, tone: 0.55, hands: 1.2, time: 0 });
      } else {
        const explode = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
        const angle = progress * Math.PI * 2;
        const tone = 0.3 + progress * 0.5;
        drawWatch(sctx, cssSize, { angle, explode, tone, hands: progress * 6, time });
      }

      if (progressFill) progressFill.style.width = `${progress * 100}%`;

      const activeIndex = Math.min(2, Math.floor(progress * 3));
      if (activeIndex !== lastActiveIndex) {
        scrubLines.forEach((line, i) => {
          line.classList.toggle('is-active', i === activeIndex);
        });
        lastActiveIndex = activeIndex;
      }
    };

    if (prefersReducedMotion) {
      paint(0.5, 0);
      scrubLines.forEach((line) => line.classList.add('is-active'));
    } else {
      // Continuous rAF loop (only while the section is in view) so the
      // balance wheel keeps ticking even when the user stops scrolling —
      // exactly how a real automatic movement never stops.
      let rafId = null;
      const frame = (t) => {
        paint(getProgress(), (t - clockStart) / 1000);
        rafId = requestAnimationFrame(frame);
      };

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && rafId === null) {
              rafId = requestAnimationFrame(frame);
            } else if (!entry.isIntersecting && rafId !== null) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          });
        },
        { threshold: 0 }
      );
      io.observe(scrubSection);

      paint(getProgress(), 0);
    }
  }

  // ---------- Newsletter form ----------
  const form = document.getElementById('newsletter-form');
  if (form) {
    const emailInput = document.getElementById('newsletter-email');
    const errorEl = document.getElementById('newsletter-error');
    const statusEl = document.getElementById('newsletter-status');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = emailInput.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(value)) {
        emailInput.setAttribute('aria-invalid', 'true');
        errorEl.textContent = 'Please enter a valid email address.';
        statusEl.textContent = '';
        emailInput.focus();
        return;
      }

      emailInput.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      statusEl.textContent = `Thanks! We'll send new finishes to ${value}.`;
      form.reset();
    });
  }

  // ---------- Card tilt on mousemove ----------
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.watch-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateX(${-py * 8}deg) rotateY(${px * 8}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
})();
