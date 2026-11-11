# Bela Garota Boutique — Tienda de ropa online

Sitio de venta de ropa: catálogo público, carrito y panel de administración
protegido por contraseña. Los productos se guardan en Google Sheets. El pago
todavía no está conectado a una pasarela — por ahora el pedido se confirma
por WhatsApp (ver sección "Sobre el pago" más abajo).

## Estructura del proyecto

```
index.html          → Página de inicio (catálogo + filtros por categoría)
producto.html        → Detalle de producto
carrito.html        → Carrito de compras y checkout por WhatsApp
admin.html          → Panel de administración (login + CRUD de productos)
css/style.css        → Estilos de todo el sitio
js/config.js         → ⚠️ Único archivo que DEBES editar (URL de API, WhatsApp, nombre)
js/data-demo.js      → Productos de ejemplo (se usan mientras no conectes tu Sheet)
js/api.js            → Comunicación con el backend (Google Apps Script)
js/cart.js           → Lógica del carrito (localStorage)
js/catalog.js        → Lógica de la home
js/product.js        → Lógica del detalle de producto
js/admin.js          → Lógica del panel de administración
apps-script/Code.gs   → Backend a pegar en Google Apps Script
manifest.webmanifest  → Datos de la app instalable (nombre, colores, íconos)
sw.js                 → Service worker: permite instalarla y abrirla sin conexión
js/pwa.js             → Registra el service worker y muestra el aviso "Instalar"
icons/                → Íconos de la app
```

Podés abrir `index.html` directamente en el navegador ahora mismo: vas a ver
el sitio funcionando con productos de ejemplo. Para usar tus propios
productos, seguí los pasos siguientes.

---

## 1. Crear tu hoja de Google Sheets

