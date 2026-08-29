// ============================================================
// DETALLE DE PRODUCTO (producto.html)
// ============================================================

let PRODUCTO_ACTUAL = null;
let TALLA_SELECCIONADA = null;
let COLOR_SELECCIONADO = null;
let CANTIDAD = 1;

async function initProducto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const contenedor = document.querySelector("[data-product-root]");

  if (!id) {
    contenedor.innerHTML = `<p class="state-msg">Producto no especificado.</p>`;
    return;
  }

  const producto = await obtenerProductoPorId(id);
  if (!producto) {
    contenedor.innerHTML = `<p class="state-msg">No encontramos ese producto.</p>`;
    return;
  }

  PRODUCTO_ACTUAL = producto;
  const tallas = splitOpciones(producto.tallas);
  const colores = splitOpciones(producto.colores);
  TALLA_SELECCIONADA = tallas[0] || null;
  COLOR_SELECCIONADO = colores[0] || null;

  document.title = `${producto.nombre} — ${CONFIG.STORE_NAME}`;

  contenedor.innerHTML = `
    <div class="product-detail__image">
      <img src="${esc(producto.imagen_url)}" alt="${esc(producto.nombre)}" />
    </div>
    <div>
      <p class="product-detail__category">${esc(producto.categoria || "")}</p>
      <h1 class="product-detail__name">${esc(producto.nombre)}</h1>
      <p class="product-detail__price">${CONFIG.CURRENCY} ${Number(producto.precio).toFixed(2)}</p>
      <p class="product-detail__desc">${esc(producto.descripcion || "")}</p>

      ${
        tallas.length
          ? `<div class="field-group">
              <p class="field-group__label">Talla</p>
              <div class="option-row" data-talla-row>
                ${tallas
                  .map(
                    (t) =>
                      `<button type="button" class="option-pill ${
                        t === TALLA_SELECCIONADA ? "is-selected" : ""
                      }" data-talla="${esc(t)}">${esc(t)}</button>`
                  )
                  .join("")}
              </div>
            </div>`
          : ""
      }

      ${
        colores.length
          ? `<div class="field-group">
              <p class="field-group__label">Color</p>
              <div class="option-row" data-color-row>
                ${colores
                  .map(
                    (c) =>
                      `<button type="button" class="option-pill ${
                        c === COLOR_SELECCIONADO ? "is-selected" : ""
                      }" data-color="${esc(c)}">${esc(c)}</button>`
                  )
                  .join("")}
              </div>
            </div>`
          : ""
      }

      <div class="field-group">
        <p class="field-group__label">Cantidad</p>
        <div class="qty-control">
          <button type="button" data-qty-minus aria-label="Restar">−</button>
          <span data-qty-value>1</span>
          <button type="button" data-qty-plus aria-label="Sumar">+</button>
        </div>
        ${
          producto.stock !== undefined && producto.stock !== ""
            ? `<p class="stock-note">${Number(producto.stock)} disponibles</p>`
            : ""
        }
      </div>

      <button class="btn" data-add-to-cart>Añadir al carrito</button>
      <p class="add-feedback" data-feedback>Añadido al carrito.</p>
    </div>
  `;

  contenedor.querySelectorAll("[data-talla]").forEach((btn) => {
    btn.addEventListener("click", () => {
      TALLA_SELECCIONADA = btn.dataset.talla;
      contenedor
        .querySelectorAll("[data-talla-row] .option-pill")
        .forEach((b) => b.classList.toggle("is-selected", b === btn));
    });
  });

  contenedor.querySelectorAll("[data-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      COLOR_SELECCIONADO = btn.dataset.color;
      contenedor
        .querySelectorAll("[data-color-row] .option-pill")
        .forEach((b) => b.classList.toggle("is-selected", b === btn));
    });
  });

  const qtyValue = contenedor.querySelector("[data-qty-value]");
  contenedor.querySelector("[data-qty-minus]").addEventListener("click", () => {
    CANTIDAD = Math.max(1, CANTIDAD - 1);
    qtyValue.textContent = CANTIDAD;
  });
  contenedor.querySelector("[data-qty-plus]").addEventListener("click", () => {
    CANTIDAD += 1;
    qtyValue.textContent = CANTIDAD;
  });

  contenedor.querySelector("[data-add-to-cart]").addEventListener("click", () => {
    agregarAlCarrito({
      id: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      talla: TALLA_SELECCIONADA,
      color: COLOR_SELECCIONADO,
      cantidad: CANTIDAD,
      imagen_url: producto.imagen_url,
    });
    const feedback = contenedor.querySelector("[data-feedback]");
    feedback.classList.add("is-visible");
    setTimeout(() => feedback.classList.remove("is-visible"), 2500);
  });
}

function splitOpciones(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", initProducto);
