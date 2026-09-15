/* CODUV — walker.js
   Cody caminante: gecko vectorial (vista cenital) que sale de la C del hero cuando
   empiezas a bajar, recorre los bordes de la pantalla siguiendo el scroll (baja si
   bajas, sube si subes) y vuelve a la C al llegar arriba. Cuando te detienes, hace
   cosas: mira hacia el cursor, saca la lengua, parpadea, mueve la cola, flexiones. */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || document.documentElement.classList.contains("shot") && !location.search.includes("walk=")) return;
  const heroGecko = document.getElementById("gecko");
  if (!heroGecko) return;

  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };

  // ─── Construcción del gecko ───────────────────────────────────────────
  const BLUE = "#2a5cf0", BLUE_D = "#173fb8", GREEN = "#5cff6a", PINK = "#ff5c8a";
  const wrap = document.createElement("div"); wrap.className = "walker"; wrap.setAttribute("aria-hidden", "true");
  const svg = el("svg", { viewBox: "-80 -40 140 80", width: "100%", height: "100%" }, null); wrap.appendChild(svg);
  const g = el("g", {}, svg);                           // rotación de todo el cuerpo
  const shadow = el("ellipse", { cx: -2, cy: 6, rx: 34, ry: 12, fill: "rgba(0,0,0,0.35)" }, g);
  const tailG = el("g", {}, g);
  const tail = Array.from({ length: 9 }, (_, i) => el("circle", { r: 7 - i * 0.62, fill: i % 3 === 1 ? GREEN : BLUE, stroke: BLUE_D, "stroke-width": 0.8 }, tailG));
  const legsG = el("g", {}, g);
  const legs = [
    { ax: 14, ay: -8, rx: 26, ry: -20, side: -1, ph: 0 },        // delantera izquierda
    { ax: 14, ay: 8, rx: 26, ry: 20, side: 1, ph: Math.PI },     // delantera derecha
    { ax: -12, ay: -8, rx: -20, ry: -20, side: -1, ph: Math.PI },// trasera izquierda
    { ax: -12, ay: 8, rx: -20, ry: 20, side: 1, ph: 0 }          // trasera derecha
  ].map((L) => {
    L.line = el("polyline", { fill: "none", stroke: BLUE, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, legsG);
    L.toes = [0, 1, 2].map(() => el("circle", { r: 2.6, fill: GREEN }, legsG));
    return L;
  });
  const bodyG = el("g", {}, g);
  el("ellipse", { cx: -2, cy: 0, rx: 25, ry: 10.5, fill: BLUE, stroke: BLUE_D, "stroke-width": 1 }, bodyG);
  [[-14, -3, 3.2], [-6, 4, 2.6], [3, -4, 3], [12, 3, 2.4], [-18, 4, 2]].forEach(([x, y, r]) => el("circle", { cx: x, cy: y, r, fill: GREEN, opacity: 0.9 }, bodyG));
  const headG = el("g", { transform: "translate(28 0)" }, g);
  el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 9.5, fill: BLUE, stroke: BLUE_D, "stroke-width": 1 }, headG);
  el("ellipse", { cx: 9, cy: 0, rx: 7, ry: 5.5, fill: BLUE, stroke: BLUE_D, "stroke-width": 1 }, headG);
  el("circle", { cx: -4, cy: -3, r: 2.2, fill: GREEN, opacity: 0.9 }, headG);
  el("circle", { cx: 2, cy: 4, r: 1.8, fill: GREEN, opacity: 0.9 }, headG);
  const tongue = el("path", { d: "M14 0 h0", stroke: PINK, "stroke-width": 2.2, fill: "none", "stroke-linecap": "round" }, headG);
  const eyes = [-1, 1].map((s) => {
    const eg = el("g", { transform: "translate(4 " + (s * 7.5) + ")" }, headG);
    el("circle", { r: 4.4, fill: GREEN, stroke: BLUE_D, "stroke-width": 0.8 }, eg);
    el("circle", { r: 2.1, fill: "#08131f", cx: 1 }, eg);
    el("circle", { r: 0.9, fill: "#fff", cx: 0.2, cy: -1.2 }, eg);
    return eg;
  });
  document.body.appendChild(wrap);

  // ─── Ruta por la pantalla (fracciones del viewport) ──────────────────
  const base = [[0.93, 0.18], [0.94, 0.55], [0.9, 0.86], [0.55, 0.9], [0.08, 0.84], [0.06, 0.45], [0.1, 0.16], [0.5, 0.1], [0.92, 0.3], [0.94, 0.7], [0.6, 0.9], [0.12, 0.9], [0.07, 0.5], [0.4, 0.14], [0.9, 0.2], [0.93, 0.6], [0.7, 0.9]];
  const jitter = () => (Math.random() - 0.5) * 0.06;
  const pts = base.map(([x, y]) => [Math.min(0.96, Math.max(0.04, x + jitter())), Math.min(0.92, Math.max(0.08, y + jitter()))]);
  const catmull = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return [
    0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]; };
  let samples = [], total = 0;
  const buildPath = () => {
    const vw = window.innerWidth, vh = window.innerHeight; samples = []; total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 24; k++) { const q = catmull(p0, p1, p2, p3, k / 24); samples.push([q[0] * vw, q[1] * vh]); }
    }
    samples.push([pts[pts.length - 1][0] * vw, pts[pts.length - 1][1] * vh]);
    samples = samples.map((p, i) => { if (i) total += Math.hypot(p[0] - samples[i - 1][0], p[1] - samples[i - 1][1]); return { x: p[0], y: p[1], d: total }; });
  };
  const at = (dist) => {                                   // punto de la ruta a una distancia dada
    dist = Math.max(0, Math.min(total, dist));
    let lo = 0, hi = samples.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (samples[mid].d < dist) lo = mid + 1; else hi = mid; }
    const b = samples[lo], a = samples[Math.max(0, lo - 1)], span = b.d - a.d || 1, f = (dist - a.d) / span;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  };
  buildPath(); window.addEventListener("resize", buildPath);

  // ─── Estado ───────────────────────────────────────────────────────────
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const size = () => (window.innerWidth < 700 ? 84 : 124);
  let px = 0, py = 0, ang = 0, phase = 0, lastScroll = window.scrollY, lastMove = performance.now(), walking = 0;
  let headA = 0, headT = 0, eyeS = 1, eyeT = 1, tongueL = 0, tongueT = 0, tailAmp = 1, tailT = 1, pushup = 0, pushT = 0, blinkS = 1;
  let nextIdle = performance.now() + 2500, idleTimer = 0;
  const forced = parseFloat(new URLSearchParams(location.search).get("walk"));

  const lerpAngle = (a, b, k) => { let d = ((b - a + 540) % 360) - 180; return a + d * k; };
  const scrollMax = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

  const doIdle = () => {
    const acts = ["look", "tongue", "look", "blink", "tail", "pushup", "look"];
    const a = acts[Math.floor(Math.random() * acts.length)];
    if (a === "look") { headT = 1; eyeT = 1.3; clearTimeout(idleTimer); idleTimer = setTimeout(() => { headT = 0; eyeT = 1; if (Math.random() < 0.6) tongueT = 1; setTimeout(() => { tongueT = 0; }, 420); }, 1400 + Math.random() * 1200); }
    else if (a === "tongue") { tongueT = 1; setTimeout(() => { tongueT = 0; }, 380); }
    else if (a === "blink") { blinkS = 0.1; setTimeout(() => { blinkS = 1; }, 140); setTimeout(() => { blinkS = 0.1; setTimeout(() => { blinkS = 1; }, 140); }, 320); }
    else if (a === "tail") { tailT = 3; setTimeout(() => { tailT = 1; }, 1500); }
    else if (a === "pushup") { pushT = 1; setTimeout(() => { pushT = 0; }, 1600); }
    nextIdle = performance.now() + 2600 + Math.random() * 3200;
  };

  const frame = (now) => {
    const vw = window.innerWidth, vh = window.innerHeight, S = size();
    const sy = window.scrollY;
    const t = isNaN(forced) ? sy / scrollMax() : forced;
    const moved = Math.abs(sy - lastScroll);
    if (moved > 0.5) { lastMove = now; }
    // ruta: distancia recorrida proporcional al scroll
    const leave = Math.min(1, Math.max(0, (t - 0.015) / 0.07));      // 0 = en la C, 1 = ya en la ruta
    const ease = leave * leave * (3 - 2 * leave);
    const target = at(Math.max(0, t - 0.06) / 0.94 * total);
    const r = heroGecko.getBoundingClientRect();
    const cx = r.left + r.width * 0.62, cy = r.top + r.height * 0.42;  // punto sobre la C
    const tx = cx + (target.x - cx) * ease, ty = cy + (target.y - cy) * ease;
    const dx = tx - px, dy = ty - py, dist = Math.hypot(dx, dy);
    if (dist > 0.3) {
      const k = Math.min(1, 0.12 + dist / 400);
      px += dx * k; py += dy * k;
      const dir = Math.atan2(dy, dx) * 180 / Math.PI;
      ang = lerpAngle(ang, dir, Math.min(1, 0.06 + dist / 300));
      phase += Math.min(6, dist * k) / 9;
      walking = Math.min(1, walking + 0.15);
    } else { walking = Math.max(0, walking - 0.05); }
    lastScroll = sy;
    // visibilidad: escondido en la C cuando estás arriba del todo
    const vis = isNaN(forced) ? Math.min(1, Math.max(0, (t - 0.004) / 0.02)) : 1;
    wrap.style.opacity = String(vis);
    // comportamiento en reposo
    const idle = now - lastMove > 1400 && vis > 0.5;
    if (idle && now > nextIdle) doIdle();
    if (!idle) { headT = 0; eyeT = 1; }
    // cabeza hacia el cursor
    let want = 0;
    if (headT) { const a = Math.atan2(mouse.y - py, mouse.x - px) * 180 / Math.PI; want = Math.max(-70, Math.min(70, ((a - ang + 540) % 360) - 180)); }
    headA += (want - headA) * 0.1; eyeS += (eyeT - eyeS) * 0.15; tongueL += ((tongueT ? 17 : 0) - tongueL) * 0.35; tailAmp += (tailT - tailAmp) * 0.08; pushup += (pushT - pushup) * 0.1;
    headG.setAttribute("transform", "translate(28 0) rotate(" + headA.toFixed(1) + ")");
    tongue.setAttribute("d", tongueL > 0.5 ? "M14 0 h" + tongueL.toFixed(1) + " m0 0 l3 -2.5 m-3 2.5 l3 2.5" : "M14 0 h0");
    eyes.forEach((e, i) => e.setAttribute("transform", "translate(4 " + ((i ? 1 : -1) * 7.5) + ") scale(" + eyeS.toFixed(2) + " " + (eyeS * blinkS).toFixed(2) + ")"));
    // cola
    const tp = phase * 0.9 + now / 600;
    tail.forEach((c, i) => { c.setAttribute("cx", (-24 - i * 6.6).toFixed(1)); c.setAttribute("cy", (Math.sin(tp - i * 0.55) * (i * 1.05) * tailAmp * (0.35 + walking * 0.65 + (tailAmp - 1) * 0.3)).toFixed(1)); });
    // patas (marcha diagonal)
    legs.forEach((L) => {
      const s = Math.sin(phase + L.ph), lift = Math.max(0, Math.cos(phase + L.ph));
      const fx = L.rx + s * 9 * (0.2 + walking * 0.8), fy = L.ry + L.side * (lift * 2 - (1 - walking) * 1.5);
      const kx = (L.ax + fx) / 2 + (L.rx > 0 ? 3 : -3), ky = (L.ay + fy) / 2 + L.side * 9;
      L.line.setAttribute("points", L.ax + "," + L.ay + " " + kx.toFixed(1) + "," + ky.toFixed(1) + " " + fx.toFixed(1) + "," + fy.toFixed(1));
      const base = Math.atan2(fy - ky, fx - kx);
      L.toes.forEach((tc, i) => { const a = base + (i - 1) * 0.55; tc.setAttribute("cx", (fx + Math.cos(a) * 4.5).toFixed(1)); tc.setAttribute("cy", (fy + Math.sin(a) * 4.5).toFixed(1)); });
    });
    // flexiones: el cuerpo "sube y baja"
    const bob = pushup ? Math.abs(Math.sin(now / 160)) * 0.12 * pushup : 0;
    bodyG.setAttribute("transform", "scale(" + (1 + bob).toFixed(3) + ")");
    shadow.setAttribute("rx", (34 - bob * 40).toFixed(1));
    g.setAttribute("transform", "rotate(" + ang.toFixed(1) + ")");
    wrap.style.width = wrap.style.height = S + "px";
    wrap.style.transform = "translate(" + (px - S / 2).toFixed(1) + "px," + (py - S / 2).toFixed(1) + "px)";
    requestAnimationFrame(frame);
  };
  // posición inicial: sobre la C
  const r0 = heroGecko.getBoundingClientRect(); px = r0.left + r0.width * 0.62; py = r0.top + r0.height * 0.42;
  requestAnimationFrame(frame);
})();
