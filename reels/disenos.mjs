/**
 * Las plantillas de los reels. Son parte de una misma presentación de
 * trabajos, así que cada proyecto tiene su propio diseño, con la paleta de su
 * sitio y otra disposición, aunque todos cuentan lo mismo: escritorio, celular,
 * título de la sección y subtítulos (`diseno` en el guion).
 *
 *   raudal      Oscuro con grilla, cian y violeta. Ventana arriba, celular
 *               abajo a la izquierda, subtítulos a su derecha.
 *   mundomejor  Editorial claro: papel, tinta y el amarillo de la productora.
 *               Ventana clara, celular a la derecha, subtítulos a la izquierda
 *               resaltados con marcador.
 *   tecnoaid    Taller: fondo cálido oscuro con pistas de circuito y el rojo
 *               de la marca. Ventana chica a la izquierda, celular grande a la
 *               derecha, número de sección y subtítulos en una tarjeta ancha.
 *   gesta       Escenario: negro, haces de luz y ámbar. El escritorio ocupa
 *               todo el ancho como una pantalla de show, títulos en mayúscula
 *               de cartel y la sección como un tema del setlist.
 *
 * Cada diseño define:
 *   esc       pantalla de escritorio { x, y, w, h, radio, soloAbajo }
 *   cel       pantalla del celular { x, y, w, h } y su carcasa { borde, radio }
 *   fondo()   todo lo que va detrás de las pantallas (incluida la ventana)
 *   celular() lo que va entre el escritorio y la pantalla del celular
 *   textos()  título de la sección y subtítulo
 *
 * Zonas que tapa Instagram: y 0–220 y y 1600–1920. No se pone nada que haga
 * falta leer ahí.
 */
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { RAIZ } from "../lib/rutas.mjs";
import { esc, ajustar } from "../lib/render.mjs";

export const W = 1080, H = 1920;
const fuentes = ["Geist-400", "Geist-700", "JetBrainsMono-400", "JetBrainsMono-700", "Archivo-400", "Archivo-800", "Inter-400", "Inter-600"]
  .map((f) => join(RAIZ, "fuentes", `${f}.ttf`));
export const svgPng = (svg) => new Resvg(svg, { font: { fontFiles: fuentes, loadSystemFonts: false, defaultFontFamily: "Geist" } }).render().asPng();

