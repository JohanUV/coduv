// coduv.dev · v2
(() => {
  const WHATSAPP = "593963607760"; // formato internacional sin espacios (wa.me)
  const MSG = "Hola coduv.dev, quiero cotizar una web para mi negocio.";
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Enlaces de WhatsApp
  $$(".js-wa").forEach((a) => {
    a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(a.dataset.msg || MSG);
    a.target = "_blank";
    a.rel = "noopener";
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
    const show = (n) => {
      [desk, mob].forEach((set) => set.forEach((img, k) => img.classList.toggle("is-on", k === n)));
      url.textContent = desk[n].dataset.site;
    };
    let timer = setInterval(() => { i = (i + 1) % desk.length; show(i); }, 3200);
    document.addEventListener("visibilitychange", () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(() => { i = (i + 1) % desk.length; show(i); }, 3200);
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

  // Aparición al hacer scroll
  if (reduced || !("IntersectionObserver" in window)) {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  }
})();
