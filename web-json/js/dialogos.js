// dialogos.js - Ventanas modales con la etiqueta <dialog> de HTML.
// Reemplazan a la confirmación nativa del navegador: la pregunta se hace DENTRO de la página.

// Abre el <dialog id="dialogo-confirmar"> y espera la respuesta.
// Devuelve una promesa: true si se eligió confirmar; false si se canceló o se cerró con Esc.
export function confirmar({ titulo, mensaje, textoConfirmar = "Confirmar" }) {
  const dialogo = document.querySelector("#dialogo-confirmar");
  const botonSi = dialogo.querySelector("[data-confirmar]");
  const botonNo = dialogo.querySelector("[data-cancelar]");
  dialogo.querySelector("[data-titulo]").textContent = titulo;
  dialogo.querySelector("[data-mensaje]").textContent = mensaje;
  botonSi.textContent = textoConfirmar;
  dialogo.showModal();
  botonNo.focus();   // por seguridad, el foco arranca en "Cancelar"

  // Los botones están en un <form method="dialog">: al hacer clic, el navegador cierra el diálogo.
  // Acá solo se escucha cuál se eligió. "cancel" es el evento de la tecla Esc.
  return new Promise((resolver) => {
    const responder = (valor) => {
      botonSi.removeEventListener("click", alConfirmar);
      botonNo.removeEventListener("click", alCancelar);
      dialogo.removeEventListener("cancel", alCancelar);
      resolver(valor);
    };
    const alConfirmar = () => responder(true);
    const alCancelar = () => responder(false);
    botonSi.addEventListener("click", alConfirmar);
    botonNo.addEventListener("click", alCancelar);
    dialogo.addEventListener("cancel", alCancelar);
  });
}

// Cierra un modal al hacer clic en el fondo oscuro (fuera del cuadro).
export function cerrarAlTocarFondo(dialogo) {
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
}
