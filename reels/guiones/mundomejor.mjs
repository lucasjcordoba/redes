/**
 * mundomejorok.com: el sitio de la productora Mundo Mejor, en escritorio y
 * celular. Cerca de un minuto. Lo que se cuenta sale del sitio y del post del
 * feed sobre este trabajo (marcas/raudal/posts/23-trabajo-mundomejor.json).
 */
export const guion = {
  titulo: "Mundo Mejor",
  dominio: "mundomejorok.com",
  etiqueta: "/ MUNDOMEJOROK.COM",
  musica: "mundomejor",
  diseno: "mundomejor",
  url: "https://www.mundomejorok.com",
  escenas: [
    {
      titulo: "Mundo Mejor",
      voz: "Mundo Mejor es una productora artística independiente: su trabajo es dar a conocer artistas. Para ellos desarrollamos su sitio.",
    },
    {
      titulo: "La productora",
      sel: 'h2:has-text("Arte con una mirada")',
      voz: "En una red social todas las cuentas se ven igual y el orden lo decide un algoritmo. Acá, la productora se presenta como ella decide.",
    },
    {
      titulo: "Servicios",
      sel: 'h2:has-text("Servicios")',
      voz: "Cada servicio tiene su lugar: booking, tour management, gestión de merch, equipo técnico y residencias.",
    },
    {
      titulo: "Artistas",
      url: "https://www.mundomejorok.com/artistas",
      voz: "El catálogo de artistas, con una página propia para cada uno.",
    },
    {
      titulo: "Presentarse primero",
      sigue: true,
      voz: "Porque una productora que presenta artistas necesita presentarse a sí misma primero.",
    },
    {
      titulo: "Trabajamos juntos",
      url: "https://www.mundomejorok.com",
      sel: 'h2:has-text("¿Trabajamos juntos?")',
      voz: "Y al final, un contacto directo para quien quiera trabajar con la productora.",
    },
  ],
};
