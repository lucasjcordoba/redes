/**
 * Compone el reel final (1080x1920) a partir de las dos grabaciones, la
 * locución y los subtítulos.
 *
 *   ┌──────────────────────────┐
 *   │ zona de Instagram        │  y 0–220: la tapa la interfaz
 *   │ / ETIQUETA               │
 *   │ Título de la sección     │  cambia con cada escena
 *   │ ┌──────────────────────┐ │
 *   │ │ ● ● ●  dominio       │ │  ventana de escritorio
 *   │ │                      │ │
 *   │ ┌──────┐               │ │
 *   │ │      │───────────────┘ │
 *   │ │ cel. │  Subtítulos     │  a la derecha del celular: fuera de
 *   │ │      │  sincronizados  │  lo que tapan el texto y los íconos
 *   │ └──────┘                 │  de Instagram
 *   │ zona de Instagram        │  y 1600–1920
 *   └──────────────────────────┘
 *
 * Cada cuadro se arma con sharp; los textos se dibujan con resvg y las
 * tipografías del repo. Al final, la placa de cierre de Raudal Dev.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";
import { RAIZ } from "../lib/rutas.mjs";
import { esc, ajustar } from "../lib/render.mjs";
import { FPS } from "./grabador.mjs";
import { ANTES } from "./voz.mjs";
import { generarMusica } from "./musica.mjs";

const ejecutar = promisify(execFile);
const W = 1080, H = 1920;
const C = { fondo: "#060a12", texto: "#f1f3f8", tenue: "#8b96ad", cian: "#24dfe1", violeta: "#9079fe", linea: "#2a3446", ventana: "#111826" };
const fuentes = ["Geist-400", "Geist-700", "JetBrainsMono-400", "JetBrainsMono-700"].map((f) => join(RAIZ, "fuentes", `${f}.ttf`));
const svgPng = (svg) => new Resvg(svg, { font: { fontFiles: fuentes, loadSystemFonts: false, defaultFontFamily: "Geist" } }).render().asPng();

// Geometría.
const ESC = { x: 40, y: 400, w: 1000, barra: 46 }; // ventana de escritorio
ESC.pantalla = { x: ESC.x, y: ESC.y + ESC.barra, w: ESC.w, h: Math.round((ESC.w * 800) / 1280) };
const CEL = { x: 40, y: 850, borde: 13, radio: 50 };
CEL.pantalla = { x: CEL.x + CEL.borde, y: CEL.y + CEL.borde, w: 316, h: Math.round((316 * 844) / 390) };
CEL.w = CEL.pantalla.w + CEL.borde * 2;
CEL.h = CEL.pantalla.h + CEL.borde * 2;
const SUB = { x: CEL.x + CEL.w + 44, y: ESC.pantalla.y + ESC.pantalla.h + 50, w: 1000 - (CEL.x + CEL.w + 44), h: 400 };
const CIERRE = 3;
const FUNDIDO = 0.35;

function grilla() {
  let l = "";
  for (let x = 90; x < W; x += 90) l += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.linea}" opacity=".4"/>`;
  for (let y = 90; y < H; y += 90) l += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.linea}" opacity=".4"/>`;
  return l;
}
const brillos = `
  <defs>
    <radialGradient id="g1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.cian}" stop-opacity=".26"/><stop offset="1" stop-color="${C.cian}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.violeta}" stop-opacity=".22"/><stop offset="1" stop-color="${C.violeta}" stop-opacity="0"/></radialGradient>
    <radialGradient id="fg" cx=".5" cy=".4" r=".62"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <mask id="m"><rect width="${W}" height="${H}" fill="url(#fg)"/></mask>
    <filter id="sombra" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>`;

/** Fondo + ventana de escritorio (sin su pantalla). */
function capaFondo(dominio) {
  const e = ESC;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${brillos}
    <rect width="${W}" height="${H}" fill="${C.fondo}"/>
    <g mask="url(#m)">${grilla()}</g>
    <ellipse cx="900" cy="330" rx="560" ry="420" fill="url(#g1)"/>
    <ellipse cx="160" cy="1560" rx="520" ry="420" fill="url(#g2)"/>
    <rect x="${e.x}" y="${e.y + 18}" width="${e.w}" height="${e.barra + e.pantalla.h}" rx="22" fill="#000" opacity=".55" filter="url(#sombra)"/>
    <rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.barra + e.pantalla.h}" rx="20" fill="${C.ventana}" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/>
    <circle cx="${e.x + 26}" cy="${e.y + 23}" r="7" fill="#ff5f57"/><circle cx="${e.x + 48}" cy="${e.y + 23}" r="7" fill="#febc2e"/><circle cx="${e.x + 70}" cy="${e.y + 23}" r="7" fill="#28c840"/>
    <rect x="${e.x + 300}" y="${e.y + 10}" width="${e.w - 600}" height="26" rx="13" fill="#ffffff" fill-opacity=".07"/>
    <text x="${e.x + e.w / 2}" y="${e.y + 29}" text-anchor="middle" font-family="JetBrains Mono" font-size="16" fill="${C.tenue}">${esc(dominio)}</text>
  </svg>`;
}

/** El celular: sombra, carcasa y pantalla negra (el video va encima). */
function capaCelular() {
  const c = CEL;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${brillos}
    <rect x="${c.x}" y="${c.y + 20}" width="${c.w}" height="${c.h}" rx="${c.radio}" fill="#000" opacity=".7" filter="url(#sombra)"/>
    <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.radio}" fill="#0b0f16" stroke="#3a4456" stroke-width="3"/>
    <rect x="${c.pantalla.x}" y="${c.pantalla.y}" width="${c.pantalla.w}" height="${c.pantalla.h}" rx="${c.radio - c.borde}" fill="#000"/>
  </svg>`;
}

