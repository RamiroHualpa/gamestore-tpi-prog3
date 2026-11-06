// detalle.js - La página de un juego: juego.html?id=10
//
// Lee el id de la URL, le pide el juego a la API y completa la página.
// También actualiza el <title>, la descripción y los datos estructurados:
// así cada juego tiene su propia ficha para los buscadores.

import { listarVideojuegos, obtenerVideojuego } from "./api.js";
import { mostrarError, mostrarVacio, ocultarEstado } from "./avisos.js";
import "./menu.js";
import { crearTarjeta } from "./tarjetas.js";
import { crearElemento, crearImagenJuego, formatearPrecio, nombreGenero } from "./util.js";

const contenedor = document.querySelector("#detalle");
const estadoDetalle = document.querySelector("#estado-detalle");
const migaActual = document.querySelector("#miga-actual");
const relacionados = document.querySelector("#relacionados");

const id = Number.parseInt(new URLSearchParams(location.search).get("id"), 10);

// ----------------------------------------------------------------------
// SEO de la página: título, descripción y datos estructurados del juego
// ----------------------------------------------------------------------
function actualizarSeo(juego) {
  document.title = `${juego.titulo} | GameStore`;
  document.querySelector('meta[name="description"]').content = juego.descripcion;
  document.querySelector('link[rel="canonical"]').href = `https://ramirohualpa.github.io/gamestore-tpi-prog3/web-json/juego.html?id=${juego.id}`;

  // JSON-LD del tipo VideoGame. Se escribe con textContent: es texto, no HTML.
  const datos = document.createElement("script");
  datos.type = "application/ld+json";
  datos.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: juego.titulo,
    description: juego.descripcion,
    genre: nombreGenero(juego.genero),
    gamePlatform: juego.plataformas.map((p) => p.nombre),
    publisher: { "@type": "Organization", name: juego.estudio.nombre },
    datePublished: String(juego.anio_lanzamiento),
    offers: {
      "@type": "Offer",
      price: juego.precio,
      priceCurrency: "ARS",
      availability: juego.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  });
  document.head.append(datos);
}

// ----------------------------------------------------------------------
// Ficha del juego
// ----------------------------------------------------------------------
// Devuelve el par <dt> (término) y <dd> (valor) de la ficha técnica.
function filaFicha(termino, valor) {
  return [crearElemento("dt", "", termino), crearElemento("dd", "", valor)];
}

function dibujarDetalle(juego) {
  const portada = crearElemento("figure", "detalle-portada");
  portada.append(crearImagenJuego(juego, 380, 570));

  const info = crearElemento("div");
  const insignias = crearElemento("ul", "lista-insignias");
  insignias.append(crearElemento("li", "insignia insignia-primario", nombreGenero(juego.genero)));
  insignias.append(juego.stock > 0
    ? crearElemento("li", "insignia insignia-exito", `${juego.stock} en stock`)
    : crearElemento("li", "insignia insignia-peligro", "Sin stock"));

  const precio = crearElemento("data", "detalle-precio", formatearPrecio(juego.precio));
  precio.value = juego.precio;

  const ficha = crearElemento("dl", "ficha");
  ficha.append(
    ...filaFicha("Estudio", juego.estudio.nombre),
    ...filaFicha("País", juego.estudio.pais ?? "Sin dato"),
    ...filaFicha("Lanzamiento", juego.anio_lanzamiento),
    ...filaFicha("Género", nombreGenero(juego.genero)),
    ...filaFicha("Plataformas", juego.plataformas.map((p) => p.nombre).join(", ") || "Sin plataformas")
  );

  const volver = crearElemento("a", "btn btn-contorno", "← Volver al catálogo");
  volver.href = "index.html#catalogo";

  info.append(
    insignias,
    crearElemento("h1", "mt-1", juego.titulo),
    crearElemento("p", "detalle-descripcion", juego.descripcion),
    precio,
    ficha,
    volver
  );

  contenedor.replaceChildren(portada, info);
  contenedor.hidden = false;
}

// "Más de este estudio": otros juegos del mismo estudio (pedido filtrado a la API)
async function cargarRelacionados(juego) {
  try {
    const { items } = await listarVideojuegos({ estudioId: juego.estudio_id, limit: 5 });
    const otros = items.filter((otro) => otro.id !== juego.id).slice(0, 4);
    if (otros.length === 0) return;
    document.querySelector("#titulo-relacionados").textContent = `Más de ${juego.estudio.nombre}`;
    document.querySelector("#grilla-relacionados").replaceChildren(...otros.map(crearTarjeta));
    relacionados.hidden = false;
  } catch {
    // Es un agregado: si falla, la ficha principal ya está en pantalla.
  }
}

async function cargarDetalle() {
  ocultarEstado(estadoDetalle);
  if (!Number.isInteger(id) || id < 1) {
    mostrarVacio(estadoDetalle, "Falta el juego", "La dirección tiene que terminar en ?id= y un número.");
    return;
  }
  try {
    const juego = await obtenerVideojuego(id);
    migaActual.textContent = juego.titulo;
    actualizarSeo(juego);
    dibujarDetalle(juego);
    cargarRelacionados(juego);
  } catch (error) {
    if (error.status === 404) {
      mostrarVacio(estadoDetalle, "Ese juego no existe", error.detail ?? "Volvé al catálogo y elegí otro.");
    } else {
      mostrarError(estadoDetalle, error.message, cargarDetalle);
    }
  }
}

cargarDetalle();
