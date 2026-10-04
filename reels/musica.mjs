/**
 * Música de fondo para los reels, sintetizada desde cero: sin samples ni
 * temas de terceros, así que no hay derechos que cuidar.
 *
 * Cada reel tiene su estilo, elegido por lo que muestra (`musica` en el guion):
 *
 *   raudal      Tecnológico, preciso y confiado. 104 bpm, La menor: arpegio
 *               de sintetizador en semicorcheas, colchón suave, bajo a
 *               contratiempo y bombo en negras.
 *   mundomejor  Artístico, cálido, independiente. 86 bpm, Re mayor: guitarra
 *               acústica punteada, piano suave con una melodía simple, bajo
 *               redondo, shaker y aro.
 *   tecnoaid    Amigable, resolutivo, optimista. 116 bpm, Do mayor: marimba
 *               sincopada, bajo saltarín, aplausos y un gancho de campanitas.
 *   gesta       Gira, escenario, energía en vivo. 124 bpm, Mi menor: guitarras
 *               saturadas en corcheas, guitarra limpia con eco, batería de rock
 *               y platillos.
 *   lofi        El lo-fi tranquilo de antes (90 bpm).
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

  mundomejor: {
    bpm: 86,
    acordes: [
      { notas: [50, 57, 62, 66, 69], bajo: 38, melodia: [[0, 74], [2, 76], [3, 78]] }, // D
      { notas: [47, 54, 57, 62, 66], bajo: 35, melodia: [[0, 78], [1.5, 76], [3, 74]] }, // Bm7
      { notas: [43, 50, 55, 59, 66], bajo: 31, melodia: [[0, 74], [2, 71], [3, 74]] }, // Gmaj7
      { notas: [45, 52, 57, 61, 64], bajo: 33, melodia: [[0, 73], [2, 76], [3.5, 69]] }, // A
    ],
    compas(m, { c, t, B, notas, bajo: b, melodia }) {
      const h = () => azar() * 0.008; // un poco de mano humana
      // Guitarra punteada en corcheas: bajo en el 1 y el 3, cuerdas de arriba en el medio.
      const patron = [0, 2, 3, 4, 1, 3, 2, 4];
      patron.forEach((p, k) => {
        const v = (k === 0 || k === 4 ? 0.2 : 0.13) * (0.85 + 0.15 * Math.abs(azar()));
        cuerda(m, t + k * (B / 2) + h(), hz(notas[p]), v, B * 3, { brillo: 0.45, caida: 0.9975, pan: -0.25 + p * 0.1 });
      });
      if (c >= 2) {
        bajo(m, t, hz(b), 0.2, B * 1.8, { brillo: 0.2, caida: 1.2 });
        bajo(m, t + B * 2.5, hz(b + 7), 0.13, B * 1.3, { brillo: 0.2, caida: 1.5 });
        bombo(m, t, 0.2, { tono: 52, golpe: 40, caida: 10 });
        bombo(m, t + B * 2.5, 0.13, { tono: 52, golpe: 40, caida: 10 });
        aro(m, t + B, 0.12);
        aro(m, t + 3 * B, 0.12);
        for (let k = 0; k < 8; k++) shaker(m, t + k * (B / 2) + (k % 2 ? 0.04 : 0), k % 2 ? 0.05 : 0.075);
      }
      // Melodía de piano suave a partir del cuarto compás.
      if (c >= 4) for (const [tb, nt] of melodia) piano(m, t + tb * B + h(), hz(nt), 0.075, B * 2, { trem: 0.05, caida: 1.4, pan: 0.2 });
    },
    acento(m, t) {
      fm(m, t, hz(86), 0.05, 2.5, { razon: 3.5, indice: 2, caidaIndice: 6, caida: 1.4, pan: 0.4 });
      fm(m, t + 0.09, hz(93), 0.035, 2.5, { razon: 3.5, indice: 2, caidaIndice: 6, caida: 1.4, pan: -0.4 });
    },
    fx: "highpass=f=35,lowpass=f=9000,aecho=0.8:0.6:70|130|210:0.25|0.18|0.1",
  },

  tecnoaid: {
    bpm: 116,
    acordes: [
      { notas: [60, 64, 67, 72], bajo: 36, gancho: [[0, 76], [0.75, 79], [1.5, 81], [2.5, 79], [3, 76]] }, // C
      { notas: [59, 62, 67, 71], bajo: 35, gancho: [[0, 74], [0.75, 79], [1.5, 83], [2.5, 81], [3, 79]] }, // G/B
      { notas: [57, 60, 64, 67], bajo: 33, gancho: [[0, 76], [0.75, 79], [1.5, 84], [2.5, 83], [3, 81]] }, // Am7
      { notas: [57, 60, 65, 67], bajo: 29, gancho: [[0, 81], [0.75, 79], [1.5, 77], [2, 76], [3, 74]] }, // Fadd9
    ],
    compas(m, { c, t, B, notas, bajo: b, gancho }) {
      // Marimba sincopada (3+3+2 en corcheas) con relleno en semicorcheas.
      const golpes = [[0, [0, 2]], [1.5, [1, 3]], [3, [0, 2]], [3.75, [3]], [2.25, [2]]];
      for (const [tb, idx] of golpes) for (const p of idx) fm(m, t + tb * B, hz(notas[p]), 0.085, 0.8, { razon: 4, indice: 2.5, caidaIndice: 25, caida: 5, pan: p % 2 ? 0.3 : -0.3 });
      if (c >= 1) {
        // Bajo saltarín: fundamental y octava.
        for (const [tb, oct, d] of [[0, 0, 0.6], [0.75, 12, 0.3], [1.5, 0, 0.6], [2.5, 12, 0.3], [3, 0, 0.4], [3.5, 7, 0.4]]) {
          sinte(m, t + tb * B, hz(b + oct), 0.08, B * d, { voces: 1, corte: 500, envCorte: 1600, caidaCorte: 25, caida: 0.15, sostener: 0.3, soltar: 0.04 });
          bajo(m, t + tb * B, hz(b + oct), 0.11, B * d, { brillo: 0.1, caida: 3 });
        }
        bombo(m, t, 0.34, { tono: 50, golpe: 90 });
        bombo(m, t + B * 1.5, 0.22, { tono: 50, golpe: 90 });
        bombo(m, t + B * 2.5, 0.28, { tono: 50, golpe: 90 });
        for (let k = 0; k < 8; k++) hat(m, t + k * (B / 2), k % 2 ? 0.06 : 0.03, false, 0.3);
        shaker(m, t + B * 0.75, 0.05);
        shaker(m, t + B * 2.75, 0.05);
      }
      if (c >= 2) { aplauso(m, t + B, 0.2); aplauso(m, t + 3 * B, 0.2); }
      // Gancho de campanitas a partir del cuarto compás.
      if (c >= 4) for (const [tb, nt] of gancho) {
        fm(m, t + tb * B, hz(nt), 0.05, 1, { razon: 3.5, indice: 1.6, caidaIndice: 8, caida: 3, pan: 0.15 });
        fm(m, t + tb * B + B * 0.75, hz(nt), 0.015, 0.8, { razon: 3.5, indice: 1.2, caidaIndice: 8, caida: 3, pan: -0.5 });
      }
    },
    acento(m, t, B) {
      // Subida corta de tres notas (como un "listo") y un aplauso.
      [72, 76, 79, 84].forEach((nt, k) => fm(m, t - B + k * (B / 4), hz(nt), 0.05, 0.5, { razon: 4, indice: 2, caidaIndice: 25, caida: 6, pan: -0.3 + k * 0.2 }));
      platillo(m, t, 0.025);
    },
    fx: "highpass=f=30,aecho=0.8:0.5:60|120:0.18|0.1",
  },

  gesta: {
    bpm: 124,
    acordes: [
      { notas: [40, 47, 52], arpegio: [64, 71, 76, 71], bajo: 28 }, // Em
      { notas: [36, 43, 48], arpegio: [64, 67, 72, 67], bajo: 36 }, // C
      { notas: [43, 50, 55], arpegio: [62, 67, 74, 67], bajo: 31 }, // G
      { notas: [38, 45, 50], arpegio: [62, 66, 74, 69], bajo: 38 }, // D
    ],
    compas(m, { c, t, B, notas, bajo: b, arpegio }) {
      const lleno = c >= 2;
      // Guitarras saturadas: corcheas apagadas en la entrada; después, acorde abierto y corcheas.
      for (let k = 0; k < 8; k++) {
        const abierto = lleno && (k === 0 || k === 3 || k === 6);
        for (const [i, nt] of notas.entries()) {
          for (const pan of [-0.6, 0.6]) sinte(m, t + k * (B / 2) + (pan > 0 ? 0.006 : 0), hz(nt), abierto ? 0.05 : 0.04, abierto ? B * 1.4 : B * 0.25,
            { voces: 2, desafino: pan > 0 ? 9 : -9, corte: abierto ? 2600 : 900 + (lleno ? 400 : 0), envCorte: abierto ? 1500 : 600, caidaCorte: 10, caida: abierto ? 0.9 : 0.08, sostener: abierto ? 0.5 : 0.1, soltar: 0.05, drive: 4, pan: pan * (1 - i * 0.1) });
        }
      }
      // Bombo en negras desde el principio: la previa de un show.
      for (let k = 0; k < 4; k++) bombo(m, t + k * B, lleno ? 0.34 : 0.26, { tono: 50, golpe: 90 });
      if (!lleno) { if (c === 1) for (let k = 0; k < 8; k++) caja(m, t + 2 * B + k * (B / 4), 0.04 + k * 0.015); return; }
      // Batería de rock y bajo en corcheas.
      bombo(m, t + B * 2.5, 0.26, { tono: 50, golpe: 90 });
      caja(m, t + B, 0.3);
      caja(m, t + 3 * B, 0.3);
      for (let k = 0; k < 8; k++) hat(m, t + k * (B / 2), k === 7 ? 0.07 : k % 2 ? 0.035 : 0.06, k === 7);
      for (let k = 0; k < 8; k++) sinte(m, t + k * (B / 2), hz(b), 0.11, B * 0.45, { voces: 1, corte: 600, envCorte: 900, caidaCorte: 14, caida: 0.2, sostener: 0.5, soltar: 0.04, drive: 1.5 });
      // Guitarra limpia con eco (la de los estadios), desde el cuarto compás.
      if (c >= 4) for (let k = 0; k < 8; k++) {
        const nt = arpegio[k % 4] + 12 * (k >= 4 ? 0 : 0);
        sinte(m, t + k * (B / 2), hz(nt), 0.03, B * 0.4, { corte: 2400, envCorte: 1800, caidaCorte: 18, caida: 0.25, sostener: 0.2, soltar: 0.2, pan: 0.2 });
        sinte(m, t + k * (B / 2) + B * 0.75, hz(nt), 0.012, B * 0.4, { corte: 1800, caida: 0.25, sostener: 0.2, soltar: 0.2, pan: -0.5 });
      }
      if (c % 8 === 2) platillo(m, t, 0.08);
    },
    acento(m, t, B) {
      // Redoble de toms en el último tiempo y platillo en el cambio.
      [130, 110, 95, 80].forEach((tono, k) => tom(m, t - B + k * (B / 4), 0.16, tono));
      platillo(m, t, 0.08);
    },
    fx: "highpass=f=30,aecho=0.8:0.5:50|95:0.15|0.08",
  },

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
