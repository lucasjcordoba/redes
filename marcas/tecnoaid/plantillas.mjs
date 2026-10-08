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
const B = 52; // de la tarjeta al borde de la placa
const M = 132; // margen del contenido: 80 adentro de la tarjeta

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
    <rect x="${B}" y="${B}" width="${W - 2 * B}" height="${H - 2 * B}" rx="36" fill="${C.cremaClara}" stroke="${C.tinta}" stroke-width="6"/>

    ${isotipo(M, 112, 84)}
    <text x="${M + 104}" y="174" font-family="${MONO}" font-size="40" font-weight="700" fill="${C.tinta}"
      letter-spacing="-1">Tecno<tspan fill="${C.rojo}">aid</tspan></text>
    ${etiqueta ? `<text x="${W - M}" y="170" text-anchor="end" font-family="${MONO}" font-size="24"
      font-weight="700" letter-spacing="3" fill="${C.rojo}">${esc(etiqueta.toUpperCase())}</text>` : ""}

    ${contenido}

    <path d="M${B} 1110 H${W - B} V${H - B - 36} a36 36 0 0 1 -36 36 H${B + 36} a36 36 0 0 1 -36 -36 Z" fill="${C.tinta}"/>
    <text x="${M}" y="1186" font-family="${MONO}" font-size="24" letter-spacing="3" fill="${C.crema}"
      opacity="0.7">ESCRIBINOS POR WHATSAPP</text>
    <text x="${M}" y="1238" font-family="${MONO}" font-size="44" font-weight="700" fill="${C.cremaClara}">${esc(marca.whatsapp)}</text>
    <text x="${W - M}" y="1186" text-anchor="end" font-family="${TEXTO}" font-size="26" fill="${C.crema}" opacity="0.7">Zona Norte · a domicilio</text>
    <text x="${W - M}" y="1232" text-anchor="end" font-family="${TEXTO}" font-size="26" fill="${C.crema}" opacity="0.7">Remoto a todo el país</text>
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

  // Centrado óptico del bloque entre el encabezado (y≈216) y la franja (y=1110).
  const alto = (titulo.length - 1) * leading + (lineasBajada.length ? 90 + (lineasBajada.length - 1) * 54 : 0);
  const y0 = (256 + 1060) / 2 - alto / 2 + size / 3;

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
    .map((l, i) => `<text x="${M}" y="${316 + i * 80}" font-family="${TITULO}" font-size="${tSize}"
      font-weight="800" letter-spacing="-2" fill="${C.tinta}">${esc(l)}</text>`)
    .join("");

  // Cada ítem ocupa lo que ocupan sus líneas; el aire que sobra se reparte
  // parejo entre ítems, así uno de dos líneas no queda pegado al siguiente.
  const interlinea = 46;
  const bloques = items.map((texto) => ajustar(texto, W - 2 * M - 110, 36, 0.48));
  const inicio = 316 + (titulo.length - 1) * 80 + 110;
  const altoTexto = bloques.reduce((s, l) => s + Math.max(68, l.length * interlinea), 0);
  const aire = Math.min(80, (1060 - inicio - altoTexto) / Math.max(1, items.length - 1));
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

/**
 * Dibujos para la plantilla `ilustracion`, en el estilo del isotipo: trazo
 * de tinta, relleno crema y un acento en rojo. Cada uno ocupa una caja de
 * 600x340 que la plantilla centra arriba del título.
 */