/** Máscaras con esquinas redondeadas para las dos pantallas. */
const mascara = (w, h, r, soloAbajo = false) => svgPng(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  ${soloAbajo ? `<path d="M0 0 H${w} V${h - r} a${r} ${r} 0 0 1 -${r} ${r} H${r} a${r} ${r} 0 0 1 -${r} -${r} Z" fill="#fff"/>` : `<rect width="${w}" height="${h}" rx="${r}" fill="#fff"/>`}</svg>`);

/** Título de la sección (arriba) y subtítulo (a la derecha del celular). */
function capaTextos({ etiqueta, titulo, opTitulo, subtitulo, opSub }) {
  const lineas = subtitulo ? ajustar(subtitulo, SUB.w, 46, 0.5) : [];
  const alto = lineas.length * 58;
  const y0 = SUB.y + (SUB.h - alto) / 2 + 42;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <g opacity="${opTitulo}">
      <text x="44" y="276" font-family="JetBrains Mono" font-size="26" letter-spacing="5" fill="${C.cian}">${esc(etiqueta)}</text>
      <text x="44" y="352" font-family="Geist" font-weight="700" font-size="62" letter-spacing="-2" fill="${C.texto}">${esc(titulo)}</text>
    </g>
    ${lineas.length ? `<g opacity="${opSub}">
      <rect x="${SUB.x - 22}" y="${y0 - 44}" width="5" height="${alto}" rx="2.5" fill="${C.cian}"/>
      ${lineas.map((l, i) => `<text x="${SUB.x}" y="${y0 + i * 58}" font-family="Geist" font-weight="700" font-size="46" letter-spacing="-.5" fill="${C.texto}">${esc(l)}</text>`).join("")}
    </g>` : ""}
  </svg>`;
}

