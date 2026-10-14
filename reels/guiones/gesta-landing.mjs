/**
 * gestamanager.com: la landing de Gesta Manager, en escritorio y celular.
 *
 * Corto: es una página simple. El sistema por dentro tiene su propio reel
 * (gesta.mjs).
 */
export const guion = {
  titulo: "Gesta Manager · sitio",
  dominio: "gestamanager.com",
  etiqueta: "GESTAMANAGER.COM",
  musica: "gesta",
  diseno: "entrada",
  url: "https://www.gestamanager.com",
  escenas: [
    {
      titulo: "Toda la producción",
      voz: "Para Gesta Manager desarrollamos también su sitio: la presentación del sistema para giras, obras de teatro y rodajes.",
    },
    {
      titulo: "Funcionalidades",
      sel: "#funcionalidades",
      voz: "Cada funcionalidad en su tarjeta: fechas, cronogramas, traslados, finanzas y el chat del equipo.",
    },
    {
      titulo: "Para quién",
      sel: "#para-quien",
      voz: "Una sección para cada tipo de producción: música, teatro y cine.",
    },
    {
      titulo: "Menos caos",
      sel: 'h2:has-text("Menos caos")',
      voz: "Los motivos para usarlo, en frases cortas.",
    },
    {
      titulo: "Pedir acceso",
      sel: "#contacto",
      voz: "Y un formulario para pedir acceso, porque Gesta funciona por invitación.",
    },
  ],
};
