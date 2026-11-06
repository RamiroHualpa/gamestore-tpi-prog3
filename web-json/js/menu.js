// menu.js - El menú desplegable del celular. Lo importan todas las páginas.
// En pantallas anchas el botón no se ve (ver la sección 7 de estilos.css).

const boton = document.querySelector(".navbar-toggle");
const menu = document.querySelector(".navbar-menu");

boton.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  boton.setAttribute("aria-expanded", String(abierto));
  boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});

// El año del pie de página se completa solo
const anio = document.querySelector("#anio-actual");
if (anio) anio.textContent = new Date().getFullYear();
