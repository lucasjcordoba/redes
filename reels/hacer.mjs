/**
 * Hace un reel completo:
 *
 *   node reels/hacer.mjs <id> [--voz] [--solo-componer] [--conservar]
 *
 * 1. Tiempos y subtítulos de cada escena (voz.mjs): de ahí salen las
 *    duraciones. Sin voz, al ritmo de una lectura natural, para grabar encima;
 *    con --voz, con la locución de Azure del guion (`voz`).
 * 2. Grabación del mismo recorrido en escritorio y en celular (grabador.mjs).
 * 3. Composición, música y cierre (componer.mjs) → reels/salida/<id>.mp4,
 *    <id>.srt y <id>-musica.m4a (la música sola).
 * 4. El guion para grabar la voz, con los tiempos → reels/salida/<id>-guion.md.
 */
import { pathToFileURL } from "node:url";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { RAIZ } from "../lib/rutas.mjs";
import { locucion, tiempos } from "./voz.mjs";
import { grabar } from "./grabador.mjs";
import { componer } from "./componer.mjs";

const id = process.argv[2];
// --solo-componer reusa una grabación anterior (hecha con --conservar).
const soloComponer = process.argv.includes("--solo-componer");
if (!id) { console.error("Uso: node reels/hacer.mjs <id> [--solo-componer]"); process.exit(2); }
const { guion } = await import(pathToFileURL(join(RAIZ, "reels/guiones", `${id}.mjs`)).href);

const conVoz = process.argv.includes("--voz");
console.log(conVoz ? "1. Locución" : "1. Tiempos (sin voz)");
const escenas = conVoz ? await locucion(id, guion.escenas, guion.voz) : tiempos(guion.escenas);

console.log("2. Grabación");
for (const formato of soloComponer ? [] : ["escritorio", "celular"]) {
  await grabar({
    id, formato, url: guion.url, iniciales: guion.iniciales, preparar: guion.preparar,
    escenas: escenas.map((e) => ({ duracion: e.duracion, url: e.url, sel: e[formato]?.sel ?? e.sel, margen: e[formato]?.margen ?? e.margen, deriva: e[formato]?.deriva ?? e.deriva })),
  });
}

console.log("3. Composición");
const { total } = await componer({ id, guion, locucion: escenas });

const seg = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
const md = [
  `# Reel · ${guion.titulo}`,
  "",
  `Duración: ${seg(total)} · Música: ${guion.musica} (generada, sin derechos)${conVoz ? ` · Voz: ${guion.voz?.nombre ?? "Elena"} (Azure)` : ""}`,
  "",
  ...(conVoz ? [] : [
    "El video va sin voz: los subtítulos marcan qué decir y cuándo. Cada bloque está",
    "calculado para leerlo a un ritmo tranquilo; si se termina antes, queda aire, y",
    "si se lee más lento, conviene recortar alguna palabra antes que apurarse. Cada",
    "escena empieza con un respiro de un tercio de segundo antes de hablar.",
    "",
    "La música va también suelta (`" + id + "-musica.m4a`) para mezclarla con la voz:",
    "con la voz encima, la música queda bien entre un 25 y un 35 % del volumen.",
    "",
  ]),
  ...escenas.map((e) => [
    `## ${seg(e.inicio)} – ${seg(e.inicio + e.duracion)} · ${e.titulo}`,
    "",
    `> ${e.voz}`,
    "",
    ...e.subtitulos.map((s) => `- \`${seg(s.desde)}\` ${s.texto}`),
    "",
  ].join("\n")),
  `## ${seg(total - 3)} – ${seg(total)} · Cierre`,
  "",
  "Placa de Raudal Dev: raudaldev.com — primera reunión y presupuesto sin cargo (sin voz).",
  "",
].join("\n");
await writeFile(join(RAIZ, "reels/salida", `${id}-guion.md`), md);
console.log("✓ guion", `reels/salida/${id}-guion.md`);

// Los cuadros intermedios ocupan más de 1 GB por reel: se borran salvo que se
// pida conservarlos (por ejemplo, para recomponer sin volver a grabar).
if (!process.argv.includes("--conservar")) {
  for (const d of ["escritorio", "celular", "final"]) await rm(join(RAIZ, "reels/tmp", id, d), { recursive: true, force: true });
}
