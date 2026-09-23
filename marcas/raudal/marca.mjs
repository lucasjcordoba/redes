/**
 * Raudal Dev — lo que hace falta saber para escribir y publicar por la marca.
 *
 * Lo leen dos: el publicador (token, calendario) y quien genere contenido
 * nuevo, sea una persona o Claude. Por eso la voz está escrita como
 * instrucciones y no como adjetivos.
 */
export const marca = {
  id: "raudal",
  nombre: "Raudal Dev",
  sitio: "raudaldev.com",
  // Nombre del secret / variable de entorno con el token de Instagram.
  token: "IG_TOKEN_RAUDAL",

  queHace:
    "Desarrollo de sitios web, sistemas de gestión y aplicaciones móviles a medida " +
    "para pymes y emprendedores. Zona Norte (Vicente López). Presupuesto cerrado, " +
    "primera reunión sin costo, trato directo con quien desarrolla.",

  voz: [
    "Raudal Dev es una empresa, no una persona. No se firma con nombre propio.",
    "No se tutea ni se vosea al lector. Las situaciones van en tercera persona: " +
      'en vez de "perdés ventas", "esas ventas se pierden".',
    "Registro institucional pero llano: nada de tecnicismos ni de jerga de marketing " +
      '("potenciá", "llevá tu negocio al siguiente nivel", "soluciones 360").',
    "Abrir con una escena o una frase concreta que el lector reconozca, no con la empresa.",
    "Párrafos cortos. Emojis sólo como viñetas (1️⃣ 📄 💬), nunca decorativos en el texto.",
    "Cerrar con raudaldev.com y 4 o 5 hashtags, al menos uno local (#vicentelopez, #zonanorte).",
  ],

  pilares: {
    presentacion: "Qué es Raudal Dev y cómo trabaja.",
    dolor: "Un problema cotidiano de un negocio sin herramientas digitales, y su costo invisible.",
    proceso: "Cómo es trabajar con Raudal: etapas, plazos, entregas.",
    claridad: "Preguntas que conviene hacerse o hacerle a un proveedor; desarmar mitos.",
    servicio: "Un servicio concreto y para quién sirve.",
    prueba: "Un trabajo entregado, con captura real. Sólo con material real: no se inventan casos.",
  },

  // Martes, jueves y sábado. Alternar pilares para que la cuenta no se lea
  // ni como catálogo ni como queja.
  calendario: { dias: ["martes", "jueves", "sabado"], hora: "19:00" },
};
