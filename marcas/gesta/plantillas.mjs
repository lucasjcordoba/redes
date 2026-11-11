/**
 * Placas de Gesta Manager, 1080x1350 (4:5).
 *
 * Identidad del sistema (~/dev/tour-app/web): fondo azul noche, acento ámbar,
 * Saira Condensed en mayúsculas para títulos, Inter para texto y JetBrains
 * Mono para etiquetas. El logo es el rombo negro sobre el cuadrado ámbar.
 * Toda placa cierra con gestamanager.com abajo: es el llamado a la acción.
 *
 * Las capturas salen de la demo local con la organización ficticia AURORA
 * (nunca datos de clientes) y viven en capturas/.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { esc, ajustar } from "../../lib/render.mjs";
import { dirMarca } from "../../lib/rutas.mjs";

const W = 1080;
const H = 1350;
const M = 96; // margen lateral

const C = {
  noche: "#070f1d",
  tarjeta: "#12203a",
  linea: "#22314d",
  ambar: "#e4c13c",
  texto: "#eef2f8",
  tenue: "#97a2b6",
};

const TITULO = "Saira Condensed";
const TEXTO = "Inter";
const MONO = "JetBrains Mono";

/** El isotipo: rombo negro sobre cuadrado ámbar, como el ícono de la app. */
function isotipo(x, y, lado) {
  const r = lado * 0.22;
  const cx = x + lado / 2;
  const cy = y + lado / 2;
  const a = lado * 0.27; // alto medio del rombo
  const b = lado * 0.1; // ancho medio
  return `<rect x="${x}" y="${y}" width="${lado}" height="${lado}" rx="${r}" fill="${C.ambar}"/>
    <path d="M${cx} ${cy - a} L${cx + b} ${cy} L${cx} ${cy + a} L${cx - b} ${cy} Z" fill="#0a0a0a"/>`;
}

