/**
 * PRENDA — Backend en Google Apps Script
 * ========================================
 * Conecta el sitio estático con una hoja de Google Sheets llamada
 * "Productos". Ver README.md para el paso a paso de instalación.
 *
 * Columnas esperadas en la hoja "Productos" (fila 1 = encabezados):
 *   id | nombre | categoria | precio | tallas | colores | descripcion | imagen_url | stock
 *
 * La contraseña de administrador NUNCA se guarda en este archivo.
 * Se configura aparte, en "Configuración del proyecto" > Script Properties,
 * con la clave ADMIN_PASSWORD. Así no queda visible en el código.
 */

const SHEET_NAME = "Productos";
const COLUMNAS = [
  "id",
  "nombre",
  "categoria",
  "precio",
  "tallas",
  "colores",
  "descripcion",
  "imagen_url",
  "stock",
];

// ---------------- Lectura pública (catálogo) ----------------

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || "list";
  if (action === "list") {
    return jsonResponse(obtenerProductos());
  }
  return jsonResponse({ error: "Acción no reconocida." });
}

// ---------------- Escritura protegida (admin) ----------------

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ error: "Cuerpo de la petición inválido." });
  }

  if (!validarPassword(body.password)) {
    return jsonResponse({ error: "Contraseña incorrecta." });
  }

  try {
    switch (body.action) {
      case "ping":
        return jsonResponse({ ok: true });
      case "add":
        return jsonResponse(agregarProducto(body.producto));
      case "update":
        return jsonResponse(actualizarProducto(body.producto));
      case "delete":
        return jsonResponse(eliminarProducto(body.id));
      default:
        return jsonResponse({ error: "Acción no reconocida." });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function validarPassword(password) {
  const guardada = PropertiesService.getScriptProperties().getProperty("ADMIN_PASSWORD");
  return Boolean(guardada) && password === guardada;
}

// ---------------- Operaciones sobre la hoja ----------------

function obtenerHoja() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!hoja) {
    throw new Error(`No existe una hoja llamada "${SHEET_NAME}".`);
  }
  return hoja;
}

function obtenerProductos() {
  const hoja = obtenerHoja();
  const valores = hoja.getDataRange().getValues();
  const encabezados = valores.shift();
  return valores
    .filter((fila) => fila[0] !== "" && fila[0] !== null)
    .map((fila) => {
      const producto = {};
      encabezados.forEach((col, i) => (producto[col] = fila[i]));
      return producto;
    });
}

function agregarProducto(producto) {
  if (!producto || !producto.nombre) {
    throw new Error("Falta el nombre del producto.");
  }
  const hoja = obtenerHoja();
  const id = Utilities.getUuid();
  hoja.appendRow(COLUMNAS.map((col) => (col === "id" ? id : producto[col] ?? "")));
  return { id: id };
}

function actualizarProducto(producto) {
  if (!producto || !producto.id) {
    throw new Error("Falta el id del producto a actualizar.");
  }
  const hoja = obtenerHoja();
  const valores = hoja.getDataRange().getValues();
  for (let fila = 1; fila < valores.length; fila++) {
    if (String(valores[fila][0]) === String(producto.id)) {
      const nuevaFila = COLUMNAS.map((col) =>
        col === "id" ? producto.id : producto[col] ?? ""
      );
      hoja.getRange(fila + 1, 1, 1, COLUMNAS.length).setValues([nuevaFila]);
      return { updated: true };
    }
  }
  throw new Error("Producto no encontrado.");
}

function eliminarProducto(id) {
  if (!id) throw new Error("Falta el id del producto a eliminar.");
  const hoja = obtenerHoja();
  const valores = hoja.getDataRange().getValues();
  for (let fila = 1; fila < valores.length; fila++) {
    if (String(valores[fila][0]) === String(id)) {
      hoja.deleteRow(fila + 1);
      return { deleted: true };
    }
  }
  throw new Error("Producto no encontrado.");
}

// ---------------- Utilidad de respuesta ----------------

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
