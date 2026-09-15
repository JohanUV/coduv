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

  // FAQ: solo una abierta a la vez
  const faqs = $$(".faq details");
  faqs.forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
