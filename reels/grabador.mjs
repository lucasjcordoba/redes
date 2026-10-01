/**
 * Graba un recorrido por un sitio, cuadro por cuadro.
 *
 * No graba en tiempo real: capturar un cuadro de alta resolución lleva ~50 ms,
 * así que a 30 fps se perderían cuadros. En cambio cada cuadro se arma a mano:
 * se ubica el scroll exactamente donde corresponde a ese instante del video,
 * se captura y se pasa al siguiente. El movimiento sale perfectamente fluido
 * sin importar cuánto tarde la captura.
 *
 * Las animaciones del sitio siguen corriendo en tiempo real, así que se las
 * pone en cámara lenta en la misma proporción en que la captura es más lenta
 * que el video: las CSS con el dominio Animation de Chrome, y las de
 * JavaScript con un reloj escalado (performance.now, Date.now,
 * requestAnimationFrame y los timers). En el video todo va a velocidad normal.
 *
 * El guion de un reel es una lista de escenas con su duración (la de la voz
 * que la describe, ver voz.mjs); acá cada escena es un paso `seccion`, y el
 * mismo guion se graba en escritorio y en celular para que queden en sincro.
 *
 * Deja los cuadros en reels/tmp/<id>/<formato>/ (JPEG) para que los componga
 * componer.mjs.
 */
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { RAIZ } from "../lib/rutas.mjs";

export const FPS = 30;
const CHROME = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

/**
 * Formatos. `escala` es la densidad de píxeles: con 1.5 y 2 la captura tiene
 * resolución de sobra para lo que ocupa en el cuadro final.
 */
export const FORMATOS = {
  escritorio: { viewport: { width: 1280, height: 800 }, escala: 1.5, isMobile: false, hasTouch: false },
  celular: { viewport: { width: 390, height: 844 }, escala: 2, isMobile: true, hasTouch: true },
  tablet: { viewport: { width: 810, height: 1440 }, escala: 4 / 3, isMobile: false, hasTouch: true },
};

// ---------- lo que vive dentro de la página ----------

/** Reloj escalado: las animaciones de JS corren a `__velocidad` del tiempo real. */
function relojEscalado() {
  const perfNow = performance.now.bind(performance);
  const dateNow = Date.now;
  const raf = window.requestAnimationFrame.bind(window);
  const st = window.setTimeout.bind(window);
  const si = window.setInterval.bind(window);
  let velocidad = 1, anclaReal = perfNow(), anclaVirtual = anclaReal;
  const ahora = () => anclaVirtual + (perfNow() - anclaReal) * velocidad;
  const inicioDate = dateNow() - perfNow();
  window.__velocidad = (v) => {
    anclaVirtual = ahora();
    anclaReal = perfNow();
    velocidad = v;
  };
  performance.now = ahora;
  Date.now = () => inicioDate + ahora();
  window.requestAnimationFrame = (cb) => raf(() => cb(ahora()));
  window.setTimeout = (fn, ms = 0, ...a) => st(fn, ms / velocidad, ...a);
  window.setInterval = (fn, ms = 0, ...a) => si(fn, ms / velocidad, ...a);
}

/** El contenedor que scrollea: la ventana o, si la app scrollea adentro, ese elemento. */
function scroller() {
  window.__scroller = () => {
    const doc = document.scrollingElement;
    if (doc.scrollHeight > innerHeight + 20) return doc;
    const candidatos = [...document.querySelectorAll("main, [data-scroll], div")]
      .filter((e) => e.scrollHeight > e.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))
      .sort((a, b) => b.clientHeight - a.clientHeight);
    return candidatos[0] ?? doc;
  };
}

const suave = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const suaveLargo = (k) => 0.5 - Math.cos(Math.PI * k) / 2;

/**
 * Graba `escenas` en un formato. Cada escena: { duracion, url?, sel?, margen?, deriva? }
 *   url      si la escena es en otra página, se navega antes (es un corte)
 *   sel      selector de la sección a mostrar (si falta, el tope de la página)
 *   margen   aire por encima de la sección, en px CSS
 *   deriva   px CSS que baja lentamente mientras dura la escena (por defecto,
 *            lo que dé la sección hasta un máximo razonable)
 */
