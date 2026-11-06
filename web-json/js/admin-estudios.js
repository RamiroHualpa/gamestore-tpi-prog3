// admin-estudios.js - Estudios (alta, edición con PUT y baja lógica) y plataformas (alta y borrado).
//
//   Estudio:     POST /estudios/  y  PUT /estudios/{id}   envían { nombre, pais }
//   Plataforma:  POST /plataformas/                         envía { nombre }
//
// Los conflictos (nombre repetido, estudio con juegos, plataforma en uso) llegan
// como 409 con un "detail" que se muestra tal cual.

import {
  crearEstudio, crearPlataforma, darDeBajaEstudio, eliminarPlataforma, listarEstudios, listarPlataformas,
  reemplazarEstudio,
} from "./api.js";
import {
  crearFilaMensaje, limpiarErrores, mostrarAlerta, mostrarErrores, mostrarToast, ocultarAlerta,
} from "./avisos.js";
import { confirmar } from "./dialogos.js";
import "./menu.js";
import { crearBoton, crearElemento } from "./util.js";
import { traducirErrorApi, validarEstudio, validarPlataforma } from "./validaciones.js";

// ======================================================================
// ESTUDIOS
// ======================================================================
const formEstudio = document.querySelector("#form-estudio");
const alertaEstudio = document.querySelector("#alerta-estudio");
const cuerpoEstudios = document.querySelector("#cuerpo-estudios");
const botonEstudio = document.querySelector("#boton-estudio");
const botonCancelarEdicion = document.querySelector("#cancelar-edicion");
let estudioEditando = null;

function filaEstudio(estudio) {
  const fila = document.createElement("tr");
  const acciones = crearElemento("div", "tabla-acciones");
  acciones.append(
    crearBoton("Editar", "btn btn-contorno btn-chico", () => editarEstudio(estudio)),
    crearBoton("Dar de baja", "btn btn-peligro btn-chico", () => bajaEstudio(estudio))
  );
  const celdaAcciones = document.createElement("td");
  celdaAcciones.append(acciones);
  fila.append(
    crearElemento("td", "", estudio.nombre),
    crearElemento("td", "", estudio.pais ?? "—"),
    celdaAcciones
  );
  return fila;
}

async function cargarEstudios() {
  cuerpoEstudios.replaceChildren(crearFilaMensaje(3, "Cargando estudios…"));
  try {
    const estudios = await listarEstudios();
    cuerpoEstudios.replaceChildren(...(estudios.length > 0
      ? estudios.map(filaEstudio)
      : [crearFilaMensaje(3, "Todavía no hay estudios.")]));
  } catch (error) {
    cuerpoEstudios.replaceChildren(crearFilaMensaje(3, error.message, cargarEstudios));
  }
}

function salirDeEdicion() {
  estudioEditando = null;
  formEstudio.reset();
  limpiarErrores(formEstudio);
  ocultarAlerta(alertaEstudio);
  document.querySelector("#titulo-form-estudio").textContent = "Agregar estudio";
  botonEstudio.textContent = "Agregar estudio";
  botonCancelarEdicion.hidden = true;
}

function editarEstudio(estudio) {
  salirDeEdicion();
  estudioEditando = estudio;
  formEstudio.nombre.value = estudio.nombre;
  formEstudio.pais.value = estudio.pais ?? "";
  document.querySelector("#titulo-form-estudio").textContent = `Editar «${estudio.nombre}»`;
  botonEstudio.textContent = "Guardar cambios";
  botonCancelarEdicion.hidden = false;
  formEstudio.nombre.focus();
}

formEstudio.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limpiarErrores(formEstudio);
  ocultarAlerta(alertaEstudio);

  // PUT reemplaza el recurso completo: se envían los dos campos siempre.
  const datos = { nombre: formEstudio.nombre.value.trim(), pais: formEstudio.pais.value.trim() || null };
  const errores = validarEstudio(datos);
  if (Object.keys(errores).length > 0) {
    mostrarErrores(formEstudio, errores);
    return;
  }

  try {
    if (estudioEditando) {
      await reemplazarEstudio(estudioEditando.id, datos);
      mostrarToast(`Se actualizó el estudio «${datos.nombre}».`, "exito");
    } else {
      await crearEstudio(datos);
      mostrarToast(`Se agregó el estudio «${datos.nombre}».`, "exito");
    }
    salirDeEdicion();
    cargarEstudios();
  } catch (error) {
    const { campos, general } = traducirErrorApi(error, "nombre");
    mostrarErrores(formEstudio, campos);
    if (general) mostrarAlerta(alertaEstudio, general);
  }
});

