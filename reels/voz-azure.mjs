/**
 * Síntesis de voz con Azure Speech (voces neuronales de Argentina).
 *
 * Plan gratuito F0: 500.000 caracteres de voz neuronal por mes. Un reel usa
 * unos 600. Variables en .env: AZURE_SPEECH_KEY y AZURE_SPEECH_REGION.
 *
 * Voces es-AR: "es-AR-ElenaNeural" y "es-AR-TomasNeural".
 *
 * Ojo con las pausas artificiales (<break>) después de una marca: aíslan la
 * palabra y suenan forzadas. Si un nombre se pega con lo que sigue ("Raudal
 * Dev desarrolla"), es mejor reescribir la frase para que siga una vocal
 * ("Raudal Dev es una empresa que…").
 *
 * PRONUNCIACION corrige palabras que la voz lee mal: se reemplazan por cómo
 * suenan, sólo en lo hablado (los subtítulos quedan con la ortografía normal).
 */
import { writeFile } from "node:fs/promises";

export const VOCES = {
  elena: "es-AR-ElenaNeural", // Argentina
  tomas: "es-AR-TomasNeural", // Argentina
  valentina: "es-UY-ValentinaNeural", // Uruguay: rioplatense
  tania: "es-PY-TaniaNeural", // Paraguay
  paloma: "es-US-PalomaNeural", // neutro latino
  daliaHD: "es-MX-Dalia:DragonHDLatestNeural", // México, alta definición
};

const PRONUNCIACION = [
  [/\bonline\b/gi, "onlain"],
  [/\braudaldev\.com\b/gi, "Raudal Dev punto com"],
  [/\bmundomejorok\.com\b/gi, "mundo mejor o ka punto com"],
  [/\btecnoaidar\.com\b/gi, "tecno aid ar punto com"],
  [/\bgestamanager\.com\b/gi, "gesta mánayer punto com"],
  [/\bManager\b/g, "Mánayer"],
  [/\bcachet\b/gi, "cashé"],
  [/\biOS\b/g, "ai o es"],
  [/\bTecnoAid\b/g, "Tecno Eid"],
  [/\bbooking\b/gi, "búking"],
  [/\btour management\b/gi, "tur mánashment"],
  [/\bjoysticks\b/gi, "yóistiks"],
  [/\bmerch\b/gi, "merch"],
];

const escXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function paraHablar(texto) {
  return PRONUNCIACION.reduce((t, [re, por]) => t.replace(re, por), texto);
}

/**
 * Genera un WAV (24 kHz, mono) con el texto.
 *   ritmo: velocidad relativa ("+0%", "-5%"...)
 *   tono:  altura relativa ("+0%", "-4%"...): más grave suena más cálido,
 *          más agudo, más enérgico
 */
export async function sintetizar(texto, salida, { voz = VOCES.tomas, ritmo = "+0%", tono = "+0%" } = {}) {
  const clave = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!clave || !region) throw new Error("Faltan AZURE_SPEECH_KEY y AZURE_SPEECH_REGION en .env");

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-AR">
  <voice name="${voz}"><prosody rate="${ritmo}" pitch="${tono}">${escXml(paraHablar(texto))}</prosody></voice></speak>`;

  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": clave,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
      "User-Agent": "redes-reels",
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`Azure Speech ${res.status}: ${(await res.text()).slice(0, 200)}`);
  await writeFile(salida, Buffer.from(await res.arrayBuffer()));
  return salida;
}
