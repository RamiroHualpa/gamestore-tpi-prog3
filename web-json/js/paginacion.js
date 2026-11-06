// paginacion.js - Componente reutilizable de paginado.
// El paginado lo hace el SERVIDOR: se le pide solo la página que se ve,
// con skip = (página - 1) * tamaño y limit = tamaño.
// La cantidad de páginas sale del "total" que devuelve la API.

import { crearBoton, crearElemento } from "./util.js";

export function calcularSkip(pagina, tamanio) {
  return (pagina - 1) * tamanio;
}

export function totalDePaginas(total, tamanio) {
  return Math.max(1, Math.ceil(total / tamanio));
}

// Qué números mostrar: siempre la primera, la última y las vecinas de la actual.
// Ejemplo con 10 páginas, en la 5: [1, "…", 4, 5, 6, "…", 10]
// Con 7 páginas o menos se muestran todas.
function numerosVisibles(actual, paginas) {
  const numeros = [];
  for (let n = 1; n <= paginas; n++) {
    if (paginas <= 7 || n === 1 || n === paginas || Math.abs(n - actual) <= 1) numeros.push(n);
    else if (numeros.at(-1) !== "…") numeros.push("…");
  }
  return numeros;
}

// contenedor: un <nav> vacío. alCambiar recibe el número de la página elegida.
export function dibujarPaginacion(contenedor, { total, pagina, tamanio, alCambiar }) {
  const paginas = totalDePaginas(total, tamanio);
  contenedor.hidden = total <= tamanio;   // con una sola página no hace falta
  if (contenedor.hidden) {
    contenedor.replaceChildren();
    return;
  }

  const anterior = crearBoton("← Anterior", "btn btn-contorno btn-chico", () => alCambiar(pagina - 1));
  anterior.disabled = pagina <= 1;
  const siguiente = crearBoton("Siguiente →", "btn btn-contorno btn-chico", () => alCambiar(pagina + 1));
  siguiente.disabled = pagina >= paginas;

  const numeros = numerosVisibles(pagina, paginas).map((n) => {
    if (n === "…") return crearElemento("span", "texto-suave", "…");
    const boton = crearBoton(String(n), "paginacion-numero", () => alCambiar(n));
    boton.setAttribute("aria-label", `Página ${n}`);
    if (n === pagina) boton.setAttribute("aria-current", "page");
    return boton;
  });

  contenedor.replaceChildren(
    anterior,
    ...numeros,
    siguiente,
    crearElemento("p", "paginacion-info", `Página ${pagina} de ${paginas}`)
  );
}