const T = `stroke="${C.tinta}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"`;
const DIBUJOS = {
  // Un joystick con el stick izquierdo "caminando solo".
  joystick: `
    <path d="M150 120 Q300 92 450 120 Q540 136 566 250 Q584 330 520 338 Q478 342 440 286 L410 248 H190 L160 286 Q122 342 80 338 Q16 330 34 250 Q60 136 150 120 Z" fill="${C.crema}" ${T}/>
    <circle cx="200" cy="200" r="44" fill="${C.cremaClara}" ${T}/>
    <circle cx="214" cy="190" r="20" fill="${C.rojo}" ${T}/>
    <path d="M262 150 a70 70 0 0 1 18 64" fill="none" stroke="${C.rojo}" stroke-width="7" stroke-linecap="round"/>
    <path d="M286 126 a100 100 0 0 1 24 96" fill="none" stroke="${C.rojo}" stroke-width="7" stroke-linecap="round" opacity="0.55"/>
    <circle cx="380" cy="226" r="34" fill="${C.cremaClara}" ${T}/>
    <circle cx="380" cy="226" r="12" fill="${C.tinta}"/>
    <g fill="${C.tinta}"><circle cx="470" cy="168" r="13"/><circle cx="500" cy="196" r="13"/><circle cx="440" cy="196" r="13"/><circle cx="470" cy="224" r="13"/></g>
    <path d="M110 214 h50 M135 189 v50" stroke="${C.tinta}" stroke-width="14" stroke-linecap="round"/>`,

  // Notebook abierta con la pantalla rajada y rayas.
  pantalla: `
    <rect x="130" y="20" width="340" height="230" rx="14" fill="${C.tinta}"/>
    <rect x="150" y="40" width="300" height="190" rx="4" fill="${C.cremaClara}"/>
    <g stroke="${C.rojo}" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M330 40 L300 100 L332 128 L290 190 L304 230"/>
      <path d="M300 100 L250 112 M332 128 L392 118 M290 190 L230 214"/>
    </g>
    <g stroke="${C.tinta}" stroke-width="4" opacity="0.35"><path d="M178 40 v190 M196 40 v190 M412 40 v190"/></g>
    <path d="M100 262 H500 L540 312 a10 10 0 0 1 -8 16 H68 a10 10 0 0 1 -8 -16 Z" fill="${C.crema}" ${T}/>
    <rect x="262" y="270" width="76" height="12" rx="6" fill="${C.tinta}"/>`,

  // Dos equipos conectados a distancia.
  remoto: `
    <rect x="20" y="70" width="220" height="150" rx="12" fill="${C.cremaClara}" ${T}/>
    <path d="M0 238 H260 L244 262 H16 Z" fill="${C.tinta}"/>
    <path d="M100 120 l40 30 -18 4 10 22 -10 4 -10 -22 -12 12 Z" fill="${C.tinta}"/>
    <rect x="360" y="70" width="220" height="150" rx="12" fill="${C.cremaClara}" ${T}/>
    <path d="M340 238 H600 L584 262 H356 Z" fill="${C.tinta}"/>
    <g transform="translate(430 96) scale(0.68)">
      <rect x="30" y="22" width="60" height="52" rx="9" fill="${C.rojo}" stroke="${C.tinta}" stroke-width="8"/>
      <circle cx="60" cy="48" r="18" fill="${C.crema}"/>
      <path d="M54 36h12v6h6v12h-6v6H54V54h-6V42h6z" fill="${C.tinta}"/>
    </g>
    <path d="M150 50 Q300 -40 450 50" fill="none" stroke="${C.rojo}" stroke-width="7" stroke-linecap="round" stroke-dasharray="4 20"/>
    <g fill="none" stroke="${C.tinta}" stroke-width="7" stroke-linecap="round">
      <path d="M272 300 a40 40 0 0 1 56 0"/><path d="M252 280 a68 68 0 0 1 96 0"/>
    </g>
    <circle cx="300" cy="322" r="9" fill="${C.tinta}"/>`,

  // Teclado de notebook con una tecla rota.
  teclado: `
    <rect x="20" y="40" width="560" height="270" rx="24" fill="${C.crema}" ${T}/>
    ${[0, 1, 2].map((f) => Array.from({ length: 8 }, (_, c) => {
      const x = 56 + c * 60 + f * 10;
      const y = 72 + f * 58;
      const rota = f === 1 && c === 3;
      return `<rect x="${x}" y="${y}" width="48" height="44" rx="8" fill="${rota ? C.rojo : C.cremaClara}"
        stroke="${C.tinta}" stroke-width="5"${rota ? ` transform="rotate(16 ${x + 24} ${y + 22})"` : ""}/>`;
    }).join("")).join("")}
    <rect x="170" y="246" width="260" height="44" rx="8" fill="${C.cremaClara}" stroke="${C.tinta}" stroke-width="5"/>
    <g stroke="${C.rojo}" stroke-width="6" stroke-linecap="round"><path d="M304 134 l20 -12 M308 158 h24 M302 182 l20 12"/></g>`,

  // Varios puestos con computadora: un aula o un local.
  institucion: `
    ${[0, 1, 2].map((i) => {
      const x = 20 + i * 196;
      const alerta = i === 2;
      return `
      <rect x="${x}" y="60" width="168" height="120" rx="10" fill="${C.cremaClara}" ${T}/>
      <rect x="${x + 70}" y="180" width="28" height="40" fill="${C.tinta}"/>
      <rect x="${x + 40}" y="216" width="88" height="14" rx="7" fill="${C.tinta}"/>
      ${alerta
        ? `<circle cx="${x + 84}" cy="120" r="30" fill="${C.rojo}"/><path d="M${x + 84} 102 v22" stroke="${C.cremaClara}" stroke-width="8" stroke-linecap="round"/><circle cx="${x + 84}" cy="138" r="5" fill="${C.cremaClara}"/>`
        : `<path d="M${x + 60} 120 l16 16 32 -34" fill="none" stroke="${C.tinta}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`}`;
    }).join("")}
    <rect x="0" y="250" width="600" height="18" rx="9" fill="${C.tinta}"/>
    <path d="M40 268 v70 M560 268 v70" stroke="${C.tinta}" stroke-width="10" stroke-linecap="round"/>`,
};

