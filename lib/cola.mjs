/**
 * Lectura y validación de las colas de publicaciones.
 *
 * Cada marca tiene su cola en marcas/<marca>/posts.mjs. Un post es:
 *
 *   id        único dentro de la marca; nombra también la imagen
 *   fecha     "AAAA-MM-DD", hora de Argentina
 *   hora      "HH:MM"
 *   pilar     categoría editorial (ver PILARES en marca.mjs)
 *   borrador  true = se renderiza para revisar, pero nunca se publica
 *   caption   el texto tal cual sale en Instagram
 *
 * y la imagen sale de una de tres formas:
 *
 *   plantilla + visual   una placa, se dibuja con plantillas.mjs
 *   diapositivas         un carrusel: [{ plantilla, visual }, ...]
 *   imagen               un JPG ya hecho en imagenes/ (capturas, fotos)
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { MARCAS, dirMarca, dirImagenes } from "./rutas.mjs";

/** Argentina no tiene horario de verano: el offset es fijo. */
const HUSO = "-03:00";

export async function cargarMarca(marca) {
  if (!MARCAS.includes(marca)) {
    throw new Error(`Marca desconocida: "${marca}". Opciones: ${MARCAS.join(", ")}`);
  }
  const dir = dirMarca(marca);
  const importar = (f) => import(pathToFileURL(join(dir, f)).href);
  const [{ marca: datos }, { posts }, plantillas] = await Promise.all([
    importar("marca.mjs"),
    importar("posts.mjs"),
    importar("plantillas.mjs"),
  ]);
  validar(marca, posts, datos, plantillas);
  return { ...datos, posts, plantillas };
}

/** El momento exacto en que un post debe salir. */
export const instante = (post) => new Date(`${post.fecha}T${post.hora}:00${HUSO}`);

/** Los nombres de archivo de las imágenes de un post, en orden. */
export function imagenesDe(post) {
  if (post.imagen) return [post.imagen];
  if (post.diapositivas) {
    return post.diapositivas.map((_, i) => `${post.id}-${String(i + 1).padStart(2, "0")}.jpg`);
  }
  return [`${post.id}.jpg`];
}

function validar(marca, posts, datos, plantillas) {
  const errores = [];
  const ids = new Set();

  for (const p of posts) {
    const donde = `${marca}/${p.id ?? "(sin id)"}`;
    if (!p.id) errores.push(`${donde}: falta id`);
    if (ids.has(p.id)) errores.push(`${donde}: id repetido`);
    ids.add(p.id);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.fecha ?? "")) errores.push(`${donde}: fecha inválida "${p.fecha}"`);
    if (!/^\d{2}:\d{2}$/.test(p.hora ?? "")) errores.push(`${donde}: hora inválida "${p.hora}"`);
    if (Number.isNaN(instante(p).getTime())) errores.push(`${donde}: fecha u hora imposibles`);
    if (datos.pilares && !datos.pilares[p.pilar]) errores.push(`${donde}: pilar desconocido "${p.pilar}"`);

    if (!p.caption?.trim()) errores.push(`${donde}: falta caption`);
    // Límites de Instagram: 2200 caracteres y 30 hashtags.
    if (p.caption?.length > 2200) errores.push(`${donde}: caption de ${p.caption.length} caracteres (máx. 2200)`);
    const hashtags = p.caption?.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    if (hashtags.length > 30) errores.push(`${donde}: ${hashtags.length} hashtags (máx. 30)`);

    const formas = [p.imagen, p.diapositivas, p.plantilla].filter(Boolean).length;
    if (formas !== 1) errores.push(`${donde}: tiene que tener exactamente uno de imagen, diapositivas o plantilla`);

    const piezas = p.diapositivas ?? (p.plantilla ? [p] : []);
    if (p.diapositivas && (p.diapositivas.length < 2 || p.diapositivas.length > 10)) {
      errores.push(`${donde}: un carrusel lleva entre 2 y 10 diapositivas`);
    }
    for (const pieza of piezas) {
      if (typeof plantillas[pieza.plantilla] !== "function") {
        errores.push(`${donde}: plantilla desconocida "${pieza.plantilla}"`);
      }
    }
    if (p.imagen && !existsSync(join(dirImagenes(marca), p.imagen))) {
      errores.push(`${donde}: no existe imagenes/${p.imagen}`);
    }
  }

  if (errores.length) {
    throw new Error(`La cola de ${marca} tiene errores:\n  · ${errores.join("\n  · ")}`);
  }
}
