"""Dibujos isométricos de línea para la sección de servicios (estilo FIG 0.x).

Misma proyección que el motor isométrico de la skill de animaciones: tres ejes a 120°, sin perspectiva.
Uso: python3 scripts/figs.py  → img/v3/fig-web.svg, fig-auto.svg, fig-sis.svg
"""
import math
import re
from pathlib import Path

CX, CY = math.cos(math.pi / 6), 0.5
L = "rgba(255,255,255,.38)"   # línea
L2 = "rgba(255,255,255,.62)"  # línea destacada
ACC = "#c8f560"
CARAS = ("#131417", "#0e0f11", "#0a0b0c")  # arriba, izquierda (+l), derecha (+a)


def pr(a, l, z):
    return ((a - l) * CX, (a + l) * CY - z)


def d_of(pts, cerrar=True):
    s = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in (pr(*p) for p in pts))
    return s + (" Z" if cerrar else "")


def poli(pts, fill="none", stroke=L, w=1.3, dash=None, cerrar=True):
    extra = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d_of(pts, cerrar)}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"{extra}/>'


def caja(a, l, z, da, dl, dz, stroke=L):
    a1, l1, z1 = a + da, l + dl, z + dz
    return [
        poli([(a, l1, z), (a1, l1, z), (a1, l1, z1), (a, l1, z1)], CARAS[1], stroke),
        poli([(a1, l, z), (a1, l1, z), (a1, l1, z1), (a1, l, z1)], CARAS[2], stroke),
        poli([(a, l, z1), (a1, l, z1), (a1, l1, z1), (a, l1, z1)], CARAS[0], stroke),
    ]


def rect_en_cara_l(l, a0, z0, a1, z1, **kw):
    """Un rectángulo dibujado sobre un plano vertical que mira a +l (coordenadas a, z)."""
    return poli([(a0, l, z0), (a1, l, z0), (a1, l, z1), (a0, l, z1)], **kw)


def circulo(c, r, n=40):
    a, l, z = c
    return [(a + r * math.cos(t), l + r * math.sin(t), z) for t in (2 * math.pi * i / n for i in range(n))]


def cilindro(a, l, z, r, h, stroke=L):
    abajo = [pr(*p) for p in circulo((a, l, z), r)]
    arriba = [pr(*p) for p in circulo((a, l, z + h), r)]
    xs = [p[0] for p in abajo]
    i0, i1 = xs.index(min(xs)), xs.index(max(xs))
    # cuerpo: mitad delantera de abajo + lados + tapa
    n = len(abajo)
    frente = [abajo[(i1 + k) % n] for k in range((i0 - i1) % n + 1)]
    cuerpo = "M " + f"{arriba[i0][0]:.1f} {arriba[i0][1]:.1f} L " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in [abajo[i0]] + frente[::-1][1:] ) + f" L {arriba[i1][0]:.1f} {arriba[i1][1]:.1f}"
    out = [f'<path d="{cuerpo}" fill="{CARAS[1]}" stroke="{stroke}" stroke-width="1.3" stroke-linejoin="round"/>']
    tapa = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in arriba) + " Z"
    out.append(f'<path d="{tapa}" fill="{CARAS[0]}" stroke="{stroke}" stroke-width="1.3"/>')
    return out


def flecha(p, q, stroke=L2, dash=None):
    (x1, y1), (x2, y2) = pr(*p), pr(*q)
    ang = math.atan2(y2 - y1, x2 - x1)
    h = 9
    ax, ay = x2 - h * math.cos(ang - 0.45), y2 - h * math.sin(ang - 0.45)
    bx, by = x2 - h * math.cos(ang + 0.45), y2 - h * math.sin(ang + 0.45)
    extra = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="1.4"{extra}/>'
            f'<path d="M {ax:.1f} {ay:.1f} L {x2:.1f} {y2:.1f} L {bx:.1f} {by:.1f}" fill="none" stroke="{stroke}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>')


def punto(q, r=3.2, fill=ACC):
    x, y = pr(*q)
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}"/>'


def anim_d(frames, dur, stroke=L, fill="none", w=1.3, begin="0s"):
    """Un trazo cuya forma cambia entre fotogramas (mismo número de puntos)."""
    vals = ";".join(frames + [frames[0]])
    return (f'<path d="{frames[0]}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linejoin="round">'
            f'<animate attributeName="d" values="{vals}" dur="{dur}" begin="{begin}" repeatCount="indefinite" calcMode="spline" '
            f'keySplines="{";".join(["0.45 0 0.55 1"] * len(frames))}" keyTimes="{";".join(f"{i / len(frames):.4f}" for i in range(len(frames)))};1"/></path>')