/**
 * Un dibujo arriba y el título abajo: para que el feed no sea todo texto.
 *   visual: { etiqueta, dibujo, titulo: [líneas], destacar, bajada }
 * dibujo: joystick | pantalla | remoto | teclado | institucion.
 * Título de hasta 3 líneas de ~15 caracteres; bajada hasta ~110.
 */
export function ilustracion({ etiqueta, dibujo, titulo, destacar, bajada }) {
  if (!DIBUJOS[dibujo]) throw new Error(`Dibujo desconocido: "${dibujo}"`);
  const size = 92;
  const leading = 100;
  const lineasBajada = bajada ? ajustar(bajada, W - 2 * M, 38, 0.48) : [];

  // El título queda pegado abajo, contra la franja; el dibujo ocupa el aire de arriba.
  const yBajadaFin = 1040;
  const yBajada = yBajadaFin - (lineasBajada.length - 1) * 52;
  const yUltima = lineasBajada.length ? yBajada - 84 : yBajadaFin;
  const y0 = yUltima - (titulo.length - 1) * leading;

  const alto = 340;
  const yDibujo = Math.max(232, (232 + y0 - size) / 2 - alto / 2);
  const lineas = titulo
    .map((l, i) => `<text x="${M}" y="${y0 + i * leading}" font-family="${TITULO}" font-size="${size}"
      font-weight="800" letter-spacing="-3" fill="${i === destacar ? C.rojo : C.tinta}">${esc(l)}</text>`)
    .join("");
  const bajadaSvg = lineasBajada
    .map((l, i) => `<text x="${M}" y="${yBajada + i * 52}" font-family="${TEXTO}" font-size="38"
      fill="${C.tintaSuave}">${esc(l)}</text>`)
    .join("");

  return marco(etiqueta, `
    <g transform="translate(${(W - 600) / 2} ${yDibujo})">${DIBUJOS[dibujo]}</g>
    ${lineas}${bajadaSvg}`);
}

/**
 * Qué sí y qué no: cuidados y emergencias.
 *   visual: { etiqueta, titulo: [1 o 2 líneas], si: [texto], no: [texto] }
 * 2 o 3 ítems por lado, cada uno hasta ~60 caracteres.
 */
