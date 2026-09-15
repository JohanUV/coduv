"""Prepara los datos 3D que usa js/walker3d.js.

Dos pasadas:
  MODE=gecko  python export_gecko.py <glb_gecko_solo>  <mark-cutout.png> <dir>
  MODE=c      python export_gecko.py <glb_gecko_con_C> <mark-cutout.png> <dir>

La primera exporta el gecko (pose curvada + pose recta para caminar) a img/gecko/gecko.bin
y su textura por proyección frontal a img/gecko/gecko.jpg.
La segunda exporta solo la letra C (quitando el gecko y cerrando los huecos) a img/gecko/c.bin.

Cada malla se encaja sobre la imagen del hero (mark-cutout.png) buscando la orientación
cuya proyección coincide mejor con la silueta correspondiente; la cabecera del .bin lleva
la escala en píxeles (para un hero de 512 px de ancho) y el origen, para colocarla exacta.
"""
import sys, os, struct
import numpy as np
import trimesh
from PIL import Image
from scipy import ndimage

glb, cutout, out = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get("MODE", "gecko")
os.makedirs(f"{out}/img/gecko", exist_ok=True)

# ---------- máscaras de referencia en la imagen del hero ----------
im = Image.open(cutout).convert("RGBA"); A = np.array(im); H, W = A.shape[:2]
dep = np.array(Image.open(f"{out}/img/brand/mark-depth-512.webp").convert("L").resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
rgb = A[..., :3].astype(np.float32) / 255; al = A[..., 3] > 10
mx = rgb.max(2); mn = rgb.min(2); sat = (mx - mn) / (mx + 1e-6); val = mx
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]; d = (mx - mn) + 1e-6
hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
strict = (((sat > 0.62) & (val > 0.15) & (hue > 218) & (hue < 255)) | ((sat > 0.45) & (val > 0.25) & (hue > 70) & (hue < 165)) | ((val < 0.35) & (sat > 0.3))) & al
white = (sat < 0.3) & (val > 0.75); loose = al & ~white
yy, xx = np.mgrid[0:H, 0:W]; headzone = (xx > W * 0.66) & (yy < H * 0.42)
gmask = strict | (loose & (dep > 0.86)) | (loose & headzone & (dep > 0.72))
gmask = ndimage.binary_closing(gmask, iterations=6); gmask = ndimage.binary_fill_holes(gmask)
lab, n = ndimage.label(gmask); sizes = ndimage.sum(gmask, lab, range(1, n + 1)); gmask = lab == (np.argmax(sizes) + 1)
mask = gmask if MODE == "gecko" else al

# ---------- malla ----------
sc = trimesh.load(glb, force="scene")
m = list(sc.geometry.values())[0]
print("faces", len(m.faces), "verts", len(m.vertices))
target = int(os.environ.get("TARGET_FACES", "60000"))
if len(m.faces) > target:
    import pymeshlab
    ms = pymeshlab.MeshSet()
    ms.add_mesh(pymeshlab.Mesh(vertex_matrix=np.asarray(m.vertices, dtype=np.float64), face_matrix=np.asarray(m.faces, dtype=np.int32)))
    ms.meshing_decimation_quadric_edge_collapse(targetfacenum=target, preserveboundary=True, preservenormal=True, qualitythr=0.4)
    mm = ms.current_mesh(); m = trimesh.Trimesh(mm.vertex_matrix(), mm.face_matrix(), process=False)
    print("decimated →", len(m.faces))
V = np.asarray(m.vertices, dtype=np.float64); F = np.asarray(m.faces, dtype=np.int32)
V -= V.mean(axis=0)

