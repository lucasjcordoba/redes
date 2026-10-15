/**
 * Reel promocional sin voz: placas de texto animado intercaladas con
 * pantallas reales, para que se entienda sin sonido.
 *
 *   node reels/promo.mjs <id>     (guion en reels/promos/<id>.mjs)
 *
 * El guion es una lista de bloques, cada uno con su duración:
 *   { tipo: "frase", lineas: [[texto, color?], ...], chico? }   frase grande que entra palabra por palabra
 *   { tipo: "precio", desde, hasta, prefijo, abajo }             el precio cuenta hasta su valor
 *   { tipo: "lista", titulo, items }                             tildes que se van marcando
 *   { tipo: "pantallas", url, dominio, titulo: [líneas] }        escritorio y celular del sitio, con titular
 *   { tipo: "cierre", arriba, linea, precio, detalle, url, pie } placa final
 * Más `banner` ({ arriba, precio, abajo }: la oferta a la derecha del celular
 * durante las pantallas) y `musica`.
 *
 * Deja reels/salida/<id>.mp4. Las pantallas se graban con grabador.mjs.
 */
import { pathToFileURL } from "node:url";
import { mkdir, rm } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import sharp from "sharp";
import { RAIZ } from "../lib/rutas.mjs";
import { esc } from "../lib/render.mjs";
import { FPS, grabar } from "./grabador.mjs";
import { DISENOS, W, H, svgPng, ancho } from "./disenos.mjs";
import { generarMusica } from "./musica.mjs";

const ejecutar = promisify(execFile);
const C = { fondo: "#060a12", texto: "#f1f3f8", tenue: "#8b96ad", cian: "#24dfe1", violeta: "#9079fe", linea: "#2a3446", tarjeta: "#0e1522" };
const D = DISENOS.raudal;

// Curvas de animación.
const lim = (x) => Math.max(0, Math.min(1, x));
const salida = (k) => 1 - Math.pow(1 - lim(k), 3);
const rebote = (k) => { k = lim(k); const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

let grilla = "";
for (let x = 90; x < W; x += 90) grilla += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.linea}" opacity=".4"/>`;
for (let y = 90; y < H; y += 90) grilla += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.linea}" opacity=".4"/>`;
const defs = `<defs>
  <radialGradient id="g1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.cian}" stop-opacity=".28"/><stop offset="1" stop-color="${C.cian}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.violeta}" stop-opacity=".24"/><stop offset="1" stop-color="${C.violeta}" stop-opacity="0"/></radialGradient>
  <radialGradient id="fg" cx=".5" cy=".45" r=".62"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="gr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cian}"/><stop offset="1" stop-color="${C.violeta}"/></linearGradient>
  <mask id="m"><rect width="${W}" height="${H}" fill="url(#fg)"/></mask></defs>`;
/** Fondo de placa; los brillos se mueven apenas con el tiempo. */
const fondo = (t) => `${defs}<rect width="${W}" height="${H}" fill="${C.fondo}"/><g mask="url(#m)">${grilla}</g>
  <ellipse cx="${860 + 60 * Math.sin(t * 0.7)}" cy="${640 + 40 * Math.cos(t * 0.5)}" rx="620" ry="480" fill="url(#g1)"/>
  <ellipse cx="${180 - 50 * Math.sin(t * 0.6)}" cy="1420" rx="560" ry="440" fill="url(#g2)"/>`;
