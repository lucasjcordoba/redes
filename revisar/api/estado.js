/**
 * GET /api/estado — todas las publicaciones con su estado, para la app.
 * Requiere sesión. Ver _datos.js.
 */
import { sesionValida, hoyAR } from "./_lib.js";
import { estado } from "./_datos.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!sesionValida(req)) return res.status(401).json({ ok: false, mensaje: "Sesión vencida" });
  try {
    const datos = await estado({ fresco: req.query.fresco === "1" });
    return res.json({ ok: true, hoy: hoyAR(), ...datos });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, mensaje: "No se pudo leer el estado" });
  }
}
