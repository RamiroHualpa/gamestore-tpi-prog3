# GameStore sin API

Es la misma web de `web-api/`, pero lee los datos de archivos JSON (carpeta `datos/`) en lugar de pedírselos a la API. El único archivo distinto es `js/api.js`.

```bash
python -m http.server 5500
```

Abrir <http://localhost:5500>. Las altas, ediciones y bajas se guardan en memoria y se pierden al recargar.

| Llamado de la versión con API | Archivo que lo reemplaza |
|---|---|
| `GET /videojuegos/` | `datos/videojuegos.json` (el filtrado y el paginado se hacen en `api.js`) |
| `GET /videojuegos/{id}` | `datos/videojuegos/{id}.json` |
| `GET /videojuegos/generos` | `datos/generos.json` |
| `GET /videojuegos/resumen` | `datos/resumen.json` |
| `GET /estudios/` | `datos/estudios.json` |
| `GET /plataformas/` | `datos/plataformas.json` |
