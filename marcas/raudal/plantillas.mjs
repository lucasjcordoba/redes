/**
 * Placas de Raudal Dev, 1080x1350 (4:5, el formato que más ocupa el feed).
 *
 * Portadas de raudal-dev/scripts/generate-social.mjs. Único cambio: Helvetica
 * y Menlo pasan a Geist y JetBrains Mono, las fuentes del sitio, porque las
 * del sistema no existen fuera de la Mac.
 *
 * El texto se posiciona línea por línea a mano: SVG no ajusta texto, y
 * controlar cada salto es justamente lo que hace que los títulos queden bien
 * cortados. Por eso `titulo` es un array de líneas.
 */
import { esc } from "../../lib/render.mjs";

const W = 1080;
const H = 1350;

const SANS = "Geist";
const MONO = "JetBrains Mono";

const C = {
  ground: "#060a12",
  text: "#f1f3f8",
  muted: "#8b96ad",
  cyan: "#24dfe1",
  violet: "#9079fe",
  line: "#2a3446",
};

/** Grilla técnica, igual que la del sitio pero a escala de placa. */
function grid() {
  const step = 90;
  let lines = "";
  for (let x = step; x < W; x += step) {
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.line}" stroke-width="1" opacity="0.55"/>`;
  }
  for (let y = step; y < H; y += step) {
    lines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.line}" stroke-width="1" opacity="0.55"/>`;
  }
  return `<g mask="url(#fade)">${lines}</g>`;
}

/** La corriente de la marca, mismo trazado que el favicon. */
function mark(x, y, size) {
  const s = size / 32;
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M7 11.5 L20 9.5" stroke="${C.cyan}"/>
    <path d="M10 16.5 L26 14.5" stroke="${C.cyan}"/>
    <path d="M7 21.5 L18 19.5" stroke="${C.violet}"/>
  </g>`;
}

function fondo({ glow = [880, 180, 520, 420], glow2 = [120, 1180, 460, 380] } = {}) {
  return `
    <defs>
      <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="${C.cyan}" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="${C.cyan}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="${C.violet}" stop-opacity="0.26"/>
        <stop offset="100%" stop-color="${C.violet}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="fadeGrad" cx="0.5" cy="0.36" r="0.62">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <mask id="fade"><rect width="${W}" height="${H}" fill="url(#fadeGrad)"/></mask>
    </defs>
    <rect width="${W}" height="${H}" fill="${C.ground}"/>
    ${grid()}
    <ellipse cx="${glow[0]}" cy="${glow[1]}" rx="${glow[2]}" ry="${glow[3]}" fill="url(#glow)"/>
    <ellipse cx="${glow2[0]}" cy="${glow2[1]}" rx="${glow2[2]}" ry="${glow2[3]}" fill="url(#glow2)"/>`;
}

function encabezado(eyebrow, M) {
  return `${mark(M, 86, 58)}
    <text x="${M + 78}" y="${86 + 40}" fill="${C.muted}"
      font-family="${MONO}" font-size="26" letter-spacing="4">${esc(eyebrow)}</text>`;
}

function pie(M) {
  return `<rect x="${M}" y="1236" width="14" height="14" fill="${C.cyan}" transform="rotate(45 ${M + 7} 1243)"/>
    <text x="${M + 40}" y="1252" fill="${C.text}"
      font-family="${MONO}" font-size="28" letter-spacing="1">raudaldev.com</text>`;
}

/**
 * Título grande de 2 a 4 líneas, una en cian, y una bajada.
 *   visual: { eyebrow, titulo: [líneas], destacar: índice, bajada }
 * Cada línea del título, hasta ~17 caracteres.
 */
export function declaracion({ eyebrow, titulo, destacar, bajada }) {
  const M = 96;
  const size = 82;
  const leading = 104;
  const bajadaGap = 110;

  // El bloque (título + bajada) se centra ópticamente entre el eyebrow y la
  // línea del pie, así placas de 2, 3 o 4 líneas quedan todas equilibradas.
  const zonaTop = 260;
  const zonaBottom = 1120;
  const alto = (titulo.length - 1) * leading + bajadaGap;
  const primeraY = (zonaTop + zonaBottom) / 2 - alto / 2 + size / 2;
  const bajadaY = primeraY + (titulo.length - 1) * leading + bajadaGap;

  const lineas = titulo
    .map((linea, i) => {
      const fill = i === destacar ? C.cyan : C.text;
      return `<text x="${M}" y="${primeraY + i * leading}" fill="${fill}"
        font-family="${SANS}" font-size="${size}" font-weight="700" letter-spacing="-3">${esc(linea)}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${fondo()}
    ${encabezado(eyebrow, M)}
    ${lineas}
    <text x="${M}" y="${bajadaY}" fill="${C.muted}"
      font-family="${SANS}" font-size="36" letter-spacing="-0.5">${esc(bajada)}</text>
    <line x1="${M}" y1="1180" x2="${W - M}" y2="1180" stroke="${C.line}" stroke-width="2"/>
    ${pie(M)}
  </svg>`;
}

/**
 * Pasos numerados. Existe para romper la monotonía: seis placas con la misma
 * composición se leen como una sola cosa repetida en el feed.
 *   visual: { eyebrow, titulo, pasos: [{ titulo, texto }] (3 a 5), bajada }
 * Título de paso hasta ~34 caracteres; texto hasta ~50.
 */
export function pasos({ eyebrow, titulo, pasos, bajada }) {
  const M = 96;
  const inicioY = 430;
  const alto = 148;

  const items = pasos
    .map((p, i) => {
      const y = inicioY + i * alto;
      return `
    <text x="${M}" y="${y}" fill="${C.cyan}"
      font-family="${MONO}" font-size="30" letter-spacing="2">${String(i + 1).padStart(2, "0")}</text>
    <text x="${M + 78}" y="${y}" fill="${C.text}"
      font-family="${SANS}" font-size="40" font-weight="700" letter-spacing="-1">${esc(p.titulo)}</text>
    <text x="${M + 78}" y="${y + 44}" fill="${C.muted}"
      font-family="${SANS}" font-size="28">${esc(p.texto)}</text>
    <line x1="${M}" y1="${y + 78}" x2="${W - M}" y2="${y + 78}" stroke="${C.line}" stroke-width="1"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${fondo({ glow: [880, 160, 500, 400], glow2: [140, 1200, 440, 360] })}
    ${encabezado(eyebrow, M)}
    <text x="${M}" y="290" fill="${C.text}"
      font-family="${SANS}" font-size="76" font-weight="700" letter-spacing="-3">${esc(titulo)}</text>
    ${items}
    <text x="${M}" y="1190" fill="${C.muted}"
      font-family="${SANS}" font-size="32">${esc(bajada)}</text>
    ${pie(M)}
  </svg>`;
}
