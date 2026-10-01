/** mundomejorok.com: el sitio de la productora Mundo Mejor, en escritorio y celular. */
export const guion = {
  titulo: "Mundo Mejor",
  dominio: "mundomejorok.com",
  etiqueta: "/ MUNDOMEJOROK.COM",
  voz: { voz: "valentina", nombre: "Valentina (Uruguay)" },
  url: "https://www.mundomejorok.com",
  escenas: [
    {
      titulo: "Mundo Mejor",
      voz: "Para Mundo Mejor, una productora artística independiente, desarrollamos un sitio con identidad propia.",
    },
    {
      titulo: "La productora",
      sel: 'h2:has-text("Arte con una mirada")',
      voz: "La productora se presenta como ella decide, sin depender de cómo ordena el contenido una red social.",
    },
    {
      titulo: "Servicios",
      sel: 'h2:has-text("Servicios")',
      voz: "Cada servicio tiene su lugar: booking, tour management, gestión de merch, equipo técnico y residencias.",
    },
    {
      titulo: "Artistas",
      url: "https://www.mundomejorok.com/artistas",
      voz: "Y el catálogo de artistas, con una página propia para cada uno.",
    },
    {
      titulo: "Trabajamos juntos",
      url: "https://www.mundomejorok.com",
      sel: 'h2:has-text("¿Trabajamos juntos?")',
      voz: "Con un contacto directo para quien quiera sumarse a la productora.",
    },
  ],
};
