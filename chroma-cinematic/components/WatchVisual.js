const { useRef, useEffect } = React;

// Two-tone steel/gold chronograph, styled after classic tri-subdial
// chronograph watches (tachymeter bezel, applied baton indices, three
// register subdials) — an original CHROMA design, not a copy of any
// specific real watch's branding, logo, or dial artwork.
function tapered(ctx, len, widthBase, widthTip) {
  ctx.beginPath();
  ctx.moveTo(-widthBase / 2, 0);
  ctx.lineTo(widthBase / 2, 0);
  ctx.lineTo(widthTip / 2, -len);
  ctx.lineTo(-widthTip / 2, -len);
  ctx.closePath();
}

function drawChronograph(ctx, size, { angle = 0, hands = 0 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.translate(cx, cy + r * 1.05);
  ctx.scale(1, 0.22);
  const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.25);
  shadow.addColorStop(0, 'rgba(0,0,0,0.5)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
  ctx.fillStyle = shadow;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  const squish = Math.max(0.72, Math.abs(Math.cos(angle)));
  ctx.scale(squish, 1);

  // crown + chronograph pushers (gold)
  const goldMetal = ctx.createLinearGradient(0, -r, 0, r);
  goldMetal.addColorStop(0, '#f6e3ad');
  goldMetal.addColorStop(0.5, '#c9a256');
  goldMetal.addColorStop(1, '#8a6a2f');
  ctx.fillStyle = goldMetal;
  ctx.fillRect(r * 0.98, -r * 0.05, r * 0.14, r * 0.22);
  ctx.fillRect(r * 1.0, -r * 0.34, r * 0.12, r * 0.14);
  ctx.fillRect(r * 1.0, r * 0.2, r * 0.12, r * 0.14);

  // gold bezel with tachymeter scale
  const bezelGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r * 1.14);
  bezelGrad.addColorStop(0, '#f8e7b8');
  bezelGrad.addColorStop(0.55, '#caa25c');
  bezelGrad.addColorStop(1, '#7c5e28');
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
  ctx.fillStyle = bezelGrad;
  ctx.fill();

  const tachy = [400, 333, 285, 250, 222, 200, 182, 166, 153, 142, 133, 125, 120];
  ctx.save();
  ctx.rotate(angle * 0.1);
  ctx.font = `600 ${Math.round(size * 0.016)}px sans-serif`;
  ctx.fillStyle = 'rgba(35,25,10,0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  tachy.forEach((val, i) => {
    const a = (i / tachy.length) * Math.PI * 2 - Math.PI / 2;
    const tx = Math.cos(a) * r * 0.98;
    const ty = Math.sin(a) * r * 0.98;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(String(val), 0, 0);
    ctx.restore();
  });
  ctx.restore();

  // steel case body between bezel and dial
  const steelGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r * 0.96);
  steelGrad.addColorStop(0, '#f2f2f4');
  steelGrad.addColorStop(0.6, '#c7c8cc');
  steelGrad.addColorStop(1, '#8b8c92');
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.fillStyle = steelGrad;
  ctx.fill();

  // dial
  ctx.save();
  const dialGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.78);
  dialGrad.addColorStop(0, '#fbfaf6');
  dialGrad.addColorStop(0.8, '#f0ede4');
  dialGrad.addColorStop(1, '#ddd8c9');
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.fillStyle = dialGrad;
  ctx.fill();
  ctx.lineWidth = size * 0.006;
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.stroke();

  // three chronograph subdials
  const subPositions = [
    { a: Math.PI, label: 'MIN' },
    { a: -Math.PI / 2, label: 'RUN' },
    { a: 0, label: 'SEC' },
  ];
  subPositions.forEach(({ a }, idx) => {
    const sx = Math.cos(a) * r * 0.36;
    const sy = Math.sin(a) * r * 0.36;
    ctx.save();
    ctx.translate(sx, sy);
    const subGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.19);
    subGrad.addColorStop(0, '#ffffff');
    subGrad.addColorStop(1, '#e2ddd0');
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.19, 0, Math.PI * 2);
    ctx.fillStyle = subGrad;
    ctx.fill();
    ctx.lineWidth = size * 0.003;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const ta = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ta) * r * 0.15, Math.sin(ta) * r * 0.15);
      ctx.lineTo(Math.cos(ta) * r * 0.17, Math.sin(ta) * r * 0.17);
      ctx.lineWidth = size * 0.0025;
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.stroke();
    }
    ctx.save();
    ctx.rotate(hands * (2 + idx * 1.4) - Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, size * 0.01);
    ctx.lineTo(0, -r * 0.13);
    ctx.lineWidth = size * 0.003;
    ctx.strokeStyle = '#8a6a2f';
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  });

  // hour markers (applied gold batons)
  for (let i = 0; i < 12; i++) {
    if (i % 3 === 0) continue; // cardinal points read via subdials/logo area
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const inner = r * 0.58;
    const outer = r * 0.68;
    const mx = (Math.cos(a) * (inner + outer)) / 2;
    const my = (Math.sin(a) * (inner + outer)) / 2;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-size * 0.007 + 1, -(outer - inner) / 2 + 1, size * 0.014, outer - inner);
    ctx.fillStyle = goldMetal;
    ctx.fillRect(-size * 0.007, -(outer - inner) / 2, size * 0.014, outer - inner);
    ctx.restore();
  }

  // brand text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1c1c1e';
  ctx.font = `italic 600 ${Math.round(size * 0.04)}px "Instrument Serif", serif`;
  ctx.fillText('CHROMA', 0, -r * 0.5);
  ctx.font = `${Math.round(size * 0.015)}px sans-serif`;
  ctx.fillStyle = 'rgba(28,28,30,0.7)';
  ctx.fillText('AUTOMATIC CHRONOGRAPH', 0, -r * 0.4);

  // hands (hour, minute)
  ctx.save();
  ctx.rotate(hands - Math.PI / 2);
  tapered(ctx, r * 0.4, size * 0.02, size * 0.007);
  ctx.fillStyle = '#2a2a2c';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.rotate(hands * 3.2 - Math.PI / 2);
  tapered(ctx, r * 0.58, size * 0.015, size * 0.005);
  ctx.fillStyle = '#2a2a2c';
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.013, 0, Math.PI * 2);
  ctx.fillStyle = goldMetal;
  ctx.fill();

  // crystal highlight
  ctx.beginPath();
  ctx.ellipse(-r * 0.24, -r * 0.32, r * 0.34, r * 0.13, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function WatchVisual({ size = 620, className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    if (prefersReducedMotion) {
      drawChronograph(ctx, size, { angle: 0.3, hands: 1.2 });
      return;
    }

    let rafId;
    let start = null;
    const loop = (t) => {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      drawChronograph(ctx, size, { angle: elapsed * 0.35, hands: elapsed * 0.7 });
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [size]);

  return (
    <div style={{ width: size, maxWidth: '92vw', aspectRatio: '1' }}>
      <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

window.WatchVisual = WatchVisual;
