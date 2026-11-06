// catalogo.js - La página principal: tarjetas, filtros y paginado.
//
// Flujo: el usuario cambia algo -> se actualiza "estado" -> cargarCatalogo()
// le pide a la API SOLO la página que se ve -> se dibujan las tarjetas.
// Nunca se filtra un arreglo en el navegador: filtra la API.

import { listarEstudios, listarGeneros, listarPlataformas, listarVideojuegos, obtenerResumen } from "./api.js";
import { mostrarError, mostrarVacio, ocultarEstado } from "./avisos.js";
import "./menu.js";
import { calcularSkip, dibujarPaginacion } from "./paginacion.js";
import { crearTarjeta, crearTarjetaEsqueleto } from "./tarjetas.js";
import { crearBoton, esperarPausa, llenarSelect, nombreGenero } from "./util.js";

const TAMANIO_PAGINA = 12;

// Todo lo que define qué se está viendo. Se refleja en la URL (?pagina=2&genero=RPG)
// para que se pueda recargar o compartir el enlace sin perder los filtros.
const estado = {
  pagina: 1,
  q: "",
  genero: "",
  plataformaId: "",
  estudioId: "",
  soloConStock: false,
};

// Elementos de la página
const grilla = document.querySelector("#grilla");
const estadoLista = document.querySelector("#estado-lista");
const paginacion = document.querySelector("#paginacion");
const resultado = document.querySelector("#resultado");
const formulario = document.querySelector("#filtros");
const chips = document.querySelector("#chips-genero");

// ----------------------------------------------------------------------
// Estado <-> URL
// ----------------------------------------------------------------------
function leerEstadoDeLaUrl() {
  const p = new URLSearchParams(location.search);
  estado.pagina = Math.max(1, Number.parseInt(p.get("pagina"), 10) || 1);
  estado.q = p.get("q") ?? "";
  estado.genero = p.get("genero") ?? "";
  estado.plataformaId = p.get("plataforma") ?? "";
  estado.estudioId = p.get("estudio") ?? "";
  estado.soloConStock = p.get("stock") === "1";
}

function guardarEstadoEnLaUrl() {
  const p = new URLSearchParams();
  if (estado.pagina > 1) p.set("pagina", estado.pagina);
  if (estado.q) p.set("q", estado.q);
  if (estado.genero) p.set("genero", estado.genero);
  if (estado.plataformaId) p.set("plataforma", estado.plataformaId);
  if (estado.estudioId) p.set("estudio", estado.estudioId);
  if (estado.soloConStock) p.set("stock", "1");
  const consulta = p.toString();
  history.replaceState(null, "", consulta ? `?${consulta}` : location.pathname);
}

// ----------------------------------------------------------------------
// Carga del catálogo
// ----------------------------------------------------------------------
function mostrarCargando() {
  ocultarEstado(estadoLista);
  grilla.setAttribute("aria-busy", "true");
  grilla.replaceChildren(...Array.from({ length: 8 }, crearTarjetaEsqueleto));
}

// Cada pedido lleva un número. Si el usuario cambia dos filtros muy rápido, la
// respuesta vieja puede llegar DESPUÉS que la nueva: con el número se descarta.
let ultimoPedido = 0;

async function cargarCatalogo() {
  const numeroDePedido = ++ultimoPedido;
  guardarEstadoEnLaUrl();
  mostrarCargando();
  try {
    const respuesta = await listarVideojuegos({
      q: estado.q,
      genero: estado.genero,
      plataformaId: estado.plataformaId,
      estudioId: estado.estudioId,
      soloConStock: estado.soloConStock,
      skip: calcularSkip(estado.pagina, TAMANIO_PAGINA),
      limit: TAMANIO_PAGINA,
    });
    if (numeroDePedido !== ultimoPedido) return;   // llegó tarde: ya hay un pedido más nuevo
    const { total, items } = respuesta;

    // Si la página pedida ya no existe (por ejemplo, ?pagina=9), se vuelve a la última.
    if (items.length === 0 && total > 0) {
      estado.pagina = Math.ceil(total / TAMANIO_PAGINA);
      return cargarCatalogo();
    }

    grilla.replaceChildren(...items.map(crearTarjeta));
    dibujarPaginacion(paginacion, { total, pagina: estado.pagina, tamanio: TAMANIO_PAGINA, alCambiar: irAPagina });

    if (total === 0) {
      resultado.textContent = "";
      mostrarVacio(estadoLista, "No encontramos juegos", "Probá con otra búsqueda o quitá algún filtro.");
    } else {
      const desde = calcularSkip(estado.pagina, TAMANIO_PAGINA) + 1;
      resultado.textContent = `Mostrando ${desde}–${desde + items.length - 1} de ${total} juegos`;
    }
  } catch (error) {
    if (numeroDePedido !== ultimoPedido) return;
    grilla.replaceChildren();
    paginacion.hidden = true;
    resultado.textContent = "";
    mostrarError(estadoLista, error.message, reintentar);
  } finally {
    grilla.removeAttribute("aria-busy");
  }
}

