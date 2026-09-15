/* CODUV — depth.js
   Relieve 3D para imágenes planas: cada <span class="depth" data-depth="mapa.webp"><img ...></span>
   se dibuja en WebGL con paralaje por profundidad y una luz que sigue al cursor.
   Sin WebGL (o sin mapa) se queda la <img> normal. */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = Array.from(document.querySelectorAll(".depth"));
  if (!els.length) return;

  const VS = "attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*0.5+0.5,0.5-p.y*0.5);gl_Position=vec4(p,0.,1.);}";
  const FS = [
    "precision mediump float;varying vec2 v;uniform sampler2D img;uniform sampler2D dep;uniform vec2 m;uniform float t;uniform float s;uniform vec2 px;",
    "void main(){",
    "  float d=texture2D(dep,v).r;",
    "  vec2 off=m*s*(d-0.45);",              // desplazamiento por profundidad (paralaje)
    "  vec2 uv=clamp(v+off,0.001,0.999);",
    "  vec4 c=texture2D(img,uv);",
    "  float dx=texture2D(dep,uv+vec2(px.x,0.)).r-texture2D(dep,uv-vec2(px.x,0.)).r;",
    "  float dy=texture2D(dep,uv+vec2(0.,px.y)).r-texture2D(dep,uv-vec2(0.,px.y)).r;",
    "  vec3 n=normalize(vec3(-dx*14.,-dy*14.,1.));",
    "  vec3 l=normalize(vec3(m.x*1.4+0.3,-m.y*1.4-0.5,0.9));",
    "  float diff=max(dot(n,l),0.);",
    "  float spec=pow(max(dot(reflect(-l,n),vec3(0.,0.,1.)),0.),18.);",
    "  float dd=texture2D(dep,uv).r;",
    "  vec3 rgb=c.rgb*(0.72+0.42*diff)+vec3(0.9,0.95,1.)*spec*0.55*c.a;",
    "  rgb+=vec3(0.24,0.55,1.)*0.10*dd*c.a;",      // halo azul en las partes cercanas
    "  gl_FragColor=vec4(rgb*c.a,c.a);",
    "}"
  ].join("\n");

  const load = (src) => new Promise((res, rej) => { const i = new Image(); if (/^https?:/i.test(src) && !src.startsWith(location.origin)) i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; });

  const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  window.addEventListener("pointermove", (e) => { mouse.tx = e.clientX; mouse.ty = e.clientY; mouse.active = true; }, { passive: true });
  window.addEventListener("pointerleave", () => { mouse.active = false; });
  document.addEventListener("mouseleave", () => { mouse.active = false; });

  els.forEach(async (el) => {
    const img = el.querySelector("img"); const depSrc = el.dataset.depth;
    if (!img || !depSrc) return;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    let a, b;
    try { [a, b] = await Promise.all([load(img.currentSrc || img.src), load(depSrc)]); } catch (e) { return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = (image, unit) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    tex(a, 0); tex(b, 1);
    gl.uniform1i(gl.getUniformLocation(prog, "img"), 0); gl.uniform1i(gl.getUniformLocation(prog, "dep"), 1);
    gl.uniform2f(gl.getUniformLocation(prog, "px"), 1 / b.width, 1 / b.height);
    const uM = gl.getUniformLocation(prog, "m"), uT = gl.getUniformLocation(prog, "t"), uS = gl.getUniformLocation(prog, "s");
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    canvas.className = "depth__gl"; el.appendChild(canvas); el.classList.add("is-gl");
    const strength = parseFloat(el.dataset.strength || "0.05");
    let visible = true, cx = 0, cy = 0;
    const resize = () => {
      const r = img.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
      canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize(); window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el);

    const draw = (now) => {
      if (visible) {
        const r = el.getBoundingClientRect();
        let mx, my;
        if (mouse.active && !reduced) {
          mx = Math.max(-1, Math.min(1, (mouse.tx - (r.left + r.width / 2)) / (window.innerWidth * 0.45)));
          my = Math.max(-1, Math.min(1, (mouse.ty - (r.top + r.height / 2)) / (window.innerHeight * 0.45)));
        } else {
          const k = now / 1000; mx = Math.sin(k * 0.6) * 0.55; my = Math.cos(k * 0.45) * 0.35;   // vaivén en reposo
        }
        cx += (mx - cx) * 0.08; cy += (my - cy) * 0.08;
        if (canvas.width !== Math.round(img.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2))) resize();
        gl.uniform2f(uM, cx, cy); gl.uniform1f(uT, now / 1000); gl.uniform1f(uS, strength);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  });
})();
