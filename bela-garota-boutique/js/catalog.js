// ============================================================
// CATÁLOGO (index.html) — filtros de categoría + grilla
// ============================================================

let TODOS_LOS_PRODUCTOS = [];
let CATEGORIA_ACTIVA = "Todo";

async function initCatalogo() {
  const grid = document.querySelector("[data-grid]");
  const chipsWrap = document.querySelector("[data-chips]");
  const count = document.querySelector("[data-count]");

  grid.innerHTML = `<p class="state-msg">Cargando catálogo…</p>`;

  TODOS_LOS_PRODUCTOS = await obtenerProductos();

  const categorias = [
    "Todo",
    ...new Set(TODOS_LOS_PRODUCTOS.map((p) => p.categoria).filter(Boolean)),
  ];

  // Si se llega desde una tarjeta de categoría en la portada (?cat=Mujer),
  // preseleccionar ese filtro si existe entre las categorías reales.
  const catParam = new URLSearchParams(window.location.search).get("cat");
  if (catParam && categorias.includes(catParam)) {
    CATEGORIA_ACTIVA = catParam;
  }

  chipsWrap.innerHTML = categorias
    .map(
      (cat) =>
        `<button class="chip ${cat === CATEGORIA_ACTIVA ? "is-active" : ""}" data-cat="${escapeHtml(
          cat
        )}">${escapeHtml(cat)}</button>`
    )
    .join("");

  chipsWrap.querySelectorAll("[data-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      CATEGORIA_ACTIVA = btn.dataset.cat;
      chipsWrap
        .querySelectorAll(".chip")
        .forEach((c) => c.classList.toggle("is-active", c === btn));
      renderGrid(grid, count);
    });
  });

  renderGrid(grid, count);
}

function renderGrid(grid, count) {
  const productos =
    CATEGORIA_ACTIVA === "Todo"
      ? TODOS_LOS_PRODUCTOS
      : TODOS_LOS_PRODUCTOS.filter((p) => p.categoria === CATEGORIA_ACTIVA);

  count.textContent = `${productos.length} producto${productos.length === 1 ? "" : "s"}`;

  if (productos.length === 0) {
    grid.innerHTML = `<p class="state-msg">Todavía no hay productos en esta categoría.</p>`;
    return;
  }

  grid.innerHTML = productos.map((p, i) => tarjetaProducto(p, i)).join("");
}

function tarjetaProducto(p, indice) {
  const codigo = `Pieza Nº ${String(indice + 1).padStart(4, "0")}`;
  return `
    <a class="lot-card" href="producto.html?id=${encodeURIComponent(p.id)}">
      <span class="lot-card__bar"></span>
      <div class="lot-card__image">
        <img src="${escapeHtml(p.imagen_url)}" alt="${escapeHtml(p.nombre)}" loading="lazy" />
      </div>
      <div class="lot-card__body">
        <p class="lot-card__code">${codigo} · ${escapeHtml(p.categoria || "")}</p>
        <h3 class="lot-card__name">${escapeHtml(p.nombre)}</h3>
        <p class="lot-card__price">${CONFIG.CURRENCY} ${Number(p.precio).toFixed(2)}</p>
      </div>
    </a>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", initCatalogo);
