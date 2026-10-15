/**
 * Reel de la oferta de landing page, sin voz (~31 s). Todo se tiene que
 * entender leyendo: frases cortas y grandes, el precio y ejemplos reales.
 * Datos: la oferta de marcas/raudal/marca.mjs.
 */
export const promo = {
  musica: "raudal",
  banner: { arriba: "LANDING PAGE", precio: "USD 250", abajo: "Lista en 7 días" },
  bloques: [
    { tipo: "frase", duracion: 2.8, lineas: [["¿El negocio"], ["todavía no tiene"], ["página web?", "cian"]] },
    { tipo: "frase", duracion: 2.6, lineas: [["Landing page"], ["lista en"], ["7 días", "gradiente"]] },
    { tipo: "pantallas", duracion: 4.6, url: "https://www.tecnoaidar.com", dominio: "tecnoaidar.com", titulo: ["Servicios, WhatsApp", "y formulario"] },
    { tipo: "pantallas", duracion: 4.2, url: "https://www.gestamanager.com", dominio: "gestamanager.com", titulo: ["Diseño propio,", "en celular y compu"] },
    { tipo: "lista", duracion: 3.6, titulo: "Incluye", items: ["Hasta 6 secciones", "WhatsApp y formulario", "Dominio el primer año", "Una ronda de cambios"] },
    { tipo: "frase", duracion: 3, chico: true, lineas: [["Boceto de la portada"], ["sin cargo", "cian"], ["en 48 horas"]] },
    { tipo: "precio", duracion: 3, arriba: "TODO POR", prefijo: "USD", desde: 0, hasta: 250, abajo: "Dominio incluido" },
    { tipo: "cierre", duracion: 4.5, arriba: "OFERTA RAUDAL DEV", linea: "Landing page en 7 días", precio: "USD 250", detalle: "Boceto sin cargo en 48 h", url: "raudaldev.com/landing", pie: "50 % al aprobar el diseño · 50 % al publicar" },
  ],
};
