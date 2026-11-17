"""Genera las páginas por rubro (gimnasios.html, academias.html, ...).

Uso: python3 scripts/nichos.py  (desde la carpeta del sitio)
Cada página usa css/v2.css y js/v2.js, y muestra el caso real del rubro.
"""
import html

V = "4"  # mismo número de versión que index.html
WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>'

NICHOS = [
    dict(
        slug="gimnasios", rubro="gimnasio",
        title="Páginas web para gimnasios y boxes",
        h1="Tu gimnasio lleno de clases de prueba",
        lead="Una web que muestra tu espacio, tus planes y tus horarios, y convierte cada visita en una clase de prueba reservada por WhatsApp.",
        dolores=[
            ("Preguntan lo mismo todo el día", "Precio, horarios, si hay clase de prueba. Respondes uno por uno desde tu celular."),
            ("Instagram no alcanza", "Las fotos se pierden entre publicaciones y nadie encuentra tus planes cuando los necesita."),
            ("No sabes de dónde vienen", "Sin una página propia no hay forma de medir cuántas personas te escriben por internet."),
        ],
        incluye=["Planes y precios claros", "Horario de clases por día", "Galería con fotos de tu box", "Botón de clase de prueba a WhatsApp", "Ubicación en el mapa", "Rápida en el celular"],
        caso=dict(nombre="Mashka Box", lugar="Box de CrossFit en Latacunga", url="https://johanuv.github.io/mashka-box/", host="mashka-box", img="mashka",
                  texto="Landing de una sola página con fotografía del gimnasio, planes, horarios y un único objetivo: que la visita reserve su clase de prueba."),
    ),
    dict(
        slug="academias", rubro="academia",
        title="Páginas web para academias y centros de clases",
        h1="Más alumnos para tu academia",
        lead="Una web que explica tus cursos, muestra resultados y agenda el diagnóstico o la primera clase por WhatsApp.",
        dolores=[
            ("Los padres quieren ver antes de pagar", "Sin una página seria, tu academia compite solo por precio."),
            ("La información está regada", "Materias, horarios y planes viven en estados de WhatsApp y publicaciones viejas."),
            ("Agendar te quita tiempo", "Cada diagnóstico se coordina a mano, mensaje por mensaje."),
        ],
        incluye=["Materias y planes", "Simulador o prueba interactiva", "Docentes y resultados", "Agenda de diagnóstico a WhatsApp", "Preguntas frecuentes", "Rápida en el celular"],
        caso=dict(nombre="Noxis", lugar="Centro de clases en Latacunga", url="https://noxisec.netlify.app/", host="noxisec.netlify.app", img="noxis",
                  texto="Sitio para un centro de clases y preparación de ingreso, con un simulacro de examen interactivo en la portada y agenda de diagnóstico por WhatsApp."),
    ),
    dict(
        slug="muebles", rubro="mueblería",
        title="Páginas web para mueblerías y muebles a medida",
        h1="Cotizaciones de muebles que llegan ordenadas",
        lead="Una web con tu catálogo por categoría y un cotizador que le pregunta al cliente lo necesario antes de pasarte el pedido por WhatsApp.",
        dolores=[
            ("Cotizar te toma horas", "Medidas, material, color: cada cliente manda la información a medias y en varios mensajes."),
            ("Tus trabajos no se lucen", "Las mejores fotos de tus muebles están perdidas en tu galería del celular."),
            ("Muchos curiosos, pocos clientes", "Respondes a todos igual, aunque no todos estén listos para comprar."),
        ],
        incluye=["Catálogo por categoría", "Cotizador de pocos pasos", "Fotos y videos de trabajos", "Antes y después", "Pedido ordenado a tu WhatsApp", "Rápida en el celular"],
        caso=dict(nombre="ModuForm", lugar="Muebles a medida en Latacunga", url="https://moduform.vercel.app/", host="moduform.vercel.app", img="moduform",
                  texto="Catálogo por categoría y cotizador de tres pasos que califica cada pedido antes de pasarlo al WhatsApp del dueño."),
    ),
    dict(
        slug="transporte", rubro="empresa de transporte",
        title="Páginas web para empresas de transporte y turismo",
        h1="Viajes cotizados sin perseguir a nadie",
        lead="Una web con tu flota, tus rutas y un formulario de cotización que te llega con destino, fecha y número de pasajeros.",
        dolores=[
            ("Las empresas buscan en Google", "Si no tienes página, contratan al que sí aparece aunque tu servicio sea mejor."),
            ("Cada cotización es un ida y vuelta", "Fecha, destino, pasajeros: lo preguntas siempre, en cada conversación."),
            ("Tu flota no se ve", "Tienes buenas unidades, pero el cliente no las conoce antes de llamar."),
        ],
        incluye=["Flota con fotos", "Rutas y destinos", "Formulario de cotización", "Dominio propio (.com)", "Botón a WhatsApp", "Rápida en el celular"],
        caso=dict(nombre="Cottullari", lugar="Transporte turístico en Latacunga", url="https://cottullari.com/", host="cottullari.com", img="cottullari",
                  texto="Web en dominio propio para una empresa con flota de 22 unidades: rutas por Costa, Sierra, Amazonía, Colombia y Perú, y un cotizador que escribe directo a su base de datos."),
    ),
]

