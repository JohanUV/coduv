// coduv.dev · v2
(() => {
  const WHATSAPP = "593963607760"; // formato internacional sin espacios (wa.me)
  // Medición: pega aquí los IDs cuando los tengas. Vacíos = no se carga nada.
  const META_PIXEL_ID = ""; // Administrador de eventos de Meta, ej. "123456789012345"
  const GA_ID = "";         // Google Analytics 4, ej. "G-XXXXXXXXXX"
  const MSG = "Hola coduv.dev, quiero cotizar una web para mi negocio.";
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Enlaces de WhatsApp
  $$(".js-wa").forEach((a) => {
    a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(a.dataset.msg || MSG);
    a.target = "_blank";
    a.rel = "noopener";
  });

  if (META_PIXEL_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", META_PIXEL_ID); fbq("track", "PageView");
  }
  if (GA_ID) {
    const g = document.createElement("script"); g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID; document.head.appendChild(g);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date()); gtag("config", GA_ID);
  }
  // Cada clic que abre WhatsApp cuenta como contacto (Lead)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="https://wa.me/"]');
    if (!a) return;
    const where = a.classList.contains("js-try-wa") ? "vista_previa" : (a.closest(".bar,.fab") ? "boton_fijo" : "boton");
    if (window.fbq) fbq("track", "Lead", { content_name: where });
    if (window.gtag) gtag("event", "generate_lead", { method: "whatsapp", lugar: where });
  });

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Borde del menú al hacer scroll
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menú móvil
  const burger = document.querySelector(".nav__burger");
  const menu = document.getElementById("menu");
  const setMenu = (open) => { burger.setAttribute("aria-expanded", open); menu.hidden = !open; };
  burger.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Carrusel del hero: escritorio y celular cambian juntos
  const stage = document.querySelector("[data-carousel]");
  if (stage && !reduced) {
    const desk = $$(".stage__desk img", stage);
    const mob = $$(".stage__mob img", stage);
    const url = stage.querySelector("[data-url]");
    let i = 0;
    const load = (n) => [desk[n], mob[n]].forEach((img) => { if (img && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; } });
    load(1);
    const show = (n) => {
      load(n); load((n + 1) % desk.length);
      [desk, mob].forEach((set) => set.forEach((img, k) => img.classList.toggle("is-on", k === n)));
      url.textContent = desk[n].dataset.site;
    };
    const tick = () => { if (stage.classList.contains("is-demo")) return; i = (i + 1) % desk.length; show(i); };
    let timer = setInterval(tick, 3200);
    document.addEventListener("visibilitychange", () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(tick, 3200);
    });
  }

  // Recorrido de la página completa al pasar el cursor: altura visible en px
  const setVh = () => $$(".browser__view.scroll").forEach((v) => v.style.setProperty("--vh", v.clientHeight + "px"));
  setVh();
  addEventListener("resize", setVh);

  // En pantallas táctiles, recorre la web sola cuando entra en pantalla
  if (!matchMedia("(hover: hover)").matches && !reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-auto", e.isIntersecting)), { threshold: .6 });
    $$(".work__shot").forEach((s) => io.observe(s));
  }

  // Prueba tu web: vista previa con el nombre del visitante
  const RUBROS = {
    restaurante: { bg: "#1a0f0a", fg: "#fbefe3", acc: "#ff8a3d", art: "#3a1f12", k: "Comida casera", h: "Pide tu almuerzo sin hacer fila", p: "Mira el menú del día, elige y recibe tu pedido por WhatsApp.", cta: "Ver el menú", tag: "Menú de hoy", items: ["Menú del día", "A domicilio", "Reservas"] },
    tienda: { bg: "#f6f3ee", fg: "#1b1b1b", acc: "#1f6feb", art: "#e3ddd2", k: "Tienda en línea", h: "Todo el catálogo en tu celular", p: "Elige productos, arma tu pedido y confirma por WhatsApp.", cta: "Ver catálogo", tag: "Nuevos ingresos", items: ["Catálogo", "Envíos a todo el país", "Pago contra entrega"] },
    belleza: { bg: "#1b1216", fg: "#fbe9ef", acc: "#f472b6", art: "#3a2230", k: "Salón y estética", h: "Reserva tu cita en un minuto", p: "Elige el servicio y la hora, y te confirmamos por WhatsApp.", cta: "Reservar cita", tag: "Citas hoy", items: ["Cortes y color", "Uñas", "Tratamientos"] },
    taller: { bg: "#111418", fg: "#eef1f4", acc: "#fbbf24", art: "#262c33", k: "Taller mecánico", h: "Tu carro en buenas manos", p: "Cotiza el arreglo, agenda el turno y sigue el avance por WhatsApp.", cta: "Cotizar arreglo", tag: "Turnos libres", items: ["Mantenimiento", "Frenos y suspensión", "Diagnóstico"] },
    salud: { bg: "#f2f7f7", fg: "#0f2a2e", acc: "#0d9488", art: "#d6e8e8", k: "Consultorio", h: "Agenda tu consulta sin llamar", p: "Elige especialidad y horario. Te confirmamos por WhatsApp.", cta: "Agendar consulta", tag: "Horarios", items: ["Medicina general", "Odontología", "Exámenes"] },
    gimnasio: { bg: "#0c0c0c", fg: "#f5f5f5", acc: "#facc15", art: "#222", k: "Entrenamiento", h: "Tu primera clase va por nuestra cuenta", p: "Conoce los planes y reserva tu clase de prueba por WhatsApp.", cta: "Clase de prueba", tag: "Clases hoy", items: ["Planes", "Horarios", "Entrenadores"] },
    transporte: { bg: "#0d1b2a", fg: "#e9f1fa", acc: "#38bdf8", art: "#1b2f45", k: "Transporte turístico", h: "Viaja seguro a cualquier destino", p: "Cotiza tu viaje con la ruta y el número de pasajeros.", cta: "Cotizar viaje", tag: "Flota propia", items: ["Excursiones", "Empresas", "Aeropuerto"] },
    otro: { bg: "#101114", fg: "#f1f2f4", acc: "#c8f560", art: "#22252b", k: "Tu negocio en internet", h: "Clientes nuevos todos los días", p: "Muestra lo que haces y recibe pedidos directo en tu WhatsApp.", cta: "Escríbenos", tag: "Abierto hoy", items: ["Servicios", "Precios", "Ubicación"] },
  };
  const tryForm = document.getElementById("try");
  if (tryForm && stage) {
    const nameIn = document.getElementById("try-name");
    const kindIn = document.getElementById("try-kind");
    const go = tryForm.querySelector(".js-try-wa");
    const logoIn = document.getElementById("try-logo");
    let logoUrl = "";
    logoIn.addEventListener("change", () => {
      const f = logoIn.files && logoIn.files[0];
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      logoUrl = f && f.type.startsWith("image/") ? URL.createObjectURL(f) : "";
      if (logoUrl && !nameIn.value.trim()) nameIn.value = "Mi negocio";
      render();
    });
    const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const render = () => {
      const name = nameIn.value.trim();
      const r = RUBROS[kindIn.value];
      const on = name.length > 0;
      stage.classList.toggle("is-demo", on);
      go.hidden = !on;
      if (!on) { const cur = stage.querySelector(".stage__desk img.is-on"); if (cur) stage.querySelector("[data-url]").textContent = cur.dataset.site; return; }
      const n = esc(name);
      const logo = logoUrl ? `<img src="${logoUrl}" alt="">` : "";
      const html = `<div class="demo__nav"><span class="demo__brand">${logo}${n}</span><span class="demo__links"><span>Inicio</span><span>Servicios</span><span>Contacto</span></span></div>
        <div class="demo__hero"><div><div class="demo__k">${r.k}</div><div class="demo__h">${r.h}</div><div class="demo__p">${r.p}</div><span class="demo__cta">${r.cta}</span></div>
        <div class="demo__art">${logoUrl ? logo : "<span></span><span></span>"}<b>${r.tag}</b></div></div>
        <div class="demo__items">${r.items.map((i) => `<div>${i}</div>`).join("")}</div><span class="demo__wa"></span>`;
      stage.querySelectorAll("[data-demo]").forEach((d) => {
        d.innerHTML = html;
        ["bg", "fg", "acc", "art"].forEach((k) => d.style.setProperty("--d-" + k, r[k]));
      });
      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "") || "tunegocio";
      stage.querySelector("[data-url]").textContent = slug + ".com";
      go.querySelector("[data-try-name]").textContent = name;
      const msg = `Hola coduv.dev, tengo un negocio de ${kindIn.options[kindIn.selectedIndex].text.toLowerCase()} llamado "${name}" y quiero una web como la que vi en su página.`;
      go.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
      go.target = "_blank"; go.rel = "noopener";
    };
    nameIn.addEventListener("input", render);
    kindIn.addEventListener("change", render);
    tryForm.addEventListener("submit", (e) => { e.preventDefault(); if (!go.hidden) go.click(); });
  }

})();
