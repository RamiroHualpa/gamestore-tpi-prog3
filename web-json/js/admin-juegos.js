// admin-juegos.js - Administración de videojuegos: tabla paginada, alta, edición y baja.
//
// Lo central de esta página es el OBJETO que viaja:
//
//   Alta      POST  /videojuegos/       envía VideojuegoCreate  -> recibe VideojuegoPublic
//   Edición   PATCH /videojuegos/{id}   envía solo lo que cambió -> recibe VideojuegoPublic
//
// VideojuegoCreate trae costo_proveedor; VideojuegoPublic NO lo devuelve (es un dato interno).
// Por eso, al editar, el costo aparece vacío: la web nunca lo recibió.
// Al final de la página, el panel "Último envío" muestra los dos JSON.

import {
  actualizarVideojuego, asociarPlataforma, crearVideojuego, darDeBajaVideojuego, listarEstudios,
  listarGeneros, listarPlataformas, listarVideojuegos, obtenerResumen, obtenerVideojuego, quitarPlataforma,
} from "./api.js";
import {
  crearFilaMensaje, limpiarErrores, mostrarAlerta, mostrarErrores, mostrarToast, ocultarAlerta,
} from "./avisos.js";
import { cerrarAlTocarFondo, confirmar } from "./dialogos.js";
import "./menu.js";
import { calcularSkip, dibujarPaginacion } from "./paginacion.js";
import { crearBoton, crearElemento, crearImagenJuego, esperarPausa, formatearPrecio, llenarSelect, nombreGenero } from "./util.js";
import { REGLAS, traducirErrorApi, validarVideojuego } from "./validaciones.js";

const TAMANIO_PAGINA = 10;
const COLUMNAS = 9;

const estado = {
  pagina: 1,
  q: "",
  cantidadEnPantalla: 0,
  idResaltado: null,       // la fila recién guardada se resalta
  juegoEditando: null,     // null = alta; un objeto = edición
};

// Listas que se cargan una vez desde la API
let generos = [];
let plataformas = [];

// Elementos
const cuerpoTabla = document.querySelector("#cuerpo-tabla");
const paginacion = document.querySelector("#paginacion");
const buscador = document.querySelector("#buscador");
const modal = document.querySelector("#modal-juego");
const formulario = document.querySelector("#form-juego");
const alertaFormulario = document.querySelector("#alerta-formulario");
const botonGuardar = document.querySelector("#boton-guardar");
const vistaPrevia = document.querySelector("#vista-previa");
const contador = document.querySelector("#contador-descripcion");

// ======================================================================
// Resumen (tarjetas de métricas)
// ======================================================================
async function cargarResumen() {
  try {
    const resumen = await obtenerResumen();
    document.querySelector("#metrica-activos").textContent = resumen.total_activos;
    document.querySelector("#metrica-unidades").textContent = resumen.unidades_en_stock;
    document.querySelector("#metrica-sin-stock").textContent = resumen.sin_stock;
    document.querySelector("#metrica-generos").textContent = Object.keys(resumen.por_genero).length;
  } catch {
    // Si la API no responde, la tabla ya muestra el error con "Reintentar".
  }
}

// ======================================================================
// Tabla paginada
// ======================================================================
function crearFila(juego) {
  const fila = document.createElement("tr");
  if (juego.id === estado.idResaltado) fila.classList.add("fila-resaltada");

  const miniatura = crearElemento("div", "tabla-miniatura");
  miniatura.append(crearImagenJuego(juego, 44, 66));

  const enlace = crearElemento("a", "", juego.titulo);
  enlace.href = `juego.html?id=${juego.id}`;

  const celdaPlataformas = document.createElement("td");
  const lista = crearElemento("ul", "lista-insignias");
  for (const plataforma of juego.plataformas) lista.append(crearElemento("li", "insignia", plataforma.nombre));
  celdaPlataformas.append(lista);

  const stock = crearElemento("span", juego.stock === 0 ? "insignia insignia-peligro" : "insignia insignia-exito",
    juego.stock === 0 ? "Sin stock" : String(juego.stock));

  const acciones = crearElemento("div", "tabla-acciones");
  acciones.append(
    crearBoton("Editar", "btn btn-contorno btn-chico", () => abrirEdicion(juego)),
    crearBoton("Dar de baja", "btn btn-peligro btn-chico", () => darDeBaja(juego))
  );

  const celdas = [
    crearElemento("td", "numero", juego.id),
    crearElemento("td"),
    crearElemento("td"),
    crearElemento("td", "", nombreGenero(juego.genero)),
    crearElemento("td", "", juego.estudio.nombre),
    celdaPlataformas,
    crearElemento("td", "numero", formatearPrecio(juego.precio)),
    crearElemento("td", "numero"),
    crearElemento("td"),
  ];
  celdas[1].append(miniatura);
  celdas[2].append(enlace);
  celdas[7].append(stock);
  celdas[8].append(acciones);
  fila.append(...celdas);
  return fila;
}

