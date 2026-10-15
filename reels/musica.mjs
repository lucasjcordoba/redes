/**
 * Música de fondo para los reels, sintetizada desde cero: sin samples ni
 * temas de terceros, así que no hay derechos que cuidar.
 *
 * Todos los reels usan la misma familia: la música de Raudal Dev (tecnológica,
 * precisa y confiada; 104 bpm, La menor: arpegio de sintetizador en
 * semicorcheas, colchón suave, bajo a contratiempo y bombo en negras). Cada
 * proyecto tiene su variante (`musica` en el guion), con otro tempo, otra
 * tonalidad y otro brillo: gesta (110, Re menor), estreno (114, Fa mayor),
 * mundomejor (96, Re mayor, más suave), confianza (100, Do mayor), tecnoaid
 * (112, Mi menor, brillante), deporte (120, La mayor), industria (106, Mi
 * menor, más oscura). Queda también el lo-fi tranquilo de antes (lofi).
 *
 * Los cambios de escena (`marcas`) se acentúan con un remate propio de cada
 * estilo (un barrido, una campanita, un redoble), cuantizado al tiempo más
 * cercano para que caiga a compás. Se genera el largo exacto del reel, con
 * entrada y salida en fundido.
 *
 *   node reels/musica.mjs <estilo> <segundos> <salida.m4a>
 */
import { writeFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const ejecutar = promisify(execFile);
const SR = 44100;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// Ruido determinístico: la misma música cada vez que se genera.
let semilla = 7;
const azar = () => ((semilla = (semilla * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

// ---------- mezcla e instrumentos ----------

function crearMezcla(segundos) {
  const total = Math.ceil(segundos * SR);
  const L = new Float32Array(total);
  const R = new Float32Array(total);
  return {
    total, L, R,
    /** Suma una muestra mono con paneo (-1 izquierda, 1 derecha). */
    sumar(i, v, pan = 0) {
      if (i < 0 || i >= total) return;
      const a = ((pan + 1) * Math.PI) / 4;
      L[i] += v * Math.cos(a) * Math.SQRT2;
      R[i] += v * Math.sin(a) * Math.SQRT2;
    },
  };
}

/** Filtro de estado variable (Chamberlin). Devuelve una función por muestra. */
function filtro() {
  let lp = 0, bp = 0;
  return (x, corte, q = 0.8, tipo = "lp") => {
    const f = 2 * Math.sin((Math.PI * Math.min(corte, SR / 7)) / SR);
    lp += f * bp;
    const hp = x - lp - bp / q;
    bp += f * hp;
    return tipo === "lp" ? lp : tipo === "hp" ? hp : bp;
  };
}

/** Diente de sierra sin aliasing (polyBLEP). */
function blep(fase, dt) {
  if (fase < dt) { const t = fase / dt; return t + t - t * t - 1; }
  if (fase > 1 - dt) { const t = (fase - 1) / dt; return t * t + t + t + 1; }
  return 0;
}

const satura = (x, drive) => Math.tanh(x * drive) / Math.tanh(drive);

/**
 * Sintetizador sustractivo: sierras (una o varias desafinadas) por un filtro
 * con envolvente.
 */
function sinte(m, t0, f, vol, dur, o = {}) {
  const { voces = 1, desafino = 8, corte = 2000, envCorte = 0, caidaCorte = 8, q = 0.9, ataque = 0.005,
    caida = 0.3, sostener = 0.6, soltar = 0.15, pan = 0, drive = 0, forma = "saw" } = o;
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor((dur + soltar) * SR);
  const fl = filtro();
  const fases = Array.from({ length: voces }, (_, k) => (k * 0.37) % 1);
  const fs = Array.from({ length: voces }, (_, k) => f * Math.pow(2, ((k - (voces - 1) / 2) * desafino) / 1200));
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let env = t < ataque ? t / ataque : sostener + (1 - sostener) * Math.exp(-(t - ataque) / (caida / 3));
    if (t > dur) env *= Math.exp(-(t - dur) / (soltar / 4));
    let s = 0;
    for (let k = 0; k < voces; k++) {
      const dt = fs[k] / SR;
      fases[k] += dt;
      if (fases[k] >= 1) fases[k] -= 1;
      s += forma === "tri" ? 1 - 4 * Math.abs(fases[k] - 0.5) : 2 * fases[k] - 1 - blep(fases[k], dt);
    }
    s /= Math.sqrt(voces);
    s = fl(s, corte + envCorte * Math.exp(-t * caidaCorte), q);
    if (drive) s = satura(s, drive);
    m.sumar(i0 + i, vol * env * s, pan);
  }
}

/** Cuerda punteada (Karplus-Strong): guitarra acústica. */
function cuerda(m, t0, f, vol, dur, o = {}) {
  const { brillo = 0.5, caida = 0.996, pan = 0 } = o;
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  const D = SR / f - 0.5;
  const largo = Math.ceil(D) + 2;
  const buf = new Float32Array(largo * 4);
  let prev = 0;
  for (let i = 0; i < largo; i++) { const r = azar(); prev = prev + brillo * (r - prev); buf[i] = prev; }
  const N = buf.length;
  let w = largo;
  const leer = (pos) => { const a = Math.floor(pos), fr = pos - a; return buf[((a % N) + N) % N] * (1 - fr) + buf[(((a + 1) % N) + N) % N] * fr; };
  for (let i = 0; i < n; i++) {
    const x1 = leer(w - D), x2 = leer(w - D - 1);
    const y = caida * 0.5 * (x1 + x2);
    buf[w % N] = y;
    w++;
    const env = Math.min(1, i / 40) * (i > n - 2000 ? (n - i) / 2000 : 1);
    m.sumar(i0 + i, vol * env * y, pan);
  }
}

/** FM de dos operadores: marimba, campanitas, piano suave. */
function fm(m, t0, f, vol, dur, o = {}) {
  const { razon = 4, indice = 3, caidaIndice = 12, caida = 4, pan = 0, ataque = 0.002 } = o;
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / ataque) * Math.exp(-t * caida) * (i > n - 800 ? (n - i) / 800 : 1);
    const mod = indice * Math.exp(-t * caidaIndice) * Math.sin(2 * Math.PI * f * razon * t);
    m.sumar(i0 + i, vol * env * Math.sin(2 * Math.PI * f * t + mod), pan);
  }
}

/** Piano eléctrico: fundamental + armónicos, ataque rápido y caída larga. */
function piano(m, t0, f, vol, dur, o = {}) {
  const { pan = 0, trem = 0.12, caida = 2.2 } = o;
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.008) * Math.exp(-t * caida) * (i > n - 1500 ? (n - i) / 1500 : 1);
    const tr = 1 + trem * Math.sin(2 * Math.PI * 4.5 * t);
    const s = Math.sin(2 * Math.PI * f * t) + 0.28 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 6) + 0.06 * Math.sin(6 * Math.PI * f * t);
    m.sumar(i0 + i, vol * env * tr * s, pan);
  }
}

