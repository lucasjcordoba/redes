/**
 * Gesta Manager — lo que hace falta saber para escribir y publicar por la marca.
 *
 * Datos tomados del sitio (gestamanager.com, código en ~/dev/tour-app/web/src/app/page.tsx)
 * y de la ficha de Play Store (~/dev/tour-app/docs/play-store/ficha.md), que son
 * la fuente de verdad: si cambia algo allá, se cambia acá.
 *
 * La cuenta es compartida con la gente del proyecto: ver "Moderadores" en el README.
 */
export const marca = {
  id: "gesta",
  nombre: "Gesta Manager",
  usuario: "@gestamanager", // TODO: confirmar el usuario real de la cuenta
  sitio: "gestamanager.com",
  token: "IG_TOKEN_GESTA",

  queHace:
    "Sistema de gestión para producciones en vivo y audiovisuales: giras musicales, " +
    "teatro y rodajes. Fechas con venue, horarios, contactos y estado; day sheet con la " +
    "hoja de ruta del día (citación, prueba de sonido, puertas, show), compartible con un " +
    "link; hoteles, rooming list que se genera solo, vuelos y autos; chat por gira y " +
    "mensajes directos con notas de voz, fotos y archivos; tareas con responsables y " +
    "recordatorios; borderó, gastos, per diems y liquidación por show en pesos, dólares o " +
    "euros; riders, contratos y planos por gira y por fecha; notificaciones push de cada " +
    "cambio; roles (managers, artistas, técnicos, elenco: cada uno ve lo suyo). Además, " +
    "ensayos (sala, convocatoria con confirmación, repertorio, equipo, grabaciones y " +
    "reporte en PDF) y merch (catálogo con precios, stock y costos, puesto de venta en " +
    "cada fecha por medio de pago, cierre en PDF). Web, Android y iPhone con la misma " +
    "cuenta. Hecho para producciones de Argentina y la región.",

  // Lo que se ofrece hoy en el sitio. Si cambia, se cambia acá.
  prueba: "Prueba gratis: todo Gesta Manager, sin límites, gratis durante toda la prueba. Se pide en gestamanager.com.",

  voz: [
    'Rioplatense con voseo: "probalo", "armás", "cambiaste un horario".',
    'Habla el equipo que lo construye, en plural: "armamos", "lo hicimos para".',
    "Concreto y del oficio: day sheet, borderó, rooming, prueba de sonido, citación. Sin explicarle a un manager lo que es su trabajo.",
    "Mostrar el sistema: cada post cuenta una cosa que se puede hacer, no promesas genéricas.",
    "No inventar precios, clientes, cifras de uso, testimonios ni funciones. Si no está en queHace, no existe.",
    "Cerrar con gestamanager.com. 4 a 6 hashtags.",
  ],

  pilares: {
    presentacion: "Qué es Gesta Manager.",
    problema: "El caos que resuelve: planillas, PDFs viejos y grupos de WhatsApp.",
    funcion: "Una función concreta del sistema, con captura de la demo.",
    modulo: "Un módulo completo: ensayos o merch.",
    audiencia: "Para quién es: música, teatro, rodajes; cada rol.",
    invitacion: "Probarlo: la prueba gratis y dónde se usa.",
  },

  calendario: { dias: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"], hora: "19:00" },
};
