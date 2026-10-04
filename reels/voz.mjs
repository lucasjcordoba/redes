/**
 * La locución de un reel y sus subtítulos. De acá sale la duración de cada
 * escena; después se graban las pantallas con esas mismas duraciones, así lo
 * que se ve y lo que se dice van juntos.
 *
 * Dos maneras:
 *   tiempos()   sin voz: la duración se calcula al ritmo de una lectura
 *               natural, para que el dueño grabe su voz encima siguiendo los
 *               subtítulos. Es lo que se usa por defecto.
 *   locucion()  con una voz neuronal argentina de Azure (Elena, es-AR; ver
 *               voz-azure.mjs): una pista por escena.
 *
 * Los subtítulos se arman partiendo el texto en frases cortas (de a una o dos
 * líneas) y repartiendo el tiempo de la escena en proporción a su largo.
 *
 * locucion() requiere AZURE_SPEECH_KEY y AZURE_SPEECH_REGION en .env.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { RAIZ } from "../lib/rutas.mjs";

const ejecutar = promisify(execFile);
import { sintetizar, VOCES } from "./voz-azure.mjs";

export const ANTES = 0.35; // silencio antes de que empiece a hablar en cada escena
export const DESPUES = 0.75; // respiro después, mientras la pantalla sigue
const MAX_CARACTERES = 44; // por subtítulo (dos líneas cortas)
// Ritmo de una lectura natural, sin apuro. Elena a +12% iba a 15,7 caracteres
// por segundo; a velocidad normal, unos 14. Se deja un poco más de aire para
// que se pueda grabar encima con comodidad.
export const CARACTERES_POR_SEGUNDO = 13;

/** Parte un texto en frases de subtítulo: primero por puntuación, después por largo. */
export function frases(texto) {
  // Corta en signos seguidos de espacio: "raudaldev.com" no es fin de frase.
  const piezas = texto.split(/(?<=[.,;:!?])\s+/).map((p) => p.trim()).filter(Boolean);
  const salida = [];
  for (const p of piezas) {
    if (p.length <= MAX_CARACTERES) { salida.push(p); continue; }
    // Partes parejas: mejor dos de 30 que una de 44 y una de 16 que queda colgando.
    const partes = Math.ceil(p.length / MAX_CARACTERES);
    const objetivo = p.length / partes;
    let actual = "";
    for (const palabra of p.split(" ")) {
      const prueba = (actual + " " + palabra).trim();
      if (actual && salida.length < 99 && prueba.length > objetivo + 4) { salida.push(actual); actual = palabra; }
      else actual = prueba;
    }
    if (actual) salida.push(actual);
  }
  // Une frases muy cortas con la siguiente para que no parpadeen.
  const unidas = [];
  for (const f of salida) {
    const ultima = unidas.at(-1);
    if (ultima && (ultima.length < 14 || f.length < 10) && (ultima + " " + f).length <= MAX_CARACTERES) unidas[unidas.length - 1] = `${ultima} ${f}`;
    else unidas.push(f);
  }
  return unidas;
}

/** Reparte `voz` segundos (a partir de `desde`) entre las frases del texto, por largo. */
function subtitular(texto, desde, voz) {
  const partes = frases(texto);
  const letras = partes.reduce((a, p) => a + p.length, 0);
  return partes.map((p) => {
    const d = (voz * p.length) / letras;
    const s = { texto: p, desde: +desde.toFixed(3), hasta: +(desde + d).toFixed(3) };
    desde += d;
    return s;
  });
}

/** Sin voz: misma salida que locucion(), sin `audio`, con la duración de una lectura natural. */
export function tiempos(escenas, { caracteresPorSegundo = CARACTERES_POR_SEGUNDO } = {}) {
  let t = 0;
  return escenas.map((e) => {
    const voz = +(e.voz.length / caracteresPorSegundo).toFixed(3);
    const duracion = +(ANTES + voz + DESPUES).toFixed(3);
    const salida = { ...e, inicio: +t.toFixed(3), duracion, duracionVoz: voz, subtitulos: subtitular(e.voz, t + ANTES, voz) };
    t += duracion;
    return salida;
  });
}

const duracionDe = async (archivo) =>
  Number((await ejecutar("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", archivo])).stdout.trim());

/**
 * Genera la voz de cada escena. Devuelve las escenas con `duracion` (la de la
 * escena completa), `audio` y `subtitulos` [{ texto, desde, hasta }] relativos
 * al inicio del reel.
 *
 * `hablado` permite escribir cómo se dice algo sin cambiar el subtítulo. Las
 * correcciones de siempre (dominios, "online") ya las hace voz-azure.mjs.
 */
export async function locucion(id, escenas, { voz: nombreVoz = "elena", ritmo = "+0%", tono = "+0%" } = {}) {
  const dir = join(RAIZ, "reels/tmp", id, "voz");
  await mkdir(dir, { recursive: true });
  let t = 0;
  const salida = [];
  for (const [i, e] of escenas.entries()) {
    const audio = join(dir, `${String(i).padStart(2, "0")}.wav`);
    const texto = e.hablado ?? e.voz;
    await sintetizar(texto, audio, { voz: VOCES[nombreVoz], ritmo, tono });
    const voz = await duracionDe(audio);
    const duracion = +(ANTES + voz + DESPUES).toFixed(3);

    const subtitulos = subtitular(e.voz, t + ANTES, voz);
    salida.push({ ...e, audio, inicio: +t.toFixed(3), duracion, duracionVoz: voz, subtitulos });
    t += duracion;
  }
  await writeFile(join(dir, "locucion.json"), JSON.stringify(salida, null, 2));
  return salida;
}
