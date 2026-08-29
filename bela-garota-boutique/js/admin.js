// ============================================================
// ADMIN (admin.html) — login + alta / edición / baja de productos
//
// La contraseña se guarda SOLO en sessionStorage (se borra al
// cerrar la pestaña) y se envía en cada escritura para que el
// Apps Script la valide del lado del servidor. Ver README.md
// para las limitaciones de seguridad de este esquema.
// ============================================================

const SESSION_KEY = "prenda_admin_pw";

function passwordGuardada() {
  return sessionStorage.getItem(SESSION_KEY);
}

async function initAdmin() {
  const loginShell = document.querySelector("[data-login-shell]");
  const panelShell = document.querySelector("[data-panel-shell]");

  const pw = passwordGuardada();
  if (pw) {
    mostrarPanel();
  } else {
    mostrarLogin();
  }

  document.querySelector("[data-login-form]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.querySelector("[data-login-password]");
    const errorEl = document.querySelector("[data-login-error]");
    const boton = e.target.querySelector("button[type=submit]");
    errorEl.classList.remove("is-visible");
    boton.disabled = true;
    boton.textContent = "Verificando…";
    try {
      await verificarPasswordAdmin(input.value);
      sessionStorage.setItem(SESSION_KEY, input.value);
      mostrarPanel();
    } catch (err) {
      errorEl.textContent = err.message || "Contraseña incorrecta.";
      errorEl.classList.add("is-visible");
    } finally {
      boton.disabled = false;
      boton.textContent = "Ingresar";
    }
  });

  document.querySelector("[data-logout]")?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  function mostrarLogin() {
    loginShell.style.display = "block";
    panelShell.style.display = "none";
  }

  function mostrarPanel() {
    loginShell.style.display = "none";
    panelShell.style.display = "block";
    cargarTabla();
  }
}

let PRODUCTOS_ADMIN = [];

async function cargarTabla() {
  const tbody = document.querySelector("[data-admin-tbody]");
  tbody.innerHTML = `<tr><td colspan="5" class="state-msg">Cargando…</td></tr>`;
  PRODUCTOS_ADMIN = await obtenerProductos();

  if (PRODUCTOS_ADMIN.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="state-msg">Todavía no cargaste productos.</td></tr>`;
    return;
  }

  tbody.innerHTML = PRODUCTOS_ADMIN.map(
    (p, i) => `
    <tr>
      <td><img class="admin-table__thumb" src="${escA(p.imagen_url)}" alt="" /></td>
      <td>${escA(p.nombre)}<br /><span style="color:var(--ink-faint);font-size:12px;">${escA(
        p.categoria || ""
      )}</span></td>
      <td>${CONFIG.CURRENCY} ${Number(p.precio).toFixed(2)}</td>
      <td>${p.stock ?? "—"}</td>
      <td class="admin-table__actions">
        <button class="link-btn" data-edit="${i}">Editar</button>
        <button class="link-btn link-btn--danger" data-delete="${i}">Eliminar</button>
      </td>
    </tr>`
  ).join("");

  tbody.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => abrirModal(PRODUCTOS_ADMIN[btn.dataset.edit]));
  });
  tbody.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => eliminarProducto(PRODUCTOS_ADMIN[btn.dataset.delete]));
  });
}

async function eliminarProducto(producto) {
  if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
  try {
    await adminEliminarProducto(passwordGuardada(), producto.id);
    await cargarTabla();
  } catch (err) {
    alert("No se pudo eliminar: " + err.message);
  }
}

// ---------------- Modal alta / edición ----------------

function abrirModal(producto) {
  const backdrop = document.querySelector("[data-modal-backdrop]");
  const form = document.querySelector("[data-product-form]");
  const title = document.querySelector("[data-modal-title]");

  form.reset();
  document.querySelector("[data-status-msg]").textContent = "";

  if (producto) {
    title.textContent = "Editar producto";
    form.elements.id.value = producto.id;
    form.elements.nombre.value = producto.nombre || "";
    form.elements.categoria.value = producto.categoria || "";
    form.elements.precio.value = producto.precio ?? "";
    form.elements.tallas.value = producto.tallas || "";
    form.elements.colores.value = producto.colores || "";
    form.elements.stock.value = producto.stock ?? "";
    form.elements.imagen_url.value = producto.imagen_url || "";
    form.elements.descripcion.value = producto.descripcion || "";
  } else {
    title.textContent = "Nuevo producto";
    form.elements.id.value = "";
  }

  backdrop.classList.add("is-open");
}

function cerrarModal() {
  document.querySelector("[data-modal-backdrop]").classList.remove("is-open");
}

function initModal() {
  document.querySelector("[data-new-product]").addEventListener("click", () => abrirModal(null));
  document.querySelector("[data-modal-close]").addEventListener("click", cerrarModal);
  document.querySelector("[data-modal-backdrop]").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) cerrarModal();
  });

  document.querySelector("[data-product-form]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const boton = form.querySelector("button[type=submit]");
    const statusMsg = document.querySelector("[data-status-msg]");

    const producto = {
      id: form.elements.id.value || undefined,
      nombre: form.elements.nombre.value.trim(),
      categoria: form.elements.categoria.value.trim(),
      precio: Number(form.elements.precio.value),
      tallas: form.elements.tallas.value.trim(),
      colores: form.elements.colores.value.trim(),
      stock: Number(form.elements.stock.value || 0),
      imagen_url: form.elements.imagen_url.value.trim(),
      descripcion: form.elements.descripcion.value.trim(),
    };

    boton.disabled = true;
    boton.textContent = "Guardando…";
    statusMsg.textContent = "";
    statusMsg.className = "status-msg";

    try {
      if (producto.id) {
        await adminActualizarProducto(passwordGuardada(), producto);
      } else {
        await adminAgregarProducto(passwordGuardada(), producto);
      }
      cerrarModal();
      await cargarTabla();
    } catch (err) {
      statusMsg.textContent = err.message || "No se pudo guardar.";
      statusMsg.classList.add("is-error");
    } finally {
      boton.disabled = false;
      boton.textContent = "Guardar";
    }
  });
}

function escA(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  initAdmin();
  initModal();
});
