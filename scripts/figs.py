"""Dibujos isométricos de línea para la sección de servicios (estilo FIG 0.x).

Misma proyección que el motor isométrico de la skill de animaciones: tres ejes a 120°, sin perspectiva.
Uso: python3 scripts/figs.py  → img/v3/fig-web.svg, fig-auto.svg, fig-sis.svg
"""
import math
from pathlib import Path

CX, CY = math.cos(math.pi / 6), 0.5
LINEA = "rgba(255,255,255,.34)"
CARAS = ("#101114", "#0c0d0f", "#08090a")  # arriba, izquierda, derecha


def pr(a, l, z):
    return ((a - l) * CX, (a + l) * CY - z)


def poli(pts, fill, dash=False, w=1.4):
    d = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in (pr(*p) for p in pts)) + " Z"
    extra = ' stroke-dasharray="3 5"' if dash else ""
    return f'<path d="{d}" fill="{fill}" stroke="{LINEA}" stroke-width="{w}" stroke-linejoin="round"{extra}/>'


def caja(a, l, z, da, dl, dz):
    a1, l1, z1 = a + da, l + dl, z + dz
    return [
        poli([(a, l1, z), (a1, l1, z), (a1, l1, z1), (a, l1, z1)], CARAS[1]),
        poli([(a1, l, z), (a1, l1, z), (a1, l1, z1), (a1, l, z1)], CARAS[2]),
        poli([(a, l, z1), (a1, l, z1), (a1, l1, z1), (a, l1, z1)], CARAS[0]),
    ]


def linea(p, q, dash=True):
    (x1, y1), (x2, y2) = pr(*p), pr(*q)
    extra = ' stroke-dasharray="3 6"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{LINEA}" stroke-width="1.2"{extra}/>'


def puntos(a, l, z, n=4, paso=9):
    out = []
    for i in range(n):
        for j in range(n):
            x, y = pr(a + i * paso, l + j * paso, z)
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.3" fill="rgba(255,255,255,.45)"/>')
    return out


def svg(elementos, nombre):
    texto = "".join(elementos)
    # caja de la vista: aproximada al contenido
    import re
    nums = [float(v) for v in re.findall(r"-?\d+\.\d", texto)]
    xs, ys = nums[0::2], nums[1::2]
    x0, x1, y0, y1 = min(xs) - 12, max(xs) + 12, min(ys) - 12, max(ys) + 12
    out = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.0f} {y0:.0f} {x1 - x0:.0f} {y1 - y0:.0f}" '
           f'fill="none" aria-hidden="true">{texto}</svg>\n')
    Path("img/v3").mkdir(parents=True, exist_ok=True)
    Path(f"img/v3/{nombre}.svg").write_text(out)


# FIG 0.1 · Webs: una pila de placas (páginas) y la de arriba con su ventana
web = []
for k in range(6):
    web += caja(0, 0, k * 16, 220, 220, 10)
top = 6 * 16
web += caja(0, 0, top, 220, 220, 14)
z = top + 14
web.append(poli([(24, 24, z), (196, 24, z), (196, 196, z), (24, 196, z)], "#0e0f12"))
for i in range(3):
    x, y = pr(40 + i * 14, 34, z)
    web.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="none" stroke="{LINEA}" stroke-width="1.2"/>')
web.append(linea((24, 52, z), (196, 52, z), dash=False))
for k, largo in enumerate((120, 150, 90)):
    web.append(linea((44, 80 + k * 28, z), (44 + largo, 80 + k * 28, z), dash=False))
svg(web, "fig-web")

# FIG 0.2 · Automatización: cubos conectados (flujos que se pasan datos)
cubos = [(0, -150, 0, 100), (-150, 0, 0, 100), (150, 0, 0, 100), (0, 150, 0, 100), (0, 0, 70, 90)]
auto = []
centro = lambda c: (c[0] + c[3] / 2, c[1] + c[3] / 2, c[2] + c[3] / 2)
for c in cubos[:4]:
    auto.append(linea(centro(cubos[4]), centro(c)))
for c in sorted(cubos, key=lambda c: c[0] + c[1] + c[2]):
    auto += caja(c[0], c[1], c[2], c[3], c[3], c[3])
    auto += puntos(c[0] + 16, c[1] + 16, c[2] + c[3], 3, 10)
svg(auto, "fig-auto")

# FIG 0.3 · Sistemas y datos: paneles que crecen (reportes) sobre una base
sis = caja(0, -40, 0, 300, 200, 8)
for k in range(9):
    h = 40 + k * 26
    sis += caja(20 + k * 30, -20, 8, 8, 160, h)
svg(sis, "fig-sis")
print("ok")
