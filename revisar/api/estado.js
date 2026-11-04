/**
 * GET /api/estado — las publicaciones con su estado, para la app.
 * Requiere sesión. Un moderador recibe sólo las de su marca. Ver _datos.js.
 */
import { sesion, puedeVer, hoyAR } from "./_lib.js";
import { estado } from "./_datos.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const s = sesion(req);
  if (!s) return res.status(401).json({ ok: false, mensaje: "Sesión vencida" });
  try {
    const datos = await estado({ fresco: req.query.fresco === "1" });
    return res.json({
      ok: true,
      hoy: hoyAR(),
      alcance: s.alcance,
      generado: datos.generado,
      marcas: Object.fromEntries(Object.entries(datos.marcas).filter(([k]) => puedeVer(s, k))),
      posts: datos.posts.filter((p) => puedeVer(s, p.marca)),
    });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, mensaje: "No se pudo leer el estado" });
  }
}