/** Bajo redondo: seno con un poco de segundo armónico y un golpe de filtro. */
function bajo(m, t0, f, vol, dur, o = {}) {
  const { brillo = 0.15, caida = 1.6, pan = 0 } = o;
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t * caida) * (i > n - 600 ? (n - i) / 600 : 1);
    const s = Math.sin(2 * Math.PI * f * t) + brillo * Math.sin(4 * Math.PI * f * t) + brillo * 0.4 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 20);
    m.sumar(i0 + i, vol * env * s, pan);
  }
}

// Batería.
function bombo(m, t0, vol, { tono = 45, golpe = 70, caida = 9 } = {}) {
  const i0 = Math.floor(t0 * SR);
  let fase = 0;
  for (let i = 0; i < SR * 0.4; i++) {
    const t = i / SR;
    fase += (2 * Math.PI * (tono + golpe * Math.exp(-t * 28))) / SR;
    m.sumar(i0 + i, vol * Math.exp(-t * caida) * (Math.sin(fase) + 0.25 * Math.exp(-t * 300) * azar()));
  }
}
function ruido(m, t0, vol, dur, { corte = 6000, tipo = "hp", q = 0.7, caida = 30, ataque = 0.0005, pan = 0 } = {}) {
  const i0 = Math.floor(t0 * SR);
  const fl = filtro();
  for (let i = 0; i < SR * dur; i++) {
    const t = i / SR;
    m.sumar(i0 + i, vol * Math.min(1, t / ataque) * Math.exp(-t * caida) * fl(azar(), corte, q, tipo), pan);
  }
}
function caja(m, t0, vol, { tono = 185 } = {}) {
  ruido(m, t0, vol, 0.25, { corte: 1800, tipo: "hp", caida: 16 });
  const i0 = Math.floor(t0 * SR);
  for (let i = 0; i < SR * 0.15; i++) { const t = i / SR; m.sumar(i0 + i, vol * 0.7 * Math.exp(-t * 30) * Math.sin(2 * Math.PI * tono * t)); }
}
function aplauso(m, t0, vol) {
  for (const [d, v] of [[0, 0.6], [0.011, 0.7], [0.022, 1]]) ruido(m, t0 + d, vol * v, d === 0.022 ? 0.22 : 0.02, { corte: 1400, tipo: "bp", q: 1.2, caida: d === 0.022 ? 18 : 120 });
}
const hat = (m, t0, vol, abierto = false, pan = 0.25) => ruido(m, t0, vol, abierto ? 0.35 : 0.06, { corte: 8000, caida: abierto ? 9 : 75, pan });
const shaker = (m, t0, vol) => ruido(m, t0, vol, 0.09, { corte: 6500, tipo: "bp", q: 1.4, ataque: 0.02, caida: 40, pan: -0.3 });
function aro(m, t0, vol) {
  ruido(m, t0, vol * 0.5, 0.04, { corte: 3000, tipo: "bp", q: 2, caida: 90 });
  fm(m, t0, 820, vol, 0.08, { razon: 1.6, indice: 2, caidaIndice: 60, caida: 60 });
}
function tom(m, t0, vol, tono) { bombo(m, t0, vol, { tono, golpe: tono * 0.8, caida: 7 }); ruido(m, t0, vol * 0.15, 0.1, { corte: 2000, caida: 40 }); }
const platillo = (m, t0, vol) => { ruido(m, t0, vol, 2.2, { corte: 5500, caida: 1.6, pan: 0.2 }); ruido(m, t0, vol * 0.6, 2.2, { corte: 9000, caida: 2.2, pan: -0.2 }); };