// Número del último pedido: una respuesta que llega tarde se descarta (ver catalogo.js).
let ultimoPedido = 0;

async function cargarTabla() {
  const numeroDePedido = ++ultimoPedido;
  cuerpoTabla.replaceChildren(crearFilaMensaje(COLUMNAS, "Cargando videojuegos…"));
  try {
    const respuesta = await listarVideojuegos({
      q: estado.q,
      skip: calcularSkip(estado.pagina, TAMANIO_PAGINA),
      limit: TAMANIO_PAGINA,
    });
    if (numeroDePedido !== ultimoPedido) return;
    const { total, items } = respuesta;

    // Página que ya no existe (por ejemplo, después de una baja): se va a la última.
    if (items.length === 0 && total > 0) {
      estado.pagina = Math.ceil(total / TAMANIO_PAGINA);
      return cargarTabla();
    }

    estado.cantidadEnPantalla = items.length;
    cuerpoTabla.replaceChildren(...(items.length > 0
      ? items.map(crearFila)
      : [crearFilaMensaje(COLUMNAS, "No hay videojuegos que coincidan con la búsqueda.")]));
    dibujarPaginacion(paginacion, {
      total, pagina: estado.pagina, tamanio: TAMANIO_PAGINA,
      alCambiar: (pagina) => { estado.pagina = pagina; cargarTabla(); },
    });
  } catch (error) {
    if (numeroDePedido !== ultimoPedido) return;
    paginacion.hidden = true;
    cuerpoTabla.replaceChildren(crearFilaMensaje(COLUMNAS, error.message, () => {
      cargarListas();
      cargarResumen();
      cargarTabla();
    }));
  }
}

buscador.addEventListener("submit", (evento) => evento.preventDefault());
buscador.q.addEventListener("input", esperarPausa(() => {
  estado.q = buscador.q.value.trim();
  estado.pagina = 1;
  cargarTabla();
}));

// ======================================================================
// Listas del formulario: géneros, estudios y plataformas (desde la API)
// ======================================================================
function dibujarCasillasDePlataforma() {
  const grupo = document.querySelector("#casillas-plataformas");
  const leyenda = grupo.querySelector("legend");
  grupo.replaceChildren(leyenda, ...plataformas.map((plataforma) => {
    const etiqueta = crearElemento("label", "form-check");
    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.name = "plataformas";
    casilla.value = plataforma.id;
    etiqueta.append(casilla, ` ${plataforma.nombre}`);
    return etiqueta;
  }));
}

async function cargarListas() {
  try {
    const [listaGeneros, estudios, listaPlataformas] = await Promise.all([
      listarGeneros(), listarEstudios(), listarPlataformas(),
    ]);
    generos = listaGeneros;
    plataformas = listaPlataformas;
    llenarSelect(formulario.genero, generos, (g) => g, nombreGenero);
    llenarSelect(formulario.estudio_id, estudios, (e) => e.id, (e) => e.nombre);
    dibujarCasillasDePlataforma();
  } catch {
    // Sin listas no se puede cargar un juego: el botón "Nuevo" avisa.
  }
}

// ======================================================================
// Formulario: leer, mostrar y validar
// ======================================================================
// Convierte lo que hay en el formulario en el objeto que espera la API.
// Los <input type="number"> devuelven TEXTO: hay que pasarlos a número.
function leerFormulario() {
  const costo = formulario.costo_proveedor.value.trim();
  return {
    datos: {
      titulo: formulario.titulo.value.trim(),
      descripcion: formulario.descripcion.value.trim(),
      genero: formulario.genero.value,
      anio_lanzamiento: Number(formulario.anio_lanzamiento.value),
      precio: Number(formulario.precio.value),
      stock: Number(formulario.stock.value),
      imagen_url: formulario.imagen_url.value.trim() || null,
      imagen_respaldo_url: formulario.imagen_respaldo_url.value.trim() || null,
      estudio_id: Number(formulario.estudio_id.value),
      // En la edición, vacío = no se cambia: la propiedad ni siquiera se envía.
      ...(costo === "" ? {} : { costo_proveedor: Number(costo) }),
    },
    plataformaIds: [...formulario.querySelectorAll('[name="plataformas"]:checked')].map((c) => Number(c.value)),
  };
}

