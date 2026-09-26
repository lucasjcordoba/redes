/**
 * POST /api/avisar  { titulo, cuerpo, url?, etiqueta? }
 *
 * Para que avisen los procesos que no son la app: los workflows de GitHub
 * (post nuevo o versión nueva para revisar, publicación hecha). Se autentican
 * con el encabezado `x-avisar-clave`, que tiene que coincidir con AVISAR_CLAVE.
 */
import { timingSafeEqual } from "node:crypto";
import { avisar } from "./_push.js";

function autorizado(req) {
  const real = process.env.AVISAR_CLAVE;
  const dada = req.headers["x-avisar-clave"];
  if (!real || typeof dada !== "string") return false;
  const a = Buffer.from(real);
  const b = Buffer.from(dada);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!autorizado(req)) return res.status(401).json({ ok: false });

  const { titulo, cuerpo, url, etiqueta } = req.body ?? {};
  if (!titulo || !cuerpo) return res.status(400).json({ ok: false, mensaje: "Faltan titulo y cuerpo" });
  // Sólo links propios: un aviso no puede mandar a otro sitio.
  const destino = typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? url : "/";

  try {
    const r = await avisar({ titulo: String(titulo).slice(0, 80), cuerpo: String(cuerpo).slice(0, 300), url: destino, etiqueta });
    return res.json({ ok: true, ...r });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false });
  }
}