1. Andá a [sheets.google.com](https://sheets.google.com) y creá una hoja nueva.
2. Renombrá la primera pestaña (abajo) a exactamente **`Productos`**.
3. En la fila 1, escribí estos encabezados, uno por columna, en este orden exacto:

   ```
   id | nombre | categoria | precio | tallas | colores | descripcion | imagen_url | stock
   ```

4. No escribas nada en la columna `id` — se completa sola cuando agregás
   productos desde el panel de admin. Si querés cargar productos a mano
   directamente en la hoja, poné cualquier texto único en `id` (ej. `p1`, `p2`).

## 2. Publicar el backend (Google Apps Script)

1. Desde la misma hoja: **Extensiones → Apps Script**.
2. Borrá el contenido de `Código.gs` y pegá todo el contenido de
   `apps-script/Code.gs` de este proyecto.
3. Definí tu contraseña de administrador (así **no** queda escrita en el
   código): en el panel izquierdo, **Configuración del proyecto** (ícono de
   engranaje) → **Propiedades del script** → **Añadir propiedad script**.
   - Propiedad: `ADMIN_PASSWORD`
   - Valor: la contraseña que vas a usar para entrar al panel de admin
4. Guardá el proyecto (ícono de disquete).
5. **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo (tu cuenta)**
   - Quién tiene acceso: **Cualquier usuario**
6. Autorizá los permisos que pida Google (es tu propio script accediendo a
   tu propia hoja).
7. Copiá la **URL de la aplicación web** que te muestra al final. Termina en
   `/exec`.

## 3. Conectar el sitio con tu Google Sheet

Abrí `js/config.js` y pegá esa URL:

```js
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycb.../exec",
  STORE_NAME: "Bela Garota Boutique",
  WHATSAPP_NUMBER: "5917XXXXXXX",
  CURRENCY: "Bs",
};
```

Recargá `index.html`: ya debería listar (vacío al principio) desde tu Sheet
real en vez de los productos de ejemplo.

## 4. Cargar productos

Entrá a `admin.html`, ingresá la contraseña que configuraste en el paso 2, y
usá **+ Nuevo producto** para cargar tu catálogo (nombre, categoría, precio,
tallas, colores, stock, imagen y descripción). Los cambios se guardan
directamente en tu Google Sheet.

Para las imágenes, la forma más simple es subirlas a un servicio como
[imgbb.com](https://imgbb.com) o a Google Drive (con enlace público) y pegar
la URL directa en el campo "URL de imagen".

## 5. Subir el sitio a un hosting

**Netlify** (arrastrar y soltar, sin cuenta técnica):
1. Andá a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastrá la carpeta completa del proyecto (la que tiene `index.html`)
3. Netlify te da una URL pública al instante (podés cambiar el subdominio o
   conectar tu propio dominio después, en Site settings → Domain management)

**Vercel** (alternativa, requiere cuenta gratuita):
1. Subí el proyecto a un repositorio de GitHub
2. En [vercel.com](https://vercel.com), "Add New Project" → importá el repo
3. Como es un sitio estático, no hace falta configurar build command

En ambos casos, `admin.html` queda accesible en la misma URL pública
(ej. `tutienda.netlify.app/admin.html`) — la protección la da la contraseña,
no la URL. No compartas ese enlace ni lo enlaces desde el menú público si
preferís que no se vea a simple vista (igual está enlazado en el header
actual; podés quitarlo del menú si querés, dejándolo accesible solo por URL
directa).

---

## Sobre la seguridad del panel de admin (leer esto)

Elegiste Google Sheets por simplicidad, y es una opción válida para un
catálogo chico manejado por una sola persona — pero es importante que sepas
exactamente qué tan protegido queda:

- La contraseña se valida **en el servidor** (Apps Script), no en el
  navegador, así que no queda visible en el código fuente del sitio. Eso es
  mejor que una contraseña puramente en JavaScript.
- Pero no hay un sistema de usuarios real, ni límite de intentos, ni
  registro de quién entró. Si alguien adivina o consigue tu contraseña,
  tiene control total del catálogo.
- Cualquiera que llame directamente a tu URL de Apps Script con la
  contraseña correcta puede editar productos, aunque nunca use `admin.html`.
- Usá una contraseña que no uses en ningún otro lado, y cambiala si alguna
  vez sospechás que se filtró (Script Properties → editar `ADMIN_PASSWORD`).

Si más adelante el catálogo crece o sumás gente al equipo, migrar a
Supabase o Firebase (con autenticación real de usuarios) es el siguiente
paso natural — y este mismo frontend se puede adaptar sin rehacerlo, solo
cambiando `js/api.js`.

---

## Sobre el pago (por qué no hay Stripe/PayPal/MercadoPago todavía)

Como no definiste una pasarela, el botón de "Confirmar pedido" en el
carrito abre WhatsApp con el detalle completo del pedido (productos,
talles, colores, cantidades y total) para que coordines el pago y la
entrega manualmente. Es el flujo que usa la mayoría de tiendas de ropa
chicas en Bolivia mientras arrancan, y funciona desde el primer día sin
depender de que una pasarela apruebe tu cuenta.

Cuando decidas la pasarela, avisame y agrego la integración real. En
términos generales, lo que cambia es:

- **Toda pasarela real necesita una función de servidor** (no alcanza con
  HTML/JS) para crear la sesión de pago de forma segura. Con Netlify o
  Vercel esto se resuelve con una "función serverless" chica — no hace
  falta un servidor propio.
- **Stripe**: la integración más simple de las tres para un catálogo así
  (Stripe Checkout). Hay que confirmar que tu cuenta pueda recibir pagos
  desde Bolivia, o usar una entidad/cuenta bancaria de un país soportado.
- **PayPal**: similar a Stripe en complejidad; mismas dudas sobre
  disponibilidad de cuenta business para Bolivia.
- **MercadoPago**: la opción con más presencia regional en Bolivia
  actualmente; conviene confirmar directamente con MercadoPago los
  requisitos vigentes para cuentas de comercio en el país antes de
  integrarlo, ya que esto cambia con el tiempo.

La función `construirMensajeWhatsApp()` en `js/cart.js` y el botón de
checkout en `carrito.html` son el punto exacto donde se reemplaza el link
de WhatsApp por la llamada a la pasarela elegida.

---

## App instalable (PWA)

La tienda se puede instalar en el celular como una app, sin pasar por Play
Store ni App Store. Solo funciona cuando el sitio está publicado con
**https** (Netlify, Vercel o GitHub Pages ya lo dan); abriendo `index.html`
como archivo local no aparece la opción de instalar.

- **Android (Chrome):** al entrar aparece el aviso "Instalar". También está
  en el menú ⋮ → *Instalar app* / *Agregar a pantalla principal*.
- **iPhone (Safari):** botón *Compartir* → *Agregar a inicio*.

Una vez instalada abre a pantalla completa con su ícono. Si no hay conexión,
muestra el último catálogo que se cargó; para confirmar un pedido por
WhatsApp sí hace falta internet.

Para cambiar el ícono, reemplazá los PNG de `icons/` manteniendo los mismos
nombres y tamaños. Si agregás archivos nuevos al sitio, sumalos a la lista
`ARCHIVOS_BASE` de `sw.js` y subí el número de `VERSION`.

---

## Próximas mejoras posibles

- Filtros por talla, color o rango de precio en el catálogo.
- Búsqueda de productos por nombre.
- Notificación por email al recibir un pedido.
- Integración real de pago (Stripe / PayPal / MercadoPago) cuando decidas cuál.
