/**
 * Dibuja las placas de las colas en marcas/<marca>/imagenes/.
 *
 *   npm run render              todas las marcas
 *   npm run render tecnoaid     una sola
 *   npm run render -- --desde 2026-10-01   sólo posts desde esa fecha
 *
 * Las imágenes se versionan: el publicador no dibuja nada, publica lo que está
 * en el repo. Así lo que se revisó es exactamente lo que sale. El render es
 * determinístico, así que volver a correrlo no ensucia el diff.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { MARCAS, dirImagenes } from "../lib/rutas.mjs";
import { cargarMarca, imagenesDe } from "../lib/cola.mjs";
import { svgAJpeg } from "../lib/render.mjs";

const { values, positionals } = parseArgs({
  options: { desde: { type: "string" } },
  allowPositionals: true,
});
const marcas = positionals.length ? positionals : MARCAS;

for (const id of marcas) {
  const { nombre, posts, plantillas } = await cargarMarca(id);
  const dir = dirImagenes(id);
  await mkdir(dir, { recursive: true });
  console.log(`\n${nombre}`);

  for (const post of posts) {
    if (values.desde && post.fecha < values.desde) continue;
    if (post.imagen) continue; // ya viene hecha

    const piezas = post.diapositivas ?? [post];
    const archivos = imagenesDe(post);
    for (const [i, pieza] of piezas.entries()) {
      await svgAJpeg(plantillas[pieza.plantilla](pieza.visual), join(dir, archivos[i]));
    }
    const marcaEstado = post.borrador ? "○ borrador" : "✓";
    const extra = archivos.length > 1 ? `  (carrusel de ${archivos.length})` : "";
    console.log(`  ${marcaEstado} ${post.id}  ·  ${post.fecha} ${post.hora}${extra}`);
  }
}
