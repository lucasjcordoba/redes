/**
 * Notificaciones push: dónde se guardan los dispositivos y cómo se les avisa.
 *
 * Vercel no tiene base de datos en este proyecto, así que las suscripciones
 * (una por dispositivo donde se activaron los avisos) se guardan en el repo,
 * en datos/suscripciones.enc. El repo es público: el archivo va cifrado con
 * AES-256-GCM usando REVISION_CLAVE, y sólo esta app puede leerlo.
 *
 * Variables de entorno:
 *   VAPID_PUBLIC, VAPID_PRIVATE   par de claves de Web Push
 *   REVISION_CLAVE                para cifrar el archivo
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import webpush from "web-push";
import { REPO, gh } from "./_lib.js";

const ARCHIVO = "datos/suscripciones.enc";

const clave = () => createHash("sha256").update(`suscripciones:${process.env.REVISION_CLAVE}`).digest();

function cifrar(obj) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", clave(), iv);
  const datos = Buffer.concat([c.update(JSON.stringify(obj), "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), datos]).toString("base64");
}

function descifrar(texto) {
  const b = Buffer.from(texto, "base64");
  const d = createDecipheriv("aes-256-gcm", clave(), b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8"));
}

/** { suscripciones: [...], sha } — sha del archivo, para poder reescribirlo. */
async function leer() {
  try {
    const f = await gh("GET", `/repos/${REPO}/contents/${ARCHIVO}?ref=main`);
    const texto = Buffer.from(f.content, "base64").toString("utf8").trim();
    return { suscripciones: descifrar(texto), sha: f.sha };
  } catch (e) {
    if (String(e.message).includes("→ 404")) return { suscripciones: [], sha: null };
    throw e;
  }
}

async function escribir(suscripciones, sha, mensaje) {
  await gh("PUT", `/repos/${REPO}/contents/${ARCHIVO}`, {
    message: `${mensaje}\n\nCo-Authored-By: redes-revisar <noreply@anthropic.com>`,
    content: Buffer.from(cifrar(suscripciones) + "\n").toString("base64"),
    branch: "main",
    ...(sha ? { sha } : {}),
  });
}

export async function agregar(sub) {
  const { suscripciones, sha } = await leer();
  if (suscripciones.some((s) => s.endpoint === sub.endpoint)) return;
  await escribir([...suscripciones, { ...sub, alta: new Date().toISOString() }], sha, "chore: dispositivo nuevo para avisos");
}

export async function quitar(endpoint) {
  const { suscripciones, sha } = await leer();
  const quedan = suscripciones.filter((s) => s.endpoint !== endpoint);
  if (quedan.length !== suscripciones.length) await escribir(quedan, sha, "chore: dispositivo dado de baja de los avisos");
}

/**
 * Manda un aviso a todos los dispositivos. Los que el navegador dio de baja
 * (410/404) se sacan de la lista.
 *   aviso: { titulo, cuerpo, url, etiqueta }
 */
export async function avisar(aviso) {
  webpush.setVapidDetails("mailto:lucasjcordoba@gmail.com", process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
  const { suscripciones, sha } = await leer();
  const muertas = [];
  let enviados = 0;

  await Promise.all(suscripciones.map(async (s) => {
    try {
      await webpush.sendNotification(s, JSON.stringify(aviso), { TTL: 12 * 3600 });
      enviados++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) muertas.push(s.endpoint);
      else console.error("push", e.statusCode, e.body);
    }
  }));

  if (muertas.length) {
    await escribir(suscripciones.filter((s) => !muertas.includes(s.endpoint)), sha, "chore: bajas de dispositivos que ya no reciben avisos");
  }
  return { enviados, dispositivos: suscripciones.length };
}
