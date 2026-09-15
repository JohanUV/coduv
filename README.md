# CODUV — sitio web

Sitio estático (HTML/CSS/JS, sin frameworks) de CODUV: sitios web, sistemas a medida y automatización para negocios de Ecuador.

## Editar datos
- `js/main.js` (bloque DATOS): número de WhatsApp, URL de Facebook, URL del sitio de Noxis.
- `index.html`: textos, servicios, trabajos, FAQ. Correo en la sección de contacto y en el `<script type="application/ld+json">`.
- `img/brand/`: logo (`mark-*.png/webp`, recorte del perfil de Facebook), portada (`portada-*.webp`), foto del fundador.
- `img/work/`: capturas de los sitios de clientes (1200 px de ancho, WebP).

## Vista previa local
Abre `index.html` en el navegador. Añade `?shot` a la URL para desactivar las animaciones de aparición (útil para capturas).

## Publicar
Vercel: importar el repo, sin comando de build, directorio raíz. `vercel.json` ya trae cabeceras y caché de `/img`.

## Investigación
`docs/investigacion.md` recoge las referencias de agencias, fórmulas de copy y principios usados para redactar el sitio.
