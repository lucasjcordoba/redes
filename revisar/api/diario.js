/**
 * GET /api/diario — el aviso de las 9:00 con lo del día de las dos marcas.
 *
 * Lo llama el cron de Vercel (vercel.json), que manda
 * `Authorization: Bearer <CRON_SECRET>`.
 */
import { MARCAS, hoyAR } from "./_lib.js";
import { estado } from "./_datos.js";
import { avisar } from "./_push.js";

const ETIQUETA = { pendiente: "para revisar", aprobada: "aprobada", publicada: "publicada" };

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }
  const hoy = hoyAR();
  const { posts } = await estado({ fresco: true });
  const deHoy = posts.filter((p) => p.fecha === hoy && p.estado !== "cancelada");
  const pendientes = deHoy.filter((p) => p.estado === "pendiente").length;

  const lineas = Object.entries(MARCAS).map(([k, m]) => {
    const suyos = deHoy.filter((p) => p.marca === k);
    if (!suyos.length) return `${m.nombre}: nada programado`;
    return suyos.map((p) => `${m.nombre}: ${p.titulo} (${ETIQUETA[p.estado]}, ${p.hora})`).join(" · ");
  });

  const r = await avisar({
    titulo: pendientes ? `Instagram hoy: ${pendientes} para revisar` : "Instagram hoy",
    cuerpo: lineas.join("\n"),
    url: "/",
    etiqueta: `diario-${hoy}`,
  });
  return res.json({ ok: true, ...r });
}
