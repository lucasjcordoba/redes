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
  voz: { voz: "elena", ritmo: "+12%", nombre: "Elena (Argentina)" },
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
  escenas: [
    {
      titulo: "Panel de control",
      voz: "Gesta Manager es un sistema que desarrollamos para organizar giras musicales. El panel muestra el estado de toda la organización de un vistazo.",
    },
    {
      titulo: "Cada gira",
      url: GIRA,
      voz: "Cada gira reúne sus fechas, el equipo y las finanzas en una sola pantalla.",
    },
    {
      titulo: "La hoja del show",
      url: `${GIRA}/shows/a0bcb19c-db83-4520-a0f2-5fa6d1c90a55`,
      voz: "Y cada fecha tiene su hoja: el lugar, el cachet, el balance del show y todo lo que falta resolver.",
    },
    {
      titulo: "Itinerario",
      url: `${GIRA}/itinerario`,
      voz: "El itinerario ordena los horarios del día: pruebas de sonido, puertas, shows y traslados.",
    },
    {
      titulo: "Chat de la gira",
      url: `${GIRA}/chat`,
      voz: "Cada gira tiene su propio chat, en lugar del grupo de WhatsApp de siempre.",
    },
    {
      titulo: "Reportes",
      url: `${B}/analytics`,
      voz: "Y los reportes comparan cada año y cada ciudad. Gesta funciona en la web, en iOS y en Android.",
    },
  ],
};
