// tarjetas.js - Arma la tarjeta de un videojuego y las tarjetas "esqueleto" de la carga.
// La usan el catálogo (index.html) y el detalle (juego.html).
//
// Estructura que se genera (las clases están en estilos.css, bloque "Tarjeta"):
//
// <article class="tarjeta animar-entrada">
//   <div class="tarjeta-imagen"> <img> <span class="insignia tarjeta-insignia">Sin stock</span> </div>
//   <div class="tarjeta-cuerpo">
//     <p class="tarjeta-subtitulo">Rol (RPG) · 2022</p>
//     <h3 class="tarjeta-titulo"><a href="juego.html?id=10">Elden Ring</a></h3>
//     <p class="tarjeta-texto">descripción</p>
//     <ul class="lista-insignias"> <li class="insignia">PC</li> ... </ul>
//   </div>
//   <footer class="tarjeta-pie"> <data class="tarjeta-precio">$ 60.000</data> <span>7 en stock</span> </footer>
// </article>

import { crearElemento, crearImagenJuego, formatearPrecio, nombreGenero } from "./util.js";

export function crearTarjeta(juego) {
  const agotado = juego.stock === 0;
  const tarjeta = crearElemento("article", `tarjeta animar-entrada${agotado ? " tarjeta-agotada" : ""}`);

  // Imagen y, si no hay stock, la insignia encima
  const marco = crearElemento("div", "tarjeta-imagen");
  marco.append(crearImagenJuego(juego));
  if (agotado) marco.append(crearElemento("span", "insignia insignia-peligro tarjeta-insignia", "Sin stock"));

  // Cuerpo
  const cuerpo = crearElemento("div", "tarjeta-cuerpo");
  const titulo = crearElemento("h3", "tarjeta-titulo");
  const enlace = crearElemento("a", "", juego.titulo);
  enlace.href = `juego.html?id=${juego.id}`;
  titulo.append(enlace);

  const plataformas = crearElemento("ul", "lista-insignias");
  plataformas.setAttribute("aria-label", "Plataformas");
  for (const plataforma of juego.plataformas) {
    plataformas.append(crearElemento("li", "insignia", plataforma.nombre));
  }

  cuerpo.append(
    crearElemento("p", "tarjeta-subtitulo", `${nombreGenero(juego.genero)} · ${juego.anio_lanzamiento}`),
    titulo,
    crearElemento("p", "tarjeta-texto", juego.descripcion),
    plataformas
  );

  // Pie: precio y stock. <data value> guarda el número sin formato.
  const pie = crearElemento("footer", "tarjeta-pie");
  const precio = crearElemento("data", "tarjeta-precio", formatearPrecio(juego.precio));
  precio.value = juego.precio;
  pie.append(precio, crearElemento("span", "tarjeta-stock", agotado ? "Agotado" : `${juego.stock} en stock`));

  tarjeta.append(marco, cuerpo, pie);
  return tarjeta;
}

// Tarjeta gris que "brilla" mientras llegan los datos.
export function crearTarjetaEsqueleto() {
  const tarjeta = crearElemento("div", "esqueleto-tarjeta");
  tarjeta.setAttribute("aria-hidden", "true");
  tarjeta.append(
    crearElemento("div", "esqueleto esqueleto-imagen"),
    crearElemento("div", "esqueleto esqueleto-linea"),
    crearElemento("div", "esqueleto esqueleto-linea esqueleto-linea-corta")
  );
  return tarjeta;
}
