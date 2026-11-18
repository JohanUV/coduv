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


def svg(elementos, nombre):
    texto = "".join(elementos)
    nums = [float(v) for v in re.findall(r"-?\d+\.\d", texto)]
    xs, ys = nums[0::2], nums[1::2]
    x0, x1, y0, y1 = min(xs) - 14, max(xs) + 14, min(ys) - 14, max(ys) + 14
    out = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.0f} {y0:.0f} {x1 - x0:.0f} {y1 - y0:.0f}" '
           f'fill="none" aria-hidden="true">{texto}</svg>\n')
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
web.append(poli([(22, lp, 108), (110, lp, 108)], stroke=L, cerrar=False))
web.append(poli([(22, lp, 98), (95, lp, 98)], stroke=L, cerrar=False))
web.append(rect_en_cara_l(lp, 150, 98, 258, 172, fill="#121317"))          # imagen
web.append(poli([(150, lp, 98), (190, lp, 140), (215, lp, 118), (258, lp, 160)], stroke=L, cerrar=False))
web.append(rect_en_cara_l(lp, 22, 58, 100, 80, fill="rgba(200,245,96,.14)", stroke=ACC))   # botón
for k in range(3):
    web.append(rect_en_cara_l(lp, 22 + k * 82, 30, 92 + k * 82, 48, stroke=L))
# cursor sobre el botón
cx_, cy_ = pr(88, lp, 66)
web.append(f'<path d="M {cx_:.1f} {cy_:.1f} l 0 16 l 4.5 -4 l 3.5 7 l 3 -1.5 l -3.5 -7 l 6 -0.5 Z" fill="#f7f8f8" stroke="#08090a" stroke-width="1"/>')
# el mensaje que sale: una burbuja de pie, delante y a la derecha
web += caja(250, 60, 120, 120, 6, 62, stroke=ACC)
bx = [pr(262 + i * 16, 66.5, 151) for i in range(3)]
web += [f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.4" fill="{ACC}"/>' for x, y in bx]
web.append(poli([(262, 66, 120), (252, 66, 104), (284, 66, 120)], fill=CARAS[1], stroke=ACC))
web.append(flecha((200, 0.5, 110), (248, 60, 140), stroke=ACC, dash="3 4"))
svg(web, "fig-web")

# ───────────── FIG 0.2 · Automatización
# Un flujo en el suelo: el chat entra, el engranaje lo procesa y la hoja de pedidos se llena sola.
auto = []
T = 110  # tamaño de cada placa
nodos = [(-260, 0), (0, 0), (260, 0)]
for (a, l) in nodos:
    auto += caja(a, l, 0, T, T, 12)
# conexiones con paquetes de datos
for i in range(2):
    a0 = nodos[i][0] + T + 6
    a1 = nodos[i + 1][0] - 6
    auto.append(flecha((a0, T / 2, 12), (a1, T / 2, 12), stroke=L2))
    for k in (0.3, 0.62):
        auto.append(punto((a0 + (a1 - a0) * k, T / 2, 12)))
# 1. el chat (burbuja de pie con su cola)
a, l = nodos[0]
auto += caja(a + 20, l + 50, 12, 70, 6, 50)
auto.append(poli([(a + 32, l + 56, 12), (a + 24, l + 56, -2), (a + 50, l + 56, 12)], fill=CARAS[1]))
for i in range(3):
    x, y = pr(a + 38 + i * 17, l + 56.5, 37)
    auto.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="rgba(255,255,255,.7)"/>')
# 2. el engranaje (un disco con dientes, acostado sobre la placa)
a, l = nodos[1]
c = (a + T / 2, l + T / 2, 24)
dientes = []
for i in range(48):
    t = 2 * math.pi * i / 48
    r = 40 if (i // 3) % 2 == 0 else 31
    dientes.append((c[0] + r * math.cos(t), c[1] + r * math.sin(t), c[2]))
canto = [(p[0], p[1], 12) for p in dientes]
auto.append(poli(canto, fill=CARAS[2], stroke=L))
auto.append(poli(dientes, fill=CARAS[0], stroke=L2))
auto.append(poli(circulo(c, 12), fill="#08090a", stroke=L2))
# 3. la hoja de pedidos (filas apiladas, la última en acento)
a, l = nodos[2]
for k in range(4):
    color = ACC if k == 3 else L
    auto += caja(a + 18, l + 18, 12 + k * 14, 74, 74, 9, stroke=color)
svg(auto, "fig-auto")

# ───────────── FIG 0.3 · Sistemas y datos
# Un panel de pie con su gráfica y sus filas, y al lado la base de datos (tres discos).
sis = []
sis += caja(-30, -40, 0, 420, 150, 10)                 # base
sis += caja(0, -20, 10, 230, 8, 170)                    # panel
lp = -11.5
sis.append(rect_en_cara_l(lp, 10, 20, 220, 170, fill="#0c0d0f"))
for k, h in enumerate((30, 52, 40, 76, 64, 98)):
    col = ACC if k == 5 else L2
    sis.append(rect_en_cara_l(lp, 22 + k * 24, 74, 38 + k * 24, 74 + h, fill="#101114", stroke=col))
for k in range(3):
    sis.append(poli([(22, lp, 58 - k * 14), (200, lp, 58 - k * 14)], stroke=L, cerrar=False))
for k in range(3):
    sis += cilindro(320, 40, 10 + k * 34, 48, 26)
sis.append(flecha((272, 40, 60), (232, -12, 110), stroke=L2, dash="3 4"))
svg(sis, "fig-sis")
print("ok")
