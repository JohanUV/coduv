/* CODUV — i18n (ES por defecto en el HTML; EN aquí).
   Los textos del DOM llevan data-i18n="clave"; el español se toma del propio HTML.
   Los textos que genera JavaScript (rotador, simulador, chat, mensajes de WhatsApp)
   viven en los objetos `es` y `en` de abajo. */
(function () {
  "use strict";

  const WA = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.1.6 2.8.5a2.4 2.4 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.5-.3Z"/></svg>';
  const ARROW = '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  const es = {
    rotator: ["vende", "responde", "cotiza", "agenda", "cobra", "crece"],
    tips: [
      "¡Hola! Soy Cody. Tócame y te muestro otra automatización.",
      "Mueve el cursor: la red reacciona contigo.",
      "Prueba la calculadora: mide cuánto pierdes en trabajo repetitivo.",
      "Trabajamos 100 % remoto con cualquier ciudad o país.",
      "Tu diagnóstico no cuesta nada. En serio."
    ],
    cheers: ["¡Listo! Otro proceso automatizado.", "¡Eso! Menos trabajo de robot para ti.", "¡Vamos! Tu negocio ya trabaja solo.", "¡Ping! Pedido registrado sin tocar nada."],
    flowTitle: "Automatización en vivo",
    savedFmt: (m) => (m >= 60 ? Math.floor(m / 60) + " h " + (m % 60) + " min" : m + " min"),
    flow: [
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
    ],
    waDefault: "Hola CODUV, quiero un diagnóstico sin costo para mi negocio.",
    waReview: "Hola CODUV, quiero dejarles una reseña de mi experiencia.",
    calcMsg: (h, m) => "Hola CODUV, según la calculadora pierdo unas " + h + " horas al mes (unos $" + m + ") en trabajo repetitivo. Quiero un diagnóstico sin costo para recuperarlas.",
    recent: "Entrega reciente",
    menuOpen: "Abrir menú", menuClose: "Cerrar menú",
    chat: {
      state: { online: "en línea", typing: "escribiendo…" },
      step: "Paso {n} de 3",
      hi: "¡Hola! Soy Johan, de CODUV 👋 Te hago tres preguntas rápidas y te digo cómo lo haría.",
      q1: "¿Qué necesita tu negocio?",
      a1: ["Un sitio web", "Un sistema a medida", "Automatizar un proceso", "Un bot de WhatsApp", "No lo sé aún"],
      q2: "¿Cómo lo manejas hoy?",
      a2: ["WhatsApp y Excel", "En papel", "Otra web o sistema", "Todavía nada"],
      q3: "¿Cuál es tu negocio y en qué ciudad o país estás?",
      ph3: "Ej.: ferretería en Ambato",
      fallback3: "tu negocio",
      r: {
        0: "Para {biz}, lo primero es una página que convierta visitas en mensajes: rápida, en tu dominio y con WhatsApp a un toque. Suele estar lista en una a dos semanas.",
        1: "Para {biz}, un sistema a medida arranca por lo que más tiempo te quita (pedidos, inventario, clientes) y crece por fases. Primera versión utilizable en pocas semanas.",
        2: "Para {biz}, primero ordenamos el proceso y luego lo automatizamos: lo que hoy sale de {how} pasa a registrarse y responderse solo.",
        3: "Para {biz}, un bot que responda lo repetitivo, tome pedidos y avise a tu equipo, conectado a lo que ya usas ({how}).",
        4: "Perfecto, para eso está el diagnóstico: en 30 minutos vemos cómo trabaja {biz} hoy y te digo qué construiría primero y qué no."
      },
      close: "Te propongo un diagnóstico de 30 min sin costo. ¿Te lo mando por WhatsApp con este resumen?",
      send: "Enviar por WhatsApp", restart: "Empezar de nuevo",
      wa: "Hola CODUV, necesito {need}. Hoy lo manejo con {how}. Mi negocio: {biz}. Quiero el diagnóstico sin costo."
    }
  };

  const en = {
    rotator: ["sells", "replies", "quotes", "books", "collects", "grows"],
    tips: [
      "Hi! I'm Cody. Tap me and I'll show you another automation.",
      "Move your cursor: the network reacts to you.",
      "Try the calculator: see how much repetitive work costs you.",
      "We work 100% remotely with any city or country.",
      "Your diagnosis is free. Seriously."
    ],
    cheers: ["Done! Another process automated.", "Yes! Less robot work for you.", "Go! Your business now works on its own.", "Ping! Order logged without lifting a finger."],
    flowTitle: "Live automation",
    savedFmt: (m) => (m >= 60 ? Math.floor(m / 60) + " h " + (m % 60) + " min" : m + " min"),
    flow: [
      { title: "WhatsApp order", saved: 12, steps: [
        ["A message arrives: “I want 3 boxes, invoice to…”", "WhatsApp"],
        ["Product, quantity and billing details extracted", "Auto-read"],
        ["Order saved in your system, stock updated", "Database"],
        ["PDF quote sent to the customer", "WhatsApp"],
        ["Sales rep notified with the summary", "Notification"] ] },
      { title: "Customer appointment", saved: 8, steps: [
        ["Customer books from the website at 10:41 pm", "Website"],
        ["Calendar checked, first free slot proposed", "Calendar"],
        ["Appointment confirmed and saved", "Database"],
        ["Reminder scheduled 24 h before", "WhatsApp"],
        ["Tomorrow is already organized", "Report"] ] },
      { title: "End of day", saved: 45, steps: [
        ["Today's sales read from your system", "Database"],
        ["Matched against payments received", "Bank"],
        ["2 pending payments detected", "Analysis"],
        ["Payment reminder sent to each customer", "WhatsApp"],
        ["Daily report in your inbox at 8:00 pm", "Email"] ] }
    ],
    waDefault: "Hi CODUV, I'd like a free diagnosis for my business.",
    waReview: "Hi CODUV, I'd like to leave a review of my experience.",
    calcMsg: (h, m) => "Hi CODUV, according to the calculator I lose about " + h + " hours a month (around $" + m + ") on repetitive work. I'd like a free diagnosis to get them back.",
    recent: "Recent delivery",
    menuOpen: "Open menu", menuClose: "Close menu",
    chat: {
      state: { online: "online", typing: "typing…" },
      step: "Step {n} of 3",
      hi: "Hi! I'm Johan from CODUV 👋 Three quick questions and I'll tell you how I'd approach it.",
      q1: "What does your business need?",
      a1: ["A website", "A custom system", "Automate a process", "A WhatsApp bot", "Not sure yet"],
      q2: "How do you handle it today?",
      a2: ["WhatsApp and Excel", "On paper", "Another site or system", "Nothing yet"],
      q3: "What's your business and which city or country are you in?",
      ph3: "E.g.: hardware store in Miami",
      fallback3: "your business",
      r: {
        0: "For {biz}, the first step is a page that turns visits into messages: fast, on your own domain, WhatsApp one tap away. Usually ready in one to two weeks.",
        1: "For {biz}, a custom system starts with what eats most of your time (orders, inventory, customers) and grows in phases. First usable version in a few weeks.",
        2: "For {biz}, we first tidy up the process and then automate it: what today comes out of {how} gets logged and answered on its own.",
        3: "For {biz}, a bot that answers the repetitive stuff, takes orders and alerts your team, connected to what you already use ({how}).",
        4: "Perfect, that's what the diagnosis is for: in 30 minutes we look at how {biz} works today and I tell you what I'd build first, and what not."
      },
      close: "I suggest a free 30-minute diagnosis. Shall I send it over WhatsApp with this summary?",
      send: "Send on WhatsApp", restart: "Start over",
      wa: "Hi CODUV, I need {need}. Today I handle it with {how}. My business: {biz}. I'd like the free diagnosis."
    },
    dom: {
      "x.a1": "Skip to content",
      "top.a1": "Services", "top.a2": "Process", "top.a3": "Work", "top.a4": "Philosophy", "top.a5": "FAQ", "top.a6": "Contact", "top.a7": "Free diagnosis",
      "hero.p1": "Ecuador · For the whole world",
      "hero.h11": 'Your business<br> <span aria-live="polite" class="rotator" id="rotator"><span class="rotator__word is-in">sells</span></span><br> <span class="thin">while</span> you <span class="serif">rest.</span>',
      "hero.p2": "For businesses that sell on WhatsApp and want to stop losing hours: websites that turn visits into customers, systems built around how you work, and automations that reply, log and collect for you.",
      "hero.a1": WA + " Tell me about your case on WhatsApp",
      "hero.a2": "Calculate what I'm losing today",
      "hero.li1": "Free diagnosis, no commitment",
      "hero.li2": "Johan replies in person, within 24 h",
      "hero.li3": "No sales calls",
      "hero.li4": "100% remote, any city or country",
      "flow.span1": "Live automation",
      "flow.span3": "Time saved this session",
      "x.p1": "Sites in production for",
      "problema.p1": "The problem",
      "problema.h21": 'Stop doing <span class="accent">robot work.</span>',
      "problema.p2": "Move the sliders and see what repetitive work costs you every month.",
      "problema.small1": "client sites live, in production",
      "problema.small2": "systems built end to end",
      "problema.small3": "government data sources integrated into one system",
      "problema.small4": "own code, no templates or page builders",
      "calculadora.span1": "Calculator",
      "calculadora.h31": "What does robot work cost you?",
      "calculadora.label1": 'Repeated messages you answer per day <output id="oMsgs">40</output>',
      "calculadora.label2": 'Orders or data you copy by hand per day <output id="oCopy">15</output>',
      "calculadora.label3": 'Hours per week building reports or quotes <output id="oRep">3</output>',
      "calculadora.label4": 'What one hour of your work is worth (USD) <output id="oRate">10</output>',
      "calculadora.small1": "hours a month on repetitive work",
      "calculadora.small2": "a month that never come back",
      "calculadora.small3": "working days a year",
      "calculadora.p1": "Estimate based on 1.5 min per message, 3 min per manual entry and 26 working days. Your diagnosis uses your real numbers.",
      "calculadora.a1": "I want those hours back",
      "servicios.p1": "Services",
      "servicios.h21": 'What we <span class="blue">build</span> for your business',
      "servicios.p2": "Every service is quoted by outcome, not by the hour.",
      "servicios.h31": "Websites that sell",
      "servicios.p3": "Landing pages and company sites with one goal: turning a visit into a WhatsApp message.",
      "servicios.a1": "See delivered sites →",
      "servicios.h32": "Automation",
      "servicios.p4": "Flows that move information on their own: orders, replies, reminders and a report every morning.",
      "servicios.h33": "Custom systems",
      "servicios.p5": "From the Excel sheet to the system that runs your business: inventory, customers, quotes, scheduling, permissions.",
      "servicios.h34": "Data & API integration",
      "servicios.p6": "We connect your system to sources that resist: government portals with no API, suppliers, banks.",
      "servicios.h35": "Desktop apps & local AI",
      "servicios.p7": "Programs that run on your computer with no internet or accounts, with AI that never sends your data anywhere.",
      "servicios.h36": "Maintenance & support",
      "servicios.p8": "Domain, hosting, backups and changes after delivery. If something goes down, we bring it back.",
      "proceso.p1": "How we work",
      "proceso.h21": 'No surprises, <span class="serif">from start</span> to finish',
      "proceso.p2": "You know what gets built, what it costs and when you have it before the first line is written.",
      "steps.h31": "Diagnosis",
      "steps.p1": "You tell us how you work today and where time gets lost. It is not a sales call.",
      "steps.span1": "Free · 30 min",
      "steps.h32": "Fixed proposal",
      "steps.p2": "In writing: what gets built, how long it takes and at what fixed price.",
      "steps.span2": "Within 48 h",
      "steps.h33": "Visible build",
      "steps.p3": "From week one you follow the progress on a link. We adjust along the way.",
      "steps.span3": "Weeks, not months",
      "steps.h34": "Delivery & follow-up",
      "steps.p4": "We publish on your domain, hand over access and code, and stay by your side.",
      "steps.span4": "Support included",
      "trabajos.p1": "Live work",
      "trabajos.h21": 'Built for <span class="accent">real businesses</span>',
      "trabajos.p2": "Five Ecuadorian businesses get customers through sites built by CODUV. All live: open them and see.",
      "trabajos.span1": "In production", "trabajos.span2": "In production", "trabajos.span3": "In production", "trabajos.span4": "In production", "trabajos.span5": "In production",
      "trabajos.p3": "Tourist transport · Latacunga",
      "trabajos.p4": "Site on its own domain for a company with a 22-vehicle fleet. Routes across the Coast, Highlands, Amazon, Colombia and Peru, and a quote form that writes straight to its database.",
      "trabajos.a1": "cottullari.com " + ARROW,
      "trabajos.p5": "Academic training · Latacunga",
      "trabajos.p6": "Site for a tutoring and university-entrance prep center. Interactive mock exam on the home page, subjects, plans and diagnosis booking via WhatsApp.",
      "trabajos.a2": "View site " + ARROW, "trabajos.a3": "View site " + ARROW, "trabajos.a4": "View site " + ARROW, "trabajos.a5": "View site " + ARROW,
      "trabajos.p7": "Custom furniture · Latacunga",
      "trabajos.p8": "Catalog by category and a three-step quote builder that qualifies each request before passing it to the owner's WhatsApp. Twelve photos, five videos, before and after.",
      "trabajos.p9": "Kennel · Ecuador",
      "trabajos.p10": "Spanish, English and Portuguese site for a kennel with a Best of Breed champion. Litter waiting list and WhatsApp enquiries in the visitor's language.",
      "trabajos.p11": "CrossFit box · Latacunga",
      "trabajos.p12": "Single-page landing with nine sections, the gym's own photography and one goal: turning a visit into a trial class via WhatsApp.",
      "trabajos.p13": "Lab",
      "trabajos.h22": 'Our own systems that <span class="blue">prove what we can do</span>',
      "trabajos.p14": "Pre-hire verification: nine government sources in one report.",
      "trabajos.p15": "Automated n8n pipeline that collects, filters and scores job openings with AI.",
      "trabajos.h43": "Court Records Analysis",
      "trabajos.p16": "Reverse-engineered access to a government portal with no API, with analysis on top.",
      "filosofia.p1": "Philosophy",
      "filosofia.h21": 'What we <span class="accent">believe</span> and how we do it',
      "filosofia.p2": "CODUV was born in Latacunga with a simple idea: the technology a small business needs shouldn't cost like a corporation's, nor work worse.",
      "filosofia.h31": "Own code, no templates",
      "filosofia.p3": "No page builders or purchased themes. Every site and system is written from scratch for your business, which is why it's fast, light and yours.",
      "filosofia.h32": "Tidy up first, then automate",
      "filosofia.p4": "Chaos can't be automated. Before coding we understand the real process and simplify it. Then the machine repeats it without mistakes.",
      "filosofia.h33": "No smoke",
      "filosofia.p5": "If something can't be automated, we say so. If a simpler solution works for you, we recommend it even if it bills less.",
      "filosofia.h34": "Your data and your code are yours",
      "filosofia.p6": "We hand over access, domain, source code and backups. No lock-in, no dependency: leave whenever you want with everything.",
      "filosofia.h35": "One person accountable",
      "filosofia.p7": "You talk directly to the person who designs and codes. No middlemen, no broken telephone, no delays blamed on “the team”.",
      "filosofia.h36": "We speak your language",
      "filosofia.p8": "Zero technical jargon in meetings and clear prices in dollars. You understand what you're buying and why.",
      "porque.p1": "Why CODUV",
      "porque.h21": 'One developer. <span class="serif">No middlemen.</span>',
      "porque.h31": "<span>Weeks</span>, not months",
      "porque.p2": "A landing page ready in one to two weeks; a custom system in short phases with deliveries you can use from the first one.",
      "porque.h32": "<span>Fixed</span> price",
      "porque.p3": "The proposal sets scope, timeline and price. What's agreed is what you pay. If you change the scope, it's quoted separately, in writing.",
      "porque.h33": "On top of what <span>you already use</span>",
      "porque.p4": "No migrations, no switching tools: we connect WhatsApp, Excel, your website or your current system. Change the minimum, gain the maximum.",
      "porque.h34": "From <span>Ecuador</span>, for the world",
      "porque.p5": "We know the Ecuadorian government sources, the tax office and how local customers buy, and we work 100% remotely with clients in any city or country: video calls, online progress links and WhatsApp on your schedule.",
      "garantias.p1": "No risk for you",
      "garantias.h21": 'What we <span class="accent">guarantee</span> in writing',
      "garantias.p2": "Hiring someone new is scary. That's why we take on the risk, not you.",
      "garantias.h31": "Free diagnosis and proposal",
      "garantias.p3": "You leave the first conversation with a clear recommendation, even if you don't hire us.",
      "garantias.h32": "Fixed price, in writing",
      "garantias.p4": "What the proposal says is what you pay. If the scope doesn't change, neither does the price.",
      "garantias.h33": "Delivered as agreed",
      "garantias.p5": "We revise until what's delivered matches what was agreed, at no extra cost within the scope.",
      "garantias.h34": "Everything in your name from day one",
      "garantias.p6": "Domain, hosting, access and source code are yours. No lock-in: leave whenever you want with everything.",
      "quien.p1": "Who's behind it",
      "quien.p2": "Software engineering student at ESPE Latacunga and the developer behind every CODUV site and system. He likes the part where you have to figure out how something works before building on top of it: government portals with no API, paper-based business processes, court systems behind captchas.",
      "quien.a1": "Technical portfolio →",
      "faq.p1": "Frequently asked questions",
      "faq.h21": 'What <span class="blue">everyone asks</span> before starting',
      "faq.summary1": "How much does a website or a system cost?",
      "faq.div1": "It depends on the scope, which is why the first step is the free diagnosis. Then you get a fixed-price proposal in dollars before anything is built. A one-page landing costs far less than a system with a database and users; we tell you which one you really need.",
      "faq.summary2": "How long does it take?",
      "faq.div2": "A landing page or company site is usually ready in one to two weeks. A custom system is delivered in phases: a first usable version within a few weeks, then improvements. The timeline is written into the proposal.",
      "faq.summary3": "Do I need a domain and hosting?",
      "faq.div3": "No. We help you buy the domain in your name and set up hosting. For static sites we use services with no monthly cost; for systems with a database we explain the options and their real cost.",
      "faq.summary4": "What if I want to change something later?",
      "faq.div4": "Small content changes are covered by support. New features are quoted separately, in writing, without touching what was delivered. And since the code is yours, any developer could continue it.",
      "faq.summary5": "Can you automate my WhatsApp or my orders?",
      "faq.div5": "Yes, as long as the process is clear. First we tidy it up together, then we build the flow: automatic replies, orders logged in your sheet or system, reminders and reports. If something can't be automated well, we tell you before charging.",
      "faq.summary6": "Do you work with clients in other cities or countries?",
      "faq.div6": "Yes, the process is 100% remote: diagnosis by video call or WhatsApp, progress on an online link and delivery on your domain. We serve any city in Ecuador, Latin America or the world, with prices in US dollars. In Latacunga and Cotopaxi we can also meet in person.",
      "contacto.p1": "Contact",
      "contacto.h21": 'Let\'s talk on <span class="accent">WhatsApp</span>, not through a form',
      "contacto.p2": "Tell us your case and we reply within 24 hours with the next steps. To go faster, include three things:",
      "contacto.li1": "What you need: website, system, automation, or not sure yet",
      "contacto.li2": "How you do it today: WhatsApp, Excel, paper, another site",
      "contacto.li3": "Your business and city",
      "contacto.span1": 'Email: <a href="mailto:jaren22uv@gmail.com">jaren22uv@gmail.com</a>',
      "contacto.span2": "Latacunga, Ecuador · Remote for any country",
      "phone.small1": "online",
      "x.h21": 'Ready for your business to <span class="accent">work on its own?</span>',
      "x.p2": "A 30-minute diagnosis, free and with no commitment. You leave with a clear idea of what to build, what it costs and when you'd have it.",
      "x.p3": "We take on few projects at a time so each one gets direct attention. Write today and we reply today or tomorrow.",
      "x.a2": "Book a free diagnosis",
      "x.a3": "See services",
      "footer.p1": "Websites, custom systems and automation. Own code from Latacunga, Ecuador, for clients in any country.",
      "footer.h41": "Services",
      "footer.a1": "Websites", "footer.a2": "Custom systems", "footer.a3": "Automation", "footer.a4": "Data integration", "footer.a5": "Maintenance",
      "footer.h42": "Contact",
      "footer.span1": '© <span id="year"></span> CODUV · Latacunga, Ecuador',
      "footer.span2": "Built with our own code. No templates.",
      "mcta.b1": "Free diagnosis",
      "mcta.small1": "Reply within 24 h",
      "mcta.a1": "Write now",
      "x.span1": "Message us",
      "aria.nav__toggle": "Open menu",
      "aria.gecko": "Cody, CODUV's mascot. Tap him.",
      "aria.wa-float": "Write on WhatsApp",
      "ph.chatText": "E.g.: hardware store in Miami",
      "top.about": "About CODUV",
      "sobre.eyebrow": "About CODUV", "sobre.title": 'Who builds <span class="accent">your systems</span>',
      "sobre.lead": "How we work, what we believe, and what we have built on our own to prove what we can do.",
      "test.eyebrow": "Reviews", "test.title": 'What people who <span class="accent">already worked</span> with CODUV say',
      "test.emptyTitle": "We're collecting our first reviews.",
      "test.emptyBody": "In the meantime the proof is above: all five sites are live and you can open every one. If we've worked together, leave your review and we'll publish it here with your name and business.",
      "test.fb": "Review us on Facebook", "test.wa": "Send my review on WhatsApp",
      "viz.order": "Order", "viz.log": "Logged", "viz.toast": "+1 message",
      "viz.t1": "&gt; query: today's sales", "viz.t2": "local model · 0 data sent", "viz.t3": "✓ 37 sales · $1,240 · 2 pending",
      "viz.off": "No internet", "viz.cpu": "Local CPU", "viz.status": "Status", "viz.online": "Online",
      "viz.l1": "02:14 daily backup ✓", "viz.l2": "08:00 domain renewed ✓", "viz.l3": "11:32 text change published ✓",
      "meta.title": "CODUV | Websites, custom systems and automation from Ecuador",
      "meta.desc": "CODUV designs and builds websites, custom systems and automations for businesses in Ecuador and anywhere in the world, 100% remote. Own code, no templates, fixed price and direct WhatsApp support."
    }
  };

  const dicts = { es, en };
  const original = {};
  let lang = "es";

  const capture = () => {
    document.querySelectorAll("[data-i18n]").forEach((el) => { original[el.dataset.i18n] = el.innerHTML; });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { original[el.dataset.i18nPh] = el.placeholder; });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { original[el.dataset.i18nAria] = el.getAttribute("aria-label"); });
    original["meta.title"] = document.title;
    const md = document.querySelector('meta[name="description"]'); if (md) original["meta.desc"] = md.content;
  };

  const apply = (l) => {
    lang = dicts[l] ? l : "es";
    const d = lang === "es" ? original : Object.assign({}, original, en.dom);
    document.querySelectorAll("[data-i18n]").forEach((el) => { const v = d[el.dataset.i18n]; if (v != null && el.innerHTML !== v) el.innerHTML = v; });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { const v = d[el.dataset.i18nPh]; if (v != null) el.placeholder = v; });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { const v = d[el.dataset.i18nAria]; if (v != null) el.setAttribute("aria-label", v); });
    document.title = d["meta.title"] || document.title;
    const md = document.querySelector('meta[name="description"]'); if (md && d["meta.desc"]) md.content = d["meta.desc"];
    document.documentElement.lang = lang;
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    try { localStorage.setItem("coduv-lang", lang); } catch (e) {}
    const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
    window.dispatchEvent(new CustomEvent("coduv:lang", { detail: { lang } }));
  };

  window.CODUV_I18N = {
    get lang() { return lang; },
    t: (k) => dicts[lang][k],
    rotator: () => dicts[lang].rotator,
    tips: () => dicts[lang].tips,
    cheers: () => dicts[lang].cheers,
    flow: () => dicts[lang].flow,
    flowTitle: () => dicts[lang].flowTitle,
    savedFmt: (m) => dicts[lang].savedFmt(m),
    chat: () => dicts[lang].chat,
    waDefault: () => dicts[lang].waDefault,
    calcMsg: (h, m) => dicts[lang].calcMsg(h, m),
    set: apply
  };

  document.addEventListener("DOMContentLoaded", () => {
    capture();
    let saved = null; try { saved = localStorage.getItem("coduv-lang"); } catch (e) {}
    const q = new URLSearchParams(location.search).get("lang");
    const nav = (navigator.language || "es").slice(0, 2).toLowerCase();
    const initial = q || saved || (nav === "en" ? "en" : "es");
    if (initial !== "es") apply(initial); else apply("es");
    document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => apply(b.dataset.lang)));
  });
})();