/** Barrido de ruido que crece hasta `t` (anticipa un cambio). */
function barrido(m, t, vol, largo = 1) {
  const i0 = Math.floor((t - largo) * SR);
  const fl = filtro();
  for (let i = 0; i < largo * SR; i++) {
    const k = i / (largo * SR);
    m.sumar(i0 + i, vol * k * k * fl(azar(), 400 + 7000 * k * k, 2, "bp"), Math.sin(k * 3) * 0.4);
  }
}

// ---------- estilos ----------

/**
 * Cada estilo: bpm, una progresión de acordes (MIDI: notas y bajo, un compás
 * cada uno), lo que suena en cada compás, el remate de cada cambio de escena
 * y la cadena de efectos final de ffmpeg.
 */
/**
 * Un estilo de la familia de Raudal: colchón suave, arpegio en semicorcheas
 * que se abre en la entrada, eco a la corchea con puntillo, bajo a
 * contratiempo y bombo en negras. En los temas largos, cada 16 compases hay
 * un respiro de dos compases sin batería.
 *   brillo  cuánto se abre el filtro del arpegio (1 = Raudal)
 *   forma   "saw" (Raudal) o "tri" (más suave)
 *   bombo   "negras" (cuatro por compás) o "medio" (en el 1 y el 3)
 */
