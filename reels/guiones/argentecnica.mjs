/**
 * Argentecnica · Gestión de OTs, en escritorio y celular (~2 min 20 s).
 *
 * Se graba contra la app corriendo en local (http://localhost:3200) apuntada
 * al proyecto de Supabase "argentecnica-demo", con datos inventados
 * (reels/demo/argentecnica-seed.mjs). Nunca contra la base del cliente.
 * La sesión se inicia a mano: node reels/sesion.mjs argentecnica http://localhost:3200/login
 */
import { limpiezaDev } from "../limpieza-dev.mjs";

const B = "http://localhost:3200";

export const guion = {
  titulo: "Argentecnica",
  dominio: "argentecnica-gestion.vercel.app",
  etiqueta: "/ ARGENTECNICA",
  musica: "industria",
  diseno: "argentecnica",
  sesion: "argentecnica",
  iniciales: [limpiezaDev],
  url: `${B}/`,
  escenas: [
    {
      titulo: "Órdenes de trabajo",
      voz: "Para Argentecnica, una empresa industrial con plantas en Munro y en Bragado, desarrollamos el sistema con el que sigue cada orden de trabajo. La lista muestra las OTs activas: el cliente, el diseño, el material, las compras y el avance de fabricación.",
    },
    {
      titulo: "Cada OT",
      url: `${B}/ots/1`,
      voz: "Cada OT tiene su ficha: la orden de compra del cliente, la aprobación del diseño, el anticipo y la fecha comprometida.",
    },
    {
      titulo: "Piezas",
      url: `${B}/ots/1`,
      sel: "table",
      margen: 140,
      voz: "Y su lista de piezas, con el plano, la planta que la fabrica, el material y el estado de cada una.",
    },
    {
      titulo: "Lo que la frena",
      url: `${B}/ots/3`,
      voz: "Si algo frena una OT, se ve enseguida: diseño sin aprobar, planos faltantes o material sin pedir.",
    },
    {
      titulo: "Fabricación",
      url: `${B}/fabricacion`,
      voz: "Fabricación muestra cada pieza en su puesto y cuántos días lleva ahí, y qué le falta para arrancar. El estado se cambia directamente desde la lista.",
    },
    {
      titulo: "Pedidos de material",
      url: `${B}/pedidos`,
      voz: "Las plantas cargan sus pedidos de material, y se ve qué compras ya se cumplieron y qué falta.",
    },
    {
      titulo: "Cada pedido",
      url: `${B}/pedidos/1`,
      voz: "Cada pedido se divide en compras, una por proveedor, con su número de orden, la factura y el pago.",
    },
    {
      titulo: "Órdenes de compra",
      url: `${B}/compras`,
      voz: "Compras sigue cada orden: pidiendo presupuesto, emitida, frenada por el pago o lista para retirar.",
    },
    {
      titulo: "Cada compra",
      url: `${B}/compras/1`,
      voz: "Con el proveedor, la condición de pago, sus renglones, las piezas que cubre y dónde está hoy el material.",
    },
    {
      titulo: "Alertas",
      url: `${B}/alertas`,
      voz: "Las alertas juntan todo lo que está trabado: OTs sin número, diseños sin aprobar, pedidos sin compra y piezas detenidas hace más de dos semanas.",
    },
    {
      titulo: "Equipo",
      url: `${B}/equipo/tareas`,
      voz: "El equipo se reparte tareas y avisos, vinculados a cada OT, pedido o compra.",
    },
    {
      titulo: "Avisos",
      url: `${B}/equipo/avisos`,
      voz: "Un aviso puede ir a una persona o a toda la empresa, y llega como notificación.",
    },
    {
      titulo: "Estados",
      url: `${B}/configuracion/estados`,
      voz: "Y los estados de fabricación se configuran por planta, con los mismos colores de la planilla de siempre. Todo se exporta a Excel y a PDF.",
    },
  ],
};
