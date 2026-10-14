/** upgestiones.com: el sitio de UP gestiones (Seguridad e Higiene, CABA), en escritorio y celular (~1 min). */
const B = "https://www.upgestiones.com";

export const guion = {
  titulo: "UP gestiones",
  dominio: "upgestiones.com",
  etiqueta: "/ UPGESTIONES.COM",
  musica: "confianza",
  diseno: "upgestiones",
  url: B,
  escenas: [
    {
      titulo: "UP gestiones",
      voz: "Para UP gestiones, una consultora de Seguridad e Higiene de la Ciudad de Buenos Aires, desarrollamos un sitio que va directo a lo que preocupa: evitar clausuras e intimaciones.",
    },
    {
      titulo: "Servicios",
      sel: 'h2:has-text("Servicios")',
      voz: "Los servicios, explicados sin vueltas: Ley 5920, seguridad e higiene, capacitaciones, mediciones, simulacros e intimaciones.",
    },
    {
      titulo: "Por rubro",
      url: `${B}/rubros/restaurantes-y-bares/`,
      voz: "Páginas por rubro, como restaurantes y bares, con los riesgos y las dudas de cada actividad.",
    },
    {
      titulo: "Presupuesto transparente",
      url: B,
      sel: 'h2:has-text("Presupuesto transparente")',
      voz: "Un presupuesto transparente, con un ejemplo de cómo se ve antes de pedirlo.",
    },
    {
      titulo: "Ley 5920",
      url: `${B}/servicios/ley-5920/`,
      voz: "Una guía de la Ley 5920: qué incluye, cómo es el trámite y a quiénes alcanza.",
    },
    {
      titulo: "Contacto",
      url: `${B}/contacto/`,
      voz: "Y un formulario que llega por mail, con botones para responderle al cliente por WhatsApp o llamarlo.",
    },
  ],
};
