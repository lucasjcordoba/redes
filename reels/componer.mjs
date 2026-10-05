/**
 * Compone el reel final (1080x1920) a partir de las dos grabaciones, los
 * subtítulos, la música del estilo del reel y, si la hay, la locución.
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
 * Esa es la disposición de Raudal Dev; cada proyecto tiene su plantilla
 * (`diseno` en el guion, ver disenos.mjs).
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
import { RAIZ } from "../lib/rutas.mjs";
import { esc } from "../lib/render.mjs";
import { DISENOS, W, H, svgPng, ancho } from "./disenos.mjs";
import { FPS } from "./grabador.mjs";
import { ANTES } from "./voz.mjs";
import { generarMusica } from "./musica.mjs";

const ejecutar = promisify(execFile);
const C = { fondo: "#060a12", texto: "#f1f3f8", tenue: "#8b96ad", cian: "#24dfe1", violeta: "#9079fe", linea: "#2a3446" };
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
  </defs>`;

/** Máscara con esquinas redondeadas (todas o sólo las de abajo). */
const mascara = (w, h, r, soloAbajo = false) => svgPng(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  ${soloAbajo ? `<path d="M0 0 H${w} V${h - r} a${r} ${r} 0 0 1 -${r} ${r} H${r} a${r} ${r} 0 0 1 -${r} -${r} Z" fill="#fff"/>` : `<rect width="${w}" height="${h}" rx="${r}" fill="#fff"/>`}</svg>`);

/** Placa de cierre de Raudal Dev (misma que las placas del feed). */
function capaCierre(arriba, opacidad) {
  const attrs = `font-family="Geist" font-weight="700" font-size="112" letter-spacing="-4"`;
  const xMarca = (W - (160 + 28 + ancho("Raudal.dev", attrs))) / 2;
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

  const D = DISENOS[guion.diseno ?? "raudal"];
  const fondo = await sharp(svgPng(D.fondo(guion))).png().toBuffer();
  const celular = svgPng(D.celular());
  const mEsc = D.esc.radio ? mascara(D.esc.w, D.esc.h, D.esc.radio, D.esc.soloAbajo) : null;
  const mCel = mascara(D.cel.w, D.cel.h, D.cel.radio - D.cel.borde);
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
      cacheTextos.set(clave, svgPng(D.textos({
        etiqueta: escena.etiqueta ?? guion.etiqueta, titulo: escena.titulo, opTitulo, subtitulo: sub?.texto, opSub, k: Math.max(0, k), n: locucion.length,
      })));
    }
    const [esc_, cel] = await Promise.all([
      sharp(join(dir, "escritorio", cuadrosEsc[i])).resize(D.esc.w, D.esc.h).composite(mEsc ? [{ input: mEsc, blend: "dest-in" }] : []).png().toBuffer(),
      sharp(join(dir, "celular", cuadrosCel[i])).resize(D.cel.w, D.cel.h).composite([{ input: mCel, blend: "dest-in" }]).png().toBuffer(),
    ]);
    ultimo = await sharp(fondo).composite([
      { input: esc_, left: D.esc.x, top: D.esc.y },
      { input: celular, left: 0, top: 0 },
      { input: cel, left: D.cel.x, top: D.cel.y },
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

  // Música del estilo del reel, con un remate en cada cambio de escena y en
  // la placa de cierre. Se entrega también suelta, para mezclar la voz aparte.
  const musica = join(RAIZ, "reels/salida", `${id}-musica.m4a`);
  await mkdir(join(RAIZ, "reels/salida"), { recursive: true });
  await generarMusica(total, musica, { estilo: guion.musica, marcas: [...locucion.slice(1).map((e) => e.inicio), duracion] });
  const salida = join(RAIZ, "reels/salida", `${id}.mp4`);
  const conVoz = locucion.every((e) => e.audio);
  let audio = ["-map", "1:a"];
  let entradas = [];
  if (conVoz) {
    // Cada escena en su lugar y la música por debajo.
    entradas = locucion.flatMap((e) => ["-i", e.audio]);
    const retardos = locucion.map((e, i) => `[${i + 2}:a]adelay=${Math.round((e.inicio + ANTES) * 1000)}|${Math.round((e.inicio + ANTES) * 1000)},aresample=44100,aformat=channel_layouts=stereo[v${i}]`);
    const mezclaVoz = `${locucion.map((_, i) => `[v${i}]`).join("")}amix=inputs=${locucion.length}:normalize=0,loudnorm=I=-16:TP=-1.5[voz]`;
    audio = ["-filter_complex", [...retardos, mezclaVoz, "[1:a]volume=0.30[mus]", "[voz][mus]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.95[a]"].join(";"), "-map", "[a]"];
  }
  await ejecutar("ffmpeg", [
    "-v", "error", "-y", "-framerate", String(FPS), "-i", join(dirSalida, "%05d.jpg"),
    "-i", musica, ...entradas,
    "-map", "0:v", ...audio, "-t", String(total),
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
