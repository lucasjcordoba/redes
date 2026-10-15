/**
 * Cambia la música de un reel sin voz ya hecho, sin volver a grabar:
 *
 *   node reels/remusicar.mjs <id> [<id>...]
 *
 * Regenera la música del estilo del guion (con los acentos en los mismos
 * cambios de escena) y reemplaza el audio de reels/salida/<id>.mp4 y
 * <id>-musica.m4a. El video se copia tal cual.
 */
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { rename } from "node:fs/promises";
import { join } from "node:path";
import { RAIZ } from "../lib/rutas.mjs";
import { tiempos } from "./voz.mjs";
import { generarMusica } from "./musica.mjs";

const ejecutar = promisify(execFile);
const CIERRE = 3; // la placa de cierre (ver componer.mjs)

for (const id of process.argv.slice(2)) {
  const { guion } = await import(pathToFileURL(join(RAIZ, "reels/guiones", `${id}.mjs`)).href);
  const escenas = tiempos(guion.escenas);
  const duracion = escenas.reduce((a, e) => a + e.duracion, 0);
  const video = join(RAIZ, "reels/salida", `${id}.mp4`);
  const total = Number((await ejecutar("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video])).stdout);
  if (Math.abs(total - (duracion + CIERRE)) > 0.2) throw new Error(`${id}: el video dura ${total.toFixed(1)} s y el guion ${(duracion + CIERRE).toFixed(1)} s; cambió el guion, hay que rehacerlo`);
  const musica = join(RAIZ, "reels/salida", `${id}-musica.m4a`);
  await generarMusica(total, musica, { estilo: guion.musica, marcas: [...escenas.slice(1).map((e) => e.inicio), duracion] });
  const tmp = video.replace(/\.mp4$/, ".tmp.mp4");
  await ejecutar("ffmpeg", ["-v", "error", "-y", "-i", video, "-i", musica, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", String(total), "-movflags", "+faststart", tmp]);
  await rename(tmp, video);
  console.log(`✓ ${id}: música ${guion.musica} (${total.toFixed(1)} s)`);
}