function familia({ bpm, acordes, brillo = 1, forma = "saw", bombo: patronBombo = "negras", aplausoDesde = 4, orden = [0, 2, 1, 3, 2, 4, 3, 1] }) {
  return {
    bpm, acordes,
    compas(m, { c, t, B, notas, bajo: b }) {
      const C = B * 4;
      notas.slice(0, 4).forEach((nt, k) => sinte(m, t, hz(nt), 0.022, C, { voces: 3, desafino: 12, corte: 900, ataque: 0.5, caida: 1, sostener: 0.8, soltar: 0.6, pan: k % 2 ? 0.4 : -0.4 }));
      const respiro = c >= 8 && c % 16 >= 14;
      const apertura = Math.min(1, (c + 0.3) / 3) * (respiro ? 0.55 : 1);
      for (let k = 0; k < 16; k++) {
        const nt = notas[orden[k % 8] % notas.length] + 12;
        sinte(m, t + k * (B / 4), hz(nt), k % 4 === 0 ? 0.05 : 0.036, B / 5, { forma, corte: (600 + 1400 * apertura) * brillo, envCorte: 2200 * apertura * brillo, caidaCorte: 30, q: 1.6, caida: 0.12, sostener: 0, soltar: 0.08, pan: k % 2 ? 0.35 : -0.35 });
        sinte(m, t + k * (B / 4) + B * 0.75, hz(nt), 0.012, B / 5, { forma, corte: (900 * apertura + 300) * brillo, envCorte: 900, caidaCorte: 30, caida: 0.12, sostener: 0, soltar: 0.08, pan: k % 2 ? -0.6 : 0.6 });
      }
      if (c < 2 || respiro) {
        if (respiro && c % 16 === 15) barrido(m, t + C, 0.06, C);
        return;
      }
      for (let k = 0; k < 4; k++) {
        sinte(m, t + k * B + B / 2, hz(b + 12), 0.11, B * 0.42, { corte: 380, envCorte: 900, caidaCorte: 18, caida: 0.2, sostener: 0.4, soltar: 0.05 });
        bajo(m, t + k * B + B / 2, hz(b), 0.13, B * 0.42, { brillo: 0.05, caida: 3 });
        if (patronBombo === "negras" || k % 2 === 0) bombo(m, t + k * B, 0.36, { tono: 48, golpe: 80 });
      }
      for (let k = 0; k < 16; k++) hat(m, t + k * (B / 4), k % 4 === 2 ? 0.05 : 0.022);
      if (c >= aplausoDesde) { aplauso(m, t + B, 0.16); aplauso(m, t + 3 * B, 0.16); }
    },
    acento(m, t, B) {
      barrido(m, t, 0.07, B * 2);
      bombo(m, t, 0.2, { tono: 38, golpe: 40, caida: 4 });
    },
    fx: "highpass=f=30,aecho=0.8:0.55:90|160:0.2|0.12",
  };
}

