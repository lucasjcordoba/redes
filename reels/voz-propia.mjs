/**
 * La locución grabada por el dueño, en lugar de una voz sintética.
 *
 *   node reels/hacer.mjs <id> --voz-propia <grabación>
 *
 * 1. Se mejora la grabación entera: corte de graves (golpes, rumor), reducción
 *    de ruido suave, menos "caja" en los medios bajos, más presencia y aire,
 *    de-esser, compresión y volumen parejo.
 * 2. Se transcribe con Whisper (local, modelo small) con el tiempo de cada
 *    palabra, y se alinean esas palabras con el texto del guion. Whisper se
 *    equivoca en algunas ("boja" por "hoja"): la alineación las tolera, y los
 *    subtítulos muestran siempre el texto del guion.
 * 3. Se corta un tramo por escena, desde su primera palabra hasta la última.
 *    La duración de cada escena sale de ese tramo (más el mismo respiro que
 *    con la voz sintética), así la grabación de pantalla sigue a la voz.
 *
 * Devuelve lo mismo que locucion() en voz.mjs: escenas con `audio`, `inicio`,
 * `duracion` y `subtitulos`.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { RAIZ } from "../lib/rutas.mjs";
import { ANTES, DESPUES, frases } from "./voz.mjs";

const ejecutar = promisify(execFile);
const PREVIO = 0.12; // aire antes de la primera palabra de cada tramo
const COLA = 0.25; // y después de la última

// Mejora de voz. Pensada para una nota de voz de celular: sin ruido de fondo
// marcado, pero con graves de manejo, algo de "caja" y picos.
const MEJORA = [
  "highpass=f=85",
  "afftdn=nf=-30:nr=10:tn=1",
  "equalizer=f=220:t=q:w=1.1:g=-2.5",
  "equalizer=f=3200:t=q:w=1.3:g=2.5",
  "highshelf=f=9000:g=2",
  "deesser=i=0.35",
  "acompressor=threshold=-22dB:ratio=3:attack=6:release=120:makeup=2.5",
  "loudnorm=I=-16:TP=-1.5:LRA=7",
  "alimiter=limit=0.89:level=false",
].join(",");

const normal = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
const palabrasDe = (texto) => texto.split(/\s+/).map(normal).filter(Boolean);

/** Parecido entre dos palabras normalizadas: 0 iguales, 1 nada que ver. */
function costo(a, b) {
  if (a === b) return 0;
  if (a.startsWith(b) || b.startsWith(a)) return 0.4;
  let comunes = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) comunes++;
  return comunes / Math.max(a.length, b.length) >= 0.5 ? 0.6 : 1;
}

/**
 * Alinea las palabras del guion con las de Whisper (distancia de edición por
 * palabras). Devuelve, por palabra del guion, { desde, hasta } en segundos.
 */
function alinear(guion, dichas) {
  const n = guion.length, m = dichas.length;
  const D = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  for (let i = 1; i <= n; i++) D[i][0] = i * 0.8;
  for (let j = 1; j <= m; j++) D[0][j] = j * 0.8;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    D[i][j] = Math.min(D[i - 1][j - 1] + costo(guion[i - 1], dichas[j - 1].p), D[i - 1][j] + 0.8, D[i][j - 1] + 0.8);
  }
  const par = new Array(n).fill(null);
  let i = n, j = m;
  while (i > 0 && j > 0) {
    if (D[i][j] === D[i - 1][j - 1] + costo(guion[i - 1], dichas[j - 1].p)) { par[i - 1] = j - 1; i--; j--; }
    else if (D[i][j] === D[i - 1][j] + 0.8) i--;
    else j--;
  }
  // Las palabras del guion que no se dijeron (o Whisper no oyó) toman el
  // tiempo de la vecina anterior.
  let ultimo = { desde: dichas[0].desde, hasta: dichas[0].desde };
  return par.map((k) => (k == null ? { desde: ultimo.hasta, hasta: ultimo.hasta } : (ultimo = dichas[k])));
}

async function transcribir(audio, dir) {
  const json = join(dir, "transcripcion.json");
  try { await access(json); } catch {
    await ejecutar("whisper", [audio, "--model", "small", "--language", "es", "--word_timestamps", "True",
      "--output_format", "json", "--output_dir", dir, "--fp16", "False", "--verbose", "False"], { maxBuffer: 1 << 26 });
    const base = audio.split("/").pop().replace(/\.[^.]+$/, "");
    await writeFile(json, await readFile(join(dir, `${base}.json`)));
  }
  const datos = JSON.parse(await readFile(json, "utf8"));
  return datos.segments.flatMap((s) => s.words).map((w) => ({ p: normal(w.word), desde: w.start, hasta: w.end })).filter((w) => w.p);
}

export async function vozPropia(id, escenas, grabacion) {
  const dir = join(RAIZ, "reels/tmp", id, "voz-propia");
  await mkdir(dir, { recursive: true });
  const mejorada = join(dir, "mejorada.wav");
  await ejecutar("ffmpeg", ["-v", "error", "-y", "-i", grabacion, "-af", MEJORA, "-ar", "48000", "-ac", "1", mejorada]);

  const dichas = await transcribir(mejorada, dir);
  const porEscena = escenas.map((e) => palabrasDe(e.voz));
  const tiempos = alinear(porEscena.flat(), dichas);

  let t = 0, k = 0;
  const salida = [];
  for (const [i, e] of escenas.entries()) {
    const mias = tiempos.slice(k, k + porEscena[i].length);
    k += porEscena[i].length;
    const desde = Math.max(0, mias[0].desde - PREVIO);
    const hasta = mias.at(-1).hasta + COLA;
    const audio = join(dir, `${String(i).padStart(2, "0")}.wav`);
    await ejecutar("ffmpeg", ["-v", "error", "-y", "-i", mejorada, "-ss", String(desde), "-to", String(hasta),
      "-af", "afade=t=in:d=0.03,areverse,afade=t=in:d=0.08,areverse", audio]);
    const voz = hasta - desde;
    const duracion = +(ANTES + voz + DESPUES).toFixed(3);
    // El tramo empieza a sonar en inicio + ANTES (ver componer.mjs).
    const enReel = (s) => +(t + ANTES + (s - desde)).toFixed(3);

    // Cada subtítulo, del comienzo de su primera palabra al de la frase siguiente.
    let j = 0;
    const subtitulos = frases(e.voz).map((f) => {
      const n = palabrasDe(f).length;
      const s = { texto: f, desde: enReel(mias[j].desde), hasta: enReel(mias[j + n - 1].hasta) };
      j += n;
      return s;
    });
    subtitulos.forEach((s, x) => {
      const sig = subtitulos[x + 1];
      if (sig && sig.desde - s.hasta < 0.6) s.hasta = sig.desde - 0.02;
      else s.hasta = +(s.hasta + 0.3).toFixed(3);
    });
    salida.push({ ...e, audio, inicio: +t.toFixed(3), duracion, duracionVoz: voz, subtitulos });
    t += duracion;
  }
  await writeFile(join(dir, "locucion.json"), JSON.stringify(salida, null, 2));
  return salida;
}