/** Fondo, encabezado con el logo y la etiqueta, y el pie con el sitio. */
function marco(etiqueta, contenido, { pie = true } = {}) {
  let grilla = "";
  for (let x = 90; x < W; x += 90) grilla += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 90; y < H; y += 90) grilla += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="brillo" cx=".85" cy=".08" r=".75">
        <stop offset="0" stop-color="${C.ambar}" stop-opacity=".22"/><stop offset="1" stop-color="${C.ambar}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="azul" cx=".1" cy="1" r=".8">
        <stop offset="0" stop-color="#2a4f8f" stop-opacity=".35"/><stop offset="1" stop-color="#2a4f8f" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="fundido" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.noche}" stop-opacity="0"/><stop offset=".55" stop-color="${C.noche}" stop-opacity=".92"/><stop offset="1" stop-color="${C.noche}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${C.noche}"/>
    <rect width="${W}" height="${H}" fill="url(#azul)"/>
    <rect width="${W}" height="${H}" fill="url(#brillo)"/>
    <g stroke="#ffffff" stroke-opacity=".035" stroke-width="1.5">${grilla}</g>

    ${isotipo(M, 86, 60)}
    <text x="${M + 80}" y="132" font-family="${TITULO}" font-weight="700" font-size="40" letter-spacing="3" fill="${C.texto}">GESTA MANAGER</text>
    ${etiqueta ? `<text x="${W - M}" y="128" text-anchor="end" font-family="${MONO}" font-size="22" font-weight="700"
      letter-spacing="3" fill="${C.ambar}">${esc(etiqueta.toUpperCase())}</text>` : ""}

    ${contenido}

    ${pie ? `<line x1="${M}" y1="${H - 128}" x2="${W - M}" y2="${H - 128}" stroke="${C.linea}" stroke-width="2"/>
    <text x="${M}" y="${H - 72}" font-family="${MONO}" font-size="30" font-weight="700" fill="${C.ambar}">gestamanager.com</text>
    <text x="${W - M}" y="${H - 72}" text-anchor="end" font-family="${TEXTO}" font-size="26" fill="${C.tenue}">Web · Android · iPhone</text>` : ""}
  </svg>`;
}

/** Líneas de título en mayúsculas; la de `destacar` (índice o lista) va en ámbar. */
function titular(lineas, { x = M, y, size, leading, destacar, anchor = "start" }) {
  const resaltadas = [].concat(destacar ?? []);
  return lineas
    .map((l, i) => `<text x="${x}" y="${y + i * leading}" text-anchor="${anchor}" font-family="${TITULO}" font-weight="700"
      font-size="${size}" letter-spacing="-1" fill="${resaltadas.includes(i) ? C.ambar : C.texto}">${esc(l.toUpperCase())}</text>`)
    .join("");
}

function parrafo(texto, { x = M, y, ancho, size = 38, interlinea = 52, color = C.tenue, anchor = "start" }) {
  return ajustar(texto, ancho, size, 0.5)
    .map((l, i) => `<text x="${x}" y="${y + i * interlinea}" text-anchor="${anchor}" font-family="${TEXTO}" font-size="${size}" fill="${color}">${esc(l)}</text>`)
    .join("");
}

/**
 * Título grande con una línea en ámbar, y una bajada.
 *   visual: { etiqueta, titulo: [líneas], destacar: índice o [índices], bajada }
 * Cada línea del título, hasta ~18 caracteres (Saira es condensada). Bajada hasta ~150.
 */
export function declaracion({ etiqueta, titulo, destacar, bajada }) {
  const size = 132;
  const leading = 128;
  const lineasBajada = bajada ? ajustar(bajada, W - 2 * M, 40, 0.5) : [];
  const alto = (titulo.length - 1) * leading + (lineasBajada.length ? 100 + (lineasBajada.length - 1) * 56 : 0);
  // Centrado entre el encabezado (y≈170) y el pie (y≈1222).
  const y0 = (190 + 1190) / 2 - alto / 2 + size / 3;
  const yBajada = y0 + (titulo.length - 1) * leading + 100;
  return marco(etiqueta, `
    ${titular(titulo, { y: y0, size, leading, destacar })}
    <rect x="${M}" y="${yBajada - 62}" width="72" height="6" fill="${C.ambar}"/>
    ${parrafo(bajada ?? "", { y: yBajada, ancho: W - 2 * M, size: 40, interlinea: 56 })}`);
}

/**
 * Lista con rombos: funciones, pasos o ventajas.
 *   visual: { etiqueta, titulo: [1 o 2 líneas], destacar, items: [texto] (3 a 8) }
 * Cada ítem hasta ~60 caracteres: se ajusta a dos líneas.
 */
export function lista({ etiqueta, titulo, destacar, items }) {
  const yTitulo = 300;
  const tSize = 96;
  const tLeading = 94;
  const tamItem = items.length > 5 ? 34 : 38;
  const interlinea = tamItem * 1.3;
  const bloques = items.map((t) => ajustar(t, W - 2 * M - 70, tamItem, 0.5));
  const inicio = yTitulo + (titulo.length - 1) * tLeading + 120;
  const altoTexto = bloques.reduce((s, l) => s + l.length * interlinea, 0);
  const aire = Math.min(56, (1150 - inicio - altoTexto) / Math.max(1, items.length - 1));
  let cursor = inicio;

  const filas = bloques.map((lineas) => {
    const y = cursor;
    cursor += lineas.length * interlinea + aire;
    const cy = y - tamItem * 0.36;
    return `<path d="M${M + 14} ${cy - 16} L${M + 24} ${cy} L${M + 14} ${cy + 16} L${M + 4} ${cy} Z" fill="${C.ambar}"/>
      ${lineas.map((l, j) => `<text x="${M + 64}" y="${y + j * interlinea}" font-family="${TEXTO}" font-size="${tamItem}" fill="${C.texto}">${esc(l)}</text>`).join("")}`;
  });

  return marco(etiqueta, `${titular(titulo, { y: yTitulo, size: tSize, leading: tLeading, destacar })}${filas.join("")}`);
}

/** Ancho y alto de un PNG, leyendo su encabezado. */
function medidasPng(buffer) {
  return { ancho: buffer.readUInt32BE(16), alto: buffer.readUInt32BE(20) };
}

/**
 * Título arriba y la captura de la demo en un celular que se sale por abajo.
 *   visual: { etiqueta, titulo: [líneas], destacar, bajada, captura: "archivo.png", desde: px }
 * `captura` está en capturas/ (de un celular de 390 de ancho, a 3x). `desde` es
 * desde qué altura de la captura (en px de la imagen) se empieza a mostrar.
 * Título de hasta 2 líneas de ~20 caracteres; bajada hasta ~110.
 */
export function captura({ etiqueta, titulo, destacar, bajada, captura: archivo, desde = 0 }) {
  const png = readFileSync(join(dirMarca("gesta"), "capturas", archivo));
  const { ancho, alto } = medidasPng(png);

  const size = 100;
  const leading = 96;
  const yTitulo = 270;
  const lineasBajada = bajada ? ajustar(bajada, W - 2 * M, 34, 0.5) : [];
  const yBajada = yTitulo + (titulo.length - 1) * leading + 74;
  const finTexto = yBajada + (lineasBajada.length - 1) * 46;

  // El celular: ancho fijo, arranca debajo del texto y se corta en el borde.
  const tw = 560;
  const tx = (W - tw) / 2;
  const ty = finTexto + 70;
  const borde = 18;
  const pw = tw - 2 * borde;
  const escala = pw / ancho;
  const altoVisible = H - ty;
  return marco(etiqueta, `
    ${titular(titulo, { y: yTitulo, size, leading, destacar })}
    ${parrafo(bajada ?? "", { y: yBajada, ancho: W - 2 * M, size: 34, interlinea: 46 })}
    <defs><clipPath id="pantalla"><rect x="${tx + borde}" y="${ty + borde}" width="${pw}" height="${altoVisible}" rx="44"/></clipPath></defs>
    <rect x="${tx - 6}" y="${ty - 6}" width="${tw + 12}" height="${altoVisible + 60}" rx="76" fill="#000" opacity=".45"/>
    <rect x="${tx}" y="${ty}" width="${tw}" height="${altoVisible + 60}" rx="70" fill="#0b0d12" stroke="#2c3647" stroke-width="3"/>
    <g clip-path="url(#pantalla)">
      <image x="${tx + borde}" y="${ty + borde - desde * escala}" width="${pw}" height="${alto * escala}"
        xlink:href="data:image/png;base64,${png.toString("base64")}" preserveAspectRatio="none"/>
    </g>
    <rect x="${tx + tw / 2 - 60}" y="${ty + borde + 14}" width="120" height="34" rx="17" fill="#000"/>
    <rect x="0" y="${H - 250}" width="${W}" height="250" fill="url(#fundido)"/>
    <text x="${M}" y="${H - 72}" font-family="${MONO}" font-size="30" font-weight="700" fill="${C.ambar}">gestamanager.com</text>
    <text x="${W - M}" y="${H - 72}" text-anchor="end" font-family="${TEXTO}" font-size="26" fill="${C.tenue}">Web · Android · iPhone</text>`,
  { pie: false });
}

/**
 * Cierre de carrusel o placa de invitación: título centrado y el sitio en un botón.
 *   visual: { etiqueta, titulo: [líneas], destacar, bajada, boton }
 */
export function cierre({ etiqueta, titulo, destacar, bajada, boton = "gestamanager.com" }) {
  const size = 124;
  const leading = 120;
  const lineasBajada = bajada ? ajustar(bajada, W - 2 * M - 80, 38, 0.5) : [];
  // El bloque va del logo (size + 110 arriba de la primera línea) al botón; se centra entero.
  const arriba = size + 110;
  const abajo = (titulo.length - 1) * leading + 90 + (lineasBajada.length - 1) * 54 + 80 + 100;
  const y0 = (190 + 1250) / 2 - (arriba + abajo) / 2 + arriba;
  const yBajada = y0 + (titulo.length - 1) * leading + 90;
  const yBoton = yBajada + (lineasBajada.length - 1) * 54 + 80;
  return marco(etiqueta, `
    ${isotipo(W / 2 - 50, y0 - size - 110, 100)}
    ${titular(titulo, { x: W / 2, y: y0, size, leading, destacar, anchor: "middle" })}
    ${parrafo(bajada ?? "", { x: W / 2, y: yBajada, ancho: W - 2 * M - 80, size: 38, interlinea: 54, anchor: "middle" })}
    <rect x="${W / 2 - 300}" y="${yBoton}" width="600" height="100" rx="50" fill="${C.ambar}"/>
    <text x="${W / 2}" y="${yBoton + 64}" text-anchor="middle" font-family="${MONO}" font-size="38" font-weight="700" fill="${C.noche}">${esc(boton)}</text>`,
  { pie: false });
}
