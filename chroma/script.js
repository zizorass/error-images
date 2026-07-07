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
  // Draws a realistic monochrome watch: pseudo-3D rotation via horizontal
  // squish, optional exploded layers (case / movement / dial), grayscale
  // metal finish that lightens/darkens with `tone`.
  function tapered(ctx, len, widthBase, widthTip) {
    ctx.beginPath();
    ctx.moveTo(-widthBase / 2, 0);
    ctx.lineTo(widthBase / 2, 0);
    ctx.lineTo(widthTip / 2, -len);
    ctx.lineTo(-widthTip / 2, -len);
    ctx.closePath();
  }

  function drawWatch(ctx, size, { angle = 0, explode = 0, tone = 0.5, hands = 0 }) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.34;
    const g = (a, b) => a + (b - a) * tone; // lerp helper for tone-driven grays

    ctx.clearRect(0, 0, size, size);

    // --- Cast shadow (grounds the watch, stays put through the rotation) ---
    ctx.save();
    ctx.translate(cx, cy + r * 1.02);
    ctx.scale(1, 0.22);
    const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.1);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.55)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);

    const squish = Math.max(0.62, Math.abs(Math.cos(angle)));
    ctx.scale(squish, 1);

    const gap = explode * size * 0.17;

    // --- Lugs (top/bottom strap mounts) ---
    ctx.save();
    ctx.fillStyle = `rgb(${g(30, 60)}, ${g(30, 60)}, ${g(33, 64)})`;
    ctx.fillRect(-r * 0.22, -r * 1.34, r * 0.44, r * 0.34);
    ctx.fillRect(-r * 0.22, r * 1.0, r * 0.44, r * 0.34);
    ctx.restore();

    // --- Crown ---
    ctx.save();
    ctx.fillStyle = `rgb(${g(70, 150)}, ${g(70, 150)}, ${g(74, 155)})`;
    ctx.fillRect(r * 0.98, -r * 0.14, r * 0.16, r * 0.28);
    ctx.restore();

    // --- Back case ---
    ctx.save();
    ctx.translate(0, gap * 0.6);
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
    ctx.restore();

    // --- Movement (visible when exploded) ---
    ctx.save();
    ctx.translate(0, gap * 0.15);
    ctx.rotate(angle * 0.6);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${g(45, 130)}, ${g(45, 130)}, ${g(47, 133)})`;
    ctx.fill();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const gx = Math.cos(a) * r * 0.68;
      const gy = Math.sin(a) * r * 0.68;
      ctx.beginPath();
      ctx.arc(gx, gy, r * (i % 2 === 0 ? 0.1 : 0.06), 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${g(90, 210)}, ${g(90, 210)}, ${g(93, 214)})`;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${g(20, 80)}, ${g(20, 80)}, ${g(21, 83)})`;
    ctx.fill();
    ctx.restore();

    // --- Dial / face ---
    ctx.save();
    ctx.translate(0, -gap * 0.9);

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

    // hands drop shadow
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

    // crystal vignette (subtle edge darkening for depth)
    const vignette = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 0.78);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.76, 0, Math.PI * 2);
    ctx.fillStyle = vignette;
    ctx.fill();

    // crystal specular streak
    ctx.beginPath();
    ctx.ellipse(-r * 0.26, -r * 0.34, r * 0.36, r * 0.14, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ---------- Hero canvas: idle auto-rotate ----------
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
        });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  // ---------- Scroll-scrub canvas ----------
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
    let ticking = false;

    const render = () => {
      ticking = false;
      const rect = scrubSection.getBoundingClientRect();
      const total = scrubSection.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / total, 0), 1);

      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (prefersReducedMotion) {
        drawWatch(sctx, cssSize, { angle: 0.3, explode: 0, tone: 0.55, hands: 1.2 });
      } else {
        const explode = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
        const angle = progress * Math.PI * 2;
        const tone = 0.3 + progress * 0.5;
        drawWatch(sctx, cssSize, { angle, explode, tone, hands: progress * 6 });
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

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render();
      scrubLines.forEach((line) => line.classList.add('is-active'));
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      render();
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
