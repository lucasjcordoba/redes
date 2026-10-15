/**
 * Flyer del torneo DEMO de BsAs Tennis Tour (el de ejemplo, con equipos
 * ficticios), para que en el reel no aparezca la tarjeta gris sin imagen.
 * 1080x1350 (4:5, lo que pide el formulario del torneo).
 *
 *   node reels/demo/tennis-flyer.mjs   → reels/tmp/tennis-flyer-demo.png
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { RAIZ } from "../../lib/rutas.mjs";

const W = 1080, H = 1350;
const C = { fondo: "#0b0e13", cancha: "#13416a", linea: "#ffffff", amarillo: "#ffd11a", cian: "#29abe2", blanco: "#f6f7f9", pelota: "#d8f24a" };
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.fondo}" stop-opacity="1"/><stop offset=".55" stop-color="${C.fondo}" stop-opacity=".2"/><stop offset="1" stop-color="${C.fondo}" stop-opacity=".9"/></linearGradient>
    <radialGradient id="p" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#f1ff8a"/><stop offset="1" stop-color="#a9c51c"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.fondo}"/>
  <!-- Cancha en perspectiva -->
  <polygon points="250,560 830,560 1180,1350 -100,1350" fill="${C.cancha}"/>
  <g fill="none" stroke="${C.linea}" stroke-width="6" stroke-opacity=".85">
    <polygon points="290,600 790,600 1080,1350 0,1350"/>
    <line x1="340" y1="600" x2="120" y2="1350"/><line x1="740" y1="600" x2="960" y2="1350"/>
    <line x1="318" y1="700" x2="762" y2="700"/>
    <line x1="540" y1="700" x2="540" y2="1350"/>
  </g>
  <rect x="200" y="980" width="680" height="16" fill="${C.blanco}" opacity=".9"/>
  <g stroke="${C.blanco}" stroke-opacity=".5" stroke-width="2">${Array.from({ length: 22 }, (_, i) => `<line x1="${210 + i * 31}" y1="900" x2="${210 + i * 31}" y2="980"/>`).join("")}</g>
  <line x1="200" y1="900" x2="880" y2="900" stroke="${C.blanco}" stroke-width="5"/>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <!-- Pelota -->
  <circle cx="900" cy="620" r="86" fill="url(#p)"/>
  <path d="M834 563 Q900 620 834 686 M966 553 Q900 620 966 690" fill="none" stroke="#ffffff" stroke-width="7" stroke-opacity=".9"/>
  <!-- Textos -->
  <rect x="70" y="80" width="520" height="58" rx="6" fill="none" stroke="${C.amarillo}" stroke-width="4"/>
  <text x="330" y="119" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="24" letter-spacing="3" fill="${C.amarillo}">BUENOS AIRES TENNIS TOUR</text>
  <rect x="${W - 70 - 360}" y="80" width="360" height="58" rx="29" fill="${C.cian}"/>
  <text x="${W - 70 - 180}" y="118" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="22" letter-spacing="2" fill="${C.fondo}">TORNEO DE EJEMPLO</text>
  <text x="70" y="290" font-family="Archivo" font-weight="800" font-size="150" letter-spacing="-5" fill="${C.blanco}">COPA</text>
  <text x="70" y="420" font-family="Archivo" font-weight="800" font-size="118" letter-spacing="-4" fill="${C.amarillo}">POR EQUIPOS</text>
  <text x="74" y="490" font-family="Archivo" font-size="36" fill="${C.blanco}">Series por equipos · Cuadros tipo IDE</text>
  <g font-family="Archivo" font-weight="800" fill="${C.blanco}">
    <rect x="70" y="1130" width="300" height="140" rx="14" fill="${C.fondo}" opacity=".85"/>
    <text x="96" y="1182" font-size="26" fill="${C.amarillo}" letter-spacing="3">CATEGORÍA</text>
    <text x="96" y="1240" font-size="52">Primera</text>
    <rect x="390" y="1130" width="300" height="140" rx="14" fill="${C.fondo}" opacity=".85"/>
    <text x="416" y="1182" font-size="26" fill="${C.amarillo}" letter-spacing="3">EQUIPOS</text>
    <text x="416" y="1240" font-size="52">8</text>
    <rect x="710" y="1130" width="300" height="140" rx="14" fill="${C.amarillo}"/>
    <text x="736" y="1182" font-size="26" fill="${C.fondo}" letter-spacing="3">INSCRIPCIÓN</text>
    <text x="736" y="1240" font-size="52" fill="${C.fondo}">Gratis</text>
  </g>
</svg>`;
const fuentes = ["Archivo-400", "Archivo-800"].map((f) => join(RAIZ, "fuentes", `${f}.ttf`));
const png = new Resvg(svg, { font: { fontFiles: fuentes, loadSystemFonts: false, defaultFontFamily: "Archivo" } }).render().asPng();
const salida = join(RAIZ, "reels/tmp/tennis-flyer-demo.png");
await writeFile(salida, png);
console.log("✓", salida);
