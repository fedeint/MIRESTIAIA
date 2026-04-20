export const DELIVERY_MOCK_DATA = [
  {
    id: "R-0101",
    customer: "Sebastián Díaz",
    address: "Calle Schell 310, Miraflores",
    time: "Ahora",
    price: "43.99",
    channel: "RAPPI",
    status: "pendiente",
    connected: true,
    items: [
      { name: "Hamburguesa Clásica", price: "22.00", qty: 1 },
      { name: "Papas Fritas Grandes", price: "12.00", qty: 1 },
      { name: "Gaseosa 500ml", price: "9.99", qty: 1 }
    ]
  },
  {
    id: "IA-0100",
    customer: "Valentina Ruiz",
    address: "Jr. Lampa 220, Centro",
    time: "Ahora",
    price: "21.05",
    channel: "DIRECT IA",
    status: "pendiente",
    connected: true,
    items: [
      { name: "Ensalada César", price: "15.50", qty: 1 },
      { name: "Agua Mineral", price: "5.55", qty: 1 }
    ]
  },
  {
    id: "R-8825",
    customer: "Luis Vargas",
    address: "Av. Brasil 567, Jesús María",
    time: "18 min",
    price: "38.50",
    channel: "RAPPI",
    status: "preparacion",
    connected: true,
    items: [
      { name: "Pizza Pepperoni M", price: "32.00", qty: 1 },
      { name: "Palitos de Ajo", price: "6.50", qty: 1 }
    ]
  },
  {
    id: "PY-4498",
    customer: "Rosa Chávez",
    address: "Calle Los Olivos 321, SMP",
    time: "22 min",
    price: "52.00",
    channel: "PEDIDOSYA",
    status: "preparacion",
    connected: true,
    items: [
      { name: "Pollo a la Brasa 1/4", price: "24.00", qty: 2 },
      { name: "Inca Kola 1.5L", price: "4.00", qty: 1 }
    ]
  },
  {
    id: "R-8820",
    customer: "Jorge Paredes",
    address: "Av. Universitaria 456, SMP",
    time: "35 min",
    price: "55.50",
    channel: "RAPPI",
    status: "listo",
    connected: true,
    rider: "Buscando rider Rappi...",
    items: [
      { name: "Combo Familiar Burger", price: "45.00", qty: 1 },
      { name: "Nuggets x10", price: "10.50", qty: 1 }
    ]
  }
];
