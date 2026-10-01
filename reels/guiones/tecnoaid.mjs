/** tecnoaidar.com: el sitio del servicio técnico TecnoAid, en escritorio y celular. */
export const guion = {
  titulo: "TecnoAid",
  dominio: "tecnoaidar.com",
  etiqueta: "/ TECNOAIDAR.COM",
  voz: { voz: "tania", nombre: "Tania (Paraguay)" },
  url: "https://www.tecnoaidar.com",
  escenas: [
    {
      titulo: "TecnoAid",
      voz: "Para TecnoAid, un servicio técnico de Zona Norte, desarrollamos un sitio pensado para quien tiene un problema con su equipo.",
    },
    {
      titulo: "Fallas frecuentes",
      sel: 'h2:has-text("le está pasando a tu equipo")',
      voz: "Cada falla frecuente tiene su explicación, y un botón que abre WhatsApp con la consulta ya escrita.",
    },
    {
      titulo: "Cómo trabajan",
      sel: 'h2:has-text("Cómo trabajamos")',
      voz: "El proceso, en cuatro pasos: la consulta, el diagnóstico sin cargo, el presupuesto previo y la reparación con garantía.",
    },
    {
      titulo: "Qué hacen",
      sel: 'h2:has-text("Qué hacemos")',
      voz: "Reparación y mantenimiento, equipos reacondicionados, consolas y joysticks, y planes para instituciones.",
    },
    {
      titulo: "Dónde atienden",
      sel: 'h2:has-text("Dónde te atendemos")',
      voz: "Y dónde atienden: en el taller, a domicilio o con soporte remoto.",
    },
  ],
};
