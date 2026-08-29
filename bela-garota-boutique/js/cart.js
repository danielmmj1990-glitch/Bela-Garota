// ============================================================
// CARRITO — guardado en localStorage bajo la clave "prenda_cart".
// Cada ítem: { id, nombre, precio, talla, color, cantidad, imagen_url }
// ============================================================

const CART_KEY = "prenda_cart";

function obtenerCarrito() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Carrito corrupto, se reinicia:", err);
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CART_KEY, JSON.stringify(carrito));
  actualizarBadgeCarrito();
}

// Agrega un ítem; si ya existe misma combinación (id+talla+color), suma cantidad.
function agregarAlCarrito(item) {
  const carrito = obtenerCarrito();
  const existente = carrito.find(
    (i) => i.id === item.id && i.talla === item.talla && i.color === item.color
  );
  if (existente) {
    existente.cantidad += item.cantidad;
  } else {
    carrito.push(item);
  }
  guardarCarrito(carrito);
}

function quitarDelCarrito(indice) {
  const carrito = obtenerCarrito();
  carrito.splice(indice, 1);
  guardarCarrito(carrito);
}

function actualizarCantidad(indice, cantidad) {
  const carrito = obtenerCarrito();
  if (!carrito[indice]) return;
  carrito[indice].cantidad = Math.max(1, cantidad);
  guardarCarrito(carrito);
}

function totalCarrito() {
  return obtenerCarrito().reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

function cantidadTotalCarrito() {
  return obtenerCarrito().reduce((sum, i) => sum + i.cantidad, 0);
}

function vaciarCarrito() {
  guardarCarrito([]);
}

// Actualiza el contador del carrito en el header (presente en todas las páginas).
function actualizarBadgeCarrito() {
  const badge = document.querySelector("[data-cart-badge]");
  if (!badge) return;
  const cantidad = cantidadTotalCarrito();
  badge.textContent = cantidad;
  badge.style.display = cantidad > 0 ? "inline-flex" : "none";
}

// Arma el mensaje de WhatsApp para el pedido (solución de pago provisional,
// mientras no definas Stripe / PayPal / MercadoPago — ver README).
function construirMensajeWhatsApp() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return "";

  const lineas = carrito.map((i) => {
    const opciones = [i.talla, i.color].filter(Boolean).join(" / ");
    return `• ${i.nombre}${opciones ? ` (${opciones})` : ""} x${i.cantidad} — ${CONFIG.CURRENCY} ${(
      i.precio * i.cantidad
    ).toFixed(2)}`;
  });

  const total = totalCarrito().toFixed(2);
  const mensaje = [
    `Hola, quiero hacer este pedido en ${CONFIG.STORE_NAME}:`,
    "",
    ...lineas,
    "",
    `Total: ${CONFIG.CURRENCY} ${total}`,
  ].join("\n");

  return mensaje;
}

function urlPedidoWhatsApp() {
  const mensaje = construirMensajeWhatsApp();
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

document.addEventListener("DOMContentLoaded", actualizarBadgeCarrito);
