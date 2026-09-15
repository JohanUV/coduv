/* CODUV — walker3d.js
   Cody en 3D real: malla generada con Hunyuan3D a partir de la mascota, renderizada con
   Three.js sobre toda la página. Al empezar a bajar se despega de la C, se "desenrolla"
   (pasa de la pose curvada a una recta) y camina por la pantalla siguiendo el scroll con
   ondulación lateral, como un lagarto. Si subes, regresa; arriba del todo vuelve a la C.
   Cuando te detienes: mira hacia el cursor, hace flexiones o agita la cola.
   Requiere window.THREE (three.min.js) y los datos en window.CODUV_GECKO = { bin, tex }. */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const forced = parseFloat(new URLSearchParams(location.search).get("walk"));
  if (reduced) return;
  if (document.documentElement.classList.contains("shot") && isNaN(forced)) return;
  const heroGecko = document.getElementById("gecko");
  const heroImg = heroGecko && heroGecko.querySelector("img");
  const data = window.CODUV_GECKO;
  if (!heroGecko || !data || !window.THREE) return;
  const THREE = window.THREE;

  // ─── Lienzo fijo sobre toda la página ────────────────────────────────
  const canvas = document.createElement("canvas"); canvas.className = "walker3d"; canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas); 
  const SHOTMODE = !isNaN(forced);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: SHOTMODE });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -2000, 2000); cam.position.z = 1000;
  scene.add(new THREE.HemisphereLight(0x9fc4ff, 0x060d1f, 0.38));
  const key = new THREE.DirectionalLight(0xffffff, 0.8); key.position.set(-300, 400, 800); scene.add(key);
  const rim = new THREE.DirectionalLight(0x3d8bff, 0.55); rim.position.set(400, -200, 300); scene.add(rim);
  const warm = new THREE.DirectionalLight(0xff8a2b, 0.35); warm.position.set(200, 500, 200); scene.add(warm);

  const resize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    cam.left = 0; cam.right = w; cam.top = 0; cam.bottom = -h; cam.updateProjectionMatrix();
  };
  resize(); window.addEventListener("resize", resize);

  // ─── Carga de la malla (formato propio, ver scripts/export_gecko.py) ─
  const uni = { uUnroll: { value: 0 }, uPhase: { value: 0 }, uAmp: { value: 0 }, uTailAmp: { value: 0 }, uBob: { value: 0 } };
  let mesh = null, meta = null;
  fetch(data.bin).then((r) => r.arrayBuffer()).then((buf) => {
    const dv = new DataView(buf); let o = 0;
    const nv = dv.getUint32(o, true); o += 4; const nf = dv.getUint32(o, true); o += 4;
    meta = { px512: dv.getFloat32(o, true), ox: dv.getFloat32(o + 4, true), oy: dv.getFloat32(o + 8, true), ang0: dv.getFloat32(o + 12, true) }; o += 16;
    const f = (n) => { const a = new Float32Array(buf, o, n); o += n * 4; return a; };
    const pos = f(nv * 3), pos2 = f(nv * 3), nrm = f(nv * 3), nrm2 = f(nv * 3), uv = f(nv * 2);
    const idx = new Uint32Array(buf, o, nf * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("position2", new THREE.BufferAttribute(pos2, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
    g.setAttribute("normal2", new THREE.BufferAttribute(nrm2, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.34, metalness: 0.05, emissive: 0x081a52, emissiveIntensity: 0.5 });
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uni);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute vec3 position2; attribute vec3 normal2; uniform float uUnroll, uPhase, uAmp, uTailAmp, uBob; varying vec3 vLocal; varying vec3 vNrm;")
        .replace("#include <beginnormal_vertex>", "vec3 objectNormal = normalize(mix(normal, normal2, uUnroll));")
        .replace("#include <begin_vertex>", [
          "vec3 transformed = mix(position, position2, uUnroll);",
          // ondulación lateral en la pose recta: más fuerte hacia la cola (x negativo)
          "float s = clamp((transformed.x + 0.5), 0.0, 1.0);",             // 0 = cola, 1 = cabeza
          "float tail = smoothstep(0.55, 0.0, s);",
          "float wave = sin(transformed.x * 9.0 - uPhase) * (uAmp * (0.35 + 0.65 * (1.0 - s)) + uTailAmp * tail);",
          "transformed.y += wave * uUnroll;",
          "transformed.z += uBob * 0.06 * uUnroll;",
          "vLocal = transformed; vNrm = objectNormal;"
        ].join("\n"));
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", [
          "#include <common>",
          "varying vec3 vLocal; varying vec3 vNrm;",
          "float spots(vec3 p){",
          "  vec3 q = p * 21.0;",
          "  float a = sin(q.x) * sin(q.y * 0.9 + 1.3) * sin(q.z * 1.1 + 2.1);",
          "  float b = sin(q.x * 0.55 + 2.0) * sin(q.y * 0.6) * sin(q.z * 0.5 + 1.0);",
          "  return smoothstep(0.20, 0.42, max(a, b * 0.95));",
          "}"
        ].join("\n"))
        .replace("#include <color_fragment>", [
          "#include <color_fragment>",
          "vec3 deep = vec3(0.025, 0.085, 0.55);",
          "vec3 mid  = vec3(0.10, 0.34, 0.94);",
          "vec3 lime = vec3(0.36, 1.0, 0.26);",
          "float up = clamp(vNrm.z * 0.5 + 0.5, 0.0, 1.0);",
          "vec3 base = mix(deep, mid, up * up);",
          "float sp = spots(vLocal) * smoothstep(0.05, 0.45, up);",
          "diffuseColor.rgb *= mix(base, lime, sp);"
        ].join("\n"));
    };
    g.computeBoundingSphere(); meta.r0 = g.boundingSphere.radius;
    mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false; scene.add(mesh);
  }).catch(() => {});
  // la C del hero en 3D (blanca, brillante): se muestra cuando el gecko se va
  let cmesh = null, cmeta = null;
  if (data.c) fetch(data.c).then((r) => r.arrayBuffer()).then((buf) => {
    const dv = new DataView(buf); const nv = dv.getUint32(0, true), nf = dv.getUint32(4, true);
    cmeta = { px512: dv.getFloat32(8, true), ox: dv.getFloat32(12, true), oy: dv.getFloat32(16, true) };
    let o = 20;
    const pos = new Float32Array(buf, o, nv * 3); o += nv * 12; const nrm = new Float32Array(buf, o, nv * 3); o += nv * 12;
    const uvc = new Float32Array(buf, o, nv * 2); o += nv * 8;
    const idx = new Uint32Array(buf, o, nf * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uvc, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1));
    const m = new THREE.MeshPhysicalMaterial({ color: 0xdfeaff, roughness: 0.3, metalness: 0.02, clearcoat: 0.55, clearcoatRoughness: 0.22, transparent: true, opacity: 0 });
    cmesh = new THREE.Mesh(g, m); cmesh.frustumCulled = false; scene.add(cmesh);
  }).catch(() => {});

  // ─── Ruta por la pantalla ─────────────────────────────────────────────
  const base = [[0.86, 0.24], [0.88, 0.56], [0.84, 0.84], [0.55, 0.88], [0.16, 0.82], [0.13, 0.46], [0.16, 0.2], [0.5, 0.14], [0.85, 0.32], [0.87, 0.7], [0.6, 0.88], [0.18, 0.86], [0.14, 0.5], [0.4, 0.17], [0.84, 0.24], [0.86, 0.6], [0.66, 0.86]];
  const jitter = () => (Math.random() - 0.5) * 0.06;
  const pts = base.map(([x, y]) => [Math.min(0.9, Math.max(0.1, x + jitter())), Math.min(0.9, Math.max(0.12, y + jitter()))]);
  const cat = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return [
    0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]; };
  let samples = [], total = 0;
  const buildPath = () => {
    const vw = window.innerWidth, vh = window.innerHeight; samples = []; total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 24; k++) { const q = cat(p0, p1, p2, p3, k / 24); samples.push([q[0] * vw, q[1] * vh]); }
    }
    samples.push([pts[pts.length - 1][0] * vw, pts[pts.length - 1][1] * vh]);
    samples = samples.map((p, i) => { if (i) total += Math.hypot(p[0] - samples[i - 1][0], p[1] - samples[i - 1][1]); return { x: p[0], y: p[1], d: total }; });
  };
  const at = (dist) => {
    dist = Math.max(0, Math.min(total, dist));
    let lo = 0, hi = samples.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (samples[mid].d < dist) lo = mid + 1; else hi = mid; }
    const b = samples[lo], a = samples[Math.max(0, lo - 1)], span = b.d - a.d || 1, f = (dist - a.d) / span;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  };
  buildPath(); window.addEventListener("resize", buildPath);

  // ─── Estado y comportamiento ─────────────────────────────────────────
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const scrollMax = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const lerpAngle = (a, b, k) => { const d = ((b - a + 540) % 360) - 180; return a + d * k; };
  let px = 0, py = 0, ang = 0, phase = 0, walking = 0, lastScroll = window.scrollY, lastMove = performance.now();
  let lookT = 0, look = 0, tailT = 0, tailA = 0, bobT = 0, bob = 0, nextIdle = performance.now() + 2500, unroll = 0;
  const swapT = { v: 0 };  // 0 = hero con gecko, 1 = C vacía
  const doIdle = () => {
    const a = ["look", "look", "tail", "pushup", "look"][Math.floor(Math.random() * 5)];
    if (a === "look") { lookT = 1; setTimeout(() => { lookT = 0; }, 1500 + Math.random() * 1500); }
    else if (a === "tail") { tailT = 1; setTimeout(() => { tailT = 0; }, 1600); }
    else { bobT = 1; setTimeout(() => { bobT = 0; }, 1500); }
    nextIdle = performance.now() + 2800 + Math.random() * 3200;
  };

  const SHOT = SHOTMODE;
  const frame = (now) => {
    if (!SHOT) requestAnimationFrame(frame);
    if (!mesh || !meta) return;
    const sy = window.scrollY, t = isNaN(forced) ? sy / scrollMax() : forced;
    if (Math.abs(sy - lastScroll) > 0.5) lastMove = now;
    lastScroll = sy;
    // punto de la C (posición del gecko del hero) en coordenadas de pantalla
    const r = heroImg.getBoundingClientRect(), k512 = r.width / 512;
    const cx = r.left + meta.ox * k512, cy = r.top + meta.oy * k512, scale0 = meta.px512 * k512;
    // fase de salida: 0 = pegado a la C, 1 = en la ruta
    const leave = Math.min(1, Math.max(0, (t - 0.01) / 0.08)), ease = leave * leave * (3 - 2 * leave);
    unroll = 0;   // el gecko conserva su pose natural curvada
    const target = at(Math.max(0, t - 0.06) / 0.94 * total);
    const tx = cx + (target.x - cx) * ease, ty = cy + (target.y - cy) * ease;
    const dx = tx - px, dy = ty - py, dist = Math.hypot(dx, dy);
    if (dist > 0.3) {
      const kk = Math.min(1, 0.12 + dist / 400); px += dx * kk; py += dy * kk;
      if (ease > 0.15) ang = lerpAngle(ang, Math.atan2(dy, dx) * 180 / Math.PI, Math.min(1, 0.06 + dist / 300));
      phase += Math.min(6, dist * kk) / 10; walking = Math.min(1, walking + 0.12);
    } else walking = Math.max(0, walking - 0.04);
    // reposo
    const idle = now - lastMove > 1400 && ease > 0.5;
    if (idle && now > nextIdle) doIdle();
    if (!idle) { lookT = 0; }
    let want = 0;
    if (lookT) { const a = Math.atan2(mouse.y - py, mouse.x - px) * 180 / Math.PI; want = Math.max(-60, Math.min(60, ((a - ang + 540) % 360) - 180)); }
    look += (want - look) * 0.08; tailA += ((tailT ? 1 : 0) - tailA) * 0.08; bob += ((bobT ? 1 : 0) - bob) * 0.1;
    // uniforms
    uni.uUnroll.value = unroll;
    uni.uPhase.value = phase * 2.2 + (tailA ? now / 120 : 0);
    uni.uAmp.value = 0.02 + walking * 0.055;
    uni.uTailAmp.value = tailA * 0.08 + (1 - walking) * 0.012 * Math.sin(now / 500) * 0;
    uni.uBob.value = bob ? Math.abs(Math.sin(now / 150)) * bob : 0;
    // pose: en la C usa la escala/rotación del hero; en ruta, tamaño fijo y rumbo
    const sizePx = window.innerWidth < 700 ? 150 : 210;
    const scaleRoute = sizePx / (2 * meta.r0);
    const sc = scale0 + (scaleRoute - scale0) * ease;
    mesh.scale.set(sc, sc, sc);
    mesh.position.set(px, -py, 0);
    mesh.rotation.set(0, 0, -((ang + look) - meta.ang0) * Math.PI / 180 * ease);
    // tilt sutil para que se vea el lomo
    mesh.rotation.x = -0.22 * ease;
    // opacidad: invisible cuando está pegado a la C (ahí se ve el raster)
    const vis = isNaN(forced) ? Math.min(1, Math.max(0, (t - 0.004) / 0.02)) : 1;
    canvas.style.opacity = String(vis);
    // crossfade del hero: imagen con gecko → C en 3D
    const sw = Math.min(1, Math.max(0, (t - 0.012) / 0.03));
    if (Math.abs(sw - swapT.v) > 0.005) { swapT.v = sw; heroGecko.style.setProperty("--swap", String(sw)); heroGecko.classList.toggle("is-empty", sw > 0.5); }
    if (cmesh && cmeta) {
      const csc = cmeta.px512 * k512;
      cmesh.visible = sw > 0.004 && r.bottom > 0 && r.top < window.innerHeight;
      cmesh.material.opacity = sw;
      cmesh.scale.set(csc, csc, csc);
      cmesh.position.set(r.left + cmeta.ox * k512, -(r.top + cmeta.oy * k512), -5);
    }
    try { renderer.render(scene, cam); if (SHOT) { const c2 = document.createElement("canvas"); c2.width = 720; c2.height = 410; const ctx2 = c2.getContext("2d"); ctx2.fillStyle = "#0a1020"; ctx2.fillRect(0,0,720,410); ctx2.drawImage(canvas, 0, 0, 720, 410); document.documentElement.dataset.w3dpng = c2.toDataURL("image/png"); } } catch (e) { document.documentElement.dataset.w3drender = "ERR " + (e && e.message); }
  };
  const r0 = heroImg.getBoundingClientRect(); px = r0.left + r0.width * 0.6; py = r0.top + r0.height * 0.4;
  if (SHOT) setInterval(() => frame(performance.now()), 16); else requestAnimationFrame(frame);
})();