export async function grabar({ id, formato, url, escenas, iniciales = [], preparar, transicion = 1.1 }) {
  const f = FORMATOS[formato];
  const dir = join(RAIZ, "reels/tmp", id, formato);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({
    viewport: f.viewport,
    deviceScaleFactor: f.escala,
    isMobile: f.isMobile,
    hasTouch: f.hasTouch,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
  });
  for (const s of [relojEscalado, scroller, ...iniciales]) await ctx.addInitScript(s);
  const page = await ctx.newPage();
  if (preparar) await preparar(page);
  if (url) await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Animation.enable").catch(() => {});

  let n = 0;
  let velocidad = 1;
  const ms = [];

  async function cuadro(scrollY) {
    const t0 = Date.now();
    await page.evaluate(({ scrollY, velocidad }) => {
      window.__velocidad?.(velocidad);
      window.__limpiar?.();
      if (scrollY != null) window.__scroller().scrollTop = scrollY;
    }, { scrollY, velocidad }).catch(() => {});
    await page.screenshot({
      path: join(dir, `${String(n).padStart(5, "0")}.jpg`),
      type: "jpeg", quality: 92, scale: "device", animations: "allow", caret: "initial",
    });
    n++;
    ms.push(Date.now() - t0);
    if (n % 10 === 0) {
      const rec = ms.slice(-15);
      const v = Math.max(0.08, Math.min(1, 1000 / FPS / (rec.reduce((a, b) => a + b, 0) / rec.length)));
      if (Math.abs(v - velocidad) > 0.03) {
        velocidad = v;
        await cdp.send("Animation.setPlaybackRate", { playbackRate: velocidad }).catch(() => {});
      }
    }
  }

  const medir = (sel, margen) => page.evaluate(({ sel, margen }) => {
    const s = window.__scroller();
    const max = s.scrollHeight - s.clientHeight;
    if (!sel) return { destino: 0, max, alto: s.scrollHeight };
    const el = document.querySelector(sel);
    if (!el) return null;
    const base = s === document.scrollingElement ? 0 : s.getBoundingClientRect().top;
    const r = el.getBoundingClientRect();
    // El alto de la sección: el bloque que contiene al título.
    const bloque = el.closest("section") ?? el.parentElement;
    return {
      destino: Math.max(0, Math.min(max, s.scrollTop + r.top - base - margen)),
      max,
      alto: bloque.getBoundingClientRect().height,
    };
  }, { sel, margen });

  const escenasGrabadas = [];
  for (const e of escenas) {
    const total = Math.round(e.duracion * FPS);
    if (e.url && new URL(e.url, page.url()).href !== page.url()) {
      await page.goto(new URL(e.url, page.url()).href, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(900);
      await cdp.send("Animation.enable").catch(() => {});
      await cdp.send("Animation.setPlaybackRate", { playbackRate: velocidad }).catch(() => {});
    }
    // Playwright entiende :has-text; querySelector no. Se resuelve con locator.
    let info;
    if (e.sel) {
      const loc = page.locator(e.sel).first();
      await loc.evaluate((el) => el.setAttribute("data-reel-objetivo", "1")).catch(() => {});
      info = await medir('[data-reel-objetivo="1"]', e.margen ?? 70);
      await page.evaluate(() => document.querySelector('[data-reel-objetivo="1"]')?.removeAttribute("data-reel-objetivo"));
      if (!info) throw new Error(`${formato}: no encontré la sección ${e.sel}`);
    } else {
      info = await medir(null, 0);
    }
    const y0 = await page.evaluate(() => window.__scroller().scrollTop);
    const cTrans = Math.min(total, Math.round((y0 === info.destino ? 0 : transicion) * FPS));
    const cDeriva = total - cTrans;
    // Deriva: baja despacio dentro de la sección mientras se describe. Nunca
    // más de lo que queda de sección visible, para no meterse en la siguiente.
    const alto = f.viewport.height;
    const maxDeriva = Math.max(0, Math.min(info.max - info.destino, info.alto - alto * 0.6));
    const deriva = Math.max(0, Math.min(e.deriva ?? Math.min(maxDeriva, (cDeriva / FPS) * 45), maxDeriva));

    escenasGrabadas.push({ inicio: +(n / FPS).toFixed(3), duracion: e.duracion });
    for (let i = 1; i <= cTrans; i++) await cuadro(y0 + (info.destino - y0) * suave(i / cTrans));
    for (let i = 1; i <= cDeriva; i++) await cuadro(info.destino + deriva * suaveLargo(i / cDeriva));
  }

  await browser.close();
  const prom = ms.reduce((a, b) => a + b, 0) / ms.length;
  console.log(`✓ ${id}/${formato}: ${n} cuadros, ${(n / FPS).toFixed(1)} s (captura ${prom.toFixed(0)} ms/cuadro)`);
  return { dir, cuadros: n, escenas: escenasGrabadas };
}
