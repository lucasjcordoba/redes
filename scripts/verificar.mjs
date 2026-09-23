/**
 * Chequea que las colas sean válidas y que cada imagen commiteada sea la que
 * sale de su plantilla. Lo corre el workflow verificar.yml en cada PR.
 *
 *   node scripts/verificar.mjs
 *
 * Compara píxeles con tolerancia y no bytes: el mismo SVG rasterizado en la Mac
 * y en Linux puede diferir en algún bit de antialiasing sin que se note.
 */
import { existsSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { MARCAS, dirImagenes } from "../lib/rutas.mjs";
import { cargarMarca, imagenesDe } from "../lib/cola.mjs";
import { svgAJpeg } from "../lib/render.mjs";

// Un píxel "cambió" si algún canal se mueve más de UMBRAL (sobre 255): el
// antialiasing entre plataformas mueve pocos valores; una letra distinta, cientos
// de píxeles enteros. Se toleran hasta TOLERANCIA píxeles cambiados.
const UMBRAL = 64;
const TOLERANCIA = 40;
const tmp = await mkdtemp(join(tmpdir(), "redes-"));
const errores = [];

for (const id of MARCAS) {
  const { posts, plantillas } = await cargarMarca(id); // valida la cola
  for (const post of posts) {
    const archivos = imagenesDe(post);
    if (post.imagen) continue; // la valida cargarMarca
    const piezas = post.diapositivas ?? [post];
    for (const [i, pieza] of piezas.entries()) {
      const commiteada = join(dirImagenes(id), archivos[i]);
      if (!existsSync(commiteada)) {
        errores.push(`${id}/${archivos[i]}: falta. Corré npm run render.`);
        continue;
      }
      const nueva = join(tmp, `${id}-${archivos[i]}`);
      await svgAJpeg(plantillas[pieza.plantilla](pieza.visual), nueva);
      const dif = await diferencia(commiteada, nueva);
      if (dif > TOLERANCIA) {
        errores.push(`${id}/${archivos[i]}: no coincide con su plantilla (${dif} píxeles distintos). Corré npm run render.`);
      }
    }
  }
}

if (errores.length) {
  console.error(`✗ ${errores.length} problema(s):\n  · ${errores.join("\n  · ")}`);
  process.exit(1);
}
console.log("✓ Colas válidas e imágenes al día");

async function diferencia(a, b) {
  const [pa, pb] = await Promise.all(
    [a, b].map((f) => sharp(f).removeAlpha().raw().toBuffer({ resolveWithObject: true })),
  );
  if (pa.info.width !== pb.info.width || pa.info.height !== pb.info.height) return Infinity;
  let cambiados = 0;
  for (let i = 0; i < pa.data.length; i += 3) {
    if (
      Math.abs(pa.data[i] - pb.data[i]) > UMBRAL ||
      Math.abs(pa.data[i + 1] - pb.data[i + 1]) > UMBRAL ||
      Math.abs(pa.data[i + 2] - pb.data[i + 2]) > UMBRAL
    ) cambiados++;
  }
  return cambiados;
}
