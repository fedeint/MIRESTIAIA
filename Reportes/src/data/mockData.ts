// Mock data for the restaurant reports system

export const reportTypes = [
  { id: "resumen-dia", name: "Resumen del Día", description: "Ventas, platos, mesas, caja", icon: "📊" },
  { id: "inventario", name: "Inventario", description: "Stock actual y movimientos", icon: "📦" },
  { id: "movimientos-almacen", name: "Movimientos de Almacén", description: "Entradas y salidas de productos", icon: "🔄" },
  { id: "gastos", name: "Gastos", description: "Registro de gastos operativos", icon: "💸" },
];

export const reportSections = [
  { id: "ventas", label: "Ventas del día", description: "Total de ventas y desglose por canal" },
  { id: "platos", label: "Platos vendidos", description: "Detalle de platos y cantidades" },
  { id: "mesas", label: "Mesas atendidas", description: "Resumen de ocupación y servicio" },
  { id: "caja", label: "Caja", description: "Movimientos de caja y cierre" },
];

// Preview data for report
export const reportPreviewData = {
  restaurant: "MiRest",
  date: "30 de Marzo, 2026",
  type: "Resumen del Día",
  ventas: {
    total: 7770,
    efectivo: 4200,
    tarjeta: 2800,
    delivery: 770,
    pedidos: 42,
    ticketPromedio: 185,
  },
  platos: [
    { nombre: "Lomo Saltado", cantidad: 38, precio: 32, total: 1216 },
    { nombre: "Ají de Gallina", cantidad: 28, precio: 28, total: 784 },
    { nombre: "Arroz Chaufa de Pollo", cantidad: 25, precio: 26, total: 650 },
    { nombre: "Arroz Chaufa Especial", cantidad: 22, precio: 30, total: 660 },
    { nombre: "Ceviche Clásico", cantidad: 20, precio: 35, total: 700 },
    { nombre: "Causa Limeña", cantidad: 18, precio: 22, total: 396 },
    { nombre: "Tallarín Saltado", cantidad: 16, precio: 28, total: 448 },
    { nombre: "Seco de Res con Frejoles", cantidad: 14, precio: 30, total: 420 },
    { nombre: "Pollo a la Brasa 1/4", cantidad: 30, precio: 18, total: 540 },
    { nombre: "Papa a la Huancaína", cantidad: 12, precio: 16, total: 192 },
  ],
  mesas: {
    totalAtendidas: 28,
    mesaMayor: { mesa: "Mesa 5", total: 580 },
    ocupacion: "72%",
  },
  caja: {
    apertura: 500,
    ingresoEfectivo: 4200,
    ingresoTarjeta: 2800,
    egresos: 320,
    cierre: 7180,
    diferencia: 0,
  },
};

export const reportHistory = [
  { id: "1", tipo: "Resumen del Día", fecha: "30/03/2026 — 14:35", usuario: "Admin", formato: "PDF" },
  { id: "2", tipo: "Inventario", fecha: "29/03/2026 — 09:15", usuario: "Admin", formato: "Excel" },
  { id: "3", tipo: "Resumen del Día", fecha: "29/03/2026 — 18:20", usuario: "Gerente", formato: "PDF" },
  { id: "4", tipo: "Gastos", fecha: "28/03/2026 — 11:00", usuario: "Admin", formato: "PDF" },
  { id: "5", tipo: "Movimientos de Almacén", fecha: "27/03/2026 — 16:45", usuario: "Admin", formato: "Excel" },
  { id: "6", tipo: "Resumen del Día", fecha: "27/03/2026 — 19:10", usuario: "Gerente", formato: "PDF" },
];

export const savedTemplates = [
  { id: "t1", nombre: "Reporte diario gerente", tipo: "Resumen del Día", secciones: ["ventas", "platos", "mesas", "caja"] },
  { id: "t2", nombre: "Cierre de caja", tipo: "Resumen del Día", secciones: ["ventas", "caja"] },
  { id: "t3", nombre: "Control de inventario semanal", tipo: "Inventario", secciones: ["ventas", "platos"] },
];

export const filterOptions = {
  products: ["Lomo Saltado", "Ají de Gallina", "Arroz Chaufa de Pollo", "Ceviche Clásico", "Causa Limeña", "Tallarín Saltado", "Papa a la Huancaína"],
  categories: ["Platos Fuertes", "Bebidas", "Entradas", "Postres", "Otros"],
  channels: ["Salón", "Delivery", "Para llevar", "App"],
  waiters: ["Carlos M.", "Ana R.", "Pedro L.", "María G.", "Juan S."],
};