TPL = """<!DOCTYPE html>
<html lang="es" class="no-js">
<script>document.documentElement.className="js"</script>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · coduv.dev</title>
<meta name="description" content="{lead}">
<meta name="theme-color" content="#09090b">
<meta property="og:title" content="{title} · coduv.dev">
<meta property="og:description" content="{lead}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://coduv.vercel.app/img/v2/og.jpg">
<meta property="og:locale" content="es_EC">
<link rel="canonical" href="https://coduv.vercel.app/{slug}">
<link rel="icon" href="img/v2/favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="preload" as="font" href="fonts/archivo-100-900-normal-latin.woff2" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/fonts.css?v={v}">
<link rel="stylesheet" href="css/v2.css?v={v}">
</head>
<body>
<a class="skip" href="#main">Ir al contenido</a>
<header class="nav" id="nav">
  <div class="wrap nav__in">
    <a class="brand" href="./" aria-label="coduv.dev, inicio"><img src="img/v2/favicon.svg" alt="" width="28" height="28"><span class="brand__name">coduv<b>.dev</b></span></a>
    <nav class="nav__links" aria-label="Principal"><a href="./#trabajos">Trabajos</a><a href="./#servicios">Precios</a><a href="./#preguntas">Preguntas</a></nav>
    <a class="btn btn--sm btn--acc js-wa" href="#contacto" data-msg="{msg}">Cotizar</a>
    <button class="nav__burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
  </div>
  <div class="menu" id="menu" hidden><a href="./#trabajos">Trabajos</a><a href="./#servicios">Precios</a><a href="./#preguntas">Preguntas</a><a class="btn btn--acc js-wa" href="#contacto" data-msg="{msg}">Cotizar por WhatsApp</a></div>
</header>
<main id="main">
<section class="hero hero--niche">
  <div class="hero__glow" aria-hidden="true"></div>
  <div class="wrap hero__in">
    <div class="hero__copy">
      <p class="eyebrow"><span class="dot"></span>{title}</p>
      <h1>{h1}</h1>
      <p class="lead">{lead}</p>
      <div class="cta-row">
        <a class="btn btn--acc js-wa" href="#contacto" data-msg="{msg}">{wa}Quiero mi web</a>
        <a class="btn btn--ghost" href="#caso">Ver el caso real</a>
      </div>
      <p class="niche__price">Landing desde <strong>$100</strong> · web con catálogo desde <strong>$250</strong></p>
    </div>
    <div class="stage">
      <div class="browser stage__desk"><div class="browser__bar"><i></i><i></i><i></i><span class="browser__url">{host}</span></div>
        <div class="browser__view"><img class="is-on" src="img/v2/{img}.webp" alt="Portada de {nombre}" width="1600" height="1000" fetchpriority="high"></div></div>
      <div class="phone stage__mob"><div class="phone__view"><img class="is-on" src="img/v2/{img}-mob.webp" alt="" width="640" height="1385"></div></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec__head"><h2>Lo que hoy te hace perder clientes</h2></div>
    <div class="cards cards--3">{dolores}</div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap niche__inc">
    <div><h2>Qué lleva tu web</h2><p class="sec__sub">Hecha para tu {rubro}, no una plantilla genérica. Te la entrego publicada y lista para compartir.</p></div>
    <ul class="ticks ticks--big">{incluye}</ul>
  </div>
</section>

<section class="sec" id="caso">
  <div class="wrap">
    <div class="sec__head"><h2>Un caso real: {nombre}</h2><p class="sec__sub">{lugar}. Está publicada: entra y compruébalo.</p></div>
    <article class="work work--wide">
      <a class="work__shot" href="{url}" target="_blank" rel="noopener" aria-label="Abrir {host}">
        <div class="browser"><div class="browser__bar"><i></i><i></i><i></i><span class="browser__url">{host}</span></div>
        <div class="browser__view scroll"><img src="img/v2/{img}-full.webp" alt="Página completa de {nombre}" loading="lazy" width="900"></div></div>
      </a>
      <div class="work__meta"><h3>{nombre}</h3><p>{texto}</p><a class="link" href="{url}" target="_blank" rel="noopener">Abrir la web de {nombre}</a></div>
    </article>
  </div>
</section>

<section class="sec cta" id="contacto">
  <div class="wrap cta__in">
    <div class="who"><img src="img/brand/johan-640.webp" alt="Johan Untuña" width="72" height="72" loading="lazy"><p><strong>Te responde Johan Untuña</strong>Diseño y programo cada web yo mismo, desde Latacunga.</p></div>
    <h2>¿Hacemos la web de tu {rubro}?</h2>
    <p class="lead">Escríbeme el nombre de tu negocio y tu ciudad. Te respondo en menos de 24 horas con una propuesta y un precio cerrado.</p>
    <div class="cta-row cta-row--center"><a class="btn btn--acc btn--lg js-wa" href="#contacto" data-msg="{msg}">Escribir por WhatsApp</a></div>
    <p class="cta__small">50 % al empezar y 50 % al publicar. Si no está lista a tiempo, te devuelvo el anticipo.</p>
  </div>
</section>
</main>
<footer class="foot">
  <div class="wrap foot__in">
    <a class="brand" href="./"><img src="img/v2/favicon.svg" alt="" width="24" height="24"><span class="brand__name">coduv<b>.dev</b></span></a>
    <nav aria-label="Rubros"><a href="gimnasios">Gimnasios</a><a href="academias">Academias</a><a href="muebles">Muebles</a><a href="transporte">Transporte</a></nav>
    <p>© <span id="year">2026</span> coduv.dev · Latacunga, Ecuador</p>
  </div>
</footer>
<div class="bar"><a class="btn btn--acc js-wa" href="#contacto" data-msg="{msg}">Cotizar mi web por WhatsApp</a></div>
<a class="fab js-wa" href="#contacto" aria-label="Escribir por WhatsApp" data-msg="{msg}">{wa}</a>
<script src="js/v2.js?v={v}" defer></script>
</body>
</html>
"""

e = html.escape
for n in NICHOS:
    c = n["caso"]
    dolores = "".join(f'<article class="card"><h3>{e(t)}</h3><p>{e(d)}</p></article>' for t, d in n["dolores"])
    incluye = "".join(f"<li>{e(i)}</li>" for i in n["incluye"])
    msg = f"Hola coduv.dev, tengo un {n['rubro']} y quiero una página web como la de {c['nombre']}."
    page = TPL.format(v=V, wa=WA_SVG, slug=n["slug"], title=e(n["title"]), h1=e(n["h1"]), lead=e(n["lead"]),
                      rubro=e(n["rubro"]), msg=e(msg), dolores=dolores, incluye=incluye,
                      nombre=e(c["nombre"]), lugar=e(c["lugar"]), url=c["url"], host=c["host"], img=c["img"], texto=e(c["texto"]))
    open(f"{n['slug']}.html", "w").write(page)
    print("ok", n["slug"])
