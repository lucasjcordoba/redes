/**
 * Flyer de Raudal Dev para Historias de Instagram (1080x1920).
 *
 *   node historias/raudal-flyer.mjs   → historias/salida/raudal-historia.png
 *
 * Misma estética que las placas del feed (grilla, cian y violeta). Las
 * capturas son de trabajos reales (con los datos de demo de cada sistema).
 * Arriba (0–250) y abajo (desde 1710) queda libre: ahí Instagram pone la barra
 * de progreso, el nombre de la cuenta y la caja de respuesta.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";
import { RAIZ } from "../lib/rutas.mjs";

const W = 1080, H = 1920;
const C = { fondo: "#060a12", texto: "#f1f3f8", tenue: "#8b96ad", cian: "#24dfe1", violeta: "#9079fe", linea: "#2a3446", tarjeta: "#0e1522" };
const fuentes = ["Geist-400", "Geist-700", "JetBrainsMono-400", "JetBrainsMono-700"].map((f) => join(RAIZ, "fuentes", `${f}.ttf`));
const png = (svg) => new Resvg(svg, { font: { fontFiles: fuentes, loadSystemFonts: false, defaultFontFamily: "Geist" } }).render().asPng();
const ancho = (texto, attrs) => new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="200"><text x="0" y="150" ${attrs}>${texto}</text></svg>`, { font: { fontFiles: fuentes, loadSystemFonts: false } }).innerBBox()?.width ?? 0;

// Trabajos: captura y nombre.
const trabajos = [
  ["gesta.jpg", "Gesta Manager", "Gestión de giras"],
  ["argentecnica.jpg", "Argentecnica", "Órdenes de trabajo"],
  ["tennis.jpg", "BsAs Tennis Tour", "Torneos de tenis"],
  ["upgestiones.jpg", "UP gestiones", "Sitio web"],
];
const T = { x0: 60, y0: 744, w: 465, h: 226, gap: 28, pie: 70 };
const servicios = ["Sitios y tiendas web", "Sistemas de gestión", "Aplicaciones móviles", "Software a medida", "Mantenimiento"];

let grilla = "";
for (let x = 90; x < W; x += 90) grilla += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.linea}" opacity=".4"/>`;
for (let y = 90; y < H; y += 90) grilla += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.linea}" opacity=".4"/>`;

// Chips de servicios, en filas centradas.
const fChip = `font-family="Geist" font-weight="700" font-size="26"`;
const filas = [[]];
let largo = 0;
for (const s of servicios) {
  const w = ancho(s, fChip) + 44;
  if (largo + w > 960 && filas.at(-1).length) { filas.push([]); largo = 0; }
  filas.at(-1).push([s, w]);
  largo += w + 16;
}
const chips = filas.map((fila, i) => {
  const total = fila.reduce((a, [, w]) => a + w, 0) + 16 * (fila.length - 1);
  let x = (W - total) / 2;
  return fila.map(([s, w]) => {
    const g = `<rect x="${x}" y="${1392 + i * 64}" width="${w}" height="52" rx="26" fill="${C.tarjeta}" stroke="${C.cian}" stroke-opacity=".5" stroke-width="2"/>
      <text x="${x + w / 2}" y="${1427 + i * 64}" text-anchor="middle" ${fChip} fill="${C.texto}">${s}</text>`;
    x += w + 16;
    return g;
  }).join("");
}).join("");

const tarjetas = trabajos.map(([, nombre, que], i) => {
  const x = T.x0 + (i % 2) * (T.w + T.gap), y = T.y0 + Math.floor(i / 2) * (T.h + T.pie + T.gap);
  return `<rect x="${x}" y="${y + 18}" width="${T.w}" height="${T.h + T.pie}" rx="20" fill="#000" opacity=".5" filter="url(#s)"/>
    <rect x="${x}" y="${y}" width="${T.w}" height="${T.h + T.pie}" rx="20" fill="${C.tarjeta}" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/>
    <text x="${x + 22}" y="${y + T.h + 34}" font-family="Geist" font-weight="700" font-size="27" fill="${C.texto}">${nombre}</text>
    <text x="${x + 22}" y="${y + T.h + 58}" font-family="JetBrains Mono" font-size="18" fill="${C.tenue}">${que}</text>`;
}).join("");

const attrsMarca = `font-family="Geist" font-weight="700" font-size="76" letter-spacing="-3"`;
const xMarca = (W - (110 + 18 + ancho("Raudal.dev", attrsMarca))) / 2;

const fondo = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.cian}" stop-opacity=".26"/><stop offset="1" stop-color="${C.cian}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.violeta}" stop-opacity=".22"/><stop offset="1" stop-color="${C.violeta}" stop-opacity="0"/></radialGradient>
    <radialGradient id="fg" cx=".5" cy=".4" r=".62"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <mask id="m"><rect width="${W}" height="${H}" fill="url(#fg)"/></mask>
    <filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="20"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.fondo}"/>
  <g mask="url(#m)">${grilla}</g>
  <ellipse cx="900" cy="380" rx="560" ry="420" fill="url(#g1)"/>
  <ellipse cx="160" cy="1500" rx="560" ry="440" fill="url(#g2)"/>
  <g transform="translate(${xMarca} 270) scale(3.4)" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M7 11.5 L20 9.5" stroke="${C.cian}"/><path d="M10 16.5 L26 14.5" stroke="${C.cian}"/><path d="M7 21.5 L18 19.5" stroke="${C.violeta}"/></g>
  <text x="${xMarca + 128}" y="352" ${attrsMarca} fill="${C.texto}">Raudal<tspan fill="${C.tenue}">.dev</tspan></text>
  <text x="${W / 2}" y="490" text-anchor="middle" font-family="Geist" font-weight="700" font-size="58" letter-spacing="-1.5" fill="${C.texto}">Lo que hoy vive en planillas,</text>
  <text x="${W / 2}" y="560" text-anchor="middle" font-family="Geist" font-weight="700" font-size="58" letter-spacing="-1.5" fill="${C.texto}">cuadernos y grupos de WhatsApp,</text>
  <text x="${W / 2}" y="630" text-anchor="middle" font-family="Geist" font-weight="700" font-size="58" letter-spacing="-1.5" fill="${C.cian}">ordenado en un solo sistema.</text>
  <text x="${W / 2}" y="704" text-anchor="middle" font-family="JetBrains Mono" font-size="24" letter-spacing="5" fill="${C.tenue}">ALGUNOS TRABAJOS</text>
  ${tarjetas}
  ${chips}
  <rect x="${W / 2 - 250}" y="1548" width="500" height="86" rx="43" fill="${C.cian}"/>
  <text x="${W / 2}" y="1604" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="38" fill="${C.fondo}">raudaldev.com</text>
  <text x="${W / 2}" y="1684" text-anchor="middle" font-family="Geist" font-size="30" fill="${C.tenue}">Primera reunión y presupuesto sin cargo</text>
</svg>`;

const capturas = await Promise.all(trabajos.map(async ([archivo], i) => {
  const x = T.x0 + (i % 2) * (T.w + T.gap), y = T.y0 + Math.floor(i / 2) * (T.h + T.pie + T.gap);
  const mascara = png(`<svg xmlns="http://www.w3.org/2000/svg" width="${T.w}" height="${T.h}"><path d="M0 20 a20 20 0 0 1 20 -20 H${T.w - 20} a20 20 0 0 1 20 20 V${T.h} H0 Z" fill="#fff"/></svg>`);
  const img = await sharp(await readFile(join(RAIZ, "historias/capturas", archivo))).resize(T.w, T.h, { fit: "cover", position: "top" }).composite([{ input: mascara, blend: "dest-in" }]).png().toBuffer();
  return { input: img, left: x, top: y };
}));

await mkdir(join(RAIZ, "historias/salida"), { recursive: true });
const salida = join(RAIZ, "historias/salida/raudal-historia.png");
await sharp(png(fondo)).composite(capturas).png().toFile(salida);
console.log("✓", salida);