// La vista previa usa la misma lógica que el catálogo: propia, después respaldo.
function actualizarVistaPrevia() {
  vistaPrevia.replaceChildren(crearImagenJuego({
    imagen_url: formulario.imagen_url.value.trim() || null,
    imagen_respaldo_url: formulario.imagen_respaldo_url.value.trim() || null,
    titulo: "vista previa",
  }, 96, 144));
}

function actualizarContador() {
  contador.textContent = `${formulario.descripcion.value.trim().length} / ${REGLAS.descripcion.max}`;
}

formulario.imagen_url.addEventListener("input", esperarPausa(actualizarVistaPrevia, 400));
formulario.imagen_respaldo_url.addEventListener("input", esperarPausa(actualizarVistaPrevia, 400));
formulario.descripcion.addEventListener("input", actualizarContador);

function prepararFormulario(titulo, textoBoton) {
  formulario.reset();
  limpiarErrores(formulario);
  ocultarAlerta(alertaFormulario);
  document.querySelector("#titulo-modal").textContent = titulo;
  botonGuardar.textContent = textoBoton;
}

function abrirAlta() {
  if (generos.length === 0) {
    mostrarToast("Todavía no se cargaron los géneros y estudios. Revisá que la API esté encendida.", "error");
    cargarListas();
    return;
  }
  estado.juegoEditando = null;
  prepararFormulario("Nuevo videojuego", "Crear videojuego");
  formulario.costo_proveedor.required = true;
  formulario.costo_proveedor.placeholder = "Por ejemplo, 25000";
  document.querySelector("#ayuda-costo").textContent = "Dato interno: se envía y se guarda, pero la API nunca lo devuelve.";
  actualizarVistaPrevia();
  actualizarContador();
  modal.showModal();
  formulario.titulo.focus();
}

function abrirEdicion(juego) {
  estado.juegoEditando = juego;
  prepararFormulario(`Editar «${juego.titulo}»`, "Guardar cambios");
  formulario.titulo.value = juego.titulo;
  formulario.descripcion.value = juego.descripcion;
  formulario.genero.value = juego.genero;
  formulario.anio_lanzamiento.value = juego.anio_lanzamiento;
  formulario.estudio_id.value = juego.estudio_id;
  formulario.precio.value = juego.precio;
  formulario.stock.value = juego.stock;
  formulario.imagen_url.value = juego.imagen_url ?? "";
  formulario.imagen_respaldo_url.value = juego.imagen_respaldo_url ?? "";
  const ids = juego.plataformas.map((p) => p.id);
  for (const casilla of formulario.querySelectorAll('[name="plataformas"]')) {
    casilla.checked = ids.includes(Number(casilla.value));
  }
  // VideojuegoPublic no trae el costo: se deja vacío y es opcional.
  formulario.costo_proveedor.required = false;
  formulario.costo_proveedor.placeholder = "Sin cambios";
  document.querySelector("#ayuda-costo").textContent = "La API no devuelve el costo. Dejalo vacío para conservar el actual.";
  actualizarVistaPrevia();
  actualizarContador();
  modal.showModal();
}

// Compara el formulario con el juego original y devuelve SOLO lo que cambió (para el PATCH).
function calcularCambios(datos, original) {
  const cambios = {};
  for (const [campo, valor] of Object.entries(datos)) {
    if (campo === "costo_proveedor" || valor !== original[campo]) cambios[campo] = valor;
  }
  return cambios;
}

// ======================================================================
// Guardar (alta o edición)
// ======================================================================
function mostrarJson(metodo, ruta, enviado, recibido) {
  document.querySelector("#json-ruta").textContent = `${metodo} ${ruta}`;
  document.querySelector("#json-enviado").textContent = JSON.stringify(enviado, null, 2);
  document.querySelector("#json-recibido").textContent = JSON.stringify(recibido, null, 2);
  const panel = document.querySelector("#panel-json");
  panel.hidden = false;
  panel.open = true;
}

