/**
 * SVG → JPEG, con las tipografías del repo y ninguna del sistema.
 *
 * El generador viejo de Raudal rasterizaba con sharp, que usa las fuentes
 * instaladas: en la Mac salía bien y en cualquier servidor salía distinto. Acá
 * resvg carga sólo lo que hay en fuentes/, así que la placa es idéntica en la
 * Mac, en GitHub Actions o en una sesión de Claude en la nube.
 *
 * JPEG porque la API de publicación de Instagram no acepta otro formato.
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { RAIZ } from "./rutas.mjs";

const dirFuentes = join(RAIZ, "fuentes");
const fontFiles = readdirSync(dirFuentes)
  .filter((f) => f.endsWith(".ttf"))
  .map((f) => join(dirFuentes, f));

export async function svgAJpeg(svg, destino, { calidad = 92 } = {}) {
  const png = new Resvg(svg, {
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Inter" },
  })
    .render()
    .asPng();

  await sharp(png)
    .jpeg({ quality: calidad, chromaSubsampling: "4:4:4" })
    .toFile(destino);
}

/** Escapa texto para meterlo dentro de un <text> de SVG. */
export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Parte un texto en líneas que entren en `ancho` píxeles.
 *
 * SVG no ajusta texto: una cadena larga se dibuja derecho y se sale del lienzo.
 * `factor` es el ancho promedio de un carácter relativo al tamaño de fuente
 * (0.5 es conservador para sans; las monoespaciadas andan por 0.6).
 */
export function ajustar(texto, ancho, tamFuente, factor = 0.5) {
  const maximo = Math.floor(ancho / (tamFuente * factor));
  const lineas = [];
  let actual = "";
  for (const palabra of texto.split(" ")) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (prueba.length > maximo && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}
