/**
 * Hace un reel completo:
 *
 *   node reels/hacer.mjs <id>
 *
 * 1. Locución y subtítulos de cada escena (voz.mjs): de ahí salen las duraciones.
 * 2. Grabación del mismo recorrido en escritorio y en celular (grabador.mjs).
 * 3. Composición, música y cierre (componer.mjs) → reels/salida/<id>.mp4 y .srt.
 * 4. El guion con los tiempos reales → reels/salida/<id>-guion.md.
 */
import { pathToFileURL } from "node:url";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { RAIZ } from "../lib/rutas.mjs";
import { locucion } from "./voz.mjs";
import { grabar } from "./grabador.mjs";
import { componer } from "./componer.mjs";

const id = process.argv[2];
const soloComponer = process.argv.includes("--solo-componer"); // reusa la grabación (misma locución)
if (!id) { console.error("Uso: node reels/hacer.mjs <id> [--solo-componer]"); process.exit(2); }
const { guion } = await import(pathToFileURL(join(RAIZ, "reels/guiones", `${id}.mjs`)).href);

console.log("1. Locución");
const escenas = await locucion(id, guion.escenas, guion.voz);

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
  `Duración: ${seg(total)} · Voz: ${guion.voz?.nombre ?? "Elena"} (Azure) · Música: generada (sin derechos)`,
  "",
  ...escenas.map((e) => `**${seg(e.inicio)} – ${seg(e.inicio + e.duracion)} · ${e.titulo}**\n> ${e.voz}\n`),
  `**${seg(total - 3)} – ${seg(total)} · Cierre**\n> Placa de Raudal Dev: raudaldev.com — primera reunión y presupuesto sin cargo.`,
  "",
].join("\n");
await writeFile(join(RAIZ, "reels/salida", `${id}-guion.md`), md);
console.log("✓ guion", `reels/salida/${id}-guion.md`);
