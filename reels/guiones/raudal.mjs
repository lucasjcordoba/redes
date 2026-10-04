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
  url: "https://www.raudaldev.com",
  escenas: [
    {
      titulo: "Raudal Dev",
      voz: "En Raudal Dev, desarrollamos sitios web, sistemas de gestión y aplicaciones a medida, para personas y empresas.",
    },
    {
      titulo: "Qué hacemos",
      sel: 'h2:has-text("Qué hacemos")',
      voz: "Trabajamos en cinco áreas: desde la presencia online de un negocio hasta el sistema con el que se organiza por dentro.",
    },
    {
      titulo: "Cómo trabajamos",
      sel: 'h2:has-text("Cómo trabajamos")',
      voz: "Cada proyecto sigue cuatro etapas: relevamiento, propuesta, desarrollo, y lanzamiento, con soporte después de la entrega.",
    },
    {
      titulo: "Claridad en cada etapa",
      sel: 'h2:has-text("Claridad en cada etapa")',
      voz: "El presupuesto es cerrado y por escrito, hablamos sin tecnicismos, y el trato es directo con quien desarrolla.",
    },
    {
      titulo: "Conversemos",
      sel: 'h2:has-text("Conversemos")',
      voz: "La primera reunión y el presupuesto no tienen costo. Más información en raudaldev.com.",
    },
  ],
};
