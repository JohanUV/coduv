/* CODUV — main.js
   Datos editables al inicio. Sin dependencias. */
(function () {
  "use strict";

  // ─── DATOS ────────────────────────────────────────────────────────────
  const WHATSAPP = "593963607760";              // formato internacional sin espacios (wa.me)
  const FACEBOOK = "https://www.facebook.com/"; // TODO: URL de la página de Facebook de CODUV
  const NOXIS_URL = "";                          // TODO: URL pública del sitio de Noxis
  const MSG_DEFAULT = "Hola CODUV, quiero un diagnóstico sin costo para mi negocio.";
  // ──────────────────────────────────────────────────────────────────────

  if (location.search.includes("shot")) document.documentElement.classList.add("shot");

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const waLink = (t) => "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(t);

  // Enlaces de WhatsApp (todos los .js-wa)
  $$(".js-wa").forEach((a) => {
    a.href = waLink(a.dataset.msg || MSG_DEFAULT);
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$(".js-fb").forEach((a) => { a.href = FACEBOOK; });
  $$(".js-noxis").forEach((a) => {
    if (NOXIS_URL) { a.href = NOXIS_URL; a.target = "_blank"; a.rel = "noopener"; }
    else { a.textContent = "Entrega reciente"; a.removeAttribute("href"); a.style.color = "var(--muted)"; }
  });

  // Año del footer
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // Nav: fondo al hacer scroll + menú móvil + sección activa
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $(".nav__toggle"), menu = $("#menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", () => {
      menu.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false");
    }));
  }

  if ("IntersectionObserver" in window) {
    const links = $$(".nav__links a");
    const byId = Object.fromEntries(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.remove("is-active"));
        const l = byId[e.target.id]; if (l) l.classList.add("is-active");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(byId).forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

    // Aparición de elementos
    const rev = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); rev.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach((el) => rev.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  // Resplandor que sigue al cursor en las tarjetas
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (ev) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100) + "%");
      });
    });
  }

  // Teléfono simulado → mensaje de WhatsApp
  const form = $("#waForm"), preview = $("#chatPreview");
  if (form) {
    const compose = () => {
      const need = form.need.value;
      const biz = form.biz.value.trim();
      const how = form.how.value.trim();
      let t = "Hola CODUV, necesito " + need;
      if (biz) t += " para " + biz;
      t += ".";
      if (how) t += " Hoy lo manejo así: " + how + ".";
      t += " ¿Podemos hacer el diagnóstico sin costo?";
      return t;
    };
    const paint = () => { if (preview) preview.innerHTML = compose().replace(/</g, "&lt;") + " <small>tú</small>"; };
    form.addEventListener("input", paint); paint();
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      window.open(waLink(compose()), "_blank", "noopener");
    });
  }

  // ─── Red de nodos en el hero (canvas) ─────────────────────────────────
  const net = $("#net"), hero = $("#hero"), spot = $("#spot");
  if (net && hero && !reduced) {
    const ctx = net.getContext("2d");
    let W = 0, H = 0, pts = [], mouse = { x: -9999, y: -9999 }, raf = 0, visible = true;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      W = hero.clientWidth; H = hero.clientHeight;
      net.width = W * DPR; net.height = H * DPR; net.style.width = W + "px"; net.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.round(Math.min(140, (W * H) / 11000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() < 0.12 ? 2.2 : 1.3, o: Math.random() < 0.12
      }));
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
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { cancelAnimationFrame(raf); draw(); } }).observe(hero);
    }
  }

  // ─── Palabra rotativa del titular ────────────────────────────────────
  const rot = $("#rotator");
  if (rot) {
    const words = ["vende", "responde", "cotiza", "agenda", "cobra", "crece"];
    let i = 0;
    const swap = () => {
      const cur = rot.querySelector(".rotator__word");
      i = (i + 1) % words.length;
      const nx = document.createElement("span");
      nx.className = "rotator__word"; nx.textContent = words[i];
      rot.appendChild(nx);
      requestAnimationFrame(() => { cur.classList.add("is-out"); cur.classList.remove("is-in"); nx.classList.add("is-in"); });
      setTimeout(() => cur.remove(), 600);
    };
    if (!reduced) setInterval(swap, 2400);
  }

  // ─── Gecko con inclinación 3D ────────────────────────────────────────
  const tilt = $("#tilt");
  if (tilt && hero && !reduced && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const r = tilt.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      tilt.style.transform = "perspective(900px) rotateY(" + (dx * 16) + "deg) rotateX(" + (-dy * 12) + "deg)";
    });
    hero.addEventListener("pointerleave", () => { tilt.style.transform = ""; });
  }

  // ─── Simulador de automatización ─────────────────────────────────────
  const flowSteps = $("#flowSteps"), flowTitle = $("#flowTitle"), flowSaved = $("#flowSaved"), flowClock = $("#flowClock");
  if (flowSteps) {
    const scenarios = [
      { title: "Pedido por WhatsApp", saved: 12, steps: [
        ["Llega un mensaje: «Quiero 3 cajas, factura a nombre de…»", "WhatsApp"],
        ["Se extraen producto, cantidad y datos de facturación", "Lectura automática"],
        ["Pedido registrado en tu sistema y stock actualizado", "Base de datos"],
        ["Cotización en PDF enviada al cliente", "WhatsApp"],
        ["Aviso al vendedor con el resumen", "Notificación"] ] },
      { title: "Cita de un cliente", saved: 8, steps: [
        ["Cliente pide cita desde la web a las 22:41", "Sitio web"],
        ["Se revisa la agenda y se propone el primer hueco libre", "Calendario"],
        ["Cita confirmada y guardada", "Base de datos"],
        ["Recordatorio programado 24 h antes", "WhatsApp"],
        ["Tu día de mañana ya está ordenado", "Reporte"] ] },
      { title: "Cierre del día", saved: 45, steps: [
        ["Se leen las ventas del día en tu sistema", "Base de datos"],
        ["Se cruzan con pagos recibidos", "Banco"],
        ["Se detectan 2 cobros pendientes", "Análisis"],
        ["Recordatorio de pago enviado a cada cliente", "WhatsApp"],
        ["Reporte del día en tu correo a las 20:00", "Correo"] ] }
    ];
    let si = 0, saved = 0, seconds = 0;
    const check = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    setInterval(() => { seconds++; if (flowClock) flowClock.textContent = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0"); }, 1000);
    const run = async () => {
      const sc = scenarios[si % scenarios.length]; si++;
      flowTitle.textContent = sc.title;
      flowSteps.innerHTML = "";
      const els = sc.steps.map(([t, src]) => {
        const li = document.createElement("li"); li.className = "flow__step";
        li.innerHTML = '<span class="flow__ic">●</span><span class="flow__t">' + t + '<small>' + src + '</small></span><span class="flow__ms"></span>';
        flowSteps.appendChild(li); return li;
      });
      for (const li of els) {
        li.classList.add("is-in", "is-active");
        const ms = 300 + Math.round(Math.random() * 900);
        await wait(reduced ? 200 : ms + 500);
        li.classList.remove("is-active"); li.classList.add("is-done");
        li.querySelector(".flow__ic").innerHTML = check;
        li.querySelector(".flow__ms").textContent = ms + " ms";
      }
      saved += sc.saved;
      flowSaved.textContent = saved >= 60 ? Math.floor(saved / 60) + " h " + (saved % 60) + " min" : saved + " min";
      await wait(2600);
      run();
    };
    run();
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
    const out = { msgs: $("#oMsgs"), copy: $("#oCopy"), rep: $("#oRep"), rate: $("#oRate") };
    const rH = $("#rHours"), rM = $("#rMoney"), rD = $("#rDays"), cta = $("#calcCta");
    const fmt = (n) => n.toLocaleString("es-EC");
    const update = () => {
      Object.keys(inp).forEach((k) => {
        const el = inp[k]; out[k].textContent = el.value;
        el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min) * 100) + "%");
      });
      const hours = (inp.msgs.value * 1.5 + inp.copy.value * 3) / 60 * 26 + inp.rep.value * 4.33;
      const money = hours * inp.rate.value;
      const days = hours * 12 / 8;
      rH.textContent = fmt(Math.round(hours));
      rM.textContent = "$" + fmt(Math.round(money));
      rD.textContent = fmt(Math.round(days));
      cta.href = waLink("Hola CODUV, según la calculadora pierdo unas " + Math.round(hours) + " horas al mes (unos $" + Math.round(money) + ") en trabajo repetitivo. Quiero un diagnóstico sin costo para recuperarlas.");
    };
    Object.values(inp).forEach((el) => el.addEventListener("input", update));
    update();
  }

  // ─── Proceso: línea que se llena con el scroll ───────────────────────
  const steps = $("#steps"), fill = $("#stepsFill");
  if (steps && fill) {
    const cards = $$(".step", steps);
    const upd = () => {
      const r = steps.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.2)));
      fill.style.width = (p * 100) + "%";
      cards.forEach((c, i) => c.classList.toggle("is-lit", p >= (i + 0.5) / cards.length));
    };
    upd(); window.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd);
  }

  // ─── Inclinación 3D en tarjetas de trabajos ──────────────────────────
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
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

  // FAQ: solo una abierta a la vez
  const faqs = $$(".faq details");
  faqs.forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
