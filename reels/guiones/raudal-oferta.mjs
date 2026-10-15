/**
 * Reel de la oferta de landing page de Raudal Dev (~35 s).
 *
 * Muestra la página de la oferta y dos landings ya hechas como ejemplo. La
 * página de la oferta se graba desde el build local del sitio
 * (http://localhost:3300, rama feat/oferta-landing de raudal-dev) hasta que
 * esté publicada; después alcanza con cambiar OFERTA a https://www.raudaldev.com/landing.
 */
const OFERTA = "http://localhost:3300/landing";

export const guion = {
  titulo: "Raudal Dev · oferta",
  dominio: "raudaldev.com/landing",
  etiqueta: "/ RAUDALDEV.COM",
  cierre: "BOCETO SIN CARGO",
  musica: "raudal",
  diseno: "raudal",
  url: OFERTA,
  escenas: [
    {
      titulo: "USD 250",
      voz: "Una landing page lista en 7 días, por USD 250, con el dominio incluido.",
    },
    {
      titulo: "Como TecnoAid",
      url: "https://www.tecnoaidar.com",
      dominio: "tecnoaidar.com",
      voz: "Una sola página con lo que un cliente necesita saber, como la de TecnoAid: cada falla explicada y un botón que abre WhatsApp.",
    },
    {
      titulo: "O Gesta Manager",
      url: "https://www.gestamanager.com",
      dominio: "gestamanager.com",
      voz: "O la de Gesta Manager, que presenta un sistema en un solo recorrido.",
    },
    {
      titulo: "Boceto sin cargo",
      url: OFERTA,
      sel: 'text=/ cómo funciona',
      margen: 120,
      voz: "Antes de decidir, mandamos un boceto de la portada, sin cargo, en 48 horas.",
    },
    {
      titulo: "4 cupos por mes",
      url: OFERTA,
      sel: "#boceto",
      margen: 40,
      voz: "Con el diseño aprobado se paga la mitad, y en 7 días la página está publicada. Hay 4 cupos por mes. El boceto se pide en raudaldev.com/landing.",
    },
  ],
};