/** Placa de cierre de Raudal Dev (misma que las placas del feed). */
function capaCierre(arriba, opacidad) {
  const attrs = `font-family="Geist" font-weight="700" font-size="112" letter-spacing="-4"`;
  const ancho = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="300"><text x="0" y="200" ${attrs}>Raudal.dev</text></svg>`, { font: { fontFiles: fuentes, loadSystemFonts: false } }).innerBBox()?.width ?? 560;
  const xMarca = (W - (160 + 28 + ancho)) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${brillos}<g opacity="${opacidad}">
    <rect width="${W}" height="${H}" fill="${C.fondo}"/>
    <g mask="url(#m)">${grilla()}</g>
    <ellipse cx="880" cy="420" rx="560" ry="460" fill="url(#g1)"/>
    <ellipse cx="160" cy="1500" rx="520" ry="440" fill="url(#g2)"/>
    <text x="${W / 2}" y="640" text-anchor="middle" font-family="JetBrains Mono" font-size="28" letter-spacing="6" fill="${C.tenue}">${esc(arriba)}</text>
    <g transform="translate(${xMarca} 700) scale(5)" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M7 11.5 L20 9.5" stroke="${C.cian}"/><path d="M10 16.5 L26 14.5" stroke="${C.cian}"/><path d="M7 21.5 L18 19.5" stroke="${C.violeta}"/></g>
    <text x="${xMarca + 188}" y="820" ${attrs} fill="${C.texto}">Raudal<tspan fill="${C.tenue}">.dev</tspan></text>
    <text x="${W / 2}" y="960" text-anchor="middle" font-family="Geist" font-size="40" fill="${C.tenue}">Sitios web, sistemas de gestión</text>
    <text x="${W / 2}" y="1014" text-anchor="middle" font-family="Geist" font-size="40" fill="${C.tenue}">y aplicaciones a medida.</text>
    <rect x="${W / 2 - 250}" y="1110" width="500" height="96" rx="48" fill="${C.cian}"/>
    <text x="${W / 2}" y="1172" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="38" fill="${C.fondo}">raudaldev.com</text>
    <text x="${W / 2}" y="1290" text-anchor="middle" font-family="Geist" font-size="32" fill="${C.tenue}">Primera reunión y presupuesto sin cargo</text>
  </g></svg>`;
}

const fundido = (t, desde, hasta, d = FUNDIDO) => Math.max(0, Math.min(1, (t - desde) / d, (hasta - t) / d));

