// avisos.js - Todo lo que le muestra mensajes al usuario, sin las ventanas emergentes del navegador:
//   - toasts: avisos flotantes que se van solos
//   - alertas: un mensaje fijo dentro de la página o del formulario
//   - errores de campo: el mensaje debajo de cada control
//   - estados de una lista: cargando, error con "Reintentar" y vacío

import { crearBoton, crearElemento } from "./util.js";

// ----------------------------------------------------------------------
// Toasts
// ----------------------------------------------------------------------
// tipo: "exito" | "error" | "info"
export function mostrarToast(texto, tipo = "info") {
  const contenedor = document.querySelector("#toasts");
  const toast = crearElemento("div", `toast toast-${tipo}`, texto);
  toast.setAttribute("role", tipo === "error" ? "alert" : "status");
  contenedor.append(toast);

  // A los 4 segundos se le suma la clase "saliendo" (animación de 300 ms) y después se quita.
  setTimeout(() => {
    toast.classList.add("saliendo");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ----------------------------------------------------------------------
// Alertas dentro de la página
// ----------------------------------------------------------------------
export function mostrarAlerta(contenedor, texto, tipo = "error") {
  contenedor.className = `alerta alerta-${tipo}`;
  contenedor.setAttribute("role", tipo === "error" ? "alert" : "status");
  contenedor.textContent = texto;
  contenedor.hidden = false;
}

export function ocultarAlerta(contenedor) {
  contenedor.hidden = true;
  contenedor.textContent = "";
}

// ----------------------------------------------------------------------
// Errores de cada campo
// ----------------------------------------------------------------------
// En el HTML, debajo de cada control hay un <p class="form-error" data-error-de="titulo" hidden>.
export function mostrarErrorCampo(formulario, campo, texto) {
  const mensaje = formulario.querySelector(`[data-error-de="${campo}"]`);
  if (!mensaje) return false;
  mensaje.textContent = texto;
  mensaje.hidden = false;

  const control = formulario.elements[campo];
  if (control instanceof HTMLElement) {
    control.classList.add("invalido");
    control.setAttribute("aria-invalid", "true");
  }
  return true;
}

export function limpiarErrores(formulario) {
  for (const mensaje of formulario.querySelectorAll("[data-error-de]")) {
    mensaje.hidden = true;
    mensaje.textContent = "";
  }
  for (const control of formulario.querySelectorAll(".invalido")) {
    control.classList.remove("invalido");
    control.removeAttribute("aria-invalid");
  }
}

// Muestra un objeto { campo: mensaje } y lleva el foco al primer campo con error.
export function mostrarErrores(formulario, errores) {
  const sinLugar = [];
  for (const [campo, texto] of Object.entries(errores)) {
    if (!mostrarErrorCampo(formulario, campo, texto)) sinLugar.push(texto);
  }
  formulario.querySelector(".invalido")?.focus();
  return sinLugar;   // los mensajes que no tenían un campo donde ir
}

// ----------------------------------------------------------------------
// Estados de una lista
// ----------------------------------------------------------------------
function armarEstado(contenedor, clase, icono, titulo, texto) {
  contenedor.className = `estado ${clase}`;
  contenedor.replaceChildren(
    crearElemento("span", "estado-icono", icono),
    crearElemento("h3", "estado-titulo", titulo),
    crearElemento("p", "estado-texto", texto)
  );
  contenedor.hidden = false;
}

export function mostrarVacio(contenedor, titulo, texto) {
  armarEstado(contenedor, "", "🕹️", titulo, texto);
}

export function mostrarError(contenedor, texto, alReintentar) {
  armarEstado(contenedor, "estado-error", "⚠️", "No se pudieron cargar los datos", texto);
  contenedor.append(crearBoton("Reintentar", "btn btn-primario", alReintentar));
}

export function ocultarEstado(contenedor) {
  contenedor.hidden = true;
  contenedor.replaceChildren();
}

// Fila de una tabla con un mensaje que ocupa todas las columnas.
export function crearFilaMensaje(columnas, texto, alReintentar = null) {
  const fila = document.createElement("tr");
  const celda = crearElemento("td", "tabla-mensaje", texto);
  celda.colSpan = columnas;
  if (alReintentar) {
    celda.append(" ", crearBoton("Reintentar", "btn btn-primario btn-chico", alReintentar));
  }
  fila.append(celda);
  return fila;
}