const ESTILOS = {
  raudal: {
    bpm: 104,
    acordes: [
      { notas: [57, 60, 64, 67, 71], bajo: 33 }, // Am9
      { notas: [53, 57, 60, 64, 67], bajo: 29 }, // Fmaj9
      { notas: [55, 60, 62, 67], bajo: 36 }, // Cadd9
      { notas: [55, 59, 62, 64], bajo: 31 }, // G6
    ],
    compas(m, { c, t, B, notas, bajo: b }) {
      const C = B * 4;
      // Colchón: tres sierras desafinadas, entrada lenta.
      notas.slice(0, 4).forEach((nt, k) => sinte(m, t, hz(nt), 0.022, C, { voces: 3, desafino: 12, corte: 900, ataque: 0.5, caida: 1, sostener: 0.8, soltar: 0.6, pan: k % 2 ? 0.4 : -0.4 }));
      // Arpegio en semicorcheas que se abre de a poco en la entrada.
      const apertura = Math.min(1, (c + 0.3) / 3);
      const orden = [0, 2, 1, 3, 2, 4 % notas.length, 3, 1];
      for (let k = 0; k < 16; k++) {
        const nt = notas[orden[k % 8] % notas.length] + 12;
        sinte(m, t + k * (B / 4), hz(nt), k % 4 === 0 ? 0.05 : 0.036, B / 5, { corte: 600 + 1400 * apertura, envCorte: 2200 * apertura, caidaCorte: 30, q: 1.6, caida: 0.12, sostener: 0, soltar: 0.08, pan: k % 2 ? 0.35 : -0.35 });
        // Eco a la corchea con puntillo, más bajo y del otro lado.
        sinte(m, t + k * (B / 4) + B * 0.75, hz(nt), 0.012, B / 5, { corte: 900 * apertura + 300, envCorte: 900, caidaCorte: 30, caida: 0.12, sostener: 0, soltar: 0.08, pan: k % 2 ? -0.6 : 0.6 });
      }
      if (c < 2) return;
      // Bajo a contratiempo y bombo en negras: pulso firme sin apuro.
      for (let k = 0; k < 4; k++) {
        sinte(m, t + k * B + B / 2, hz(b + 12), 0.11, B * 0.42, { corte: 380, envCorte: 900, caidaCorte: 18, caida: 0.2, sostener: 0.4, soltar: 0.05 });
        bajo(m, t + k * B + B / 2, hz(b), 0.13, B * 0.42, { brillo: 0.05, caida: 3 });
        bombo(m, t + k * B, 0.36, { tono: 48, golpe: 80 });
      }
      for (let k = 0; k < 16; k++) hat(m, t + k * (B / 4), k % 4 === 2 ? 0.05 : 0.022);
      if (c >= 4) { aplauso(m, t + B, 0.16); aplauso(m, t + 3 * B, 0.16); }
    },
    acento(m, t, B) {
      barrido(m, t, 0.07, B * 2);
      bombo(m, t, 0.2, { tono: 38, golpe: 40, caida: 4 });
    },
    fx: "highpass=f=30,aecho=0.8:0.55:90|160:0.2|0.12",
  },

  // El resto de los proyectos: misma familia que la de Raudal (la que gustó),
  // con otro tempo, otra tonalidad y otro color en cada uno.
  gesta: familia({ bpm: 110, brillo: 1.1, aplausoDesde: 4, acordes: [
    { notas: [57, 60, 62, 65, 69], bajo: 38 }, // Dm9
    { notas: [53, 57, 58, 62, 65], bajo: 34 }, // Bbmaj7
    { notas: [55, 57, 58, 62, 65], bajo: 31 }, // Gm9
    { notas: [55, 57, 62, 64], bajo: 33 }, // A7sus4
  ] }),
  estreno: familia({ bpm: 114, brillo: 1.2, aplausoDesde: 2, acordes: [
    { notas: [53, 57, 60, 64, 67], bajo: 29 }, // Fmaj9
    { notas: [52, 55, 60, 64, 67], bajo: 28 }, // C/E
    { notas: [50, 53, 57, 60, 64], bajo: 38 }, // Dm9
    { notas: [50, 53, 57, 58, 60], bajo: 34 }, // Bbmaj9
  ] }),
  mundomejor: familia({ bpm: 96, brillo: 0.85, forma: "tri", bombo: "medio", aplausoDesde: 99, acordes: [
    { notas: [54, 57, 61, 62, 64], bajo: 38 }, // Dmaj9
    { notas: [50, 54, 57, 59, 61], bajo: 35 }, // Bm9
    { notas: [55, 59, 62, 66, 69], bajo: 31 }, // Gmaj9
    { notas: [57, 59, 61, 64], bajo: 33 }, // Aadd9
  ] }),
  confianza: familia({ bpm: 100, brillo: 0.9, aplausoDesde: 6, acordes: [
    { notas: [55, 59, 60, 64, 67], bajo: 36 }, // Cmaj7
    { notas: [57, 60, 64, 67, 71], bajo: 33 }, // Am9
    { notas: [53, 57, 60, 64, 67], bajo: 29 }, // Fmaj9
    { notas: [55, 59, 62, 64], bajo: 31 }, // G6
  ] }),
  tecnoaid: familia({ bpm: 112, brillo: 1.25, aplausoDesde: 2, acordes: [
    { notas: [52, 55, 59, 62, 66], bajo: 28 }, // Em9
    { notas: [52, 55, 59, 60, 62], bajo: 36 }, // Cmaj9
    { notas: [55, 57, 59, 62, 64], bajo: 31 }, // G6/9
    { notas: [54, 57, 59, 62], bajo: 38 }, // D6
  ] }),
  deporte: familia({ bpm: 120, brillo: 1.35, aplausoDesde: 2, acordes: [
    { notas: [57, 61, 64, 68, 71], bajo: 33 }, // Amaj9
    { notas: [54, 57, 61, 64, 68], bajo: 30 }, // F#m9
    { notas: [54, 57, 61, 62, 64], bajo: 38 }, // Dmaj9
    { notas: [56, 59, 61, 64], bajo: 40 }, // E6
  ] }),
  industria: familia({ bpm: 106, brillo: 0.8, orden: [0, 1, 2, 3, 0, 1, 2, 4], aplausoDesde: 4, acordes: [
    { notas: [52, 55, 59, 62, 66], bajo: 28 }, // Em9
    { notas: [52, 55, 59, 60, 62], bajo: 36 }, // Cmaj9
    { notas: [55, 57, 60, 64, 67], bajo: 33 }, // Am9
    { notas: [54, 59, 61, 64], bajo: 35 }, // Bsus4
  ] }),

  lofi: {
    bpm: 90,
    acordes: [
      { notas: [65, 69, 72, 76], bajo: 41 }, // Fmaj7
      { notas: [64, 67, 71, 74], bajo: 40 }, // Em7
      { notas: [62, 65, 69, 72], bajo: 38 }, // Dm7
      { notas: [60, 64, 67, 71], bajo: 36 }, // Cmaj7
    ],
    compas(m, { c, t, B, notas, bajo: b }) {
      notas.forEach((nt, k) => piano(m, t + k * 0.012, hz(nt), 0.075, B * 3.8));
      notas.slice(1).forEach((nt) => piano(m, t + B * 1.5, hz(nt + 12), 0.03, B * 1.4));
      bajo(m, t, hz(b), 0.32, B * 1.8);
      bajo(m, t + B * 2.5, hz(b), 0.32, B * 1.2);
      if (c < 1) return;
      bombo(m, t, 0.42);
      bombo(m, t + B * 2.5, 0.42);
      aro(m, t + B, 0.1);
      aro(m, t + 3 * B, 0.1);
      for (let k = 0; k < 8; k++) hat(m, t + k * (B / 2) + (k % 2 ? 0.06 : 0), k % 2 ? 0.04 : 0.065);
    },
    acento() {},
    fx: "lowpass=f=6500,aecho=0.8:0.5:60|110:0.18|0.12",
  },
};

