/**
 * Historia de la oferta de landing page de Raudal Dev (1080x1920).
 *
 *   node historias/raudal-oferta.mjs   → historias/salida/raudal-oferta.png
 *
 * Los datos salen de la oferta de marcas/raudal/marca.mjs (lo confirmado por
 * el dueño). Arriba (0–250) y abajo (desde 1650) queda libre para la interfaz
 * de Instagram; entre el botón y el pie hay lugar para el sticker de link.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";
import { RAIZ } from "../lib/rutas.mjs";

const W = 1080, H = 1920;
const C = { fondo: "#060a12", texto: "#f1f3f8", tenue: "#8b96ad", cian: "#24dfe1", violeta: "#9079fe", linea: "#2a3446", tarjeta: "#0e1522" };
const fuentes = ["Geist-400", "Geist-700", "JetBrainsMono-400", "JetBrainsMono-700"].map((f) => join(RAIZ, "fuentes", `${f}.ttf`));
const png = (svg) => new Resvg(svg, { font: { fontFiles: fuentes, loadSystemFonts: false, defaultFontFamily: "Geist" } }).render().asPng();
const ancho = (texto, attrs) => new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="300"><text x="0" y="250" ${attrs}>${texto}</text></svg>`, { font: { fontFiles: fuentes, loadSystemFonts: false } }).innerBBox()?.width ?? 0;

let grilla = "";
for (let x = 90; x < W; x += 90) grilla += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.linea}" opacity=".4"/>`;
for (let y = 90; y < H; y += 90) grilla += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.linea}" opacity=".4"/>`;

const attrsMarca = `font-family="Geist" font-weight="700" font-size="60" letter-spacing="-2"`;
const xMarca = (W - (88 + 14 + ancho("Raudal.dev", attrsMarca))) / 2;
const chip = "OFERTA · 4 CUPOS POR MES";
const aChip = ancho(chip, `font-family="JetBrains Mono" font-weight="700" font-size="26" letter-spacing="4"`) + 64;
const items = [
  ["Boceto de la portada sin cargo", "en 48 horas, antes de decidir"],
  ["50 % al aprobar el diseño", "y 50 % al publicar"],
  ["Botón de WhatsApp y formulario", "hasta 6 secciones, para celular y compu"],
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.cian}" stop-opacity=".3"/><stop offset="1" stop-color="${C.cian}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.violeta}" stop-opacity=".26"/><stop offset="1" stop-color="${C.violeta}" stop-opacity="0"/></radialGradient>
    <radialGradient id="fg" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="precio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cian}"/><stop offset="1" stop-color="${C.violeta}"/></linearGradient>
    <mask id="m"><rect width="${W}" height="${H}" fill="url(#fg)"/></mask>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.fondo}"/>
  <g mask="url(#m)">${grilla}</g>
  <ellipse cx="880" cy="760" rx="600" ry="460" fill="url(#g1)"/>
  <ellipse cx="160" cy="1460" rx="560" ry="440" fill="url(#g2)"/>
  <g transform="translate(${xMarca} 262) scale(2.7)" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M7 11.5 L20 9.5" stroke="${C.cian}"/><path d="M10 16.5 L26 14.5" stroke="${C.cian}"/><path d="M7 21.5 L18 19.5" stroke="${C.violeta}"/></g>
  <text x="${xMarca + 102}" y="326" ${attrsMarca} fill="${C.texto}">Raudal<tspan fill="${C.tenue}">.dev</tspan></text>

  <rect x="${(W - aChip) / 2}" y="392" width="${aChip}" height="58" rx="29" fill="${C.tarjeta}" stroke="${C.cian}" stroke-opacity=".6" stroke-width="2"/>
  <text x="${W / 2}" y="431" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="26" letter-spacing="4" fill="${C.cian}">${chip}</text>

  <text x="${W / 2}" y="580" text-anchor="middle" font-family="Geist" font-weight="700" font-size="92" letter-spacing="-3" fill="${C.texto}">Landing page</text>
  <text x="${W / 2}" y="682" text-anchor="middle" font-family="Geist" font-weight="700" font-size="92" letter-spacing="-3" fill="${C.texto}">lista en 7 días</text>
  <text x="${W / 2}" y="905" text-anchor="middle" font-family="Geist" font-weight="700" font-size="230" letter-spacing="-10" fill="url(#precio)">USD 250</text>
  <text x="${W / 2}" y="985" text-anchor="middle" font-family="Geist" font-size="40" fill="${C.tenue}">dominio incluido el primer año</text>

  <rect x="80" y="1050" width="920" height="360" rx="28" fill="${C.tarjeta}" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/>
  ${items.map(([a, b], i) => `
    <rect x="128" y="${1108 + i * 104}" width="14" height="14" fill="${C.cian}" transform="rotate(45 135 ${1115 + i * 104})"/>
    <text x="172" y="${1124 + i * 104}" font-family="Geist" font-weight="700" font-size="36" fill="${C.texto}">${a}</text>
    <text x="172" y="${1164 + i * 104}" font-family="Geist" font-size="28" fill="${C.tenue}">${b}</text>`).join("")}

  <rect x="${W / 2 - 300}" y="1460" width="600" height="96" rx="48" fill="${C.cian}"/>
  <text x="${W / 2}" y="1522" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="38" fill="${C.fondo}">raudaldev.com/landing</text>
  <text x="${W / 2}" y="1610" text-anchor="middle" font-family="Geist" font-size="30" fill="${C.tenue}">Pedido del boceto, sin compromiso</text>
</svg>`;

await mkdir(join(RAIZ, "historias/salida"), { recursive: true });
const salida = join(RAIZ, "historias/salida/raudal-oferta.png");
await sharp(png(svg)).png().toFile(salida);
console.log("✓", salida);