export async function componer({ id, guion, locucion }) {
  const dir = join(RAIZ, "reels/tmp", id);
  const dirSalida = join(dir, "final");
  await rm(dirSalida, { recursive: true, force: true });
  await mkdir(dirSalida, { recursive: true });

  const cuadrosEsc = readdirSync(join(dir, "escritorio")).filter((f) => f.endsWith(".jpg")).sort();
  const cuadrosCel = readdirSync(join(dir, "celular")).filter((f) => f.endsWith(".jpg")).sort();
  const n = Math.min(cuadrosEsc.length, cuadrosCel.length);
  const duracion = n / FPS;
  const total = duracion + CIERRE;

  const fondo = await sharp(svgPng(capaFondo(guion.dominio))).png().toBuffer();
  const celular = svgPng(capaCelular());
  const mEsc = mascara(ESC.pantalla.w, ESC.pantalla.h, 20, true);
  const mCel = mascara(CEL.pantalla.w, CEL.pantalla.h, CEL.radio - CEL.borde);
  const subs = locucion.flatMap((e) => e.subtitulos);
  const cacheTextos = new Map();

  let ultimo;
  for (let i = 0; i < n; i++) {
    const t = i / FPS;
    const k = locucion.findLastIndex((e) => t >= e.inicio);
    const escena = locucion[Math.max(0, k)];
    // El título entra al empezar la escena y sale justo antes de la próxima.
    const opTitulo = +fundido(t, escena.inicio + (k === 0 ? 0.2 : 0), escena.inicio + escena.duracion + (k === locucion.length - 1 ? 99 : 0)).toFixed(2);
    const sub = subs.find((s) => t >= s.desde - 0.1 && t < s.hasta + 0.15);
    const opSub = sub ? +fundido(t, sub.desde - 0.1, sub.hasta + 0.15, 0.12).toFixed(2) : 0;
    const clave = `${k}|${opTitulo}|${sub?.texto}|${opSub}`;
    if (!cacheTextos.has(clave)) {
      cacheTextos.set(clave, svgPng(capaTextos({
        etiqueta: escena.etiqueta ?? guion.etiqueta, titulo: escena.titulo, opTitulo, subtitulo: sub?.texto, opSub,
      })));
    }
    const [esc_, cel] = await Promise.all([
      sharp(join(dir, "escritorio", cuadrosEsc[i])).resize(ESC.pantalla.w, ESC.pantalla.h).composite([{ input: mEsc, blend: "dest-in" }]).png().toBuffer(),
      sharp(join(dir, "celular", cuadrosCel[i])).resize(CEL.pantalla.w, CEL.pantalla.h).composite([{ input: mCel, blend: "dest-in" }]).png().toBuffer(),
    ]);
    ultimo = await sharp(fondo).composite([
      { input: esc_, left: ESC.pantalla.x, top: ESC.pantalla.y },
      { input: celular, left: 0, top: 0 },
      { input: cel, left: CEL.pantalla.x, top: CEL.pantalla.y },
      { input: cacheTextos.get(clave), left: 0, top: 0 },
    ]).png().toBuffer();
    await sharp(ultimo).jpeg({ quality: 93 }).toFile(join(dirSalida, `${String(i).padStart(5, "0")}.jpg`));
    if (i % 150 === 0) console.log(`  componiendo ${i}/${n}`);
  }
  // Cierre: se funde encima del último cuadro.
  for (let j = 0; j < CIERRE * FPS; j++) {
    const op = Math.min(1, j / (0.5 * FPS));
    await sharp(ultimo).composite([{ input: svgPng(capaCierre(guion.cierre ?? "DESARROLLADO POR", op)), left: 0, top: 0 }])
      .jpeg({ quality: 93 }).toFile(join(dirSalida, `${String(n + j).padStart(5, "0")}.jpg`));
  }

  // Audio: cada escena en su lugar, música por debajo.
  await generarMusica(total, join(dir, "musica.m4a"));
  const entradas = locucion.flatMap((e) => ["-i", e.audio]);
  const retardos = locucion.map((e, i) => `[${i + 1}:a]adelay=${Math.round((e.inicio + ANTES) * 1000)}|${Math.round((e.inicio + ANTES) * 1000)},aresample=44100,aformat=channel_layouts=stereo[v${i}]`);
  const mezclaVoz = `${locucion.map((_, i) => `[v${i}]`).join("")}amix=inputs=${locucion.length}:normalize=0,loudnorm=I=-16:TP=-1.5[voz]`;
  const musicaIdx = locucion.length + 1;
  const salida = join(RAIZ, "reels/salida", `${id}.mp4`);
  await mkdir(join(RAIZ, "reels/salida"), { recursive: true });
  await ejecutar("ffmpeg", [
    "-v", "error", "-y", "-framerate", String(FPS), "-i", join(dirSalida, "%05d.jpg"),
    ...entradas, "-i", join(dir, "musica.m4a"),
    "-filter_complex", [
      ...retardos, mezclaVoz,
      `[${musicaIdx}:a]volume=0.30[mus]`,
      `[voz][mus]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.95[a]`,
    ].join(";"),
    "-map", "0:v", "-map", "[a]", "-t", String(total),
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", salida,
  ]);

  // Subtítulos también como .srt, por si se prefieren los de Instagram.
  const hms = (s) => new Date(s * 1000).toISOString().slice(11, 23).replace(".", ",");
  const srt = subs.map((s, i) => `${i + 1}\n${hms(s.desde)} --> ${hms(s.hasta)}\n${s.texto}\n`).join("\n");
  await writeFile(join(RAIZ, "reels/salida", `${id}.srt`), srt);
  console.log(`✓ ${salida} (${total.toFixed(1)} s)`);
  return { salida, total };
}
