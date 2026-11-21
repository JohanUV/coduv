/* coduv · ecosistema de fondo: red de nodos (hero, canvas), redes orgánicas en los costados de cada sección (SVG,
   se dibujan al entrar en pantalla), haces de luz en el cierre, apariciones con blur y brillo que sigue al cursor */
(() => {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, padre) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (padre) padre.appendChild(e); return e; };
  const azar = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };  /* mismo diseño en cada visita */
  const capa = (sec, cls, tipo) => { const c = document.createElement('div'); c.className = 'fx ' + cls; c.setAttribute('aria-hidden', 'true'); c.appendChild(tipo === 'canvas' ? document.createElement('canvas') : document.createElementNS(NS, 'svg')); sec.prepend(c); return c; };
  const alVer = (nodo, fn, margen = '0px 0px -12% 0px') => {
    if (quieto || !('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { fn(); io.disconnect(); } }), {rootMargin: margen}); io.observe(nodo);
  };

  /* ── hero: red de nodos en movimiento lento ── */
  const hero = document.querySelector('.hero');
  if (hero) {
    const cv = capa(hero, 'fx--hero', 'canvas').firstChild, ctx = cv.getContext('2d');
    let W, H, pts = []; const dpr = Math.min(devicePixelRatio || 1, 2);
    const medir = () => {
      W = hero.clientWidth; H = hero.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({length: Math.round(Math.min(110, W * H / 13000))}, () => ({x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2, r: Math.random() < .12 ? 2.2 : 1.2}));
    };
    const dibujar = () => {
      ctx.clearRect(0, 0, W, H);
      if (!quieto) for (const p of pts) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 150) { ctx.strokeStyle = `rgba(255,255,255,${.16 * (1 - d / 150)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      for (const p of pts) { ctx.fillStyle = p.r > 2 ? 'rgba(200,245,96,.95)' : 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
      if (!quieto) requestAnimationFrame(dibujar);
    };
    medir(); dibujar(); addEventListener('resize', () => { medir(); if (quieto) dibujar(); });
  }

  /* ── secciones: red orgánica en los costados (cada nodo unido a sus 1-3 vecinos más cercanos del mismo lado) ── */
  const red = (svg, W, H, rnd) => {
    svg.innerHTML = ''; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const movil = W < 760, n = movil ? 16 : 34, pts = [];
    for (let k = 0; k < n * 6 && pts.length < n; k++) {
      const izq = rnd() < .5, x = izq ? rnd() * W * .28 : W - rnd() * W * .28, y = H * (.06 + .88 * rnd());
      if (pts.every(p => Math.hypot(p.x - x, p.y - y) > (movil ? 50 : 70))) pts.push({x, y, izq});
    }
    const g = el('g', {}, svg), usado = new Set();
    pts.forEach((p, i) => {
      pts.map((q, j) => [j, Math.hypot(p.x - q.x, p.y - q.y)]).filter(([j, d]) => j !== i && d < 230 && pts[j].izq === p.izq)
        .sort((a, b) => a[1] - b[1]).slice(0, 1 + Math.floor(rnd() * 2.4)).forEach(([j, d]) => {
          const k = i < j ? `${i}-${j}` : `${j}-${i}`; if (usado.has(k)) return; usado.add(k);
          const l = el('line', {x1: p.x.toFixed(1), y1: p.y.toFixed(1), x2: pts[j].x.toFixed(1), y2: pts[j].y.toFixed(1), class: 'enlace'}, g);
          l.style.setProperty('--l', Math.ceil(d)); l.style.transitionDelay = (rnd() * .9).toFixed(2) + 's';
        });
    });
    pts.forEach(p => {
      const verde = rnd() < .14, r = verde ? 2.6 : 1.6 + rnd() * .8;
      if (verde) { const h = el('circle', {cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 9, class: 'halo'}, g); h.style.animationDelay = (-rnd() * 3.6).toFixed(2) + 's'; }
      const c = el('circle', {cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: r.toFixed(1), class: 'punto' + (verde ? ' punto--verde' : '')}, g);
      c.style.transitionDelay = (.3 + rnd() * .8).toFixed(2) + 's';
    });
  };
  document.querySelectorAll('main .sec:not(.cta)').forEach((sec, i) => {
    const c = capa(sec, 'fx--sec', 'svg'), pintar = () => red(c.firstChild, sec.clientWidth, sec.clientHeight, azar(9301 + i * 7919));
    pintar(); addEventListener('resize', pintar); alVer(sec, () => c.classList.add('is-in'), '0px 0px -25% 0px');
  });

  /* ── cierre: haces de luz ── */
  const cta = document.querySelector('.cta');
  if (cta) { const h = document.createElement('div'); h.className = 'haces'; h.setAttribute('aria-hidden', 'true'); h.innerHTML = '<i></i><i></i><i></i><i></i><i></i>'; cta.prepend(h); }

  /* ── apariciones con blur (títulos, tarjetas, pasos) ── */
  ['.sec__title', '.sec .lead', '.figs > *', '.also > *', '.case', '.price', '.steps > li', '.faq__list > *', '.cta h2', '.cta p', '.cta .cta-row'].forEach(sel =>
    document.querySelectorAll(sel).forEach((n, k) => {
      n.classList.add('revela'); n.style.setProperty('--d', (Math.min(k, 5) * .08).toFixed(2) + 's');
      alVer(n, () => n.classList.add('is-in'));
    }));
  /* seguro: todo lo que ya quedó arriba de la pantalla (salto desde el menú, scroll muy rápido) se muestra igual */
  let rev = false;
  const revisar = () => { rev = false; document.querySelectorAll('.revela:not(.is-in)').forEach(n => { if (n.getBoundingClientRect().top < innerHeight * .92) n.classList.add('is-in'); }); };
  addEventListener('scroll', () => { if (!rev) { rev = true; requestAnimationFrame(revisar); } }, {passive: true});
  addEventListener('hashchange', revisar); addEventListener('load', revisar);

  /* ── brillo que sigue al cursor ── */
  document.querySelectorAll('.case, .price, .try').forEach(n => {
    n.classList.add('luz');
    n.addEventListener('pointermove', (e) => { const r = n.getBoundingClientRect(); n.style.setProperty('--mx', (e.clientX - r.left) + 'px'); n.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
})();