/** Ancho real de un texto con esos atributos (para resaltados y subrayados). */
const anchos = new Map();
export function ancho(texto, attrs) {
  const clave = `${attrs}|${texto}`;
  if (!anchos.has(clave)) {
    const r = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="300"><text x="0" y="200" ${attrs}>${esc(texto)}</text></svg>`,
      { font: { fontFiles: fuentes, loadSystemFonts: false } });
    anchos.set(clave, r.innerBBox()?.width ?? texto.length * 30);
  }
  return anchos.get(clave);
}

const svg = (contenido) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${contenido}</svg>`;
const dos = (n) => String(n).padStart(2, "0");

/** Pantalla de celular de ancho `w` (proporción 390x844). */
const pantallaCel = (x, y, w, borde, radio) => ({ x: x + borde, y: y + borde, w, h: Math.round((w * 844) / 390), borde, radio, marco: { x, y, w: w + borde * 2, h: Math.round((w * 844) / 390) + borde * 2 } });
/** Pantalla de escritorio de ancho `w` (proporción 1280x800). */
const pantallaEsc = (x, y, w, radio = 0, soloAbajo = false) => ({ x, y, w, h: Math.round((w * 800) / 1280), radio, soloAbajo });

function carcasa(c, { color, borde, sombra, opSombra }) {
  const m = c.marco;
  return `<defs><filter id="sc" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter></defs>
    <rect x="${m.x}" y="${m.y + 20}" width="${m.w}" height="${m.h}" rx="${c.radio}" fill="${sombra}" opacity="${opSombra}" filter="url(#sc)"/>
    <rect x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="${c.radio}" fill="${color}" stroke="${borde}" stroke-width="3"/>
    <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.radio - c.borde}" fill="#000"/>`;
}

// ---------- Raudal Dev ----------

const raudal = (() => {
  const C = { fondo: "#060a12", texto: "#f1f3f8", tenue: "#8b96ad", cian: "#24dfe1", violeta: "#9079fe", linea: "#2a3446", ventana: "#111826" };
  const barra = 46;
  const escP = pantallaEsc(40, 400 + barra, 1000, 20, true);
  const cel = pantallaCel(40, 850, 316, 13, 50);
  const SUB = { x: cel.marco.x + cel.marco.w + 44, y: escP.y + escP.h + 50, h: 400 };
  SUB.w = 1040 - SUB.x;
  let grilla = "";
  for (let x = 90; x < W; x += 90) grilla += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.linea}" opacity=".4"/>`;
  for (let y = 90; y < H; y += 90) grilla += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.linea}" opacity=".4"/>`;
  return {
    esc: escP, cel,
    fondo: (guion) => svg(`<defs>
        <radialGradient id="g1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.cian}" stop-opacity=".26"/><stop offset="1" stop-color="${C.cian}" stop-opacity="0"/></radialGradient>
        <radialGradient id="g2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.violeta}" stop-opacity=".22"/><stop offset="1" stop-color="${C.violeta}" stop-opacity="0"/></radialGradient>
        <radialGradient id="fg" cx=".5" cy=".4" r=".62"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <mask id="m"><rect width="${W}" height="${H}" fill="url(#fg)"/></mask>
        <filter id="sombra" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter></defs>
      <rect width="${W}" height="${H}" fill="${C.fondo}"/>
      <g mask="url(#m)">${grilla}</g>
      <ellipse cx="900" cy="330" rx="560" ry="420" fill="url(#g1)"/>
      <ellipse cx="160" cy="1560" rx="520" ry="420" fill="url(#g2)"/>
      <rect x="40" y="418" width="1000" height="${barra + escP.h}" rx="22" fill="#000" opacity=".55" filter="url(#sombra)"/>
      <rect x="40" y="400" width="1000" height="${barra + escP.h}" rx="20" fill="${C.ventana}" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/>
      <circle cx="66" cy="423" r="7" fill="#ff5f57"/><circle cx="88" cy="423" r="7" fill="#febc2e"/><circle cx="110" cy="423" r="7" fill="#28c840"/>
      <rect x="340" y="410" width="400" height="26" rx="13" fill="#ffffff" fill-opacity=".07"/>
      <text x="540" y="429" text-anchor="middle" font-family="JetBrains Mono" font-size="16" fill="${C.tenue}">${esc(guion.dominio)}</text>`),
    celular: () => svg(carcasa(cel, { color: "#0b0f16", borde: "#3a4456", sombra: "#000", opSombra: 0.7 })),
    textos({ etiqueta, titulo, opTitulo, subtitulo, opSub }) {
      const lineas = subtitulo ? ajustar(subtitulo, SUB.w, 46, 0.5) : [];
      const alto = lineas.length * 58;
      const y0 = SUB.y + (SUB.h - alto) / 2 + 42;
      return svg(`<g opacity="${opTitulo}">
          <text x="44" y="276" font-family="JetBrains Mono" font-size="26" letter-spacing="5" fill="${C.cian}">${esc(etiqueta)}</text>
          <text x="44" y="352" font-family="Geist" font-weight="700" font-size="62" letter-spacing="-2" fill="${C.texto}">${esc(titulo)}</text></g>
        ${lineas.length ? `<g opacity="${opSub}">
          <rect x="${SUB.x - 22}" y="${y0 - 44}" width="5" height="${alto}" rx="2.5" fill="${C.cian}"/>
          ${lineas.map((l, i) => `<text x="${SUB.x}" y="${y0 + i * 58}" font-family="Geist" font-weight="700" font-size="46" letter-spacing="-.5" fill="${C.texto}">${esc(l)}</text>`).join("")}</g>` : ""}`);
    },
  };
})();

