// util.js - Ayudas chicas para crear elementos y dar formato.
// Todo el texto que viene de la API se escribe con textContent, nunca como HTML:
// así un título como "<b>Prueba</b>" se ve como texto y no se interpreta como HTML.

// Crea una etiqueta con sus clases y, si se indica, su texto.
export function crearElemento(etiqueta, clases = "", texto = null) {
  const elemento = document.createElement(etiqueta);
  if (clases) elemento.className = clases;
  if (texto !== null && texto !== undefined) elemento.textContent = texto;
  return elemento;
}

export function crearBoton(texto, clases, alHacerClic) {
  const boton = crearElemento("button", clases, texto);
  boton.type = "button";
  boton.addEventListener("click", alHacerClic);
  return boton;
}

// Precio en pesos argentinos: 55000 -> "$ 55.000"
const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPrecio(valor) {
  return formatoPrecio.format(valor);
}

// Los géneros llegan de la API en mayúsculas y sin tilde (valores del Enum).
// Este diccionario solo cambia cómo se MUESTRAN: lo que se envía sigue siendo "ACCION".
const NOMBRES_GENERO = {
  ACCION: "Acción",
  AVENTURA: "Aventura",
  RPG: "Rol (RPG)",
  DEPORTES: "Deportes",
  CARRERAS: "Carreras",
  ESTRATEGIA: "Estrategia",
  SHOOTER: "Disparos",
  INDIE: "Indie",
};

export function nombreGenero(valor) {
  return NOMBRES_GENERO[valor] ?? valor;
}

// Cuánto se espera la imagen propia antes de pasar a la de internet.
export const ESPERA_IMAGEN_MS = 3000;

// Crea la imagen de un juego, con dos fuentes en orden:
//   1. imagen_url: la portada propia y comprimida, dentro de web/img/
//   2. imagen_respaldo_url: la misma portada en internet
// Se pasa a la siguiente si la actual da error (por ejemplo, un 404) o si no
// terminó de cargar en 3 segundos. Si ninguna funciona, queda el recuadro "Sin imagen".
export function crearImagenJuego(juego, ancho = 300, alto = 450) {
  const fuentes = [juego.imagen_url, juego.imagen_respaldo_url].filter(Boolean);
  if (fuentes.length === 0) return crearElemento("div", "sin-imagen", "Sin imagen");

  const imagen = document.createElement("img");
  imagen.alt = `Portada de ${juego.titulo}`;
  imagen.width = ancho;
  imagen.height = alto;
  imagen.decoding = "async";
  // Sin loading="lazy": con carga diferida el reloj de 3 segundos correría antes
  // de que el navegador empiece a pedir la imagen.

  let indice = 0;
  let reloj;

  function probar() {
    clearTimeout(reloj);
    if (indice >= fuentes.length) {
      imagen.replaceWith(crearElemento("div", "sin-imagen", "Sin imagen"));
      return;
    }
    imagen.src = fuentes[indice];
    indice += 1;
    reloj = setTimeout(() => {
      if (!imagen.complete) probar();   // tardó demasiado: siguiente fuente
    }, ESPERA_IMAGEN_MS);
  }

  imagen.addEventListener("load", () => clearTimeout(reloj));
  imagen.addEventListener("error", probar);
  probar();
  return imagen;
}

// Espera a que el usuario deje de escribir antes de ejecutar la función
// (evita pedirle a la API una búsqueda por cada tecla).
export function esperarPausa(funcion, milisegundos = 350) {
  let temporizador;
  return (...argumentos) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => funcion(...argumentos), milisegundos);
  };
}

// Llena un <select> con opciones. La primera opción (por ejemplo "Todas") se conserva.
export function llenarSelect(select, elementos, obtenerValor, obtenerTexto) {
  const primera = select.options[0];
  select.replaceChildren(primera);
  for (const elemento of elementos) {
    select.append(new Option(obtenerTexto(elemento), obtenerValor(elemento)));
  }
}
