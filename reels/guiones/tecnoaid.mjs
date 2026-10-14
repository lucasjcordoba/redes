/** tecnoaidar.com: el sitio del servicio técnico TecnoAid, en escritorio y celular. */
export const guion = {
  titulo: "TecnoAid",
  dominio: "tecnoaidar.com",
  etiqueta: "/ TECNOAIDAR.COM",
  musica: "tecnoaid",
  diseno: "tecnoaid",
  url: "https://www.tecnoaidar.com",
  // Versión corta (~30 s): es una landing.
  escenas: [
    {
      titulo: "TecnoAid",
      voz: "Para TecnoAid, un servicio técnico de Zona Norte, desarrollamos un sitio para quien tiene un problema con su equipo.",
    },
    {
      titulo: "Fallas frecuentes",
      sel: 'h2:has-text("le está pasando a tu equipo")',
      voz: "Cada falla tiene su explicación y un botón que abre WhatsApp con la consulta ya escrita.",
    },
    {
      titulo: "Cómo trabajan",
      sel: 'h2:has-text("Cómo trabajamos")',
      voz: "Diagnóstico sin cargo, presupuesto previo y reparación con garantía.",
    },
    {
      titulo: "Dónde atienden",
      sel: 'h2:has-text("Dónde te atendemos")',
      voz: "En el taller, a domicilio o con soporte remoto.",
    },
  ],
};
