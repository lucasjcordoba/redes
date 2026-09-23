/**
 * TecnoAid — lo que hace falta saber para escribir y publicar por la marca.
 *
 * Datos tomados de tecnoaid/lib/site.ts, que es la fuente de verdad del
 * sitio: si cambia el teléfono o la zona, se cambia allá y acá.
 */
export const marca = {
  id: "tecnoaid",
  nombre: "TecnoAid",
  usuario: "@tecno.aid",
  token: "IG_TOKEN_TECNOAID",

  whatsapp: "11 2655-3546",
  zona: "Zona Norte: Vicente López y La Lucila",

  queHace:
    "Servicio técnico de notebooks y PCs (reparación, pantallas, teclados, baterías, " +
    "limpieza, upgrades de SSD y RAM, migración de disco), venta de equipos " +
    "reacondicionados a medida y soporte para escuelas y pequeños negocios. " +
    "En el taller, a domicilio en Zona Norte y remoto a todo el país. " +
    "Diagnóstico sin cargo, presupuesto antes de tocar nada, repuestos con garantía.",

  voz: [
    'Rioplatense y con voseo: "escribinos", "traela", "fijate".',
    'Directo y sin tecnicismos. "Sin vueltas", "sin chamuyo", "te explicamos en castellano".',
    "Tranquilizar antes que asustar: casi nada está perdido, y se dice así.",
    "Hablarle a alguien que no sabe de computadoras y no tiene por qué saber.",
    "Consejos concretos y seguros de seguir en casa; nada que requiera abrir el equipo.",
    "No inventar precios, plazos, casos ni testimonios. Si hace falta un dato que no está acá, no se usa.",
    "Cerrar siempre con el WhatsApp y la zona. 4 a 6 hashtags, al menos uno local.",
  ],

  pilares: {
    presentacion: "Qué es TecnoAid y qué resuelve.",
    sintoma: "Un problema que la persona reconoce en su equipo, qué suele ser y que tiene arreglo.",
    tip: "Un consejo práctico de cuidado o de emergencia que se puede aplicar en casa.",
    servicio: "Un servicio concreto: reparación, reacondicionados, instituciones, remoto.",
    confianza: "Cómo trabaja: diagnóstico sin cargo, presupuesto previo, garantía.",
    trabajo: "Un trabajo real, con foto real. Sólo con material del taller: no se inventa.",
  },

  // Lunes, miércoles y viernes: no se pisa con Raudal (martes, jueves, sábado).
  calendario: { dias: ["lunes", "miercoles", "viernes"], hora: "18:30" },
};