def clase(html, nombre, delay=0.0, extra=""):
    """Le pone una clase de animación (y su retraso) a la primera etiqueta del fragmento."""
    i = html.index(" ")
    estilo = f' style="animation-delay:{delay:.2f}s"' if delay else ""
    return html[:i] + f' class="{nombre}"{estilo}{extra}' + html[i:]


def ola(c, r, delay=0.0, color=ACC):
    return clase(poli(circulo(c, r), stroke=color, w=1.4), "ola", delay)


def viaje(p, q, dur, begin, r=3.4, fill=ACC):
    """Un punto que viaja de p a q y desaparece al llegar."""
    (x1, y1), (x2, y2) = pr(*p), pr(*q)
    return (f'<circle r="{r}" fill="{fill}" opacity="0">'
            f'<animate attributeName="cx" values="{x1:.1f};{x2:.1f}" dur="{dur}" begin="{begin}" repeatCount="indefinite"/>'
            f'<animate attributeName="cy" values="{y1:.1f};{y2:.1f}" dur="{dur}" begin="{begin}" repeatCount="indefinite"/>'
            f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="{dur}" begin="{begin}" repeatCount="indefinite"/></circle>')


ESTILO = """<style>
.flota{animation:flota 3.2s ease-in-out infinite}
.click{transform-box:fill-box;transform-origin:0 0;animation:click 3.2s ease-in-out infinite}
.brilla{animation:brilla 3.2s ease-in-out infinite}
.tipea circle{animation:tipea 1.4s ease-in-out infinite}
.tipea circle:nth-child(2){animation-delay:.2s}.tipea circle:nth-child(3){animation-delay:.4s}
.corre{stroke-dasharray:3 5;animation:corre 1.2s linear infinite}
.aparece{animation:aparece 3.6s ease-in-out infinite}
.late{animation:late 2.4s ease-in-out infinite}
@keyframes flota{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes click{0%,30%,100%{transform:translate(0,0) scale(1)}38%{transform:translate(1px,1px) scale(.86)}46%{transform:translate(0,0) scale(1)}}
@keyframes brilla{0%,30%{fill-opacity:.12}40%{fill-opacity:.55}70%,100%{fill-opacity:.12}}
@keyframes tipea{0%,60%,100%{opacity:.25}30%{opacity:1}}
@keyframes corre{to{stroke-dashoffset:-16}}
@keyframes aparece{0%,15%{opacity:0;transform:translateY(-10px)}30%,85%{opacity:1;transform:translateY(0)}100%{opacity:0}}
@keyframes late{0%,100%{opacity:.5}50%{opacity:1}}
.dibuja{stroke-dasharray:100;stroke-dashoffset:100;animation:dibuja 4s ease-in-out infinite}
@keyframes dibuja{0%{stroke-dashoffset:100}35%,80%{stroke-dashoffset:0}100%{stroke-dashoffset:-100}}
.pop{transform-box:fill-box;transform-origin:center;animation:pop 2.6s ease-in-out infinite}
@keyframes pop{0%,100%{transform:scale(1)}8%{transform:scale(1.18)}18%{transform:scale(1)}}
.ola{transform-box:fill-box;transform-origin:center;animation:ola 2.7s ease-out infinite}
@keyframes ola{0%{transform:scale(.45);opacity:.95}100%{transform:scale(1.55);opacity:0}}
.sube{animation:sube 3.4s ease-in-out infinite}
@keyframes sube{0%,15%{opacity:0;transform:translateY(10px)}30%{opacity:1}75%{opacity:0;transform:translateY(-40px)}100%{opacity:0}}
.barre{animation:barre 3s ease-in-out infinite;opacity:.35}
@keyframes barre{0%,100%{opacity:.35}20%{opacity:1;stroke:#c8f560}40%{opacity:.35}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>"""


def svg(elementos, nombre):
    texto = "".join(elementos)
    nums = [float(v) for v in re.findall(r"-?\d+\.\d", texto)]
    xs, ys = nums[0::2], nums[1::2]
    x0, x1, y0, y1 = min(xs) - 14, max(xs) + 14, min(ys) - 14, max(ys) + 14
    out = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.0f} {y0:.0f} {x1 - x0:.0f} {y1 - y0:.0f}" '
           f'fill="none" aria-hidden="true">{ESTILO}{texto}</svg>\n')
    Path("img/v3").mkdir(parents=True, exist_ok=True)
    Path(f"img/v3/{nombre}.svg").write_text(out)