// ---------- Mundo Mejor ----------

const mundomejor = (() => {
  const C = { papel: "#f8f4ea", tinta: "#211d18", tenue: "#7a7166", amarillo: "#f2c118", marco: "#ffffff", linea: "#e6dfd0" };
  const barra = 40;
  const escP = pantallaEsc(40, 410 + barra, 1000, 16, true);
  const cel = pantallaCel(1040 - 342, 860, 316, 13, 50);
  const SUB = { x: 64, y: escP.y + escP.h + 40, w: cel.marco.x - 64 - 50, h: 420 };
  const fTitulo = `font-family="Archivo" font-weight="800" font-size="64" letter-spacing="-1.5"`;
  const fSub = `font-family="Archivo" font-weight="800" font-size="46" letter-spacing="-.5"`;
  // Montañas del logo, como un trazo suave abajo.
  const montes = "M0 1600 L150 1470 L230 1540 L380 1400 L520 1560 L600 1500 L700 1600";
  return {
    esc: escP, cel,
    fondo: (guion) => svg(`<defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter></defs>
      <rect width="${W}" height="${H}" fill="${C.papel}"/>
      <circle cx="1010" cy="190" r="250" fill="${C.amarillo}" opacity=".9"/>
      <path d="${montes}" fill="none" stroke="${C.tinta}" stroke-opacity=".08" stroke-width="5" stroke-linejoin="round"/>
      <rect x="40" y="430" width="1000" height="${barra + escP.h}" rx="18" fill="#5a4a2a" opacity=".16" filter="url(#s)"/>
      <rect x="40" y="410" width="1000" height="${barra + escP.h}" rx="18" fill="${C.marco}" stroke="${C.linea}" stroke-width="2"/>
      ${[0, 1, 2].map((i) => `<circle cx="${68 + i * 20}" cy="430" r="6" fill="none" stroke="#cfc6b4" stroke-width="2"/>`).join("")}
      <text x="540" y="436" text-anchor="middle" font-family="Archivo" font-size="17" letter-spacing="2" fill="${C.tenue}">${esc(guion.dominio)}</text>`),
    celular: () => svg(carcasa(cel, { color: C.marco, borde: C.linea, sombra: "#5a4a2a", opSombra: 0.25 })),
    textos({ etiqueta, titulo, opTitulo, subtitulo, opSub }) {
      const lineas = subtitulo ? ajustar(subtitulo, SUB.w, 46, 0.56) : [];
      const alto = lineas.length * 66;
      const y0 = SUB.y + (SUB.h - alto) / 2 + 44;
      const aTitulo = ancho(titulo, fTitulo);
      return svg(`<g opacity="${opTitulo}">
          <rect x="48" y="258" width="40" height="4" fill="${C.amarillo}"/>
          <text x="104" y="268" font-family="Archivo" font-size="24" letter-spacing="6" fill="${C.tenue}">${esc(etiqueta.replace(/^\/\s*/, ""))}</text>
          <rect x="44" y="350" width="${aTitulo + 8}" height="16" fill="${C.amarillo}"/>
          <text x="48" y="356" ${fTitulo} fill="${C.tinta}">${esc(titulo)}</text></g>
        ${lineas.length ? `<g opacity="${opSub}">
          ${lineas.map((l, i) => `<rect x="${SUB.x - 6}" y="${y0 + i * 66 - 16}" width="${ancho(l, fSub) + 14}" height="22" fill="${C.amarillo}" opacity=".75"/>
            <text x="${SUB.x}" y="${y0 + i * 66}" ${fSub} fill="${C.tinta}">${esc(l)}</text>`).join("")}</g>` : ""}`);
    },
  };
})();

// ---------- TecnoAid ----------

