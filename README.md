# GameStore: ejemplo resuelto del TPI

**Demo en línea (versión JSON):** <https://ramirohualpa.github.io/gamestore-tpi-prog3/>

Proyecto completo y funcionando, con **otro dominio** que el del TPI (videojuegos en lugar de comida). Sirve como base para ver cómo se conecta una web hecha con HTML, CSS y JavaScript a una API propia. Tiene **más cosas** que las que pide el TPI: lo que pide el TPI es el mínimo para aprobar.

| Carpeta | Qué es |
|---|---|
| `api/` | API con FastAPI y SQLModel, con CORS y la base `gamestore.db` ya cargada con 46 juegos |
| `web-api/` | La web conectada a la API (`fetch` a `http://127.0.0.1:8000`) |
| `web-json/` | La **misma web**, pero leyendo archivos JSON de `datos/` (no necesita la API) |
| `herramientas/` | Scripts con los que se generaron las portadas y los JSON (no hace falta usarlos) |

Las dos webs son iguales salvo **un archivo**: `js/api.js`. Comparalos: las páginas no se enteran de dónde vienen los datos.

## Cómo levantarlo

### Versión con API (dos terminales)

**Terminal 1, la API**, dentro de `api/`:

```bash
python -m venv venv
venv\Scripts\activate          # en Linux o Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Documentación interactiva: <http://127.0.0.1:8000/docs>

**Terminal 2, la web**, dentro de `web-api/`:

```bash
python -m http.server 5500
```

Abrir <http://localhost:5500>. Con doble clic sobre el HTML **no funciona**: los módulos ES necesitan un servidor, y CORS solo autoriza el puerto 5500.

### Versión sin API (una terminal)

Dentro de `web-json/`:

```bash
python -m http.server 5500
```

Las altas, ediciones y bajas se guardan en memoria y se pierden al recargar: un archivo no se puede modificar desde el navegador.

## Ver la base de datos

```bash
python ver_base.py           # últimos 10 juegos y totales, leídos con SQL directo
python ver_base.py --todo    # todos los juegos
python ver_base.py --sql     # además regenera gamestore.sql (estructura + datos)
```

`gamestore.sql` tiene todas las sentencias `CREATE TABLE` e `INSERT` de la base. También se puede abrir `gamestore.db` con DB Browser for SQLite. Para volver a los datos originales, se borra `gamestore.db` y se levanta la API: se vuelve a crear y a cargar sola.

## Qué mirar en el código

| Tema | Dónde |
|---|---|
| CORS | `api/main.py` |
| Qué JSON entra y qué JSON sale | `api/schemas.py`: `VideojuegoCreate` (entra, con `costo_proveedor`) y `VideojuegoPublic` (sale, sin `costo_proveedor`) |
| Todos los `fetch` en un solo lugar | `web-api/js/api.js` |
| Tarjetas creadas con JavaScript | `web-api/js/tarjetas.js` |
| Paginado en el servidor con `skip` y `limit` | `web-api/js/paginacion.js` y `catalogo.js` |
| Filtros que viajan en la URL | `catalogo.js` (`URLSearchParams`) |
| Validación en tres capas | HTML (`admin.html`), JavaScript (`validaciones.js`) y API (`schemas.py`) |
| Errores 409, 404 y 422 junto a cada campo | `validaciones.js` (`traducirErrorApi`) y `avisos.js` |
| Formulario en un modal y confirmación dentro de la página | `admin.html` (`<dialog>`) y `dialogos.js` |
| El JSON enviado y el recibido, en pantalla | Panel «Último envío» de `admin.html` |
| Imagen propia con respaldo en internet | `util.js` (`crearImagenJuego`) |
| HTML para buscadores (SEO) | El `<head>` de `index.html`, `robots.txt` y `sitemap.xml` |
| Estilos con clases reutilizables | `css/estilos.css`: `.btn .btn-primario`, `.tarjeta`, `.form-control`… |

## Las imágenes

Cada juego tiene dos direcciones:

- `imagen_url`: la portada **propia y comprimida** (WebP de 300×450, unos 20 KB) dentro de `img/juegos/`.
- `imagen_respaldo_url`: la misma portada **en internet**.

La web carga primero la propia. Si da error o no termina de cargar en **3 segundos**, usa la de respaldo; si tampoco anda, muestra «Sin imagen». Para probarlo:

- *Madden NFL 25* no tiene archivo propio: se ve la de internet.
- *Gran Turismo 7* no tiene ninguna: se ve «Sin imagen».
- Los juegos que no están en Steam usan una portada dibujada para el ejemplo (SVG).

Las portadas de los juegos son material promocional de cada estudio, publicado en el sitio de imágenes de Steam. Se usan solo con fines didácticos.

## Casos para probar

| Prueba | Qué pasa |
|---|---|
| Cambiar de página y de filtro con la pestaña Red abierta (`F12`) | Cada cambio es un pedido nuevo con `skip`, `limit` y los filtros |
| Buscar «zzz» | Mensaje de que no hay juegos |
| Apagar la API y recargar | Mensaje de error con «Reintentar» |
| Crear un juego con el título de solo espacios | Lo frena JavaScript: no sale ningún pedido |
| Crear un juego con costo mayor que el precio | Lo frena JavaScript; si se saltea, lo frena la API (422) |
| Crear un juego con el título «elden ring» | La API responde 409 y el mensaje aparece junto al título |
| Crear un juego válido | Aparece resaltado en la última página; el panel muestra el JSON enviado y el recibido |
| Editar sin escribir el costo | El PATCH viaja sin `costo_proveedor`: el costo guardado no cambia |
| Dar de baja un estudio con juegos | La API responde 409 con el motivo |
| Ver la web a 375 px de ancho | Menú desplegable y tablas con desplazamiento propio |
