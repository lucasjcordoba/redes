/**
 * Placas de TecnoAid, 1080x1350 (4:5).
 *
 * Identidad del sitio (tecnoaid/README.md): crema del logo, rojo y negro
 * cálido; Archivo para títulos, Inter para texto y Roboto Mono para el
 * wordmark. Toda placa es una "tarjeta" con borde, como el logo original, y
 * cierra con una franja negra con el WhatsApp: es el único llamado a la acción
 * de la marca.
 */
import { esc, ajustar } from "../../lib/render.mjs";
import { marca } from "./marca.mjs";

const W = 1080;
const H = 1350;
const M = 96; // margen del contenido

const C = {
  crema: "#efdfb4",
  cremaClara: "#fdf9f1",
  rojo: "#e4241f",
  tinta: "#17130f",
  tintaSuave: "#4a423a",
  tintaTenue: "#7c7267",
};

const TITULO = "Archivo";
const TEXTO = "Inter";
const MONO = "Roboto Mono";

/** La notebook con la cruz, redibujada del logo (tecnoaid/app/components/logo.tsx). */
function isotipo(x, y, ancho, color = C.tinta) {
  const s = ancho / 120;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none">
    <g stroke="${color}" stroke-width="6" stroke-linecap="round">
      <path d="M60 4v10"/><path d="M42 9l4 9"/><path d="M78 9l-4 9"/>
      <path d="M8 34h12M8 50h12M8 66h12"/><path d="M100 34h12M100 50h12M100 66h12"/>
    </g>
    <rect x="30" y="22" width="60" height="52" rx="9" fill="${C.rojo}" stroke="${color}" stroke-width="8"/>
    <circle cx="60" cy="48" r="18" fill="${C.crema}"/>
    <path d="M54 36h12v6h6v12h-6v6H54V54h-6V42h6z" fill="${color}"/>
    <path d="M26 80h68l10 16a3 3 0 0 1-2.6 4.6H18.6A3 3 0 0 1 16 96z" fill="${color}"/>
    <g stroke="${C.crema}" stroke-width="3" stroke-linecap="round"><path d="M36 86h48M33 92h54"/></g>
    <rect x="48" y="104" width="24" height="4" rx="2" fill="${color}"/>
  </g>`;
}

/** Tarjeta, logo arriba a la izquierda y etiqueta arriba a la derecha. */
function marco(etiqueta, contenido) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${C.crema}"/>
    <rect x="36" y="36" width="${W - 72}" height="${H - 72}" rx="36" fill="${C.cremaClara}" stroke="${C.tinta}" stroke-width="6"/>

    ${isotipo(M, 96, 84)}
    <text x="${M + 104}" y="158" font-family="${MONO}" font-size="40" font-weight="700" fill="${C.tinta}"
      letter-spacing="-1">Tecno<tspan fill="${C.rojo}">aid</tspan></text>
    ${etiqueta ? `<text x="${W - M}" y="154" text-anchor="end" font-family="${MONO}" font-size="24"
      font-weight="700" letter-spacing="3" fill="${C.rojo}">${esc(etiqueta.toUpperCase())}</text>` : ""}

    ${contenido}

    <path d="M36 1130 H${W - 36} V${H - 72} a36 36 0 0 1 -36 36 H72 a36 36 0 0 1 -36 -36 Z" fill="${C.tinta}"/>
    <text x="${M}" y="1210" font-family="${MONO}" font-size="24" letter-spacing="3" fill="${C.crema}"
      opacity="0.7">ESCRIBINOS POR WHATSAPP</text>
    <text x="${M}" y="1262" font-family="${MONO}" font-size="44" font-weight="700" fill="${C.cremaClara}">${esc(marca.whatsapp)}</text>
    <text x="${W - M}" y="1210" text-anchor="end" font-family="${TEXTO}" font-size="26" fill="${C.crema}" opacity="0.7">Zona Norte · a domicilio</text>
    <text x="${W - M}" y="1256" text-anchor="end" font-family="${TEXTO}" font-size="26" fill="${C.crema}" opacity="0.7">Remoto a todo el país</text>
  </svg>`;
}

/**
 * Título grande con una línea en rojo, y una bajada.
 *   visual: { etiqueta, titulo: [líneas], destacar: índice, bajada }
 * Cada línea del título, hasta ~16 caracteres. Bajada hasta ~120: se ajusta sola.
 */