export const estilos = Object.keys(ESTILOS);

/**
 * Genera `segundos` de música en `salida` (.m4a).
 *   marcas  instantes (s) de los cambios de escena, para acentuarlos
 */
export async function generarMusica(segundos, salida, { estilo = "lofi", marcas = [] } = {}) {
  const e = ESTILOS[estilo];
  if (!e) throw new Error(`Estilo de música desconocido: ${estilo} (hay: ${estilos.join(", ")})`);
  semilla = 7;
  const m = crearMezcla(segundos + 1);
  const B = 60 / e.bpm;
  const compases = Math.ceil(segundos / (B * 4)) + 1;
  for (let c = 0; c < compases; c++) e.compas(m, { c, t: c * B * 4, B, compases, ...e.acordes[c % e.acordes.length] });
  for (const t of marcas) if (t > B * 2) e.acento(m, Math.round(t / B) * B, B);

  // WAV 16 bits estéreo, con un margen antes de normalizar.
  let pico = 0;
  for (let i = 0; i < m.total; i++) pico = Math.max(pico, Math.abs(m.L[i]), Math.abs(m.R[i]));
  const g = pico > 0 ? 0.9 / pico : 1;
  const datos = Buffer.alloc(m.total * 4);
  for (let i = 0; i < m.total; i++) {
    datos.writeInt16LE(Math.round(m.L[i] * g * 32767), i * 4);
    datos.writeInt16LE(Math.round(m.R[i] * g * 32767), i * 4 + 2);
  }
  const cab = Buffer.alloc(44);
  cab.write("RIFF", 0); cab.writeUInt32LE(36 + datos.length, 4); cab.write("WAVE", 8);
  cab.write("fmt ", 12); cab.writeUInt32LE(16, 16); cab.writeUInt16LE(1, 20); cab.writeUInt16LE(2, 22);
  cab.writeUInt32LE(SR, 24); cab.writeUInt32LE(SR * 4, 28); cab.writeUInt16LE(4, 32); cab.writeUInt16LE(16, 34);
  cab.write("data", 36); cab.writeUInt32LE(datos.length, 40);
  const wav = `${salida}.wav`;
  await writeFile(wav, Buffer.concat([cab, datos]));

  // Sala y volumen parejo (-14 LUFS, el de Instagram); fundidos.
  const fin = Math.max(0, segundos - 2.5);
  await ejecutar("ffmpeg", [
    "-v", "error", "-y", "-i", wav,
    "-af", `${e.fx},loudnorm=I=-14:TP=-1.5:LRA=9,alimiter=limit=0.7:level=false,afade=t=in:d=0.6,afade=t=out:st=${fin}:d=2.5`,
    "-t", String(segundos), "-c:a", "aac", "-b:a", "192k", salida,
  ]);
  await rm(wav, { force: true });
  return salida;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [estilo, seg, salida] = process.argv.slice(2);
  await generarMusica(Number(seg), salida, { estilo, marcas: [8, 16, 24] });
  console.log("✓", salida);
}
