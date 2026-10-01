/**
 * Música de fondo para los reels, sintetizada desde cero: sin samples ni
 * temas de terceros, así que no hay derechos que cuidar.
 *
 * Un lo-fi tranquilo a 90 bpm: piano eléctrico con acordes de séptima
 * (Fmaj7 – Em7 – Dm7 – Cmaj7), bajo, bombo y chasquido suaves, hi-hat con
 * swing y un poco de ruido de vinilo. Se genera el largo exacto de cada reel,
 * con entrada y salida en fundido.
 *
 *   node reels/musica.mjs <segundos> <salida.m4a>
 */
import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const ejecutar = promisify(execFile);
const SR = 44100;
const BPM = 90;
const BEAT = 60 / BPM;
const COMPAS = BEAT * 4;

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
// Acordes en MIDI (voicings cerrados alrededor del Do central) y su bajo.
const ACORDES = [
  { notas: [65, 69, 72, 76], bajo: 41 }, // Fmaj7
  { notas: [64, 67, 71, 74], bajo: 40 }, // Em7
  { notas: [62, 65, 69, 72], bajo: 38 }, // Dm7
  { notas: [60, 64, 67, 71], bajo: 36 }, // Cmaj7
];

// Ruido determinístico: la misma música cada vez que se genera.
let semilla = 7;
const azar = () => ((semilla = (semilla * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

export async function generarMusica(segundos, salida) {
  const total = Math.ceil(segundos * SR);
  const L = new Float32Array(total);
  const R = new Float32Array(total);
  const sumar = (i, l, r = l) => { if (i >= 0 && i < total) { L[i] += l; R[i] += r; } };

  // Piano eléctrico: fundamental + armónicos, ataque rápido y caída larga.
  function tecla(t0, f, vol, dur) {
    const i0 = Math.floor(t0 * SR);
    const n = Math.floor(dur * SR);
    const desafino = 1.0025;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.008) * Math.exp(-t * 2.2);
      const trem = 1 + 0.12 * Math.sin(2 * Math.PI * 4.5 * t);
      const base = (ff) => Math.sin(2 * Math.PI * ff * t) + 0.28 * Math.sin(4 * Math.PI * ff * t) * Math.exp(-t * 6) + 0.06 * Math.sin(6 * Math.PI * ff * t);
      sumar(i0 + i, vol * env * trem * base(f), vol * env * trem * base(f * desafino));
    }
  }
  function bajo(t0, f, dur) {
    const i0 = Math.floor(t0 * SR);
    const n = Math.floor(dur * SR);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.01) * Math.exp(-t * 1.6);
      const s = Math.sin(2 * Math.PI * f * t) + 0.15 * Math.sin(4 * Math.PI * f * t);
      sumar(i0 + i, 0.32 * env * s);
    }
  }
  function bombo(t0) {
    const i0 = Math.floor(t0 * SR);
    let fase = 0;
    for (let i = 0; i < SR * 0.35; i++) {
      const t = i / SR;
      const f = 45 + 70 * Math.exp(-t * 28);
      fase += (2 * Math.PI * f) / SR;
      sumar(i0 + i, 0.42 * Math.exp(-t * 9) * Math.sin(fase));
    }
  }
  function chasquido(t0) {
    const i0 = Math.floor(t0 * SR);
    let prev = 0;
    for (let i = 0; i < SR * 0.18; i++) {
      const t = i / SR;
      const r = azar();
      const hp = r - prev; // agudo: diferencia de muestras
      prev = r;
      sumar(i0 + i, 0.09 * Math.exp(-t * 26) * hp + 0.05 * Math.exp(-t * 40) * Math.sin(2 * Math.PI * 190 * t));
    }
  }
  function hat(t0, vol) {
    const i0 = Math.floor(t0 * SR);
    let prev = 0;
    for (let i = 0; i < SR * 0.05; i++) {
      const r = azar();
      const hp = r - prev;
      prev = r;
      sumar(i0 + i, vol * Math.exp(-(i / SR) * 90) * hp, vol * 0.8 * Math.exp(-(i / SR) * 90) * hp);
    }
  }

  const compases = Math.ceil(segundos / COMPAS) + 1;
  for (let c = 0; c < compases; c++) {
    const t = c * COMPAS;
    const { notas, bajo: b } = ACORDES[c % ACORDES.length];
    // Acorde en el 1 y un eco más suave en el "y" del 2.
    notas.forEach((m, k) => tecla(t + k * 0.012, hz(m), 0.075, COMPAS * 0.95));
    notas.slice(1).forEach((m) => tecla(t + BEAT * 1.5, hz(m + 12), 0.03, BEAT * 1.4));
    bajo(t, hz(b), BEAT * 1.8);
    bajo(t + BEAT * 2.5, hz(b), BEAT * 1.2);
    // La batería entra en el segundo compás.
    if (c >= 1) {
      bombo(t);
      bombo(t + BEAT * 2.5);
      chasquido(t + BEAT);
      chasquido(t + BEAT * 3);
      for (let k = 0; k < 8; k++) hat(t + k * (BEAT / 2) + (k % 2 ? 0.06 : 0), k % 2 ? 0.04 : 0.065);
    }
  }
  // Vinilo: chasquidos esporádicos muy bajos.
  for (let i = 0; i < total; i++) if (Math.abs(azar()) > 0.99985) sumar(i, azar() * 0.05);

  // WAV 16 bits estéreo.
  const datos = Buffer.alloc(total * 4);
  for (let i = 0; i < total; i++) {
    datos.writeInt16LE(Math.max(-1, Math.min(1, L[i])) * 32767, i * 4);
    datos.writeInt16LE(Math.max(-1, Math.min(1, R[i])) * 32767, i * 4 + 2);
  }
  const cab = Buffer.alloc(44);
  cab.write("RIFF", 0); cab.writeUInt32LE(36 + datos.length, 4); cab.write("WAVE", 8);
  cab.write("fmt ", 12); cab.writeUInt32LE(16, 16); cab.writeUInt16LE(1, 20); cab.writeUInt16LE(2, 22);
  cab.writeUInt32LE(SR, 24); cab.writeUInt32LE(SR * 4, 28); cab.writeUInt16LE(4, 32); cab.writeUInt16LE(16, 34);
  cab.write("data", 36); cab.writeUInt32LE(datos.length, 40);
  const wav = `${salida}.wav`;
  await writeFile(wav, Buffer.concat([cab, datos]));

  // Calidez (recorte de agudos), un poco de sala y volumen parejo; fundidos.
  const fin = Math.max(0, segundos - 2);
  await ejecutar("ffmpeg", [
    "-v", "error", "-y", "-i", wav,
    "-af", `lowpass=f=6500,aecho=0.8:0.5:60|110:0.18|0.12,loudnorm=I=-17:TP=-2:LRA=9,afade=t=in:d=0.8,afade=t=out:st=${fin}:d=2`,
    "-t", String(segundos), "-c:a", "aac", "-b:a", "192k", salida,
  ]);
  return salida;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [seg, salida] = process.argv.slice(2);
  await generarMusica(Number(seg), salida);
  console.log("✓", salida);
}