async function guardarAlta(datos, plataformaIds) {
  const creado = await crearVideojuego(datos);
  // Las plataformas se asocian después, con su propio endpoint (relación N a N).
  // Promise.all manda los pedidos a la vez y espera a que terminen todos.
  if (plataformaIds.length > 0) {
    await Promise.all(plataformaIds.map((plataformaId) => asociarPlataforma(creado.id, plataformaId)));
  }
  const final = plataformaIds.length > 0 ? await obtenerVideojuego(creado.id) : creado;
  mostrarJson("POST", "/videojuegos/", datos, final);
  mostrarToast(`Se creó «${final.titulo}» con el id ${final.id}.`, "exito");
  estado.idResaltado = final.id;
  estado.q = "";
  buscador.q.value = "";
  estado.pagina = Number.MAX_SAFE_INTEGER;   // cargarTabla lo lleva a la última página, donde quedó el nuevo
}

async function guardarEdicion(datos, plataformaIds) {
  const original = estado.juegoEditando;
  const cambios = calcularCambios(datos, original);
  const idsOriginales = original.plataformas.map((p) => p.id);
  const agregar = plataformaIds.filter((id) => !idsOriginales.includes(id));
  const quitar = idsOriginales.filter((id) => !plataformaIds.includes(id));

  if (Object.keys(cambios).length === 0 && agregar.length === 0 && quitar.length === 0) {
    mostrarToast("No hay cambios para guardar.", "info");
    return;
  }
  if (Object.keys(cambios).length > 0) await actualizarVideojuego(original.id, cambios);
  await Promise.all([
    ...agregar.map((id) => asociarPlataforma(original.id, id)),
    ...quitar.map((id) => quitarPlataforma(original.id, id)),
  ]);
  const final = await obtenerVideojuego(original.id);
  mostrarJson("PATCH", `/videojuegos/${original.id}`, cambios, final);
  mostrarToast(`Se guardaron los cambios de «${final.titulo}».`, "exito");
  estado.idResaltado = final.id;
}

// El evento "submit" solo llega si el NAVEGADOR ya aprobó el formulario
// (required, minlength, min, max...). Acá se valida lo que HTML no puede:
// textos de solo espacios, el costo menor que el precio, la forma de la imagen.
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limpiarErrores(formulario);
  ocultarAlerta(alertaFormulario);

  const { datos, plataformaIds } = leerFormulario();
  const errores = validarVideojuego(datos, generos, estado.juegoEditando === null);
  if (Object.keys(errores).length > 0) {
    mostrarErrores(formulario, errores);
    mostrarAlerta(alertaFormulario, "Revisá los campos marcados: el pedido no se envió.");
    return;
  }

  botonGuardar.disabled = true;
  const textoBoton = botonGuardar.textContent;
  botonGuardar.textContent = "Guardando…";
  try {
    if (estado.juegoEditando === null) await guardarAlta(datos, plataformaIds);
    else await guardarEdicion(datos, plataformaIds);
    modal.close();
    cargarTabla();
    cargarResumen();
  } catch (error) {
    // La API rechazó el pedido: cada mensaje va a su campo y el resto a la alerta.
    const { campos, general } = traducirErrorApi(error, "titulo", "estudio_id");
    const sinLugar = mostrarErrores(formulario, campos);
    const texto = [general, ...sinLugar].filter(Boolean).join(" ");
    mostrarAlerta(alertaFormulario, texto || "La API rechazó el pedido. Revisá los campos marcados.");
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.textContent = textoBoton;
  }
});

document.querySelector("#boton-nuevo").addEventListener("click", abrirAlta);
document.querySelector("#boton-cancelar").addEventListener("click", () => modal.close());
document.querySelector("#boton-cerrar").addEventListener("click", () => modal.close());
cerrarAlTocarFondo(modal);

// ======================================================================
// Baja lógica
// ======================================================================
async function darDeBaja(juego) {
  const confirmado = await confirmar({
    titulo: "Dar de baja",
    mensaje: `«${juego.titulo}» deja de aparecer en el catálogo. Queda guardado en la base con activo = false.`,
    textoConfirmar: "Dar de baja",
  });
  if (!confirmado) return;

  try {
    const respuesta = await darDeBajaVideojuego(juego.id);
    mostrarJson("DELETE", `/videojuegos/${juego.id}`, null, respuesta);
    mostrarToast(`«${juego.titulo}» se dio de baja.`, "exito");
    // Si era el único de la página, se vuelve a la anterior.
    if (estado.cantidadEnPantalla === 1 && estado.pagina > 1) estado.pagina -= 1;
    cargarTabla();
    cargarResumen();
  } catch (error) {
    mostrarToast(error.detail ?? error.message, "error");
  }
}

// ======================================================================
// Inicio
// ======================================================================
cargarListas();
cargarResumen();
cargarTabla();