export function sino({ etiqueta, titulo, si, no }) {
  const titulos = titulo
    .map((l, i) => `<text x="${M}" y="${316 + i * 80}" font-family="${TITULO}" font-size="72"
      font-weight="800" letter-spacing="-2" fill="${C.tinta}">${esc(l)}</text>`)
    .join("");

  let y = 316 + (titulo.length - 1) * 80 + 100;
  const bloque = (rotulo, items, color, icono) => {
    let svg = `
      <circle cx="${M + 28}" cy="${y + 18}" r="28" fill="${color}"/>
      ${icono(M + 28, y + 18)}
      <text x="${M + 76}" y="${y + 30}" font-family="${MONO}" font-size="30" font-weight="700"
        letter-spacing="3" fill="${color}">${rotulo}</text>`;
    y += 80;
    for (const texto of items) {
      const lineas = ajustar(texto, W - 2 * M - 76, 34, 0.48);
      svg += `<rect x="${M + 22}" y="${y - 22}" width="12" height="12" rx="2" fill="${color}"/>`;
      svg += lineas
        .map((l, j) => `<text x="${M + 76}" y="${y + j * 44}" font-family="${TEXTO}" font-size="34"
          fill="${C.tinta}">${esc(l)}</text>`)
        .join("");
      y += lineas.length * 44 + 22;
    }
    y += 36;
    return svg;
  };
  const tilde = (cx, cy) => `<path d="M${cx - 12} ${cy} l8 9 16 -18" fill="none" stroke="${C.cremaClara}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  const cruz = (cx, cy) => `<path d="M${cx - 10} ${cy - 10} l20 20 M${cx + 10} ${cy - 10} l-20 20" stroke="${C.cremaClara}" stroke-width="6" stroke-linecap="round"/>`;

  const bloqueSi = bloque("SÍ", si, C.tinta, tilde);
  const bloqueNo = bloque("NO", no, C.rojo, cruz);
  return marco(etiqueta, titulos + bloqueSi + bloqueNo);
}

/**
 * Dos columnas para comparar: cuándo una cosa y cuándo la otra.
 *   visual: { etiqueta, titulo: [1 o 2 líneas], izquierda: { titulo, items }, derecha: { titulo, items }, bajada }
 * Título de columna hasta ~16 caracteres; 3 ítems de hasta ~45.
 */
export function comparacion({ etiqueta, titulo, izquierda, derecha, bajada }) {
  const titulos = titulo
    .map((l, i) => `<text x="${M}" y="${316 + i * 80}" font-family="${TITULO}" font-size="72"
      font-weight="800" letter-spacing="-2" fill="${C.tinta}">${esc(l)}</text>`)
    .join("");

  const gap = 28;
  const ancho = (W - 2 * M - gap) / 2;
  const y0 = 316 + (titulo.length - 1) * 80 + 76;
  const yFin = bajada ? 960 : 1050;

  const columna = (x, { titulo: t, items }, oscura) => {
    const fondo = oscura ? C.tinta : C.crema;
    const texto = oscura ? C.cremaClara : C.tinta;
    let y = y0 + 84;
    const filas = items
      .map((it) => {
        const lineas = ajustar(it, ancho - 64, 30, 0.5);
        const svg = `<rect x="${x + 32}" y="${y - 20}" width="10" height="10" rx="2" fill="${C.rojo}"/>` +
          lineas
            .map((l, j) => `<text x="${x + 56}" y="${y + j * 40}" font-family="${TEXTO}" font-size="30"
              fill="${texto}">${esc(l)}</text>`)
            .join("");
        y += lineas.length * 40 + 30;
        return svg;
      })
      .join("");
    return `
      <rect x="${x}" y="${y0}" width="${ancho}" height="${yFin - y0}" rx="24" fill="${fondo}" stroke="${C.tinta}" stroke-width="5"/>
      <text x="${x + 32}" y="${y0 + 56}" font-family="${MONO}" font-size="24" font-weight="700"
        letter-spacing="2" fill="${oscura ? C.crema : C.rojo}">${esc(t.toUpperCase())}</text>
      ${filas}`;
  };

  const lineasBajada = bajada ? ajustar(bajada, W - 2 * M, 34, 0.48) : [];
  const bajadaSvg = lineasBajada
    .map((l, i) => `<text x="${M}" y="${1014 + i * 46}" font-family="${TEXTO}" font-size="34"
      fill="${C.tintaSuave}">${esc(l)}</text>`)
    .join("");

  return marco(etiqueta, titulos + columna(M, izquierda, false) + columna(M + ancho + gap, derecha, true) + bajadaSvg);
}