const svg = (c) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${c}</svg>`;
const color = (c) => (c === "cian" ? C.cian : c === "gradiente" ? "url(#gr)" : c === "tenue" ? C.tenue : C.texto);

// ---------- placas ----------

/** Frase grande: cada palabra entra con un rebote, una detrás de otra. */
function frase(b, t) {
  const tam = b.chico ? 92 : 118;
  const alto = tam * 1.12;
  const y0 = H / 2 - ((b.lineas.length - 1) * alto) / 2 + tam * 0.35 - 60;
  let n = 0;
  const lineas = b.lineas.map(([texto, c], i) => {
    const attrs = `font-family="Geist" font-weight="700" font-size="${tam}" letter-spacing="-4"`;
    const palabras = texto.split(" ");
    const anchos = palabras.map((p) => ancho(p, attrs));
    const espacio = tam * 0.26;
    let x = (W - (anchos.reduce((a, b) => a + b, 0) + espacio * (palabras.length - 1))) / 2;
    return palabras.map((p, j) => {
      const k = (t - 0.15 - n++ * 0.13) / 0.45;
      const s = rebote(k), o = lim(k * 2.5);
      const cx = x + anchos[j] / 2, cy = y0 + i * alto;
      const g = `<g opacity="${o.toFixed(3)}" transform="translate(${cx} ${cy + (1 - salida(k)) * 40}) scale(${(0.6 + 0.4 * s).toFixed(3)}) translate(${-cx} ${-cy})">
        <text x="${x}" y="${cy}" ${attrs} fill="${color(c)}">${esc(p)}</text></g>`;
      x += anchos[j] + espacio;
      return g;
    }).join("");
  }).join("");
  return svg(fondo(t) + lineas);
}

/** Precio que cuenta desde `desde` hasta `hasta`, con un subrayado que se dibuja. */
function precio(b, t) {
  const k = salida((t - 0.2) / 1.1);
  const valor = Math.round(b.desde + (b.hasta - b.desde) * k);
  const pop = rebote((t - 1.25) / 0.35);
  const s = t > 1.25 ? 1 + 0.08 * Math.sin(Math.PI * lim((t - 1.25) / 0.35)) : 1;
  const linea = salida((t - 1.4) / 0.6);
  return svg(`${fondo(t)}
    <text x="${W / 2}" y="640" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="36" letter-spacing="8" fill="${C.cian}" opacity="${lim(t / 0.3)}">${esc(b.arriba)}</text>
    <g transform="translate(${W / 2} 960) scale(${s.toFixed(3)})">
      <text x="0" y="0" text-anchor="middle" font-family="Geist" font-weight="700" font-size="220" letter-spacing="-10" fill="url(#gr)">${esc(b.prefijo)} ${valor}</text></g>
    <rect x="${W / 2 - 380}" y="1010" width="${760 * linea}" height="10" rx="5" fill="${C.cian}"/>
    <text x="${W / 2}" y="1110" text-anchor="middle" font-family="Geist" font-weight="700" font-size="52" fill="${C.texto}" opacity="${lim(pop)}">${esc(b.abajo)}</text>`);
}

/** Lista con tildes que se marcan de a una. */
function lista(b, t) {
  const y0 = 760, paso = 150;
  const items = b.items.map((it, i) => {
    const k = (t - 0.35 - i * 0.45) / 0.4;
    const o = lim(k * 2), dx = (1 - salida(k)) * 80, c = rebote((t - 0.55 - i * 0.45) / 0.35);
    const y = y0 + i * paso;
    return `<g opacity="${o}" transform="translate(${dx} 0)">
      <rect x="110" y="${y - 70}" width="860" height="112" rx="28" fill="${C.tarjeta}" stroke="#ffffff" stroke-opacity=".1" stroke-width="2"/>
      <g transform="translate(176 ${y - 14}) scale(${lim(c).toFixed(3)})"><circle r="34" fill="${C.cian}"/>
        <path d="M-15 1 L-4 12 L17 -11" fill="none" stroke="${C.fondo}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>
      <text x="240" y="${y + 2}" font-family="Geist" font-weight="700" font-size="48" fill="${C.texto}">${esc(it)}</text></g>`;
  }).join("");
  return svg(`${fondo(t)}
    <text x="${W / 2}" y="560" text-anchor="middle" font-family="Geist" font-weight="700" font-size="96" letter-spacing="-3" fill="${C.texto}" opacity="${lim(t / 0.3)}">${esc(b.titulo)}</text>
    ${items}`);
}

/** Placa final. */
function cierre(b, t) {
  const e = (d) => salida((t - d) / 0.5);
  return svg(`${fondo(t)}
    <text x="${W / 2}" y="470" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="32" letter-spacing="6" fill="${C.cian}" opacity="${e(0)}">${esc(b.arriba)}</text>
    <text x="${W / 2}" y="${610 + 30 * (1 - e(0.1))}" text-anchor="middle" font-family="Geist" font-weight="700" font-size="92" letter-spacing="-3" fill="${C.texto}" opacity="${e(0.1)}">${esc(b.linea)}</text>
    <g transform="translate(${W / 2} 850) scale(${(0.7 + 0.3 * rebote((t - 0.3) / 0.5)).toFixed(3)})" opacity="${e(0.3)}">
      <text x="0" y="0" text-anchor="middle" font-family="Geist" font-weight="700" font-size="240" letter-spacing="-10" fill="url(#gr)">${esc(b.precio)}</text></g>
    <text x="${W / 2}" y="950" text-anchor="middle" font-family="Geist" font-size="44" fill="${C.texto}" opacity="${e(0.6)}">${esc(b.detalle)}</text>
    <g opacity="${e(0.8)}" transform="translate(0 ${20 * (1 - e(0.8))})">
      <rect x="${W / 2 - 340}" y="1040" width="680" height="112" rx="56" fill="${C.cian}"/>
      <text x="${W / 2}" y="1113" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="46" fill="${C.fondo}">${esc(b.url)}</text></g>
    <text x="${W / 2}" y="1240" text-anchor="middle" font-family="Geist" font-size="36" fill="${C.tenue}" opacity="${e(1)}">${esc(b.pie)}</text>`);
}

// ---------- pantallas ----------

const mascara = (w, h, r, soloAbajo = false) => svgPng(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  ${soloAbajo ? `<path d="M0 0 H${w} V${h - r} a${r} ${r} 0 0 1 -${r} ${r} H${r} a${r} ${r} 0 0 1 -${r} -${r} Z" fill="#fff"/>` : `<rect width="${w}" height="${h}" rx="${r}" fill="#fff"/>`}</svg>`);
const mEsc = mascara(D.esc.w, D.esc.h, D.esc.radio, D.esc.soloAbajo);
const mCel = mascara(D.cel.w, D.cel.h, D.cel.radio - D.cel.borde);
const capaCelular = svgPng(D.celular());

