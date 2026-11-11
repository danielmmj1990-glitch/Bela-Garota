// ============================================================
// PWA — registra el service worker y muestra el aviso
// "Instalar app" para agregar la tienda a la pantalla de inicio.
// ============================================================
(function () {
  const CLAVE_DESCARTADO = "bg_instalar_descartado";
  const DIAS_SIN_MOSTRAR = 14;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) => {
        console.warn("No se pudo registrar el service worker:", err);
      });
    });
  }

  // El panel de admin no necesita invitar a instalar.
  if (/admin\.html$/.test(location.pathname)) return;

  const yaInstalada =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (yaInstalada) return;

  function descartadoHacePoco() {
    try {
      const t = Number(localStorage.getItem(CLAVE_DESCARTADO) || 0);
      return Date.now() - t < DIAS_SIN_MOSTRAR * 24 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  }

  function recordarDescarte() {
    try {
      localStorage.setItem(CLAVE_DESCARTADO, String(Date.now()));
    } catch (e) {}
  }

  function mostrarAviso({ texto, textoBoton, alInstalar }) {
    if (document.querySelector(".install-bar")) return;

    const barra = document.createElement("div");
    barra.className = "install-bar";
    barra.setAttribute("role", "region");
    barra.setAttribute("aria-label", "Instalar la app");

    const icono = document.createElement("img");
    icono.className = "install-bar__icon";
    icono.src = "icons/icon-192.png";
    icono.alt = "";
    icono.width = 44;
    icono.height = 44;

    const cuerpo = document.createElement("div");
    cuerpo.className = "install-bar__text";
    const titulo = document.createElement("strong");
    titulo.textContent = "Bela Garota en tu celular";
    const detalle = document.createElement("span");
    detalle.textContent = texto;
    cuerpo.append(titulo, detalle);

    const acciones = document.createElement("div");
    acciones.className = "install-bar__actions";

    if (alInstalar) {
      const instalar = document.createElement("button");
      instalar.type = "button";
      instalar.className = "btn";
      instalar.textContent = textoBoton;
      instalar.addEventListener("click", () => alInstalar(barra));
      acciones.append(instalar);
    }

    const cerrar = document.createElement("button");
    cerrar.type = "button";
    cerrar.className = "install-bar__close";
    cerrar.setAttribute("aria-label", "Cerrar aviso");
    cerrar.textContent = "×";
    cerrar.addEventListener("click", () => {
      recordarDescarte();
      barra.remove();
    });
    acciones.append(cerrar);

    barra.append(icono, cuerpo, acciones);
    document.body.append(barra);
  }

  // Android / Chrome / Edge: el navegador ofrece la instalación directa.
  let eventoInstalar = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    eventoInstalar = e;
    if (descartadoHacePoco()) return;
    mostrarAviso({
      texto: "Instalá la app y comprá más rápido.",
      textoBoton: "Instalar",
      alInstalar: async (barra) => {
        if (!eventoInstalar) return;
        eventoInstalar.prompt();
        const { outcome } = await eventoInstalar.userChoice;
        eventoInstalar = null;
        if (outcome !== "accepted") recordarDescarte();
        barra.remove();
      },
    });
  });

  window.addEventListener("appinstalled", () => {
    const barra = document.querySelector(".install-bar");
    if (barra) barra.remove();
  });

  // iPhone / iPad: Safari no tiene botón de instalar, se explica el paso manual.
  const ua = navigator.userAgent;
  const esIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (esIOS && !descartadoHacePoco()) {
    window.addEventListener("load", () => {
      mostrarAviso({
        texto: "Tocá Compartir y luego “Agregar a inicio”.",
      });
    });
  }
})();
