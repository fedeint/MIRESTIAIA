/**
 * Datos de prueba para la Carta de Productos
 */

export const PRODUCT_CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'platos-fondo', label: 'Platos de fondo' },
  { id: 'sopas-entradas', label: 'Sopas y entradas' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'postres', label: 'Postres' },
  { id: 'ensaladas', label: 'Ensaladas' },
  { id: 'extras', label: 'Extras' }
];

export const MOCK_PRODUCTS = [
  {
    id: 1,
    sku: "PF001",
    name: "Lomo Saltado",
    category: "platos-fondo",
    categoryLabel: "Platos de fondo",
    price: "32.00",
    time: "25 min",
    status: "disponible",
    stock: 12,
    popular: true,
    description: "Clásico plato peruano con lomo fino, cebolla, tomate y papas fritas salteados al wok con el punto exacto de sazón.",
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594950195709-a14f66c242d7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop"
    ],
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop",
    promotions: [
      { id: 1, title: "Combo con bebida", description: "Agrega cualquier bebida por S/ 5.00 más", discount: "-15%" },
      { id: 2, title: "Descuento hoy", description: "10% de descuento en tu segundo plato", discount: "-10%" }
    ],
    reviews: [
      { id: 1, user: "María G.", rating: 5, comment: "Muy rico, bien servido. ¡Repetiría sin dudar!" }
    ]
  },
  {
    id: 2,
    sku: "PF002",
    name: "Arroz con Pollo",
    category: "platos-fondo",
    categoryLabel: "Platos de fondo",
    price: "28.00",
    time: "30 min",
    status: "disponible",
    stock: 8,
    popular: false,
    description: "Delicioso arroz verde a base de cilantro con presas de pollo doradas y ensalada criolla.",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop"],
    promotions: [],
    reviews: []
  },
  {
    id: 3,
    sku: "SE001",
    name: "Ceviche Clásico",
    category: "sopas-entradas",
    categoryLabel: "Sopas y entradas",
    price: "35.00",
    time: "15 min",
    status: "disponible",
    stock: 15,
    popular: true,
    description: "Ceviche de pescado fresco marinado en limón de pica, acompañado de camote y choclo.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c170db76?q=80&w=500&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1534422298391-e4f8c170db76?q=80&w=800&auto=format&fit=crop"],
    promotions: [],
    reviews: []
  },
  {
    id: 4,
    sku: "BE001",
    name: "Chicha Morada",
    category: "bebidas",
    categoryLabel: "Bebidas",
    price: "8.00",
    time: "5 min",
    status: "disponible",
    stock: 20,
    popular: true,
    description: "Bebida tradicional peruana hecha a base de maíz morado, piña y especias.",
    image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a810?q=80&w=500&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1595981267035-7b04ca84a810?q=80&w=800&auto=format&fit=crop"],
    promotions: [],
    reviews: []
  },
  {
    id: 6,
    sku: "PO001",
    name: "Torta de Chocolate",
    category: "postres",
    categoryLabel: "Postres",
    price: "12.00",
    time: "5 min",
    status: "agotado",
    stock: 0,
    popular: true,
    description: "Húmeda y deliciosa torta de chocolate con fudge artesanal.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=500&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop"],
    promotions: [],
    reviews: []
  }
];