/** Titular grande arriba de las pantallas y la franja fija abajo. */
function capaPantallas(b, t, banner) {
  const lineas = b.titulo.map((l, i) => {
    const k = salida((t - 0.1 - i * 0.15) / 0.5);
    return `<text x="44" y="${282 + i * 74 + (1 - k) * 30}" font-family="Geist" font-weight="700" font-size="66" letter-spacing="-2" fill="${i === b.titulo.length - 1 ? C.cian : C.texto}" opacity="${k}">${esc(l)}</text>`;
  }).join("");
  // A la derecha del celular: el precio grande y la oferta, todo el tramo.
  const x = D.cel.marco.x + D.cel.marco.w + 44;
  const franja = banner ? `${defs}
    <text x="${x}" y="1250" font-family="JetBrains Mono" font-weight="700" font-size="26" letter-spacing="4" fill="${C.cian}">${esc(banner.arriba)}</text>
    <text x="${x - 6}" y="1390" font-family="Geist" font-weight="700" font-size="150" letter-spacing="-7" fill="url(#gr)">${esc(banner.precio)}</text>
    <text x="${x}" y="1460" font-family="Geist" font-weight="700" font-size="40" fill="${C.texto}">${esc(banner.abajo)}</text>` : "";
  return svgPng(svg(lineas + franja));
}

// ---------- armado ----------

