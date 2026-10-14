/** gestamanager.com: el sitio público de Gesta Manager (el sistema por dentro está en gesta.mjs). */
export const guion = {
  titulo: "Gesta Manager · sitio",
  dominio: "gestamanager.com",
  etiqueta: "/ GESTAMANAGER.COM",
  musica: "estreno",
  diseno: "gestaSitio",
  url: "https://www.gestamanager.com",
  escenas: [
    {
      titulo: "El sitio",
      voz: "Gesta Manager también tiene su sitio, que desarrollamos para presentar el sistema en un solo recorrido.",
    },
    {
      titulo: "Todo en un lugar",
      sel: 'h2:has-text("Todo lo que la producción necesita")',
      voz: "Muestra lo que resuelve: giras, cronogramas, hoteles, traslados, chat, tareas, finanzas y archivos.",
    },
    {
      titulo: "Para quién",
      sel: 'h2:has-text("Música, teatro y cine")',
      voz: "Para giras musicales, obras de teatro y rodajes.",
    },
    {
      titulo: "Empezá",
      sel: 'h2:has-text("Empezá a usar Gesta Manager")',
      voz: "Y termina en una invitación clara a empezar a usarlo.",
    },
  ],
};