const tecnoaid = (() => {
  const C = { fondo: "#17130f", crema: "#f4ecd8", tenue: "#a89f8e", rojo: "#e4241f", linea: "#3a2f27", tarjeta: "#211b16" };
  const barra = 36;
  const escP = pantallaEsc(40, 410 + barra, 630, 14, true);
  const cel = pantallaCel(1050 - 352, 410, 326, 13, 50);
  const TARJ = { x: 40, y: 1180, w: 1000, h: 370 };
  const fSub = `font-family="Inter" font-weight="600" font-size="52" letter-spacing="-1"`;
  // Pistas de circuito: tramos rectos y a 45°, con un nodo en cada extremo.
  const pistas = [
    [[0, 300], [120, 300], [180, 360], [180, 520]], [[1080, 980], [960, 980], [900, 1040], [900, 1180]],
    [[0, 1100], [60, 1100], [120, 1160]], [[300, 1600], [300, 1700], [360, 1760], [700, 1760]],
    [[1080, 260], [860, 260], [800, 200], [800, 0]], [[0, 1640], [140, 1640], [200, 1580]],
  ];
  const trazo = (p, color, op) => `<polyline points="${p.map((q) => q.join(",")).join(" ")}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="2"/>
    <circle cx="${p.at(-1)[0]}" cy="${p.at(-1)[1]}" r="5" fill="${C.fondo}" stroke="${color}" stroke-opacity="${op}" stroke-width="2"/>`;
  return {
    esc: escP, cel,
    fondo: (guion) => svg(`<defs>
        <radialGradient id="r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.rojo}" stop-opacity=".22"/><stop offset="1" stop-color="${C.rojo}" stop-opacity="0"/></radialGradient>
        <filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter></defs>
      <rect width="${W}" height="${H}" fill="${C.fondo}"/>
      <ellipse cx="980" cy="1500" rx="600" ry="500" fill="url(#r)"/>
      <ellipse cx="80" cy="280" rx="420" ry="320" fill="url(#r)" opacity=".6"/>
      ${pistas.map((p, i) => trazo(p, i % 3 === 1 ? C.rojo : "#6b5a4b", i % 3 === 1 ? 0.55 : 0.5)).join("")}
      <rect x="40" y="428" width="630" height="${barra + escP.h}" rx="16" fill="#000" opacity=".6" filter="url(#s)"/>
      <rect x="40" y="410" width="630" height="${barra + escP.h}" rx="14" fill="#221c17" stroke="${C.linea}" stroke-width="2"/>
      <circle cx="62" cy="428" r="6" fill="${C.rojo}"/>
      <text x="82" y="434" font-family="Inter" font-size="16" fill="${C.tenue}">${esc(guion.dominio)}</text>
      <rect x="${TARJ.x}" y="${TARJ.y}" width="${TARJ.w}" height="${TARJ.h}" rx="28" fill="${C.tarjeta}" stroke="${C.linea}" stroke-width="2"/>
      <rect x="${TARJ.x}" y="${TARJ.y + 40}" width="6" height="${TARJ.h - 80}" rx="3" fill="${C.rojo}"/>`),
    celular: () => svg(carcasa(cel, { color: "#0e0b09", borde: "#4a3d33", sombra: "#000", opSombra: 0.75 })),
    textos({ etiqueta, titulo, opTitulo, subtitulo, opSub, k, n }) {
      const lineas = subtitulo ? ajustar(subtitulo, TARJ.w - 120, 52, 0.55) : [];
      const alto = lineas.length * 66;
      const y0 = TARJ.y + (TARJ.h - alto) / 2 + 46;
      const pill = etiqueta.replace(/^\/\s*/, "");
      const aPill = ancho(pill, `font-family="Inter" font-weight="600" font-size="20" letter-spacing="3"`);
      return svg(`<g opacity="${opTitulo}">
          <rect x="40" y="234" width="${aPill + 72}" height="44" rx="22" fill="none" stroke="${C.linea}" stroke-width="2"/>
          <circle cx="66" cy="256" r="6" fill="${C.rojo}"/>
          <text x="84" y="263" font-family="Inter" font-weight="600" font-size="20" letter-spacing="3" fill="${C.tenue}">${esc(pill)}</text>
          <text x="40" y="362" font-family="Inter" font-weight="600" font-size="66" letter-spacing="-2.5" fill="${C.crema}">${esc(titulo)}</text>
          <text x="40" y="1060" font-family="Inter" font-weight="600" font-size="170" letter-spacing="-8" fill="none" stroke="${C.rojo}" stroke-width="3">${dos(k + 1)}</text>
          <text x="${40 + ancho(dos(k + 1), `font-family="Inter" font-weight="600" font-size="170" letter-spacing="-8"`) + 22}" y="1060" font-family="Inter" font-weight="600" font-size="40" fill="${C.tenue}">/ ${dos(n)}</text></g>
        ${lineas.length ? `<g opacity="${opSub}">
          ${lineas.map((l, i) => `<text x="${TARJ.x + 60}" y="${y0 + i * 66}" ${fSub} fill="${C.crema}">${esc(l)}</text>`).join("")}</g>` : ""}`);
    },
  };
})();

