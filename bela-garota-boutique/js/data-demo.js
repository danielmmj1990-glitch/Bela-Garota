// ============================================================
// PRODUCTOS DE EJEMPLO
// Se usan solo si CONFIG.API_URL está vacío o falla la conexión,
// para que puedas ver el diseño funcionando antes de conectar
// tu propia hoja de Google Sheets.
// ============================================================
const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    nombre: "Camisa Oxford Índigo",
    categoria: "Hombre",
    precio: 189,
    tallas: "S,M,L,XL",
    colores: "Índigo,Blanco",
    descripcion:
      "Camisa de corte clásico en algodón Oxford. Tejido resistente y transpirable, ideal para uso diario o de oficina.",
    imagen_url:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80",
    stock: 12,
  },
  {
    id: "demo-2",
    nombre: "Vestido Lino Ocre",
    categoria: "Mujer",
    precio: 245,
    tallas: "XS,S,M,L",
    colores: "Ocre,Terracota",
    descripcion:
      "Vestido midi en mezcla de lino, silueta suelta y fresca. Perfecto para climas cálidos.",
    imagen_url:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    stock: 8,
  },
  {
    id: "demo-3",
    nombre: "Chompa Cuello Alto",
    categoria: "Mujer",
    precio: 210,
    tallas: "S,M,L",
    colores: "Gris,Negro",
    descripcion:
      "Chompa tejida de cuello alto, punto medio. Abriga sin pesar, combina con todo.",
    imagen_url:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    stock: 15,
  },
  {
    id: "demo-4",
    nombre: "Jean Recto Denim",
    categoria: "Hombre",
    precio: 259,
    tallas: "38,40,42,44",
    colores: "Azul Oscuro",
    descripcion:
      "Jean de corte recto en denim rígido de 12oz. Costuras reforzadas, calce atemporal.",
    imagen_url:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    stock: 20,
  },
  {
    id: "demo-5",
    nombre: "Campera Bomber",
    categoria: "Hombre",
    precio: 320,
    tallas: "M,L,XL",
    colores: "Verde Oliva,Negro",
    descripcion:
      "Campera bomber acolchada, puños y cuello elastizados. Forro interior ligero.",
    imagen_url:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    stock: 6,
  },
  {
    id: "demo-6",
    nombre: "Falda Plisada",
    categoria: "Mujer",
    precio: 175,
    tallas: "XS,S,M",
    colores: "Beige,Negro",
    descripcion: "Falda plisada de largo midi, cintura elastizada, caída fluida.",
    imagen_url:
      "https://images.unsplash.com/photo-1583496661160-fb5886a13d77?w=800&q=80",
    stock: 10,
  },
  {
    id: "demo-7",
    nombre: "Polera Básica Algodón",
    categoria: "Niños",
    precio: 79,
    tallas: "4,6,8,10",
    colores: "Blanco,Celeste,Amarillo",
    descripcion: "Polera 100% algodón peinado, cuello redondo, ideal para uso diario.",
    imagen_url:
      "https://images.unsplash.com/photo-1519457851160-3d63f8d0bb62?w=800&q=80",
    stock: 25,
  },
  {
    id: "demo-8",
    nombre: "Gorro de Lana",
    categoria: "Accesorios",
    precio: 55,
    tallas: "Único",
    colores: "Gris,Ocre,Negro",
    descripcion: "Gorro tejido a mano en lana gruesa, doble capa para mayor abrigo.",
    imagen_url:
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
    stock: 18,
  },
];
