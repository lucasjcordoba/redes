/**
 * Guarda una sesión iniciada a mano, para grabar sistemas con login sin que
 * el script maneje contraseñas.
 *
 *   node reels/sesion.mjs <id> <url de login>
 *
 * Abre un Chrome visible en la página de login. Iniciás sesión vos (con mail
 * o con Google); cuando volvés al sitio, fuera del login, y ya hay una cookie
 * de sesión, se guardan las cookies y el localStorage en
 * reels/tmp/sesiones/<id>.json (fuera de git) y se cierra.
 * El grabador las usa si el guion tiene `sesion: "<id>"`.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { RAIZ } from "../lib/rutas.mjs";
import { CHROME } from "./grabador.mjs";

const [id, url] = process.argv.slice(2);
if (!id || !url) { console.error("Uso: node reels/sesion.mjs <id> <url de login>"); process.exit(2); }
const dir = join(RAIZ, "reels/tmp/sesiones");
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: false });
const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 }, locale: "es-AR" });
const page = await ctx.newPage();
await page.goto(url);
console.log("Iniciá sesión en la ventana de Chrome que se abrió…");
// Listo cuando se vuelve al mismo sitio, fuera del login, con cookie de sesión
// (las de Supabase se llaman sb-<proyecto>-auth-token; el code-verifier del
// login con Google no cuenta).
// El sitio puede volver de Google a otro dominio (el de producción), así que
// vale cualquier origen que no sea el del proveedor de identidad.
const conSesion = async () => {
  const u = new URL(page.url());
  if (/google\.|apple\.|supabase\.co|facebook\./.test(u.hostname) || /login|auth|registro/.test(u.pathname)) return false;
  const cookies = await ctx.cookies(u.origin);
  return cookies.some((c) => /auth-token(\.\d+)?$|session/i.test(c.name));
};
const limite = Date.now() + 15 * 60 * 1000;
while (!(await conSesion().catch(() => false))) {
  if (Date.now() > limite) throw new Error("No se inició sesión en 15 minutos");
  await new Promise((r) => setTimeout(r, 1000));
}
await page.waitForLoadState("networkidle").catch(() => {});
await new Promise((r) => setTimeout(r, 2000));
const final = page.url();
await ctx.storageState({ path: join(dir, `${id}.json`) });
await browser.close();
console.log(`✓ sesión guardada: reels/tmp/sesiones/${id}.json (sitio: ${new URL(final).origin})`);