export function declaracion({ etiqueta, titulo, destacar, bajada }) {
  const size = 104;
  const leading = 112;
  const bajadaSize = 40;
  const lineasBajada = bajada ? ajustar(bajada, W - 2 * M, bajadaSize, 0.48) : [];

  // Centrado óptico del bloque entre el encabezado (y≈200) y la franja (y=1130).
  const alto = (titulo.length - 1) * leading + (lineasBajada.length ? 90 + (lineasBajada.length - 1) * 54 : 0);
  const y0 = (240 + 1080) / 2 - alto / 2 + size / 3;

  const lineas = titulo
    .map((l, i) => `<text x="${M}" y="${y0 + i * leading}" font-family="${TITULO}" font-size="${size}"
      font-weight="800" letter-spacing="-3" fill="${i === destacar ? C.rojo : C.tinta}">${esc(l)}</text>`)
    .join("");

  const yBajada = y0 + (titulo.length - 1) * leading + 90;
  const bajadaSvg = lineasBajada
    .map((l, i) => `<text x="${M}" y="${yBajada + i * 54}" font-family="${TEXTO}" font-size="${bajadaSize}"
      fill="${C.tintaSuave}">${esc(l)}</text>`)
    .join("");

  return marco(etiqueta, lineas + bajadaSvg);
}

/**
 * Lista numerada: pasos, consejos o señales.
 *   visual: { etiqueta, titulo: [1 o 2 líneas], items: [texto] (3 a 5) }
 * Cada ítem hasta ~70 caracteres: se ajusta a dos líneas.
 */
export function lista({ etiqueta, titulo, items }) {
  const tSize = 72;
  const titulos = titulo
    .map((l, i) => `<text x="${M}" y="${300 + i * 80}" font-family="${TITULO}" font-size="${tSize}"
      font-weight="800" letter-spacing="-2" fill="${C.tinta}">${esc(l)}</text>`)
    .join("");

  // Cada ítem ocupa lo que ocupan sus líneas; el aire que sobra se reparte
  // parejo entre ítems, así uno de dos líneas no queda pegado al siguiente.
  const interlinea = 46;
  const bloques = items.map((texto) => ajustar(texto, W - 2 * M - 110, 36, 0.48));
  const inicio = 300 + (titulo.length - 1) * 80 + 110;
  const altoTexto = bloques.reduce((s, l) => s + Math.max(68, l.length * interlinea), 0);
  const aire = Math.min(80, (1080 - inicio - altoTexto) / Math.max(1, items.length - 1));
  let cursor = inicio;

  const filas = bloques
    .map((lineas, i) => {
      const y = cursor;
      cursor += Math.max(68, lineas.length * interlinea) + aire;
      return `
      <circle cx="${M + 34}" cy="${y + 22}" r="34" fill="${C.rojo}"/>
      <text x="${M + 34}" y="${y + 34}" text-anchor="middle" font-family="${MONO}" font-size="32"
        font-weight="700" fill="${C.cremaClara}">${i + 1}</text>
      ${lineas
        .map((l, j) => `<text x="${M + 104}" y="${y + 34 + j * interlinea}" font-family="${TEXTO}" font-size="36"
          fill="${C.tinta}">${esc(l)}</text>`)
        .join("")}`;
    })
    .join("");

  return marco(etiqueta, titulos + filas);
}

/**
 * Última diapositiva de un carrusel: el llamado a la acción, grande.
 *   visual: { titulo: [líneas], bajada }
 */
export function cierre({ titulo, bajada }) {
  const lineas = titulo
    .map((l, i) => `<text x="${W / 2}" y="${720 + i * 100}" text-anchor="middle" font-family="${TITULO}"
      font-size="92" font-weight="800" letter-spacing="-3" fill="${i === titulo.length - 1 ? C.rojo : C.tinta}">${esc(l)}</text>`)
    .join("");
  const yBajada = 720 + (titulo.length - 1) * 100 + 90;

  return marco(null, `
    ${isotipo(W / 2 - 130, 300, 260)}
    ${lineas}
    <text x="${W / 2}" y="${yBajada}" text-anchor="middle" font-family="${TEXTO}" font-size="40"
      fill="${C.tintaSuave}">${esc(bajada)}</text>`);
}
