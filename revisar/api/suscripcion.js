/**
 * Avisos push de este dispositivo.
 *   GET    /api/suscripcion  → { clavePublica } para suscribirse
 *   POST   /api/suscripcion  { endpoint, keys } → alta
 *   DELETE /api/suscripcion  { endpoint } → baja
 * Requiere sesión.
 */
import { sesionValida } from "./_lib.js";
import { agregar, quitar } from "./_push.js";

export default async function handler(req, res) {
  if (!sesionValida(req)) return res.status(401).json({ ok: false, mensaje: "Sesión vencida" });
  if (req.method === "GET") return res.json({ ok: true, clavePublica: process.env.VAPID_PUBLIC });

  const { endpoint, keys } = req.body ?? {};
  if (typeof endpoint !== "string" || !endpoint.startsWith("https://")) {
    return res.status(400).json({ ok: false, mensaje: "Suscripción inválida" });
  }
  try {
    if (req.method === "POST") {
      if (!keys?.p256dh || !keys?.auth) return res.status(400).json({ ok: false, mensaje: "Suscripción inválida" });
      await agregar({ endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } });
      return res.json({ ok: true, mensaje: "Avisos activados en este dispositivo." });
    }
    if (req.method === "DELETE") {
      await quitar(endpoint);
      return res.json({ ok: true, mensaje: "Avisos desactivados en este dispositivo." });
    }
    return res.status(405).json({ ok: false });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, mensaje: "No se pudo guardar. Probá de nuevo." });
  }
}
