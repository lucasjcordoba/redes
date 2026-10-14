/**
 * Guarda una sesión iniciada a mano, para grabar sistemas con login sin que
 * el script maneje contraseñas.
 *
 *   node reels/sesion.mjs <id> <url de login>
 *
 * Abre un Chrome visible en la página de login. Iniciás sesión vos; cuando la
 * dirección deja de ser la del login, se guardan las cookies y el
 * localStorage en reels/tmp/sesiones/<id>.json (fuera de git) y se cierra.
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
const login = new URL(url).pathname;
await page.waitForURL((u) => !u.pathname.startsWith(login) && !/login|auth/.test(u.pathname), { timeout: 15 * 60 * 1000 });
await page.waitForLoadState("networkidle").catch(() => {});
await ctx.storageState({ path: join(dir, `${id}.json`) });
await browser.close();
console.log(`✓ sesión guardada: reels/tmp/sesiones/${id}.json`);
