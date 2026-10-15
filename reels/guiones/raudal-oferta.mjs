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
  etiqueta: "/ OFERTA RAUDAL DEV",
  // Franja fija durante todo el reel y placa final propia: que se entienda
  // en cualquier segundo que es una oferta y cuánto cuesta.
  banner: "LANDING PAGE · USD 250 · 7 DÍAS",
  cierreSegundos: 4,
  cierreOferta: {
    arriba: "OFERTA RAUDAL DEV",
    linea: "Landing page en 7 días",
    precio: "USD 250",
    detalle: "Dominio incluido · Boceto sin cargo en 48 h",
    url: "raudaldev.com/landing",
    pie: "50 % al aprobar el diseño, 50 % al publicar",
  },
  musica: "raudal",
  diseno: "raudal",
  url: OFERTA,
  escenas: [
    {
      titulo: "Landing page en 7 días",
      voz: "En Raudal Dev tenemos una oferta: una landing page lista en 7 días, por USD 250, con el dominio incluido.",
    },
    {
      titulo: "Ejemplo: TecnoAid",
      url: "https://www.tecnoaidar.com",
      dominio: "tecnoaidar.com",
      voz: "Una sola página con lo que un cliente necesita saber, como la de TecnoAid: cada falla explicada y un botón que abre WhatsApp.",
    },
    {
      titulo: "Ejemplo: Gesta Manager",
      url: "https://www.gestamanager.com",
      dominio: "gestamanager.com",
      voz: "O la de Gesta Manager, que presenta un sistema en un solo recorrido.",
    },
    {
      titulo: "Boceto sin cargo en 48 h",
      url: OFERTA,
      sel: "text=/ cómo funciona",
      margen: 120,
      voz: "Antes de decidir, mandamos un boceto de la portada, sin cargo, en 48 horas.",
    },
    {
      titulo: "USD 250, dominio incluido",
      url: OFERTA,
      sel: "#boceto",
      margen: 40,
      voz: "Con el diseño aprobado se paga la mitad, y en 7 días la página está publicada. El boceto se pide en raudaldev.com/landing.",
    },
  ],
};
