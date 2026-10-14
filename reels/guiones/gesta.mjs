/**
 * Gesta Manager por dentro, en escritorio y celular. El sitio público tiene
 * su propio reel (gesta-sitio.mjs).
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
const SHOW = `${GIRA}/shows/a0bcb19c-db83-4520-a0f2-5fa6d1c90a55`;

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
  // Recorrido largo (~2 min): es el proyecto con más para mostrar.
  escenas: [
    {
      titulo: "Panel de control",
      voz: "Gesta Manager es un sistema que desarrollamos para organizar producciones en vivo. El panel de control muestra las giras, los shows, lo que se cobró y lo que se gastó, de un vistazo. Y el próximo show, siempre a la vista.",
    },
    {
      titulo: "Giras",
      url: `${B}/giras`,
      voz: "Las giras quedan ordenadas: las que están en curso y las próximas, con sus fechas y sus ciudades.",
    },
    {
      titulo: "Cada gira",
      url: GIRA,
      voz: "Cada gira reúne sus fechas, el equipo, los archivos y las finanzas en una sola pantalla, con el estado de cada fecha.",
    },
    {
      titulo: "La hoja del show",
      url: SHOW,
      voz: "Y cada fecha tiene su hoja: el lugar, el cachet, el balance del show y todo lo que falta resolver antes de subir al escenario.",
    },
    {
      titulo: "Modo presentación",
      url: `${SHOW}/presentar`,
      voz: "Con un toque, la hoja se convierte en una presentación a pantalla completa, para repasar el show con todo el equipo.",
    },
    {
      titulo: "Itinerario",
      url: `${GIRA}/itinerario`,
      voz: "El itinerario ordena cada día: la carga, la prueba de sonido, la apertura de puertas, el telonero y el show, con sus horarios.",
    },
    {
      titulo: "Chat de la gira",
      url: `${GIRA}/chat`,
      voz: "Cada gira tiene su propio chat, en lugar del grupo de WhatsApp de siempre, y cada integrante también puede escribir por privado.",
    },
    {
      titulo: "Tareas",
      url: `${B}/tareas`,
      voz: "Las tareas se asignan a cada integrante, con prioridad, fecha límite y notas, para que nada quede en el aire.",
    },
    {
      titulo: "Agenda",
      url: `${B}/agenda`,
      voz: "La agenda junta shows, ensayos, viajes y días de descanso en un mismo calendario.",
    },
    {
      titulo: "Equipo",
      url: `${B}/equipo`,
      voz: "El equipo de la producción, con roles y permisos: cada persona ve lo que le corresponde.",
    },
    {
      titulo: "Contactos",
      url: `${B}/contactos`,
      voz: "Productores, técnicos, hoteles y demás contactos, en un directorio siempre a mano.",
    },
    {
      titulo: "Reportes",
      url: `${B}/analytics`,
      voz: "Y los reportes comparan cada año y cada ciudad. Gesta Manager funciona en la web, en iOS y en Android.",
    },
  ],
};