# ---------- orientación: qué par de ejes reproduce la silueta ----------
ys, xs = np.where(mask); bx0, bx1, by0, by1 = xs.min(), xs.max(), ys.min(), ys.max()
gw, gh = bx1 - bx0, by1 - by0
best = None
for ia in range(3):
    for sa in (1, -1):
        for ib in range(3):
            if ib == ia: continue
            for sb in (1, -1):
                u = V[:, ia] * sa; v = V[:, ib] * sb
                s = min(gw / (u.max() - u.min()), gh / (v.max() - v.min()))
                uu = (u - u.min()) * s + bx0 + (gw - (u.max() - u.min()) * s) / 2
                vv = (v - v.min()) * s + by0 + (gh - (v.max() - v.min()) * s) / 2
                grid = np.zeros_like(mask)
                grid[np.clip(vv.astype(int), 0, H - 1), np.clip(uu.astype(int), 0, W - 1)] = True
                grid = ndimage.binary_dilation(grid, iterations=6)
                iou = (grid & mask).sum() / (grid | mask).sum()
                if best is None or iou > best[0]: best = (iou, ia, sa, ib, sb, s, uu, vv)
iou, ia, sa, ib, sb, s, uu, vv = best
ic = 3 - ia - ib
print(f"orientación u=eje{ia}*{sa} v=eje{ib}*{sb} z=eje{ic} IoU={iou:.2f}")

u = V[:, ia] * sa; v = V[:, ib] * sb; w = V[:, ic]
zc = w - w.mean()
sign_z = 1.0 if np.mean(np.abs(zc[zc > 0])) >= np.mean(np.abs(zc[zc < 0])) else -1.0
P = np.stack([u, -v, zc * sign_z], axis=1)

if MODE == "c":
    # quitar el gecko de la malla combinada y cerrar los agujeros
    inside = ndimage.binary_dilation(gmask, iterations=16)[np.clip(vv.astype(int), 0, H - 1), np.clip(uu.astype(int), 0, W - 1)]
    F = F[~inside[F].any(axis=1)]
    used = np.unique(F); remap = -np.ones(len(V), dtype=np.int64); remap[used] = np.arange(len(used))
    F = remap[F].astype(np.int32); P = P[used]
    import pymeshlab
    ms = pymeshlab.MeshSet(); ms.add_mesh(pymeshlab.Mesh(vertex_matrix=P, face_matrix=F))
    ms.meshing_remove_unreferenced_vertices()
    ms.meshing_remove_connected_component_by_face_number(mincomponentsize=4000)
    for _ in range(4):
        try: ms.meshing_close_holes(maxholesize=100000, selfintersection=False)
        except Exception: break
    ms.meshing_decimation_quadric_edge_collapse(targetfacenum=22000, preservenormal=True, qualitythr=0.3)
    ms.apply_coord_taubin_smoothing(stepsmoothnum=6)
    mm = ms.current_mesh(); P = mm.vertex_matrix(); F = mm.face_matrix().astype(np.int32)
    N = np.asarray(trimesh.Trimesh(P, F, process=False).vertex_normals, dtype=np.float64)
    px_per_unit_512 = s * 512.0 / W
    ox = (uu - u * s).mean() * 512.0 / W; oy = (vv - v * s).mean() * 512.0 / W
    # UV por proyección frontal: cada vértice toma el color del píxel donde se proyecta
    CU = ((P[:, 0] / (s * W / W) * 0) + (P[:, 0] * s + (uu - u * s).mean())) / W
    CV = ((-P[:, 1] * s + (vv - v * s).mean())) / H
    UVc = np.stack([CU, CV], axis=1).astype(np.float32)
    ctex_path = os.environ.get("CTEX", "")
    if ctex_path and os.path.exists(ctex_path):
        ct = Image.open(ctex_path).convert("RGBA")
        base = Image.new("RGB", ct.size, (196, 219, 255)); base.paste(ct.convert("RGB"), mask=ct.split()[3])
        base = base.resize(im.size) if base.size != im.size else base
        base.thumbnail((1024, 1024)); base.save(f"{out}/img/gecko/c.jpg", quality=88)
    with open(f"{out}/img/gecko/c.bin", "wb") as fh:
        fh.write(struct.pack("<IIfff", len(P), len(F), px_per_unit_512, ox, oy))
        for arr in (P, N): fh.write(np.ascontiguousarray(arr, dtype=np.float32).tobytes())
        fh.write(np.ascontiguousarray(UVc, dtype=np.float32).tobytes())
        fh.write(np.ascontiguousarray(F, dtype=np.uint32).tobytes())
    print("C:", len(P), "verts", len(F), "faces", round(os.path.getsize(f"{out}/img/gecko/c.bin") / 1e6, 2), "MB")
    sys.exit(0)

