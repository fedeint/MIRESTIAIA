/**
 * Recetas/recetas-data.js
 * Datos iniciales para el módulo de Recetas
 */

export const RECETAS_MOCK_DATA = [
    { 
        id: 1, 
        nombre: "Ají de Gallina", 
        categoria: "Platos de fondo", 
        estado: "Inactiva", 
        costo: 5.445, 
        precioVenta: 18.00,
        foodCost: 30.25,
        tiempo: "25 min", 
        porciones: "1", 
        ingredientes: "7", 
        version: "v1",
        foto: null,
        detalleIngredientes: [
            { ingrediente: "Gallina entera", cantidad: "0.2 kg", costo: 2.80 },
            { ingrediente: "Ají amarillo", cantidad: "0.05 kg", costo: 0.40 },
            { ingrediente: "Leche evaporada", cantidad: "0.1 lt", costo: 0.50 },
            { ingrediente: "Queso fresco", cantidad: "0.03 kg", costo: 0.54 },
            { ingrediente: "Arroz", cantidad: "0.15 kg", costo: 0.525 },
            { ingrediente: "Huevos", cantidad: "1 und", costo: 0.50 },
            { ingrediente: "Aceite vegetal", cantidad: "0.03 lt", costo: 0.18 }
        ]
    },
    { 
        id: 2, 
        nombre: "Anticuchos de Corazón", 
        categoria: "Sopas y Entradas", 
        estado: "Activa", 
        costo: 8.50, 
        precioVenta: 25.00,
        foodCost: 34.00,
        tiempo: "20 min", 
        porciones: "1", 
        ingredientes: "5", 
        version: "v1",
        foto: null,
        detalleIngredientes: []
    },
    { 
        id: 3, 
        nombre: "Arroz Chaufa de Pollo", 
        categoria: "Platos de fondo", 
        estado: "Inactiva", 
        costo: 4.80, 
        precioVenta: 15.00,
        foodCost: 32.00,
        tiempo: "15 min", 
        porciones: "1", 
        ingredientes: "6", 
        version: "v1",
        foto: null,
        detalleIngredientes: []
    },
    { 
        id: 4, 
        nombre: "Arroz Chaufa Especial", 
        categoria: "Platos de fondo", 
        estado: "Activa", 
        costo: 6.20, 
        precioVenta: 22.00,
        foodCost: 28.18,
        tiempo: "20 min", 
        porciones: "1", 
        ingredientes: "7", 
        version: "v1",
        foto: null,
        detalleIngredientes: []
    },
    { 
        id: 5, 
        nombre: "Arroz con Leche", 
        categoria: "Postres", 
        estado: "Activa", 
        costo: 2.10, 
        precioVenta: 8.00,
        foodCost: 26.25,
        tiempo: "30 min", 
        porciones: "1", 
        ingredientes: "5", 
        version: "v1",
        foto: null,
        detalleIngredientes: []
    }
];