botonCancelarEdicion.addEventListener("click", salirDeEdicion);

async function bajaEstudio(estudio) {
  const confirmado = await confirmar({
    titulo: "Dar de baja el estudio",
    mensaje: `«${estudio.nombre}» deja de aparecer en las listas. Solo se puede si no tiene juegos activos.`,
    textoConfirmar: "Dar de baja",
  });
  if (!confirmado) return;
  try {
    await darDeBajaEstudio(estudio.id);
    mostrarToast(`«${estudio.nombre}» se dio de baja.`, "exito");
    if (estudioEditando?.id === estudio.id) salirDeEdicion();
    cargarEstudios();
  } catch (error) {
    // Por ejemplo: 409 "El estudio 'Nintendo' tiene 7 videojuego(s) activos..."
    mostrarAlerta(alertaEstudio, error.detail ?? error.message);
  }
}

// ======================================================================
// PLATAFORMAS
// ======================================================================
const formPlataforma = document.querySelector("#form-plataforma");
const alertaPlataforma = document.querySelector("#alerta-plataforma");
const cuerpoPlataformas = document.querySelector("#cuerpo-plataformas");

function filaPlataforma(plataforma) {
  const fila = document.createElement("tr");
  const celdaAcciones = document.createElement("td");
  const acciones = crearElemento("div", "tabla-acciones");
  acciones.append(crearBoton("Eliminar", "btn btn-peligro btn-chico", () => borrarPlataforma(plataforma)));
  celdaAcciones.append(acciones);
  fila.append(crearElemento("td", "", plataforma.nombre), celdaAcciones);
  return fila;
}

async function cargarPlataformas() {
  cuerpoPlataformas.replaceChildren(crearFilaMensaje(2, "Cargando plataformas…"));
  try {
    const plataformas = await listarPlataformas();
    cuerpoPlataformas.replaceChildren(...(plataformas.length > 0
      ? plataformas.map(filaPlataforma)
      : [crearFilaMensaje(2, "Todavía no hay plataformas.")]));
  } catch (error) {
    cuerpoPlataformas.replaceChildren(crearFilaMensaje(2, error.message, cargarPlataformas));
  }
}

formPlataforma.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limpiarErrores(formPlataforma);
  ocultarAlerta(alertaPlataforma);

  const datos = { nombre: formPlataforma.nombre.value.trim() };
  const errores = validarPlataforma(datos);
  if (Object.keys(errores).length > 0) {
    mostrarErrores(formPlataforma, errores);
    return;
  }
  try {
    await crearPlataforma(datos);
    mostrarToast(`Se agregó la plataforma «${datos.nombre}».`, "exito");
    formPlataforma.reset();
    cargarPlataformas();
  } catch (error) {
    const { campos, general } = traducirErrorApi(error, "nombre");
    mostrarErrores(formPlataforma, campos);
    if (general) mostrarAlerta(alertaPlataforma, general);
  }
});

async function borrarPlataforma(plataforma) {
  const confirmado = await confirmar({
    titulo: "Eliminar plataforma",
    mensaje: `«${plataforma.nombre}» se borra de la base. Solo se puede si ningún juego la usa.`,
    textoConfirmar: "Eliminar",
  });
  if (!confirmado) return;
  try {
    await eliminarPlataforma(plataforma.id);   // 204: sin cuerpo
    mostrarToast(`Se eliminó «${plataforma.nombre}».`, "exito");
    cargarPlataformas();
  } catch (error) {
    mostrarAlerta(alertaPlataforma, error.detail ?? error.message);
  }
}

// ======================================================================
// Inicio
// ======================================================================
cargarEstudios();
cargarPlataformas();