# ---------- desenrollado: de la pose curvada a una recta ----------
x, y = P[:, 0], P[:, 1]
Amat = np.stack([x, y, np.ones_like(x)], axis=1); bvec = x ** 2 + y ** 2
cx, cy, c0 = np.linalg.lstsq(Amat, bvec, rcond=None)[0]
cx /= 2; cy /= 2; R = np.sqrt(c0 + cx ** 2 + cy ** 2)
theta = np.arctan2(y - cy, x - cx); rad = np.hypot(x - cx, y - cy)
hist, edges = np.histogram(theta, bins=180, range=(-np.pi, np.pi))
occ = np.concatenate([hist > max(3, len(theta) * 1e-4)] * 2)
best_len = best_start = run = start = 0
for i, o in enumerate(occ):
    if not o:
        if run == 0: start = i
        run += 1
        if run > best_len: best_len, best_start = run, start
    else: run = 0
th0 = edges[(best_start + best_len // 2) % 180]
rel = (theta - th0) % (2 * np.pi)
head_sel = x > np.percentile(x, 97)
flip = np.median(rel[head_sel]) > np.pi
if flip: rel = 2 * np.pi - rel
rel -= rel.min()
arc = rel * R
L = np.percentile(arc, 99.5)
P2 = np.stack([(L / 2) - arc, rad - R, P[:, 2]], axis=1)
N = np.asarray(trimesh.Trimesh(P, F, process=False).vertex_normals, dtype=np.float64)
phi = (theta - np.pi / 2) if flip else (np.pi / 2 - theta)
cph, sph = np.cos(phi), np.sin(phi)
N2 = np.stack([N[:, 0] * cph - N[:, 1] * sph, N[:, 0] * sph + N[:, 1] * cph, N[:, 2]], axis=1)
P /= L; P2 /= L
print(f"R={R:.3f} L={L:.3f}")

# ---------- textura por proyección frontal ----------
UV = np.stack([uu / W, vv / H], axis=1).astype(np.float32)
tex = Image.new("RGB", im.size, (28, 66, 190)); tex.paste(im.convert("RGB"), mask=im.split()[3])

# ángulo "hacia adelante" en la pose curvada: del centro del cuerpo a la cabeza
hx, hy = P[head_sel, 0].mean(), P[head_sel, 1].mean()
ang0 = float(np.degrees(np.arctan2(hy - P[:, 1].mean(), hx - P[:, 0].mean())))
print(f"ang0={ang0:.1f}°")
px_per_unit_512 = s * L * 512.0 / W
ox = (uu - u * s).mean() * 512.0 / W; oy = (vv - v * s).mean() * 512.0 / W
print(f"px512/unit={px_per_unit_512:.1f} origen=({ox:.1f},{oy:.1f})")
with open(f"{out}/img/gecko/gecko.bin", "wb") as fh:
    fh.write(struct.pack("<IIffff", len(P), len(F), px_per_unit_512, ox, oy, ang0))
    for arr in (P, P2, N, N2): fh.write(np.ascontiguousarray(arr, dtype=np.float32).tobytes())
    fh.write(np.ascontiguousarray(UV, dtype=np.float32).tobytes())
    fh.write(np.ascontiguousarray(F, dtype=np.uint32).tobytes())
t = tex.copy(); t.thumbnail((1024, 1024)); t.save(f"{out}/img/gecko/gecko.jpg", quality=86)
with open(f"{out}/js/gecko-data.js", "w") as fh:
    fh.write('window.CODUV_GECKO = { bin: "img/gecko/gecko.bin", tex: "img/gecko/gecko.jpg", c: "img/gecko/c.bin", ctex: "img/gecko/c.jpg" };\n')
print("gecko:", len(P), "verts", len(F), "faces", round(os.path.getsize(f"{out}/img/gecko/gecko.bin") / 1e6, 2), "MB")
