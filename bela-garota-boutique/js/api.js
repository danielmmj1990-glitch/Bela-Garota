// ============================================================
// API — habla con el Google Apps Script conectado a tu Sheet.
// Si CONFIG.API_URL no está configurado, o falla la conexión,
// se usan los productos de DEMO_PRODUCTS (js/data-demo.js) para
// que el sitio nunca se vea vacío durante las pruebas.
// ============================================================

function apiConfigurada() {
  return (
    CONFIG.API_URL &&
    CONFIG.API_URL !== "PEGA_AQUI_LA_URL_DE_TU_APPS_SCRIPT" &&
    CONFIG.API_URL.trim() !== ""
  );
}

// Devuelve la lista completa de productos.
async function obtenerProductos() {
  if (!apiConfigurada()) {
    return DEMO_PRODUCTS;
  }
  try {
    const res = await fetch(`${CONFIG.API_URL}?action=list`);
    if (!res.ok) throw new Error("Respuesta no válida del servidor");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    console.warn("No se pudo cargar productos desde la API, usando demo:", err);
    return DEMO_PRODUCTS;
  }
}

// Busca un producto por id dentro de la lista completa.
async function obtenerProductoPorId(id) {
  const productos = await obtenerProductos();
  return productos.find((p) => String(p.id) === String(id)) || null;
}

// Verifica la contraseña de admin contra el Apps Script (sin escribir nada).
async function verificarPasswordAdmin(password) {
  if (!apiConfigurada()) {
    throw new Error(
      "Todavía no conectaste tu Google Apps Script. Revisá js/config.js."
    );
  }
  const res = await fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "ping", password }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return true;
}

async function adminAgregarProducto(password, producto) {
  return postAdmin({ action: "add", password, producto });
}

async function adminActualizarProducto(password, producto) {
  return postAdmin({ action: "update", password, producto });
}

async function adminEliminarProducto(password, id) {
  return postAdmin({ action: "delete", password, id });
}

async function postAdmin(body) {
  if (!apiConfigurada()) {
    throw new Error(
      "Todavía no conectaste tu Google Apps Script. Revisá js/config.js."
    );
  }
  const res = await fetch(CONFIG.API_URL, {
    method: "POST",
    // Content-Type "text/plain" a propósito: evita que el navegador
    // dispare una petición OPTIONS de pre-vuelo, que Apps Script
    // no maneja bien. El body igual es JSON y así lo lee el script.
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}
