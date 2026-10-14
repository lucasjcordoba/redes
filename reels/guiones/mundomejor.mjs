/** mundomejorok.com: el sitio de la productora Mundo Mejor, en escritorio y celular (~1 min). */
const B = "https://www.mundomejorok.com";

export const guion = {
  titulo: "Mundo Mejor",
  dominio: "mundomejorok.com",
  etiqueta: "/ MUNDOMEJOROK.COM",
  musica: "mundomejor",
  diseno: "mundomejor",
  url: B,
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
      voz: "Cada servicio tiene su lugar: booking, tour management, soluciones digitales, merch, equipo técnico y residencias.",
    },
    {
      titulo: "Quiénes somos",
      url: `${B}/quienes-somos`,
      voz: "Quiénes son y los valores que los guían: diversidad, independencia y cuidado.",
    },
    {
      titulo: "Artistas",
      url: `${B}/artistas`,
      voz: "El catálogo de artistas, con una página propia para cada uno,",
    },
    {
      titulo: "Cada artista",
      url: `${B}/eli-almic`,
      voz: "con su biografía y su recorrido.",
    },
    {
      titulo: "Contacto",
      url: `${B}/contacto`,
      voz: "Y un contacto directo para quien quiera sumarse o proponer algo.",
    },
  ],
};
