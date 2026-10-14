/**
 * Gesta Manager por dentro, en escritorio y celular.
 *
 * Se graba contra la copia LOCAL del sistema (http://localhost:3100, base
 * gesta_demo) con la organización ficticia AURORA: en un reel público no
 * puede aparecer un nombre ni un monto de un cliente real. Nunca contra
 * producción. Cómo levantar el entorno: ver reels/README.md.
 *
 * El usuario de demo es demo.aurora@gestamanager.com y su contraseña local
 * está en .env como GESTA_DEMO_PASS.
 */
import { limpiezaGesta } from "../gesta-limpieza.mjs";

const B = "http://localhost:3100";
const GIRA = `${B}/giras/a36a5f40-e854-42bc-a965-59dec067a5c5`;

export const guion = {
  titulo: "Gesta Manager",
  dominio: "gestamanager.com",
  etiqueta: "/ GESTAMANAGER.COM",
  musica: "gesta",
  diseno: "gesta",
  iniciales: [limpiezaGesta],
  async preparar(page) {
    if (!process.env.GESTA_DEMO_PASS) throw new Error("Falta GESTA_DEMO_PASS en .env");
    await page.goto(`${B}/login`, { waitUntil: "domcontentloaded" });
    await page.locator("#email").fill("demo.aurora@gestamanager.com");
    await page.locator("#password").fill(process.env.GESTA_DEMO_PASS);
    await page.getByRole("button", { name: /^entrar$/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 30000 });
  },
  url: `${B}/dashboard`,
  // Unos dos minutos: es el sistema con más para mostrar. Lo que se cuenta
  // sale de gestamanager.com; las escenas con `sigue` siguen bajando por la
  // misma pantalla. Las rutas /giras, /agenda y /equipo son las de las
  // capturas de la landing (inicio, giras, agenda, equipo): confirmarlas en
  // la copia local antes de grabar.
  escenas: [
    {
      titulo: "Panel de control",
      voz: "Gesta Manager es un sistema de gestión que desarrollamos para producciones en vivo: giras musicales, obras de teatro y rodajes.",
    },
    {
      titulo: "Todo en un lugar",
      sigue: true,
      voz: "Lo que antes vivía en diez planillas y tres grupos de WhatsApp, ahora vive acá. El panel muestra toda la organización de un vistazo.",
    },
    {
      titulo: "Giras y fechas",
      url: `${B}/giras`,
      voz: "La gira, la temporada o el plan de rodaje se organiza una sola vez: giras completas o fechas sueltas.",
    },
    {
      titulo: "Cada gira",
      url: GIRA,
      voz: "Cada gira reúne sus fechas, el equipo y las finanzas en una sola pantalla.",
    },
    {
      titulo: "En tiempo real",
      sigue: true,
      voz: "Cuando algo cambia, cambia para todos al instante: músicos, técnicos y producción ven la misma información.",
    },
    {
      titulo: "La hoja del show",
      url: `${GIRA}/shows/a0bcb19c-db83-4520-a0f2-5fa6d1c90a55`,
      voz: "Cada fecha tiene su hoja: el venue, los horarios, los contactos y el estado de lo que falta resolver.",
    },
    {
      titulo: "Finanzas del show",
      sigue: true,
      voz: "Y sus números: borderó, gastos, per diems y la liquidación del show, en pesos, dólares o euros.",
    },
    {
      titulo: "Cronograma del día",
      url: `${GIRA}/itinerario`,
      voz: "El cronograma ordena la jornada: citación, prueba de sonido, apertura de puertas y show. Se comparte con el venue con un link.",
    },
    {
      titulo: "Hoteles y traslados",
      sigue: true,
      voz: "En la misma hoja de ruta van los hoteles, los vuelos y los traslados. El rooming se genera solo, listo para mandar.",
    },
    {
      titulo: "Agenda",
      url: `${B}/agenda`,
      voz: "La agenda junta todas las fechas en un mismo calendario, que además se puede exportar.",
    },
    {
      titulo: "Chat de la gira",
      url: `${GIRA}/chat`,
      voz: "Cada gira tiene su chat, con notas de voz, fotos y archivos, en lugar del grupo de WhatsApp de siempre.",
    },
    {
      titulo: "Equipo y roles",
      url: `${B}/equipo`,
      voz: "Cada rol ve lo suyo: el artista su itinerario, el técnico su rider y producción todo. Al equipo se lo invita por email o con un código.",
    },
    {
      titulo: "Reportes",
      url: `${B}/analytics`,
      voz: "Los reportes muestran cómo viene la gira, y comparan cada año y cada ciudad.",
    },
    {
      titulo: "Web, iOS y Android",
      sigue: true,
      voz: "Cada cambio de horario, tarea o mensaje llega como notificación al instante. Gesta funciona en la web, en iOS y en Android.",
    },
  ],
};