# ───────────── FIG 0.1 · Páginas web que venden
# Un navegador de pie (la pantalla mira a +l) sobre una base, con su web; el cursor en el botón
# y un mensaje de WhatsApp que sale de la pantalla.
web = []
web += caja(-20, -60, 0, 320, 120, 10)          # base
web += caja(0, -8, 10, 280, 8, 200)             # el monitor (fino)
lp = 0.5                                         # plano de la pantalla (cara +l del monitor)
web.append(rect_en_cara_l(lp, 10, 22, 270, 200, fill="#0c0d0f"))
web.append(rect_en_cara_l(lp, 10, 186, 270, 200, fill="#15161a"))
for i in range(3):
    x, y = pr(20 + i * 9, lp, 193)
    web.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.2" fill="none" stroke="{L}" stroke-width="1"/>')
web.append(rect_en_cara_l(lp, 22, 120, 130, 172, stroke=L2))               # titular
web.append(clase(poli([(22, lp, 108), (110, lp, 108)], stroke=L2, cerrar=False), "dibuja", 0, ' pathLength="100"'))
web.append(clase(poli([(22, lp, 98), (95, lp, 98)], stroke=L2, cerrar=False), "dibuja", 0.3, ' pathLength="100"'))
for k, largo in enumerate((90, 70)):
    web.append(clase(poli([(30, lp, 160 - k * 16), (30 + largo, lp, 160 - k * 16)], stroke=L2, w=2, cerrar=False), "dibuja", 0.15 + k * 0.25, ' pathLength="100"'))
web.append(rect_en_cara_l(lp, 150, 98, 258, 172, fill="#121317"))          # imagen
web.append(clase(poli([(150, lp, 98), (190, lp, 140), (215, lp, 118), (258, lp, 160)], stroke=L2, w=1.6, cerrar=False), "dibuja", 0.5, ' pathLength="100"'))
sx, sy = pr(236, lp, 156)
web.append(f'<circle class="late" cx="{sx:.1f}" cy="{sy:.1f}" r="5" fill="none" stroke="{L2}" stroke-width="1.3"/>')
web.append(rect_en_cara_l(lp, 22, 58, 100, 80, fill="rgb(200,245,96)", stroke=ACC).replace("<path ", '<path class="brilla" fill-opacity=".12" ', 1))   # botón
for k in range(3):
    web.append(clase(rect_en_cara_l(lp, 22 + k * 82, 30, 92 + k * 82, 48, stroke=L), "barre", k * 0.35))
