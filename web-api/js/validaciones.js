// validaciones.js - Las reglas del formulario, sin tocar el DOM.
//
// Son las MISMAS reglas que tiene la API en api/models.py y api/schemas.py.
// Se repiten acá para avisar antes de enviar; la API igual vuelve a validar,
// porque es la única barrera que no se puede saltear.
//
//   Campo de VideojuegoCreate   Regla en la API                 Regla acá
//   titulo                      min_length=2, max_length=80     igual, sin contar espacios
//   descripcion                 min_length=10, max_length=300   igual
//   genero                      Enum Genero                     uno de los géneros cargados
//   anio_lanzamiento            ge=1980, le=2030                entero en ese rango
//   precio                      gt=0, le=500000                 igual
//   costo_proveedor             gt=0 y menor que el precio      igual
//   stock                       ge=0, le=9999                   entero en ese rango
//   imagen_url                  opcional, max_length=255        ruta img/... o https://...
//   imagen_respaldo_url         opcional, max_length=255        solo https://...
//   estudio_id                  gt=0 (y que exista: 404)        que se haya elegido uno

export const REGLAS = {
  titulo: { min: 2, max: 80 },
  descripcion: { min: 10, max: 300 },
  anio_lanzamiento: { min: 1980, max: 2030 },
  precio: { max: 500000 },
  stock: { min: 0, max: 9999 },
  imagen_url: { max: 255 },
  estudio: { nombreMin: 2, nombreMax: 60, paisMax: 40 },
  plataforma: { nombreMin: 2, nombreMax: 30 },
};

// --- Ayudas: cada una devuelve el mensaje de error o null --------------
function texto(valor, minimo, maximo) {
  const largo = valor.trim().length;
  if (largo < minimo) return `Tiene que tener al menos ${minimo} caracteres (sin contar espacios en los extremos).`;
  if (largo > maximo) return `No puede superar los ${maximo} caracteres (tiene ${largo}).`;
  return null;
}

function entero(valor, minimo, maximo) {
  if (!Number.isInteger(valor)) return "Tiene que ser un número entero.";
  if (valor < minimo || valor > maximo) return `Tiene que estar entre ${minimo} y ${maximo}.`;
  return null;
}

function imagen(valor) {
  if (valor === null) return null;   // es opcional
  if (valor.length > REGLAS.imagen_url.max) return `No puede superar los ${REGLAS.imagen_url.max} caracteres.`;
  if (!/^(img\/\S+|https:\/\/\S+)$/.test(valor)) {
    return "Escribí una ruta como img/juegos/portada.svg o una dirección que empiece con https://";
  }
  return null;
}

// La de respaldo está en internet: tiene que ser una dirección https completa.
function respaldo(valor) {
  if (valor === null) return null;
  if (valor.length > REGLAS.imagen_url.max) return `No puede superar los ${REGLAS.imagen_url.max} caracteres.`;
  if (!/^https:\/\/\S+$/.test(valor)) return "Tiene que ser una dirección que empiece con https://";
  return null;
}

function agregar(errores, campo, mensaje) {
  if (mensaje) errores[campo] = mensaje;
}

// ----------------------------------------------------------------------
// Videojuego
// ----------------------------------------------------------------------
// datos: el objeto que se va a enviar (ya con números convertidos).
// generos: los valores válidos del Enum, tal como los devolvió la API.
// costoObligatorio: en el alta sí; en la edición se puede dejar vacío para no cambiarlo.
export function validarVideojuego(datos, generos, costoObligatorio = true) {
  const errores = {};
  agregar(errores, "titulo", texto(datos.titulo, REGLAS.titulo.min, REGLAS.titulo.max));
  agregar(errores, "descripcion", texto(datos.descripcion, REGLAS.descripcion.min, REGLAS.descripcion.max));

  if (!generos.includes(datos.genero)) errores.genero = "Elegí un género de la lista.";
  if (!datos.estudio_id) errores.estudio_id = "Elegí un estudio.";

  agregar(errores, "anio_lanzamiento",
    entero(datos.anio_lanzamiento, REGLAS.anio_lanzamiento.min, REGLAS.anio_lanzamiento.max));
  agregar(errores, "stock", entero(datos.stock, REGLAS.stock.min, REGLAS.stock.max));

  if (!(datos.precio > 0)) errores.precio = "El precio tiene que ser mayor que 0.";
  else if (datos.precio > REGLAS.precio.max) errores.precio = `El precio no puede superar ${REGLAS.precio.max}.`;

  // Regla entre dos campos (en la API es un field_validator de schemas.py)
  if (datos.costo_proveedor === undefined) {
    if (costoObligatorio) errores.costo_proveedor = "Indicá el costo del proveedor.";
  } else if (!(datos.costo_proveedor > 0)) {
    errores.costo_proveedor = "El costo tiene que ser mayor que 0.";
  } else if (datos.costo_proveedor >= datos.precio) {
    errores.costo_proveedor = "El costo tiene que ser menor que el precio de venta.";
  }

  agregar(errores, "imagen_url", imagen(datos.imagen_url));
  agregar(errores, "imagen_respaldo_url", respaldo(datos.imagen_respaldo_url));
  return errores;
}

