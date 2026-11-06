// api.js - ÚNICO archivo que conoce la dirección de la API y llama a fetch.
// Las páginas importan estas funciones y nunca escriben una URL.
//
// Cada función devuelve lo mismo que responde la API (ver api/schemas.py):
//   listarVideojuegos  -> { total, items: [VideojuegoPublic] }
//   crearVideojuego    -> VideojuegoPublic (sin costo_proveedor)

const URL_BASE = "http://127.0.0.1:8000";

// Error propio: lleva el código de estado y el "detail" que mandó la API.
// status 0 significa que no hubo respuesta (API apagada, sin red o CORS mal configurado).
export class ApiError extends Error {
  constructor(status, detail, mensaje) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// Hace el pedido, controla response.ok y devuelve el JSON ya convertido en objeto.
// Un 204 no trae cuerpo: devuelve null.
async function pedir(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, opciones);
  } catch {
    throw new ApiError(0, null, "No se pudo conectar con la API. Revisá que esté encendida en el puerto 8000.");
  }

  if (!respuesta.ok) {
    let detail = null;
    try {
      detail = (await respuesta.json()).detail ?? null;
    } catch {
      // la respuesta de error no era JSON: queda detail = null
    }
    throw new ApiError(respuesta.status, detail, `La API respondió con el estado ${respuesta.status}.`);
  }
  return respuesta.status === 204 ? null : respuesta.json();
}

// Opciones de un pedido que lleva un cuerpo JSON (POST, PUT, PATCH).
function conJson(metodo, datos) {
  return {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  };
}

// ----------------------------------------------------------------------
// Videojuegos
// ----------------------------------------------------------------------
// filtros: { q, genero, plataformaId, estudioId, soloConStock, skip, limit }.
// Solo viajan los que tienen valor; URLSearchParams arma "?skip=0&limit=12&genero=RPG".
export function listarVideojuegos(filtros = {}) {
  const parametros = new URLSearchParams({ skip: filtros.skip ?? 0, limit: filtros.limit ?? 12 });
  if (filtros.q) parametros.set("q", filtros.q);
  if (filtros.genero) parametros.set("genero", filtros.genero);
  if (filtros.plataformaId) parametros.set("plataforma_id", filtros.plataformaId);
  if (filtros.estudioId) parametros.set("estudio_id", filtros.estudioId);
  if (filtros.soloConStock) parametros.set("solo_con_stock", "true");
  return pedir(`/videojuegos/?${parametros}`);
}

export function obtenerVideojuego(id) {
  return pedir(`/videojuegos/${id}`);
}

export function listarGeneros() {
  return pedir("/videojuegos/generos");
}

export function obtenerResumen() {
  return pedir("/videojuegos/resumen");
}

export function crearVideojuego(datos) {
  return pedir("/videojuegos/", conJson("POST", datos));
}

export function actualizarVideojuego(id, cambios) {
  return pedir(`/videojuegos/${id}`, conJson("PATCH", cambios));
}

export function darDeBajaVideojuego(id) {
  return pedir(`/videojuegos/${id}`, { method: "DELETE" });
}

export function asociarPlataforma(juegoId, plataformaId) {
  return pedir(`/videojuegos/${juegoId}/plataformas/${plataformaId}`, { method: "POST" });
}

export function quitarPlataforma(juegoId, plataformaId) {
  return pedir(`/videojuegos/${juegoId}/plataformas/${plataformaId}`, { method: "DELETE" });
}

// ----------------------------------------------------------------------
// Estudios
// ----------------------------------------------------------------------
export function listarEstudios() {
  return pedir("/estudios/");
}

export function crearEstudio(datos) {
  return pedir("/estudios/", conJson("POST", datos));
}

export function reemplazarEstudio(id, datos) {
  return pedir(`/estudios/${id}`, conJson("PUT", datos));
}

export function darDeBajaEstudio(id) {
  return pedir(`/estudios/${id}`, { method: "DELETE" });
}

// ----------------------------------------------------------------------
// Plataformas
// ----------------------------------------------------------------------
export function listarPlataformas() {
  return pedir("/plataformas/");
}

export function crearPlataforma(datos) {
  return pedir("/plataformas/", conJson("POST", datos));
}

export function eliminarPlataforma(id) {
  return pedir(`/plataformas/${id}`, { method: "DELETE" });
}
