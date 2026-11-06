// api.js - VERSIÓN SIN API: lee archivos JSON con fetch.
//
// Es el ÚNICO archivo que cambia respecto de la versión con API (web-api/js/api.js):
// exporta las MISMAS funciones, con los MISMOS nombres y devuelve objetos con la
// MISMA forma. Por eso catalogo.js, admin-juegos.js y el resto no se enteran.
//
// Qué archivo responde cada llamado:
//   GET /videojuegos/          -> datos/videojuegos.json    (acá se filtra y se pagina)
//   GET /videojuegos/{id}      -> datos/videojuegos/{id}.json
//   GET /videojuegos/generos   -> datos/generos.json
//   GET /videojuegos/resumen   -> datos/resumen.json
//   GET /estudios/             -> datos/estudios.json
//   GET /plataformas/          -> datos/plataformas.json
//
// Un archivo no se puede modificar desde el navegador: las altas, ediciones y bajas
// se guardan en MEMORIA (en variables) y se pierden al recargar la página.

const CARPETA = "datos";

// Mismo error que en la versión con API, para que las páginas lo manejen igual.
export class ApiError extends Error {
  constructor(status, detail, mensaje) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// Lee un archivo JSON. Controla response.ok igual que con la API.
async function leerJson(archivo) {
  let respuesta;
  try {
    respuesta = await fetch(`${CARPETA}/${archivo}`);
  } catch {
    throw new ApiError(0, null, "No se pudo leer el archivo. Abrí la página con un servidor (python -m http.server).");
  }
  if (!respuesta.ok) {
    throw new ApiError(respuesta.status, null, `No se encontró ${CARPETA}/${archivo} (estado ${respuesta.status}).`);
  }
  return respuesta.json();
}

// Simula los errores de la API: 404 y 409 con su "detail".
function noEncontrado(detail) {
  return new ApiError(404, detail, "La API respondió con el estado 404.");
}

function conflicto(detail) {
  return new ApiError(409, detail, "La API respondió con el estado 409.");
}

// structuredClone devuelve una COPIA: la página nunca toca los datos guardados acá.
const copia = (dato) => structuredClone(dato);
const mismoNombre = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

// ----------------------------------------------------------------------
// "Base" en memoria: se carga una sola vez desde los archivos
// ----------------------------------------------------------------------
let juegos = null;        // todos los videojuegos (activos e inactivos)
let estudios = null;
let plataformas = null;
let hayCambios = false;   // si se modificó algo, el resumen se recalcula

async function cargarJuegos() {
  juegos ??= await leerJson("videojuegos.json");
  return juegos;
}

async function cargarEstudios() {
  estudios ??= await leerJson("estudios.json");
  return estudios;
}

async function cargarPlataformas() {
  plataformas ??= await leerJson("plataformas.json");
  return plataformas;
}

function siguienteId(lista) {
  return Math.max(0, ...lista.map((elemento) => elemento.id)) + 1;
}

// ----------------------------------------------------------------------
// Videojuegos
// ----------------------------------------------------------------------
// La API filtra y pagina en el SERVIDOR. Acá no hay servidor: se hace lo mismo
// sobre el arreglo, pero se devuelve igual que la API: { total, items }.
export async function listarVideojuegos(filtros = {}) {
  const skip = Number(filtros.skip ?? 0);
  const limit = Number(filtros.limit ?? 12);
  const texto = (filtros.q ?? "").toLowerCase();

  const resultado = (await cargarJuegos()).filter((juego) =>
    juego.activo &&
    (!texto || juego.titulo.toLowerCase().includes(texto) || juego.descripcion.toLowerCase().includes(texto)) &&
    (!filtros.genero || juego.genero === filtros.genero) &&
    (!filtros.estudioId || juego.estudio_id === Number(filtros.estudioId)) &&
    (!filtros.plataformaId || juego.plataformas.some((p) => p.id === Number(filtros.plataformaId))) &&
    (!filtros.soloConStock || juego.stock > 0)
  );
  return { total: resultado.length, items: copia(resultado.slice(skip, skip + limit)) };
}

export async function obtenerVideojuego(id) {
  const lista = await cargarJuegos();
  const enMemoria = lista.find((juego) => juego.id === Number(id));
  if (enMemoria && hayCambios) return copia(enMemoria);
  try {
    return await leerJson(`videojuegos/${id}.json`);   // un archivo por juego
  } catch {
    throw noEncontrado(`No existe un videojuego con id ${id}`);
  }
}

export function listarGeneros() {
  return leerJson("generos.json");
}

export async function obtenerResumen() {
  if (!hayCambios) return leerJson("resumen.json");
  // Después de un cambio, el archivo quedó viejo: se calcula con los datos en memoria.
  const activos = (await cargarJuegos()).filter((juego) => juego.activo);
  const porGenero = {};
  for (const juego of activos) porGenero[juego.genero] = (porGenero[juego.genero] ?? 0) + 1;
  return {
    total_activos: activos.length,
    unidades_en_stock: activos.reduce((suma, juego) => suma + juego.stock, 0),
    sin_stock: activos.filter((juego) => juego.stock === 0).length,
    por_genero: porGenero,
  };
}

// Las mismas reglas que el service de la API: estudio activo (404) y título único (409).
async function controlarJuego(datos, idPropio = null) {
  const estudio = (await cargarEstudios()).find((e) => e.id === datos.estudio_id && e.activo);
  if (!estudio) throw noEncontrado(`No existe un estudio activo con id ${datos.estudio_id}`);
  if ((await cargarJuegos()).some((j) => j.id !== idPropio && mismoNombre(j.titulo, datos.titulo))) {
    throw conflicto(`Ya existe un videojuego llamado '${datos.titulo}'`);
  }
  return estudio;
}

export async function crearVideojuego(datos) {
  const estudio = await controlarJuego(datos);
  const lista = await cargarJuegos();
  // Como en la API: costo_proveedor se recibe pero NO se devuelve.
  const { costo_proveedor: _costo, ...publico } = datos;
  const nuevo = { ...publico, id: siguienteId(lista), activo: true, estudio: copia(estudio), plataformas: [] };
  lista.push(nuevo);
  hayCambios = true;
  return copia(nuevo);
}

export async function actualizarVideojuego(id, cambios) {
  const juego = (await cargarJuegos()).find((j) => j.id === Number(id));
  if (!juego) throw noEncontrado(`No existe un videojuego con id ${id}`);
  const estudio = await controlarJuego({ ...juego, ...cambios }, juego.id);
  const { costo_proveedor: _costo, ...publico } = cambios;
  Object.assign(juego, publico, { estudio: copia(estudio) });
  hayCambios = true;
  return copia(juego);
}

export async function darDeBajaVideojuego(id) {
  const juego = (await cargarJuegos()).find((j) => j.id === Number(id));
  if (!juego) throw noEncontrado(`No existe un videojuego con id ${id}`);
  if (!juego.activo) throw conflicto(`El videojuego '${juego.titulo}' ya estaba dado de baja`);
  juego.activo = false;
  hayCambios = true;
  return copia(juego);
}

export async function asociarPlataforma(juegoId, plataformaId) {
  const juego = (await cargarJuegos()).find((j) => j.id === Number(juegoId));
  const plataforma = (await cargarPlataformas()).find((p) => p.id === Number(plataformaId));
  if (!juego || !plataforma) throw noEncontrado("No existe el videojuego o la plataforma");
  if (juego.plataformas.some((p) => p.id === plataforma.id)) {
    throw conflicto(`'${juego.titulo}' ya está asociado a ${plataforma.nombre}`);
  }
  juego.plataformas.push(copia(plataforma));
  juego.plataformas.sort((a, b) => a.id - b.id);
  hayCambios = true;
  return copia(juego);
}

export async function quitarPlataforma(juegoId, plataformaId) {
  const juego = (await cargarJuegos()).find((j) => j.id === Number(juegoId));
  if (!juego || !juego.plataformas.some((p) => p.id === Number(plataformaId))) {
    throw noEncontrado("El videojuego no está asociado a esa plataforma");
  }
  juego.plataformas = juego.plataformas.filter((p) => p.id !== Number(plataformaId));
  hayCambios = true;
  return null;   // como el 204 de la API: sin cuerpo
}

// ----------------------------------------------------------------------
// Estudios
// ----------------------------------------------------------------------
export async function listarEstudios() {
  const activos = (await cargarEstudios()).filter((e) => e.activo);
  return copia(activos.sort((a, b) => a.nombre.localeCompare(b.nombre)));
}

export async function crearEstudio(datos) {
  const lista = await cargarEstudios();
  if (lista.some((e) => mismoNombre(e.nombre, datos.nombre))) throw conflicto(`Ya existe el estudio '${datos.nombre}'`);
  const nuevo = { ...datos, id: siguienteId(lista), activo: true };
  lista.push(nuevo);
  return copia(nuevo);
}

export async function reemplazarEstudio(id, datos) {
  const lista = await cargarEstudios();
  const estudio = lista.find((e) => e.id === Number(id));
  if (!estudio) throw noEncontrado(`No existe un estudio con id ${id}`);
  if (lista.some((e) => e.id !== estudio.id && mismoNombre(e.nombre, datos.nombre))) {
    throw conflicto(`Ya existe el estudio '${datos.nombre}'`);
  }
  Object.assign(estudio, datos);
  return copia(estudio);
}

export async function darDeBajaEstudio(id) {
  const estudio = (await cargarEstudios()).find((e) => e.id === Number(id));
  if (!estudio) throw noEncontrado(`No existe un estudio con id ${id}`);
  const activos = (await cargarJuegos()).filter((j) => j.estudio_id === estudio.id && j.activo).length;
  if (activos > 0) {
    throw conflicto(`El estudio '${estudio.nombre}' tiene ${activos} videojuego(s) activos: no se puede dar de baja`);
  }
  estudio.activo = false;
  return copia(estudio);
}

// ----------------------------------------------------------------------
// Plataformas
// ----------------------------------------------------------------------
export async function listarPlataformas() {
  return copia(await cargarPlataformas());
}

export async function crearPlataforma(datos) {
  const lista = await cargarPlataformas();
  if (lista.some((p) => mismoNombre(p.nombre, datos.nombre))) throw conflicto(`Ya existe la plataforma '${datos.nombre}'`);
  const nueva = { ...datos, id: siguienteId(lista) };
  lista.push(nueva);
  return copia(nueva);
}

export async function eliminarPlataforma(id) {
  const lista = await cargarPlataformas();
  const plataforma = lista.find((p) => p.id === Number(id));
  if (!plataforma) throw noEncontrado(`No existe una plataforma con id ${id}`);
  const enUso = (await cargarJuegos()).filter((j) => j.plataformas.some((p) => p.id === plataforma.id)).length;
  if (enUso > 0) {
    throw conflicto(`La plataforma '${plataforma.nombre}' está asociada a ${enUso} videojuego(s): no se puede eliminar`);
  }
  plataformas = lista.filter((p) => p.id !== plataforma.id);
  return null;
}
