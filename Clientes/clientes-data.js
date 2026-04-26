/**
 * Clientes/clientes-data.js
 * Datos iniciales para el módulo de Clientes
 */

export const CLIENTES_MOCK_DATA = [
    {
        id: 1,
        nombre: "María García Villanueva",
        email: "maria.garcia@gmail.com",
        telefono: "+51 987 654 321",
        avatar: "MG",
        tipo: "VIP",
        arquetipo: "El Ejecutivo Habitual",
        ltv: 1840.00,
        pedidos: 12,
        ticketPromedio: 153.00,
        ultimaVisita: "hace 3 días",
        suscrito: true,
        score: 87,
        rfm: { recencia: "30/30", frecuencia: "30/30", monetario: "27/40", engagement: 87 },
        comportamiento: {
            horario: "12:30 - 14:00",
            dias: "Lun - Vie",
            platos: ["Ceviche Mixto", "Lomo Saltado", "Ají de Gallina"]
        },
        nurturing: {
            tactica: "Cumpleaños VIP + 2x Puntos",
            estado: "Activa",
            proximaAccion: "Enviar campaña cumpleaños el 20 abr (WhatsApp)"
        }
    },
    {
        id: 2,
        nombre: "Carlos Mendoza",
        email: "carlos.m@mail.com",
        telefono: "+51 987 654 321",
        avatar: "CA",
        tipo: "Cliente",
        arquetipo: "Visitante de Fin de Semana",
        ltv: 1970.00,
        pedidos: 8,
        ticketPromedio: 246.25,
        ultimaVisita: "hace 1 sem.",
        suscrito: true,
        score: 65,
        rfm: { recencia: "20/30", frecuencia: "20/30", monetario: "25/40", engagement: 60 },
        comportamiento: {
            horario: "19:00 - 21:00",
            dias: "Sáb - Dom",
            platos: ["Parrilla Familiar", "Pisco Sour"]
        },
        nurturing: {
            tactica: "Reactivación 30 días",
            estado: "En espera",
            proximaAccion: "Recordatorio de reserva para viernes"
        }
    },
    {
        id: 3,
        nombre: "Ana Rivera",
        email: "ana.r@mail.com",
        telefono: "+51 912 345 678",
        avatar: "AN",
        tipo: "Regular",
        arquetipo: "Cena Corporativa",
        ltv: 340.00,
        pedidos: 15,
        ticketPromedio: 22.60,
        ultimaVisita: "hace 3 días",
        suscrito: false,
        score: 45,
        rfm: { recencia: "10/30", frecuencia: "15/30", monetario: "15/40", engagement: 40 },
        comportamiento: {
            horario: "20:00 - 22:00",
            dias: "Jueves",
            platos: ["Tablas de Quesos", "Vino Tinto"]
        },
        nurturing: {
            tactica: "Conversión a VIP",
            estado: "Inactiva",
            proximaAccion: "Ninguna programada"
        }
    },
    {
        id: 4,
        nombre: "Distribuidora XYZ",
        email: "ventas@xyz.com",
        telefono: "+51 999 888 777",
        avatar: "DI",
        tipo: "Proveedor",
        arquetipo: "Insumos Críticos",
        ltv: 8500.00,
        pedidos: 45,
        ticketPromedio: 188.80,
        ultimaVisita: "ayer",
        suscrito: true,
        score: 95,
        rfm: { recencia: "30/30", frecuencia: "30/30", monetario: "40/40", engagement: 95 },
        comportamiento: {
            horario: "08:00 - 10:00",
            dias: "Lunes",
            platos: ["Insumos frescos"]
        },
        nurturing: {
            tactica: "Fidelización B2B",
            estado: "Completada",
            proximaAccion: "Renovación de contrato en 15 días"
        }
    }
];