const id = process.argv[2];
if (!id) { console.error("Uso: node reels/promo.mjs <id>"); process.exit(2); }
const { promo } = await import(pathToFileURL(join(RAIZ, "reels/promos", `${id}.mjs`)).href);
const dir = join(RAIZ, "reels/tmp", id);
const dirFinal = join(dir, "final");
await rm(dirFinal, { recursive: true, force: true });
await mkdir(dirFinal, { recursive: true });

// Graba todas las pantallas de una vez, en el orden en que aparecen.
const tramos = promo.bloques.filter((b) => b.tipo === "pantallas");
if (tramos.length && !process.argv.includes("--solo-componer")) {
  for (const formato of ["escritorio", "celular"]) {
    await grabar({ id, formato, url: tramos[0].url, transicion: 0.01, escenas: tramos.map((b) => ({ duracion: b.duracion, url: b.url, sel: b.sel, deriva: b.deriva })) });
  }
}
const cuadrosEsc = tramos.length ? readdirSync(join(dir, "escritorio")).sort() : [];
const cuadrosCel = tramos.length ? readdirSync(join(dir, "celular")).sort() : [];

let n = 0, iPant = 0;
const marcas = [];
const fondos = new Map();
for (const b of promo.bloques) {
  marcas.push(n / FPS);
  const cuadros = Math.round(b.duracion * FPS);
  if (b.tipo === "pantallas" && !fondos.has(b.dominio)) fondos.set(b.dominio, await sharp(svgPng(D.fondo({ dominio: b.dominio }))).png().toBuffer());
  for (let i = 0; i < cuadros; i++, n++) {
    const t = i / FPS;
    let png;
    if (b.tipo === "pantallas") {
      const [e, c] = await Promise.all([
        sharp(join(dir, "escritorio", cuadrosEsc[iPant])).resize(D.esc.w, D.esc.h).composite([{ input: mEsc, blend: "dest-in" }]).png().toBuffer(),
        sharp(join(dir, "celular", cuadrosCel[iPant])).resize(D.cel.w, D.cel.h).composite([{ input: mCel, blend: "dest-in" }]).png().toBuffer(),
      ]);
      iPant++;
      png = await sharp(fondos.get(b.dominio)).composite([
        { input: e, left: D.esc.x, top: D.esc.y }, { input: capaCelular, left: 0, top: 0 },
        { input: c, left: D.cel.x, top: D.cel.y }, { input: capaPantallas(b, t, promo.banner), left: 0, top: 0 },
      ]).png().toBuffer();
    } else {
      png = svgPng({ frase, precio, lista, cierre }[b.tipo](b, t));
    }
    // Fundido corto de entrada en cada bloque.
    const entrada = lim(t / 0.18);
    const img = entrada < 1 ? await sharp({ create: { width: W, height: H, channels: 3, background: C.fondo } }).composite([{ input: await sharp(png).ensureAlpha(entrada).png().toBuffer() }]).png().toBuffer() : png;
    await sharp(img).jpeg({ quality: 93 }).toFile(join(dirFinal, `${String(n).padStart(5, "0")}.jpg`));
  }
  console.log(`  ${b.tipo} (${b.duracion} s)`);
}

const total = n / FPS;
const musica = join(dir, "musica.m4a");
await generarMusica(total, musica, { estilo: promo.musica ?? "raudal", marcas: marcas.slice(1) });
await mkdir(join(RAIZ, "reels/salida"), { recursive: true });
const salidaMp4 = join(RAIZ, "reels/salida", `${id}.mp4`);
await ejecutar("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS), "-i", join(dirFinal, "%05d.jpg"), "-i", musica,
  "-map", "0:v", "-map", "1:a", "-t", String(total), "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "20",
  "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", salidaMp4]);
if (!process.argv.includes("--conservar")) for (const d of ["escritorio", "celular", "final"]) await rm(join(dir, d), { recursive: true, force: true });
console.log(`✓ ${salidaMp4} (${total.toFixed(1)} s)`);