// ----------------------------------------------------------------------
// Estudio y plataforma
// ----------------------------------------------------------------------
export function validarEstudio({ nombre, pais }) {
  const errores = {};
  agregar(errores, "nombre", texto(nombre, REGLAS.estudio.nombreMin, REGLAS.estudio.nombreMax));
  if (pais !== null && pais.length > REGLAS.estudio.paisMax) {
    errores.pais = `No puede superar los ${REGLAS.estudio.paisMax} caracteres.`;
  }
  return errores;
}

export function validarPlataforma({ nombre }) {
  const errores = {};
  agregar(errores, "nombre", texto(nombre, REGLAS.plataforma.nombreMin, REGLAS.plataforma.nombreMax));
  return errores;
}

// ----------------------------------------------------------------------
// Errores que devuelve la API
// ----------------------------------------------------------------------
// FastAPI responde los 422 con una lista: [{ loc: ["body", "precio"], msg, type, ctx }].
// El segundo elemento de loc es el campo. Los mensajes vienen en inglés: se traducen
// los más comunes con type y ctx; el resto se muestra tal cual.
function traducir(error) {
  const ctx = error.ctx ?? {};
  switch (error.type) {
    case "missing": return "Este dato es obligatorio.";
    case "string_too_short": return `Tiene que tener al menos ${ctx.min_length} caracteres.`;
    case "string_too_long": return `No puede superar los ${ctx.max_length} caracteres.`;
    case "greater_than": return `Tiene que ser mayor que ${ctx.gt}.`;
    case "greater_than_equal": return `Tiene que ser ${ctx.ge} o más.`;
    case "less_than_equal": return `Tiene que ser ${ctx.le} o menos.`;
    case "int_parsing":
    case "int_from_float": return "Tiene que ser un número entero.";
    case "float_parsing": return "Tiene que ser un número.";
    case "enum": return "Elegí una opción de la lista.";
    case "value_error": return error.msg.replace(/^Value error, /, "");
    default: return error.msg;
  }
}

// Convierte un ApiError en { campos: { campo: mensaje }, general: texto | null }.
// campoDelConflicto: el campo donde se muestra un 409 (por ejemplo "titulo").
// campoDelNoEncontrado: el campo donde se muestra un 404 (por ejemplo "estudio_id").
export function traducirErrorApi(error, campoDelConflicto = null, campoDelNoEncontrado = null) {
  const campos = {};
  if (error.status === 422 && Array.isArray(error.detail)) {
    for (const item of error.detail) {
      const campo = item.loc?.[1];
      if (campo) campos[campo] = traducir(item);
    }
    return { campos, general: "La API rechazó algunos datos. Revisá los campos marcados." };
  }
  const detail = typeof error.detail === "string" ? error.detail : null;
  if (error.status === 409 && detail) {
    // El 409 del costo (PATCH) va a su campo; el resto, al campo indicado.
    const campo = /costo/i.test(detail) ? "costo_proveedor" : campoDelConflicto;
    if (campo) campos[campo] = detail;
    return { campos, general: campo ? null : detail };
  }
  if (error.status === 404 && detail && campoDelNoEncontrado) {
    campos[campoDelNoEncontrado] = detail;
    return { campos, general: null };
  }
  return { campos, general: detail ?? error.message };
}
