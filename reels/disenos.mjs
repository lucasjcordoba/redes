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
 *   gesta       Escenario: negro, brillos suaves y ámbar. El escritorio ocupa
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
  return {
    esc: escP, cel,
    fondo: () => svg(`<defs>
        <radialGradient id="p" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.ambar}" stop-opacity=".2"/><stop offset="1" stop-color="${C.ambar}" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="${C.fondo}"/>
      <ellipse cx="900" cy="260" rx="520" ry="360" fill="url(#p)" opacity=".8"/>
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

// ---------- Gesta Manager · sitio ----------

const gestaSitio = (() => {
  const C = { fondo: "#070b14", ambar: "#f5b301", blanco: "#f4f1ea", tenue: "#8d97ab", ventana: "#0e1626" };
  const barra = 40;
  const escP = pantallaEsc(40, 580 + barra, 1000, 18, true);
  const cel = pantallaCel((W - 276) / 2, 1030, 250, 13, 44);
  const fTitulo = `font-family="Geist" font-weight="700" font-size="64" letter-spacing="-2"`;
  const fSub = `font-family="Geist" font-weight="700" font-size="44" letter-spacing="-.5"`;
  let puntos = "";
  for (let y = 60; y < H; y += 48) for (let x = 24; x < W; x += 48) puntos += `<circle cx="${x}" cy="${y}" r="1.6" fill="#ffffff" opacity=".07"/>`;
  return {
    esc: escP, cel,
    fondo: (guion) => svg(`<defs>
        <linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.ambar}" stop-opacity=".22"/><stop offset="1" stop-color="${C.ambar}" stop-opacity=".02"/></linearGradient>
        <radialGradient id="r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.ambar}" stop-opacity=".25"/><stop offset="1" stop-color="${C.ambar}" stop-opacity="0"/></radialGradient>
        <filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="24"/></filter></defs>
      <rect width="${W}" height="${H}" fill="${C.fondo}"/>
      ${puntos}
      <polygon points="0,1180 ${W},760 ${W},1060 0,1480" fill="url(#b)"/>
      <ellipse cx="540" cy="900" rx="620" ry="360" fill="url(#r)"/>
      <rect x="40" y="598" width="1000" height="${barra + escP.h}" rx="18" fill="#000" opacity=".6" filter="url(#s)"/>
      <rect x="40" y="580" width="1000" height="${barra + escP.h}" rx="18" fill="${C.ventana}" stroke="${C.ambar}" stroke-opacity=".55" stroke-width="2"/>
      <rect x="380" y="590" width="320" height="22" rx="11" fill="#ffffff" fill-opacity=".06"/>
      <text x="540" y="606" text-anchor="middle" font-family="JetBrains Mono" font-size="14" fill="${C.tenue}">${esc(guion.dominio)}</text>`),
    celular: () => svg(carcasa(cel, { color: "#05070c", borde: C.ambar, sombra: "#000", opSombra: 0.8 })),
    textos({ etiqueta, titulo, opTitulo, subtitulo, opSub }) {
      const lineas = subtitulo ? ajustar(subtitulo, 940, 44, 0.52) : [];
      const y0 = 470 - ((lineas.length - 1) * 56) / 2 + 16;
      return svg(`<g opacity="${opTitulo}">
          <text x="540" y="262" text-anchor="middle" font-family="JetBrains Mono" font-size="24" letter-spacing="6" fill="${C.ambar}">${esc(etiqueta.replace(/^\/\s*/, ""))}</text>
          <text x="540" y="340" text-anchor="middle" ${fTitulo} fill="${C.blanco}">${esc(titulo)}</text></g>
        ${lineas.length ? `<g opacity="${opSub}">
          ${lineas.map((l, i) => `<text x="540" y="${y0 + i * 56}" text-anchor="middle" ${fSub} fill="${C.blanco}">${esc(l)}</text>`).join("")}</g>` : ""}`);
    },
  };
})();

// ---------- UP gestiones ----------

const upgestiones = (() => {
  const C = { fondo: "#efefed", tinta: "#161616", naranja: "#f07f2e", gris: "#8a8f8c", verde: "#9fb3ad", blanco: "#ffffff" };
  const barra = 44;
  const escP = pantallaEsc(40, 400 + barra, 1000, 16, true);
  const cel = pantallaCel(40, 905, 300, 12, 46);
  const BANDA = { x: cel.marco.x + cel.marco.w + 34, y: 1170, h: 330 };
  BANDA.w = W - BANDA.x;
  const fSub = `font-family="Archivo" font-weight="800" font-size="44" letter-spacing="-.5"`;
  let puntos = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) puntos += `<circle cx="${880 + x * 18}" cy="${190 + y * 18}" r="3" fill="${C.tinta}" opacity=".55"/>`;
  return {
    esc: escP, cel,
    fondo: (guion) => svg(`<defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="24"/></filter></defs>
      <rect width="${W}" height="${H}" fill="${C.fondo}"/>
      <circle cx="-40" cy="30" r="190" fill="none" stroke="${C.naranja}" stroke-width="22"/>
      ${puntos}
      <circle cx="1010" cy="300" r="70" fill="${C.naranja}"/>
      <circle cx="930" cy="1600" r="120" fill="${C.verde}" opacity=".7"/>
      <rect x="40" y="420" width="1000" height="${barra + escP.h}" rx="16" fill="#3a3a3a" opacity=".22" filter="url(#s)"/>
      <rect x="40" y="400" width="1000" height="${barra + escP.h}" rx="16" fill="${C.blanco}" stroke="#d9d9d6" stroke-width="2"/>
      ${[0, 1, 2].map((i) => `<circle cx="${66 + i * 22}" cy="422" r="7" fill="#d4d4d0"/>`).join("")}
      <rect x="330" y="409" width="420" height="27" rx="13.5" fill="#f1f1ef"/>
      <text x="540" y="428" text-anchor="middle" font-family="Inter" font-size="16" fill="${C.gris}">${esc(guion.dominio)}</text>
      <rect x="${BANDA.x}" y="${BANDA.y}" width="${BANDA.w + 40}" height="${BANDA.h}" rx="34" fill="${C.naranja}"/>`),
    celular: () => svg(carcasa(cel, { color: "#111", borde: "#2a2a2a", sombra: "#3a3a3a", opSombra: 0.35 })),
    textos({ etiqueta, titulo, opTitulo, subtitulo, opSub, k, n }) {
      const lineas = subtitulo ? ajustar(subtitulo, BANDA.w - 90, 44, 0.56) : [];
      const alto = lineas.length * 58;
      const y0 = BANDA.y + (BANDA.h - alto) / 2 + 42;
      return svg(`<g opacity="${opTitulo}">
          <text x="44" y="262" font-family="Archivo" font-size="24" letter-spacing="5" fill="${C.naranja}">${esc(etiqueta.replace(/^\/\s*/, ""))}  ·  ${dos(k + 1)}/${dos(n)}</text>
          <text x="44" y="346" font-family="Archivo" font-weight="800" font-size="64" letter-spacing="-1.5" fill="${C.tinta}">${esc(titulo)}</text></g>
        ${lineas.length ? `<g opacity="${opSub}">
          ${lineas.map((l, i) => `<text x="${BANDA.x + 48}" y="${y0 + i * 58}" ${fSub} fill="${C.blanco}">${esc(l)}</text>`).join("")}</g>` : ""}`);
    },
  };
})();

// ---------- Argentecnica ----------

const argentecnica = (() => {
  const C = { fondo: "#0b2342", linea: "#7fb2e5", blanco: "#eef4fb", tenue: "#8fb0d3", naranja: "#ff9f1c", ventana: "#0f2b50" };
  const barra = 40;
  const escP = pantallaEsc(40, 430 + barra, 1000, 6, true);
  const cel = pantallaCel(1040 - 342, 890, 316, 13, 40);
  const R = { x: 40, y: 1150, w: cel.marco.x - 40 - 36, h: 410 };
  const fSub = `font-family="Archivo" font-weight="800" font-size="42" letter-spacing="-.3"`;
  let grilla = "";
  for (let x = 0; x <= W; x += 30) grilla += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.linea}" stroke-opacity="${x % 150 ? 0.07 : 0.16}"/>`;
  for (let y = 0; y <= H; y += 30) grilla += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.linea}" stroke-opacity="${y % 150 ? 0.07 : 0.16}"/>`;
  // Cota: línea con flechas y la medida al medio.
  const cota = (x1, y1, x2, y2, texto, vertical = false) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.blanco}" stroke-opacity=".7" stroke-width="1.5" marker-start="url(#f)" marker-end="url(#f)"/>
      <rect x="${vertical ? mx - 14 : mx - 34}" y="${vertical ? my - 34 : my - 12}" width="${vertical ? 28 : 68}" height="${vertical ? 68 : 24}" fill="${C.fondo}"/>
      <text x="${mx}" y="${my + 6}" text-anchor="middle" font-family="JetBrains Mono" font-size="16" fill="${C.blanco}" ${vertical ? `transform="rotate(-90 ${mx} ${my})"` : ""}>${texto}</text>`;
  };
  return {
    esc: escP, cel,
    fondo: (guion) => svg(`<defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9 Z" fill="${C.blanco}" fill-opacity=".7"/></marker></defs>
      <rect width="${W}" height="${H}" fill="${C.fondo}"/>
      ${grilla}
      ${cota(40, 405, 1040, 405, "1280")}
      ${cota(1060, 470, 1060, 470 + escP.h, "800", true)}
      <rect x="40" y="430" width="1000" height="${barra + escP.h}" rx="6" fill="${C.ventana}" stroke="${C.blanco}" stroke-opacity=".8" stroke-width="2"/>
      <text x="60" y="456" font-family="JetBrains Mono" font-size="15" fill="${C.tenue}">VISTA 1 · ESCRITORIO</text>
      <text x="1020" y="456" text-anchor="end" font-family="JetBrains Mono" font-size="15" fill="${C.tenue}">${esc(guion.dominio)}</text>
      <rect x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}" fill="${C.fondo}" stroke="${C.blanco}" stroke-opacity=".85" stroke-width="2"/>
      <line x1="${R.x}" y1="${R.y + 56}" x2="${R.x + R.w}" y2="${R.y + 56}" stroke="${C.blanco}" stroke-opacity=".6"/>
      <line x1="${R.x}" y1="${R.y + R.h - 56}" x2="${R.x + R.w}" y2="${R.y + R.h - 56}" stroke="${C.blanco}" stroke-opacity=".6"/>
      <line x1="${R.x + R.w - 200}" y1="${R.y}" x2="${R.x + R.w - 200}" y2="${R.y + 56}" stroke="${C.blanco}" stroke-opacity=".6"/>
      <line x1="${R.x + R.w - 200}" y1="${R.y + R.h - 56}" x2="${R.x + R.w - 200}" y2="${R.y + R.h}" stroke="${C.blanco}" stroke-opacity=".6"/>
      <text x="${R.x + 20}" y="${R.y + 36}" font-family="JetBrains Mono" font-size="17" letter-spacing="3" fill="${C.tenue}">DESCRIPCIÓN</text>
      <text x="${R.x + 20}" y="${R.y + R.h - 20}" font-family="JetBrains Mono" font-size="17" letter-spacing="3" fill="${C.tenue}">ARGENTECNICA · GESTIÓN DE OTs</text>
      <text x="${R.x + R.w - 180}" y="${R.y + R.h - 20}" font-family="JetBrains Mono" font-size="17" letter-spacing="3" fill="${C.tenue}">ESC 1:1</text>
      ${cota(cel.marco.x, cel.marco.y + cel.marco.h + 24, cel.marco.x + cel.marco.w, cel.marco.y + cel.marco.h + 24, "390")}`),
    celular: () => svg(carcasa(cel, { color: "#081a33", borde: C.blanco, sombra: "#000", opSombra: 0.6 })),
    textos({ titulo, opTitulo, subtitulo, opSub, k, n }) {
      const lineas = subtitulo ? ajustar(subtitulo, R.w - 50, 42, 0.56) : [];
      const alto = lineas.length * 56;
      const y0 = R.y + 56 + (R.h - 112 - alto) / 2 + 40;
      return svg(`<g opacity="${opTitulo}">
          <text x="44" y="262" font-family="JetBrains Mono" font-weight="700" font-size="24" letter-spacing="5" fill="${C.naranja}">PLANO Nº ${dos(k + 1)} · ARGENTECNICA</text>
          <text x="44" y="346" font-family="Archivo" font-weight="800" font-size="64" letter-spacing="-1.5" fill="${C.blanco}">${esc(titulo)}</text>
          <text x="${R.x + R.w - 180}" y="${R.y + 36}" font-family="JetBrains Mono" font-size="17" letter-spacing="3" fill="${C.blanco}">HOJA ${dos(k + 1)}/${dos(n)}</text></g>
        ${lineas.length ? `<g opacity="${opSub}">
          ${lineas.map((l, i) => `<text x="${R.x + 24}" y="${y0 + i * 56}" ${fSub} fill="${C.blanco}">${esc(l)}</text>`).join("")}</g>` : ""}`);
    },
  };
})();

// ---------- BsAs Tennis Tour ----------

const tennis = (() => {
  const C = { fondo: "#0c0f14", cancha: "#123a5c", linea: "#ffffff", amarillo: "#ffd11a", cian: "#29abe2", blanco: "#f4f6f8", tenue: "#8d99a8", tablero: "#06080b" };
  // El celular manda: es como lo usan jugadores y organizadores en el club.
  const cel = pantallaCel(40, 410, 400, 13, 54);
  const barra = 34;
  const x = cel.marco.x + cel.marco.w + 34;
  const escP = pantallaEsc(x, 410 + barra, 1040 - x, 12, true);
  const T = { x, y: escP.y + escP.h + 40, w: 1040 - x, h: cel.marco.y + cel.marco.h - (escP.y + escP.h + 40) };
  const fSub = `font-family="Archivo" font-weight="800" font-size="40" letter-spacing="-.3"`;
  // Cancha vista desde arriba, abajo de todo.
  const cy = cel.marco.y + cel.marco.h + 40;
  const cancha = `<g opacity=".55">
    <rect x="40" y="${cy}" width="1000" height="${H - cy + 200}" rx="6" fill="${C.cancha}"/>
    <g fill="none" stroke="${C.linea}" stroke-opacity=".55" stroke-width="4">
      <rect x="80" y="${cy + 40}" width="920" height="600"/>
      <line x1="80" y1="${cy + 110}" x2="1000" y2="${cy + 110}"/>
      <line x1="230" y1="${cy + 110}" x2="230" y2="${cy + 640}"/><line x1="850" y1="${cy + 110}" x2="850" y2="${cy + 640}"/>
      <line x1="540" y1="${cy + 110}" x2="540" y2="${cy + 640}"/>
    </g>
    <circle cx="760" cy="${cy + 70}" r="16" fill="#d8f24a"/></g>`;
  return {
    esc: escP, cel,
    fondo: (guion) => svg(`<defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
        <radialGradient id="r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.cian}" stop-opacity=".22"/><stop offset="1" stop-color="${C.cian}" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="${C.fondo}"/>
      <ellipse cx="860" cy="240" rx="520" ry="320" fill="url(#r)"/>
      ${cancha}
      <rect x="${x}" y="428" width="${escP.w}" height="${barra + escP.h}" rx="12" fill="#000" opacity=".6" filter="url(#s)"/>
      <rect x="${x}" y="410" width="${escP.w}" height="${barra + escP.h}" rx="12" fill="#151a21" stroke="${C.cian}" stroke-opacity=".6" stroke-width="2"/>
      <circle cx="${x + 20}" cy="427" r="6" fill="${C.amarillo}"/>
      <text x="${x + 36}" y="433" font-family="Inter" font-size="15" fill="${C.tenue}">${esc(guion.dominio)}</text>
      <rect x="${T.x}" y="${T.y}" width="${T.w}" height="${T.h}" rx="18" fill="${C.tablero}" stroke="${C.amarillo}" stroke-opacity=".8" stroke-width="3"/>
      <line x1="${T.x}" y1="${T.y + 64}" x2="${T.x + T.w}" y2="${T.y + 64}" stroke="${C.amarillo}" stroke-opacity=".5" stroke-width="2"/>`),
    celular: () => svg(carcasa(cel, { color: "#05070a", borde: C.amarillo, sombra: "#000", opSombra: 0.8 })),
    textos({ titulo, opTitulo, subtitulo, opSub, k, n }) {
      const lineas = subtitulo ? ajustar(subtitulo, T.w - 60, 40, 0.56) : [];
      const alto = lineas.length * 54;
      const y0 = T.y + 64 + (T.h - 64 - alto) / 2 + 38;
      return svg(`<g opacity="${opTitulo}">
          <text x="44" y="262" font-family="JetBrains Mono" font-weight="700" font-size="24" letter-spacing="5" fill="${C.amarillo}">BSAS TENNIS TOUR · SET ${dos(k + 1)}</text>
          <text x="44" y="346" font-family="Archivo" font-weight="800" font-size="64" letter-spacing="-1.5" fill="${C.blanco}">${esc(titulo)}</text>
          <text x="${T.x + 28}" y="${T.y + 42}" font-family="JetBrains Mono" font-weight="700" font-size="22" letter-spacing="3" fill="${C.amarillo}">SET ${dos(k + 1)}</text>
          <text x="${T.x + T.w - 28}" y="${T.y + 42}" text-anchor="end" font-family="JetBrains Mono" font-weight="700" font-size="22" letter-spacing="3" fill="${C.cian}">${dos(k + 1)} — ${dos(n)}</text></g>
        ${lineas.length ? `<g opacity="${opSub}">
          ${lineas.map((l, i) => `<text x="${T.x + 30}" y="${y0 + i * 54}" ${fSub} fill="${C.blanco}">${esc(l)}</text>`).join("")}</g>` : ""}`);
    },
  };
})();

export const DISENOS = { raudal, mundomejor, tecnoaid, gesta, gestaSitio, upgestiones, argentecnica, tennis };
