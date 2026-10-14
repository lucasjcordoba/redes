/**
 * raudaldev.com: el sitio de Raudal Dev, en escritorio y celular.
 *
 * La locución de los reels va en primera persona del plural ("En Raudal Dev,
 * desarrollamos…"), como habla el propio sitio. Las placas del feed siguen en
 * tercera persona (ver marcas/raudal/marca.mjs).
 */
export const guion = {
  titulo: "Raudal Dev",
  dominio: "raudaldev.com",
  etiqueta: "/ RAUDALDEV.COM",
  cierre: "CONSULTAS SIN CARGO",
  musica: "raudal",
  diseno: "raudal",
  url: "https://www.raudaldev.com",
  // Versión corta (~30 s): es una landing.
  escenas: [
    {
      titulo: "Raudal Dev",
      voz: "En Raudal Dev, desarrollamos sitios web, sistemas de gestión y aplicaciones a medida.",
    },
    {
      titulo: "Qué hacemos",
      sel: 'h2:has-text("Qué hacemos")',
      voz: "Desde la presencia online de un negocio hasta el sistema con el que se organiza por dentro.",
    },
    {
      titulo: "Claridad en cada etapa",
      sel: 'h2:has-text("Claridad en cada etapa")',
      voz: "Con presupuesto cerrado, sin tecnicismos y trato directo con quien desarrolla.",
    },
    {
      titulo: "Conversemos",
      sel: 'h2:has-text("Conversemos")',
      voz: "La primera reunión y el presupuesto no tienen costo. Más información en raudaldev.com.",
    },
  ],
};