# cursor sobre el botón
cx_, cy_ = pr(88, lp, 66)
web.append(f'<path class="click" d="M {cx_:.1f} {cy_:.1f} l 0 16 l 4.5 -4 l 3.5 7 l 3 -1.5 l -3.5 -7 l 6 -0.5 Z" fill="#f7f8f8" stroke="#08090a" stroke-width="1"/>')
# el mensaje que sale: una burbuja de pie, delante y a la derecha
web.append('<g class="flota">')
web += caja(250, 60, 120, 120, 6, 62, stroke=ACC)
bx = [pr(262 + i * 16, 66.5, 151) for i in range(3)]
web.append('<g class="tipea">' + "".join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.4" fill="{ACC}"/>' for x, y in bx) + '</g>')
web.append(poli([(262, 66, 120), (252, 66, 104), (284, 66, 120)], fill=CARAS[1], stroke=ACC))
web.append('</g>')
web.append(flecha((200, 0.5, 110), (248, 60, 140), stroke=ACC).replace("<line ", '<line class="corre" ', 1))
# +1 pedido que late
nx, ny = pr(372, 63, 196)
web.append(f'<g class="pop" style="animation-delay:1.2s"><circle cx="{nx:.1f}" cy="{ny:.1f}" r="11" fill="{ACC}"/>'
           f'<text x="{nx:.1f}" y="{ny + 4:.1f}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="#08090a">+1</text></g>')
# otro mensaje que llega y sube
web.append('<g class="sube" style="animation-delay:.8s">')
web += caja(300, 90, 70, 70, 5, 34, stroke=ACC)
web.append('<g class="tipea">' + "".join('<circle cx="%.1f" cy="%.1f" r="2.6" fill="%s"/>' % (*pr(312 + i * 13, 95.5, 87), ACC) for i in range(3)) + '</g>')
web.append('</g>')
svg(web, "fig-web")

# ───────────── FIG 0.2 · Automatización
# Un flujo en el suelo: el chat entra, el engranaje lo procesa y la hoja de pedidos se llena sola.
auto = []
T = 110  # tamaño de cada placa
nodos = [(-260, 0), (0, 0), (260, 0)]
for i, (a, l) in enumerate(nodos):
    auto += caja(a, l, 0, T, T, 12)
for i, (a, l) in enumerate(nodos):
    auto.append(ola((a + T / 2, l + T / 2, 12), 52, i * 0.9))
# conexiones con paquetes de datos
for i in range(2):
    a0 = nodos[i][0] + T + 6
    a1 = nodos[i + 1][0] - 6
    auto.append(flecha((a0, T / 2, 12), (a1, T / 2, 12), stroke=L2))
    for k in range(3):
        auto.append(viaje((a0, T / 2, 12), (a1 - 8, T / 2, 12), "1.8s", f"{i * 0.9 + k * 0.6:.1f}s"))
# 1. el chat (burbuja de pie con su cola)
a, l = nodos[0]
auto.append('<g class="pop">')
auto += caja(a + 20, l + 50, 12, 70, 6, 50)
auto.append(poli([(a + 32, l + 56, 12), (a + 24, l + 56, -2), (a + 50, l + 56, 12)], fill=CARAS[1]))
auto.append('<g class="tipea">' + "".join(
    '<circle cx="%.1f" cy="%.1f" r="3" fill="rgba(255,255,255,.8)"/>' % pr(a + 38 + i * 17, l + 56.5, 37) for i in range(3)) + '</g>')
auto.append('</g>')
# 2. el engranaje (un disco con dientes, acostado sobre la placa)
a, l = nodos[1]
c = (a + T / 2, l + T / 2, 24)
def engranaje(giro, z):
    pts = []
    for i in range(48):
        t = 2 * math.pi * i / 48 + giro
        r = 40 if (i // 3) % 2 == 0 else 31
        pts.append((c[0] + r * math.cos(t), c[1] + r * math.sin(t), z))
    return d_of(pts)
paso = 2 * math.pi / 8  # un diente
cuadros = [k * paso / 6 for k in range(6)]
auto.append(anim_d([engranaje(g, 12) for g in cuadros], "1.6s", stroke=L, fill=CARAS[2]))
auto.append(anim_d([engranaje(g, 24) for g in cuadros], "1.6s", stroke=L2, fill=CARAS[0]))
auto.append(clase(poli(circulo(c, 12), fill="#08090a", stroke=ACC), "late"))
# 3. la hoja de pedidos (filas apiladas, la última en acento)
a, l = nodos[2]
for k in range(3):
    auto += caja(a + 18, l + 18, 12 + k * 14, 74, 74, 9, stroke=L)
auto.append('<g class="aparece">')
auto += caja(a + 18, l + 18, 12 + 3 * 14, 74, 74, 9, stroke=ACC)
auto.append('</g>')
svg(auto, "fig-auto")

# ───────────── FIG 0.3 · Sistemas y datos
# Un panel de pie con su gráfica y sus filas, y al lado la base de datos (tres discos).
sis = []
sis += caja(-30, -40, 0, 420, 150, 10)                 # base
sis += caja(0, -20, 10, 230, 8, 170)                    # panel
lp = -11.5
sis.append(rect_en_cara_l(lp, 10, 20, 220, 170, fill="#0c0d0f"))
ALTOS = [(30, 52, 40, 76, 64, 98), (44, 36, 62, 58, 86, 90), (36, 60, 50, 70, 78, 104)]
def barra(k, h):
    return d_of([(22 + k * 24, lp, 74), (38 + k * 24, lp, 74), (38 + k * 24, lp, 74 + h), (22 + k * 24, lp, 74 + h)])
for k in range(6):
    col = ACC if k == 5 else L2
    sis.append(anim_d([barra(k, alt[k]) for alt in ALTOS], "4.5s", stroke=col, fill="#101114", begin=f"{k * 0.12:.2f}s"))
for k in range(3):
    sis.append(clase(poli([(22, lp, 58 - k * 14), (200, lp, 58 - k * 14)], stroke=L, cerrar=False), "barre", k * 0.5))
# línea de tendencia que se dibuja sobre las barras
tend = [(30 + k * 24, lp, 74 + h + 12) for k, h in enumerate((30, 52, 40, 76, 64, 98))]
sis.append(clase(poli(tend, stroke=ACC, w=1.8, cerrar=False), "dibuja", 0, ' pathLength="100"'))
for k, q in enumerate(tend):
    x, y = pr(*q)
    sis.append(f'<circle class="pop" style="animation-delay:{0.25 * k:.2f}s" cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="{ACC}"/>')
for k in range(3):
    sis += cilindro(320, 40, 10 + k * 34, 48, 26)
for k in range(2):
    sis.append(ola((320, 40, 10 + 3 * 34 - 8), 50, k * 1.35))
sis.append(flecha((272, 40, 60), (232, -12, 110), stroke=L2).replace("<line ", '<line class="corre" ', 1))
for k in range(2):
    sis.append(viaje((272, 40, 60), (236, -8, 104), "1.6s", f"{k * 0.8:.1f}s"))
svg(sis, "fig-sis")
print("ok")
