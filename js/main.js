/* CODUV — main.js
   Datos editables al inicio. Sin dependencias. Textos generados por JS en js/i18n.js. */
(function () {
  "use strict";

  // ─── DATOS ────────────────────────────────────────────────────────────
  const WHATSAPP = "593963607760";              // formato internacional sin espacios (wa.me)
  const FACEBOOK = "https://www.facebook.com/"; // TODO: URL de la página de Facebook de CODUV
  const NOXIS_URL = "";                          // TODO: URL pública del sitio de Noxis
  // ──────────────────────────────────────────────────────────────────────

  if (location.search.includes("shot")) document.documentElement.classList.add("shot");

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverable = window.matchMedia("(hover: hover)").matches;
  const I18N = () => window.CODUV_I18N;
  const T = (k, fb) => (I18N() ? I18N().t(k) : fb);
  const waLink = (t) => "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(t);
  const MSG_DEFAULT = () => (I18N() ? I18N().waDefault() : "Hola CODUV, quiero un diagnóstico sin costo para mi negocio.");

  // Enlaces de WhatsApp / Facebook / Noxis
  const applyWa = () => $$(".js-wa").forEach((a) => { a.href = waLink(MSG_DEFAULT()); a.target = "_blank"; a.rel = "noopener"; });
  applyWa();
  $$(".js-fb").forEach((a) => { a.href = FACEBOOK; });
  const applyNoxis = () => $$(".js-noxis").forEach((a) => {
    if (NOXIS_URL) { a.href = NOXIS_URL; a.target = "_blank"; a.rel = "noopener"; }
    else { a.textContent = T("recent", "Entrega reciente"); a.removeAttribute("href"); a.style.color = "var(--muted)"; }
  });
  applyNoxis();

  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // ─── Fuente del scroll (ventana o contenedor que se desplaza) ────────
  let _host = null, _hostAge = 0;
  const scrollHost = () => {
    if (_hostAge-- <= 0) {
      _hostAge = 30; _host = null;
      let p = document.body.firstElementChild ? document.body : null;
      let el = $("#hero") || document.body;
      let q = el.parentElement;
      while (q && q !== document.documentElement) {
        const st = getComputedStyle(q);
        if (/(auto|scroll|overlay)/.test(st.overflowY) && q.scrollHeight > q.clientHeight + 4) { _host = q; break; }
        q = q.parentElement;
      }
    }
    return _host;
  };
  const scrollPos = () => { const h = scrollHost(); return h ? h.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0); };
  const viewH = () => { const h = scrollHost(); return h ? h.clientHeight : window.innerHeight; };
  const onScroll2 = (fn) => { const h = scrollHost(); (h || window).addEventListener("scroll", fn, { passive: true }); if (h) window.addEventListener("scroll", fn, { passive: true }); };

  // ─── Nav ─────────────────────────────────────────────────────────────
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollPos() > 10);
  onScroll(); onScroll2(onScroll);

  const toggle = $(".nav__toggle"), menu = $("#menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", T(open ? "menuClose" : "menuOpen", open ? "Cerrar menú" : "Abrir menú"));
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", () => { menu.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }));
  }

  if ("IntersectionObserver" in window) {
    const links = $$(".nav__links a");
    const byId = Object.fromEntries(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (!e.isIntersecting) return; links.forEach((l) => l.classList.remove("is-active")); const l = byId[e.target.id]; if (l) l.classList.add("is-active"); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(byId).forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

    const rev = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); rev.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach((el) => rev.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  // Resplandor que sigue al cursor en las tarjetas
  if (!reduced && hoverable) {
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (ev) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100) + "%");
      });
    });
  }

  let sparks = [], burst = () => {}, flowNext = () => {};

  // ─── Red de nodos en el hero (canvas) ─────────────────────────────────
  const net = $("#net"), hero = $("#hero"), spot = $("#spot");
  if (net && hero && !reduced) {
    const ctx = net.getContext("2d");
    let W = 0, H = 0, pts = [], mouse = { x: -9999, y: -9999 }, raf = 0, visible = true;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    burst = (x, y, n = 42) => { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 6; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 1, c: Math.random() < 0.5 ? "92,255,106" : "255,138,43" }); } };
    const resize = () => {
      W = hero.clientWidth; H = hero.clientHeight;
      net.width = W * DPR; net.height = H * DPR; net.style.width = W + "px"; net.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.round(Math.min(140, (W * H) / 11000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() < 0.12 ? 2.2 : 1.3, o: Math.random() < 0.12 }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 160) { p.x += (p.x - mouse.x) / dm * 0.6; p.y += (p.y - mouse.y) / dm * 0.6; }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            const near = Math.min(Math.hypot(a.x - mouse.x, a.y - mouse.y), Math.hypot(b.x - mouse.x, b.y - mouse.y)) < 200;
            ctx.strokeStyle = near ? "rgba(255,138,43," + (0.5 * (1 - d / 120)) + ")" : "rgba(122,182,255," + (0.22 * (1 - d / 120)) + ")";
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 220) { ctx.strokeStyle = "rgba(255,138,43," + (0.35 * (1 - dm / 220)) + ")"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        ctx.fillStyle = a.o ? "#ff8a2b" : "rgba(122,182,255,0.9)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i]; sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.18; sp.vx *= 0.98; sp.life -= 0.022;
        if (sp.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = "rgba(" + sp.c + "," + sp.life + ")"; ctx.beginPath(); ctx.arc(sp.x, sp.y, 2.2 * sp.life + 0.6, 0, Math.PI * 2); ctx.fill();
      }
      if (visible) raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener("resize", resize);
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (spot) { spot.style.setProperty("--sx", mouse.x + "px"); spot.style.setProperty("--sy", mouse.y + "px"); }
    });
    hero.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { cancelAnimationFrame(raf); draw(); } }).observe(hero);
  }

  // ─── Palabra rotativa del titular ────────────────────────────────────
  if ($("#rotator")) {
    let i = 0;
    const swap = () => {
      const rot = $("#rotator"); if (!rot) return;
      const words = I18N() ? I18N().rotator() : ["vende"];
      const cur = rot.querySelector(".rotator__word");
      i = (i + 1) % words.length;
      const nx = document.createElement("span"); nx.className = "rotator__word"; nx.textContent = words[i];
      rot.appendChild(nx);
      setTimeout(() => { if (cur) { cur.classList.add("is-out"); cur.classList.remove("is-in"); } nx.classList.add("is-in"); }, 30);
      setTimeout(() => { if (cur) cur.remove(); }, 600);
    };
    if (!reduced) setInterval(swap, 2400);
  }

  // ─── Gecko: inclinación 3D con el cursor ─────────────────────────────
  const tilt = $("#tilt");
  if (tilt && hero && !reduced && hoverable) {
    hero.addEventListener("pointermove", (e) => {
      const r = tilt.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      tilt.style.transform = "perspective(900px) rotateY(" + (dx * 16) + "deg) rotateX(" + (-dy * 12) + "deg)";
    });
    hero.addEventListener("pointerleave", () => { tilt.style.transform = ""; });
  }

  // ─── Simulador de automatización ─────────────────────────────────────
  const flowSteps = $("#flowSteps"), flowTitle = $("#flowTitle"), flowSaved = $("#flowSaved"), flowClock = $("#flowClock");
  if (flowSteps) {
    let si = 0, saved = 0, seconds = 0, runId = 0, cancel = null;
    const check = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
    const wait = (ms) => new Promise((r) => { const t = setTimeout(r, ms); cancel = () => { clearTimeout(t); r(); }; });
    setInterval(() => { seconds++; if (flowClock) flowClock.textContent = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0"); }, 1000);
    const run = async () => {
      const my = ++runId;
      const list = I18N() ? I18N().flow() : []; if (!list.length) return;
      const sc = list[si % list.length]; si++;
      flowTitle.textContent = sc.title; flowSteps.innerHTML = "";
      const els = sc.steps.map(([t, src]) => {
        const li = document.createElement("li"); li.className = "flow__step";
        li.innerHTML = '<span class="flow__ic">●</span><span class="flow__t">' + t + '<small>' + src + '</small></span><span class="flow__ms"></span>';
        flowSteps.appendChild(li); return li;
      });
      for (const li of els) {
        li.classList.add("is-in", "is-active");
        const ms = 300 + Math.round(Math.random() * 900);
        await wait(reduced ? 200 : ms + 500);
        if (my !== runId) return;
        li.classList.remove("is-active"); li.classList.add("is-done");
        li.querySelector(".flow__ic").innerHTML = check; li.querySelector(".flow__ms").textContent = ms + " ms";
      }
      saved += sc.saved;
      flowSaved.textContent = I18N() ? I18N().savedFmt(saved) : saved + " min";
      await wait(2600);
      if (my !== runId) return;
      run();
    };
    flowNext = () => { if (cancel) cancel(); run(); };
    if (I18N()) run(); else document.addEventListener("DOMContentLoaded", run);
  }

  // ─── Cody, el gecko: parpadeo, salto, burbujas, giroscopio, vuelo ────
  const gecko = $("#gecko"), lid = $(".gecko__lid"), bubble = $("#bubble");
  if (gecko) {
    const blink = () => {
      if (lid && !reduced) { lid.classList.remove("is-blink"); void lid.offsetWidth; lid.classList.add("is-blink"); }
      setTimeout(blink, 2200 + Math.random() * 3800);
    };
    setTimeout(blink, 1500);

    let tipI = 0, bubbleT = 0;
    const say = (text, ms = 3800) => {
      if (!bubble || !text) return;
      bubble.textContent = text; bubble.classList.add("is-on");
      clearTimeout(bubbleT); bubbleT = setTimeout(() => bubble.classList.remove("is-on"), ms);
    };
    const loopTips = () => { const t = I18N() ? I18N().tips() : []; if (t.length) { say(t[tipI % t.length]); tipI++; } setTimeout(loopTips, 9000 + Math.random() * 4000); };
    setTimeout(loopTips, 2600);

    let jumpT = 0;
    gecko.addEventListener("click", () => {
      gecko.classList.remove("is-jumping"); void gecko.offsetWidth; gecko.classList.add("is-jumping", "is-happy");
      clearTimeout(jumpT); jumpT = setTimeout(() => gecko.classList.remove("is-happy"), 900);
      if (hero) { const r = hero.getBoundingClientRect(), g = gecko.getBoundingClientRect(); burst(g.left + g.width * 0.55 - r.left, g.top + g.height * 0.5 - r.top); }
      const c = I18N() ? I18N().cheers() : []; if (c.length) say(c[Math.floor(Math.random() * c.length)], 2600);
      flowNext();
      if (lid) { lid.classList.remove("is-blink"); void lid.offsetWidth; lid.classList.add("is-blink"); }
    });

  }

  // ─── Contadores animados ─────────────────────────────────────────────
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        const el = e.target, end = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
        const t0 = performance.now(), dur = reduced ? 0 : 1400;
        const tick = (t) => {
          const k = dur ? Math.min(1, (t - t0) / dur) : 1, v = Math.round(end * (1 - Math.pow(1 - k, 3)));
          el.innerHTML = pre + v + (suf ? "<span>" + suf + "</span>" : "");
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => io.observe(c));
  }

  // ─── Calculadora de horas perdidas ───────────────────────────────────
  const calc = $("#calculadora");
  if (calc) {
    const inp = { msgs: $("#cMsgs"), copy: $("#cCopy"), rep: $("#cRep"), rate: $("#cRate") };
    const rH = $("#rHours"), rM = $("#rMoney"), rD = $("#rDays"), cta = $("#calcCta");
    const fmt = (n) => n.toLocaleString(I18N() && I18N().lang === "en" ? "en-US" : "es-EC");
    const update = () => {
      Object.keys(inp).forEach((k) => {
        const el = inp[k], out = $("#o" + k.charAt(0).toUpperCase() + k.slice(1));
        if (out) out.textContent = el.value;
        el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min) * 100) + "%");
      });
      const hours = (inp.msgs.value * 1.5 + inp.copy.value * 3) / 60 * 26 + inp.rep.value * 4.33;
      const money = hours * inp.rate.value, days = hours * 12 / 8;
      rH.textContent = fmt(Math.round(hours)); rM.textContent = "$" + fmt(Math.round(money)); rD.textContent = fmt(Math.round(days));
      cta.href = waLink(I18N() ? I18N().calcMsg(Math.round(hours), Math.round(money)) : MSG_DEFAULT());
    };
    Object.values(inp).forEach((el) => el.addEventListener("input", update));
    update();
    window.addEventListener("coduv:lang", update);
  }

  // ─── Proceso: línea que se llena con el scroll ───────────────────────
  const steps = $("#steps"), fill = $("#stepsFill");
  if (steps && fill) {
    const cards = $$(".step", steps);
    const upd = () => {
      const r = steps.getBoundingClientRect(), vh = viewH();
      const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.2)));
      fill.style.width = (p * 100) + "%";
      cards.forEach((c, i) => c.classList.toggle("is-lit", p >= (i + 0.5) / cards.length));
    };
    upd(); onScroll2(upd); window.addEventListener("resize", upd);
  }

  // ─── Inclinación 3D en tarjetas de trabajos ──────────────────────────
  if (!reduced && hoverable) {
    $$(".work").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add("tilt-on");
        el.style.transform = "perspective(900px) rotateY(" + (dx * 8) + "deg) rotateX(" + (-dy * 8) + "deg) translateY(-5px)";
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; setTimeout(() => el.classList.remove("tilt-on"), 300); });
    });
  }

  // ─── Teléfono conversacional: asistente que califica y arma el WhatsApp ─
  const chat = $("#chat"), chatIn = $("#chatInput"), phone = $("#phone"), phState = $("#phState"), phTime = $("#phTime");
  if (chat && chatIn) {
    const now = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
    if (phTime) phTime.textContent = now();
    const I = () => I18N().chat();
    const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 60 : ms));
    const scroll = () => { chat.scrollTop = chat.scrollHeight; };
    let runId = 0;
    const bubbleIn = async (text, my) => {
      const t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>";
      chat.appendChild(t); scroll(); if (phState) phState.textContent = I().state.typing;
      await wait(500 + Math.min(1600, text.length * 18));
      t.remove(); if (my !== runId) return;
      if (phState) phState.textContent = I().state.online;
      const m = document.createElement("div"); m.className = "msg msg--in"; m.innerHTML = text.replace(/</g, "&lt;") + "<small>" + now() + "</small>";
      chat.appendChild(m); scroll();
    };
    const bubbleOut = (text) => {
      const m = document.createElement("div"); m.className = "msg msg--out";
      m.innerHTML = text.replace(/</g, "&lt;") + '<small>' + now() + ' <span class="ticks">✓✓</span></small>';
      chat.appendChild(m); scroll();
    };
    const prog = (n) => { const p = document.createElement("div"); p.className = "chatprog"; p.innerHTML = "<span>" + I().step.replace("{n}", n) + "</span><i style=\"--p:" + Math.round(n / 3 * 100) + "%\"></i>"; chatIn.appendChild(p); };
    const chips = (opts, n) => new Promise((res) => {
      chatIn.innerHTML = ""; prog(n); const w = document.createElement("div"); w.className = "chips";
      opts.forEach((o, i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = o; b.addEventListener("click", () => { chatIn.innerHTML = ""; res([i, o]); }); w.appendChild(b); });
      chatIn.appendChild(w);
    });
    const ask = (placeholder) => new Promise((res) => {
      chatIn.innerHTML = ""; prog(3); const row = document.createElement("form"); row.className = "chatrow";
      row.innerHTML = '<input type="text" id="chatText" maxlength="90" autocomplete="off"><button type="submit" aria-label="OK"><svg viewBox="0 0 24 24"><path d="M3 20.5 22 12 3 3.5V10l13 2-13 2z"/></svg></button>';
      row.querySelector("input").placeholder = placeholder;
      row.addEventListener("submit", (e) => { e.preventDefault(); const v = row.querySelector("input").value.trim(); if (!v) return; chatIn.innerHTML = ""; res(v); });
      chatIn.appendChild(row);
    });
    const run = async () => {
      const my = ++runId; const d = I(); chat.innerHTML = ""; chatIn.innerHTML = "";
      await wait(400); if (my !== runId) return; await bubbleIn(d.hi, my); if (my !== runId) return;
      await bubbleIn(d.q1, my); if (my !== runId) return;
      const [ni, need] = await chips(d.a1, 1); if (my !== runId) return; bubbleOut(need);
      await bubbleIn(d.q2, my); if (my !== runId) return;
      const [, how] = await chips(d.a2, 2); if (my !== runId) return; bubbleOut(how);
      await bubbleIn(d.q3, my); if (my !== runId) return;
      const biz = await ask(d.ph3); if (my !== runId) return; bubbleOut(biz);
      await bubbleIn(d.r[ni].replace("{biz}", biz || d.fallback3).replace("{how}", how.toLowerCase()), my); if (my !== runId) return;
      await bubbleIn(d.close, my); if (my !== runId) return;
      const msg = d.wa.replace("{need}", need.toLowerCase()).replace("{how}", how.toLowerCase()).replace("{biz}", biz);
      chatIn.innerHTML = '<a class="btn btn--wa" target="_blank" rel="noopener" href="' + waLink(msg) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.1.6 2.8.5a2.4 2.4 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.5-.3Z"/></svg>' + d.send + '</a><button type="button" class="restart">' + d.restart + '</button>';
      chatIn.querySelector(".restart").addEventListener("click", run);
    };
    let started = false;
    const start = () => { if (!started) { started = true; run(); } };
    if ("IntersectionObserver" in window && phone) new IntersectionObserver((en) => { if (en[0].isIntersecting) start(); }, { threshold: 0.35 }).observe(phone); else start();
    window.CODUV_CHAT_RESTART = () => { if (started) run(); };
    if (phone && !reduced && hoverable) {
      phone.addEventListener("pointermove", (e) => { const r = phone.getBoundingClientRect(); const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5; phone.style.transform = "perspective(1200px) rotateY(" + (dx * 10) + "deg) rotateX(" + (-dy * 6) + "deg)"; });
      phone.addEventListener("pointerleave", () => { phone.style.transform = ""; });
    }
  }

  // ─── Barra CTA fija en móvil (aparece tras el hero, se oculta en contacto) ─
  const mcta = $("#mcta");
  if (mcta && hero) {
    const upd = () => { const c = $("#contacto").getBoundingClientRect(); mcta.classList.toggle("is-on", scrollPos() > hero.offsetHeight * 0.8 && c.top > viewH() * 0.6); };
    upd(); onScroll2(upd);
  }

  // ─── Cambio de idioma: re-render de lo que genera JS ─────────────────
  window.addEventListener("coduv:lang", () => {
    applyWa(); applyNoxis();
    flowNext();
    if (window.CODUV_CHAT_RESTART) window.CODUV_CHAT_RESTART();
  });

  // FAQ: solo una abierta a la vez
  const faqs = $$(".faq details");
  faqs.forEach((d) => d.addEventListener("toggle", () => { if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; }); }));
})();