// "Reintentar": si los filtros tampoco habían cargado, se piden de nuevo.
function reintentar() {
  if (chips.children.length === 0) {
    cargarOpcionesDeFiltro();
    cargarDatosDelHero();
  }
  cargarCatalogo();
}

function irAPagina(numero) {
  estado.pagina = numero;
  cargarCatalogo();
  document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
}

// Cualquier filtro nuevo vuelve a la primera página.
function aplicarFiltros() {
  estado.pagina = 1;
  cargarCatalogo();
}

// ----------------------------------------------------------------------
// Filtros: chips de género y formulario
// ----------------------------------------------------------------------
function dibujarChips(generos) {
  const opciones = [{ valor: "", texto: "Todos" }, ...generos.map((g) => ({ valor: g, texto: nombreGenero(g) }))];
  chips.replaceChildren(...opciones.map(({ valor, texto }) => {
    const chip = crearBoton(texto, "chip", () => {
      estado.genero = valor;
      for (const otro of chips.children) otro.setAttribute("aria-pressed", String(otro === chip));
      aplicarFiltros();
    });
    chip.setAttribute("aria-pressed", String(valor === estado.genero));
    return chip;
  }));
}

async function cargarOpcionesDeFiltro() {
  try {
    const [generos, plataformas, estudios] = await Promise.all([
      listarGeneros(), listarPlataformas(), listarEstudios(),
    ]);
    dibujarChips(generos);
    llenarSelect(formulario.plataforma, plataformas, (p) => p.id, (p) => p.nombre);
    llenarSelect(formulario.estudio, estudios, (e) => e.id, (e) => e.nombre);
    formulario.plataforma.value = estado.plataformaId;
    formulario.estudio.value = estado.estudioId;
  } catch {
    // Si falla, el catálogo muestra su propio error con "Reintentar".
  }
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();   // la búsqueda no recarga la página
  estado.q = formulario.q.value.trim();
  aplicarFiltros();
});

// Buscar mientras se escribe, con una pausa para no pedir una vez por tecla.
formulario.q.addEventListener("input", esperarPausa(() => {
  estado.q = formulario.q.value.trim();
  aplicarFiltros();
}));

formulario.plataforma.addEventListener("change", () => {
  estado.plataformaId = formulario.plataforma.value;
  aplicarFiltros();
});

formulario.estudio.addEventListener("change", () => {
  estado.estudioId = formulario.estudio.value;
  aplicarFiltros();
});

formulario.stock.addEventListener("change", () => {
  estado.soloConStock = formulario.stock.checked;
  aplicarFiltros();
});

// ----------------------------------------------------------------------
// Números del hero (los trae /videojuegos/resumen)
// ----------------------------------------------------------------------
async function cargarDatosDelHero() {
  try {
    const [resumen, plataformas, estudios] = await Promise.all([
      obtenerResumen(), listarPlataformas(), listarEstudios(),
    ]);
    document.querySelector("#dato-juegos").textContent = resumen.total_activos;
    document.querySelector("#dato-plataformas").textContent = plataformas.length;
    document.querySelector("#dato-estudios").textContent = estudios.length;
  } catch {
    // Sin API, el hero queda con los guiones del HTML.
  }
}

// ----------------------------------------------------------------------
// Inicio
// ----------------------------------------------------------------------
leerEstadoDeLaUrl();
formulario.q.value = estado.q;
formulario.stock.checked = estado.soloConStock;
cargarOpcionesDeFiltro();
cargarDatosDelHero();
cargarCatalogo();