// ---------- Gesta Manager ----------

const gesta = (() => {
  const C = { fondo: "#060607", ambar: "#f4a521", blanco: "#f5f2ea", tenue: "#8a8478" };
  const escP = pantallaEsc(0, 400, W);
  const cel = pantallaCel(1046 - 342, 870, 316, 13, 50);
  const SUB = { x: 48, y: escP.y + escP.h + 40, w: cel.marco.x - 48 - 40, h: 480 };
  const fTitulo = `font-family="Archivo" font-weight="800" font-size="68" letter-spacing="-1"`;
  const fSub = `font-family="Archivo" font-weight="800" font-size="46" letter-spacing="0"`;
  // Haces de luz desde arriba, como los de un escenario.
  const haz = (x, a, b, op) => `<polygon points="${x - 18},0 ${x + 18},0 ${b},${H} ${a},${H}" fill="url(#h)" opacity="${op}"/>`;
  return {
    esc: escP, cel,
    fondo: () => svg(`<defs>
        <linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.ambar}" stop-opacity=".32"/><stop offset=".75" stop-color="${C.ambar}" stop-opacity="0"/></linearGradient>
        <radialGradient id="p" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.ambar}" stop-opacity=".2"/><stop offset="1" stop-color="${C.ambar}" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="${C.fondo}"/>
      ${haz(180, -200, 700, 0.9)}${haz(900, 300, 1400, 0.8)}${haz(540, 100, 980, 0.5)}
      <ellipse cx="540" cy="1640" rx="700" ry="200" fill="url(#p)"/>`),
    celular: () => svg(`<rect x="0" y="${escP.y - 4}" width="${W}" height="4" fill="${C.ambar}"/>
      <rect x="0" y="${escP.y + escP.h}" width="${W}" height="4" fill="${C.ambar}"/>
      ${carcasa(cel, { color: "#0a0a0b", borde: "#2e2a24", sombra: "#000", opSombra: 0.85 })}`),
    textos({ titulo, opTitulo, subtitulo, opSub, k, n }) {
      const lineas = subtitulo ? ajustar(subtitulo.toUpperCase(), SUB.w, 46, 0.66) : [];
      const alto = lineas.length * 56;
      const y0 = SUB.y + (SUB.h - alto) / 2 + 40;
      return svg(`<g opacity="${opTitulo}">
          <text x="44" y="268" font-family="JetBrains Mono" font-weight="700" font-size="24" letter-spacing="5" fill="${C.ambar}">SETLIST · ${dos(k + 1)}/${dos(n)}</text>
          <text x="44" y="350" ${fTitulo} fill="${C.blanco}">${esc(titulo.toUpperCase())}</text></g>
        ${lineas.length ? `<g opacity="${opSub}">
          <rect x="${SUB.x}" y="${y0 - 82}" width="56" height="6" fill="${C.ambar}"/>
          ${lineas.map((l, i) => `<text x="${SUB.x}" y="${y0 + i * 56}" ${fSub} fill="${C.blanco}">${esc(l)}</text>`).join("")}</g>` : ""}`);
    },
  };
})();

export const DISENOS = { raudal, mundomejor, tecnoaid, gesta };
